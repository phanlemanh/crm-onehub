# Design — Rules for AI Agents

- /packages/ui is the single source of truth for all UI.
- Always use shared shadcn components from /packages/ui.
- Do not override component styles with className.
- Do not introduce custom border radii, spacing, colours, shadows, or other visual deviations.
- Corners are rounded, from the scale only: `rounded-sm` (4px) for the smallest
  controls, `rounded-md` (5px) for buttons, inputs and segments, `rounded-lg`
  (8px) for surfaces that contain controls — popovers, dialogs, menus, table
  shells. Never a literal radius at the call site.
- `rounded-none` is still correct in one case: an element that must join its
  neighbour edge to edge. The input inside an input group, the middle cells of
  a selected date range, and the drawer handle are the existing examples.
- If a component needs a new variant or style, implement it in /packages/ui so the entire application stays consistent.

## Colour

Flat white, neutral greys, and one brand green (`#006B4F`). The greys are
untinted on purpose: there is no scene to tint them toward, and a tinted grey
without a reason reads as indecision.

**Only two things are filled**: `primary` for the action you want, `destructive`
for the one you cannot undo. Everything else — secondary, outline, ghost — is a
white chip in light and a dark chip in dark. That is what keeps a rep's eye
landing on *go* or *stop* and skimming past the rest.

`--primary` and `--destructive` hold the **same value in both themes**. A brand
colour that changes per theme is not one colour, it is two, and both then need
maintaining. The single exception is `--ring`, which lightens in dark: a fill
carries the brand, but a ring only has to be seen, and `#006B4F` is too close to
the dark background to register.

## Vẽ tay là bậc cuối

Một khối giao diện mới trong `apps/app` đi qua năm bậc theo đúng thứ tự, và dừng
ở bậc đầu tiên có thứ cần:

1. **`packages/ui`**, kể cả `components/reui/`.
2. **shadcn gốc chưa cài** — `item`, `breadcrumb`, `radio-group`, `kbd`… Cài vào
   `packages/ui` theo `docs/reui.md`: `--dry-run` trước, không bao giờ
   `--overwrite`.
3. **Thành phần và ví dụ `c-*` miễn phí của ReUI** — cài vào `packages/ui`, rồi
   sửa đủ bốn chỗ ở `docs/reui.md`.
4. **Block Pro của ReUI** — chỉ là bản vẽ bố cục, không phải code để cài. Mười ba
   trên mười sáu block `settings` dựng trên khung `frame`, còn kho dùng `card`:
   chép cách ghép, dựng lại bằng thành phần của bậc 1–3.
5. **Không bậc nào có** — dựng thành phần mới trong `packages/ui`, không dựng ở
   chỗ gọi.

Mỗi khối mới có một dòng trong mô tả PR: dừng ở bậc nào, và đã tra gì ở các bậc
trên (tên mục, câu tìm ReUI). «Không có» mà không kèm câu tìm là chưa tra.

Một thành phần đang sống trong thư mục tính năng — `settings/members/confirm-dialog.tsx`,
`settings/copy-value.tsx` — mà khu khác cần tới thì chuyển nó vào `packages/ui`
trước, rồi mới dùng lần thứ hai.

### Dấu hiệu vẽ tay

Trong `apps/app`, mỗi mẫu dưới đây đã có thứ thay, và bị trả lại ở review:

| Vẽ tay | Dùng |
| --- | --- |
| `<table>` | `DataTable` khi cần tìm, lọc, phân trang; còn lại `SimpleTable` |
| `<ul className="divide-y …">`, hộp `rounded-lg border` tự dựng | `Item`; hộp nội dung là `Card` với `CardContent` |
| chấm `size-2 rounded-full bg-*` | `StatusIndicator` |
| `<h1>`, `<h2>` tự đặt cỡ chữ | `PageShellTitle`, `CardTitle` |
| `<h3>`, `<h4>` tự đặt cỡ chữ, có khi kèm số đếm hay nút cùng hàng | `SectionHeading` (`level={4}` cho h4, `actions` cho phần cùng hàng) |
| `Button variant="ghost"` tô nền tay cho mục đang chọn của thanh điều hướng | `NavItem active`; thanh chỉ có icon dùng `size="icon"` |
| `<aside>` tự đặt bề rộng cho điều hướng của một khu, kèm hàng ngang riêng cho điện thoại | `AreaSidebar` với `AreaSidebarGroup`, `AreaSidebarItem` |
| `<Empty className="border-solid border">` để có viền liền | `Empty border="solid"` |
| nhãn, mô tả và công tắc xếp bằng `div` | `Field orientation="horizontal"` |
| chữ phụ `<p className="text-muted-foreground text-xs">` cạnh ô nhập | `FieldDescription` |
| `navigator.clipboard` | `CopyValue` |
| `AlertDialog` ráp tay để hỏi lại | `ConfirmDialog` |
| Nút Huỷ trong hộp thoại gọi thẳng hàm đóng | Bọc bằng `DialogClose asChild` (`SheetClose`, `DrawerClose`) để bộ giữ thay đổi thấy được |
| `className` đổi màu, góc, khoảng cách của một component `@crm/ui` | biến thể mới trong `packages/ui` |

Bảng này sẽ thành một luật `anti-slop` trong `tools/oxlint`. Tới lúc đó, nó được
kiểm bằng mắt ở review.

## Nếp màn trong app

Ghi 09/10/2026 từ bảy màn đang chạy — Thoả thuận, Onboarding, Liên hệ, Nhắc buổi
sáng, Toàn cảnh OKR, Tài liệu, Tổng quan — chụp ở 1280 và 375 khi dựng bản mẫu
trang Lộ trình. Mỗi nếp dưới đây đã có ở ít nhất ba màn. Đây là **đích**; màn
nào còn lệch thì theo dõi ở các hàng NM1–NM3 của `docs/plan/lo-trinh-okr.json`,
không sửa lẻ. Trang dưới `/settings` theo `docs/settings.md`, tệp đó đứng trên
mục này ở những gì nó nói riêng.

### Khung trang

- `PageShell` › `PageShellHeader` › `PageShellHeading` (`PageShellTitle` và
  **một** câu `PageShellDescription`, luôn có) › `PageShellActions` bên phải.
- Tiêu đề và câu mô tả dựng trong `page.tsx`, không trong mã khách hay layout:
  lúc chờ tải và lúc lỗi người dùng vẫn biết mình đang ở màn nào.
- Tối đa **một** nút `primary` ở đầu trang, và đó là nút «tạo». Trang chỉ đọc
  không có nút chính. Nút bị khoá thì có một dòng nói vì sao, như luật «Không đủ
  quyền» của `docs/settings.md`.
- Bề rộng: màn danh sách và tổng quan để mặc định của `PageShell`. Trang một cột
  chữ hay form (Nhắc buổi sáng) dùng `width="page"` theo bảng của
  `docs/settings.md`.

### Chờ tải và lỗi tải

- **Chờ tải**: khung xương cùng hình với mục, giữ nguyên tiêu đề trang;
  `PageShellFallback` khi chưa biết hình. Không vòng quay toàn trang
  (`PageShellLoading`), không giấu tiêu đề.
- **Lỗi tải**: `VungTaiLoi` — tiêu đề, một câu nói chuyện gì hỏng, nút thử lại.
  Không dựng khung lỗi riêng ở màn.

### Thanh bên khu và thẻ con

Hai cách đi giữa các trang con, mỗi cách cho một việc:

- **Thanh bên khu** (`AreaSidebar` của `packages/ui`): các nơi đến ngang hàng của
  một **khu** mà người đi qua lại — Cài đặt, Hội thoại, Mục tiêu. Đặt một lần trong
  `layout.tsx` của khu, không đặt trong từng trang. Mục xếp vào nhóm có nhãn danh từ
  (`AreaSidebarGroup label`), nhóm đầu có thể không mang nhãn; ô chọn chung cho cả khu (chu kỳ
  của Mục tiêu) đặt ở `header`, liên kết ra ngoài khu đặt ở `footer`. Từ `md` thanh
  rộng `w-56` bên trái; dưới `md` nó tự thành một hàng cuộn ngang không nhãn nhóm —
  không dựng thêm bản điện thoại. Phần chỉ hợp với thanh dọc (nút xoá trên dòng, câu
  rỗng) bọc bằng `useAreaSidebarOrientation() === "vertical"`. Trong ngăn điện thoại
  của thanh biểu tượng dùng `placement="panel"`.
- **Thẻ con** (mục «Thẻ con của trang» dưới đây): các phần của **một vật** mở trên
  một trang — một bộ OKR (OKR · Họp tuần · Việc · Sơ đồ · Chấm điểm), một bản ghi.
  Cùng tiêu đề trang, không nhóm, ít thẻ.

Câu hỏi để chọn: người đang đổi **nơi** trong khu, hay đổi **phần** của cùng một vật?
Đổi nơi → thanh bên khu; đổi phần → thẻ con.

Một màn có tối đa một thanh bên khu và một hàng thẻ con; thẻ con không lồng thẻ con,
và không dựng hàng thẻ ngang thứ hai để thay một nhóm của thanh bên.

### Thẻ con của trang

Khi một màn có nhiều trang con (mỗi thẻ là một đường dẫn riêng): `Tabs` với
`TabsList variant="line"`, mỗi `TabsTrigger asChild` bọc một `Link` có
`aria-current="page"` ở thẻ đang mở, số đếm là `Badge variant="secondary"`. Thanh
thẻ nằm ngay dưới đầu trang.

### Chip lọc và chuyển kiểu xem

- Lọc một danh sách theo vài giá trị: `ToggleGroup variant="outline" size="sm"`.
  Số đếm trong từng mục là chữ phụ `text-muted-foreground tabular-nums`, không
  `opacity-*`.
- Giá trị lọc ghi lên đường dẫn bằng `nuqs`, như các màn `DataTable`. Không tự
  ghép chuỗi truy vấn rồi `router.push`.
- Chuyển kiểu xem (bảng, Kanban, theo đơn vị…): `ViewSwitch` — nút trên máy
  tính, ô chọn trên điện thoại. Không tự ghép `ToggleGroup`.

### Danh sách

- Cần tìm, lọc hoặc phân trang: `DataTable`.
- Còn lại: `SimpleTable surface="page"` từ `md` trở lên, và cùng dữ liệu ấy
  thành danh sách `Item variant="outline"` dưới `md`, như Tài liệu.

### Ô số tổng quan

Hàng số đầu màn (tổng, đạt, rủi ro…): `StatGroup` bọc các `StatCard`, như Toàn
cảnh OKR.

### Tiêu đề mục

- Mục nằm trong `Card`: `CardTitle` và `CardDescription` trong `CardHeader`.
- Mục không nằm trong thẻ: `SectionHeading`. Không `<h2>`–`<h4>` tự đặt cỡ chữ
  (xem bảng «Dấu hiệu vẽ tay» ở trên).

### Màu trạng thái

Mọi chấm và nhãn trạng thái dùng `tone` của `StatusIndicator`, theo nghĩa chứ
không theo khu:

| Nghĩa | `tone` |
| --- | --- |
| xong, đạt, đã giao | `success` |
| chờ, rủi ro, sắp trễ | `warning` |
| hỏng, trễ, bị chặn | `error` |
| nháp, chưa bắt đầu | `neutral` |
| đang chạy | `info` |
| đã kết thúc, đã bỏ, đã đóng | `neutral` |

Bảng sống ở `packages/ui/src/lib/status-tone.ts` (`toneTheoNghia`), có
bài kiểm giữ nó khớp bảng trên. Một khu chỉ khai trạng thái của mình thuộc nghĩa
nào (`NGHIA_<…>: Record<TrangThai, NghiaTrangThai>`), không khai `tone`. Việc máy
đang xếp hàng hay đang làm mang «đang chạy». Bài quét
`packages/ui/test/mau-trang-thai-mot-bang.spec.ts` đỏ khi một tệp tự khai bảng hay
hàm ánh xạ trạng thái sang màu; màu chọn tại chỗ theo một điều kiện trong JSX và
nhãn `Badge` chưa thuộc luật này.

## Trường: một trường, một cách cư xử

Chủ kho chốt 20/10/2026. Người dùng không phân biệt được **trường chuẩn** với
**trường tự tạo** ở bất kỳ màn nào. Câu thử: xoá chữ «tự tạo» khỏi Cài đặt › Trường
rồi nhìn phiếu, form tạo, bảng, bộ lọc, thẻ Kanban — còn đoán ra trường nào thuộc
loại nào thì màn đó lệch.

Đây là **đích**. Chỗ còn lệch theo dõi ở các hàng DA14–DA17 của
`docs/plan/lo-trinh-viec-du-an.json`, không sửa lẻ.

### Một bảng đăng ký theo kiểu

Mỗi kiểu trường khai **một lần** sáu mặt: hiển thị, sửa tại chỗ, ô trong form tạo,
ô trong bảng, bộ lọc, sort. Trường chuẩn khai kiểu của nó — Ngày chốt là Ngày,
Người phụ trách là Người, Giá trị là Tiền — và đi qua cùng bảng. Màn không tự viết
ô cho một trường. Thêm một kiểu là thêm một dòng ở bảng, không sửa từng màn.

| Kiểu | Hiển thị | Sửa và form tạo | Lọc | Sort |
| --- | --- | --- | --- | --- |
| Chữ, Chữ dài | chữ, cắt dòng trong bảng | `InlineField`, ô nhiều dòng cho Chữ dài | chứa, trống | A→Z |
| Số | `Intl` theo locale, `tabular-nums` | ô số nhận «1.234,5» | khoảng, trống | theo số |
| Tiền | `formatMoney` | `MoneyInput` | khoảng | theo tiền gốc |
| Ngày | `LocalDay` | `DatePicker` | mốc như Ngày chốt (`closing-window.ts`), trống | theo ngày, trống cuối |
| Chọn | nhãn lựa chọn | `InlineSelectField` | nhiều giá trị, «Không chọn» | theo thứ tự lựa chọn |
| Người | `OwnerCell` | chọn người | nhiều người, «Chưa giao» | theo tên |
| Ô tích | Có / Không | `Checkbox` có nhãn | Có / Không | — |
| Liên kết, Email, Điện thoại | bấm được; số điện thoại qua `SoDienThoai` | ô đúng kiểu nhập | chứa, trống | A→Z |
| Tệp | tên tệp và số tệp | kéo thả `NguonKeoTha` | có, chưa có | — |

### Luật

- **Nơi hiện.** Phiếu: mục DETAILS theo thứ tự ở Cài đặt › Trường, không tách
  khối «trường tự tạo». Form tạo và ô thêm nhanh: trường bắt buộc và trường đang hiện
  trên phiếu. Bảng: trường bật «Hiện trong bảng». Thẻ Kanban: như nay, cộng tối đa hai
  trường tự tạo đầu tiên đã bật «Hiện trong bảng».
- **Ẩn theo khổ.** Cột ẩn dưới khổ nào theo kiểu của nó, cùng luật với trường chuẩn.
  Không có ngưỡng riêng cho trường tự tạo.
- **Bộ lọc trên đường dẫn.** Một cách mã hoá `nuqs` cho mọi trường; không tham số
  JSON riêng cho trường tự tạo.
- **Kara điền.** Giá trị Kara đưa vào mang dấu theo `docs/ai-ux.md`, bất kể trường
  chuẩn hay tự tạo.
- **Lỗi khi lưu** nói tiếng người dùng và theo kiểu: «Ô này nhận số, ví dụ 1.234,5»,
  không phải câu máy chủ.
- **Cài đặt › Trường.** Trường chuẩn sắp lại và ẩn được; không xoá, không đổi kiểu.
  Danh sách trường chuẩn dịch theo locale và khớp đúng các trường trên phiếu.
- **Tệp.** Ai cũng thấy tên tệp và số tệp; chỉ chủ bản ghi và quản trị mở hay tải
  được. Bản ghi không có chủ thì chỉ quản trị.
- **Gọi tên** theo `CONTEXT.md`: «trường»; khi cần phân biệt, «trường chuẩn» và
  «trường tự tạo». Không «tuỳ chỉnh», không «động».
