---
schema_version: 1
slug: buoc-kara-bo-qua
feature: «Bước Kara bỏ qua việc vô hại hiện "Đã bỏ qua", không báo "chưa lưu được"»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-08T07:13:17Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: Ngoài-6 của `kara-trang-thai-toan-crm` (K6b), Cổng 2 2026-10-08T07:13:17Z — anh chọn «mở hợp đồng mới» (luật 26 của đợt `sau-14-10`). Hàng K6d, chuyển sang làn P6, ưu tiên 0.6.

## Vấn đề & ai gặp

Khi Kara bỏ qua một việc vì không cần làm — cá nhân đã có ảnh, hoặc ảnh không đổi — bước đó hiện «Kara chưa lưu được» như một thất bại và danh sách bước tự mở. Người xem ngăn Kara của bản ghi (và khung tạo tác nhân) tưởng Kara làm hỏng việc. Gốc: công cụ ảnh trả cùng `stored: false` cho cả ca hỏng thật lẫn ca vô hại, và giao diện coi mọi «không lưu» là cảnh báo.

## Ngưỡng chết / ngưỡng UAT

- Không đo được — sửa nhãn trạng thái của một bước Kara; không có hành vi người dùng nào đếm được trong hai tuần, phép thử là bước vô hại không còn hiện như thất bại.

## Out of scope từ khám phá

- Các công cụ khác của Kara (chưa thấy công cụ nào khác trả «không lưu» cho việc vô hại; enrich_company báo «đã có» bằng ghi chú, đã trung tính).
- Đổi chữ «Chưa lưu được» của ca hỏng thật.
