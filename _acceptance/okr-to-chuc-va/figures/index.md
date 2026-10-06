# Điểm quyết định — okr-to-chuc-va (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| R1m-7 lối A+ (quản trị tạo lẻ mục tiêu và KR theo luật nhập, sửa giữ luật cũ) | cần hình: 3 nhánh (A+ · A · B) × 2 vai | `quyen-tao.html` |
| #30 khôi phục bị chặn trả `{ chan }`, màn dựng toast theo ngôn ngữ | cần hình: 2 nhánh rẽ (cha lưu trữ · trùng tên) + nhánh đi thẳng | `khoi-phuc.html` |
| #17 không sửa lại, chỉ giữ bằng E14 (descope) | dưới ngưỡng: 1 bước | — |
| #18 chỉ sửa hộp lưu trữ, câu lỗi khác của màn Tổ chức để chip riêng (descope) | dưới ngưỡng: 1 bước | ảnh design-pass `ST-luutru-chan-en` |
| Chạy design-pass, gửi ảnh nấc 1 | dưới ngưỡng: 1 bước | — |
| E13 không đối chứng trên merge-base (gap-probe P2, deferred) | dưới ngưỡng: 1 bước | — |

## Đề bài hình

### quyen-tao
- Loại: bảng so sánh ba lối (cột) × hành động (hàng).
- Cột: A+ (khuyên) · A · B. Hàng: nhập cả bộ · tạo một mục tiêu · thêm KR vào mục tiêu vừa tạo · sửa / xoá
  mục tiêu, KR · ma trận quyền mà hồ sơ đã ký đang đo.
- Ô: quản trị không là trưởng làm được (✓) / không (✗); hàng cuối: không chạm / chạm.
- Ghi: A+ = «tạo lẻ được đúng thứ nhập cả bộ tạo được»; A vấp ngưỡng SỐNG vì mục tiêu mới không thêm
  được KR; B mở quyền sửa mọi đơn vị.
- AC: AC-7, AC-8.

### khoi-phuc
- Loại: sơ đồ luồng.
- Nút: «Đã lưu trữ» → bấm Khôi phục → máy chủ kiểm → bộ phận cha đã lưu trữ? → Có: trả `{chan: cha-luu-tru,
  ten}` → toast «khôi phục bộ phận X trước» theo ngôn ngữ người xem, đơn vị vẫn ở Đã lưu trữ; Không →
  trùng tên đơn vị đang hoạt động? → Có: `{chan: trung-ten, ten}` → toast gọi tên đơn vị trùng; Không: khôi
  phục, về đúng chỗ cũ.
- Ghi so sánh: hôm nay hai nhánh «Có» đều khôi phục ngay (rơi vào bộ phận lưu trữ, hoặc sinh hai đơn vị cùng
  tên).
- AC: AC-5, AC-6, AC-12.
