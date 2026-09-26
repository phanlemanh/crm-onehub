# Hình tại điểm quyết định — tra-loi-tin-nhac

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-…-2 cách A: lõi ghi dùng chung + đường xử lý tin trả lời (định tuyến bốn nhánh, luật sáu bước) | 4 nhánh ở định tuyến, 6 bước nối tiếp ở luật | `luong-tra-loi.html` |
| d-…-1 mở sớm trước điều kiện | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-…-3 được cả hoặc không | dưới ngưỡng: 1 nhánh | — |
| d-…-4 chỉ tin hôm nay | dưới ngưỡng: 1 nhánh | — |
| d-…-5, 6, 7 ba mục bỏ | dưới ngưỡng: 0 nhánh | — |
| ba dòng `[GIẢ ĐỊNH]` ở Coverage | dưới ngưỡng: mỗi dòng 1 khẳng định | — |

## Đề bài `luong-tra-loi`

- Loại hình: flowchart (trái sang phải), hai làn: «định tuyến trong zalo-nhan.ts» và «lớp 3 xongTheoTinNhac».
- Nút làn 1: Webhook Zalo → trùng message_id hay bị chặn? (im lặng) → mã nối? (noiBangMa) → docLenh khớp? (sang làn 2) → không khớp (câu «đã nối» + gợi ý; vòng 4 thay bằng send() vào phiên tác tử).
- Nút làn 2, sáu bước dừng ở bước đầu không qua: 1 thành viên, không vai okr → 2 có tin nhắc hôm nay qua Zalo → 3 mọi số trong 1..n → 4 mọi mục là bước → 5 datBuocXong từng bước (@crm/db, chung giao dịch) → 6 một dòng xác nhận. Mỗi bước hỏng có mũi tên ra một câu trả lời, không ghi.
- Nhãn phụ: «một giao dịch với ZaloUpdateSeen», «API setStepDone cũng gọi datBuocXong».
- AC liên quan: AC-2, AC-4..AC-8, AC-10, AC-11.
