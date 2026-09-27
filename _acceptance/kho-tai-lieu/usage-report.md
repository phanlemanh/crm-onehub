### S3 đợt 1 — wf_34e96030-12e (2 agent, 6,788 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 74 | 4,054 | 148 | 9,145,064 | 851 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 43 | 2,734 | 86 | 4,137,538 | 365 |


wall: 851s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 2 | 6,788 | 13,282,602 | 851 | 12:53:22 | 13:07:33 |

- **claude-opus-5-5**: 2 agent · 117 calls · out 6,788 · in 234 · cache_read 13,282,602 · cache_create 299,867

### S3 đợt 2 — wf_4acdda11-1c5 (3 agent, 13,361 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| exec:Task 7 | claude-opus-5-5 | 85 | 6,344 | 170 | 13,451,396 | 1034 |
| exec:Task 5 | claude-opus-5-5 | 103 | 4,352 | 206 | 23,381,420 | 1332 |
| exec:Task 8 | claude-opus-5-5 | 49 | 2,665 | 98 | 5,648,603 | 592 |


wall: 1332s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| exec | 3 | 13,361 | 42,481,419 | 1332 | 13:08:34 | 13:30:45 |

- **claude-opus-5-5**: 3 agent · 237 calls · out 13,361 · in 474 · cache_read 42,481,419 · cache_create 625,789

### S4 round 1 — wf_9acb4554-717 (42 agent, 113,966 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 3 | 42,646 | 6 | 213,209 | 526 |
| triage | claude-sonnet-5 | 2 | 14,376 | 4 | 72,888 | 164 |
| ui:E12 | claude-sonnet-5 | 30 | 8,551 | 60 | 3,289,503 | 318 |
| ui:E13b | claude-sonnet-5 | 35 | 5,389 | 70 | 3,719,953 | 347 |
| ui:E14 | claude-sonnet-5 | 43 | 5,015 | 86 | 4,576,579 | 338 |
| review:measurement | claude-opus-5-5 | 44 | 4,366 | 88 | 7,495,236 | 361 |
| baseline:diffBase | claude-sonnet-5 | 45 | 3,542 | 90 | 4,213,370 | 386 |
| review:bugs | claude-opus-5-5 | 28 | 2,457 | 56 | 3,636,282 | 301 |
| judge:E14j:spec-alignment | claude-sonnet-5 | 6 | 2,392 | 12 | 417,593 | 44 |
| judge:E14j:domain-correctness | claude-sonnet-5 | 7 | 2,277 | 14 | 465,926 | 60 |
| review:conventions | claude-opus-5-5 | 44 | 2,207 | 88 | 6,196,276 | 283 |
| refute:diff-trang.tsx | claude-sonnet-5 | 17 | 2,118 | 34 | 1,291,861 | 147 |
| judge:E14j:operational-feasibility | claude-sonnet-5 | 4 | 2,053 | 8 | 258,224 | 28 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,327 | 18 | 43,458 | 132 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,278 | 34 | 169,697 | 30 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 1,104 | 42 | 226,919 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 859 | 34 | 170,043 | 28 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 777 | 18 | 70,619 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 759 | 34 | 168,502 | 27 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 753 | 42 | 222,396 | 35 |
| machine:for t in $(git ls-files "apps/app/app/(a | claude-haiku-4-5-20251001 | 2 | 737 | 18 | 70,748 | 19 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 6 | 711 | 50 | 277,443 | 35 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 6 | 626 | 50 | 267,937 | 31 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 558 | 42 | 221,665 | 30 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 521 | 34 | 167,718 | 32 |
| machine:bun _acceptance/kho-tai-lieu/rang/migrat | claude-haiku-4-5-20251001 | 2 | 511 | 18 | 70,645 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 503 | 34 | 166,380 | 41 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 483 | 18 | 70,660 | 13 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 420 | 18 | 70,647 | 16 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 412 | 18 | 70,659 | 19 |
| machine:node _acceptance/kho-tai-lieu/rang/migra | claude-haiku-4-5-20251001 | 3 | 406 | 26 | 117,637 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 400 | 34 | 170,017 | 25 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 382 | 18 | 70,663 | 14 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 367 | 18 | 70,659 | 13 |
| capture:provenance | claude-sonnet-5 | 2 | 361 | 4 | 63,564 | 13 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 347 | 18 | 70,649 | 13 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 343 | 18 | 70,653 | 12 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 336 | 18 | 70,653 | 14 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 330 | 18 | 70,660 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 326 | 18 | 70,617 | 12 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 321 | 34 | 169,999 | 29 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 319 | 18 | 70,619 | 27 |


wall: 1263s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,542 | 4,213,370 | 386 | 14:42:00 | 14:48:26 |
| machine | 28 | 16,216 | 3,548,962 | 191 | 14:42:00 | 14:45:11 |
| ui | 3 | 18,955 | 11,586,035 | 349 | 14:42:31 | 14:48:20 |
| judge | 3 | 6,722 | 1,141,743 | 60 | 14:42:34 | 14:43:34 |
| review | 3 | 9,030 | 17,327,794 | 367 | 14:42:40 | 14:48:47 |
| triage | 1 | 14,376 | 72,888 | 164 | 14:48:49 | 14:51:33 |
| refute | 1 | 2,118 | 1,291,861 | 147 | 14:51:34 | 14:54:01 |
| capture | 1 | 361 | 63,564 | 13 | 14:54:03 | 14:54:15 |
| synthesize | 1 | 42,646 | 213,209 | 526 | 14:54:17 | 15:03:03 |

- **claude-sonnet-5**: 11 agent · 194 calls · out 88,720 · in 388 · cache_read 18,582,670 · cache_create 1,006,749
- **claude-opus-5-5**: 3 agent · 116 calls · out 9,030 · in 232 · cache_read 17,327,794 · cache_create 542,899
- **claude-haiku-4-5-20251001**: 28 agent · 88 calls · out 16,216 · in 760 · cache_read 3,548,962 · cache_create 692,722

