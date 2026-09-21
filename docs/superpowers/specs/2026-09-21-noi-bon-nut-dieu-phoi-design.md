# Nối bốn nút tạo dữ liệu của «30 ngày đầu»

Chủ kho báo 21/09: trên prod, «Soạn khuôn» và «Thêm bộ phận» ở Cài đặt › Điều phối
30 ngày không làm gì. Rà cả tính năng thấy bốn nút là nút trần, chưa gắn hành động:

| Màn | Nút | Việc |
|---|---|---|
| Cài đặt › Điều phối 30 ngày | Thêm bộ phận | tạo bộ phận |
| Cài đặt › Điều phối 30 ngày | Soạn khuôn | tạo khuôn: tên, loại đối tác, các bước |
| Danh mục 30 ngày đầu | Tạo kế hoạch từ khuôn | tạo kế hoạch: công ty, khuôn, ngày bắt đầu, người cầm trịch |
| Hồ sơ kế hoạch | Thêm môi giới | ghi danh một cá nhân |

Thủ tục phía máy chủ có đủ (`createDepartment`, `createTemplate`,
`createFromTemplate`, `upsertEnrollment`), nhưng không màn nào gọi. Hệ quả: trên prod
không bắt đầu được tính năng từ màn hình, và phiên nghiệm thu của hai hồ sơ «30 ngày
đầu» đang tắc.

Lỗi thứ hai lộ ra khi đọc mã: `createFromTemplate` khai `startedAt: z.date()`, còn client
tRPC của app gửi JSON trần (không có bộ chuyển kiểu), nên mọi lời gọi từ màn đều bị từ
chối 400. Các module khác (Thoả thuận) nhận ngày dưới dạng chuỗi.

## Cách làm

- **Mỗi nút mở một hộp thoại** (`Dialog` của `@crm/ui`), gọi đúng thủ tục sẵn có; lưu xong
  thì đóng hộp thoại, làm mới truy vấn liên quan, danh sách hiện bản ghi mới. Lưu hỏng thì
  hộp thoại ở lại, giữ dữ liệu đã nhập, hiện lỗi máy chủ trả.
- **Soạn khuôn:** tên (bắt buộc), loại đối tác (tuỳ chọn), danh sách bước — mỗi bước có nhãn,
  bộ phận (chọn từ bộ phận đang có), ngày thứ mấy (số ≥ 0). Thêm/bớt bước; thứ tự gửi đi là
  thứ tự trên màn. Chưa có bộ phận nào → hộp thoại nói phải thêm bộ phận trước, không cho lưu.
- **Tạo kế hoạch:** công ty (ô chọn công ty có tìm, dùng lại `CompanyPicker`), khuôn (chọn),
  ngày bắt đầu (mặc định hôm nay), người cầm trịch (mặc định người đang dùng). Nút có ở trạng
  thái trống VÀ trên thanh công cụ danh mục khi đã có kế hoạch.
- **Thêm môi giới:** ô chọn cá nhân có tìm (theo danh sách Cá nhân). Nút có cả khi phễu trống
  lẫn khi đã có người.
- **Máy chủ nhận ngày bắt đầu dạng chuỗi:** `startedAt` của đầu vào tạo kế hoạch đổi sang
  `z.coerce.date()` — nhận chuỗi từ JSON, vẫn nhận `Date` từ bài kiểm hiện có. Hộp thoại
  gửi NGÀY LỊCH đã chọn dạng `YYYY-MM-DD` (không gửi nửa đêm giờ địa phương), nên máy chủ
  lưu đúng ngày đó bất kể múi giờ của trình duyệt.
- **Lưu một lần:** nút Lưu tắt trong lúc đang lưu, bấm thêm không gửi lời gọi thứ hai.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Điều phối 30 ngày → Thêm bộ phận → lưu → Soạn khuôn → lưu → Danh mục → Tạo kế hoạch từ khuôn → lưu → hồ sơ kế hoạch → Thêm môi giới → lưu
- Biên: soạn khuôn khi chưa có bộ phận → hộp thoại chỉ đường thêm bộ phận trước
- Lỗi & quay lại: máy chủ từ chối → hộp thoại giữ dữ liệu, hiện lỗi, người sửa rồi lưu lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp thoại Thêm bộ phận | Đặt tên một bộ phận | Cài đặt / Cài đặt |
| Hộp thoại Soạn khuôn | Khai bộ bước cho một loại đối tác | Cài đặt / Cài đặt |
| Hộp thoại Tạo kế hoạch | Mở 30 ngày cho một đối tác vừa ký | Danh mục / Danh mục |
| Hộp thoại Thêm môi giới | Đưa một cá nhân vào phễu | Hồ sơ kế hoạch / Hồ sơ kế hoạch |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hopthoai-nhap | Mọi hộp thoại | Ô nhập, nút Lưu tắt khi thiếu ô bắt buộc | Điền |
| ST-hopthoai-dangluu | Mọi hộp thoại | Nút Lưu đang chạy, không bấm lại được | Chờ |
| ST-hopthoai-loi | Mọi hộp thoại | Dữ liệu giữ nguyên, dòng lỗi máy chủ trả | Sửa, lưu lại |
| ST-khuon-chuacobophan | Soạn khuôn | Câu «thêm bộ phận trước», không có nút Lưu dùng được | Đóng, thêm bộ phận |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Lưu xong: hộp thoại đóng, danh sách liên quan làm mới, bản ghi mới hiện ra.
- Tên người, tên công ty, tên cá nhân do người nhập đánh dấu không dịch.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Dialog, Field, Input, Select, Button, DatePicker | dùng | Có sẵn ở `@crm/ui` |
| CompanyPicker | dùng | Ô chọn công ty có tìm, đang dùng ở tạo thoả thuận |
| Ô chọn cá nhân | ghép | Chưa có; ghép từ Combobox như CompanyPicker, đặt ở màn điều phối |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hộp thoại tạo nhanh trên màn danh sách
Căn cứ: cùng khuôn với tạo thoả thuận của kho; luồng hiển nhiên nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
