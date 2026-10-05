# Bộ xương Kara — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng sáu khối Kara và `KaraBusy` trong `packages/ui/src/components/kara/`, phòng mẫu tĩnh và các thước của hồ sơ `bo-xuong-kara`, không chạm `apps/app`.

**Architecture:** Mỗi khối một tệp, ghép từ AI Elements (đã có trong cây, cộng `artifact` và `task` kéo bằng CLI), shadcn và nền `nen-kara`. `KaraBusy` là một React context làm nguồn duy nhất của «Kara đang soạn»; `KaraArtifact busy` phát nó, `KaraProposal` và `KaraComposer` đọc nó. Phòng mẫu là một trang tĩnh đóng gói bằng `Bun.build` từ `kara/vi-du/`, CSS từ `@tailwindcss/postcss` của kho, chụp bằng puppeteer.

**Tech Stack:** React 19, Bun 1.3.12 (`/opt/homebrew/opt/bun@1.3.12/bin`), `bun:test` với `test/setup-dom.ts` (jsdom), AI Elements, Tailwind 4, puppeteer-core 25 + Google Chrome.

**Spec:** `docs/superpowers/specs/2026-10-04-bo-xuong-kara-design.md` · hợp đồng `_acceptance/bo-xuong-kara/contract.md` · evals `_acceptance/bo-xuong-kara/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã, kể cả tệp kéo về từ AI Elements.
- Không `className` đổi màu, góc, khoảng cách của một thành phần `@crm/ui`; góc chỉ `rounded-sm|md|lg`.
- Không tạo hay sửa tệp nào dưới `apps/app/**`.
- Tệp chung chỉ thêm dòng: `packages/ui/src/lib/messages.ts`, `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`, `_acceptance/nen-chat-ai-elements/so-lech-chuan.md`, `docs/chat-ui.md`, `_acceptance/config.yaml` (khoá `k1_*`). Bốn tệp đầu chỉ sửa sau khi PR #231 gộp (điều phối, Nhật ký 13:05), trừ khi điều phối cho ngoại lệ.
- Mọi chữ do khối tự đặt đi qua `useMessages()` nhóm `karaKhung`; tên «Kara» là `KARA.ten` (`@crm/ui/lib/kara`).
- Dấu AI chỉ qua `KaraMark` / icon `AiGenerate` trong `packages/ui`.
- `KaraRetry` = `<Button variant="outline" size="sm" type="button">` không icon — nút «Thử lại» duy nhất.
- Chạy mọi lệnh với `PATH=/opt/homebrew/opt/bun@1.3.12/bin:$PATH`; bài DOM: `cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup-dom.ts ./test/bo-xuong-kara.dom.tsx -t <nhóm>`.
- Thước dưới `_acceptance/bo-xuong-kara/rang/` suy gốc kho từ vị trí tệp (`resolve(HERE, "..", "..", "..")`), không hardcode.
- Khoá `s4`: trước mỗi `mkdir khoa/s4`, đọc dòng đầu `trang-thai/P1.md`…`P5.md`; có «chờ khoá s4» thì chờ thêm một lượt (Nhật ký 13:40).

## Review Focus

1. Màn gọi rerender `entries` của nhóm khi đề xuất đổi trạng thái — số «N đề xuất» phải đổi theo, không giữ số cũ trong state (Task 4 có ca rerender).
2. `KaraBusy` lồng nhau (trang bọc `KaraBusyProvider`, bên trong có `KaraArtifact busy`) — bận ở bất kỳ tầng nào thì khối con thấy bận (Task 1: `useKaraBusy` gộp OR với tầng cha).
3. Gửi chữ toàn khoảng trắng — `KaraComposer` không gọi `onSubmit` (Task 6 có ca).
4. `KaraState working` bị gỡ trước khi hết trễ — hẹn giờ phải huỷ, không cập nhật state sau khi gỡ (Task 3 có ca unmount trước trễ, không cảnh báo React).
5. Tên bước dài trên khổ 375 — chữ xuống dòng, không tràn (phòng mẫu dùng một tên bước dài ở `ST-phongmau-buoc-loi`, Task 11 đo tràn ngang).

---

### Task 1: KaraBusy, thước ranh giới, thước tài liệu, ai-ux.md

**Phục vụ:** E13 (một phần), E15 · **independent:** true

**Files:**
- Create: `packages/ui/src/components/kara/busy.tsx`
- Create: `_acceptance/bo-xuong-kara/rang/ranh-gioi.mjs`, `_acceptance/bo-xuong-kara/rang/tai-lieu.mjs`
- Modify: `docs/ai-ux.md` (bảng mục 10, hàng lộ trình `tu-vung-tac-tu`, thêm hàng `bo-xuong-kara`)

**Interfaces — Produces:**
```tsx
export type KaraBusyState = { label: ReactNode } | null;
export function KaraBusyProvider(props: { busy: KaraBusyState; children: ReactNode }): JSX.Element;
export function useKaraBusy(): KaraBusyState;
```
`KaraBusyProvider` gộp với tầng cha: giá trị = `busy ?? cha`.

- [ ] Viết `busy.tsx` (context mặc định `null`).
- [ ] `ranh-gioi.mjs`: `git merge-base HEAD origin/onehub` (lỗi → in tên, mã 2); `git diff --name-only <mb>..HEAD`; tệp bắt đầu `apps/app/` → `cham apps/app: <tệp>`; `git diff --numstat <mb>..HEAD -- <ba tệp chung>` cột xoá > 0 → `xoa dong o tep chung: <tệp>`; diff rỗng → `RONG: nhanh da gop, khong con diff` mã 0. `--kiem-do-do` đọc danh sách giả `["apps/app/x.tsx"]` và numstat giả `"5\t1\tpackages/ui/src/lib/messages.ts"` qua cùng hàm phán, phải ra mã 1 với hai thông điệp.
- [ ] `tai-lieu.mjs`: hàm `bang(tep, tieuDe)` tách bảng markdown sau tiêu đề thành hàng × ô; kiểm (a)(b)(c) của E13; `--tep-ai-ux <đường>` để chạy chiều đỏ trên bản sao.
- [ ] Sửa `docs/ai-ux.md`: bảng mục 10 thêm hàng «Sáu khối hội thoại và trạng thái» nêu `KaraTranscript`, `KaraComposer`, `KaraSteps`, `KaraState`, `KaraProposal`, `KaraArtifact` (`kara/`), hàng luật 7 nêu `KaraRetry`; bảng lộ trình: ô «Làm gì» của `tu-vung-tac-tu` ghi «phần `packages/ui` đã gộp vào `bo-xuong-kara`; phần màn chuyển sang K4 và K6a», thêm hàng `bo-xuong-kara`.
- [ ] Chạy `node _acceptance/bo-xuong-kara/rang/ranh-gioi.mjs` (mã 0) và `--kiem-do-do` (mã 1, hai thông điệp); `tai-lieu.mjs` sẽ còn đỏ ở mục (c) tới Task 7 — ghi nhận, không sửa tạm.
- [ ] Commit `feat(ui): KaraBusy + thước ranh giới và tài liệu của bo-xuong-kara`.

### Task 2: Nhóm chữ `karaKhung`

**Phục vụ:** E9 · **independent:** false (mọi khối sau cần) · **chặn bởi:** #231 gộp hoặc ngoại lệ của điều phối

**Files:** Modify: `packages/ui/src/lib/messages.ts` — thêm nhóm ngay sau nhóm `kara` ở cả `en` và `vi`.

```ts
karaKhung: {
	hoiThoaiRongTieuDe: "Ask Kara",
	hoiThoaiRongMoTa: "Kara answers here and keeps the draft beside the conversation.",
	moc: (s: string) => `Kara changed the draft: ${s}`,
	boNguCanh: (s: string) => `Remove context: ${s}`,
	daLamBuoc: (n: string) => (n === "1" ? "Kara took 1 step" : `Kara took ${n} steps`),
	dangLamBuoc: (s: string) => `Kara is working on: ${s}`,
	buocXong: "Done",
	buocDangChay: "In progress",
	buocLoi: "This step failed",
	chuaDuoc: (s: string) => `Kara couldn't ${s}`,
	thuLai: "Try again",
	chuaBatTieuDe: "Kara isn't turned on here",
	dangSoanKhoa: "Kara is drafting — you can decide once it finishes.",
	dangSoan: "Kara is drafting…",
	nhomDeXuat: (n: string) => (n === "1" ? "1 suggestion" : `${n} suggestions`),
},
```
```ts
karaKhung: {
	hoiThoaiRongTieuDe: "Hỏi Kara",
	hoiThoaiRongMoTa: "Kara trả lời ở đây, bản nháp nằm bên cạnh cuộc trò chuyện.",
	moc: (s: string) => `Kara sửa bản nháp: ${s}`,
	boNguCanh: (s: string) => `Bỏ ngữ cảnh: ${s}`,
	daLamBuoc: (n: string) => `Kara đã làm ${n} bước`,
	dangLamBuoc: (s: string) => `Kara đang ${s}`,
	buocXong: "Xong",
	buocDangChay: "Đang chạy",
	buocLoi: "Bước này hỏng",
	chuaDuoc: (s: string) => `Kara chưa ${s} được`,
	thuLai: "Thử lại",
	chuaBatTieuDe: "Kara chưa được bật ở đây",
	dangSoanKhoa: "Kara đang soạn — xong sẽ quyết được.",
	dangSoan: "Kara đang soạn…",
	nhomDeXuat: (n: string) => `${n} đề xuất`,
},
```
- [ ] Thêm hai nhóm; chạy `cd packages/ui && bun test ./test/messages-guard.spec.ts ./test/locale-messages.spec.tsx && bun run check-types` — xanh.
- [ ] Commit `feat(ui): chữ karaKhung cho bộ xương Kara` (không đẩy trước #231).

### Task 3: KaraState và KaraRetry

**Phục vụ:** E4, E5 · **independent:** false (cần Task 2)

**Files:** Create `packages/ui/src/components/kara/state.tsx`; Test `packages/ui/test/bo-xuong-kara.dom.tsx` (tạo tệp; khung `ve()`, `afterEach` gỡ root, như `nen-kara.dom.tsx`).

**Interfaces — Produces:**
```tsx
export function KaraRetry(props: { onClick: () => void; disabled?: boolean }): JSX.Element;
export type KaraStateProps =
	| { kind: "working"; label: ReactNode; delayMs?: number }
	| { kind: "empty"; title: ReactNode; description: ReactNode }
	| { kind: "error"; what: string; description?: ReactNode; onRetry: () => void }
	| { kind: "off"; reason: ReactNode; action?: ReactNode }
	| { kind: "unconfigured"; description: ReactNode };
export function KaraState(props: KaraStateProps): JSX.Element | null;
```
- working: `useEffect` đặt `setTimeout(delayMs ?? 1000)`, dọn khi gỡ; trước hạn trả `null`; sau hạn `<div role="status"><ThinkingIndicator label={label}/></div>` (label dạng chuỗi thì truyền thẳng).
- empty / unconfigured / error: `Empty border="solid" size="compact"` + `EmptyHeader`/`EmptyTitle`/`EmptyDescription`; error thêm `EmptyContent` chứa `KaraRetry`; tiêu đề error = `msg.karaKhung.chuaDuoc(what)`; unconfigured tiêu đề `msg.karaKhung.chuaBatTieuDe`.
- off: `<div>{action}<FieldDescription>{reason}</FieldDescription></div>`.

- [ ] Bài `describe("k1-state")`: ma trận năm kind ghi trước (bảng `KY_VONG_STATE` ở đầu tệp: thành phần có/vắng mỗi kind); ca working delayMs=200 đo trước 200 ms và sau 260 ms bằng `await new Promise(r => setTimeout(r, …))` trong `act`; ca gỡ trước hạn không cảnh báo (bắt `console.error`); in `so o: 5` và `expect(soO).toBe(5)`.
- [ ] Bài `describe("k1-thu-lai")`: (a) quét `.tsx` dưới `../src/components/kara` (đường từ `import.meta.dir`), đếm chỗ `karaKhung.thuLai` ngoài `state.tsx` = 0; (b) `KaraRetry` có `data-variant="outline"`, `data-size="sm"`, không `svg`; (c) mọi nút «Thử lại» trong `KaraState error` (và `KaraSteps` sau Task 8) như (b).
- [ ] Chạy đỏ trước (tệp chưa có), viết `state.tsx`, chạy xanh; phá-thử trên bản sao (bỏ trễ → 'working hien truoc tre'; thêm Spinner → 'co spinner tran'; size xs → 'thu lai sai co') — bài đọc biến môi trường `K1_TEP_STATE` để nạp bản sao, mặc định tệp thật.
- [ ] Commit.

### Task 4: KaraProposal và KaraProposalGroup

**Phục vụ:** E6, E7 · **independent:** false

**Files:** Create `packages/ui/src/components/kara/proposal.tsx`; Test: thêm `describe("k1-khoa")`, `describe("k1-nhom")`.

**Interfaces — Consumes:** `useKaraBusy`, `ProposedChange`, `ProposedChangeProps`, `ProposedChangeReceipt`, `KaraLabel`. **Produces:**
```tsx
export type KaraProposalProps = ProposedChangeProps;
export function KaraProposal(props: KaraProposalProps): JSX.Element;
export type KaraProposalEntry = { id: string; status: "pending" | "decided"; batchable: boolean };
export type KaraProposalGroupProps = {
	entries: readonly KaraProposalEntry[];
	reason: ReactNode;
	readAt?: string;
	scope?: ReactNode;
	batch?: { label: ReactNode; onAccept: (ids: string[]) => void };
	batchDecided?: { text: ReactNode; onUndo?: () => void };
	children: ReactNode;
};
export function KaraProposalGroup(props: KaraProposalGroupProps): JSX.Element;
```
- `KaraProposal`: `busy = useKaraBusy()`; trong nhóm (context riêng `TrongNhom`) thì bỏ `label`; chưa quyết + bận → `actions.map(a => ({...a, disabled: true}))`, `lockedReason = msg.karaKhung.dangSoanKhoa`; đã quyết + bận → bọc `<fieldset disabled className="m-0 min-w-0 border-0 p-0">`.
- `KaraProposalGroup`: `cho = entries.filter(e => e.status === "pending")`; `ids = cho.filter(e => e.batchable).map(e => e.id)`; đầu nhóm `KaraLabel scope={scope} text={msg.karaKhung.nhomDeXuat(String(cho.length))} reason={reason} readAt={readAt}`; nút nhóm `Button variant="outline" size="sm"` (nút tô màu thuộc từng đề xuất), `disabled={ids.length === 0 || busy !== null}`, bấm `onAccept(ids)`; `batchDecided` → `ProposedChangeReceipt decision="accepted"` bọc fieldset khi bận.
- [ ] Ma trận E6 (9 ô) và E7 (5 entries, rerender) như evals; phá-thử bằng `K1_TEP_PROPOSAL`.
- [ ] Commit.

### Task 5: KaraTranscript

**Phục vụ:** E1 · **independent:** false

**Files:** Create `packages/ui/src/components/kara/transcript.tsx`; Test `describe("k1-transcript")`.

**Produces:**
```tsx
export function KaraTranscript(props: { children?: ReactNode; empty?: { title?: ReactNode; description?: ReactNode } }): JSX.Element;
export function KaraTurn(props: { from: "user" | "kara"; children: ReactNode; actions?: ReactNode }): JSX.Element;
export function KaraSystemLine(props: { children: ReactNode }): JSX.Element;
export function KaraCheckpoint(props: { summary: string; onSelect: () => void }): JSX.Element;
export function KaraAvatar(): JSX.Element;
```
- Gốc `Conversation` + `ConversationContent` + `ConversationScrollButton`; không con → `ConversationEmptyState data-slot="conversation-empty-state"` chứa `KaraMark`, tiêu đề/mô tả mặc định `karaKhung.hoiThoaiRong*`.
- `KaraTurn from="kara"` → hàng `flex gap-2`: `KaraAvatar` (shadcn `MessageAvatar` + `Icon AiGenerate` + `<span className="sr-only">{KARA.ten}</span>`) rồi `Message from="assistant"`; `from="user"` → `Message from="user"`. Nội dung chuỗi bọc `MessageResponse`; `actions` → `MessageActions`.
- `KaraSystemLine` → `<p className="text-center text-muted-foreground text-xs">`.
- `KaraCheckpoint` → `Button variant="ghost" size="xs"` chứa `Marker` với chữ `karaKhung.moc(summary)`.
- [ ] Bài + phá-thử ('avatar co anh', 'moc khong goi') bằng `K1_TEP_TRANSCRIPT`; commit.

### Task 6: KaraComposer

**Phục vụ:** E2 · **independent:** false

**Files:** Create `packages/ui/src/components/kara/composer.tsx`; Test `describe("k1-composer")`.

**Produces:**
```tsx
export type KaraComposerProps = {
	onSubmit: (text: string) => void;
	onStop?: () => void;
	status?: "ready" | "busy" | "error";
	placeholder?: string;
	context?: { label: string; onRemove: () => void };
	suggestions?: readonly string[];
	onSuggestion?: (text: string) => void;
	lockedReason?: ReactNode;
};
export function KaraComposer(props: KaraComposerProps): JSX.Element;
```
- `PromptInput onSubmit={({text}) => { const t = text.trim(); if (t) onSubmit(t); }}`; `PromptInputHeader` chứa chip ngữ cảnh (`Badge variant="secondary"` + `Button size="icon-xs" variant="ghost" aria-label={karaKhung.boNguCanh(label)}`; gỡ xong `textareaRef.current?.focus()`); `PromptInputTextarea disabled={!!lockedReason} aria-describedby={lockedReason ? idLyDo : undefined}`; `PromptInputSubmit status={busy ? "streaming" : undefined} onStop={onStop} disabled={!!lockedReason}`; busy = `status === "busy" || useKaraBusy() !== null`; `suggestions` → `Suggestions` + `Suggestion` trên ô soạn; `lockedReason` → `FieldDescription id={idLyDo}`.
- [ ] Ma trận 6 ô + ca toàn khoảng trắng (Review Focus 3); phá-thử 'busy khong doi nut'; commit.

### Task 7: Kéo `artifact`, `task`; miễn trừ cổng; sổ lệch; chat-ui.md; thước E10

**Phục vụ:** E10, E13 (c) · **chặn bởi:** #231 gộp

**Files:**
- Create: `packages/ui/src/components/ai-elements/artifact.tsx`, `packages/ui/src/components/ai-elements/task.tsx`
- Modify (chỉ thêm): `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` (`MIEN_TRU`), `_acceptance/nen-chat-ai-elements/so-lech-chuan.md`, `packages/ui/src/lib/messages.ts` (`artifact.dong`), `docs/chat-ui.md`
- Create: `_acceptance/bo-xuong-kara/rang/ai-elements.mjs`

- [ ] `git fetch origin && git merge origin/onehub`, `bun install`; sửa test E2 theo tên khoá `promptInput` mới của #231.
- [ ] Kéo ở thư mục tạm (`bunx --bun ai-elements@latest add artifact task` với `components.json` của kho, `yes n`), chép hai tệp; sửa: bỏ chú thích; `XIcon`, `LucideIcon` → Carbon (`Close`) qua `Icon`; `sr-only "Close"` → `msg.artifact.dong`; bỏ `shadow-sm`; `size-8 p-0` → `size="icon-sm"`; `ChevronDownIcon`/`SearchIcon` của task → Carbon `ChevronDown`, bỏ icon tìm.
- [ ] `MIEN_TRU` thêm `{ tep: "artifact.tsx", ly_do: "bộ xương Kara K1 — KaraArtifact dựng trên nó, chưa màn nào nối", het_han: "K2 soan-okr-trang-rieng gộp" }` và tương tự `task.tsx`.
- [ ] `so-lech-chuan.md`: một mục mỗi tệp theo khuôn mục sẵn có; chạy `node _acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`, `chu-cung.mjs`, `mau-ban-kinh.mjs`, `mo-coi.mjs` — xanh.
- [ ] `docs/chat-ui.md` bảng «What is in the tree today» thêm hai hàng; sửa câu đếm «exactly eight files».
- [ ] `ai-elements.mjs` theo E10 (a)–(d), `--thu-muc`/`--mo-coi` để chạy chiều đỏ trên bản sao; commit.

### Task 8: KaraSteps

**Phục vụ:** E3, E5 (c) · **independent:** false (cần Task 7)

**Produces:**
```tsx
export type KaraStep = { id: string; label: string; state: "done" | "running" | "error" };
export function KaraSteps(props: { steps: readonly KaraStep[]; onRetry?: () => void }): JSX.Element;
```
- `Task defaultOpen={coDangChay || coLoi}`; `TaskTrigger title=…` với tiêu đề: có bước đang chạy → `dangLamBuoc(label)`, còn lại `daLamBuoc(String(steps.length))`; `TaskContent` mỗi bước `TaskItem data-trang-thai={xong|dang-chay|loi}` chứa `StatusIndicator tone={success|info|error} busy={running} label={label}` + chữ sr trạng thái; có lỗi và `onRetry` → `KaraRetry`.
- [ ] Ba ô E3 + phá-thử 'buoc xong khong gap'; commit.

### Task 9: KaraArtifact

**Phục vụ:** E8 · **independent:** false (cần Task 7)

**Produces:**
```tsx
export type KaraArtifactProps = {
	title: ReactNode;
	meta?: ReactNode;
	actions?: ReactNode;
	footer?: ReactNode;
	busy?: { label: ReactNode } | null;
	children: ReactNode;
};
export function KaraArtifact(props: KaraArtifactProps): JSX.Element;
```
- Gốc `Artifact data-slot="kara-artifact" className="h-full min-h-0 min-w-0"`; `ArtifactHeader`: `ArtifactTitle`, dòng dưới `KaraMark` + `meta`, bận → `KaraState kind="working" label={busy.label ?? msg.karaKhung.dangSoan}`; `ArtifactActions`; `ArtifactContent` bọc `KaraBusyProvider busy={busy ?? null}`; chân `<div data-slot="kara-artifact-footer" className="border-t p-4">`.
- [ ] Bài E8 + phá-thử 'than khong khoa khi ban'; commit.

### Task 10: Hai tiếng và quét chữ viết cứng

**Phục vụ:** E9 · **independent:** false (cần Task 3–9)

- [ ] `describe("k1-hai-tieng")`: 13 cấu hình của E9 (hằng `SO_CHO` ở đầu tệp), chuỗi đánh dấu `"⟦p1⟧"…` cho props; gom `textContent` từng nút lá và `aria-label`; so vi/en; miễn `TEN_RIENG`.
- [ ] Quét nguồn `kara/*.tsx` trừ `vi-du/`: dòng có chuỗi (`"…"`, `` `…` ``, chữ giữa thẻ JSX) chứa `DAU_TIENG_VIET` → 'chu viet cung: <tệp>:<dòng>'; phá-thử trên bản sao proposal.tsx.
- [ ] Commit.

### Task 11: Ví dụ và phòng mẫu

**Phục vụ:** E11, E12 · **independent:** false

**Files:**
- Create: `packages/ui/src/components/kara/vi-du/du-lieu.ts` (dữ liệu mẫu OKR tiếng Việt), `vi-du/phong-mau.tsx` (`export const TRANG_THAI: readonly { id: string; ve: () => JSX.Element }[]` đủ mười id của bảng §3 design; `export function PhongMau({ state, pane }: { state: string; pane?: number })`; bố cục `grid md:grid-cols-[380px_minmax(0,1fr)]`, dưới 768 xếp chồng)
- Create: `_acceptance/bo-xuong-kara/rang/phong-mau.mjs` (dựng: viết entry tạm vào `.acceptance-runs/bo-xuong-kara/phong-mau/` với symlink `node_modules` → `packages/ui/node_modules`, `Bun.build`, postcss `@tailwindcss/postcss` từ `apps/app/node_modules` trên `globals.css`, `index.html` đọc `?state=&theme=&pane=`; phục vụ `Bun.serve({ port: Number(process.env.CONG ?? 0) })`, route `/__cay` trả gốc kho; xuất hàm `dungPhongMau()` trả `{ url, dung() }`; chạy thẳng thì in URL và giữ)
- Create: `_acceptance/bo-xuong-kara/rang/man.mjs` (các bước E11, cờ `--kiem-do-do <tran|khong-khoa|cuon-trang|chong-cot|chup-som>`)

- [ ] Đọc tập id từ khối `UX-STATE-TABLE` của design doc, so với `TRANG_THAI`.
- [ ] Chụp 10 × 3 × 2 vào `_acceptance/bo-xuong-kara/evidence/E11-<id>-<1440|768|375>-<light|dark>.png`; đo tràn, cột 375, ô 360/1080 (`mouse.wheel`), đang soạn (chờ chữ bận ≤ 5 s), nhận cả nhóm → Hoàn tác, chiều cao «Thử lại» = 28.
- [ ] Năm chiều đỏ; tự xem vài ảnh (Read) trước khi commit; commit ảnh cùng mã.

### Task 12: Sàn thiết kế, năm lệnh chứng

**Phục vụ:** E14, mọi eval · **independent:** false

- [ ] `bun run --filter=@crm/ui check-types`, rồi từ gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` — đọc qua tệp (chạy nền, ghi log), không cắt bằng công cụ.
- [ ] `k1_san_thiet_ke` (E14) xanh; `ranh-gioi.mjs` xanh.
- [ ] Đặt contract `status: implemented`, commit, sang S4.
