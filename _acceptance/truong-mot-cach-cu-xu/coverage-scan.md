# Quét không gian tiêu chí — truong-mot-cach-cu-xu

Preset `entity-feature`: thực thể là một **giá trị trường** trên một bản ghi.

## Trục

| Trục | Giá trị | Thước CE |
|---|---|---|
| A. Kiểu | Chữ · Chữ dài · Số · Ngày · Ô tích · Chọn · Người · Liên kết · Email · Điện thoại · Tiền · Tệp | `FIELD_TYPES` [SUY-TỪ-REPO: packages/db/src/fields-shape.ts] + bảng kiểu [SUY-TỪ-REPO: docs/design.md mục «Trường»] |
| B. Loại trường | chuẩn · tự tạo | [SUY-TỪ-REPO: apps/app/components/crm/fields/standard-fields.ts] |
| C. Mặt | hiển thị trên phiếu · đầu phiếu · ô bảng · sửa tại chỗ · form tạo · lọc · sort | sáu mặt [SUY-TỪ-REPO: docs/design.md mục «Một bảng đăng ký theo kiểu»] |
| D. Locale | vi · en | `LOCALES` [SUY-TỪ-REPO: packages/ui/src/lib/locale.ts] |
| E. Trạng thái | trống · có giá trị · nhập sai · máy chủ từ chối · đang lưu · bản ghi đã lưu trữ | bảng trạng thái của design doc |

## Core (vào hợp đồng)

| Ô | AC |
|---|---|
| mọi A (trừ Tệp) × B × {hiển thị, sửa, ô bảng}: một đường qua bảng đăng ký | AC-1 |
| Số × D × có giá trị: đọc theo locale, lưu số, hiện theo locale | AC-2 |
| {Số, Email, Liên kết, Điện thoại, bắt buộc} × nhập sai, và × máy chủ từ chối | AC-3 |
| Ô tích × {phiếu, bảng, đầu phiếu} | AC-4 |
| {Liên kết, Email, Điện thoại} × B × {phiếu, bảng} | AC-5 |
| B = chuẩn × A: kiểu khai đúng bảng, và cùng cấu trúc với trường tự tạo cùng kiểu | AC-6 |
| A × ô bảng × trống | AC-7 |
| tên gọi trong chuỗi giao diện | AC-8 |
| mắt người trên ba phiếu (1280, 375) và ba bảng | AC-9 |

## Later (hàng sau của đợt)

- C = form tạo → DA16.
- C = sort, `hideBelow` theo kiểu, thẻ Kanban → DA17.
- C = lọc → DA18.
- Cài đặt › Trường (tên trường chuẩn theo locale, sắp lại, ẩn, Bắt buộc) → DA15.
- A = Tệp → DA19, DA20.

## Never (ở hàng này)

- A = Tiền cho trường tự tạo: đổi schema `FIELD_TYPES`, chưa có hàng.
- Câu lỗi tiếng Anh của API cho máy gọi: hợp đồng máy với máy.
- Ô Công ty, Giai đoạn, vai trò liên hệ: không có dòng kiểu (Hỏi-1).

## Ô đã gạch

- E = bản ghi đã lưu trữ: `KhoaLuuTru` khoá cả phiếu như nay; bảng đăng ký nằm trong nó, không có hành vi mới.
- E = đang lưu: vòng quay của các ô `Inline*` hiện có, bảng đăng ký giữ nguyên.
