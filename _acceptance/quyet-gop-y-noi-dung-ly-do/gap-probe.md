---
slug: quyet-gop-y-noi-dung-ly-do
at: 2026-10-09T23:27:51Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E3/E4 so dòng lỗi với chính bản đồ câu (chuỗi có mặt), không đòi 13 câu khác nhau; design doc không có câu vi/en thật để duyệt | Thợ viết một câu chung cho cả 13 khoá; E3, E4, E6, E8 (c) vẫn xanh; Cổng 1 ký mà chưa ai đọc câu nào; lái-thử chạm ngưỡng CHẾT | Bảng 13 câu vi/en trong design doc; E3/E4 đòi 13 câu phân biệt trên đầu ra DOM và câu can-chinh-chua-cong-bo nói «chưa công bố» / «not published» | fixed: design doc thêm mục «Câu cho người dùng — duyệt ở Cổng 1» (13 dòng vi/en); AC-3, AC-4, E3, E4 thêm tập textContent kích thước 13 và chuỗi «chưa công bố» / «not published» |
| P1 | evals | E6 vế (1) chỉ miễn chuỗi mã trong okr-gop-y.ts, trong khi bảng ánh xạ ở tro-ly.service.ts buộc chứa 13 mã | Làm đúng design, mot-nguon.mjs thoát 1 «ma khai them: tro-ly.service.ts», chiều xanh E8 đỏ, S4 REJECT oan | Miễn bảng ánh xạ khi khoá bằng satisfies Record<LyDoKhongQuyet,…> | fixed: AC-6 và E6 miễn hai tệp tro-ly.service.ts và okr-gop-y.ts, mỗi tệp phải chứa «satisfies Record<LyDoKhongQuyet» (thiếu → «mien ma khong khoa») |
| P1 | evals | AC-7/E7 không miễn dòng import của okr.contracts.ts, mà lyDoKhongQuyet phải được import vào đó | ranh-gioi.mjs thấy dòng import đổi ngoài khối, thoát 1, S4 REJECT oan | Cho dòng import; thêm chiều đỏ một dòng ngoài khối và ngoài import | fixed: AC-7 và E7 thêm «hoặc dòng import»; E7 thêm chiều đỏ --gia-dong → «ngoai-khoi:…» |
| P1 | contract | Ứng viên AC «lỗi tạm thời vẫn là câu thử lại» của opportunity.md không thành AC; không ca nào ném lỗi không mã; mục Đo của design doc lệch số/tên eval | catch trả { ok:false } cho mọi lỗi hoặc rơi về mã mặc định; lỗi Prisma hiện thành lý do cố định; E1–E8 vẫn xanh | AC cho lỗi không mã → INTERNAL_SERVER_ERROR; ca thuần và ca gọi thật 5xx; ca DOM 500 → câu thử lại | fixed: AC-2 thêm lỗi không phải HTTP → INTERNAL_SERVER_ERROR; E2 thành 7 ca (hàng góp ý hỏng → 500 và vẫn cho; lyDoKhongQuyetCua null cho Error cùng câu và lỗi Prisma); AC-5/E5 thêm ca 500 → câu thử lại; mục Đo của design doc viết lại theo E1–E8 |
| P2 | evals | E8 dò chuỗi «gop y khong con cho» và «thieu anh xa» mà E1/E6 không ghim | Vết (b) bị E1 bắt nhưng dot-bien.mjs không thấy chuỗi, báo vết lọt, E8 đỏ oan | E1 ghim «<mã>: gop y khong con cho (trangThai=…)»; E6 ghim «thieu anh xa: <mã>»; E8 chỉ dò chuỗi đã ghim | fixed: E1 ghim ba thông điệp ca lệch; E6 ghim «thieu anh xa» và «hang khong phai chuoi»; E8 dò đúng chuỗi của eval nguồn |
