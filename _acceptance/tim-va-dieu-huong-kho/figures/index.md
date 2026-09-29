# Hình tại điểm quyết định — tim-va-dieu-huong-kho (Cổng Phạm vi)

Kê từ sổ quyết định (bảy dòng chờ seal), hai dòng `[GIẢ ĐỊNH]` của Coverage, và định đoạt
P0 của gap-probe. Không có finding `human-gate1`.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-2 tách lịch sử, khôi phục, lưu trữ sang 3b | 2 nhánh rẽ (gộp · tách), mỗi nhánh 3 hệ quả nối tiếp | `tach-lan-3b` |
| d-1 tìm trên cột ghi lúc duyệt · d-4 câu ngữ cảnh tính lúc đọc · P0 ai thấy tên trang chưa duyệt | 3 bước nối tiếp (đề xuất → duyệt → cột/bảng) rồi 3 nhánh đọc | `duong-doc-va-rao` |
| d-3 ⌘K là nhóm trong hộp toàn app · d-5 dòng nhắc đếm bằng số tab | 2 nhánh mỗi điểm (hộp riêng · nhóm chung; một hàm · hai hàm) | `cmdk-va-nhac-sang` |
| d-6 không đo lượt tìm bằng telemetry | dưới ngưỡng: 1 nhánh làm, nhánh kia là không làm, 0 bước | — |
| d-7 chạy design-pass nac-1 | dưới ngưỡng: quyết định quy trình, 0 nhánh sản phẩm | — |
| [GIẢ ĐỊNH] bộ tách `simple` đủ cho tiếng Việt | dưới ngưỡng: 1 câu giả định, không luồng | — |
| [GIẢ ĐỊNH] quản trị nhận dòng nhắc mọi sáng | dưới ngưỡng: 1 câu, đã có trong `cmdk-va-nhac-sang` | — |

## Đề bài từng hình

### `tach-lan-3b` — so sánh hai nhánh

- Loại: so sánh hai cột (hai nhánh rẽ từ một điểm «Lượt 3 như lộ trình mục 4»).
- Nhánh «Tách (máy khuyên)»: Lượt 3 T2, 12 AC, không migration, không Cổng 1.5 → Lượt 3b `lich-su-va-luu-tru-trang` T3 khoảng 5 AC (cột lưu trữ, lịch sử, khôi phục, lưu trữ qua duyệt, trang lưu trữ biến khỏi tìm/nhắc tới/Sức khoẻ).
- Nhánh «Gộp»: một lượt T3, 16–17 AC vượt trần 15 của kit, thêm Cổng 1.5, phải cắt chỗ khác.
- Nhãn chung: «TaiLieuTrang chưa có trạng thái lưu trữ → lưu trữ cần packages/db/prisma».
- AC liên quan: AC-7 (Sức khoẻ), Out of scope dòng 1.

### `duong-doc-va-rao` — luồng dữ liệu và rào quyền

- Loại: luồng dữ liệu trái → phải.
- Nút trái: «Bản đề xuất (chưa duyệt)» — chữ thân, tên trang nháp.
- Bước: «Duyệt» → ghi «Phiên bản / bản đang dùng» + «cột timKiem (unaccent, lúc duyệt)» + «bảng liên kết (thay trọn lúc duyệt)».
- Ba đường đọc bên phải: «taiLieu.tim ⌘K» đọc cột timKiem; «Trang nhắc tới» đọc bảng liên kết + câu từ bản đang dùng lúc đọc; «Sức khoẻ» đọc bảng liên kết + bản đang dùng.
- Một đường riêng từ «Bản đề xuất» thẳng tới «Sức khoẻ: Có đề xuất chờ duyệt», qua cổng «luật lượt 1: người tạo, chủ trang, quản trị» — chỉ tên trang và số bản, không chữ thân.
- Nhãn chốt: «chữ thân bản chưa duyệt không vào đường đọc nào».
- AC liên quan: AC-1, AC-2, AC-5, AC-7, AC-8.

### `cmdk-va-nhac-sang` — hai quyết định nhỏ cạnh nhau

- Loại: hai ô cạnh nhau, mỗi ô một luồng ngắn.
- Ô trái «⌘K»: phím ⌘K / nút «Tìm nhanh ⌘K» → một hộp QuickSwitcher → nhóm Công ty · Người · Thoả thuận (search.quick, phạm vi đối tác) + nhóm Tài liệu (taiLieu.tim, phạm vi chung). Vai okr: ba nhóm đầu ẩn, nhóm Tài liệu còn. Nhánh bỏ: «hộp ⌘K riêng của kho — hai bộ nghe cùng phím».
- Ô phải «Nhắc sáng»: hàm `demChoDuyet` (packages/db) → tab «Chờ duyệt» và dòng «N bản đề xuất chờ bạn duyệt» (Zalo/Slack) và thẻ «Việc của bạn». Quản trị: N = mọi bản chờ của kho. Nhánh bỏ: «chỉ trang mình làm chủ».
- AC liên quan: AC-3, AC-9.
