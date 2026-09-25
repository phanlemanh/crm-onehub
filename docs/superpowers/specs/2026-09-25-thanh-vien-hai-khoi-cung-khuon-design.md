# Thành viên: hai khối cùng một khuôn section — thiết kế

Ngày 2026-09-25 · slug `thanh-vien-hai-khoi-cung-khuon` · T2 · phương án A, chủ kho duyệt 25/09/2026.

## Vấn đề

Trang `/<slug>/settings/members` có hai khối xếp dưới nhau, dựng theo hai cách:

- Khối trên (`members-table.tsx`) là `DataTable` `layout="content"`: vỏ viền bo, tiêu đề cột nền
  xám, chữ `text-xs`, cột đầu thụt 16px, «Phát liên kết» hiện sẵn cộng menu «…». Không có tiêu
  đề section.
- Khối dưới (`allowances-table.tsx`) vẽ tay: `<h2>` + `<p>`, `<table className="w-full text-sm">`
  không viền, tiêu đề cột trơn, chữ to hơn khối trên, cột đầu sát mép, hai nút hiện sẵn («Phát
  liên kết», nút chữ «Rút»). Rỗng là một `<p>`; lúc chưa có dữ liệu nó in luôn câu rỗng rồi mới
  bật ra bảng. Ở 375px bảng sáu cột tràn ngang bên trong `main`, cột «Rút» khuất.
- Nút «Cho phép một địa chỉ» nằm ở đầu khối dưới, nên với 10 thành viên nó ở khoảng y=975px —
  dưới mép màn 1440×900.

Ảnh đo thật: `_acceptance/bang-thanh-vien-giu-hang/evidence/thanh-vien-*-noi.png`.

## Hướng đã chọn (phương án A)

Cả hai khối theo khuôn section của kho, như `settings/tracking/allowed-domains.tsx`:
`Card` → `CardHeader` (`CardTitle` có số đếm, `CardDescription`) → đúng một bảng.

1. **Nút lên đầu trang.** «Cho phép một địa chỉ» vào `PageShellActions`. `page.tsx` dựng đầu
   trang bên trong vùng đã hydrate — cùng khuôn với `settings/organization/page.tsx` (fallback
   là đầu trang không nút + `PageShellLoading`). Nút là component client mới `cho-phep-dia-chi.tsx`
   giữ `AllowDialog` và mutation `allowEmail`; xong thì làm mới truy vấn `workspace.allowances`.
2. **Khối trên** giữ nguyên `DataTable` (có tìm, lọc, phân trang), bọc trong `Card` + `CardHeader`
   với tiêu đề «Đã vào · N».
3. **Khối dưới** thành `CardTable` (có `min-w-[48rem]`, cuộn ngang trong vỏ), tiêu đề «Được phép
   vào · M». Rỗng: `CardTableEmpty`. Đang tải: `Card` + `CardHeader` + `CardTable` với ba hàng
   `Skeleton` — không `return null`, không in câu rỗng khi chưa có dữ liệu.
4. **Hành động mỗi hàng** khớp khối trên: «Phát liên kết» hiện sẵn; «Rút» vào menu «…»
   (`DropdownMenuItem variant="destructive"`), vẫn hỏi lại bằng `ConfirmDialog`. Nút «…» có
   `aria-label` «Hành động với <địa chỉ>».
5. **Cột** theo nếp khối trên: vai trò và người cho phép chữ mờ, cột thời gian căn phải, chữ
   `text-xs` của `Table`.
6. **Không `DataTable` thứ hai.** Hai bảng sẽ dùng chung khoá URL `q/sort/dir/page`, và
   `apps/app/lib/search-param-keys.ts` ném lỗi.

### Bốn chỗ còn mở, đã chốt ở S1

- **N của «Đã vào» là tổng chưa lọc.** `total` của `workspace.members` đổi theo ô tìm và bộ lọc
  vai; đọc «Đã vào · 2» khi đang tìm là sai. Đếm bằng một truy vấn `workspace.members` với đầu
  vào mặc định (`membersSearchParams` không `q`, không lọc, trang 1). Khi chưa lọc, nó trùng khoá
  với truy vấn của bảng nên không thêm lượt gọi. Không thêm trường vào API: `apps/api/src/workspace`
  là đường T3.
- **Prefetch «Được phép vào» ở server** cho quản trị (`workspace.get` → nếu `canManageMembers` thì
  prefetch `workspace.allowances`). Khối có dữ liệu ngay ở lượt vẽ đầu, không nhảy bố cục. Khung
  xương vẫn có cho lúc truy vấn chờ.
- **Mỗi `Card` bọc trong `<section aria-labelledby>`** trỏ `CardTitle`. Trang đọc thành hai vùng có
  tên cho trình đọc màn hình. Bàn đo đã ký của `bang-thanh-vien-giu-hang` tìm khối dưới bằng thẻ
  `section` chứa `t.duocPhepVao.tieuDe`, nên chuỗi đó giữ nguyên «Được phép vào» và số đếm ghép
  bằng hàm `dem`.
- **Người không phải quản trị** giữ hành vi cũ: không thấy nút ở đầu trang, không thấy khối dưới.
  Luật «không ẩn, khoá và nói vì sao» của `docs/settings.md` là đợt 4 — API `allowances` trả 403
  cho họ, nên hiện khối cho họ cần một quyết định sản phẩm riêng.

### Từ điển

«Đã vào» và «Được phép vào» chưa có mục trong `CONTEXT.md`. Thêm hai mục trước khi dùng. «Lời mời»
bị tránh: không có thư mời nào được gửi.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->

### 1. Luồng

- Suôn sẻ: Cài đặt › Thành viên → bấm «Cho phép một địa chỉ» ở đầu trang → điền địa chỉ, chọn vai
  → «Cho phép» → toast «Đã cho phép địa chỉ này.», hàng mới ở «Được phép vào», số đếm tăng một
  (điểm ra: ở lại trang).
- Rút: hàng ở «Được phép vào» → «…» → «Rút» → hộp hỏi lại «Rút lời cho phép này?» → «Rút» → toast,
  hàng biến mất, số đếm giảm một.
- Biên: không có địa chỉ nào đang chờ → `CardTableEmpty`; người không phải quản trị → không nút,
  không khối dưới; ô tìm ở khối trên không đổi N.
- Lỗi & quay lại: cho phép lỗi → lỗi hiện trong hộp thoại, hộp vẫn mở; rút lỗi → toast lỗi, hàng giữ
  nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Thành viên | Xem ai đã vào và ai được phép vào, đổi quyền vào | thanh bên Cài đặt / hộp «Cho phép một địa chỉ», hộp hỏi lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-thanhvien-loading | Thành viên | Khối «Được phép vào»: `Card` có tiêu đề (chưa số) + `CardTable` ba hàng khung xương | chờ |
| ST-thanhvien-empty | Thành viên | «Được phép vào · 0» + `CardTableEmpty` «Chỉ những người ở bảng trên vào được. Cho phép một địa chỉ để thêm người.» | bấm nút ở đầu trang |
| ST-thanhvien-loaded | Thành viên | «Đã vào · N» + `DataTable`; «Được phép vào · M» + `CardTable` | phát liên kết, rút, đổi vai |
| ST-thanhvien-khongquyen | Thành viên | chỉ «Đã vào · N», không nút ở đầu trang | — |
| ST-thanhvien-hep | Thành viên (375px) | bảng dưới cuộn ngang trong vỏ, trang không tràn | vuốt ngang trong vỏ bảng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «…» là nút biểu tượng có `aria-label`; «Rút» là mục destructive, luôn qua `ConfirmDialog`.
- N không đổi theo ô tìm hay bộ lọc vai. Số đếm là chữ trong `CardTitle` (không `tabular-nums`: `CardTitle` không nhận `className` ở chỗ gọi, AC-16).
- Ở 375px: `CardTable` giữ `min-w-[48rem]`, cuộn ngang bên trong vỏ; `main` và `document` không tràn.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardDescription` | dùng | khuôn section của kho |
| `DataTable` | dùng | khối trên cần tìm, lọc, phân trang |
| `CardTable`, `CardTableEmpty` | dùng + mở rộng | bảng nhỏ trong thẻ; `CardTableEmpty` thêm `data-slot="card-table-empty"` như mọi component khác |
| `DropdownMenu` + `DropdownMenuItem variant="destructive"` | dùng | khớp menu «…» của khối trên |
| `Skeleton` trong `CardTable` | ghép | khung xương cùng hình với section |
| `ConfirmDialog` (thư mục members) | dùng | cùng khu, chưa cần chuyển vào `packages/ui` |

Vẽ tay là bậc cuối: vòng này dừng ở **bậc 1** (`packages/ui`). Đã tra: `card.tsx`, `card-table.tsx`,
`simple-table.tsx`, `data-table.tsx`, `dropdown-menu.tsx`, `skeleton.tsx` — đủ cả.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — hai danh sách cùng loại (người đã vào / địa chỉ được phép) xếp dọc trong
một trang cuộn, hành động tạo ở đầu trang. Khớp GitHub Organization › People (tab «Pending
invitations» tách khỏi thành viên, nút mời ở đầu trang) và Linear Settings › Members (nút «Invite» ở
đầu trang). Không tra thêm vì không có khuôn thứ hai khả dĩ.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Người không phải quản trị thấy khối «Được phép vào» ở dạng khoá — đợt 4 của `docs/settings.md`.
- Trạng thái mở của hộp «Cho phép một địa chỉ» ghi trên URL — luật «Tạo mới» của `docs/settings.md`.
- Chuyển `ConfirmDialog` vào `packages/ui` — đợt 2.
- Trạng thái lỗi khi tải «Được phép vào» (`Empty` có nút thử lại) — đợt 4.
