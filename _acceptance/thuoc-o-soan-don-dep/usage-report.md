### S4 round 1 — wf_ba0b48c7-092 (20 agent, 162,192 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| baseline:diffBase | claude-sonnet-5 | 41 | 28,403 | 82 | 4,596,309 | 464 |
| review:bugs | claude-opus-5-5 | 23 | 27,966 | 46 | 2,976,350 | 324 |
| synthesize:report | claude-sonnet-5 | 2 | 25,629 | 4 | 99,720 | 280 |
| ui:E7 | claude-sonnet-5 | 61 | 25,017 | 122 | 8,388,725 | 501 |
| review:measurement | claude-opus-5-5 | 7 | 21,820 | 14 | 708,969 | 221 |
| review:conventions | claude-opus-5-5 | 16 | 10,858 | 32 | 1,784,606 | 150 |
| triage | claude-sonnet-5 | 2 | 5,569 | 4 | 88,643 | 75 |
| machine:bun _acceptance/thuoc-o-soan-don-dep/ran | claude-haiku-4-5-20251001 | 2 | 3,638 | 18 | 86,547 | 41 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,745 | 18 | 86,590 | 37 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,658 | 18 | 86,580 | 90 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,541 | 18 | 86,576 | 124 |
| machine:bun _acceptance/thuoc-o-soan-don-dep/ran | claude-haiku-4-5-20251001 | 2 | 1,410 | 18 | 86,548 | 19 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,215 | 18 | 86,530 | 17 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,196 | 18 | 86,576 | 19 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,180 | 34 | 186,554 | 111 |
| capture:provenance | claude-sonnet-5 | 2 | 875 | 4 | 85,261 | 18 |
| machine:bun _acceptance/thuoc-o-soan-don-dep/ran | claude-haiku-4-5-20251001 | 3 | 863 | 26 | 149,438 | 23 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 790 | 18 | 86,528 | 13 |
| machine:bun _acceptance/thuoc-o-soan-don-dep/ran | claude-haiku-4-5-20251001 | 2 | 506 | 18 | 86,545 | 14 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 313 | 18 | 86,530 | 30 |


wall: 873s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 28,403 | 4,596,309 | 464 | 08:55:14 | 09:02:57 |
| machine | 12 | 16,055 | 1,201,542 | 171 | 08:55:14 | 08:58:05 |
| ui | 1 | 25,017 | 8,388,725 | 501 | 08:55:14 | 09:03:34 |
| review | 3 | 60,644 | 5,469,925 | 340 | 08:55:14 | 09:00:53 |
| triage | 1 | 5,569 | 88,643 | 75 | 09:03:34 | 09:04:49 |
| capture | 1 | 875 | 85,261 | 18 | 09:04:49 | 09:05:07 |
| synthesize | 1 | 25,629 | 99,720 | 280 | 09:05:07 | 09:09:46 |

- **claude-sonnet-5**: 5 agent · 108 calls · out 85,493 · in 216 · cache_read 13,258,658 · cache_create 631,741
- **claude-opus-5-5**: 3 agent · 46 calls · out 60,644 · in 92 · cache_read 5,469,925 · cache_create 368,704
- **claude-haiku-4-5-20251001**: 12 agent · 27 calls · out 16,055 · in 240 · cache_read 1,201,542 · cache_create 466,831

### S4 round 2 — wf_15223255-890 (18 agent, 55,304 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 3 | 19,569 | 6 | 208,951 | 215 |
| ui:E7 | claude-sonnet-5 | 23 | 11,697 | 46 | 2,522,878 | 213 |
| review:measurement | claude-opus-5-5 | 8 | 5,278 | 16 | 865,777 | 71 |
| review:bugs | claude-opus-5-5 | 7 | 3,595 | 14 | 681,515 | 50 |
| review:conventions | claude-opus-5-5 | 7 | 3,108 | 14 | 637,409 | 49 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,549 | 18 | 86,583 | 125 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 1,233 | 42 | 250,244 | 68 |
| capture:provenance | claude-sonnet-5 | 3 | 1,201 | 6 | 197,017 | 23 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,042 | 18 | 86,597 | 61 |
| machine:bun _acceptance/thuoc-o-soan-don-dep/ran | claude-haiku-4-5-20251001 | 2 | 1,000 | 18 | 86,555 | 14 |
| machine:bun _acceptance/thuoc-o-soan-don-dep/ran | claude-haiku-4-5-20251001 | 2 | 897 | 18 | 86,553 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 845 | 18 | 86,584 | 25 |
| machine:bun _acceptance/thuoc-o-soan-don-dep/ran | claude-haiku-4-5-20251001 | 2 | 843 | 18 | 86,552 | 12 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 810 | 18 | 86,587 | 118 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 802 | 18 | 86,521 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 779 | 18 | 86,519 | 12 |
| machine:bun _acceptance/thuoc-o-soan-don-dep/ran | claude-haiku-4-5-20251001 | 2 | 546 | 18 | 86,554 | 14 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 510 | 18 | 86,583 | 51 |


wall: 451s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 12 | 10,856 | 1,202,432 | 127 | 09:13:12 | 09:15:19 |
| ui | 1 | 11,697 | 2,522,878 | 213 | 09:13:12 | 09:16:45 |
| review | 3 | 11,981 | 2,184,701 | 85 | 09:13:12 | 09:14:37 |
| capture | 1 | 1,201 | 197,017 | 23 | 09:16:45 | 09:17:08 |
| synthesize | 1 | 19,569 | 208,951 | 215 | 09:17:08 | 09:20:43 |

- **claude-sonnet-5**: 3 agent · 29 calls · out 32,467 · in 58 · cache_read 2,928,846 · cache_create 364,350
- **claude-opus-5-5**: 3 agent · 22 calls · out 11,981 · in 44 · cache_read 2,184,701 · cache_create 313,376
- **claude-haiku-4-5-20251001**: 12 agent · 27 calls · out 10,856 · in 240 · cache_read 1,202,432 · cache_create 466,110

