### S4 round 1 — wf_ec6aff2c-6fb (21 agent, 33,278 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 7,114 | 8 | 345,322 | 68 |
| review:bugs | claude-opus-5-5 | 14 | 2,998 | 28 | 1,502,357 | 123 |
| triage | claude-sonnet-5-5 | 2 | 2,720 | 4 | 93,448 | 24 |
| ui:E3 | claude-sonnet-5-5 | 5 | 2,197 | 10 | 393,461 | 78 |
| ui:E4 | claude-sonnet-5-5 | 6 | 2,025 | 12 | 534,245 | 97 |
| ui:E6 | claude-sonnet-5-5 | 7 | 1,997 | 14 | 640,638 | 124 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,630 | 4 | 90,041 | 252 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,527 | 4 | 125,067 | 252 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,413 | 4 | 125,049 | 47 |
| review:measurement | claude-opus-5-5 | 10 | 1,343 | 20 | 1,065,866 | 118 |
| review:conventions | claude-opus-5-5 | 8 | 1,316 | 16 | 754,143 | 56 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,265 | 4 | 125,106 | 74 |
| machine:for t in "apps/app/components/crm/record | claude-haiku-5-5 | 2 | 1,193 | 4 | 125,281 | 12 |
| ui:E5b | claude-sonnet-5-5 | 7 | 1,100 | 14 | 646,605 | 149 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,002 | 4 | 125,051 | 11 |
| baseline:diffBase | claude-sonnet-5-5 | 13 | 969 | 26 | 1,228,870 | 89 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 481 | 4 | 125,114 | 11 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 404 | 4 | 125,089 | 13 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 265 | 4 | 125,076 | 235 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 167 | 4 | 125,045 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 152 | 4 | 89,126 | 10 |


wall: 998s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 969 | 1,228,870 | 89 | 06:27:37 | 06:29:07 |
| machine | 10 | 9,347 | 1,215,919 | 891 | 06:27:37 | 06:42:28 |
| ui | 4 | 7,319 | 2,214,949 | 153 | 06:27:37 | 06:30:11 |
| review | 3 | 5,657 | 3,322,366 | 124 | 06:27:37 | 06:29:42 |
| triage | 1 | 2,720 | 93,448 | 24 | 06:42:30 | 06:42:54 |
| capture | 1 | 152 | 89,126 | 10 | 06:42:57 | 06:43:06 |
| synthesize | 1 | 7,114 | 345,322 | 68 | 06:43:08 | 06:44:16 |

- **claude-sonnet-5-5**: 8 agent · 46 calls · out 18,274 · in 92 · cache_read 3,971,715 · cache_create 752,061
- **claude-opus-5-5**: 3 agent · 32 calls · out 5,657 · in 64 · cache_read 3,322,366 · cache_create 325,427
- **claude-haiku-5-5**: 10 agent · 20 calls · out 9,347 · in 40 · cache_read 1,215,919 · cache_create 656,924

