### S4 round 1 — wf_4150ea86-bc4 (32 agent, 147,843 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:node _acceptance/hop-tuan-tren-bang/rang | claude-haiku-5-5 | 22 | 24,263 | 44 | 1,440,736 | 1958 |
| review:measurement | claude-opus-5-5 | 22 | 21,753 | 46 | 2,425,246 | 237 |
| synthesize:report | claude-sonnet-5-5 | 3 | 14,575 | 6 | 162,727 | 85 |
| review:conventions | claude-opus-5-5 | 18 | 9,082 | 38 | 1,654,385 | 114 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 8,256 | 4 | 57,682 | 38 |
| review:bugs | claude-opus-5-5 | 11 | 8,194 | 24 | 863,075 | 92 |
| ui:E8 | claude-sonnet-5-5 | 10 | 5,460 | 24 | 1,157,013 | 211 |
| refute:hop-tuan-tren-bang.dom.tsx | claude-sonnet-5-5 | 13 | 5,140 | 26 | 842,674 | 91 |
| triage | claude-sonnet-5-5 | 2 | 4,412 | 4 | 55,663 | 38 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,163 | 4 | 52,515 | 25 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,784 | 4 | 52,808 | 34 |
| refute:hop-tuan-tren-bang.dom.tsx | claude-sonnet-5-5 | 8 | 3,110 | 16 | 392,007 | 55 |
| refute:hop-tuan-tren-bang.dom.tsx | claude-sonnet-5-5 | 8 | 3,031 | 16 | 412,395 | 52 |
| refute:hop-tuan-tren-bang.dom.tsx | claude-sonnet-5-5 | 5 | 2,977 | 10 | 227,622 | 43 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,687 | 4 | 53,020 | 83 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 2,420 | 4 | 52,455 | 23 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,295 | 4 | 52,990 | 302 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,212 | 4 | 6,068 | 611 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,200 | 4 | 3,034 | 452 |
| refute:hop-tuan-tren-bang.spec.ts | claude-sonnet-5-5 | 4 | 2,169 | 8 | 166,051 | 38 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 1,984 | 4 | 52,390 | 60 |
| refute:hop-tuan-tren-bang.dom.tsx | claude-sonnet-5-5 | 5 | 1,941 | 10 | 239,683 | 26 |
| refute:hop-tuan-tren-bang.dom.tsx | claude-sonnet-5-5 | 4 | 1,668 | 8 | 176,072 | 27 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,600 | 4 | 52,810 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,575 | 4 | 52,416 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,440 | 4 | 52,417 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,097 | 4 | 52,413 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,095 | 4 | 52,419 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 997 | 4 | 52,417 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 995 | 4 | 52,432 | 12 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 851 | 4 | 52,959 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 417 | 4 | 48,570 | 12 |


wall: 2204s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 8,256 | 57,682 | 38 | 08:20:32 | 08:21:11 |
| machine | 17 | 55,658 | 2,186,299 | 1960 | 08:20:33 | 08:53:13 |
| ui | 1 | 5,460 | 1,157,013 | 211 | 08:20:50 | 08:24:21 |
| review | 3 | 39,029 | 4,942,706 | 238 | 08:20:51 | 08:24:49 |
| triage | 1 | 4,412 | 55,663 | 38 | 08:53:16 | 08:53:54 |
| refute | 7 | 20,036 | 2,456,504 | 95 | 08:53:57 | 08:55:32 |
| capture | 1 | 417 | 48,570 | 12 | 08:55:35 | 08:55:48 |
| synthesize | 1 | 14,575 | 162,727 | 85 | 08:55:51 | 08:57:16 |

- **claude-haiku-5-5**: 17 agent · 54 calls · out 55,658 · in 108 · cache_read 2,186,299 · cache_create 1,031,522
- **claude-opus-5-5**: 3 agent · 51 calls · out 39,029 · in 108 · cache_read 4,942,706 · cache_create 378,252
- **claude-sonnet-5-5**: 12 agent · 66 calls · out 53,156 · in 136 · cache_read 3,938,159 · cache_create 878,801

### S4 round 1b — wf_437cb67e-c24 (26 agent, 129,466 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:node _acceptance/hop-tuan-tren-bang/rang | claude-haiku-5-5 | 21 | 22,458 | 42 | 1,360,207 | 1847 |
| review:measurement | claude-opus-5-5 | 23 | 16,493 | 46 | 2,237,296 | 189 |
| synthesize:report | claude-sonnet-5-5 | 3 | 12,930 | 6 | 162,463 | 65 |
| review:conventions | claude-opus-5-5 | 22 | 12,815 | 44 | 2,094,500 | 152 |
| review:bugs | claude-opus-5-5 | 16 | 11,859 | 34 | 1,413,100 | 134 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 8,217 | 4 | 57,671 | 37 |
| ui:E8 | claude-sonnet-5-5 | 10 | 6,868 | 24 | 1,160,859 | 194 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 4,132 | 4 | 52,958 | 34 |
| triage | claude-sonnet-5-5 | 2 | 3,924 | 4 | 55,380 | 25 |
| refute:hop-tuan.tsx | claude-sonnet-5-5 | 8 | 3,266 | 16 | 410,376 | 35 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,742 | 4 | 53,170 | 82 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,578 | 4 | 53,140 | 305 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 2,347 | 4 | 52,379 | 37 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,308 | 4 | 3,034 | 421 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,306 | 4 | 6,068 | 614 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 2,238 | 4 | 52,444 | 25 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,984 | 4 | 52,960 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,697 | 4 | 52,406 | 20 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,695 | 4 | 52,405 | 20 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,449 | 4 | 52,421 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,197 | 4 | 52,408 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,031 | 4 | 52,406 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 882 | 4 | 52,402 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 804 | 4 | 52,504 | 19 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 727 | 4 | 53,109 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 519 | 4 | 48,720 | 8 |


wall: 1997s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 8,217 | 57,671 | 37 | 09:04:10 | 09:04:47 |
| machine | 17 | 52,575 | 2,106,421 | 1850 | 09:04:10 | 09:35:00 |
| ui | 1 | 6,868 | 1,160,859 | 194 | 09:04:30 | 09:07:44 |
| review | 3 | 41,167 | 5,744,896 | 193 | 09:04:31 | 09:07:44 |
| triage | 1 | 3,924 | 55,380 | 25 | 09:35:03 | 09:35:29 |
| refute | 1 | 3,266 | 410,376 | 35 | 09:35:31 | 09:36:06 |
| capture | 1 | 519 | 48,720 | 8 | 09:36:10 | 09:36:18 |
| synthesize | 1 | 12,930 | 162,463 | 66 | 09:36:21 | 09:37:27 |

- **claude-haiku-5-5**: 17 agent · 53 calls · out 52,575 · in 106 · cache_read 2,106,421 · cache_create 1,030,850
- **claude-opus-5-5**: 3 agent · 61 calls · out 41,167 · in 124 · cache_read 5,744,896 · cache_create 383,134
- **claude-sonnet-5-5**: 6 agent · 27 calls · out 35,724 · in 58 · cache_read 1,895,469 · cache_create 499,291

### S4 round 2 — wf_a3af67a7-01a (23 agent, 83,591 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:node _acceptance/hop-tuan-tren-bang/rang | claude-haiku-5-5 | 19 | 19,323 | 38 | 1,198,833 | 1827 |
| synthesize:report | claude-sonnet-5-5 | 4 | 10,245 | 8 | 241,403 | 65 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 7,735 | 4 | 57,144 | 35 |
| review:bugs | claude-opus-5-5 | 14 | 6,472 | 28 | 963,042 | 79 |
| ui:E8 | claude-sonnet-5-5 | 11 | 5,873 | 26 | 1,311,956 | 213 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,894 | 4 | 52,366 | 35 |
| review:measurement | claude-opus-5-5 | 8 | 3,353 | 16 | 473,625 | 42 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,883 | 4 | 52,578 | 81 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,529 | 4 | 52,548 | 296 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,316 | 4 | 6,068 | 426 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 2,253 | 4 | 52,415 | 36 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 2,182 | 4 | 52,480 | 23 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,111 | 4 | 6,068 | 603 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,019 | 4 | 52,368 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,910 | 4 | 52,441 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,882 | 4 | 52,442 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,333 | 4 | 52,457 | 16 |
| review:conventions | claude-opus-5-5 | 4 | 1,180 | 8 | 170,878 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,080 | 4 | 52,444 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,067 | 4 | 52,442 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 890 | 4 | 52,438 | 14 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 647 | 4 | 52,517 | 11 |
| capture:provenance | claude-sonnet-5-5 | 2 | 414 | 4 | 48,128 | 8 |


wall: 1909s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 7,735 | 57,144 | 35 | 09:39:39 | 09:40:14 |
| machine | 16 | 48,319 | 1,892,905 | 1829 | 09:39:39 | 10:10:08 |
| ui | 1 | 5,873 | 1,311,956 | 213 | 09:39:39 | 09:43:12 |
| review | 3 | 11,005 | 1,607,545 | 79 | 09:39:57 | 09:41:17 |
| capture | 1 | 414 | 48,128 | 8 | 10:10:12 | 10:10:20 |
| synthesize | 1 | 10,245 | 241,403 | 65 | 10:10:23 | 10:11:28 |

- **claude-haiku-5-5**: 16 agent · 49 calls · out 48,319 · in 98 · cache_read 1,892,905 · cache_create 966,053
- **claude-sonnet-5-5**: 4 agent · 19 calls · out 24,267 · in 42 · cache_read 1,658,631 · cache_create 373,420
- **claude-opus-5-5**: 3 agent · 26 calls · out 11,005 · in 52 · cache_read 1,607,545 · cache_create 222,637

