---
schema_version: 1
slug: lien-quan-loc-ban-da-cat
feature: Danh sách liên quan trong ngăn bản ghi không lẫn bản đã lưu trữ, kèm «+n đã lưu trữ» để mở xem
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: V2a
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng V2a của «OKR» (`docs/plan/lo-trinh-okr.json`).

Danh sách liên quan trong ngăn bản ghi không lẫn bản đã lưu trữ, kèm «+n đã lưu trữ» để mở xem

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người xem ngăn công ty, cá nhân hay thoả thuận có đọc đúng số bản đang dùng và vẫn tự tìm lại được bản đã lưu trữ từ ngăn không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người, ít nhất 2 trên 3 người tìm lại một thoả thuận đã lưu trữ từ ngăn công ty qua «+n đã lưu trữ» trong 1 phút không cần gợi ý, và 0 người hiểu «+n đã lưu trữ» là nút lưu trữ hay đọc số trên tab mà tính cả bản đã cất.
- Kết quả nào là CHẾT: Quá nửa người không tìm ra bản đã cất từ ngăn hoặc hiểu «+n đã lưu trữ» là nút để lưu trữ, hoặc có báo số trên tab hay số liệu đầu ngăn công ty lệch số bản đang dùng.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
