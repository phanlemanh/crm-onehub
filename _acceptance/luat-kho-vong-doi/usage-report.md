### S4 round 1 — wf_7c842d1f-8f6 — wf_7c842d1f-8f6 (20 agent, 81,538 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 27 | 23,547 | 54 | 3,820,655 | 443 |
| review:measurement | claude-opus-5-5 | 7 | 15,395 | 14 | 682,000 | 168 |
| review:conventions | claude-opus-5-5 | 15 | 9,141 | 30 | 1,707,731 | 130 |
| synthesize:report | claude-sonnet-5-5 | 3 | 6,885 | 6 | 213,489 | 48 |
| machine:node scripts/luat-kho/do-cay.mjs --du-lu | claude-haiku-5-5 | 2 | 3,602 | 4 | 121,754 | 24 |
| triage | claude-sonnet-5-5 | 2 | 3,358 | 4 | 91,471 | 27 |
| refute:acceptance.yml | claude-sonnet-5-5 | 7 | 3,230 | 14 | 605,100 | 40 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,445 | 4 | 121,753 | 239 |
| refute:acceptance.yml | claude-sonnet-5-5 | 5 | 2,179 | 10 | 369,364 | 30 |
| baseline:diffBase | claude-sonnet-5-5 | 5 | 1,884 | 10 | 371,779 | 38 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,614 | 4 | 121,728 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,443 | 4 | 121,726 | 30 |
| machine:node _acceptance/luat-kho-vong-doi/rang/ | claude-haiku-5-5 | 2 | 1,392 | 4 | 121,756 | 100 |
| machine:bun _acceptance/luat-kho-vong-doi/rang/c | claude-haiku-5-5 | 2 | 1,363 | 4 | 121,759 | 9 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 960 | 4 | 121,783 | 66 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 938 | 4 | 121,744 | 241 |
| machine:node _acceptance/luat-kho-vong-doi/rang/ | claude-haiku-5-5 | 2 | 929 | 4 | 121,760 | 57 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 653 | 4 | 121,722 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 329 | 4 | 85,983 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 251 | 4 | 86,718 | 277 |


wall: 996s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,884 | 371,779 | 38 | 08:10:24 | 08:11:01 |
| machine | 11 | 15,590 | 1,304,203 | 870 | 08:10:24 | 08:24:54 |
| review | 3 | 48,083 | 6,210,386 | 444 | 08:10:24 | 08:17:48 |
| triage | 1 | 3,358 | 91,471 | 27 | 08:24:54 | 08:25:21 |
| refute | 2 | 5,409 | 974,464 | 43 | 08:25:21 | 08:26:04 |
| capture | 1 | 329 | 85,983 | 8 | 08:26:04 | 08:26:12 |
| synthesize | 1 | 6,885 | 213,489 | 48 | 08:26:12 | 08:27:00 |

- **claude-opus-5-5**: 3 agent · 49 calls · out 48,083 · in 98 · cache_read 6,210,386 · cache_create 379,033
- **claude-sonnet-5-5**: 6 agent · 24 calls · out 17,865 · in 48 · cache_read 1,737,186 · cache_create 562,443
- **claude-haiku-5-5**: 11 agent · 22 calls · out 15,590 · in 44 · cache_read 1,304,203 · cache_create 672,049


### S4 round 2 — wf_cfada493-e8d — wf_cfada493-e8d (18 agent, 43,415 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 10 | 8,094 | 20 | 965,889 | 100 |
| synthesize:report | claude-sonnet-5-5 | 4 | 6,906 | 8 | 329,256 | 49 |
| review:bugs | claude-opus-5-5 | 10 | 4,332 | 20 | 983,777 | 60 |
| machine:node scripts/luat-kho/do-cay.mjs --du-lu | claude-haiku-5-5 | 2 | 3,670 | 4 | 121,776 | 26 |
| review:conventions | claude-opus-5-5 | 8 | 3,460 | 16 | 682,248 | 46 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,491 | 4 | 121,775 | 241 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,385 | 4 | 121,805 | 71 |
| triage | claude-sonnet-5-5 | 2 | 2,043 | 4 | 89,596 | 18 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,881 | 4 | 121,750 | 10 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 1,855 | 8 | 276,412 | 38 |
| machine:node _acceptance/luat-kho-vong-doi/rang/ | claude-haiku-5-5 | 2 | 1,172 | 4 | 121,778 | 98 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,066 | 4 | 121,766 | 238 |
| machine:bun _acceptance/luat-kho-vong-doi/rang/c | claude-haiku-5-5 | 2 | 1,046 | 4 | 121,781 | 8 |
| machine:node _acceptance/luat-kho-vong-doi/rang/ | claude-haiku-5-5 | 2 | 834 | 4 | 121,782 | 58 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 812 | 4 | 121,748 | 25 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 726 | 4 | 121,744 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 415 | 4 | 86,005 | 14 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 227 | 4 | 121,750 | 254 |


wall: 928s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,855 | 276,412 | 38 | 08:28:17 | 08:28:54 |
| machine | 11 | 16,310 | 1,339,455 | 846 | 08:28:17 | 08:42:23 |
| review | 3 | 15,886 | 2,631,914 | 101 | 08:28:17 | 08:29:58 |
| triage | 1 | 2,043 | 89,596 | 18 | 08:42:23 | 08:42:41 |
| capture | 1 | 415 | 86,005 | 14 | 08:42:41 | 08:42:56 |
| synthesize | 1 | 6,906 | 329,256 | 49 | 08:42:56 | 08:43:45 |

- **claude-opus-5-5**: 3 agent · 28 calls · out 15,886 · in 56 · cache_read 2,631,914 · cache_create 266,971
- **claude-sonnet-5-5**: 4 agent · 12 calls · out 11,219 · in 24 · cache_read 781,269 · cache_create 401,605
- **claude-haiku-5-5**: 11 agent · 22 calls · out 16,310 · in 44 · cache_read 1,339,455 · cache_create 639,602

