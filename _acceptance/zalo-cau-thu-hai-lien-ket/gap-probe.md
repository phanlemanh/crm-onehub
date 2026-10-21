---
slug: zalo-cau-thu-hai-lien-ket
at: 2026-10-19T15:30:00Z
verdict: findings
p0: 3
p1: 1
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-1 ghi một-lối, nhưng lối «moHoi ưu tiên hoiId của lượt» còn sống, chỉ bị gác vì giá, và đóng luôn ca câu trước còn mở | Người duyệt tin hook ở turn.started là cách sửa duy nhất, duyệt mà không biết lối đóng được ca vượt hạn | Thay d-1 bằng một câu hỏi cho người nêu hai lối và giá | human-gate1: d-20261019T152412Z-9 «Hỏi-1» thay d-1; design.md mục «Hai câu cho người» |
| P0 | contract | Dòng sổ d-2 trích hợp đồng l6 để quyết luật «chỉ in khi chính lần gọi ghi được hàng», câu trích không quyết luật đó và lối khác còn sống | Người duyệt AC-2 và AC-5 trên một căn cứ không có; luật đó tạo ca đỏ giả khi moPhien ghi trước | Dòng sổ một-lối có lối chết nêu được, hoặc câu hỏi | fixed: bỏ luật in mới, giữ luật của l6; dòng d-20261019T152412Z-8 một-lối thay d-2; AC-2, AC-5, E2, E5 sửa theo |
| P0 | contract | Ngưỡng câu lỗi model 1/24 và khoản chi Gateway là lựa chọn chỉ người có mà sổ ghi máy quyết | Model mặc định lỗi 2/24 vì lý do ngoài bản vá, vòng đỏ và tốn thêm tiền; hoặc người ký tưởng đã có người chọn | Câu hỏi cho người về ngưỡng và trần chi; E5 đọc ngưỡng từ tệp | human-gate1: d-20261019T152412Z-10 «Hỏi-2» thay d-4; AC-5 và E5 đọc ngưỡng từ rang/nguong.json theo câu trả lời |
| P1 | evals | Ô «moPhien ghi trước hook ở turn.started» không có ca nào | moPhien ghi trước, hook đổi 0 hàng và không in, E5 đỏ giả | Ca E1 moPhien-trước; E5 không đòi đúng một dòng | fixed: thêm ca «zch-lien-ket: mophien-truoc» vào E1 và vế cuối AC-1; luật in giữ của l6 nên hook vẫn in; E5 đòi ít nhất một dòng |
| P2 | evals | E4 đo «lần tra đầu» bằng thời gian nhỏ hơn timHoi.cachMs | Máy CI tải nặng làm lần tra đầu vượt 250 ms, E4 bập bênh | Đếm số lần tra thay vì đồng hồ | rejected: mỗi lần tra lại ngủ đúng cachMs nên thời gian dưới cachMs là dấu hiệu đúng của «không tra lại»; E4 của l6 dùng cùng thước và xanh trên ma trận CI ba máy |
