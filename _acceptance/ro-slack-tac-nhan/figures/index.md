# Hình tại điểm quyết định — ro-slack-tac-nhan

| Điểm | Đếm | Hình |
|---|---|---|
| d-20260927T023512Z-2 — không chặn người Slack ngoài CRM | 4 bước nối tiếp, 4 nhánh ra | `luat-gui-slack` |
| d-20260927T023512Z-3 — lượt Tác nhân nhận bằng purpose team-agent | 5 cách khởi phiên, 2 kết cục | `ai-la-tu-dong` |
| d-20260927T023512Z-1 — bỏ đặc tả UX | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-20260927T023512Z-4 — users.list thay users.info | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| d-20260927T023512Z-5 — từ chối bằng ném lỗi + ACTION_REJECTED | dưới ngưỡng: 1 bước, 0 nhánh | — |
| [GIẢ ĐỊNH] mọi tin Slack của Tác nhân là dữ liệu đối tác | dưới ngưỡng: 1 câu | — |
| [GIẢ ĐỊNH] người Slack ngoài CRM cho qua | gộp vào `luat-gui-slack` | — |
| [GIẢ ĐỊNH] mọi phiên purpose team-agent là lượt không người ngồi | gộp vào `ai-la-tu-dong` | — |

## Đề bài `luat-gui-slack`

- Loại hình: sơ đồ luồng quyết định (flowchart), một cột dọc, rẽ nhánh sang phải.
- Nút: «Tác nhân gọi đăng Slack» → «Ai ở đích? (kênh: đọc thành viên mọi trang · tin trực tiếp: một người)» → «Họ là ai trong Slack? (danh bạ mọi trang; bỏ bot, tài khoản đã xoá)» → «Họ là ai trong CRM? (vai đọc lúc gửi; khớp bằng bảng khớp Slack hoặc email)» → kết «Đăng đúng một lần».
- Nhánh: ở bước 2 hoặc 3 «không đọc được» → «Từ chối: không kiểm được người nhận». Ở bước 4 «có người vai chỉ OKR» → «Từ chối: kênh có N người không đọc được dữ liệu đối tác». Ở bước 4 «người Slack không có trong CRM» → chú thích «cho qua — quyết định d-…-2, mở lại khi có khớp tay», nhánh này vẫn đi tới «Đăng».
- Nhãn chú: hai ô từ chối ghi «ghi vào lịch sử lượt: hành động bị từ chối, không có tin nào đi ra».
- AC liên quan: AC-1…AC-7.

## Đề bài `ai-la-tu-dong`

- Loại hình: bảng quyết định hai cột kết cục (matrix), hàng là cách khởi phiên.
- Hàng: Tác nhân theo lịch · Tác nhân theo sự kiện · Tác nhân do người bấm chạy · việc nền của hàng việc · Trợ lý AI trong app (cầu nối) · builder dựng Tác nhân · hỏi CRM qua Zalo.
- Cột: «Hôm nay» · «Sau vá». Ô: «xin người duyệt (không ai ngồi)» / «từ chối, có lý do» / «xin người duyệt (có người ngồi)».
- Nhấn: ba hàng Tác nhân đổi từ «xin người duyệt (không ai ngồi)» sang «từ chối, có lý do»; bốn hàng còn lại giữ nguyên.
- AC liên quan: AC-8, AC-9, AC-10.
