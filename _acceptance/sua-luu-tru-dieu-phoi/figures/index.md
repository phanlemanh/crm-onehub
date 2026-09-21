# Hình tại điểm quyết định — sua-luu-tru-dieu-phoi

| Điểm | Đếm | Hình |
|---|---|---|
| Vòng đời lưu trữ của bộ phận và khuôn (d-…-2, d-…-4; AC-3, AC-4, AC-6, AC-7, AC-8) | 5 bước nối tiếp, 3 nhánh rẽ (bị chặn vì khuôn dùng · hoàn tác · xoá vĩnh viễn khi chưa dùng) | `vong-doi-luu-tru` |
| Quyền cấu hình (d-…-3; AC-9) | 2 nhánh rẽ (quản trị/chủ · thành viên) | `quyen-dieu-phoi` |
| Tách cấp phòng ban (d-…-1) | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| Bỏ design-pass (d-…-5) | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| Loại đối tác ngoài vòng (d-…-6) | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| [GIẢ ĐỊNH] thành viên đóng/mở kế hoạch của người khác | dưới ngưỡng: 1 câu có/không | — |

## Đề bài hình

### vong-doi-luu-tru

- Loại hình: sơ đồ trạng thái (state machine).
- Trạng thái: «Đang dùng» → «Đã lưu trữ» → «Đã xoá vĩnh viễn».
- Chuyển: «Lưu trữ» (Đang dùng → Đã lưu trữ; bị chặn khi bộ phận còn trong khuôn chưa lưu trữ — nhánh về Đang dùng kèm nhãn «bị chặn: nêu tên khuôn»); «Hoàn tác» và «Khôi phục» (Đã lưu trữ → Đang dùng; khôi phục khuôn bị chặn khi khuôn giao việc cho bộ phận đang lưu trữ); «Xoá vĩnh viễn» (Đã lưu trữ → Đã xoá vĩnh viễn, CHỈ khi chưa từng dùng; đã dùng thì không có nút).
- AC: AC-3, AC-4, AC-6, AC-7, AC-8.

### quyen-dieu-phoi

- Loại hình: sơ đồ hai làn (swimlane) hoặc cây rẽ hai nhánh theo vai trò.
- Nhánh «Chủ / Quản trị»: đổi cấu hình (bộ phận, khuôn: thêm, sửa, sắp xếp, lưu trữ, khôi phục, xoá vĩnh viễn) + việc trên kế hoạch.
- Nhánh «Thành viên»: cấu hình chỉ xem (nút khoá, máy chủ trả 403) + việc trên kế hoạch (tạo, đóng, mở lại, thêm môi giới, đánh dấu bậc).
- AC: AC-9.
