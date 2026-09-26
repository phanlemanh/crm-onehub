### S4 round 1 — wf_c0631b16-f13 (24 agent, 107,357 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 15 | 17,785 | 30 | 1,868,704 | 212 |
| synthesize:report | claude-sonnet-5 | 2 | 14,200 | 4 | 108,324 | 153 |
| baseline:diffBase | claude-sonnet-5 | 30 | 13,190 | 60 | 3,339,093 | 262 |
| triage | claude-sonnet-5 | 2 | 12,658 | 4 | 96,727 | 148 |
| review:conventions | claude-opus-5-5 | 22 | 10,802 | 44 | 2,592,613 | 147 |
| refute:hoi-crm-qua-zalo.integration.spec.ts | claude-sonnet-5 | 15 | 9,491 | 30 | 1,486,845 | 162 |
| refute:hoan-thien-hoi-crm-qua-zalo.integration.spec.ts | claude-sonnet-5 | 9 | 7,200 | 18 | 844,515 | 116 |
| review:bugs | claude-opus-5-5 | 10 | 6,940 | 20 | 1,090,807 | 85 |
| machine:bun run test | claude-haiku-4-5-20251001 | 7 | 1,596 | 58 | 412,368 | 371 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,576 | 18 | 91,422 | 21 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,158 | 18 | 91,424 | 16 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 994 | 18 | 91,428 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 982 | 18 | 91,370 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 977 | 18 | 91,419 | 18 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 977 | 18 | 91,428 | 17 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 971 | 18 | 91,431 | 20 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 941 | 18 | 91,409 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 880 | 18 | 91,428 | 15 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 856 | 18 | 91,370 | 21 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 855 | 18 | 91,427 | 13 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 761 | 18 | 91,405 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 697 | 18 | 91,368 | 12 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 450 | 18 | 91,430 | 18 |
| capture:provenance | claude-sonnet-5 | 2 | 420 | 4 | 91,604 | 14 |


wall: 899s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 13,190 | 3,339,093 | 262 | 23:06:40 | 23:11:02 |
| machine | 15 | 14,671 | 1,692,127 | 418 | 23:06:40 | 23:13:38 |
| review | 3 | 35,527 | 5,552,124 | 213 | 23:06:56 | 23:10:29 |
| triage | 1 | 12,658 | 96,727 | 148 | 23:13:38 | 23:16:05 |
| refute | 2 | 16,691 | 2,331,360 | 166 | 23:16:06 | 23:18:51 |
| capture | 1 | 420 | 91,604 | 14 | 23:18:51 | 23:19:05 |
| synthesize | 1 | 14,200 | 108,324 | 153 | 23:19:05 | 23:21:39 |

- **claude-opus-5-5**: 3 agent · 47 calls · out 35,527 · in 94 · cache_read 5,552,124 · cache_create 369,789
- **claude-sonnet-5**: 6 agent · 60 calls · out 57,159 · in 120 · cache_read 5,967,108 · cache_create 653,401
- **claude-haiku-4-5-20251001**: 15 agent · 35 calls · out 14,671 · in 310 · cache_read 1,692,127 · cache_create 702,091

### S4 round 2 — wf_147001e1-15b (24 agent, 101,717 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| refute:hoi-crm-qua-zalo.integration.spec.ts | claude-sonnet-5 | 31 | 21,059 | 62 | 3,886,692 | 344 |
| review:measurement | claude-opus-5-5 | 20 | 13,088 | 40 | 2,239,329 | 169 |
| refute:hoi-crm-qua-zalo.integration.spec.ts | claude-sonnet-5 | 13 | 12,090 | 26 | 1,337,265 | 167 |
| synthesize:report | claude-sonnet-5 | 2 | 12,083 | 4 | 106,264 | 132 |
| refute:hoi-crm-qua-zalo.integration.spec.ts | claude-sonnet-5 | 17 | 11,347 | 34 | 1,765,926 | 192 |
| review:bugs | claude-opus-5-5 | 14 | 8,176 | 28 | 1,411,590 | 108 |
| triage | claude-sonnet-5 | 2 | 4,948 | 4 | 95,049 | 65 |
| review:conventions | claude-opus-5-5 | 11 | 4,384 | 22 | 1,013,062 | 63 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,362 | 18 | 91,482 | 25 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 1,346 | 42 | 273,934 | 373 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,332 | 18 | 91,475 | 19 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,082 | 18 | 91,421 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,046 | 18 | 91,470 | 19 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,038 | 18 | 91,481 | 16 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,019 | 18 | 91,479 | 17 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 975 | 18 | 91,479 | 17 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 953 | 18 | 91,460 | 17 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 889 | 18 | 91,478 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 738 | 18 | 91,421 | 20 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 658 | 18 | 91,456 | 20 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 638 | 18 | 91,419 | 10 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 551 | 18 | 91,479 | 20 |
| capture:provenance | claude-sonnet-5 | 2 | 477 | 4 | 91,656 | 12 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 438 | 18 | 91,473 | 17 |


wall: 973s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 15 | 14,065 | 1,554,407 | 417 | 23:26:02 | 23:32:59 |
| review | 3 | 25,648 | 4,663,981 | 173 | 23:26:18 | 23:29:11 |
| triage | 1 | 4,948 | 95,049 | 65 | 23:32:59 | 23:34:04 |
| refute | 3 | 44,496 | 6,989,883 | 348 | 23:34:04 | 23:39:52 |
| capture | 1 | 477 | 91,656 | 12 | 23:39:52 | 23:40:04 |
| synthesize | 1 | 12,083 | 106,264 | 132 | 23:40:04 | 23:42:15 |

- **claude-sonnet-5**: 6 agent · 67 calls · out 62,004 · in 134 · cache_read 7,282,852 · cache_create 645,471
- **claude-opus-5-5**: 3 agent · 45 calls · out 25,648 · in 90 · cache_read 4,663,981 · cache_create 301,086
- **claude-haiku-4-5-20251001**: 15 agent · 33 calls · out 14,065 · in 294 · cache_read 1,554,407 · cache_create 703,611

