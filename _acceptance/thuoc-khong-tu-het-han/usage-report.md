### S4 round 1 — wf_08f99eef-b27 — wf_08f99eef-b27 (24 agent, 82,595 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 24 | 16,413 | 48 | 3,064,729 | 202 |
| review:bugs | claude-opus-5-5 | 19 | 14,448 | 38 | 2,298,883 | 188 |
| review:measurement | claude-opus-5-5 | 11 | 13,572 | 22 | 1,243,504 | 155 |
| synthesize:report | claude-sonnet-5-5 | 3 | 7,169 | 6 | 217,505 | 50 |
| triage | claude-sonnet-5-5 | 2 | 4,078 | 4 | 94,586 | 31 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,628 | 4 | 124,152 | 32 |
| refute:hai-thuoc.mjs | claude-sonnet-5-5 | 5 | 2,668 | 10 | 422,956 | 35 |
| refute:chi-paths.mjs | claude-sonnet-5-5 | 4 | 2,276 | 8 | 321,437 | 25 |
| refute:kiem-ke.mjs | claude-sonnet-5-5 | 4 | 2,192 | 8 | 318,582 | 32 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,099 | 4 | 124,154 | 11 |
| baseline:diffBase | claude-sonnet-5-5 | 5 | 1,777 | 10 | 378,877 | 29 |
| refute:chi-paths.mjs | claude-sonnet-5-5 | 5 | 1,737 | 10 | 403,993 | 29 |
| refute:hai-thuoc.mjs | claude-sonnet-5-5 | 3 | 1,404 | 6 | 221,412 | 22 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,216 | 4 | 124,170 | 222 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 983 | 4 | 124,188 | 8 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 916 | 4 | 124,189 | 11 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 903 | 4 | 89,144 | 199 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 891 | 4 | 124,188 | 16 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 854 | 4 | 124,209 | 66 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 797 | 4 | 124,193 | 13 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 769 | 4 | 124,193 | 11 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 748 | 4 | 124,148 | 7 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 731 | 4 | 124,179 | 225 |
| capture:provenance | claude-sonnet-5-5 | 2 | 326 | 4 | 88,409 | 7 |


wall: 887s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,777 | 378,877 | 29 | 18:46:57 | 18:47:26 |
| machine | 12 | 14,535 | 1,455,107 | 762 | 18:46:57 | 18:59:39 |
| review | 3 | 44,433 | 6,607,116 | 202 | 18:46:57 | 18:50:19 |
| triage | 1 | 4,078 | 94,586 | 31 | 18:59:39 | 19:00:10 |
| refute | 5 | 10,277 | 1,688,380 | 37 | 19:00:10 | 19:00:47 |
| capture | 1 | 326 | 88,409 | 7 | 19:00:47 | 19:00:54 |
| synthesize | 1 | 7,169 | 217,505 | 50 | 19:00:54 | 19:01:45 |

- **claude-opus-5-5**: 3 agent · 54 calls · out 44,433 · in 108 · cache_read 6,607,116 · cache_create 374,170
- **claude-sonnet-5-5**: 9 agent · 33 calls · out 23,627 · in 66 · cache_read 2,467,757 · cache_create 784,845
- **claude-haiku-5-5**: 12 agent · 24 calls · out 14,535 · in 48 · cache_read 1,455,107 · cache_create 757,430

### S4 round 2 — wf_003b4d90-ae4 — wf_003b4d90-ae4 (17 agent, 42,411 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 9 | 9,991 | 18 | 1,013,715 | 120 |
| review:bugs | claude-opus-5-5 | 12 | 8,686 | 24 | 1,328,674 | 122 |
| review:conventions | claude-opus-5-5 | 11 | 6,557 | 22 | 1,101,614 | 101 |
| synthesize:report | claude-sonnet-5-5 | 5 | 3,961 | 10 | 447,368 | 37 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,969 | 4 | 124,204 | 230 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,951 | 4 | 124,243 | 68 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,839 | 4 | 124,188 | 10 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 901 | 4 | 124,222 | 7 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 886 | 4 | 124,222 | 17 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 827 | 4 | 124,227 | 11 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 812 | 4 | 124,188 | 201 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 808 | 4 | 124,213 | 219 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 789 | 4 | 124,223 | 10 |
| machine:node _acceptance/thuoc-khong-tu-het-han/ | claude-haiku-5-5 | 2 | 783 | 4 | 124,227 | 13 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 720 | 4 | 124,182 | 7 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 561 | 4 | 124,186 | 23 |
| capture:provenance | claude-sonnet-5-5 | 2 | 370 | 4 | 88,443 | 8 |


wall: 803s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 12 | 12,846 | 1,490,525 | 758 | 19:04:18 | 19:16:56 |
| review | 3 | 25,234 | 3,444,003 | 123 | 19:04:18 | 19:06:21 |
| capture | 1 | 370 | 88,443 | 8 | 19:16:56 | 19:17:04 |
| synthesize | 1 | 3,961 | 447,368 | 37 | 19:17:04 | 19:17:41 |

- **claude-opus-5-5**: 3 agent · 32 calls · out 25,234 · in 64 · cache_read 3,444,003 · cache_create 338,394
- **claude-sonnet-5-5**: 2 agent · 7 calls · out 4,331 · in 14 · cache_read 535,811 · cache_create 212,524
- **claude-haiku-5-5**: 12 agent · 24 calls · out 12,846 · in 48 · cache_read 1,490,525 · cache_create 722,301

