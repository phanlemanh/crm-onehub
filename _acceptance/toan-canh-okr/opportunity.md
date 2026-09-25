---
schema_version: 1
slug: toan-canh-okr
feature: Toàn cảnh OKR và họp tuần — danh sách theo đơn vị có lọc ở máy chủ, cây căn chỉnh toàn công ty đi bằng bàn phím, bảng họp tuần xếp theo thứ đáng bàn, toàn cảnh cho lãnh đạo có heatmap, khối OKR trên Tổng quan và trang OKR của một người, màn sức khoẻ chương trình cho quản trị; các biến thể packages/ui từ bản mẫu
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit: 100847e8a747d474b79bc10adb82a94e06313f82
  disposition: keep
---

## Vấn đề & ai gặp

Từ 2026-10-26 mọi phòng ban đặt và cập nhật OKR quý 4 trong CRM (lộ trình OKR
mục 1). Lượt 3 (#140) cho đặt được OKR; lượt 4 (`cap-nhat-tuan-okr`, đang dựng)
cho cập nhật tuần. Nhưng sau khi số đã vào, **chưa ai nhìn được chúng cùng lúc**:

- Trưởng đơn vị họp tuần phải mở từng mục tiêu một để biết KR nào tự tin tụt,
  KR nào im, ai vừa ghi chú gì — hôm nay làm việc đó trong bảng tính.
- Ban lãnh đạo không có chỗ nào thấy tiến độ và mức tự tin của mọi đơn vị trên
  một màn; tab «Toàn cảnh» là chỗ đứng «mở ở lượt 5».
- «Theo đơn vị» chỉ đọc đúng một đơn vị — chọn một bộ phận không kéo theo phòng
  ban con, không lọc được theo người, loại, trạng thái hay mức tự tin.
- Cây căn chỉnh toàn công ty có dữ liệu nhưng không gập mở, không đi được bằng
  bàn phím.
- Quản trị chương trình không biết đơn vị nào đang bỏ cập nhật tuần, KR nào im,
  KR nào chưa có khởi điểm, ai chưa nối kênh nhắc — nên không biết phải kèm ai.
- Thanh tiến độ hôm nay tô màu thương hiệu và không có vạch «lẽ ra đã tới đây»
  (giới hạn đã biết của lượt 3).

**Người gặp:** trưởng đơn vị (chạy họp tuần), ban lãnh đạo (toàn cảnh), mọi
nhân viên kể cả vai «chỉ OKR» (xem toàn cảnh, cây căn chỉnh, OKR của mình trên
Tổng quan), quản trị chương trình (sức khoẻ chương trình).

Vật liệu nền: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 5», mục 6 (trang hướng
dẫn theo vai, đếm người chưa có kênh nhắc); bản phạm vi OKR (mã XEM-02…07,
QT-04); bản mẫu đã duyệt `_acceptance/ban-mau-okr` (heatmap đơn vị × tuần, mức
tự tin ba bậc, mọi vai thấy «Toàn cảnh», Nhóm 2 mười một biến thể
`packages/ui`); hình dữ liệu cập nhật tuần của lượt 4 (`okrCheckIn`: tuần, KR,
giá trị, mức tự tin, ghi chú).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bảng lần cập nhật của lượt 4 (một dòng mỗi KR mỗi lần, có tuần, mức tự tin, ghi chú, chỉ thêm) là đủ để xếp bảng họp tuần và vẽ heatmap — không cần bảng chụp riêng | Phải thêm bảng tổng hợp theo tuần, lượt này thành T3 | Đọc hợp đồng và schema lượt 4 (`okrCheckIn.weekStart`, `confidence`, `note`, chỉ mục `[keyResultId, createdAt]`, `[weekStart]`) | Đã đọc: đủ |
| 2 | Trưởng đơn vị chạy họp tuần theo KR (tự tin tụt, KR im, ghi chú mới) chứ không theo người — màn không cần danh sách người chưa cập nhật | Họp tuần vẫn quay về bảng tính để điểm danh người | Ngưỡng Cổng Giá trị bên dưới đo đúng câu này | Chốt ở lộ trình và NG-07 |
| 3 | Lọc và dựng cây ở máy chủ chịu được vài trăm người, vài nghìn KR mỗi chu kỳ mà màn vẫn mở dưới 1 giây | Toàn cảnh chậm, người quay về bảng tính | Phép đo số truy vấn không tăng theo số đơn vị + đo thời gian trên bộ gieo 50 đơn vị × 2.000 KR | [đề xuất] thử ở S4 |
| 4 | CRM chưa có trang hồ sơ nhân viên; «trang cá nhân» của XEM-07 là trang OKR của một người («Theo đơn vị» chọn một người) — không dựng trang hồ sơ mới | Phải dựng trang hồ sơ, việc ngoài khu OKR | Hỏi tại Cổng Phạm vi | [đề xuất] chờ Cổng Phạm vi |
| 5 | «KR thiếu khởi điểm» của QT-04 nghĩa là KR thuộc mục tiêu chưa công bố trong chu kỳ đang chạy (khởi điểm chưa khoá) | Số sức khoẻ đếm sai thứ | Hỏi tại Cổng Phạm vi | [đề xuất] chờ Cổng Phạm vi |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: trưởng đơn vị có chạy được họp tuần chỉ trên màn của CRM, không mở bảng tính hay màn khác, không?
- Kết quả nào là SỐNG: [đề xuất] ở phiên nghiệm thu R1, ≥ 2/3 trưởng đơn vị dự phiên chạy xong họp tuần của đơn vị mình chỉ trên bảng họp tuần — bấm giờ, trung vị ≤ 15 phút cho một đơn vị ≤ 12 KR; và từ tuần thứ ba của quý 4, ≥ 60% đơn vị có trưởng mở bảng họp tuần ít nhất một lần mỗi tuần (số từ nhật ký tRPC của thủ tục bảng họp tuần theo `userId`).
- Kết quả nào là CHẾT: [đề xuất] trưởng đơn vị phải mở màn khác hoặc bảng tính để biết KR nào đáng bàn; hoặc < 30% đơn vị mở bảng họp tuần ở tuần thứ ba.
- Timebox: đo ở phiên nghiệm thu R1 ngày 2026-11-13; số nhật ký lấy tuần 2026-11-09.

## Kết quả prototype

Bản mẫu `/proto/ban-mau-okr` (PR #113) đã duyệt 2026-09-24 cho «Toàn cảnh» và
«Theo đơn vị» (kể cả cây căn chỉnh và heatmap). **Chưa có bản mẫu** cho bảng họp
tuần, màn sức khoẻ chương trình, khối OKR trên Tổng quan và trang của một người,
biểu đồ đường có đích trên sheet mục tiêu — bốn bề mặt này đi design-pass ở S1-D
trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Bản mẫu Toàn cảnh, Theo đơn vị, Nhóm 2 biến thể | `apps/app/app/proto/_modules/ban-mau-okr/`, `_acceptance/ban-mau-okr/design-pass.md` | hình thái đã duyệt | có | Manh Phan 2026-09-24 |
| Hình dữ liệu cập nhật tuần | `feat/cap-nhat-tuan-okr` (lượt 4) — chỉ đọc hình, không chép mã | triết-lý/logic | có (chờ gộp) | — |
| Cây đi bằng bàn phím | WAI-ARIA Authoring Practices, mẫu «Tree View» | triết-lý/logic | có | — |
| Bảng họp tuần theo KR, heatmap tự tin | Thực hành công cụ OKR cùng loại (Perdoo, Weekdone — xếp theo rủi ro, không theo người) | triết-lý/logic | có (ứng viên) | — |

## Cổng 0

- **decision:** chờ người ký (uỷ quyền phiên điều phối). Máy khuyên **build**: lượt đã có trong lộ trình, hạn R1 2026-10-23.
- **disposition = keep.** Bản mẫu `ban-mau-okr` ở lại kho; lượt này thêm một module bản mẫu cho bốn bề mặt còn thiếu.

## Thước đo thành công → ứng viên criterion

- Thời gian họp tuần trên màn → AC bảng họp tuần xếp đúng thứ đáng bàn, theo KR.
- Số lần mở bảng họp tuần theo trưởng đơn vị → thủ tục riêng cho bảng họp tuần, dòng nhật ký tRPC có `userId` (đã có sẵn ở `LoggingMiddleware`).

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/ban-mau-okr/phan-chung.tsx` | Giữ; `ThanhTienDo`, `TuTin`, `TinhTrangKr` dựng lại thành biến thể `packages/ui` | không | bản mẫu giữ nguyên làm phòng trưng bày |
| `apps/app/app/proto/_modules/ban-mau-okr/toan-canh.tsx` | Giữ; heatmap dựng lại trong `packages/ui` | không | — |
| `apps/app/app/(app)/[slug]/okr/toan-canh/page.tsx` | Dựng lại | không | chỗ đứng của lượt 3 |

## Out of scope từ khám phá

- Trang hồ sơ nhân viên ngoài khu OKR (xem giả định 4).
- Bảng xếp hạng người, danh sách người chưa cập nhật (NG-07).
- Bộ lọc lưu được, tìm OKR trong ô tìm chung (XEM-08, XEM-09 — lượt 8).
- Cảnh báo rủi ro tự động từ độ lệch tiến độ và tự tin (AI-06 — lượt 10).
- Bản tin tuần vào kênh Slack của đơn vị (NH-05 — lượt 8).
