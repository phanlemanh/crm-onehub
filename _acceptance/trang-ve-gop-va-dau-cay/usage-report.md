### S4 round 1 — wf_d59e938e-250 (30 agent, 48,065 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 16,415 | 6 | 115,341 | 108 |
| review:measurement | claude-opus-5-5 | 9 | 4,005 | 18 | 469,085 | 166 |
| triage | claude-sonnet-5-5 | 2 | 3,995 | 4 | 31,597 | 43 |
| judge:E14:operational-feasibility | claude-sonnet-5-5 | 2 | 3,511 | 4 | 29,166 | 32 |
| review:bugs | claude-opus-5-5 | 17 | 2,817 | 34 | 1,007,109 | 249 |
| judge:E14:domain-correctness | claude-sonnet-5-5 | 2 | 2,593 | 4 | 25,636 | 25 |
| judge:E14:spec-alignment | claude-sonnet-5-5 | 2 | 2,552 | 4 | 29,164 | 29 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,907 | 4 | 28,793 | 163 |
| review:conventions | claude-opus-5-5 | 15 | 1,165 | 30 | 756,283 | 270 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,087 | 4 | 28,777 | 9 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 1,050 | 4 | 28,897 | 53 |
| refute:trang-ve-gop.mjs | claude-sonnet-5-5 | 7 | 998 | 16 | 194,491 | 35 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 646 | 4 | 28,815 | 222 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 645 | 4 | 28,775 | 35 |
| refute:trang-ve-gop.mjs | claude-sonnet-5-5 | 4 | 600 | 8 | 90,582 | 23 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 518 | 4 | 33,512 | 51 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 509 | 4 | 28,813 | 145 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 306 | 4 | 28,832 | 72 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 303 | 4 | 3,057 | 318 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 302 | 4 | 3,057 | 325 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 265 | 4 | 28,814 | 7 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 248 | 4 | 28,813 | 55 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 229 | 4 | 28,817 | 31 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 227 | 4 | 28,817 | 12 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 225 | 4 | 28,816 | 20 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 204 | 4 | 28,815 | 24 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 204 | 4 | 28,831 | 14 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 202 | 4 | 28,818 | 20 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 190 | 4 | 28,771 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 147 | 4 | 24,510 | 8 |


wall: 1147s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 518 | 33,512 | 51 | 13:03:03 | 13:03:54 |
| machine | 18 | 8,749 | 467,128 | 944 | 13:03:03 | 13:18:47 |
| judge | 3 | 8,656 | 83,966 | 37 | 13:03:20 | 13:03:57 |
| review | 3 | 7,987 | 2,232,477 | 270 | 13:03:29 | 13:07:59 |
| triage | 1 | 3,995 | 31,597 | 43 | 13:18:49 | 13:19:32 |
| refute | 2 | 1,598 | 285,073 | 35 | 13:19:34 | 13:20:10 |
| capture | 1 | 147 | 24,510 | 8 | 13:20:12 | 13:20:21 |
| synthesize | 1 | 16,415 | 115,341 | 108 | 13:20:23 | 13:22:11 |

- **claude-sonnet-5-5**: 9 agent · 26 calls · out 31,329 · in 54 · cache_read 573,999 · cache_create 360,508
- **claude-opus-5-5**: 3 agent · 41 calls · out 7,987 · in 82 · cache_read 2,232,477 · cache_create 251,958
- **claude-haiku-5-5**: 18 agent · 36 calls · out 8,749 · in 72 · cache_read 467,128 · cache_create 528,014

