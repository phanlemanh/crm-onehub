# Chat and AI surfaces — read before touching any agent chat UI

**Decided 2026-09-09: AI Elements owns the chat.** The chat is expected to grow
citations and artifacts, so the family that already ships those wins the whole
surface rather than half of it. `docs/plan/chat-ai-elements-rebuild.md` is the
migration. `docs/plan/chat-ui-alignment.md` is the branch not taken; it is kept
because its audit is still accurate, not as a plan to execute.

Until that migration lands the tree is mixed, so this file describes the target,
and every change to a chat surface moves toward it — never away.

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
| Anything that expands — reasoning, a tool call, a source list | `Reasoning`, `Tool`, `Sources`. Never a hand-rolled chevron. |
| Attachment in the transcript | `MessageAttachment` / `MessageAttachments` |
| Attachment in the composer | `PromptInputAttachment` / `PromptInputAttachments` |
| The composer itself | the `PromptInput` family |
| Scrolling the transcript | `Conversation` + `ConversationScrollButton` |
| Empty transcript | `ConversationEmptyState` |
| Clickable prompt starters | `Suggestions` + `Suggestion` |
| "The agent is thinking" | `ThinkingIndicator` — see the orphan note below |

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

### Adopted — 14

The chat spine plus the two growth areas the decision named.

`artifact` · `attachments` · `conversation` · `inline-citation` · `message` ·
`model-selector` · `plan` · `prompt-input` · `reasoning` · `shimmer` · `sources` ·
`suggestion` · `task` · `tool`

`sources` and `inline-citation` are the highest-value ones and the least
started: `lib/agent-transcript.ts` already exports `sourcesOf()`, it is covered
by three cases in `test/agent-transcript.spec.ts`, and **nothing renders it**.

### Available — 7

Not installed, no ceremony needed. When the need appears, run the CLI.

| Component | The need |
| --- | --- |
| `chain-of-thought` | Reasoning grows into named steps with results. |
| `confirmation` | A tool call needs the rep to approve it first. |
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

`packages/ui/src/components/ai-elements/loader.tsx` is vendored and **is not in
the 48**. Upstream dropped it. Do not build on it; it will never receive a fix.

This is why Rule 1 says check the register rather than the folder: a file being
present is not evidence that it is supported. `ThinkingIndicator` —
`DotMatrix` + `Shimmer`, already localised — is the answer for a pending state.
`loader.tsx` is deleted in the migration.

## Local divergence, and re-applying it

Several vendored files need edits to satisfy `docs/design.md` and
`locale-provider`: raw palette colours in `tool` and `web-preview`, radii off our
scale in seven files, and roughly 30 English strings across ten files.
`conversation.tsx` already reads `useMessages()` and is the pattern.

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
