### S4 round 1 — wf_80cf0927-a11 (27 agent, 104,350 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 26 | 18,019 | 52 | 2,232,948 | 255 |
| review:measurement | claude-opus-5-5 | 14 | 15,291 | 28 | 1,035,438 | 187 |
| review:bugs | claude-opus-5-5 | 19 | 15,039 | 38 | 1,411,991 | 194 |
| synthesize:report | claude-sonnet-5-5 | 3 | 12,499 | 6 | 135,137 | 75 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 15 | 6,107 | 30 | 643,720 | 1837 |
| refute:them-paths.mjs | claude-sonnet-5-5 | 5 | 4,559 | 10 | 184,400 | 52 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 8 | 4,358 | 16 | 279,652 | 1077 |
| triage | claude-sonnet-5-5 | 2 | 4,276 | 4 | 46,276 | 38 |
| refute:evals.yaml | claude-sonnet-5-5 | 6 | 2,542 | 12 | 238,951 | 29 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,224 | 4 | 42,665 | 270 |
| refute:pmc-truoc-sau.mjs | claude-sonnet-5-5 | 3 | 1,906 | 6 | 90,988 | 20 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,796 | 4 | 42,640 | 11 |
| refute:pmc-truoc-sau.mjs | claude-sonnet-5-5 | 4 | 1,731 | 8 | 139,122 | 21 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,731 | 4 | 42,728 | 12 |
| refute:evals.yaml | claude-sonnet-5-5 | 5 | 1,730 | 10 | 186,912 | 28 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,460 | 4 | 42,771 | 11 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,135 | 4 | 42,695 | 77 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,122 | 4 | 42,727 | 9 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,023 | 4 | 42,760 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,009 | 4 | 42,638 | 42 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 926 | 4 | 42,722 | 10 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 882 | 4 | 5,738 | 355 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 798 | 4 | 39,783 | 292 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 747 | 4 | 42,771 | 21 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 547 | 4 | 42,634 | 8 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 485 | 4 | 46,315 | 44 |
| capture:provenance | claude-sonnet-5-5 | 2 | 408 | 4 | 38,560 | 9 |


wall: 2015s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 485 | 46,315 | 44 | 09:53:09 | 09:53:53 |
| machine | 15 | 25,865 | 1,438,644 | 1839 | 09:53:09 | 10:23:48 |
| review | 3 | 48,349 | 4,680,377 | 255 | 09:53:09 | 09:57:24 |
| triage | 1 | 4,276 | 46,276 | 38 | 10:23:48 | 10:24:26 |
| refute | 5 | 12,468 | 840,373 | 54 | 10:24:26 | 10:25:19 |
| capture | 1 | 408 | 38,560 | 9 | 10:25:19 | 10:25:29 |
| synthesize | 1 | 12,499 | 135,137 | 76 | 10:25:29 | 10:26:44 |

- **claude-opus-5-5**: 3 agent · 59 calls · out 48,349 · in 118 · cache_read 4,680,377 · cache_create 331,509
- **claude-sonnet-5-5**: 9 agent · 32 calls · out 30,136 · in 64 · cache_read 1,106,661 · cache_create 483,444
- **claude-haiku-5-5**: 15 agent · 49 calls · out 25,865 · in 98 · cache_read 1,438,644 · cache_create 761,942

### S4 round 2 — wf_27a12608-9ea (25 agent, 122,302 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 23 | 24,143 | 46 | 1,293,770 | 2076 |
| review:bugs | claude-opus-5-5 | 18 | 17,659 | 36 | 1,377,723 | 227 |
| review:measurement | claude-opus-5-5 | 15 | 13,608 | 30 | 1,159,915 | 156 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 12 | 12,515 | 24 | 565,758 | 1065 |
| synthesize:report | claude-sonnet-5-5 | 5 | 11,496 | 10 | 282,121 | 83 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 6,982 | 4 | 46,244 | 41 |
| review:conventions | claude-opus-5-5 | 7 | 6,894 | 14 | 371,859 | 76 |
| refute:them-paths.mjs | claude-sonnet-5-5 | 7 | 3,687 | 14 | 289,458 | 52 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,530 | 4 | 42,653 | 47 |
| triage | claude-sonnet-5-5 | 2 | 3,321 | 4 | 44,983 | 32 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 2,580 | 4 | 42,731 | 14 |
| refute:them-paths.mjs | claude-sonnet-5-5 | 3 | 1,955 | 6 | 93,199 | 23 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,941 | 4 | 42,655 | 15 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,927 | 4 | 5,738 | 364 |
| refute:them-paths.mjs | claude-sonnet-5-5 | 3 | 1,778 | 6 | 91,383 | 22 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,182 | 4 | 42,763 | 9 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,022 | 4 | 42,700 | 8 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 959 | 4 | 42,730 | 9 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 848 | 4 | 42,774 | 25 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 827 | 4 | 42,710 | 77 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 788 | 4 | 42,725 | 7 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 781 | 4 | 39,786 | 284 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 775 | 4 | 42,680 | 272 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 694 | 4 | 42,649 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 410 | 4 | 38,575 | 13 |


wall: 2259s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 6,982 | 46,244 | 41 | 10:34:09 | 10:34:50 |
| machine | 15 | 54,512 | 2,374,822 | 2078 | 10:34:09 | 11:08:47 |
| review | 3 | 38,161 | 2,909,497 | 228 | 10:34:09 | 10:37:57 |
| triage | 1 | 3,321 | 44,983 | 32 | 11:08:47 | 11:09:19 |
| refute | 3 | 7,420 | 474,040 | 52 | 11:09:19 | 11:10:11 |
| capture | 1 | 410 | 38,575 | 13 | 11:10:11 | 11:10:25 |
| synthesize | 1 | 11,496 | 282,121 | 83 | 11:10:25 | 11:11:48 |

- **claude-haiku-5-5**: 15 agent · 61 calls · out 54,512 · in 122 · cache_read 2,374,822 · cache_create 714,934
- **claude-opus-5-5**: 3 agent · 40 calls · out 38,161 · in 80 · cache_read 2,909,497 · cache_create 292,122
- **claude-sonnet-5-5**: 7 agent · 24 calls · out 29,629 · in 48 · cache_read 885,963 · cache_create 391,576

### S4 round 3 — wf_be959df5-16d (18 agent, 66,753 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 20 | 22,033 | 40 | 1,071,637 | 1911 |
| synthesize:report | claude-sonnet-5-5 | 9 | 8,652 | 18 | 582,945 | 84 |
| review:bugs | claude-opus-5-5 | 10 | 8,589 | 20 | 538,686 | 146 |
| review:measurement | claude-opus-5-5 | 7 | 7,081 | 14 | 342,405 | 83 |
| review:conventions | claude-opus-5-5 | 6 | 4,270 | 12 | 264,707 | 52 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 4,089 | 4 | 43,683 | 27 |
| triage | claude-sonnet-5-5 | 2 | 2,024 | 4 | 42,329 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,776 | 4 | 42,654 | 11 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,209 | 4 | 42,699 | 17 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,096 | 4 | 42,773 | 29 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 911 | 4 | 5,738 | 342 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 820 | 4 | 42,654 | 267 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 802 | 4 | 42,679 | 268 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 774 | 4 | 42,709 | 72 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 761 | 4 | 42,724 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 748 | 4 | 42,652 | 39 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 692 | 4 | 42,648 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 426 | 4 | 38,574 | 9 |


wall: 2023s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,089 | 43,683 | 28 | 11:13:51 | 11:14:19 |
| machine | 11 | 31,622 | 1,461,567 | 1913 | 11:13:51 | 11:45:44 |
| review | 3 | 19,940 | 1,145,798 | 147 | 11:13:51 | 11:16:18 |
| triage | 1 | 2,024 | 42,329 | 17 | 11:45:44 | 11:46:01 |
| capture | 1 | 426 | 38,574 | 9 | 11:46:01 | 11:46:10 |
| synthesize | 1 | 8,652 | 582,945 | 84 | 11:46:10 | 11:47:34 |

- **claude-haiku-5-5**: 11 agent · 40 calls · out 31,622 · in 80 · cache_read 1,461,567 · cache_create 526,172
- **claude-sonnet-5-5**: 4 agent · 15 calls · out 15,191 · in 30 · cache_read 707,531 · cache_create 227,083
- **claude-opus-5-5**: 3 agent · 23 calls · out 19,940 · in 46 · cache_read 1,145,798 · cache_create 210,253

