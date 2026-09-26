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

