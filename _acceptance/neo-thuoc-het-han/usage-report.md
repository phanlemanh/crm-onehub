### S4 round 1 — wf_8616518d-272 (25 agent, 92,733 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 15 | 16,298 | 30 | 1,195,848 | 190 |
| review:measurement | claude-opus-5-5 | 18 | 16,122 | 36 | 1,442,714 | 196 |
| review:conventions | claude-opus-5-5 | 14 | 10,909 | 28 | 1,048,475 | 135 |
| synthesize:report | claude-sonnet-5-5 | 4 | 10,390 | 8 | 197,238 | 72 |
| triage | claude-sonnet-5-5 | 2 | 5,417 | 4 | 45,752 | 39 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 5,126 | 4 | 44,280 | 32 |
| refute:ghim-xanh.mjs | claude-sonnet-5-5 | 8 | 2,424 | 16 | 342,418 | 38 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,359 | 4 | 42,278 | 250 |
| refute:pham-vi.mjs | claude-sonnet-5-5 | 5 | 2,276 | 10 | 194,685 | 27 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,185 | 4 | 42,308 | 90 |
| refute:pham-vi.mjs | claude-sonnet-5-5 | 5 | 2,049 | 10 | 181,922 | 25 |
| refute:pham-vi.mjs | claude-sonnet-5-5 | 6 | 2,025 | 12 | 229,217 | 28 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,960 | 4 | 42,253 | 12 |
| refute:soi-ma.mjs | claude-sonnet-5-5 | 5 | 1,787 | 10 | 178,964 | 24 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,732 | 4 | 39,384 | 245 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/p | claude-haiku-5-5 | 2 | 1,626 | 4 | 42,287 | 17 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/c | claude-haiku-5-5 | 2 | 1,368 | 4 | 42,287 | 17 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/c | claude-haiku-5-5 | 2 | 1,174 | 4 | 42,290 | 17 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,121 | 4 | 42,269 | 295 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/h | claude-haiku-5-5 | 2 | 1,042 | 4 | 42,287 | 30 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 836 | 4 | 42,251 | 185 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 827 | 4 | 42,348 | 10 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 668 | 4 | 42,247 | 9 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/g | claude-haiku-5-5 | 2 | 598 | 4 | 42,289 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 414 | 4 | 38,175 | 9 |


wall: 1247s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,126 | 44,280 | 32 | 06:23:06 | 06:23:38 |
| machine | 13 | 17,496 | 546,778 | 1086 | 06:23:06 | 06:41:11 |
| review | 3 | 43,329 | 3,687,037 | 197 | 06:23:06 | 06:26:23 |
| triage | 1 | 5,417 | 45,752 | 39 | 06:41:11 | 06:41:51 |
| refute | 5 | 10,561 | 1,127,206 | 40 | 06:41:51 | 06:42:31 |
| capture | 1 | 414 | 38,175 | 9 | 06:42:31 | 06:42:40 |
| synthesize | 1 | 10,390 | 197,238 | 72 | 06:42:40 | 06:43:53 |

- **claude-opus-5-5**: 3 agent · 47 calls · out 43,329 · in 94 · cache_read 3,687,037 · cache_create 329,889
- **claude-sonnet-5-5**: 9 agent · 39 calls · out 31,908 · in 78 · cache_read 1,452,651 · cache_create 470,424
- **claude-haiku-5-5**: 13 agent · 26 calls · out 17,496 · in 52 · cache_read 546,778 · cache_create 544,969

### S4 round 2 — wf_9c23c583-8ea (19 agent, 79,013 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 27 | 28,484 | 54 | 3,068,988 | 334 |
| review:measurement | claude-opus-5-5 | 17 | 15,806 | 34 | 1,481,603 | 186 |
| synthesize:report | claude-sonnet-5-5 | 6 | 7,279 | 12 | 324,692 | 57 |
| review:conventions | claude-opus-5-5 | 14 | 7,181 | 28 | 1,065,576 | 99 |
| refute:hai-ref.mjs | claude-sonnet-5-5 | 4 | 2,842 | 8 | 138,265 | 33 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,602 | 4 | 42,275 | 96 |
| triage | claude-sonnet-5-5 | 2 | 2,565 | 4 | 42,126 | 22 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/p | claude-haiku-5-5 | 2 | 1,882 | 4 | 42,254 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,562 | 4 | 42,220 | 10 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/c | claude-haiku-5-5 | 2 | 1,300 | 4 | 42,254 | 17 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/h | claude-haiku-5-5 | 2 | 1,226 | 4 | 42,254 | 34 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,042 | 4 | 42,245 | 260 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/c | claude-haiku-5-5 | 2 | 1,011 | 4 | 42,257 | 16 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,000 | 4 | 42,236 | 295 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/g | claude-haiku-5-5 | 2 | 795 | 4 | 42,256 | 7 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 723 | 4 | 39,351 | 237 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 713 | 4 | 42,214 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 585 | 4 | 42,218 | 166 |
| capture:provenance | claude-sonnet-5-5 | 2 | 415 | 4 | 38,142 | 9 |


wall: 1193s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 12 | 14,441 | 504,034 | 1072 | 08:21:02 | 08:38:54 |
| review | 3 | 51,471 | 5,616,167 | 335 | 08:21:02 | 08:26:37 |
| triage | 1 | 2,565 | 42,126 | 22 | 08:38:54 | 08:39:15 |
| refute | 1 | 2,842 | 138,265 | 33 | 08:39:16 | 08:39:49 |
| capture | 1 | 415 | 38,142 | 9 | 08:39:49 | 08:39:58 |
| synthesize | 1 | 7,279 | 324,692 | 57 | 08:39:58 | 08:40:55 |

- **claude-opus-5-5**: 3 agent · 58 calls · out 51,471 · in 116 · cache_read 5,616,167 · cache_create 367,225
- **claude-sonnet-5-5**: 4 agent · 14 calls · out 13,101 · in 28 · cache_read 543,225 · cache_create 222,986
- **claude-haiku-5-5**: 12 agent · 24 calls · out 14,441 · in 48 · cache_read 504,034 · cache_create 501,936

### S4 round 3 — wf_1be12069-cff (18 agent, 48,129 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 9 | 11,211 | 18 | 457,865 | 158 |
| review:bugs | claude-opus-5-5 | 9 | 9,886 | 18 | 456,865 | 141 |
| synthesize:report | claude-sonnet-5-5 | 5 | 6,180 | 10 | 254,338 | 54 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,644 | 4 | 42,229 | 167 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,444 | 4 | 42,256 | 257 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,434 | 4 | 42,286 | 86 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,679 | 4 | 42,231 | 11 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/p | claude-haiku-5-5 | 2 | 1,605 | 4 | 42,265 | 14 |
| triage | claude-sonnet-5-5 | 2 | 1,492 | 4 | 41,812 | 15 |
| review:conventions | claude-opus-5-5 | 3 | 1,195 | 6 | 84,395 | 17 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/c | claude-haiku-5-5 | 2 | 1,116 | 4 | 42,265 | 16 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 944 | 4 | 42,247 | 293 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/h | claude-haiku-5-5 | 2 | 905 | 4 | 42,265 | 40 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 804 | 4 | 42,231 | 247 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/g | claude-haiku-5-5 | 2 | 768 | 4 | 42,267 | 7 |
| machine:bun _acceptance/neo-thuoc-het-han/rang/c | claude-haiku-5-5 | 2 | 748 | 4 | 42,268 | 15 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 661 | 4 | 42,225 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 413 | 4 | 38,153 | 9 |


wall: 1149s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 12 | 17,752 | 507,035 | 1071 | 08:42:59 | 09:00:50 |
| review | 3 | 22,292 | 999,125 | 159 | 08:42:59 | 08:45:38 |
| triage | 1 | 1,492 | 41,812 | 15 | 09:00:50 | 09:01:05 |
| capture | 1 | 413 | 38,153 | 9 | 09:01:05 | 09:01:14 |
| synthesize | 1 | 6,180 | 254,338 | 54 | 09:01:14 | 09:02:08 |

- **claude-opus-5-5**: 3 agent · 21 calls · out 22,292 · in 42 · cache_read 999,125 · cache_create 188,656
- **claude-sonnet-5-5**: 3 agent · 9 calls · out 8,085 · in 18 · cache_read 334,303 · cache_create 168,489
- **claude-haiku-5-5**: 12 agent · 24 calls · out 17,752 · in 48 · cache_read 507,035 · cache_create 500,973

