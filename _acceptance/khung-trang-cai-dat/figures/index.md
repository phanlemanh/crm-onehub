# Điểm quyết định — Cổng Phạm vi của khung-trang-cai-dat

Ngưỡng N5: từ ba bước nối tiếp, hoặc từ hai nhánh rẽ, thì cần hình.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Breadcrumb chỉ ở trang con (hướng B) hay mọi trang (hướng A) | 2 nhánh rẽ | cần hình: `breadcrumb-a-b` |
| Đường vào Nhắc buổi sáng: menu người dùng, liên kết Zalo, đường cũ chuyển hướng | 3 bước nối tiếp (đường cũ → chuyển hướng → trang) | cần hình: `luong-nhac-buoi-sang` |
| Lời hứa «Điều phối đứng cuối thanh bên» đổi thành «đứng cuối nhóm Con người» | 2 nhánh rẽ (đổi lời hứa / đổi thứ tự nhóm) | cần hình: gộp vào `thanh-ben-bon-nhom` |
| E17 `nhac-qua-zalo` và E19 `noi-zalo-cho-nguoi-moi` chờ vòng chấm lại riêng | dưới ngưỡng: 1 bước | — |
| `width` của Điều phối (wide) và danh sách Kết nối (page) | dưới ngưỡng: 1 lựa chọn | — |
| Intake và Slack chưa kết nối căn trái | dưới ngưỡng: 1 lựa chọn | — |
| Đường `/reminders` | dưới ngưỡng: 1 lựa chọn | — |
| Giữ `khoi-zalo`, `khoi-kenh` tại chỗ | dưới ngưỡng: 1 lựa chọn | — |

## Đề bài từng hình

### breadcrumb-a-b
- Loại: so sánh hai phương án cạnh nhau (hai khung trang giản lược).
- Nút: trái «Hướng B (máy khuyên)» — thanh bên, trang mục Chung (tiêu đề ở mốc 72px), trang con Google (dòng «Kết nối › Google», tiêu đề ở mốc 116px). Phải «Hướng A» — cả trang mục lẫn trang con đều có dòng đường dẫn, tiêu đề cùng mốc 116px.
- Nhãn bằng chữ: «chuyển tab: tiêu đề đứng yên» (B), «dòng "Cài đặt › Chung" lặp thanh bên» (A).
- AC: AC-3, AC-5.

### luong-nhac-buoi-sang
- Loại: luồng (flowchart ngang).
- Nút: «Menu người dùng» → «Nhắc buổi sáng» (/<slug>/reminders); «Kết nối › Zalo — Nối Zalo của tôi» → cùng trang; «/settings/notifications (dấu trang cũ)» → «chuyển hướng» → cùng trang.
- Nhãn: trang đích «không có thanh bên Cài đặt».
- AC: AC-8, AC-9.

### thanh-ben-bon-nhom
- Loại: cây/danh sách có nhóm.
- Nút: bốn nhóm theo thứ tự — Không gian làm việc (Chung, Tiền tệ, Trường), Con người (Thành viên, Tổ chức, Điều phối 30 ngày), Kết nối và dữ liệu (Kết nối, Theo dõi & phân tích), Bảo mật (SSO, Khoá API).
- Nhãn: đánh dấu «Điều phối 30 ngày — đứng cuối nhóm Con người (lời hứa cũ: đứng cuối cả thanh)»; «Thông báo của bạn → ra menu người dùng».
- AC: AC-6, AC-11.
