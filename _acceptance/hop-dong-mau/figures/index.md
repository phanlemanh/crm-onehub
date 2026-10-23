# Hình tại điểm quyết định — hop-dong-mau

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 người làm (người mẫu có nhãn hay quản trị thật) | 6 bước nối tiếp của lệnh nạp, 2 nhánh ở bước người làm | `luong-lenh-nap` |
| Hỏi-2 loại bản ghi gắn tệp | 2 nhánh, cùng bước «bản ghi mẫu» của luồng | `luong-lenh-nap` (đánh dấu ở bước ấy) |
| Hỏi-3 đo trên Blob thật | 2 nhánh, ở bước «gắn tệp» của luồng | `luong-lenh-nap` (đánh dấu ở bước ấy) |
| Bộ mẫu sáu tệp và đáp án | dưới ngưỡng: một bảng, không có bước nối tiếp | — |

## Đề bài `luong-lenh-nap`

- Loại hình: sơ đồ luồng (flowchart) trái sang phải, một làn.
- Nút theo thứ tự: «Chặn production (kiemDuocNap)» → «Kiểm tiền đề: workspace · kho tệp bật · khoá trường hop-dong» →
  «Người làm» → «Bản ghi mẫu: 1 công ty, 7 thoả thuận» → «Trường «Hợp đồng» kiểu Tệp» → «Gắn 6 tệp: requestUpload → PUT
  → complete» → «In báo cáo, thoát 0». Hai lối thoát sớm: từ nút chặn «mã chan»; từ nút kiểm «mã khoTat / sai».
- Ba nhãn quyết định gắn vào nút: Hỏi-1 ở «Người làm» (nhánh A khuyên: người mẫu có nhãn, ghi thẳng user/member; nhánh B:
  quản trị đầu tiên của workspace); Hỏi-2 ở «Bản ghi mẫu» (khuyên: chỉ thoả thuận; lối khác: thêm công ty, cá nhân); Hỏi-3
  ở «Gắn 6 tệp» (khuyên: kho Blob giả theo hợp đồng DA19; lối khác: thêm ca kho thật có cờ).
- Chú thích dưới: «chạy lại: tệp trùng sha256 trả hàng cũ (luật của DA19)».
- AC liên quan: AC-3, AC-4, AC-5, AC-6.
