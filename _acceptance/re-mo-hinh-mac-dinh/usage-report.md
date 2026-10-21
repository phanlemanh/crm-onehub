### S4 round 1 — wf_b83ca649-157 (17 agent, 33,267 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 6,308 | 6 | 90,209 | 41 |
| review:measurement | claude-opus-5-5 | 17 | 5,166 | 34 | 1,353,658 | 159 |
| review:bugs | claude-opus-5-5 | 25 | 3,959 | 50 | 1,941,690 | 194 |
| triage | claude-sonnet-5-5 | 2 | 3,043 | 4 | 29,129 | 26 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 6 | 2,269 | 12 | 128,867 | 889 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,098 | 4 | 28,561 | 123 |
| machine:bun _acceptance/re-mo-hinh-mac-dinh/rang | claude-haiku-5-5 | 2 | 1,958 | 4 | 28,545 | 15 |
| refute:kiem.ts | claude-sonnet-5-5 | 7 | 1,669 | 14 | 212,342 | 45 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,577 | 4 | 0 | 401 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 4 | 1,291 | 8 | 63,855 | 730 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,244 | 4 | 28,506 | 12 |
| review:conventions | claude-opus-5-5 | 17 | 1,108 | 34 | 785,139 | 105 |
| machine:bun _acceptance/re-mo-hinh-mac-dinh/rang | claude-haiku-5-5 | 2 | 601 | 4 | 28,551 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 425 | 4 | 28,504 | 191 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 217 | 4 | 28,665 | 209 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 188 | 4 | 28,500 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 24,325 | 8 |


wall: 2498s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 217 | 28,665 | 209 | 10:14:23 | 10:17:51 |
| machine | 9 | 11,651 | 363,889 | 2368 | 10:14:23 | 10:53:51 |
| review | 3 | 10,233 | 4,080,487 | 197 | 10:14:23 | 10:17:40 |
| triage | 1 | 3,043 | 29,129 | 26 | 10:53:53 | 10:54:19 |
| refute | 1 | 1,669 | 212,342 | 45 | 10:54:21 | 10:55:06 |
| capture | 1 | 146 | 24,325 | 8 | 10:55:09 | 10:55:17 |
| synthesize | 1 | 6,308 | 90,209 | 41 | 10:55:20 | 10:56:00 |

- **claude-sonnet-5-5**: 5 agent · 16 calls · out 11,383 · in 32 · cache_read 384,670 · cache_create 197,179
- **claude-opus-5-5**: 3 agent · 59 calls · out 10,233 · in 118 · cache_read 4,080,487 · cache_create 306,634
- **claude-haiku-5-5**: 9 agent · 24 calls · out 11,651 · in 48 · cache_read 363,889 · cache_create 338,789

### S4 round 2 — wf_6b221a0b-aa6 (17 agent, 28,347 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 7,686 | 8 | 151,813 | 62 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,527 | 4 | 28,497 | 123 |
| triage | claude-sonnet-5-5 | 2 | 2,264 | 4 | 29,610 | 19 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,904 | 4 | 2,973 | 332 |
| review:conventions | claude-opus-5-5 | 9 | 1,862 | 18 | 364,889 | 71 |
| machine:bun _acceptance/re-mo-hinh-mac-dinh/rang | claude-haiku-5-5 | 2 | 1,704 | 4 | 28,538 | 12 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,498 | 4 | 28,499 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,470 | 4 | 2,973 | 434 |
| refute:kiem.ts | claude-sonnet-5-5 | 6 | 1,303 | 12 | 196,177 | 38 |
| review:measurement | claude-opus-5-5 | 12 | 1,245 | 24 | 628,960 | 108 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,239 | 4 | 0 | 367 |
| review:bugs | claude-opus-5-5 | 22 | 1,239 | 44 | 1,275,385 | 177 |
| machine:bun _acceptance/re-mo-hinh-mac-dinh/rang | claude-haiku-5-5 | 2 | 539 | 4 | 28,544 | 8 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 304 | 4 | 28,554 | 76 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 28,493 | 7 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 204 | 4 | 28,125 | 23 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 24,318 | 6 |


wall: 1496s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 204 | 28,125 | 23 | 11:06:00 | 11:06:23 |
| machine | 9 | 12,398 | 177,071 | 1363 | 11:06:00 | 11:28:43 |
| review | 3 | 4,346 | 2,269,234 | 179 | 11:06:00 | 11:08:58 |
| triage | 1 | 2,264 | 29,610 | 19 | 11:28:45 | 11:29:04 |
| refute | 1 | 1,303 | 196,177 | 38 | 11:29:06 | 11:29:44 |
| capture | 1 | 146 | 24,318 | 6 | 11:29:46 | 11:29:51 |
| synthesize | 1 | 7,686 | 151,813 | 62 | 11:29:54 | 11:30:56 |

- **claude-sonnet-5-5**: 5 agent · 16 calls · out 11,603 · in 32 · cache_read 430,043 · cache_create 209,981
- **claude-haiku-5-5**: 9 agent · 18 calls · out 12,398 · in 36 · cache_read 177,071 · cache_create 332,366
- **claude-opus-5-5**: 3 agent · 43 calls · out 4,346 · in 86 · cache_read 2,269,234 · cache_create 220,740

