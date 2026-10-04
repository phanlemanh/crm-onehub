### S4 round 1 — wf_3a3c3b88-740 (21 agent, 85,362 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 18 | 16,602 | 36 | 2,545,180 | 205 |
| synthesize:report | claude-sonnet-5-5 | 3 | 8,744 | 6 | 278,731 | 68 |
| review:measurement | claude-opus-5-5 | 6 | 7,005 | 12 | 701,629 | 83 |
| judge:E4:operational-feasibility | claude-sonnet-5-5 | 2 | 6,470 | 4 | 152,233 | 65 |
| judge:E4:spec-alignment | claude-sonnet-5-5 | 2 | 6,105 | 4 | 152,231 | 59 |
| judge:E4:domain-correctness | claude-sonnet-5-5 | 2 | 5,898 | 4 | 117,280 | 53 |
| review:conventions | claude-opus-5-5 | 11 | 5,559 | 22 | 1,359,530 | 80 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 3 | 4,535 | 26 | 218,426 | 62 |
| baseline:diffBase | claude-sonnet-5-5 | 11 | 4,325 | 22 | 1,299,501 | 112 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 6 | 2,826 | 50 | 496,853 | 249 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,535 | 18 | 120,070 | 93 |
| triage | claude-sonnet-5-5 | 2 | 2,265 | 4 | 120,023 | 23 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,220 | 18 | 120,044 | 183 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 2,212 | 18 | 120,023 | 25 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 3 | 2,140 | 26 | 218,269 | 33 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,274 | 18 | 120,038 | 171 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 2 | 1,255 | 18 | 120,057 | 14 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 2 | 1,199 | 18 | 120,060 | 19 |
| machine:bun run test -- "cd apps/agent-okr && CR | claude-haiku-4-5-20251001 | 2 | 1,160 | 18 | 120,068 | 20 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 685 | 18 | 120,021 | 11 |
| capture:provenance | claude-sonnet-5-5 | 2 | 348 | 4 | 115,964 | 9 |


wall: 895s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,325 | 1,299,501 | 112 | 02:33:40 | 02:35:32 |
| machine | 11 | 22,041 | 1,893,929 | 795 | 02:33:40 | 02:46:55 |
| judge | 3 | 18,473 | 421,744 | 69 | 02:33:40 | 02:34:49 |
| review | 3 | 29,166 | 4,606,339 | 209 | 02:33:40 | 02:37:09 |
| triage | 1 | 2,265 | 120,023 | 23 | 02:46:55 | 02:47:18 |
| capture | 1 | 348 | 115,964 | 9 | 02:47:18 | 02:47:27 |
| synthesize | 1 | 8,744 | 278,731 | 68 | 02:47:27 | 02:48:35 |

- **claude-opus-5-5**: 3 agent · 35 calls · out 29,166 · in 70 · cache_read 4,606,339 · cache_create 385,055
- **claude-sonnet-5-5**: 7 agent · 24 calls · out 34,155 · in 48 · cache_read 2,235,963 · cache_create 944,024
- **claude-haiku-4-5-20251001**: 11 agent · 28 calls · out 22,041 · in 246 · cache_read 1,893,929 · cache_create 810,318

### S4 round 2 — wf_ce331f32-455 (20 agent, 75,000 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 12 | 11,826 | 24 | 1,696,481 | 148 |
| judge:E4:operational-feasibility | claude-sonnet-5-5 | 5 | 10,062 | 10 | 628,300 | 100 |
| judge:E4:spec-alignment | claude-sonnet-5-5 | 6 | 7,437 | 12 | 788,792 | 80 |
| review:measurement | claude-opus-5-5 | 5 | 6,289 | 10 | 589,193 | 77 |
| judge:E4:domain-correctness | claude-sonnet-5-5 | 5 | 6,143 | 10 | 628,782 | 69 |
| synthesize:report | claude-sonnet-5-5 | 5 | 6,025 | 10 | 569,728 | 56 |
| baseline:diffBase | claude-sonnet-5-5 | 8 | 3,381 | 16 | 973,686 | 148 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 4 | 3,205 | 34 | 323,443 | 98 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,137 | 18 | 120,079 | 40 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 4 | 2,861 | 34 | 317,510 | 184 |
| review:conventions | claude-opus-5-5 | 6 | 2,838 | 12 | 736,830 | 45 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,339 | 18 | 91,028 | 228 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 2,037 | 18 | 120,094 | 181 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,517 | 18 | 120,079 | 19 |
| machine:bun run test -- "cd apps/agent-okr && CR | claude-haiku-4-5-20251001 | 2 | 1,303 | 18 | 120,124 | 21 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 2 | 1,095 | 18 | 120,116 | 23 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 2 | 1,074 | 18 | 120,114 | 24 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 2 | 1,047 | 18 | 120,113 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,031 | 18 | 120,077 | 14 |
| capture:provenance | claude-sonnet-5-5 | 2 | 353 | 4 | 116,020 | 9 |


wall: 830s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,381 | 973,686 | 148 | 02:59:42 | 03:02:11 |
| machine | 11 | 20,646 | 1,692,777 | 765 | 02:59:42 | 03:12:27 |
| judge | 3 | 23,642 | 2,045,874 | 104 | 02:59:43 | 03:01:27 |
| review | 3 | 20,953 | 3,022,504 | 152 | 02:59:43 | 03:02:14 |
| capture | 1 | 353 | 116,020 | 9 | 03:12:27 | 03:12:36 |
| synthesize | 1 | 6,025 | 569,728 | 56 | 03:12:36 | 03:13:32 |

- **claude-opus-5-5**: 3 agent · 23 calls · out 20,953 · in 46 · cache_read 3,022,504 · cache_create 409,876
- **claude-sonnet-5-5**: 6 agent · 31 calls · out 33,401 · in 62 · cache_read 3,705,308 · cache_create 875,485
- **claude-haiku-4-5-20251001**: 11 agent · 26 calls · out 20,646 · in 230 · cache_read 1,692,777 · cache_create 838,648

