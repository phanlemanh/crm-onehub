### S4 round 1 — wf_cd023528-30b (16 agent, 43,214 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 14 | 7,224 | 28 | 1,811,040 | 97 |
| review:measurement | claude-opus-5-5 | 7 | 5,939 | 14 | 830,283 | 72 |
| synthesize:report | claude-sonnet-5-5 | 3 | 5,146 | 6 | 268,628 | 39 |
| review:bugs | claude-opus-5-5 | 8 | 3,470 | 16 | 976,104 | 48 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,318 | 18 | 121,285 | 48 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 6 | 2,923 | 50 | 522,447 | 377 |
| baseline:diffBase | claude-sonnet-5-5 | 5 | 2,736 | 10 | 500,507 | 35 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 2,282 | 18 | 121,285 | 29 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,001 | 18 | 92,234 | 206 |
| triage | claude-sonnet-5-5 | 2 | 1,836 | 4 | 120,032 | 18 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,491 | 18 | 121,332 | 69 |
| machine:node ${CLAUDE_PLUGIN_ROOT:-$(node script | claude-haiku-4-5-20251001 | 2 | 1,456 | 18 | 121,374 | 17 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,105 | 18 | 121,300 | 177 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,014 | 18 | 121,352 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 908 | 18 | 121,283 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 365 | 4 | 117,006 | 10 |


wall: 986s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,736 | 500,507 | 35 | 12:13:15 | 12:13:50 |
| machine | 9 | 16,498 | 1,463,892 | 919 | 12:13:15 | 12:28:34 |
| review | 3 | 16,633 | 3,617,427 | 97 | 12:13:15 | 12:14:52 |
| triage | 1 | 1,836 | 120,032 | 18 | 12:28:34 | 12:28:52 |
| capture | 1 | 365 | 117,006 | 10 | 12:28:52 | 12:29:02 |
| synthesize | 1 | 5,146 | 268,628 | 39 | 12:29:02 | 12:29:41 |

- **claude-opus-5-5**: 3 agent · 29 calls · out 16,633 · in 58 · cache_read 3,617,427 · cache_create 367,719
- **claude-sonnet-5-5**: 4 agent · 12 calls · out 10,083 · in 24 · cache_read 1,006,173 · cache_create 525,309
- **claude-haiku-4-5-20251001**: 9 agent · 22 calls · out 16,498 · in 194 · cache_read 1,463,892 · cache_create 659,806

