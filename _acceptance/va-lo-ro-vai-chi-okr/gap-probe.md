---
slug: va-lo-ro-vai-chi-okr
at: 2026-10-12T04:40:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

# Phản biện context sạch — va-lo-ro-vai-chi-okr

Một tác tử tươi đọc design, contract, evals, sổ quyết định, bài học xuyên hồ sơ (claim-scan) và
`opportunity.md`; không đọc hội thoại, không đọc mã.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | E8 chỉ có khẳng định âm tính, không dấu hiệu dương trên chính người bị đo; ca chỉ-có-kế-hoạch không có đối chứng; E11 không cặp nào làm E8 đỏ | Ca Slack cùng người cùng ngày sau ca Zalo không tạo hàng mới nên không gửi gì, hai câu âm vẫn xanh dù agent còn gửi tên công ty; ca chỉ-có-kế-hoạch xanh rỗng nếu người đó không có kênh | Đòi fetcher gọi đúng 1 lần và tin có tên KR; Slack dùng người khác; người đối chứng vai member phải có hàng; cặp đột biến cho E8 | fixed: E8 đòi đúng một tin và tên KR trên từng kênh, Slack dùng `vlr-tin-slack`, ca chỉ-có-kế-hoạch có kênh Zalo và người đối chứng `vlr-chi-ke-hoach-member`, tìm hàng theo tiền tố; E11 thêm cặp (e2) |
| P1 | evals | E10 không có vật đã khép gây nhiễu cho chữ «đang mở»; nhánh thoát 0 không đo được trên kho thử chung; vân tay phủ cả năm bảng | Thước đếm mọi bước không lọc trạng thái vẫn in 1/1/1 và xanh; trên production người có bước đã xong ở kế hoạch đã đóng làm số không bao giờ về 0 | Bốn vật nhiễu, theoNguoi vẫn bằng 1; nhánh 0 đo được; cặp đột biến bỏ lọc trạng thái | fixed: AC-10/E10 thêm bốn vật đã khép, cờ `--trong` để đo nhánh thoát 0, vân tay chỉ hàng của người trong ca; E11 thêm cặp (g) |
| P1 | contract | Đường dọn dữ liệu cũ «lưu lại vai okr» trong design không có AC; AC-6 thiếu okr→okr | Lưu lại vai okr mà máy trả sớm khi vai không đổi thì lượt theo dõi còn, ngưỡng không đạt dù mọi eval xanh | Ca D vai okr lưu lại okr → 0 lượt theo dõi, kèm cặp đột biến | fixed: AC-6/E6 thêm ca D (lưu lại vai okr dọn theo dõi; còn bước thì 409); E11 thêm cặp (h); design ghi ô chọn vai ở màn có thể không phát sự kiện khi chọn lại — chủ kho quyết đường dọn ở Cổng 1 |
| P1 | contract | Trục kênh có «Việc của bạn» và Tổng quan nhưng không AC đo; thước CE gọi `dashboard.service.ts` là chỗ ghi | Một thủ tục gom việc kế hoạch bằng đường khác thì người vai okr vẫn thấy tên công ty trong app trong khi E7, E8 xanh | AC gọi hai thủ tục bằng phiên người vai okr, đối chứng dương vai member; ghi rõ dashboard là đọc | fixed: AC-7 thêm `okr.viecCuaToi` không có mục kế hoạch và `dashboard.*` từ chối ở cửa, đo ở E7b qua caller tRPC thật; Coverage và design sửa `dashboard.service.ts` là chỉ đọc |
| P2 | evals | E5 kiểm hai chữ số có mặt, không kiểm số nào là kế hoạch, số nào là bước | Mẫu lời đảo thứ tự tham số vẫn chứa đủ «1» và «0», E5 xanh, quản trị được chỉ sai việc | So nguyên văn với hàm lời; thêm biến thể 2 kế hoạch, 3 bước | fixed: E5 so nguyên văn `WORKSPACE_CONFIG.messages.conViecKeHoach(soKeHoach, soBuoc)`, thêm biến thể (2,3) và vật đã khép không được tính |
