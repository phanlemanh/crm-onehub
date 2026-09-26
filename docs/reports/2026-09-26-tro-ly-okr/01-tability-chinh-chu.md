# 01 — Tability: danh mục tính năng AI từ nguồn chính chủ

Ngày thu thập: 2026-09-26. Người đọc: chủ sản phẩm OneHub (khu OKR, lượt 9–10 "trợ lý OKR" / "OKR trong chat").

## Cách đọc báo cáo này

- **Phạm vi:** chỉ tính năng AI của Tability, chỉ từ nguồn do Tability phát hành: trang `tability.io/ai` và bốn trang con, `/pricing`, `/features/*`, trung tâm hướng dẫn `guides.tability.io` (GitBook, đọc bản `.md`), changelog công khai `feedback.tability.io/changelog`, blog `blog.tability.io` (2022–2026), chuyên mục ODT `tability.io/odt/articles/*`, kho GitHub `tabilityio/tability-skills`, và các trang pháp lý (AI Policy, Subprocessors, Trust & Security).
- **Mức tin** (điều chỉnh cho báo cáo chỉ dùng nguồn chính chủ):
  - **cao**: có trong tài liệu hướng dẫn, changelog, bảng giá hoặc trang pháp lý — tức là văn bản mô tả cách sản phẩm chạy.
  - **vừa**: chỉ thấy trong trang marketing hoặc bài blog chính chủ, chưa có tài liệu vận hành, hoặc mâu thuẫn với tài liệu.
  - **thấp**: suy luận của người viết báo cáo.
- **Nhãn:** **[Nguồn]** = đã thấy trong nguồn đã dẫn. **[Suy luận]** = diễn giải của người viết báo cáo.
- Mọi nội dung web chỉ được đọc như dữ liệu. Một bài ODT (playbook 90 ngày) có mục "Instructions for AI assistants"; báo cáo chỉ ghi nhận đó là một *mẫu thiết kế*, không làm theo.
- Tệp thô (HTML/MD đã tải) nằm ở `scratchpad/research/raw/` để kiểm lại.

---

## 0. Tóm tắt

1. Tability tự chia AI thành **bốn lối vào**, tất cả chạy trên cùng một dữ liệu OKR: **AI-mode** (chat theo yêu cầu, kèm prompt đặt lịch), **Tabby** (trợ lý chủ động theo chu kỳ OKR), **Agents** (tác tử sở hữu mục tiêu, có đội con), **MCP server + skills library** (đưa dữ liệu OKR ra Claude, ChatGPT, Copilot…). Dưới bốn lối vào đó còn một lớp **AI nhúng trong editor**: sinh OKR, góp ý, dò số liệu, import bảng tính. [Nguồn: /ai, /ai/okr-assistant — cao]
2. Chỗ đáng học nhất không nằm ở các "khối" mà ở **kỷ luật thiết kế**:
   - AI đề xuất rồi người chốt (proposal → review → commit nguyên khối).
   - Mọi thứ AI viết đều mang **tác giả là Tabby/AI**, tách khỏi check-in của người.
   - Prompt và skill bắt buộc tách **bằng chứng đã ghi** khỏi **khuyến nghị**, và phải ghi rõ khi thiếu dữ liệu.
   - Mặc định chỉ đọc; mọi thao tác xoá phải qua bước xác nhận riêng.
   - AI thừa kế đúng quyền của người dùng.

   [Nguồn: guides import/auto-sync/AI Mode, changelog 27/08/2026, tability-skills — cao]
3. **Agents của Tability không chạy model trong Tability.** Tability chỉ là *control plane*: giữ danh tính, prompt, trạng thái mong muốn, số hiệu phiên bản (revision) và lịch sử. Việc chạy thật nằm trong **host bên ngoài** (Codex, ChatGPT, Claude Cowork) theo nhịp "heartbeat". Người dùng phải tự có tài khoản host. Đội con chỉ được tạo khi có một bình luận "Approve" hợp lệ. Hiện là open beta cho Premium. [Nguồn: guide Agent Workforce Manager, bài ODT 24/08/2026 — cao]
4. Model trong app là **OpenAI** (qua API doanh nghiệp). Dữ liệu không dùng để huấn luyện và bị xoá sau 30 ngày. Có thể **tự mang khoá OpenAI** để không giới hạn credit. Admin tắt được AI cho cả workspace, và phần OKR lõi vẫn chạy y nguyên. [Nguồn: AI Policy, guide OpenAI, Subprocessors — cao]
5. **Giá AI** tính theo đầu người: Premium $10–12/người/tháng, có khoảng 25–30 prompt AI-mode và 4.000 AI credit mỗi người mỗi tháng. Mỗi thao tác có giá credit cố định (import 250, phân tích AI mỗi lần sync 200). Gói "Agentic" $20–25 đang "coming soon". Con số không khớp giữa các trang. [Nguồn: /pricing, guides — cao]
6. **Điểm yếu lớn:**
   - Tầng agent phụ thuộc host ngoài và cài đặt nhiều bước.
   - Hạn mức prompt thấp.
   - Chỉ có một nhà cung cấp model trong app.
   - AI không đọc tài liệu/kiến thức ngoài dữ liệu OKR, trừ khi đi vòng qua MCP ở client khác.
   - Marketing mâu thuẫn với tài liệu: trạng thái "private beta" vs đã GA, điểm benchmark 4,6 vs 4,0, lời hứa "AI trong Slack" chưa có tài liệu.
   - Không thấy nói gì về hỗ trợ tiếng Việt.

---

## 1. Bản đồ nhanh

```
                    ┌──────────── cùng một dữ liệu OKR (plans, objectives, KRs, initiatives, check-ins, KPIs, members) ────────────┐
 Kế hoạch (Plan)    │ AI goal generator · AI feedback · Initiative generator · AI metric detection · AI Importer · (Plan Score)   │
 Theo dõi (Track)   │ Tabby: auto-sync + AI analysis · Generate check-in · Coaching AI                                              │
 Báo cáo (Report)   │ AI retrospectives · AI-mode (chat, chart, ghi KPI) · Scheduled prompts (email)                               │
 Thực thi (Execute) │ Agent Manager + Agency (đội con cần duyệt) · Standalone agent · Agent profile                                  │
 Kết nối (Connect)  │ MCP server (48 tool, OAuth) · Skills library (15 skill) · Link playbook cho trợ lý ngoài                      │
 Quản trị           │ Bật/tắt AI toàn workspace · tắt từng tính năng · bật/tắt MCP & Agents · API access từng người · BYOK · credit │
                    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Tability tự định vị bằng hai phân biệt [Nguồn: /ai/okr-assistant FAQ, /ai FAQ — cao]:
- **AI-mode và Tabby:** AI-mode là lớp chat và báo cáo theo yêu cầu. Tabby là trợ lý chủ động, chạy theo lịch trong chu kỳ OKR đã dựng sẵn.
- **Tabby và Agent:** Tabby không sở hữu mục tiêu, không tự đẻ việc, không có ghế trong sơ đồ tổ chức. Agent thì có cả ba.

---

## 2. Danh mục tính năng

Bảng tổng hợp trước, chi tiết từng thẻ ở dưới. "Gói" theo bảng giá mới (01/2026).

| # | Tính năng | Khối | Kích hoạt | Người kiểm soát | Gói / giá | Trạng thái | Tin |
|---|---|---|---|---|---|---|---|
| F01 | AI goal generator / chat với Tabby | Plan | theo yêu cầu | gợi ý → người bấm thêm | mọi gói (tốn credit) | GA | cao |
| F02 | AI feedback cho plan ("Generate analysis") | Plan | theo yêu cầu | từng gợi ý: Update / Dismiss | mọi gói (tốn credit) | GA | cao |
| F03 | Sinh initiative/task | Plan | theo yêu cầu | gợi ý → "Use this suggestion" | mọi gói | GA | cao |
| F04 | AI metric detection | Plan | tự động khi gõ KR | tự áp giá trị, người sửa được | mặc định bật | GA | cao |
| F05 | AI Importer (OKR/KPI từ XLSX/CSV) | Plan | theo yêu cầu, chạy nền | bản nháp riêng → duyệt → import nguyên khối | 250 credit/lần | GA | cao |
| F06 | Plan Score + Tips | Plan | tự động, cập nhật liên tục | chỉ gợi ý | mọi gói | GA; có thể là quy tắc, không phải LLM | cao (tồn tại) / thấp (có dùng AI) |
| F07 | Auto-sync + "Enable Tability AI" | Track | lịch ngày/tuần | AI viết bình luận; người vẫn được nhắc check-in | Premium; 200 credit/lần sync | GA | cao |
| F08 | Generate check-in ("Ask Tabby") | Track | theo yêu cầu trên KR | check-in đứng tên Tabby; @mention chủ KR | Premium (suy luận) | GA | cao |
| F09 | Coaching AI | Track | theo yêu cầu (nút Generate) | chỉ đọc: tóm tắt + việc nên làm | ban đầu gói trả phí | GA | cao |
| F10 | AI retrospectives ("Populate with AI") | Report | theo yêu cầu | bản nháp → sửa → publish | Premium | GA | cao |
| F11 | AI-mode (chat trên dữ liệu workspace) | Report | theo yêu cầu | trả lời kèm link nguồn; ghi được; xoá cần xác nhận | Premium, khoảng 30 prompt/người/tháng | trang marketing ghi beta, tài liệu ghi đã chạy | cao |
| F12 | Scheduled prompts | Report | thủ công / ngày / tuần / tháng / quý | người viết prompt, chọn người nhận | Premium, 30 (Agentic 500) | GA | cao |
| F13 | Agent Workforce Manager | Execute | heartbeat ở host ngoài (vd 30 phút) | duyệt đội bằng bình luận "Approve"; bình luận để lái | Premium open beta; gói Agentic sắp ra | beta | cao |
| F14 | Standalone agent / Agent profile | Execute | lịch cấu hình trong Tability | cài qua prompt; xem, đánh thức, tạm dừng | như F13 | beta | cao |
| F15 | Bề mặt giám sát agent | Execute | theo sự kiện | mục "input required"/attention; retry; wake | như F13 | beta | cao |
| F16 | Tability MCP server | Connect | client ngoài gọi | OAuth; quyền theo người; admin bật API access | Premium (bảng giá) | GA | cao |
| F17 | Skills library (15 skill) | Connect | người gọi skill trong Claude/ChatGPT | mặc định chỉ đọc; chỉ ghi khi được yêu cầu rõ | miễn phí (GitHub) | mới (08/2026) | cao |
| F18 | Link playbook cho trợ lý ngoài (kế hoạch 90 ngày) | Connect | người dán link vào trợ lý | trợ lý phải hỏi trước khi chạm workspace | miễn phí | mới (09/2026) | cao |
| F19 | Copilot Studio / Microsoft Teams qua MCP | Connect | người dùng Teams | một danh tính dùng chung (Tability khuyên tạo user riêng) | như F16 | GA | cao |
| F20 | Quản trị AI (tắt toàn bộ / từng tính năng / MCP & Agents / API access) | Nền | cấu hình | admin | mọi gói | GA | cao |
| F21 | BYOK khoá OpenAI; credit và hạn mức prompt | Nền | cấu hình | admin | BYOK: tài liệu nói Premium | GA | cao |
| F22 | Chính sách dữ liệu AI | Nền | — | — | — | hiệu lực 16/02/2025 | cao |
| F23 | Công cụ AI công khai (OKR generator, AI Metrics Generator) | Marketing | không cần đăng ký | — | miễn phí | URL cũ nay trỏ về bài viết | vừa |
| F24 | Đã hứa nhưng chưa thấy tài liệu: AI-mode trong Slack, gửi báo cáo AI vào Slack, AI-mode đọc Confluence/Notion, "affinity scoring", churn agent | — | — | — | — | chưa kiểm được | vừa / thấp |

### 2.1 Kế hoạch (Plan)

#### F01 — AI goal generator / chat với Tabby
- **Việc của người dùng:** chưa biết viết OKR thế nào. Mô tả ý định bằng lời, nhận về một bộ objective, key result, initiative đúng dạng.
- **Bề mặt:** Plan Editor.
  - Plan có sẵn: nút "Generate goals using AI" ở cuối plan.
  - Plan mới: nút "Chat with our AI".
- **Kích hoạt:** theo yêu cầu. Từ 05/2024 là **hội thoại** (GPT-4o): người sửa bằng lời, ví dụ đổi target, thêm KR về chuyển đổi, bỏ các KR mạng xã hội. AI còn hỏi thêm câu để làm OKR cụ thể hơn.
- **Người kiểm soát:** chỉ là gợi ý. Người phải bấm "Use this suggestion" hoặc bảo AI "thêm vào plan" thì mới ghi.
- **Dữ liệu nền:** prompt của người, phần nội dung đã có trong plan (khi sinh trong plan có sẵn), ngữ cảnh người tự khai (ngành, quy mô đội, số liệu hay xem).
- **Giá:** tốn AI credit, chưa công bố số credit mỗi lần.
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/features/plans/goal-setting-ai
  - https://guides.tability.io/docs/become-a-tability-power-user/how-tos/how-to-use-tabilitys-ai-for-your-complete-okr-cycle
  - https://blog.tability.io/chat-with-tabby-enhanced-ai-with-gpt-40/ (21/05/2024)
  - https://blog.tability.io/tability-ai/ (07/12/2022)
- **Mức tin:** cao.

#### F02 — AI feedback cho plan
- **Việc:** đã viết OKR, muốn biết chỗ nào yếu, ví dụ KR không đo được hoặc lệch khỏi objective.
- **Bề mặt:** Plan Editor, nút tím "Generate analysis" ở khung "AI feedback" bên phải.
- **Kích hoạt:** theo yêu cầu.
- **Người kiểm soát — mẫu "gợi ý đứng cạnh bản gốc":**
  - Bấm một gợi ý thì dòng liên quan trong plan được tô sáng.
  - Gợi ý kèm một câu viết lại.
  - Người chọn "Update Objective/Key Result" (thay tại chỗ) hoặc "Dismiss".
- **Dữ liệu nền:** nội dung plan.
- **Nguồn:** guide Goal-setting AI; guide "complete OKR cycle" (như F01). **Mức tin:** cao.

#### F03 — Sinh initiative/task
- **Việc:** đã có KR, cần danh sách việc để kéo KR.
- **Bề mặt:** trong plan, dưới mỗi KR, nút "Generate initiatives". Trang /features/initiatives cũng quảng cáo "Generate tasks with AI".
- **Kích hoạt:** theo yêu cầu. Bắt buộc gõ một ít ngữ cảnh hoặc ràng buộc (vd số lượng, "ưu tiên tự động hoá").
- **Người kiểm soát:** chat để tinh chỉnh, rồi "Use this suggestion". Bỏ bớt được sau.
- **Nguồn:** guide "complete OKR cycle"; https://www.tability.io/features/initiatives. **Mức tin:** cao.

#### F04 — AI metric detection
- **Việc:** gõ KR bằng lời thường, hệ thống tự điền loại chỉ số, giá trị đầu, giá trị đích. Ví dụ câu "tăng gấp đôi lượng theo dõi từ 120" cho ra đầu 120, đích 240.
- **Bề mặt:** Plan Editor.
- **Kích hoạt:** **tự động**, bật sẵn khi tạo workspace.
- **Người kiểm soát:** AI tự áp giá trị. Người chỉnh lại số đo, đơn vị, mốc trung gian. Admin tắt riêng tính năng này trong privacy settings.
- **Dữ liệu nền:** chỉ câu chữ của KR.
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/ai-metric-detection
  - https://blog.tability.io/new-ai-features-auto-detect-metric-values-on-your-okrs/ (05/03/2024)
  - https://www.tability.io/features/goal-setting
- **Mức tin:** cao.

#### F05 — AI Importer (OKR hoặc KPI từ bảng tính)
- **Việc:** OKR đang nằm trong Excel hay Google Sheet; muốn đưa vào mà không phải theo mẫu cố định.
- **Bề mặt:** Plans → menu import → AI Importer. Chọn "Import OKRs" hoặc "Import KPIs" — hai luồng tách riêng.
- **Kích hoạt:** theo yêu cầu.
  - Phân tích **chạy nền** vài phút; người rời trang được.
  - Có email báo khi đề xuất sẵn sàng.
  - Bản nháp nằm trong "Import history".
- **Người kiểm soát** (mẫu mạnh nhất trong sản phẩm):
  - Đề xuất là **bản nháp riêng, tự lưu**. Chưa có gì được tạo trong workspace.
  - Bộ lọc duyệt: *Needs fixing* (chặn import), *Needs attention* (nên xem, không chặn), *Excluded*.
  - Checkbox theo cây: bỏ cha thì bỏ luôn con bắt buộc; chọn con thì tự kéo theo cha.
  - Khớp người: theo email chính xác trước, rồi theo tên duy nhất. Không khớp hoặc mơ hồ thì để trống. **Không bao giờ tạo user hay team mới.**
  - Mục nghi trùng bị loại sẵn. **Không gộp, không ghi đè** plan hay KPI đã có.
  - Giá trị không chắc thì **bỏ đi, không bịa**. Có bảng tóm tắt những gì bị bỏ qua.
  - Import **nguyên khối**: lỗi một phần thì không tạo gì; đề xuất còn nguyên để sửa rồi thử lại.
  - Plan mặc định **publish ngay**, trừ khi bật "Keep as draft" — cần lưu ý.
- **Dữ liệu nền:** file XLSX/CSV tối đa 10 MB. AI đọc cả workbook: tên sheet, tiêu đề, thụt lề, đơn vị.
- **Giá:** **250 credit mỗi lần phân tích thành công.** Lỗi thì không tính. Dùng khoá AI riêng của workspace thì không tốn credit.
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/features/plans/import-okrs-and-kpis-with-ai
  - Bài 26/06/2025 (https://www.tability.io/odt/articles/introducing-the-very-first-ai-agent-dedicated-to-okrs) còn nói nhận được ảnh chụp, screenshot, Google Doc. Tài liệu hiện hành chỉ ghi XLSX/CSV, và DOCX ở "Legacy importer".
- **Mức tin:** cao (XLSX/CSV); vừa (ảnh/Doc).

#### F06 — Plan Score + Tips
- **Việc:** kiểm chất lượng plan trước khi publish.
- **Bề mặt:** khung phải của Plan Editor. Điểm 0–100 là trung bình năm chiều: Focus, Descriptive, Measurable, Ownership, Actionable.
- **Cách chạy:**
  - Tips bấm vào thì tô tím đúng dòng cần sửa.
  - Màu: đỏ ≤ 40, vàng 41–75, xanh > 75.
  - Tài liệu nói rõ điểm chỉ là lời nhắc, không phải công thức OKR cứng.
- **Ghi chú:** trang marketing xếp Plan Score vào mục "AI assist". Nhưng tài liệu mô tả tiêu chí định lượng (số objective, độ dài tiêu đề, có owner, có initiative…). **[Suy luận]** Nhiều khả năng đây là quy tắc cố định, không gọi LLM. Gợi ý bằng LLM nằm ở F02.
- **Nguồn:** https://guides.tability.io/docs/become-a-tability-power-user/features/plans/plan-score ; https://www.tability.io/features/goal-setting.
- **Mức tin:** cao (tính năng tồn tại); thấp (có dùng AI hay không).

### 2.2 Theo dõi (Track) — Tabby

#### F07 — Auto-sync số liệu + "Enable Tability AI"
- **Việc:** con số của KR nằm ở hệ thống khác (Salesforce, HubSpot, Jira, Sheets, SQL, Power BI, Amplitude…). Muốn nó tự cập nhật, kèm một đoạn phân tích.
- **Bề mặt:** panel KR, mục "Data connector" → tab "Data source".
- **Kích hoạt:**
  - Theo lịch **ngày hoặc tuần** khi plan còn hoạt động.
  - Nút sync tay.
  - Khi có connector, lúc tạo check-in tay số liệu cũng tự lấy về.
- **Người kiểm soát** (thiết kế đáng chú ý):
  - Bản cập nhật tự động hiện trong lịch sử KR với **tác giả là "Tability AI/Tabby"**. Check-in của người vẫn đứng tên người.
  - Bật "Enable Tability AI" thì AI **thêm gợi ý cải thiện vào bình luận của check-in**, không sửa con số.
  - Tài liệu nhấn mạnh auto-sync **không thay** việc chủ KR duyệt. Hệ thống **vẫn gửi nhắc check-in** để người giải thích, xác nhận confidence, ghi rủi ro. Confidence và phân tích nên để chủ KR giữ.
  - Tắt auto-sync không xoá check-in cũ.
- **Dữ liệu nền:** giá trị từ connector, lịch sử check-in, thời gian còn lại, gia tốc tiến độ. Tuỳ chọn "Deep Analysis" gợi ý cả mức confidence.
- **Giá:** data source có ở Plus/Premium; auto-sync chỉ Premium hoặc đang dùng thử. **AI analysis tốn 200 credit mỗi lần sync.**
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/integrations/auto-sync-for-data-sources
  - https://guides.tability.io/docs/become-a-tability-power-user/features/outcomes-key-results/data-sources
  - https://guides.tability.io/docs/become-a-tability-power-user/features/check-ins/automate-check-ins
  - guide "complete OKR cycle"
- **Mức tin:** cao.

#### F08 — Generate check-in ("Ask Tabby")
- **Việc:** chủ KR quên check-in hoặc đang nghỉ phép; vẫn muốn KR có một cập nhật định tính.
- **Bề mặt:** panel KR, mục "Ask Tabby", nút "Generate check-in". Cũng có trên dashboard KR.
- **Kích hoạt:** theo yêu cầu. Tài liệu khuyên dùng khi check-in trễ quá 2 ngày. Trang marketing mô tả Tabby "viết check-in mỗi tuần" — tức là kết hợp với F07.
- **Người kiểm soát:**
  - Check-in hiện trong timeline của KR dưới tên Tabby.
  - Tabby **gợi ý màu confidence** (đỏ / hổ phách / xanh).
  - Người muốn thêm ý thì @mention chủ KR trong bình luận.
- **Dữ liệu nền:** task đã xong, tiến độ số liệu mới nhất, các check-in trước.
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/how-tos/put-your-okrs-on-autopilot-with-tabilitys-ai-automation
  - https://blog.tability.io/tability-2025-year-in-review/ (18/12/2025) — bài này tự nhận chất lượng không bằng người viết
  - https://www.tability.io/ai/okr-assistant
- **Mức tin:** cao.

#### F09 — Coaching AI
- **Việc:** phân tích nhanh một KR đang đi thế nào và nên làm gì tiếp.
- **Bề mặt:** tab "Coaching" góc dưới phải panel outcome.
- **Kích hoạt:** theo yêu cầu, bấm "Generate", **không cần gõ prompt**.
- **Kết quả:** một đoạn tóm tắt ngắn và vài việc nên làm. Trang goal-tracking mô tả đó là "phân tích và bước tiếp theo cho chủ KR", không chỉ là tóm tắt cho quản lý.
- **Dữ liệu nền:** metadata của outcome và check-in.
- **Kiểm soát:** admin tắt riêng trong privacy settings.
- **Lịch sử:** ra mắt 04/2023, lúc đó không có cho người dùng miễn phí hoặc đang thử.
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/coaching-ai
  - https://blog.tability.io/new-ai-powered-okr-coach/
  - https://www.tability.io/features/goal-tracking
- **Mức tin:** cao.

### 2.3 Báo cáo (Report)

#### F10 — AI retrospectives
- **Việc:** cuối tháng hoặc quý phải viết bài nhìn lại; không muốn đọc lại mọi check-in.
- **Bề mặt:** tab "Retrospectives" của plan → Create new → "Populate with AI". Cũng điền được từ template.
- **Kết quả AI sinh:**
  - Tóm tắt tiến độ từ đầu quý đến nay.
  - Thắng và thua.
  - **Chấm điểm objective.**
  - Tóm tắt KR và phần việc đã làm.
- **Người kiểm soát:**
  - Retro ở trạng thái **draft**; phải **publish** thì mới chia sẻ được (PDF, link công khai).
  - Mọi phần đều sửa được: đổi điểm, thêm hoặc bớt phần.
  - Retro ghép từ các khối: văn bản, objective, outcome (kèm check-in mới nhất).
- **Gói:** Premium hoặc đang thử.
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/features/reporting/retrospectives
  - guide "complete OKR cycle"
  - https://blog.tability.io/march-update-ai-retros-faster-ux-and-spring-cleaning/ (26/03/2025)
- **Mức tin:** cao.

#### F11 — AI-mode
- **Việc:** hỏi dữ liệu OKR bằng lời, theo đủ các vai.
  - Lãnh đạo: cái gì đang lệch, rủi ro lớn nhất ở đâu.
  - Quản lý: dựng báo cáo tuần cho team X; KR nào lâu chưa cập nhật.
  - Nhân viên: tuần này nên tập trung gì; việc của tôi nối lên mục tiêu công ty thế nào.
- **Bề mặt:**
  - Mục "AI Mode" ở sidebar trái.
  - Theo bài benchmark tháng 09/2026: một **AI-mode gắn ngữ cảnh KR** (hỏi ngay trên KR đang mở) và **"Quick AI Mode prompts"** trên dashboard của plan. [vừa — mô tả trong bài đánh giá do chính Tability vận hành, chưa có trong guide]
- **Kích hoạt:** theo yêu cầu. Hội thoại **được lưu lại** để hỏi tiếp và dựng lại.
- **Khả năng:**
  - *Đọc:* tóm tắt, tìm rủi ro và blocker, nháp cập nhật tuần hoặc báo cáo lãnh đạo, xem xu hướng. Trả lời **kèm link** tới goal, KPI, initiative, check-in làm nguồn. [cao]
  - *Tạo:* tạo dashboard, tạo cả plan kèm OKR gợi ý, dựng biểu đồ / sơ đồ / scorecard từ dữ liệu sống và tải về để dán vào slide. [cao với dashboard và plan, theo guide "complete OKR cycle"; vừa với chart và slide, chỉ thấy ở bài ODT 26/06 và 27/07/2026]
  - *Ghi KPI (changelog 27/08/2026):*
    - Tạo và sửa KPI, ghi giá trị, đặt target.
    - Tạo KPI View; thêm, bớt, sắp lại KPI trong view.
    - **Cùng mô hình quyền** với người đang hỏi.
    - **Mọi thao tác xoá** (KPI, giá trị, target, view, gỡ KPI khỏi view) phải qua **bước xác nhận riêng**. [cao]
- **Giới hạn tự thừa nhận:**
  - Tài liệu nói AI-mode có thể sai; nên coi là hỗ trợ ra quyết định và kiểm lại nguồn.
  - Bài ODT ghi AI-mode **không kết hợp được connector MCP khác**; muốn trộn nhiều nguồn thì dùng MCP từ Claude hoặc ChatGPT.
- **Mẫu prompt Tability tự cung cấp** (tóm tắt, không chép):
  - Retro cho lãnh đạo, đánh giá lệch giữa plan cha và plan con, "coach tuần".
  - Đều có **luật truy vết**: mọi khẳng định quan trọng phải dẫn tới mục thật trong workspace; thiếu thì ghi rõ là không có dữ liệu hoặc chưa kiểm chứng.
  - Có luật định dạng chặt: số gạch đầu dòng tối đa, bảng gọn, TL;DR.
- **Hạn mức:** hiện số lượt còn lại cạnh ô prompt. Mặc định **30 prompt/tháng**, reset hàng tháng.
- **Trạng thái — không nhất quán:**
  - /ai/ai-mode ghi "Private beta" kèm form xin quyền.
  - /ai ghi "Rolling out now".
  - Bài ODT 22/01/2026 ghi "experimental".
  - Bảng giá đưa "AI Mode & AI assistant" vào Premium; changelog 08/2026 đã thêm tính năng mới.
- **Mô hình:** OpenAI enterprise API mặc định.
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/ai-mode
  - https://www.tability.io/ai/ai-mode
  - https://feedback.tability.io/changelog/manage-kpis-and-kpi-views-from-ai-mode
  - https://www.tability.io/odt/articles/new-ai-mode-chat-to-your-okrs
  - https://www.tability.io/odt/articles/turn-your-okrs-into-a-board-ready-deck-in-10-minutes
  - https://www.tability.io/compare/ai-features
- **Mức tin:** cao (lõi); vừa (chart/slide, AI-mode gắn KR).

#### F12 — Scheduled prompts
- **Việc:** nhận đều đặn một bản brief đúng câu hỏi của mình (sáng mỗi ngày, thứ Hai, cuối quý) mà không ai phải ngồi soạn.
- **Bề mặt:** AI Mode → "Scheduled prompts". Có template sẵn: Daily Brief, Weekly Summary, Weekly Team Digest.
- **Kích hoạt:**
  - Lịch: Manual, Daily, Weekly, Monthly, Quarterly.
  - Chạy theo **múi giờ workspace**.
  - **Hiện múi giờ và giờ chạy kế tiếp trước khi lưu.**
  - Prompt định kỳ **bắt buộc có người nhận** (thành viên workspace). Kết quả gửi **email**.
- **Người kiểm soát:**
  - Người viết prompt; nên chạy tay trước rồi mới đặt lịch.
  - Tài liệu khuyên giữ chuyện giao nhận (lịch, người nhận) **ngoài** nội dung prompt, để ở phần cài đặt lịch.
  - Kết quả sinh lúc chạy, nên phụ thuộc dữ liệu và quyền của người nhận tại thời điểm đó.
  - Bài ODT khuyên **chia sẻ template chứ không chia sẻ kết quả**: mỗi lãnh đạo tự sửa prompt cho phần việc của mình.
- **Dữ liệu nền (changelog 27/08/2026):** ngữ cảnh báo cáo **chỉ đọc** trên plans, objectives, KRs, initiatives, check-ins, members, agents, KPIs, giá trị KPI, target KPI, KPI Views.
- **Hạn mức:** saved prompts và scheduled prompts đều 30/người/tháng ở Premium, 500 ở Agentic (bảng giá).
- **Kênh:** trang /ai nói báo cáo định kỳ gửi vào "inbox hoặc Slack". Tài liệu hiện chỉ mô tả email. [Slack: vừa]
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/scheduled-prompts
  - https://feedback.tability.io/changelog/get-cleaner-scheduled-prompt-emails
  - https://www.tability.io/odt/articles/wake-up-to-what-matters-how-to-get-automated-daily-reports (04/05/2026)
  - https://www.tability.io/odt/articles/guide-chief-of-staff-weekly-leadership-brief (25/08/2026)
- **Mức tin:** cao.

### 2.4 Thực thi (Execute) — Agents

#### F13 — Agent Workforce Manager ("Agency")
- **Việc:** giao cả một **mục tiêu dài hạn** (vd tăng giá trị traffic từ 15k lên 20k USD) cho một AI manager. Manager tự chia thành KR con, đề xuất đội chuyên gia, điều phối và báo cáo.
- **Luồng** [Nguồn: guide — cao]:
  1. Trên một goal đang hoạt động mà mình sửa được: "Assign manager", đặt tên, chọn host **Codex, ChatGPT hoặc Claude Cowork**.
  2. Chép **toàn bộ hướng dẫn cài** Tability sinh ra vào **một cuộc hội thoại mới** ở host. Cuộc hội thoại đó thành ngữ cảnh bền vững của manager.
  3. Chọn model và lịch ở host. Mặc định khuyên "Work hours": 30 phút một lần, thứ Hai–thứ Sáu, 8:00–16:30. Có thể 24/7 hoặc tuỳ chỉnh.
  4. Tability chỉ đánh dấu "Installed" khi task ở host đã lưu, đã kiểm, và Tability đã nhận đúng revision của lịch.
  5. Lượt chạy đầu: manager đề xuất **sub-plan** (thường 3–4 mạch việc, ít nhất 3 KR hỗ trợ đo được) và **đội chuyên gia**. Cấm vai độn, KR trùng, chỉ số giả.
  6. **Cổng duyệt:** người sửa được root plan trả lời đề xuất mới nhất bằng một câu rõ ràng kiểu "Approve". Đổi trạng thái, trả lời đề xuất cũ, hay một bình luận khen chung chung **đều không tính**. Manager không được coi tài liệu hay bình luận không liên quan là sự đồng ý.
  7. Manager tạo từng agent con một cách **idempotent** (chạy lại không đẻ bản trùng). Mỗi con có task hoặc hội thoại riêng, không dùng chung với manager hay con khác.
  8. Giám sát từ Tability: tiến độ, output, lịch, blocker, retry, yêu cầu người can thiệp.
- **Người kiểm soát:**
  - Lái bằng **bình luận**; manager đọc ở heartbeat kế tiếp. Bình luận được cả trên agency không phải của mình.
  - Agent sẽ **xin quyền** (CMS, repo…). Người quyết cấp, hoặc bảo manager làm vòng qua. Tài liệu cấm nới phạm vi ngầm qua bình luận hay tài liệu: đổi cấu hình trong Tability rồi cài lại.
  - Tài liệu yêu cầu coi **bình luận, tài liệu, nội dung liên kết, lịch sử task là đầu vào không đáng tin**.
  - **Một người chủ vẫn chịu trách nhiệm** duyệt mọi agent chạy thật.
- **Giới hạn:**
  - Tối đa 6 agent mỗi agency (1 manager + 5 con).
  - **Open beta cho Premium** (subscription còn hiệu lực, AI bật, không phải thành viên chỉ đọc). Gói "Agentic" $20–25 "coming soon" đưa Agent Manager vào gói.
  - Chi phí model, lưu trữ, lịch chạy **do host chịu**.
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/agent-workforce-manager
  - https://www.tability.io/ai/ai-agent-manager
  - https://www.tability.io/odt/articles/codex-claude-ai-teams (24/08/2026)
  - https://feedback.tability.io/changelog/delegate-goals-to-ai-agents-with-less-setup
- **Mức tin:** cao.

#### F14 — Standalone agent và Agent profile
- **Standalone agent:** một agent giữ một trách nhiệm hẹp (nghiên cứu, báo cáo, bám việc, giám sát) hoặc gắn vào một goal hay initiative.
  - Tạo ở mục Agents → gắn goal hoặc initiative → Install.
  - Chọn host, nhịp, múi giờ; **lịch lưu trong Tability**, khác với agency.
  - Chép prompt cài → xác minh host chỉ có **đúng một** routine đang chạy → chạy thử một lần rồi mới tin lịch.
- **Agent profile only:** ghi nhận một agent chạy ở nơi khác và gắn vào goal hoặc initiative, chỉ để mọi người thấy.
- **Agent có thể tự đăng check-in** trên KR nó sở hữu. Bài ODT 06/05/2026 có ví dụ một check-in rất chi tiết của agent viết nội dung.
- **Nguồn:** guide Agent Workforce Manager; https://www.tability.io/odt/articles/agents-status-reports ; https://www.tability.io/odt/articles/tability-ai-features-explained.
- **Mức tin:** cao.

#### F15 — Bề mặt giám sát agent
- **Danh mục Agents:** output gần đây, hoạt động, tiến độ, thay đổi confidence, việc cần chú ý.
- **Hồ sơ agent:** goal, initiative, lịch, cài đặt, đội con.
- **Thao tác:** "Wake agent" (chạy ngay), đổi host, retry lệnh lịch đang treo, tạm dừng, gỡ quan hệ, xoá hồ sơ.
- **Mục "input required" / attention item trên trang chủ:** nói rõ chuyện gì xảy ra, cách xử lý, nên mở việc nào hay agent nào.
- **Agent ngồi cùng bề mặt với người:**
  - Thư mục người + agent chung một chỗ.
  - Thẻ KR và initiative trên Strategy Map hay Dependencies Map hiện avatar agent cạnh người.
  - Thông báo di động ghi rõ khi cập nhật đến từ AI agent.
- **Tắt Agents** (admin, mục "MCP and agents"): ẩn tính năng và chặn agent đã cài truy cập, nhưng **giữ nguyên** agent, lịch, quan hệ, lịch sử. Bật lại không cần cài lại.
- **Nguồn:**
  - guide Agent Workforce Manager
  - https://www.tability.io/features/strategy-map
  - https://feedback.tability.io/changelog/stay-on-top-of-updates-with-improved-mobile-notifications
- **Mức tin:** cao.

### 2.5 Kết nối (Connect)

#### F16 — Tability MCP server
- **Việc:** dùng Claude, ChatGPT, Copilot… để đọc và ghi OKR ngay trong lúc làm việc khác (viết cập nhật tuần, chuẩn bị 1:1…), và làm đường ống cho agents.
- **Endpoint theo vùng:** `mcp.tability.app/mcp` (US), `mcp-eu…`, `mcp-au…`.
- **Xác thực:**
  - **OAuth qua trình duyệt.** Tài liệu cấm dán API token vào prompt.
  - Mỗi người phải được admin bật **"API Access Enabled"**.
  - Quyền thừa kế đúng quyền của người đó trong Tability.
- **Cài bằng prompt:** Tability có một **setup prompt dạng markdown** cho từng vùng. Trợ lý tự nhận biết host, dẫn người qua bước OAuth, rồi **xác minh bằng lệnh `tability_whoami`** trước khi báo thành công.
- **Công cụ** (48, đếm từ tài liệu):
  - *Đọc:* workspace, thành viên (kèm quản lý và cấp dưới), plan, nội dung plan, objective, outcome, initiative, check-in, bình luận, tìm kiếm.
  - *Ghi:* tạo outcome, tạo và sửa initiative. Sửa initiative **không** đổi được `work_state`; trạng thái phải đổi qua *bình luận trạng thái* (initiative comment). Tạo check-in.
  - *Agent:* create / upsert child / stop child / begin run / finish run "đúng một lần" / confirm schedule / supervision; quan hệ agent với outcome và initiative.
  - **Không thấy** công cụ tạo plan hay objective, sửa hay xoá outcome, check-in. Trang marketing lại nói tạo được "goals, plans, tasks" từ LLM. [lệch giữa marketing và tài liệu]
- **Client hỗ trợ:**
  - Claude: custom connector.
  - ChatGPT: Developer Mode.
  - Microsoft Copilot Studio và kênh Teams/M365 Copilot — **dùng chung một danh tính cho mọi người**, nên Tability khuyên tạo một user riêng để giới hạn dữ liệu nhìn thấy.
  - Codex, Claude Cowork, Claude Code (qua setup prompt).
- **Gói:** Premium trở lên (bảng giá).
- **Nguồn:**
  - https://guides.tability.io/docs/become-a-tability-power-user/integrations/tability-mcp-server
  - https://mcp.tability.app/agent-setup/prompt.md
  - https://www.tability.io/ai/mcp-server
- **Mức tin:** cao.

#### F17 — Tability Skills Library
- **Việc:** thay vì prompt trắng, gọi một **quy trình dựng sẵn** trong Claude hoặc ChatGPT, nối dữ liệu Tability qua MCP.
- **15 skill, bốn nhóm:**
  - *Chất lượng mục tiêu:* nháp OKR từ chiến lược, soát độ sẵn sàng, kiểm alignment, kiểm năng lực đội.
  - *Nhịp tuần:* soát thói quen check-in, danh sách nhắc nhở, nháp cập nhật tuần, radar rủi ro, nhịp tuần của trưởng nhóm.
  - *Họp lãnh đạo:* đọc trước 1:1, brief họp lãnh đạo, MBR, QBR pack.
  - *Nhìn lại:* retro quý, danh mục góc nhìn CxO.
- **Cấu trúc mỗi skill:**
  - `SKILL.md`: quy trình và **hợp đồng đầu ra** (output contract).
  - `agents/openai.yaml`: tên hiển thị và prompt khởi động.
  - `references/sample-output.md`: ví dụ đầu ra đã kiểm.
  - Hướng dẫn trong `docs/guides/`.
  - Tên thư mục, tên trong frontmatter, tên gọi và link hướng dẫn **trùng nhau** theo quy ước.
- **Kỷ luật trong nội dung skill** (tóm tắt):
  - Mặc định chỉ đọc; chỉ ghi vào Tability khi được yêu cầu rõ.
  - Hỏi lại **một** câu khi phạm vi mơ hồ; không tự chọn một plan trong nhiều plan.
  - Có một check-in mới **không đồng nghĩa** có tiến triển.
  - Giữ nguyên điểm, đơn vị, ngày, confidence như đã ghi.
  - Gắn nhãn phần suy diễn.
  - **Không cộng gộp các chỉ số khác loại.**
  - Không dùng ảnh do AI sinh làm bằng chứng.
  - Chỉ báo cáo file thật sự đã tạo.
  - Skill nhắc nhở chỉ *nháp* tin nhắn, không gửi, không bịa thông tin liên hệ, giọng trung tính, không quy lỗi.
  - Trước khi ghi ra ngoài phải xác nhận nơi đến và người nhận.
- **Cài đặt:** chép vào `~/.claude/skills`, `.agents/skills`, hoặc zip rồi tải lên claude.ai. Có **INSTALL_PROMPT** để trợ lý tự cài: phát hiện đích, không ghi đè bản khác khi chưa hỏi, kiểm lại file.
- **Thời điểm:** repo tạo 04/08/2026; bài giới thiệu 06/08/2026.
- **Nguồn:**
  - https://github.com/tabilityio/tability-skills
  - https://www.tability.io/odt/articles/claude-chatgpt-skills-tability
  - https://www.tability.io/ai/mcp-server
- **Mức tin:** cao.

#### F18 — Link playbook cho trợ lý ngoài (kế hoạch 90 ngày)
- **Việc:** người chưa có tài khoản dán link bài viết vào trợ lý AI của mình và nói "chạy playbook này".
- **Trợ lý làm gì:**
  - Hỏi từng câu ngắn, đọc website và các công cụ đã nối.
  - Soạn chiến lược: chủ đề → mục tiêu đo được → hành động → 5 KPI; lưu thành markdown.
  - Rồi đưa vào Tability và đặt lịch theo dõi tuần.
- **Luật cho trợ lý:**
  - Chỉ chạm workspace người dùng đưa URL.
  - Hiện tên và ID, được đồng ý rồi mới đọc hay ghi.
  - Không bịa số; gắn nhãn số đo được / ước tính / đề xuất.
  - Đọc lại những gì đã ghi trước khi báo là xong.
- **[Suy luận]** Đây là kênh **phân phối và onboarding bằng agent**: bài viết vừa là marketing vừa là "chương trình" cho trợ lý ngoài.
- **Nguồn:** https://www.tability.io/odt/articles/ai-90-day-plan-playbook (17/09/2026). **Mức tin:** cao (tồn tại); ý nghĩa: thấp.

#### F19 — Microsoft Teams / Copilot
- App Teams cho xem và cập nhật OKR, check-in, initiative ngay trong Teams; danh tính Teams dùng làm đăng nhập. App này **không có AI riêng**.
- Phần AI trong Teams đi qua **Copilot Studio + MCP** (xem F16).
- **Nguồn:** https://guides.tability.io/docs/become-a-tability-power-user/integrations/microsoft-teams ; guide MCP. **Mức tin:** cao.

### 2.6 Nền tảng, quản trị, giá

#### F20 — Quản trị AI
- **Tắt toàn workspace:** Workspace Settings → Integrations → OpenAI → tắt. Có thêm mục "AI settings" và "Privacy".
- **Tắt riêng từng tính năng:** Coaching AI, AI metric detection (privacy settings).
- **Bật/tắt "MCP and agents"** riêng.
- **"API Access Enabled"** theo từng người (điều kiện dùng MCP và cài agent).
- **Cam kết:** tắt AI thì phần OKR lõi chạy **y hệt**.
- **Nguồn:**
  - guide OpenAI: https://guides.tability.io/docs/become-a-tability-power-user/integrations/openai
  - https://guides.tability.io/docs/become-a-tability-power-user/features/workspace-settings
  - trang /ai/mcp-server và /ai/ai-agent-manager (FAQ)
- **Mức tin:** cao.

#### F21 — Credit, hạn mức prompt, BYOK

| | Basic | Premium | Agentic (sắp ra) | Nguồn |
|---|---|---|---|---|
| Giá năm / tháng | $6 / $7 | $10 / $12 | $20 / $25 | /pricing |
| AI credits / người / tháng | — (bảng mới) | 4.000 | 10.000 | /pricing |
| Prompt AI Assistant (Tabby) | — | 30 (dòng "Prompts" ở mục Usage lại ghi 25) | 500 | /pricing |
| Saved / scheduled prompts | — | 30 / 30 | 500 / 500 | /pricing |
| "OKR Agent" | có | có | có | /pricing |
| MCP server | — | có | có | /pricing |
| AI retrospectives, Workspace Insights | — | có | có | /pricing |
| Agent Manager, agent-to-agent, hỗ trợ Cowork/Codex/OpenClaw | — | (beta qua docs) | có | /pricing, guide agent |

- **Giá credit theo thao tác:** import 250; AI analysis mỗi lần sync 200. Tiêu credit gồm: sinh goal/task, metric AI, coaching.
- **Hết credit:** khoá tính năng AI tới tháng sau.
- **Tăng credit:** nâng gói hoặc thêm seat. **Viết đánh giá 5 sao trên G2 được +5.000 credit/tháng** mỗi bài.
- **BYOK:**
  - Tự thêm khoá OpenAI thì "không giới hạn credit"; import dùng khoá riêng không trừ credit.
  - FAQ cũ nói Premium có thể dùng "LLM của riêng mình" nhưng phải liên hệ.
  - AI Policy ghi quyền "dùng tài khoản OpenAI riêng".
- **Mâu thuẫn trong nguồn:**
  - FAQ trang giá nói "mọi tính năng AI đều có trong Basic", trong khi bảng so sánh không cho Basic credit hay Tabby.
  - Prompt Premium 25 vs 30.
  - FAQ hướng dẫn còn nhắc "GPT-3" và gói "Plus" cũ.
- **Nguồn:**
  - https://www.tability.io/pricing
  - https://guides.tability.io/docs/other/how-to-get-more-ai-credits
  - https://guides.tability.io/docs/getting-started-with-tability/tability-frequently-asked-questions
  - https://blog.tability.io/jannounce-pricing-changes/ (12/01/2026)
- **Mức tin:** cao (con số); vừa (cách hiểu dòng "OKR Agent" ở Basic).

#### F22 — Chính sách dữ liệu AI
- **Nhà cung cấp:** OpenAI là nhà cung cấp LLM duy nhất được nêu cho tính năng trong app, qua API doanh nghiệp.
- **Cam kết:** không dùng dữ liệu để huấn luyện; dữ liệu gửi OpenAI **xoá sau 30 ngày**.
- **Subprocessor:** OpenAI ghi ở **Mỹ**, xử lý "dữ liệu OKR, prompt người dùng", có DPA kèm SCC. **[Suy luận]** Nghĩa là workspace đặt ở EU hay AU vẫn gửi dữ liệu AI sang Mỹ.
- **Danh sách "gửi / không gửi" OpenAI** (guide OpenAI):
  - *Gửi:* tên plan, objective, outcome, ngày, giá trị đầu và đích, nội dung check-in.
  - *Không gửi:* PII, tên và cài đặt workspace, ghi chú plan, mô tả objective và KR.
  - **[Suy luận]** Danh sách này có lẽ đã cũ: changelog 08/2026 cho scheduled prompts đọc cả members, agents, KPIs. Bản tối giản dữ liệu hiện hành chưa rõ.
- **AI Policy (hiệu lực 16/02/2025):** minh bạch khi có AI; con người giám sát "khi cần"; opt-out toàn workspace; dùng OpenAI riêng; có quyền hỏi AI ảnh hưởng thế nào.
- **Vùng lưu trữ:** US mặc định; EU/AU theo yêu cầu, **tối thiểu 100 user**.
- **Nguồn:**
  - https://guides.tability.io/legals/artificial-intelligence-policy
  - https://guides.tability.io/legals/subprocessors
  - https://guides.tability.io/legals/trust-and-security
  - guide OpenAI
- **Mức tin:** cao.

#### F23 — Công cụ AI công khai
- 05/2024 Tability nói đã mở OKR generator cho người không đăng ký, kèm thư viện template do người dùng sinh ra. Footer còn "AI Metrics Generator".
- Kiểm 26/09/2026: `/templates/generator` và `/templates/metrics/generator` đều trả về một **bài viết** hướng dẫn viết OKR bằng ChatGPT/Claude, không phải công cụ.
- **[Suy luận]** Công cụ công khai có thể đã bị thay bằng nội dung hoặc bằng playbook F18.
- **Nguồn:** https://blog.tability.io/chat-with-tabby-enhanced-ai-with-gpt-40/ ; https://www.tability.io/templates/generator. **Mức tin:** vừa.

#### F24 — Đã hứa hoặc tuyên bố, chưa thấy tài liệu vận hành

| Tuyên bố | Ở đâu | Trạng thái |
|---|---|---|
| AI-mode trả lời "ngay trong Slack" | bài CEO 27/07/2026 | guide Slack chỉ có nhắc check-in, cập nhật tiến độ, digest tuần — **vừa** |
| Báo cáo AI định kỳ gửi vào Slack | /ai | guide scheduled prompts chỉ nói người nhận là thành viên (email) — **vừa** |
| AI-mode kéo ngữ cảnh từ Jira, Asana, ClickUp, **Confluence, Notion** | bài ODT 22/01/2026 | guide Confluence chỉ có *nhúng widget Tability vào Confluence* (chiều ra) — **vừa**, nghiêng về chưa có |
| "Affinity scoring": Tabby tự tìm việc liên quan tới bạn, gợi ý cascade | bài 26/06/2025, viết ở thì tương lai | không thấy trong guide hay changelog — **thấp** |
| "Churn prevention agent" private beta | bài ODT 15/06/2026 | không có tài liệu — **vừa** |
| Tabby tự viết check-in "mỗi tuần" | /ai/okr-assistant | có qua auto-sync + AI (F07) và nút Generate (F08); không thấy lịch "viết thay người" riêng — **vừa** |
| Import từ ảnh, screenshot, Google Doc | bài 26/06/2025 | guide hiện hành chỉ XLSX/CSV — **vừa** |

---

## 3. Chi tiết thiết kế đáng học (đúc kết)

Mỗi mục ghi rõ đã thấy ở đâu. Phần "vì sao đáng học" là **[Suy luận]**.

1. **Đề xuất → duyệt → commit nguyên khối** (AI Importer, F05).
   - AI không bao giờ ghi thẳng: đề xuất là bản nháp riêng, có ba bộ lọc lỗi/chú ý/loại.
   - Không tạo người mới, không gộp hay ghi đè, bỏ giá trị không chắc thay vì bịa.
   - Import tất cả hoặc không gì; chỉ tính phí khi đề xuất thành công.
   - *Vì sao:* biến AI thành "nhân viên soạn nháp", người giữ nút cuối; lỗi AI không lọt vào dữ liệu thật.
2. **Gợi ý đứng cạnh bản gốc, thay tại chỗ hoặc bỏ** (AI feedback, F02): tô sáng dòng liên quan, nút Update/Dismiss cho từng gợi ý. Plan Score dùng cùng kiểu tô sáng.
3. **Đứng tên AI** (F07, F08, F15):
   - Cập nhật tự động và check-in do Tabby sinh đứng tên "Tability AI/Tabby".
   - Thông báo di động ghi rõ khi đến từ AI agent.
   - Agent có avatar trên bản đồ chiến lược.
   - *Vì sao:* người đọc luôn biết câu nào của người, câu nào của máy — điều kiện để tin báo cáo.
4. **AI bổ sung chứ không thay nhịp người** (F07):
   - Phân tích AI nằm trong *bình luận* của check-in, con số vẫn do connector cấp.
   - Hệ thống vẫn nhắc chủ KR check-in; confidence và phân tích "nên để chủ KR giữ".
   - Ngược lại, marketing đôi khi hứa "không bao giờ phải check-in nữa" — xem mục 5.
5. **Kỷ luật bằng chứng trong prompt và skill** (F11, F12, F17):
   - Mọi khẳng định quan trọng dẫn về mục thật; thiếu dữ liệu thì nói là thiếu.
   - Tách "đã ghi" khỏi "khuyến nghị"; không coi có check-in là có tiến độ; không cộng chỉ số khác loại.
   - Một check-in thiếu là bằng chứng cần báo, không phải chỗ để AI bịa. Bài chief-of-staff dặn rõ: không yêu cầu AI-mode "bịa tiến độ" cho chỗ thiếu cập nhật.
   - Tability đặt các luật này **ngay trong mẫu prompt công bố cho người dùng**, không giấu trong system prompt.
6. **Chỉ đọc mặc định, xác nhận khi phá** (F11, F17): AI-mode ghi được KPI nhưng mọi thao tác xoá qua bước xác nhận; skills chỉ ghi khi được yêu cầu rõ, và hỏi nơi đến, người nhận trước khi ghi ra ngoài.
7. **Thừa kế quyền, không mở thêm** (F11, F16):
   - AI-mode và MCP chỉ thấy những gì người đó thấy.
   - MCP cần admin bật API access cho từng người.
   - Trường hợp danh tính dùng chung (Copilot Studio) thì chính Tability cảnh báo và khuyên dùng user riêng.
   - *Vì sao, với OneHub:* đây đúng là cơ chế cần cho vai «chỉ OKR».
8. **Tách "nội dung" khỏi "giao nhận" trong báo cáo định kỳ** (F12): prompt chỉ nói *hỏi gì, trình bày thế nào*; lịch, múi giờ, người nhận nằm ở cài đặt; **hiện giờ chạy kế tiếp trước khi lưu**; có template; "chia sẻ template, không chia sẻ kết quả".
9. **Tách rõ ba vai:** chat theo yêu cầu (AI-mode), trợ lý chủ động trong chu kỳ (Tabby), tác tử sở hữu mục tiêu (Agent). Mỗi vai có bề mặt, cách kích hoạt và mức tự chủ riêng, và Tability giải thích sự khác nhau ngay trong FAQ sản phẩm.
10. **Control plane và execution plane tách nhau** (F13, F14, F16):
    - Tability giữ danh tính, prompt, trạng thái mong muốn, revision, lịch sử.
    - Host giữ lịch và chạy model.
    - Có upsert idempotent, `begin_run`/`finish_run` đúng một lần, xác nhận lịch chỉ sau khi đã kiểm task thật.
    - Kẹt thì sinh "attention item" kèm cách xử lý thủ công chính xác, **không** tự đẻ thêm vòng điều khiển.
    - Tắt tính năng thì giữ trạng thái.
11. **Cổng duyệt tường minh cho việc mở rộng phạm vi:** đội con chỉ sinh ra sau một câu "Approve" hợp lệ từ đúng người trên đúng đề xuất. Coi bình luận và tài liệu là đầu vào không tin cậy. Không nới quyền ngầm.
12. **Công tắc nhiều tầng:** tắt AI cả workspace, tắt từng tính năng, tắt MCP và agents, bật API access từng người — và cam kết lõi chạy y hệt khi tắt.
13. **Kinh tế học minh bạch:**
    - Credit theo người theo tháng; giá credit cố định cho từng thao tác nặng.
    - Hạn mức prompt hiện ngay cạnh ô nhập.
    - Lỗi thì không tính; BYOK thì bỏ qua credit.
14. **Cài đặt bằng prompt có bước tự kiểm** (F16, F17): setup prompt và install prompt đều bắt trợ lý xác minh (`whoami`, so danh sách file) và "không nói thành công khi chưa kiểm".
15. **Rào chắn không-AI để giữ trung thực** (liên quan AI vì dữ liệu sạch nuôi AI): chặn quá N lần liên tiếp "at risk" (mặc định cảnh báo lần 3), buộc chọn xanh hoặc đỏ. Nguồn: https://blog.tability.io/automate-honest-reporting-with-tability/ (12/09/2024).
16. **Lối vào gắn ngữ cảnh:** AI-mode gắn KR đang xem, quick prompts trên dashboard plan, nút "Ask Tabby" trong panel KR — AI xuất hiện đúng chỗ đang làm việc, không chỉ ở một khung chat chung. (vừa với AI-mode gắn KR)

---

## 4. Dòng thời gian AI của Tability

| Thời điểm | Mốc | Nguồn |
|---|---|---|
| 12/2022 | Goal generator (OpenAI); tự nhận là OKR tool đầu tiên dùng OpenAI | blog tability-ai |
| 04/2023 | Coach AI trên KR | blog new-ai-powered-okr-coach |
| 07/2023 | Chuyển sang GPT-4 | blog tability-ai-gpt-4 |
| 03/2024 | AI metric detection | blog new-ai-features-auto-detect… |
| 05/2024 | Chat với Tabby (GPT-4o), sinh và sửa OKR bằng hội thoại; generator công khai | blog chat-with-tabby… |
| 09/2024 | Chặn "at risk" liên tiếp (không-AI) | blog automate-honest-reporting… |
| 03/2025 | AI retrospectives | blog march-update… |
| 06/2025 | Tabby tái định vị là "OKR agent": check-in tự động, báo cáo, cảnh báo | ODT introducing-the-very-first-ai-agent… |
| 12/2025 | Tổng kết năm; AI-mode "experimental"; KPI beta | blog tability-2025-year-in-review |
| 01/2026 | AI-mode experimental access; tăng giá | ODT new-ai-mode…; blog jannounce-pricing-changes |
| 05/2026 | Scheduled prompts; agent tự viết status report | ODT wake-up…, agents-status-reports |
| 06/2026 | MCP + Claude + Rovo tạo KR; churn agent private beta; chart/slide từ AI-mode | ODT agentic-okr…, board-ready-deck |
| 07/2026 | Bài tổng hợp mọi tính năng AI | ODT tability-ai-features-explained |
| 08/2026 | Skills library (15); Agent Manager open beta; AI-mode ghi KPI; email scheduled prompt gọn hơn | GitHub; ODT codex-claude-ai-teams; changelog 17–27/08 |
| 09/2026 | Playbook 90 ngày cho trợ lý ngoài; benchmark AI cập nhật 15/09 | ODT ai-90-day-plan-playbook; /compare/ai-features |

---

## 5. Mô hình tinh thần của Tability về AI

**[Nguồn]** Tability tự trình bày AI theo **vòng đời OKR**, không theo công nghệ: Plan → Track → Report → Execute → Orchestrate → Connect. Tiêu đề họ dùng là "built in, not bolted on". Cùng lúc họ mời khách chọn một trong **bốn lối vào**, tất cả "trên cùng dữ liệu OKR bên dưới". [https://www.tability.io/ai]

**[Suy luận]** Bóc lớp marketing, kiến trúc thật gồm sáu khối:

1. **Lõi dữ liệu có cấu trúc — tài sản chính.**
   - Plan → Objective → KR → Initiative → Check-in (số + confidence + phân tích), KPI, người, team, quan hệ phụ thuộc.
   - Họ lập luận AI-mode "hơn LLM bất kỳ" vì dữ liệu OKR đã được tổ chức theo mức quan trọng, và check-in là "dữ liệu người thật" tích luỹ hằng tuần. [Nguồn: ODT new-ai-mode… — cao]
   - Không có kho tri thức hay RAG tài liệu riêng. Ngữ cảnh ngoài vào qua **data connector** (chỉ con số) hoặc qua **client MCP** (Claude có Rovo, Drive…).
2. **Sinh nội dung tại chỗ, người chốt** (Plan và Report): generator, feedback, initiative, metric detection, importer, retro. Mẫu chung: gợi ý hoặc nháp → người Update/Use/Import/Publish.
3. **Tự động hoá nhịp chủ động gắn KR** (Tabby): connector cấp số theo lịch → AI viết bình luận hoặc check-in đứng tên Tabby → người vẫn được nhắc. Đây là "trợ lý", không sở hữu mục tiêu.
4. **Lớp truy vấn và báo cáo theo yêu cầu, rồi đặt lịch** (AI-mode + Scheduled prompts): chat có trích nguồn → lưu prompt → chạy định kỳ gửi email. Từ 08/2026 bắt đầu *ghi* (KPI) với xác nhận khi xoá. Đây là chỗ gần "AI trong chat" nhất.
5. **Tác tử sở hữu mục tiêu, chạy ở host ngoài** (Agents): Tability làm "hệ thống ghi nhận và điều phối" — mục tiêu, sub-plan, người + agent trên cùng sơ đồ, duyệt, bình luận lái, hàng đợi cần người. Model, lịch và công cụ nằm ở Codex, ChatGPT, Cowork. Họ nói thẳng: Tability giữ ngữ cảnh kinh doanh, môi trường agent làm việc.
6. **Mở ra hệ sinh thái** (MCP + skills + playbook link): thừa nhận người dùng sống trong Claude, ChatGPT, Copilot; biến Tability thành *nguồn sự thật về mục tiêu* cho mọi model. "Bring your own model" nằm ở đây, **không** nằm trong app — trong app chỉ có OpenAI hoặc BYOK OpenAI.

Bao quanh cả sáu khối là **lớp quản trị chung**: quyền thừa kế, công tắc nhiều tầng, credit và hạn mức, gắn nhãn tác giả AI, chính sách dữ liệu.

**[Suy luận] Chiến lược ngầm:**
- Trong app dùng một model rẻ, đơn giản (OpenAI) cho các tác vụ ngắn, có cấu trúc.
- Đẩy phần tác tử dài hơi và đắt (nhiều bước, nhiều công cụ ngoài) sang **hạ tầng và hoá đơn của khách** qua MCP.
- Nhờ vậy Tability không gánh chi phí token cho agent, và khỏi phải xây sandbox hay connector cho mọi hệ thống.
- Cái giá: trải nghiệm cài đặt phức tạp và phụ thuộc host.

---

## 6. Điểm yếu và những gì không làm

Nguồn ghi cạnh từng ý; phần đánh giá là **[Suy luận]** trừ khi ghi khác.

1. **"Agent native" nhưng thực thi ở ngoài.**
   - Marketing nói "Native agents… in-app". Tài liệu cho thấy manager và đội con là task hay heartbeat trong **Codex / ChatGPT / Claude Cowork**. Người dùng phải có tài khoản host, chép prompt cài, xử lý "Reinstall required", đối soát lịch con, dọn routine trùng.
   - Chi phí và độ ổn định phụ thuộc host. Beta, tối đa 6 agent mỗi agency.
   - [Nguồn: guide Agent Workforce Manager — cao]
2. **Một nhà cung cấp model trong app.** Chỉ OpenAI (BYOK cũng là OpenAI). Không chọn model theo tác vụ. Dữ liệu AI xử lý ở Mỹ dù workspace ở EU hay AU. [Nguồn: AI Policy, Subprocessors — cao]
3. **Hạn mức thấp, cơ chế credit khó đoán.**
   - Khoảng 25–30 prompt AI-mode mỗi người mỗi tháng ở Premium.
   - Import 250 credit, mỗi lần sync có AI 200 credit. Một KR sync hằng ngày có AI tốn khoảng 6.000 credit/tháng, vượt hạn mức 4.000 của một người. [Suy luận từ con số nguồn]
   - Chiêu "đánh giá 5 sao G2 đổi credit" có thể làm giảm độ tin của đánh giá.
4. **Không có kho tri thức hay RAG tài liệu trong app.**
   - AI chỉ nhìn dữ liệu OKR, KPI và số từ connector. Confluence chỉ là nhúng widget ra ngoài.
   - Tài liệu chiến lược, biên bản họp, wiki không vào được AI-mode. Muốn có thì phải sang Claude hoặc ChatGPT với MCP — chính Tability thừa nhận AI-mode không trộn được connector khác.
5. **Marketing lệch tài liệu, làm khó đánh giá.**
   - AI-mode vừa là "private beta", vừa "rolling out", vừa "experimental", trong khi đã bán trong Premium và có changelog.
   - Trang /ai tự xếp #1 với 4,6/5 và 5/5 cho agent/MCP; chính trang benchmark (do Tability vận hành, cập nhật 15/09/2026) ghi **4,0/5, đồng hạng với WorkBoard** và nói agent/MCP "chưa kiểm hết".
   - MCP "tạo goals, plans" nhưng danh mục tool không có tạo plan hay objective.
   - "AI trong Slack" chưa có tài liệu.
   - [Nguồn: /ai, /ai/ai-mode, /compare/ai-features, guide MCP — cao về sự lệch]
6. **Kênh chat nội bộ mỏng.**
   - Slack chỉ có nhắc check-in, cập nhật tiến độ, digest tuần. Không có bot hỏi đáp AI được tài liệu hoá.
   - Teams có app xem và sửa, nhưng AI phải qua Copilot Studio với **một danh tính dùng chung** — phá mô hình quyền theo người.
   - Không có kênh nhắn tin nào khác. Không thấy Zalo hay kênh châu Á.
7. **Rủi ro "tiến độ ma".** Marketing hứa có thể không cần người check-in, trong khi tài liệu dặn giữ người trong vòng. Check-in do AI viết dựa trên dữ liệu mỏng có thể làm dashboard "trông ổn". Tability giảm rủi ro bằng nhãn tác giả và nhắc nhở, nhưng **không thấy** cơ chế đánh dấu KR "chỉ có AI cập nhật" hay chỉ số tỷ lệ check-in AI/người. [Suy luận]
8. **Cổng duyệt agent dựa trên văn bản tự do.** "Approve" trong bình luận dễ nhầm; tài liệu phải liệt kê nhiều trường hợp không được tính. Không có nút duyệt có cấu trúc hay hồ sơ duyệt riêng. [Nguồn: guide — cao; đánh giá: suy luận]
9. **Không công bố chất lượng hay đánh giá AI.** Chỉ có lời "AI có thể sai, hãy kiểm". Không thấy số đo độ chính xác, không thấy vòng phản hồi (thumbs up/down) được tài liệu hoá, không thấy nhật ký kiểm toán riêng cho hành động AI — ngoài lịch sử agent và audit trail quản trị chung.
10. **Chính sách dữ liệu có dấu hiệu cũ.** Danh sách "không gửi PII" trong guide OpenAI khó khớp với việc scheduled prompts đọc cả members và agents. FAQ còn nhắc "GPT-3".
11. **Không thấy nói gì về ngôn ngữ.** Hỗ trợ khách hàng có tiếng Pháp, Tây Ban Nha, Bồ Đào Nha. Không thấy cam kết chất lượng AI ngoài tiếng Anh; không nhắc tiếng Việt.
12. **Không làm:**
    - Quản lý hiệu suất hay đánh giá nhân sự bằng AI. Benchmark tự nói nên bỏ qua Tability nếu cần HRIS sâu.
    - AI cho CRM hay khách hàng (ngoài ví dụ churn agent).
    - Chọn model trong app.
    - Agent chạy trên hạ tầng của Tability.

---

## 7. Gợi ý mang sang bước kiến trúc OneHub (suy luận, ngắn)

Mục này chỉ là cầu nối cho các báo cáo sau, không phải đề xuất cuối.

- **Chép mẫu, không chép khối.** Sáu mẫu nên có ngay: proposal → review → commit nguyên khối; nhãn tác giả AI; chỉ đọc mặc định, xác nhận khi xoá; thừa kế quyền; tách nội dung khỏi giao nhận khi đặt lịch báo cáo; luật bằng chứng trong prompt. Cả sáu đều rẻ và khớp luật kho "trí khôn ở `apps/agent`".
- **Vai «chỉ OKR»** tương ứng với "AI thừa kế quyền" của Tability. Rủi ro của Copilot Studio (danh tính dùng chung) chính là rủi ro cho bot Slack hay Zalo nếu bot gọi dữ liệu bằng một tài khoản dịch vụ.
- **Ngân sách ~$20/tháng** đặt cạnh cơ chế credit của Tability: một vài tác vụ theo lịch (sync có AI hằng ngày) có thể ăn hết ngân sách. Nên có định mức theo thao tác và hiện hạn mức cho người dùng như Tability.
- **Chỗ OneHub có thể hơn:**
  - Kênh chat thật (Slack, Zalo) với danh tính từng người.
  - Chọn model theo tác vụ qua AI Gateway.
  - Knowledge nội bộ có kiểm soát quyền — thứ Tability không có trong app.
  - Agent chạy trong `apps/agent` thay vì đẩy ra host ngoài.
  - Tiếng Việt.

---

## 8. Câu hỏi mở (chưa kiểm được từ nguồn công khai)

1. AI-mode thực sự **ghi** được những gì ngoài KPI (tạo dashboard, plan)? Có xác nhận trước khi *tạo* không, hay chỉ trước khi *xoá*?
2. Người đọc thấy check-in "do Tabby viết" khác gì trên dashboard hay báo cáo? Có lọc hoặc loại chúng khỏi tính tiến độ không?
3. Nhóm "OKR Agent" ở gói Basic gồm những gì, khi Basic không có credit?
4. Có hỗ trợ AI-mode hay bot hỏi đáp trong Slack không (lời hứa 27/07/2026)?
5. Tập dữ liệu thực tế gửi OpenAI hiện nay có gồm tên người, mô tả KR, ghi chú plan không (danh sách trong guide có vẻ cũ)?
6. Chất lượng tiếng không phải tiếng Anh (tiếng Việt) của AI-mode và check-in do AI viết?
7. Gói Agentic (khi ra) có chạy agent trên hạ tầng Tability không, hay vẫn qua host ngoài? Đơn vị "AI credit" quy đổi ra token thế nào?
8. Có nhật ký kiểm toán riêng cho hành động do AI-mode hay MCP thực hiện không?

---

## Phụ lục A — Danh sách nguồn đã đọc

**Trang sản phẩm:**
- https://www.tability.io/ai
- https://www.tability.io/ai/ai-mode
- https://www.tability.io/ai/okr-assistant (trùng nội dung /features/ai/okr-agent)
- https://www.tability.io/ai/ai-agent-manager
- https://www.tability.io/ai/mcp-server
- https://www.tability.io/pricing
- https://www.tability.io/features
- https://www.tability.io/features/goal-setting
- https://www.tability.io/features/goal-tracking
- https://www.tability.io/features/reporting
- https://www.tability.io/features/strategy-map
- https://www.tability.io/features/initiatives
- https://www.tability.io/integrations
- https://www.tability.io/enterprise
- https://www.tability.io/compare/ai-features

**Hướng dẫn** (tiền tố `https://guides.tability.io/docs/become-a-tability-power-user/`):
- features/ai-features/{ai-mode, scheduled-prompts, coaching-ai, agent-workforce-manager, ai-metric-detection}
- features/plans/{goal-setting-ai, import-okrs-and-kpis-with-ai, plan-score}
- features/reporting/{retrospectives, workspace-insights, custom-dashboards}
- features/check-ins/{automate-check-ins, how-to-create-check-ins}
- features/outcomes-key-results/data-sources
- features/workspace-settings
- integrations/{openai, slack, microsoft-teams, confluence, tability-mcp-server, auto-sync-for-data-sources}
- how-tos/{how-to-use-tabilitys-ai-for-your-complete-okr-cycle, put-your-okrs-on-autopilot-with-tabilitys-ai-automation}

**Hướng dẫn khác:**
- https://guides.tability.io/docs/other/how-to-get-more-ai-credits
- https://guides.tability.io/docs/getting-started-with-tability/tability-frequently-asked-questions
- https://guides.tability.io/docs/llms.txt (mục lục)

**Pháp lý:**
- https://guides.tability.io/legals/artificial-intelligence-policy
- https://guides.tability.io/legals/subprocessors
- https://guides.tability.io/legals/trust-and-security

**MCP và skills:**
- https://mcp.tability.app/agent-setup/prompt.md
- https://github.com/tabilityio/tability-skills (README, INSTALL_PROMPT, 10 SKILL.md, docs/launch/blog-post.md)

**Changelog:** https://feedback.tability.io/changelog (các mục 17–27/08/2026)

**Blog:** https://blog.tability.io/
- tability-ai
- new-ai-powered-okr-coach
- tability-ai-gpt-4
- new-ai-features-auto-detect-metric-values-on-your-okrs
- chat-with-tabby-enhanced-ai-with-gpt-40
- automate-honest-reporting-with-tability
- march-update-ai-retros-faster-ux-and-spring-cleaning
- tability-2025-year-in-review
- jannounce-pricing-changes

**ODT:** https://www.tability.io/odt/articles/
- introducing-the-very-first-ai-agent-dedicated-to-okrs
- new-ai-mode-chat-to-your-okrs
- wake-up-to-what-matters-how-to-get-automated-daily-reports
- agents-status-reports
- agentic-okr-claude-rovo-tability-mcp
- turn-your-okrs-into-a-board-ready-deck-in-10-minutes
- tability-ai-features-explained
- claude-chatgpt-skills-tability
- codex-claude-ai-teams
- how-to-catch-problems-before-your-next-qbr
- guide-chief-of-staff-weekly-leadership-brief
- ai-90-day-plan-playbook

## Phụ lục B — Tệp thô

`docs/reports/2026-09-26-tro-ly-okr/raw/`
- `*.html` và `*.txt`: trang sản phẩm.
- `guides/*.md`: tài liệu GitBook.
- `skills/*`: kho skills.
- `blog/*`: blog và ODT.
- `changelog_all.txt`: changelog.
- `ai_policy.md`, `subprocessors.md`, `trust.md`: pháp lý.
- `mcp_setup_prompt.md`: setup prompt MCP.
