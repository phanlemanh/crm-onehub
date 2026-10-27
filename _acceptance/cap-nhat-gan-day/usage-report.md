### S4 round 1 — wf_a378195f-6d0 (34 agent, 124,398 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 45 | 23,689 | 90 | 5,606,123 | 356 |
| synthesize:report | claude-sonnet-5-5 | 3 | 15,385 | 6 | 121,457 | 88 |
| review:measurement | claude-opus-5-5 | 19 | 15,367 | 38 | 1,600,393 | 192 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 10,379 | 4 | 38,436 | 54 |
| review:conventions | claude-opus-5-5 | 13 | 8,764 | 26 | 981,147 | 112 |
| triage | claude-sonnet-5-5 | 2 | 4,896 | 4 | 34,137 | 34 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,597 | 4 | 31,072 | 27 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,491 | 4 | 31,074 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,458 | 4 | 31,068 | 22 |
| ui:E14 | claude-sonnet-5-5 | 5 | 4,231 | 10 | 366,348 | 125 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 4,036 | 4 | 31,187 | 34 |
| refute:okr-cap-nhat-gan-day.spec.ts | claude-sonnet-5-5 | 6 | 2,363 | 12 | 166,996 | 28 |
| refute:cap-nhat-gan-day.dom.tsx | claude-sonnet-5-5 | 6 | 2,029 | 12 | 172,622 | 28 |
| refute:okr-cap-nhat-gan-day.spec.ts | claude-sonnet-5-5 | 6 | 1,984 | 12 | 163,316 | 25 |
| refute:cap-nhat-gan-day.dom.tsx | claude-sonnet-5-5 | 6 | 1,727 | 12 | 165,526 | 22 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 1,405 | 4 | 31,102 | 50 |
| refute:do-man.mjs | claude-sonnet-5-5 | 4 | 1,388 | 8 | 97,291 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,317 | 4 | 31,145 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 977 | 4 | 31,074 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 933 | 4 | 31,127 | 10 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 896 | 4 | 3,057 | 567 |
| machine:bun _acceptance/cap-nhat-gan-day/rang/ma | claude-haiku-5-5 | 2 | 887 | 4 | 31,073 | 14 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 872 | 4 | 31,244 | 83 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 833 | 4 | 31,128 | 10 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 814 | 4 | 3,057 | 316 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 719 | 4 | 31,127 | 9 |
| machine:bun run test -- "cd apps/api && PRISMA_L | claude-haiku-5-5 | 2 | 687 | 4 | 31,092 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 685 | 4 | 31,189 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 680 | 4 | 31,129 | 9 |
| machine:bun _acceptance/cap-nhat-gan-day/rang/th | claude-haiku-5-5 | 2 | 674 | 4 | 31,066 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 656 | 4 | 31,127 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 647 | 4 | 27,972 | 305 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 598 | 4 | 31,183 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 334 | 4 | 26,924 | 6 |


wall: 1499s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 10,379 | 38,436 | 54 | 16:58:09 | 16:59:03 |
| machine | 21 | 31,862 | 594,293 | 1333 | 16:58:09 | 17:20:22 |
| ui | 1 | 4,231 | 366,348 | 125 | 16:58:29 | 17:00:34 |
| review | 3 | 47,820 | 8,187,663 | 359 | 16:58:29 | 17:04:29 |
| triage | 1 | 4,896 | 34,137 | 34 | 17:20:25 | 17:20:59 |
| refute | 5 | 9,491 | 765,751 | 30 | 17:21:01 | 17:21:31 |
| capture | 1 | 334 | 26,924 | 6 | 17:21:33 | 17:21:39 |
| synthesize | 1 | 15,385 | 121,457 | 88 | 17:21:41 | 17:23:09 |

- **claude-opus-5-5**: 3 agent · 77 calls · out 47,820 · in 154 · cache_read 8,187,663 · cache_create 401,521
- **claude-sonnet-5-5**: 10 agent · 42 calls · out 44,716 · in 84 · cache_read 1,353,053 · cache_create 469,325
- **claude-haiku-5-5**: 21 agent · 42 calls · out 31,862 · in 84 · cache_read 594,293 · cache_create 681,154

### S4 round 2 — wf_e3431306-32b (28 agent, 69,163 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 11,923 | 8 | 174,362 | 73 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 9,839 | 4 | 37,756 | 51 |
| review:bugs | claude-opus-5-5 | 13 | 6,502 | 26 | 735,898 | 105 |
| ui:E14 | claude-sonnet-5-5 | 6 | 5,183 | 12 | 458,083 | 87 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,648 | 4 | 30,957 | 21 |
| machine:bun run test -- "cd apps/api && PRISMA_L | claude-haiku-5-5 | 2 | 4,433 | 4 | 30,981 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,419 | 4 | 30,961 | 26 |
| review:measurement | claude-opus-5-5 | 7 | 4,245 | 14 | 340,065 | 59 |
| review:conventions | claude-opus-5-5 | 5 | 1,894 | 10 | 196,550 | 29 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 1,369 | 4 | 30,991 | 37 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,158 | 4 | 31,034 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,003 | 4 | 30,963 | 17 |
| machine:bun _acceptance/cap-nhat-gan-day/rang/th | claude-haiku-5-5 | 2 | 991 | 4 | 30,955 | 10 |
| triage | claude-sonnet-5-5 | 2 | 967 | 4 | 29,337 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 931 | 4 | 31,016 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 926 | 4 | 31,017 | 10 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 857 | 4 | 3,057 | 566 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 847 | 4 | 30,918 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 802 | 4 | 31,018 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 760 | 4 | 27,861 | 298 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 757 | 4 | 3,057 | 318 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 748 | 4 | 31,016 | 10 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 740 | 4 | 30,973 | 79 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 704 | 4 | 30,963 | 16 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 704 | 4 | 30,912 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 678 | 4 | 31,016 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 637 | 4 | 30,916 | 23 |
| capture:provenance | claude-sonnet-5-5 | 2 | 498 | 4 | 26,653 | 7 |


wall: 1424s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 9,839 | 37,756 | 51 | 17:26:27 | 17:27:18 |
| machine | 20 | 28,112 | 560,582 | 1315 | 17:26:27 | 17:48:22 |
| ui | 1 | 5,183 | 458,083 | 87 | 17:26:43 | 17:28:09 |
| review | 3 | 12,641 | 1,272,513 | 108 | 17:26:47 | 17:28:35 |
| triage | 1 | 967 | 29,337 | 10 | 17:48:24 | 17:48:34 |
| capture | 1 | 498 | 26,653 | 7 | 17:48:36 | 17:48:43 |
| synthesize | 1 | 11,923 | 174,362 | 74 | 17:48:58 | 17:50:11 |

- **claude-sonnet-5-5**: 5 agent · 16 calls · out 28,410 · in 32 · cache_read 726,191 · cache_create 280,515
- **claude-opus-5-5**: 3 agent · 25 calls · out 12,641 · in 50 · cache_read 1,272,513 · cache_create 188,055
- **claude-haiku-5-5**: 20 agent · 40 calls · out 28,112 · in 80 · cache_read 560,582 · cache_create 649,210

