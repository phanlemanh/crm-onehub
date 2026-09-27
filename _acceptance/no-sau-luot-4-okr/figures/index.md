# Điểm quyết định ở Cổng Phạm vi — no-sau-luot-4-okr

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 cửa sổ sự kiện neo mốc 08:30 | 4 bước nối tiếp (08:30 không việc → 14:00 sự kiện → nhịp 14:01 → sáng D+1), hai cách tính | cần hình: `cua-so-neo-moc` |
| d-…-2 câu chào theo giờ gửi | 2 nhánh (trước/sau 12:00), 1 bước | dưới ngưỡng: 1 |
| d-…-3 zod vào @crm/db, một khuôn | 2 phương án, 1 bước | dưới ngưỡng: 1 |
| d-…-4 + gap-probe P1#3 vết hỏng: ném cả nhịp | 2 nhánh (ném cả nhịp · bỏ dòng ghi lỗi), mỗi nhánh 3 nơi chịu (tin sáng, thẻ Việc của bạn, Tổng quan) | cần hình: `vet-hong-lan-toi-dau` |
| d-…-5 canEditKr + một hàm quyền | 2 phương án, 1 bước | dưới ngưỡng: 1 |
| d-…-6..9 bốn dòng bỏ (design-pass, đặc-tả-UX, ui-observed, tồn qua đêm + Ngoài-6) | 1 bước mỗi dòng | dưới ngưỡng: 1 |
| Coverage [GIẢ ĐỊNH] ×2 | 1 nhánh mỗi dòng | dưới ngưỡng: 1 |

2 điểm vượt ngưỡng N5.

## Đề bài `cua-so-neo-moc`

- Loại: dòng thời gian hai làn (trước sửa · sau sửa), trục ngang là giờ từ 08:30 ngày D tới 08:30 ngày D+2.
- Nút: «08:30 D — X không có việc» · «14:00 D — Y nhắc tên X» · «14:01 D — nhịp nhắc» · «08:30 D+1» · «08:30 D+2».
- Làn trước: 14:01 D tin giữa trưa «sáng nay» · 08:30 D+1 tin lặp lại mục đó (cửa sổ 24 giờ trượt phủ 14:00 D).
- Làn sau: cửa sổ tin D+1 là (08:30 D, 08:30 D+1] tô nền; 14:01 D không tin; 08:30 D+1 đúng một tin; 08:30 D+2 không còn.
- AC liên quan: AC-1, AC-2, AC-4.

## Đề bài `vet-hong-lan-toi-dau`

- Loại: sơ đồ rẽ nhánh từ một nút gốc «một dòng vết bị sửa tay sai khuôn».
- Nhánh A (máy khuyên, đang trong hợp đồng): «ném lỗi nêu mã dòng» → ba nơi: tin sáng của mọi người dừng (log agent mỗi phút) · thẻ «Việc của bạn» của mọi người báo lỗi · phần kế hoạch trên Tổng quan báo lỗi → «ai đó thấy, sửa dòng».
- Nhánh B: «bỏ dòng hỏng, ghi lỗi có mã vào log» → mọi người khác vẫn nhận tin · người được giao mất mục «Được giao» · không ai thấy trên màn.
- Nhãn chữ, không màu mang nghĩa riêng; nhánh A viền đậm là nhánh đang trong AC-11.
- AC liên quan: AC-11.
