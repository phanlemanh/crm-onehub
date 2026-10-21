# Hình tại Cổng Phạm vi — vòng mở lại 21/10

| Điểm | Đếm | Hình |
|---|---|---|
| d-23 Mở rộng ứng viên (DeepSeek ba vai, Gemini kho) | dưới ngưỡng: 1 bước | — |
| Hỏi-9 Mức suy luận ở kho và soạn | dưới ngưỡng: 2 lối, 1 bước | — |
| Hỏi-10 Luật chọn giữa nhiều ứng viên | 4 bước nối tiếp (loại lượt → ngưỡng vai → chi phí phần ứng viên → phá hoà) | `luat-chon.html` |
| Hỏi-11 Cỡ mẫu, thứ tự, trần | dưới ngưỡng: danh sách | — |
| Hỏi-12 DeepSeek ở Judge, Máy soạn | dưới ngưỡng: 2 lối | — |
| d-22 Tham số hoá thước theo ứng viên | dưới ngưỡng: 1 bước | — |
| d-26 Bỏ chặn giờ cao điểm | dưới ngưỡng: 1 bước | — |

## Đề bài `luat-chon`

- Loại hình: flowchart dọc, một vai.
- Nút: «mỗi ứng viên của vai» → «có lượt bị loại? (sai model · lời dặn lệch · dừng vì trần)» → có: «chưa đủ số — ra khỏi luật chọn»; không → «đạt ngưỡng vai? (Hỏi-6)» → không: «không đạt»; có → «các ứng viên đạt» → «rẻ nhất theo chi phí phần ứng viên (token × giá niêm yết, không gồm judge, phiên gốc)» → «bằng nhau: điểm cao hơn → trung vị giây thấp hơn» → «kiến nghị». Nhánh «không ứng viên nào đạt» → «giữ model đang chạy».
- AC liên quan: AC-5, AC-6.
