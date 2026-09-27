# 05 — Mẫu kỹ thuật cho một lớp AI mở rộng được (2025–2026)

Ngày soạn: 2026-09-26. Phạm vi: mẫu kỹ thuật hiện hành từ nguồn sơ cấp (tài liệu nhà
cung cấp, bài kỹ thuật, đặc tả), đối chiếu với thứ `apps/agent` của OneHub đã có, để
dựng một lớp AI dùng lại được cho nhiều tính năng — trước mắt là khu OKR (lượt 9
`tro-ly-okr`, lượt 10 `okr-trong-chat`).

Quy ước:

- **[nguồn]** = đã thấy trong nguồn ghi kèm. **[mã]** = đã thấy trong mã hoặc tài liệu
  của kho này (chỉ đọc). **[suy luận]** = kết luận của người viết, chưa có nguồn nói
  thẳng.
- Mức tin: **cao** = trang chính chủ / đặc tả / tài liệu đi kèm bản cài; **vừa** = bên
  thứ ba uy tín hoặc nghiên cứu; **thấp** = suy luận hoặc nguồn yếu.
- Tài liệu eve trích từ bản đi kèm gói đã cài (`apps/agent/node_modules/eve/docs`,
  eve 0.29.4) — khớp đúng phiên bản kho đang chạy, nên xếp mức **cao**. Bản công khai:
  https://github.com/vercel/eve/tree/main/docs

---

## 0. Tóm tắt

1. **Workflow trước, agent sau.** Mọi nguồn lớn (Anthropic, AI SDK) cùng khuyên: việc
   có đường đi biết trước thì viết thành workflow có mã kiểm từng bước; chỉ để mô hình
   tự lái vòng lặp công cụ khi các bước thật sự không đoán trước được. Phần lớn tính
   năng AI của OKR (viết lại câu, tóm tắt tuần, cảnh báo lệch) là workflow; chỉ hỏi
   đáp trong chat là agent.
2. **Kho đã có sẵn phần lớn khung** [mã] — eve cung cấp skill theo chuẩn `SKILL.md`,
   approval bền (park/resume), schedule, eval, dynamic tools/skills theo người gọi; kho
   đã thêm hàng `AgentTask`, một lịch dispatch duy nhất, đường ghi đề xuất có trạng
   thái (`lib/facts.ts`), mô hình bằng chứng, `capabilities.ts`, sổ chi phí theo bước
   (hook `audit`). Thiếu nhất là **lớp quyền theo người hỏi**: skill
   `data-boundaries.md` hiện nói tác nhân được đọc mọi thứ, ranh giới chỉ ở đầu ra —
   điều đó mâu thuẫn trực tiếp với vai «chỉ OKR».
3. **Knowledge cho OKR là dữ liệu có cấu trúc, không phải RAG.** Con số đi qua danh
   mục chỉ số cố định (một dạng semantic layer) và công cụ đọc có kiểu; benchmark của
   dbt Labs 2026 cho thấy semantic layer gần 100% trên câu hỏi đã mô hình hoá và "hỏng
   an toàn", trong khi text-to-SQL trả sai mà trông hợp lý. Embedding chỉ đáng làm khi
   cần tìm trong chữ tự do (ghi chú check-in) vượt cỡ ngữ cảnh.
4. **Quyền phải có hiệu lực ở ba chỗ**: bộ công cụ được cấp theo người gọi (không có
   công cụ thì không thể gọi), từng executor kiểm lại bằng cùng hàm kiểm của API, và
   bước gửi đi lọc theo **người nhận** chứ không theo người chạy. Danh tính lấy từ
   phiên đã xác thực, không bao giờ từ đầu vào của mô hình.
5. **Human-in-the-loop là một kho đề xuất có trạng thái**, không phải một hộp thoại:
   đề xuất → nhận nguyên văn / sửa / bác → áp → hoàn tác; bác rồi thì không mời lại.
   Kho đó đồng thời là nguồn số đo online (tỷ lệ nhận/sửa/bác).
6. **Đánh giá hai tầng**: offline bằng `eve eval` với 20–50 ca lấy từ lỗi thật, chấm
   bằng mã trước, LLM-as-judge có rubric nhị phân được hiệu chỉnh với người; online
   bằng sự kiện của kho đề xuất; cộng một **bộ kiểm grounding bằng mã** chạy lúc
   runtime cho mọi con số trong câu tóm tắt.
7. **Chi phí**: trần ở AI Gateway chỉ là trần mềm và không biết "phòng ban"; cần sổ chi
   phí trong ứng dụng kiểm **trước khi xếp việc**, gom việc theo đơn vị, giữ tiền tố
   prompt ổn định để ăn cache, chạy việc không gấp ở tầng `flex`, và coi hết ngân sách
   là "tính năng tạm nghỉ" chứ không phải lỗi.

---

## 1. Điểm xuất phát: kho đã có gì [mã]

| Khối | Đã có | Ở đâu | Ý nghĩa cho lớp AI |
| --- | --- | --- | --- |
| Framework | eve 0.29.4 (filesystem-first: `instructions`, `tools/`, `skills/`, `schedules/`, `subagents/`, `hooks/`) | `apps/agent/agent` | Đã có đủ chỗ cắm; không cần framework thứ hai |
| Skill | 4 skill dạng markdown phẳng: `data-boundaries`, `evidence`, `identity-matching`, `writing-a-brief` | `agent/skills/` | Đúng chuẩn progressive disclosure của eve (`load_skill`) |
| Tool | 27 tool có kiểu; mọi tool đọc trả kèm id bản ghi lân cận | `agent/tools/`, `docs/agent.md` §Three records | Mẫu ACI tốt, dùng lại cho OKR |
| Subagent | `agent_builder`, `agent_runner`, sandbox deny-all | `agent/subagents/` | Mẫu tách chuyên gia có quyền riêng |
| Trigger | Một lịch duy nhất `schedules/dispatch.ts`; mọi việc là hàng `AgentTask` có `dueAt`, ưu tiên, hai làn (có mô hình / không mô hình) | `lib/tasks.ts`, `lib/dispatch.ts` | Khung trigger đã chuẩn: "mỗi N phút" nằm ở `dueAt`, không thêm cron |
| Nhắc chủ động | Nhắc buổi sáng: một hàng mỗi người mỗi ngày (chỉ mục duy nhất), làn không mô hình, cắt độ dài tin, ghép người Slack qua `SlackMemberMatch` | `lib/nhac-ke-hoach.ts`, `lib/tin-nhac.ts` | Mẫu chống spam và phân giải danh tính kênh đã có |
| Approval | `sensitiveWrite()`: phiên tự động → `denied` kèm lý do; người thật → `user-approval` | `lib/approval.ts` | Đúng khuôn eve/AI SDK 7 |
| Đề xuất có trạng thái | `lib/facts.ts`: đường ghi duy nhất; không ghi đè người; không mời lại điều đã bác; so giá trị theo nghĩa | `lib/facts.ts` | Chính là mẫu suggest/accept cần cho OKR |
| Bằng chứng | Tool báo điều đã *thấy*, không nhận "độ tự tin" từ mô hình | `lib/evidence.ts` | Nguyên tắc grounding sẵn có |
| Tuỳ chọn | Thiếu khoá thì năng lực biến mất, không ném | `lib/capabilities.ts` | Khuôn cho "hết ngân sách = tạm nghỉ" |
| Chi phí | Ngân sách mỗi phiên (đơn vị = một lần gọi nhà cung cấp tính tiền); hook `audit` đọc `inputTokens/outputTokens/costUsd` mỗi bước | `lib/focus.ts`, `hooks/audit.ts` | Có sẵn nguyên liệu cho sổ chi phí |
| Mô hình | Chọn bằng hàng `AppSetting` lúc `session.started` (cache theo mô hình); fallback biên dịch `zai/glm-5.2-fast` | `lib/model.ts`, `@crm/db/settings` | Tầng mô hình đã động |
| Eval | `evals/evals.config.ts` (chưa khai judge), một eval `agent-builder` | `apps/agent/evals/` | Khung eval đã chạy được |
| Manifest agent tuỳ biến | `actions`, `triggers` (schedule/event), `dataScope` (`SELECTED`/`WORKSPACE` + resources); runtime chặn bản ghi ngoài phạm vi | `packages/validation/src/agent-manifest.ts`, `lib/run-runtime.ts` | Mầm của một registry năng lực có khai phạm vi |
| Ranh giới dữ liệu | "Được đọc mọi thứ; ranh giới là đầu ra" | `skills/data-boundaries.md`, `docs/agent.md` §What may be read | **Mâu thuẫn với vai «chỉ OKR»** — xem §5 |

---

## 2. Kiến trúc agent: workflow, agent, context, skill, MCP

### 2.1 Workflow hay agent

**Mẫu [nguồn].** Anthropic phân biệt *workflow* (đường đi do mã định sẵn, LLM và
công cụ chạy theo) với *agent* (mô hình tự quyết bước kế và công cụ). Năm mẫu
workflow: **prompt chaining** (chia bước, có cổng kiểm bằng mã giữa các bước),
**routing** (phân loại đầu vào rồi chuyển sang xử lý chuyên biệt), **parallelization**
(chia mảng độc lập hoặc bỏ phiếu nhiều lần), **orchestrator-workers** (một LLM trung
tâm chia việc động cho worker), **evaluator-optimizer** (một bên sinh, một bên chấm và
góp ý theo vòng). Agent tự trị để dành cho bài mở, nhiều bước, khi đã tin phán đoán của
mô hình và có sandbox, guardrail. Lời khuyên nền: bắt đầu bằng thứ đơn giản nhất, nhiều
khi chỉ cần một lần gọi LLM tốt; framework tiện nhưng che mất cơ chế bên dưới.
— https://www.anthropic.com/engineering/building-effective-agents (19/12/2024, **cao**)

AI SDK 7 nói cùng ý theo cách của nó: dùng `ToolLoopAgent` khi cần tự động hoá qua
công cụ và chấp nhận kết quả không xác định; dùng `generateText`/`streamText` trực tiếp
khi cần luồng điều khiển tường minh, lặp lại được.
— https://ai-sdk.dev/docs/agents/overview (**cao**)

**Khi nào dùng / rủi ro.**

| Mẫu | Hợp với việc OKR nào [suy luận] | Rủi ro chính |
| --- | --- | --- |
| Prompt chaining + cổng mã | Tóm tắt tuần: lấy dữ liệu → sinh câu có trích dẫn → kiểm số bằng mã → gửi | Cổng kiểm lỏng thì lỗi đi thẳng ra ngoài |
| Routing | Tin nhắn Slack/Zalo: phân loại "cập nhật số" / "hỏi đáp" / "khác" trước khi chọn luồng | Phân loại sai → sai quyền, sai công cụ; cần lối "không chắc thì hỏi" |
| Evaluator-optimizer | Viết lại câu mục tiêu: luật (lượt 7) chấm trước, mô hình viết lại, luật chấm lại | Vòng lặp tốn token nếu không có trần số vòng |
| Orchestrator-workers | Hầu như không cần cho OKR | Nhân chi phí (xem 2.4) |
| Agent (tool loop) | Hỏi đáp tự do trong chat trên OKR theo quyền người hỏi | Excessive agency, prompt injection, chi phí không đoán trước |

### 2.2 Context engineering

**Mẫu [nguồn].** Ngữ cảnh là ngân sách chú ý có hạn; càng nhồi nhiều token càng giảm
độ chính xác ("context rot"). Mục tiêu là tập token nhỏ nhất mà đủ tín hiệu. Cụ thể:
system prompt ở "độ cao" vừa phải (đủ heuristic, không mã hoá cứng logic giòn); bộ công
cụ gọn, không chồng chức năng; vài ví dụ chuẩn hơn là liệt kê mọi ngoại lệ; truy xuất
**just-in-time** — giữ định danh nhẹ (id, đường dẫn) và để agent tự nạp khi cần, hoặc
lai giữa nạp trước và tự khám phá; với việc dài: **compaction** (tóm lịch sử),
**ghi chú có cấu trúc** ngoài ngữ cảnh, và **sub-agent** trả về bản tóm gọn cỡ
1.000–2.000 token.
— https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents (29/09/2025, **cao**)

eve hiện thực đúng các đòn bẩy này: `instructions.md` luôn bật và nên ngắn; `skills/`
nạp theo nhu cầu; workspace/sandbox xem qua công cụ chứ không dán vào prompt; subagent
có instructions, tools, sandbox riêng; `defineDynamic` để instructions/skills/tools
khác nhau theo người gọi. — `eve/docs/concepts/context-control.md` (**cao**)

**Áp vào OneHub [suy luận].** Kho đã làm đúng tinh thần này (khối "Who we are" tối đa
320 ký tự, được prompt-cache; tool trả id lân cận để agent tự đi tiếp). Với OKR: không
nạp cả cây OKR vào prompt; phần mở đầu phiên chỉ nêu người hỏi là ai, thuộc đơn vị nào,
kỳ hiện tại, và id các mục tiêu của họ — phần còn lại đọc qua tool.

### 2.3 Thiết kế tool (ACI)

**Mẫu [nguồn].** Ít tool mà khớp quy trình tốt hơn phủ mọi endpoint; gộp thao tác hay đi
cùng nhau; đặt namespace theo tiền tố; trả thông tin tín hiệu cao, đổi UUID khó đọc thành
nhãn có nghĩa; cho tham số `response_format` (gọn/chi tiết); phân trang, lọc, cắt kèm
chỉ dẫn tìm hẹp hơn; thông báo lỗi phải chỉ cách sửa; viết mô tả như dạy người mới; và
phát triển tool bằng eval.
— https://www.anthropic.com/engineering/writing-tools-for-agents (11/09/2025, **cao**)

Ở tầng giao thức, MCP phân biệt hai loại lỗi: lỗi giao thức (JSON-RPC) và lỗi thực thi
công cụ (`isError: true`, kèm thông tin để mô hình tự sửa); tool có thể khai
`outputSchema` và trả `structuredContent`.
— https://modelcontextprotocol.io/specification/2025-11-25/server/tools (**cao**)

**Rủi ro [mã].** Kho đã trả giá cho một lỗi thuộc loại này: một lần từ chối ném ra như
exception thì mô hình hiểu là lỗi tạm và thử lại ba lần (sự cố 2026-09-08); sửa bằng
cách trả **từ chối như một kết quả**. Quy tắc này cần thành luật chung cho mọi tool OKR
(từ chối vì quyền, vì hết ngân sách, vì thiếu cấu hình đều là kết quả có lý do).

### 2.4 Multi-agent

**Mẫu [nguồn].** Hệ nghiên cứu của Anthropic dùng orchestrator-worker: agent chính chia
câu hỏi, subagent tìm song song. Hiệu quả cao với câu hỏi cần khám phá rộng, nhưng agent
tốn khoảng 4 lần token so với chat, còn multi-agent khoảng 15 lần — chỉ đáng với việc giá
trị cao. Bài học vận hành: lỗi có trạng thái cộng dồn, cần tiếp tục từ checkpoint; cần
trace production; triển khai kiểu "rainbow" để không cắt ngang agent đang chạy.
— https://www.anthropic.com/engineering/multi-agent-research-system (13/06/2025, **cao**)

**Áp vào OneHub [suy luận].** Không cần multi-agent cho OKR. Subagent chỉ dùng khi cần
**ranh giới quyền** khác (như `agent_builder` hiện nay), không phải để tăng chất lượng.

### 2.5 Agent Skills (`SKILL.md`, progressive disclosure)

**Mẫu [nguồn].** Skill là thư mục gồm chỉ dẫn, script, tài nguyên mà agent phát hiện và
nạp khi cần. `SKILL.md` bắt buộc có frontmatter `name` và `description`; metadata được
nạp sẵn để mô hình biết khi nào skill liên quan; thân `SKILL.md` nạp khi kích hoạt; file
phụ nạp khi cần — nhờ vậy ngữ cảnh gần như không giới hạn. Skill có thể mang mã chạy xác
định thay vì để mô hình sinh. Chỉ cài skill từ nguồn tin cậy, soát mã và kết nối mạng
của skill lạ. Skill bổ sung cho MCP: MCP đưa công cụ, skill dạy quy trình dùng công cụ.
— https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills (16/10/2025, cập nhật chuẩn mở 18/12/2025, **cao**)

Đặc tả mở: `name` ≤ 64 ký tự chữ thường-số-gạch, trùng tên thư mục; `description`
≤ 1024 ký tự, nói cả *làm gì* và *khi nào dùng*; tuỳ chọn `license`, `compatibility`,
`metadata`, `allowed-tools` (thử nghiệm); thư mục `scripts/`, `references/`, `assets/`.
Ngân sách gợi ý: metadata ~100 token, thân < 5.000 token (< 500 dòng), tài nguyên nạp
khi cần; tham chiếu file chỉ sâu một cấp.
— https://agentskills.io/specification (**cao**)

eve: skill theo đúng chuẩn đó; mô tả là **gợi ý định tuyến**, viết như nhiệm vụ kích hoạt;
nạp skill chỉ thêm chỉ dẫn, không thêm bề mặt thực thi (tool vẫn hiện dù skill chưa
nạp); skill thuộc riêng từng agent, subagent không thấy skill của gốc; **dynamic skill**
theo người gọi bằng `defineDynamic` đọc `ctx.session.auth`.
— `eve/docs/skills.mdx`, `eve/docs/guides/dynamic-capabilities.md` (**cao**)

**Rủi ro [suy luận].** Skill chỉ là chỉ dẫn — không phải ranh giới quyền. Mọi luật phải
đúng kể cả khi mô hình không nạp skill (ví dụ "không để lộ dữ liệu đối tác") phải nằm ở
tool/policy, không nằm ở skill. Skill cũng là văn bản đi vào ngữ cảnh: skill do người dùng
cuối soạn (như playbook đội) là nội dung không tin cậy.

### 2.6 MCP

**Mẫu [nguồn].** Đặc tả 2025-11-25: host–client–server trên JSON-RPC 2.0, có thương
lượng năng lực. Server cung cấp **tools** (hàm cho mô hình gọi — mô hình điều khiển),
**resources** (ngữ cảnh/dữ liệu cho người hoặc mô hình dùng), **prompts** (mẫu tin nhắn
và quy trình cho người dùng). Client có thể cung cấp **sampling**, **roots**,
**elicitation**. Nguyên tắc an toàn: người dùng đồng ý và kiểm soát rõ; host phải xin
đồng ý trước khi gọi tool; annotation của tool là **không tin cậy** trừ khi server tin
cậy; nên có người trong vòng có quyền từ chối lời gọi. Tool có thể khai `outputSchema`,
`execution.taskSupport` (thực thi dạng task).
— https://modelcontextprotocol.io/specification/2025-11-25 và .../server/tools (**cao**)

**Remote MCP + auth [nguồn].** Với transport HTTP: server MCP là OAuth 2.1 resource
server; **bắt buộc** Protected Resource Metadata (RFC 9728) để client tìm authorization
server; client **bắt buộc** gửi `resource` (RFC 8707) để token gắn đúng đối tượng; server
**bắt buộc** kiểm audience và **cấm chuyển tiếp token** (token passthrough) xuống API phía
sau (nguy cơ confused deputy); PKCE `S256` bắt buộc; đăng ký client ưu tiên
pre-registration, rồi Client ID Metadata Documents, cuối cùng mới Dynamic Client
Registration; phạm vi quyền tối thiểu và nâng dần (step-up) khi gặp `insufficient_scope`.
— https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization (**cao**)

**Code execution với MCP [nguồn].** Khi agent nối tới hàng trăm tool, định nghĩa tool và
kết quả trung gian làm phình ngữ cảnh; đưa MCP ra thành API mã để agent viết mã gọi, lọc
dữ liệu ngay trong môi trường chạy (ví dụ 150.000 → 2.000 token), giữ dữ liệu trung gian
ngoài mô hình, có thể token hoá PII. Đổi lại phải có sandbox, giới hạn tài nguyên, giám
sát. — https://www.anthropic.com/engineering/code-execution-with-mcp (04/11/2025, **cao**)

eve: `defineMcpClientConnection` (Streamable HTTP/SSE), tên tool dạng `<kết nối>__<tool>`,
lộ ra qua `connection_search`; OAuth qua Vercel Connect (mặc định theo người dùng, có thể
theo app); token không bao giờ vào ngữ cảnh mô hình hay lịch sử hội thoại.
— `eve/docs/connections/mcp.mdx`, `eve/docs/concepts/security-model.md` (**cao**)

**Khi nào dùng MCP cho OneHub [suy luận].**
- *Tiêu thụ* MCP (agent của mình gọi server ngoài): khi cần Google Sheets, Linear… mà đã
  có server MCP — hợp với lượt 6 (nhập KR từ Sheets) nếu không muốn tự viết tool.
- *Cung cấp* MCP (cho Claude/ChatGPT của nhân viên đọc OKR): **chưa nên** ở R3. Lý do: phải
  dựng OAuth 2.1 + PRM + kiểm audience, và mọi client bên ngoài thành đường vào dữ liệu
  mới phải đo quyền như lượt 2. Nếu làm, server MCP chỉ lộ công cụ đọc có kiểu, dùng
  chung hàm kiểm quyền với API — đây là truy cập dữ liệu, không phải "trí khôn", nên
  không trái luật "trí khôn sống ở `apps/agent`"; nhưng đó là một quyết định kiến trúc
  cần chủ kho chốt (xem §12).

---

## 3. Vercel AI SDK và AI Gateway

### 3.1 AI SDK 7: agent, tool, structured output, approval

**Mẫu [nguồn].**
- `ToolLoopAgent`: gọi mô hình → chạy tool → nối kết quả → lặp tới khi dừng; cấu hình
  `model`, `tools`, `stopWhen`, `prepareStep`, `runtimeContext` (trạng thái phía máy chủ
  đi suốt vòng lặp), `toolsContext` (giá trị riêng từng tool như khoá API).
  — https://ai-sdk.dev/docs/agents/overview (**cao**)
- Structured output: `generateText`/`streamText` với `output` — `Output.object()`,
  `Output.array()`, `Output.choice()`, `Output.json()`; schema Zod; `partialOutputStream`
  để stream; kết hợp được với tool (sinh output tính là một bước, ảnh hưởng `stopWhen`);
  hỏng thì ném `NoObjectGeneratedError` kèm văn bản, usage, nguyên nhân.
  — https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data (**cao**)
- Approval: `toolApproval` trả một trong `'not-applicable'`, `'approved'`, `'denied'`,
  `'user-approval'`; hàm quyết định nhận input đã parse cùng `toolCallId`, `messages`,
  `toolContext`, `runtimeContext`; UI thấy `state: 'approval-requested'`, trả lời bằng
  `addToolApprovalResponse`; khi bị từ chối mô hình nhận lời từ chối và nên có chỉ dẫn
  chống lặp; `experimental_toolApprovalSecret` ký HMAC để client không giả được lời duyệt;
  tool của subagent không dùng được `toolApproval`, tool do provider thực thi đi vòng qua
  approval. (`needsApproval` nay chỉ còn cho `WorkflowAgent`.)
  — https://ai-sdk.dev/docs/agents/tool-approvals (**cao**)

eve bọc đúng mô hình approval này: trường `approval` của tool trả **trạng thái approval
của AI SDK 7**; có sẵn `never()`/`once()`/`always()` hoặc hàm chính sách; phiên park bền ở
`session.waiting` bao lâu cũng được; kênh Slack tự vẽ nút; một tin nhắn tiếp theo trùng
nhãn, id hoặc số thứ tự lựa chọn sẽ tự giải quyết yêu cầu.
— `eve/docs/tools/human-in-the-loop.md` (**cao**)

**Áp vào OneHub [suy luận].** Kho không cần dùng AI SDK trực tiếp cho agent — eve đã là
lớp đó. Nhưng hai thứ nên mượn thẳng: (1) **structured output có schema Zod** cho mọi đầu
ra máy sẽ kiểm (câu tóm tắt kèm id check-in nguồn, câu viết lại kèm lý do), vì kiểm được
bằng mã; (2) việc eve cho phép trả lời approval bằng chữ khớp nhãn lựa chọn là lối đi cho
**Zalo, nơi không có nút** (lượt 10 ghi nhận điều này).

### 3.2 AI Gateway: budget, fallback, cache, tầng dịch vụ

**Budget [nguồn].** Bốn phạm vi: team, project (qua OIDC của deployment), API key, thành
viên. Trần chồng nhau — một request phải qua mọi trần trong phạm vi. Chu kỳ `daily`,
`weekly` (thứ Hai 00:00 UTC), `monthly`, `none`. **Là trần mềm**: kiểm lúc bắt đầu
request nên request vượt ngưỡng vẫn chạy xong. Vượt trần → HTTP 402,
`type: quota_for_entity_exceeded`; trong AI SDK 7 có thể hiện thành
`GatewayInternalServerError` nên phải đọc chi tiết trước khi thử lại. Cảnh báo email ở
50/75/100%. Chi tiêu BYOK không tính vào trần. Budget mới có thể trễ một hai phút mới
có hiệu lực.
— https://vercel.com/docs/ai-gateway/observability-and-spend/budgets (cập nhật 10/09/2026, **cao**)

**Fallback [nguồn].** `providerOptions.gateway.models` liệt kê mô hình dự phòng theo thứ
tự; `order` chọn thứ tự nhà cung cấp cho mỗi mô hình; hết nhà cung cấp của mô hình này
mới sang mô hình kế; metadata `modelAttempts` ghi từng lần thử.
— https://vercel.com/docs/ai-gateway/models-and-providers/model-fallbacks (**cao**)

**Cache [nguồn].** `caching: 'auto'` tự đặt `cache_control` cho nhà cung cấp cần đánh dấu
(Anthropic, MiniMax, Alibaba); OpenAI, Google, DeepSeek cache ngầm. Với Anthropic: ghi
cache 1,25× (5 phút) hoặc 2× (1 giờ), đọc 0,1× giá input — hoà vốn sau một lần đọc. Header
`x-session-affinity` giữ cache gần nhau; "cache anchor" khi phần giữa prompt bị viết lại.
— https://vercel.com/docs/ai-gateway/models-and-providers/automatic-caching (**cao**)

**Tầng dịch vụ [nguồn].** `serviceTier`: `default`, `priority`, `flex` (rẻ hơn, chậm
hơn) cho OpenAI, Google AI Studio, Vertex, SpaceXAI; là gợi ý nỗ lực tốt nhất; tính tiền
theo tầng thực sự phục vụ.
— https://vercel.com/docs/ai-gateway/models-and-providers/service-tiers (**cao**)

**Định tuyến theo chi phí [nguồn].** Hướng dẫn của Vercel: phân loại độ khó bằng heuristic
không tốn gọi mô hình trước, chỉ gọi mô hình nhỏ khi heuristic không chắc; mỗi tầng có mô
hình chính và dự phòng từ nhà cung cấp khác; **nâng tầng khi đầu ra tầng rẻ trượt kiểm
chứng được** (schema sai, từ chối, trường bắt buộc rỗng); mỗi tầng một API key có trần.
— https://vercel.com/kb/guide/cost-aware-model-routing-with-ai-gateway (06/2026, **cao**)

**Rủi ro [suy luận].** Budget của Gateway không biết "phòng ban" hay "tính năng" — chỉ biết
team/project/key/thành viên Vercel. Trần tháng ~$20 của team là **chung cho mọi việc của
tác nhân** (làm giàu danh bạ, nghiên cứu…), nên tính năng OKR có thể bị việc khác ăn hết
ngân sách, hoặc ngược lại. Cần sổ chi phí trong ứng dụng (xem §8).

---

## 4. Knowledge: có cấu trúc, semantic layer, RAG, graph, bộ nhớ

### 4.1 Bảng chọn

| Loại câu hỏi | Mẫu nên dùng | Nguồn | Hợp với OKR [suy luận] |
| --- | --- | --- | --- |
| "KR X đang bao nhiêu, ai sở hữu, cập nhật lần cuối khi nào" | **Tool gọi API/truy vấn có kiểu**, đã lọc quyền | Anthropic tools, eve tools | Đường chính |
| "Doanh số chốt của phòng Y quý này" | **Semantic layer / danh mục chỉ số**: mô hình chọn chỉ số + chiều, mã sinh truy vấn | dbt 2026 | Đường chính cho số; kho đã chốt danh mục trong mã (lượt 6) |
| "Tìm check-in có nhắc tới 'thiếu người'" | **Tìm trong chữ** (từ khoá trước, embedding khi cần) | Contextual Retrieval | Làm sau, khi có dữ liệu thật |
| "Chủ đề rủi ro chung của cả công ty quý này" | **Map-reduce / tóm theo cụm** (kiểu GraphRAG global search) | GraphRAG | Làm bằng gom theo cây tổ chức có sẵn |
| "Nhớ rằng tôi thích tóm tắt ngắn" | **Bộ nhớ dài hạn** theo người, có phạm vi | eve multi-tenant memory, Anthropic memory tool | Nhỏ, sau cùng |

### 4.2 Truy vấn có cấu trúc và semantic layer

**Mẫu [nguồn].** Benchmark 2026 của dbt Labs (11 câu hỏi × 20 lần, bộ ACME Insurance):
trên dữ liệu đã mô hình hoá, semantic layer đạt 98,2% (Claude Sonnet 4.6) và 100% (GPT-5.3
Codex), text-to-SQL đạt 90,0% và 84,1%. Semantic layer sinh truy vấn xác định nên không
thể join sai hay gộp sai, và **khi không trả lời được thì báo lỗi thay vì trả số sai**;
text-to-SQL linh hoạt hơn nhưng trả sai trông hợp lý. Đổi lại, semantic layer chỉ trả lời
được điều đã mô hình hoá. Khuyến nghị: dùng semantic layer khi độ chính xác là bắt buộc
(báo cáo, KPI, kiểm toán); text-to-SQL cho khám phá tuỳ hứng; lai: thử semantic layer
trước, rồi xét thêm mô hình, cuối cùng mới rơi về text-to-SQL.
— https://docs.getdbt.com/blog/semantic-layer-vs-text-to-sql-2026 (07/04/2026, **cao** cho số liệu của chính benchmark; đây là bên bán semantic layer nên cân nhắc thiên vị)

eve có một ví dụ nhỏ cùng tinh thần: lưu "định nghĩa của đội" cho chỉ số (vd "khách hoạt
động = có mua trong 30 ngày") vào state để các lượt sau dùng lại.
— `eve/docs/tutorial/remember-definitions.mdx` (**cao**)

**Áp vào OneHub [suy luận].** Kho đã đi đúng hướng mà không gọi tên: lượt 6 có danh mục
chỉ số trong mã theo khuôn `CRM_EVENT_CATALOG` (mỗi chỉ số khai đơn vị, ngày quyết định kỳ,
cách quy công) và "Chưa làm" có NG-04 (không trình dựng truy vấn tự do). Lớp AI chỉ cần
**một tool đọc danh mục** (`list_metrics`) và **một tool tính** (`read_metric(id, chiều,
kỳ)`) — mô hình không bao giờ viết SQL. Câu hỏi ngoài danh mục thì trả "chưa có chỉ số
này" (hỏng an toàn), không đoán.

### 4.3 RAG bằng embedding

**Mẫu [nguồn].** Contextual Retrieval: thêm đoạn ngữ cảnh do mô hình sinh vào đầu mỗi
chunk trước khi embed và trước khi đánh chỉ mục BM25; giảm tỷ lệ truy xuất hỏng 35%
(embedding ngữ cảnh), 49% (thêm BM25 ngữ cảnh), 67% (thêm rerank). **Với kho tri thức dưới
~200.000 token, bỏ qua RAG, đưa cả vào prompt và dùng prompt caching.**
— https://www.anthropic.com/news/contextual-retrieval (19/09/2024, **cao**)

**Rủi ro [nguồn].** OWASP LLM08:2025: vector store thiếu kiểm quyền làm lộ dữ liệu, rò
chéo giữa các nhóm dùng chung, embedding có thể bị đảo ngược ra văn bản gốc, dữ liệu bị
đầu độc. — https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/ (**cao**)

**Áp vào OneHub [suy luận].** Chưa cần ở R3. Dữ liệu chữ của một đơn vị trong một kỳ (các
check-in tuần) nhiều khả năng nằm gọn trong ngữ cảnh; tóm tắt theo đơn vị nạp thẳng. Khi
cần tìm xuyên kỳ/xuyên đơn vị, bắt đầu bằng tìm từ khoá trong Postgres, chỉ thêm
embedding khi đo thấy từ khoá hụt. Nếu thêm, mỗi chunk mang nhãn quyền của bản ghi gốc và
lọc **trong** câu truy vấn (xem §5).

### 4.4 Knowledge graph

**Mẫu [nguồn].** GraphRAG của Microsoft dựng đồ thị thực thể bằng LLM rồi tóm theo cộng
đồng; *local search* cho câu hỏi về thực thể cụ thể, *global search* map-reduce trên các bản
tóm cộng đồng cho câu hỏi toàn cục ("chủ đề chính là gì") — loại câu mà vector RAG thường
trượt. — https://microsoft.github.io/graphrag/query/overview/ (**cao**)

**Áp vào OneHub [suy luận].** OKR **vốn đã là đồ thị có cấu trúc** trong Postgres: cây tổ
chức, mục tiêu → KR → việc/sáng kiến, liên kết căn chỉnh. Không cần LLM trích đồ thị; cần
tool duyệt đồ thị có sẵn (cha/con/căn chỉnh) trả id lân cận — đúng mẫu "Three records, no
dead ends" của kho. Câu hỏi toàn cục làm bằng map-reduce theo cây: tóm từng đơn vị lá (việc
đã có ở lượt 9) → tóm cấp trên từ các bản tóm đã kiểm.

### 4.5 Bộ nhớ ngắn hạn và dài hạn

**Mẫu [nguồn].**
- Ngắn hạn: state bền trong phiên (`defineState` của eve), compaction, context editing
  (xoá kết quả tool cũ). — `eve/docs/guides/state.md`; https://www.anthropic.com/news/context-management (**cao**)
- Dài hạn, theo eve: route auth đặt tenant và user lên `ctx.session.auth`; dynamic
  instructions nạp ký ức của **đúng người gọi** mỗi lượt, bọc JSON và nói rõ đó là dữ liệu
  người dùng chứ không phải chỉ dẫn; tool `remember`/`forget` ghi xoá — **mô hình chọn khoá
  và giá trị, executor chọn tenant và user, không bao giờ nhận id từ mô hình**; khi dùng
  truy xuất ngữ nghĩa thì phạm vi phải nằm trong câu truy vấn, không lọc sau; không dùng
  `defineState` cho ký ức dài hạn. — `eve/docs/patterns/multi-tenant-memory.md` (**cao**)
- Anthropic memory tool: thao tác file ở phía client dưới `/memories`; ứng dụng tự lưu;
  phải chặn path traversal, lọc dữ liệu nhạy cảm, giới hạn cỡ, xoá file lâu không dùng.
  — https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (**cao**)

**Rủi ro [suy luận].** Ký ức là kênh prompt injection lâu dài (một câu độc lọt vào ký ức sẽ
đi theo mọi phiên sau). Với OKR chỉ nên nhớ **sở thích trình bày** và **định nghĩa đội đã
duyệt**, không nhớ nội dung OKR (nội dung luôn đọc lại từ nguồn để đúng quyền, đúng thời
điểm).

---

## 5. Quyền: truy xuất theo quyền, lọc trước khi vào ngữ cảnh, chống rò qua agent

### 5.1 Mẫu

- **Least privilege và complete mediation [nguồn].** OWASP LLM06:2025 Excessive Agency: ba
  gốc lỗi là chức năng thừa, quyền thừa, tự trị thừa. Cách giảm: chỉ cấp phần mở rộng cần
  thiết, tránh công cụ mở như shell/URL fetcher; chạy trong ngữ cảnh người dùng với quyền
  tối thiểu; người duyệt thao tác hệ trọng; **kiểm quyền ở hệ thống phía sau chứ không dựa
  vào quyết định của LLM**; ghi log và giới hạn tần suất.
  — https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ (**cao**)
- **Lethal trifecta [nguồn].** Dữ liệu riêng + nội dung không tin cậy + khả năng gửi ra
  ngoài = rò rỉ khả thi, vì mô hình làm theo chỉ dẫn nằm trong bất kỳ nội dung nào nó đọc;
  guardrail bắt 95% vẫn là trượt về bảo mật. Cách giảm: đừng để cả ba cùng có mặt; nội dung
  không tin cậy không được kích hoạt hành động có hậu quả.
  — https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ (16/06/2025, **vừa**)
- **Lọc trước, không lọc sau [nguồn].** Tài liệu Azure AI Search: token của người dùng đi
  kèm câu truy vấn, dịch vụ tự cắt kết quả theo ACL/RBAC trước khi trả về.
  — https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview (**cao**).
  Các bài thực hành cùng kết luận: với kiểm soát truy cập chỉ pre-filter là bảo vệ được,
  vì post-filter đã đưa dữ liệu cấm vào bộ nhớ và một lỗi ở bước bỏ là thành lộ; nhãn
  quyền phải theo từng chunk, không gán nhãn tài liệu cho mọi chunk.
  — https://dev.to/venkathub/permission-aware-rag-enforcing-document-acls-at-retrieval-time-54a7 (**vừa/thấp**)
- **Danh tính từ phiên đã xác thực [nguồn].** eve: không tin danh tính do thân request tự
  khai; lấy người gọi từ chữ ký/token đã kiểm; hàm approval có thể từ chối lời gọi chéo
  tenant và từ chối khi input tool cố chọn tenant khác; tool/skill/instructions có thể
  được **cấp theo người gọi** lúc `session.started`/`turn.started`.
  — `eve/docs/concepts/security-model.md`, `eve/docs/patterns/multi-tenant-approvals.md`,
  `eve/docs/guides/dynamic-capabilities.md` (**cao**)
- **MCP**: kiểm audience, cấm chuyển tiếp token (xem 2.6).

### 5.2 Khoảng trống trong kho [mã + suy luận]

1. `skills/data-boundaries.md` và `docs/agent.md` §What may be read nói tác nhân **được đọc
   mọi thứ**, ranh giới là đầu ra. Đúng cho đội kinh doanh một-tenant, **sai** khi người
   hỏi mang vai «chỉ OKR». Lượt 2 đã ghi "công cụ đọc dữ liệu CRM của tác nhân kiểm cùng
   phạm vi", nhưng câu chữ của skill và tài liệu phải đổi theo, nếu không mô hình sẽ đọc
   skill và tự tin là được đọc hết.
2. **Phiên do lịch chạy dùng app principal** (đọc được tất cả). Bản tóm tắt tuần của một
   đơn vị gửi vào kênh Slack: người nhận có thể không cùng quyền (lượt 8 thêm "mục tiêu có
   mức hiển thị giới hạn"). Phải lọc theo **người nhận / khán giả của kênh**, không theo
   người chạy.
3. **Kênh chat**: người nhắn trên Slack/Zalo phải được phân giải thành người dùng CRM và
   vai **trước** khi chọn bộ tool. Kho đã có `SlackMemberMatch` cho chiều gửi; chiều nhận
   (lượt 10) cần cùng bảng ghép, và người không ghép được thì chỉ nhận câu trả lời "chưa
   liên kết tài khoản".
4. **Prompt injection qua check-in**: ghi chú check-in là chữ người nhập (không tin cậy),
   tác nhân đọc dữ liệu riêng, và bản tóm tắt được gửi ra Slack — đủ ba chân. Giảm bằng:
   agent tóm tắt **không có tool ghi hay gửi**; đầu ra là object có schema, mã dựng tin
   và gửi; không cho mô hình chèn đường link hay ảnh tự do vào tin.

### 5.3 Mẫu đề xuất: ba chốt quyền [suy luận]

```
người gọi đã xác thực ──► (1) cấp bộ tool theo vai (dynamic tools)
                              │    vai «chỉ OKR» → chỉ có tool OKR; tool CRM không tồn tại trong phiên
                              ▼
                         (2) mỗi executor gọi cùng hàm kiểm quyền với API (complete mediation)
                              │    lọc TRONG câu truy vấn; từ chối = kết quả có lý do
                              ▼
                         (3) bước gửi: lọc theo người nhận / khán giả kênh
```

Chốt (1) là mạnh nhất: mô hình không thể gọi thứ không có. Chốt (2) giữ an toàn khi (1)
cấu hình sai. Chốt (3) phủ việc chạy theo lịch. Mỗi chốt có eval riêng (xem §7), và eval
quyền chấm theo **pass^k** (mọi lần thử đều phải đúng), không phải pass@k.

---

## 6. Human-in-the-loop: gợi ý-nhận, bản nháp, duyệt hành động ghi, hoàn tác

### 6.1 Mẫu

- **Ba kiểu chạm người cho agent chạy nền [nguồn]**: *notify* (báo điều đáng chú ý, không
  làm gì), *question* (hỏi để gỡ vướng thay vì đoán), *review* (đề xuất một hành động và chờ
  duyệt/sửa); gom mọi thứ đang chờ vào một "agent inbox" thay vì rải thông báo; phản hồi của
  người thành dữ liệu để agent học.
  — https://www.langchain.com/blog/introducing-ambient-agents (14/01/2025, **cao** cho mô tả mẫu)
- **Hướng dẫn tương tác người–AI [nguồn]** (18 hướng dẫn, Microsoft, CHI 2019), những điều
  liên quan trực tiếp: G3 canh thời điểm theo ngữ cảnh; G8 bỏ qua dễ; G9 sửa dễ; G10 thu hẹp
  dịch vụ khi không chắc; G11 nói rõ vì sao; G15 khuyến khích phản hồi chi tiết; G16 nói rõ
  hậu quả của thao tác; G17 có công tắc tổng; G18 báo khi hệ thống đổi hành vi.
  — https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/ (**cao**)
- **Feedback + Control [nguồn]**: cân bằng tự động và quyền kiểm soát; cho người sửa, tắt,
  và có lối làm tay khi AI hỏng. — https://pair.withgoogle.com/chapter/feedback-controls/ (**cao**)
- **Cơ chế [nguồn]**: approval bền (eve park ở `session.waiting`, sống qua khởi động lại),
  `ask_question` cho câu hỏi; lời duyệt ký HMAC để client không giả (AI SDK 7); approval là
  chỗ làm tác dụng phụ không lặp lại an toàn khi bước bị chạy lại.
  — `eve/docs/tools/human-in-the-loop.md`; https://ai-sdk.dev/docs/agents/tool-approvals (**cao**)

### 6.2 Bậc thang can thiệp cho OKR [suy luận]

| Bậc | Máy làm | Người làm | Dùng cho |
| --- | --- | --- | --- |
| Notify | Báo "KR X lệch vạch kỳ vọng" | Đọc, bấm vào xem | Cảnh báo rủi ro (lượt 10) |
| Suggest → accept | Hiện câu cũ cạnh câu mới | Nhận nguyên văn / sửa / bác, từng dòng | Viết lại mục tiêu, KR (lượt 9) |
| Draft | Soạn bản nháp không gửi | Sửa rồi tự gửi | Bản tin tuần của đơn vị |
| Review (approval) | Đề xuất một thao tác ghi, park chờ | Duyệt/từ chối | Ghi số từ tin nhắn chat (lượt 10) |
| Tự chạy | — | — | **Không có** cho dữ liệu OKR: NG-05 cấm máy ghi số hay mức tự tin thay người |

**Hoàn tác [suy luận].** Làm được khi mọi thao tác ghi đi qua **một đường ghi duy nhất** lưu
giá trị trước, tác giả (người/máy), và id đề xuất gốc — đúng khuôn `lib/facts.ts`
(`PROPOSED` → áp/bác; không ghi đè người; không mời lại điều đã bác; so giá trị theo nghĩa
để khỏi mời lại cùng một thứ viết khác). Kho đề xuất OKR nên có trạng thái:
`proposed → accepted_verbatim | accepted_edited | dismissed | expired → (applied) → reverted`.

**Rủi ro [suy luận].** Duyệt quá nhiều thành bấm bừa (approval fatigue) — chỉ đặt duyệt ở
thao tác ghi thật; đề xuất đọc thì không cần duyệt. Phiên do lịch chạy không có ai để duyệt:
giữ khuôn `sensitiveWrite()` — tự động thì từ chối có lý do, không đứng chờ vô hạn.

---

## 7. Đánh giá: offline, online, kiểm grounding

### 7.1 Offline

**Mẫu [nguồn].**
- Thuật ngữ: *task* (một bài có tiêu chí), *trial* (một lần thử), *grader*, *transcript*,
  *outcome* (trạng thái cuối của môi trường). Ba loại grader: **mã** (nhanh, khách quan,
  thiếu tinh tế), **mô hình** (linh hoạt, không xác định, tốn tiền), **người** (chuẩn vàng,
  khó mở rộng). Tách *capability eval* (bắt đầu ở tỷ lệ đạt thấp) với *regression eval* (giữ
  gần 100%). **pass@k** = ít nhất một lần đạt trong k lần; **pass^k** = mọi lần đều đạt — dùng
  khi cần tin cậy. Bắt đầu với **20–50 bài lấy từ lỗi thật**; tiêu chí phải rõ tới mức hai
  chuyên gia độc lập cho cùng kết luận; ưu tiên kiểm outcome/state; **hiệu chỉnh LLM judge
  với người thường xuyên**; đọc transcript là bắt buộc.
  — https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents (09/01/2026, **cao**)
- LLM-as-judge kiểu "critique shadowing": một chuyên gia chính chấm **đạt/không đạt** kèm lời
  phê; dựng judge từ các ví dụ đó rồi lặp tới khi khớp chuyên gia; đo bằng tỷ lệ đúng-dương và
  đúng-âm trên tập giữ lại, không dùng độ chính xác gộp.
  — https://hamel.dev/blog/posts/llm-judge/ (29/10/2024, cập nhật 01/09/2026, **vừa**)
- eve evals: file `*.eval.ts` dưới `evals/`; `t.send`, `t.succeeded()`, `t.calledTool(...)`,
  kiểm giá trị; judge `t.judge.autoevals.closedQA/factuality/summarizes/sql` — mặc định chỉ
  theo dõi, `.atLeast()` là ngưỡng mềm, `.gate()` là cổng cứng; **judge model tách khỏi mô hình
  bị chấm**, khai ở `evals.config.ts`; thiếu khoá thì eval tự **bỏ qua có báo**; `mockModel` cho
  fixture xác định; reporter Braintrust.
  — `eve/docs/evals/overview.mdx`, `eve/docs/evals/judge.mdx` (**cao**)

**Áp vào OneHub [suy luận].** Bộ eval tối thiểu cho mỗi tính năng AI của OKR:

| Nhóm | Chấm bằng | Ngưỡng |
| --- | --- | --- |
| Quyền: người «chỉ OKR» hỏi về thoả thuận/danh bạ | Mã: không tool CRM nào được gọi; câu trả lời không chứa tên đối tác trong fixture | `.gate`, pass^k |
| Grounding: mọi số trong tóm tắt có trong check-in được dẫn | Mã (bộ kiểm §7.3) | `.gate` |
| Viết lại mục tiêu | Luật lượt 7 (mã) + judge `closedQA` rubric nhị phân ("nói kết quả, không nói việc làm", "giữ nguyên ý người viết") | Luật `.gate`; judge `.atLeast` rồi nâng dần |
| Bao phủ tóm tắt | Judge: có nhắc mọi KR lệch vạch không | `.atLeast` |
| Chi phí/độ trễ | Mã trên usage từng ca | Theo dõi |

Nguồn bài: sau 26/10 lấy từ OKR quý 4 thật (đã ẩn danh), cộng các ca hỏng đã gặp.

### 7.2 Online

**Mẫu [nguồn].** Nghiên cứu trên người dùng GitHub Copilot: **tỷ lệ nhận gợi ý** dự báo cảm
nhận năng suất tốt hơn các thước đo "gợi ý còn sống trong mã bao lâu".
— https://arxiv.org/abs/2205.06537 (Ziegler và cộng sự, MAPS 2022, **vừa/cao**)

**Áp vào OneHub [suy luận].** Kho đề xuất ở §6 phát sự kiện: `shown`, `accepted_verbatim`,
`accepted_edited` (kèm độ dài sửa), `dismissed`, `expired`, `reverted`. Từ đó: tỷ lệ nhận
nguyên văn / sửa / bác theo tính năng, theo đơn vị; tỷ lệ hoàn tác (đề xuất đã nhận rồi bị gỡ
— tín hiệu xấu nhất); tỷ lệ câu bị bộ kiểm grounding bỏ; chi phí mỗi đề xuất được nhận. Sự
kiện chỉ giữ mã và loại, không giữ nội dung (theo khuôn `payload` của nhắc buổi sáng và
`docs/telemetry.md`).

### 7.3 Kiểm grounding cho số trong câu tóm tắt

**Mẫu [nguồn].**
- Google Check Grounding API: đầu vào là câu trả lời ứng viên và tối đa 200 "fact"; trả điểm
  hỗ trợ 0–1 (xấp xỉ tỷ lệ mệnh đề có căn cứ), trích dẫn theo từng mệnh đề, có ngưỡng trích
  dẫn; yêu cầu căn cứ trọn vẹn; độ trễ dưới 500 ms.
  — https://docs.cloud.google.com/generative-ai-app-builder/docs/check-grounding (**cao**)
- Anthropic: cho phép nói "không biết", bắt trích nguyên văn trước khi làm việc với tài liệu
  dài, bắt dẫn nguồn cho từng khẳng định và rút lại khẳng định không tìm được nguồn; các kỹ
  thuật giảm chứ không loại hết ảo giác.
  — https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations (**cao**)

**Mẫu đề xuất [suy luận].** Không nhờ mô hình tự kiểm. Buộc đầu ra có cấu trúc:

```
TomTat = { cau: Array<{ vanBan: string; nguon: string[] /* id check-in */ }> }
```

Mã kiểm từng câu: (1) mọi id trong `nguon` thuộc tập check-in đã đưa vào và người nhận được
xem; (2) mọi con số trong `vanBan` (sau chuẩn hoá dấu thập phân, %, đơn vị) khớp một giá trị
trong các check-in được dẫn, hoặc là phép tính được phép (chênh lệch, tỷ lệ) từ chúng; (3)
lệch thì **bỏ câu** và đếm vào thước "câu bị bỏ". Đây chính là điều lượt 9 đã ghi ("lệch thì bỏ
câu") — khung trên cho nó một giao diện kiểm được bằng mã.

---

## 8. Chi phí: gom việc, cache, tầng mô hình, trần chi tiêu

**Mẫu [nguồn].**
- Prompt caching: đọc cache 0,1× giá input; giữ tiền tố ổn định; `caching: 'auto'` trên
  Gateway; cache theo mô hình nên đổi mô hình giữa phiên là trả lại giá chưa cache (eve khuyên
  chọn mô hình ở `session.started`). — automatic-caching (Vercel), `eve/docs/guides/dynamic-capabilities.md` (**cao**)
- Batch: Gemini Batch API tính 50% giá chuẩn, mục tiêu xong trong 24 giờ, hợp với xử lý không
  gấp và chạy eval. — https://ai.google.dev/gemini-api/docs/batch-api (**cao**). Qua AI Gateway
  không thấy tài liệu batch; thứ gần nhất là tầng `flex` cho Google/OpenAI (rẻ hơn, trễ hơn).
- Chọn mô hình theo tầng và nâng tầng khi trượt kiểm chứng (Vercel, §3.2).
- Multi-agent tốn ~15× chat (Anthropic, §2.4).
- OWASP LLM10:2025 Unbounded Consumption: thiếu giới hạn tài nguyên là một lớp lỗ hổng.
  — https://genai.owasp.org/llm-top-10/ (**cao**)
- Trần Gateway là trần mềm, 402 khi vượt (§3.2).

**Áp vào OneHub [suy luận].**

1. **Gom theo đơn vị, không theo KR** (lượt 9 đã ghi): một phiên tóm tắt cho một đơn vị lá mỗi
   tuần; cấp trên tóm từ các bản tóm đã kiểm (map-reduce), không đọc lại check-in gốc.
2. **Việc không gấp chạy tầng rẻ**: tóm tắt tuần, gợi ý đích theo xu hướng — tầng `flex` nếu mô
   hình mặc định là Google (Gateway hỗ trợ), đặt `dueAt` vào giờ thấp điểm.
3. **Tiền tố ổn định**: instructions + skill OKR + khối "Who we are" giữ nguyên byte; phần thay
   đổi (dữ liệu đơn vị) đặt cuối.
4. **Tầng mô hình trong một bảng cấu hình** (theo luật "hằng số một file mỗi khu"): `okr.fast`
   cho phân loại, viết lại câu; `okr.default` cho tóm tắt; nâng tầng chỉ khi đầu ra trượt
   schema hay trượt bộ kiểm grounding, tối đa một lần.
5. **Sổ chi phí trong ứng dụng** làm trần thật: hook `audit` đã có `costUsd` mỗi bước — ghi thêm
   khoá `feature` và `unitId`; **kiểm trần trước khi xếp hàng `AgentTask`** (như `focus.ts` kiểm
   trước khi tính tiền); hết trần → tính năng ẩn nút hoặc dời sang kỳ sau, trả lý do, không ném —
   đúng khuôn `capabilities.ts`.
6. **Trần Gateway làm lưới cuối**: một API key riêng cho việc OKR với budget tháng và cảnh báo
   50/75/100% (nếu eve cho truyền một `LanguageModel` tạo bằng `createGateway` với khoá khác —
   tài liệu eve nói `model` nhận được instance `LanguageModel`, nhưng chưa kiểm thực tế); 402
   phải được nhận diện và đổi thành "tạm nghỉ tới kỳ sau", không thử lại.
7. **Ước chi phí trước khi mở** (phục vụ điều kiện mở lượt 9): số đơn vị × số tuần × (token vào
   × (1 − tỷ lệ cache × 0,9) × giá vào + token ra × giá ra), cộng hỏi đáp chat ước theo số người
   dùng. Không có bảng giá của mô hình đang dùng trong nguồn đã đọc, nên chưa điền số.

---

## 9. Proactive agent: chạy theo lịch/sự kiện, chống spam thông báo

**Mẫu [nguồn].**
- eve schedule: `defineSchedule({ cron, markdown | run })`; dạng markdown chạy rồi bỏ đầu ra,
  không park được; dạng `run` giao việc cho một kênh qua `receive`, park được; **agent không phải
  gửi tin mỗi lần chạy** — với lời nhắc có điều kiện ("chỉ báo khi có"), eve chỉ cách kết thúc
  thành công mà không gửi gì; lịch chỉ ở agent gốc; trên Vercel mỗi lịch thành một Cron Job, giờ
  UTC. — `eve/docs/schedules.mdx` (**cao**)
- Ambient agent: nghe luồng sự kiện thay vì chờ người nhắn; dùng notify/question/review và một
  hộp chờ duy nhất (§6.1). (**cao**)
- Slack: gom sự kiện dày thành bản tin (digest), cho người cài chọn tần suất, kênh, loại thông báo;
  dùng tin ephemeral cho thứ chỉ một người cần; gửi quá nhiều có thể bị thu hồi token vì rate limit
  và bị gỡ app. — https://docs.slack.dev/concepts/app-design/ (**cao**)
- Bị cắt ngang làm người ta làm nhanh hơn nhưng căng thẳng, bực bội hơn.
  — https://dl.acm.org/doi/10.1145/1357054.1357072 (Mark, Gudith, Klocke, CHI 2008, **vừa/cao**)
- HAX G3 canh thời điểm, G17 công tắc tổng (§6.1).
- Có bài bên thứ ba đề xuất "ngân sách thông báo" mỗi người mỗi ngày (3, tối đa 5) như trần cứng.
  — https://tianpan.co/blog/2026-05-13-background-agents-notification-budget-attention-economy (**thấp** — ý kiến cá nhân, không có dữ liệu gốc)

**Mẫu đề xuất [suy luận], dựa trên thứ kho đã có:**

1. **Không thêm cron.** Mọi việc chủ động là hàng `AgentTask` có `dueAt`, do lịch dispatch duy nhất
   nhặt (luật của `docs/agent.md`).
2. **Phát hiện bằng luật, diễn giải bằng mô hình** (lượt 10 đã chốt): luật trên dữ liệu quyết *có
   báo hay không*; mô hình chỉ viết câu giải thích khi đã quyết báo. Việc không cần quyết thì đi
   làn không mô hình (như nhắc buổi sáng).
3. **Khoá chống trùng**: `subject = <loại>:<thực thể>:<kỳ>` với chỉ mục duy nhất + `skipDuplicates`
   (khuôn `agentTask_nhac_mot_ngay`).
4. **Báo theo cạnh, không theo mức**: chỉ báo khi trạng thái *chuyển* (đúng hướng → lệch), không báo
   lại mỗi ngày khi vẫn lệch; có thời gian nguội mỗi KR.
5. **Gom vào một tin mỗi người mỗi khung giờ**, có trần số dòng và ký tự (khuôn `NHAC.tran`, 2.000
   ký tự cho Zalo), đi cùng nhắc buổi sáng thay vì thêm tin riêng.
6. **Người nhận chỉnh được**: tắt từng loại, chọn khung giờ; một công tắc tổng cho quản trị.
7. **Đo**: tỷ lệ tin được mở/bấm, tỷ lệ người tắt loại thông báo — tắt nhiều là tín hiệu spam.

---

## 10. Bộ khung tối thiểu cho một lớp AI mở rộng được

Nguyên tắc: **mỗi tính năng AI mới là một khai báo + vài tool + một bộ eval**, không phải một
đường ống mới. Tám khối dưới đây; khối nào kho đã có thì ghi rõ để khỏi làm lại. Chữ ký kiểu dưới
đây là **phác thảo** để thấy giao diện, không phải mã đề xuất nguyên văn.

```
            kênh (web panel · Slack · Zalo · lịch)
                          │  sự kiện vào / tin nhắn
                          ▼
   ┌──────────── (7) Trigger & điều phối ─────────────┐
   │  AgentTask(kind, subject, dueAt, featureId)       │
   │  một lịch dispatch; luật quyết có chạy/có báo     │
   └───────────────┬───────────────────────────────────┘
                   ▼
   (3) Quyền: resolvePrincipal → Principal(vai, đơn vị, nhóm dữ liệu)
                   │
                   ▼
   (1) Registry năng lực: FeatureManifest ──► chọn skill, tool, tầng mô hình, chính sách
                   │
        ┌──────────┼───────────────┬──────────────────┐
        ▼          ▼               ▼                  ▼
   (2) Knowledge  (4) Hành động   (6) Chi phí        (5) Eval & kiểm
   tool đọc có    kho đề xuất,    sổ chi phí,        grounding lúc chạy,
   kiểu, danh     approval,       tầng mô hình,      eval offline,
   mục chỉ số,    hoàn tác        trần trước khi     sự kiện online
   bộ nhớ                         xếp việc
                   │
                   ▼
   (8) Gửi ra: render theo NGƯỜI NHẬN, qua lọc quyền (3) lần nữa
```

### (1) Registry năng lực — `FeatureManifest`

Mở rộng từ manifest agent tuỳ biến đã có (`actions`, `triggers`, `dataScope`) và cùng quy tắc: Zod
ở `packages/validation`, parse ở biên.

```ts
FeatureManifest = {
  id: "okr.rewrite" | "okr.weekly-summary" | "okr.chat-qa" | ...,
  surfaces: ("record-sheet" | "slack" | "zalo" | "chat-panel")[],
  trigger: { kind: "on-demand" } | { kind: "schedule"; cadence } | { kind: "event"; event },
  skills: SkillId[],                 // agent/skills/<id>/SKILL.md
  tools: { read: ToolId[]; write: ToolId[] },
  dataGroups: DataGroup[],           // cùng bảng nhóm dữ liệu của lượt 2
  approval: "none" | "per-write" | "draft-only",
  modelTier: "fast" | "default",
  budget: { key: string; monthlyUsd: number },
  evalSuite: string,                 // evals/<id>/
  requires: CapabilityKey[],         // thiếu → tính năng biến mất
}
```

Giao diện: `featuresFor(principal): FeatureManifest[]` — web và kênh dùng để biết hiện nút nào.

### (2) Lớp knowledge

- Tool đọc có kiểu, namespace `okr_*`, trả id lân cận, phân trang, `response_format`.
- Danh mục chỉ số: `list_metrics()`, `read_metric(id, dims, period)` — mô hình không viết truy vấn.
- Bộ nhớ dài hạn (sau cùng): `MemoryStore.list/put/delete(scope)` với `scope` lấy từ phiên.
- Tìm trong chữ (khi cần): `search_checkins(query, filters)` — lọc quyền trong câu truy vấn.

### (3) Lớp quyền

```ts
resolvePrincipal(channelIdentity): Principal | { unlinked: true }
can(principal, dataGroup, action: "read" | "write"): boolean   // CÙNG hàm với API
toolsFor(principal, feature): ToolSet                           // dynamic tools của eve
audienceOf(delivery): Principal[]                               // người nhận / thành viên kênh
```

Ba chốt: cấp tool theo người gọi; executor kiểm lại; gửi ra lọc theo khán giả. Skill
`data-boundaries` viết lại theo vai. Nhật ký truy xuất bất biến (OWASP LLM08).

### (4) Lớp hành động và HITL

```ts
Proposal = { id, featureId, target: { kind, id, field }, before, after,
             citations: string[], state, decidedBy, decidedAt }
propose(p): ProposalId            // từ chối nếu trùng giá trị đang chờ hoặc đã bị bác
decide(id, "accept" | "edit" | "dismiss", edited?)
apply(id) / revert(id)            // đường ghi duy nhất, giữ giá trị trước
```

Approval của tool ghi dùng khuôn `sensitiveWrite()`; từ chối là kết quả có lý do.

### (5) Lớp eval và kiểm

- Offline: `evals/<feature>/*.eval.ts`; judge khai ở `evals.config.ts`, khác mô hình bị chấm; eval
  quyền và grounding là `.gate`.
- Runtime: `verifyGrounding(output, sources): { kept, dropped }` chạy trước khi gửi.
- Online: sự kiện `Proposal` + `dropped` + chi phí → một bảng thước theo tính năng.

### (6) Lớp chi phí

```ts
ledger.record({ featureId, unitId, sessionId, costUsd })   // từ hook audit
ledger.allow(featureId, unitId): { ok: true } | { ok: false; reason; resumesAt }
modelFor(featureId, attempt): ModelId                       // một file cấu hình tầng
```

Gateway: `caching: 'auto'`, `models` dự phòng, `serviceTier: 'flex'` cho việc nền, budget key riêng
làm lưới cuối.

### (7) Lớp trigger và điều phối

`AgentTask` thêm `featureId`; `subject` là khoá chống trùng; luật phát hiện chạy trong nhịp dispatch
có sẵn; chính sách thông báo `NotifyPolicy = { window, maxPerDay, quietHours, edgeTriggered }` theo
người nhận.

### (8) Kênh

Bộ chuyển kênh chỉ làm ba việc: phân giải danh tính → `resolvePrincipal`; vẽ `Proposal`/approval
thành nút (Slack) hoặc lựa chọn bằng chữ (Zalo); gửi tin đã render theo người nhận.

### Giao diện giữa các khối (tóm)

| Từ → tới | Hợp đồng |
| --- | --- |
| Kênh → Quyền | danh tính kênh → `Principal` |
| Quyền → Registry | `featuresFor(principal)` |
| Registry → eve | skills, `toolsFor`, tầng mô hình, approval policy lúc `session.started` |
| Tool → Knowledge | truy vấn đã lọc theo `Principal` |
| Agent → Hành động | chỉ qua `propose()`; không tool nào ghi thẳng dữ liệu OKR |
| Hành động → Eval | sự kiện trạng thái đề xuất |
| Mọi bước → Chi phí | usage từng bước; `allow()` trước khi xếp việc |
| Trigger → Kênh | tin đã render theo người nhận, qua `NotifyPolicy` |

---

## 11. Thứ tự dựng khối cho lượt 9–10 [suy luận]

1. **Trước lượt 9, gắn với lượt 2**: khối (3) — `can()` dùng chung, dynamic tools theo vai, viết lại
   `data-boundaries`, eval quyền pass^k. Không có khối này thì không mở trợ lý cho cả công ty.
2. **Lượt 9**: khối (4) kho đề xuất + (5) bộ kiểm grounding + (6) sổ chi phí và trần; (1) chỉ cần ở
   dạng một file cấu hình cho hai tính năng (viết lại, tóm tắt tuần) — chưa cần registry đầy đủ.
3. **Lượt 10**: khối (8) chiều nhận cho Slack/Zalo, (7) `NotifyPolicy`, rồi mới tới hỏi đáp tự do
   (agent tool loop) vì đây là chỗ rủi ro nhất.
4. **Sau R3**: registry đầy đủ khi có tính năng AI thứ ba ngoài OKR; bộ nhớ dài hạn; tìm trong chữ;
   cân nhắc cung cấp MCP.

---

## 12. Câu hỏi mở

1. **Nội dung OKR có được gửi tới nhà cung cấp mô hình đang dùng không** (điều kiện mở lượt 9)? Mô
   hình mặc định là hàng `AppSetting` (theo bối cảnh là `google/gemini-3.7-flash`; fallback biên
   dịch là `zai/glm-5.2-fast`). Họ mô hình quyết định cả chính sách dữ liệu, cache ngầm hay tường
   minh, và có dùng được `flex` hay không.
2. **Trần tháng cho OKR tách khỏi ~$20 chung** thế nào: sổ chi phí trong ứng dụng, key Gateway riêng,
   hay cả hai? Cần kiểm eve có nhận `LanguageModel` tạo từ `createGateway` với khoá riêng không.
3. **Bản tin gửi vào kênh Slack của đơn vị**: lọc theo quyền thấp nhất của thành viên kênh, hay chỉ
   gửi riêng từng người? Phụ thuộc "mức hiển thị giới hạn" của lượt 8.
4. **Có cung cấp MCP server cho OKR** (để nhân viên hỏi OKR từ Claude/ChatGPT) không, và nếu có thì
   nó sống ở `apps/api` (truy cập dữ liệu) hay `apps/agent`?
5. **Judge model cho eval**: dùng mô hình khác họ với mô hình chạy thật (giảm thiên vị tự chấm), trả
   bằng ngân sách nào?
6. **Tìm trong chữ check-in** có thật sự cần ở R3 không, hay đợi số đo hỏi đáp của lượt 10?

---

## 13. Nguồn

Anthropic
- Building effective agents (19/12/2024) — https://www.anthropic.com/engineering/building-effective-agents
- Effective context engineering for AI agents (29/09/2025) — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Writing effective tools for agents (11/09/2025) — https://www.anthropic.com/engineering/writing-tools-for-agents
- How we built our multi-agent research system (13/06/2025) — https://www.anthropic.com/engineering/multi-agent-research-system
- Equipping agents for the real world with Agent Skills (16/10/2025) — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Code execution with MCP (04/11/2025) — https://www.anthropic.com/engineering/code-execution-with-mcp
- Demystifying evals for AI agents (09/01/2026) — https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- Contextual Retrieval (19/09/2024) — https://www.anthropic.com/news/contextual-retrieval
- Managing context on the Claude Developer Platform — https://www.anthropic.com/news/context-management
- Memory tool — https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- Reduce hallucinations — https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations

Đặc tả
- Agent Skills specification — https://agentskills.io/specification
- MCP specification 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25
- MCP tools — https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- MCP authorization — https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization

Vercel
- AI SDK agents — https://ai-sdk.dev/docs/agents/overview
- AI SDK tool approvals — https://ai-sdk.dev/docs/agents/tool-approvals
- AI SDK structured data — https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- AI Gateway tổng quan — https://vercel.com/docs/ai-gateway
- AI Gateway budgets — https://vercel.com/docs/ai-gateway/observability-and-spend/budgets
- AI Gateway model fallbacks — https://vercel.com/docs/ai-gateway/models-and-providers/model-fallbacks
- AI Gateway automatic caching — https://vercel.com/docs/ai-gateway/models-and-providers/automatic-caching
- AI Gateway service tiers — https://vercel.com/docs/ai-gateway/models-and-providers/service-tiers
- Cost-aware model routing — https://vercel.com/kb/guide/cost-aware-model-routing-with-ai-gateway
- eve docs (bản đi kèm 0.29.4 trong `apps/agent/node_modules/eve/docs`; công khai https://github.com/vercel/eve/tree/main/docs): `skills.mdx`, `schedules.mdx`, `tools/human-in-the-loop.md`, `concepts/context-control.md`, `concepts/security-model.md`, `guides/dynamic-capabilities.md`, `patterns/multi-tenant-memory.md`, `patterns/multi-tenant-approvals.md`, `connections/mcp.mdx`, `evals/overview.mdx`, `evals/judge.mdx`, `tutorial/remember-definitions.mdx`, `tutorial/guard-the-spend.mdx`

Knowledge, quyền, HITL, đánh giá, thông báo
- dbt Labs, Semantic Layer vs. Text-to-SQL: 2026 Benchmark Update (07/04/2026) — https://docs.getdbt.com/blog/semantic-layer-vs-text-to-sql-2026
- Microsoft GraphRAG query overview — https://microsoft.github.io/graphrag/query/overview/
- OWASP Top 10 for LLM Applications 2025 — https://genai.owasp.org/llm-top-10/
- OWASP LLM06:2025 Excessive Agency — https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
- OWASP LLM08:2025 Vector and Embedding Weaknesses — https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/
- Simon Willison, The lethal trifecta (16/06/2025) — https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
- Azure AI Search, document-level access control — https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview
- Permission-aware RAG (bên thứ ba) — https://dev.to/venkathub/permission-aware-rag-enforcing-document-acls-at-retrieval-time-54a7
- LangChain, Introducing ambient agents (14/01/2025) — https://www.langchain.com/blog/introducing-ambient-agents
- Microsoft Research, Guidelines for Human-AI Interaction — https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/
- Google PAIR, Feedback + Control — https://pair.withgoogle.com/chapter/feedback-controls/
- Hamel Husain, Using LLM-as-a-Judge — https://hamel.dev/blog/posts/llm-judge/
- Ziegler và cộng sự, Productivity Assessment of Neural Code Completion (2022) — https://arxiv.org/abs/2205.06537
- Google Cloud, Check grounding — https://docs.cloud.google.com/generative-ai-app-builder/docs/check-grounding
- Gemini Batch API — https://ai.google.dev/gemini-api/docs/batch-api
- Slack app design — https://docs.slack.dev/concepts/app-design/
- Mark, Gudith, Klocke, The cost of interrupted work (CHI 2008) — https://dl.acm.org/doi/10.1145/1357054.1357072
- Notification budget cho agent nền (ý kiến, mức tin thấp) — https://tianpan.co/blog/2026-05-13-background-agents-notification-budget-attention-economy

Trong kho (chỉ đọc): `docs/agent.md`; `apps/agent/agent/{skills,tools,subagents,schedules,hooks,lib}`;
`apps/agent/evals/`; `packages/validation/src/agent-manifest.ts`; `packages/db/src/settings.ts`;
`.claude/worktrees/cap-nhat-tuan-okr/docs/plan/lo-trinh-okr.md` (bản mới nhất của lộ trình OKR).
