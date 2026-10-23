# Điểm quyết định ở Cổng Phạm vi — moi-kr-ca-cong-ty

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 ai thấy trang và ô (mọi vai theo quyền xem / chỉ quản trị) | 3 bước nối tiếp (Sức khoẻ → Mọi KR → ngăn KR) × 2 nhánh vai | luong-moi-kr |
| Hỏi-4 một ô hay cả hàng ô | 2 nhánh | luong-moi-kr |
| Hỏi-2 lọc bộ phận gồm phòng ban con | 2 nhánh | loc-don-vi |
| Hỏi-3 KR mục tiêu cá nhân | dưới ngưỡng: 1 nhánh có dữ liệu (cá nhân nằm ngoài cây đơn vị) | — |
| bỏ design-pass | dưới ngưỡng: 0 nhánh mới (bản mẫu đã có) | — |

## Đề bài hình `luong-moi-kr`

- Loại: flowchart trái sang phải.
- Nút: «Thanh bên › Báo cáo › Sức khoẻ» → «Ô KR trượt (số = số dòng)» → «Mọi KR ?tinhTrangKr=truot» → «Ngăn KR (VK7)»; nhánh phụ «Thanh bên › Báo cáo › Mọi KR» → «Mọi KR (không lọc)».
- Nhãn bên cạnh Mọi KR: ba mặt lọc Tình trạng · Đơn vị · Người, ghi trên đường dẫn.
- Ghi chú Hỏi-1 trên khung Sức khoẻ/Mọi KR: «mọi vai, theo quyền xem OKR» (khuyên) / «chỉ quản trị».
- Ghi chú Hỏi-4 trên ô: «chỉ thêm ô KR trượt; bốn ô cũ giữ nguyên».
- AC: AC-1, AC-3, AC-7, AC-8, AC-9.

## Đề bài hình `loc-don-vi`

- Loại: cây (tree) nhỏ.
- Nút: OneHub; Bộ phận B1 → Phòng ban P1, P2; Bộ phận B2 → Phòng ban P3.
- Tô vùng: chọn «B1» → B1 + P1 + P2 (khuyên, Hỏi-2) so với «chỉ B1» (lối khác).
- Ghi chú: chọn «OneHub» chỉ cho mục tiêu cấp OneHub; mục tiêu cá nhân không nằm trên cây (Hỏi-3).
- AC: AC-5.
