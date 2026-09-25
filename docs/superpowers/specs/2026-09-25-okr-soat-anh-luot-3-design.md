# Soát ảnh OKR lượt 3 — bốn chỗ vấp và một câu hỏi

Ngày 2026-09-25. Nguồn: lượt soát ảnh của chủ kho trên khu OKR vừa gộp (PR #140,
commit gộp `739c8701`). Hạng T2 — mọi tệp nằm ở `apps/app` và `packages/ui`, không
chạm đường T3.

Đã đọc trước khi thiết kế: `docs/design.md` (năm bậc, bảng dấu hiệu vẽ tay),
`docs/settings.md` (khung trang, thanh bên — «trên điện thoại vẫn là một hàng cuộn
ngang»), `CONTEXT.md` (luật viết nhãn, mục Chu kỳ, Mục tiêu). Skill chuẩn giao diện
của kho: `web-design-guidelines` (Vercel) — rút ra hai điểm áp ở đây: chữ dài trong
ô bảng phải xuống dòng được thay vì tràn, và vật đang chọn của một thanh cuộn phải
thấy được.

## Bốn chỗ sửa

### 1. Hộp «Nhập từ bảng tính», bước Xem trước

Gốc lỗi: bảng có chín cột (Dòng · bảy cột dữ liệu · Kết quả) đặt trong `Dialog`
cỡ `wide` = 640px, và mọi ô bảng của `packages/ui` là `whitespace-nowrap`. Cột
thứ tám trở đi nằm ngoài khung, phải cuộn ngang. Cột «Kết quả» — nơi duy nhất trong
bảng nói dòng nào hỏng — là cột cuối, nên dòng hỏng cũng khuất.

Cách sửa:

- `Dialog` có thêm cỡ `table` trong `packages/ui` = `--container-page-wide`
  (1120px), dùng cho hộp có bảng xem trước nhiều cột. Hộp nhập OKR dùng cỡ này.
  Hộp nhập cây tổ chức giữ `wide` — bảng của nó ít cột, ngoài phạm vi.
- Hai cột chữ dài — «Mục tiêu», «KR» — xuống dòng được (như `bang-kr.tsx` đang làm).
  Các cột còn lại ngắn, giữ một dòng.
- Dòng hỏng nhận ra ngay trong bảng: ô «Kết quả» dùng `StatusIndicator` —
  `error` «Hỏng» / `success` «Hợp lệ» — thay chữ tô màu tay; và `SimpleTableRow`
  có thêm biến thể `invalid` trong `packages/ui`: vạch dọc màu phá huỷ ở mép trái
  hàng (cùng hình vạch với `ROW_ACCENT` khi rê chuột, nhưng hiện thường trực). Vạch
  là nét, không phải nền — giữ luật «chỉ hai thứ được tô nền».
- Danh sách câu lỗi phía trên giữ nguyên (thước đã ký của `dat-okr-trong-crm` đọc
  nó, và nó cho biết *vì sao* hỏng).

### 2. Thanh thẻ ngang của khung Cài đặt ở khổ điện thoại

Gốc lỗi: `settings-sidebar.tsx` vẽ hàng thẻ ngang là một `nav` `overflow-x-auto`;
không có gì đưa thẻ đang mở vào tầm nhìn, nên thẻ nào nằm ngoài bề ngang màn (mọi
thẻ sau «Tổ chức» ở 390px) mở ra vẫn bị cắt ở mép phải.

Cách sửa: `packages/ui/src/components/nav-item.tsx` có thêm `NavStrip` — hàng thẻ
ngang cuộn được, sau mỗi lượt vẽ tìm thẻ mang `aria-current="page"`; thẻ đó khác
thẻ đã canh lần trước và không nằm trọn trong khung thì cuộn ngang khung (chỉ khung,
không cuộn trang) cho thẻ vào giữa. Canh một lần mỗi thẻ, nên người tự vuốt hàng
thẻ không bị kéo về. Khung Cài đặt dùng `NavStrip` thay `nav` tự vẽ — sửa một chỗ,
mọi trang Cài đặt được.

### 3. Bộ chọn chu kỳ lặp chữ «Quý»

Gốc lỗi: mỗi mục của `ChonChuKy` là tên chu kỳ + nhãn loại (`loaiChuKy`), và ô
chọn hiện nguyên mục đang chọn — «Quý 3/2026 Quý», «Năm 2026 Năm».

Cách sửa theo luật nhãn: nhãn loại chỉ mang ngữ cảnh chưa cấp. Tên đã chứa chữ
loại (so không phân biệt hoa thường theo ngôn ngữ đang dùng) thì không in nhãn loại;
tên không chứa (vd người đặt «Lượt thử tháng 10») thì vẫn in, vì lúc đó nhãn loại là
thứ duy nhất nói đây là năm hay quý. Tên chu kỳ là dữ liệu người nhập — giữ
`translate="no"`.

### 4. Gợi ý tên trong hộp «Mở chu kỳ»

Gốc lỗi: `tenGoiY` là chuỗi cứng «Năm 2027» / «Quý 1/2027».

Cách sửa: trang server `settings/okr/page.tsx` tính ngày hôm nay theo giờ Việt
Nam, gọi hàm thuần `goiYChuKy(homNay)` → `{ nam, quy: { so, nam } }`, truyền xuống
`BangChuKy` → `SheetMoChuKy` qua props. Chuỗi hiển thị do `okrMessages` dựng từ số:
«Năm {nam}» và «Quý {so}/{nam}» (tiếng Anh «{nam}», «Q{so} {nam}»).

- Năm: năm hiện tại.
- Quý: **quý kế tiếp** tính từ hôm nay (25/09/2026 → «Quý 4/2026»; trong quý 4 →
  «Quý 1/<năm sau>»). Lý do: chu kỳ được mở trước khi nó bắt đầu; ví dụ của chủ kho
  (mở «Quý 4/2026» cho chương trình chạy từ 26/10) là quý kế tiếp, không phải quý
  đang chạy. Phương án «quý đang chạy» bị loại vì hôm nay nó cho «Quý 3/2026».

Đây chỉ là placeholder, không phải giá trị điền sẵn: người vẫn gõ tên.

## Câu hỏi cho chủ kho (không sửa trong vòng này)

Màn «OKR theo đơn vị»: cây bên trái ghi «Phòng Đối tác · 1 mục tiêu», phần đầu bên
phải ghi «2 mục tiêu · 3 KR» (một mục tiêu còn Nháp). Số của cây đếm **chỉ mục tiêu
đã công bố** — đó là chủ ý đã ký: AC-10 của hồ sơ `dat-okr-trong-crm` ghi «số mục
tiêu đã công bố cạnh mỗi đơn vị», và thước Cổng Giá trị đếm `status = cong-bo`. Số
đầu phải đếm mọi mục tiêu của đơn vị. Hai số đúng theo định nghĩa của từng chỗ,
nhưng nhãn cây không nói mình đếm gì. Máy khuyên: giữ cách đếm, sửa nhãn cây thành
«1 đã công bố» — ghi trong sổ quyết định, chờ chủ kho trả lời.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Theo đơn vị → «Nhập từ bảng tính» → dán → «Xem trước» → thấy đủ chín cột, dòng hỏng có vạch đỏ và «Hỏng» → «Ghi N dòng» (điểm ra: bước Kết quả).
- Biên: điện thoại 390px mở một trang Cài đặt nằm cuối hàng thẻ → thẻ đó tự vào giữa hàng; chu kỳ có tên không chứa chữ loại → vẫn thấy «Năm»/«Quý».
- Lỗi & quay lại: bảng có dòng hỏng → sửa ở bảng tính, «Quay lại» bước 1, dán lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp Nhập, bước Xem trước | cho thấy lô sẽ ghi gì và dòng nào hỏng | bước Dán / bước Kết quả |
| Khung Cài đặt (390px) | chuyển giữa các mục Cài đặt | mọi trang `/settings/**` |
| Bộ chọn chu kỳ | đổi chu kỳ đang xem | đầu trang khu OKR |
| Sheet «Mở chu kỳ» | mở một chu kỳ năm hoặc quý | bảng Chu kỳ ở Cài đặt › Chương trình OKR |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-nhap-xemtruoc | Hộp Nhập | tóm tắt, danh sách câu lỗi, bảng chín cột trọn trong hộp ở 1440 | ghi hoặc quay lại |
| ST-nhap-xemtruoc-hong | Hộp Nhập | hàng hỏng: vạch đỏ mép trái + chấm đỏ «Hỏng» ở ô Kết quả | sửa bảng tính |
| ST-caidat-the-cuoi | Khung Cài đặt 390 | thẻ đang mở nằm trọn, giữa hàng thẻ | vuốt hàng thẻ để đổi mục |
| ST-chuky-ten-co-loai | Bộ chọn chu kỳ | chỉ tên «Quý 3/2026» | chọn chu kỳ khác |
| ST-chuky-ten-khong-loai | Bộ chọn chu kỳ | tên + nhãn loại xám | chọn chu kỳ khác |
| ST-mochuky-goiy | Sheet Mở chu kỳ | ô Tên trống, gợi ý «Năm 2026» / «Quý 4/2026» | gõ tên |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thanh thẻ chỉ cuộn khung của nó, không cuộn trang; canh một lần mỗi thẻ mới.
- Hộp cỡ `table` vẫn co về `100% − 2rem` dưới `sm`; ở 390 bảng cuộn ngang trong vỏ của nó.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Dialog` cỡ `table` | mở rộng (`packages/ui`) | cỡ `wide` 640px không chứa chín cột |
| `SimpleTableRow` `invalid` | mở rộng (`packages/ui`) | đánh dấu hàng hỏng không đè class ở chỗ gọi |
| `StatusIndicator` | dùng | bảng dấu hiệu vẽ tay: chấm trạng thái dùng `StatusIndicator` |
| `NavStrip` | tạo (`packages/ui`) | bậc 1–4 không có hàng thẻ ngang tự canh thẻ đang mở; tra ReUI «horizontal scrollable tabs navigation scroll active tab into view mobile» — weakMatch, sáu kết quả (c-tabs-1/6/9, c-scroll-area-2…) không cái nào canh thẻ đang mở |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: wizard
Căn cứ: hộp nhập đã là ba bước có `StepList`; vòng này không đổi khuôn, chỉ sửa bề rộng và đánh dấu hàng — luồng hiển nhiên, không tra.
<!-- UX-SPEC-TEMPLATE>>> -->
