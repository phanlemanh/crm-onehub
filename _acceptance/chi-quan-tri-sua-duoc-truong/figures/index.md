# Hình tại điểm quyết định — chi-quan-tri-sua-duoc-truong

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 — kiểm quyền ở service hay router | hai nhánh rẽ | `cho-kiem-quyen.html` |
| d-2 — thành viên thấy nút khoá hay nút ẩn | hai nhánh rẽ | `khoa-hay-an.html` |
| d-3, d-4, d-5 — bỏ design-pass, bỏ đặc tả UX, không áp router khác | dưới ngưỡng: một bước | — |
| [GIẢ ĐỊNH] vai trò của chủ kho trên prod | hai nhánh rẽ | trong `cho-kiem-quyen.html` (nút cuối) |

## Đề bài `cho-kiem-quyen`

- Loại: luồng rẽ, trái sang phải. Gốc: «Lời gọi đổi trường» → ba lối vào (Màn · tRPC trực tiếp · khoá API) cùng đổ vào «FieldsRouter (chỉ kiểm đã đăng nhập)».
- Nhánh chọn (xanh #006B4F): «FieldsService: workspaceRoleOf → canManageFields» → «403 cho member / không thuộc» và «chạy tiếp cho owner/admin».
- Nhánh không chọn (xám, nét đứt): «kiểm ở router» → ghi chú «lối gọi service khác bỏ sót (Ngoài-1 của sua-luu-tru)».
- Nút cảnh báo (đỏ) cạnh «workspaceRoleOf»: «Chỉ đọc bảng member — dev: chủ kho là member. Kiểm prod trước khi gộp».

## Đề bài `khoa-hay-an`

- Loại: so hai cột (hai màn nhỏ), trái «Khoá + một dòng lý do (chọn)», phải «Ẩn nút (không chọn)».
- Cột trái: danh sách trường, dòng «Cần quyền quản trị để đổi trường của cả đội.», các nút «Trường mới», «Thêm», «Khôi phục» mờ. Chú thích: «nút và 403 không cãi nhau — docs/api.md».
- Cột phải: danh sách trường không nút. Chú thích: «người không biết vì sao, tưởng lỗi».
