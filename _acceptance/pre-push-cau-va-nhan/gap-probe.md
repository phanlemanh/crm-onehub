---
slug: pre-push-cau-va-nhan
at: 2026-10-22T02:25:00Z
verdict: findings
p0: 2
p1: 1
p2: 2
---

# Phản biện context sạch — pre-push-cau-va-nhan

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261022T014747Z-5 ghi «một lối» cho cách xử ô E9 cũ, trong khi lối chấm lại hồ sơ cũ vẫn sống | Cổng Phạm vi không cân nhắc lối chấm lại hồ sơ cũ; nếu bên đọc không nhận con trỏ thì hồ sơ cũ đỏ sau S4 | Thay bằng câu hỏi chỉ-người hoặc trích căn cứ kit | fixed: d-20261022T014747Z-6 thay d-5 thành Hỏi (khuyến nghị ghim lại bằng máy, E1 ở đây chấm lại; lối khác chấm lại hồ sơ cũ rồi ký lại); bỏ ý con trỏ superseded_by vì kit chỉ nhận ô test/script |
| P0 | contract | Câu trích của d-1 (phạm vi ba trong năm) và d-3 (nhãn theo lyDo) không quyết lựa chọn; Ngoài-5 bị để lại không có dòng sổ | Hai lựa chọn lên thẻ là máy quyết theo mục tiêu, người không được hỏi | Trích câu thật sự quyết hoặc chuyển thành Hỏi | fixed: d-20261022T014747Z-7 thay d-1 thành Hỏi phạm vi (dọn Ngoài-1 tới Ngoài-4, để Ngoài-5); d-20261022T014747Z-8 thay d-3, trích câu «không nói đúng lý do phải chạy đủ bước» của review-findings vòng trước |
| P1 | evals | E6 dựng bộ giả sập ở mọi lần gộp và chỉ kiểm có dòng sap; câu sập do giả tự viết | Bản cài chỉ gắn sap ở lần gộp nhẹ vẫn qua, đúng lỗi Ngoài-3 | Sập ở một sha nặng đã biết bằng bộ phân loại thật, ghim đúng một dòng sap | fixed: E6 cấy lỗi vào bộ phân loại THẬT chỉ khi đẩy 1ddf125b3 (lần gộp nặng), câu sập lấy từ khối catch thật; ghim đúng một dòng «sap 1ddf125b3: …», không dòng lech; chiều đỏ: bản cũ không nhắc sha đó ngoài dòng ca 523 |
| P2 | evals | Biến thể ii, iii của G14 chỉ ghi tắt; không đột biến nào chứng ii, iii tự phân biệt | Bản cài xét tệp mã trước .github vẫn qua | toEqual nguyên dòng cả ba; thêm hai đột biến viết trước | fixed: E3 ghi nguyên dòng cả ba biến thể; E5 thêm ma-truoc-github (đỏ ở iii, ghim chuỗi Received) và ds-ngoai-t1 (đỏ ở ii, ghim chuỗi Received) |
| P2 | evals | Vế «neo của răng pre-push-phan-rieng-pr đúng một lần» của AC-4 không có thước | Mã mới chép lại một dòng neo, đột biến vào lần đầu, răng vẫn xanh | Đếm sáu chuỗi tu, mỗi chuỗi đúng một lần, kèm chiều đỏ | fixed: E10 (rang/neo.mjs) rút 5 + 6 chuỗi tu bằng regex, đếm đúng một lần, chiều đỏ nhân đôi một neo trong bản chép |
