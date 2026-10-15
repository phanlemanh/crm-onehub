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

