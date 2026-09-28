---
slug: tim-va-dieu-huong-kho
at: 2026-09-28T23:25:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — tim-va-dieu-huong-kho

Một tác tử tươi đọc đúng sáu tệp: thiết kế, hợp đồng, evals, sổ quyết định, bài học từ
feature trước (claim-scan, 10 mục, advisory) và `opportunity.md`. Không đọc mã.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals, contract | E2 tự mâu thuẫn: 72 khẳng định cấm tên và slug của trang chưa duyệt S1 trong cả ba đường với mọi người, cùng lúc đòi «Có đề xuất chờ duyệt» của người tạo, chủ trang, quản trị hiện S1; AC-2 và thiết kế mục 6 nói hai ý ngược nhau; ngưỡng CHẾT «lộ bản chưa duyệt» không có dòng Đường đo | Không bản cài nào qua được E2: hiện S1 thì ô sucKhoe × người tạo đỏ, giấu S1 thì vế choDuyet đỏ; tới S4 người chấm tự nới ma trận hoặc phải sửa hợp đồng sau khi ký | Chốt một câu ở thiết kế và AC-2; E2 kỳ vọng riêng từng ô; thêm dòng Đường đo cho ngưỡng lộ | fixed: chốt tên trang chưa duyệt chỉ hiện ở «Có đề xuất chờ duyệt» và chỉ với người thấy bản chờ theo luật lượt 1, chữ trong thân bản chưa duyệt không ra đâu; AC-2 và thiết kế mục 6 viết lại; E2 thành bảng 72 ô có kỳ vọng từng ô; Đường đo thêm dòng lộ bảo đảm bởi AC-2 |
| P1 | design, contract, evals | «Bản cũ» có hai định nghĩa: thiết kế mục 8 xếp bản cũ vào nhóm chờ, E11 và AC-11 xếp vào nhóm đã xử lý; E9, E9b không gieo bản cũ | Làm theo thiết kế thì E11 đỏ; làm theo E11 thì bản cũ rơi khỏi tab và dòng nhắc; E9, E9b vẫn xanh vì không có ca bản cũ nên N mang hai nghĩa | Một định nghĩa ở thiết kế, AC-11, E11; thêm bản cũ vào E9, E9b | fixed: nhóm «chờ» là trạng thái CHO_DUYET (bản có bản gốc lệch vẫn ở đây với nhãn «cũ» như lượt 1), nhóm «đã xử lý» là TRA_LAI và CU; N của dòng nhắc chỉ đếm CHO_DUYET; AC-9, AC-11, thiết kế mục 7, 8, E9, E9b, E11 cùng một câu, ma trận E9 thêm 1 bản CU và 1 bản TRA_LAI tạo qua đường ghi thật |
| P1 | evals | E2 chỉ có đối chứng dương cho tìm; 48 ô phủ định của nhacToi và sucKhoe không có | nhacToi trả NOT_FOUND hay sucKhoe trả rỗng cho mọi người thì mọi khẳng định «không chứa» đúng vô nghĩa, E2 xanh dù hai đường hỏng | Mỗi ô nhacToi chứa nguồn đã duyệt, mỗi ô sucKhoe chứa một mục viết trước; chiều đỏ nhacToi trả rỗng | fixed: E2 gieo trang đích D và nguồn A đã duyệt, mọi ô nhacToi đòi rows = A, mọi ô sucKhoe đòi S4 trong moCoi; thêm hai chiều đỏ ghim «nhacToi mất nguồn A» và «member-khac thấy Trang nhap S1» |
| P1 | evals | E1 đo đoạn trích bằng chuỗi-có-mặt, không buộc phần khớp ứng với từ truy vấn; E5 chỉ đòi câu chứa chữ liên kết, không đòi lần nhắc đầu [may-soan-de-xuat#F1] | Chỉ số lệch một ký tự hay lấy năm ký tự đầu làm khop vẫn xanh trong khi ⌘K tô sai chữ; F nhắc hai lần cùng chữ thì lấy câu lần hai vẫn qua | E1 khẳng định bỏ-dấu của khop bằng từ truy vấn; E5 hai chữ liên kết khác nhau và so bằng chuỗi viết trước | fixed: E1 thêm quan hệ khop với từ truy vấn (hoặc tiền tố từ cuối) và chiều đỏ «dời chỉ số một ký tự»; E5 cho F hai chữ liên kết khác nhau, so câu bằng === với chuỗi viết trước, chiều đỏ «lấy lần hai» |
| P2 | contract, evals | Thiết kế hứa nhacToi và boLoc lỗi thì hiện lỗi có «Thử lại», không AC hay eval nào giữ | nhacToi lỗi mạng bị nuốt thành «Chưa trang nào nhắc tới trang này.», boLoc lỗi thành bộ lọc trống, mọi eval xanh | Vế lỗi vào AC-5, AC-6; ca DOM có chiều đỏ «nuốt lỗi thành rỗng» | fixed: AC-5, AC-6 thêm vế lỗi; thêm E5d (DOM màn đọc, ba ca có, rỗng, lỗi) và ca lỗi boLoc trong E6d, mỗi ca một chiều đỏ ghim riêng |
