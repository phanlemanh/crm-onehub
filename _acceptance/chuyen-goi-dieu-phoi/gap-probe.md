---
slug: chuyen-goi-dieu-phoi
at: 2026-10-12T05:32:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design + contract AC-1 + E1 | Bảng phân lớp không có lớp cho khối eval sống của hồ sơ khác còn nhắc `scripts/dieu-phoi/` (ba eval judgment để sống theo sổ quyết định dòng 8) | `kiemChuyen` trả dòng `inputs` của ba khối đó, không lớp nào nhận, E1 «ngoài lớp ≥ 3» và S4 REJECT dù mã đúng; lối xanh duy nhất là sửa hồ sơ đã ký mà E9 cấm | Lớp «eval sống được miễn» với danh sách id viết sẵn; E1 so tập khối sống trả về với danh sách, thừa hay thiếu đều đỏ | fixed: quét lại bằng máy ra bốn khối (ba judgment và sua-paths-e5-soan-okr/E7); thêm lớp và danh sách miễn vào design, AC-1 và E1 đòi tập bằng danh sách, ca đỏ «mien-lech» |
| P1 | E5 (AC-5) | Đơn thợ dựng tay và giờ xin của thợ sớm hơn kiểm chéo, nên «xếp theo mốc» và «mốc bị bỏ, xếp theo giờ» cùng xanh | Đơn thợ thật không mang khoá tra mốc, mọi đơn hoà ở mốc xa nhất, kiểm chéo xin sớm hơn chiếm khoá trước thợ; E5 vẫn xanh | Sinh đơn thợ bằng hàm ghi đơn của gói; giờ xin của kiểm chéo sớm nhất; chiều đỏ đơn thợ mất khoá tra mốc thì kiểm chéo đứng đầu | fixed: AC-5 và E5 dùng ghiDon của gói trên đợt dựng từ gói r2, đơn kiểm chéo ghi trước, đối chứng «doi-chung-gio» (bỏ slug của đơn thợ thì kiểm chéo đứng đầu) |
| P1 | E9 + AC-9 | E9 chỉ duyệt dòng của bảng, không quét mọi con trỏ superseded_by trỏ vào AC vừa mất eval sống; vế «ok khi đã ký» không chạy được ở S4 | Một con trỏ ngoài bảng gãy (ac-thay-khong-con-eval), E9 vẫn xanh, chỉ lộ ở lượt ghim lại sau Cổng 2 | Quét mọi con trỏ ở HEAD qua chungThayBoi; chiều đỏ thêm con trỏ về dieu-phoi-hai-tang#AC-1; vế sau ký ghi thành bước của lượt ghim lại | fixed: AC-9 và E9 quét mọi con trỏ, chấp nhận ok hoặc ho-so-thay-chua-ky khi đích là hồ sơ này chưa ký; ca đỏ «con-tro-gay»; Notes ghi vế sau ký chứng ở lượt làn |
| P1 | Coverage trục B + E5–E7 | Ô «đã cài» (nhánh không biến của mã sản phẩm, đường lượt đêm thật đi) không phép đo nào chạy | goi-dieu-phoi.mjs giải sai ở nhánh không biến, mỗi đêm sau gộp ghi khong-chay-duoc mà mười eval vẫn xanh | Ca HOME tạm có bản cài dựng theo bố cục cài thật; ca bản cài thật khi đã cài | fixed: AC-6 thêm vế dương không biến; E6 (c) HOME tạm có bố cục rút từ đường cài thật của feature-loop, (d) bản cài thật chạy khi giải được, không thì in lý do bỏ; (b) ghi rõ HOME là biến duy nhất resolve-plugin đọc |
| P2 | E6(c) + Coverage trục C | Ô «không đợt (khoá tay)» chỉ có đối chứng phủ định «khác khong-chay-duoc» | dem.mjs truyền sai timDot ở nhánh không đợt, lượt ném lỗi, E6 vẫn đạt | Đòi kết quả dương: xanh, làn chạy, mốc tiến, không tệp xin/; chiều đỏ timDot ném lỗi | fixed: E6 (c) đòi xanh, dấu làn, mốc tiến, không xin/; ca đỏ «khong-dot» |
