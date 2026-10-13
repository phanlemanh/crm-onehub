---
slug: ngan-ho-so-trong-lo-trinh
at: 2026-10-12T01:54:53Z
verdict: findings
p0: 1
p1: 1
p2: 3
---

# Phản biện context sạch — ngan-ho-so-trong-lo-trinh

Đầu vào: design doc, contract, evals, decisions, bài học từ feature trước (claim-scan, 10 mục), opportunity.md.
Một lượt, không phản biện lại sau khi sửa.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E5 bước 2 đếm mã commit trong HTML dựng chuỗi, trong khi lời hứa của AC-5 là quan hệ ở ranh giới máy chủ → mã khách; không đo sáu con số; không nói ngăn nào mở lúc dựng | Mã khách tự giấu «Số liệu làm việc» thì HTML của member không có mã, E5 xanh mà props vẫn mang token và mã commit xuống trình duyệt; ngăn đóng lúc dựng nên đối chứng owner đỏ trên mã đúng | Mock thành phần khách mà page.tsx dựng, ghi props; 5 vai × 81 việc so với khối thô; props không mang vai; bản sao page.tsx truyền khối nguyên phải đỏ «vai member lọt chu_kho qua props <khoá>» | fixed: E5 viết lại — bắt props của NoiDungLoTrinh qua trang máy chủ thật, ma trận 5 vai × 81 việc so khối thô, khoá props == [dauVao], đếm mã trên JSON props, hai bản sao chiều đỏ có thông điệp ghim |
| P1 | evals | E1–E4 rút tập việc và kỳ vọng từ chính docTrangLoTrinh và khuôn Zod đang đo; các số 81/5/12/14 của Coverage không thành assert [thuoc-7-ngay-loc-pr#F1] | Khuôn cắt vi_sao ở 400 ký tự thì ngăn lệch dải ở 31 việc mà E1 vẫn xanh; bộ đọc làm rơi dải thì việc sang tập «chưa có» và E3 xanh | Kỳ vọng rút bằng JSON.parse thẳng khối, không qua bộ đọc; assert trước bốn số đếm; bản sao cắt vi_sao phải đỏ | fixed: E1 rút kỳ vọng từ khối thô, assert trước 81/5/12/14 với thông điệp «tệp mẫu có <n> việc có dải, đọc được <m>»; chiều đỏ thêm bản sao cắt vi_sao 400 ký tự và bản sao bỏ dải một việc |
| P2 | contract | Đường đo nói E1 giữ vế CHẾT «ngăn khác dải của LO-TRINH.html cùng lượt vẽ» ở mỗi lượt ghim lại, nhưng E1 chỉ đọc tệp mẫu đóng băng; LO-TRINH.html ở gốc không phép đo nào đọc | Kit 2.27 đổi cách vẽ dải mà thân docDuLieu không đổi (vd token thành chuỗi); E1, E7 xanh ở lượt ghim lại, sau gộp trang thật về khung hỏng | Làn có điều kiện đọc LO-TRINH.html ở gốc khi đã là bản 2, mã đã khai khi còn bản 1; sửa chữ Đường đo | fixed: E7 thêm dòng 5 — khi LO-TRINH.html ở gốc mang bản 2, bộ đọc trên chính tệp đó giữ nguyên chín ô và bảy số so với khối thô, cùng mã đã khai 2 trước kit 2.27; AC-7 và dòng Đường đo sửa cho khớp |
| P2 | evals | AC-10 hứa không chữ viết thẳng nhưng inputs của E10 thiếu ho-so-viec.tsx, và tên hai tệp mới chưa ghim trong design | Tiêu đề viết thẳng trong ho-so-viec.tsx lọt hội đồng; hoặc S3 đặt tên khác làm input vắng, E10 UNCERTAIN | Tách vế chữ viết thẳng ra một eval script quét bốn tệp, tự thử hai chiều; E10 thêm ho-so-viec.tsx; ghim tên tệp vào design | fixed: thêm E11 (script chu-viet-thang.mjs, ma trận bốn tệp + khoá vi/en, --pha-thu); E10 thêm ho-so-viec.tsx vào inputs và bỏ vế chữ viết thẳng; design ghim tên hai tệp |
| P2 | evals | E4 lấy href kỳ vọng bằng chính LO_TRINH.timPr của mã đang đo; mẫu URL không ghi ở hợp đồng hay design | Mẫu thiếu type=pullrequests thì GitHub mở trang tìm kho, 0 kết quả, E4 vẫn xanh | Ghi mẫu URL cố định trong expected của E4; bản sao bỏ type=pullrequests phải đỏ | fixed: E4 so href với chuỗi cố định https://github.com/search?q=<mã>&type=pullrequests, không gọi timPr; chiều đỏ thêm bản sao bỏ type; design ghi mẫu URL |
