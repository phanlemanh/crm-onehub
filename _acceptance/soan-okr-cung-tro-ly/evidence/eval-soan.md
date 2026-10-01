# Bằng chứng eval soạn OKR — 2026-10-01T04:41:32.247Z

Lần chạy: `apps/agent-okr/.eve/evals/2026-10-01T04-41-32` · mã thoát eve eval: 1 · 20 đạt · 10 hỏng · 0 dưới ngưỡng · 0 bỏ qua / 30

Phân loại chỗ hỏng: 6 chốt mã hỏng · 4 judge hỏng (không chấm được sau 3 lần thử, không tính là trượt) · 0 judge chấm dưới ngưỡng

Mã thoát theo hợp đồng (AC-13 / E22): mọi chốt mã đạt ở mọi ca; bản có gói thắng judge mù ≥ 70 % số cặp, tính cả khi mọi cặp không chấm được đều thua; p50 ≤ 12 s, p90 ≤ 20 s mỗi lượt; ≤ 0.25 USD mỗi cuộc. Sáu tiêu chí judge của từng bản nháp là chẩn đoán: in ra, không đổi mã thoát. 15 cặp A/B là cỡ mẫu của thước (`TDX_SO_CAP_AB`), không phải ngưỡng hợp đồng.

| Eval | Kết quả | Ghi chú |
|---|---|---|
| okr-soan/soan-boi-canh/0000 | passed |  |
| okr-soan/soan-boi-canh/0001 | passed |  |
| okr-soan/soan-boi-canh/0002 | passed |  |
| okr-soan/soan-boi-canh/0003 | failed | judge hỏng: boi-canh:pb-kho-van#v1 (No tool calls in response) |
| okr-soan/soan-boi-canh/0004 | passed |  |
| okr-soan/soan-boi-canh/0005 | passed |  |
| okr-soan/soan-boi-canh/0006 | passed |  |
| okr-soan/soan-boi-canh/0007 | failed | judge hỏng: boi-canh:pb-kd-bac#v2 (No tool calls in response) |
| okr-soan/soan-boi-canh/0008 | failed | judge hỏng: boi-canh:pb-kho-van#v2 (No tool calls in response) |
| okr-soan/soan-boi-canh/0009 | passed |  |
| okr-soan/soan-boi-canh/0010 | passed |  |
| okr-soan/soan-boi-canh/0011 | passed |  |
| okr-soan/soan-boi-canh/0012 | failed | judge hỏng: boi-canh:pb-kd-bac#v3 (No tool calls in response) |
| okr-soan/soan-boi-canh/0013 | passed |  |
| okr-soan/soan-boi-canh/0014 | passed |  |
| okr-soan/soan-do-tre/0000 | passed |  |
| okr-soan/soan-do-tre/0001 | passed |  |
| okr-soan/soan-do-tre/0002 | passed |  |
| okr-soan/soan-do-tre/0003 | passed |  |
| okr-soan/soan-do-tre/0004 | passed |  |
| okr-soan/soan-do-tre/0005 | passed |  |
| okr-soan/soan-do-tre/0006 | passed |  |
| okr-soan/soan-do-tre/0007 | passed |  |
| okr-soan/soan-do-tre/0008 | passed |  |
| okr-soan/soan-do-tre/0009 | failed | chốt mã hỏng: satisfies(p90 <= 20000 ms) |
| okr-soan/soan/0000 | failed | chốt mã hỏng: satisfies(nop lai sau khi sua) |
| okr-soan/soan/0001 | failed | chốt mã hỏng: satisfies(nop lai sau khi sua) |
| okr-soan/soan/0002 | failed | chốt mã hỏng: satisfies(nop lai sau khi sua) |
| okr-soan/soan/0003 | failed | chốt mã hỏng: satisfies(nop lai sau khi sua) |
| okr-soan/soan/0004 | failed | chốt mã hỏng: satisfies(nop lai sau khi sua) |

## Bảng số

| Số đo | Giá trị | Ngưỡng |
|---|---|---|
| p50 mỗi lượt (ms) | 10046 | ≤ 12000 |
| p90 mỗi lượt (ms) | 20307 | ≤ 20000 |
| chi phí lớn nhất mỗi cuộc (USD) | 0.0400 | ≤ 0.25 |
| p50 / p90 lượt hỏi–đáp, không nộp bản nháp (ms) | 5694 / 20336 (11 lượt) | — |
| p50 / p90 lượt nộp bản nháp (ms) | 10538 / 19166 (29 lượt) | — |
| tỷ lệ bản có gói thắng judge mù, trên cặp chấm được | 100 % (11/11; khoảng tin cậy 95 % 74–100 %) | — |
| tỷ lệ bản có gói thắng judge mù, xấu nhất (cặp không chấm được tính là thua) | 73 % (11/15) | ≥ 70 % |
| số cặp A/B judge mù (đã chạy / chấm được) | 15 / 11 | cỡ mẫu 15 (`TDX_SO_CAP_AB`, không phải ngưỡng; ước 0.07 USD/cặp) |
| ca judge không chấm được (cặp A/B) | pb-kho-van#v1, pb-kd-bac#v2, pb-kho-van#v2, pb-kd-bac#v3 | — |
| lời gọi judge: tổng / phải thử lại / hỏng sau 3 lần | 15 / 8 / 4 | hỏng 0 |
| lần thử judge: tổng / nhiều nhất một lời gọi | 30 / 3 | ≤ 3 |
| tổng chi phí tác nhân của lượt đo (USD, AiChiPhi: soạn + A/B + độ trễ; chưa gồm judge) | 1.0625 | trần 2 |

## Sáu tiêu chí của từng bản nháp (chẩn đoán, không đổi mã thoát)

Ngưỡng hiển thị 0.7; «—» là judge không chấm được. Tiêu chí: tc1 căn chỉnh với Mục tiêu cấp trên; tc2 khởi điểm mỗi KR là số đo gần nhất của đúng chỉ số đó, cùng đơn vị đo — từ lời người, số chốt kỳ trước, số CRM, số hiện tại của KR cấp trên cùng chỉ số, hồ sơ công ty hay trang chiến lược; để trống khi không nguồn nào đo đúng chỉ số đó; không bao giờ là một số đích; tc3 KR đo kết quả, không đo việc; tc4 có đối trọng; tc5 không số đích bịa, đích để trống; tc6 phù hợp đơn vị.

| Ca | tc1 | tc2 | tc3 | tc4 | tc5 | tc6 |
|---|---|---|---|---|---|---|

Dưới ngưỡng: không có.

## Lượt chậm hơn ngưỡng p90

| Cuộc | Ca | Lượt | ms | Số bước | Mô hình (ms) | Công cụ (ms) | Còn lại (ms) |
|---|---|---|---|---|---|---|---|
| 3 | pb-kd-bac | 1 | 20336 | 1 | 19901 | 0 | 435 |
| 3 | pb-kd-bac | 4 | 35157 | 2 | 34623 | 45 | 489 |
| 4 | pb-kho-van | 1 | 27837 | 1 | 27300 | 0 | 537 |
| 5 | pb-tai-chinh | 2 | 26098 | 2 | 25582 | 142 | 374 |
| 8 | pb-kd-bac | 4 | 20304 | 3 | 19714 | 187 | 403 |

## Soạn theo đơn vị

| Ca | Cuộc | USD | Dòng bị loại |
|---|---|---|---|

## Chấm của chủ kho (E24)

Mỗi cặp dưới đây là hai bản nháp cho cùng đơn vị: một bản có gói bối cảnh, một bản không. Chọn bản tốt hơn theo sáu tiêu chí (căn chỉnh với Mục tiêu cấp trên; khởi điểm mỗi KR là số đo gần nhất của đúng chỉ số đó, cùng đơn vị đo — từ lời người, số chốt kỳ trước, số CRM, số hiện tại của KR cấp trên cùng chỉ số, hồ sơ công ty hay trang chiến lược; để trống khi không nguồn nào đo đúng chỉ số đó; không bao giờ là một số đích; KR đo kết quả, không đo việc; có đối trọng; không số đích bịa, đích để trống; phù hợp đơn vị). Phía có gói và lựa chọn của judge nằm ở `evidence/eval-soan-khoa.json` — mở sau khi chấm.

### Cặp 1 — pb-tai-chinh#v2

**A**

```
Mục tiêu (cam-ket): Duy trì dòng tiền lành mạnh và cung cấp số liệu kế toán đúng hạn — vì sao lúc này: Chu kỳ trước công nợ quá hạn đã về 12% nhưng cần kiểm soát chặt chẽ để phục vụ mở rộng vận hành. — Chức năng cốt lõi của phòng Tài chính nhằm giữ vững an toàn ngân sách cho toàn công ty.
  - KR: Tỷ lệ công nợ quá hạn (giam-xuong, %, khởi điểm 12) — Đảm bảo dòng tiền thông suốt để phục vụ hoạt động vận tải liên tục.
  - KR: Số ngày chốt sổ kế toán và báo cáo quản trị sau khi hết tháng (giu-duoi, ngày, khởi điểm 5) — Cung cấp dữ liệu tài chính kịp thời cho các quyết định điều hành.
  - KR: Tỷ lệ biên bản đối soát công nợ hoàn thành đúng hạn với đối tác (giu-tren, %) — Đối trọng giữ mối quan hệ và minh bạch số liệu với đối tác khi siết tiến độ thu tiền.
Mục tiêu (tham-vong): Tối ưu chi phí mỗi chuyến xe và kiểm soát chặt định mức vận hành — vì sao lúc này: Cần kéo giảm chi phí trên mỗi đơn đồng bộ với chỉ đạo tối ưu vận hành của toàn công ty. — Đóng góp trực tiếp vào mục tiêu vận hành gọn của công ty trong khi vẫn giữ nguyên đội xe hiện có.
  - Căn chỉnh tới: Chi phí vận tải trên mỗi đơn giảm từ 42 xuống 36 nghìn đồng
  - KR: Chi phí vận tải bình quân trên mỗi đơn (giam-xuong, nghìn đồng, khởi điểm 40.3) — Trực tiếp tối ưu hóa hiệu quả sử dụng nguồn lực vận tải theo định hướng vận hành gọn.
  - KR: Tỷ lệ chênh lệch chi phí nhiên liệu thực tế so với định mức tuyến (giu-duoi, %) — Giữ kỷ luật chi phí trên đội xe hiện có mà không làm phát sinh lãng phí.
  - KR: Tỷ lệ đơn giao đúng hẹn của toàn mạng lưới (giu-tren, %, khởi điểm 92.4) — Chỉ số đối trọng bảo vệ chất lượng dịch vụ không bị ảnh hưởng khi siết chặt chi phí chuyến.
```

**B**

```
Mục tiêu (cam-ket): Tối ưu hóa chi phí vận hành trên mỗi chuyến xe nhưng vẫn bảo đảm chất lượng dịch vụ giao hàng — vì sao lúc này: Cần tiết giảm chi phí trên mỗi chuyến trong điều kiện quy mô đội xe được giữ nguyên. — Giúp doanh nghiệp nâng cao hiệu quả tài chính từ hoạt động vận chuyển mà vẫn giữ vững uy tín giao nhận.
  - KR: Chi phí bình quân trên mỗi chuyến vận chuyển (giam-xuong, nghìn đồng/chuyến) — Đo lường trực tiếp hiệu quả tiết giảm chi phí trên từng chuyến đi theo trọng tâm quý.
  - KR: Tỷ lệ chuyến hàng được bàn giao đúng giờ hẹn (giu-tren, %) — Đóng vai trò đối trọng để việc thắt chặt chi phí không làm suy giảm chất lượng dịch vụ vận chuyển.
  - KR: Tỷ lệ hàng hoá bàn giao đạt chuẩn nguyên vẹn không hư hỏng (giu-tren, %) — Bảo vệ chất lượng hàng hóa khi tối ưu hóa việc phân bổ và sử dụng phương tiện.
Mục tiêu (tham-vong): Khai thác tối đa hiệu quả phục vụ của đội xe hiện có — vì sao lúc này: Đơn vị có ràng buộc giữ nguyên quy mô đội xe trong giai đoạn này. — Tạo tiền đề đáp ứng nhu cầu luân chuyển hàng hóa mà không gia tăng nguồn lực xe cộ.
  - KR: Số chuyến hoàn thành bình quân trên mỗi xe (tang-toi, chuyến/xe/tháng) — Nâng cao năng lực chuyên chở của đội xe hiện hữu mà không cần phát sinh phương tiện mới.
  - KR: Tỷ lệ phương tiện duy trì tình trạng vận hành ổn định không phát sinh sự cố kỹ thuật (giu-tren, %) — Đảm bảo an toàn kỹ thuật và độ sẵn sàng của đội xe, tránh áp lực tăng tải gây hao mòn phương tiện.
```

### Cặp 2 — onehub#v1

**A**

```
Mục tiêu (cam-ket): Nâng cao độ tin cậy vận hành và cam kết giao đúng hẹn — vì sao lúc này: Đúng hạn là ưu tiên hàng đầu để tạo sự an tâm tuyệt đối cho đối tác lớn mà không tăng biên chế. — Khẳng định lời hứa dịch vụ cốt lõi của Hải Đăng Logistics tới các đối tác.
  - KR: Tỷ lệ giao đúng hẹn toàn mạng lưới (tang-toi, %, khởi điểm 93.5) — Đo lường cam kết số một về dịch vụ vận chuyển mà không cần mở rộng đội ngũ.
  - KR: Tỷ lệ hao hụt hàng hóa qua hệ thống kho lạnh (giam-xuong, %, khởi điểm 0.8) — Giữ vai trò đối trọng chất lượng bảo quản trong quá trình vận hành giao nhận.
Mục tiêu (cam-ket): Củng cố mối quan hệ bền chặt và giữ chân các đối tác trọng điểm — vì sao lúc này: Giữ chân đối tác lớn giúp duy trì ổn định dòng hoạt động mà không phát sinh thêm chi phí tìm kiếm mới. — Bảo vệ nền tảng hợp tác hiện có trong phạm vi ngân sách không đổi.
  - KR: Tỷ lệ đối tác gia hạn hợp đồng dịch vụ (tang-toi, %, khởi điểm 87) — Đo lường sự gắn kết và lòng tin của đối tác hiện hữu với chất lượng dịch vụ.
  - KR: Số thỏa thuận hợp tác dài hạn được ký tiếp (tang-toi, thỏa thuận, khởi điểm 0) — Ghi nhận số lượng cam kết duy trì đồng hành từ hệ thống dữ liệu.
```

**B**

```
Mục tiêu (cam-ket): Gắn kết bền chặt và nâng cao sự hài lòng của các đối tác lớn — vì sao lúc này: Giữ chân đối tác lớn là ưu tiên hàng đầu để tạo nguồn lực ổn định cho các bước đi tiếp theo. — Bảo đảm sự ổn định và phát triển của tổ chức thông qua việc duy trì mối quan hệ hợp tác dài hạn với các đối tác trọng yếu.
  - KR: Tỷ lệ đối tác lớn tái ký hợp đồng hợp tác (tang-toi, %) — Đo lường mức độ gắn kết và niềm tin của các đối tác trọng điểm đối với OneHub.
  - KR: Tỷ lệ đối tác lớn phản hồi tích cực về chất lượng dịch vụ trong kỳ (giu-tren, %) — Đóng vai trò cân bằng chất lượng mối quan hệ và sự hài lòng dài hạn của đối tác.
Mục tiêu (cam-ket): Nâng cao độ chuẩn xác và tốc độ bàn giao cam kết với đối tác — vì sao lúc này: Cần thắt chặt kỷ luật thực thi và quy trình để luôn giao đúng hạn cam kết. — Đáp ứng kỳ vọng về tiến độ giúp nâng cao năng lực cạnh tranh và sự tín nhiệm của đơn vị.
  - KR: Tỷ lệ bàn giao dịch vụ và sản phẩm đúng hạn cam kết (tang-toi, %) — Đo lường năng lực thực thi và giữ uy tín cam kết với bên ngoài.
  - KR: Tỷ lệ yêu cầu chỉnh sửa do phát sinh lỗi kỹ thuật sau bàn giao (giu-duoi, %) — Cân bằng giữa tốc độ bàn giao và chất lượng thực tế, không đánh đổi độ chuẩn xác lấy tiến độ.
Mục tiêu (cam-ket): Tối ưu hóa năng lực vận hành nội bộ trong giới hạn nguồn lực hiện hữu — vì sao lúc này: Ràng buộc nguồn lực đòi hỏi phương thức phối hợp hiệu quả và kỷ luật chi tiêu nghiêm ngặt. — Đảm bảo hoàn thành các cam kết lớn mà không tăng số lượng nhân sự hay vượt trần ngân sách.
  - KR: Tỷ lệ quy trình nội bộ hoàn tất chu trình đúng thời hạn chuẩn (tang-toi, %) — Tăng hiệu suất làm việc của bộ máy hiện tại mà không phát sinh thêm nhu cầu tuyển dụng.
  - KR: Tỷ lệ phát sinh chi phí vận hành ngoài mức định biên ban đầu (giu-duoi, %) — Cân bằng kỷ luật tài chính, kiểm soát chặt chẽ ngân sách không vượt mức quý trước.
```

### Cặp 3 — pb-kd-bac#v3

**A**

```
Mục tiêu (cam-ket): Mở rộng tệp đối tác bán lẻ và chuỗi cửa hàng tại miền Bắc — vì sao lúc này: Quý trước đơn vị bị chậm tiến độ ký do gửi bảng giá muộn và cần đẩy mạnh phủ các chuỗi mới trong quý này. — Phát triển đối tác bán lẻ là chức năng cốt lõi của đơn vị và đóng góp vào mục tiêu bao phủ thị trường của cấp trên.
  - Căn chỉnh tới: Trở thành đối tác logistics được chọn đầu tiên ở hai miền
  - KR: Số hợp đồng bán lẻ và chuỗi cửa hàng ký mới (tang-toi, hợp đồng, khởi điểm 11) — Tăng nhanh độ phủ các chuỗi tại miền Bắc theo đúng trọng tâm chiến lược năm.
  - KR: Giá trị hợp đồng mới từ các chuỗi bán lẻ miền Bắc (tang-toi, tỷ đồng, khởi điểm 9.5) — Đảm bảo quy mô đóng góp vào chỉ tiêu doanh thu hợp đồng mới của cấp trên.
  - KR: Tỷ lệ hợp đồng bán lẻ mới có điều khoản sử dụng chuỗi lạnh liền mạch (giu-tren, %) — Định hướng đối tác sử dụng dịch vụ vận chuyển lạnh cốt lõi thay vì chỉ đi hàng khô.
Mục tiêu (tham-vong): Tạo đột phá ở mảng vận chuyển hàng lạnh miền Bắc — vì sao lúc này: Mảng hàng lạnh tại miền Bắc còn nhiều dư địa phát triển với kho lạnh Bắc Ninh sẵn có. — Tập trung phát triển phân khúc hàng lạnh còn yếu để đóng góp vào định hướng đối tác hàng lạnh của toàn công ty.
  - Căn chỉnh tới: Số đối tác hàng lạnh đang chạy tăng từ 12 lên 30
  - KR: Số đối tác hàng lạnh mới ký kết và bắt đầu chạy chuyến (tang-toi, đối tác) — Tạo đột phá ở mảng hàng lạnh vốn là mảng đơn vị còn yếu so với tiềm lực kho xe.
  - KR: Tỷ lệ đối tác mới ký tiếp tục phát sinh chuyến đều đặn sau 30 ngày (giu-tren, %) — Bảo đảm chất lượng hợp đồng ký mới và duy trì hợp tác bền vững.
  - KR: Tỷ lệ chi phí tiếp cận trên giá trị mỗi hợp đồng mới (giu-duoi, %) — Kiểm soát chi phí theo đúng ràng buộc không làm tăng ngân sách tiếp thị.
```

**B**

```
Mục tiêu (tham-vong): Mở rộng mạng lưới đối tác mới ở mảng còn yếu mà không gia tăng ngân sách tiếp thị — vì sao lúc này: Mảng này đang yếu cần ưu tiên phát triển ngay nhưng phải giữ kỷ luật ngân sách. — Tạo đột phá cho mảng còn yếu của đơn vị bằng nguồn lực tự thân.
  - KR: Số thoả thuận hợp tác mới được ký kết ở mảng trọng điểm (tang-toi, thoa-thuan) — Đo lường kết quả mở rộng mạng lưới đối tác tại phân khúc đơn vị đang yếu.
  - KR: Tỷ lệ đối tác mới phát sinh giao dịch đầu tiên sau khi ký kết (phan-tram, phan-tram) — Đảm bảo các thoả thuận ký kết thực sự đi vào hoạt động thực chất.
  - KR: Tổng chi phí marketing sử dụng cho việc kết nối đối tác mới (giu-duoi, dong) — Đối trọng giữ ngân sách marketing không vượt mức quy định trong quý.
Mục tiêu (cam-ket): Tối ưu hoá hiệu quả tiếp cận trực tiếp và gìn giữ chất lượng quan hệ đối tác — vì sao lúc này: Phương thức tiếp cận trực tiếp là giải pháp then chốt để mở đối tác mới khi ngân sách bị khoá chặt. — Giúp gia tăng năng lực chuyển đổi mà không phải phụ thuộc vào ngân sách quảng cáo.
  - KR: Tỷ lệ đối tác phản hồi tích cực sau các buổi trao đổi trực tiếp (tang-toi, phan-tram) — Đo lường sức hút và mức độ tiếp cận hiệu quả của đội ngũ kinh doanh.
  - KR: Tỷ lệ đối tác hiện hữu tiếp tục gia hạn đồng hành trong kỳ (giu-tren, phan-tram) — Đối trọng nhằm bảo đảm việc dồn sức tìm kiếm mới không làm suy giảm chất lượng chăm sóc đối tác cũ.
```

### Cặp 4 — pb-kd-bac#v2

**A**

```
Mục tiêu (cam-ket): Tối ưu hoá chi phí vận chuyển trên từng chuyến xe khu vực miền Bắc — vì sao lúc này: Cần tiết giảm chi phí chuyến ngay trong chu kỳ này trong bối cảnh giữ nguyên quy mô đội xe. — Tập trung giảm hao phí vận hành trên mỗi lượt vận chuyển đồng thời giữ vững chất lượng giao phát.
  - KR: Chi phí vận hành trung bình trên mỗi chuyến vận chuyển (giam-xuong, nghìn đồng) — Đo lường trực tiếp mức độ tối ưu ngân sách trên từng chuyến vận tải mà không tăng thêm phương tiện.
  - KR: Tỷ lệ đơn hàng giao thành công đúng thời gian đã hẹn (giu-tren, %) — Đảm bảo chất lượng chuyển phát không bị ảnh hưởng tiêu cực khi cắt giảm chi phí.
  - KR: Tỷ lệ kiện hàng được giao nguyên vẹn không phát sinh sự cố bồi hoàn (giu-tren, %) — Đối trọng giữ vững tiêu chuẩn bảo quản và độ an toàn dịch vụ trong suốt hành trình.
Mục tiêu (tham-vong): Nâng cao hiệu quả khai thác năng lực vận tải của đội xe hiện hữu — vì sao lúc này: Quy mô phương tiện cố định đòi hỏi phải tối ưu hệ số sử dụng xe để giải quyết bài toán chi phí. — Tối đa hoá công suất chuyên chở và tần suất vận hành của dàn xe sẵn có mà không phát sinh thêm phương tiện.
  - KR: Số chuyến hoàn thành trung bình mỗi xe trong tuần (tang-toi, chuyến) — Nâng cao hiệu suất điều phối và tính liên tục của từng phương tiện hiện có.
  - KR: Tỷ lệ lấp đầy thể tích vận chuyển bình quân mỗi lượt di chuyển (tang-toi, %) — Tối đa hoá giá trị chuyên chở trên từng lượt xe nhằm giảm lãng phí hành trình rỗng.
  - KR: Tỷ lệ phương tiện duy trì tình trạng kỹ thuật đạt chuẩn sẵn sàng vận hành (giu-tren, %) — Giữ gìn độ bền và tính sẵn sàng của phương tiện trong điều kiện tăng tải khai thác.
```

**B**

```
Mục tiêu (cam-ket): Mở rộng tệp đối tác bán lẻ và chuỗi cửa hàng tại miền Bắc — vì sao lúc này: Nhu cầu bán lẻ tại miền Bắc đang tăng và việc chuẩn hóa bảng giá theo tuyến giúp chốt hợp đồng nhanh hơn. — Thực hiện trọng tâm cốt lõi của phòng kinh doanh miền Bắc và đóng góp vào mục tiêu trở thành đối tác được chọn đầu tiên.
  - Căn chỉnh tới: Trở thành đối tác logistics được chọn đầu tiên ở hai miền
  - KR: Số hợp đồng bán lẻ mới ký kết (tang-toi, hợp đồng, khởi điểm 11) — Đo lường năng lực mở rộng đối tác bán lẻ tại thị trường miền Bắc theo đúng chức năng phòng ban.
  - KR: Giá trị hợp đồng mới ký kết (tang-toi, tỷ đồng, khởi điểm 9.5) — Đảm bảo quy mô doanh thu từ các hợp đồng ký mới đóng góp vào mục tiêu tăng trưởng chung.
  - KR: Tỷ lệ đối tác hiện hữu tái ký hợp đồng (giu-tren, %) — Giữ vững tệp đối tác hiện có nhằm bảo vệ nguồn doanh thu ổn định.
Mục tiêu (tham-vong): Tối ưu hiệu quả chi phí chuyến giao vận song song duy trì chất lượng dịch vụ — vì sao lúc này: Áp lực tối ưu vận hành đòi hỏi kinh doanh phải chọn lọc và gom tuyến giao hiệu quả ngay từ khâu ký kết. — Đáp ứng ưu tiên tối ưu chi phí trong điều kiện đội xe cố định mà không đánh đổi uy tín thương hiệu.
  - Căn chỉnh tới: Giao đúng hẹn ở mọi tuyến
  - KR: Chi phí vận tải bình quân trên mỗi đơn giao (giam-xuong, nghìn đồng) — Đo lường trực tiếp hiệu quả tối ưu hóa tuyến và lấp đầy tải trọng khi giữ nguyên đội xe.
  - KR: Tỷ lệ đơn hàng giao đúng mốc giờ hẹn (phan-tram, %) — Đối trọng kiểm soát để việc cắt giảm chi phí chuyến không làm suy giảm chất lượng dịch vụ cam kết.
  - KR: Số khiếu nại phát sinh từ đối tác mỗi tháng (giu-duoi, khiếu nại) — Bảo đảm đối tác vẫn hài lòng trong quá trình tinh gọn quy trình giao nhận.
```

### Cặp 5 — pb-tai-chinh#v1

**A**

```
Mục tiêu (cam-ket): Đảm bảo nguồn lực tài chính và nghĩa vụ thanh toán thông suốt nhằm giữ chân các đối tác trọng yếu — vì sao lúc này: Đơn vị đang đặt ưu tiên giữ chân đối tác lớn và duy trì đúng hạn bàn giao các nghĩa vụ cam kết. — Duy trì sự tín nhiệm và hợp tác lâu dài với các đối tác chủ lực thông qua kỷ luật thanh toán chuẩn xác.
  - KR: Tỷ lệ hồ sơ thanh toán đối tác được giải ngân đúng hạn cam kết (giu-tren, %) — Đảm bảo nghĩa vụ tài chính đúng hạn để duy trì lòng tin và giữ chân các đối tác trọng yếu.
  - KR: Tỷ lệ phản hồi khiếu nại của đối tác về chứng từ và công nợ phát sinh trong quý (giam-xuong, %) — Kiểm soát chất lượng đối soát tài chính để không gây phiền hà làm ảnh hưởng đến quan hệ hợp tác.
Mục tiêu (cam-ket): Vận hành kỷ luật ngân sách và tối ưu hiệu suất bộ máy tài chính trong khuôn khổ nguồn lực hiện có — vì sao lúc này: Đơn vị chịu ràng buộc nghiêm ngặt về việc không tăng biên chế và giữ nguyên ngân sách như quý trước. — Đảm bảo hoàn thành toàn bộ khối lượng công việc theo đúng hạn giao mà không phát sinh thêm nhân sự hay ngân sách.
  - KR: Tỷ lệ vượt ngân sách hoạt động so với định mức quý trước (giu-duoi, %) — Giữ kỷ luật chi tiêu để vận hành trọn vẹn trong khuôn khổ ngân sách cũ.
  - KR: Tỷ lệ báo cáo tài chính quản trị và cảnh báo dòng tiền hoàn thành đúng hạn định kỳ (giu-tren, %) — Giữ vững chất lượng giám sát và nhịp xử lý công việc với quy mô nhân sự hiện tại mà không cần bổ sung người.
```

**B**

```
Mục tiêu (cam-ket): Đảm bảo dòng tiền thông suốt và kiểm soát chặt chẽ công nợ đối tác — vì sao lúc này: Quý trước công nợ quá hạn còn ở mức 12% do đối tác chậm thanh toán, cần giải quyết dứt điểm để bảo toàn dòng tiền. — Thu hồi công nợ đúng hạn giúp công ty duy trì nguồn vốn lưu động ổn định mà không tăng ngân sách.
  - Căn chỉnh tới: Giữ tỷ lệ đối tác gia hạn trên 85%
  - KR: Tỷ lệ công nợ quá hạn của đối tác (giam-xuong, %, khởi điểm 12) — Giảm đọng vốn và duy trì dòng tiền lành mạnh cho các hoạt động vận tải.
  - KR: Tỷ lệ đối tác lớn đạt thỏa thuận hạn mức thanh toán không phát sinh tranh chấp (tang-toi, %) — Giữ chân đối tác lớn thông qua chính sách thanh toán rõ ràng và hợp tác bền vững.
Mục tiêu (cam-ket): Nâng cao hiệu quả báo cáo quản trị và kiểm soát định mức chi phí vận tải — vì sao lúc này: Cấp trên đặt trọng tâm giảm chi phí trên mỗi đơn, đòi hỏi phòng theo dõi sát sao dữ liệu chi phí định kỳ. — Hỗ trợ các khối vận hành nắm bắt bức tranh chi phí để duy trì cam kết giao đúng hẹn.
  - Căn chỉnh tới: Chi phí vận tải trên mỗi đơn giảm từ 42 xuống 36 nghìn đồng
  - KR: Số ngày làm việc để hoàn thành chốt sổ và báo cáo quản trị tháng (giu-duoi, ngày, khởi điểm 5) — Cung cấp dữ liệu tài chính kịp thời cho ban điều hành ra quyết định điều phối vận tải.
  - KR: Tỷ lệ sai lệch giữa chi phí vận hành thực tế so với ngân sách kế hoạch (giu-duoi, %) — Đảm bảo kỷ luật tài chính trong điều kiện giữ nguyên ngân sách và không tăng nhân lực.
```

| Cặp | Judge chọn | Người chọn | Khớp |
|---|---|---|---|
| 1 | (trong eval-soan-khoa.json) |  |  |
| 2 | (trong eval-soan-khoa.json) |  |  |
| 3 | (trong eval-soan-khoa.json) |  |  |
| 4 | (trong eval-soan-khoa.json) |  |  |
| 5 | (trong eval-soan-khoa.json) |  |  |
