---
schema_version: 1
slug: so-okr-tu-chay
feature: Số OKR tự chảy — KR của khối kinh doanh lấy số từ danh mục chỉ số CRM có định nghĩa cố định; mỗi ngày chụp giá trị thành lịch sử không đổi; bấm vào con số ra danh sách bản ghi đằng sau; KR ngoài CRM nhận số qua khoá API và Google Sheets
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit: 40d423bb686da7d554d7f5b3bd914e818d9ec455
  disposition: keep
---

## Vấn đề & ai gặp

Từ 2026-10-26 mọi phòng ban cập nhật OKR quý 4 trong CRM (lộ trình OKR mục 1).
Lượt 3 (#140) cho đặt KR, lượt 4 (#153) cho cập nhật tuần, lượt 5 (#157) cho xem
toàn cảnh. Nhưng **mọi con số của KR đều do người gõ tay**, kể cả những số CRM đã
biết sẵn:

- Trưởng phòng kinh doanh đặt KR «50 thoả thuận chốt được trong quý» rồi mỗi thứ
  Hai mở màn Thoả thuận, lọc, đếm, gõ số vào cập nhật tuần. Số đếm tay lệch số
  màn Tổng quan là chuyện thường, và không ai biết số nào đúng.
- Ban lãnh đạo nhìn Toàn cảnh nhưng không bấm được vào con số để xem bản ghi nào
  làm nên nó — nên không tin số.
- Số của một ngày đã qua đổi khi ai đó mở lại một thoả thuận hay lưu trữ bản ghi;
  không có lịch sử nào giữ được «hôm đó số là bao nhiêu».
- KR của phòng ban ngoài CRM (số từ hệ thống khác, hay bảng tính Google đang dùng)
  vẫn phải gõ tay mỗi tuần.

Cột nguồn của KR đã có trong bảng từ lượt 3 với ba giá trị «tay · crm · api»,
nhưng chỉ nhận «tay»; không màn nào chọn được nguồn khác.

**Người gặp:** trưởng đơn vị và người phụ trách KR của khối kinh doanh (đặt KR có
nguồn, bỏ việc đếm tay), ban lãnh đạo (bấm vào số), phòng ban ngoài CRM (đẩy số
bằng khoá API hoặc Google Sheets), quản trị chương trình (đo tỷ lệ KR có nguồn).

Vật liệu nền: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 6» (DO-01…05, KR-04, KR-05
tự đo và API), mục 9 (NG-04 trình dựng truy vấn tự do, NG-05 máy ghi số hay mức
tự tin thay người — không làm); `CONTEXT.md` mục «Kết quả then chốt» (chỉ số là
danh mục số đo CRM mà KR lấy số từ đó), «Cập nhật tuần» (số tự chảy không phải cập
nhật tuần — mức tự tin và ghi chú vẫn do người ghi), «Chốt»; `docs/currency.md`
(vì sao tiền nằm ngoài lượt này).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bảy chỉ số đo được bằng bảng có sẵn, không thêm cột vào bảng cũ: thoả thuận chốt được (`stage = CLOSED_WON`, ngày `closedAt`, quy cho người phụ trách thoả thuận); thoả thuận mới (`createdAt`, người phụ trách); cuộc gọi chiến dịch hẹn được (`outcome = MEETING`, `createdAt`, người gọi); bước kế hoạch 30 ngày xong đúng hạn (`completedAt ≤ dueAt`, ngày `completedAt`, phòng ban của bước); cá nhân ghi danh đạt bậc (ngày đạt của bậc, quy cho người cầm trịch kế hoạch); form thành cá nhân (`filedAt` có `contactId`, quy cho người phụ trách cá nhân); email gửi ra (`fromEmail` trùng email thành viên, ngày `sentAt`). Bản ghi đã lưu trữ không đếm | Phải thêm cột hay bảng nguồn — lượt dài ra | Đọc `schema.prisma` và mã màn Tổng quan (`dashboard.service.ts` đếm «Chốt được» đúng như trên) | Đã đọc: đủ |
| 2 | Kỳ đo của KR là chu kỳ của mục tiêu: số là tổng cộng dồn từ ngày đầu chu kỳ tới hết ngày chụp (giờ Việt Nam) | KR muốn đo «tháng này» hay «tuần này» không đặt được | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 3 | Theo phòng ban hay bộ phận = theo phòng ban chính của người được quy công **tại lúc chụp**; bản chụp đã ghi không bao giờ tính lại khi người chuyển phòng | Số một phòng ban tụt khi người chuyển đi mà không ai hay | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 4 | Chụp mỗi ngày một lần trên nhịp dispatch của tác tử: nhịp đầu sau 00:00 giờ VN ghi bản chụp cho ngày vừa hết; một KR một ngày một dòng, chỉ thêm | Số «hôm nay» không có tới sáng mai | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 5 | KR có nguồn máy vẫn vào cập nhật tuần: người chọn mức tự tin và ghi chú, ô giá trị khoá theo số máy (NG-05 giữ nguyên — máy không chọn mức tự tin) | Người thấy hai số, không biết ghi số nào | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 6 | Đổi nguồn khi mục tiêu còn nháp có hiệu lực ngay; đổi khi mục tiêu đã công bố trong kỳ đang chạy thì để vết, tiến độ vẫn theo nguồn cũ tới hết kỳ, số máy hiện cạnh số tay | Tiến độ nhảy giữa kỳ vì đổi định nghĩa | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 7 | Bấm vào con số ra danh sách bản ghi tính lại theo định nghĩa lúc bấm, cho đúng khoảng ngày của bản chụp; lệch với số đã chụp thì màn nói ra, không giấu. Vai «chỉ OKR» thấy số, không thấy danh sách (dữ liệu đối tác) | Người bấm thấy danh sách khác số mà không được báo | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 8 | Google Sheets đọc bằng một tài khoản dịch vụ chỉ đọc (khoá tuỳ chọn trong `.env`; thiếu khoá thì nguồn Sheets không hiện, không lỗi): người chia sẻ bảng tính cho email của tài khoản đó, khai đường dẫn và ô. Phương án khác: đường dẫn «xuất bản lên web» dạng CSV — không cần khoá nhưng ai có đường dẫn đều đọc được số | Chọn sai thì hoặc lộ số, hoặc phải làm lại đường đọc | Chủ kho chọn tại Cổng Đáng | [đề xuất] mặc định tài khoản dịch vụ |
| 9 | «Khối kinh doanh» là một hay vài bộ phận trong cây tổ chức, chủ kho gọi tên khi đọc số; câu đếm nhận danh sách bộ phận | Ngưỡng đo sai tập KR | Chủ kho gọi tên tại Cổng Đáng hoặc ngày đọc số | [đề xuất] |
| 10 | Phép thử tin số trên production chạy sau triển khai (chỉ đọc); S4 chạy cùng phép thử trên kho riêng với số đếm độc lập viết tách khỏi mã danh mục | Không có bằng chứng tin số trước khi người dùng thấy | Hỏi tại Cổng Phạm vi | [đề xuất] |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: khối kinh doanh có thôi đếm tay và để KR lấy số từ CRM không, và số đó có đáng tin không?
- Kết quả nào là SỐNG: [đề xuất] trước 2026-12-01, ≥ 50% KR đã công bố của khối kinh doanh trong chu kỳ quý 4 có nguồn CRM (đếm từ bảng nguồn KR, danh sách bộ phận do chủ kho gọi tên); và phép thử tin số trên production — năm chỉ số so với số đếm tay — lệch không quá mức khai trước cho từng chỉ số.
- Kết quả nào là CHẾT: [đề xuất] < 20% KR của khối kinh doanh có nguồn CRM ngày 2026-12-01; hoặc một chỉ số lệch số đếm tay ngoài mức khai trước mà không giải thích được bằng định nghĩa.
- Timebox: phép thử tin số chạy trong tuần đầu sau khi lượt lên production; tỷ lệ KR có nguồn đọc ngày 2026-12-01.

## Kết quả prototype

Chưa dựng. Bản mẫu OKR đã duyệt (`/proto/ban-mau-okr`, PR #113) không có bề mặt
nguồn số. Bốn bề mặt mới — chọn nguồn trong hộp thoại KR, dấu nguồn và số bấm
được trên bảng KR, danh sách bản ghi đằng sau con số, lịch sử bản chụp cạnh số tay
— quyết ở S1-D: design-pass không đồng bộ, hoặc bỏ có tên với điều kiện S4 chụp
màn thật ở 1440 và 390 như lượt 3.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Danh mục chỉ số có định nghĩa cố định, không trình dựng truy vấn | Khuôn `CRM_EVENT_CATALOG` (`packages/db/src/crm-events.ts`); NG-04 | triết-lý/logic | có | — |
| Định nghĩa «Chốt được» | `apps/api/src/dashboard/dashboard.service.ts`, `CONTEXT.md` mục «Chốt» | triết-lý/logic | có | — |
| KR tự đo, lịch sử chụp, bấm vào số | Thực hành công cụ OKR cùng loại (Perdoo, Profit.co — tích hợp nguồn, «drill-down») | triết-lý/logic | có (ứng viên) | — |
| Google Sheets API v4, tài khoản dịch vụ | Tài liệu Google Cloud | triết-lý/logic | có (theo giả định 8) | — |

## Cổng 0

- **decision = …** Căn cứ: lộ trình OKR mục 5 «Lượt 6», mốc R2 2026-11-20.
- **disposition = keep.** Căn cứ: bản mẫu `ban-mau-okr` ở lại kho (`docs/proto.md`); lượt này không xoá gì của nó.
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Tỷ lệ KR khối kinh doanh có nguồn CRM → AC đọc lại nguồn và tham số của KR từ bảng, cộng một câu đếm có phép đo trên dữ liệu gieo (danh sách bộ phận là tham số).
- Lệch giữa số máy và số đếm tay → AC phép thử tin số: năm chỉ số so với số đếm độc lập, bảng lệch khai trước từng chỉ số.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/ban-mau-okr/` | Giữ | không | không đọc, không sửa |

## Out of scope từ khám phá

- Giá trị tiền của thoả thuận và chỉ số theo giai đoạn thoả thuận — nghĩa chưa chốt trong từ điển («Giai đoạn thoả thuận» chưa chốt; tiền cần luật `baseAmount` của `docs/currency.md`).
- Trình dựng truy vấn tự do, chỉ số do người tự định nghĩa (NG-04) — con số đổi nghĩa mà không ai hay.
- Máy chọn mức tự tin hay viết ghi chú thay người (NG-05).
- Kỳ đo tự chọn («tháng này», «tuần này») khác chu kỳ của mục tiêu (giả định 2).
- Đồng bộ hai chiều với Google Sheets (CRM ghi ngược vào bảng tính).
