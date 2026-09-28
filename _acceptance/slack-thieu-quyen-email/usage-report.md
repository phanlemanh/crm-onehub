### S4 round 1 — wf_1d5b293e-c07 (26 agent, 86,390 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 21,572 | 4 | 88,527 | 221 |
| refute:slack-thieu-quyen-email.integration.spec.ts | claude-sonnet-5 | 12 | 10,495 | 24 | 1,024,057 | 290 |
| judge:E11:domain-correctness | claude-sonnet-5 | 4 | 9,929 | 8 | 298,752 | 122 |
| judge:E11:spec-alignment | claude-sonnet-5 | 4 | 7,909 | 8 | 334,986 | 97 |
| triage | claude-sonnet-5 | 2 | 6,897 | 4 | 75,575 | 83 |
| refute:do-truoc-khi-va.mjs | claude-sonnet-5 | 8 | 5,503 | 16 | 584,938 | 137 |
| judge:E11:operational-feasibility | claude-sonnet-5 | 4 | 5,438 | 8 | 335,229 | 70 |
| review:measurement | claude-opus-5-5 | 6 | 2,588 | 12 | 476,316 | 107 |
| baseline:diffBase | claude-sonnet-5 | 24 | 2,234 | 48 | 2,133,169 | 208 |
| review:conventions | claude-opus-5-5 | 5 | 1,617 | 10 | 359,085 | 61 |
| review:bugs | claude-opus-5-5 | 8 | 1,598 | 16 | 713,764 | 102 |
| machine:bun run test | claude-haiku-4-5-20251001 | 8 | 1,183 | 66 | 388,140 | 603 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,173 | 18 | 77,264 | 41 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 953 | 18 | 77,264 | 17 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 933 | 18 | 77,319 | 22 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 917 | 18 | 77,320 | 21 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 916 | 18 | 77,309 | 21 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 908 | 18 | 77,319 | 23 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 825 | 18 | 77,319 | 20 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 824 | 18 | 77,320 | 18 |
| machine:node _acceptance/slack-thieu-quyen-email | claude-haiku-4-5-20251001 | 2 | 680 | 18 | 77,289 | 21 |
| machine:node _acceptance/slack-thieu-quyen-email | claude-haiku-4-5-20251001 | 2 | 526 | 18 | 77,289 | 16 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 396 | 18 | 77,320 | 16 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 222 | 18 | 77,262 | 10 |
| capture:provenance | claude-sonnet-5 | 2 | 150 | 4 | 71,314 | 10 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 77,317 | 19 |


wall: 1286s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,234 | 2,133,169 | 208 | 04:51:39 | 04:55:07 |
| machine | 14 | 10,460 | 1,393,051 | 675 | 04:51:39 | 05:02:54 |
| judge | 3 | 23,276 | 968,967 | 122 | 04:51:59 | 04:54:01 |
| review | 3 | 5,803 | 1,549,165 | 109 | 04:52:01 | 04:53:50 |
| triage | 1 | 6,897 | 75,575 | 83 | 05:02:55 | 05:04:18 |
| refute | 2 | 15,998 | 1,608,995 | 292 | 05:04:19 | 05:09:11 |
| capture | 1 | 150 | 71,314 | 10 | 05:09:13 | 05:09:22 |
| synthesize | 1 | 21,572 | 88,527 | 221 | 05:09:24 | 05:13:05 |

- **claude-sonnet-5**: 9 agent · 62 calls · out 70,127 · in 124 · cache_read 4,946,547 · cache_create 844,927
- **claude-opus-5-5**: 3 agent · 19 calls · out 5,803 · in 38 · cache_read 1,549,165 · cache_create 262,883
- **claude-haiku-4-5-20251001**: 14 agent · 34 calls · out 10,460 · in 300 · cache_read 1,393,051 · cache_create 412,388

### S4 round 2 — wf_ecde398d-3cf (23 agent, 88,964 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 18,877 | 4 | 123,028 | 203 |
| baseline:diffBase | claude-sonnet-5 | 26 | 15,983 | 52 | 2,301,823 | 331 |
| judge:E11:domain-correctness | claude-sonnet-5 | 3 | 14,951 | 6 | 186,284 | 172 |
| judge:E11:operational-feasibility | claude-sonnet-5 | 4 | 6,918 | 8 | 336,522 | 84 |
| judge:E11:spec-alignment | claude-sonnet-5 | 4 | 6,257 | 8 | 337,558 | 76 |
| review:measurement | claude-opus-5-5 | 6 | 4,709 | 12 | 479,615 | 104 |
| triage | claude-sonnet-5 | 2 | 3,812 | 4 | 73,578 | 50 |
| review:conventions | claude-opus-5-5 | 10 | 3,304 | 20 | 769,968 | 80 |
| review:bugs | claude-opus-5-5 | 7 | 2,119 | 14 | 546,587 | 66 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,483 | 18 | 77,268 | 17 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 1,193 | 18 | 77,323 | 27 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,164 | 18 | 77,260 | 305 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 973 | 18 | 77,323 | 24 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 967 | 18 | 77,324 | 24 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 938 | 18 | 77,324 | 23 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 914 | 18 | 77,324 | 24 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 900 | 18 | 77,268 | 22 |
| capture:provenance | claude-sonnet-5 | 2 | 893 | 4 | 107,234 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 875 | 18 | 77,266 | 11 |
| machine:node _acceptance/slack-thieu-quyen-email | claude-haiku-4-5-20251001 | 2 | 779 | 18 | 77,293 | 24 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 510 | 18 | 77,321 | 19 |
| machine:node _acceptance/slack-thieu-quyen-email | claude-haiku-4-5-20251001 | 2 | 441 | 18 | 77,293 | 14 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 77,323 | 21 |


wall: 621s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 15,983 | 2,301,823 | 331 | 05:16:07 | 05:21:38 |
| machine | 13 | 11,141 | 1,004,910 | 355 | 05:16:07 | 05:22:02 |
| judge | 3 | 28,126 | 860,364 | 172 | 05:16:07 | 05:18:58 |
| review | 3 | 10,132 | 1,796,170 | 107 | 05:16:30 | 05:18:17 |
| triage | 1 | 3,812 | 73,578 | 50 | 05:22:02 | 05:22:52 |
| capture | 1 | 893 | 107,234 | 13 | 05:22:52 | 05:23:05 |
| synthesize | 1 | 18,877 | 123,028 | 203 | 05:23:05 | 05:26:28 |

- **claude-sonnet-5**: 7 agent · 43 calls · out 67,691 · in 86 · cache_read 3,466,027 · cache_create 567,484
- **claude-opus-5-5**: 3 agent · 23 calls · out 10,132 · in 46 · cache_read 1,796,170 · cache_create 206,425
- **claude-haiku-4-5-20251001**: 13 agent · 26 calls · out 11,141 · in 234 · cache_read 1,004,910 · cache_create 353,690

