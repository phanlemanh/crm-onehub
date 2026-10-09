# Hình tại điểm quyết định — sua-paths-e5-soan-okr (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 sửa cả E5 và E17 | 2 nhánh (bộ lọc bật / tắt theo từng mục đường dẫn) | luoi-hoa-cu.html |
| d-…-2 không sửa 11 hồ sơ khác | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| d-…-3 bỏ quét độ phủ | dưới ngưỡng: 1 bước | — |
| d-…-4 bỏ đặc tả UX | dưới ngưỡng: 1 bước | — |
| d-…-5 đo qua lưới thật (E7) | gộp vào luoi-hoa-cu.html (cùng luồng) | luoi-hoa-cu.html |

## Đề bài luoi-hoa-cu

- Loại hình: luồng quyết định (flowchart), trái sang phải, hai nhánh.
- Nút: «PR chạm thư mục hồ sơ» → «Lưới trước-khi-gộp soi hồ sơ» → «Mọi đường dẫn của hồ sơ trỏ tới tệp có thật?» — nhánh KHÔNG: «Bộ lọc tắt → mọi tệp mã đổi = hồ sơ cũ» (đỏ, hôm nay: E5 `settings/to-chuc/**`, E17 `okr-tro-ly.ts`) · nhánh CÓ: «Bộ lọc bật → chỉ cũ khi tệp đổi khớp vật hồ sơ đo» → hai nhánh con: «tệp ngoài mọi đường dẫn → không cũ (AC-7)» · «tệp trong apps/ hay packages/ → vẫn cũ, vì luật kho E27 đo cả cây (giới hạn đã khai)».
- Nhãn bằng chữ cho người; tên tệp xuống chú thích.
- AC liên quan: AC-1, AC-2, AC-7; giới hạn OOS-3.
