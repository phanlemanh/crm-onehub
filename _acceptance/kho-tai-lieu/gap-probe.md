---
slug: kho-tai-lieu
at: 2026-09-27T11:40:00Z
verdict: findings
p0: 0
p1: 5
p2: 0
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Vế UI của AC-10 (mở rồi không sửa thì nút Gửi duyệt khoá) không có eval; không eval nào đo điểm bất động qua ranh client–máy chủ; design và E10 nói khác nhau về chỗ đặt bộ chuẩn hoá | Bộ chuẩn hoá máy chủ lệch cấu hình trình soạn; E10 và E10b đều xanh nhưng người mở trang không sửa vẫn bấm được Gửi duyệt rồi nhận lỗi, hoặc người duyệt thấy cả bảng bị tô | Eval backend-effect khứ hồi 12 mẫu qua tRPC và trình soạn; test DOM nút khoá | fixed: thêm E10c (điểm bất động qua máy chủ, 12 mẫu, chiều đỏ) và E10d (nút khoá, chữ «Chưa có thay đổi»); design mục 4 chốt một mô-đun `packages/validation/src/tai-lieu-markdown.ts`, E10 trỏ đúng tệp |
| P1 | evals | Vế UI của AC-2, AC-7, AC-8 chỉ có eval lớp backend | Màn sửa mở ô trống hay mở bản đề xuất; nhãn chờ duyệt hiện cho mọi người; E2, E7, E8 vẫn xanh | Test DOM cho từng vế, gieo qua tRPC thật, có chiều đỏ | fixed: thêm E2b (lỗi dưới ô và focus), E7b (trả lại thiếu lý do không gọi), E8b (màn sửa mở đúng bản đang dùng; nhãn chờ duyệt chỉ hiện với người tạo và chủ trang) |
| P1 | evals | E3 hứa ma trận viết trước mà không có bảng kỳ vọng; trạng thái «bị trả lại» mơ hồ; thiếu owner; AC-3 đếm sai số người | Người làm tự viết bảng khớp cách mình làm; trang mới bị trả lại lộ trong list; owner không thấy hàng chờ; E3 vẫn xanh | Chép bảng kỳ vọng vào expected; tách trạng thái; thêm owner | fixed: E3 thành 6 người × 5 trạng thái × 4 thủ tục = 120 khẳng định với hai bảng kỳ vọng viết trước; AC-3 sửa đúng sáu người, năm trạng thái |
| P1 | evals | E11 đo chữ đậm và danh sách bằng chuỗi-có-mặt trong khi lời hứa là quan hệ | Thẻ b bọc ngoài của Google Docs làm cả trang đậm; E11 vẫn xanh | Tệp markdown kỳ vọng viết trước, so từng byte; chiều đỏ đậm tràn | fixed: E11 so từng byte với clipboard-word.md và clipboard-gdocs.md viết trước; thêm chiều đỏ «đậm tràn: clipboard-gdocs» |
| P1 | evals | E14j đọc ảnh ở `_acceptance/kho-tai-lieu/evidence/` còn E13b, E14 ghi ở `.acceptance-runs/` | Bộ chấm không thấy ảnh, chấm từ tài liệu thiết kế, duyệt sai bố cục 390 | Nói rõ bước chép ảnh; thiếu ảnh thì không chấm | fixed: theo luật kit (lệnh ghi `.acceptance-runs/`, vòng S4 chép bằng chứng sang `evidence/`), E13b và E14 ghi rõ bước chép từng ảnh; E14j thêm ảnh `ktl-doc-390.png` và luật thiếu ảnh thì UNCERTAIN «thiếu ảnh: <tên>» |
