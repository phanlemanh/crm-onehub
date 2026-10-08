### S4 round 1 — wf_785ce27f-423 (25 agent, 40,622 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 8,864 | 6 | 244,351 | 63 |
| triage | claude-sonnet-5-5 | 2 | 8,812 | 4 | 102,736 | 68 |
| review:measurement | claude-opus-5-5 | 9 | 3,536 | 18 | 1,003,319 | 221 |
| review:conventions | claude-opus-5-5 | 8 | 2,968 | 16 | 867,506 | 91 |
| review:bugs | claude-opus-5-5 | 7 | 2,200 | 14 | 813,853 | 207 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 5 | 1,777 | 42 | 335,569 | 107 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,408 | 18 | 28,957 | 345 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,299 | 18 | 99,356 | 239 |
| baseline:diffBase | claude-sonnet-5-5 | 11 | 1,185 | 22 | 1,049,527 | 97 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 4 | 1,177 | 34 | 252,229 | 483 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 955 | 18 | 140,768 | 39 |
| machine:bun _acceptance/ca-chap-chon-cach-ly/ran | claude-haiku-4-5-20251001 | 2 | 937 | 18 | 99,370 | 188 |
| refute:evals.yaml | claude-sonnet-5-5 | 4 | 852 | 8 | 338,393 | 24 |
| refute:dot-bien.mjs | claude-sonnet-5-5 | 3 | 802 | 6 | 196,592 | 19 |
| machine:bun _acceptance/ca-chap-chon-cach-ly/ran | claude-haiku-4-5-20251001 | 2 | 649 | 18 | 99,374 | 132 |
| machine:bun _acceptance/ca-chap-chon-cach-ly/ran | claude-haiku-4-5-20251001 | 2 | 610 | 18 | 99,371 | 17 |
| machine:bun _acceptance/ca-chap-chon-cach-ly/ran | claude-haiku-4-5-20251001 | 2 | 496 | 18 | 99,372 | 36 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 439 | 18 | 99,383 | 25 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 426 | 18 | 99,341 | 32 |
| machine:bun _acceptance/ca-chap-chon-cach-ly/ran | claude-haiku-4-5-20251001 | 2 | 392 | 18 | 99,372 | 71 |
| machine:cd apps/agent-okr && bun test test/khoi- | claude-haiku-4-5-20251001 | 2 | 375 | 18 | 99,370 | 12 |
| machine:cd apps/agent-okr && bun test test/khoi- | claude-haiku-4-5-20251001 | 2 | 307 | 18 | 99,372 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 147 | 4 | 94,204 | 26 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 99,339 | 14 |
| machine:cd apps/agent-okr && bun test test/khoi- | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 99,369 | 16 |


wall: 1464s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,185 | 1,049,527 | 97 | 01:33:24 | 01:35:01 |
| machine | 16 | 11,256 | 1,949,912 | 1271 | 01:33:24 | 01:54:35 |
| review | 3 | 8,704 | 2,684,678 | 238 | 01:33:24 | 01:37:22 |
| triage | 1 | 8,812 | 102,736 | 68 | 01:54:37 | 01:55:45 |
| refute | 2 | 1,654 | 534,985 | 27 | 01:55:47 | 01:56:14 |
| capture | 1 | 147 | 94,204 | 26 | 01:56:16 | 01:56:42 |
| synthesize | 1 | 8,864 | 244,351 | 63 | 01:56:44 | 01:57:48 |

- **claude-sonnet-5-5**: 6 agent · 25 calls · out 20,662 · in 50 · cache_read 2,025,803 · cache_create 631,039
- **claude-opus-5-5**: 3 agent · 24 calls · out 8,704 · in 48 · cache_read 2,684,678 · cache_create 379,422
- **claude-haiku-4-5-20251001**: 16 agent · 37 calls · out 11,256 · in 328 · cache_read 1,949,912 · cache_create 794,691

