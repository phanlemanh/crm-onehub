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

### wf_0af918f8-c5d (15 agent, 36,709 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 8,201 | 8 | 202,234 | 57 |
| ui:E14 | claude-sonnet-5-5 | 8 | 4,425 | 16 | 739,823 | 131 |
| review:bugs | claude-opus-5-5 | 10 | 4,273 | 20 | 525,313 | 59 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,730 | 4 | 41,829 | 109 |
| review:measurement | claude-opus-5-5 | 8 | 3,568 | 16 | 403,697 | 61 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,296 | 4 | 41,831 | 13 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,122 | 4 | 41,831 | 233 |
| review:conventions | claude-opus-5-5 | 5 | 1,763 | 10 | 189,249 | 26 |
| machine:bun _acceptance/sua-sau-chay-that/rang/s | claude-haiku-5-5 | 2 | 1,230 | 4 | 41,864 | 10 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,146 | 4 | 41,886 | 84 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,018 | 4 | 41,847 | 282 |
| triage | claude-sonnet-5-5 | 2 | 964 | 4 | 40,214 | 22 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 847 | 4 | 41,856 | 252 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 720 | 4 | 41,825 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 406 | 4 | 37,751 | 9 |


wall: 1070s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 8 | 13,109 | 334,769 | 982 | 08:38:40 | 08:55:02 |
| ui | 1 | 4,425 | 739,823 | 131 | 08:38:40 | 08:40:51 |
| review | 3 | 9,604 | 1,118,259 | 63 | 08:38:40 | 08:39:43 |
| triage | 1 | 964 | 40,214 | 22 | 08:55:02 | 08:55:24 |
| capture | 1 | 406 | 37,751 | 9 | 08:55:24 | 08:55:33 |
| synthesize | 1 | 8,201 | 202,234 | 57 | 08:55:33 | 08:56:30 |

- **claude-sonnet-5-5**: 4 agent · 16 calls · out 13,996 · in 32 · cache_read 1,020,022 · cache_create 283,044
- **claude-opus-5-5**: 3 agent · 23 calls · out 9,604 · in 46 · cache_read 1,118,259 · cache_create 187,185
- **claude-haiku-5-5**: 8 agent · 16 calls · out 13,109 · in 32 · cache_read 334,769 · cache_create 339,349

### wf_9e545ebd-8e1 (15 agent, 41,012 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 8 | 9,580 | 16 | 515,934 | 105 |
| review:measurement | claude-opus-5-5 | 10 | 7,782 | 20 | 535,891 | 93 |
| review:bugs | claude-opus-5-5 | 7 | 5,064 | 14 | 348,895 | 62 |
| ui:E14 | claude-sonnet-5-5 | 9 | 4,597 | 18 | 847,262 | 81 |
| review:conventions | claude-opus-5-5 | 7 | 3,924 | 14 | 307,109 | 48 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,172 | 4 | 41,836 | 251 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,047 | 4 | 41,861 | 14 |
| triage | claude-sonnet-5-5 | 2 | 1,072 | 4 | 40,579 | 11 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 857 | 4 | 41,886 | 234 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 807 | 4 | 41,877 | 289 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 756 | 4 | 41,855 | 10 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 752 | 4 | 41,916 | 81 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 724 | 4 | 41,859 | 92 |
| capture:provenance | claude-sonnet-5-5 | 2 | 492 | 4 | 37,781 | 9 |
| machine:bun _acceptance/sua-sau-chay-that/rang/s | claude-haiku-5-5 | 2 | 386 | 4 | 41,869 | 8 |


wall: 1097s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 8 | 8,501 | 334,959 | 971 | 08:58:22 | 09:14:33 |
| ui | 1 | 4,597 | 847,262 | 81 | 08:58:22 | 08:59:43 |
| review | 3 | 16,770 | 1,191,895 | 95 | 08:58:22 | 08:59:57 |
| triage | 1 | 1,072 | 40,579 | 11 | 09:14:33 | 09:14:44 |
| capture | 1 | 492 | 37,781 | 9 | 09:14:44 | 09:14:53 |
| synthesize | 1 | 9,580 | 515,934 | 105 | 09:14:53 | 09:16:39 |

- **claude-sonnet-5-5**: 4 agent · 21 calls · out 15,741 · in 42 · cache_read 1,441,556 · cache_create 292,995
- **claude-opus-5-5**: 3 agent · 24 calls · out 16,770 · in 48 · cache_read 1,191,895 · cache_create 194,129
- **claude-haiku-5-5**: 8 agent · 16 calls · out 8,501 · in 32 · cache_read 334,959 · cache_create 338,533

