### S4 round 1 — wf_fc4d0717-3b0 (18 agent, 42,571 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 9,419 | 8 | 167,903 | 75 |
| review:bugs | claude-opus-5-5 | 38 | 6,625 | 76 | 4,418,396 | 361 |
| review:measurement | claude-opus-5-5 | 19 | 6,013 | 38 | 1,683,719 | 312 |
| triage | claude-sonnet-5-5 | 2 | 5,852 | 4 | 34,138 | 41 |
| review:conventions | claude-opus-5-5 | 31 | 3,519 | 62 | 2,364,310 | 259 |
| machine:bun _acceptance/model-theo-vai-do-lai/ra | claude-haiku-5-5 | 2 | 1,750 | 4 | 28,489 | 14 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,740 | 4 | 0 | 511 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,598 | 4 | 2,973 | 476 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,589 | 4 | 28,434 | 141 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,422 | 4 | 28,436 | 12 |
| refute:khuon.ts | claude-sonnet-5-5 | 5 | 978 | 10 | 127,216 | 21 |
| refute:khuon.ts | claude-sonnet-5-5 | 3 | 637 | 6 | 61,197 | 13 |
| machine:bun _acceptance/model-theo-vai-do-lai/ra | claude-haiku-5-5 | 2 | 309 | 4 | 28,495 | 7 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 283 | 4 | 28,491 | 73 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 279 | 4 | 2,973 | 346 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 28,430 | 11 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 193 | 4 | 28,077 | 23 |
| capture:provenance | claude-sonnet-5-5 | 2 | 152 | 4 | 24,255 | 5 |


wall: 1745s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 193 | 28,077 | 23 | 03:02:06 | 03:02:29 |
| machine | 9 | 9,183 | 176,721 | 1591 | 03:02:06 | 03:28:37 |
| review | 3 | 16,157 | 8,466,425 | 363 | 03:02:06 | 03:08:09 |
| triage | 1 | 5,852 | 34,138 | 41 | 03:28:41 | 03:29:22 |
| refute | 2 | 1,615 | 188,413 | 21 | 03:29:25 | 03:29:46 |
| capture | 1 | 152 | 24,255 | 5 | 03:29:48 | 03:29:54 |
| synthesize | 1 | 9,419 | 167,903 | 75 | 03:29:56 | 03:31:11 |

- **claude-sonnet-5-5**: 6 agent · 18 calls · out 17,231 · in 36 · cache_read 442,786 · cache_create 242,044
- **claude-opus-5-5**: 3 agent · 88 calls · out 16,157 · in 176 · cache_read 8,466,425 · cache_create 436,518
- **claude-haiku-5-5**: 9 agent · 18 calls · out 9,183 · in 36 · cache_read 176,721 · cache_create 329,248

### S4 round 2 — wf_0384fd94-b63 (16 agent, 25,472 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 6,950 | 12 | 271,950 | 51 |
| triage | claude-sonnet-5-5 | 2 | 2,739 | 4 | 29,654 | 22 |
| review:measurement | claude-opus-5-5 | 13 | 1,977 | 26 | 643,509 | 132 |
| review:bugs | claude-opus-5-5 | 20 | 1,962 | 40 | 1,146,105 | 155 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,915 | 4 | 2,973 | 339 |
| machine:bun _acceptance/model-theo-vai-do-lai/ra | claude-haiku-5-5 | 2 | 1,765 | 4 | 28,513 | 13 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,687 | 4 | 28,537 | 83 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,569 | 4 | 2,973 | 473 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 3 | 1,243 | 6 | 28,482 | 339 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,130 | 4 | 28,480 | 147 |
| review:conventions | claude-opus-5-5 | 11 | 1,092 | 22 | 478,768 | 84 |
| machine:bun _acceptance/model-theo-vai-do-lai/ra | claude-haiku-5-5 | 2 | 482 | 4 | 28,519 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 349 | 4 | 28,476 | 9 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 272 | 4 | 2,973 | 416 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 193 | 4 | 28,101 | 20 |
| capture:provenance | claude-sonnet-5-5 | 2 | 147 | 4 | 24,301 | 5 |


wall: 1904s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 193 | 28,101 | 20 | 03:32:45 | 03:33:05 |
| machine | 9 | 10,412 | 179,926 | 1820 | 03:32:45 | 04:03:05 |
| review | 3 | 5,031 | 2,268,382 | 157 | 03:32:45 | 03:35:22 |
| triage | 1 | 2,739 | 29,654 | 22 | 04:03:07 | 04:03:30 |
| capture | 1 | 147 | 24,301 | 5 | 04:03:32 | 04:03:36 |
| synthesize | 1 | 6,950 | 271,950 | 51 | 04:03:38 | 04:04:29 |

- **claude-sonnet-5-5**: 4 agent · 12 calls · out 10,029 · in 24 · cache_read 354,006 · cache_create 168,022
- **claude-opus-5-5**: 3 agent · 44 calls · out 5,031 · in 88 · cache_read 2,268,382 · cache_create 202,892
- **claude-haiku-5-5**: 9 agent · 19 calls · out 10,412 · in 38 · cache_read 179,926 · cache_create 360,047

