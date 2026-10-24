---
schema_version: 1
slug: hop-cap-nhat-lan-truoc
feature: Người phụ trách KR mở hộp cập nhật và thấy lần cập nhật trước — ngày, số, mức tự tin, ghi chú — cùng câu hỏi gợi ý cho ô ghi chú, trước khi gửi
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-22T05:57:32Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: HT3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng HT3 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Hạn: Quý 4 trên CRM, mọi phòng ban cập nhật và họp tuần hằng tuần — Họp tuần phải mở đúng bộ và họp được trên bảng — 26/10/2026.

Người phụ trách KR mở hộp cập nhật và thấy lần cập nhật trước — ngày, số, mức tự tin, ghi chú — cùng câu hỏi gợi ý cho ô ghi chú, trước khi gửi

Vì sao: Hộp cập nhật đã có đồ thị xem trước và điền sẵn mức tự tin lần trước (VK7), nhưng không hiện ghi chú lần trước, nên người viết không biết tuần trước đã hứa gì. Form check-in của Tability đặt «Previous check-in» cạnh form và gợi ba câu hỏi cho ô phân tích.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Mở hộp cập nhật của một KR đã có lần cập nhật thì thấy ghi chú lần trước mà không bấm thêm; KR chưa có lần nào thì không có khối trống» chưa?
- Kết quả nào là SỐNG: Mở hộp cập nhật của một KR đã có lần cập nhật thì thấy ghi chú lần trước mà không bấm thêm; KR chưa có lần nào thì không có khối trống
- Kết quả nào là CHẾT: chưa đạt «Mở hộp cập nhật của một KR đã có lần cập nhật thì thấy ghi chú lần trước mà không bấm thêm; KR chưa có lần nào thì không có khối trống» khi hết timebox
- Timebox: 2026-10-26 (mốc Hạn: Quý 4 trên CRM, mọi phòng ban cập nhật và họp tuần hằng tuần — Họp tuần phải mở đúng bộ và họp được trên bảng)


Cổng Đáng: chủ kho duyệt đợt cắt Họp tuần okr-hop-tuan-2210 (PR #543) ngày 22/10, ghi ở nhật ký LUAT.md của đợt vo-khu-muc-tieu lúc 2026-10-22T05:57:32Z — cùng lệ với các hàng VK của đợt.
