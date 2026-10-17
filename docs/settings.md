# Cài đặt — khung trang, thanh bên, cách lưu

Chốt 2026-09-25, sau một lượt audit mười một mục của `/settings`: lúc đó mỗi mục
dựng theo một kiểu riêng — ba khung trang, bốn bề rộng, năm cách vẽ danh sách,
bốn cách xử lý khi không đủ quyền. Tệp này là **đích**; code chưa theo hết, xem
mục «Đợt» ở cuối. `docs/design.md` đứng trên tệp này, kể cả mục «Vẽ tay là bậc
cuối».

## Khung trang

- Mọi trang dưới `/settings` dùng `PageShell`. Không `<main>` tự viết, không
  `ConnectionPage`.
- Bề rộng chọn bằng tham số `width` của `PageShell`, không bọc thêm `max-w-*`:

  | `width` | Bề rộng | Dùng cho |
  | --- | --- | --- |
  | `narrow` | `--container-narrow` (560px) | trang giới thiệu, Intake, màn trước khi kết nối |
  | `page` | `--container-page` (820px) | Chung, Theo dõi, Tiền tệ, Giai đoạn thoả thuận, Lịch làm việc, Kết nối (danh sách), chi tiết một kết nối, Nhắc buổi sáng, Chương trình OKR |
  | `wide` | `--container-page-wide` (1120px) | Thành viên, Khoá API, SSO, Trường, Điều phối 30 ngày |
  | `full` | cả vùng nội dung | Tổ chức (danh sách – chi tiết) |

- Cột nội dung **căn trái**, sát thanh bên, ở mọi bề rộng: mép trái đứng yên khi
  chuyển mục. Căn giữa làm mép trái nhảy theo bề rộng của từng trang.
- Lề là lề của `PageShell`. Token `--spacing-page-*` không dùng ở Cài đặt.
- Đầu trang rộng bằng cột nội dung; `PageShellActions` nằm sát mép phải của cột,
  không phải mép màn hình.
- Trang con — Kết nối › Slack, Kết nối › Slack › Người — có `breadcrumb` trỏ về
  trang cha, đặt trên tiêu đề.

## Thanh bên

- Mỗi mục là một `NavItem`. Không đè class lên `Button`.
- Nhãn của cả thanh là «Cài đặt».
- Bốn nhóm, nhãn nhóm chỉ hiện trên desktop; trên điện thoại vẫn là một hàng
  cuộn ngang:

  | Nhóm | Mục |
  | --- | --- |
  | Không gian làm việc | Chung · Tiền tệ · Trường · Giai đoạn thoả thuận · Lịch làm việc |
  | Con người | Thành viên · Tổ chức · Chương trình OKR · Điều phối 30 ngày |
  | Kết nối và dữ liệu | Kết nối · Theo dõi & phân tích |
  | Bảo mật | SSO · Khoá API |

- Thanh bên chỉ chứa cài đặt **của không gian làm việc**. Cài đặt của riêng một
  người sống ở menu người dùng: trang «Thông báo của bạn» dời ra đó, đổi tên
  «Nhắc buổi sáng» theo `CONTEXT.md` (từ điển tránh chữ «thông báo»), và rời
  khỏi đường dẫn `/settings`; đường cũ chuyển hướng sang đường mới.

## Section

- Một section là một `Card` với đúng một hộp: `CardContent`, **hoặc** một bảng
  (`SimpleTable`, `CardTable`, `DataTable`). Không bao giờ cả hai trong một thẻ.
- Tiêu đề section là `CardTitle`. Section phẳng — trang mô tả một thứ, xem
  «Cards versus flat» ở `docs/connections.md` — vẫn dùng `CardHeader`, chỉ
  không có hộp.
- Ô nhập, ô chọn và ô văn bản xếp **dọc** — nhãn trên, ô dưới — như mọi form
  khác trong app. Dòng có `Switch` hoặc `Checkbox` xếp ngang bằng
  `Field orientation="horizontal"`: nhãn và mô tả bên trái, công tắc bên phải.
  Không có kiểu thứ ba. Xếp ngang cho mọi dòng (như block `settings-3` của ReUI)
  đã cân nhắc và bỏ: nó thêm một kiểu xếp nhãn mà phần còn lại của app không có,
  và biến thể `responsive` để cột điều khiển lởm chởm.

## Lưu

Hai luật, không có luật thứ ba:

1. **Điều khiển tự đủ** — `Switch`, `Select`, `ToggleGroup`, `Combobox`: lưu
   ngay khi đổi, báo bằng toast ngắn. Lỗi thì toast và trả giá trị cũ. Thiết lập
   áp cho cả không gian làm việc — đồng tiền báo cáo, model của tác tử, thời hạn
   lưu trữ — thì toast có nút «Hoàn tác».
2. **Có ô gõ chữ**: một `form`, nút «Lưu» ở `CardAction`, chỉ bật khi đã sửa và
   hợp lệ, có spinner khi đang lưu.

Không dùng `SaveBar` ở Cài đặt: các section độc lập với nhau.

## Tạo mới và hỏi lại

- Tối đa ba ô và không có phần xem trước: `Dialog`. Còn lại: `Sheet`. Trạng thái
  mở ghi trên URL, như Khoá API và SSO đang làm.
- Chân hộp: «Huỷ» bên trái, nút chính bên phải, cho cả `Dialog` lẫn `Sheet`.
  `SheetFooter` trong `packages/ui` xếp như `DialogFooter` từ 2026-09-30
  (`khung-tao-okr-nhu-deal`): «Huỷ» đứng trước nút chính trong mã; từ 640 px một
  hàng dồn phải, dưới 640 px nút chính nằm trên.
- Form tạo hay sửa có cột phụ bên cạnh (cột góp ý của Trợ lý OKR): `SheetContent`
  cỡ `assist` và `SheetBody` có `split`. Không mở rộng `Dialog` thành hai cột.
- Nút gửi tắt tới khi form hợp lệ.
- Hỏi lại trước thao tác không hoàn tác được: `ConfirmDialog`, chuyển vào
  `packages/ui` trước khi dùng thêm chỗ nào.

## Danh sách

| Khi | Dùng |
| --- | --- |
| cần tìm, lọc hoặc phân trang | `DataTable` |
| bảng nhỏ có cột | `SimpleTable` |
| mỗi hàng là một đối tượng có hành động, không có cột | `Item` (shadcn, cài vào `packages/ui`) |

- Hàng có một hành động: nút biểu tượng có `aria-label`. Từ hai hành động: gom
  vào menu «…».
- Danh sách Kết nối chưa chia nhóm; xét lại khi có từ sáu kết nối trở lên.

## Trạng thái

- **Đang tải**: khung xương cùng hình với section. Không `return null`.
- **Rỗng**: `Empty`; trong bảng: `CardTableEmpty`.
- **Lỗi khi tải**: `Empty` có nút thử lại, như màn Tổ chức.
- **Không đủ quyền**: điều khiển bị khoá, và một dòng dưới tiêu đề trang nói vì
  sao. Không ẩn section, không ẩn nút — thứ biến mất thì người dùng không biết
  mình thiếu quyền.
  - Ngoại lệ duy nhất: ba khối «Trợ lý OKR», «Góp ý của Trợ lý OKR» và «Sổ chi
    phí AI» ở Chương trình OKR ẩn với người không phải quản trị — sổ chi phí là
    số tiền của cả công ty, không phải cấu hình người đó thiếu quyền sửa. Chốt
    ở Cổng Phạm vi của `tro-ly-okr-nen` (`_acceptance/tro-ly-okr-nen/decisions.jsonl`);
    khối thứ hai («Góp ý của Trợ lý OKR», `TheGopYSoDo`) thêm ở lượt 9b vì cùng
    lý do.

## Đợt

Mỗi đợt là một lượt `/feature-loop`:

1. Khung trang và thanh bên: `width` cho `PageShell`, `breadcrumb`, `NavItem` và
   nhóm, dời «Nhắc buổi sáng» ra menu người dùng.
2. Chuyển `ConfirmDialog` và `CopyValue` vào `packages/ui`; dòng `Field` ngang;
   `StatusIndicator` thay chấm tự vẽ; phần đệm ô của `SimpleTable`;
   `SheetFooter` (đã xong 2026-09-30 ở `khung-tao-okr-nhu-deal`).
3. Cài `Item`, gộp các danh sách tự vẽ.
4. Hai luật lưu và bốn trạng thái trên mọi trang.
5. Gộp màn kết nối Google và Microsoft.
