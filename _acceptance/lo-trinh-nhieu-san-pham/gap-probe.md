---
slug: lo-trinh-nhieu-san-pham
at: 2026-10-19T22:16:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — lo-trinh-nhieu-san-pham

Tác tử tươi (vai cham-doc) đọc đúng sáu tệp: thiết kế, hợp đồng, evals, sổ quyết định, bài học xuyên hồ sơ (claim-scan),
ô cơ hội.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261019T220745Z-6 (sửa nguồn xoá bản chụp) ghi nguồn một-lối trong khi lối giữ bản cũ tới khi nguồn mới lấy được vẫn sống; lựa chọn có xoá dữ liệu người đang đọc mà kho_dao false. Cùng dạng [thanh-ben-khu-dung-chung#F1] [push-ghim-lai-t1#F1]. | Quản trị gõ sai ô nhánh sau gộp: lộ trình đang có người đọc thành khung trống tới khi có người sửa; đánh đổi chưa từng lên thẻ. | Thay d-6 bằng dòng chỉ-người (Hỏi-3), kho_dao true; AC-5 và E8 dòng 3 theo câu trả lời. | fixed: d-20261019T221053Z-15 thay d-6 thành Hỏi-3 (khuyên giữ bản cũ kèm dòng «nguồn vừa đổi»), AC-5 và E8 dòng 3 viết theo khuyến nghị; human-gate1 |
| P0 | contract | d-3 (CRM giữ đường đẩy bằng khoá cá nhân) trích câu không quyết việc bỏ — hàng LT3 còn ghi «không dùng khoá cá nhân»; d-2 (nhịp thay webhook) trích câu chỉ quyết chỗ tải tệp. Cùng dạng [dich-ten-nganh-bang-bang#F1]. | Người ký duyệt Out of scope mà không biết đang cắt một phần hàng đã ký; LT3 đóng trong khi khoá của một người vẫn còn ở CRM. | d-3 thành dòng chỉ-người trên thẻ; căn cứ d-2 đổi sang câu ngưỡng «trong ngày cài». | fixed: d-20261019T221053Z-14 thay d-3 thành Hỏi-4 (khuyên hoãn tới sau 30/10); d-20261019T221053Z-13 thay d-2 với câu ngưỡng của opportunity.md; human-gate1 |
| P1 | evals | Không eval nào đo thành viên được cấp đọc sản phẩm mà không thấy số liệu chủ kho. | Đường đọc sản phẩm truyền vai cố định; A thấy khối số liệu chủ kho, mọi eval xanh. | Vế Then ở AC-4 + dòng E7 vai member, đối chứng owner, chiều đỏ ghim. | fixed: AC-4 thêm vế; E7 dòng 2 + chiều đỏ «thanh vien thay so lieu chu kho: P» |
| P1 | evals | AC-7: cột bản khuôn ở Cài đặt không ai đo; K2, K3 không đi qua tác nhân. | Tác nhân coi phien_ban lạ là khoi-hong; kho kit lên bản 3 thì sản phẩm đứng mãi. | E12 phía tác nhân thêm K2, K3; dòng dom ở Cài đặt cho ô bản khuôn. | fixed: AC-7 thêm vế tác nhân lấy cả ba đời; E12 thêm K1–K3 qua GitHub giả, ô [data-san-pham-khuon], chiều đỏ «khuon moi hon bi tu choi: K3»; lệnh ltsp_khuon chạy thêm san-pham-lo-trinh.dom.tsx |
| P1 | contract | ST-lotrinh-sp-lay-hong có trong bảng trạng thái nhưng không AC nào hứa. | Sản phẩm đổi tên tệp sau khi đã lấy: trang hiện lộ trình cũ như đang tươi. | Vế AC-3 + ma trận E5 trạng thái hỏng × có bản chụp, đối chứng da-lay. | fixed: AC-3 thêm vế; E5 dòng 3 |
