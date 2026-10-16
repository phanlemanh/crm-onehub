### S4 round 1 — wf_60125bd9-da5 (22 agent, 79,519 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 17 | 17,280 | 34 | 1,155,683 | 199 |
| review:measurement | claude-opus-5-5 | 7 | 12,605 | 14 | 370,516 | 134 |
| review:conventions | claude-opus-5-5 | 15 | 9,223 | 30 | 809,709 | 115 |
| synthesize:report | claude-sonnet-5-5 | 4 | 8,984 | 8 | 191,861 | 65 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 5,630 | 4 | 44,833 | 36 |
| triage | claude-sonnet-5-5 | 2 | 3,786 | 4 | 44,304 | 28 |
| refute:khong-re-theo-ten.mjs | claude-sonnet-5-5 | 6 | 3,177 | 12 | 232,632 | 36 |
| refute:khong-re-theo-ten.mjs | claude-sonnet-5-5 | 6 | 2,639 | 12 | 237,719 | 30 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,333 | 4 | 42,427 | 258 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,891 | 4 | 42,402 | 10 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 1,760 | 4 | 42,444 | 48 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 1,583 | 4 | 42,444 | 16 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 1,461 | 4 | 42,447 | 21 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,247 | 4 | 42,418 | 309 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,030 | 4 | 42,457 | 88 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 786 | 4 | 42,400 | 162 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 758 | 4 | 42,446 | 9 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 757 | 4 | 42,446 | 9 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 746 | 4 | 42,402 | 248 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 743 | 4 | 39,527 | 10 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 687 | 4 | 42,447 | 18 |
| capture:provenance | claude-sonnet-5-5 | 2 | 413 | 4 | 38,324 | 8 |


wall: 1224s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,630 | 44,833 | 36 | 18:08:46 | 18:09:22 |
| machine | 13 | 15,782 | 548,707 | 1084 | 18:08:46 | 18:26:50 |
| review | 3 | 39,108 | 2,335,908 | 201 | 18:08:46 | 18:12:06 |
| triage | 1 | 3,786 | 44,304 | 28 | 18:26:50 | 18:27:19 |
| refute | 2 | 5,816 | 470,351 | 38 | 18:27:19 | 18:27:57 |
| capture | 1 | 413 | 38,324 | 9 | 18:27:57 | 18:28:05 |
| synthesize | 1 | 8,984 | 191,861 | 65 | 18:28:05 | 18:29:10 |

- **claude-opus-5-5**: 3 agent · 39 calls · out 39,108 · in 78 · cache_read 2,335,908 · cache_create 249,058
- **claude-sonnet-5-5**: 6 agent · 22 calls · out 24,629 · in 44 · cache_read 789,673 · cache_create 322,856
- **claude-haiku-5-5**: 13 agent · 26 calls · out 15,782 · in 52 · cache_read 548,707 · cache_create 548,033

### S4 round 2 — wf_6867dcf3-163 (20 agent, 50,826 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 11 | 10,643 | 22 | 635,546 | 126 |
| synthesize:report | claude-sonnet-5-5 | 5 | 8,154 | 10 | 254,877 | 72 |
| review:measurement | claude-opus-5-5 | 7 | 6,653 | 14 | 325,437 | 80 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 5,241 | 4 | 44,469 | 33 |
| review:conventions | claude-opus-5-5 | 5 | 3,739 | 10 | 199,989 | 47 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 2,329 | 4 | 42,461 | 56 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 1,903 | 4 | 42,461 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,631 | 4 | 42,419 | 11 |
| triage | claude-sonnet-5-5 | 2 | 1,528 | 4 | 41,632 | 13 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 1,109 | 4 | 42,464 | 23 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,060 | 4 | 42,435 | 299 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 969 | 4 | 42,463 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 947 | 4 | 42,417 | 162 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 912 | 4 | 42,444 | 257 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 816 | 4 | 39,550 | 241 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 785 | 4 | 42,474 | 86 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 732 | 4 | 42,413 | 8 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 698 | 4 | 42,464 | 19 |
| machine:bun _acceptance/khong-re-theo-ten-thanh- | claude-haiku-5-5 | 2 | 559 | 4 | 42,463 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 418 | 4 | 38,341 | 11 |


wall: 1162s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,241 | 44,469 | 33 | 18:39:03 | 18:39:36 |
| machine | 13 | 14,450 | 548,928 | 1066 | 18:39:03 | 18:56:49 |
| review | 3 | 21,035 | 1,160,972 | 127 | 18:39:03 | 18:41:11 |
| triage | 1 | 1,528 | 41,632 | 13 | 18:56:49 | 18:57:02 |
| capture | 1 | 418 | 38,341 | 11 | 18:57:02 | 18:57:14 |
| synthesize | 1 | 8,154 | 254,877 | 72 | 18:57:14 | 18:58:25 |

- **claude-opus-5-5**: 3 agent · 23 calls · out 21,035 · in 46 · cache_read 1,160,972 · cache_create 200,471
- **claude-sonnet-5-5**: 4 agent · 11 calls · out 15,341 · in 22 · cache_read 379,319 · cache_create 216,179
- **claude-haiku-5-5**: 13 agent · 26 calls · out 14,450 · in 52 · cache_read 548,928 · cache_create 549,190

