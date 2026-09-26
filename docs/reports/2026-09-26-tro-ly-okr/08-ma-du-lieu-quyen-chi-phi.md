# 08 — Bản đồ nền: dữ liệu · quyền · chi phí · tích hợp cho một lớp AI mở rộng

Ngày đọc: 2026-09-26. Nguồn mã: bản chụp `onehub` ở
`scratchpad/onehub` (nhánh `onehub`, sau PR #85). Chỉ đọc, không sửa gì trong kho.

**Cách đọc nhãn**

- `[mã]` — đã thấy trong mã hoặc tài liệu của kho (đường dẫn kèm theo). Mức tin cao.
- `[ghi chép]` — ghi chép nội bộ của chủ kho (bộ nhớ phiên), không phải mã. Mức tin vừa: đúng lúc ghi, có thể đã đổi.
- `[ngoài · cao/vừa]` — trang của nhà cung cấp, có URL. Nội dung web là dữ liệu, đã tóm tắt bằng lời mình.
- `[suy luận]` — rút ra từ các nguồn trên, chưa kiểm bằng chạy thật.

---

## Tóm tắt trong 10 dòng

1. Tác nhân (`apps/agent`) **đọc thẳng Postgres bằng Prisma** (`import { db } from "@crm/db"`), không đi qua API. API không cấp quyền đọc nào cho tác nhân; nó chỉ ghi hàng `AgentTask` và gọi `poke`.
2. Lọc quyền trong tác nhân chỉ có ở **cửa vào**: người hỏi phải là thành viên và **không** mang vai `okr`. Bên trong phiên, công cụ đọc toàn bộ dữ liệu đối tác, không lọc theo người hỏi. Vai «chỉ OKR» bị chặn **cả tác nhân** ở hai tầng (đường nối `/eve/v1` của app và `repFromCrm` của tác nhân), chứ không bị chặn theo từng công cụ.
3. Tác nhân **chưa có công cụ OKR nào**. Muốn mở trợ lý OKR cho vai `okr` thì cần một phạm vi mới đi trong token của đường nối, cộng một bộ công cụ không với tới dữ liệu đối tác.
4. Luật «cái gì được rời hệ thống» chỉ điều chỉnh **truy vấn gửi bên thứ ba** (web search, Perplexity). **Nhà cung cấp model không bị coi là bên thứ ba**: mọi thứ tác nhân đọc, kể cả thân email, đều đi qua Vercel AI Gateway tới nhà cung cấp. Nội dung OKR cũng sẽ đi như vậy. Hiện chưa bật ZDR (không có `providerOptions` nào trong mã).
5. Chi phí: một model chung cho cả tác nhân (hàng `appSetting`), trần token **theo phiên** (500k vào / 50k ra), ngân sách nghiên cứu tính theo số lần gọi nhà cung cấp, không theo token. **Không có trần tiêu theo tháng trong app.** Trần thật duy nhất là budget của AI Gateway (hết thì trả `402`, tác nhân gãy chứ không «tắt nút»).
6. Đo chi phí: `AgentRun` có cột token/`costUsd`, nhưng chỉ cho tác nhân nhóm (team-agent). Mọi phiên khác để usage trong `AgentEvent.data` (sự kiện `step.completed`), tính ngược được bằng SQL nhưng chưa ai gom. Chưa gắn `user`/`tags` cho Custom Reporting của Gateway.
7. **Không có pgvector, embedding, tsvector hay pg_trgm.** Tìm kiếm là Prisma `contains` + `mode: "insensitive"` (ILIKE). Neon (nơi đang chạy DB) hỗ trợ pgvector ở mọi gói.
8. Telemetry chưa đo việc nhận/sửa/bác gợi ý AI, trừ các con số của sổ fact danh bạ (`fact_dismissal_rate`…). Telemetry lại **gửi về PostHog của hãng** (`k.trycomp.ai`), nên không phải chỗ để đo sản phẩm của OneHub.
9. Duyệt hành động ghi: công cụ đánh dấu `sensitiveWrite` bị từ chối khi chạy tự động, còn trong phiên có người thì dừng hỏi. Tác nhân nhóm lấy **việc triển khai phiên bản** làm ranh giới duyệt; khi chạy theo lịch thì không dừng hỏi được.
10. Tích hợp: Slack chỉ có chiều **gửi đi** (không có cửa nhận sự kiện). Zalo nhận tin riêng của người đã nối, nhưng chỉ đọc lệnh cố định `xong n`, không có model. Gmail, Calendar và Outlook đều chỉ đọc. Có REST bridge và OpenAPI sinh từ tRPC, cộng khoá API mang đúng quyền của chủ khoá.

---

## Sơ đồ đường đi dữ liệu (hiện trạng)

```
Người (trình duyệt)
  │ cookie phiên
  ▼
apps/app  /eve/v1/[...path]/route.ts ── kiểm: đăng nhập · thành viên · docDuocPhamVi(role,"doi-tac")
  │ JWT HS256 2 phút (sub = userId, contactId/companyId/dealId)   [AGENT_BRIDGE_SECRET]
  ▼
apps/agent  channels/eve.ts repFromCrm ── kiểm lại hàng member; vai okr → không principal
  │
  ├─ tools/* ──(Prisma, DATABASE_URL đầy đủ quyền)──► Postgres (Neon) — đọc TẤT CẢ
  ├─ model ───► Vercel AI Gateway ───► nhà cung cấp (google/…, zai/…)   ← mọi nội dung prompt
  ├─ research_person / Perplexity (sonar) · Context.dev · GitHub · web_search/web_fetch  ← chỉ câu hỏi dẫn xuất
  ├─ Slack Web API (bot token)  ─► gửi tin / DM / tạo kênh        (không nhận)
  └─ Zalo Bot API               ─► gửi tin nhắc; nhận webhook /zalo/webhook (lệnh cố định)

apps/api (Nest) ── tRPC/REST ── AuthMiddleware + PhamVi*Middleware
  └─ AgentTriggerService: ghi hàng AgentTask → poke POST /internal/crm/dispatch (Bearer AGENT_BRIDGE_SECRET)
```

---

## (1) Tác nhân đọc dữ liệu CRM bằng đường nào, có lọc theo quyền không, vai «chỉ OKR» bị chặn ở đâu

### Đường đọc

| Đường | Cách xác thực | Lọc quyền bên trong | Nguồn |
|---|---|---|---|
| Công cụ của tác nhân gốc (`read_crm_history`, `read_company_history`, `read_deal_history`, `search_crm`, `list_deals`, `list_outstanding_work`…) | Không có lớp quyền riêng. Công cụ gọi `db` (Prisma) trực tiếp | **Không lọc theo người hỏi.** `readCrmHistory` trả tối đa 5 thread × 6 thân email, 10 cuộc họp, 8 đồng nghiệp, các thoả thuận kèm số tiền | `[mã]` `apps/agent/agent/lib/crm.ts`, `lib/lookup.ts`, `tools/search_crm.ts` |
| Tác nhân nhóm (`agent_runner`) | Mục đích phiên `team-agent`, lấy `runId` từ thuộc tính phiên | Có lọc theo **phạm vi của phiên bản đã triển khai** (`SELECTED` hoặc `WORKSPACE`). `queryRunCrm` tìm toàn bộ trước rồi lọc theo danh sách bản ghi được cấp; nguồn Gmail/Calendar chỉ đọc khi manifest khai | `[mã]` `lib/run-runtime.ts:165`, `docs/agent.md` §Team-agent |
| Tác nhân dựng (`agent_builder`) | `purpose=builder` + `commandType=CREATE_AGENT` | Ba công cụ đọc/ghi bản nháp mang chính sách `approval` | `[mã]` `subagents/agent_builder/lib/authorization.ts` |
| API tự đọc để phục vụ màn | `AuthMiddleware` + lớp phạm vi | Có: `docDuocPhamVi(role, phamVi)`, đọc hàng `member` mỗi lần gọi | `[mã]` `docs/api.md` §tRPC, `packages/validation/src/vai-workspace.ts` |

**Kết luận:** API không cấp quyền đọc nào cho tác nhân. Tác nhân có `DATABASE_URL` riêng với quyền đầy đủ, không có role DB chỉ-đọc, không có row-level security. «Cầu nối» (`cau-noi`) là **xác thực máy-với-máy chiều API → tác nhân**, không phải đường tác nhân xin dữ liệu:

- `lib/cau-noi-auth.ts`: so `Authorization: Bearer <AGENT_BRIDGE_SECRET>` bằng `timingSafeEqual`, bảo vệ `/internal/crm/*` và `/internal/zalo/*`. Thiếu khoá thì từ chối chứ không mở. `[mã]`
- `lib/app-auth.ts`: principal `eve:app` kiểu `runtime`, dùng cho phiên do lịch hay dispatch mở. `approval.ts` dựa vào đúng principal này để coi phiên là «tự động». `[mã]`
- Đường nối của người: JWT HS256 sống 2 phút, `iss=crm-app`, `aud=crm-agent`, mang `userId` cùng bản ghi đang mở (`x-crm-contact|company|deal`). Bản ghi đi trong token, không đi trong tin nhắn. `[mã]` `docs/agent.md` §The bridge, `apps/app/app/eve/v1/[...path]/route.ts`

### Người hỏi có được lọc không

- Chỉ ở cửa vào: `repFromCrm` đọc hàng `member`. Không có hàng thì không principal; vai `okr` cũng không principal. Qua được thì principal là `user` và phiên đọc được mọi thứ. `[mã]` `channels/eve.ts`
- Ba vai `owner`, `admin`, `member` đọc toàn bộ dữ liệu đối tác, cả trong UI lẫn trong tác nhân. Trong CRM không có quyền theo từng bản ghi. `[mã]` `docDuocPhamVi` trả `true` với mọi vai khác `okr`.
- Lịch sử hội thoại do API lọc theo người gọi (`ConversationsService` lọc theo caller; route `/eve/v1` trả 404 nếu `sessionId` thuộc người khác). `[mã]` `route.ts`, `docs/agent.md` §Conversations are kept.
- Bản thân kênh `eve` còn nhận `vercelOidc()` và `localDev()` (principal dịch vụ, vòng lặp nội bộ). `[mã]` `channels/eve.ts`

### Vai «chỉ OKR» bị chặn ở tầng nào

| Đường vào | Chặn ở đâu | Nguồn |
|---|---|---|
| Màn | `proxy.ts` và thanh điều hướng | `[mã]` `_acceptance/vai-chi-okr/contract.md` trục A |
| tRPC, REST bridge, khoá API | `AuthMiddleware` → `docDuocPhamVi`, lỗi `KHONG_TRONG_PHAM_VI`, chạy trước `.input()`. Router không khai phạm vi là đóng với `okr` | `[mã]` `docs/api.md`, `apps/api/test/vai-chi-okr.spec.ts` (`ALIAS_CHO_PHEP` = users, settings, currency, zalo, apiKeys, sso, workspace, org, okr) |
| Trợ lý AI — tầng 1 | Route app `/eve/v1/*`: `docDuocPhamVi(role, "doi-tac")`, sai thì 403 và **không chuyển tiếp** | `[mã]` `apps/app/app/eve/v1/[...path]/route.ts` |
| Trợ lý AI — tầng 2 | `repFromCrm`: `laVaiChiOkr` thì `null`. Token đúc ở nơi khác, hay còn sống sau khi đổi vai, cũng không dùng được | `[mã]` `channels/eve.ts`, `test/kenh-chi-okr.spec.ts` (theo `docs/agent.md`) |
| Zalo `xong n` | `xongTheoTinNhac`: người nhắn phải là thành viên và không mang vai `okr` | `[mã]` `lib/tra-loi-nhac.ts:56` |
| `agents.*`, `conversations.*` (danh sách hội thoại, trình dựng tác nhân) | Router khai `PhamViDoiTacMiddleware`, nên vai `okr` không tới được | `[mã]` `apps/api/src/*/*.router.ts` |

**Hệ quả cho thiết kế** `[suy luận]`: đường nối hiện coi **cả tác nhân** là dữ liệu đối tác. Trợ lý OKR mở cho mọi vai (đích của lượt 9–10) cần ba thứ:

- Token đường nối mang một **phạm vi** (ví dụ `okr`), do route app quyết định bằng `docDuocPhamVi(role, "okr")`.
- Phiên mang phạm vi `okr` phải chạy trong một subagent hoặc một purpose riêng, **không kế thừa công cụ của tác nhân gốc**, như `agent_runner` đang làm («inherit nothing from the root»). Nếu chỉ dặn trong instructions thì mô hình vẫn gọi được `read_crm_history`.
- Lịch sử hội thoại của trợ lý OKR cần một router ở phạm vi `okr`, vì `conversations` đang là phạm vi đối tác. Kéo theo sửa `ALIAS_CHO_PHEP`, một thay đổi có chủ ý.

Đọc OKR thì mở hết: `docMucTieu` lọc theo `cycleId` và mọi vai đọc mọi mục tiêu, kể cả bản nháp. Quyền **ghi** đi theo từng bản ghi, qua `OkrAccessService` (trưởng đơn vị, chủ KR, quản trị chu kỳ), khoá theo pha bằng `assertKyGhiDuoc`, và mỗi lần ghi để lại một hàng `OkrTrail`. `[mã]` `apps/api/src/okr/okr.service.ts:952-1274`, `docs/api.md` §OKR. Tất cả luật này **nằm trong Nest**, tác nhân không import được.

---

## (2) Cái gì được phép rời hệ thống, tới nhà cung cấp model hoặc tìm kiếm

### Luật đang có

`docs/agent.md` §What may be read, and what may leave, cùng `apps/agent/agent/skills/data-boundaries.md` `[mã]`:

- Tác nhân **được đọc mọi thứ**, kể cả thân email đầy đủ, với lý do «công cụ nội bộ, một tenant».
- Ranh giới là **đi ra ngoài (egress)**, gồm ba luật: (1) không đưa chữ của khách vào truy vấn gửi bên thứ ba, chỉ hỏi câu dẫn xuất; (2) không đưa gì từ hộp thư vào `/workspace` của sandbox; (3) không ghi nhật ký gì nhạy cảm.
- Không ghi lên bản ghi các thông tin ngoài công việc hay thuộc nhóm đặc biệt (sức khoẻ, chính trị, tôn giáo…).

### Bảng đích đến

| Đích | Nhận gì | Luật chặn | Nguồn |
|---|---|---|---|
| **Nhà cung cấp model qua Vercel AI Gateway** | **Toàn bộ prompt**: instructions, khối «Who we are», kết quả công cụ (thân email, số tiền thoả thuận, tên người…), tin nhắn của người | Không có. Luật egress không nhắc tới nhà cung cấp model | `[mã]` `agent.ts` (model là chuỗi id của Gateway), `lib/crm.ts` |
| Web search có sẵn của eve / `web_fetch` | Câu truy vấn, URL | Luật 1 (chỉ câu hỏi dẫn xuất), **dựa vào mô hình tự giữ** | `[mã]` `data-boundaries.md`, `docs/agent.md` §Sandbox |
| Perplexity (`sonar`, `sonar-pro`) | Câu hỏi nghiên cứu về người hay công ty | Luật 1; thiếu `PERPLEXITY_API_KEY` thì tắt | `[mã]` `lib/perplexity.ts`, `lib/capabilities.ts` |
| Context.dev | Domain công ty; URL LinkedIn đã có trên bản ghi | Khoá nằm trong `AppSetting` | `[mã]` `docs/environment.md` |
| GitHub | Handle hoặc URL đã có | — | `[mã]` |
| Vercel Blob | Byte ảnh logo và chân dung (sao chép, không liên kết) | `safe-fetch` chặn SSRF | `[mã]` `docs/agent.md` §Pictures |
| Slack | Nội dung tin tác nhân gửi (nhắc buổi sáng, tin của tác nhân nhóm) | Đích phải là «chosen», lưu trong manifest | `[mã]` `lib/run-runtime.ts:593`, `packages/validation/src/agent-manifest.ts` |
| Zalo | Tin nhắc (tên việc, đường dẫn) | Cắt ở trần ký tự; thân tin **không lưu, không ghi nhật ký** | `[mã]` `docs/agent.md` §Zalo |
| PostHog (`k.trycomp.ai`, dự án **của hãng**) | Số đếm, băng; tên công cụ; lớp lỗi; `agent_model_id` | Allowlist trong mã; không bao giờ gửi nội dung | `[mã]` `packages/telemetry/src/project.ts`, `docs/telemetry.md` |

### Trả lời điều kiện mở lượt 9

Điều kiện: «nội dung OKR có được gửi tới nhà cung cấp mô hình đang dùng không».

- **Có.** Mọi thứ đưa vào ngữ cảnh đều tới nhà cung cấp mà Gateway định tuyến. Model đang chọn là `google/gemini-3.7-flash` `[ghi chép 2026-09-03]`; model dự phòng khi đọc hàng lỗi là `zai/glm-5.2-fast` `[mã]` `packages/db/src/settings.ts`.
- **Gateway không giữ prompt**, và theo tài liệu thì prompt cùng output bị xoá ngay sau yêu cầu. `[ngoài · cao]` https://vercel.com/docs/ai-gateway/security-and-compliance/zdr
- **Nhà cung cấp có giữ hay không** thì tuỳ nhà cung cấp, trừ khi bật ZDR:
  - Theo từng yêu cầu: `providerOptions.gateway.zeroDataRetention: true`, không tốn thêm, có ở gói Pro và Enterprise.
  - Toàn team: 0,10 USD mỗi 1.000 yêu cầu.
  - Không có nhà cung cấp ZDR cho model đã chọn thì yêu cầu lỗi `no_providers_available`. `[ngoài · cao]` cùng URL
- Team Vercel đang ở gói **Pro** `[ghi chép]`, nên dùng được ZDR theo yêu cầu.
- Google Vertex AI có trong danh sách ZDR `[ngoài · cao]`. Trong danh sách đã đọc **không thấy Z.ai** `[ngoài · vừa]`. Nếu bật ZDR thì model dự phòng `zai/glm-5.2-fast` có thể lỗi `[suy luận — cần gọi thử]`.
- Mã hiện **không** gửi `providerOptions` nào (grep trống). `lib/model.ts` chỉ trả `{ model, modelContextWindowTokens }`. `[mã]`

**Hệ quả** `[suy luận]`: lớp AI mới cần viết thành luật hai điều đang thiếu.

1. Nhà cung cấp model có được coi là bên thứ ba không, và ZDR bật ở đâu: theo purpose trong lúc chọn model, hay toàn team.
2. Trong một phiên OKR, dữ liệu đối tác không được lọt vào ngữ cảnh. Điều này giữ bằng bộ công cụ ở mục (1), không giữ bằng lời dặn.

`data-boundaries.md` phải thêm một mục cho OKR và vai `okr` (doc yêu cầu «Keep them in step»).

---

## (3) Cơ chế chi phí đang có

| Cơ chế | Hiện trạng | Nguồn |
|---|---|---|
| Chọn model | **Một model cho cả tác nhân**, lưu ở hàng `AppSetting.agentModelId`, đọc lúc `session.started`. Hội thoại đang mở giữ model cũ (prompt cache tính theo model). Màn chọn chỉ liệt kê model `tool-use` từ catalog của Gateway, kèm giá. Không có model riêng cho từng purpose hay tính năng | `[mã]` `agent.ts`, `lib/model.ts`, `apps/api/src/settings/model-catalog.service.ts` |
| Model dự phòng | `zai/glm-5.2-fast`, dùng khi đọc hàng lỗi hoặc hàng trống | `[mã]` `settings.ts` |
| Trần token mỗi phiên | `maxInputTokensPerSession: 500_000`, `maxOutputTokensPerSession: 50_000`, phiên sống tối đa 30 ngày | `[mã]` `apps/agent/agent/agent.ts` |
| Vượt trần trong phiên có người | eve **dừng và hỏi Approve/Stop**. Approve cấp thêm một cửa sổ cùng cỡ. Vì vậy trần phiên **không phải trần tiền** với phiên chat | `[ngoài · cao]` tài liệu eve cài kèm: `apps/agent/node_modules/eve/docs/agent-config.md` §Runtime limits |
| Vượt trần trong phiên tự động | Lỗi `SESSION_TOKEN_LIMIT_REACHED`, không hỏi | cùng nguồn |
| Ngân sách nghiên cứu | `lib/focus.ts`: đơn vị là **một lần gọi nhà cung cấp có tính tiền** (Context, Perplexity), không phải token. `AgentTask.budget` mặc định 4; hết là kết thúc bình thường; đếm `budget_exhausted` | `[mã]` `lib/focus.ts`, `docs/agent.md` §Budget |
| Gom việc | Nhịp dispatch mỗi phút. Làn «visible» (60 mỗi nhịp, không model). Làn «research» (12 mỗi nhịp, một phiên eve mỗi hàng). `collapsing()` gộp nhiều lần poke. Nhắc buổi sáng: một hàng mỗi người mỗi ngày, làn trực tiếp, **không model**. `schedules/dispatch.ts` là lịch duy nhất và không tự quyết gì | `[mã]` `lib/dispatch-config.ts`, `docs/agent.md` §Two lanes, §Nhắc |
| Trần ở Gateway | Budget theo team, project, API key hoặc user. Tới trần thì **HTTP 402 `quota_for_entity_exceeded`**. Là trần mềm: yêu cầu vượt vẫn chạy xong. Có email cảnh báo 50/75/100%. Budget theo user là thành viên team **Vercel**, không phải người dùng CRM | `[ngoài · cao]` https://vercel.com/docs/ai-gateway/observability-and-spend/budgets |
| Ngân sách thực tế | Team 20 USD/tháng; khoá `onehub-crm-local` có trần riêng. Trên Vercel production thì dùng OIDC, nên budget tính theo **project**, không theo khoá | `[ghi chép 2026-09-03]`; phần OIDC `[mã]` `docs/environment.md` + `[ngoài · cao]` trang budgets |
| **Trần tiêu theo tháng trong app** | **Chưa có.** Lượt 9 đòi «trần chi tiêu AI theo tháng cho workspace; thiếu khoá thì nút AI biến mất» | `[mã]` `docs/plan/lo-trinh-okr.md` §Lượt 9 |

### Có đo token và chi phí theo tính năng không

- **Tác nhân nhóm:** có. Audit hook cộng dồn `inputTokens`, `outputTokens`, `costUsd` từ `step.completed` vào `AgentRun`, và `AgentRun.modelId` ghi model đã dùng. `[mã]` `hooks/audit.ts` (`persistRunEvent`), schema `AgentRun`.
- **Mọi phiên khác** (nghiên cứu theo `AgentTask`, chat trong panel bản ghi, trình dựng):
  - Không có cột tổng.
  - Audit hook ghi **mọi** sự kiện (trừ các sự kiện `.appended`) vào `AgentEvent`, cùng `data`. Vì vậy usage của từng bước nằm trong `AgentEvent.data` với `type='step.completed'`.
  - Nối `sessionId` sang `AgentTask.sessionId` (theo `kind`) hoặc `AgentConversation.sessionId` (theo `userId`) là **tính ngược được** chi phí theo tính năng và theo người. Chưa có truy vấn hay màn nào làm việc này. `[mã]` `hooks/audit.ts`, schema `AgentEvent`, `AgentTask`, `AgentConversation`.
- **Nhật ký:** `hooks/activity.ts` in `in/out/cached/$cost` của từng bước ra stderr. Chỉ để xem, không lưu. `[mã]`
- **Telemetry** không gửi token hay chi phí. `[mã]` `docs/telemetry.md`
- **«Theo workspace»** không có nghĩa ở đây: kho một tenant, không có `organizationId` (`docs/api.md` §One organization). Chiều cần đo là **theo người, theo đơn vị, theo tính năng**. `[mã]`
- **Gateway Custom Reporting** gom được theo `user` và `tags` gắn vào yêu cầu (`providerOptions.gateway.user/tags` hoặc header `ai-reporting-user`/`ai-reporting-tags`, tối đa 10 tag). Có ở Pro. Ghi 0,075 USD mỗi 1.000 lần, truy vấn 5 USD mỗi 1.000 lần. **Chưa dùng.** `[ngoài · cao]` https://vercel.com/docs/ai-gateway/observability-and-spend/custom-reporting
- eve cho hàm chọn model trả thêm `modelOptions` (có `providerOptions`). Về lý thuyết thì gắn được `tags: ["feature:okr-tom-tat"]`, `user` và `zeroDataRetention` theo purpose ngay trong `lib/model.ts`. `[ngoài · vừa]` `eve/docs/agent-config.md` §Dynamic model; cách áp cụ thể là `[suy luận — cần thử]`.

### Con số để ước lượng

| Model | Vào / 1M | Ra / 1M | Cache đọc / 1M | Ghi chú |
|---|---|---|---|---|
| `google/gemini-3.7-flash` (đang chọn) | 0,75 USD | 3,75 USD | 0,075 USD | Tầng `flex` bằng nửa giá |
| `zai/glm-5.2-fast` (dự phòng trong mã) | 2,80 USD | 8,80 USD | 0,56 USD | Giá thay đổi theo nhà cung cấp |
| `google/gemini-3.5-flash-lite` | 0,30 USD | 2,50 USD | 0,03 USD | — |

`[ngoài · cao]` catalog `https://ai-gateway.vercel.sh/v1/models`, lấy ngày 2026-09-26. Catalog ghi thêm `web_search: 14` cho các model Gemini, có lẽ tính theo 1.000 lượt tìm `[suy luận]`.

- Một phiên chạm trần `[suy luận, tính từ giá trên]`: 500k vào + 50k ra ≈ **0,56 USD** trên gemini-3.7-flash, ≈ **1,84 USD** trên glm-5.2-fast. Chỉ khoảng 36 phiên chạm trần là hết 20 USD của tháng. Trần phiên không giữ được trần tháng.
- Đo thật: một phiên nghiên cứu `workspace-profile` tốn khoảng **0,19 USD** trên glm-5.2-fast `[ghi chép 2026-09-03]`. Trên gemini-3.7-flash thì có lẽ còn khoảng một phần tư tới một phần ba, vì giá vào bằng 27% `[suy luận]`.
- **Khung ước lượng cho OKR** `[suy luận, mọi tham số cần đo]`:

  > chi phí/tháng ≈ Σ theo tính năng của (số lần gọi × số bước × (token vào × giá vào + token ra × giá ra))

  Ví dụ: tóm tắt tuần theo đơn vị, 40 đơn vị × 4,3 tuần × khoảng 3 bước × (15k vào, 800 ra) ≈ 40×4,3×3×0,0143 ≈ **7,4 USD/tháng**. Viết lại khi người bấm, 200 người × 5 lần × khoảng 2 bước × (8k vào, 500 ra) ≈ 2.000×0,0079 ≈ **15,8 USD/tháng**. Cộng hai món đã vượt 20 USD, nên cần trần trong app và/hoặc một đường «một lần gọi model, không phiên eve» cho các việc ngắn.
- **Embedding không đáng kể về tiền**: `google/text-multilingual-embedding-002` giá 0,025 USD mỗi 1M token; `openai/text-embedding-3-small` giá 0,02 USD `[ngoài · cao]` catalog. Chi phí của retrieval nằm ở DB (Neon) hơn là ở API `[suy luận]`.

---

## (4) Vector store, embedding, full-text search

- **Không có.** `schema.prisma` (2.088 dòng) và toàn bộ `migrations/` không có `vector`, `tsvector`, `pg_trgm`, `Unsupported(...)`, `CREATE EXTENSION`, cũng không có chỉ mục GIN. `previewFeatures` chỉ có `partialIndexes`. `[mã]`
- **Tìm kiếm hiện có:**
  - `apps/api/src/search/search.service.ts` và `apps/agent/agent/lib/lookup.ts` (`searchCrm`) dùng Prisma `contains` + `mode: "insensitive"`, tức `ILIKE '%…%'`, trên tên, email, domain, tên thoả thuận và tên công ty.
  - Tách từ, **không fuzzy**, và cố ý như vậy: «Marchetti» ra «Marchetta» là sai người thật. `[mã]` `docs/agent.md` §Three records.
  - Không có chỉ mục phù hợp nên mỗi lần tìm là quét bảng. Chấp nhận được ở cỡ hiện tại `[suy luận]`.
- **OKR:** không có tìm kiếm nào. Đọc theo `cycleId`, đơn vị và cấp. `[mã]` `okr.service.ts`
- **Cơ sở hạ tầng:**
  - Neon hỗ trợ pgvector ở **mọi gói**, bật theo từng database bằng `CREATE EXTENSION vector`, có chỉ mục HNSW và IVFFlat. `[ngoài · cao]` https://neon.com/docs/extensions/pgvector
  - Neon cũng có `pg_search` (BM25). `[ngoài · vừa]` https://neon.com/docs/extensions/pg_search
- **Hệ quả** `[suy luận]`:
  1. Thêm pgvector là sửa `packages/db/prisma`, thuộc đường **T3**. Prisma phải khai cột `Unsupported("vector(n)")` và truy vấn bằng `$queryRaw`.
  2. Mỗi lượt `bun run test` dựng một DB `crm_<id>_test`, nên extension phải có ở Postgres máy local và chạy trong migration.
  3. Tiếng Việt không có bộ stem trong Postgres, nên full-text sẽ là cấu hình `simple` + `unaccent`.
  4. Với OKR, dữ liệu nhỏ và có cấu trúc (một đơn vị × một chu kỳ). Truy xuất theo cấu trúc (đơn vị, chu kỳ, KR, dòng thời gian cập nhật) nhiều khả năng **đủ và rẻ hơn** RAG vector cho lượt 9–10. Vector chỉ đáng khi cần «tìm OKR tương tự» hay gợi ý căn chỉnh xuyên đơn vị.
  5. Kho có khối «Who we are» (`WorkspaceProfile`, tối đa 320 ký tự, prompt-cached) làm tri thức nền cố định cho mọi phiên. Đây là mẫu «knowledge nhỏ, có chủ» đang dùng. `[mã]` `docs/agent.md` §Every session knows who we are.

---

## (5) Telemetry: đã đo gì về AI

| Tín hiệu | Nơi | Đo nhận/sửa/bác gợi ý? | Nguồn |
|---|---|---|---|
| `tool_calls`, `tool_errors`, `sessions_*`, `tasks_*`, `budget_exhausted`, `agent_conversations` | `install_daily` gửi PostHog | Không; đây là số vận hành | `[mã]` `docs/telemetry.md` |
| `facts_by_status` (APPLIED/PROPOSED/DISMISSED/SUPERSEDED), `fact_dismissal_rate`, `fact_decision_median_hours`, `facts_superseded_within_7_days` | `install_daily` | **Có**, nhưng chỉ cho fact danh bạ (sổ gợi ý của tác nhân nghiên cứu) | `[mã]` |
| `agent_error`, `model_error` | Sự kiện lỗi, chỉ gửi lớp lỗi | Không | `[mã]` `hooks/telemetry.ts` |
| `AgentConversationFeedback` (UP/DOWN mỗi tin) | Bảng DB | Chỉ cho **trình dựng tác nhân** (`rateBuilderResponse` đòi `kind: "BUILDER"`) | `[mã]` `conversations.service.ts:700` |
| `ContactFact.decidedAt` + trạng thái | Bảng DB | Có, cho danh bạ | `[mã]` |
| `OkrTrail` (`before`/`after` có kiểu, `actorUserId`) | Bảng DB | Chưa có trường nguồn AI. Có tiền lệ `source: "zalo"` trong dấu vết `buoc.xong` | `[mã]` `docs/api.md` §OKR, `docs/agent.md` §Zalo |
| `AgentTask.payload.daGui` và các «thước» SQL ở `_acceptance/*/rang/` | DB + truy vấn đo | Đây là **cách kho đang đo sản phẩm** | `[mã]` `docs/agent.md` §Nhắc |

**Kết luận:** chưa có sự kiện nào đo «nhận nguyên văn, sửa rồi nhận, bác» cho gợi ý chữ, ngoài sổ fact danh bạ.

Có hai lý do để **không** dùng telemetry PostHog cho việc này. Thứ nhất, nó gửi về dự án của hãng (`k.trycomp.ai`); OneHub không đọc được, và thêm thuộc tính lại làm bản rẽ phình ra `[mã]` `project.ts`. Thứ hai, telemetry bị cấm mang nội dung. Chỗ đúng là **hàng DB + thước SQL**, như cách lượt 4 và nhắc kế hoạch đang đo `[suy luận]`.

Chưa biết production có đặt `CRM_TELEMETRY_DISABLED=1` hay không. Xem mục Khoảng trống.

---

## (6) Duyệt hành động ghi của tác nhân

| Cơ chế | Hoạt động | Nguồn |
|---|---|---|
| `sensitiveWrite(instead)` (chính sách `approval` của eve) | Phiên tự động (principal `eve:app`) → `denied` kèm lý do (từ chối là **kết quả**, không phải exception). Phiên có người → `"user-approval"`: eve dừng, người duyệt trong panel. Hiện chỉ **2 công cụ** mang: `archive_field`, `record_job_change` | `[mã]` `lib/approval.ts`, `tools/archive_field.ts`, `tools/record_job_change.ts` |
| Mô hình bằng chứng cho fact | `lib/facts.ts` là đường ghi duy nhất vào trường của danh bạ. `VERIFIED` thì ghi; thấp hơn thì **đề xuất** (`PROPOSED`) để người nhận hoặc bác; không ghi đè người; không mời lại cái đã bác; không ghi khi thiếu nguồn gốc. Trường trống được điền nếu qua ngưỡng giữ | `[mã]` `docs/agent.md` §Evidence, not confidence |
| Công cụ ghi không cần duyệt | `record_fact`, `set_field_value`, `write_brief`, `manage_fields` (tạo trường), `schedule_recheck`, `write_workspace_profile`… Ranh giới nằm trong luật của đường ghi, không nằm ở bước duyệt | `[mã]` `tools/*.ts` (grep `approval`) |
| Tác nhân dựng | Tạo tác nhân đòi lượt `CREATE_AGENT`; quyền do trình duyệt khai và server **mang theo** qua câu hỏi chờ; từ chối là kết quả `not_authorized` | `[mã]` `docs/agent.md` §Team-agent builder |
| Tác nhân nhóm | **Triển khai là ranh giới duyệt của người**: lưu tạo phiên bản READY riêng, Deploy ghim phiên bản bất biến. Chạy theo lịch hay sự kiện là chế độ task, **không dừng hỏi từng hành động**. Mỗi hành động được ghi sổ `AgentAction` trước khi chạy, khoá bằng call id để chạy lại an toàn. Huỷ là ghi hàng, không phải gửi tín hiệu; huỷ không hoàn tác | `[mã]` `docs/agent.md` §Team-agent, schema `AgentAction`, `AgentAuditEvent` |
| Zalo `xong n` | Ghi xác định (không model), đi qua **đúng thủ tục** màn dùng (`datBuocXong` trong `@crm/db/onboarding-buoc`), được cả hoặc không, dấu vết mang `source: "zalo"` | `[mã]` `docs/agent.md` §Zalo |

**Hệ quả cho OKR** `[suy luận]`:

- Lộ trình đã chốt ngoài phạm vi NG-05: «máy ghi số hay mức tự tin thay người». Mẫu hợp nhất vì vậy là **gợi ý có sổ** (tương tự `ContactFact` PROPOSED/DISMISSED): hiện câu cũ cạnh câu mới, người nhận từng dòng, cái đã bác không mời lại.
- Khi người nhận, việc ghi đi qua API `okr.*`, nên giữ được `OkrAccessService`, khoá pha và `OkrTrail`. `after` mang nguồn `ai` và mã gợi ý để đo.
- Nếu tác nhân tự ghi OKR (qua kênh chat), thủ tục ghi phải chuyển sang gói dùng chung trong `@crm/db`, như `datBuocXong`. Không có chuyện tác nhân tự viết Prisma lên `okrKeyResult`.

---

## (7) Tích hợp: AI nhận gì, gửi gì

| Tích hợp | Nhận vào | Gửi ra | Quyền và ghi chú | Nguồn |
|---|---|---|---|---|
| **Slack** | **Không có cửa nhận** (không Events API, không URL tương tác). Chỉ đọc danh sách kênh và người vào bảng cache (`SlackChannel`, `SlackMemberMatch`, khớp theo email) | `chat.postMessage`, DM qua `conversations.open`, tạo kênh, tự vào kênh công khai, mời bot vào kênh riêng bằng user token | Scope: `users:read(.email)`, `channels:read`, `groups:read`, `channels:history`, `groups:history`, `chat:write(.public)`, `im:write`, `channels:join/manage`, `groups:write`, `*:write.invites`, `links:write`. Nối và gỡ là việc của owner/admin, chặn ngay ở OAuth. Bot token nằm trên `Account`, user token nằm trên `SlackWorkspaceGrant` | `[mã]` `packages/auth/src/slack-scopes.ts`, `docs/connections.md`, `lib/run-runtime.ts:593` |
| **Zalo (bot)** | Webhook `POST /zalo/webhook` trên tác nhân. Chỉ chat `PRIVATE` của người đã nối bằng mã 6 số; bỏ tin từ bot và tin nhóm; chống trùng theo `message_id`; lệnh cố định `xong n`/`done n` (không model) | `sendMessage` dạng chữ trần, có trần ký tự (khoảng 2.000), **không nút** | Không khớp được theo email hay số điện thoại. Thân tin **không lưu, không ghi nhật ký**. Token và secret ở `AppSetting`, `.env` là dự phòng | `[mã]` `docs/agent.md` §Zalo, `docs/connections.md` §Zalo, `lib/zalo-lenh.ts` |
| **Google** | Gmail `gmail.readonly`, Calendar `calendar.readonly`; đồng bộ chỉ đi tiếp, không lấy quá khứ | Không | Thân email lưu trong `EmailMessage`; tác nhân đọc được qua `read_crm_history` (phạm vi đối tác). Không có Drive, Sheets, Docs | `[mã]` `packages/auth/src/scopes.ts`, `docs/environment.md` §Mailbox sync |
| **Microsoft** | Outlook `Mail.Read` | Không | Như Google | `[mã]` |
| **Perplexity, Context.dev, GitHub** | Kết quả nghiên cứu | Câu hỏi dẫn xuất | Không có khoá thì không có nguồn đó | `[mã]` `lib/capabilities.ts` |
| **Cửa ingest nội bộ** | `POST /internal/listings/ingest` (nhatot), `POST /internal/onboarding/ingest` (nền tảng OneHub); Bearer secret; parse bằng Zod; lỗi là bác cả lô | — | Không khớp thì ghi `AgentTask` để tác nhân quyết. Thêm cửa thứ ba là một **quyết định** | `[mã]` `docs/api.md` §Internal ingest |
| **Khoá API + REST bridge** | Mọi thủ tục tRPC lộ dưới `/rest`, OpenAPI ở `/openapi.json` | — | Khoá **mang đúng quyền của chủ khoá**, không có scope hẹp hơn. Không tạo khoá bằng khoá được (`SessionOnlyMiddleware`). Vai `okr` với tới `okr.*` qua REST | `[mã]` `docs/api.md` §OpenAPI, `api-keys.router.ts` |
| **Theo dõi website** | Lượt xem trang, form → tạo danh bạ | — | Không IP, không query string, không trường nhạy cảm. «The agent is told, never asked» | `[mã]` `docs/tracking.md` |
| **Sự kiện CRM cho tác nhân nhóm** | 6 sự kiện: `company.created`, `contact.created`, `deal.created`, `deal.stage.changed`, `deal.opened`, `deal.closed`; loại bản ghi chỉ có company/contact/deal | — | **Chưa có sự kiện OKR** | `[mã]` `packages/db/src/crm-events.ts` |
| **Hành động của tác nhân nhóm** | — | `crm.activity.create` (NOTE/TASK), `run.summary`, `slack.message.post` | Nguồn kết nối được nhận chỉ gồm `google:gmail`, `google:calendar` | `[mã]` `packages/validation/src/agent-manifest.ts`, `lib/agent-actions.ts` |
| **MCP / OpenAPI connection của eve** | Có trong framework (`agent/connections/*.ts`, token không bao giờ tới mô hình, auth theo app hoặc theo user) | — | **Kho chưa dùng** (không có thư mục `connections`) | `[ngoài · cao]` `apps/agent/node_modules/eve/docs/connections/overview.mdx` |
| **Kênh Slack của eve** | `@mention`, DM, trả lời trong thread, HITL thành nút; qua Vercel Connect | — | Có thể là cửa nhận tin cho lượt 10, nhưng sẽ là một Slack app thứ hai bên cạnh bản cài OAuth hiện có. Cần quyết | `[ngoài · cao]` `eve/docs/channels/slack.mdx`; phần «app thứ hai» `[suy luận]` |

---

## (8) Luật trong AGENTS.md và docs sẽ ràng buộc thiết kế lớp AI

Mỗi dòng gồm: luật, nguồn `[mã]`, rồi **hệ quả** `[suy luận]`.

1. **Trí khôn chỉ sống ở `apps/agent`, không ở API**, «not as a fallback, not behind a flag» (`AGENTS.md`, `docs/api.md` §Intelligence).
   → Viết lại, kiểm chất lượng bằng model, tóm tắt, gợi ý căn chỉnh, gợi ý đích đều nằm trong tác nhân. API không được có client Gateway. Kiểm chất lượng **bằng luật** (lượt 7) nên là hàm thuần trong `packages/validation` để màn và tác nhân cùng dùng.
2. **API báo «có việc» bằng một hàng `AgentTask`, không bằng lời gọi HTTP**; `poke` là bắn-rồi-quên (`docs/api.md`, `docs/agent.md` §Dispatch).
   → Việc chạy nền (tóm tắt tuần) là hàng có `dueAt` và `subject` duy nhất, như nhắc buổi sáng (một hàng mỗi đơn vị mỗi tuần). Màn đọc kết quả nền bằng **polling** (`refetchInterval`), không bằng invalidation. Việc tương tác ngay (viết lại khi bấm) đi qua đường nối `/eve/v1`.
3. **`schedules/dispatch.ts` là lịch duy nhất và không tự quyết**; «mỗi N phút» phải thành `dueAt` (`docs/agent.md` §Budget).
   → Không thêm cron riêng cho OKR. Nhịp tuần của OKR là hàng mang `dueAt`.
4. **Tuỳ chọn theo mặc định: thiếu khoá thì mất khả năng, không bao giờ ném lỗi**; `capabilities.ts` là nơi duy nhất biết thứ gì đang bật và được kiểm trước khi trừ ngân sách (`AGENTS.md`, `docs/agent.md` §Optional).
   → Trợ lý OKR là một capability. Hết trần tháng cũng phải hiện như capability «tắt», không để thành 402 từ Gateway. API không đọc được env của tác nhân, nên phải biết trạng thái qua một hàng `AppSetting` do tác nhân ghi, theo tiền lệ `zaloBotName`.
5. **Một `.env` ở gốc**; biến mới có ba chỗ khai: `.env.example`, `env.validation.ts` nếu API đọc, và `turbo.json` `globalPassThroughEnv` (dùng `passThroughEnv`, không bao giờ `env`) (`docs/environment.md`).
   → Thứ quản trị cần chỉnh (trần tháng, model theo tính năng, bật ZDR) nên là **hàng `AppSetting`** có màn Cài đặt, như khoá Context: «an admin who cannot redeploy cannot set a variable».
6. **Parse ở biên bằng Zod, không truyền `Record<string, unknown>`**; khuôn đi qua ranh giới gói nằm ở `packages/validation/src`, mỗi khuôn một module, import theo subpath; parse hỏng là lỗi thật (`AGENTS.md`).
   → Gợi ý AI, payload `AgentTask` của các loại OKR, `OkrTrail.after` mang nguồn AI, đầu ra có cấu trúc của model: mỗi thứ một schema trong `@crm/validation/okr-*`. Đầu ra model không parse được thì là lỗi, không phải «không có gợi ý».
7. **Hằng số theo vùng gom vào một file config** (mẫu `dispatch-config.ts`, đơn vị gốc `MINUTE_MS`, `as const`) (`AGENTS.md`).
   → Trần token, trần tiền, cỡ lô, model theo tính năng, trần ký tự: một object kiểu `TRO_LY_OKR`, không để rải rác.
8. **Không viết chú thích trong code** (`AGENTS.md`). Áp cho mọi file mới.
9. **`/packages/ui` là nguồn duy nhất của giao diện; AI Elements sở hữu cuộc hội thoại, shadcn sở hữu phần quanh nó**; không ghi đè bằng `className`; chỉ `primary` và `destructive` được tô nền (`docs/design.md`, `docs/chat-ui.md`).
   → Màn so câu cũ với câu mới, trích dẫn nguồn, nút nhận/bác phải dùng thành phần có sẵn hoặc thêm biến thể trong `packages/ui`. Trích dẫn và nguồn là phần của AI Elements.
10. **Client component không import gói server**; trang server tính, client chỉ vẽ (`AGENTS.md`).
    → Component gợi ý AI nhận dữ liệu đã hoàn chỉnh; không tự suy dữ liệu, không import `@crm/db`.
11. **Bằng chứng, không phải độ tự tin**: không công cụ nào nhận confidence, điểm số hay `sourceUrl` làm bằng chứng (`docs/agent.md` §Evidence).
    → Khớp NG-05. Mỗi câu tóm tắt phải dẫn về lần cập nhật gốc; mỗi con số được **mã** kiểm lại so với dữ liệu, lệch thì bỏ câu (lượt 9 đã ghi). Mô hình không chấm điểm KR.
12. **Ba bản ghi, không ngõ cụt**: mỗi lần đọc trả id của bản ghi láng giềng; `search_crm` không fuzzy; loại bản ghi thứ tư cần `sessionPreamble` + một hàm đọc + dòng `TOOL_VERBS` + mục `COPY` (`docs/agent.md` §Three records).
    → Muốn đưa «mục tiêu OKR» thành loại bản ghi mở được panel tác nhân thì theo đúng công thức bốn chỗ này. Công cụ đọc OKR trả id đơn vị, KR, người sở hữu, mục tiêu cha.
13. **Được đọc mọi thứ; ranh giới là egress** (`docs/agent.md`, `data-boundaries.md`, phải giữ khớp nhau).
    → Luật này viết cho một phiên đọc được dữ liệu đối tác. Với phiên OKR mở cho vai `okr`, «đọc mọi thứ» **không còn đúng**; phải thêm luật đọc theo phạm vi, và sửa cả hai file cùng lúc.
14. **Sandbox deny-all; không bao giờ đưa `DATABASE_URL` vào sandbox; truy cập CRM chỉ qua công cụ tự viết** (`docs/agent.md` §Sandbox).
    → Công cụ OKR là công cụ tự viết chạy trong runtime của app. Sandbox không được thành đường đọc DB.
15. **Mỗi router khai phạm vi dữ liệu; bare `AuthMiddleware` là đóng với `okr`; `vai-chi-okr.spec.ts` ghim danh sách** (`docs/api.md` §tRPC).
    → Router mới của trợ lý OKR (lịch sử, gợi ý) phải khai `PhamViOkrMiddleware` và sửa `ALIAS_CHO_PHEP` có chủ ý. AC «một phép đo cho từng đường vào» của lượt 2 áp cả cho trợ lý mới.
16. **Quyền OKR theo từng bản ghi, lấy từ trưởng đơn vị; 11 thao tác ghi bị khoá theo pha; mỗi lần ghi để lại đúng một `OkrTrail`, không bao giờ `Activity`** (`docs/api.md` §OKR).
    → Tác nhân không ghi OKR bằng Prisma trực tiếp. Hoặc người nhận gợi ý qua API, hoặc chuyển thủ tục sang gói dùng chung trong `@crm/db` (tiền lệ `datBuocXong`). Màn hỏi `canEdit` từ API, không tự suy.
17. **Một cây tổ chức cho cả CRM**, `org.*` là cách duy nhất ghi phòng ban (`docs/api.md` §Organization tree).
    → Gom tóm tắt theo đơn vị phải đọc cây này, không giữ bản sao đơn vị riêng.
18. **Model: một hàng `AppSetting`, không phải env; cố ý không dùng model frontier; mở hội thoại thì giữ model** (`docs/agent.md` §Model).
    → Nếu muốn model rẻ cho tóm tắt và model khác cho chat, đó là mở rộng của `readAgentModel` (theo purpose), vẫn là hàng, và phải nhớ prompt cache tính theo model.
19. **Ghi nhật ký: không bao giờ ghi header, query string hay body**; tin Zalo không lưu, không ghi nhật ký (`docs/api.md` §Logging, `docs/agent.md` §Zalo).
    → **Xung đột tiềm ẩn**: đưa chữ người nhắn trên Zalo vào một phiên eve thì audit hook `"*"` sẽ lưu `message.received` vào `AgentEvent.data`, trái với «Message text is never stored». Lượt 10 phải chọn: bỏ lưu với purpose đó, hoặc sửa luật.
20. **Telemetry chỉ phía server, có allowlist, không bao giờ mang nội dung, prompt hay completion** (`docs/telemetry.md`).
    → Không gửi câu gợi ý hay câu tóm tắt ra đâu cả. Số đo AI đặt ở DB (thước SQL). Thêm thuộc tính telemetry thì phải thêm vào `ALLOWED_PROPERTIES` và vào bảng trong doc.
21. **Một tenant, id workspace là hằng số, không phải tham số** (`docs/api.md` §One organization).
    → Không thiết kế «đa workspace» cho trợ lý. Chiều tách là người, đơn vị, vai.
22. **Kết nối là một capability; tự động hoá là một tác nhân**; đích «derived» hay «chosen»; lỗi phải hiện trên bề mặt; việc không đảo được phải có giới hạn viết ra (`docs/connections.md`).
    → Cảnh báo KR trượt gửi qua Slack hay Zalo phải ghi rõ giới hạn («tối đa một tin mỗi KR mỗi tuần»). Thêm tích hợp thì theo hướng «brings in / sends».
23. **Nối hay gỡ Slack là quyết định của owner/admin**; danh sách scope có một nguồn (`SLACK_SCOPE_GROUPS`) (`docs/connections.md`).
    → Cửa nhận tin Slack (lượt 10) cần scope mới, tức admin phải đồng ý lại và thuộc T3, như lộ trình đã ghi.
24. **Token tiếp nối có namespace; hội thoại được giữ: `AgentConversation` giữ handle, `AgentEvent` giữ transcript** (`docs/agent.md` §Continuation tokens).
    → Chat OKR dùng lại cơ chế này, nhưng `AgentConversation` chỉ có khoá ngoại contact/company/deal và loại `RECORD|BUILDER`, nên cần một loại mới hoặc cột mới. Đó là sửa schema, thuộc T3.
25. **Đường T3**: `packages/auth`, `packages/db/prisma`, các module `auth`, `api-keys`, `sso`, `users`, `workspace`, `tracking`, `mailbox` (`CLAUDE.md` của kho).
    → Mọi việc thêm bảng gợi ý, pgvector, loại hội thoại, hay token đường nối có phạm vi (sửa `packages/auth` hoặc route) đều qua cổng duyệt kế hoạch.
26. **Phí bản rẽ là chi phí dài hạn lớn nhất; sửa được ở hãng thì gửi lên hãng** (`CLAUDE.md`).
    → Mã OKR/AI đặt ở chỗ riêng (file và module mới), tránh sửa file của hãng như `crm-events.ts`, `telemetry` và các tool gốc. Cơ chế tổng quát, như gắn `tags` hay `user` theo purpose trong `lib/model.ts`, có thể gửi lên hãng.

---

## Điểm mở rộng đã có sẵn

| Điểm | Ở đâu | Cho phép gì | Giới hạn |
|---|---|---|---|
| Bảng capability | `apps/agent/agent/lib/capabilities.ts` | Thêm «Trợ lý OKR» thành capability bật/tắt; tự vào instructions và nhật ký lúc khởi động | Đọc env hoặc `AppSetting`; API không thấy, phải có hàng phản chiếu |
| Chọn model động | `apps/agent/agent/lib/model.ts` + `defineDynamic` trong `agent.ts` | Trả `modelOptions.providerOptions.gateway` (`tags`, `user`, `zeroDataRetention`) và model theo purpose hoặc người | Chỉ chạy lúc `session.started`; cách áp cụ thể chưa thử |
| Purpose của phiên | `apps/agent/agent/lib/session-purpose.ts` (`builder`, `team-agent`, `research`) | Thêm purpose `okr` để gate công cụ, audit và model | Purpose đọc từ thuộc tính token; phải do route đặt, không do client |
| Subagent khai báo | `apps/agent/agent/subagents/*` | Một chuyên viên OKR có instructions, công cụ và sandbox riêng, không kế thừa công cụ đối tác | Mỗi subagent là một bộ công cụ phải viết và kiểm |
| Chính sách approval | `apps/agent/agent/lib/approval.ts` (`sensitiveWrite`) | Công cụ ghi dừng chờ người duyệt trong phiên có người; bị từ chối khi chạy tự động | Hiện chỉ phân biệt «tự động» và «có người», không theo vai |
| Hàng đợi `AgentTask` + làn | `packages/db/src/agent-tasks.ts`, `lib/dispatch-config.ts`, `schedules/dispatch.ts` | Loại việc mới (tóm tắt tuần theo đơn vị) có `dueAt`, `priority`, `budget`, `subject` duy nhất | `TASK_KINDS`/`DIRECT_KINDS` là file của hãng; làn trực tiếp hiện nghĩa là «không model» |
| Sổ gợi ý kiểu fact | `apps/agent/agent/lib/facts.ts` + `ContactFact` | Mẫu PROPOSED/APPLIED/DISMISSED, không mời lại, có `decidedAt` để đo | Gắn với trường của danh bạ; OKR cần bảng riêng |
| Kênh tuỳ biến của eve | `apps/agent/agent/channels/zalo.ts` | Cửa nhận tin mới (Slack tương tác, lệnh OKR trên Zalo) với auth riêng | Zalo không có nút; không lưu chữ |
| Sự kiện CRM | `packages/db/src/crm-events.ts` | Thêm sự kiện OKR để tác nhân nhóm phản ứng (KR trượt, pha đổi) | `recordKind` chỉ có company/contact/deal; file của hãng |
| Manifest tác nhân nhóm | `packages/validation/src/agent-manifest.ts` | Thêm hành động hay nguồn kết nối có kiểu | Hành động là quyền có cấu trúc; phải chạy lại triển khai |
| Skill của tác nhân | `apps/agent/agent/skills/*.md` | Tri thức thủ tục (cách viết KR tốt, luật dữ liệu OKR) nạp khi cần | Là lời dặn, không phải ranh giới quyền |
| Khối «Who we are» | `apps/agent/agent/lib/workspace.ts` | Tri thức nền nhỏ, prompt-cached, cho mọi phiên | Tối đa 320 ký tự; không phải kho tri thức |
| Kết nối MCP/OpenAPI của eve | `apps/agent/agent/connections/` (chưa có) | Gắn server MCP ngoài hoặc chính OpenAPI của CRM làm công cụ | Token theo app hoặc user; chưa dùng ở kho |
| REST bridge + OpenAPI + khoá API | `apps/api/src/create-app.ts`, `/openapi.json` | Máy ngoài hay MCP đọc/ghi `okr.*` với đúng quyền của chủ khoá | Khoá không có scope hẹp; vai `okr` chỉ tới phạm vi chung, tổ chức và OKR |
| Gateway Custom Reporting và Budgets | Vercel AI Gateway (ngoài kho) | Chi phí theo tag hoặc user; trần theo project hoặc khoá, trả 402 | Pro; trần mềm; user là thành viên Vercel, không phải người CRM |
| pgvector trên Neon | Neon (ngoài kho) | Vector search trong cùng Postgres | Sửa schema là T3; Prisma dùng `Unsupported` + raw SQL; DB test cần extension |

---

## Khoảng trống và câu hỏi còn mở

1. **Không có trần tiền theo tháng trong app**, và trần phiên không giữ được trần tháng (phiên chat còn Approve thêm được). Lượt 9 không mở được nếu thiếu mục này.
2. **Không có chiều chi phí theo tính năng hay theo người**, trừ `AgentRun`. Usage nằm rải trong `AgentEvent.data`.
3. **Vai `okr` bị chặn cả tác nhân**. Chưa có phạm vi trong token đường nối, chưa có bộ công cụ OKR, chưa có router hội thoại ở phạm vi `okr`.
4. **Tác nhân không dùng lại được luật quyền ghi OKR**: `OkrAccessService` và `assertKyGhiDuoc` nằm trong Nest.
5. **Chưa bật ZDR**, và chưa có chữ nào xác nhận nhà cung cấp model có phải «bên thứ ba» theo luật egress không. Model dự phòng `zai/glm-5.2-fast` có thể không có đường ZDR (cần gọi thử).
6. **Slack không có cửa nhận**. Zalo có cửa nhận nhưng không nút, và luật «không lưu chữ» va với audit hook nếu đưa chữ vào phiên eve.
7. **Không có retrieval ngữ nghĩa**. Với OKR, truy xuất theo cấu trúc có lẽ đủ; vector để sau.
8. **Chưa đo nhận/sửa/bác gợi ý**. `OkrTrail` chưa có trường nguồn AI; feedback UP/DOWN chỉ cho trình dựng.
9. **Chưa biết production có tắt telemetry gửi về PostHog của hãng không** (`CRM_TELEMETRY_DISABLED`). Mã mặc định là bật và gửi về `k.trycomp.ai`, chỉ số đếm, không nội dung.
10. **Lệch tài liệu**: `docs/agent.md` §Model và `docs/telemetry.md` ghi model mặc định là `zai/glm-5.2-fast`. Hàng `appSetting` thật đang là `google/gemini-3.7-flash` `[ghi chép]`. Không sai mã, nhưng người đọc doc sẽ ước chi phí sai khoảng 3,7 lần giá vào.

---

## Nguồn ngoài (mức tin)

- Vercel AI Gateway — ZDR: https://vercel.com/docs/ai-gateway/security-and-compliance/zdr (cao)
- Vercel AI Gateway — Observability and Spend: https://vercel.com/docs/ai-gateway/observability-and-spend (cao)
- Vercel AI Gateway — Custom Reporting: https://vercel.com/docs/ai-gateway/observability-and-spend/custom-reporting (cao)
- Vercel AI Gateway — Budgets: https://vercel.com/docs/ai-gateway/observability-and-spend/budgets (cao)
- Catalog model và giá của Gateway: https://ai-gateway.vercel.sh/v1/models (cao, lấy 2026-09-26)
- Neon — pgvector: https://neon.com/docs/extensions/pgvector (cao); pg_search: https://neon.com/docs/extensions/pg_search (vừa)
- Tài liệu eve cài kèm (khớp phiên bản đang dùng): `apps/agent/node_modules/eve/docs/agent-config.md`, `connections/overview.mdx`, `channels/slack.mdx`, `guides/instrumentation.md`, `patterns/multi-tenant-memory.md` (cao)
