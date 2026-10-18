# Tự lái màn Dự án và Gantt — 18/10/2026

Đo tay ngoài S4, theo yêu cầu của chủ kho trước khi ký Cổng Bằng chứng.

- **Cây:** `feat/du-an-gantt` @ `b4492f36e`, không đổi vật trong lượt này.
- **Phiên đo riêng:** `bun run do:man`.
  - Kho `crm_cool_elbakyan_61bdff_do`.
  - App ở cổng 4258, API ở cổng 4808.
  - Khoá nghiên cứu giả đặt trong kho đo, giống cách `tien-de.mjs` làm.
- **Trình duyệt:** Ego Lite, chạy bằng `ego-browser`. Khổ 1280 × 860, thêm khổ điện thoại 375 × 812.
- **Ba người dùng:** «Phạm Thu Hà» (thành viên, người tạo dự án), «Lê Quang Vinh» (quản trị), «Trần Văn Nam» (thành viên, người thực hiện hai việc).
- **Dữ liệu gieo qua API thật:**
  - Ba dự án: An Phát (mở), Bắc Á (mở), Đợt thử (đã đóng).
  - Mười một việc, trong đó một việc con và một việc chưa có lịch.
  - Ba cặp việc phải chờ.
  - Hai mốc: «Ký kết» 16/10 đã trễ, «Ngày ra mắt» 06/11.
  - Một ngày lễ: 28/10.

## Đã thấy chạy đúng

| # | Người dùng thấy gì | Ảnh |
|---|---|---|
| 1 | Phạm vi «Của tôi»: mỗi việc trong dự án có dòng phụ «Dự án: …» bấm được; việc riêng không có dòng này | 01, 22 |
| 2 | Ô Phạm vi liệt kê Của tôi · Tất cả dự án · dự án đang mở · «Đã đóng (1)» · Tạo dự án | 02 |
| 3 | Tất cả dự án: tiến độ «x/y việc xong», khoảng ngày, mốc kế, người tạo, dòng gập «Đã đóng (1)»; điện thoại thành thẻ | 03, 23 |
| 4 | Gantt: thanh việc, việc con thụt lề, mũi tên việc phải chờ, nền T7/CN, ngày lễ 28/10 tô như ngày nghỉ, nhóm «Chưa có lịch (1)» với nút «Đặt ngày» | 04 |
| 5 | Vạch hôm nay; mốc «Ký kết» đã trễ thành hình thoi đỏ, có mũi tên nối từ việc nó chờ; nút «Tới «Ký kết»» đưa khung về đúng mốc | 05, 06 |
| 6 | Kéo «Chuẩn bị dữ liệu» sang 26–27/10 → «Cấu hình hệ thống» tự dời sang 29/10–03/11 (bỏ qua ngày lễ 28/10 và T7/CN), «Đào tạo» dời theo; thông báo «Đã dời 2 việc» | 07 |
| 7 | Dời bằng bàn phím: ← → cộng dồn, câu đọc «dời 2 ngày. Enter để lưu, Esc để thôi.», Enter lưu sang 21–22/10 | 08 |
| 8 | Khung việc có trường Bắt đầu, Dự án, khối «Phải chờ (1)» | 09 |
| 9 | Lịch sử việc ghi «… dời hạn từ 30/10 sang 03/11 vì «Chuẩn bị dữ liệu khách hàng» dời · máy tự dời» | 10 |
| 10 | Menu dự án có lịch sử: Sửa · Thêm mốc · Đóng (không có Xoá) | 11 |
| 11 | Đóng dự án còn việc mở thì hỏi «Dự án còn 6 việc chưa xong. Vẫn đóng?»; đóng xong chỉ còn để xem: không kéo, không «Đặt ngày», menu chỉ còn «Mở lại»; mở lại được | 12, 13 |
| 12 | Cài đặt › Lịch làm việc: bật Thứ 4 thì có thông báo «Đã lưu ngày nghỉ trong tuần» kèm Hoàn tác, hoàn tác trả về T7 + CN; hộp «Thêm ngày lễ» | 14, 15, 16 |
| 13 | Thành viên thường: mọi nút ở Lịch làm việc bị khoá kèm câu «Không đủ quyền: chỉ chủ và quản trị đổi được lịch làm việc.»; trên Gantt chỉ kéo được hai việc của chính mình | 18, 19 |
| 14 | Giao việc trong phạm vi một dự án: ô Dự án điền sẵn dự án đang xem, có ô Bắt đầu | 21 |
| 15 | Khổ 375: trang không cuộn ngang (bề ngang 375 = 375); Gantt cuộn trong khung | 22, 23, 24 |

## Lỗi ngoài hợp đồng — tái hiện được trên màn thật

| Mục trên thẻ | Thấy gì | Ảnh |
|---|---|---|
| Ngoài-3 / Ngoài-9 | Tắt cả Thứ 7 lẫn Chủ nhật: máy báo «Đã lưu ngày nghỉ trong tuần», ba giây sau hai ngày đó tự bật lại | 17 |
| Ngoài-10 | Thành viên thường bấm «Đặt ngày» cho việc không phải của mình: hộp vẫn mở, có nút Lưu | 20 |

Ngoài-8 (dự án 300 việc) không tái hiện ở lượt này; cần gieo 300 việc.

## Điều mới thấy khi tự lái — chưa có trên thẻ

Không mục nào dưới đây làm sai một tiêu chí đã ký. Anh quyết ghi hạn chế đã biết hay mở việc riêng.

| # | Người dùng gặp gì | Ảnh |
|---|---|---|
| T1 | Khung việc của một việc trong dự án ghi «Việc riêng — chỉ người trong cuộc thấy», trong khi thành viên không dính tới việc đó vẫn thấy nó trên Gantt của dự án. Lời hứa trên khung việc sai với việc trong dự án | 09, 19 |
| T2 | Khung việc có hai chữ «Bắt đầu» đứng gần nhau: nút chuyển trạng thái ở đầu khung, và trường ngày bắt đầu ở thân khung | 09 |
| T3 | Khổ 375, phạm vi Của tôi: dòng «Dự án: …» lệch sang phải, không thẳng hàng với tiêu đề việc | 22 |
| T4 | Mở Gantt lần đầu: nhãn khoảng ngày trên thanh công cụ ghi «26/10 – 01/11/2026» trong khi lưới đang hiện từ 19/10 | 04, 19 |
| T5 | Dời bằng bàn phím: thanh chưa di chuyển trước khi bấm Enter, chỉ có câu gợi ý ở đáy khung | 08 |
| T6 | Mốc đã trễ nằm ngoài khung chỉ báo bằng một chấm đỏ nhỏ ở mép trái; dải đầu dự án chỉ nói «Mốc kế: Ngày ra mắt», không nhắc mốc đã trễ | 04, 06 |
| T7 | Việc con dời ra quá hạn việc cha (Rà điều khoản 21–22/10, việc cha hạn 21/10) mà không có lời nhắc | 08 |

Ghi chú về ảnh: ảnh 12 (hộp hỏi đóng) và ảnh 21 (hộp Giao việc) chụp lúc lớp phủ đang mờ dần, nên nền tối hơn hoặc trong hơn khi dùng thật. Nút tròn «N» ở góc trái dưới chỉ có ở bản dev.
