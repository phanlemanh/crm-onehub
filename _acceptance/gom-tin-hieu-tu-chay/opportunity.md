---
schema_version: 1
slug: gom-tin-hieu-tu-chay
feature: Chủ kho nhận trong ngày một đợt gom đề xuất sẵn nhóm và hàng mỗi khi có tín hiệu mới, và chỉ cần sửa hay phủ quyết
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T13:18:56Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TH2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng TH2 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Tín hiệu và trang Lộ trình theo kit 2.33 — 29/10/2026.

Chủ kho nhận trong ngày một đợt gom đề xuất sẵn nhóm và hàng mỗi khi có tín hiệu mới, và chỉ cần sửa hay phủ quyết

Vì sao: Gom nhóm và cắt lượt hôm nay cần người mở phiên máy và gõ lệnh; đây là chỗ thứ hai của vòng chưa ai làm.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mỗi tín hiệu kéo về có chỗ trong bản gom trong vòng 2 ngày; chủ kho sửa ít hơn một nhóm trên năm (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mỗi tín hiệu kéo về có chỗ trong bản gom trong vòng 2 ngày; chủ kho sửa ít hơn một nhóm trên năm (ngưỡng đề xuất — chốt ở Cổng Đáng)
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mỗi tín hiệu kéo về có chỗ trong bản gom trong vòng 2 ngày; chủ kho sửa ít hơn một nhóm trên năm (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox
- Timebox: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33)
