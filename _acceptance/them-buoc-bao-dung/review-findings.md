# Review findings: them-buoc-bao-dung (round 2)

## Trong hợp đồng

- **In the tiến branch (AC-7), the screen check never observes the «và 1 việc quá hạn nữa» line, and the zero clamp hides an over-count regression**
  AC: AC-7
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs:366`
  severity: medium
  source: bugs
  detail: The fix in e175546b7 adds conSotMong(), which computes the expected value as mong = max(0, tong - idViec.length - buocHienQuaHan) from the rows already on screen. It does not check what AC-7 promises.

  AC-7 (contract.md:36) needs an overdue task that falls *outside* the list, and requires the card to read «và 1 việc quá hạn nữa». doQuaHan instead seeds one task `Việc đo E6b` with dueAt = 2 days before today VN (line 421). overdueTasks takes 10 rows ordered by dueAt asc (dashboard.service.ts:162), so this task is inside the list. The round-1 evidence confirms it: 'Việc đo E6b' is one of the 5 rows shown. So in the Pacific/Kiritimati branch tong equals the number of rows shown, mong = 0, and the eval accepts the line being absent. The «và 1 … nữa» line that AC-7 requires is never asserted.

  This also creates a blind spot. Take an app that wrongly counts today's step as overdue in dangHienQuaHan (local time zone ahead of VN). Its conSot = max(0, tong - (shown+1)) = 0, the same as mong = 0, so the check still prints 'dat'. The Math.max(0, …) clamp exists in both the app and the expected value, so the error is invisible. The only guard left is the tone of the step row. The eval's step text ('dòng «nữa» có hay vắng đúng như … AC-7 (tiến)') is therefore not met: the expected value mirrors the app's own formula on the same data instead of requiring N = 1.

  Fix: in the tiến branch, seed the extra overdue task so it falls outside overdueTasks (e.g. enough older overdue tasks to fill take 10, or a dueAt that sorts after the 10th row). Then assert conSot === 1 explicitly, as AC-7 states, and keep the computed value only for the lùi branch.

- **Hình dạng 4 (âm tính một mình): khẳng định con-sot mới của E11 chỉ đo được trường hợp «không có dòng nữa», chưa lần nào đo trường hợp dòng đó phải hiện**
  AC: AC-7
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs:477`
  severity: medium
  source: measurement
  detail: Bản sửa vòng 1 thêm `const conSot = Number(doc.conSot ?? 0)` và điều kiện `conSot === sot.mong` (dòng 477–481), với `sot.mong = max(0, tong - idViec.length - buocHienQuaHan)` (dòng 388–391). Có hai chỗ hỏng. (1) `?? 0` gộp hai thứ khác nhau làm một: chân thẻ `[data-con-sot]` không có mặt, và chân thẻ ghi 0. (2) Dữ liệu gieo không bao giờ cho `mong` lớn hơn 0. Việc «Việc đo E6b» (hạn 2 ngày trước, dòng 421–428) nằm trong overdueTasks đang hiện, vì dashboard.service.ts lấy tới `take: 10`, mà bộ mẫu của ada chỉ có 3 việc quá hạn. Bước gieo thì nằm trong mySteps đang hiện. Vậy `tong` luôn bằng số dòng đang hiện, và `mong = 0` ở cả nhánh lùi (Pago_Pago) lẫn nhánh tiến (Kiritimati). Ảnh trong evidence-report khớp điều này: «5 việc quá hạn», 5 dòng, không có dòng «nữa». Hệ quả: nếu CardFooter `data-con-sot` của dashboard-summary.tsx bị xoá hẳn hay không bao giờ hiện, ô `qua-han-con-sot-*` vẫn ra DUNG. Như vậy phép đo không có đối chứng dương cho vế AC-7 mà evals.yaml E11 hứa («VN từ 17:00 → Kiritimati … một việc quá hạn khác … dòng «và N việc quá hạn nữa» có … đúng như AC-7»). Script cũng không có chốt nào đòi `sot.mong > 0` ở nhánh tiến, hay đòi `doc.conSot !== null` khi trường hợp đó xảy ra. Đây là đúng điều vòng 1 đã nêu («ca tiến không sinh được dòng «nữa» như AC-7 tả»). Bản sửa chỉ đưa con-sot vào phán quyết, chứ không dựng được trạng thái mà ở đó dòng «nữa» bắt buộc phải hiện.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A second copy of the Vietnam-day rule, separate from the one the server counts with (r1)**
  Người dùng thấy gì: Quy tắc 'hôm nay là ngày nào theo giờ Việt Nam' đang được viết ở hai nơi. Hiện hai nơi cho cùng kết quả, nhưng sau này nếu ai sửa một nơi mà quên nơi kia thì số việc quá hạn trên màn hình và ở máy chủ có thể lệch nhau.
  file: `packages/validation/src/ngay-vn.ts`
  severity: low
  Đề xuất: known-limits

- **The record sheet still marks steps overdue by the browser's day, while Overview now uses the Vietnam day (r1)**
  Người dùng thấy gì: Khi mở một bản ghi, dấu 'quá hạn' của từng bước vẫn tính theo ngày của máy người xem, trong khi Tổng quan đã tính theo ngày Việt Nam. Người ở múi giờ khác, nhất là quanh nửa đêm Việt Nam, có thể thấy cùng một bước là quá hạn ở Tổng quan nhưng không quá hạn khi mở bản ghi.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: low
  Đề xuất: new-contract

- **Danh sách phòng ban đã tải mà lần refetch nền lỗi thì form giấu ô chọn nhưng vẫn gửi phòng ban đã chọn trước đó, nút «Thêm» không khoá (r1)**
  Người dùng thấy gì: Nếu danh sách phòng ban đã tải được rồi nhưng lần làm mới ngầm sau đó bị lỗi mạng, form hiện thông báo lỗi và ẩn ô chọn, nhưng nút 'Thêm' vẫn bấm được và vẫn lưu vào phòng ban đã chọn trước đó mà người dùng không còn thấy.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: low
  Đề xuất: known-limits

- **Ô them-buoc-thu-lai-xong in «khong chan them» và hứa không cuộn ngang nhưng không kiểm cả hai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm màn hình sau khi bấm thử lại có thể báo đạt dù trang bị tràn ngang hoặc việc thêm bước bị chặn, vì hai điều đó chỉ được in ra chứ không được dùng để quyết định đạt hay không.
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: assert «chuỗi có mặt» toContain("1") cho mô tả thẻ, trong khi lời hứa là mô tả phải phản ánh đúng số quá hạn (r1)**
  Người dùng thấy gì: Dòng mô tả dưới thẻ việc ở Tổng quan có thể ghi sai số việc quá hạn mà bài kiểm vẫn không phát hiện, nên một lỗi đếm sai ở chữ này có thể lọt qua.
  file: `apps/app/test/them-buoc-bao-dung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: ma trận E10 hứa «trang không cuộn ngang» ở mọi trạng thái, nhưng ô thử-lại-xong không kiểm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi bấm thử lại và tải thành công, phép kiểm màn hình không xem trang có bị tràn ngang trên màn điện thoại hay không, nên lỗi bố cục kiểu này ở trạng thái đó có thể lọt qua.
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
