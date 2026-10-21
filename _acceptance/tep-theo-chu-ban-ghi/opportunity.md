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

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
