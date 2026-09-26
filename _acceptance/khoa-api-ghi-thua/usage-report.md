### S4 round 1 — wf_4c21d758-44b (26 agent, 78,852 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 38,904 | 4 | 103,952 | 405 |
| triage | claude-sonnet-5 | 2 | 9,750 | 4 | 93,475 | 114 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 3 | 7,882 | 6 | 223,590 | 90 |
| baseline:diffBase | claude-sonnet-5 | 33 | 2,508 | 66 | 3,719,547 | 496 |
| review:conventions | claude-opus-5-5 | 18 | 2,164 | 36 | 2,177,436 | 135 |
| review:bugs | claude-opus-5-5 | 10 | 1,900 | 20 | 1,009,165 | 93 |
| refute:khoa-api-ghi-thua.spec.ts | claude-sonnet-5 | 6 | 1,677 | 12 | 491,229 | 46 |
| review:measurement | claude-opus-5-5 | 5 | 1,631 | 10 | 431,124 | 63 |
| judge:E13:domain-correctness | claude-sonnet-5 | 8 | 1,573 | 16 | 703,113 | 116 |
| judge:E13:spec-alignment | claude-sonnet-5 | 6 | 1,447 | 12 | 556,982 | 79 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 938 | 34 | 239,450 | 28 |
| judge:E14:operational-feasibility | claude-sonnet-5 | 3 | 929 | 6 | 223,236 | 26 |
| judge:E14:spec-alignment | claude-sonnet-5 | 3 | 840 | 6 | 223,130 | 27 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 790 | 18 | 90,023 | 17 |
| judge:E14:domain-correctness | claude-sonnet-5 | 3 | 737 | 6 | 223,251 | 29 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 711 | 18 | 90,027 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 8 | 596 | 66 | 511,085 | 52 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 590 | 18 | 90,023 | 32 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 572 | 18 | 90,062 | 15 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 555 | 18 | 90,062 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 3 | 475 | 26 | 158,144 | 23 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 461 | 34 | 201,888 | 204 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 438 | 18 | 90,062 | 18 |
| machine:node _acceptance/khoa-api-ghi-thua/rang/ | claude-haiku-4-5-20251001 | 2 | 367 | 18 | 90,047 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 282 | 18 | 90,021 | 11 |
| capture:provenance | claude-sonnet-5 | 2 | 135 | 4 | 89,909 | 13 |


wall: 918s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,508 | 3,719,547 | 496 | 01:07:32 | 01:15:48 |
| machine | 12 | 6,775 | 1,830,894 | 269 | 01:07:32 | 01:12:01 |
| judge | 6 | 13,408 | 2,153,302 | 116 | 01:07:32 | 01:09:28 |
| review | 3 | 5,695 | 3,617,725 | 135 | 01:07:58 | 01:10:14 |
| triage | 1 | 9,750 | 93,475 | 114 | 01:12:03 | 01:13:57 |
| refute | 1 | 1,677 | 491,229 | 46 | 01:13:59 | 01:14:44 |
| capture | 1 | 135 | 89,909 | 13 | 01:15:50 | 01:16:03 |
| synthesize | 1 | 38,904 | 103,952 | 405 | 01:16:05 | 01:22:50 |

- **claude-sonnet-5**: 11 agent · 71 calls · out 66,382 · in 142 · cache_read 6,651,414 · cache_create 1,002,595
- **claude-opus-5-5**: 3 agent · 33 calls · out 5,695 · in 66 · cache_read 3,617,725 · cache_create 312,893
- **claude-haiku-4-5-20251001**: 12 agent · 35 calls · out 6,775 · in 304 · cache_read 1,830,894 · cache_create 566,924

