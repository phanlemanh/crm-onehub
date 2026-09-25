### S4 round 1 — wf_2ebbda17-f76 (17 agent, 58,375 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 5 | 13,923 | 10 | 415,732 | 135 |
| review:measurement | claude-opus-5-5 | 9 | 9,841 | 18 | 888,199 | 111 |
| review:bugs | claude-opus-5-5 | 9 | 7,987 | 18 | 874,452 | 94 |
| baseline:diffBase | claude-sonnet-5 | 20 | 7,904 | 40 | 1,866,265 | 121 |
| review:conventions | claude-opus-5-5 | 8 | 6,052 | 16 | 744,643 | 75 |
| machine:bun run test | claude-haiku-4-5-20251001 | 7 | 2,414 | 58 | 373,105 | 101 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,307 | 18 | 82,131 | 21 |
| machine:node _acceptance/zalo-webhook-doc-khuon- | claude-haiku-4-5-20251001 | 3 | 1,076 | 26 | 143,588 | 17 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,067 | 18 | 82,091 | 16 |
| triage | claude-sonnet-5 | 2 | 1,042 | 4 | 84,903 | 14 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 916 | 18 | 82,091 | 14 |
| capture:provenance | claude-sonnet-5 | 2 | 900 | 4 | 83,095 | 12 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 873 | 18 | 82,048 | 13 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 812 | 18 | 82,091 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 810 | 18 | 82,048 | 21 |
| machine:node _acceptance/zalo-webhook-doc-khuon- | claude-haiku-4-5-20251001 | 2 | 807 | 18 | 82,076 | 12 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 644 | 18 | 82,046 | 11 |


wall: 306s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 7,904 | 1,866,265 | 121 | 23:13:07 | 23:15:08 |
| machine | 10 | 10,726 | 1,173,315 | 145 | 23:13:07 | 23:15:32 |
| review | 3 | 23,880 | 2,507,294 | 113 | 23:13:07 | 23:15:00 |
| triage | 1 | 1,042 | 84,903 | 14 | 23:15:32 | 23:15:46 |
| capture | 1 | 900 | 83,095 | 12 | 23:15:46 | 23:15:58 |
| synthesize | 1 | 13,923 | 415,732 | 135 | 23:15:58 | 23:18:13 |

- **claude-sonnet-5**: 4 agent · 29 calls · out 23,769 · in 58 · cache_read 2,449,995 · cache_create 430,509
- **claude-opus-5-5**: 3 agent · 26 calls · out 23,880 · in 52 · cache_read 2,507,294 · cache_create 324,604
- **claude-haiku-4-5-20251001**: 10 agent · 26 calls · out 10,726 · in 228 · cache_read 1,173,315 · cache_create 422,653

