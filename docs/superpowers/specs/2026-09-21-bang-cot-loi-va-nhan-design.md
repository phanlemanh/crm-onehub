# Bảng cột: trạng thái lỗi và nhãn theo dữ liệu đang hiện

Nguồn: hai mục ngoài hợp đồng của hồ sơ `quan-ly-danh-muc-30-ngay`, ký «ghi Known
limits» tại Cổng Bằng chứng 2026-09-21, chủ kho yêu cầu sửa ngay sau đó:
Ngoài-5 (bảng cột tải lỗi thì khung chờ quay mãi) và Ngoài-6 (vừa đổi cách chia thì
cột cũ bị gán nhãn theo cách chia mới).

## Vấn đề

Màn danh mục ở dạng bảng cột chỉ hỏi «đã có dữ liệu bảng cột chưa»:

1. Truy vấn bảng cột lỗi lần đầu → không có dữ liệu → khung chờ, mãi mãi, không
   thông báo, không nút thử lại. Lỗi xảy ra khi đã có dữ liệu cũ (đổi bộ lọc rồi
   tải lại hỏng) → màn giữ nguyên các cột cũ như thể bộ lọc mới đã áp.
2. Truy vấn giữ dữ liệu cũ trong lúc chờ dữ liệu mới. Màn gắn nhãn cột theo cách chia
   trong đường dẫn (đã là cách chia MỚI), nên cột của cách chia cũ mang nhãn sai
   cho tới khi dữ liệu mới về.

## Cách làm

- **Nhãn theo chính dữ liệu.** Kết quả thủ tục bảng cột đã mang `cachChia` của nó;
  màn gắn nhãn theo trường đó, không theo đường dẫn.
- **Đang chờ dữ liệu mới thì nói ra.** Trong lúc dữ liệu hiện là dữ liệu cũ giữ
  chỗ, vùng bảng cột mang `aria-busy` và mờ đi — người dùng biết số đếm chưa phải
  của lựa chọn mới.
- **Lỗi có trạng thái riêng.** Truy vấn bảng cột lỗi (lần đầu hay lần tải lại) →
  thanh lọc giữ nguyên, vùng bảng cột thay bằng «Không tải được bảng cột» kèm nút
  «Tải lại» gọi lại đúng truy vấn đó. Không để lại cột cũ khi lỗi.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bảng cột → đổi cách chia → vùng bảng mờ, nhãn cũ giữ đúng → dữ liệu mới về, nhãn mới
- Biên: đổi bộ lọc khi dữ liệu mới chưa về → như trên
- Lỗi & quay lại: truy vấn lỗi → «Không tải được bảng cột» + «Tải lại» → bấm → bảng cột hiện lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh mục — dạng bảng cột | Thấy kế hoạch dồn ở đâu | Nút đổi cách xem / hồ sơ kế hoạch |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bangcot-codulieu | Danh mục — bảng cột | Các cột kèm số đếm | Đổi cách chia, bấm thẻ |
| ST-bangcot-dangtai | Danh mục — bảng cột | Cột của lựa chọn trước, nhãn đúng lựa chọn trước, vùng mờ và báo đang tải | Chờ |
| ST-bangcot-loi | Danh mục — bảng cột | Thanh lọc giữ nguyên, «Không tải được bảng cột», nút «Tải lại» | Tải lại hoặc đổi bộ lọc |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Tải lại» gọi lại đúng truy vấn đang lỗi, không đổi đường dẫn.
- Trạng thái lỗi không giữ cột cũ trên màn.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Empty, Button, Board | dùng | Có sẵn ở `@crm/ui`, màn danh mục đang dùng |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: kanban (giữ nguyên)
Căn cứ: sửa trạng thái của màn sẵn có, không đổi cấu trúc.
<!-- UX-SPEC-TEMPLATE>>> -->
