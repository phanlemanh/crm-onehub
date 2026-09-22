---
schema_version: 1
feature: Ô soạn hội thoại không còn giả chữ — con trỏ đứng ở đầu ô trống, chữ gợi ý không nằm trong dòng chữ; thẻ lỗi hội thoại hiện mã lỗi; agent ghi log lý do lỗi của hội thoại
slug: o-soan-va-ly-do-loi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, agent, api]
status: implemented
design_doc: docs/superpowers/specs/2026-09-22-o-soan-va-ly-do-loi-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-22T15:37:35Z
---

# Acceptance Contract: o-soan-va-ly-do-loi

## Context

Rà mục Hội thoại trên onehub.center ngày 2026-09-22: bấm vào ô soạn trống thì
con trỏ đứng sau chữ gợi ý xám, trông như chữ đã nhập; một câu hỏi thường hỏng
với thẻ «Bộ dựng không làm xong yêu cầu này» mà không ai biết vì sao, vì mã và
lý do lỗi bị bỏ ở màn hình và không được ghi log ở agent. Người dùng là nhân
viên OneHub dùng Hội thoại. Sửa lỗi, không qua Cổng Đáng. Vòng này không tìm gốc
lỗi chat production — nó làm lần hỏng kế tiếp tự nói ra lý do.

## Criteria

- AC-1: Given ô soạn trống ở màn đầu Hội thoại (chữ gợi ý «Hỏi về CRM của bạn, hoặc tả một việc cần tự động…») và ô soạn trống trong một hội thoại (chữ gợi ý «Gửi một tin»), When bấm vào giữa ô, Then ở cả hai ô con trỏ cách mép trái vùng chữ không quá 2px, chữ gợi ý vẫn hiện, mép trái của chữ gợi ý cách mép trái vùng chữ không quá 2px, và chữ gợi ý nằm trọn trong ô ở khổ 1440 và 375.
- AC-2: Given ô soạn trống đã bấm vào như AC-1, When gõ chữ «a», Then chữ gợi ý không còn hiện, nội dung ô đúng là «a», và con trỏ đứng sau chữ «a».
- AC-3: Given bốn chuỗi sự kiện kết thúc bằng `turn.failed` mang lần lượt lời lỗi hết nhịp, model trả phí, hết tín dụng và một lời lỗi khác, mỗi sự kiện mang `code` riêng, cùng một chuỗi kết thúc bằng `session.failed` không có `code`, When đọc lỗi mới nhất bằng `latestTurnFailure`, Then bốn chuỗi đầu trả đúng `code` của chính nó với `kind` lần lượt rate-limit, restricted, credits, unknown, còn chuỗi cuối trả `code` `AGENT_FAILED`.
- AC-4: Given thẻ lỗi hội thoại dựng từ một lỗi có `code` `TOOL_EXECUTION_FAILED`, When hiển thị ở tiếng Việt và tiếng Anh với từng `kind` trong bốn loại, Then dưới câu lỗi có một dòng «Mã lỗi: TOOL_EXECUTION_FAILED» (tiếng Anh «Error code: TOOL_EXECUTION_FAILED»), phần mã nằm trong phần tử mang `translate="no"`, câu lỗi theo `kind` và nút «Thử lại» vẫn còn, và thẻ không chứa lời lỗi thô của sự kiện.
- AC-5: Given một hội thoại BUILDER của người A có sự kiện `turn.failed` mang `code` `TOOL_EXECUTION_FAILED` và `message` «search_crm: query too short» lưu trong `AgentEvent`, When A mở hội thoại đó, Then máy chủ trả sự kiện với `code` và `message` nguyên vẹn và thẻ lỗi trên màn hiện «Mã lỗi: TOOL_EXECUTION_FAILED». (cross-layer)
- AC-6: Given kênh `crm` của agent nhận `turn.failed` rồi `session.failed` cho một hội thoại BUILDER, mỗi sự kiện có `code` và `message`, và nhận `turn.failed` cho một task nghiên cứu có thật, When xử lý từng sự kiện, Then mỗi sự kiện của hội thoại ghi đúng một dòng `console.error` chứa id hội thoại, tên sự kiện, `code` và `message`, và sau mỗi sự kiện hội thoại được đặt lại token và xoá câu hỏi chờ như trước; sự kiện của task nghiên cứu không ghi dòng hội thoại nào và task vẫn được đánh dấu hỏng như trước.
- AC-7: Given máy chủ của cây đang xét và một hội thoại có lỗi như AC-5, When chụp ô soạn trống đã bấm vào, ô soạn sau khi gõ «a», và thẻ lỗi, ở khổ 1440 và 375, Then nhìn thấy trên ảnh con trỏ ở đầu ô trước chữ gợi ý, chữ gợi ý nằm trọn trong ô và không đè thanh nút, chữ gợi ý biến mất sau khi gõ, dòng «Mã lỗi: TOOL_EXECUTION_FAILED» dưới câu lỗi, và ảnh 375 không tràn ngang.

## Coverage

Bỏ quét hình thái bằng skill — hai chỗ sửa đã xác định từ báo cáo rà 22/09, không
có không gian để liệt kê; xem sổ quyết định dòng «bỏ coverage-scan». Trục vẫn khai
để người soát:

- Trục A — ô soạn: màn đầu | trong hội thoại [thước CE: `agent-composer.tsx` `mode === "home"` — hai chữ gợi ý]
- Trục B — trạng thái ô: trống chưa bấm | trống đã bấm | đã gõ [thước CE: `data-empty` của `TokenField`]
- Trục C — loại lỗi: rate-limit | restricted | credits | unknown | thiếu `code` [thước CE: `latestTurnFailure`]
- Trục D — sự kiện hỏng ở agent: `turn.failed` | `session.failed` × hội thoại BUILDER | task nghiên cứu [thước CE: `channels/crm.ts` bộ xử lý `events`]
- Trục E — tầng mã lỗi đi qua: DB `AgentEvent` → API `conversations.events` → `latestTurnFailure` → thẻ [thước CE: design doc mục «Cách đo»]
- Ánh xạ: A×B → AC-1, AC-2 · C → AC-3, AC-4 · D → AC-6 · E → AC-5 · mặt người nhìn → AC-7.

## Out of scope

- Gốc lỗi chat trên production — chờ mã và lời lỗi thật từ lần hỏng kế tiếp.
- Hiện lời lỗi thô (`message`) cho người dùng — chỉ ghi log.
- Chữ «Bộ dựng» và tiêu đề tab «Hội thoại dựng tác nhân» cho câu hỏi thường.
- Công cụ đếm / lọc theo ngày tạo cho agent.
- Nút gửi khi chỉ có tệp, thẻ bản ghi hoặc lệnh; menu `/` và `+` dùng bàn phím.
- Nút «Đang tra cứu» khi hàng đợi rỗng; lời kể bước công cụ tiếng Anh; hội thoại chưa đặt tên.

## Notes

- AC-1 và AC-2 chỉ đo được trong trình duyệt thật (jsdom không có toạ độ con trỏ), nên chỉ có eval `ui-check` — không có chốt ở làn máy khi ghim lại.
- Mã lỗi hiện nguyên chuỗi eve trả về; eve không cam kết một danh sách mã đóng.
