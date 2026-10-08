---
schema_version: 1
slug: deal-va
feature: «Danh sách deal Kara trả có chấm màu giai đoạn; telemetry giai đoạn có tập khoá đóng»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: E1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng E1 của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Danh sách deal Kara trả có chấm màu giai đoạn; telemetry giai đoạn có tập khoá đóng»

- **Ngoài-7 của `giai-doan-thoa-thuan`** (Cổng Bằng chứng 29/09, «mở hợp đồng mới»): người dùng hỏi
  Kara về thoả thuận; danh sách thoả thuận Kara trả (`deal-list-result.tsx`) không còn chấm màu giai đoạn,
  chỉ còn chữ — `list_deals` nay trả nhãn giai đoạn mà giao diện tra theo mã. Thông tin đúng, mất phần
  nhìn nhanh.
- **Ngoài-1 của `giai-doan-thoa-thuan`**: số liệu ẩn danh `deals_by_stage` gửi về hãng có tập khoá mở —
  mỗi giai đoạn quản trị viên tự tạo (kể cả đã lưu trữ) thành một cột mã ngẫu nhiên; số cột tăng dần,
  không so sánh được giữa các bản cài. Việc nội bộ, không có người dùng cuối.

Cổng Đáng: build — chủ kho ký cho E3, E1, E4, E5, E6 lúc 2026-10-07T13:13:50Z (luật 16 của đợt sau-14-10).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người dùng nhìn danh sách thoả thuận Kara trả có nhận ra ngay giai đoạn của từng thoả thuận bằng màu như ở bảng Kanban không?
- Kết quả nào là SỐNG: ở phiên nghiệm thu, người thử hỏi Kara một danh sách thoả thuận và chỉ đúng thoả thuận đang ở giai đoạn chốt được / không thành chỉ bằng màu, 0 lần hỏi; số liệu ẩn danh `deals_by_stage` chỉ còn tập khoá cố định theo loại giai đoạn.
- Kết quả nào là CHẾT: danh sách vẫn chỉ có chữ, hoặc màu ở danh sách khác màu cùng giai đoạn trên Kanban.
- Timebox: phiên nghiệm thu đầu tiên sau khi lên production, cùng phiên với `danh-sach-keo-chung`, chậm nhất 2026-10-21.
