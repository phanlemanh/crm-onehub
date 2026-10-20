---
schema_version: 1
slug: va-gantt-lich-bay-ngay
feature: Lịch làm việc chọn đủ bảy ngày vẫn giữ đúng như chọn, và dự án đủ 300 việc vẫn sửa được mốc và phụ thuộc
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-19T14:59:33Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA12
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA12 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: Việc riêng đúng quyền và vá Gantt — 24/10/2026.

Lịch làm việc chọn đủ bảy ngày vẫn giữ đúng như chọn, và dự án đủ 300 việc vẫn sửa được mốc và phụ thuộc

## Ngưỡng chết / ngưỡng UAT

Cổng Đáng: chủ kho duyệt «build» cho cả năm hàng ở thẻ khởi tạo đợt `viec-du-an-kho-tai-lieu` (19/10, 14:59:33Z).
Gốc: Ngoài-3, Ngoài-8, Ngoài-9 của `du-an-gantt` — chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng DA4 18/10.

- Câu hỏi phép đo trả lời: quản trị đặt lịch làm cả bảy ngày có giữ được không; dự án đã đủ 300 việc có còn sửa được mốc và phụ thuộc không.
- Kết quả nào là SỐNG: bỏ chọn hết ngày nghỉ rồi tải lại vẫn thấy không ngày nào nghỉ, Gantt không bỏ qua Thứ Bảy, Chủ nhật; ở dự án đủ 300 việc vẫn thêm, sửa, xoá mốc và gỡ phụ thuộc được, câu báo lỗi chỉ hiện khi thêm việc thứ 301.
- Kết quả nào là CHẾT: sau khi lưu, Thứ Bảy và Chủ nhật bật lại; hoặc dự án đủ 300 việc vẫn chặn thao tác mốc hay phụ thuộc.
- Timebox: một vòng (10 giờ máy), mốc 24/10/2026.
