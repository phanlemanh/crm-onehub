### S4 round 1 — wf_030a82d7-7e2 (27 agent, 47,225 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 12,561 | 6 | 108,470 | 86 |
| review:bugs | claude-opus-5-5 | 14 | 3,710 | 28 | 805,981 | 199 |
| triage | claude-sonnet-5-5 | 2 | 2,780 | 4 | 28,353 | 22 |
| review:measurement | claude-opus-5-5 | 8 | 2,598 | 16 | 359,131 | 108 |
| ui:E10 | claude-sonnet-5-5 | 6 | 2,406 | 12 | 541,420 | 167 |
| machine:bun _acceptance/ngan-ban-ghi-giu-danh-ti | claude-haiku-5-5 | 2 | 2,354 | 4 | 26,894 | 194 |
| review:conventions | claude-opus-5-5 | 16 | 2,026 | 32 | 876,360 | 136 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,014 | 4 | 26,938 | 73 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 7 | 1,933 | 14 | 151,610 | 954 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,782 | 4 | 2,973 | 436 |
| ui:E9 | claude-sonnet-5-5 | 6 | 1,768 | 12 | 514,339 | 112 |
| ui:E11 | claude-sonnet-5-5 | 9 | 1,733 | 18 | 859,006 | 216 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 4 | 1,647 | 8 | 61,265 | 699 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,394 | 4 | 26,883 | 9 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 1,252 | 4 | 2,973 | 559 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-5-5 | 2 | 1,226 | 4 | 26,909 | 30 |
| machine:node _acceptance/ngan-ban-ghi-giu-danh-t | claude-haiku-5-5 | 2 | 1,019 | 4 | 26,889 | 95 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 921 | 4 | 26,881 | 42 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 443 | 4 | 31,639 | 273 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 337 | 4 | 26,947 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 203 | 4 | 26,946 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 201 | 4 | 26,946 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 200 | 4 | 26,945 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 193 | 4 | 26,930 | 10 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 188 | 4 | 26,877 | 7 |
| machine:node _acceptance/ve-sinh-do-san-onehub/r | claude-haiku-5-5 | 2 | 186 | 4 | 26,932 | 28 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 22,702 | 6 |


wall: 2347s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 443 | 31,639 | 273 | 15:44:08 | 15:48:41 |
| machine | 17 | 17,050 | 568,738 | 2228 | 15:44:08 | 16:21:16 |
| ui | 3 | 5,907 | 1,914,765 | 219 | 15:44:08 | 15:47:47 |
| review | 3 | 8,334 | 2,041,472 | 211 | 15:44:08 | 15:47:39 |
| triage | 1 | 2,780 | 28,353 | 22 | 16:21:17 | 16:21:39 |
| capture | 1 | 150 | 22,702 | 6 | 16:21:41 | 16:21:47 |
| synthesize | 1 | 12,561 | 108,470 | 86 | 16:21:48 | 16:23:14 |

- **claude-sonnet-5-5**: 7 agent · 30 calls · out 21,841 · in 60 · cache_read 2,105,929 · cache_create 425,634
- **claude-opus-5-5**: 3 agent · 38 calls · out 8,334 · in 76 · cache_read 2,041,472 · cache_create 220,652
- **claude-haiku-5-5**: 17 agent · 41 calls · out 17,050 · in 82 · cache_read 568,738 · cache_create 540,777

