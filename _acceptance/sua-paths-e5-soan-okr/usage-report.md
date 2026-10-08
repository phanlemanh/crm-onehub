### S4 round 1 — wf_93328896-a2b (22 agent, 56,313 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 8 | 11,911 | 16 | 903,145 | 146 |
| review:bugs | claude-opus-5-5 | 10 | 9,068 | 20 | 1,145,687 | 130 |
| review:conventions | claude-opus-5-5 | 13 | 8,720 | 26 | 1,541,877 | 132 |
| synthesize:report | claude-sonnet-5-5 | 3 | 5,740 | 6 | 231,816 | 39 |
| triage | claude-sonnet-5-5 | 2 | 2,818 | 4 | 99,459 | 25 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,343 | 4 | 131,276 | 68 |
| refute:pre-merge.mjs | claude-sonnet-5-5 | 6 | 2,235 | 12 | 523,177 | 29 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,969 | 4 | 131,237 | 233 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 1,902 | 8 | 303,796 | 25 |
| machine:node _acceptance/sua-paths-e5-soan-okr/r | claude-haiku-5-5 | 3 | 1,481 | 6 | 232,811 | 79 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,422 | 4 | 131,221 | 9 |
| machine:node _acceptance/sua-paths-e5-soan-okr/r | claude-haiku-5-5 | 2 | 892 | 4 | 131,256 | 77 |
| machine:node _acceptance/sua-paths-e5-soan-okr/r | claude-haiku-5-5 | 2 | 812 | 4 | 131,261 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 804 | 4 | 131,219 | 25 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 777 | 4 | 131,246 | 228 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 747 | 4 | 96,211 | 250 |
| machine:node _acceptance/sua-paths-e5-soan-okr/r | claude-haiku-5-5 | 2 | 681 | 4 | 131,258 | 7 |
| machine:node _acceptance/sua-paths-e5-soan-okr/r | claude-haiku-5-5 | 2 | 677 | 4 | 131,259 | 6 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 666 | 4 | 131,215 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 413 | 4 | 95,475 | 12 |
| machine:node _acceptance/sua-paths-e5-soan-okr/r | claude-haiku-5-5 | 2 | 211 | 4 | 131,260 | 6 |
| machine:node _acceptance/sua-paths-e5-soan-okr/r | claude-haiku-5-5 | 2 | 24 | 4 | 131,261 | 8 |


wall: 926s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,902 | 303,796 | 25 | 10:39:13 | 10:39:38 |
| machine | 14 | 13,506 | 1,903,991 | 821 | 10:39:13 | 10:52:53 |
| review | 3 | 29,699 | 3,590,709 | 151 | 10:39:13 | 10:41:44 |
| triage | 1 | 2,818 | 99,459 | 25 | 10:52:53 | 10:53:18 |
| refute | 1 | 2,235 | 523,177 | 29 | 10:53:18 | 10:53:48 |
| capture | 1 | 413 | 95,475 | 12 | 10:53:48 | 10:54:00 |
| synthesize | 1 | 5,740 | 231,816 | 39 | 10:54:00 | 10:54:39 |

- **claude-opus-5-5**: 3 agent · 31 calls · out 29,699 · in 62 · cache_read 3,590,709 · cache_create 367,456
- **claude-sonnet-5-5**: 5 agent · 17 calls · out 13,108 · in 34 · cache_read 1,253,723 · cache_create 552,078
- **claude-haiku-5-5**: 14 agent · 29 calls · out 13,506 · in 58 · cache_read 1,903,991 · cache_create 974,844

### S4 round 2 — wf_3980056a-2ae (19 agent, 51,369 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 9 | 8,954 | 18 | 998,103 | 106 |
| review:bugs | claude-opus-5-5 | 12 | 8,033 | 24 | 1,335,504 | 101 |
| synthesize:report | claude-sonnet-5-5 | 5 | 7,905 | 10 | 492,218 | 56 |
| review:conventions | claude-opus-5-5 | 9 | 5,777 | 18 | 915,664 | 75 |
| triage | claude-sonnet-5-5 | 2 | 2,428 | 4 | 100,701 | 22 |
| refute:pre-merge.mjs | claude-sonnet-5-5 | 4 | 2,400 | 8 | 352,365 | 30 |
| refute:pre-merge.mjs | claude-sonnet-5-5 | 4 | 2,213 | 8 | 343,477 | 33 |
| refute:evals.yaml | claude-sonnet-5-5 | 5 | 1,954 | 10 | 426,058 | 42 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,792 | 4 | 131,247 | 239 |
| refute:pre-merge.mjs | claude-sonnet-5-5 | 4 | 1,689 | 8 | 342,397 | 32 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,663 | 4 | 131,247 | 10 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,251 | 4 | 131,272 | 222 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,047 | 4 | 131,263 | 219 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 920 | 8 | 305,480 | 17 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 863 | 4 | 131,245 | 25 |
| machine:node _acceptance/sua-paths-e5-soan-okr/r | claude-haiku-5-5 | 2 | 846 | 4 | 131,282 | 73 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 779 | 4 | 131,302 | 65 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 515 | 4 | 131,241 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 340 | 4 | 95,501 | 12 |


wall: 921s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 920 | 305,480 | 17 | 10:57:34 | 10:57:51 |
| machine | 8 | 8,756 | 1,050,099 | 788 | 10:57:34 | 11:10:42 |
| review | 3 | 22,764 | 3,249,271 | 107 | 10:57:34 | 10:59:21 |
| triage | 1 | 2,428 | 100,701 | 22 | 11:10:42 | 11:11:04 |
| refute | 4 | 8,256 | 1,464,297 | 42 | 11:11:04 | 11:11:45 |
| capture | 1 | 340 | 95,501 | 12 | 11:11:46 | 11:11:58 |
| synthesize | 1 | 7,905 | 492,218 | 56 | 11:11:58 | 11:12:54 |

- **claude-opus-5-5**: 3 agent · 30 calls · out 22,764 · in 60 · cache_read 3,249,271 · cache_create 330,393
- **claude-sonnet-5-5**: 8 agent · 30 calls · out 19,849 · in 60 · cache_read 2,458,197 · cache_create 790,846
- **claude-haiku-5-5**: 8 agent · 16 calls · out 8,756 · in 32 · cache_read 1,050,099 · cache_create 540,290

