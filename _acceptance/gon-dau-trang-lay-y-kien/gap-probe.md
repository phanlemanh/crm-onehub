---
slug: gon-dau-trang-lay-y-kien
at: 2026-10-21T01:10:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-4 và E4b chỉ đo ô Ý, không đo câu lỗi; chỉ 390, chưa cuộn | scroll-mb bằng đúng chiều cao hàng trên ô thì câu lỗi dưới ô nằm dưới hàng bám; ca 375 dễ dính nhất; E4b vẫn xanh | E4b 2 khổ x 2 vị trí, khẳng định day loi <= dinh hang, chiều đỏ ghim /SAI AC-4: day loi/ | fixed: AC-4 thêm 375, ca đã cuộn và câu lỗi; E4b ma trận 4 ca + chiều đỏ le-o; design đặt scroll-mb trên khối Field và cuộn khối vào màn trước khi chuyển tiêu điểm |
| P1 | design | Design cho viền và đệm ở mọi khổ, AC-5 đòi lệch <= 1px và không viền ở 1280 | Thêm py-3 và viền làm nút Gửi ở 1280 tụt ~13px, E5 đỏ, phải nới AC sau ký | Chốt một trong hai trước Cổng Phạm vi | fixed: chọn (a) — hàng chỉ bám, có viền và đệm dưới md; AC-5 và E5 khẳng định position khác sticky và border-top-width 0 ở 1280 |
| P1 | design | Áp bản vá Hỏi-1 lên thước hồ sơ đã ký mà sổ không ghi; chiều đỏ E8 không rõ chạy thước nào | Màu xanh của E8 có phần do bớt phép đo; chiều đỏ trên thước chưa vá hỏng ở thanh thẻ trước bước 5 | Dòng sổ S1 trích Hỏi-1; E8 nêu dòng gỡ; chiều đỏ chạy thước đã vá trên onehub, chỉ hỏng E12 bước 5 | fixed: dòng sổ d-20261021T011404Z-7 thay bởi dòng kế (trích nguyên văn Hỏi-1 trong sổ vo-khu-muc-tieu); AC-8 và E8 sửa theo |
| P1 | evals | E9 so với «mong» không neo nền onehub; ba hồ sơ có thể đỏ sẵn sau VK2 | Eval đỏ sẵn trên onehub làm E9 SAI dù không do vòng này, hoặc «mong» điền sau | Danh sách viết trước, chạy trên cây vòng và cây onehub, chỉ SAI khi xấu hơn nền | fixed: AC-9 và E9 so nền origin/onehub, in DO SAN TREN NEN cho mục đỏ sẵn |
| P2 | evals | E6 và E4b là khẳng định âm tính không có đối chứng dương | Thiếu data-slot hay khuôn URL tRPC lệch thì cả hai xanh rỗng | Ca dương cùng lần chạy, thiếu thì KHONG DO DUOC | fixed: E6 thêm «CO BAM gop: 1» trước hai ca âm; E4b thêm «GUI DUNG: 1 yeu cau gopY» |
