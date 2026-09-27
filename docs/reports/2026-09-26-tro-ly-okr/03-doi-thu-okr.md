# 03 — Tính năng AI của các nền tảng OKR chuyên dụng

Quét ngày 2026-09-26. Mục đích: tìm (a) mức nền ai cũng có, (b) điểm khác biệt
đáng học, (c) sai lầm nên tránh — để đặt mức cho trợ lý OKR của CRM OneHub (lượt
9 `tro-ly-okr`, lượt 10 `okr-trong-chat`, R3 ngày 2026-12-18) và cho kiến trúc
agent/skill mở rộng được.

## Cách đọc

- **Mức tin.** *cao* = trang chính chủ hoặc tài liệu hỗ trợ của hãng, đã đọc
  trực tiếp. *vừa* = báo chí/bên thứ ba uy tín, hoặc trang chính chủ nhưng chỉ
  thấy qua đoạn trích của công cụ tìm kiếm (trang trả 403). *thấp* = suy luận
  của người viết.
- **"Đã thấy"** là điều có trong nguồn kèm link. **"Suy luận"** được ghi rõ bằng
  chữ *Suy luận:* ở đầu câu.
- **"Không thấy"** nghĩa là không có trong các nguồn đã đọc, không phải bằng
  chứng rằng tính năng chắc chắn không tồn tại.
- Giới hạn của lần quét: G2 và Capterra chặn (403) nên không có đánh giá của
  người dùng; trung tâm hỗ trợ của Betterworks, Leapsome, WorkBoard (learn.)
  trả 403 nên các ý từ đó ở mức *vừa*. Quantive.com nay chuyển hướng sang
  workboard.com.

## Tóm tắt trong sáu câu

1. **Mức nền năm 2026 đã rõ:** soạn OKR từ một câu hoặc một tài liệu, kiểm chất
   lượng KR, tóm tắt tiến độ, hỏi đáp trên dữ liệu OKR theo quyền người hỏi, công
   tắc AI cho quản trị, cam kết không dùng dữ liệu để huấn luyện — và **MCP
   server** (Tability, Perdoo, Profit.co, Betterworks, Lattice, Leapsome đều đã
   có; ít nhất Perdoo 04/2026, Betterworks 07/2026, Lattice 2026 mới ra năm nay).
2. **Ghi thay người luôn qua một bước duyệt:** mọi thao tác ghi của AI mà tài liệu
   mô tả (MCP của Profit.co và Betterworks, gợi ý cập nhật của Cascade, Draft with
   Rovo của Atlassian) đều yêu cầu người xác nhận. Tability là ngoại lệ đáng chú
   ý: Tabby tự tạo check-in từ dữ liệu công cụ, *kể cả khi người phụ trách nghỉ*.
3. **Khác biệt thật nằm ở nguồn ngữ cảnh và nhịp vận hành**, không ở ô chat:
   Cascade đọc biên bản họp và tệp để gợi ý cập nhật có mức tự tin; WorkBoard
   chạy agent theo nhịp của người quản lý (bản tin sáng, memo thứ Hai, tổng kết
   thứ Sáu, MBR/QBR) và phát vào Teams/Slack.
4. **Quyền riêng tư đã thành tính năng:** Cascade chỉ cho thấy insight với người
   có quyền với nguồn gốc; Betterworks tắt AI mặc định và bật theo từng tính
   năng, từng nhóm; Perdoo tách một coach chỉ biết phương pháp khỏi một assistant
   đọc được dữ liệu.
5. **AI không cứu được vòng dùng yếu:** Microsoft đưa Copilot vào Viva Goals (GA
   quý 1/2024) nhưng vẫn khai tử sản phẩm ngày 2025-12-31 vì mức dùng không tăng.
6. **Không nền tảng nào công bố cách họ đo chất lượng AI** ngoài con số tiếp thị
   ("chất lượng OKR tăng 40%", "căn chỉnh nhanh gấp 2"). Không nền tảng nào nhắc
   Zalo.

## Bối cảnh thị trường: gộp và khai tử

| Sự kiện | Ngày | Nguồn | Mức tin |
| --- | --- | --- | --- |
| Microsoft mua Ally.io, thành Viva Goals | 2021-10 | https://www.tability.io/compare/shutdowns | vừa (nguồn của đối thủ) |
| Koan đóng, bán cho Gtmhub (sau là Quantive) | 2022-02 | https://www.tability.io/compare/shutdowns | vừa |
| Viva Goals ngừng phát triển; khai tử 2025-12-31; lý do: mức dùng không tăng; Microsoft không thay bằng sản phẩm nào | báo 2024-12-05 | https://learn.microsoft.com/en-us/viva/goals/goals-retirement-faq | cao |
| WorkBoard mua Quantive; khách Quantive chuyển sang WorkBoard | 2025-05-28 | https://www.workboard.com/news/workboard-acquires-quantive | cao |
| quantive.com/ai chuyển hướng 302 về workboard.com | quan sát 2026-09-26 | https://quantive.com/ai | cao |

Hệ quả cho bản quét: Quantive, Koan, Ally.io không còn là sản phẩm độc lập; phần
AI của Quantive được xét như lịch sử của WorkBoardAI.

---

## Từng nền tảng

### Tability (mốc so sánh)

Đã thấy ([tability.io/ai](https://www.tability.io/ai), [Tabby](https://tability.io/features/ai/okr-agent), [pricing](https://www.tability.io/pricing), mức tin cao):

- **Tabby** — soạn và nhập OKR từ nguồn bất kỳ, viết lại mục tiêu khi gõ; coach
  đọc metadata của KR và lịch sử check-in rồi đưa tóm tắt kèm việc nên làm.
- **Check-in tự động** — kéo số từ công cụ đã nối và tạo check-in từ hoạt động
  thật, kể cả khi người phụ trách nghỉ.
- **Báo cáo định kỳ và nhìn lại** gửi vào hộp thư hoặc Slack; **AI-Mode** hỏi đáp
  trên OKR và dữ liệu workspace.
- **Native Agents** — giao mục tiêu cho agent để nó tạo việc, làm trong app và
  báo tiến độ; gói "Agentic" (sắp ra) có agent-to-agent.
- **MCP server** — đọc OKR, xem tiến độ, tạo check-in; tài liệu nói 27 công cụ
  ([guides.tability.io](https://guides.tability.io/docs/become-a-tability-power-user/integrations/tability-mcp-server), mức tin vừa — chỉ thấy qua đoạn trích).
- **Quản trị & riêng tư** — mọi tính năng AI tắt được, *toàn workspace*; dùng
  OpenAI enterprise API; không huấn luyện; xoá đầu vào AI sau 30 ngày; lưu trữ
  US/EU/AU.
- **Đong đếm** — gói Basic 4.000 AI credit và 25 prompt mỗi người mỗi tháng; gói
  Premium 10.000 credit, 500 prompt, thêm MCP và Teams.

### WorkBoard (đã gộp Quantive)

Đã thấy (mức tin cao trừ khi ghi khác):

- **Chief of Staff Agent** — soạn OKR từ kết quả cũ và ưu tiên của cấp trên;
  soạn báo cáo tuần, pre-read, agenda, scorecard, tài liệu MBR/QBR; phân tích
  rủi ro; nhắc theo dõi việc; phát scorecard qua Teams, Slack, email. Nguồn:
  hệ thống của WorkBoard cộng Jira, Salesforce, kênh Teams, lịch.
  [chief-of-staff-agent](https://www.workboard.com/products/chief-of-staff-agent)
- **OKR Creation & Alignment** — chấm OKR theo độ rõ, độ tập trung, đo được;
  tìm phụ thuộc chéo đội "dưới một phút"; người quản lý duyệt trước khi ghi vào hệ
  thống. [cos-okr-creation-alignment](https://www.workboard.com/products/cos-okr-creation-alignment)
- **Gen2 agents** — giao diện chat có bảng dữ liệu sống; **bộ nhớ** qua các
  phiên; bản tin **Daily Focus**; **Monday memo / Friday wrap-up**; gợi ý kudos
  hằng tuần trong Slack/Teams; pre-read 1:1 đồng bộ Outlook; đọc biên bản họp
  Teams; người dùng chọn dữ liệu agent được đọc trong **Agent Settings**; agent
  "neo" vào vai trò, đội, mục tiêu của người dùng.
  [gen2-ai-agents](https://www.workboard.com/resources/product-updates/gen2-ai-agents)
- **Leadership Coach Agent** — chuẩn bị 1:1 và cuộc nói chuyện khó theo khung SBI.
- **Portfolio Analyst Agent** (2026) — mô hình hoá kịch bản, báo cáo điều hành,
  chỉ ra chỗ thực thi đang chững. [workboard.com](https://www.workboard.com/)
- **Agent trong M365 Copilot** — xem, đặt OKR bằng chat trong Word/Excel/Outlook
  ([news](https://www.workboard.com/news/ai-agent-for-m365-copilot), vừa); tuyên
  bố hỗ trợ A2A và MCP ([news](https://www.workboard.com/news/ai-agents-general-availability), vừa).
- **Số thực tế từ công cụ** — Salesforce, Jira, Power BI, Snowflake… cập nhật KR
  không cần nhập tay. [integrations](https://www.workboard.com/product/integrations.php)
- **Chấp nhận thị trường** — 75% khách triển khai agent sau lần ra mắt tháng 4/2025;
  nhiều khách mới thay Viva Goals. [1H update](https://www.workboard.com/workboard-in-the-news/20250915-1hupdate.php) (cao, tự công bố)
- **Quantive trước khi gộp** — StrategyAI (2024-02) gồm Strategies/Results/Signals,
  một AI assistant đọc bối cảnh kinh doanh và lịch sử hiệu suất
  ([SiliconANGLE](https://siliconangle.com/2024/02/29/quantive-unveils-ai-driven-strategy-platform-enhance-business-decision-making/), vừa);
  KR tự động từ Insight nối 150+ nguồn dữ liệu (tính năng không-AI của Gtmhub,
  [help](https://help.gtmhub.com/en/articles/4516634-how-to-create-an-automated-key-result), cao).

### Perdoo

Đã thấy ([release notes](https://support.perdoo.com/en/articles/10153623-release-notes-coming-soon), [perdoo.com](https://www.perdoo.com/), [pricing](https://www.perdoo.com/pricing), cao):

- **Vince AI Coach** (2026-01) — coach huấn luyện trên tài liệu phương pháp của
  Perdoo; trả lời câu hỏi OKR, soi nháp mục tiêu. Có mặt ở cả gói Free.
- **AI Assistant** — soạn Strategic Pillar, KPI, OKR, Initiative (mở rộng
  2026-02); tóm tắt check-in, chỉ ra rủi ro, hỏi đáp trên chiến lược. Khác Vince,
  assistant **đọc được dữ liệu tài khoản** (support, vừa).
- **Nháp cập nhật tiến độ** (2026-05) — đọc bối cảnh, lịch sử tiến độ và mục
  tiêu con, viết một đoạn: đổi gì, vì sao, bước tiếp. Chỉ gói Supreme.
- **MCP server** (2026-04) và nhịp mở rộng hằng tháng: tạo/sửa mục tiêu (07),
  căn chỉnh và nộp review (08), Claude connector (08), họp, tag, đội (09). Gói
  Premium trở lên.
- **AI Chat** (sắp ra) — dựng báo cáo, biểu đồ, soát mục tiêu, xếp lịch họp.
- **Đong bằng token:** Free 20k, Premium 250k, Supreme 500k token mỗi tháng.

### Profit.co

Đã thấy ([ai-agents](https://www.profit.co/ai-agents/), [ai-info](https://www.profit.co/ai-info/), [in Claude](https://www.profit.co/integrations/profit-co-in-claude/), cao). Không thấy tên "Maya"/"Mia"; bộ AI tên **Athena**.

- Danh mục agent theo việc: **Authoring** (soạn OKR từ chiến lược), **Quality**
  (chấm rõ ràng, đo được, căn chỉnh; bắt mục tiêu mơ hồ hoặc chồng nhau),
  **Alignment**, **OKR Progress** (tóm tắt, cảnh báo sớm KR nguy cơ), **OKR
  Review** (gom tiến độ về một chỗ), **Answer** (hỏi đáp trên dữ liệu), **Meetings**
  (rút việc từ họp, Slack/Teams). Thêm các agent cho dự án và đánh giá nhân sự.
- **MCP trong Claude/ChatGPT** — 9 công cụ đọc và ghi (tạo mục tiêu, KR, check-in,
  việc); OAuth 2.0; theo đúng quyền trong Profit.co, OKR riêng tư vẫn riêng tư;
  **hỏi xác nhận trước mỗi lần ghi**; check-in bắt buộc có giá trị và trạng thái.
- Con số tiếp thị: "chất lượng OKR tăng 40%" — không kèm phương pháp đo.

### Betterworks

- **Goal AI Assist / Goal Intelligence** — gợi ý mục tiêu theo vai, đội, ưu tiên
  công ty, **giải thích vì sao gợi ý và dùng dữ liệu nào**.
  [ai-for-hr](https://www.betterworks.com/ai-for-hr) (cao);
  [help](https://support.betterworks.com/hc/en-us/articles/25455979340173-Goal-AI-Assist) (vừa, 403).
- **Công tắc quản trị** — mọi tính năng AI **tắt mặc định**; quản trị bật toàn tổ
  chức, rồi bật từng tính năng, cho mọi người hoặc chỉ nhóm/phòng ban chọn; chạy
  trên **LLM tự host** trong AWS của Betterworks (help, vừa).
- **Tóm tắt 1:1, tổng hợp đánh giá** có bằng chứng; không dùng dữ liệu khách để
  huấn luyện (cao).
- **MCP server** (beta 2026-07-14) — mục tiêu, đội, người dùng, ghi nhận; theo mô
  hình quyền sẵn có; thao tác ghi (tạo/sửa mục tiêu, bình luận) cần người xác
  nhận. [announcement](https://www.betterworks.com/betterworks-launches-new-ai-capabilities-that-connect-performance-data-to-ai-assistants), [mcp](https://www.betterworks.com/product/mcp) (cao)

### Mooncamp

- **Không thấy tính năng AI.** Chỉ mục tài liệu cho LLM của chính Mooncamp không có
  trang nào về AI hay MCP; có trang tích hợp dữ liệu (Jira, Salesforce, Power BI,
  HubSpot, Sheets…) để tự cập nhật KR, Slack/Teams, OpenAPI.
  [llms.txt](https://mooncamp.com/docs/llms.txt) (cao).
- Bài thử của Tability (2026-09-10) cũng không thấy AI hay MCP
  ([compare](https://www.tability.io/compare/platform/mooncamp), vừa — nguồn đối thủ).

### Weekdone

- **Không thấy AI.** "OKR Wizard" là trình hướng dẫn từng bước, không được mô tả
  là AI ([product](https://weekdone.com/product), cao). Năm bài mới nhất trên blog
  sản phẩm không nhắc AI ([blog](https://blog.weekdone.com/weekdone-product-company-news/), cao);
  một bên thứ ba nói không có cập nhật lớn từ 2023-03
  ([okrstool](https://www.okrstool.com/blog/weekdone-alternative), vừa).
- Điểm bán là **coach OKR là người**, kèm mọi gói trả phí.

### Leapsome

- **Gợi ý KR và initiative từ một câu** ("một câu, hai cú bấm"); tiêu đề ≥ 10 ký
  tự mới gợi ý. [blog](https://www.leapsome.com/blog/leapsome-ai-innovations) (cao); help (vừa)
- **Leapy Copilot** — Smart Actions trong Goals: tóm tắt tiến độ và cập nhật gần
  đây ([help](https://help.leapsome.com/hc/en-us/articles/19988784826013-Leapy-Your-AI-Copilot), vừa, 403).
- **Agent** cho HR (Development Coach, PeopleOps Partner, HR Helpdesk, Data
  Analyst); agentic workflow mô tả bằng lời; truy cập "headless" qua Slack và
  Claude qua MCP; quyền theo từng trường và tài liệu, nhật ký đầy đủ, **người ký
  duyệt các thao tác có hệ quả**. [leapsome-ai](https://site.leapsome.com/product/leapsome-ai) (cao)

### Lattice

- **Lattice AI Agent** hỏi bằng lời trên mục tiêu: mục tiêu nào của đội đang trễ,
  tiến độ cấp công ty, căn chỉnh toàn tổ chức; trả lời số định lượng.
  [2026-01 updates](https://lattice.com/blog/january-2026-product-updates) (cao)
- **Auto-drafted Updates** (công bố, ra sau trong 2026) — từ ghi chú thô thành cập
  nhật trạng thái, lấy bối cảnh từ 1:1, mục tiêu, công cụ làm việc; **Lattice MCP**
  (early access). [Lattiverse '26](https://lattice.com/blog/everything-we-announced-at-lattiverse-2026) (cao)
- **Ranh giới nói thẳng:** AI không ra quyết định nhân sự (thăng tiến, xếp hạng).
  [lattice.com/ai](https://lattice.com/ai) (cao)
- **Bài học ngược:** 2024-07-09 Lattice công bố cho "digital worker" (AI) có hồ
  sơ nhân viên và vị trí trên sơ đồ tổ chức; ba ngày sau rút lại vì phản ứng dữ
  dội. [SHRM](https://www.shrm.org/topics-tools/news/technology/lattice-scraps-plans-to-treat-ai-bots-as-employees-after-backlash),
  [Fortune](https://fortune.com/2024/07/12/lattice-ai-workers-sam-altman-brother-jack-sarah-franklin) (vừa)

### 15Five

- **Kona** — coach cho người quản lý dựa trên 1:1; ghi chú, việc cần làm, agenda;
  đưa insight vào Slack, Teams, email. **Focus Briefs** — bản tin tuần cho người
  quản lý về ưu tiên, tiến độ, chỗ cần chú ý. **AI-Assisted Reviews**.
  [15five-ai](https://www.15five.com/products/15five-ai) (cao)
- **Không thấy AI cho soạn hay kiểm OKR.** Tài liệu dữ liệu AI liệt kê các tính
  năng có gửi dữ liệu cho bên xử lý phụ — không có mục tiêu hay check-in; bên xử lý
  không huấn luyện, không lưu sau khi trả lời.
  [AI overview](https://success.15five.com/hc/en-us/articles/19976830547099-15Five-AI-Overview-How-AI-is-used-across-15Five) (cao)

### Cascade Strategy

Đã thấy ([strategy-ai](https://www.cascade.app/strategy-ai), [ai-assisted-planning](https://www.cascade.app/tapestry/ai-assisted-planning), [changelog](https://feedback.cascade.app/changelog), cao):

- **AI Assisted Planning** — kéo thả PPT/Word/PDF/Excel thành kế hoạch có cấu
  trúc, tự nối các cấp, phát hiện việc trùng giữa các đội.
- **Tapestry Connect** (2026-03-26) — nối Teams/Zoom; AI rút insight từ họp, **ghép
  vào đúng mục tiêu**, soạn gợi ý cập nhật hiện ở cạnh mục tiêu **kèm mức tự tin**;
  **mọi cập nhật cần người duyệt** trước khi đăng.
- **Insights History & Meetings Hub** (2026-05-05) — dòng thời gian quyết định,
  vướng mắc, tiến độ; **insight chỉ hiện với người có quyền với cuộc họp/tệp
  gốc**.
- **Tải tệp lên** (2026-06-11) — rút dữ kiện thành gợi ý cập nhật; quản trị
  Cascade không đọc được tệp người dùng tải lên.
- **Tóm tắt AI** biết bối cảnh kế hoạch; **trả lời theo ngôn ngữ chiếm đa số của
  báo cáo** (2026-08-25); Strategy Intelligence nhận prompt tuỳ chỉnh; AI
  Executive Briefings; AI Risks & Dependencies.

### Microsoft Viva Goals (đã khai tử)

- **Copilot in Viva Goals** (công bố 2023-04, GA quý 1/2024) — gợi ý nháp OKR từ
  tài liệu Word (kế hoạch kinh doanh, chiến lược sản phẩm); tóm tắt trạng thái
  OKR, chỉ vướng mắc, gợi ý bước tiếp; gom dữ liệu để soạn check-in.
  [Microsoft 365 blog](https://microsoft.com/en-us/microsoft-365/blog/2023/04/20/introducing-copilot-in-microsoft-viva-a-new-way-to-boost-employee-engagement) (cao)
- **Quản trị** bật/tắt theo toàn tenant, người, nhóm qua Viva Feature Access
  Management; dùng được với giấy phép Viva Goals, không cần giấy phép Microsoft
  365 Copilot riêng. [copilot-intro](https://learn.microsoft.com/en-us/viva/goals/copilot-intro) (cao)
- **Khai tử** 2025-12-31: mức dùng không tăng, không đạt quy mô; không có sản phẩm
  thay; khách được khuyên chuyển sang công cụ OKR bên thứ ba.
  [retirement FAQ](https://learn.microsoft.com/en-us/viva/goals/goals-retirement-faq) (cao).
  Một phân tích bên ngoài thêm: OKR cần cam kết từ lãnh đạo, dòng Viva gây rối,
  người sáng lập Ally.io rời đi 2023-12.
  [office365itpros](https://office365itpros.com/2024/12/09/viva-goals-retirement/) (vừa)

### Koan, Ally.io

- **Koan** nổi tiếng với nhịp **Reflections hằng tuần** (không phải AI); đóng
  2022-02, về Gtmhub; khách Koan phải chuyển hai lần (sang Quantive rồi WorkBoard).
  [tability shutdowns](https://www.tability.io/compare/shutdowns), [api-evangelist/koan](https://github.com/api-evangelist/koan) (vừa)
- **Ally.io** thành Viva Goals, rồi bị khai tử. Không còn thông tin AI riêng.

### Tham khảo ngoài danh sách: Atlassian Goals + Rovo

- **Draft with Rovo** soạn cập nhật trạng thái cho goal và project từ hoạt động gần
  đây của các app đã nối; người phải soát rồi mới lưu nháp hoặc đăng; quản trị bật
  qua công tắc AI. [support](https://support.atlassian.com/platform-experiences/docs/create-project-updates-with-rovo/) (cao)
- **Goals & Projects skills trong Rovo Studio** — agent tuỳ chỉnh dùng lại các
  skill tìm goal, lấy cập nhật, hiểu phụ thuộc, chỉ rủi ro, tạo cập nhật; nút Rovo
  theo ngữ cảnh trên trang goal.
  [community](https://community.atlassian.com/forums/Goals-and-Projects-articles/More-ways-to-bring-Rovo-to-your-Goals-and-Projects-workflow/ba-p/3252435) (vừa — chỉ thấy qua đoạn trích).
  Đây là mẫu gần nhất với "kiến trúc skill" mà OneHub đang tìm.

---

## Ma trận so sánh

Ký hiệu: **●** có, thấy ở nguồn chính chủ · **◐** có một phần, chỉ công bố
chưa ra, dành cho miền khác (HR), hoặc chỉ thấy ở nguồn mức vừa · **○** không thấy
trong nguồn đã đọc · **✕** sản phẩm đã ngừng (ghi nhận lúc còn chạy).

Cột: 1 Soạn OKR · 2 Kiểm chất lượng · 3 Căn chỉnh/gợi ý cha · 4 Nháp check-in ·
5 Tự đo từ tích hợp · 6 Tóm tắt/báo cáo · 7 Rủi ro/dự báo · 8 Hỏi đáp/chat ·
9 Coaching/nhìn lại · 10 Agent tự hành · 11 Kênh Slack/Teams/email · 12 Quản
trị/quyền/riêng tư · 13 API/MCP

| Nền tảng | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tability | ● | ● | ○ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| WorkBoard (+Quantive) | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | ◐ |
| Perdoo | ● | ● | ◐ | ● | ○ | ● | ● | ● | ● | ○ | ○ | ◐ | ● |
| Profit.co | ● | ● | ● | ◐ | ○ | ● | ● | ● | ◐ | ◐ | ◐ | ● | ● |
| Betterworks | ● | ◐ | ◐ | ○ | ○ | ◐ | ◐ | ◐ | ◐ | ○ | ○ | ● | ● |
| Mooncamp | ○ | ○ | ○ | ○ | ● | ○ | ○ | ○ | ○ | ○ | ◐ | ○ | ◐ |
| Weekdone | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| Leapsome | ● | ◐ | ◐ | ○ | ○ | ◐ | ○ | ● | ◐ | ◐ | ● | ● | ● |
| Lattice | ○ | ○ | ◐ | ◐ | ○ | ● | ● | ● | ◐ | ◐ | ○ | ◐ | ● |
| 15Five | ○ | ○ | ○ | ○ | ○ | ◐ | ○ | ◐ | ◐ | ◐ | ● | ● | ○ |
| Cascade | ● | ● | ● | ● | ◐ | ● | ● | ◐ | ○ | ◐ | ◐ | ● | ○ |
| Viva Goals ✕ | ● | ● | ◐ | ● | ◐ | ● | ◐ | ● | ○ | ○ | ● | ● | ◐ |
| Atlassian Goals + Rovo | ○ | ○ | ◐ | ● | ○ | ◐ | ◐ | ● | ○ | ◐ | ○ | ● | ◐ |

Ghi chú các ô dễ hiểu sai:

- Cột 5 phần lớn là **tích hợp không-AI** (nối nguồn số vào KR). Nó vẫn vào ma
  trận vì là tiền đề của mọi tóm tắt và cảnh báo có nghĩa.
- Tability cột 3: không thấy gợi ý căn chỉnh bằng AI trong các trang đã đọc.
- Tability cột 12 là ●, nhưng công tắc chỉ ở mức **toàn workspace**; Betterworks
  và Viva Goals bật được theo nhóm.
- Cột 9 của Leapsome, Lattice, 15Five, Betterworks là coaching **người quản lý**
  (1:1, đánh giá), không phải coaching OKR — nên ◐.
- Perdoo cột 11: không thấy AI trong Slack/Teams; AI ra ngoài qua MCP client.
- WorkBoard cột 13: MCP và A2A là tuyên bố trong thông cáo, chưa thấy tài liệu kỹ
  thuật.

---

## (a) Mức nền — ai cũng có, thiếu là tụt hạng

| Việc | Ai có (●) | Căn cứ |
| --- | --- | --- |
| Soạn OKR từ một câu hoặc một tài liệu | Tability, WorkBoard, Perdoo, Profit.co, Betterworks, Leapsome, Cascade, Viva Goals | các mục trên |
| Kiểm chất lượng KR (rõ, đo được, không chồng) | Tability, WorkBoard, Perdoo, Profit.co, Cascade, Viva Goals | các mục trên |
| Tóm tắt tiến độ/check-in cho người quản lý | 11/13 hàng có ● hoặc ◐ | ma trận cột 6 |
| Hỏi đáp trên dữ liệu OKR **theo quyền người hỏi** | Tability, WorkBoard, Perdoo, Profit.co, Lattice, Viva Goals | Profit.co và Betterworks ghi rõ "chỉ thấy dữ liệu đã có quyền" |
| Công tắc AI cho quản trị; không huấn luyện trên dữ liệu khách | Tability, Betterworks, 15Five, Viva Goals, Atlassian | các mục trên |
| **MCP server** ra Claude/ChatGPT | Tability, Perdoo, Profit.co, Betterworks, Lattice, Leapsome — ba cái có ngày ra đều trong 2026 | các mục trên |
| **Nháp → người duyệt** cho mọi thao tác ghi | Profit.co MCP, Betterworks MCP, Cascade, Atlassian, WorkBoard (OKR) | các mục trên |
| Đong đếm AI theo gói | Perdoo (token/tháng), Tability (credit + prompt/người/tháng) | pricing hai hãng |

*Suy luận (thấp):* với nền tảng nội bộ, "mức nền" không phải để bán mà để người
dùng đã quen Tabby/Copilot không thấy thiếu. Sáu dòng đầu là mức tối thiểu của
lượt 9–10; MCP là tuỳ chọn (xem câu hỏi mở).

## (b) Điểm khác biệt đáng học

1. **Gợi ý cập nhật từ ngữ cảnh định tính, có mức tự tin, có duyệt** — Cascade
   Tapestry Connect: họp và tệp → ghép vào đúng mục tiêu → gợi ý kèm độ tự tin →
   người duyệt. Đây là cách duy nhất trong bản quét biến "những gì đã nói trong
   họp" thành cập nhật mà không ghi thay người. ([changelog](https://feedback.cascade.app/changelog), cao)
2. **Quyền của insight đi theo quyền của nguồn** — Cascade chỉ cho người có quyền
   với cuộc họp/tệp gốc thấy insight rút ra từ đó. Đúng khuôn OneHub cần cho vai
   «chỉ OKR»: một tóm tắt có dẫn tới thoả thuận thì người không được xem thoả
   thuận cũng không được xem câu đó. (cao)
3. **Agent theo nhịp vận hành của người quản lý** — WorkBoard: bản tin sáng,
   memo thứ Hai, tổng kết thứ Sáu, tài liệu MBR/QBR, phát vào Teams/Slack/email;
   có bộ nhớ qua phiên; người dùng chọn dữ liệu agent đọc. Tabby cũng có báo cáo
   định kỳ, nhưng WorkBoard gắn vào *cuộc họp cụ thể*. ([gen2](https://www.workboard.com/resources/product-updates/gen2-ai-agents), cao)
4. **Tách "biết phương pháp" khỏi "đọc dữ liệu"** — Perdoo cho Vince (không đọc dữ
   liệu) chạy ở mọi gói, còn assistant đọc dữ liệu thì đong bằng token. Hệ quả
   cho OneHub: phần coaching phương pháp chạy được cho mọi vai với rủi ro rò rỉ
   bằng không và chi phí thấp. (cao/vừa)
5. **Tắt mặc định, bật theo tính năng và theo nhóm, giải thích vì sao gợi ý** —
   Betterworks; Viva Goals cũng bật theo người/nhóm. Cho phép mở AI dần theo phòng
   ban thay vì bật một lần cho cả công ty ngày 26/10. (vừa/cao)
6. **Skill dùng lại, agent ghép từ skill** — Atlassian Rovo Studio cho agent tuỳ
   chỉnh dùng các skill của Goals & Projects (tìm, lấy cập nhật, phụ thuộc, rủi
   ro, tạo cập nhật). Profit.co thì đi đường ngược: 15+ agent đặt tên theo việc.
   *Suy luận (thấp):* danh mục agent theo tên là cách bán hàng; bên dưới, thứ mở
   rộng được là tầng skill/tool dùng chung — cùng tầng đó xuất ra MCP.
7. **MCP ghi có rào** — Profit.co: OAuth, theo quyền sẵn có, hỏi xác nhận trước
   khi ghi, check-in bắt buộc có giá trị và trạng thái. Perdoo mở rộng MCP hằng
   tháng tới cả ghi mục tiêu, căn chỉnh, nộp review. (cao)
8. **Nói thẳng AI sẽ không làm gì** — Lattice ghi rõ AI không ra quyết định nhân
   sự. OneHub đã có câu tương đương: Điểm cuối kỳ "không phải đánh giá nhân sự",
   máy không ghi số hay mức tự tin thay người (NG-05). (cao)
9. **Tóm tắt theo ngôn ngữ của nội dung** — Cascade trả lời theo ngôn ngữ chiếm
   đa số trong báo cáo. Với nội dung tiếng Việt lẫn tiếng Anh, đây là chi tiết
   nhỏ nhưng dễ sai. (cao)

## (c) Sai lầm nên tránh

1. **Đặt cược vào AI khi vòng dùng cơ bản chưa sống.** Viva Goals có Copilot, có
   Teams, có Microsoft đứng sau, vẫn bị khai tử vì mức dùng không tăng
   ([FAQ](https://learn.microsoft.com/en-us/viva/goals/goals-retirement-faq), cao).
   *Suy luận (vừa):* thứ giữ OKR sống là nhịp cập nhật tuần (Koan xây cả sản phẩm
   quanh Reflections); AI nên phục vụ nhịp đó, không thay nó. Khớp với điều kiện
   mở lượt 10 của lộ trình (chỉ mở khi số đo lượt 4 cho thấy cập nhật chậm).
2. **Nhân cách hoá AI trong một hệ thống về con người.** Lattice rút kế hoạch
   "digital worker" sau ba ngày ([SHRM](https://www.shrm.org/topics-tools/news/technology/lattice-scraps-plans-to-treat-ai-bots-as-employees-after-backlash), vừa).
   Tránh đặt agent làm "người phụ trách" KR hay đưa agent vào cây tổ chức.
3. **Máy viết check-in thay người.** Tabby tạo check-in từ hoạt động kể cả khi người
   phụ trách nghỉ ([Tabby](https://tability.io/features/ai/okr-agent), cao).
   *Suy luận (vừa):* điều đó tiện, nhưng làm mờ ai chịu trách nhiệm cho con số và
   mức tự tin; phần còn lại của thị trường (Profit.co, Betterworks, Cascade,
   Atlassian) đều bắt người duyệt mọi thao tác ghi. Lộ trình OneHub đã chặn điều
   này ở NG-05 — giữ nguyên.
4. **Mở MCP không xác thực.** Một MCP server bên thứ ba cho Perdoo ghi rõ endpoint
   không có xác thực: ai với tới server là dùng được token API của chủ
   ([glama](https://glama.ai/mcp/servers/nevilhulspas/perdoo-mcp), vừa). Nếu OneHub
   mở MCP, phải OAuth và theo quyền người dùng như Profit.co.
5. **Một công tắc cho cả tổ chức.** Tability chỉ tắt được toàn workspace; khi có
   vai «chỉ OKR» và nhiều phòng ban vào cùng ngày, một công tắc là quá thô.
   *Suy luận (vừa)* dựa trên đối chiếu với Betterworks/Viva Goals.
6. **Đo AI bằng con số tiếp thị.** "Chất lượng tăng 40%" (Profit.co), "căn chỉnh
   nhanh gấp 2, tốt gấp 10" (WorkBoard) không kèm phương pháp. *Suy luận (thấp):*
   thứ đo được thật là tỷ lệ nhận nguyên văn/sửa/bác mà lộ trình lượt 9 đã ghi.
7. **Đong theo người khi ngân sách là cả đội.** Tability và Perdoo đong theo
   người/gói (25 prompt/người/tháng ở Tability Basic). Với trần ~$20/tháng cho cả
   team, *suy luận (vừa)*: đong theo workspace, gom theo đơn vị (một lượt chạy cho
   một phòng ban, không một phiên mỗi KR), lớp luật chạy trước mô hình.
8. **Bị kẹt khi nhà cung cấp gộp hoặc khai tử.** Khách Koan và Ally.io phải chuyển
   hai lần trong bốn năm (vừa). Không áp dụng trực tiếp vì OneHub tự xây, nhưng
   là lý do giữ đường xuất dữ liệu OKR và không khoá vào một nhà cung cấp mô hình.

---

## Điều gì làm một AI OKR tốt hơn Tability

Chỉ liệt kê điểm có bằng chứng — hoặc Tability không có trong nguồn chính chủ,
hoặc đối thủ làm tốt hơn một cách quan sát được. Mỗi điểm kèm mức tin.

| # | Hơn Tabby ở đâu | Bằng chứng | Mức tin | Chỗ trong lộ trình OneHub |
| --- | --- | --- | --- | --- |
| 1 | **Số gốc nằm ngay trong hệ thống, bấm vào ra bản ghi.** Tabby phải kéo số qua tích hợp; OneHub có thoả thuận, cuộc gọi, email ngay trong CRM, nên trợ lý giải thích được *vì sao* con số đổi bằng bản ghi thật | Tability kéo từ công cụ đã nối; WorkBoard coi "số thực tế lấy từ nguồn" là lõi; Gtmhub tự cập nhật KR từ Insight | vừa | lượt 6 `so-okr-tu-chay` là tiền đề của mọi tóm tắt có nghĩa |
| 2 | **Quyền của câu trả lời đi theo quyền của nguồn**, không chỉ công tắc toàn workspace | Tability chỉ nêu tắt toàn workspace; Cascade khoanh insight theo quyền nguồn; Profit.co/Betterworks theo mô hình quyền sẵn có | cao (quan sát) | vai «chỉ OKR» (lượt 2) áp cả ở công cụ đọc của agent |
| 3 | **Bật theo phòng ban, tắt mặc định** | Betterworks, Viva Goals bật theo nhóm; Tability không | vừa | mở AI dần từ R3 thay vì một lần |
| 4 | **Người giữ số và mức tự tin, máy giữ nháp** | Tabby tự tạo check-in kể cả khi nghỉ; bốn đối thủ bắt duyệt mọi thao tác ghi | cao (quan sát) / vừa (đánh giá) | NG-05; gợi ý hiện câu cũ cạnh câu mới, nhận từng dòng |
| 5 | **Ngữ cảnh định tính có mức tự tin** — từ ghi chú họp, email, cập nhật tuần — thành gợi ý gắn đúng KR | Cascade Tapestry Connect; không thấy tương đương trên các trang Tability đã đọc | vừa | sau lượt 9, khi nguồn Gmail/lịch của CRM đã có; cần chốt riêng tư |
| 6 | **Nhịp theo cuộc họp thật** — bản tin trước họp tuần, memo thứ Hai | WorkBoard Monday memo / Friday wrap-up / pre-read; Tability có báo cáo định kỳ nhưng không gắn họp | vừa | lượt 5 (họp tuần trên cùng một màn) + lượt 9 |
| 7 | **Mọi câu tóm tắt dẫn về lần cập nhật gốc, số được máy kiểm lại** | Betterworks giải thích dữ liệu đã dùng; không vendor nào công bố kiểm số tự động | vừa (Betterworks) / thấp (phần còn lại) | lượt 9 đã ghi: số lệch thì bỏ câu |
| 8 | **Đo chất lượng AI bằng hành vi người dùng**, không bằng khẩu hiệu | không vendor nào công bố tỷ lệ nhận/sửa/bác | thấp (vắng bằng chứng) | lượt 9 đếm nhận nguyên văn/sửa/bác |
| 9 | **Kênh địa phương: Zalo** | không trang nào trong bản quét nhắc Zalo; tất cả dừng ở Slack/Teams/email | vừa (vắng bằng chứng) | lượt 10, nếu nền tảng bot cho nút |
| 10 | **Chi phí theo đơn vị, không theo người** | Tability/Perdoo đong theo người/gói; trần của OneHub là theo team | vừa | trần chi tiêu tháng của lượt 9; gom theo đơn vị qua `AgentTask` |
| 11 | **Skill dùng chung cho mọi agent và mọi kênh** — trợ lý web, Slack, Zalo, (tuỳ chọn) MCP cùng gọi một bộ skill theo quyền | Atlassian Rovo skills; Tability/Perdoo/Profit.co xuất cùng dữ liệu qua MCP | vừa | kiến trúc — xem báo cáo 05–08 |

Những chỗ Tabby đang **hơn** OneHub và chưa nên đuổi theo ngay (có bằng chứng):

- **Native Agents** tự làm việc và báo tiến độ, agent-to-agent (gói Agentic sắp
  ra). *Suy luận (thấp):* chưa có bằng chứng người dùng OKR cần điều này; đi ngược
  điều (c)-3.
- **MCP 27 công cụ** đọc và ghi. Với OneHub, MCP ra ngoài chỉ đáng khi nhân viên
  thật sự dùng Claude/ChatGPT cho việc — đây là câu hỏi mở, không phải mức nền bắt
  buộc.

## Hệ quả cho kiến trúc (ngắn — chi tiết ở các báo cáo khác)

*Suy luận (vừa)*, rút từ những gì đối thủ đã phải làm:

- **Một tầng skill/tool OKR có quyền** (đọc OKR, đọc cập nhật tuần, đọc chỉ số,
  soạn nháp, chấm chất lượng) — mọi bề mặt (nút trong editor, tóm tắt tuần, chat,
  Slack/Zalo, MCP) gọi cùng tầng đó. Quyền kiểm ở tầng tool, không ở prompt.
- **Hai lớp tri thức tách nhau:** tri thức phương pháp (tĩnh, không đọc dữ liệu,
  rẻ, cho mọi vai) và tri thức dữ liệu (đọc theo quyền, đong chi phí) — mẫu Vince
  vs Assistant của Perdoo.
- **Mọi đầu ra ghi là nháp có trạng thái** (đề xuất → nhận/sửa/bác), lưu để đo;
  gợi ý bị bác không mời lại.
- **Việc theo lịch chạy qua hàng `AgentTask`** (tóm tắt tuần, bản tin trước họp,
  cảnh báo lệch vạch), gom theo đơn vị — khớp luật "trí khôn ở `apps/agent`".
- **Công tắc theo tính năng × nhóm**, tắt mặc định, thiếu khoá thì nút biến mất
  (`capabilities.ts`).

## Câu hỏi mở

1. **MCP ra ngoài có trong phạm vi R3 không?** Sáu nền tảng đã có, nhưng với vai
   «chỉ OKR» nó là một đường vào nữa phải đo (lượt 2 liệt kê: màn, tRPC, REST,
   khoá API, trợ lý). Khuyến nghị: để sau R3.
2. **Ghi chú họp và email có được làm nguồn gợi ý cập nhật không?** Đây là khác
   biệt lớn nhất quan sát được (Cascade), nhưng cần quy tắc riêng tư kiểu "quyền
   theo nguồn" trước.
3. **Nội dung OKR có được gửi tới nhà cung cấp mô hình qua AI Gateway không** —
   điều kiện mở lượt 9; đối thủ trả lời bằng ba cách: OpenAI enterprise + xoá sau 30
   ngày (Tability), LLM tự host (Betterworks), bên xử lý không lưu (15Five).
4. **Zalo bot có hỗ trợ nút tương tác và xác thực người bấm không** — quyết định
   lượt 10 có làm Zalo hay chỉ Slack.
5. Chưa có dữ liệu đánh giá của người dùng (G2/Capterra chặn) về chất lượng thực
   của AI ở các hãng — nếu cần, phải đọc bằng trình duyệt có đăng nhập.

## Nguồn chính (theo nền tảng)

- Tability: https://www.tability.io/ai · https://tability.io/features/ai/okr-agent · https://www.tability.io/pricing · https://guides.tability.io/docs/become-a-tability-power-user/integrations/tability-mcp-server · https://www.tability.io/compare/shutdowns
- WorkBoard/Quantive: https://www.workboard.com/ · https://www.workboard.com/products/chief-of-staff-agent · https://www.workboard.com/products/cos-okr-creation-alignment · https://www.workboard.com/resources/product-updates/gen2-ai-agents · https://www.workboard.com/product/integrations.php · https://www.workboard.com/workboard-in-the-news/20250915-1hupdate.php · https://www.workboard.com/news/workboard-acquires-quantive · https://siliconangle.com/2024/02/29/quantive-unveils-ai-driven-strategy-platform-enhance-business-decision-making/ · https://help.gtmhub.com/en/articles/4516634-how-to-create-an-automated-key-result
- Perdoo: https://www.perdoo.com/ · https://www.perdoo.com/pricing · https://support.perdoo.com/en/articles/10153623-release-notes-coming-soon · https://glama.ai/mcp/servers/nevilhulspas/perdoo-mcp
- Profit.co: https://www.profit.co/ai-agents/ · https://www.profit.co/ai-info/ · https://www.profit.co/integrations/profit-co-in-claude/
- Betterworks: https://www.betterworks.com/ai-for-hr · https://www.betterworks.com/product/mcp · https://www.betterworks.com/betterworks-launches-new-ai-capabilities-that-connect-performance-data-to-ai-assistants · https://support.betterworks.com/hc/en-us/articles/25455979340173-Goal-AI-Assist
- Mooncamp: https://mooncamp.com/docs/llms.txt · https://www.tability.io/compare/platform/mooncamp
- Weekdone: https://weekdone.com/product · https://blog.weekdone.com/weekdone-product-company-news/ · https://www.okrstool.com/blog/weekdone-alternative
- Leapsome: https://www.leapsome.com/blog/leapsome-ai-innovations · https://site.leapsome.com/product/leapsome-ai · https://help.leapsome.com/hc/en-us/articles/19988784826013-Leapy-Your-AI-Copilot
- Lattice: https://lattice.com/ai · https://lattice.com/blog/january-2026-product-updates · https://lattice.com/blog/everything-we-announced-at-lattiverse-2026 · https://www.shrm.org/topics-tools/news/technology/lattice-scraps-plans-to-treat-ai-bots-as-employees-after-backlash
- 15Five: https://www.15five.com/products/15five-ai · https://success.15five.com/hc/en-us/articles/19976830547099-15Five-AI-Overview-How-AI-is-used-across-15Five
- Cascade: https://www.cascade.app/strategy-ai · https://www.cascade.app/tapestry/ai-assisted-planning · https://feedback.cascade.app/changelog · https://www.cascade.app/tapestry/ai-business-context
- Viva Goals: https://learn.microsoft.com/en-us/viva/goals/goals-retirement-faq · https://learn.microsoft.com/en-us/viva/goals/copilot-intro · https://microsoft.com/en-us/microsoft-365/blog/2023/04/20/introducing-copilot-in-microsoft-viva-a-new-way-to-boost-employee-engagement · https://office365itpros.com/2024/12/09/viva-goals-retirement/
- Koan: https://github.com/api-evangelist/koan
- Atlassian: https://support.atlassian.com/platform-experiences/docs/create-project-updates-with-rovo/ · https://community.atlassian.com/forums/Goals-and-Projects-articles/More-ways-to-bring-Rovo-to-your-Goals-and-Projects-workflow/ba-p/3252435
