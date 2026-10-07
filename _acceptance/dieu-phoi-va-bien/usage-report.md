### S4 round 1 — wf_d237f104-655 (25 agent, 95,039 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 17 | 20,929 | 34 | 2,563,193 | 236 |
| review:bugs | claude-opus-5-5 | 23 | 19,891 | 46 | 3,194,354 | 236 |
| review:conventions | claude-opus-5-5 | 13 | 10,000 | 26 | 1,612,674 | 118 |
| synthesize:report | claude-sonnet-5-5 | 4 | 8,941 | 8 | 361,544 | 61 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 3,421 | 18 | 93,896 | 43 |
| triage | claude-sonnet-5-5 | 2 | 2,701 | 4 | 94,658 | 25 |
| baseline:diffBase | claude-sonnet-5-5 | 5 | 2,699 | 10 | 389,903 | 45 |
| machine:node _acceptance/dieu-phoi-va-bien/rang/ | claude-haiku-4-5-20251001 | 2 | 2,653 | 18 | 93,898 | 30 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,642 | 18 | 93,922 | 88 |
| machine:bun run test:dieu-phoi | claude-haiku-4-5-20251001 | 2 | 2,487 | 18 | 93,879 | 38 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,290 | 18 | 93,896 | 225 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 2,076 | 18 | 93,898 | 23 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,859 | 18 | 67,208 | 281 |
| machine:node --test scripts/dieu-phoi/test/hook- | claude-haiku-4-5-20251001 | 2 | 1,706 | 18 | 93,898 | 27 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,617 | 18 | 93,875 | 22 |
| machine:node --test scripts/dieu-phoi/test/hinh- | claude-haiku-4-5-20251001 | 2 | 1,209 | 18 | 93,898 | 16 |
| machine:node --test scripts/dieu-phoi/test/giu-n | claude-haiku-4-5-20251001 | 2 | 1,198 | 18 | 93,899 | 19 |
| machine:bun _acceptance/dieu-phoi-va-bien/rang/c | claude-haiku-4-5-20251001 | 2 | 1,154 | 18 | 93,899 | 26 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,032 | 18 | 93,890 | 215 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 965 | 18 | 93,875 | 31 |
| machine:node --test scripts/dieu-phoi/test/gia-h | claude-haiku-4-5-20251001 | 2 | 935 | 18 | 93,898 | 20 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 871 | 18 | 93,873 | 15 |
| machine:node --test scripts/dieu-phoi/test/hook- | claude-haiku-4-5-20251001 | 2 | 834 | 18 | 93,901 | 19 |
| machine:node _acceptance/dieu-phoi-va-bien/rang/ | claude-haiku-4-5-20251001 | 2 | 603 | 18 | 93,897 | 39 |
| capture:provenance | claude-sonnet-5-5 | 2 | 326 | 4 | 90,336 | 7 |


wall: 969s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,699 | 389,903 | 45 | 01:32:22 | 01:33:08 |
| machine | 18 | 29,552 | 1,663,400 | 876 | 01:32:22 | 01:46:59 |
| review | 3 | 50,820 | 7,370,221 | 237 | 01:32:44 | 01:36:41 |
| triage | 1 | 2,701 | 94,658 | 25 | 01:46:59 | 01:47:23 |
| capture | 1 | 326 | 90,336 | 7 | 01:47:23 | 01:47:30 |
| synthesize | 1 | 8,941 | 361,544 | 61 | 01:47:30 | 01:48:31 |

- **claude-opus-5-5**: 3 agent · 53 calls · out 50,820 · in 106 · cache_read 7,370,221 · cache_create 470,116
- **claude-sonnet-5-5**: 4 agent · 13 calls · out 14,667 · in 26 · cache_read 936,441 · cache_create 431,259
- **claude-haiku-4-5-20251001**: 18 agent · 36 calls · out 29,552 · in 324 · cache_read 1,663,400 · cache_create 865,054

### S4 round 2 — wf_11c5d6b2-717 (15 agent, 38,060 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 10,395 | 8 | 383,317 | 74 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 8 | 5,165 | 66 | 550,671 | 179 |
| review:bugs | claude-opus-5-5 | 14 | 4,949 | 28 | 1,419,323 | 72 |
| review:measurement | claude-opus-5-5 | 6 | 2,598 | 12 | 553,469 | 33 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 5 | 2,477 | 42 | 316,370 | 233 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,825 | 18 | 93,749 | 261 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,762 | 18 | 93,747 | 43 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,667 | 18 | 93,762 | 221 |
| review:conventions | claude-opus-5-5 | 6 | 1,495 | 12 | 498,217 | 30 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,485 | 18 | 93,747 | 21 |
| judge:E20:operational-feasibility | claude-sonnet-5-5 | 2 | 1,118 | 4 | 123,072 | 14 |
| judge:E20:domain-correctness | claude-sonnet-5-5 | 2 | 1,110 | 4 | 91,083 | 11 |
| judge:E20:spec-alignment | claude-sonnet-5-5 | 2 | 979 | 4 | 123,070 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 700 | 18 | 93,745 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 335 | 4 | 90,186 | 7 |


wall: 1051s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 7 | 15,081 | 1,335,791 | 971 | 01:50:23 | 02:06:34 |
| judge | 3 | 3,207 | 337,225 | 16 | 01:50:23 | 01:50:39 |
| review | 3 | 9,042 | 2,471,009 | 73 | 01:50:23 | 01:51:35 |
| capture | 1 | 335 | 90,186 | 7 | 02:06:34 | 02:06:40 |
| synthesize | 1 | 10,395 | 383,317 | 74 | 02:06:40 | 02:07:54 |

- **claude-sonnet-5-5**: 5 agent · 12 calls · out 13,937 · in 24 · cache_read 810,728 · cache_create 472,467
- **claude-haiku-4-5-20251001**: 7 agent · 23 calls · out 15,081 · in 198 · cache_read 1,335,791 · cache_create 345,238
- **claude-opus-5-5**: 3 agent · 26 calls · out 9,042 · in 52 · cache_read 2,471,009 · cache_create 276,934

