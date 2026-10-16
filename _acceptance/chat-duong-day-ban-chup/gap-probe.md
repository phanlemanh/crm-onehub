---
slug: chat-duong-day-ban-chup
at: 2026-10-15T09:06:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Thước thứ hai của Đường đo lấy sha từ lượt Actions xanh, không từ bản chụp CRM thật sự giữ | Bản chụp nhánh còn sót từ trước LT1d, hoặc chạy tay ngoài Actions, làm trang hiện lộ trình chưa duyệt trong khi gh run list chỉ thấy lượt onehub xanh — Cổng Giá trị đọc SỐNG khi ngưỡng CHẾT đã chạm | Đọc sha của hàng BanChupLoTrinh trên production lúc gộp và lúc hết 14 ngày, so tổ tiên onehub | fixed: Đường đo thước 2 đọc cột sha của hàng BanChupLoTrinh production lúc LT1d gộp và lúc hết 14 ngày |
| P1 | design | Bước chặn sống trong kịch bản của chính nhánh được chạy; nhánh lấy onehub giữa lúc LT1c gộp và lúc LT1d gộp không có bước chặn; dòng sổ d-5 nói quá «chỉ chặn bấm nhầm» | Sau LT1d, ai đó bấm chạy tay trên một nhánh rẽ trong khoảng hở — lượt xanh, CRM ghi lộ trình chưa duyệt, ngưỡng CHẾT chạm | Danh sách nhánh trong khoảng hở bằng git branch -r --contains LT1c --no-contains LT1d; người chọn hướng | fixed + human-gate1: d-20261015T090716Z-10 thay d-5 nêu khoảng hở; Out of scope và Notes nêu ca này; máy đề nghị điều phối xếp LT1d gộp sát sau LT1c; câu môi trường GitHub lên Cổng Phạm vi |
| P2 | evals | Bẫy env CI của bài chay-that chỉ dặn bằng chữ, không eval nào chạy bài dưới env giống CI | S4 xanh ở máy, ci.yml đỏ ở chay-that sau khi đã ký | Chạy toàn bộ bài scripts/ban-chup-lo-trinh với GITHUB_ACTIONS=true GITHUB_REF=refs/pull/1/merge, đòi mã 0 | fixed: thêm E7b (dcn_env_ci) với chiều đỏ bỏ env tường minh ở chay-that |
| P2 | evals | Ô dương của ma trận cỡ chỉ đòi khác 413; thiếu ô biên trần chung; d-4 viện dẫn ô 150 000 không phân biệt 100 000 với 102 400 | Một lớp khác từ chối 1,5 MB bằng mã khác 413, hoặc trần chung khai 100 × 1024, mà E1/E3 vẫn xanh | E1 ô 2 đòi nhan; E3 ô dưới trần đòi 401 UNAUTHORIZED; thêm ô đúng bằng trần và trần + 1 | fixed: E1 ô 2 đòi 200 nhan và sha mới; E3 thành 5 ô (90 000 · bằng trần · trần + 1 · 150 000 · 2 MB + 1) với chiều đỏ 100 × 1024; d-20261015T090716Z-9 thay d-4 |
| P2 | evals | So khớp đúng đường và «khai đúng một lần trong toàn kho» của AC-9 chỉ judgment đo, mà judgment chỉ đọc 5 tệp | Tệp thứ sáu gõ lại chuỗi đường, hoặc khớp theo tiền tố, mà E1–E9 vẫn xanh | Eval script quét kho tìm chuỗi đường và số trần ngoài tệp cấu hình | fixed: thêm E9b (rang/mot-cho-khai.mjs) quét chuỗi đường trong apps, packages, scripts và số trần trong create-app; E9 hỏi điều đọc được trong 5 tệp (khai trong hằng, so khớp bằng nhau); bỏ kiểm phương thức khỏi thiết kế vì không quan sát được — đường chỉ có một thủ tục POST, ô tiền tố chưa có thủ tục nào để đo (rejected phần ô gần giống) |
