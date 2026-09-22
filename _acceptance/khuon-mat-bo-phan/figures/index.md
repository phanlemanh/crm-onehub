# Hình tại điểm quyết định — khuon-mat-bo-phan

| Điểm | Đếm | Hình |
|---|---|---|
| d-20260922T013108Z-1 — chặn xoá hay bỏ bước mồ côi | hai nhánh rẽ | `hai-huong.html` |
| d-20260922T013108Z-2 — bỏ design-pass | dưới ngưỡng: một bước | — |
| d-20260922T013108Z-3 — bỏ đặc tả UX | dưới ngưỡng: một bước | — |
| d-20260922T013108Z-4 — bỏ đường đo | dưới ngưỡng: một bước | — |
| d-20260922T013108Z-5 — không vá khuôn mồ côi cũ | dưới ngưỡng: một bước | — |

## Đề bài `hai-huong`

- Loại hình: luồng rẽ hai nhánh (flowchart), trái sang phải.
- Gốc chung: «Lưu trữ khuôn K (bước giao cho B)» → «Lưu trữ B» → «Người bấm Xoá vĩnh viễn B».
- Nhánh hôm nay (đỏ): «Máy cho xoá» → «Khôi phục K» → «404 — K kẹt mãi».
- Nhánh A — chặn xoá (chọn, xanh lá brand): «Máy từ chối, nêu tên K» → «Khôi phục B rồi K» → «K về nguyên vẹn» (AC-1, AC-2); rẽ phụ «Xoá K trước, hoặc bỏ B khỏi K» → «B xoá được» (AC-3).
- Nhánh B — bỏ bước mồ côi (không chọn, xám): «Máy cho xoá» → «Khôi phục K, bỏ bước của B» → «K mất bước, người soạn lại».
