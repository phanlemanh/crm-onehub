### S4 round 1 — wf_cd824a0d-c0d (25 agent, 40,443 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 10,477 | 8 | 147,654 | 57 |
| review:measurement | claude-opus-5-5 | 10 | 4,517 | 20 | 494,511 | 148 |
| machine:node _acceptance/lam-moi-goi-y-ke-hoach/ | claude-haiku-5-5 | 2 | 3,865 | 4 | 26,109 | 36 |
| triage | claude-sonnet-5-5 | 2 | 2,854 | 4 | 27,103 | 21 |
| ui:E6 | claude-sonnet-5-5 | 6 | 2,816 | 12 | 421,770 | 74 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,079 | 4 | 26,073 | 71 |
| review:bugs | claude-opus-5-5 | 18 | 1,985 | 36 | 1,050,993 | 149 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,924 | 4 | 2,869 | 325 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,577 | 4 | 2,869 | 366 |
| review:conventions | claude-opus-5-5 | 8 | 1,394 | 16 | 327,842 | 74 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,324 | 4 | 26,018 | 10 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 985 | 4 | 26,054 | 13 |
| refute:lam-moi-goi-y-ke-hoach.dom.tsx | claude-sonnet-5-5 | 7 | 915 | 14 | 160,883 | 30 |
| machine:node _acceptance/lam-moi-goi-y-ke-hoach/ | claude-haiku-5-5 | 2 | 592 | 4 | 26,027 | 16 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 572 | 4 | 26,016 | 21 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 469 | 4 | 26,092 | 7 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 447 | 4 | 30,324 | 49 |
| machine:node _acceptance/lam-moi-goi-y-ke-hoach/ | claude-haiku-5-5 | 2 | 336 | 4 | 26,083 | 7 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 302 | 4 | 23,118 | 301 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 234 | 4 | 26,056 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 228 | 4 | 26,091 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 202 | 4 | 26,091 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 188 | 4 | 26,012 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 21,941 | 5 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 11 | 4 | 26,091 | 8 |


wall: 1234s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 447 | 30,324 | 49 | 09:29:59 | 09:30:48 |
| machine | 16 | 14,888 | 367,669 | 1112 | 09:29:59 | 09:48:31 |
| ui | 1 | 2,816 | 421,770 | 74 | 09:29:59 | 09:31:13 |
| review | 3 | 7,896 | 1,873,346 | 151 | 09:29:59 | 09:32:30 |
| triage | 1 | 2,854 | 27,103 | 21 | 09:48:33 | 09:48:54 |
| refute | 1 | 915 | 160,883 | 30 | 09:48:56 | 09:49:26 |
| capture | 1 | 150 | 21,941 | 5 | 09:49:28 | 09:49:34 |
| synthesize | 1 | 10,477 | 147,654 | 57 | 09:49:36 | 09:50:33 |

- **claude-sonnet-5-5**: 6 agent · 23 calls · out 17,659 · in 46 · cache_read 809,675 · cache_create 280,021
- **claude-opus-5-5**: 3 agent · 36 calls · out 7,896 · in 72 · cache_read 1,873,346 · cache_create 213,421
- **claude-haiku-5-5**: 16 agent · 32 calls · out 14,888 · in 64 · cache_read 367,669 · cache_create 433,722

### S4 round 2 — wf_5da84929-c5b (26 agent, 45,774 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 14,198 | 12 | 272,040 | 93 |
| machine:node _acceptance/lam-moi-goi-y-ke-hoach/ | claude-haiku-5-5 | 2 | 3,643 | 4 | 26,840 | 38 |
| review:measurement | claude-opus-5-5 | 18 | 3,598 | 36 | 1,087,510 | 195 |
| ui:E6 | claude-sonnet-5-5 | 7 | 3,508 | 14 | 621,167 | 122 |
| triage | claude-sonnet-5-5 | 2 | 2,861 | 4 | 26,701 | 22 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,019 | 4 | 26,773 | 75 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,827 | 4 | 2,973 | 324 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,658 | 4 | 2,973 | 333 |
| review:bugs | claude-opus-5-5 | 23 | 1,581 | 46 | 1,473,125 | 201 |
| refute:man.mjs | claude-sonnet-5-5 | 4 | 1,476 | 8 | 84,340 | 26 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,405 | 4 | 26,787 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,200 | 4 | 26,718 | 9 |
| refute:lam-moi-goi-y-ke-hoach.dom.tsx | claude-sonnet-5-5 | 4 | 1,196 | 8 | 81,819 | 24 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,141 | 4 | 26,716 | 40 |
| review:conventions | claude-opus-5-5 | 15 | 897 | 30 | 808,307 | 86 |
| machine:node _acceptance/lam-moi-goi-y-ke-hoach/ | claude-haiku-5-5 | 2 | 645 | 4 | 26,758 | 29 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 447 | 4 | 30,952 | 51 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 434 | 4 | 2,973 | 378 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 382 | 4 | 26,822 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 347 | 4 | 26,822 | 9 |
| machine:node _acceptance/lam-moi-goi-y-ke-hoach/ | claude-haiku-5-5 | 2 | 335 | 4 | 26,814 | 8 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 231 | 4 | 26,785 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 228 | 4 | 26,822 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 202 | 4 | 26,823 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 169 | 4 | 26,712 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 22,539 | 5 |


wall: 1336s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 447 | 30,952 | 51 | 14:11:20 | 14:12:11 |
| machine | 16 | 15,866 | 357,111 | 1180 | 14:11:20 | 14:30:59 |
| ui | 1 | 3,508 | 621,167 | 122 | 14:11:20 | 14:13:22 |
| review | 3 | 6,076 | 3,368,942 | 203 | 14:11:20 | 14:14:43 |
| triage | 1 | 2,861 | 26,701 | 22 | 14:31:01 | 14:31:24 |
| refute | 2 | 2,672 | 166,159 | 27 | 14:31:26 | 14:31:53 |
| capture | 1 | 146 | 22,539 | 5 | 14:31:55 | 14:32:00 |
| synthesize | 1 | 14,198 | 272,040 | 93 | 14:32:02 | 14:33:35 |

- **claude-sonnet-5-5**: 7 agent · 27 calls · out 23,832 · in 54 · cache_read 1,139,558 · cache_create 351,080
- **claude-haiku-5-5**: 16 agent · 32 calls · out 15,866 · in 64 · cache_read 357,111 · cache_create 461,811
- **claude-opus-5-5**: 3 agent · 56 calls · out 6,076 · in 112 · cache_read 3,368,942 · cache_create 257,035

