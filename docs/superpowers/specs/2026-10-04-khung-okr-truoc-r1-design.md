# Khung OKR trước R1 — thiết kế

Ngày 04/10/2026 · hồ sơ `khung-okr-truoc-r1` · hàng R1a của `docs/plan/lo-trinh-okr.json` · T2

## Vì sao

Mọi phòng ban dùng OKR thật từ 14/10. Khảo sát 04/10 (`de-xuat-lo-trinh.md` mục A1, 62 màn
thật, lái thử production cùng ngày) không thấy lỗi chặn, nhưng thấy chín lỗi trình bày ở khung
Mục tiêu và thanh «Theo đơn vị» mà ai mở khung cũng gặp, cộng một liên kết trong khung bỏ thay
đổi chưa lưu mà không hỏi. Vòng này sửa đúng mười chỗ đó, không thêm tính năng.

| Mã | Thấy gì hôm nay | Ảnh |
|---|---|---|
| KH1 | Bảng KR trong khung có viền và bo góc nhưng áp sát mép khung; các khu khác lùi 20 px | `lai-thu-prod-0410/anh/10-vien-bang-kr.jpg` |
| KH2 | Thanh «Theo đơn vị» nhảy dòng sau khoảng 4 giây: nút soạn tải muộn rồi nở thành nút + dòng mô tả, thanh gãy 3 hàng, danh sách tụt khoảng 100 px | `13-thanh-cong-cu-nhay-dong.jpg` |
| R1m-5 | Ở dạng «chưa cấu hình», nút soạn khoá cùng câu giải thích chiếm cả một hàng của thanh | `r1-quan-tri-theo-don-vi-ke-hoach-1440.png` |
| KH3 | Bản tiếng Anh có hai tab cùng tên «History» (Vết và Diễn biến) | `07-tab-vet.jpg` |
| KH4 | Điện thoại: đầu khung (tên, nhãn, ba ô số, tab) đứng yên, chiếm gần nửa ngăn kéo; vùng cuộn còn khoảng 360 px | `12-dien-thoai-khung.jpg`, `r1-truong-phong-khung-muc-tieu-390.png` |
| R1m-2 | Điện thoại: ô Tiến độ cắt chữ («35% · lẽ ra 4…»), ô Phụ trách cắt tên («Nguyễ…») | `r1-truong-phong-khung-muc-tieu-390.png` |
| R1m-3 | Điện thoại: tên Mục tiêu căn giữa trong khi ảnh đại diện và nút nằm hai bên | cùng ảnh |
| KH5 | «Objective progress 0% from 1 KRs.» | `12-dien-thoai-khung.jpg` |
| G2 | Chip «Kara · N góp ý» là nút cao 24 px góc 4 px, đứng cạnh nhãn «Cam kết/Nháp» cao 20 px bo tròn | `01-mine-chip.jpg` |
| G3 | Chip cùng hàng nhãn ở «Của tôi», rớt xuống hàng riêng ở «Theo đơn vị» | `01-mine-chip.jpg`, `08-loc-kara.jpg` |
| Liên kết chéo | Trong hộp «Mức hiển thị», nút «Mở tab Căn chỉnh» đóng hộp và mất thay đổi chưa lưu mà không hỏi | `objective-hien-thi.tsx:166-175` |

Ảnh nằm ở `.acceptance-runs/dieu-phoi-1410/nguon/` (ngoài git). Các ảnh dùng làm bằng chứng được
chép vào `_acceptance/khung-okr-truoc-r1/evidence/truoc/`.

## Hướng, từng lỗi

### KH1 — bảng trong khung có lề

Thêm một khe `DetailSheetTable` trong `components/detail-sheet.tsx`: bọc bảng bằng đúng lề ngang
của các khu (`GUTTER`, 20 px) và khoảng dọc của khu. Cả ba bảng trong khung Mục tiêu đi qua khe
này: bảng KR (tab KR), bảng Căn chỉnh và bảng Vết. Bảng giữ viền và bo góc của `SimpleTable`;
chỉ thêm lề. Bỏ viền khi nằm trong khung là hướng thứ hai (xem «Đã cân»).

### KH2 + R1m-5 — nút soạn giữ một chỗ cố định trên thanh

Thanh «Theo đơn vị» luôn là một hàng ở 1440 px. Nhóm nút soạn dời về **cuối hàng** (sau
«Nhập từ bảng tính» và «Thêm mục tiêu»), nên khi nó đổi chữ thì không nút nào bên phải bị đẩy.
Nhóm chỉ gồm tối đa hai nút, từ lúc trang vẽ tới lúc dữ liệu về:

- Lúc đang tải: nút soạn khoá, cùng chữ «Soạn OKR cùng Trợ lý», cùng cỡ.
- Chữ nút chính giữ như hôm nay: «Soạn OKR cùng Trợ lý», hoặc «Tiếp cuộc đang soạn» khi có cuộc
  đang mở. Đổi tên sang Kara là việc của lượt K6a, không phải vòng này.
- Mọi chữ phụ hôm nay nằm dưới nút hay cạnh nút dời vào một `Popover`, mở từ nút «i» nhỏ dính
  liền bên phải nút soạn: ngày mở cuộc, số lượt, số dòng chưa quyết, «1/3 cuộc» (bấm mở danh sách
  cuộc), nhãn «chế độ ẩn», lý do khoá. Nút «i» có `aria-label` nói rõ nó mở gì.
- **Chưa cấu hình** (`cauNoi` sai): quản trị thấy nút khoá + nút «i» nói lý do; người không phải
  quản trị không thấy nút soạn, vì câu «quản trị viên OneHub cần bật nó» không phải việc của họ.
- Ở khổ hẹp, thanh vẫn được xuống dòng như mọi thanh khác, nhưng nút soạn không tự sinh thêm hàng
  chữ nào.

### KH3 — tab không trùng tên

Tab Vết đọc nhãn từ một khoá mới `sheet.tabVetNhan` (tiếng Anh «Changes», tiếng Việt «Vết»). Tab
Diễn biến giữ «History». Khoá cũ `tabVet` không sửa: luật điều phối cho phép `lib/messages` chỉ
thêm khoá. Một bài kiểm đọc nhãn mọi tab của khung ở cả hai ngôn ngữ và đòi không trùng.

### KH4 + R1m-2 + R1m-3 — điện thoại đọc được

Chỉ ở khổ dưới `md` (ngăn kéo dưới), chỉ cho khung Mục tiêu:

- Cả khung cuộn chung một vùng: tên, nhãn, ba ô số cuộn đi theo nội dung; thanh tab dính ở mép
  trên khi cuộn qua. Các khung khác (thoả thuận, cá nhân, công ty, kế hoạch) giữ nguyên, vì tab
  Tác nhân của chúng có ô soạn ghim đáy.
- Tên Mục tiêu căn trái như trên máy tính. Sửa cho mọi khung chi tiết, vì hàng đầu khung nào
  cũng là ảnh + tên + nút, nên căn giữa ở đâu cũng lệch. Sửa bằng một tuỳ chọn căn lề của
  `DrawerHeader` trong `packages/ui`, không ghi đè lớp tại chỗ gọi.
- Ba ô số được xuống dòng thay vì cắt: «35%» trên một dòng, «lẽ ra 40%» xuống dòng dưới; tên
  người phụ trách xuống bao nhiêu dòng cũng được, không cắt.
- Mốc dính của thanh tab nằm dưới tay nắm của ngăn kéo (bản mẫu cho thấy tay nắm đè lên tab).

### KH5 — số ít

Thêm khoá hàm `sheet.tienDoTuSo(x, n)`: tiếng Anh «from 1 KR» / «from 2 KRs», tiếng Việt như cũ.
Khung đọc khoá mới; khoá `tienDoTu` cũ giữ nguyên. Khoá mới ghim ở `messages-guard`.

### G2 + G3 — chip Kara cùng hình và cùng chỗ với nhãn

- Chip là một `Badge` bấm được (`Badge asChild` bọc `button`), cùng cao 20 px, cùng góc, cùng cỡ
  chữ với nhãn «Cam kết», «Nháp». `packages/ui` thêm trạng thái hover và focus cho `Badge` khi
  nó là `button` (hôm nay chỉ có cho `a`).
- Nhãn loại, nhãn trạng thái, nhãn giới hạn và chip Kara nằm trong **một nhóm không tách**. Nhóm
  đứng sau tên khi đủ chỗ; thiếu chỗ thì cả nhóm xuống dòng dưới tên. Chip luôn là phần tử cuối
  của nhóm, nên ở «Của tôi» và «Theo đơn vị» nó đứng cùng một chỗ so với nhãn.
- Chữ chip không đổi ở vòng này. Bản tiếng Anh vẫn nói «1 suggestions» (G1, Out of scope).

### Liên kết chéo — hỏi lại trước khi bỏ thay đổi

Nút «Mở tab Căn chỉnh» trong hộp «Mức hiển thị» đi qua `DialogClose`. Bộ giữ thay đổi của
`Dialog` nhờ đó thấy được lần đóng: có thay đổi chưa lưu thì hỏi «Bỏ thay đổi?»; người chọn ở lại
thì hộp giữ nguyên, tab không đổi; người chọn bỏ thì hộp đóng rồi khung chuyển sang tab Căn
chỉnh. Không có thay đổi thì đi thẳng như hôm nay.

## Đã cân

| Lỗi | Hướng chọn | Hướng bỏ | Vì sao |
|---|---|---|---|
| KH1 | Bảng giữ viền, thêm lề 20 px | Bảng tràn mép, bỏ viền ngoài khi nằm trong khung | Lề đều với «Vì sao lúc này» và vùng Kara; bảng có viền vẫn đọc là một khối. Bỏ viền thì cần biến thể mới của `SimpleTable` mà màn khác chưa cần |
| KH2 | Chữ phụ vào popover | Chữ phụ thành một dòng riêng dưới thanh, giữ sẵn chiều cao | Dòng giữ chỗ vẫn tốn một hàng cho mọi người, kể cả người không soạn |
| KH4 | Cả khung cuộn, tab dính | Đầu khung gọn lại (ẩn ba ô số trên điện thoại) | Ẩn ô số làm mất tiến độ trên điện thoại, mà đó là thứ người ta mở khung để xem |
| G3 | Nhóm nhãn không tách | Đưa chip xuống dòng phụ dưới tên | Dòng phụ là chữ thường; chip là thứ bấm được, đặt chung với nhãn thì nhất quán với khung chi tiết |

## Ranh giới

Điều phối duyệt phần ngoài danh sách ngày 04/10 13:00. Tệp P1 được sửa (`LUAT.md`): `objective-sheet.tsx`, `objective-hien-thi.tsx`, `detail-sheet.tsx`,
`chip-gop-y.tsx`, `khoi-muc-tieu.tsx`, `okr/soan/nut-soan.tsx`, `theo-don-vi/**`. Ngoài danh sách
đó, vòng này cần thêm:

- `components/crm/record-sheet/record-parts.tsx` — cho chế độ cuộn cả khung. Tệp khung chung, không
  phiên nào khác giữ.
- `bang-vet.tsx` — chỉ để bảng Vết đi qua khe lề.
- `lib/messages/okr.ts` và `lib/messages/okr-soan.ts` — **chỉ thêm khoá** (`tabVetNhan`,
  `tienDoTuSo`, chữ của popover soạn), ghim ở `messages-guard`.
- `packages/ui`: `badge.tsx` thêm trạng thái cho `button`, `drawer.tsx` thêm tuỳ chọn căn lề —
  chỉ thêm.

## Không đổi

API, dữ liệu, quyền, chữ tiếng Việt hiện có (trừ khoá mới của popover soạn), mọi khung chi tiết
khác trên máy tính.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: «Theo đơn vị» → thanh một hàng, nút soạn đúng chỗ ngay từ đầu → bấm tên hay chip
  Mục tiêu → khung mở, bảng KR có lề → (điện thoại) cuộn, đầu khung đi theo, tab dính.
- Biên: chưa cấu hình soạn (quản trị thấy nút khoá + «i», người khác không thấy nút); mục tiêu
  1 KR (số ít); mục tiêu không có nhãn giới hạn; tên Mục tiêu và tên người rất dài.
- Lỗi & quay lại: đang chọn «Giới hạn» trong hộp Mức hiển thị bị từ chối → bấm «Mở tab Căn
  chỉnh» → hỏi «Bỏ thay đổi?» → «Ở lại» về hộp nguyên trạng / «Bỏ» sang tab Căn chỉnh.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Theo đơn vị | Xem và đặt OKR của một đơn vị | thanh bên / khung Mục tiêu, phiên soạn |
| Của tôi | Xem OKR mình phụ trách | thanh bên / khung Mục tiêu |
| Khung Mục tiêu | Đọc và sửa một Mục tiêu cùng các KR | hàng Mục tiêu, chip Kara / đóng về danh sách |
| Hộp Mức hiển thị | Chọn ai thấy Mục tiêu | menu khung / khung, tab Căn chỉnh |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-donvi-soan-dangtai | Theo đơn vị | nút soạn khoá, cùng chữ, ở cuối hàng | chờ; thanh không đổi chiều cao khi dữ liệu về |
| ST-donvi-soan-mo | Theo đơn vị | «Soạn OKR cùng Trợ lý» + nút «i» | bấm soạn; «i» xem số cuộc đã dùng |
| ST-donvi-soan-tiep | Theo đơn vị | «Tiếp cuộc đang soạn» + «i» (ngày mở, số lượt, dòng chưa quyết, danh sách cuộc) | tiếp cuộc |
| ST-donvi-soan-khoa | Theo đơn vị | nút khoá + «i» nói lý do (hết cuộc, tạm nghỉ, chưa có khoá) | đọc lý do trong popover |
| ST-donvi-soan-chuacauhinh | Theo đơn vị | quản trị: nút khoá + «i» «chưa bật trên máy chủ này»; người khác: không có nút | quản trị bật; người khác không phải làm gì |
| ST-danhsach-chip | Của tôi, Theo đơn vị | nhóm nhãn [loại · trạng thái · giới hạn · Kara N góp ý] cùng cao 20 px | bấm chip mở khung tới vùng Kara |
| ST-khung-kr | Khung Mục tiêu | bảng KR lùi 20 px như các khu; «from 1 KR» | đọc, sửa KR |
| ST-khung-tab | Khung Mục tiêu | năm tab, tên không trùng ở cả hai ngôn ngữ | chuyển tab |
| ST-khung-dienthoai | Khung Mục tiêu (375) | tên căn trái; ba ô số xuống dòng không cắt; cuộn thì đầu khung đi theo, tab dính | cuộn đọc |
| ST-hienthi-hoilai | Hộp Mức hiển thị | «Bỏ thay đổi?» khi bấm «Mở tab Căn chỉnh» lúc có thay đổi | ở lại / bỏ và sang tab |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thanh «Theo đơn vị» ở 1440 px: mọi nút cùng một hàng (cùng `top`), trước và sau khi dữ liệu soạn về.
- Nút «i»: bàn phím mở được (Enter/Space), Esc đóng, focus về nút «i».
- Chip Kara: Enter/Space mở khung như bấm chuột; không làm hàng thu/mở.
- Điện thoại: `prefers-reduced-motion` không ảnh hưởng (không có chuyển động mới).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Badge` | mở rộng | thêm hover/focus khi là `button`, để chip cùng hình với nhãn |
| `DrawerHeader` | mở rộng | tuỳ chọn căn trái cho đầu khung chi tiết |
| `Popover` | dùng | chữ phụ của nút soạn |
| `DialogClose` | dùng | liên kết chéo đi qua bộ giữ thay đổi |
| `DetailSheetTable` | tạo (trong `detail-sheet.tsx`) | một khe lề cho mọi bảng trong khung |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: vòng này không đổi khuôn; danh sách OKR mở khung chi tiết như hôm nay, chỉ sửa trình bày.
<!-- UX-SPEC-TEMPLATE>>> -->
