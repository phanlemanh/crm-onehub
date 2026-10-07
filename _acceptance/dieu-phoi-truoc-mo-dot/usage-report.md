### S4 round 1 — wf_4f5d0cc2-7b4 (30 agent, 74,554 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 11 | 11,573 | 22 | 1,333,440 | 135 |
| review:bugs | claude-opus-5-5 | 11 | 8,287 | 22 | 1,202,404 | 104 |
| synthesize:report | claude-sonnet-5-5 | 3 | 7,523 | 6 | 223,185 | 48 |
| review:conventions | claude-opus-5-5 | 11 | 7,086 | 22 | 1,148,649 | 90 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,337 | 18 | 93,905 | 51 |
| baseline:diffBase | claude-sonnet-5-5 | 5 | 2,591 | 10 | 392,664 | 80 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,497 | 18 | 93,952 | 89 |
| machine:bun _acceptance/dieu-phoi-va-bien/rang/c | claude-haiku-4-5-20251001 | 2 | 2,365 | 18 | 93,929 | 31 |
| triage | claude-sonnet-5-5 | 2 | 2,345 | 4 | 93,780 | 23 |
| machine:node _acceptance/dieu-phoi-truoc-mo-dot/ | claude-haiku-4-5-20251001 | 2 | 2,252 | 18 | 93,931 | 30 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,192 | 18 | 93,926 | 260 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,997 | 18 | 93,907 | 296 |
| refute:tra-loi.test.mjs | claude-sonnet-5-5 | 4 | 1,944 | 8 | 327,417 | 26 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,860 | 18 | 93,920 | 228 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,786 | 18 | 93,926 | 36 |
| machine:node --test scripts/dieu-phoi/test/hook- | claude-haiku-4-5-20251001 | 2 | 1,618 | 18 | 93,928 | 23 |
| machine:node _acceptance/dieu-phoi-va-bien/rang/ | claude-haiku-4-5-20251001 | 2 | 1,461 | 18 | 93,928 | 27 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,403 | 18 | 93,928 | 19 |
| refute:tra-loi.test.mjs | claude-sonnet-5-5 | 3 | 1,169 | 6 | 191,660 | 17 |
| machine:bun run test:dieu-phoi | claude-haiku-4-5-20251001 | 2 | 1,149 | 18 | 93,909 | 17 |
| machine:node _acceptance/dieu-phoi-truoc-mo-dot/ | claude-haiku-4-5-20251001 | 2 | 1,075 | 18 | 93,932 | 20 |
| machine:node _acceptance/dieu-phoi-truoc-mo-dot/ | claude-haiku-4-5-20251001 | 2 | 1,060 | 18 | 93,932 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,010 | 18 | 93,905 | 14 |
| machine:node _acceptance/dieu-phoi-va-bien/rang/ | claude-haiku-4-5-20251001 | 2 | 989 | 18 | 93,927 | 51 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 835 | 18 | 93,903 | 13 |
| judge:E13:domain-correctness | claude-sonnet-5-5 | 2 | 784 | 4 | 91,059 | 11 |
| judge:E13:operational-feasibility | claude-sonnet-5-5 | 2 | 711 | 4 | 123,048 | 9 |
| machine:node --test scripts/dieu-phoi/test/tra-l | claude-haiku-4-5-20251001 | 2 | 665 | 18 | 93,927 | 17 |
| judge:E13:spec-alignment | claude-sonnet-5-5 | 2 | 662 | 4 | 123,046 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 328 | 4 | 90,376 | 8 |


wall: 1058s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,591 | 392,664 | 80 | 07:40:34 | 07:41:54 |
| machine | 18 | 29,551 | 1,690,615 | 951 | 07:40:34 | 07:56:24 |
| judge | 3 | 2,157 | 337,153 | 14 | 07:40:52 | 07:41:06 |
| review | 3 | 26,946 | 3,684,493 | 140 | 07:40:58 | 07:43:18 |
| triage | 1 | 2,345 | 93,780 | 23 | 07:56:24 | 07:56:47 |
| refute | 2 | 3,113 | 519,077 | 29 | 07:56:47 | 07:57:16 |
| capture | 1 | 328 | 90,376 | 8 | 07:57:16 | 07:57:24 |
| synthesize | 1 | 7,523 | 223,185 | 48 | 07:57:24 | 07:58:12 |

- **claude-opus-5-5**: 3 agent · 33 calls · out 26,946 · in 66 · cache_read 3,684,493 · cache_create 364,555
- **claude-sonnet-5-5**: 9 agent · 25 calls · out 18,057 · in 50 · cache_read 1,656,235 · cache_create 834,535
- **claude-haiku-4-5-20251001**: 18 agent · 36 calls · out 29,551 · in 324 · cache_read 1,690,615 · cache_create 831,879

### S4 round 2 — wf_d3a22e19-b7b (22 agent, 47,155 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 7 | 8,745 | 14 | 727,738 | 73 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 4,822 | 18 | 93,795 | 63 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,562 | 18 | 93,774 | 52 |
| machine:node _acceptance/dieu-phoi-va-bien/rang/ | claude-haiku-4-5-20251001 | 2 | 3,034 | 18 | 93,796 | 65 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,561 | 18 | 93,821 | 87 |
| baseline:diffBase | claude-sonnet-5-5 | 6 | 2,540 | 12 | 494,323 | 67 |
| machine:node _acceptance/dieu-phoi-truoc-mo-dot/ | claude-haiku-4-5-20251001 | 2 | 2,416 | 18 | 93,800 | 29 |
| review:conventions | claude-opus-5-5 | 6 | 2,011 | 12 | 506,954 | 30 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,953 | 18 | 93,795 | 255 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,920 | 18 | 93,774 | 24 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,887 | 18 | 93,797 | 22 |
| machine:bun run test:dieu-phoi | claude-haiku-4-5-20251001 | 2 | 1,762 | 18 | 93,778 | 35 |
| review:bugs | claude-opus-5-5 | 5 | 1,696 | 10 | 424,075 | 24 |
| review:measurement | claude-opus-5-5 | 4 | 1,558 | 8 | 334,226 | 25 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,428 | 18 | 93,776 | 274 |
| machine:node --test scripts/dieu-phoi/test/tra-l | claude-haiku-4-5-20251001 | 2 | 1,183 | 18 | 93,796 | 15 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 982 | 18 | 93,789 | 230 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 727 | 18 | 93,772 | 12 |
| judge:E13:spec-alignment | claude-sonnet-5-5 | 2 | 667 | 4 | 122,883 | 10 |
| judge:E13:domain-correctness | claude-sonnet-5-5 | 2 | 657 | 4 | 90,896 | 10 |
| judge:E13:operational-feasibility | claude-sonnet-5-5 | 2 | 617 | 4 | 122,885 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 427 | 4 | 90,213 | 9 |


wall: 1017s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,540 | 494,323 | 67 | 07:59:43 | 08:00:50 |
| machine | 13 | 28,237 | 1,219,263 | 934 | 07:59:43 | 08:15:17 |
| judge | 3 | 1,941 | 336,664 | 13 | 07:59:43 | 07:59:56 |
| review | 3 | 5,265 | 1,265,255 | 37 | 07:59:43 | 08:00:20 |
| capture | 1 | 427 | 90,213 | 9 | 08:15:17 | 08:15:26 |
| synthesize | 1 | 8,745 | 727,738 | 73 | 08:15:26 | 08:16:40 |

- **claude-sonnet-5-5**: 6 agent · 21 calls · out 13,653 · in 42 · cache_read 1,648,938 · cache_create 567,383
- **claude-haiku-4-5-20251001**: 13 agent · 26 calls · out 28,237 · in 234 · cache_read 1,219,263 · cache_create 602,401
- **claude-opus-5-5**: 3 agent · 15 calls · out 5,265 · in 30 · cache_read 1,265,255 · cache_create 268,188

