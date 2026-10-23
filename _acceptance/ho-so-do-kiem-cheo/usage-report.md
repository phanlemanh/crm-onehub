### S4 round 1 — wf_d87155fc-087 (23 agent, 87,684 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| judge:E6:domain-correctness | claude-sonnet-5-5 | 5 | 19,737 | 10 | 341,207 | 162 |
| synthesize:report | claude-sonnet-5-5 | 3 | 16,685 | 6 | 153,170 | 103 |
| judge:E6:operational-feasibility | claude-sonnet-5-5 | 4 | 13,811 | 8 | 225,115 | 116 |
| triage | claude-sonnet-5-5 | 2 | 8,818 | 4 | 45,354 | 62 |
| review:measurement | claude-opus-5-5 | 33 | 5,746 | 66 | 4,170,790 | 363 |
| review:conventions | claude-opus-5-5 | 33 | 4,153 | 66 | 4,212,683 | 332 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,196 | 4 | 39,202 | 34 |
| review:bugs | claude-opus-5-5 | 21 | 2,638 | 42 | 2,262,057 | 278 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,911 | 4 | 39,259 | 79 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 1,610 | 4 | 39,245 | 12 |
| judge:E6:spec-alignment | claude-sonnet-5-5 | 4 | 1,603 | 8 | 226,241 | 77 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 1,353 | 4 | 39,249 | 55 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 1,225 | 4 | 40,977 | 39 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,184 | 4 | 39,204 | 10 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 16 | 975 | 32 | 614,984 | 1923 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 602 | 4 | 39,243 | 8 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 527 | 4 | 39,245 | 8 |
| machine:bun _acceptance/ho-so-do-kiem-cheo/rang/ | claude-haiku-5-5 | 2 | 484 | 4 | 39,242 | 19 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 435 | 4 | 6,114 | 502 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 307 | 4 | 6,114 | 318 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 302 | 4 | 6,114 | 351 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 39,198 | 9 |
| capture:provenance | claude-sonnet-5-5 | 3 | 167 | 6 | 75,837 | 26 |


wall: 2124s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,225 | 40,977 | 39 | 16:04:20 | 16:04:58 |
| machine | 13 | 13,101 | 986,413 | 1925 | 16:04:20 | 16:36:25 |
| judge | 3 | 35,151 | 792,563 | 162 | 16:04:20 | 16:07:02 |
| review | 3 | 12,537 | 10,645,530 | 377 | 16:04:20 | 16:10:36 |
| triage | 1 | 8,818 | 45,354 | 62 | 16:36:27 | 16:37:29 |
| capture | 1 | 167 | 75,837 | 26 | 16:37:32 | 16:37:57 |
| synthesize | 1 | 16,685 | 153,170 | 103 | 16:38:00 | 16:39:43 |

- **claude-sonnet-5-5**: 7 agent · 23 calls · out 62,046 · in 46 · cache_read 1,107,901 · cache_create 586,898
- **claude-opus-5-5**: 3 agent · 87 calls · out 12,537 · in 174 · cache_read 10,645,530 · cache_create 539,129
- **claude-haiku-5-5**: 13 agent · 40 calls · out 13,101 · in 80 · cache_read 986,413 · cache_create 624,347

