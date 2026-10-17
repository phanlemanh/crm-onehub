---
slug: cho-tac-nhan-lau
at: 2026-10-16T07:05:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ chọn kênh báo ghi một-lối nhưng tự nói Zalo, email cần người quyết; còn lối thông báo trình duyệt chưa ai nhắc. | Chủ kho ký mà không thấy kênh ngoài app đã bị cắt; người đóng trình duyệt chỉ thấy chuông khi quay lại. | Đổi thành câu chỉ người có, trỏ Coverage C3 và Out of scope tới đó. | human-gate1: thành Hỏi-4 (supersedes dòng cũ), khuyên chỉ chuông trong app; lối khác thông báo trình duyệt hoặc Zalo, email. Coverage và Out of scope trỏ Hỏi-4. |
| P0 | design | Dòng sổ «giữ thẻ, không màn chờ riêng» ghi mục-tiêu nhưng câu trích chỉ cấm Spinner, Shimmer, Alert, không quyết hình thức chờ. | Cổng Phạm vi duyệt «chỉ thêm chữ vào thẻ» như luật kho đã quyết; màn chờ riêng chưa từng được hỏi. | Trích câu quyết được, hoặc thành câu chỉ người có. | human-gate1: thành Hỏi-5 (supersedes dòng cũ), khuyên giữ thẻ; lối khác màn chờ riêng. |
| P1 | evals | E1, E3 ghim đồng hồ đúng lúc startedAt rồi gắn thẻ ngay, không phân biệt «từ lúc gửi» với «từ lúc gắn thẻ»; trục rời trang rồi quay lại không có ca. | Bản đếm từ lúc mount vẫn xanh; người quay lại ở phút 2 thấy 0:03. | Ca gắn muộn với startedAt rút từ hàng gửi thật, chiều đỏ đếm từ lúc gắn. | fixed: E1 thêm ca «gan-muon» (startedAt từ builderById, gắn ở +250 s → «4:10» và dòng quá ngưỡng) với chiều đỏ «dem tu luc gui»; AC-1 nói rõ mốc là hàng gửi ở máy chủ. Mã đã dựng đếm từ createdAt của lượt gửi. |
| P1 | evals | E4 chỉ đo vế âm của chống trùng; thiếu hai lượt khác nhau, chuỗi cần trả lời rồi xong, hai sự kiện hỏng cùng lượt. | Khoá theo cuộc trò chuyện vẫn xanh E4 nhưng lượt sau không bao giờ báo xong. | Thêm ba ô vào ma trận viết trước. | fixed: E4 thêm (a) hai lượt khác nhau → 2 dòng, (b) cần trả lời rồi xong → 2 dòng đúng thứ tự, (c) turn.failed rồi session.failed cùng lượt → 1 dòng. Khoá thông báo đã theo luotId. |
| P1 | contract | Ngưỡng 200 giây đúng bằng thời gian chạy bình thường của GLM 5.3 (200, 201 s) mà câu chữ nói «lâu hơn thường lệ»; không dòng sổ nào chọn cặp này. | Nếu production chạy GLM 5.3 thì nửa số lượt bình thường thấy câu sai. | Câu chỉ người có cho cặp ngưỡng và câu chữ. | human-gate1: thành Hỏi-6, khuyên giữ 200 giây theo câu giao và đổi câu thành «Đã quá 3 phút. Kara vẫn đang dựng.»; lối khác ngưỡng theo model sau số đo MH4. AC-3 theo câu trả lời. |
