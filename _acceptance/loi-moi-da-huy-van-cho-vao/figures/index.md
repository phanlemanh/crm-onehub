# Hình tại điểm quyết định — loi-moi-da-huy-van-cho-vao

| Điểm | Đếm | Hình |
|---|---|---|
| Neo từ vựng vào kiểu gói xuất | nhị phân | dưới ngưỡng |
| Trạng thái lạ → dòng unknown fail-closed | nhị phân | dưới ngưỡng |
| Bỏ đặc tả UX | nhị phân | dưới ngưỡng |
| Dữ liệu cũ `"cancelled"` và vế ghi | ba bước nối tiếp, hai nhánh rẽ | `tu-vung-va-du-lieu-cu` |

## Đề bài: tu-vung-va-du-lieu-cu

- Loại: sơ đồ luồng có hai làn — làn TRÁI «ai ghi trạng thái», làn PHẢI «ai đọc để quyết».
- Nút làn trái: `mời` ghi `pending` · `thu hồi của kho` ghi `cancelled` hai chữ L · `huỷ qua gói` ghi `canceled` một chữ L · `người từ chối` ghi `rejected` · `kết nạp` ghi `accepted`.
- Nút làn phải: `decideSignIn` — hôm nay chặn khi bằng `cancelled`; sau bản sửa cho vào khi thuộc `{pending, accepted}`.
- Tô đậm hai mũi tên hôm nay LỌT: `canceled` và `rejected` đi thẳng vào «cho vào».
- Một khối quyết định rẽ hai nhánh, nhãn bằng chữ: nhánh A «chuyển dữ liệu cũ cancelled sang canceled trong vòng này» · nhánh B «để dữ liệu cũ nguyên, chỉ chặn ở tầng đọc».
- Ghi rõ nhãn: dưới danh sách trắng, `cancelled` bị chặn ở CẢ hai nhánh; khác nhau là kho có còn nói hai thứ tiếng hay không.
- AC liên quan: AC-1, AC-2, AC-3, AC-5.
