# Hình tại điểm quyết định — goi-y-mo-ke-hoach (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-4 — đếm theo lần chuyển (tạo thẳng ở thắng, sinh lại sau bỏ qua) | 4 nhánh của ma trận đi→đến + vòng thắng→bỏ qua→mở→thắng | vong-doi-goi-y |
| Hỏi-3 — deal rời thắng khi gợi ý còn chờ | 2 nhánh (giữ chờ ẩn / hết hiệu lực) | vong-doi-goi-y |
| Hỏi-2 — vòng đời: kết cục nghiệp vụ, không mở lại | 3 bước nối tiếp (chờ → đã mở / bỏ qua) | vong-doi-goi-y |
| Hỏi-1 — nơi hiện: thẻ sheet deal + nhắc buổi sáng/chuông | 2 nhánh (chỉ thẻ / thẻ + nhắc) | noi-hien |
| descope design-pass | dưới ngưỡng: 1 bước | — |

## Đề bài: vong-doi-goi-y
- Loại: sơ đồ trạng thái (state machine).
- Nút: «Lần chuyển sang thắng» (từ mở · thua · tạo mới), «Chờ», «Đã mở kế hoạch», «Đã bỏ qua», «Ẩn (deal rời thắng)».
- Cạnh: điều kiện sinh (công ty chưa có kế hoạch mở ∧ deal chưa có gợi ý chờ); «Chờ» → «Đã mở kế hoạch» khi ai đó tạo kế hoạch cho công ty; «Chờ» → «Đã bỏ qua» bởi người nhận hoặc quản trị; «Chờ» ↔ «Ẩn» khi deal rời/thắng lại; «Đã bỏ qua» → deal mở lại rồi thắng → gợi ý MỚI (Hỏi-4, đánh dấu nét đứt «chờ chủ kho»).
- Nhãn bằng chữ tiếng Việt; AC-1, AC-2, AC-3, AC-4.

## Đề bài: noi-hien
- Loại: sơ đồ luồng hai làn.
- Làn 1 (thẻ): deal sang thắng → sheet deal → thẻ «Deal đã thắng — mở kế hoạch 30 ngày cho <công ty>?» → «Mở kế hoạch» (ô tạo, công ty khoá) / «Bỏ qua».
- Làn 2 (nhắc, Hỏi-1, nét đứt «chờ chủ kho»): sáng hôm sau 08:30 → nhắc buổi sáng Zalo/Slack + Thông báo trong chuông → bấm → sheet deal.
- AC-5, AC-6, AC-7.
