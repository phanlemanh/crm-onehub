---
schema_version: 1
slug: loc-don-vi-khong-tu-dong
feature: Chọn một mục trong Lọc ở trang Theo đơn vị thì menu Lọc vẫn mở, khung Lọc trên điện thoại không tự thu lại
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DH13
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng DH13 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Chọn một mục trong Lọc ở trang Theo đơn vị thì menu Lọc vẫn mở, khung Lọc trên điện thoại không tự thu lại

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người lọc mục tiêu ở trang Theo đơn vị có chọn liền nhiều giá trị lọc mà không phải mở lại menu hay khung Lọc không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người, mỗi người lọc theo hai giá trị liên tiếp ở máy tính và ở điện thoại, ít nhất 2 trên 3 người làm xong mà không phải mở lại menu Lọc lần nào, và 0 người nói bảng nháy hay biến mất khi đổi lọc.
- Kết quả nào là CHẾT: Quá nửa người phải mở lại menu hay khung Lọc sau mỗi lần chọn, hoặc có người nói bảng biến mất hay nháy khi đổi lọc.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
