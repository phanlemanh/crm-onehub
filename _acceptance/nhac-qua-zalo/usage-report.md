### S3 execute-parallel (T2, T4, T6) — wf_6a9cbf81-71d (3 agent, 99,744 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 48 | 45,909 | 96 | 6,920,932 | 510 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 43 | 43,415 | 86 | 6,013,162 | 493 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 18 | 10,420 | 36 | 1,819,164 | 118 |


wall: 511s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 3 | 99,744 | 14,753,258 | 511 | 09:00:28 | 09:08:59 |

- **claude-opus-5-5**: 3 agent · 109 calls · out 99,744 · in 218 · cache_read 14,753,258 · cache_create 517,569

### S4 round 1 — wf_6f42d399-4b0 (34 agent, 235,436 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E17 | claude-sonnet-5 | 135 | 76,321 | 270 | 24,220,755 | 1223 |
| synthesize:report | claude-sonnet-5 | 2 | 38,215 | 4 | 116,676 | 355 |
| baseline:diffBase | claude-sonnet-5 | 40 | 33,353 | 80 | 4,579,205 | 409 |
| review:measurement | claude-opus-5-5 | 21 | 21,277 | 42 | 2,941,152 | 242 |
| review:conventions | claude-opus-5-5 | 27 | 16,504 | 54 | 4,012,535 | 212 |
| review:bugs | claude-opus-5-5 | 13 | 14,938 | 26 | 1,528,209 | 172 |
| triage | claude-sonnet-5 | 2 | 11,108 | 4 | 92,298 | 120 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 2,302 | 42 | 277,526 | 35 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 1,577 | 42 | 279,574 | 28 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,346 | 34 | 244,363 | 69 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,310 | 34 | 215,945 | 23 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,278 | 18 | 85,990 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,268 | 34 | 243,704 | 23 |
| machine:for t in "apps/app/app/(app)/[slug | claude-haiku-4-5-20251001 | 2 | 1,131 | 18 | 86,071 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,005 | 18 | 86,019 | 13 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 996 | 18 | 116,442 | 16 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 952 | 18 | 116,444 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 925 | 18 | 86,019 | 12 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 853 | 18 | 116,444 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 832 | 34 | 214,065 | 24 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 826 | 18 | 116,444 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 813 | 18 | 116,496 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 776 | 18 | 86,017 | 11 |
| capture:provenance | claude-sonnet-5 | 2 | 761 | 4 | 84,589 | 12 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 704 | 18 | 85,955 | 21 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 686 | 18 | 85,953 | 10 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 611 | 18 | 85,955 | 9 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 548 | 18 | 116,444 | 17 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 499 | 18 | 85,990 | 15 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 436 | 18 | 116,442 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 432 | 18 | 86,018 | 13 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 425 | 18 | 116,440 | 16 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 424 | 18 | 116,442 | 16 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,990 | 14 |


wall: 1740s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 33,353 | 4,579,205 | 409 | 09:28:38 | 09:35:27 |
| machine | 26 | 22,959 | 3,469,192 | 109 | 09:28:38 | 09:30:28 |
| ui | 1 | 76,321 | 24,220,755 | 1223 | 09:29:07 | 09:49:30 |
| review | 3 | 52,719 | 8,481,896 | 244 | 09:29:08 | 09:33:11 |
| triage | 1 | 11,108 | 92,298 | 120 | 09:49:31 | 09:51:31 |
| capture | 1 | 761 | 84,589 | 12 | 09:51:31 | 09:51:43 |
| synthesize | 1 | 38,215 | 116,676 | 355 | 09:51:43 | 09:57:38 |

- **claude-sonnet-5**: 5 agent · 181 calls · out 159,758 · in 362 · cache_read 29,093,523 · cache_create 654,131
- **claude-opus-5-5**: 3 agent · 61 calls · out 52,719 · in 122 · cache_read 8,481,896 · cache_create 413,592
- **claude-haiku-4-5-20251001**: 26 agent · 66 calls · out 22,959 · in 580 · cache_read 3,469,192 · cache_create 646,365

### S4 round 2 — wf_3d6f292c-a78 (34 agent, 175,265 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 95 | 73,236 | 190 | 18,085,866 | 951 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 8 | 38,234 | 16 | 957,854 | 348 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 22 | 17,352 | 44 | 2,163,248 | 212 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 9 | 7,599 | 18 | 823,405 | 91 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 10 | 5,211 | 20 | 873,231 | 73 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 12 | 4,158 | 24 | 1,154,595 | 61 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 2,477 | 4 | 86,893 | 32 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 5 | 1,741 | 42 | 292,143 | 26 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 6 | 1,740 | 50 | 348,469 | 36 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 4 | 1,527 | 34 | 213,825 | 27 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 4 | 1,486 | 34 | 184,643 | 67 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,231 | 18 | 86,156 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 3 | 1,156 | 26 | 149,138 | 20 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 4 | 1,078 | 34 | 213,531 | 24 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,071 | 18 | 86,102 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 982 | 18 | 86,104 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 973 | 18 | 86,102 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 963 | 18 | 86,075 | 18 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 960 | 18 | 86,076 | 16 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 958 | 18 | 86,040 | 28 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 941 | 18 | 86,104 | 12 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 922 | 18 | 86,075 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 912 | 18 | 86,074 | 18 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 910 | 18 | 86,103 | 12 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 910 | 18 | 86,075 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 906 | 18 | 86,076 | 16 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 880 | 18 | 86,076 | 17 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 844 | 18 | 86,040 | 12 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 830 | 18 | 86,075 | 15 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 781 | 18 | 86,076 | 15 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 696 | 18 | 86,038 | 11 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 651 | 4 | 84,705 | 9 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 498 | 18 | 86,075 | 17 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 451 | 18 | 86,075 | 17 |


wall: 1371s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 34 | 175,265 | 27,353,163 | 1371 | 10:06:53 | 10:29:44 |

- **claude-sonnet-5**: 5 agent · 129 calls · out 131,950 · in 258 · cache_read 21,378,566 · cache_create 772,164
- **claude-opus-5-5**: 3 agent · 31 calls · out 16,968 · in 62 · cache_read 2,851,231 · cache_create 269,677
- **claude-haiku-4-5-20251001**: 26 agent · 66 calls · out 26,347 · in 580 · cache_read 3,123,366 · cache_create 1,022,303

