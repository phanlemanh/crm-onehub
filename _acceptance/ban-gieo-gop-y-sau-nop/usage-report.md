### ban-gieo-gop-y-sau-nop S4 r1 — wf_82affefd-552 (21 agent, 70,893 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 16 | 15,960 | 32 | 1,884,983 | 184 |
| review:conventions | claude-opus-5-5 | 18 | 12,961 | 36 | 2,095,230 | 157 |
| review:measurement | claude-opus-5-5 | 12 | 12,153 | 24 | 1,324,678 | 135 |
| synthesize:report | claude-sonnet-5-5 | 3 | 5,281 | 6 | 214,545 | 40 |
| baseline:diffBase | claude-sonnet-5-5 | 10 | 4,394 | 20 | 684,165 | 9252 |
| refute:gieo-thu.mjs | claude-sonnet-5-5 | 5 | 3,491 | 10 | 437,431 | 36 |
| triage | claude-sonnet-5-5 | 2 | 2,646 | 4 | 92,539 | 23 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,839 | 4 | 123,906 | 211 |
| refute:ba-ban-do.mjs | claude-sonnet-5-5 | 4 | 1,822 | 8 | 280,416 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,533 | 4 | 123,906 | 9 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 1,202 | 4 | 70,020 | 325 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,189 | 4 | 123,904 | 41 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 910 | 4 | 124,036 | 241 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 856 | 4 | 70,020 | 315 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 841 | 4 | 70,020 | 319 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 830 | 4 | 123,961 | 66 |
| machine:node _acceptance/ban-gieo-gop-y-sau-nop/ | claude-haiku-5-5 | 2 | 829 | 4 | 123,948 | 7 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 736 | 4 | 123,931 | 227 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 561 | 4 | 123,900 | 7 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 536 | 4 | 123,950 | 5 |
| capture:provenance | claude-sonnet-5-5 | 2 | 323 | 4 | 88,160 | 7 |


wall: 9299s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,394 | 684,165 | 9252 | 19:19:01 | 21:53:13 |
| machine | 12 | 11,862 | 1,325,502 | 803 | 19:19:01 | 19:32:24 |
| review | 3 | 41,074 | 5,304,891 | 185 | 19:19:01 | 19:22:06 |
| triage | 1 | 2,646 | 92,539 | 23 | 19:32:25 | 19:32:48 |
| refute | 2 | 5,313 | 717,847 | 39 | 19:32:48 | 19:33:26 |
| capture | 1 | 323 | 88,160 | 7 | 21:53:13 | 21:53:21 |
| synthesize | 1 | 5,281 | 214,545 | 40 | 21:53:21 | 21:54:00 |

- **claude-opus-5-5**: 3 agent · 46 calls · out 41,074 · in 92 · cache_read 5,304,891 · cache_create 339,936
- **claude-sonnet-5-5**: 6 agent · 26 calls · out 17,957 · in 52 · cache_read 1,797,256 · cache_create 785,779
- **claude-haiku-5-5**: 12 agent · 24 calls · out 11,862 · in 48 · cache_read 1,325,502 · cache_create 878,038

### S4 round 2 — wf_2b06ea11-26a (19 agent, 43,897 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 8 | 7,906 | 16 | 781,507 | 95 |
| review:measurement | claude-opus-5-5 | 7 | 7,231 | 14 | 672,209 | 89 |
| synthesize:report | claude-sonnet-5-5 | 5 | 6,078 | 10 | 451,485 | 46 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,730 | 4 | 124,512 | 232 |
| refute:ba-ban-do.mjs | claude-sonnet-5-5 | 6 | 2,393 | 12 | 479,059 | 30 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,353 | 4 | 124,542 | 72 |
| review:conventions | claude-opus-5-5 | 4 | 2,217 | 8 | 295,244 | 30 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 2,000 | 8 | 283,099 | 27 |
| refute:ba-ban-do.mjs | claude-sonnet-5-5 | 3 | 1,844 | 6 | 224,503 | 22 |
| triage | claude-sonnet-5-5 | 2 | 1,560 | 4 | 91,732 | 15 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,435 | 4 | 124,485 | 44 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,196 | 4 | 124,487 | 8 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 971 | 4 | 124,682 | 244 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 862 | 4 | 124,532 | 260 |
| machine:node _acceptance/ban-gieo-gop-y-sau-nop/ | claude-haiku-5-5 | 2 | 767 | 4 | 124,529 | 7 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 726 | 4 | 89,477 | 248 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 630 | 4 | 124,530 | 19 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 501 | 4 | 124,481 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 497 | 4 | 88,741 | 9 |


wall: 957s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,000 | 283,099 | 27 | 00:38:00 | 00:38:27 |
| machine | 10 | 12,171 | 1,210,257 | 856 | 00:38:00 | 00:52:15 |
| review | 3 | 17,354 | 1,748,960 | 98 | 00:38:00 | 00:39:37 |
| triage | 1 | 1,560 | 91,732 | 15 | 00:52:15 | 00:52:30 |
| refute | 2 | 4,237 | 703,562 | 30 | 00:52:30 | 00:53:00 |
| capture | 1 | 497 | 88,741 | 9 | 00:53:00 | 00:53:10 |
| synthesize | 1 | 6,078 | 451,485 | 46 | 00:53:10 | 00:53:56 |

- **claude-opus-5-5**: 3 agent · 19 calls · out 17,354 · in 38 · cache_read 1,748,960 · cache_create 274,674
- **claude-sonnet-5-5**: 6 agent · 22 calls · out 14,372 · in 44 · cache_read 1,618,619 · cache_create 580,969
- **claude-haiku-5-5**: 10 agent · 20 calls · out 12,171 · in 40 · cache_read 1,210,257 · cache_create 638,395

### S4 round 3 — wf_42452b75-52f (16 agent, 45,038 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 10 | 11,640 | 20 | 1,036,942 | 139 |
| review:measurement | claude-opus-5-5 | 8 | 9,222 | 16 | 847,097 | 110 |
| synthesize:report | claude-sonnet-5-5 | 5 | 6,227 | 10 | 468,052 | 47 |
| review:conventions | claude-opus-5-5 | 5 | 4,809 | 10 | 400,983 | 61 |
| triage | claude-sonnet-5-5 | 2 | 2,832 | 4 | 93,124 | 24 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,129 | 4 | 124,535 | 72 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,516 | 4 | 124,478 | 44 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,101 | 4 | 124,480 | 8 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 954 | 4 | 124,562 | 249 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 877 | 4 | 70,020 | 321 |
| machine:node _acceptance/ban-gieo-gop-y-sau-nop/ | claude-haiku-5-5 | 2 | 742 | 4 | 124,522 | 6 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 725 | 4 | 124,505 | 225 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 677 | 4 | 124,525 | 292 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 640 | 4 | 89,470 | 248 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 533 | 4 | 124,474 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 414 | 4 | 88,734 | 10 |


wall: 934s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 10 | 9,894 | 1,155,571 | 854 | 08:39:03 | 08:53:16 |
| review | 3 | 25,671 | 2,285,022 | 142 | 08:39:03 | 08:41:24 |
| triage | 1 | 2,832 | 93,124 | 24 | 08:53:16 | 08:53:41 |
| capture | 1 | 414 | 88,734 | 10 | 08:53:41 | 08:53:50 |
| synthesize | 1 | 6,227 | 468,052 | 47 | 08:53:50 | 08:54:37 |

- **claude-opus-5-5**: 3 agent · 23 calls · out 25,671 · in 46 · cache_read 2,285,022 · cache_create 303,671
- **claude-sonnet-5-5**: 3 agent · 9 calls · out 9,473 · in 18 · cache_read 649,910 · cache_create 317,539
- **claude-haiku-5-5**: 10 agent · 20 calls · out 9,894 · in 40 · cache_read 1,155,571 · cache_create 692,494

