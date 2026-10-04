### S4 round 1 — wf_f924033f-aca (25 agent, 92,765 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 15 | 17,084 | 30 | 2,238,170 | 196 |
| review:bugs | claude-opus-5-5 | 24 | 15,029 | 48 | 3,646,999 | 195 |
| review:conventions | claude-opus-5-5 | 20 | 12,016 | 40 | 2,853,745 | 170 |
| synthesize:report | claude-sonnet-5-5 | 3 | 8,320 | 6 | 287,333 | 59 |
| baseline:diffBase | claude-sonnet-5-5 | 8 | 5,882 | 16 | 765,552 | 1156 |
| ui:E9 | claude-sonnet-5-5 | 8 | 5,462 | 16 | 926,022 | 330 |
| triage | claude-sonnet-5-5 | 2 | 4,202 | 4 | 122,034 | 35 |
| refute:soan-okr-ly-do-loi.spec.ts | claude-sonnet-5-5 | 6 | 2,324 | 12 | 644,585 | 33 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,971 | 18 | 91,644 | 215 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,952 | 18 | 120,735 | 185 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,816 | 18 | 120,729 | 183 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 1,743 | 18 | 120,900 | 24 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 1,696 | 18 | 120,722 | 24 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 1,688 | 18 | 120,749 | 25 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 1,562 | 18 | 120,870 | 26 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,469 | 18 | 120,714 | 37 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,463 | 18 | 120,761 | 65 |
| machine:cd apps/app && bun test test/messages-gu | claude-haiku-4-5-20251001 | 2 | 1,354 | 18 | 120,804 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,190 | 18 | 120,725 | 26 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,170 | 18 | 120,751 | 20 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,121 | 18 | 120,714 | 15 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 875 | 18 | 120,750 | 21 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 778 | 18 | 120,712 | 12 |
| capture:provenance | claude-sonnet-5-5 | 2 | 360 | 4 | 116,483 | 7 |
| machine:cd apps/app && bun test ./test/soan-okr- | claude-haiku-4-5-20251001 | 2 | 238 | 18 | 120,723 | 12 |


wall: 1223s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,882 | 765,552 | 1156 | 08:17:38 | 08:36:54 |
| machine | 16 | 22,086 | 1,903,003 | 713 | 08:17:38 | 08:29:32 |
| ui | 1 | 5,462 | 926,022 | 330 | 08:17:38 | 08:23:08 |
| review | 3 | 44,129 | 8,738,914 | 205 | 08:17:52 | 08:21:17 |
| triage | 1 | 4,202 | 122,034 | 35 | 08:29:32 | 08:30:07 |
| refute | 1 | 2,324 | 644,585 | 33 | 08:30:07 | 08:30:40 |
| capture | 1 | 360 | 116,483 | 7 | 08:36:55 | 08:37:02 |
| synthesize | 1 | 8,320 | 287,333 | 59 | 08:37:02 | 08:38:01 |

- **claude-opus-5-5**: 3 agent · 59 calls · out 44,129 · in 118 · cache_read 8,738,914 · cache_create 472,269
- **claude-sonnet-5-5**: 6 agent · 29 calls · out 26,550 · in 58 · cache_read 2,862,009 · cache_create 961,915
- **claude-haiku-4-5-20251001**: 16 agent · 32 calls · out 22,086 · in 288 · cache_read 1,903,003 · cache_create 1,124,907

### S4 round 2 — wf_911d4c80-5de (27 agent, 106,867 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 36 | 27,792 | 72 | 6,227,713 | 357 |
| review:measurement | claude-opus-5-5 | 21 | 15,369 | 42 | 3,414,010 | 192 |
| review:conventions | claude-opus-5-5 | 20 | 11,418 | 40 | 2,808,495 | 159 |
| synthesize:report | claude-sonnet-5-5 | 4 | 9,432 | 8 | 445,170 | 70 |
| baseline:diffBase | claude-sonnet-5-5 | 11 | 6,906 | 22 | 1,299,990 | 85 |
| ui:E9 | claude-sonnet-5-5 | 10 | 5,775 | 20 | 1,208,618 | 324 |
| triage | claude-sonnet-5-5 | 2 | 3,333 | 4 | 121,130 | 28 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,338 | 18 | 121,026 | 77 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,165 | 18 | 121,000 | 189 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 2,073 | 18 | 120,961 | 28 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,961 | 18 | 120,786 | 28 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,753 | 18 | 120,994 | 177 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 4 | 1,680 | 34 | 189,654 | 745 |
| machine:cd apps/app && bun test test/messages-gu | claude-haiku-4-5-20251001 | 2 | 1,632 | 18 | 120,865 | 21 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,615 | 18 | 120,979 | 20 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,399 | 18 | 120,979 | 33 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,328 | 18 | 120,812 | 17 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 1,147 | 18 | 120,783 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,138 | 18 | 120,819 | 14 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 1,112 | 18 | 120,811 | 17 |
| machine:cd apps/app && bun test ./test/soan-okr- | claude-haiku-4-5-20251001 | 2 | 1,004 | 18 | 120,793 | 13 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 972 | 18 | 120,812 | 20 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 871 | 18 | 120,977 | 13 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 842 | 18 | 120,810 | 22 |
| machine:cd apps/app && bun test ./test/soan-okr- | claude-haiku-4-5-20251001 | 2 | 732 | 18 | 120,784 | 15 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 710 | 18 | 120,931 | 38 |
| capture:provenance | claude-sonnet-5-5 | 2 | 370 | 4 | 116,804 | 8 |


wall: 1359s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 6,906 | 1,299,990 | 85 | 10:10:45 | 10:12:10 |
| machine | 19 | 26,472 | 2,365,576 | 1253 | 10:10:45 | 10:31:38 |
| ui | 1 | 5,775 | 1,208,618 | 324 | 10:11:06 | 10:16:30 |
| review | 3 | 54,579 | 12,450,218 | 359 | 10:11:07 | 10:17:06 |
| triage | 1 | 3,333 | 121,130 | 28 | 10:31:38 | 10:32:06 |
| capture | 1 | 370 | 116,804 | 8 | 10:32:06 | 10:32:14 |
| synthesize | 1 | 9,432 | 445,170 | 70 | 10:32:14 | 10:33:24 |

- **claude-opus-5-5**: 3 agent · 77 calls · out 54,579 · in 154 · cache_read 12,450,218 · cache_create 521,425
- **claude-sonnet-5-5**: 5 agent · 29 calls · out 25,816 · in 58 · cache_read 3,191,712 · cache_create 703,073
- **claude-haiku-4-5-20251001**: 19 agent · 40 calls · out 26,472 · in 358 · cache_read 2,365,576 · cache_create 1,430,626

