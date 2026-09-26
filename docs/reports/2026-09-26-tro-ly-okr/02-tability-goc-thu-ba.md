# 02 — AI của Tability nhìn từ bên ngoài: kiểm chứng độc lập

> Ngày soạn: 2026-09-26. Phạm vi: kiểm chứng những gì Tability nói về AI của họ bằng nguồn **không phải trang marketing** (G2, Gartner, GetApp, Product Hunt, App Store, bài của đối thủ, nhà đầu tư, trang pháp lý/tài liệu kỹ thuật), rồi so ngược với trang marketing.
>
> Quy ước mức tin: **cao** = trang chính chủ loại tài liệu/pháp lý/giá (không phải trang quảng bá); **vừa** = bên thứ ba có uy tín, hoặc trang chính chủ loại blog/quảng bá; **thấp** = suy luận, số ước tính, trang tổng hợp, hoặc đoạn trích lấy từ kết quả tìm kiếm mà không mở được trang gốc.
> Mỗi khẳng định đều ghi rõ **[thấy trong nguồn]** hoặc **[suy luận]**.

---

## 0. Giới hạn của lần kiểm chứng này (đọc trước)

- **G2, Capterra, Gartner Peer Insights, GetApp (.com), SelectHub, Crozdesk, PeopleManagingPeople đều trả 403** khi mở trực tiếp. Tôi không lách lớp chặn bot. Mọi nội dung của G2/Gartner/Capterra dưới đây lấy từ **đoạn trích trong kết quả tìm kiếm**, nên mức tin tối đa là *vừa*, và **không đếm được** có bao nhiêu bài đánh giá nhắc tới AI.
- **Reddit**: tìm `site:reddit.com tability` không ra thảo luận nào. Không có bằng chứng là cộng đồng bàn về AI của Tability.
- **YouTube**: chỉ đọc được tiêu đề và tên kênh (qua oEmbed). Mọi video tìm được đều do **kênh Tability** đăng, nên không phải nguồn độc lập.
- **Không có** bài báo hay podcast độc lập nào đánh giá riêng AI của Tability. Podcast có Sten Pittet (Thinkydoers, The Product Experience) bàn về OKR và sự nghiệp, không phải về AI.
- Hệ quả: phần "người dùng thật nói gì về AI" **mỏng**. Kết luận của báo cáo này nghiêng về *điều gì chưa được chứng minh* nhiều hơn *điều gì đã chứng minh*.

---

## 1. Tóm tắt điều quan trọng nhất

1. **Chưa có bằng chứng độc lập nào cho thấy AI của Tability làm OKR tốt hơn.** Không có case study nào có con số. Trang khách hàng chỉ có lời khen định tính. Con số "giảm 80% thời gian báo cáo" không có phương pháp đo. Bài blog tổng kết 2024 và 2025 cũng không công bố số liệu sử dụng AI nào. [thấy trong nguồn]
2. **Hai nguồn "độc lập" quan trọng nhất đều có vấn đề:**
   - Tability tặng **5.000 AI credit mỗi tháng** cho ai đăng **đánh giá 5 sao** trên G2. Làm vậy trái quy định của chính G2, vốn cấm gắn phần thưởng với việc đánh giá tốt.
   - "OKR Software Benchmark" xếp Tability hạng 1, rồi được phát hành như thông cáo báo chí trên hàng chục trang tin địa phương. Nhưng benchmark đó **do chính Tability vận hành** và do CEO viết.
3. **Chính trang của Tability tự mâu thuẫn về điểm AI.** Trang `/ai` ghi "#1 về AI, 4.6/5, hơn WorkBoard". Trang benchmark AI của họ (cập nhật 15/09/2026) lại ghi **4.0/5, đồng hạng với WorkBoard**, và thừa nhận luồng agent và MCP của Tability "chưa được thử đầy đủ", trong khi `/ai` khoe 5/5 ở đúng hai mục đó.
4. **Kiến trúc thật đơn giản hơn lời quảng bá rất nhiều.**
   - Chỉ có **một nhà cung cấp LLM là OpenAI**: danh sách subprocessor cập nhật 12/06/2026 không có Anthropic hay Google.
   - Quota dùng AI tính theo credit và số prompt. Khách có thể **tự mang khoá OpenAI (BYOK)** để bỏ giới hạn. Không mua thêm credit được.
   - Hạ tầng mở rộng là **API công khai + webhook + Zapier (một action) + MCP server chính chủ (từ 02/2026, OAuth)**.
5. **Tabby tự viết check-in, và chính Tability thừa nhận check-in do AI viết kém hơn check-in do người viết.** Cơ chế:
   - Khi check-in trễ hơn 2 ngày, người dùng có thể bảo Tabby viết thay.
   - Auto-sync đăng cập nhật tiến độ từ nguồn dữ liệu **không cần người duyệt**, kèm bình luận gợi ý của AI (200 credit mỗi lần). Người viết ghi là "Tabby".
   - Phàn nàn cụ thể duy nhất về AI tìm được trên G2 là **thông báo AI dồn dập, kể cả cho việc không phải của mình**.
6. **Tiếng Việt: không có bằng chứng Tability hỗ trợ.** App di động chỉ có tiếng Anh. Tài liệu không nhắc gì tới bản địa hoá. Một trang tổng hợp (GetApp UAE) có liệt kê "Vietnamese", nhưng không khớp với nguồn chính chủ nào (mức tin thấp).
7. **Hàm ý cho OneHub:** đừng coi Tability là chuẩn đã được chứng minh. Hãy coi nó là **bản đồ tính năng**, gồm soạn OKR, chấm chất lượng, soạn check-in, retro, hỏi đáp dữ liệu, brief theo lịch, MCP và agent sở hữu mục tiêu. Chỗ OneHub có thể làm tốt hơn nằm đúng ở chỗ Tability còn hở:
   - đo hiệu quả ngay từ đầu;
   - AI chỉ soạn nháp, người mới là người đăng;
   - hỗ trợ tiếng Việt;
   - phân quyền chặt, đúng yêu cầu của vai «chỉ OKR»;
   - quota minh bạch.

---

## 2. Độ tin của các nguồn "bên thứ ba" (vì sao không thể tin số sao)

| Nguồn | Vấn đề | Bằng chứng | Mức tin |
|---|---|---|---|
| G2: 4.6–4.7★, 161 đánh giá | Tability thưởng 5.000 AI credit/tháng cho **mỗi đánh giá 5 sao** trên G2. Quy định cộng đồng G2 cấm gắn phần thưởng với đánh giá tích cực và nói sẽ gỡ các đánh giá thu theo kiểu này. Kết quả tìm kiếm còn cho thấy hồ sơ G2 **đã hai tháng không có đánh giá mới**. | [Tability: cách lấy thêm AI credit](https://guides.tability.io/docs/other/how-to-get-more-ai-credits) · [G2 Community Guidelines](https://legal.g2.com/community-guidelines) · [G2 Tability reviews (tiêu đề trong kết quả tìm kiếm)](https://www.g2.com/products/tability/reviews) | cao (chính sách của cả hai bên); số sao thì mức tin thấp |
| "Tability ranked best OKR software" (thông cáo 18/09/2026, ABNewswire và hàng chục trang tin địa phương Mỹ) | Benchmark do Tability vận hành. Kết quả tìm kiếm ghi tác giả là CEO Tability. Trang benchmark chỉ tự nhận "kể cả khi đó không phải sản phẩm của chúng tôi", không có tuyên bố xung đột lợi ích chính thức. | [tability.io/compare](https://www.tability.io/compare) · [openpr (thông cáo)](https://www.openpr.com/news/4635707/tability-ranked-best-okr-software-in-new-2026-okr-software) · [abnewswire](https://www.abnewswire.com/pressreleases/tability-ranked-best-okr-software-in-new-2026-okr-software-benchmark-report_836518.html) | cao (về việc tự vận hành) |
| Gartner Peer Insights 4.8★ | Không mở được trang (403). Hai đoạn trích khen AI retrospectives và check-in tự động theo số liệu. Không biết cỡ mẫu. | [Gartner](https://www.gartner.com/reviews/product/tability) | thấp |
| GetApp UAE 4.7★ | **Chỉ có 3 đánh giá**, năm 2021–2022, trước thời AI hiện tại. | [GetApp UAE](https://www.getapp.ae/software/2080906/tability) | vừa |
| App Store (Tability Mobile) | **2.0★ trên 3 lượt**. Đánh giá chi tiết duy nhất (06/2025) chê app không dùng được. Không có tính năng AI trên mobile. | [App Store](https://apps.apple.com/us/app/tability-mobile/id6444370904) | vừa (mẫu quá nhỏ) |
| Mooncamp, OKRs Tool, Profit.co | **Đối thủ** viết bài "vs Tability". Có ích khi họ **thừa nhận** điểm mạnh của Tability. Khi họ chê thì phải đối chiếu. Ví dụ, Profit.co nói Tability "không có tóm tắt check-in tự động", điều này **sai** so với tài liệu của Tability. | [Mooncamp vs WorkBoard](https://mooncamp.com/blog/tability-vs-workboard) · [Mooncamp vs Perdoo](https://mooncamp.com/blog/perdoo-vs-tability) · [Mooncamp vs Profit.co](https://mooncamp.com/blog/profitco-vs-tability) · [OKRs Tool](https://www.okrstool.com/blog/tability-alternative) · [Profit.co](https://www.profit.co/okr/vs/tability/) | vừa khi khen, thấp khi chê |

**Quy mô công ty (để đặt kỳ vọng):**
- Thành lập năm 2018 bởi hai cựu nhân viên Atlassian (Sten Pittet, Bryan Schuldt).
- Gọi vốn seed 953K USD do Investible dẫn dắt, công bố 03/2024. Thư đầu tư ghi **"4.000+ người dùng trả phí, 100+ tổ chức trả phí"** ([Investible](https://www.investible.com/blog/investment-notes-tability), mức tin vừa).
- GetLatka **ước tính** khoảng 1,2 triệu USD ARR và 9 nhân viên (10/2024). Chính GetLatka ghi rằng họ chưa phỏng vấn công ty ([GetLatka](https://getlatka.com/companies/tability), mức tin thấp).
- **[suy luận]** Một đội khoảng 9 người làm ra ngần ấy tính năng AI trên OpenAI. Điều đó gợi ý phần lớn tính năng là **lớp prompt và luồng công việc mỏng** bọc quanh dữ liệu OKR sẵn có, chứ không phải mô hình riêng. Với OneHub, đây là tin tốt: phạm vi tương đương nằm trong tầm tay.

---

## 3. Dòng thời gian AI của Tability, 2022 → 2026

| Ngày | Mốc | Nguồn | Mức tin |
|---|---|---|---|
| 07/12/2022 | "Generate SMART goals with AI": Tability AI soạn mục tiêu theo SMART | [Blog, trang 2 của tag features](https://blog.tability.io/tag/features/page/2/) · [bài gốc](https://blog.tability.io/tability-ai/) | cao |
| 14/12/2022 | **GoalsGPT by Tability** ra mắt trên Product Hunt: 97 upvote, hạng #17, dùng GPT-3 | [hunted.space](https://hunted.space/dashboard/371049) | vừa |
| 09/02/2023 | Sten đăng LinkedIn "How to generate OKRs with GPT-3 and Tability" (ngày giải từ ID bài đăng) | [LinkedIn](https://na.linkedin.com/posts/stenpittet_how-to-generate-okrs-with-gpt-3-and-tability-activity-7029403022225018881-vy3O) | vừa |
| 05/04/2023 và 11/04/2023 | "AI-Powered OKR Coach" (Tabby Coach): phân tích tiến độ, gợi ý việc cần làm, bấm khi cần | [The future of Tability](https://blog.tability.io/the-future-is/) · [tag features](https://blog.tability.io/tag/features/) | cao |
| 30/05/2023 | Data connector tự động hoá check-in (chưa phải AI) | [tag features](https://blog.tability.io/tag/features/) | cao |
| 17/07/2023 | Chuyển các tính năng AI sang **GPT-4** | [Tability AI: GPT-4 Update](https://blog.tability.io/tability-ai-gpt-4/) | cao |
| 05/03/2024 | **AI tự nhận diện chỉ số** (metric detection) trong OKR | [tag features](https://blog.tability.io/tag/features/) | cao |
| 21/05/2024 | **Chat với Tabby (GPT-4o)**: sửa OKR bằng hội thoại | [Chat with Tabby](https://blog.tability.io/chat-with-tabby-enhanced-ai-with-gpt-40/) | cao |
| 08/10/2024 | Bài "Grammarly cho mục tiêu": nút Generate analysis, bấm một lần để áp gợi ý | [ODT: Grammarly for goals](https://www.tability.io/odt/articles/how-we-used-ai-to-build-a-grammarly-for-goals) | vừa |
| 26/03/2025 | **AI Retrospectives**: soạn retro quý từ các cập nhật KR | [March update](https://blog.tability.io/march-update-ai-retros-faster-ux-and-spring-cleaning/) | cao |
| 26/06/2025 | "Tác nhân AI đầu tiên dành riêng cho OKR" (Tabby ra mắt lại): viết check-in thay khi trễ, digest, phân tích | [ODT: very first AI Agent](https://www.tability.io/odt/articles/introducing-the-very-first-ai-agent-dedicated-to-okrs) | vừa |
| 18/12/2025 | Tổng kết 2025: báo trước **AI Mode (thử nghiệm)** cho 2026, có connector Jira, Asana, ClickUp, Confluence, Notion | [2025 Year in Review](https://blog.tability.io/tability-2025-year-in-review/) | cao |
| 12/01/2026 | Tăng giá: Basic 6/7 USD, Premium 10/12 USD. Thông báo không nhắc tới AI | [Jan 2026 pricing](https://blog.tability.io/jannounce-pricing-changes/) | cao |
| 04/02/2026 và 12/02/2026 | **MCP server chính chủ**: kết nối remote qua OAuth, Claude/ChatGPT đọc OKR và tạo check-in | [LinkedIn Sten](https://www.linkedin.com/posts/stenpittet_using-claude-to-talk-to-my-okrs-with-tabilitys-activity-7424779855726071808-wG09) · [ODT: MCP](https://www.tability.io/odt/articles/tability-mcp-server-for-okrs-talk-toyour-okrs-from-chatgpt-and-claude) | cao |
| 16/04/2026 | Bài "Agentic OKRs": gộp AI Mode, OKR agent và MCP thành một câu chuyện | [ODT: Agentic OKRs](https://www.tability.io/odt/articles/agentic-okrs) | vừa |
| 25/08/2026 | Hướng dẫn brief lãnh đạo hằng tuần bằng **Scheduled Prompts** | [ODT: chief of staff brief](https://www.tability.io/odt/articles/guide-chief-of-staff-weekly-leadership-brief) | vừa |
| 02/09/2026 | Khái niệm Agent, Agent Manager, Agency: agent **sở hữu mục tiêu** và check-in như một thành viên | [ODT: agent-agent-manager-agency](https://www.tability.io/odt/articles/agent-agent-manager-agency) | vừa |
| 09/2026 (thời điểm đọc) | **Agent Workforce Manager đang beta mở** cho Premium. Gói **Agentic** (20/25 USD) ghi "coming soon" | [Guide: Agent Workforce Manager](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/agent-workforce-manager.md) · [Pricing](https://www.tability.io/pricing) | cao |

**[suy luận] Nhịp phát triển:** mỗi năm Tability ra một hai mốc AI lớn, luôn theo đúng làn sóng của OpenAI và hệ sinh thái: GPT-3 (2022), GPT-4 (2023), GPT-4o chat (2024), agent (2025), MCP (2026). Phần *chạy nền* (check-in tự viết, agent sở hữu mục tiêu) mới xuất hiện từ giữa 2025. Phần *đa agent* đến 09/2026 vẫn đang beta.

---

## 4. Người dùng thật khen và chê gì về AI

| Nhận xét | Loại | Nguồn | Mức tin |
|---|---|---|---|
| AI giúp **vượt qua trang trắng** khi soạn OKR lần đầu, gợi ý KR đo được. Đây là lời khen AI xuất hiện nhiều nhất | khen | Đoạn trích tổng hợp từ G2 và các bài review ([G2 pros & cons](https://www.g2.com/products/tability/reviews?qs=pros-and-cons)); trích dẫn khách hàng trên [tability.io/customers](https://www.tability.io/customers) (Philip Bush, Joey Salazar) | vừa |
| **AI retrospectives** tóm tắt check-in cả quý và đưa ra bước tiếp theo; check-in chỉ số tự cập nhật hằng tuần giúp tiết kiệm thời gian | khen | Đoạn trích Gartner Peer Insights ([Gartner](https://www.gartner.com/reviews/product/tability)) | thấp (không mở được trang) |
| "incessant notification from AI even to tasks that are not even mine" | **chê** | G2, qua đoạn trích tìm kiếm ([G2 pros & cons](https://www.g2.com/products/tability/reviews?qs=pros-and-cons)) | vừa |
| **Không mua thêm được credit** ngay trong Tability; chê giá | **chê** | G2, qua đoạn trích tìm kiếm ([G2 pros & cons](https://www.g2.com/products/tability/reviews?qs=pros-and-cons)) | vừa |
| Tích hợp "hời hợt", điều hướng rườm rà, phải học nhiều hơn dự kiến | chê (không riêng AI) | G2, qua đoạn trích tìm kiếm | thấp |
| AI của Tability "chủ yếu ở khâu soạn mục tiêu, không có phần thực thi hay phân tích" | chê, từ **đối thủ** | [Profit.co vs Tability](https://www.profit.co/okr/vs/tability/) | thấp. Đã **bị tài liệu Tability bác**: họ có soạn check-in và retro |
| Tabby là "trợ lý bền bỉ" nhắc đội qua từng pha; retro tiết kiệm "hàng giờ" | khen, từ **đối thủ** | [Mooncamp vs WorkBoard](https://mooncamp.com/blog/tability-vs-workboard) | vừa (đối thủ thừa nhận) |
| Báo cáo đủ cho họp đội hằng tuần nhưng **không đủ cho review quý của lãnh đạo** | chê, từ **đối thủ** | [Mooncamp vs Perdoo](https://mooncamp.com/blog/perdoo-vs-tability) | thấp đến vừa |

**Tính năng AI nào thật sự được dùng nhiều?**
- **[thấy trong nguồn]** Tability **không công bố** số liệu sử dụng AI ở bất kỳ đâu: không trong tổng kết 2024 và 2025, không trong case study, không trong thư của nhà đầu tư.
- **[suy luận]** Xét theo tần suất xuất hiện trong đánh giá, thứ tự có lẽ là:
  1. soạn OKR bằng AI (nhắc nhiều nhất, từ 2022);
  2. AI retrospectives và check-in chỉ số tự động (Gartner);
  3. Tabby tự viết check-in (chỉ thấy qua *lời phàn nàn về thông báo*).
- Chưa thấy đánh giá nào nhắc tới AI Mode, Scheduled Prompts, MCP hay Agent Workforce Manager. Các tính năng này quá mới hoặc còn beta.

---

## 5. Giá và giới hạn AI thực tế

| Gói (09/2026) | Giá/người/tháng (năm/tháng) | AI credit/người/tháng | Prompt AI Mode/người/tháng | AI có trong gói |
|---|---|---|---|---|
| Basic | 6 / 7 USD | — | — | Trang giá ghi "OKR Agent" nhưng không có credit (**mâu thuẫn**, xem dưới) |
| Premium | 10 / 12 USD | 4.000 | **25 hoặc 30** (trang giá tự mâu thuẫn; tài liệu AI Mode ghi mặc định 30) | Tabby, saved/scheduled prompts, AI retro, MCP server, Public API, webhook, auto-sync |
| Agentic (*coming soon*) | 20 / 25 USD | 10.000 | 500 | Agent Manager, agent sở hữu mục tiêu, cộng tác giữa các agent, hỗ trợ Claude Cowork, Codex, OpenClaw |
| Enterprise | liên hệ | tuỳ | tuỳ | tuỳ |

Nguồn: [Pricing](https://www.tability.io/pricing), [AI Mode guide](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/ai-mode.md). Mức tin cao về con số. Chỗ tự mâu thuẫn là **thấy trong nguồn**.

**Giới hạn thực tế [thấy trong nguồn]:**
- Credit bị trừ mỗi khi dùng goal-setting AI, metric AI, AI coaching hay OKR agent. Hết credit thì AI tắt đến tháng sau. **Không mua thêm được.** Chỉ có hai đường: nâng gói, hoặc đăng đánh giá 5 sao trên G2 (+5.000/tháng mỗi bài) ([AI credits](https://guides.tability.io/docs/other/how-to-get-more-ai-credits)).
- **Auto-sync có AI phân tích tốn 200 credit mỗi lần đồng bộ**, chạy hằng ngày hoặc hằng tuần, chỉ có ở Premium ([Auto-sync](https://guides.tability.io/docs/become-a-tability-power-user/integrations/auto-sync-for-data-sources.md)).
- **BYOK:** khách có thể dán khoá OpenAI riêng để dùng AI "không giới hạn" bằng tài khoản OpenAI của tổ chức mình ([OpenAI integration](https://guides.tability.io/docs/become-a-tability-power-user/integrations/openai.md)).

**[suy luận] Tính nhẩm:**
- 4.000 credit chia 200 = **20 lần sync có AI mỗi người mỗi tháng**.
- Một người giữ 5 KR, sync hằng tuần, tốn khoảng 5 × 4,3 × 200 ≈ 4.300 credit. Như vậy họ **hết quota chỉ vì auto-sync**, chưa kịp dùng AI soạn mục tiêu hay coaching.
- Chưa rõ credit tính riêng từng người hay gộp chung workspace. Tài liệu ghi "per user" nhưng không nói có gộp không.
- Điều này giải thích vì sao có lời phàn nàn "không mua thêm credit được", và vì sao có đường thoát BYOK.

**Mâu thuẫn về gói:**
- Trang giá liệt kê "OKR Agent" trong **Basic**, nhưng Basic không có credit, trong khi tài liệu nói OKR agent tiêu credit.
- Trang giá xếp **MCP Server** vào Premium trở lên, nhưng một đoạn trích tìm kiếm nói MCP "miễn phí trên mọi gói". Tôi không tìm lại được nguồn gốc của đoạn trích đó (mức tin thấp).

---

## 6. Nhà cung cấp model, subprocessor, bảo mật

| Nội dung | Chi tiết | Nguồn | Mức tin |
|---|---|---|---|
| Nhà cung cấp LLM | **Chỉ OpenAI** ("generative AI features, LLM model"). Dữ liệu gửi đi là dữ liệu OKR và prompt của người dùng, xử lý ở **Mỹ**, có DPA và SCC. Không có Anthropic, Google hay Azure. Danh sách **cập nhật 12/06/2026** | [Subprocessors](https://guides.tability.io/legals/subprocessors) | cao |
| Model | Công bố GPT-3 (2022), GPT-4 (07/2023), GPT-4o (05/2024). Tài liệu hiện tại **không ghi tên model** | các bài blog ở mục 3; [OpenAI integration](https://guides.tability.io/docs/become-a-tability-power-user/integrations/openai.md) | cao |
| Trường dữ liệu gửi OpenAI | Tên plan, objective, outcome; ngày bắt đầu và kết thúc; giá trị đầu và mục tiêu; nội dung check-in | [OpenAI integration](https://guides.tability.io/docs/become-a-tability-power-user/integrations/openai.md) | cao |
| Lưu giữ và huấn luyện | OpenAI không dùng dữ liệu để huấn luyện; dữ liệu **xoá sau 30 ngày**. Trang AI Mode còn nói dùng "OpenAI Enterprise API" | như trên; [AI Mode page](https://www.tability.io/ai/ai-mode) | cao / vừa |
| Tắt AI | Tắt được ở cấp workspace: vào Integrations, chọn OpenAI rồi tắt | [OpenAI integration](https://guides.tability.io/docs/become-a-tability-power-user/integrations/openai.md) · [Subprocessors](https://guides.tability.io/legals/subprocessors) | cao |
| Chứng nhận | SOC 2 Type 2, giám sát liên tục qua Drata (không ghi ngày); GDPR; mã hoá AES-256 khi lưu và TLS 1.2 khi truyền | [Trust and Security](https://guides.tability.io/legals/trust-and-security) | cao |
| Vùng lưu dữ liệu | Mặc định Mỹ. EU hoặc Úc **theo yêu cầu, tối thiểu 100 người dùng**. MCP có endpoint riêng cho US, EU, AU | [Trust and Security](https://guides.tability.io/legals/trust-and-security) · [MCP guide](https://guides.tability.io/docs/become-a-tability-power-user/integrations/tability-mcp-server) | cao |
| **[suy luận]** Dữ liệu AI rời vùng | OpenAI chỉ xử lý ở Mỹ, nên workspace đặt ở EU hay AU vẫn gửi dữ liệu OKR sang Mỹ khi dùng AI | ghép hai nguồn trên | thấp (suy luận) |
| Slack app "Tabby by Tability" | Có dùng model của OpenAI, dữ liệu "lưu tạm ở Mỹ"; xin quyền đọc nội dung kênh. **Không thấy tính năng chat AI trong Slack** | [Slack Marketplace](https://slack.com/marketplace/A020WJERWCU-tabby-by-tability) | vừa |
| **Mâu thuẫn** | Trang AI Mode ghi có tích hợp gốc với "Claude và ChatGPT", nhưng Anthropic **không có** trong danh sách subprocessor. **[suy luận]** Nhiều khả năng "Claude" ở đây là *Claude của khách* nối vào qua MCP, không phải Tability tự gọi Claude | [AI Mode page](https://www.tability.io/ai/ai-mode) · [Subprocessors](https://guides.tability.io/legals/subprocessors) | thấp |

---

## 7. API, MCP, Zapier, kênh

- **Public API:** chỉ gói Premium ([llms-full / FAQ](https://guides.tability.io/docs/llms-full.txt)).
- **Check-ins API:** POST một check-in kèm token của outcome và token cá nhân. Nếu không chỉ định, confidence được **tự gán theo độ lệch so với đường dự phóng** ([Check-ins API](https://guides.tability.io/docs/become-a-tability-power-user/features/check-ins/using-the-check-ins-api.md)). Mức tin cao.
- **Webhook:** có ở Premium ([Pricing](https://www.tability.io/pricing)).
- **Zapier:** chỉ có **một action** là "Create Check-In", không có trigger. Cần quyền admin và token API cá nhân, và mọi check-in gắn vào tài khoản của người tạo Zap ([Zapier](https://zapier.com/apps/tability/integrations) · [Guide](https://guides.tability.io/docs/integrations/zapier)). Mức tin cao.
- **MCP server chính chủ** ([MCP guide](https://guides.tability.io/docs/become-a-tability-power-user/integrations/tability-mcp-server) · [blog 12/02/2026](https://www.tability.io/odt/articles/tability-mcp-server-for-okrs-talk-toyour-okrs-from-chatgpt-and-claude)), mức tin cao:
  - Remote, OAuth 2.0 với dynamic discovery, không cần dán token.
  - Admin phải bật quyền API cho từng người dùng.
  - **Tôn trọng quyền của từng người dùng.**
  - Lúc ra mắt có 27 tool; tài liệu hiện nay ghi hơn 40, gồm cả tool cho agent.
  - Chạy được với Claude, ChatGPT (Developer Mode) và Copilot Studio.
  - **Cảnh báo:** trong Copilot Studio, agent dùng **chung một danh tính cho mọi người**.
- **MCP cộng đồng:** `luquimbo/tability-mcp` dùng token API cá nhân, 27 tool, không chính chủ ([Glama](https://glama.ai/mcp/servers/@luquimbo/tability-mcp)). Mức tin vừa.
- **Agent bên ngoài sở hữu mục tiêu:** Agent Workforce Manager (beta mở, Premium):
  - Một "manager" đề xuất 3–4 vai chuyên trách, **người duyệt rồi mới bật**.
  - Các agent làm việc qua MCP. Tài liệu ghi các host là Codex, ChatGPT và Claude Cowork; trang giá lại ghi Claude Cowork, Codex và OpenClaw.
  - Tài liệu nhấn mạnh một người chủ vẫn chịu trách nhiệm duyệt ([Agent Workforce Manager](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/agent-workforce-manager.md)). Mức tin cao.
- **Kênh khác:** Slack và Microsoft Teams (nhắc check-in, cập nhật, báo cáo tuần), email/in-app cho scheduled prompts. Không thấy Zalo hay kênh nào của châu Á. Mức tin vừa.

## 8. Ngôn ngữ và tiếng Việt

- **[thấy trong nguồn]** App di động chỉ liệt kê **tiếng Anh** ([App Store](https://apps.apple.com/us/app/tability-mobile/id6444370904)). Mức tin vừa.
- **[thấy trong nguồn]** Tài liệu chính chủ (sitemap, FAQ, llms-full) **không có trang nào** về ngôn ngữ giao diện, bản địa hoá, hay ngôn ngữ đầu ra của AI. Mức tin vừa.
- **[thấy trong nguồn]** GetApp UAE liệt kê 8 ngôn ngữ, trong đó có tiếng Việt ([GetApp UAE](https://www.getapp.ae/software/2080906/tability)). Mức tin **thấp**: đây là trang tổng hợp, không khớp với nguồn chính chủ nào.
- **[suy luận]** GPT-4o hiểu và viết được tiếng Việt, nên AI *có thể* trả lời tiếng Việt khi người dùng nhập tiếng Việt. Nhưng giao diện, nhãn, email và thông báo gần như chắc chỉ có tiếng Anh, và không có cam kết nào về chất lượng tiếng Việt. Với OneHub, cả công ty dùng từ 26/10/2026, nên đây là khoảng trống rõ ràng mà OneHub có thể vượt.

---

## 9. Bốn vấn đề: Tability dùng AI giải thế nào, và bằng chứng hiệu quả ra sao

### 9.1 Check-in chất lượng thấp, hoặc không có check-in

**Cách làm [thấy trong nguồn]:**
- **Nhắc, không cần AI:** nhắc check-in qua Slack, Teams và email; streak; widget "Overdue check-ins"; Net Confidence Score = %On track − %Off track, có từ 09/2022 ([NCS](https://blog.tability.io/net-confidence-score/) · [dashboard guide](https://guides.tability.io/docs/best-practice/build-a-better-dashboard-keeping-your-team-accountable-and-on-track)).
- **Lấy số tự động:** data connector và auto-sync hằng ngày hoặc hằng tuần **đăng cập nhật tiến độ mà không cần người duyệt**. Người viết ghi là Tabby. Khi bật AI, hệ thống thêm **bình luận gợi ý cải thiện**, tốn 200 credit mỗi lần ([Auto-sync](https://guides.tability.io/docs/become-a-tability-power-user/integrations/auto-sync-for-data-sources.md)).
- **Tabby viết check-in thay:** hướng dẫn khuyên bấm khi check-in trễ hơn 2 ngày. AI dựa trên task đã xong, chỉ số mới nhất và các check-in trước. Bản AI viết hiện dưới dạng **nháp sửa được** trên dòng thời gian ([AI automation how-to](https://guides.tability.io/docs/become-a-tability-power-user/how-tos/put-your-okrs-on-autopilot-with-tabilitys-ai-automation.md)).
  - Chưa rõ bản nháp có tự đăng hay không, vì tài liệu không nói.
  - Tài liệu về chu trình OKR mô tả confidence được tính từ tiến độ chỉ số, thời gian còn lại, gia tốc và các check-in trước ([AI cho cả chu trình](https://guides.tability.io/docs/become-a-tability-power-user/how-tos/how-to-use-tabilitys-ai-for-your-complete-okr-cycle.md)).
- **Coaching AI:** chỉ chạy **khi bấm**, đưa ra tóm tắt ngắn và danh sách việc nên làm ([Coaching AI](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/coaching-ai)).

**Bằng chứng hiệu quả:**
- **Không có số liệu.** Chính đồng sáng lập thừa nhận không gì thay được đầu vào thật của con người, và coi AI là thứ lấp chỗ khi đội lơ là ([OKRs and AI: modern reporting](https://www.tability.io/odt/articles/okrs-and-ai-modern-reporting)).
- Bằng chứng ngược chiều duy nhất là **lời phàn nàn về thông báo AI dồn dập** trên G2.
- **[suy luận]** Rủi ro thiết kế: khi AI tự điền cho người lười check-in, dashboard trông "xanh và đều" nhưng mất tín hiệu thật, tức là chủ KR không còn phải tự nói gì. OneHub nên đo riêng tỷ lệ check-in do người viết và tỷ lệ do AI soạn rồi người sửa.

### 9.2 OKR viết kém

**Cách làm [thấy trong nguồn]:**
- **Goal-setting AI:** prompt, rồi AI sinh objective, KR và initiative, rồi người sửa tiếp qua hội thoại (2022 với GPT-3, 2024 chuyển sang chat) ([Goal-setting AI](https://guides.tability.io/docs/become-a-tability-power-user/features/plans/goal-setting-ai.md)).
- **Generate analysis:** quét OKR hiện có và gợi ý, từ sửa nhẹ câu chữ tới viết lại toàn bộ. Người bấm **Update** hoặc **Dismiss**.
- **Metric detection:** AI nhận diện chỉ số trong KR để đặt mục tiêu.
- **Import OKR bằng AI:** đưa OKR từ tài liệu cũ vào.
- **Chấm điểm chất lượng:** Mooncamp (đối thủ) mô tả một thang điểm gồm Focus, Descriptiveness, Measurability, Accountability ([Mooncamp vs Profit.co](https://mooncamp.com/blog/profitco-vs-tability)). **Tôi không tìm thấy thang điểm này trong tài liệu chính chủ** (mức tin thấp).

**Bằng chứng hiệu quả:**
- Có **lời khen định tính** lặp lại: vượt được trang trắng, gợi ý KR đo được.
- CEO tự nhận bản nháp AI "a bit generic" và giá trị nằm ở việc phá thế bế tắc, không nằm ở độ chính xác ([How to write OKRs with AI](https://www.tability.io/odt/articles/how-to-write-okrs-with-ai-and-actually-track-them)).
- **Không có số liệu** về tỷ lệ OKR đạt chuẩn trước và sau, hay tỷ lệ gợi ý được chấp nhận.

### 9.3 Báo cáo tốn thời gian

**Cách làm [thấy trong nguồn]:**
- **AI Retrospectives** (03/2025): soạn nháp retro từ các cập nhật KR trong quý; người sửa rồi chia sẻ bằng PDF hoặc link công khai; chỉ Premium ([Retrospectives](https://guides.tability.io/docs/become-a-tability-power-user/features/reporting/retrospectives.md)).
- **Presentation mode** tạo slide.
- **AI Mode** (beta) để hỏi đáp; **Scheduled Prompts** chạy brief theo ngày, tuần, tháng hoặc quý và gửi cho người nhận chỉ định, kèm lời dặn "AI Mode có thể sai, hãy đối chiếu" ([Scheduled Prompts](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/scheduled-prompts.md)).
- Hướng dẫn brief lãnh đạo yêu cầu **mỗi khẳng định phải gắn link tới goal, KPI hoặc check-in nguồn**, và chief of staff phải duyệt trước khi gửi ([Leadership brief](https://www.tability.io/odt/articles/guide-chief-of-staff-weekly-leadership-brief)).
- **MCP:** kéo OKR vào Claude hoặc ChatGPT để viết báo cáo theo định dạng mình muốn.

**Bằng chứng hiệu quả:**
- Có đoạn trích Gartner khen retro (mức tin thấp).
- Con số "**giảm 80% thời gian báo cáo**" không có phương pháp đo; nguồn dẫn duy nhất là số liệu chung về "work about work" của Asana ([How to cut OKR reporting time by 80%](https://www.tability.io/odt/articles/how-to-cut-okr-reporting-time)).
- Case study khách hàng chỉ có câu kiểu "không cần họp đi họp lại", **không có số** ([Customers](https://www.tability.io/customers)).

### 9.4 Rủi ro bị phát hiện muộn

**Cách làm [thấy trong nguồn]:**
- Ba mức confidence, NCS, bộ lọc "At risk / Off track" trên dashboard, widget check-in trễ. Phần lớn là **luật và dashboard, không phải AI**.
- Confidence tự gán theo đường dự phóng khi check-in qua API.
- AI Mode trả lời các câu như "đội nào hay trễ check-in", "KR nào rủi ro vì phụ thuộc", "đầu tư lệch so với ưu tiên chiến lược" ([AI Mode page](https://www.tability.io/ai/ai-mode)). Tất cả đều **chạy khi hỏi hoặc theo lịch**.
- Tabby được quảng bá là "gắn cờ rủi ro", nhưng tài liệu không mô tả tiêu chí ([OKR agent page](https://www.tability.io/features/ai/okr-agent)).

**Bằng chứng hiệu quả:**
- **Không có.** Không có số liệu về việc phát hiện sớm hơn bao lâu, hay độ chính xác của cờ rủi ro.
- **[suy luận]** Đây là vấn đề Tability giải yếu nhất bằng AI. Phần phát hiện rủi ro thật vẫn nằm ở luật confidence và check-in trễ. AI chủ yếu *diễn giải* lại những tín hiệu đó thành văn bản.

---

## 10. Khẳng định marketing chưa kiểm chứng được

| # | Khẳng định | Ở đâu | Vì sao chưa kiểm chứng được, hoặc mâu thuẫn | Mức tin của khẳng định |
|---|---|---|---|---|
| 1 | "#1 cho AI trong OKR Software Benchmark (4.6/5), hơn WorkBoard và Profit.co" | [tability.io/ai](https://www.tability.io/ai) | Trang benchmark AI của chính Tability (cập nhật 15/09/2026) ghi **4.0/5, đồng hạng WorkBoard** ([compare/ai-features](https://www.tability.io/compare/ai-features)). Benchmark do Tability vận hành | **thấp** (tự mâu thuẫn) |
| 2 | "5/5 về agent trong sản phẩm và MCP/khả năng liên thông giữa các agent" | [tability.io/ai](https://www.tability.io/ai) | Phần tự đánh giá trong benchmark ghi luồng agent và MCP "không được thử đầy đủ" | **thấp** |
| 3 | "1 trên 1 nền tảng OKR có agent thực thi và giao việc ngay trong app" | [tability.io/ai](https://www.tability.io/ai) | Phụ thuộc cách định nghĩa. WorkBoard ra hai agent (Digital Chief of Staff, Leadership Coach) từ đầu 2025, theo nguồn thứ cấp ([Mooncamp](https://mooncamp.com/blog/tability-vs-workboard)). Agent Workforce Manager của Tability vẫn đang beta | thấp |
| 4 | "Tác nhân AI **đầu tiên** dành riêng cho OKR" (06/2025) | [ODT](https://www.tability.io/odt/articles/introducing-the-very-first-ai-agent-dedicated-to-okrs) | Đến 2026, chính Tability gọi Tabby là **"assistant"**, "không sở hữu mục tiêu" ([OKR agent page](https://www.tability.io/features/ai/okr-agent)). Nhãn "agent" đã bị dời sang tính năng khác | thấp |
| 5 | "Nền tảng **đầu tiên** dùng GPT-3 để đặt mục tiêu" (12/2022); "nền tảng OKR **duy nhất** đón nhận AI" (04/2023) | [Product Hunt/hunted.space](https://hunted.space/dashboard/371049) · [tag features](https://blog.tability.io/tag/features/) | Không có cách kiểm chứng "đầu tiên" hay "duy nhất". Khẳng định mang tính thời điểm | thấp |
| 6 | "Giảm 80% thời gian báo cáo OKR" | [ODT](https://www.tability.io/odt/articles/how-to-cut-okr-reporting-time) | Không có mẫu, phương pháp hay dữ liệu khách hàng | **thấp** |
| 7 | "Được đánh giá là phần mềm OKR tốt nhất thị trường" | [AI Mode page](https://www.tability.io/ai/ai-mode) · thông cáo báo chí | Dựa trên benchmark tự vận hành và điểm G2 có thưởng credit cho 5 sao | thấp |
| 8 | 4.7★ G2 / 4.8★ Gartner | [2025 Year in Review](https://blog.tability.io/tability-2025-year-in-review/) | Điểm G2 bị làm lệch bởi phần thưởng gắn với 5 sao; Gartner không mở được | thấp |
| 9 | "1.000+ đội đang dùng Tability để quản lý mục tiêu **và agent**" | [tability.io/ai](https://www.tability.io/ai) | Nhà đầu tư ghi "100+ tổ chức trả phí, 4.000+ người dùng trả phí" (03/2024). "Đội" không phải "tổ chức". Không tách được bao nhiêu đội dùng agent | thấp |
| 10 | Logo Merck, Allstate, Bethesda, Berkshire Hathaway HomeServices… | [tability.io/ai](https://www.tability.io/ai) · [customers](https://www.tability.io/customers) | Không có case study nào của các tên này nói về AI; có thể chỉ một đội nhỏ bên trong họ dùng | thấp |
| 11 | AI Mode "không cần thiết lập hay cấu hình" | [AI Mode page](https://www.tability.io/ai/ai-mode) | Chính trang đó ghi **private beta**, phải đăng ký; tài liệu ghi quota 30 prompt/tháng | thấp |
| 12 | "Tích hợp gốc với Claude và ChatGPT" | [AI Mode page](https://www.tability.io/ai/ai-mode) | Anthropic không có trong danh sách subprocessor (12/06/2026) | thấp |
| 13 | Tabby "viết check-in, gắn cờ rủi ro, báo cáo theo lịch mà không cần yêu cầu" | [OKR agent page](https://www.tability.io/features/ai/okr-agent) | Tài liệu hướng dẫn lại khuyên **bấm tay** để soạn check-in khi trễ quá 2 ngày; tiêu chí gắn cờ rủi ro không được mô tả | vừa (có một phần) |
| 14 | "Agent-to-agent collaboration", hỗ trợ Claude Cowork, Codex, OpenClaw | [Pricing](https://www.tability.io/pricing) | Gói Agentic đang "coming soon". Tài liệu beta liệt kê host khác (Codex, ChatGPT, Claude Cowork) | thấp |
| 15 | Profit.co: "AI của Tability chỉ tập trung soạn mục tiêu" | [Profit.co](https://www.profit.co/okr/vs/tability/) | Khẳng định marketing của **đối thủ**, bị tài liệu Tability bác (retro, soạn check-in, AI Mode) | thấp |

---

## 11. Hàm ý cho OneHub (ngắn, để hồ sơ kiến trúc tổng hợp dùng)

- **Nên học theo** (bản đồ tính năng đã có người trả tiền):
  - soạn OKR và chấm chất lượng, người chọn chấp nhận hay bỏ;
  - retro và brief theo lịch, **mỗi khẳng định có link về nguồn**;
  - hỏi đáp dữ liệu OKR;
  - MCP tôn trọng quyền của từng người;
  - agent sở hữu mục tiêu, có người duyệt trước khi bật.
- **Làm tốt hơn đúng chỗ Tability còn hở:**
  1. **Đo hiệu quả từ ngày đầu.** Tability không công bố được con số nào. OneHub có thể đo tỷ lệ check-in đúng hạn, tỷ lệ check-in do người viết, tỷ lệ bản nháp AI được sửa hay giữ nguyên, số gợi ý OKR được chấp nhận, và thời gian soạn retro.
  2. **AI chỉ soạn nháp, không tự đăng.** Tability để auto-sync tự đăng và AI viết thay. Đó là nguồn của "thông báo dồn dập" và nguy cơ dashboard xanh giả.
  3. **Tiếng Việt thật:** cả nhãn, thông báo, lẫn prompt được tinh chỉnh cho văn phong tiếng Việt.
  4. **Quota minh bạch, theo ngân sách team:** khoảng 20 USD/tháng qua AI Gateway. Tability cho thấy kiểu credit mù mờ cộng với việc không mua thêm được sẽ gây bực bội.
  5. **Không khoá vào một nhà cung cấp model.** Tability chỉ dùng OpenAI; OneHub đã có AI Gateway và model chọn qua appSetting.
  6. **Phân quyền như MCP của Tability:** mọi truy vấn AI chạy dưới danh tính người hỏi. Tránh lỗi "một danh tính cho mọi người" mà Tability tự cảnh báo ở Copilot Studio. Đây là điều kiện bắt buộc cho vai «chỉ OKR».

---

## 12. Câu hỏi mở

1. Bản nháp check-in Tabby viết khi trễ hạn có **tự đăng** sau một thời gian không, hay luôn chờ người? Tài liệu không nói. Cần một workspace dùng thử 14 ngày để thấy tận mắt.
2. Credit tính riêng từng người hay gộp chung workspace? 200 credit mỗi lần sync có tính cho người sở hữu KR không?
3. Thang chấm chất lượng OKR (Focus, Descriptiveness, Measurability, Accountability) mà Mooncamp mô tả có thật trong sản phẩm không, hay đã bị gỡ?
4. AI Mode khi đọc dữ liệu từ connector (Jira, Notion, Salesforce) có lọc theo quyền của người hỏi không? Tài liệu AI Mode không nói về quyền.
5. Tability có kế hoạch thêm nhà cung cấp model khác OpenAI không? Trang AI Mode nhắc Claude, nhưng danh sách subprocessor thì không.
6. Có đánh giá nào nhắc riêng AI Mode, Scheduled Prompts hay Agent Workforce Manager không? Muốn biết phải đọc thẳng G2 hoặc Gartner khi truy cập được, ví dụ mở bằng trình duyệt thường.

---

## Nguồn đã dùng (theo nhóm)

**Chính chủ, loại tài liệu hoặc pháp lý (mức tin cao):**
- [Subprocessors](https://guides.tability.io/legals/subprocessors)
- [Trust and Security](https://guides.tability.io/legals/trust-and-security)
- [OpenAI integration](https://guides.tability.io/docs/become-a-tability-power-user/integrations/openai.md)
- [AI credits](https://guides.tability.io/docs/other/how-to-get-more-ai-credits)
- [Pricing](https://www.tability.io/pricing)
- [AI Mode guide](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/ai-mode.md)
- [Scheduled Prompts](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/scheduled-prompts.md)
- [Coaching AI](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/coaching-ai)
- [Goal-setting AI](https://guides.tability.io/docs/become-a-tability-power-user/features/plans/goal-setting-ai.md)
- [AI cho cả chu trình OKR](https://guides.tability.io/docs/become-a-tability-power-user/how-tos/how-to-use-tabilitys-ai-for-your-complete-okr-cycle.md)
- [AI automation](https://guides.tability.io/docs/become-a-tability-power-user/how-tos/put-your-okrs-on-autopilot-with-tabilitys-ai-automation.md)
- [Auto-sync](https://guides.tability.io/docs/become-a-tability-power-user/integrations/auto-sync-for-data-sources.md)
- [Retrospectives](https://guides.tability.io/docs/become-a-tability-power-user/features/reporting/retrospectives.md)
- [Agent Workforce Manager](https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/agent-workforce-manager.md)
- [MCP server](https://guides.tability.io/docs/become-a-tability-power-user/integrations/tability-mcp-server)
- [Check-ins API](https://guides.tability.io/docs/become-a-tability-power-user/features/check-ins/using-the-check-ins-api.md)
- [Zapier guide](https://guides.tability.io/docs/integrations/zapier)
- [Sitemap](https://guides.tability.io/docs/sitemap.md)

**Chính chủ, loại blog hoặc quảng bá (mức tin vừa):**
- [tability.io/ai](https://www.tability.io/ai), [AI Mode page](https://www.tability.io/ai/ai-mode), [OKR agent page](https://www.tability.io/features/ai/okr-agent), [compare](https://www.tability.io/compare), [compare/ai-features](https://www.tability.io/compare/ai-features), [customers](https://www.tability.io/customers)
- Blog: [tag features](https://blog.tability.io/tag/features/), [trang 2](https://blog.tability.io/tag/features/page/2/), [GPT-4](https://blog.tability.io/tability-ai-gpt-4/), [GPT-4o](https://blog.tability.io/chat-with-tabby-enhanced-ai-with-gpt-40/), [March 2025](https://blog.tability.io/march-update-ai-retros-faster-ux-and-spring-cleaning/), [2024 review](https://blog.tability.io/tability-in-2024-year-in-review/), [2025 review](https://blog.tability.io/tability-2025-year-in-review/), [Jan 2026 pricing](https://blog.tability.io/jannounce-pricing-changes/), [The future is](https://blog.tability.io/the-future-is/)
- ODT: [very first AI agent](https://www.tability.io/odt/articles/introducing-the-very-first-ai-agent-dedicated-to-okrs), [agentic OKRs](https://www.tability.io/odt/articles/agentic-okrs), [MCP](https://www.tability.io/odt/articles/tability-mcp-server-for-okrs-talk-toyour-okrs-from-chatgpt-and-claude), [Grammarly for goals](https://www.tability.io/odt/articles/how-we-used-ai-to-build-a-grammarly-for-goals), [modern reporting](https://www.tability.io/odt/articles/okrs-and-ai-modern-reporting), [80%](https://www.tability.io/odt/articles/how-to-cut-okr-reporting-time), [write OKRs with AI](https://www.tability.io/odt/articles/how-to-write-okrs-with-ai-and-actually-track-them), [leadership brief](https://www.tability.io/odt/articles/guide-chief-of-staff-weekly-leadership-brief), [agent/agency](https://www.tability.io/odt/articles/agent-agent-manager-agency)

**Bên thứ ba:**
- [G2 pros & cons](https://www.g2.com/products/tability/reviews?qs=pros-and-cons) (chỉ đoạn trích)
- [G2 Community Guidelines](https://legal.g2.com/community-guidelines)
- [Gartner](https://www.gartner.com/reviews/product/tability) (chỉ đoạn trích)
- [GetApp UAE](https://www.getapp.ae/software/2080906/tability)
- [App Store](https://apps.apple.com/us/app/tability-mobile/id6444370904)
- [Slack Marketplace](https://slack.com/marketplace/A020WJERWCU-tabby-by-tability)
- [Zapier](https://zapier.com/apps/tability/integrations)
- [hunted.space (Product Hunt)](https://hunted.space/dashboard/371049)
- [Investible](https://www.investible.com/blog/investment-notes-tability)
- [GetLatka](https://getlatka.com/companies/tability)
- [Glama (MCP cộng đồng)](https://glama.ai/mcp/servers/@luquimbo/tability-mcp)
- [LinkedIn Sten: MCP](https://www.linkedin.com/posts/stenpittet_using-claude-to-talk-to-my-okrs-with-tabilitys-activity-7424779855726071808-wG09)
- [YouTube: Tability MCP Server](https://www.youtube.com/watch?v=ALbdKmvyOeM) (kênh Tability)

**Đối thủ (có thiên kiến):**
- [Mooncamp vs WorkBoard](https://mooncamp.com/blog/tability-vs-workboard)
- [Mooncamp vs Perdoo](https://mooncamp.com/blog/perdoo-vs-tability)
- [Mooncamp vs Profit.co](https://mooncamp.com/blog/profitco-vs-tability)
- [OKRs Tool vs Tability](https://www.okrstool.com/blog/okrstool-vs-tability)
- [OKRs Tool alternatives](https://www.okrstool.com/blog/tability-alternative)
- [Profit.co vs Tability](https://www.profit.co/okr/vs/tability/)

**Thông cáo báo chí:**
- [openpr](https://www.openpr.com/news/4635707/tability-ranked-best-okr-software-in-new-2026-okr-software)
- [abnewswire](https://www.abnewswire.com/pressreleases/tability-ranked-best-okr-software-in-new-2026-okr-software-benchmark-report_836518.html)
