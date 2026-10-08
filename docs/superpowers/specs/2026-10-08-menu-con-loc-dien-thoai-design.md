# Menu con của bộ lọc mở được trên điện thoại — thiết kế (E7b `menu-con-loc-dien-thoai`)

Ngày: 2026-10-08 · Hạng: T2 · Đợt: sau-14-10, dãy P3 · Hồ sơ: `_acceptance/menu-con-loc-dien-thoai/`

## Vấn đề

Tách từ E7 (OOS-6 của `datatable-loc-ro`). Đo màn thật 07/10 ở khổ 375: menu con «Giai đoạn» của bộ lọc thoả
thuận đặt ở x=359, rộng 208, trong khung 375 — ngoài màn, không chạm được lựa chọn nào. Nguyên nhân: Radix
(`@radix-ui/react-popper` 1.3.7) chỉ né va chạm theo trục dọc cho menu con (`shift` với `crossAxis: false`); khi cả
phía phải lẫn phía trái của menu cha đều thiếu chỗ, `flip` giữ phía phải và menu con tràn ra ngoài. Ở khổ điện
thoại, nút «Lọc» rộng cả hàng nên menu cha cũng rộng cả hàng — mọi menu con đều rơi vào ca này.

## Cách làm (anh duyệt 08/10)

Sửa một chỗ trong `packages/ui/src/components/dropdown-menu.tsx`, `DropdownMenuSubContent`:

- Mặc định `collisionPadding={8}` để menu con cách mép màn 8 px và để biến chỗ trống
  Radix tính đã trừ phần lề đó.
- Lớp CSS dịch ngang bằng thuộc tính `translate` (không đụng `transform` mà hoạt ảnh `animate-in` của
  `tw-animate-css` dùng):
  - `data-[side=right]`: dịch `min(0px, var(--radix-popper-available-width) − 100%)` — tức sang trái đúng phần tràn
    về phía phải; đủ chỗ thì 0.
  - `data-[side=left]`: dịch `max(0px, 100% − var(--radix-popper-available-width))` — ca đối xứng.
- `--radix-popper-available-width` do Radix đặt trên mọi nội dung có popper (`react-popper` dòng 153), `100%` trong
  `translate` là bề rộng của chính menu con.

Hệ quả: trên màn rộng không đổi gì (dịch 0). Trên điện thoại menu con đè lên một phần menu cha, mép phải cách màn
8 px, mọi lựa chọn chạm được. Menu con của bộ lọc bảng, bộ lọc Kanban và thao tác hàng loạt (`bulk-actions.tsx`,
`*-bulk-actions.tsx`, thuộc ranh giới P2) đúng cùng lúc mà không phải sửa tệp của chúng.

## Loại

- **Dạng «đi sâu rồi quay lại» trên điện thoại** (menu con thay chỗ menu cha, có nút quay về): nhiều mã, phải đổi
  `FacetSubmenu` và từng nơi gọi, thao tác hàng loạt không được lợi.
- **Breakpoint `max-sm:` dịch cố định theo bề rộng menu cha**: sai ở khổ máy tính bảng và khi menu cha hẹp.
- **Tự viết lại định vị (floating-ui riêng)**: vượt ranh giới «một chỗ trong packages/ui», giữ bản sao Radix lâu dài.
- **`max-w` theo chỗ trống**: menu con co còn vài px, không dùng được.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách (điện thoại) → «Lọc» → chạm một tiêu chí → menu con hiện trọn trong màn, đè một phần menu cha → chạm lựa chọn → bảng lọc (điểm ra: bảng đã lọc)
- Biên: menu cha hẹp và còn đủ chỗ bên phải (máy tính) → menu con mở bên phải như cũ; menu con có ô tìm (Công ty) → ô tìm cũng nằm trọn trong màn
- Lỗi & quay lại: chạm ra ngoài hoặc phím Esc đóng menu con như cũ; mũi tên trái trên bàn phím quay về menu cha

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thoả thuận, cá nhân, công ty, thành viên (bảng) | lọc danh sách bằng menu con của từng tiêu chí | nút «Lọc» / bảng đã lọc |
| Thoả thuận (Kanban) | lọc thẻ bằng menu con | nút «Lọc» / Kanban đã lọc |
| Thao tác hàng loạt (từ khổ sm) | đổi người phụ trách, giai đoạn cho nhiều dòng | thanh chọn dòng / bảng đã đổi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-menucon-du-cho | mọi menu con, màn rộng | menu con mở bên phải menu cha, không dịch | chọn lựa chọn |
| ST-menucon-thieu-cho-phai | menu con, điện thoại 375 | menu con dịch trái vừa đủ, mép phải cách màn 8 px, đè một phần menu cha | chọn lựa chọn |
| ST-menucon-lat-trai | menu con bị lật sang trái mà vẫn thiếu chỗ | menu con dịch phải vừa đủ, mép trái cách màn 8 px | chọn lựa chọn |
| ST-menucon-co-o-tim | menu con Công ty (có ô tìm), 375 | ô tìm và danh sách nằm trọn trong màn | gõ tìm, chọn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không đổi bàn phím, focus, đóng mở; chỉ đổi vị trí ngang khi thiếu chỗ.
- Hoạt ảnh mở (`slide-in`, `zoom-in`) giữ nguyên vì dịch dùng thuộc tính `translate`, hoạt ảnh dùng `transform`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DropdownMenuSubContent` | mở rộng (lớp mặc định + `collisionPadding` mặc định) | `docs/design.md`: sửa ở `packages/ui`, không ở chỗ gọi — mọi menu con đúng cùng lúc |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi khuôn — chỉ sửa vị trí menu con trong khuôn sẵn có; cách «menu con đè lên menu cha khi thiếu chỗ» là cách menu ngữ cảnh trên điện thoại vẫn làm (anh chọn 08/10).
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- `packages/ui/test/menu-con-dich-vao.dom.tsx` (mới, trong ranh giới): menu con mang lớp dịch cho cả hai phía,
  `className` của nơi gọi vẫn ghép vào. Lề 8 px không đọc được trong jsdom — đo ở màn thật (mép phải ≤ 367).
- Màn thật `_acceptance/menu-con-loc-dien-thoai/rang/do-man.mjs` qua `mot-luot.sh`: 375 bằng sự kiện chạm (Giai đoạn,
  Công ty có ô tìm, chạm chọn được), 1440 (đối chứng không dịch), 768 (menu con thao tác hàng loạt).
- Hồi quy: bài DOM của `DataTable` (`data-table-loc-ro`, `data-table-locale`, `render-diff`, `lai-ra-man`) và
  `bang-crm-loc-ro` phía app.
