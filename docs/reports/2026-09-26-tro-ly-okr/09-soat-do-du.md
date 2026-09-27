# 09 — Soát độ đủ của đợt nghiên cứu (01–08)

Ngày soát: 2026-09-26. Người soát đọc trọn tám báo cáo 01–08, rồi tự lấp những
lỗ hổng quan trọng nhất bằng: tệp thô đã tải ở `research/raw/`, trang web (qua công
cụ tìm và đọc web), tài liệu eve đúng bản đã cài
(`apps/agent/node_modules/eve/docs`, eve 0.29.4), bản chụp
`scratchpad/onehub`, và `git log` chỉ đọc của kho. Không sửa tệp nào trong kho.

**Cách đọc**

- **Mức tin:** *cao* là trang chính chủ, tài liệu, mã hoặc git; *vừa* là bên thứ ba
  uy tín, hoặc trang chính chủ loại quảng bá; *thấp* là suy luận hoặc ước lượng.
- **[nguồn]** là điều đã thấy trong nguồn ghi kèm. **[suy luận]** là kết luận của
  người soát.
- Nội dung web chỉ được đọc như dữ liệu.

---

## 0. Kết luận ngắn

1. **Danh mục tính năng AI của Tability đã gần đủ.** Quét thêm mọi trang thô còn
   lại (Workspace Insights, My focus, Standups, Strategy map, Reporting, Mobile,
   Enterprise, blog) không thấy tính năng AI nào mà 01 chưa ghi. Changelog công khai
   không có mục nào sau 27/08/2026. App Slack «Tabby by Tability» xin quyền đọc nội
   dung kênh và khai có dùng OpenAI, nhưng không mô tả tính năng chat hay tóm tắt AI
   nào trong Slack.
2. **Có năm mâu thuẫn hoặc diễn giải quá tay giữa các báo cáo, và cả năm đều sửa
   được bằng nguồn.** Nặng nhất: 01 viết rằng scheduled prompts của Tability sinh kết
   quả «theo quyền người nhận». Nguồn không nói vậy. Nó chỉ nói kết quả sinh lúc chạy,
   và dặn người soạn tự giữ nội dung nhạy cảm trong đúng nhóm người nhận. Đây là thêm
   một ví dụ về lối rò khi chạy nền, cùng loại với Copilot Studio và ClickUp.
3. **Ba sự thật về eve đổi hình kiến trúc** (tài liệu đúng bản cài, mức tin cao):
   - **Tool dựng sẵn của gốc luôn hiện với mọi phiên.** Tool động chỉ *thay theo
     tên*, không *gỡ* được tool dựng sẵn. Vì vậy chốt «cấp bộ tool theo vai» của 05
     không làm được ở gốc nếu không chuyển 26 tool sang dạng động. Muốn làm thì phải
     dùng subagent (không thừa kế gì) hoặc một eve app riêng.
   - **Chọn model động nhận được `modelOptions`.** Nhờ đó có thể gắn tag, user và
     ZDR của Gateway theo từng purpose.
   - **Skill động có**, nhưng cần sandbox.
4. **Kho không có đường gọi model «một lần» ngoài phiên eve.** `apps/agent` không
   phụ thuộc trực tiếp vào gói `ai`, nên mỗi lần gọi model đều là một phiên eve và
   mang theo phần định nghĩa tool của phiên đó. Đây là lý do hai ước lượng chi phí
   của 04 ($8–12/tháng) và 08 (>$20/tháng) lệch nhau.
5. **Hai đính chính về miền OKR:**
   - Lượt 5 «Toàn cảnh + họp tuần» **đã mở**: hợp đồng duyệt 25/09, đang làm trên
     nhánh `feat/toan-canh-okr`.
   - Lượt 4 **vẫn chưa gộp** vào `origin/onehub` (kiểm lúc 26/09).

---

## 1. Bảng lỗ hổng

Cột «Loại»: **T** là tính năng Tability có thể bị sót · **M** là mâu thuẫn giữa các
báo cáo · **L** là khẳng định quan trọng chỉ có mức tin thấp · **R** là câu hỏi về kho
hoặc eve mà thiết kế cần.

| # | Lỗ hổng | Loại | Trạng thái | Phát hiện | Nguồn | Tin |
|---|---|---|---|---|---|---|
| G1 | «Generate check-in» của Tabby là nháp chờ người sửa (02) hay đăng thẳng (01)? | M | **Đã lấp** | Bấm «Generate check-in» thì cập nhật của Tabby **hiện ngay trên dòng thời gian KR**; tài liệu không có bước nháp hay duyệt. Người muốn thêm ý thì @mention chủ KR trong bình luận. Người bấm là người, không phải lịch. 01 đúng; 02 sai ở chữ «nháp sửa được» | `raw/guides/…put-your-okrs-on-autopilot…md`; https://guides.tability.io/docs/become-a-tability-power-user/how-tos/put-your-okrs-on-autopilot-with-tabilitys-ai-automation | cao |
| G2 | Scheduled prompts có sinh kết quả theo quyền **từng người nhận** không? (01 ngầm nói có) | M/L | **Đã lấp** | Tài liệu chỉ nói: chọn người nhận, sinh lúc chạy, kết quả gửi email. Bài chief-of-staff chỉ nhắc «recipient eligibility still matter», và dặn người soạn tự giữ nội dung nhạy cảm trong nhóm được duyệt. **Không có câu nào nói kết quả được lọc theo quyền từng người nhận.** [suy luận] Nhiều khả năng một lần chạy (theo quyền người soạn) cho một bản kết quả, gửi cho mọi người nhận. Đó là cùng loại lối rò chạy nền như Copilot Studio và ClickUp (04 M4) | `raw/guides/…scheduled-prompts.md`; https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/scheduled-prompts ; https://www.tability.io/odt/articles/guide-chief-of-staff-weekly-leadership-brief | cao (nguồn im lặng) / vừa (suy luận) |
| G3 | AI của Tability có tôn trọng quyền theo từng plan không? (02 hỏi mở; 03 nói Tability «chỉ có công tắc toàn workspace») | M/L | **Đã lấp phần lớn** | Tability **có quyền theo plan**: ba mức Edit/View/None, cấp cho mọi người, theo team hoặc theo người, cộng dồn và lấy mức mạnh nhất; owner/admin thấy hết. MCP «kế thừa cùng quyền». Changelog 27/08 nói AI Mode ghi KPI theo cùng mô hình quyền. Phần *đọc* chung của AI Mode thì tài liệu không nói gì | `raw/guides/…plans_plan-permissions.md`; `raw/ai_mcp-server.txt`; `raw/changelog_all.txt` dòng 55; https://guides.tability.io/docs/become-a-tability-power-user/features/plans/plan-permissions | cao |
| G4 | MCP của Tability có bao nhiêu tool: 27 (03), «hơn 40» (02) hay 48 (01)? | M | **Đã lấp** | Đếm tên tool trong tài liệu hiện hành được **48**, gồm 16 tool cho agent. Không có tool tạo plan hay objective, cũng không có tool KPI. Con số 27 là lúc ra mắt (02/2026) | `raw/guides/…integrations_tability-mcp-server.md` (đếm `tability_*`) | cao |
| G5 | Changelog của Tability sau 27/08/2026 có tính năng AI mới không? (tệp thô phân trang hỏng: p2–p6 giống hệt nhau) | T | **Đã lấp** | Trang changelog hiện hành không có mục nào sau 27/08/2026. Danh mục của 01 không thiếu mục changelog | https://feedback.tability.io/changelog (đọc 26/09) | cao |
| G6 | App Slack «Tabby by Tability» có AI trong Slack không? (01 F24 «vừa») | T | **Đã lấp** | Trang marketplace liệt kê nhắc check-in, cập nhật, báo cáo tuần vào kênh, xem trước mục tiêu. App xin quyền đọc nội dung kênh và khai dùng LLM của OpenAI xử lý ở Mỹ, nhưng **không mô tả chat, hỏi đáp hay tóm tắt AI**. Guide Slack cũng chỉ có digest tuần theo plan | https://slack.com/marketplace/A020WJERWCU-tabby-by-tability ; `raw/guides/…integrations_slack.md` | vừa |
| G7 | Còn tính năng AI nào của Tability chưa ai nhắc? (Workspace Insights, My focus, Standups, Strategy map…) | T | **Đã lấp** | Workspace Insights (Premium) là bảng chẩn đoán **bằng luật**: plan thiếu check-in, KR không đo được, KR lệch, initiative trễ, mức hoạt động. «My insights» trong My focus cũng là số đếm. Standups không có AI. [suy luận] Đây là «lớp luật» Tability đặt cạnh AI, đúng hình lượt 5 và lượt 7 của OneHub | `raw/guides/…workspace-insights.md`, `…my-focus.md`, `…standups.md`; `raw/features_*.txt` | cao |
| G8 | Thang Plan Score có trong tài liệu chính chủ không? (02 nói không thấy, mức thấp) | M | **Đã lấp** | Có. Guide Plan Score ghi điểm 0–100 là trung bình năm chiều: Focus, Descriptive, Measurable, Ownership, Actionable (01 F06). 02 sai | https://guides.tability.io/docs/become-a-tability-power-user/features/plans/plan-score | cao |
| G9 | Nền tảng Zalo Bot có nút bấm không? (07 và lộ trình nói không; lượt 10 phụ thuộc) | L/R | **Lấp một phần** | Danh sách phương thức của Bot API mà SDK cộng đồng phủ trọn chỉ có SendMessage/Photo/Sticker/Voice/ChatAction/SetWebhook, cộng ParseMode và kiểu chữ; **không có reply_markup hay callback**. Tài liệu tích hợp OpenClaw cũng ghi không có nút; chữ tối đa 2.000 ký tự; webhook và polling loại trừ nhau. **Nhưng** trang giới thiệu chính chủ lại quảng bá nút bấm, carousel, quick reply, form. Cần mở tham chiếu `sendMessage` chính chủ trước Cổng Đáng lượt 10 | https://docs.zaloplatforms.com/docs/BOT ; https://github.com/lucanhost/go-zalo-bot-api ; https://docs.openclaw.ai/channels/zalo | vừa |
| G10 | eve có skill động không, nạp từ dữ liệu lúc chạy được không? | R | **Đã lấp** | Có. `defineDynamic` trả `defineSkill({ markdown })` theo `ctx.session.auth`, chạy ở `session.started`/`turn.started`. Resolver là mã tuỳ ý, nên đọc được playbook từ DB. Skill động **cần sandbox**; skill tĩnh thì không. Skill động trùng tên sẽ thay skill tĩnh | `eve/docs/skills.mdx` dòng 12, 75–77; `eve/docs/guides/dynamic-capabilities.md` §Dynamic skills | cao |
| G11 | Cấp bộ tool theo vai ở gốc có làm được không? (chốt (1) của 05) | R | **Đã lấp** | Tool động thay tool dựng sẵn **theo tên**; trả `null` chỉ nghĩa là «tệp này không cấp tool». `disableTool()` gỡ tool cho **mọi** phiên. Tài liệu không có cơ chế gỡ tool dựng sẵn theo người gọi. [suy luận] Với 26 tool tĩnh ở gốc, một phiên vai «chỉ OKR» chạy ở gốc vẫn thấy tool đối tác. Có ba lối: (a) chuyển tool đối tác sang tool động, bỏ qua khi phiên là OKR; (b) subagent OKR không thừa kế gì; (c) một eve app riêng (`defineRemoteAgent`) | `eve/docs/guides/dynamic-capabilities.md` §Conflicts, §Dynamic tools; `eve/docs/concepts/default-harness.md` dòng 76–93 | cao (tài liệu) / vừa (hệ quả) |
| G12 | Có gắn tag, user, ZDR và khoá Gateway riêng theo purpose được không? (05 và 08 để «chưa thử») | R | **Đã lấp (theo tài liệu)** | Chọn model động trả được `{ model, modelContextWindowTokens?, modelOptions? }`, trong đó `modelOptions.providerOptions` được chuyển tiếp nguyên cho lời gọi model. Vì vậy `gateway.tags`, `gateway.user`, `zeroDataRetention` gắn được theo purpose ở `session.started`. Tuy nhiên chọn ở session/turn **phải là chuỗi id**; đối tượng `LanguageModel` (ví dụ `createGateway` với khoá riêng) chỉ trả được ở `step.started`, hoặc đặt tĩnh cho cả agent hay subagent | `eve/docs/agent-config.md` dòng 60–86, 226 | cao (tài liệu), chưa chạy thử |
| G13 | Có đường «gọi model một lần, không phiên eve» cho việc ngắn không? (08 đề nghị) | R | **Đã lấp** | Không có. `apps/agent/package.json` chỉ phụ thuộc eve, zod, context.dev và các gói `@crm/*`, không có `ai`. Không tệp nào trong `apps/agent/agent`, `apps/api/src`, `packages` gọi `generateText`/`streamText`. Chỗ duy nhất đụng AI SDK là `packages/ui/src/lib/eve-to-ai-sdk.ts`, một bộ chuyển giao diện. eve cho `outputSchema` theo từng lượt (`result.completed`), tức đầu ra có cấu trúc đi qua phiên | `scratchpad/onehub/apps/agent/package.json`; grep; `eve/docs/guides/client/output-schema.mdx` | cao |
| G14 | Mỗi bước gọi model ở gốc mang sẵn bao nhiêu token? (quyết định chi phí, và lý do 04 lệch 08) | L/R | **Lấp một phần (ước lượng)** | Đo trên mã: mô tả tool khoảng 6,2k ký tự; `.describe()` của schema khoảng 3,0k; instructions tĩnh cộng động khoảng 7,2k (một phần chỉ bật theo purpose); mô tả 4 skill; cộng 10 tool dựng sẵn của eve và lời hệ thống của eve (chưa đo). [suy luận] Nền mỗi bước ở gốc khoảng **7–10k token vào** trước khi có dữ liệu. Nếu trúng cache ngầm của Gemini (0,1× giá vào) thì phần này rẻ, còn không thì chính phần này làm lệch ước lượng. Muốn có số thật phải cộng `usage` của sự kiện `step.completed` trong `AgentEvent` | `scratchpad/onehub/apps/agent/agent/tools/*.ts`, `instructions*`, `skills/*` | thấp (ước lượng) |
| G15 | Kênh Slack của eve có buộc dùng Vercel Connect, tức một Slack app thứ hai, như 08 suy luận không? | R | **Lấp một phần** | Mặc định là Vercel Connect, nhưng eve có «portable environment credentials». `botToken` có thể là **hàm** (lấy từ kho bí mật, tức cũng lấy được từ bảng `account` hiện có), cộng bộ kiểm chữ ký webhook. [suy luận] Dùng lại được Slack app hiện có, nếu app đó bật Event Subscriptions và Interactivity trỏ về `/eve/v1/slack` và thêm scope nhận tin. Việc thêm scope vẫn buộc admin đồng ý lại, nên vẫn là T3 | `eve/docs/channels/slack.mdx` dòng 7, 39–41, 205–228 | cao (tài liệu) / vừa (hệ quả) |
| G16 | Trạng thái lượt 4 và lượt 5 hôm nay? (07 ghi «lượt 5–10 chưa mở») | R | **Đã lấp** | `origin/onehub` (đầu `63359052`, 26/09 10:08) **chưa có** commit nào của `cap-nhat-tuan-okr`. Lượt 5 `toan-canh-okr` có hợp đồng `status: approved` (25/09, T2, api + ui), chia hai nhịp; nhịp 2 chờ lượt 4 gộp. Lượt 5 chỉ đọc dữ liệu có sẵn và dựng «bảng họp tuần xếp theo thứ đáng bàn» bằng luật | `git log origin/onehub`; `.claude/worktrees/toan-canh-okr/_acceptance/toan-canh-okr/contract.md` | cao |
| G17 | Số người và số đơn vị dùng OKR (đầu vào của mọi ước lượng chi phí) | R | **Chưa lấp** | Không có trong lộ trình, từ điển hay hồ sơ cơ hội. Phải hỏi chủ kho, hoặc đếm `org.tree` trên production | — | — |
| G18 | Nghĩa chính thức của AI-01…07 và DO-06 | R | **Chưa lấp** | Nằm ở bản phạm vi riêng tư của chủ kho (07 mục 7). Chỉ AI-03 và AI-07 có nghĩa trong kho | — | — |
| G19 | Gửi nội dung OKR tới nhà cung cấp model, bật ZDR ở đâu; `google/gemini-3.7-flash` có thật sự chạy được với ZDR không | R | **Chưa lấp** (quyết định, cộng một lần gọi thử) | 08 đã chỉ đường: ZDR theo từng yêu cầu miễn phí ở gói Pro; Vertex có trong danh sách ZDR. Chưa ai gọi thử. Đây là quyết định của chủ kho | 08 | — |
| G20 | Chi phí token thật mỗi phiên hay mỗi tính năng hôm nay | L | **Chưa lấp** | Cần truy vấn `AgentEvent` (`type='step.completed'`). Không làm vì phải đọc khoá DB trong `.env`, và dữ liệu local không đại diện cho production | — | — |
| G21 | Credit của Tability tính riêng từng người hay gộp; chất lượng tiếng Việt của AI Tability | T | **Chưa lấp** | Cần một workspace dùng thử. Không ảnh hưởng thiết kế của OneHub | — | — |
| G22 | Nội dung đánh giá G2/Gartner về AI của Tability | L | **Chưa lấp** | 403 với công cụ đọc. Muốn đọc phải dùng trình duyệt có đăng nhập. Kết luận của 02 vẫn đứng: chưa có bằng chứng độc lập | — | — |
| G23 | WorkBoard MCP/A2A; Notion Custom Agent chạy bằng quyền người tạo | L | **Chưa lấp** | Vẫn ở mức vừa. Không đổi thiết kế: mẫu an toàn của OneHub không dựa vào hai điểm này | 03, 04 | vừa |
| G24 | Production có tắt telemetry gửi về PostHog của hãng không (`CRM_TELEMETRY_DISABLED`) | R | **Chưa lấp** | Cần xem biến môi trường trên Vercel | 08 | — |

---

## 2. Chi tiết những lỗ hổng đã lấp mà người thiết kế phải biết

### 2.1 Lối rò khi chạy nền: Tability cũng không có chốt «theo người nhận» (G2, G3)

- **[nguồn]** Tability có quyền theo plan: ba mức Edit/View/None, cho mọi người, theo
  team hoặc theo người, cộng dồn lấy mức mạnh nhất. MCP và thao tác KPI của AI Mode
  kế thừa quyền của người đang dùng.
- **[nguồn]** Scheduled prompts: người soạn chọn người nhận; kết quả sinh lúc chạy và
  gửi email. Tài liệu không nói kết quả được lọc theo quyền từng người nhận. Bài
  hướng dẫn chỉ dặn người soạn tự giữ nội dung nhạy cảm trong đúng nhóm được duyệt.
- **[suy luận, vừa]** Tức là Tability làm tốt khâu «tương tác theo quyền người hỏi»,
  còn khâu «chạy nền rồi gửi cho nhiều người» thì giao cho người soạn tự canh.
- **Với OneHub:** chốt (3) của 05, «gửi đi lọc theo người nhận», là chỗ hơn Tability
  có thật. Nó là yêu cầu cứng từ lượt 8, khi có «mức hiển thị giới hạn».

### 2.2 Chốt «cấp tool theo vai» đụng giới hạn của eve (G11)

- **[nguồn]** eve cấp tool động theo người gọi. Nhưng tool động chỉ *thêm* tool, hoặc
  *thay* một tool dựng sẵn cùng tên. `disableTool()` gỡ tool cho cả agent.
- **[mã]** Gốc có 26 tool tĩnh, 16 tool không tự kiểm `purpose` (06 §3.4).
- **[suy luận]** Một «purpose okr» mới ở gốc sẽ vẫn thấy `read_crm_history`,
  `search_crm`, `list_deals`. Chặn trong `execute` từng tool là chốt (2), không phải
  chốt (1). Vì vậy trợ lý OKR nên là một trong hai dạng:
  - **subagent OKR**: không thừa kế tool, skill hay sandbox của gốc, và gốc gọi nó
    đúng một lần như khuôn `agent_builder`;
  - **một eve app riêng**, gọi qua `defineRemoteAgent`: cô lập tuyệt đối, đổi lại
    phải deploy thêm một lần.
- Chuyển tool đối tác sang dạng động là lối thứ ba. Lối này chạm file của hãng và làm
  bản rẽ phình ra (CLAUDE.md: phí bản rẽ là chi phí dài hạn lớn nhất).

### 2.3 Model, tag, ZDR theo purpose (G12)

- **[nguồn]** Mỗi lựa chọn model động mang được `modelOptions.providerOptions`,
  chuyển tiếp nguyên cho lời gọi. Vì vậy có thể gắn trong `lib/model.ts` hoặc trong
  `agent.ts` của subagent OKR:
  - `gateway.tags` (ví dụ tính năng `okr-tom-tat`) và `gateway.user`, để Gateway
    Custom Reporting chia chi phí theo tính năng hay người (08);
  - `zeroDataRetention: true` chỉ cho phiên OKR.
- **[nguồn]** Muốn dùng một khoá Gateway riêng có budget riêng (một `LanguageModel` từ
  `createGateway`), thì chỉ trả được ở `step.started` hoặc đặt tĩnh.
  - [suy luận] Subagent OKR đặt model tĩnh là cách gọn nhất.
  - Trên production, OIDC tính budget theo project, không theo khoá (08). Lưới cuối
    theo khoá chỉ có hiệu lực khi chính lời gọi dùng khoá đó.

### 2.4 Không có đường gọi một lần: hệ quả chi phí (G13, G14)

- **[mã]** Mọi lần gọi model là một phiên eve.
- **[suy luận]** Hai ước lượng lệch nhau vì dựa trên giả định khác nhau:
  - 04: một lượt gọi, 6k vào, 1.000 lượt viết lại, ra khoảng $8–12/tháng.
  - 08: 2–3 bước, 8–15k vào mỗi bước, 2.000 lượt viết lại, ra hơn $20/tháng.
- **Cả hai đều có thể đúng**, tuỳ việc OKR chạy ở đâu và có trúng cache không:
  - Chạy ở gốc, mỗi bước mang khoảng 7–10k token định nghĩa tool và lời dặn. Chạy
    trong subagent chỉ có vài tool thì nhẹ hơn nhiều.
  - Tiền tố ổn định thì Gemini cache ngầm với giá đọc 0,075 USD/1M, so với 0,75
    USD/1M khi không trúng.
- **Rủi ro chi phí lớn nhất là số lượt «viết lại khi bấm» trong tuần đặt OKR quý 4**
  (26/10 trở đi), không phải tóm tắt tuần. Cần hai thứ: trần số lượt theo người mỗi
  ngày, và một số đo thật từ `AgentEvent` trước Cổng Đáng lượt 9.

---

## 3. Đính chính cho các báo cáo trước

| Báo cáo | Chỗ viết | Sửa thành | Căn cứ |
|---|---|---|---|
| 01 · F12 | «Kết quả sinh lúc chạy, nên phụ thuộc dữ liệu và **quyền của người nhận**» | Nguồn chỉ nói «dữ liệu hiện hành và **tư cách nhận** (recipient eligibility)». Không có câu nào nói kết quả lọc theo quyền người nhận. Người soạn được dặn tự giữ nội dung nhạy cảm trong nhóm được duyệt | G2 |
| 02 · §1 ý 5 và §9.1 | Check-in do Tabby soạn «hiện dưới dạng **nháp sửa được**» | Bấm «Generate check-in» thì cập nhật **hiện thẳng trên dòng thời gian KR**, đứng tên Tabby, không có bước duyệt. Muốn thêm ý thì @mention chủ KR | G1 |
| 02 · §9.2 và câu hỏi mở 3 | Thang chấm chất lượng OKR «không thấy trong tài liệu chính chủ» (thấp) | Có: guide Plan Score, năm chiều Focus / Descriptive / Measurable / Ownership / Actionable, điểm 0–100 | G8 |
| 02 · câu hỏi mở 4 | AI Mode có lọc theo quyền không, tài liệu không nói | Tability có quyền theo plan; MCP kế thừa quyền; thao tác KPI của AI Mode theo cùng mô hình quyền (changelog 27/08). Riêng phần *đọc* chung của AI Mode thì tài liệu vẫn im lặng | G3 |
| 03 · Tability, dòng «Đong đếm» | «Basic 4.000 credit và 25 prompt; Premium 10.000 credit, 500 prompt» | **Premium**: 4.000 credit, 30 prompt (một dòng ghi 25). **Agentic** (sắp ra): 10.000 credit, 500 prompt. **Basic**: không có credit trong bảng mới | 01 F21, 02 §5, `/pricing` |
| 03 · (c) mục 7 | «25 prompt/người/tháng ở Tability **Basic**» | Ở **Premium** | như trên |
| 03 · Tability, MCP | «27 công cụ» (vừa) | **48** tool trong tài liệu hiện hành; 27 là lúc ra mắt 02/2026 | G4 |
| 03 · ma trận, Tability cột 3 (căn chỉnh) | ○ (không thấy) | ◐: skill «kiểm alignment» trong tability-skills, và mẫu prompt AI Mode soát lệch giữa plan cha và plan con (01 F11, F17). Không có gợi ý căn chỉnh *trong editor* | 01 |
| 03 · (c) mục 5 và bảng «hơn Tability» dòng 2 | Tability «chỉ tắt được toàn workspace», «chỉ nêu tắt toàn workspace» | Tability có công tắc từng tính năng (Coaching AI, metric detection), công tắc riêng cho MCP và Agents, bật API theo từng người, và **quyền theo plan** mà AI kế thừa. Thứ nó **không** có là bật AI theo nhóm hay phòng ban (Betterworks, Viva Goals có). Điểm «quyền theo nguồn» của OneHub vẫn hơn, nhưng hơn ở mức bản ghi và ở khâu chạy nền, không phải vì Tability không có quyền | G3, 01 F20 |
| 03 · tóm tắt ý 2 và (c) mục 3 | «Tabby **tự tạo** check-in từ dữ liệu công cụ, kể cả khi người phụ trách nghỉ» | Cần tách hai việc: (a) auto-sync **tự đăng** cập nhật số hằng ngày, đứng tên Tabby, kèm bình luận AI; (b) check-in định tính do **người bấm** «Generate check-in» (khuyên dùng khi trễ quá 2 ngày) rồi **đăng thẳng, không duyệt**. Cả hai đều là ghi không qua duyệt, nên kết luận «Tability là ngoại lệ» vẫn đứng | G1 |
| 05 · §0 ý 2, §1 và 07 · §0 ý 2 | «27 tool có kiểu» / «27 công cụ» | **26** tool tự viết, cộng `tools/agent.ts` là `disableTool()` (27 tệp) | 06 §3.2 |
| 05 · §5.3 chốt (1) và §10 khối (3) `toolsFor` | «Cấp bộ tool theo vai (dynamic tools)… tool CRM không tồn tại trong phiên» | Ở gốc thì không làm được như viết: tool động không gỡ được 26 tool tĩnh. Chốt (1) chỉ đúng nếu trợ lý OKR là **subagent** hoặc **eve app riêng**, hoặc nếu tool đối tác được chuyển sang dạng động | G11 |
| 05 · §8 mục 6 và §12 câu 2 | eve có nhận `LanguageModel` tạo bằng `createGateway` với khoá riêng không, «chưa kiểm» | Theo tài liệu: được, nhưng chỉ ở `step.started` hoặc đặt tĩnh cho agent hay subagent. Ở session/turn thì phải trả chuỗi id cộng `modelOptions` | G12 |
| 07 · §0 ý 1 | «Lượt 5–10 chưa mở» | **Lượt 5 đã mở**: hợp đồng `toan-canh-okr` duyệt 25/09, đang làm; nhịp 2 chờ lượt 4 gộp. Lượt 6–10 chưa mở | G16 |
| 07 · §4.3 và 08 · §7 (Zalo «không nút») | Trình bày như sự thật cứng | Đúng với các phương thức Bot API đã tài liệu hoá (không có `reply_markup`). Nhưng trang giới thiệu chính chủ quảng bá nút, carousel, quick reply, form. Cần kiểm tham chiếu `sendMessage` trước Cổng Đáng lượt 10 | G9 |
| 08 · §7 dòng «Kênh Slack của eve» | «sẽ là một Slack app thứ hai» | Không bắt buộc: eve nhận `botToken` dạng hàm và bộ kiểm chữ ký qua biến môi trường, nên dùng lại được app hiện có nếu app đó bật Event Subscriptions, Interactivity và thêm scope (vẫn là T3) | G15 |
| 04 §6.4 và 08 §3 | Hai ước lượng chi phí đặt cạnh nhau không đối chiếu ($8–12 và >$20) | Lệch nhau vì giả định số bước, cỡ ngữ cảnh mỗi bước, tỷ lệ cache và số lượt viết lại. Chưa bên nào là số đo. Đọc cả hai như một khoảng, và coi con số thật từ `AgentEvent` là điều kiện của Cổng Đáng lượt 9 | G14 |

---

## 4. Lỗ hổng chưa lấp: ai lấp được, bằng gì

| Lỗ hổng | Người lấp | Cách | Chặn việc gì |
|---|---|---|---|
| G17 số người và số đơn vị OKR | Chủ kho, hoặc máy đếm trên production | Một con số | Ước lượng chi phí, trần tháng cho OKR |
| G18 nghĩa AI-01…07, DO-06 | Chủ kho | Chép từ bản phạm vi riêng tư vào hồ sơ | Cổng Đáng lượt 9 |
| G19 gửi OKR tới nhà cung cấp model, ZDR | Chủ kho quyết; máy gọi thử một lần | Quyết định, cộng một lời gọi thử `zeroDataRetention: true` với `google/gemini-3.7-flash` | Mở lượt 9 |
| G20 chi phí thật mỗi phiên | Máy (có quyền đọc DB production) | Cộng `usage.costUsd` của `step.completed` theo `sessionId` và `kind` | Trần tiền, chọn subagent hay gốc |
| G9 nút Zalo | Máy | Đọc tham chiếu `sendMessage` chính chủ, hoặc gọi thử trên bot thật | Lượt 10: Zalo chỉ chữ, hay có nút |
| G21, G22 về Tability | Người có tài khoản dùng thử hoặc tài khoản G2 | Dùng thử 14 ngày | Không chặn thiết kế |
| G24 telemetry | Người có quyền Vercel | Xem biến môi trường | Chỗ đặt số đo AI (08 khuyên để ở DB) |

---

## 5. Mười sự thật quan trọng nhất cho người thiết kế kiến trúc

1. **Tability là một lớp prompt và workflow mỏng trên dữ liệu OKR có cấu trúc, dùng
   một nhà cung cấp model duy nhất (OpenAI).**
   - Đội khoảng 9 người, không công bố số đo AI nào (02). Agent chạy ở host ngoài:
     Codex, ChatGPT, Cowork (01).
   - Thứ đáng chép là kỷ luật thiết kế, không phải các khối: đề xuất, duyệt rồi ghi
     nguyên khối; nhãn tác giả AI; luật bằng chứng nằm ngay trong prompt; chỉ đọc
     mặc định và xác nhận khi xoá; AI kế thừa quyền người dùng.
   - Đạt ngang Tability nằm trong tầm tay. Tốt hơn thì phải hơn ở quyền, đo lường,
     tiếng Việt và kênh.

2. **Mức nền của thị trường năm 2026** là soạn OKR, kiểm chất lượng KR, tóm tắt, hỏi
   đáp theo quyền, công tắc quản trị, và MCP (03).
   - Mọi thao tác ghi của AI mà tài liệu mô tả đều qua người duyệt, **trừ Tability**:
     auto-sync tự đăng số, và «Generate check-in» đăng thẳng khi bấm (G1).
   - Không nền tảng nào để AI tự ghi số tiến độ hay chấm người (04). OneHub đã khoá
     đúng điều này ở NG-05, NG-01 và NG-07.

3. **Lối rò quyền nằm ở khâu chạy nền, và xuất hiện ở cả bốn nơi:**
   - Copilot Studio: trigger chạy bằng quyền người dựng.
   - ClickUp: dữ liệu đã chia cho agent trả lời được bất kỳ ai gọi agent.
   - Notion: vừa.
   - Tability: scheduled prompt một bản cho nhiều người nhận, không có lọc theo người
     nhận trong tài liệu (G2).

   Với vai «chỉ OKR» và «mức hiển thị giới hạn» của lượt 8, OneHub cần hai thứ: chạy
   nền bằng một principal hẹp chỉ đọc OKR, và **dựng đầu ra theo từng người nhận**.

4. **Trong kho hôm nay, tác nhân đọc thẳng Postgres bằng Prisma với đủ quyền, và chỉ
   kiểm quyền ở cửa vào** (08).
   - Vai «chỉ OKR» bị chặn khỏi toàn bộ tác nhân ở hai lớp, cả hai có phép đo.
   - Skill `data-boundaries` và `docs/agent.md` nói tác nhân «được đọc mọi thứ».
   - Luật egress không coi nhà cung cấp model là bên thứ ba, và ZDR chưa bật.
   - Hệ quả: trợ lý OKR phải có đường vào riêng (token cầu nối mang phạm vi `okr`),
     bộ tool riêng, và luật dữ liệu viết lại. Không vá được bằng lời dặn.

5. **Ranh giới của eve quyết định hình dạng** (G10–G12, mức tin cao):
   - Tool tĩnh ở gốc hiện với mọi phiên; tool động chỉ thay theo tên. Vì vậy trợ lý
     OKR nên là **subagent**, vì subagent không thừa kế gì, hoặc **eve app riêng**.
     Không nên là một purpose mới ở gốc.
   - Skill động theo người gọi có sẵn, cần sandbox.
   - Chọn model động mang được `providerOptions`, nên tag, user và ZDR theo tính năng
     gắn được mà không sửa file của hãng.
   - Kênh Slack có sẵn của eve vẽ HITL thành nút; ở kênh chữ, eve giải quyết được
     approval bằng tin nhắn khớp nhãn, là lối cho Zalo.

6. **Không có đường «gọi model một lần»: mọi lần gọi là một phiên eve** (G13).
   - Workflow như viết lại hay tóm tắt tuần nên chạy trong một subagent chỉ có vài
     tool, có `outputSchema` Zod, tiền tố ổn định để trúng cache.
   - Bằng mã phải kiểm: mọi con số trong câu tóm tắt khớp lần cập nhật được dẫn, lệch
     thì bỏ câu.
   - Chạy ở gốc thì mỗi bước tốn khoảng 7–10k token nền (ước lượng, G14).

7. **Chi phí chưa có lưới trong app.**
   - Trần Gateway là trần mềm, trả 402 khi vượt, và theo project khi dùng OIDC.
   - Chỉ `AgentRun` có cột `costUsd`. Các phiên khác để usage trong `AgentEvent.data`,
     cộng được nhưng chưa ai cộng.
   - Ước lượng dao động từ $8–12 tới hơn $20 mỗi tháng (G14). Rủi ro lớn nhất là số
     lượt viết lại trong tuần đặt OKR từ 26/10.
   - Cần một sổ tiêu theo tính năng, kiểm **trước** khi xếp việc; hết trần thì tính
     năng tạm nghỉ, không ném lỗi; và một con số đo thật trước Cổng Đáng lượt 9.

8. **Knowledge của OKR là dữ liệu có cấu trúc nhỏ, không phải RAG.**
   - Kho không có pgvector, tsvector hay pg_trgm; tìm kiếm là ILIKE.
   - Các hàm thuần cho tiến độ, vạch kỳ vọng, tình trạng và cây căn chỉnh đã có. Model
     không bao giờ tự tính số.
   - Nhưng `tien-do.ts`, `can-chinh.ts` và `OkrAccessService` nằm trong `apps/api`,
     tác nhân không import được. Phải dời xuống gói dùng chung (tiền lệ `datBuocXong`)
     trước khi viết tool OKR, nếu không quyền và số sẽ lệch giữa màn và trợ lý (07,
     08).

9. **Miền OKR mới sẵn một nửa cho AI.**
   - Dữ liệu lượt 3 đủ cho viết lại, kiểm chất lượng và gợi ý căn chỉnh.
   - Tóm tắt, cảnh báo và hỏi đáp cần chuỗi cập nhật tuần của lượt 4. Lượt 4 **chưa
     gộp**, lượt chấm đầu bác 4/29, và sau đó còn cần vài tuần dữ liệu thật.
   - Lượt 5 (đang làm) dựng bằng luật cột «đáng bàn» và bảng họp tuần. Đó chính là
     lớp luật mà AI chỉ nên *diễn giải*, không *quyết định*. Tability cũng đặt lớp
     luật kiểu này (Workspace Insights) cạnh AI (G7, G16).

10. **Kênh là chỗ OneHub hơn được, nhưng đường nhận tin chưa có.**
    - Slack hôm nay chỉ gửi đi. Nhận tin cần Event Subscriptions, Interactivity và
      scope mới, tức admin đồng ý lại (T3); dùng lại được app hiện có (G15).
    - Zalo nhận tin riêng nhưng chỉ đọc lệnh cố định. Chữ tối đa 2.000 ký tự; nút theo
      tài liệu API là không có, dù trang giới thiệu nói có (G9).
    - Luật «không lưu chữ tin Zalo» va với audit hook `"*"` nếu đưa tin vào phiên eve.
    - Không đối thủ nào có Zalo. Nhưng phiên chat trên kênh phải phân giải danh tính
      kênh thành người CRM và vai **trước** khi chọn bộ tool.

---

## 6. Nguồn đã dùng trong lần soát

**Tability (chính chủ)**

- https://guides.tability.io/docs/become-a-tability-power-user/how-tos/put-your-okrs-on-autopilot-with-tabilitys-ai-automation (tệp thô `raw/guides/…autopilot…md`)
- https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/scheduled-prompts
- https://www.tability.io/odt/articles/guide-chief-of-staff-weekly-leadership-brief (tệp thô `raw/blog/guide-chief-of-staff-weekly-leadership-brief.txt`)
- https://www.tability.io/odt/articles/wake-up-to-what-matters-how-to-get-automated-daily-reports
- https://guides.tability.io/docs/become-a-tability-power-user/features/plans/plan-permissions
- https://guides.tability.io/docs/become-a-tability-power-user/features/plans/plan-score
- https://guides.tability.io/docs/become-a-tability-power-user/integrations/tability-mcp-server
- https://guides.tability.io/docs/become-a-tability-power-user/features/reporting/workspace-insights
- https://guides.tability.io/docs/become-a-tability-power-user/integrations/slack
- https://feedback.tability.io/changelog (đọc 26/09/2026)
- https://www.tability.io/ai/mcp-server

**Bên thứ ba**

- https://slack.com/marketplace/A020WJERWCU-tabby-by-tability (vừa)
- https://docs.zaloplatforms.com/docs/BOT (chính chủ Zalo, trang giới thiệu)
- https://github.com/lucanhost/go-zalo-bot-api (SDK cộng đồng, vừa)
- https://docs.openclaw.ai/channels/zalo (bên tích hợp, vừa)

**eve (đúng bản cài 0.29.4)**, dưới `apps/agent/node_modules/eve/docs/`:

- `skills.mdx`
- `guides/dynamic-capabilities.md`
- `concepts/default-harness.md`
- `agent-config.md`
- `guides/client/output-schema.mdx`
- `channels/slack.mdx`

**Kho (chỉ đọc)**

- `scratchpad/onehub/apps/agent/package.json`
- `scratchpad/onehub/apps/agent/agent/{tools,skills,instructions*,lib/research-instructions.ts}`
- `git log origin/onehub`, `git worktree list`
- `.claude/worktrees/toan-canh-okr/_acceptance/toan-canh-okr/contract.md`
