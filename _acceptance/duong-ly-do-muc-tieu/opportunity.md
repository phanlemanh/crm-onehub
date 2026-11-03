---
schema_version: 1
slug: duong-ly-do-muc-tieu
feature: Sheet mục tiêu hiện lý do căn chỉnh của từng đường nối lên mục tiêu cha
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: L2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng L2 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Sheet mục tiêu hiện lý do căn chỉnh của từng đường nối lên mục tiêu cha

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người xem một mục tiêu có hiểu vì sao nó góp vào mục tiêu cha nhờ khu «Đường lý do», mà không phải đi hỏi người lập không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu trên ít nhất 3 mục tiêu thật có lý do, ít nhất 2 trên 3 người mở sheet nói lại đúng ý lý do và phân biệt đúng «Có số liệu» với «Đặt cược» mà không cần giải thích.
- Kết quả nào là CHẾT: Dưới 2 trên 3 người nói lại được lý do hay phân biệt được mức tin, hoặc đến hạn chu kỳ thật không có căn chỉnh nào có lyDo trong okrAlignment để hiện.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
