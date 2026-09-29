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
