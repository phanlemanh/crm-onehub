---
schema_version: 1
slug: zalo-gui-hong-ghi-ly-do
feature: Zalo gửi hỏng thì nhật ký nói lý do Zalo đưa ra, và tin vào bị bỏ qua thì nhật ký nói vì sao — để biết chiều RA hỏng ở đâu
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08
prototype:
  base_commit:
  disposition:
---

Nguồn: S0 của H1 `zalo-hoi-okr-khong-chet` (P5-21, chuyện B). Giám sát xếp H4, mốc 2026-10-08, trước H3 (luật 39), sau khi chủ kho Lưu bot trên production lúc 11:01Z ngày 08/10: chiều VÀO sống lại, chiều RA vẫn hỏng.

## Bằng chứng (S0, 08/10, `vercel logs -p crm-onehub-agent`, production)

| Giờ (Z) | Request | Dòng log |
| --- | --- | --- |
| 2026-10-06T02:40:06 | `/internal/zalo/gui-thu 200` | `[zalo] sendMessage hong: tra-loi-la (Error)` |
| 2026-10-08T11:01:36 | `/internal/zalo/bot 200` | (chủ kho Lưu bot) |
| 2026-10-08T11:01:38 | `/zalo/webhook 200` | `[zalo] webhook sai khuon khoa=event_name,message khoa_message=date,message_id,text message_id=webhook-test` |
| 2026-10-08T11:01:51, 11:02:41 | `/internal/zalo/gui-thu` | `[zalo] sendMessage hong: tra-loi-la` (api `zalo.guiThu` trả 400) |
| 2026-10-08T11:02:09 | `/zalo/webhook 200` | log rỗng, không phiên agent nào sau đó |

(Dòng 11:01–11:02 do giám sát đọc và chuyển; dòng 06/10 P5 đọc ở S0 của H1.)

## Trả lời ba câu giám sát hỏi

**1. «tra-loi-la» là Zalo trả `ok:false` hay Zalo đổi khuôn?** Chưa đọc được từ nhật ký — chính đó là lỗi của hàng này. Điều đọc được từ mã:
- `lopLoi` (`apps/agent/agent/lib/zalo-bot-xuong.ts`) ghi `http-<mã>` khi lỗi là `LoiHttpZalo`, `mang (<code>)` khi lỗi mạng, còn lại `tra-loi-la (<tên lớp>)` — nó vứt `message` của lỗi. `parseZaloSend` (`packages/validation/src/zalo-update.ts`) ném `Zalo rejected the message (<description | error_code | "hinh dang la">)`, nên lý do có trong lỗi mà nhật ký không in.
- `zaloGoi` (`zalo-api.ts`) chỉ ném `LoiHttpZalo` khi HTTP không ok VÀ khác 408 (`ZALO.http.hetTin`, vốn dành cho `getUpdates`). Vậy «tra-loi-la» là một trong hai: HTTP 200 thân `ok:false` (Zalo từ chối, có `description`), hoặc HTTP 408 bị cho lọt rồi `parseZaloSend` ném.
- Khuôn thành công theo tài liệu chính thức (bot.zaloplatforms.com/docs/apis/sendMessage) là `{"ok":true,"result":{"message_id":"<chuỗi>","date":<số>}}` — khớp `guiDuoc`. Bảng mã lỗi chính thức chỉ có mã HTTP (400, 401, 403, 404, 408, 429) và dặn đọc `description`. Khả năng «Zalo đổi khuôn thành công» thấp; chưa loại hẳn được vì không có thân phản hồi nào được ghi.
- Giả thuyết khớp mọi dòng log nhưng CHƯA có căn cứ: bot sáng 30/09 (hai lần `/internal/zalo/bot` 08:48 và 09:15) là một bot khác bot cũ, nên mã người dùng Zalo (`zaloLink.zaloUserId`) đã lưu không còn hợp lệ với bot hiện tại — `sendMessage` tới các mã đó bị từ chối. Chỉ đọc được khi nhật ký giữ `description`.

**2. Sự kiện `webhook-test`.** Khi Lưu bot, Zalo gửi một sự kiện thử với `message` chỉ có `date, message_id, text` (không có `from`, `chat`). `parseZaloWebhook` không nhận, ghi «sai khuon», nhưng `nhanWebhook` vẫn trả 200 nên đăng ký vẫn thành công. Không làm hỏng gì, nhưng là nhiễu che lỗi thật trong nhật ký.

**3. Vì sao tin 11:02:09Z không sinh phiên.** Thân tin đã qua khuôn (không có dòng «sai khuon»), nên nó đi vào `xuLyTinDen` (`zalo-nhan.ts`). Các nhánh kết thúc KHÔNG ghi dòng nào:
- không phải chat riêng hoặc người gửi là bot (`laTinRieng`) → `bo-qua`;
- `message_id` đã gặp (`zaloUpdateSeen`) → `bo-qua`;
- người gửi đang bị chặn (`dangBiChan`) → `bo-qua`;
- người gửi chưa nối (`zaloLink` không có `zaloUserId` đó) → trả lời hướng dẫn bằng `guiZalo`; gửi được thì không ghi gì — gửi hỏng thì ghi `gui tra loi hong` (không thấy dòng đó).
Nếu giả thuyết ở câu 1 đúng, tin của chủ kho rơi vào nhánh «chưa nối» (mã người dùng đổi theo bot) — nên không có phiên agent. Hiện không phân biệt được nhánh nào vì cả bốn đều im.

## Giả định chốt sinh tử

- Ghi lý do (mã HTTP, `error_code`, `description`) và mã nhánh bỏ qua vào nhật ký là đủ để lần «Gửi thử» kế tiếp của chủ kho trả lời câu 1 và câu 3; không cần gửi tin thật để chẩn đoán.
- Không ghi nội dung tin nhắn hay token vào nhật ký — chỉ mã nhánh, `message_id`, mã lỗi và `description` của Zalo.

## Ngưỡng chết / ngưỡng UAT

[đề xuất] Việc nội bộ, không có người dùng.
- SỐNG: lần «Gửi thử» kế tiếp sau khi gộp in một dòng nhật ký có mã HTTP và `description`/`error_code` của Zalo; mỗi tin webhook không sinh phiên in đúng một dòng mã nhánh; sự kiện `webhook-test` không còn ghi «sai khuon».
- CHẾT: sau khi gộp còn một lần `sendMessage` hỏng mà nhật ký vẫn không có lý do của Zalo.
- Timebox: hàng sửa nóng, trong ngày 08–09/10.

## Câu hỏi mở cho Cổng Phạm vi

- Ngoại lệ 408 của `zaloGoi` có nên chỉ áp cho `getUpdates` không? (`sendMessage` hết giờ hiện bị tính thành «trả lời lạ».)
- Nếu giả thuyết «mã người dùng đổi theo bot» đúng, việc nối lại người dùng là hàng H3 hay hàng mới?

## Quyết định Cổng Đáng

08/10/2026, chủ kho qua giám sát: H4 `build`, sửa nóng, trước H3.
