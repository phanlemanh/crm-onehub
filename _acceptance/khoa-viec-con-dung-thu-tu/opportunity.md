---
schema_version: 1
slug: khoa-viec-con-dung-thu-tu
feature: Thêm việc con vào dự án không vấp khoá với dời ngày hay sửa mốc cùng lúc
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-21T06:19:17Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA13
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA13 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: Khoá việc con đúng thứ tự — 22/10/2026.

Thêm việc con vào dự án không vấp khoá với dời ngày hay sửa mốc cùng lúc

Vì sao: Ngoài-1 và Ngoài-2 của DA12 (va-gantt-lich-bay-ngay): taoViecCon khoá việc cha rồi mới khoá dự án, ngược thứ tự khoaDuAn/khoaMot, nên thêm việc con đúng lúc dời ngày hay sửa mốc có thể treo khoá. Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng DA12 20/10.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
