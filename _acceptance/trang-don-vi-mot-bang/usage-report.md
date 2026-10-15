### S4 round 1 — wf_9e14e8f6-c80 (32 agent, 79,320 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 20,033 | 8 | 246,894 | 131 |
| review:measurement | claude-opus-5-5 | 31 | 11,225 | 62 | 4,496,933 | 315 |
| triage | claude-sonnet-5-5 | 2 | 7,114 | 4 | 39,587 | 44 |
| judge:E14:spec-alignment | claude-sonnet-5-5 | 3 | 5,837 | 8 | 80,826 | 38 |
| judge:E14:domain-correctness | claude-sonnet-5-5 | 3 | 4,807 | 6 | 77,464 | 34 |
| review:bugs | claude-opus-5-5 | 44 | 4,641 | 88 | 5,558,515 | 305 |
| judge:E14:operational-feasibility | claude-sonnet-5-5 | 2 | 3,846 | 4 | 34,237 | 26 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 3,286 | 4 | 33,335 | 14 |
| review:conventions | claude-opus-5-5 | 14 | 2,727 | 28 | 916,212 | 79 |
| ui:E2 | claude-sonnet-5-5 | 4 | 2,425 | 8 | 270,108 | 68 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-5-5 | 2 | 2,093 | 4 | 33,396 | 123 |
| machine:bun _acceptance/trang-don-vi-mot-bang/ra | claude-haiku-5-5 | 2 | 1,936 | 4 | 33,445 | 181 |
| machine:bun _acceptance/trang-don-vi-mot-bang/ra | claude-haiku-5-5 | 2 | 1,719 | 4 | 33,372 | 21 |
| refute:man-okr.mjs | claude-sonnet-5-5 | 4 | 884 | 8 | 106,140 | 21 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 866 | 4 | 33,499 | 37 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 802 | 4 | 33,499 | 28 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 576 | 4 | 40,808 | 55 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 470 | 4 | 33,503 | 29 |
| machine:bun _acceptance/trang-don-vi-mot-bang/ra | claude-haiku-5-5 | 2 | 464 | 4 | 33,461 | 29 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 423 | 4 | 33,351 | 289 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 414 | 4 | 33,445 | 22 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 392 | 4 | 33,499 | 23 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 386 | 4 | 33,499 | 28 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 379 | 4 | 33,499 | 25 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 306 | 4 | 33,390 | 67 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 305 | 4 | 33,360 | 277 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 288 | 4 | 33,333 | 20 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 254 | 4 | 30,466 | 314 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 217 | 4 | 33,329 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 29,259 | 6 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 28 | 4 | 33,505 | 27 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 28 | 4 | 33,503 | 29 |


wall: 1214s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 576 | 40,808 | 55 | 14:07:26 | 14:08:21 |
| machine | 20 | 15,056 | 665,689 | 1001 | 14:07:26 | 14:24:07 |
| ui | 1 | 2,425 | 270,108 | 68 | 14:07:26 | 14:08:35 |
| judge | 3 | 14,490 | 192,527 | 40 | 14:07:51 | 14:08:31 |
| review | 3 | 18,593 | 10,971,660 | 318 | 14:07:54 | 14:13:12 |
| triage | 1 | 7,114 | 39,587 | 44 | 14:24:09 | 14:24:53 |
| refute | 1 | 884 | 106,140 | 21 | 14:24:56 | 14:25:17 |
| capture | 1 | 149 | 29,259 | 6 | 14:25:20 | 14:25:27 |
| synthesize | 1 | 20,033 | 246,894 | 131 | 14:25:29 | 14:27:40 |

- **claude-sonnet-5-5**: 9 agent · 26 calls · out 45,671 · in 54 · cache_read 925,323 · cache_create 512,048
- **claude-opus-5-5**: 3 agent · 89 calls · out 18,593 · in 178 · cache_read 10,971,660 · cache_create 516,145
- **claude-haiku-5-5**: 20 agent · 40 calls · out 15,056 · in 80 · cache_read 665,689 · cache_create 644,134

