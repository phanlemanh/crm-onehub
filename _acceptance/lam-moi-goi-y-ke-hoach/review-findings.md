## Trong hợp đồng

- **Lượt tự thử chiều ẩn (chiều đỏ duy nhất còn lại của AC-6) có đúng cái lỗ đã bị thu phạm vi ở chiều hiện**
  AC: AC-6
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs:189`
  severity: medium
  source: bugs
  detail: Known limits trong contract.md (dòng 68-73) và tệp hạt giống ghi rằng lượt tự thử chiều ẩn «không có lỗ này vì nó đợi thẻ hiện rồi mới treo». Nhưng sau `treoDocGoiY(u.t)` và `bamCot(u.t, gd.mo.label)` thì không có mốc dương nào cho thấy cú bấm Đang mở đã tới máy chủ: không đọc lại deal qua API, không kiểm cột Đang mở đang chọn, không kiểm setStage đã chạy. `bamCot` chỉ `nut.click()`. Nếu nút còn `disabled={setStage.isPending}` (stage-stepper.tsx:53, vì onSuccess của cú thắng trước còn đang chờ `cache.deal`; ngay sau khi thẻ hiện, bài đo bấm luôn, không chờ như `chupKhung` ở lượt thật), hay cú bấm trượt, thì thẻ vẫn ở đó, `mat.dung=false`, và dòng «E6 tu thu an: luot chan doc lai bao KHONG DAT» vẫn in ra y hệt. Cộng thêm việc `httpBatchLink` gom lần đọc deal vào cùng yêu cầu bị treo, chiều ẩn cũng không phân biệt được «thước bắt được thẻ cũ» với «cú bấm không có tác dụng». Hồ sơ vẫn kể lượt này là bằng chứng chiều đỏ của AC-6, nên câu trong Known limits là nói quá.

- **Hình dạng 4 (kiểm âm tính đứng một mình): lượt tự thử chiều «ẩn» của E6 không có mỏ neo dương rằng cú bấm cột Đang mở đã tới máy chủ**
  AC: AC-6
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs:189`
  severity: medium
  source: measurement
  detail: Dòng 189–206: treoDocGoiY(u.t) → bamCot(u.t, gd.mo.label) → choTrong(querySelector(THE) === null, 5s). Khi mat.dung=false, script in luôn «E6 an sau roi thang: KHONG DAT» và «E6 tu thu an: luot chan doc lai bao KHONG DAT», rồi d.dat(0, baoDo && baoDoAn). Mỏ neo dòng 187–188 (thẻ đã hiện) chỉ chứng điều kiện trước. Sau cú bấm cột Mở thì không có kiểm dương nào: không đọc lại deal qua d.hoi(P.cookie, 'deals.byId') để thấy stage đã về OPEN trên máy chủ, cũng không chờ phản hồi deals.setStage. bamCot chỉ ném lỗi khi không tìm thấy nút. Nó không ném khi cú click không có tác dụng, ví dụ nút còn disabled={setStage.isPending} (stage-stepper.tsx:53, onSuccess vẫn đang await cache.deal của cú bấm thắng), hoặc setStage hỏng. Thêm nữa, bộ giữ treo ở dòng 98 treo luôn cả URL batch chứa deals.byId, nên mọi lối không gỡ thẻ đều in đúng dòng KHONG DAT ấy. Đây là đúng khuyết tật mà Known limits của contract.md đã thừa nhận cho chiều «hiện». review-findings.md lại ghi chiều «ẩn» là «có mỏ neo dương», nhưng mỏ neo đó chỉ đứng trước cú bấm. Sau khi thu phạm vi, vế «thước màn phải đỏ khi trang giữ treo mọi lần đọc lại goiYCuaDeal sau khi thẻ đã hiện rồi P bấm cột Đang mở» của AC-6 chỉ còn dựa vào lượt này. Vì thế dòng tự thử chưa phân biệt được «thước nhạy với lần đọc lại gợi ý» với «hành động rời thắng chưa xảy ra».

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Rang scripts mới thêm chú thích, trái luật «Never add code comments»**
  Người dùng thấy gì: Vài tệp phục vụ kiểm tra nghiệm thu có thêm dòng ghi chú trong mã, trái quy ước của kho. Người dùng cuối không thấy ảnh hưởng gì, chỉ là lệch nếp viết mã nội bộ.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs`
  severity: low
  Đề xuất: wont-fix

- **choTrong nuốt mọi lỗi của waitForFunction, nên lượt tự thử chiều đỏ ghi «đạt» cả khi trang hỏng**
  Người dùng thấy gì: Khi trang bị hỏng hoặc đứng lúc đang kiểm tra, bài tự thử của bộ nghiệm thu có thể vẫn ghi là đạt. Việc này chỉ làm bằng chứng kiểm tra kém chắc chắn hơn, không đổi cách thẻ gợi ý hoạt động với người dùng.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
