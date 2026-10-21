---
slug: vo-khu-muc-tieu
at: 2026-10-20T00:15:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Vế ngưỡng «trang đơn vị chỉ còn một lớp thẻ ngang» chưa có phép đếm trên bản chạy; E3 chỉ dựng riêng đầu trang | Layout hay trang ghép vẫn dựng một thanh thẻ khác, trang thật có hai lớp mà E3, E4 vẫn xanh | Bàn đo đếm tablist, view-switch, data-khung-tab trong vùng nội dung ở 1280 và 375, tổng phải bằng 1 | fixed: thêm E12 (AC-3) đếm trên bản chạy ở hai khổ, chiều đỏ trên mã chưa sửa ra 2 lớp |
| P1 | evals | E7 chỉ miễn khối redirects() trong khi rewrites() bắt buộc chứa đường cũ; phép quét đo chuỗi có mặt, lời hứa là quan hệ không qua chuyển hướng | E7 đỏ ở mọi lượt vì rewrites; liên kết ghép theo đoạn lọt phép quét | Miễn đúng source/destination đọc từ nextConfig; bàn đo so mọi a[href] với source của redirects() | fixed: E7 nạp nextConfig và chỉ miễn đúng các chuỗi đó; E6 thêm vế quan hệ trên năm màn và thanh bên, phá-thử VKM_PHA=lien-ket |
| P1 | evals | AC-2 hứa chu kỳ đi theo khi bấm sang mục khác, mà E2 chỉ đo href và E10 mở từng đường bằng lượt tải mới | Ô chu kỳ trong layout giữ tên cũ sau khi chuyển trang phía trình duyệt, người tưởng đang xem chu kỳ khác | Bàn đo bấm thật trên thanh, hai chiều, có và không có kyOkr, so tên ô với tên chu kỳ của thân trang | fixed: thêm E13 (AC-2) bấm thật ba chuỗi, phá-thử VKM_PHA=giu-o; design ghi ô chu kỳ đọc chu kỳ hiệu lực mỗi lần đổi đường |
| P1 | evals | E6 chưa viết trước ma trận tám liên kết; đích của soan và toan-canh/suc-khoe chưa rõ | Soạn mở sai đơn vị hoặc kyOkr rơi sau dấu # mà E6 vẫn DUNG | Ma trận 8 dòng có đường và truy vấn đích chính xác, mục sáng, dấu hiệu màn | fixed: E6 viết trước ma trận 8 dòng; soan đích /okr/bo-okr?kyOkr&donOkr&record=soan, toan-canh/suc-khoe?kyOkr giữ kyOkr trước #chuong-trinh |
| P2 | evals | Số «cần ý kiến» trên mục Lấy ý kiến chỉ đo bằng prop viết tay; AC đi qua API mà thiếu tag cross-layer | Layout không nối truy vấn số ý kiến, app thật không bao giờ hiện số mà E1 vẫn xanh | Bàn đo so số trên thanh với số API trả, đối chứng người có 0 | fixed: AC-1 gắn (cross-layer), thêm E14 layer backend-effect so với tRPC thật, phá-thử VKM_PHA=so |

Hai điểm phụ phản biện nêu ngoài bảng, cũng đã xử: E11 mâu thuẫn với design DH11 → bài kiểm DH11 là tệp mới `okr-don-vi-dan-cay.dom.tsx`, không chạm tệp đã ký; câu trích của dòng sổ tên đường chỉ cho đổi hoi-y → dòng d-20261019T170502Z-12 thay bằng căn cứ một-lối theo nếp đường không dấu của khu.
