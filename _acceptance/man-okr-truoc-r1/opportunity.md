---
schema_version: 1
slug: man-okr-truoc-r1
feature: «Hồi ý không bị hộp che, Cập nhật tuần báo đã xong, Toàn cảnh không nói ngược bảng»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan (lệnh giao P2 trong phiên, 04/10)
decided_at: 2026-10-04T05:38:00Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: R1c
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng R1c của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Hồi ý không bị hộp che, Cập nhật tuần báo đã xong, Toàn cảnh không nói ngược bảng»

Ba màn OKR làm người dùng hiểu sai ngay trước R1 (khảo sát màn thật 04/10, mục A2 của
`.acceptance-runs/dieu-phoi-1410/nguon/khao-sat-lo-trinh/de-xuat-lo-trinh.md`):

- **Người chọn ở Hồi ý** (R1m-1): thanh «Còn N điều trước khi công bố» mở sẵn danh sách,
  che 3/5 ý chưa gom ở màn đầu 1440 — đúng những ý người đó phải gom.
- **Người phụ trách KR** (R1m-4): đã gửi Cập nhật tuần, quay lại thấy form như chưa gửi
  («Gửi 0 cập nhật»), chỉ có chữ nhỏ «Tuần này: cao» — không biết mình đã xong chưa.
- **Quản trị ở Toàn cảnh** (R1m-6): thẻ ghi «Khối Hỗ trợ chưa đặt» trong khi bảng ngay dưới
  hiện Khối Hỗ trợ 6 mục tiêu · 12 KR (thẻ đếm mục tiêu riêng, hàng bảng gộp phòng ban con).
- R1m-7 (quản trị nhập được cả bộ nhưng không thêm được mục tiêu lẻ): chủ kho chốt 04/10 là
  lỗi; điều phối giao cho R1d (P1), không làm trong ô này.

Quyết định build: chủ kho giao hàng R1c cho phiên P2 kèm phạm vi và hạn 10/10 (lệnh giao việc
04/10, cùng bảy quyết định của lộ trình «lên trước 14/10»); máy ghi lại thành chữ ký Cổng Đáng.


## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người dùng thật có còn hiểu sai ba màn này không.
- Kết quả nào là SỐNG: trong lái-thử người-lạ (≥ 3 người, mỗi vai một màn), 0 người hỏi «tôi
  gửi chưa?» sau khi gửi; 0 người bỏ sót ý chưa gom vì bị che; 0 người đọc thẻ Toàn cảnh rồi
  kết luận bộ phận chưa có OKR khi bảng có số.
- Kết quả nào là CHẾT: ≥ 2 người vấp cùng một chỗ trong ba chỗ trên → iterate màn đó.
- Timebox: lái-thử trong tuần đào tạo 09–13/10; quyết ở phiên nghiệm thu R1.
