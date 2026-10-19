---
slug: chep-viec-can-lam-cu
at: 2026-10-13T08:44:59Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design (sổ d-5, d-7) | Hai lựa chọn người dùng thấy được máy tự quyết với căn cứ không đứng: việc chưa chép chỉ đọc và bỏ activities.complete (lối «giữ ô tích» vẫn sống), và activities.create TASK trả 400 (câu trích ngưỡng không quyết giữa 400 và đổi thành Việc). | Cổng 1 ký mà tưởng chỉ đọc là lối duy nhất; trong khoảng trước lúc chép và với việc chép lỗi, không ai tích xong được việc cũ; người gọi API nhận 400 mà không ai chọn điều đó. | Chuyển hai dòng sang chi-nguoi, đưa lên thẻ thành Hỏi-5, Hỏi-6, mỗi câu kèm lối còn sống. | human-gate1: dòng sổ mới d-20261013T084313Z-15 (thay d-5) và d-20261013T084313Z-16 (thay d-7) mang can_cu chi-nguoi; lên thẻ thành câu hỏi. |
| P1 | design, contract, evals | Không có phép quét cả lớp «mọi chỗ ghi activity loại TASK» theo ma trận viết trước; builder-runtime.ts không được nói là đọc hay ghi. | Một đường ghi thứ năm còn chạy sau gộp; mọi eval xanh mà taskTaoSau ≥ 1, vế 14 ngày CHẾT. | Eval quét tĩnh so với ma trận viết sẵn trong design, kèm cặp đột biến cấy một lời ghi TASK. | fixed: design thêm mục «Mọi chỗ còn nói TASK sau vòng này» (builder-runtime.ts là khai quyền, không ghi); AC-6 thêm vế quét; E14 rang/quet-task.mjs; E13 thêm cặp (k). |
| P1 | design, contract (AC-1, AC-3), evals (E1, E2, E3, E10) | Bộ hình dữ liệu đem chép không phủ việc mở không gắn đối tác của người tạo không còn nhận được việc; E2 dùng ca «người tạo bị xoá khỏi user» không thể có thật; không có cách biết trước số việc sẽ chép hỏng. | Chủ kho chạy --chay trên production, n việc báo lỗi, vế lệch 0 CHẾT mà không bước nào cảnh báo trước. | Ma trận {mở, xong} × {gắn đối tác, chỉ kế hoạch, không gắn} × {thường, okr, rời}; một số «sẽ chép hỏng» đo trước khi chạy. | fixed: luật người nhận áp cho MỌI việc mở (dòng sổ d-20261013T084313Z-14 thay d-2); design ghi createdById bắt buộc và khoá Restrict nên ca null hay user bị xoá không có; AC-3 và E3 thành ma trận 18 ô; E2 cấy lỗi qua tham số hàm chép thay vì ca không thể có; thêm chế độ chạy thử --chay --thu in danh sách loi trước khi chạy thật (AC-2, E2, E10). |
| P1 | evals (E2, E3, E4, E10) | Bản in JSON của CLI khi --chay và --dao — thứ chủ kho dán để đọc ngưỡng — không được đo; không đo đọc --nguoi, số trước/sau, và đường đi khi đã có ALLOW_REMOTE_DB=1. | Lỗi đọc cờ hay in số sau trước khi ghi xong: eval xanh mà bản in dán vào #375 sai, hoặc lệnh không chạy được trên production. | E10 chạy CLI với --chay --nguoi, --nguoi sai, --dao, --dao --ca-ban-da-doi; đối chứng dương của bộ chặn. | fixed: AC-10 và E10 thêm các ca CLI ấy với đáp án viết trước, cộng chạy thử và đối chứng dương ALLOW_REMOTE_DB=1. |
| P1 | design, contract (AC-4, AC-12), evals (E12) | Kế hoạch đảo không nói thứ tự lùi khi mã cũng phải lùi, và thứ tự migrate trước khi app, agent nhận lượt. | Lùi mã khi bản chép còn: một việc hiện hai lần, ma-lech cũ giao trùng; deploy trước migrate làm lời đọc dòng thời gian và ma-lech lỗi. | Design và docs/production.md ghi hai thứ tự; AC-12, E12 thêm điều thứ sáu. | fixed: design thêm mục «Thứ tự lên và thứ tự lùi»; AC-12 và câu hỏi E12 thêm điều (6). |
