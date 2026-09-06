### S4 round 1 — wf_bb0dfb12-5e6 (29 agent, 31,981 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-fable-5-1 | 10 | 6,208 | 290 | 660,904 | 160 |
| review:bugs | claude-fable-5-1 | 15 | 5,920 | 450 | 1,169,261 | 217 |
| review:measurement | claude-fable-5-1 | 6 | 5,068 | 162 | 353,141 | 143 |
| refute:rang.sh | claude-sonnet-5 | 7 | 4,562 | 14 | 410,766 | 101 |
| baseline:diffBase | claude-sonnet-5 | 29 | 3,973 | 58 | 2,079,463 | 214 |
| refute:tasks.integration.spec.ts | claude-sonnet-5 | 14 | 1,903 | 28 | 943,263 | 170 |
| refute:khoa-lo-giu-tran.rang.ts | claude-sonnet-5 | 11 | 973 | 22 | 736,607 | 95 |
| machine:bun run db:test && bun run test | claude-haiku-4-5-20251001 | 5 | 839 | 42 | 206,730 | 28 |
| refute:rang.sh | claude-sonnet-5 | 7 | 780 | 14 | 445,697 | 66 |
| refute:tasks.integration.spec.ts | claude-sonnet-5 | 9 | 652 | 18 | 634,407 | 161 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 471 | 18 | 69,650 | 17 |
| refute:khoa-lo-giu-tran.rang.ts | claude-sonnet-5 | 7 | 340 | 14 | 431,326 | 41 |
| refute:config.yaml | claude-sonnet-5 | 8 | 178 | 16 | 502,584 | 68 |
| judge:E13:domain-correctness | claude-sonnet-5 | 4 | 20 | 8 | 211,903 | 210 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 3 | 17 | 6 | 169,715 | 68 |
| synthesize:report | claude-sonnet-5 | 2 | 10 | 4 | 72,660 | 186 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 3 | 8 | 26 | 113,251 | 17 |
| judge:E13:spec-alignment | claude-sonnet-5 | 2 | 7 | 4 | 98,251 | 77 |
| triage | claude-sonnet-5 | 2 | 7 | 4 | 63,002 | 58 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 3 | 6 | 26 | 113,297 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 3 | 6 | 28 | 113,396 | 20 |
| capture:provenance | claude-sonnet-5 | 2 | 6 | 4 | 59,799 | 14 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,672 | 10 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,673 | 14 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 41,142 | 15 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,672 | 13 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,646 | 13 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,673 | 12 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 69,672 | 13 |

- **claude-fable-5-1**: 3 agent · 31 calls · out 17,196 · in 902 · cache_read 2,183,306 · cache_create 207,826
- **claude-sonnet-5**: 14 agent · 107 calls · out 13,428 · in 214 · cache_read 6,859,443 · cache_create 808,949
- **claude-haiku-4-5-20251001**: 12 agent · 30 calls · out 1,357 · in 266 · cache_read 1,075,474 · cache_create 222,690

### S4 round 2 — wf_f9801187-475 (27 agent, 34,467 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| refute:tasks.integration.spec.ts | claude-sonnet-5 | 15 | 6,083 | 30 | 1,203,621 | 249 |
| review:conventions | claude-fable-5-1 | 9 | 5,877 | 258 | 616,323 | 164 |
| review:bugs | claude-fable-5-1 | 12 | 5,838 | 354 | 902,520 | 298 |
| review:measurement | claude-fable-5-1 | 5 | 4,780 | 130 | 305,786 | 138 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 2 | 3,711 | 4 | 98,253 | 56 |
| judge:E13:spec-alignment | claude-sonnet-5 | 3 | 3,330 | 6 | 169,736 | 51 |
| refute:khoa-lo-giu-tran.rang.ts | claude-sonnet-5 | 15 | 2,060 | 30 | 1,088,703 | 171 |
| machine:bun run db:test && bun run test | claude-haiku-4-5-20251001 | 5 | 815 | 42 | 206,058 | 28 |
| refute:tasks.integration.spec.ts | claude-sonnet-5 | 11 | 440 | 22 | 707,855 | 64 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 434 | 18 | 69,673 | 11 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 417 | 18 | 69,646 | 17 |
| refute:khoa-lo-giu-tran.rang.ts | claude-sonnet-5 | 9 | 366 | 18 | 573,008 | 142 |
| synthesize:report | claude-sonnet-5 | 2 | 135 | 4 | 71,731 | 222 |
| refute:khoa-lo-giu-tran.rang.ts | claude-sonnet-5 | 14 | 65 | 28 | 1,002,829 | 165 |
| judge:E13:domain-correctness | claude-sonnet-5 | 8 | 28 | 16 | 525,798 | 116 |
| refute:rang.sh | claude-sonnet-5 | 6 | 26 | 12 | 361,956 | 47 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 8 | 18 | 69,644 | 17 |
| capture:provenance | claude-sonnet-5 | 2 | 8 | 4 | 59,799 | 12 |
| triage | claude-sonnet-5 | 2 | 7 | 4 | 62,571 | 49 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 3 | 6 | 26 | 113,358 | 29 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 3 | 6 | 26 | 113,561 | 20 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 41,142 | 12 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,671 | 15 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,673 | 22 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,672 | 12 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,650 | 19 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 69,672 | 38 |

- **claude-sonnet-5**: 12 agent · 89 calls · out 16,259 · in 178 · cache_read 5,925,860 · cache_create 725,082
- **claude-fable-5-1**: 3 agent · 26 calls · out 16,495 · in 742 · cache_read 1,824,629 · cache_create 218,623
- **claude-haiku-4-5-20251001**: 12 agent · 29 calls · out 1,713 · in 256 · cache_read 1,031,420 · cache_create 221,476

### S4 round 3 — wf_e1717c86-626 (18 agent, 37,755 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 7 | 9,792 | 14 | 588,423 | 194 |
| review:conventions | claude-fable-5-1 | 11 | 5,947 | 322 | 734,479 | 231 |
| refute:tasks.integration.spec.ts | claude-sonnet-5 | 8 | 5,712 | 16 | 525,997 | 129 |
| refute:contract.md | claude-sonnet-5 | 9 | 5,310 | 18 | 648,682 | 140 |
| review:bugs | claude-fable-5-1 | 7 | 4,368 | 194 | 455,132 | 216 |
| refute:tasks.integration.spec.ts | claude-sonnet-5 | 11 | 2,652 | 22 | 818,578 | 181 |
| review:measurement | claude-fable-5-1 | 9 | 1,831 | 258 | 664,689 | 289 |
| refute:tasks.integration.spec.ts | claude-sonnet-5 | 12 | 932 | 24 | 808,483 | 144 |
| refute:khoa-lo-giu-tran.rang.ts | claude-sonnet-5 | 17 | 714 | 34 | 1,241,393 | 136 |
| refute:rang.sh | claude-sonnet-5 | 9 | 438 | 18 | 614,752 | 150 |
| refute:tasks.integration.spec.ts | claude-sonnet-5 | 6 | 18 | 12 | 334,947 | 58 |
| machine:bun run db:test && bun run test | claude-haiku-4-5-20251001 | 5 | 12 | 42 | 204,839 | 19 |
| triage | claude-sonnet-5 | 2 | 10 | 4 | 64,923 | 80 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,644 | 10 |
| capture:provenance | claude-sonnet-5 | 2 | 4 | 4 | 59,799 | 16 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,650 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,646 | 12 |
| machine:bash _acceptance/khoa-lo-giu-tran/rang.s | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 41,142 | 21 |

- **claude-sonnet-5**: 10 agent · 83 calls · out 25,582 · in 166 · cache_read 5,705,977 · cache_create 627,072
- **claude-fable-5-1**: 3 agent · 27 calls · out 12,146 · in 774 · cache_read 1,854,300 · cache_create 225,698
- **claude-haiku-4-5-20251001**: 5 agent · 13 calls · out 27 · in 114 · cache_read 454,921 · cache_create 113,712

