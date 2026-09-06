# Điểm quyết định tại Cổng Phạm vi — kê và đếm ngưỡng N5

Ngưỡng: từ ba bước nối tiếp hoặc từ hai nhánh rẽ → cần hình; dưới đó bảng ba cột là đủ.

| Điểm | Đếm | Hình |
|---|---|---|
| Nguồn để mở: nhatot hay batdongsan | 2 nhánh | cần hình → `nguon-va-lan` |
| Làn: cá nhân hay công ty (lật đề xuất hồ sơ cơ hội) | 2 nhánh | cần hình → `nguon-va-lan` (cùng hình, hai trục) |
| Luồng dữ liệu bốn khối: cào → tiếp nhận → phân khúc → chiến dịch → lượt gọi → số đo | 6 bước | cần hình → `luong-bon-khoi` |
| Vòng đời chiến dịch và khi nào ghi được kết quả | 3 trạng thái, 2 chuyển, 1 cấm | cần hình → `vong-doi-chien-dich` |
| Phân khúc = góc nhìn đã lưu, không phải bảng mới | 2 nhánh, đã chọn bằng bằng chứng mã | dưới ngưỡng: bảng trong thiết kế đủ |
| Lượt gọi = bảng riêng + hoạt động CALL | 2 nhánh | dưới ngưỡng: một đoạn lý do trong thiết kế |
| Bỏ design-pass (thiếu `design_pass.proto_route`) | 1 nhánh | dưới ngưỡng: 1 |
| `[GIẢ ĐỊNH]` ai trong workspace cũng kết thúc được chiến dịch | 1 nhánh có/không | dưới ngưỡng: 1 |
| `[GIẢ ĐỊNH]` lời khai pháp lý miệng đủ cho vòng đầu | 1 nhánh có/không | dưới ngưỡng: 1 |

## Đề bài từng hình

### nguon-va-lan — ma trận 2×2 «nguồn × làn», trường có thật trong ô

- Loại hình: ma trận hai trục (quadrant). Trục ngang: nguồn (nhatot · batdongsan). Trục dọc: làn (cá nhân · công ty).
- Ô: liệt trường có thật đã soi 2026-09-04 (nhatot cá nhân: tổng tin, tin mới 30 ngày, chứng chỉ, tên giấy phép, địa bàn, số ẩn sau nút · batdongsan công ty: tổng đài hiện thẳng, website, email, địa bàn, KHÔNG sản lượng · hai ô còn lại thưa).
- Đánh dấu ô được chọn (nhatot × cá nhân) và ghi một dòng vì sao: nguồn duy nhất có sản lượng; pháp lý owner đã khai.
- Nhãn bằng chữ thường; tên kỹ thuật không lên hình. AC liên quan: AC-1, AC-13, AC-14.

### luong-bon-khoi — luồng trái sang phải, sáu nút

- Loại hình: flowchart ngang. Nút: Bộ cào (ngoài CRM) → Cổng tiếp nhận (khoá bí mật) → Cá nhân + 9 trường → Góc nhìn đã lưu (phân khúc) → Chiến dịch → Lượt gọi + hoạt động gọi → Số đo (phân khúc cạnh toàn tập).
- Ghi trên cạnh: «lô JSON», «upsert theo trang nhatot», «lọc và lưu», «chọn», «một cú bấm», «đếm cá nhân riêng biệt».
- Một chú thích: «tác nhân KHÔNG đụng chín trường; không việc nghiên cứu nào được xếp». AC liên quan: AC-1…AC-5, AC-6, AC-8, AC-10.

### vong-doi-chien-dich — máy trạng thái ba trạng thái

- Loại hình: state machine. Trạng thái: Nháp → Đang chạy → Đã kết thúc. Chuyển: Bắt đầu, Kết thúc. Cấm: Đã kết thúc → Đang chạy (gạch chéo).
- Ghi trên trạng thái Đang chạy: «ghi kết quả được»; trên Nháp và Đã kết thúc: «ghi kết quả bị từ chối, không tạo hoạt động».
- AC liên quan: AC-7, AC-9.

## Hình bàn giao — vẽ thêm 2026-09-04 theo yêu cầu chủ sản phẩm

| Hình | Cho thấy | Nguồn |
|---|---|---|
| `man-hinh-ban-giao` | Ba màn theo luồng: danh sách chiến dịch → hộp tạo → trang chiến dịch đang chạy (dải số hai hàng, bảng gọi, năm nút kết quả); dữ liệu là mẫu giả | mục 8 Đặc tả UX của bản thiết kế |
| `hanh-trinh-tiep-thi` | Năm bước làm giàu → phân khúc → nhắm → tiếp cận → đo; trước/sau; máy đo gì; ô ăn thua | mục 8, 9, 10 của bản thiết kế; ngưỡng ở hồ sơ Cổng Đáng vẫn mang `[đề xuất]` |
