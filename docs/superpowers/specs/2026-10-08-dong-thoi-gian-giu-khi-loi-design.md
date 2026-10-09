# K6c `dong-thoi-gian-giu-khi-loi` — dòng thời gian giữ những gì đã tải khi lỗi

Hàng K6c của đợt `sau-14-10`, dãy P2, ưu tiên 2.2, sau K6b (#314, onehub 591bc8fb). Cổng Đáng: luật 26 — Ngoài-1 và
Ngoài-5 của `kara-trang-thai-toan-crm`, anh chọn «mở hợp đồng mới» ở Cổng 2 2026-10-08T07:13:17Z. Ô cơ hội:
`_acceptance/dong-thoi-gian-giu-khi-loi/opportunity.md`.

## Vấn đề

`components/crm/timeline/timeline.tsx` (sau K6b) rẽ nhánh theo thứ tự `isPending` → `isError` → rỗng → danh sách. Với
`useInfiniteQuery` của TanStack Query v5, `isError` bật cả khi đã có dữ liệu:

| Lối lỗi | Cờ của TanStack | Dữ liệu cũ | Màn hôm nay |
| --- | --- | --- | --- |
| Tải trang đầu hỏng | `isLoadingError` | không có | khung «Không tải được hoạt động» + «Thử lại» — đúng (K6b AC-1) |
| «Xem cũ hơn» (`fetchNextPage`) hỏng | `isFetchNextPageError` | còn đủ các trang đã tải | thay cả danh sách bằng khung lỗi — sai |
| Làm mới nền (`refetch`, `invalidate` sau khi ghi hoạt động) hỏng | `isRefetchError` | còn | thay cả danh sách bằng khung lỗi — sai |

Thêm nữa, «Thử lại» của khung gọi `refetch()`: với truy vấn vô hạn, đó là tải lại mọi trang từ đầu, không phải tải
tiếp trang còn thiếu.

## Cách làm

Chỉ sửa `timeline.tsx` và thêm khoá chữ vào `lib/messages/crm.ts`. Thứ tự nhánh mới:

1. `isPending` → `Spinner` như cũ.
2. Lỗi khi CHƯA có trang nào (`isError && !data`) → `VungTaiLoi` như K6b, «Thử lại» = `refetch()`.
3. Có dữ liệu mà rỗng (không hoạt động, không việc cần làm) → trạng thái rỗng như cũ; lượt làm mới hỏng ở trạng thái
   này hiện thông báo làm-mới ngay trên khung rỗng (mục 4b).
4. Có dữ liệu → danh sách như cũ, cộng:
   - (a) **«Xem cũ hơn» hỏng** (`isFetchNextPageError`): cuối danh sách, chỗ nút «Xem cũ hơn», hiện `Alert`
     «Không tải được hoạt động cũ hơn.» + `KaraRetry` «Thử lại» → `fetchNextPage()`: chỉ trang kế, theo `nextCursor`
     của trang cuối đã tải. Đang tải thì nút tắt.
   - (b) **Làm mới hỏng** (`isRefetchError`): đầu vùng danh sách hiện `Alert` «Không làm mới được hoạt động. Đang hiện
     bản đã tải.» + «Thử lại» → `refetch()`. Danh sách giữ nguyên bản đã tải.

`Alert` không đổi biến thể (mặc định), không `className` riêng ngoài khoảng cách đặt chỗ; nút là `KaraRetry` — nút «Thử
lại» duy nhất của kho (ai-ux mục 7, đã dùng trong `VungTaiLoi`). Tiền lệ: `tai-lieu/danh-sach-trang.tsx` dùng `Alert` +
`AlertAction` + nút thử lại cho lỗi một khối phụ. `Alert` mang `role="alert"` nên trình đọc màn báo ngay khi hiện.

Không đổi API (`activities.timeline` đã có `cursor`), không đổi truy vấn «Việc cần làm» (`pinned`) hay số đếm tab.

## Vòng đời (luật 14 — ba câu)

1. **Dọn thế nào:** không đổi — K6c không thêm hay bớt cách xoá, lưu trữ hoạt động.
2. **«Lịch sử» nghĩa là gì:** không đổi — dòng thời gian vẫn là lịch sử hoạt động; K6c chỉ giữ phần đã tải khi tải thêm
   hỏng.
3. **Danh sách mặc định hiện gì:** không đổi.

## Ngoài phạm vi

- Truy vấn «Việc cần làm» (`pinned`) lỗi vẫn im lặng ẩn mục — lớp lỗi «lỗi hiện như rỗng» còn lại của dòng thời gian,
  tách hàng nếu anh muốn.
- Số đếm trên tab lỗi vẫn ẩn số — không gây hiểu sai nội dung.
- Hoạt động trên website làm mới hỏng thay nội dung bằng khung lỗi (Ngoài-2 của K6b, anh ghi Known limits).
- Tự tải khi cuộn tới cuối (cuộn vô hạn) — vẫn bấm «Xem cũ hơn».

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở ngăn → tab Hoạt động → đọc → «Xem cũ hơn» → các hoạt động cũ hơn nối vào cuối (điểm ra: đóng ngăn).
- Biên: hết trang cũ hơn → không còn nút «Xem cũ hơn»; chưa có hoạt động → trạng thái rỗng.
- Lỗi & quay lại: «Xem cũ hơn» hỏng → danh sách giữ nguyên, cuối danh sách báo «Không tải được hoạt động cũ hơn.» +
  «Thử lại» → tải đúng trang thiếu; làm mới hỏng → danh sách giữ nguyên, đầu danh sách báo «Không làm mới được hoạt
  động. Đang hiện bản đã tải.» + «Thử lại»; tải đầu hỏng → khung «Không tải được hoạt động» như K6b.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn cá nhân / công ty / thoả thuận / kế hoạch — tab Hoạt động | đọc và ghi lịch sử liên lạc của bản ghi | tab trong ngăn / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dtg-dang-tai | Tab Hoạt động | Spinner giữa vùng (như cũ) | chờ |
| ST-dtg-loi-dau | Tab Hoạt động | khung «Không tải được hoạt động» + «Thử lại» (K6b) | bấm Thử lại |
| ST-dtg-rong | Tab Hoạt động | trạng thái rỗng của tab (như cũ) | ghi hoạt động |
| ST-dtg-xem-cu-loi | Tab Hoạt động | danh sách đã tải + cuối danh sách «Không tải được hoạt động cũ hơn.» + «Thử lại» (thay nút «Xem cũ hơn») | bấm Thử lại |
| ST-dtg-lam-moi-loi | Tab Hoạt động | đầu danh sách «Không làm mới được hoạt động. Đang hiện bản đã tải.» + «Thử lại»; danh sách đã tải bên dưới | đọc tiếp hoặc bấm Thử lại |
| ST-dtg-rong-lam-moi-loi | Tab Hoạt động | «Không làm mới được hoạt động. Đang hiện bản đã tải.» + «Thử lại» phía trên trạng thái rỗng của tab | bấm Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Thử lại» sau lỗi «Xem cũ hơn» gọi đúng một lượt tải trang kế (cursor của trang cuối đã tải); không tải lại trang đầu.
- «Thử lại» khi đang tải thì tắt — không gọi chồng.
- Thử lại thành công: thông báo biến mất; «Xem cũ hơn» quay lại nếu còn trang.
- Thử lại lỗi lần nữa: thông báo vẫn đó, danh sách vẫn nguyên.
- 390: thông báo nằm trong bề rộng ngăn, chữ xuống dòng, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Alert`, `AlertDescription`, `AlertAction` | dùng (bậc 1) | báo lỗi một phần trong vùng còn dùng được — tiền lệ `danh-sach-trang.tsx` |
| `KaraRetry` | dùng (bậc 1) | nút «Thử lại» duy nhất của kho (ai-ux mục 7) |
| `VungTaiLoi`, `Spinner`, `DetailSheetEmpty` | dùng | có sẵn, không đổi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: K6c không đổi bố cục — chỉ đổi trạng thái lỗi bên trong tab Hoạt động của ngăn bản ghi (chi tiết của danh
sách); luồng hiển nhiên, không tra mẫu ngoài.
<!-- UX-SPEC-TEMPLATE>>> -->
