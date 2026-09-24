# Một tên cho đồng tiền báo cáo — design

Ngày: 2026-09-24 · Hồ sơ: `_acceptance/ten-dong-tien-bao-cao/` · Hạng: T2 · Xếp chồng lên PR #117 (`tien-te-chua-tai-khong-doan`)

## Vấn đề

Ngoài-1 của hồ sơ `tien-te-chua-tai-khong-doan`: thiết lập `AppSetting.reportingCurrency` mang hai tên. Màn Cài đặt → Tiền tệ và ô thêm nhanh gọi là «Đồng tiền báo cáo» / "Reporting currency"; tấm tạo thoả thuận gọi là «đồng tiền mặc định» / "default currency". Người đọc lời báo lỗi ở tấm tạo không tìm ra thiết lập nào tên «mặc định» ở Cài đặt. `CONTEXT.md` chưa có mục cho khái niệm này.

## Hướng

- Giữ «đồng tiền báo cáo»: đã là tên ở Cài đặt, ở thêm nhanh, và nói đúng vai của nó (đồng mọi tổng và báo cáo quy về). «Mặc định» chỉ nói chỗ điền sẵn ở một ô.
- Thêm mục **Đồng tiền báo cáo** vào `CONTEXT.md`, `_Avoid_`: đồng tiền mặc định, default currency.
- Sửa hai câu của tấm tạo (vi, en). Cập nhật bài kiểm và thước màn thật của hồ sơ `tien-te-chua-tai-khong-doan` đang so đúng chuỗi cũ; ghim lại hồ sơ đó.
- Hợp đồng `tien-te-chua-tai-khong-doan` ghim nguyên văn câu cũ ở AC-1/AC-2: không sửa hợp đồng đã duyệt, thêm một dòng Notes trỏ sang hồ sơ này là nơi thay chữ.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: không đổi — thiết lập tải xong thì không câu nào trong vòng này hiện ra.
- Biên: thiết lập đang tải → tấm tạo nói «Đang tải đồng tiền báo cáo…».
- Lỗi & quay lại: tải lỗi → tấm tạo nói «Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền.»; người chọn đồng tiền bên cạnh như cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tấm tạo thoả thuận | tạo một thoả thuận | nút Thêm ở màn Thoả thuận / tấm thoả thuận mới |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tao-dang-tai-bao-cao | tấm tạo | «Đang tải đồng tiền báo cáo…» / "Loading the reporting currency…" | chờ, hoặc tự chọn đồng tiền |
| ST-tao-loi-bao-cao | tấm tạo | «Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền.» / "Couldn't load the reporting currency — pick a currency next to the amount to enter it." | chọn đồng tiền |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không đổi hành vi nào; chỉ đổi chữ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `MoneyInput` | dùng | câu vẫn do tấm tạo truyền vào như vòng trước |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên, không tra — chỉ đổi chữ của hai câu trong một biểu mẫu có sẵn.
<!-- UX-SPEC-TEMPLATE>>> -->
