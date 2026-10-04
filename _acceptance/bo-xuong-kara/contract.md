---
schema_version: 1
feature: "Bộ xương Kara trong packages/ui — sáu khối KaraTranscript, KaraComposer, KaraSteps, KaraState, KaraProposal, KaraArtifact, một nút «Thử lại», và ba điểm cắm cho K2: co giãn trong thanh kéo, khoá đề xuất khi Kara đang soạn, nhận theo nhóm"
slug: bo-xuong-kara
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-04
design_doc: docs/superpowers/specs/2026-10-04-bo-xuong-kara-design.md
---

# Acceptance Contract: bo-xuong-kara

## Context

Hàng K1 của lộ trình OKR. Chủ kho chốt 04/10: lượt Kara đi 0 → 1 → 2 → 3; khung Kara chạy song song
làn R1 và tới 14/10 chỉ chạm `packages/ui`; K2 (Soạn OKR) là trang riêng có thanh kéo đổi cỡ, khoá dòng
chưa quyết khi Kara đang soạn, có nhận theo nhóm. Ba câu chốt ở S1 cùng ngày: dựng phòng mẫu tĩnh ngoài
app để duyệt và đo; kéo AI Elements về và miễn trừ cổng mồ côi tới K2; nút «Thử lại» là outline sm,
không icon. Điều phối (Nhật ký 13:05) xếp mọi chỗ chạm tệp chung sau khi PR #231 gộp.

Source input: `opportunity.md` · `de-xuat-kara.html` mục 03–05 · `docs/ai-ux.md` §3–7 · `docs/chat-ui.md` Rule 1–3 · `docs/design.md` «Vẽ tay là bậc cuối»

## Criteria

- AC-1: Given `KaraTranscript` với một lượt người, một lượt Kara, một dòng hệ thống và một `KaraCheckpoint`, When dựng, Then lượt người và lượt Kara là `Message` của AI Elements với vai tương ứng, lượt Kara có ảnh đại diện là dấu tia sáng kèm tên «Kara» cho trình đọc màn hình và không có ảnh hay logo nào khác, dòng hệ thống là một dòng chữ phụ không có bong bóng, mốc là một nút và bấm gọi `onSelect` đúng một lần; hội thoại không có lượt nào thì hiện trạng thái rỗng mang dấu Kara.
- AC-2: Given `KaraComposer`, When người gõ rồi gửi, khi đang bận, khi có chip ngữ cảnh, gợi ý, và khi bị khoá kèm lý do, Then gửi gọi `onSubmit` một lần với chữ đã cắt khoảng trắng; khi bận (theo `status` hoặc theo `KaraBusy`) nút gửi tên «Dừng» và bấm gọi `onStop` chứ không gọi `onSubmit`; chip hiện nhãn và nút gỡ có tên, bấm gỡ gọi `onRemoveContext` rồi focus về ô soạn; bấm gợi ý gọi `onSuggestion` với đúng chữ gợi ý; khoá thì ô soạn và nút gửi đều khoá, lý do nằm trong `FieldDescription` được ô soạn trỏ tới bằng `aria-describedby`.
- AC-3: Given `KaraSteps` với các bước mang tên do màn gọi đưa, When mọi bước đã xong, có một bước đang chạy, hoặc có một bước lỗi, Then đầu danh sách ghi «Kara đã làm N bước» và danh sách gập lại khi mọi bước xong; ghi «Kara đang <tên bước đang chạy>» và mở sẵn khi có bước đang chạy; bước lỗi mở sẵn và mang dấu lỗi; mỗi bước hiện đúng chữ màn gọi đưa và không có khối mã hay JSON nào; thân dựng trên `Task` của AI Elements.
- AC-4: Given `KaraState` ở năm `kind` (working, empty, error, off, unconfigured), When dựng, Then mỗi kind dùng đúng thành phần của bảng §7 `docs/ai-ux.md`; working không hiện gì trước `delayMs` (mặc định 1000) và sau đó hiện `ThinkingIndicator` trong `role="status"` với chữ màn gọi đưa; error hiện «Kara chưa <việc> được» và đúng một nút «Thử lại» gọi `onRetry`; unconfigured không có nút «Thử lại»; không kind nào dựng `Spinner`, `Alert` hay `Shimmer` đứng một mình.
- AC-5: Given mọi nút «Thử lại» của sáu khối, When dựng, Then chúng là một thành phần `KaraRetry` duy nhất, `Button` biến thể `outline` cỡ `sm`, không có icon; trong phòng mẫu nút cao 28px.
- AC-6: Given các `KaraProposal` chưa quyết và đã quyết nằm trong một `KaraBusy` đang bận, When dựng, rồi hết bận, Then khi bận mọi nút của đề xuất chưa quyết khoá và trỏ `aria-describedby` tới lý do «Kara đang soạn», nút «Hoàn tác» của dòng đã quyết cũng khoá; hết bận thì mọi nút mở lại mà màn gọi không phải làm gì; đề xuất nằm ngoài `KaraBusy` không bị khoá.
- AC-7: Given `KaraProposalGroup` với `entries` có cả đề xuất chờ lẫn đã quyết, một vài chờ mang `batchable`, When dựng, bấm nút nhận cả nhóm, rồi dựng với `batchDecided`, Then nhãn Kara xuất hiện đúng một lần ở đầu nhóm với số bằng số `entries` còn chờ (đổi `entries` thì số đổi theo), các đề xuất trong nhóm không mang nhãn riêng; nút nhận cả nhóm mang đúng chữ màn gọi đưa, bấm gọi `onAccept` một lần với đúng danh sách id chờ và `batchable`, và khoá khi danh sách ấy rỗng hoặc khi bận; `batchDecided` hiện một dòng biên nhận `role="status"` có «Hoàn tác» gọi `onUndo` một lần.
- AC-8: Given `KaraArtifact` có tiêu đề, dòng phụ, hành động phụ, thân và chân, When dựng thường và với `busy`, Then dấu Kara cùng dòng phụ xuất hiện một lần ở đầu, thân là vùng cuộn riêng, chân nằm dưới thân; với `busy` đầu khung hiện `ThinkingIndicator` mang chữ bận và mọi `KaraProposal` bên trong bị khoá như AC-6; thân dựng trên `Artifact` của AI Elements.
- AC-9: Given sáu khối dựng cùng props trong `LocaleProvider` tiếng Việt và tiếng Anh, When gom các chữ do khối tự đặt (không đến từ props), Then mỗi chữ đổi theo tiếng, trừ tên «Kara»; số chỗ chữ của từng khối khớp số ghi trước; khoá mới trong `messages.ts` được ghim trong bài gác messages.
- AC-10: Given kho sau lượt, When xem `packages/ui/src/components/ai-elements/`, sổ lệch chuẩn và cổng mồ côi, Then `artifact.tsx` và `task.tsx` có mặt, không còn chú thích, icon Lucide hay chữ tiếng Anh viết cứng; `tool.tsx` và `code-block.tsx` không có mặt; `so-lech-chuan.md` có một mục cho mỗi tệp mới; cổng mồ côi xanh với đúng hai mục miễn trừ có tên cho hai tệp ấy, lý do nêu K1 và hạn nêu K2.
- AC-11: Given phòng mẫu tĩnh dựng từ cây này, When mở từng trạng thái của bảng trạng thái trong design doc ở khổ 1440, 768 và 375, nền sáng và tối, Then trang không tràn ngang, và ở khổ 375 hội thoại và bản nháp mỗi vùng không rộng hơn khung và không chồng nhau; ở bề rộng ô 360 và 1080 `KaraArtifact` rộng bằng ô, lăn chuột trên thân thì thân cuộn còn trang không cuộn; ở trạng thái đang soạn đầu bản nháp có chữ «Kara đang soạn…» trước khi ảnh được chụp, mọi nút chính của đề xuất chờ khoá và ô soạn có nút «Dừng»; bấm nhận cả nhóm rồi «Hoàn tác» đưa nhóm về như trước; nút «Thử lại» cao 28px.
- AC-12: Given ảnh phòng mẫu của trạng thái hội thoại, bản nháp và đang soạn ở 1440 và 375, When một người không làm lượt này đọc, Then họ phân biệt ngay đâu là hội thoại, đâu là bản nháp, thấy nút chính của mỗi đề xuất, và hiểu vì sao các nút đang khoá khi Kara soạn. (judgment)
- AC-13: Given `docs/ai-ux.md` và `docs/chat-ui.md` sau lượt, và các tệp `.tsx` mới, When đọc và chạy sàn thiết kế tĩnh, Then bảng mục 10 của `ai-ux.md` có hàng cho sáu khối với tên thành phần và `KaraRetry` cho hàng «Lỗi» của §7; hàng `tu-vung-tac-tu` ở bảng lộ trình ghi phần `packages/ui` đã gộp vào `bo-xuong-kara`; bảng «What is in the tree today» của `chat-ui.md` có hàng `artifact.tsx` và `task.tsx`; sàn thiết kế tĩnh trên mọi `.tsx` mới cho 0 lỗi nền P0.
- AC-14: Given diff của nhánh so với điểm rẽ khỏi `onehub`, When liệt tệp và đếm dòng xoá, Then không tệp nào dưới `apps/app/` bị chạm; `packages/ui/src/lib/messages.ts`, `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` và `_acceptance/nen-chat-ai-elements/so-lech-chuan.md` chỉ có dòng thêm, không dòng xoá.

## Coverage

Quét bằng `morphological-scan` trong phiên (04/10). Chân sản phẩm: `docs/ai-ux.md`, `docs/chat-ui.md`
[SUY-TỪ-REPO: docs/ai-ux.md, docs/chat-ui.md]. Chân ngành: sổ thành phần AI Elements của Vercel (48
thành phần, bản ghim ở `.agents/skills/ai-elements/references/`), ChatGPT Canvas, Claude Artifacts,
Microsoft Copilot Pages — hội thoại hẹp cạnh vật phẩm rộng, chấp nhận từng dòng hay cả nhóm
[NGÀNH: AI Elements; ChatGPT Canvas; Claude Artifacts; Copilot Pages — `tham-chieu-chat-ket-qua.md` của đề xuất 04/10].

- **Trục A — khối:** Transcript · Composer · Steps · State · Proposal (+ Group) · Artifact  [thước CE: `de-xuat-kara.html` mục 03; `chat-ui.md` Rule 3 — SUY-TỪ-REPO]
- **Trục B — trạng thái của Kara:** rảnh · đang làm · lỗi · tắt/hết lượt · chưa cấu hình · rỗng  [thước CE: bảng §7 `docs/ai-ux.md` — SUY-TỪ-REPO]
- **Trục C — trạng thái quyết của người:** chờ · khoá · đã nhận có Hoàn tác · đã bỏ qua · nhận cả nhóm  [thước CE: §5–6 `ai-ux.md`; NGÀNH: Copilot «Accept / Accept all», Perdoo «Import selected»]
- **Trục D — hiển thị:** khổ 1440 · 768 · 375 · ô 360 · ô 1080 · sáng · tối · vi · en  [thước CE: `~/.claude/rules/web/testing.md`; ba điều chủ kho chốt cho K2]
- Core: A×B cho Composer, Steps, State, Artifact (AC-2, 3, 4, 8); C cho Proposal (AC-6, 7); điểm cắm K2 (AC-6, 7, 8, 11); một «Thử lại» (AC-5); D (AC-9, 11); AI Elements và cổng (AC-10); ranh giới (AC-14).
- Later: đính kèm trong ô soạn, nguồn và trích dẫn trong hội thoại, mốc tua lại (`checkpoint`) — cần màn và server, K5 trở đi; bố cục hai tab trên điện thoại — K2.
- Never: `tool` của AI Elements (JSON qua `code-block`, sổ đăng ký xếp «Not for this product»); nối màn trong `apps/app` trước 14/10 (luật điều phối); tô màu thương hiệu cho dấu Kara (§2).
- [GIẢ ĐỊNH] Tên và nơi đặt: `packages/ui/src/components/kara/<transcript|composer|steps|state|proposal|artifact|busy>.tsx`, import `@crm/ui/components/kara/<tệp>`.
- [GIẢ ĐỊNH] Nhãn nhóm đếm «đề xuất» (chữ trong `messages.ts`); màn gọi đổi được bằng prop.
- [GIẢ ĐỊNH] Khi bận, «Hoàn tác» của dòng đã quyết cũng khoá — dòng không đổi dưới tay khi Kara đang viết.
- [GIẢ ĐỊNH] `KaraState working` trễ 1000 ms trước khi hiện (§7 «Dưới 1 giây — không hiện gì»).

## Đường đo

- Ngưỡng «K2 không viết lại khối nào»: số đến từ hợp đồng và sổ quyết định của K2 (`_acceptance/soan-okr-trang-rieng/`) — đếm AC hay dòng `fix` nói phải bọc hay viết lại một khối Kara. Bảo đảm bởi AC-6, AC-7, AC-8, AC-11 (ba điểm cắm có sẵn và đo được trước khi K2 mở).
- Timebox 10/10: ngày mở PR của lượt này, đọc từ GitHub.

## Out of scope

- Nối bất kỳ màn nào trong `apps/app` — K2 (Soạn OKR), K3 (góp ý), K4 (khung bản ghi), K5 (Chat, Deal), sau 14/10.
- Đổi tên Kara và chữ tiếng Việt trên các màn, tab bản ghi, Tài liệu, thông tin liên hệ — phần `apps/app` của `tu-vung-tac-tu`, chuyển sang K4 và K6a.
- Thanh kéo đổi cỡ (`resizable` của shadcn) và trang riêng — K2 cài và dựng.
- `tool`, `attachments`, `sources`, `inline-citation` trong hội thoại, `checkpoint` của AI Elements.
- Đổi `proposed-change.tsx`, `kara.tsx` hay thành phần sẵn có nào khác trong `packages/ui`.

## Notes

- Tệp chung chỉ thêm và chỉ sau khi #231 gộp: `messages.ts`, `mo-coi.mjs`, `so-lech-chuan.md`, `docs/chat-ui.md`. Ghim lại `nen-chat-ai-elements` và mọi hồ sơ bị chạm đi cuối, một lượt ở đỉnh nhánh.
- Phòng mẫu không dùng CSDL hay API, chạy cổng tự do; tay thì cổng 3360.
