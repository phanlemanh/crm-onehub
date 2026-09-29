# API Rules

## Logging

`apps/api/src/logging`. `new Logger(Thing.name)` picks up `ContextLogger`. **Never
`console.log`.** Format follows `NODE_ENV` and is not configurable.

- **One object, not extra arguments** — `logger.log({ message: "Saved", userId })`;
  Nest prints a line per argument.
- **Errors pass the stack second** — `logger.error({ message }, err.stack)`. Passing
  the error object drops the trace.
- **Never log headers, query strings, or bodies** — cookies and personal data.
- **`LoggingModule` stays first in `AppModule`'s imports**, and Better Auth routes log
  via its own `middleware` option — it mounts before `MiddlewareConsumer`, so
  `/api/auth/*` never reaches ours.
- `requestId` from `RequestLoggerMiddleware` via `AsyncLocalStorage`;
  `UserContextInterceptor` adds `userId`. Prisma statements are opt-in
  (`PRISMA_LOG_QUERIES`).

## Intelligence never lives in the API

The API serves HTTP, auth, tRPC and the mailbox sync. It does **not** research, enrich,
score, summarise, match identities or decide anything about a person or company — not
as a fallback, not behind a flag. That is the eve agent in `apps/agent`, which owns
the vendor clients, the confidence model and the writes.

Nest's half is to report *that something happened*: `AgentTriggerService` writes an
`AgentTask` row. A row, not an HTTP call — the agent already leases from that table,
so the row survives the agent being down.

About to add a vendor client to `apps/api`? You want `apps/agent/agent/lib`. Two
documented exceptions, both for timing: the exchange-rate fetcher, below, and the
transactional auth mail — `packages/auth` posts the password-reset link and the
password-changed notice to Resend itself (`thu.ts`), in the background through
`advanced.backgroundTasks`. The reset token must not sit in plain text in an
`AgentTask` row, and a stopped agent must not leave someone waiting for a link. It
decides nothing about a person; it only delivers what Better Auth made.

## One organization, and it is not a tenancy boundary

Single tenant. No org header, no org interceptor, no org-scoped cache keys, **no
`organizationId` on any CRM record.**

A **singleton workspace** exists — Better Auth's `organization` plugin, one row with
id `WORKSPACE_ID` (the literal `workspace`, in `@crm/db`, re-exported by `@crm/auth`
so the agent needn't depend on it). It answers only: what are we called, who works
here, what do we sell.

- **The id is a constant, never a parameter.** A function taking an `organizationId`
  has turned the plugin into tenancy plumbing.
- **An allow list decides who joins, and it lives in the `invitation` table.** A row
  means *this address may sign in, with this role, allowed by this person*. Three
  statuses: `pending` (allowed, no account yet) · `accepted` (signed in) · `cancelled`
  (withdrawn — the row stays, so who allowed whom is still readable).
  `expiresAt` is not nullable and there is no expiry yet, so it takes
  `ALLOWANCE_WITHOUT_EXPIRY`.
- **`ensureWorkspaceMembership` runs in `databaseHooks.session.create.before` and
  degrades, never throws** — a throw fails the session create and locks everyone out.
  It **keeps** an existing member untouched, and creates one only when the address is
  still allowed, with the role the allowance names. That is what makes the remove
  button tell the truth: without it, anyone removed walks straight back in at the next
  sign-in. It takes the read path as a parameter so a test can inject a throwing one —
  `db` is a proxy, so `spyOn` cannot reach it.
- **Removing a member is one transaction**: the member row goes, their sessions go,
  their API keys are **disabled** (not deleted — the rows say who held what), and
  the allowance moves to `cancelled`, together. Allowing them again restores the
  membership, not the keys.
- **A non-member cannot create, update or re-enable a key** through Better Auth's
  own `/api-key/*` endpoints either. `canhKhoaApiPlugin` sits right after `apiKey()`
  in `plugins`, so its check runs once the key plugin has turned an `x-api-key`
  header into a session: it asks about the identity the endpoint will act as — the
  key's owner when a key is sent, the cookie's otherwise. Moving it before `apiKey()`,
  or back into `hooks.before`, lets a key alone through. A server-side call with no
  session is untouched. Keys a non-member still held when this shipped were disabled
  once by the `tat_khoa_nguoi_ngoai_kho` migration.
- **First account is owner**, and the hook enrols pre-existing users, oldest first.
  That migration branch still names the first user owner regardless of the role an
  allowance gave them — a narrow case the contract does not cover yet.
- **Permissions come from `@crm/auth`** — `canRenameWorkspace`, `canChangeRole`,
  `canConfigureSso`, `canManageCurrency`, `canManageSettings` — enforced by the service *and* used to
  disable the UI control, so the button and the 403 cannot disagree.
  `WorkspaceService` adds one invariant: **the last owner cannot be demoted**, with
  `FOR UPDATE` on the owner rows before counting.
- **Reads and writes go through tRPC**, not `authClient.organization.*`.
- **Name and website are required at onboarding and cannot be skipped**, in the form
  *and* in `updateWorkspaceInput`, posting the same `workspace.update` as settings.
- **Onboarded state is `onboardedAt` inside the plugin's `metadata` blob**, not a
  column; `isOnboarded`/`markOnboarded` (`@crm/db/workspace`) are the only accessors,
  and `markOnboarded` preserves every other key.
- **The name starts as `DEFAULT_WORKSPACE_NAME` (`CRM`), a placeholder not an
  answer.** The header renders `<name> CRM`, so `workspaceLabel` tests the name rather
  than comparing to the default.
- **The website queues the agent's `workspace-profile` task** and goes through
  `normalizeDomain`, rejecting null. Stored canonical, so re-saving uncanonically
  counts as a change and re-queues research.

### Rate limits count people, not the app's own proxy

The browser reaches `/api/auth/*` through the app's `/api` proxy
(`apps/app/app/api/[...path]/route.ts`), which drops `x-forwarded-for`. Left alone,
every person lands in one Better Auth rate-limit bucket, so three forgotten
passwords from anyone lock the door for everyone.

- **The proxy signs the address the platform gave it.** `headerGuiApi`
  (`apps/app/lib/api-proxy-headers.ts`) reads `x-real-ip`, which Vercel overwrites,
  and sends it with an HMAC made with `BETTER_AUTH_SECRET` (`@crm/auth/dia-chi`). It
  never forwards what the browser put in `x-forwarded-for`.
- **The API trusts only a signed address.** `xuLyXacThuc` (`@crm/auth`) wraps
  `auth.handler`: it drops every address header a caller sent and sets the trusted
  one only when the signature checks out; `advanced.ipAddress.ipAddressHeaders`
  reads that header and nothing else. `app.module.ts` mounts the wrapper, not the
  bare `auth`.
- **Missing pieces fall back, never throw.** No secret or no `x-real-ip` means no
  signed address, and counting behaves as it did before.
- **It edits headers on the original request and never touches the body.**
  Rebuilding the `Request` around the Node adapter's stream hangs every POST, and
  reading the body first moves the read outside Better Auth's error handling, so a
  caller that drops the connection mid-body crashes the API process. Both were
  measured; `test/xu-ly-xac-thuc.spec.ts` keeps the second one from coming back.

### Gates in `proxy.ts`

Onboarding, then `/onboarding/research` for the Context key. Asked server-side every
request.

- **`getSessionCookie()` decides signed-in**; pages still resolve the real session via
  `requireMailboxAccess()`.
- **Nothing is cached in a cookie** — both facts revert on a database reset while a
  year-long marker insists the gate passed. Cache in the API if cost ever matters.
- **Both reads run concurrently**, but order decides which is *asked* — the research
  read is never made while onboarding is open.
- **An unreachable API fails open** (`unknown` lets the request through).
- **`/sign-in`, `/grant-access`, `/eve` are ungated.** `/sign-in` is the only path a
  stranger may read; `/` joins it only when `IS_MARKETING` is set.
- **There is no way past the key gate but to answer** — Skip stranded installs, every
  later company sitting `PENDING` with nothing saying so.

### The name is also the URL

Served under the workspace slug (`/comp-ai/companies`). **Cosmetic, not tenancy** —
every query still resolves through `WORKSPACE_ID`.

- **The slug is the plugin's column**, written by `workspaceSlug(name)`
  (`@crm/db/workspace`) on rename and create. **Never derive it on read.**
- `ensureWorkspaceMembership` reconciles it; `RESERVED_SLUGS` prevents collision with
  a real route (a collision gets `-crm`).
- **The proxy is the only thing that puts the slug on.** Missing or stale slugs are
  redirected with the query string intact, not 404'd; `[slug]/layout.tsx` is the
  backstop.
- `appPath` in `proxy.ts` is the one place `/` resolves for a signed-in rep, which
  keeps every `callbackURL` correct without knowing about slugs.
- **Renaming moves the URL**, so `workspace-form.tsx` replaces the location onto the
  slug `workspace.update` returns.

## API keys run on a patched library

`@better-auth/api-key` 1.6.25 writes two `UPDATE apikey` statements on every
request that sends `x-api-key`, even with `rateLimit: { enabled: false }`
(better-auth#10921). This repo patches it with `bun patch`: the patch lives in
`patches/`, `package.json` lists it under `patchedDependencies`, and it adds one
plugin option, `lastRequestUpdateIntervalMs`. Without the option the library
behaves exactly as released.

- **`lastRequest` is written at most once per `API_KEY_USAGE.lastRequestIntervalMs`**
  (one minute, `packages/auth/src/api-keys.ts`), so Settings → API keys shows the
  last use to within a minute. `updatedAt` no longer moves on use; nothing reads it.
- **Upgrading `@better-auth/api-key` means redoing the patch.** The version is part
  of the patch key; `packages/auth/test/khoa-api-ghi-thua.spec.ts` fails with a named
  message when the installed version and the patch disagree. Run
  `bun patch @better-auth/api-key@<new>`, reapply the three edits in
  `dist/index.mjs` and the option type, then `bun patch --commit`.
- **Remove the patch when better-auth#10921 is fixed upstream** with a release that
  stops writing on every verification while rate limiting is off: upgrade, drop the
  `patchedDependencies` entry and the patch file, and drop the option from
  `auth.ts`.

The acceptance record is `_acceptance/khoa-api-ghi-thua/`.

## SSO is a row, not a deployment

An `ssoProvider` row via Better Auth's `sso` plugin, on Settings → SSO, because a
self-hoster's admin cannot redeploy.

- **OpenID Connect only** — issuer, client id, secret; endpoints from discovery. No
  SAML UI: it needs an X.509 cert and SP signing key we have nowhere to keep.
- `SsoService` passes `WORKSPACE_ID`, never an input.
- **Management is tRPC (`sso.*`); signing in is `authClient.signIn.sso()`.**
- **`sso.signInOptions` is the one public procedure in the app.** Every other `sso.*`
  takes `AuthMiddleware` at the *method*, which is what leaves it open. A client
  secret is never read back out.
- **It is the API's answer, not the app's** — the API serves `/api/auth/*`.
- **An install with no Google, no Microsoft and no provider says so**, naming the
  variables; a read that *fails* falls back to offering Google.
- **A provider hides the social buttons, it does not disable them** —
  `/sign-in?method=google` and `?method=microsoft` still work, so a mistyped issuer
  cannot lock an admin out.
- **Signing in with an IdP does not cost you Gmail.** `needsMailboxGrant` (`@crm/auth`)
  walls only an account whose sign-in rows are *all* mailbox providers — Google,
  Microsoft, or both — and none of them granted. `mailboxGrantsNeeded` returns which,
  so `/grant-access` offers the button they can actually use.
- `databaseHooks.user.create.before` decides who gets an account, for SSO sign-ups
  too. It reads the allow list; `ALLOWED_SIGN_IN` is only the seed, and it has a say
  only when the table is empty **and** nobody has ever signed in.
- `organizationProvisioning: { disabled: true }` — `ensureWorkspaceMembership` already
  does the join.

## tRPC is the data surface; REST is auth and health only

- **One router per module**, `*.router.ts` (the codegen glob), with
  `@Router({ alias })` and `@UseMiddlewares(AuthMiddleware)`. **No `AuthMiddleware`
  means public — there is no other guard.**
- **`AuthMiddleware` means signed in AND a member of the workspace AND allowed to
  read the router's data scope.** It reads the `member` row on every call, never a
  cache, so a removed person loses every procedure at once and a role change takes
  effect on the next call. The refusal for a non-member is `FORBIDDEN` with
  `NOT_A_MEMBER`; the refusal for a role outside the scope is `FORBIDDEN` with
  `KHONG_TRONG_PHAM_VI` (both from `@crm/auth`; the second lives in
  `@crm/validation/vai-workspace` so the app and the agent read the same rule). Both
  run before `.input()` and before any role check in a service.
- **Every router declares its data scope by choosing its middleware class.**
  `PhamViDoiTacMiddleware` (partner data: contacts, companies, deals, campaigns,
  activities, onboarding, search, dashboard, enrichment, savedViews, fields, google,
  microsoft, tracking, slack, agents, conversations) · `PhamViToChucMiddleware`
  (`org`) · `PhamViChungMiddleware` (users, settings, currency, zalo, apiKeys, sso,
  workspace) · `PhamViOkrMiddleware` (reserved for the OKR routers). They extend
  `AuthMiddleware` and only set `phamVi`. **A bare `AuthMiddleware` is an
  undeclared scope**: `owner`/`admin`/`member` still pass, the `okr` role is
  refused. Forgetting to declare closes the door, it never opens it.
  `docDuocPhamVi(role, phamVi)` is the one rule; `apps/api/test/vai-chi-okr.spec.ts`
  pins the exact set of procedures the `okr` role may reach, so adding a router to
  the shared scope is a conscious edit of that list.
- **The `okr` role is the fourth workspace role** (`WORKSPACE_ROLES`): signs in,
  reads the shared and organization scopes, never partner data — through tRPC, the
  REST bridge, an API key or the agent bridge alike. `toWorkspaceRole` keeps it;
  everything unknown still falls back to `member`. `LoggingMiddleware` prints
  `role` and `phamVi` on every `tRPC` line, which is how "reads of partner data by
  an OKR-only user" is counted after release.
- **Writes in the shared scope are either self-service or admin-only.** API keys
  and the person's own Zalo channel are self-service; every system setting —
  `settings.*` writes included, gated by `canManageSettings` — requires an owner
  or an admin. The `ghi-chung` case of the spec above pins the self-service set.
- **`SignedInMiddleware` is the one named exception**: signed in, membership not
  asked. Only `workspace.get` uses it, because `proxy.ts` asks it whether the viewer
  is still in the workspace and treats an error as *unknown* — which lets the
  request through. A second procedure on it is a decision, not a convenience.
- **Routers are thin**: zod in, service call out; Prisma lives in `*.service.ts`.
- Services throw Nest's `HttpException` family; `DomainErrorMiddleware` maps them.
- **Filter, sort and paginate in Prisma.** List procedures take `listInput` and return
  `{ rows, total, facetCounts }`. Never filter a whole table in the browser; never
  interpolate `sort` into a field name — use `resolveOrderBy`.
- **`src/generated/server.ts` is generated *and committed*, and `build` must never
  regenerate it** — the generator needs GLIBC 2.39, newer than Vercel's build image.
  Only `dev` (its `dev:trpc` watcher) and `cd apps/api && bun run trpc:generate` run
  it — `check-types` is plain `tsc --noEmit` and does not. If the app cannot see a new
  procedure, it has not run.

### Internal ingest endpoints are the one documented exception

Two REST controllers accept data, and both are deliberate:

| Endpoint | Sends | Secret |
|---|---|---|
| `POST /internal/listings/ingest` | the nhatot scraper | `LISTING_INGEST_SECRET` |
| `POST /internal/onboarding/ingest` | the OneHub platform | `ONEHUB_PLATFORM_INGEST_SECRET` |

They are REST rather than tRPC because the sender is a **machine outside this
repo** that has no tRPC client and no session — the heading above is about the
app's own data surface, not about machine-to-machine intake. Four rules keep
them from becoming a second, undisciplined API:

- `@AllowAnonymous()` plus a `Bearer <secret>` header. `AuthMiddleware` proves a
  session exists and there is no session here.
- **The secret is optional and its absence never throws.** Unset → `503` and
  every other route keeps working. A self-hoster who has not wired the platform
  loses one capability, not the module.
- **Parse at the boundary, reject the whole batch.** The body goes through a Zod
  schema in `packages/validation`; one bad item fails the batch. Half a batch
  landing is a state nobody can reason about afterwards.
- **No identity guessing.** The onboarding endpoint matches a `Cá nhân` only by
  an exact platform id held in a designated custom field. No match writes an
  `AgentTask` row and lets the agent decide — the same rule as
  "Intelligence never lives in the API" above.

Adding a third one is a decision, not a pattern to copy freely: it needs its own
secret, its own schema, and a row in the table above.

## The OpenAPI document is built at runtime, not committed

`GET /openapi.json` serves one document: Nest's own controllers plus a REST bridge
under `/rest` generated from every tRPC procedure. Swagger UI renders it at `/`.
`createApp` builds both halves and merges them, so nothing is generated at build
time and no file is checked in — the document is whatever the routers are.

`SwaggerModule.setup` runs **before** `app.init()`, because it registers its Express
routes synchronously and Nest's own routing would otherwise shadow them. The factory
form defers building the document to the first request, which is what lets it read
the tRPC router that only exists after init.

Two rules follow for the serverless build:

- `@nestjs/swagger` stays in `EXTERNALS` in `apps/api/scripts/build-func.mjs`, because
  `swagger-ui-dist` resolves its assets from disk at runtime and cannot be bundled.
- Anything external must be **vendored**, and vendoring follows non-optional
  `peerDependencies`, not only `dependencies`. Nest packages declare their runtime
  needs as peers, so following `dependencies` alone ships a function that throws
  `MODULE_NOT_FOUND` on the first request. Adding a name to `EXTERNALS` without
  checking it lands in `.vercel/output` breaks production, and the build stays green.

## Two mail providers, one pipeline

`apps/api/src/mailbox` is everything neither Google nor Microsoft owns:
`MailboxApiClient` (bearer GET, and the one place a status code becomes an outcome),
`SyncStateService` (the `MailboxSync` row), `MailboxTokenService`,
`MailboxMatchService`, `participants.ts`, `message-text.ts`, and
`ThreadWriterService`.

- **`ThreadWriterService.store` is the only writer of `EmailThread`, `EmailMessage`
  and the `EMAIL` activity.** Gmail and Outlook each parse their own wire format down
  to one `IncomingMessage` and hand it over; matching, threading, counting and
  stamping happen once. A second copy of that is how a rule like *reply before you
  create a company* comes to be true in one inbox and not the other.
- **A thread is keyed by RFC message id, not by the provider's thread id.** Root comes
  from `References` → `In-Reply-To` → own `Message-ID`, so a rep on Gmail and a rep on
  Outlook land on the same `EmailThread` for the same conversation. Graph only returns
  `internetMessageHeaders` when `$select`ed and not for every message, so Outlook falls
  back to `outlook-conversation:<conversationId>` — threading that still holds inside
  Outlook, just not across to Gmail.
- **`MailboxSync.source` is the discriminator** — `calendar`, `gmail`, `outlook`. Each
  provider's module only ever sees its own, and `sync/mailbox-sync.service.ts` is the
  one place that dispatches. One cron, one budget:
  `POST /internal/sync/mailboxes` (`/google` is kept as an alias so an existing
  deployment's cron keeps working).
- **Gmail is forward-only from a `historyId`, Outlook from a timestamp.** Graph has no
  mailbox-wide delta, so the Outlook cursor is the last `receivedDateTime` seen,
  re-read with a one-second overlap; `rfcMessageId` is unique, so the overlap costs a
  duplicate fetch and never a duplicate row.
- **Microsoft has no token-revocation endpoint.** `revoke` clears the columns and the
  UI says the consent itself is removed in the user's Microsoft account. Google's still
  posts to `oauth2.googleapis.com/revoke` and refuses to clear if that fails.

## Not every address on a thread is a person

`externalParticipants` (`mailbox/participants.ts`) is the one gate, discarding **us**
(allow-list domains, `User` table), **rep decisions** (`SuppressedContact`,
`SuppressedDomain`), and **addresses no human reads**.

- **`isMachineDomain` (`companies/domain.ts`) sits beside `FREE_EMAIL_DOMAINS`**;
  `domainFromEmail` returns null for both, and `companyForEmail` is the only path from
  address to company — so a caller ignorant of the rule still cannot create one.
  `.calendar.google.com` covers shared calendars, rooms and ICS feeds.
- **Matches the host, never a substring** — `calendar.acme.com` is a real company.
- **`isMachineAddress` also catches opaque local parts** (24 hex chars, UUIDs),
  deliberately narrow: a false positive is a real customer never filed.
- **It leaves no row** — a rep may still type these into quick-add; only the *inbox*
  is barred from deciding. `syncAttendees` filters the same addresses beside
  `attendee.resource`.
- **`isAutomatedAddress` is a separate list about the local part** (`sales@`,
  `noreply@`), which is why `support@acme.com` never becomes a lead.

## People on a deal

`DealContact` is the join, and `deals.attachContact` / `detachContact` /
`setContactRole` are the only ways to write it. `deals.contactOptions` is what the
picker reads.

- **A contact on a deal works at that deal's company**, enforced in the service and
  not merely by the picker — the same rule as `companies.setPrimaryContact`.
- **Attaching is an upsert and re-attaching keeps the role already there**, so a
  double click cannot blank what somebody typed.
- **Detaching removes the row, never the contact.** They stay in the CRM, on the
  company, with their history.
- **`role` is blanked to null, never stored as `""`** — `blankToNull`, as everywhere
  else.

## Deleting a record is archive first, purge later

`contacts.archive`, `companies.archive`, `deals.archive` set `archivedAt`. Nothing
else changes — no suppression, no cascade cleanup, no stamp recompute — because the
row is still there, just filtered out of every list.

- **`archivedFilter(input.archived)` is in every `buildWhere` and every `facetCounts`
  where.** A list call defaults to `archived: false`; the Archived view is the same
  procedure with `archived: true`. There is no third "everything" mode — mixing
  active and archived rows in one table is exactly what this feature removes.
- **`archive`/`restore` are a bare `update({ archivedAt })`, nothing more.** They do
  not touch `AgentTask`, `SuppressedContact`, or `lastActivityAt` — the record is
  unchanged, only hidden.
- **`purge` is the old `delete`.** Same transaction, same suppression, same
  `AgentTask`/`AgentEvent` cleanup, same `ActivityStampService.recomputeAfterDelete`.
  Read the rest of this section as `purge`'s contract, not `archive`'s.
- **A rep can `purge` straight from the Archived view — retention is a ceiling, not a
  wait.** `bulkPurge`/the per-record "Delete forever" action call it directly, no
  different from the cron.

**Pruning**: `ArchiveRetentionController` (`internal/archive/prune`, `CRON_SECRET`-gated,
`apps/api/vercel.json`) reads `AppSetting.archiveRetentionDays`
(`readArchiveRetentionDays`, `@crm/db/settings`, default 180) and calls each service's
`purgeExpired(before)` — `findMany({ archivedAt: { lte: before } })` capped at
`ARCHIVE.prune.maxBatch` (`archive/archive-config.ts`), then `purge` per row through
the ordinary `runBulk`. Settings → General has the day count
(`settings.archiveRetention` / `setArchiveRetention`).

Below is `purge`'s contract — everything that used to be `delete`'s:

- **A purged contact is suppressed by address**, or the sync recreates them from the
  next thread. `ContactsService.purge` writes `SuppressedContact`, and
  `externalParticipants` drops it like a `SuppressedDomain` — one filter covering
  contact creation, company auto-creation and attribution.
- **Keyed lower case.** `normalizeEmail` (`crm/values.ts`) is the one canonicaliser,
  on `contacts.create`, `.update` and the suppression; conflict checks and `allowAgain`
  match case-insensitively.
- **The address comes from the delete itself**
  (`tx.contact.delete({ select: { email: true } })`), not a read before it — and the
  404 is that statement's own `P2025` through `translate`.
- **Adding them back lifts the suppression** via `allowAgain` **inside the write's
  transaction**. Never automatic.
- **Purging a company does not suppress its domain** — its people survive with no
  company, and domain suppression stays the explicit Settings → Connections control.
- **Clear `AgentTask` and `AgentEvent` yourself** — they carry `contactId`/`companyId`
  with no foreign key, so nothing cascades.
- **Recompute `lastActivityAt` on exactly the records the purge reached.**
  `ActivityStampService.targetsOf(where)` collects them *inside* the transaction (the
  evidence is what gets deleted); `recomputeMany` restamps. A company's `where` must
  follow its deals: `{ OR: [{ companyId }, { deal: { companyId } }] }`.
  `recomputeAll()` is for a purge only.
- **Recompute after commit, logging rather than throwing** — the row is already gone,
  and a raised error makes the browser skip invalidation and retry into a 404.

## The organization tree

`apps/api/src/to-chuc` owns the `org.*` router: two fixed levels under the
workspace, `Division` above `Department`. There is one tree for the whole CRM —
onboarding, OKR, reports and filters read it; no area keeps its own.

- **`Department` is the onboarding table, not a copy.** The tree added a nullable
  `divisionId` and `headUserId` to it. A department with no division is listed as
  unassigned, not hidden. The `migration` is additive only, so rows that existed
  before the tree keep working untouched.
- **Every mutation calls `yeuCauQuanTri` first.** `canManageOrganization`
  (`@crm/auth`) is the one rule; the `quyen` spec parses `generated/server.ts` and
  fails when a new `org.*` mutation is not covered. `org.tree` and `org.access` are
  readable by any member.
- **A person has one `OrgPlacement` row**: a primary department, optional secondary
  departments, and an optional manager override. The direct manager is derived, not
  stored — override, then the primary department's head, then the division's head,
  never oneself and never someone who has left (`quan-ly.ts`).
- **A department head must be an active member of that department.** Someone who
  moves out stops counting as its head without a write; the department reads as
  headless until an admin picks again.
- **`org.*` is the only way to write a department.** Create, rename, move, archive,
  restore and purge all live here; `onboarding` keeps `listDepartments` for reading
  and has no department writes. A department write anywhere else — a new procedure,
  a REST route, a Prisma call outside `apps/api/src/to-chuc` — is a second rulebook
  waiting to drift.
- **Archive, then purge, same as records.** A department is refused archive while a
  live template holds it or active members hold it as primary, and refused purge
  while it is live, a plan step or any placement points at it, or any template —
  archived or not — still holds it. A division is refused archive while it holds live
  departments, and refused purge while any department, archived or not, still points
  at it.
- **A unit that still holds open OKR cannot be archived; a unit with any OKR history
  cannot be purged.** `archiveDepartment` and `archiveDivision` lock the unit row and
  refuse while an objective that is not dropped sits in a cycle still in
  `lap-ke-hoach`, `dang-chay` or `cham-diem` (`PHA_CHUYEN_DUOC`); the message names the
  count and the way out — «chuyển OKR hoặc bỏ mục tiêu». Purge is refused while any
  objective, open or closed, points at the unit: `lyDoKhongXoaPhongBan` and the
  division purge rule both take the OKR history count, so `org.tree` never offers
  «Xoá hẳn» there and the server answers 400 with a sentence instead of a 500 from the
  foreign key. `org.tree` carries `okrMo` on every division and department, so the
  archive dialog says «OKR: N mục tiêu ở kỳ đang mở» before the admin presses anything.
  Moving the objectives out is `okr.chuyenDonVi` (see «OKR»).
- **`to-chuc` asks about OKR through `@crm/db/okr-don-vi`, never `../okr`.**
  `demOkrCuaDonVi` (one unit, for archive and purge) and `demOkrTheoDonVi` (two fixed
  `groupBy`, for the tree) are the only OKR reads in `apps/api/src/to-chuc`; the
  `soi-ma.mjs --ca xem` scan fails on an import from `../okr`. A department moved to
  another division takes its OKR along: alignments stay and edit rights follow the new
  division head.
- **Purgeability is one function.** `lyDoKhongXoaPhongBan` (`xoa-phong-ban.ts`)
  returns the refusal or nothing; `org.tree`, `org.purgeDepartment`,
  `org.archiveDepartment` and `onboarding.listDepartments` all call it, so no screen
  can offer «Xoá hẳn» on a department the server will refuse.
- **Import is preview, then apply.** `previewImport` parses tab or CSV text
  (`nhap.ts`) against a snapshot and returns every row with its error; `applyImport`
  re-checks, writes the valid rows in one transaction and skips the broken ones.
  Row and character caps live in `TO_CHUC` (`to-chuc-config.ts`), with every
  user-facing message. The preview also returns `newNames` — the exact departments
  and divisions the apply will create — outside `summary`, so the screen can name
  them.
- **Two bulk writes, all or nothing.** `attachDepartments` puts 1–50 live
  departments into one division, appended in the order sent, leaving those already
  there in place. `addPeople` makes one department the primary of 1–50 active
  members, drops it from their secondaries, and keeps their manager override. Any
  bad id in the batch refuses the whole batch in one transaction; the cap is
  `TO_CHUC.lo.toiDa`.
- **Reordering divisions sends the whole list.** `reorderDivisions` is refused when
  the ids are not exactly the live divisions, so a stale screen cannot leave two
  divisions on the same position.

## OKR

`apps/api/src/okr` owns the `okr.*` router: cycles, the program config,
objectives, key results, alignments, the trail and spreadsheet import. It reads the
organization tree through `ToChucService`; it never keeps its own copy of units.

- **`okr` is its own data scope, open to all four roles.** The router carries
  `PhamViOkrMiddleware`, so the «chỉ OKR» role passes the same way `admin`, `owner`
  and `member` do. Adding the alias to `ALIAS_CHO_PHEP` in
  `apps/api/test/vai-chi-okr.spec.ts` was the deliberate list change; a new router
  does not get it by default.
- **Permission is per record, from the unit's head.** `OkrAccessService` decides:
  a department head edits that department's objectives, a division head edits the
  division and every department in it, a person edits their own personal
  objectives, and a KR's owner edits that KR. Admins are not heads by role — they
  manage cycles, the program config and OneHub-level objectives, and may import
  into any unit. The screen asks `canEdit` / `canEditKr` from the API; it never
  re-derives them — the sheet shows a KR's «Cập nhật» item from `canEditKr` too.
  «KR owner, or can edit the objective's unit» is one function,
  `OkrAccessService.ghiDuocKr`, used by `assertSuaKr`, by `guiCapNhat` and by
  `canEditKr`, so the three cannot drift.
- **Who sees an objective is one rule in two shapes.** `okrObjective.hienThi` is
  `cong-khai` (everyone in the OKR program) or `gioi-han`. A restricted objective is
  seen by admins (owner, admin), its owner, the person of a personal objective, a KR
  owner, a việc's người làm under one of its KRs, a participant, a named viewer
  (`okrNguoiXem`, up to `OKR_HIEN_THI.nguoiXemToiDa`) and whoever edits its unit per
  `suaDuocDonVi`. `xemDuocMucTieu` (`@crm/validation/okr-hien-thi`, pure) answers for
  one row; **`dieuKienXemMucTieu` (`@crm/db/okr-hien-thi`) returns the same rule as a
  `Prisma.OkrObjectiveWhereInput`, and every read of `okrObjective` or of the seven
  child tables (`okrKeyResult`, `okrViecKr`, `okrGhiNhan`, `okrComment`,
  `okrCheckIn`, `okrTrail`, `okrSoChup`) puts it in its `where`** — directly or nested
  through `objective`. The API builds the context from `OkrAccessService.quyen` (the
  same tree that decides edit rights, no extra query); the morning reminder and the
  agent build it with `nguCanhXemOkr`, and a test compares the two head sets on the
  sample OKR set. `_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem` fails on
  a read without the condition unless `MIEN_XEM` names it with a reason.
  - Lists (`byUnit`, `mine`, `danhSach`, `bangCham`, `xuatKy`, `khoiCuaToi`) leave
    the objective out, and counts and pages do not include it.
  - Reads by id (`objective`, `dienBien`, `canhKr`, `comments`, `lichSuSo`,
    `banGhiChiSo`) and writes based on an objective (`follow`, `addComment`,
    `guiGhiNhan`, `mangSang`, `ghiSoKr`, and every edit through
    `assertSuaMucTieu`) answer `NotFoundException(OKR.thongDiep.khongThayMucTieu)` —
    the same sentence as an id that does not exist, so a 403 never confirms that a
    restricted objective is there. Mentions and recognition recipients must be able to
    see it.
  - Aggregates (`toanCanh`, `hopTuan`, `sucKhoe`, `countByUnit`) drop restricted
    objectives **for everyone**, admins and heads included, through `boGioiHan` —
    never filtered per caller, so two people never see two different company numbers.
  - A restricted objective has no alignment: it is left out of `alignmentTree`,
    `cayCanChinh` and `alignmentTargets`, and `addAlignment` refuses it as source or
    target. Trail rows and diễn biến of another objective that point at it show
    `{ gioiHan: true }` instead of an id or a title (`vetChoNguoiXem` in `hien-thi.ts`).
  - `datHienThi({ objectiveId, hienThi, nguoiXem })` is for whoever edits the
    objective, phase-locked, refused while it waits for approval, takes only members,
    and refuses `gioi-han` while the objective still has alignments in either direction
    (`OKR.thongDiep.hienThi.conCanChinh(n)`). It writes one `doi-hien-thi` trail row
    (level and viewer list, before → after). The create dialog carries the level, so a
    sensitive draft is never public for a minute. `mangSang` copies the level and the
    viewers still in the workspace; `taoTuMau` and `applyImport` create public
    objectives.
- **Publishing can require one approval step.** `okrProgramConfig.duyetCongBo`
  («Công bố cần duyệt», admin-only through `setProgram`, versioned like every field;
  the `cau-hinh` trail row carries it before and after) turns it on. The approver is
  derived at read time, never stored — `nguoiDuyetMucTieu` (`@crm/db/okr-duyet`, the
  same function the reminders use): a department objective goes to its division head,
  a division objective to the admins, a personal objective to the head of the
  person's primary department, or to the division head when the person is that head;
  nobody derivable means the admins. OneHub-level objectives skip approval. The
  approver always sees the objective. `OkrService.congBoHayGuiDuyet` is the one
  decision:
  - `guiDuyet` (whoever edits it, a draft with at least one KR) moves `nhap` →
    `cho-duyet` and writes `gui-duyet`. `duyetMucTieu` (the approver) publishes in the
    same transaction — `publishedAt`, start values locked — and writes `duyet`.
    `traLaiMucTieu` (the approver, reason `OKR_HIEN_THI.lyDoTraLai` characters) goes
    back to `nhap` with the reason in the `tra-lai` row's `note`. `rutDuyet` is the
    sender's and writes `rut-duyet`. All four are phase-locked.
  - `publishObjective` by someone who cannot approve while the switch is on is 400
    `OKR.thongDiep.duyet.canDuyet`; an approver publishes straight away and the
    `cong-bo` row carries `tuDuyet`, and an approver pressing publish on a pending
    objective writes `duyet`. `applyImport` with «publish now» writes `cho-duyet` for
    objectives the importer cannot approve. With the switch off, pending objectives
    stay pending and whoever edits them may publish them directly — that `cong-bo`
    row carries `tuChoDuyet: true`.
  - While pending, the objective's content and KRs (including sources, việc, sáng
    kiến and evidence), alignments, level and participants are locked
    (`OKR.thongDiep.dangChoDuyet`). Aggregates still count only `cong-bo`; the
    objective cap counts pending ones.
  - `_acceptance/gioi-han-duyet-cay-okr/rang/ty-le-gioi-han-duyet.sql` (read-only,
    `SET okr.chu_ky` first) pairs each `gui-duyet` with the next `duyet`, `tra-lai`,
    `rut-duyet` or `cong-bo` from pending on the same objective: only `duyet` and
    `tra-lai` count as handled, open pairs stay out of the median, and
    `tatTrongHaiTuan` reads the `cau-hinh` rows where `duyetCongBo` flipped.
- **Restructuring moves OKR; it never strands it.** `okr.chuyenDonVi` (admin) moves
  1–`OKR_HIEN_THI.chuyenToiDa` objectives of one level (department → department,
  division → division) to a live unit, in cycles still in `PHA_CHUYEN_DUOC`: it locks
  the objective and cycle rows `FOR UPDATE` and re-checks inside the transaction,
  changes only `departmentId` or `divisionId`, keeps KRs, check-ins, alignments,
  viewers and trail, and writes one `chuyen-don-vi` row per objective. One bad id — a
  dropped objective, another level, a closed cycle — refuses the whole batch, naming
  the objective. Going over the receiving unit's objective cap still moves and
  returns a warning. Merging is «move everything, then archive»; splitting is «move
  some».
- **`okr.moCoi` lists what nobody can answer for.** Admin-only; an objective not
  dropped in an open cycle whose unit is archived (`don-vi-luu-tru`, data from before
  the archive rule), that nobody can edit (`khong-ai-sua`: a department with no head
  and no division head, a division with no head, a personal objective whose person
  left), whose owner left (`phu-trach-roi`) or one of whose KR owners left
  (`kr-phu-trach-roi`). The Sức khoẻ page shows it as «OKR mồ côi».
  `_acceptance/gioi-han-duyet-cay-okr/rang/okr-mo-coi.sql` lists the same
  `objectiveId`, `lop` pairs for the weekly read.
- **Eleven writes are locked by cycle phase.** Every objective, key-result and
  alignment write, plus `previewImport` and `applyImport`, calls
  `assertKyGhiDuoc` first: only `lap-ke-hoach` and `dang-chay` accept writes. Phase
  moves exactly one step forward (`setCyclePhase` locks the cycle row `FOR UPDATE`,
  refuses a jump with `OKR.thongDiep.khep.phaTungBuoc` and a step back with
  `phaChiDiToi`); the one way back is `moLaiKy` — see «Closing a cycle» below.
- **Every write leaves one `OkrTrail` row, never an `Activity`.** The trail holds
  the action and a typed `before`/`after` snapshot (`@crm/validation/okr-vet`, which re-exports the one schema in
  `@crm/db/okr-vet` so the reminder generator in `@crm/db` parses with it too);
  `okr.objective` returns the rows for that objective. The import row is cycle-level
  (`objectiveId` null, `after` carries the unit and the counts) and each imported
  objective gets its own `tao` row.
- **Categories are Zod enums in `packages/validation`, not Prisma enums.** Cycle
  kind and phase, objective level, kind and status, the six KR kinds, KR source and
  trail actions live in `@crm/validation/okr-*` and are stored as strings. Adding a
  value is a schema change, not a `migration`.
- **Import is preview, then apply, same as the organization tree.**
  `previewImport` parses tab, semicolon or comma text (`nhap.ts`) against a
  snapshot and returns every row with its error; `applyImport` re-parses inside one
  transaction, writes the valid rows grouped into objectives and skips the broken
  ones. An objective title that already exists for that unit and cycle is a broken
  row, so pasting the same batch twice writes nothing. Caps and messages live in
  `OKR` (`okr-config.ts`).
- **Đề xuất (`OkrDeXuat`) và Tóm tắt tuần (`OkrTomTat`) nằm ngoài luật vết.** Chúng
  không phải bản ghi OKR nên không ghi `OkrTrail`; chỉ khi người nhận một đề xuất thì
  vết ghi lần sửa của người đó. Máy không ghi vào bản ghi OKR nào.
- **`okr.aiChiTieu` (`GET /okr/ai-spend`) chỉ quản trị.** `TroLyOkrService` đọc sổ chi
  phí tháng giờ Việt Nam theo sáu nhóm việc, trạng thái sẵn sàng qua
  `troLyOkrSanSang` và lần đối soát gần nhất của tháng đã qua; mọi vai khác nhận 403
  qua tRPC lẫn REST. API chỉ đọc sổ và ghi `AgentTask`: bật Trợ lý OKR ở
  `okr.setProgram` xếp một việc `okr-kiem-san-sang`, không gọi model.
- **Reading views live in `OkrXemService`, not in `OkrService`.** `okr.danhSach`
  filters a unit's list on the server — owner, kind and status become one Prisma
  `where`, a division includes its departments, and the facet counts are counted
  with every other filter applied but their own. `okr.toanCanh` rolls published
  objectives up by unit, `okr.cayCanChinh` returns the whole company alignment tree
  with each objective's expected pace, and `okr.sucKhoe` is admin-only
  (`ForbiddenException` otherwise). `danhSach`, `toanCanh`, `sucKhoe` and `hopTuan` run a fixed
  number of queries whatever the unit count; `apps/api/test/okr-toan-canh-hieu-nang.spec.ts`
  pins that at 50 departments × 2000 KRs. The pure roll-ups (`danh-sach.ts`, `toan-canh.ts`) take
  plain data and are tested without a database. Caps and the admin message live in
  `OKR_XEM` (`okr-xem.config.ts`).
- **Weekly numbers are read from check-ins, never stored again.** `okr.hopTuan`
  sorts a unit's KRs by why they are worth discussing (`hop-tuan.ts`: confidence
  dropped, then silent for `OKR_NHAC.imNgay` days, then a new note since the start of
  last week) and never lists people. `okr.toanCanh` adds each row's confidence split,
  KRs updated this week, the strongest reason and one heatmap cell per cycle week — the
  share of KRs whose last check-in that week is `cao`, among KRs updated that week, or
  `null`. `okr.dienBien` gives one point per cycle week (`dien-bien.ts`), and
  `okr.khoiCuaToi` a person's five most worrying KRs. A check-in's moment is its
  session's `submittedAt`, which is the same transaction as `createdAt` in production
  and is what a test freezes through `OkrCapNhatService`.
- **Opening the meeting board leaves one `mo-hop-tuan` trail row, and nothing else
  reads it.** The screen calls `okr.moHopTuan` once when the view mounts; the server
  writes only for the head of that unit or of its division, skips a repeat by the same
  person on the same unit within `OKR_XEM.moHopTuan.gopMs`, and stores
  `after = { donVi, tuan }` with `tuan` as the `YYYY-MM-DD` Monday string, never a
  `Date`. The row carries no `objectiveId`, so the sheet's Vết tab cannot see it; any
  new read of the trail by cycle must filter it out — `soi-ma.mjs --ca vet` fails on one
  that does not. `_acceptance/toan-canh-okr/rang/ty-le-mo-hop-tuan.sql` counts the share
  of units whose head opened the board in a week (`SET okr.tuan = '2026-11-16'` first).
- **Expected pace starts at publication.** An objective published today has an
  expected pace of 0, which `tinhTrang` reads as "no expectation yet" — a screen
  never prints "expected 0%" or draws a marker at the start of the bar.
- **The weekly update runs through a session, never a bare write.** `moCapNhat`
  opens an `OkrCheckInSession` (`entry`: `nhac` | `viec-cua-toi` | `tab` | `sheet` —
  where the person came in from) and returns `sessionId`; `guiCapNhat` locks that
  row (`SELECT … FOR UPDATE`), refuses a second submit (`submittedAt` already set),
  writes one `OkrCheckIn` per KR and updates `okrKeyResult.currentValue`, and
  computes `seconds` itself from `now - openedAt` — never a client-supplied
  duration. Check-ins are append-only: nothing is ever updated in place, and
  `capNhatTuan` reads the latest one per KR (`distinct: ["keyResultId"]`,
  newest `createdAt` first). Writing for someone else sets `onBehalf: true` on the
  check-in and is allowed only when the caller is the KR owner's unit head or an
  OneHub admin (`OkrAccessService.ghiDuocKr`) — a fellow KR owner cannot submit
  for another owner. A batch that names the same KR twice is refused whole by
  `guiCapNhatInput` («Mỗi KR chỉ gửi một lần trong một lần cập nhật.»): nothing is
  written and the session stays open.
- **A running KR's `currentValue` only moves through a weekly update — unless a
  machine writes it.** `updateKeyResult` refuses any `currentValue` change
  (`OKR.thongDiep.hienTaiQuaCapNhat`) once the objective is `cong-bo` and its cycle
  is `dang-chay` — every other field (title, `targetValue`, `unit`, owner…) still
  writes normally. `okr.objective`'s per-KR `hienTaiQuaCapNhat` flag is exactly that
  same condition, so the sheet can lock the field before the write is even tried,
  not just after a 400. The exception is a KR whose effective `source` is not `tay`:
  there `updateKeyResult` refuses a `currentValue` change in every phase
  (`OKR.thongDiep.so.hienTaiCuaMay`), because the number comes from the agent's daily
  snapshot (`crm`, `bang-tinh`) or from `ghiSoKr` (`api`). `guiCapNhat` on such a KR
  ignores the value sent, records the machine's current value on the check-in and
  leaves `currentValue` alone; confidence and note are still required.
- **`removeKeyResult` refuses once a KR has history.** A KR with at least one
  `OkrCheckIn` row cannot be deleted (`krDaCapNhat`) — only edited; a KR another
  objective aligns to (`OkrAlignment.targetKeyResultId`) is refused the same way
  (`krDangLaDich`), and so is a KR with a target change (`okrDoiDich`) or a score row
  (`okrDiemKr`), evidence (`okrBangChung`, `krCoBangChung`) or a recognition tied to
  it (`okrGhiNhan`, `krCoGhiNhan`). The checks run inside the same lock as the
  delete, so a check-in written mid-transaction cannot race past them. The KR's
  việc and sáng kiến rows (`okrViecKr`) go in the same transaction, one `go-viec`
  trail row each, before the `xoa-kr` row.
- **A KR's number has a source, and the source locks at publication.**
  `okrKeyResult.source` is the effective source (`tay` · `crm` · `api` · `bang-tinh`) —
  the one that drives `currentValue` and progress. A machine source's settings are one
  `OkrNguonKr` row per KR, parsed at the read by `@crm/validation/okr-nguon`.
  `datNguonKr` sets, changes or removes it: on a draft objective the change takes effect
  at once (`source := loai`, the row overwritten, `tay` deletes it). Once the objective
  is published the effective source is locked like the start value — a `tay` KR may add
  a **side measurement** (an `OkrNguonKr` row while `source` stays `tay`: the agent
  snapshots it and the screen shows it beside the hand number, progress still follows
  the hand number; `soMay` on `okr.objective` and `okr.capNhatTuan` is the newest
  snapshot only when its `nguon` is the configured machine type, so switching a side
  measurement from `crm` to `api` shows no number until the first `api` write), and changing or removing a machine KR's source is refused
  (`OKR.thongDiep.so.nguonDaKhoa`). A CRM metric is a count, so `crm` — as the effective
  source or as a side measurement — is refused for a `moc` or `phan-tram` KR
  (`OKR.thongDiep.so.crmKhongHopKieu`, rule `crmHopKieu` in
  `@crm/validation/okr-nguon`); `api` and `bang-tinh` stay open to them, and the value
  they bring is checked against the kind instead. `updateKeyResult` holds the same line
  from the other side: changing the kind of a KR that takes `crm` (effective or side
  measurement) to `moc` or `phan-tram` is refused with the same message. A unit in the scope must exist and be live, a person
  must be a member, a Sheets link must be `docs.google.com/spreadsheets` with an A1
  cell, and Sheets is refused while `GOOGLE_SHEETS_EMAIL` or `GOOGLE_SHEETS_KHOA` is
  missing. Every call leaves one `doi-nguon` trail row (before → after; a side
  measurement notes «đo cạnh») and is phase-locked like the other writes. A Sheets
  source queues an `okr-doc-sheet` `AgentTask` for a trial read — the API never calls
  Google.
- **Seven CRM metrics, one definition each.** The catalog is `CHI_SO_OKR`, defined in
  `@crm/db/okr-chi-so-danh-muc` and re-exported with its Zod shapes by
  `@crm/validation/okr-chi-so`: what is counted, which date puts a record in the
  period, who is credited, what record sits behind it and which scopes it accepts
  (company, division, department, person; `ghi-danh-dat-bac` also needs `bac`). There
  is no query builder. `@crm/db/okr-chi-so` holds the one `dieuKienChiSo` that builds
  the Prisma `where`; `demChiSo` counts with it and `banGhiChiSo` lists with it, so a
  number and its list cannot disagree. A division or department scope reads each
  credited person's primary department at the time of counting
  (`buoc-xong-dung-han` reads the step's department). The period is the objective's
  cycle, from `startsOn` 00:00 to the end of the snapshot day in Vietnam time, capped
  at `endsOn`. Caps and timings live in `OKR_SO` (`packages/db/src/okr-so-config.ts`).
  `_acceptance/so-okr-tu-chay/rang/tin-so.mjs --ky <tu>..<den>` compares five of them,
  read-only, with a hand-written count (`dem-doc-lap.sql`) against the tolerances
  declared in `lech-khai-truoc.md`; `ty-le-kr-co-nguon.sql` gives the share of
  published KRs with an effective CRM source, with a CRM side measurement, and the
  share of side-measured check-ins that took the machine number (`SET okr.chu_ky` and
  `SET okr.bo_phan = '<id>,<id>'` first).
- **`okrSoChup` is append-only history.** One row per KR per day for `crm` and
  `bang-tinh` (the partial unique index `okrSoChup_may_mot_ngay`), any number per day for `api` (the newest is
  that day's number). Each row copies the definition it was counted with (`chiSo`,
  `phamVi`, `bac`), so history describes itself after the source changes. Nothing
  updates or deletes a row: the foreign key to the KR is `ON DELETE RESTRICT`,
  `removeKeyResult` refuses a KR that has a snapshot (`OKR.thongDiep.so.krDaCoSoChup`),
  and `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs --ca chi-them` fails on any
  `okrSoChup.update*` / `delete*` or raw SQL that does either outside tests. Rows are
  written in three places only: the agent's daily snapshot, the shared `chupKrCrm`, and
  `ghiSoKr`.
- **Another system writes a number with an API key.** `okr.ghiSoKr` is also
  `POST /rest/okr/key-results/{id}/value` with `x-api-key` — a member's key
  (`enableSessionForAPIKeys`); the service checks that member with
  `OkrAccessService.assertSuaKr` (the KR's owner, or a head who edits the objective's unit),
  so the «chỉ OKR» role may call it. It takes `giaTri` and an optional `ghiChu`; it
  refuses a KR whose source is not `api` (`OKR.thongDiep.so.khongNhanApi`), a value
  that does not fit the KR's kind, a locked phase, any call while today in Vietnam is
  still before `startsOn` (`OKR.thongDiep.so.kyChuaToi`), and any call once today is
  past `endsOn` (`OKR.thongDiep.so.kyDaQua`), even before the phase moves. It writes
  one `okrSoChup` row (`nguon: api`, `tacGiaUserId`), updates `currentValue` when the
  effective source is `api`, and leaves one `ghi-so-api` trail row.
- **Clicking a number opens the records behind it.** `okr.lichSuSo` returns the
  snapshot rows, newest first, read from the table — never recounted.
  `okr.banGhiChiSo({ keyResultId, ngay?, trang })` recounts **with the definition copied
  into that day's snapshot**, not the KR's current settings (a KR with no snapshot yet
  uses its current settings). It returns the definition, the date range, the number
  snapshotted for `ngay` (the latest day by default), the number counted now for the
  same range (the list's own total — one count, not a second one), a `lech` flag when the
  two differ, and one page (`OKR_SO.banGhi.coTrang`)
  of `{ loai, id, ten, ngay }` rows the sheet opens as a stacked record. An `api` KR
  returns its writes (`lanGhi`) instead. The list is partner data: the «chỉ OKR» role
  gets `403` with `OKR.thongDiep.so.danhSachDoiTac`, while it can still read the number
  through `lichSuSo`. `okr.chiSo` returns the catalog and whether Sheets is on;
  `okr.xemTruocChiSo` counts up to now for the dialog and writes nothing.
- **Closing a cycle: review window, scoring, lessons, carry-over, export.** Rules and
  shapes shared by screen, server and the later AI pass live in `packages/validation`:
  `@crm/validation/okr-khep` (`OKR_KHEP`, the score grid, `goiYDiem`, `diemChuan`,
  `diemTheoThang`, `diemMucTieu`, `cachDoc`, every input schema) and
  `@crm/validation/okr-kiem` (`kiemOkr`, four quality rules with stable codes — the
  screen asks, the server never blocks on them). Server code is `OkrKhepService` plus
  the pure `khep.ts` (`cuaSoHieuLuc`, `chotKyCham`, `kiemDongKy`), five tables at the
  end of `schema.prisma`, every foreign key to the older OKR tables `ON DELETE RESTRICT`.
  - `moRa` / `dongRa` (admin, `dang-chay` only, dates inside the cycle, no overlapping
    open window) open and close a mid-cycle review window; `okr.cycles` returns the
    window open today in Vietnam time. Changing a published KR's target in a running
    cycle writes one `okrDoiDich` row; outside the window `updateKeyResult` requires
    `lyDoDoiDich` (10–500 characters) and the row is marked `ngoaiRa`, which the
    scoring screen shows as «Đích sửa ngoài rà».
  - `dang-chay → cham-diem` only from the day after `endsOn` (Vietnam) and only once
    every published KR with source `crm` has its last-day snapshot; the same
    transaction writes one `okrDiemKr` per KR of a published objective (`soChot` =
    `currentValue`, `diemGoiY` from the progress function, the program's `scoreScale`,
    `weightsOn` and version copied onto the row) and closes any open window.
    `cham-diem → da-dong` only when every row has `diem`.
  - `chamKr` (whoever `ghiDuocKr` allows) takes the score on the row's own scale
    (`0-100` → 80), stores it 0–1, and requires a reason when it differs from the
    suggestion. `ghiDieuHocDuoc` (whoever edits the objective) works in `dang-chay`
    and `cham-diem`. `bangCham` reads everything off the score rows — scale, weights,
    reading — never the current program config, so a closed cycle's numbers do not
    move when the program changes.
  - `moLaiKy` (admin, reason 10–500) takes `da-dong` back to `cham-diem` and writes the
    reason into the `mo-lai-ky` trail row's `note`; scores and snapshots stay.
  - `mangSang` copies a published objective from a scoring or closed cycle into a draft
    in the next cycle of the same kind: KRs scored below 1 go with start and current =
    `soChot`, target kept, source `tay`; a KR whose new start breaks its kind is listed
    in `khongChep`; participants who left are dropped (`boThamGia`), a KR whose owner
    left goes to the objective's owner (`doiPhuTrachKr`); alignments are not copied.
    One carry per objective per target cycle (`okrMangSang` unique).
  - `xuatKy` (every OKR role, `da-dong` only) returns `{ tenTep, noiDung }`: UTF-8 CSV
    with BOM, one row per KR of published and dropped objectives, cells starting with
    `= + - @` or a tab get a leading `'`. Reading, so no trail row.
  - Trail actions added: `mo-ra`, `dong-ra`, `doi-dich`, `cham-kr`, `nhin-lai`,
    `mang-sang`, `mo-lai-ky`.
- **Comments, mentions and follow live on the objective, not the KR.**
  `addComment` may tag one KR of that same objective (`keyResultId`, refused with
  `krKhacMucTieu` if the KR belongs to a different objective) and every mention
  must already be a workspace member (`assertThanhVien`). `follow`/unfollow is
  idempotent — `skipDuplicates` on repeat-follow, a no-op unfollow writes no trail
  row. Every comment and follow toggle still writes its own `OkrTrail` row via the
  shared `vet()`, never an `Activity`.
- **Việc (KR) are rows the unit writes under a KR; one table holds them and the
  sáng kiến.** `OkrCanhKrService` owns `okrViecKr`: `loai: "viec"` is a hand-written
  action (`tieuDe` 2–200 characters per `OKR_CANH_KR`, a `nguoiLamUserId` who must still be a member,
  an optional `hanNgay`, `xongLuc` set when done), `loai: "chien-dich"` and
  `"ke-hoach"` are sáng kiến. `themViec`, `suaViec` and `goViec` need whoever edits
  the KR (`OkrAccessService.ghiDuocKr`); `danhDauViec` also lets the việc's own người
  làm mark it done or not done — never edit or remove it. Every write is phase-locked
  (`assertKyGhiDuoc`: nothing in `cham-diem`, `da-dong`, or on a dropped objective)
  and leaves one trail row (`them-viec`, `sua-viec`, `xong-viec`, `go-viec`).
  `okr.canhKr` returns the KR's rows in `position` order with a `quyen` block
  (`suaDuoc`, `ganDuoc`) and `khoa`, so the sheet asks the server what it may do;
  `okr.objective` adds each KR's `soViec` (`xong/tong`, `loai: "viec"` only),
  `soSangKien` and `coBangChung` for the KR table's «Việc» column.
- **A sáng kiến stores only the source record's id, and one function decides who
  sees what it points at.** `ganSangKien` (a KR editor whose role reads partner data)
  writes `campaignId` or `planId` and never copies a name; `@@unique([keyResultId,
  campaignId])` / `([keyResultId, planId])` refuse the same record twice, an unknown
  id is 404. Every read resolves the live record: name, status (`chua-chay` ·
  `dang-chay` · `da-dong` · `da-luu-tru` when the plan's company is archived ·
  `da-xoa` when the foreign key went `SET NULL`). **`lienKetChoVai` in
  `apps/api/src/okr/canh-kr.ts` is the only place that turns a row into what a
  caller sees**: for the «chỉ OKR» role (no `doi-tac` scope) it returns `{ loai,
  coQuyen: false }` — no name, id, status or owner — and the trail snapshot of a
  `gan-sang-kien` / `go-viec` row goes through the same function
  (`vetSangKienChoVai`). A new endpoint that returns sáng kiến rows must call it;
  `soi-ma.mjs --ca thiet-ke` counts return sites against calls and fails on a gap.
  The pickers use the partner routers (`onboarding.listPlans`, `campaigns.list`),
  never a read path inside `okr.*`.
- **Bằng chứng is a link on a finished milestone KR.** `themBangChung` takes an
  `http(s)` URL up to 2000 characters (`duongDanBangChung`, `javascript:`/`data:`/
  empty refused) and a note up to 300 (`OKR_CANH_KR`), only on a `moc` KR whose `currentValue` is 1,
  by a KR editor; `goBangChung` removes one. Both write a trail row
  (`dinh-bang-chung`, `go-bang-chung`). `guiCapNhat` accepts an optional
  `bangChung` per item and writes it through the same `ghiBangChung` inside the
  check-in transaction, so a bad link refuses the whole submit and the KR does not
  move. Marking a milestone done never requires evidence.
- **Ghi nhận is a thank-you on a published objective, readable in the Trao đổi tab
  and nowhere else.** `guiGhiNhan` (any member, the «chỉ OKR» role included) takes
  1–5 recipients who are still members and are not the sender, a message of 1–500
  characters and an optional KR of that same objective; draft and dropped objectives
  refuse it, scoring and closed cycles do not. `goGhiNhan` is the sender's or an
  admin's. `okr.comments` returns `dong`, comments and recognitions merged by time on
  the server, so the screen never merges two lists. Recipients get one
  `okr-ghi-nhan` reminder each (see `docs/agent.md`); nothing counts or ranks
  recognitions per person — `soi-ma.mjs --ca dem-theo-nguoi` fails on a `groupBy`,
  `_count` or raw `GROUP BY "userId"` over `okrGhiNhanNhan`.
- **Mẫu OKR are admin-authored templates; the objective remembers which one it came
  from.** `OkrMauService`: `luuMau` creates or edits (`@crm/validation/okr-mau`:
  name, `cap` bộ phận · phòng ban · cá nhân, `donViIds` of that level or empty for
  all, `noiDung` = sentence, kind and 1–`OKR_MAU.krToiDa` KRs each checked with
  `kiemSoTheoKieu`; the sentence and each KR name reuse `mucTieuInput.shape.title`
  and `krInput.shape.title`, so a template that saves is one `taoTuMau` accepts),
  `luuTruMau` / `khoiPhucMau` archive and restore; each is
  admin-only and leaves a `sua-mau` trail row. `okr.mau` reads them: **with a `cap`
  or `donViId` filter every role — admins included — gets only live templates of
  that level that apply to that unit** (the «Bắt đầu từ mẫu» picker); an admin
  without a filter gets every template, archived ones too (the settings list); any
  other role without a filter gets the live ones (d-13). `taoTuMau` builds a draft
  objective and all its KRs in one transaction through the same rules as a hand-made
  one (`kiemTranKr` shared with `createKeyResult`), refuses an archived template, a
  template of another level or unit, and a missing or wrong-kind number without
  writing a row, and writes one `okrMucTieuTuMau` row pointing at the template.
  Editing a template later never touches objectives already made from it.
- **`okr.thanhVien`** lists every workspace member (`id`, `name`, `email`) for the
  mention, transfer and KR action-assignee pickers — no role filter, since being
  mentionable is separate from who can edit.
- **`okr.viecCuaToi` is one call for the caller's own OKR row.** `viec` is the
  caller's pending OKR items, filtered from the same `viecCanNhac` queue plan items
  share, with `cuaSo: "truc-tiep"` (events of the last 24 hours up to now, not the
  morning reminder's 08:30-anchored window); its item schema is `viecOkr` from
  `@crm/db/okr-nhac`, not a copy; `lienQuanOkr` (`@crm/db/okr-nhac`) is the objectives and KRs the caller
  owns or participates in at the running cycle, so a screen can show "your OKR"
  even on a week nothing is due.
- **`transferPreview`/`transferWork` move a leaver's OKR ownership** — admin-only
  (`canManageOnboarding`), a separate action from the 30-day work transfer. Both
  share `dieuKienChuyen(fromUserId)`: a KR or objective only moves while its cycle
  is still writable (`PHA_GHI_DUOC`, i.e. not `da-bo`), and a personal objective
  (`level: "ca-nhan"`) owned by the person leaving never moves. The leaver's open
  việc (`okrViecKr.nguoiLamUserId`, `xongLuc` null) on a KR under the same rule move
  too; a việc already done keeps its người làm. `transferWork` re-points
  `ownerUserId` and `nguoiLamUserId`, drops the leaver from every `OkrParticipant`
  row, and writes one `chuyen-viec` `OkrTrail` row per KR, objective and việc moved;
  `transferPreview` returns the same `{kr, mucTieu, viec}` counts without writing
  anything.

## Kho tài liệu: nguồn

`apps/api/src/tai-lieu/tai-lieu-nguon.*` owns the `taiLieuNguon.*` router: `trangThai`,
`xinCho`, `nhan`, `list`, `get`, `taiVe`, `soanLai`. It carries `PhamViChungMiddleware`.

- **The browser uploads, the API only signs and receives.** `xinCho` returns a signed PUT
  URL on a private Vercel Blob store (`packages/db/src/blob-nguon.ts`); the file never
  passes through Nest. `nhan` reads the stored bytes back, recognises the kind from magic
  bytes (`kho-nguon.ts`), computes `sha256` itself, and writes the `TaiLieuNguon` row and one
  `AgentTask` of kind `soan-tu-nguon` in one transaction. It never parses the document:
  reading text, deciding what the page says and drafting belong to the agent.
- **`nhan` only accepts a pathname issued to this caller.** `xinCho` returns a `phieu`: an HMAC over
  user, pathname and expiry (`phieu-nguon.ts`, key derived from `BETTER_AUTH_SECRET`, one hour).
  `nhan` checks it, and refuses a pathname that already belongs to a `TaiLieuNguon`, before it reads
  or deletes anything — knowing a source's pathname is not enough to delete its file (AC-16).
  The destination is validated first; then one transaction takes an advisory lock on the pathname,
  re-checks, reads the file and writes the row, using only `tx` — never a second pooled connection,
  which is what hung the API under ten concurrent uploads. Only a known rejection deletes the file.
- **A rejected or duplicate upload deletes its blob.** Same bytes as an existing source
  answer `{ trung: true, nguonId }` of the old row; the unique index on `sha256` catches
  the race the pre-check misses.
- **No `KHO_TAI_LIEU_BLOB_TOKEN` switches the area off, never throws.** The store is its
  own private one, apart from the public store the logos use, and there is no fallback to
  the logos' variable (`docs/environment.md`). `trangThai` answers
  `{ bat: false }`, the screen locks «Tải nguồn lên», and `xinCho`, `nhan`, `taiVe` answer
  `PRECONDITION_FAILED` with `NGUON.thongDiep.tat`. `DomainErrorMiddleware` maps 412 to
  `PRECONDITION_FAILED`.
- **Who sees a source is one function** (`quyen.ts`): the uploader, the target page's
  owner, `owner` and `admin` always; anyone else once a proposal from it has been approved
  into a version — any version, including one since replaced.
  Everyone else gets `NOT_FOUND`, identical to a missing id. `taiVe` signs a GET for at
  most five minutes.
- **Approving a machine draft needs the numbers checked.** `taiLieu.approve` on a proposal
  with `nguonId` recomputes `soMoi(noiDung, banGoc)` and refuses when `daDoiChieu` is
  smaller. `taiLieu.propose` with `tuDeXuatId` copies `nguonId` and `trichDoan` from the
  machine draft, so an edited draft still traces back to its source. Every proposal, from
  a person or the machine, is written by `taoDeXuatTaiLieu` in
  `packages/db/src/tai-lieu-de-xuat.ts`.

## Money

A deal is sold in one currency and reported in another, and **only `baseAmount` may
ever be summed**. The rules — `baseCurrency`, `countedWhere`/`pendingWhere`, frozen
rates, the supported currencies, the keyless feed, and why the fetcher is the one
documented exception to *no intelligence in the API* — are in **`docs/currency.md`**.
Read it before touching any amount, total, chart or rate.

## Freshness: invalidate the query, don't disable the cache

- **Invalidate in `onSuccess` through `useCrmCache()`** (`lib/trpc/cache.ts`), never by
  listing keys at the call site. Say what changed — `cache.deal(id)`,
  `cache.company(id)`, `cache.contact(id)`, `cache.activity()`. **A new mutation adds a
  call there, not a new list of keys.**
- **A new query a screen reads joins the list its writes refresh.** Every `okr.*`
  query an OKR screen reads is in `cache.okr`, except `okr.access`, `okr.thanhVien`
  and `okr.chiSo` (the metric catalogue and whether Sheets is on — no OKR write changes it);
  `apps/app/test/okr-lam-moi.spec.ts` reads both sides and fails on the one left out.
- **A deletion is `cache.removed(ref)`** — one wide fan-out, and the only place
  `refetchType: "none"` is right: the deleted record's `byId` query is still mounted
  while the sheet animates shut, so refetching reads a 404 into the closing sheet,
  while leaving it alone serves 30s of a dead record from cache.
- **`{ settle: "record" }`** for inline editors, so the field's spinner clears without
  waiting for the table.
- **Infinite queries need `pathKey()`, not `queryKey()`** — the latter stamps
  `{ type: "query" }` and silently cannot match `{ type: "infinite" }`.
  `activities.timeline` is read both ways.
- **`cache-manager` is per-value and opt-in**, not an interceptor;
  `AuthService.getProfile` is the model.
- **Background writes need polling, not invalidation** — `refetchInterval` while
  `PENDING`/`RUNNING`, via `isEnriching()` and `ENRICHMENT_POLL_MS`. **Lists poll too,
  not just the sheet.**
