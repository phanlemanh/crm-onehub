### S4 round 1 — wf_94e5ce9b-66e (19 agent, 18,984 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 4,123 | 8 | 328,224 | 34 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,947 | 4 | 125,065 | 240 |
| review:measurement | claude-opus-5-5 | 13 | 1,590 | 26 | 1,434,832 | 123 |
| triage | claude-sonnet-5-5 | 2 | 1,551 | 4 | 92,179 | 14 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,516 | 4 | 125,107 | 71 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,490 | 4 | 125,056 | 246 |
| machine:bun _acceptance/buoc-kara-bo-qua/rang/bo | claude-haiku-5-5 | 2 | 1,023 | 4 | 125,120 | 14 |
| baseline:diffBase | claude-sonnet-5-5 | 7 | 995 | 14 | 588,870 | 47 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 948 | 4 | 125,052 | 10 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 947 | 4 | 125,050 | 33 |
| review:bugs | claude-opus-5-5 | 21 | 840 | 42 | 2,443,125 | 136 |
| machine:bash _acceptance/buoc-kara-bo-qua/rang/c | claude-haiku-5-5 | 2 | 619 | 4 | 125,173 | 14 |
| review:conventions | claude-opus-5-5 | 12 | 268 | 24 | 1,221,277 | 82 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 252 | 4 | 125,040 | 202 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 200 | 4 | 125,094 | 8 |
| machine:cd apps/app && bun test ./test/agent-tra | claude-haiku-5-5 | 2 | 180 | 4 | 125,070 | 7 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 177 | 4 | 125,089 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 168 | 4 | 125,046 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 89,130 | 7 |


wall: 887s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 995 | 588,870 | 47 | 01:51:54 | 01:52:42 |
| machine | 12 | 9,467 | 1,500,962 | 825 | 01:51:54 | 02:05:39 |
| review | 3 | 2,698 | 5,099,234 | 138 | 01:51:54 | 01:54:12 |
| triage | 1 | 1,551 | 92,179 | 14 | 02:05:41 | 02:05:55 |
| capture | 1 | 150 | 89,130 | 7 | 02:05:59 | 02:06:06 |
| synthesize | 1 | 4,123 | 328,224 | 34 | 02:06:08 | 02:06:41 |

- **claude-sonnet-5-5**: 4 agent · 15 calls · out 6,819 · in 30 · cache_read 1,098,403 · cache_create 413,334
- **claude-haiku-5-5**: 12 agent · 24 calls · out 9,467 · in 48 · cache_read 1,500,962 · cache_create 741,090
- **claude-opus-5-5**: 3 agent · 46 calls · out 2,698 · in 92 · cache_read 5,099,234 · cache_create 318,432

