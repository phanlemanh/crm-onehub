# Số điện thoại ở thoả thuận và tab Cá nhân của công ty — design (DT2 `dien-thoai-o-deal-cong-ty`)

Ngày 2026-10-10 · làn P6 đợt sau-14-10 · hạng T2 · nối tiếp DT1 (`dien-thoai-ca-nhan`, #332). Anh chọn cách hiện A.

## Thiết kế

- **API** — `CONTACT_SELECT` của `deals.service.ts` thêm `phone`; `dealContactSummaryOutput` (`deals.contracts.ts`) thêm `phone: string | null` → có ở `deals.byId` (người trong thoả thuận) và `deals.contactOptions` (ô chọn người). `companies.service.ts` chọn thêm `phone` cho danh sách người của công ty; `companyDetailContactOutput` thêm `phone`.
- **Bảng người trong thoả thuận** (`deal-sheet.tsx`): cột «Điện thoại» ngay sau «Tên», trước Vai trò; ô dùng `SoDienThoai` của DT1 (dạng `0901 234 567`, `tabular-nums`, `translate="no"`), ô trống chuẩn khi không có số. Độ rộng: Tên 24%, Điện thoại 16%, Vai trò 18%, Chức danh 18%, Email 18%.
- **Bảng Cá nhân trong ngăn công ty** (`company-sheet.tsx`): cột «Điện thoại» ngay sau tên, giữ Chức danh, Email, Phụ trách.
- **Ô chọn người** (`AttachDealContact` trong `quick-add.tsx`): mỗi lựa chọn «tên · chức danh · 0901 234 567» (bỏ vế nào trống).
- Chữ: `record-sheet.ts` thêm `deal.contactColumns.phone` và `company` tiêu đề cột (en «Phone», vi «Điện thoại»).
- Dòng trong bảng bấm được để mở người, nên số trong bảng là chữ, không phải liên kết gọi (liên kết gọi ở ngăn cá nhân — DT1).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở thoả thuận → bảng người có cột «Điện thoại» → đọc số để gọi; bấm «Thêm cá nhân» → ô chọn hiện số dưới từng người.
- Biên: người không có số → ô trống chuẩn; ô chọn bỏ vế số.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn thoả thuận — bảng người | thấy ai trong thoả thuận và liên hệ họ | bảng thoả thuận / ngăn cá nhân |
| Ngăn công ty — tab Cá nhân | thấy người của công ty | bảng công ty / ngăn cá nhân |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-deal-co-so | Bảng người của thoả thuận | cột Điện thoại hiện `0901 234 567` | gọi |
| ST-deal-khong-so | Bảng người của thoả thuận | ô trống chuẩn | mở người để thêm số |
| ST-chon-nguoi | Ô chọn người | «tên · chức danh · số» | chọn người |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ngăn hẹp: cột Điện thoại giữ đủ 12 ký tự `0901 234 567`, các cột khác cắt chữ dài bằng `truncate` như hiện tại.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `SoDienThoai` (`components/crm/so-dien-thoai.tsx`, DT1) | dùng | hiện số thống nhất với bảng Cá nhân |
| `SimpleTable`, `TableCell`, `EmptyCellValue` | dùng | bảng có sẵn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi khuôn — thêm cột vào bảng có sẵn trong ngăn chi tiết.
<!-- UX-SPEC-TEMPLATE>>> -->
