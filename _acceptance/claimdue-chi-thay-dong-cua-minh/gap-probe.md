---
slug: claimdue-chi-thay-dong-cua-minh
at: 2026-09-24T01:15:00Z
verdict: findings
p0: 0
p1: 3
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | AC-2 và E2 chỉ khẳng định phủ định trên ba cột; không có mức sàn đòi dòng lạ còn đủ sau mỗi bài; bộ dò HANG-XOM-BI-DUNG chưa có chiều dương; trục thời điểm thiếu giá trị «trong lúc bài chạy» | Người code chọn phương án bị loại (beforeEach xoá cả bảng): dòng lạ bị xoá trước bài nên E1 E2 E4 xanh mà không đo gì; hoặc bộ dò đọc nhầm cột nên E2 xanh mãi | Chụp dòng lạ trước bài, so mọi cột và đếm sau bài, in HANG-XOM-MAT khi thiếu; E3 đòi bộ dò kêu ở một bài CI; bản sao phá thứ hai thêm beforeEach xoá cả bảng | fixed: AC-2 đổi sang so mọi cột + đủ số dòng; AC-3 đòi bộ dò kêu HANG-XOM-BI-DUNG; thêm AC-9 và E13 (bản sao xoá cả bảng → HANG-XOM-MAT); trục thời điểm thêm «có mặt suốt bài» |
| P1 | evals | E1 và E4 không ghim số bài đã chạy, không đòi 0 bỏ qua, không nói thước đọc luồng nào [chu-cuoi-cung-tien-de#F1] [moi-bai-kiem-dom-deu-chay#F1] | Bản gương thiếu biến cơ sở dữ liệu hoặc preload làm bài tự bỏ qua: 0 pass 0 fail, E1 in 0 bài hỏng và thoát 0; thước đọc stdout trong khi bun in tổng kết ra stderr | Đọc JUnit thay cho stdout; đếm số it( trong file lúc chạy và đòi tests = N, failures = 0, skipped = 0 ở mọi lượt | fixed: E1 E2 E4 đọc JUnit, tests = số it( đếm từ file, skipped = 0; AC-1 ghi rõ đủ số bài, không bỏ qua |
| P1 | contract, evals | AC-4 đòi 0 hỏng trên cả mười file trong khi chín file ngoài phạm vi; không có mức sàn số dòng lạ khi file tasks bắt đầu; E5 chỉ đòi đỏ ở lượt 1 | Lanes nhận dòng identify gieo và đỏ vì lỗi ngoài phạm vi, AC-4 không đạt được; hoặc file khác tiêu hết 22 dòng nên thứ tự giữa và cuối xanh mà không đo gì | Chỉ chấm file tasks; gieo lại và in số dòng lạ đến hạn ngay trước file tasks, đòi ≥ 22, thiếu thì GIEO-DA-CAN; E5 đòi đỏ ở cả ba thứ tự | fixed: AC-4 chấm riêng file tasks, chín file chỉ báo; gieo lại trước file tasks với sàn 22 và GIEO-DA-CAN; AC-5 và E5 đòi đỏ ở 3/3 thứ tự |
| P2 | evals | E6 đo AC-6 bằng sự có mặt của một chuỗi trong nguồn lanes, trong khi lời hứa là quan hệ: nhánh except hỏng thì có bài đỏ | Nhánh except bị bỏ qua hẳn trong tasks.ts, lanes vẫn xanh vì không khẳng định gì về loại bị loại trừ; E6 vẫn xanh | Đột biến tasks.ts trong bản gương ở thư mục tạm cho nhánh except bỏ qua bộ lọc, đòi lanes đỏ; không đỏ thì NHANH-EXCEPT-MO-COI | fixed: AC-6 và E6 đổi sang cặp mã thật xanh, đột biến đỏ trong bản gương ở thư mục tạm |
