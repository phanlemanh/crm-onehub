---
slug: danh-sach-keo-chung
at: 2026-10-08T04:52:03Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Lưu thứ tự lỗi ở Tổ chức (gốc, bộ phận) không có AC hay phép đo; E12 khoá to-chuc-chi-tiet.dom.tsx nên không thêm ca vào đó được | Hàm lưu của chi-tiet-goc nuốt lỗi, lời hứa vẫn thành công, SortableSaveList giữ thứ tự vừa kéo và hiện thêm toast đã lưu — Tổ chức tái hiện Ngoài-8, mọi eval vẫn xanh | AC cho Tổ chức: thủ tục giả từ chối thì thứ tự về cũ, một toast lỗi, không toast đã lưu; tệp kiểm mới; chiều đỏ ở bản sao nuốt lỗi | fixed: AC-5 mở rộng ra ba nơi dùng (giai đoạn, gốc, bộ phận); E5 chạy thêm sap-luu-loi.dom.tsx mới, ma trận 3 nơi x 3 dòng có đối chứng dương; xin tệp ở P3-18 |
| P1 | evals | E4 chờ toast thứ hai sau Hoàn tác mà hợp đồng không hứa có toast đó | Bản cài không hiện toast khi hoàn tác xong thì do-man hết giờ hoặc tải lại quá sớm và in SAI; hai bản cài khác nhau đều qua E3 | Ghim kết quả của hoàn tác xong vào AC-3, thêm dòng vào ma trận E3, E4 chờ tín hiệu đã hứa | fixed: AC-3 hứa toast «Đã trả thứ tự cũ» không nút, tay kéo mở lại, và nhánh hoàn tác lỗi; E3 thêm dòng 5–6; E4 chờ toast đó và tay kéo mở |
| P2 | contract | Giai đoạn cuối nhóm (trục C) và người không quyền (ST-khong-quyen) không có AC đo | Nhánh mới bỏ mất khoá giai đoạn cuối nhóm hoặc quên truyền disabled — người dùng bấm được, máy chủ từ chối, không eval nào đỏ | Dòng đo cho mục Lưu trữ bị khoá ở nhóm một giai đoạn, disabled khoá tay kéo, người không quản trị thấy tay kéo và menu khoá, có đối chứng dương | fixed: AC-1 thêm nhánh disabled (E1 dòng 5); AC-7 thêm giai đoạn cuối nhóm và không quyền (E7 dòng 7–8, có đối chứng dương) |
| P2 | contract | AC-7 không nói Hoàn tác lưu trữ đưa giai đoạn về đâu; restore đặt ở cuối nhóm | Người ký hiểu Hoàn tác là trả nguyên trạng; thực tế giai đoạn dời xuống cuối nhóm, cột Kanban đổi thứ tự, đụng ngưỡng SỐNG | Ghi vị trí sau Hoàn tác vào AC-7, đo trên app thật | fixed: Hoàn tác = restore rồi reorder theo thứ tự trước khi lưu trữ, về đúng chỗ cũ; E7 dòng 6 ghim thứ tự gọi và dãy ids; E11 thêm cảnh hoan-tac-luu-tru-1440 |
| P2 | evals | E13 viết cứng bốn tệp, thiếu chi-tiet-goc, chi-tiet-bo-phan và mọi tệp mới | Vi phạm P0 ở tệp ngoài bốn tệp cũ lọt qua, AC-13 đạt sai | Danh sách tệp rút từ git diff so với merge-base, in số tệp, chiều đỏ | fixed: AC-13 và E13 quét mọi .tsx thêm/sửa dưới apps/app và packages/ui/src rút từ git diff; danh sách rỗng thoát 2; có --tu-thu |
