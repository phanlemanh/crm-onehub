---
schema_version: 1
slug: mo-o-dau
feature: Người quyết mở rộng biết nhắm địa bàn nào — giao dịch và độ tập trung theo quận
owner: phanlemanh@gmail.com
stage: decided
decision: park
decided_by: Phan Le Manh
decided_at: 2026-10-31T09:52:29Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

OneHub tăng thị phần bằng cách kéo môi giới vào mạng lưới, và mở rộng địa bàn
là việc không có ngày kết thúc (owner, buổi khai thác 2026-09-04). Người quyết
nhắm địa bàn nào hôm nay không có số về giao dịch và độ tập trung theo quận.
Owner nêu cách đọc: nơi có nhiều môi giới hoạt động là nơi thị trường đang tốt,
cầu cao.

Người gặp: **người quyết mở rộng** — chưa có tên trong từ điển sản phẩm. Có thể
là chính nhân viên quan hệ đối tác khi họ chọn địa bàn tuần tới, hoặc một người
ở cấp quyết định nhịp quý. Ai là người này là câu hỏi đầu tiên (giả định 2).

Máy phản biện cách đọc "nhiều môi giới = cầu cao", ghi lại để khỏi bàn lại:

- Mật độ môi giới là chỉ báo **trễ** và **phía cung**: môi giới đổ về nơi đã
  nóng; mấy đợt sốt đất 2021–2022 mật độ cao nhất đúng lúc thị trường sắp tắt.
  Nó đo chỗ nào *đang bị tranh*, không phải chỗ nào *sắp có giao dịch*.
- Cầu hiện ở **tốc độ hấp thụ** (tin biến mất sau bao lâu, tỷ lệ đăng lại, giá
  rao dịch chuyển) và rõ nhất ở **mức độ quan tâm** (người đi tìm) — thứ chỉ
  sàn có, không cào được, nhưng sàn in trong báo cáo quý công khai.
- Với một nền tảng mạng lưới, "nhiều môi giới" cắt hai chiều: nhiều người để
  tuyển, nhưng nhiều đối thủ đã đứng đó. Thị trường dễ thắng là thị trường **có
  giao dịch mà phân mảnh** — nhiều sàn nhỏ, không ai thống trị. Thước cần là
  **độ tập trung**: ở quận này, mười người đăng nhiều nhất chiếm bao nhiêu phần
  tin. Số đó chỉ ra từ cào tin đăng; không báo cáo nào in.

Nên ô này đặt cược vào **một thước không mua được** — độ tập trung theo quận —
chứ không phải vào mật độ môi giới.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Báo cáo quý công khai (batdongsan.com.vn, Bộ Xây dựng) CHƯA trả lời được "nhắm quận nào" ở độ phân giải người quyết cần | Không cần dựng gì: đọc báo cáo là xong, ô này khép mà không tốn ngày công nào | Đọc ba báo cáo quý gần nhất; thử trả lời "quý tới nhắm quận nào" chỉ bằng chúng; ghi lại thiếu gì | Chưa thử — **đi trước mọi phép thử khác** |
| 2 | Có một người thật đang quyết nhắm địa bàn, và độ tập trung là số họ sẽ dùng để quyết | Bản đồ đẹp treo tường: có số, không có quyết định nào đổi vì nó | Hỏi người đó một câu: "quyết định địa bàn gần nhất của anh, nếu có số này thì có đổi không?" | Chưa thử |
| 3 | Thị trường phân mảnh là nơi OneHub dễ thắng hơn thị trường đã có sàn lớn | Thước độ tập trung sai chiều: đang chỉ đi chỗ khó | Đối chiếu hai, ba địa bàn OneHub đã vào: nơi thắng có phân mảnh hơn nơi chưa thắng không | Chưa thử |
| 4 | Số gộp theo quận không lưu dữ liệu cá nhân, nên không đi qua cổng pháp lý | Phải xin căn cứ như ô `biet-goi-ai-truoc` | Một câu hỏi pháp chế OneHub, gộp cùng câu của ô kia | Chưa thử |
| 5 | Cào tin đăng theo quận bền trong sức đội — sàn chống bot chủ động, đây là thuế hàng tháng | Bản đồ đóng băng ở lần cào cuối; số cũ mà trông như mới | Cào thử một quận trong một tuần, đếm số lần bị chặn | Chưa thử |

Giả định 1 rẻ nhất và có thể khép ô mà không dựng gì. Giả định 2 nặng nhất và
không phải câu hỏi kỹ thuật.

## Ngưỡng chết / ngưỡng UAT

**Ô này hạ ưu tiên 2026-09-04, cùng ngày mở.** Owner chốt phạm vi: vòng tới
phục vụ đội tiếp thị, không phải người quyết mở rộng. Bốn dòng ngưỡng trả về
dấu `…` để máy quét xếp ô vào «đang cân nhắc» thay vì «chờ chữ ký» — trạng thái
thật là chưa có gì để ký. Bản đề xuất cũ giữ nguyên ở mục dưới, không xoá.

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …

## Bản đề xuất ngưỡng 2026-09-04 — giữ làm sử liệu

Máy đề xuất buổi khai thác 2026-09-04, hạ ưu tiên cùng ngày trước khi người ký.
Giữ lại để lần mở sau không phải nghĩ lại từ đầu:

- Câu hỏi phép đo trả lời: [đề xuất] Người quyết mở rộng có đổi ít nhất một quyết định địa bàn vì bản đồ không?
- Kết quả nào là SỐNG: [đề xuất] Tám tuần sau khi bật, người quyết mở rộng nêu được ít nhất một quyết định nhắm địa bàn đã đổi vì số trên bản đồ, và nói được số nào.
- Kết quả nào là CHẾT: [đề xuất] Tám tuần không có quyết định nào dẫn tới bản đồ; hoặc ngay ở giả định 1, ba báo cáo quý công khai đã trả lời được câu hỏi — khi đó chết trước khi dựng, và đó là kết quả tốt.
- Timebox: [đề xuất] Một ngày cho phép thử đọc-trước. Nếu qua, ba ngày công dựng: một quận, một thước (độ tập trung), một nguồn. Quá ba ngày nghĩa là đang dựng bản đồ cả nước.

Căn cứ: ngưỡng SỐNG đo bằng một quyết định có tên thay vì bằng số lần mở
trang, vì bản đồ mà không ai đổi ý thì mở bao nhiêu lần cũng là treo tường.
Tám tuần vì quyết định địa bàn thưa hơn quyết định gọi ai.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Báo cáo thị trường quý: mức độ quan tâm, lượng tin theo tỉnh/quận | batdongsan.com.vn (công khai) · Bộ Xây dựng (công bố định kỳ) | triết-lý/logic | có — đọc trước, và là nguồn duy nhất của phía cầu | — |
| Tin đăng trên sàn: vị trí, giá, thời điểm, người đăng | batdongsan.com.vn · nhatot.com | triết-lý/logic | có — chỉ để tính số gộp theo quận, sau khi giả định 1 nói báo cáo chưa đủ | — |
| Cách trình bày bản đồ, biểu đồ của các sàn | cùng nguồn trên | ngôn-ngữ-thiết-kế/hình-thái | **không** — chuẩn của kho thắng | — |
| Luật giao diện của kho | `docs/design.md` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

**Thứ tự hai ô:** ô này đi sau `tiep-thi-tuyen-doi-tac` (ô kia đổi tên từ
`biet-goi-ai-truoc` ngày 2026-09-04 khi owner chốt phạm vi về tiếp thị). Riêng
phép thử đọc-trước (giả định 1) làm được ngay, song song, một ngày — và nó có
thể khép ô này mà không tốn ngày công dựng nào.

## Thước đo thành công → ứng viên criterion

- Số quyết định nhắm địa bàn có ghi «chọn theo bản đồ» — cần chỗ ghi; **chưa
  có nguồn sinh** trong CRM.
- Ở địa bàn chọn theo bản đồ: số đối tác mới sau tám tuần, so với trung vị các
  địa bàn mở trước — chỉ đo được khi đã có ít nhất một địa bàn như vậy.
- Độ tươi của số: khoảng cách từ lần cào cuối tới hôm nay hiện ngay trên bản
  đồ — số cũ phải trông cũ.

## Out of scope từ khám phá

- Hồ sơ từng cá nhân, từng công ty — ô `tiep-thi-tuyen-doi-tac`; ô này chỉ giữ
  số gộp.
- Địa bàn làm trục phân khúc cho chiến dịch — thuộc ô `tiep-thi-tuyen-doi-tac`.
  Ô này hỏi «mở ở đâu» ở nhịp quý, không phải «gửi cho ai» ở nhịp tuần.
- Tự dựng mức độ quan tâm (phía cầu) — bác: không cào được, sàn giữ; lấy từ
  báo cáo công khai.
- Dự báo giá, định giá — không phải việc của CRM.
- Bản đồ cả nước ở vòng đầu — bác: timebox nói một quận; cả nước là sau khi
  một quận đổi được một quyết định.
- Mật độ môi giới làm thước chính — bác với lý do ở mục Vấn đề: chỉ báo trễ,
  phía cung; giữ làm số phụ trên cùng bản đồ.

## Quyết định Cổng Đáng 31/10

Xếp lại sau — Mở rộng địa bàn theo quận thuộc dòng tiếp thị tuyến đối tác (09/2026), không có hàng nào trên lộ trình hiện tại; mở lại khi lộ trình có hàng cho người quyết mở rộng địa bàn. Chủ kho 31/10 «Đồng ý theo khuyên» cho B9 của docs/plan/don-dep-3110.md (bác hoặc xếp lại hồ sơ treo ngoài kế hoạch), qua phiên giám sát Mac Studio; máy chọn từng hồ sơ.
