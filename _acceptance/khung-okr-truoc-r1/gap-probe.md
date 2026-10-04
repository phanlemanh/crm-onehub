---
slug: khung-okr-truoc-r1
at: 2026-10-04T06:20:00Z
claims_input: ok
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Không có mục «Đường đo» cho ngưỡng của opportunity.md; ngưỡng nói khổ 390 và «trên bản đã gộp», eval chỉ đo 375 trên nhánh; lái thử người lạ không ai nhắc | Một lỗi chỉ hiện ở 390 lọt mọi eval; Cổng Giá trị không có lệnh trả lời «0/9 tái hiện» | Thêm «Đường đo» ánh xạ từng vế; thêm khổ 390 | fixed: contract thêm «## Đường đo» (bốn vế, lái thử là nghi thức tay); AC-1, AC-7, AC-8, AC-9, AC-13 và E1, E8, E9, E10, E15 đo cả 390 |
| P1 | evals | E3 (đo bố cục thật) chỉ phủ 2 dạng, không có «có cuộc đang soạn» — đúng dạng sinh KH2; phép âm tính của E2, E4 chỉ quét trong hàng nút | Dòng tiepMoTa đặt ngay dưới hàng nút: E2, E4 xanh, E3 không đo dạng tiếp, thanh vẫn tụt | E3 ma trận ≥ 5 dạng; âm tính quét cả thẻ đơn vị | fixed: E3 ma trận viết trước 5 dạng + chiều đỏ «thanh nhay: tiep»; E2, E4 quét textContent cả [data-don-vi] |
| P1 | evals | Mốc «trước khi trả» của E3 không có đối chứng dương: không chứng minh request bị giữ | Phép chặn bắt hụt (batch link, nạp sẵn phía máy chủ) → hai lần chụp đều sau-trả, lech=0, E3 xanh oan | Assert dương ở mốc truoc-tra + chiều đỏ tắt chặn | fixed: E3 in «dang tai da bat» (request bị giữ ≥ 1, nút khoá đúng chữ) + chiều đỏ --tat-chan «khong bat duoc dang tai» |
| P1 | evals | AC-8 hứa hiện trọn, design lại ghi «tối đa hai dòng»; E9 chỉ đo cắt ngang và innerText (chuỗi có mặt) | line-clamp-2 cắt dọc tên 3 dòng: scrollWidth = clientWidth, innerText vẫn đủ, E9 xanh oan | Thêm scrollHeight ≤ clientHeight; sửa design; chiều đỏ line-clamp | fixed: design bỏ «tối đa hai dòng»; AC-8 nói không cắt ngang hay dọc; E9 đo scrollHeight + chiều đỏ «o so bi cat doc» |
| P2 | evals | Phần cấm của AC-4 (người không quản trị không thấy nút) chỉ đo ở jsdom với vai đặt tay | Trang suy «quản trị» từ canEdit: E5 xanh, trưởng phòng thật vẫn thấy nút khoá | Ma trận 4 vai thật trong phiên đo | fixed: thêm E18 (ui-check, 4 vai thật từ phiên đăng nhập, cùng lượt bon-vai.mjs) + chiều đỏ «nguoi thuong thay nut: truong-phong» |
