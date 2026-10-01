# Mục tiêu và KR trong cùng một khung — thiết kế

Ngày: 2026-10-02 · slug: `muc-tieu-va-kr` · hạng T2 · làn design D1
Proto: `/proto/muc-tieu-va-kr` (`apps/app/app/proto/_modules/muc-tieu-va-kr/`)

## Vấn đề

Ở «OKR của tôi», «Theo đơn vị» và «Chấm điểm», mỗi mục tiêu là một `Card` của kho:
tiêu đề nằm trần bên ngoài, viền chỉ bao bảng KR. Mắt đọc «viền = một đơn vị», nên
mục tiêu rơi ra ngoài đơn vị của chính nó và nhìn như một nhãn khu. Hàng mục tiêu không
có con số nào — API đã trả `progress` và `expected` của mục tiêu nhưng màn không hiện —
nên không thấy các KR cộng lại thành gì. Bảng KR lặp tiêu đề cột dưới mỗi mục tiêu;
cột «Đích» chứa cả số hiện tại; người phụ trách hiện ba lần.

## Quyết định đã chốt (chủ kho, 02/10)

1. Phạm vi bốn bề mặt: Của tôi · Theo đơn vị · sheet chi tiết mục tiêu · Chấm điểm.
2. Hàng mục tiêu hiện % đúng số API đang tính (`mucTieu.progress`), kèm vạch kỳ vọng
   (`expected`) và nhịp. Dòng phụ ghi «Tính từ N KR» — trình duyệt không biết chương
   trình có bật trọng số hay không, nên không được viết «trung bình».
3. Mặc định mở mọi mục tiêu; thu gọn ghi vào URL (`thuMucTieu`, danh sách id đã thu).
4. Cột Phụ trách trên hàng KR luôn hiện avatar + tên.
5. Khung là lượt 1; Kara góp ý (`gop-y-dung-cho`) là lượt 2, chỉ thêm qua sáu điểm cắm.
6. `packages/ui/src/components/simple-table.tsx` và `packages/ui/src/lib/row-accent.ts`
   thuộc lượt này; `nen-kara` chạy song song không chạm hai tệp đó.
7. Mỗi mục tiêu một khung (một `SimpleTable` bọc trong khối `data-muc-tieu`), không gộp cả
   danh sách vào một bảng: sáu hồ sơ đã ký đo `[data-muc-tieu] thead th` = 4, KR là con của
   khối và tên mục tiêu là `translate=no` đầu khối (rà soát 02/10, mục «Móc DOM phải giữ»).
   Hàng tiêu đề cột vẫn có trong DOM nhưng chỉ cho trình đọc màn hình, nên mắt thấy mỗi khung
   mở đầu bằng chính hàng mục tiêu và tiêu đề cột không lặp lại.

## Hướng

Bậc 1 của «Vẽ tay là bậc cuối»: `SimpleTable` đã có hàng thu mở được (`clickable` +
`expandable`), `DataTable` đã có hàng con nền `bg-muted/30`. Thiếu hai thứ, thêm vào
`packages/ui` thay vì đặt `className` tại chỗ gọi:

- `SimpleTableRow nested` — hàng con: nền nhạt một bậc (cùng giá trị hàng con của
  `DataTable`).
- `SimpleTableRow joined` — bỏ vạch dưới, để hàng kế tiếp dính vào hàng này (hàng góp ý
  của Kara dưới một KR).
- `SimpleTable header="sr-only"` — hàng tiêu đề cột chỉ cho trình đọc màn hình. Ẩn `thead`
  làm `table-fixed` chia đều cột (đo ở design-pass), nên bảng mục tiêu dùng bố cục tự động và
  khai độ rộng trên ô của hàng mục tiêu (luôn là hàng đầu).

Đã tra: ReUI `search` «table with grouped parent rows and nested child rows, objective
with key results progress» — chỉ ra bảng thường (`c-table-12`, `c-table-2`), không có
bảng nhóm cha–con.

## Thành phần

| Đơn vị | Làm gì | Phụ thuộc |
|---|---|---|
| `SimpleTable`, `SimpleTableRow` (`packages/ui`) | thêm `header="sr-only"`, `nested`, `joined` | `row-accent.ts` |
| `okr/bang-muc-tieu.tsx` (mới) | danh sách: mỗi mục tiêu một `KhoiMucTieu`; mở/thu đọc–ghi URL `thuMucTieu`; nhận `DiemCam` | `KhoiMucTieu`, nuqs |
| `okr/khoi-muc-tieu.tsx` (viết lại) | một khung: hàng mục tiêu (mũi tên, tên, nhãn, dòng phụ, người phụ trách, tiến độ mục tiêu) + hàng KR + hàng điểm cắm | `BangKr` |
| `okr/bang-kr.tsx` (mở rộng tại chỗ) | xuất các hàng KR (nhãn KR1…KRn, ô tiến độ gộp) dùng chung danh sách + sheet; `SoCuaKr` giữ nguyên tại tệp này | `TienDoKr` |
| `okr/tien-do-kr.tsx` (mở rộng tại chỗ) | ô tiến độ gộp của KR và của mục tiêu; `ThanhTienDo` giữ nguyên tại tệp này | `Progress`, `PaceIndicator` |
| `okr/diem-cam.ts` (mới) | kiểu `DiemCam` sáu điểm cắm | — |
| `okr/cua-toi.tsx`, `theo-don-vi/theo-don-vi.tsx` | dùng `BangMucTieu` | — |
| `record-sheet/objective-sheet.tsx` (`TabKr`) | Vì sao lúc này · Góp vào · bảng KR đánh số · dòng «X% tính từ N KR» | `BangKr` |
| `okr/cham-diem.tsx` (`KhoiMucTieuCham`) | mục tiêu là hàng đầu bảng chấm; KR đánh số; «Điều học được» + «Mang sang» là hàng cuối cùng bảng | — |
| `lib/messages/okr.ts`, `okr-khep.ts` | chữ mới («Tính từ N KR», «Vì sao lúc này», «Góp vào», «qua KR», «Tiến độ mục tiêu X% tính từ N KR») | — |

Dữ liệu: không đổi API, không đổi schema. Mọi số đến từ `okr.mine`, `okr.byUnit`,
`okr.objective`, `okr.khep*` hiện có.

## Ô tiến độ gộp

- KR số: dòng trên giữ đúng chữ của `SoCuaKr` hiện nay («`<hiện tại>` / `<đích>`») + `%`; thanh `Progress` neutral có vạch
  kỳ vọng; `PaceIndicator` dưới. Khởi điểm ≠ 0 → dòng phụ dưới tên KR «`<Kiểu>` · từ
  `<khởi điểm>`».
- KR mốc: «Xong» / «Chưa xong», thanh không vạch, nhịp `moc-xong` / `moc-chua`.
- KR nguồn máy: giữ nguyên dấu nguồn, số đo cạnh, nút mở sổ số, ghi chú «chưa chụp» của
  `SoCuaKr` — chuyển vào dòng trên của ô gộp, không đổi hành vi.
- Mục tiêu: «Tính từ N KR» + `progress`% + vạch `expected` + nhịp; 0 KR → «Chưa có KR
  để tính».

## Sáu điểm cắm (cho lượt Kara)

`nhanMucTieu(mt)` cuối hàng nhãn tiêu đề · `duoiMucTieu(mt)` một hàng trải cột ngay sau
hàng mục tiêu, trước KR · `duoiKr(kr, mt)` một hàng trải cột dính dưới hàng KR
(`joined`) · `sauTenKr(kr, mt)` sau tên KR · `dangMo` + `onDoiMo` điều khiển mở/thu từ
ngoài · neo `data-muc-tieu` / `data-kr`. Vắng → không vẽ hàng hay khoảng trống nào.
Sheet: `duoiMucTieu` đầu khu bảng KR; `duoiKr`, `sauTenKr` như danh sách.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: tab «Của tôi» → đọc từng mục tiêu: tên, %, nhịp → KR1…KRn ngay dưới → bấm tên
  mục tiêu → sheet: Vì sao lúc này → Góp vào → bảng KR → «X% tính từ N KR» (điểm ra: đóng
  sheet về đúng danh sách, URL giữ trạng thái thu/mở).
- Biên: mục tiêu 0 KR; KR mốc; KR giảm xuống / khởi điểm ≠ 0; KR nguồn máy chưa có số;
  chưa có kỳ vọng; tên rất dài; đơn vị nhiều mục tiêu; không có `whyNow`; không góp vào
  đâu; màn 375 px.
- Lỗi & quay lại: tải lỗi → trạng thái lỗi sẵn có của màn (nút Thử lại); URL mang id thu
  không còn tồn tại → bỏ qua id đó, mọi mục tiêu còn lại mở.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| OKR của tôi | thấy mục tiêu mình phụ trách và KR đo nó, đang đúng nhịp không | tab Của tôi / sheet chi tiết |
| Theo đơn vị | đọc lướt mọi mục tiêu của một đơn vị cùng KR | cây đơn vị / sheet chi tiết |
| Sheet chi tiết mục tiêu | hiểu vì sao có mục tiêu, nó góp vào đâu, KR nào đo nó | tên mục tiêu / đóng về danh sách |
| Chấm điểm | chấm từng KR của một mục tiêu và ghi điều học được | tab Chấm điểm / mang sang kỳ sau |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-mtkr-co-du-lieu | Của tôi, Theo đơn vị | mỗi mục tiêu một khung; hàng đầu là mục tiêu (mở sẵn), KR1…KRn dưới; tiêu đề cột không hiện | đọc; bấm tên để mở sheet |
| ST-mtkr-da-thu | Của tôi, Theo đơn vị | hàng mục tiêu đã thu: chỉ còn hàng cha, mũi tên chỉ phải, URL có `thuMucTieu` | bấm mũi tên để mở lại |
| ST-mtkr-chua-co-kr | Của tôi, Theo đơn vị | hàng con «Mục tiêu này chưa có KR.»; ô tiến độ «Chưa có KR để tính» | mở sheet để thêm KR |
| ST-mtkr-kr-moc | mọi màn | ô tiến độ «Chưa xong»/«Xong», nhịp mốc | — |
| ST-mtkr-kr-may | mọi màn | dấu nguồn + số đo cạnh / «chưa chụp» trong ô gộp | bấm số để mở sổ số |
| ST-mtkr-hep | mọi màn ở 375 px | tiến độ nằm dưới tên, không tràn ngang | — |
| ST-mtkr-sheet | Sheet chi tiết | Vì sao lúc này · Góp vào · KR đánh số · «X% tính từ N KR» | sửa KR, thêm KR |
| ST-mtkr-sheet-khong-ly-do | Sheet chi tiết | không có khu «Vì sao lúc này» khi `whyNow` trống | — |
| ST-mtkr-cham | Chấm điểm | mục tiêu là hàng đầu bảng trong khung; KR đánh số; học + mang sang trong khung | chấm, ghi học |
| ST-cuatoi-codulieu | Của tôi | `data-trang-thai` của vùng danh sách có dữ liệu (giữ nguyên) | — |
| ST-donvi-danhsach | Theo đơn vị | `data-trang-thai` của vùng danh sách có dữ liệu (giữ nguyên) | — |
| ST-cuatoi-rong | Của tôi | trạng thái rỗng sẵn có (giữ nguyên) | sang Theo đơn vị |
| ST-donvi-rong | Theo đơn vị | trạng thái rỗng sẵn có của đơn vị (giữ nguyên) | gán trưởng / đặt mục tiêu |
| ST-donvi-dangtai | Của tôi, Theo đơn vị | khung xương sẵn có, dùng chung hai màn (giữ nguyên) | chờ |
| ST-donvi-loi | Của tôi, Theo đơn vị | trạng thái lỗi sẵn có, nút «Thử lại» (giữ nguyên) | bấm Thử lại |
| ST-donvi-chuakychay | Của tôi, Theo đơn vị | chưa có chu kỳ đang chạy (giữ nguyên) | quản trị mở chu kỳ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mở/thu: nút mũi tên (`aria-expanded`, `aria-label` «Thu gọn/Mở KR của «tên»»); bấm cả
  hàng mục tiêu cũng thu/mở; tên mục tiêu là nút mở sheet, bấm không thu/mở.
- Mũi tên xoay 90° bằng `transform`, tắt chuyển động khi `prefers-reduced-motion`.
- `thuMucTieu` là danh sách id; mở lại cái cuối cùng → khoá rời URL.
- `< md`: cột Phụ trách và Tiến độ ẩn, nội dung của chúng xuống dưới tên (cùng ô).
- Số theo `vi-VN` (`3,5 giờ`, `1.000`); tên mục tiêu/KR mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `SimpleTable` / `SimpleTableRow` | mở rộng | thêm `header="sr-only"`, `nested`, `joined` — chưa có biến thể |
| `Progress` neutral, `PaceIndicator`, `PersonAvatar`, `Badge`, `Button` | dùng | đã có, đúng việc |
| `DetailSheet*` | dùng | khung sheet sẵn có |
| `BangMucTieu`, `KhoiMucTieu`, ô tiến độ gộp | ghép | ghép từ các thành phần trên trong `apps/app/okr` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — danh sách mục tiêu và sheet chi tiết đã là master-detail; chỉ
đổi cách nhóm trong danh sách. Đối chiếu hàng cha có tiến độ cộng dồn và hàng con lồng
dưới: [NGÀNH: Asana Goals — mục tiêu cha hiện tiến độ tính từ mục tiêu con], [NGÀNH:
Perdoo — tiến độ objective tính từ các key result].
<!-- UX-SPEC-TEMPLATE>>> -->

## Móc DOM phải giữ

Rà soát 02/10 (`_acceptance/*/evals.yaml`, `rang/*.mjs`, `apps/app/test/**`,
`packages/ui/test/**`): mọi hồ sơ dưới đây `signed-off`.

- Khối mục tiêu: `data-muc-tieu` trên phần tử BAO cả bảng KR (`[data-muc-tieu] [data-kr-hang]`,
  `[data-muc-tieu] [data-nhan-gioi-han]` là SPAN); `[data-muc-tieu] thead th` = 4 khi không có
  cột việc/hành động; `translate=no` đầu khối là tên mục tiêu; `data-mo-muc-tieu` mở sheet;
  `[data-tinh-trang]` nằm trong khối (dat-okr-trong-crm E11, ux-lai-thu-8c-okr E2–E15,
  gioi-han-duyet-cay-okr E15, toan-canh-okr E2/E3/E14/E23, no-sau-luot-5-okr E10).
- Trạng thái màn: `ST-cuatoi-codulieu`, `ST-cuatoi-rong`, `ST-donvi-danhsach` (là
  `[data-trang-thai]` đầu tiên); `[data-don-vi] [data-slot=card-action]` = 0.
- Hàng KR: `data-kr` và `data-kr-hang` trên cùng hàng; `translate=no` đầu hàng là tên KR;
  `data-cua-toi`, `data-co-bang-chung` trong hàng.
- Ô số: `data-nguon` + `data-do-canh` trên cùng ô; trong ô `data-dau-nguon`, `button[data-so-kr]`,
  `data-so-kr-tran`, `data-so-kr-cho`, `data-chua-chup`; cha trực tiếp của `data-so-kr-tran`
  không flex và mang dạng «X / Đích» (so-okr-tu-chay E11–E13, `apps/app/test/so-kr.dom.tsx`).
- Cột việc: `th` «Việc»; `data-cot-viec` bọc `data-mo-khung-kr` và `data-so-viec` (canh-kr-okr).
- Cảnh báo đối trọng `data-canh-bao-doi-trong` nằm trên hàng KR đầu (khep-ky-okr).
- Menu KR: `aria-label` «Thao tác với <tên KR>», `aria-haspopup=menu`, sau nút «Mở việc…»;
  mục `data-muc="sua-kr"` / `"cap-nhat-kr"` (cap-nhat-tuan-okr, the-gop-y-okr…).
- Sheet: `data-okr-sheet`, `data-dau-khung`, `data-nut="them-kr"`, chữ «lẽ ra N%».
- Chuỗi mã nguồn nguyên văn: `) : xem === "duoc" ? (` trong `bang-kr.tsx`; `tong: k.soViec.tong,`
  trong `objective-sheet.tsx`; một dòng riêng `variant="neutral"` trong `tien-do-kr.tsx`;
  `SimpleTableRow` nhận `invalid`; `<Progress>` trong `okr/**` có `variant="neutral"`; không chữ
  «Đúng nhịp»/«Tự tin» ngoài tệp messages (toan-canh-okr E7).
- Không có so pixel; không bài nào khẳng định chữ tiêu đề cột «Phụ trách», «Đích», «KR».

## Đo thế nào

- Test đơn vị (bun, DOM): mỗi trạng thái của bảng trạng thái có một ca; ô gộp; URL thu/mở;
  điểm cắm vắng/có.
- `ui-check` màn thật qua phiên đo riêng (`tien-de`): Của tôi, Theo đơn vị, sheet, Chấm
  điểm × 1440/375 × sáng/tối; đo hàng mục tiêu nằm trong cùng khung với KR, tràn ngang.
- Bộ chặn thiết kế tĩnh trên các tệp đổi.
- Hồ sơ đã ký bị chạm: ghim lại một lượt ở đỉnh nhánh trước khi gộp.

## Ngoài phạm vi

Toàn cảnh, Cập nhật tuần, cây căn chỉnh; đổi API để nói đúng «trung bình / theo trọng
số»; chuyển `DataTable` sang dùng `nested`; bấm hàng KR để mở sheet KR.
