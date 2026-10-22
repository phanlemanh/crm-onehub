# Hình tại điểm quyết định — nhap-truong-luc-tao

| Điểm | Đếm | Hình |
|---|---|---|
| Lượt tạo mang trường (d-4), máy chủ chặn thiếu bắt buộc ở dịch vụ (Hỏi-3), hàng chờ Kara bỏ khoá đã có giá trị (d-8), lỗi mang khoá trường (d-9) | 5 bước nối tiếp (form → create kèm fields → kiểm bắt buộc → ghi cùng giao dịch → xếp hàng Kara) + 2 nhánh (từ chối có khoá · đường máy ghi thẳng Prisma không qua create) | `luot-tao.html` |
| Hỏi-1 Kara điền vẫn bắt buộc | dưới ngưỡng: 2 lối, một luật | — |
| Hỏi-2 bản ghi cũ không bị chặn | dưới ngưỡng: 2 lối, một luật | — |
| Hỏi-4 ô tích chưa tích là để trống | dưới ngưỡng: 2 lối, một ô | — |

## Đề bài `luot-tao`

- Loại hình: sơ đồ luồng (flowchart) trái sang phải, một làn chính và hai nhánh ở dưới.
- Làn chính: «Form tạo / thêm nhanh — trường bắt buộc + trường hiện trên phiếu, theo fields.layout» → «companies|contacts|deals.create { …, fields }» (cùng một cửa cho tRPC, REST, khoá API) → «Kiểm trường tự tạo bắt buộc chưa lưu trữ (Hỏi-3)» → «Ghi bản ghi + fields.applyValues trong một giao dịch» → «Xếp hàng Kara điền: chỉ khoá còn trống (d-8)» → «Phiếu mở với đủ giá trị».
- Nhánh 1 (từ ô kiểm và ô ghi): «Từ chối BAD_REQUEST mang khoá trường (d-9)» → «Form: toast tiếng Việt + câu dưới ô, giữ giá trị» — vẽ đường quay về form.
- Nhánh 2 (đường đứt, tách riêng): «Gmail/Lịch · form theo dõi · tin đăng · công ty từ tên miền — ghi thẳng Prisma, không qua create, không đổi» (ngoài phạm vi).
- Nhãn lối khác của Hỏi-3 (chú thích nhỏ cạnh ô kiểm): «lối khác: chỉ form chặn, API để nguyên».
- AC liên quan: AC-3, AC-4, AC-5, AC-7.
