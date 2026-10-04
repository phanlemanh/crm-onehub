# Hình tại điểm quyết định — Cổng Phạm vi, thanh-vien-vao-dung

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 Ô tên miền đặt ở Cài đặt › Thành viên | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-2 Cho phép một địa chỉ đã là thành viên → từ chối | 3 nhánh (đã là thành viên · đã ở danh sách · mới) | cho-phep.html |
| d-3 Dòng treo cũ: đọc thành accepted, không ghi (kèm [GIẢ ĐỊNH] cách đọc ngưỡng treo) | 2 nhánh (dòng cũ · dòng mới sau giao) + 3 bước (DB → API → màn) | dong-treo.html |
| d-4 Nút đầu trang khi workspace.get lỗi vẫn hiện | 4 nhánh (đang tải · quản trị · thành viên thường · lỗi) | nut-dau-trang.html |
| d-5 design-pass không đồng bộ trên ảnh | dưới ngưỡng: 0 nhánh | — |
| [GIẢ ĐỊNH] thông điệp từ chối giữ tiếng Anh | dưới ngưỡng: 0 nhánh | — |

## Đề bài từng hình

### cho-phep — flowchart
- Nút: quản trị gõ địa chỉ → chuẩn hoá → «đã là thành viên?» → có: 400 «That person is already a member…», không tạo dòng, hộp giữ mở → không: «đã ở danh sách (pending/accepted)?» → có: 400 «That address is already on the list.» → không: tạo dòng pending.
- Nhãn mới so với hôm nay: ô «đã là thành viên?» là MỚI (tô khác); hai nhánh kia giữ nguyên.
- AC: AC-6, AC-8, AC-9 (người không quyền 403 trước mọi nhánh).

### dong-treo — so hai đường
- Trái «hôm nay»: dòng pending của thành viên hiện tại → API trả pending → khối «Được phép vào» liệt người đó, số đếm tính họ.
- Phải «sau vòng này»: cùng dòng pending trong CSDL (không ghi) → API đọc thành accepted → khối không liệt, số đếm không tính.
- Chú thích dưới: lệnh soi đếm `treo` trên CSDL vẫn thấy dòng cũ → người ký chọn cách đọc ngưỡng: (a) cho một lần ghi dọn, (b) ngưỡng = 0 dòng treo MỚI sau giao.
- AC: AC-6, AC-7, AC-11.

### nut-dau-trang — state machine
- Trạng thái: đang tải (không nút) → có dữ liệu quản trị (nút) · có dữ liệu thành viên thường (không nút) · lỗi (thử lại một lần theo retryQuery) → thành công thì về nhánh dữ liệu, vẫn lỗi thì hiện nút (API chặn 403 trong hộp).
- Ghi chú: lỗi lúc máy chủ dựng trang không còn là trạng thái cuối — truy vấn trình duyệt chạy lại.
- AC: AC-9; giữ AC-10 đã ký của thanh-vien-hai-khoi-cung-khuon (thành viên thường không thấy nút).
