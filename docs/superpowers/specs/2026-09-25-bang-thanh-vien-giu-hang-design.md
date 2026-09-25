# Bảng thành viên giữ hàng khi danh sách «Được phép vào» dài — thiết kế

Ngày: 2026-09-25 · Hạng: T2 · Hồ sơ: `_acceptance/bang-thanh-vien-giu-hang/`

## Vấn đề

Ở `/<slug>/settings/members`, khi danh sách «Được phép vào» dài (~12 lời mời chờ trở
lên), bảng thành viên co về gần 0 chiều cao và khối «Được phép vào» đè lên nó: người
quản trị không thấy thành viên nào và không mở được menu đổi vai. Khung hỏng:
`_acceptance/khung-trang-cai-dat/evidence/settings_members-1440.png`,
`.acceptance-runs/vai-chi-okr/evidence/menu-vai.png`; khung lành lúc danh sách còn
ngắn: `_acceptance/vai-chi-okr/evidence/menu-vai.png`.

Đo trên mã chưa sửa (bàn đo 3500/3501, 15 lời mời gieo thêm): ở cả 1440, 768 và 375,
vỏ bảng thành viên cao **2px**, cả 10 hàng bị cắt, phần nội dung tràn 709–981px; nút
menu vai của một thành viên bị khối khác đè, bấm không mở menu. Tìm một tên không có
thì câu «Không ai khớp với bộ lọc này.» nằm ngoài vỏ bảng và bị che.

## Nguyên nhân

`DataTable` (`packages/ui/src/components/data-table.tsx`) chỉ có một cách xếp: gốc
`flex min-h-0 flex-1 flex-col`, vỏ bảng `min-h-0 flex-1 overflow-auto`. Nó được dựng để
**lấp đầy chiều cao còn lại của trang rồi tự cuộn bên trong** — đúng cho bảy trang
đang dùng nó (Khoá API, SSO, Liên hệ, Thoả thuận, Công ty, Chiến dịch, Danh mục
onboarding), nơi bảng là thứ duy nhất trên trang.

Trang Thành viên (từ `9fd9d49a`, «màn Members hai khối») đặt thêm khối «Được phép vào»
dưới bảng, và giữ chuỗi `min-h-0` ở `PageShell` → `PageShellContent` → `div` bọc hai
khối. Chuỗi đó chặn trang lớn theo nội dung, nên hai khối phải chia nhau chiều cao
màn hình. Khối «Được phép vào» không co được dưới chiều cao nội dung của nó; bảng
thành viên có `min-h-0` nên nhường hết. Lỗi có từ trước vòng `khung-trang-cai-dat`
(vòng đó chỉ đổi bề rộng).

## Hướng đã chọn

Hai thay đổi, cùng một vòng:

1. **Biến thể `layout="content"` cho `DataTable`, trong `packages/ui`.** Mặc định vẫn
   là `"fill"` — bảy trang kia không đổi một byte hành vi. Với `"content"`: gốc là
   `flex flex-col gap-3` (không `flex-1`, không `min-h-0`), vỏ bảng cao theo hàng, và
   khi không có hàng nào thì vỏ có chiều cao tối thiểu để lớp phủ «không có kết quả»
   / vòng quay đang tải hiện được. Các lớp của hai cách xếp nằm trong một bảng hằng ở
   đầu tệp, theo khuôn `BE_RONG` của `page-shell.tsx`.
2. **Trang Thành viên bỏ ba chỗ `min-h-0`** và truyền `layout="content"` cho bảng
   thành viên. `main` của `PageShell` vốn là `overflow-y-auto`, nên trang cuộn như
   mọi trang Cài đặt khác.

Đã loại:

- *Chỉ bỏ `min-h-0` ở trang.* Hàng hiện lại, nhưng `DataTable` vẫn mang `min-h-0
  flex-1` và lớp phủ rỗng định vị `absolute` từ `top-11` tới đáy vỏ — khi tìm không ra
  ai, vỏ cao đúng bằng hàng tiêu đề và câu thông báo bị bóp về 0. Đổi một lỗi lấy một
  lỗi.
- *Đặt `min-h-*` bằng `className` ở chỗ gọi.* `docs/design.md` cấm đè kiểu của
  component `@crm/ui` ở chỗ gọi; biến thể phải sống trong `packages/ui`.
- *Đổi luôn mặc định của `DataTable` sang cao-theo-nội-dung.* Bảy trang đang dựa vào
  cách lấp đầy (tiêu đề bảng dính, cuộn trong vỏ); đổi chúng là một vòng khác.

3. **Khối «Được phép vào» là khối chứa của chính nó** (`<section className="relative …">`).
   Thêm ở S3: khi trang đã cuộn, hai `span` sr-only ở hàng tiêu đề của bảng vẽ tay (định
   vị `absolute`, không tổ tiên định vị nào trong `main`) lấy `body` làm khối chứa, kéo
   dài `document` thêm 153/387/632px ở 1440/768/375 — hai vùng cuộn dọc lồng nhau — và
   gây luôn tràn ngang 98px ở 375 mà bản đầu của thiết kế này đổ nhầm cho bề rộng bảng.
   Đã loại: cho `main` của `PageShell` làm khối chứa cho mọi trang — đúng hơn về nguyên
   tắc nhưng chạm mọi trang dùng `PageShell`; ghi thành việc ngoài hợp đồng.

Không gửi lên hãng: bố cục hai khối của trang Thành viên là của OneHub.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Thành viên → cuộn qua bảng thành viên (đủ hàng) → mở menu «…» của một người → chọn vai (điểm ra: vai mới, toast «đã đổi») → cuộn tiếp xuống «Được phép vào».
- Biên: «Được phép vào» dài hàng chục địa chỉ — trang dài ra và cuộn, bảng thành viên không nhường chiều cao; tìm một tên không có — câu «Không ai khớp với bộ lọc này.» hiện trong vỏ bảng.
- Lỗi & quay lại: không đổi so với hôm nay (toast lỗi khi đổi vai hỏng).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Thành viên | xem và quản lý ai đang ở, ai được phép vào | thanh bên Cài đặt / menu vai, hộp «Cho phép một địa chỉ» |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-thanh-vien-danh-sach-dai | Thành viên | bảng thành viên đủ hàng, «Được phép vào» nối tiếp bên dưới, trang cuộn | cuộn, mở menu vai |
| ST-thanh-vien-tim-rong | Thành viên | vỏ bảng giữ chiều cao tối thiểu, câu «Không ai khớp với bộ lọc này.» ở giữa | xoá ô tìm |
| ST-thanh-vien-dang-tai | Thành viên | vòng quay trong vỏ bảng cao tối thiểu (không xẹp) | chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ 1440, 768, 375: trang cuộn dọc bằng `main` của `PageShell`; bảng thành viên không có thanh cuộn dọc riêng.
- Tiêu đề bảng thành viên không còn dính (bảng không tự cuộn) — chấp nhận, như mọi bảng nhỏ trong Cài đặt.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DataTable` | mở rộng (biến thể `layout`) | cần bảng có tìm/lọc/phân trang cao theo nội dung; chưa có biến thể nào |
| `PageShell`, `PageShellContent` | dùng | khung trang Cài đặt theo `docs/settings.md` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — trang Cài đặt nhiều section xếp dọc, như `docs/settings.md` mục «Section»; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

Bậc «vẽ tay là bậc cuối» (`docs/design.md`): dừng ở **bậc 1** — `DataTable` đã có trong
`packages/ui`, chỉ thêm biến thể. Không cài gì mới.

## Chuẩn đã đối chiếu

`web-design-guidelines` (skill chuẩn UI của kho, luật tải 25/09): «xử lý trạng thái rỗng
tường minh — đừng vẽ giao diện vỡ cho mảng rỗng» và «lường trước nội dung rất dài». Hai
luật này thành AC-4 (tìm không ra ai) và AC-1/AC-3 (danh sách dài).

## Cách đo

Một bàn đo trình duyệt thật, `_acceptance/bang-thanh-vien-giu-hang/rang/do-bang.mjs`,
chạy qua `mot-luot.sh` (xếp hàng với mọi lượt đo khác, `tien-de.mjs` đặt khoá nghiên
cứu lính canh rồi dọn). Nó:

- tự chặn cây (`canhCay` qua `APP_URL`) — máy chủ của cây khác thì thoát 2;
- gieo 15 lời mời chờ mang `id` tiền tố `ttv-lan-do-<pid>-`, email `@lan-do.onehub.vn`;
  dọn đúng tiền tố đó trong `finally`, dọn sót của lượt trước (tiền tố `ttv-lan-do-` của
  pid khác) trước khi gieo, và khẳng định tập lời mời có sẵn trước lượt không đổi;
- đo quan hệ hình học trên màn thật ở 1440×900, 768×1024, 375×812;
- lỗi ở biên (phiên, hết giờ chờ, trình duyệt) thoát **2** «không đo được», không bao
  giờ thành dòng SAI.

Chiều đỏ đã chạy trên mã chưa sửa: 13 SAI, mã 1 (ảnh ở
`.acceptance-runs/bang-thanh-vien-giu-hang/truoc-sua/`).

## Ngoài phạm vi

- Bảng «Được phép vào» vẫn vẽ tay (`<table>`, `<h2>`) — thay bằng `SimpleTable`/`Card` là
  đợt 3–4 của `docs/settings.md`.
- Bảy trang dùng `DataTable` lấp đầy giữ nguyên cách xếp.
