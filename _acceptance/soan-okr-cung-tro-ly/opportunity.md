---
schema_version: 1
slug: soan-okr-cung-tro-ly
feature: Soạn OKR cùng Trợ lý — người sửa được OKR của một đơn vị mở một cuộc đối thoại với Trợ lý OKR cho đơn vị và chu kỳ đang lập kế hoạch; Trợ lý mang bối cảnh (hồ sơ công ty và chiến lược, đơn vị · mô tả · chức danh, OKR cấp trên và ngang cấp, kỳ trước tóm gọn, số CRM dạng tổng) vào cuộc đó, hỏi vài câu, đưa bản nháp bộ OKR trên bảng sống cạnh chat; người nhận · sửa · bác từng dòng, «Đưa vào bộ OKR» tạo cả bộ ở trạng thái nháp, người điền đích rồi công bố
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-30T01:15:11Z
prototype:
  base_commit: 246d1ac6
  disposition: archive
---

## Vấn đề & ai gặp

Chủ kho (Manh Phan) hôm nay phải trò chuyện với Claude bên ngoài để nghĩ mục tiêu và
gợi ý cả bộ OKR, rồi chép vào CRM. Mỗi lần phải dán tài liệu «Operating System –
OneHub» (121 nghìn ký tự) và tự kể mô hình công ty, khách hàng, địa bàn, đơn vị đang
soạn cho ai — Claude bên ngoài không biết gì về OneHub, và cũng không biết kỳ trước bộ
nào đạt, bộ nào trượt. Chủ kho nói thẳng ngày 30/09 điều làm gợi ý đúng hơn là model
biết «OneHub mô hình gì, khách hàng là ai, hoạt động ở đâu, công ty nào tương tự».

Trợ lý OKR trong CRM (9b, #207, lên `onehub` 29/09) chỉ góp ý trên **một** Mục tiêu
đã có, một lần bấm, không hội thoại: gói nó nhận chỉ có Mục tiêu đó, KR của nó, tên
cấp trên để Căn chỉnh, và sổ đề xuất. Nó không thấy hồ sơ công ty, chiến lược, đơn vị
chịu trách nhiệm gì, kỳ trước, OKR ngang cấp, số CRM — nên không soạn được bộ mới.

Ai gặp: trưởng đơn vị (bộ phận, phòng ban) và quản trị ở cấp OneHub, trong mùa đặt OKR
năm 2027 (mở 2026-12-07) rồi mùa quý 1 của mọi phòng ban. Bối cảnh và chỗ CRM đã có
hay chưa: `docs/superpowers/specs/2026-09-30-soan-okr-cung-tro-ly-boi-canh-design.md`
(chủ kho duyệt 30/09).

Theo chốt 28/09 «dựng hết bằng dữ liệu mẫu»: dựng và đo trên bộ OKR mẫu Hải Đăng
Logistics (hạng mục M); dữ liệu thật là điều kiện bật, không phải điều kiện dựng.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bối cảnh (hồ sơ công ty, chiến lược, mô tả đơn vị, kỳ trước) làm bản nháp đúng hơn rõ rệt so với soạn không bối cảnh | Tốn gói lớn mà nháp vẫn chung chung; người bác hàng loạt | Trên bộ mẫu: cùng một đơn vị, soạn có và không bối cảnh, judge ZDR chấm mù; đo trước Cổng Phạm vi | Đứng trên một mẫu (N-soạn 30/09): có gói 26/30, không gói 10/30; chấm lại ≥ 5 ca ở eval S4 |
| 2 | Trưởng đơn vị chịu một cuộc đối thoại 6–10 lượt thay vì tự viết hoặc bỏ giữa chừng | Cuộc mở rồi bỏ; tốn tiền không ra bộ | Đếm cuộc hoàn tất tới «Đưa vào bộ OKR» trên cuộc mở, ở phiên nghiệm thu | Chưa thử |
| 3 | Một cuộc soạn ≤ 0,25 USD và cả mùa nằm trong trần tháng (giữ 9 USD, hoặc trần nâng riêng tháng đặt OKR) | Trợ lý tạm nghỉ đúng tháng cần nhất | Đo 20 cuộc thật trên bộ mẫu trước Cổng Phạm vi, như N0 đã làm cho 9a; dự báo mùa từ số đơn vị | Đứng (N-soạn 30/09, một cuộc 4 lượt): 0,024 USD; 6–10 lượt 0,04–0,09; gói cỡ thật 0,08–0,15; mùa 1–12 USD — đo 10 cuộc ở eval S4 |
| 4 | Quản trị viết được hai trang «Hồ sơ công ty» và «Chiến lược năm» rút gọn (≤ 20 nghìn ký tự mỗi trang, không lương thưởng) trước mùa | Lớp giá trị nhất rỗng; Trợ lý soạn như Claude bên ngoài không có tài liệu | Chủ kho viết thử từ tài liệu Operating System trong một buổi; bộ mẫu có hai trang cùng loại cho Hải Đăng Logistics | Chưa thử |
| 5 | Nền chat OKR bằng eve app riêng (đã quyết ở N0 cho lượt 10 và C) dựng vừa trong lượt này, cho vai «chỉ OKR» đi qua mà không lộ dữ liệu đối tác | Hạng mục kéo dài quá 07/12, hoặc mở một đường rò mới | Thử một ngày: mở một phiên eve app riêng qua cửa mới với người vai «chỉ OKR», phép đo cách ly đỏ-xanh; làm ở S1 trước Cổng Phạm vi | Thử trên giấy 30/09: khả thi — app eve riêng, cổng riêng, không nhập chéo gốc (thiết kế §3.8); ẩn số «dựng và chạy cạnh app thứ nhất» là việc đầu tiên của S3 |
| 6 | Bộ nháp vào CRM ở trạng thái nháp rồi người điền đích và công bố là đủ — không cần Trợ lý ghi đích | Người phải gõ lại đích cho mọi KR, thấy phiền | Không thử — là luật NG-05; đếm ở nghiệm thu bao nhiêu KR nháp được công bố | Là luật |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Trưởng đơn vị có dùng cuộc đối thoại với Trợ lý để soạn ra bộ OKR mà mình công bố được, thay vì soạn ngoài CRM rồi chép vào, với chi phí trong trần và không lộ dữ liệu đối tác cho vai «chỉ OKR» không?
- Kết quả nào là SỐNG: Trong mùa đặt OKR đầu tiên bật (cấp OneHub cho OKR năm 2027, rồi mọi phòng ban cho quý 1): ≥ 50% đơn vị được bật có ít nhất một cuộc soạn đi tới «Đưa vào bộ OKR»; ≥ 60% dòng nháp được nhận nguyên văn hoặc sửa rồi nhận; ≥ 70% Mục tiêu tạo từ nháp được công bố trong 14 ngày; chi phí mỗi cuộc ≤ 0,25 USD; 0 số đích do máy ghi; 0 lọt dữ liệu đối tác qua đường chat cho vai «chỉ OKR».
- Kết quả nào là CHẾT: Sau ≥ 10 cuộc soạn: < 20% đơn vị được bật hoàn tất cuộc nào; hoặc < 30% dòng nháp được nhận; hoặc khu OKR chạm trần tháng trước ngày 20 của tháng đặt OKR; hoặc có bất kỳ số đích nào máy tự ghi; hoặc một lần lọt dữ liệu đối tác.
- Timebox: Dựng xong và ở nấc tắt trên `onehub` trước 2026-12-07; bật cho cấp OneHub trong mùa OKR năm 2027; đo tại phiên nghiệm thu sau mùa đó; bật cho mọi phòng ban trước mùa quý 1 chỉ khi đạt ngưỡng sống.

## Kết quả prototype

Không dựng prototype riêng. Bản bấm được của màn soạn (hội thoại + bảng nháp) dựng ở
S1-D (design-pass) trước Cổng Phạm vi; vỏ ngăn trượt dùng chung với hạng mục «Tạo và
sửa OKR cùng khung với deal» đang chạy ở phiên khác.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Tài liệu «Operating System – OneHub» (Charter, BSC, KGI/KSF, sáng kiến, cơ cấu, cadence, tài chính) | `~/Downloads/Operating System - OneHub (Final).md`, chủ kho đưa 30/09; ngoài kho | triết-lý/logic | có — dưới dạng hai trang rút gọn do quản trị viết trong Kho tài liệu; **mục lương thưởng và bảng điểm theo vai không kế thừa** (luật NG-01, NG-02) | |
| Cách trò chuyện soạn OKR của Claude bên ngoài (hỏi lại, đưa cả bộ) | Kinh nghiệm chủ kho, không có bản ghi | triết-lý/logic | có — thành hình dạng đối thoại ở mục 2b của tài liệu bối cảnh | |
| Nghiên cứu Tability và đối thủ; kiến trúc Trợ lý OKR | `docs/reports/2026-09-26-tro-ly-okr/` | triết-lý/logic | có | |
| Tab Tác nhân của khung bản ghi (deal); AI Elements | trong kho — `apps/app/components/crm/agent-panel.tsx`, `docs/chat-ui.md` | ngôn-ngữ-thiết-kế/hình-thái | có — là chuẩn của chính kho, không phải vật liệu ngoài | |

## Cổng 0

- **decision = build.** Căn cứ: tài liệu bối cảnh đã duyệt 30/09; hạn tự nhiên 2026-12-07; giả định 1, 3, 5 thử được trước Cổng Phạm vi. Quyết 2026-09-30 bởi Manh Phan: «build, giữ ngưỡng đề xuất, chốt cả ba chỗ đổi».
- **disposition = archive.** Căn cứ: không có code prototype.
- **Ngưỡng UAT chốt cùng lúc ký:** giữ nguyên số ở section Ngưỡng (chủ kho giữ ngưỡng máy đề xuất, 2026-09-30).
- **Ba chỗ đổi so với lộ trình — đã chốt cùng chữ ký 2026-09-30:**
  1. Ranh giới lượt 9 «không soạn trọn bộ OKR cho cả đội» đổi thành: soạn trọn bộ **nháp** qua đối thoại khi người yêu cầu; người quyết từng dòng; số đích người đặt; bộ chỉ vào CRM ở trạng thái nháp, người công bố. NG-05, NG-06 giữ.
  2. Thứ tự làn A: hạng mục này dựng nền chat OKR (eve app riêng) mà lộ trình xếp cho C `hoi-dap-okr`; C đi sau, dùng lại nền.
  3. Trần tháng khu OKR: giữ 9 USD, nhưng cho phép trần riêng cho tháng đặt OKR do quản trị đặt ở Chương trình OKR (mặc định bằng trần thường); con số nâng — nếu có — chủ kho quyết sau khi đo 20 cuộc ở giả định 3.

## Thước đo thành công → ứng viên criterion

- Cuộc soạn hoàn tất trên cuộc mở; dòng nhận · sửa · bác → AC sổ đề xuất ghi từng dòng nháp, từng quyết định, và mã cuộc soạn; màn quản trị đọc được tỷ lệ.
- Mục tiêu tạo từ nháp được công bố trong 14 ngày → AC «Đưa vào bộ OKR» tạo cả bộ ở trạng thái nháp trong một giao dịch, vết ghi nguồn là cuộc soạn.
- Chi phí mỗi cuộc → AC sổ chi phí nối với cuộc soạn; trần lượt mỗi cuộc và trần cuộc mỗi đơn vị mỗi kỳ.
- 0 số đích do máy ghi → AC bộ kiểm: số trong nháp chỉ từ gói bối cảnh hoặc từ chữ người gõ trong cuộc; ô đích trống; eval có chiều đỏ.
- 0 lọt dữ liệu đối tác → AC một phép đo cho đường vào mới của vai «chỉ OKR», đỏ-xanh.
- Bối cảnh đúng quyền → AC gói của người vai «chỉ OKR» không có lớp số CRM; trang «chiến lược» chỉ đọc bản đang dùng.

## Out of scope từ khám phá

- Soạn qua Zalo hay Slack — chỉ trong app; kênh là việc của lượt 10.
- Trợ lý tự công bố hay ghi đích — bác: NG-05 và luật 9a «không tự ghi vào OKR».
- Bộ nhớ chéo giữa các cuộc ngoài dữ liệu OKR và sổ đề xuất — bác: Cập nhật tuần và sổ đề xuất đã là trí nhớ (thiết kế §4.8).
- Đọc Hỏi ý mục tiêu — để lượt nhỏ sau khi `dot-hoi-y-tuong-okr` lên `onehub`.
- Hai kỳ trở lên trong lớp lịch sử; tìm toàn văn; KR tương tự bằng pgvector; quyền theo trang tài liệu — theo điều kiện ở thiết kế §7.2 và lộ trình Kho tài liệu.
- Vỏ ngăn trượt cho tạo/sửa Mục tiêu và KR — hạng mục riêng «Tạo và sửa OKR cùng khung với deal», đi trước.
- Đọc dữ liệu đối tác để soạn cho vai «chỉ OKR» — bác: luật cách ly của 9a và `vai-chi-okr`.
