# Review findings: trang-lo-trinh-trong-crm (round 1)

## Trong hợp đồng

- **A milestone date the reader cannot parse shows up as a negative or NaN day count**
  file: apps/app/components/lo-trinh/viec.ts:57
  severity: medium
  AC: AC-4
  source: conventions
  detail: The shape check at the boundary is too loose. In packages/validation/src/lo-trinh-du-lieu.ts:28 the schema accepts `moc.ngay` as any `z.string()`. The kit reader (docDuLieu) also turns a missing key into `''`, and the kit itself allows dates that are not ISO: scripts/lo-trinh.mjs:280 and :733 test the regex and count bad dates as `hong`. Downstream, only some callers check the format again: `viecTre` and `mocQuaConViec` in apps/app/lib/lo-trinh/ngay.ts test `/^\d{4}-\d{2}-\d{2}$/`. `phangViec` does not. It calls `soNgay(homNay, moc.ngay)` directly, and the milestone it picks for an item can be one whose date is malformed (the kit skips those at :733). Run with bun: `soNgay('2026-10-10','')` returns -46303, `soNgay(...,'cuối Q4')` returns NaN, and `soNgay(...,'2026-10')` returns -9. None of these items are late, because viecTre skips the bad date. So o-moc.tsx ChuConNgay shows «còn -46303 ngày» or «còn NaN ngày». That breaks AC-4 (no undone item may show a negative day count) in the AC-8 case the contract names: a block missing a key, which the reader treats as empty. Following AGENTS.md (parse at the boundary, don't re-derive the shape at each call site), the domain type should carry an already-checked date, e.g. `ngay` plus `ngayHopLe: string | null`, or a refine/transform in the validation module. phangViec and the rest should then use only that value. Today the ISO regex is written twice in ngay.ts and missing in viec.ts.

- **A milestone date in a non-ISO format shows a negative or absurd «còn n ngày» instead of being treated as unreadable**
  file: apps/app/lib/lo-trinh/ngay.ts:10
  severity: low
  AC: AC-4
  source: bugs
  detail: `viecTre` and `mocQuaConViec` skip any date that fails `/^\d{4}-\d{2}-\d{2}$/`, but `soNgay` (used for `conNgay` in viec.ts:57) parses any string. The schema accepts any string for `moc.ngay` (`z.string()`), and the plan tool does not check date format. Example: `ngay: "2026-10-9"` in the past gives `tre = false` and `conNgay = -1`, so ChuConNgay renders «còn -1 ngày». An empty `ngay` parses to Date.UTC(0,0,1), which is the year 1900, and renders «còn -46000 ngày». This breaks AC-4's rule that no undelivered task shows a negative day count, and the bad date gives no warning. The kit's own page marks such dates as broken. Fix: return null from `conNgay` when the date fails the same pattern check.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Missing roadmap block and damaged block are told apart by searching for a Vietnamese phrase in the warning text**
  Người dùng thấy gì: Hiện tại trang vẫn báo đúng hai tình huống «chưa có dữ liệu lộ trình» và «dữ liệu bị hỏng». Nhưng nếu bộ công cụ sau này đổi lời một câu cảnh báo, mọi trang chưa có dữ liệu sẽ bị báo nhầm là «dữ liệu bị hỏng» mà không ai hay.
  file: `apps/app/lib/lo-trinh/doc-trang.ts`
  severity: low
  Đề xuất: known-limits

- **The day length is written out again as a new literal instead of derived from one base unit**
  Người dùng thấy gì: Người xem không thấy khác biệt nào; đây chỉ là chuyện số ngày được ghi lặp ở thêm một chỗ trong mã, nên chi phí sửa không đáng với hậu quả.
  file: `apps/app/lib/lo-trinh/cau-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **Board view: the count line uses a status filter the board doesn't apply and doesn't show**
  Người dùng thấy gì: Ở cách xem «Bảng cột», dòng đếm «N việc» có thể không khớp với số việc đang thấy trên bảng, vì nó đếm theo một bộ lọc trạng thái mà màn này không hiện và không cho đổi.
  file: `apps/app/components/lo-trinh/trang-lo-trinh.tsx`
  severity: medium
  Đề xuất: known-limits

- **Board cards are remounted on every render, so keyboard focus is lost when a task sheet opens or closes**
  Người dùng thấy gì: Người dùng bàn phím, sau khi mở rồi đóng hồ sơ một việc ở «Bảng cột», bị mất chỗ đang đứng và phải tab lại từ đầu trang.
  file: `apps/app/components/lo-trinh/bang-cot.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (quét lớp nhưng chỉ soi vài vùng): chi-doc tuyên 'mọi button nằm trong danh sách cho phép' nhưng chỉ kiểm ba vùng**
  Người dùng thấy gì: Trang hiện không có nút sửa hay lưu nào, nhưng bài kiểm tự động chỉ soi một phần trang, nên nếu sau này ai thêm nút sửa vào đầu trang hay danh sách «Đã bác” thì bài kiểm không báo.
  file: `apps/app/test/lo-trinh.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận viết trước): số đếm cạnh lựa chọn lặp trên chính khoá do hàm cần kiểm trả về**
  Người dùng thấy gì: Bài kiểm số đếm cạnh các lựa chọn lọc có thể vẫn xanh dù có một lựa chọn bị thiếu hay không hiện số đếm, nên một lỗi như vậy sau này sẽ lọt qua mà không ai biết.
  file: `apps/app/test/lo-trinh.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (có mặt thay cho quan hệ): số ngày còn lại chỉ kiểm dấu, và ca DOM lấy chính soNgay làm đáp án**
  Người dùng thấy gì: Bài kiểm chưa chứng minh chắc rằng «còn n ngày» đúng từng ngày, nên nếu số ngày lệch một hai ngày thì bài kiểm vẫn xanh và người xem sẽ đọc nhầm hạn.
  file: `apps/app/test/lo-trinh-ngay.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (có mặt thay cho quan hệ): bốn ô của ngăn hồ sơ được kiểm bằng toContain trên toàn ngăn**
  Người dùng thấy gì: Bài kiểm chưa chắc bắt được trường hợp bốn ô Trạng thái, Mốc, Lộ trình, Nhóm trong hồ sơ việc bị đổi chỗ hay để trống, miễn là chữ đó còn xuất hiện đâu đó trong ngăn.
  file: `apps/app/test/lo-trinh.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ có assert âm, không đối chứng dương): bản dựng trên máy chủ chỉ kiểm 'không có'**
  Người dùng thấy gì: Bài kiểm xác nhận trang không lộ ngày trong lần dựng đầu, nhưng không chứng minh được là trang đã thật sự vẽ danh sách việc ở lần dựng đó.
  file: `apps/app/test/lo-trinh.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ có assert âm, không đối chứng dương): ô khong-dich-1280 xanh khi không khớp được chữ nào**
  Người dùng thấy gì: Phép đo chữ của kế hoạch có được đánh dấu không dịch hay chưa có thể báo đạt dù không tìm thấy câu nào để kiểm, nên chữ người nhập có thể bị trình duyệt tự dịch mà không ai biết.
  file: `_acceptance/trang-lo-trinh-trong-crm/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ có assert âm, không đối chứng dương): bang-375 'cột ẩn rộng 0' vẫn đạt khi không tìm thấy ô nào**
  Người dùng thấy gì: Trên điện thoại, phép đo cột Lộ trình và Trạng thái đã ẩn có thể báo đạt dù không tìm thấy cột nào để đo, nên một cột còn hiện ra làm chật màn có thể lọt qua.
  file: `_acceptance/trang-lo-trinh-trong-crm/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (có mặt thay cho quan hệ): thanh-cong-cu-1280 chỉ so phần giao của hai thanh nên có thể đúng hiển nhiên**
  Người dùng thấy gì: Phép đo xem thanh công cụ Lộ trình có giống Thoả thuận không chỉ so các nút mà hai bên cùng có, nên một nút bị thiếu hẳn ở Lộ trình vẫn có thể được báo là khớp.
  file: `_acceptance/trang-lo-trinh-trong-crm/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận chỉ có điểm): 'không còn -' với mọi D trong ma trận nhưng DOM chỉ dựng ở hai ngày**
  Người dùng thấy gì: Bài kiểm xem trang có hiện số ngày âm chỉ chạy ở hai ngày cố định, nên một ngày xem khác quanh các mốc có thể vẫn hiện số âm mà bài kiểm không thấy.
  file: `apps/app/test/lo-trinh.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
