### S4 round 1 — wf_8dbfd4b9-dbe (26 agent, 99,706 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 31 | 15,472 | 62 | 2,637,330 | 234 |
| review:measurement | claude-opus-5-5 | 16 | 13,205 | 32 | 1,193,342 | 198 |
| synthesize:report | claude-sonnet-5-5 | 4 | 12,453 | 8 | 207,734 | 78 |
| review:conventions | claude-opus-5-5 | 20 | 10,887 | 40 | 1,436,371 | 164 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 6,306 | 4 | 45,291 | 218 |
| ui:E7 | claude-sonnet-5-5 | 9 | 5,882 | 18 | 878,718 | 291 |
| judge:E7j:spec-alignment | claude-sonnet-5-5 | 2 | 5,348 | 4 | 43,172 | 42 |
| triage | claude-sonnet-5-5 | 2 | 3,848 | 4 | 44,616 | 28 |
| judge:E7j:domain-correctness | claude-sonnet-5-5 | 2 | 3,654 | 4 | 39,810 | 28 |
| judge:E7j:operational-feasibility | claude-sonnet-5-5 | 2 | 3,557 | 4 | 43,174 | 26 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 2,952 | 4 | 42,395 | 223 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,287 | 4 | 42,341 | 253 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,978 | 4 | 42,332 | 299 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,892 | 4 | 42,316 | 12 |
| refute:data-table.tsx | claude-sonnet-5-5 | 4 | 1,412 | 8 | 128,026 | 18 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,101 | 4 | 42,314 | 35 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,078 | 4 | 42,371 | 67 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 871 | 4 | 42,412 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 868 | 4 | 42,412 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 839 | 4 | 42,411 | 11 |
| machine:cd apps/app && bun test ./test/loc-va-ki | claude-haiku-5-5 | 2 | 766 | 4 | 42,346 | 9 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 677 | 4 | 42,316 | 289 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 654 | 4 | 42,310 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 637 | 4 | 42,411 | 9 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 585 | 4 | 42,359 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 497 | 4 | 38,239 | 9 |


wall: 1096s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 6,306 | 45,291 | 218 | 05:08:50 | 05:12:28 |
| machine | 14 | 17,185 | 593,046 | 963 | 05:08:50 | 05:24:53 |
| ui | 1 | 5,882 | 878,718 | 291 | 05:08:50 | 05:13:40 |
| judge | 3 | 12,559 | 126,156 | 52 | 05:08:50 | 05:09:42 |
| review | 3 | 39,564 | 5,267,043 | 236 | 05:09:01 | 05:12:56 |
| triage | 1 | 3,848 | 44,616 | 28 | 05:24:53 | 05:25:21 |
| refute | 1 | 1,412 | 128,026 | 18 | 05:25:21 | 05:25:39 |
| capture | 1 | 497 | 38,239 | 9 | 05:25:39 | 05:25:48 |
| synthesize | 1 | 12,453 | 207,734 | 78 | 05:25:48 | 05:27:06 |

- **claude-opus-5-5**: 3 agent · 67 calls · out 39,564 · in 134 · cache_read 5,267,043 · cache_create 340,175
- **claude-sonnet-5-5**: 9 agent · 29 calls · out 42,957 · in 58 · cache_read 1,468,780 · cache_create 561,353
- **claude-haiku-5-5**: 14 agent · 28 calls · out 17,185 · in 56 · cache_read 593,046 · cache_create 582,340

### S4 round 2 — wf_26e82f34-758 (21 agent, 58,464 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 8 | 12,111 | 16 | 495,494 | 93 |
| review:bugs | claude-opus-5-5 | 15 | 7,533 | 30 | 928,544 | 101 |
| ui:E7 | claude-sonnet-5-5 | 6 | 5,009 | 12 | 523,039 | 270 |
| judge:E7j:domain-correctness | claude-sonnet-5-5 | 2 | 4,807 | 4 | 39,819 | 35 |
| judge:E7j:spec-alignment | claude-sonnet-5-5 | 2 | 4,678 | 4 | 43,181 | 36 |
| judge:E7j:operational-feasibility | claude-sonnet-5-5 | 2 | 4,026 | 4 | 43,183 | 31 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 3,604 | 4 | 42,806 | 206 |
| review:measurement | claude-opus-5-5 | 9 | 3,235 | 18 | 410,353 | 47 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 2,528 | 4 | 42,404 | 212 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,981 | 4 | 42,325 | 12 |
| review:conventions | claude-opus-5-5 | 5 | 1,135 | 10 | 181,274 | 19 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,046 | 4 | 42,341 | 291 |
| triage | claude-sonnet-5-5 | 2 | 989 | 4 | 40,640 | 13 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 883 | 4 | 42,380 | 65 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 819 | 4 | 42,420 | 9 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 734 | 4 | 42,350 | 248 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 728 | 4 | 42,323 | 30 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 724 | 4 | 42,368 | 9 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 721 | 4 | 42,325 | 254 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 675 | 4 | 42,319 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 498 | 4 | 38,248 | 9 |


wall: 1024s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,604 | 42,806 | 206 | 05:57:57 | 06:01:22 |
| machine | 10 | 10,839 | 423,555 | 910 | 05:57:57 | 06:13:06 |
| ui | 1 | 5,009 | 523,039 | 270 | 05:57:57 | 06:02:26 |
| judge | 3 | 13,511 | 126,183 | 38 | 05:57:57 | 05:58:35 |
| review | 3 | 11,903 | 1,520,171 | 102 | 05:57:57 | 05:59:38 |
| triage | 1 | 989 | 40,640 | 13 | 06:13:06 | 06:13:19 |
| capture | 1 | 498 | 38,248 | 9 | 06:13:19 | 06:13:28 |
| synthesize | 1 | 12,111 | 495,494 | 93 | 06:13:28 | 06:15:01 |

- **claude-sonnet-5-5**: 8 agent · 26 calls · out 35,722 · in 52 · cache_read 1,266,410 · cache_create 509,297
- **claude-opus-5-5**: 3 agent · 29 calls · out 11,903 · in 58 · cache_read 1,520,171 · cache_create 193,423
- **claude-haiku-5-5**: 10 agent · 20 calls · out 10,839 · in 40 · cache_read 423,555 · cache_create 420,036

