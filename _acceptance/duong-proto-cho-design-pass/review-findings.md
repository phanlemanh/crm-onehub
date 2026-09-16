## Trong hợp đồng

- **Assert "chuỗi có mặt" thay vì quan hệ: cờ `data-slot` do StateSwitcher sinh ra, không do thân proto**
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs:48`
  severity: high
  AC: AC-1
  source: measurement
  detail: Chân `co-bat` khẳng định "thân trang có dấu hiệu component thật của @crm/ui" bằng `doi(t.includes("data-slot"), ...)`, với `t` là TOÀN BỘ HTML của `/proto/duong-proto`. Nhưng lời hứa của AC-1 (và của docs/proto.md: "bắt bản mẫu ghép từ component thật thay vì vẽ tay") là một QUAN HỆ giữa THÂN PROTO và component thật — không phải sự có mặt của một chuỗi ở bất kỳ đâu trên trang.

  Trang luôn render `StateSwitcher` (apps/app/app/proto/state-switcher.tsx:17) bằng `<Button asChild>` của `@crm/ui/components/button`, và button.tsx:61 luôn phát `data-slot="button"` — nằm NGOÀI `<div data-proto-body>`. Hệ quả: nếu ai đó viết lại `apps/app/app/proto/_modules/duong-proto/index.tsx` hoàn toàn bằng `<div>`/`<span>` vẽ tay (đúng lớp lỗi eval này nói nó chặn), assert vẫn XANH vì `data-slot` của thanh chuyển state vẫn còn đó. Trang mục lục `/proto` cũng vậy (CardContent → `data-slot="card-content"`).

  Chính file này đã có sẵn `vungProto(html)` (dòng 25-31) cắt đúng vùng từ `data-proto-body` tới `</main>`, và chân `state-chon-duoc` dùng nó — nhưng chân `co-bat` thì không. Chiều đỏ mà E1 mô tả ("đổi một tên state") chỉ đánh vào vòng lặp `st.nhan` ở dòng 47, không đánh vào assert này, nên không có đột biến nào chứng minh nó bắt được gì.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **proto_route điền slug hồ sơ nghiệm thu, nhưng PROTO_CATALOG khoá theo slug proto — URL đầu tiên mà design-pass mở sẽ 404**
  Người dùng thấy gì: Khi bấm mở trang bản mẫu để duyệt thiết kế, hệ thống có thể báo không tìm thấy trang (404) thay vì hiện giao diện, khiến người duyệt không xem được gì.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **PROTO_ROUTE không nằm trong allowlist env của turbo — dev_cmd được tài liệu hoá sẽ bị lọc mất cờ**
  Người dùng thấy gì: Nếu làm đúng theo lệnh khởi động được ghi trong tài liệu, trang bản mẫu vẫn có thể không mở ra dù đã bật đúng cờ theo hướng dẫn.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **.env.example nói cờ đọc lúc dựng, docs/proto.md và rang/ban-dung.mjs nói lúc chạy**
  Người dùng thấy gì: Tài liệu hướng dẫn bật/tắt tính năng bản mẫu ghi sai thông tin, có thể khiến người vận hành tưởng phải dựng lại toàn bộ ứng dụng trong khi chỉ cần khởi động lại.
  file: `.env.example`
  severity: medium
  Đề xuất: known-limits

- **layout.tsx viết tay lại so sánh cờ thay vì gọi protoMoDuoc() — hai chỗ giữ cùng một hằng**
  Người dùng thấy gì: Nếu sau này có người đổi tên cờ bật/tắt bản mẫu ở một chỗ, một phần khác của trang có thể vẫn dùng tên cũ và âm thầm ngừng hoạt động mà không ai nhận ra ngay.
  file: `apps/app/app/proto/layout.tsx`
  severity: medium
  Đề xuất: known-limits

- **proto/page.tsx đè style của CardContent tại chỗ gọi — chỗ duy nhất trong cả kho**
  Người dùng thấy gì: Một khối nội dung trên trang bản mẫu bị ép hiển thị khác với quy chuẩn giao diện chung của sản phẩm, có thể gây lệch trải nghiệm nếu khuôn mẫu này về sau được dùng làm gốc cho màn hình khác.
  file: `apps/app/app/proto/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **mucMoCoi() trong registry.ts là mã chết; phép đo mồ côi chép lại logic của nó**
  Người dùng thấy gì: Có một đoạn mã kiểm tra không còn được dùng ở đâu; không ảnh hưởng gì tới người dùng, chỉ làm kho mã hơi khó đọc hơn theo thời gian.
  file: `apps/app/app/proto/registry.ts`
  severity: low
  Đề xuất: wont-fix

- **.env.example mô tả PROTO_ROUTE là cờ đọc lúc build — trái với mã và trái với docs/proto.md**
  Người dùng thấy gì: Tài liệu mô tả cờ bật bản mẫu ghi sai thời điểm cờ có hiệu lực, có thể khiến người vận hành dựng lại ứng dụng một cách không cần thiết.
  file: `.env.example`
  severity: medium
  Đề xuất: known-limits

- **Phép đo «dùng component thật» ở eval co-bat không thể đỏ — data-slot luôn có do StateSwitcher**
  Người dùng thấy gì: Phép kiểm tự động để đảm bảo trang bản mẫu luôn dùng đúng thành phần giao diện thật có thể không phát hiện được nếu sau này ai đó âm thầm thay lại bằng HTML tự vẽ tay.
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs`
  severity: medium
  Đề xuất: known-limits

- **Nhánh «cờ không đặt» của răng không thật sự không đặt — next.config gọi loadRootEnv() nạp lại PROTO_ROUTE từ .env gốc**
  Người dùng thấy gì: Phép đo dùng để chứng minh việc tắt cờ sẽ ẩn hết trang bản mẫu có thể cho kết quả khác nhau tuỳ máy đang chạy, nên kết quả "đạt" chưa chắc đáng tin trên mọi máy.
  file: `_acceptance/duong-proto-cho-design-pass/rang/may-chu.mjs`
  severity: medium
  Đề xuất: known-limits

- **khai-bao.mjs: statSync không được chắn — chết bằng ENOENT thay vì in ra phát hiện vừa ghi ở dòng trên**
  Người dùng thấy gì: Nếu cấu hình đo trỏ sai đường dẫn tệp hướng dẫn, công cụ kiểm tra sẽ dừng đột ngột bằng một lỗi hệ thống khó hiểu thay vì báo rõ nguyên nhân.
  file: `_acceptance/duong-proto-cho-design-pass/rang/khai-bao.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: ba chuỗi chống-rò ở ban-dung.mjs đúng rỗng, không có đối chứng dương**
  Người dùng thấy gì: Phép kiểm dùng để đảm bảo tắt cờ sẽ ẩn hết nội dung bản mẫu thực ra không chứng minh được điều đó một cách chắc chắn, nên có thể báo "đạt" ngay cả khi có rò rỉ.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: chân `state-la` và `slug-la` chỉ có 404, không đối chứng dương trong cùng lượt**
  Người dùng thấy gì: Nếu cả nhánh /proto bị hỏng hoặc biến mất hoàn toàn, các bài kiểm tra hiện tại vẫn báo đạt, nên sự cố có thể không bị phát hiện cho tới khi có người tự tay vào kiểm tra.
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính không ghim thông điệp: grep `/error/i` trên toàn bộ log dựng**
  Người dùng thấy gì: Khi bước dựng gặp lỗi liên quan tới nhánh proto, thông báo hiện tại không cho biết lỗi gì hay ở đâu, khiến người xử lý mất thời gian dò nguyên nhân.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).