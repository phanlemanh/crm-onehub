# Phân tích 20 cặp hiệu chỉnh (round 3) — bản chấm thử của máy

Đây là chấm THỬ của phiên điều phối để tìm quy luật lỗi trước khi chủ kho chấm. Nó KHÔNG thay
cột «Chủ kho» trong `hieu-chinh-judge.md`; cột đó chỉ chủ kho điền.

Ba ý: (1) nói kết quả, không nói việc làm · (2) giữ ý người viết · (3) đúng ngôn ngữ đa số.
Cộng hai luật từ điển: Mục tiêu viết bằng chữ, con số nằm ở KR (`CONTEXT.md`); KR phải đo được.

| # | Máy chấm | Judge | Lý do ngắn |
| --- | --- | --- | --- |
| 1 | Không đạt | 1 | KR mới mơ hồ («đạt kết quả tốt»), mất con số 50 |
| 2 | Không đạt | 1 | Con số 20 tỷ nằm trong tên Mục tiêu; «bứt phá quy mô» là ý thêm |
| 3 | Đạt | 1 | Kết quả, giữ ý |
| 4 | Đạt (yếu) | 1 | Vẫn hơi là việc làm; chấp nhận như mốc |
| 5 | Đạt (yếu) | 1 | Giữ MRR, nhưng «được tin cậy» là ý thêm |
| 6 | Đạt | 1 | Kết quả, giữ 20 |
| 7 | Không đạt | 1 | Lệch ý: công ty «trở thành đối tác … hàng đầu» — không phải ý NPS |
| 8 | Đạt | 1 | Giữ 30→45 |
| 9 | Đạt (yếu) | 1 | Kết quả nhưng không có số đo |
| 10 | Không đạt | 0 | Con số 8% trong tên Mục tiêu; «kiểm soát dòng tiền» là việc làm thêm |
| 11 | Không đạt | 0 | «Xây dựng pipeline» là việc làm; gốc tiếng Anh |
| 12 | Đạt | 1 | Kết quả rõ, giữ ý |
| 13 | Đạt | 1 | Đo được, giữ 50 |
| 14 | Không đạt | 1 | Con số 20 tỷ trong tên Mục tiêu |
| 15 | Đạt (yếu) | 1 | «Được tin dùng» là ý thêm |
| 16 | Đạt | 1 | Giữ 20, có mốc thời gian |
| 17 | Đạt | 1 | Giữ ý NPS = hài lòng |
| 18 | Đạt | 1 | Giữ 30→45 |
| 19 | Không đạt | 1 | KR mơ hồ («đạt kết quả tốt») |
| 20 | Không đạt | 0 | Con số 8% trong tên Mục tiêu |

Khớp máy ↔ judge: 15/20 = 75 % (dưới 85 %). Năm chỗ lệch đều là judge cho 1 khi máy chấm
Không đạt: #1, #2, #7, #14, #19.

## Ba quy luật lỗi

- **A · Con số trong tên Mục tiêu** (#2, #10, #14, #20): chỉ dẫn đợt sửa 3 bảo model «giữ con số
  người viết» — đúng cho KR, sai cho tên Mục tiêu (từ điển: con số nằm ở KR).
- **B · KR viết lại không đo được** (#1, #19): «đạt kết quả tốt» không có số, không có đơn vị.
- **C · Ý thêm** (#5, #7, #15): «hàng đầu», «được tin cậy», «trở thành đối tác» — dữ liệu không nói.

Judge chấm 1 cho cả A, B, C nên tiêu chí judge chưa mang hai luật từ điển; đó là chỗ sửa để
chấm của người và judge khớp nhau.

## Sửa gốc và chạy thử từng ca (29/09, trước round 4)

Sửa ở ba nơi, cùng một định nghĩa ba ý: `instructions.md` (model), `GOP_Y_EVAL.tieuChi` (judge),
đầu bảng `hieu-chinh.mjs` (người chấm). Vẫn ba ý, không thêm ý thứ tư.

- Tên Mục tiêu: viết bằng chữ, không số, không «chỉ số + hướng», không mở bằng động từ việc làm,
  không khẩu hiệu; mở câu bằng thứ thay đổi. Số ở lại KR. Bỏ luật «giữ số trong tên Mục tiêu» của
  commit 46310617.
- Tên KR: gọi tên thứ được đo, không kết bằng «đạt kết quả tốt»; đổi thứ đo thì bỏ số cũ và hỏi
  `khong-do-duoc`.
- Ý 2 thu hẹp về «lời tự khen, khẩu hiệu không đo được»; diễn giải cùng ý không tính là thêm ý
  (judge từng cho 0 «Đối tác hài lòng và gắn kết hơn» chỉ vì «gắn kết»).

Chạy thử từng ca bằng `eval-gop-y.mjs --ca` (không ghi tệp hiệu chỉnh), mỗi ca một lượt model:

| Lượt | Ca | Câu viết lại | Judge | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | gy-06 | «Hợp đồng mới đưa doanh thu lên tầm mới» | 1 | chép nguyên ví dụ trong chỉ dẫn → bỏ ví dụ |
| 2 | gy-06 | «Tăng trưởng doanh thu hợp đồng mới» | 0 | chỉ số + hướng |
| 2 | gy-02 | «Tỷ lệ đối tác mới được kết nối và hỗ trợ trong tháng đầu» + hỏi start/target | 1 | |
| 3 | gy-06 | «Mở rộng quy mô kinh doanh và khẳng định vị thế trên thị trường» | 0 | khẩu hiệu |
| 3 | gy-18 | «Kiểm soát tốt công nợ quá hạn» | 0 | động từ + «tốt» |
| 3 | gy-11 | «Đối tác hài lòng và gắn bó hơn với dịch vụ» | 0 | judge siết «gắn bó» → thu hẹp ý 2 |
| 4 | gy-06 | «Đạt cột mốc doanh thu hợp đồng mới theo chỉ tiêu năm» | 1 | |
| 4 | gy-14 | «Số nhân sự kinh doanh nắm vững tính năng mới sau đào tạo» | 1 | |
| 5 | gy-11 | «Đối tác hài lòng và gắn kết hơn» | 1 | |
| 5 | gy-18 | «Thu hồi công nợ quá hạn lành mạnh» | 0 | vẫn động từ → thêm «mở câu bằng thứ thay đổi» |
| 6 | gy-18 | «Công nợ quá hạn được đưa về mức an toàn» | 1 | |
| 6 | gy-06 | «Doanh thu hoàn thành chỉ tiêu năm» | 1 | |

Tiền chạy thử: khoảng 0,25 USD (ngoài trần 2 USD của một round). Bản 20 cặp để chủ kho chấm là
bản round 4 sinh lại; bản round 3 (c92fcf92) chỉ còn giá trị đối chiếu.
