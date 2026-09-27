### S3 execute-parallel việc 1–3 — wf_d4d59d8c-99e (4 agent, 44,928 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 33 | 15,177 | 66 | 3,267,233 | 420 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 18 | 11,842 | 36 | 1,584,334 | 419 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 24 | 10,851 | 48 | 2,022,468 | 227 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 15 | 7,058 | 30 | 1,251,254 | 108 |


wall: 528s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 4 | 44,928 | 8,125,289 | 528 | 14:50:40 | 14:59:28 |

- **claude-opus-5-5**: 4 agent · 90 calls · out 44,928 · in 180 · cache_read 8,125,289 · cache_create 394,089

### S4 round 1 — wf_b55c991e-b41 (33 agent, 265,362 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 42,611 | 4 | 102,531 | 370 |
| ui:E7 | claude-sonnet-5 | 56 | 26,561 | 112 | 5,877,684 | 327 |
| review:bugs | claude-opus-5-5 | 34 | 24,203 | 68 | 4,997,040 | 293 |
| baseline:diffBase | claude-sonnet-5 | 31 | 23,102 | 62 | 2,787,907 | 271 |
| ui:E13 | claude-sonnet-5 | 34 | 22,153 | 68 | 3,795,073 | 352 |
| review:measurement | claude-opus-5-5 | 35 | 21,796 | 70 | 6,270,479 | 286 |
| ui:E15 | claude-sonnet-5 | 40 | 21,314 | 80 | 4,797,623 | 280 |
| review:conventions | claude-opus-5-5 | 41 | 20,155 | 82 | 6,018,028 | 264 |
| ui:E3 | claude-sonnet-5 | 25 | 18,712 | 50 | 2,758,980 | 430 |
| triage | claude-sonnet-5 | 2 | 8,168 | 4 | 74,449 | 86 |
| judge:E19:spec-alignment | claude-sonnet-5 | 2 | 3,748 | 4 | 106,301 | 44 |
| judge:E19:operational-feasibility | claude-sonnet-5 | 2 | 3,184 | 4 | 106,303 | 36 |
| judge:E19:domain-correctness | claude-sonnet-5 | 2 | 3,101 | 4 | 70,344 | 34 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 2,101 | 26 | 101,298 | 300 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 7 | 1,898 | 58 | 350,475 | 30 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,817 | 34 | 185,241 | 32 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,801 | 34 | 194,407 | 29 |
| machine:bun _acceptance/khep-ky-okr/rang/migrati | claude-haiku-4-5-20251001 | 2 | 1,600 | 18 | 75,694 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,530 | 34 | 183,974 | 24 |
| capture:provenance | claude-sonnet-5 | 2 | 1,491 | 4 | 69,559 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,476 | 34 | 183,354 | 26 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 1,315 | 18 | 75,714 | 97 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,291 | 18 | 75,669 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,284 | 34 | 183,190 | 25 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 1,271 | 18 | 75,724 | 92 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,246 | 34 | 183,299 | 24 |
| machine:bun _acceptance/khep-ky-okr/rang/soi-ma. | claude-haiku-4-5-20251001 | 2 | 1,198 | 18 | 75,701 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 3 | 1,157 | 26 | 128,423 | 23 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 988 | 18 | 75,681 | 14 |
| machine:cd apps/app && bun test test/okr-khep-ch | claude-haiku-4-5-20251001 | 2 | 898 | 18 | 75,699 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 894 | 18 | 75,669 | 22 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 803 | 18 | 75,667 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 495 | 18 | 75,723 | 11 |


wall: 928s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 23,102 | 2,787,907 | 271 | 17:03:18 | 17:07:49 |
| machine | 19 | 25,063 | 2,450,602 | 351 | 17:03:18 | 17:09:09 |
| ui | 4 | 88,740 | 17,229,360 | 430 | 17:03:44 | 17:10:55 |
| judge | 3 | 10,033 | 282,948 | 52 | 17:03:55 | 17:04:46 |
| review | 3 | 66,154 | 17,285,547 | 319 | 17:04:03 | 17:09:22 |
| triage | 1 | 8,168 | 74,449 | 86 | 17:10:55 | 17:12:21 |
| capture | 1 | 1,491 | 69,559 | 15 | 17:12:21 | 17:12:35 |
| synthesize | 1 | 42,611 | 102,531 | 370 | 17:12:35 | 17:18:45 |

- **claude-sonnet-5**: 11 agent · 198 calls · out 174,145 · in 396 · cache_read 20,546,754 · cache_create 1,128,562
- **claude-opus-5-5**: 3 agent · 110 calls · out 66,154 · in 220 · cache_read 17,285,547 · cache_create 618,164
- **claude-haiku-4-5-20251001**: 19 agent · 57 calls · out 25,063 · in 494 · cache_read 2,450,602 · cache_create 596,117

