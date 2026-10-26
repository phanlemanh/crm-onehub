# Bản phạm vi — vòng tín hiệu tự chạy (14/10)

Chủ kho duyệt 14/10 trong phiên LT2, sau lượt rà giao diện «Gửi tín hiệu» trên production và đề xuất tự
động hoá vòng tín hiệu: giảm việc tay và câu lệnh gõ, giữ quyền quyết của người ở các cổng. Thứ tự chủ kho
chốt: thẻ «Mọi tín hiệu» cho quản trị · tín hiệu tự về kho · hộp thông báo trên web · gom tự chạy · trạng
thái sống. Luật riêng tư chủ kho chốt cùng lúc: quản trị thấy tên người gửi, hộp gửi báo trước điều đó.
Máy thực hiện: chủ kho quyết sau.

Nhóm L chủ kho duyệt thêm cùng ngày: OneHub Center là nơi vận hành, đọc lộ trình của mọi kho sản phẩm cùng
kiến trúc kit (OneHub Platform và các sản phẩm sau).

Nhóm U là các lỗi ghi trong lượt rà 14/10: U1–U5 là tín hiệu crm-1 đến crm-5 đã gửi trên production, U6–U9
soạn sẵn chưa gửi.

## Nguồn — tóm tắt đã làm sạch

Tài liệu thô (thảo luận dựng lại từ bản ghi phiên, báo cáo, ảnh) nằm ở kho riêng tư `phanlemanh/crm-onehub-nguon`,
trang đợt `wiki/dot/vong-tin-hieu-1410.md` (băm `bb3fc5ee39f5`, commit `88462c4`). Chủ kho chốt 24/10: kho crm công khai chỉ giữ con trỏ
ghim và bản tóm tắt đã làm sạch.

- TB2: mỗi sự kiện một bản ghi thông báo; chuông web đọc thẳng nó; Zalo và Slack rẽ từ cùng bản ghi. Cài đặt là bảng loại × kênh, hai mức («Cần làm» đẩy kênh, «Để biết» chỉ trên web). Giữ hành vi Zalo đang có. Chưa soát người chưa nối kênh nào nhận gì.
- TH6b sinh ở Cổng Bằng chứng của TH6 (lỗi «xoá xong, bàn phím nhảy về đầu trang»); chưa có số đo riêng cho tiêu điểm của hộp xoá.
- Lệch chữ: dòng S1 của bản phạm vi vẫn hứa «không chờ lần lên production kế», điều đã bỏ ở TH3.

<!-- <<<PHAM-VI-MA -->
```
dot: vong-tin-hieu-1410
dang: chuoi
nguon: crm-onehub-nguon:wiki/dot/vong-tin-hieu-1410.md#bb3fc5ee39f576cdc6dc3b8b8818e38e72ea1964

- `Q1` — quản trị xem mọi tín hiệu: người gửi, phòng ban, màn, giờ, trạng thái; lọc theo phòng ban, trạng thái, người gửi
- `Q2` — ba ô số đầu trang quản trị: tín hiệu 30 ngày qua, số phòng ban có tín hiệu, tín hiệu gửi quá 7 ngày chưa có chỗ
- `Q3` — hộp gửi báo trước «Quản trị CRM thấy tên bạn cùng tín hiệu này»
- `Q4` — quản trị lưu trữ tín hiệu rác trước khi kéo về, có Hoàn tác, để vết người gỡ
- `K1` — khoá API chỉ được kéo tín hiệu, thay khoá quyền chủ khi kéo tự động
- `K2` — lịch chạy hằng ngày kéo tín hiệu về kho và tự gộp vì chỉ chạm thư mục tín hiệu
- `N1` — bản ghi thông báo một nguồn: người nhận, chuyện gì, dẫn tới đâu, lúc nào, đã đọc chưa
- `N2` — chuông trên đầu trang có số chưa đọc, danh sách Hôm nay / Trước đó, trang lịch sử, đánh dấu đã đọc
- `N3` — Zalo và Slack rẽ từ cùng bản ghi thông báo, giữ nguyên hành vi Zalo đang có
- `N4` — cài đặt loại thông báo × kênh, hai mức Cần làm / Để biết, web luôn bật
- `N5` — quản trị nhận «Có n tín hiệu mới» gom mỗi ngày ở mức Để biết
- `G1` — gom nhóm và cắt lượt chạy theo lịch khi có tín hiệu chưa có chỗ, mở PR «Đợt tín hiệu», chủ kho sửa hay phủ quyết trong 48 giờ
- `S1` — trạng thái tín hiệu đọc từ nguồn cập nhật mỗi lần onehub đổi, không chờ lần lên production kế
- `S2` — người gửi nhận thông báo khi tín hiệu của họ đổi chỗ
- `U1` — bảng «Tín hiệu đã gửi» bóp cột «Điều đã kể» còn khoảng 80px ở khổ 768–1100px (crm-1)
- `U2` — lỗi quá trần ngày và lỗi máy chủ tô đỏ ô thứ hai; Gửi vẫn bấm được khi đã quá trần (crm-2)
- `U3` — giờ gửi không theo ngôn ngữ đã chọn; cột «Gửi lúc» lệch lề (crm-3)
- `U4` — mã crm-N có trên biên nhận nhưng không hiện trên danh sách; hộp xoá nên nêu tên điều đã kể (crm-4)
- `U5` — tiêu điểm nhảy về đầu trang sau khi xoá, nút ⋮ 24×24 trên điện thoại, nút Gửi khoá không nói vì sao (crm-5)
- `U6` — đóng biên nhận sau khi gửi xong vẫn hỏi «Bỏ những gì vừa nhập?»
- `U7` — dòng «Gửi từ màn» và cột «Màn» hiện đường dẫn thô thay vì tên màn
- `U8` — chữ trạng thái lặp ý, dùng từ nội bộ «gom», mất nút xoá mà không nói vì sao
- `U9` — lớp phủ sau hộp thoại ở nền tối đen đặc, che hẳn trang phía sau (bộ giao diện chung)
- `L1` — trang Lộ trình đọc bản chụp lộ trình được lấy lại mỗi khi nhánh chính đổi, không đọc tệp đóng gói trong bản dựng
- `L2` — danh bạ sản phẩm do quản trị khai: tên, kho GitHub, nhánh production, đường tệp lộ trình
- `L3` — ứng dụng GitHub chỉ đọc, cài vào từng kho sản phẩm, báo khi nhánh chính đổi
- `L4` — bộ chọn sản phẩm trên trang Lộ trình và quyền xem theo sản phẩm
- `L5` — đọc được vài phiên bản khuôn lộ trình, báo rõ sản phẩm nào đang ở khuôn cũ
- `L6` — tín hiệu nhiều sản phẩm: hộp gửi chọn sản phẩm, lượt kéo về của mỗi kho chỉ lấy tín hiệu của sản phẩm mình
```
<!-- PHAM-VI-MA>>> -->
