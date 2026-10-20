### S4 round 1 — wf_3d2f833f-457 (25 agent, 38,191 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 8,238 | 10 | 199,450 | 58 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,598 | 4 | 28,362 | 40 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 3 | 3,505 | 6 | 28,364 | 345 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,067 | 4 | 28,419 | 81 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,917 | 4 | 25,391 | 303 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,910 | 4 | 2,973 | 328 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,800 | 4 | 2,973 | 414 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,501 | 4 | 28,419 | 15 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 3 | 1,470 | 6 | 61,008 | 20 |
| review:measurement | claude-opus-5-5 | 6 | 1,451 | 12 | 217,220 | 72 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 3 | 1,411 | 6 | 66,904 | 17 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 3 | 1,390 | 6 | 66,908 | 23 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,175 | 4 | 28,414 | 13 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,118 | 4 | 28,412 | 14 |
| triage | claude-sonnet-5-5 | 2 | 1,013 | 4 | 26,749 | 12 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 835 | 4 | 28,415 | 14 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 727 | 4 | 28,419 | 12 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 679 | 4 | 28,415 | 12 |
| review:conventions | claude-opus-5-5 | 9 | 566 | 18 | 342,043 | 49 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 457 | 4 | 31,493 | 41 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 347 | 4 | 28,420 | 10 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 340 | 4 | 28,416 | 11 |
| review:bugs | claude-opus-5-5 | 18 | 310 | 36 | 884,756 | 103 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 219 | 4 | 28,358 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 147 | 4 | 24,185 | 6 |


wall: 1605s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 457 | 31,493 | 41 | 16:25:38 | 16:26:19 |
| machine | 15 | 21,738 | 372,170 | 1525 | 16:25:38 | 16:51:03 |
| judge | 3 | 4,271 | 194,820 | 27 | 16:25:38 | 16:26:05 |
| review | 3 | 2,327 | 1,444,019 | 105 | 16:25:38 | 16:27:23 |
| triage | 1 | 1,013 | 26,749 | 12 | 16:51:04 | 16:51:16 |
| capture | 1 | 147 | 24,185 | 6 | 16:51:18 | 16:51:24 |
| synthesize | 1 | 8,238 | 199,450 | 58 | 16:51:25 | 16:52:23 |

- **claude-sonnet-5-5**: 7 agent · 20 calls · out 14,126 · in 40 · cache_read 476,697 · cache_create 268,269
- **claude-haiku-5-5**: 15 agent · 31 calls · out 21,738 · in 62 · cache_read 372,170 · cache_create 500,792
- **claude-opus-5-5**: 3 agent · 33 calls · out 2,327 · in 66 · cache_read 1,444,019 · cache_create 178,014

### S4 round 2 — wf_6ec2e80a-37c (15 agent, 18,429 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 5,502 | 8 | 144,260 | 40 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,038 | 4 | 28,432 | 81 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,025 | 4 | 28,402 | 313 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,710 | 4 | 28,377 | 12 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 3 | 1,343 | 6 | 66,930 | 15 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 3 | 1,213 | 6 | 63,464 | 12 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 2 | 1,182 | 4 | 28,995 | 11 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,163 | 4 | 2,973 | 411 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 852 | 4 | 28,375 | 31 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 436 | 4 | 2,973 | 475 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 306 | 4 | 28,371 | 7 |
| review:measurement | claude-opus-5-5 | 7 | 226 | 14 | 212,442 | 44 |
| review:bugs | claude-opus-5-5 | 6 | 158 | 12 | 167,063 | 31 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 24,198 | 13 |
| review:conventions | claude-opus-5-5 | 4 | 124 | 8 | 90,787 | 18 |


wall: 1393s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 7 | 8,530 | 147,903 | 1338 | 16:53:49 | 17:16:07 |
| judge | 3 | 3,738 | 159,389 | 17 | 16:53:49 | 16:54:05 |
| review | 3 | 508 | 470,292 | 46 | 16:53:49 | 16:54:35 |
| capture | 1 | 151 | 24,198 | 13 | 17:16:08 | 17:16:21 |
| synthesize | 1 | 5,502 | 144,260 | 40 | 17:16:22 | 17:17:02 |

- **claude-sonnet-5-5**: 5 agent · 14 calls · out 9,391 · in 28 · cache_read 327,847 · cache_create 190,910
- **claude-haiku-5-5**: 7 agent · 14 calls · out 8,530 · in 28 · cache_read 147,903 · cache_create 247,237
- **claude-opus-5-5**: 3 agent · 17 calls · out 508 · in 34 · cache_read 470,292 · cache_create 116,807

