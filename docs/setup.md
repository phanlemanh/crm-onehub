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

## Bộ OKR mẫu

Một công ty giả — «Hải Đăng Logistics», 40 người, ba bộ phận, mười phòng ban — đang
chạy OKR ở tuần 6 của quý: OKR năm cấp OneHub, OKR quý 4 mọi phòng ban (đủ sáu kiểu
KR, bảy KR lấy số từ CRM), sáu tuần Cập nhật tuần có KR tụt, KR im và một người chưa
gửi tuần này, một quý 3 đã khép (điểm, điều học được, ba mục tiêu mang sang). Mọi lượt
OKR dựng và đo trên bộ này, để số của hai lượt so được với nhau.

Từ lượt 8a bộ mẫu có thêm phần nằm cạnh KR (khối `canhKr` của `cong-ty.json`, nạp
bởi `okr-mau/nap-canh-kr.ts`): mỗi phòng ban có việc (KR) — ít nhất một việc xong và
một việc chưa, hạn tính theo tuần của quý 4 — bốn bằng chứng trên KR mốc đã xong, bảy
ghi nhận giữa đồng nghiệp, ba mẫu OKR (một cho bộ phận, một cho các phòng kinh doanh,
một cho các phòng hỗ trợ) và hai mục tiêu quý 4 sinh từ mẫu. Bộ mẫu không gắn sáng kiến
nào — nó không có chiến dịch hay kế hoạch 30 ngày; phép đo cần sáng kiến tự gieo qua
thủ tục thật. Nạp lại không nhân đôi hàng nào của sáu bảng mới, `--xoa` gỡ sạch chúng
cùng phần còn lại của bộ mẫu.

Từ lượt hỏi ý mục tiêu bộ mẫu có thêm một chu kỳ năm kế tiếp ở «lập kế hoạch» và một
lần hỏi ý đang gom trên nó (khối `hoiY` của `cong-ty.json`, nạp bởi
`okr-mau/nap-hoi-y.ts`): người chọn `le-hai-dang` đã niêm phong bốn câu, 30 ý của 25
người ở cả ba bộ phận (bốn người vai «chỉ OKR»), 12 lượt đồng ý, bốn chủ đề (hai đã
kết luận), một ý lạ, năm ý chưa gom. Mọi hàng đi qua thủ tục thật của
`OkrHoiYService` với đồng hồ tiêm tiến dần từ mốc `--moc` (mở 6 ngày trước mốc, hạn 24
giờ trước mốc), nên không `--moc` thì hạn đã qua và màn `/okr/hoi-y` ở «đang gom».
Sáu bảng hỏi ý mang mã sinh của cơ sở dữ liệu, không mang `mau-okr-`: `--xoa` tìm
chúng qua chu kỳ và người mẫu.

Cuộc soạn OKR mở trên bộ mẫu — chu kỳ, bộ phận hay phòng ban mẫu, hoặc do người mẫu mở —
cùng các đề xuất của nó cũng đi theo `--xoa` và nạp lại. `okrCuocSoan` không có khoá
ngoại nên lệnh tìm cuộc theo tiền tố `mau-okr-` chứ không theo bộ mẫu đang có: cuộc còn
sót từ một lần xoá trước cũng bị gỡ và được đếm. Hàng chi phí AI (`aiChiPhi`) của các
cuộc đó ở lại: đó là tiền đã tiêu thật, và trần chi phí AI của tháng đọc chúng — xoá đi
thì trần mở lại giả.

Phiên bản cấu hình chương trình OKR (`okrProgramConfig`) mà người mẫu tạo — vd khi
`le-hai-dang` bật Soạn OKR ở Cài đặt → OKR — cũng đi theo `--xoa` và nạp lại. Lệnh tìm
chúng theo người tạo: người mẫu đang có, hoặc mã người bắt đầu `mau-okr-`, nên phiên bản
còn sót từ một lần xoá trước cũng bị gỡ và được đếm. Các phiên bản khác ở lại, chỉ mất mã
bộ phận hay phòng ban mẫu trong danh sách đơn vị được bật AI (vd «Soạn OKR cho các đơn
vị»). Mỗi phiên bản là ảnh chụp trọn cấu hình và sản phẩm đọc phiên bản mới nhất, nên
hệ quả là cấu hình đang dùng lùi về bản cuối trước phiên làm việc với bộ mẫu, hoặc về
mặc định nếu trước đó chưa có bản nào. Cài đặt do người mẫu bật phải bật lại sau mỗi lần
nạp lại.

```sh
bun run okr:mau                      # nạp, hoặc nạp lại — xoá bộ cũ rồi ghi bộ mới
bun run okr:mau --moc 2026-11-12     # ghim ngày: tuần 6 là tuần chứa ngày đó
bun run okr:mau --xoa                # gỡ bộ mẫu, không đụng gì khác
bun run okr:mau --tep <tệp.json>     # nạp một bản công ty khác cùng khuôn
```

Dữ liệu viết tay ở `apps/api/scripts/okr-mau/cong-ty.json`, đọc qua khuôn của chính
sản phẩm (luật số theo kiểu KR, trần mục tiêu, nguồn CRM) trước khi ghi. Không `--moc`
thì tuần 6 là tuần chứa hôm nay theo giờ Việt Nam: «đáng bàn» của họp tuần tính theo
hôm nay, nên bộ ghim lịch cố định sẽ hết KR đáng bàn sau một tuần. Mọi hàng của bộ
mẫu có mã bắt đầu `mau-okr-`; người mẫu có thư đuôi `@mau.onehub.test`.

Lệnh từ chối và trả mã riêng cho từng ca:

- **mã thoát 2** — `DATABASE_URL` không trỏ máy cục bộ (`localhost`, `127.0.0.1`,
  `::1`, hoặc ổ cắm unix) — kể cả máy chủ nêu trong tham số `host` hay `hostaddr` của
  chuỗi kết nối, vì driver Postgres dùng chúng thay cho tên máy — hoặc `NODE_ENV=production`, hoặc `VERCEL_ENV` là `production` hay
  `preview`. Chặn trước khi mở kết nối, và **không có cờ vượt** — `ALLOW_REMOTE_DB`
  không có tác dụng ở đây. `VERCEL_ENV=development` do `vercel env pull` ghi không bị
  chặn; máy chủ cục bộ mới là điều kiện.
- **mã thoát 3** — kho đã có chu kỳ, mục tiêu hay KR không thuộc bộ mẫu. Bộ mẫu không
  trộn vào OKR thật; dùng một kho đo riêng.
- **mã thoát 4** — tham số sai (`--moc` không phải ngày), tệp công ty sai khuôn (lệnh
  nêu đúng trường hỏng), hoặc kho chưa có workspace — workspace sinh ở lần đăng nhập
  đầu, `db:seed` không tạo nó.
- **mã thoát 5** — `--xoa` hay nạp lại gặp dữ liệu ngoài bộ mẫu đang trỏ vào người hay
  đơn vị mẫu (vd một thoả thuận giao cho người mẫu). Không hàng nào đổi; gỡ liên kết
  đó rồi chạy lại.

Xoá đi theo quan hệ: lần cập nhật, phiên, vết và phiên đăng nhập mà sản phẩm ghi lên
người, KR hay chu kỳ mẫu sau khi nạp cũng đi theo.

**Đăng nhập làm người mẫu:** `cd apps/api && bun run dev:session nguyen-thi-lan@mau.onehub.test`
(trưởng Kinh doanh miền Bắc), `le-hai-dang@…` (quản trị), `an-khanh-linh@…` (trưởng
Pháp chế, vai «chỉ OKR», chưa gửi Cập nhật tuần này).

**Trong phiên đo:** kho mẫu của phiên đo (`crm_<cây>__mau_do`) không có bộ mẫu — các
thước đã ký cần kho không có chu kỳ. Lượt nào cần thì nạp trong tiền đề của nó:
`bun run do:man --chay "bun run okr:mau && <lệnh đo>"`.

**Bản xem trước không có bộ mẫu:** preview dùng chung cơ sở dữ liệu và api với
production (mục dưới), nên nạp vào đó là nạp vào production. Bản xem trước có bộ mẫu
khi nó có cơ sở dữ liệu và api riêng.

**Ca góp ý của Trợ lý OKR:** 30 ca mẫu ở `apps/agent/evals/okr/ca-gop-y/mau/`, mỗi tệp
một ca, khuôn `@crm/validation/okr-ca-gop-y`. Ca thật của N1 — OKR thật đã thay tên —
đặt ở `apps/agent/evals/okr/ca-gop-y/that/`, thư mục bị git bỏ qua; eval đọc cả hai
bằng `docBoCaGopY(<thư mục>)`, nên đổi mẫu sang thật chỉ là đổi thư mục.

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

The OKR drafting chat has its own pair, `OKR_AGENT_URL` (default `127.0.0.1:2100`)
and `OKR_AGENT_BRIDGE_SECRET`, and its own gate at `/eve/agents/okr/eve/v1/*`; the
same three errors apply to the «Soạn OKR cùng Trợ lý» screen, with `apps/agent-okr`
in place of the agent. Run it with `bun run --filter=agent-okr dev` (port 2100).

`localDev()` accepts any loopback request, so `curl 127.0.0.1` proves nothing about
the bridge — send `-H 'Host: agent.example.com'`. `GET /eve/v1/info` is the whole
inventory, including a `diagnostics` count that finds files eve silently ignored.

## Deploying `apps/agent-okr` to Vercel

OKR drafting runs on its own eve deployment. The app decides whether drafting is on
from one thing only: `OKR_AGENT_BRIDGE_SECRET` in the app's process. While it is empty,
the gate answers `503 chua-cau-hinh-tro-ly-okr`, the «By unit» toolbar shows a locked
drafting button with «Drafting isn't turned on for this server yet», and no session is
opened or counted.

Once the secret is set the button opens sessions, and the gate counts the turn before
it forwards it. A wrong or missing `OKR_AGENT_URL` then answers `502`, and secrets that
differ between the two projects answer `401` — both after the turn is counted, so every
try burns a turn and the session counts against the unit's three. Set the app's secret
last, after the steps below prove the agent answers. Creating the project and setting
the secrets is the repository owner's job — this section is the checklist, in order.

### Project settings

Copy the shape of `crm-onehub-agent` (`vercel project inspect crm-onehub-agent`):

| Setting | Value |
| --- | --- |
| Root Directory | `apps/agent-okr` |
| Framework preset | Other |
| Build Command | `bun run build` |
| Node.js Version | 24.x |
| Ignored Build Step | empty |
| Preview deployments | off, by `apps/agent-okr/vercel.json` |

**Preview deploys are turned off in `apps/agent-okr/vercel.json`.** Its
`git.deploymentEnabled` sets `"**": false` and `"onehub": true`: only a push to
`onehub` deploys, so pull requests show no agent-okr check at all. The pattern is
`**`, not `*` — Vercel matches branch names with minimatch, where `*` stops at a `/`,
and every working branch here has one. A branch that matches both patterns deploys,
because one `true` is enough. `apps/agent-okr/test/vercel-trien-khai.spec.ts` holds
the rule to a table of branch names.

A preview would have nothing to do anyway: the project's variables are
Production-only, so a preview build dies in `prisma generate` on the missing
`DATABASE_URL`, and nothing calls it — the app's `OKR_AGENT_URL` and bridge secret
are Production-only too. `acceptance.yml` already proves the package builds.

Do not use the Ignored Build Step `[ "$VERCEL_ENV" != "production" ]` for this. On
2026-10-04 it skipped the Production deploys as well, with no build log, and two
merges never reached agent-okr.vercel.app. After any change to `vercel.json` or the
build settings, merge or deploy `onehub` to Production and check the deployment made
from git is Ready, not Canceled.

### agent-okr project

Exactly the variables `apps/agent-okr/turbo.json` passes to `dev`:

| Variable | What it does |
| --- | --- |
| `OKR_AGENT_BRIDGE_SECRET` | Verifies the two-minute token the app's OKR gate signs. |
| `AI_GATEWAY_API_KEY` | Model access when `OKR_AI_GATEWAY_API_KEY` is absent; without either, Vercel OIDC is used. |
| `OKR_AI_GATEWAY_API_KEY` | The OKR-only Gateway key, billed and capped apart from the record agent. |
| `DATABASE_URL` | Production database; the `nop_ban_nhap` tool writes draft lines and cost rows there. |

### app project

Deploy the agent-okr project first and check `GET <its URL>/health` (see Check). Then
add to `crm-onehub-app` in this order — `OKR_AGENT_URL` first, the secret last — and
redeploy; the app reads both at start:

| Variable | Value |
| --- | --- |
| `OKR_AGENT_URL` | The production URL of the new project. |
| `OKR_AGENT_BRIDGE_SECRET` | The same value as the agent-okr project (`openssl rand -base64 32`). |

### Check

1. Before touching the app project: `GET <agent-okr URL>/health` answers JSON with a
   `cay` field. On Vercel it is `{"cay":null}` — there is no git checkout to name — and
   that is the healthy answer; a 404 or a timeout means the deployment is not up.
2. After the app's redeploy: on «By unit», a unit head in a planning-phase cycle sees
   «Draft OKRs with the Assistant» enabled, and opening a session gets an answer. A
   `401` or `502` here is a mismatched secret or URL — fix it before anyone else tries,
   since each try counts.

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
  A template carries the measure-session `COMMENT` from the moment it is created, before
  `migrate deploy` and the seed: first a building mark
  (`crm phien do template-building created …`), replaced by the template mark when the
  seed finishes. A building template is never cloned; the next `--tao` of the tree
  rebuilds it.
- `bun run db:do --xoa` drops the tree's measure database. It refuses a name that does
  not end in `_do`, and one without the measure-session `COMMENT`.
- `bun run db:do --quet` drops every marked measure database and template with no
  connection whose last touch — creation, or the last clone for a template — is older
  than `MEASURE_DATABASE.maxAgeMs` (12 hours). Every `--tao` runs the same sweep,
  so a database left by a killed run goes on a later one — including a template whose
  build was killed during `migrate deploy` or the seed, which still carries its building
  mark. A kill that lands between `CREATE DATABASE` and the `COMMENT` (one round trip;
  Postgres refuses both in one transaction) can still leave a database with no mark, and
  so can any run from before 07/10/2026, when templates were marked only after the seed.
  The sweep never drops an unmarked database: drop those by hand with `DROP DATABASE`.
  Rules and constants: `packages/db/src/measure-database.ts`.
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
- The session's API runs under `bun --watch`. A measurement that plants a fault in API
  code to prove a ruler still goes red (a mutation run) sees the API reload with the
  fault in place, and again when the fault is removed. Without it the API keeps the code
  it started with, and a planted fault in the API is never measured.
- `PHIEN_DO_CUA_CHAN=<file>` puts a blocking proxy between the app and the API. The
  session starts `<file>` (a path from the repo root, today
  `_acceptance/cap-nhat-tuan-okr/rang/cua-chan.mjs`) on a third free port with
  `CUA_CHAN_PORT` and `CUA_CHAN_NANG` (the API it forwards to), waits for
  `/__cua-chan/trang-thai`, points both `API_URL` and `NEXT_PUBLIC_API_URL` of the app at
  it, and gives the command `CUA_CHAN_URL`. The ruler then makes one tRPC procedure
  return 500 to show an error state rendered by the server, which interception in the
  browser cannot reach. The command's own `API_URL` still names the API directly. The
  screen evals of cap-nhat-tuan-okr and toan-canh-okr use it; before this option they
  needed dev servers started by hand on fixed ports and a fixed `_do` database.
- `tien-de` never runs on the shared database. When `DATABASE_URL` does not name a
  throwaway database — `_do` other than a `__mau_do` template, or a `_gieo` scratch
  database — it re-runs itself inside a session. Every screen eval in
  `_acceptance/config.yaml` goes through it, so a single eval run by a Workflow agent
  or `repin-lane` gets a clean database and its own servers without any change to the
  eval. The ports an eval names (`${APP_URL:-http://localhost:3910}`) are only
  defaults; the session's `APP_URL` wins.
- A measurement that needs a chat agent boots it itself, inside the session.
  `_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs` does this for `apps/agent`: it
  picks a free port, sets `AGENT_URL` and `AGENT_BRIDGE_SECRET` **before** starting the
  session under a sibling tree name (`<tree>-tro-ly`), because the app reads those
  variables once at start, then starts `apps/agent` on that port. The app is checked
  with `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`.
- The session also boots `apps/agent-okr`, the OKR drafting agent, when a measurement
  needs it: `_acceptance/soan-okr-cung-tro-ly/rang/phien-soan.mjs`. `chayTrongPhienSoan`
  asks the operating system for a free port (port 0, not the 4100–4899 range), sets
  `OKR_AGENT_URL` and a fresh `OKR_AGENT_BRIDGE_SECRET` **before** the session starts,
  and runs it under the sibling tree name `<tree>-soan`: when `tien-de` wrapped the
  command, a session of `<tree>` already holds that tree's lock, so reusing the name
  would wait on itself. `batAgentOkr` then starts `eve dev --no-ui` of `apps/agent-okr`
  on that port with `NODE_ENV=development` (under `test` eve swaps the real model for
  its mock) and the session's `DATABASE_URL`, so cost rows (`AiChiPhi`) land in the
  measure database and vanish with it. It prints the Node version first and refuses
  one below 24. `apps/agent-okr` answers `GET /health` with `cay`, and the ruler
  compares it with its own `treeSlug(currentTree())`: an agent on that port started by
  another tree or session is exit 2 naming both, not a measurement. The drafting-screen
  ruler `rang/man-soan.mjs` uses it; the isolation ruler `rang/cach-ly-chi-okr.mjs`
  (task E1) is meant to reuse it rather than boot its own.

To measure a whole lane in one session — one database, one server start — wrap it:
`bun run do:man --chay "node <feature-loop>/scripts/repin-lane.mjs --root . --slug <s>"`.
Evals inside the lane then share that database the way they shared `crm` before. Wrapping
also keeps the lane's suites off `crm`: `eve build` loads `apps/agent/agent/agent.ts`,
which updates the `install` row at import, so a bare lane still writes that one row to
whatever `DATABASE_URL` names. Evals
that hard-code their ports (`ccq_chup_hai_vai`, `lgo_chup`) do not follow the session.
