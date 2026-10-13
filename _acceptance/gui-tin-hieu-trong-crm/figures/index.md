# Hình tại điểm quyết định — gui-tin-hieu-trong-crm (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Lệnh kéo về đọc CRM qua thủ tục chỉ quản trị gọi, bằng khoá API của chủ kho (sổ #1) | 5 bước nối tiếp (lệnh → API → đóng dấu → tệp → commit) | vong-doi-tin-hieu |
| «Đã lấy về» là lịch sử — chỉ xoá được trước đó (sổ #2, vòng đời) | 2 nhánh rẽ (xoá được / không) | vong-doi-tin-hieu |
| Bộ đọc riêng cho danh sách tín hiệu của bản vẽ (sổ #3) | dưới ngưỡng: 1 bước | — |
| Trang riêng «Tín hiệu đã gửi» thay vì danh sách trong hộp (sổ #4) | dưới ngưỡng: 1 nhánh | — |
| Để sau bốn ô (sổ #5) | dưới ngưỡng: danh sách | — |
| Bỏ cảnh ngữ-cảnh (sổ #7) | dưới ngưỡng: 1 bước | — |
| Câu kit mang mã việc và tên hồ sơ (gap-probe P2, human-gate1) | dưới ngưỡng: 2 lối, không nhánh nối tiếp | — |

## Đề bài hình `vong-doi-tin-hieu`

- Loại: luồng (flowchart) ngang, hai làn: «Trong CRM» và «Trong git của kho».
- Nút: Người bấm Gửi → Hàng chờ của CRM («Đã nhận — chờ đội sản phẩm lấy về») → [rẽ: người gửi xoá — chỉ khi chưa lấy về] → Lệnh kéo về đầu lượt gom (khoá API của chủ kho, đóng dấu «đã lấy về») → Tệp tín hiệu trong git → Lượt gom của kit (nhóm · lẻ · đã có việc) → Bản vẽ lộ trình mang câu trạng thái → Trang «Tín hiệu đã gửi» hiện câu cho người gửi.
- Nhãn bằng chữ; đánh dấu mốc «đã lấy về = có lịch sử, hết xoá».
- AC liên quan: AC-2, AC-5, AC-6, AC-7, AC-9, AC-10.
