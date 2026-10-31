---
schema_version: 1
slug: thuoc-thiet-ke-xanh-rong
feature: Hồ sơ mới không khai design-gate --mode static trên .tsx, và các khoá *_san_thiet_ke đang có được gọi tên là thước rỗng
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: SN1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng SN1 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/don-dep-3110.md#fc6df9ace5753f6430fb7a75143137c82f826a08` — chưa có trang: trang nền, mã SN1
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Hồ sơ mới không khai design-gate --mode static trên .tsx, và các khoá *_san_thiet_ke đang có được gọi tên là thước rỗng

Vì sao: 77 khoá *_san_thiet_ke của _acceptance/config.yaml gọi design-gate --mode static, 0 khoá có --require-measured: trên .tsx chúng không đo gì mà vẫn báo đạt, nên che mắt người ký Cổng Bằng chứng (docs/findings/2026-10-31-design-floor-crm/README.md mục 1 và 5).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «docs/design.md có luật: eval giao diện của hồ sơ mới là ui-check hay răng khung, không phải design-gate tĩnh trên .tsx; luật liệt kê 77 khoá đang có là thước rỗng; không hồ sơ đã ký nào bị sửa» chưa?
- Kết quả nào là SỐNG: [đề xuất] docs/design.md có luật: eval giao diện của hồ sơ mới là ui-check hay răng khung, không phải design-gate tĩnh trên .tsx; luật liệt kê 77 khoá đang có là thước rỗng; không hồ sơ đã ký nào bị sửa
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «docs/design.md có luật: eval giao diện của hồ sơ mới là ui-check hay răng khung, không phải design-gate tĩnh trên .tsx; luật liệt kê 77 khoá đang có là thước rỗng; không hồ sơ đã ký nào bị sửa» khi hết timebox
- Timebox: …
