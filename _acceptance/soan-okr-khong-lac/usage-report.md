### soan-okr-khong-lac S4 r1 — wf_8a65417f-17f (24 agent, 83,020 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 13 | 15,383 | 26 | 1,593,073 | 174 |
| review:bugs | claude-opus-5-5 | 28 | 13,152 | 56 | 3,634,965 | 191 |
| synthesize:report | claude-sonnet-5-5 | 5 | 11,462 | 10 | 474,128 | 80 |
| review:conventions | claude-opus-5-5 | 20 | 10,219 | 40 | 2,306,089 | 139 |
| ui:E10 | claude-sonnet-5-5 | 16 | 7,071 | 32 | 1,574,471 | 144 |
| triage | claude-sonnet-5-5 | 2 | 5,023 | 4 | 92,512 | 39 |
| baseline:diffBase | claude-sonnet-5-5 | 5 | 3,373 | 10 | 375,914 | 43 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,779 | 4 | 121,694 | 67 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,339 | 4 | 121,664 | 239 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,939 | 4 | 121,639 | 10 |
| machine:bun _acceptance/soan-okr-khong-lac/rang/ | claude-haiku-5-5 | 2 | 972 | 4 | 121,434 | 9 |
| machine:bun _acceptance/soan-okr-khong-lac/rang/ | claude-haiku-5-5 | 2 | 963 | 4 | 121,433 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 929 | 4 | 121,488 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 854 | 4 | 121,492 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 827 | 4 | 121,546 | 7 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 819 | 4 | 121,655 | 211 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 785 | 4 | 121,400 | 218 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 783 | 4 | 121,443 | 7 |
| machine:cd apps/app && bun test ./lib/search-par | claude-haiku-5-5 | 2 | 760 | 4 | 121,422 | 7 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 625 | 4 | 121,637 | 23 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 622 | 4 | 121,468 | 6 |
| machine:node _acceptance/soan-okr-khong-lac/rang | claude-haiku-5-5 | 2 | 532 | 4 | 121,432 | 6 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 482 | 4 | 121,633 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 327 | 4 | 85,893 | 9 |


wall: 903s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,373 | 375,914 | 43 | 16:18:57 | 16:19:40 |
| machine | 16 | 17,010 | 1,944,480 | 774 | 16:18:57 | 16:31:51 |
| ui | 1 | 7,071 | 1,574,471 | 144 | 16:18:57 | 16:21:21 |
| review | 3 | 38,754 | 7,534,127 | 193 | 16:19:05 | 16:22:17 |
| triage | 1 | 5,023 | 92,512 | 39 | 16:31:51 | 16:32:31 |
| capture | 1 | 327 | 85,893 | 9 | 16:32:31 | 16:32:40 |
| synthesize | 1 | 11,462 | 474,128 | 80 | 16:32:40 | 16:34:00 |

- **claude-opus-5-5**: 3 agent · 61 calls · out 38,754 · in 122 · cache_read 7,534,127 · cache_create 419,250
- **claude-sonnet-5-5**: 5 agent · 30 calls · out 27,256 · in 60 · cache_read 2,602,918 · cache_create 544,068
- **claude-haiku-5-5**: 16 agent · 32 calls · out 17,010 · in 64 · cache_read 1,944,480 · cache_create 916,490

