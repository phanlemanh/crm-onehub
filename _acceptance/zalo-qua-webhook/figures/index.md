# Hình tại điểm quyết định — zalo-qua-webhook

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-1 kênh eve trong tác tử (loại API, loại hàm riêng) + d-2 thân hỏng trả 200 + d-4 bỏ tin nhóm + giả định (1), (2) | 4 nhánh rẽ trên một đường vào | cần hình → `luong-webhook` |
| AC-8 luật giao tin: nhịp cũ mất tin, vòng tay và webhook bắt được | 3 đường song song trên một trục thời gian | cần hình → `giao-khi-mo` |
| d-3 hoãn dấu «đã đăng ký webhook» sang vòng 2 | 1 bước | dưới ngưỡng: 1 bước, không nhánh |
| d-5 bỏ đặc tả UX | 1 bước | dưới ngưỡng: 1 bước, không nhánh |
| d-6 nhánh thành công của lệnh tay đo lúc triển khai | 2 bước | dưới ngưỡng: 2 bước nối tiếp |

## Đề bài `luong-webhook`

- Loại: flowchart ngang, một đường vào rẽ bốn nhánh.
- Nút: «Zalo gửi POST /zalo/webhook» → «Có ZALO_BOT_TOKEN và ZALO_WEBHOOK_SECRET?» (không → «404, tính năng tắt») → «Header X-Bot-Api-Secret-Token khớp? (so qua băm)» (không → «403, không đọc thân») → «Thân đúng khuôn {ok, result:{event_name, message}}?» (không → «200 + log khoá cấp đầu») → «Tin từ người, PRIVATE?» (không → «200, bỏ qua») → «Lõi chung với zalo:poll: chống trùng · chống dò · nối mã · trả lời» → «200».
- Nhãn chú thích: hai ô «header» và «khuôn thân» gắn cờ «giả định (2): chưa đo trên bot thật». Ô «200 + log» gắn «giả định (1): Zalo gửi lại khi khác 2xx».
- AC liên quan: AC-1, AC-2, AC-3, AC-5, AC-6, AC-11.

## Đề bài `giao-khi-mo`

- Loại: timeline, trục giây 0 → 180, ba làn.
- Làn 1 «Nhịp cũ #94»: ba cửa sổ mở 1 giây ở 0, 60, 120. Tin mã đến ở giây 30 nằm ngoài cửa sổ → «mất, không nối».
- Làn 2 «Vòng tay zalo:poll»: cửa sổ 30 giây liền nhau → tin ở giây 30 rơi vào cửa sổ → «nối».
- Làn 3 «Webhook»: Zalo đẩy tin ngay ở giây 30 → «nối».
- Một vạch dọc ở giây 30 xuyên cả ba làn, nhãn «tin mã đến».
- AC liên quan: AC-8.
