---
schema_version: 1
slug: so-do-toan-vung
feature: Ban lãnh đạo mở Báo cáo › Sơ đồ, thấy sơ đồ góp vào chiếm trọn vùng nội dung, bấm Toàn màn hình để thu thanh bên, và mở sơ đồ lấy tâm một mục tiêu từ ngăn của nó
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK6
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK6 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Ban lãnh đạo mở Báo cáo › Sơ đồ, thấy sơ đồ góp vào chiếm trọn vùng nội dung, bấm Toàn màn hình để thu thanh bên, và mở sơ đồ lấy tâm một mục tiêu từ ngăn của nó

Vì sao: Sơ đồ quanh mục tiêu dựng khung trang lồng trong khung trang nên bị nhốt trong bề rộng tối đa và một đầu trang lớn; căn chỉnh hiện ở sáu chỗ với ba cách vẽ. Tability đặt bản đồ trong vỏ nhưng cho nó trọn vùng, có Full screen.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Sơ đồ không còn bề rộng tối đa của trang; một màn Sơ đồ thay cho Cây căn chỉnh và trang Sơ đồ quanh mục tiêu; Esc thoát toàn màn hình» chưa?
- Kết quả nào là SỐNG: Sơ đồ không còn bề rộng tối đa của trang; một màn Sơ đồ thay cho Cây căn chỉnh và trang Sơ đồ quanh mục tiêu; Esc thoát toàn màn hình
- Kết quả nào là CHẾT: chưa đạt «Sơ đồ không còn bề rộng tối đa của trang; một màn Sơ đồ thay cho Cây căn chỉnh và trang Sơ đồ quanh mục tiêu; Esc thoát toàn màn hình» khi hết timebox
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp. Hạn cũ: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
