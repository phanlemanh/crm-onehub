# Ô Tệp đọc được trên điện thoại — thiết kế

Hồ sơ: `_acceptance/o-tep-dien-thoai/` · hạng T2 · sửa sau DA19 `truong-tep` (#532, lên production 22/10).

## Vấn đề

Lái tay trên production ở khổ 375, phiếu thoả thuận có trường Tệp:

- Vùng kéo thả `NguonKeoTha` đặt nút «Chọn tệp» và khối chữ («Kéo tệp vào đây» + mô tả) cạnh nhau trong một
  `flex-wrap`. Khối chữ là `flex-1 min-w-0`, nên nó không bao giờ rớt xuống hàng dưới: nó co lại tới bề rộng còn lại sau
  nút. Trong cột giá trị của `DetailSheetProperty` (cột nhãn 6.5rem) phần còn lại chỉ vài chục pixel, và chữ xuống từng
  từ một dòng.
- Nhãn trường dài bị cắt («Hợp đồng (thử D…») vì cột nhãn 6.5rem dùng `truncate`.

Ở 1280 cả hai đều gọn. Hộp tải nguồn của Kho tài liệu dùng cùng thành phần, trong `Dialog`.

## Hướng sửa

1. **`NguonKeoTha`: khối chữ được rớt dòng.** Giữ `flex-wrap` sẵn có của khung nét đứt; khối chữ thôi co vô hạn và
   mang một bề rộng nền từ thang (`basis-*`). Khi phần còn lại sau nút hẹp hơn bề rộng nền, khối chữ rớt xuống dưới nút
   và dùng trọn bề ngang khung; khi đủ chỗ thì vẫn một hàng như hôm nay. Bề rộng nền chọn sao cho cột giá trị phiếu và
   hộp tải nguồn ở 1280 vẫn một hàng (đo ở S3, ghi số vào sổ). Breakpoint `md:` của màn sai cho thành phần này: cột giá
   trị phiếu và thân hộp thoại hẹp hơn màn nhiều và không đi theo khổ màn. Container query cho cùng ảnh nhưng thêm một
   cơ chế mà `flex-wrap` đã có.
2. **Hàng Tệp trên phiếu chiếm trọn bề ngang dưới md** (Hỏi-1 ở Cổng Phạm vi: chỉ hàng Tệp, hay mọi hàng `wide`). `DetailSheetProperty` thêm một lựa chọn để nhãn nằm trên giá trị
   dưới `md` (từ `md` trở lên vẫn hai cột như mọi hàng). Chỉ `OTep` bật nó. Nhãn khi ấy không cắt nữa, và vùng kéo thả có
   cả bề ngang phiếu. Các hàng `wide` khác (lý do thua, cuộc hẹn kế…) không đổi trong vòng này.

Cả hai chỗ đổi nằm ở thành phần dùng chung (`packages/ui` cho vùng kéo thả, `components/detail-sheet.tsx` của app cho
hàng thuộc tính); nơi gọi không thêm `className`.

## Căn cứ đã nạp

`docs/design.md` (mục «Vẽ tay là bậc cuối», «Trường»), bảng chỉ mục `AGENTS.md`, `.agents/skills/better-layout`
(thành phần nằm trong nhiều chỗ chứa thì bố cục theo chỗ chứa, không theo khổ màn), `.agents/skills/web-design-guidelines` (soát ở review),
WCAG 2.2 SC 1.4.10 Reflow.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở phiếu thoả thuận trên điện thoại → cuộn tới ô Tệp → bấm «Chọn tệp» hoặc thả tệp → dòng tệp hiện trên vùng
  kéo thả (điểm ra: ở lại phiếu).
- Biên: ô chưa có tệp («Chưa có tệp.»); nhãn trường dài; ô đã có tệp phía trên vùng.
- Lỗi & quay lại: tệp sai kiểu hay quá cỡ → dòng lỗi trên vùng, nút «Bỏ» — không đổi trong vòng này.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Phiếu thoả thuận (ô Tệp) | gắn tệp vào bản ghi | bảng Thoả thuận / ở lại phiếu |
| Hộp tải nguồn (Kho tài liệu) | chọn một tệp nguồn để soạn trang | nút «Tải nguồn lên» / bảng Nguồn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-otep-hep-rong | Phiếu, 375 | nhãn trường trọn chữ trên một dòng riêng; «Chưa có tệp.»; khung nét đứt: nút «Chọn tệp» trên, «Kéo tệp vào đây» và mô tả dưới | bấm «Chọn tệp» |
| ST-otep-hep-co-tep | Phiếu, 375 | các dòng tệp trên, khung nét đứt xếp dọc dưới, không cuộn ngang | mở, xoá hay thêm tệp |
| ST-otep-rong | Phiếu, 1280 | như hôm nay: nhãn cột trái, khung nét đứt một hàng | bấm «Chọn tệp» |
| ST-nguon-hep | Hộp tải nguồn, 375 | khung nét đứt không chữ xuống từng từ, không cuộn ngang | chọn tệp |
| ST-nguon-rong | Hộp tải nguồn, 1280 | khung nét đứt một hàng như hôm nay | chọn tệp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bố cục khung nét đứt đổi theo chỗ còn lại trong khung (`flex-wrap` + bề rộng nền), không theo khổ màn.
- Hàng Tệp trên phiếu: dưới `md` nhãn trên, giá trị dưới, cùng lề trái; từ `md` hai cột như mọi hàng.
- Thứ tự đọc và tab không đổi: nút trước, chữ sau.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `NguonKeoTha` | mở rộng | bố cục theo bề rộng khung là việc của thành phần, sửa một chỗ cho cả hai nơi dùng |
| `DetailSheetProperty` | mở rộng | lựa chọn xếp dọc dưới md đặt ở thành phần hàng, `OTep` chỉ bật nó |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: phiếu trên điện thoại vốn là một cột cuộn; vòng này chỉ cho hàng Tệp dùng trọn cột ấy — luồng hiển nhiên, không
tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài vòng

- Cắt chữ của nhãn ở các hàng khác trên phiếu (cột 6.5rem là luật chung của phiếu).
- Các hàng `wide` khác của phiếu.
