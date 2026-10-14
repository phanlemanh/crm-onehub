---
schema_version: 1
slug: thu-haiku-tro-ly-okr
feature: Thử Haiku 5.5 cho Trợ lý OKR, và kho đo thôi chạy GLM 5.2 Fast
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by:
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

Hàng phát sinh trong đợt r2, giám sát giao 14/10 cho dãy P0 sau khi chủ kho duyệt hai việc (b) và (c) của
phiên chẩn đoán E24. Chưa có trong lộ trình; giám sát ghi vào PR lộ trình kế.

Ba điều đo được ngày 14/10 trên cây `d0351bcdf`:

- Trợ lý OKR ghi cứng `google/gemini-3.8-flash` (`apps/agent/agent/lib/okr/config.ts`). Hai lượt E24 hôm nay:
  0/20 lượt hỏng, p50 11,3 và 13,4 s, p90 28,3 và 31,0 s — trên ngưỡng 8/15 s đã khai là giới hạn.
- Haiku 5.5 (ra 07/10) rẻ hơn khoảng bảy lần theo giá (0,10/0,50 so với 0,75/3,75 USD mỗi triệu token), có
  ZDR ở mọi nhà cung cấp (Gemini chỉ «some»). Đổi hằng tại chỗ để thử: E24 11/20 lượt hỏng, E22 20/30 ca đúng,
  judge 0,95, 0,16 USD một lượt E22. Cả 25 lời gọi hỏng dừng `length` ở đúng 2 000 token — trần mỗi lời gọi
  chỉnh cho Gemini; lời gọi thành công của Haiku dùng 746–1 958 token, của Gemini 128–537. 3 ca E22
  (gy-10, gy-12, gy-13) Haiku viết lại dòng ở ca không cần góp ý.
- Kho đo để trống `AppSetting.agentModelId` nên agent chính và Tác nhân trên kho đo chạy
  `DEFAULT_AGENT_MODEL` = `zai/glm-5.2-fast`, model đắt nhất trong ba (2,80/8,80) và khác model production.

Chưa ai đo Tác nhân trên Gemini sau bản sửa khuôn đệ quy (`docs/agent.md` mục 6), nên lý do cũ «Tác nhân hỏng
với Gemini» chưa được chứng là đã hết.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Haiku hỏng ở E24 vì trần 2 000 token, không vì model kém | Nâng trần không cứu, Haiku vẫn hỏng | Lượt E24 Haiku với trần 4 000 | Chưa thử |
| 2 | Trần 4 000 vẫn lọt lease 30 s của việc góp ý | Lượt hết lease (`hong:het-lease`) thay cho lượt bị cắt | Cùng lượt trên, đếm `hong:het-lease` | Chưa thử |
| 3 | Tác nhân chạy được trên Gemini 3.8 Flash và Haiku 5.5 | Mặc định không bỏ GLM được cho Tác nhân | `agent-builder.eval.ts` ba lượt mỗi model | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Trên cùng một cây, chạy liền nhau, Haiku 5.5 có thay được Gemini 3.8 Flash cho Trợ lý OKR, và hai model nào chạy được bộ dựng Tác nhân, để mặc định không còn GLM 5.2 Fast?
- Kết quả nào là SỐNG: [đề xuất] Trợ lý OKR — Haiku đạt cả ba: E24 0/20 lượt hỏng; E22 ≥ 28/30 ca đúng và 0 ca góp ý thừa; judge ≥ 0,9. Tác nhân — mỗi model đạt 3/3 lượt `agent-builder.eval.ts`.
- Kết quả nào là CHẾT: [đề xuất] Haiku trượt dù một trong ba vế của Trợ lý OKR thì giữ Gemini 3.8 Flash và đóng phần thử Haiku; một model trượt bộ dựng Tác nhân thì model đó không làm mặc định cho Tác nhân.
- Timebox: [đề xuất] Một lượt so, chạy sau khi việc sửa thước E22/E24 của hồ sơ `tro-ly-okr-de-xuat` gộp vào onehub; không chạy lại để «gỡ» một kết quả xấu.

## Kết quả prototype

Không dựng prototype. Số thử 14/10 ở mục trên là đổi hằng tại chỗ, không commit; lượt E22 Gemini cùng buổi
mất kho giữa chừng (kho `crm_tdx_e22_do` dùng chung giữa các cây) nên không dùng được.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Tuỳ chọn suy nghĩ của Anthropic qua AI Gateway | vercel.com/docs/ai-gateway (mục reasoning, Anthropic Messages API) | triết-lý/logic | có | |
| Danh mục và giá model | `GET https://ai-gateway.vercel.sh/v1/models`, đọc 14/10 | triết-lý/logic | có | |

## Cổng 0

- **decision = …** Căn cứ: chủ kho, phiên chẩn đoán E24 ngày 14/10: «duyệt» (cho vòng đo đối chứng Haiku 5.5 với Gemini 3.8 Flash), «Đồng ý cả ba» (cho ba đề xuất: sửa hai thước, thử Haiku sau r2, gieo model đo theo phương án B), rồi «Ngân sách tôi mới nạp và ko dùng GLM Fast thì chi phí ko phải vấn đề, nên việc đó xử lý sau, còn lại các hạng mục cứ tiếp tục.»
- **disposition = …** Không có prototype.
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Bảng so hai model trên cùng cây — ứng viên AC «thước so model».
- Kho đo không còn chạy GLM 5.2 Fast — ứng viên AC «gieo model kho đo».

## Out of scope từ khám phá

- Đổi model Trợ lý OKR trên production: ship ra người dùng thật, quyết ở Cổng Bằng chứng hoặc hàng sau, theo số của lượt so.
- Soạn OKR (`apps/agent-okr`), Kho tài liệu và bộ chấm nội bộ (GLM 5.2 Fast ghi cứng): ngoài hai vai đã đo.
- Kho test `crm_<id>_test`: nhiều bài kiểm dựa vào ô model trống để thử đường lùi mặc định.
