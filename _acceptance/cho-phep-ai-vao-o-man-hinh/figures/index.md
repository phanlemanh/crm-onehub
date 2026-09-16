# Điểm quyết định — cho-phep-ai-vao-o-man-hinh

Ngưỡng N5: cần hình khi một điểm quyết định có từ ba bước nối tiếp, hoặc từ hai
nhánh rẽ.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Vòng đời một lời cho phép (d-…-1) | 4 bước nối tiếp + 1 nhánh rẽ | `vong-doi-loi-cho-phep` |
| Hai khối tách bạch, gỡ khác rút (d-…-2) | 2 nhánh rẽ + 3 bước nối tiếp ở nhánh gỡ | `go-khac-rut` |
| Tham số hd giữ đọc biến môi trường (d-…-3) | 1 nhánh | dưới ngưỡng: 1 |
| Không gửi email, không link mời (d-…-4) | 0 nhánh | dưới ngưỡng: 0 |
| Không xử lý Gmail dấu chấm (d-…-5) | 0 nhánh | dưới ngưỡng: 0 |
| Bỏ design-pass vì thiếu proto_route (d-…-6) | 0 nhánh | dưới ngưỡng: 0 |

## Đề bài hình 1 — `vong-doi-loi-cho-phep`

- Loại: máy trạng thái
- Nút: `chưa có` · `pending` · `accepted` · `cancelled` · `dòng mới (pending)`
- Nhãn cạnh bằng chữ: cho phép một địa chỉ · người ấy đăng nhập lần đầu · rút lời
  cho phép · gỡ thành viên · cho phép lại
- Ghi rõ: gỡ thành viên đi tới `cancelled` từ `accepted`; cho phép lại sinh một
  dòng MỚI chứ không quay dòng cũ về `pending`
- AC liên quan: AC-2, AC-3, AC-5, AC-11, AC-14

## Đề bài hình 2 — `go-khac-rut`

- Loại: sơ đồ hai nhánh so sánh
- Nút nhánh trái (rút lời cho phép): người chưa có tài khoản → bị chặn ở lượt tạo
  tài khoản · người đã là thành viên → không suy suyển
- Nút nhánh phải (gỡ thành viên): xoá dòng thành viên + chuyển lời cho phép sang
  `cancelled`, một giao dịch → lần đăng nhập sau không tự thành viên lần nữa →
  màn hết quyền
- Nhãn bằng chữ, không ký hiệu
- AC liên quan: AC-3, AC-4, AC-5, AC-6
