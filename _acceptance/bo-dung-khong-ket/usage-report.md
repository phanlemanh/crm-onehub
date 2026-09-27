### S4 round 1 — wf_56409396-4a0 (22 agent, 65,337 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 22,364 | 4 | 91,468 | 236 |
| baseline:diffBase | claude-sonnet-5 | 25 | 16,258 | 50 | 2,175,604 | 2489 |
| triage | claude-sonnet-5 | 2 | 6,902 | 4 | 75,430 | 86 |
| ui:E6 | claude-sonnet-5 | 60 | 6,485 | 120 | 7,280,465 | 669 |
| review:measurement | claude-opus-5-5 | 12 | 1,853 | 24 | 1,136,287 | 167 |
| review:conventions | claude-opus-5-5 | 19 | 1,828 | 38 | 1,773,354 | 175 |
| review:bugs | claude-opus-5-5 | 29 | 1,772 | 58 | 3,082,925 | 252 |
| machine:bun apps/agent/test/eve-tran/chay.ts cha | claude-haiku-4-5-20251001 | 2 | 1,144 | 18 | 76,018 | 29 |
| machine:bun apps/agent/test/eve-tran/chay.ts cha | claude-haiku-4-5-20251001 | 2 | 949 | 18 | 76,018 | 34 |
| capture:provenance | claude-sonnet-5 | 2 | 732 | 4 | 69,961 | 10 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 697 | 18 | 75,985 | 296 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 568 | 18 | 76,033 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 517 | 18 | 76,029 | 20 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 467 | 18 | 76,025 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 452 | 18 | 75,993 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 443 | 18 | 75,993 | 23 |
| machine:node _acceptance/bo-dung-khong-ket/rang/ | claude-haiku-4-5-20251001 | 2 | 438 | 18 | 76,017 | 20 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 429 | 18 | 76,036 | 21 |
| machine:node ${CLAUDE_PLUGIN_ROOT:-$(node script | claude-haiku-4-5-20251001 | 2 | 405 | 18 | 76,066 | 19 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 319 | 18 | 75,991 | 11 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 313 | 18 | 76,027 | 22 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 76,029 | 19 |


wall: 2735s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 16,258 | 2,175,604 | 2489 | 12:08:39 | 12:50:08 |
| machine | 14 | 7,143 | 1,064,260 | 352 | 12:08:39 | 12:14:31 |
| ui | 1 | 6,485 | 7,280,465 | 669 | 12:09:05 | 12:20:13 |
| review | 3 | 5,453 | 5,992,566 | 255 | 12:09:05 | 12:13:20 |
| triage | 1 | 6,902 | 75,430 | 86 | 12:20:17 | 12:21:43 |
| capture | 1 | 732 | 69,961 | 10 | 12:50:08 | 12:50:18 |
| synthesize | 1 | 22,364 | 91,468 | 236 | 12:50:18 | 12:54:14 |

- **claude-sonnet-5**: 5 agent · 91 calls · out 52,741 · in 182 · cache_read 9,692,928 · cache_create 594,847
- **claude-opus-5-5**: 3 agent · 60 calls · out 5,453 · in 120 · cache_read 5,992,566 · cache_create 276,047
- **claude-haiku-4-5-20251001**: 14 agent · 28 calls · out 7,143 · in 252 · cache_read 1,064,260 · cache_create 387,326

### S4 round 2 — wf_35967ab8-20c (23 agent, 149,689 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E6 | claude-sonnet-5 | 46 | 42,153 | 92 | 5,964,455 | 603 |
| synthesize:report | claude-sonnet-5 | 12 | 37,851 | 24 | 1,239,350 | 442 |
| baseline:diffBase | claude-sonnet-5 | 28 | 17,752 | 56 | 2,478,828 | 237 |
| review:bugs | claude-opus-5-5 | 29 | 11,390 | 58 | 2,689,310 | 183 |
| triage | claude-sonnet-5 | 2 | 7,313 | 4 | 73,311 | 91 |
| review:conventions | claude-opus-5-5 | 17 | 7,002 | 34 | 1,410,662 | 106 |
| refute:evals.yaml | claude-sonnet-5 | 13 | 6,755 | 26 | 1,061,980 | 109 |
| review:measurement | claude-opus-5-5 | 8 | 5,079 | 16 | 629,110 | 73 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,388 | 34 | 156,700 | 324 |
| machine:bun apps/agent/test/eve-tran/chay.ts cha | claude-haiku-4-5-20251001 | 2 | 1,370 | 18 | 76,007 | 23 |
| machine:bun apps/agent/test/eve-tran/chay.ts cha | claude-haiku-4-5-20251001 | 2 | 1,346 | 18 | 76,007 | 32 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 3 | 1,299 | 28 | 137,255 | 16 |
| machine:node ${CLAUDE_PLUGIN_ROOT:-$(node script | claude-haiku-4-5-20251001 | 2 | 1,092 | 18 | 76,055 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,035 | 18 | 76,018 | 17 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,024 | 18 | 76,014 | 15 |
| machine:node _acceptance/bo-dung-khong-ket/rang/ | claude-haiku-4-5-20251001 | 2 | 949 | 18 | 76,006 | 14 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 910 | 18 | 76,016 | 15 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 849 | 18 | 76,025 | 13 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 829 | 18 | 76,022 | 16 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 773 | 18 | 76,042 | 20 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 608 | 18 | 76,040 | 9 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 488 | 18 | 76,018 | 16 |
| capture:provenance | claude-sonnet-5 | 2 | 434 | 4 | 70,106 | 7 |


wall: 1269s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 17,752 | 2,478,828 | 237 | 13:03:09 | 13:07:06 |
| machine | 14 | 13,960 | 1,206,225 | 369 | 13:03:09 | 13:09:18 |
| ui | 1 | 42,153 | 5,964,455 | 603 | 13:03:25 | 13:13:28 |
| review | 3 | 23,471 | 4,729,082 | 187 | 13:03:26 | 13:06:33 |
| triage | 1 | 7,313 | 73,311 | 91 | 13:13:28 | 13:14:59 |
| refute | 1 | 6,755 | 1,061,980 | 109 | 13:14:59 | 13:16:48 |
| capture | 1 | 434 | 70,106 | 7 | 13:16:48 | 13:16:55 |
| synthesize | 1 | 37,851 | 1,239,350 | 442 | 13:16:55 | 13:24:17 |

- **claude-sonnet-5**: 6 agent · 103 calls · out 112,258 · in 206 · cache_read 10,888,030 · cache_create 683,794
- **claude-opus-5-5**: 3 agent · 54 calls · out 23,471 · in 108 · cache_read 4,729,082 · cache_create 240,519
- **claude-haiku-4-5-20251001**: 14 agent · 31 calls · out 13,960 · in 278 · cache_read 1,206,225 · cache_create 413,098

