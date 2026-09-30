---
slug: gioi-han-tep-dom
at: 2026-09-30T14:32:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design | Chưa tính ngân sách thời gian cho giới hạn 2 phút; lời hứa «tệp treo vẫn bị cắt khi job còn ngân sách» mâu thuẫn với số liệu của chính design | app:test là gói cuối, lượt xanh chỉ còn dư khoảng 1m21s; tệp treo cộng 2 phút làm job bị cắt trước khi trình chạy thoát, tên tệp mất cùng job | Ghi phép tính ngân sách vào design, hạ giới hạn có căn cứ hoặc nói thẳng giới hạn không cứu được tên | fixed: giới hạn hạ còn 1 phút theo phép tính (3m22s + 1 phút < 4m43s); design có mục «Ngân sách»; Context của contract nói rõ máy chậm thì không giới hạn nào cứu được; entry approach được thay bằng entry supersedes |
| P1 | evals | Khung chạy E1 thiếu timeout từng ca, Atomics.wait không có trần, không dọn tiến trình cháu khi đồng hồ riêng cắt | Bản đột biến bỏ timeout bị bun test cắt ở 5 s với thông điệp chung; tiến trình cháu giữ pipe làm đọc stdout treo và để lại tiến trình mồ côi | Timeout ca 45 s, Atomics.wait trần 20 s, spawn detached và giết cả nhóm, đếm tiến trình còn sống bằng pgrep | fixed: E1 và design khai đủ bốn điều; lượt phá bỏ timeout chạy một lần ở S3 |
| P1 | contract | Con số năm tệp chậm nhất không có AC; soTepChamNhat và maQuaGio không được đối chiếu với cấu hình | Trình chạy liệt cả 40 tệp hoặc viết thẳng slice(0,3) và 124 mà E2, E4 vẫn xanh [may-soan-de-xuat#F1] | E4 đo số mục, tập tên top-N và thứ tự giảm dần theo cấu hình; E1 so mã với CHAY_DOM.tep.maQuaGio | fixed: AC-2, AC-4, E1, E2, E4 đo quan hệ với cấu hình |
| P2 | evals | Chuỗi ghim ở E1, E2 bỏ dấu, lệch design; design không nói dòng nào ra stdout, dòng nào ra stderr | Người viết spec chép chuỗi bỏ dấu thì trình chạy đúng design đỏ | Chuỗi kỳ vọng trùng từng ký tự với design; design khai luồng của từng dòng | fixed: evals viết có dấu; design thêm đoạn stdout và stderr |
| P2 | evals | «Tệp thứ ba không được chạy» đo bằng dòng log vắng mặt; E2 không phân biệt đồng hồ quanh spawnSync với số bun tự báo | Trình chạy vẫn chạy c-xanh nhưng hoãn in thì vẫn xanh; trình chạy lấy số của bun vẫn qua ngưỡng 0,3 s | c-xanh ghi tệp dấu; b-ngu ngủ ở cấp module; đột biến lấy số bun phải đỏ | fixed: tệp dấu c.dau ở E1, E3; b-ngu ngủ cấp module; kết quả thật của lượt phá lấy số bun ghi lại ở S3 |
