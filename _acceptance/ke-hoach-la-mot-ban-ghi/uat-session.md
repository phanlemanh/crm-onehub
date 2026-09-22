---
schema_version: 1
slug: ke-hoach-la-mot-ban-ghi
feature: Kế hoạch 30 ngày là một bản ghi làm việc được — mở như thoả thuận, giao bước, đánh dấu xong, đổi cầm trịch, ghi chú, và mọi thay đổi để lại vết
owner: phanlemanh@gmail.com
stage: scheduled
verdict:
decided_by:
decided_at:
---

# Phiên nghiệm thu — ke-hoach-la-mot-ban-ghi

Bật trên production ngày 2026-09-22: PR #77 merge vào `onehub` ở `cca1cf4b`, ba bản production (app · api · agent) dựng thành công, migration `20260922052616_ke_hoach_la_mot_ban_ghi` chạy trong bước dựng crm-api (`docs/setup.md`, mục «Migrations run on the production deploy»).

Cờ vàng — **chưa lái-thử**: hồ sơ không có `stranger-drive.md`, nên điều kiện «sản phẩm thật chạy được cho người dự bấm» ở đây là lời khai (bản production dựng xanh), không phải bằng chứng từ nhật-ký-vấp.

## Ngưỡng đã khai tại Cổng Đáng (CHÉP NGUYÊN VĂN — cấm sửa sau khi thấy số)

- Câu hỏi phép đo trả lời: Sau khi bật, bước có thật sự được giao và đánh dấu
  xong trong CRM không — hay vẫn chỉ đọc?
- Kết quả nào là SỐNG: hai tuần sau khi bật, đủ ba điều — (a) mọi kế hoạch
  đang chạy có ít nhất một bước `completedAt ≠ null` hoặc `assigneeId ≠ null`,
  đếm trên `OnboardingStep`; (b) cột Im lặng khác `—` ở ít nhất một hàng danh
  mục; (c) phiên nghiệm thu Cổng Giá trị của vòng một chạy sau lượt này và
  đạt bốn ngưỡng đã ký 2026-09-19.
- Kết quả nào là CHẾT: hết hai tuần mà mọi bước vẫn `0/n`; hoặc bộ phận khai
  họ báo «xong» cho người cầm trịch qua chat rồi người đó đánh dấu hộ.

## Người dự

| Tên | Vai | Đại diện cho ai |
|---|---|---|

## Chấm kín (thu TRƯỚC mọi thảo luận chung)

| Người | Điểm/nhận xét kín | Sẽ gửi cho khách nào, khi nào |
|---|---|---|

## Thảo luận sau khi đã chấm

## Số đo thật đặt cạnh ngưỡng

| Thước | Ngưỡng đã khai | Số đo được | SỐNG/CHẾT |
|---|---|---|---|
| (a) kế hoạch đang chạy có ≥1 bước đã giao hoặc đã xong | mọi kế hoạch đang chạy, sau hai tuần | CHƯA ĐO — cửa sổ hai tuần mở 2026-09-22, đo sớm nhất 2026-10-06, trên `OnboardingStep` của production | — |
| (b) cột Im lặng khác `—` | ≥1 hàng danh mục, sau hai tuần | CHƯA ĐO — đo sớm nhất 2026-10-06 | — |
| (c) phiên nghiệm thu vòng một đạt bốn ngưỡng 2026-09-19 | phiên vòng một chạy sau lượt này và đạt | CHƯA ĐO — `dieu-phoi-30-ngay-dau` chưa có `uat-session.md`; ngưỡng của nó tính sáu tuần sau khi bật vòng một | — |
| CHẾT: bộ phận báo «xong» qua chat, người cầm trịch đánh dấu hộ | không xảy ra | CHƯA ĐO — cần hỏi từng bộ phận trong phiên; vết `buoc.xong` ghi tên người bấm, so được với người được giao | — |

## Quyết định Cổng Giá trị

- **verdict = …** Căn cứ: …
- Bước kế: …
