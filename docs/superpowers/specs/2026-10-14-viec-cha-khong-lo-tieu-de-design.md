# Không lộ tiêu đề việc cha — thiết kế (hàng DA2b)

Hồ sơ: `_acceptance/viec-cha-khong-lo-tieu-de/` · gốc: `_acceptance/kanban-viec/review-findings.md` mục Ngoài-2
(rò quyền xem, high) và Ngoài-3 (đếm việc con, medium) · sổ DA2 `d-20261013T231940Z-27`, `-28`.

## Vấn đề

`docs/api.md` mục «Việc» khai: `dieuKienXemViec(userId)` đứng ở mọi câu đọc, và mã không thấy với mã không có
trả cùng 404. DA2 thêm hai câu đọc đi vòng qua luật đó trong `apps/api/src/viec/viec-bang.service.ts`:

1. **Tiêu đề cha.** `chonBang()` (dùng cho `viec.bang`) và `con()` (`viec.con`) chọn
   `cha: { select: { id, tieuDe } }` không kèm điều kiện thấy. Quan hệ một-một của Prisma không nhận `where`
   trong `select`, nên cha luôn hiện. Ca thật: P gắn thoả thuận D, B (người thực hiện P) thêm con K cho C; K
   chép gắn D. A (người giao P) gỡ D khỏi P → P thành việc riêng, C không thấy P, nhưng thẻ K trên bảng của C
   vẫn ghi «Thuộc: <tiêu đề P>», khung K vẫn có dòng «Thuộc việc: <P>», bấm vào thì 404.
2. **Đếm con trên thẻ bảng.** `chonBang()` chọn `con: { select: { trangThai } }` không kèm điều kiện thấy, nên
   `con.xong`/`con.tong`/`conMo` trên thẻ đếm cả con người xem không thấy; `viec.con` thì đã lọc. Hai số lệch,
   hộp hỏi lại khi kéo cha sang Xong nói «còn n việc con» lệch với danh sách trong khung, và con số tiết lộ có
   việc riêng của người khác.

## Cách làm

- **Đếm con:** thêm `where: dieuKienXemViec(userId)` vào `con` trong `chonBang()` — quan hệ một-nhiều nhận
  `where`. Thẻ không còn con nào thấy được thì `con: null` như việc không có con.
- **Tiêu đề cha:** sau khi đọc các hàng của bảng (và hàng của `viec.con`), gom `chaId` khác null, đọc một lần
  `viec.findMany({ where: { AND: [{ id: { in: chaIds } }, dieuKienXemViec(userId)] }, select: { id: true } })`,
  rồi trả `cha: null` cho hàng có cha ngoài tập thấy. Một hàm nhỏ trong `viec-bang.service.ts` dùng chung cho
  hai câu đọc; luật thấy vẫn chỉ ở `dieuKienXemViec` (`packages/db/src/viec.ts`), không chép sang JS. Thêm
  đúng một truy vấn mỗi lần gọi `viec.bang`/`viec.con`, không theo số thẻ.
- **Cha không thấy thì ẩn hẳn**, không thay bằng dòng «thuộc một việc bạn không xem được»: luật 404 chung của
  `docs/api.md` không phân biệt «có mà không thấy» với «không có». Với `cha: null`, giao diện hiện có đã xử lý
  đúng: thẻ không có dòng «Thuộc», `MucViecCon` không hiện gì (việc con không có con, và `themDuoc` tính theo
  `chaId` ở máy chủ nên vẫn `false`). Không đổi mã giao diện, không thêm chữ.
- **Con người xem không thấy không đếm và không nhắc (Hỏi-1).** Thẻ cha chỉ đếm con người xem thấy, nên khi mọi
  con mở đều ngoài tầm thấy thì kéo cha sang Xong không bật hộp hỏi lại — cùng cách khung việc đang làm từ DA2
  (`viec.con` đã lọc con). Lối khác là nhắc bằng một câu không tên, đổi lại lộ rằng có việc riêng; chủ kho chọn ở
  Cổng Phạm vi.
- **Quét mọi câu đọc (AC-6).** Ngoài hai câu đọc đã biết, bài kiểm quét sáu câu đọc người làm việc con chạm được
  (`viec.get`, `viec.lichSu`, `viec.con`, `viec.bang`, `viec.cuaToi`, `viec.cuaBanGhi`) để chặn kênh lộ khác. Đọc mã
  ở `aac0975b5`: đầu ra của Việc không mang `chaId`, vết «tạo» của việc con không nhắc cha.
- **Tài liệu:** câu «Bảng và việc con» của `docs/api.md` nói rõ `cha` là null khi người xem không thấy cha, và
  `con`/`conMo` chỉ đếm con người xem thấy.

## Không đổi

Luật thấy việc (`dieuKienXemViec`, `packages/db`) giữ nguyên — đổi nó là T3. Đầu ra zod (`viecBangOutput`,
`viecConOutput`) đã cho `cha` nullable, nên `apps/api/src/generated/server.ts` không phải sinh lại.

## Đặc tả UX

Bỏ — lượt này không đổi mã giao diện (sổ quyết định, dòng «bỏ đặc-tả-UX»).
