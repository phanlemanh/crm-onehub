### S4 round 1 — wf_557c8865-1ae (15 agent, 51,759 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 13 | 14,059 | 26 | 1,734,323 | 161 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 5,180 | 18 | 122,565 | 255 |
| review:conventions | claude-opus-5-5 | 8 | 5,096 | 16 | 925,241 | 64 |
| review:measurement | claude-opus-5-5 | 4 | 4,812 | 8 | 419,692 | 54 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 4,438 | 18 | 122,591 | 103 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,461 | 18 | 122,544 | 54 |
| synthesize:report | claude-sonnet-5-5 | 3 | 3,402 | 6 | 270,320 | 26 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,055 | 18 | 93,493 | 267 |
| triage | claude-sonnet-5-5 | 2 | 1,977 | 4 | 121,476 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,697 | 18 | 122,544 | 22 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,571 | 18 | 122,559 | 226 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 1,322 | 8 | 374,724 | 21 |
| machine:bun _acceptance/heap-lenh-dung/rang/buil | claude-haiku-4-5-20251001 | 2 | 1,211 | 18 | 122,566 | 52 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,119 | 18 | 122,542 | 16 |
| capture:provenance | claude-sonnet-5-5 | 2 | 359 | 4 | 118,425 | 6 |


wall: 993s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,322 | 374,724 | 21 | 05:35:37 | 05:35:57 |
| machine | 8 | 20,732 | 951,404 | 944 | 05:35:37 | 05:51:21 |
| review | 3 | 23,967 | 3,079,256 | 162 | 05:35:37 | 05:38:19 |
| triage | 1 | 1,977 | 121,476 | 17 | 05:51:21 | 05:51:38 |
| capture | 1 | 359 | 118,425 | 6 | 05:51:38 | 05:51:44 |
| synthesize | 1 | 3,402 | 270,320 | 26 | 05:51:44 | 05:52:10 |

- **claude-opus-5-5**: 3 agent · 25 calls · out 23,967 · in 50 · cache_read 3,079,256 · cache_create 370,383
- **claude-haiku-4-5-20251001**: 8 agent · 16 calls · out 20,732 · in 144 · cache_read 951,404 · cache_create 597,352
- **claude-sonnet-5-5**: 4 agent · 11 calls · out 7,060 · in 22 · cache_read 884,945 · cache_create 526,127

### S4 round 2 — wf_c9ab1ea6-eb6 (13 agent, 23,652 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,375 | 18 | 122,544 | 49 |
| synthesize:report | claude-sonnet-5-5 | 4 | 2,806 | 8 | 405,599 | 26 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,646 | 18 | 122,591 | 83 |
| review:conventions | claude-opus-5-5 | 5 | 2,111 | 10 | 511,269 | 29 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,075 | 18 | 122,546 | 268 |
| review:bugs | claude-opus-5-5 | 4 | 1,882 | 8 | 412,977 | 25 |
| review:measurement | claude-opus-5-5 | 4 | 1,752 | 8 | 411,058 | 24 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,670 | 18 | 122,559 | 196 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,379 | 18 | 122,544 | 18 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,377 | 18 | 122,565 | 196 |
| machine:bun _acceptance/heap-lenh-dung/rang/buil | claude-haiku-4-5-20251001 | 2 | 1,179 | 18 | 122,566 | 51 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,041 | 18 | 122,542 | 15 |
| capture:provenance | claude-sonnet-5-5 | 2 | 359 | 4 | 118,425 | 6 |


wall: 857s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 8 | 14,742 | 980,457 | 825 | 05:53:23 | 06:07:09 |
| review | 3 | 5,745 | 1,335,304 | 29 | 05:53:23 | 05:53:52 |
| capture | 1 | 359 | 118,425 | 6 | 06:07:09 | 06:07:15 |
| synthesize | 1 | 2,806 | 405,599 | 26 | 06:07:15 | 06:07:40 |

- **claude-haiku-4-5-20251001**: 8 agent · 16 calls · out 14,742 · in 144 · cache_read 980,457 · cache_create 564,614
- **claude-sonnet-5-5**: 2 agent · 6 calls · out 3,165 · in 12 · cache_read 524,024 · cache_create 266,725
- **claude-opus-5-5**: 3 agent · 13 calls · out 5,745 · in 26 · cache_read 1,335,304 · cache_create 331,099

