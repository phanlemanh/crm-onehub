# Hình tại điểm quyết định — gop-y-dung-cho (Cổng Phạm vi)

Ngưỡng N5: điểm quyết định có từ ba bước nối tiếp hoặc từ hai nhánh rẽ thì kèm hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Hộp Sửa KR cũng bỏ cột, quyết dồn về khung chi tiết (d-…-1) + chip trên danh sách (A) | 2 lối vào (chip, dòng dẫn hộp Sửa) × 4 bước nối tiếp (vào → khung → quyết → biên nhận/hoàn tác) | luong-quyet-gop-y |
| Bảng thay thế 36 eval đã ký (d-…-6, AC-15) | 5 hồ sơ rẽ thành 36 eval rẽ về 8 AC thay | bang-thay-the |
| Bộ lọc «Có góp ý chờ» (d-…-2) | 2 bước (chọn mặt lọc → danh sách lọc) | dưới ngưỡng: 2 bước, 0 nhánh |
| Gộp hai hạt giống (d-…-3) | 1 bước | dưới ngưỡng: 1 bước |
| Bỏ qua không Hoàn tác (d-…-4) | 1 bước | dưới ngưỡng: 1 bước |
| Chip không chạy kiểm lại (d-…-5) | 2 bước (đếm → mở khung làm mới) | dưới ngưỡng: 2 bước |
| Chữ Trợ lý ở màn khác để lượt sau (d-…-7) | 1 bước | dưới ngưỡng: 1 bước |
| Giữ diff tên cũ (d-…-8) | 1 bước | dưới ngưỡng: 1 bước |
| Bỏ phím J/K (d-…-9) | 1 bước | dưới ngưỡng: 1 bước |
| `[GIẢ ĐỊNH]` người mở khung chi tiết đủ thường | 1 bước | dưới ngưỡng: 1 bước |
| `[NGÀNH]` Quantive, Google Docs/GitHub | 1 bước | dưới ngưỡng: 1 bước |

## Đề bài — luong-quyet-gop-y

- Loại hình: luồng (flowchart) hai lối vào gộp về một chỗ quyết.
- Nút: «Danh sách Theo đơn vị / Của tôi — chip ✦ Kara · 3 góp ý» · «Hộp Sửa mục tiêu / Sửa KR — dòng dẫn · Xem góp ý» → «Khung chi tiết, tab KR — vùng Kara ở đầu khu KR, đề xuất neo dưới từng KR» → ba nhánh «Đổi tên KR / Sửa → biên nhận «Đã đổi tên KR theo Kara · Hoàn tác» + dấu theo Kara», «Bỏ qua → dòng mờ nói đã bỏ qua gì (không Hoàn tác)», «Lối đi tiếp (Thêm KR đối trọng / Sửa KR này) → hộp KR».
- Nhãn chữ trên cạnh: «bấm chip», «Xem góp ý (form sạch)», «form còn chữ → bộ giữ thay đổi hỏi».
- Nút gạch chéo nhỏ ghi «cột góp ý trong hộp Sửa — gỡ».
- AC liên quan: AC-1, AC-5, AC-7, AC-8, AC-12.

## Đề bài — bang-thay-the

- Loại hình: sankey hoặc cây rẽ ba tầng.
- Tầng 1 (hồ sơ đã ký, số eval bị thay): the-gop-y-okr 13 · tro-ly-okr-de-xuat 5 · va-tro-ly-okr-sau-thu 4 · khung-tao-okr-nhu-deal 12 · nen-kara 2.
- Tầng 2 (vì sao vỡ): bỏ cột 25 (gồm nút chuyển chỗ, J/K) · tệp bị xoá 5 · bỏ chỉ ô / cỡ assist 2 · ảnh cũ mất nghĩa 2 · đổi chữ 1 · đỏ dây chuyền 1.
- Tầng 3 (AC thay): AC-12 9 · AC-14 7 · AC-11 6 · AC-7 5 · AC-5 4 · AC-15 2 · AC-16 2 · AC-10 1.
- Chú thích dưới hình: «Các hồ sơ đó không ghim lại; bảng + rang/thay-the.mjs (E25) bảo đảm không eval nào bị thay mà im lặng».
- AC liên quan: AC-15.
