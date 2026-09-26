# Setup and local development

Operational detail moved out of the rule docs. `api.md`, `agent.md` and
`environment.md` are what agents read before changing code; this is what a person
reads once.

## First run

```sh
cp .env.example .env        # fill DATABASE_URL, BETTER_AUTH_SECRET, ALLOWED_SIGN_IN
docker compose up -d        # Postgres, matching .env.example
bun run db:migrate && bun run db:seed
bun run dev                 # app :3000, api :3001, agent :2000
```

Prisma from the repo root: `db:generate`, `db:migrate`, `db:push`, `db:reset`,
`db:seed`, `db:studio`, `db:deploy`.

`dev` depends on `^dev:prepare`, so every start applies pending migrations and
regenerates the Prisma client before a single server boots. That is why the first
run needs `db:migrate` only for the seed that follows it. When the database and
`schema.prisma` have diverged past what `migrate deploy` can reconcile,
`dev:prepare` stops the whole run rather than starting servers against a schema
they do not match — reconcile with `db:migrate`, or `db:reset` when the divergence
is an edited migration that has already been applied.

## Google Cloud

- **Enable the Gmail API and the Google Calendar API** on the project.
- **Set the consent screen to User type: Internal** if you are on Workspace.
  `gmail.readonly` is a *restricted* scope, so an External app needs OAuth
  verification plus an annual CASA assessment. Going External later means the full
  review — a decision, not a checkbox.

## The agent bridge

```sh
AGENT_URL="http://127.0.0.1:2000"   # 127.0.0.1, not localhost: eve dev is IPv4-only
AGENT_BRIDGE_SECRET="$(openssl rand -base64 32)"
```

| Agent tab error | Cause |
| --- | --- |
| `503` | `AGENT_BRIDGE_SECRET` unset in the app's process |
| `401` | The two processes hold different secrets, **or** `passThroughEnv` in `apps/app/turbo.json` / `apps/agent/turbo.json` is missing the pair (Turbo is strict-env) |
| `502` | Agent not running, or `AGENT_URL` wrong |

`localDev()` accepts any loopback request, so `curl 127.0.0.1` proves nothing about
the bridge — send `-H 'Host: agent.example.com'`. `GET /eve/v1/info` is the whole
inventory, including a `diagnostics` count that finds files eve silently ignored.

## Running the agent

The agent package's default `dev` command is interactive `eve dev`. The root
Turbo task marks it interactive, so select the agent pane and press Enter before
using the eve TUI. Run `turbo run dev:headless --filter=agent` when a terminal
cannot render the TUI; that uses `eve dev --no-ui`, and the Turbo pane is the
record because only interactive development writes `.eve/logs/` for `eve logs`.
Reach for the Turbo task rather than `bun run --filter=agent dev:headless`: the
package script alone skips `dev:prepare`, so the agent would start against
unmigrated tables.

`hooks/activity.ts` is the replacement narration, **to stderr** (the TUI hides
stdout), printing shape everywhere and argument contents outside production only. It
is **not the audit trail** — `hooks/audit.ts` writes `AgentEvent` regardless.

- A second `bun run dev` fails the whole turbo run.
- An orphaned agent holds the port: `lsof -nP -iTCP:2000 -sTCP:LISTEN`.

### Nothing is researching, and the queue only grows

**`eve dev` never fires schedules on their cron cadence**, and everything visible
still works — the row is written, the sheet says *Queued*, and `dispatch.ts` is never
called. The poke covers this **only when `AGENT_BRIDGE_SECRET` is set**; unset,
`poke()` returns silently and the queue looks exactly like a slow agent.

Tasks the API did not write (`schedule_recheck`) and anything queued while the agent
was down still need a manual run:

```sh
bun run --filter=agent dispatch    # exact production path, both lanes, real credits
```

Its printed `sessionIds` are research rows only, so a run that resolved forty logos
prints an empty list and was not idle. `eve start` and Vercel do run the schedule.

## `vercel env pull` writes `.env.local`, which wins

`.env.local` is the override the loader reads *last*, and `vercel env pull` writes
**production** credentials there by default. Pull once and every process silently
points at production — not as an error, but as `bun run dev` working perfectly against
the live database. On 2026-08-01 eleven migrations landed on Neon from a laptop.

1. **Pull somewhere inert**: `vercel env pull .env.vercel`.
2. **`packages/db/scripts/require-local-db.ts` guards `db:migrate`, `db:push`,
   `db:reset`, `db:seed`** and takes `ALLOW_REMOTE_DB=1`. `db:deploy` is unguarded on
   purpose. It reads the root files directly rather than `process.env`, because Bun
   auto-loads the working directory's `.env` while Prisma's CLI only sees
   `@crm/env/load`.

## Migrations run on the production deploy, and nowhere else

`apps/api/scripts/build-func.mjs` runs `prisma migrate deploy` during the crm-api
build, gated on `VERCEL_ENV === "production"`. The schema therefore moves when the
release pull request merges and `release` deploys — with the code that needs it,
and once rather than once per branch.

Preview deploys share the production database: `DATABASE_URL` is a single value
across production, preview and development. Until that changes, **a preview of a
branch that adds a migration runs against a database without those tables** — it
builds, and the pages that touch them fail. Test schema changes locally, where
`bun run dev` migrates for you. Before the gate existed the reverse was true and
worse: every preview applied its own migrations to the production database, so on
2026-08-07 the live schema ran six migrations ahead of the live code all day.

### `migrate deploy` is not proof the schema is right

The build follows the deploy with `prisma migrate diff --exit-code` against
`schema.prisma` and shouts in the build log when they disagree. **`No pending
migrations to apply` only means `_prisma_migrations` has a row for every file** —
it says nothing about what the tables actually look like.

They came apart once. A `prisma db push` shaped production from a laptop, the
migration rows were recorded as applied without their SQL ever running, and
`agentConversationAttachment` went live without its `position` column. Every deploy
reported nothing pending, for days, while `conversations.builderById` returned 500.
The tell is an object in the database that no migration defines — there was an
`agentConversationAttachment_submissionId_createdAt_idx` that appears in no
migration file, only in a `db push` of an older schema.

Reconciling is one command, and it is worth reading before running:

```sh
DATABASE_URL="…" bunx prisma migrate diff \
  --from-config-datasource --to-schema prisma/schema.prisma --script
```

## Secrets hygiene

`.gitignore` ignores `.env` and `.env.*` with one negation for `.env.example`, so
`.env.bak` is ignored too. `.env.example` ships no secret — placeholders are empty
strings, asserted by `packages/env/test/root.spec.ts`. **Generate your own secret**;
never reuse one from an example, a tutorial, or another environment.

## Tests

```sh
bun run --filter=api test
bun run --filter=agent test    # integration specs need DATABASE_URL + real Postgres
```

### One run, one database

`bun run test` is `packages/db/scripts/test-run.ts`. It mints a `TEST_RUN_ID` when
none is set, creates `crm_<id>_test` next to `TEST_DATABASE_URL`, runs the suite on
it, and drops it when the suite exits. Two runs on one machine — two Claude Code
sessions, a pre-push hook beside a browser lane, an acceptance executor beside
anything — never see each other's rows, because they never share a database. The
run id is the same value the specs use to suffix their fixtures, so a leaked row
names the run that wrote it. The rule that turns a base name and a run id into a
database name is `packages/db/src/test-database.ts`; `client.ts` and `db:test`
both read it, so a process that carries `TEST_RUN_ID` lands on that run's database
whichever way it was started.

- `bun run test -- --filter=api --force` forwards flags to `turbo run test`.
- `bun run test -- "cd apps/api && bun test test/bulk.spec.ts"` runs any shell
  command in a fresh lane. Every executor in `_acceptance/config.yaml` that touches
  a database goes through this form.
- To iterate on one spec by hand, pick an id once: `TEST_RUN_ID=me bun run db:test`
  builds `crm_me_test`, and `TEST_RUN_ID=me bun test …` in any package lands there.
  Without `TEST_RUN_ID`, a bare `bun test` uses `crm_test` itself, which is the
  one database two people can still collide on.

A run that is killed leaves its database behind. Every run database carries a
`COMMENT ON DATABASE` with its creation time, and `db:test` drops any such
database that has no connection and is older than `TEST_DATABASE.run.maxAgeMs`
(six hours). It never drops a database it did not mark.

### The test database rebuilds itself when it drifts

`bun run db:test` creates `crm_test` and runs `migrate deploy` on it — or, with
`TEST_RUN_ID` set, `crm_<id>_test`. The database name must end in `_test`; the
suite deletes rows it expects to put back, so it refuses anything else.

**`migrate deploy` only applies migrations that are missing. It never removes a
table, a column or a constraint the database has and the schema does not.** A
`crm_test` built on a branch that was later abandoned therefore keeps that branch's
objects forever, and `db:test` used to report `already exists` and move on. The
extra objects are invisible until one of them rejects a write, and then the failure
names a constraint that appears in no migration and in no schema — a stray
`trackedEvent_visitorId_fkey` once failed seven tracking specs this way, on every
branch, for as long as the database survived.

So `db:test` now checks the database it found and rebuilds it when either is true:

- **It holds a migration this branch does not have.** The database came from
  another branch. The name of the first one is printed.
- **It no longer matches `schema.prisma`**, by `prisma migrate diff`. Something
  was pushed or altered by hand.

A rebuild drops the database and re-runs every migration, and it says which of the
two reasons fired. Force one with `bun run db:test --reset`. Nothing else in the
repo may drop a database, and this may only because the `_test` suffix is checked
first.

### Screen measurements get a database of their own

A screen measurement (`_acceptance/*/rang/*.mjs` run through
`scripts/lan-do/tien-de.mjs`) writes to the database it runs against: it plants OKR
cycles, sets a placeholder research key, signs people in. When that database was the
shared dev database `crm`, one lane's leftovers became the next lane's broken premise
— and the person's working data. On 26/09 three trial OKR cycles left in `crm` by one
worktree made a signed ruler that needs zero cycles exit 2 in another.

So a measurement now runs in a **measure session** on a database of its own tree:

- `bun run db:do --tao` creates `crm_<tree>_do` and prints its URL on the last line.
  `<tree>` is the checkout's directory name (or `PHIEN_DO_TEN_CAY`) with hyphens turned
  into underscores; a name with capitals, dots, underscores or doubled hyphens also gets
  `__<hash>`, so two different names never share a database. The
  database is cloned (`CREATE DATABASE … TEMPLATE`) from `crm_<tree>__mau_do`, a
  template built once by `migrate deploy` plus `prisma/seed.ts` and rebuilt when the
  migrations, `schema.prisma` or `seed.ts` change. A clone takes about a second; the
  seed alone takes thirty. Nothing is copied from `crm`. The seed runs with an empty
  `BLOB_READ_WRITE_TOKEN`, so building a template never uploads to the blob store.
- `bun run db:do --xoa` drops the tree's measure database. It refuses a name that does
  not end in `_do`, and one without the measure-session `COMMENT`.
- `bun run db:do --quet` drops every marked measure database and template with no
  connection whose last touch — creation, or the last clone for a template — is older
  than `MEASURE_DATABASE.maxAgeMs` (12 hours). Every `--tao` runs the same sweep,
  so a database left by a killed run goes on a later one. Rules and constants:
  `packages/db/src/measure-database.ts`.
- `bun run do:man --chay "<command>"` is a whole session
  (`scripts/lan-do/phien-do.mjs`, constants in `scripts/lan-do/cau-hinh.mjs`): take a
  Postgres advisory lock on the database name (a second session of the same tree
  waits; the lock dies with the process), kill servers a killed session left behind,
  create the measure database, start this tree's API and app on two free ports in
  4100–4899 (the app builds into `.next-phien-do-<tree>`, so it never fights a dev
  server in the same checkout), wait for `/health`, check with `canh-cay.mjs` that
  the app serves this tree, run `dev:session` for `NGUOI`, mark the workspace
  onboarded, then run the command with `DATABASE_URL`, `APP_URL`, `API_URL` and
  `PHIEN_DO` set. It cleans up in `finally` and on SIGINT, SIGTERM and SIGHUP, and
  exits with the command's code (130/143/129 when interrupted, 2 when the session
  could not be built).
- `tien-de` never runs on the shared database. When `DATABASE_URL` does not name a
  throwaway database — `_do` other than a `__mau_do` template, or a `_gieo` scratch
  database — it re-runs itself inside a session. Every screen eval in
  `_acceptance/config.yaml` goes through it, so a single eval run by a Workflow agent
  or `repin-lane` gets a clean database and its own servers without any change to the
  eval. The ports an eval names (`${APP_URL:-http://localhost:3910}`) are only
  defaults; the session's `APP_URL` wins.

To measure a whole lane in one session — one database, one server start — wrap it:
`bun run do:man --chay "node <feature-loop>/scripts/repin-lane.mjs --root . --slug <s>"`.
Evals inside the lane then share that database the way they shared `crm` before. Wrapping
also keeps the lane's suites off `crm`: `eve build` loads `apps/agent/agent/agent.ts`,
which updates the `install` row at import, so a bare lane still writes that one row to
whatever `DATABASE_URL` names. Evals
that hard-code their ports (`ccq_chup_hai_vai`, `lgo_chup`) do not follow the session.
