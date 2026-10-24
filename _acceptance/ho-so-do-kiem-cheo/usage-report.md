### S4 round 1 — wf_d87155fc-087 (23 agent, 87,684 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| judge:E6:domain-correctness | claude-sonnet-5-5 | 5 | 19,737 | 10 | 341,207 | 162 |
| synthesize:report | claude-sonnet-5-5 | 3 | 16,685 | 6 | 153,170 | 103 |
| judge:E6:operational-feasibility | claude-sonnet-5-5 | 4 | 13,811 | 8 | 225,115 | 116 |
| triage | claude-sonnet-5-5 | 2 | 8,818 | 4 | 45,354 | 62 |
| review:measurement | claude-opus-5-5 | 33 | 5,746 | 66 | 4,170,790 | 363 |
| review:conventions | claude-opus-5-5 | 33 | 4,153 | 66 | 4,212,683 | 332 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,196 | 4 | 39,202 | 34 |
| review:bugs | claude-opus-5-5 | 21 | 2,638 | 42 | 2,262,057 | 278 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,911 | 4 | 39,259 | 79 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 1,610 | 4 | 39,245 | 12 |
| judge:E6:spec-alignment | claude-sonnet-5-5 | 4 | 1,603 | 8 | 226,241 | 77 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 1,353 | 4 | 39,249 | 55 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 1,225 | 4 | 40,977 | 39 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,184 | 4 | 39,204 | 10 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 16 | 975 | 32 | 614,984 | 1923 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 602 | 4 | 39,243 | 8 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 527 | 4 | 39,245 | 8 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 484 | 4 | 39,242 | 19 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 435 | 4 | 6,114 | 502 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 307 | 4 | 6,114 | 318 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 302 | 4 | 6,114 | 351 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 39,198 | 9 |
| capture:provenance | claude-sonnet-5-5 | 3 | 167 | 6 | 75,837 | 26 |


wall: 2124s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,225 | 40,977 | 39 | 16:04:20 | 16:04:58 |
| machine | 13 | 13,101 | 986,413 | 1925 | 16:04:20 | 16:36:25 |
| judge | 3 | 35,151 | 792,563 | 162 | 16:04:20 | 16:07:02 |
| review | 3 | 12,537 | 10,645,530 | 377 | 16:04:20 | 16:10:36 |
| triage | 1 | 8,818 | 45,354 | 62 | 16:36:27 | 16:37:29 |
| capture | 1 | 167 | 75,837 | 26 | 16:37:32 | 16:37:57 |
| synthesize | 1 | 16,685 | 153,170 | 103 | 16:38:00 | 16:39:43 |

- **claude-sonnet-5-5**: 7 agent · 23 calls · out 62,046 · in 46 · cache_read 1,107,901 · cache_create 586,898
- **claude-opus-5-5**: 3 agent · 87 calls · out 12,537 · in 174 · cache_read 10,645,530 · cache_create 539,129
- **claude-haiku-5-5**: 13 agent · 40 calls · out 13,101 · in 80 · cache_read 986,413 · cache_create 624,347

### S4 round 2 — wf_90225466-c7f (23 agent, 109,550 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| judge:E6:operational-feasibility | claude-sonnet-5-5 | 8 | 26,491 | 16 | 863,890 | 227 |
| judge:E6:domain-correctness | claude-sonnet-5-5 | 9 | 25,121 | 18 | 938,926 | 226 |
| judge:E6:spec-alignment | claude-sonnet-5-5 | 7 | 21,794 | 14 | 647,266 | 193 |
| synthesize:report | claude-sonnet-5-5 | 4 | 15,257 | 8 | 205,129 | 114 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 72 | 3,875 | 144 | 5,095,374 | 6691 |
| triage | claude-sonnet-5-5 | 2 | 3,583 | 4 | 41,141 | 31 |
| review:measurement | claude-opus-5-5 | 14 | 2,404 | 28 | 881,562 | 136 |
| review:conventions | claude-opus-5-5 | 17 | 2,197 | 34 | 1,091,094 | 146 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,979 | 4 | 39,295 | 83 |
| review:bugs | claude-opus-5-5 | 25 | 1,397 | 50 | 1,963,621 | 200 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 29 | 1,104 | 58 | 1,017,388 | 5555 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 686 | 4 | 39,238 | 30 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 528 | 4 | 39,279 | 10 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 525 | 4 | 39,281 | 10 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 511 | 4 | 41,013 | 35 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 437 | 4 | 6,114 | 475 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 404 | 4 | 39,278 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 319 | 4 | 39,240 | 8 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 313 | 4 | 39,265 | 310 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 251 | 4 | 6,114 | 331 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 217 | 4 | 39,234 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 34,969 | 9 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 11 | 4 | 39,281 | 15 |


wall: 6855s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 511 | 41,013 | 35 | 17:10:16 | 17:10:52 |
| machine | 13 | 10,649 | 6,478,381 | 6693 | 17:10:16 | 19:01:50 |
| judge | 3 | 73,406 | 2,450,082 | 230 | 17:10:16 | 17:14:06 |
| review | 3 | 5,998 | 3,936,277 | 215 | 17:10:16 | 17:13:51 |
| triage | 1 | 3,583 | 41,141 | 31 | 19:01:52 | 19:02:24 |
| capture | 1 | 146 | 34,969 | 9 | 19:02:26 | 19:02:35 |
| synthesize | 1 | 15,257 | 205,129 | 114 | 19:02:37 | 19:04:31 |

- **claude-sonnet-5-5**: 7 agent · 34 calls · out 92,903 · in 68 · cache_read 2,772,334 · cache_create 797,951
- **claude-haiku-5-5**: 13 agent · 123 calls · out 10,649 · in 246 · cache_read 6,478,381 · cache_create 1,096,724
- **claude-opus-5-5**: 3 agent · 56 calls · out 5,998 · in 112 · cache_read 3,936,277 · cache_create 280,271

### S4 round 2 (thử lại) — wf_bfe86520-cd1 (20 agent, 190,917 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 65 | 69,958 | 130 | 4,389,648 | 6592 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 61 | 67,383 | 122 | 4,338,439 | 6155 |
| review:bugs | claude-opus-5-5 | 18 | 12,855 | 36 | 975,654 | 139 |
| synthesize:report | claude-sonnet-5-5 | 3 | 11,683 | 6 | 110,347 | 81 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 4,504 | 4 | 30,439 | 33 |
| refute:decisions.jsonl | claude-sonnet-5-5 | 8 | 4,486 | 16 | 246,433 | 44 |
| review:conventions | claude-opus-5-5 | 8 | 3,766 | 16 | 365,820 | 51 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,461 | 4 | 29,221 | 34 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 2,105 | 4 | 29,264 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,938 | 4 | 29,223 | 12 |
| triage | claude-sonnet-5-5 | 2 | 1,408 | 4 | 28,319 | 12 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 1,078 | 4 | 29,264 | 8 |
| review:measurement | claude-opus-5-5 | 3 | 978 | 6 | 71,082 | 13 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 946 | 4 | 6,114 | 510 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 883 | 4 | 6,114 | 329 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 843 | 4 | 29,278 | 75 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 836 | 4 | 29,261 | 15 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 661 | 4 | 29,217 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 646 | 4 | 3,057 | 365 |
| capture:provenance | claude-sonnet-5-5 | 2 | 499 | 4 | 24,952 | 6 |


wall: 6746s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,504 | 30,439 | 33 | 06:49:48 | 06:50:21 |
| machine | 12 | 150,738 | 8,948,100 | 6594 | 06:49:48 | 08:39:42 |
| review | 3 | 17,599 | 1,412,556 | 141 | 06:49:48 | 06:52:09 |
| triage | 1 | 1,408 | 28,319 | 12 | 08:39:45 | 08:39:57 |
| refute | 1 | 4,486 | 246,433 | 45 | 08:39:59 | 08:40:43 |
| capture | 1 | 499 | 24,952 | 6 | 08:40:45 | 08:40:51 |
| synthesize | 1 | 11,683 | 110,347 | 81 | 08:40:53 | 08:42:14 |

- **claude-haiku-5-5**: 12 agent · 146 calls · out 150,738 · in 292 · cache_read 8,948,100 · cache_create 569,111
- **claude-opus-5-5**: 3 agent · 29 calls · out 17,599 · in 58 · cache_read 1,412,556 · cache_create 202,490
- **claude-sonnet-5-5**: 5 agent · 17 calls · out 22,580 · in 34 · cache_read 440,490 · cache_create 210,239

### S4 round 3 — wf_22a28bdf-599 (18 agent, 56,012 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 7 | 11,747 | 14 | 373,248 | 85 |
| review:bugs | claude-opus-5-5 | 19 | 10,008 | 38 | 1,177,975 | 139 |
| review:measurement | claude-opus-5-5 | 12 | 8,454 | 24 | 609,169 | 117 |
| review:conventions | claude-opus-5-5 | 13 | 7,158 | 26 | 698,688 | 123 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 3,899 | 4 | 29,950 | 26 |
| triage | claude-sonnet-5-5 | 2 | 3,159 | 4 | 30,146 | 23 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 2,146 | 4 | 29,338 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,501 | 4 | 29,297 | 9 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,021 | 4 | 6,114 | 476 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 1,005 | 4 | 29,338 | 7 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 949 | 4 | 29,352 | 72 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 871 | 4 | 29,336 | 21 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 832 | 4 | 29,291 | 8 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 771 | 4 | 3,057 | 320 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 716 | 4 | 3,057 | 324 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 711 | 4 | 29,295 | 25 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 662 | 4 | 29,335 | 15 |
| capture:provenance | claude-sonnet-5-5 | 2 | 402 | 4 | 25,026 | 6 |


wall: 1367s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,899 | 29,950 | 26 | 10:31:44 | 10:32:10 |
| machine | 11 | 11,185 | 246,810 | 1247 | 10:31:44 | 10:52:31 |
| review | 3 | 25,620 | 2,485,832 | 140 | 10:31:44 | 10:34:05 |
| triage | 1 | 3,159 | 30,146 | 23 | 10:52:34 | 10:52:57 |
| capture | 1 | 402 | 25,026 | 6 | 10:52:59 | 10:53:04 |
| synthesize | 1 | 11,747 | 373,248 | 85 | 10:53:06 | 10:54:32 |

- **claude-sonnet-5-5**: 4 agent · 13 calls · out 19,207 · in 26 · cache_read 458,370 · cache_create 218,190
- **claude-opus-5-5**: 3 agent · 44 calls · out 25,620 · in 88 · cache_read 2,485,832 · cache_create 245,183
- **claude-haiku-5-5**: 11 agent · 22 calls · out 11,185 · in 44 · cache_read 246,810 · cache_create 377,826

