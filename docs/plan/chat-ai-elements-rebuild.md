# Plan — Rebuild the chat on AI Elements

Replace the whole chat stack with AI Elements: the transcript spine, the bubbles,
the tool steps, the composer, the attachments and the agent cards. shadcn keeps
the shell around it — pages, dialogs, sidebar, tables, buttons.

**Chosen 2026-09-09.** The chat is expected to grow citations and artifacts, so
the family that ships those takes the whole conversation rather than half of it.
`docs/chat-ui.md` has been rewritten to this boundary and is the rule;
`docs/plan/chat-ui-alignment.md` is the branch not taken, kept for its audit.

Until this migration lands the tree is mixed. Every chat change moves toward the
target, never away.

## Phase 0 đã xong — đọc mục này trước phần còn lại

**Cập nhật 10/09/2026, vòng `nen-chat-ai-elements`.** Phase 0 đã giao. Phần dưới
của kế hoạch viết trước khi nó chạy, nên vài chỗ mô tả một cái cây không còn
nữa. Sửa ở đây thay vì sửa rải rác, để không ai đọc nhầm một câu lẻ:

- **Thư mục `ai-elements/` còn 4 tệp**, không phải 23: `message`, `reasoning`,
  `shimmer` (do `reasoning` nhập), `conversation` (kéo tươi làm mốc cho phép đo
  cuộn). 19 tệp còn lại đã xoá — không tệp nào khả đạt từ `apps/**`.
- **Mọi component khác phải kéo lại bằng CLI trước khi dùng**, kể cả các tên ở
  nhóm Adopted của `docs/chat-ui.md`. Câu "Only one component has to be fetched"
  bên dưới không còn đúng.
- **Kéo về là chưa xong.** Răng mồ côi chạy trong `bun run test` đỏ với bất kỳ
  tệp nào trong thư mục đó mà `apps/**` không với tới. Component mới phải chạm
  một màn trong cùng một thay đổi.
- **B3 và B4 đã giao, nhưng trên một dân số khác** với dân số kế hoạch ghi: các
  tệp mang màu thô (`tool`, `web-preview`) và phần lớn chuỗi tiếng Anh nằm trong
  19 tệp đã xoá. Sổ lệch chuẩn của record là
  `_acceptance/nen-chat-ai-elements/so-lech-chuan.md`, không phải các con số ở
  mục "Local divergence" bên dưới.
- **Khoá chuỗi của `packages/ui` sống ở `packages/ui/src/lib/messages.ts`**, không
  phải `apps/app/lib/messages/agent-builder-*.ts` như B4 ghi — `packages/ui`
  không được nhập gì từ `apps/app`.
- **B2 đã dựng**: hình dạng lượt ở `packages/validation/src/agent-transcript.ts`,
  lớp chuyển ở `packages/ui/src/lib/eve-to-ai-sdk.ts`. Dạng `asked` cố ý không đi
  qua lớp chuyển.
- **B1 đã đo trên trình duyệt thật**: `Conversation` chậm hơn `MessageScroller`
  **32 lần** ở 500 lượt; sau khi thêm hai thuộc tính bỏ bố cục ngoài khung nhìn
  còn 0,89 lần. Bản vá đã ở trong `conversation.tsx` và là một mục trong sổ lệch.
- **`loader.tsx` đã xoá ở vòng này**, không phải ở Phase 1.

**Phase 1 vẫn là bước kế**, và nó gánh thêm một việc: gỡ mục miễn trừ
`conversation.tsx` trong `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` khi
`Conversation` được nối vào màn thật — điều kiện hết hạn ghi ngay trong script.

## What "the whole chat" is

| Surface | Files | Size |
| --- | --- | --- |
| Agent builder transcript | `agent-builder-chat.tsx` | 44 KB, 17 components |
| Composer | `agent-composer.tsx`, `chat-chips.tsx` | 47 KB |
| Record sheet Agent tab | `crm/agent-panel.tsx` | 13 KB, see `docs/agent-panel.md` |
| Clarification | `agent-clarification-composer.tsx` | 4 KB |
| Loading state | `agent-builder-route-fallback.tsx` | 2 KB |

23 of the 48 AI Elements components are already vendored in
`packages/ui/src/components/ai-elements/`. This plan uses 13 of them, adds 1 (`attachments`), and deletes the rest.

## The mapping

| Today | Becomes |
| --- | --- |
| `MessageScroller*` (shadcn) | `Conversation`, `ConversationContent`, `ConversationScrollButton`, `ConversationEmptyState` |
| `UserSubmission` hand-rolled bubble (`chat:816`) | `Message from="user"` + `MessageContent` |
| `Message`/`MessageContent` (shadcn, `agent-panel`) | same, from `ai-elements/message` |
| `Markdown` / `MessageResponse` | `MessageResponse` everywhere |
| `ThinkingIndicator` (`DotMatrix` + `Shimmer`) | **stays** — `loader` is delisted upstream, see below |
| `ResponseActions` copy/thumbs (`chat:1011`) | `MessageActions` + `MessageAction` |
| `AgentToolStep` (`chat:635`) | `Tool`, `ToolHeader`, `ToolContent`, `ToolInput`, `ToolOutput` |
| `Reasoning` | unchanged — already AI Elements |
| `FollowUpTranscriptItem` (`chat:969`) | `Confirmation` family, or stays custom |
| `agent-composer` (`InputGroup` + `TokenField` + `Popover`) | `PromptInput`, `PromptInputBody`, `PromptInputTextarea`, `PromptInputHeader`, `PromptInputFooter`, `PromptInputTools`, `PromptInputSubmit` |
| `@company` / `@contact` / `@deal` mention picker | `PromptInputCommand*` (palette is already in the vendored file) |
| `ChatAttachmentChip` (shadcn `Attachment`) | `PromptInputAttachments` in the composer, `MessageAttachments` in the transcript — **both already vendored inside `message.tsx` and `prompt-input.tsx`** |
| nothing — `sourcesOf()` renders nowhere | `Sources`, `SourcesTrigger`, `Source`, `InlineCitation` |
| `BuildingAgentCard` / `ReviewAgentCard` / `DeployedAgentCard` | `Plan` + `Artifact` + `Task` |
| `Suggestion` (shadcn, `crm/facts.tsx`) | `Suggestions` + `Suggestion` |
| `agent-model.tsx` in settings | `ModelSelector` |

Only one component has to be fetched: `attachments`, and only if a standalone
grid is wanted beyond `MessageAttachments`. Everything else is in the tree.

## What AI Elements does not answer

These stay shadcn no matter which plan wins. The plan is not "delete shadcn from
the chat" — it is "AI Elements owns the AI-shaped parts".

| Need | Why AI Elements cannot take it |
| --- | --- |
| Message avatar | `ai-elements/message` exports no avatar. `agent-panel.tsx:459` needs one. Keep `@crm/ui/components/message`'s `MessageAvatar` — the one shadcn export that survives. |
| Clarification questionnaire | `agent-clarification-composer.tsx` uses shadcn `Questionnaire`. `Confirmation` is accept/reject, not a form. No equivalent. |
| CRM result tables | `deal-list-result.tsx` renders deals in `SimpleTable`. That is CRM data that happens to appear in a transcript, not chat furniture. |
| Code and diff workspace | `agent-code-workspace.tsx` runs on `@pierre/diffs` and `@pierre/trees`. AI Elements' `file-tree` / `sandbox` / `code-block` would be a third family. Out of scope. |
| Everything structural | Pages, dialogs, sidebar, sheets, buttons, inputs, tables. |

## Four things to settle before phase 1

None of these is optional, and three of them are the real cost of this plan.

**B1 — `Conversation` has no virtualization.** `MessageScroller` runs on
`@shadcn/react/message-scroller` with `content-visibility: auto` and
`contain-intrinsic-size` per item, so off-screen turns skip layout.
`ai-elements/conversation.tsx` is `use-stick-to-bottom` around a plain div.

Measure first: profile the builder transcript at 50, 200 and 500 turns on both.
If `Conversation` regresses, the answer is not to abandon the plan — the file is
vendored, so we own it. Patch the same two CSS properties onto
`ConversationContent`'s children. Budget it as work, and record it, because it
becomes a local divergence to re-apply on every `ai-elements@latest add`.

**B2 — The transcript speaks eve, not the AI SDK.** `lib/agent-transcript.ts`
produces `TranscriptItem` with kinds `said` / `reasoned` / `did` / `asked`, plus
`Tone = neutral | success | warning`. AI Elements wants `UIMessage["role"]`,
`ToolUIPart["state"]` (`input-streaming`, `output-available`, `output-error`, …)
and `FileUIPart`.

That adapter is one module, parsed once, per `AGENTS.md`'s boundary rule — not a
cast at each call site. `ai` is a dependency of `@crm/ui` and **not** of
`apps/app`, so either the adapter lives in `packages/validation/src` (it crosses
a package boundary, which is exactly what that package is for) or `apps/app`
takes on `ai`. Prefer `packages/validation`.

**B3 — Several vendored files violate `docs/design.md` as shipped.**
`tool.tsx` carries `text-green-600`, `text-red-600`, `text-yellow-600`,
`text-blue-600`, `text-orange-600` and a `rounded-full` badge;
`web-preview.tsx` has `text-yellow-600`; `conversation`, `inline-citation`,
`model-selector`, `message`, `queue`, `suggestion` and `tool` all use radii off
our scale. The palette rule is not cosmetic — `docs/design.md` fills exactly two
things, `primary` and `destructive`.

Fix them in our copies, and write down the re-patch ritual, because a later
`add` overwrites the file silently.

**B4 — The strings are English and bypass `locale-provider`.** Roughly 30
user-facing strings across 10 of the 23 vendored files — `context` (6),
`message` (6), `prompt-input` (6), `open-in-chat` (5), `web-preview` (3), and
singles elsewhere. `conversation.tsx` already reads `useMessages()`; it is the
pattern for the rest. New keys go in `apps/app/lib/messages/agent-builder-*.ts`.

Count B3 and B4 together and they are the bulk of this plan's cost, and they
recur on every upstream pull.

## Phases

Each is T2 — `apps/app` and `packages/ui`, no T3 path — so each runs through
`/feature-loop:feature-loop` on its own.

### Phase 0 — Adapter, patches, strings

B2, B3, B4 above, plus the B1 measurement. Nothing user-visible ships.
**Proof:** the five gate commands; the adapter has unit tests against real eve
payloads (`test/agent-transcript.spec.ts` already has fixtures); a written note
of which vendored files now diverge from upstream and why.

### Phase 1 — The transcript spine

`Conversation` replaces `MessageScroller` in both surfaces. `Message` /
`MessageContent` / `MessageResponse` replace the hand-rolled bubble at
`chat:816` and the mixed pair in `agent-panel.tsx`. `MessageActions` replaces
`ResponseActions`. `ThinkingIndicator` stays — it is already `DotMatrix` +
`Shimmer` and already localised, and the `Loader` that would have replaced it is
an orphan (below). `ai-elements/loader.tsx` is deleted in this phase.

This also closes the defect both plans agree on: `agent-panel.tsx` currently
mixes two `Message` families, and its shadcn `MessageAvatar` is written for a
`group/message` that the AI Elements `Message` never declares.

**Proof:** gate commands; both surfaces side by side, light and dark; the
transcript profile from B1 re-run at 500 turns and compared to the baseline.

### Phase 2 — Tool steps

`Tool` / `ToolHeader` / `ToolContent` / `ToolOutput` replace `AgentToolStep`,
fed by the B2 adapter. Depends on B3 — do not ship the raw palette.

**Proof:** gate commands; every eve tool kind rendered, including the `warning`
tone and the error text path.

### Phase 3 — The composer

The `PromptInput` family replaces `agent-composer.tsx`. This is the largest
single swap in the plan and the one most likely to lose behaviour: the current
composer carries CRM resource chips, a command type, stored-vs-upload attachment
variants and a `SkeletonSwap` search. `PromptInputCommand*` and
`PromptInputActionMenu*` are the intended homes, but that has to be proven, not
assumed.

**Proof:** gate commands, plus a behaviour list checked one by one against the
old composer — mention picking, command type, attachment upload and removal,
submit-on-enter, disabled states, error toasts.

### Phase 4 — Attachments

`PromptInputAttachments` in the composer, `MessageAttachments` in the
transcript. Retire `chat-chips.tsx`'s `ChatAttachmentChip` and, with it, the
last use of shadcn `Attachment`. Fetch the standalone `attachments` component
only if a grid view is actually wanted.

### Phase 5 — Sources and citations *(can be pulled forward)*

`lib/agent-transcript.ts` already exports `sourcesOf(part)` returning
`{ url, title, network }[]`, and `test/agent-transcript.spec.ts` covers it in
three cases. **No screen renders it.** eve is doing research whose provenance
the rep cannot see.

`Sources` + `SourcesTrigger` + `Source` under an assistant turn, and
`InlineCitation` where a claim carries one. This is the phase that makes the
plan pay for itself, and it does not depend on phases 1–4 — it can be pulled
forward and shipped on the current stack. Citations are one of the two growth
areas the decision named, so pulling it forward is the default, not an option.

### Phase 6 — Agent cards

`BuildingAgentCard`, `ReviewAgentCard`, `DeployedAgentCard` and
`BuilderFailureCard` (`chat:1075`–`1499`) onto `Plan`, `Artifact` and `Task`.
The shapes are close but not identical; expect this phase to end with one of
them staying custom.

### Phase 7 — Retire what is replaced

Delete from `@crm/ui`, and only once nothing imports them: `bubble.tsx` (never
used), `message-scroller.tsx`, `attachment.tsx`, `markdown.tsx`,
`suggestion.tsx`, and `message.tsx` **except `MessageAvatar`**, which
`docs/chat-ui.md` names as a permanent exception.

`markdown.tsx` goes because Rule 3 gives markdown one answer, `MessageResponse`.
It is the themed renderer today and `MessageResponse` is not, so B3/B4 must have
moved its type, code, table and blockquote rules onto `MessageResponse` before
this phase — otherwise the transcript regresses to Vercel's prose defaults.

Staying, and worth checking one by one before the delete: `thinking-indicator.tsx`
(the `loader` that would have replaced it is an orphan), `thread-message.tsx`
(email timeline), `marker.tsx` (`agent-panel`), `questionnaire.tsx`. Dropping
`message-scroller` does **not** drop `@shadcn/react` — `questionnaire.tsx`
imports it too.

**Proof:** `bun run lint:dead`, `bun run build`.

### Phase 8 — Make `lint:dead` able to see an orphan

Without this the tree silently refills, which is how 20 unreachable AI Elements
files accumulated in the first place. `knip.json` declares `packages/ui`'s entry
as `src/components/**/*.tsx`, making every component its own entry point, so an
orphan is unreportable by construction.

Settle an experiment first, not a preference: **does knip resolve
`@crm/ui/components/x` from `apps/app` through the workspace `exports` map?**
Narrow the entry to `src/components/*.tsx` on a scratch branch and read the
report.

- If it resolves, that narrowing is the fix, with `ai-elements/**` in `project`
  and out of `entry`.
- If it does not, the entry glob is load-bearing against false positives and
  stays. The guard is then a checker in `tools/` that fails on any
  `src/components/ai-elements/*.tsx` no `apps/**` file imports transitively.

A new gate task must be declared in `.githooks/gate-shape.json` or
`scripts/verify-gate-shape.mjs` bites on the next push.

This phase would also have caught `loader.tsx`.

## The cost, stated plainly

- 109 KB of TSX rewritten across six files.
- A permanent adapter between eve's transcript and the AI SDK's types.
- Local divergence in 8-plus vendored files for palette, radius and strings,
  re-applied on every upstream pull. `CLAUDE.md` calls fork cost the largest
  long-term expense in this repo; this plan buys a second one inside
  `packages/ui`.
- One capability lost unless patched: transcript virtualization (B1).
- Two shadcn components that were added and would now be deleted unused
  (`bubble`) or near-unused (`attachment`).

Against that: one coherent family for everything AI-shaped, upstream keeps
shipping into it, and 21 vendored files stop being dead weight.

## The decision, made

Gate Đáng was answered on 2026-09-09: the chat grows citations and artifacts.
That settles the boundary, and `docs/chat-ui.md` now carries it — including the
standing rule that AI Elements is searched before anything new is built, that
installs go through the CLI, and that one job has one component across both chat
surfaces.

Two consequences for sequencing:

- **Phase 5 can be pulled forward.** Sources are parsed, tested and invisible
  today. Nothing in phases 0–4 gates them, and the decision has already named
  citations as a growth area.
- **Phase 0 is not optional.** B1–B4 are the price of the direction, not
  preparation that can be skipped to reach a visible phase sooner. B3 and B4
  recur on every upstream pull, and `docs/chat-ui.md` carries the re-patch
  ritual they create.

## The orphan found during planning

`ai-elements/loader.tsx` is vendored and is **not** among the 48 components
upstream ships — it was dropped from the registry. It is a file that will never
receive a fix.

It is also the first thing the new Rule 1 catches: the plan's earlier draft had
`Loader` replacing `ThinkingIndicator`, which would have migrated a live,
localised component onto a dead one. Check the register, not the folder.
