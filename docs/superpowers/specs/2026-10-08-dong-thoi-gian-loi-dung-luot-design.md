# K6e `dong-thoi-gian-loi-dung-luot` — thông báo lỗi theo đúng lượt đã hỏng

Hàng K6e của đợt `sau-14-10`, dãy P2, ưu tiên 2.3, sau K6c (#319, onehub 9bc9e3d2a). Cổng Đáng: luật 26 — Ngoài-1, 2,
5 của `dong-thoi-gian-giu-khi-loi`, anh chọn «mở hợp đồng mới» ở Cổng 2 2026-10-08T15:12:55Z. Ô cơ hội:
`_acceptance/dong-thoi-gian-loi-dung-luot/opportunity.md`.

## Vấn đề

K6c hiện hai thông báo theo hai cờ của TanStack Query 5.101: `isFetchNextPageError` (thông báo «xem cũ» ở cuối danh
sách) và `isRefetchError` (thông báo «làm mới» ở đầu). Khi đã có dữ liệu, `status` giữ `error` qua lượt tải sau, còn hai
cờ suy theo `fetchMeta` của lượt ĐANG chạy (`infiniteQueryObserver.js`):

| Thứ tự | Trong lúc lượt sau đang chạy | Khi lượt sau xong |
| --- | --- | --- |
| Làm mới hỏng → bấm «Xem cũ hơn» | hiện «xem cũ» (sai), mất «làm mới» | trang kế được: mất «làm mới» luôn (sai — trang đầu chưa làm mới được) |
| «Xem cũ hơn» hỏng → làm mới nền | hiện «làm mới» (sai), mất «xem cũ» | làm mới được: hết cả hai (đúng) |

## Cách làm

Chỉ sửa `apps/app/components/crm/timeline/timeline.tsx`. Một hàm `useLoiTheoLuot(history, khoa)` trong cùng tệp giữ hai cờ
riêng `xemCu`, `lamMoi`, CHỈ cập nhật khi không còn lượt nào đang chạy (`!isFetching`), dựa vào dấu thời gian của lượt
vừa xong thay vì cờ của lượt đang chạy:

- Lúc rảnh, `status` quyết định nhánh xét: `status` lỗi (đã có dữ liệu) và `errorUpdateCount` tăng so với lần xét trước →
  ghi loại lỗi theo cờ lúc rảnh — `isFetchNextPageError` → `xemCu`, ngược lại → `lamMoi` (lúc rảnh, cờ phản ánh đúng lượt
  vừa xong). Dùng bộ đếm thay cho dấu thời gian để hai lỗi trong cùng một mili-giây vẫn được nhận.
- `status` thành công và `dataUpdatedAt` đổi so với lần xét trước: số trang tăng → lượt «Xem cũ hơn» thành công → tắt
  `xemCu`; số trang không tăng → lượt làm mới thành công → tắt cả `xemCu` và `lamMoi`.
- Mốc so sánh: khi gắn và khi `khoa` đổi, mốc là «chưa thấy gì» (bộ đếm −1, dấu thời gian 0), nên lần xét đầu đọc thẳng trạng
  thái hiện có trong cache — truy vấn đang lỗi trong cache (quay lại tab, mở lại ngăn trong staleTime) hiện đúng thông báo
  của nó; truy vấn thành công thì không thông báo nào.
- Giả định đã kiểm (grep `setQueryData|setInfiniteData` trong `apps/app/components`, `apps/app/lib`, `apps/app/app` — 0 chỗ
  chạm khoá dòng thời gian; `maxPages` không dùng): mọi lần `dataUpdatedAt` đổi đều do một lượt tải. Thêm một lệnh ghi
  thẳng cache dòng thời gian sau này thì phải xét lại hàm này.
- Trong lúc đang chạy: hai cờ giữ nguyên — không thông báo nào mới hiện, không thông báo nào tự tắt. Nút «Thử lại» của
  thông báo đang hiện tắt khi lượt tương ứng đang chạy (như K6c).
- `khoa` (tab lọc + bản ghi) đổi → hai cờ về rỗng và mốc về «chưa thấy gì»; tab mới chỉ mang thông báo của chính truy
  vấn của nó.

Vị trí, chữ và thành phần của hai thông báo giữ nguyên như K6c (`Alert` + `KaraRetry`, `data-dtg-loi`).

## Vòng đời (luật 14 — ba câu)

1. **Dọn thế nào:** không đổi. 2. **«Lịch sử»:** không đổi. 3. **Danh sách mặc định:** không đổi.

## Ngoài phạm vi

- Lỗi console bị răng màn K6c bỏ qua, các khoảng hở đo khác của K6c (Known limits Ngoài-3, 4, 6, 7).
- Truy vấn «Việc cần làm» (`pinned`) lỗi vẫn ẩn mục.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: như K6c — đọc, «Xem cũ hơn», hoạt động cũ hơn nối vào.
- Biên: hai lỗi chồng nhau theo hai thứ tự ở bảng trên.
- Lỗi & quay lại: thông báo chỉ đổi khi một lượt tải đã xong; «Thử lại» của thông báo làm mới là lối duy nhất tắt nó
  (một lượt làm mới thành công).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn bản ghi — tab Hoạt động | đọc và ghi lịch sử liên lạc | tab trong ngăn / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dtl-lam-moi-roi-xem-cu-dang-tai | Tab Hoạt động | thông báo «làm mới» giữ nguyên; nút «Xem cũ hơn» có chỉ báo đang tải; KHÔNG có thông báo «xem cũ» | chờ |
| ST-dtl-lam-moi-roi-xem-cu-duoc | Tab Hoạt động | hoạt động cũ hơn nối vào; thông báo «làm mới» vẫn hiện | bấm Thử lại của thông báo làm mới |
| ST-dtl-xem-cu-roi-lam-moi-dang-tai | Tab Hoạt động | thông báo «xem cũ» giữ nguyên; KHÔNG có thông báo «làm mới» | chờ |
| ST-dtl-xem-cu-roi-lam-moi-duoc | Tab Hoạt động | hết cả hai thông báo; nút «Xem cũ hơn» quay lại | đọc tiếp |
| ST-dtl-xem-cu-roi-lam-moi-loi | Tab Hoạt động | cả hai thông báo | bấm Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không thông báo nào hiện hay tắt khi một lượt tải còn đang chạy.
- Đổi tab lọc: thông báo của tab cũ không theo sang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Alert`, `KaraRetry` | dùng | giữ nguyên từ K6c |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi bố cục, chỉ đổi thời điểm hiện/tắt hai thông báo trong tab Hoạt động; luồng hiển nhiên, không tra mẫu ngoài.
<!-- UX-SPEC-TEMPLATE>>> -->
