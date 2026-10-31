---
schema_version: 1
slug: bo-okr-co-so
feature: "Trưởng đơn vị mở bộ OKR của đơn vị mình và biết ngay đội đang ra sao: ngày còn lại, tiến độ so với kỳ vọng, số KR đã cập nhật tuần này, số KR tự tin thấp, và mọi KR đã mở sẵn"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK8
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK8 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Trưởng đơn vị mở bộ OKR của đơn vị mình và biết ngay đội đang ra sao: ngày còn lại, tiến độ so với kỳ vọng, số KR đã cập nhật tuần này, số KR tự tin thấp, và mọi KR đã mở sẵn

Vì sao: Trang đơn vị hôm nay gập mục tiêu, không có số tóm tắt; phải mở từng dòng. Trang kế hoạch của Tability mở ra là thấy bốn ô số.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Bốn ô số ở đầu thẻ OKR của mọi bộ; nút Mở tất cả / Gập tất cả» chưa?
- Kết quả nào là SỐNG: Bốn ô số ở đầu thẻ OKR của mọi bộ; nút Mở tất cả / Gập tất cả
- Kết quả nào là CHẾT: chưa đạt «Bốn ô số ở đầu thẻ OKR của mọi bộ; nút Mở tất cả / Gập tất cả» khi hết timebox
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp. Hạn cũ: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
