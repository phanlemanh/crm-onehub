### S4 round 1 — wf_78cb936e-54f (37 agent, 71,755 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 15,719 | 6 | 249,610 | 115 |
| review:measurement | claude-opus-5-5 | 18 | 11,659 | 36 | 2,272,514 | 235 |
| triage | claude-sonnet-5-5 | 2 | 5,865 | 4 | 94,423 | 45 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,326 | 4 | 122,383 | 72 |
| ui:E16 | claude-sonnet-5-5 | 6 | 2,176 | 12 | 523,818 | 78 |
| ui:E1 | claude-sonnet-5-5 | 10 | 2,160 | 20 | 912,576 | 204 |
| ui:E19 | claude-sonnet-5-5 | 6 | 2,123 | 12 | 519,438 | 144 |
| ui:E20 | claude-sonnet-5-5 | 8 | 2,103 | 16 | 732,616 | 107 |
| ui:E18 | claude-sonnet-5-5 | 6 | 2,043 | 12 | 518,755 | 121 |
| baseline:diffBase | claude-sonnet-5-5 | 6 | 2,009 | 12 | 484,939 | 72 |
| ui:E17 | claude-sonnet-5-5 | 9 | 1,888 | 18 | 841,928 | 194 |
| review:bugs | claude-opus-5-5 | 27 | 1,879 | 54 | 3,529,769 | 217 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,756 | 4 | 122,318 | 61 |
| machine:for t in "apps/app/components/crm/record | claude-haiku-5-5 | 2 | 1,572 | 4 | 122,569 | 13 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 1,536 | 4 | 122,373 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,464 | 4 | 122,328 | 11 |
| refute:dien-thoai-ca-nhan.dom.tsx | claude-sonnet-5-5 | 5 | 1,257 | 10 | 433,035 | 35 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,241 | 4 | 122,340 | 16 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,176 | 4 | 122,335 | 15 |
| refute:dien-thoai-ca-nhan.spec.ts | claude-sonnet-5-5 | 7 | 1,125 | 14 | 600,521 | 32 |
| refute:do-man.mjs | claude-sonnet-5-5 | 6 | 1,106 | 12 | 500,151 | 34 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,088 | 4 | 122,348 | 14 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 922 | 4 | 122,326 | 30 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 888 | 4 | 122,340 | 13 |
| refute:do-man.mjs | claude-sonnet-5-5 | 7 | 844 | 14 | 571,768 | 31 |
| refute:dien-thoai-ca-nhan.dom.tsx | claude-sonnet-5-5 | 6 | 790 | 12 | 500,857 | 26 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 668 | 4 | 122,302 | 241 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 430 | 4 | 122,362 | 8 |
| review:conventions | claude-opus-5-5 | 25 | 345 | 50 | 3,010,648 | 182 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 298 | 4 | 122,353 | 207 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 208 | 4 | 122,342 | 11 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 203 | 4 | 122,358 | 10 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 202 | 4 | 122,365 | 9 |
| machine:cd packages/validation && bun test test/ | claude-haiku-5-5 | 2 | 192 | 4 | 122,320 | 7 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 178 | 4 | 122,358 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 168 | 4 | 122,322 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 86,408 | 7 |


wall: 854s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,009 | 484,939 | 72 | 01:38:35 | 01:39:47 |
| machine | 19 | 16,516 | 2,324,742 | 642 | 01:38:35 | 01:49:17 |
| ui | 6 | 12,493 | 4,049,131 | 204 | 01:38:48 | 01:42:13 |
| review | 3 | 13,883 | 8,812,931 | 238 | 01:38:55 | 01:42:53 |
| triage | 1 | 5,865 | 94,423 | 45 | 01:49:19 | 01:50:05 |
| refute | 5 | 5,122 | 2,606,332 | 37 | 01:50:07 | 01:50:44 |
| capture | 1 | 148 | 86,408 | 7 | 01:50:46 | 01:50:53 |
| synthesize | 1 | 15,719 | 249,610 | 115 | 01:50:55 | 01:52:50 |

- **claude-sonnet-5-5**: 15 agent · 89 calls · out 41,356 · in 178 · cache_read 7,570,843 · cache_create 1,263,223
- **claude-opus-5-5**: 3 agent · 70 calls · out 13,883 · in 140 · cache_read 8,812,931 · cache_create 414,355
- **claude-haiku-5-5**: 19 agent · 38 calls · out 16,516 · in 76 · cache_read 2,324,742 · cache_create 1,122,164

### S4 round 2 — wf_73afbed1-0e0 (33 agent, 49,272 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 11,397 | 6 | 236,878 | 98 |
| review:measurement | claude-opus-5-5 | 23 | 3,946 | 46 | 2,649,972 | 163 |
| triage | claude-sonnet-5-5 | 2 | 2,970 | 4 | 90,735 | 26 |
| ui:E18 | claude-sonnet-5-5 | 6 | 2,168 | 12 | 534,121 | 86 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,099 | 4 | 122,383 | 69 |
| ui:E16 | claude-sonnet-5-5 | 6 | 2,065 | 12 | 528,969 | 148 |
| ui:E17 | claude-sonnet-5-5 | 7 | 1,936 | 14 | 647,224 | 121 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,925 | 4 | 122,353 | 230 |
| ui:E1 | claude-sonnet-5-5 | 7 | 1,692 | 14 | 591,888 | 65 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,560 | 4 | 122,344 | 230 |
| machine:for t in "apps/app/components/crm/record | claude-haiku-5-5 | 2 | 1,446 | 4 | 122,595 | 15 |
| ui:E19 | claude-sonnet-5-5 | 9 | 1,411 | 18 | 763,054 | 657 |
| ui:E20 | claude-sonnet-5-5 | 10 | 1,379 | 20 | 879,317 | 634 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,343 | 4 | 122,328 | 11 |
| refute:do-man.mjs | claude-sonnet-5-5 | 5 | 1,226 | 10 | 417,564 | 25 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,158 | 4 | 122,361 | 16 |
| review:bugs | claude-opus-5-5 | 12 | 1,123 | 24 | 1,409,668 | 95 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,094 | 4 | 122,374 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,002 | 4 | 122,366 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 876 | 4 | 122,366 | 15 |
| refute:do-man.mjs | claude-sonnet-5-5 | 14 | 862 | 28 | 1,249,521 | 56 |
| review:conventions | claude-opus-5-5 | 14 | 806 | 28 | 1,425,870 | 95 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 599 | 4 | 87,318 | 261 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 585 | 4 | 122,384 | 12 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 508 | 4 | 122,447 | 11 |
| machine:cd packages/validation && bun test test/ | claude-haiku-5-5 | 2 | 474 | 4 | 122,346 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 368 | 4 | 122,322 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 292 | 4 | 122,326 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 209 | 4 | 122,368 | 12 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 203 | 4 | 122,384 | 9 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 200 | 4 | 122,388 | 8 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 199 | 4 | 122,391 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 86,408 | 7 |


wall: 1040s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 19 | 16,140 | 2,290,144 | 845 | 01:58:44 | 02:12:49 |
| ui | 6 | 10,651 | 3,944,573 | 661 | 01:58:57 | 02:09:57 |
| review | 3 | 5,875 | 5,485,510 | 164 | 01:59:03 | 02:01:47 |
| triage | 1 | 2,970 | 90,735 | 26 | 02:12:52 | 02:13:18 |
| refute | 2 | 2,088 | 1,667,085 | 56 | 02:13:20 | 02:14:16 |
| capture | 1 | 151 | 86,408 | 7 | 02:14:18 | 02:14:24 |
| synthesize | 1 | 11,397 | 236,878 | 98 | 02:14:26 | 02:16:05 |

- **claude-sonnet-5-5**: 11 agent · 71 calls · out 27,257 · in 142 · cache_read 6,025,679 · cache_create 1,132,217
- **claude-opus-5-5**: 3 agent · 49 calls · out 5,875 · in 98 · cache_read 5,485,510 · cache_create 344,997
- **claude-haiku-5-5**: 19 agent · 38 calls · out 16,140 · in 76 · cache_read 2,290,144 · cache_create 1,158,613

