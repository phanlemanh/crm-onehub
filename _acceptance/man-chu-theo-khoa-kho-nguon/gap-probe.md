---
slug: man-chu-theo-khoa-kho-nguon
at: 2026-09-28T15:42:00Z
verdict: findings
p0: 0
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals (E3), contract (AC-3) | Vế đối chứng khoá rỗng của AC-3 không có lệnh chạy được: lệnh mctkkn_chieu_do tự gán khoá giả nên đặt rỗng từ ngoài vô tác dụng; E3 ghim thêm chữ «(tien de thieu)» mà AC-3 không hứa | Agent S4 chạy KHO_TAI_LIEU_BLOB_TOKEN= trước lệnh, phép gán trong lệnh thắng, vế đối chứng ra exit 0 và bị REJECT; làn ghim lại không bao giờ đo vế này | Đưa đối chứng vào chính phép kiểm; AC-3 và E3 ghim cùng một chuỗi | fixed: thêm rang/chieu-do-can-khoa.mjs chạy chiều đỏ hai vế (khoá giả → DO DUNG GHIM, khoá rỗng → «ban sao thoat ma 2 (tien de thieu)»); AC-3 ghim đúng chuỗi đó; E4 bỏ ô lệnh mctkkn_chieu_do |
| P1 | design (mục 7), evals (E2) | Chiều đỏ của E2 chép man-chu.mjs sang sao/ mà không nói giữ import tương đối ra sao; không đòi bản sao tới được nút | Bản sao chết lúc nạp module, phép kiểm vẫn có thể «đúng ghim» vì lỗi import nếu chỉ đòi khác 0 | Design ghi cách dựng bản sao; E2 đòi tới được nút trước khi xét thông điệp | fixed: design mục 7 ghi viết lại import thành file URL tuyệt đối và cùng độ sâu ba thư mục; E2 đòi stdout có «nut tai nguon khoa — phien do thieu» (tên nào cũng được) trước, không có → «khoa rong lech: khong toi duoc nut» |
| P2 | contract (AC-1), evals (E1, E4) | Không phép đo nào quan sát khoá API phiên đo thực nhận; ô lệnh E4 chỉ đòi chữ khác rỗng | Lệnh viết ${KHO_TAI_LIEU_BLOB_TOKEN:-gia}: E4 đạt, shell mở rộng thành khoá thật, E1 xanh trên khoá thật | Ô lệnh E4 đòi chữ nguyên văn; hoặc quan sát khoá phía API | fixed: ô lệnh E4 đòi chữ nguyên văn không $ backtick nháy, thêm ca đỏ (c) ${…:-gia}; phần quan sát khoá phía API deferred: biến đặt tường minh thắng .env đã đo (ca rỗng tường minh khoá nút dù .env có khoá thật), ghi ở Coverage trục B |
