# Bằng chứng eval soạn OKR — 2026-10-20T14:17:12.028Z

Lần chạy: `apps/agent-okr/.eve/evals/2026-10-20T14-17-11` · mã thoát eve eval: 1 · 8 đạt · 10 hỏng · 0 dưới ngưỡng · 0 bỏ qua / 18

Phân loại chỗ hỏng: 11 chốt mã hỏng · 0 judge hỏng (không chấm được sau 3 lần thử, không tính là trượt) · 0 judge chấm dưới ngưỡng

Mã thoát theo hợp đồng (AC-13 / E22): mọi chốt mã đạt ở mọi ca; bản có gói thắng judge mù ≥ 70 % số cặp, tính cả khi mọi cặp không chấm được đều thua; p50 ≤ 12 s, p90 ≤ 20 s mỗi lượt; ≤ 0.25 USD mỗi cuộc. Sáu tiêu chí judge của từng bản nháp là chẩn đoán: in ra, không đổi mã thoát. 15 cặp A/B là cỡ mẫu của thước (`TDX_SO_CAP_AB`), không phải ngưỡng hợp đồng.

| Eval | Kết quả | Ghi chú |
|---|---|---|
| okr-soan/soan-boi-canh/0000 | failed | chốt mã hỏng: loi: The operation was aborted due to timeout |
| okr-soan/soan-boi-canh/0001 | failed | chốt mã hỏng: loi: The operation was aborted due to timeout |
| okr-soan/soan-boi-canh/0002 | failed | chốt mã hỏng: loi: The operation was aborted due to timeout |
| okr-soan/soan-do-tre/0000 | passed |  |
| okr-soan/soan-do-tre/0001 | failed | chốt mã hỏng: loi: The operation was aborted due to timeout |
| okr-soan/soan-do-tre/0002 | passed |  |
| okr-soan/soan-do-tre/0003 | passed |  |
| okr-soan/soan-do-tre/0004 | passed |  |
| okr-soan/soan-do-tre/0005 | passed |  |
| okr-soan/soan-do-tre/0006 | passed |  |
| okr-soan/soan-do-tre/0007 | passed |  |
| okr-soan/soan-do-tre/0008 | passed |  |
| okr-soan/soan-do-tre/0009 | failed | chốt mã hỏng: satisfies(p50 <= 12000 ms); chốt mã hỏng: satisfies(p90 <= 20000 ms) |
| okr-soan/soan/0000 | failed | chốt mã hỏng: satisfies(da nop ban nhap) |
| okr-soan/soan/0001 | failed | chốt mã hỏng: satisfies(da nop ban nhap) |
| okr-soan/soan/0002 | failed | chốt mã hỏng: satisfies(da nop ban nhap) |
| okr-soan/soan/0003 | failed | chốt mã hỏng: satisfies(da nop ban nhap) |
| okr-soan/soan/0004 | failed | chốt mã hỏng: satisfies(da nop ban nhap) |

## Bảng số

| Số đo | Giá trị | Ngưỡng |
|---|---|---|
| p50 mỗi lượt (ms) | 92241 | ≤ 12000 |
| p90 mỗi lượt (ms) | 105503 | ≤ 20000 |
| chi phí lớn nhất mỗi cuộc (USD) | 0.0031 | ≤ 0.25 |
| p50 / p90 lượt hỏi–đáp, không nộp bản nháp (ms) | 92241 / 105503 (40 lượt) | — |
| p50 / p90 lượt nộp bản nháp (ms) | — / — (0 lượt) | — |
| tỷ lệ bản có gói thắng judge mù, trên cặp chấm được | — | — |
| tỷ lệ bản có gói thắng judge mù, xấu nhất (cặp không chấm được tính là thua) | 0 % (0/1) | ≥ 70 % |
| số cặp A/B judge mù (đã chạy / chấm được) | 1 / 0 | cỡ mẫu 15 (`TDX_SO_CAP_AB`, không phải ngưỡng; ước 0.07 USD/cặp) |
| ca judge không chấm được (cặp A/B) | onehub#v1 | — |
| lời gọi judge: tổng / phải thử lại / hỏng sau 3 lần | 1 / 0 / 0 | hỏng 0 |
| lần thử judge: tổng / nhiều nhất một lời gọi | 1 / 1 | ≤ 3 |
| tổng chi phí tác nhân của lượt đo (USD, AiChiPhi: soạn + A/B + độ trễ; chưa gồm judge) | 0.0264 | trần 2 |

## Sáu tiêu chí của từng bản nháp (chẩn đoán, không đổi mã thoát)

Ngưỡng hiển thị 0.7; «—» là judge không chấm được. Tiêu chí: tc1 căn chỉnh với Mục tiêu cấp trên; tc2 khởi điểm mỗi KR là số đo gần nhất của đúng chỉ số đó, cùng đơn vị đo — từ lời người, số chốt kỳ trước, số CRM, số hiện tại của KR cấp trên cùng chỉ số, hồ sơ công ty hay trang chiến lược; để trống khi không nguồn nào đo đúng chỉ số đó; không bao giờ là một số đích; tc3 KR đo kết quả, không đo việc; tc4 có đối trọng; tc5 không số đích bịa, đích để trống; tc6 phù hợp đơn vị.

| Ca | tc1 | tc2 | tc3 | tc4 | tc5 | tc6 |
|---|---|---|---|---|---|---|

Dưới ngưỡng: không có.

## Lượt chậm hơn ngưỡng p90

| Cuộc | Ca | Lượt | ms | Số bước | Mô hình (ms) | Công cụ (ms) | Còn lại (ms) |
|---|---|---|---|---|---|---|---|
| 1 | onehub | 1 | 36277 | 1 | 36126 | 0 | 151 |
| 1 | onehub | 2 | 97606 | 0 | 0 | 0 | 97606 |
| 1 | onehub | 3 | 97514 | 0 | 0 | 0 | 97514 |
| 1 | onehub | 4 | 47611 | 1 | 47395 | 0 | 216 |
| 2 | bp-kinh-doanh | 1 | 61758 | 1 | 61545 | 0 | 213 |
| 2 | bp-kinh-doanh | 2 | 127597 | 0 | 0 | 0 | 127597 |
| 2 | bp-kinh-doanh | 3 | 99546 | 0 | 0 | 0 | 99546 |
| 2 | bp-kinh-doanh | 4 | 91679 | 0 | 0 | 0 | 91679 |
| 3 | pb-kd-bac | 1 | 45284 | 1 | 44976 | 0 | 308 |
| 3 | pb-kd-bac | 2 | 99256 | 0 | 0 | 0 | 99256 |
| 3 | pb-kd-bac | 3 | 101252 | 0 | 0 | 0 | 101252 |
| 3 | pb-kd-bac | 4 | 111367 | 0 | 0 | 0 | 111367 |
| 4 | pb-kho-van | 1 | 34093 | 1 | 33916 | 0 | 177 |
| 4 | pb-kho-van | 2 | 108743 | 0 | 0 | 0 | 108743 |
| 4 | pb-kho-van | 3 | 90331 | 0 | 0 | 0 | 90331 |
| 4 | pb-kho-van | 4 | 98038 | 0 | 0 | 0 | 98038 |
| 5 | pb-tai-chinh | 1 | 30654 | 1 | 30385 | 0 | 269 |
| 5 | pb-tai-chinh | 2 | 105403 | 0 | 0 | 0 | 105403 |
| 5 | pb-tai-chinh | 3 | 106398 | 0 | 0 | 0 | 106398 |
| 5 | pb-tai-chinh | 4 | 100267 | 0 | 0 | 0 | 100267 |
| 6 | onehub | 2 | 94075 | 0 | 0 | 0 | 94075 |
| 6 | onehub | 3 | 90166 | 0 | 0 | 0 | 90166 |
| 6 | onehub | 4 | 25184 | 1 | 24973 | 0 | 211 |
| 7 | bp-kinh-doanh | 1 | 43468 | 1 | 43206 | 0 | 262 |
| 7 | bp-kinh-doanh | 2 | 102735 | 0 | 0 | 0 | 102735 |
| 7 | bp-kinh-doanh | 3 | 94479 | 0 | 0 | 0 | 94479 |
| 7 | bp-kinh-doanh | 4 | 92803 | 0 | 0 | 0 | 92803 |
| 8 | pb-kd-bac | 1 | 25431 | 1 | 25159 | 0 | 272 |
| 8 | pb-kd-bac | 2 | 96006 | 0 | 0 | 0 | 96006 |
| 8 | pb-kd-bac | 3 | 90356 | 0 | 0 | 0 | 90356 |
| 8 | pb-kd-bac | 4 | 93234 | 0 | 0 | 0 | 93234 |
| 9 | pb-kho-van | 1 | 21426 | 1 | 21169 | 0 | 257 |
| 9 | pb-kho-van | 2 | 85564 | 0 | 0 | 0 | 85564 |
| 9 | pb-kho-van | 3 | 83540 | 0 | 0 | 0 | 83540 |
| 9 | pb-kho-van | 4 | 95024 | 0 | 0 | 0 | 95024 |
| 10 | pb-tai-chinh | 1 | 33515 | 1 | 33354 | 0 | 161 |
| 10 | pb-tai-chinh | 2 | 84525 | 0 | 0 | 0 | 84525 |
| 10 | pb-tai-chinh | 3 | 91505 | 0 | 0 | 0 | 91505 |
| 10 | pb-tai-chinh | 4 | 100101 | 0 | 0 | 0 | 100101 |

## Soạn theo đơn vị

| Ca | Cuộc | USD | Dòng bị loại |
|---|---|---|---|

## Chấm của chủ kho (E24)

Mỗi cặp dưới đây là hai bản nháp cho cùng đơn vị: một bản có gói bối cảnh, một bản không. Chọn bản tốt hơn theo sáu tiêu chí (căn chỉnh với Mục tiêu cấp trên; khởi điểm mỗi KR là số đo gần nhất của đúng chỉ số đó, cùng đơn vị đo — từ lời người, số chốt kỳ trước, số CRM, số hiện tại của KR cấp trên cùng chỉ số, hồ sơ công ty hay trang chiến lược; để trống khi không nguồn nào đo đúng chỉ số đó; không bao giờ là một số đích; KR đo kết quả, không đo việc; có đối trọng; không số đích bịa, đích để trống; phù hợp đơn vị). Phía có gói và lựa chọn của judge nằm ở `evidence/eval-soan-khoa.json` — mở sau khi chấm.

### Cặp 1 — onehub#v1

**A**

```
Mục tiêu (cam-ket): Các đối tác bán lẻ lớn ở cả hai miền tiếp tục chọn Hải Đăng làm đơn vị vận chuyển hàng lạnh đầu tiên — vì sao lúc này: Tỷ lệ đối tác gia hạn mới 87% và CRM quý này mới ghi 2 thỏa thuận chốt được. — Chưa có chu kỳ đóng gần nhất; đây là công việc cốt lõi của đơn vị theo hướng chiến lược bán lẻ và chuỗi cửa hàng.
  - KR: Tỷ lệ đối tác lớn gia hạn hợp đồng vào kỳ tiếp theo (tang-toi, %, khởi điểm 87) — Giữ chân đối tác lớn là ưu tiên quý này; con số nền 87% lấy từ hồ sơ công ty, đo cùng đơn vị.
  - KR: Số thỏa thuận với đối tác lớn được chốt trong quý (tang-toi, thỏa thuận, khởi điểm 2) — Số nền lấy từ CRM quý này đã ghi 2 thỏa thuận chốt được, đo cùng đơn vị.
  - KR: Tỷ lệ hao hụt hàng trong kho lạnh (giam-xuong, %, khởi điểm 0.8) — Giữ đối tác không được làm bằng cách chạy nhanh mà bỏ phí hàng; con số nền 0,8% lấy từ hồ sơ công ty, đo cùng đơn vị.
Mục tiêu (cam-ket): Giao đúng hẹn thành nhịp đo trên từng chuyến, giữ nguyên người và ngân sách quý trước — vì sao lúc này: Tỷ lệ giao đúng hẹn đang là 93,5% so với đích năm 96%. — Đúng hẹn là lời hứa số một và là đích năm của công ty; giới hạn nguồn lực buộc nhịp này đến từ cách vận hành, không từ thêm người.
  - KR: Tỷ lệ chuyến giao đúng hẹn trên tổng chuyến (tang-toi, %, khởi điểm 93.5) — Lời hứa số một của công ty; con số nền 93,5% lấy từ hồ sơ công ty, đo cùng đơn vị.
  - KR: Tỷ lệ chuyến hàng lạnh giữ đúng nhiệt từ kho tới tay người nhận (tang-toi, %) — Giao đúng hẹn không được đổi bằng chất lượng chuỗi lạnh; KR này giữ chất lượng cùng lúc với KR tốc độ.
  - KR: Tỷ lệ chuyến rỗng trên tổng chuyến (giam-xuong, %) — Không thêm người và ngân sách giữ nguyên, nên phần tăng đúng hẹn phải đến từ xếp tuyến tốt và giảm chuyến rỗng.
Mục tiêu (tham-vong): Chuỗi lạnh liền mạch đo được trên từng chuyến, từ kho tới xe tới tay người nhận — vì sao lúc này: Chưa có số xe có cảm biến và cổng đối tác bản 2 chưa ra mắt theo mốc quý 1. — Dữ liệu nhiệt theo chuyến là nền cho cả đúng hẹn lẫn niềm tin của đối tác lớn, theo hướng chuỗi lạnh liền mạch của công ty.
  - KR: Tỷ lệ xe lạnh có cảm biến nhiệt hoạt động (tang-toi, %) — Dữ liệu chưa cho số xe cảm biến hiện có nên để trống khởi điểm; mốc quý 1 của công ty là trên 40% xe.
  - KR: Tỷ lệ chuyến mà đối tác xem được nhiệt độ theo chuyến trên cổng đối tác (tang-toi, %) — Cảm biến chỉ có giá trị khi đối tác tin được dữ liệu; kết quả đo là số chuyến đối tác thực sự xem được nhiệt độ.
  - KR: Tỷ lệ cảm biến báo số liệu sai hoặc mất tín hiệu (giu-duoi, %) — Dữ liệu nhiệt sai còn nguy hơn không có dữ liệu, nên chất lượng thiết bị phải giữ thấp về mặt lỗi cùng lúc với mở rộng.
```

**B**

```
Mục tiêu (cam-ket): Người dùng dùng OneHub đều đặn và ngày càng nhiều hơn — vì sao lúc này: Đây là chu kỳ đầu của đơn vị, chưa có số nền nên cần chốt nhịp dùng thật trước đã. — Việc dùng thật hằng tuần là nền của mọi kết quả khác trong quý.
  - KR: Số người dùng hoạt động mỗi tuần (tang-toi, người/tuần) — Đo trực tiếp việc nền tảng được dùng thật, không chỉ được mở tài khoản.
  - KR: Tỷ lệ người dùng mới quay lại dùng tuần thứ hai (phan-tram, %) — Giá trị thật thể hiện ở việc người dùng ở lại, không ở lần dùng đầu.
  - KR: Tỷ lệ người dùng đánh giá trải nghiệm tốt trong khảo sát hằng tháng (giu-tren, %) — Chống cân bằng: chất lượng trải nghiệm không bị hy sinh cho tăng trưởng.
Mục tiêu (cam-ket): Nền tảng ổn định, sự cố ít đi và được xử lý nhanh — vì sao lúc này: Tăng tốc dễ làm hỏng ổn định; quý đầu cần giữ niềm tin bằng nền tảng chạy êm. — Ổn định là điều kiện để tăng trưởng quý này không phá vỡ niềm tin.
  - KR: Số sự cố nghiêm trọng ảnh hưởng người dùng mỗi tháng (giam-xuong, sự cố/tháng) — Ít sự cố hơn nghĩa là người dùng làm việc không bị gián đoạn.
  - KR: Tỷ lệ thời gian nền tảng chạy bình thường trong tháng (giu-tren, %) — Nền tảng chạy êm là điều kiện để người dùng tin và tiếp tục dùng.
  - KR: Tỷ lệ yêu cầu hỗ trợ được hồi đáp trong một ngày làm việc (tang-toi, %) — Người dùng được trả lời nhanh thì không bỏ dở công việc của mình trên nền tảng.
Mục tiêu (hoc-tap): Học được hướng đi nào đáng đặt cho quý sau — vì sao lúc này: Chưa có trang chiến lược và chưa có chu kỳ trước để rút bài học, nên cần một mục tiêu học trước khi cam kết hướng mới. — Quyết định hướng quý sau cần căn cứ từ dữ liệu dùng thật, không từ phỏng đoán.
  - KR: Số giả thiết về nhu cầu người dùng được kiểm chứng bằng dữ liệu thật (tang-toi, giả thiết) — Đếm số giả thiết đã biết đúng hay sai giúp quyết định dựa trên bằng chứng.
  - KR: Tỷ lệ người dùng dùng thử tính năng mới rồi quay lại dùng lần hai (phan-tram, %) — Quay lại dùng lần hai là dấu hiệu tính năng thật sự có giá trị.
```

| Cặp | Judge chọn | Người chọn | Khớp |
|---|---|---|---|
| 1 | (trong eval-soan-khoa.json) |  |  |
