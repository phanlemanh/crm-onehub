# Hình tại điểm quyết định — okr-mau-xoa-du

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 (sổ d-…-6): xoá thêm việc và tín hiệu của người mẫu ra sao | 2 nhánh rẽ (khuyên · lối khác) | `quyet-dinh-xoa.png` |
| Hỏi-2 (sổ d-…-7): giữ hay bỏ lưới chống ruỗng | 2 nhánh rẽ (giữ · bỏ) | `quyet-dinh-xoa.png` |

## Đề bài hình `quyet-dinh-xoa`

Loại: cây quyết định hai khối, mỗi khối một câu hỏi, hai nhánh, mỗi nhánh một câu giá.
- Hỏi-1 «Lệnh dọn bộ mẫu xoá thêm những gì?» → nhánh khuyên «việc do người mẫu tạo + tín hiệu người mẫu gửi; dừng có tên khi kéo theo dữ liệu người ngoài» · nhánh khác «mọi việc có người mẫu ở bất kỳ cột nào, để xoá dây chuyền» (giá: dữ liệu người ngoài mất không báo).
- Hỏi-2 «Có đặt lưới bắt bảng mới chưa khai không?» → nhánh khuyên «giữ: bắt ở PR thêm bảng» (giá: PR lược đồ của mọi dãy phải khai một dòng) · nhánh khác «bỏ: chỉ gọi tên khi dọn» (giá: bảng mới lại làm đỏ phép đo của hồ sơ khác).
- AC liên quan: AC-1, AC-2, AC-3 (Hỏi-1); AC-5 (Hỏi-2).
