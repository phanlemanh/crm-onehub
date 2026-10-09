---
schema_version: 1
feature: «Khung "Bản ghi này không còn" không nói chắc nguyên nhân»
slug: khung-khong-con-dung-chu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-09-khung-khong-con-dung-chu-design.md
---

# Acceptance Contract: khung-khong-con-dung-chu

## Context

Khung «Bản ghi này không còn» trong ngăn bản ghi nói chắc «Đã có người xoá vĩnh viễn bản ghi này nên không mở lại được.» trong khi NOT_FOUND còn đến từ Xoá thường và từ đường dẫn sai hay bị cắt cụt. Đổi câu mô tả thành câu không khẳng định nguyên nhân; anh chọn A ngày 2026-10-09.

Source input: Ngoài-2 của `khung-loi-ban-ghi-dung-ly-do` (K4b), Cổng 2 2026-10-09T05:25:03Z, anh chọn «mở hợp đồng mới» (luật 26); giám sát chuyển hàng K4c sang làn P6; `_acceptance/khung-khong-con-dung-chu/opportunity.md`.

## Criteria

- AC-1: (cross-layer) Given giao diện tiếng Việt, When một ngăn bản ghi (cá nhân, công ty, thoả thuận, kế hoạch) nhận NOT_FOUND — API trả mã này cho bản ghi đã bị xoá và cho id chưa từng có (đường dẫn sai hay cắt cụt) — Then khung «Bản ghi này không còn» hiện đúng câu mô tả «Có thể bản ghi đã bị xoá, hoặc đường dẫn không đúng.», và câu không còn chữ «vĩnh viễn» hay «Đã có người».
- AC-2: Given giao diện tiếng Anh, When như AC-1, Then câu mô tả là «It may have been deleted, or the link is wrong.» và không còn «permanently» hay «Someone deleted».
- AC-3: Given các khung lỗi khác của ngăn bản ghi, When chạy lại các bài kiểm khung lỗi sẵn có (không có quyền, không tải được, kế hoạch của công ty, tiếng Anh của K4b, và khung lỗi của K4 trong `kara-ban-ghi.dom.tsx`), Then tất cả xanh không sửa kỳ vọng; tiêu đề và nút «Đóng» của khung «không còn» giữ nguyên.
- AC-4: Given bộ canh chữ giao diện, When chạy lại, Then xanh mà không thêm khoá nào vào danh sách miễn (câu tiếng Việt có dấu, khác bản tiếng Anh).
- AC-5: Given app thật ở 1440 và 390, When mở một cá nhân đã bị xoá qua đường dẫn bản ghi, Then khung «không còn» hiện tiêu đề, câu mô tả mới và nút «Đóng» trên màn, bấm «Đóng» thì ngăn đóng.

## Coverage

- bỏ coverage-scan — một chuỗi chữ, hai ngôn ngữ; không gian không có nhiều chiều. Xem dòng sổ quyết định «bỏ coverage-scan».

## Out of scope

- Tiêu đề «Bản ghi này không còn» giữ nguyên.
- Phân biệt nguyên nhân NOT_FOUND ở máy chủ (đã xoá hay đường dẫn sai) — cần đổi API.
- Các khung lỗi khác (không có quyền, không tải được) không đổi chữ.

## Notes

- Không đổi thành phần, không migration, không đổi API.
