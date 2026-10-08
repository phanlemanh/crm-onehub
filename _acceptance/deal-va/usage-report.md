### S4 round 1 — wf_0e97b6b7-5b4 (23 agent, 64,508 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 25 | 11,082 | 50 | 2,798,721 | 167 |
| review:measurement | claude-opus-5-5 | 7 | 9,436 | 14 | 706,771 | 102 |
| review:bugs | claude-opus-5-5 | 15 | 7,268 | 30 | 1,524,834 | 107 |
| synthesize:report | claude-sonnet-5-5 | 3 | 6,217 | 6 | 213,922 | 45 |
| baseline:diffBase | claude-sonnet-5-5 | 9 | 5,486 | 18 | 768,103 | 71 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,591 | 4 | 121,367 | 31 |
| triage | claude-sonnet-5-5 | 2 | 3,068 | 4 | 90,095 | 27 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,703 | 4 | 121,424 | 71 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,820 | 4 | 121,385 | 228 |
| machine:bun _acceptance/deal-va/rang/khong-xoa-e | claude-haiku-5-5 | 2 | 1,671 | 4 | 121,556 | 27 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,610 | 4 | 121,369 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,326 | 4 | 121,369 | 233 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,324 | 4 | 121,410 | 11 |
| refute:deal-va-cham-mau.dom.tsx | claude-sonnet-5-5 | 3 | 1,311 | 6 | 178,782 | 18 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,296 | 4 | 121,409 | 11 |
| machine:node ${CLAUDE_PLUGIN_ROOT:-$(node script | claude-haiku-5-5 | 2 | 992 | 4 | 121,496 | 7 |
| machine:cd packages/telemetry && bun test test/a | claude-haiku-5-5 | 2 | 889 | 4 | 121,397 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh perl | claude-haiku-5-5 | 2 | 841 | 4 | 121,476 | 8 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 686 | 4 | 121,394 | 231 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 685 | 4 | 121,363 | 7 |
| machine:cd packages/telemetry && bun test test/a | claude-haiku-5-5 | 2 | 684 | 4 | 121,404 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 322 | 4 | 85,622 | 9 |
| machine:cd apps/app && bun test ./test/agent-res | claude-haiku-5-5 | 2 | 200 | 4 | 121,395 | 7 |


wall: 912s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,486 | 768,103 | 71 | 16:36:36 | 16:37:47 |
| machine | 15 | 20,318 | 1,821,214 | 813 | 16:36:36 | 16:50:09 |
| review | 3 | 27,786 | 5,030,326 | 167 | 16:36:36 | 16:39:23 |
| triage | 1 | 3,068 | 90,095 | 27 | 16:50:09 | 16:50:36 |
| refute | 1 | 1,311 | 178,782 | 18 | 16:50:36 | 16:50:54 |
| capture | 1 | 322 | 85,622 | 9 | 16:50:54 | 16:51:03 |
| synthesize | 1 | 6,217 | 213,922 | 45 | 16:51:03 | 16:51:48 |

- **claude-opus-5-5**: 3 agent · 47 calls · out 27,786 · in 94 · cache_read 5,030,326 · cache_create 324,508
- **claude-sonnet-5-5**: 5 agent · 19 calls · out 16,404 · in 38 · cache_read 1,336,524 · cache_create 499,893
- **claude-haiku-5-5**: 15 agent · 30 calls · out 20,318 · in 60 · cache_read 1,821,214 · cache_create 859,695

### S4 round 2 — wf_eeaf7459-b29 (21 agent, 51,421 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 7 | 9,087 | 14 | 642,549 | 103 |
| synthesize:report | claude-sonnet-5-5 | 5 | 7,571 | 10 | 456,174 | 58 |
| review:bugs | claude-opus-5-5 | 8 | 7,113 | 16 | 731,291 | 84 |
| review:conventions | claude-opus-5-5 | 7 | 5,408 | 14 | 576,756 | 71 |
| triage | claude-sonnet-5-5 | 2 | 3,077 | 4 | 90,067 | 31 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,864 | 4 | 121,436 | 68 |
| machine:bun _acceptance/deal-va/rang/khong-xoa-e | claude-haiku-5-5 | 2 | 2,156 | 4 | 121,568 | 29 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,941 | 4 | 121,397 | 228 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,879 | 4 | 121,381 | 215 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,488 | 4 | 121,421 | 12 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,304 | 4 | 121,422 | 11 |
| machine:node ${CLAUDE_PLUGIN_ROOT:-$(node script | claude-haiku-5-5 | 2 | 1,258 | 4 | 121,508 | 8 |
| machine:cd apps/app && bun test ./test/agent-res | claude-haiku-5-5 | 2 | 909 | 4 | 121,407 | 8 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 811 | 4 | 121,406 | 226 |
| machine:cd packages/telemetry && bun test test/a | claude-haiku-5-5 | 2 | 781 | 4 | 121,409 | 7 |
| machine:cd packages/telemetry && bun test test/a | claude-haiku-5-5 | 2 | 778 | 4 | 121,416 | 6 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh perl | claude-haiku-5-5 | 2 | 747 | 4 | 121,488 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 732 | 4 | 121,375 | 7 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 621 | 4 | 121,379 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 562 | 4 | 121,381 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 334 | 4 | 85,634 | 12 |


wall: 872s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 15 | 18,831 | 1,821,394 | 771 | 16:53:58 | 17:06:50 |
| review | 3 | 21,608 | 1,950,596 | 105 | 16:53:58 | 16:55:43 |
| triage | 1 | 3,077 | 90,067 | 31 | 17:06:50 | 17:07:20 |
| capture | 1 | 334 | 85,634 | 12 | 17:07:21 | 17:07:32 |
| synthesize | 1 | 7,571 | 456,174 | 58 | 17:07:32 | 17:08:31 |

- **claude-opus-5-5**: 3 agent · 22 calls · out 21,608 · in 44 · cache_read 1,950,596 · cache_create 261,283
- **claude-sonnet-5-5**: 3 agent · 9 calls · out 10,982 · in 18 · cache_read 631,875 · cache_create 311,863
- **claude-haiku-5-5**: 15 agent · 30 calls · out 18,831 · in 60 · cache_read 1,821,394 · cache_create 860,376

