# Bằng chứng eval soạn OKR — 2026-09-30T22:26:22.150Z

Lần chạy: `apps/agent-okr/.eve/evals/2026-09-30T22-26-21` · mã thoát eve eval: 1 · 21 đạt · 7 hỏng · 2 dưới ngưỡng · 0 bỏ qua / 30

| Eval | Kết quả | Ghi chú |
|---|---|---|
| okr-soan/soan-boi-canh/0000 | failed |  |
| okr-soan/soan-boi-canh/0001 | passed |  |
| okr-soan/soan-boi-canh/0002 | passed |  |
| okr-soan/soan-boi-canh/0003 | failed |  |
| okr-soan/soan-boi-canh/0004 | passed |  |
| okr-soan/soan-boi-canh/0005 | passed |  |
| okr-soan/soan-boi-canh/0006 | passed |  |
| okr-soan/soan-boi-canh/0007 | failed |  |
| okr-soan/soan-boi-canh/0008 | failed |  |
| okr-soan/soan-boi-canh/0009 | passed |  |
| okr-soan/soan-boi-canh/0010 | passed |  |
| okr-soan/soan-boi-canh/0011 | failed |  |
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
| okr-soan/soan/0000 | passed |  |
| okr-soan/soan/0001 | failed |  |
| okr-soan/soan/0002 | failed |  |
| okr-soan/soan/0003 | scored |  |
| okr-soan/soan/0004 | scored |  |

## Bảng số

| Số đo | Giá trị | Ngưỡng |
|---|---|---|
| p50 mỗi lượt (ms) | 9273 | ≤ 12000 |
| p90 mỗi lượt (ms) | 19692 | ≤ 20000 |
| chi phí lớn nhất mỗi cuộc (USD) | 0.0371 | ≤ 0.25 |
| p90 lượt 1–2 / lượt 3–4 (ms) | 20279 / 15562 | — |
| tỷ lệ bản có gói thắng judge mù | 100 % (10/10 ca chấm được; khoảng tin cậy 95 % 72–100 %) | ≥ 70 % |
| số cặp A/B judge mù (đã chạy / chấm được) | 15 / 10 | ≥ 15 (`TDX_SO_CAP_AB`, ước 0.07 USD/cặp) |
| ca judge không chấm được | onehub#v1, pb-kho-van#v1, pb-kd-bac#v2, pb-kho-van#v2, bp-kinh-doanh#v3 | 0 |
| tổng chi phí tác nhân của lượt đo (USD, AiChiPhi; chưa gồm judge) | 0.4983 | trần 2 |

## Lượt chậm hơn ngưỡng p90

| Cuộc | Ca | Lượt | ms | Số bước | Mô hình (ms) | Công cụ (ms) | Còn lại (ms) |
|---|---|---|---|---|---|---|---|
| 3 | pb-kd-bac | 4 | 67650 | 2 | 67501 | 30 | 119 |
| 5 | pb-tai-chinh | 2 | 24122 | 2 | 24001 | 36 | 85 |
| 10 | pb-tai-chinh | 1 | 30911 | 1 | 30739 | 0 | 172 |

## Soạn theo đơn vị

| Ca | Cuộc | USD | Dòng bị loại |
|---|---|---|---|
| onehub | cmuoo6toe001as9cfafrmverc | 0.0345 | 0 |
| bp-kinh-doanh | cmuoo7vqj001bs9cfvfek909c | 0.0328 | 0 |
| pb-kd-bac | cmuoo9avq001cs9cfm1ehvi5b | 0.0331 | 0 |
| pb-kho-van | cmuooams3001ds9cfw2qcj0yo | 0.0328 | 0 |
| pb-tai-chinh | cmuoobssj001es9cfaeq9h3x3 | 0.0287 | 0 |

## Chấm của chủ kho (E24)

Mỗi cặp dưới đây là hai bản nháp cho cùng đơn vị: một bản có gói bối cảnh, một bản không. Chọn bản tốt hơn theo sáu tiêu chí (căn chỉnh với Mục tiêu cấp trên; dùng đúng khởi điểm từ kỳ trước và số CRM; KR đo kết quả, không đo việc; có đối trọng; không số đích bịa, đích để trống; phù hợp đơn vị). Phía có gói và lựa chọn của judge nằm ở `evidence/eval-soan-khoa.json` — mở sau khi chấm.

### Cặp 1 — pb-tai-chinh#v1

**A**

```
Mục tiêu (cam-ket): Kiểm soát chặt chẽ công nợ và dòng tiền để giữ chân các đối tác gắn bó lâu dài — vì sao lúc này: Kỳ trước công nợ quá hạn còn ở mức 12% do các đối tác lớn trả chậm, cần giải tỏa áp lực dòng tiền mà không phát sinh thêm chi phí. — Quản trị dòng tiền minh bạch và nhịp nhàng hỗ trợ trực tiếp cho cam kết duy trì tỷ lệ đối tác gia hạn.
  - Căn chỉnh tới: Giữ tỷ lệ đối tác gia hạn trên 85%
  - KR: Tỷ lệ công nợ quá hạn của các đối tác lớn giảm xuống (giam-xuong, %, khởi điểm 12) — Rút kinh nghiệm từ quý trước để nhắc nợ sớm trước hạn và giữ tỷ lệ thanh toán lành mạnh.
  - KR: Thời gian hoàn tất đối soát công nợ với đối tác mỗi kỳ giữ dưới mức quy định (giu-duoi, ngày) — Đối soát nhanh và chuẩn xác giúp giải quyết vướng mắc chứng từ để đối tác yên tâm tiếp tục đồng hành.
Mục tiêu (cam-ket): Tối ưu quy trình kế toán quản trị để hỗ trợ vận hành đúng hạn và tiết giảm chi phí — vì sao lúc này: Khối văn phòng không bổ sung nhân sự nên cần giữ quy trình chuẩn mực và ngân sách ổn định như kỳ trước. — Cung cấp dữ liệu chi phí kịp thời giúp toàn hệ thống theo dõi chi phí chuyến và tối ưu hiệu quả giao nhận.
  - Căn chỉnh tới: Chi phí vận tải trên mỗi đơn giảm từ 42 xuống 36 nghìn đồng
  - KR: Thời gian chốt sổ kế toán tháng giữ dưới mốc quy định (giu-duoi, ngày, khởi điểm 5) — Duy trì kỷ luật chốt sổ đã đạt được từ quý trước để ban điều hành có số liệu điều phối kịp thời.
  - KR: Tỷ lệ vượt ngân sách chi phí vận hành khối văn phòng giữ dưới ngưỡng cho phép (giu-duoi, %) — Kiểm soát chi phí theo đúng ngân sách quý trước để đáp ứng yêu cầu vận hành gọn mà không tuyển thêm nhân sự.
```

**B**

```
Mục tiêu (cam-ket): Đảm bảo đồng hành bền chặt với các đối tác lớn thông qua vận hành tài chính chuẩn xác và đúng hạn — vì sao lúc này: Cần duy trì sự ổn định và tín nhiệm từ các đối tác lớn trong bối cảnh nguồn lực không đổi. — Giữ chân đối tác lớn là ưu tiên hàng đầu của đơn vị trong chu kỳ này.
  - KR: Tỷ lệ hợp tác tiếp tục duy trì sau kỳ hạn (phan-tram, %) — Đo lường mức độ tin tưởng và sự gắn bó lâu dài của các đối tác trọng điểm.
  - KR: Tỷ lệ đối soát và thanh toán hoàn tất đúng hẹn (phan-tram, %) — Giữ vững cam kết về thời gian để củng cố uy tín với các đối tác lớn.
Mục tiêu (cam-ket): Tối ưu hóa hiệu quả vận hành tài chính trong phạm vi nguồn lực và ngân sách hiện tại — vì sao lúc này: Đơn vị hoạt động dưới ràng buộc nghiêm ngặt về nhân sự và chi phí quý này. — Đáp ứng khối lượng công việc và chất lượng cam kết mà không làm tăng định biên hay ngân sách.
  - KR: Tỷ lệ chênh lệch chi phí so với ngân sách quý trước (giu-duoi, %) — Đảm bảo hoạt động trong trần ngân sách hiện có như yêu cầu.
  - KR: Quy trình vận hành phối hợp nội bộ được tinh giản và thống nhất áp dụng (moc, moc) — Nâng cao năng suất xử lý mà không cần bổ sung nhân sự.
```

### Cặp 2 — pb-kho-van#v2

**A**

```
Mục tiêu (cam-ket): Tối ưu hóa hiệu quả và chi phí trên từng chuyến vận chuyển với đội xe hiện hữu — vì sao lúc này: Cần kiểm soát chi phí vận hành ngay trong kỳ này để tạo nền tảng hiệu quả lâu dài cho đội xe. — Giúp đơn vị giảm bớt gánh nặng chi phí vận hành mà vẫn tận dụng tối đa năng lực vận tải sẵn có.
  - KR: Tỷ lệ lấp đầy thể tích phương tiện trên mỗi chuyến vận chuyển (phan-tram, %) — Nâng cao hệ số sử dụng phương tiện giúp chuyên chở được nhiều hơn trong cùng một lượt di chuyển.
  - KR: Chi phí vận hành bình quân trên mỗi chuyến xe (giam-xuong, đồng/chuyến) — Trực tiếp đo lường kết quả tiết kiệm chi phí chuyến với đội xe hiện có.
  - KR: Quãng đường di chuyển bình quân cho mỗi lượt giao hàng hoàn tất (giam-xuong, km/chuyến) — Tối ưu lộ trình giúp rút ngắn cự ly di chuyển và tiết kiệm nhiên liệu.
Mục tiêu (cam-ket): Bảo đảm chất lượng dịch vụ giao hàng ổn định trong quá trình tinh gọn vận hành — vì sao lúc này: Song hành với việc tiết kiệm chi phí, tiêu chuẩn giao hàng cần được bảo vệ để không gây gián đoạn chuỗi cung ứng. — Đảm bảo việc cắt giảm chi phí chuyến không làm giảm sút uy tín và cam kết tiến độ.
  - KR: Tỷ lệ chuyến hàng được bàn giao đúng giờ theo lịch hẹn (giu-tren, %) — Đảm bảo việc siết chặt chi phí không ảnh hưởng đến độ tin cậy và tốc độ giao hàng.
  - KR: Tỷ lệ hàng hóa bàn giao nguyên vẹn không phát sinh hư hỏng, thất thoát (giu-tren, %) — Bảo vệ tiêu chuẩn bảo quản và an toàn hàng hóa trong suốt hành trình.
  - KR: Tỷ lệ đơn hàng phát sinh khiếu nại về chất lượng vận chuyển (giu-duoi, %) — Theo dõi phản hồi để kịp thời khắc phục các sự cố phát sinh ngoài ý muốn.
```

**B**

```
Mục tiêu (cam-ket): Tối ưu hóa quy trình kho nhằm hỗ trợ hạ chi phí chuyến xe mà vẫn bảo đảm chuẩn bảo quản — vì sao lúc này: Đơn vị cần phối hợp cùng mục tiêu hạ chi phí trên mỗi đơn của cấp trên trong điều kiện giữ nguyên đội xe. — Hoạt động kho trơn tru và chuẩn xác giúp giảm chi phí chung mà không ảnh hưởng chất lượng.
  - Căn chỉnh tới: Chi phí vận tải trên mỗi đơn giảm từ 42 xuống 36 nghìn đồng
  - KR: Thời gian xuất kho trung bình mỗi chuyến (giam-xuong, phút, khởi điểm 36) — Rút ngắn thời gian xử lý tại kho giúp xe xuất bến nhanh và tối ưu chi phí vận hành.
  - KR: Tỷ lệ hao hụt hàng hóa tại ba kho lạnh (giu-duoi, %, khởi điểm 0.8) — Hạn chế hư hỏng và giữ vững chất lượng bảo quản trong suốt thời gian lưu kho.
  - KR: Tỷ lệ lệch tồn kho qua kiểm kê cuốn chiếu hằng ngày (giu-duoi, %, khởi điểm 0.4) — Duy trì số liệu tồn kho chính xác để việc xếp hàng lên xe không bị chậm trễ.
Mục tiêu (tham-vong): Bảo đảm tiến độ xuất hàng chuẩn xác tuyệt đối để giữ nhịp giao đúng hẹn — vì sao lúc này: Giao đúng hẹn là cam kết hàng đầu giúp giữ chân đối tác lâu dài ở cả hai miền. — Thời gian chuẩn bị hàng tại kho quyết định lớn tới tỷ lệ giao hàng đúng giờ của toàn hệ thống.
  - Căn chỉnh tới: Tỷ lệ đơn giao đúng hẹn
  - KR: Tỷ lệ chuyến xe hoàn tất bốc dỡ và xuất kho đúng khung giờ hẹn (phan-tram, %) — Xe rời kho đúng giờ là điều kiện tiên quyết để hành trình giao hàng không bị trễ.
  - KR: Số sự cố gián đoạn nhiệt độ bảo quản tại ba kho lạnh (giu-duoi, sự cố) — Đảm bảo chuỗi lạnh liền mạch ngay từ khâu lưu trữ và bốc dỡ lên xe.
```

### Cặp 3 — bp-kinh-doanh#v3

**A**

```
Mục tiêu (cam-ket): Mở rộng tệp đối tác vận tải lạnh tại hai miền — vì sao lúc này: Mảng vận chuyển lạnh đang mở ra triển vọng lớn sau khi đối thủ rút lui và cần phát triển ngay trong quý này. — Tập trung phát triển đối tác mới trong mảng vận chuyển lạnh nhằm nắm bắt thời cơ thị trường.
  - Căn chỉnh tới: Số đối tác hàng lạnh đang chạy tăng từ 12 lên 30
  - KR: Số đối tác mới ký kết hợp đồng trong phân khúc hàng lạnh (tang-toi, đối tác) — Đo lường trực tiếp kết quả phát triển tệp đối tác ở mảng hàng lạnh trọng điểm.
  - KR: Số chuỗi bán lẻ và cửa hàng tiện lợi mới bắt đầu vận hành thử nghiệm (tang-toi, chuỗi) — Gia tăng số lượng chuỗi bán lẻ theo định hướng ưu tiên của công ty.
Mục tiêu (tham-vong): Gia tăng hiệu quả chuyển đổi hợp đồng mới tối ưu chi phí tiếp thị — vì sao lúc này: Đơn vị cần tìm kiếm phương thức phát triển đối tác hiệu quả trong điều kiện ngân sách marketing được giữ cố định. — Khai thác tối đa nguồn liên hệ hiện hữu và mạng lưới giới thiệu để tăng trưởng hợp đồng mà không tăng ngân sách.
  - Căn chỉnh tới: Doanh thu hợp đồng mới đạt 48 tỷ đồng
  - KR: Tỷ lệ chuyển đổi từ liên hệ hợp tác ban đầu sang hợp đồng chính thức (tang-toi, %) — Tối ưu hóa năng lực chuyển đổi từ nguồn tiếp cận sẵn có mà không phát sinh thêm chi phí quảng bá.
  - KR: Tỷ lệ hợp đồng ký mới đến từ sự giới thiệu của đối tác hiện hữu (tang-toi, %) — Tận dụng uy tín sẵn có để có thêm hợp đồng mới mà không tốn chi phí tiếp thị.
```

**B**

```
Mục tiêu (cam-ket): Mở rộng mạng lưới đối tác mới ở mảng còn yếu mà không gia tăng chi phí tiếp thị — vì sao lúc này: Đơn vị cần bổ sung năng lực cho mảng còn yếu ngay trong quý mà vẫn kiểm soát chặt chẽ ngân sách. — Tạo bước đột phá cho mảng trọng điểm và tối ưu hóa nguồn lực sẵn có của đơn vị.
  - KR: Số lượng đối tác mới ký kết hợp tác ở mảng còn yếu (tang-toi, đối tác) — Đo lường trực tiếp kết quả mở rộng đối tác theo đúng trọng tâm ưu tiên.
  - KR: Số cuộc trao đổi chuyên sâu được thiết lập với các đối tác tiềm năng (tang-toi, cuộc hẹn) — Đảm bảo nguồn tiếp cận đầu vào chất lượng trước khi đi đến thỏa thuận.
  - KR: Tỉ lệ đối tác tiềm năng chuyển đổi thành đối tác chính thức (phan-tram, tỉ lệ %) — Tối ưu hiệu quả tiếp cận để không cần phụ thuộc vào việc tăng ngân sách truyền thông.
Mục tiêu (tham-vong): Nâng cao năng lực tiếp cận tự thân và hiệu suất chốt hợp tác của đội ngũ — vì sao lúc này: Quy trình tinh gọn và năng lực nội tại vững vàng là chìa khóa để duy trì đà tăng trưởng bền vững. — Giúp đội ngũ tự chủ khai thác đối tác mới hiệu quả trong điều kiện ngân sách giữ nguyên.
  - KR: Thời gian phản hồi và hoàn thiện thỏa thuận hợp tác với đối tác (giam-xuong, ngày) — Rút ngắn thời gian xúc tiến nhằm nâng cao trải nghiệm hợp tác và tăng tốc độ chốt kết quả.
  - KR: Hoàn thành bộ tài liệu và quy trình tiếp cận chuẩn dành riêng cho mảng mới (moc, mốc) — Chuẩn hóa tài liệu để đội ngũ tiếp cận đối tác hiệu quả mà không cần chi tiêu tiếp thị thêm.
```

### Cặp 4 — pb-tai-chinh#v3

**A**

```
Mục tiêu (cam-ket): Bảo đảm dòng tiền và kiểm soát chặt chẽ công nợ đối tác mới — vì sao lúc này: Công nợ quá hạn chu kỳ trước còn ở mức 12%, cần kiểm soát chặt khi đưa thêm các đối tác mới vào vận hành. — Dòng tiền thông suốt tạo nguồn lực trực tiếp để công ty mở rộng thị phần mà không phụ thuộc vào tăng ngân sách.
  - Căn chỉnh tới: Trở thành đối tác logistics được chọn đầu tiên ở hai miền
  - KR: Tỷ lệ công nợ quá hạn của các đối tác mới và hiện hữu giảm xuống (giam-xuong, %, khởi điểm 12) — Kiểm soát dòng tiền về đúng hạn từ các hợp đồng mới mà không làm phát sinh rủi ro nợ xấu.
  - KR: Thời gian thẩm định và phê duyệt điều khoản thanh toán cho đối tác mới giữ dưới mức quy định (giu-duoi, ngày) — Hỗ trợ ký kết nhanh các đối tác ở mảng trọng điểm nhưng vẫn đảm bảo an toàn tài chính.
Mục tiêu (cam-ket): Kiểm soát hiệu quả chi phí vận hành để hỗ trợ mở rộng đối tác — vì sao lúc này: Cấp trên đang đặt trọng tâm giao đúng hẹn đi kèm giảm chi phí đơn, cần số liệu quản trị chặt chẽ. — Giúp công ty phát triển các mảng mới trên nền tảng chi phí gọn gàng và không tăng thêm ngân sách.
  - Căn chỉnh tới: Giao đúng hẹn ở mọi tuyến
  - KR: Chi phí vận tải trên mỗi đơn giảm xuống (giam-xuong, nghìn đồng) — Tối ưu hóa định mức chi phí vận hành để bù đắp việc không tăng ngân sách xúc tiến.
  - KR: Thời gian hoàn thành chốt sổ kế toán và báo cáo quản trị chi phí mỗi tháng giữ dưới mốc quy định (giu-duoi, ngày làm việc, khởi điểm 5) — Cung cấp số liệu chi phí kịp thời để ban điều hành nhận diện điểm yếu và điều chỉnh phân bổ ngân sách.
```

**B**

```
Mục tiêu (tham-vong): Mở rộng mạng lưới đối tác mới tại mảng chiến lược còn yếu — vì sao lúc này: Mảng chiến lược đang yếu cần nhanh chóng có đối tác đồng hành để tạo đà phát triển. — Tập trung nguồn lực phát triển các mối quan hệ hợp tác mới để bù đắp điểm yếu của đơn vị.
  - KR: Số lượng đối tác mới được thiết lập hợp tác thành công (tang-toi, đối tác) — Đo lường trực tiếp kết quả mở rộng mạng lưới hợp tác tại mảng còn yếu.
  - KR: Hoàn thành khung tiêu chuẩn đánh giá và kết nối đối tác mới (moc, mốc) — Tạo cơ sở lựa chọn và làm việc hiệu quả với các bên hợp tác.
Mục tiêu (cam-ket): Kiểm soát chặt chẽ ngân sách marketing trong quá trình mở rộng đối tác — vì sao lúc này: Cần kiểm soát chi tiêu ngay từ đầu kỳ khi triển khai mở rộng mạng lưới đối tác mới. — Đảm bảo kỷ luật tài chính và tối ưu hiệu quả nguồn vốn sẵn có mà không làm tăng chi phí.
  - KR: Ngân sách marketing thực tế sử dụng được duy trì dưới mức trần quy định (giu-duoi, đồng) — Đảm bảo tuân thủ nghiêm ngặt ràng buộc không tăng chi phí quảng bá.
  - KR: Số đối tác mới kết nối thành công qua kênh hợp tác không tốn phí (tang-toi, đối tác) — Tận dụng tối đa nguồn lực sẵn có và các mối liên kết tự nhiên mà không phát sinh thêm chi phí.
```

### Cặp 5 — pb-kho-van#v1

**A**

```
Mục tiêu (cam-ket): Tối ưu tốc độ xuất kho và kiểm soát hàng hóa để đáp ứng giờ giao — vì sao lúc này: Đơn vị cần giữ cam kết giao đúng hẹn với các đối tác lớn trong điều kiện nguồn lực nhân sự giữ nguyên. — Rút ngắn thời gian vận hành kho là điều kiện tiên quyết để giữ đúng hẹn giao mà không cần bổ sung nhân sự.
  - Căn chỉnh tới: Giao đúng hẹn ở mọi tuyến
  - KR: Thời gian xuất kho trung bình tại ba kho lạnh (giam-xuong, phút, khởi điểm 36) — Rút ngắn thời gian xử lý tại kho giúp xe xuất bến kịp giờ để bảo đảm tỷ lệ giao đúng hẹn.
  - KR: Tỷ lệ lệch tồn kho qua kiểm kê cuốn chiếu mỗi ngày (giu-duoi, %, khởi điểm 0.4) — Kiểm soát tồn kho chính xác giúp việc soạn hàng không bị gián đoạn và hạn chế giao trễ.
Mục tiêu (cam-ket): Bảo đảm an toàn chuỗi lạnh để giữ vững sự tin tưởng của đối tác lớn — vì sao lúc này: Chiến lược năm yêu cầu chuỗi lạnh liền mạch và kiểm soát hao hụt kho chặt chẽ nhằm duy trì tỷ lệ gia hạn. — Chất lượng bảo quản lạnh ổn định là yếu tố then chốt giúp các đối tác tiếp tục gắn bó lâu dài.
  - Căn chỉnh tới: Giữ tỷ lệ đối tác gia hạn trên 85%
  - KR: Tỷ lệ hao hụt kho lạnh tính trên giá trị hàng (giam-xuong, %, khởi điểm 0.8) — Giảm tổn thất do nhiệt độ giúp bảo đảm chất lượng hàng cho các đối tác lớn.
  - KR: Số lượng khiếu nại liên quan đến nhiệt độ và bảo quản kho mỗi tháng (giu-duoi, khiếu nại) — Giữ khiếu nại ở mức thấp củng cố lòng tin để các bên tiếp tục gia hạn hợp đồng.
```

**B**

```
Mục tiêu (cam-ket): Nâng cao độ chuẩn xác và tốc độ xử lý xuất kho nhằm đảm bảo đúng hạn cho các đối tác lớn — vì sao lúc này: Quý này cần ưu tiên giữ chân đối tác lớn trong bối cảnh nguồn lực nhân sự giữ nguyên. — Giao hàng đúng hẹn là yếu tố then chốt để duy trì uy tín và sự gắn kết với đối tác quan trọng.
  - KR: Tỷ lệ đơn hàng giao đúng hạn cho các đối tác lớn (phan-tram, %) — Đo lường trực tiếp độ tin cậy và khả năng đáp ứng thời gian cam kết.
  - KR: Thời gian xử lý và hoàn tất thủ tục xuất kho bình quân (giam-xuong, giờ) — Rút ngắn khâu chuẩn bị nội bộ giúp giữ đúng hạn mà không cần tăng nhân sự.
Mục tiêu (cam-ket): Tối ưu hóa quy trình vận hành kho để duy trì hiệu suất ổn định với nguồn lực hiện tại — vì sao lúc này: Ràng buộc về chi phí và con người đòi hỏi phải tinh gọn từng bước xử lý ngay từ bây giờ. — Cần hoạt động hiệu quả trong điều kiện không bổ sung nhân sự và ngân sách như quý trước.
  - KR: Tỷ lệ đơn hàng xuất kho không phát sinh khiếu nại hay sai sót (phan-tram, %) — Giảm thiểu sai sót giúp giảm chi phí khắc phục và duy trì chất lượng dịch vụ ổn định.
  - KR: Tỷ lệ chi phí vận hành kho trên mỗi đơn hàng so với định mức ngân sách cũ (giu-duoi, %) — Bảo đảm hoạt động vận hành trơn tru trong giới hạn ngân sách không tăng thêm.
```

| Cặp | Judge chọn | Người chọn | Khớp |
|---|---|---|---|
| 1 | (trong eval-soan-khoa.json) |  |  |
| 2 | (trong eval-soan-khoa.json) |  |  |
| 3 | (trong eval-soan-khoa.json) |  |  |
| 4 | (trong eval-soan-khoa.json) |  |  |
| 5 | (trong eval-soan-khoa.json) |  |  |
