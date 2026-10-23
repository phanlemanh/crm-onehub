---
schema_version: 1
slug: tep-theo-chu-ban-ghi
feature: Nhân viên quan hệ đối tác mở được tệp trong bản ghi mình phụ trách, và khi đổi người phụ trách thì quyền đi theo người mới
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-21T23:04:34Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA20
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA20 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Nhân viên quan hệ đối tác mở được tệp trong bản ghi mình phụ trách, và khi đổi người phụ trách thì quyền đi theo người mới

Vì sao: Chủ kho chốt 20/10: chỉ chủ bản ghi và quản trị mở được tệp. Đây là luật quyền theo bản ghi đầu tiên của CRM — hiện API không kiểm ownerId khi đọc.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: nhân viên có tự mở được hợp đồng của bản ghi mình phụ trách mà không cần quản trị không.
- Kết quả nào là SỐNG: ở phiên nghiệm thu, ít nhất bốn trên năm nhân viên mở được hợp đồng của thoả thuận mình phụ trách
  mà không hỏi, và sau một lần đổi người phụ trách người mới mở được ngay.
- Kết quả nào là CHẾT: có một dòng log `Field file opened` với `laPhuTrach=false` mà `role` không phải `owner`, `admin`
  — một lần mở bởi người không phải quản trị, không phụ trách bản ghi lúc mở.
- Timebox: đọc 14 ngày sau khi lên production.

Chép từ Hỏi-5 đã duyệt ở Cổng Phạm vi (manh, 22/10).
