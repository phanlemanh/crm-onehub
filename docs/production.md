# Production

Bản đồ production của kho này, cho mọi phiên máy: thợ, giám sát, phiên lẻ. Đọc
trước khi viết «đã lên production», trước khi nói nguyên nhân một lỗi production,
và mỗi khi Vercel MCP trả 403. Cách xem nhanh theo sha hay theo khung giờ nằm ở
skill `.agents/skills/production/SKILL.md`.

Mọi việc ở đây là **chỉ đọc**. Không `vercel env pull`, không in giá trị bí mật,
không redeploy, promote, rollback, không sửa biến hay cài đặt dự án. Những việc đó
là của chủ kho.

Số liệu trong tệp đo ngày 08/10/2026 bằng Vercel CLI 54.5.1 và `gh` trên Mac mini.
Sự thật đổi theo ngày: thấy lệch thì đo lại và sửa tệp này trong cùng PR.

## Bốn dự án Vercel, một team

Team `phanlemanh-8330s-projects` (`team_Y2xHDdP6Pp5IjjK9g1fQk09l`). Cả bốn dự án
nối git `phanlemanh/crm-onehub`, nhánh production là `onehub`, Node 24.x. Team còn
`plm-app`, `openmaic`, `rap`… — không phải của kho này.

| Dự án | Mã | Thư mục gốc · lệnh build | Tên miền production |
| --- | --- | --- | --- |
| `crm-onehub-app` | `prj_0Mhz08dbKE7Q1VM5n4p8dF1aiLTv` | `apps/app`, Next.js | `www.onehub.center`, `onehub.center` |
| `crm-onehub-api` | `prj_V3RLbefrPk9E1lAmTJXGxUiUd7b6` | gốc kho, `node apps/api/scripts/build-func.mjs` | `crm-onehub-api.vercel.app` |
| `crm-onehub-agent` | `prj_lkAK6nt596OFh4jlGSydyazwKCZj` | `apps/agent`, `bun run build` (eve) | `crm-onehub-agent.vercel.app` |
| `agent-okr` | `prj_5a1UZt07Z4SnyHlnXaKgQEvvRYkB` | `apps/agent-okr`, `bun run build` (eve) | `agent-okr.vercel.app` |

### App nào nhận gì

- **`crm-onehub-app`** — giao diện. `apps/app/app/api/[...path]` chuyển `/api/*`
  sang API; cổng `/eve/agents/okr/eve/v1/*` chuyển sang `agent-okr`; tab Agent đi
  qua cầu nối tới `crm-onehub-agent`. `/` trả 307 về đăng nhập, vì `IS_MARKETING`
  không đặt.
- **`crm-onehub-api`** — tRPC `/api/trpc/*` và `/api/auth/*` (log ghi tên miền
  `crm-onehub-api.vercel.app`), bộ thu tracking `POST /api/t/e`, hai điểm nhận máy
  `POST /internal/listings/ingest` và `POST /internal/onboarding/ingest`
  (`docs/api.md`), `GET /health`, năm cron, và `prisma migrate deploy` lúc build.
- **`crm-onehub-agent`** — webhook Zalo, lịch eve mỗi phút, các đường
  `/internal/crm/*` mà API gọi khi có việc mới, cầu nối Zalo `/internal/zalo/*`.
- **`agent-okr`** — trò chuyện soạn OKR. Preview tắt bằng
  `apps/agent-okr/vercel.json` (`docs/setup.md`, mục «Deploying `apps/agent-okr`»).

### Cron

| Gọi tới | Lịch (UTC) | Khai ở |
| --- | --- | --- |
| API `/internal/sync/mailboxes` | `*/5 * * * *` | `apps/api/vercel.json` |
| API `/internal/sync/rates` | `0 6 * * *` | `apps/api/vercel.json` |
| API `/internal/telemetry/rollup` | `0 7 * * *` | `apps/api/vercel.json` |
| API `/internal/tracking/retention` | `0 4 * * *` | `apps/api/vercel.json` |
| API `/internal/archive/prune` | `0 5 * * *` | `apps/api/vercel.json` |
| Agent `/eve/v1/cron/<mã>` | `* * * * *` | `apps/agent/agent/schedules/dispatch.ts` |

Cron của API cần `CRON_SECRET` và gọi vào địa chỉ của chính deployment
(`crm-onehub-8wvb2myqd-…vercel.app`), không qua tên miền. Nhịp mỗi phút của agent
chạy dispatch, lên lịch nhắc, kiểm bot Zalo (`kiemBot`), đóng các phiên quá hạn. Ngoài cron, API
gọi `/internal/crm/dispatch`, `/agent-dispatch`, `/builder-dispatch` mỗi khi xếp
việc (`apps/api/src/agent/agent-trigger.service.ts`).

### Webhook Zalo

Tin nhắn Zalo vào bằng `POST /zalo/webhook` trên agent. Request tới đường này đến
qua tên miền `crm-onehub-agent.vercel.app` (trường `domain` của log ngày 06/10 và
08/10). Agent tự đăng ký địa chỉ với Zalo bằng `setWebhook` khi quản trị dán token ở
Kết nối › Zalo, và ghi địa chỉ đó vào `AppSetting.zaloWebhookUrl`
(`docs/connections.md`).

`apps/agent/agent/lib/zalo-webhook.ts` trả lời:

| Mã | Khi nào | Có dòng log không |
| --- | --- | --- |
| 404 | `AppSetting` không có token hoặc khoá webhook | không |
| 403 | header `x-bot-api-secret-token` không khớp khoá đã lưu | **không** |
| 500 | xử lý tin hỏng | có, `[zalo] …` |
| 200 | nhận xong, hoặc thân sai khuôn (ghi `webhook sai khuon`) | tuỳ nhánh |

403 không để lại dòng nào, chỉ thấy qua mã trạng thái trong log request.

## Từ gộp tới production

Gộp vào `onehub` là lên production, cả bốn dự án, không có bước tay. Ngày 08/10,
merge `591bc8fb` tạo bốn deployment lúc 09:47:14Z; `agent-okr` Ready 09:47:47Z,
API 09:47:57Z, app 09:48:45Z, agent 09:49:46Z.

**Migration chạy trong build của API**, chỉ khi `VERCEL_ENV=production`
(`apps/api/scripts/build-func.mjs`). Build log của API có đúng bốn dòng cần đọc:

```text
• applying migrations (prisma migrate deploy)...
No pending migrations to apply.        ← hoặc các dòng «Applying migration …»
✓ migrations applied
✓ schema matches                        ← migrate diff so với schema.prisma
```

`No pending migrations` chỉ nói bảng `_prisma_migrations` đủ dòng; `✓ schema
matches` mới nói bảng thật khớp `schema.prisma` (`docs/setup.md`, mục «`migrate
deploy` is not proof»).

`docs/setup.md` mục «Migrations run on the production deploy» kể theo luồng của
hãng, nơi `release` lên production. Ở kho này nhánh production là `onehub` — đo từ
`link.productionBranch` của cả bốn dự án.

**Preview.** Mỗi lần đẩy một nhánh, app, API và agent dựng bản Preview (GitHub ghi
`Preview – crm-onehub-*`). `agent-okr` không dựng. Preview dùng chung cơ sở dữ
liệu với production (`docs/setup.md`), nên bản Preview của một nhánh có migration
mới chạy trên bảng chưa có migration đó.

**Biến mới phải đặt trên Vercel rồi triển khai lại** — biến chỉ vào những
deployment dựng sau lúc đặt. Đặt biến là việc của chủ kho.

## Biến môi trường production — chỉ tên

Đọc tên và đích, không bao giờ đọc giá trị:

```bash
vercel api "/v10/projects/crm-onehub-api/env?teamId=team_Y2xHDdP6Pp5IjjK9g1fQk09l" \
  --method GET | jq -r '.envs[] | "\(.key)\t\(.target|join(","))\t\(.type)"' | sort
```

Lệnh này không cần `vercel link`, nên không để lại `.vercel/` trong cây. `vercel env
ls` thì cần một thư mục đã link. Biến chung của team: không có (08/10).

| Dự án | Biến trên Production (08/10) |
| --- | --- |
| `crm-onehub-app` | `AGENT_BRIDGE_SECRET` `AGENT_URL` `API_URL` `APP_URL` `BETTER_AUTH_SECRET` `DATABASE_URL` `NEXT_PUBLIC_API_URL` `OKR_AGENT_BRIDGE_SECRET` `OKR_AGENT_URL` `POSTGRES_URL_NON_POOLING` |
| `crm-onehub-api` | `AGENT_BRIDGE_SECRET` `AGENT_URL` `ALLOWED_SIGN_IN` `API_URL` `APP_URL` `BETTER_AUTH_SECRET` `CRON_SECRET` `DATABASE_URL` `DATABASE_URL_UNPOOLED` `GOOGLE_CLIENT_ID` `GOOGLE_CLIENT_SECRET` `KHO_TAI_LIEU_BLOB_TOKEN`, cộng bộ biến Neon (`NEON_*`, `PG*`, `POSTGRES_*`, `VITE_NEON_AUTH_URL`) |
| `crm-onehub-agent` | `AGENT_BRIDGE_SECRET` `API_URL` `APP_URL` `DATABASE_URL` `KHO_TAI_LIEU_BLOB_TOKEN` `POSTGRES_URL_NON_POOLING` |
| `agent-okr` | `OKR_AGENT_BRIDGE_SECRET` `OKR_AI_GATEWAY_API_KEY` `DATABASE_URL`, cộng bộ biến Neon |

App, API và agent có thêm một bản Preview của phần lớn các biến trên.

### Vắng trên production, và vắng thì mất gì

Vắng không có nghĩa là sai: nhiều dòng dưới đây là chủ ý, và có việc chủ kho làm
tay trên màn production mà kho không thấy. Trước khi báo «chưa bật», hỏi chủ kho.

| Biến | Dự án đọc | Vắng thì |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | agent | không sao — model chạy bằng Vercel OIDC |
| `ZALO_BOT_TOKEN`, `ZALO_WEBHOOK_SECRET` | agent | không sao — token và khoá sống trong `AppSetting`, dán ở Kết nối › Zalo |
| `IS_MARKETING` | app | người lạ ở `/` về trang đăng nhập (chủ ý) |
| `BLOB_READ_WRITE_TOKEN` | API, agent | không lưu logo hay ảnh đại diện; log agent ghi `[agent] off  Picture storage` |
| `KHO_TAI_LIEU_AI_GATEWAY_API_KEY` | agent | Kho tài liệu (máy soạn, trợ lý kho) dùng chung khoá model; log ghi `[agent] off  Document library key` |
| `OKR_AI_GATEWAY_API_KEY` | agent | phần Trợ lý OKR chạy trong agent chính (góp ý, tóm tắt tuần) dùng chung khoá model; `agent-okr` có khoá riêng |
| `PERPLEXITY_API_KEY` | agent | không tìm trên web; log ghi `[agent] off  Web research` |
| `GITHUB_TOKEN` | agent | GitHub giới hạn 60 lượt mỗi giờ |
| `GOOGLE_SHEETS_EMAIL` + `GOOGLE_SHEETS_KHOA` | API, agent | KR không lấy số từ Google Sheets (`docs/environment.md`) |
| `MICROSOFT_CLIENT_ID` + `_SECRET` | API | không nút đăng nhập Microsoft, không đọc thư Outlook |
| `SLACK_CLIENT_ID` + `_SECRET` | API | không nối Slack ở Kết nối |
| `RESEND_API_KEY` + `MAIL_FROM` | API | cửa quên mật khẩu tự ẩn |
| `LISTING_INGEST_SECRET` | API | `/internal/listings/ingest` trả 503 |
| `ONEHUB_PLATFORM_INGEST_SECRET` | API | `/internal/onboarding/ingest` trả 503 |
| `REDIS_URL` | API | cache riêng từng instance |

Agent tự in danh sách năng lực đang bật ở dòng `[agent] on …` / `[agent] off …`
(`apps/agent/agent/lib/capabilities.ts`). Đọc nó cẩn thận — xem «Bẫy đã gặp».

## Bản chụp lộ trình

Workflow `ban-chup-lo-trinh.yml` chạy mỗi lần một lần gộp vào `onehub` đổi `LO-TRINH.html` (và
chạy tay được bằng `workflow_dispatch`). Nó đẩy khối lộ trình sang API production; trang Lộ trình
hiện bản đó trong khoảng một phút, không cần dựng lại.

Cài một lần (việc của chủ kho):

1. Cài đặt › Khoá API › Tạo khoá, loại «Đẩy lộ trình».
2. Đặt bí mật kho `CRM_KHOA_DAY_LO_TRINH` = khoá vừa tạo (`CRM_API_URL` đã có từ đường kéo tín hiệu).
3. Chạy workflow bằng tay một lần để có bản chụp đầu.

Mỗi lượt để lại đúng một ghi chú `ban-chup-lo-trinh` với kết quả `nhan`, `trung`, `cu-hon` hay
`chua-cai`. `chua-cai` là lượt xanh mà chưa đẩy gì — trang vẫn đọc bản dựng và dòng giờ lấy ghi
«(bản dựng)». Lượt đỏ là CRM từ chối hay không trả lời; log của bước «Đẩy bản chụp» in lý do.

Đo độ trễ (Cổng Giá trị của LT1c): `bun scripts/ban-chup-lo-trinh/do-tre.ts --tu <YYYY-MM-DD>`.

## Kho Blob

```bash
vercel blob list-stores --scope phanlemanh-8330s-projects
```

| Store | Mã | Vùng | Quyền | Nối dự án | Biến đọc |
| --- | --- | --- | --- | --- | --- |
| `kho-tai-lieu-nguon` | `store_zgOE12htUMHEZvJf` | sin1 | private | không | `KHO_TAI_LIEU_BLOB_TOKEN`, đặt tay trên API và agent |
| `onehub-crm-blob` | `store_v9t7MH66DfPN7Zeb` | iad1 | public | không | `BLOB_READ_WRITE_TOKEN` — chưa đặt trên production |

- **Đừng «Connect Project» store private.** Vercel sẽ tự đặt `BLOB_READ_WRITE_TOKEN`
  bằng khoá private, rồi logo bị ghi vào kho private (`docs/environment.md`).
- 08/10: store private có 1 tệp (36 KB) — lần ghi private đầu tiên trên production
  đã xảy ra. Store public có 32 tệp, nhưng production không có khoá để ghi thêm.

## Đọc trạng thái triển khai theo sha

```bash
SHA=$(git rev-parse origin/onehub)
gh api "repos/phanlemanh/crm-onehub/deployments?sha=$SHA" \
  --jq '.[] | "\(.id)\t\(.environment)"' |
while IFS=$'\t' read -r id env; do
  printf '%s\t%s\n' "$env" "$(gh api "repos/phanlemanh/crm-onehub/deployments/$id/statuses" \
    --jq '.[0] | "\(.state)\t\(.created_at)"')"
done
```

Một sha đã gộp có bốn dòng `Production – <dự án>`, mỗi dòng `success` khi Ready.
Gọn hơn: `gh api "repos/phanlemanh/crm-onehub/commits/$SHA/status"` cho bốn
context `Vercel – <dự án>`.

Phía Vercel, kèm địa chỉ deployment để đọc build log:

```bash
vercel ls crm-onehub-api --scope phanlemanh-8330s-projects --environment production \
  -m githubCommitSha="$SHA" --format json |
  jq -r '.deployments[] | [.url, .state, (.createdAt/1000|todate)] | @tsv'
vercel inspect <url> --scope phanlemanh-8330s-projects --logs 2>&1 |
  grep -E 'migrat|schema matches|Build Completed|Error'
```

`vercel inspect --logs` in build log ra **stderr**, nên phải `2>&1`.

Điểm sống không cần khoá: `GET https://crm-onehub-api.vercel.app/health` →
`{"status":"ok","database":"up"}`; `GET https://agent-okr.vercel.app/health` →
`{"cay":null}` (đúng — trên Vercel không có cây git để gọi tên). `GET
/internal/crm/dispatch-health` của agent cần khoá cầu nối, không gửi khoá thì 401;
đừng chép khoá ra để gọi nó.

## Đọc nhật ký

```bash
vercel logs -p crm-onehub-agent --scope phanlemanh-8330s-projects \
  --environment production --no-branch \
  --since 2026-10-08T09:40:00Z --until 2026-10-08T09:55:00Z --json --limit 100
```

Mỗi dòng JSON là một request: `timestamp` (ms), `requestMethod`, `requestPath`,
`responseStatusCode`, `level`, `domain`, `deploymentId`, `message` và `logs[]`.
**`message` chỉ là dòng đầu tiên; mọi dòng request đó in ra nằm trong
`logs[].message`**, mỗi dòng có `level` riêng.

- **Luôn `--no-branch`.** Không có cờ đó, CLI lọc theo nhánh git đang đứng, và
  production trả rỗng.
- **Mới nhất trả trước, mặc định 100 dòng.** Agent có cron mỗi phút và dispatch
  liên tục, nên cửa sổ rộng bị lấp. Thu hẹp `--since`/`--until`, hoặc lọc:
  `--query "<chữ>"` (tìm toàn văn, vd `--query "/zalo/webhook"`),
  `--status-code 5xx` (hay `4xx`, `403`), `--level error`.
- **`--level error` của agent phần lớn là lời thuật.** `apps/agent/agent/hooks/activity.ts`
  in mọi dòng `[agent] <dấu> …` ra stderr, và Vercel gắn stderr mức `error`. Sáu
  dấu là tiếng ồn: `→` gọi công cụ, `✓` công cụ xong, `»` `◂` chữ vào ra, `·` một
  bước kèm số token và tiền, `▸` mở phiên. Hai dấu là lỗi thật: `✗` công cụ hỏng,
  `⨯` bước, lượt hay phiên hỏng, kèm mã eve (vd `MODEL_CALL_FAILED`).
- **Cảnh báo SSL của `pg`** (`SECURITY WARNING: The SSL modes 'prefer', 'require',
  and 'verify-ca' …`) lặp ở mọi lần khởi động lạnh của app, agent và `agent-okr`.
  Không phải lỗi.
- **Đọc lùi được khoảng ba tuần.** Đo 08/10: còn log ngày 15/09, không còn ngày
  08/09.
- Vercel MCP có `get_runtime_errors` gộp cụm lỗi; CLI không có lệnh tương đương,
  nên skill production gộp bằng `jq | sort | uniq -c`.

### Tìm gì ở từng dự án

| Dự án | Dòng đáng tìm |
| --- | --- |
| app | `[prisma:error]`, `[Better Auth]`, request 5xx |
| API | build log (migrate), `/internal/sync/*` của cron, `/api/trpc/<thủ tục>` 5xx |
| agent | `[agent] on`/`off` (năng lực), `[agent] ✗` và `[agent] ⨯` (hỏng), `[zalo]`, `[eve:dynamic-tools]`, `could not read`, `budget exceeded`, `insufficient_funds` |
| agent-okr | request tới `/eve/v1/*` và mã trạng thái của chúng |

### Nói nguyên nhân thì kèm dòng log

Mọi nguyên nhân báo ra phải kèm (1) dòng log nguyên văn, (2) dự án và
`deploymentId` hay tệp, (3) giờ UTC. Không có dòng đó thì nói «chưa rõ nguyên
nhân», giữ lại log trước khi chạy lại. Ngày 05/10 một câu «đỏ vì AI Gateway trả
402» không có dòng nào làm căn cứ, sống qua bản tóm tắt phiên thành «sự thật», và
chủ kho phải tự đi kiểm số dư.

## Vercel MCP và Vercel CLI

CLI trên Mac mini đăng nhập bằng `phanlemanh-8330`, chủ (Owner) của team, nên thấy
cả bốn dự án. Vercel MCP (plugin `vercel-plugin`) thì không, đo 08/10:

| Lời gọi MCP | Kết quả |
| --- | --- |
| `list_teams` | thấy team `phanlemanh-8330s-projects` |
| `list_projects` của team đó | chỉ `plm-app` |
| `get_project crm-onehub-agent` | 404 «Project not found» |
| `get_runtime_errors` cho `prj_lkAK6nt596OFh4jlGSydyazwKCZj` | 403 «does not exist or you do not have access» |
| `get_auth_user` (`/v2/user`) | 404 «User not found» |

Các kết quả này khớp với một lần cấp quyền OAuth chỉ mở dự án `plm-app`: quyền cấp
cho team thì dùng được, quyền theo dự án chỉ phủ dự án đã chọn, còn `/v2/user` thì
token không với tới. **403 từ MCP không có nghĩa là máy không thấy production** —
dùng CLI. Muốn MCP thấy, chủ kho cấp quyền lại cho kết nối MCP và chọn đủ bốn dự
án; máy không tự đổi.

## Chép việc cần làm cũ sang Việc (hàng DA1b)

Việc của chủ kho, chạy MỘT lần ngay sau khi bản gộp DA1b lên production. Lệnh đọc `DATABASE_URL`; trỏ nó vào
cơ sở dữ liệu production trên máy của chủ kho. Lệnh ghi (`--chay`, `--dao`) từ chối mọi kho không phải máy
cục bộ khi thiếu `ALLOW_REMOTE_DB=1`; lệnh đếm không ghi gì nên không cần cờ.

**Thứ tự lên.** Đợi deployment của `crm-onehub-api` có `✓ schema matches` (migration
`chep_viec_can_lam` thêm `viec.activityGocId`, `viec.khoaNguon`) rồi mới chạy lệnh. App hay agent của bản
mới nhận lượt trước khi migration xong thì lời đọc dòng thời gian và việc mã môi giới lệch lỗi trong vài
phút đó.

1. Đếm: `bun run viec:chep-cu` — ghi lại `taskTong`, `chuaChep`, `nguoiTaoKhongNhan`.
2. Chạy thử: `ALLOW_REMOTE_DB=1 bun run viec:chep-cu --chay --thu --nguoi <email của một quản trị>` — chép trọn
   trong một giao dịch rồi huỷ; `loi` phải rỗng.
3. Chạy thật: `ALLOW_REMOTE_DB=1 bun run viec:chep-cu --chay --nguoi <email của một quản trị>`. Việc đang mở mà
   người tạo không còn nhận được việc (vai «chỉ OKR», đã rời) về tay quản trị này; vết ghi người tạo gốc.
4. Đếm lại, dán hai bản in của bước 1 và 4 vào #375.

**Đọc ngưỡng.** Vế một: `banChep` sau bằng `taskTong` trước, và `taskTong` sau bằng `taskTong` trước (bản gốc
còn đủ). Vế hai, 14 ngày sau ngày gộp: `bun run viec:chep-cu --tu <ngày gộp, ISO>` — `taskTaoSau` phải là 0.

**Đảo.** Chỉ dữ liệu: `ALLOW_REMOTE_DB=1 bun run viec:chep-cu --dao` xoá mọi bản chép chưa ai đổi; bản đã đổi
được in ở `giuLai` và chỉ xoá khi thêm `--ca-ban-da-doi`. Việc cũ tự hiện lại, chỉ đọc. Lùi cả mã về trước
DA1b: chạy `--dao` TRƯỚC — lùi mã khi bản chép còn thì một việc hiện hai lần (hàng gốc có ô tích ở dòng thời
gian, bản chép ở Việc của tôi và tin nhắc) và việc mã môi giới lệch đời cũ giao trùng. Hai cột mới để lại vô
hại cho mã cũ.

## Bẫy đã gặp

- **«Máy này không thấy production» (08/10).** Một phiên giám sát kết luận thế vì
  MCP trả 403. CLI đọc được từ đầu.
- **Dòng `[agent] off …` không phải lúc nào cũng đúng.** Ngày 08/10 agent in
  `[agent] off  Zalo reminders` ngay sau `[agent] could not read the Zalo bot token:
  … Client network socket disconnected before secure TLS connection was
  established`, rồi một phút sau in `on`. Cùng ngày nó in `[agent] off  AI model
  (AI_GATEWAY_API_KEY or Vercel OIDC)`, trong khi các lượt vẫn gọi model và trả tiền
  (`[agent] · step 0 tool-calls  in 17.3k out 119 $0.0445`). Vì sao dòng năng lực
  model báo `off` thì chưa đo. Đọc dòng ngay trước nó, và đọc một lượt thật, trước
  khi kết luận một năng lực đang tắt.
- **`off  Zalo reminders (ZALO_BOT_TOKEN)` không có nghĩa bot tắt.** Token dán trên
  màn nằm trong `AppSetting`; biến môi trường chỉ là đường lùi.
- **Zalo hỏng im lặng 30/09 → 08/10, và 403 ở `/zalo/webhook` không để lại dòng
  log** (xem bảng ở trên). Log agent: 200 đều tới `2026-09-30T09:16:17Z`, ngay sau
  hai lần `POST /internal/zalo/bot` (Lưu bot) lúc 08:48:03Z và 09:15:48Z; rồi sáu
  ngày không request nào; rồi 403 lúc `2026-10-06T03:41:43Z` và
  `2026-10-08T07:13:35Z`; Lưu bot lại lúc `2026-10-08T11:01:36Z` thì 200 trở lại.
  Lời giải thích của thợ P5 khớp cả ba đoạn: ngày 30/09 bot được Lưu bằng token của
  một bot khác, `datBot` sinh khoá webhook mới cho bot mới, còn bot cũ vẫn giữ
  webhook trỏ về production với khoá cũ — người dùng nhắn bot cũ thì ra 403. Zalo
  không gửi mã bot trong webhook, nên máy chưa chứng được đó là bot cũ. Bài học:
  Lưu bot sang token khác là đổi bot, và màn không nói gì.
- **Kết nối cơ sở dữ liệu chập chờn.** 24 giờ tới 08/10 10:00Z: ở app chín dòng
  `[prisma:error] Invalid prisma.session.findFirst() invocation: Database error.
  Code: 08P01. Message: Authentication timed out`, ba dòng `Connection terminated
  unexpectedly`, cộng `Client network socket disconnected before secure TLS
  connection was established` và `Server has closed the connection`; ở agent hai
  dòng sau cũng có. Nguyên nhân chưa đo.
- **Model đã chọn bị AI Gateway gỡ (23/09).** Chat hỏng với «Bộ dựng không làm xong
  yêu cầu này»; `AppSetting.agentModelId` trỏ vào model Gateway trả 404
  `model_not_found`. Đọc sự kiện lỗi thật (`conversations.events`,
  `details.upstreamMessage`) trước khi đoán.
- **AI Gateway có hai cách chết giống nhau.** `Team budget exceeded` (trần tháng) và
  `402 insufficient_funds` (số dư tín dụng về 0) đều làm lượt đóng dưới một giây.
  Nâng trần không cứu số dư. Cả hai là việc tài chính của chủ kho. Chỉ quy lỗi cho
  Gateway khi trích được một trong hai dòng đó.
- **Model đo không phải model production (05/10).** Agent chính đọc
  `AppSetting.agentModelId`; CSDL dev và CSDL đo để trống ô đó nên rơi về
  `DEFAULT_AGENT_MODEL`. Eval agent chính xanh không chứng minh production chạy đúng.
- **eve bỏ công cụ động khi replay (26/09).** Log production in `[eve:dynamic-tools]
  Dynamic tool "…" references step function "…" which is not registered — skipping
  on this step.` Ranh giới quyền phải chặn trong chính công cụ, không dựa vào ghi đè.
- **Ignored Build Step huỷ luôn Production (04/10).** `[ "$VERCEL_ENV" !=
  "production" ]` trên `agent-okr` bỏ cả bản Production, không có build log. Tắt
  Preview bằng `vercel.json` `git.deploymentEnabled`; sau mọi lần đổi cài đặt build,
  kiểm bản Production dựng từ git là Ready, không phải Canceled.
- **Việc tay trên production không để dấu trong kho.** Nhập người, dựng cây, đặt
  khoá, chọn bot, đặt tên giai đoạn đều làm trên màn hay trên Vercel. Đừng suy
  «chưa làm» từ chỗ kho không có commit.
- **`vercel inspect --logs` in ra stderr**, và `vercel logs` không `--no-branch` thì
  rỗng — hai lý do một lệnh đúng trả về không có gì.
