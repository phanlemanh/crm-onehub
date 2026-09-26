### S4 round 1 — wf_a41b9dfd-862 (34 agent, 101,567 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 26,131 | 4 | 118,197 | 278 |
| triage | claude-sonnet-5 | 2 | 20,106 | 4 | 98,858 | 251 |
| judge:E12j:spec-alignment | claude-sonnet-5 | 3 | 13,562 | 6 | 261,094 | 156 |
| judge:E12j:operational-feasibility | claude-sonnet-5 | 2 | 12,042 | 4 | 127,614 | 136 |
| review:measurement | claude-opus-5-5 | 16 | 4,916 | 32 | 2,006,953 | 231 |
| baseline:diffBase | claude-sonnet-5 | 31 | 3,316 | 62 | 3,478,013 | 281 |
| refute:zalo-tra-loi.ts | claude-sonnet-5 | 29 | 3,305 | 58 | 3,460,202 | 296 |
| review:conventions | claude-opus-5-5 | 40 | 2,334 | 80 | 5,527,048 | 299 |
| review:bugs | claude-opus-5-5 | 45 | 2,299 | 90 | 7,074,370 | 385 |
| triage | claude-sonnet-5 | 2 | 2,115 | 4 | 129,055 | 31 |
| judge:E12j:domain-correctness | claude-sonnet-5 | 4 | 1,178 | 8 | 370,831 | 124 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 856 | 18 | 90,860 | 18 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 642 | 18 | 90,805 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 590 | 18 | 90,854 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 3 | 575 | 28 | 158,873 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 574 | 18 | 90,842 | 18 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 565 | 18 | 90,857 | 16 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 529 | 18 | 90,888 | 22 |
| machine:bun _acceptance/hoi-crm-qua-zalo/rang/ta | claude-haiku-4-5-20251001 | 2 | 492 | 18 | 90,834 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 486 | 18 | 90,857 | 15 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 443 | 18 | 90,838 | 18 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 441 | 18 | 90,852 | 18 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 437 | 18 | 90,856 | 15 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 433 | 18 | 90,811 | 18 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 421 | 18 | 90,858 | 16 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 413 | 18 | 90,827 | 18 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 406 | 18 | 90,840 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 379 | 18 | 90,833 | 15 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 377 | 18 | 90,841 | 19 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 374 | 18 | 90,814 | 14 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 354 | 42 | 297,521 | 209 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 328 | 18 | 90,805 | 22 |
| capture:provenance | claude-sonnet-5 | 2 | 143 | 4 | 90,755 | 13 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 90,840 | 18 |


wall: 1308s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,316 | 3,478,013 | 281 | 12:08:29 | 12:13:10 |
| machine | 22 | 10,120 | 2,273,206 | 266 | 12:08:29 | 12:12:56 |
| judge | 3 | 26,782 | 759,539 | 170 | 12:08:54 | 12:11:44 |
| review | 3 | 9,549 | 14,608,371 | 387 | 12:09:08 | 12:15:35 |
| triage | 2 | 22,221 | 227,913 | 284 | 12:15:39 | 12:20:23 |
| refute | 1 | 3,305 | 3,460,202 | 296 | 12:20:26 | 12:25:21 |
| capture | 1 | 143 | 90,755 | 13 | 12:25:24 | 12:25:37 |
| synthesize | 1 | 26,131 | 118,197 | 278 | 12:25:39 | 12:30:18 |

- **claude-sonnet-5**: 9 agent · 77 calls · out 81,898 · in 154 · cache_read 8,134,619 · cache_create 1,057,962
- **claude-opus-5-5**: 3 agent · 101 calls · out 9,549 · in 202 · cache_read 14,608,371 · cache_create 466,803
- **claude-haiku-4-5-20251001**: 22 agent · 48 calls · out 10,120 · in 430 · cache_read 2,273,206 · cache_create 980,728

### S4 round 2 — wf_9db8c3cd-ddf (30 agent, 47,306 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| judge:E12j:spec-alignment | claude-sonnet-5 | 2 | 9,113 | 4 | 127,569 | 97 |
| judge:E12j:operational-feasibility | claude-sonnet-5 | 2 | 9,075 | 4 | 127,571 | 95 |
| synthesize:report | claude-sonnet-5 | 11 | 7,837 | 22 | 1,323,329 | 325 |
| judge:E12j:domain-correctness | claude-sonnet-5 | 2 | 7,694 | 4 | 91,430 | 85 |
| review:measurement | claude-opus-5-5 | 7 | 1,013 | 14 | 648,655 | 60 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 3 | 913 | 28 | 164,088 | 27 |
| review:bugs | claude-opus-5-5 | 23 | 909 | 46 | 2,477,501 | 155 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 781 | 18 | 90,813 | 21 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 652 | 18 | 90,813 | 17 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 639 | 18 | 90,813 | 18 |
| machine:bun _acceptance/hoi-crm-qua-zalo/rang/ta | claude-haiku-4-5-20251001 | 2 | 569 | 18 | 90,790 | 14 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 559 | 18 | 90,761 | 23 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 555 | 18 | 90,784 | 18 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 554 | 18 | 90,816 | 17 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 510 | 18 | 90,810 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 458 | 18 | 90,789 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 445 | 18 | 90,813 | 19 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 441 | 18 | 90,800 | 18 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 440 | 18 | 90,815 | 16 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 439 | 18 | 90,812 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 435 | 18 | 90,761 | 12 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 421 | 18 | 90,787 | 15 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 404 | 18 | 90,814 | 17 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 394 | 18 | 90,825 | 21 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 390 | 18 | 90,814 | 14 |
| capture:provenance | claude-sonnet-5 | 2 | 387 | 4 | 90,712 | 24 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 376 | 18 | 90,811 | 13 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 332 | 42 | 272,797 | 381 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 324 | 18 | 90,759 | 11 |
| review:conventions | claude-opus-5-5 | 6 | 247 | 12 | 493,849 | 40 |


wall: 787s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 22 | 11,031 | 2,252,885 | 435 | 12:34:05 | 12:41:20 |
| judge | 3 | 25,882 | 346,570 | 101 | 12:34:28 | 12:36:09 |
| review | 3 | 2,169 | 3,620,005 | 158 | 12:34:36 | 12:37:14 |
| capture | 1 | 387 | 90,712 | 24 | 12:41:22 | 12:41:46 |
| synthesize | 1 | 7,837 | 1,323,329 | 325 | 12:41:48 | 12:47:13 |

- **claude-sonnet-5**: 5 agent · 19 calls · out 34,106 · in 38 · cache_read 1,760,611 · cache_create 600,300
- **claude-opus-5-5**: 3 agent · 36 calls · out 2,169 · in 72 · cache_read 3,620,005 · cache_create 282,090
- **claude-haiku-4-5-20251001**: 22 agent · 48 calls · out 11,031 · in 430 · cache_read 2,252,885 · cache_create 1,008,045

