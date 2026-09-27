# 04 — Các nền tảng làm việc lớn tổ chức AI thành kiến trúc mở rộng được, và áp vào goals/OKR ra sao

Viết 2026-09-26. Phạm vi: Atlassian (Rovo + Goals), Asana, Notion, Microsoft
(Copilot Studio, declarative agents), Salesforce Agentforce, HubSpot Breeze /
Agent Hub, ClickUp, monday, Glean, Linear. Kết bằng **Mẫu chung** và **Áp vào
CRM OneHub**.

**Cách đọc mức tin**

- **cao**: trang chính chủ hoặc tài liệu chính thức (đã đọc trang, hoặc đọc đoạn
  trích của chính trang đó khi trang chặn công cụ đọc; chỗ nào chỉ đọc đoạn trích
  thì ghi «trích đoạn»).
- **vừa**: bên thứ ba uy tín (báo, đối tác triển khai, blog phân tích).
- **thấp / suy luận**: điều tôi rút ra, không có nguồn nói thẳng.

Mọi con số giá là giá niêm yết đọc được hôm nay, không phải báo giá.

---

## 0. Tóm tắt

1. **Cả mười nền tảng hội tụ về cùng một bộ phận:** agent = *instructions +
   knowledge + tools/actions + skills + triggers*, được khai như **cấu hình có
   phiên bản** chứ không phải mã. Khác nhau ở chỗ ai được dựng agent và agent
   chạy dưới danh tính của ai.
2. **«Skill» đã tách khỏi «tool» ở cả Atlassian lẫn Microsoft:** tool là một
   hành động có kiểu (GET/CREATE/UPDATE/DELETE); skill là *cách làm* viết bằng
   Markdown, nạp khi cần (progressive disclosure). Microsoft Copilot Studio dùng
   hẳn spec mở `SKILL.md` (agentskills.io). Kho CRM đang có đúng hình này ở
   `apps/agent/agent/skills/*.md`.
3. **Permission-aware retrieval là mặc định ở mọi nơi nghiêm túc** (Rovo, Microsoft,
   Glean, Salesforce, Notion connectors): agent chỉ đọc cái *người hỏi* được đọc.
   Chỗ vỡ nằm ở **chạy nền**: Copilot Studio buộc dùng quyền của người dựng
   agent, ClickUp cho agent trả lời bằng dữ liệu mà người hỏi không có quyền xem.
   Cả hai tự ghi cảnh báo trong tài liệu. Đây là rủi ro trực tiếp của vai «chỉ OKR».
4. **Ghi dữ liệu luôn có cổng:** trong chat thì hỏi người trước khi chạy tool có
   tác động (Rovo, Notion «Always ask», Copilot Studio). Khi chạy nền thì hoặc cấm
   hẳn (Rovo: agent do automation gọi không được dùng action CREATE/UPDATE/DELETE),
   hoặc chỉ cho các tool đã được admin đưa vào danh sách trắng (Glean).
5. **Với goals/OKR, AI của các ông lớn khá khiêm tốn:** soạn nháp bản cập nhật
   tình trạng từ hoạt động gần đây rồi người sửa và bấm đăng (Atlassian, Asana),
   gợi ý viết mục tiêu cho sắc (Asana smart goals), hỏi đáp trên goals (ClickUp,
   Rovo button), gửi bản tóm tắt định kỳ theo người đọc (Linear Pulse). **Không
   nơi nào để AI tự ghi số tiến độ hay tự chấm người.** Microsoft còn chặn hẳn
   việc AI suy diễn về hiệu suất nhân viên.
6. **Tiền được đo bằng credit, có trần theo agent và theo workspace, báo ở
   80%/100% và tự dừng khi cạn** (Notion, Rovo, Copilot Studio). Với ngân sách
   ~$20/tháng, chỗ đáng chép là cơ chế trần + tự dừng, không phải bảng giá.

---

## 1. Khung so sánh

Mỗi nền tảng được đọc theo tám chiều:

| Chiều | Câu hỏi |
| --- | --- |
| Đơn vị mở rộng | Agent là gì? Skill / tool / action là gì? Knowledge là gì? |
| Quản trị | Ai được dựng, ai duyệt, admin khoá cái gì? |
| Quyền dữ liệu | Agent đọc theo quyền của ai: người hỏi, người dựng, hay danh tính riêng? |
| Lịch / sự kiện | Agent chạy không cần người gọi thế nào? |
| Đánh giá | Có test set, grader, nhật ký chạy không? |
| Human-in-the-loop | Hành động ghi được người duyệt ở đâu? |
| Giá | Đo bằng gì, trần ra sao? |
| Goals/OKR | Áp AI vào mục tiêu thế nào? |

---

## 2. Từng nền tảng

### 2.1 Atlassian — Rovo (agents, skills, tools, Studio) + Goals

**Đơn vị mở rộng**

- **Agent** gồm identity (tên, mô tả), behavior (instructions: mục tiêu, giới
  hạn, giọng), knowledge, skills và **subagents**. Nguồn:
  [What are agents? — Rovo Studio](https://support.atlassian.com/studio/docs/what-are-agents/) · cao.
- **Subagent** là một «kịch bản» nằm trong agent. Mỗi subagent có trigger,
  instructions, knowledge và tools riêng, nên cùng một agent cư xử khác nhau tuỳ
  thứ đã gọi nó.
  [Knowledge sources for Rovo subagents](https://support.atlassian.com/rovo/docs/knowledge-sources-for-agents/) · cao.
- **Tool** = một hành động riêng lẻ: tool dựng sẵn cho Jira/Confluence/JSM,
  tool bên thứ ba (Gmail, Google Calendar), và tool do nhà phát triển viết bằng
  Forge.
  [Add tools to Rovo agents](https://support.atlassian.com/rovo/docs/agent-actions/) · cao.
  Ở tầng mã, Forge `action` bắt buộc khai `actionVerb` ∈ {GET, CREATE, UPDATE,
  DELETE, TRIGGER}, có `inputs` định kiểu và `description` để agent biết lúc nào
  gọi; module `rovo:mcp` đưa action ra ngoài dưới dạng MCP tool.
  [Forge action module](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/) · cao.
- **Skill** = cách tiếp cận một loại việc, điều phối nhiều tool bằng suy luận.
  Skill dựng sẵn gồm *Write status update*, *Create work items*, *Create action
  plan*, *Write PRD*, *Summarize incident*. Thêm skill vào agent thì các tool nó
  cần đi theo.
  [Add skills to Rovo agents](https://support.atlassian.com/rovo/docs/add-skills-to-rovo-agents/) · cao.
  Trong Rovo Chat, skill được gọi bằng `/tên-skill`, bằng nút `+`, hoặc bằng lời
  thường.
  [Use skills in a chat](https://support.atlassian.com/rovo/docs/use-skills-in-a-chat/) · cao.
  Rovo Dev CLI đọc skill từ file `SKILL.md` (YAML frontmatter + thân Markdown),
  nạp theo `description`.
  [Extend Rovo Dev CLI with Agent Skills](https://support.atlassian.com/rovo/docs/extend-rovo-dev-cli-with-agent-skills/) · cao (trích đoạn).
  Một hướng dẫn bên thứ ba ghi rằng Atlassian khuyên mỗi agent dùng dưới năm skill.
  [eesel](https://www.eesel.ai/blog/rovo-agent-skills) · vừa.
- **Knowledge** có bốn chế độ: *toàn bộ tri thức tổ chức* qua Teamwork Graph
  (mặc định); *custom knowledge* (chọn space Confluence, project Jira, JSM, Google
  Drive); *web search* (nếu admin bật); hoặc *không knowledge* (agent chỉ dùng
  tool). [Knowledge sources](https://support.atlassian.com/rovo/docs/knowledge-sources-for-agents/) · cao.
- **Rovo Studio** hợp nhất (Team '26, 06/05/2026) gồm ba khối: Agents (có
  analytics và kiểm thử hiệu năng), Automations (không cần viết mã, trải qua
  Jira/Confluence/JSM và app ngoài) và Apps (beta, sinh app Forge từ prompt).
  Studio nối MCP và giữ audit trail ở một chỗ.
  [Atlassian blog](https://www.atlassian.com/blog/company-news/rovo-studio-team-26) · cao.

**Quyền dữ liệu:** agent không trả lời bằng thông tin từ nguồn mà người hỏi
không có quyền xem, vì nó hành động thay người đó. Tool cũng chỉ làm được việc mà
chính người dùng được làm.
([knowledge](https://support.atlassian.com/rovo/docs/knowledge-sources-for-agents/),
[tools](https://support.atlassian.com/rovo/docs/agent-actions/)) · cao.

**Lịch / sự kiện:** gắn agent vào automation bằng hành động *Use agent*. Trigger
là sự kiện của app hoặc lịch (ví dụ mỗi sáng phân tích việc ưu tiên cao rồi gửi
Slack). Người dựng thêm một prompt riêng cho từng rule, và màn cấu hình agent có
mục *Triggers* liệt kê mọi rule đang gọi agent.
[Automate Rovo agents](https://support.atlassian.com/rovo/docs/agents-in-automations/) · cao.

**Human-in-the-loop**

- Trong chat, agent **hỏi xác nhận trước khi chạy tool có tác động** làm đổi dữ
  liệu. [tools](https://support.atlassian.com/rovo/docs/agent-actions/) · cao.
- Trong automation, **agent không gọi action CREATE/UPDATE/DELETE/TRIGGER**
  ([Forge](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/) · cao).
  Có thể chặn ghi hẳn; khi đó đầu ra đi tiếp qua giá trị `{{agentResponse}}` sang
  một bước automation tất định.
  [Automate Rovo agents](https://support.atlassian.com/rovo/docs/agents-in-automations/) · cao.

**Đánh giá:** Studio có analytics và kiểm thử hiệu năng cho agent
([blog](https://www.atlassian.com/blog/company-news/rovo-studio-team-26) · cao).
Tôi không thấy tài liệu công khai về grader.

**Giá:** credit gộp ở cấp tổ chức; mỗi người dùng/tháng được 25–250 (Standard),
70–700 (Premium), 150–1.500 (Enterprise) tuỳ sản phẩm. Search, định nghĩa, tóm
tắt thì miễn phí; câu trả lời thường và agent cơ bản tốn 10 credit. Từ
**03/12/2026** tính phần vượt $0,01/credit; admin đặt trần hoặc tắt, được báo ở
80% và 100%. Deep research tốn tới 15 phút và bị giới hạn 30 lượt/người/ngày.
([usage](https://support.atlassian.com/rovo/docs/rovo-usage-limits/),
[knowledge](https://support.atlassian.com/rovo/docs/knowledge-sources-for-agents/)) · cao.

**Goals/OKR**

- Goals có **goal types** do admin khai; mặc định có kiểu *Objective* với thước
  đo *Key result*, triển khai từ 01/12/2025.
  [What are goal types?](https://support.atlassian.com/platform-experiences/docs/what-are-goal-types/) · cao (trích đoạn).
- **Rovo soạn nháp bản cập nhật tình trạng** cho project và goal từ hoạt động gần
  đây trong các app đã nối. Người đọc lại rồi mới lưu hoặc đăng. Có thêm nút
  «Shorten». Bản beta triển khai từ giữa tháng 3.
  [Create status updates with Rovo](https://support.atlassian.com/platform-experiences/docs/create-project-updates-with-rovo/) · cao.
- **Nút Rovo theo ngữ cảnh** trên trang Goals/Projects để tóm tiến độ, nêu rủi
  ro, soạn cập nhật. **Bộ skill Goals & Projects trong Studio** cho agent tìm
  goal, lấy cập nhật, hiểu phụ thuộc, nêu rủi ro và tạo cập nhật tiến độ, nhằm
  dựng agent canh danh mục.
  [Atlassian Community](https://community.atlassian.com/forums/Goals-and-Projects-articles/More-ways-to-bring-Rovo-to-your-Goals-and-Projects-workflow/ba-p/3252435) · cao (trích đoạn; trang chặn công cụ đọc).

---

### 2.2 Asana — AI Studio, AI Teammates, Dash, smart goals / smart status

**Đơn vị mở rộng**

- **AI Studio** = workflow không cần viết mã: đặt trigger (task mới, form, sự kiện
  project), mô tả việc bằng lời thường, rồi để chạy. Các khối điển hình là
  Check / Classify / Route. Model đến từ OpenAI và Anthropic; admin quy định
  dữ liệu nào AI được tham chiếu. Có ba bậc Basic / Plus / Pro.
  [AI Studio](https://asana.com/product/ai/ai-studio) · cao.
- **AI Teammates** = agent cộng tác, có hơn 30 mẫu dựng sẵn và trình dựng agent
  riêng. Cấu hình gồm instructions và ví dụ, **skill bundle** theo vai trò, và
  connector (Gmail, Slack, Drive, Office, HubSpot, Databricks, Figma). Agent có
  **memory** học từ phản hồi. Quyền đi theo quyền Asana hiện có. Kích hoạt bằng
  giao việc, @mention hoặc lịch, và có **checkpoint cho người duyệt** trước khi
  thực thi. [AI Teammates](https://asana.com/product/ai/ai-teammates) · cao.
  Bản xem trước công khai từ 25/09/2025, dự kiến GA đầu 2026, với quỹ credit riêng.
  [Computerworld](https://www.computerworld.com/article/4063082/asana-puts-ai-teammate-agents-to-work.html) · vừa.
- **Asana Dash** («AI chief of staff») chuyển việc tới AI Teammate phù hợp. Asana
  cũng mở **MCP / AI connectors** để ChatGPT, Claude, Gemini làm việc trên dữ liệu
  Asana. [Asana AI](https://asana.com/product/ai) · cao.
- Nền dữ liệu chung là **Work Graph**. [Asana AI](https://asana.com/product/ai) · cao.

**Quyền dữ liệu:** AI Teammates theo quyền Asana; admin chọn ai được tạo, sửa,
cộng tác với agent. [AI Teammates](https://asana.com/product/ai/ai-teammates) · cao.
Tôi không tìm thấy mô tả chi tiết về việc agent chạy theo lịch thì dùng quyền của ai.

**Giá:** AI Studio Plus có 100.000 credit/tháng, khoảng $150/tháng nếu trả theo tháng.
[Asana Help — AI Studio Plus](https://help.asana.com/s/article/ai-studio-plus?language=en_US) · vừa (trích đoạn; trang dựng bằng JS).

**Goals/OKR** — Asana là nền tảng làm AI cho goals rõ nhất:

- **Smart status cho goals:** trên trang goal chọn *Draft update with AI*, gom từ
  subgoal, portfolio, project được chọn; nêu rủi ro, câu hỏi mở, điểm nghẽn;
  người thêm *guidance*, sửa, rồi *Discard* hoặc *Post*. Công bố 07/03/2024, gói
  Advanced trở lên.
  [Asana Forum](https://forum.asana.com/t/new-ai-powered-smart-status-for-portfolios-and-goals/721682) ·
  [Help: Smart status](https://help.asana.com/s/article/smart-status?language=en_US) · cao.
- **Smart goals:** nút *See improvements* phân tích tiêu đề, mô tả và việc liên
  quan để gợi ý tiêu chí thành công, tóm tắt tác động, goal cha, subgoal và đội
  chịu trách nhiệm.
  [Help: Asana AI](https://help.asana.com/s/article/get-started-with-asana-ai?language=en_US) · cao (trích đoạn).
- Báo chí nêu một rủi ro: lãnh đạo lo **«agent sprawl»**, tức nhiều người dựng
  automation trùng nhau làm tăng chi phí và rủi ro bảo mật.
  [Computerworld](https://www.computerworld.com/article/4063082/asana-puts-ai-teammate-agents-to-work.html) · vừa.

---

### 2.3 Notion — Notion Agent, Custom Agents, connectors, MCP

**Đơn vị mở rộng**

- **Custom Agents** ra mắt 24/02/2026 cho gói Business/Enterprise.
  [Release 3.3](https://www.notion.com/releases/2026-02-24) · cao.
  Agent gồm instructions và **trigger**: lịch (ngày/tuần/tháng), sự kiện
  database (tạo trang, đổi thuộc tính), sự kiện Slack (tin nhắn, emoji,
  @mention), sự kiện Notion (bình luận mới, AI Meeting Notes xong). **Quyền truy
  cập chỉ những gì được cấp tường minh:** trang/database cụ thể, bật tắt web, kênh
  Slack cụ thể, và chuyển việc sang agent khác. Agent có nhật ký chạy (thứ gì kích
  hoạt, làm gì, lỗi gì), lịch sử phiên bản cấu hình, và cho chọn model (Claude,
  GPT, Gemini, Grok); admin giới hạn được model.
  [Help: Custom Agents](https://www.notion.com/help/custom-agents) · cao.
  Bản tóm của công cụ đọc ghi rằng agent chạy bằng quyền của người tạo; chi tiết
  này chưa đối chiếu được nguyên văn nên để mức vừa.
- **MCP cho Custom Agents:** admin phải bật MCP server tuỳ biến và chọn
  «Approved & recommended» hay «Approved only». Từng tool bật tắt riêng. **Tool
  ghi mặc định «Always ask»**, tool đọc «Run automatically». Kết nối là riêng của
  từng agent, dùng thông tin đăng nhập của người đã xác thực, và chỉ người đó sửa
  được cấu hình tool.
  [Help: MCP connections](https://www.notion.com/help/mcp-connections-for-custom-agents) · cao.
- **Connectors** (Slack, Drive, GitHub, Jira, Teams, SharePoint…) có
  permission-aware: AI chỉ hiện nội dung người dùng có quyền xem.
  [Help: AI connectors](https://www.notion.com/help/notion-ai-connectors) · cao.

**An toàn:** mọi việc Custom Agent làm đều **hoàn tác được**; có dashboard sử
dụng, nhật ký chạy, và guardrail tự phát hiện prompt injection.
[Introducing Custom Agents](https://www.notion.com/blog/introducing-custom-agents) · cao.

**Giá và quản trị chi phí:** từ 04/05/2026, Custom Agents tốn Notion Credits
($10/1.000 credit), tính theo công sức của mỗi lượt chạy (độ dài nội dung, số
bước, số lần chạy, model). Bảng tham khảo chính chủ: **bản cập nhật tình trạng
$0,08–0,18/lượt**, hỏi đáp $0,03–0,11, bản tin hằng ngày $0,10–0,30. Admin được
báo ở 80% và 100%; hết credit thì agent tự dừng.
[Help: credits](https://www.notion.com/help/buy-and-track-notion-credits-for-custom-agents) · cao.
Từ 05/05/2026 có thêm: giới hạn ai được tạo agent, trần credit cho từng agent,
trần chung cho workspace (Enterprise), dashboard theo agent, và **tự dừng agent
tiêu bất thường**. [Release 2026-05-05](https://www.notion.com/releases/2026-05-05) · cao.

**Goals/OKR:** tôi không thấy tính năng OKR riêng. «Status updates» và «weekly
brief» là các mẫu dùng Custom Agent trên database
([blog](https://www.notion.com/blog/introducing-custom-agents) · cao). Việc Notion
coi OKR là một database cộng với agent là suy luận của tôi · thấp.

---

### 2.4 Microsoft — Copilot Studio, declarative agents, và việc Viva Goals bị khai tử

**Đơn vị mở rộng**

- **Copilot Studio (standard harness):** agent = instructions + knowledge + tools
  + topics. Tool có thể là prompt, Power Automate flow, connector, REST API hay
  MCP. Topic là luồng hội thoại tất định cho ý định cần đi đúng đường.
  [Microsoft Copilot Agents Labs](https://microsoft.github.io/mcs-labs/labs/core-concepts-agent-knowledge-tools/) · cao.
- **GitHub Copilot harness** (tài liệu cập nhật 21/09/2026) là runtime điều phối
  mới. Tab Build gồm instructions, knowledge, tools, **skills**, model,
  **connected agents** và **memory** (preview). Có thêm tab **Evaluate** (test
  set) và **Monitor** (task gần đây, file agent đã đọc).
  [Overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview) · cao.
- **Skill** theo spec mở agentskills.io: gói gồm instructions Markdown, script và
  tài liệu, nạp theo progressive disclosure, upload bằng `SKILL.md` hoặc zip.
  Microsoft tách rõ bốn thứ: instructions (hành vi chung), knowledge (dữ liệu để
  tham chiếu), tools (hành động qua dịch vụ ngoài) và skills (năng lực theo việc,
  dùng lại được).
  [Skills overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-overview) · cao.
- **Declarative agent** cho Microsoft 365 Copilot gồm instructions + actions
  (plugin) + knowledge, chạy trên chính orchestrator và model của M365 Copilot.
  Admin kiểm soát việc phân phối.
  [Declarative agents](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-agent) · cao.

**Quyền dữ liệu**

- M365 Copilot chỉ hiện dữ liệu mà người dùng có ít nhất quyền xem; Semantic
  Index tôn trọng ranh giới theo danh tính người dùng; admin chọn agent nào được
  dùng trong tổ chức.
  [Data, Privacy, and Security](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy) · cao.
- **Điểm vỡ ở chạy nền:** event trigger **chỉ dùng được thông tin đăng nhập của
  người dựng agent**. Để agent tự chạy, mọi action cần xác thực cũng phải dùng
  quyền người dựng. Tài liệu tự cảnh báo rằng người dùng agent có thể mượn đường
  đó để đọc dữ liệu hoặc làm việc bằng quyền người dựng, và studio nhắc lại cảnh
  báo trước khi publish. Admin chặn được trigger bằng data policy.
  [Event triggers overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about) · cao.

**Lịch / sự kiện:** trigger gửi một **payload** (JSON hoặc chữ) *kèm chỉ dẫn riêng
cho sự kiện đó*, tách khỏi instructions chung của agent. Microsoft khuyên dùng
payload khi agent có nhiều trigger, và giữ chuỗi dưới 15 action liên tiếp. Mỗi
lần trigger kích hoạt tính như một tin nhắn để tính tiền, nên trigger lặp dày
làm tốn tiền.
[Event triggers](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about) · cao.

**Human-in-the-loop:** mỗi tool có tuỳ chọn *Ask the end user before running*
(mặc định tắt).
[Add tools](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-tools-custom-agent) · cao (trích đoạn).

**Đánh giá (rõ nhất trong nhóm):** test set tối đa 100 ca, sinh tự động từ mô tả
và knowledge; grader gồm *quality*, *similarity*, *text match* và *content
safety*; chạy qua REST API để làm hồi quy trong quy trình phát hành; kết quả giữ
89 ngày.
[Agent evaluation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-overview) · cao.

**Giá:** Copilot Credits $0,01 trả theo dùng, hoặc gói $200 cho 25.000 credit.
Mức tiêu tham khảo: câu trả lời cổ điển 1, câu trả lời sinh 2, agent action 5,
grounding trên tenant graph 10.
[CloudZero](https://www.cloudzero.com/blog/copilot-studio-pricing/) · vừa.

**Goals/OKR — hai tín hiệu đáng ghi**

- **Viva Goals bị khai tử 31/12/2025, không có sản phẩm thay thế**; Microsoft đẩy
  khách sang công cụ OKR bên thứ ba.
  [Microsoft Learn](https://learn.microsoft.com/en-us/viva/goals/goals-retirement) · cao (trích đoạn) ·
  [Office365itpros](https://office365itpros.com/2024/12/09/viva-goals-retirement/) · vừa.
- **Bộ lọc «workplace harms»:** Microsoft hạn chế dùng AI để suy diễn, phán xét
  hay đánh giá hiệu suất, thái độ, trạng thái cảm xúc của nhân viên từ giao tiếp
  công việc.
  [Data, Privacy, and Security](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy) · cao.
  Điều này khớp với luật «Điểm cuối kỳ không phải đánh giá nhân sự» trong lộ trình
  OKR của kho.

---

### 2.5 Salesforce — Agentforce (Atlas, topics/subagents, Agent Script, Trust Layer)

**Đơn vị mở rộng**

- **Atlas Reasoning Engine** chạy vòng ReAct (suy luận → hành động → quan sát).
  Nó tách câu hỏi về các **topic**; mỗi topic là một việc cần làm, có
  instructions, ràng buộc và tập **action** được phép (Flow, Apex, API).
  [Salesforce — Atlas](https://www.salesforce.com/agentforce/what-is-a-reasoning-engine/atlas/) · cao (trích đoạn).
- **Agent Script / hybrid reasoning** (Dreamforce 10/2025): một DSL khai báo, trong
  đó topic đổi tên thành **subagent**. Script có biến trạng thái, khối
  `before_reasoning` / `reasoning` / `after_reasoning`, và điều kiện
  `available when` quyết định action nào được mở theo trạng thái. Script biên dịch
  thành **Agent Graph**; Atlas đi qua đồ thị đó và chỉ gọi LLM ở nút có prompt.
  Lý do Salesforce đưa ra: để LLM quyết mọi bước thì đường chạy không ổn định,
  tốn tiền và khó kiểm toán.
  [Salesforce Architects](https://architect.salesforce.com/docs/architect/fundamentals/guide/hybrid-reasoning-agentforce-builder-agent-script) · cao.

**Quyền dữ liệu**

- Mỗi agent có một **Agent User** riêng, khởi đầu gần như không có quyền. Service
  agent chạy dưới danh tính đó, trừ khi người dùng đã đăng nhập; employee agent
  chạy theo người dùng. «Xác minh danh tính» không đồng nghĩa với «được xem».
  [Salesforce Ben](https://www.salesforceben.com/agentforce-permissions-explained-agent-users-access-and-security/) · vừa.
- **Einstein Trust Layer** gồm dynamic grounding (retrieval an toàn), zero data
  retention với nhà cung cấp model, data masking PII, toxicity detection và
  guardrail lọc đầu ra.
  [Salesforce Trusted AI](https://www.salesforce.com/artificial-intelligence/trusted-ai/) · cao.
  Retrieval chỉ lấy dữ liệu mà người đang chạy được xem.
  [Salesforce Help (trích đoạn)](https://help.salesforce.com/s/articleView?id=ai.generative_ai_trust_arch.htm&language=en_US&type=5) · vừa.

**Đánh giá:** **Testing Center** chạy test theo lô (sinh ca bằng AI, so topic,
action và câu trả lời với đáp án chuẩn); **Command Center** theo dõi sức khoẻ,
lượng tiêu thụ và mức dùng.
[Salesforce blog](https://www.salesforce.com/blog/agentforce-testing-center-usecase-blog/) · cao.

**Giá:** Flex Credits $500 cho 100.000 credit, tức $0,10 mỗi action chuẩn.
[Constellation Research](https://www.constellationr.com/insights/news/salesforce-revamps-agentforce-pricing-flex-credits-what-you-need-know) · vừa.

**Goals/OKR:** không thấy OKR gốc; OKR trên Salesforce là app AppExchange (Axy
OKR, OKRify). [AppExchange](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3A00000FeGSVUA3) · vừa.
Nhận định «Agentforce không có tính năng AI cho OKR» là suy luận từ việc không tìm
thấy · thấp.

---

### 2.6 HubSpot — Breeze Assistant, Agent Hub / Agent Builder, Breeze Intelligence

**Đơn vị mở rộng**

- **Agent Hub** là nơi kích hoạt, cấu hình, theo dõi mọi agent. **Agent Builder**
  dựng agent từ inputs, instructions, tools và knowledge sources. **Knowledge
  vaults** là kho tri thức hẹp theo mục đích. **Agentic workflows** dùng agent làm
  một bước trong workflow. Agent dựng sẵn gồm Data Agent, Prospecting, Deal
  Progression, Customer Agent, AEO.
  [HubSpot KB — Understand Agent Hub](https://knowledge.hubspot.com/ai/understand-breeze) · cao.
  Ngày 23/07/2026 Breeze Agents chuyển vào Agent Hub và Breeze Studio đổi tên
  thành Agent Builder (public beta). Tool có thêm MCP.
  [Resolve247](https://resolve247.ai/blog/hubspot-agent-hub/) · vừa.
- **Breeze Intelligence** là lớp dữ liệu: enrichment từ khoảng 200 triệu hồ sơ,
  tín hiệu buyer intent, và form shortening.
  [HubSpot news](https://www.hubspot.com/company-news/spotlight-product-deep-dive-the-complete-customer-picture-with-breeze-intelligence-hubspots-new-data-enrichment-and-buyer-intent-solution) · cao (tiêu đề) ·
  [chi tiết: Huble](https://huble.com/blog/hubspot-breeze-intelligent) · vừa.

**Quyền dữ liệu:** quyền người dùng quyết định những hành động làm được qua Breeze
Assistant; admin cấp quyền dùng AI theo từng người.
[HubSpot KB — Use Breeze Assistant](https://knowledge.hubspot.com/ai/use-breeze-assistant) · vừa (trích đoạn).

**Giá — mẫu đáng để ý nhất: trả theo kết quả.** Từ 14/04/2026, Customer Agent
tính $0,50 mỗi cuộc hội thoại *được giải quyết* (50 credit), Prospecting Agent
tính $1 mỗi lead *được đề xuất liên hệ* (100 credit).
[HubSpot news](https://www.hubspot.com/company-news/hubspots-customer-agent-and-prospecting-agent-now-you-pay-when-the-task-is-complete) · cao.
Credit mua thêm khoảng $10/1.000.
[Marketing Mary](https://www.marketingmary.ai/blog/how-hubspot-breeze-credits-work) · vừa.

**Goals/OKR:** không thấy AI cho goals · thấp.

---

### 2.7 ClickUp — Brain, Super Agents, AI cho Goals

**Đơn vị mở rộng:** **Super Agent** gồm instructions, trigger (tay, lịch, hoặc
từ automation), tools/skills, knowledge (hơn 50 app nối qua enterprise search,
permission-aware) và **memory** ba loại (Recent, Preferences, Intelligence — agent
tự chọn điều cần nhớ).
[Help: Super Agent instructions, triggers, skills…](https://help.clickup.com/hc/en-us/articles/37092796379927-Super-Agent-instructions-triggers-skills-knowledge-and-memory) ·
[Help: Memory](https://help.clickup.com/hc/en-us/articles/37038846655383-What-is-Super-Agent-Memory) · cao (trích đoạn).

**Quyền dữ liệu — cảnh báo có trong tài liệu chính chủ (diễn lại bằng lời tôi):** dữ liệu riêng tư
đã chia cho Super Agent (kể cả Personal List) có thể được dùng khi agent trả lời
**bất kỳ ai được phép gọi nó, kể cả khi người đó không có quyền xem dữ liệu gốc**.
Nội dung agent sinh ra thì ai xem được nội dung đó đều thấy. Mọi hành động có
audit trail.
[Help: Super Agent privacy, security, and permissions](https://help.clickup.com/hc/en-us/articles/36926065055127-Super-Agent-privacy-security-and-permissions) · cao (trích đoạn).
Đây chính là lối rò mà vai «chỉ OKR» phải chặn.

**Goals/OKR:** Brain trả lời câu hỏi về goals/OKR; **AI Fields** trên bản ghi
goal tự cập nhật (tóm tắt, tiến độ) và chạy lại được bằng automation.
[Help: Use Brain AI for goals and OKRs](https://help.clickup.com/hc/en-us/articles/30806500075031-Use-Brain-AI-for-goals-and-OKRs) · cao (trích đoạn).
Có trang «Quarterly OKRs Generator» sinh OKR từ dữ liệu workspace.
[ClickUp](https://clickup.com/p/features/ai/quarterly-okrs-generator) · vừa (trang marketing).

**Giá:** gói Everything AI $28/người/tháng, Brain $9.
[ZenPilot](https://www.zenpilot.com/clickup-ai/) · vừa.

---

### 2.8 monday.com — Sidekick, agents, AI Blocks, Vibe, MCP

- **Sidekick** là trợ lý cá nhân ở cấp account, board và item. **Agents** gồm mẫu
  dựng sẵn và trình dựng ba bước. **AI Blocks** là hàm AI trên từng cột (phân
  loại, tóm tắt, trích xuất, dịch, cảm xúc) chạy trong Automation Center. **Vibe**
  sinh app từ prompt. **MCP** cho Claude, ChatGPT, Copilot, Cursor đọc và ghi board
  qua OAuth, **không tính thêm credit**. Mỗi account có 500 AI credit miễn phí mỗi
  tháng. [monday blog](https://monday.com/blog/ai-agents/everything-monday-ai-can-do/) · cao.
- **Goals/OKR:** OKR trên monday là một cách dựng board, không phải module riêng.
  [Support: OKR management](https://support.monday.com/hc/en-us/articles/4402057681298-OKR-management-using-monday-com) · cao (tiêu đề).
  Không thấy AI riêng cho OKR ngoài bảng điều khiển tự dựng bằng Vibe · vừa.

---

### 2.9 Glean — permission-aware search, agents, governance

**Đơn vị mở rộng:** Agent Builder dựa trên trigger, step, action, flow và memory.
[Gend](https://www.gend.co/blog/glean-autonomous-agents) · vừa.
Bản cập nhật 26/08/2026 thêm: **independent agents** có danh tính riêng (Agent
Identity, public beta, credential có phạm vi trên hơn chục tool); dựng agent trong
Claude Code hoặc Cursor, đồng bộ bằng Git; **Agent Evals** (private beta) chạy
kịch bản trước khi publish; **Agent Scanning** (beta) quét định nghĩa agent để bắt
write tool cấp dư hoặc instructions mơ hồ, và cần moderator duyệt; governance
policies nhiều luật; **skills có phiên bản**, quét rủi ro, rollback một chạm.
[Glean blog](https://www.glean.com/blog/glean-agents-go-2026) · cao.

**Quyền dữ liệu và chạy nền — tài liệu bảo mật cụ thể nhất trong nhóm:**
agent chạy theo lịch dùng **danh tính của người đăng ký chạy** (subscriber), và
quyền được kiểm tại thời điểm chạy. Ghi khi chạy nền phải qua hai cổng:
admin đưa từng write tool vào danh sách được chạy không cần xác nhận, và moderator
duyệt agent trước khi publish. Glean khuyên: ghi cứng đích đến (mã Jira, repo,
kênh), tắt thao tác phá huỷ, giới hạn số mục bị đổi mỗi lượt và timeout, bắt đầu ở
chế độ chỉ đọc, giữ luồng nền đơn giản và để suy luận phức tạp cho agent tương tác
có người canh. Audit log xuất CSV hoặc đẩy sang SIEM.
[Glean docs — Scheduled Triggers Agents](https://docs.glean.com/security/agents/background-agents) · cao.

**Giá:** phí theo người (khoảng $45–50/người/tháng) cộng FlexCredits cho phần nặng,
trong đó 100 truy vấn thinking mode/người/tuần là miễn phí.
[Glean Enterprise Flex](https://docs.glean.com/glean-enterprise-flex-pricing) · cao (có mô hình) ·
[Workativ](https://workativ.com/ai-agent/blog/glean-pricing) · vừa (con số).

**Goals/OKR:** không có · thấp.

---

### 2.10 Linear — agents như thành viên, Pulse cho initiative/project updates

**Đơn vị mở rộng — agent là một «app user»:** cài qua OAuth với `actor=app`, tạo
một người dùng riêng cho agent với scope riêng (`app:assignable`,
`app:mentionable`; không xin được `admin`). Khi giao issue cho agent, agent thành
**delegate chứ không phải assignee, nên người vẫn giữ trách nhiệm**. Mỗi lần được
nhắc hoặc được giao sinh một **Agent Session** kèm các activity có kiểu
(`thought`, `action`, `response`, `elicitation`, `error`); agent phải phát một
`thought` trong 10 giây để báo đã nhận. Agent **không tính là người dùng trả phí**.
[Linear Developers — Agents](https://linear.app/developers/agents) ·
[Best practices](https://linear.app/developers/agent-best-practices) · cao.

**Goals/OKR (initiatives):** initiative/project update có chỉ số sức khoẻ (on
track / at risk / off track) và phần chữ.
[Docs: updates](https://linear.app/docs/initiative-and-project-updates) · cao.
**Pulse** gom các bản cập nhật *do người viết* thành bản tóm AI, gửi vào Inbox
khoảng 6 giờ sáng giờ địa phương (hằng ngày hoặc hằng tuần, admin đặt mặc định,
người dùng ghi đè), có bản audio, cá nhân hoá theo project và initiative người đó
là thành viên hoặc theo dõi; không dành cho Guest.
[Docs: Pulse](https://linear.app/docs/pulse) · [Changelog 16/04/2025](https://linear.app/changelog/2025-04-16-pulse) · cao.

---

## 3. Bảng so sánh ngang

| | Đơn vị mở rộng | Đọc theo quyền ai (tương tác / nền) | Ghi được duyệt thế nào | Đánh giá | Giá |
| --- | --- | --- | --- | --- | --- |
| **Atlassian** | agent · subagent · skill · tool (Forge verb) · knowledge 4 chế độ | người hỏi / người chạy automation | chat: xác nhận tool có tác động; automation: cấm CREATE/UPDATE/DELETE | analytics + kiểm thử trong Studio | credit gộp, $0,01 vượt từ 03/12/2026 |
| **Asana** | AI Studio rule · AI Teammate (skill bundle, connector, memory) | theo quyền Asana / chưa rõ | checkpoint trước khi thực thi | — | credit AI Studio |
| **Notion** | Custom Agent · trigger · MCP tool | người hỏi (connector) / người tạo (vừa) | tool ghi «Always ask»; mọi lượt hoàn tác được | nhật ký chạy | credit theo lượt, trần theo agent |
| **Microsoft** | instructions · knowledge · tools · skills (SKILL.md) · topics · connected agents · memory | người dùng (Graph) / **người dựng** (trigger) | «Ask before running» theo tool | test set ≤100, 4 grader, REST | Copilot Credits |
| **Salesforce** | subagent (topic) · action · Agent Script | người dùng / **Agent User** riêng | tất định trong Agent Script | Testing Center theo lô | $0,10/action |
| **HubSpot** | agent · tools · knowledge vault · agentic workflow | quyền người dùng | — | — | **trả theo kết quả** |
| **ClickUp** | Super Agent · memory 3 loại | **người gọi thấy dữ liệu đã chia cho agent** | audit trail | — | theo người + credit |
| **monday** | Sidekick · agent · AI Block · Vibe · MCP | OAuth (MCP) | — | — | 500 credit miễn phí/tháng |
| **Glean** | agent · skill có phiên bản · Agent Identity | người hỏi / **người đăng ký chạy** | danh sách trắng write tool + moderator | Agent Evals, Agent Scanning | theo người + FlexCredits |
| **Linear** | agent = app user · session · activity | scope của app | delegate ≠ assignee | — | agent miễn phí |

---

## 4. Các nền tảng áp AI vào goals/OKR thế nào

| Kiểu | Ai làm | Người giữ quyền gì | Nguồn |
| --- | --- | --- | --- |
| Soạn nháp bản cập nhật tình trạng goal từ hoạt động gần đây | Atlassian Rovo, Asana smart status, Notion (mẫu agent) | Người sửa và **bấm đăng**; có thể thêm guidance | [Atlassian](https://support.atlassian.com/platform-experiences/docs/create-project-updates-with-rovo/), [Asana](https://forum.asana.com/t/new-ai-powered-smart-status-for-portfolios-and-goals/721682) |
| Gợi ý viết goal cho sắc (tiêu chí thành công, goal cha, subgoal, đội chịu trách nhiệm) | Asana smart goals | Người chọn từng gợi ý | [Asana Help](https://help.asana.com/s/article/get-started-with-asana-ai?language=en_US) |
| Hỏi đáp trên goals ở ngữ cảnh trang | ClickUp Brain, nút Rovo | Chỉ đọc | [ClickUp](https://help.clickup.com/hc/en-us/articles/30806500075031-Use-Brain-AI-for-goals-and-OKRs), [Atlassian Community](https://community.atlassian.com/forums/Goals-and-Projects-articles/More-ways-to-bring-Rovo-to-your-Goals-and-Projects-workflow/ba-p/3252435) |
| Tóm tắt định kỳ theo người đọc (theo cái họ theo dõi), kể cả audio | Linear Pulse | Tóm từ bản cập nhật **do người viết** | [Linear](https://linear.app/docs/pulse) |
| Agent canh danh mục (phụ thuộc, rủi ro, tạo cập nhật) chạy theo lịch | Rovo Studio + skill Goals | Studio / automation; ghi bị giới hạn | [Atlassian Community](https://community.atlassian.com/forums/Goals-and-Projects-articles/More-ways-to-bring-Rovo-to-your-Goals-and-Projects-workflow/ba-p/3252435) |
| Trường AI trên bản ghi goal, tự làm mới | ClickUp AI Fields | Automation | [ClickUp](https://help.clickup.com/hc/en-us/articles/30806500075031-Use-Brain-AI-for-goals-and-OKRs) |
| Sinh bộ OKR quý từ dữ liệu workspace | ClickUp (trang marketing) | Không rõ | [ClickUp](https://clickup.com/p/features/ai/quarterly-okrs-generator) · vừa |

**Ba nhận xét (suy luận):**

1. **Không nền tảng nào cho AI tự ghi số tiến độ, tự đặt mức tự tin hay tự chấm
   người.** AI dừng ở soạn nháp, gợi ý và tóm tắt. Lộ trình OKR của kho đã chốt
   điều này (NG-05), và nó khớp với thị trường.
2. **Bản tóm tắt tốt nhất đứng trên chữ do người viết** (Linear Pulse tóm các bản
   cập nhật người đã viết; Asana gom subgoal và project người đã chọn). Đây là lý
   do lộ trình đặt lượt 9 sau lượt 4: không có cập nhật tuần thì không có gì để tóm.
3. **Microsoft bỏ Viva Goals mà vẫn giữ luật «không suy diễn về hiệu suất nhân
   viên» trong Copilot.** Trong môi trường nội bộ, rủi ro lớn của AI trên OKR là
   biến thành công cụ chấm người, chứ không phải AI viết dở.

---

## 5. Mẫu chung — chín mẫu kiến trúc lặp lại

### M1. Agent là cấu hình có phiên bản, không phải mã

Instructions, knowledge, tools, skills và triggers được khai trong một manifest;
lưu thì ra một phiên bản, publish mới là cổng duyệt; lịch sử phiên bản cho phép
khôi phục. Thấy ở: Rovo Studio, Notion (version history), Copilot Studio (Build →
Publish), Glean (skills có phiên bản, rollback), Forge `rovo:agent`.

### M2. Tách skill (cách làm) khỏi tool (hành động)

Tool là hàm có kiểu, có verb, có mô tả để model chọn đúng lúc. Skill là Markdown
chỉ cách phối hợp tool cho một loại việc, nạp theo `description`. Microsoft ghi
rõ bảng bốn thành phần; Atlassian có skill *Write status update* dựng sẵn; cả hai
cùng spec `SKILL.md`. Kèm luật ngầm: **ít skill mỗi agent** (dưới 5 theo
eesel · vừa) và **ít action nối tiếp** (dưới 15 theo Microsoft · cao).

### M3. Knowledge mặc định rộng, thu hẹp được, và luôn lọc theo người hỏi

Mặc định là toàn bộ đồ thị tổ chức (Teamwork Graph, Work Graph, Microsoft Graph,
Glean index), kiểm quyền **tại lúc truy vấn** theo danh tính người hỏi. Custom
knowledge thu hẹp phạm vi để câu trả lời chính xác hơn, chứ không để mở thêm quyền.

### M4. Ba mô hình danh tính khi chạy nền, và lối rò đi kèm

| Mô hình | Ví dụ | Lối rò |
| --- | --- | --- |
| Theo người gọi hoặc người đăng ký | Glean (subscriber), Rovo tương tác | ít; nhưng bản tóm tắt sinh ra thì ai xem được nội dung đó đều thấy |
| Theo người dựng agent | Copilot Studio trigger, Notion Custom Agent (vừa) | người dùng agent mượn quyền người dựng — Microsoft tự cảnh báo |
| Danh tính riêng của agent, scope hẹp | Linear `actor=app`, Salesforce Agent User, Glean Agent Identity | an toàn nhất nếu scope hẹp; phải cấp quyền từng chút |

Thêm một lối rò thứ tư ở ClickUp: dữ liệu đã chia cho agent được dùng để trả lời
bất kỳ ai gọi được agent.

### M5. Ghi được phân loại theo verb, có cổng khác nhau cho tương tác và cho nền

- Tương tác: đọc thì tự chạy; ghi thì hỏi (Notion «Always ask», Rovo xác nhận,
  Copilot «Ask before running»).
- Nền: cấm ghi (Rovo), hoặc chỉ ghi qua danh sách trắng + moderator + đích ghi cứng
  + trần số mục mỗi lượt (Glean), hoặc để đầu ra agent đi qua một bước tất định
  (`{{agentResponse}}` của Rovo).
- Hoàn tác được mọi thứ (Notion), và «huỷ không phải hoàn tác» cần được nói rõ.

### M6. Một bộ trigger thống nhất: tay · lịch · sự kiện, payload mang chỉ dẫn riêng

Mọi nền tảng có đủ ba loại. Copilot Studio tách *instructions của agent* khỏi
*chỉ dẫn trong payload của từng trigger*. Rovo gom mọi trigger đang gọi agent về
một chỗ trên màn cấu hình. Cả Microsoft lẫn Glean cảnh báo trigger dày làm tốn
tiền và vượt quota.

### M7. Hybrid determinism: luật làm phần quyết được, LLM làm phần diễn giải

Salesforce Agent Script (khối before/after reasoning, `available when`), topic
tất định của Copilot Studio, automation tất định sau agent của Rovo, và lời Glean
khuyên giữ luồng nền đơn giản. Lý do chung: tính lặp lại, chi phí và khả năng
kiểm toán.

### M8. Nội dung mang tên người: soạn nháp trước, người đăng

Bản cập nhật tình trạng, câu mục tiêu, bản tin: AI soạn, người sửa và bấm đăng
(Asana Discard/Edit/Post, Atlassian «review before publishing», Microsoft «dùng
bản nháp và tóm tắt, đừng tự động hoá hoàn toàn»). Linear nói theo cách khác: agent
là delegate, người vẫn là assignee.

### M9. Đo, trần, dừng: eval trước khi publish, nhật ký khi chạy, credit có trần

- Trước khi publish: test set và grader (Copilot Studio), batch test (Salesforce),
  Agent Evals và quét định nghĩa agent (Glean).
- Khi chạy: nhật ký chạy gồm thứ đã kích hoạt, tool đã gọi và lỗi (Notion,
  Copilot activity map, Glean audit tới SIEM); Linear bắt agent phát activity có
  kiểu thay vì viết comment.
- Tiền: credit đo theo lượt; trần theo agent và theo workspace; báo ở 80%/100%;
  tự dừng khi cạn hoặc tiêu bất thường (Notion, Rovo). HubSpot đi xa hơn: trả theo
  kết quả.

(Mẫu phụ, không đếm vào chín: **MCP hai chiều** — nền tảng vừa *mở* MCP server
để AI ngoài đọc và ghi dữ liệu của nó (Asana, monday, Notion, Rovo), vừa *dùng*
MCP của bên khác làm tool cho agent của mình.)

---

## 6. Áp vào CRM OneHub (một đội dev, ngân sách AI ~$20/tháng)

### 6.1 Kho đã có gì, đối chiếu với các mẫu

Đọc từ `docs/agent.md`, `apps/agent/agent/**`, `packages/validation/src/agent-manifest.ts`
và `docs/plan/lo-trinh-okr.md` (nhánh `onehub`):

| Mẫu | Đã có trong kho | Khoảng trống cho OKR |
| --- | --- | --- |
| M1 manifest có phiên bản | Team agent: `agent_builder` / `agent_runner`, manifest có `triggers[]`, phạm vi bản ghi `SELECTED`/`WORKSPACE`, lưu ra phiên bản READY riêng, **Deploy là cổng duyệt** | Kiểu bản ghi chỉ có `company`/`contact`/`deal`/`integration` — chưa có objective/KR |
| M2 skill ≠ tool | `agent/skills/*.md` có frontmatter `description` (cùng hình `SKILL.md`); tool eve có kiểu | Chưa có skill OKR (viết KR, tóm tuần) và chưa có tool đọc OKR |
| M3 lọc theo người hỏi | Chưa. `docs/agent.md` ghi agent **được đọc mọi thứ** (công cụ nội bộ một tenant) | **Lỗ lớn nhất.** Lượt 2 đã ghi «công cụ đọc dữ liệu CRM của tác nhân kiểm cùng phạm vi»; phải thành luật chung cho mọi tool đọc |
| M4 danh tính chạy nền | `APP_AUTH` là danh tính dịch vụ; bridge đổi phiên đăng nhập thành token 2 phút mang người + bản ghi | Chưa có danh tính «agent chỉ OKR» cho việc chạy theo lịch |
| M5 ghi có cổng | `lib/approval.ts` `sensitiveWrite`: tự chạy thì **denied**, tương tác thì **user-approval**; action là quyền có cấu trúc (`crm.activity.create` ghi rõ NOTE/TASK), ghi vào sổ trước khi chạy, huỷ run là một hàng | Đủ dùng; OKR chỉ cần thêm loại «đề xuất» (giống `PROPOSED` của `facts.ts`) |
| M6 trigger | `MANUAL`/`SCHEDULE`/`EVENT`; `@crm/db/crm-events` là từ vựng sự kiện dùng chung; hàng `AgentTask` + dispatch mỗi phút có mức ưu tiên | Thêm sự kiện OKR (cập nhật tuần mới, mức tự tin tụt, KR im N ngày) |
| M7 hybrid | Luật «bằng chứng, không phải độ tự tin» (`lib/evidence.ts`, `lib/facts.ts`); nhắc buổi sáng là luật (`nhac-ke-hoach.ts`) | Cảnh báo rủi ro OKR bằng luật, LLM chỉ diễn giải — lộ trình lượt 10 đã ghi đúng |
| M8 soạn nháp trước | Builder: lưu ≠ deploy; fact dưới `VERIFIED` là đề xuất | Gợi ý viết KR hiện câu cũ cạnh câu mới, người nhận từng dòng (lượt 9 đã ghi) |
| M9 đo và trần | `bun run --filter=agent eval` (eval end-to-end cho builder); acceptance-gate; `lib/focus.ts` ngân sách theo phiên; `capabilities.ts` thiếu khoá thì tính năng biến mất | **Chưa có trần tiền theo tính năng/tháng**, chưa có eval chất lượng cho tóm tắt |

Kết luận của bảng: **kho đã có khung kiến trúc gần giống Rovo Studio / Notion
Custom Agents** (manifest, trigger, action có kiểu, deploy làm cổng, sổ action,
huỷ run). Phần thiếu không phải «một kiến trúc agent mới» mà là **ba lớp chung**:
lọc theo người hỏi, trần tiền, eval chất lượng. Cộng thêm **một gói miền OKR**:
tools, skills, events.

### 6.2 Đáng chép — theo thứ tự đáng làm

1. **Lọc theo người hỏi ở tầng tool, chặn-mặc-định (M3).** Mỗi tool đọc khai mình
   thuộc nhóm dữ liệu nào (`partner`, `okr`, `self`…), giống cách lượt 2 bắt mỗi
   router khai nhóm. Tool không khai thì bị chặn với vai «chỉ OKR». Principal của
   phiên (người trong token của bridge) đi vào mọi `execute`. Chép từ Rovo và
   Microsoft: *agent hành động thay người hỏi nên chỉ thấy cái người đó thấy*.
   Phải có phép đo đỏ được trước khi vá: vai «chỉ OKR» hỏi trợ lý một câu về thoả
   thuận thì nhận câu từ chối, không nhận dữ liệu.
2. **Danh tính riêng, scope hẹp cho việc chạy nền (M4, kiểu Linear/Salesforce).**
   Tóm tắt tuần của đơn vị chạy bằng một principal «trợ lý OKR» chỉ đọc được nhóm
   `okr`, **không bao giờ bằng quyền người dựng hay quyền admin** (tránh lối rò
   Copilot Studio). Bản tóm tắt được hiển thị theo đúng quyền xem OKR của đơn vị
   đó (tránh lối rò ClickUp). Vì OKR công khai trong công ty theo mặc định, cách
   này đơn giản; khi lượt 8 thêm «mức hiển thị giới hạn» thì luật hiển thị bản
   tóm phải đi theo.
3. **Skill OKR là file Markdown trong `agent/skills` (M2), tool OKR chỉ đọc cộng
   một loại «đề xuất».** Ví dụ skill: `viet-kr.md` (KR đo được, có đích, không phải
   việc), `tom-tat-tuan-don-vi.md` (mỗi câu dẫn về lần cập nhật gốc, không nhắc
   người chưa cập nhật, không phán xét người), `goi-y-can-chinh.md`. Ví dụ tool:
   `read_objective`, `list_unit_checkins(week)`, `read_alignment_tree`,
   `propose_rewrite` (ghi hàng đề xuất; người nhận thì service mới ghi). **Không có
   tool ghi số hay mức tự tin** (NG-05).
4. **Hybrid: code gom dữ liệu, LLM chỉ viết (M7).** Tóm tắt tuần không cần vòng
   agent nhiều bước: service dựng sẵn gói dữ liệu của đơn vị, gửi **một lượt gọi
   có `outputSchema`**, rồi máy kiểm mọi con số trong câu so với lần cập nhật và
   bỏ câu lệch (lộ trình đã ghi). Cảnh báo KR trượt là luật trên dữ liệu; LLM chỉ
   viết một dòng giải thích khi luật đã bật. Đây là cách rẻ nhất và dễ kiểm toán
   nhất (lý do của Salesforce khi làm Agent Script).
5. **Trần tiền theo tính năng và theo tháng, báo 80%/100%, tự dừng (M9, kiểu
   Notion/Rovo).** Cần một sổ tiêu theo `AgentRun`/`AgentTask` (token vào, token
   ra, số tiền theo bảng giá model) và một trần riêng cho khu OKR, **tách khỏi
   làn nghiên cứu danh bạ**. Một phiên nghiên cứu đo được ~$0,19 (ghi nhớ của kho,
   03/09/2026), nên để chung một trần thì hàng đợi nghiên cứu ăn hết phần của OKR.
   Chạm trần thì nút AI biến mất, theo đúng tinh thần `capabilities.ts`, chứ
   không ném lỗi.
6. **Eval nhỏ nhưng chạy thật (M9, kiểu Copilot Studio).** Chừng 20–40 ca cố
   định: (a) tóm tắt không có con số nào lệch dữ liệu (grader tất định); (b) không
   có câu phán xét người (grader bằng model, hoặc danh sách cụm cấm); (c) vai «chỉ
   OKR» không lấy được dữ liệu đối tác qua trợ lý (tất định); (d) gợi ý viết KR giữ
   nguyên con số và đơn vị (tất định). Chạy như `bun run --filter=agent eval`
   hiện có, bỏ qua (có báo) khi thiếu khoá.
7. **Soạn nháp trước, người đăng; đếm nhận / sửa / bác (M8).** Chép Asana: nút
   «Soạn bằng AI» → bản nháp → sửa → đăng. Đo tỷ lệ nhận nguyên văn làm tín hiệu
   chất lượng cho Cổng Giá trị (lộ trình đã có).
8. **Mẫu tương tác của Linear cho Slack/Zalo.** Báo đã nhận trong vài giây, hiện
   việc đang làm, hỏi lại khi thiếu (`elicitation`), và phần tất định (chọn mức
   tự tin, sửa số) là nút bấm không cần LLM. Hợp với lượt 10.

### 6.3 Quá tay — không nên làm ở quy mô này

| Thứ | Vì sao quá tay |
| --- | --- |
| Studio dựng agent cho mọi người dùng OKR (kiểu Rovo Studio / Copilot Studio) | Kho đã có builder cho team agent; mở cho cả công ty là mở lối «agent sprawl» mà Asana đã bị hỏi đến, và nhân số trigger lên. Trợ lý OKR nên là **tính năng cố định, do đội dev viết**, có skill và tool đã duyệt |
| Vector DB / embedding / RAG trên OKR | Dữ liệu OKR nhỏ, có cấu trúc, nằm trong Postgres. Tool SQL có quyền rẻ hơn và đúng hơn. Gợi ý căn chỉnh làm được bằng cách đưa danh sách mục tiêu cấp trên (vài chục dòng) vào một lượt gọi |
| Knowledge graph kiểu Teamwork Graph / Work Graph | Cây tổ chức (lượt 1) cộng bảng căn chỉnh (lượt 3) đã là đồ thị cần dùng |
| Memory dài hạn cho agent (ClickUp, Asana, Copilot) | «Trí nhớ» đúng là bảng cập nhật tuần chỉ-thêm. Memory do model tự chọn thì khó kiểm, khó xoá, dễ rò giữa người |
| Agent tự ghi số hay mức tự tin vào KR | Trái NG-05; không nền tảng nào làm. Số tự chảy là việc của luật (lượt 6), không phải của LLM |
| Nhiều agent phối hợp (Asana Dash, connected agents) | Một trợ lý với vài skill là đủ; mỗi bước phối hợp thêm là thêm token và thêm chỗ hỏng |
| Moderator / quét định nghĩa agent (Glean) | Một đội dev; review code và cổng acceptance đã là moderator |
| Marketplace MCP / mở MCP server của CRM ra ngoài | Đáng cân nhắc sau R3 cho người dùng Claude/ChatGPT, nhưng mở ra là thêm một đường vào mà lượt 2 phải đo; chưa ai đòi |
| Chọn model theo từng agent, deep research, bản tin audio | Một hàng `appSetting` là đủ. Audio kiểu Linear Pulse hay nhưng không nằm trong câu giao của lượt nào |
| Giá theo kết quả (HubSpot) | Chỉ có nghĩa khi bán ra ngoài; nội bộ chỉ cần trần và sổ tiêu |

### 6.4 Chi phí ước lượng (suy luận, cần đo lại)

Giá model mặc định `google/gemini-3.7-flash` theo ghi nhớ của kho: **$0,75 cho 1
triệu token vào, $3,75 cho 1 triệu token ra**. Các con số dưới đây là giả định
để thấy thứ bậc, không phải số đo:

| Việc | Giả định | Ước lượng/tháng |
| --- | --- | --- |
| Tóm tuần theo đơn vị, **một lượt gọi**, dữ liệu dựng sẵn | 40 đơn vị × 4,3 tuần; 6K vào + 0,6K ra | ~$1,2 |
| Cùng việc đó nhưng để **vòng agent nhiều bước** tự đọc | ~4 lần context mỗi lượt | ~$3–4 |
| Gợi ý viết lại mục tiêu/KR (mùa đặt OKR) | 1.000 lượt × (2K vào + 0,3K ra) | ~$2,6 (dồn vào tháng đặt) |
| Hỏi đáp OKR trong chat (vòng agent) | 200 câu × (30K vào + 0,5K ra) | ~$5 |
| Giải thích cảnh báo trượt (luật bật trước, LLM viết sau) | 200 lượt × (3K + 0,2K) | ~$0,6 |
| **Cộng** | | **~$8–12** |

Hệ quả: ngân sách $20 **đủ cho OKR nếu** (a) tóm tắt là một lượt gọi chứ không
phải một phiên agent cho mỗi KR (lộ trình đã chốt «gom theo đơn vị»), (b) OKR có
trần riêng tách khỏi làn nghiên cứu, (c) hỏi đáp trong chat có trần số câu/người/ngày.
So chéo với bảng giá của Notion ($0,08–0,18 cho một lượt cập nhật tình trạng, đã
gồm biên lợi nhuận của họ): tự làm rẻ hơn khoảng một bậc, nhưng chỉ khi giữ được
kỷ luật một-lượt-gọi.

---

## 7. Câu hỏi mở

1. Số đơn vị (bộ phận + phòng ban) và số người dùng OKR thật là bao nhiêu? Con số
   này quyết định ước lượng ở 6.4.
2. Nội dung OKR có được gửi tới nhà cung cấp model qua AI Gateway không, và AI
   Gateway có bật được chế độ không lưu dữ liệu cho nhà cung cấp đang dùng không?
   (Đây là điều kiện mở lượt 9.)
3. Bản tóm tắt tuần của đơn vị: ai được xem — mọi người thấy OKR đơn vị đó, hay
   chỉ trưởng đơn vị và cấp trên? (Quyết định luật hiển thị ở 6.2 mục 2.)
4. Vai «chỉ OKR» có được mở khung chat trợ lý ở R3 không, hay chỉ có các nút AI
   gắn vào màn (viết lại, tóm tắt)? Mở chat thì phép đo của lượt 2 phải phủ thêm
   đường này.
5. Nền tảng bot Zalo có cho nút tương tác trong tin nhắn không? Nếu không, lượt 10
   trên Zalo chỉ là đường dẫn vào màn cập nhật.
6. Ghi nhớ của kho nói ngân sách team là $20 và trần khoá bám theo ngân sách đó.
   Trần riêng cho OKR đặt bao nhiêu trong $20 ấy, khi làn nghiên cứu danh bạ cũng
   đang tiêu cùng khoá?

---

## Nguồn chính

- Atlassian: [Studio agents](https://support.atlassian.com/studio/docs/what-are-agents/) ·
  [Knowledge](https://support.atlassian.com/rovo/docs/knowledge-sources-for-agents/) ·
  [Tools](https://support.atlassian.com/rovo/docs/agent-actions/) ·
  [Skills](https://support.atlassian.com/rovo/docs/add-skills-to-rovo-agents/) ·
  [Skills in chat](https://support.atlassian.com/rovo/docs/use-skills-in-a-chat/) ·
  [Automations](https://support.atlassian.com/rovo/docs/agents-in-automations/) ·
  [Forge action](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/) ·
  [Forge rovo:agent](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-agent/) ·
  [Credits](https://support.atlassian.com/rovo/docs/rovo-usage-limits/) ·
  [Rovo Studio Team '26](https://www.atlassian.com/blog/company-news/rovo-studio-team-26) ·
  [Status updates](https://support.atlassian.com/platform-experiences/docs/create-project-updates-with-rovo/) ·
  [Goal types](https://support.atlassian.com/platform-experiences/docs/what-are-goal-types/) ·
  [Goals & Projects + Rovo](https://community.atlassian.com/forums/Goals-and-Projects-articles/More-ways-to-bring-Rovo-to-your-Goals-and-Projects-workflow/ba-p/3252435)
- Asana: [AI](https://asana.com/product/ai) · [AI Teammates](https://asana.com/product/ai/ai-teammates) ·
  [AI Studio](https://asana.com/product/ai/ai-studio) ·
  [Smart status goals](https://forum.asana.com/t/new-ai-powered-smart-status-for-portfolios-and-goals/721682) ·
  [Computerworld](https://www.computerworld.com/article/4063082/asana-puts-ai-teammate-agents-to-work.html)
- Notion: [Custom Agents](https://www.notion.com/help/custom-agents) ·
  [Credits](https://www.notion.com/help/buy-and-track-notion-credits-for-custom-agents) ·
  [Admin controls](https://www.notion.com/releases/2026-05-05) ·
  [MCP](https://www.notion.com/help/mcp-connections-for-custom-agents) ·
  [Blog](https://www.notion.com/blog/introducing-custom-agents) ·
  [Connectors](https://www.notion.com/help/notion-ai-connectors)
- Microsoft: [Harness overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview) ·
  [Skills](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-overview) ·
  [Event triggers](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about) ·
  [Evaluation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-overview) ·
  [Declarative agents](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-agent) ·
  [Privacy](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy) ·
  [Viva Goals retirement](https://learn.microsoft.com/en-us/viva/goals/goals-retirement)
- Salesforce: [Agent Script](https://architect.salesforce.com/docs/architect/fundamentals/guide/hybrid-reasoning-agentforce-builder-agent-script) ·
  [Trusted AI](https://www.salesforce.com/artificial-intelligence/trusted-ai/) ·
  [Testing Center](https://www.salesforce.com/blog/agentforce-testing-center-usecase-blog/) ·
  [Permissions (Salesforce Ben)](https://www.salesforceben.com/agentforce-permissions-explained-agent-users-access-and-security/)
- HubSpot: [Agent Hub](https://knowledge.hubspot.com/ai/understand-breeze) ·
  [Outcome pricing](https://www.hubspot.com/company-news/hubspots-customer-agent-and-prospecting-agent-now-you-pay-when-the-task-is-complete)
- ClickUp: [Super Agent permissions](https://help.clickup.com/hc/en-us/articles/36926065055127-Super-Agent-privacy-security-and-permissions) ·
  [Goals & OKRs](https://help.clickup.com/hc/en-us/articles/30806500075031-Use-Brain-AI-for-goals-and-OKRs)
- monday: [AI overview](https://monday.com/blog/ai-agents/everything-monday-ai-can-do/)
- Glean: [Background agents security](https://docs.glean.com/security/agents/background-agents) ·
  [Agents 2026](https://www.glean.com/blog/glean-agents-go-2026)
- Linear: [Agents](https://linear.app/developers/agents) ·
  [Best practices](https://linear.app/developers/agent-best-practices) ·
  [Pulse](https://linear.app/docs/pulse)
- Nội bộ (chỉ đọc): `docs/agent.md`, `apps/agent/agent/lib/approval.ts`,
  `apps/agent/agent/skills/`, `packages/validation/src/agent-manifest.ts`,
  `docs/plan/lo-trinh-okr.md` trên `origin/onehub`, ghi nhớ
  `ai-gateway-key-and-budget.md`.
