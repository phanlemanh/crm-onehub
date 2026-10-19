### S4 round 1 — wf_9b5fa5bd-7e0 (22 agent, 27,613 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 7,526 | 4 | 46,918 | 57 |
| triage | claude-sonnet-5-5 | 2 | 2,848 | 4 | 35,719 | 29 |
| review:measurement | claude-opus-5-5 | 10 | 2,598 | 20 | 543,535 | 153 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,825 | 4 | 2,973 | 345 |
| review:bugs | claude-opus-5-5 | 14 | 1,575 | 28 | 925,270 | 161 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,337 | 4 | 34,881 | 10 |
| review:conventions | claude-opus-5-5 | 14 | 1,235 | 28 | 835,300 | 126 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,224 | 4 | 5,946 | 422 |
| machine:node --test "scripts/kiem-cheo/test/*.te | claude-haiku-5-5 | 2 | 1,196 | 4 | 34,906 | 49 |
| machine:bun _acceptance/khong-do-them-chay-gh/ra | claude-haiku-5-5 | 2 | 876 | 4 | 34,915 | 54 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 873 | 4 | 34,936 | 73 |
| machine:bun _acceptance/khong-do-them-chay-gh/ra | claude-haiku-5-5 | 2 | 867 | 4 | 34,919 | 65 |
| refute:dung-lai-cay.mjs | claude-sonnet-5-5 | 4 | 633 | 8 | 106,015 | 20 |
| machine:bun _acceptance/khong-do-them-chay-gh/ra | claude-haiku-5-5 | 2 | 555 | 4 | 34,912 | 14 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 431 | 4 | 5,946 | 451 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 406 | 4 | 34,879 | 34 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 370 | 4 | 37,113 | 72 |
| machine:bun _acceptance/khong-do-them-chay-gh/ra | claude-haiku-5-5 | 2 | 366 | 4 | 34,916 | 82 |
| machine:bun _acceptance/khong-do-them-chay-gh/ra | claude-haiku-5-5 | 2 | 330 | 4 | 34,918 | 32 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 34,875 | 7 |
| machine:bun _acceptance/khong-do-them-chay-gh/ra | claude-haiku-5-5 | 2 | 181 | 4 | 34,916 | 132 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 30,696 | 6 |


wall: 1482s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 370 | 37,113 | 72 | 14:27:22 | 14:28:35 |
| machine | 14 | 10,680 | 398,838 | 1358 | 14:27:22 | 14:50:00 |
| review | 3 | 5,408 | 2,304,105 | 163 | 14:27:22 | 14:30:06 |
| triage | 1 | 2,848 | 35,719 | 29 | 14:50:03 | 14:50:32 |
| refute | 1 | 633 | 106,015 | 20 | 14:50:34 | 14:50:55 |
| capture | 1 | 148 | 30,696 | 6 | 14:50:58 | 14:51:05 |
| synthesize | 1 | 7,526 | 46,918 | 57 | 14:51:07 | 14:52:04 |

- **claude-sonnet-5-5**: 5 agent · 12 calls · out 11,525 · in 24 · cache_read 256,461 · cache_create 218,530
- **claude-opus-5-5**: 3 agent · 38 calls · out 5,408 · in 76 · cache_read 2,304,105 · cache_create 251,930
- **claude-haiku-5-5**: 14 agent · 28 calls · out 10,680 · in 56 · cache_read 398,838 · cache_create 550,636

### S4 round 2 — wf_70a11d26-d6e (15 agent, 17,137 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 5,535 | 8 | 165,224 | 39 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,356 | 4 | 34,933 | 30 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,663 | 4 | 2,973 | 418 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,392 | 4 | 34,935 | 10 |
| triage | claude-sonnet-5-5 | 2 | 1,173 | 4 | 33,810 | 10 |
| review:bugs | claude-opus-5-5 | 7 | 972 | 14 | 276,421 | 53 |
| review:conventions | claude-opus-5-5 | 6 | 800 | 12 | 200,927 | 56 |
| review:measurement | claude-opus-5-5 | 6 | 792 | 12 | 222,820 | 55 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 304 | 4 | 5,946 | 315 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 303 | 4 | 34,990 | 72 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 300 | 4 | 34,935 | 272 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 34,929 | 8 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 159 | 4 | 34,001 | 25 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 30,750 | 4 |
| machine:bun _acceptance/khong-do-them-chay-gh/ra | claude-haiku-5-5 | 2 | 26 | 4 | 34,972 | 25 |


wall: 1199s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 159 | 34,001 | 25 | 14:54:13 | 14:54:38 |
| machine | 8 | 7,557 | 218,613 | 1140 | 14:54:13 | 15:13:12 |
| review | 3 | 2,564 | 700,168 | 59 | 14:54:13 | 14:55:12 |
| triage | 1 | 1,173 | 33,810 | 10 | 15:13:15 | 15:13:24 |
| capture | 1 | 149 | 30,750 | 5 | 15:13:27 | 15:13:31 |
| synthesize | 1 | 5,535 | 165,224 | 39 | 15:13:33 | 15:14:12 |

- **claude-sonnet-5-5**: 4 agent · 10 calls · out 7,016 · in 20 · cache_read 263,785 · cache_create 179,249
- **claude-haiku-5-5**: 8 agent · 16 calls · out 7,557 · in 32 · cache_read 218,613 · cache_create 328,232
- **claude-opus-5-5**: 3 agent · 19 calls · out 2,564 · in 38 · cache_read 700,168 · cache_create 149,684

