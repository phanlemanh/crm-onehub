---
schema_version: 1
feature: Tác nhân chạy đúng với mọi model trong danh mục — khuôn model thấy di động giữa các nhà cung cấp, model giải theo vai lúc chạy thay vì ghim theo bản Tác nhân, lượt mà bộ chạy hỏng hoặc chưa nộp kết quả thì ghi Hỏng
slug: tac-nhan-model-rieng
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, docs]
status: implemented
design_doc: docs/superpowers/specs/2026-09-27-tac-nhan-model-rieng-design.md
approved_by: Manh Phan
approved_at: 2026-09-27T06:52:54Z
---

# Acceptance Contract: tac-nhan-model-rieng

## Context

Ngày 27/09, thử Tác nhân trên máy local cho thấy ba lỗi:

- Mọi lượt chạy hỏng ngay ở lời gọi đầu với Gemini 3.7 Flash và 3.8 Flash — model
  production đang đặt.
- Lượt hỏng vẫn ghi «Xong».
- Bộ chạy dùng model ghim từ lúc lưu bản, nên đổi model trong Cài đặt không có tác
  dụng với Tác nhân đã dựng.

Vòng này sửa cả ba theo nguyên tắc «model là hạ tầng»: khuôn di động, một bộ giải model
theo vai, và hỏng hiện là hỏng.

Người dùng: người dựng và người chạy Tác nhân; quản trị chọn model ở Cài đặt › Chung.

Source input:
- `docs/reports/2026-09-26-tro-ly-okr/tac-nhan-hien-nay.md`
- luật 2, 6, 7 ở mục «Khi nào thêm mã, `tool`, `skill`, `subagent` hay Tác nhân» của `docs/agent.md`
- thiết kế ở `design_doc`, chủ kho duyệt trong hội thoại 27/09

## Criteria

- AC-1: Given mọi `tool` trong `apps/agent/agent/tools/` và `apps/agent/agent/subagents/*/tools/` (trừ `tool` đã tắt), cùng `outputSchema` của mọi `subagent` trong `apps/agent/agent/subagents/*/agent.ts`, When chuyển từng khuôn sang JSON Schema đúng cách eve chuyển (`~standard.jsonSchema.input({ target: "draft-07" })`), Then không khuôn nào chứa khoá `$ref`; và khi một khuôn mẫu dùng `z.json()` được đưa vào cùng phép kiểm, phép kiểm đỏ với thông điệp nêu tên khuôn đó.
- AC-2: Given khoá `AI_GATEWAY_API_KEY` và đúng bộ `tool` của bộ chạy cộng `outputSchema` của nó, When gọi `generateText` của gói `ai` mà eve dùng, qua AI Gateway, với bộ khuôn đó và ép gọi `finish_run`, lần lượt tới `google/gemini-3.8-flash`, `zai/glm-5.2-fast` và `openai/gpt-5-mini`, Then cả ba trả về một lời gọi `finish_run` có đối số parse được bằng khuôn kết quả lượt chạy và chứa đủ hai khoá mà lời nhắn yêu cầu; khi thay lại khuôn kết quả bằng `z.json()`, lời gọi tới Google trả lỗi có chữ «ref loops»; thiếu khoá thì phép đo thoát mã 2 với lời báo «thiếu AI_GATEWAY_API_KEY», không bao giờ thoát 0.
- AC-3: Given khuôn kết quả lượt chạy, When bộ chạy nộp một kết quả phẳng (chữ, số, đúng/sai, `null`, danh sách chữ và số) như hai kết quả thật đo ngày 27/09, Then đầu vào của `finish_run` nhận nó và `AgentRun.result` lưu nguyên từng ô; When nộp một kết quả có đối tượng lồng bên trong, Then đầu vào của `finish_run` từ chối với lỗi nêu đúng tên ô lồng; và đầu vào `finish_run`, `outputSchema` của `agent_runner` và bộ đọc `AgentRun.result` dùng cùng một khuôn.
- AC-4: Given một lượt Tác nhân đang RUNNING, When phiên gốc của lượt nhận `action.result` của `agent_runner` với `isError: true` và `output` `{code, message}`, Then lượt thành FAILED ngay với `errorCode` `RUNNER_FAILED` và `errorMessage` bằng `message` đó (cắt tối đa 1.000 ký tự), có đúng một sự kiện `run.failed`; `output` không có `message` dạng chuỗi (chuỗi trần hoặc `{}`) thì `errorMessage` là «Bộ chạy báo lỗi nhưng không nói lý do.»; điều này đúng khi sự kiện đi qua hook thật mà eve gọi, với `runId` lấy từ thuộc tính phiên do điều phối đặt; khi `session.completed` tới sau đó, lượt vẫn FAILED; và `action.result` không lỗi, hay đến từ `subagent` khác, không đổi trạng thái lượt.
- AC-5: Given một lượt Tác nhân đang RUNNING, When `session.completed` tới mà bộ chạy chưa gọi `finish_run` (`AgentRun.result` là `null`), Then lượt thành FAILED với `errorCode` `RUNNER_NO_RESULT` và `errorMessage` «Bộ chạy dừng trước khi nộp kết quả.»; When bộ chạy đã gọi `finish_run` trước đó, Then lượt thành SUCCEEDED với kết quả đã nộp, như hôm nay.
- AC-6: Given một Tác nhân đã Đưa vào chạy khi Cài đặt đặt model X (bản ghi «dựng bằng X»), rồi quản trị đổi Cài đặt sang model Y, When một lượt mới được điều phối, Then bộ chạy của lượt dùng Y (thuộc tính phiên mang Y và bộ giải model của `agent_runner` trả Y), `AgentRun.modelId` bằng Y, và `AgentVersion.modelId` vẫn là X; và không mã nào trong `apps/agent/agent` còn đọc `version.modelId` để chọn model chạy.
- AC-7: Given Cài đặt đặt model X, When bộ giải model trả lời cho phiên gốc (purpose `research`), phiên gốc của lượt Tác nhân (purpose `team-agent`), bộ dựng, và bộ chạy, Then cả bốn trả X; Given Cài đặt để trống, Then cả bốn trả `null` để eve dùng model mặc định; và phiên gốc, bộ dựng, bộ chạy cùng đi qua một bộ giải `modelTheoVai` duy nhất trong `apps/agent/agent/lib/model.ts`.
- AC-8: Given nhánh này, When đọc `docs/agent.md`, Then:
  - mục «Model» nêu model giải theo vai lúc chạy và bộ chạy không ghim model theo bản;
  - mục «Team-agent builder and runner» nêu hai mã `RUNNER_FAILED` và `RUNNER_NO_RESULT`;
  - luật 2 của mục «Khi nào thêm…» nêu model cố định chỉ cho `subagent` có ranh giới riêng;
  - có đoạn «Chỗ rẽ có tên với bản của hãng» liệt đủ các tệp của hãng mà nhánh này sửa, so với `origin/release`;
  - bản `docs/agent.md` ở merge-base của `origin/onehub` không đạt các điều trên.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix, trục dựng lại) —
`_acceptance/tac-nhan-model-rieng/morphological-scan.md`.

- **Trục A · Khuôn model thấy:** công cụ gốc | công cụ bộ dựng | công cụ bộ chạy | `outputSchema`.
  [thước CE: danh sách tệp `agent/tools`, `agent/subagents/*/tools`, `agent/subagents/*/agent.ts`]
- **Trục B · Nhà cung cấp:** Google | z.ai | OpenAI.
  [thước CE: danh mục Gateway đọc 27/09; `[NGÀNH: Google Gemini API — function declarations]`]
- **Trục C · Kết cục bộ chạy:** nộp | báo lỗi | chưa nộp | gốc hỏng | huỷ.
  [thước CE: ba nhánh `session.completed` / `turn.failed` / `turn.cancelled` của `channels/crm.ts`; N0 phép 6c]
- **Trục D · Model trong Cài đặt:** đặt X | mặc định | đổi X→Y sau khi dựng.
  [thước CE: `packages/db/src/settings.ts`, `builder-runtime.ts`]
- **Ô → AC:**
  - A × không `$ref` → AC-1;
  - bộ chạy × B → AC-2;
  - khuôn kết quả phẳng → AC-3;
  - báo lỗi → AC-4;
  - chưa nộp / nộp → AC-5;
  - đổi X→Y → AC-6;
  - đặt X / mặc định × bốn phiên → AC-7;
  - tài liệu và chỗ rẽ → AC-8.
- **Ô gạch:** gốc hỏng lượt và bị huỷ — đường đóng lượt đã có, vòng này không đổi.
- **[GIẢ ĐỊNH]** `output` của kết quả lỗi mà eve trả về gốc có dạng `{code, message}`. Đây là dạng N0 đo được (6c) và lượt Gemini ngày 27/09 cho thấy. Fixture của AC-4 chép từ một lượt eve thật, chụp ở S3. Sai dạng thì lý do là câu cố định «Bộ chạy báo lỗi nhưng không nói lý do.», và lượt vẫn FAILED — AC-4 có ca cho điều này.
- **[GIẢ ĐỊNH]** Chuyển khuôn bằng `~standard.jsonSchema.input({target:"draft-07"})` trùng với những gì eve 0.29.4 gửi đi. Nguồn là `eve/dist/src/shared/tool-schema.js`. AC-2 đo lại qua `generateText` của chính gói `ai` mà eve dùng, nên phần chuyển khuôn theo từng nhà cung cấp không do phép đo tự ráp.

## Out of scope

- Ô chọn model riêng cho vai Tác nhân trong Cài đặt, và chữ mô tả dưới ô chọn model.
- Cờ ZDR cho Tác nhân; rơi về model mặc định khi đọc Cài đặt hỏng.
- Lối rò Slack và chạy bằng danh tính người dựng — lượt «Vá lối rò Slack» riêng.
- Cổng chạy thử trước khi Đưa vào chạy; trạng thái «không làm được» của bộ dựng.
- Lọc danh mục model theo kết quả gọi thật.
- Gửi bản vá lên hãng — chủ kho đã chọn không gửi.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- **Không migration.** `AgentVersion.modelId` đổi nghĩa thành «dựng bằng», chỉ để
  thông tin. `AgentRun.modelId` ghi model đã chạy thật.
- **Đường nền 27/09 đỏ hai chỗ, cả hai không do kho** (`duong-nen.md`):
  - `build_khong_cache` đỏ vì `duong-nen.mjs` chạy qua `bash -lc`, rơi về Node 22,
    trong khi eve đòi Node 24. Chip sang kit đã mở từ 25/09. Cùng lệnh với PATH Node 24
    thì xanh.
  - «THIEU merge-base» — bộ kit coi `merge-base` là một chương trình riêng, trong khi
    đó là lệnh con của git.
- **Phép đo gọi thật (AC-2) tiêu tiền model**, khoảng $0,01 mỗi lượt. Thiếu khoá thì
  nó không xanh.
