### S4 round 1 — wf_8b5a505e-f27 (33 agent, 61,400 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 17,874 | 10 | 310,979 | 130 |
| review:measurement | claude-opus-5-5 | 26 | 7,579 | 52 | 2,715,564 | 443 |
| triage | claude-sonnet-5-5 | 2 | 6,412 | 4 | 39,956 | 39 |
| review:conventions | claude-opus-5-5 | 31 | 3,232 | 62 | 2,379,038 | 225 |
| judge:E17:domain-correctness | claude-sonnet-5-5 | 3 | 3,226 | 6 | 73,108 | 24 |
| ui:E15 | claude-sonnet-5-5 | 5 | 2,939 | 10 | 368,926 | 110 |
| judge:E17:operational-feasibility | claude-sonnet-5-5 | 3 | 2,675 | 6 | 76,474 | 20 |
| review:bugs | claude-opus-5-5 | 27 | 2,645 | 54 | 2,153,620 | 204 |
| judge:E17:spec-alignment | claude-sonnet-5-5 | 2 | 2,527 | 4 | 34,107 | 19 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/ho- | claude-haiku-5-5 | 2 | 1,620 | 4 | 33,383 | 209 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,418 | 4 | 2,869 | 325 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 1,405 | 4 | 33,420 | 68 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,174 | 4 | 33,343 | 10 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 723 | 4 | 40,451 | 62 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 477 | 4 | 33,389 | 27 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 462 | 4 | 33,359 | 289 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 455 | 4 | 33,341 | 27 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 405 | 4 | 33,396 | 31 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/lie | claude-haiku-5-5 | 2 | 390 | 4 | 33,381 | 18 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 360 | 4 | 33,391 | 32 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 341 | 4 | 33,389 | 43 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/pro | claude-haiku-5-5 | 2 | 314 | 4 | 33,381 | 8 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 313 | 4 | 33,392 | 25 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 311 | 4 | 33,391 | 25 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 310 | 4 | 33,368 | 287 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 305 | 4 | 33,389 | 29 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 304 | 4 | 33,392 | 28 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 299 | 4 | 33,389 | 27 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 298 | 4 | 33,398 | 62 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 279 | 4 | 33,388 | 24 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 170 | 4 | 33,337 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 29,265 | 6 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 9 | 4 | 33,392 | 38 |


wall: 1208s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 723 | 40,451 | 62 | 06:59:08 | 07:00:10 |
| machine | 22 | 11,419 | 703,878 | 1023 | 06:59:08 | 07:16:11 |
| ui | 1 | 2,939 | 368,926 | 110 | 06:59:32 | 07:01:21 |
| judge | 3 | 8,428 | 183,689 | 24 | 06:59:37 | 07:00:01 |
| review | 3 | 13,456 | 7,248,222 | 446 | 06:59:40 | 07:07:06 |
| triage | 1 | 6,412 | 39,956 | 39 | 07:16:14 | 07:16:53 |
| capture | 1 | 149 | 29,265 | 6 | 07:16:56 | 07:17:02 |
| synthesize | 1 | 17,874 | 310,979 | 130 | 07:17:06 | 07:19:16 |

- **claude-sonnet-5-5**: 8 agent · 24 calls · out 36,525 · in 48 · cache_read 973,266 · cache_create 462,134
- **claude-opus-5-5**: 3 agent · 84 calls · out 13,456 · in 168 · cache_read 7,248,222 · cache_create 378,495
- **claude-haiku-5-5**: 22 agent · 44 calls · out 11,419 · in 88 · cache_read 703,878 · cache_create 728,443

