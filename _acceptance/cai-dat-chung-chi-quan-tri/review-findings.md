# Review Findings: cai-dat-chung-chi-quan-tri (round 1)

## Trong hợp đồng

### Hình dạng 3 (assert chuỗi có mặt, lời hứa là quan hệ): chốt hồi quy E8 chỉ bắt dòng bị xoá có chữ `expect(`/`it(`, nên sửa kỳ vọng cũ lọt qua
- file: `_acceptance/config.yaml:384`
- severity: high
- AC: AC-8
- source: measurement

`ccq_cong_hoi_quy` chạy `! git diff -U0 <merge-base> -- test/onboarding-gate.spec.ts | grep -E "^-[^-].*(expect\(|[^a-z]it\()"`. Lời hứa của E8 là quan hệ "khẳng định cũ không bị viết lại", nhưng lệnh chỉ đo xem dòng bị xoá có chứa chữ `expect(` hay `it(` không. Trong onboarding-gate.spec.ts giá trị kỳ vọng nằm trên một dòng riêng, ví dụ ca "sends an onboarded rep with no key to the key form" (dòng 393-400) kết thúc bằng `).toBe("/onboarding/research");`, còn `expect(` đứng một mình ở dòng khác. Sửa đúng ca mà CHIỀU ĐỎ của E8 nêu tên (đổi `.toBe(...)`) chỉ xoá dòng `-\t\t).toBe(...)`, không chứa `expect(` hay `it(`, nên grep không khớp, `!` trả 0, và E8 xanh. Chiều đỏ đã khai trong evals.yaml:133-150 vì thế không đỏ được. Thêm nữa, `[^-]` ăn mất ký tự thụt lề đầu tiên, nên dòng `-\tit("..."` thụt một tab (mức thụt của mọi `it(` trong tệp) không bao giờ khớp `[^a-z]it\(`. Đã thử: printf ba dòng `-\tit(`, `-\t\t).toBe(...)`, `-\t\texpect(` qua đúng regex đó thì chỉ dòng `expect(` khớp.

Rationale: AC-8 hứa nguyên văn "không dòng expect hay it() cũ nào bị xoá hoặc sửa", và phát hiện chứng minh đúng chốt hồi quy dùng để đo lời hứa này (E8) không bắt được các cách xoá/sửa khẳng định phổ biến (ví dụ sửa .toBe(...) hoặc dòng it( thụt tab).

### Hình dạng 4 (âm tính một mình, không có đối chứng dương): hai nút lưu bị kiểm `disabled true` cho thành viên, nhưng nút bị tắt với mọi vai trò
- file: `apps/app/test/cai-dat-chung-khoa.dom.tsx:243`
- severity: medium
- AC: AC-7
- source: measurement

Ở nhánh thành viên (dòng 239-257), mỗi control bị kiểm `disabled true`, kể cả "nut thay khoa" (dòng 170-173) và "nut luu" (dòng 191). Nhưng trong bộ dữ liệu giả của test, cả hai nút đều bị tắt bất kể `canManage`. research-key.tsx:67 có `disabled={!canManage || save.isPending || draft.trim() === ""}` với draft khởi tạo `""`. archive-retention.tsx:70-75 tắt nút khi `unchanged` (draft = days vừa nạp). Nhánh quản trị bỏ qua hai nút này vì `moKhiCoQuyen` chỉ có "o khoa" và "o so ngay", nên không có đối chứng dương cho thấy nút bật lên khi có quyền. Bỏ `!canManage` khỏi `disabled` của hai nút lưu thì assert `disabled true` vẫn xanh. Riêng phần tắt-theo-quyền của hai nút này, lời hứa của E7 ("năm control có thuộc tính disabled") chưa được đo. Chỉ assert aria-describedby của chúng là thật sự phân biệt được hai vai.

Rationale: AC-7 liệt kê đích danh "nút lưu khoá" và "nút lưu số ngày" trong năm control phải disabled cho member và bấm được như hôm nay cho quản trị; phát hiện cho thấy phần đo hai nút này không phân biệt được lý do disable là do quyền hay do logic khác, nên nhánh quản trị của đúng lời hứa AC-7 cho hai control đó chưa được đo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gate union declared twice: CongNghienCuu in validation duplicates Gate in onboarding.ts**
  Người dùng thấy gì: Không ảnh hưởng ai ngay bây giờ, nhưng nếu sau này có người thêm một trạng thái mới vào một nơi mà quên nơi kia, cổng kiểm khoá nghiên cứu và cổng chặn quyền có thể lệch nhau mà không ai nhận ra.
  file: `packages/validation/src/cong-nghien-cuu.ts`
  severity: low
  Đề xuất: known-limits

- **ccq_cong_hoi_quy passes silently when `git merge-base` or `git diff` fails**
  Người dùng thấy gì: Bộ kiểm tra tự động của vòng này có thể báo 'đạt' ngay cả khi lệnh kiểm bên trong nó thật ra không chạy được, nên nếu sau này ai đó vô tình xoá một bài kiểm cũ của cổng onboarding, việc đó có thể không bị phát hiện.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

- **ccq_cong_hoi_quy regex misses removed or rewritten `it(` lines at one-tab indent**
  Người dùng thấy gì: Cách máy dò xem có bài kiểm cũ nào bị tắt hay xoá không hiện đang bỏ sót đúng kiểu thụt lề mà mọi bài kiểm của cổng onboarding dùng, nên việc vô hiệu hoá âm thầm một bài kiểm cũ có thể lọt qua.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (âm tính không phân biệt được): ca nonMember của E2 không bao giờ tới requireManager, nên chiều đỏ "requireManager bỏ qua role null" không đỏ được**
  Người dùng thấy gì: Người không thuộc workspace vẫn bị từ chối đúng như đã hứa; đây chỉ là một cách kiểm nội bộ chưa phân biệt được lý do chặn, không phải lỗi thật khiến ai đó lọt qua được cửa chặn.
  file: `apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn/mã nguồn thay vì đầu ra): E10 chứng minh "onboarding.ts gọi chính hàm này" bằng cách tìm chuỗi import trong tệp nguồn**
  Người dùng thấy gì: Việc có đẩy vào màn cắm khoá hay không vẫn được đo bằng dữ liệu thật; chỉ riêng lời hứa phụ 'dùng đúng một hàm chung' được kiểm bằng cách tìm chữ trong mã nguồn, nên nếu sau này có người viết lại logic tương tự mà quên gọi đúng hàm, bài kiểm có thể không phát hiện ra.
  file: `apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.