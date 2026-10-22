---
schema_version: 1
slug: loc-moi-truong
feature: Nhân viên quan hệ đối tác lọc danh sách theo trường chữ, số, ngày, ô tích hay ô trống, và lưu bộ lọc ấy cho cả Thoả thuận
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-21T06:19:17Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA18
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA18 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Nhân viên quan hệ đối tác lọc danh sách theo trường chữ, số, ngày, ô tích hay ô trống, và lưu bộ lọc ấy cho cả Thoả thuận

Vì sao: Lọc chỉ có kiểu Chọn và Người (filterableFieldsFor); không có lựa chọn «trống»; trường chuẩn và tự tạo mã hoá trên URL hai cách (list-search-params.ts:34,53); Thoả thuận không có bộ lọc đã lưu.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
