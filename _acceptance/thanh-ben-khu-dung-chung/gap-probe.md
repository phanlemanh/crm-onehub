---
slug: thanh-ben-khu-dung-chung
at: 2026-10-19T11:52:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261019T112346Z-3 chọn mốc md thay lg của bản mẫu với nguồn mot-loi, nhưng lối lg chưa được chứng là chết; cùng dạng [du-an-gantt#F1] | Người ký tưởng md là lối duy nhất; VK2 nhận mốc khác bản mẫu chủ kho chốt | Câu hỏi lên thẻ, hoặc E8 đo thêm 1024 | fixed: dòng d-20261019T112736Z-10 thay d-3 với ràng buộc nêu được — thước đã ký của khung-trang-cai-dat đòi bốn nhãn nhóm Cài đặt hiện ở 768, mốc lg làm đỏ hồ sơ đã ký đó |
| P0 | design | d-8 (bỏ design-pass) trích câu chỉ nói về khu Mục tiêu; d-7 (NavItem) trích câu chọn thành phần, không chọn mật độ; cùng dạng [dich-ten-nganh-bang-bang#F1] | Cột hội thoại thưa hơn, người ký tin là luật kho quyết sẵn | Câu hỏi mật độ lên thẻ hoặc khôi phục design-pass | fixed: d-20261019T112736Z-11 thay d-7 và d-20261019T112736Z-12 thay d-8, cả hai trích câu giao đã ký «gặp cùng một thanh bên khu» — một biến thể gọn riêng là hai thanh khác nhau; đo lại ở S1: NavItem sm là h-7 text-xs, bằng dòng hội thoại hôm nay, nên mật độ không đổi (dòng d-20261019T113129Z-13 sửa giá của d-11); E8 vẫn in số dòng thấy được |
| P1 | evals | Ca ngăn của E6 tự dựng placement panel, không chứng app-icon-rail truyền nó | app-icon-rail quên prop, ngăn rơi về area, điện thoại mất nút xoá | Ca dựng ngăn, chiều đỏ bỏ prop | fixed: placement thành prop bắt buộc của AgentBuilderSidebar (quên là lỗi kiểu); E6 đọc nguồn app-icon-rail.tsx đòi placement panel, thông điệp ghim «ngan mat bo cuc doc» |
| P1 | evals | E8 gieo một cuộc và nhận «vừa khung», hàng ngang Hội thoại chưa từng chạy khi vượt 375px | Hàng dài đẩy rộng khung trò chuyện, trang tràn ngang, bàn đo vẫn xanh | Gieo ≥8 cuộc tiêu đề dài, bắt buộc «cuon» | fixed: E8 gieo 8 cuộc qua tRPC conversations.createBuilder (đường ghi thật, tiêu đề «chưa đặt tên»); tiêu đề dài và cắt chữ đo ở E4; Hội thoại ở 375 bắt buộc cuộn; phá-thử TBK_PHA=tran |
| P2 | design | Panel và hàng ngang cùng hiện ở điện thoại khi mở ngăn, cùng tên chuyển cảnh | Trình duyệt bỏ chuyển cảnh, lỗi trùng tên ở console | Ca DOM panel không mang tên | fixed: panel không mang view-transition-name; E2 khẳng định hai chiều và có chiều đỏ |
