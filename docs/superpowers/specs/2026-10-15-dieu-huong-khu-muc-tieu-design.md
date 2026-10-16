# Điều hướng khu Mục tiêu (DH1) — thiết kế

Ngày: 2026-10-15 · Hồ sơ: `_acceptance/dieu-huong-khu-muc-tieu/` · Hàng lộ trình: DH1
(`docs/plan/lo-trinh-okr.json`) · Phạm vi đợt: `docs/plan/pham-vi-okr-dieu-huong-1410.md`, mã A1, A2, A4, A5,
A6 · Bản mẫu nguồn: nhánh `feat/dieu-huong-okr` @706ba494a, tệp `khung.tsx` (không gộp).

## Vấn đề

Đo trên production 14/10 ở khổ 1440 và 390: tiêu đề trang đổi theo năm thẻ («OKR của tôi», «Cập nhật tuần của
tôi», «OKR theo đơn vị», «Toàn cảnh OKR», «Hỏi ý mục tiêu») và không thẻ nào trùng tên «Mục tiêu» trên thanh bên.
Nút «Thêm mục tiêu» nằm giữa thân trang Theo đơn vị, cách mép phải 360–425px, trong khi Thoả thuận, Công ty, Tài
liệu đặt nút chính ở mép phải đầu trang (0px). Đổi thẻ chỉ giữ chu kỳ, mất đơn vị đang xem. Người không đủ quyền
không thấy nút tạo nào — luật «Không đủ quyền» của `docs/settings.md` đòi khoá kèm một dòng lý do.

## Hướng làm

Một đầu trang dùng chung cho cả khu, dựng như đầu trang Thoả thuận:

- **Tiêu đề** cố định «Mục tiêu» (en «Objectives») — chính chữ của mục thanh bên (`khung-ung-dung.ts`
  `rail.okr`). Câu mô tả dưới tiêu đề đổi theo thẻ. Tiêu đề trình duyệt: «<tên thẻ> · Mục tiêu».
- **Hàng hành động** trong `PageShellActions`, ở góc phải: ô chu kỳ · nút «…» (menu một mục «Nhập từ bảng
  tính») · nút viền «Soạn OKR cùng Kara» (chỉ hiện khi chu kỳ ở pha lập kế hoạch, như hôm nay) · nút chính «Thêm
  mục tiêu». Đây là nháp theo khuyến nghị của câu Hỏi-1 ở Cổng Phạm vi; lối kia (gom cả «Nhập» lẫn «Soạn» vào
  «…», đúng chữ A2 và bản mẫu) đổi được trước khi code. Nhãn giữ «Soạn OKR cùng Kara» theo luật một tên AI của
  kho (`docs/ai-ux.md` §1) — chữ «Soạn cùng Trợ lý» của phạm vi A2 làm đỏ luật đó. Ba nút tạo/nhập/soạn rời khỏi hàng nút trong thân trang
  Theo đơn vị. Hàng này **giữ chỗ cho nút «Hỏi Kara»** (`NutHoiKara`) của hàng `hoi-dap-okr` (Mac Studio, dự kiến
  gộp 16/10, đặt nút ở `dau-trang-okr.tsx`): bên gộp sau dời nút đó vào hàng hành động chung; DH1 gộp `onehub` vào
  nhánh trước S4 nếu C đã lên.
- **Đơn vị đích** của ba hành động: ở Theo đơn vị là đơn vị đang chọn; ở các thẻ khác là đơn vị đầu tiên người
  xem dẫn (bộ phận trước phòng ban, theo thứ tự cây), không thì `donOkr` trên đường dẫn, không thì cấp công ty
  (nháp theo khuyến nghị câu Hỏi-2 — lối kia: đơn vị đang xem trước). Bấm «Thêm mục tiêu» ở thẻ khác Theo đơn vị → mở Theo đơn vị của đơn vị đích với ngăn tạo đã mở (dùng
  lại `NganTaoMucTieu` và khoá `dialog.create` hiện có — không dựng ngăn thứ hai).
- **Quyền** lấy từ máy chủ: `canCreate` của `okr.danhSach` cho đơn vị đích — cùng phép kiểm `nhapDuoc` mà máy
  chủ dùng cho cả tạo lẫn nhập (`applyImport` → `assertNhapDuoc`), nên một cờ khoá cả ba điều khiển (cùng khoá truy vấn với trang Theo
  đơn vị khi đứng ở đó, nên không tải thêm). Không chép luật quyền sang trình duyệt — máy chủ có hai khái niệm
  quản trị (`quanTri` và `quanTriChuongTrinh`), chép sang là lệch.
- **Khoá kèm lý do**: không đủ quyền → «Thêm mục tiêu», mục «Nhập từ bảng tính» và (trong pha lập kế hoạch) nút
  soạn vẫn hiện nhưng bị khoá, `aria-describedby` trỏ một dòng `PageShellNote` dưới tiêu đề, như trang Tổ chức.
  Hai câu: xem đơn vị không sửa được, và chưa dẫn đơn vị nào. Nút soạn giữ nguyên các lý do khoá riêng của nó
  (chưa cấu hình, hết lượt, hết trần, chưa có khoá, tạm nghỉ) trong popover «i» như hôm nay — `NutSoan` dời chỗ,
  không viết lại.
- **Đổi thẻ giữ đơn vị và chu kỳ**: liên kết của thanh thẻ mang `kyOkr` và `donOkr` hiện có. Các thẻ không đọc
  `donOkr` vẫn chuyền nó đi, nên quay về Theo đơn vị đúng đơn vị cũ. Cách xem (`xemOkr`) KHÔNG đi theo — đó là
  B4 của DH2.
- **Sức khoẻ chương trình**: đầu trang khu «Mục tiêu», thẻ «Toàn cảnh» đang chọn, đường dẫn trong thân «Toàn
  cảnh › Sức khoẻ chương trình» — mắt xích đầu là đúng nhãn thẻ đang chọn, mắt xích cuối là đúng tên ở tiêu đề
  trình duyệt; liên kết về Toàn cảnh giữ `kyOkr` và `donOkr`. Tiếng Anh thống nhất một cách viết «Program health».

Bản mẫu `/proto/dieu-huong-khu-muc-tieu` có thêm state `ST-dhk-hoi-1-gom` vẽ lối kia của câu Hỏi-1 (gom «Nhập» và
«Soạn» vào «…») để người chọn trên bản bấm được; state đó gỡ ở S3 sau khi người chọn, nên không có dòng trong
bảng trạng thái.

## Vì sao không làm cách khác

- Đơn vị đích ở thẻ khác Theo đơn vị mặc về cấp công ty: chết — mọi trưởng đơn vị không phải quản trị sẽ thấy
  nút khoá ở Của tôi dù họ có quyền tạo cho đơn vị mình (trái A6: chỉ khoá khi KHÔNG đủ quyền).
- Thêm ô chọn đơn vị trong ngăn tạo: đổi form tạo mục tiêu, ngoài phạm vi A1–A6.
- Tính quyền ở trình duyệt từ `okr.access` + cây tổ chức: nhân đôi luật của `okr-access.service.ts`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên «Mục tiêu» → trang Của tôi, tiêu đề «Mục tiêu» → bấm «Thêm mục tiêu» góc phải → Theo đơn
  vị của đơn vị mình dẫn, ngăn tạo mở → lưu → ngăn đóng, mục tiêu mới mở (điểm ra: Theo đơn vị).
- Suôn sẻ 2: Theo đơn vị, chọn đơn vị X → thẻ Toàn cảnh → thẻ Theo đơn vị → vẫn X, cùng chu kỳ.
- Biên: người không dẫn đơn vị nào, không phải quản trị → nút khoá + dòng lý do; đứng ở đơn vị không sửa được →
  nút khoá + dòng lý do nêu tên đơn vị; mở đường dẫn có `create` khi không đủ quyền → ngăn không mở, khoá rời
  đường dẫn (giữ hành vi hiện có).
- Lỗi & quay lại: không tải được quyền → nút khoá, dòng «Chưa tải được quyền của bạn — tải lại trang để thử
  lại»; thân trang vẫn hiện lỗi tải của chính nó như hôm nay.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đầu trang khu Mục tiêu | Cho biết đang ở khu nào và bắt đầu một mục tiêu | thanh bên, mọi thẻ / Theo đơn vị + ngăn tạo |
| Menu «…» | Nhập mục tiêu từ bảng tính | nút «…» / hộp Nhập của đơn vị đích |
| Sức khoẻ chương trình | Xem sức khoẻ cả chương trình (quản trị) | nút ở Toàn cảnh / Toàn cảnh qua đường dẫn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dhk-don-vi | Theo đơn vị, trưởng đơn vị | «Mục tiêu», mô tả thẻ, hàng hành động góc phải, nút bật | bấm «Thêm mục tiêu» |
| ST-dhk-cua-toi | Của tôi, trưởng một đơn vị | như trên, nút trỏ đơn vị mình dẫn | bấm → Theo đơn vị + ngăn tạo |
| ST-dhk-khong-quyen | Theo đơn vị, xem đơn vị không sửa được | nút và hai mục menu khoá; dòng «Bạn xem được <đơn vị> nhưng không thêm mục tiêu được: chỉ trưởng đơn vị này, trưởng đơn vị cấp trên và quản trị làm được.» | chọn đơn vị khác |
| ST-dhk-khong-dan | Của tôi, không dẫn đơn vị nào | nút khoá; dòng «Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu: mục tiêu thuộc về đơn vị và do trưởng đơn vị đặt.» | cập nhật KR của mình |
| ST-dhk-menu | Mọi thẻ | menu «…» mở: «Nhập từ bảng tính» | chọn mục → hộp Nhập của đơn vị đích |
| ST-dhk-soan | Mọi thẻ, chu kỳ ở pha lập kế hoạch | nút viền «Soạn OKR cùng Kara» cạnh nút chính; khoá thì có nút «i» nêu lý do như hôm nay | bấm → cuộc soạn của đơn vị đích |
| ST-dhk-cap-nhat-tuan | Cập nhật tuần | «Mục tiêu», mô tả thẻ, cùng hàng hành động | đổi thẻ |
| ST-dhk-hoi-y | Hỏi ý | «Mục tiêu», mô tả thẻ, cùng hàng hành động | đổi thẻ |
| ST-dhk-toan-canh | Toàn cảnh | «Mục tiêu», thẻ Toàn cảnh chọn, cùng hàng hành động | đổi thẻ |
| ST-dhk-suc-khoe | Sức khoẻ chương trình | «Mục tiêu», thẻ Toàn cảnh chọn, «Toàn cảnh › Sức khoẻ chương trình» | về Toàn cảnh |
| ST-dhk-dang-tai | Mọi thẻ | tiêu đề và mô tả hiện ngay; hàng hành động là khung xương cùng cỡ | chờ |
| ST-dhk-loi-quyen | Mọi thẻ | nút khoá, dòng «Chưa tải được quyền của bạn — tải lại trang để thử lại» | tải lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- 1440: tiêu đề và mô tả bên trái, hàng hành động bám mép phải đầu trang như Thoả thuận; thanh thẻ ngay dưới.
- 390: theo `PageShellHeader` — tiêu đề, rồi hàng hành động, rồi mô tả, như Thoả thuận ở cùng khổ.
- Menu «…»: `DropdownMenu` căn phải; mục khoá vẫn đọc được bằng trình đọc màn hình kèm lý do.
- Hộp «Nhập từ bảng tính» mở bằng một khoá đường dẫn (đứng ở thẻ khác thì sang Theo đơn vị của đơn vị đích rồi mở), để «…» ở mọi thẻ dùng chung một hộp.
- Trang soạn (`laTrangSoan`) không có đầu trang khu — giữ như hôm nay.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `PageShellHeader/Actions` | dùng | khung đầu trang của Thoả thuận, Công ty |
| `PageShellNote` | dùng | dòng lý do khoá như trang Tổ chức |
| `DropdownMenu` | dùng | menu «…» như bản mẫu |
| `NutSoan` | dùng | dời nguyên khối nút soạn + popover lý do lên đầu trang |
| `HopThoaiNhapOkr` | dùng | hộp nhập hiện có; mở bằng khoá đường dẫn thay cho trạng thái cục bộ |
| `NganTaoMucTieu` | dùng | ngăn tạo hiện có, mở bằng `dialog.create` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: khu Mục tiêu là một mục thanh bên toả ra năm thẻ con; luồng hiển nhiên theo `docs/design.md` «Thẻ con
của trang» (thanh thẻ ngay dưới đầu trang) — không tra thêm mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
