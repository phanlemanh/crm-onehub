# Hình tại điểm quyết định — dat-okr-trong-crm (Cổng Phạm vi)

Kê từ artifact cuối S1: sổ quyết định chờ seal (12 dòng), sáu dòng `[GIẢ ĐỊNH]` trong Coverage, giả định 3 còn tiền tố đề xuất trong hồ sơ cơ hội. Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Ai sửa được gì — quyền theo bản ghi từ trưởng đơn vị (d-3, giả định 2, AC-6) | 4 cấp × 5 vai, chuỗi phiên → nhóm dữ liệu → pha chu kỳ → quyền bản ghi (4 bước), 2 nhánh kết | cần hình → `ai-sua-duoc-gi` |
| Vòng đời một mục tiêu: nháp → công bố (khoá khởi điểm) → đã bỏ; pha chu kỳ khoá ghi (AC-5, d-12) | 3 trạng thái nối tiếp + 4 pha, 2 nhánh khoá | cần hình → `vong-doi-muc-tieu` |
| Nhập từ bảng tính: dán → xem trước → ghi → (công bố ngay) — dòng hỏng rẽ ra (d-4, AC-9) | 4 bước nối tiếp, 2 nhánh (hợp lệ/hỏng, công bố/nháp) | cần hình → `nhap-tu-bang-tinh` |
| Sáu kiểu KR (d-1, giả định 1) | 1 nhánh (danh mục nào) — bảng ở thẻ | dưới ngưỡng: bảng 6 dòng trong design doc |
| Cột danh mục String + Zod, không enum Prisma (d-2) | 1 nhánh | dưới ngưỡng |
| Đích căn chỉnh phải đã công bố, cấp trên, cùng chu kỳ/năm cha (d-5, AC-7) | 1 nhánh (luật gắn) | dưới ngưỡng: câu luật trong thẻ |
| Nhãn và vị trí mục rail (d-6) | 1 nhánh | dưới ngưỡng |
| Cây đơn vị ghép lại trong khu okr/ (d-7) | 1 nhánh | dưới ngưỡng |
| Progress tô primary, SimpleTable thay danh sách lồng (d-8) | 1 nhánh | dưới ngưỡng |
| Bỏ design-pass (d-9) | 1 nhánh (bỏ/chạy) | dưới ngưỡng — cờ vàng trên thẻ |
| Ba mục bỏ còn lại (d-10, d-11, d-12) | mỗi cái 1 nhánh | dưới ngưỡng |

## Đề bài hình 1 — `ai-sua-duoc-gi`

- Loại hình: luồng quyết định, trái → phải.
- Nút: «Một lời gọi ghi OKR» → «Có phiên và còn là thành viên?» → «Nhóm dữ liệu OKR: cả bốn vai đi qua» → «Chu kỳ ở pha Lập kế hoạch hay Đang chạy?» (không → «Từ chối: kỳ đã khoá») → «Bản ghi thuộc cấp nào?» rẽ bốn: «OneHub → quản trị workspace», «Bộ phận → trưởng bộ phận», «Phòng ban → trưởng phòng ban hoặc trưởng bộ phận chứa nó», «Cá nhân → chính người đó, trưởng phòng ban chính, trưởng bộ phận»; nhánh riêng «Chỉ sửa KR → người phụ trách KR cũng được»; kết «Ghi + một dòng vết» hoặc «Từ chối theo quyền bản ghi». Chú thích: quản trị không sửa nội dung đơn vị; trưởng là ô trên đơn vị, vai «chỉ OKR» làm trưởng vẫn sửa được.
- AC liên quan: AC-5, AC-6, AC-12.

## Đề bài hình 2 — `vong-doi-muc-tieu`

- Loại hình: máy trạng thái.
- Trạng thái mục tiêu: «Nháp» → (Công bố, cần ≥ 1 KR; khoá khởi điểm mọi KR) → «Đã công bố» → (Bỏ) → «Đã bỏ»; «Nháp» → (Bỏ) → «Đã bỏ». Ở «Đã công bố»: sửa đích/hiện tại/tên được, sửa khởi điểm bị từ chối. Bên dưới: dải pha chu kỳ «Lập kế hoạch → Đang chạy → Chấm điểm → Đã đóng», hai pha đầu cho ghi, hai pha sau khoá ghi (lượt 7 mở màn chấm).
- AC liên quan: AC-1, AC-5.

## Đề bài hình 3 — `nhap-tu-bang-tinh`

- Loại hình: luồng có rẽ nhánh, trái → phải.
- Nút: «Trưởng dán bảng bảy cột» → «Xem trước (không ghi)» → mỗi dòng rẽ «Hợp lệ» / «Hỏng: câu lỗi ghim» → «Ghi N dòng: gom mục tiêu theo tên, KR theo dòng, một lần ghi» → rẽ «Công bố ngay» / «Để nháp» → «Một dòng vết: đơn vị, chu kỳ, số mục tiêu, số KR» → «Nhập lại cùng lô → 0 dòng (mục tiêu đã có)». Chú thích: dòng hỏng không để lại gì.
- AC liên quan: AC-9.
