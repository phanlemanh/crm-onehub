# VK19 `bo-okr-chi-don-vi` — Bộ OKR chỉ của một đơn vị

Ngày 28/10/2026. Hàng VK19 của `docs/plan/lo-trinh-okr.json`. Cổng Đáng: chủ kho «build, giữ ngưỡng đề xuất»
(04:57Z). Nguồn: `docs/findings/2026-10-25-bo-okr-gom-lan/README.md` (Q1–Q8 chủ kho duyệt 25/10).

## Vấn đề

`dieuKienDonVi` (`apps/api/src/okr/okr-xem.service.ts`) mở `bp:<id>` thành «mục tiêu cấp bộ phận **hoặc** của mọi phòng
ban con». Bốn thẻ con của trang một bộ đọc qua hàm đó (OKR `danhSach`, Việc `viecCuaBo`, Họp tuần `hopTuan`, Chấm điểm
`bangCham`), cộng bốn ô số `soBo` của VK8. Trên bộ mẫu, Khối Kinh doanh có 1 mục tiêu riêng mà hiện 15. Từ điển
(`CONTEXT.md` «Bộ OKR», 18/10) nói bộ là của **một** đơn vị; VK3 AC-3 đã ký «bảng mục tiêu là của đúng đơn vị ấy».

Trang một bộ còn ba đường sang đơn vị khác (dòng vị trí, ô chọn đơn vị, lưới «Đơn vị trực thuộc») và mục gập «Đã bỏ
(n)» giữa bảng và lưới, trái luật màn 25/10 (`docs/design.md` «Thứ tự một màn», «Hàng công cụ», «Dòng vị trí»).

## Hướng làm

1. **Máy chủ.** Nhánh `bp` của `dieuKienDonVi` thành `{ level: "bo-phan", divisionId }`, như `pb` và `goc`. Tham số
   quyền `q` hết dùng ở mọi nhánh nên bỏ khỏi chữ ký, sửa năm chỗ gọi. `soBo` đổi theo mà không sửa riêng.
2. **Danh sách Bộ OKR.** `danhSachBo` thôi đọc hàng `toanCanh` (số gộp) cho Tiến độ và KR tự tin thấp; dựng số riêng
   theo khoá đơn vị từ cùng tập mục tiêu đã công bố (`mucTieuTinh`, phạm vi `so-gop`) bằng chính `dungHangSo`. Hàng
   nào cũng bằng `soBo` của cùng đơn vị. Toàn cảnh (`gopToanCanh`, `gopSucKhoe`) giữ cộng dồn.
3. **Dòng vị trí có menu.** Mắt xích cuối của trang một bộ (`goc`, `bp`, `pb`) là nút mở menu ba nhóm: Thuộc (đơn vị
   cha) · Cùng cấp (đơn vị cùng cha, cùng cấp) · Trực thuộc (con trực tiếp), theo thứ tự cây, mỗi mục kèm số mục tiêu
   công bố riêng (`okr.countByUnit`). Liên kết giữ `kyOkr` và thẻ con đang mở (`xemOkr`). Bộ cá nhân (`nguoi:`) giữ
   mắt xích tĩnh. Dựng thành phần `BreadcrumbMenu` trong `packages/ui` (bậc 5: shadcn và ReUI không có mắt xích mở
   menu; đã tra `breadcrumb` có `BreadcrumbEllipsis` chỉ cho mắt xích ẩn).
4. **Gỡ hai đường thừa.** Bỏ ô chọn đơn vị (`chon-don-vi.tsx`) khỏi hàng công cụ và lưới «Đơn vị trực thuộc»
   (`don-vi-con.tsx`) dưới bảng; xoá hai tệp và hàm chỉ chúng dùng.
5. **Đã bỏ là nút.** Mục gập `NhomDaBo` trên trang một bộ thành nút bật tắt «Đã bỏ (n)» cuối hàng công cụ của bảng
   (`DataTable actions`, như «Đã lưu trữ» của Thoả thuận); bật thì bảng chỉ hiện mục tiêu đã bỏ; ghi lên đường dẫn
   `daBoOkr` bằng `nuqs`. Của tôi giữ nguyên (SV1 gánh).
6. **Câu rỗng của bộ phận.** Bộ phận không có mục tiêu riêng: «<Khối> chưa có mục tiêu riêng trong <chu kỳ>» và một
   câu chỉ sang menu ở tên khối trên dòng vị trí. Phòng ban và OneHub giữ câu rỗng hiện có.
7. **Bốn điểm HT1** (ghi chú VK19, chủ kho 25/10 «Đồng ý theo khuyến nghị»): Họp tuần của OneHub rỗng bỏ danh sách
   «Đơn vị có KR» (số gộp từ `toanCanh`), thay bằng câu chỉ sang menu dòng vị trí + liên kết «Xem mọi bộ OKR»; thước
   E7/E8 của HT1 đổi theo, chiều đỏ E8 lật thành «`hopTuan(bp)` gồm phòng ban con → đỏ». Thứ tự AC-2 của HT1: Hỏi-1.
8. **Hồ sơ đã ký đổi luật** — mỗi hồ sơ một dòng sổ `fix` `decided_by` chủ kho, đo hai chiều, qua `cham-tep`:
   `toan-canh-okr` AC-1/E1 (`okr-toan-canh.spec.ts` «bp gồm con» lật), `gop-y-dung-cho` (đơn vị trong thước sang
   `pb:`), `tro-ly-okr-tom-tat` theo E1, `trang-bo-okr` AC-7 (liên kết Đơn vị con), AC-10 (ô chọn đơn vị), thêm ca bộ
   phận vào E5, `bo-okr-co-so` E1/E14 (bộ phận thôi bằng hàng Toàn cảnh), `hop-tuan-mo-dung-bo` E7/E8.
9. `CONTEXT.md` mục Bộ OKR thêm một dòng: bộ của bộ phận không gồm bộ của phòng ban con; Toàn cảnh mới cộng dồn.

Không đổi lược đồ, không migration. Module `okr` ngoài đường T3 → T2.

<!-- <<<UX-SPEC-TEMPLATE -->
## Eval cũ thay bởi hồ sơ này

Vòng này gỡ ô chọn đơn vị và lưới «Đơn vị trực thuộc» khỏi trang một bộ (AC-4); đường sang đơn vị khác chỉ còn menu
dòng vị trí (AC-5). Các ô của hai hồ sơ đã ký đo hai thứ ấy mất vật đo, nên khai `status: not-run` kèm
`superseded_by` trỏ về đây (lối (a), chủ kho chọn 28/10 qua phiên giám sát: «VK19 hai hồ sơ ô chọn đơn vị: a»).

| Eval cũ | Đo gì | AC mới | Eval mới chứng |
| --- | --- | --- | --- |
| trang-don-vi-mot-bang/E1 | ô chọn đơn vị: lựa chọn, tìm không dấu, chọn ghi URL | AC-5 | E5 |
| trang-don-vi-mot-bang/E2 | một hàng gồm ô chọn và cách xem, ảnh ô chọn mở | AC-4 | E4 |
| trang-don-vi-mot-bang/E3 | ô chọn và cách xem đứng cùng chỗ ở mọi cách xem | AC-4 | E4 |
| trang-don-vi-mot-bang/E4 | lúc đang tải: không cây, ô chọn đứng yên | AC-4 | E4 |
| trang-don-vi-mot-bang/E5 | chọn đơn vị qua ô chọn, bảng khớp kho đo | AC-5 | E5 |
| trang-don-vi-mot-bang/E7 | ô chọn rồi cách xem trong hàng công cụ đơn vị | AC-4 | E4 |
| trang-don-vi-mot-bang/E10 | khối «Đơn vị trực thuộc» dưới chân bảng | AC-5 | E5 |
| trang-don-vi-mot-bang/E11 | ô chọn còn bật lúc lỗi, mục gập «Đã bỏ» | AC-4 | E4 |
| trang-don-vi-mot-bang/E14 | ô chọn ở chỗ ô tìm kiếm, như Thoả thuận | AC-4 | E4 |
| trang-don-vi-mot-bang/E17 | số mục tiêu trên ô con của lưới trực thuộc | AC-5 | E5 |
| khung-cho-don-vi-mot-hinh/E3 | ô chọn thật, bấm được lúc khung chờ khi đổi đơn vị | AC-4 | E4 |
| khung-cho-don-vi-mot-hinh/E9 | ảnh khung chờ, có ảnh đổi đơn vị qua ô chọn | AC-4 | E4 |

Ô khác của hai hồ sơ vẫn chạy. `khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs` bỏ đường đổi đơn vị qua ô chọn và
đọc hàng công cụ ở `[data-hang-cong-cu]` của bảng.

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bộ OKR › Tôi dẫn › Khối Kinh doanh → bảng chỉ mục tiêu của khối, bốn ô số riêng → bấm «Khối Kinh doanh ▾»
  trên dòng vị trí → menu Thuộc · Cùng cấp · Trực thuộc → bấm một phòng → bộ của phòng, cùng thẻ con (điểm ra: bộ
  của phòng).
- Biên: khối chưa có mục tiêu riêng → câu rỗng riêng chỉ sang menu; khối không có phòng con → menu không có nhóm
  Trực thuộc; phòng ban chưa xếp vào khối → Thuộc là OneHub; không mục tiêu nào đã bỏ → không có nút Đã bỏ; bộ cá nhân
  → mắt xích tĩnh.
- Lỗi & quay lại: `org.tree` lỗi → khung lỗi `VungTaiLoi` như hôm nay, dòng vị trí vẫn có mắt xích «Bộ OKR»;
  `countByUnit` chưa về → mục menu không kèm số.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trang một bộ (thẻ OKR) | Đọc mục tiêu của đúng một đơn vị | Danh sách Bộ OKR, Tôi dẫn, menu dòng vị trí / bộ khác qua menu |
| Menu dòng vị trí | Sang bộ của đơn vị cha, cùng cấp, trực thuộc | Mắt xích cuối / trang một bộ khác |
| Danh sách Bộ OKR | Chọn một bộ, đọc số riêng từng bộ | Thanh bên khu / trang một bộ |
| Họp tuần OneHub rỗng | Biết OneHub chưa có KR, đi tới họp của đơn vị | Thẻ Họp tuần / menu dòng vị trí, danh sách bộ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bcd-khoi | Trang một bộ | Bảng chỉ mục tiêu của khối, bốn ô số riêng, «Khối … ▾» trên dòng vị trí | Đọc, mở KR, bấm menu |
| ST-bcd-menu | Menu dòng vị trí | Ba nhóm Thuộc · Cùng cấp · Trực thuộc, mỗi mục tên + «n mục tiêu» | Bấm một đơn vị |
| ST-bcd-da-bo | Trang một bộ | Nút «Đã bỏ (n)» đang bật, bảng chỉ mục tiêu đã bỏ | Bấm lại để về |
| ST-bcd-khoi-rong | Trang một bộ | «Khối Hỗ trợ chưa có mục tiêu riêng trong Quý 4 2026» + câu chỉ sang menu | Mở menu, hoặc tạo mục tiêu |
| ST-bcd-phong | Menu dòng vị trí | Thuộc: khối; Cùng cấp: các phòng cùng khối; không nhóm Trực thuộc | Sang khối hay phòng kế |
| ST-bcd-goc | Menu dòng vị trí | Trực thuộc: các khối và phòng ban chưa xếp | Sang một khối |
| ST-bcd-danh-sach | Danh sách Bộ OKR | Hàng khối có Mục tiêu, Tiến độ, KR tự tin thấp cùng là số riêng | Mở một bộ |
| ST-bcd-hop-tuan-goc | Họp tuần OneHub | «OneHub chưa có KR công bố trong Quý 4 2026.» + câu chỉ sang menu + «Xem mọi bộ OKR» | Mở menu, hoặc danh sách |
| ST-donvi-dangtai | Trang một bộ | Khung xương như hôm nay, giữ dòng vị trí và thẻ con | Chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Menu là `DropdownMenu`: Enter/Space mở, mũi tên đi giữa mục, Esc đóng và trả tiêu điểm về mắt xích; nhãn của nút
  nói «<tên bộ> — đổi sang bộ khác». Dưới `md` vẫn là menu (không ngăn kéo riêng).
- Tên đơn vị trong menu và mắt xích mang `translate="no"`.
- Nút «Đã bỏ (n)» mang `aria-pressed`; trạng thái nằm trên đường dẫn (`daBoOkr=1`), tải lại giữ nguyên.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `BreadcrumbMenu` (`packages/ui/src/components/breadcrumb.tsx`) | tạo | shadcn và ReUI không có mắt xích mở menu; `docs/design.md` đòi menu ở mắt xích cuối |
| `DropdownMenu` + nhóm, nhãn | dùng | menu chuẩn của kho, đủ phím |
| `DataTable actions` + `Button aria-pressed` | ghép | như nút «Đã lưu trữ» của Thoả thuận (`deals-table.tsx`) |
| `Empty` | dùng | câu rỗng của bộ phận |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — danh sách Bộ OKR là danh sách, trang một bộ là chi tiết; đổi sang chi tiết cùng loại qua
dòng vị trí theo luật màn 25/10 (`docs/design.md` «Dòng vị trí»). Không tra mẫu: không có khuôn thứ hai khả dĩ.
<!-- UX-SPEC-TEMPLATE>>> -->

## Bản mẫu

`/proto/bo-okr-chi-don-vi` (dữ liệu mẫu dày: ba khối, chín phòng ban, một phòng chưa xếp, tên dài, phòng không trưởng,
khối không mục tiêu riêng, một mục tiêu đã bỏ). Mỗi trạng thái của bảng trên có một `?state=`; `?state=ST-bcd-mot-bo&
don=<khoá>` mở bộ bất kỳ để bấm menu đi khắp cây.
