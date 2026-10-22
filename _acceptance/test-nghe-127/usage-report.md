### S4 round 1 — wf_c8d7740d-b7a (22 agent, 32,482 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 7,388 | 6 | 95,801 | 43 |
| review:measurement | claude-opus-5-5 | 10 | 4,117 | 20 | 505,977 | 153 |
| triage | claude-sonnet-5-5 | 2 | 2,802 | 4 | 31,148 | 21 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,969 | 4 | 30,304 | 73 |
| machine:node _acceptance/test-nghe-127/rang/quet | claude-haiku-5-5 | 2 | 1,886 | 4 | 30,308 | 31 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,823 | 4 | 2,973 | 327 |
| review:bugs | claude-opus-5-5 | 24 | 1,686 | 48 | 1,804,581 | 183 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,607 | 4 | 30,249 | 10 |
| review:conventions | claude-opus-5-5 | 12 | 1,454 | 24 | 721,193 | 106 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,429 | 4 | 0 | 557 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,204 | 4 | 30,247 | 31 |
| judge:E5:spec-alignment | claude-sonnet-5-5 | 3 | 955 | 6 | 63,781 | 11 |
| judge:E5:operational-feasibility | claude-sonnet-5-5 | 3 | 895 | 6 | 63,785 | 12 |
| judge:E5:domain-correctness | claude-sonnet-5-5 | 3 | 615 | 6 | 60,315 | 8 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 430 | 4 | 2,973 | 509 |
| machine:node _acceptance/test-nghe-127/rang/khon | claude-haiku-5-5 | 2 | 429 | 4 | 30,281 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 406 | 4 | 30,243 | 7 |
| machine:node _acceptance/test-nghe-127/rang/quet | claude-haiku-5-5 | 2 | 405 | 4 | 30,271 | 7 |
| machine:bun _acceptance/test-nghe-127/rang/co-ch | claude-haiku-5-5 | 2 | 364 | 4 | 30,275 | 6 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 277 | 4 | 31,513 | 210 |
| machine:bun test scripts/tin-hieu/test scripts/b | claude-haiku-5-5 | 2 | 191 | 4 | 30,280 | 187 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 26,068 | 5 |


wall: 1602s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 277 | 31,513 | 210 | 23:30:52 | 23:34:21 |
| machine | 12 | 12,143 | 278,404 | 1526 | 23:30:52 | 23:56:18 |
| judge | 3 | 2,465 | 187,881 | 14 | 23:30:52 | 23:31:06 |
| review | 3 | 7,257 | 3,031,751 | 184 | 23:30:52 | 23:33:56 |
| triage | 1 | 2,802 | 31,148 | 21 | 23:56:20 | 23:56:41 |
| capture | 1 | 150 | 26,068 | 5 | 23:56:43 | 23:56:49 |
| synthesize | 1 | 7,388 | 95,801 | 43 | 23:56:51 | 23:57:34 |

- **claude-sonnet-5-5**: 7 agent · 18 calls · out 13,082 · in 36 · cache_read 372,411 · cache_create 261,840
- **claude-opus-5-5**: 3 agent · 46 calls · out 7,257 · in 92 · cache_read 3,031,751 · cache_create 253,348
- **claude-haiku-5-5**: 12 agent · 24 calls · out 12,143 · in 48 · cache_read 278,404 · cache_create 437,067

### S4 round 2 — wf_1ef3f332-625 (20 agent, 22,703 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 6,180 | 6 | 90,976 | 41 |
| machine:node _acceptance/test-nghe-127/rang/quet | claude-haiku-5-5 | 2 | 1,926 | 4 | 30,333 | 24 |
| review:measurement | claude-opus-5-5 | 5 | 1,915 | 10 | 168,790 | 68 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,890 | 4 | 30,299 | 307 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,725 | 4 | 0 | 402 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,650 | 4 | 2,973 | 436 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,485 | 4 | 30,274 | 10 |
| triage | claude-sonnet-5-5 | 2 | 969 | 4 | 28,864 | 9 |
| judge:E5:spec-alignment | claude-sonnet-5-5 | 3 | 912 | 6 | 63,831 | 9 |
| judge:E5:operational-feasibility | claude-sonnet-5-5 | 3 | 836 | 6 | 64,675 | 9 |
| judge:E5:domain-correctness | claude-sonnet-5-5 | 3 | 695 | 6 | 60,365 | 9 |
| review:conventions | claude-opus-5-5 | 5 | 468 | 10 | 163,844 | 26 |
| machine:node _acceptance/test-nghe-127/rang/khon | claude-haiku-5-5 | 2 | 427 | 4 | 30,306 | 7 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 367 | 4 | 30,272 | 32 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 275 | 4 | 30,329 | 68 |
| machine:node _acceptance/test-nghe-127/rang/quet | claude-haiku-5-5 | 2 | 240 | 4 | 30,296 | 6 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 228 | 4 | 30,435 | 23 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 216 | 4 | 30,268 | 7 |
| review:bugs | claude-opus-5-5 | 10 | 150 | 20 | 414,673 | 208 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 26,093 | 6 |


wall: 1336s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 228 | 30,435 | 23 | 00:55:35 | 00:55:57 |
| machine | 10 | 10,201 | 245,350 | 1274 | 00:55:35 | 01:16:48 |
| judge | 3 | 2,443 | 188,871 | 11 | 00:55:35 | 00:55:45 |
| review | 3 | 2,533 | 747,307 | 210 | 00:55:35 | 00:59:05 |
| triage | 1 | 969 | 28,864 | 9 | 01:16:50 | 01:17:00 |
| capture | 1 | 149 | 26,093 | 6 | 01:17:02 | 01:17:08 |
| synthesize | 1 | 6,180 | 90,976 | 41 | 01:17:10 | 01:17:50 |

- **claude-sonnet-5-5**: 7 agent · 18 calls · out 9,969 · in 36 · cache_read 365,239 · cache_create 265,970
- **claude-haiku-5-5**: 10 agent · 20 calls · out 10,201 · in 40 · cache_read 245,350 · cache_create 352,618
- **claude-opus-5-5**: 3 agent · 20 calls · out 2,533 · in 40 · cache_read 747,307 · cache_create 153,478

