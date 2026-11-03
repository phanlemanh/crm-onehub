---
schema_version: 1
slug: cay-can-chinh-co-ly-do
feature: Cây căn chỉnh hiện lý do của từng đường nối và lọc được các đường «Chưa có lý do»
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: L3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng L3 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Cây căn chỉnh hiện lý do của từng đường nối và lọc được các đường «Chưa có lý do»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người phụ trách OKR có dùng Cây căn chỉnh và chip «Chưa có lý do» để tìm ra các đường nối còn trống lý do rồi bổ sung chúng không?
- Kết quả nào là SỐNG: Đến hạn, tỉ lệ căn chỉnh của chu kỳ hiện hành có lyDo khác null trong bảng okrAlignment tăng ít nhất 10 điểm so với mốc chụp ngày bật, và trong phiên nghiệm thu ít nhất 2 trên 3 người tự tìm được một đường «Chưa có lý do» bằng chip lọc trong vòng 1 phút.
- Kết quả nào là CHẾT: Tỉ lệ căn chỉnh có lyDo không tăng so với mốc ngày bật, và trong phiên nghiệm thu dưới 2 trên 3 người tìm được đường «Chưa có lý do» bằng bộ lọc.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
