### S4 vòng 5 — bam-kr-mo-chi-tiet-kr — wf_67368644-58b (19 agent, 91,189 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:bun _acceptance/bam-kr-mo-chi-tiet-kr/ra | claude-haiku-5-5 | 32 | 36,006 | 64 | 2,260,391 | 3133 |
| review:bugs | claude-opus-5-5 | 18 | 9,396 | 38 | 1,353,899 | 152 |
| synthesize:report | claude-sonnet-5-5 | 6 | 8,312 | 12 | 369,261 | 69 |
| review:conventions | claude-opus-5-5 | 13 | 7,103 | 26 | 927,910 | 106 |
| review:measurement | claude-opus-5-5 | 9 | 5,592 | 18 | 548,512 | 82 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 5,010 | 4 | 51,613 | 35 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,708 | 4 | 50,057 | 83 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,633 | 4 | 50,027 | 294 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,334 | 4 | 3,034 | 348 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,922 | 4 | 6,068 | 582 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,920 | 4 | 50,002 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,354 | 4 | 50,082 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,267 | 4 | 50,105 | 11 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,255 | 4 | 50,000 | 29 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,137 | 4 | 50,085 | 11 |
| triage | claude-sonnet-5-5 | 2 | 1,043 | 4 | 48,649 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,024 | 4 | 50,111 | 11 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 830 | 4 | 49,996 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 343 | 4 | 45,768 | 7 |


wall: 3230s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,010 | 51,613 | 35 | 11:56:47 | 11:57:22 |
| machine | 12 | 54,390 | 2,719,958 | 3135 | 11:56:47 | 12:49:02 |
| review | 3 | 22,091 | 2,830,321 | 156 | 11:56:47 | 11:59:23 |
| triage | 1 | 1,043 | 48,649 | 12 | 12:49:04 | 12:49:16 |
| capture | 1 | 343 | 45,768 | 7 | 12:49:18 | 12:49:25 |
| synthesize | 1 | 8,312 | 369,261 | 69 | 12:49:28 | 12:50:37 |

- **claude-haiku-5-5**: 12 agent · 54 calls · out 54,390 · in 108 · cache_read 2,719,958 · cache_create 739,025
- **claude-opus-5-5**: 3 agent · 40 calls · out 22,091 · in 82 · cache_read 2,830,321 · cache_create 267,687
- **claude-sonnet-5-5**: 4 agent · 12 calls · out 14,708 · in 24 · cache_read 515,291 · cache_create 251,353

