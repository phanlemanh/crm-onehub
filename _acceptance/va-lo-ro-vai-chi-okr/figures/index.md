# Hình tại điểm quyết định — va-lo-ro-vai-chi-okr

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-1 Đổi vai sang «chỉ OKR»: từ chối khi còn việc, xoá theo dõi khi không | hai nhánh rẽ (còn việc · không còn) | `mot-ham-nam-cho.html` |
| d-2 Lọc ở bộ gom dùng chung, không ở agent | một nguồn rẽ ba kênh (tin nhắc · Việc của bạn · Tổng quan) | `mot-ham-nam-cho.html` |
| d-3 Ô chọn đọc thủ tục mới, không thêm vai vào `users.list` | dưới ngưỡng: một bước | — |
| d-4…d-7 bốn dòng `descope` | dưới ngưỡng: mỗi dòng một bước | — |
| d-8 Dọn dữ liệu cũ chờ số đo production | hai nhánh rẽ (số nhỏ · số lớn) sau một bước đo | `don-du-lieu-cu.html` |

## Đề bài

### `mot-ham-nam-cho` — Một hàm, năm chỗ dùng

- Loại hình: sơ đồ luồng (flowchart), trái sang phải.
- Nút giữa: hàm `docDuocDoiTac(role)` ở `@crm/validation/vai-workspace`.
- Năm nhánh ra: (1) đường ghi kế hoạch — giao bước, thêm bước, đổi cầm trịch, chuyển việc (AC-1, AC-2, AC-4); (2) tạo từ khuôn (AC-3); (3) đổi vai `setMemberRole` — rẽ hai: «còn kế hoạch hay bước mở → 409, chỉ sang Chuyển việc» và «không còn → xoá lượt theo dõi, đổi vai» (AC-5, AC-6); (4) bộ gom nhắc `viecCanNhac` — rẽ ba kênh: tin nhắc Zalo/Slack, thẻ Việc của bạn, Tổng quan (AC-7, AC-8); (5) ô chọn người `onboarding.nguoiNhanViec` — ba ô chọn (AC-9).
- Nhãn bằng chữ tiếng Việt, tên hàm giữ nguyên.

### `don-du-lieu-cu` — Dọn dữ liệu cũ trên production

- Loại hình: cây quyết định.
- Bước 1: chạy `rang/ro-vai-chi-okr.mjs` chỉ đọc trên production (AC-10).
- Rẽ: «0 việc mở» → không cần dọn · «ít người» → quản trị dùng Chuyển việc ở màn Thành viên, rồi lưu lại vai `okr` để xoá lượt theo dõi (AC-4, AC-6) · «nhiều người» → migration dọn, chủ kho quyết vì ghi production lúc triển khai.
- Ghi chú dưới cây: tin nhắc đã gửi không thu hồi được.
