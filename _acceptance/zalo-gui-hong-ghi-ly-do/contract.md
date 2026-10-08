---
schema_version: 1
feature: Zalo gửi hỏng thì nhật ký nói lý do của Zalo; tin vào bị bỏ qua thì nhật ký nói vì sao; sự kiện thử của Zalo không còn ghi là sai khuôn
slug: zalo-gui-hong-ghi-ly-do
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: draft
approved_by:
approved_at:
design_doc: _acceptance/zalo-gui-hong-ghi-ly-do/design.md
---

# Acceptance Contract: zalo-gui-hong-ghi-ly-do

## Context

Từ 30/09 «Gửi thử» Zalo trên production hỏng với dòng `[zalo] sendMessage hong: tra-loi-la (Error)` — nhật ký vứt lý do Zalo đưa ra. Sau khi chủ kho Lưu bot lúc 11:01Z ngày 08/10, chiều vào sống lại, chiều ra vẫn hỏng; một tin vào lúc 11:02:09Z không sinh phiên mà không ghi dòng nào. Không chẩn đoán được nếu không gửi tin thật.

Cổng Đáng: chủ kho qua giám sát, 08/10 — hàng sửa nóng H4.

Source input: `opportunity.md`, `design.md`.

## Criteria

- AC-1: Given `sendMessage` của Zalo trả một trong chín phản hồi viết trước — HTTP 200 `{ok:false,error_code,description}`, HTTP 200 `{ok:false}` không mô tả, HTTP 200 thân không có `ok`, HTTP 401, 403, 429, 500, 408, và lỗi mạng có `code` — When một lần gửi hỏng được mô tả, Then dòng mô tả lần lượt là `zalo-tu-choi <error_code> «<description>»`, `zalo-tu-choi - «-»`, `hinh-dang-la khoa=<tên khoá>`, `http-401`, `http-403`, `http-429`, `http-500`, `http-408`, `mang (<code>)`; description dài hơn trần thì bị cắt đúng ở trần.
- AC-2: Given Zalo trả HTTP 408 cho `getUpdates`, When kéo tin, Then vẫn là «hết tin» như hôm nay; And HTTP 408 cho mọi lệnh khác là lỗi `http-408`.
- AC-3: Given Zalo từ chối với `description` ghim, When mỗi chỗ gửi trong bảy chỗ hỏng — gửi thử (`zalo-bot-xuong.ts`), trả lời phiên, báo lỗi phiên, `sendChatAction`, không mở được phiên (`zalo-tra-loi.ts`), bắt đầu lại (`zalo-nhan.ts`), báo quá hạn (`zalo-hoi.ts`) — Then dòng `[zalo]` của chỗ đó chứa đúng `zalo-tu-choi <mã> «<description ghim>»`.
- AC-4: Given một tin webhook hợp lệ rơi vào một trong bốn nhánh không mở phiên — không phải chat riêng hoặc người gửi là bot, `message_id` đã gặp, người gửi đang bị chặn, người gửi chưa nối — When `nhanWebhook` xử lý, Then nhật ký có đúng một dòng `[zalo] bo qua message_id=<id> ly_do=<khong-rieng|da-gap|bi-chan|chua-noi>`, và hành vi trả lời giữ nguyên.
- AC-5: Given sự kiện đăng ký của Zalo có `message.message_id = "webhook-test"` (không `from`, `chat`), When tới `/zalo/webhook` với khoá đúng, Then trả 200 và ghi đúng một dòng `[zalo] webhook-test`, không dòng «sai khuon»; And một thân hỏng thật vẫn ghi «sai khuon» như trước.
- AC-6: Given đầu vào của AC-1, AC-3, AC-4 chứa token bot, chat id và chữ tin nhắn có thể nhận ra, When các dòng nhật ký được ghi, Then không dòng nào chứa ba chuỗi đó.
- AC-7: Given diff của vòng so với merge-base với `onehub`, Then chỉ các tệp `apps/agent/agent/lib/zalo-api.ts`, `zalo-bot-xuong.ts`, `zalo-nhan.ts`, `zalo-tra-loi.ts`, `zalo-hoi.ts`, `zalo-webhook.ts`, `zalo-config.ts` (dưới `apps/agent/agent/lib/`), `packages/validation/src/zalo-update.ts`, `apps/agent/test/zalo-gui-hong-ly-do*.spec.ts`, `_acceptance/zalo-gui-hong-ghi-ly-do/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` và các dòng THÊM vào `_acceptance/config.yaml` đổi.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 08/10.

- **Trục A — phản hồi Zalo:** chín dạng ở AC-1.
  - Thước CE: `zaloGoi` + `parseZaloSend` + bảng mã lỗi chính thức (bot.zaloplatforms.com/docs/error-code) + khuôn thành công (docs/apis/sendMessage).
- **Trục B — chỗ ghi lỗi gửi:** bảy chỗ ở AC-3.
  - Thước CE: `git grep "console.error(" -- apps/agent/agent/lib/zalo-*.ts` (đọc 08/10).
- **Trục C — nhánh tin vào không mở phiên:** bốn nhánh ở AC-4 + sự kiện thử (AC-5).
  - Thước CE: `xuLyTinDen`, `xuLyDb`, `khongMa` trong `zalo-nhan.ts`; `nhanWebhook`.
- **Ô Core:** A (AC-1, AC-2) · A×B lấy một phản hồi ghim (AC-3) · C (AC-4, AC-5) · lớp riêng tư (AC-6) · ranh giới (AC-7).
- **Đối chiếu ngành:** [NGÀNH: Zalo Bot Platform — bảng mã lỗi HTTP 400/401/403/404/408/429 và trường `description`, bot.zaloplatforms.com/docs/error-code].
- **Later:** nối lại người dùng nếu lý do cho thấy mã người dùng đổi theo bot.

## Đường đo

- «Lần Gửi thử kế tiếp sau gộp in mã HTTP và description/error_code»: không có bộ đếm máy; người đo đọc `vercel logs -p crm-onehub-agent … --query "sendMessage hong"` sau lần «Gửi thử» đầu tiên · AC-1, AC-3.
- «Mỗi tin webhook không sinh phiên in đúng một dòng mã nhánh»: `vercel logs … --query "bo qua message_id"` · AC-4.

## Out of scope

- Sửa nguyên nhân chiều ra (chưa biết; hàng này làm nó hiện ra).
- Nối lại người dùng Zalo, đăng ký lại webhook (H3).
- Ghi nguyên thân phản hồi của Zalo.
- Đường nhắc việc (`nhac-ke-hoach.ts`) và đường gửi Slack.

## Notes

- Không migration. Không đổi API. Không đổi chữ người dùng thấy trên Zalo.
- Ranh giới hàng: giám sát nêu `packages/validation/src/zalo-update.ts`; các tệp `apps/agent/agent/lib/zalo-*.ts` sẽ xin `cham-tep`.
