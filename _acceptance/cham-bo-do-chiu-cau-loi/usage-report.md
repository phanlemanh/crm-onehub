### S4 round 1 — wf_938f8682-343 (23 agent, 78,716 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 20 | 11,435 | 42 | 1,799,071 | 168 |
| synthesize:report | claude-sonnet-5-5 | 4 | 9,274 | 8 | 229,273 | 63 |
| review:measurement | claude-opus-5-5 | 7 | 9,176 | 14 | 484,624 | 101 |
| judge:E7j:domain-correctness | claude-sonnet-5-5 | 2 | 6,069 | 4 | 50,907 | 43 |
| judge:E7j:operational-feasibility | claude-sonnet-5-5 | 3 | 5,738 | 8 | 141,964 | 43 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 5,175 | 4 | 56,081 | 27 |
| judge:E7j:spec-alignment | claude-sonnet-5-5 | 2 | 4,545 | 4 | 54,412 | 35 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,875 | 4 | 53,796 | 34 |
| review:conventions | claude-opus-5-5 | 10 | 3,694 | 22 | 634,833 | 69 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,481 | 4 | 53,853 | 80 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,288 | 4 | 3,034 | 595 |
| triage | claude-sonnet-5-5 | 2 | 2,152 | 4 | 53,529 | 18 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,112 | 4 | 0 | 391 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,781 | 4 | 53,798 | 13 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,667 | 4 | 53,823 | 306 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 1,075 | 4 | 53,841 | 11 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 1,067 | 4 | 53,841 | 11 |
| machine:bun _acceptance/cham-bo-do-chiu-cau-loi/ | claude-haiku-5-5 | 2 | 1,047 | 4 | 53,841 | 16 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 1,018 | 4 | 53,840 | 10 |
| machine:bun _acceptance/cham-bo-do-chiu-cau-loi/ | claude-haiku-5-5 | 2 | 915 | 4 | 53,843 | 10 |
| machine:bun _acceptance/cham-bo-do-chiu-cau-loi/ | claude-haiku-5-5 | 2 | 890 | 4 | 53,840 | 16 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 829 | 4 | 53,792 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 413 | 4 | 49,557 | 10 |


wall: 1537s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,175 | 56,081 | 27 | 04:19:45 | 04:20:12 |
| machine | 13 | 21,045 | 595,142 | 1441 | 04:19:45 | 04:43:46 |
| judge | 3 | 16,352 | 247,283 | 46 | 04:19:45 | 04:20:31 |
| review | 3 | 24,305 | 2,918,528 | 184 | 04:19:45 | 04:22:49 |
| triage | 1 | 2,152 | 53,529 | 18 | 04:43:48 | 04:44:05 |
| capture | 1 | 413 | 49,557 | 10 | 04:44:07 | 04:44:17 |
| synthesize | 1 | 9,274 | 229,273 | 63 | 04:44:19 | 04:45:22 |

- **claude-opus-5-5**: 3 agent · 37 calls · out 24,305 · in 78 · cache_read 2,918,528 · cache_create 325,715
- **claude-sonnet-5-5**: 7 agent · 17 calls · out 33,366 · in 36 · cache_read 635,723 · cache_create 526,788
- **claude-haiku-5-5**: 13 agent · 26 calls · out 21,045 · in 52 · cache_read 595,142 · cache_create 809,644

