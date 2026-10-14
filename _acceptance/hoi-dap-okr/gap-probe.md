---
slug: hoi-dap-okr
at: 2026-10-15T00:00:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Hai lựa chọn chỉ người quyết được mà sổ không ghi: ba ngưỡng «đạt» của AC-9 (100/90/85) và cách đọc vế N1 của ngưỡng ô cơ hội — cùng lớp [tac-nhan-va#F1] | Người ký AC-9 tưởng 90% và 85% là số ô cơ hội đã định; Cổng Giá trị coi vòng đạt theo một định nghĩa không ai ký | Dòng sổ chi-nguoi cho mỗi ý, thành câu Hỏi trên thẻ Cổng 1; AC-9 và Đường đo ghi chờ | human-gate1: Hỏi-4 (ngưỡng) và Hỏi-5 (vế N1) thêm vào sổ, AC-9 và Đường đo ghi [chờ Hỏi-4/5] |
| P1 | evals | AC-9, AC-12 đòi hội đồng ZDR nhưng E9j là hội đồng của bộ kit; bảng kết quả thiếu kỳ vọng và dữ liệu nền nên không chấm được «không bịa» | Câu bịa «KR đang đúng hướng» vẫn được chấm đúng ý; AC-12 sai ngay trên thước | Chấm ở một nơi, có kỳ vọng và ảnh chụp dữ liệu trong bảng | fixed: hội đồng ZDR chấm trong do-hoi-dap.mjs, E9 thoát 1 dưới ngưỡng; bảng thêm kỳ vọng, ảnh chụp giá trị, phiếu; E9j chỉ soát phiếu trên bảng; E12 quét import của lệnh đo |
| P1 | evals | Ma trận quyền chỉ quét cấp Mục tiêu, không có ô KR thuộc Mục tiêu giới hạn | tim_okr khớp tên một KR của q4-phap-che-3, nop_tra_loi nhận trích kr:id; thành viên đọc được số của Mục tiêu giới hạn, E1 và E3 vẫn xanh | Ma trận {objective, kr} × {xem được, giới hạn, mã bịa} | fixed: AC-1, AC-3 nói rõ KR xét theo Mục tiêu cha; E1 thêm từ khoá KR và doc_okr theo mã KR, khẳng định không lộ mọi KR của q4-phap-che-3; E3 thành ma trận 6 ô; chiều đỏ tra quyền KR không qua cha |
| P1 | contract | AC-4 không nói số nào phải khớp; luật miễn để bài kiểm tự đặt | Luật chặt làm Kara nộp lại vô hạn; luật lỏng để «80% kế hoạch» bịa tới người đọc | AC-4 liệt kê lớp số | fixed: AC-4 ba lớp — trường, đếm, miễn (năm, quý); số khác bị từ chối; E4 thêm ca lớp đếm và ca số lạ |
| P1 | evals | AC-6 hứa ở cửa (429, không gọi model, khoá ô gõ) nhưng không eval nào đi qua cửa; E6 tự gieo AiChiPhi theo khuôn bên đọc | Cửa bắt lỗi trả 500 hay vẫn chuyển tiếp; hook ghi khác khuôn nên trần tiền không bao giờ cắn | AC-6 cross-layer, eval qua cửa thật, trần gieo bằng hook thật | fixed: AC-6 gắn (cross-layer); thêm E6c qua handler cửa thật với bộ đếm lời gọi agent-okr; E6 và E6c gieo AiChiPhi bằng chính hook chi-phi |
