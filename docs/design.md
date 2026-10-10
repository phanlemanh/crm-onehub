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

Bảng sống ở `packages/ui/src/components/status-tone.ts` (`toneTheoNghia`), có
bài kiểm giữ nó khớp bảng trên. Một khu chỉ khai trạng thái của mình thuộc nghĩa
nào, không khai `tone`. Năm khu cũ còn tự khai ánh xạ (`okr-status.tsx`,
`kara/steps.tsx`, `attendee-list.tsx`, `okr/tien-do-kr.tsx`,
`tai-lieu/bang-nguon.tsx`); dời chúng về bảng là việc của NM3. Khai thêm một bản
thứ sáu là sai.
