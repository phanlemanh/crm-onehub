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

### S4 round 2 — wf_8e673ce9-670 (18 agent, 61,808 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 24 | 14,263 | 48 | 3,384,243 | 189 |
| review:measurement | claude-opus-5-5 | 15 | 12,939 | 30 | 2,116,242 | 169 |
| synthesize:report | claude-sonnet-5-5 | 3 | 7,956 | 6 | 234,300 | 59 |
| review:conventions | claude-opus-5-5 | 12 | 7,237 | 24 | 1,442,664 | 92 |
| triage | claude-sonnet-5-5 | 2 | 3,081 | 4 | 100,353 | 35 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,439 | 4 | 131,329 | 232 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,222 | 4 | 131,359 | 64 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,400 | 4 | 131,304 | 8 |
| machine:node --test "scripts/kiem-cheo/test/*.te | claude-haiku-5-5 | 2 | 1,352 | 4 | 131,329 | 12 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,287 | 4 | 131,302 | 31 |
| machine:node --test scripts/dieu-phoi/test/lich. | claude-haiku-5-5 | 2 | 1,274 | 4 | 131,327 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,167 | 4 | 96,294 | 254 |
| refute:dem.mjs | claude-sonnet-5-5 | 3 | 1,123 | 6 | 199,334 | 17 |
| machine:node _acceptance/kiem-cheo-sau-gop/rang/ | claude-haiku-5-5 | 2 | 1,116 | 4 | 131,339 | 30 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,047 | 4 | 131,320 | 234 |
| machine:node _acceptance/kiem-cheo-sau-gop/rang/ | claude-haiku-5-5 | 2 | 823 | 4 | 131,341 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 741 | 4 | 131,298 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 341 | 4 | 95,559 | 9 |


wall: 951s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 11 | 14,868 | 1,409,542 | 831 | 09:28:44 | 09:42:34 |
| review | 3 | 34,439 | 6,943,149 | 190 | 09:28:44 | 09:31:54 |
| triage | 1 | 3,081 | 100,353 | 35 | 09:42:34 | 09:43:09 |
| refute | 1 | 1,123 | 199,334 | 17 | 09:43:09 | 09:43:26 |
| capture | 1 | 341 | 95,559 | 9 | 09:43:26 | 09:43:35 |
| synthesize | 1 | 7,956 | 234,300 | 59 | 09:43:35 | 09:44:35 |

- **claude-opus-5-5**: 3 agent · 51 calls · out 34,439 · in 102 · cache_read 6,943,149 · cache_create 428,016
- **claude-sonnet-5-5**: 4 agent · 10 calls · out 12,501 · in 20 · cache_read 629,546 · cache_create 444,926
- **claude-haiku-5-5**: 11 agent · 22 calls · out 14,868 · in 44 · cache_read 1,409,542 · cache_create 775,124


### S4 round 3 — wf_dffd9b08-09b — wf_dffd9b08-09b (20 agent, 90,702 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 30 | 29,148 | 60 | 4,414,448 | 363 |
| review:measurement | claude-opus-5-5 | 10 | 16,594 | 20 | 1,258,617 | 179 |
| synthesize:report | claude-sonnet-5-5 | 5 | 10,026 | 10 | 470,633 | 91 |
| review:conventions | claude-opus-5-5 | 15 | 9,394 | 30 | 1,675,326 | 121 |
| triage | claude-sonnet-5-5 | 2 | 4,301 | 4 | 91,655 | 34 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,534 | 4 | 121,714 | 235 |
| refute:dem.mjs | claude-sonnet-5-5 | 5 | 2,224 | 10 | 375,214 | 29 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,176 | 4 | 121,705 | 209 |
| machine:node --test "scripts/kiem-cheo/test/*.te | claude-haiku-5-5 | 2 | 1,863 | 4 | 121,714 | 12 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 1,738 | 8 | 276,275 | 24 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,519 | 4 | 86,679 | 200 |
| machine:node _acceptance/kiem-cheo-sau-gop/rang/ | claude-haiku-5-5 | 2 | 1,481 | 4 | 121,724 | 31 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,418 | 4 | 121,689 | 9 |
| machine:node --test scripts/dieu-phoi/test/lich. | claude-haiku-5-5 | 2 | 1,322 | 4 | 121,712 | 8 |
| machine:node _acceptance/kiem-cheo-sau-gop/rang/ | claude-haiku-5-5 | 2 | 1,224 | 4 | 121,726 | 9 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,014 | 4 | 121,744 | 63 |
| machine:node _acceptance/kiem-cheo-sau-gop/rang/ | claude-haiku-5-5 | 2 | 852 | 4 | 121,723 | 17 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 802 | 4 | 121,687 | 24 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 706 | 4 | 121,683 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 366 | 4 | 85,944 | 7 |


wall: 909s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,738 | 276,275 | 24 | 13:15:30 | 13:15:55 |
| machine | 12 | 16,911 | 1,425,500 | 747 | 13:15:30 | 13:27:58 |
| review | 3 | 55,136 | 7,348,391 | 365 | 13:15:30 | 13:21:35 |
| triage | 1 | 4,301 | 91,655 | 34 | 13:27:58 | 13:28:32 |
| refute | 1 | 2,224 | 375,214 | 29 | 13:28:32 | 13:29:01 |
| capture | 1 | 366 | 85,944 | 7 | 13:29:01 | 13:29:08 |
| synthesize | 1 | 10,026 | 470,633 | 91 | 13:29:08 | 13:30:39 |

- **claude-opus-5-5**: 3 agent · 55 calls · out 55,136 · in 110 · cache_read 7,348,391 · cache_create 436,470
- **claude-sonnet-5-5**: 5 agent · 18 calls · out 18,655 · in 36 · cache_read 1,299,721 · cache_create 511,212
- **claude-haiku-5-5**: 12 agent · 24 calls · out 16,911 · in 48 · cache_read 1,425,500 · cache_create 729,252

