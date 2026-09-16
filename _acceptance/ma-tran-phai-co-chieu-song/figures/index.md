# Hình tại điểm quyết định — ma-tran-phai-co-chieu-song

Kê từ artifact cuối S1: sổ quyết định có 6 entry chờ niêm (2 `approach`,
2 `descope`, 2 `fix`), Coverage không có dòng `[GIẢ ĐỊNH]` nào, gap-probe
không có finding nào xử lý `human-gate1`.

| Điểm | Đếm | Hình |
|---|---|---|
| Giữ lời hứa lớp và làm cho nó thật (`d-…-1`) | 3 nhánh rẽ — giữ lớp · thu về điểm · mở rộng cả trục | **cần hình** — gộp vào hình 1 |
| Chiều đỏ cắm vào đâu (`d-…-2`) | 2 nhánh rẽ — chỗ trùng sàn · chỗ chưa ai canh | **cần hình** — gộp vào hình 1 |
| Bỏ đặc tả UX (`d-…-3`) | 1 nhánh | dưới ngưỡng: 1 |
| Park hai ô của trục A (`d-…-4`) | 1 nhánh | dưới ngưỡng: 1 |
| Sửa 2 P0 của phản biện (`d-…-5`) | 1 nhánh | dưới ngưỡng: 1 |
| Sửa 3 P1 của phản biện (`d-…-6`) | 1 nhánh | dưới ngưỡng: 1 |

## Đề bài hình 1 — `ai-bat-duoc-gi.html`

Loại: bản đồ phủ (ma trận đường leo quyền × phép đo bắt được nó).

- **Hàng** = bốn ô của trục A, ghi bằng chữ người đọc hiểu:
  1. thuộc tính phiên **mới**, khoá khác tên → cổng đọc nó
  2. cổng đọc thẳng nguồn ngoài khối thuộc tính
  3. ghi đè quyền **sau khi** hàm thật trả về
  4. cổng suy từ một thuộc tính **đã có sẵn** trong khối
- **Cột** = ba phép đo: hai sàn AST của hồ sơ trước · bài hành vi của vòng này
  (AC-1 + AC-2) · *không ai bắt*.
- **Ô** đánh dấu ai bắt được hàng nào. Sự thật cần hiện ra: hàng 1 chỉ có bài
  hành vi bắt được — đó là lý do vòng này tồn tại; hàng 4 không cột nào bắt —
  đó là giới hạn đã khai; hàng 2 và 3 là ô đã park.
- Nhấn thêm một nhánh phụ: **đường rẻ đã loại** — nếu cắm chiều đỏ ở chỗ gọi
  thì cả sàn AST lẫn bài hành vi cùng bắt, tức mua một thứ đã có người bán.

Nhãn bằng chữ cho người; tên tệp và tên hàm xuống chú thích dưới hình.
