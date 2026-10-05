---
schema_version: 1
feature: «Zalo quá tải không bị báo token sai; bot chỉ đúng đường tới trang nhắc»
slug: zalo-va
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-05T07:00:31Z
design_doc: docs/superpowers/specs/2026-10-05-zalo-va-design.md
---

# Acceptance Contract: zalo-va

## Context

Hàng R1g của lộ trình OKR (`docs/plan/lo-trinh-okr.json`), Cổng Đáng ký `build` 05/10. Từ 26/10 cả
công ty nhắn bot Zalo. Hôm nay Zalo chỉ tạm lỗi (408, 429) cũng bị báo «token sai» lúc dán token, và
nhịp kiểm bot gặp bất kỳ lỗi nào là xoá tên bot, làm nhắc sáng rơi sang Slack (#26). Câu chào của bot
chỉ tới một trang đã bỏ (#27). Kèm hai chỗ đếm và báo sai: thước ngưỡng ngày cuối kỳ của
`tra-loi-tin-nhac`, và năng lực Zalo báo «off» khi bot đã nối qua Cài đặt.

## Criteria

- AC-1: Given quản trị dán một token ở Cài đặt › Zalo (`datBot`) và Zalo giả trả `getMe` lần lượt bằng HTTP 408 kèm thân `ok: false` 408, HTTP 408 kèm thân không phải JSON, HTTP 429, HTTP 500, HTTP 503, lỗi mạng, HTTP 200 thân sai khuôn, HTTP 200 thân `ok: false` mang `error_code` 408, 429 hoặc 500, và HTTP 400 kèm thân `ok: false` mang `error_code` 429, When `datBot` chạy, Then cả mười một ca trả `outcome` `zalo-loi` kèm đúng câu `ZALO.loi.zaloKhongTraLoi`, không gọi `setWebhook`, và năm cột Zalo của `AppSetting` không đổi.
- AC-2: Given cùng `datBot` và Zalo giả trả `getMe` bằng HTTP 400, 401, 403, 404, hoặc thân `ok: false` mang `error_code` 400, 401, 403, 404, When `datBot` chạy, Then cả tám ca trả `outcome` `invalid` kèm câu `ZALO.loi.tokenSai`, không gọi `setWebhook`, và `AppSetting` không đổi; và với `getMe` 200 đúng khuôn thì `datBot` đi tiếp tới `setWebhook` như hôm nay.
- AC-3: Given bot đã nối (`zaloBotName` và `zaloWebhookUrl` có giá trị) và một người đã nối Zalo chọn kênh `AUTO`, When nhịp kiểm bot (`kiemBot`) gặp `getMe` lỗi tạm theo mười một dạng của AC-1, Then `kiemBot` trả `loi`, `zaloBotName` và `zaloWebhookUrl` giữ nguyên giá trị cũ, và `kenhSeDungCua` của người đó vẫn chọn `zalo`. (cross-layer)
- AC-4: Given cùng bot đã nối, When `kiemBot` gặp Zalo từ chối token theo tám dạng của AC-2, Then `zaloBotName` và `zaloWebhookUrl` về `null` như hôm nay và `kenhSeDungCua` không chọn `zalo`.
- AC-5: Given một người chưa nối Zalo nhắn bot (qua webhook và Zalo giả), When bot trả lời hướng dẫn, Then câu gửi đi là đúng `ZALO.loi.huongDan`, câu đó chứa nhãn mục điều hướng «Nhắc buổi sáng» (`nhacBuoiSang` của bảng chữ `khung-ung-dung`, bản vi) và nhãn nút «Nối Zalo» (`noi` của bảng chữ `nhac-qua-zalo`, bản vi), không nhãn mục điều hướng nào khác của `khung-ung-dung` (bản vi) đứng trước «Nhắc buổi sáng» trong câu, và không câu nào trong `ZALO.loi` còn chữ «Thông báo của bạn».
- AC-6: Given dữ liệu nhắc Zalo và vết «xong» qua Zalo dựng ở ba ngày D1, D2, D3 (giờ VN), When `_acceptance/tra-loi-tin-nhac/rang/nguong.ts` đo kỳ `[D1, D3]` bằng `doNguong`, Then lần «xong» khớp nhắc ở ngày D3 (ngày cuối kỳ) được đếm vào `coXong` chứ không vào `nham`; lần «xong» ở ngày D4 (sau kỳ) không vào `coXong` lẫn `nham`; lần «xong» không khớp nhắc nào trong kỳ vẫn vào `nham`.
- AC-7: Given bốn cấu hình token Zalo — chỉ trong Cài đặt (`AppSetting.zaloBotToken`), chỉ biến `ZALO_BOT_TOKEN`, cả hai, không có — When agent dựng danh sách năng lực (`capabilities()`), log khởi động (`logCapabilities`) và chỉ dẫn năng lực cho tác nhân (`capabilitiesMarkdown`), Then năng lực «Zalo reminders» bật ở ba cấu hình đầu (log in `on`, chỉ dẫn xếp vào «Available») và tắt ở cấu hình cuối; `from` nêu cả hai nguồn.
- AC-8: Given mỗi ca của AC-1, AC-2, AC-3, AC-4, When `getMe` lỗi, Then có đúng một hàng `AgentEvent` loại `zalo.getme-loi` mang `noi` (`dat-bot` hoặc `kiem-bot`), `http` (mã HTTP hoặc `null` khi lỗi mạng), `maThan` (`error_code` của thân hoặc `null`), `lop` (`mang`, `http-<mã>`, `ok-false-<mã>` hoặc `sai-khuon`), `ketLuan` (`tam-loi` ở AC-1/AC-3, `token-sai` ở AC-2/AC-4) và `vanTay` (12 ký tự hex đầu của sha256 token) đúng với điều đã xảy ra; `getMe` 200 đúng khuôn không ghi hàng nào; ghi hàng hỏng thì `datBot`/`kiemBot` vẫn trả đúng kết quả; và `_acceptance/zalo-va/rang/dem-getme.ts` đọc các hàng trong kỳ, in đúng số lần theo `ketLuan` × `lop`, số hàng `token-sai` mang mã tạm theo HTTP (408, 429, 5xx — danh sách riêng của bộ đếm, không đọc `ZALO.http`), và số hàng `token-sai` có `vanTay` trùng token đang chạy trong `AppSetting` (ngưỡng chết), không ghi hàng nào.

## Coverage

Quét bằng skill morphological-scan, preset test-matrix.

- Trục A — Zalo trả gì cho `getMe`: 200 đúng khuôn | HTTP 408 | HTTP 429 | HTTP 5xx | lỗi mạng | thân sai khuôn | `ok: false` mã tạm (408, 429) | `ok: false` 5xx | HTTP 4xx kèm thân mã tạm | HTTP 4xx khác (400, 401, 403, 404) | `ok: false` 4xx khác [thước CE: SUY-TỪ-REPO `apps/agent/agent/lib/zalo-bot-xuong.ts` docBot, `apps/agent/agent/lib/zalo-api.ts` zaloGoi; NGÀNH: HTTP 408/429 là lỗi tạm theo RFC 9110/6585]
- Trục B — nơi gọi `getMe`: dán token ở Cài đặt (`datBot`) | nhịp kiểm bot (`kiemBot`, dispatch và poll) [SUY-TỪ-REPO `apps/agent/agent/schedules/dispatch.ts`, `apps/agent/agent/lib/zalo-poll.ts`]
- Trục C — người đọc chữ của bot: người chưa nối nhắn bot | người đã nối [SUY-TỪ-REPO `apps/agent/agent/lib/zalo-config.ts` ZALO.loi]
- Trục D — nguồn token: Cài đặt | biến môi trường | cả hai | không có [SUY-TỪ-REPO `apps/agent/agent/lib/zalo-api.ts` zaloToken]
- Trục E — vị trí ngày của vết «xong» so với kỳ đo: trong kỳ | ngày cuối kỳ | sau kỳ [SUY-TỪ-REPO `_acceptance/tra-loi-tin-nhac/rang/nguong.ts`]
- Core: A × B → AC-1, AC-2, AC-3, AC-4, AC-8 · C → AC-5 · E → AC-6 · D → AC-7.
- Later: báo «Zalo tạm không trả lời» trên Cài đặt; thử lại `getMe` trong cùng nhịp.
- Never: gọi `setWebhook`/`getUpdates` lên bot thật để đo — bot thật đang phục vụ người dùng.

## Đường đo

- Thước: quản trị bị báo token sai khi token đúng · số từ: `AgentEvent` loại `zalo.getme-loi` có `ketLuan` `token-sai` mà `vanTay` trùng token đang chạy trong `AppSetting` (token đã được Zalo nhận sau đó — phải là 0), số hàng `token-sai` mang mã tạm theo HTTP (phải là 0), cùng tổng số lần `tam-loi` và `token-sai` theo `noi` · bảo đảm bởi: AC-1, AC-2, AC-3, AC-4, AC-8
- Thước: người mới làm theo câu chào tới được chỗ nối Zalo · số từ: câu chào ghim ở AC-5; lái thử người lạ sau ship · bảo đảm bởi: AC-5
- Ai đọc số, khi nào: ngày 10/11 chủ kho chạy `bun _acceptance/zalo-va/rang/dem-getme.ts --tu 2026-10-26 --den 2026-11-09` trên máy mình với kết nối production chỉ đọc; bộ đếm chỉ đọc, không ghi.

## Out of scope

- Dòng «Zalo tạm không trả lời lúc …» trên trang Cài đặt — chủ kho chọn giữ bot, không báo thêm (05/10).
- Thử lại `getMe` trong cùng nhịp — nhịp dispatch kế tự kiểm lại.
- Gọi `setWebhook` hay `getUpdates` lên bot Zalo thật; mọi phép đo dùng Zalo giả.
- Màn web: vòng này không đổi màn nào.

## Notes

- Bỏ design-pass, đặc tả UX và eval `ui-observed` theo chủ kho duyệt 05/10 (các entry `bỏ …` trong decisions.jsonl): không màn web nào đổi; câu chào là tin Zalo, ghim nguyên văn ở AC-5.
- AC-6 sửa thước của hồ sơ đã ký `tra-loi-tin-nhac` (Ngoài-3 của hồ sơ đó); hồ sơ đó phải ghim lại trên nhánh này trước khi đẩy.
