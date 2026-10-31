---
schema_version: 1
slug: che-do-soan-bo-okr
feature: Trưởng đơn vị bấm Soạn OKR và viết cả bộ như một tài liệu — mục tiêu, KR liền mạch — với góp ý của Kara và điểm chất lượng ở cột bên, rồi công bố
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK10
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK10 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Trưởng đơn vị bấm Soạn OKR và viết cả bộ như một tài liệu — mục tiêu, KR liền mạch — với góp ý của Kara và điểm chất lượng ở cột bên, rồi công bố

Vì sao: Tạo một mục tiêu có ba KR mất khoảng mười bấm qua hộp tạo rồi từng hộp KR; góp ý Kara chiếm hai phần ba chiều cao ngăn theo dõi. Tability tách «Edit content» khỏi màn theo dõi.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Tạo một mục tiêu có ba KR và công bố trong khoảng 3 bấm cộng phần gõ; ngăn theo dõi chỉ còn một chip góp ý» chưa?
- Kết quả nào là SỐNG: Tạo một mục tiêu có ba KR và công bố trong khoảng 3 bấm cộng phần gõ; ngăn theo dõi chỉ còn một chip góp ý
- Kết quả nào là CHẾT: chưa đạt «Tạo một mục tiêu có ba KR và công bố trong khoảng 3 bấm cộng phần gõ; ngăn theo dõi chỉ còn một chip góp ý» khi hết timebox
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp. Hạn cũ: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
