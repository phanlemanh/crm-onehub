### S4 round 1 — wf_d41698c2-9f7 (24 agent, 87,602 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| baseline:diffBase | claude-sonnet-5 | 37 | 20,478 | 74 | 3,251,999 | 306 |
| synthesize:report | claude-sonnet-5 | 2 | 12,732 | 4 | 77,436 | 112 |
| review:bugs | claude-opus-5-5 | 20 | 9,714 | 40 | 1,625,114 | 125 |
| review:measurement | claude-opus-5-5 | 5 | 7,426 | 10 | 345,467 | 76 |
| review:conventions | claude-opus-5-5 | 8 | 4,485 | 16 | 539,336 | 50 |
| refute:evals.yaml | claude-sonnet-5 | 8 | 3,893 | 16 | 549,906 | 44 |
| refute:xem-truoc-luot-don.ts | claude-sonnet-5 | 3 | 3,736 | 6 | 171,016 | 41 |
| triage | claude-sonnet-5 | 2 | 3,639 | 4 | 67,155 | 38 |
| refute:go-la-cat-quyen.spec.ts | claude-sonnet-5 | 7 | 3,115 | 14 | 535,678 | 44 |
| refute:xem-truoc-luot-don.ts | claude-sonnet-5 | 5 | 2,338 | 10 | 283,784 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,614 | 34 | 141,505 | 28 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 1,562 | 42 | 218,917 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,486 | 34 | 169,162 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,422 | 34 | 169,601 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,403 | 34 | 170,885 | 26 |
| machine:bun run test | claude-haiku-4-5-20251001 | 6 | 1,336 | 50 | 267,571 | 140 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,186 | 34 | 170,778 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,158 | 34 | 170,763 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 1,133 | 42 | 247,090 | 29 |
| capture:provenance | claude-sonnet-5 | 3 | 1,017 | 6 | 134,410 | 12 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 951 | 18 | 71,784 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 704 | 34 | 169,908 | 22 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 659 | 18 | 71,784 | 21 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 415 | 18 | 71,782 | 11 |

- **claude-sonnet-5**: 8 agent · 67 calls · out 50,948 · in 134 · cache_read 5,071,384 · cache_create 554,913
- **claude-opus-5-5**: 3 agent · 33 calls · out 21,625 · in 66 · cache_read 2,509,917 · cache_create 235,012
- **claude-haiku-4-5-20251001**: 13 agent · 50 calls · out 15,029 · in 426 · cache_read 2,111,530 · cache_create 348,819

