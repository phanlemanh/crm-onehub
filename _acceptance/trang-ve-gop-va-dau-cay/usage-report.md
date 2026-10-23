### S4 round 1 — wf_d59e938e-250 (30 agent, 48,065 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 16,415 | 6 | 115,341 | 108 |
| review:measurement | claude-opus-5-5 | 9 | 4,005 | 18 | 469,085 | 166 |
| triage | claude-sonnet-5-5 | 2 | 3,995 | 4 | 31,597 | 43 |
| judge:E14:operational-feasibility | claude-sonnet-5-5 | 2 | 3,511 | 4 | 29,166 | 32 |
| review:bugs | claude-opus-5-5 | 17 | 2,817 | 34 | 1,007,109 | 249 |
| judge:E14:domain-correctness | claude-sonnet-5-5 | 2 | 2,593 | 4 | 25,636 | 25 |
| judge:E14:spec-alignment | claude-sonnet-5-5 | 2 | 2,552 | 4 | 29,164 | 29 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,907 | 4 | 28,793 | 163 |
| review:conventions | claude-opus-5-5 | 15 | 1,165 | 30 | 756,283 | 270 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,087 | 4 | 28,777 | 9 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 1,050 | 4 | 28,897 | 53 |
| refute:trang-ve-gop.mjs | claude-sonnet-5-5 | 7 | 998 | 16 | 194,491 | 35 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 646 | 4 | 28,815 | 222 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 645 | 4 | 28,775 | 35 |
| refute:trang-ve-gop.mjs | claude-sonnet-5-5 | 4 | 600 | 8 | 90,582 | 23 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 518 | 4 | 33,512 | 51 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 509 | 4 | 28,813 | 145 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 306 | 4 | 28,832 | 72 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 303 | 4 | 3,057 | 318 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 302 | 4 | 3,057 | 325 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 265 | 4 | 28,814 | 7 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 248 | 4 | 28,813 | 55 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 229 | 4 | 28,817 | 31 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 227 | 4 | 28,817 | 12 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 225 | 4 | 28,816 | 20 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 204 | 4 | 28,815 | 24 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 204 | 4 | 28,831 | 14 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 202 | 4 | 28,818 | 20 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 190 | 4 | 28,771 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 147 | 4 | 24,510 | 8 |


wall: 1147s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 518 | 33,512 | 51 | 13:03:03 | 13:03:54 |
| machine | 18 | 8,749 | 467,128 | 944 | 13:03:03 | 13:18:47 |
| judge | 3 | 8,656 | 83,966 | 37 | 13:03:20 | 13:03:57 |
| review | 3 | 7,987 | 2,232,477 | 270 | 13:03:29 | 13:07:59 |
| triage | 1 | 3,995 | 31,597 | 43 | 13:18:49 | 13:19:32 |
| refute | 2 | 1,598 | 285,073 | 35 | 13:19:34 | 13:20:10 |
| capture | 1 | 147 | 24,510 | 8 | 13:20:12 | 13:20:21 |
| synthesize | 1 | 16,415 | 115,341 | 108 | 13:20:23 | 13:22:11 |

- **claude-sonnet-5-5**: 9 agent · 26 calls · out 31,329 · in 54 · cache_read 573,999 · cache_create 360,508
- **claude-opus-5-5**: 3 agent · 41 calls · out 7,987 · in 82 · cache_read 2,232,477 · cache_create 251,958
- **claude-haiku-5-5**: 18 agent · 36 calls · out 8,749 · in 72 · cache_read 467,128 · cache_create 528,014

### S4 round 2 — wf_8756a115-5a3 (27 agent, 42,041 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 14,184 | 12 | 301,611 | 107 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,104 | 4 | 28,844 | 31 |
| judge:E14:operational-feasibility | claude-sonnet-5-5 | 2 | 3,073 | 4 | 29,235 | 25 |
| judge:E14:domain-correctness | claude-sonnet-5-5 | 2 | 2,898 | 4 | 25,705 | 22 |
| triage | claude-sonnet-5-5 | 2 | 2,772 | 4 | 29,535 | 23 |
| judge:E14:spec-alignment | claude-sonnet-5-5 | 2 | 2,751 | 4 | 29,233 | 22 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,844 | 4 | 28,862 | 165 |
| review:bugs | claude-opus-5-5 | 16 | 1,587 | 32 | 831,528 | 163 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 3 | 1,372 | 6 | 28,846 | 341 |
| review:conventions | claude-opus-5-5 | 14 | 1,246 | 28 | 679,036 | 120 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 1,215 | 4 | 28,966 | 57 |
| review:measurement | claude-opus-5-5 | 8 | 1,080 | 16 | 328,872 | 107 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 919 | 4 | 28,884 | 224 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 577 | 4 | 28,901 | 72 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 476 | 4 | 33,021 | 44 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 447 | 4 | 28,882 | 142 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 304 | 4 | 28,871 | 309 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 300 | 4 | 25,789 | 283 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 229 | 4 | 28,886 | 11 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 229 | 4 | 28,886 | 30 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 227 | 4 | 28,884 | 20 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 225 | 4 | 28,887 | 19 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 28,840 | 7 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 206 | 4 | 28,900 | 14 |
| machine:cd packages/ui && bun test --timeout 300 | claude-haiku-5-5 | 2 | 206 | 4 | 28,882 | 54 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 204 | 4 | 28,885 | 18 |
| capture:provenance | claude-sonnet-5-5 | 2 | 153 | 4 | 24,579 | 7 |


wall: 1367s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 476 | 33,021 | 44 | 13:36:51 | 13:37:34 |
| machine | 17 | 11,821 | 487,895 | 1222 | 13:36:51 | 13:57:13 |
| judge | 3 | 8,722 | 84,173 | 28 | 13:37:06 | 13:37:34 |
| review | 3 | 3,913 | 1,839,436 | 164 | 13:37:14 | 13:39:58 |
| triage | 1 | 2,772 | 29,535 | 23 | 13:57:15 | 13:57:38 |
| capture | 1 | 153 | 24,579 | 7 | 13:57:41 | 13:57:48 |
| synthesize | 1 | 14,184 | 301,611 | 107 | 13:57:50 | 13:59:37 |

- **claude-sonnet-5-5**: 7 agent · 18 calls · out 26,307 · in 36 · cache_read 472,919 · cache_create 296,773
- **claude-haiku-5-5**: 17 agent · 35 calls · out 11,821 · in 70 · cache_read 487,895 · cache_create 485,984
- **claude-opus-5-5**: 3 agent · 38 calls · out 3,913 · in 76 · cache_read 1,839,436 · cache_create 203,907

### S4 round 3 — wf_4cb1230f-060 (20 agent, 28,999 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 8 | 11,517 | 16 | 420,580 | 99 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,438 | 4 | 29,180 | 33 |
| review:measurement | claude-opus-5-5 | 7 | 2,157 | 14 | 280,548 | 81 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,072 | 4 | 29,237 | 79 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 4 | 2,005 | 8 | 66,744 | 618 |
| review:bugs | claude-opus-5-5 | 13 | 1,533 | 26 | 625,765 | 112 |
| triage | claude-sonnet-5-5 | 2 | 1,320 | 4 | 28,240 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,078 | 4 | 29,182 | 9 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 917 | 4 | 29,262 | 18 |
| review:conventions | claude-opus-5-5 | 12 | 468 | 24 | 489,656 | 62 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 323 | 4 | 31,199 | 41 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 307 | 4 | 6,114 | 332 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 300 | 4 | 6,114 | 444 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 290 | 4 | 29,302 | 56 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 248 | 4 | 29,222 | 30 |
| machine:node _acceptance/trang-ve-gop-va-dau-cay | claude-haiku-5-5 | 2 | 234 | 4 | 29,220 | 263 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 230 | 4 | 29,222 | 9 |
| machine:cd packages/ui && bun test --timeout 120 | claude-haiku-5-5 | 2 | 229 | 4 | 29,223 | 19 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 188 | 4 | 29,176 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 145 | 4 | 24,915 | 11 |


wall: 1666s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 323 | 31,199 | 41 | 14:51:51 | 14:52:32 |
| machine | 13 | 11,536 | 371,198 | 1536 | 14:51:51 | 15:17:27 |
| review | 3 | 4,158 | 1,395,969 | 113 | 14:51:51 | 14:53:44 |
| triage | 1 | 1,320 | 28,240 | 14 | 15:17:29 | 15:17:43 |
| capture | 1 | 145 | 24,915 | 11 | 15:17:45 | 15:17:57 |
| synthesize | 1 | 11,517 | 420,580 | 99 | 15:17:59 | 15:19:37 |

- **claude-sonnet-5-5**: 4 agent · 14 calls · out 13,305 · in 28 · cache_read 504,934 · cache_create 175,157
- **claude-haiku-5-5**: 13 agent · 28 calls · out 11,536 · in 56 · cache_read 371,198 · cache_create 424,519
- **claude-opus-5-5**: 3 agent · 32 calls · out 4,158 · in 64 · cache_read 1,395,969 · cache_create 184,558

