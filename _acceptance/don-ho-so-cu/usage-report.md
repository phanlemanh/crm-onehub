### S4 round 1 — wf_c2b18fd2-b04 (28 agent, 27,771 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5-5 | 2 | 5,782 | 4 | 42,087 | 41 |
| review:measurement | claude-opus-5-5 | 16 | 3,976 | 32 | 1,125,127 | 189 |
| review:conventions | claude-opus-5-5 | 8 | 2,639 | 16 | 412,796 | 75 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,999 | 4 | 38,449 | 76 |
| synthesize:report | claude-sonnet-5-5 | 4 | 1,676 | 8 | 192,621 | 69 |
| review:bugs | claude-opus-5-5 | 11 | 1,612 | 22 | 686,170 | 112 |
| refute:lo.json | claude-sonnet-5-5 | 4 | 1,124 | 8 | 114,018 | 19 |
| machine:bun _acceptance/don-ho-so-cu/rang/kiem-l | claude-haiku-5-5 | 2 | 1,059 | 4 | 38,429 | 10 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,052 | 4 | 38,394 | 9 |
| refute:doi-chieu.mjs | claude-sonnet-5-5 | 5 | 1,035 | 10 | 162,729 | 22 |
| refute:kiem-lo.mjs | claude-sonnet-5-5 | 6 | 1,033 | 12 | 210,681 | 31 |
| refute:lo.json | claude-sonnet-5-5 | 4 | 641 | 8 | 120,212 | 15 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 487 | 4 | 41,860 | 38 |
| machine:bun _acceptance/don-ho-so-cu/rang/kiem-k | claude-haiku-5-5 | 5 | 483 | 10 | 124,263 | 842 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 435 | 4 | 5,946 | 458 |
| refute:sua-thuoc.mjs | claude-sonnet-5-5 | 3 | 369 | 6 | 77,679 | 13 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 308 | 4 | 5,946 | 332 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 298 | 4 | 35,421 | 311 |
| machine:bun _acceptance/don-ho-so-cu/rang/ca-goi | claude-haiku-5-5 | 2 | 259 | 4 | 38,431 | 11 |
| machine:bun _acceptance/don-ho-so-cu/rang/sua-th | claude-haiku-5-5 | 2 | 245 | 4 | 38,435 | 7 |
| machine:bun _acceptance/don-ho-so-cu/rang/doi-ch | claude-haiku-5-5 | 2 | 243 | 4 | 38,429 | 16 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 214 | 4 | 38,388 | 8 |
| machine:bun _acceptance/don-ho-so-cu/rang/so-xu- | claude-haiku-5-5 | 2 | 213 | 4 | 38,430 | 8 |
| machine:bun _acceptance/don-ho-so-cu/rang/sua-th | claude-haiku-5-5 | 2 | 209 | 4 | 38,429 | 8 |
| machine:bun _acceptance/don-ho-so-cu/rang/cay-ho | claude-haiku-5-5 | 2 | 200 | 4 | 38,430 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 34,207 | 5 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 28 | 4 | 38,392 | 33 |
| machine:bun _acceptance/don-ho-so-cu/rang/cong-g | claude-haiku-5-5 | 2 | 6 | 4 | 38,427 | 108 |


wall: 1400s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 487 | 41,860 | 39 | 23:54:15 | 23:54:54 |
| machine | 16 | 7,251 | 632,639 | 1241 | 23:54:15 | 00:14:57 |
| review | 3 | 8,227 | 2,224,093 | 200 | 23:54:15 | 23:57:36 |
| triage | 1 | 5,782 | 42,087 | 41 | 00:14:59 | 00:15:39 |
| refute | 5 | 4,202 | 685,319 | 35 | 00:15:42 | 00:16:16 |
| capture | 1 | 146 | 34,207 | 5 | 00:16:18 | 00:16:24 |
| synthesize | 1 | 1,676 | 192,621 | 69 | 00:16:26 | 00:17:35 |

- **claude-sonnet-5-5**: 9 agent · 32 calls · out 12,293 · in 64 · cache_read 996,094 · cache_create 420,271
- **claude-opus-5-5**: 3 agent · 35 calls · out 8,227 · in 70 · cache_read 2,224,093 · cache_create 264,348
- **claude-haiku-5-5**: 16 agent · 35 calls · out 7,251 · in 70 · cache_read 632,639 · cache_create 681,607

### S4 round 2 — wf_44600cd1-5d5 (25 agent, 30,728 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 10,489 | 6 | 118,413 | 64 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,070 | 4 | 38,470 | 31 |
| review:measurement | claude-opus-5-5 | 16 | 2,458 | 32 | 1,065,006 | 234 |
| triage | claude-sonnet-5-5 | 2 | 1,958 | 4 | 39,588 | 15 |
| review:bugs | claude-opus-5-5 | 24 | 1,850 | 48 | 1,650,360 | 164 |
| review:conventions | claude-opus-5-5 | 24 | 1,469 | 48 | 1,560,520 | 149 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,459 | 4 | 38,472 | 10 |
| refute:doi-chieu.mjs | claude-sonnet-5-5 | 4 | 996 | 8 | 125,872 | 27 |
| refute:cong-gop.mjs | claude-sonnet-5-5 | 3 | 889 | 6 | 78,933 | 17 |
| refute:cong-gop.mjs | claude-sonnet-5-5 | 4 | 883 | 8 | 121,279 | 20 |
| refute:cong-gop.mjs | claude-sonnet-5-5 | 3 | 837 | 6 | 74,738 | 15 |
| machine:bun _acceptance/don-ho-so-cu/rang/cong-g | claude-haiku-5-5 | 5 | 573 | 10 | 84,344 | 985 |
| refute:doi-chieu.mjs | claude-sonnet-5-5 | 4 | 513 | 8 | 122,364 | 19 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 450 | 4 | 5,946 | 446 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 362 | 4 | 40,278 | 32 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 301 | 4 | 5,946 | 319 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 297 | 4 | 35,499 | 291 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 279 | 4 | 38,527 | 73 |
| machine:bun _acceptance/don-ho-so-cu/rang/doi-ch | claude-haiku-5-5 | 2 | 264 | 4 | 38,507 | 16 |
| machine:bun _acceptance/don-ho-so-cu/rang/kiem-l | claude-haiku-5-5 | 2 | 258 | 4 | 38,507 | 7 |
| machine:bun _acceptance/don-ho-so-cu/rang/sua-th | claude-haiku-5-5 | 2 | 245 | 4 | 38,513 | 7 |
| machine:bun _acceptance/don-ho-so-cu/rang/so-xu- | claude-haiku-5-5 | 2 | 236 | 4 | 38,508 | 7 |
| machine:bun _acceptance/don-ho-so-cu/rang/sua-th | claude-haiku-5-5 | 2 | 229 | 4 | 38,507 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 214 | 4 | 38,466 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 34,285 | 6 |


wall: 1317s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 362 | 40,278 | 32 | 00:36:36 | 00:37:09 |
| machine | 13 | 7,875 | 478,212 | 1192 | 00:36:37 | 00:56:29 |
| review | 3 | 5,777 | 4,275,886 | 235 | 00:36:37 | 00:40:31 |
| triage | 1 | 1,958 | 39,588 | 15 | 00:56:31 | 00:56:46 |
| refute | 5 | 4,118 | 523,186 | 30 | 00:56:48 | 00:57:18 |
| capture | 1 | 149 | 34,285 | 6 | 00:57:21 | 00:57:27 |
| synthesize | 1 | 10,489 | 118,413 | 64 | 00:57:29 | 00:58:33 |

- **claude-sonnet-5-5**: 9 agent · 27 calls · out 17,076 · in 54 · cache_read 755,750 · cache_create 410,672
- **claude-haiku-5-5**: 13 agent · 29 calls · out 7,875 · in 58 · cache_read 478,212 · cache_create 616,704
- **claude-opus-5-5**: 3 agent · 64 calls · out 5,777 · in 128 · cache_read 4,275,886 · cache_create 269,201

