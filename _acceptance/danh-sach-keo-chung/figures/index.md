# Hình tại điểm quyết định — danh-sach-keo-chung (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 Hành vi kéo có lưu sống một lần trong SortableSaveList | 3 bước nối tiếp (kéo → đang lưu → xong/lỗi) + 2 nhánh (xong, lỗi) + Hoàn tác | luu-thu-tu.html |
| d-2 Lưu trữ giai đoạn còn thoả thuận không có Hoàn tác | 2 nhánh (không / còn thoả thuận) | luu-tru-giai-doan.html |
| d-3 Không làm Xoá vĩnh viễn | dưới ngưỡng: 1 bước (Khôi phục) — gộp vào luu-tru-giai-doan.html | — |
| d-4 Bỏ design-pass | dưới ngưỡng: 0 nhánh | — |
| d-5 Máy chủ thêm archived, restore | dưới ngưỡng: 1 bước — các nhánh chặn nằm trong luu-tru-giai-doan.html | — |
| Lệch: bảng vòng đời của đợt nói máy chủ đã đúng | dưới ngưỡng: 0 nhánh, nêu bằng chữ trên thẻ | — |

## Đề bài luu-thu-tu

- Loại: sơ đồ trạng thái (state machine).
- Nút: Đứng yên → (kéo, thả) Đang lưu [tay kéo khoá, hiện thứ tự mới] → nhánh «Lưu xong»: toast «Đã lưu thứ tự mới» + nút «Hoàn tác» / nhánh «Lưu lỗi»: thứ tự cũ, toast lỗi.
- Từ «Lưu xong», «Hoàn tác» → Đang trả [khoá] → «Đã trả thứ tự cũ» (toast không nút) hoặc lỗi (giữ thứ tự mới, toast lỗi).
- Ghi chú: một thành phần cho ba nơi — Giai đoạn, bộ phận ở gốc, phòng ban trong bộ phận.
- AC: AC-1, AC-2, AC-3, AC-5.

## Đề bài luu-tru-giai-doan

- Loại: sơ đồ luồng (flowchart) có hai nhánh rẽ.
- Bắt đầu: menu hàng → «Lưu trữ» (khoá nếu là giai đoạn cuối nhóm).
- Nhánh A — không có thoả thuận: lưu trữ ngay, không hỏi → toast «Đã lưu trữ «tên».» + «Hoàn tác» → Hoàn tác: khôi phục và về đúng chỗ cũ.
- Nhánh B — còn thoả thuận: hộp thoại chọn giai đoạn đích → «Chuyển và lưu trữ» → toast không có Hoàn tác (thoả thuận ở lại giai đoạn mới).
- Cả hai nhánh chảy vào «Đã lưu trữ (n)» cuối trang → «Khôi phục» → về cuối nhóm; bị chặn khi trùng tên hoặc đủ 20 giai đoạn (toast lỗi, không đổi). Không có «Xoá vĩnh viễn».
- AC: AC-7, AC-8, AC-9, AC-10, AC-11.
