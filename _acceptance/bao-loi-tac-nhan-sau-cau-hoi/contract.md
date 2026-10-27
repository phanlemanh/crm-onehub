---
schema_version: 1
feature: Tác nhân hỏng trong lúc dựng thì người dùng nhận đúng một thông báo, kể cả khi đã trả lời một câu hỏi giữa chừng
slug: bao-loi-tac-nhan-sau-cau-hoi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-27T01:25:32Z
design_doc: docs/superpowers/specs/2026-10-27-bao-loi-tac-nhan-sau-cau-hoi-design.md
---

# Acceptance Contract: bao-loi-tac-nhan-sau-cau-hoi

## Context

Thẻ «Đang dựng» hứa Kara sẽ báo trong hộp thông báo khi xong. Ngoài-11 của `ve-sinh-do-san-onehub` lo rằng lượt dựng
hỏng sau khi người đã trả lời một câu hỏi giữa chừng sẽ không sinh thông báo «hỏng». Đo 27/10 trên `onehub 518f05802`:
câu trả lời thừa hưởng quyền dựng của lượt hỏi (hồ sơ `quyen-luot-mang-theo`), nên ca đó đã đúng — nhưng không bài
kiểm nào giữ nó. Cùng lúc đo ra chỗ hở thật: bộ ghi thông báo xét lần gửi mới nhất thay vì lần gửi Kara đang làm, nên
một tin trò chuyện chen giữa lúc dựng (từ tab khác) làm lượt dựng hỏng hay xong mà hộp thông báo trống — đúng ngưỡng
CHẾT của ô cơ hội. Vòng này sửa bộ ghi chọn lần gửi đang chạy, và ghim cả hai bằng một bài kiểm đi trọn đường thật.

Source input: `_acceptance/bao-loi-tac-nhan-sau-cau-hoi/opportunity.md` (Cổng Đáng `build`, 2026-10-27T00:40:54Z; hàng
VS11 của `docs/plan/lo-trinh-okr.json`).

«Đường thật» trong mọi tiêu chí dưới đây: cuộc mở bằng `ConversationsService.createBuilder`, tin chen giữa bằng
`submitBuilder`; giao cho Kara bằng `dispatchBuilderSubmission` (chỉ lời gọi sang eve là giả, theo hợp đồng của eve);
câu hỏi là sự kiện đã chụp từ eve, lưu qua `crmEvents["input.requested"]` với ngữ cảnh phiên mà bộ giao đưa cho eve;
câu trả lời ghi bởi `ConversationsService.answerBuilderQuestion`; lượt kết thúc qua `crmEvents["turn.failed"]`,
`crmEvents["session.failed"]` hoặc `crmEvents["session.waiting"]`. Không hàng `pendingInputRequest`, lần gửi hay trạng
thái giao nào viết tay.

## Criteria

- AC-1: (cross-layer) Given một cuộc mở bằng lệnh dựng, Kara hỏi một câu làm rõ và người trả lời qua đường thật, When
  lượt hỏng bằng `turn.failed`, Then người mở cuộc có đúng một thông báo «hỏng» của cuộc đó, đường dẫn `/chat/<id>`,
  mang mã của lần gửi trả lời, và mốc «có điều mới» của cuộc (`lastAssistantAt`) sau lúc hỏng lớn hơn hẳn mốc trước
  lúc hỏng.
- AC-2: (cross-layer) Given cuộc dựng mà Kara hỏi hai câu nối nhau và người trả lời cả hai, When phiên hỏng bằng
  `session.failed`, Then có đúng một thông báo «hỏng», đứng sau hai thông báo «cần trả lời».
- AC-3: (cross-layer) Given cuộc dựng đã trả lời một câu, When `turn.failed` rồi `session.failed` đến cho cùng lượt, Then
  vẫn đúng một thông báo «hỏng».
- AC-4: (cross-layer) Given cuộc dựng đỗ ở câu hỏi hết hạn mức (sự kiện thật) và người chọn «Cấp thêm», When lượt hỏng
  bằng `turn.failed`, Then có đúng một thông báo «hỏng».
- AC-5: (cross-layer) Given cuộc mở bằng tin trò chuyện thường (không lệnh dựng), Kara hỏi một câu và người trả lời,
  When lượt hỏng bằng `turn.failed`, Then không có thông báo «hỏng» nào.
- AC-6: (cross-layer) Given cuộc dựng đã giao cho Kara và một tin trò chuyện thường gửi chen giữa đang xếp hàng, When
  lượt dựng hỏng bằng `turn.failed`, Then có đúng một thông báo «hỏng», mang mã của lần gửi dựng, và tin chen giữa vẫn
  xếp hàng.
- AC-7: (cross-layer) Given cuộc dựng đã lưu bản nháp và một tin trò chuyện chen giữa đang xếp hàng, When phiên chờ
  (`session.waiting`), Then có đúng một thông báo «xong», mang mã của lần gửi dựng và tên tác nhân.
- AC-8: (cross-layer) Given lượt dựng đã hỏng và đã báo, When tin chen giữa được giao rồi lượt trò chuyện ấy cũng hỏng,
  Then cuộc vẫn chỉ có một thông báo «hỏng».
- AC-9: Given ma trận thông báo tác nhân đã ký của `cho-tac-nhan-lau`, When chạy lại sau vòng này, Then mọi ô giữ đúng
  kết quả cũ.

## Coverage

- Trục A — Số câu hỏi trước khi kết thúc: 0 | 1 | 2 trở lên [thước CE: câu giao VS11; ma trận `cho-tac-nhan-lau` phủ
  ô 0 không chen giữa] → AC-1, AC-3, AC-4 (1), AC-2 (2), AC-6–AC-8 (0 có chen giữa); ô 0 không chen giữa giữ bằng AC-9.
- Trục B — Loại câu hỏi: làm rõ | hết hạn mức [thước CE: hai `kind` mà `persistBuilderInputRequest` nhận —
  `apps/agent/agent/lib/builder-input.ts`] → AC-1 (làm rõ), AC-4 (hết hạn mức). Hết hạn mức chọn «Dừng» là lượt huỷ,
  không phải hỏng — đã phủ bởi ô «người dùng dừng» của AC-9.
- Trục C — Cách lượt kết thúc: `turn.failed` | `session.failed` | cả hai cùng lượt | chờ (xong) [thước CE: hai nơi gọi
  `baoTacNhan(…, "hong")` và một nơi gọi `baoTacNhan(…, "cho")` trong `apps/agent/agent/channels/crm.ts`] → AC-1, AC-5,
  AC-6 (`turn.failed`), AC-2 (`session.failed`), AC-3 (cả hai), AC-7 (chờ).
- Trục D — Quyền của lượt đang chạy: dựng | trò chuyện [thước CE: `commandTypeFromAuthorization`,
  `packages/validation/src/builder-question.ts`; NGÀNH: GitHub Actions báo «workflow run failed» một lần cho mỗi lượt
  chạy, không báo việc không phải lượt chạy] → AC-1–AC-4, AC-6, AC-7 (dựng), AC-5, AC-8 (trò chuyện).
- Trục E — Lần gửi chen giữa: không có | đang xếp hàng | đã giao [thước CE: trạng thái `PENDING` · `SENDING` ·
  `ACCEPTED` của `dispatchBuilderSubmission`] → AC-1–AC-5 (không), AC-6, AC-7 (xếp hàng), AC-8 (đã giao).
- Cắt ngang «đúng một»: mọi ô đếm số thông báo bằng đúng 1 hoặc 0, không «ít nhất một».

## Đường đo

- Ngưỡng SỐNG «mọi ca hỏng trong lúc dựng cho đúng một thông báo hỏng; trò chuyện thường hỏng vẫn không báo; ca đang
  có không đổi»: AC-1–AC-4, AC-6 (hỏng), AC-5, AC-8 (trò chuyện), AC-9 (ca đang có).
- Ngưỡng CHẾT «còn một ca hỏng trong lúc dựng mà hộp thông báo trống»: AC-6 — ca chen giữa đỏ trên mã hôm nay.
- Ngưỡng CHẾT «một lượt hỏng sinh từ hai thông báo trở lên»: AC-2, AC-3, AC-8 đếm bằng đúng 1.
- Đọc 14 ngày dữ liệu thật sau gộp (Cổng Giá trị): số lượt dựng hỏng lấy từ hàng `AgentEvent` loại `turn.failed` /
  `session.failed` của cuộc `BUILDER` có lần gửi lệnh dựng (hook audit ghi sẵn), số thông báo lấy từ `ThongBao` loại
  `tac-nhan-hong`. Cả hai bảng đã có; không cần mã mới, nên không thành tiêu chí.

## Out of scope

- Trò chuyện thường có câu hỏi vẫn sinh «cần trả lời» — đúng ý, không thuộc lời hứa «hỏng».
- Không sửa fixture của ma trận `cho-tac-nhan-lau` (tệp kiểm của hồ sơ đã ký).
- Câu chữ thông báo, kênh gửi (Zalo, Slack), chuông và màn trò chuyện không đổi.
- Đường giao cho Kara (`dispatchBuilderSubmission`) và đường trả lời câu hỏi giữ nguyên.

## Notes

- Bảng đo trước thiết kế (tám ca, trên mã chưa sửa) ở design doc.
