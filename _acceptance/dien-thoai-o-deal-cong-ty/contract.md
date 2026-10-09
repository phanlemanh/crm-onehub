---
schema_version: 1
feature: «Số điện thoại hiện ở thoả thuận và ở tab Cá nhân của công ty»
slug: dien-thoai-o-deal-cong-ty
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-10-dien-thoai-o-deal-cong-ty-design.md
---

# Acceptance Contract: dien-thoai-o-deal-cong-ty

## Context

DT1 (#332) cho nhập, hiện và tìm số điện thoại của cá nhân. Ở thoả thuận và ở tab Cá nhân của công ty vẫn chưa thấy số: bảng người chỉ có Tên, Vai trò, Chức danh, Email; ô chọn người để gắn vào thoả thuận chỉ hiện «tên · chức danh». Anh chọn cách A (2026-10-10): cột «Điện thoại» ngay sau «Tên», giữ cột Email.

Source input: anh báo 09/10 («khi thêm một người ở trong Deal thì thiếu số điện thoại»); hàng DT2 tách từ DT1 (luật 46); `_acceptance/dien-thoai-o-deal-cong-ty/opportunity.md`.

## Criteria

- AC-1: (cross-layer) Given một thoả thuận có người mang số `+84901234567`, When đọc thoả thuận qua API, Then mỗi người trong thoả thuận mang `phone` (`+84901234567`, hoặc `null` khi không có số); và danh sách người có thể gắn vào thoả thuận cũng mang `phone`.
- AC-2: (cross-layer) Given một công ty có người mang số, When đọc công ty qua API, Then mỗi người trong danh sách người của công ty mang `phone`.
- AC-3: Given ngăn thoả thuận trên app thật, When xem bảng người, Then có cột «Điện thoại» ngay sau «Tên» hiện `0901 234 567`; người không có số hiện ô trống chuẩn; cột Email vẫn còn.
- AC-4: Given ngăn công ty trên app thật, When xem tab Cá nhân, Then có cột «Điện thoại» ngay sau tên hiện `0901 234 567`; các cột khác của bảng giữ nguyên.
- AC-5: Given ô chọn người khi bấm «Thêm cá nhân» trong thoả thuận, When mở ô chọn, Then mỗi lựa chọn hiện «tên · chức danh · 0901 234 567», bỏ vế nào trống (không có chức danh thì «tên · số»; không có số thì «tên · chức danh» như cũ).
- AC-6: Given giao diện tiếng Anh, When như AC-3 và AC-4, Then tiêu đề cột là «Phone».
- AC-7: Given các tệp giao diện vòng này sửa, When chạy sàn thiết kế của kho, Then không vi phạm P0; số trong bảng dùng thành phần hiện số dùng chung của DT1, không vẽ tay.

## Coverage

- bỏ coverage-scan — ba mặt hiển thị và hai đầu ra API đã liệt kê đủ từ phần tách của DT1; xem dòng sổ quyết định «bỏ coverage-scan».

## Out of scope

- Tạo người mới ngay trong thoả thuận (ô chọn chỉ gắn người có sẵn).
- Số ở các danh sách khác (bảng thoả thuận, Kanban).
- Liên kết gọi trong bảng (dòng bảng bấm được để mở người; liên kết gọi ở ngăn cá nhân — DT1).

## Notes

- Không migration; chỉ thêm trường `phone` vào đầu ra API.
