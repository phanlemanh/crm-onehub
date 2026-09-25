---
slug: cap-nhat-tuan-okr
at: 2026-09-25T15:40:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract, evals | AC-5 chỉ hứa một hàng nhắc cho người có cả việc kế hoạch lẫn việc OKR; không eval nào đo người đã nối kênh chỉ có việc OKR (không kế hoạch 30 ngày) được ghi hàng và nhận tin; thước «người đã nối kênh nhận tin» ở Đường đo không có câu SQL hay eval | lenLichNhac chỉ duyệt người có kế hoạch; sau 26/10 phần lớn người phụ trách KR không có kế hoạch nên không bao giờ có hàng nhắc; E8, E10, E15 vẫn xanh; sáng 02/11 không ai nhận tin — đúng điều kiện CHẾT | E10 thêm người B có ZaloLink chỉ có việc okr-cap-nhat: một hàng, một lời gọi Zalo, da-gui, daGui có okr-cap-nhat, câu chào OKR; thêm rang/nguoi-noi-kenh-nhan-tin.sql vào E4; chiều đỏ «B khong co hang» | fixed: AC-5 hứa «mỗi người có ít nhất một việc, kể cả người chỉ có việc OKR»; E10 thêm người B và chiều đỏ; AC-2 và E4 thêm câu truy vấn thứ ba với B1/B2/B3; Đường đo thước 4 trỏ SQL |
| P1 | evals | Không eval đo phiên mở lúc vào màn và mỗi lần mở chỉ một phiên; E7 chỉ đo seconds ≥ 0 | Màn gọi moCapNhat trong nút gửi hay lại sau «Gửi lại»; seconds ≈ 0, trung vị đọc ra ~1 giây, ngưỡng SỐNG giả | E7 ghi T0 lúc danh sách hiện, chờ 5 giây, khẳng định openedAt ≤ T0+1s, seconds ≥ 5, đúng một phiên kể cả sau Gửi lại | fixed: AC-2 thêm vế «một phiên mỗi lần vào, lúc danh sách hiện, Gửi lại dùng lại»; E7 thêm T0, chờ 5 giây, đếm phiên, hai chiều đỏ; thiết kế mục 3 |
| P1 | evals, contract | E4 không phân biệt đếm KR khác nhau với đếm dòng, không có KR khác pha hay khác cấp; mẫu số lọc level phong-ban trong khi opportunity hứa mọi KR | count(*) đọc 4/5 thay 3/5 khi một KR gửi hai lần; KR cấp bộ phận và cá nhân bị loại khỏi mẫu số mà Cổng Phạm vi không biết | E4 gieo KR gửi hai lần, KR chu kỳ khác pha, KR cấp bộ phận; chiều đỏ bỏ đếm khác nhau, bỏ lọc pha; khai mẫu số là giả định | fixed: mẫu số = mọi KR đang chạy mọi cấp, xếp theo phòng ban chính của người phụ trách — [GIẢ ĐỊNH] ở Coverage, thiết kế mục 9; E4 gieo đủ nhiễu và năm chiều đỏ |
| P1 | contract, evals | Tập hồ sơ đã ký bị chạm khai tay ở thiết kế mục 10; chỉ dat-okr-trong-crm và vai-chi-okr được chạy lại [mot-duong-ghi-phong-ban#F1] | Bài đo may-nhac-truoc-nguoi hay khung-dieu-huong đỏ vì khuôn payload và tab thứ tư; S4 xanh vì không eval nào chạy chúng; CI toàn kho đỏ lúc gộp | Eval rút tập bằng máy từ lệnh và paths giao diff, so bằng danh sách khai, chạy eval máy của chúng và pre-merge toàn kho không --slug | fixed: AC-11 mở rộng thành tập máy rút; E21 đổi thành script ho-so-bi-cham.mjs (so bằng HO_SO_BI_CHAM, chạy eval máy, pre-merge toàn kho, ba chiều đỏ); thiết kế mục 10 thành bản khai chờ máy |
| P2 | evals | E26 chấm trên tài liệu, không trên tệp thật; kỳ vọng «bậc 1 cho toàn bộ» trái bảng (Item bậc 2); E25 không bắt ul/li tự vẽ | Tệp .tsx ngoài bảng và danh sách ul có border-b lọt cả E25 lẫn E26; hoặc người chấm đánh trượt bản đúng vì câu «bậc 1 cho toàn bộ» | E26 thêm tệp .tsx mới làm đầu vào, sửa kỳ vọng; E25 thêm regex <ul, <li trên dòng mới và khẳng định nhập Item; chiều đỏ ul + border-b | fixed: E26 inputs thêm năm tệp .tsx dự kiến, kỳ vọng «bậc 1, riêng Item bậc 2»; E25 soi dòng mới với <ul, <li, khẳng định nhập Item ở ba tệp danh sách, chiều đỏ «<ul» |

## Soát lại sau Cổng Phạm vi (hai chỗ sửa, 2026-09-25)

Phản biện context sạch lượt hai, chỉ soát giả định 7 (ô «Hiện tại» chỉ đọc với KR đang chạy) và giả định 8 (thẻ OKR theo vai). Kết quả: p0 0 · p1 3 · p2 2.

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Tên phép đo lượt 3 đúng và đủ (E5 dok_cong_bo); nhưng không nói xử lý chữ đã ký — AC-5 và expected E5 của dat-okr-trong-crm vẫn nói 200 | Làn ghim lại xanh mà expected đã ký nói ngược, hoặc lưới bắt hồ sơ đã ký bị sửa | Ghi ba việc: sửa expected E5, dòng supersede trong sổ hồ sơ đó, cách ghim lại; E21 kiểm expected khớp | fixed: Notes ghi ba việc làm trong S3 và điểm dừng nếu lưới cấm; E21 khẳng định expected E5 và dòng supersede |
| P1 | evals | E29 không có KR của mục tiêu đã công bố ở chu kỳ lập kế hoạch; cờ khoá của máy chủ không phép đo nào đọc | Màn tự suy khoá từ trạng thái công bố, khoá sai KR chu kỳ chưa chạy; E28, E29 vẫn xanh | E29 thêm KR c và chiều đỏ tự suy; E28 thêm ma trận cờ; readOnly không disabled | fixed: E29 bước 5 KR c, chiều đỏ «o hien tai bi khoa sai», readonly; E28 ma trận cờ [true, false, false]; AC-16 thêm vế màn đọc cờ máy chủ |
| P1 | evals | Ma trận cờ lienQuanOkr thiếu ca sát biên: người tham gia, mục tiêu đã bỏ, trưởng đơn vị đã lưu trữ, không có chu kỳ đang chạy, trưởng bộ phận | Cờ dùng lại okr.mine (gồm người tham gia) hoặc vế trưởng không xét chu kỳ; E12 xanh | Mở ma trận đủ ca, hai chiều đỏ mới | fixed: E12 ma trận 12 người viết trước, ba chiều đỏ (pha, okr.mine, trưởng không chu kỳ) |
| P2 | evals, design | E13 bước khẳng định vắng thẻ không chờ query OKR; trạng thái lỗi của vai đầy đủ chưa chốt | Đọc DOM trước khi query về → xanh giả; người bán hàng thấy thẻ lỗi OKR | Chờ phản hồi okr.viecCuaToi rồi mới khẳng định; chốt trạng thái lỗi | fixed: E13 bước 7 chờ phản hồi mạng có lienQuanOkr false; thiết kế: vai đầy đủ lỗi thì ẩn thẻ |
| P2 | contract, evals | E28 không đo đơn vị đo, không đo lời gọi trộn; vế «mọi lần đổi số có dòng cập nhật» là khẳng định toàn thể chỉ đo bằng một ví dụ | Kiểm sau khi ghi đích để lại ghi dở; một thủ tục khác đổi số mà không có dòng | Thêm cột unit và ô trộn; bỏ vế toàn thể hoặc đo liệt kê | fixed: E28 thêm unit, ô trộn chờ 400 và bản ghi không đổi, chiều đỏ ghi dở; AC-16 bỏ vế toàn thể, thay bằng «lời gọi trộn bị từ chối cả lời gọi» |

Không còn P0 hay P1 mở.
