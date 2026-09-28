## Trong hợp đồng

(không có phát hiện nào map được vào AC ở round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **PR description says no vendor file was changed, but it lists an edit to docs/agent.md, which is a vendor file**
  Người dùng thấy gì: Bản mô tả sẽ dùng để đăng công khai có một câu dễ gây hiểu lầm: nói không tài liệu nào của hãng bị đổi, trong khi thật ra có một tài liệu của hãng đã được chỉnh trong phần ghi chú riêng của bản rẽ.
  file: `_acceptance/slack-thieu-quyen-email/mo-ta-pr.md`
  severity: low
  Đề xuất: known-limits

- **Shape 1 (measures the instruction, not the output): E11 grades the draft PR description, and nothing makes the real PR body match it**
  Người dùng thấy gì: Bản mô tả PR đã được chấm đạt có thể không phải là nội dung thật sự được đăng công khai sau này, nên không có gì bảo đảm PR thật khi mở ra sẽ giữ đúng lời văn đã được duyệt kỹ để không lộ chi tiết lỗ hổng.
  file: `_acceptance/slack-thieu-quyen-email/evals.yaml`
  severity: medium
  Đề xuất: new-contract

- **Hướng dẫn gỡ chỗ rẽ trong docs/agent.md chưa nhắc tệp kiểm mới (r1)**
  Người dùng thấy gì: Hướng dẫn dọn dẹp cho lần sau có thể thiếu một bước, khiến người dọn dẹp bỏ sót một phần và gây lỗi kiểm tra khó hiểu về sau.
  file: `docs/agent.md`
  severity: low
  Đề xuất: known-limits

- **Một dòng trong mục chỗ rẽ không ngắt dòng như phần còn lại (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ một đoạn ghi chú nội bộ trình bày dài hơn phần còn lại, có thể hơi khó đọc khi so sánh các lần sửa sau này.
  file: `docs/agent.md`
  severity: low
  Đề xuất: wont-fix

- **The upstream-file guard passes silently when origin/release cannot be read (r1)**
  Người dùng thấy gì: Nếu môi trường chấm thiếu dữ liệu tham chiếu cần thiết, bước kiểm 'không đụng vào phần của hãng' có thể báo đạt dù thực chất chưa kiểm được gì, khiến một thay đổi ngoài phạm vi lọt qua mà không ai nhận ra.
  file: `_acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương trong cùng lượt): tập 'tệp của hãng bị sửa' rỗng có thể do nguồn tra hỏng (r1)**
  Người dùng thấy gì: Kết luận 'không đụng vào phần của hãng' có thể đúng một cách giả tạo khi công cụ đo không đọc được dữ liệu cần so sánh, khiến người duyệt tin nhầm là an toàn dù chưa có gì được kiểm thật.
  file: `_acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
