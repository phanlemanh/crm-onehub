# Plan — Chat UI alignment *(not taken)*

> **Rejected 2026-09-09.** The Gate Đáng chose the opposite direction: the chat
> grows citations and artifacts, so AI Elements takes the whole conversation. The
> live plan is `docs/plan/chat-ai-elements-rebuild.md` and the rule is
> `docs/chat-ui.md`.
>
> This file is kept for its audit, which is still accurate and which the chosen
> plan builds on — findings F1, F3, F4 and F6 describe defects that exist under
> either direction. Do not execute the phases below; they move the code the
> wrong way.

It proposed bringing the two chat surfaces onto the boundary "shadcn owns the
room, AI Elements owns what happens in it". Neither surface followed it, and
they disagreed with each other on screen.

The two surfaces are the agent builder (`/[slug]/chat/[chatId]`,
`components/agent-builder/`) and the record sheet's Agent tab
(`components/crm/agent-panel.tsx`, see `docs/agent-panel.md`).

Every phase below is T2 — it touches `apps/app` and `packages/ui`, none of the
T3 paths — so each one runs through `/feature-loop:feature-loop` on its own.
They are ordered by dependency; phases 1 and 2 are independent of each other.

## Audit

### Reach

23 of the 48 AI Elements components are vendored. Two are reachable from a call
site:

| File | Importers |
| --- | --- |
| `ai-elements/message.tsx` | `agent-panel.tsx`, `agent-builder-chat.tsx` |
| `ai-elements/reasoning.tsx` | `agent-builder-chat.tsx` |
| `ai-elements/shimmer.tsx` | `reasoning.tsx` only (never a call site) |

The other 20 have no importer at all: `artifact`, `chain-of-thought`,
`checkpoint`, `code-block`, `confirmation`, `context`, `conversation`, `image`,
`inline-citation`, `loader`, `model-selector`, `open-in-chat`, `plan`,
`prompt-input`, `queue`, `sources`, `suggestion`, `task`, `tool`, `web-preview`.

`bun run lint:dead` cannot report them: `knip.json` declares `packages/ui`'s
entry as `src/components/**/*.tsx`, which makes every component file its own
entry point, so an orphan component is unreportable by construction.

### Findings

**F1 — Two `Message` families in one file, and the avatar is silently wrong.**
`agent-panel.tsx` imports `Message`, `MessageContent`, `MessageResponse` from
`ai-elements/message` (lines 10–14) and `MessageAvatar` from
`@crm/ui/components/message` (line 36). The shadcn avatar is written against
`group/message` and `data-[slot=message-footer]`; the AI Elements `Message`
declares a bare `group` and `.is-user`/`.is-assistant`. Its
`group-has-data-[slot=message-footer]/message:-translate-y-8` rule can never
fire. It renders; it just stopped meaning anything.

**F2 — The same bubble, two designs.** AI Elements `MessageContent` hardcodes
`rounded-lg bg-secondary px-4 py-3` for the user role, so the Agent tab renders
one bubble; `agent-builder-chat.tsx:846` hand-rolls `rounded-md bg-muted px-3
py-2.5 … sm:px-3.5 sm:py-3` for the other. Same product, same object, two looks.
`rounded-lg` on a bubble also contradicts `docs/design.md` — `rounded-lg` is for
surfaces that contain controls.

**F3 — The conversation width re-types a token that already exists.**
`globals.css:94` defines `--container-sheet: 640px`, and
`agent-builder/new-agent-dialog.tsx:108` already consumes it correctly as
`sm:max-w-(--container-sheet)`. Four call sites in the same feature ignore it:

| Where | Literal |
| --- | --- |
| `agent-builder-chat.tsx:846` | `sm:max-w-[620px]` |
| `agent-builder-chat.tsx:910` | `max-w-[640px]` |
| `agent-builder-chat.tsx:1281` | `max-w-[640px]` |
| `agent-builder-route-fallback.tsx:44` | `max-w-[640px]` |

Three files, two values, 20px of drift, and the skeleton in the fallback is
sized by a fourth copy of the number.

**F4 — The themed markdown renderer has zero users.**
`@crm/ui/components/markdown` is `Streamdown` tuned to our type scale, code,
table and blockquote rules. Nothing imports it. Both chat surfaces render
markdown through `MessageResponse` from `ai-elements/message`, which is the same
`Streamdown` with Vercel's prose defaults.

**F5 — Chat shapes live in `apps/app`, not `packages/ui`.**
`AgentToolStep` (`agent-builder-chat.tsx:635`) and `FollowUpTranscriptItem`
(:969) are reusable shapes — a tool-step row and a follow-up callout — built from
raw divs on a page. `docs/design.md` puts shared UI in `packages/ui`.

Note that `AgentToolStep`'s colours are already right (`text-warning`,
`text-ring`, `DotMatrix`). It is in the wrong package, not the wrong shape — and
it must **not** be replaced by AI Elements `tool`, which ships `text-green-600`,
`text-red-600`, `text-yellow-600`, a `rounded-full` badge and English strings
past `locale-provider`. See the register in `docs/chat-ui.md`.

**F6 — Arbitrary Tailwind on chat surfaces.** Beyond F3:
`agent-builder-chat.tsx:1413` `gap-[18px]` (off the 4px scale entirely),
`agent-builder-chat.tsx:655` `pl-[22px]` (hand-aligning text under an icon —
the component's job), `agent-composer.tsx:506` `min-h-[78px]`.

**F7 — Two files carry most of the weight.** `agent-builder-chat.tsx` is 44 KB
and declares 17 components; `agent-composer.tsx` is 42 KB. Every finding above
compounds because the shapes have nowhere to go.

## The plan

### Phase 1 — One `Message` family, one markdown renderer

Closes F1, F2, F4.

- `agent-panel.tsx`: drop `Message` and `MessageContent` from `ai-elements`; use
  `@crm/ui/components/message` (`Message align="end"|"start"`, `MessageContent`)
  with `Bubble` / `BubbleContent` for the user turn. `MessageAvatar` then sits
  inside the group it was written for and F1 closes by construction.
- `agent-builder-chat.tsx`: `UserSubmission` (816–888) stops hand-rolling its
  bubble and uses the same `Message` + `Bubble variant="muted"` pair.
- Both files: `MessageResponse` → `Markdown` from `@crm/ui/components/markdown`.
- `ai-elements/message.tsx` loses its last importer here. It is deleted in
  phase 4, not now — one concern per phase.

`Bubble` is currently in the tree with no users, so this phase is also what
justifies it having been added.

**Proof.** The five gate commands, plus both surfaces side by side on a running
app — the user bubble must be identical in the builder and the Agent tab, in
light and dark. `cd apps/api && bun run dev:session <email>` for a session
without OAuth; `apps/app` on 3000.

### Phase 2 — The conversation column becomes one token

Closes F3 and F6.

- Replace the four literals with `max-w-(--container-sheet)`, matching
  `new-agent-dialog.tsx:108`. If 640px is wrong for a transcript, add
  `--container-chat` next to it in `globals.css` and use that — but the number
  is declared once either way.
- `gap-[18px]` → the nearest scale step. `min-h-[78px]` → the scale, or a
  composer size variant in `packages/ui`. `pl-[22px]` moves into the component
  in phase 3.

**Proof.** Gate commands, plus a grep that finds no `max-w-[` in
`components/agent-builder/` or `components/crm/agent-panel.tsx`.

### Phase 3 — Lift the chat shapes into `packages/ui`

Closes F5, finishes F6, starts on F7.

- `AgentToolStep` → `@crm/ui/components/agent-tool-step`, carrying its own icon
  alignment so `pl-[22px]` disappears rather than moving.
- `FollowUpTranscriptItem`'s callout → either shadcn `Marker` (already used in
  `agent-panel.tsx:35`) or a `@crm/ui` component if `Marker` does not fit.
- Neither is replaced by an AI Elements component. Record why in the component
  file's neighbourhood, not in a code comment — the repo forbids those.

**Proof.** Gate commands. `agent-builder-chat.tsx` should lose 51 lines
and two of its 17 local components.

### Phase 4 — Delete what nothing imports

Closes the reach finding.

After phases 1–3, `ai-elements/` should hold `reasoning.tsx` and `shimmer.tsx`
and nothing else. Delete the other 21 files.

Then drop the `@crm/ui` dependencies that existed only for them — each verified
by the build, not by assumption:

| Dependency | Last importer after deletion |
| --- | --- |
| `shiki` | none (`ai-elements/code-block.tsx`) — `streamdown` brings its own |
| `tokenlens` | none (`ai-elements/context.tsx`) |
| `nanoid` | none (`ai-elements/prompt-input.tsx`) |
| `use-stick-to-bottom` | none (`ai-elements/conversation.tsx`) |
| `motion` | **keep** — `shimmer.tsx`, `skeleton-swap.tsx`, `async-action.tsx` |
| `streamdown` | **keep** — `markdown.tsx`, `ai-elements/reasoning.tsx` |

Deleting is cheap to reverse: `bunx --bun ai-elements@latest add <name>` brings
any of them back, and `docs/chat-ui.md` says under what condition that is allowed.

**Proof.** Gate commands, `bun run lint:dead`, and `bun run build` — the last one
is what actually catches a dropped dependency, which is why it joined the gate.

### Phase 5 — Make `lint:dead` able to see this next time

Without this, the tree silently refills.

The question to settle first is an experiment, not a decision: **does knip
resolve `@crm/ui/components/x` from `apps/app` through the workspace `exports`
map?** Narrow `packages/ui`'s entry to `src/components/*.tsx` on a scratch branch
and read the report.

- If knip follows the subpath exports, the fix is that narrowing, plus keeping
  `ai-elements/**` in `project` and out of `entry`.
- If it does not, the entry glob is load-bearing against false positives and must
  stay. The guard is then a small checker in `tools/` that walks
  `src/components/ai-elements/*.tsx` and fails on a file no `apps/**` file
  imports transitively.

A new gate task must be declared in `.githooks/gate-shape.json` or
`scripts/verify-gate-shape.mjs` bites on the next push.

## Out of scope

- Splitting `agent-builder-chat.tsx` and `agent-composer.tsx` (F7). Phases 1–3
  shrink them; the split is its own opportunity with its own Gate Đáng.
- Adopting anything from the 13 open rows in `docs/chat-ui.md`. `sources` and
  `inline-citation` are the likely next ones, when eve starts citing.
- The AI Elements `attachments` component. We have shadcn `Attachment`, it is
  richer, and it is already in both surfaces.
