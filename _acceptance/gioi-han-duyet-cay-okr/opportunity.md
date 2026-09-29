---
schema_version: 1
slug: gioi-han-duyet-cay-okr
feature: Mục tiêu có mức hiển thị giới hạn, có bước duyệt nhẹ tuỳ chọn, và tái cơ cấu giữa kỳ không làm OKR mồ côi — lượt 8c của lộ trình OKR (MT-06, QT-02, TC-06)
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-29T05:30:32Z
prototype:
  base_commit: 1a39db2412f4f77dd8191be3970589a594130134
  disposition: keep
---

## Vấn đề & ai gặp

Lượt 3–8a (#140 … #201) dựng đủ vòng một bộ OKR: đặt, công bố, cập nhật tuần, xem, số tự
chảy, chấm, việc và ghi nhận cạnh KR. Ba chỗ còn trống, cả ba đều về «ai được làm gì với
mục tiêu nào», nên Cổng Đáng của 8a (28/09) gom chúng thành một lượt:

- **Mọi người đọc được mọi mục tiêu, kể cả bản nháp.** Đo trên mã 29/09: không đường đọc
  nào của khu OKR kiểm theo từng mục tiêu — hàm đọc chung chỉ dùng quyền để tính nút «Sửa».
  Một mục tiêu nhạy cảm («Tái cơ cấu phòng Pháp chế», «Tuyển trưởng phòng mới», mục tiêu
  cá nhân dính nhân sự) hôm nay chỉ có hai đường: ghi lộ cho cả công ty, hoặc để ngoài công
  cụ — và để ngoài thì toàn cảnh, họp tuần, chấm cuối kỳ đều thiếu nó.
- **Không có bước duyệt.** Trưởng phòng bấm «Công bố» là xong; trưởng bộ phận thấy mục
  tiêu của phòng mình lần đầu sau khi nó đã chạy. Lộ trình mục 1 ghi bước duyệt là cấu
  hình của chương trình, không cứng trong mã — có công ty cần, có công ty không. Nhập từ
  bảng tính còn một đường công bố thẳng không qua nút.
- **Cây tổ chức không nhìn OKR.** Đo trên mã 29/09: lưu trữ một phòng ban đang có OKR quý
  chạy được cho qua; mục tiêu biến khỏi «Theo đơn vị», khỏi toàn cảnh, trưởng không còn
  tính, không ai sửa được — mồ côi lặng lẽ. Xoá hẳn đơn vị đó thì máy chủ trả lỗi 500 không
  lời giải thích. Dời phòng ban sang bộ phận khác, trưởng rời công ty, người phụ trách KR
  nghỉ đều để lại OKR không ai trả lời. Không có cách chuyển OKR của một phòng ban sang
  phòng ban khác khi gộp hay tách.

**Người gặp:** trưởng đơn vị và người đặt mục tiêu cá nhân (đặt mức hiển thị, gửi duyệt),
trưởng cấp trên (duyệt, trả lại), quản trị chương trình (bật bước duyệt, tái cơ cấu cây,
chuyển OKR, xem OKR mồ côi), mọi người kể cả vai «chỉ OKR» (không thấy thứ không được
thấy, ở mọi đường đọc).

Vật liệu nền: `docs/plan/lo-trinh-okr.md` mục 1 (bước duyệt là cấu hình), mục 5 «Lượt 8»,
«Dựng hết bằng dữ liệu mẫu», dòng 8, 8c mục 10; `_acceptance/canh-kr-okr/opportunity.md`
(bảng chia mã, dòng MT-06, QT-02, TC-06); `_acceptance/vai-chi-okr` (ma trận bốn đường
vào); `CONTEXT.md` «Trưởng đơn vị», «Chương trình OKR», «Căn chỉnh», «Phạm vi dữ liệu»;
`docs/api.md` «The organization tree», «OKR».

## Nghĩa ba mã (quyết ở Cổng Đáng)

Mã là của bản phạm vi riêng tư. Nghĩa dưới đây rút từ câu «Ý định» lượt 8 và dòng 8c —
chủ kho sửa nếu bản phạm vi nói khác.

| Mã | Nghĩa máy hiểu | Lớp khó-đảo |
|---|---|---|
| MT-06 | Người sửa được mục tiêu đặt mức hiển thị: **công khai** (mặc định, như hôm nay) · **giới hạn** — chỉ người dính vào mục tiêu, trưởng sửa được nó, quản trị và người xem có tên thấy. Người không xem được thì mục tiêu vắng mặt ở MỌI đường đọc; giới hạn không vào số gộp nào và không căn chỉnh được (theo Perdoo) | đổi quyền đọc trên mọi đường đọc OKR |
| QT-02 | Chương trình OKR có công tắc «Công bố cần duyệt», mặc định tắt. Bật thì người đặt «Gửi duyệt», **một** người duyệt ở cấp trên duyệt hay trả lại kèm lý do; không nhiều tầng | trạng thái mới, đổi quyền công bố |
| TC-06 | Cây tổ chức không lưu trữ hay xoá được đơn vị còn OKR ở kỳ đang mở; quản trị chuyển OKR sang đơn vị khác khi gộp, tách; OKR mồ côi (đơn vị lưu trữ, không ai sửa được, người phụ trách đã rời) hiện ra cho quản trị sửa | đổi luật ghi của cây tổ chức, chuyển OKR giữa đơn vị |

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Nghĩa ba mã như bảng trên | Dựng sai thứ bản phạm vi mô tả | Chủ kho soi bảng tại Cổng Đáng | Chưa thử |
| 2 | Quản trị (owner, admin) xem được mọi mục tiêu, kể cả mức riêng | Mục tiêu nhạy cảm với cả quản trị không có chỗ | Hỏi tại Cổng Đáng | Chưa thử |
| 3 | Mục tiêu giới hạn không vào số gộp nào (toàn cảnh, họp tuần, sức khoẻ) với MỌI người — ai cũng thấy cùng một số; và không căn chỉnh được, không góp vào, không nhận góp | Trưởng muốn số đơn vị gồm cả mục tiêu giới hạn; mục tiêu nhạy cảm cần góp vào mục tiêu công ty | Hỏi tại Cổng Phạm vi; đọc tỷ lệ giới hạn sau quý 4 | Chưa thử |
| 4 | Người duyệt là trưởng cấp trên (phòng ban → trưởng bộ phận; bộ phận → quản trị; cá nhân → quản lý trực tiếp); không có thì quản trị; người bấm công bố đã là người duyệt thì công bố thẳng | Công ty muốn người duyệt khác (phòng nhân sự, ban OKR) | Hỏi tại Cổng Phạm vi | Chưa thử |
| 5 | Khi chờ duyệt, mục tiêu và KR khoá sửa; muốn sửa thì rút lại | Người đặt muốn sửa trong lúc chờ | Đọc số lần rút lại sau mùa quý 1 | Chưa thử |
| 6 | Không cho quản trị sửa OKR của đơn vị không trưởng — chữa bằng đặt trưởng, không bằng mở quyền | Kỳ chạy trôi khi quản trị chậm đặt trưởng | Danh sách mồ côi cho quản trị thấy ngay | Chưa thử |
| 7 | Dời phòng ban sang bộ phận khác giữa kỳ: OKR đi theo phòng ban, căn chỉnh giữ nguyên, quyền sửa theo trưởng bộ phận mới | Bộ phận cũ mất dấu mục tiêu từng góp vào mình | Hỏi tại Cổng Phạm vi | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: ba thứ có được dùng như ý không — mức giới hạn có kéo mục tiêu nhạy cảm vào công cụ mà không làm OKR thôi minh bạch; bước duyệt (nếu chương trình bật) có chạy nhanh hay thành nút thắt; tái cơ cấu mùa quý 1 có để lại OKR mồ côi không.
- Kết quả nào là SỐNG: tới 2027-01-11: có ít nhất một mục tiêu đã công bố ở mức giới hạn và tỷ lệ mục tiêu giới hạn trên mục tiêu đã công bố ≤ 15%; nếu chương trình bật bước duyệt, trung vị thời gian chờ duyệt ≤ 2 ngày và ≥ 90% mục tiêu gửi duyệt được duyệt hay trả lại trong 5 ngày; ở mọi lần đọc hằng tuần từ 2026-11-02 có 0 mục tiêu mồ côi ở kỳ đang mở và 0 lần xoá đơn vị trả lỗi 500.
- Kết quả nào là CHẾT: tỷ lệ mục tiêu giới hạn > 30% (OKR thôi là thứ cả công ty nhìn thấy — xem lại mức mặc định); hoặc chương trình tắt bước duyệt trong vòng hai tuần sau khi bật (nút thắt); hoặc cùng một mục tiêu mồ côi có mặt ở ba lần đọc tuần liên tiếp.
- Timebox: dựng và đo trên bộ OKR mẫu; gộp ngoài đóng băng (từ 19/10 tới khi các phòng ban công bố OKR quý 4); đọc số 2026-12-01 và 2027-01-11 (mùa đặt quý 1 là lúc bước duyệt và tái cơ cấu chạy thật), đọc lần cuối 2027-01-31.

## Kết quả prototype

Chưa dựng. Bản mẫu OKR đã duyệt (`/proto/ban-mau-okr`, `/proto/canh-kr-okr`) không có mức
hiển thị, bước duyệt hay chuyển OKR. Các bề mặt mới dựng ở S1-D bằng design-pass không đồng
bộ trên `/proto/gioi-han-duyet-cay-okr`.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Mục tiêu riêng: người dẫn và người góp thấy, quản trị thấy hết, không vào bảng tổng, không căn chỉnh được | Perdoo «Make OKRs or KPIs private» | triết-lý/logic | có (thêm người xem có tên) | — |
| Duyệt tuỳ chọn: quản lý của chủ đội duyệt, khoá sau duyệt; ngoài luồng thì tự duyệt | Microsoft Viva Goals «Approval workflows»; Leapsome «FAQ Goals & OKRs» | triết-lý/logic | có (một tầng) | — |
| OKR của đội bị xoá còn lại với ô đơn vị trống, không ai thấy | Tangible Growth «what happens if our team structure changes» | phản-mẫu | có — đúng thứ lượt này chặn | — |

## Out of scope từ khám phá

- Nhiều tầng duyệt, duyệt theo chuỗi, duyệt lại khi sửa sau công bố.
- Mức hiển thị cho từng KR (mức nằm ở mục tiêu, KR theo mục tiêu).
- Gộp, tách đơn vị như một thao tác của cây tổ chức — gộp = chuyển OKR rồi lưu trữ.
- Chặn gỡ thành viên đang phụ trách OKR — gỡ vẫn được, OKR của họ hiện ở danh sách mồ côi.
- Trợ lý OKR đọc theo mức hiển thị ngoài việc chặn ở hàng đợi — lượt 9b, C.

## Cổng 0

- **decision = build.** Căn cứ: lộ trình OKR mục 5 «Lượt 8», dòng 8c mục 10; nghĩa ba mã như bảng ở trên. Quyết 2026-09-29 bởi Manh Phan trong phiên lượt 8c («Cổng Đáng: làm, ngưỡng như đề xuất»).
- **disposition = keep.** Bản mẫu `gioi-han-duyet-cay-okr` ở lại kho (`docs/proto.md`).
- **Ngưỡng UAT chốt cùng lúc ký:** gỡ nhãn đề xuất cho câu hỏi, SỐNG, CHẾT và timebox như section Ngưỡng.
