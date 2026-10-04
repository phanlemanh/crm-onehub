# Màn «Đã gửi» đếm đúng KR còn chờ — design

Hồ sơ: `_acceptance/da-gui-dem-dung-kr-cho/` · tách từ Ngoài-3 của `man-okr-truoc-r1` (chủ kho chọn «mở hợp
đồng mới» ở Cổng Bằng chứng, 04/10) · phiên P2, hạn trong mốc R1 12/10.

## Vấn đề

`BangCapNhat` (`okr/cap-nhat-tuan/cap-nhat-tuan.tsx`) dựng màn «Đã gửi» (`DaGui`) với
`chuaGui={tong - daGui.dong.length}` — mọi KR không nằm trong lượt gửi này bị coi là «còn chờ», kể cả KR
đã gửi trước đó trong tuần. Hai luồng mới của R1c chạm đúng chỗ đó:

1. Đã gửi đủ → «Sửa cập nhật» → chọn mức cho một KR → gửi: màn ghi «1 KR chưa chọn mức tự tin vẫn chờ lần
   gửi sau», trong khi KR kia đã gửi tuần này.
2. Gửi một phần (x/y) → gửi nốt KR còn thiếu: màn ghi còn KR chờ, trong khi mọi KR đã gửi.

Người dùng tưởng mình còn thiếu và gửi lại — đúng hành vi R1c muốn chặn.

## Hướng

«Còn chờ» = KR **chưa có cập nhật tuần này** (`updatedThisWeek` sai lúc mở trang) **và không nằm trong lượt
gửi vừa xong**. Chỉ đổi phép đếm ở chỗ gọi `DaGui`; chữ `daGui.conCho` giữ nguyên, khi số là 0 thì câu không
hiện (hành vi cũ).

Phương án đã loại: đọc lại danh sách từ máy chủ sau khi gửi rồi đếm — thêm một lượt gọi mạng cho một con
số đã suy được từ dữ liệu đang có.

## Chuẩn nội

`docs/design.md` (không thêm khối, không đổi thành phần), `web-design-guidelines` (câu trạng thái vẫn trong
vùng `Alert` đang có). Không đổi chữ nên `messages-guard` không đổi.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở Cập nhật tuần (đã gửi đủ) → «Sửa cập nhật» → chọn mức một KR → Gửi → màn «Đã gửi» không có câu «… vẫn chờ lần gửi sau».
- Biên: gửi một phần rồi gửi nốt → không câu chờ; ba KR, một đã gửi, gửi một trong hai KR còn lại → «1 KR … vẫn chờ».
- Lỗi & quay lại: gửi lỗi → `ST-capnhat-loigui` như cũ, không tới màn «Đã gửi».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cập nhật tuần — «Đã gửi» | Báo lượt gửi vừa xong và còn KR nào chờ | nút Gửi / Về Của tôi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-capnhat-dagui | Cập nhật tuần | «Đã gửi N cập nhật lúc …», lần kế tiếp; thêm «K KR chưa chọn mức tự tin vẫn chờ lần gửi sau» CHỈ khi K > 0, K = số KR chưa gửi tuần này và không có trong lượt gửi | Về Của tôi |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- K đếm từ dữ liệu lúc mở trang (`updatedThisWeek`) cộng danh sách KR của lượt gửi; không gọi lại máy chủ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DaGui` (màn có sẵn) | dùng | chỉ đổi số truyền vào |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: màn có sẵn, không đổi khuôn — chỉ sửa một con số.
<!-- UX-SPEC-TEMPLATE>>> -->
