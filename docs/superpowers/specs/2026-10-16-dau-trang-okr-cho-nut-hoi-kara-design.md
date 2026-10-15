# Khung chờ đầu trang OKR chừa chỗ nút «Hỏi Kara» — thiết kế

Hàng `dau-trang-okr-cho-nut-hoi-kara` của dãy P1 (đợt r2), Cổng Đáng chủ kho ký `build` ở phiên giám sát 15/10.

## Vì sao có việc này

#419 (`hoi-dap-okr`) thêm nút «Hỏi Kara» vào cụm bên phải đầu trang các màn OKR, cạnh ô chọn kỳ
(`dau-trang-okr.tsx`, `DauTrangCoDuLieu`). Khung chờ của cùng đầu trang (`DauTrangOkrCho`) vẫn chỉ chừa một ô
xương `w-24` cho cả cụm. Ở khổ 375 cụm thật rộng hơn nhiều, cột tiêu đề bị ép hẹp nên tiêu đề xuống dòng: hàng
tiêu đề Toàn cảnh cao 32 px lúc chờ và 96 px khi xong. Phép đo E12m của hồ sơ đã ký `khung-man-chung`
(«mỗi cặp đang tải/xong lệch ≤ 4 px ở y và chiều cao hàng tiêu đề») đỏ vì đó — M5 đo trên #375 lúc 11:22Z 15/10.

## Cách làm

Khung chờ dựng chính `NutHoiKara` ở đúng chỗ nó đứng khi xong: cụm phải của `DauTrangOkrCho` thành
`<NutHoiKara />` rồi ô xương chọn kỳ như cũ. Nút không đọc dữ liệu nào của đầu trang (chỉ gọi `okr.hoiMo` khi
bấm), nên dựng ngay lúc chờ được và bấm được ngay. Không đổi bố cục khi xong, không đổi `LuoiDauTrangOkr`.

Vì sao không dùng ô xương cùng cỡ: bề rộng nút theo chữ của từng ngôn ngữ («Hỏi Kara» / «Ask Kara») và theo dấu
Kara; một ô xương cố định chỉ khớp một ngôn ngữ, và lệch lại khi ai đó đổi chữ nút.

`tong-quan-chi-okr.tsx` không có khung chờ riêng cho đầu trang (nút dựng từ máy chủ cùng tiêu đề) nên không đổi.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở một màn OKR → đầu trang hiện ngay tiêu đề, mô tả, nút «Hỏi Kara» và ô xương chọn kỳ → dữ liệu tới,
  ô xương thành ô chọn kỳ thật; hàng tiêu đề không nhảy.
- Biên: bấm «Hỏi Kara» lúc đầu trang còn chờ → mở cột Kara như khi đã tải xong.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đầu trang khu OKR (Toàn cảnh, Theo đơn vị, Của tôi…) | cho biết đang ở màn nào, chọn kỳ, hỏi Kara | thanh bên / các thẻ OKR |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dautrangokr-dangtai | Đầu trang OKR | tiêu đề, mô tả, nút «Hỏi Kara», ô xương chọn kỳ, ô xương thanh thẻ | chờ, hoặc bấm «Hỏi Kara» |
| ST-dautrangokr-xong | Đầu trang OKR | như trên, ô chọn kỳ và thanh thẻ thật | chọn kỳ, chuyển thẻ, hỏi Kara |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ 375: cụm phải đứng cùng hàng tiêu đề ở cả hai trạng thái, tiêu đề xuống dòng như nhau ở cả hai.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `NutHoiKara` | dùng | chính nút thật, không vẽ ô xương mô phỏng |
| `Skeleton` | dùng | ô xương chọn kỳ giữ nguyên |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: không đổi IA — chỉ sửa trạng thái chờ của đầu trang đã có.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- E12m của `khung-man-chung` (đo màn thật, 1280 và 375, lệch hàng tiêu đề ≤ 4 px) — chính phép đo đang đỏ.
- DOM: khung chờ có nút «Hỏi Kara» thật, đứng trước ô chọn kỳ, bấm được, ở cả tiếng Việt lẫn tiếng Anh.
- Sau khi gộp nhánh: ghim lại hồ sơ `khung-man-chung` cùng lượt với hồ sơ này, để bằng chứng đã ký của nó đứng
  trên cây đã sửa.
