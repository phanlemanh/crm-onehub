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

### S4 round 2 — wf_6a944dda-fd4 (33 agent, 48,790 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 14,647 | 10 | 269,745 | 96 |
| ui:E15 | claude-sonnet-5-5 | 4 | 4,178 | 8 | 270,962 | 105 |
| judge:E17:spec-alignment | claude-sonnet-5-5 | 3 | 3,726 | 6 | 83,373 | 29 |
| review:measurement | claude-opus-5-5 | 15 | 3,553 | 30 | 904,295 | 163 |
| judge:E17:domain-correctness | claude-sonnet-5-5 | 3 | 3,379 | 6 | 73,626 | 27 |
| review:bugs | claude-opus-5-5 | 18 | 2,483 | 36 | 1,042,965 | 152 |
| judge:E17:operational-feasibility | claude-sonnet-5-5 | 3 | 1,853 | 6 | 76,992 | 23 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/ho- | claude-haiku-5-5 | 2 | 1,648 | 4 | 33,642 | 221 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,493 | 4 | 33,618 | 294 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,446 | 4 | 33,602 | 11 |
| review:conventions | claude-opus-5-5 | 12 | 1,416 | 24 | 594,698 | 95 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 1,407 | 4 | 33,679 | 73 |
| triage | claude-sonnet-5-5 | 2 | 770 | 4 | 31,976 | 9 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 719 | 4 | 40,709 | 59 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 456 | 4 | 33,648 | 33 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 419 | 4 | 33,648 | 34 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 409 | 4 | 33,651 | 23 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 405 | 4 | 33,655 | 34 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 401 | 4 | 33,600 | 21 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 358 | 4 | 33,650 | 31 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/pro | claude-haiku-5-5 | 2 | 314 | 4 | 33,640 | 10 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 309 | 4 | 33,651 | 35 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 306 | 4 | 33,648 | 27 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 305 | 4 | 33,627 | 301 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 304 | 4 | 33,651 | 31 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 304 | 4 | 33,651 | 23 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 302 | 4 | 33,657 | 63 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 300 | 4 | 33,648 | 31 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 297 | 4 | 5,738 | 343 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/hai | claude-haiku-5-5 | 2 | 279 | 4 | 33,647 | 28 |
| machine:bun _acceptance/cua-toi-ba-phan/rang/lie | claude-haiku-5-5 | 2 | 262 | 4 | 33,640 | 19 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 194 | 4 | 33,596 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 29,524 | 8 |


wall: 1176s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 719 | 40,709 | 59 | 08:16:58 | 08:17:57 |
| machine | 22 | 11,918 | 712,187 | 1056 | 08:16:58 | 08:34:34 |
| ui | 1 | 4,178 | 270,962 | 105 | 08:17:22 | 08:19:07 |
| judge | 3 | 8,958 | 233,991 | 33 | 08:17:26 | 08:18:00 |
| review | 3 | 7,452 | 2,541,958 | 166 | 08:17:33 | 08:20:20 |
| triage | 1 | 770 | 31,976 | 9 | 08:34:36 | 08:34:45 |
| capture | 1 | 148 | 29,524 | 8 | 08:34:48 | 08:34:56 |
| synthesize | 1 | 14,647 | 269,745 | 96 | 08:34:58 | 08:36:34 |

- **claude-sonnet-5-5**: 8 agent · 24 calls · out 29,420 · in 48 · cache_read 876,907 · cache_create 443,755
- **claude-opus-5-5**: 3 agent · 45 calls · out 7,452 · in 90 · cache_read 2,541,958 · cache_create 232,556
- **claude-haiku-5-5**: 22 agent · 44 calls · out 11,918 · in 88 · cache_read 712,187 · cache_create 733,660

