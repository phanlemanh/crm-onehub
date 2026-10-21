---
schema_version: 1
slug: truong-tep
feature: Nhân viên quan hệ đối tác gắn tệp hợp đồng vào ô Tệp trên phiếu thoả thuận, công ty hay liên hệ, và lọc được bản ghi nào chưa có
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-21T14:12:29Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA19
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA19 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Nhân viên quan hệ đối tác gắn tệp hợp đồng vào ô Tệp trên phiếu thoả thuận, công ty hay liên hệ, và lọc được bản ghi nào chưa có

Vì sao: Bản ghi CRM chưa giữ được tệp nào, hợp đồng nằm ngoài CRM. Chủ kho chốt 20/10: thêm kiểu trường Tệp để người quản trị tự cấu hình, không dựng loại bản ghi riêng. Bộ lọc «có / chưa có» đứng trên đường lọc của DA18.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
