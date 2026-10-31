---
schema_version: 1
slug: re-mo-hinh-mac-dinh
feature: Tác nhân CRM và Trợ lý Kho tài liệu dùng model mặc định rẻ hơn mà không tụt chất lượng trên bộ đo
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-19T14:59:33Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: MH2
lo_trinh_tep: docs/plan/lo-trinh-kho-tai-lieu.json
---

## Vấn đề & ai gặp

Mở từ hàng MH2 của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`).
Mốc: Kho tài liệu qua Zalo và model theo vai — 30/10/2026.

Tác nhân CRM và Trợ lý Kho tài liệu dùng model mặc định rẻ hơn mà không tụt chất lượng trên bộ đo

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: mỗi vai đổi model (Tác nhân, Trợ lý kho) có rẻ hơn model cũ mà không tụt chất lượng trên bộ đo không.
- Kết quả nào là SỐNG: tiền Gateway thật mỗi lượt của mỗi vai đổi model thấp hơn mốc model cũ ít nhất 50%, và chất lượng đạt ngưỡng MH4 (Tác nhân ≥ 4/5 lượt qua dưới 180 giây; Trợ lý kho mỗi tầng không kém mốc 13/10 quá 1 câu, câu lỗi ≤ 2).
- Kết quả nào là CHẾT: một vai không rẻ hơn mốc, hoặc tụt dưới ngưỡng chất lượng.
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): đọc số chạy thật một lần. Hạn cũ: đọc ngày 2026-10-30 (mốc hàng). Ghi theo Hỏi-6, Cổng Phạm vi MH2 duyệt 21/10.
