### S4 round 1 — wf_bae4bfe5-010 (33 agent, 60,875 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5 | 2 | 16,312 | 4 | 94,840 | 189 |
| review:measurement | claude-opus-5-5 | 7 | 6,210 | 14 | 686,714 | 144 |
| synthesize:report | claude-sonnet-5 | 7 | 5,994 | 14 | 720,138 | 162 |
| baseline:diffBase | claude-sonnet-5 | 22 | 4,341 | 44 | 2,230,095 | 229 |
| review:bugs | claude-opus-5-5 | 22 | 3,662 | 44 | 2,919,682 | 339 |
| refute:pha-thu.mjs | claude-sonnet-5 | 8 | 2,852 | 16 | 783,656 | 185 |
| review:bugs | claude-opus-5-5 | 10 | 2,026 | 20 | 1,098,853 | 194 |
| review:measurement | claude-opus-5-5 | 7 | 1,981 | 14 | 759,410 | 130 |
| refute:soi-tep.mjs | claude-sonnet-5 | 5 | 1,844 | 10 | 435,182 | 75 |
| refute:go-la-cat-quyen.spec.ts | claude-sonnet-5 | 12 | 1,640 | 24 | 1,142,758 | 87 |
| review:conventions | claude-opus-5-5 | 21 | 1,581 | 42 | 2,421,553 | 189 |
| machine:bun _acceptance/khoa-con-bat-xa-tran/ran | claude-haiku-4-5-20251001 | 3 | 1,343 | 28 | 157,433 | 22 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 3 | 1,231 | 28 | 160,464 | 83 |
| machine:bun _acceptance/khoa-con-bat-xa-tran/ran | claude-haiku-4-5-20251001 | 2 | 1,112 | 18 | 89,793 | 20 |
| review:conventions | claude-opus-5-5 | 9 | 1,062 | 18 | 969,032 | 75 |
| refute:go-la-cat-quyen.spec.ts | claude-sonnet-5 | 6 | 1,050 | 12 | 538,267 | 50 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 953 | 42 | 270,876 | 219 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 720 | 18 | 125,276 | 70 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 708 | 18 | 89,795 | 69 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 679 | 18 | 125,284 | 79 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 539 | 18 | 125,346 | 78 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 499 | 18 | 89,756 | 14 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 486 | 18 | 89,756 | 37 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 483 | 18 | 125,206 | 24 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 400 | 18 | 125,206 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 376 | 18 | 89,754 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 306 | 18 | 125,202 | 12 |
| capture:provenance | claude-sonnet-5 | 2 | 294 | 4 | 89,903 | 16 |
| triage | claude-sonnet-5 | 1 | 126 | 2 | 0 | 57 |
| refute:go-la-cat-quyen.spec.ts | claude-sonnet-5 | 9 | 54 | 18 | 817,228 | 67 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 89,791 | 67 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 125,278 | 76 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 89,826 | 69 |


wall: 1250s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,341 | 2,230,095 | 229 | 22:32:31 | 22:36:20 |
| machine | 17 | 9,846 | 2,094,042 | 430 | 22:32:31 | 22:39:40 |
| review | 6 | 16,522 | 8,855,244 | 690 | 22:32:31 | 22:44:01 |
| triage | 2 | 16,438 | 94,840 | 591 | 22:37:21 | 22:47:12 |
| refute | 5 | 7,440 | 3,717,091 | 187 | 22:47:13 | 22:50:21 |
| capture | 1 | 294 | 89,903 | 16 | 22:50:22 | 22:50:38 |
| synthesize | 1 | 5,994 | 720,138 | 162 | 22:50:39 | 22:53:21 |

- **claude-sonnet-5**: 10 agent · 74 calls · out 34,507 · in 148 · cache_read 6,852,067 · cache_create 987,746
- **claude-opus-5-5**: 6 agent · 76 calls · out 16,522 · in 152 · cache_read 8,855,244 · cache_create 490,153
- **claude-haiku-4-5-20251001**: 17 agent · 39 calls · out 9,846 · in 350 · cache_read 2,094,042 · cache_create 524,414

### S4 round 2 — wf_de8aebe1-d06 (17 agent, 34,820 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 9 | 10,919 | 18 | 989,890 | 220 |
| refute:soi-tep.mjs | claude-sonnet-5 | 7 | 5,901 | 14 | 642,097 | 174 |
| review:measurement | claude-opus-5-5 | 12 | 3,284 | 24 | 1,423,735 | 197 |
| triage | claude-sonnet-5 | 2 | 3,186 | 4 | 93,200 | 46 |
| review:bugs | claude-opus-5-5 | 20 | 2,890 | 40 | 2,348,081 | 193 |
| review:conventions | claude-opus-5-5 | 14 | 1,533 | 28 | 1,368,938 | 92 |
| baseline:diffBase | claude-sonnet-5 | 26 | 1,530 | 52 | 2,764,457 | 210 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 796 | 18 | 89,876 | 95 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 702 | 26 | 130,594 | 128 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 683 | 18 | 89,842 | 88 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 654 | 18 | 89,841 | 73 |
| machine:bun run test -- "bun _acceptance/khoa-co | claude-haiku-4-5-20251001 | 2 | 596 | 18 | 89,845 | 91 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 542 | 18 | 89,806 | 25 |
| machine:bun _acceptance/khoa-con-bat-xa-tran/ran | claude-haiku-4-5-20251001 | 2 | 524 | 18 | 89,843 | 19 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 463 | 18 | 89,806 | 12 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 328 | 18 | 89,804 | 11 |
| capture:provenance | claude-sonnet-5 | 2 | 289 | 4 | 89,946 | 15 |


wall: 660s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,530 | 2,764,457 | 210 | 00:05:25 | 00:08:55 |
| machine | 9 | 5,288 | 849,257 | 182 | 00:05:25 | 00:08:27 |
| review | 3 | 7,707 | 5,140,754 | 198 | 00:05:25 | 00:08:43 |
| triage | 1 | 3,186 | 93,200 | 46 | 00:08:45 | 00:09:31 |
| refute | 1 | 5,901 | 642,097 | 174 | 00:09:32 | 00:12:26 |
| capture | 1 | 289 | 89,946 | 15 | 00:12:28 | 00:12:43 |
| synthesize | 1 | 10,919 | 989,890 | 220 | 00:12:44 | 00:16:25 |

- **claude-sonnet-5**: 5 agent · 46 calls · out 21,825 · in 92 · cache_read 4,579,590 · cache_create 608,429
- **claude-opus-5-5**: 3 agent · 46 calls · out 7,707 · in 92 · cache_read 5,140,754 · cache_create 341,824
- **claude-haiku-4-5-20251001**: 9 agent · 19 calls · out 5,288 · in 170 · cache_read 849,257 · cache_create 420,460

