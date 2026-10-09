### S4 round 1 — wf_1f132338-310 (21 agent, 61,837 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 10 | 11,167 | 20 | 1,018,295 | 122 |
| review:bugs | claude-opus-5-5 | 9 | 8,312 | 18 | 907,735 | 94 |
| review:conventions | claude-opus-5-5 | 9 | 7,577 | 18 | 876,022 | 87 |
| synthesize:report | claude-sonnet-5-5 | 3 | 6,239 | 6 | 211,750 | 41 |
| triage | claude-sonnet-5-5 | 2 | 4,721 | 4 | 91,064 | 36 |
| baseline:diffBase | claude-sonnet-5-5 | 10 | 3,920 | 20 | 855,648 | 66 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,764 | 4 | 121,555 | 69 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,485 | 4 | 121,525 | 229 |
| refute:giai-doan-agent.integration.spec.ts | claude-sonnet-5-5 | 7 | 2,416 | 14 | 607,344 | 32 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 2,295 | 4 | 121,498 | 29 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,789 | 4 | 121,500 | 10 |
| machine:bun _acceptance/agent-test-khong-nhap-ap | claude-haiku-5-5 | 2 | 1,369 | 4 | 121,532 | 74 |
| refute:giai-doan-agent.integration.spec.ts | claude-sonnet-5-5 | 4 | 1,265 | 8 | 275,868 | 19 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 871 | 4 | 121,540 | 9 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 867 | 4 | 121,516 | 218 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 780 | 4 | 86,490 | 206 |
| machine:cd packages/validation && bun test test/ | claude-haiku-5-5 | 2 | 751 | 4 | 121,514 | 7 |
| machine:bun _acceptance/agent-test-khong-nhap-ap | claude-haiku-5-5 | 2 | 744 | 4 | 121,579 | 6 |
| machine:bun _acceptance/agent-test-khong-nhap-ap | claude-haiku-5-5 | 2 | 670 | 4 | 121,534 | 13 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 514 | 4 | 121,494 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 321 | 4 | 85,753 | 7 |


wall: 886s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,920 | 855,648 | 66 | 00:18:09 | 00:19:15 |
| machine | 12 | 15,899 | 1,423,277 | 767 | 00:18:09 | 00:30:57 |
| review | 3 | 27,056 | 2,802,052 | 123 | 00:18:10 | 00:20:13 |
| triage | 1 | 4,721 | 91,064 | 36 | 00:30:57 | 00:31:33 |
| refute | 2 | 3,681 | 883,212 | 35 | 00:31:33 | 00:32:08 |
| capture | 1 | 321 | 85,753 | 7 | 00:32:08 | 00:32:15 |
| synthesize | 1 | 6,239 | 211,750 | 41 | 00:32:15 | 00:32:56 |

- **claude-opus-5-5**: 3 agent · 28 calls · out 27,056 · in 56 · cache_read 2,802,052 · cache_create 297,792
- **claude-sonnet-5-5**: 6 agent · 28 calls · out 18,882 · in 56 · cache_read 2,127,427 · cache_create 562,595
- **claude-haiku-5-5**: 12 agent · 24 calls · out 15,899 · in 48 · cache_read 1,423,277 · cache_create 724,655

### S4 round 2 — wf_b05fc203-4c7 (17 agent, 28,614 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 5,963 | 10 | 427,661 | 43 |
| review:measurement | claude-opus-5-5 | 5 | 3,684 | 10 | 407,231 | 44 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,635 | 4 | 121,599 | 65 |
| review:conventions | claude-opus-5-5 | 4 | 2,272 | 8 | 274,513 | 28 |
| review:bugs | claude-opus-5-5 | 6 | 2,268 | 12 | 501,975 | 32 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,969 | 4 | 121,544 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,490 | 4 | 86,534 | 185 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,252 | 4 | 121,542 | 26 |
| machine:bun _acceptance/agent-test-khong-nhap-ap | claude-haiku-5-5 | 2 | 1,220 | 4 | 121,576 | 71 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 989 | 4 | 121,560 | 207 |
| machine:bun _acceptance/agent-test-khong-nhap-ap | claude-haiku-5-5 | 2 | 845 | 4 | 121,623 | 6 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 799 | 4 | 121,584 | 8 |
| machine:bun _acceptance/agent-test-khong-nhap-ap | claude-haiku-5-5 | 2 | 787 | 4 | 121,578 | 13 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 784 | 4 | 121,569 | 223 |
| machine:cd packages/validation && bun test test/ | claude-haiku-5-5 | 2 | 721 | 4 | 121,558 | 6 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 616 | 4 | 121,538 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 320 | 4 | 85,797 | 7 |


wall: 773s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 12 | 14,107 | 1,423,805 | 724 | 00:47:04 | 00:59:07 |
| review | 3 | 8,224 | 1,183,719 | 45 | 00:47:04 | 00:47:49 |
| capture | 1 | 320 | 85,797 | 7 | 00:59:07 | 00:59:14 |
| synthesize | 1 | 5,963 | 427,661 | 43 | 00:59:14 | 00:59:57 |

- **claude-sonnet-5-5**: 2 agent · 7 calls · out 6,283 · in 14 · cache_read 513,458 · cache_create 204,029
- **claude-opus-5-5**: 3 agent · 15 calls · out 8,224 · in 30 · cache_read 1,183,719 · cache_create 231,602
- **claude-haiku-5-5**: 12 agent · 24 calls · out 14,107 · in 48 · cache_read 1,423,805 · cache_create 725,613

