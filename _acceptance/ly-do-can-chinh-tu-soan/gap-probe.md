---
slug: ly-do-can-chinh-tu-soan
at: 2026-10-08T16:00:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design | Design lệch contract ở `lyDoTuKara`: mục 1 ghi hai cột, mục 2–4 không đặt dấu Kara, Rủi ro nói «ba trường» trong khi AC-4 đòi bốn | Cài theo design đã duyệt thì E1 đỏ «mat dau Kara», E5 thiếu khoá, E6 A không có dấu; ba tệp dom thiếu một trường làm check-types đỏ | Sửa design mục 1–4 và Rủi ro; E5 khẳng định tập khoá đủ bốn | fixed: design mục 1–4 nay ghi ba cột, đưa vào và câu UPDATE đặt `lyDoTuKara`, khuôn trả bốn trường; Rủi ro và Notes ghi «bốn trường»; E5 ném «thieu khoa <tên>» khi thiếu |
| P1 | evals | E7 quét «mọi đường đọc» mà không có ma trận viết trước; danh sách loại trừ do bài tự viết; không chứng lời gọi trúng dữ liệu; không quét REST | Chi tiết KR đích lộ `lyDo` nhưng bài xanh vì gọi sai id, vì thủ tục bị loại trừ, hoặc vì lộ qua REST | Ma trận trong contract có tên, đầu vào, số đếm, gồm REST; so tập thủ tục của router; mỗi phản hồi phải chứa id đích | fixed: AC-6 ghi ma trận lõi tám thủ tục qua tRPC và REST (16 lời gọi) cộng mọi thủ tục query còn lại; E7 so tập (a) ∪ (b) với router lúc chạy («ma tran lech router»), đòi id mục tiêu của K trong mỗi phản hồi lõi («khong trung du lieu») |
| P2 | evals | E1 không ghim chuỗi có khoảng trắng hai đầu, không có cặp phá bước cắt; E2 đòi ghi `viSao` rỗng qua bộ ghi nháp vốn đòi ít nhất một ký tự | Mã không cắt mà E1 vẫn xanh; E2 đỏ dù mã đúng, hoặc lách bằng hàng tự dựng không nói ra | E1 gieo nguyên văn có khoảng trắng, cặp (i) bỏ cắt; E2 nói rõ nguồn dữ liệu cũ | fixed: E1 gieo «  Tăng tỷ lệ chốt thêm khoảng 9 tỷ  » và ghim bản đã cắt; thêm cặp (i), SO_CAP_KHAI = 9; AC-2 và E2 ghi rõ đó là dữ liệu cũ, gieo bằng gieoDongNhap rồi đặt noiDung bằng Prisma, kèm đối chứng noiDungSoan parse được |
| P2 | evals | AC-3 đi qua backend mà E3, E4 thiếu `layer: backend-effect` | Bộ kiểm cross-layer ghi AC-3 chưa đo lớp hiệu ứng backend | Đặt layer cho E3 | fixed: E3 mang `layer: backend-effect` |
| P2 | contract | Đường đo ngưỡng chưa có câu SQL viết ra, không cắt khoảng trắng, câu SỐNG trái AC-2, Cổng 0 còn trống | `viSao` chỉ khoảng trắng bị đếm là CHẾT; người đo tự viết câu mỗi lần một kiểu | Commit câu SQL có `btrim`, thêm eval chạy nó; sửa câu SỐNG; ký Cổng 0 | fixed: Đường đo trỏ `rang/do-nguong.sql` với `btrim(viSao) <> ''`; thêm E11 chạy chính câu đó (đếm 0, đối chứng đếm 1); câu SỐNG/CHẾT ở opportunity đổi theo câu SQL. Cổng 0: human-gate1 — trình anh cùng thẻ |
