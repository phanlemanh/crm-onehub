---
schema_version: 1
slug: canh-kr-okr
feature: Việc, sáng kiến, ghi nhận và mẫu nằm cạnh KR — lượt 8a của lộ trình OKR (SK-01, SK-02, CI-05, CI-06, MT-07)
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit: 8cce633822a079a88dcfd797b63a7c8bbbad1cd7
  disposition: keep
---

## Vấn đề & ai gặp

Lượt 3–7 (#140, #153, #157, #162, #179) phủ trọn vòng một con số: đặt KR, cập nhật tuần,
xem, số tự chảy, chấm và khép kỳ. Thứ nằm **cạnh** con số thì chưa có chỗ trong công cụ:

- KR đo kết quả, không đo việc làm (từ điển «Kết quả then chốt»). Nhưng đơn vị vẫn phải
  ghi mình đang làm gì để đẩy KR — hôm nay việc đó sống trong bảng tính riêng, trong
  nhóm chat, hay bị nhét vào ghi chú cập nhật tuần. Họp tuần (lượt 5) nhìn thấy KR tụt mà
  không thấy đơn vị đang thử gì.
- Khối kinh doanh đã có chiến dịch và kế hoạch 30 ngày trong CRM. Một KR «tăng số đối tác
  vào guồng» được đẩy chính bằng các kế hoạch 30 ngày đó, nhưng không có cách nói điều ấy.
- KR kiểu mốc («Ký hợp đồng với đối tác X», «Ra mắt cổng mới») chỉ có hai giá trị xong
  hay chưa. Tới lúc chấm (lượt 7), không ai biết mốc «xong» dựa vào đâu.
- OKR là chuyện cả đơn vị; khi một người đẩy được KR, đồng nghiệp muốn nói lời ghi nhận
  ngay cạnh KR đó — hôm nay chỉ có bình luận, và bình luận không báo người được khen.
- Mùa đặt OKR quý 1 (21/12 → 11/01) cả công ty viết lại từ đầu; phòng ban cùng loại
  (các phòng kinh doanh, các phòng hỗ trợ) viết đi viết lại cùng một bộ khung.

**Người gặp:** người phụ trách KR và người trong đơn vị (ghi việc, đánh dấu xong, đính
bằng chứng), trưởng đơn vị (gắn kế hoạch 30 ngày hay chiến dịch làm sáng kiến, dùng mẫu
khi đặt mục tiêu), mọi người kể cả vai «chỉ OKR» (gửi và nhận ghi nhận), quản trị chương
trình (soạn mẫu cho từng nhóm đơn vị).

Vật liệu nền: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 8» và «Dựng hết bằng dữ liệu mẫu»,
mục 8 (bảng phủ), dòng 8 mục 10; `CONTEXT.md` «Kết quả then chốt», «Trao đổi (OKR)»,
«Phạm vi dữ liệu»; hồ sơ `dat-okr-trong-crm` (Out of scope «mẫu OKR — lượt 8»),
`toan-canh-okr` (Out of scope «bộ lọc lưu được, tìm OKR, bản tin Slack — lượt 8»),
`bo-okr-mau` (bộ OKR mẫu để dựng và đo).

## Chia mã 8a / 8b (quyết ở Cổng Đáng)

Luật chủ kho đặt 28/09: 8a gồm mọi mã thêm bảng hay đổi quyền (T3), 8b gồm phần chỉ đọc,
lọc và gửi tin (T2). Nghĩa từng mã rút theo thứ tự câu «Ý định» lượt 8 — tám món trong
câu khớp một-một với 11 mã theo đúng thứ tự bảng phủ; XEM-08, XEM-09, NH-05 đối chiếu
được với Out of scope của `toan-canh-okr`, MT-06 và MT-07 với Out of scope của
`dat-okr-trong-crm`.

| Mã | Nghĩa (rút từ câu «Ý định») | Chạm lớp khó-đảo | Đề xuất |
|---|---|---|---|
| SK-01 | Việc gắn vào KR | bảng mới | **8a** |
| SK-02 | Sáng kiến: gắn một chiến dịch hay kế hoạch 30 ngày có sẵn vào KR | bảng mới, đọc dữ liệu đối tác (quyền) | **8a** |
| CI-05 | Đính bằng chứng cho KR mốc | bảng mới | **8a** |
| CI-06 | Gửi ghi nhận | bảng mới, tin báo | **8a** |
| MT-07 | Mẫu OKR theo loại đơn vị | bảng mới | **8a** |
| MT-06 | Mục tiêu có mức hiển thị giới hạn | đổi quyền đọc trên mọi đường đọc OKR | **8c (mới)** |
| QT-02 | Bước duyệt nhẹ tuỳ chọn | trạng thái mới, đổi quyền công bố | **8c (mới)** |
| TC-06 | Tái cơ cấu giữa kỳ không làm OKR mồ côi | đổi luật ghi của cây tổ chức, chuyển OKR giữa đơn vị | **8c (mới)** |
| XEM-08 | Lọc lưu được | cần một bảng hay một giá trị `enum` mới (`SavedView.entity` là `enum` Prisma) | 8b |
| XEM-09 | Tìm OKR trong ô tìm chung | không | 8b |
| NH-05 | Bản tin tuần vào kênh Slack của đơn vị | cần chỗ lưu kênh của từng đơn vị (một cột hay một bảng) | 8b |

Vì sao đề xuất tách ba chứ không hai: tám mã «thêm bảng hay đổi quyền» ước chừng
18–20 tiêu chí, vượt trần 15 của một hợp đồng (lộ trình mục 5: «cắt đôi nếu hợp đồng vượt
15 tiêu chí»). Năm mã đầu là đúng câu giao «Việc, sáng kiến, ghi nhận và mẫu nằm cạnh
KR»; ba mã 8c cùng một loại rủi ro — ai được thấy, ai được công bố, OKR theo đơn vị khi
cây đổi — và mỗi mã chạm mọi đường đọc OKR (toàn cảnh, họp tuần, cây căn chỉnh, nhắc
buổi sáng, công cụ đọc của Trợ lý), nên đo chung một ma trận thì rẻ hơn đo hai lần.

**Hệ quả phải nói trước:** 8b không còn là T2 thuần. XEM-08 và NH-05 mỗi mã cần một chỗ
lưu mới, nên 8b sẽ chạm `packages/db/prisma` (T3, có Cổng 1.5) — trừ khi lúc mở 8b
người quyết lưu bộ lọc ở trình duyệt và bỏ bản tin theo kênh riêng từng đơn vị. Đưa hai
chỗ lưu đó vào 8a thì là bảng không màn nào dùng, không đo được lúc chấm, nên không đề
xuất. Thứ tự làn B đề xuất: 8a → 8c → 7n → 10 → 8b (8c đi sớm vì chạm quyền, xa mùa quý 1;
7n vẫn phải lên trước 14/12).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Nghĩa 11 mã rút đúng theo thứ tự câu «Ý định» lượt 8 | Dựng sai thứ bản phạm vi riêng tư mô tả | Chủ kho soi bảng chia mã tại Cổng Đáng | [đề xuất] |
| 2 | «Việc» là dòng tự gõ (tiêu đề, người làm, hạn tuỳ, xong/chưa); «sáng kiến» là một chiến dịch hay kế hoạch 30 ngày có sẵn gắn vào KR. Hai thứ nằm chung một danh sách «Việc và sáng kiến» của KR | Người muốn một sáng kiến tự gõ lớn hơn một việc (có việc con) | Hỏi tại Cổng Phạm vi; đọc tỷ lệ dùng sau quý 4 | [đề xuất] |
| 3 | Sáng kiến gắn sẵn lưu mã bản ghi gốc, không chép tên; vai «chỉ OKR» thấy «một chiến dịch» hay «một kế hoạch 30 ngày», không tên, không trạng thái, không đường mở | Lộ dữ liệu đối tác qua khu OKR | Ma trận bốn đường vào như lượt 2 | [đề xuất] |
| 4 | Bằng chứng là một đường dẫn (http, https) kèm ghi chú, không tải tệp | Người cần tải ảnh chụp, biên bản | Hỏi tại Cổng Phạm vi; tệp là vòng riêng khi có chỗ lưu riêng tư | [đề xuất] |
| 5 | Bằng chứng không bắt buộc để đánh dấu mốc xong | Mốc «xong» không căn cứ vẫn nhiều | Đọc tỷ lệ mốc xong có bằng chứng sau quý 4 | [đề xuất] |
| 6 | Ghi nhận gửi được trên mục tiêu đã công bố ở mọi pha (kể cả chấm điểm và đã đóng — lúc khép kỳ là lúc hay khen nhất); mọi vai gửi được; không đếm, không xếp hạng | Ghi nhận thành điểm thi đua (NG-07) | Từ điển và «Chưa làm» mục 9 | [đề xuất] |
| 7 | «Loại đơn vị» của mẫu = quản trị chọn cấp (bộ phận, phòng ban, cá nhân) và, tuỳ, danh sách đơn vị áp dụng; trống là mọi đơn vị cấp đó. Cây tổ chức không thêm trường «loại» | Quản trị phải chọn lại từng phòng ban cho mỗi mẫu | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 8 | Dùng mẫu chỉ điền sẵn bản nháp; mẫu đổi sau đó không đổi mục tiêu đã tạo; mục tiêu nhớ nó sinh từ mẫu nào để đo tỷ lệ dùng | Không đo được mẫu có dùng hay không | Đường đo ở hợp đồng | [đề xuất] |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] trong quý 4 thật, các đơn vị có dùng những thứ nằm cạnh KR — việc và sáng kiến, bằng chứng, ghi nhận — và mùa quý 1 có dùng mẫu không; phần nào không ai dùng thì không mài tiếp.
- Kết quả nào là SỐNG: [đề xuất] tới 2026-12-01, ≥ 40% mục tiêu đã công bố của quý 4 có ít nhất một việc hoặc sáng kiến; ≥ 60% KR mốc đã xong có bằng chứng; có ghi nhận ở ít nhất một nửa số phòng ban; tới 2027-01-11, ≥ 30% mục tiêu quý 1 của phòng ban sinh từ mẫu. Đọc kèm (không ngưỡng) tỷ lệ việc đã xong và tỷ lệ sáng kiến là kế hoạch 30 ngày.
- Kết quả nào là CHẾT: [đề xuất] tới 2026-12-01, < 15% mục tiêu đã công bố có việc hay sáng kiến và < 10 ghi nhận toàn công ty; hoặc mẫu không được dùng cho mục tiêu quý 1 nào — phần đó xếp lại, không mài.
- Timebox: [đề xuất] dựng và đo trên bộ OKR mẫu; gộp sau khi M đã gộp, ngoài đóng băng (từ 19/10 tới khi các phòng ban công bố OKR quý 4); đọc số 2026-12-01 và 2027-01-11, đọc lần cuối 2027-01-31.

## Kết quả prototype

Chưa dựng. Bản mẫu OKR đã duyệt (`/proto/ban-mau-okr`, PR #113) và bản mẫu lượt 5, 7
không có bề mặt việc, sáng kiến, bằng chứng, ghi nhận hay mẫu. Các bề mặt mới dựng ở S1-D
bằng design-pass không đồng bộ trên `/proto/canh-kr-okr`.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Sáng kiến là giả thuyết đẩy KR, gắn được việc có sẵn ở công cụ khác | Perdoo «Initiatives in Perdoo» | triết-lý/logic | có | — |
| Ghi nhận đồng nghiệp gắn với tiến độ OKR | Profit.co | triết-lý/logic | có (không lấy điểm, không xếp hạng) | — |
| Mẫu do quản trị soạn, người đặt mục tiêu chọn | Perdoo Configure › Templates; Weekdone OKR examples | triết-lý/logic | có | — |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Tỷ lệ mục tiêu có việc hay sáng kiến, tỷ lệ KR mốc xong có bằng chứng, số phòng ban có
  ghi nhận, tỷ lệ mục tiêu sinh từ mẫu → một câu đếm chỉ đọc (AC đường đo) có phép đo trên
  dữ liệu gieo.
- Mỗi thứ ghi được đọc lại từ bảng (AC việc, sáng kiến, bằng chứng, ghi nhận, mẫu).

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/ban-mau-okr/` | Giữ | không | chỉ nhập khung dùng chung, không sửa |
| `apps/app/app/proto/_modules/khep-ky-okr/` | Giữ | không | không đọc, không sửa |

## Out of scope từ khám phá

- MT-06, QT-02, TC-06 — đề xuất lượt 8c (T3) ở trên; XEM-08, XEM-09, NH-05 — lượt 8b.
- Nhắc việc đến hạn qua Zalo, Slack; việc được giao hiện trong «việc của tôi» — phần gửi
  tin, hợp với 8b.
- Tải tệp làm bằng chứng — chỗ lưu duy nhất của kho là Vercel Blob công khai cho ảnh.
- Trợ lý OKR đọc việc, sáng kiến, ghi nhận, mẫu — lượt 9b hay C.
- Xếp hạng, đếm ghi nhận theo người, điểm đổi quà — NG-07, không bao giờ.
