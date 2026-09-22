# Lối vào cho điều phối 30 ngày đầu

## Vấn đề

PR #66 đưa hai màn lên prod: danh mục «30 ngày đầu» (`/<slug>/onboarding`) và
«Cài đặt › Điều phối 30 ngày» (`/<slug>/settings/onboarding`). Lái thử trên
`onehub.center` ngày 2026-09-21 cho thấy cả hai chạy đúng, nhưng không có lối bấm
vào nào. Thanh điều hướng chính có bảy mục, thanh bên Cài đặt có tám mục, và
không mục nào dẫn tới hai màn này. Người dùng chỉ tới được khi gõ thẳng địa chỉ.

Hồ sơ `dieu-phoi-30-ngay-dau` không có tiêu chí nào về lối vào, nên 15 phép đo
của nó không bắt được chỗ hở này.

## Cách làm

- Thanh điều hướng chính thêm mục thứ tám «30 ngày đầu» (en «First 30 days»),
  đứng ngay trước Cài đặt, biểu tượng lộ trình. Nhãn dùng lại đúng tiêu đề của màn
  danh mục, để chữ trên thanh khớp chữ trên màn.
- Mục đó sáng khi người đứng ở danh mục hoặc hồ sơ một kế hoạch. Khi ở Cài đặt ›
  Điều phối thì mục Cài đặt sáng, vì thanh chính chọn mục theo tiền tố đường dẫn.
- Thanh bên Cài đặt thêm mục cuối «Điều phối 30 ngày» (en «Onboarding»), khớp tiêu
  đề của màn cài đặt.
- Danh sách mục của thanh bên Cài đặt tách ra `apps/app/lib/cai-dat-dieu-huong.ts`,
  cùng khuôn với `khung-dieu-huong.ts` của thanh chính. Trước đó danh sách nằm
  trong thành phần giao diện nên không bài kiểm nào với tới được.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bất kỳ màn nào trong không gian làm việc → bấm «30 ngày đầu» trên thanh chính → màn danh mục (điểm ra: hồ sơ một kế hoạch, mục vẫn sáng)
- Suôn sẻ: Cài đặt → bấm «Điều phối 30 ngày» trên thanh bên → màn khuôn và bộ phận
- Biên: chưa có khuôn nào → màn danh mục hiện trạng thái trống sẵn có, có nút sang Cài đặt › Điều phối

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thanh điều hướng chính | Đưa người tới một khu của CRM | Mọi màn / tám khu |
| Thanh bên Cài đặt | Đưa người tới một trang cài đặt | Cài đặt / chín trang |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-thanhchinh-dieuphoi-sang | Thanh điều hướng chính | Biểu tượng «30 ngày đầu» được đánh dấu đang mở | Bấm mục khác để rời |
| ST-thanhchinh-dieuphoi-thuong | Thanh điều hướng chính | Biểu tượng «30 ngày đầu» ở trạng thái thường | Bấm để vào danh mục |
| ST-caidat-dieuphoi-sang | Thanh bên Cài đặt | Mục «Điều phối 30 ngày» được đánh dấu đang mở | Bấm mục khác để rời |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ nhỏ: thanh chính dùng lại lối điều hướng di động sẵn có, nên mục mới hiện ở đó theo cùng danh sách.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Thanh biểu tượng của ứng dụng | dùng | Thêm một phần tử vào danh sách sẵn có, không đổi thành phần |
| Thanh bên Cài đặt | dùng | Thêm một phần tử vào danh sách sẵn có, không đổi thành phần |
| Biểu tượng Roadmap (Carbon) | dùng | Cùng bộ biểu tượng với bảy mục còn lại |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: thanh chính của CRM vốn là một trung tâm toả ra các khu; lối vào mới chỉ thêm một nhánh, không đổi khuôn. Luồng hiển nhiên nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
