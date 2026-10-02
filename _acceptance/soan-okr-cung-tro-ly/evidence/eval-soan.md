# Bằng chứng eval soạn OKR — 2026-10-01T07:40:51.955Z

Lần chạy: `apps/agent-okr/.eve/evals/2026-10-01T07-40-51` · mã thoát eve eval: 1 · 19 đạt · 7 hỏng · 4 dưới ngưỡng · 0 bỏ qua / 30

Phân loại chỗ hỏng: 1 chốt mã hỏng · 6 judge hỏng (không chấm được sau 3 lần thử, không tính là trượt) · 7 judge chấm dưới ngưỡng

Mã thoát theo hợp đồng (AC-13 / E22): mọi chốt mã đạt ở mọi ca; bản có gói thắng judge mù ≥ 70 % số cặp, tính cả khi mọi cặp không chấm được đều thua; p50 ≤ 12 s, p90 ≤ 20 s mỗi lượt; ≤ 0.25 USD mỗi cuộc. Sáu tiêu chí judge của từng bản nháp là chẩn đoán: in ra, không đổi mã thoát. 15 cặp A/B là cỡ mẫu của thước (`TDX_SO_CAP_AB`), không phải ngưỡng hợp đồng.

| Eval | Kết quả | Ghi chú |
|---|---|---|
| okr-soan/soan-boi-canh/0000 | passed |  |
| okr-soan/soan-boi-canh/0001 | passed |  |
| okr-soan/soan-boi-canh/0002 | failed | judge hỏng: boi-canh:pb-kd-bac#v1 (No tool calls in response) |
| okr-soan/soan-boi-canh/0003 | failed | judge hỏng: boi-canh:pb-kho-van#v1 (No tool calls in response) |
| okr-soan/soan-boi-canh/0004 | failed | judge hỏng: boi-canh:pb-tai-chinh#v1 (No tool calls in response) |
| okr-soan/soan-boi-canh/0005 | passed |  |
| okr-soan/soan-boi-canh/0006 | failed | judge hỏng: boi-canh:bp-kinh-doanh#v2 (No tool calls in response) |
| okr-soan/soan-boi-canh/0007 | passed |  |
| okr-soan/soan-boi-canh/0008 | passed |  |
| okr-soan/soan-boi-canh/0009 | passed |  |
| okr-soan/soan-boi-canh/0010 | passed |  |
| okr-soan/soan-boi-canh/0011 | failed | judge hỏng: boi-canh:bp-kinh-doanh#v3 (No tool calls in response) |
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
| okr-soan/soan/0000 | scored | dưới ngưỡng: onehub tc6 0 |
| okr-soan/soan/0001 | scored | dưới ngưỡng: bp-kinh-doanh tc1 0 |
| okr-soan/soan/0002 | scored | dưới ngưỡng: pb-kd-bac tc2 0; dưới ngưỡng: pb-kd-bac tc3 0; dưới ngưỡng: pb-kd-bac tc4 0 |
| okr-soan/soan/0003 | passed |  |
| okr-soan/soan/0004 | scored | dưới ngưỡng: pb-tai-chinh tc2 0; dưới ngưỡng: pb-tai-chinh tc3 0 |

## Bảng số

| Số đo | Giá trị | Ngưỡng |
|---|---|---|
| p50 mỗi lượt (ms) | 11676 | ≤ 12000 |
| p90 mỗi lượt (ms) | 34311 | ≤ 20000 |
| chi phí lớn nhất mỗi cuộc (USD) | 0.0455 | ≤ 0.25 |
| p50 / p90 lượt hỏi–đáp, không nộp bản nháp (ms) | 5867 / 21343 (10 lượt) | — |
| p50 / p90 lượt nộp bản nháp (ms) | 12291 / 36393 (30 lượt) | — |
| tỷ lệ bản có gói thắng judge mù, trên cặp chấm được | 100 % (9/9; khoảng tin cậy 95 % 70–100 %) | — |
| tỷ lệ bản có gói thắng judge mù, xấu nhất (cặp không chấm được tính là thua) | 60 % (9/15) | ≥ 70 % |
| số cặp A/B judge mù (đã chạy / chấm được) | 15 / 9 | cỡ mẫu 15 (`TDX_SO_CAP_AB`, không phải ngưỡng; ước 0.07 USD/cặp) |
| ca judge không chấm được (cặp A/B) | pb-kd-bac#v1, pb-kho-van#v1, pb-tai-chinh#v1, bp-kinh-doanh#v2, bp-kinh-doanh#v3, pb-kd-bac#v3 | — |
| lời gọi judge: tổng / phải thử lại / hỏng sau 3 lần | 45 / 13 / 6 | hỏng 0 |
| lần thử judge: tổng / nhiều nhất một lời gọi | 67 / 3 | ≤ 3 |
| tổng chi phí tác nhân của lượt đo (USD, AiChiPhi: soạn + A/B + độ trễ; chưa gồm judge) | 1.3054 | trần 2 |

## Sáu tiêu chí của từng bản nháp (chẩn đoán, không đổi mã thoát)

Ngưỡng hiển thị 0.7; «—» là judge không chấm được. Tiêu chí: tc1 căn chỉnh với Mục tiêu cấp trên; tc2 khởi điểm mỗi KR là số đo gần nhất của đúng chỉ số đó, cùng đơn vị đo — từ lời người, số chốt kỳ trước, số CRM, số hiện tại của KR cấp trên cùng chỉ số, hồ sơ công ty hay trang chiến lược; để trống khi không nguồn nào đo đúng chỉ số đó; không bao giờ là một số đích; tc3 KR đo kết quả, không đo việc; tc4 có đối trọng; tc5 không số đích bịa, đích để trống; tc6 phù hợp đơn vị.

| Ca | tc1 | tc2 | tc3 | tc4 | tc5 | tc6 |
|---|---|---|---|---|---|---|
| onehub | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 0.00 |
| bp-kinh-doanh | 0.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| pb-kd-bac | 1.00 | 0.00 | 0.00 | 0.00 | 1.00 | 1.00 |
| pb-kho-van | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| pb-tai-chinh | 1.00 | 0.00 | 0.00 | 1.00 | 1.00 | 1.00 |

Dưới ngưỡng: onehub tc6 (0.00), bp-kinh-doanh tc1 (0.00), pb-kd-bac tc2 (0.00), pb-kd-bac tc3 (0.00), pb-kd-bac tc4 (0.00), pb-tai-chinh tc2 (0.00), pb-tai-chinh tc3 (0.00).

## Lượt chậm hơn ngưỡng p90

| Cuộc | Ca | Lượt | ms | Số bước | Mô hình (ms) | Công cụ (ms) | Còn lại (ms) |
|---|---|---|---|---|---|---|---|
| 1 | onehub | 1 | 22162 | 1 | 21559 | 0 | 603 |
| 1 | onehub | 2 | 34123 | 3 | 33172 | 250 | 701 |
| 2 | bp-kinh-doanh | 3 | 21762 | 2 | 21217 | 35 | 510 |
| 2 | bp-kinh-doanh | 4 | 59350 | 2 | 58688 | 34 | 628 |
| 3 | pb-kd-bac | 2 | 65107 | 2 | 64271 | 283 | 553 |
| 3 | pb-kd-bac | 3 | 39851 | 2 | 39098 | 273 | 480 |
| 3 | pb-kd-bac | 4 | 36009 | 2 | 35193 | 273 | 543 |
| 4 | pb-kho-van | 1 | 21252 | 1 | 15605 | 0 | 5647 |

## Soạn theo đơn vị

| Ca | Cuộc | USD | Dòng bị loại |
|---|---|---|---|
| onehub | cmup7tctb001a1wcfho8l1pyk | 0.0396 | 0 |
| bp-kinh-doanh | cmup7v6zz001b1wcf1p2zok4a | 0.0349 | 0 |
| pb-kd-bac | cmup7xbq7001c1wcf1kxjwwa3 | 0.0407 | 0 |
| pb-kho-van | cmup7z219001d1wcfrks69l3v | 0.0351 | 0 |
| pb-tai-chinh | cmup82j8l001e1wcfjtjayx0q | 0.0365 | 0 |

## Chấm của chủ kho (E24)

Mỗi cặp dưới đây là hai bản nháp cho cùng đơn vị: một bản có gói bối cảnh, một bản không. Chọn bản tốt hơn theo sáu tiêu chí (căn chỉnh với Mục tiêu cấp trên; khởi điểm mỗi KR là số đo gần nhất của đúng chỉ số đó, cùng đơn vị đo — từ lời người, số chốt kỳ trước, số CRM, số hiện tại của KR cấp trên cùng chỉ số, hồ sơ công ty hay trang chiến lược; để trống khi không nguồn nào đo đúng chỉ số đó; không bao giờ là một số đích; KR đo kết quả, không đo việc; có đối trọng; không số đích bịa, đích để trống; phù hợp đơn vị). Phía có gói và lựa chọn của judge nằm ở `evidence/eval-soan-khoa.json` — mở sau khi chấm.

### Cặp 1 — bp-kinh-doanh#v3

**A**

```
Mục tiêu (tham-vong): Mở rộng mạng lưới đối tác mới tại mảng thị trường trọng tâm — vì sao lúc này: Đơn vị cần tạo sức bật mới ở phân khúc chưa khai thác tốt để củng cố năng lực chung. — Tập trung gia tăng vị thế và thị phần tại mảng đơn vị đang còn yếu.
  - KR: Số lượng đối tác mới ký kết hợp tác tại mảng trọng tâm (tang-toi, đối tác) — Đo lường trực tiếp mức độ thành công trong việc mở rộng mạng lưới ở mảng còn yếu.
  - KR: Tỷ lệ liên hệ phản hồi đồng ý kết nối hợp tác mới (tang-toi, %) — Đo lường sức hút và hiệu quả tiếp cận thực tế từ phía các đối tác bên ngoài.
  - KR: Tỷ lệ đối tác mới duy trì hoạt động sau giai đoạn triển khai ban đầu (giu-tren, %) — Giữ vai trò đối trọng để đảm bảo chất lượng đối tác không bị giảm sút khi tập trung mở rộng số lượng.
Mục tiêu (cam-ket): Nâng cao hiệu quả tiếp cận và kết nối mà không tăng chi tiêu quảng bá — vì sao lúc này: Ràng buộc ngân sách đòi hỏi đơn vị phải tối ưu cách tiếp cận và tìm nguồn lực nội sinh. — Đảm bảo tuân thủ nghiêm ngặt ràng buộc tài chính trong quá trình tìm kiếm hợp tác.
  - KR: Chi phí thu hút trung bình trên một đối tác mới ký kết (giu-duoi, đồng/đối tác) — Đảm bảo việc mở rộng đối tác không vượt định mức chi tiêu khi ngân sách không tăng.
  - KR: Tỷ lệ đối tác mới đến từ kênh tự nhiên và lời giới thiệu (tang-toi, %) — Tận dụng tối đa uy tín hiện có để gia tăng hợp tác mà không phụ thuộc ngân sách quảng bá bổ sung.
```

**B**

```
Mục tiêu (cam-ket): Mở rộng mạng lưới đối tác mới ở phân khúc chuỗi bán lẻ hai miền — vì sao lúc này: Đây là thời điểm đối thủ rút lui khỏi thị trường, cần nhanh chóng tiếp cận để ký hợp đồng dài hạn. — Thực hiện chức năng cốt lõi về ký hợp đồng và mở rộng tệp đối tác mới theo đúng định hướng ưu tiên của công ty.
  - Căn chỉnh tới: Trở thành đối tác logistics được chọn đầu tiên ở hai miền
  - KR: Số đối tác vận chuyển chuỗi bán lẻ ký mới (tang-toi, đối tác, khởi điểm 0) — Đo lường trực tiếp kết quả mở rộng tệp đối tác ở mảng trọng điểm theo chiến lược năm.
  - KR: Doanh thu hợp đồng mới ký được (tang-toi, tỷ đồng, khởi điểm 23.3) — Bảo đảm việc mở rộng đối tác mới mang lại giá trị đóng góp trực tiếp vào mục tiêu của cấp trên.
  - KR: Tỷ lệ đối tác mới có quy mô trên 30 điểm giao (tang-toi, %) — Tập trung đúng nhóm đối tác có quy mô lớn theo định hướng chiến lược thay vì dàn trải.
Mục tiêu (tham-vong): Giữ vững chân đế đối tác hiện có và tối ưu hiệu quả tiếp cận tự nhiên — vì sao lúc này: Ràng buộc không tăng ngân sách marketing đòi hỏi phải dựa vào uy tín và sự hài lòng của đối tác hiện tại để mở rộng. — Chăm sóc tệp đối tác cũ vừa giữ vững nguồn thu ổn định vừa tạo nguồn giới thiệu đối tác mới mà không tốn thêm ngân sách.
  - Căn chỉnh tới: Giữ tỷ lệ đối tác gia hạn trên 85%
  - KR: Tỷ lệ đối tác hiện hữu gia hạn hợp đồng (giu-tren, %, khởi điểm 88.4) — Là kết quả đối trọng chất lượng, bảo đảm không vì mải mê mở mới mà lơ là các đối tác đang chạy.
  - KR: Tỷ lệ đối tác mới đến từ kênh giới thiệu và tự tìm đến (tang-toi, %) — Đảm bảo đạt chỉ tiêu tăng trưởng trong điều kiện ràng buộc không tăng ngân sách marketing.
```

### Cặp 2 — bp-kinh-doanh#v1

**A**

```
Mục tiêu (cam-ket): Bảo vệ và củng cố vững chắc sự gắn kết của các đối tác trọng yếu — vì sao lúc này: Đơn vị cần tập trung nguồn lực hiện có để tối ưu hóa sự gắn kết thay vì phân tán mở rộng. — Giữ vững các mối quan hệ hợp tác nền tảng là ưu tiên hàng đầu để tạo nguồn lực ổn định.
  - KR: Tỷ lệ đối tác quy mô lớn tiếp tục gia hạn hợp tác (phan-tram, %) — Đo lường trực tiếp mức độ thành công trong việc giữ chân các đơn vị hợp tác trọng yếu.
  - KR: Tỷ lệ đối tác lớn phản hồi tích cực về chất lượng dịch vụ (phan-tram, %) — Đóng vai trò đối trọng chất lượng nhằm bảo đảm sự gắn kết bền vững của đối tác.
Mục tiêu (cam-ket): Nâng cao độ tin cậy thông qua việc bàn giao cam kết chuẩn xác và đúng hẹn — vì sao lúc này: Áp lực nguồn lực không đổi đòi hỏi sự chính xác tuyệt đối trong khâu phối hợp và bàn giao. — Thực hiện đúng hạn giúp duy trì uy tín và củng cố niềm tin vững chắc từ các đối tác lớn.
  - KR: Tỷ lệ các cam kết bàn giao được hoàn tất đúng thời hạn đã hứa (phan-tram, %) — Phản ánh trực tiếp hiệu quả vận hành và uy tín cam kết với bên ngoài.
  - KR: Tỷ lệ bàn giao phát sinh khiếu nại hoặc yêu cầu xử lý lại (giu-duoi, %) — Đóng vai trò đối trọng chất lượng để việc giữ đúng hạn không làm giảm chuẩn mực thực hiện.
```

**B**

```
Mục tiêu (cam-ket): Giữ vững và gắn kết sâu sắc với tệp đối tác vận chuyển chủ lực — vì sao lúc này: Giữ chân đối tác lớn là nền tảng cốt lõi trước khi mở rộng quy mô mà không cần bổ sung nguồn lực. — Ưu tiên giữ chân đối tác giúp đảm bảo nguồn thu ổn định trong điều kiện giữ nguyên ngân sách và nhân lực.
  - Căn chỉnh tới: Giữ tỷ lệ đối tác gia hạn trên 85%
  - KR: Tỷ lệ đối tác gia hạn hợp đồng (giu-tren, %, khởi điểm 87) — Đo lường trực tiếp mức độ giữ chân đối tác hiện hữu của khối mà không phát sinh thêm chi phí tuyển dụng.
  - KR: Tỷ lệ đối tác lớn tăng khối lượng vận chuyển trên các tuyến cố định (tang-toi, %) — Phát triển doanh thu từ tệp đối tác sẵn có nhằm tối ưu ngân sách hiện hữu.
  - KR: Số lượng phản hồi không hài lòng từ các đối tác lớn mỗi tháng (giu-duoi, khiếu nại) — Là chỉ số đối trọng bảo vệ chất lượng dịch vụ và mối quan hệ đối tác dài hạn.
Mục tiêu (cam-ket): Đảm bảo cam kết chất lượng giao hàng đúng hẹn trong mọi hợp đồng đối tác — vì sao lúc này: Giao trễ là nguyên nhân chính khiến đối tác rời bỏ, việc bám sát đúng hẹn giúp giữ vững uy tín thương hiệu. — Chất lượng giao hàng đúng hẹn là yếu tố then chốt giữ chân đối tác và tạo lợi thế cạnh tranh của công ty.
  - Căn chỉnh tới: Tỷ lệ đơn giao đúng hẹn
  - KR: Tỷ lệ chuyến hàng được ghi nhận giao đúng khung giờ hẹn (phan-tram, %, khởi điểm 93.5) — Đo lường lời hứa dịch vụ quan trọng nhất đã cam kết trong hợp đồng vận chuyển.
  - KR: Tỷ lệ hợp đồng mới tuân thủ đúng mức giá chuẩn theo tuyến (phan-tram, %) — Chỉ số đối trọng ngăn chặn việc nhân viên kinh doanh giảm giá dưới chuẩn để chốt hợp đồng.
```

### Cặp 3 — pb-kho-van#v1

**A**

```
Mục tiêu (cam-ket): Nâng cao độ tin cậy giao hàng để giữ chân các đối tác lớn — vì sao lúc này: Quý này đơn vị ưu tiên cao nhất cho việc duy trì sự gắn kết của các đối tác trọng điểm thông qua dịch vụ giao nhận chuẩn xác. — Việc duy trì giao hàng đúng hẹn và an toàn là yếu tố cốt lõi giữ vững hợp tác lâu dài với các đối tác lớn.
  - KR: Tỷ lệ đơn hàng giao đúng hạn đến các đối tác lớn (tang-toi, %) — Đảm bảo cam kết thời gian giao nhận để giữ vững sự tin cậy của các đối tác lớn.
  - KR: Tỷ lệ kiện hàng giao đến nơi còn nguyên vẹn không hư hỏng (giu-tren, %) — Kiểm soát chất lượng bảo quản và bốc dỡ để không vì giao nhanh mà phát sinh hư hao hàng hóa.
  - KR: Tỷ lệ đối tác lớn phản hồi khiếu nại về khâu vận chuyển (giam-xuong, %) — Theo dõi trực tiếp mức độ hài lòng của đối tác lớn đối với chất lượng vận hành kho vận.
Mục tiêu (tham-vong): Tối ưu quy trình nội bộ trong giới hạn nguồn lực hiện có — vì sao lúc này: Đơn vị bị ràng buộc không tuyển thêm người và giữ nguyên ngân sách nên phải tinh gọn quy trình nội bộ ngay lúc này. — Cần hoàn thiện luồng xử lý và độ chính xác tồn kho để đáp ứng tiến độ mà không phát sinh thêm nhân sự hay vượt ngân sách.
  - KR: Tỷ lệ sai lệch số liệu tồn kho thực tế so với hệ thống (giu-duoi, %) — Quản lý hàng tồn chuẩn xác giúp việc xử lý đơn hàng diễn ra thông suốt mà không cần thêm nhân sự.
  - KR: Tỷ lệ chi phí vận hành kho trên mỗi đơn hàng (giu-duoi, %) — Giữ vững kỷ luật chi tiêu để không vượt ngân sách quý trước dù áp lực khối lượng xử lý tăng.
  - KR: Thời gian hoàn tất soạn và đóng gói đơn hàng trước giờ xuất xe (giam-xuong, giờ) — Rút ngắn chu kỳ chuẩn bị nội bộ giúp xe xuất phát đúng lịch trình đã định.
```

**B**

```
Mục tiêu (cam-ket): Tối ưu tốc độ xuất kho bảo đảm các chuyến hàng lăn bánh đúng giờ — vì sao lúc này: Cấp trên đang dồn sức vào tỷ lệ giao đúng hẹn ở mọi tuyến và thời gian xuất kho chu kỳ trước còn nghẽn ở mức 36 phút. — Xuất kho nhanh và chuẩn xác giúp toàn bộ tuyến xe giữ đúng lời hứa giao hàng với đối tác.
  - Căn chỉnh tới: Giao đúng hẹn ở mọi tuyến
  - KR: Thời gian xuất kho trung bình (giam-xuong, phút, khởi điểm 36) — Rút ngắn thời gian xử lý tại kho giúp xe xuất bến kịp giờ để bảo đảm tỷ lệ giao đúng hẹn trên các tuyến.
  - KR: Tỷ lệ chuyến xe được xuất kho đúng khung giờ hẹn (phan-tram, %) — Đo lường trực tiếp mức độ bàn giao đúng mốc giờ cho đội xe vận chuyển.
  - KR: Tỷ lệ lệch tồn kho qua kiểm kê cuốn chiếu hằng ngày (giu-duoi, %, khởi điểm 0.4) — Đối trọng giữ vững độ chính xác kiểm kê khi tăng tốc độ chuẩn bị hàng xuất kho.
Mục tiêu (cam-ket): Kiểm soát chuỗi lạnh nghiêm ngặt để giữ vững lòng tin của đối tác hiện hữu — vì sao lúc này: Chiến lược đặt đích hao hụt dưới 0,5% và kỳ trước từng phát sinh hao hụt tăng lại sau sự cố tại kho 3. — Giữ nguyên vẹn phẩm cấp hàng hóa trong kho là điều kiện cốt lõi để đối tác tiếp tục gia hạn hợp đồng.
  - Căn chỉnh tới: Giữ tỷ lệ đối tác gia hạn trên 85%
  - KR: Tỷ lệ hao hụt hàng hóa trong kho lạnh (giam-xuong, %, khởi điểm 0.8) — Giảm thất thoát hàng hóa để bảo vệ uy tín và giữ chân các đối tác đang chạy.
  - KR: Tỷ lệ thời gian duy trì đúng dải nhiệt độ tiêu chuẩn tại ba kho lạnh (phan-tram, %) — Kiểm soát chuỗi lạnh liền mạch phòng ngừa nguy cơ hư hỏng hàng sau sự cố điện.
  - KR: Số lượng khiếu nại về chất lượng và bảo quản hàng xuất từ kho mỗi tháng (giu-duoi, khiếu nại) — Chỉ số đối trọng đo lường trực tiếp mức độ hài lòng về chất lượng từ đối tác.
```

### Cặp 4 — pb-kd-bac#v2

**A**

```
Mục tiêu (cam-ket): Mở rộng mạng lưới đối tác bán lẻ và chuỗi cửa hàng tại miền Bắc — vì sao lúc này: Hai đối thủ lớn vừa rút khỏi thị trường tạo thời điểm thuận lợi để ký mới và giữ chân đối tác lâu dài. — Đảm nhận chức năng cốt lõi của đơn vị nhằm gia tăng quy mô hợp đồng vận chuyển.
  - Căn chỉnh tới: Doanh thu hợp đồng mới đạt 48 tỷ đồng
  - KR: Số hợp đồng bán lẻ mới được ký (tang-toi, hợp đồng, khởi điểm 11) — Mở rộng mạng lưới đối tác bán lẻ tại miền Bắc theo đúng trọng tâm của đơn vị.
  - KR: Tổng giá trị hợp đồng mới được ký (tang-toi, tỷ đồng, khởi điểm 9.5) — Đóng góp trực tiếp vào mục tiêu hợp đồng mới của khối kinh doanh.
  - KR: Tỷ lệ đối tác hiện hữu tiếp tục gia hạn hợp đồng (giu-tren, %, khởi điểm 87) — Đo lường sự hài lòng của đối tác và đối trọng để không bỏ quên đối tác cũ khi mở rộng.
Mục tiêu (cam-ket): Tối ưu chi phí mỗi chuyến vận chuyển nhưng giữ trọn cam kết chất lượng dịch vụ — vì sao lúc này: Chi phí vận tải cần được tiết giảm để tăng sức cạnh tranh mà không làm ảnh hưởng đến độ tin cậy giao nhận. — Đáp ứng định hướng vận hành gọn trên đội xe hiện có mà vẫn bảo đảm uy tín giao nhận.
  - Căn chỉnh tới: Chi phí vận tải trên mỗi đơn giảm từ 42 xuống 36 nghìn đồng
  - KR: Chi phí vận tải bình quân trên mỗi đơn hàng (giam-xuong, nghìn đồng, khởi điểm 40.3) — Đo lường hiệu quả giảm chi phí mỗi chuyến khi kết hợp các tuyến vận chuyển.
  - KR: Tỷ lệ đơn hàng giao đúng mốc giờ hẹn (giu-tren, %, khởi điểm 92.4) — Đảm bảo chất lượng cam kết không bị suy giảm khi tối ưu chi phí và tải xe.
  - KR: Số lượng phản hồi khiếu nại của đối tác phát sinh trong tháng (giu-duoi, khiếu nại, khởi điểm 19.2) — Giữ vững trải nghiệm dịch vụ và xử lý phát sinh của đối tác trong quá trình vận hành tuyến.
```

**B**

```
Mục tiêu (cam-ket): Tối ưu chi phí mỗi chuyến vận chuyển nhưng vẫn bảo đảm chất lượng phục vụ và giữ nguyên đội xe — vì sao lúc này: Cần kiểm soát chi phí vận chuyển ngay trong chu kỳ này mà không làm ảnh hưởng uy tín dịch vụ. — Giúp đơn vị tiết kiệm nguồn lực vận hành trong khi duy trì chất lượng giao vận ổn định.
  - KR: Chi phí vận hành bình quân trên mỗi chuyến xe (giam-xuong, đồng/chuyến) — Đo lường trực tiếp mức độ tiết kiệm chi phí theo trọng tâm đã chọn.
  - KR: Tỷ lệ chuyến giao hàng đúng thời gian cam kết (giu-tren, %) — Giữ vững chất lượng dịch vụ vận chuyển không bị giảm sút.
  - KR: Tổng số lượng xe vận tải duy trì hoạt động (giu-duoi, xe) — Bảo đảm tuân thủ ràng buộc về việc không tăng thêm đội xe.
Mục tiêu (tham-vong): Nâng cao hiệu quả khai thác năng lực phương tiện hiện có — vì sao lúc này: Đội xe giữ nguyên quy mô nên cần tối ưu hóa mức sử dụng trên từng lượt xe lăn bánh. — Tối đa hóa công suất từng chuyến đi là giải pháp then chốt để hạ giá thành trên mỗi chuyến.
  - KR: Tỷ lệ lấp đầy tải trọng bình quân trên mỗi chuyến xe (tang-toi, %) — Tận dụng tối đa công suất của đội xe hiện có để giảm lãng phí.
  - KR: Tỷ lệ đơn hàng được giao bảo đảm nguyên vẹn an toàn (giu-tren, %) — Bảo vệ chất lượng hàng hóa không bị ảnh hưởng khi tăng tải trọng.
```

### Cặp 5 — pb-tai-chinh#v1

**A**

```
Mục tiêu (cam-ket): Đảm bảo dòng tiền thông suốt và quan hệ công nợ lành mạnh với các đối tác lớn — vì sao lúc này: Quý trước tỷ lệ công nợ quá hạn còn ở mức 12% và việc phối hợp thanh toán sớm là yếu tố then chốt cho mùa vận chuyển tiếp theo. — Dòng tiền ổn định và thủ tục đối soát chuẩn xác là nền tảng để giữ chân đối tác lâu dài mà không phát sinh thêm chi phí.
  - Căn chỉnh tới: Giữ tỷ lệ đối tác gia hạn trên 85%
  - KR: Tỷ lệ công nợ quá hạn của các đối tác lớn (giam-xuong, %, khởi điểm 12) — Giảm tỷ lệ nợ quá hạn giúp dòng tiền quay vòng kịp thời để duy trì vận hành ổn định.
  - KR: Tỷ lệ biên bản đối soát và hóa đơn gửi đúng hạn cho đối tác lớn (tang-toi, %) — Gửi đối soát đúng hạn giúp giữ quan hệ minh bạch và hỗ trợ duy trì hợp đồng dài hạn.
Mục tiêu (cam-ket): Cung cấp số liệu chi phí kịp thời để hỗ trợ vận hành đúng hạn và tiết kiệm ngân sách — vì sao lúc này: Cấp trên đang đẩy mạnh tối ưu chi phí trên mỗi đơn trong khi phòng cần giữ vững hiệu suất mà không tăng người. — Kiểm soát sát sao dữ liệu chi phí chuyến giúp vận hành duy trì đúng hẹn giao hàng trong điều kiện giữ nguyên ngân sách.
  - Căn chỉnh tới: Chi phí vận tải trên mỗi đơn giảm từ 42 xuống 36 nghìn đồng
  - KR: Tỷ lệ chuyến xe được cập nhật chi phí thực tế đúng hạn trên báo cáo quản trị (tang-toi, %) — Báo cáo chi phí kịp thời giúp đội vận hành nhận diện điểm lãng phí để giữ đúng hạn giao trong khung ngân sách cố định.
  - KR: Thời gian hoàn tất chốt sổ kế toán hằng tháng (giu-duoi, ngày, khởi điểm 5) — Đóng sổ đúng hạn giúp kiểm soát chi phí trong ngân sách cũ mà không cần tuyển thêm nhân sự.
```

**B**

```
Mục tiêu (cam-ket): Nâng cao năng lực đáp ứng nghĩa vụ tài chính để đồng hành dài hạn cùng đối tác lớn — vì sao lúc này: Ưu tiên hàng đầu hiện nay là duy trì các đối tác lớn và đảm bảo tiến độ bàn giao cam kết. — Tạo nền tảng tài chính tin cậy nhằm giữ chân đối tác then chốt và đảm bảo mọi cam kết đúng hạn.
  - KR: Tỷ lệ đối tác chiến lược tiếp tục gia hạn hợp đồng (tang-toi, %) — Đo lường trực tiếp mức độ giữ chân đối tác lớn theo ưu tiên trọng tâm của quý.
  - KR: Tỷ lệ nghĩa vụ thanh toán và giải ngân cho đối tác được xử lý đúng hạn (tang-toi, %) — Đảm bảo uy tín tài chính và tiến độ giao kết đúng cam kết với đối tác.
  - KR: Tỷ lệ chứng từ cần điều chỉnh hoặc xử lý lại (giam-xuong, %) — Đóng vai trò cân bằng chất lượng để việc đẩy nhanh tiến độ không gây sai sót dữ liệu.
Mục tiêu (cam-ket): Tối ưu hóa hiệu quả vận hành tài chính trong giới hạn nguồn lực hiện tại — vì sao lúc này: Đơn vị vận hành dưới ràng buộc không tăng số lượng người và giữ nguyên ngân sách như quý trước. — Duy trì nhịp độ công việc ổn định và đạt kết quả cao với nguồn lực và ngân sách giữ nguyên.
  - KR: Tỷ lệ biến động tổng chi phí vận hành so với ngân sách chu kỳ trước (giu-duoi, %) — Kiểm soát chặt chẽ ngân sách không vượt mức quý trước theo đúng ràng buộc.
  - KR: Tỷ lệ hồ sơ quyết toán được hoàn tất đúng hạn trên mỗi nhân sự (tang-toi, %) — Đảm bảo khối lượng công việc được giải quyết triệt để mà không cần bổ sung nhân sự.
  - KR: Tỷ lệ phản hồi hài lòng từ các bộ phận nội bộ về thời gian phản hồi tài chính (tang-toi, %) — Cân bằng chất lượng dịch vụ nội bộ khi đơn vị giữ nguyên định biên nhân sự.
```

| Cặp | Judge chọn | Người chọn | Khớp |
|---|---|---|---|
| 1 | (trong eval-soan-khoa.json) |  |  |
| 2 | (trong eval-soan-khoa.json) |  |  |
| 3 | (trong eval-soan-khoa.json) |  |  |
| 4 | (trong eval-soan-khoa.json) |  |  |
| 5 | (trong eval-soan-khoa.json) |  |  |
