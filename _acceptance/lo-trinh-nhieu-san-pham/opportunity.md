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

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa?
- Kết quả nào là SỐNG: [đề xuất] Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng)
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox
- Timebox: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33)
