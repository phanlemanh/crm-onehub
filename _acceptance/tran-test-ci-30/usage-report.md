### S4 round 1 — wf_011cc433-1a8 (20 agent, 33,891 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 7,212 | 10 | 211,166 | 61 |
| review:measurement | claude-opus-5-5 | 6 | 4,088 | 12 | 215,564 | 78 |
| triage | claude-sonnet-5-5 | 2 | 2,808 | 4 | 31,579 | 25 |
| review:bugs | claude-opus-5-5 | 22 | 2,224 | 44 | 1,367,812 | 315 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,088 | 4 | 30,843 | 74 |
| review:conventions | claude-opus-5-5 | 13 | 1,983 | 26 | 776,437 | 96 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,917 | 4 | 30,804 | 128 |
| judge:E4:operational-feasibility | claude-sonnet-5-5 | 2 | 1,880 | 4 | 31,144 | 19 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,828 | 4 | 30,813 | 316 |
| judge:E4:spec-alignment | claude-sonnet-5-5 | 2 | 1,705 | 4 | 31,142 | 21 |
| judge:E4:domain-correctness | claude-sonnet-5-5 | 2 | 1,669 | 4 | 27,676 | 20 |
| machine:bun _acceptance/tran-test-ci-30/rang/kie | claude-haiku-5-5 | 2 | 1,498 | 4 | 30,822 | 10 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 771 | 4 | 30,786 | 25 |
| machine:bun _acceptance/tran-test-ci-30/rang/kie | claude-haiku-5-5 | 2 | 768 | 4 | 30,822 | 8 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 583 | 4 | 30,788 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 257 | 4 | 0 | 371 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 228 | 4 | 30,945 | 27 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 219 | 4 | 30,782 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 26,607 | 18 |
| machine:bun _acceptance/tran-test-ci-30/rang/kie | claude-haiku-5-5 | 2 | 14 | 4 | 30,823 | 9 |


wall: 1054s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 228 | 30,945 | 27 | 13:18:23 | 13:18:50 |
| machine | 10 | 9,943 | 277,283 | 944 | 13:18:23 | 13:34:07 |
| judge | 3 | 5,254 | 89,962 | 26 | 13:18:23 | 13:18:49 |
| review | 3 | 8,295 | 2,359,813 | 316 | 13:18:23 | 13:23:39 |
| triage | 1 | 2,808 | 31,579 | 25 | 13:34:09 | 13:34:34 |
| capture | 1 | 151 | 26,607 | 18 | 13:34:36 | 13:34:54 |
| synthesize | 1 | 7,212 | 211,166 | 61 | 13:34:56 | 13:35:57 |

- **claude-sonnet-5-5**: 7 agent · 17 calls · out 15,653 · in 34 · cache_read 390,259 · cache_create 273,938
- **claude-opus-5-5**: 3 agent · 41 calls · out 8,295 · in 82 · cache_read 2,359,813 · cache_create 223,871
- **claude-haiku-5-5**: 10 agent · 20 calls · out 9,943 · in 40 · cache_read 277,283 · cache_create 333,379

