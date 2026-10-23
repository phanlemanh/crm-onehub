---
slug: hop-tuan-mo-dung-bo
at: 2026-10-23T16:10:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Căn cứ máy sai ở ba dòng sổ: d-8 trích H4 «tự tin» mà câu không chọn giữa một số và phân bố; d-10 ghi một-lối «không sửa tuanDau» trong khi sửa ở máy chủ không đổi khoá nào; d-1 viện mock useTRPC dù thủ tục chỉ gọi từ page máy chủ không chạm mock khách | Cổng Phạm vi duyệt AC-4 và AC-7 như thể không còn lối khác; sau gộp chủ kho muốn phân bố tự tin hoặc HT2/HT4 đọc tuanDau true cho bộ rỗng và in lại câu sai | d-8 chuyển chỉ-người (Hỏi-5); d-10 và d-1 viết lại căn cứ | fixed: dòng 13 thay d-1 (căn cứ AGENTS.md «A server page computes»); dòng 15 thay d-8 thành Hỏi-5 «Tự tin thấp»; dòng 17 thay d-10 — sửa tuanDau ở máy chủ (bộ rỗng ra false, không đổi khoá; bài API đã ký chỉ khẳng định false cho bộ có KR), AC-7 thêm vế máy chủ (cross-layer), E8 đo, surfaces thêm api |
| P1 | evals | E11 không có ảnh nào có danh sách «Đơn vị có KR» thật — ca mẫu chỉ có phòng ban rỗng, mà phòng ban luôn chỉ có liên kết | Ở 375 nền tối mục Item cắt tên dài hay chìm nền; tám ảnh vẫn đủ nên E11 đạt; màn production 22/10 chưa từng được nhìn | Ca mẫu có chu kỳ con mà OneHub rỗng còn ≥2 đơn vị có KR; E11 thêm ảnh htmb-ds-don-vi, bàn đo đếm Item ≥ 2 và nhãn không cắt | fixed: thiết kế mục «Dữ liệu đo» thêm chu kỳ con của ca; E11 thêm bốn ảnh htmb-ds-don-vi-<khổ>-<sáng/tối> và phép đo danh sách |
| P1 | evals | E8 không so toanCanh với hopTuan của chính khoá được liệt; fixture không có lần cập nhật tuần trước; E7 dựng ô bp:B1 rỗng mà con có KR — hình không thể có | dieuKienDonVi bộ phận bỏ phòng ban con, hoặc toanCanh.daCapNhat đếm cả chu kỳ: mục ghi «đã cập nhật 1» mà Họp tuần của nó in 0/2 — E7, E8 vẫn xanh | E8 khẳng định quan hệ tongKr = soKr, daCapNhat = daCapNhat cho mọi khoá liệt; thêm KR chỉ có lần tuần trước; chiều đỏ hopTuan(bp) bỏ con | fixed: E8 thêm ma trận quan hệ ba khoá, KR tuần trước, tuanDau của goc, hai chiều đỏ mới, và ghi fixture htmb-toan-canh.json từ đầu ra thật cho E7; E7 sửa ma trận đúng hình (danh sách chỉ ở bộ OneHub; bộ phận, phòng ban rỗng ra liên kết); AC-6 và thiết kế mục 4 sửa theo |
| P1 | evals | Đường đầu-cuối chỉ đăng nhập trưởng phòng ban; nhánh phòng-ban-chính và quản-trị chỉ đo trên hàm thuần; lỗi org.tree không đo | page.tsx truyền nhầm mã người so với people[] của org.tree, mọi thành viên rơi về goc; hoặc page bắt lỗi org.tree rồi dùng cây rỗng | E1 thêm hai vai qua Location; E3 thêm ô org.tree ném lỗi kèm chiều đỏ | fixed: E1 phần B đăng nhập thành viên M (Location pb:Q) và quản trị A (Location goc); E3 ma trận hai ô lỗi (okr.access, org.tree) và chiều đỏ «org.tree loi roi ve goc» |
| P1 | contract | Ngưỡng SỐNG «từ thanh bên, từ thẻ con hay từ liên kết không kèm đơn vị» chưa đo đủ ba lối: E1 chỉ gõ URL, E4 chỉ đọc href, thẻ con không có AC; thẻ con giữ bộ đang xem | Tới Cổng Giá trị trưởng phòng vào OneHub từ thẻ con, hoặc điều hướng khách từ thanh bên dừng sai chỗ — mọi eval xanh | E1 thêm bấm thanh bên (điều hướng khách) và bấm thẻ con từ bộ mình; Đường đo nói rõ thẻ con giữ bộ đang xem, hoặc thành Hỏi | fixed: E1 phần C thêm hai lần bấm trong trình duyệt (đếm dòng 7); Đường đo ghi thẻ con giữ bộ đang xem (VK3 AC-5); human-gate1: gộp vào Hỏi-2 (dòng 14 thay d-4) để chủ kho chốt nghĩa «từ thẻ con» |
