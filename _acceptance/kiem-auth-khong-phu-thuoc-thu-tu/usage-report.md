### S4 round 1 — wf_3760beef-52e (27 agent, 236,200 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 32 | 22,471 | 64 | 3,488,652 | 472 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 31 | 22,177 | 62 | 3,467,858 | 431 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 17 | 20,743 | 34 | 1,743,348 | 314 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 20,282 | 4 | 98,288 | 228 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 10 | 19,927 | 20 | 1,015,501 | 213 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 22 | 19,062 | 44 | 2,452,436 | 242 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 23 | 17,893 | 46 | 2,359,957 | 286 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 14,548 | 4 | 122,811 | 166 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 14,362 | 4 | 122,717 | 171 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 12,534 | 4 | 89,405 | 153 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 11,526 | 4 | 85,801 | 139 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 9 | 10,374 | 18 | 868,788 | 152 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 16 | 8,347 | 32 | 1,733,693 | 127 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 9 | 4,840 | 18 | 777,782 | 96 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 6 | 2,332 | 50 | 352,202 | 74 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 2,159 | 18 | 86,300 | 59 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,513 | 18 | 86,300 | 52 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,419 | 18 | 86,304 | 28 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 3 | 1,403 | 26 | 149,835 | 64 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,397 | 18 | 86,299 | 23 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,370 | 18 | 86,302 | 42 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,268 | 18 | 86,303 | 28 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 1,066 | 4 | 84,960 | 24 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 930 | 18 | 58,488 | 17 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 4 | 829 | 34 | 215,152 | 70 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 800 | 18 | 86,257 | 25 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 628 | 18 | 86,261 | 21 |


wall: 1116s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 27 | 236,200 | 19,978,000 | 1116 | 04:20:08 | 04:38:44 |

- **claude-sonnet-5**: 12 agent · 133 calls · out 172,816 · in 266 · cache_read 13,310,367 · cache_create 1,203,139
- **claude-opus-5-5**: 3 agent · 48 calls · out 47,336 · in 96 · cache_read 5,201,630 · cache_create 342,430
- **claude-haiku-4-5-20251001**: 12 agent · 31 calls · out 16,048 · in 272 · cache_read 1,466,003 · cache_create 491,938

### S4 round 2 — wf_74316daf-0c4 (22 agent, 107,929 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| baseline:diffBase | claude-sonnet-5 | 37 | 21,419 | 74 | 4,178,641 | 559 |
| synthesize:report | claude-sonnet-5 | 5 | 15,567 | 10 | 429,049 | 174 |
| review:bugs | claude-opus-5-5 | 13 | 12,566 | 26 | 1,386,905 | 157 |
| judge:E12:spec-alignment | claude-sonnet-5 | 3 | 11,118 | 6 | 218,468 | 136 |
| review:measurement | claude-opus-5-5 | 9 | 10,062 | 18 | 909,908 | 123 |
| judge:E12:domain-correctness | claude-sonnet-5 | 3 | 8,778 | 6 | 181,578 | 108 |
| judge:E12:operational-feasibility | claude-sonnet-5 | 3 | 8,352 | 6 | 218,423 | 104 |
| review:conventions | claude-opus-5-5 | 6 | 3,379 | 12 | 506,009 | 46 |
| triage | claude-sonnet-5 | 2 | 2,315 | 4 | 86,894 | 37 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,896 | 18 | 86,235 | 37 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,414 | 18 | 86,234 | 41 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,374 | 18 | 86,236 | 27 |
| machine:bun run test -- --force --filter=!agent | claude-haiku-4-5-20251001 | 4 | 1,321 | 34 | 214,957 | 68 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,212 | 34 | 213,166 | 105 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,117 | 18 | 86,232 | 49 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,115 | 18 | 86,232 | 49 |
| machine:bun _acceptance/kiem-auth-khong-phu-thuo | claude-haiku-4-5-20251001 | 2 | 1,075 | 18 | 86,231 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 840 | 18 | 58,420 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 817 | 18 | 86,187 | 14 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 797 | 18 | 86,193 | 23 |
| capture:provenance | claude-sonnet-5 | 2 | 763 | 4 | 84,876 | 21 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 632 | 18 | 86,189 | 22 |


wall: 757s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 21,419 | 4,178,641 | 559 | 04:46:01 | 04:55:20 |
| machine | 12 | 13,610 | 1,262,512 | 186 | 04:46:01 | 04:49:07 |
| judge | 3 | 28,248 | 618,469 | 152 | 04:46:01 | 04:48:34 |
| review | 3 | 26,007 | 2,802,822 | 163 | 04:46:21 | 04:49:04 |
| triage | 1 | 2,315 | 86,894 | 37 | 04:49:10 | 04:49:47 |
| capture | 1 | 763 | 84,876 | 21 | 04:55:22 | 04:55:42 |
| synthesize | 1 | 15,567 | 429,049 | 174 | 04:55:44 | 04:58:39 |

- **claude-sonnet-5**: 7 agent · 55 calls · out 68,312 · in 110 · cache_read 5,397,929 · cache_create 745,634
- **claude-opus-5-5**: 3 agent · 28 calls · out 26,007 · in 56 · cache_read 2,802,822 · cache_create 316,573
- **claude-haiku-4-5-20251001**: 12 agent · 28 calls · out 13,610 · in 248 · cache_read 1,262,512 · cache_create 483,822

### S4 round 3 — wf_5b1a1b5a-747 (23 agent, 129,713 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| refute:chia-mat-khau.integration.spec.ts | claude-sonnet-5 | 15 | 22,459 | 30 | 1,608,951 | 299 |
| synthesize:report | claude-sonnet-5 | 2 | 17,363 | 4 | 96,735 | 192 |
| review:bugs | claude-opus-5-5 | 18 | 16,925 | 36 | 2,034,239 | 211 |
| refute:hd-cua-google.spec.ts | claude-sonnet-5 | 22 | 16,570 | 44 | 2,266,080 | 255 |
| review:measurement | claude-opus-5-5 | 12 | 12,792 | 24 | 1,255,982 | 159 |
| judge:E12:operational-feasibility | claude-sonnet-5 | 3 | 6,880 | 6 | 218,508 | 91 |
| judge:E12:domain-correctness | claude-sonnet-5 | 3 | 6,331 | 6 | 181,540 | 85 |
| judge:E12:spec-alignment | claude-sonnet-5 | 6 | 5,200 | 12 | 523,611 | 82 |
| review:conventions | claude-opus-5-5 | 7 | 4,998 | 14 | 619,277 | 67 |
| triage | claude-sonnet-5 | 2 | 4,002 | 4 | 88,140 | 54 |
| machine:bun run test -- --force --filter=!agent | claude-haiku-4-5-20251001 | 6 | 1,877 | 50 | 345,651 | 77 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,801 | 18 | 86,242 | 44 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,762 | 18 | 86,240 | 57 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,460 | 34 | 214,565 | 64 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,414 | 18 | 86,243 | 31 |
| machine:bun _acceptance/kiem-auth-khong-phu-thuo | claude-haiku-4-5-20251001 | 2 | 1,366 | 18 | 86,239 | 21 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 3 | 1,228 | 28 | 149,748 | 28 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,094 | 18 | 86,244 | 24 |
| machine:bun run test -- "bun _acceptance/kiem-au | claude-haiku-4-5-20251001 | 2 | 1,049 | 18 | 86,240 | 47 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 864 | 18 | 86,197 | 26 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 825 | 18 | 86,195 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 804 | 18 | 58,428 | 15 |
| capture:provenance | claude-sonnet-5 | 2 | 649 | 4 | 84,883 | 16 |


wall: 804s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 12 | 15,544 | 1,458,232 | 143 | 05:01:51 | 05:04:13 |
| judge | 3 | 18,411 | 923,659 | 95 | 05:01:51 | 05:03:25 |
| review | 3 | 34,715 | 3,909,498 | 218 | 05:02:08 | 05:05:46 |
| triage | 1 | 4,002 | 88,140 | 54 | 05:05:48 | 05:06:43 |
| refute | 2 | 39,029 | 3,875,031 | 299 | 05:06:45 | 05:11:44 |
| capture | 1 | 649 | 84,883 | 16 | 05:11:45 | 05:12:01 |
| synthesize | 1 | 17,363 | 96,735 | 192 | 05:12:03 | 05:15:15 |

- **claude-sonnet-5**: 8 agent · 55 calls · out 79,454 · in 110 · cache_read 5,068,448 · cache_create 790,475
- **claude-opus-5-5**: 3 agent · 37 calls · out 34,715 · in 74 · cache_read 3,909,498 · cache_create 310,479
- **claude-haiku-4-5-20251001**: 12 agent · 31 calls · out 15,544 · in 274 · cache_read 1,458,232 · cache_create 487,059

