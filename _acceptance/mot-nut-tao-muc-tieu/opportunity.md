---
schema_version: 1
slug: mot-nut-tao-muc-tieu
feature: "Trưởng đơn vị bấm Thêm mục tiêu và chọn một đường trong một hộp: tự viết, từ mẫu, từ bảng tính hay soạn cùng Kara; ở Báo cáo không có nút tạo nào"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK9
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK9 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Trưởng đơn vị bấm Thêm mục tiêu và chọn một đường trong một hộp: tự viết, từ mẫu, từ bảng tính hay soạn cùng Kara; ở Báo cáo không có nút tạo nào

Vì sao: Sáu đường tạo mục tiêu ở bốn nơi; đầu trang sáu điều khiển; nút chính hiện cả trên màn chỉ đọc, trái nếp «Trang chỉ đọc không có nút chính». Tability: một nút mở hộp chọn đường.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Đầu trang khu chỉ còn một nút chính, chỉ ở Của tôi và Bộ OKR» chưa?
- Kết quả nào là SỐNG: Đầu trang khu chỉ còn một nút chính, chỉ ở Của tôi và Bộ OKR
- Kết quả nào là CHẾT: chưa đạt «Đầu trang khu chỉ còn một nút chính, chỉ ở Của tôi và Bộ OKR» khi hết timebox
- Timebox: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
