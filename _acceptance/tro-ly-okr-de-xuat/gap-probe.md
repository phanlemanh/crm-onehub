---
slug: tro-ly-okr-de-xuat
at: 2026-09-28T05:20:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Quyền chỉ ghim ở nút, `troLySanSang`, `troLyDeXuat`; không AC hay eval nào đo ai gọi được `troLyDanhSach` và `troLyQuyet`; E1 đếm «số ô × 2» dù gọi hai thủ tục | Thành viên không sửa được gọi `troLyDanhSach` qua REST đọc hết đề xuất; gọi `troLyQuyet` bác một dòng (nhánh bác không đi qua OkrService nên không bị kiểm quyền), khoá `da-bac` chặn đề xuất đó mãi; E1–E29 vẫn xanh | Ma trận E1 mở sang bốn thủ tục và bốn cách quyết × hai đường; đối chứng dương cho phụ trách KR so tập id; chiều đỏ «bac khong quyen» | fixed: AC-1 mở sang bốn thủ tục, `troLyDanhSach` lọc theo quyền sửa, `troLyQuyet` kể cả bác và bỏ qua trả 403; E1 viết lại ma trận người × đích × nấc × thủ tục × đường, hai chiều đỏ |
| P1 | contract | Mẫu số «đã hiện» của tỷ lệ nhận không có nguồn: không cột nào ghi dòng đã hiện, `het-han` gán lúc đọc | 10 dòng hết hạn sau khi hiện: loại ra thì 9/30 = 30% SỐNG, tính vào thì 9/40 = 22,5%; SQL và thẻ chọn hai cách, E20 vẫn xanh | Một nguồn cho «đã hiện»; E20 dựng dòng hết hạn đã hiện và chưa hiện | fixed: thêm cột `OkrDeXuat.hienLuc` (ghi khi `troLyDanhSach` trả dòng lần đầu) vào migration §5; Đường đo, AC-13 và E20 dùng nó, E20 thêm hai dòng hết hạn và chiều đỏ «mau so tinh dong chua hien» |
| P1 | contract | Chi phí mỗi đề xuất nhận định nghĩa hai cách (tổng `okr.*` tháng ở Đường đo, tách nấc ở AC-13); cột Bóng chia cho 0 | Theo lộ trình bật, tiền 40 lượt bóng/ngày vào tử số làm chi phí mỗi đề xuất nhận ~0,18 US$, ngưỡng ≤ 0,05 báo trượt giả | Tử số chỉ gồm tiền việc nấc bật; cột Bóng là chi phí mỗi lượt; E20 gieo tiền bóng khác 0 | fixed: Đường đo và AC-13 một định nghĩa (nối `AiChiPhi` qua `taskId` tới việc nấc bật), cột Bóng đọc chi phí mỗi lượt; design §10 cùng câu; E20 gieo tiền bóng và chiều đỏ «chi phi bong vao ty so» |
| P1 | evals | AC-7 hứa bấm «Hoàn tác» trên toast đưa trường về `truoc`, nhưng E11 gọi thẳng API và E4 chỉ thấy chữ «Hoàn tác»; AC-7 thiếu (cross-layer) [d-20260927T152602Z-21] | Nút chỉ đóng toast hoặc gửi `sau`; thước hoàn tác đọc 0 suốt hai tuần, ngưỡng UAT xanh giả | E4 bấm Hoàn tác và đọc lại qua API; bài DOM khẳng định giá trị gửi; chiều đỏ «hoan tac gui sau» | fixed: AC-7 gắn (cross-layer) và hứa đọc lại qua API; E4 thêm bước bấm Hoàn tác, đọc lại, đếm bằng `hoan-tac.sql`; E3 thêm ca DOM và chiều đỏ; E11 khai lớp backend-effect |
| P2 | evals | «0 số mới lọt» (E26, Đường đo) và chốt đầu của E22 chạy lại chính `kiemDongDeXuat` — thước là mã đang đo | Model viết «lên năm tỷ» hay «50%» khi KR ghi 0,5; bộ kiểm bỏ sót, chạy lại cùng hàm vẫn ra 0, ngưỡng CHẾT không bao giờ bật | Bộ trích số riêng, độc lập; E6 thêm dạng số tiếng Việt | fixed: `rang/so-moi-lot.mjs` có bộ trích số riêng (không nhập bộ kiểm), E26 thêm ca bộ kiểm hỏng mà thước vẫn đếm; E22 dùng thước đó thay cho chạy lại bộ kiểm; E6 thêm năm dạng số (chữ, tỷ, %, phẩy thập phân) mỗi dạng một cặp; luật `so-moi` ở design §8 nói rõ các dạng |
