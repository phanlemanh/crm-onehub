---
slug: bo-chu-lap-keo-tha
at: 2026-09-28T12:50:00Z
verdict: findings
p0: 0
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Lớp màn thật của AC-6 chỉ có phép đo chuỗi-có-mặt trong khi lời hứa là vắng một vế [may-soan-de-xuat#F1]; E6u chạy `man-tai-nguon.mjs` vốn chỉ khớp chuỗi con «Kéo tệp vào đây» | Giữ câu cũ trên màn thật thì thước vẫn «buoc 1: dat», exit 0; AC-6 PASS nhờ S4 đọc ảnh sơ sài | Thước `rang/` riêng đọc `innerText` của vùng ở 1440 và 390, assert bằng trọn ba chuỗi; chiều đỏ bản sao giữ câu cũ | fixed: E6u nay là `rang/man-chu.mjs` đo bằng trọn nút + từng con của cột chữ ở 1440/390, chiều đỏ trên bản sao `tai-lieu.ts` giữ câu cũ với thông điệp ghim «chu vung keo tha man that lech»; `man-tai-nguon.mjs` chuyển sang AC-5 (E5c) làm thước hồi quy |
| P2 | evals | E5b chỉ đo lịch sử đã commit; không ghim hành vi khi thiếu ref | Sửa chưa commit một tệp đo đã ký vẫn ra «0 tep bi cam»; clone nông chạy qua với diff rỗng | So merge-base với cây làm việc + tệp chưa theo dõi; thiếu ref thì mã khác 0 | fixed: E5b so `git diff <merge-base>` (cây làm việc) cộng `ls-files --others`; thiếu `origin/onehub`, merge-base hay sha thì exit 2 «KHONG DO DUOC»; thêm chiều đỏ sửa chưa commit |
| P2 | contract | AC-6 hứa cả việc tải lên (backend) mà không có nhãn (cross-layer) hay eval lớp backend [toan-canh-okr#F1] | Phiên đo thiếu cấu hình lưu tệp làm đỏ một vòng chỉ đổi chữ; người ký đọc AC-6 như bằng chứng cho việc tải lên | Rút vế tải lên khỏi AC-6, để thước đã ký chạy nguyên văn | fixed: AC-6 chỉ hứa chữ trên màn thật ở 1440/390 và không tràn ngang; việc tải lên ghi ở Notes là lời hứa của `may-soan-de-xuat`, chạy lại bằng E5c dưới AC-5 |
