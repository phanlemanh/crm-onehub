---
slug: lo-trinh-doc-ban-chup
at: 2026-10-14T08:11:11Z
verdict: findings
p0: 0
p1: 5
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-8 chỉ đo hàm thuần choVaiXem; không eval nào thử chỗ trang ghép bộ đọc bản chụp, vùng cache và bộ lọc vai; E3 chỉ đo vai chủ | page.tsx lọc vai ở nhánh tệp đóng gói cũ còn nhánh bản chụp trả khối chưa lọc, hoặc lọc bị cache theo người xem đầu; quản trị, thành viên, chỉ OKR thấy số liệu chủ kho; E15 vẫn xanh | Eval ở mức hàm page.tsx gọi, ma trận 4 vai, đối chứng ghim «bản chụp lộ số liệu chủ kho»; hoặc ô member trong E3 | fixed: E15 nay gọi docDauVaoChoVai (hàm duy nhất page.tsx gọi), ma trận 4 vai × 2 nguồn + ca owner rồi member chống cache theo người, kiểm tĩnh page.tsx; E3 thêm pha 4 người xem member trên kho đo. Không gắn (cross-layer): lọc vai chạy ở máy chủ app trên dữ liệu đã đọc, không đi qua API — pha 4 của E3 phủ đường thật |
| P1 | contract | Câu bảo đảm Đường đo «lượt Actions chỉ xanh khi máy chủ đã nhận» trái AC-4/AC-5; lệnh đo tính cả lượt chưa đẩy; ngưỡng chết thứ hai không có dòng Đường đo [kanban-viec#F1] | Chủ kho chưa đặt bí mật, hai tuần mọi lượt xanh kèm notice, trang luôn «(bản dựng)», do-tre in «đạt» | day.ts ghi kết quả từng lượt; do-tre chỉ tính nhan/trung; E17 ô chưa-cài; thêm dòng Đường đo cho ngưỡng thứ hai | fixed: AC-1 thêm ghi chú kết quả từng lượt (E2 ma trận 4 kết quả), AC-9 + E17 ô e chỉ tính lượt có ghi chú nhận/trùng đọc qua chú thích check-run; Đường đo viết lại ba dòng, ngưỡng chết thứ hai khai rõ «không đo trên production, giữ bằng AC-6» |
| P1 | evals | E17 không xét lượt đang chờ bị GitHub huỷ khi lượt mới hơn vào cùng nhóm concurrency | Lô gộp A, B, C; lượt B bị huỷ; trang hiện C trong 3 phút; do-tre cờ B «> 1 giờ», kết luận «không đạt» — tín hiệu kill giả | E17 thêm ô B cancelled phủ bởi lượt C; đối chứng; ghim «lượt bị thay chỗ bị tính là không đẩy»; sửa câu design | fixed: E17 ô f + đối chứng + thông điệp ghim; AC-9 nói rõ lần đổi bị thế chỗ được phủ bởi lượt kế; design §1 và §6 sửa đúng hành vi huỷ lượt đang chờ |
| P1 | evals | E3 không đo nhịp làm mới cache và không khai thứ tự ô so với vùng cache 60 s; ô bản dựng xoá hàng bằng helper rồi tải lại ngay | Cache không bao giờ hết hạn mà E3 vẫn xanh; hoặc ô bản dựng đọc bản chụp cũ còn trong cache → S4 REJECT oan | do-man chạy ô bản dựng trước trên kho trống, rồi POST và tải lại tới khi hiện, assert ≤ nhịp + biên; bỏ xoá hàng bằng helper | fixed: E3 bốn pha thứ tự cố định (bản dựng trên kho trống → POST qua đường thật → chờ ≤ LO_TRINH.nhipLamMoiMs + 15 s → bản chụp), bỏ xoá hàng bằng helper, đối chứng «cache không hết hạn» |
| P1 | evals | Không eval nào tách múi giờ máy chủ khỏi múi giờ người xem | Dòng giờ định dạng ở máy chủ; máy đo cùng múi nên xanh; production UTC → người Việt Nam thấy 08:02 thay 15:02 | E3b emulateTimezone khác máy chủ ở ≥2 ô; đối chứng «định dạng ở máy chủ» | fixed: design §5 — dòng giờ là thành phần khách định dạng theo múi trình duyệt sau hydrat; E3b hai ô America/New_York; E12 chạy TZ=America/New_York và kiểm render máy chủ không in giờ; AC-7 ghi rõ «theo múi giờ trình duyệt, không theo máy chủ» |
