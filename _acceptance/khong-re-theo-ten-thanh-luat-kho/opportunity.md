---
schema_version: 1
slug: khong-re-theo-ten-thanh-luat-kho
feature: Phép kiểm «không rẽ theo tên» chạy một lần như luật kho, không còn là eval phủ cả app làm mọi PR chạm app thành hồ sơ cũ
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: F23
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng F23 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Phép kiểm «không rẽ theo tên» chạy một lần như luật kho, không còn là eval phủ cả app làm mọi PR chạm app thành hồ sơ cũ

## Ngưỡng chết / ngưỡng UAT

- Không đo được — thước, CI hay công cụ nội bộ của kho (tooling); không có người dùng cuối để mở phiên nghiệm thu, phép thử là bài kiểm và lượt CI của chính hồ sơ.
