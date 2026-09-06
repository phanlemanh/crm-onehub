---
schema_version: 1
slug: tiep-thi-tuyen-doi-tac
feature: Đội tiếp thị chạy trọn một chiến dịch tuyển đối tác trong CRM — phân khúc, làm giàu, nhắm, tiếp cận, đo
owner: phanlemanh@gmail.com
stage: scheduled
verdict:
decided_by:
decided_at:
---

## Ngưỡng đã khai tại Cổng Đáng (CHÉP NGUYÊN VĂN — cấm sửa sau khi thấy số)

Chốt bởi Mạnh 2026-09-05. Cửa sổ đo: bốn tuần kể từ ngày bật cho đội tiếp thị.
**Ngày bật: 2026-09-06** (Mạnh khai). Cửa sổ đo khép **2026-10-04**, và đó là
ngày sớm nhất phiên nghiệm thu họp được — ngưỡng SỐNG đo «bốn tuần sau khi bật».

- Câu hỏi phép đo trả lời: Đội tiếp thị chạy trọn một chiến dịch tuyển đối tác trong CRM mà không phải xuất ra bảng tính không, và phân khúc có làm tỷ lệ phản hồi chênh nhau không?
- Kết quả nào là SỐNG: Bốn tuần sau khi bật, đội tiếp thị chạy trọn ít nhất ba chiến dịch trong CRM — phân khúc định nghĩa trong hệ, danh sách tự sinh, kết quả gắn ngược về đúng chiến dịch — và ít nhất một phân khúc cho tỷ lệ trả lời cao hơn trung bình toàn tập từ 2 lần trở lên.
- Kết quả nào là CHẾT: Đội vẫn xuất bảng tính để chạy; hoặc kết quả không gắn ngược về chiến dịch được; hoặc mọi phân khúc cho tỷ lệ trả lời như nhau — khi đó việc làm giàu không mua được gì.
- Timebox: Năm ngày công cho vòng đầu — một trục phân khúc, một kênh, một chiến dịch. Quá năm ngày nghĩa là đang dựng cả bốn bước cho cả hai làn.

## Điều cửa sổ đo này cần, để 04/10 không đọc toàn CHƯA ĐO

Máy khai hai điều kiện, không tự xử, vì cả hai là việc người quyết:

1. **Tính năng phải nằm ở nơi đội tiếp thị thật sự làm việc.** Mã đang ở nhánh
   `onehub`; sản xuất triển khai từ nhánh `release`, và `onehub` chưa merge sang
   đó. Nếu đội dùng bản trên máy lập trình thì cửa sổ vẫn đo được, chỉ cần khai
   rõ đó là bản nào.
2. **Dữ liệu môi giới phải là dữ liệu thật.** Kho hiện có 49 môi giới nhưng đều
   từ lô ĐÃ CHE của gói bằng chứng: tên là «Chuyên trang NN», và cả 49 mang cùng
   một chuỗi `09xxxxxxxx`. Không gọi được ai. Muốn có số cho ngưỡng «tỷ lệ trả
   lời», phải chạy một lượt cào thật KHÔNG che vào chính môi trường đội dùng.

Thiếu điều 2 thì ba trong bốn thước ở bảng dưới không có cách nào ra số, và
phiên 04/10 sẽ chỉ xác nhận được đúng một điều: đội có chạy trọn chiến dịch
trong CRM mà không xuất bảng tính hay không.

## Người dự

| Tên | Vai | Đại diện cho ai |
|---|---|---|

## Chấm kín (thu TRƯỚC mọi thảo luận chung)

| Người | Điểm/nhận xét kín | Sẽ gửi cho khách nào, khi nào |
|---|---|---|

## Thảo luận sau khi đã chấm

## Số đo thật đặt cạnh ngưỡng

| Thước | Ngưỡng đã khai | Số đo được | SỐNG/CHẾT |
|---|---|---|---|
| Chiến dịch chạy trọn trong CRM sau 4 tuần | ≥ 3 | CHƯA ĐO | |
| Phân khúc có tỷ lệ trả lời ≥ 2× trung bình toàn tập | ≥ 1 phân khúc | CHƯA ĐO | |
| Đội còn xuất bảng tính để chạy | không | CHƯA ĐO | |
| Kết quả gắn ngược về đúng chiến dịch | có | CHƯA ĐO | |

## Quyết định Cổng Giá trị

- **verdict = …** Căn cứ: …
- Bước kế: …
