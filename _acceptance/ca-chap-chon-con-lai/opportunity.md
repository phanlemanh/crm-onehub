---
schema_version: 1
slug: ca-chap-chon-con-lai
feature: Ba ca chập chờn còn lại của bộ thử chạy tất định — hai đối chứng «the fixture bites» của tasks.integration không còn phụ thuộc lúc autovacuum chạy, và goiKiemTu không còn phụ thuộc giờ đồng hồ
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07T23:59:20Z
prototype:
  base_commit:
  disposition:
---

Nguồn: yêu cầu P5-5 (ba ca chập chờn ngoài ranh giới F11); luật 22 của đợt `sau-14-10` — anh mở hàng lúc 2026-10-07T23:59:20Z («Mở hàng mới cho F17»), ghi như `build`, kèm lời dặn «Sửa cho tất định, không nới phép kiểm». Giám sát thêm ca CI #321 (09/10 01:50 giờ VN) vào phạm vi.

## Vấn đề & ai gặp

| Ca | Chỗ | Lần đỏ trên CI | Tái hiện |
| --- | --- | --- | --- |
| the fixture bites (exhausted) | `apps/agent/test/tasks.integration.spec.ts:332` | 37824401395 lượt 1, 08/10 18:39:39Z (#321) — 3 thành 2 | `ANALYZE` chen giữa bước gieo và `probe` → đúng 2 |
| the fixture bites for due work too | `apps/agent/test/tasks.integration.spec.ts:337` | 37624939982 lượt 1, 07/10 — 3 thành 2 | như trên |
| goiKiemTu | `apps/agent-okr/test/goi-soan.integration.spec.ts:376` | 37171465448, 37184155892 lượt 1 | `setSystemTime` ở mốc base36 có «26» đứng riêng → đỏ chắc chắn |

**Người gặp:** mọi lượt `bun run test` — pre-push, CI, làn ghim lại, S4. Mỗi lần đỏ tốn một lượt chạy lại job (cỡ 10 phút CI) và một lần người phải đọc xem đỏ thật hay giả.

## Giả định chốt sinh tử

- Sửa được hoàn toàn ở tầng test: khối tasks giữ thống kê đứng yên bằng cách tắt autovacuum riêng cho bảng trong lúc khối chạy; `ma()` của bộ gieo agent-okr sinh chuỗi không có chữ số.
- Hai bên đều tái hiện được tất định trên máy (đã đo, xem design), nên phép đo chiều đỏ không phải chờ may rủi.

## Ngưỡng chết / ngưỡng UAT

[đề xuất] Việc nội bộ, không có người dùng.
- SỐNG: ba ca đỏ chắc chắn dưới điều kiện tái hiện trên bản sao mã cũ và xanh trên mã mới; hai tuần sau gộp, 0 lượt CI/pre-push đỏ ở ba ca này.
- CHẾT: còn một lượt đỏ ở ba ca sau gộp mà dòng lỗi không gọi tên nguyên nhân.
- Timebox: đợt `sau-14-10`; đo lần đầu hai tuần sau gộp.

## Câu hỏi mở cho Cổng Phạm vi

- `ma()` đổi cho cả 6 tệp dùng nó (một dòng ở `support/gieo.ts`, ngoài ranh giới ban đầu — xin chạm tệp P5-49).
- Id cuid của lớp 3 trong gói không được gỡ trước khi trích số (mã sản phẩm `goi-soan.ts`) — để hàng riêng hay không.

## Hạng mục cùng lớp

`ca-chap-chon-cach-ly` (F11, đã gộp), `so-moi-khong-chap-chon` (#301), `khoa-eve-khong-tranh` (F18).

## Quyết định Cổng Đáng

Luật 22: anh mở hàng F17 lúc 2026-10-07T23:59:20Z — coi như `build`. Giám sát xếp dãy P5, ưu tiên 5.
