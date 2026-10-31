---
schema_version: 1
slug: khong-do-them-chay-gh
feature: Hai phép kiểm luồng tự động của kho (gpct_luot_that, gpct_nen_gop) chạy thật trong bàn đo, không bị tính «đỏ sẵn» ở cả hai cây
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: F26
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng F26 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Hai phép kiểm luồng tự động của kho (gpct_luot_that, gpct_nen_gop) chạy thật trong bàn đo, không bị tính «đỏ sẵn» ở cả hai cây

## Ngưỡng chết / ngưỡng UAT

- Không đo được — thước, CI hay công cụ nội bộ của kho (ci); không có người dùng cuối để mở phiên nghiệm thu, phép thử là bài kiểm và lượt CI của chính hồ sơ.
