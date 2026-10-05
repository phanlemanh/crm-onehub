# Bộ xương Kara — thiết kế (K1 `bo-xuong-kara`)

Ngày 04/10/2026. Hồ sơ: `_acceptance/bo-xuong-kara/`. Phiên P6 của làn «lên trước 14/10».

## Vì sao

Bốn bề mặt Kara (Chat, Deal, Soạn OKR, Góp ý KR) dựng bằng bốn bộ ô soạn, bong bóng, trạng thái
khác nhau. Thư viện đã đủ — AI Elements, shadcn, ReUI và đồ riêng trong `packages/ui` — nhưng chưa
ai ghép chúng thành một bộ (đề xuất `de-xuat-kara.html` mục 01–03). Lượt này ghép sáu khối trong
`packages/ui`, không đổi màn nào. Các lượt K2 (Soạn OKR trang riêng), K3 (góp ý lượt 2), K4 (khung
bản ghi) và K5 (Chat + Deal) dựng màn trên sáu khối này sau 14/10.

Ba điều chủ kho chốt 04/10 cho K2 là thước của khung: Soạn OKR là **trang riêng có thanh kéo đổi
cỡ**; **khoá dòng chưa quyết** khi Kara đang soạn; **có nhận theo nhóm**. Khung không dựng trang
K2, nhưng mỗi điều phải có sẵn một điểm cắm để K2 không viết lại khối nào.

## Ranh giới

- Tệp mới chỉ nằm trong `packages/ui/src/components/kara/**` (gồm `kara/vi-du/**`), bài kiểm
  `packages/ui/test/bo-xuong-kara*.dom.tsx` và thước `_acceptance/bo-xuong-kara/rang/**`.
- Không chạm `apps/app/**` trước 14/10.
- Tệp chung chỉ **thêm**, và chỉ sau khi PR #231 (P4) gộp — điều phối xếp như vậy 04/10 13:05:
  `packages/ui/src/lib/messages.ts` (khoá `karaKhung`), `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`
  (`MIEN_TRU`), `_acceptance/nen-chat-ai-elements/so-lech-chuan.md`, `docs/chat-ui.md`.
  `docs/ai-ux.md` sửa được ngay.
- Ghim lại hồ sơ `nen-chat-ai-elements` (và mọi hồ sơ khác bị chạm) đi **cuối cùng**, một lượt ở
  đỉnh nhánh.

## Sáu khối

Import bằng `@crm/ui/components/kara/<tệp>`. Mọi chữ mặc định qua `messages.ts` (nhóm `karaKhung`);
tên «Kara» lấy từ `KARA.ten`. Không chú thích, không `className` đổi màu, góc hay khoảng cách của
một thành phần `@crm/ui`.

| Khối | Tệp | Ghép từ | Bậc thang `docs/design.md` | Điểm cắm |
|---|---|---|---|---|
| `KaraTranscript` | `transcript.tsx` | AI Elements `Conversation`, `ConversationContent`, `ConversationScrollButton`, `ConversationEmptyState`, `Message`, `MessageContent`, `MessageResponse`, `MessageActions`; shadcn `MessageAvatar` (ngoại lệ của `chat-ui.md`); `Marker` | 1 — đã có trong cây | `KaraTurn from="user|kara|system"`, `KaraCheckpoint` bấm được |
| `KaraComposer` | `composer.tsx` | AI Elements `PromptInput`, `PromptInputTextarea`, `PromptInputSubmit` (Dừng), `Suggestions`; `Badge`; `FieldDescription` | 1 | `context` (chip «về KR 1.3» gỡ được), `status`, `lockedReason` |
| `KaraSteps` | `steps.tsx` | AI Elements `task` (kéo bằng CLI lượt này); `StatusIndicator` | 3→1: kéo AI Elements về `packages/ui` rồi ghép | `steps[]` mang tên bước bằng tiếng người do màn gọi đưa |
| `KaraState` | `state.tsx` | `ThinkingIndicator`, `Empty`, `FieldDescription`, `Button` | 1 | `kind` = năm dòng bảng §7 `ai-ux.md`; `KaraRetry` — **một cỡ «Thử lại»** |
| `KaraProposal`, `KaraProposalGroup` | `proposal.tsx` | `ProposedChange`, `ProposedChangeReceipt`, `KaraLabel` (nền `nen-kara`) | 1 | tự khoá khi bận; nhóm đếm từ đề xuất còn chờ; nhận theo nhóm |
| `KaraArtifact` | `artifact.tsx` | AI Elements `artifact` (kéo bằng CLI lượt này); `KaraMark`; `ThinkingIndicator` | 3→1 | co giãn theo khung chứa, thân tự cuộn; `busy` phát trạng thái bận |
| `KaraBusy` | `busy.tsx` | React context | 5 — không bậc nào có | nguồn duy nhất của «Kara đang soạn» cho mọi khối bên trong |

Không kéo `tool`: bản AI Elements hiện đầu vào và đầu ra của công cụ dưới dạng JSON qua
`code-block`, mà `code-block` nằm trong mục «Not for this product» của `docs/chat-ui.md`, và người
dùng CRM không đọc JSON. `KaraSteps` dựng trên `task` với tên bước bằng tiếng người.

### Ba điểm cắm cho K2

1. **Trang riêng có thanh kéo.** `KaraArtifact` không có bề rộng cố định: gốc `h-full min-h-0
   min-w-0`, thân `flex-1 overflow-auto`. Đặt trong một ô co giãn (thanh kéo của K2, `resizable` của
   shadcn — K2 cài) thì bề rộng ăn theo ô, và thân tự cuộn bên trong, trang không cuộn. Cột hội thoại
   (`KaraTranscript` + `KaraComposer`) cũng vậy. Phòng mẫu đo ở hai bề rộng ô 360 và 1080.
2. **Khoá dòng chưa quyết khi Kara đang soạn.** `KaraBusy` là một context: `KaraArtifact busy` (hay
   K2 bọc cả trang bằng `KaraBusyProvider`) đặt `busy = { label }`. Mọi `KaraProposal` bên trong:
   - chưa quyết → truyền `lockedReason` cho `ProposedChange` («Kara đang soạn — xong sẽ quyết được»),
     mọi nút khoá, lý do trỏ bằng `aria-describedby` (cơ chế sẵn có của `ProposedChange`);
   - đã quyết → dòng biên nhận nằm trong `fieldset disabled`, nên «Hoàn tác» cũng khoá (dòng không
     được đổi dưới tay khi Kara đang viết vào bản nháp);
   - `KaraComposer` đọc cùng context: nút gửi thành «Dừng».
   Hết bận thì mọi thứ mở lại, không phải màn gọi tự làm gì.
3. **Nhận theo nhóm.** `KaraProposalGroup` nhận `entries: { id, status: "pending" | "decided",
   batchable }[]` cho các đề xuất trong nhóm:
   - nhãn «Kara · N đề xuất» gắn **một lần** ở đầu nhóm, N đếm từ `entries` còn chờ — không lưu
     riêng (§3, §6 `ai-ux.md`);
   - `batch = { label, onAccept(ids) }`: nút nhận cả nhóm mang chữ hậu quả của màn gọi («Thêm cả Mục
     tiêu và KR đã đủ số»), gọi `onAccept` đúng với các id còn chờ và `batchable`; khoá khi không còn id
     nào hay khi bận;
   - `batchDecided = { text, onUndo }`: một dòng biên nhận nhóm có «Hoàn tác» (§6).

### Luật trạng thái (`KaraState`, bảng §7 `ai-ux.md`)

| `kind` | Thành phần | Chữ |
|---|---|---|
| `working` | `ThinkingIndicator`, `role="status"`, chỉ hiện sau `delayMs` (mặc định 1000) | «Kara đang <động từ> <thứ>…» — màn gọi đưa `label` |
| `empty` | `Empty border="solid" size="compact"` | tiêu đề + một câu vì sao |
| `error` | `Empty border="solid" size="compact"` + `KaraRetry` | «Kara chưa <làm gì> được»; không gợi ý cho lập trình viên |
| `off` | `FieldDescription` (+ nút khoá của màn gọi) | nói khi nào mở lại |
| `unconfigured` | `Empty border="solid" size="compact"`, không Thử lại | «Kara chưa được bật ở đây» + ai bật được |

`KaraRetry` là nút «Thử lại» duy nhất: `Button variant="outline" size="sm"`, không icon — đúng mẫu
góp ý KR đang chạy, chủ kho chốt 04/10. Không `Spinner` trần, `Shimmer` trần hay `Alert`.

## Kéo AI Elements về (chủ kho chọn 04/10)

- `bunx --bun ai-elements@latest add artifact task` chạy ở thư mục tạm với `components.json` của kho
  (như lần kéo `confirmation`), rồi chép hai tệp vào `packages/ui/src/components/ai-elements/` — chạy
  thẳng trong `packages/ui` thì CLI dừng hỏi ghi đè `button`, `tooltip`, `collapsible`, `badge`.
- Lệch chuẩn, mỗi tệp một mục trong `so-lech-chuan.md`: icon Lucide → Carbon; chữ tiếng Anh («Close»)
  qua `messages.ts`; bỏ `shadow-sm` của `Artifact`; `size-8 p-0` trên `Button` → `size="icon-sm"`; bỏ
  chú thích.
- Cổng mồ côi: hai tệp chưa có màn nào trong `apps/**` dùng tới, nên thêm hai mục `MIEN_TRU` có tên,
  lý do «bộ xương Kara K1 — màn đầu tiên nối ở K2 `soan-okr-trang-rieng`» và hạn «K2 gộp». K2 nối màn
  thì xoá hai mục (cổng tự in «MIEN TRU THUA» nếu quên).
- `docs/chat-ui.md`: hai dòng mới trong bảng «What is in the tree today».

## Phòng mẫu tĩnh (chủ kho chọn 04/10)

`/proto` nằm trong `apps/app`, nên lượt này dựng một phòng mẫu ngoài app:

- `packages/ui/src/components/kara/vi-du/` giữ các ví dụ ghép sáu khối, mỗi trạng thái của bảng §3
  dưới đây là một ví dụ có id `ST-phongmau-…`. K2 dùng lại chúng cho design-pass.
- `_acceptance/bo-xuong-kara/rang/phong-mau.mjs` đóng gói ví dụ bằng `Bun.build`, biên dịch
  `globals.css` bằng `@tailwindcss/postcss` của kho, phục vụ trên một cổng tự do (mặc định 3360 khi
  chạy tay), mở `?state=<id>&theme=<light|dark>&pane=<rộng>`. Thử 04/10 ở scratchpad: đóng gói và
  biên dịch chạy được, ảnh chụp đúng màu và góc của kho.
- `_acceptance/bo-xuong-kara/rang/man.mjs` lái puppeteer qua mọi trạng thái × khổ × nền, chụp ảnh vào
  `_acceptance/bo-xuong-kara/evidence/`, đo trong trình duyệt thật.

Không cần CSDL hay máy chủ API, nên không đi qua `mot-luot.sh`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: người gõ trong `KaraComposer` → lượt của người hiện trong `KaraTranscript` → `KaraArtifact
  busy`, `KaraSteps` chạy, đề xuất chưa quyết khoá → Kara nộp: `KaraCheckpoint` «−1 MT · sửa 1» hiện
  trong hội thoại, đề xuất mới chờ trong `KaraProposalGroup` → người nhận từng dòng hoặc cả nhóm → dòng
  biên nhận có «Hoàn tác» (điểm ra: nút chính ở chân `KaraArtifact` do màn gọi đưa).
- Biên: hội thoại rỗng (`ConversationEmptyState` mang dấu Kara); nhóm không còn đề xuất chờ (nút nhận cả
  nhóm khoá, nhãn ghi «0»); hết lượt hay Kara bị tắt (`KaraState off`, ô soạn khoá kèm lý do).
- Lỗi & quay lại: lượt hỏng → `KaraState error` «Kara chưa soạn được» + «Thử lại»; chưa cấu hình →
  `KaraState unconfigured`, không có nút trừ lượt; bước công cụ hỏng → `KaraSteps` đánh dấu bước đó, mở
  sẵn danh sách.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Phòng mẫu (tĩnh, ngoài app) | cho người và thước xem sáu khối qua mọi trạng thái | mở bằng `?state=` / không ra đâu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-phongmau-hoi-thoai | Phòng mẫu | Hai cột: hội thoại 380px (lượt người, lượt Kara có dấu tia sáng, dòng hệ thống «Bạn đã thêm KR 1.2 · bỏ qua MT 2», mốc «Kara sửa bản nháp: −1 MT · sửa 1», bước đã xong gập lại, ô soạn có chip «về KR 1.3» và hai gợi ý) · bản nháp phần còn lại | gõ, bấm gợi ý, bấm mốc, gỡ chip |
| ST-phongmau-hoi-thoai-rong | Phòng mẫu | Hội thoại rỗng: dấu Kara + một câu mời | gõ câu đầu |
| ST-phongmau-dang-soan | Phòng mẫu | Đầu bản nháp «Kara đang soạn bản nháp…», bước đang chạy mở sẵn, mọi đề xuất chờ khoá kèm lý do, «Hoàn tác» khoá, ô soạn thành «Dừng» | chờ hoặc Dừng |
| ST-phongmau-ban-nhap | Phòng mẫu | Bản nháp: nhãn «Kara · 3 đề xuất» một lần, ba đề xuất inline chờ, một dòng biên nhận có Hoàn tác, nút «Thêm cả Mục tiêu và KR đã đủ số», chân có nút chính | nhận từng dòng, nhận cả nhóm |
| ST-phongmau-nhan-nhom | Phòng mẫu | Sau khi nhận cả nhóm: dòng biên nhận nhóm «Đã thêm 2 dòng theo Kara» + Hoàn tác; nhãn đếm còn 1 | Hoàn tác |
| ST-phongmau-buoc-loi | Phòng mẫu | Danh sách bước mở, bước lỗi đánh dấu, câu tiếng người | đọc, Thử lại |
| ST-phongmau-loi | Phòng mẫu | «Kara chưa soạn được» + «Thử lại» (outline sm) | Thử lại |
| ST-phongmau-rong | Phòng mẫu | «Kara không thấy chỗ nào cần sửa» + vì sao | không |
| ST-phongmau-tat | Phòng mẫu | Ô soạn khoá + «Hết lượt quý này — mở lại ngày 01/01» | chờ |
| ST-phongmau-chua-cau-hinh | Phòng mẫu | «Kara chưa được bật ở đây» + ai bật được, không Thử lại | báo quản trị |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- `KaraState working` không hiện gì trong 1 giây đầu (§7), sau đó `role="status"` đọc chữ «Kara đang…».
- Enter gửi, Shift+Enter xuống dòng (hành vi sẵn có của `PromptInput`); khi bận nút gửi là «Dừng».
- Chip ngữ cảnh có nút gỡ có tên («Bỏ ngữ cảnh về KR 1.3»), gỡ xong focus về ô soạn.
- Khoá khi bận: `KaraProposal` đặt `disabled` cho mọi nút hành động và truyền `lockedReason`, nên nút mang
  thuộc tính `disabled` thật (cơ chế sẵn có của `ProposedChange`, nút khoá ra khỏi thứ tự Tab) và
  `aria-describedby` trỏ lý do; lý do là chữ nhìn thấy ngay trên dòng. Dòng biên nhận khoá bằng `fieldset disabled`.
- Khổ: phòng mẫu đo 1440, 768, 375; ô bản nháp đo ở bề rộng 360 và 1080; không tràn ngang. Dưới 768px
  phòng mẫu xếp hội thoại trên bản nháp, mỗi vùng rộng bằng khung — đây là bố cục của phòng mẫu để đo khối,
  không phải bố cục điện thoại của Soạn OKR (K2 quyết, hai tab).
- `KaraState working` và đầu `KaraArtifact busy` hiện chữ bận sau trễ; thước chụp chờ chữ ấy hiện rồi mới chụp.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| AI Elements conversation, message, prompt-input, suggestion | dùng | đã trong cây, `chat-ui.md` Rule 3 |
| AI Elements artifact, task | ghép (kéo bằng CLI) | Adopted trong sổ đăng ký, chủ kho chọn kéo ngay |
| ProposedChange, KaraMark, KaraLabel, ThinkingIndicator, Empty | dùng | nền `nen-kara`, `ai-ux.md` §5–7 |
| KaraBusy | tạo | không thư viện nào có một nguồn «Kara đang soạn» chung cho nhiều khối |
| Sáu khối Kara | ghép | đúng đề xuất mục 03 |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: (ii) không tra thêm — đề xuất 04/10 đã đối chiếu ChatGPT Canvas, Claude Artifacts, Copilot Pages,
Gemini trong Docs, Tability (`tham-chieu-chat-ket-qua.md`, mỗi khẳng định có URL): hội thoại hẹp cạnh vật
phẩm rộng; chủ kho đã chốt bố cục ấy cho K2.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- Bài DOM `packages/ui/test/bo-xuong-kara.dom.tsx`, mỗi khối một nhóm `-t`, ma trận viết trước, chiều đỏ
  ghim trên cùng fixture.
- Bài hai tiếng vi/en như `nen-kara` E9; khoá mới ghim trong `messages-guard.spec.ts`.
- Phòng mẫu: ảnh và số đo trình duyệt thật (`man.mjs`).
- Thước tài liệu, cổng mồ côi, sàn thiết kế tĩnh, thước ranh giới (không chạm `apps/app`, tệp chung chỉ
  thêm).

## Không làm

- Nối bất kỳ màn nào trong `apps/app` (K2–K5, sau 14/10).
- Đổi tên Kara trên các màn, tab bản ghi, Tài liệu (phần `apps/app` của `tu-vung-tac-tu` — K6a và K4).
- `tool`, `attachments`, `sources`, `checkpoint` của AI Elements; thanh kéo `resizable` (K2 cài).
- Bố cục hai tab trên điện thoại cho Soạn OKR (K2).
