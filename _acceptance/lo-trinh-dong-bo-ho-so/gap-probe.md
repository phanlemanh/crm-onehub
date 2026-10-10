---
slug: lo-trinh-dong-bo-ho-so
at: 2026-10-10T09:16:44Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chiều đỏ của E4 đặt trên đỉnh trước vòng này trong khi bản thiết kế nói việc trả tiêu điểm chỉ được giữ nguyên | Chạy chiều đỏ trên đỉnh cũ mà E4 vẫn đúng, eval không phân biệt được | Bản sao chủ đích làm hỏng việc trả tiêu điểm, ghim thông điệp | rejected: ngăn cũ thật sự trả tiêu điểm về đầu trang (thấy trên production 10/10) nên đỉnh cũ đỏ thật; câu sai nằm ở bản thiết kế — fixed: thiết kế và AC-4 ghi rõ đây là chỗ sửa |
| P1 | evals | E5 chỉ đo con trực tiếp và td, không bắt chữ cắt bằng dấu ba chấm bên trong; không có đối chứng dạng dòng phụ | Ngày cắt bằng dấu ba chấm trong phần tử con vẫn ra ĐÚNG | Đo mọi phần tử con cháu, đếm ô theo dạng dòng phụ | fixed: E5 đo mọi con cháu, chặn ellipsis tràn, in số ô theo ba dạng và đòi ít nhất một ô có dòng phụ (mã 2 khi không có); không đòi đủ ba dạng vì dữ liệu thật của cây có thể không có việc trễ hay đúng ngày |
| P1 | design | Tiền đề ngăn tham chiếu mâu thuẫn giữa thiết kế và sổ quyết định; E2 và E3 không có đối chứng dương phía thoả thuận | Ngăn thoả thuận không mang dải ô hay không phải ngăn kéo thì E2 E3 sai hoặc vô nghĩa | Kiểm tiền đề phía thoả thuận trước khi so, mã 2 có thông điệp ghim | fixed: thiết kế ghi RecordSheetFrame dựng trên DetailSheet; E2 E3 kiểm tiền đề phía thoả thuận trước khi so, thiếu thì mã 2 với thông điệp ghim |
| P1 | contract | AC-9 không nói bài kiểm LT1 được sửa tới đâu | Sửa hay nới bài kiểm ngăn hồ sơ LT1 mà E9 vẫn xanh | Khoá bài kiểm cũ theo diff | fixed: E9 buộc lo-trinh.dom.tsx và ngan-ban-ghi-giu.dom.tsx không đổi so với onehub (bài ngăn hồ sơ LT1 chỉ bám data-* và chữ); phần đuôi AC-1 giao rõ cho ltc_ho_so |
| P2 | evals | Vế chỉ cộng thêm của AC-10 không có thước riêng | Đổi chữ ký DetailSheet rồi sửa vài chỗ gọi mà E10 vẫn PASS | Diff các tệp nhập DetailSheet ngoài lo-trinh phải rỗng | fixed: rang/thiet-ke.sh thêm hai dòng theo diff — chỗ gọi khác không đổi, detail-sheet.tsx chỉ thêm dòng |
