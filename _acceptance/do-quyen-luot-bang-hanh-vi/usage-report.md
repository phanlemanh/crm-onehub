### S4 round 4 — wf_4aa34fb3-357 (37 agent, 213,245 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| refute:tu-kiem-khung.mjs | claude-sonnet-5 | 8 | 23,340 | 16 | 564,001 | 364 |
| review:bugs | claude-opus-5 | 27 | 19,732 | 54 | 2,738,382 | 448 |
| synthesize:report | claude-sonnet-5 | 2 | 18,336 | 4 | 84,131 | 193 |
| triage | claude-sonnet-5 | 2 | 15,372 | 4 | 67,847 | 178 |
| refute:bo-do-grep.mjs | claude-sonnet-5 | 16 | 15,148 | 32 | 1,191,273 | 253 |
| review:measurement | claude-opus-5 | 32 | 14,091 | 64 | 3,514,781 | 523 |
| refute:config.yaml | claude-sonnet-5 | 20 | 13,982 | 40 | 1,584,376 | 263 |
| review:conventions | claude-opus-5 | 43 | 10,160 | 86 | 4,473,739 | 453 |
| refute:custom-agent-dispatch.ts | claude-sonnet-5 | 9 | 7,869 | 18 | 571,088 | 108 |
| refute:quyen-luot.spec.ts | claude-sonnet-5 | 17 | 7,593 | 34 | 1,319,879 | 132 |
| refute:nguon-ghi.mjs | claude-sonnet-5 | 12 | 7,347 | 24 | 818,406 | 112 |
| refute:tu-kiem-khung.mjs | claude-sonnet-5 | 8 | 7,265 | 16 | 539,989 | 119 |
| baseline:diffBase | claude-sonnet-5 | 19 | 5,760 | 38 | 1,249,595 | 98 |
| judge:E7:operational-feasibility | claude-sonnet-5 | 6 | 5,743 | 12 | 474,570 | 73 |
| refute:custom-agent-dispatch.ts | claude-sonnet-5 | 11 | 5,652 | 22 | 698,304 | 88 |
| refute:ast.mjs | claude-sonnet-5 | 9 | 5,625 | 18 | 577,481 | 88 |
| refute:chung.mjs | claude-sonnet-5 | 10 | 4,783 | 20 | 671,263 | 94 |
| judge:E7:domain-correctness | claude-sonnet-5 | 8 | 3,840 | 16 | 611,706 | 77 |
| judge:E7:spec-alignment | claude-sonnet-5 | 11 | 3,828 | 22 | 715,325 | 63 |
| refute:khai-sinh.mjs | claude-sonnet-5 | 7 | 3,141 | 14 | 442,595 | 74 |
| machine:node _acceptance/do-quyen-luot-bang-hanh | claude-haiku-4-5-20251001 | 3 | 2,848 | 26 | 114,061 | 35 |
| refute:config.yaml | claude-sonnet-5 | 5 | 2,698 | 10 | 301,055 | 41 |
| refute:chung.mjs | claude-sonnet-5 | 4 | 1,969 | 8 | 236,100 | 90 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,319 | 18 | 69,844 | 27 |
| machine:node _acceptance/do-quyen-luot-bang-hanh | claude-haiku-4-5-20251001 | 2 | 1,119 | 18 | 69,876 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 730 | 18 | 69,842 | 10 |
| machine:node _acceptance/do-quyen-luot-bang-hanh | claude-haiku-4-5-20251001 | 2 | 698 | 18 | 69,873 | 17 |
| machine:node _acceptance/do-quyen-luot-bang-hanh | claude-haiku-4-5-20251001 | 2 | 631 | 18 | 69,872 | 35 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 550 | 18 | 69,844 | 13 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 549 | 42 | 206,654 | 52 |
| capture:provenance | claude-sonnet-5 | 2 | 455 | 4 | 59,861 | 13 |
| machine:bash _acceptance/do-quyen-luot-bang-hanh | claude-haiku-4-5-20251001 | 2 | 450 | 18 | 69,877 | 13 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 393 | 18 | 69,848 | 18 |
| machine:node _acceptance/do-quyen-luot-bang-hanh | claude-haiku-4-5-20251001 | 3 | 217 | 26 | 113,718 | 13 |
| machine:cd apps/agent && bun test test/quyen-luo | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 41,336 | 9 |
| machine:node _acceptance/do-quyen-luot-bang-hanh | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,873 | 15 |
| machine:cd apps/agent && bun test test/quyen-luo | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 69,868 | 12 |

- **claude-sonnet-5**: 20 agent · 186 calls · out 159,746 · in 372 · cache_read 12,778,845 · cache_create 1,166,805
- **claude-opus-5**: 3 agent · 102 calls · out 43,983 · in 204 · cache_read 10,726,902 · cache_create 368,386
- **claude-haiku-4-5-20251001**: 14 agent · 33 calls · out 9,516 · in 292 · cache_read 1,174,386 · cache_create 263,269

