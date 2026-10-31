---
schema_version: 1
slug: cham-bo-do-chiu-cau-loi
feature: E15 của tro-ly-doc-kho coi lượt đủ mã là đã đo, ghi câu lỗi model vào cột riêng, có trần
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T13:18:56Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: F34
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng F34 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Hồ sơ đã ký luôn tươi — dọn hồ sơ cũ và sửa thước — 31/10/2026.

E15 của tro-ly-doc-kho coi lượt đủ mã là đã đo, ghi câu lỗi model vào cột riêng, có trần

## Ngưỡng chết / ngưỡng UAT

- Không đo được — thước, CI hay công cụ nội bộ của kho (cli); không có người dùng cuối để mở phiên nghiệm thu, phép thử là bài kiểm và lượt CI của chính hồ sơ.
