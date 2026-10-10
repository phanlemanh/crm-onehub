---
slug: ban-gieo-gop-y-sau-nop
at: 2026-10-09T15:45:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E3 nhận diện «dừng ở bước gieo» bằng hai mẫu chuỗi lỗi, không có dấu hiệu dương đã gieo xong; chiều đỏ của E3 không eval nào chạy | Bàn đo dừng vì phiên đo hỏng hay vì lỗi mới của kiemNopXong ném chưa bắt: không khớp mẫu, E3 in 4/4 qua và ngưỡng CHẾT đọc thành SỐNG; ngược lại một dòng KHONG DO DUOC ở bước đo nhắc «nop» làm E3 đỏ giả | Dấu hiệu dương sau bước gieo; vết làm gieoGopY ném thông điệp lạ để chứng bộ nhận diện không dựa vào chuỗi | fixed: gieoGopY in dòng 'gieo-gop-y: xong …'; E3 qua khi và chỉ khi có dòng đó; E3 có --phan-loai <tệp>; vết (c) của E5 ném 'vet-c' và đòi --phan-loai in 'khong qua buoc gieo' trên chính đầu ra đỏ |
| P1 | evals | Không eval nào chứng nop() thật gọi kiemNopXong trên kết quả thật của nopDeXuatVao; E2 chỉ có dữ liệu viết tay | nop() không gọi hàm kiểm: E1 xanh (đường vui), E2 xanh (hàm đúng), E5 (a)(b) vẫn bắt — lời hứa AC-2 không được kiểm trên đường gieo | Vết (c) kiemNopXong luôn ném 'vet-c' → gieo-thu đỏ có 'vet-c'; ca tu-choi lấy từ nopDeXuatVao thật | fixed: E1 bước (2) gọi lại nopDeXuatVao trên việc đã đóng, đưa kq và hàng agentTask thật vào kiemNopXong, đòi ném; vết (c) thêm vào E5; AC-2 ghi rõ ca từ chối thật |
| P1 | evals | Kết luận của từng bàn đo chỉ nằm trong tệp phụ dưới .acceptance-runs, không vào output của bằng chứng, không ràng buộc dòng có mã và kết luận | Bàn đỏ ở bước đo không hiện trên thẻ Cổng 2; tệp phụ bị dọn thì kết luận mất | In bốn dòng '<khoá>: ma <n> · <KET LUAN hoặc KHONG DO DUOC>' ra stdout, thiếu thì đỏ; bản giữ lâu nằm trong ranh giới | fixed: E3 in bốn dòng ra stdout, dòng thiếu kết luận → 'thieu ket luan: <khoá>' thoát 1; ghi _acceptance/ban-gieo-gop-y-sau-nop/evidence/ba-ban-do.txt; AC-3 nêu cả hai nơi |
| P1 | evals | E5 phá san-gop-y.mjs thật trong khi E1 và E3 cùng nhập tệp, không khai chạy nối tiếp | Làn khác chạy bàn đo đúng lúc vết đang nằm trên tệp: đỏ giả, S4 REJECT giả | Vết đặt trên bản sao; đường dẫn bàn gieo truyền vào phép đo; tệp thật không đổi trong lượt | fixed: vết đặt trên bản sao cạnh tệp thật (.san-gop-y-vet-<pid>.mjs, xoá trong finally); gieo-thu và kiem-nop đọc BAN_GIEO; E5 băm tệp thật trước và sau, lệch → thoát 3 |
| P2 | evals | paths của E3 thiếu nop-de-xuat.ts và config.yaml; paths của E2 thiếu nop-de-xuat.ts [d-20261009T084839Z-8] | Vòng sau đổi cách nopDeXuatVao đóng việc hay đổi lệnh r1a_man_thanh: E3 không hoá cũ, PASS cũ giữ xanh — đúng lối lỗi gốc 07/10 lọt | Thêm hai tệp vào paths | fixed: E2 thêm nop-de-xuat.ts; E3 thêm nop-de-xuat.ts và _acceptance/config.yaml |
