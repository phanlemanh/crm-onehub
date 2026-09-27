## Trong hợp đồng

Không có finding nào khớp AC trong vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **approval.ts reads the session purpose by hand instead of using purposeOf/attribute**
  Người dùng thấy gì: Nếu thuộc tính vai trò của một lượt chạy nền bị bỏ trống hoặc thừa khoảng trắng, hệ thống có thể vô tình mở lại đúng lỗi treo (chờ người duyệt trong một phiên không ai ngồi) mà bản vá này được làm ra để đóng.
  file: `apps/agent/agent/lib/approval.ts`
  severity: medium
  Đề xuất: known-limits

- **The Slack recipient check re-implements slack-people's users.list reader and drops its error mapping**
  Người dùng thấy gì: Khi kết nối Slack của công ty bị thu hồi hoặc mất quyền, người dùng sẽ chỉ thấy thông báo 'bị từ chối' chung chung thay vì được hướng dẫn kết nối lại Slack.
  file: `apps/agent/agent/lib/slack-nguoi-nhan.ts`
  severity: low
  Đề xuất: known-limits

- **The recipient check skips the repo's ratelimited retry and ignores the run's abortSignal**
  Người dùng thấy gì: Khi nhiều lượt đăng Slack cùng lúc, Slack có thể tạm chặn và một bài đăng hợp lệ bị từ chối oan thay vì được thử lại; hủy một lượt giữa chừng cũng không dừng việc tải danh sách người ở kênh ngay lập tức.
  file: `apps/agent/agent/lib/slack-nguoi-nhan.ts`
  severity: low
  Đề xuất: known-limits

- **The recipient check silently lets messages through when the Slack connection lacks the users:read.email scope**
  Người dùng thấy gì: Nếu kết nối Slack của công ty thiếu đúng quyền đọc email, người mang vai 'chỉ OKR' có thể vẫn nhận được dữ liệu đối tác qua Slack mà không có cảnh báo hay lỗi nào hiện ra.
  file: `apps/agent/agent/lib/slack-nguoi-nhan.ts`
  severity: medium
  Đề xuất: new-contract

- **The before-fix/after-fix script and the fork-change script both fail permanently once the branch is merged into onehub**
  Người dùng thấy gì: Sau khi nhánh này được gộp, các phép đo tự động dùng để chứng minh lỗi cũ đã sửa sẽ tự báo đỏ vĩnh viễn dù mã vẫn đúng, vì phép đo tự dời mốc so sánh theo thời gian thay vì đứng yên.
  file: `_acceptance/ro-slack-tac-nhan/rang/cho-re.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ khẳng định âm, không có đối chứng dương): phép kiểm «không lộ email/tên» phân biệt hoa thường và bỏ sót mọi định danh phía Slack**
  Người dùng thấy gì: Phép kiểm hiện tại không thật sự bắt được trường hợp email hay tên người dùng bị lộ ra dưới dạng viết hoa hoặc lấy từ phía Slack, nên một lỗi lộ thông tin kiểu đó có thể lọt qua mà không ai phát hiện.
  file: `apps/agent/test/ro-slack-tac-nhan.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn/đầu vào thay vì đầu ra): phép kiểm «không có next_cursor ở cấp ngoài cùng» chỉ soi dữ liệu giả khai trong bài, không soi bản trả lời thật**
  Người dùng thấy gì: Phép kiểm về dữ liệu phân trang giả hiện chỉ soi dữ liệu đầu vào của bài kiểm, không soi câu trả lời thật mà hệ thống nhận về, nên không chắc bắt được lỗi thật nếu có.
  file: `apps/agent/test/ro-slack-tac-nhan.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định «chuỗi có mặt» cho một lời hứa về số lượng): số người bị chặn chỉ được đo bằng toContain("1")**
  Người dùng thấy gì: Phép kiểm số người bị chặn chỉ tìm chữ số '1' xuất hiện ở bất kỳ đâu trong thông báo, nên không đảm bảo chắc chắn con số hiển thị cho người dùng luôn đúng.
  file: `apps/agent/test/ro-slack-tac-nhan.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
