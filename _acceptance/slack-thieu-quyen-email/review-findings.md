## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): phép đo đỏ-trước chỉ ghim lý do đỏ chung cho cả lượt, không ghim cho ca stqe-tin-rieng**
  file: `_acceptance/slack-thieu-quyen-email/rang/do-truoc-khi-va.mjs:75`
  severity: medium
  AC: AC-9
  Dòng 75-82: với mỗi ca ghim, script chỉ đòi regex `\(fail\)[^\n]*<ca>`; còn điều kiện 'tin đã đi ra' (`truoc.out.includes("chat.postMessage=1")`) kiểm MỘT LẦN trên toàn bộ đầu ra. Chuỗi `chat.postMessage=1` chỉ do `chuaDang()` in ra, tức chỉ ca stqe-kenh sinh ra nó; ca stqe-tin-rieng đỏ qua `toEqual({open:0,post:0})` nên in bảng so khác, không bao giờ có chuỗi đó. Vì vậy nếu trên mã trước vá stqe-tin-rieng đỏ vì một lý do khác rò rỉ (lỗi gieo DB, hết giờ, lỗi phân tích manifest), script vẫn báo 'đỏ trước vá' cho nó. Lời hứa E9 là cả hai ca đỏ VÌ tin đã đi ra; phần của stqe-tin-rieng chỉ là 'có (fail)', không có thông điệp ghim. Chặn 'Cannot find module' chỉ loại được một lý do đỏ sai. Rationale: AC-9 nêu đích danh cả hai ca của AC-1 và AC-2 phải đỏ vì lý do cụ thể là 'tin đã đi ra', nhưng phép đo chỉ xác nhận điều này cho ca của AC-1, không cho ca của AC-2 (stqe-tin-rieng) như hợp đồng đòi hỏi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hướng dẫn gỡ chỗ rẽ trong docs/agent.md chưa nhắc tệp kiểm mới**
  Người dùng thấy gì: Hướng dẫn dọn dẹp cho lần sau có thể thiếu một bước, khiến người dọn dẹp bỏ sót một phần và gây lỗi kiểm tra khó hiểu về sau.
  file: `docs/agent.md`
  severity: low
  Đề xuất: known-limits

- **Một dòng trong mục chỗ rẽ không ngắt dòng như phần còn lại**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ một đoạn ghi chú nội bộ trình bày dài hơn phần còn lại, có thể hơi khó đọc khi so sánh các lần sửa sau này.
  file: `docs/agent.md`
  severity: low
  Đề xuất: wont-fix

- **The upstream-file guard passes silently when origin/release cannot be read**
  Người dùng thấy gì: Nếu môi trường chấm thiếu dữ liệu tham chiếu cần thiết, bước kiểm 'không đụng vào phần của hãng' có thể báo đạt dù thực chất chưa kiểm được gì, khiến một thay đổi ngoài phạm vi lọt qua mà không ai nhận ra.
  file: `_acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương trong cùng lượt): tập 'tệp của hãng bị sửa' rỗng có thể do nguồn tra hỏng**
  Người dùng thấy gì: Kết luận 'không đụng vào phần của hãng' có thể đúng một cách giả tạo khi công cụ đo không đọc được dữ liệu cần so sánh, khiến người duyệt tin nhầm là an toàn dù chưa có gì được kiểm thật.
  file: `_acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
