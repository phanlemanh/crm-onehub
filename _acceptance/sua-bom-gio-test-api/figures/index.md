# Hình tại điểm quyết định — sua-bom-gio-test-api

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 (d-20261120T093823Z-9): sửa mã kiểm hay coi chỗ đọc cấu hình bất nhất của sản phẩm là nguyên nhân | 2 nhánh rẽ | `truc-thoi-gian-cau-hinh` |
| Hỏi-2 (d-20261120T134225Z-25): thêm khoá phân định id vào sắp xếp hay ghi Known limits | 2 nhánh rẽ | `hoi-2-thu-tu` |
| d-7 gop-y-dung-cho chụp rồi trả lại | dưới ngưỡng: 1 bước, 0 nhánh rẽ | — |
| d-8 cmst-goc ghi lại dưới đồng hồ ghim | dưới ngưỡng: 1 bước, 0 nhánh rẽ | — |

## Đề bài `truc-thoi-gian-cau-hinh`

- Loại hình: trục thời gian (timeline) ngang, một trục ngày 03/11 → 20/11/2026.
- Mốc trên trục: «03/11 suite xanh» · «10/11 LUC_DOC — cmst-goc đọc ở đây» · «12/11 MOC_MAU — gop-y-dung-cho đọc ở đây» · «20/11 giờ thật — hàng cấu hình ghi ở đây».
- Hai dải dưới trục: cmst-goc (ghi 20/11, đọc createdAt ≤ 10/11 → không thấy → don-vi-chua-bat) và gop-y-dung-cho (hàng của bài 12/11 AI bật, hàng sót 20/11 aiOn false; đọc «mới nhất» → hàng sót thắng → chip 0).
- Một khung kết luận: «Ở production createdAt ≤ giờ thật luôn đúng → đọc "mới nhất" = đọc "tại now". Lệch chỉ khi bài ghim đồng hồ về quá khứ.»
- AC liên quan: AC-1, AC-2, AC-3 (Hỏi-1).
