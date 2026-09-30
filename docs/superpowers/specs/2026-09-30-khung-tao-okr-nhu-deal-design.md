# Tạo và sửa OKR cùng khung với deal — thiết kế

Ngày: 2026-09-30 · Slug: `khung-tao-okr-nhu-deal` · Hạng: T2 (chỉ giao diện) · Làn B · Chủ kho: Manh Phan

## Vì sao

Tạo deal là một ngăn trượt từ bên phải. Tạo và sửa Mục tiêu (bảy ô) và KR (mười ô) lại là hộp
thoại giữa màn, và khi cột góp ý của Trợ lý OKR mở thì hộp phình thành hai cột. Luật của kho
(`docs/settings.md`, «Tạo mới và hỏi lại») nói: tối đa ba ô thì hộp thoại, còn lại ngăn trượt;
trạng thái mở ghi trên URL; chân «Huỷ» trái, nút chính phải; nút gửi tắt tới khi form hợp lệ.
Hai hộp OKR lệch luật của chính kho. Chuẩn ngành nói cùng điều: Carbon Design System, mẫu
«Create flows», dành hộp thoại cho một hai ô và dùng ngăn bên khi form vừa phải và người cần
thấy trang phía sau.

Lúc đọc mã còn thấy hai điều chủ kho chưa nhắc:

- **Chân ngăn trượt hôm nay xếp dọc**, nút chính trên, «Huỷ» dưới — kể cả ngăn tạo deal. Luật
  đòi «Huỷ» trái, nút chính phải, và ghi rõ chân ngăn phải sửa trong `packages/ui` cho khớp
  chân hộp thoại (đợt 2 của `docs/settings.md`, chưa làm). Ba ngăn ở Cài đặt › Chương trình OKR
  đã đặt «Huỷ» trước nút chính như thể chân đã sửa, nên hôm nay «Huỷ» của chúng nằm trên nút
  chính.
- **Sửa Mục tiêu, thêm KR, sửa KR mở từ khung chi tiết Mục tiêu** — bản thân khung đó đã là
  một ngăn trượt phải. Ngăn mới sẽ chồng lên nó.

## Làm gì

1. **Chân ngăn chung khớp chân hộp thoại.** `SheetFooter` trong `packages/ui` xếp như
   `DialogFooter`: từ 640 px một hàng, dồn phải, «Huỷ» trái nút chính phải; dưới 640 px xếp dọc,
   nút chính trên. Bảy chỗ gọi đang đặt nút chính trước (tạo deal, cá nhân, công ty, chiến dịch,
   khoá API, SSO, khung tạo ở màn chào) đảo lại cho «Huỷ» đứng trước. Ba ngăn OKR ở Cài đặt và
   hai bản mẫu đã đúng thứ tự, không phải sửa.
2. **Ngăn rộng có cột góp ý trong `packages/ui`.** `SheetContent` thêm cỡ `assist` và mang
   `data-size` như `DialogContent`. Thêm `SheetBody`: vùng thân cuộn duy nhất giữa đầu và chân,
   có tham số `split` — bật thì từ 1024 px form và cột 380 px đứng cạnh nhau, cách 24 px; dưới
   1024 px cột xếp dưới form, cuộn chung. Cỡ `assist`: từ 1024 px ngăn rộng 800 px (bằng hộp
   `assist` hôm nay), 640–1023 px tối đa 640 px, dưới 640 px như mọi ngăn.
3. **Bốn màn OKR thành ngăn.** `HopThoaiMucTieu` và `HopThoaiKr` đổi vỏ `Dialog` sang `Sheet`
   bên phải, cỡ thường như tạo deal (384 px) khi cột đóng, cỡ `assist` khi cột mở. Đầu ngăn là
   tiêu đề như hôm nay; ngăn KR thêm dòng mô tả là tên Mục tiêu (form KR không có ô nào nói KR
   thuộc Mục tiêu nào). Thân là `SheetBody`. Chân: «Huỷ» rồi nút chính. Giữ mọi `data-*` đang
   có (`data-hop-thoai-kr`, `data-hop-thoai-muc-tieu`, `data-cuon-hop`, `data-nut`) để thước cũ
   chỉ đổi chỗ phải đổi. Ngăn Radix vẫn là `role="dialog"`.
4. **Trạng thái mở trên URL.**
   - Tạo Mục tiêu ở trang Theo đơn vị dùng khoá `new` như tạo deal; chu kỳ và đơn vị đã nằm
     trên URL (`kyOkr`, `donOkr`).
   - Trong khung Mục tiêu, khoá mới `hopOkr`: `muc-tieu` (sửa Mục tiêu đang mở), `kr-moi`
     (thêm KR), `kr:<id>` (sửa KR). Một chủ duy nhất trong khung Mục tiêu đọc khoá và dựng
     ngăn, thay ba biến trạng thái rời hôm nay.
   - Đóng ngăn xoá khoá. Đóng hay đổi khung bản ghi thì khoá bị xoá cùng các khoá khác của khung.
     Khoá trỏ KR không có trong Mục tiêu thì không mở gì và tự xoá.
   - «Mở KR này» trong cột góp ý đổi `hopOkr` từ `muc-tieu` sang `kr:<id>`.
5. **Gỡ hộp hai cột.** Sau bước 3 không còn ai dùng `DialogAssistBody` và cỡ `assist` của
   `Dialog`; gỡ cả hai cùng bài kiểm riêng của chúng, chuyển bài đó sang ngăn.
6. **Bản mẫu.** Bản mẫu mới `/proto/khung-tao-okr-nhu-deal` cho Cổng Phạm vi. Bản mẫu của 9b
   (`/proto/tro-ly-okr-de-xuat`) đang dựng hộp thoại giả riêng — đổi sang ngăn ở S3 để không lệch
   bản thật.

## Không đổi

Dữ liệu, thủ tục API, tác tử, bộ kiểm góp ý, vết, hoàn tác, nấc bật và chế độ ẩn, số đo. Thẻ
góp ý (`ProposedChange`, `CotGopY`) giữ nguyên, chỉ đổi cái vỏ bọc nó. Nhãn và tên truy cập
của mọi nút giữ nguyên. Tên tệp và tên thành phần `hop-thoai-*.tsx` giữ nguyên: đổi tên kéo
theo bốn bài kiểm và `paths` của hai hồ sơ đã ký mà không đổi gì người dùng thấy.

## Giả định đã chọn thay chủ kho (chờ soi ở Cổng Phạm vi)

- Sửa chân ngăn chung trong lượt này, kéo theo cả bảy ngăn tạo khác đổi chân. Không sửa thì
  «cùng chân với deal» và «Huỷ trái, nút chính phải» không thể cùng đúng.
- Ngăn OKR chồng lên khung Mục tiêu, không thay nó; đóng ngăn là về lại khung.
- Ngăn KR có dòng mô tả là tên Mục tiêu; ngăn Mục tiêu không có dòng mô tả (đơn vị đã nằm trong
  form).
- Giữ dấu X như ngăn tạo deal. Carbon bỏ X ở luồng tạo; đổi thì đổi mọi ngăn, không riêng OKR.
- Hộp cập nhật tuần của KR và các hộp OKR khác (Căn chỉnh, Mang sang, Nhập) chưa đổi trong lượt
  này.

## Tác động lên hồ sơ đã ký

Dò hết `_acceptance/*/evals.yaml`, `_acceptance/*/rang/` và bài kiểm của app ngày 30/09. Hai lựa
chọn thiết kế giữ phần lớn thước cũ đứng yên:

- Ngăn mang `data-size` như `DialogContent`, nên mọi phép đo đọc `data-size="assist"` vẫn đúng.
- Form nằm ở đúng độ sâu lồng như trong hộp thoại (`Sheet` › `SheetContent` › `SheetBody` ›
  `form` thay `Dialog` › `DialogContent` › `DialogAssistBody` › `form`), nên các chốt đỏ của
  `khep-ky-okr` thay chữ theo đúng thụt đầu dòng trong `hop-thoai-kr.tsx` vẫn bắt được.

Chi tiết từng phép đo ở mục «Phép đo phải sửa theo».

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: trang Theo đơn vị → «Thêm mục tiêu» → ngăn phải trượt vào, URL có `new` → điền → «Tạo mục tiêu» → ngăn đóng, khung chi tiết Mục tiêu mới mở (điểm ra: khung Mục tiêu).
- Suôn sẻ: khung Mục tiêu → «…» › Sửa, «Thêm KR», hoặc «…» của một KR › Sửa → ngăn chồng lên khung, URL có `hopOkr` → «Lưu» → ngăn đóng, về khung (điểm ra: khung Mục tiêu).
- Biên: «Nhờ Trợ lý OKR góp ý» → ngăn rộng ra, cột 380 px cạnh form; «Mở KR này» → ngăn Mục tiêu nhường chỗ cho ngăn KR của đúng KR đó; dán URL có `hopOkr` → mở thẳng đúng ngăn.
- Quyền: URL là đường vào mới; người không sửa được đích của khoá thì không ngăn nào mở và khoá bị xoá, như nút vốn ẩn với họ.
- Lỗi & quay lại: còn sửa chưa lưu mà đóng (Esc, bấm ngoài, Huỷ, X) → hỏi lại; lưu lỗi → lỗi dưới form, ngăn vẫn mở; URL trỏ KR không còn → không mở ngăn, khoá tự xoá.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn Tạo mục tiêu | Tạo một Mục tiêu cho đơn vị đang xem | trang Theo đơn vị / khung Mục tiêu mới |
| Ngăn Sửa mục tiêu | Sửa một Mục tiêu, có thể nhờ góp ý | khung Mục tiêu / khung Mục tiêu, hoặc ngăn Sửa KR |
| Ngăn Thêm KR | Thêm một KR vào Mục tiêu | khung Mục tiêu / khung Mục tiêu |
| Ngăn Sửa KR | Sửa một KR, có thể nhờ góp ý | khung Mục tiêu, hoặc «Mở KR này» / khung Mục tiêu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-khung-tao-muc-tieu | Ngăn Tạo mục tiêu | Ngăn phải 384 px, tiêu đề «Thêm mục tiêu», bảy ô như hộp cũ; chân «Huỷ» · «Tạo mục tiêu» (tắt tới khi hợp lệ) | Điền, tạo |
| ST-khung-sua-muc-tieu | Ngăn Sửa mục tiêu | Ngăn chồng lên khung Mục tiêu, tiêu đề «Sửa mục tiêu», nút «Nhờ Trợ lý OKR góp ý» khi được; chân «Huỷ» · «Lưu» | Sửa, lưu, nhờ góp ý |
| ST-khung-them-kr | Ngăn Thêm KR | Tiêu đề «Thêm KR», dòng mô tả là tên Mục tiêu, mười ô; chân «Huỷ» · «Thêm KR» | Điền, thêm |
| ST-khung-sua-kr | Ngăn Sửa KR | Tiêu đề «Sửa KR», dòng mô tả là tên Mục tiêu; chân «Huỷ» · «Lưu» | Sửa, lưu |
| ST-khung-cot-muc-tieu | Ngăn Sửa mục tiêu | Ngăn rộng 800 px ở 1440; form trái, cột góp ý 380 px phải; thẻ góp ý như `the-gop-y-okr` | Quyết từng đề xuất |
| ST-khung-cot-kr | Ngăn Sửa KR | Như trên, cột chỉ thẻ của KR đó | Quyết |
| ST-khung-cot-hep | Ngăn Sửa mục tiêu, Sửa KR ở 390 và 1023 | Cột xếp dưới form, cuộn chung, không tràn ngang | Cuộn, quyết |
| ST-khung-hoi-lai | Mọi ngăn | Còn sửa chưa lưu mà đóng → hộp hỏi lại của bộ giữ thay đổi | Ở lại / Bỏ thay đổi |
| ST-khung-url-mo | Mọi ngăn | Tải lại trang với khoá trên URL → đúng ngăn, đúng đích mở lại | Tiếp tục |
| ST-khung-url-sai | Khung Mục tiêu, trang Theo đơn vị | Khoá trỏ KR không có, hoặc người không sửa được đích của khoá → không ngăn nào mở, khoá bị xoá | Dùng khung |
| ST-khung-chan-chung | Mọi ngăn tạo của app | Chân một hàng dồn phải, «Huỷ» trái nút chính phải từ 640 px; dưới 640 px nút chính trên | Bấm |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nút gửi tắt tới khi form hợp lệ và có thay đổi, như hôm nay; luật kho thắng khuyến nghị «để nút bật tới khi gửi» của Web Interface Guidelines.
- Esc và bấm ngoài: đóng khi không có thay đổi; có thay đổi thì hỏi lại. Esc trong ô sửa đề xuất và bấm bất kỳ đâu trong cột góp ý không đóng ngăn.
- Focus: mở ngăn đưa focus vào ô đầu; đóng ngăn trả focus về nút đã mở nó.
- Mốc: cột cạnh form từ 1024 px; ngăn `assist` 800 px từ 1024, tối đa 640 px ở 640–1023.
- Thân ngăn là vùng cuộn duy nhất, `overscroll-behavior: contain`; đầu và chân đứng yên.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Sheet`, `SheetContent` cỡ `assist` | mở rộng | Ngăn cần bề ngang riêng cho form cộng cột; cỡ sẵn có không khớp 800 px |
| `SheetBody` với `split` | tạo trong `packages/ui` | Thay `DialogAssistBody`; kho chưa có thân ngăn chung, deal tự viết `className` trên form |
| `SheetFooter` | mở rộng (sửa bố cục) | Khớp `DialogFooter` theo `docs/settings.md` |
| `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetClose` | dùng | Có sẵn |
| `ProposedChange`, `CotGopY` | dùng | Giữ nguyên từ `the-gop-y-okr` |

Bậc tra theo «Vẽ tay là bậc cuối» (tra 30/09):

1. `packages/ui`: `Sheet` có năm cỡ (`sm` 384, `md` 460, `lg` 768, `xl` 896, `2xl`) nhưng không cỡ nào có cột, không có thân ngăn chung; `DialogAssistBody` chỉ dành cho hộp thoại.
2. shadcn gốc: `sheet`, `drawer` — không có biến thể hai cột.
3. ReUI miễn phí, câu tìm «sheet drawer create form footer cancel submit» (ví dụ, miễn phí): `c-sheet-1`, `c-sheet-2` là ngăn form một cột; `c-sheet-4` ngăn cuộn; không có ngăn form cộng cột.
4. Block Pro, câu tìm «side sheet form with assistant panel column, edit form drawer with side rail» (mặt `card`): `sheet-8` (ngăn cài đặt, thân cuộn, chân dính) — chép cách xếp thân và chân; `sheet-4`, `sheet-10` (ngăn chat trợ lý) và `ai-chat-2` (panel trợ lý đứng cạnh trang) — chép cách đặt cột trợ lý cạnh nội dung. Không block nào ghép form với cột trong một ngăn.
5. Dựng cỡ `assist` và `SheetBody` trong `packages/ui`.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: giữ khuôn của 9b và `the-gop-y-okr` (form là chi tiết, cột thẻ là danh sách góp ý); vỏ ngăn bên theo Carbon «Create flows» (ngăn bên cho form vừa phải khi người cần thấy trang phía sau) và theo ngăn tạo deal của chính kho.
<!-- UX-SPEC-TEMPLATE>>> -->

## Phép đo phải sửa theo

| Hồ sơ | Phép đo | Bám gì hôm nay | Sửa gì |
|---|---|---|---|
| `the-gop-y-okr` | E1, E11, E13 (`rang/man-the-gop-y.mjs`) | đếm đúng một `[role=dialog][data-slot=dialog-content]`; ô nhận đỏ giả là hộp thoại giả | đếm đúng một ngăn OKR (`[data-hop-thoai-*]`) — khung Mục tiêu bên dưới cũng là `role=dialog`; ô đỏ giả đổi sang ngăn; ngưỡng giữ nguyên |
| `the-gop-y-okr` | E8, E16 (`apps/app/test/the-gop-y-okr.dom.tsx`) | bấm `[data-slot=dialog-overlay]`; `data-size` | `sheet-overlay`; `data-size` giữ |
| `tro-ly-okr-de-xuat` | E2, E3 (`apps/app/test/tro-ly-okr-gop-y.dom.tsx`) | Esc trên `dialog-title`, «Huỷ» trong `dialog-footer` | `sheet-title`, `sheet-footer`; «Huỷ» vẫn là nút đầu của chân |
| `tro-ly-okr-de-xuat` | E4 (`rang/man-gop-y.mjs`) | `[data-hop-thoai-*]`, `[data-cot-gop-y]` | không đổi; chạy lại trên vỏ mới |
| `hop-thoai-giu-cho-dang-nhap` | E10 (`rang/man-giu-cho.mjs`) | hộp Mục tiêu tìm bằng `[data-slot=dialog-content]` | tìm bằng `[data-hop-thoai-muc-tieu]`; hộp của Tổ chức giữ bộ chọn cũ |
| `hop-thoai-giu-cho-dang-nhap` | E7, E9 (`rang/soi-giu.mjs`) | gốc tên `Dialog` mang `coThayDoi`; chốt đỏ thay `<DialogClose asChild` | nhận cả `Sheet` và `SheetClose` |
| (không eval) | `apps/app/test/okr-sheet.dom.tsx` | tiêu đề bằng `dialog-title`; `data-cuon-hop` không chứa nút gửi | `sheet-title`; nút gửi nằm trong chân, ngoài `data-cuon-hop` |
| (không eval) | `packages/ui/test/dialog-assist.dom.tsx` | cỡ `assist` của hộp thoại | chuyển thành bài của ngăn |
| `khep-ky-okr`, `canh-kr-okr`, `cap-nhat-tuan-okr`, `dat-okr-trong-crm`, `so-okr-tu-chay` | các phép đo màn mở hộp KR/Mục tiêu | `[data-hop-thoai-*]`, `data-cuon-hop`, nội dung ô | không đổi; ảnh chụp lại khi hồ sơ đó chạy lượt kế |

Ghim lại ở S5: `the-gop-y-okr`, `tro-ly-okr-de-xuat`, `hop-thoai-giu-cho-dang-nhap` (thước hoặc bài
kiểm của chúng đổi). Các eval nhìn bằng trình duyệt của ba hồ sơ đó không chạy trong làn ghim lại;
lượt này chạy lại chúng trong S4 của chính nó (AC-10), nên vỏ mới có ảnh và số chứ không chỉ có
lời khai.

## Kiểm

- Bài DOM cho `SheetFooter`, cỡ `assist`, `SheetBody` trong `packages/ui`.
- Bài DOM cho bốn ngăn OKR: vỏ là ngăn phải, chân đúng thứ tự, khoá URL mở và đóng.
- Đo trong trình duyệt thật: bốn ngăn cạnh ngăn tạo deal ở 1440 và 390, ngăn rộng ở 1440, 1024, 1023, 390.
- Phép đo của hai hồ sơ đã ký chạy lại trên vỏ mới; hai hồ sơ ghim lại ở S5.
- Năm lệnh chứng của kho.
