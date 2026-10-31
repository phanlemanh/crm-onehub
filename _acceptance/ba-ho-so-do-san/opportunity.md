---
schema_version: 1
slug: ba-ho-so-do-san
feature: "Hồ sơ đã ký không còn đỏ sẵn trên onehub: mỗi thước chết được sửa hoặc ghi lại có lý do"
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: F24
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng F24 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Hồ sơ đã ký không còn đỏ sẵn trên onehub: mỗi thước chết được sửa hoặc ghi lại có lý do

## Ngưỡng chết / ngưỡng UAT

- Không đo được — thước, CI hay công cụ nội bộ của kho (tooling); không có người dùng cuối để mở phiên nghiệm thu, phép thử là bài kiểm và lượt CI của chính hồ sơ.
