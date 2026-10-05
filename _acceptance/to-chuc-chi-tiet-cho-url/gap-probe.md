---
slug: to-chuc-chi-tiet-cho-url
at: 2026-10-05T00:58:05Z
verdict: findings
p0: 0
p1: 1
p2: 4
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals (E3), design | E3 chèn trễ 20 ms, dựa vào hai quan hệ thời gian chưa đo (60 nhịp của cho dài hơn 20 ms; bản neo đọc URL trước 20 ms ở cả ba ca) | Máy nhanh: 60 nhịp trôi qua trước 20 ms, bản sửa đúng vẫn đỏ, E3 thoát 1; hoặc doiDong chờ lâu hơn 20 ms, bản neo xanh ở nhap-ba-buoc, E3 thoát 2 | Đo 60 nhịp theo ms, hoặc tính trễ bằng nhịp | fixed: E3 chèn trễ ba nhịp setTimeout(0) nối nhau, không dùng ms; đo: bản neo đỏ đúng ba ca 3/3 lượt, bản sửa 29/29; design ghi số đo 40 ms xanh, 80 ms làm đỏ ca loc tat có sẵn |
| P2 | contract (AC-2), evals (E2) | E2 chỉ so chữ các câu expect; nới được ngoài expect (bớt hàng BON_NUT, bỏ bam, return sớm) | Xoá hàng chua-co khỏi BON_NUT, mọi expect giữ chữ, E2 xanh | So cả tệp, chỉ cho phép thêm vế URL vào cho và chèn cho | fixed: AC-2/E2 bỏ mọi câu await cho rồi so cả tệp từng chữ, cho của neo phải còn đủ theo thứ tự; thêm chiều đỏ bớt hàng BON_NUT, bỏ bam, đổi tên ca, bỏ cho loc tat |
| P2 | evals (E1), contract (AC-1) | E1 đo có mặt chuỗi url.get trong cho, không đo quan hệ cùng giá trị; không quét dạng đọc url khác | cho(... && url.get(\"don\") !== null) — giá trị cũ khác null nên vẫn đua mà E1 xanh | Vế phải là === với đúng giá trị ca khẳng định; mở lớp quét mọi tham chiếu url | fixed: E1 đòi url.get(k) === V với V theo ma trận (x.don, \"chua-co\", \"goc\"); thêm chiều đỏ đổi thành !== null cho cả ba ca; mọi tham chiếu url khác dạng url.get trong ca thoát 2 |
| P2 | evals (E3) | Ghim «?don cũ» bằng chuỗi có mặt, giá trị cũ không viết trước | toBe không in dòng +, hoặc dòng diff có chữ don vì lỗi khác vẫn được ghim | Ma trận giá trị cũ viết trước, so bằng | fixed: ma trận giaTriCu viết trước ở rang/cau-hinh.mjs; mỗi ca phải nhận ≥1 dòng và mọi dòng ?don nhận được phải nằm trong ma trận; ba ca đều dùng toEqual (E2 giữ nguyên chữ) |
| P2 | contract (AC-4, Coverage) | Vế «dưới tải» của đề bài không có eval, Coverage gọi trễ 20 ms là «giả lập máy tải», không có dòng descope | Người ký tin điều kiện tải đã đo trong khi lần đỏ gốc ở pre-push song song chưa tái hiện | Eval chạy kèm tải khai sẵn, hoặc descope có tên | deferred: dòng descope d-20261005T005805Z-5 trong sổ — đo tay dưới khoá s4, ghi evidence/do-duoi-tai.md; Coverage sửa chữ, trục B có ô «máy đang tải» trỏ phép đo tay |
