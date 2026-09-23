---
slug: tieu-de-cot-doc-tron
at: 2026-09-22T15:09:15Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

# Phản biện context sạch — tieu-de-cot-doc-tron

Một subagent tươi đọc đúng năm tệp (design, contract, evals, decisions, claims từ
feature trước), không đọc code. Bộ artifact lúc đó là bản đầu (còn AC ẩn mũi tên).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Không có tập cột viết sẵn cho từng (trang, khổ); ẩn thêm một cột cũng làm E1/E2 xanh — cùng lớp lỗi [truong-tu-tao-o-cai-dat#F1] | S3 thêm hideBelow cho lastActivity của deals; tiêu đề hết cắt, E1/E2/E5 xanh 50/50, Cổng 2 ký bản đã bỏ cột | Hằng tập nhãn mong đợi theo khoá messages, từ lượt đo cây chưa sửa; chiều đỏ ghim `deals@768/vi thieu cot` | fixed: AC-1 thêm vế tập cột, E1 (a) — tập của cây chưa sửa trừ đúng ba cột của AC-5, nhãn qua hàm messages thật; chiều đỏ ở S3 |
| P1 | design | Người duyệt phải chọn AC ẩn mũi tên khi chưa có số đo cột Tên; AC-8 chỉ có judgment, ui-check từng bị làn máy bỏ qua [ke-hoach-la-mot-ban-ghi#F1] | Bù hụt, không eval máy nào có ngưỡng, Cổng 2 thấy toàn xanh | Đo cột đầu trước Cổng 1, ghi số vào design, thêm khẳng định máy có ngưỡng | fixed: đo trước Cổng 1 — ẩn mũi tên không làm cột Tên rộng thêm nên bỏ (d-20260922T151135Z-6); đo tiếp lộ nhãn một dòng đổi chỗ cắt sang cột Tên, nên đổi sang nhãn hai dòng (d-20260922T153010Z-7); AC-7 đo phần chữ tên NHÌN THẤY ở cả 50 ô, sàn 40px dưới số nhỏ nhất đo được 43px |
| P1 | evals | Lời hứa chạy thước ogd_man_danh_muc của hồ sơ onboarding chỉ nằm ở chữ | Bỏ table-fixed làm lệch bảng onboarding, E1–E9 không chạm trang đó, Cổng 2 ký không ai đối chứng | Eval script trỏ đúng khoá ogd_man_danh_muc | fixed: AC-8 + E8; đã chạy sau rebase 607fe361 — đỏ 48 dòng `khong doc duoc nhan` (bộ chọn của thước đó), đưa lên Cổng 1 (d-20260922T153010Z-9) |
| P2 | evals | Đối chứng dương của E2 đo tràn chứ không đo cắt «…» | Ô thân thiếu truncate tràn sang cột kế mà đối chứng vẫn xanh | Khẳng định trên phần tử text-overflow ellipsis đang cắt và nằm gọn trong ô | fixed: AC-2, E2 — phần tử ellipsis, scrollWidth > clientWidth, mép phải trong ô; chiều đỏ ở S3 |
| P2 | evals | E7 «svg hiện» là khẳng định rỗng ở 1024 | Cột đã sắp vẫn vẽ biểu tượng nghỉ, E7 xanh | Danh tính svg trước và sau bấm | fixed: AC-6, E6 — outerHTML svg ở ba lúc (trước, sau lần một, sau lần hai) đôi một khác nhau; không thêm thuộc tính data-* chỉ để đo |
