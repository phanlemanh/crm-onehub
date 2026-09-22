---
slug: ke-hoach-la-mot-ban-ghi
at: 2026-09-22T04:52:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — ke-hoach-la-mot-ban-ghi

Một tác nhân tươi, chỉ đọc sáu tệp: design doc · `contract.md` · `evals.yaml` ·
`decisions.jsonl` · bài học từ feature trước (claim-scan, 10 dòng) ·
`opportunity.md`. Không đọc mã, không đọc hội thoại brainstorm.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Không tiêu chí nào đo phần nối màn → thủ tục: ô tích, nút giao, ô hạn trên từng dòng có gọi đúng thủ tục với đúng stepId và giá trị không, và có làm mới danh mục và sheet không. E1–E7 gọi thẳng service; E17 là ui-check bị làn máy bỏ qua; E18 chỉ quét tĩnh. Cùng lớp với [khai-lang-gioi-thieu#F1] | Ô tích dòng 2 gửi stepId của dòng đầu nhóm (cùng lớp lỗi dsGhiDanh[0]); ô hạn gửi toISOString() nên máy chủ trả 400; onSuccess không làm mới nên người đóng sheet vẫn thấy Bước 0/4, quay về báo qua chat — đúng vế CHẾT. 18 eval vẫn xanh | Một AC cross-layer + eval dom: bấm dòng 2, bản giả tRPC ghi ba lời gọi với stepId dòng 2 và payload đúng; spy làm mới; hai đột biến có tên | fixed: AC-4 và AC-5 cũ gộp thành AC-4; AC-5 mới là phần nối màn (cross-layer); E19 (ui, dom, spy useCrmCache().plan, hai đột biến) + E20 (backend-effect: đúng ba payload E19 khẳng định, đọc từ một tệp chung, parse qua schema zod của router rồi ghi DB) |
| P1 | contract | Dòng vế CHẾT ở Đường đo dựa vào Activity.createdById của vết buoc.xong, nhưng không AC hay eval nào khẳng định createdById bằng người gọi; E16 dựng tay tên người tạo [dieu-phoi-30-ngay-dau#F1] | setStepDone ghi createdById bằng ownerId, hoặc bằng rỗng khi gọi thẳng service; phép so createdById với assigneeId sau hai tuần luôn ra «cầm trịch đánh dấu hộ» — vế CHẾT báo giả | AC-1/AC-2 thêm vế createdById; E2 gọi với phiên người B khác cầm trịch và người được giao; đột biến ghi ownerId | fixed: AC-1 và AC-2 thêm vế createdById là người bấm; E1 thêm dòng 5 và đột biến «mong B / nhận O»; E2 thêm dòng 4 với người thứ ba B; design doc thêm bất biến 4 |
| P1 | evals | AC-14 hứa cho cả lớp vết, E16 chỉ đo một trong chín kind; buoc.giao — thứ opportunity.md đòi — không có assert; meta dựng tay [truong-tu-tao-o-cai-dat#F1] [dieu-phoi-30-ngay-dau#F1] | buoc.giao bỏ giao hiện «undefined»; buoc.doiHan hiện chuỗi ISO; keHoach.dong rơi về nhãn dự phòng — E16 vẫn xanh | Ma trận viết trước chín kind, mỗi dòng một assert trên textContent; fixture round-trip qua bên ghi thật; đột biến xoá nhánh buoc.giao | fixed: AC-14 viết lại cho cả chín kind; E16 ma trận viết trước 10 dòng (buoc.giao hai chiều); fixture dựng bằng CHÍNH hàm dựng vết xuất từ packages/validation mà service gọi khi ghi (design doc bất biến 5 — một khuôn cho bên viết và bên đọc) |
| P1 | contract | Notes khai trả năm khoản Known limits của vòng một mà không khoản nào có AC hay eval — người ký tưởng đã được đo | planById lỗi vẫn hiện «chưa có bước»; nút gỡ gửi hai lần; dải số tự tính lệch danh mục — bộ đo xanh, biên bản ghi đã trả nợ | Mỗi khoản một AC + eval, hoặc bỏ câu khai | fixed (lối b): Notes viết lại — chỉ Ngoài-5 tính là đã trả vì E19 đo nó; bốn khoản còn lại ghi rõ «thiết kế có đổi nhưng không có phép đo nên không tính là đã trả» |
| P2 | evals | E10 dòng 2 là khẳng định âm cho phép chạy trên tập rỗng, nên đột biến targetsOf bỏ qua planId không thể làm nó đỏ [loi-moi-da-huy-van-cho-vao#F1] | Xoá K xong không còn bản ghi sống nào bị vết kế hoạch đóng dấu — dòng 2 xanh suông, bất biến 3 không được đo | Gieo bản ghi sống có lastActivityAt từ vết planId, hoặc bỏ dòng 2 và thu hẹp AC-10 | fixed (thu hẹp): vết kế hoạch không bao giờ mang contactId hay dealId nên tập đó rỗng theo thiết kế; AC-10 thu về vế xoá dây chuyền + cá nhân còn lại; E10 đột biến đổi sang onDelete SetNull; design doc viết lại bất biến 3; Notes ghi lý do |
