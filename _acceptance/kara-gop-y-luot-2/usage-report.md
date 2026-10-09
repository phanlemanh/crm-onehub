### kara-gop-y-luot-2 S4 r1 — wf_27ee7e04-d65 (32 agent, 122,808 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 32 | 27,415 | 64 | 5,030,472 | 400 |
| review:bugs | claude-opus-5-5 | 35 | 24,503 | 70 | 5,473,176 | 376 |
| review:conventions | claude-opus-5-5 | 39 | 18,656 | 78 | 5,957,717 | 335 |
| ui:E15c | claude-sonnet-5-5 | 19 | 11,162 | 38 | 2,000,991 | 378 |
| synthesize:report | claude-sonnet-5-5 | 4 | 9,757 | 8 | 364,773 | 77 |
| baseline:diffBase | claude-sonnet-5-5 | 6 | 4,919 | 12 | 386,839 | 1537 |
| triage | claude-sonnet-5-5 | 2 | 4,671 | 4 | 94,442 | 43 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,408 | 4 | 123,904 | 235 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,920 | 4 | 123,934 | 67 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,709 | 4 | 123,879 | 11 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,462 | 4 | 88,869 | 222 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,010 | 4 | 123,973 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 959 | 4 | 123,895 | 239 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 933 | 4 | 123,974 | 10 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 922 | 4 | 123,877 | 41 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 911 | 4 | 123,975 | 8 |
| machine:bun _acceptance/kara-gop-y-luot-2/rang/d | claude-haiku-5-5 | 2 | 896 | 4 | 123,915 | 40 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 880 | 4 | 123,973 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 867 | 4 | 123,973 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 857 | 4 | 123,973 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 846 | 4 | 123,970 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 815 | 4 | 123,970 | 13 |
| machine:cd apps/app && bun test ./test/gop-y-dun | claude-haiku-5-5 | 2 | 774 | 4 | 123,924 | 6 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 728 | 4 | 123,912 | 13 |
| machine:bun _acceptance/kara-gop-y-luot-2/rang/n | claude-haiku-5-5 | 2 | 699 | 4 | 123,916 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 664 | 4 | 123,873 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 417 | 4 | 88,133 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 225 | 4 | 123,973 | 9 |
| machine:node _acceptance/kara-gop-y-luot-2/rang/ | claude-haiku-5-5 | 2 | 223 | 4 | 123,914 | 6 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 200 | 4 | 123,972 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 200 | 4 | 123,970 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 200 | 4 | 123,973 | 10 |


wall: 1626s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,919 | 386,839 | 1537 | 12:27:36 | 12:53:13 |
| machine | 24 | 21,308 | 2,939,481 | 821 | 12:27:36 | 12:41:18 |
| ui | 1 | 11,162 | 2,000,991 | 378 | 12:27:49 | 12:34:07 |
| review | 3 | 70,574 | 16,461,365 | 403 | 12:27:51 | 12:34:34 |
| triage | 1 | 4,671 | 94,442 | 43 | 12:41:18 | 12:42:01 |
| capture | 1 | 417 | 88,133 | 12 | 12:53:13 | 12:53:25 |
| synthesize | 1 | 9,757 | 364,773 | 77 | 12:53:25 | 12:54:42 |

- **claude-opus-5-5**: 3 agent · 106 calls · out 70,574 · in 212 · cache_read 16,461,365 · cache_create 518,456
- **claude-sonnet-5-5**: 5 agent · 33 calls · out 30,926 · in 66 · cache_read 2,935,178 · cache_create 673,413
- **claude-haiku-5-5**: 24 agent · 48 calls · out 21,308 · in 96 · cache_read 2,939,481 · cache_create 1,463,845

