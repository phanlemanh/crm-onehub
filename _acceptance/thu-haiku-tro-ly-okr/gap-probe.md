---
slug: thu-haiku-tro-ly-okr
at: 2026-10-14T17:05:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

# Phản biện context sạch — thu-haiku-tro-ly-okr

Một tác tử tươi (feature-loop:cham-doc) đọc design doc, contract, evals, sổ quyết định, bài học xuyên hồ sơ
(claim-scan, 12 dòng) và ô cơ hội; không đọc mã, không chạy lệnh.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Không eval nào đo biến môi trường tới được tiến trình agent mà thước dựng; E7 thoát 0 bất kể nhánh nào chạy | Nhánh Haiku lọt biến, chạy Gemini; bảng ghi số Gemini dưới tên Haiku và Cổng Bằng chứng ký phép so sai | Ca tiến trình con ở E2; so-mo-hinh đọc lại model.phien-chon và ô model kho đo, lệch thì mã 2 | fixed: AC-2 thêm ca tiến trình con, AC-7 và E7 thêm kiểm nhánh thoát 2 |
| P1 | evals | NGUONG không ghim vào số của ô cơ hội, không ca biên, không ca Tác nhân, docBoDung thử trên log không phải agent-builder | NGUONG lệch (28 thành 25) mà E6 vẫn xanh; Gemini 2/3 bộ dựng in đạt | E6 ghim NGUONG từng giá trị, biên hai phía mỗi vế, ca Tác nhân 3/3 và 2/3, bộ đọc theo id eval | fixed: AC-6 và E6 viết lại; docKetQuaEval đọc dòng của đúng id trong đầu ra eve eval |
| P1 | design | Dòng sổ d-3 trích MUC_SUY_NGHI chỉ liên quan, không quyết suy nghĩ adaptive cho Anthropic; thêm nó đổi tiền đề 1 958 token của Hỏi-2 [tac-nhan-va#F2] | Haiku dừng length hay hết lease vì suy nghĩ, lượt so kết luận sai giả định 1 | Đổi nguồn hoặc gộp vào Hỏi-2; bảng in số theo kết cục | fixed: bỏ khoá anthropic (d-10 thay d-3), Hỏi-2 ghi rõ điều kiện đo (d-11 thay d-7), bảng E7 in số lượt theo outcome |
| P2 | evals | E8 không có đáp án, hội đồng chấm có-mặt thay vì đúng | Tài liệu ghi sai mã hay sai chỗ đổi mà vẫn Đạt | Đưa đáp án vào câu hỏi | fixed: câu hỏi E8 mang đáp án nguyên văn, sai đáp án là Không đạt |
| P2 | contract | Ô Gemini tường minh trên trục Coverage không có AC; đối chứng dương E3 không kiểm mục trả về | Gemini tường minh ra trần sai, nhánh Gemini của lượt so đo sai cấu hình | Thêm ô vào AC-1 hoặc E3 | fixed: AC-1 và E1 thêm nguồn Gemini tường minh, E3 kiểm mục trả về của mã hợp lệ |
