# Hình tại điểm quyết định — du-an-gantt (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 chế độ dời (dời khi chồng) | ba bước nối tiếp: việc trước trễ → việc sau dời → việc sau nữa dời | luat-doi-lich |
| Hỏi-5 chặn hay cho chồng | hai nhánh rẽ: đặt sớm → từ chối / cho chồng tô đỏ | luat-doi-lich |
| Hỏi-7 dời thay người không có quyền | hai nhánh rẽ: việc sau của người khác → dời / chặn | luat-doi-lich |
| Hỏi-2 ai đóng và xoá dự án | dưới ngưỡng: một lựa chọn hai lối, không có luồng | — |
| Hỏi-3 mốc trễ giữ ngày | dưới ngưỡng: hai lối, đã có trên ảnh ST-gantt-moc-tre | — |
| Hỏi-4 ai thấy việc trong dự án | dưới ngưỡng: hai lối, không có luồng | — |
| Hỏi-6 kéo có bám ngày làm việc | dưới ngưỡng: hai lối, không có luồng | — |

## Đề bài — luat-doi-lich

- Loại hình: flowchart (luồng quyết định), ngang, tiếng Việt có dấu.
- Nút: «Người thực hiện A kéo hạn A từ 21/10 sang 23/10» → «Việc sau B (của Q) bắt đầu sớm hơn ngày làm việc kế sau hạn A?» → có: «B dời sang 27/10 – 28/10 (bỏ T7 24, CN 25, lễ T2 26; giữ 2 ngày làm việc)» → «C dời theo B sang 29/10 – 30/10» → «Mốc Go-live 30/10 giữ ngày; việc phải xong trước trễ thì mốc hiện ‹trễ›»; không: «không dời, không kéo lùi».
- Hai nhánh rẽ đánh dấu chỗ người quyết: [Hỏi-7] ở bước «B là việc của Q, người kéo không sửa được B» — lối khuyên «vẫn dời, lịch sử ghi người kéo» / lối khác «chặn lần kéo, báo tên B»; [Hỏi-5] ở nhánh phụ «Q đặt tay B bắt đầu 26/10 khi A hạn 23/10» — lối khuyên «từ chối, thanh về chỗ cũ» / lối khác «cho chồng, tô đỏ».
- Nhãn [Hỏi-1] trên cả luồng: «một chế độ: dời khi chồng».
- AC liên quan: AC-5, AC-7, AC-8, AC-10.
