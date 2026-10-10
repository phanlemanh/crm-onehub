### S4 round 1 — wf_fd92ce28-fb6 (23 agent, 65,356 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 8 | 12,359 | 16 | 865,355 | 141 |
| review:bugs | claude-opus-5-5 | 21 | 12,109 | 42 | 2,557,162 | 175 |
| review:conventions | claude-opus-5-5 | 18 | 9,134 | 36 | 2,121,366 | 156 |
| synthesize:report | claude-sonnet-5-5 | 4 | 5,970 | 8 | 337,522 | 45 |
| baseline:diffBase | claude-sonnet-5-5 | 10 | 4,965 | 20 | 888,725 | 58 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,684 | 4 | 124,574 | 73 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,400 | 4 | 124,535 | 129 |
| refute:mot-nguon.mjs | claude-sonnet-5-5 | 5 | 2,150 | 10 | 381,402 | 26 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,871 | 4 | 124,519 | 10 |
| triage | claude-sonnet-5-5 | 2 | 1,842 | 4 | 91,892 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,036 | 4 | 124,569 | 14 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 976 | 4 | 124,517 | 42 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 941 | 4 | 124,570 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 916 | 4 | 124,612 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 849 | 4 | 124,609 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 821 | 4 | 124,610 | 10 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 799 | 4 | 124,544 | 230 |
| machine:bun _acceptance/quyet-gop-y-noi-dung-ly- | claude-haiku-5-5 | 2 | 792 | 4 | 124,564 | 8 |
| machine:node _acceptance/quyet-gop-y-noi-dung-ly | claude-haiku-5-5 | 2 | 761 | 4 | 124,562 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 747 | 4 | 124,519 | 220 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 665 | 4 | 124,513 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 323 | 4 | 88,773 | 7 |
| machine:bun _acceptance/quyet-gop-y-noi-dung-ly- | claude-haiku-5-5 | 2 | 246 | 4 | 124,563 | 21 |


wall: 808s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,965 | 888,725 | 58 | 08:57:32 | 08:58:30 |
| machine | 15 | 16,504 | 1,868,380 | 711 | 08:57:32 | 09:09:23 |
| review | 3 | 33,602 | 5,543,883 | 179 | 08:57:32 | 09:00:31 |
| triage | 1 | 1,842 | 91,892 | 18 | 09:09:23 | 09:09:42 |
| refute | 1 | 2,150 | 381,402 | 26 | 09:09:42 | 09:10:08 |
| capture | 1 | 323 | 88,773 | 7 | 09:10:08 | 09:10:15 |
| synthesize | 1 | 5,970 | 337,522 | 45 | 09:10:15 | 09:11:00 |

- **claude-opus-5-5**: 3 agent · 47 calls · out 33,602 · in 94 · cache_read 5,543,883 · cache_create 372,327
- **claude-sonnet-5-5**: 5 agent · 23 calls · out 15,250 · in 46 · cache_read 1,788,314 · cache_create 516,716
- **claude-haiku-5-5**: 15 agent · 30 calls · out 16,504 · in 60 · cache_read 1,868,380 · cache_create 905,746

### S4 round 2 — wf_a91b94f2-7cf (17 agent, 37,818 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 7,302 | 12 | 582,543 | 62 |
| review:bugs | claude-opus-5-5 | 5 | 4,528 | 10 | 442,094 | 57 |
| review:conventions | claude-opus-5-5 | 7 | 4,142 | 14 | 625,769 | 58 |
| review:measurement | claude-opus-5-5 | 9 | 4,069 | 18 | 883,061 | 61 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,635 | 4 | 124,570 | 47 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,440 | 4 | 124,572 | 12 |
| baseline:diffBase | claude-sonnet-5-5 | 5 | 2,334 | 10 | 383,590 | 30 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,930 | 4 | 124,627 | 70 |
| triage | claude-sonnet-5-5 | 2 | 1,422 | 4 | 91,456 | 15 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,049 | 4 | 124,588 | 249 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 857 | 4 | 124,597 | 227 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 851 | 4 | 124,663 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 844 | 4 | 124,662 | 9 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 829 | 4 | 89,562 | 203 |
| machine:bun _acceptance/quyet-gop-y-noi-dung-ly- | claude-haiku-5-5 | 2 | 713 | 4 | 124,617 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 542 | 4 | 124,566 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 331 | 4 | 88,826 | 8 |


wall: 900s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,334 | 383,590 | 30 | 09:20:12 | 09:20:42 |
| machine | 10 | 13,690 | 1,211,024 | 815 | 09:20:12 | 09:33:47 |
| review | 3 | 12,739 | 1,950,924 | 63 | 09:20:12 | 09:21:16 |
| triage | 1 | 1,422 | 91,456 | 15 | 09:33:47 | 09:34:03 |
| capture | 1 | 331 | 88,826 | 8 | 09:34:03 | 09:34:11 |
| synthesize | 1 | 7,302 | 582,543 | 62 | 09:34:11 | 09:35:12 |

- **claude-sonnet-5-5**: 4 agent · 15 calls · out 11,389 · in 30 · cache_read 1,146,415 · cache_create 416,917
- **claude-opus-5-5**: 3 agent · 21 calls · out 12,739 · in 42 · cache_read 1,950,924 · cache_create 275,213
- **claude-haiku-5-5**: 10 agent · 20 calls · out 13,690 · in 40 · cache_read 1,211,024 · cache_create 642,396

