---
slug: dau-trang-okr-cho-nut-hoi-kara
at: 2026-10-16T15:20:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Lối «khung xương h-8 cho cả nút Hỏi Kara» không nói vì sao bỏ nút thật mà lần 1 đã chọn (sổ d-20261015T230745Z-1: bề rộng nút theo chữ từng ngôn ngữ) | Ở tiếng Anh nút thật hẹp hơn khung xương, hàng thật một dòng còn khung chờ hai dòng; E1 đo tiếng Việt vẫn xanh | Dòng sổ approach có căn cứ trích lần 1 | fixed: dòng sổ approach mới thay dòng cũ — khung chờ dùng nút «Hỏi Kara» thật, khung xương h-8 chỉ cho ô chọn kỳ và cụm nút theo quyền |
| P1 | contract | Vai ít nút chưa đo: E1/E4 chạy bằng tài khoản quản trị | Người chỉ xem có hàng một dòng ở 375, khung chờ hai dòng làm nội dung nhảy lên khi tải xong | Đo bằng tài khoản vai xem | rejected: phiên đo chỉ có tài khoản quản trị; đưa thành Hỏi-1 cho chủ kho, trục C ghi rõ «chưa đo» |
| P1 | design | Trạng thái giữa (dữ liệu đã về, quyền chưa) hiện khung xương lồng h-7 của HanhDongKhu, thấp hơn nút 4 px mỗi dòng | Ở 375 hai dòng lệch 8 px khi quyền về; E12m không giữ truy vấn quyền nên không thấy | Giữ riêng truy vấn quyền rồi đo | rejected: E12m chỉ giữ một truy vấn; đưa thành Hỏi-2 (khuyến nghị đổi h-7 → h-8 trong vùng DH1), trục E ghi trạng thái giữa |
| P2 | evals | E3(d) hứa «chỉ dau-trang-okr.tsx đổi» nhưng hai tệp mồ côi chỉ có trên nhánh | Gỡ tệp mồ côi không hiện trong diff merge-base..HEAD, nên E3(d) không thấy việc gỡ | git ls-tree origin/onehub | fixed: E3(d) ghi rõ hai tệp mồ côi không hiện và thêm hanh-dong-khu.tsx theo Hỏi-2; vế (a) đo việc gỡ bằng git ls-files |
| P2 | evals | AC-2 vế «bước 2–5 vẫn dat» không eval nào đo riêng; E1 chỉ đòi bước 1 | Sửa khung chờ làm màn khác lệch; E1 xanh vì chỉ đọc toancanh | Đòi đủ bốn dòng «buoc N: dat» | fixed: thêm E5 (AC-2) cùng lệnh kmc_man_do, đòi đủ bốn dòng dat và không dòng lech ngoài toancanh |
