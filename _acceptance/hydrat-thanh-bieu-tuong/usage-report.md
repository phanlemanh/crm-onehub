### S4 round 1 — wf_0ae62945-409 (18 agent, 26,882 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 5,303 | 6 | 262,448 | 42 |
| review:measurement | claude-opus-5-5 | 5 | 4,938 | 10 | 550,223 | 108 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,822 | 18 | 113,491 | 48 |
| review:bugs | claude-opus-5-5 | 8 | 2,331 | 16 | 971,036 | 109 |
| triage | claude-sonnet-5-5 | 2 | 2,062 | 4 | 113,717 | 21 |
| ui:E6u | claude-sonnet-5-5 | 10 | 1,815 | 20 | 1,176,592 | 234 |
| review:conventions | claude-opus-5-5 | 8 | 1,247 | 16 | 979,790 | 79 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 1,139 | 18 | 113,479 | 40 |
| baseline:diffBase | claude-sonnet-5-5 | 7 | 1,094 | 14 | 765,695 | 77 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 956 | 18 | 113,491 | 19 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 557 | 18 | 54,876 | 349 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 455 | 18 | 113,544 | 21 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 453 | 18 | 113,544 | 20 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 433 | 18 | 113,544 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 413 | 18 | 113,544 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 407 | 18 | 113,544 | 19 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 268 | 18 | 113,489 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 189 | 4 | 110,232 | 10 |


wall: 513s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,094 | 765,695 | 77 | 00:02:12 | 00:03:29 |
| machine | 10 | 7,903 | 1,076,546 | 434 | 00:02:12 | 00:09:27 |
| ui | 1 | 1,815 | 1,176,592 | 234 | 00:02:12 | 00:06:06 |
| review | 3 | 8,516 | 2,501,049 | 111 | 00:02:12 | 00:04:03 |
| triage | 1 | 2,062 | 113,717 | 21 | 00:09:28 | 00:09:49 |
| capture | 1 | 189 | 110,232 | 10 | 00:09:51 | 00:10:01 |
| synthesize | 1 | 5,303 | 262,448 | 42 | 00:10:03 | 00:10:45 |

- **claude-sonnet-5-5**: 5 agent · 24 calls · out 10,463 · in 48 · cache_read 2,428,684 · cache_create 581,855
- **claude-opus-5-5**: 3 agent · 21 calls · out 8,516 · in 42 · cache_read 2,501,049 · cache_create 341,430
- **claude-haiku-4-5-20251001**: 10 agent · 20 calls · out 7,903 · in 180 · cache_read 1,076,546 · cache_create 721,408

