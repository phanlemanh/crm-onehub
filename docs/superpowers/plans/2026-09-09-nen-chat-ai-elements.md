# Nền chat AI Elements — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dọn 19 component AI Elements không khả đạt, dựng lớp chuyển kiểu giữa hình dạng lượt của eve và kiểu AI SDK, chuẩn hoá bốn tệp còn sống, và đặt răng chống tái phát vào bộ cổng.

**Architecture:** Hình dạng lượt (`TranscriptItem`, `Tone`, `Source`) chuyển xuống `packages/validation` vì nó cắt biên gói và chỉ cần `zod`. Lớp chuyển sang kiểu AI SDK ở `packages/ui` vì đó là gói duy nhất khai `ai`. Bốn răng mới là script Node độc lập, mỗi răng một tệp, nối vào bộ cổng qua một tác vụ turbo của `@crm/ui`.

**Tech Stack:** bun · turbo · TypeScript · zod · `ai@^7.0.85` · puppeteer-core · oxlint · knip

**Spec:** `docs/superpowers/specs/2026-09-09-nen-chat-ai-elements-design.md`
**Hợp đồng:** `_acceptance/nen-chat-ai-elements/contract.md`

## Global Constraints

- Không viết chú thích trong code. Không trailer đồng tác giả trong commit.
- `/packages/ui` là nguồn duy nhất của giao diện. Không sửa `className` để đè kiểu component.
- Bán kính chỉ từ thang `rounded-sm` (4px) · `rounded-md` (5px) · `rounded-lg` (8px) · `rounded-none`.
- Chỉ hai thứ được tô: `primary` và `destructive`.
- Phân tích ở biên bằng zod; cấm truyền `Record<string, unknown>` qua các lớp.
- Hằng số gom một tệp cấu hình mỗi vùng, không rải đầu tệp dùng nó.
- `packages/ui` KHÔNG được nhập bất cứ thứ gì từ `apps/app`.
- Cài component chỉ bằng CLI: `bunx --bun ai-elements@latest add <tên>` chạy từ `packages/ui`. Không chép tay từ trang tài liệu.
- Mọi phép đo mới phải có cặp hai chiều trên cùng một vật: vật lành → xanh; phá vật thật trong bản sao → đỏ với thông điệp ghim tên.
- Verify mỗi việc chạy từ gốc kho: `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run test` · `bun run build`.

---

### Task 1: Hình dạng lượt xuống `packages/validation`

**Files:**
- Create: `packages/validation/src/agent-transcript.ts`
- Modify: `packages/validation/package.json` (thêm subpath `./agent-transcript`)
- Modify: `apps/app/lib/agent-transcript.ts` (nhập lại hình dạng thay vì tự khai)

**Interfaces:**
- Produces: `TranscriptItem`, `Tone`, `Source` cùng schema zod tương ứng, nhập bằng `@crm/validation/agent-transcript`.

**independent:** false — Task 2 dựng trên nó.
**Phục vụ:** E6 (bộ kiểm cả kho), E2 (kiểu tươi).

- [ ] **Bước 1** — Đọc `apps/app/lib/agent-transcript.ts:23-60` để lấy nguyên hình dạng bốn dạng `said` / `reasoned` / `asked` / `did`, `Tone`, `Source`.
- [ ] **Bước 2** — Viết bài kiểm đỏ trước ở `packages/validation/test/agent-transcript.spec.ts`: phân tích một lượt `did` mang `tone: "warning"` phải qua; một lượt thiếu `kind` phải ném lỗi có nêu tên trường.
- [ ] **Bước 3** — Chạy `cd packages/validation && bun test test/agent-transcript.spec.ts`. Chờ đỏ vì module chưa có.
- [ ] **Bước 4** — Viết `packages/validation/src/agent-transcript.ts`: schema zod cho từng dạng, hợp bằng `z.discriminatedUnion("kind", …)`, xuất kiểu bằng `z.infer`. Không viết tay interface cạnh schema.
- [ ] **Bước 5** — Thêm `"./agent-transcript": "./src/agent-transcript.ts"` vào exports của `packages/validation/package.json`.
- [ ] **Bước 6** — Sửa `apps/app/lib/agent-transcript.ts` nhập ba kiểu từ subpath mới và xuất lại; giữ nguyên `sourcesOf` và mọi hàm khác tại chỗ.
- [ ] **Bước 7** — Chạy `bun run check-types` và `cd apps/app && bun test test/agent-transcript.spec.ts`. Cả hai xanh.
- [ ] **Bước 8** — Commit.

---

### Task 2: Lớp chuyển kiểu eve → AI SDK

**Files:**
- Create: `packages/ui/src/lib/eve-to-ai-sdk.ts`
- Create: `packages/ui/test/eve-to-ai-sdk.spec.ts`
- Modify: `packages/ui/package.json` (thêm `@crm/validation` vào dependencies)

**Interfaces:**
- Consumes: `TranscriptItem`, `Tone` từ `@crm/validation/agent-transcript` (Task 1).
- Produces: `toUIMessage(item: TranscriptItem): UIMessage` và `toToolPart(item): ToolUIPart`.

**independent:** false — sau Task 1.
**Phục vụ:** E8 (lớp chuyển, ma trận bốn dạng).

- [ ] **Bước 1** — Mở `apps/app/test/agent-transcript.spec.ts` và **rút** vật thử từ đó, không tự dựng theo khuôn bên đọc. Chép các payload eve thật sang `packages/ui/test/fixtures/eve-turns.json`.
- [ ] **Bước 2** — Viết bài kiểm đỏ trước với **ma trận toàn phần**: bốn khẳng định về `role` cho bốn dạng, cộng một khẳng định về `state` cho `did`. Số khẳng định bằng số phần tử.
- [ ] **Bước 3** — Thêm ca ghim riêng: `did` mang `tone: "warning"` kèm chuỗi lỗi phải cho `state: "output-error"`, **không phải** `"output-available"`. Đây là ca dễ sai nhất vì cả hai đều là "đã xong".
- [ ] **Bước 4** — Chạy `cd packages/ui && bun test test/eve-to-ai-sdk.spec.ts`. Chờ đỏ.
- [ ] **Bước 5** — Viết `packages/ui/src/lib/eve-to-ai-sdk.ts`. Ánh xạ khai bằng một hằng `as const` gom một chỗ, không rải `if` từng dạng.
- [ ] **Bước 6** — Chạy lại bài kiểm. Xanh.
- [ ] **Bước 7** — **Chiều đỏ:** đổi ánh xạ `warning` sang `output-available` trong bản sao, chạy lại, xác nhận bài kiểm đỏ và thông điệp nêu chữ `warning` cùng tên state chờ đợi. Hoàn nguyên.
- [ ] **Bước 8** — Commit.

---

### Task 3: Dọn 19 tệp và kéo lại `conversation`

**Files:**
- Delete: 19 tệp trong `packages/ui/src/components/ai-elements/` — `artifact`, `chain-of-thought`, `checkpoint`, `code-block`, `confirmation`, `context`, `image`, `inline-citation`, `loader`, `model-selector`, `open-in-chat`, `plan`, `prompt-input`, `queue`, `sources`, `suggestion`, `task`, `tool`, `web-preview`
- Replace: `packages/ui/src/components/ai-elements/conversation.tsx` (bản CLI tươi)

**independent:** true
**Phục vụ:** E1 (tập khả đạt), E7 (bản tươi so sổ).

- [ ] **Bước 1** — Trước khi xoá, chạy lại phép tính khả đạt bắc cầu để tự xác nhận tập sống đúng là `message`, `reasoning`, `shimmer`, `conversation`.
- [ ] **Bước 2** — Chép `conversation.tsx` hiện tại ra `_acceptance/nen-chat-ai-elements/evidence/conversation-truoc.tsx` để sau còn so.
- [ ] **Bước 3** — Xoá 19 tệp.
- [ ] **Bước 4** — Từ `packages/ui`, chạy `bunx --bun ai-elements@latest add conversation`. Không chép tay.
- [ ] **Bước 5** — Chạy `bun run build` và `bun run check-types` từ gốc kho. Nếu đỏ vì một tệp đã xoá còn được nhập, dừng lại và báo — nghĩa là phép tính khả đạt sai, không được xoá bừa rồi vá chỗ nhập.
- [ ] **Bước 6** — So bản `conversation.tsx` tươi với bản cũ đã lưu; ghi mọi dòng khác vào nháp cho Task 10.
- [ ] **Bước 7** — Commit.

---

### Task 4: Chuẩn hoá tám chuỗi và ba bán kính

**Files:**
- Modify: `packages/ui/src/lib/messages.ts` (thêm khoá vào cả bảng `vi` và `en`)
- Modify: `packages/ui/src/components/ai-elements/message.tsx` (6 chuỗi, 2 `rounded-full`)
- Modify: `packages/ui/src/components/ai-elements/reasoning.tsx` (2 chuỗi)
- Modify: `packages/ui/src/components/ai-elements/conversation.tsx` (1 `rounded-full`)

**independent:** false — sau Task 3.
**Phục vụ:** E9 (chuỗi), E10 (màu và bán kính).

- [ ] **Bước 1** — Thêm khoá vào `packages/ui/src/lib/messages.ts`, cả `en` lẫn `vi`, cho tám chuỗi: `reasoning.tsx` "Thinking..." và "Thought for a few seconds"; `message.tsx` "Previous branch", "Next branch", "Remove attachment" (hai chỗ), "Remove" (hai chỗ).
- [ ] **Bước 2** — Chạy `cd packages/ui && bun test test/messages-guard.spec.ts`. Bài kiểm này đã có và đòi mọi giá trị `vi` mang dấu tiếng Việt cùng không trùng nguyên văn `en`.
- [ ] **Bước 3** — Sửa `reasoning.tsx` đọc chuỗi qua `useMessages()`, theo đúng lối `conversation.tsx:5` đang đi.
- [ ] **Bước 4** — Sửa `message.tsx` tương tự. **Bốn trong sáu chuỗi nằm trong `aria-label`**, không phải chữ giữa thẻ — đừng bỏ sót chúng.
- [ ] **Bước 5** — Đổi ba `rounded-full` sang bán kính trong thang. Chọn theo vai của phần tử: nút tròn nhỏ dùng `rounded-md`, không đặt bán kính chữ số tại chỗ gọi.
- [ ] **Bước 6** — Chạy năm lệnh cổng. Tất cả xanh.
- [ ] **Bước 7** — Commit.

---

### Task 5: Răng mồ côi

**Files:**
- Create: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`

**independent:** true
**Phục vụ:** E1, E13.

- [ ] **Bước 1** — Viết script dựng **đồ thị nhập**: đọc mọi tệp trong `ai-elements/`, rút đường nhập tương đối `"./x"`, gieo từ tập được `apps/**` nhập, lấy bao đóng bắc cầu.
- [ ] **Bước 2** — In cả hai danh sách, sống và chết, kèm số phần tử từng bên. Không in mỗi chữ OK.
- [ ] **Bước 3** — Suy gốc kho từ vị trí script (`import.meta.url`), không ghim cứng đường tuyệt đối.
- [ ] **Bước 4** — **Chiều đỏ trên cùng vật:** chép `open-in-chat.tsx` vào bản sao cây, chạy răng, xác nhận mã 1 và thông điệp nêu chuỗi `open-in-chat` cùng chữ "không khả đạt".
- [ ] **Bước 5** — **Đối chứng ngược:** thêm một tệp mới mà `reasoning.tsx` nhập bằng đường tương đối; răng phải **xanh**. Răng đỏ trước tệp khả đạt là răng quá tay và sẽ chặn oan các phase sau.
- [ ] **Bước 6** — Tệp không đọc được thư mục → mã 2, không phải xanh.
- [ ] **Bước 7** — Commit.

---

### Task 6: Răng chuỗi cứng

**Files:**
- Create: `_acceptance/nen-chat-ai-elements/rang/chu-cung.mjs`

**independent:** true
**Phục vụ:** E9, E14.

- [ ] **Bước 1** — Viết script quét chuỗi hiển thị trong mọi tệp còn lại của `ai-elements/`: chữ giữa thẻ **và** chuỗi trong `aria-label`, `placeholder`, `title`, `alt`.
- [ ] **Bước 2** — In danh sách tệp kèm số chuỗi cứng từng tệp; mọi số phải là 0.
- [ ] **Bước 3** — Kiểm đối ứng: mọi khoá gọi qua `useMessages()` phải có trong **cả hai** bảng `vi` và `en` của `packages/ui/src/lib/messages.ts`; thiếu bên nào thì nêu tên khoá và tên bảng.
- [ ] **Bước 4** — **Chiều đỏ, hai ca vì bốn trên tám chuỗi nằm trong thuộc tính:** (a) đặt `Copy message` giữa thẻ → mã 1 nêu đường dẫn và nguyên văn; (b) đặt chuỗi tiếng Anh vào một `aria-label` → mã 1 nêu đích danh. Ca (b) xanh nghĩa là răng có lỗ đúng nửa dân số.
- [ ] **Bước 5** — Không tìm thấy tệp nào để quét → mã 2. Tập rỗng không phải là sạch.
- [ ] **Bước 6** — Commit.

---

### Task 7: Răng màu và bán kính

**Files:**
- Create: `_acceptance/nen-chat-ai-elements/rang/mau-ban-kinh.mjs`

**independent:** true
**Phục vụ:** E10.

- [ ] **Bước 1** — Viết script dùng **danh sách trắng đóng**, không danh sách đen: mọi lớp khớp `text-` `bg-` `border-` `ring-` `fill-` `stroke-` phải là một token có tên trong bảng của `docs/design.md`; mọi lớp khớp `rounded-` phải thuộc thang bốn giá trị.
- [ ] **Bước 2** — In hai phép đếm **riêng**, vì hai vế có dân số khác nhau: bán kính (vào vòng là 3) và màu (vào vòng là 0).
- [ ] **Bước 3** — In mọi lớp lạ kèm tên tệp và số dòng.
- [ ] **Bước 4** — **Chiều đỏ, hai luợt:** (a) đặt `rounded-full` vào `reasoning.tsx` → mã 1 nêu tệp và dòng; (b) đặt `bg-accent` — một lớp chưa từng có trong kho và không nằm trong bất kỳ danh sách đen nào — vào `message.tsx` → mã 1 nêu nguyên văn `bg-accent`. Ca (b) xanh nghĩa là script vẫn đang chạy danh sách đen.
- [ ] **Bước 5** — Commit.

---

### Task 8: Răng phạm vi

**Files:**
- Create: `_acceptance/nen-chat-ai-elements/rang/pham-vi-diff.mjs`

**independent:** true
**Phục vụ:** E15.

- [ ] **Bước 1** — Viết script chạy `git diff --name-only <nhánh nền>...HEAD` rồi đối chiếu từng đường với danh sách trắng 14 đường chép nguyên văn từ AC-2.
- [ ] **Bước 2** — In tổng số tệp đổi và danh sách tệp vi phạm (rỗng khi xanh).
- [ ] **Bước 3** — Kiểm ghim riêng: sáu tệp chat 109 KB phải **không** xuất hiện trong diff.
- [ ] **Bước 4** — **Chiều đỏ:** chạm một dòng vào `agent-composer.tsx` trong bản sao → mã 1 nêu đích danh đường đó và chữ "ngoài phạm vi đã duyệt".
- [ ] **Bước 5** — Diff rỗng → mã 2. Chưa làm gì không phải là giữ đúng phạm vi.
- [ ] **Bước 6** — Commit.

---

### Task 9: Phép đo cuộn

**Files:**
- Create: `_acceptance/nen-chat-ai-elements/rang/so-do-cuon.mjs`
- Create: `_acceptance/nen-chat-ai-elements/evidence/so-do-cuon.json`

**independent:** false — đo `Conversation` nên phải chờ bản tươi của Task 3.
**Phục vụ:** E11.

- [ ] **Bước 1** — Đọc `packages/ui/package.json` script `ui:capture` để lấy đúng lối dùng `puppeteer-core` mà kho đã có; đi theo lối đó, đừng thêm phụ thuộc mới.
- [ ] **Bước 2** — Dựng trang thử render hội thoại giả ở 50, 200, 500 lượt cho cả `MessageScroller` và `Conversation`; đo thời gian bố cục trên trình duyệt thật. jsdom không bố cục nên không đo được ở đó.
- [ ] **Bước 3** — Ghi đủ sáu ô vào `evidence/so-do-cuon.json`, không ô nào rỗng.
- [ ] **Bước 4** — Ở ca 500 lượt, in ba số — `Conversation` trước vá, `Conversation` sau vá, `MessageScroller` — cùng **tỉ số**. Tỉ số cuối cùng lớn hơn 1,2 → mã 1 nêu cả ba số. Có bản vá mà tỉ số vẫn 7,0 là **không đạt**.
- [ ] **Bước 5** — Nếu chưa đạt, vá: thêm `content-visibility: auto` và `contain-intrinsic-size` lên con của `ConversationContent`, theo đúng lối `message-scroller.tsx:77`. Ghi vào sổ lệch chuẩn cho Task 10.
- [ ] **Bước 6** — **Chiều đỏ trên cùng vật:** gỡ `content-visibility` khỏi `MessageScrollerItem` trong bản sao; số ca 500 của `MessageScroller` phải xấu đi rõ rệt và tỉ số tụt. Gỡ mà tỉ số không đổi thì phép đo đang đo thứ khác — mã 1 với chữ "thước không phản ứng".
- [ ] **Bước 7** — Trình duyệt không khởi động được → mã 2.
- [ ] **Bước 8** — Commit.

---

### Task 10: Sổ lệch chuẩn và răng đối chiếu

**Files:**
- Create: `_acceptance/nen-chat-ai-elements/so-lech-chuan.md`
- Create: `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`

**independent:** false — sau Task 3, 4, 9.
**Phục vụ:** E12.

- [ ] **Bước 1** — Viết sổ: một mục cho mỗi tệp khác bản thượng nguồn, đủ ba phần — tên tệp, đổi gì, vì sao.
- [ ] **Bước 2** — Viết một đoạn nói thành lời rằng chạy lại `add` sẽ ghi đè im lặng, kèm các bước phải làm sau mỗi lần kéo bản mới.
- [ ] **Bước 3** — Viết script kéo bản CLI **tươi cho cả ba tệp** `message`, `reasoning`, `conversation` vào thư mục tạm rồi mới tính tập lệch. **Cấm suy "tệp lệch" từ chính sổ** — hai tập khi đó luôn trùng và phép đo xanh vĩnh viễn.
- [ ] **Bước 4** — Đối chiếu tập tệp lệch với tập mục trong sổ; hai tập phải trùng nhau, không thiếu không thừa. In tên từng tệp kèm số dòng khác.
- [ ] **Bước 5** — **Chiều đỏ:** sửa một dòng của `reasoning.tsx` mà không thêm mục → mã 1 nêu tên tệp; thêm một mục cho tệp không lệch → mã 1 nêu tên mục thừa.
- [ ] **Bước 6** — CLI không chạy được → mã 2, tuyệt đối không coi là "không tệp nào lệch".
- [ ] **Bước 7** — Commit.

---

### Task 11: Nối răng vào bộ cổng

**Files:**
- Create: `packages/ui/scripts/rang-chat.mjs` (gọi bốn răng)
- Modify: `packages/ui/package.json` (tác vụ `rang:chat`)
- Modify: `turbo.json`
- Modify: `.githooks/gate-shape.json`
- Modify: `_acceptance/config.yaml` (khai các khoá `nc_*`)

**independent:** false — sau mọi task khác.
**Phục vụ:** E13, E14, và mọi eval trỏ `config:executors.script.nc_*`.

- [ ] **Bước 1** — Dựng một tác vụ chạy bốn răng, nối vào `bun run test` của `@crm/ui` hoặc thành tác vụ turbo riêng. Răng nằm trong thư mục hồ sơ mà chỉ chạy khi gõ tay thì không chặn được ai.
- [ ] **Bước 2** — Khai tác vụ mới ở `.githooks/gate-shape.json`, rồi chạy `node scripts/verify-gate-shape.mjs`. Không khai là nó cắn ở lần đẩy kế.
- [ ] **Bước 3** — Khai các khoá vào `_acceptance/config.yaml` **bằng script chung, không sửa tay**: `node <gốc plugin acceptance-gate>/scripts/config-patch.mjs --config _acceptance/config.yaml --key executors.script.nc_mo_coi --value "…" --write`, lặp cho `nc_chu_trong_component`, `nc_mau_ban_kinh`, `nc_so_do_cuon`, `nc_so_lech_chuan`, `nc_pham_vi_diff`, `nc_rang_qua_cong`, `nc_conversation_tuoi`, và `executors.test.nc_lop_chuyen`.
- [ ] **Bước 4** — **Đối chứng dương:** cây sạch thì lệnh cổng xanh.
- [ ] **Bước 5** — **Chiều đỏ qua cổng, không gọi thẳng răng:** chép một tệp không khả đạt vào `ai-elements/`, chạy **đúng lệnh cổng của kho**; lệnh cổng phải trả mã khác 0 và nêu đích danh tên tệp. Lặp cho một chuỗi tiếng Anh đặt trong `aria-label`.
- [ ] **Bước 6** — Chạy năm lệnh cổng. Tất cả xanh.
- [ ] **Bước 7** — Đặt contract sang `status: implemented`.
- [ ] **Bước 8** — Commit.
