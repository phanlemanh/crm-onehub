# Hình tại điểm quyết định — go-tin-hieu-rac (Cổng Phạm vi)

Kê từ sổ quyết định (9 dòng chờ seal), gap-probe (0 mục `human-gate1`), Coverage (0 dòng `[GIẢ ĐỊNH]`).

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 — chỉ Lưu trữ → Khôi phục, không Xoá vĩnh viễn | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-2 — chỉ lưu trữ được khi chưa lấy về; chạy cùng lượt kéo về thì một bên thắng | cần hình: 2 nhánh (lưu trữ trước · kéo về trước) | `luu-tru-va-keo-ve` |
| d-3 — mỗi lần đổi trạng thái một dòng vết | cần hình: 3 bước nối tiếp (lưu trữ → khôi phục → lưu trữ) | `vong-vet` |
| d-5 — chỗ tìm lại là nút «Đã lưu trữ» | dưới ngưỡng: 1 bước | — |
| d-6 — không hỏi, toast Hoàn tác | dưới ngưỡng: 1 bước | — |
| d-7 Hỏi-1 — người gửi thấy gì | cần hình: 2 nhánh (hiện kèm nhãn · ẩn hẳn) | `hoi-1-nguoi-gui` |
| d-8 — chạy design-pass | dưới ngưỡng: 1 bước | — |
| d-9 — đếm chỉ tín hiệu đang dùng (thay d-4) | dưới ngưỡng: 2 bước, 1 nhánh | — |

## Đề bài

### luu-tru-va-keo-ve
- Loại: luồng rẽ hai nhánh (flowchart), một nút xuất phát.
- Nút: «Tín hiệu chưa lấy về» → rẽ «Quản trị bấm Lưu trữ trước» / «Lượt kéo về chạy trước».
- Nhánh 1: «Đang lưu trữ» → «Lượt kéo về bỏ qua: không tệp, không dấu» → «Khôi phục → lượt sau lấy về».
- Nhánh 2: «Đã lấy về (tệp ở kho sản phẩm)» → «Lưu trữ bị từ chối: Đội sản phẩm đã lấy tín hiệu này về».
- AC: AC-2, AC-3.

### vong-vet
- Loại: dòng thời gian ba mốc + một hàng bảng vết dưới mỗi mốc.
- Mốc: «Lưu trữ (Quân, 09:14)» → «Khôi phục (Lan, 09:20)» → «Lưu trữ (Quân, 10:02)».
- Dưới mỗi mốc: dòng vết thêm vào (loại · người · lúc); trên tín hiệu chỉ giữ lần cuối («lưu trữ lúc 10:02, bởi Quân»).
- Chú: «Lưu trữ lại khi đang lưu trữ: không đổi ngày, không thêm vết».
- AC: AC-1, AC-5.

### hoi-1-nguoi-gui
- Loại: so hai lựa chọn cạnh nhau (hai cột), mỗi cột một khung trang «Tín hiệu đã gửi» thu nhỏ.
- Cột A (máy khuyên): dòng «test test» nhãn xám «Đã lưu trữ» + câu «Quản trị đã lưu trữ tín hiệu này — đội sản phẩm sẽ không lấy về.»; dưới: «Người gửi biết vì sao, không gửi lại».
- Cột B: dòng biến mất; dưới: «Gọn hơn — người gửi tưởng mất, có thể gửi lại».
- AC: AC-8.
