### S4 round 1 — wf_ed8401f8-ef5 (20 agent, 65,551 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 19 | 14,554 | 40 | 1,553,936 | 195 |
| review:measurement | claude-opus-5-5 | 13 | 13,303 | 26 | 1,037,395 | 167 |
| synthesize:report | claude-sonnet-5-5 | 2 | 6,682 | 4 | 66,818 | 39 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 5,912 | 6 | 59,131 | 401 |
| review:conventions | claude-opus-5-5 | 12 | 5,534 | 24 | 759,229 | 128 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,558 | 4 | 56,367 | 30 |
| triage | claude-sonnet-5-5 | 2 | 2,672 | 4 | 56,428 | 21 |
| machine:bun run test -- "NODE_ENV=test bun _acce | claude-haiku-5-5 | 2 | 1,862 | 4 | 3,300 | 445 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 4 | 1,827 | 8 | 127,247 | 615 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,599 | 4 | 56,369 | 9 |
| refute:evals.yaml | claude-sonnet-5-5 | 4 | 1,050 | 8 | 176,527 | 13 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,027 | 4 | 3,300 | 321 |
| machine:bun _acceptance/sua-bom-gio-test-api/ran | claude-haiku-5-5 | 2 | 913 | 4 | 56,409 | 7 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 906 | 4 | 3,300 | 444 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 892 | 4 | 56,565 | 74 |
| machine:bun _acceptance/sua-bom-gio-test-api/ran | claude-haiku-5-5 | 2 | 873 | 4 | 56,416 | 16 |
| machine:bun _acceptance/sua-bom-gio-test-api/ran | claude-haiku-5-5 | 2 | 722 | 4 | 56,403 | 16 |
| machine:bun _acceptance/sua-bom-gio-test-api/ran | claude-haiku-5-5 | 2 | 688 | 4 | 56,403 | 6 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 557 | 4 | 56,363 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 420 | 4 | 51,866 | 7 |


wall: 1581s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| review | 3 | 33,391 | 3,350,560 | 197 | 10:26:18 | 10:29:35 |
| baseline | 1 | 5,912 | 59,131 | 401 | 10:26:18 | 10:32:59 |
| machine | 12 | 15,424 | 588,442 | 1500 | 10:26:18 | 10:51:19 |
| triage | 1 | 2,672 | 56,428 | 21 | 10:51:19 | 10:51:40 |
| refute | 1 | 1,050 | 176,527 | 13 | 10:51:40 | 10:51:53 |
| capture | 1 | 420 | 51,866 | 7 | 10:51:53 | 10:52:00 |
| synthesize | 1 | 6,682 | 66,818 | 39 | 10:52:00 | 10:52:39 |

- **claude-opus-5-5**: 3 agent · 44 calls · out 33,391 · in 90 · cache_read 3,350,560 · cache_create 284,162
- **claude-sonnet-5-5**: 5 agent · 13 calls · out 16,736 · in 26 · cache_read 410,770 · cache_create 416,295
- **claude-haiku-5-5**: 12 agent · 26 calls · out 15,424 · in 52 · cache_read 588,442 · cache_create 917,731

