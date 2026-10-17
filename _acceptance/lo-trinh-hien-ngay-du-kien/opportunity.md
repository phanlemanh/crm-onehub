---
schema_version: 1
slug: lo-trinh-hien-ngay-du-kien
feature: Trưởng phòng ban mở trang Lộ trình và thấy mỗi việc, mỗi mốc có ngày dự kiến xong do máy tính — ghi rõ là dự kiến, có cờ khi số đo chưa đủ
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: LT1e
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng LT1e của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Lộ trình bước 2 — ngày dự kiến, tên ngành tiếng Việt, tiêu điểm sau xoá — 21/10/2026.

Trưởng phòng ban mở trang Lộ trình và thấy mỗi việc, mỗi mốc có ngày dự kiến xong do máy tính — ghi rõ là dự kiến, có cờ khi số đo chưa đủ

Vì sao: Gốc: _acceptance/lo-trinh-doc-ban-chup/ — trang Lộ trình đọc khối dữ liệu bản 2 của kit, nên giờ máy và ngày dự kiến của gói road-map (RM6 lo-trinh-gio-may) không tới được trang CRM; chủ kho mở 16/10 cùng hàng kit RM6c (khối dữ liệu mang ngày dự kiến).

Số trước (đo 17/10 trên `LO-TRINH.html` của onehub 9dfdf0628, vẽ bằng kit 2.32.0):

- Khối dữ liệu đã mang giờ máy của mọi việc và của 7 mốc đang chạy (OKR 5, Kho tài liệu 1, Việc và Dự án 1), nhưng
  trang CRM không hiện chúng: khuôn đọc của CRM bỏ qua khoá lạ.
- 0/7 mốc đang chạy có ngày dự kiến trong khối: ngày chỉ có khi một việc của mốc được mở bằng kit từ 2.32.0.
- Mở LT1e (17/10) sinh dự báo đầu tiên: mốc «Lộ trình bước 2» (mục tiêu 21/10, 16,5–27,5 giờ máy) ghi «hoàn tất 17/10».
  Kit tính mọi mốc bắt đầu hôm nay và máy chạy 24/24 (hạt giống kit 17/10 «giờ máy theo mốc không xếp nối tiếp»), nên
  ngày này sai hiển nhiên.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Ngày dự kiến của kit đủ gần thực tế để trưởng phòng ban dùng | Trang trình một ngày sai như cam kết; người hẹn theo ngày đó rồi trượt | Đọc lệch ở mốc khép đầu tiên | Đã có phản chứng: 17/10 cho mốc 21/10 |
| 2 | Trưởng phòng ban đọc nhãn «dự kiến» và cờ như lời ước, không như hạn | Ngày ước bị đọc thành hạn chốt | Phiên nghiệm thu chung 22/10 | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

> Bản máy sinh từ `bat_khi` của hàng giữ ở cuối mục; dưới đây là bản máy khuyên, tách phần trang CRM chịu khỏi phần
> độ đúng của phép tính kit.

- Câu hỏi phép đo trả lời: [đề xuất] trưởng phòng ban mở trang Lộ trình có thấy cho mỗi mốc đang chạy một ngày ghi rõ là dự kiến, hoặc một cờ nói vì sao chưa có ngày, và mỗi việc có giờ máy kèm cờ khi số đo chưa đủ — không chỗ nào trình ngày như cam kết?
- Kết quả nào là SỐNG: [đề xuất] sau khi giao, 100 % mốc đang chạy trên trang hiện ngày kèm chữ «dự kiến» hoặc cờ «chưa có ngày dự kiến» kèm lý do; mọi ngày tính trên số đo chưa đủ mang cờ; độ lệch ngày dự kiến so với ngày khép thật ở mốc khép đầu tiên được ghi lại — lệch quá một ngày thì gửi tín hiệu cho kit (hạt giống 17/10), không tính là LT1e chết.
- Kết quả nào là CHẾT: [đề xuất] có một mốc đang chạy hiện ngày không kèm chữ «dự kiến», hoặc không ngày mà không cờ, hoặc trang vỡ khi đọc trang đời trước, khi hết timebox.
- Timebox: [đề xuất] 2026-10-21 (mốc Lộ trình bước 2 — ngày dự kiến, tên ngành tiếng Việt, tiêu điểm sau xoá)

Bản máy sinh từ hàng (giữ làm sử liệu): «Sau khi giao, mọi mốc đang chạy trên trang có ngày dự kiến kèm nhãn «dự kiến»; ở
mốc khép đầu tiên, ngày dự kiến lệch ngày khép thật không quá một ngày». Vế thứ hai đo phép tính của kit chứ không đo
trang CRM, và với dự báo 17/10 đã sinh thì gần như chắc trượt.
