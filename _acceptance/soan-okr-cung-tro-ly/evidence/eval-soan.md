# Bằng chứng eval soạn OKR — 2026-10-01T01:41:38.748Z

Lần chạy: `apps/agent-okr/.eve/evals/2026-10-01T01-41-38` · mã thoát eve eval: 1 · 25 đạt · 1 hỏng · 4 dưới ngưỡng · 0 bỏ qua / 30

Phân loại chỗ hỏng: 0 chốt mã hỏng · 1 judge hỏng (không chấm được sau 3 lần thử, không tính là trượt) · 6 judge chấm dưới ngưỡng

| Eval | Kết quả | Ghi chú |
|---|---|---|
| okr-soan/soan-boi-canh/0000 | passed |  |
| okr-soan/soan-boi-canh/0001 | passed |  |
| okr-soan/soan-boi-canh/0002 | failed | judge hỏng: boi-canh:pb-kd-bac#v1 (No tool calls in response) |
| okr-soan/soan-boi-canh/0003 | passed |  |
| okr-soan/soan-boi-canh/0004 | passed |  |
| okr-soan/soan-boi-canh/0005 | passed |  |
| okr-soan/soan-boi-canh/0006 | passed |  |
| okr-soan/soan-boi-canh/0007 | passed |  |
| okr-soan/soan-boi-canh/0008 | passed |  |
| okr-soan/soan-boi-canh/0009 | passed |  |
| okr-soan/soan-boi-canh/0010 | passed |  |
| okr-soan/soan-boi-canh/0011 | passed |  |
| okr-soan/soan-boi-canh/0012 | passed |  |
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
| okr-soan/soan-do-tre/0009 | passed |  |
| okr-soan/soan/0000 | scored | dưới ngưỡng: onehub tc3 0; dưới ngưỡng: onehub tc4 0; dưới ngưỡng: onehub tc6 0 |
| okr-soan/soan/0001 | scored | dưới ngưỡng: bp-kinh-doanh tc2 0 |
| okr-soan/soan/0002 | scored | dưới ngưỡng: pb-kd-bac tc3 0 |
| okr-soan/soan/0003 | passed |  |
| okr-soan/soan/0004 | scored | dưới ngưỡng: pb-tai-chinh tc3 0 |

## Bảng số

| Số đo | Giá trị | Ngưỡng |
|---|---|---|
| p50 mỗi lượt (ms) | 9310 | ≤ 12000 |
| p90 mỗi lượt (ms) | 13680 | ≤ 20000 |
| chi phí lớn nhất mỗi cuộc (USD) | 0.0417 | ≤ 0.25 |
| p50 / p90 lượt hỏi–đáp, không nộp bản nháp (ms) | 4761 / 6924 (11 lượt) | — |
| p50 / p90 lượt nộp bản nháp (ms) | 10191 / 13716 (29 lượt) | — |
| tỷ lệ bản có gói thắng judge mù | 100 % (14/14 ca chấm được; khoảng tin cậy 95 % 78–100 %) | ≥ 70 % |
| số cặp A/B judge mù (đã chạy / chấm được) | 15 / 14 | ≥ 15 (`TDX_SO_CAP_AB`, ước 0.07 USD/cặp) |
| ca judge không chấm được (cặp A/B) | pb-kd-bac#v1 | 0 |
| lời gọi judge: tổng / phải thử lại / hỏng sau 3 lần | 45 / 7 / 1 | hỏng 0 |
| lần thử judge: tổng / nhiều nhất một lời gọi | 54 / 3 | ≤ 3 |
| tổng chi phí tác nhân của lượt đo (USD, AiChiPhi: soạn + A/B + độ trễ; chưa gồm judge) | 1.3041 | trần 2 |

## Lượt chậm hơn ngưỡng p90

| Cuộc | Ca | Lượt | ms | Số bước | Mô hình (ms) | Công cụ (ms) | Còn lại (ms) |
|---|---|---|---|---|---|---|---|
| 3 | pb-kd-bac | 2 | 80011 | 0 | 0 | 0 | 80011 |
| 3 | pb-kd-bac | 3 | 42541 | 3 | 41911 | 249 | 381 |
| 3 | pb-kd-bac | 4 | 33968 | 2 | 33527 | 45 | 396 |

## Soạn theo đơn vị

| Ca | Cuộc | USD | Dòng bị loại |
|---|---|---|---|
| onehub | cmuov599e001am1cf2yba0pbs | 0.0351 | 0 |
| bp-kinh-doanh | cmuov6dax001bm1cfbwbb4fch | 0.0357 | 0 |
| pb-kd-bac | cmuov85qt001cm1cfqodt0b7a | 0.0431 | 0 |
| pb-kho-van | cmuov9k3i001dm1cfdpqk003n | 0.0348 | 0 |
| pb-tai-chinh | cmuovavus001em1cf8bsz0757 | 0.0331 | 0 |

## Chấm của chủ kho (E24)

Mỗi cặp dưới đây là hai bản nháp cho cùng đơn vị: một bản có gói bối cảnh, một bản không. Chọn bản tốt hơn theo sáu tiêu chí (căn chỉnh với Mục tiêu cấp trên; dùng đúng khởi điểm từ kỳ trước và số CRM; KR đo kết quả, không đo việc; có đối trọng; không số đích bịa, đích để trống; phù hợp đơn vị). Phía có gói và lựa chọn của judge nằm ở `evidence/eval-soan-khoa.json` — mở sau khi chấm.

### Cặp 1 — pb-kho-van#v2

**A**

```
Mục tiêu (cam-ket): Tối ưu hoá hiệu quả chi phí vận tải trên từng chuyến với quy mô đội xe hiện tại — vì sao lúc này: Áp lực tối ưu chi phí trong bối cảnh nguồn lực phương tiện được giữ cố định. — Cần giảm bớt hao phí vận hành mà vẫn duy trì đúng cam kết phục vụ bằng đội xe hiện hữu.
  - KR: Chi phí trung bình trên mỗi chuyến giao hàng (giam-xuong, đồng/chuyến) — Đo lường trực tiếp mức độ tiết kiệm chi phí vận chuyển trên từng chuyến xe.
  - KR: Tỷ lệ chuyến giao đến nơi đúng giờ cam kết (giu-tren, %) — Đảm bảo việc siết chi phí không làm ảnh hưởng đến thời gian giao nhận.
  - KR: Hệ số lấp đầy tải trọng trên mỗi lượt xe lăn bánh (tang-toi, %) — Tận dụng tối đa công suất đội xe sẵn có để giảm lượng chuyến phát sinh thừa.
Mục tiêu (cam-ket): Giữ vững chất lượng dịch vụ giao nhận và an toàn hàng hoá — vì sao lúc này: Tránh rủi ro cắt giảm chi phí dẫn tới gia tăng hàng hư hỏng hoặc sai sót giao nhận. — Tối ưu chi phí chỉ có giá trị khi chất lượng giao hàng không bị suy giảm.
  - KR: Tỷ lệ kiện hàng được giao nguyên vẹn không móp méo hư hại (giu-tren, %) — Bảo đảm an toàn hàng hoá xuyên suốt quá trình chuyên chở.
  - KR: Tỷ lệ chuyến phát sinh phản ánh về thái độ phục vụ hoặc thất lạc (giam-xuong, %) — Giữ vững chất lượng dịch vụ giao nhận và sự hài lòng của các bên nhận.
  - KR: Tỷ lệ sai lệch giữa hàng giao thực tế và biên bản bàn giao kho (giu-duoi, %) — Kiểm soát độ chính xác ngay tại khâu xuất kho trước khi xe lăn bánh.
```

**B**

```
Mục tiêu (cam-ket): Tối ưu khâu vận hành kho để giảm chi phí trên mỗi đơn xuất — vì sao lúc này: Cấp trên đang giảm chi phí vận tải trên mỗi đơn từ 42 xuống 36 nghìn đồng, đòi hỏi kho phải rút ngắn thời gian chờ của xe và chuẩn bị hàng chính xác. — Khâu chuẩn bị và xuất kho đóng góp trực tiếp vào mục tiêu tối ưu chi phí mỗi chuyến mà cấp trên đang theo đuổi.
  - Căn chỉnh tới: Chi phí vận tải trên mỗi đơn giảm từ 42 xuống 36 nghìn đồng
  - KR: Thời gian xuất kho trung bình cho mỗi chuyến xe (giam-xuong, phút, khởi điểm 36) — Rút ngắn thời gian chờ tại cửa kho giúp xe quay vòng nhanh hơn mà không cần tăng thêm xe.
  - KR: Tỷ lệ đơn hàng sẵn sàng đúng giờ hẹn đón của xe (tang-toi, %) — Đảm bảo xe đến là có hàng bốc ngay, triệt tiêu thời gian chờ lãng phí.
  - KR: Tỷ lệ hao hụt hàng hóa trong kho lạnh (giu-duoi, %, khởi điểm 0.8) — Giữ chi phí hao hụt không tăng lên khi đẩy nhanh tiến độ xuất kho.
Mục tiêu (cam-ket): Bảo đảm chất lượng bảo quản và độ chính xác xuất kho cho các chuyến giao đúng hẹn — vì sao lúc này: Công ty yêu cầu giao đúng hẹn 96% và giữ chuỗi lạnh liền mạch xuyên suốt từ kho đến xe. — Chất lượng đóng gói và nhiệt độ xuất kho bảo vệ tỷ lệ giao hàng thành công đến tay đối tác.
  - Căn chỉnh tới: Tỷ lệ đơn giao đúng hẹn
  - KR: Tỷ lệ lệch tồn kho qua các kỳ kiểm kê (giu-duoi, %, khởi điểm 0.4) — Kiểm soát tồn kho chính xác để không xuất nhầm hoặc thiếu hàng làm phát sinh chuyến bù.
  - KR: Tỷ lệ lô hàng đạt chuẩn nhiệt độ quy định khi bàn giao lên xe lạnh (giu-tren, %) — Bảo đảm chuỗi lạnh liền mạch, tránh hàng bị đối tác từ chối nhận tại điểm giao.
```

### Cặp 2 — bp-kinh-doanh#v1

**A**

```
Mục tiêu (cam-ket): Giữ vững và mở rộng hợp tác bền chặt với các đối tác lớn hiện hữu — vì sao lúc này: Cấp trên ưu tiên giữ tỷ lệ đối tác gia hạn và bảo toàn nguồn lực hiện có cho mùa cao điểm. — Giữ chân đối tác lớn là nền tảng vững chắc để duy trì nguồn thu trong bối cảnh nhân sự và ngân sách không đổi.
  - Căn chỉnh tới: Trở thành đối tác logistics được chọn đầu tiên ở hai miền
  - KR: Tỷ lệ đối tác gia hạn hợp đồng (giu-tren, %, khởi điểm 88.4) — Đo lường trực tiếp mức độ giữ chân đối tác hiện hữu của khối mà không cần tăng chi phí tìm kiếm mới.
  - KR: Số đối tác chuỗi bán lẻ lớn duy trì hợp đồng ổn định (tang-toi, đối tác) — Bảo đảm tệp đối tác bán lẻ trọng điểm tiếp tục đồng hành lâu dài.
  - KR: Số khiếu nại về chất lượng dịch vụ vận chuyển từ đối tác mỗi tháng (giu-duoi, khiếu nại, khởi điểm 19.2) — Đối trọng chất lượng dịch vụ để việc chăm sóc và giữ chân đối tác thực chất, không bị than phiền.
Mục tiêu (cam-ket): Đồng hành bảo đảm tiến độ giao hàng đúng hẹn trên các tuyến cam kết — vì sao lúc này: Giao trễ là nguyên nhân chính khiến đối tác rời bỏ, cần sự phối hợp sát sao của kinh doanh với đối tác ngay từ đầu tuyến. — Giao đúng hẹn là lời hứa cốt lõi giúp giữ chân đối tác và ngăn ngừa việc đối tác rời bỏ.
  - Căn chỉnh tới: Giao đúng hẹn ở mọi tuyến
  - KR: Tỷ lệ chuyến giao đúng hẹn cho các tuyến đối tác trọng điểm (phan-tram, %, khởi điểm 92.4) — Đo lường trực tiếp cam kết giao hàng đúng mốc giờ đã ký với đối tác.
  - KR: Tỷ lệ chuyến hàng lạnh duy trì chuẩn nhiệt độ suốt hành trình (phan-tram, %) — Đối trọng kỹ thuật bảo đảm an toàn hàng hóa, giữ uy tín cam kết chất lượng với chuỗi bán lẻ.
```

**B**

```
Mục tiêu (cam-ket): Gia tăng sự gắn kết bền vững và giữ chân trọn vẹn nhóm đối tác lớn — vì sao lúc này: Bối cảnh nguồn lực không tăng đòi hỏi phải giữ vững nền tảng hợp tác hiện có để tạo chỗ dựa ổn định. — Tập trung bảo vệ và phát triển mối quan hệ với các đối tác chủ lực của đơn vị.
  - KR: Tỷ lệ tái ký thỏa thuận hợp tác từ nhóm đối tác lớn (tang-toi, %) — Đảm bảo các đối tác trọng điểm tiếp tục đồng hành lâu dài cùng đơn vị.
  - KR: Điểm hài lòng trung bình của các đối tác lớn trong kỳ đánh giá (tang-toi, điểm) — Đo lường chất lượng mối quan hệ và sự tín nhiệm thực tế từ phía đối tác lớn.
  - KR: Tỷ lệ đối tác lớn ghi nhận phản ánh chưa được giải quyết dứt điểm (giu-duoi, %) — Giữ vai trò đối trọng nhằm phát hiện sớm nguy cơ suy giảm niềm tin của đối tác.
Mục tiêu (cam-ket): Nâng cao kỷ luật thực thi để bàn giao chuẩn xác và đúng hẹn mọi cam kết — vì sao lúc này: Không bổ sung nhân sự buộc đơn vị phải chuẩn hóa tiến độ và tối ưu hiệu suất phối hợp ngay trong quý này. — Xây dựng uy tín thông qua việc tuân thủ tuyệt đối các cam kết về thời gian giao vận.
  - KR: Tỷ lệ các mốc bàn giao được thực hiện đúng thời hạn đã cam kết (tang-toi, %) — Chứng minh năng lực đáp ứng chuẩn xác các nội dung đã thống nhất với đối tác.
  - KR: Tỷ lệ cam kết hoàn thành trong phạm vi hạn mức chi tiêu hiện hữu (tang-toi, %) — Đảm bảo việc giữ tiến độ không gây đội chi phí trong điều kiện ngân sách cố định.
  - KR: Tỷ lệ nội dung bàn giao phải điều chỉnh hoặc xử lý lại sau tiếp nhận (giu-duoi, %) — Giữ vai trò đối trọng chất lượng, tránh việc đẩy nhanh tiến độ làm ảnh hưởng đến độ chuẩn xác.
```

### Cặp 3 — pb-kho-van#v3

**A**

```
Mục tiêu (cam-ket): Nâng cao năng lực vận hành ba kho lạnh đảm bảo xuất kho nhanh và chuẩn xác — vì sao lúc này: Quý trước thời gian xuất kho chưa đạt mức mong muốn và cần giải quyết dứt điểm tình trạng hao hụt phát sinh. — Đảm bảo năng lực cốt lõi của kho vận nhằm hỗ trợ trực tiếp cam kết giao đúng hẹn của công ty.
  - Căn chỉnh tới: Giao đúng hẹn ở mọi tuyến
  - KR: Thời gian xuất kho trung bình tại ba kho lạnh (giam-xuong, phút, khởi điểm 36) — Rút ngắn thời gian chuẩn bị hàng tại kho giúp xe xuất bến kịp giờ giao đến các điểm hẹn.
  - KR: Tỷ lệ lệch tồn kho qua các kỳ kiểm kê cuốn chiếu (giu-duoi, %, khởi điểm 0.4) — Đảm bảo độ chính xác của tồn kho để tránh chậm trễ và sai sót khi xuất hàng.
  - KR: Tỷ lệ hao hụt hàng hóa tại ba kho lạnh (giu-duoi, %, khởi điểm 0.8) — Giữ phẩm chất hàng hóa và bảo vệ giá trị lưu kho trước biến động nhiệt độ.
Mục tiêu (tham-vong): Chuẩn bị sẵn sàng điều kiện kho bãi tiếp nhận và giữ vững dịch vụ cho các đối tác mới — vì sao lúc này: Cấp trên mở rộng hợp tác chuỗi lạnh mới đòi hỏi kho vận phải đáp ứng chuẩn lưu trữ và xử lý hàng hóa khắt khe. — Chất lượng dịch vụ kho ổn định là yếu tố giữ chân đối tác lâu dài mà không cần tăng chi phí tiếp thị.
  - Căn chỉnh tới: Trở thành đối tác logistics được chọn đầu tiên ở hai miền
  - KR: Tỷ lệ đơn hàng từ các đối tác mới được xử lý xuất kho đúng tiêu chuẩn kỹ thuật ngay lần đầu (giu-tren, %) — Đảm bảo chất lượng tiếp nhận và lưu trữ giúp giữ chân đối tác mà không phát sinh thêm chi phí tiếp thị.
  - KR: Số khiếu nại về bảo quản và đóng gói từ đối tác mới phát sinh mỗi tháng (giu-duoi, khiếu nại) — Kiểm soát phản hồi dịch vụ kho để bảo vệ uy tín vận hành của đơn vị.
```

**B**

```
Mục tiêu (cam-ket): Nâng cao chất lượng lưu kho và độ tin cậy trong quản lý hàng hoá — vì sao lúc này: Hàng hóa cần được quản lý chuẩn xác trước khi tiếp nhận các luồng vận hành mới. — Công việc cốt lõi của kho vận cần duy trì nền tảng ổn định và chuẩn xác.
  - KR: Tỷ lệ tồn kho đối soát khớp thực tế (tang-toi, %) — Đảm bảo hàng hóa lưu kho luôn minh bạch và chuẩn xác để đáp ứng kịp thời cho vận hành.
  - KR: Tỷ lệ hàng hóa suy hao hoặc hỏng hóc trong lưu kho (giam-xuong, %) — Giữ chất lượng bảo quản hàng hóa trong ngưỡng an toàn khi vận hành hàng ngày.
Mục tiêu (tham-vong): Mở rộng mạng lưới đối tác vận chuyển tại các tuyến năng lực còn yếu — vì sao lúc này: Đơn vị đang thiếu hụt đối tác tin cậy ở mảng trọng yếu cần bổ sung ngay trong quý. — Bổ sung đối tác chuyên trách giúp giải quyết các nút thắt vận chuyển hiện tại.
  - KR: Số đối tác cung ứng dịch vụ vận tải mới ký kết hợp tác (tang-toi, đối tác) — Tăng cường năng lực vận chuyển ở các tuyến vận chuyển còn yếu.
  - KR: Tỷ lệ chi phí quảng bá trên tổng ngân sách phát triển đối tác (giu-duoi, %) — Đảm bảo tuân thủ ràng buộc không làm tăng ngân sách tiếp thị khi tìm kiếm đối tác mới.
  - KR: Tỷ lệ đơn vận chuyển qua đối tác mới hoàn thành đúng thời hạn cam kết (giu-tren, %) — Đối trọng chất lượng nhằm bảo đảm đối tác mới vận hành hiệu quả và đúng chuẩn.
```

### Cặp 4 — pb-tai-chinh#v3

**A**

```
Mục tiêu (cam-ket): Mở rộng mạng lưới đối tác tại mảng còn yếu nhưng giữ vững kỷ luật chi phí — vì sao lúc này: Đơn vị cần cải thiện vị thế ở mảng yếu ngay kỳ này nhưng phải tuân thủ nghiêm ngặt mức trần chi phí. — Tạo đà tăng trưởng tại phân khúc còn hạn chế mà không làm phát sinh thêm gánh nặng tài chính.
  - KR: Số đối tác mới ký kết hợp tác tại phân khúc còn yếu (tang-toi, người liên hệ) — Đo lường trực tiếp kết quả mở rộng mạng lưới liên kết bên ngoài tại mảng còn hạn chế.
  - KR: Tổng chi phí giải ngân tiếp thị trong kỳ (giu-duoi, đồng) — Giữ vai trò đối trọng nhằm đảm bảo việc mở rộng không vượt quá ngân sách tiếp thị đã đề ra.
Mục tiêu (cam-ket): Nâng cao hiệu quả quản trị nguồn vốn và bảo đảm an toàn thanh khoản — vì sao lúc này: Quản trị dòng tiền là nền tảng cần duy trì song song với các hoạt động mở rộng liên kết mới. — Thực hiện vai trò cốt lõi của mảng tài chính nhằm bảo đảm nguồn lực luôn ổn định cho tổ chức.
  - KR: Thời gian chu kỳ quay vòng dòng tiền hoạt động (giam-xuong, ngày) — Đảm bảo thanh khoản và hiệu quả sử dụng nguồn vốn cốt lõi của đơn vị tài chính.
  - KR: Tỷ lệ báo cáo quản trị tài chính được đối soát khớp đúng hạn (giu-tren, phan-tram) — Đóng vai trò đối trọng kiểm soát chất lượng dữ liệu và hạn chế sai sót khi vận hành tài chính.
```

**B**

```
Mục tiêu (cam-ket): Bảo đảm an toàn dòng tiền và chuẩn hóa báo cáo tài chính quản trị — vì sao lúc này: Chu kỳ trước công nợ quá hạn còn ở mức 12%, cần kiểm soát chặt để sẵn sàng nguồn lực tài chính cho công ty mở rộng. — Đảm bảo chức năng cốt lõi của phòng Tài chính về kế toán, dòng tiền và công nợ để toàn bộ công ty vận hành ổn định.
  - KR: Tỷ lệ công nợ quá hạn của các đối tác (giam-xuong, %, khởi điểm 12) — Thu hồi công nợ đúng hạn giúp bảo toàn dòng tiền phục vụ mở rộng kinh doanh mà không bị đọng vốn.
  - KR: Thời gian hoàn thành báo cáo quản trị và chốt sổ hằng tháng (giu-duoi, ngày, khởi điểm 5) — Giữ vững tiến độ chốt sổ giúp ban giám đốc có số liệu kịp thời để điều hành vận hành.
Mục tiêu (tham-vong): Đồng hành mở rộng mạng lưới đối tác mới thông qua cơ chế thẩm định và thanh toán linh hoạt — vì sao lúc này: Công ty đang đẩy mạnh phát triển thị trường hai miền trong khi phòng bị ràng buộc không tăng ngân sách tiếp thị. — Hỗ trợ mục tiêu tăng trưởng đối tác mới của cấp trên bằng các giải pháp tín dụng và thanh toán tối ưu trong giới hạn ngân sách.
  - Căn chỉnh tới: Trở thành đối tác logistics được chọn đầu tiên ở hai miền
  - KR: Thời gian phê duyệt hạn mức tín dụng và thẩm định tài chính cho đối tác mới (giam-xuong, ngày) — Rút ngắn thời gian thẩm định giúp công ty ký kết nhanh chóng với đối tác mới mà không tốn thêm ngân sách tiếp thị.
  - KR: Tỷ lệ nợ khó đòi phát sinh từ các hợp đồng đối tác mới ký trong quý (giu-duoi, %) — Đảm bảo việc nới lỏng hoặc đẩy nhanh thẩm định đối tác mới không làm tổn hại đến chất lượng tín dụng và an toàn tài chính.
```

### Cặp 5 — pb-tai-chinh#v1

**A**

```
Mục tiêu (cam-ket): Thực thi thanh toán và đối soát chuẩn xác để giữ vững niềm tin của đối tác lớn — vì sao lúc này: Đáp ứng yêu cầu duy trì quan hệ đối tác chiến lược mà không cần tăng biên chế hay tăng ngân sách vận hành — Giữ chân đối tác lớn thông qua cam kết chi trả đúng hạn và loại bỏ trục trặc đối soát
  - KR: Tỷ lệ hồ sơ thanh toán cho đối tác lớn được xử lý đúng hạn cam kết (phan-tram, %) — Đảm bảo nhịp giao dịch thông suốt để đối tác duy trì sự gắn kết và giao hàng đúng hẹn
  - KR: Tỷ lệ đối tác lớn phản hồi khiếu nại về công nợ hoặc chậm chi trả (giam-xuong, %) — Đo lường mức độ hài lòng và ngăn ngừa nguy cơ rạn nứt quan hệ hợp tác
  - KR: Tỷ lệ hồ sơ chứng từ tài chính đạt yêu cầu kiểm soát ngay lần nộp đầu (phan-tram, %) — Giữ chuẩn chất lượng đối soát nội bộ và không làm phát sinh thêm việc cho nhân sự hiện tại
Mục tiêu (cam-ket): Kiểm soát chặt chẽ ngân sách và tối ưu dòng tiền trong giới hạn nguồn lực hiện có — vì sao lúc này: Cần duy trì kỷ luật chi tiêu khi toàn đơn vị phải giữ vững cam kết giao nhận và quan hệ đối tác — Giữ ổn định tài chính dưới điều kiện không thêm nhân sự và giữ nguyên mức chi phí
  - KR: Tỷ lệ chi phí vận hành thực tế so với hạn mức ngân sách quý trước (giu-duoi, %) — Đảm bảo tuân thủ nghiêm ngặt ràng buộc giữ nguyên ngân sách hoạt động
  - KR: Tỷ lệ báo cáo dự báo dòng tiền định kỳ được phát hành đúng lịch đến các bên liên quan (phan-tram, %) — Cung cấp dữ liệu chủ động để điều phối nguồn tiền cho các đợt giao nhận lớn
```

**B**

```
Mục tiêu (cam-ket): Tối ưu quản trị công nợ và đồng hành giữ chân đối tác chiến lược — vì sao lúc này: Cấp trên đang đặt trọng tâm giữ tỷ lệ đối tác gia hạn trên 85% trong bối cảnh đơn vị không tăng ngân sách. — Đảm bảo dòng tiền quay vòng kịp thời phục vụ vận tải mà không làm gián đoạn trải nghiệm của đối tác lớn.
  - Căn chỉnh tới: Giữ tỷ lệ đối tác gia hạn trên 85%
  - KR: Tỷ lệ công nợ quá hạn của các đối tác lớn (giam-xuong, %, khởi điểm 12) — Giúp dòng tiền về đúng hạn mà vẫn giữ được quan hệ hợp tác lâu dài.
  - KR: Tỷ lệ đối tác đối soát hóa đơn đúng hạn chu kỳ (giu-tren, %, khởi điểm 87) — Đảm bảo chứng từ thanh toán thông suốt để đối tác an tâm gia hạn dịch vụ.
Mục tiêu (cam-ket): Kiểm soát chi phí vận hành và bảo đảm nhịp báo cáo quản trị phục vụ giao hàng đúng hẹn — vì sao lúc này: Chi phí mỗi đơn cần giảm theo yêu cầu cấp trên trong khi toàn đội không bổ sung nhân lực. — Hỗ trợ khối vận hành theo dõi sát chi phí từng đơn mà vẫn giữ nguyên định biên nhân sự.
  - Căn chỉnh tới: Chi phí vận tải trên mỗi đơn giảm từ 42 xuống 36 nghìn đồng
  - KR: Số ngày hoàn tất đóng sổ kế toán và báo cáo quản trị tháng (giu-duoi, ngày, khởi điểm 5) — Cung cấp số liệu chi phí kịp thời để ban điều hành điều chỉnh tuyến vận tải.
  - KR: Chi phí vận hành khối văn phòng tính trên mỗi đơn vận chuyển (giam-xuong, nghìn đồng, khởi điểm 40.3) — Giữ kỷ luật ngân sách không đổi và không tuyển thêm người trong mùa cao điểm.
```

| Cặp | Judge chọn | Người chọn | Khớp |
|---|---|---|---|
| 1 | (trong eval-soan-khoa.json) |  |  |
| 2 | (trong eval-soan-khoa.json) |  |  |
| 3 | (trong eval-soan-khoa.json) |  |  |
| 4 | (trong eval-soan-khoa.json) |  |  |
| 5 | (trong eval-soan-khoa.json) |  |  |
