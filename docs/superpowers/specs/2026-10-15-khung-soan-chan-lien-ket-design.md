# Khung soạn chặn liên kết (K2f) — thiết kế

Hàng K2f của `docs/plan/lo-trinh-okr.json`. Câu giao: «Khi Kara đang soạn hoặc người dùng gõ dở trong khung, bấm một
liên kết trong khung thì được hỏi trước khi rời, chữ đang gõ không mất».

## Vì sao có việc này

Trước K2e, cuộc soạn OKR là một trang riêng, bọc trong `GiuTrangSoan` (`okr/soan/giu-trang.tsx`, commit `8843fe4a1`).
Nó làm ba việc: hỏi khi rời bằng `beforeunload`, gom lời khai thay đổi của trang qua `GiuContext`, và chặn liên kết nội
bộ bằng `useChanLienKet` — bấm liên kết khi đang có thứ dở thì hiện hộp hỏi, chọn rời thì `router.push` tới đúng địa
chỉ. K2e (`soan-okr-trong-khung`) chuyển cuộc soạn vào khung bản ghi bên phải và xoá `giu-trang.tsx`. Khung (`Sheet`
qua `DetailSheet`) đã nhận hai việc đầu: đóng khung bằng nút, Esc hay bấm ra ngoài thì hỏi theo lời khai của
`GiuKhiSoan` và `useCuocSoan`. Việc thứ ba rơi mất: hai liên kết trong khung — «Tới Kho tài liệu» và «Xem theo đơn vị»
— đi thẳng, khung đóng, chữ gõ dở mất. Cổng Bằng chứng của K2e ghi nó là Ngoài-9 («mở hợp đồng mới»).

## Cách làm

### 1. Cơ chế ở `packages/ui` (`giu-thay-doi.tsx`)

- `GiuNguCanh` thêm `hoiRoi(tiep: () => void)`: mở đúng hộp hỏi mà khung đang dùng khi đóng (cùng lời hỏi đang khai),
  nhớ `tiep`. Trong `useGiuGoc`:
  - chọn nút rời → chạy `tiep` thay cho `dongThat`; khung không tự đóng — địa chỉ mới bỏ tham số `record`, nên ngăn
    xếp bản ghi rỗng và khung đóng theo địa chỉ;
  - chọn ở lại (nút hay Esc) → bỏ `tiep`, không gì đổi;
  - khung đóng vì lý do khác → bỏ `tiep`.
- Hook mới `useChanLienKetTrongHop(dieuHuong: (href: string) => void)`: đọc `GiuContext` của hộp chứa nó; khi
  `coThayDoi` đúng thì dùng `useChanLienKet` sẵn có (nghe click ở pha bắt, lọc bằng `hrefNoiBo`) và mỗi lần chặn gọi
  `hoiRoi(() => dieuHuong(href))`. Không có `GiuContext` (gọi ngoài hộp) thì không làm gì.
- `hrefNoiBo` giữ nguyên: bỏ qua Cmd/Ctrl/Shift/Alt, chuột khác chuột trái, `target` khác `_self`, `download`, miền
  khác, vùng `contenteditable`, và liên kết trỏ đúng đường + truy vấn đang đứng.

### 2. Khung soạn (`apps/app`)

`CuocSoanTrongKhung` (`okr/soan/trang-soan.tsx`) dựng một thành phần nhỏ gọi
`useChanLienKetTrongHop((href) => router.push(href))`. Chỉ khung soạn bật; các khung bản ghi khác không đổi.

### 3. Vì sao không đóng khung trước rồi mới đi

`closeAll()` ghi địa chỉ qua `nuqs` bằng hàng đợi trễ; gọi nó rồi `router.push` là hai lần ghi địa chỉ đua nhau, lần
ghi muộn của `nuqs` có thể chép tham số cũ sang trang mới. Đi thẳng thì chỉ một lần ghi, và Quay lại đưa người về đúng
trang có khung soạn — như trang soạn cũ.

### 4. Lượt Kara khi rời

Như đóng khung hôm nay: lượt vẫn chạy ở máy chủ, không gọi dừng (`soan-okr-trong-khung.dom.tsx` ghim «dong khung dung
luot: 0»). Mở lại cuộc soạn thấy bản nháp mới.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: khung soạn mở, có thứ dở → bấm «Tới Kho tài liệu» → hộp hỏi → «Đóng» (lời soạn) hay «Bỏ» (lời gõ dở) → tới
  Kho tài liệu (điểm ra: trang đích của liên kết; khung đã đóng).
- Biên: không có gì dở → đi ngay không hỏi; Cmd/Ctrl/chuột giữa → thẻ mới mở, khung giữ nguyên, không hỏi.
- Lỗi & quay lại: chọn «Ở lại» hoặc Esc → hộp đóng, khung còn, chữ còn, focus về ô vừa gõ; đã rời mà muốn quay lại →
  nút Quay lại của trình duyệt mở lại khung soạn (chữ gõ dở đã bỏ theo lựa chọn của người).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Khung soạn OKR (bản ghi `soan`) | soạn Mục tiêu, KR cùng Kara | từ «Soạn» ở Theo đơn vị / tới trang của liên kết |
| Hộp hỏi rời | xác nhận bỏ thứ đang dở để đi | từ bấm liên kết / về khung hoặc tới trang đích |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hop-roi-dang-soan | Hộp hỏi rời | «Kara đang soạn. Đóng khung?» · «Lượt này vẫn chạy khi bạn đóng…» · nút «Đóng» / «Ở lại» | rời hoặc ở lại |
| ST-hop-roi-go-do | Hộp hỏi rời | «Bỏ những gì vừa nhập?» · «Những gì bạn vừa nhập trong hộp này sẽ mất.» · «Bỏ» / «Tiếp tục sửa» | rời hoặc ở lại |
| ST-khung-khong-do | Khung soạn | không hộp nào; liên kết đi ngay | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Phím: Enter trên liên kết đang focus tính như bấm; Esc trong hộp hỏi là ở lại.
- Focus: ở lại → focus về ô gõ cuối cùng (luật sẵn có của `useGiuGoc`).
- Khổ: 1280 một cột Kara; 375 hai tab, liên kết «Tới Kho tài liệu» ở tab Trò chuyện — cùng hành vi.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `ConfirmDialog` qua `useGiuGoc` | dùng | hộp hỏi khi đóng khung đã có, cùng lời |
| `useChanLienKet`, `hrefNoiBo` | dùng | bộ lọc click nội bộ đã chạy ở Kho tài liệu |
| `useChanLienKetTrongHop`, `hoiRoi` | mở rộng | `packages/ui` chưa có lối «hỏi rồi làm việc khác ngoài đóng» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi IA — khung bản ghi chồng lên trang danh sách đã có từ K2e; vòng này chỉ thêm một hộp hỏi đã có.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn đối chiếu

- `feature_loop.ui_standards_skill` = `web-design-guidelines`: đã nạp; hai luật liên quan — «Warn before navigation
  with unsaved changes (beforeunload or router guard)» (vòng này là router guard) và «Links use `<a>`/`<Link>`
  (Cmd/Ctrl+click, middle-click support)» (giữ nguyên nhờ `hrefNoiBo`).
- `docs/design.md` bậc 1: dùng `ConfirmDialog` của `packages/ui`, không vẽ hộp mới. Không chữ mới, không biến thể mới.

## Ngoài phạm vi

- `beforeunload` cho ca chỉ có chữ gõ dở (đóng thẻ, tải lại) — chưa có hôm nay, câu giao nói «bấm một liên kết».
- Chặn liên kết ở khung bản ghi khác có khai thay đổi (trao đổi Mục tiêu, thêm nhanh).
- Giữ chữ gõ dở qua lần rời trang.

## Đo

- DOM (`apps/app`): ma trận khung soạn thật dưới `RecordSheetHost` với bộ giả `khung-soan-okr.tsx`.
- DOM (`packages/ui`): ma trận cơ chế trong `Sheet` — mọi nhánh của `hrefNoiBo` × có dở.
- Đột biến: ba bản sao cây làm hỏng từng mắt xích, mỗi bản phải làm đỏ đúng ca đã ghim.
- Màn thật 1280 và 375 bằng phiên đo riêng của cây (`tien-de.mjs`), dùng lại bàn đo của K2e
  (`_acceptance/soan-okr-trong-khung/rang/man-chung.mjs`, mô hình giả).
