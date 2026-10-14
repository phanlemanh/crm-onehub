### wf_05a7ab01-3a8 (30 agent, 118,243 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 43 | 25,672 | 86 | 4,557,499 | 348 |
| review:measurement | claude-opus-5-5 | 31 | 23,135 | 62 | 2,740,706 | 298 |
| synthesize:report | claude-sonnet-5-5 | 3 | 12,460 | 6 | 133,210 | 91 |
| review:conventions | claude-opus-5-5 | 23 | 11,939 | 46 | 1,998,830 | 171 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 10,243 | 4 | 48,482 | 58 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,488 | 4 | 41,868 | 25 |
| ui:E14 | claude-sonnet-5-5 | 9 | 4,380 | 18 | 851,998 | 141 |
| triage | claude-sonnet-5-5 | 3 | 4,289 | 6 | 94,506 | 34 |
| refute:so-bo-mau.ts | claude-sonnet-5-5 | 8 | 3,287 | 16 | 375,767 | 42 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,212 | 4 | 42,012 | 14 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,167 | 4 | 42,028 | 294 |
| machine:bun _acceptance/sua-sau-chay-that/rang/s | claude-haiku-5-5 | 2 | 959 | 4 | 41,864 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 928 | 4 | 41,874 | 14 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 920 | 4 | 41,866 | 14 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 836 | 4 | 41,872 | 10 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 828 | 4 | 41,872 | 10 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 819 | 4 | 41,880 | 9 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 788 | 4 | 41,882 | 10 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 782 | 4 | 42,067 | 80 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 780 | 4 | 38,962 | 276 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 770 | 4 | 41,877 | 11 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 747 | 4 | 42,037 | 228 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 709 | 4 | 41,877 | 11 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 666 | 4 | 41,872 | 15 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 658 | 4 | 42,010 | 101 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 607 | 4 | 41,877 | 8 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 603 | 4 | 41,875 | 7 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 579 | 4 | 41,877 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 501 | 4 | 42,006 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 491 | 4 | 37,932 | 18 |


wall: 1187s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 10,243 | 48,482 | 58 | 08:17:21 | 08:18:19 |
| machine | 21 | 22,347 | 877,355 | 1002 | 08:17:21 | 08:34:04 |
| ui | 1 | 4,380 | 851,998 | 141 | 08:17:34 | 08:19:55 |
| review | 3 | 60,746 | 9,297,035 | 350 | 08:17:34 | 08:23:25 |
| triage | 1 | 4,289 | 94,506 | 34 | 08:34:04 | 08:34:38 |
| refute | 1 | 3,287 | 375,767 | 42 | 08:34:38 | 08:35:20 |
| capture | 1 | 491 | 37,932 | 18 | 08:35:20 | 08:35:37 |
| synthesize | 1 | 12,460 | 133,210 | 91 | 08:35:37 | 08:37:08 |

- **claude-opus-5-5**: 3 agent · 97 calls · out 60,746 · in 194 · cache_read 9,297,035 · cache_create 403,626
- **claude-sonnet-5-5**: 6 agent · 27 calls · out 35,150 · in 54 · cache_read 1,541,895 · cache_create 424,187
- **claude-haiku-5-5**: 21 agent · 42 calls · out 22,347 · in 84 · cache_read 877,355 · cache_create 889,133

