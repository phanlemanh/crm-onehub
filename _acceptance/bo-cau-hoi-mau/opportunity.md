---
schema_version: 1
slug: bo-cau-hoi-mau
feature: Trợ lý kho được đo trên 50 câu hỏi mẫu viết theo tài liệu của kho mẫu — câu trả lời được, câu phải nói không biết, câu hỏi qua Zalo — không chờ người gom câu hỏi thật
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: cb
lo_trinh_tep: docs/plan/lo-trinh-kho-tai-lieu.json
---

## Vấn đề & ai gặp

Mở từ hàng cb của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`).

Trợ lý kho được đo trên 50 câu hỏi mẫu viết theo tài liệu của kho mẫu — câu trả lời được, câu phải nói không biết, câu hỏi qua Zalo — không chờ người gom câu hỏi thật

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
