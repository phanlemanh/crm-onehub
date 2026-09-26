### S4 round 1 — wf_b8651885-08b (34 agent, 102,550 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 33,616 | 4 | 116,163 | 348 |
| baseline:diffBase | claude-sonnet-5 | 32 | 10,941 | 64 | 3,599,931 | 470 |
| triage | claude-sonnet-5 | 2 | 10,428 | 4 | 96,187 | 111 |
| ui:E18 | claude-sonnet-5 | 30 | 7,486 | 60 | 3,850,817 | 191 |
| review:measurement | claude-opus-5-5 | 13 | 6,369 | 26 | 1,567,358 | 219 |
| judge:E20:domain-correctness | claude-sonnet-5 | 2 | 5,877 | 4 | 90,656 | 68 |
| judge:E20:spec-alignment | claude-sonnet-5 | 4 | 5,687 | 8 | 350,132 | 71 |
| judge:E20:operational-feasibility | claude-sonnet-5 | 4 | 5,524 | 8 | 334,324 | 76 |
| ui:E21 | claude-sonnet-5 | 10 | 2,354 | 20 | 961,696 | 68 |
| review:conventions | claude-opus-5-5 | 17 | 2,253 | 34 | 2,071,425 | 145 |
| refute:auth.ts | claude-sonnet-5 | 17 | 1,497 | 34 | 1,768,299 | 153 |
| review:bugs | claude-opus-5-5 | 27 | 1,046 | 54 | 3,385,551 | 224 |
| machine:GOOGLE_CLIENT_ID=ci-only-google-client-i | claude-haiku-4-5-20251001 | 4 | 752 | 34 | 226,279 | 21 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 696 | 18 | 89,743 | 19 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 653 | 18 | 89,750 | 17 |
| machine:for t in "apps/app/app/(landing)/quen-ma | claude-haiku-4-5-20251001 | 2 | 649 | 18 | 89,854 | 15 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 550 | 18 | 89,743 | 15 |
| machine:bun run test | claude-haiku-4-5-20251001 | 6 | 537 | 50 | 339,294 | 134 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 528 | 18 | 89,723 | 14 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 515 | 18 | 89,743 | 15 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 496 | 18 | 89,746 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 493 | 18 | 89,721 | 14 |
| machine:cd packages/auth && bun test test/chay-n | claude-haiku-4-5-20251001 | 2 | 453 | 18 | 89,728 | 13 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 402 | 18 | 89,746 | 18 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 398 | 18 | 89,745 | 14 |
| machine:cd packages/auth && bun test test/quen-m | claude-haiku-4-5-20251001 | 2 | 388 | 18 | 89,736 | 12 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 369 | 18 | 89,754 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 325 | 34 | 227,108 | 26 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 303 | 18 | 89,751 | 12 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 283 | 18 | 89,723 | 20 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 277 | 18 | 89,755 | 12 |
| machine:cd apps/app && bun test ./test/proxy-an- | claude-haiku-4-5-20251001 | 2 | 267 | 18 | 89,731 | 11 |
| capture:provenance | claude-sonnet-5 | 2 | 134 | 4 | 89,855 | 10 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 89,747 | 17 |


wall: 886s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 10,941 | 3,599,931 | 470 | 00:14:13 | 00:22:04 |
| machine | 21 | 9,338 | 2,408,120 | 185 | 00:14:13 | 00:17:18 |
| ui | 2 | 9,840 | 4,812,513 | 191 | 00:14:35 | 00:17:46 |
| judge | 3 | 17,088 | 775,112 | 77 | 00:14:41 | 00:15:57 |
| review | 3 | 9,668 | 7,024,334 | 227 | 00:14:44 | 00:18:31 |
| triage | 1 | 10,428 | 96,187 | 111 | 00:18:32 | 00:20:23 |
| refute | 1 | 1,497 | 1,768,299 | 153 | 00:20:25 | 00:22:58 |
| capture | 1 | 134 | 89,855 | 10 | 00:22:59 | 00:23:09 |
| synthesize | 1 | 33,616 | 116,163 | 348 | 00:23:11 | 00:28:59 |

- **claude-sonnet-5**: 10 agent · 105 calls · out 83,544 · in 210 · cache_read 11,258,060 · cache_create 1,135,666
- **claude-opus-5-5**: 3 agent · 57 calls · out 9,668 · in 114 · cache_read 7,024,334 · cache_create 399,166
- **claude-haiku-4-5-20251001**: 21 agent · 50 calls · out 9,338 · in 442 · cache_read 2,408,120 · cache_create 923,110

### S4 round 2 — wf_7acee3ef-8de (35 agent, 77,222 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 3 | 11,032 | 6 | 251,113 | 398 |
| triage | claude-sonnet-5 | 2 | 10,936 | 4 | 97,260 | 137 |
| baseline:diffBase | claude-sonnet-5 | 42 | 8,330 | 84 | 5,202,594 | 472 |
| judge:E20:spec-alignment | claude-sonnet-5 | 2 | 6,325 | 4 | 126,969 | 75 |
| judge:E20:operational-feasibility | claude-sonnet-5 | 2 | 5,921 | 4 | 126,971 | 74 |
| judge:E20:domain-correctness | claude-sonnet-5 | 2 | 5,788 | 4 | 90,830 | 71 |
| ui:E18 | claude-sonnet-5 | 16 | 3,889 | 32 | 1,828,736 | 166 |
| review:measurement | claude-opus-5-5 | 27 | 3,412 | 54 | 3,775,168 | 325 |
| machine:GOOGLE_CLIENT_ID=ci-only-google-client-i | claude-haiku-4-5-20251001 | 5 | 1,963 | 42 | 299,695 | 36 |
| review:conventions | claude-opus-5-5 | 30 | 1,950 | 60 | 3,665,933 | 282 |
| machine:cd packages/auth && bun test test/chay-n | claude-haiku-4-5-20251001 | 13 | 1,946 | 110 | 900,171 | 74 |
| review:bugs | claude-opus-5-5 | 50 | 1,796 | 100 | 7,301,316 | 440 |
| ui:E21 | claude-sonnet-5 | 10 | 1,785 | 20 | 971,405 | 99 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 1,201 | 34 | 229,032 | 32 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 928 | 18 | 62,688 | 91 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 819 | 18 | 89,885 | 26 |
| machine:cd apps/app && bun test ./test/api-proxy | claude-haiku-4-5-20251001 | 2 | 767 | 18 | 89,867 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 692 | 18 | 89,849 | 14 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 615 | 18 | 89,881 | 16 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 609 | 18 | 89,881 | 22 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 564 | 18 | 89,884 | 21 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 562 | 18 | 89,884 | 18 |
| machine:for t in "apps/app/app/(landing)/quen-ma | claude-haiku-4-5-20251001 | 2 | 546 | 18 | 89,992 | 15 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 543 | 18 | 89,888 | 19 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 540 | 18 | 89,893 | 17 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 470 | 18 | 89,889 | 14 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 450 | 18 | 89,881 | 19 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 449 | 18 | 89,883 | 17 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 403 | 18 | 89,884 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 397 | 18 | 89,892 | 16 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 396 | 18 | 89,847 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 371 | 18 | 89,867 | 25 |
| capture:provenance | claude-sonnet-5 | 2 | 289 | 4 | 90,221 | 23 |
| machine:cd packages/auth && bun test test/quen-m | claude-haiku-4-5-20251001 | 2 | 275 | 18 | 89,874 | 14 |
| machine:cd apps/app && bun test ./test/proxy-an- | claude-haiku-4-5-20251001 | 2 | 263 | 18 | 89,869 | 15 |


wall: 1046s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 8,330 | 5,202,594 | 472 | 00:45:37 | 00:53:30 |
| machine | 23 | 15,769 | 3,199,376 | 148 | 00:45:37 | 00:48:05 |
| ui | 2 | 5,674 | 2,800,141 | 166 | 00:46:12 | 00:48:59 |
| judge | 3 | 18,034 | 344,770 | 80 | 00:46:14 | 00:47:34 |
| review | 3 | 7,158 | 14,742,417 | 442 | 00:46:19 | 00:53:41 |
| triage | 1 | 10,936 | 97,260 | 137 | 00:53:42 | 00:55:59 |
| capture | 1 | 289 | 90,221 | 23 | 00:56:01 | 00:56:24 |
| synthesize | 1 | 11,032 | 251,113 | 398 | 00:56:26 | 01:03:04 |

- **claude-sonnet-5**: 9 agent · 81 calls · out 54,295 · in 162 · cache_read 8,786,099 · cache_create 1,047,803
- **claude-opus-5-5**: 3 agent · 107 calls · out 7,158 · in 214 · cache_read 14,742,417 · cache_create 458,956
- **claude-haiku-4-5-20251001**: 23 agent · 62 calls · out 15,769 · in 546 · cache_read 3,199,376 · cache_create 1,028,156

### S4 round 3 — wf_162b21bb-b42 (33 agent, 69,341 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 7 | 21,953 | 14 | 826,575 | 294 |
| triage | claude-sonnet-5 | 2 | 8,979 | 4 | 95,415 | 112 |
| review:measurement | claude-opus-5-5 | 12 | 7,540 | 24 | 1,393,750 | 187 |
| ui:E18 | claude-sonnet-5 | 22 | 5,645 | 44 | 2,477,002 | 203 |
| baseline:diffBase | claude-sonnet-5 | 38 | 4,149 | 76 | 4,673,855 | 342 |
| ui:E21 | claude-sonnet-5 | 13 | 3,816 | 26 | 1,309,920 | 156 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,848 | 18 | 90,089 | 97 |
| review:conventions | claude-opus-5-5 | 16 | 1,637 | 32 | 1,732,363 | 126 |
| review:bugs | claude-opus-5-5 | 32 | 1,507 | 64 | 4,348,397 | 332 |
| machine:for t in "apps/app/app/(landing)/quen-ma | claude-haiku-4-5-20251001 | 2 | 936 | 18 | 90,240 | 19 |
| machine:GOOGLE_CLIENT_ID=ci-only-google-client-i | claude-haiku-4-5-20251001 | 9 | 764 | 74 | 641,120 | 59 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 748 | 18 | 90,129 | 19 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 739 | 18 | 90,129 | 20 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 706 | 18 | 90,147 | 29 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 609 | 18 | 90,132 | 20 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 599 | 18 | 90,133 | 19 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 589 | 18 | 90,129 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 578 | 34 | 228,188 | 29 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 546 | 18 | 90,140 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 525 | 18 | 90,097 | 15 |
| machine:cd packages/auth && bun test test/chay-n | claude-haiku-4-5-20251001 | 2 | 519 | 18 | 90,114 | 14 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 505 | 18 | 90,132 | 18 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 485 | 18 | 90,136 | 17 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 482 | 18 | 90,132 | 19 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 424 | 18 | 90,131 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 411 | 18 | 90,137 | 12 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 393 | 18 | 90,124 | 13 |
| machine:cd apps/app && bun test ./test/api-proxy | claude-haiku-4-5-20251001 | 2 | 384 | 18 | 90,115 | 11 |
| machine:cd apps/app && bun test ./test/proxy-an- | claude-haiku-4-5-20251001 | 2 | 382 | 18 | 90,117 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 379 | 18 | 90,145 | 13 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 331 | 18 | 90,141 | 14 |
| capture:provenance | claude-sonnet-5 | 2 | 228 | 4 | 90,104 | 14 |
| machine:cd packages/auth && bun test test/quen-m | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 90,122 | 12 |


wall: 797s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,149 | 4,673,855 | 342 | 01:16:24 | 01:22:06 |
| machine | 24 | 13,887 | 2,852,219 | 159 | 01:16:24 | 01:19:03 |
| ui | 2 | 9,461 | 3,786,922 | 203 | 01:16:58 | 01:20:22 |
| review | 3 | 10,684 | 7,474,510 | 334 | 01:17:02 | 01:22:36 |
| triage | 1 | 8,979 | 95,415 | 112 | 01:22:38 | 01:24:30 |
| capture | 1 | 228 | 90,104 | 14 | 01:24:32 | 01:24:46 |
| synthesize | 1 | 21,953 | 826,575 | 294 | 01:24:48 | 01:29:42 |

- **claude-sonnet-5**: 6 agent · 84 calls · out 44,770 · in 168 · cache_read 9,472,871 · cache_create 692,288
- **claude-opus-5-5**: 3 agent · 60 calls · out 10,684 · in 120 · cache_read 7,474,510 · cache_create 389,605
- **claude-haiku-4-5-20251001**: 24 agent · 57 calls · out 13,887 · in 504 · cache_read 2,852,219 · cache_create 1,045,703

### S4 round 3 (thử lại, hướng R) — wf_57f78c9a-8fa (32 agent, 52,474 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 25,855 | 4 | 113,071 | 272 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 20 | 5,036 | 40 | 2,431,547 | 447 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 24 | 4,107 | 48 | 3,118,348 | 518 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 1,591 | 4 | 92,047 | 26 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 4 | 1,502 | 34 | 228,538 | 34 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 7 | 1,055 | 14 | 630,140 | 36 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 4 | 1,003 | 34 | 241,681 | 27 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 8 | 822 | 16 | 850,981 | 57 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 698 | 18 | 90,275 | 21 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 612 | 18 | 90,278 | 22 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 602 | 18 | 90,386 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 585 | 18 | 90,277 | 16 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 576 | 18 | 90,279 | 20 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 571 | 18 | 90,282 | 19 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 3 | 562 | 26 | 131,178 | 99 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 536 | 18 | 90,278 | 23 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 523 | 18 | 90,270 | 16 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 511 | 18 | 90,278 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 491 | 18 | 90,286 | 17 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 483 | 18 | 90,263 | 16 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 466 | 18 | 90,275 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 466 | 18 | 90,287 | 17 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 462 | 18 | 90,243 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 448 | 18 | 90,275 | 15 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 445 | 18 | 90,243 | 23 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 443 | 18 | 90,260 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 413 | 18 | 90,261 | 12 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 382 | 18 | 90,283 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 367 | 18 | 90,241 | 12 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 355 | 4 | 90,306 | 12 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 317 | 18 | 90,268 | 11 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 2 | 189 | 4 | 120,725 | 9 |


wall: 866s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 32 | 52,474 | 9,944,350 | 866 | 02:43:04 | 02:57:29 |

- **claude-sonnet-5**: 5 agent · 50 calls · out 36,944 · in 100 · cache_read 5,845,319 · cache_create 590,144
- **claude-haiku-4-5-20251001**: 24 agent · 53 calls · out 13,464 · in 472 · cache_read 2,497,185 · cache_create 1,089,996
- **claude-opus-5-5**: 3 agent · 17 calls · out 2,066 · in 34 · cache_read 1,601,846 · cache_create 301,317

