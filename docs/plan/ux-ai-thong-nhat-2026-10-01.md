# Một ngôn ngữ AI cho cả kho — khảo sát 01/10/2026

Viết 2026-10-01, theo yêu cầu của chủ kho: «khảo sát lại UX/UI của AI trong toàn
kho như cách Google làm với Gemini hay Claude, ChatGPT, để mỗi lần làm không mỗi
khác». Khởi điểm là thẻ góp ý của Trợ lý OKR trong hộp Sửa mục tiêu (nhiều viền,
chỉ dẫn không rõ, thiếu ngữ cảnh KR), nhưng câu hỏi thật là cả kho.

Bản này là khảo sát và đề xuất. Chưa có gì được quyết. Năm câu ở mục 7 là của
chủ kho.

Bản mẫu đi kèm: `/proto/gop-y-dung-cho` (nhánh `proto/gop-y-dung-cho`).

## 1. Kho đang có 12 bề mặt AI

Kiểm kê trên `origin/onehub` tại `e5c369cc`. Đường dẫn tính từ `apps/app`.

| # | Bề mặt | AI làm gì | Tên trên màn | Ghi | Hoàn tác |
| --- | --- | --- | --- | --- | --- |
| 1 | Tab Agent của khung hồ sơ — `components/crm/agent-panel.tsx` | Trả lời; công cụ ghi thẳng (`record_fact`, `set_field_value`) | «Agent» / «Tác nhân» | Ngay, không hỏi | Không |
| 2 | Bộ dựng tác nhân — `components/agent-builder/*` | Trò chuyện, dựng tác nhân | «Bộ dựng tác nhân», «Tác nhân» | Qua thẻ duyệt tự dựng | Không |
| 3 | Tác nhân của đội — `/agents` | Danh sách lượt chạy | «Tác nhân của đội» | — | — |
| 4 | Cột góp ý OKR — `okr/cot-gop-y.tsx`, `the-gop-y.tsx` | Đề xuất viết lại, hỏi, căn chỉnh | «Trợ lý OKR» | Ngay khi Nhận | Chỉ thẻ viết lại (`cot-gop-y.tsx:304`) |
| 5 | Tóm tắt tuần — `okr/khoi-tom-tat.tsx` | Tóm tắt, trích dẫn | «Tóm tắt tuần của Trợ lý OKR» | Chỉ đọc | — |
| 6 | Tóm tắt cho quản trị — `okr/toan-canh/suc-khoe/tom-tat-quan-tri.tsx` | Xem câu giữ, câu bỏ | không gọi tên | Chỉ đọc | — |
| 7 | Cài đặt Trợ lý OKR — `settings/okr/*` | Bật tắt, số đo, chi phí | «Trợ lý OKR», «Máy góp ý», «Máy tóm tắt» | — | — |
| 8 | Thông tin đề xuất của liên hệ — `components/crm/facts.tsx` | Đề xuất giá trị trường | **không tên, không icon** | Ngay khi Nhận | Không |
| 9 | Tra cứu, làm giàu — `components/crm/enrichment-*.tsx` | Nghiên cứu, ghi dòng thời gian | «Tác nhân đang tra cứu» | Tự động | Không |
| 10 | Bản máy soạn của Tài liệu — `tai-lieu/*` | Soạn trang từ tệp nguồn | «Máy soạn» | Qua bước duyệt, có phiên bản | Không |
| 11 | Đợt hỏi ý — `okr/hoi-y/*` | Không có AI; «Máy chỉ đính bằng chứng» là số đếm | «Máy» | — | — |
| 12 | Bot Zalo — `settings/connections/zalo/*` | Gửi nhắc, gửi tóm tắt | «bot», «Bot của xưởng» | — | — |

## 2. Chín chỗ lệch

1. **Tên.** Cùng một thứ có bảy tên: «Agent», «Tác nhân», «Trợ lý OKR», «Máy»,
   «Máy soạn», «Trợ lý AI» (sổ chi phí), «bot». Thẻ thông tin đề xuất không có tên.
2. **Tiếng.** Tab Agent viết cứng tiếng Anh («Still working on the last
   question…», «This conversation has ended.» — `agent-panel.tsx:269-280`;
   «Recorded what it found» — `lib/agent-transcript.ts:61`). Bộ dựng thì đã dịch.
3. **Dấu nhận diện.** Thanh điều hướng dùng `icons/bot` tự vẽ, danh sách tác nhân
   dùng `Bot` của Carbon, tab Agent dùng logo hãng làm ảnh đại diện, tra cứu dùng
   `MagicWand`, Trợ lý OKR và thẻ thông tin không có dấu gì.
4. **Đang chờ.** Bộ dựng dùng `ThinkingIndicator` («Đang nghĩ»); Reasoning ghi
   «Đang suy nghĩ…»; tab Agent dùng `Spinner` trần; cột OKR và tóm tắt dùng
   `Shimmer` với câu riêng; Tài liệu dùng một `Alert` đứng yên.
5. **Mô hình duyệt.** OKR và thông tin: bấm là ghi. Tài liệu: duyệt từng con số
   rồi mới ghi. Tab Agent và tra cứu: ghi không hỏi. Chữ nút: «Nhận/Bác» ở chỗ
   này, «Duyệt/Trả lại» ở chỗ kia.
6. **Hoàn tác và vết.** «Hoàn tác» chỉ có ở thẻ viết lại OKR; thẻ căn chỉnh cùng
   cột thì không (`cot-gop-y.tsx:309`). Vết «theo đề xuất của Trợ lý OKR» chỉ có ở
   OKR. Thông tin liên hệ có gạch chân chấm chỉ nguồn nhưng không có hoàn tác.
7. **Vỏ.** `ProposedChange` là một `Alert` có viền (qua `Confirmation`); thẻ của
   bộ dựng là `div rounded-lg border` tự dựng; tóm tắt là `Card`; lỗi tab Agent là
   chữ đỏ kèm gợi ý cho lập trình viên («Start it with `bun run dev`»).
8. **Trích dẫn và phản hồi.** Tóm tắt dùng `InlineCitation`; bản quản trị dùng chữ
   «Nguồn:» trần; tab Agent dùng chip `Attachment`. Phản hồi: tóm tắt có
   «Hữu ích / Không hữu ích», bộ dựng có hai nút ngón tay, tab Agent không có gì.
9. **Lệch với `docs/chat-ui.md`.** Luật 3 chỉ định `ThinkingIndicator`,
   `Conversation`, `ConversationEmptyState`, `Suggestions`, `MessageActions`,
   `PromptInput`; tab Agent và bộ dựng chưa dùng phần lớn. Bong bóng
   `rounded-md bg-muted` mà tài liệu gọi tên là thứ phải gỡ vẫn còn
   (`agent-builder-chat.tsx:869`).

Gốc chung: `docs/chat-ui.md` quy định **hội thoại**, nhưng sáu trên mười hai bề
mặt không phải hội thoại — chúng là AI đặt ngay trong màn làm việc (góp ý, tóm
tắt, thông tin đề xuất, tra cứu, bản máy soạn). Phần đó chưa có luật nào, nên mỗi
lượt tự nghĩ ra một kiểu.

## 3. Các hệ thiết kế lớn chuẩn hoá điều gì

| Chuẩn hoá | Ai nói | Nội dung |
| --- | --- | --- |
| Một dấu cho «đây là AI» | Carbon, Cloudscape, Gemini | Một icon duy nhất cho AI; dấu tác nhân (avatar) tách khỏi dấu «nội dung do AI» |
| Nhãn trên nội dung AI | Carbon (bắt buộc), Cloudscape | Nhãn đặt cạnh đầu ra; một nhóm gắn một lần ở đầu nhóm; nhãn mở ô «vì sao», không bao giờ là nút gọi AI |
| Màu AI chỉ cho AI | Carbon, Atlassian | Không dùng màu thương hiệu để trang trí AI; không tô nút AI |
| Một tên, một giọng | Salesforce, Atlassian | Một tên, một avatar khắp nơi; ngôi thứ nhất, câu trả lời trước, không «Tuyệt vời!» |
| AI ở chỗ làm việc | Atlassian, Gemini, HAX G3 | «Lồng vào, không tách ra»; tối đa một nút AI chính mỗi trang |
| Trạng thái chờ hai pha | Cloudscape | «Đang xử lý» rồi «Đang soạn …»; luôn có chữ cạnh vòng quay; dưới 1 giây thì không hiện |
| Một câu miễn trừ cố định | Salesforce, Gemini, HAX G2 | Một câu, một chỗ, cùng chữ |
| Xem trước khi ghi | Gemini, HAX G8–G9, Tiptap | Chèn / Thay / Chỉnh / Bỏ trước khi ghi; nút gọi đúng hậu quả |
| Mức duyệt theo loại việc | Claude (connector), HAX G16 | Luôn cho phép / Cần duyệt / Chặn, theo từng công cụ |
| Dấu nguồn sống sau khi nhận | Carbon | Giá trị AI giữ dấu tới khi người sửa; khi đó dấu thành «Sửa rồi · Trả về bản AI» |
| Phản hồi có tác dụng thấy được | Gemini, PAIR, HAX G15 | Ngón tay lên/xuống, lời cảm ơn nói điều gì sẽ đổi |

Nguồn: carbondesignsystem.com/guidelines/carbon-for-ai,
carbondesignsystem.com/components/ai-label/usage,
cloudscape.design/gen-ai/patterns/generative-ai-output-label,
cloudscape.design/gen-ai/patterns/generative-ai-loading-states,
atlassian.design/rovo-ui/ai-interaction-guidelines,
atlassian.design/rovo-ui/voice-and-tone, pair.withgoogle.com/chapter/explainability-trust,
microsoft.com/en-us/haxtoolkit/ai-guidelines, salesforce.com/blog/ai-agent-design-tips,
support.claude.com/en/articles/11176164,
tiptap.dev/docs/content-ai/capabilities/ai-toolkit/advanced-guides/suggestions.

## 4. Đề xuất: mười luật AI của kho

Đặt thành `docs/ai-ux.md`, nằm cạnh `docs/chat-ui.md` (chat-ui giữ phần hội thoại,
ai-ux giữ mọi chỗ AI khác và phần chung). Mỗi luật có một thành phần trong
`packages/ui` giữ nó, để luật được giữ bằng mã chứ không bằng trí nhớ.

1. **Hai tên, không hơn.** «Trợ lý» là AI dựng sẵn làm việc cùng người dùng, kèm
   phạm vi khi cần («Trợ lý OKR», «Trợ lý hồ sơ», «Trợ lý tài liệu»). «Tác nhân» là
   thứ đội tự dựng ở `/agents`. Bỏ «Agent», «Máy», «Máy soạn», «bot», «Trợ lý AI»
   trên màn. Ghi hai mục vào `CONTEXT.md`.
2. **Một dấu AI.** Một icon Carbon (`AiGenerate` hoặc `AiLabel` — chủ kho chọn) cho
   mọi nội dung và mọi lối gọi của Trợ lý. `Bot` chỉ cho Tác nhân. Không màu riêng,
   không tô xanh: dấu là chữ xám cạnh icon.
3. **Nhãn nguồn gắn một lần mỗi nhóm.** Một thành phần `AiLabel` («Trợ lý OKR ·
   2 góp ý»), bấm mở ô «vì sao» (dựa trên gì, khi nào). Nội dung đã nhận vẫn giữ dấu
   nhỏ cho tới khi người sửa.
4. **Ba mức hành động, theo hậu quả.** Đọc → chạy luôn. Ghi vào bản ghi →
   **đề xuất**, người nhận. Gửi ra ngoài hay không hoàn tác được → **xác nhận**.
   Tab Agent ghi thẳng bằng `record_fact` là lệch luật này; lượt `tac-tu-xin-duyet`
   (T3) đã nằm trong lộ trình để sửa đúng chỗ đó.
5. **Một thành phần đề xuất, hai độ dày.** `ProposedChange` có `density="inline"`
   (không viền, đặt ngay dưới thứ nó sửa — dùng trong bảng, dưới ô nhập, trên dòng
   KR) và `density="card"` (trong cột hay trong hội thoại). Thân dùng `Item` mặc
   định của shadcn (không viền), không dùng `Alert`.
6. **Nút gọi đúng hậu quả.** «Đổi tên KR», «Thay câu», «Thêm KR đối trọng», «Bỏ qua»
   thay cho «Nhận / Bác» trần. Một nút tô màu mỗi đề xuất.
7. **Nhận xong là biên nhận, luôn hoàn tác được.** Thẻ thu thành một dòng «Đã đổi
   tên theo Trợ lý OKR · Hoàn tác», ngay tại chỗ; toast chỉ là phụ. Vết ghi ở mọi
   chỗ AI ghi, không chỉ OKR.
8. **Một bộ trạng thái.** `ThinkingIndicator` cho mọi lúc chờ, chữ theo khuôn
   «Trợ lý … đang <động từ> <thứ>…». Lỗi theo khuôn «Trợ lý chưa <làm gì> được —
   <làm gì tiếp>» kèm «Thử lại»; không gợi ý dành cho lập trình viên trên màn.
9. **Một kiểu trích dẫn, một kiểu phản hồi.** `InlineCitation` ở mọi chỗ AI dẫn
   nguồn (cả bản quản trị và tab Agent). Phản hồi «Hữu ích / Không hữu ích» của
   tóm tắt tuần thành thành phần chung, gắn ở mọi đầu ra dạng văn.
10. **Tiếng Việt, một giọng.** Mọi chữ qua `lib/messages`; ngôi thứ nhất của Trợ lý
    chỉ trong hội thoại; ngoài hội thoại, câu tả việc («Trợ lý OKR thấy …»).
    `messages-guard` cấm chữ cứng trong tệp giao diện AI.

## 5. Áp vào Trợ lý OKR: A và B

### So sánh thành phần

| Nguồn | Thành phần | Vỏ | Chỉ vào đích | Hợp |
| --- | --- | --- | --- | --- |
| AI Elements | `Confirmation` (nền của `ProposedChange` hôm nay) | `Alert` có viền | Không | Cổng duyệt công cụ trong chat; **không hợp B** |
| AI Elements | `InlineCitation` | Chip nhỏ trong dòng chữ, chi tiết mở khi bấm | Có | Mẫu để chỉ đúng chỗ (B), và nguồn cho luật 9 |
| AI Elements | `Queue` | Dòng không viền, đếm ở tiêu đề mục | — | Danh sách «cần xem» nếu sau này cần |
| shadcn | `Item` mặc định | **Không viền** | Đặt ngay dưới đích | **Thân của B** |
| shadcn | `Badge` outline | Viền nhỏ | — | Đang dùng cho A; viền thừa |
| ReUI | `c-code-block-22` | Khối diff, chân ghi «Agent proposed this change» + Từ chối/Nhận | Có (từng dòng) | Ý hay: ghi nguồn ở chân; quá nặng cho một tên KR |
| ReUI | `ai-chat-8` | Kế hoạch dạng câu, tên đích gạch chân, «Not now / Approve» và một dòng gợi «Need another option? Just ask.» | Có (gạch chân tên) | Ý hay cho thẻ câu hỏi: một câu dẫn tiếp rõ |
| ReUI | `solution-agents-5` | Hộp duyệt toàn trang | — | Quá nặng |
| assistant-ui | Recommendation card | Thẻ; **thu thành một dòng biên nhận** khi nhận | — | Lấy hành vi biên nhận (luật 7) |
| assistant-ui | Agent status | Viên trạng thái trong liên kết | — | Ý cho A |
| Sản phẩm thật (Mobbin) | Rox, Ditto, Grammarly | **Đếm bằng chữ xám** trong dòng, không viên tô | — | **A** |
| Sản phẩm thật | Langdock, Google Docs, GitHub suggested changes | Diff gạch/chèn **ngay tại chỗ**, ✓/✕ cạnh đó | Có | **B** |
| Sản phẩm thật | Confluence, Asana | Nút gọi đúng hậu quả («Replace», «Insert below»); hỏi lại khi ghi đè chữ người viết | — | Luật 6 |

### Chọn

- **A — trên thẻ Mục tiêu:** dấu AI + chữ xám «2 góp ý» trong `CardAction`, là liên
  kết mở khung chi tiết ở tab KR; không viền, không tô. Không hiện gì khi không có
  góp ý chờ. Về sau: bộ lọc «Có góp ý chờ» trên trang theo đơn vị (URL state).
- **B — trong khung chi tiết:**
  - Đầu tab KR một dòng `AiLabel` «Trợ lý OKR · 2 góp ý · vì sao?».
  - Góp ý về một KR là một dòng con `inline` ngay dưới dòng KR đó: «~~Đạt số giao
    dịch~~ → Số giao dịch đạt 1000 giao dịch», lý do một dòng xám, nút «Đổi tên KR»
    (tô), «Sửa», «Bỏ qua». Không viền thêm trong bảng.
  - Câu hỏi về cả bộ KR thay cảnh báo cố định «thiếu đối trọng» đang có trong
    `bang-kr.tsx` (`CanhBaoDoiTrong`) — hôm nay hai thứ nói cùng một điều.
  - Nhận xong: dòng biên nhận tại chỗ có «Hoàn tác».
- **Hộp Sửa:** chỉ còn một dòng dẫn «2 góp ý của Trợ lý OKR · Xem ở Mục tiêu».

## 6. Lộ trình đề xuất

| Lượt | Cỡ | Làm gì |
| --- | --- | --- |
| 0 | T1 | Chủ kho quyết mục 7; viết `docs/ai-ux.md` và hai mục `CONTEXT.md` |
| 1 | T2 | Nền trong `packages/ui`: dấu AI, `AiLabel`, `ProposedChange density`, biên nhận có hoàn tác, phản hồi chung |
| 2 | T2 | `gop-y-dung-cho`: A + B cho Trợ lý OKR trên nền lượt 1 |
| 3 | T2 | `tu-vung-tac-tu` (đã có trong lộ trình): tên, tiếng Việt, `ThinkingIndicator` cho tab Agent và bộ dựng; thẻ thông tin có tên và hoàn tác |
| 4 | T3 | `tac-tu-xin-duyet` (đã có trong lộ trình): tab Agent đề xuất thay vì ghi thẳng |

Lượt 1 phải đi trước lượt 2, nếu không A và B lại dựng thêm một kiểu riêng — đúng
cái khảo sát này muốn chặn.

## 7. Đã quyết — 2026-10-01 (Manh Phan)

1. **Một tên duy nhất: Kara** — thay mọi tên AI trên màn. «Tác nhân» vẫn là vật
   đội dựng ra, Kara chạy nó (chủ kho xác nhận 2026-10-02).
2. **Dấu tia sáng** — `AiGenerate` của Carbon.
3. **Áp luật «ghi vào bản ghi = đề xuất»** cho cả tab bản ghi — lượt
   `tac-tu-xin-duyet` (T3) vào lộ trình.
4. **Biên nhận tại chỗ** là chỗ hoàn tác chính.
5. **Lộ trình theo mục 6**, lượt nền tách trước.

Luật đã chốt sống ở `docs/ai-ux.md`; mục 4 dưới đây là bản đề xuất gốc.

## Năm câu đã hỏi

1. Hai tên «Trợ lý» và «Tác nhân» như luật 1 — hay một tên duy nhất?
2. Dấu AI: `AiGenerate` (tia sáng) hay `AiLabel` (chữ «AI» trong khung)?
3. Luật 4: chấp nhận «ghi vào bản ghi = đề xuất» cho cả tab Agent (kéo theo lượt T3)?
4. Luật 7: biên nhận tại chỗ thay cho toast làm chỗ hoàn tác chính?
5. Thứ tự lộ trình mục 6, và lượt 1 có tách khỏi lượt 2 không?
