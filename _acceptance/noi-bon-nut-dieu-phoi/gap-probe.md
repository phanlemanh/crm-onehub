---
slug: noi-bon-nut-dieu-phoi
at: 2026-09-21T14:17:34Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E7 gọi thẳng service nên đi vòng qua tầng thủ tục tRPC đã trả 400 | Router vẫn còn z.date() hoặc middleware đổi kiểu mà E7 vẫn xanh | Gửi HTTP thật tới thủ tục kèm phiên đăng nhập, chiều đỏ z.date() cho 400 | fixed: E7 gửi HTTP qua AppModule, AC-5 thêm tag cross-layer |
| P1 | evals | Ngày bắt đầu là ngày lịch nhưng không eval nào nối giá trị hộp thoại với ngày máy chủ lưu | Nửa đêm giờ địa phương thành hôm trước theo UTC nên kế hoạch lùi một ngày | Chạy dưới TZ Asia/Ho_Chi_Minh, so ngày lịch đã chọn với ngày lưu | fixed: E6 chạy dưới TZ và so ngày lịch, E7 gửi đúng dạng ngày hộp thoại gửi |
| P1 | evals | Loại đối tác tuỳ chọn mà chỉ đo ca có điền | Để trống gửi chuỗi rỗng bị từ chối trên prod | Ma trận hai ca có điền và bỏ trống | fixed: E3 và E4 thành ma trận hai ca |
| P2 | evals | AC-4 thiếu eval tác động máy chủ và E6 E9 chỉ kiểm có làm mới | Làm mới nhầm khoá nên bản ghi mới không hiện mà eval vẫn xanh | Khẳng định tên mới trên màn và thêm eval backend gắn AC-4 | fixed: E6 và E9 kiểm bản ghi mới trên màn, thêm E13 gắn AC-4 |
| P2 | contract | Trạng thái đang lưu có trong đặc tả mà không có AC | Bấm Lưu hai lần sinh bản ghi trùng | AC mới và ma trận bốn hộp thoại đúng một lời gọi | fixed: thêm AC-10 và E14 |
