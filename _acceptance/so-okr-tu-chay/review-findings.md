## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **okrDocSheet skips the shared enqueue() helper, so a key result can pile up duplicate Sheets-read tasks**
  Người dùng thấy gì: Bấm 'Đọc lại' hoặc lưu lại nguồn Google Sheets nhiều lần liên tiếp cho cùng một KR có thể xếp thêm nhiều việc đọc trùng nhau, làm tốn thêm lượt gọi Google không cần thiết.
  file: `apps/api/src/agent/agent-trigger.service.ts`
  severity: medium
  Đề xuất: known-limits

- **xepDocSheet logs the error name only and drops the stack, against the docs/api.md logging rule**
  Người dùng thấy gì: Khi việc đọc Google Sheets thất bại vì lỗi hệ thống, nhật ký chỉ ghi lại tên loại lỗi mà thiếu chi tiết để lần vết — đội vận hành có thể mất nhiều thời gian hơn để tìm nguyên nhân khi có sự cố.
  file: `apps/api/src/okr/okr-so.service.ts`
  severity: low
  Đề xuất: known-limits

- **The banGhiDong output schema is written a second time by hand next to the BanGhiDong type in @crm/db**
  Người dùng thấy gì: Nếu sau này có người thêm một loại bản ghi mới vào danh mục chỉ số nhưng quên cập nhật đủ các nơi liên quan, màn xem danh sách bản ghi đằng sau con số có thể báo lỗi hệ thống thay vì hiển thị đúng dữ liệu.
  file: `apps/api/src/okr/okr-so.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **KR dialog saves the kind change before the source change, so switching away from a CRM source and to milestone/percent in one save always fails**
  Người dùng thấy gì: Khi đổi một KR đang lấy số từ CRM sang loại chấm theo mốc hoặc phần trăm cùng lúc với đổi nguồn số trong một lần lưu, việc lưu sẽ báo lỗi và không lưu được gì cả — người dùng phải bấm lưu thêm một lần nữa mới xong.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Retry after a Sheets 401 can never succeed: the refresh uses up the last attempt**
  Người dùng thấy gì: Nếu khoá kết nối tới Google Sheets bị đổi hay hết hạn, lần đọc số kế tiếp luôn báo lỗi dù hệ thống vừa lấy được khoá mới thành công — người dùng phải bấm 'Đọc lại' thêm một lần nữa mới thấy số đúng.
  file: `apps/agent/agent/lib/okr-sheets.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bài 'nhịp dispatch thật' chỉ grep mã nguồn schedules/dispatch.ts, không chạy nhịp**
  Người dùng thấy gì: Bài kiểm cho việc chụp số OKR hằng ngày không thật sự chạy thử nhịp, chỉ đọc chữ trong mã nguồn — nếu việc chụp số ngừng chạy thật ngoài đời, hệ thống kiểm tra vẫn có thể báo 'đạt' và không ai biết số đã ngừng cập nhật.
  file: `apps/agent/test/okr-chup.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt thay vì quan hệ): ghi số qua khoá API chỉ đếm dòng nguon=api, không ghim tacGiaUserId bằng chủ khoá**
  Người dùng thấy gì: Bài kiểm ghi số qua khoá API chỉ đếm số dòng được tạo mà không kiểm ai đứng tên là người ghi; nếu có lỗi gán nhầm người ghi số, việc kiểm tra hiện tại có thể không phát hiện ra.
  file: `apps/api/test/okr-khoa-api.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): bẫy googleapis.com của API chỉ khẳng định 'không bị gọi', không có đối chứng dương cho thấy bẫy bắt được lời gọi**
  Người dùng thấy gì: Bài kiểm 'API không được gọi Google' chưa chứng minh được bẫy chặn có bắt được lời gọi thật; nếu sau này có đường gọi Google khác lọt qua bẫy, dữ liệu có thể vô tình gửi ra ngoài mà không ai phát hiện qua bài kiểm này.
  file: `apps/api/test/okr-nguon.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (ghim thông điệp vào chính hằng số của mã): ca pham-vi-so ghim câu FORBIDDEN bằng OKR.thongDiep thay vì chữ viết trước**
  Người dùng thấy gì: Câu thông báo từ chối cho vai 'chỉ OKR' được bài kiểm so sánh với chính câu chữ lấy từ mã nguồn, nên nếu câu đó vô tình bị sửa sai hay để trống, bài kiểm vẫn báo đạt mà người dùng vẫn nhận thông báo sai.
  file: `apps/api/test/vai-chi-okr.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
