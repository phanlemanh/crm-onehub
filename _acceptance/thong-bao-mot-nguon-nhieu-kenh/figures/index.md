# Hình tại điểm quyết định — thong-bao-mot-nguon-nhieu-kenh

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-2 — một cột kênh hay hai cột Zalo và Slack (L5) | hai nhánh rẽ | cần hình: `mot-nguon-hai-duong.html` |
| L7 — thông báo sự kiện rẽ ra kênh qua nhịp của tác nhân | bốn bước nối tiếp (nguồn ghi → bản ghi chuông → nhịp đọc → kênh) | cùng hình `mot-nguon-hai-duong.html` |
| Hỏi-1 — luật chia và bảng mức | dưới ngưỡng: 0 bước, 0 nhánh (bảng phân loại, đã có bảng trong thiết kế) | — |

## Đề bài `mot-nguon-hai-duong`

- Loại hình: luồng (flowchart) trái → phải.
- Nút: ba nguồn ghi («Nhắc buổi sáng», «Kara dựng xong / cần trả lời / hỏng», «Tín hiệu đổi chỗ») → một bản ghi
  «Thông báo» → nhánh «Chuông — luôn nhận» và nhánh «Kênh ngoài» chia hai đường: «Tin sáng gộp — bỏ loại đã tắt» và
  «Nhịp mỗi phút — loại đã bật, ghi sau lúc bật, trong 30 phút» → ô «Kênh người đang dùng: Zalo hoặc Slack».
- Một ô phụ cho Hỏi-2: «Một cột theo kênh đang dùng (khuyên)» đối với «Hai cột Zalo và Slack — có thể gửi một thông báo hai nơi».
- Nhãn bằng chữ tiếng Việt, không tên hàm. AC liên quan: AC-2, AC-3, AC-4, AC-7.
