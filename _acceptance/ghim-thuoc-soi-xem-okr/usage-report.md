### S4 round 1 — wf_c90de98c-7e3 (25 agent, 71,965 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 16 | 12,535 | 32 | 1,050,057 | 181 |
| synthesize:report | claude-sonnet-5-5 | 5 | 10,130 | 10 | 261,101 | 69 |
| review:measurement | claude-opus-5-5 | 8 | 8,526 | 16 | 405,461 | 105 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 6,226 | 4 | 45,573 | 38 |
| judge:E3:spec-alignment | claude-sonnet-5-5 | 2 | 4,249 | 4 | 43,133 | 30 |
| review:conventions | claude-opus-5-5 | 10 | 3,858 | 20 | 532,172 | 61 |
| judge:E3:domain-correctness | claude-sonnet-5-5 | 2 | 3,328 | 4 | 39,771 | 24 |
| judge:E3:operational-feasibility | claude-sonnet-5-5 | 2 | 3,048 | 4 | 43,135 | 26 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,372 | 4 | 42,483 | 249 |
| machine:bun _acceptance/khoa-con-bat-xa-tran/ran | claude-haiku-5-5 | 2 | 1,994 | 4 | 42,504 | 10 |
| triage | claude-sonnet-5-5 | 2 | 1,979 | 4 | 42,022 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,963 | 4 | 42,458 | 10 |
| machine:bun _acceptance/ghim-thuoc-soi-xem-okr/r | claude-haiku-5-5 | 2 | 1,273 | 4 | 42,505 | 14 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,150 | 4 | 2,869 | 326 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,046 | 4 | 42,456 | 68 |
| machine:bun _acceptance/luat-kho-vong-doi/rang/c | claude-haiku-5-5 | 2 | 989 | 4 | 42,489 | 9 |
| machine:bun _acceptance/ghim-thuoc-soi-xem-okr/r | claude-haiku-5-5 | 2 | 987 | 4 | 42,502 | 10 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 984 | 4 | 42,495 | 10 |
| machine:bun _acceptance/gioi-han-duyet-cay-okr/r | claude-haiku-5-5 | 2 | 977 | 4 | 42,502 | 12 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 936 | 4 | 42,513 | 76 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 824 | 4 | 39,589 | 277 |
| machine:bun _acceptance/ghim-thuoc-soi-xem-okr/r | claude-haiku-5-5 | 2 | 780 | 4 | 42,505 | 26 |
| machine:bun _acceptance/ghim-thuoc-soi-xem-okr/r | claude-haiku-5-5 | 2 | 761 | 4 | 42,509 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 696 | 4 | 42,452 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 354 | 4 | 38,379 | 6 |


wall: 1106s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 6,226 | 45,573 | 38 | 01:37:18 | 01:37:56 |
| machine | 15 | 17,732 | 594,831 | 1013 | 01:37:18 | 01:54:12 |
| judge | 3 | 10,625 | 126,039 | 41 | 01:37:18 | 01:37:59 |
| review | 3 | 24,919 | 1,987,690 | 183 | 01:37:30 | 01:40:33 |
| triage | 1 | 1,979 | 42,022 | 17 | 01:54:12 | 01:54:28 |
| capture | 1 | 354 | 38,379 | 6 | 01:54:28 | 01:54:35 |
| synthesize | 1 | 10,130 | 261,101 | 69 | 01:54:35 | 01:55:44 |

- **claude-opus-5-5**: 3 agent · 34 calls · out 24,919 · in 68 · cache_read 1,987,690 · cache_create 235,391
- **claude-sonnet-5-5**: 7 agent · 17 calls · out 29,314 · in 34 · cache_read 513,114 · cache_create 427,665
- **claude-haiku-5-5**: 15 agent · 30 calls · out 17,732 · in 60 · cache_read 594,831 · cache_create 668,327

