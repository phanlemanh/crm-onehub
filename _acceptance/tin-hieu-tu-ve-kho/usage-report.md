### S4 round 1 — wf_6b9a5889-b89 (32 agent, 59,452 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 10,966 | 6 | 271,328 | 117 |
| triage | claude-sonnet-5-5 | 2 | 5,296 | 4 | 104,669 | 40 |
| review:measurement | claude-opus-5-5 | 23 | 4,954 | 46 | 3,601,972 | 284 |
| review:conventions | claude-opus-5-5 | 29 | 3,441 | 58 | 5,170,450 | 222 |
| judge:E11b:domain-correctness | claude-sonnet-5-5 | 3 | 3,326 | 6 | 211,916 | 33 |
| ui:E1b | claude-sonnet-5-5 | 6 | 2,858 | 12 | 540,709 | 79 |
| judge:E11b:spec-alignment | claude-sonnet-5-5 | 3 | 2,000 | 6 | 247,391 | 28 |
| review:bugs | claude-opus-5-5 | 34 | 1,999 | 68 | 4,916,128 | 219 |
| judge:E11b:operational-feasibility | claude-sonnet-5-5 | 3 | 1,951 | 6 | 247,963 | 27 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,928 | 4 | 133,381 | 237 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,819 | 4 | 133,896 | 261 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,817 | 4 | 133,410 | 33 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,782 | 4 | 133,426 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,709 | 4 | 133,871 | 15 |
| machine:for f in "apps/app/app/(app)/[slug]/sett | claude-haiku-5-5 | 2 | 1,519 | 4 | 133,527 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,446 | 4 | 133,423 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,404 | 4 | 133,426 | 21 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,281 | 4 | 133,887 | 300 |
| refute:tin-hieu-keo-ve.yml | claude-sonnet-5-5 | 4 | 1,194 | 8 | 312,860 | 21 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,067 | 4 | 133,869 | 48 |
| machine:bun _acceptance/tin-hieu-tu-ve-kho/rang/ | claude-haiku-5-5 | 2 | 952 | 4 | 133,426 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 898 | 4 | 133,480 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 862 | 4 | 133,423 | 18 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 597 | 4 | 133,926 | 78 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 569 | 4 | 107,386 | 68 |
| machine:node _acceptance/tin-hieu-tu-ve-kho/rang | claude-haiku-5-5 | 2 | 540 | 4 | 133,416 | 86 |
| machine:bun _acceptance/tin-hieu-tu-ve-kho/rang/ | claude-haiku-5-5 | 2 | 402 | 4 | 133,422 | 14 |
| machine:bun test scripts/tin-hieu/test/lich.test | claude-haiku-5-5 | 2 | 192 | 4 | 133,402 | 21 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 188 | 4 | 133,865 | 14 |
| machine:bun test scripts/tin-hieu/test/keo-ve-li | claude-haiku-5-5 | 2 | 173 | 4 | 133,420 | 18 |
| machine:cd apps/app && bun test --timeout 10000 | claude-haiku-5-5 | 2 | 171 | 4 | 133,444 | 19 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 97,680 | 8 |


wall: 1159s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 569 | 107,386 | 68 | 04:43:32 | 04:44:41 |
| machine | 20 | 20,747 | 2,671,340 | 964 | 04:43:32 | 04:59:37 |
| ui | 1 | 2,858 | 540,709 | 79 | 04:43:56 | 04:45:15 |
| judge | 3 | 7,277 | 707,270 | 33 | 04:43:56 | 04:44:29 |
| review | 3 | 10,394 | 13,688,550 | 285 | 04:43:59 | 04:48:44 |
| triage | 1 | 5,296 | 104,669 | 40 | 04:59:39 | 05:00:19 |
| refute | 1 | 1,194 | 312,860 | 21 | 05:00:21 | 05:00:42 |
| capture | 1 | 151 | 97,680 | 8 | 05:00:45 | 05:00:52 |
| synthesize | 1 | 10,966 | 271,328 | 117 | 05:00:54 | 05:02:51 |

- **claude-sonnet-5-5**: 9 agent · 28 calls · out 28,311 · in 56 · cache_read 2,141,902 · cache_create 1,011,609
- **claude-opus-5-5**: 3 agent · 86 calls · out 10,394 · in 172 · cache_read 13,688,550 · cache_create 523,086
- **claude-haiku-5-5**: 20 agent · 40 calls · out 20,747 · in 80 · cache_read 2,671,340 · cache_create 1,418,643

### S4 round 2 — wf_4fbb3380-c56 (33 agent, 65,735 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 14,571 | 8 | 414,088 | 103 |
| triage | claude-sonnet-5-5 | 2 | 4,592 | 4 | 104,104 | 33 |
| review:measurement | claude-opus-5-5 | 21 | 3,996 | 42 | 3,306,770 | 246 |
| judge:E11b:domain-correctness | claude-sonnet-5-5 | 3 | 3,732 | 6 | 211,515 | 30 |
| ui:E1b | claude-sonnet-5-5 | 6 | 3,184 | 12 | 543,596 | 64 |
| review:conventions | claude-opus-5-5 | 25 | 2,278 | 50 | 3,560,088 | 173 |
| machine:for f in "apps/app/app/(app)/[slug]/sett | claude-haiku-5-5 | 2 | 2,264 | 4 | 133,607 | 20 |
| judge:E11b:spec-alignment | claude-sonnet-5-5 | 3 | 2,245 | 6 | 247,666 | 25 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 2,107 | 4 | 133,560 | 25 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,059 | 4 | 133,664 | 73 |
| review:bugs | claude-opus-5-5 | 34 | 2,027 | 68 | 5,215,553 | 398 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,925 | 4 | 133,490 | 31 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,793 | 4 | 98,479 | 250 |
| judge:E11b:operational-feasibility | claude-sonnet-5-5 | 3 | 1,773 | 6 | 246,848 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,761 | 4 | 133,609 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,641 | 4 | 133,506 | 22 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,578 | 4 | 133,634 | 269 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,544 | 4 | 133,503 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,497 | 4 | 133,506 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,473 | 4 | 133,503 | 18 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,255 | 4 | 133,625 | 306 |
| triage | claude-sonnet-5-5 | 2 | 1,147 | 4 | 134,682 | 12 |
| machine:bun _acceptance/tin-hieu-tu-ve-kho/rang/ | claude-haiku-5-5 | 2 | 1,007 | 4 | 133,506 | 14 |
| refute:khoa-keo-tin-hieu.spec.ts | claude-sonnet-5-5 | 5 | 903 | 10 | 416,896 | 24 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 662 | 4 | 133,607 | 26 |
| machine:bun _acceptance/tin-hieu-tu-ve-kho/rang/ | claude-haiku-5-5 | 2 | 624 | 4 | 133,502 | 17 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 554 | 4 | 107,466 | 72 |
| machine:node _acceptance/tin-hieu-tu-ve-kho/rang | claude-haiku-5-5 | 2 | 467 | 4 | 133,496 | 156 |
| machine:bun test scripts/tin-hieu/test/keo-ve-li | claude-haiku-5-5 | 2 | 373 | 4 | 133,500 | 13 |
| machine:bun test scripts/tin-hieu/test/lich.test | claude-haiku-5-5 | 2 | 193 | 4 | 133,482 | 23 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 188 | 4 | 133,603 | 35 |
| machine:cd apps/app && bun test --timeout 10000 | claude-haiku-5-5 | 2 | 171 | 4 | 133,524 | 16 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 97,418 | 7 |


wall: 1177s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 554 | 107,466 | 72 | 05:13:46 | 05:14:57 |
| machine | 20 | 24,582 | 2,635,906 | 986 | 05:13:46 | 05:30:12 |
| ui | 1 | 3,184 | 543,596 | 64 | 05:14:09 | 05:15:13 |
| judge | 3 | 7,750 | 706,029 | 30 | 05:14:10 | 05:14:40 |
| review | 3 | 8,301 | 12,082,411 | 400 | 05:14:14 | 05:20:53 |
| triage | 2 | 5,739 | 238,786 | 48 | 05:30:14 | 05:31:03 |
| refute | 1 | 903 | 416,896 | 24 | 05:31:05 | 05:31:29 |
| capture | 1 | 151 | 97,418 | 7 | 05:31:31 | 05:31:37 |
| synthesize | 1 | 14,571 | 414,088 | 103 | 05:31:39 | 05:33:23 |

- **claude-sonnet-5-5**: 10 agent · 32 calls · out 32,852 · in 64 · cache_read 2,524,279 · cache_create 1,087,873
- **claude-opus-5-5**: 3 agent · 80 calls · out 8,301 · in 160 · cache_read 12,082,411 · cache_create 510,341
- **claude-haiku-5-5**: 20 agent · 40 calls · out 24,582 · in 80 · cache_read 2,635,906 · cache_create 1,455,256

