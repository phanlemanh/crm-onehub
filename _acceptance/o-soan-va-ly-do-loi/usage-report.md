### S4 round 1 — wf_aad96ce7-059 (20 agent, 112,648 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E8 | claude-sonnet-5 | 39 | 22,258 | 78 | 5,033,217 | 358 |
| synthesize:report | claude-sonnet-5 | 2 | 18,770 | 4 | 102,838 | 177 |
| ui:E1 | claude-sonnet-5 | 40 | 16,217 | 80 | 4,750,837 | 503 |
| ui:E2 | claude-sonnet-5 | 26 | 14,257 | 52 | 3,024,467 | 254 |
| triage | claude-sonnet-5 | 4 | 10,197 | 8 | 300,980 | 118 |
| baseline:diffBase | claude-sonnet-5 | 18 | 8,881 | 36 | 1,654,318 | 140 |
| review:conventions | claude-opus-5 | 8 | 5,122 | 16 | 708,439 | 63 |
| review:measurement | claude-opus-5 | 7 | 4,485 | 14 | 631,691 | 55 |
| review:bugs | claude-opus-5 | 7 | 2,410 | 14 | 612,309 | 34 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 1,663 | 26 | 119,828 | 61 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 1,063 | 18 | 84,841 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,059 | 18 | 84,788 | 16 |
| capture:provenance | claude-sonnet-5 | 2 | 893 | 4 | 83,741 | 15 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 874 | 18 | 84,844 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 863 | 18 | 84,856 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 829 | 18 | 84,825 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 778 | 18 | 84,786 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 747 | 18 | 84,788 | 23 |
| machine:cd apps/app && bun test test/agent-trans | claude-haiku-4-5-20251001 | 2 | 721 | 18 | 84,808 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 561 | 18 | 84,859 | 15 |


wall: 817s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 8,881 | 1,654,318 | 140 | 16:00:32 | 16:02:51 |
| machine | 10 | 9,158 | 883,223 | 116 | 16:00:32 | 16:02:28 |
| ui | 3 | 52,732 | 12,808,521 | 503 | 16:00:32 | 16:08:55 |
| review | 3 | 12,017 | 1,952,439 | 72 | 16:00:32 | 16:01:43 |
| triage | 1 | 10,197 | 300,980 | 118 | 16:08:56 | 16:10:54 |
| capture | 1 | 893 | 83,741 | 15 | 16:10:56 | 16:11:11 |
| synthesize | 1 | 18,770 | 102,838 | 177 | 16:11:12 | 16:14:09 |

- **claude-sonnet-5**: 7 agent · 131 calls · out 91,473 · in 262 · cache_read 14,950,398 · cache_create 838,000
- **claude-opus-5**: 3 agent · 22 calls · out 12,017 · in 44 · cache_read 1,952,439 · cache_create 272,932
- **claude-haiku-4-5-20251001**: 10 agent · 21 calls · out 9,158 · in 188 · cache_read 883,223 · cache_create 397,025

### S4 round 2 — wf_6b57d06e-88b (21 agent, 135,374 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E8 | claude-sonnet-5 | 71 | 40,405 | 142 | 10,527,011 | 927 |
| synthesize:report | claude-sonnet-5 | 6 | 25,295 | 12 | 598,454 | 238 |
| ui:E1 | claude-sonnet-5 | 45 | 21,463 | 90 | 6,140,615 | 575 |
| refute:o-soan.mjs | claude-sonnet-5 | 19 | 7,489 | 38 | 1,754,269 | 120 |
| ui:E2 | claude-sonnet-5 | 13 | 7,056 | 26 | 1,348,926 | 124 |
| refute:o-soan.mjs | claude-sonnet-5 | 17 | 6,306 | 34 | 1,587,517 | 98 |
| triage | claude-sonnet-5 | 2 | 5,140 | 4 | 86,633 | 60 |
| review:conventions | claude-opus-5 | 10 | 4,940 | 20 | 877,547 | 70 |
| review:bugs | claude-opus-5 | 11 | 4,633 | 22 | 1,005,464 | 66 |
| review:measurement | claude-opus-5 | 4 | 2,042 | 8 | 310,269 | 27 |
| capture:provenance | claude-sonnet-5 | 2 | 1,350 | 4 | 83,741 | 18 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 1,069 | 18 | 84,844 | 17 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,068 | 34 | 182,677 | 56 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 984 | 18 | 84,856 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 976 | 18 | 84,825 | 16 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 971 | 18 | 84,841 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 929 | 18 | 84,859 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 920 | 18 | 84,788 | 16 |
| machine:cd apps/app && bun test test/agent-trans | claude-haiku-4-5-20251001 | 2 | 864 | 18 | 84,808 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 798 | 18 | 84,786 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 676 | 18 | 84,788 | 20 |


wall: 1372s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 10 | 9,255 | 946,072 | 109 | 16:18:49 | 16:20:38 |
| ui | 3 | 68,924 | 18,016,552 | 929 | 16:18:49 | 16:34:18 |
| review | 3 | 11,615 | 2,193,280 | 70 | 16:18:49 | 16:19:58 |
| triage | 1 | 5,140 | 86,633 | 60 | 16:34:20 | 16:35:20 |
| refute | 2 | 13,795 | 3,341,786 | 120 | 16:35:21 | 16:37:21 |
| capture | 1 | 1,350 | 83,741 | 18 | 16:37:22 | 16:37:40 |
| synthesize | 1 | 25,295 | 598,454 | 238 | 16:37:43 | 16:41:40 |

- **claude-sonnet-5**: 8 agent · 175 calls · out 114,504 · in 350 · cache_read 22,127,166 · cache_create 968,518
- **claude-opus-5**: 3 agent · 25 calls · out 11,615 · in 50 · cache_read 2,193,280 · cache_create 243,160
- **claude-haiku-4-5-20251001**: 10 agent · 22 calls · out 9,255 · in 196 · cache_read 946,072 · cache_create 396,547

