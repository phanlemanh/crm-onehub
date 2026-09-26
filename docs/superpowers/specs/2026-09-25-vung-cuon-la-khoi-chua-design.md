# Vùng cuộn của khung trang là khối chứa — thiết kế

Ngày: 2026-09-25 · Hạng: T2 · Hồ sơ: `_acceptance/vung-cuon-la-khoi-chua/`

## Vấn đề

`main[data-slot=page-shell-scroll]` trong `apps/app/components/page-shell.tsx` là vùng
cuộn dọc của mọi trang (`overflow-y-auto`) nhưng không phải khối chứa
(`position: static`). Một phần tử `position: absolute` bên trong mà không có tổ tiên
định vị nào khác lấy khối chứa ban đầu (khung nhìn) làm khối chứa. Khi phần tử đó nằm
dưới mép màn, nó kéo dài `document`: trang có hai vùng cuộn dọc lồng nhau, lăn con lăn
tới cuối `main` thì cả khung ứng dụng (đầu trang, thanh bên) trượt lên theo, và có thể
tràn ngang giả.

Đo ngày 25/09/2026 ở Cài đặt › Thành viên (hồ sơ `bang-thanh-vien-giu-hang`): `document`
tràn dọc 153/387/632px ở 1440/768/375 và tràn ngang 98px ở 375. Vòng đó vá hẹp: cho
`<section>` của `allowances-table.tsx` là `relative`.

## Số đo trước khi sửa

Quét chỉ đọc, cây này ở 3500/3501, dữ liệu dev, 30 đường dưới `/[slug]` × 1440/768/375:

- Ở dữ liệu hôm nay không trang nào tràn `document` dọc hay ngang.
- Năm trang mang phần tử thoát khỏi `main` (`offsetParent === body`):

| Trang | Số | Phần tử |
|---|---|---|
| Cài đặt › Trường | 14 | `span.sr-only` «Đổi thứ tự …», «Thêm hành động cho …» |
| Cài đặt › Chương trình OKR | 4 | `<select>` ẩn của Radix Select, `<input>` ẩn của Radix Switch |
| Cài đặt › Tiền tệ | 1 | `<select>` ẩn của Radix Select |
| Cài đặt › Danh mục onboarding | 1 | `span.sr-only` «Thao tác khác …» |
| Cài đặt › Tổ chức | 1 | `p.sr-only` «0/10 thành viên có phòng ban …» |

Chúng im chỉ vì đang nằm trên mép màn: ở 375 ô ẩn cuối của trang OKR đứng ở 792px
trong khung cao 812px. Lỗi là của khung, không của trang: thêm một hàng dữ liệu là trang
khác vỡ theo, và vá từng trang là đuổi theo mãi.

Không phần tử nào trong số đó đặt `top/right/bottom/left` — tất cả nằm ở vị trí tĩnh.
Phần tử `fixed` trong mã (hộp thoại, Sheet, SaveBar) render qua portal; một `div` `fixed`
đo được trong `main` ở trang Trường không phụ thuộc khối chứa `relative`.

## Hướng đã chọn

Thêm `relative` vào class gốc của `main` trong `PageShell`, áp cho cả nhánh `contained`.

Vì sao an toàn:

- Phần tử `absolute` không đặt toạ độ nằm ở vị trí tĩnh bất kể khối chứa là gì, nên đổi
  khối chứa từ khung nhìn sang `main` không dịch nó một pixel. Thứ duy nhất đổi là hộp
  nào phải chứa phần tràn của nó: `main`, vốn cuộn được.
- `position: relative` không có `z-index` không mở ngữ cảnh xếp lớp mới và không đổi khối
  chứa của phần tử `fixed` (chỉ `transform`, `filter`, `contain` làm điều đó).
- `sticky` bám theo vùng cuộn gần nhất, không theo khối chứa — không đổi.

Đã loại:

- *Vá từng trang (`relative` cho từng section).* Năm trang hôm nay, trang thứ sáu ngày mai;
  mỗi `Select` hay `Switch` của Radix mới là một chỗ vá nữa.
- *`overflow-x-hidden` / `overflow: clip` trên khung ứng dụng.* Che thanh cuộn chứ không gỡ
  phần tràn — Web Interface Guidelines: «Avoid unwanted scrollbars: … fix content
  overflow». Và nó không gỡ được vùng cuộn dọc thứ hai.
- *Gỡ `relative` thừa ở `allowances-table.tsx`.* Đúng về nguyên tắc nhưng chạm tệp của hồ sơ
  đã ký mà không thêm giá trị nào cho người dùng.

Không gửi lên hãng: `PageShell` của kho này đã rẽ khỏi bản của hãng (tham số `width`).

## Đặc tả UX

Bỏ — xem sổ quyết định. Vòng này không đổi luồng, màn hay trạng thái nào; thứ nhìn thấy
duy nhất là khung ứng dụng thôi trượt khi lăn tới cuối trang dài.

Bậc «vẽ tay là bậc cuối» (`docs/design.md`): không có khối giao diện mới. `PageShell` sống
ở `apps/app/components`, không ở `packages/ui`; sửa tại chỗ.

## Chuẩn đã đối chiếu

- `web-design-guidelines` (skill chuẩn UI của kho, luật tải 25/09): «Avoid unwanted
  scrollbars: `overflow-x-hidden` on containers, fix content overflow» và «Text containers
  handle long content». Vòng này sửa gốc phần tràn, không che thanh cuộn.
- CSS Positioned Layout Module Level 3 (W3C): khối chứa của phần tử `absolute` là tổ tiên
  gần nhất có `position` khác `static`; không có thì là khối chứa ban đầu.

## Cách đo

Một bàn đo trình duyệt thật, `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`, theo
khuôn `bang-thanh-vien-giu-hang/rang/do-bang.mjs`, chạy qua
`_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh` (xếp hàng với mọi lượt đo khác;
`tien-de.mjs` đặt khoá nghiên cứu lính canh rồi dọn). Nó:

- tự chặn cây bằng `canhCay` qua `APP_URL` — máy chủ của cây khác thì thoát 2;
- rút danh sách trang từ đĩa: mọi `page.tsx` dưới `apps/app/app/(app)/[slug]`. Đoạn động
  lấy mã bản ghi thật của workspace từ cơ sở dữ liệu theo một bảng tên đoạn → bảng; tên
  đoạn lạ thì thoát 2 gọi tên, để trang mới không lọt khỏi phép đo trong im lặng;
- mỗi trang mở MỘT lần, đổi khổ bằng `setViewport` trên chính trang đó; đường dẫn cuối đọc
  sau khi đứng yên (Slack › Người chuyển hướng trong luồng stream). Mỗi trang × 1440×900,
  768×1024, 375×812 cho ra đúng một nhãn: **đo** (có `main` cuộn của `PageShell`), **chuyển
  hướng**, **contained**, hoặc **không khung**. Chín trang ghim sẵn được mang nhãn khác «đo»
  (sáu chuyển hướng, một contained, hai không khung); trang nào ngoài tập ghim mà không «đo»
  là SAI. Bị đẩy về đăng nhập, hay đoạn động không có bản ghi → thoát 2;
- với trang **đo**, kiểm trên cùng trang đang mở:
  1. không phần tử `absolute` nào trong `main` có `offsetParent === body` — in kèm số phần tử
     `absolute` đã xét; đối chứng: một `span.sr-only` thăm dò, khi ép `main` về `static`, phải bị
     bộ chọn bắt với `offsetParent === body`;
  2. `document` không tràn dọc, không tràn ngang ở trạng thái tự nhiên;
  3. chèn vào `[data-slot=page-shell]` — con trực tiếp của `main` — một khối đệm cao gấp đôi
     khung nhìn ở đầu và một `span.sr-only` đẩy sang phải `150vw` ở cuối (khẳng định cả hai nằm
     trong `main`), rồi `document` vẫn không tràn dọc, không tràn ngang; đối chứng: ép `main`
     về `static` thì `document` phải tràn CẢ dọc lẫn ngang;
  4. vẫn có hai phần tử chèn, lăn con lăn trên `main` tới cuối rồi lăn thêm: `window.scrollY` = 0
     và `header` đầu tiên ngoài `main` vẫn ở top 0;
  5. mọi phần tử `absolute` mà khối chứa là `main` đứng ở vị trí tĩnh: ép `top/right/bottom/left`
     về `auto` không dịch hộp quá 1px (không đọc chuỗi computed — phần tử đã định vị trả px, không
     trả `auto`); đối chứng: một `span` `top:0;right:0` chèn tạm phải bị gọi tên;
  6. hộp của mọi phần tử trong `main`, cuộn ở đầu trang, không lệch quá 1px giữa khung như đang
     có và khung ép `static`;
- ngân sách: in thời gian từng trang và tổng; tổng quá 540s thì thoát 2 gọi tên — trần Bash của
  lượt chấm là 600s, quá nó thì `tien-de.mjs` mất bước dọn;
- chụp trang Trường ở ba khổ sau khi lăn tới cuối, một ảnh với khung như đang có và một
  ảnh đối chứng khi tắt khối chứa;
- lỗi ở biên (phiên, hết giờ chờ, trình duyệt) thoát **2** «không đo được», không bao giờ
  thành dòng SAI.

Chiều đỏ chạy trên mã chưa sửa trước khi đụng `page-shell.tsx`. Dự đoán: điều 1 đỏ ở năm trang
trên × ba khổ; điều 3 và điều 4 đỏ ở mọi trang đo × ba khổ (phần tử thăm dò thoát `main` ở
mọi trang). Điều 5 và 6 chỉ có nghĩa sau khi sửa (trước khi sửa, tập xét rỗng và hai trạng
thái trùng nhau) — chiều đỏ của chúng là phá-thử trên mã đã sửa.

## Ngoài phạm vi

- Nhánh `contained` (trang chi tiết agent): nhận cùng dòng sửa, không chấm.
- Gỡ `relative` thừa ở `allowances-table.tsx`.
- Bảng «Được phép vào» vẽ tay và tràn ngang 98px bên trong `main` ở 375 — đợt 3–4 của
  `docs/settings.md`.
- Trang không dùng `PageShell` (trò chuyện với agent, đăng nhập, landing).
