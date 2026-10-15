# Trang đơn vị một bảng (DH2) — thiết kế

Ngày: 2026-10-15 · Hồ sơ: `_acceptance/trang-don-vi-mot-bang/` · Hàng lộ trình: DH2 (`docs/plan/lo-trinh-okr.json`),
dựng trên DH1 · Phạm vi đợt: `docs/plan/pham-vi-okr-dieu-huong-1410.md`, mã B1, B2, B3, B4, B6, B7, B8 · Bản mẫu
nguồn: nhánh `feat/dieu-huong-okr` @706ba494a, tệp `trang-don-vi.tsx` (không gộp).

## Vấn đề

Trang «Theo đơn vị» hôm nay chồng sáu lớp điều khiển: cột cây đơn vị 288px (không màn nào khác có), thẻ đơn vị có
tiêu đề, hàng nút gồm cách xem, bộ lọc và các nút tạo/nhập/soạn (DH1 dời ba nút này lên đầu trang khu), rồi bảng
mục tiêu tự dựng bằng `SimpleTable`. Cách xem và bộ lọc nằm hai chỗ khác nhau giữa các cách xem. Trên điện thoại cây
đơn vị hiện nguyên 20 dòng lúc tải rồi mới thu thành ô chọn (`useKhoHep` chỉ biết khổ sau lần vẽ đầu). Hai chip
«Đặt cược», «Chưa có lý do» của cách xem Cây không tự giải thích.

## Hướng làm

Trang đơn vị dựng trên `DataTable` của `packages/ui`, như Thoả thuận (`deals-table.tsx`):

- **Ô chọn đơn vị** (`Combobox` có tìm kiếm) đứng ở chỗ ô tìm kiếm của bảng — thay cột cây. Lựa chọn: công ty, mọi
  bộ phận, mọi phòng ban (kể cả phòng ban chưa xếp); khi đường dẫn mang một người (`donOkr=nguoi:<id>`) thì người
  đó là một lựa chọn như hôm nay. Mỗi lựa chọn có gợi ý «Thuộc A › B» (công ty: «cả công ty») và số mục tiêu của chu
  kỳ (`okr.countByUnit` hiện có); tìm được theo tên đơn vị cha. Chọn → `donOkr` trên đường dẫn đổi.
- **Cách xem** (`ViewSwitch`: Danh sách · Cây căn chỉnh · Họp tuần · Chấm điểm khi chu kỳ ở pha chấm) đứng ngay cạnh
  ô chọn, TRONG ô tìm kiếm của bảng — không ở `leadingActions`. Lý do: `DataTable` giấu mọi thứ ngoài ô tìm kiếm sau
  nút «Lọc» trên điện thoại, nên cách xem ở `leadingActions` sẽ biến mất ở Danh sách mà hiện ở ba cách xem kia —
  trái B4. Ba cách xem không phải bảng (`HopTuan`, `ChamDiem`, `CayCanChinh`) dùng lại đúng nút ô chọn + cách xem đó
  trong một khung cùng lớp với hàng công cụ của `DataTable`, nên hàng công cụ đứng yên khi đổi cách xem.
- **Một hàng công cụ ở Danh sách:** ô chọn + cách xem · ô lọc nhanh của bảng (`tabs`: Tất cả · Cần bàn · Chưa góp vào
  đâu, kèm số) · «Lọc» gồm năm bộ lọc hôm nay (Phụ trách, Loại, Trạng thái, Mức tự tin, Góp ý — vẫn lọc ở máy chủ)
  · «Sắp xếp». Thẻ đơn vị và hàng nút cũ biến mất.
- **Bảng mục tiêu:** mỗi mục tiêu một dòng — cột Mục tiêu (tên, loại, trạng thái, số KR, «góp vào …»), Tiến độ, Tình
  trạng, Phụ trách. Dòng mở ra KR một cấp (`expandable` của `DataTable`), dòng KR dùng cùng cột; trạng thái mở ghi
  `?expand=` trên đường dẫn (do `DataTable` giữ); mặc định thu. Mục tiêu không KR không có mũi tên. Bấm **tên mục
  tiêu** mở ngăn chi tiết như hôm nay (nháp theo khuyến nghị Hỏi-2); bấm phần còn lại của dòng mở/thu KR; bấm dòng
  KR mở ngăn chi tiết của KR như hôm nay.
- **Ô lọc nhanh** tính trên hàng máy chủ đã trả (không đổi thủ tục): «Cần bàn» = mục tiêu có ít nhất một KR chậm nhịp
  hoặc trượt (đúng phép đếm «N KR chậm» đang hiện dưới tên mục tiêu — nháp theo khuyến nghị Hỏi-1); «Chưa góp vào
  đâu» = mục tiêu không ở cấp công ty và không góp vào mục tiêu hay KR nào. Giá trị ghi đường dẫn.
- **Sắp xếp** theo Tiến độ và theo Tình trạng (trượt → chậm nhịp → đúng nhịp → chưa có kỳ vọng), tăng/giảm, ghi đường
  dẫn; mặc định giữ thứ tự máy chủ trả. KR đi theo mục tiêu của nó.
- **Chân bảng** (`meta`): trưởng đơn vị (hoặc «Chưa có trưởng»), «N mục tiêu · M KR», «Thuộc A › B». Đơn vị người: phòng
  ban chính và quản lý như hôm nay.
- **Đơn vị trực thuộc** ở cuối trang: mỗi đơn vị con một ô liên kết — tên, «N mục tiêu · M KR» hoặc «Chưa đặt OKR», cờ
  «Chưa có trưởng»; bấm → trang của đơn vị đó (giữ `kyOkr`). Công ty → các bộ phận và phòng ban chưa xếp; bộ phận →
  phòng ban; phòng ban, người → không có khối.
- **Giữ nguyên:** nhóm «Đã bỏ» dưới bảng, khối KR của một người, ngăn tạo và hộp nhập (DH1 mở từ đầu trang), các trạng
  thái trống/lỗi/không thấy đơn vị/chưa có chu kỳ, cách xem Cây căn chỉnh và hai chip của nó (DH4 gỡ cả cách xem).
- **Đổi thẻ giữ cách xem:** liên kết thanh thẻ của DH1 mang thêm `xemOkr` khi đường dẫn đang có nó — thiết kế DH1
  (đã ký Cổng Phạm vi 15/10) ghi «Cách xem (`xemOkr`) KHÔNG đi theo — đó là B4 của DH2». Một dòng trong `toi()` của
  `thanh-tab.tsx` và điều khẳng định `dhk-giu-don` của DH1 đổi theo; báo Điều phối M5 trước khi chạm tệp của DH1.
- **Điện thoại:** ô chọn cùng một khung ở mọi khổ, nên không còn bước «cây rồi mới thu»; lúc tải, trang vẽ khung
  xương có hàng công cụ cùng cỡ ở đúng chỗ.

## Vì sao không làm cách khác

- Cách xem ở `leadingActions` như Thoả thuận: chết vì B4 trên điện thoại (xem trên). Sửa `DataTable` cho
  `leadingActions` luôn hiện: chạm `packages/ui`, đúng chỗ NM2 `loc-va-kieu-xem-chung` (Mac Studio) đang đổi.
- Ô lọc nhanh là bộ lọc máy chủ: đổi thủ tục `okr.danhSach`, cần bài kiểm API, không thêm gì người thấy.
- Bỏ cách xem Cây ở lượt này: hàng DH4 làm, sau khi có sơ đồ thay — bỏ trước thì có lúc mất cách nhìn căn chỉnh.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thẻ Theo đơn vị → bấm ô chọn đơn vị → gõ «kinh» → chọn «Kinh doanh miền Nam» → bảng mục tiêu của đơn vị →
  bấm dòng một mục tiêu → KR mở ngay dưới (điểm ra: bấm tên mục tiêu → ngăn chi tiết).
- Suôn sẻ 2: đang ở Danh sách → đổi Họp tuần → ô chọn và cách xem đứng yên, bảng đổi.
- Biên: đơn vị chưa đặt OKR → trống kèm câu hôm nay; ô lọc «Cần bàn» không khớp → trống «Không có mục tiêu nào khớp»
  + bỏ lọc; đơn vị chưa có trưởng → cờ ở chân bảng và ở ô trực thuộc; đường dẫn trỏ đơn vị đã xoá → «không thấy đơn
  vị» + về công ty.
- Lỗi & quay lại: không tải được danh sách → khối lỗi có «Thử lại» trong thân, hàng công cụ vẫn dùng được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trang đơn vị — Danh sách | Đọc mục tiêu và KR của một đơn vị | thẻ Theo đơn vị, ô trực thuộc / ngăn chi tiết, đơn vị khác |
| Ô chọn đơn vị | Tìm và chọn một đơn vị | hàng công cụ / trang đơn vị đã chọn |
| Trang đơn vị — Họp tuần, Chấm điểm, Cây | Việc riêng của cách xem, cùng hàng công cụ | cách xem / cách xem khác |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dvb-danh-sach | Danh sách, phòng ban có mục tiêu | một hàng công cụ; bảng mục tiêu thu gọn; chân bảng trưởng · số · thuộc | bấm dòng mở KR |
| ST-dvb-mo-kr | Danh sách | một mục tiêu mở, KR là dòng con cùng cột; `?expand=` trên đường dẫn | bấm tên → ngăn chi tiết |
| ST-dvb-chon-don-vi | Ô chọn đơn vị | ô mở, đang gõ «kinh», lựa chọn có «Thuộc …» và số mục tiêu | chọn đơn vị |
| ST-dvb-can-ban | Danh sách | ô lọc «Cần bàn · 2», chỉ mục tiêu có KR chậm nhịp hoặc trượt | mở KR chậm |
| ST-dvb-khong-khop | Danh sách | «Không có mục tiêu nào khớp» + «Bỏ lọc» | bỏ lọc |
| ST-dvb-rong | Danh sách, đơn vị chưa đặt OKR | trống kèm câu hôm nay theo có/chưa có trưởng | thêm mục tiêu ở đầu trang |
| ST-dvb-chua-truong | Danh sách | chân bảng «Chưa có trưởng» | sang Cài đặt › Tổ chức |
| ST-dvb-cong-ty | Danh sách, cấp công ty | mục tiêu công ty; «Đơn vị trực thuộc» là các bộ phận | bấm một bộ phận |
| ST-dvb-nguoi | Danh sách, một người | chân bảng phòng ban chính · quản lý; khối KR của người | mở KR |
| ST-dvb-hop-tuan | Họp tuần | cùng hàng công cụ ở cùng chỗ; bảng họp tuần | đổi cách xem |
| ST-dvb-cham-diem | Chấm điểm | cùng hàng công cụ ở cùng chỗ; bảng chấm điểm | chấm |
| ST-dvb-cay | Cây căn chỉnh | cùng hàng công cụ ở cùng chỗ; cây và hai chip như hôm nay | đổi cách xem |
| ST-dvb-dang-tai | Mọi cách xem | khung xương: hàng công cụ cùng cỡ, các dòng bảng | chờ |
| ST-dvb-loi | Danh sách | hàng công cụ; khối lỗi «Thử lại» | thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- 1440: ô chọn rộng 18rem, cách xem ngay sau; ô lọc nhanh, «Lọc», «Sắp xếp» cùng hàng như Thoả thuận.
- 390: ô chọn đầy bề ngang, cách xem (ô chọn của `ViewSwitch`) ngay dưới; «Lọc» gom ô lọc nhanh, bộ lọc, sắp xếp như
  mọi bảng; cột Tiến độ ẩn dưới md, Phụ trách ẩn dưới lg.
- Ô chọn: tìm không dấu, theo tên đơn vị và tên cha; Esc đóng không đổi đơn vị.
- Dòng mục tiêu: Enter/Space trên nút mũi tên mở/thu; tên mục tiêu là nút riêng (không mở/thu dòng).

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `DataTable` (tabs, facets, expandable, meta) | dùng | bảng của Thoả thuận, cấm hệ bảng thứ hai |
| `Combobox` | dùng | ô chọn có tìm kiếm như ô đơn vị ở Tài liệu |
| `ViewSwitch` | dùng | nút trên máy tính, ô chọn trên điện thoại (`docs/design.md`) |
| `Item` | dùng | ô đơn vị trực thuộc như bản mẫu |
| `HangCongCuDonVi` (app) | ghép | ô chọn + cách xem, dùng chung cho bảng và ba cách xem kia |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: bảng mục tiêu mở ngăn chi tiết khi bấm tên — đúng nếp Thoả thuận; luồng hiển nhiên, không tra thêm mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
