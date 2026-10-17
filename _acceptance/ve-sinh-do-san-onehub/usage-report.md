### S4 round 1 — wf_5cdd036f-b01 (32 agent, 51,818 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 13,648 | 6 | 110,716 | 71 |
| triage | claude-sonnet-5-5 | 2 | 6,774 | 4 | 30,396 | 40 |
| review:measurement | claude-opus-5-5 | 43 | 3,845 | 86 | 4,595,763 | 394 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,068 | 4 | 25,823 | 26 |
| machine:node _acceptance/ve-sinh-do-san-onehub/r | claude-haiku-5-5 | 4 | 2,551 | 8 | 60,205 | 675 |
| review:bugs | claude-opus-5-5 | 42 | 2,447 | 84 | 4,062,297 | 353 |
| review:conventions | claude-opus-5-5 | 25 | 2,429 | 50 | 1,719,231 | 195 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,015 | 4 | 25,880 | 71 |
| machine:bun _acceptance/okr-soat-anh-luot-3/rang | claude-haiku-5-5 | 2 | 1,713 | 4 | 25,861 | 11 |
| machine:PHIEN_DO_CUA_CHAN=_acceptance/cap-nhat-t | claude-haiku-5-5 | 2 | 1,564 | 4 | 5,738 | 448 |
| machine:node _acceptance/khung-trang-cai-dat/ran | claude-haiku-5-5 | 10 | 1,429 | 20 | 236,646 | 1241 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 1,179 | 4 | 25,900 | 278 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,088 | 4 | 25,825 | 8 |
| refute:hydrat-record.mjs | claude-sonnet-5-5 | 5 | 1,040 | 10 | 114,709 | 17 |
| machine:APP_URL=${APP_URL:-http://localhost:3910 | claude-haiku-5-5 | 2 | 851 | 4 | 5,738 | 345 |
| machine:node _acceptance/ve-sinh-do-san-onehub/r | claude-haiku-5-5 | 2 | 728 | 4 | 25,905 | 103 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 568 | 4 | 0 | 453 |
| machine:bun _acceptance/okr-soat-anh-luot-3/rang | claude-haiku-5-5 | 2 | 560 | 4 | 25,864 | 10 |
| machine:node _acceptance/man-cai-dat-noi-tieng-v | claude-haiku-5-5 | 2 | 521 | 4 | 25,865 | 9 |
| machine:bun _acceptance/soan-okr-trong-khung/ran | claude-haiku-5-5 | 2 | 469 | 4 | 25,854 | 9 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 456 | 4 | 5,738 | 383 |
| machine:node _acceptance/ve-sinh-do-san-onehub/r | claude-haiku-5-5 | 2 | 397 | 4 | 25,909 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 381 | 4 | 25,913 | 10 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 302 | 4 | 25,850 | 301 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 294 | 4 | 2,869 | 363 |
| machine:node _acceptance/ve-sinh-do-san-onehub/r | claude-haiku-5-5 | 2 | 273 | 4 | 25,946 | 25 |
| machine:node _acceptance/khung-trang-cai-dat/ran | claude-haiku-5-5 | 2 | 267 | 4 | 25,972 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 217 | 4 | 25,909 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 25,819 | 6 |
| machine:node _acceptance/ve-sinh-do-san-onehub/r | claude-haiku-5-5 | 2 | 208 | 4 | 25,911 | 16 |
| machine:node _acceptance/ve-sinh-do-san-onehub/r | claude-haiku-5-5 | 2 | 177 | 4 | 25,901 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 21,746 | 5 |


wall: 1383s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 568 | 0 | 453 | 07:37:41 | 07:45:14 |
| machine | 24 | 20,921 | 782,841 | 1243 | 07:37:41 | 07:58:23 |
| review | 3 | 8,721 | 10,377,291 | 399 | 07:37:55 | 07:44:33 |
| triage | 1 | 6,774 | 30,396 | 40 | 07:58:25 | 07:59:05 |
| refute | 1 | 1,040 | 114,709 | 17 | 07:59:07 | 07:59:24 |
| capture | 1 | 146 | 21,746 | 5 | 07:59:26 | 07:59:31 |
| synthesize | 1 | 13,648 | 110,716 | 71 | 07:59:33 | 08:00:44 |

- **claude-sonnet-5-5**: 5 agent · 14 calls · out 22,176 · in 28 · cache_read 277,567 · cache_create 246,368
- **claude-opus-5-5**: 3 agent · 110 calls · out 8,721 · in 220 · cache_read 10,377,291 · cache_create 430,646
- **claude-haiku-5-5**: 24 agent · 58 calls · out 20,921 · in 116 · cache_read 782,841 · cache_create 702,453

