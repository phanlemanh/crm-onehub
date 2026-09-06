# Review findings — lenh-chung-khong-an-cache-doi

## Trong hợp đồng — máy đã sửa

- **Báo động giả ngay lượt chạy đầu** — đoán theo TÊN thì `bun run lint:slop` bị kết oan
  là ăn cache; giải tên script ra thì nó là `oxlint` chạy thẳng. Phép phân biệt nay
  GIẢI chứ không ĐOÁN, và điều đó thành một mệnh đề trong AC-1.
- **Chiều đỏ từng trả về một cache-hit giả** — chạm file bằng một ký tự CỐ ĐỊNH thì
  chính trạng thái đã-chạm cũng được đệm lại, nên lượt sau trúng cache và cặp hai chiều
  xanh giả. Chân `do-hanh-vi` là bên phát hiện; đã đổi sang nội dung chưa từng có.
- **Bảng AC-3 mang một dự đoán sai** — bên phản biện nói hai loại phụ thuộc cần hai cơ
  chế; đo thật thì cả hai vá được bằng `inputs`. Đã sửa bảng theo số đo.

## Ngoài hợp đồng — người quyết ở Gate 2

- **Bản khai input của bộ vẽ ghim tên hồ sơ, nên nó sẽ chết khi hồ sơ ấy được dọn**
  Người dùng thấy gì: không thấy gì hôm nay — nhưng `packages/ui/turbo.json` khai
  `_acceptance/chan-lai-component-ra-man/**` theo tên. Ngày nào bộ vẽ đọc thêm một hồ
  sơ khác, hoặc hồ sơ này được dời đi, khoá cache lại nói dối và không chân nào báo.
  Chân AC-3 chỉ đo hai dòng đã ghim, không đo «đã khai ĐỦ».
  file: `packages/ui/turbo.json`
  severity: P1
  Đề xuất: new-contract — cần một chân suy danh sách file bộ vẽ ĐỌC THẬT lúc chạy rồi đối chiếu với bản khai; đó là một phép đo khác hẳn và cần một vòng riêng

- **Chỉ `@crm/ui#test` được đo; mười task khác chưa ai soi**
  Người dùng thấy gì: kho có 11 gói chạy test và nhiều task check-types, lint. Vòng này
  chỉ chứng khoá cache của MỘT task nói thật. Các task khác vẫn có thể thiếu input mà
  không ai biết — cổng thì đã an toàn nhờ `--force`, nhưng người viết code chạy lệnh
  hằng ngày thì không.
  file: `turbo.json`
  severity: P2
  Đề xuất: known-limits — cổng đã miễn nhiễm nhờ ép chạy lại; mở rộng phép đo ra mọi task là một vòng riêng và đắt hơn nhiều so với giá trị nó thêm

- **`--force` không làm khoá cache trung thực, nó chỉ bỏ qua khoá**
  Người dùng thấy gì: sau vòng này cổng không bao giờ đọc bản phát lại nữa — nhưng gốc
  của vấn đề (khoá cache có thể thiếu input) vẫn còn nguyên với mọi lệnh khác. Vòng này
  vô hiệu hoá triệu chứng ở đúng chỗ nó gây hại nhất, không chữa bệnh.
  file: `_acceptance/config.yaml`
  severity: P2
  Đề xuất: known-limits — chữa tận gốc nghĩa là khai input đúng cho mọi task của mọi gói, và không công cụ nào ở đây kiểm được điều đó tự động
