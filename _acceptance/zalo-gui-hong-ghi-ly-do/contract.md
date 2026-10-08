---
schema_version: 1
feature: Zalo gửi hỏng thì nhật ký nói lý do của Zalo; đổi bot thì hỏi trước rồi gỡ liên kết cũ để mọi người nối lại; tin vào bị bỏ qua thì nhật ký nói vì sao
slug: zalo-gui-hong-ghi-ly-do
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: _acceptance/zalo-gui-hong-ghi-ly-do/design.md
---

# Acceptance Contract: zalo-gui-hong-ghi-ly-do

## Context

Từ 30/09 «Gửi thử» và tin nhắc Zalo trên production hỏng với dòng `[zalo] sendMessage hong: tra-loi-la (Error)` — nhật ký vứt lý do Zalo đưa ra. Gốc đã có căn cứ ngày 08/10: hai lần Lưu bot sáng 30/09 thay sang một bot khác; liên kết Zalo của mọi người vẫn nối với bot cũ nên hết hiệu lực âm thầm; chủ kho nối lại thì Gửi thử qua và phiên Zalo trả lời được (11:10Z).

Cổng Đáng: chủ kho qua giám sát, 08/10 — hàng sửa nóng H4; chọn lối (1): không migration, hỏi rồi gỡ liên kết khi đổi bot.

Source input: `opportunity.md`, `design.md`.

## Criteria

- AC-1: Given `sendMessage` của Zalo trả một trong mười phản hồi viết trước — HTTP 200 `{ok:false,error_code,description}`, HTTP 200 `{ok:false}` không mô tả, HTTP 200 thân không có `ok`, HTTP 400, 401, 403, 404, 408, 429 mỗi mã kèm thân `{ok:false,error_code,description}`, HTTP 500 thân không phải JSON, và lỗi mạng có `code` — When một lần gửi hỏng được mô tả, Then dòng mô tả lần lượt là `zalo-tu-choi <error_code> «<description>»`, `zalo-tu-choi - «-»`, `hinh-dang-la khoa=<tên khoá>`, `http-<mã> zalo-tu-choi <error_code> «<description>»` cho sáu mã HTTP có thân, `http-500`, `mang (<code>)`; description dài hơn trần thì bị cắt đúng ở trần.
- AC-2: Given Zalo trả HTTP 408 cho `getUpdates`, When kéo tin, Then vẫn là «hết tin» như hôm nay; And HTTP 408 cho mọi lệnh khác là lỗi `http-408`.
- AC-3: Given Zalo từ chối với `description` ghim, When mỗi chỗ gọi Zalo trong tám chỗ hỏng — gửi thử và `getMe` khi Lưu bot (`zalo-bot-xuong.ts`), trả lời phiên, báo lỗi phiên, `sendChatAction`, không mở được phiên (`zalo-tra-loi.ts`), bắt đầu lại (`zalo-nhan.ts`), báo quá hạn (`zalo-hoi.ts`) — Then dòng `[zalo]` của chỗ đó chứa đúng `zalo-tu-choi <mã> «<description ghim>»`.
- AC-4: Given một tin webhook hợp lệ rơi vào một trong bốn nhánh không mở phiên — không phải chat riêng hoặc người gửi là bot, `message_id` đã gặp, người gửi đang bị chặn, người gửi chưa nối — When `nhanWebhook` xử lý, Then nhật ký có đúng một dòng `[zalo] bo qua message_id=<id> ly_do=<khong-rieng|da-gap|bi-chan|chua-noi>`, và hành vi trả lời giữ nguyên.
- AC-5: Given sự kiện đăng ký của Zalo có `message.message_id = "webhook-test"` (không `from`, `chat`), When tới `/zalo/webhook` với khoá đúng, Then trả 200 và ghi đúng một dòng `[zalo] webhook-test`, không dòng «sai khuon»; And một thân hỏng thật vẫn ghi «sai khuon» như trước.
- AC-6: Given đầu vào của AC-1, AC-3, AC-4 chứa token bot, chat id và chữ tin nhắn có thể nhận ra, When các dòng nhật ký được ghi, Then không dòng nào chứa ba chuỗi đó.
- AC-7 (cross-layer): Given đang có một bot với `n ≥ 1` liên kết Zalo, When quản trị Lưu bot bằng token của một bot KHÁC (mã bot `getMe` khác; `getMe` của token cũ hỏng thì phần `<số>` của hai token khác), Then chưa có gì đổi — token, khoá, tên bot và mọi liên kết giữ nguyên — và màn Kết nối › Zalo mở `ConfirmDialog` nêu tên bot mới và đúng số `n`; And Huỷ thì vẫn không đổi gì.
- AC-8 (cross-layer): Given hộp xác nhận của AC-7, When quản trị bấm «Gỡ liên kết và đổi bot» và Zalo nhận đăng ký bot mới, Then bot mới được lưu và mọi `zaloLink` bị xoá trong CÙNG một giao dịch với việc ghi `AppSetting`, và nhật ký có đúng một dòng `[zalo] doi bot: go <n> lien ket`; And nếu Zalo từ chối đăng ký, hoặc một bước ghi CSDL của giao dịch đó hỏng, thì bot cũ và mọi liên kết giữ nguyên; And nút xác nhận gửi `xacNhanDoiBot: true` qua API tới agent, Huỷ không gọi gì.
- AC-9: Given Lưu bot bằng token của CÙNG bot (hoặc bật bot lần đầu, hoặc không còn liên kết nào), When Lưu, Then không hỏi xác nhận và không gỡ liên kết nào — hành vi như hôm nay.
- AC-10: Given một người đã chọn nhận nhắc qua Zalo (`NotificationPreference.channel = ZALO`) mà không còn liên kết Zalo, When mở «Thông báo của bạn», Then thấy dòng báo cần nối lại cạnh nút «Nối Zalo»; And người chưa từng chọn Zalo không thấy dòng đó.
- AC-12: Given `/zalo/webhook` nhận một yêu cầu bị từ chối — header `x-bot-api-secret-token` có mà không khớp khoá đang lưu (403), header vắng (403), hoặc tới khi chưa có bot (404) — When `nhanWebhook` xử lý, Then nhật ký có đúng một dòng lần lượt `[zalo] webhook 403 ly_do=khoa-lech`, `[zalo] webhook 403 ly_do=thieu-khoa`, `[zalo] webhook 404 ly_do=chua-co-bot`, không chứa thân tin, header hay khoá; And CHỈ khi header có mà lệch VÀ thân đọc được là tin Zalo (`parseZaloWebhook` nhận, hoặc là sự kiện thử) thì `AppSetting.zaloWebhookLyDo` thành `"khoa-lech"` (không cột mới) — header vắng hay thân rác thì không đổi gì trong CSDL; And nhiều yêu cầu như thế, gửi lần lượt hay đồng thời, chỉ làm hàng `AppSetting` đổi đúng một lần.
- AC-13 (cross-layer): Given `zaloWebhookLyDo = "khoa-lech"`, When quản trị mở Cài đặt › Kết nối › Zalo, Then màn hiện cảnh báo khoá lệch kèm nút «Đăng ký lại»; And nhịp kiểm bot (`kiemBot`, `getWebhookInfo`) KHÔNG xoá lý do đó; And chỉ một lần Đăng ký lại hay Lưu bot thành công mới đưa nó về null; lần hỏng thì lý do không về null (giữ `khoa-lech` hoặc thành `zalo-tu-choi`, cả hai đều hiện cảnh báo).
- AC-11: Given diff của vòng so với merge-base với `onehub`, Then chỉ các tệp khai trong `## Notes` (mục Ranh giới), `_acceptance/zalo-gui-hong-ghi-ly-do/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` và các dòng THÊM vào `_acceptance/config.yaml` đổi.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 08/10.

- **Trục A — phản hồi Zalo:** mười dạng ở AC-1.
  - Thước CE: `zaloGoi` + `parseZaloSend` + bảng mã lỗi chính thức (bot.zaloplatforms.com/docs/error-code) + khuôn thành công (docs/apis/sendMessage).
- **Trục B — chỗ gọi Zalo ghi lỗi:** tám chỗ ở AC-3.
  - Thước CE: `git grep "console.error(" -- apps/agent/agent/lib/zalo-*.ts` (đọc 08/10).
- **Trục C — nhánh tin vào không mở phiên:** bốn nhánh ở AC-4 + sự kiện thử (AC-5).
  - Thước CE: `xuLyTinDen`, `xuLyDb`, `khongMa` trong `zalo-nhan.ts`; `nhanWebhook`.
- **Trục D — Lưu bot:** bật lần đầu | cùng bot | bot khác có liên kết (Huỷ / Đồng ý, Zalo nhận / từ chối) | bot khác không liên kết.
  - Thước CE: `datBot` trong `zalo-bot-xuong.ts`; căn cứ 08/10 ở Context.
- **Trục E — người sau đổi bot:** đã chọn Zalo | chưa từng chọn Zalo.
- **Trục F — webhook bị từ chối:** 403 khoá lệch | 404 chưa có bot; ai xoá lý do: nhịp kiểm (không được) | đăng ký lại thành công (được) | đăng ký lại hỏng (không).
  - Thước CE: các nhánh `traVe` của `nhanWebhook`; `ghiUrlKhiKhongCoHong` (`zalo-bot.ts`); `datBot`; căn cứ 403 ngày 06/10, 08/10 (P5-28).
  - Thước CE: `kenhSeDungCua` (`packages/db/src/kenh-thong-bao.ts`).
- **Ô Core:** A (AC-1, AC-2) · A×B lấy một phản hồi ghim (AC-3) · C (AC-4, AC-5) · lớp riêng tư (AC-6) · D (AC-7, AC-8, AC-9) · E (AC-10) · F (AC-12, AC-13) · ranh giới (AC-11).
- **Đối chiếu ngành:** [NGÀNH: Zalo Bot Platform — bảng mã lỗi HTTP 400/401/403/404/408/429 và trường `description`, bot.zaloplatforms.com/docs/error-code]; [NGÀNH: Telegram Bot API — một bot một webhook, mã người dùng gắn với bot].
- **Later:** gỡ webhook của bot cũ (cần token bot cũ); canary mỗi giờ qua GitHub Actions (phần B, chủ kho để sau).

## Vòng đời (docs/vong-doi.md)

1. **Dọn thế nào:** Gỡ liên kết (xoá thật `zaloLink`), chỉ khi đổi bot, sau `ConfirmDialog`; chữ «Gỡ» theo bộ chữ.
2. **«Lịch sử»:** không áp — liên kết với bot cũ đã vô hiệu, giữ lại chỉ làm Gửi thử và tin nhắc chết âm thầm.
3. **Danh sách hiện gì:** danh sách «ai đã nối» chỉ còn người nối với bot mới; người cần nối lại thấy dòng báo ở trang của mình (AC-10).

## Đường đo

- «Lần Gửi thử kế tiếp sau gộp in mã HTTP và description/error_code»: `vercel logs -p crm-onehub-agent … --query "sendMessage hong"` sau lần Gửi thử đầu tiên · AC-1, AC-3.
- «Mỗi tin webhook không sinh phiên in đúng một dòng mã nhánh»: `vercel logs … --query "bo qua message_id"` · AC-4.

## Out of scope

- Gỡ webhook của bot cũ (cần token bot cũ; P5 không có).
- Báo cho người dùng Zalo phải nối lại qua kênh khác — chủ kho tự báo.
- Ghi nguyên thân phản hồi của Zalo.
- Thêm cột mã bot vào `ZaloLink` hay `AppSetting` (lối 2, chủ kho không chọn).
- Đường gửi Slack.

## Notes

- Không migration. Không đổi chữ người dùng thấy trên Zalo.
- Ngoại lệ có chủ đích với `docs/connections.md` («An admin cannot unlink someone else's Zalo»): đổi bot gỡ mọi liên kết sau xác nhận; tài liệu được sửa cùng vòng.
- Ranh giới (sẽ xin `cham-tep`): `apps/agent/agent/lib/zalo-api.ts`, `zalo-bot-xuong.ts`, `zalo-nhan.ts`, `zalo-tra-loi.ts`, `zalo-hoi.ts`, `zalo-webhook.ts`, `zalo-config.ts`; `packages/validation/src/zalo-update.ts`, `packages/validation/src/zalo-cau-noi.ts`; `apps/api/src/zalo/zalo.service.ts`, `zalo-cau-noi.service.ts`, `zalo.router.ts`, `zalo.contracts.ts`; `apps/app/app/(app)/[slug]/settings/connections/zalo/o-token.tsx`, `apps/app/app/(app)/[slug]/settings/notifications/khoi-zalo.tsx`, `apps/app/app/(app)/[slug]/settings/connections/zalo/trang-thai-webhook.tsx`, `apps/agent/agent/lib/zalo-bot.ts`, tệp chữ Zalo trong `apps/app/lib/messages/`, `apps/app/test/messages-guard.spec.ts` (ghim khoá chữ mới); `packages/db/src/zalo-lien-ket.ts` (đếm và gỡ hết liên kết), `packages/db/src/kenh-thong-bao.ts` (`canNoiLai`); `docs/connections.md`; bài thử `apps/agent/test/zalo-gui-hong-ly-do*.spec.ts`, `apps/api/test/zalo-doi-bot*.spec.ts`, `apps/app/test/zalo-doi-bot*.dom.tsx`.
