### S4 round 1 — wf_88c6adb0-5b3 (28 agent, 135,508 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 24 | 25,387 | 48 | 2,510,190 | 297 |
| review:conventions | claude-opus-5-5 | 30 | 19,264 | 60 | 2,619,837 | 235 |
| synthesize:report | claude-sonnet-5-5 | 3 | 16,203 | 6 | 144,074 | 95 |
| review:measurement | claude-opus-5-5 | 10 | 11,956 | 20 | 717,352 | 132 |
| judge:E5:domain-correctness | claude-sonnet-5-5 | 4 | 9,658 | 8 | 254,600 | 82 |
| judge:E5:spec-alignment | claude-sonnet-5-5 | 4 | 8,419 | 8 | 257,992 | 74 |
| triage | claude-sonnet-5-5 | 2 | 7,301 | 4 | 47,742 | 49 |
| judge:E5:operational-feasibility | claude-sonnet-5-5 | 3 | 6,812 | 6 | 136,081 | 63 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 5,140 | 4 | 42,671 | 32 |
| refute:chieu-do.mjs | claude-sonnet-5-5 | 5 | 2,614 | 10 | 185,526 | 32 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,189 | 4 | 40,743 | 12 |
| refute:chieu-do.mjs | claude-sonnet-5-5 | 5 | 2,176 | 10 | 183,736 | 26 |
| refute:contract.md | claude-sonnet-5-5 | 4 | 2,093 | 8 | 150,408 | 22 |
| refute:chieu-do.mjs | claude-sonnet-5-5 | 4 | 1,891 | 8 | 139,571 | 23 |
| refute:chieu-do.mjs | claude-sonnet-5-5 | 4 | 1,573 | 8 | 136,789 | 20 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/ghi | claude-haiku-5-5 | 2 | 1,484 | 4 | 40,781 | 10 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/chi | claude-haiku-5-5 | 2 | 1,405 | 4 | 40,778 | 21 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/pat | claude-haiku-5-5 | 2 | 1,310 | 4 | 40,777 | 9 |
| machine:node _acceptance/do-man-tren-kho-rieng/r | claude-haiku-5-5 | 2 | 1,300 | 4 | 40,781 | 10 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/dan | claude-haiku-5-5 | 2 | 1,086 | 4 | 40,778 | 16 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/kha | claude-haiku-5-5 | 2 | 1,032 | 4 | 40,777 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,004 | 4 | 40,759 | 283 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 937 | 4 | 40,798 | 79 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 813 | 4 | 40,741 | 80 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 751 | 4 | 40,768 | 229 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 700 | 4 | 40,737 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 578 | 4 | 37,874 | 235 |
| capture:provenance | claude-sonnet-5-5 | 2 | 432 | 4 | 36,665 | 9 |


wall: 1114s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,140 | 42,671 | 32 | 03:04:33 | 03:05:05 |
| machine | 13 | 14,589 | 527,092 | 927 | 03:04:33 | 03:20:00 |
| judge | 3 | 24,889 | 648,673 | 82 | 03:04:33 | 03:05:55 |
| review | 3 | 56,607 | 5,847,379 | 308 | 03:04:33 | 03:09:41 |
| triage | 1 | 7,301 | 47,742 | 49 | 03:20:00 | 03:20:49 |
| refute | 5 | 10,347 | 796,030 | 33 | 03:20:49 | 03:21:23 |
| capture | 1 | 432 | 36,665 | 9 | 03:21:23 | 03:21:31 |
| synthesize | 1 | 16,203 | 144,074 | 95 | 03:21:31 | 03:23:06 |

- **claude-opus-5-5**: 3 agent · 64 calls · out 56,607 · in 128 · cache_read 5,847,379 · cache_create 380,232
- **claude-sonnet-5-5**: 12 agent · 42 calls · out 64,312 · in 84 · cache_read 1,715,855 · cache_create 871,860
- **claude-haiku-5-5**: 13 agent · 26 calls · out 14,589 · in 52 · cache_read 527,092 · cache_create 537,344

### S4 round 2 — wf_e4f047c0-c77 (26 agent, 107,685 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 20 | 13,699 | 40 | 1,674,655 | 170 |
| synthesize:report | claude-sonnet-5-5 | 4 | 13,418 | 8 | 205,129 | 81 |
| judge:E5:spec-alignment | claude-sonnet-5-5 | 5 | 11,470 | 10 | 393,412 | 97 |
| review:bugs | claude-opus-5-5 | 23 | 11,315 | 46 | 2,061,218 | 169 |
| review:measurement | claude-opus-5-5 | 15 | 10,179 | 30 | 1,170,556 | 134 |
| judge:E5:operational-feasibility | claude-sonnet-5-5 | 4 | 10,110 | 8 | 266,451 | 86 |
| judge:E5:domain-correctness | claude-sonnet-5-5 | 3 | 7,516 | 6 | 132,388 | 65 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 4,453 | 4 | 42,184 | 28 |
| triage | claude-sonnet-5-5 | 2 | 3,746 | 4 | 43,648 | 28 |
| refute:chieu-do.mjs | claude-sonnet-5-5 | 5 | 2,654 | 10 | 176,814 | 34 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,230 | 4 | 40,816 | 12 |
| refute:bang-truoc-sau.md | claude-sonnet-5-5 | 3 | 2,216 | 6 | 84,922 | 27 |
| refute:evals.yaml | claude-sonnet-5-5 | 4 | 1,812 | 8 | 132,172 | 25 |
| refute:bang-truoc-sau.md | claude-sonnet-5-5 | 4 | 1,739 | 8 | 130,118 | 25 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/chi | claude-haiku-5-5 | 2 | 1,362 | 4 | 40,851 | 21 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/pat | claude-haiku-5-5 | 2 | 1,246 | 4 | 40,850 | 9 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/dan | claude-haiku-5-5 | 2 | 1,156 | 4 | 40,851 | 16 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/kha | claude-haiku-5-5 | 2 | 1,033 | 4 | 40,850 | 11 |
| machine:bun _acceptance/ba-ho-so-do-san/rang/ghi | claude-haiku-5-5 | 2 | 1,007 | 4 | 40,854 | 11 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 940 | 4 | 37,947 | 266 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 939 | 4 | 40,871 | 78 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 898 | 4 | 40,832 | 275 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 894 | 4 | 40,841 | 231 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 612 | 4 | 40,814 | 78 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 605 | 4 | 40,810 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 436 | 4 | 36,738 | 10 |


wall: 1106s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,453 | 42,184 | 28 | 05:47:24 | 05:47:52 |
| machine | 12 | 12,922 | 487,187 | 950 | 05:47:24 | 06:03:14 |
| judge | 3 | 29,096 | 792,251 | 99 | 05:47:24 | 05:49:03 |
| review | 3 | 35,193 | 4,906,429 | 171 | 05:47:24 | 05:50:15 |
| triage | 1 | 3,746 | 43,648 | 28 | 06:03:14 | 06:03:42 |
| refute | 4 | 8,421 | 524,026 | 37 | 06:03:42 | 06:04:19 |
| capture | 1 | 436 | 36,738 | 10 | 06:04:19 | 06:04:29 |
| synthesize | 1 | 13,418 | 205,129 | 81 | 06:04:29 | 06:05:50 |

- **claude-opus-5-5**: 3 agent · 58 calls · out 35,193 · in 116 · cache_read 4,906,429 · cache_create 348,495
- **claude-sonnet-5-5**: 11 agent · 38 calls · out 59,570 · in 76 · cache_read 1,643,976 · cache_create 803,954
- **claude-haiku-5-5**: 12 agent · 24 calls · out 12,922 · in 48 · cache_read 487,187 · cache_create 494,700

