# Bản phạm vi — trường đồng nhất và hợp đồng đính kèm

Chủ kho nêu 20/10/2026: cần đính kèm tệp hợp đồng; trường tự tạo nằm khuất, phải đi nhiều bước để
nhập, không lọc và sort được. Phiên phân tích cùng ngày soát mã (so trường chuẩn với trường tự tạo trên
phiếu, form tạo, bảng, bộ lọc, Kanban, Cài đặt › Trường) và chủ kho chốt:

- hợp đồng là một **kiểu trường Tệp**, người quản trị tự cấu hình như mọi trường — không dựng loại bản ghi
  Hợp đồng riêng;
- gắn được vào Thoả thuận, Công ty và Liên hệ; thuộc tính (ngày ký, hết hạn, giá trị) là trường thường;
- chỉ chủ bản ghi và quản trị mở được tệp;
- thẻ Kanban hiện tối đa hai trường tự tạo đầu đã bật «Hiện trong bảng»;
- luật «một trường, một cách cư xử» ghi ở `docs/design.md` mục «Trường».

<!-- <<<PHAM-VI-MA -->
```
dot: truong-hop-dong-2010
dang: chuoi
nguon: chủ kho nêu trong phiên phân tích 20/10, soát mã trường chuẩn và trường tự tạo cùng ngày

- `D1` — một bảng đăng ký theo kiểu trường cho cả trường chuẩn lẫn tự tạo, dùng ở phiếu và ô bảng
- `D2` — ô Số nhận cách viết Việt (1.234,5) và lỗi khi lưu nói tiếng người dùng
- `D3` — ô tích có nhãn; Liên kết, Email, Điện thoại bấm được như trường chuẩn
- `D4` — một tên gọi: «trường», «trường tự tạo»; bỏ «tuỳ chỉnh», «động»
- `D5` — danh sách trường chuẩn ở Cài đặt › Trường dịch theo locale và khớp đúng phiếu
- `D6` — trường chuẩn sắp lại và ẩn được ở Cài đặt › Trường
- `N2` — bật «Bắt buộc» cho một trường ở Cài đặt › Trường
- `N1` — form tạo và ô thêm nhanh có trường bắt buộc và trường đang hiện trên phiếu; API tạo nhận và kiểm
- `L1` — sort danh sách theo mọi trường
- `L2` — cột trường tự tạo ẩn theo kiểu như cột chuẩn; thẻ Kanban hiện hai trường tự tạo đầu
- `L3` — lọc theo chữ (chứa), số (khoảng), ngày (mốc như Ngày chốt), ô tích, ô trống
- `L4` — một cách mã hoá bộ lọc trên đường dẫn cho mọi trường
- `L5` — bộ lọc đã lưu cho danh sách Thoả thuận
- `F1` — kiểu trường Tệp: tải lên nhiều tệp, lọc có hay chưa có, vòng đời, lượt dọn xoá kèm tệp
- `F2` — chủ bản ghi mở được tệp của bản ghi mình phụ trách; đổi chủ thì quyền đi theo
- `K0` — Kara không ghi đè giá trị người đã nhập
- `K1` — Kara đọc tệp trong ô Tệp để điền các trường bật «Kara điền»
- `K2` — nhắc chủ bản ghi trước khi hợp đồng hết hạn
```
<!-- PHAM-VI-MA>>> -->
