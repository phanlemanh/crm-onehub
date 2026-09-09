### S4 round 1 — wf_000038f2-511 (29 agent, 61,551 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 12,139 | 4 | 111,673 | 130 |
| refute:crm.ts | claude-sonnet-5 | 20 | 10,714 | 40 | 1,461,887 | 263 |
| refute:builder-delegation.ts | claude-sonnet-5 | 21 | 7,616 | 42 | 1,644,615 | 186 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 17 | 4,989 | 34 | 1,332,367 | 270 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 12 | 4,386 | 24 | 927,297 | 103 |
| review:conventions | claude-opus-5 | 31 | 4,362 | 62 | 2,557,048 | 342 |
| review:bugs | claude-opus-5 | 35 | 3,844 | 70 | 3,205,485 | 365 |
| review:measurement | claude-opus-5 | 14 | 2,971 | 28 | 1,014,390 | 263 |
| baseline:diffBase | claude-sonnet-5 | 15 | 2,930 | 30 | 970,549 | 80 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 10 | 2,444 | 20 | 650,158 | 64 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 8 | 1,811 | 16 | 530,945 | 99 |
| refute:builder-delegation.ts | claude-sonnet-5 | 14 | 960 | 28 | 965,755 | 121 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 548 | 18 | 69,817 | 20 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 528 | 42 | 206,841 | 75 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 7 | 507 | 14 | 484,609 | 190 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 487 | 18 | 69,844 | 12 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 264 | 18 | 69,811 | 7 |
| capture:provenance | claude-sonnet-5 | 3 | 8 | 6 | 122,791 | 20 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,843 | 12 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,813 | 26 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,846 | 13 |
| triage | claude-sonnet-5 | 2 | 4 | 4 | 65,588 | 114 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 41,319 | 13 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,841 | 8 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,842 | 10 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,842 | 11 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,842 | 11 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 69,813 | 11 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 69,842 | 10 |

- **claude-sonnet-5**: 12 agent · 131 calls · out 48,508 · in 262 · cache_read 9,268,234 · cache_create 671,142
- **claude-opus-5**: 3 agent · 80 calls · out 11,177 · in 160 · cache_read 6,776,923 · cache_create 228,190
- **claude-haiku-4-5-20251001**: 14 agent · 31 calls · out 1,866 · in 276 · cache_read 1,086,156 · cache_create 259,017

### S4 round 2 — wf_53fe985f-bac (28 agent, 75,542 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 15,693 | 4 | 115,241 | 168 |
| refute:builder-delegation.ts | claude-sonnet-5 | 22 | 9,479 | 44 | 1,651,946 | 322 |
| review:bugs | claude-opus-5 | 39 | 8,675 | 78 | 3,403,243 | 358 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 16 | 5,519 | 32 | 1,241,670 | 183 |
| refute:builder-delegation.ts | claude-sonnet-5 | 19 | 5,320 | 38 | 1,354,732 | 127 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 22 | 5,252 | 44 | 1,685,855 | 190 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 21 | 5,169 | 42 | 1,636,210 | 161 |
| review:measurement | claude-opus-5 | 20 | 4,894 | 40 | 1,589,458 | 281 |
| review:conventions | claude-opus-5 | 39 | 3,731 | 78 | 3,442,774 | 354 |
| refute:builder-delegation.ts | claude-sonnet-5 | 19 | 3,501 | 38 | 1,380,769 | 230 |
| refute:tran-uy-thac.spec.ts | claude-sonnet-5 | 10 | 2,643 | 20 | 673,387 | 118 |
| refute:builder-delegation.ts | claude-sonnet-5 | 17 | 2,534 | 34 | 1,193,161 | 100 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 487 | 18 | 69,843 | 10 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 480 | 18 | 69,813 | 19 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 474 | 18 | 69,842 | 10 |
| capture:provenance | claude-sonnet-5 | 2 | 443 | 4 | 96,191 | 9 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 390 | 18 | 69,813 | 10 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 354 | 18 | 69,844 | 8 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 323 | 18 | 69,065 | 11 |
| triage | claude-sonnet-5 | 2 | 143 | 4 | 105,137 | 134 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 9 | 34 | 161,582 | 44 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 69,846 | 10 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,811 | 10 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,817 | 18 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 69,842 | 10 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,841 | 12 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 69,842 | 10 |
| machine:cd apps/agent && bun test test/tran-uy-t | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 69,842 | 10 |

- **claude-sonnet-5**: 11 agent · 152 calls · out 55,696 · in 304 · cache_read 11,134,299 · cache_create 565,340
- **claude-opus-5**: 3 agent · 98 calls · out 17,300 · in 196 · cache_read 8,435,475 · cache_create 230,277
- **claude-haiku-4-5-20251001**: 14 agent · 30 calls · out 2,546 · in 268 · cache_read 1,068,643 · cache_create 232,206

