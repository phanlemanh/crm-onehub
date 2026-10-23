---
slug: thong-bao-mot-nguon-nhieu-kenh
at: 2026-10-23T01:15:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E4 dựng câu kỳ vọng bằng chính module chung nên luôn đúng; không gì chứng chuông của app đọc module đó | App giữ khuôn riêng của bốn loại sự kiện, Zalo gửi câu khác chuông, E4 vẫn xanh | Ô so câu của hàm hiển thị chuông (app, vi) với câu module chung cho bốn loại; chiều đỏ sửa khuôn của app | fixed: thêm describe tbk-cau ở apps/app/test/thong-bao-cau.spec.ts vào E4 và lệnh tbk_su_kien, kèm chiều đỏ «câu chuông lệch câu tin» |
| P1 | evals | Trục B năm giá trị nhưng E6(e) chỉ ba; màn chỉ kiểm cột tên Zalo | ZaloLink mà xưởng chưa bật bot: cài đặt báo Zalo, gửi thì không; tên cột viết cứng Zalo cho người dùng Slack | E6(e) ma trận 5 ô so với kenhSeDungCua; E7(a) hai ô zalo và slack | fixed: E6(e) 5 ô so bằng kenhSeDungCua kèm chiều đỏ «kênh cài đặt lệch kênh gửi»; E7(a) hai ô kèm chiều đỏ «tên cột không theo kênh» |
| P1 | evals | Vế kiểm tra kiểu của AC-1 không có đường đo; không assert hai tập loại rời nhau và đủ | Bảng khai Partial, thêm loại thứ 27 vẫn biên dịch; S4 ra UNCERTAIN cho AC-1 | Chép gói ra thư mục tạm, thêm loại, tsc đỏ gọi tên; đối chứng dương; assert hợp hai tập | fixed: E1 thêm (4) hợp và rời của hai tập, (5) tsc trên bản chép kèm đối chứng dương và chiều đỏ Partial; AC-1 tách vế tên sang bài kiểm chạy (tên sống ở messages của app) |
| P1 | design | d-11 ghi một-lối mà lối ngôn ngữ người chọn còn sống; AC-4 «câu tiếng Việt chuông hiện» mâu thuẫn với người dùng tiếng Anh; d-6 một-lối mà lối AgentTask chỉ có giá; hai mục Out of scope thiếu dòng sổ | Cổng Phạm vi duyệt mà không biết người dùng tiếng Anh nhận tin Zalo tiếng Việt, và bật loại nhắc sáng thì sáng sau mới có | Dòng sổ thay d-11, sửa chữ AC-4, đổi căn cứ d-6, thêm descope | fixed: đo lại — ngôn ngữ người chọn chỉ ở cookie trình duyệt (apps/app/lib/locale/server.ts), máy chủ không biết nên lối đó chết thật; dòng thay d-11 ghi đúng lý do đó; AC-4 nói rõ tin Zalo/Slack chỉ tiếng Việt; dòng thay d-6 căn cứ N3 «rẽ từ cùng bản ghi», ghi giá của lối AgentTask; thêm hai dòng descope; L6 của thiết kế nói rõ loại nhắc sáng chỉ đi trong tin sáng |
| P2 | evals | E2 lấy cỡ ma trận theo fixture, không buộc fixture đủ THU_TU_NHAC | Fixture thiếu một loại, bộ lọc làm rơi đúng loại đó, E2 vẫn xanh | Assert tập loại fixture bằng THU_TU_NHAC; chiều đỏ bỏ một loại | fixed: thêm ô (0) vào E2 kèm chiều đỏ «fixture thiếu loại»; đo 23/10 fixture có đủ 22 loại của THU_TU_NHAC |

Ghi chú ngoài bảng của người phản biện: AC-7 có vế lưu đi qua máy chủ mà không gắn (cross-layer); phần máy chủ là AC-6
(E6) và E8 đọc lại API sau khi tải lại trang — giữ nguyên.
