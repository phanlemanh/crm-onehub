### ly-do-tu-choi-nop-theo-locale S4 r1 — wf_aca01a40-c61 (29 agent, 82,196 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E9 | claude-sonnet-5-5 | 51 | 13,889 | 102 | 5,818,891 | 155 |
| review:bugs | claude-opus-5-5 | 13 | 9,526 | 26 | 1,521,034 | 135 |
| review:measurement | claude-opus-5-5 | 9 | 9,368 | 18 | 988,980 | 125 |
| synthesize:report | claude-sonnet-5-5 | 4 | 8,778 | 8 | 337,665 | 60 |
| review:conventions | claude-opus-5-5 | 13 | 7,321 | 26 | 1,487,029 | 132 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 2,757 | 8 | 277,059 | 30 |
| triage | claude-sonnet-5-5 | 2 | 2,695 | 4 | 90,661 | 22 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,522 | 4 | 121,750 | 252 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,111 | 4 | 121,741 | 251 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,004 | 4 | 121,780 | 68 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,899 | 4 | 86,475 | 266 |
| refute:soan-okr-ly-do-tu-choi.dom.tsx | claude-sonnet-5-5 | 4 | 1,870 | 8 | 299,505 | 24 |
| refute:soan-okr-ly-do-tu-choi.dom.tsx | claude-sonnet-5-5 | 5 | 1,858 | 10 | 435,790 | 25 |
| refute:man.mjs | claude-sonnet-5-5 | 4 | 1,783 | 8 | 308,420 | 26 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,726 | 4 | 121,725 | 10 |
| refute:man.mjs | claude-sonnet-5-5 | 4 | 1,592 | 8 | 307,777 | 20 |
| refute:soan-okr-ly-do-tu-choi.dom.tsx | claude-sonnet-5-5 | 5 | 1,557 | 10 | 406,497 | 23 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 900 | 4 | 121,578 | 10 |
| machine:bun _acceptance/ly-do-tu-choi-nop-theo-l | claude-haiku-5-5 | 2 | 888 | 4 | 121,529 | 17 |
| machine:cd apps/app && bun test ./test/soan-okr- | claude-haiku-5-5 | 2 | 873 | 4 | 121,548 | 9 |
| machine:bun _acceptance/ly-do-tu-choi-nop-theo-l | claude-haiku-5-5 | 2 | 851 | 4 | 121,530 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 820 | 4 | 121,577 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 768 | 4 | 121,580 | 10 |
| machine:bun _acceptance/ly-do-tu-choi-nop-theo-l | claude-haiku-5-5 | 2 | 763 | 4 | 121,529 | 7 |
| machine:node _acceptance/ly-do-tu-choi-nop-theo- | claude-haiku-5-5 | 2 | 761 | 4 | 121,528 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 752 | 4 | 121,723 | 27 |
| triage | claude-sonnet-5-5 | 2 | 688 | 4 | 123,443 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 544 | 4 | 121,719 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 332 | 4 | 85,979 | 7 |


wall: 1007s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,757 | 277,059 | 30 | 02:52:26 | 02:52:56 |
| machine | 15 | 18,182 | 1,789,312 | 882 | 02:52:26 | 03:07:08 |
| ui | 1 | 13,889 | 5,818,891 | 155 | 02:52:26 | 02:55:02 |
| review | 3 | 26,215 | 3,997,043 | 145 | 02:52:26 | 02:54:52 |
| triage | 2 | 3,383 | 214,104 | 31 | 03:07:08 | 03:07:39 |
| refute | 5 | 8,660 | 1,757,989 | 28 | 03:07:39 | 03:08:07 |
| capture | 1 | 332 | 85,979 | 7 | 03:08:07 | 03:08:14 |
| synthesize | 1 | 8,778 | 337,665 | 60 | 03:08:14 | 03:09:13 |

- **claude-sonnet-5-5**: 11 agent · 87 calls · out 37,799 · in 174 · cache_read 8,491,687 · cache_create 981,266
- **claude-opus-5-5**: 3 agent · 35 calls · out 26,215 · in 70 · cache_read 3,997,043 · cache_create 373,014
- **claude-haiku-5-5**: 15 agent · 30 calls · out 18,182 · in 60 · cache_read 1,789,312 · cache_create 894,341

### ly-do-tu-choi-nop-theo-locale S4 r2 — wf_251c8bd2-318 (22 agent, 81,720 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 20 | 22,284 | 40 | 2,676,878 | 276 |
| review:bugs | claude-opus-5-5 | 16 | 13,730 | 32 | 2,043,839 | 183 |
| synthesize:report | claude-sonnet-5-5 | 6 | 8,815 | 12 | 599,209 | 69 |
| ui:E9 | claude-sonnet-5-5 | 16 | 7,513 | 32 | 1,582,740 | 167 |
| review:conventions | claude-opus-5-5 | 12 | 6,782 | 24 | 1,346,503 | 108 |
| triage | claude-sonnet-5-5 | 2 | 3,788 | 4 | 91,452 | 34 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,726 | 4 | 121,696 | 74 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,263 | 4 | 121,666 | 241 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,881 | 4 | 121,657 | 243 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,829 | 4 | 121,441 | 261 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,606 | 4 | 121,641 | 10 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,171 | 4 | 121,639 | 30 |
| machine:bun _acceptance/ly-do-tu-choi-nop-theo-l | claude-haiku-5-5 | 2 | 954 | 4 | 121,485 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 895 | 4 | 121,533 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 865 | 4 | 121,534 | 9 |
| machine:bun _acceptance/ly-do-tu-choi-nop-theo-l | claude-haiku-5-5 | 2 | 862 | 4 | 121,486 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 765 | 4 | 121,536 | 8 |
| machine:node _acceptance/ly-do-tu-choi-nop-theo- | claude-haiku-5-5 | 2 | 714 | 4 | 121,484 | 7 |
| machine:bun _acceptance/ly-do-tu-choi-nop-theo-l | claude-haiku-5-5 | 2 | 682 | 4 | 121,485 | 7 |
| machine:cd apps/app && bun test ./test/soan-okr- | claude-haiku-5-5 | 2 | 602 | 4 | 121,504 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 583 | 4 | 121,635 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 410 | 4 | 85,895 | 10 |


wall: 979s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 15 | 18,398 | 1,823,422 | 866 | 07:50:39 | 08:05:06 |
| ui | 1 | 7,513 | 1,582,740 | 167 | 07:50:39 | 07:53:26 |
| review | 3 | 42,796 | 6,067,220 | 284 | 07:50:39 | 07:55:24 |
| triage | 1 | 3,788 | 91,452 | 34 | 08:05:06 | 08:05:40 |
| capture | 1 | 410 | 85,895 | 10 | 08:05:40 | 08:05:49 |
| synthesize | 1 | 8,815 | 599,209 | 69 | 08:05:49 | 08:06:59 |

- **claude-opus-5-5**: 3 agent · 48 calls · out 42,796 · in 96 · cache_read 6,067,220 · cache_create 411,445
- **claude-sonnet-5-5**: 4 agent · 26 calls · out 20,526 · in 52 · cache_read 2,359,296 · cache_create 456,116
- **claude-haiku-5-5**: 15 agent · 30 calls · out 18,398 · in 60 · cache_read 1,823,422 · cache_create 858,327

