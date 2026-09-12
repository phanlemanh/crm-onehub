## Trong hợp đồng

(không có — chưa có phát hiện nào ánh xạ được vào AC ở round này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Toàn bộ bộ đo của vòng này vẫn xanh khi hook bị vô hiệu hoá thành no-op**
  Người dùng thấy gì: Nếu phần khoá chặn gọi lặp bị hỏng hoàn toàn khi lên môi trường thật, bộ kiểm tra hiện tại của vòng này sẽ không phát hiện ra. Người dùng có thể gặp lại đúng kiểu sự cố agent gọi lặp vô hạn như từng xảy ra trước đây mà không có cảnh báo nào báo trước.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Phép đo gác dựa vào nguyên văn câu lỗi nội bộ của eve, ngoài phần eve có tài liệu**
  Người dùng thấy gì: Cơ chế chặn gọi lặp dựa vào một câu thông báo lỗi nội bộ của thư viện bên thứ ba mà thư viện đó không cam kết giữ nguyên. Nếu thư viện đổi câu chữ này trong một bản cập nhật sau, hàng loạt phép kiểm tra có thể báo lỗi giả dù tính năng vẫn hoạt động đúng.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Chốt cứng duy nhất so chuỗi trên kiểu tự viết tay đã nới rộng, không dùng union công khai của eve**
  Người dùng thấy gì: Phần mô tả hình dạng một lời gọi tạo agent trong mã sản phẩm được viết tay lỏng hơn thực tế cần có. Nếu thư viện agent nền tảng đổi cách đặt tên nội bộ trong một bản cập nhật sau, phần chặn gọi lặp có thể âm thầm ngừng hoạt động mà không có lỗi biên dịch nào báo trước.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: medium
  Đề xuất: known-limits

- **An eve step retry inside the same turn now hard-fails the whole turn — and after this diff it does so on ordinary builder chat turns, not just creation turns**
  Người dùng thấy gì: Khi hệ thống tự động thử lại một bước bị gián đoạn (do lỗi mạng, quá giờ, hoặc lỗi tạm thời của mô hình) trong cùng một lượt trò chuyện, tính năng chặn gọi lặp có thể hiểu nhầm lần thử lại đó là một lần gọi trùng và chặn đứt lượt trò chuyện đó vĩnh viễn — người dùng thấy lượt bị báo lỗi và không có cách nào tự khôi phục, kể cả ở những lượt trò chuyện bình thường không liên quan đến việc tạo agent mới.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: high
  Đề xuất: new-contract

- **The new spec cannot detect a dead hook: neutering the hook body leaves all 415 agent tests green**
  Người dùng thấy gì: Nếu phần khoá chặn gọi lặp bị hỏng hoàn toàn khi lên môi trường thật, toàn bộ bộ kiểm tra của tính năng này (kể cả các phần liên quan khác) vẫn sẽ báo xanh như bình thường. Người dùng có thể gặp lại đúng kiểu sự cố agent gọi lặp vô hạn mà không có cảnh báo nào báo trước.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 1 — đo tín hiệu môi trường ("No active eve context") thay vì đầu ra của hook**
  Người dùng thấy gì: Một số phép kiểm tra chỉ xác nhận rằng đoạn mã có chạy tới một điểm nhất định, chứ không xác nhận kết quả cuối cùng thực sự đúng ở tình huống đó. Vì vậy màu xanh của các phép kiểm tra này có thể không phản ánh chính xác liệu tính năng có hoạt động đúng trong đúng tình huống được nêu tên hay không.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 4 — assertion âm-tính-một-mình: .not.toThrow() không đọc trạng thái trả về**
  Người dùng thấy gì: Một trong các phép kiểm tra chỉ xác nhận rằng thao tác không báo lỗi, mà không xác nhận thao tác đó có thực sự ghi lại đúng thông tin hay không. Nếu chức năng ghi nhận âm thầm bỏ sót ở đúng tình huống này, phép kiểm tra đó vẫn sẽ báo xanh như bình thường.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).