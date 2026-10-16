# Hình tại điểm quyết định — thu-paths-e15-giai-doan (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 · bỏ mục (3) thu paths gioi-han-duyet-cay-okr (d-20261016T050751Z-4; yêu cầu P1-21) | 3 nhánh rẽ | `hoi-1-gioi-han.html` |
| Hỏi-2 · thu hẹp mục (2) và đổi câu SỐNG thứ hai (d-20261016T051203Z-8 thay d-…-5; yêu cầu P1-22; gap-probe P0) | 3 nhánh rẽ | `hoi-2-pham-vi-paths.html` |
| Phụ thuộc #427 (d-…-6) | dưới ngưỡng: 1 bước, 0 nhánh | — |
| E15 thu về tệp chữ nhập thẳng (d-…-1) | dưới ngưỡng: 0 nhánh sống | — |

## Đề bài từng hình

### hoi-1-gioi-han
- Loại: hai cột so sánh tập tệp (glob hiện tại vs bao đóng import thật), rồi ba nhánh.
- Số: bao đóng import 5 trang răng màn mở = 782 tệp. E15: 131 tệp apps/app khớp glob, 116 trong bao đóng, 192 tệp bao đóng NGOÀI glob. Tệp #431 (tien-do-kr.tsx, tom-tat-quan-tri.tsx) nằm trong bao đóng → lần hoá cũ của #431 là đúng.
- Ba nhánh: (a) Khuyên — bỏ mục (3), ghi lý do có số; (b) thu E17 (DOM) về 36 tệp — ghim lại một hồ sơ đã ký, mức hồ sơ không đổi vì E15/E16 vẫn phủ okr/**; (c) nới paths theo bao đóng — hồ sơ hoá cũ nhiều hơn, hàng riêng.
- AC liên quan: AC-4 (không chạm evals.yaml ngoài danh sách).

### hoi-2-pham-vi-paths
- Loại: phễu 51 hồ sơ → ba ngăn, rồi ba nhánh.
- Phễu: 53 eval judgment thiếu paths ở 51 hồ sơ → sau khi thêm paths: 4 hết hoá cũ · 3 chưa ghim · 44 vẫn hoá cũ thật (tệp đo của chính chúng đổi từ lúc ghim). Cạnh bên: 3 eval không suy được paths (2 không inputs, 1 input trỏ tệp mất).
- Ba nhánh: (a) Khuyên — chỉ 7 hồ sơ (+ thu-haiku E8, ghim-thuoc-soi-xem-okr E3 sau khi P0 gộp); câu SỐNG thứ hai đọc «ở các hồ sơ trong danh sách»; 44 hồ sơ thêm paths ở lần ghim kế; (b) làm trọn 51, ghim lại 44 trong PR — nhiều giờ máy, khoá s4 cả đợt, có hồ sơ phải chấm S4; (c) bỏ mục (2), chỉ báo kit.
- Ghi chú trên hình: số hoá cũ toàn kho chỉ giảm 245 → ~241 dù chọn (a) hay (b).
- AC liên quan: AC-3, AC-5, AC-7.
