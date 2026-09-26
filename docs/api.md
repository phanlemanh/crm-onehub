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
  re-derives them.
- **Eleven writes are locked by cycle phase.** Every objective, key-result and
  alignment write, plus `previewImport` and `applyImport`, calls
  `assertKyGhiDuoc` first: only `lap-ke-hoach` and `dang-chay` accept writes. Phase
  only moves forward (`setCyclePhase`).
- **Every write leaves one `OkrTrail` row, never an `Activity`.** The trail holds
  the action and a typed `before`/`after` snapshot (`@crm/validation/okr-vet`);
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
  OneHub admin (`OkrAccessService.suaDuocDonVi`) — a fellow KR owner cannot submit
  for another owner.
- **A running KR's `currentValue` only moves through a weekly update.**
  `updateKeyResult` refuses any `currentValue` change
  (`OKR.thongDiep.hienTaiQuaCapNhat`) once the objective is `cong-bo` and its cycle
  is `dang-chay` — every other field (title, `targetValue`, `unit`, owner…) still
  writes normally. `okr.objective`'s per-KR `hienTaiQuaCapNhat` flag is exactly that
  same condition, so the sheet can lock the field before the write is even tried,
  not just after a 400.
- **`removeKeyResult` refuses once a KR has history.** A KR with at least one
  `OkrCheckIn` row cannot be deleted (`krDaCapNhat`) — only edited; a KR another
  objective aligns to (`OkrAlignment.targetKeyResultId`) is refused the same way
  (`krDangLaDich`). Both checks run inside the same lock as the delete, so a
  check-in written mid-transaction cannot race past them.
- **Comments, mentions and follow live on the objective, not the KR.**
  `addComment` may tag one KR of that same objective (`keyResultId`, refused with
  `krKhacMucTieu` if the KR belongs to a different objective) and every mention
  must already be a workspace member (`assertThanhVien`). `follow`/unfollow is
  idempotent — `skipDuplicates` on repeat-follow, a no-op unfollow writes no trail
  row. Every comment and follow toggle still writes its own `OkrTrail` row via the
  shared `vet()`, never an `Activity`.
- **`okr.thanhVien`** lists every workspace member (`id`, `name`, `email`) for the
  mention and transfer pickers — no role filter, since being mentionable is
  separate from who can edit.
- **`okr.viecCuaToi` is one call for the caller's own OKR row.** `viec` is the
  caller's pending OKR items, filtered from the same `viecCanNhac` queue plan items
  share; `lienQuanOkr` (`@crm/db/okr-nhac`) is the objectives and KRs the caller
  owns or participates in at the running cycle, so a screen can show "your OKR"
  even on a week nothing is due.
- **`transferPreview`/`transferWork` move a leaver's OKR ownership** — admin-only
  (`canManageOnboarding`), a separate action from the 30-day work transfer. Both
  share `dieuKienChuyen(fromUserId)`: a KR or objective only moves while its cycle
  is still writable (`PHA_GHI_DUOC`, i.e. not `da-bo`), and a personal objective
  (`level: "ca-nhan"`) owned by the person leaving never moves. `transferWork`
  re-points `ownerUserId`, drops the leaver from every `OkrParticipant` row, and
  writes one `chuyen-viec` `OkrTrail` row per KR and objective moved;
  `transferPreview` returns the same `{kr, mucTieu}` counts without writing anything.

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
