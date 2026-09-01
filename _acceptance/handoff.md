# Handoff — nhánh `onehub`

Viết cuối phiên 2026-08-31. Đọc file này trước khi làm bất cứ việc gì trong hàng đợi bên dưới.

## Hiện trạng

Repo là bản riêng của OneMount, tách từ `trycompai/crm` trong phiên này.

- `origin` = `phanlemanh/crm-onehub` (riêng tư), nhánh mặc định `onehub`
- `upstream` = `trycompai/crm` (chỉ đọc, MIT)
- `release` = bản gương upstream, không sửa
- 6 commit của OneMount nằm trên `onehub`

Đã gửi lên hãng, đang mở: PR `trycompai/crm#194` (vá `dev-session`), issue `#195` (test phập phù `retireExhausted`).

**Sửa lại chẩn đoán của `#195`, đo ngày 2026-09-01:** `retireExhausted` KHÔNG phập phù. Nó
đỏ mỗi lần CSDL kiểm còn hàng `AgentTask` của một lượt chạy bị cắt ngang, vì nó gọi
`claimDue(10, RESEARCH)` — lấy mọi hàng đến hạn, không chỉ ba hàng nó tạo. `bun run db:test`
làm nó xanh lại. 3 lần đỏ trong 11 lượt lưới đầy đủ, cả ba đều sau một suite bị cắt.

## Chạy tại máy

```
docker compose up -d
bun install && bunx prisma migrate deploy && bun run db:generate
cd apps/app && bun run dev          # 3000
cd apps/api && bun run dev          # 3001
cd apps/agent && bun run dev        # 2000
```

`bun run dev` ở gốc **không chạy được trong phiên không có TTY** — turbo đánh dấu `agent#dev`
là interactive. Dùng `dev:headless` của agent, hoặc chạy từng app như trên.

Đăng nhập không cần OAuth: `cd apps/api && bun run dev:session <email>` in ra cookie,
dán vào DevTools cho `localhost:3000`. Hạn 7 ngày.

## Ba thứ chặn, cần người quyết — không phải việc code

**B1 — Google OAuth.** `GOOGLE_CLIENT_ID`/`SECRET` trong `.env` đang rỗng, nên trang
sign-in báo "No way in yet" và **cả đội chưa vào được**. Redirect URI phải là
`http://localhost:3001/api/auth/callback/google`, consent screen để **Internal**
(`gmail.readonly` là restricted scope; để External thì phải qua thẩm định OAuth và
đánh giá CASA hàng năm). `ALLOWED_SIGN_IN` đã mở cho `onemount.com`.

**B2 — Khoá model.** Không có `AI_GATEWAY_API_KEY`, agent trả về "AI Gateway received no
credentials". Đây là lý do phần lớn việc AI Elements **chưa được kiểm chứng bằng mắt** —
xem mục Đã kiểm / chưa kiểm bên dưới. Nhiều hạng mục trong hàng đợi không có bằng chứng
Cổng 2 nếu thiếu khoá này.

**B3 — Câu hỏi pháp lý về Geist.** `packages/ui/src/styles/geist.css` là token trích từ
CSS đã biên dịch của Vercel. `@vercel/geistcn` không có trên npm và không có repo công
khai, tức là **không tìm thấy giấy phép cho phép dùng lại**. Riêng bộ chữ Geist có giấy
phép riêng và không nằm trong diện này. Đây là sản phẩm thương mại của công ty, nên cần
người có thẩm quyền xác nhận trước khi bộ token này ra khỏi môi trường nội bộ. Nếu câu
trả lời là không, đường lùi là giữ nguyên cấu trúc token và thay giá trị bằng thang màu
tự dựng — cấu trúc mới là phần có giá trị, không phải con số.

## Hàng đợi feature-loop

Mỗi mục chạy bằng `/feature-loop:feature-loop <mô tả>`. Repo đã có `_acceptance/config.yaml`.
Cổng nghiệm thu **chưa từng chạy lần nào** — nên chọn mục nhỏ nhất làm lần chạy đầu.

### 1. `oxlint-thu-hep-mien-tru` — T1 — làm trước để chạy thử cổng

`.oxlintrc.json` đang bỏ qua cả `lib/**` và `scripts/**` để file vendor của acceptance kit
không làm đỏ `lint:slop`. Đó là một cửa mở âm thầm: mọi script gốc repo viết sau này cũng
thoát luật. Thay bằng liệt kê từng file vendor.

Tiêu chí gợi ý: thêm một file `.ts` mới có vi phạm anti-slop vào `scripts/` thì `lint:slop`
phải đỏ; toàn bộ file vendor vẫn xanh.

### 2. `he-icon-mot-moi` — T2

`components.json` khai `iconLibrary: "lucide"`, nhưng thực tế là **73 file Carbon / 28 file
lucide** — và con số lucide vừa tăng vì 23 component AI Elements đều dùng lucide. Hiện có
hai hệ icon sống song song trong cùng một sản phẩm.

Ba đường: chuyển AI Elements sang Carbon (nhiều việc, nhất quán nhất), chấp nhận lucide cho
riêng vùng AI và ghi thành luật trong `docs/design.md`, hoặc chuyển hẳn sang lucide. Cần
người chọn ở Cổng Đáng.

### 3. `eve-stream-sang-ui-message` — T2 — **rủi ro cao nhất trong hàng đợi**

Hạ tầng cho mục 4. Hiện app tự dịch sự kiện eve thành `TranscriptItem` của riêng nó
(`packages/validation/src/eve-stream.ts` → `apps/app/lib/agent-transcript.ts`). Các component
AI Elements còn lại (`tool`, `task`, `sources`, `chain-of-thought`, `plan`) mong hình dạng
`message.parts` của AI SDK.

Cần một lớp chuyển đổi giữa hai hình dạng. **Không thay eve** — eve là thứ cho agent bền,
lịch chạy, sandbox, phê duyệt; AI SDK chỉ nằm ở lớp UI.

Đọc `docs/agent-panel.md` trước khi chạm. Nó ghi những hành vi đã trả giá bằng bug thật.

### 4. `transcript-dung-tron-ai-elements` — T2 — phụ thuộc mục 3 và B2

23 component AI Elements đã nằm trong `packages/ui/src/components/ai-elements/`, **mới dùng
2** (`message`, `reasoning`). Còn dựng tay: bước gọi công cụ (`AgentToolStep` trong builder
chat, `Marker` trong agent panel) và danh sách nguồn (`AttachmentGroup`) — đã có `tool`,
`task`, `sources`, `code-block` sẵn sàng thay.

Hai thứ **cố ý giữ lại**, đừng đổi nếu không có lý do mới: `MessageScroller` (primitive
shadcn có `content-visibility` và neo cuộn từng item, `Conversation` của AI Elements mỏng
hơn) và `ThinkingIndicator` (`Loader` chỉ là vòng xoay).

### 5. `geist-kich-thuoc-dieu-khien` — T2

Mới lấy màu, bóng, nền của Geist. Chưa lấy kích thước: `--ds-size-small/medium/large`
(32/36/40px) chưa nối vào chiều cao button/input, `--ds-popover-*` chưa nối vào menu.

Lưu ý: Geist **không công bố thang bo góc** — chỉ có `--ds-popover-row-radius: 6px`. Thang
4/5/8px của repo giữ nguyên, đừng đi tìm cái không tồn tại.

### 6. `ban-chay-cho-doi` — T3 — mục lớn nhất

Đội không dùng được `localhost` trên máy một người. Repo theo hình dạng Vercel + Postgres
quản lý, migration chạy lúc deploy. Cần cả chỗ quản lý secret. Phụ thuộc B1.

### 7. `nhip-dong-bo-upstream` — T1

Upstream chạy rất nhanh — một lần pull trong phiên này mang về 62 commit, 548 file. Cần một
nhịp: kéo vào `release`, merge sang `onehub`, xử lý xung đột. Bốn file là mặt va chạm:
`.oxlintrc.json`, `package.json`, `bun.lock`, `packages/ui/src/styles/globals.css`.

## Đã kiểm / chưa kiểm

Xanh ở cuối phiên: `check-types` 13/13, `lint` 9/9, `lint:slop` sạch, `test` 10/10.

Đã nhìn tận mắt: dashboard, danh sách công ty, record sheet, tab Agent, chat — cả light lẫn
dark. Tin nhắn người dùng render đúng qua `Message from="user"`. Mọi cặp màu ngữ nghĩa đo
được ≥ 4.65:1 ở cả hai theme.

**Chưa nhìn thấy chạy thật, chỉ mới qua typecheck:** câu trả lời của agent qua
`MessageResponse`/Streamdown, và khối reasoning gập/mở. Cả hai cần B2.

Một bài học của phiên: hai lỗi tương phản (chữ trắng trên nền amber, 2.23:1) **trông vẫn
đẹp trong ảnh chụp**. Chỉ số mới bắt được. Đừng ký duyệt màu bằng mắt.

## Bẫy đã gặp, đừng mất công lại

- `bun run test` đỏ trên máy này vì **môi trường**, không phải code: một test đòi
  `google: true` trong khi `.env` để trống. Chạy kèm
  `GOOGLE_CLIENT_ID=ci-only-google-client-id GOOGLE_CLIENT_SECRET=ci-only-google-client-secret`.
  Hook pre-push cũng chạy suite này.
- `bun run db:test` phải có `.env` gốc được nạp (`set -a; . ./.env; set +a`) vì nó chạy ở
  `packages/db`, nơi không có `.env`.
- Đẩy lên `origin` cần `http.version HTTP/1.1` (đã đặt trong git config local). HTTP/2 trả 400.
- CLI `ai-elements` **bỏ qua cả cờ `--help`** và cài thẳng toàn bộ, thêm 15 dependency rồi
  hỏi ghi đè component sẵn có. Lấy từ `https://registry.ai-sdk.dev/<tên>.json` và tự ghi file.
- Code vendor của AI Elements nhắm `ai` v6 và TS lỏng hơn; đã sửa 21 lỗi kiểu. Lần cập nhật
  sau sẽ gặp lại — xem commit `f3258ce` để biết đã sửa những gì.
