# Hình tại điểm quyết định — go-la-cat-quyen-that

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 kiểm tư cách ở lớp chung, chặn mặc định (loại hai phương án) | ba nhánh rẽ | `bon-cua-mot-cho-chan` |
| d-2 chừa đường đọc tư cách cho proxy | chuỗi bốn bước nối tiếp | `bay-proxy-cho-qua` |
| d-3 tắt khoá chứ không xoá | hai nhánh rẽ — gộp vào hình `bon-cua-mot-cho-chan` (cửa khoá ghi rõ «tắt, không xoá») | `bon-cua-mot-cho-chan` |
| d-4 không tắt bộ đệm phiên | dưới ngưỡng: một lựa chọn, không nhánh | — |
| d-5 endpoint Better Auth khác để hồ sơ riêng | dưới ngưỡng: một lựa chọn | — |
| d-6, d-7, d-8 bỏ đặc tả UX / design-pass / ui-observed | dưới ngưỡng: bỏ bước, không nhánh | — |
| Lệch so với mô tả ban đầu: thêm cửa thứ tư (đường nối trợ lý) | dưới ngưỡng: thêm một mục | — |

## Đề bài

### bon-cua-mot-cho-chan
- Loại: sơ đồ kiến trúc / luồng vào (trái → phải).
- Nút trái: bốn cửa của người đã bị gỡ — «Đăng nhập lại», «Tab đang mở (bộ đệm phiên 5 phút)», «Khoá API cũ / mới», «Đường nối trợ lý /eve».
- Giữa: «Lớp kiểm chung — có phiên VÀ là thành viên (đọc bảng thành viên mỗi lời gọi)»; ngoại lệ có tên bên cạnh: «workspace.get — chỉ hỏi tư cách», «sso.signInOptions — công khai». Cửa khoá có thêm hai chốt: «lượt gỡ TẮT khoá (không xoá)», «chặn tạo / bật lại khoá». Cửa trợ lý có chốt riêng «route hỏi tư cách trước khi đúc token».
- Phải: «Dữ liệu CRM (danh bạ, công ty, deal, hoạt động, tìm kiếm, chiến dịch)».
- Một dải chú thích nhỏ: hai phương án đã loại — «gắn kiểm từng router (router mới quên là hở)», «kiểm trong từng service (15 router không truyền người dùng xuống)».
- AC liên quan: AC-1, AC-4, AC-5, AC-6, AC-7, AC-8.

### bay-proxy-cho-qua
- Loại: sơ đồ trình tự hai làn, so «nếu chặn cả workspace.get» với «thiết kế này».
- Làn trên (sai): Người bị gỡ mở /contacts → proxy hỏi workspace.get → API trả 403 → proxy coi là «không biết» → CHO QUA → màn trống toàn lỗi.
- Làn dưới (đúng): Người bị gỡ mở /contacts → proxy hỏi workspace.get → API trả 200, viewerRole rỗng → proxy chuyển sang màn «hết quyền».
- AC liên quan: AC-2 (E2, E10).
