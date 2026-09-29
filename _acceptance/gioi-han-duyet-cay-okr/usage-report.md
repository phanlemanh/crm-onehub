### S4 round 1 — wf_34a3f2a1-394 (39 agent, 77,704 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 13,360 | 6 | 223,958 | 105 |
| ui:E15 | claude-sonnet-5-5 | 23 | 6,164 | 46 | 2,015,038 | 712 |
| triage | claude-sonnet-5-5 | 2 | 5,616 | 4 | 76,098 | 42 |
| ui:E18 | claude-sonnet-5-5 | 24 | 5,037 | 48 | 2,335,964 | 271 |
| judge:E25:spec-alignment | claude-sonnet-5-5 | 6 | 3,579 | 12 | 541,809 | 40 |
| review:measurement | claude-opus-5-5 | 43 | 3,262 | 86 | 6,898,258 | 289 |
| baseline:diffBase | claude-sonnet-5-5 | 13 | 2,895 | 26 | 983,661 | 173 |
| judge:E25:domain-correctness | claude-sonnet-5-5 | 4 | 2,828 | 8 | 263,577 | 28 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 2,708 | 18 | 78,181 | 230 |
| review:conventions | claude-opus-5-5 | 39 | 2,565 | 78 | 6,013,738 | 252 |
| judge:E25:operational-feasibility | claude-sonnet-5-5 | 7 | 2,129 | 14 | 565,559 | 37 |
| review:bugs | claude-opus-5-5 | 53 | 1,967 | 106 | 10,780,175 | 444 |
| machine:bun _acceptance/gioi-han-duyet-cay-okr/r | claude-haiku-4-5-20251001 | 2 | 1,957 | 18 | 78,168 | 29 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-4-5-20251001 | 2 | 1,909 | 18 | 78,182 | 158 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 1,815 | 18 | 78,193 | 114 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,539 | 18 | 78,199 | 34 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,538 | 18 | 27,426 | 361 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,532 | 18 | 78,776 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 9 | 1,401 | 74 | 505,916 | 67 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,315 | 18 | 78,161 | 29 |
| machine:bun _acceptance/gioi-han-duyet-cay-okr/r | claude-haiku-4-5-20251001 | 2 | 1,250 | 18 | 78,163 | 21 |
| refute:vai-chi-okr.spec.ts | claude-sonnet-5-5 | 7 | 1,203 | 14 | 497,298 | 33 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,156 | 18 | 78,186 | 32 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,094 | 18 | 78,187 | 23 |
| machine:bun _acceptance/gioi-han-duyet-cay-okr/r | claude-haiku-4-5-20251001 | 2 | 1,013 | 18 | 78,166 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 962 | 18 | 78,160 | 28 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 884 | 18 | 78,776 | 39 |
| refute:objective-duyet.tsx | claude-sonnet-5-5 | 4 | 714 | 8 | 233,475 | 23 |
| machine:bun run test -- "cd packages/validation | claude-haiku-4-5-20251001 | 2 | 573 | 18 | 78,187 | 23 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 547 | 18 | 78,211 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 543 | 18 | 78,187 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 518 | 18 | 78,161 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 481 | 18 | 78,167 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 423 | 18 | 78,164 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 399 | 18 | 78,167 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 384 | 18 | 78,163 | 17 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 292 | 18 | 78,774 | 12 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 69,544 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 78,163 | 27 |


wall: 967s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,895 | 983,661 | 173 | 11:15:07 | 11:18:00 |
| machine | 25 | 26,237 | 2,333,184 | 442 | 11:15:07 | 11:22:29 |
| ui | 2 | 11,201 | 4,351,002 | 712 | 11:15:56 | 11:27:48 |
| judge | 3 | 8,536 | 1,370,945 | 45 | 11:16:03 | 11:16:48 |
| review | 3 | 7,794 | 23,692,171 | 450 | 11:16:27 | 11:23:57 |
| triage | 1 | 5,616 | 76,098 | 42 | 11:27:51 | 11:28:33 |
| refute | 2 | 1,917 | 730,773 | 36 | 11:28:35 | 11:29:11 |
| capture | 1 | 148 | 69,544 | 14 | 11:29:13 | 11:29:27 |
| synthesize | 1 | 13,360 | 223,958 | 105 | 11:29:29 | 11:31:15 |

- **claude-sonnet-5-5**: 11 agent · 95 calls · out 43,673 · in 190 · cache_read 7,805,981 · cache_create 1,138,637
- **claude-opus-5-5**: 3 agent · 135 calls · out 7,794 · in 270 · cache_read 23,692,171 · cache_create 670,478
- **claude-haiku-4-5-20251001**: 25 agent · 57 calls · out 26,237 · in 506 · cache_read 2,333,184 · cache_create 776,154

### S4 round 2 — wf_2c4a5766-86a (21 agent, 45,632 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 14,936 | 10 | 474,459 | 105 |
| ui:E15 | claude-sonnet-5-5 | 20 | 6,682 | 40 | 1,996,618 | 622 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,845 | 18 | 50,931 | 148 |
| judge:E25:spec-alignment | claude-sonnet-5-5 | 4 | 2,635 | 8 | 307,815 | 28 |
| judge:E25:operational-feasibility | claude-sonnet-5-5 | 4 | 2,130 | 8 | 295,955 | 22 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 2,113 | 18 | 27,426 | 391 |
| ui:E18 | claude-sonnet-5-5 | 11 | 1,805 | 22 | 946,295 | 268 |
| ui:E18 | claude-sonnet-5-5 | 9 | 1,710 | 18 | 691,347 | 2412 |
| judge:E25:domain-correctness | claude-sonnet-5-5 | 4 | 1,607 | 8 | 263,747 | 21 |
| ui:E15 | claude-sonnet-5-5 | 20 | 1,593 | 40 | 1,778,710 | 2414 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,250 | 18 | 27,426 | 389 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,111 | 18 | 78,230 | 29 |
| machine:bun _acceptance/gioi-han-duyet-cay-okr/r | claude-haiku-4-5-20251001 | 2 | 1,075 | 18 | 78,212 | 24 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 979 | 18 | 78,197 | 19 |
| review:measurement | claude-opus-5-5 | 6 | 867 | 12 | 480,334 | 38 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 833 | 18 | 78,195 | 26 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 730 | 18 | 78,231 | 15 |
| review:bugs | claude-opus-5-5 | 20 | 302 | 40 | 1,924,053 | 107 |
| review:conventions | claude-opus-5-5 | 6 | 272 | 12 | 445,452 | 28 |
| capture:provenance | claude-sonnet-5-5 | 2 | 153 | 4 | 69,142 | 8 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 78,197 | 1154 |


wall: 3437s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 9 | 10,940 | 575,045 | 2844 | 11:38:39 | 12:26:03 |
| ui | 4 | 11,790 | 5,412,970 | 3318 | 11:38:39 | 12:33:57 |
| judge | 3 | 6,372 | 867,517 | 31 | 11:38:39 | 11:39:10 |
| review | 3 | 1,441 | 2,849,839 | 109 | 11:38:39 | 11:40:28 |
| capture | 1 | 153 | 69,142 | 8 | 12:34:00 | 12:34:08 |
| synthesize | 1 | 14,936 | 474,459 | 105 | 12:34:11 | 12:35:56 |

- **claude-sonnet-5-5**: 9 agent · 79 calls · out 33,251 · in 158 · cache_read 6,824,088 · cache_create 1,166,120
- **claude-haiku-4-5-20251001**: 9 agent · 18 calls · out 10,940 · in 162 · cache_read 575,045 · cache_create 382,585
- **claude-opus-5-5**: 3 agent · 32 calls · out 1,441 · in 64 · cache_read 2,849,839 · cache_create 245,653

### S4 round 3 — wf_de15cbbe-5fb (16 agent, 43,501 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 13,702 | 12 | 598,559 | 111 |
| ui:E15 | claude-sonnet-5-5 | 20 | 6,092 | 40 | 2,023,783 | 424 |
| ui:E18 | claude-sonnet-5-5 | 21 | 4,576 | 42 | 2,026,200 | 267 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,966 | 18 | 78,826 | 46 |
| judge:E25:spec-alignment | claude-sonnet-5-5 | 3 | 2,854 | 6 | 190,368 | 33 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 2,798 | 18 | 78,218 | 105 |
| judge:E25:operational-feasibility | claude-sonnet-5-5 | 5 | 2,340 | 10 | 393,952 | 28 |
| judge:E25:domain-correctness | claude-sonnet-5-5 | 4 | 2,082 | 8 | 284,791 | 33 |
| review:bugs | claude-opus-5-5 | 16 | 1,949 | 32 | 1,648,807 | 121 |
| review:measurement | claude-opus-5-5 | 6 | 1,459 | 12 | 520,328 | 56 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 956 | 18 | 78,826 | 19 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 489 | 18 | 78,824 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 487 | 18 | 78,212 | 17 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 377 | 18 | 0 | 396 |
| review:conventions | claude-opus-5-5 | 5 | 226 | 10 | 357,765 | 31 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 69,173 | 15 |


wall: 615s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 6 | 8,073 | 392,906 | 482 | 13:07:39 | 13:15:42 |
| ui | 2 | 10,668 | 4,049,983 | 424 | 13:07:39 | 13:14:43 |
| judge | 3 | 7,276 | 869,111 | 36 | 13:07:39 | 13:08:15 |
| review | 3 | 3,634 | 2,526,900 | 123 | 13:07:39 | 13:09:42 |
| capture | 1 | 148 | 69,173 | 15 | 13:15:46 | 13:16:01 |
| synthesize | 1 | 13,702 | 598,559 | 111 | 13:16:04 | 13:17:54 |

- **claude-sonnet-5-5**: 7 agent · 61 calls · out 31,794 · in 122 · cache_read 5,586,826 · cache_create 763,452
- **claude-haiku-4-5-20251001**: 6 agent · 12 calls · out 8,073 · in 108 · cache_read 392,906 · cache_create 248,714
- **claude-opus-5-5**: 3 agent · 27 calls · out 3,634 · in 54 · cache_read 2,526,900 · cache_create 283,094

