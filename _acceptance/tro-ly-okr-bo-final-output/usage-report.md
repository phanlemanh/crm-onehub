### S4 round 1 — wf_ebc898d4-0dd (25 agent, 34,705 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 7,092 | 6 | 198,485 | 70 |
| triage | claude-sonnet-5-5 | 2 | 3,272 | 4 | 77,649 | 25 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,865 | 18 | 83,410 | 49 |
| review:measurement | claude-opus-5-5 | 20 | 1,862 | 40 | 2,245,833 | 190 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,766 | 18 | 83,457 | 59 |
| machine:bun _acceptance/tro-ly-okr-bo-final-outp | claude-haiku-4-5-20251001 | 5 | 1,745 | 42 | 175,952 | 1198 |
| review:conventions | claude-opus-5-5 | 14 | 1,589 | 28 | 1,403,870 | 119 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 1,528 | 18 | 83,472 | 26 |
| review:bugs | claude-opus-5-5 | 27 | 1,466 | 54 | 3,311,079 | 225 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,387 | 18 | 54,479 | 254 |
| baseline:diffBase | claude-sonnet-5-5 | 15 | 1,061 | 30 | 1,211,108 | 95 |
| judge:E2:spec-alignment | claude-sonnet-5-5 | 2 | 1,006 | 4 | 108,554 | 10 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 924 | 18 | 83,410 | 18 |
| judge:E2:operational-feasibility | claude-sonnet-5-5 | 2 | 892 | 4 | 108,556 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 875 | 18 | 83,425 | 206 |
| judge:E2:domain-correctness | claude-sonnet-5-5 | 2 | 848 | 4 | 73,726 | 11 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 4 | 741 | 8 | 271,787 | 18 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 3 | 716 | 6 | 188,135 | 15 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 3 | 604 | 6 | 188,061 | 14 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 566 | 18 | 83,431 | 206 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 514 | 18 | 83,464 | 17 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 495 | 18 | 83,462 | 17 |
| machine:cd apps/agent && bun test test/tro-ly-ok | claude-haiku-4-5-20251001 | 2 | 399 | 18 | 83,440 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 343 | 18 | 83,408 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 73,000 | 6 |


wall: 1305s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,061 | 1,211,108 | 95 | 23:46:35 | 23:48:10 |
| machine | 12 | 13,407 | 1,064,810 | 1199 | 23:46:35 | 00:06:34 |
| judge | 6 | 4,807 | 938,819 | 26 | 23:46:35 | 23:47:01 |
| review | 3 | 4,917 | 6,960,782 | 226 | 23:46:49 | 23:50:35 |
| triage | 1 | 3,272 | 77,649 | 25 | 00:06:35 | 00:07:01 |
| capture | 1 | 149 | 73,000 | 6 | 00:07:02 | 00:07:08 |
| synthesize | 1 | 7,092 | 198,485 | 70 | 00:07:10 | 00:08:20 |

- **claude-sonnet-5-5**: 10 agent · 38 calls · out 16,381 · in 76 · cache_read 2,499,061 · cache_create 695,331
- **claude-haiku-4-5-20251001**: 12 agent · 27 calls · out 13,407 · in 240 · cache_read 1,064,810 · cache_create 478,026
- **claude-opus-5-5**: 3 agent · 61 calls · out 4,917 · in 122 · cache_read 6,960,782 · cache_create 372,161

### S4 round 2 — wf_d56fc728-904 (25 agent, 39,875 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 8,445 | 8 | 300,666 | 70 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,744 | 18 | 83,511 | 54 |
| review:conventions | claude-opus-5-5 | 13 | 2,730 | 26 | 1,359,431 | 115 |
| review:measurement | claude-opus-5-5 | 13 | 2,557 | 26 | 1,356,500 | 139 |
| judge:E2:spec-alignment | claude-sonnet-5-5 | 2 | 2,284 | 4 | 108,746 | 21 |
| judge:E2:operational-feasibility | claude-sonnet-5-5 | 2 | 2,247 | 4 | 108,748 | 21 |
| judge:E2:domain-correctness | claude-sonnet-5-5 | 2 | 2,187 | 4 | 73,918 | 19 |
| triage | claude-sonnet-5-5 | 2 | 2,057 | 4 | 77,175 | 22 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,931 | 18 | 83,558 | 83 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 4 | 1,539 | 34 | 204,016 | 414 |
| review:bugs | claude-opus-5-5 | 24 | 1,384 | 48 | 2,752,585 | 192 |
| machine:bun _acceptance/tro-ly-okr-bo-final-outp | claude-haiku-4-5-20251001 | 7 | 1,197 | 62 | 359,344 | 630 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 969 | 18 | 83,573 | 23 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 963 | 18 | 83,511 | 18 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 957 | 18 | 83,565 | 23 |
| baseline:diffBase | claude-sonnet-5-5 | 11 | 922 | 22 | 823,953 | 66 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 871 | 18 | 83,563 | 22 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 5 | 865 | 42 | 234,833 | 357 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 3 | 592 | 6 | 189,301 | 13 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 3 | 578 | 6 | 192,367 | 13 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 3 | 549 | 6 | 188,633 | 12 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 471 | 18 | 83,526 | 203 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 377 | 18 | 83,509 | 14 |
| machine:cd apps/agent && bun test test/tro-ly-ok | claude-haiku-4-5-20251001 | 2 | 312 | 18 | 83,541 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 147 | 4 | 73,124 | 7 |


wall: 1256s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 922 | 823,953 | 66 | 00:18:22 | 00:19:29 |
| machine | 12 | 13,196 | 1,550,050 | 1153 | 00:18:22 | 00:37:35 |
| judge | 6 | 8,437 | 861,713 | 27 | 00:18:22 | 00:18:50 |
| review | 3 | 6,671 | 5,468,516 | 193 | 00:18:39 | 00:21:52 |
| triage | 1 | 2,057 | 77,175 | 22 | 00:37:36 | 00:37:58 |
| capture | 1 | 147 | 73,124 | 7 | 00:37:59 | 00:38:06 |
| synthesize | 1 | 8,445 | 300,666 | 70 | 00:38:08 | 00:39:18 |

- **claude-sonnet-5-5**: 10 agent · 34 calls · out 20,008 · in 68 · cache_read 2,136,631 · cache_create 693,362
- **claude-haiku-4-5-20251001**: 12 agent · 34 calls · out 13,196 · in 300 · cache_read 1,550,050 · cache_create 426,651
- **claude-opus-5-5**: 3 agent · 50 calls · out 6,671 · in 100 · cache_read 5,468,516 · cache_create 356,213

### S4 round 3 — wf_dd867a14-730 (19 agent, 23,825 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 5,779 | 8 | 301,383 | 66 |
| triage | claude-sonnet-5-5 | 2 | 2,459 | 4 | 76,028 | 21 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 2,331 | 18 | 83,460 | 220 |
| review:measurement | claude-opus-5-5 | 9 | 1,941 | 18 | 835,577 | 80 |
| review:conventions | claude-opus-5-5 | 6 | 1,884 | 12 | 418,055 | 44 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,613 | 18 | 83,466 | 224 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,518 | 18 | 83,447 | 194 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 989 | 18 | 83,445 | 18 |
| judge:E2:operational-feasibility | claude-sonnet-5-5 | 2 | 939 | 4 | 108,667 | 10 |
| machine:bun _acceptance/tro-ly-okr-bo-final-outp | claude-haiku-4-5-20251001 | 5 | 878 | 42 | 233,937 | 623 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 628 | 18 | 83,492 | 64 |
| judge:E2:domain-correctness | claude-sonnet-5-5 | 2 | 602 | 4 | 73,837 | 7 |
| judge:E2:spec-alignment | claude-sonnet-5-5 | 2 | 572 | 4 | 108,665 | 7 |
| review:bugs | claude-opus-5-5 | 10 | 438 | 20 | 914,358 | 68 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 368 | 8 | 234,577 | 22 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 367 | 18 | 83,443 | 13 |
| machine:cd apps/agent && bun test test/tro-ly-ok | claude-haiku-4-5-20251001 | 2 | 357 | 18 | 83,475 | 15 |
| capture:provenance | claude-sonnet-5-5 | 2 | 157 | 4 | 73,043 | 7 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 83,445 | 56 |


wall: 896s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 368 | 234,577 | 22 | 00:41:15 | 00:41:37 |
| machine | 9 | 8,686 | 901,610 | 798 | 00:41:15 | 00:54:33 |
| judge | 3 | 2,113 | 291,169 | 12 | 00:41:15 | 00:41:27 |
| review | 3 | 4,263 | 2,167,990 | 81 | 00:41:15 | 00:42:36 |
| triage | 1 | 2,459 | 76,028 | 21 | 00:54:34 | 00:54:55 |
| capture | 1 | 157 | 73,043 | 7 | 00:54:57 | 00:55:03 |
| synthesize | 1 | 5,779 | 301,383 | 66 | 00:55:05 | 00:56:11 |

- **claude-sonnet-5-5**: 7 agent · 18 calls · out 10,876 · in 36 · cache_read 976,200 · cache_create 534,161
- **claude-haiku-4-5-20251001**: 9 agent · 21 calls · out 8,686 · in 186 · cache_read 901,610 · cache_create 298,840
- **claude-opus-5-5**: 3 agent · 25 calls · out 4,263 · in 50 · cache_read 2,167,990 · cache_create 247,285

### S4 round 3 (thu lai) — wf_06e1732e-3e9 (15 agent, 21,797 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 6,344 | 10 | 403,257 | 67 |
| review:bugs | claude-opus-5-5 | 8 | 3,243 | 16 | 677,837 | 89 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,906 | 18 | 83,458 | 61 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,558 | 18 | 83,505 | 56 |
| triage | claude-sonnet-5-5 | 2 | 1,389 | 4 | 75,316 | 13 |
| machine:bun _acceptance/tro-ly-okr-bo-final-outp | claude-haiku-4-5-20251001 | 6 | 1,188 | 52 | 234,629 | 1801 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,088 | 18 | 54,527 | 188 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,036 | 18 | 83,458 | 19 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,021 | 18 | 83,473 | 207 |
| review:measurement | claude-opus-5-5 | 6 | 536 | 12 | 471,216 | 42 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 460 | 18 | 83,479 | 208 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 405 | 18 | 83,456 | 15 |
| review:conventions | claude-opus-5-5 | 9 | 258 | 18 | 727,868 | 71 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 216 | 8 | 233,990 | 19 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 73,061 | 7 |


wall: 1893s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 216 | 233,990 | 19 | 00:59:36 | 00:59:55 |
| machine | 8 | 9,662 | 789,985 | 1802 | 00:59:36 | 01:29:38 |
| review | 3 | 4,037 | 1,876,921 | 90 | 00:59:36 | 01:01:06 |
| triage | 1 | 1,389 | 75,316 | 13 | 01:29:39 | 01:29:53 |
| capture | 1 | 149 | 73,061 | 7 | 01:29:54 | 01:30:01 |
| synthesize | 1 | 6,344 | 403,257 | 67 | 01:30:02 | 01:31:09 |

- **claude-sonnet-5-5**: 4 agent · 13 calls · out 8,098 · in 26 · cache_read 785,624 · cache_create 349,077
- **claude-opus-5-5**: 3 agent · 23 calls · out 4,037 · in 46 · cache_read 1,876,921 · cache_create 237,616
- **claude-haiku-4-5-20251001**: 8 agent · 20 calls · out 9,662 · in 178 · cache_read 789,985 · cache_create 359,696

### S4 round 4 — wf_a001014f-932 (15 agent, 28,469 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 6,998 | 10 | 414,763 | 61 |
| review:measurement | claude-opus-5-5 | 3 | 3,444 | 6 | 199,207 | 57 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,032 | 18 | 83,503 | 67 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,235 | 18 | 83,550 | 87 |
| review:bugs | claude-opus-5-5 | 13 | 2,019 | 26 | 1,245,980 | 137 |
| machine:bun _acceptance/tro-ly-okr-bo-final-outp | claude-haiku-4-5-20251001 | 9 | 1,749 | 74 | 451,688 | 1106 |
| triage | claude-sonnet-5-5 | 2 | 1,745 | 4 | 76,765 | 17 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,556 | 18 | 54,572 | 210 |
| review:conventions | claude-opus-5-5 | 9 | 1,521 | 18 | 771,953 | 78 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,277 | 18 | 83,518 | 209 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,131 | 18 | 83,524 | 258 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 943 | 18 | 83,503 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 444 | 18 | 83,501 | 12 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 222 | 8 | 233,571 | 17 |
| capture:provenance | claude-sonnet-5-5 | 2 | 153 | 4 | 73,116 | 7 |


wall: 1197s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 222 | 233,571 | 17 | 01:38:48 | 01:39:05 |
| machine | 8 | 12,367 | 1,007,359 | 1107 | 01:38:48 | 01:57:15 |
| review | 3 | 6,984 | 2,217,140 | 138 | 01:38:48 | 01:41:06 |
| triage | 1 | 1,745 | 76,765 | 17 | 01:57:17 | 01:57:34 |
| capture | 1 | 153 | 73,116 | 7 | 01:57:35 | 01:57:42 |
| synthesize | 1 | 6,998 | 414,763 | 61 | 01:57:43 | 01:58:45 |

- **claude-sonnet-5-5**: 4 agent · 13 calls · out 9,118 · in 26 · cache_read 798,215 · cache_create 353,478
- **claude-opus-5-5**: 3 agent · 25 calls · out 6,984 · in 50 · cache_read 2,217,140 · cache_create 248,686
- **claude-haiku-4-5-20251001**: 8 agent · 23 calls · out 12,367 · in 200 · cache_read 1,007,359 · cache_create 336,605

