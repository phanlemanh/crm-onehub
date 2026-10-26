---
slug: trang-bo-okr
at: 2026-10-21T14:10:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-…-6 bỏ design-pass ghi nguồn muc-tieu, nhưng câu trích chỉ nói bản mẫu tồn tại, không quyết bỏ khoảnh khắc nhìn trước Cổng 1; bản dựng lệch bản mẫu ở vài chỗ (ô chọn đơn vị, thẻ Chấm điểm, Sơ đồ cả chu kỳ) | Chủ kho ký Cổng 1 tưởng bản mẫu là màn sẽ giao, tới Cổng 2 mới thấy chỗ lệch, phải mở lại AC-4, AC-10 | Thẻ Cổng 1 hỏi: design-pass hay duyệt bằng bảng chỗ lệch kèm ảnh | human-gate1: dòng S1 mới thay d-6 thành Hỏi (khuyên duyệt bằng bảng); bản thiết kế thêm mục «Chỗ lệch bản mẫu» |
| P0 | contract | Dòng sổ d-…-4 (giữ ChonDonVi) ghi mot-loi nhưng loi_chet chỉ nói «phải xin phép mới»; AC-10 đòi khớp bản mẫu mà bản mẫu không có ô này | Người chấm E14 cho FAIL vì ô chọn đơn vị, hoặc cho PASS và để lọt cả chỗ lệch thật | Hỏi ở Cổng 1; AC-10 và E14 liệt kê đích danh chỗ được lệch | human-gate1: dòng S1 mới thay d-4 thành Hỏi (khuyên giữ ô); fixed: AC-10 và E14 nêu đúng bốn chỗ lệch được phép, chỗ lệch khác là FAIL |
| P0 | contract | Câu thước CE sai: danh sách × rỗng theo lọc, một bộ × đang tải/lỗi, đường vào thanh bên chưa có AC; d-…-7 bỏ bước quét bằng một chi phí, không phải lối chết | Thành viên bấm Tôi dẫn thấy bảng trống trơn, E1–E14 vẫn xanh | AC cho lọc ra rỗng, đo câu + nút Về Tất cả, chiều đỏ bỏ câu rỗng | fixed: AC-2 thêm ca lọc ra rỗng và E4 đo nó (chiều đỏ rong-khong-cau); AC-1 thêm đường vào thanh bên; câu CE viết lại theo đúng ô (một bộ × tải/lỗi giữ màn hôm nay, khung-cho-don-vi-mot-hinh đo); human-gate1: d-7 thay bằng Hỏi |
| P1 | evals | Ma trận E3 thiếu trưởng bộ phận (Division.headUserId); không nói ai dẫn bộ gốc | Bản dựng chỉ đọc Department.headUserId, trưởng bộ phận bấm Tôi dẫn thấy rỗng, E3 E4 xanh | Thêm trưởng bộ phận vào ma trận viết trước, chiều đỏ bỏ nhánh Division | fixed: E3 ma trận 4 người × 4 đơn vị = 16 ô gồm trưởng bộ phận, chiều đỏ bỏ nhánh Division; thiết kế và AC-2 ghi bộ OneHub không ai dẫn, trưởng bộ phận không dẫn phòng ban con |
| P1 | evals | E9 chỉ đo số dòng và tiêu đề trên màn; nhóm theo KR, người làm, hạn, xong chưa đo trên màn; luật KR không việc chưa có trong thiết kế | Thẻ Việc dựng danh sách phẳng chỉ tiêu đề, E8 E9 vẫn xanh | Ma trận theo từng việc gieo đo quan hệ việc ↔ nhóm KR và các trường, chiều đỏ danh sách phẳng | fixed: E9 viết lại thành ma trận theo từng việc (quan hệ con của nhóm KR, người làm, hạn, xong), chiều đỏ viec-phang; thiết kế ghi «KR không có việc thì không có nhóm», E8 bám luật ấy |
