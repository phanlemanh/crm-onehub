## Trong hợp đồng

- **Hình dạng 4 (assertion âm tính một mình): ca gy-lm-roi qua menu chỉ khẳng định thẻ vắng, không có đối chứng dương sau thao tác và không có cặp đột biến**
  file:line: `apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx:250`
  severity: medium
  AC: AC-5
  source: measurement
  detail: Sau `await chonTrenMenu(THANG.label, MO.label)` (dòng 250), ca này chỉ kiểm `choToi(() => the() === null)` rồi `expect(the()).toBeNull()` (dòng 251–253). Không có kiểm nào rằng deals.setStage được gọi với {id:'d-1', stage:'mo'}, và không kiểm `sheet()` còn đúng phần tử cũ. Ca E1 và E2 có hai kiểm đó ở dòng 199–207 và 222–228. Vì vậy thẻ vắng mặt cũng thoả khi menu làm sheet sập (error boundary), khi sheet đóng hay bị gỡ, hoặc khi bộ chọn trúng phần tử khác: điều kiện `the() === null` đúng mà không cần lần đọc lại goiYCuaDeal nào. Ca stepper cùng describe (dòng 239–242) có cùng khuôn âm tính, nhưng được cặp đột biến (b) trong dot-bien.mjs che. Đường menu thì không có cặp nào trong CAP của dot-bien.mjs (dòng 26–62 chỉ có GY.stepper, GY.roi chạy cả hai ca dưới -t gy-lm-roi, nhưng thông điệp ghim chỉ là 'the con sau khi roi thang stepper'). Màu xanh của nhánh menu vì thế không có bằng chứng là không rỗng.

- **Hình dạng 4 (assertion âm tính một mình): chiều 'mất' của E6 chỉ đo thẻ vắng mặt, không có lượt tự thử chiều đỏ, và đối chứng isConnected không phân biệt sheet đang mở với sheet đang đóng**
  file:line: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs:186`
  severity: medium
  AC: AC-6
  source: measurement
  detail: Dòng 186–191 coi thẻ đã mất khi `document.querySelector(THE) === null`. Lượt tự thử chiều đỏ (bước 0, dòng 140–162) chỉ chặn goiYCuaDeal cho chiều 'hiện sau thắng'. Chiều 'ẩn sau rời thắng' không có lượt nào chứng minh thước báo KHONG DAT khi lần đọc lại bị chặn, dù AC-6 đòi thước đỏ khi 'mọi lần đọc lại goiYCuaDeal' bị chặn. Đối chứng dương duy nhất của bước này là `sheet.evaluate(e => e?.isConnected === true)` (dòng 193). Một sheet Radix đang chạy hiệu ứng đóng vẫn còn gắn vào document, nên kiểm này không chứng minh được 'thẻ mất khỏi sheet đang mở'. Ảnh bằng chứng E6-step2.png cho thấy sheet lệch phải và bị cắt mép, lớp phủ đã nhạt so với E6-step1.png, và evidence-report.md tự ghi 'nhiều khả năng đang giữa chuyển động'. Như vậy kiểm âm tính `=== null` đứng một mình, không có phép đo trạng thái mở (ví dụ data-state=open) hay lượt đỏ đi kèm.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **choTrong nuốt mọi lỗi của waitForFunction, nên lượt tự thử chiều đỏ của E6 có thể đạt sai**
  Người dùng thấy gì: Trong một số trường hợp hiếm (trang sập hoặc tải lại giữa lúc đo), phép tự thử của bàn đo có thể báo là đã bắt được lỗi trong khi thật ra nó chưa kiểm được gì. Tính năng gợi ý kế hoạch cho người dùng không bị ảnh hưởng; chỉ độ tin cậy của một lần đo thử giảm.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đường dẫn hardcode ROOT): s4-args.json đã commit ghim repoRoot và contractPath vào worktree charming-kalam-8e7593, nay là cây của nhánh khác**
  Người dùng thấy gì: Nếu ai chạy lại phép chấm bằng tệp cấu hình cũ đã lưu, nó sẽ đo nhầm một bản làm việc của nhánh khác mà kết quả vẫn hiện bình thường. Người dùng cuối không bị ảnh hưởng; đã có bản cấu hình mới sửa đúng đường dẫn.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/s4-args.json`
  severity: medium
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
