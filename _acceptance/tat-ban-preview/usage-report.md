### S4 round 1 — wf_12e87ba0-367 (28 agent, 38,805 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 8,867 | 8 | 171,291 | 71 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,281 | 4 | 34,084 | 26 |
| triage | claude-sonnet-5-5 | 2 | 3,263 | 4 | 35,736 | 24 |
| review:bugs | claude-opus-5-5 | 18 | 2,486 | 36 | 1,085,769 | 200 |
| judge:E11:domain-correctness | claude-sonnet-5-5 | 2 | 2,459 | 4 | 31,377 | 18 |
| review:measurement | claude-opus-5-5 | 5 | 2,197 | 10 | 178,783 | 131 |
| judge:E11:spec-alignment | claude-sonnet-5-5 | 3 | 2,193 | 8 | 101,279 | 21 |
| judge:E11:operational-feasibility | claude-sonnet-5-5 | 2 | 2,106 | 4 | 34,741 | 17 |
| review:conventions | claude-opus-5-5 | 13 | 1,990 | 26 | 782,179 | 112 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,364 | 4 | 34,086 | 9 |
| refute:vercel-preview.mjs | claude-sonnet-5-5 | 7 | 1,125 | 14 | 226,709 | 28 |
| refute:vercel-doc.mjs | claude-sonnet-5-5 | 7 | 1,029 | 14 | 231,021 | 47 |
| machine:bun _acceptance/tat-ban-preview/rang/pha | claude-haiku-5-5 | 2 | 867 | 4 | 34,115 | 10 |
| machine:bun _acceptance/tat-ban-preview/rang/ver | claude-haiku-5-5 | 2 | 613 | 4 | 34,119 | 13 |
| machine:bun _acceptance/tat-ban-preview/rang/ver | claude-haiku-5-5 | 2 | 574 | 4 | 34,117 | 12 |
| machine:bun _acceptance/tat-ban-preview/rang/goc | claude-haiku-5-5 | 2 | 562 | 4 | 34,117 | 9 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 477 | 4 | 2,869 | 316 |
| machine:bun _acceptance/tat-ban-preview/rang/ver | claude-haiku-5-5 | 2 | 472 | 4 | 34,116 | 10 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 469 | 4 | 37,758 | 38 |
| machine:bun _acceptance/tat-ban-preview/rang/goc | claude-haiku-5-5 | 2 | 436 | 4 | 34,119 | 9 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 358 | 4 | 34,111 | 299 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 299 | 4 | 34,141 | 65 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 298 | 4 | 31,217 | 293 |
| machine:cd apps/agent-okr && CRM_TELEMETRY_DISAB | claude-haiku-5-5 | 2 | 227 | 4 | 34,181 | 6 |
| machine:cd apps/agent-okr && CRM_TELEMETRY_DISAB | claude-haiku-5-5 | 2 | 226 | 4 | 34,157 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 34,080 | 7 |
| machine:cd apps/agent-okr && CRM_TELEMETRY_DISAB | claude-haiku-5-5 | 2 | 201 | 4 | 34,152 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 30,005 | 6 |


wall: 1183s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 469 | 37,758 | 38 | 05:23:30 | 05:24:08 |
| machine | 16 | 10,470 | 511,781 | 1027 | 05:23:30 | 05:40:37 |
| judge | 3 | 6,758 | 167,397 | 23 | 05:23:30 | 05:23:53 |
| review | 3 | 6,673 | 2,046,731 | 202 | 05:23:30 | 05:26:52 |
| triage | 1 | 3,263 | 35,736 | 24 | 05:40:39 | 05:41:03 |
| refute | 2 | 2,154 | 457,730 | 47 | 05:41:05 | 05:41:52 |
| capture | 1 | 151 | 30,005 | 6 | 05:41:54 | 05:42:00 |
| synthesize | 1 | 8,867 | 171,291 | 71 | 05:42:02 | 05:43:13 |

- **claude-sonnet-5-5**: 9 agent · 31 calls · out 21,662 · in 64 · cache_read 899,917 · cache_create 465,552
- **claude-haiku-5-5**: 16 agent · 32 calls · out 10,470 · in 64 · cache_read 511,781 · cache_create 555,574
- **claude-opus-5-5**: 3 agent · 36 calls · out 6,673 · in 72 · cache_read 2,046,731 · cache_create 229,778

### S4 round 2 — wf_17df7964-c3c (22 agent, 22,093 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 8,069 | 6 | 103,371 | 50 |
| judge:E11:operational-feasibility | claude-sonnet-5-5 | 3 | 3,141 | 8 | 101,283 | 23 |
| judge:E11:spec-alignment | claude-sonnet-5-5 | 2 | 2,043 | 4 | 34,739 | 16 |
| judge:E11:domain-correctness | claude-sonnet-5-5 | 2 | 1,763 | 4 | 31,377 | 17 |
| review:measurement | claude-opus-5-5 | 6 | 1,554 | 12 | 208,455 | 45 |
| machine:bun _acceptance/tat-ban-preview/rang/ver | claude-haiku-5-5 | 2 | 544 | 4 | 34,119 | 10 |
| machine:bun _acceptance/tat-ban-preview/rang/ver | claude-haiku-5-5 | 2 | 508 | 4 | 34,117 | 11 |
| machine:bun _acceptance/tat-ban-preview/rang/goc | claude-haiku-5-5 | 2 | 506 | 4 | 34,117 | 8 |
| machine:bun _acceptance/tat-ban-preview/rang/ver | claude-haiku-5-5 | 2 | 491 | 4 | 34,116 | 9 |
| review:bugs | claude-opus-5-5 | 10 | 417 | 20 | 421,485 | 65 |
| review:conventions | claude-opus-5-5 | 7 | 362 | 14 | 257,036 | 28 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 337 | 4 | 35,981 | 31 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 302 | 4 | 34,111 | 294 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 301 | 4 | 34,141 | 65 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 299 | 4 | 34,086 | 295 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 292 | 4 | 34,084 | 20 |
| machine:bun _acceptance/tat-ban-preview/rang/goc | claude-haiku-5-5 | 2 | 286 | 4 | 34,119 | 7 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 270 | 4 | 34,086 | 6 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 230 | 4 | 2,869 | 317 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 34,080 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 30,005 | 7 |
| machine:bun _acceptance/tat-ban-preview/rang/pha | claude-haiku-5-5 | 2 | 12 | 4 | 34,115 | 8 |


wall: 1077s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 337 | 35,981 | 31 | 05:45:01 | 05:45:32 |
| machine | 13 | 4,256 | 412,160 | 1016 | 05:45:01 | 06:01:57 |
| judge | 3 | 6,947 | 167,399 | 26 | 05:45:01 | 05:45:26 |
| review | 3 | 2,333 | 886,976 | 67 | 05:45:01 | 05:46:08 |
| capture | 1 | 151 | 30,005 | 7 | 06:01:59 | 06:02:05 |
| synthesize | 1 | 8,069 | 103,371 | 50 | 06:02:07 | 06:02:58 |

- **claude-sonnet-5-5**: 6 agent · 14 calls · out 15,504 · in 30 · cache_read 336,756 · cache_create 336,067
- **claude-opus-5-5**: 3 agent · 23 calls · out 2,333 · in 46 · cache_read 886,976 · cache_create 165,281
- **claude-haiku-5-5**: 13 agent · 26 calls · out 4,256 · in 52 · cache_read 412,160 · cache_create 456,196

