---
schema_version: 1
slug: trang-lo-trinh-mo-hinh-hien-thi
feature: Trang Lộ trình trong CRM hiện việc chưa hẹn mốc và tên hiển thị đúng như LO-TRINH.html, không còn cờ vàng «khối chưa mang mô hình hiển thị»
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T13:18:56Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: LT1f
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng LT1f của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Tín hiệu và trang Lộ trình theo kit 2.33 — 29/10/2026.

Trang Lộ trình trong CRM hiện việc chưa hẹn mốc và tên hiển thị đúng như LO-TRINH.html, không còn cờ vàng «khối chưa mang mô hình hiển thị»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người xem trang Lộ trình trong CRM có thấy cùng một bức tranh mốc, việc chưa hẹn mốc và tên việc như LO-TRINH.html, đủ để không phải mở tệp kia ra đối chiếu không?
- Kết quả nào là SỐNG: Trong 2 tuần sau khi bật, mỗi lần LO-TRINH.html được vẽ lại sau một lần gộp, đối chiếu kiểu xem «Mốc» trên production cho 0 lệch về tập mốc, việc dưới mốc, tên hiển thị và nhóm «Chưa hẹn mốc», và ít nhất 2 trên 3 người xem trong phiên nghiệm thu trả lời đúng «mốc kế còn bao nhiêu việc» chỉ từ trang CRM.
- Kết quả nào là CHẾT: Có ít nhất 1 lần trang CRM và LO-TRINH.html nói khác nhau về mốc hay việc của cùng một lộ trình, hoặc cờ «khối chưa mang mô hình hiển thị» hay hộp «Trang có thể thiếu một phần» còn hiện trên production.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
