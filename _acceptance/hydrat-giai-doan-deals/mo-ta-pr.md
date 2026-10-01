## Màn Deals hết lỗi hydrat ở ô Giai đoạn

Tải `/deals` đôi khi báo «Hydration failed because the server rendered text didn't match the
client». Chỗ lệch là ô Giai đoạn: máy chủ vẽ mã thô `QUALIFIED_TO_BUY` với chấm xám, trình
duyệt vẽ «Qualified to buy» với chấm xanh. Ngay cả lượt không báo lỗi, màn vẫn lộ mã thô trong
chốc lát trước khi nhãn hiện.

Gốc: ngăn «Thoả thuận mới» ở đầu trang tạo sẵn truy vấn danh sách giai đoạn (và ba truy vấn
khác) khi đang đóng. Vùng dữ liệu của bảng vì thế hoãn nạp danh sách đó sang sau lượt vẽ đầu:
máy chủ luôn vẽ mã thô; trình duyệt vẽ nhãn nếu lượt tải của đầu trang về kịp — nên lỗi chập
chờn theo tải máy.

Sửa: ngăn tạo deal chỉ tạo truy vấn khi mở. Bốn truy vấn và form dời vào thân ngăn; nháp và lệnh
tạo ở lại ngoài, nên đóng rồi mở lại vẫn còn chữ đang gõ như trước. Giao diện ngăn, bảng và
Kanban không đổi.

Kèm theo: hồ sơ `khung-tao-okr-nhu-deal` bỏ lớp bọc hạn chế của E17 — E17 nay chạy thẳng kịch
bản «hộp giữ chỗ» và phải thoát 0.

### Vẽ tay là bậc cuối — đã tra gì

Không có khối giao diện mới: vòng tách một thành phần hiện có thành hai phần (vỏ luôn dựng, thân
chỉ dựng khi mở), dùng nguyên các thành phần `@crm/ui` đang có.

### Hồ sơ

`hydrat-giai-doan-deals` (T2). Chiều đỏ tất định: bản sao với ngăn cũ làm test DOM đỏ bốn ca
đúng thông điệp ghim, và làm HTML máy chủ của `/deals` lộ 3 mã thô ở bảng, 10 ở Kanban.
Phép đo chủ kho yêu cầu (`man-giu-cho` qua `tien-de`) thoát 0.

`khung-tao-okr-nhu-deal` ghim lại trong PR này (4 bộ kiểm, 15/15 eval máy). Hai phép đo nhìn của nó chạm bản sửa (E3 khung ngăn, E5 chân ngăn) được chạy lại tay tại `63953282`: 150 kiểm đúng, 0 sai.

### Cổng Bằng chứng

Ký 2026-09-30 (Manh Phan) sau hai vòng chấm. Lượt chấm đầu bị huỷ vì tác tử chấm tự sửa mã và commit lên nhánh; nhánh đưa về trước các commit đó và chấm lại với luật chỉ-đọc. Hai mục ngoài hợp đồng ghi vào hạn chế đã biết (mở thẳng Deals kèm ngăn tạo đang mở; phép đo `man-giu-cho` chưa có đối chứng dương riêng), xem `contract.md`.

Việc tách riêng: ba ngăn tạo cùng khuôn (công ty, liên hệ, chiến dịch) cũng tạo truy vấn khi
đóng; chưa thấy chữ lệch trên màn của chúng.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
