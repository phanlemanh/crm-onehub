# Hình tại điểm quyết định — tieu-de-cot-doc-tron (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| Cách sửa tiêu đề (d-…-1, d-…-6, d-…-7): bốn phương án đã đo | 4 nhánh rẽ | cần hình: `phuong-an-tieu-de` |
| Ba chỉnh ưu tiên cột (d-…-3, d-…-8) | 1 bảng, không nhánh | dưới ngưỡng: 3 dòng song song, bảng trong design đủ |
| Sửa thước onboarding trong PR này (d-…-9, AC-8) | 5 bước nối tiếp | cần hình: `thuoc-onboarding` |
| [GIẢ ĐỊNH] campaigns/companies/members ở khổ hẹp | 0 nhánh | dưới ngưỡng: câu có/không |
| [GIẢ ĐỊNH] tiêu đề hai dòng | 0 nhánh | dưới ngưỡng: xem ảnh |
| [GIẢ ĐỊNH] chữ tên hẹp hơn ở 12/50 ô | 0 nhánh | dưới ngưỡng: số trong hình `phuong-an-tieu-de` |

## Đề bài `phuong-an-tieu-de`

- Loại: biểu đồ thanh ngang nhóm (bar), một nhóm mỗi phương án.
- Bốn phương án, đo trên cùng bàn đo 3500/3501, 50 ô: (A) cây chưa sửa · (B) bỏ table-fixed, nhãn một dòng · (C) B + ẩn mũi tên nghỉ dưới 640 · (D) nhãn hai dòng + mũi tên cùng dòng + ba chỉnh cột (đề xuất).
- Hai thước mỗi phương án: số ô có tiêu đề bị cắt /50; chữ tên nhìn thấy nhỏ nhất ở các ô tệ nhất.
- Số: A: 30/50 cắt · B: 0/50 cắt, campaigns cuộn 60px ở 320, companies@1024/vi tên 41px, members@768/vi 16px · C: cột Tên không đổi so với B (deals@320/vi 76px cột) · D: 0/50 cắt, 0 cuộn, tên nhỏ nhất 43px (contacts@768, bằng A).
- Nguồn: evidence/nen-truoc-sua.txt, nen-chu-ten-truoc-sua.txt, thu-auto-layout.txt, thu-an-mui-ten-bi-loai.txt, thu-hai-dong.txt.
- AC liên quan: AC-1, AC-7, AC-9.

## Đề bài `thuoc-onboarding`

- Loại: sơ đồ tuần tự (sequence), hai làn: hồ sơ này · hồ sơ onboarding-giong-deals.
- Bước: (1) #85 merge 607fe361 → (2) rebase, chạy ogd_man_danh_muc: đỏ 48 dòng `khong doc duoc nhan`, không dòng cắt/tràn → (3) nếu duyệt: sửa bộ chọn + điều kiện cắt dọc trong man-danh-muc.mjs, dòng sổ bên đó, sửa expected E4 bên đó → (4) cặp hai chiều trên cùng thước (xanh 70/70; phá line-clamp-1 → `tieu de bi cat`) → (5) repin-lane --write ghim lại onboarding-giong-deals ở đỉnh nhánh.
- Nhánh không duyệt: AC-8 ra khỏi hợp đồng, hồ sơ onboarding tự ghim sau khi PR này merge (và đỏ trên onehub trong khoảng giữa).
- AC liên quan: AC-8.
