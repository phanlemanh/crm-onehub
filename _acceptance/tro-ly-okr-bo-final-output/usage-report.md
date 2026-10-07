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

