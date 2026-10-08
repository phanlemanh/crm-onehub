---
name: production
description: Xem production của crm-onehub, chỉ đọc, theo sha hoặc theo khung giờ, trên bốn dự án Vercel (crm-onehub-app, crm-onehub-api, crm-onehub-agent, agent-okr) — trạng thái triển khai, migrate, nhật ký, cụm lỗi, năng lực agent. Dùng khi hỏi «đã lên production chưa», «production lỗi gì», «Zalo hay cron có chạy không», khi Vercel MCP trả 403, hoặc trước khi viết «đã triển khai» vào hợp đồng, PR hay báo cáo.
---

# Xem production

Bản đồ đầy đủ (dự án, cron, webhook, biến, Blob, bẫy) ở `docs/production.md`. Skill
này là các lệnh. Mọi lệnh dưới đây đã chạy thật trên Mac mini ngày 08/10/2026
(Vercel CLI 54.5.1, `gh`, `jq`).

## Luật

- **Chỉ đọc.** Không `vercel env pull`, không redeploy, promote, rollback, không
  `vercel env add|rm`, không sửa cài đặt dự án. Cần những việc đó thì hỏi chủ kho.
- **Không in giá trị bí mật.** Biến môi trường chỉ đọc tên và đích. Không chép khoá
  cầu nối ra để gọi `/internal/*`.
- **Mọi nguyên nhân báo ra phải kèm dòng log làm căn cứ**: dòng nguyên văn, dự án,
  `deploymentId` hoặc đường, giờ UTC. Không có thì viết «chưa rõ nguyên nhân».
- **Vercel MCP trả 403 hay 404 không có nghĩa là không thấy production.** Kết nối MCP
  hiện chỉ mở `plm-app`; CLI đăng nhập bằng chủ team và thấy cả bốn dự án.
- Máy không có lệnh `timeout`. Lệnh `vercel logs` không có `--follow` thì tự dừng.
- Chạy `vercel logs` luôn kèm `--no-branch`, nếu không CLI lọc theo nhánh git đang
  đứng và trả rỗng.

Mọi khối dưới đây dùng hai biến này. Mỗi lần gọi công cụ Bash là một shell mới,
nên dán khối này vào đầu mỗi lệnh:

```bash
SC=phanlemanh-8330s-projects
DUAN=(crm-onehub-app crm-onehub-api crm-onehub-agent agent-okr)
```

## A. Theo sha: đã lên chưa, migrate chạy chưa

```bash
SHA=$(git rev-parse origin/onehub)
gh api "repos/phanlemanh/crm-onehub/commits/$SHA/status" \
  --jq '.state, (.statuses[] | "\(.context)\t\(.state)")'
for P in "${DUAN[@]}"; do
  vercel ls "$P" --scope "$SC" --environment production -m githubCommitSha="$SHA" --format json 2>/dev/null |
    jq -r --arg p "$P" '.deployments[] | [$p, .url, .state, (.createdAt/1000|todate)] | @tsv'
done
```

Đã gộp và đã lên: bốn context `Vercel – <dự án>` là `success`, bốn deployment
`READY`. Không có dòng nào cho một dự án nghĩa là sha đó chưa dựng ở dự án ấy.

Migrate — build log của API, lấy `url` của `crm-onehub-api` ở trên:

```bash
vercel inspect <url-crm-onehub-api> --scope "$SC" --logs 2>&1 |
  grep -E 'applying migrations|Applying migration|No pending|migrations applied|schema matches|Error'
```

Bản khoẻ có `✓ migrations applied` và `✓ schema matches`. Build log ra stderr, nên
phải `2>&1`.

## B. Theo khung giờ: mọi dòng của cả bốn dự án

```bash
TU=2026-10-08T09:40:00Z
DEN=2026-10-08T09:55:00Z
for P in "${DUAN[@]}"; do
  vercel logs -p "$P" --scope "$SC" --environment production --no-branch \
    --since "$TU" --until "$DEN" --json --limit 100 2>/dev/null |
  jq -r --arg p "$P" '. as $r
    | ((.logs // []) | if length > 0 then .[] else {level: $r.level, message: $r.message} end)
    | [$p, ($r.timestamp/1000|todate), $r.requestMethod, ($r.requestPath|sub("\\?.*";"")),
       ($r.responseStatusCode|tostring), .level, (.message|gsub("[\r\n]+";" ")|.[0:200])]
    | @tsv'
done | sort -k2
```

Mỗi request là một dòng JSON; `message` chỉ là dòng đầu, nội dung thật nằm trong
`logs[]` — lệnh trên trải `logs[]` ra từng dòng. Log trả mới nhất trước, tối đa 100
request mỗi dự án; cron mỗi phút của agent lấp cửa sổ rộng, nên thu hẹp
`TU`/`DEN` hoặc thêm bộ lọc ở mục D.

## C. Cụm lỗi 24 giờ (thay cho `get_runtime_errors` của MCP)

```bash
for P in "${DUAN[@]}"; do
  vercel logs -p "$P" --scope "$SC" --environment production --no-branch \
    --since 24h --level error --level fatal --json --limit 100 2>/dev/null |
  jq -r --arg p "$P" '. as $r
    | ((.logs // []) | map(select(.level == "error" or .level == "fatal"))) as $l
    | (if ($l|length) > 0 then $l[].message else $r.message end)
    | gsub("[\r\n]+";" ") | sub("^[0-9-]+T[0-9:.]+Z +";"") | gsub("toolu_[A-Za-z0-9]+";"<id>")
    | .[0:120] | "\($p)\t\(.)"'
done | grep -vE $'\t\\[agent\\] (→|✓|»|◂|·|▸) ' | grep -v 'SECURITY WARNING: The SSL modes' |
  sort | uniq -c | sort -rn | head -20

for P in "${DUAN[@]}"; do
  vercel logs -p "$P" --scope "$SC" --environment production --no-branch \
    --since 24h --status-code 5xx --json --limit 100 2>/dev/null |
  jq -r --arg p "$P" '"\($p)\t\(.requestMethod) \(.requestPath|sub("\\?.*";""))\t\(.responseStatusCode)"'
done | sort | uniq -c | sort -rn
```

`grep -v` thứ nhất bỏ lời thuật của agent: `apps/agent/agent/hooks/activity.ts` in
ra stderr, và Vercel gắn stderr mức `error`. Hai dấu còn lại là lỗi thật, giữ
nguyên: `[agent] ✗` là công cụ hỏng, `[agent] ⨯` là bước, lượt hay phiên hỏng, kèm
mã eve (vd `MODEL_CALL_FAILED`). `grep -v` thứ hai bỏ cảnh báo SSL của `pg`, lặp ở
mọi lần khởi động lạnh.

## D. Tìm một thứ cụ thể

```bash
vercel logs -p crm-onehub-agent --scope "$SC" --environment production --no-branch \
  --since 7d --query "/zalo/webhook" --json --limit 50 2>/dev/null |
  jq -r '[(.timestamp/1000|todate), .requestMethod, .requestPath, (.responseStatusCode|tostring), .domain, .deploymentId] | @tsv'
```

- Thay `--query` bằng chữ cần tìm: `"zalo"`, `"budget exceeded"`,
  `"insufficient_funds"`, `"[eve:dynamic-tools]"`, `"08P01"`, tên một thủ tục tRPC.
- Lọc theo mã: `--status-code 403`, `--status-code 4xx`.
- Đọc lùi được khoảng ba tuần.

## E. Agent đang bật năng lực gì

```bash
vercel logs -p crm-onehub-agent --scope "$SC" --environment production --no-branch \
  --since 30m --query "[agent] o" --json --limit 20 2>/dev/null |
  jq -r '. as $r | (.logs // [])[] | select(.message|test("^\\[agent\\] (on|off)|could not read"))
    | "\($r.timestamp/1000|todate)\t\(.message|gsub("[\r\n]+";" ")|.[0:160])"' | sort -u -k2 | head -30
```

Một dòng `off` chỉ đáng tin khi dòng ngay trước nó không phải `could not read …`
(cơ sở dữ liệu chập chờn làm Zalo báo `off`). Riêng `off  AI model` thì đừng tin:
ngày 08/10 nó báo `off` trong khi các lượt vẫn gọi model và có dòng
`[agent] · step … $0.04`. Muốn biết model có chạy, tìm dòng `[agent] ·` hay
`[agent] ⨯` của một lượt thật.

## F. Biến và kho Blob — chỉ tên

```bash
for P in "${DUAN[@]}"; do
  echo "== $P"
  vercel api "/v10/projects/$P/env?teamId=team_Y2xHDdP6Pp5IjjK9g1fQk09l" --method GET 2>/dev/null |
    jq -r '.envs[] | select(.target | index("production")) | .key' | sort | tr '\n' ' '
  echo
done
vercel blob list-stores --scope "$SC"
```

Đừng thêm `value` vào `jq`. Vắng một biến chưa chắc là sai — bảng «Vắng trên
production» trong `docs/production.md` nói cái nào là chủ ý.

## Điểm sống không cần khoá

```bash
curl -s -w '\n' https://crm-onehub-api.vercel.app/health
curl -s -w '\n' https://agent-okr.vercel.app/health
curl -s -o /dev/null -w '%{http_code}\n' https://www.onehub.center/
```

Khoẻ là `{"status":"ok","database":"up"}`, `{"cay":null}`, và `307` (về trang đăng
nhập).

## Báo lại

Một bảng cho mỗi lần xem:

| Dự án | Deployment | Trạng thái | Dòng log làm căn cứ (nguyên văn, giờ UTC) |
| --- | --- | --- | --- |

Một nguyên nhân không có dòng ở cột cuối thì ghi «chưa rõ nguyên nhân», kèm lệnh đã
chạy để người sau chạy lại.
