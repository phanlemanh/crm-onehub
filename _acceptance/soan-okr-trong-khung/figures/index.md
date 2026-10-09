# Hình tại Cổng Phạm vi — soan-okr-trong-khung

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-1 khung bản ghi thay trang riêng | 4 bước nối tiếp (mở → chỉ Kara → bản nháp mở về trái → đóng) | cần hình: `vong-doi-khung` |
| [GIẢ ĐỊNH] hỏi lại chỉ khi Kara đang soạn + đóng không dừng lượt | 2 nhánh (đang soạn / rảnh) × 4 cách rời | cần hình: `vong-doi-khung` (gộp) |
| d-5 + [GIẢ ĐỊNH] ngưỡng khổ 1024 / 768 | 3 nhánh (≥ 1024 hai ô · 768–1023 hai tab · < 768 toàn màn) | cần hình: `nguong-kho` |
| d-2 token 380/800 + [GIẢ ĐỊNH] 380 thay 400 | 0 bước — một giá trị | dưới ngưỡng: 0 |
| d-3 bỏ đường đo | 0 bước | dưới ngưỡng: 0 |
| d-4 chạy design-pass | 0 bước | dưới ngưỡng: 0 |
| d-6 bỏ cảnh ngữ-cảnh | 0 bước | dưới ngưỡng: 0 |

## Đề bài `vong-doi-khung` (state machine / flowchart)

- Nút: «Theo đơn vị (hoặc trang bất kỳ)» → «Khung: chỉ Kara» → «Khung: bản nháp trái + Kara phải» → «Đã đưa vào» → «Đóng → trang nền làm mới».
- Nhánh rời khung khi Kara đang soạn: «Bấm ra ngoài → không đóng»; «Esc / nút đóng / vuốt → hộp hỏi» → «Ở lại» | «Đóng — lượt vẫn chạy trên máy chủ» → «Mở lại → nối tiếp».
- Nhánh Kara rảnh: mọi cách rời → «Đóng ngay».
- Nhãn chữ tiếng Việt. AC liên quan: AC-1, AC-3, AC-7, AC-8, AC-13.

## Đề bài `nguong-kho` (threshold / layer)

- Ba dải theo bề ngang khung nhìn: «≥ 1024: hai ô — bản nháp ≤ 800 trái, Kara 380 phải»; «768–1023: khung ≤ 800, hai tab Trò chuyện / Bản nháp»; «< 768: phủ toàn màn, hai tab».
- Ghi chú: cột Kara = token --container-assist-rail; bản nháp = --container-assist. AC liên quan: AC-3, AC-6.
