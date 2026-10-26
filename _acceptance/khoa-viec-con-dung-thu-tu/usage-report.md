### S4 round 1 — wf_606ff179-140 (23 agent, 27,100 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 6,753 | 10 | 194,640 | 42 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,091 | 4 | 30,334 | 78 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,945 | 4 | 30,347 | 21 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,873 | 4 | 30,304 | 319 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,850 | 4 | 0 | 456 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,528 | 4 | 30,279 | 12 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,279 | 4 | 30,277 | 33 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,238 | 4 | 30,337 | 21 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,080 | 4 | 30,338 | 19 |
| judge:E5:domain-correctness | claude-sonnet-5-5 | 3 | 1,043 | 6 | 60,539 | 11 |
| judge:E5:operational-feasibility | claude-sonnet-5-5 | 3 | 1,014 | 6 | 64,009 | 17 |
| judge:E5:spec-alignment | claude-sonnet-5-5 | 3 | 995 | 6 | 64,005 | 13 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 818 | 4 | 30,341 | 28 |
| review:conventions | claude-opus-5-5 | 11 | 742 | 22 | 463,354 | 56 |
| machine:node _acceptance/khoa-viec-con-dung-thu- | claude-haiku-5-5 | 2 | 464 | 4 | 30,316 | 45 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 433 | 4 | 2,973 | 419 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 382 | 4 | 30,273 | 8 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 324 | 4 | 30,350 | 17 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 314 | 4 | 30,352 | 17 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 294 | 4 | 32,965 | 59 |
| review:bugs | claude-opus-5-5 | 11 | 293 | 22 | 515,582 | 84 |
| review:measurement | claude-opus-5-5 | 8 | 199 | 16 | 372,411 | 115 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 26,098 | 9 |


wall: 1391s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 294 | 32,965 | 59 | 07:24:29 | 07:25:28 |
| machine | 14 | 15,619 | 366,821 | 1336 | 07:24:29 | 07:46:45 |
| judge | 3 | 3,052 | 188,553 | 19 | 07:24:29 | 07:24:47 |
| review | 3 | 1,234 | 1,351,347 | 116 | 07:24:29 | 07:26:24 |
| capture | 1 | 148 | 26,098 | 9 | 07:46:47 | 07:46:56 |
| synthesize | 1 | 6,753 | 194,640 | 42 | 07:46:58 | 07:47:40 |

- **claude-sonnet-5-5**: 6 agent · 18 calls · out 10,247 · in 36 · cache_read 442,256 · cache_create 232,646
- **claude-haiku-5-5**: 14 agent · 28 calls · out 15,619 · in 56 · cache_read 366,821 · cache_create 472,450
- **claude-opus-5-5**: 3 agent · 30 calls · out 1,234 · in 60 · cache_read 1,351,347 · cache_create 196,725

