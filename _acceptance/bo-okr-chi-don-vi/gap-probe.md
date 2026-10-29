---
slug: bo-okr-chi-don-vi
at: 2026-10-28T05:12:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Sổ d-20261028T050849Z-10 để máy tự bỏ thước đọc tuần sau gộp (số lần mở bộ bp: dẫn tới bộ pb: qua menu) theo nguồn một-lối, trong khi chủ kho vừa «giữ ngưỡng đề xuất» có ô này; giữ hay bỏ phép đo của Cổng Giá trị là việc chỉ người có. Tương tự [bao-loi-tac-nhan-sau-cau-hoi#F1]. | Chủ kho ký Cổng Phạm vi tưởng ngưỡng còn đường đọc; tuần sau gộp Cổng Giá trị đọc ô ấy CHƯA ĐO mà không ai quyết bỏ. | Thay d-10 bằng dòng chỉ-người (Hỏi-3) có khuyến nghị và lối khác có giá. | human-gate1: dòng d-20261028T051257Z-13 (supersedes d-10) thành Hỏi-3 — khuyên bỏ thước production vì telemetry của kho chỉ có số đếm theo ngày từ máy chủ; lối khác thêm bộ đếm vào install_daily, giá ghi trên dòng; dòng bỏ ở «Đường đo» trỏ Hỏi-3. |
| P0 | contract | Out of scope ghi «Sơ đồ vẫn cộng dồn» mà không có dòng sổ; Q1 (a) nói «mọi thẻ con» và docs/design.md liệt Sơ đồ là thẻ con. Tương tự [cap-nhat-gan-day#F2]. | Trưởng khối mở thẻ Sơ đồ của bộ khối vẫn thấy mục tiêu phòng con; E1, E4, E9 xanh vì không mở Sơ đồ. | Thêm dòng sổ cho Sơ đồ; nếu Sơ đồ theo luật riêng thì đưa vào Trục B và ma trận 3 × 5. | fixed: đo lại mã — thẻ «Sơ đồ góp vào» là liên kết sang Báo cáo › Sơ đồ /okr/so-do của cả khu (C1 lối b, 24/10), không đọc tập mục tiêu của bộ; dòng d-20261028T051257Z-14 nguồn mục-tiêu trích sổ dat-okr-trong-crm; Out of scope viết lại đúng điều ấy. |
| P1 | evals | E1 chỉ đo danhSach.rows, không đo tập đã bỏ theo đơn vị; E6 dùng daBo giả; Trục D có «lọc trạng thái có Đã bỏ» mà AC-6 không nói. | Phòng con có mục tiêu đã bỏ P1x; bộ khối hiện «Đã bỏ (1)» và bật lên thấy P1x — lọt ngưỡng chết, E1 và E6 vẫn xanh. | Thêm B2, P1x vào ca, cột daBo vào ma trận, chiều đỏ ghim; AC-6 nói rõ bộ lọc trạng thái. | fixed: E1 thành 6 cột × 3 đơn vị = 18 ô có cột danhSach.daBo, thêm B2, P1x, đối chứng dương trên mã trước vòng, chiều đỏ «bp:B lot da bo P1x»; AC-6 và E6 thêm câu «lọc trạng thái đang có giá trị thì không có nút» (dòng d-20261028T051257Z-15); Trục F mới. |
| P1 | evals | Phần màn của AC-2 (bốn ô số bằng các cột danh sách) không có eval; E9 chỉ đòi một con số có mặt trong khi lời hứa là quan hệ. | Danh sách làm tròn khác ô số trên trang bộ, hoặc Tiến độ null hiện 0 %; E2, E9 xanh dù số lệch trên màn. | E9 in ma trận 3 khối × 3 cột so ba nguồn, mỗi ô thông điệp ghim, chiều đỏ. | fixed: E9 in ĐẾM QUAN HỆ 9 ô (DOM danh sách · ô số trang bộ · okr.soBo / countByUnit), thoát khác 0 với «bcd-man: <khối> <cột> lech». |
| P1 | evals | E4 đo AC-4 chưa đủ: không đo «một hàng công cụ», thứ tự tới chân; assert âm tính thiếu đối chứng dương và chiều đỏ cho hai bộ chọn. | NhomDaBo gắn lại không mang data-nhom-da-bo, hay thẻ Việc có hai hàng công cụ: E4 xanh cả 12 ô. | Đối chứng dương trên mã cũ; mỗi ô đúng 1 hàng công cụ; thứ tự đủ năm tầng; chiều đỏ cho NhomDaBo, ChonDonVi. | fixed: E4 thêm 0 Collapsible có số đếm sau bảng, ≤1 hàng công cụ (danh-sach đúng 1), thứ tự vị trí < thẻ con < hàng công cụ < nội dung < chân, đối chứng dương trên cây merge-base, ba chiều đỏ ghim. |
