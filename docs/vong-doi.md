# Vòng đời bản ghi — xoá, lưu trữ, khép, và danh sách hiện gì

Đọc trước khi thêm một loại bản ghi mới, một danh sách, một nút xoá hay lưu trữ,
hay một trạng thái kết thúc. Chủ kho duyệt chuẩn này ngày 2026-10-07, sau đợt rà 15
loại bản ghi trên onehub `73bb599`.

Trước đợt rà, mỗi tính năng dọn dữ liệu theo một kiểu riêng: mục tiêu OKR nhập sai
không xoá được, giai đoạn thoả thuận ghi «Xoá» mà thật ra chỉ cất, tác nhân xoá
được cả khi đang chạy, chiến dịch và tài liệu không dọn được gì. Tài liệu này là
luật chung để tính năng sau không thêm kiểu thứ mười sáu.

## Một câu quyết định nút nào xuất hiện

> **Chưa có lịch sử thì Xoá. Đã có lịch sử thì Lưu trữ, hoặc khép bằng một kết
> cục nghiệp vụ.**

**Lịch sử** là thứ người khác đã thấy hoặc đã dựa vào: đã công bố, đã có cập nhật,
đã được dùng để tạo thứ khác, đã có hoạt động, đã gửi ra ngoài. Mỗi loại bản ghi
khai rõ «lịch sử» của nó nghĩa là gì, bằng một hàm kiểm ở máy chủ — không để giao
diện tự đoán.

Mẫu đang chạy đúng câu này: KR chỉ xoá được khi chưa có lần cập nhật, điểm, bằng
chứng hay căn chỉnh (`okr.service.ts`, `removeKeyResult`); chu kỳ chỉ gỡ được khi
còn trống, có dữ liệu thì ẩn (`okr-chu-ky.service.ts`).

## Ba cách dọn

| Cách | Khi nào | Hành vi |
| --- | --- | --- |
| **Xoá** | Bản ghi tạo nhầm, chưa có lịch sử | Mất thật, nên hỏi lại một lần bằng `ConfirmDialog`, nói rõ thứ gì mất theo. Vết ghi lại việc xoá. Không có «Hoàn tác». |
| **Lưu trữ → Khôi phục → Xoá vĩnh viễn** | Bản ghi đã có lịch sử, không còn dùng | Lưu trữ không hỏi, toast luôn có «Hoàn tác». Khôi phục từ chỗ «Đã lưu trữ». Xoá vĩnh viễn chỉ bấm được từ chỗ «Đã lưu trữ», luôn hỏi và nêu hậu quả. |
| **Kết cục nghiệp vụ** — Bỏ, Đóng, Kết thúc | Bản ghi đã xong việc, và việc nó xong là một phần lịch sử | Không phải xoá. Danh sách mặc định chỉ hiện thứ đang chạy. Mở lại được khi nghiệp vụ cho phép, và mở lại không được lách bước duyệt. |

Một loại bản ghi có thể có cả Xoá (khi chưa có lịch sử) lẫn một trong hai cách còn
lại (khi đã có). Nó không bao giờ có hai cách cất song song — không có cả
`archivedAt` lẫn `deletedAt`.

## Danh sách mặc định hiện gì

Mặc định chỉ hiện bản ghi **đang dùng**. Thứ đã cất hay đã khép không bao giờ lẫn
vào danh sách chính, và không có chế độ thứ ba «tất cả». Ba chỗ để tìm lại, chọn
theo hình dạng màn:

| Màn | Chỗ tìm lại | Mảnh dùng |
| --- | --- | --- |
| Bảng lớn có tìm, lọc, phân trang | Nút «Đã lưu trữ» trên thanh công cụ, cùng một chỗ, có ở mọi dạng xem (bảng và Kanban) | tham số `archived` của `list-search-params.ts`, `archivedFilter` ở API |
| Danh sách ngắn ở Cài đặt | Mục gập «Đã lưu trữ (n)» cuối trang | `ArchivedList` (`packages/ui`) |
| Danh sách có nhóm, bản ghi có kết cục nghiệp vụ | Dòng gập «Đã bỏ (n)», «Đã đóng (n)» cuối mỗi nhóm; bộ lọc trạng thái vẫn chọn riêng được | — |

Thêm vào đó:

- Danh sách liên quan trong ngăn bản ghi (công ty → cá nhân, thoả thuận) cũng chỉ
  hiện bản đang dùng, kèm dòng «+n đã lưu trữ» nếu có.
- Mở một bản ghi đã cất: dải báo đầu ngăn «Đã lưu trữ ngày … · Khôi phục», các ô chỉ
  đọc.
- Bản ghi đã khép trông khác bản ghi đang chạy — dòng mờ, nhãn riêng. Không dùng
  chung kiểu nhãn với «Nháp».
- Số đếm trên màn (hộp thoại «còn n thoả thuận», trần mục tiêu) chỉ đếm bản ghi
  đang dùng — người dùng không thấy thứ đã cất thì không được bắt họ tính nó.

## Máy chủ

- Danh sách mặc định lọc `archivedAt: null` — `archivedFilter(input.archived)` ở
  mọi `buildWhere` và mọi `facetCounts`. Xem `docs/api.md` mục «Deleting a record is
  archive first, purge later».
- **Xoá vĩnh viễn từ chối bản ghi chưa lưu trữ** ở mọi đường gọi, không chỉ khi
  lịch dọn gọi.
- **Lưu trữ lại một bản đã lưu trữ không đổi ngày lưu trữ** — đồng hồ dọn đếm từ lần
  đầu.
- Xoá (khi chưa có lịch sử) kiểm lại điều kiện «chưa có lịch sử» trong cùng giao
  dịch, và ghi vết.
- Kết cục nghiệp vụ là một giá trị trạng thái có ghi vết, không phải một cột cất.

## Bộ chữ

Một hành động mang một chữ ở mọi màn. Từ điển sản phẩm (`CONTEXT.md`) là nơi chốt;
bảng này là bản tóm cho người làm.

| Chữ | Chỉ dùng cho | Không dùng |
| --- | --- | --- |
| Xoá | Mất thật, ngay lúc bấm | cho việc thật ra là lưu trữ |
| Lưu trữ · Khôi phục | Cất và lấy lại | «ẩn», «archive», «xoá mềm» |
| Đã lưu trữ | Tên chỗ xem thứ đã cất — nút trên thanh công cụ, mục gập | «Lưu trữ» trần cho nút xem (đọc như một hành động) |
| Xoá vĩnh viễn | Bước cuối, sau lưu trữ — cả nút trên menu lẫn nút xác nhận | «Xoá hẳn», «Xoá» trần trong hộp xác nhận |
| Bỏ · Dùng lại | Chỉ mục tiêu OKR | cho việc xoá hẳn ở chỗ khác (bước kế hoạch, lựa chọn của trường) |
| Đóng · Mở lại | Kế hoạch 30 ngày | |
| Kết thúc | Chiến dịch | |
| Gỡ · Ẩn | Gỡ quyền, gỡ liên kết, gỡ chu kỳ trống; ẩn chu kỳ — như từ điển đã chốt 2026-09-30 | |

Trạng thái thô (`archived`, `da-bo`) không bao giờ hiện ra màn hình.

## Mảnh dùng chung

Lắp từ mảnh có sẵn, đừng dựng lại. Mảnh nào chưa có thì thêm vào `packages/ui` rồi
mới dùng.

| Mảnh | Có chưa |
| --- | --- |
| `ArchivedList` — mục gập «Đã lưu trữ (n)» có Khôi phục, Xoá vĩnh viễn | có |
| `ConfirmDialog` — hỏi lại trước thao tác không hoàn tác được | có |
| `archivedFilter`, tham số `archived` trên URL | có |
| Nút «Đã lưu trữ» trên thanh công cụ bảng | có trong từng bảng, chưa thành mảnh chung — lượt 2 |
| Dải báo bản ghi đã lưu trữ | chưa — lượt 2 |
| Toast lưu trữ có «Hoàn tác» | khuôn kế hoạch và đơn vị tự làm, chưa thành mảnh chung — lượt 2 |
| Chặn xoá vĩnh viễn bản chưa lưu trữ, lưu trữ giữ ngày đầu | chưa — lượt 1 |

Bản ghi đang làm đúng chuẩn, để bắt chước: KR và chu kỳ OKR (xoá khi chưa có lịch
sử), khuôn kế hoạch và đơn vị tổ chức (lưu trữ, khôi phục, xoá vĩnh viễn, có Hoàn
tác và có chặn).

## Tính năng mới phải trả lời ba câu ở Cổng Phạm vi

Tính năng nào tạo một loại bản ghi mới, hay thêm trạng thái kết thúc cho một loại
cũ, ghi ba câu trả lời vào hợp đồng:

1. **Dọn thế nào** — Xoá, Lưu trữ, kết cục nghiệp vụ, hay Xoá cộng một trong hai.
2. **«Lịch sử» nghĩa là gì** với loại bản ghi này — cái gì làm nút Xoá biến mất.
3. **Danh sách mặc định hiện gì**, và thứ đã cất hay đã khép tìm lại ở đâu.

Ba câu này là phán xét của người — máy đề xuất, người chốt.

## Đợt

Mỗi đợt là một lượt `/feature-loop`:

1. **Dọn được OKR nhập sai**: xoá mục tiêu chưa có lịch sử, mặc định ẩn mục tiêu đã
   bỏ, «Dùng lại» đưa mục tiêu đã bỏ về Nháp khi chu kỳ còn nhận ghi; máy chủ chặn
   xoá vĩnh viễn bản chưa lưu trữ và giữ ngày lưu trữ đầu. Thêm bộ chữ vào
   `CONTEXT.md`.
2. **Một cách cất, một bộ chữ**: đổi chữ lệch trên mọi màn, Hoàn tác khi lưu trữ ở
   mọi nơi, dải báo bản ghi đã cất, nút «Đã lưu trữ» trên Kanban thoả thuận, danh
   sách liên quan lọc bản đã cất, giai đoạn thoả thuận và tác nhân theo nếp lưu trữ.
   Thêm luật thứ bảy «vòng đời» vào `scripts/luat-kho` và chạy thước đó ở CI.
3. **Lấp chỗ trống**: chiến dịch có «Đang chạy | Đã kết thúc», xoá kế hoạch 30 ngày
   tạo nhầm, khôi phục lựa chọn của trường, ghi rõ phạm vi dọn tự động ở Cài đặt ›
   Chung.

**Tài liệu đi lộ trình riêng.** Lưu trữ trang tài liệu là lượt 3b
`lich-su-va-luu-tru-trang` của `docs/plan/lo-trinh-kho-tai-lieu.md` (T3, thêm cột lưu
trữ cho `TaiLieuTrang`), chủ kho nhận ngày 2026-09-29. Lượt đó theo chuẩn này, với
một điểm riêng của Kho: lưu trữ một trang là một đề xuất phải qua duyệt, vì chủ kho
chốt ngày 2026-09-26 rằng mọi thay đổi trong Kho đều qua duyệt. Hai việc rà ngày
2026-10-07 thấy thêm và chuyển vào lượt đó: nguồn tài liệu (`TaiLieuNguon`) cũng chưa
lưu trữ được, và đề xuất đã duyệt không hiện ở tab nào của màn duyệt.
