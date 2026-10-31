---
schema_version: 1
slug: vo-khu-muc-tieu
feature: Trưởng đơn vị mở Mục tiêu và đi giữa Của tôi, Bộ OKR, Lấy ý kiến và Báo cáo bằng một thanh bên, chu kỳ chọn một lần ở đầu thanh, và mọi đường dẫn cũ vẫn mở đúng chỗ
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK2 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Trưởng đơn vị mở Mục tiêu và đi giữa Của tôi, Bộ OKR, Lấy ý kiến và Báo cáo bằng một thanh bên, chu kỳ chọn một lần ở đầu thanh, và mọi đường dẫn cũ vẫn mở đúng chỗ

Vì sao: Hôm nay trang đơn vị có ba lớp điều khiển ngang chồng nhau; ô chu kỳ lẫn giữa các nút hành động; chia theo phạm vi (của tôi · đơn vị · cả công ty) làm người dùng không biết một mục nói về bộ OKR hay số liệu. Tability chia theo việc và vật, phạm vi là bộ lọc trong trang.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Trên trang đơn vị chỉ còn một lớp thẻ ngang; mọi đường dẫn cũ (?donOkr=, ?xemOkr=, /okr/theo-don-vi, /okr/toan-canh, /okr/quanh-muc-tieu/…, /okr?tu=nhac) chuyển tới đúng chỗ mới» chưa?
- Kết quả nào là SỐNG: Trên trang đơn vị chỉ còn một lớp thẻ ngang; mọi đường dẫn cũ (?donOkr=, ?xemOkr=, /okr/theo-don-vi, /okr/toan-canh, /okr/quanh-muc-tieu/…, /okr?tu=nhac) chuyển tới đúng chỗ mới
- Kết quả nào là CHẾT: chưa đạt «Trên trang đơn vị chỉ còn một lớp thẻ ngang; mọi đường dẫn cũ (?donOkr=, ?xemOkr=, /okr/theo-don-vi, /okr/toan-canh, /okr/quanh-muc-tieu/…, /okr?tu=nhac) chuyển tới đúng chỗ mới» khi hết timebox
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp. Hạn cũ: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
