---
slug: canh-kr-okr
at: 2026-09-28T07:30:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Vết của thao tác gắn sáng kiến chưa ghim hình after; AC-3 và E4 chỉ soi okr.canhKr, E3 chỉ soi okrViecKr, không soi okrTrail; hồ sơ cơ hội hứa bốn đường vào, hợp đồng đo ba [toan-canh-okr#F1] | Bên cài ghi after = {campaignId, ten}; vai «chỉ OKR» mở tab Vết đọc được tên và mã chiến dịch; E3, E4, E14, E15 vẫn xanh | Ghim after chỉ {loai, campaignId/planId}; đọc vết đi qua lienKetChoVai; E3 so toEqual after và quét okrTrail; E4 thêm đường đọc vết | fixed: thiết kế mục 5 ghim hình after và luật đọc vết; AC-3 thành bốn đường (thêm đọc vết); E3 so after và quét okrTrail; E4 thêm đường vết và chiều đỏ riêng |
| P1 | contract | Đường đo thiếu cột cho ba ngưỡng: tổng ghi nhận, tổng phòng ban, mục tiêu cấp phòng ban; E19 không nói mục tiêu từ mẫu là nháp hay công bố | Ngày 2027-01-11 tuMau/mucTieu lẫn cấp và nháp, tỷ lệ sai; ngưỡng CHẾT «< 10 ghi nhận» không có số | E19 thêm ghiNhanTong, phongBanTong, mucTieuPhongBan, tuMauPhongBan; gieo thêm ca loại trừ; Đường đo trỏ đúng cột | fixed: E19 bộ khoá 13 cột kèm ca loại trừ (bộ phận, nháp) và chiều đỏ tuMau mọi cấp; AC-14 và Đường đo trỏ tên cột; thiết kế mục 8 cùng tên cột |
| P1 | design | AC-4 hứa đính bằng chứng từ hộp thoại cập nhật tuần nhưng thiết kế không nói đi qua thủ tục nào; bảng trạng thái thiếu dòng; E5, E11 không đo đường này | Hai lời gọi rời: mốc xong mà bằng chứng hỏng im lặng; thước bằng chứng đọc thấp giả | guiCapNhat nhận bangChung? trong cùng giao dịch; E5 hai ca; E11, E12 thêm bước; thêm dòng trạng thái | fixed: thiết kế mục 5 ghim guiCapNhat nhận bangChung cùng giao dịch, sai thì cả lần gửi bị từ chối; thêm ST-capnhat-moc; AC-4 nêu vế giao dịch; E5 thêm hai ca; E11 thêm bước, E12 đọc DB |
| P2 | evals | E11 không mở lại đường dẫn record=kr từ đầu dù hướng A được chọn vì đường dẫn riêng | Tải thẳng đường dẫn thì ngăn xếp không biết loại kr, người dán link họp tuần thấy trang trống | E11 thêm bước mở URL ở tab mới và mã không tồn tại | fixed: AC-10 thêm vế mở thẳng đường dẫn; E11 thêm bước buoc-mo-thang kèm mã không tồn tại |
| P2 | evals | E15 là assertion âm tính trên bộ ghi CDP mà không có đối chứng dương | Bộ ghi không bắt được thân phản hồi, đếm 0 trống rỗng, E15 xanh giả | In số phản hồi đã ghi; phiên member cùng bộ ghi phải thấy tên P; chiều đỏ | fixed: E15 in số phản hồi (> 0) và số chứa canhKr, đối chứng dương phiên trưởng P1, chiều đỏ lienKetChoVai trả tên |
