---
slug: zalo-va
at: 2026-10-05T07:00:31Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Ô HTTP 408 chưa ghim thân Zalo giả trả kèm, và chưa nói lop nào đúng khi zaloGoi không ném ở 408 mà trả thân JSON | Zalo giả trả HTTP 408 kèm thân ok:false 408; bên phân lớp chỉ thấy ok-false-408 nên E8 đỏ oan, hoặc thân không phải JSON thành sai-khuon và không ô nào thật sự đo HTTP 408; chiều đỏ «mọi 4xx là token sai» xanh oan vì 408 không bao giờ bị ném | Tách hai ô HTTP 408 (thân ok:false 408, thân không phải JSON) với lop mong đợi; chiều đỏ riêng bỏ nhánh đọc error_code tạm trong thân | fixed: hai docBot cùng gọi zaloGoiTho; lop = http-<mã> khi HTTP khác 200 dù thân ra sao; AC-1/E1 thành 11 dạng, thêm ô HTTP 400 kèm thân 429 và chiều đỏ bỏ nhánh đọc thân |
| P1 | contract | Ngưỡng chết đếm token-sai mang lớp tạm, nhưng ketLuan do chính bộ phân lớp suy ra nên hàng như vậy không thể sinh ra; ca gieo của E9 là dữ liệu không thể tồn tại [tro-ly-kho-dung-phien#F1] | Zalo quá tải trả một mã ngoài tamLoi (vd 400); token đúng bị báo sai, hàng ghi token-sai http-400; bộ đếm in 0 và ngưỡng chết đọc thành sống | Ghi vân tay token; bộ đếm thêm dòng token-sai trùng token đang chạy; E9 gieo bằng đường ghi thật | fixed: AC-8 thêm vanTay (12 hex đầu sha256), dem-getme in «token-sai trên token đang chạy»; E9 gieo bằng datBot thật bị từ chối rồi được với cùng token, đối chứng token khác in 0 |
| P2 | evals | E9 chỉ gieo một phần tử của lớp tạm | Bộ đếm khớp lớp tạm bằng mẫu chỉ 408 hoặc 429, sót 5xx; cấu hình lùi 5xx về token-sai thì bộ đếm vẫn in 0 | Ma trận đủ lớp tạm viết trước, chiều đỏ thu danh sách về 408/429 | fixed: bộ đếm dùng danh sách mã tạm riêng (408, 429, 5xx, không đọc ZALO.http); E9 ma trận 10 ô, chiều đỏ ghim ô http-503 |
| P2 | evals | E3 chỉ đo hàm chọn kênh, không đo nhắc thật đi kênh nào sau khi kiemBot trả loi | Nhịp dispatch đọc kết quả kiemBot và bỏ Zalo khi loi; zaloBotName giữ, kenhSeDungCua vẫn zalo, E3 xanh mà nhắc vẫn đi Slack | Một ô chạy nhịp dispatch thật, Zalo giả nhận một lần gửi nhắc | rejected: nhắc sáng chọn kênh tại lúc gửi bằng kenhSeDungCua; dispatch.ts chạy kiemBot song song với lenLichNhac trong Promise.all và không đọc kết quả của nó, nên kenhSeDungCua là đúng chỗ quyết |
| P2 | evals | E5 chỉ đo câu chào có hai nhãn, không đo quan hệ đường đi | Câu mới viết «Cài đặt › Nhắc buổi sáng › Nối Zalo» trong khi «Nhắc buổi sáng» không nằm dưới Cài đặt; E5 xanh mà người mới đi lạc | Không nhãn mục điều hướng nào khác đứng trước «Nhắc buổi sáng»; chiều đỏ chèn «Cài đặt ›» | fixed: AC-5 và E5 thêm vế đó, đối chứng dương và chiều đỏ ghim thông điệp |
