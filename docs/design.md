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