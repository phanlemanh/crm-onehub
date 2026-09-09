### S3 fan-out đợt 1 (6 việc) — wf_4aac5283-952 (6 agent, 47,993 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| exec:T7 | claude-opus-5 | 60 | 21,261 | 120 | 6,767,287 | 640 |
| exec:T5 | claude-opus-5 | 56 | 7,935 | 112 | 4,915,184 | 419 |
| exec:T2 | claude-opus-5 | 46 | 5,229 | 92 | 4,603,369 | 363 |
| exec:T6 | claude-opus-5 | 56 | 5,124 | 112 | 6,270,007 | 676 |
| exec:T3 | claude-opus-5 | 56 | 4,531 | 112 | 4,859,856 | 371 |
| exec:T8 | claude-opus-5 | 23 | 3,913 | 46 | 1,725,135 | 196 |

- **claude-opus-5**: 6 agent · 297 calls · out 47,993 · in 594 · cache_read 29,140,838 · cache_create 626,049

### S3 fan-out đợt 2 (2 việc) — wf_d0a5ebc6-745 (2 agent, 16,160 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| exec:T9 | claude-opus-5 | 51 | 9,557 | 102 | 5,582,954 | 751 |
| exec:T4 | claude-opus-5 | 62 | 6,603 | 124 | 8,781,118 | 594 |

- **claude-opus-5**: 2 agent · 113 calls · out 16,160 · in 226 · cache_read 14,364,072 · cache_create 333,478

### S4 vòng 1 — wf_a77b8e39-2da (33 agent, 69,274 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5 | 21 | 8,899 | 42 | 2,125,467 | 319 |
| review:conventions | claude-opus-5 | 22 | 8,700 | 44 | 1,777,512 | 284 |
| review:bugs | claude-opus-5 | 36 | 8,038 | 72 | 3,495,079 | 376 |
| refute:eve-turns.json | claude-sonnet-5 | 16 | 6,013 | 32 | 1,174,565 | 146 |
| baseline:diffBase | claude-sonnet-5 | 30 | 5,779 | 60 | 2,415,827 | 237 |
| refute:ve-that.json | claude-sonnet-5 | 14 | 4,199 | 28 | 1,024,815 | 229 |
| refute:agent-transcript.ts | claude-sonnet-5 | 12 | 4,061 | 24 | 858,256 | 86 |
| refute:so-lech-chuan.mjs | claude-sonnet-5 | 4 | 3,519 | 8 | 238,605 | 56 |
| refute:eve-to-ai-sdk.ts | claude-sonnet-5 | 28 | 3,277 | 56 | 2,143,247 | 194 |
| refute:so-do-cuon.mjs | claude-sonnet-5 | 9 | 2,963 | 18 | 634,763 | 124 |
| refute:lai-ra-man.spec.tsx | claude-sonnet-5 | 12 | 2,894 | 24 | 832,459 | 84 |
| refute:conversation.tsx | claude-sonnet-5 | 13 | 2,582 | 26 | 811,806 | 75 |
| refute:mo-coi.mjs | claude-sonnet-5 | 6 | 1,675 | 12 | 368,428 | 49 |
| refute:eve-to-ai-sdk.spec.ts | claude-sonnet-5 | 11 | 904 | 22 | 722,847 | 107 |
| capture:provenance | claude-sonnet-5 | 2 | 895 | 4 | 59,816 | 19 |
| refute:so-do-cuon.mjs | claude-sonnet-5 | 8 | 852 | 16 | 497,725 | 70 |
| refute:so-lech-chuan.mjs | claude-sonnet-5 | 7 | 747 | 14 | 436,462 | 62 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 629 | 18 | 69,828 | 26 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 621 | 18 | 41,333 | 25 |
| refute:conversation.tsx | claude-sonnet-5 | 11 | 590 | 22 | 698,759 | 52 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 535 | 26 | 114,306 | 42 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 450 | 18 | 69,805 | 11 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 404 | 18 | 69,827 | 34 |
| triage | claude-sonnet-5 | 2 | 10 | 4 | 68,643 | 177 |
| synthesize:report | claude-sonnet-5 | 2 | 7 | 4 | 82,088 | 164 |
| machine:cd packages/ui && bun test test/eve-to-a | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,825 | 14 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,809 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,805 | 18 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,834 | 25 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,828 | 16 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,825 | 17 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 69,803 | 9 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 69,827 | 11 |

- **claude-opus-5**: 3 agent · 79 calls · out 25,637 · in 158 · cache_read 7,398,058 · cache_create 318,018
- **claude-sonnet-5**: 17 agent · 187 calls · out 40,967 · in 374 · cache_read 13,069,111 · cache_create 937,294
- **claude-haiku-4-5-20251001**: 13 agent · 27 calls · out 2,670 · in 242 · cache_read 923,655 · cache_create 248,924

### S4 vòng 2 — wf_deafb37c-b50 (28 agent, 74,285 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5 | 2 | 14,830 | 4 | 65,641 | 172 |
| synthesize:report | claude-sonnet-5 | 6 | 12,762 | 12 | 468,947 | 177 |
| refute:conversation.tsx | claude-sonnet-5 | 10 | 6,947 | 20 | 625,501 | 136 |
| baseline:diffBase | claude-sonnet-5 | 36 | 5,963 | 72 | 2,940,960 | 9215 |
| review:conventions | claude-opus-5 | 30 | 5,003 | 60 | 3,078,443 | 351 |
| refute:chat-ui.md | claude-sonnet-5 | 11 | 4,946 | 22 | 867,927 | 188 |
| refute:config.yaml | claude-sonnet-5 | 20 | 3,561 | 40 | 1,435,486 | 113 |
| refute:package.json | claude-sonnet-5 | 24 | 3,507 | 48 | 1,866,523 | 143 |
| review:measurement | claude-opus-5 | 38 | 3,273 | 76 | 5,233,392 | 474 |
| refute:evals.yaml | claude-sonnet-5 | 18 | 2,304 | 36 | 1,314,359 | 136 |
| refute:eve-to-ai-sdk.ts | claude-sonnet-5 | 12 | 2,061 | 24 | 745,675 | 60 |
| review:bugs | claude-opus-5 | 37 | 1,563 | 74 | 3,344,537 | 289 |
| refute:gate-shape.json | claude-sonnet-5 | 5 | 1,507 | 10 | 301,149 | 41 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 1,368 | 18 | 69,828 | 32 |
| refute:gate-shape.json | claude-sonnet-5 | 7 | 1,362 | 14 | 445,638 | 62 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 1,345 | 18 | 41,333 | 17 |
| capture:provenance | claude-sonnet-5 | 2 | 1,008 | 4 | 59,816 | 12 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 479 | 18 | 69,827 | 11 |
| machine:cd packages/ui && bun test test/eve-to-a | claude-haiku-4-5-20251001 | 2 | 453 | 18 | 69,825 | 9 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 3 | 8 | 28 | 113,827 | 24 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,828 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,805 | 18 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,827 | 37 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 5 | 26 | 114,211 | 42 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,805 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,803 | 10 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 74,359 | 13 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 69,809 | 14 |

- **claude-sonnet-5**: 12 agent · 153 calls · out 60,758 · in 306 · cache_read 11,137,622 · cache_create 860,264
- **claude-opus-5**: 3 agent · 105 calls · out 9,839 · in 210 · cache_read 11,656,372 · cache_create 362,809
- **claude-haiku-4-5-20251001**: 13 agent · 28 calls · out 3,688 · in 252 · cache_read 972,087 · cache_create 242,307

### S4 vòng 3 — wf_8be9fc83-977 (30 agent, 60,726 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 8 | 8,323 | 16 | 744,232 | 332 |
| baseline:diffBase | claude-sonnet-5 | 27 | 8,215 | 54 | 2,155,222 | 278 |
| review:measurement | claude-opus-5 | 37 | 7,293 | 74 | 5,068,739 | 485 |
| refute:conversation.tsx | claude-sonnet-5 | 13 | 6,271 | 26 | 952,626 | 206 |
| refute:eve-to-ai-sdk.ts | claude-sonnet-5 | 35 | 5,775 | 70 | 2,942,899 | 214 |
| refute:evals.yaml | claude-sonnet-5 | 18 | 4,899 | 36 | 1,252,210 | 106 |
| refute:ve-that.json | claude-sonnet-5 | 14 | 3,773 | 28 | 1,011,365 | 210 |
| refute:conversation.tsx | claude-sonnet-5 | 17 | 3,477 | 34 | 1,225,132 | 98 |
| review:bugs | claude-opus-5 | 43 | 3,465 | 86 | 4,773,697 | 422 |
| refute:conversation.tsx | claude-sonnet-5 | 15 | 2,692 | 30 | 1,048,210 | 118 |
| refute:mau-ban-kinh.mjs | claude-sonnet-5 | 8 | 1,791 | 16 | 502,804 | 68 |
| refute:pham-vi-diff.mjs | claude-sonnet-5 | 10 | 1,529 | 20 | 641,956 | 55 |
| refute:eve-to-ai-sdk.ts | claude-sonnet-5 | 9 | 992 | 18 | 573,973 | 71 |
| refute:config.yaml | claude-sonnet-5 | 13 | 605 | 26 | 863,992 | 136 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 418 | 18 | 69,827 | 30 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 417 | 18 | 69,805 | 14 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 332 | 42 | 205,671 | 78 |
| review:conventions | claude-opus-5 | 24 | 284 | 48 | 2,122,910 | 288 |
| triage | claude-sonnet-5 | 2 | 105 | 4 | 67,437 | 221 |
| refute:agent-transcript.spec.ts | claude-sonnet-5 | 4 | 22 | 8 | 227,916 | 37 |
| capture:provenance | claude-sonnet-5 | 2 | 7 | 4 | 59,816 | 13 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,827 | 13 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,825 | 14 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,834 | 20 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,828 | 31 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,803 | 10 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,805 | 19 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 41,333 | 19 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,828 | 12 |
| machine:cd packages/ui && bun test test/eve-to-a | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 69,825 | 10 |

- **claude-sonnet-5**: 15 agent · 195 calls · out 48,476 · in 390 · cache_read 14,269,790 · cache_create 949,219
- **claude-opus-5**: 3 agent · 104 calls · out 11,042 · in 208 · cache_read 11,965,346 · cache_create 416,414
- **claude-haiku-4-5-20251001**: 12 agent · 27 calls · out 1,208 · in 240 · cache_read 945,211 · cache_create 230,006

### S4 vòng 4 — PASS — wf_04bf1269-fd7 (29 agent, 77,471 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5 | 2 | 14,998 | 4 | 65,436 | 182 |
| refute:eve-to-ai-sdk.ts | claude-sonnet-5 | 26 | 7,952 | 52 | 1,854,727 | 205 |
| refute:agent-transcript.spec.ts | claude-sonnet-5 | 26 | 7,811 | 52 | 1,893,549 | 219 |
| synthesize:report | claude-sonnet-5 | 14 | 7,644 | 28 | 1,346,037 | 284 |
| refute:lai-ra-man.spec.tsx | claude-sonnet-5 | 18 | 6,473 | 36 | 1,309,960 | 184 |
| refute:conversation.tsx | claude-sonnet-5 | 9 | 4,558 | 18 | 629,221 | 100 |
| baseline:diffBase | claude-sonnet-5 | 26 | 3,436 | 52 | 1,921,372 | 198 |
| refute:config.yaml | claude-sonnet-5 | 15 | 3,132 | 30 | 1,116,791 | 165 |
| review:bugs | claude-opus-5 | 29 | 2,884 | 58 | 2,637,801 | 225 |
| refute:ve-that.json | claude-sonnet-5 | 21 | 2,550 | 42 | 1,564,282 | 239 |
| refute:package.json | claude-sonnet-5 | 10 | 2,448 | 20 | 644,189 | 116 |
| review:conventions | claude-opus-5 | 27 | 2,252 | 54 | 2,450,639 | 373 |
| refute:agent-transcript.ts | claude-sonnet-5 | 14 | 1,982 | 28 | 953,963 | 101 |
| refute:so-lech-chuan.mjs | claude-sonnet-5 | 11 | 1,946 | 22 | 700,599 | 65 |
| review:measurement | claude-opus-5 | 37 | 1,814 | 74 | 4,881,043 | 507 |
| refute:eve-to-ai-sdk.spec.ts | claude-sonnet-5 | 10 | 1,289 | 20 | 653,556 | 68 |
| capture:provenance | claude-sonnet-5 | 4 | 1,156 | 8 | 188,054 | 27 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 868 | 18 | 69,828 | 17 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 728 | 18 | 41,333 | 16 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 637 | 18 | 69,834 | 21 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 445 | 42 | 204,949 | 73 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 439 | 18 | 69,828 | 30 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,803 | 10 |
| machine:cd packages/ui && bun test test/eve-to-a | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,825 | 9 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,805 | 19 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,827 | 31 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,827 | 14 |
| machine:node _acceptance/nen-chat-ai-elements/ra | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,825 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 69,805 | 10 |

- **claude-sonnet-5**: 14 agent · 206 calls · out 67,375 · in 412 · cache_read 14,841,736 · cache_create 866,545
- **claude-opus-5**: 3 agent · 93 calls · out 6,950 · in 186 · cache_read 9,969,483 · cache_create 367,334
- **claude-haiku-4-5-20251001**: 12 agent · 27 calls · out 3,146 · in 240 · cache_read 944,489 · cache_create 229,974

