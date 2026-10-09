---
schema_version: 1
slug: zalo-hoi-okr-khong-chet
feature: Zalo hỏi OKR không chết lượt — agent gốc kênh Zalo hỏi về KR thì nhận câu trả lời có nghĩa, không nhận «Tôi chưa trả lời được câu này»
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08
prototype:
  base_commit:
  disposition:
---

Nguồn: F12 `eval-model-that-dung-luc` S4 round 2 (P5-17). Chủ kho chọn «A, build» qua giám sát đợt `sau-14-10`, 08/10; hàng sửa nóng H1, mốc 2026-10-08 (luật 36).

## Vấn đề & ai gặp

Trên máy đo (`eve eval tro-ly-kho/cham-bo-do`, model thật), câu Zalo c33 «KR doanh thu quý này đang đạt bao nhiêu phần trăm?» làm agent gốc purpose `zalo` gọi subagent `tro_ly_okr`; hook `apps/agent/agent/hooks/okr-uy-quyen.ts` ném `LOI_UY_QUYEN.ngoaiOkr` ở `actions.requested` → lượt `MODEL_CALL_FAILED` → người hỏi nhận «Tôi chưa trả lời được câu này. Thử lại sau ít phút, hoặc hỏi trong OneHub Center.» Lặp 2/2 lượt (06:32Z, 09:04Z ngày 08/10; `.acceptance-runs/tro-ly-doc-kho/cham-bo-do/2026-10-08T09-04-26-576Z-50045/luot-1/eve.log` dòng 1085–1103). Có trên onehub từ 7caf3e84a (gộp 28/09).

**Người gặp:** mọi người hỏi bot Zalo một câu về OKR/KR.

## Bằng chứng production (S0, 08/10, `vercel logs`, scope phanlemanh-8330s-projects)

Chủ kho báo «Zalo phản hồi/thông báo có vẻ đang không hoạt động». Nhật ký cho thấy ba chuyện riêng nhau; chỉ chuyện (C) là lỗi của hàng này.

**(A) Tin Zalo không vào được production từ 30/09.** Đường vào duy nhất là `POST /zalo/webhook` của `crm-onehub-agent` (`pollZalo` không được gọi ở đâu).
- 24/09–30/09: 19 lần `POST /zalo/webhook 200`.
- Lần 200 cuối: `2026-09-30T09:16:17Z POST /zalo/webhook 200` (dpl_2spRWSkPRgQw9HGCGGuxt8uimjCp), ngay sau `2026-09-30T09:15:48Z /internal/zalo/bot 200` (đăng ký lại bot lần thứ hai trong sáng 30/09; lần đầu 08:48:03Z).
- 30/09 09:16Z → 06/10 03:41Z: không có request nào tới `/zalo/webhook`.
- `2026-10-06T03:41:43Z POST /zalo/webhook 403` và `2026-10-08T07:13:35Z POST /zalo/webhook 403` (domain crm-onehub-agent.vercel.app). 403 = header `x-bot-api-secret-token` không khớp khoá đang lưu (`apps/agent/agent/lib/zalo-webhook.ts`, `ZALO.http.cam`).
- Không có lưu lượng Zalo nào ở môi trường preview cùng kỳ.
- `kiemBot` (cron dispatch) không ghi dòng `[zalo] getMe …` lỗi nào từ 30/09 — token bot vẫn được Zalo nhận.
- CHƯA biết: Zalo đang trỏ webhook về URL nào và với khoá nào. Cần `getWebhookInfo` bằng token production, hoặc trang Cài đặt → Kết nối → Zalo của production.

**(B) Gửi tin đi bị Zalo từ chối, và lý do bị nuốt.** `2026-10-06T02:40:06Z /internal/zalo/gui-thu 200 [zalo] sendMessage hong: tra-loi-la (Error)`. `parseZaloSend` ném «Zalo rejected the message (<description>)» khi Zalo trả `ok:false`, nhưng `lopLoi` trong `zalo-bot-xuong.ts` chỉ giữ tên lớp lỗi → nhật ký không có `description`/`error_code` của Zalo.

**(C) Lỗi của hàng này chưa xuất hiện trên production.** Tìm «OKR session» / `MODEL_CALL_FAILED` / `tro_ly_okr` trong nhật ký agent 24/09–01/10: 0 dòng. Từ 30/09 không tin Zalo nào tới được bước xử lý (A), nên lỗi không có dịp nổ trên production. Nó nổ chắc chắn trên máy đo bằng model thật.

## Giả định chốt sinh tử

- Sửa ở `apps/agent` (hook uỷ quyền OKR, hoặc cách `tro_ly_okr` lộ cho agent gốc) là đủ để c33 qua Zalo có câu trả lời có nghĩa; không cần đổi API hay CSDL.
- (A) và (B) không chặn việc đo (C): bài kiểm của hàng này chạy qua Zalo giả và máy đo của tro-ly-doc-kho.

## Ngưỡng chết / ngưỡng UAT

[đề xuất]
- SỐNG: c33 và mọi câu hỏi KR/OKR khác qua Zalo trên máy đo (E15 tro-ly-doc-kho, model thật) có ZaloHoi `da-tra-loi`, không có `MODEL_CALL_FAILED`; sau khi (A) được gỡ, hai tuần đầu trên production 0 dòng «may be called only from an OKR session».
- CHẾT: còn một lượt Zalo chết vì uỷ quyền OKR sau gộp, hoặc câu trả lời thay thế không nói gì về KR (chỉ là câu xin lỗi khác).
- Timebox: hàng sửa nóng, trong ngày 08–09/10.

## Câu hỏi mở cho Cổng Phạm vi

- Cách sửa: không lộ `tro_ly_okr` cho agent gốc khi phiên không phải OKR, hay hook trả từ chối thành kết quả công cụ để agent gốc tự trả lời?
- (A) và (B) có thuộc hàng này không, hay tách hàng riêng? (A) cần một việc tay trên production (đăng ký lại bot từ trang Cài đặt) và đọc `getWebhookInfo`; (B) là sửa nhật ký ở `zalo-bot-xuong.ts`, ngoài ranh giới hàng.

## Quyết định Cổng Đáng

08/10/2026, chủ kho qua giám sát: «F12 A, build» — hàng sửa nóng H1.
