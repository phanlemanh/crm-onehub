### S4 round 1 — wf_d4f201db-d38 (19 agent, 39,914 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 11 | 6,300 | 24 | 861,977 | 96 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 5,438 | 6 | 123,827 | 48 |
| synthesize:report | claude-sonnet-5-5 | 2 | 4,786 | 4 | 62,002 | 30 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,658 | 4 | 54,206 | 38 |
| review:conventions | claude-opus-5-5 | 9 | 3,493 | 20 | 642,064 | 68 |
| review:measurement | claude-opus-5-5 | 5 | 2,898 | 10 | 258,279 | 53 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,813 | 4 | 3,140 | 467 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 4 | 1,789 | 8 | 118,161 | 620 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,559 | 4 | 54,208 | 11 |
| triage | claude-sonnet-5-5 | 3 | 1,386 | 6 | 114,081 | 13 |
| machine:node _acceptance/ci-test-het-do-co-dinh/ | claude-haiku-5-5 | 2 | 1,076 | 4 | 54,247 | 33 |
| machine:node _acceptance/ci-test-het-do-co-dinh/ | claude-haiku-5-5 | 2 | 1,042 | 4 | 54,246 | 219 |
| machine:node _acceptance/ci-test-het-do-co-dinh/ | claude-haiku-5-5 | 2 | 878 | 4 | 54,242 | 43 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 797 | 4 | 54,233 | 309 |
| machine:node _acceptance/ci-test-het-do-co-dinh/ | claude-haiku-5-5 | 2 | 778 | 4 | 54,254 | 176 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 691 | 4 | 54,263 | 76 |
| machine:node _acceptance/ci-test-het-do-co-dinh/ | claude-haiku-5-5 | 2 | 665 | 4 | 6,280 | 469 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 516 | 4 | 54,202 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 351 | 4 | 49,861 | 12 |


wall: 1605s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,438 | 123,827 | 48 | 13:43:37 | 13:44:25 |
| machine | 12 | 15,262 | 615,682 | 1544 | 13:43:37 | 14:09:21 |
| review | 3 | 12,691 | 1,762,320 | 100 | 13:43:37 | 13:45:16 |
| triage | 1 | 1,386 | 114,081 | 13 | 14:09:23 | 14:09:36 |
| capture | 1 | 351 | 49,861 | 12 | 14:09:38 | 14:09:50 |
| synthesize | 1 | 4,786 | 62,002 | 30 | 14:09:52 | 14:10:22 |

- **claude-opus-5-5**: 3 agent · 25 calls · out 12,691 · in 54 · cache_read 1,762,320 · cache_create 269,492
- **claude-sonnet-5-5**: 4 agent · 10 calls · out 11,961 · in 20 · cache_read 349,771 · cache_create 262,417
- **claude-haiku-5-5**: 12 agent · 26 calls · out 15,262 · in 52 · cache_read 615,682 · cache_create 808,683

