# Hình tại điểm quyết định — go-thanh-vien-phai-giu-duoc

| Điểm | Đếm | Hình |
|---|---|---|
| Khai số đo AC-2 là 0 giây, đo bằng cửa thật | nhị phân | dưới ngưỡng |
| Bản sửa AC-3 chỉ loại người có lời mời kết thúc | nhị phân | dưới ngưỡng |
| Bỏ đặc tả UX | nhị phân | dưới ngưỡng |
| Thu hồ sơ vì tiền đề sai | bốn bước nối tiếp, ba nhánh rẽ | `ai-da-canh-cho-nao` |

## Đề bài: ai-da-canh-cho-nao

- Loại: sơ đồ một luồng dọc «lượt gỡ một thành viên», mỗi bước một nút, kèm cột phải ghi AI ĐANG CANH bước đó.
- Luồng dọc, bốn nút theo thứ tự: `removeMember` xoá dòng thành viên → xoá dòng phiên → thu hồi lời mời → (sau đó) người ấy đăng nhập lại.
- Nhấn mạnh: cả ba bước đầu nằm trong MỘT giao dịch — vẽ một khung bao quanh ba nút ấy, nhãn «một giao dịch».
- Cột phải, ba nhãn ĐÃ CÓ NGƯỜI CANH, tô nhạt: «đã đo — cp_go_tron_ven», «đã đo — cp_chu_cuoi_cung», «đã đo — cp_go_tron_ven». Ghi rõ chúng thuộc hồ sơ `cho-phep-ai-vao-o-man-hinh`, đã ký 16/09.
- Ba nút CHƯA AI CANH, tô đậm, vẽ tách sang một khối riêng bên dưới: «thủ tục quản trị từ chối người đã bị gỡ» (AC-1) · «phiên đang mở mất quyền, 0 giây» (AC-2) · «đường kết nạp mồi thôi cấp lại quyền» (AC-3).
- Một dòng ghi chú: bản nháp đầu tưởng lời mời còn sống sau lượt gỡ — sai; khối thu hồi đã có từ trước khi hợp đồng được viết.
