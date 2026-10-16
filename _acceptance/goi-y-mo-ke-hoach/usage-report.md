### S4 round 1 — wf_1ecf373a-006 (30 agent, 60,973 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 16,010 | 6 | 118,922 | 91 |
| triage | claude-sonnet-5-5 | 2 | 4,552 | 4 | 29,069 | 29 |
| ui:E6 | claude-sonnet-5-5 | 8 | 4,199 | 16 | 606,639 | 106 |
| review:bugs | claude-opus-5-5 | 45 | 3,324 | 90 | 3,574,947 | 316 |
| review:conventions | claude-opus-5-5 | 34 | 3,206 | 68 | 2,655,541 | 252 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 4 | 2,931 | 8 | 98,481 | 27 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 4 | 2,843 | 8 | 99,715 | 21 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 3 | 2,278 | 6 | 56,750 | 16 |
| review:measurement | claude-opus-5-5 | 18 | 2,224 | 36 | 1,318,943 | 204 |
| machine:node _acceptance/goi-y-mo-ke-hoach/rang/ | claude-haiku-5-5 | 2 | 2,113 | 4 | 25,811 | 13 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,825 | 4 | 25,761 | 16 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,817 | 4 | 22,837 | 309 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,691 | 4 | 25,731 | 304 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,597 | 4 | 25,773 | 16 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,523 | 4 | 25,772 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,374 | 4 | 25,706 | 9 |
| refute:config.yaml | claude-sonnet-5-5 | 4 | 1,183 | 8 | 83,687 | 23 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,103 | 4 | 25,704 | 35 |
| machine:node _acceptance/goi-y-mo-ke-hoach/rang/ | claude-haiku-5-5 | 2 | 865 | 4 | 25,743 | 54 |
| refute:config.yaml | claude-sonnet-5-5 | 4 | 801 | 8 | 90,568 | 17 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 612 | 4 | 25,772 | 13 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 522 | 4 | 30,345 | 45 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 484 | 4 | 25,775 | 13 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 430 | 4 | 2,869 | 324 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 342 | 4 | 25,777 | 11 |
| machine:node _acceptance/goi-y-mo-ke-hoach/rang/ | claude-haiku-5-5 | 2 | 340 | 4 | 25,746 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 221 | 4 | 25,794 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 25,700 | 6 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 203 | 4 | 25,747 | 11 |
| capture:provenance | claude-sonnet-5-5 | 2 | 145 | 4 | 21,630 | 5 |


wall: 1173s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 522 | 30,345 | 45 | 11:12:51 | 11:13:35 |
| machine | 17 | 16,755 | 412,018 | 1016 | 11:12:51 | 11:29:47 |
| ui | 1 | 4,199 | 606,639 | 106 | 11:12:51 | 11:14:37 |
| judge | 3 | 8,052 | 254,946 | 27 | 11:12:51 | 11:13:18 |
| review | 3 | 8,754 | 7,549,431 | 318 | 11:13:02 | 11:18:19 |
| triage | 1 | 4,552 | 29,069 | 29 | 11:29:49 | 11:30:19 |
| refute | 2 | 1,984 | 174,255 | 23 | 11:30:21 | 11:30:44 |
| capture | 1 | 145 | 21,630 | 5 | 11:30:46 | 11:30:51 |
| synthesize | 1 | 16,010 | 118,922 | 91 | 11:30:53 | 11:32:24 |

- **claude-sonnet-5-5**: 10 agent · 36 calls · out 35,464 · in 72 · cache_read 1,235,806 · cache_create 445,470
- **claude-opus-5-5**: 3 agent · 97 calls · out 8,754 · in 194 · cache_read 7,549,431 · cache_create 357,294
- **claude-haiku-5-5**: 17 agent · 34 calls · out 16,755 · in 68 · cache_read 412,018 · cache_create 439,729

### S4 round 2 — wf_fc069164-486 (24 agent, 49,316 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 10,712 | 8 | 165,216 | 97 |
| machine:node _acceptance/goi-y-mo-ke-hoach/rang/ | claude-haiku-5-5 | 2 | 3,941 | 4 | 25,896 | 31 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,660 | 4 | 25,778 | 27 |
| triage | claude-sonnet-5-5 | 2 | 2,939 | 4 | 27,380 | 23 |
| review:measurement | claude-opus-5-5 | 10 | 2,586 | 20 | 357,439 | 97 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 4 | 2,394 | 8 | 100,148 | 20 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 3 | 2,135 | 6 | 52,930 | 14 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,039 | 4 | 25,835 | 73 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,966 | 4 | 25,805 | 296 |
| review:conventions | claude-opus-5-5 | 8 | 1,886 | 16 | 274,076 | 71 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,874 | 4 | 25,821 | 16 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 3 | 1,733 | 6 | 56,292 | 15 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,699 | 4 | 22,911 | 302 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,670 | 4 | 2,869 | 323 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,579 | 4 | 25,780 | 12 |
| review:bugs | claude-opus-5-5 | 16 | 1,495 | 32 | 695,289 | 114 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,242 | 4 | 25,846 | 14 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,205 | 4 | 25,847 | 14 |
| refute:khong-xoa-expect.mjs | claude-sonnet-5-5 | 5 | 911 | 10 | 117,756 | 30 |
| refute:khong-xoa-expect.mjs | claude-sonnet-5-5 | 3 | 841 | 6 | 51,642 | 19 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 231 | 4 | 25,849 | 11 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 218 | 4 | 25,774 | 8 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 209 | 4 | 25,846 | 12 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 21,704 | 16 |


wall: 1230s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 13 | 21,533 | 309,857 | 1054 | 11:40:49 | 11:58:23 |
| judge | 3 | 6,262 | 209,370 | 22 | 11:40:49 | 11:41:11 |
| review | 3 | 5,967 | 1,326,804 | 116 | 11:40:49 | 11:42:45 |
| triage | 1 | 2,939 | 27,380 | 23 | 11:58:25 | 11:58:48 |
| refute | 2 | 1,752 | 169,398 | 32 | 11:58:50 | 11:59:22 |
| capture | 1 | 151 | 21,704 | 16 | 11:59:25 | 11:59:40 |
| synthesize | 1 | 10,712 | 165,216 | 97 | 11:59:42 | 12:01:19 |

- **claude-sonnet-5-5**: 8 agent · 26 calls · out 21,816 · in 52 · cache_read 593,068 · cache_create 297,818
- **claude-haiku-5-5**: 13 agent · 26 calls · out 21,533 · in 52 · cache_read 309,857 · cache_create 350,384
- **claude-opus-5-5**: 3 agent · 34 calls · out 5,967 · in 68 · cache_read 1,326,804 · cache_create 172,569

