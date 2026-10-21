# Khung chờ trang Theo đơn vị một hình — thiết kế (DH12)

Hàng DH12 của `docs/plan/lo-trinh-okr.json`, mở từ Ngoài-1 của hồ sơ đã ký `trang-don-vi-mot-bang` (DH2): chủ kho chọn
«mở hợp đồng mới» ở Cổng Bằng chứng 17/10 (`d-20261017T223322Z-56`). Câu giao: «Mở trang Theo đơn vị lúc đang tải chỉ
thấy một khung chờ đúng hình bảng, không hai khung khác hình nối nhau». Ghi chú của hàng: «Sửa đúng tầng: thêm biến thể
cho khung xương chung của packages/ui.»

## Vấn đề

Trang Theo đơn vị có hai khung chờ khác hình:

1. `page.tsx` bọc nội dung trong `<Suspense fallback={<KhungXuong hinh="bang" />}>` — hình `bang` dùng chung của mọi
   trang danh sách: hàng công cụ ba vạch cao 32 px, đầu bảng 36 px, tám dòng một vạch cao 36 px.
2. `theo-don-vi.tsx` vẽ `KhungDangTaiDonVi` (tự dựng trong `hang-cong-cu.tsx`) khi kỳ, quyền, cây hay danh sách mục
   tiêu còn chờ: hàng công cụ vạch cao 28 px theo đúng ô chọn đơn vị và nút chuyển kiểu xem, đầu bảng 44 px, năm dòng
   hai tầng (tên mục tiêu, dòng phụ, cột tình trạng từ `md`, cột tiến độ). Hình này là hình đích đã duyệt ở bản mẫu
   của DH2 (`/proto/trang-don-vi-mot-bang`, trạng thái `ST-donvi-dangtai`).

Mở trang hay đổi đơn vị, người dùng có thể thấy khung (1) rồi khung (2) nối nhau trước khi bảng hiện. Khung (1) cũng
không giống bảng sắp hiện: dòng mỏng một vạch, trong khi dòng mục tiêu thật có hai tầng.

## Hướng đã chọn

Thêm hình thứ sáu `bang-hai-dong` vào `KhungXuong` của `packages/ui`, chép đúng hình của khung (2). Trang Theo đơn vị
dùng một thành phần khung chờ ở cả ba pha tải:

- `KhungDangTaiDonVi` thôi vẽ tay: nó bọc `<KhungXuong hinh="bang-hai-dong">` và giữ `data-trang-thai="ST-donvi-dangtai"`
  cùng câu «Đang tải OKR…».
- `page.tsx` lấy chính `KhungDangTaiDonVi` làm fallback của `Suspense`, thay `KhungXuong hinh="bang"`.
- Khi hàng công cụ thật đã có (đổi đơn vị), `KhungXuong` nhận nó qua một khe `thanhCongCu` và vẽ nó NGOÀI phần
  `aria-hidden`, để ô chọn đơn vị vẫn bấm được và trình đọc màn hình vẫn đọc được. Phần bên phải hàng công cụ (chỗ
  của tìm kiếm, lọc, sắp xếp) vẫn là vạch của `packages/ui`.
- `KhungXuong` nhận thêm `nhan` để trang đặt câu trạng thái riêng («Đang tải OKR…»); vắng thì giữ «Đang tải…».

Năm hình cũ (`bang`, `danh-sach`, `the`, `tong-quan`, `chi-tiet`) giữ nguyên: Liên hệ, Thoả thuận, Công ty, Chiến
dịch, Onboarding và các trang Cài đặt có bảng một dòng, không đổi.

### Lối đã loại

- **Đổi hình `bang` dùng chung thành dòng hai tầng.** Sáu trang khác có bảng một dòng; đổi hình chung vì một trang làm
  khung của sáu trang kia lệch bảng của chúng.
- **Chỉ đổi fallback của `page.tsx` sang `KhungDangTaiDonVi` vẽ tay, không chạm `packages/ui`.** Nhanh hơn một bước,
  nhưng giữ khung vẽ tay trong `apps/app` — bảng «Dấu hiệu vẽ tay» của `docs/design.md` trả lại ở review, và ghi chú của
  hàng nói rõ sửa ở `packages/ui`.
- **Khe `thanhCongCu` nằm trong phần `aria-hidden`.** Ô chọn đơn vị thật là điều khiển bấm được; đặt trong vùng ẩn với
  trình đọc màn hình mà vẫn nhận tiêu điểm là lỗi a11y.

## Đo

- Trên trình duyệt thật, mạng chậm, lấy mẫu DOM mỗi 50 ms từ lúc tạo tài liệu tới dòng mục tiêu đầu tiên (khuôn của
  E4 hồ sơ DH2): mọi mẫu đang tải có cùng chữ ký khung (chiều cao hàng công cụ, khoảng tới đầu bảng, chiều cao đầu
  bảng, số dòng, chiều cao từng dòng) ở tải cứng, điều hướng mềm và đổi đơn vị, ở 1440 và 390; vạch nào ngoài khung
  tính là một hình lạ. Dòng khung cao trong khoảng các dòng mục tiêu thật; đỉnh ô chọn đơn vị không đổi quá 1 px; bấm
  ô chọn lúc đang tải mở được danh sách đơn vị.
- Bài kiểm DOM: fallback của `TheoDonViPage` và `KhungDangTaiDonVi` (có, không hàng công cụ) cho cùng chữ ký thân bảng.
- Bài kiểm `packages/ui`: ma trận vạch của sáu hình, sáu cây khác nhau, khe `thanhCongCu` ngoài phần ẩn.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở Mục tiêu › Theo đơn vị → khung chờ hình bảng (hàng công cụ, đầu bảng, năm dòng hai tầng) → bảng mục tiêu
  thay đúng chỗ khung (điểm ra: bảng mục tiêu của đơn vị đang chọn)
- Biên: đổi đơn vị trong ô chọn → hàng công cụ thật giữ nguyên, thân bảng thành khung cùng hình → bảng của đơn vị mới
- Lỗi & quay lại: tải lỗi → `VungTaiLoi` như hôm nay (không đổi), nút Thử lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Mục tiêu › Theo đơn vị (đang tải) | cho người biết bảng mục tiêu sắp hiện ở đâu, hình gì | thẻ Theo đơn vị, ô chọn đơn vị / bảng mục tiêu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-donvi-dangtai | Theo đơn vị | `KhungXuong` hình `bang-hai-dong`: hàng công cụ (vạch, hoặc hàng thật khi đã có), đầu bảng, năm dòng hai tầng; trình đọc màn hình đọc «Đang tải OKR…» | chờ; đổi đơn vị trong ô chọn thật nếu đã hiện |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ: dưới `sm` hàng công cụ là một vạch rộng hết hàng; từ `sm` vạch ô chọn và nút chuyển kiểu xem; từ `md` cột tình
  trạng; từ `lg` cụm vạch bên phải dạt phải — đúng như hàng công cụ thật.
- Tiêu điểm: không vạch nào nhận tiêu điểm; ô chọn đơn vị thật trong khe `thanhCongCu` nhận tiêu điểm bình thường.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KhungXuong` (`packages/ui`) | mở rộng — thêm hình `bang-hai-dong`, khe `thanhCongCu`, `nhan` | khung chờ chung đã có năm hình; thiếu hình bảng hai tầng |
| `Skeleton` (`packages/ui`) | dùng | vạch của mọi khung |
| `KhungDangTaiDonVi` (`apps/app`) | ghép — bọc `KhungXuong`, thôi vẽ tay | giữ `data-trang-thai` và câu trạng thái của trang |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — trang đã là bảng mục tiêu mở từng mục ra KR (DH2); vòng này chỉ đổi khung chờ của bảng, không
đổi khuôn. Không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
