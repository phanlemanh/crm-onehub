# Liên quan lọc bản đã cất — thiết kế

Hàng V2a của `docs/plan/lo-trinh-okr.json`, dãy P3 đợt r2. Cổng Đáng `build` (chủ kho, 2026-10-12T23:58:15Z). Mở từ
OOS-1 của V2 `vong-doi-mot-cach-cat` (chủ kho quyết ở Cổng Phạm vi, 09/10).

## Vấn đề

`docs/vong-doi.md` dặn: «Danh sách liên quan trong ngăn bản ghi (công ty → cá nhân, thoả thuận) cũng chỉ hiện bản
đang dùng, kèm dòng «+n đã lưu trữ» nếu có», và «số đếm trên màn chỉ đếm bản ghi đang dùng». Hôm nay `byId` của cả
ba service (`companies.service.ts`, `contacts.service.ts`, `deals.service.ts`) chọn quan hệ mà không lọc
`archivedAt`, nên:

| Chỗ | Hôm nay |
| --- | --- |
| Ngăn công ty › tab Cá nhân, tab Thoả thuận | bản đã cất lẫn vào, đếm vào số trên tab |
| Ngăn công ty › hàng số liệu đầu ngăn (giá trị đang mở, số thoả thuận đang mở, ngày chốt gần nhất) | tính cả thoả thuận đã cất |
| Ngăn cá nhân › tab Thoả thuận | thoả thuận đã cất lẫn vào |
| Ngăn cá nhân › «Đồng nghiệp» (`relationship().colleagues`, 4 người gần nhất) | đồng nghiệp đã cất lẫn vào |
| Ngăn thoả thuận › tab Cá nhân, mục «Người tham gia», chữ «người» trong lời báo xoá vĩnh viễn | cá nhân đã cất lẫn vào |
| Ngăn thoả thuận › bộ chọn «Thêm người» (`deals.contactOptions`) | gợi ý cả cá nhân đã cất |

## Cách làm

**Máy chủ tách, không lọc mất.** Prisma không chọn được cùng một quan hệ hai lần với hai `where`, nên mỗi `byId` vẫn
chọn quan hệ một lần, thêm `archivedAt` vào phần chọn, rồi chia làm hai mảng:

- Mảng cũ (`contacts`, `deals`) chỉ còn bản đang dùng. Mọi chỗ đọc mảng đó — số trên tab, số liệu đầu ngăn, «Người
  tham gia» — tự đúng mà không phải sửa từng chỗ.
- Mảng mới `archivedContacts` / `archivedDeals` mang bản đã cất ở dạng gọn: cá nhân `{ id, firstName, lastName,
  email, archivedAt }`, thoả thuận `{ id, name, archivedAt }`, xếp ngày cất mới nhất trước.

Hai hình gọn khai một lần bằng zod ở `apps/api/src/crm` và ba hợp đồng đầu ra (`companyDetailOutput`,
`contactByIdOutput`, `dealDetailOutput`) dùng chung. Ba hợp đồng là `z.object` thường, tự bỏ khoá lạ — nên mảng mới
phải nằm trong hợp đồng, nếu không nó rơi mất ở `.output()` mà kiểu vẫn qua.

Hai chỗ đọc khác lọc thẳng `archivedAt: null` trong câu truy vấn, không kèm «+n»: `contactOptions` (bộ chọn — không
gắn người đã cất vào thoả thuận) và `relationship().colleagues` (bốn đồng nghiệp gần nhất là tóm tắt, không phải danh
sách đầy đủ).

**Ngăn hiện «+n đã lưu trữ».** Cuối mỗi bảng liên quan, khi mảng đã cất có phần tử, có một dòng nút gập
«+n đã lưu trữ». Mở ra là các dòng mờ (`SimpleTableRow sub`), mỗi dòng một nút tên bản ghi và chữ phụ «Đã lưu trữ
ngày dd/mm/yyyy». Bấm tên mở ngăn của bản đó chồng lên — ngăn ấy đã có dải «Đã lưu trữ ngày … · Khôi phục» và menu
«Xoá vĩnh viễn» của V2, nên khôi phục và xoá vĩnh viễn đi đúng đường có sẵn. Dòng đã cất không có menu giai đoạn, sao
liên hệ chính, ô vai trò hay nút gỡ: nó chỉ để tìm lại. Bảng đang dùng rỗng mà có bản đã cất thì ô trống cũ vẫn hiện,
dòng gập nằm ngay dưới.

**Hộp xoá vĩnh viễn công ty nói thật.** `companyConsequence` đếm thoả thuận mất theo và cá nhân ở lại bằng tổng đang
dùng cộng đã cất: `Deal.company` là `onDelete: Cascade`, nên xoá vĩnh viễn công ty xoá cả thoả thuận đã cất; đếm thiếu
là nói sai hậu quả. Lời báo xoá vĩnh viễn của thoả thuận («… và những người trên nó vẫn ở lại») cũng chọn chữ
số ít/số nhiều theo tổng đang dùng cộng đã cất. Đây là hai chỗ duy nhất đếm cả bản đã cất, vì chúng nói về thứ mất đi
và thứ ở lại, chứ không về thứ đang thấy.

**Đầu REST đổi theo.** Bridge `/rest` sinh từ mọi thủ tục tRPC (`docs/api.md`), nên khoá API đọc `byId` thấy cùng
thay đổi: mảng cũ thôi có bản đã cất, thêm hai mảng mới. Không có người gọi trong `apps/agent`; tích hợp ngoài kho
không tra được từ kho — chủ kho chốt ở Cổng Phạm vi. Thiết kế ghi một dòng vào `docs/api.md` mục «Deleting a record is
archive first, purge later».

**Làm mới.** Lưu trữ và khôi phục đi qua `cache.removed` / `cache.<loại>(id)` của `apps/app/lib/trpc/cache.ts`, và
cả hai đã làm mới `byId` của hai loại kia — cất một thoả thuận từ ngăn của nó thì ngăn công ty phía dưới chuyển nó
sang dòng gập, không cần thêm khoá.

## Không làm

- Số đếm ở bảng danh sách công ty (`_count` cá nhân, thoả thuận đang mở, sắp xếp theo số) — màn danh sách, không phải
  ngăn.
- Tham chiếu đơn khi bản đó đã cất: công ty trên ngăn thoả thuận hay cá nhân, liên hệ chính của công ty — một liên
  kết, không phải danh sách; mở ra đã có dải báo.
- Chế độ thứ ba «tất cả» trong bảng liên quan — `docs/vong-doi.md` cấm.


<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: ngăn công ty › tab Thoả thuận → chỉ thấy thoả thuận đang dùng, cuối bảng «+2 đã lưu trữ» → bấm → hai dòng
  mờ có ngày cất → bấm tên → ngăn thoả thuận mở chồng lên với dải «Đã lưu trữ ngày … · Khôi phục» (điểm ra: đóng ngăn,
  hoặc Khôi phục).
- Biên: không có bản đã cất → không có dòng gập; chỉ có bản đã cất → ô trống cũ và dòng gập ngay dưới; bản ghi cha
  cũng đã cất → cùng luật.
- Lỗi & quay lại: tải ngăn lỗi → `VungTaiLoi` như hôm nay; khôi phục ở ngăn trên → ngăn dưới làm mới, dòng chuyển lên
  bảng đang dùng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn công ty › Cá nhân, Thoả thuận | xem người và thoả thuận đang gắn với công ty | bảng Công ty / ngăn cá nhân, thoả thuận |
| Ngăn cá nhân › Thoả thuận | xem thoả thuận người này tham gia | bảng Cá nhân / ngăn thoả thuận |
| Ngăn thoả thuận › Cá nhân | xem ai đang ở thoả thuận | bảng, Kanban Thoả thuận / ngăn cá nhân |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lienquan-khong-cat | bảng liên quan | chỉ dòng đang dùng, không có dòng gập | như hôm nay |
| ST-lienquan-gap | bảng liên quan | dòng đang dùng + «+n đã lưu trữ» đang đóng | bấm để mở |
| ST-lienquan-mo | bảng liên quan | thêm n dòng mờ «tên · Đã lưu trữ ngày …» | bấm tên mở ngăn, hoặc bấm lại để gập |
| ST-lienquan-chi-cat | bảng liên quan | ô trống cũ + «+n đã lưu trữ» | bấm để mở |
| ST-lienquan-rong | bảng liên quan | ô trống cũ | thêm như hôm nay |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dòng gập là `<button>` thật có `aria-expanded`; tên trong dòng đã cất là `<button>` thật — Tab tới được, Enter mở
  ngăn. Chevron `aria-hidden`.
- Số trên tab, số liệu đầu ngăn, «Người tham gia» đếm bản đang dùng; «n» viết bằng chữ số.
- Ngày cất qua `LocalDay` (múi giờ người xem, như dải báo). Tên là dữ liệu người nhập: `translate="no"`.
- 390: dòng mờ gọn trong ngăn, tên cắt bằng `truncate` với `min-w-0`, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `SimpleTableRow sub`, `TableCell`, `Button` | dùng | dòng mờ thụt và nút đã có trong `packages/ui`; mở-gập là một nút `aria-expanded` vì `Collapsible` sinh `div`, không nằm được trong `tbody` |
| `DongDaLuuTru` (`record-sheet/record-parts.tsx`) | ghép | cạnh `AddRow`, cùng hình một dòng nút cuối bảng; một chỗ cho bốn bảng, chỉ khu record-sheet dùng |
| `LocalDay` | dùng | ngày cất theo múi giờ người xem, như dải báo |

Bậc đã tra (`docs/design.md` «Vẽ tay là bậc cuối»): bậc 1 có `ArchivedList` (mục gập «Đã lưu trữ (n)» có Khôi phục,
Xoá vĩnh viễn) nhưng nó là danh sách `ul` cho Cài đặt, không ngồi trong `SimpleTable`, và kèm nút khôi phục mà thiết
kế này để ở dải báo — nên ghép từ `SimpleTableRow` và `Button` cùng bậc 1, dừng ở bậc 1.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: ngăn bản ghi đã là chi tiết của bảng; dòng gập chỉ thêm một tầng trong danh sách liên quan, không đổi khuôn —
luồng hiển nhiên, không tra.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn nội đã nạp

`feature_loop.ui_standards_skill: web-design-guidelines` — nạp bản Web Interface Guidelines (13/10). Áp ở đây:
`<button>` cho hành động, chevron trang trí `aria-hidden`, focus thấy được (`focus-visible`), số đếm bằng chữ số, chỗ
chữ dài có `truncate` + `min-w-0`, xử lý ca rỗng. Bản hướng dẫn khuyên đưa trạng thái mở-gập lên đường dẫn; thiết kế
này không đưa — xem câu Hỏi trong sổ quyết định.
