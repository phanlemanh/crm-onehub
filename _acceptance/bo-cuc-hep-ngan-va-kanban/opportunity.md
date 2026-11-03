---
schema_version: 1
slug: bo-cuc-hep-ngan-va-kanban
feature: Ngăn bản ghi và Kanban thoả thuận không vỡ bố cục ở khổ hẹp
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: V2c
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng V2c của «OKR» (`docs/plan/lo-trinh-okr.json`).

Ngăn bản ghi và Kanban thoả thuận không vỡ bố cục ở khổ hẹp

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người dùng mở Bảng cột thoả thuận và ngăn thoả thuận, công ty trên điện thoại có đọc đủ tên, giá trị, giai đoạn và người phụ trách mà không phải xoay ngang hay chuyển sang máy tính không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với 3 người dùng thật trên điện thoại của họ (khổ 375–390) và dữ liệu thật, ít nhất 2 trên 3 người đọc đúng giai đoạn, giá trị và người phụ trách của 3 thoả thuận do người chủ trì chỉ định, và không ai gặp chữ bị cắt «…» hay thẻ tràn viền.
- Kết quả nào là CHẾT: Trong phiên nghiệm thu có người gặp nhãn giai đoạn, số liệu đầu ngăn hay thẻ Kanban bị cắt «…» hoặc tràn viền trên dữ liệu thật, hoặc dưới 2 trên 3 người đọc đúng cả 3 thoả thuận.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
