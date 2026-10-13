### S4 round 1 — wf_2f0a5234-efe (28 agent, 148,911 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 44 | 28,292 | 88 | 6,808,913 | 361 |
| review:measurement | claude-opus-5-5 | 23 | 20,451 | 46 | 2,253,104 | 242 |
| synthesize:report | claude-sonnet-5-5 | 4 | 17,843 | 8 | 235,935 | 107 |
| review:conventions | claude-opus-5-5 | 28 | 17,794 | 56 | 3,162,499 | 228 |
| ui:E12 | claude-sonnet-5-5 | 12 | 9,700 | 24 | 1,273,918 | 180 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 8,229 | 4 | 45,778 | 113 |
| judge:E12j:domain-correctness | claude-sonnet-5-5 | 3 | 7,353 | 6 | 113,282 | 54 |
| judge:E12j:spec-alignment | claude-sonnet-5-5 | 4 | 6,334 | 8 | 169,749 | 49 |
| triage | claude-sonnet-5-5 | 2 | 6,107 | 4 | 46,132 | 42 |
| judge:E12j:operational-feasibility | claude-sonnet-5-5 | 2 | 5,582 | 4 | 42,419 | 41 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,885 | 4 | 40,864 | 30 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,740 | 4 | 40,921 | 70 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 2,022 | 4 | 40,937 | 62 |
| machine:node _acceptance/khung-man-chung/rang/de | claude-haiku-5-5 | 2 | 1,615 | 4 | 40,931 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,270 | 4 | 40,994 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,081 | 4 | 41,014 | 10 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 1,079 | 4 | 40,953 | 9 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 981 | 4 | 40,866 | 7 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 964 | 4 | 40,882 | 253 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 814 | 4 | 40,904 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 803 | 4 | 40,958 | 7 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 755 | 4 | 40,891 | 233 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 751 | 4 | 40,866 | 232 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 667 | 4 | 40,957 | 8 |
| machine:cd apps/app && bun test ./test/khung-man | claude-haiku-5-5 | 2 | 581 | 4 | 40,889 | 6 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 578 | 4 | 40,860 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 416 | 4 | 36,789 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 224 | 4 | 40,955 | 12 |


wall: 990s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 8,229 | 45,778 | 113 | 03:29:48 | 03:31:40 |
| machine | 17 | 20,810 | 695,642 | 833 | 03:29:48 | 03:43:40 |
| ui | 1 | 9,700 | 1,273,918 | 180 | 03:29:55 | 03:32:55 |
| judge | 3 | 19,269 | 325,450 | 54 | 03:29:56 | 03:30:50 |
| review | 3 | 66,537 | 12,224,516 | 362 | 03:29:58 | 03:35:59 |
| triage | 1 | 6,107 | 46,132 | 42 | 03:43:40 | 03:44:22 |
| capture | 1 | 416 | 36,789 | 8 | 03:44:22 | 03:44:30 |
| synthesize | 1 | 17,843 | 235,935 | 107 | 03:44:30 | 03:46:18 |

- **claude-opus-5-5**: 3 agent · 95 calls · out 66,537 · in 190 · cache_read 12,224,516 · cache_create 498,761
- **claude-sonnet-5-5**: 8 agent · 31 calls · out 61,564 · in 62 · cache_read 1,964,002 · cache_create 616,491
- **claude-haiku-5-5**: 17 agent · 34 calls · out 20,810 · in 68 · cache_read 695,642 · cache_create 696,806


### S4 round 2 — wf_27710dfe-2ce (33 agent, 137,872 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 26 | 21,686 | 52 | 2,791,654 | 279 |
| synthesize:report | claude-sonnet-5-5 | 5 | 18,725 | 10 | 318,321 | 119 |
| review:conventions | claude-opus-5-5 | 22 | 15,502 | 44 | 2,259,255 | 195 |
| review:bugs | claude-opus-5-5 | 25 | 15,045 | 50 | 2,956,026 | 193 |
| ui:E12 | claude-sonnet-5-5 | 13 | 12,824 | 26 | 1,460,686 | 212 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 10,056 | 4 | 47,519 | 117 |
| triage | claude-sonnet-5-5 | 2 | 6,866 | 4 | 46,128 | 46 |
| judge:E12j:spec-alignment | claude-sonnet-5-5 | 4 | 4,586 | 8 | 171,484 | 37 |
| judge:E12j:operational-feasibility | claude-sonnet-5-5 | 3 | 4,404 | 6 | 96,355 | 36 |
| judge:E12j:domain-correctness | claude-sonnet-5-5 | 4 | 4,358 | 8 | 168,115 | 34 |
| refute:chup-man.mjs | claude-sonnet-5-5 | 4 | 2,778 | 8 | 132,197 | 29 |
| refute:chup-man.mjs | claude-sonnet-5-5 | 6 | 2,113 | 12 | 238,816 | 28 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 1,898 | 4 | 40,941 | 63 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,808 | 4 | 41,018 | 12 |
| machine:node _acceptance/khung-man-chung/rang/de | claude-haiku-5-5 | 2 | 1,703 | 4 | 40,935 | 20 |
| machine:bun _acceptance/khung-man-chung/rang/chu | claude-haiku-5-5 | 2 | 1,324 | 4 | 40,904 | 52 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,139 | 4 | 40,870 | 9 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,100 | 4 | 40,886 | 256 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,008 | 4 | 40,895 | 229 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 959 | 4 | 40,961 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 897 | 4 | 40,998 | 8 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 854 | 4 | 40,925 | 66 |
| machine:cd apps/app && bun test ./test/khung-man | claude-haiku-5-5 | 2 | 843 | 4 | 40,903 | 6 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 768 | 4 | 40,957 | 8 |
| machine:cd apps/app && bun test ./test/khung-man | claude-haiku-5-5 | 2 | 767 | 4 | 40,893 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 725 | 4 | 38,001 | 242 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 706 | 4 | 40,962 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 649 | 4 | 40,868 | 24 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 636 | 4 | 40,959 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 572 | 4 | 40,864 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 329 | 4 | 36,793 | 8 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 217 | 4 | 40,908 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 27 | 4 | 40,961 | 7 |


wall: 1040s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 10,056 | 47,519 | 117 | 08:32:04 | 08:34:01 |
| machine | 20 | 18,600 | 815,609 | 835 | 08:32:04 | 08:45:58 |
| ui | 1 | 12,824 | 1,460,686 | 212 | 08:32:13 | 08:35:45 |
| judge | 3 | 13,348 | 435,954 | 39 | 08:32:13 | 08:32:52 |
| review | 3 | 52,233 | 8,006,935 | 282 | 08:32:16 | 08:36:58 |
| triage | 1 | 6,866 | 46,128 | 46 | 08:45:58 | 08:46:45 |
| refute | 2 | 4,891 | 371,013 | 31 | 08:46:45 | 08:47:16 |
| capture | 1 | 329 | 36,793 | 8 | 08:47:16 | 08:47:24 |
| synthesize | 1 | 18,725 | 318,321 | 119 | 08:47:24 | 08:49:24 |

- **claude-opus-5-5**: 3 agent · 73 calls · out 52,233 · in 146 · cache_read 8,006,935 · cache_create 447,573
- **claude-sonnet-5-5**: 10 agent · 45 calls · out 67,039 · in 90 · cache_read 2,716,414 · cache_create 728,980
- **claude-haiku-5-5**: 20 agent · 40 calls · out 18,600 · in 80 · cache_read 815,609 · cache_create 821,179


### S4 round 3 — wf_152c882f-b4e (30 agent, 122,722 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 40 | 21,282 | 80 | 4,785,327 | 308 |
| review:conventions | claude-opus-5-5 | 30 | 19,522 | 60 | 3,592,165 | 250 |
| review:measurement | claude-opus-5-5 | 18 | 16,850 | 36 | 1,803,781 | 239 |
| synthesize:report | claude-sonnet-5-5 | 4 | 14,556 | 8 | 217,500 | 83 |
| ui:E12 | claude-sonnet-5-5 | 10 | 12,430 | 20 | 1,080,089 | 201 |
| judge:E12j:spec-alignment | claude-sonnet-5-5 | 3 | 4,658 | 6 | 96,409 | 38 |
| judge:E12j:operational-feasibility | claude-sonnet-5-5 | 3 | 4,372 | 6 | 96,413 | 34 |
| judge:E12j:domain-correctness | claude-sonnet-5-5 | 3 | 4,267 | 6 | 93,047 | 34 |
| triage | claude-sonnet-5-5 | 2 | 3,603 | 4 | 42,990 | 26 |
| machine:bun _acceptance/khung-man-chung/rang/chu | claude-haiku-5-5 | 2 | 2,165 | 4 | 40,933 | 54 |
| machine:KHO_TAI_LIEU_BLOB_TOKEN= bash _acceptanc | claude-haiku-5-5 | 2 | 2,093 | 4 | 41,001 | 67 |
| machine:node _acceptance/khung-man-chung/rang/de | claude-haiku-5-5 | 2 | 1,768 | 4 | 40,964 | 22 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,571 | 4 | 41,047 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,115 | 4 | 41,027 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,004 | 4 | 40,991 | 12 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 980 | 4 | 40,899 | 10 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 972 | 4 | 40,986 | 11 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 970 | 4 | 40,924 | 235 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 921 | 4 | 38,030 | 253 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 919 | 4 | 40,915 | 256 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 915 | 4 | 40,954 | 67 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 839 | 4 | 40,937 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 768 | 4 | 40,897 | 25 |
| machine:cd apps/app && bun test ./test/khung-man | claude-haiku-5-5 | 2 | 742 | 4 | 40,932 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 711 | 4 | 40,988 | 12 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 635 | 4 | 40,893 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 588 | 4 | 40,990 | 11 |
| machine:cd apps/app && bun test ./test/khung-man | claude-haiku-5-5 | 2 | 535 | 4 | 40,922 | 11 |
| capture:provenance | claude-sonnet-5-5 | 2 | 499 | 4 | 36,822 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 472 | 4 | 40,990 | 11 |


wall: 972s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 20 | 20,683 | 816,220 | 854 | 11:27:43 | 11:41:57 |
| ui | 1 | 12,430 | 1,080,089 | 201 | 11:27:55 | 11:31:17 |
| judge | 3 | 13,297 | 285,869 | 40 | 11:27:56 | 11:28:36 |
| review | 3 | 57,654 | 10,181,273 | 309 | 11:27:56 | 11:33:06 |
| triage | 1 | 3,603 | 42,990 | 26 | 11:41:57 | 11:42:23 |
| capture | 1 | 499 | 36,822 | 9 | 11:42:23 | 11:42:32 |
| synthesize | 1 | 14,556 | 217,500 | 83 | 11:42:32 | 11:43:55 |

- **claude-opus-5-5**: 3 agent · 88 calls · out 57,654 · in 176 · cache_read 10,181,273 · cache_create 472,459
- **claude-sonnet-5-5**: 7 agent · 27 calls · out 44,385 · in 54 · cache_read 1,663,270 · cache_create 548,760
- **claude-haiku-5-5**: 20 agent · 40 calls · out 20,683 · in 80 · cache_read 816,220 · cache_create 822,373

