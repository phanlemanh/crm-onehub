# Bản phạm vi — vỏ khu Mục tiêu, kiến trúc thông tin và tên gọi (18/10)

Chủ kho yêu cầu 18/10 rà lại khu Mục tiêu bằng cách học trực tiếp từ Tability: đọc không gian
«onehub» của Tability (ba kế hoạch mẫu, khoảng 120 đường dẫn), đọc mã khu Mục tiêu trên onehub, đo
màn production ở khổ 1440. Kết quả và căn cứ nằm ở báo cáo
https://claude.ai/artifact/AJuRPQDJK7ZB9GLKus6Tpj (phần «Vỏ», «Kiến trúc thông tin mới», «Đặt tên»).
Artifact này riêng tư; từ 24/10 bản tóm tắt và con trỏ ghim nằm ở
`docs/findings/2026-10-18-vo-khu-muc-tieu/README.md`. Mục chờ C1 thành hàng VK18 ngày 24/10.

Ba quyết định đã chốt trong ngày, làm nền cho các mã dưới:

- **Vỏ**: khu Mục tiêu dùng thanh bên hai lớp như Cài đặt và Hội thoại, chia theo việc và vật như
  Tability — đầu thanh Của tôi · Cập nhật gần đây; nhóm **OKR** (Bộ OKR · Lấy ý kiến; «OKR và KPI» khi
  có KPI); nhóm **Báo cáo** (Sức khoẻ · Mọi KR · Sơ đồ). Phạm vi (Tất cả · Tôi dẫn · Đang theo dõi) là
  bộ lọc trong trang. Bản mẫu bấm được: `/proto/vo-khu-muc-tieu`, nhánh `feat/vo-khu-muc-tieu`.
- **Tên**: «Góp vào» là nhãn màn của căn chỉnh; đơn vị gốc mang tên OneHub; «Lấy ý kiến» thay «Hỏi
  ý»; «Bộ OKR», nhóm «Báo cáo», mục «Sơ đồ».
- **Từ điển** (mã A1 của bảng hạng mục) đã viết xong ở PR #477, nhánh `docs/ten-khu-muc-tieu` — không
  cắt thành hàng.

Phạm vi 14/10 (`pham-vi-okr-dieu-huong-1410.md`, hàng DH1–DH5, DH11) đã giao và ký hết; các hàng dưới
đứng trên kết quả thật của chúng. Nhóm A là tên gọi, V là vỏ, B là chỗ làm việc trong vỏ, C là phần
còn chờ người chốt.

<!-- <<<PHAM-VI-MA -->
```
dot: okr-vo-khu-1810
dang: chuoi
nguon: chủ kho yêu cầu 18/10 rà UX khu Mục tiêu học từ Tability; báo cáo artifact AJuRPQDJK7ZB9GLKus6Tpj và bản mẫu /proto/vo-khu-muc-tieu

- `A2` — đổi nhãn trên màn theo ba tên đã chốt (Góp vào, đơn vị gốc OneHub, Lấy ý kiến), cả bản tiếng Anh
- `A3` — câu báo lỗi của máy chủ và tin nhắc buổi sáng dùng tên mới
- `A3k` — lời dặn gửi Kara dùng tên mới, đo lại bộ chấm soạn không tụt
- `V1` — thanh bên khu dùng chung trong packages/ui, Cài đặt và Hội thoại chuyển sang dùng, thêm luật giao diện «thanh bên khu»
- `V2` — vỏ khu Mục tiêu: thanh bên chia theo việc và vật, ô chu kỳ đầu thanh, mỗi nơi đến một đường dẫn, chuyển hướng đường cũ
- `V2b` — trang Bộ OKR (mọi bộ, lọc Tất cả · Tôi dẫn · Đang theo dõi) và trang một bộ OKR với thẻ con OKR · Họp tuần · Việc · Sơ đồ · Chấm điểm
- `V3` — khung toàn vùng cho Sơ đồ, nút Toàn màn hình, gộp sơ đồ quanh mục tiêu vào Sơ đồ
- `B1` — ngăn KR duy nhất: bấm KR ở đâu cũng một ngăn, Cập nhật ở đầu, nút sang KR kế
- `B1b` — nút Cập nhật hiện sẵn trên dòng KR, hộp cập nhật có đồ thị xem trước điểm mới so với đích
- `B2` — một bộ OKR có hàng số đầu trang (ngày còn lại, tiến độ, cập nhật tuần này, tự tin), KR mở sẵn, Mở tất cả
- `B3` — một nút Thêm mục tiêu mở hộp chọn đường (tự viết, từ mẫu, từ bảng tính, soạn cùng Kara); màn chỉ đọc không có nút chính
- `B5a` — chế độ Soạn cả bộ OKR như tài liệu, góp ý của Kara và điểm chất lượng ở cột bên, màn theo dõi không còn khối Kara chiếm chỗ
- `B5b` — Mọi KR cả công ty lọc theo tình trạng, đơn vị, người; ô số ở Sức khoẻ dẫn tới danh sách đã lọc
- `B5c` — Cập nhật gần đây: dòng tin mọi lần cập nhật tuần, lọc bộ OKR bạn dẫn hay bạn theo dõi, trả lời tại chỗ
- `C1` — các tên còn chờ chốt: Vết và Diễn biến thành Lịch sử, Đặt cược, Cần bàn và Đáng bàn, nút Thêm việc, Tiếp tục soạn, hai lỗi bản tiếng Anh
- `C2` — Của tôi liệt kê người trong đơn vị bạn dẫn chưa cập nhật tuần này
```
<!-- PHAM-VI-MA>>> -->
