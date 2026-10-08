# Điểm quyết định — datatable-loc-ro (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 lựa chọn số 0 vẫn chọn được (A) + d-…-3 bảng tự đưa hàm Bỏ lọc | 4 bước nối tiếp (mở menu thấy số → chọn lựa chọn 0 → bảng rỗng vì lọc → Bỏ lọc về bảng có dòng) và 2 nhánh rẽ (có dòng / rỗng vì lọc; Bỏ lọc / Bỏ chọn) | luong-loc.html |
| d-…-2 bỏ design-pass | dưới ngưỡng: 1 bước | — |
| d-…-4 không đổi cách API đếm, không nút Bỏ lọc thường trực | dưới ngưỡng: 1 bước | — |
| Coverage: hai dòng [NGÀNH] (Linear, NN/g) chờ gạch | dưới ngưỡng: 1 bước | — |

## Đề bài: luong-loc

- Loại: sơ đồ trạng thái (state machine) của một bảng danh sách khi lọc.
- Nút: «Bảng có dòng» · «Menu con một tiêu chí (mỗi lựa chọn kèm số, kể cả 0)» · «Bảng rỗng vì lọc: Không có kết quả nào khớp bộ lọc + nút Bỏ lọc» · «Bảng rỗng không lọc: Chưa có … nào.»
- Cạnh: Lọc → menu con · tick lựa chọn có số > 0 → bảng có dòng · tick lựa chọn số 0 → bảng rỗng vì lọc · «Bỏ chọn» trong menu con → bỏ riêng tiêu chí đó · «Bỏ lọc» → bảng có dòng (xoá tiêu chí, trạng thái, tìm kiếm; giữ Đã lưu trữ và sắp xếp) · không dữ liệu, không lọc → bảng rỗng không lọc.
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5, AC-7.
