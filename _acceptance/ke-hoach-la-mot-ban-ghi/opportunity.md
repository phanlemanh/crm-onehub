---
schema_version: 1
slug: ke-hoach-la-mot-ban-ghi
feature: Kế hoạch 30 ngày là một bản ghi làm việc được — mở như thoả thuận, giao bước, đánh dấu xong, đổi cầm trịch, ghi chú, và mọi thay đổi để lại vết
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-22T03:38:10Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Vòng một (`dieu-phoi-30-ngay-dau`, ký 2026-09-21) đưa khuôn, danh mục, hồ sơ,
phễu và điểm nhận vào CRM. Ba lượt rà trên `onehub.center` ngày 2026-09-22 và
bản quét không gian cùng ngày (thước Trello) chỉ ra một lỗ chung: **kế hoạch có
màn nhưng không có tay.**

- Sau khi tạo, không thủ tục nào ghi vào `OnboardingStep`. `assigneeId` và
  `completedAt` có trong schema, không ai ghi được. Hồ sơ hiện huy hiệu «Chưa
  giao», «Quá hạn» nhưng không có nút nào đổi được chúng.
- Vì thế ba cột danh mục đang chết trên production: Bước luôn `0/n`, Đang tắc ở
  luôn là bước đầu, Im lặng luôn `—`. Core #8 · #9 · #20 của bản quét 19/09
  chạy trên dữ liệu không thể đổi.
- Hồ sơ là trang riêng, khác họ record sheet của Công ty · Cá nhân · Thoả thuận:
  không tên đối tác, không dải số, không tab, không đường nối sang công ty.
- Nút xoá môi giới luôn xoá người đầu danh sách; hạn hôm nay đã bị gắn «Quá hạn».

**Người gặp:** nhân viên quan hệ đối tác (không giao được việc), bộ phận chuyên
môn (không đánh dấu xong được, nên không rời khỏi nhóm «đang tắc»), quản lý
(đọc số chết mà tưởng số sống).

Hợp đồng vòng một xanh 14 tiêu chí mà lỗ này lọt vì chỉ đo **tạo** và **đọc**,
không đo **ghi sau khi tạo**. Lượt này trả nợ đó, và là lượt 1 của lộ trình
`docs/plan/lo-trinh-dieu-phoi-30-ngay.md`.

## Phạm vi đề xuất

Một câu: *«Tôi mở một đối tác như mở một thoả thuận, giao bước, đánh dấu xong,
và thấy ai làm gì lúc nào.»*

- API: `updateStep` (người · xong · hạn · nhãn), `addStep`, `removeStep`,
  `reorderSteps`, `updatePlan` (cầm trịch · số ngày). Mọi thủ tục chạm
  `updatedAt` của bước để «Im lặng» sống lại.
- Vết: `Activity.planId`; mỗi giao / xong / đổi hạn / đổi cầm trịch là một
  `Activity`; ghi chú là `NOTE`; `TimelineAnchor` nhận `planId`.
- Giao diện: `plan` vào `RECORD_KINDS`, `PlanSheet` trên `RecordSheetFrame` —
  tiêu đề tên đối tác, dải số Ngày · Bước · Im · Cầm trịch, tab Bước (gom theo
  bộ phận, nút giao và nút xong trên dòng) · Môi giới (bảng có tiêu đề bậc,
  nút xoá từng hàng) · Hoạt động. `/onboarding/[planId]` chuyển hướng về
  `?record=plan:<id>`.
- Hai lỗi nhỏ; mục từ điển cho kế hoạch · bước · bậc · người cầm trịch · ghi danh.

**Hạng T3** — chạm `packages/db/prisma` (`Activity.planId`).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Dùng lại `Activity` cho vết là đủ; không cần bảng vết riêng | Tab Hoạt động lẫn ghi chú với vết máy, khó lọc | Đếm kiểu `ActivityType` hiện có: `TASK` · `STAGE_CHANGE` · `NOTE` phủ ba loại vết cần | Chưa thử — xét ở Cổng 1.5 |
| 2 | Bộ phận chuyên môn có tài khoản CRM để được giao và tự đánh dấu xong | Người cầm trịch phải đánh dấu hộ, vết ghi sai người | Hỏi mỗi trưởng bộ phận một câu (giả định 4 của vòng một, vẫn chưa thử) | Chưa thử |
| 3 | Sheet kế hoạch cùng khung với sheet thoả thuận là đủ, không cần trang riêng cho phễu 80 môi giới | Tab Môi giới quá dài trong sheet | Design-pass chụp với 80 dòng giả | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, bước có thật sự được giao và đánh dấu
  xong trong CRM không — hay vẫn chỉ đọc?
- Kết quả nào là SỐNG: hai tuần sau khi bật, đủ ba điều — (a) mọi kế hoạch
  đang chạy có ít nhất một bước `completedAt ≠ null` hoặc `assigneeId ≠ null`,
  đếm trên `OnboardingStep`; (b) cột Im lặng khác `—` ở ít nhất một hàng danh
  mục; (c) phiên nghiệm thu Cổng Giá trị của vòng một chạy sau lượt này và
  đạt bốn ngưỡng đã ký 2026-09-19.
- Kết quả nào là CHẾT: hết hai tuần mà mọi bước vẫn `0/n`; hoặc bộ phận khai
  họ báo «xong» cho người cầm trịch qua chat rồi người đó đánh dấu hộ.
- Timebox: hai ngày công cho bản bấm được (sheet kế hoạch với tab Bước có nút
  giao và xong) trước Cổng 1; quá hai ngày là đang xây, không phải hội tụ.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Giải phẫu thẻ Trello: checklist có người và hạn trên từng mục, bình luận, nhật ký | Trello (hiểu biết chắc) | triết-lý/logic | có — chỉ phần mục có người và hạn; kéo thả và nhãn tự do là Never | — |
| Khung `RecordSheetFrame`, `DetailSheetStats`, `Timeline` | `apps/app/components/crm/record-sheet`, `components/detail-sheet` | ngôn-ngữ-thiết-kế/hình-thái | có — bắt buộc, `AGENTS.md` | — |
| Lộ trình năm lượt | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md` | triết-lý/logic | có | — |

## Cổng 0

- **decision = build** Căn cứ (chủ kho, 2026-09-22T03:38:10Z): lỗ đã xác nhận trên production — không thủ tục nào ghi vào bước sau khi tạo; mọi ô Core 1–6 của bản quét 2026-09-22 nằm trong lượt này.
- **disposition = archive** Căn cứ: chưa dựng prototype, `base_commit` để trống.
- **Ngưỡng UAT chốt cùng lúc ký:** nguyên văn ba vế SỐNG và một vế CHẾT ở mục «Ngưỡng chết / ngưỡng UAT».

## Thước đo thành công → ứng viên criterion

- Mỗi thủ tục ghi có một tiêu chí đọc lại từ DB thấy đúng.
- `imNgay` của hàng danh mục đổi sau khi đánh dấu một bước xong.
- Tab Hoạt động hiện đúng dòng vết cho một lần giao và một lần xong.
- Xoá môi giới xoá đúng người được chọn; hộp xác nhận nêu tên.
- Bước hạn hôm nay không bị gắn «Quá hạn».

## Out of scope từ khám phá

- Tab «30 ngày» trong sheet Công ty, dòng ở sheet Cá nhân, «việc của tôi» — lượt 2.
- Nhắc, cảnh báo, theo dõi — lượt 3.
- Việc con, phụ thuộc, đính kèm — lượt 4.
- Kéo thả bảng cột — Never.
