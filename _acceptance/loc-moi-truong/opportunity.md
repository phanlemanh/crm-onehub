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

- Câu hỏi phép đo trả lời: Sau khi bật, nhân viên quan hệ đối tác có thật sự lọc theo trường chữ, số, ngày, ô tích hay ô trống và lưu bộ lọc ấy ở Thoả thuận không?
- Kết quả nào là SỐNG: Trong timebox, bảng SavedView có ít nhất 2 bộ lọc đã lưu của Thoả thuận, và ít nhất 1 bộ lọc đã lưu ở bất kỳ loại bản ghi nào mang giá trị lọc kiểu mới (has:, gte:, lte:, none, yes, no hay một mốc ngày).
- Kết quả nào là CHẾT: Hết timebox mà SavedView có 0 bộ lọc đã lưu của Thoả thuận và 0 bộ lọc mang giá trị kiểu mới, hoặc trong phiên nghiệm thu quá nửa người không đặt được lọc «trống» hay lọc khoảng số.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
