# CLAUDE.md — CRM của OneHub

> Cấu hình repo cho phiên máy: kho là gì, cổng nào, lệnh nào, từ nào. Luật
> hành vi (cách hỏi, cách báo cáo) không sống ở đây — nó theo cấu hình cá
> nhân của người dùng.

## Kho này là bản riêng, không phải kho của hãng

Tách từ `trycompai/crm` (MIT). Sản phẩm nội bộ của OneHub, không bán ra ngoài.

`origin` = `phanlemanh/crm-onehub`, nhánh làm việc `onehub`. `release` là bản
gương của hãng — không sửa. `upstream` chỉ đọc. Kéo bản mới của hãng về
`release` rồi merge sang `onehub`. CI riêng của công ty sống ở
`.github/workflows/acceptance.yml`, không bao giờ vào `ci.yml` của hãng.

Phí bản rẽ là chi phí dài hạn lớn nhất ở đây. Sửa được ở hãng thì gửi lên hãng,
đừng vá riêng.

## AGENTS.md của hãng: giữ luật kỹ thuật, bỏ luật hành vi

@AGENTS.md

Luật kỹ thuật trong đó giữ nguyên hiệu lực: không viết chú thích trong code,
không trailer đồng tác giả, trí khôn sống ở `apps/agent` chứ không ở API, một
`.env` duy nhất ở gốc, `/packages/ui` là nguồn duy nhất của giao diện, phân
tích ở biên chứ không truyền `Record<string, unknown>`. Bảng chỉ mục "đọc gì
trước khi chạm gì" của nó là bảng duy nhất — theo đúng bảng đó, và nói ra đã
đọc gì.

Ba mục hành vi của hãng KHÔNG áp dụng ở kho này:

- **"Use ASD-STE100"** — không viết tiếng Anh theo khuôn hãng. Ngôn ngữ và
  giọng theo cấu hình cá nhân của người dùng.
- **Khuôn báo cáo `## Issues`** — không bắt buộc. Cách báo cáo theo cấu hình
  cá nhân.
- **"Median Tasks"** — chết: kho không có `.median/config.json`, máy không có
  `mdn`. Đừng gọi. Mã việc của hãng (`CMP-…`) chỉ dùng khi thật sự vá cho hãng.

## Bốn cổng, và vòng lặp là đường mặc định

`PRODUCT-MAP.md` vẽ bốn cổng người: **Cổng Đáng** (việc này có đáng làm không) ·
**Cổng Phạm vi** (bộ tiêu chí đã đủ và đúng chưa) · **Cổng Bằng chứng** (đã làm
đúng thứ đã hứa chưa) · **Cổng Giá trị** (thứ đã giao có ăn thua không). Bốn câu
đó chỉ người trả lời được.

Làm một tính năng = chạy `/feature-loop:feature-loop <mô tả>`. Đó là đường mặc
định cho T2/T3, không phải lựa chọn nâng cao. Chạy `/acceptance-gate:acceptance`
trần thì được hồ sơ nhưng mất sổ quyết định, mất phản biện context sạch, mất thẻ
cổng — bốn hồ sơ đầu của kho đã mất đúng những thứ đó. T1 (chỉ chạm `docs/**`,
`**/*.md`) thoát ở S0, làm thẳng.

Cấu hình cổng ở `_acceptance/config.yaml`: `enforcement: strict`, `recheck:
strict`. Đường T3 gồm `packages/auth`, `packages/db/prisma`, và các module
`auth` · `api-keys` · `sso` · `users` · `workspace` · `tracking` · `mailbox` của
API — chạm vào đó là T3, thêm một cổng duyệt kế hoạch.

Lỗi của bộ kit nghiệm thu phát hiện ở đây thì mở chip riêng sang
`~/dev/acceptance-gate-kit`, không sửa tại chỗ — phiên ở kho này chỉ làm tính
năng của kho này.

## Ngôn ngữ sản phẩm

`CONTEXT.md` là từ điển. Từ chưa có mục ở đó thì hoặc thêm mục trước, hoặc viết
bằng chữ thường ai cũng hiểu.

Cấm tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật — giữ nguyên tên thật
(`diff`, `sha`, `migration`, `worktree`), đặt trong ngoặc khi cần.

Nhãn trên màn hình mang phần ngữ cảnh **chưa cấp**: xoá một chữ mà người đứng ở
màn đó vẫn hiểu đúng thì chữ đó thừa. Dữ liệu người nhập không dịch, và đánh dấu
để trình duyệt không tự dịch.

## Cách chứng minh nó chạy

Từ gốc kho, không cần export gì:

```
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```

`bun run build` là lệnh thứ năm, thêm 07/09. Bốn lệnh đầu không dựng ứng dụng, nên
một hồi quy làm `next build` đỏ đã đi qua bốn vòng đã ký mà không cổng nào thấy.
Hình dạng cổng khai ở `.githooks/gate-shape.json`; thêm task mà không khai là
`verify-gate-shape.mjs` cắn.

Hai lỗi môi trường cũ đã vá 2026-09-01 — cách lách cũ (tự export khoá Google
giả) nay sai, đừng dùng lại. Mỗi lượt `bun run test` có cơ sở dữ liệu riêng
`crm_<id>_test`, tạo trước và drop sau, nên hàng `AgentTask` của một lượt bị cắt
ngang không sang được lượt kế. Chỉ `bun test` trần trong một gói mới dùng chung
`crm_test`; thấy `agent#test` đỏ ở `retireExhausted` theo lối đó thì chạy
`bun run db:test --reset` rồi mới tin màu đỏ. Chi tiết ở `docs/setup.md`.

`bun run dev` ở gốc không chạy trong phiên không có TTY. Chạy từng app:
`apps/app` 3000, `apps/api` 3001, `apps/agent` 2000. Đăng nhập không cần OAuth:
`cd apps/api && bun run dev:session <email>`.

Đẩy lên `origin` cần `http.version HTTP/1.1` (đã đặt trong git config của kho);
HTTP/2 trả 400. `pre-push` chạy `check-types`, `lint`, `lint:slop`, `test`. Đừng
`--no-verify` trừ khi có lý do nói được thành lời.

## Đừng sửa tay

`PRODUCT-MAP.md` do máy vẽ lại mỗi lần một người ký một cổng. Sửa tay là làm hồ
sơ lệch, và CI bắt.
