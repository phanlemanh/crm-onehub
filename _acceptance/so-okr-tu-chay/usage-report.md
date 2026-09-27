### S4 round 1 — wf_de760fa2-046 (72 agent, 213,384 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 37,142 | 4 | 104,230 | 369 |
| ui:E13 | claude-sonnet-5 | 38 | 18,921 | 76 | 4,693,203 | 781 |
| synthesize:report | claude-sonnet-5 | 5 | 15,009 | 10 | 343,530 | 800 |
| triage | claude-sonnet-5 | 2 | 14,609 | 4 | 74,606 | 174 |
| ui:E13 | claude-sonnet-5 | 41 | 14,492 | 82 | 5,191,875 | 524 |
| triage | claude-sonnet-5 | 2 | 11,511 | 4 | 73,971 | 145 |
| ui:E11 | claude-sonnet-5 | 48 | 11,256 | 96 | 5,825,764 | 681 |
| baseline:diffBase | claude-sonnet-5 | 40 | 7,957 | 80 | 3,727,274 | 577 |
| review:measurement | claude-opus-5-5 | 47 | 7,743 | 94 | 8,737,876 | 392 |
| ui:E11 | claude-sonnet-5 | 31 | 7,541 | 62 | 3,472,806 | 417 |
| ui:E19 | claude-sonnet-5 | 43 | 7,102 | 86 | 4,618,935 | 525 |
| judge:E24:operational-feasibility | claude-sonnet-5 | 2 | 4,885 | 4 | 105,495 | 60 |
| judge:E24:operational-feasibility | claude-sonnet-5 | 2 | 4,456 | 4 | 105,469 | 53 |
| ui:E19 | claude-sonnet-5 | 34 | 3,619 | 68 | 3,499,758 | 685 |
| review:measurement | claude-opus-5-5 | 52 | 2,453 | 104 | 9,957,552 | 393 |
| judge:E24:spec-alignment | claude-sonnet-5 | 2 | 2,131 | 4 | 105,493 | 30 |
| judge:E24:domain-correctness | claude-sonnet-5 | 2 | 2,084 | 4 | 69,536 | 36 |
| judge:E24:spec-alignment | claude-sonnet-5 | 2 | 1,856 | 4 | 105,467 | 33 |
| judge:E24:domain-correctness | claude-sonnet-5 | 2 | 1,693 | 4 | 69,510 | 27 |
| review:bugs | claude-opus-5-5 | 30 | 1,675 | 60 | 4,423,570 | 337 |
| review:conventions | claude-opus-5-5 | 42 | 1,629 | 84 | 6,194,042 | 306 |
| review:conventions | claude-opus-5-5 | 38 | 1,519 | 76 | 5,528,444 | 269 |
| machine:bun _acceptance/so-okr-tu-chay/rang/soi- | claude-haiku-4-5-20251001 | 2 | 1,250 | 18 | 75,063 | 22 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 1,210 | 18 | 75,068 | 76 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 1,203 | 18 | 75,078 | 58 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 1,190 | 44 | 236,175 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 10 | 1,139 | 82 | 524,183 | 44 |
| review:bugs | claude-opus-5-5 | 29 | 1,119 | 58 | 3,863,395 | 283 |
| machine:node _acceptance/so-okr-tu-chay/rang/mig | claude-haiku-4-5-20251001 | 2 | 1,101 | 18 | 75,055 | 19 |
| machine:bun _acceptance/so-okr-tu-chay/rang/soi- | claude-haiku-4-5-20251001 | 2 | 1,082 | 18 | 75,062 | 17 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 4 | 1,072 | 34 | 192,511 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 10 | 1,017 | 82 | 528,368 | 56 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 948 | 18 | 75,080 | 19 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 942 | 18 | 75,059 | 67 |
| machine:bun _acceptance/so-okr-tu-chay/rang/soi- | claude-haiku-4-5-20251001 | 2 | 919 | 18 | 75,043 | 16 |
| machine:node _acceptance/so-okr-tu-chay/rang/mig | claude-haiku-4-5-20251001 | 2 | 894 | 18 | 75,036 | 18 |
| machine:bun _acceptance/so-okr-tu-chay/rang/soi- | claude-haiku-4-5-20251001 | 2 | 888 | 18 | 75,044 | 17 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 875 | 18 | 75,076 | 59 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 874 | 18 | 75,057 | 62 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 802 | 44 | 261,112 | 25 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 7 | 772 | 58 | 354,966 | 43 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 753 | 18 | 75,067 | 62 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 717 | 34 | 180,707 | 23 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 658 | 18 | 75,087 | 73 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 632 | 18 | 75,010 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 526 | 18 | 75,010 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 525 | 18 | 75,057 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 3 | 517 | 26 | 127,501 | 22 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 513 | 18 | 75,086 | 61 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 5 | 496 | 42 | 237,270 | 29 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 3 | 471 | 26 | 127,351 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 466 | 34 | 180,347 | 23 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 448 | 18 | 75,068 | 19 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 440 | 42 | 207,218 | 264 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 416 | 34 | 183,682 | 39 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 413 | 18 | 75,038 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 398 | 18 | 47,888 | 11 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 393 | 18 | 75,061 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 376 | 18 | 75,008 | 11 |
| machine:cd apps/app && bun test test/okr-so-chu. | claude-haiku-4-5-20251001 | 2 | 367 | 18 | 75,058 | 12 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 344 | 34 | 181,954 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 343 | 42 | 234,477 | 25 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 330 | 18 | 75,029 | 19 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 309 | 18 | 75,043 | 10 |
| machine:cd apps/app && bun test test/okr-so-chu. | claude-haiku-4-5-20251001 | 2 | 308 | 18 | 75,039 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 306 | 34 | 180,511 | 19 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 304 | 18 | 75,024 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 288 | 34 | 188,319 | 24 |
| capture:provenance | claude-sonnet-5 | 2 | 287 | 4 | 68,832 | 25 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 253 | 18 | 75,027 | 9 |
| capture:provenance | claude-sonnet-5 | 2 | 203 | 4 | 68,832 | 12 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 75,087 | 21 |


wall: 3041s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 7,957 | 3,727,274 | 577 | 19:35:01 | 19:44:39 |
| machine | 47 | 30,492 | 6,351,060 | 1353 | 19:35:01 | 19:57:34 |
| ui | 6 | 62,931 | 27,302,341 | 2021 | 19:35:42 | 20:09:22 |
| judge | 6 | 17,105 | 560,970 | 1287 | 19:36:02 | 19:57:28 |
| review | 6 | 16,138 | 38,704,879 | 1626 | 19:36:25 | 20:03:31 |
| triage | 2 | 26,120 | 148,577 | 1619 | 19:44:53 | 20:11:52 |
| capture | 2 | 490 | 137,664 | 1470 | 19:47:50 | 20:12:20 |
| synthesize | 2 | 52,151 | 447,760 | 2258 | 19:48:04 | 20:25:42 |

- **claude-sonnet-5**: 19 agent · 302 calls · out 166,754 · in 604 · cache_read 32,324,586 · cache_create 2,090,552
- **claude-opus-5-5**: 6 agent · 238 calls · out 16,138 · in 476 · cache_read 38,704,879 · cache_create 1,261,717
- **claude-haiku-4-5-20251001**: 47 agent · 146 calls · out 30,492 · in 1,266 · cache_read 6,351,060 · cache_create 1,399,707

