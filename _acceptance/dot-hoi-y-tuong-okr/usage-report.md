### S4 round 1 — wf_02f6f662-b17 (33 agent, 111,674 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 32,623 | 18 | 78,592 | 212 |
| synthesize:report | claude-sonnet-5-5 | 4 | 11,919 | 8 | 325,286 | 106 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 7,946 | 20 | 78,596 | 75 |
| ui:E12 | claude-sonnet-5-5 | 20 | 5,778 | 40 | 1,774,131 | 442 |
| ui:E15 | claude-sonnet-5-5 | 23 | 5,776 | 46 | 2,298,408 | 333 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 4,035 | 18 | 78,571 | 44 |
| baseline:diffBase | claude-sonnet-5-5 | 26 | 3,921 | 52 | 2,150,852 | 130 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,805 | 18 | 78,569 | 47 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 3,297 | 34 | 201,656 | 71 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,155 | 18 | 78,569 | 36 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,833 | 18 | 78,537 | 44 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,473 | 18 | 78,567 | 55 |
| machine:bun run test | claude-haiku-4-5-20251001 | 6 | 2,042 | 50 | 309,243 | 57 |
| machine:bun _acceptance/dot-hoi-y-tuong-okr/rang | claude-haiku-4-5-20251001 | 2 | 2,024 | 18 | 78,573 | 32 |
| judge:E21:domain-correctness | claude-sonnet-5-5 | 2 | 1,857 | 4 | 69,665 | 13 |
| review:conventions | claude-opus-5-5 | 29 | 1,784 | 58 | 3,837,870 | 160 |
| review:bugs | claude-opus-5-5 | 31 | 1,775 | 62 | 4,756,943 | 237 |
| triage | claude-sonnet-5-5 | 2 | 1,582 | 4 | 72,621 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,545 | 18 | 78,569 | 29 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 1 | 1,438 | 10 | 27,426 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,410 | 18 | 78,537 | 23 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 1,251 | 18 | 78,587 | 104 |
| machine:bun _acceptance/dot-hoi-y-tuong-okr/rang | claude-haiku-4-5-20251001 | 3 | 1,219 | 26 | 133,289 | 26 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 1,178 | 18 | 78,596 | 116 |
| judge:E21:spec-alignment | claude-sonnet-5-5 | 2 | 1,009 | 4 | 102,304 | 11 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 818 | 18 | 78,567 | 22 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 645 | 18 | 78,591 | 30 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 625 | 18 | 78,535 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 555 | 18 | 78,618 | 32 |
| machine:bun run test -- "cd packages/validation | claude-haiku-4-5-20251001 | 2 | 530 | 18 | 78,591 | 26 |
| judge:E21:operational-feasibility | claude-sonnet-5-5 | 2 | 480 | 4 | 102,306 | 14 |
| review:measurement | claude-opus-5-5 | 24 | 191 | 48 | 2,835,472 | 143 |
| capture:provenance | claude-sonnet-5-5 | 2 | 155 | 4 | 70,047 | 5 |


wall: 630s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,921 | 2,150,852 | 130 | 23:02:20 | 23:04:30 |
| machine | 21 | 75,447 | 2,007,379 | 213 | 23:02:20 | 23:05:53 |
| ui | 2 | 11,554 | 4,072,539 | 442 | 23:03:18 | 23:10:40 |
| judge | 3 | 3,346 | 274,275 | 23 | 23:03:22 | 23:03:46 |
| review | 3 | 3,750 | 11,430,285 | 238 | 23:03:37 | 23:07:35 |
| triage | 1 | 1,582 | 72,621 | 13 | 23:10:42 | 23:10:55 |
| capture | 1 | 155 | 70,047 | 5 | 23:10:58 | 23:11:03 |
| synthesize | 1 | 11,919 | 325,286 | 106 | 23:11:04 | 23:12:50 |

- **claude-haiku-4-5-20251001**: 21 agent · 48 calls · out 75,447 · in 428 · cache_read 2,007,379 · cache_create 675,491
- **claude-sonnet-5-5**: 9 agent · 83 calls · out 32,477 · in 166 · cache_read 6,965,620 · cache_create 862,048
- **claude-opus-5-5**: 3 agent · 84 calls · out 3,750 · in 168 · cache_read 11,430,285 · cache_create 476,003

### S4 round 2 — wf_ea6f010e-95e (63 agent, 135,059 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 12,559 | 8 | 337,944 | 97 |
| synthesize:report | claude-sonnet-5-5 | 4 | 11,658 | 8 | 336,178 | 77 |
| ui:E12 | claude-sonnet-5-5 | 19 | 5,815 | 38 | 1,784,587 | 420 |
| ui:E12 | claude-sonnet-5-5 | 20 | 5,521 | 40 | 1,941,556 | 521 |
| ui:E15 | claude-sonnet-5-5 | 15 | 5,504 | 30 | 1,350,392 | 470 |
| review:measurement | claude-opus-5-5 | 39 | 5,481 | 78 | 6,667,886 | 221 |
| ui:E15 | claude-sonnet-5-5 | 18 | 4,983 | 36 | 1,744,040 | 394 |
| review:measurement | claude-opus-5-5 | 49 | 4,336 | 98 | 7,846,573 | 333 |
| triage | claude-sonnet-5-5 | 2 | 4,094 | 4 | 74,255 | 28 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 3 | 3,897 | 28 | 135,564 | 45 |
| triage | claude-sonnet-5-5 | 2 | 3,859 | 4 | 74,282 | 27 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 9 | 3,490 | 74 | 497,094 | 112 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,414 | 18 | 79,078 | 45 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,403 | 18 | 78,229 | 50 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,195 | 18 | 78,258 | 49 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,073 | 18 | 79,078 | 42 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,014 | 18 | 79,107 | 42 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,977 | 18 | 78,229 | 48 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,837 | 18 | 103,240 | 45 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 8 | 2,527 | 66 | 440,186 | 71 |
| review:bugs | claude-opus-5-5 | 47 | 2,046 | 94 | 8,274,912 | 395 |
| machine:bun _acceptance/dot-hoi-y-tuong-okr/rang | claude-haiku-4-5-20251001 | 2 | 1,983 | 18 | 78,233 | 30 |
| review:bugs | claude-opus-5-5 | 44 | 1,972 | 88 | 8,003,308 | 285 |
| machine:bun _acceptance/dot-hoi-y-tuong-okr/rang | claude-haiku-4-5-20251001 | 2 | 1,972 | 18 | 79,082 | 30 |
| judge:E21:domain-correctness | claude-sonnet-5-5 | 2 | 1,840 | 4 | 69,293 | 13 |
| judge:E21:spec-alignment | claude-sonnet-5-5 | 2 | 1,771 | 4 | 103,029 | 13 |
| judge:E21:spec-alignment | claude-sonnet-5-5 | 2 | 1,709 | 4 | 101,932 | 12 |
| judge:E21:domain-correctness | claude-sonnet-5-5 | 2 | 1,597 | 4 | 70,390 | 12 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 1,542 | 18 | 78,247 | 201 |
| judge:E21:operational-feasibility | claude-sonnet-5-5 | 2 | 1,522 | 4 | 103,031 | 14 |
| review:conventions | claude-opus-5-5 | 49 | 1,490 | 98 | 8,212,203 | 250 |
| review:conventions | claude-opus-5-5 | 50 | 1,359 | 100 | 6,926,661 | 281 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 1,294 | 18 | 79,096 | 159 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,084 | 18 | 79,046 | 17 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 1,079 | 18 | 78,256 | 117 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 1,000 | 18 | 79,105 | 113 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 989 | 18 | 79,116 | 29 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 977 | 18 | 103,240 | 20 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 965 | 18 | 79,046 | 38 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 838 | 18 | 78,227 | 34 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 705 | 18 | 79,100 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 701 | 18 | 78,251 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 605 | 18 | 79,078 | 28 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 554 | 18 | 78,278 | 31 |
| machine:bun run test -- "cd packages/validation | claude-haiku-4-5-20251001 | 2 | 551 | 18 | 79,100 | 25 |
| machine:bun run test -- "cd packages/validation | claude-haiku-4-5-20251001 | 2 | 536 | 18 | 78,251 | 30 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 518 | 18 | 79,127 | 25 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 505 | 18 | 78,229 | 31 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 470 | 18 | 79,076 | 25 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 463 | 18 | 79,101 | 27 |
| judge:E21:operational-feasibility | claude-sonnet-5-5 | 2 | 454 | 4 | 101,934 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 452 | 18 | 78,231 | 30 |
| machine:bun _acceptance/dot-hoi-y-tuong-okr/rang | claude-haiku-4-5-20251001 | 3 | 448 | 26 | 134,199 | 31 |
| machine:bun _acceptance/dot-hoi-y-tuong-okr/rang | claude-haiku-4-5-20251001 | 2 | 437 | 18 | 78,228 | 11 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 425 | 18 | 79,044 | 12 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 415 | 18 | 79,080 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 383 | 18 | 79,076 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 8 | 364 | 66 | 445,183 | 54 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 360 | 18 | 0 | 542 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 341 | 18 | 103,236 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 337 | 18 | 78,252 | 29 |
| capture:provenance | claude-sonnet-5-5 | 4 | 194 | 8 | 217,402 | 10 |
| capture:provenance | claude-sonnet-5-5 | 3 | 175 | 6 | 143,135 | 7 |


wall: 1355s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 41 | 55,120 | 4,480,877 | 952 | 23:15:12 | 23:31:05 |
| ui | 4 | 21,823 | 6,820,575 | 1169 | 23:15:59 | 23:35:28 |
| judge | 6 | 8,893 | 549,609 | 776 | 23:16:03 | 23:28:59 |
| review | 6 | 16,684 | 45,931,543 | 1144 | 23:16:18 | 23:35:22 |
| triage | 2 | 7,953 | 148,537 | 629 | 23:25:28 | 23:35:57 |
| capture | 2 | 369 | 360,537 | 609 | 23:25:59 | 23:36:09 |
| synthesize | 2 | 24,217 | 674,122 | 699 | 23:26:08 | 23:37:48 |

- **claude-sonnet-5-5**: 16 agent · 103 calls · out 63,255 · in 206 · cache_read 8,553,380 · cache_create 1,475,725
- **claude-opus-5-5**: 6 agent · 278 calls · out 16,684 · in 556 · cache_read 45,931,543 · cache_create 1,263,508
- **claude-haiku-4-5-20251001**: 41 agent · 103 calls · out 55,120 · in 908 · cache_read 4,480,877 · cache_create 1,250,799

