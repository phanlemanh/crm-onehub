---
schema_version: 1
slug: thuoc-viec-cua-ban-do-duoc
feature: Phép đo thẻ «Việc của bạn» (E7b của DA0a) tự đỏ khi câu ghim sai, không chỉ khi màn sai
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA0c
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA0c của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

Phép đo thẻ «Việc của bạn» (E7b của DA0a) tự đỏ khi câu ghim sai, không chỉ khi màn sai

Vì sao: Ngoài-7 của DA0a, chủ kho tách thành việc riêng ở Cổng Bằng chứng 12/10: thước không đỏ được bằng câu ghim thì không chứng được điều nó hứa.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
