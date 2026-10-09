# Review findings: dien-thoai-ca-nhan (round 2)

## Trong hợp đồng

- **tim-bang-1440 never actually checks the second search format (0901234567): choLocXong passes on rows left over from the first search**
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs:420`
  severity: medium
  AC: AC-9
  source: bugs
  detail: doTimBang runs two search formats in a row: `+84 9xx xxx xxx`, then `0${quocNoi}`. After each one, choLocXong(p, nguoi.ten) waits until every `[data-slot="table"] tbody tr` contains the person's name. The first search leaves the DOM in exactly that state: one row, the target person. The contacts table query uses `placeholderData: (previous) => previous` (apps/app/app/(app)/[slug]/contacts/contacts-table.tsx:173,184), and ListSearch commits `q` through the debounced useSearchInput. So right after `o.type('0…')`, the old filtered rows are still on screen and waitForFunction resolves on its first poll. The script records "-> chi con dong cua nguoi do (1 dong)" before the request for the second format has even been sent. Concrete failure: if search by the `0…` format broke (for example, soQuocNoiDeTim stopped stripping the leading 0, or the API returned 0 rows), the line still reads DUNG tim-bang-1440, and E17 (AC-9, "go '0901234567' -> van co mat") passes with nothing measured. Fix: before each search, wait for the table to change from the previous state (go back to the full list, `truoc` rows, first). Or wait for the network response of contacts.list with the matching q before calling choLocXong.
  Lý do vào hợp đồng: AC-9 đòi gõ «0901234567» thì ra đúng người, và đường đo khai phép đo màn này bảo đảm AC-9; phép đo hiện đọc bảng còn lọc từ câu trước nên không chứng minh được AC-9 cho dạng này.

- **Hình dạng 3 (assert trạng thái có mặt trong khi lời hứa là quan hệ giữa câu gõ và bảng): cách gõ thứ hai «0901…» ở tim-bang-1440 đọc bảng còn lọc theo câu trước**
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs:420`
  severity: medium
  AC: AC-9
  source: measurement
  detail: Vòng `for (const chu of cachGo)` (dòng 418–423) gọi `goTim` rồi `choLocXong` ngay. `choLocXong` (dòng 379) chỉ hỏi: mọi hàng `tbody tr` có chứa tên người đó không. Sau cách gõ thứ nhất «+84 901 234 567», bảng đã chỉ còn đúng một hàng của người đó. Ô tìm commit qua useSearchInput với độ trễ 250 ms (packages/ui/src/hooks/use-search-input.ts). Đặt giá trị rỗng bằng setter (dòng 370) rồi gõ chuỗi mới chỉ đặt lại bộ hẹn giờ; q trên URL vẫn là câu thứ nhất. Vì vậy waitForFunction đúng ngay lần hỏi đầu, trước khi câu «0901234567» được gửi đi, và dòng ghi «0901234567 -> chi con dong cua nguoi do» luôn đúng, bất kể máy chủ trả gì cho dạng quốc nội. Eval E17 hứa riêng vế này: «go "0901234567" -> van co mat». Điều kiện kiểm không ràng vào câu vừa gõ, nên một hồi quy chỉ làm hỏng dạng 0… (ví dụ nhánh bỏ số 0 đầu) vẫn ra DUNG. Chỉ cách gõ đầu tiên phân biệt được, vì lúc đó truoc > 1.
  Lý do vào hợp đồng: Cùng gốc với mục trên: bằng chứng của AC-9 cho dạng «0901234567» không ràng vào câu vừa gõ nên không chứng minh được lời hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The "12" row's expected value is computed from the database instead of fixed as in the signed matrix**
  Người dùng thấy gì: Phép kiểm tra «gõ 12 thì không lọc theo số» hiện đúng, nhưng đáp án của nó lấy từ chính dữ liệu thử. Nếu sau này tên thử vô tình chứa «12», phép kiểm tra sẽ không còn bắt được lỗi lọc nhầm theo số.
  file: `apps/api/test/dien-thoai-ca-nhan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **The script now checks the detail pane on screen, but its screenshot is not committed and no eval reads it**
  Người dùng thấy gì: Phần chi tiết của người trong bảng (số và liên kết gọi) được script kiểm tra, nhưng ảnh minh chứng không nằm trong hồ sơ nên người duyệt không tự xem bằng mắt được, chỉ tin dòng báo của script.
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim thông điệp): CHIỀU ĐỎ của E17 và E18 ghim «tim-bang: thieu nguoi» / «tim-cmdk: thieu nguoi», nhưng do-man.mjs không bao giờ in chuỗi đó**
  Người dùng thấy gì: Khi phép đo tìm kiếm báo sai, ta không chắc chắn rằng nó sai đúng vì thiếu nhánh tìm theo số; thông báo lỗi quá chung nên khó chứng minh nguyên nhân.
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (giá trị mong đợi tự uốn theo fixture): ca «12 duoi nguong» tính đáp án từ tên đã ghi; khi TEST_RUN_ID chứa «12», đáp án thành PQR và không còn bắt được lọc theo số**
  Người dùng thấy gì: Hiếm khi mã lượt thử có chứa «12», lúc đó phép kiểm tra «gõ 12 không lọc theo số» tự đổi đáp án và có thể bỏ lọt lỗi lọc nhầm theo số mà vẫn báo xanh.
  file: `apps/api/test/dien-thoai-ca-nhan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **SoDienThoai builds its own <a> link instead of using Link from @crm/ui (r1)**
  Người dùng thấy gì: Số điện thoại bấm gọi được vẫn chạy đúng, nhưng khi người dùng đi bằng bàn phím thì không thấy viền báo đang đứng ở số đó, và kiểu gạch chân hơi khác các chỗ khác.
  file: `apps/app/components/crm/so-dien-thoai.tsx`
  severity: medium
  Đề xuất: known-limits

- **The phone normaliser is written twice, and the SQL copy hard-codes its constants (r1)**
  Người dùng thấy gì: Hiện tại việc chặn trùng số vẫn đúng. Nhưng nếu sau này ai đó đổi quy tắc đọc số ở một nơi mà quên nơi kia, hai người cùng một số có thể được lưu mà không bị báo trùng.
  file: `packages/db/src/so-dien-thoai.ts`
  severity: medium
  Đề xuất: known-limits

- **Magic score 4 for a phone hit in Kara's lookup (r1)**
  Người dùng thấy gì: Kara vẫn tìm ra đúng người theo số. Chỉ có rủi ro nhỏ là nếu đổi cách xếp hạng kết quả sau này thì người khớp theo số có thể bị xếp lệch thứ tự.
  file: `apps/agent/agent/lib/lookup.ts`
  severity: low
  Đề xuất: wont-fix

- **VN numbers written with a trunk 0 after +84 (or a doubled 0) are accepted but stored wrong. This gets past the duplicate check and search, and shows the wrong number (r1)**
  Người dùng thấy gì: Nếu ai đó gõ số dạng +84 rồi lại kèm số 0 đầu, hệ thống vẫn nhận nhưng lưu sai số, hiện sai số, và có thể để lọt hai người trùng số mà không báo.
  file: `packages/validation/src/so-dien-thoai.ts`
  severity: high
  Đề xuất: new-contract

- **caNhanCoSo caps at 500 ids with no ORDER BY and no archivedAt filter, so list search can silently drop results and report a wrong total (r1)**
  Người dùng thấy gì: Khi gõ một đoạn số ngắn khớp với hơn 500 người, danh sách có thể thiếu người và tổng số hiện ra không đúng, mà không có dấu hiệu nào báo là kết quả đã bị cắt.
  file: `packages/db/src/so-dien-thoai.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): test «goi-y-moi-gioi: nhan o chon» chỉ assert từ điển messages (r1)**
  Người dùng thấy gì: Có một bài kiểm chỉ đọc bảng chữ mà không nhìn màn hình, nên nó xanh nhưng không chứng minh được điều gì cho người dùng.
  file: `apps/app/test/dien-thoai-ca-nhan.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3: «không lộ số» của Kara chỉ dò khoá «phone» và chuỗi chữ số liền (r1)**
  Người dùng thấy gì: Bài kiểm chỉ bắt được trường hợp số lộ ra ở dạng liền mạch; nếu sau này số lộ ra ở dạng có dấu cách hay có +84 thì bài kiểm sẽ không phát hiện.
  file: `apps/agent/test/tim-theo-so.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
