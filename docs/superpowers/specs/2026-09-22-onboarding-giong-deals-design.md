# Trang «30 ngày đầu» theo khuôn trang danh sách

Ngày 2026-09-22 · hồ sơ `_acceptance/onboarding-giong-deals/` · hạng T2

## Vấn đề

Chủ kho thấy trên `onehub.center/onehub/onboarding` ba chỗ lệch so với
`/onehub/deals`, hai trang lẽ ra dùng chung một khuôn danh sách:

1. Nút «Kế hoạch mới» nằm trong thanh công cụ, kiểu viền, không icon. Deals đặt
   «Thoả thuận mới» ở góc phải đầu trang, tô màu chính, có icon ➕. Chủ kho chốt
   giữa phiên: nút phải cùng vị trí và cùng màu với «Thoả thuận mới».
2. Tiêu đề cột bị cắt: «Im lặ…», «Bư…», «N…».
3. Trên điện thoại, nút tạo và bộ lọc trạng thái bị giấu trong ô «Lọc» thu gọn.

Rà sâu (đo trên trình duyệt ở 5 khổ × 2 ngôn ngữ, cộng một lượt đọc mã) ra thêm:

- Không khai sắp xếp mặc định: máy chủ xếp theo ngày bắt đầu tăng dần, nhưng
  không mũi tên nào sáng và menu «Sắp xếp» không chọn gì.
- Lần tải đầu và lúc lỗi, trang trả sớm một khối riêng: thanh công cụ và ô tìm
  biến mất rồi hiện lại, bố cục nhảy; khi lỗi thì không đổi hay xoá được bộ lọc.
- Lọc lại không có dấu đang tải (thiếu `loading` của `DataTable`).
- Ô trống là chuỗi `"—"` viết tay hoặc rỗng hẳn, cột số không `tabular-nums`,
  đơn vị «n» của cột Im lặng viết cứng, tiếng Anh cũng ra «8n».
- Cột «Đối tác» ẩn được trong menu Cột (các trang khác khoá cột tên).
- Ô chữ xuống nhiều dòng; các trang khác cắt một dòng.
- Nhãn lựa chọn trong bộ lọc kèm số «Tên · 3»; trang khác chỉ ghi tên.
- Tạo xong kế hoạch: hộp thoại đóng lặng, không thông báo, không mở kế hoạch vừa
  tạo; deals báo thành công và mở luôn bản ghi mới.

Thêm một phát hiện nằm ngoài trang này: **chính deals cũng cắt tiêu đề** ở 320,
768, 1024 («Giá trị», «Phụ trách», «Ngày chốt»). Lỗi nằm ở khuôn chung (nút sắp
xếp + độ rộng phần trăm), không riêng onboarding — tách thành hồ sơ riêng.

## Cách làm

Đi theo khuôn deals, chỉ sửa trong `apps/app`, không thêm biến thể nào vào
`packages/ui`.

- **Nút tạo lên đầu trang.** `page.tsx` đặt `<TaoKeHoach>` trong
  `PageShellActions`, biến thể `default`, có icon `Add` (cùng `Icon`/`Add` mà
  `create-deal-sheet.tsx` dùng). `KhungTao` nhận thêm một prop bật icon; các chỗ
  dùng `KhungTao` khác không đổi. Thanh công cụ chỉ còn nút chuyển Bảng/Bảng cột.
  Chưa có khuôn nào thì nút khoá (`khoaNut`), vì hộp thoại không có khuôn để chọn.
- **Độ rộng cột.** Mọi cột mang độ rộng phần trăm, tổng 100%. Dưới `sm` chỉ còn
  Đối tác, Đang tắc ở, Im lặng (ẩn Bước như deals ẩn cột tiền); Ngày dưới `sm`,
  Bộ phận dưới `md` như cũ. Tỉ lệ chốt bằng thước đo ở 5 khổ: tiêu đề có nút sắp
  xếp cần ≈ độ rộng chữ + 48px («Im lặng» ≈ 89px).
- **Sắp xếp mặc định** `startedAt` tăng dần khai trong
  `onboarding-search-params.ts` — đúng thứ tự máy chủ đang trả, nên thứ tự hàng
  không đổi; chỉ là nay màn hình nói ra nó.
- **Tải và lỗi trong bảng.** Chế độ bảng luôn vẽ `DataTable`: `rows=[]` +
  `loading` khi đang tải lần đầu, `loading={isFetching}` khi lọc lại; chữ «Đang
  tải…» giữ ở `meta` trong một vùng `aria-live="polite"`. Lỗi đi vào ô `empty`
  của bảng cùng nút «Thử lại». Hai trạng thái trống toàn trang (chưa có khuôn,
  chưa có kế hoạch) giữ nguyên.
- **Ô.** `EmptyCellValue` cho giá trị rỗng và Im lặng = 0; `tabular-nums` cho ba
  cột số; khoá thông điệp mới `cells.silentDays` («{n} ngày» / «{n}d»). Ô chữ
  `truncate` + `translate="no"`.
- **Cột Đối tác** `hideable: false`. **Nhãn bộ lọc** chỉ là tên; vẫn bỏ lựa chọn
  đếm 0 trừ khi đang chọn.
- **Tạo xong** báo thành công bằng `toast.success` rồi `openRecord({ kind: "plan",
  id })`, như deals.

Hồ sơ `noi-bon-nut-dieu-phoi` (đã ký) có AC-6 «nút tạo kế hoạch trên thanh công
cụ ở cả hai cách xem». Ý của AC đó — có nút tạo ở cả hai cách xem — vẫn giữ; chỗ
đặt đổi theo quyết định của chủ kho. Phép đo `nut-tren-thanh-cong-cu` được viết
lại để đo nút ở đầu trang, và hồ sơ đó được ghim lại ở cuối vòng.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: menu trái «30 ngày đầu» → danh sách kế hoạch đang chạy, xếp theo ngày
  bắt đầu → bấm hàng mở kế hoạch; hoặc bấm «Kế hoạch mới» ở góc phải → điền hộp
  thoại → Lưu → thông báo thành công, kế hoạch vừa tạo mở ra (điểm ra: tấm kế
  hoạch).
- Biên: chưa có khuôn → nút đầu trang khoá, thân trang mời viết khuôn; chưa có
  kế hoạch → thân trang mời tạo kế hoạch đầu tiên; bộ lọc không khớp → thông báo
  trong bảng + «Xoá bộ lọc».
- Lỗi & quay lại: tải danh sách hỏng → thanh công cụ còn nguyên, trong bảng hiện
  lỗi + «Thử lại»; lưu kế hoạch hỏng → lỗi hiện trong hộp thoại, hộp thoại không
  đóng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách 30 ngày đầu (bảng) | Thấy đối tác nào đang tắc, tắc ở đâu | Menu trái / tấm kế hoạch |
| Danh sách 30 ngày đầu (bảng cột) | Thấy kế hoạch dồn ở bước nào | Nút Bảng cột / tấm kế hoạch |
| Hộp thoại tạo kế hoạch | Tạo một kế hoạch từ khuôn | Nút «Kế hoạch mới» / tấm kế hoạch vừa tạo |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-danhmuc-dangtai | Danh sách (bảng) | Thanh công cụ + tiêu đề cột, spinner trong bảng, «Đang tải…» ở chân bảng | Chờ, hoặc gõ tìm/lọc |
| ST-danhmuc-loi | Danh sách (bảng) | Thanh công cụ còn nguyên; trong bảng: tiêu đề lỗi + «Thử lại» | Thử lại hoặc đổi bộ lọc |
| ST-danhmuc-codulieu | Danh sách (bảng) | Hàng kế hoạch, mũi tên sắp xếp ở cột Ngày | Bấm hàng / sắp xếp / lọc |
| ST-danhmuc-khongkhop | Danh sách (bảng) | Trong bảng: không khớp + «Xoá bộ lọc» | Xoá bộ lọc |
| ST-danhmuc-empty | Danh sách | Mời tạo kế hoạch đầu tiên; nút đầu trang bật | Tạo kế hoạch |
| ST-danhmuc-chuacokhuon | Danh sách | Mời viết khuôn; nút đầu trang khoá | Sang cài đặt viết khuôn |
| ST-taokehoach-xong | Hộp thoại | Hộp thoại đóng, thông báo thành công, tấm kế hoạch mở | Làm việc trên kế hoạch |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ < 640px: bảng còn ba cột Đối tác · Đang tắc ở · Im lặng; nút tạo vẫn ở đầu
  trang, không nằm trong ô «Lọc».
- Không tiêu đề cột nào bị cắt ở 320 · 375 · 768 · 1024 · 1440, cả vi lẫn en.
- «Đang tải…» đọc qua `aria-live="polite"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `PageShellActions` | dùng | Chỗ nút chính của mọi trang danh sách |
| `DataTable` (`loading`, `empty`, `meta`) | dùng | Đã có sẵn trạng thái tải/rỗng/chân bảng |
| `EmptyCellValue` | dùng | Dấu ô trống chung của deals |
| `KhungTao` | mở rộng | Thêm prop bật icon, mặc định tắt |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: trang đã là danh sách mở tấm chi tiết; việc này chỉ kéo nó về đúng khuôn
anh em (deals) — luồng hiển nhiên, không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Đổi bộ lọc trạng thái sang `tabs` của `DataTable`: bản riêng hiện số đếm và mặc
  định «Đang chạy», bảng cột cũng dùng chung tham số này; đổi là một quyết định
  sản phẩm, không phải chỉnh cho giống.
- Tiêu đề cột bị cắt ở deals và các trang danh sách khác — sửa ở khuôn chung,
  hồ sơ riêng.
- Chọn nhiều hàng + thao tác hàng loạt, lựa chọn «chưa giao», dòng `meta` tổng
  hợp, tách thanh công cụ của bảng cột thành component chung, icon cho trạng thái
  trống, hàng bảng nhận tiêu điểm bàn phím (lỗi của `DataTable` chung).
