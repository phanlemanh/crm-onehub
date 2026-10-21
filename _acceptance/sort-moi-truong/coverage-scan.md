# Quét độ phủ — sort-moi-truong (DA17)

Preset `entity-feature` của skill `morphological-scan`, đọc trên onehub `03d4842f1` và nhánh DA14
`feat/truong-mot-cach-cu-xu` (`8d680156f`, chỉ đọc).

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub. Người dùng là nhân viên quan hệ đối tác, đọc danh sách Thoả thuận, Công ty, Liên hệ
  và bảng Kanban thoả thuận.
- Chân sản phẩm: đào repo.
  - Luật đích ở `docs/design.md` mục «Trường» [SUY-TỪ-REPO: docs/design.md].
  - Danh sách kiểu [SUY-TỪ-REPO: packages/db/src/fields-shape.ts].
  - Cách sort trường chuẩn [SUY-TỪ-REPO: apps/api/src/deals/deals.service.ts].
  - Cách ẩn cột [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/deals/deals-table.tsx].
- Chân ngành: HubSpot CRM và Attio cho sắp bảng theo thuộc tính tự tạo như thuộc tính có sẵn
  [NGÀNH: HubSpot CRM, Attio]. Phần này chỉ để đối chiếu; luật của kho đã đòi điều ấy.

## Trục

- **Kiểu**: Chữ · Chữ dài · Số · Ngày · Ô tích · Chọn · Người · Liên kết · Email · Điện thoại · Tiền (chỉ trường
  chuẩn) · Tệp (DA19). [thước CE: `FIELD_TYPES` + bảng kiểu của `docs/design.md`]
- **Loại bản ghi**: Thoả thuận · Công ty · Liên hệ. [thước CE: `FIELD_ENTITIES`]
- **Mặt**: sort ở bảng · sort trên Kanban · ẩn cột theo khổ · giá trị trên thẻ Kanban.
  [thước CE: câu giao DA17 + `docs/design.md` mục «Luật»]
- **Trạng thái giá trị và trang**: có giá trị · trống · hoà giá trị · trang nằm vắt qua ranh có giá trị/trống ·
  khoá sort không còn (trường đã lưu trữ, kiểu không sort, chữ rác). [thước CE: cách phân trang của `paginate` +
  `SavedView.filters.sort` ở `packages/validation/src/saved-view.ts`]

## Không gian

Kiểu × loại bản ghi × mặt có 12 × 3 × 4 = 144 ô. Ô vô nghĩa:

- Kanban chỉ có ở Thoả thuận, gạch hai loại kia.
- Tiền chỉ có ở Thoả thuận, và đã sort được; gạch ở trục «trường tự tạo».
- Tệp thuộc DA19, gạch.
- Ô tích không có sort theo bảng của `docs/design.md` (ô «—»).

Còn lại quét theo lát «mặt».

## Core

1. Sort trường tự tạo theo kiểu ở API, cho ba loại bản ghi: mỗi kiểu một cột lưu (`text`, `number`, `date`,
   thứ tự lựa chọn, tên người) → AC-1, AC-2.
2. Ranh trang có giá trị/trống và hoà giá trị: không trùng, không sót qua các trang → AC-1.
3. Khoá sort không còn hay không sort được: về thứ tự mặc định, không lỗi (view đã lưu mang `sort`) → AC-3.
4. Bảng Kanban theo cùng `sort` → AC-4.
5. Cột trường (chuẩn và tự tạo) có tiêu đề bấm sort khi kiểu sort được; Điện thoại của Liên hệ hôm nay chưa sort
   → AC-5.
6. Ẩn cột theo kiểu, một bảng cho cả hai loại trường → AC-6.
7. Thẻ Kanban hiện tối đa hai trường tự tạo đầu tiên đã bật «Hiện trong bảng» → AC-7.
8. Tốc độ trên dữ liệu mẫu đủ lớn (ghi chú rủi ro của hàng lộ trình) → AC-8.
9. Mắt người ở 1280, 768, 375 → AC-9.

## Later

- Sort nhiều cột một lúc (sort phụ do người chọn) — kho chưa có ở trường chuẩn.
- Sort theo Tệp (DA19 khai «—»).
- Thẻ Kanban sắp lại thứ tự hai trường riêng cho thẻ — hôm nay theo thứ tự Cài đặt › Trường.

## Never

- Sort ở máy khách trên trang đang tải: sai khi có nhiều trang.
- Thêm cột sort mới vào bảng `deal`, `company`, `contact`: đổi schema là T3, và trường tự tạo đã có chỉ mục
  `[fieldId, text|number|date]` trên `fieldValue`.
- Ô tích sort được: `docs/design.md` khai «—».

## Cross-cutting

- Trống luôn đứng cuối ở cả hai chiều, như `amount` và `lastActivity` của trường chuẩn.
- Hoà giá trị phân xử theo `createdAt` giảm dần rồi `id`, để trang ổn định.
- Không chạm `DataTable` hay `packages/ui` (luật 31): DA17 chỉ khai `sortable` và `hideBelow` của cột.
