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

### S4 round 2 — wf_6921f0bd-b80 (19 agent, 44,159 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 10 | 8,892 | 20 | 691,083 | 111 |
| synthesize:report | claude-sonnet-5-5 | 4 | 5,626 | 8 | 232,891 | 38 |
| review:bugs | claude-opus-5-5 | 8 | 5,612 | 16 | 488,337 | 70 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 5,547 | 6 | 129,983 | 40 |
| review:conventions | claude-opus-5-5 | 6 | 3,099 | 12 | 324,297 | 44 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,570 | 4 | 56,548 | 78 |
| triage | claude-sonnet-5-5 | 2 | 2,047 | 4 | 56,213 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,517 | 4 | 56,352 | 9 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,359 | 4 | 3,300 | 591 |
| machine:bun run test -- "NODE_ENV=test bun _acce | claude-haiku-5-5 | 2 | 1,253 | 4 | 6,600 | 397 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,119 | 4 | 56,518 | 303 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 962 | 4 | 0 | 397 |
| machine:bun _acceptance/sua-bom-gio-test-api/ran | claude-haiku-5-5 | 2 | 922 | 4 | 56,399 | 16 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 853 | 4 | 56,350 | 24 |
| machine:bun _acceptance/sua-bom-gio-test-api/ran | claude-haiku-5-5 | 2 | 843 | 4 | 56,386 | 16 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 552 | 4 | 56,346 | 7 |
| machine:bun _acceptance/sua-bom-gio-test-api/ran | claude-haiku-5-5 | 2 | 525 | 4 | 56,392 | 5 |
| machine:bun _acceptance/sua-bom-gio-test-api/ran | claude-haiku-5-5 | 2 | 511 | 4 | 56,386 | 5 |
| capture:provenance | claude-sonnet-5-5 | 2 | 350 | 4 | 51,849 | 5 |


wall: 1471s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,547 | 129,983 | 40 | 11:06:53 | 11:07:33 |
| review | 3 | 17,603 | 1,503,717 | 114 | 11:06:53 | 11:08:47 |
| machine | 12 | 12,986 | 517,577 | 1411 | 11:06:53 | 11:30:24 |
| triage | 1 | 2,047 | 56,213 | 17 | 11:30:24 | 11:30:41 |
| capture | 1 | 350 | 51,849 | 5 | 11:30:41 | 11:30:46 |
| synthesize | 1 | 5,626 | 232,891 | 38 | 11:30:46 | 11:31:24 |

- **claude-opus-5-5**: 3 agent · 24 calls · out 17,603 · in 48 · cache_read 1,503,717 · cache_create 243,407
- **claude-sonnet-5-5**: 4 agent · 11 calls · out 13,570 · in 22 · cache_read 470,936 · cache_create 283,161
- **claude-haiku-5-5**: 12 agent · 24 calls · out 12,986 · in 48 · cache_read 517,577 · cache_create 862,208

