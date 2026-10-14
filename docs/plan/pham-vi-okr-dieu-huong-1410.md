# Bản phạm vi — điều hướng khu Mục tiêu và sơ đồ căn chỉnh (14/10)

Chủ kho yêu cầu 14/10 rà UX/UI khu OKR, nhất là màn «Theo đơn vị» và cây căn chỉnh: khu này không giống
các trang OKR khác và lệch khỏi nếp chung của OneHub. Lượt rà đo trên production (khổ 1440 và 390), đối
chiếu Thoả thuận, Công ty, Tài liệu, Lộ trình, Strategy Map của Tability và cách Perdoo chia chủ sở
hữu — người dẫn. Hai bản mẫu dựng trong cùng phiên làm đầu vào Cổng 1:

- `/proto/dieu-huong-okr` — khung khu Mục tiêu, trang đơn vị trên DataTable có dòng mở rộng, Của tôi ba
  phần; nhánh `feat/dieu-huong-okr`.
- `/proto/so-do-can-chinh-okr` — sơ đồ thẻ theo đơn vị và sơ đồ quanh một mục tiêu, khung vẽ FlowMap
  trong `packages/ui`; nhánh `feat/so-do-can-chinh-okr`.

Số đo chính: tiêu đề trang «OKR theo đơn vị» khác tên «Mục tiêu» trên thanh bên; nút tạo nằm giữa thân,
cách mép phải 360–425px, các trang khác 0px; cây căn chỉnh cao khoảng 4.100px và không theo đơn vị đang
chọn; từ đầu trang tới bảng Thoả thuận và Công ty mất 69px một hàng, bản mẫu trang đơn vị cũng 69px.

Nhóm A là khung khu, B là trang đơn vị, C là Của tôi, D là sơ đồ căn chỉnh, E là phần ngoài khu OKR hay
còn chờ xác minh.

<!-- <<<PHAM-VI-MA -->
```
dot: okr-dieu-huong-1410
dang: chuoi
nguon: chủ kho yêu cầu rà UX/UI điều hướng OKR ngày 14/10; lượt rà trên production và hai bản mẫu /proto/dieu-huong-okr, /proto/so-do-can-chinh-okr

- `A1` — tiêu đề khu cố định «Mục tiêu», trùng tên trên thanh bên; câu mô tả đổi theo thẻ
- `A2` — nút «Thêm mục tiêu» ở góc phải đầu trang cùng ô chu kỳ và nút «…» (Nhập từ bảng tính, Soạn cùng Trợ lý)
- `A3` — bốn thẻ Của tôi · Theo đơn vị · Toàn cảnh · Hỏi ý, bỏ thẻ «Cập nhật tuần»
- `A4` — đổi thẻ giữ đơn vị và chu kỳ trên đường dẫn
- `A5` — Sức khoẻ chương trình có tiêu đề, thẻ và đường dẫn «A › B» khớp nhau
- `A6` — nút tạo bị khoá kèm một dòng lý do dưới tiêu đề, như luật «Không đủ quyền»
- `B1` — ô chọn đơn vị có tìm kiếm thay cây đơn vị 20 dòng; hết nhảy bố cục khi tải trên điện thoại
- `B2` — trang đơn vị dựng trên DataTable như Thoả thuận: ô chọn đơn vị ở chỗ ô tìm kiếm, một hàng công cụ
- `B3` — mục tiêu là dòng mở ra KR, trạng thái mở ghi trên đường dẫn; tên mục tiêu mở ngăn chi tiết
- `B4` — hàng công cụ giữ nguyên khi đổi cách xem Danh sách, Họp tuần, Chấm điểm
- `B5` — bỏ «Cây căn chỉnh» khỏi trang đơn vị; cây hôm nay luôn hiện toàn công ty dù chọn đơn vị nào
- `B6` — đơn vị trực thuộc ở cuối trang để chuyển đơn vị; thông tin đơn vị ở chân bảng
- `B7` — sắp xếp mục tiêu theo tiến độ và tình trạng
- `B8` — chip lọc «Cần bàn», «Chưa góp vào đâu» thay «Đặt cược», «Chưa có lý do» không tự giải thích
- `C1` — Của tôi ba phần: cần cập nhật tuần này, đơn vị bạn dẫn, KR bạn phụ trách
- `C2` — cập nhật tuần thành hành động trong Của tôi thay cho thẻ riêng
- `C3` — người không dẫn đơn vị nào thấy nút tạo khoá kèm lý do, không được mời tạo OKR cá nhân
- `D1` — Toàn cảnh › Theo đơn vị có cách xem Sơ đồ: mỗi đơn vị một thẻ, nối theo cấp, nét đứt cho mục tiêu góp thẳng
- `D2` — mở thẻ đơn vị ngay trên sơ đồ và lia khung tới thẻ vừa mở
- `D3` — lọc «Cần chú ý» trên sơ đồ: chưa có trưởng, chưa đặt OKR, mục tiêu chưa góp vào đâu, KR trượt
- `D4` — thu gọn sơ đồ theo cấp khi tổ chức có hơn 12 đơn vị
- `D5` — lấy một mục tiêu làm tâm từ ngăn chi tiết: phía trên thứ nó góp vào, phía dưới KR; góp hai chỗ hiện một lần
- `D6` — khung vẽ sơ đồ dùng chung FlowMap trong packages/ui, thêm React Flow và dagre
- `E1` — vùng bấm tối thiểu 44px ở thẻ con và nút trên toàn app
- `E2` — đơn vị cha và con trùng tên trên cây tổ chức (BD-IBP › BD-IBP, Công nghệ › Công nghệ)
- `E3` — nút «Mở tất cả» cho bảng có dòng mở rộng của packages/ui
- `E4` — bảng Theo đơn vị ở Toàn cảnh thành cây đơn vị có số cuộn lên
- `E5` — cách xem đặt bên trái (Thoả thuận) hay bên phải (Công ty) chốt một chỗ cho mọi danh sách
```
<!-- PHAM-VI-MA>>> -->
