---
slug: khung-khong-con-dung-chu
at: 2026-10-09T14:54:28Z
verdict: findings
p0: 0
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract,evals | AC-3 nhắc khung lỗi của K4 nhưng E4 không chạy và không chặn diff trên bài của K4 | Bài của K4 ghim câu cũ, người làm sửa kỳ vọng cho xanh, E4 vẫn xanh | Chặn git diff và chạy kara-ban-ghi.dom.tsx -t khung-loi | fixed: kkc_hoi_quy chặn diff cả hai tệp và chạy bài khung-loi của K4; AC-3 gọi tên tệp |
| P1 | design,evals | Tiền đề «xoá và đường dẫn sai đều ra NOT_FOUND» chưa đo bằng mã lỗi thật [khung-loi-ban-ghi-dung-ly-do#F1] | Đường dẫn cắt cụt ra mã khác, người cầm liên kết hỏng không bao giờ thấy câu mới, mọi eval vẫn xanh | Eval backend-effect đọc error.data.code thật | fixed: AC-1 gắn (cross-layer); thêm E7 dùng lại klg_ma_that của K4b (id vừa xoá và id chưa từng có ra NOT_FOUND trên phiên đo thật) |
| P2 | evals | Đối chứng dương tiêu đề và nút không ghim chuỗi nguyên văn | Đổi nút tiếng Anh, bài so với messages vẫn xanh | Ghim literal bốn chuỗi và chiều đỏ cho nút tiếng Anh | fixed: E1 ghi literal tieuDe/dong vi và en; chiều đỏ đổi dong tiếng Anh |
