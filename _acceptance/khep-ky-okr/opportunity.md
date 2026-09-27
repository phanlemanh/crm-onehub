---
schema_version: 1
slug: khep-ky-okr
feature: Khép kỳ OKR — quản trị mở cửa sổ rà giữa kỳ; cuối kỳ máy gợi ý điểm từ số chốt, người chỉnh được kèm lý do; mỗi mục tiêu có ô điều học được; kỳ chỉ đóng khi mọi KR đã chấm; mục tiêu dở mang sang kỳ sau; số kỳ đã đóng bị khoá và xuất được; kiểm chất lượng khi đặt bằng luật
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-27T11:05:07Z
prototype:
  base_commit: 1f34aeac21b632206bf92586efc2b3400cfa8257
  disposition: keep
---

## Vấn đề & ai gặp

Từ 2026-10-26 mọi phòng ban đặt và cập nhật OKR quý 4 trong CRM (lộ trình OKR mục
1). Lượt 3–6 (#140, #153, #157, #162) phủ vòng đặt → cập nhật tuần → xem → số tự
chảy. **Nửa sau của vòng chưa có trong công cụ:**

- Pha «Chấm điểm» và «Đã đóng» đã có trong danh mục chu kỳ từ lượt 3, nhưng chỉ
  để khoá ghi. Không có chỗ nào ghi điểm cho một KR, không có ô «điều học được»,
  không có cách mang mục tiêu dở sang quý sau. Đóng quý 4 hôm nay nghĩa là chấm
  trên bảng tính ngoài rồi gõ lại tay mục tiêu quý 1 — đúng thứ lộ trình muốn thay.
- Đích của KR sửa được bất cứ lúc nào trong pha «Đang chạy» mà không cần lý do. Tới
  lúc chấm, không ai biết KR đạt 0,9 vì làm tốt hay vì đích đã hạ giữa kỳ.
- Không có dịp rà giữa kỳ có tên: đơn vị muốn chỉnh đích thì cứ chỉnh, quản trị
  không mở hay đóng được một khoảng «được chỉnh».
- Pha chỉ đi tới. Đóng nhầm một kỳ thì không mở lại được, trừ khi sửa cơ sở dữ liệu.
- Kỳ đã đóng không xuất được ra để lưu hay gửi ban lãnh đạo.
- Câu mục tiêu và KR viết vội (mùa đặt OKR quý 1 bắt đầu 21/12) hay rơi vào bốn lỗi
  cũ: KR là việc làm («gọi 50 cuộc»), thiếu khởi điểm, đích bằng khởi điểm, cả bộ
  KR chỉ đẩy một chiều không có đối trọng. Không ai hỏi lại lúc đặt.

**Hạn cứng:** lên production trước 2026-12-14 — đóng quý 4 dùng nó (lộ trình mục 5
«Lượt 7»).

**Người gặp:** trưởng đơn vị (chấm và nhìn lại với đơn vị cuối quý, mang mục tiêu dở
sang quý 1), người phụ trách KR (thấy số chốt và điểm gợi ý, ghi lý do khi chỉnh),
quản trị chương trình (mở rà giữa kỳ, sang pha chấm, đóng kỳ khi đủ điểm, mở lại khi
đóng nhầm, xuất kỳ đã đóng), người đặt OKR mùa quý 1 (được hỏi lại khi câu rơi vào
bốn lỗi), lượt 9b (chạy câu hỏi chất lượng bằng mô hình **sau** lớp luật này).

Vật liệu nền: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 7» (CK-04, CD-01…05, AI-03
phần luật), mục 3 (câu giao); `docs/plan/lo-trinh-tro-ly-okr.md` mục 4 (thứ tự: sau
9a; 9b đứng trên luật lượt 7); báo cáo `docs/reports/2026-09-26-tro-ly-okr/`
(07 mục 6.5 «hỏi, không chặn lưu»; 10-A và 10-B: luật ở
`packages/validation/src/okr-kiem.ts`, trả mã luật ổn định để mô hình chỉ nói điều
luật chưa bắt); `CONTEXT.md` mục «Điểm cuối kỳ», «Chu kỳ», «Chương trình OKR»,
«Kết quả then chốt»; hồ sơ `dat-okr-trong-crm` (bốn pha, khoá ghi ở «Chấm điểm» và
«Đã đóng», Out of scope «rà giữa kỳ, chấm, khép kỳ, mở lại kỳ — lượt 7»).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Số chốt của một KR là giá trị hiện tại lúc chu kỳ sang pha «Chấm điểm»; sang pha chấm chỉ được từ ngày sau ngày cuối của chu kỳ (giờ Việt Nam), để bản chụp số máy của ngày cuối đã ghi | Điểm gợi ý tính trên số còn đổi, hoặc thiếu ngày cuối của KR số máy | Đọc lịch nhịp chụp của lượt 6 (00:05 hôm sau) | [đề xuất] |
| 2 | Máy gợi ý điểm theo kiểu KR, trên thang chương trình đang áp lúc sang pha chấm (0–1 bước 0,1 hoặc 0–100 bước 10): dùng đúng hàm tiến độ của thanh tiến độ (tăng tới / giảm xuống theo phần đi được từ khởi điểm tới đích, cắt trong [0, 1]; giữ trên / giữ dưới đạt thì 1, không đạt thì 0; mốc xong 1, chưa 0; phần trăm = số chốt / 100 như thanh tiến độ hôm nay), làm tròn tới bậc gần nhất, nửa bậc làm tròn lên | Người không tin điểm gợi ý và chỉnh gần hết | Hỏi tại Cổng Phạm vi; đọc tỷ lệ chỉnh sau quý 4 | [đề xuất] |
| 3 | Người chấm là người sửa được KR (người phụ trách KR, trưởng đơn vị, quản trị); chỉnh khác gợi ý thì bắt lý do | Người phụ trách tự chấm cao cho mình | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 4 | Cửa sổ rà giữa kỳ do quản trị mở cho cả chu kỳ, một khoảng ngày trong pha «Đang chạy». Trong cửa sổ sửa đích như hôm nay (có vết); ngoài cửa sổ, sửa đích của mục tiêu đã công bố bắt lý do và KR mang nhãn «đích sửa ngoài rà» tới lúc chấm | Đơn vị bị chặn sửa đích hợp lý giữa kỳ | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 5 | Kỳ chỉ đóng khi mọi KR của mục tiêu đã công bố (không tính mục tiêu đã bỏ) có điểm người xác nhận; ô «điều học được» không bắt buộc để đóng | Kỳ kẹt vì một đơn vị không nhìn lại; hoặc ngược lại, đóng mà không ai nhìn lại | Chủ kho chọn tại Cổng Đáng | Chốt tại Cổng Đáng: không bắt buộc |
| 6 | Mang sang = tạo bản nháp ở chu kỳ kế (cùng cấp, đơn vị, loại, người phụ trách; KR giữ đích, khởi điểm bằng số chốt), nối hai chiều với mục tiêu gốc; mục tiêu gốc và điểm của nó không đổi | Bản sao mất dấu nguồn, hoặc số quý cũ bị sửa theo | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 7 | Mở lại: quản trị, lý do bắt buộc, «Đã đóng» → «Chấm điểm», để vết; số chốt không tính lại | Mở lại làm lệch số đã báo lên ban lãnh đạo | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 8 | Xuất: tệp CSV một dòng mỗi KR của kỳ đã đóng, cho mọi vai đọc được OKR (kể cả «chỉ OKR»), không kèm dữ liệu đối tác | Bảng lãnh đạo cần định dạng khác | Hỏi tại Cổng Phạm vi | [đề xuất] |
| 9 | Kiểm chất lượng bằng bốn luật (KR là việc làm, thiếu khởi điểm, đích bằng khởi điểm, thiếu đối trọng) là hàm thuần ở gói dùng chung, trả mã luật ổn định; hiện thành câu hỏi trong hộp thoại mục tiêu và KR, không chặn lưu | Luật hỏi sai nhiều, người tắt mắt; 9b không dùng lại được | Chạy luật trên bộ câu mẫu viết trước | [đề xuất] |
| 10 | Điểm cuối kỳ không phải đánh giá nhân sự: màn chấm ghi rõ câu đó; không có bảng xếp người hay xếp đơn vị theo điểm; mục tiêu tham vọng đạt 0,7 đọc là tốt | Điểm thành chỉ tiêu, người đặt đích thấp | Từ điển đã chốt 2026-09-24 | Đã chốt trong từ điển |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: quý 4/2026 có được khép trọn trong công cụ không — chấm, nhìn lại, mang sang — thay cho bảng tính?
- Kết quả nào là SỐNG: chu kỳ quý 4/2026 ở pha «Đã đóng» trong CRM trước 2027-01-15, nghĩa là mọi KR của mục tiêu đã công bố có điểm người xác nhận trong công cụ; ≥ 70% mục tiêu đã công bố có «điều học được» không trống; đọc kèm (không ngưỡng) tỷ lệ mục tiêu dở được mang sang quý 1 qua công cụ và tỷ lệ điểm người chỉnh khác gợi ý.
- Kết quả nào là CHẾT: tới 2027-01-31 quý 4 chưa đóng trong CRM, hoặc đơn vị chấm trên bảng tính ngoài rồi gõ lại; hoặc < 40% mục tiêu đã công bố có «điều học được»; hoặc phải mở lại kỳ vì lỗi của công cụ.
- Timebox: công cụ lên production trước 2026-12-14; đọc số 2027-01-15, đọc lần cuối 2027-01-31.

## Kết quả prototype

Chưa dựng. Bản mẫu OKR đã duyệt (`/proto/ban-mau-okr`, PR #113) và bản mẫu lượt 5
(`/proto/toan-canh-okr`) không có bề mặt chấm, nhìn lại, mang sang, rà giữa kỳ hay
đóng/mở lại kỳ. Các bề mặt mới dựng ở S1-D bằng design-pass không đồng bộ trên
`/proto/khep-ky-okr`.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Chấm KR 0–1, tham vọng 0,7 là tốt, điểm không nối lương | Google re:Work «Set goals with OKRs»; `CONTEXT.md` «Điểm cuối kỳ» | triết-lý/logic | có | — |
| Rà giữa kỳ, mang mục tiêu dở sang kỳ sau, điều học được | Thực hành công cụ OKR cùng loại (Perdoo, Profit.co, Weekdone — «retrospective», «carry over») | triết-lý/logic | có (ứng viên) | — |
| Bốn luật chất lượng khi đặt | Lộ trình lượt 7; báo cáo 07 mục 6.5, 10-B dòng 891 | triết-lý/logic | có | — |

## Cổng 0

- **decision = build.** Căn cứ: lộ trình OKR mục 5 «Lượt 7», hạn cứng 2026-12-14 để đóng quý 4; lượt 4 và 6 đã lên nên chân đứng đủ. Quyết 2026-09-27 bởi Manh Phan trong phiên lượt 7.
- **disposition = keep.** Căn cứ: bản mẫu `ban-mau-okr` và `toan-canh-okr` ở lại kho (`docs/proto.md`); lượt này thêm bản mẫu `khep-ky-okr`, không xoá gì.
- **Ngưỡng UAT chốt cùng lúc ký:** gỡ nhãn đề xuất cho SỐNG và CHẾT như section Ngưỡng; «điều học được» không bắt buộc để đóng kỳ; đọc số 2027-01-15, đọc lần cuối 2027-01-31.

## Thước đo thành công → ứng viên criterion

- Quý 4 đóng trong công cụ trước 2027-01-15 → AC đóng kỳ bị từ chối khi còn KR chưa chấm và đi được khi đủ; câu đếm KR chưa chấm theo đơn vị có phép đo trên dữ liệu gieo.
- Tỷ lệ mục tiêu có «điều học được» → AC ghi và đọc lại ô từ bảng; câu đếm tỷ lệ có phép đo.
- Tỷ lệ mang sang và tỷ lệ điểm chỉnh khác gợi ý → AC mang sang để nối hai chiều đọc lại được; AC điểm lưu cả điểm gợi ý lẫn điểm người.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/ban-mau-okr/` | Giữ | không | chỉ nhập khung `KhungUngDung`, không sửa |
| `apps/app/app/proto/_modules/toan-canh-okr/` | Giữ | không | không đọc, không sửa |

## Out of scope từ khám phá

- Kiểm chất lượng bằng mô hình, viết lại câu — lượt 9b, chạy sau lớp luật này.
- Nhắc người chấm hay nhắc rà giữa kỳ qua Slack, Zalo — quản trị báo bằng kênh sẵn có; nhắc theo lịch là một vòng có hợp đồng.
- Nối điểm cuối kỳ vào lương, thưởng, xếp hạng người hay xếp hạng đơn vị — từ điển cấm.
- Nháp «điều học được» bằng máy — lộ trình Trợ lý OKR mục 4 «Sau mùa».
- Kiểm luật trên màn xem trước khi nhập bảng tính — dùng được cùng hàm luật, nhưng thêm một bề mặt; mở lại trước mùa quý 1 nếu cần.
