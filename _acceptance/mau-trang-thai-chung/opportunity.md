---
schema_version: 1
slug: mau-trang-thai-chung
feature: Cùng một nghĩa — xong, chờ, hỏng, nháp, đang chạy — mang cùng một màu ở OKR, Kara, lịch họp và Tài liệu
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: NM3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng NM3 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Cùng một nghĩa — xong, chờ, hỏng, nháp, đang chạy — mang cùng một màu ở OKR, Kara, lịch họp và Tài liệu

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người dùng nhìn một chấm trạng thái ở OKR, Kara, lịch họp hay Tài liệu có đoán đúng nghĩa của nó như nhau ở mọi khu không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu chấm kín với ít nhất 3 người xem 6 chấm trạng thái lấy từ ít nhất 3 khu khác nhau, mỗi người gọi đúng nghĩa ít nhất 5 trên 6 chấm, và không ai đọc chấm «đang chạy» thành lỗi hay rủi ro.
- Kết quả nào là CHẾT: Có người gọi đúng dưới 4 trên 6 chấm, hoặc từ 2 người trở lên hiểu cùng một màu thành hai nghĩa khác nhau ở hai khu.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
