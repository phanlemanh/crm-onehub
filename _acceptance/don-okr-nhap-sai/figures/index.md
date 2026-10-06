# Hình tại điểm quyết định — don-okr-nhap-sai

| Điểm | Đếm | Hình |
|---|---|---|
| Nút nào hiện trên ngăn mục tiêu (Xoá / Bỏ / Dùng lại) theo trạng thái và lịch sử | 3 nhánh trạng thái × 2 nhánh lịch sử | nut-theo-trang-thai |
| Xoá khi một lần cập nhật tuần chen giữa | 3 bước nối tiếp | xoa-khi-chen-giua |
| Nháp sạch chỉ có Xoá, không có Bỏ (d-…-1) | thuộc hình nut-theo-trang-thai | — |
| Giữ vết và góp ý Kara, dấu tạo từ mẫu đi theo (d-…-2) | dưới ngưỡng: 1 bước | — |
| Máy chủ tách mảng daBo (d-…-3) | dưới ngưỡng: 1 bước | — |
| Chặn xoá vĩnh viễn ở cả REST (d-…-4) | dưới ngưỡng: 1 nhánh | — |
| Dùng lại giữ publishedAt, toast hai nhánh (d-…-5) | 2 nhánh | thuộc hình nut-theo-trang-thai |
| Bốn dòng [GIẢ ĐỊNH] của Coverage | dưới ngưỡng: mỗi dòng 1 câu | — |

## Đề bài

**nut-theo-trang-thai** — loại hình: cây quyết định (decision tree). Gốc «Mục tiêu trong
chu kỳ nhận ghi, người sửa được đơn vị». Nhánh theo trạng thái: Nháp · Chờ duyệt · Đã công
bố · Đã bỏ. Nháp và Đã bỏ rẽ tiếp theo «có lịch sử?» (đã từng công bố, có bình luận, ghi
nhận, nhìn lại, mang sang, mục tiêu khác góp vào, hay KR có cập nhật, điểm, bằng chứng,
đổi đích). Lá: Nháp sạch → «Xoá mục tiêu»; Nháp có lịch sử → «Bỏ mục tiêu»; Chờ duyệt →
«Rút về Nháp trước»; Đã công bố → «Bỏ mục tiêu»; Đã bỏ sạch → «Dùng lại» + «Xoá mục
tiêu»; Đã bỏ có lịch sử → «Dùng lại». Chú thích dưới lá «Dùng lại»: về Nháp, toast «Gửi
duyệt lại…» hoặc «Công bố lại…» tuỳ đơn vị có bước duyệt. AC-4, AC-6, AC-11.

**xoa-khi-chen-giua** — loại hình: sơ đồ tuần tự (sequence), hai làn «Cập nhật tuần» và
«Xoá mục tiêu», một làn «Cơ sở dữ liệu». Bước: (1) cập nhật tuần khoá hàng KR và ghi một
lần cập nhật, chưa xong; (2) xoá mục tiêu khoá hàng mục tiêu, xin khoá hàng KR → chờ; (3)
cập nhật tuần xong, nhả khoá; (4) xoá kiểm lịch sử, thấy lần cập nhật mới → từ chối «có
lịch sử», không xoá gì. AC-2, E19.
