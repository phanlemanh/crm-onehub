# Hình tại điểm quyết định — Cổng 1

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 chọn số bằng cách đọc gói (thay vì đổi tên gieo) | chuỗi nhân quả 5 bước: ma() → tên gieo → chữ gói → trichSo → soTrongGoi → so-moi cho qua | cần hình: `chuoi-chu-so-lac` |
| d-…-2 không sửa ma() (ngoài ranh giới) | dưới ngưỡng: 1 bước | — |
| d-…-3 không thước máy cho «sản phẩm không đổi» | dưới ngưỡng: 1 bước | — |
| d-…-4 chiều đỏ đọc bản ghim thay vì git show | dưới ngưỡng: 2 bước | — |
| d-…-5 bỏ đặc tả UX | dưới ngưỡng: 0 | — |

## Đề bài: chuoi-chu-so-lac

- Loại hình: flowchart ngang, hai làn (trên: đường gây lỗi; dưới: cách sửa và hai chiều đo).
- Làn trên (5 nút): «ma() = sokr-<Date.now hệ 36>x<đếm>» → «tên bộ phận, phòng, chu kỳ» → «chữ gói gửi mô hình (chuCacLop)» → «trichSo đọc 41 trong sokr-mg41ab…» → «soTrongGoi chứa 41 → bài chờ so-moi nhận undefined → đỏ».
- Làn dưới (3 nút): «soVangKhoiGoi(cuộc, gợi ý) đọc soTrongGoi của chính cuộc» → «số thử luôn vắng → luật so-moi giữ nguyên» ; nhánh đo: «fixture va chạm: mọi tên mang 37·41·100·2031» rẽ hai: «spec mới → xanh (E2)» và «spec cũ ghim → đúng bốn bài đỏ (E3)».
- AC liên quan: AC-2, AC-3, AC-4.
