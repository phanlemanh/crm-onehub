# Review findings: them-buoc-bao-dung (round 1)

## Trong hợp đồng

- **man.mjs đọc data-con-sot nhưng không kiểm, nên phần «và N việc quá hạn nữa» của E11 (AC-6, AC-7) không được đo**
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs:441`
  severity: medium
  AC: AC-6
  source: bugs
  detail: Trong doQuaHan, `doc.conSot` (giá trị data-con-sot) chỉ được in vào nhãn. Điều kiện đạt chỉ là `doc.tone === mong`. Ở nhánh tiến (Kiritimati), script còn gieo một việc quá hạn `Việc đo E6b`, đúng để dòng «nữa» hiện, nhưng không có khẳng định nào dùng tới việc đó. E11 trong evals.yaml lại hứa «dấu quá hạn của dòng bước và dòng «nữa» khớp ngày VN», và AC-6 đòi «thẻ không có dòng «và … nữa» cho nó». Hậu quả: một hồi quy ở conSot/dangHienQuaHan của dashboard-summary.tsx (ví dụ trừ số dòng quá hạn theo ngày địa phương) vẫn ra «dat» và thoát mã 0 ở cả hai khổ. Ô ui-check báo xanh cho đúng vế mà nó không đo.
  rationale: AC-6 đòi thẻ không có dòng 'và … nữa' cho bước đó, nhưng phép đo màn thật chỉ kiểm dấu quá hạn, nên vế này của AC-6 không được chứng minh.

- **Hình dạng 3: ui-check E11 hứa dòng «và N việc quá hạn nữa» có hay vắng đúng AC-6/AC-7, nhưng phán quyết chỉ kiểm tone**
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs:444`
  severity: medium
  AC: AC-7
  source: measurement
  detail: Ở doQuaHan, `kiem(\`qua-han-con-sot-${kho}\`, …, doc.tone === mong)` chỉ so dấu quá hạn của dòng bước. doc.conSot đọc được nhưng chỉ in ra nhãn, không vào kết luận. Trong khi đó expected của E11 (evals.yaml) và bước ST-qua-han-con-sot đòi «dòng «và N việc quá hạn nữa» có hay vắng đúng như AC-6 (lùi) hoặc AC-7 (tiến)» và «dòng «nữa» khớp ngày VN». Vậy nửa lời hứa về con-sot, tức quan hệ data-con-sot = quaHan.viec+quaHan.buoc − số dòng đang hiện quá hạn, không được đo ở màn thật. Thêm nữa, việc gieo «Việc đo E6b» (hạn 2 ngày trước) nằm ngay trong overdueTasks đang hiện, nên ca tiến không sinh được dòng «nữa» như AC-7 tả. Màn có in con-sot sai thì E11 vẫn ra 'dat'.
  rationale: AC-7 đòi thẻ ghi 'và 1 việc quá hạn nữa' ở múi giờ tiến, nhưng phép đo màn thật không kiểm dòng này và ca gieo không tạo ra đúng tình huống AC-7 tả.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A second copy of the Vietnam-day rule, separate from the one the server counts with**
  Người dùng thấy gì: Quy tắc 'hôm nay là ngày nào theo giờ Việt Nam' đang được viết ở hai nơi. Hiện hai nơi cho cùng kết quả, nhưng sau này nếu ai sửa một nơi mà quên nơi kia thì số việc quá hạn trên màn hình và ở máy chủ có thể lệch nhau.
  file: `packages/validation/src/ngay-vn.ts`
  severity: low
  Đề xuất: known-limits

- **The record sheet still marks steps overdue by the browser's day, while Overview now uses the Vietnam day**
  Người dùng thấy gì: Khi mở một bản ghi, dấu 'quá hạn' của từng bước vẫn tính theo ngày của máy người xem, trong khi Tổng quan đã tính theo ngày Việt Nam. Người ở múi giờ khác, nhất là quanh nửa đêm Việt Nam, có thể thấy cùng một bước là quá hạn ở Tổng quan nhưng không quá hạn khi mở bản ghi.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: low
  Đề xuất: new-contract

- **Danh sách phòng ban đã tải mà lần refetch nền lỗi thì form giấu ô chọn nhưng vẫn gửi phòng ban đã chọn trước đó, nút «Thêm» không khoá**
  Người dùng thấy gì: Nếu danh sách phòng ban đã tải được rồi nhưng lần làm mới ngầm sau đó bị lỗi mạng, form hiện thông báo lỗi và ẩn ô chọn, nhưng nút 'Thêm' vẫn bấm được và vẫn lưu vào phòng ban đã chọn trước đó mà người dùng không còn thấy.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: low
  Đề xuất: known-limits

- **Ô them-buoc-thu-lai-xong in «khong chan them» và hứa không cuộn ngang nhưng không kiểm cả hai**
  Người dùng thấy gì: Phép kiểm màn hình sau khi bấm thử lại có thể báo đạt dù trang bị tràn ngang hoặc việc thêm bước bị chặn, vì hai điều đó chỉ được in ra chứ không được dùng để quyết định đạt hay không.
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: assert «chuỗi có mặt» toContain("1") cho mô tả thẻ, trong khi lời hứa là mô tả phải phản ánh đúng số quá hạn**
  Người dùng thấy gì: Dòng mô tả dưới thẻ việc ở Tổng quan có thể ghi sai số việc quá hạn mà bài kiểm vẫn không phát hiện, nên một lỗi đếm sai ở chữ này có thể lọt qua.
  file: `apps/app/test/them-buoc-bao-dung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: ma trận E10 hứa «trang không cuộn ngang» ở mọi trạng thái, nhưng ô thử-lại-xong không kiểm**
  Người dùng thấy gì: Sau khi bấm thử lại và tải thành công, phép kiểm màn hình không xem trang có bị tràn ngang trên màn điện thoại hay không, nên lỗi bố cục kiểu này ở trạng thái đó có thể lọt qua.
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
