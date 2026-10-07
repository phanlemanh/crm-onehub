### S4 round 1 — wf_0ffd7b59-f88 (37 agent, 63,453 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 9,097 | 8 | 323,892 | 83 |
| judge:E18:operational-feasibility | claude-sonnet-5-5 | 6 | 5,530 | 12 | 794,395 | 58 |
| judge:E18:domain-correctness | claude-sonnet-5-5 | 8 | 3,981 | 16 | 1,157,582 | 53 |
| ui:E12 | claude-sonnet-5-5 | 13 | 3,909 | 26 | 1,188,727 | 114 |
| judge:E18:spec-alignment | claude-sonnet-5-5 | 7 | 3,112 | 14 | 792,120 | 47 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,093 | 18 | 81,903 | 37 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 11 | 2,852 | 90 | 652,714 | 85 |
| baseline:diffBase | claude-sonnet-5-5 | 18 | 2,822 | 36 | 1,442,124 | 211 |
| triage | claude-sonnet-5-5 | 2 | 2,565 | 4 | 74,606 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,192 | 18 | 81,907 | 32 |
| review:measurement | claude-opus-5-5 | 17 | 2,025 | 34 | 2,237,734 | 190 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,889 | 18 | 82,176 | 81 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,754 | 18 | 82,144 | 72 |
| machine:bun _acceptance/don-okr-nhap-sai/rang/so | claude-haiku-4-5-20251001 | 2 | 1,554 | 18 | 81,900 | 21 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 4 | 1,481 | 34 | 203,398 | 405 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-4-5-20251001 | 2 | 1,080 | 18 | 81,923 | 46 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,036 | 18 | 82,129 | 38 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 934 | 18 | 81,902 | 27 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 908 | 18 | 82,129 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 864 | 18 | 81,903 | 27 |
| review:bugs | claude-opus-5-5 | 43 | 840 | 86 | 5,383,143 | 265 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 816 | 18 | 81,924 | 16 |
| refute:okr-xoa-muc-tieu.spec.ts | claude-sonnet-5-5 | 4 | 807 | 8 | 228,162 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 801 | 18 | 81,905 | 18 |
| refute:luu-tru-chat.spec.ts | claude-sonnet-5-5 | 4 | 788 | 8 | 228,879 | 21 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 776 | 18 | 81,926 | 16 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 716 | 18 | 82,150 | 261 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 705 | 18 | 81,902 | 24 |
| machine:bun _acceptance/don-okr-nhap-sai/rang/so | claude-haiku-4-5-20251001 | 2 | 697 | 18 | 81,897 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 666 | 18 | 81,902 | 24 |
| review:conventions | claude-opus-5-5 | 25 | 615 | 50 | 2,778,763 | 168 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 575 | 18 | 81,905 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 532 | 18 | 81,907 | 23 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 488 | 18 | 81,926 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 483 | 18 | 82,127 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 322 | 18 | 81,926 | 12 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 71,539 | 8 |


wall: 1036s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,822 | 1,442,124 | 211 | 02:01:32 | 02:05:04 |
| machine | 24 | 27,214 | 2,659,525 | 893 | 02:01:32 | 02:16:26 |
| ui | 1 | 3,909 | 1,188,727 | 114 | 02:02:09 | 02:04:03 |
| judge | 3 | 12,623 | 2,744,097 | 63 | 02:02:13 | 02:03:16 |
| review | 3 | 3,480 | 10,399,640 | 268 | 02:02:22 | 02:06:50 |
| triage | 1 | 2,565 | 74,606 | 23 | 02:16:27 | 02:16:50 |
| refute | 2 | 1,595 | 457,041 | 23 | 02:16:52 | 02:17:15 |
| capture | 1 | 148 | 71,539 | 8 | 02:17:17 | 02:17:24 |
| synthesize | 1 | 9,097 | 323,892 | 83 | 02:17:26 | 02:18:48 |

- **claude-sonnet-5-5**: 10 agent · 68 calls · out 32,759 · in 136 · cache_read 6,302,026 · cache_create 1,168,761
- **claude-haiku-4-5-20251001**: 24 agent · 59 calls · out 27,214 · in 520 · cache_read 2,659,525 · cache_create 715,293
- **claude-opus-5-5**: 3 agent · 85 calls · out 3,480 · in 170 · cache_read 10,399,640 · cache_create 406,548

### S4 round 2 — wf_f7ec3801-de5 (28 agent, 40,976 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 7,577 | 6 | 205,563 | 59 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,696 | 18 | 84,175 | 45 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,244 | 18 | 84,171 | 38 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,898 | 18 | 84,134 | 43 |
| judge:E18:domain-correctness | claude-sonnet-5-5 | 7 | 2,768 | 14 | 637,898 | 53 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,088 | 18 | 84,173 | 29 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,896 | 18 | 84,181 | 80 |
| baseline:diffBase | claude-sonnet-5-5 | 13 | 1,874 | 26 | 1,033,531 | 92 |
| judge:E18:spec-alignment | claude-sonnet-5-5 | 7 | 1,798 | 14 | 612,327 | 45 |
| judge:E18:operational-feasibility | claude-sonnet-5-5 | 8 | 1,574 | 16 | 804,441 | 95 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,353 | 18 | 84,149 | 209 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,238 | 18 | 84,155 | 263 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 988 | 18 | 84,173 | 26 |
| review:bugs | claude-opus-5-5 | 10 | 940 | 20 | 865,283 | 74 |
| triage | claude-sonnet-5-5 | 2 | 893 | 4 | 75,783 | 18 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 790 | 18 | 84,134 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 749 | 18 | 84,175 | 25 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 663 | 18 | 84,192 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 649 | 18 | 84,170 | 25 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 547 | 18 | 84,170 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 541 | 18 | 84,171 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 506 | 18 | 84,170 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 467 | 18 | 84,220 | 29 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 342 | 18 | 84,132 | 11 |
| review:conventions | claude-opus-5-5 | 6 | 339 | 12 | 466,911 | 34 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 307 | 18 | 84,136 | 200 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 73,785 | 11 |
| review:measurement | claude-opus-5-5 | 6 | 101 | 12 | 473,691 | 53 |


wall: 924s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,874 | 1,033,531 | 92 | 02:29:17 | 02:30:49 |
| machine | 18 | 22,962 | 1,514,981 | 832 | 02:29:17 | 02:43:09 |
| judge | 3 | 6,140 | 2,054,666 | 98 | 02:29:42 | 02:31:19 |
| review | 3 | 1,380 | 1,805,885 | 77 | 02:29:44 | 02:31:02 |
| triage | 1 | 893 | 75,783 | 18 | 02:43:11 | 02:43:29 |
| capture | 1 | 150 | 73,785 | 11 | 02:43:30 | 02:43:41 |
| synthesize | 1 | 7,577 | 205,563 | 59 | 02:43:43 | 02:44:41 |

- **claude-sonnet-5-5**: 7 agent · 42 calls · out 16,634 · in 84 · cache_read 3,443,328 · cache_create 607,782
- **claude-haiku-4-5-20251001**: 18 agent · 36 calls · out 22,962 · in 324 · cache_read 1,514,981 · cache_create 574,857
- **claude-opus-5-5**: 3 agent · 22 calls · out 1,380 · in 44 · cache_read 1,805,885 · cache_create 188,220

