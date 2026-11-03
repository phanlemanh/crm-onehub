---
schema_version: 1
slug: lo-trinh-nhieu-san-pham
feature: Chủ kho chọn OneHub Platform hay một sản phẩm khác ngay trên trang Lộ trình của OneHub Center và đọc lộ trình, tiến độ, hồ sơ của sản phẩm đó như của CRM
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T13:18:56Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: LT3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng LT3 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Tín hiệu và trang Lộ trình theo kit 2.33 — 29/10/2026.

Chủ kho chọn OneHub Platform hay một sản phẩm khác ngay trên trang Lộ trình của OneHub Center và đọc lộ trình, tiến độ, hồ sơ của sản phẩm đó như của CRM

Vì sao: Chủ kho chốt 14/10: OneHub Center là nơi vận hành, đọc lộ trình của mọi kho sản phẩm cùng kiến trúc kit. Khuôn dữ liệu đã chung (kho kit cũng vẽ cùng khuôn); còn thiếu danh bạ sản phẩm, quyền đọc kho, bộ chọn sản phẩm và quyền xem.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Chủ kho có đọc được lộ trình của một sản phẩm thứ hai ngay trên trang Lộ trình, cập nhật theo nhánh chính, mà không phải mở kho GitHub của sản phẩm đó không?
- Kết quả nào là SỐNG: Trong 2 tuần sau khi bật, ít nhất một sản phẩm ngoài CRM có bản chụp đầu trong vòng một ngày tính từ lúc khai và cài ứng dụng, trạng thái lấy giữ «đã lấy» qua mỗi lần nhánh chính đổi, và có ít nhất một người được cấp quyền xem sản phẩm đó.
- Kết quả nào là CHẾT: Sau 2 tuần chưa sản phẩm nào ngoài CRM có bản chụp, hoặc bản chụp đầu trễ quá một ngày, hoặc sản phẩm đã khai đứng ở trạng thái lấy hỏng từ hai lần kiểm liên tiếp trở lên.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
