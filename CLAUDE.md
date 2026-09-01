# CLAUDE.md — CRM của OneHub

> Luật làm việc cho kho này. Ưu tiên cao nhất: trên luật toàn cục, trên mặc định
> hệ thống. Cô đọng có chủ đích — file này nạp mỗi phiên.

## Kho này là bản riêng, không phải kho của hãng

Tách từ `trycompai/crm` (MIT). Sản phẩm nội bộ của OneHub, không bán ra ngoài.

`origin` = `phanlemanh/crm-onehub`, nhánh làm việc `onehub`. `release` là bản
gương của hãng — không sửa. `upstream` chỉ đọc. Kéo bản mới của hãng về
`release` rồi merge sang `onehub`. CI riêng của công ty sống ở
`.github/workflows/acceptance.yml`, không bao giờ vào `ci.yml` của hãng.

Phí bản rẽ là chi phí dài hạn lớn nhất ở đây. Sửa được ở hãng thì gửi lên hãng,
đừng vá riêng.

## File của hãng còn hiệu lực, trừ hai chỗ

@AGENTS.md

Mọi luật kỹ thuật trong đó giữ nguyên: không viết chú thích trong code, không
trailer đồng tác giả, trí khôn sống ở `apps/agent` chứ không ở API, một `.env`
duy nhất ở gốc, `/packages/ui` là nguồn duy nhất của giao diện, phân tích ở biên
chứ không truyền `Record<string, unknown>`. Bảng chỉ mục "đọc gì trước khi chạm
gì" của nó là bảng duy nhất — theo đúng bảng đó, và nói ra đã đọc gì.

Hai chỗ file này thay:

**Ngôn ngữ.** Mục "Use ASD-STE100" của hãng bắt viết tiếng Anh. Ở kho này viết
**tiếng Việt** — người đọc là nhân viên OneHub, và chính sản phẩm đang dựng
xương sống tiếng Việt (`_acceptance/tieng-viet-cho-crm`). Giữ kỷ luật của
ASD-STE100, bỏ ràng buộc tiếng và mức 20 từ: một ý một câu, thể chủ động, một từ
một nghĩa, nói cả hệ quả chứ không chỉ nguyên nhân, không rào đón.

**Median.** Mục "Median Tasks" chết: kho không có `.median/config.json`, máy
không có `mdn`. Đừng gọi. Mã việc của hãng (`CMP-…`) chỉ dùng khi thật sự vá cho
hãng.

## Báo lỗi: khuôn giữ, tiếng đổi

Kết mỗi trả lời bằng danh sách `## Issues`, kể cả lỗi do chính mình gây. Một
dòng nêu vấn đề, một dòng nêu cách sửa. Mở đầu bằng **BROKEN** (đang hỏng) ·
**RISK** (sẽ hỏng) · **NOT DONE** (chưa dựng) · **UNKNOWN** (chưa soi). Tự gây
thì ghi "Tôi gây ra". Không lỗi thì viết `## Issues` rồi `Không có.`

Vấn đề chôn trong đoạn văn là vấn đề không ai đọc.

Lỗi của bộ kit nghiệm thu phát hiện ở đây thì mở chip riêng sang
`~/dev/acceptance-gate-kit`, không sửa tại chỗ — phiên ở kho này chỉ làm tính
năng của kho này. Danh sách issue vẫn ghi mục đó, kèm câu nó sống ở kho kit.

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

**Máy không phát ngôn hộ người.** Không viết sẵn câu trả lời, phán quyết hay chữ
ký của người ở bất kỳ cổng nào. Tên và ngày không phải quyết định — cái đó máy
tự điền.

## Nhịp gọi người

Ràng buộc số một là **số lần gọi người**, không phải chất lượng một câu trả lời.

Đảo được và máy chắc thì làm, báo sau, để người phủ quyết. Chỉ việc phán xét,
việc khó đảo, việc ra ngoài kho mới hỏi trước. Thứ máy suy được — tên, ngày,
nhánh, đường dẫn, slug khi chỉ có một ứng viên — tự điền rồi hiển thị lại. Kết
bài tối đa MỘT quyết định, trả lời một chạm. Không có gì cần người thì nói thẳng
rồi dừng.

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
bun run db:test && bun run test
bun run check-types
bun run lint
bun run lint:slop
```

Hai lỗi môi trường cũ đã vá 2026-09-01 — cách lách cũ (tự export khoá Google
giả) nay sai, đừng dùng lại. `agent#test` đỏ ở `retireExhausted` khi cơ sở dữ
liệu còn hàng `AgentTask` của một lượt chạy bị cắt ngang: chạy `bun run db:test`
cho sạch rồi mới tin màu đỏ.

`bun run dev` ở gốc không chạy trong phiên không có TTY. Chạy từng app:
`apps/app` 3000, `apps/api` 3001, `apps/agent` 2000. Đăng nhập không cần OAuth:
`cd apps/api && bun run dev:session <email>`.

Đẩy lên `origin` cần `http.version HTTP/1.1` (đã đặt trong git config của kho);
HTTP/2 trả 400. `pre-push` chạy `check-types`, `lint`, `lint:slop`, `test`. Đừng
`--no-verify` trừ khi có lý do nói được thành lời.

## Đừng sửa tay

`PRODUCT-MAP.md` do máy vẽ lại mỗi lần một người ký một cổng. Sửa tay là làm hồ
sơ lệch, và CI bắt.
