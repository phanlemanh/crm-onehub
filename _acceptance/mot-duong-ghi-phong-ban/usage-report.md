### S4 round 1 — wf_25758a8c-c3d (24 agent, 145,865 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 22,305 | 4 | 87,620 | 206 |
| review:bugs | claude-opus-5-5 | 32 | 18,521 | 64 | 4,077,745 | 231 |
| review:measurement | claude-opus-5-5 | 23 | 14,114 | 46 | 2,759,402 | 183 |
| judge:E9:domain-correctness | claude-sonnet-5 | 3 | 13,588 | 6 | 144,418 | 130 |
| judge:E9:spec-alignment | claude-sonnet-5 | 2 | 13,098 | 4 | 103,223 | 129 |
| triage | claude-sonnet-5 | 2 | 11,916 | 4 | 70,445 | 128 |
| baseline:diffBase | claude-sonnet-5 | 25 | 11,280 | 50 | 2,060,643 | 168 |
| review:conventions | claude-opus-5-5 | 20 | 10,930 | 40 | 2,121,549 | 136 |
| judge:E9:operational-feasibility | claude-sonnet-5 | 2 | 10,221 | 4 | 103,225 | 104 |
| machine:bun _acceptance/mot-duong-ghi-phong-ban/ | claude-haiku-4-5-20251001 | 2 | 3,423 | 18 | 72,546 | 46 |
| machine:bun _acceptance/mot-duong-ghi-phong-ban/ | claude-haiku-4-5-20251001 | 4 | 1,736 | 34 | 170,404 | 26 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 5 | 1,627 | 42 | 225,987 | 28 |
| machine:bun _acceptance/mot-duong-ghi-phong-ban/ | claude-haiku-4-5-20251001 | 2 | 1,591 | 18 | 72,547 | 44 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 5 | 1,548 | 42 | 226,693 | 32 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,525 | 34 | 186,118 | 25 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 4 | 1,388 | 34 | 185,400 | 24 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 4 | 1,335 | 34 | 172,941 | 30 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,276 | 34 | 145,903 | 112 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,134 | 18 | 72,514 | 26 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 4 | 1,035 | 34 | 171,699 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 758 | 18 | 72,514 | 12 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 746 | 18 | 72,512 | 12 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 406 | 18 | 72,557 | 14 |
| capture:provenance | claude-sonnet-5 | 2 | 364 | 4 | 65,527 | 7 |


wall: 606s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 11,280 | 2,060,643 | 168 | 03:25:50 | 03:28:38 |
| machine | 14 | 19,528 | 1,920,335 | 165 | 03:25:50 | 03:28:35 |
| judge | 3 | 36,907 | 350,866 | 139 | 03:26:07 | 03:28:26 |
| review | 3 | 43,565 | 8,958,696 | 233 | 03:26:18 | 03:30:12 |
| triage | 1 | 11,916 | 70,445 | 128 | 03:30:13 | 03:32:21 |
| capture | 1 | 364 | 65,527 | 7 | 03:32:23 | 03:32:29 |
| synthesize | 1 | 22,305 | 87,620 | 206 | 03:32:31 | 03:35:56 |

- **claude-sonnet-5**: 7 agent · 38 calls · out 82,772 · in 76 · cache_read 2,635,101 · cache_create 609,711
- **claude-opus-5-5**: 3 agent · 75 calls · out 43,565 · in 150 · cache_read 8,958,696 · cache_create 414,154
- **claude-haiku-4-5-20251001**: 14 agent · 46 calls · out 19,528 · in 396 · cache_read 1,920,335 · cache_create 392,772

