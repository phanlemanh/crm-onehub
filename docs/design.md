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
| `ToggleGroup spacing={0}` hay hàng nút tự ghép làm thanh lọc | chip của mục «Hàng công cụ» |
| hàng chip trong `CardContent` | hàng công cụ trên bề mặt |
| mục gập «Đang theo dõi (n)», «Đã bỏ (n)» dưới bảng | chip hay nút bật tắt trên hàng công cụ |
| ô chọn đơn vị trên hàng công cụ, lưới thẻ «đơn vị trực thuộc» dưới bảng | menu ở mắt xích cuối của dòng vị trí |
| `Dialog` mở từ trong ngăn để ghi một dòng vào bản ghi (cập nhật KR, ghi chú, bình luận) | khối soạn trong ngăn, mục «Ghi vào bản ghi: ngay trong ngăn» |
| `Dialog` hay `Sheet` mở chồng lên ngăn để sửa một trường | sửa tại chỗ (`InlineField`, `InlineSelectField`) |

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
- Ngoại lệ **màn toàn vùng**: màn mà một mặt vẽ chiếm trọn vùng nội dung (Sơ đồ
  của khu Mục tiêu) thay `PageShellHeader` bằng một dải công cụ một dòng có đường
  mảnh làm tiêu đề, không `PageShellDescription`, khung `PageShell width="full"
  contained`. Dải công cụ dựng cả lúc chờ tải và lúc lỗi. Không dùng cho màn khác.

### Chờ tải và lỗi tải

- **Chờ tải**: khung xương cùng hình với mục, giữ nguyên tiêu đề trang;
  `PageShellFallback` khi chưa biết hình. Không vòng quay toàn trang
  (`PageShellLoading`), không giấu tiêu đề.
- **Lỗi tải**: `VungTaiLoi` — tiêu đề, một câu nói chuyện gì hỏng, nút thử lại.
  Không dựng khung lỗi riêng ở màn.

### Chờ tải và lỗi tải trong ngăn bản ghi

Chủ kho chốt 30/10/2026 (hàng BK1). Luật trang ở trên kéo xuống tầng ngăn: mọi ngăn bản ghi dựng bằng
`RecordSheetFrame`, theo khuôn `design/patterns/ngan-ban-ghi.md`.

- **Chờ tải trong ngăn**: `KhungXuongNgan`, tức hình `ngan` của `KhungXuong`. Đầu ngăn vẫn hiện tiêu đề tạm. Không vòng
  quay.
- **Lỗi tải trong ngăn**: `KhungTaiLoi` là thành phần duy nhất. Nó nói đúng lý do: bản ghi không còn, không đủ quyền, hay
  mất kết nối. Với mất kết nối, mặt thử lại là chính `VungTaiLoi`.
- **Phân tầng**: `VungTaiLoi` dùng thẳng ở tầng trang; trong ngăn, nó chỉ xuất hiện qua `KhungTaiLoi`.

### Thanh bên khu và thẻ con

Ba cách đi giữa các trang, mỗi cách cho một việc:

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

- **Dòng vị trí** (`Breadcrumb`): đổi sang **một vật khác cùng loại** — bộ OKR của
  đơn vị cha, ngang hàng hay trực thuộc; bản ghi kế. Mắt xích cuối mở một menu liệt
  các vật cùng loại gần nó. Đây là đường duy nhất: không đặt thêm ô chọn vật trên
  hàng công cụ, không đặt lưới thẻ «đơn vị trực thuộc» dưới nội dung.

Câu hỏi để chọn: người đang đổi **nơi** trong khu, đổi **phần** của cùng một vật, hay
đổi sang **vật khác cùng loại**? Đổi nơi → thanh bên khu; đổi phần → thẻ con; đổi vật
→ dòng vị trí.

Một màn có tối đa một thanh bên khu, một dòng vị trí và một hàng thẻ con; thẻ con
không lồng thẻ con, và không dựng hàng thẻ ngang thứ hai để thay một nhóm của thanh
bên.

### Thẻ con của trang

Khi một màn có nhiều trang con (mỗi thẻ là một đường dẫn riêng): `Tabs` với
`TabsList variant="line"`, mỗi `TabsTrigger asChild` bọc một `Link` có
`aria-current="page"` ở thẻ đang mở, số đếm là `Badge variant="secondary"`. Thanh
thẻ nằm ngay dưới đầu trang.

### Thứ tự một màn

Chủ kho yêu cầu 25/10, sau khi bốn màn của khu Mục tiêu đặt lọc ở bốn chỗ khác nhau.
Mọi màn xếp từ trên xuống theo đúng thứ tự này, mỗi tầng có đúng một chỗ, tầng
không cần thì bỏ:

1. **Đầu trang** — mục «Khung trang» ở trên.
2. **Dòng vị trí** — chỉ ở trang của một vật; đổi sang vật cùng loại ở đây.
3. **Thẻ con** — các phần của vật.
4. **Hàng công cụ** — một hàng duy nhất, ngay trên bề mặt nội dung, nằm ngoài
   `Card`. Bên trái là chip: phạm vi trước (Tất cả · Tôi dẫn · Đang theo dõi), rồi
   trạng thái hay tín hiệu. Bên phải, theo thứ tự: Lọc · Sắp xếp · Cột · kiểu xem
   (`ViewSwitch`) · Đã bỏ / Đã lưu trữ.
5. **Nội dung** — một bề mặt (bảng, danh sách, sơ đồ).
6. **Chân** — số đếm và phân trang của chính bề mặt ấy. Không gì khác dưới chân.

### Hàng công cụ

- **Mọi lọc ở hàng công cụ.** Không đặt hàng chip trong `Card` hay `CardContent`,
  giữa hai bảng hay dưới bảng.
- **Một tập con của cùng danh sách là một giá trị lọc**, không phải một nhóm gập dưới
  bảng: đang theo dõi, đáng bàn, đã bỏ, đã lưu trữ. Đã bỏ và Đã lưu trữ là nút bật tắt
  ở cuối hàng (`docs/vong-doi.md`), không lẫn vào danh sách chính.
- **Một kiểu chip**: `ToggleGroup variant="outline" size="sm"`, khoảng cách mặc
  định, số đếm qua prop `count`. Không `spacing={0}` để dính thành một thanh, không
  `StatGroup` hay nút tự ghép làm lọc. Chọn một hay nhiều giá trị đều cùng hình.
- **Số đếm trên chip bằng số hàng khi chọn chip đó.** Ô số tổng quan (`StatGroup`)
  là để đọc, không bấm để lọc.
- Giá trị lọc ghi lên đường dẫn bằng `nuqs`, như các màn `DataTable`. Không tự
  ghép chuỗi truy vấn rồi `router.push`.
- Chuyển kiểu xem (bảng, Kanban, theo đơn vị…): `ViewSwitch` — nút trên máy
  tính, ô chọn trên điện thoại. Không tự ghép `ToggleGroup`.
- Dưới `md` hàng công cụ cuộn ngang trong chính nó; trang không cuộn ngang.

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

### Bấm vào KR và cập nhật

Chủ kho chốt 24/10/2026, theo lối Tability: cập nhật đi qua bộ OKR, không có trang
cập nhật riêng. Bối cảnh ở `docs/findings/2026-10-22-hop-tuan/README.md` (mục 1 và 8).
Chỗ còn lệch theo dõi ở các hàng SV1, SV6, SV7 của `docs/plan/lo-trinh-okr.json`.

- **Bấm một mục tiêu ở bất kỳ đâu thì mở chi tiết mục tiêu.**
- **Bấm một KR ở bất kỳ đâu thì mở chi tiết KR** (`openRecord({ kind: "kr" })`). Luật này áp cả trong chi tiết mục
  tiêu, ở Sơ đồ, Của tôi và Việc. Không mở mục tiêu chứa KR thay cho chính KR.
- **Chỉ có một form cập nhật: khối cập nhật trong chi tiết KR** (chủ kho chốt 30/10, thay «hộp cập nhật một KR»
  của 24/10). Khối nằm giữa ô số và Lịch sử, theo mục «Ghi vào bản ghi: ngay trong ngăn». Nút tắt «Cập nhật» trên
  dòng KR được giữ, nhưng mở chi tiết KR và cuộn tới khối đó. Không đặt ô nhập trên dòng, và không gửi nhiều KR một
  lần.
- **Họp tuần là thẻ con của bộ OKR**, không phải mục trên thanh bên khu.

### Ghi vào bản ghi: ngay trong ngăn

Chủ kho chốt 30/10/2026 sau khi soát các ngăn bản ghi (Deal, Liên hệ, Công ty, Kế hoạch, Mục tiêu, KR). Mọi ngăn đã
ghi tại chỗ, chỉ cập nhật KR mở hộp thoại che ngăn. Luật dưới là nếp chung để màn mới không tự vẽ lại.

| Việc trong một ngăn | Dùng | Mẫu đang chạy |
| --- | --- | --- |
| Ghi thêm một dòng vào bản ghi — cập nhật KR, ghi chú, cuộc gọi, bình luận, ghi nhận, trả lời | khối soạn trong ngăn, đặt ngay trên dòng thời gian hay Lịch sử mà nó thêm vào | `ActivityComposer` của Deal, ô soạn Trao đổi của mục tiêu |
| Sửa một trường | sửa tại chỗ, lưu khi rời ô hay Enter, Esc để huỷ | `InlineField`, `InlineSelectField` |
| Thêm một mục con (bước, việc, KR) | dòng nhập tại chỗ cuối danh sách | `DongNhap` của việc KR, bước kế hoạch |
| Hỏi lại trước việc không hoàn tác được | `ConfirmDialog` | xoá, rút duyệt |
| Chọn từ một danh sách dài, hay một lý do bắt buộc | `Dialog` nhỏ, tối đa ba ô, không phần xem trước | `CloseReasonDialog`, `PickListDialog` |
| Tạo một bản ghi mới nhiều trường | `Sheet` riêng | tạo deal, tạo mục tiêu |

Khối soạn trong ngăn:

- **Một chỗ ghi cho một việc.** Lối vào khác (nút trên dòng, tin nhắc, Của tôi) mở ngăn của bản ghi và cuộn tới khối
  soạn, không mở form thứ hai. Mỗi lối ghi `entry` riêng để đo được.
- **Không lặp thứ ngăn đã có.** Biểu đồ, lần trước, giá trị hiện tại đọc từ phần của ngăn; khối soạn chỉ thêm xem
  trước (một chấm nét đứt, một dòng mức đổi).
- **Gửi xong ngăn vẫn mở**: dòng mới lên đầu dòng thời gian, số trên ngăn đổi theo, ‹ › đi bản ghi kế không đóng gì.
- **Thu và mở.** Khối thu thành một dòng khi chưa đến lượt ghi; mở sẵn khi bản ghi đang chờ (KR đến hạn chưa cập
  nhật). Khổ dưới `md` vẫn nằm trong ngăn, không đẩy thành ngăn kéo.
- **Nút gửi là nút chính duy nhất của khối**; ngăn không mang thêm nút chính ở đầu cho cùng việc. Gửi bằng
  Ctrl/⌘+Enter như ô soạn Deal. Bản nháp chưa gửi đi qua bộ giữ thay đổi (`useKhaiThayDoi`) khi đóng ngăn hay ‹ ›.
- **Một thành phần.** Ô soạn dùng ở hai khu trở lên thì nằm trong `packages/ui`, theo «Vẽ tay là bậc cuối».

Hộp thoại không mở chồng lên ngăn để ghi hay sửa. `Sheet` chồng lên ngăn chỉ dành cho tạo bản ghi mới; chỗ đang sửa
mục tiêu và KR bằng `Sheet` chồng lên ngăn là nợ, theo dõi ở lộ trình OKR.

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

Đây là **đích**. Chỗ còn lệch theo dõi ở các hàng DA14–DA20 của
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
