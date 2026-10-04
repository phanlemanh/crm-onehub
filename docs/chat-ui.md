# Chat and AI surfaces — read before touching any agent chat UI

**Decided 2026-09-09: AI Elements owns the chat.** The chat is expected to grow
citations and artifacts, so the family that already ships those wins the whole
surface rather than half of it. `docs/plan/chat-ai-elements-rebuild.md` is the
migration. `docs/plan/chat-ui-alignment.md` is the branch not taken; it is kept
because its audit is still accurate, not as a plan to execute.

Until that migration lands the tree is mixed, so this file describes the target,
and every change to a chat surface moves toward it — never away.

The AI is named **Kara** on every screen, and the rules for anything Kara says,
proposes or writes outside the conversation — name, mark, approval levels, undo,
states — live in `docs/ai-ux.md`. Read it with this file.

This extends `docs/design.md`. Everything there still holds: the radius scale,
the two filled colours, and no overriding component styles with `className`.

## The boundary

**AI Elements owns the conversation. shadcn owns the room around it.**

| Layer | Owner |
| --- | --- |
| Transcript, bubbles, tool steps, reasoning, composer, attachments, sources, citations, artifacts, plans | **AI Elements** |
| Pages, panels, sidebars, dialogs, sheets, tables, forms, buttons, inputs, menus | **shadcn** |

One family for the conversation is the point. Two families produced two different
user bubbles in the same product — `rounded-lg bg-secondary` in the record
sheet's Agent tab, hand-rolled `rounded-md bg-muted` in the agent builder — and
an avatar whose positioning rules could never fire because it sat in the other
family's group.

## Rule 1 — Check the register before you build

**Before writing any new chat or AI component, search AI Elements for it.** The
register below is the whole surface, 48 components; `.agents/skills/ai-elements/references/`
holds one page each and is pinned by `skills-lock.json`. Read the local
reference, not the website.

The order is fixed:

1. Is it in the register as adopted? Use it.
2. Is it in the register as available? Take it — that is what "available" means.
3. Is it in the register as not for this product? Then say why the situation
   changed, in the plan or the acceptance contract, before you install it.
4. Only when AI Elements has nothing does a new component get written, and it
   goes in `packages/ui`, never on a page.

"I did not know it existed" is the failure this rule exists to prevent. The
register is short enough to read every time.

## Rule 2 — Install with the CLI, never by hand

From `packages/ui`:

```
bunx --bun ai-elements@latest add <name>
```

shadcn, from the same place:

```
bun run --filter=@crm/ui ui:add <name>
```

Never paste a component out of the docs site. The CLI resolves the component's
own dependencies, writes into the path `components.json` configures, and leaves a
file that a later `add` can update. A hand-copied file is a fork with no origin.

Both families land in `packages/ui`. Never in `apps/app/components`.

## Rule 3 — One vocabulary, so the UX is one UX

Consistency is not a coat of paint on top; it is using the same component for the
same job everywhere. Each row below has exactly one answer, in both chat
surfaces:

| Job | The one answer |
| --- | --- |
| Rendering assistant markdown | `MessageResponse` |
| A message and its bubble | `Message` + `MessageContent` |
| Row of actions under a turn (copy, rate) | `MessageActions` + `MessageAction` |
| Anything that expands — reasoning, a tool call, a source list | `Reasoning` (in tree), plus `Tool` and `Sources` — **fetch first**, see the register |
| Attachment in the transcript | `MessageAttachment` / `MessageAttachments` |
| Attachment in the composer | `PromptInputAttachment` / `PromptInputAttachments` — **fetch first** |
| The composer itself | the `PromptInput` family (in tree) |
| Scrolling the transcript | `Conversation` + `ConversationScrollButton` (in tree) |
| Empty transcript | `ConversationEmptyState` (in tree) |
| Clickable prompt starters | `Suggestions` + `Suggestion` (in tree) |
| Approving a change the AI proposes (accept, edit, reject) | `ProposedChange` in `packages/ui`, built on `Confirmation` |
| "The agent is thinking" | `ThinkingIndicator` — see the orphan note below |

"Fetch first" means the component is the right answer but is **not in the tree
right now** — run the CLI (Rule 2), then wire it into a screen in the same
change. See "What is in the tree today" below: leaving a freshly fetched
component unreachable turns the orphan gate red on the next `bun run test`.

If a surface needs a variation, it becomes a variant of that component in
`packages/ui`. It does not become a second component with the same job.

## The exceptions — what stays shadcn inside the chat

AI Elements has no answer for these. They are not oversights to fix later.

| Need | Component | Why |
| --- | --- | --- |
| Message avatar | `@crm/ui/components/message` → `MessageAvatar` | `ai-elements/message` exports no avatar. This is the one shadcn export that survives the migration. |
| Clarification form | `@crm/ui/components/questionnaire` | `Confirmation` is accept/reject, not a form. |
| CRM results in a transcript | `simple-table`, `empty-cell` | Deal rows are CRM data that happen to appear in chat, not chat furniture. |
| Agent code and diffs | `@pierre/diffs`, `@pierre/trees` | Already owns it. `file-tree`, `sandbox` and `code-block` would be a third family. |

## The register — all 48

A verdict per component. Changing one means editing this table first.

### Adopted — 15

The chat spine plus the two growth areas the decision named. **Adopted is a
verdict about direction, not a claim that the file is on disk** — see the next
section for what is actually in the tree.

`artifact` · `attachments` · `confirmation` · `conversation` · `inline-citation` ·
`message` · `model-selector` · `plan` · `prompt-input` · `reasoning` · `shimmer` ·
`sources` · `suggestion` · `task` · `tool`

`confirmation` moved here on 2026-09-29 (`the-gop-y-okr`): the OKR assistant's
suggestion cards and the contact fact suggestions are approvals of a change the
AI proposes, which is the job `Confirmation` exists for. `ProposedChange` wraps it
so both surfaces share one card. Since `nen-kara` (2026-10-02) that card is the `card` density; the default `inline` density sits under the thing it changes and is built on `Item`, because a bordered `Alert` inside a table or under a field makes three layers of border.

`sources` and `inline-citation` are the highest-value ones and the least
started: `lib/agent-transcript.ts` already exports `sourcesOf()`, it is covered
by three cases in `test/agent-transcript.spec.ts`, and **nothing renders it**.

### What is in the tree today — 8

`packages/ui/src/components/ai-elements/` holds exactly eight files:

| File | Why it is here |
| --- | --- |
| `confirmation.tsx` | imported by `proposed-change.tsx` as the body of its `card` density, which the OKR suggestion column and the contact fact suggestions use; the `inline` density is built on `Item` and does not use it |
| `message.tsx` | imported by the record sheet's Agent tab and the builder |
| `reasoning.tsx` | imported by the builder |
| `shimmer.tsx` | imported by `reasoning.tsx` — no file outside the folder touches it |
| `conversation.tsx` | imported by `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx` (`Conversation`, `ConversationContent`, `ConversationEmptyState`) and by the transcript of the Documents «Ask» tab (`tai-lieu/hoi.tsx`) — the orphan gate's exemption for the scroll measurement is gone (`MIEN_TRU` in `mo-coi.mjs` is empty) |
| `inline-citation.tsx` | trích dẫn của khối Tóm tắt tuần — the weekly summary block on the OKR board cites the KRs and updates behind each sentence. Pulled back by the CLI in `tro-ly-okr-tom-tat`; the card is a `Popover` that opens on click, tap, Enter and Space, and still on hover for a mouse, and the trigger shows a given label instead of a URL hostname. The Documents «Ask» tab uses only `InlineCitationSource` and `InlineCitationQuote`, shown open under each sentence |
| `prompt-input.tsx` | `PromptInput`, `PromptInputBody`, `PromptInputTextarea`, `PromptInputFooter`, `PromptInputTools`, `PromptInputSubmit` — the composer of `okr/soan/hoi-thoai-soan.tsx` and of the Documents «Ask» tab, which goes through `PromptInputProvider` so a failed send keeps the typed question; pulled 2026-09-30 with the CLI; its strings are in `messages.ts` under `promptInput` |
| `suggestion.tsx` | `Suggestions` and `Suggestion` — the answer chips under an assistant question in the OKR drafting chat, and the three starter questions of the empty «Ask» tab (`Suggestions xuongDong` wraps them instead of scrolling); pulled 2026-09-30 with `prompt-input.tsx`. The accept · edit · reject card that once lived at `packages/ui/src/components/suggestion.tsx` is gone (`proposed-change.tsx` replaced it) |

Of the 19 vendored files deleted in the `nen-chat-ai-elements` round, 16 are still
gone — six of them Adopted (`artifact`, `model-selector`, `plan`, `sources`,
`task`, `tool`), the rest Available or Not-for-this-product. `prompt-input` and
`suggestion` were pulled back on 2026-09-30 for the OKR drafting screen, and
`inline-citation` for the weekly summary block; all three are in the table above. None of the 19 was
reachable from `apps/**`, and carrying 21 unreachable files was the cost the round
was opened to remove.

**Two gates now hold this shape, and they pull against each other on purpose:**
the orphan gate (`_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`, running
inside `bun run test`) turns red on any file in this folder that no `apps/**`
file reaches, transitively. So `bunx --bun ai-elements@latest add <name>` and a
commit is **not** a complete change — the component has to reach a screen in
the same change, or the gate blocks the push. That is the intended friction:
the register says which component is right, the gate says it may not sit unused.

### Available — 6

Not installed, no ceremony needed. When the need appears, run the CLI — then
wire it in, per the paragraph above.

| Component | The need |
| --- | --- |
| `chain-of-thought` | Reasoning grows into named steps with results. |
| `context` | Token usage or cost becomes visible. |
| `queue` | Queued messages or todos appear in the transcript. |
| `checkpoint` | A conversation can be rewound to an earlier turn. |
| `image` | eve returns generated images. |
| `agent` | An agent's config renders inside the transcript. |

### Not for this product — 27

Installing one of these needs a written reason first.

- **React Flow canvas (7)** — `canvas`, `connection`, `controls`, `edge`, `node`, `panel`, `toolbar`. There is no node graph here.
- **Voice, audio, avatar (6)** — `audio-player`, `mic-selector`, `speech-input`, `transcription`, `voice-selector`, `persona`. The chat is text; `persona` also pulls Rive.
- **Coding-agent tooling (10)** — `commit`, `environment-variables`, `package-info`, `sandbox`, `schema-display`, `snippet`, `stack-trace`, `terminal`, `test-results`, `jsx-preview`.
- **Owned elsewhere (2)** — `file-tree`, `code-block`. See the exceptions table.
- **Never (1)** — `open-in-chat`. It hands a query to ChatGPT, Claude or v0. Internal CRM data does not leave.
- **Not applicable (1)** — `web-preview`. Previews generated UI; nothing here generates UI.

## The orphan — `loader`

`loader.tsx` was vendored and **is not in the 48**. Upstream dropped it. It was
deleted in the `nen-chat-ai-elements` round along with the other unreachable
files, so it is no longer in the tree. Do not build on it; it will never receive a fix.

This is why Rule 1 says check the register rather than the folder: a file being
present is not evidence that it is supported. `ThinkingIndicator` —
`DotMatrix` + `Shimmer`, already localised — is the answer for a pending state.
`loader.tsx` is deleted in the migration.

## Local divergence, and re-applying it

Several vendored files need edits to satisfy `docs/design.md` and
`locale-provider`. The counts below are for the six files other than `prompt-input` and
`suggestion`, which carry their own entries in the ledger;
the divergence ledger of record is
`_acceptance/nen-chat-ai-elements/so-lech-chuan.md`, which carries one entry per
file with a fingerprint of the diverging lines:

- 18 English strings routed through `packages/ui/src/lib/messages.ts` — `message`
  (10), `reasoning` (4), `conversation` (2), `inline-citation` (2). They arrive in **four shapes**: text
  between tags, display attributes, parameter defaults, and intermediate
  variables. A scan that lists syntax shapes misses a new one every time; the
  string gate uses a closed allow-list instead.
- 4 radii off our scale, all `rounded-full`, in `message` and `conversation`.
- 0 raw palette colours — all six lived in `tool` and `web-preview`, both deleted.
- 2 CSS properties added to `ConversationContent` so it drops off-screen layout
  the way `MessageScroller` does. Without them the transcript at 500 turns is
  **32× slower**; measured in a real browser, not a hand-copied page.
- `confirmation` drops its four upstream `//` comments and the `className` that
  resized `ConfirmationAction`; it uses the `sm` size of `Button` instead. It was
  pulled in a scratch directory with this repo's `components.json`, because
  running `add` in `packages/ui` stops to ask about overwriting `alert.tsx` and
  `button.tsx`.
- `prompt-input` and `suggestion` (pulled 2026-09-30): the English strings of
  `prompt-input` go through `packages/ui/src/lib/messages.ts` (`promptInput`), its
  upstream comments are dropped, and `suggestion` loses its `rounded-full` so the radius
  stays on the scale of `docs/design.md`. Each has its own entry in
  `_acceptance/nen-chat-ai-elements/so-lech-chuan.md`.
- `inline-citation` swaps `HoverCard` for `Popover` so the card opens on click,
  tap and keyboard, takes `nhan` instead of deriving a hostname from `sources`,
  drops the upstream `rounded-full` on the trigger rather than replacing it,
  names the card with `aria-label`, and uses `Button` and Carbon icons for its
  previous and next controls.

Whichever files a later phase pulls back in bring their own divergences, and
they belong in that same ledger.

Those edits are a fork inside `packages/ui`, so:

- Record every diverged file and what was changed to it, in the migration plan.
- **Re-running `add` on a diverged file overwrites it silently.** Re-apply, then
  diff before committing.
- Fix it upstream where the fix is general — `CLAUDE.md` is explicit that fork
  cost is the largest long-term expense in this repo.

## What must not happen

- A new component under `apps/app/components` doing a job the register covers.
- A component pasted from the docs site instead of installed by the CLI.
- A second component for a job Rule 3 already assigns.
- `className` undoing a component's padding, radius or colour. That means the
  wrong component, or a variant owed to `packages/ui`.
- A chat change that moves away from the target boundary because the tree is
  still mixed. Mixed is the state being left, not a licence.
