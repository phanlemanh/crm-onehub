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

## Hai điều kiện đã xử lý 2026-09-06, và ba rủi ro còn nằm trong kho

Mạnh chốt cùng ngày: đội tiếp thị dùng **bản dev trên máy lập trình** — API cổng
3001 và app cổng 3000 chạy từ checkout chính, nhánh `onehub`, ghi vào cơ sở dữ
liệu `crm` trên localhost. Không merge sang `release` cho cửa sổ đo này. Điều 1
đóng theo nghĩa «khai rõ đó là bản nào».

Điều 2 đóng bằng một lượt cào thật lúc 22:44 ngày 06/09: `--limit 50`, không
`--redact`, tuân tệp khai báo máy quét, giãn nhịp 1,5 giây thật. Gieo 50, lấy
được 49, cổng tiếp nhận trả 201. Lô thật chỉ nằm trong cơ sở dữ liệu; tệp lô đã
xoá sau khi gửi, không tệp nào vào git.

| Thước trên 49 hồ sơ thật | Số |
|---|---|
| Số điện thoại khác nhau | 49 |
| Sản lượng Cao / Vừa / Thấp / Ngủ | 23 / 26 / 0 / 0 |
| Tin đang đăng min / trung vị / max | 36 / 56 / 447 |
| Hình thái công ty / cá nhân | 49 / 0 |
| Có chứng chỉ | 6 |

Ba rủi ro đo được, Mạnh chọn **giữ nguyên kho**, người đọc số ngày 04/10 phải
tự loại:

1. **49 hồ sơ che cũ vẫn nằm trong kho.** Khoá khớp của cổng tiếp nhận là địa
   chỉ hồ sơ, lô che mang địa chỉ giả `moi-gioi-mau-NN`, nên lượt thật tạo mới
   49 thay vì cập nhật. Phân khúc «Sản lượng = Cao» hiện có 49 người, 26 trong
   đó mang số `09xxxxxxxx` không gọi được. Lọc bằng `phone = '09xxxxxxxx'`.
2. **13 chiến dịch thử của vòng chấm 05/09 còn trong kho.** Chúng lọt vào hàng
   «đối chứng = mọi chiến dịch khác» và vào đếm «≥ 3 chiến dịch chạy trọn».
   Lọc theo ngày tạo 2026-09-05 trước khi so ngưỡng.
3. **Ngưỡng 60/20/1 chỉ chia được hai nhóm trên dữ liệu thật.** Danh bạ nhatot
   xếp theo sản lượng giảm dần và bộ cào lật 8 trang đầu, nên không hồ sơ nào
   dưới 36 tin vào kho: Thấp và Ngủ rỗng, Hình thái không chia được ai với ai,
   chỉ Chứng chỉ cho lát cắt 6 và 43. Thước «phân khúc ≥ 2× đối chứng» vì thế
   chỉ đo được Cao so với Vừa. Chỉnh `directory_max_pages` hoặc đặt lại ngưỡng
   là việc người quyết trước chiến dịch đầu.

### Đính chính hai công thức lọc — Mạnh, 2026-09-07, đo lại trên kho

Hai câu ở mục 1 và mục 2 ngay trên nói SAI trên vật. Giữ nguyên văn bản gốc và
đính chính ở đây, vì đó là công thức người đọc số ngày 04/10 sẽ dùng.

**Mục 1 nói phân khúc «Sản lượng = Cao» có 49 người. Đo lại: có 70.** Ngoài 26
hồ sơ che và 44 môi giới thật, còn **21 cá nhân nguồn MANUAL** do bộ chặn lái
trình duyệt của vòng chấm 4 dựng ra — chúng mang giá trị Sản lượng nhưng không
phải môi giới. Lọc `phone = '09xxxxxxxx'` chỉ bỏ được 26; 21 hồ sơ kia ở lại.

Công thức đúng cho môi giới thật, đủ cả ba nguồn nhiễu:

    source = 'LISTING' AND phone NOT LIKE '%x%'    → 49 hồ sơ

**Mục 2 nói 13 chiến dịch thử là của vòng chấm 05/09 và bảo lọc theo ngày tạo
2026-09-05. Đo lại: cả 13 đều tạo ngày 2026-09-06**, nên lọc theo 05/09 không bỏ
được gì — công thức chạy nhưng vô hiệu. Mười hai cái do chặn lái vòng 4 dựng lúc
10:51–10:53Z (tên mang mã lượt `ttmtpo…`, `ttmtpp…`), một cái là chiến dịch của
ván lái-thử người-lạ số 2 lúc 10:27Z.

Công thức đúng — mọi chiến dịch có trước lúc lượt cào thật xong (15:44Z 06/09):

    createdAt < '2026-09-06T15:00:00Z'             → bỏ đúng 13

Nói cách khác: tính tới 07/09, **chưa chiến dịch nào của đội tiếp thị tồn tại**.
Ngưỡng «≥ 3 chiến dịch chạy trọn» đếm từ 0.

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
