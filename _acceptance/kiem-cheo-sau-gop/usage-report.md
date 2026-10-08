### S4 round 1 — wf_ab8a64cf-143 (26 agent, 99,130 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 28 | 25,550 | 56 | 4,291,759 | 309 |
| review:measurement | claude-opus-5-5 | 12 | 14,345 | 24 | 1,475,774 | 157 |
| review:conventions | claude-opus-5-5 | 20 | 13,380 | 40 | 2,678,380 | 168 |
| synthesize:report | claude-sonnet-5-5 | 3 | 9,228 | 6 | 247,751 | 67 |
| triage | claude-sonnet-5-5 | 2 | 6,614 | 4 | 104,212 | 59 |
| refute:dem.mjs | claude-sonnet-5-5 | 8 | 2,882 | 16 | 731,144 | 39 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,763 | 4 | 131,308 | 73 |
| refute:khoa.mjs | claude-sonnet-5-5 | 6 | 2,235 | 12 | 523,543 | 34 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,117 | 4 | 131,269 | 246 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 1,935 | 8 | 304,896 | 30 |
| machine:node --test "scripts/kiem-cheo/test/*.te | claude-haiku-5-5 | 2 | 1,888 | 4 | 131,278 | 12 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,811 | 4 | 131,253 | 10 |
| refute:khoa.mjs | claude-sonnet-5-5 | 5 | 1,727 | 10 | 421,853 | 30 |
| refute:tap-cham.mjs | claude-sonnet-5-5 | 3 | 1,416 | 6 | 197,068 | 17 |
| refute:bao.test.mjs | claude-sonnet-5-5 | 4 | 1,338 | 8 | 313,882 | 35 |
| refute:kho-gia.mjs | claude-sonnet-5-5 | 3 | 1,197 | 6 | 197,777 | 16 |
| machine:node --test scripts/dieu-phoi/test/lich. | claude-haiku-5-5 | 2 | 1,148 | 4 | 131,276 | 8 |
| refute:dem.mjs | claude-sonnet-5-5 | 3 | 1,146 | 6 | 201,477 | 46 |
| machine:node _acceptance/kiem-cheo-sau-gop/rang/ | claude-haiku-5-5 | 2 | 1,114 | 4 | 131,288 | 24 |
| refute:tap-cham.mjs | claude-sonnet-5-5 | 3 | 1,007 | 6 | 198,474 | 25 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 878 | 4 | 131,278 | 247 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 812 | 4 | 131,251 | 27 |
| machine:node _acceptance/kiem-cheo-sau-gop/rang/ | claude-haiku-5-5 | 2 | 805 | 4 | 131,290 | 6 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 752 | 4 | 96,243 | 260 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 708 | 4 | 131,247 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 334 | 4 | 95,508 | 7 |


wall: 1055s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,935 | 304,896 | 30 | 08:36:55 | 08:37:25 |
| machine | 11 | 14,796 | 1,408,981 | 871 | 08:36:55 | 08:51:26 |
| review | 3 | 53,275 | 8,445,913 | 310 | 08:36:55 | 08:42:05 |
| triage | 1 | 6,614 | 104,212 | 59 | 08:51:27 | 08:52:25 |
| refute | 8 | 12,948 | 2,785,218 | 51 | 08:52:25 | 08:53:16 |
| capture | 1 | 334 | 95,508 | 7 | 08:53:16 | 08:53:23 |
| synthesize | 1 | 9,228 | 247,751 | 67 | 08:53:23 | 08:54:30 |

- **claude-opus-5-5**: 3 agent · 60 calls · out 53,275 · in 120 · cache_read 8,445,913 · cache_create 448,789
- **claude-sonnet-5-5**: 12 agent · 46 calls · out 31,059 · in 92 · cache_read 3,537,585 · cache_create 1,320,283
- **claude-haiku-5-5**: 11 agent · 22 calls · out 14,796 · in 44 · cache_read 1,408,981 · cache_create 776,766

