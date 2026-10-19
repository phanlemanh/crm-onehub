### S4 round 1 — wf_7bb8496b-377 (26 agent, 78,740 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 12,315 | 6 | 118,580 | 72 |
| review:measurement | claude-opus-5-5 | 9 | 10,721 | 18 | 523,372 | 119 |
| review:bugs | claude-opus-5-5 | 25 | 9,652 | 50 | 1,566,099 | 135 |
| ui:E5 | claude-sonnet-5-5 | 7 | 4,854 | 14 | 625,466 | 74 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 4,809 | 4 | 42,539 | 48 |
| review:conventions | claude-opus-5-5 | 7 | 4,486 | 14 | 323,850 | 55 |
| refute:chup-truong.mjs | claude-sonnet-5-5 | 12 | 4,265 | 24 | 534,126 | 55 |
| judge:E5j:spec-alignment | claude-sonnet-5-5 | 2 | 3,137 | 4 | 41,593 | 24 |
| judge:E5j:operational-feasibility | claude-sonnet-5-5 | 2 | 2,831 | 4 | 41,595 | 23 |
| triage | claude-sonnet-5-5 | 2 | 2,612 | 4 | 40,820 | 21 |
| judge:E5j:domain-correctness | claude-sonnet-5-5 | 2 | 2,509 | 4 | 38,231 | 20 |
| refute:chu-man-tieng-viet.spec.ts | claude-sonnet-5-5 | 4 | 2,412 | 8 | 136,595 | 26 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,241 | 4 | 40,842 | 12 |
| refute:chu-man-tieng-viet.spec.ts | claude-sonnet-5-5 | 5 | 2,218 | 10 | 185,490 | 29 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 1,890 | 4 | 40,924 | 28 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,211 | 4 | 40,858 | 296 |
| machine:cd apps/app && bun test ./test/chu-man-t | claude-haiku-5-5 | 2 | 813 | 4 | 40,871 | 9 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 806 | 4 | 40,884 | 9 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 803 | 4 | 40,897 | 68 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 799 | 4 | 40,867 | 237 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 723 | 4 | 37,973 | 268 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 691 | 4 | 40,936 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 691 | 4 | 40,840 | 25 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 522 | 4 | 40,836 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 499 | 4 | 36,765 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 230 | 4 | 40,939 | 9 |


wall: 1074s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,809 | 42,539 | 48 | 23:51:23 | 23:52:10 |
| machine | 12 | 11,420 | 487,667 | 915 | 23:51:23 | 00:06:38 |
| ui | 1 | 4,854 | 625,466 | 74 | 23:51:23 | 23:52:36 |
| judge | 3 | 8,477 | 121,419 | 26 | 23:51:23 | 23:51:48 |
| review | 3 | 24,859 | 2,413,321 | 146 | 23:51:23 | 23:53:48 |
| triage | 1 | 2,612 | 40,820 | 21 | 00:06:38 | 00:06:59 |
| refute | 3 | 8,895 | 856,211 | 55 | 00:06:59 | 00:07:55 |
| capture | 1 | 499 | 36,765 | 10 | 00:07:55 | 00:08:05 |
| synthesize | 1 | 12,315 | 118,580 | 72 | 00:08:05 | 00:09:17 |

- **claude-sonnet-5-5**: 11 agent · 43 calls · out 42,461 · in 86 · cache_read 1,841,800 · cache_create 637,185
- **claude-opus-5-5**: 3 agent · 41 calls · out 24,859 · in 82 · cache_read 2,413,321 · cache_create 224,581
- **claude-haiku-5-5**: 12 agent · 24 calls · out 11,420 · in 48 · cache_read 487,667 · cache_create 495,511


### S4 round 2 — wf_ceee8834-961 (20 agent, 50,783 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 8,349 | 8 | 179,146 | 58 |
| review:bugs | claude-opus-5-5 | 11 | 5,504 | 22 | 621,601 | 71 |
| review:measurement | claude-opus-5-5 | 8 | 4,876 | 16 | 410,668 | 60 |
| ui:E5 | claude-sonnet-5-5 | 7 | 4,650 | 14 | 625,156 | 84 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,933 | 4 | 40,878 | 33 |
| review:conventions | claude-opus-5-5 | 6 | 3,390 | 12 | 236,828 | 40 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 2,746 | 4 | 40,697 | 34 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,249 | 4 | 38,011 | 257 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,152 | 4 | 40,880 | 12 |
| judge:E5j:spec-alignment | claude-sonnet-5-5 | 2 | 2,093 | 4 | 41,631 | 17 |
| judge:E5j:operational-feasibility | claude-sonnet-5-5 | 2 | 1,897 | 4 | 41,633 | 15 |
| judge:E5j:domain-correctness | claude-sonnet-5-5 | 2 | 1,839 | 4 | 38,269 | 14 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 1,671 | 4 | 40,962 | 31 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,202 | 4 | 40,896 | 287 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,086 | 4 | 40,935 | 69 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 869 | 4 | 40,905 | 233 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 660 | 4 | 40,874 | 8 |
| machine:cd apps/app && bun test ./test/chu-man-t | claude-haiku-5-5 | 2 | 568 | 4 | 40,909 | 7 |
| triage | claude-sonnet-5-5 | 2 | 555 | 4 | 39,169 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 494 | 4 | 36,803 | 8 |


wall: 974s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,746 | 40,697 | 34 | 01:58:38 | 01:59:12 |
| machine | 9 | 14,390 | 365,250 | 901 | 01:58:38 | 02:13:39 |
| ui | 1 | 4,650 | 625,156 | 84 | 01:58:38 | 02:00:02 |
| judge | 3 | 5,829 | 121,533 | 19 | 01:58:38 | 01:58:58 |
| review | 3 | 13,770 | 1,269,097 | 72 | 01:58:38 | 01:59:50 |
| triage | 1 | 555 | 39,169 | 7 | 02:13:39 | 02:13:46 |
| capture | 1 | 494 | 36,803 | 8 | 02:13:46 | 02:13:55 |
| synthesize | 1 | 8,349 | 179,146 | 58 | 02:13:55 | 02:14:52 |

- **claude-sonnet-5-5**: 8 agent · 23 calls · out 22,623 · in 46 · cache_read 1,042,504 · cache_create 478,794
- **claude-opus-5-5**: 3 agent · 25 calls · out 13,770 · in 50 · cache_read 1,269,097 · cache_create 198,785
- **claude-haiku-5-5**: 9 agent · 18 calls · out 14,390 · in 36 · cache_read 365,250 · cache_create 375,393

