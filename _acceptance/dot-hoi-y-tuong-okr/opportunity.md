---
schema_version: 1
slug: dot-hoi-y-tuong-okr
feature: Đợt hỏi ý tưởng mục tiêu — cả công ty góp ý cho mục tiêu năm, CEO chọn và nói vì sao, ai góp cũng biết ý mình đi đâu (bước 1–2 của chu kỳ OKR, chạy trong CRM)
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Công ty chạy OKR theo mười bước của VNOKRs. Bước 1 hỏi cả công ty «nếu là CEO,
mục tiêu nào quan trọng cho kỳ tới», bước 2 CEO chọn 3–5 mục tiêu và giải
thích vì sao, đích là mọi thành viên hiểu lý do. Hai bước này hôm nay chạy
ngoài CRM — form và họp — trong khi tám bước còn lại đã hoặc đang vào CRM
(lộ trình `docs/plan/lo-trinh-okr.md`, lượt 3–8 đã lên `onehub`). Bản phạm vi
78 tính năng không có mã nào cho bước 1–2: công cụ bắt đầu từ lúc có người gõ
mục tiêu.

Cái form không phải vấn đề. Vấn đề là hai chỗ form không làm được, và là lý do
những đợt thu ý kiến kiểu này chết ở nơi khác:

- **Gom**: vài chục tới hơn trăm ý tự do, người gom phải đọc tay, ý trùng
  nhiều, ý lạ (chỉ một người nêu) bị làm phẳng.
- **Báo lại**: người góp không biết ý mình nằm trong mục tiêu nào hay vì sao
  bị bỏ. Không có đóng vòng thì đợt sau ít người góp hơn — cổng ý tưởng doanh
  nghiệp gọi đây là «hố đen».

Thêm một chỗ chỉ CRM thấy được: CEO thường đã có mục tiêu trong đầu trước khi
hỏi. Không ai thấy bản đó, nên không ai biết đợt hỏi có đổi được gì hay chỉ
hợp thức hoá.

**Người gặp:** mọi thành viên (~40 người, kể cả người mang vai «chỉ OKR» ngoài
khối kinh doanh) khi được hỏi và khi chờ biết ý mình đi đâu; người gom (quản
trị OKR) khi phải đọc tay; CEO khi chọn và khi phải nói vì sao cho từng chủ đề.

Bàn và chốt ngày 2026-09-29 (Manh Phan) trong một phiên brainstorm có phản
biện ngữ cảnh sạch. Sáu lỗ hổng được nêu, bốn bản vá nhận, một bản vá bị chủ
kho bác (xem Giả định #4), một ngã rẽ về thứ tự được chốt (xem Out of scope).

## Phạm vi đề xuất

Một câu: *«Cả công ty góp ý cho mục tiêu năm trong hai ngày, CEO chọn và nói
vì sao, ai góp cũng biết ý mình đi đâu.»*

Đợt đầu chạy cho **OKR năm 2027**, mở cùng đợt đặt OKR ngày 2026-12-07. Cách
hoạt động vẽ ở `figures/cach-hoat-dong.html` (bốn làn: quản trị OKR · nhân
viên · trợ lý OKR · CEO).

- Quản trị OKR mở một đợt hỏi gắn với chu kỳ năm: hạn 1–2 ngày, lời mở của
  CEO, và 3–5 con số công ty do CEO chọn công bố — thẻ mồi cho người viết, cùng
  một bức tranh cho mọi vai, không đụng bản ghi đối tác.
- Cùng lúc mở đợt, CEO viết trước 3–5 mục tiêu và niêm phong; không ai đọc
  được cho tới khi công bố.
- Mỗi người góp 1–3 ý theo câu hỏi mặc định (sửa được), kèm ô «vì sao» và
  «đo bằng gì». Ghi tên đầy đủ: CEO và người gom thấy tên, đồng nghiệp thấy ý
  không thấy tên. Trên ý người khác có nút «tôi cũng nghĩ vậy», số đếm chỉ
  người gom thấy.
- Độ phủ theo đơn vị hiện dạng heatmap, đích 100%, nhắc người chưa góp —
  không gắn thưởng phạt (chủ kho chốt 2026-09-29, giữ dù phản biện).
- Hết hạn, người gom gắn nhãn chủ đề cho từng ý; có ô «ý lạ» và ô «đã có»
  (đã nằm trong việc thường ngày hoặc mục tiêu đang chạy). Trợ lý OKR gợi ý
  nhóm khi AI bật; tắt AI vẫn gom tay được.
- CEO chọn 3–5 chủ đề, mở niêm phong và so với bản viết trước. Mỗi chủ đề
  phải có phận (chọn · để sau · không làm · đã có) và lý do do CEO tự viết;
  máy chỉ đính bằng chứng (N người ở M phòng ban nêu, hai câu trích). Còn chủ
  đề thiếu phận hay lý do thì không công bố được.
- Chủ đề chọn thành nháp Mục tiêu năm cấp OneHub trong luồng đặt OKR đã có,
  giữ liên kết về ý gốc. Quý 1 CEO tự chia từ mục tiêu năm.
- Khi công bố: bản niêm phong lộ ra cùng cái gì đã giữ, đổi, thêm; mỗi người
  góp nhận tin phận của ý mình kèm lý do, với một chạm «tôi hiểu vì sao»; ý
  «để sau» vào kho ý, ai cũng đọc được, làm mồi đợt sau.

**Hạng: T3.** Đợt, ý, nút đồng ý, chủ đề, bản niêm phong và tin đóng vòng là
sáu thứ mới phải lưu, chạm `packages/db/prisma/**`; đứng trên chu kỳ và mục
tiêu của lượt 3, nhắc của lượt 4, trợ lý nền của 9a — đều đã lên `onehub`.
Dựng và ký Cổng Bằng chứng trên bộ OKR mẫu (`bun run okr:mau`), bật trên dữ
liệu thật.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | CEO thật sự giữ, đổi hoặc thêm ít nhất một mục tiêu nhờ ý của công ty | Đợt hỏi là sân khấu; đợt sau không ai góp thật | Bản niêm phong so với bản chọn ở đợt đầu — máy in ra khi công bố | Chưa thử |
| 2 | Trong hai ngày, nhân viên viết ra ý đáng đọc, không chỉ «tăng doanh số» | Người gom không có gì để gom; CEO chọn từ bản niêm phong | Đếm ý không trùng trong các đợt thu ý kiến quý trước (form/họp) — chủ kho có số | Chưa thử |
| 3 | Báo lại trong vài ngày, có lý do, đủ để người góp quay lại đợt sau | Kho ý thành hố đen như các cổng ý tưởng doanh nghiệp | Tỉ lệ góp lại ở đợt quý 2/2027 | Chưa thử |
| 4 | Đích 100% và heatmap theo đơn vị không sinh ý rác vì không có thưởng phạt (chủ kho giữ, bác bản vá của phản biện) | Trưởng phòng nhắn «điền cho anh», người gom nhận ý trùng hàng loạt | Tỉ lệ ý bị gắn nhãn «đã có» hoặc trùng ở đợt đầu; quá 40% thì xem lại | Chưa thử |
| 5 | 3–5 con số CEO công bố đủ làm mồi cho người ngoài khối kinh doanh | Người mang vai «chỉ OKR» góp ý lệch số, nhận tin «số không ủng hộ» mà không thấy số nào | Hỏi ba người ngoài khối kinh doanh sau đợt đầu: có biết công ty đang ở đâu không | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đợt hỏi trong CRM có làm CEO đổi lựa chọn và có làm người góp quay lại không?
- Kết quả nào là SỐNG: [đề xuất] đợt đầu (12/2026) ≥ 80% thành viên còn hiệu lực góp ít nhất một ý; ≥ 60% người góp bấm «tôi hiểu vì sao» trong 7 ngày sau công bố; bản niêm phong so với bản chọn có ít nhất một mục tiêu đổi hoặc thêm từ ý của công ty. Cổng Giá trị đọc thêm ở đợt quý 2/2027: ≥ 70% người đã góp đợt đầu góp lại.
- Kết quả nào là CHẾT: [đề xuất] dưới 50% góp; hoặc dưới 30% bấm «tôi hiểu vì sao»; hoặc đợt quý 2 dưới 40% góp lại.
- Timebox: [đề xuất] dựng xong và chạy trọn một đợt trên bộ OKR mẫu trước 2026-11-28; đo lần đầu 2026-12-14, sau khi đợt năm 2027 đóng và CEO công bố.

## Kết quả prototype

Không dựng prototype riêng: bốn màn (mở đợt · góp ý · gom và chọn · tin đóng
vòng) đi nghi thức design-pass trên `/proto` ở S1, chấm bằng thước màn ở S4.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Mười bước thiết lập OKR 3 chiều, chu kỳ 90 ngày (VNOKRs) — thứ tự bước 1–2, thời lượng 1–2 ngày mỗi bước, đích 100% góp và 100% hiểu lý do | Ảnh áp phích chủ kho dán 2026-09-29 (winningokrs.com/wos) | triết-lý/logic | có | |
| Câu hỏi mặc định «Nếu là CEO, theo bạn mục tiêu nào quan trọng mà công ty cần thực hiện trong kỳ tới?» | cùng áp phích | triết-lý/logic | có, sửa «quý» thành «năm» cho đợt đầu | |
| Tiền lệ do phản biện dẫn: cổng ý tưởng doanh nghiệp chết vì không đóng vòng; kaizen teian sống nhờ trả lời trong 48 giờ; Google/Intel để lãnh đạo nháp rồi đội phản biện | Phiên phản biện ngữ cảnh sạch 2026-09-29, nguồn chưa kiểm lại | triết-lý/logic | có, làm giả định #1 và #3 | |
| Hình thái màn của VNOKRs hay công cụ OKR khác | — | ngôn-ngữ-thiết-kế/hình-thái | không — chuẩn `packages/ui` thắng | |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = archive** Căn cứ: không có prototype riêng.
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Tỉ lệ góp theo đơn vị đọc từ bảng ý và cây tổ chức — thành AC của màn độ phủ.
- Tỉ lệ người góp bấm «tôi hiểu vì sao» — thành AC của tin đóng vòng.
- Không công bố được khi còn chủ đề thiếu phận hay lý do — thành AC chặn ở máy chủ.
- Bản niêm phong không đọc được trước công bố bởi bất kỳ ai, qua màn lẫn API — thành AC quyền.
- Người mang vai «chỉ OKR» góp và đọc ý mà không thấy dữ liệu đối tác — thành AC đường vào, như lượt 2.
- Tỉ lệ góp lại ở đợt quý 2/2027 — Cổng Giá trị đọc, không thành AC (đo sau ship).

## Out of scope từ khám phá

- Đảo thứ tự — CEO nháp 3–5 mục tiêu trước, cả công ty góp «thiếu gì, sai gì, bỏ gì» — bác 2026-09-29 (Manh Phan): giữ hỏi trước như VNOKRs; bản niêm phong so với bản chọn ở đợt đầu sẽ cho biết có nên đảo ở đợt sau không.
- Ẩn tên hay để từng người tự chọn ẩn — bác: ở 40 người ẩn tên là ẩn giả, và nó phá đóng vòng.
- Bỏ heatmap độ phủ, hạ đích xuống «mỗi đơn vị ≥ 1 ý» — bác 2026-09-29 (Manh Phan): giữ đích 100% và heatmap, không thưởng phạt; ghi thành giả định #4 để đo.
- Máy điền sẵn «vì sao lúc này» cho CEO — không: máy không phát ngôn hộ quyết định; máy chỉ đính bằng chứng.
- Thẻ mồi lấy số từ dữ liệu đối tác trong CRM (pipeline, thoả thuận) — không: rò đúng chỗ vai «chỉ OKR» đã chặn.
- Hỏi hai tầm (năm và quý) trong một đợt — không: đợt đầu hỏi tầm năm, quý 1 chia từ năm.
- Đợt hỏi riêng cho bộ phận hay phòng ban — để sau, khi có đơn vị đòi.
- Trưởng đơn vị lọc hay sửa ý trước khi lên CEO — không: ý đi thẳng, trưởng chỉ thấy ai của mình chưa góp.
- Góp ý từ Slack hoặc Zalo — lượt 10 của lộ trình OKR, dùng chung đường khi lượt đó đủ điều kiện.
- Xếp hạng người hay đơn vị theo số ý — luật kho đã loại (NG-07).
