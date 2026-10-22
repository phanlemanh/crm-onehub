### S4 round 1 — wf_b400aaa0-f08 (34 agent, 63,930 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 15,548 | 6 | 133,358 | 92 |
| review:measurement | claude-opus-5-5 | 17 | 10,274 | 34 | 1,398,803 | 266 |
| ui:E9 | claude-sonnet-5-5 | 10 | 9,638 | 20 | 1,022,844 | 132 |
| triage | claude-sonnet-5-5 | 2 | 5,839 | 4 | 33,779 | 41 |
| review:conventions | claude-opus-5-5 | 42 | 2,400 | 84 | 3,640,203 | 303 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,062 | 4 | 30,526 | 76 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,808 | 4 | 2,973 | 322 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,695 | 4 | 30,555 | 20 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,623 | 4 | 2,973 | 467 |
| review:bugs | claude-opus-5-5 | 35 | 1,541 | 70 | 2,664,912 | 316 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,453 | 4 | 30,553 | 18 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,373 | 4 | 30,471 | 11 |
| refute:nhap-truong-luc-tao.dom.tsx | claude-sonnet-5-5 | 2 | 976 | 4 | 29,177 | 11 |
| refute:nhap-truong-luc-tao.dom.tsx | claude-sonnet-5-5 | 8 | 840 | 16 | 259,520 | 36 |
| refute:nhap-truong-luc-tao.dom.tsx | claude-sonnet-5-5 | 4 | 825 | 8 | 97,009 | 20 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 749 | 4 | 30,557 | 16 |
| refute:do-man.mjs | claude-sonnet-5-5 | 5 | 687 | 10 | 124,916 | 23 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 644 | 4 | 30,469 | 24 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 616 | 4 | 38,062 | 65 |
| machine:bun _acceptance/nhap-truong-luc-tao/rang | claude-haiku-5-5 | 2 | 384 | 4 | 30,502 | 9 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 363 | 4 | 30,554 | 16 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 327 | 4 | 30,553 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 310 | 4 | 30,571 | 11 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 298 | 4 | 0 | 411 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 226 | 4 | 30,571 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 225 | 4 | 30,574 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 202 | 4 | 30,575 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 202 | 4 | 30,572 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 200 | 4 | 30,572 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 198 | 4 | 30,573 | 11 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 171 | 4 | 30,465 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 152 | 4 | 26,291 | 8 |
| refute:nhap-truong-luc-tao.dom.tsx | claude-sonnet-5-5 | 4 | 50 | 8 | 93,508 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 31 | 4 | 30,722 | 16 |


wall: 1522s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 616 | 38,062 | 65 | 02:06:54 | 02:07:59 |
| machine | 21 | 14,544 | 555,881 | 1331 | 02:06:54 | 02:29:05 |
| ui | 1 | 9,638 | 1,022,844 | 132 | 02:07:08 | 02:09:20 |
| review | 3 | 14,215 | 7,703,918 | 319 | 02:07:08 | 02:12:27 |
| triage | 1 | 5,839 | 33,779 | 41 | 02:29:07 | 02:29:48 |
| refute | 5 | 3,378 | 604,130 | 41 | 02:29:51 | 02:30:32 |
| capture | 1 | 152 | 26,291 | 8 | 02:30:34 | 02:30:41 |
| synthesize | 1 | 15,548 | 133,358 | 92 | 02:30:43 | 02:32:15 |

- **claude-sonnet-5-5**: 10 agent · 42 calls · out 35,171 · in 84 · cache_read 1,858,464 · cache_create 518,165
- **claude-opus-5-5**: 3 agent · 94 calls · out 14,215 · in 188 · cache_read 7,703,918 · cache_create 352,956
- **claude-haiku-5-5**: 21 agent · 42 calls · out 14,544 · in 84 · cache_read 555,881 · cache_create 709,378

