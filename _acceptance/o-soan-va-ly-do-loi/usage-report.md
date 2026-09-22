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

