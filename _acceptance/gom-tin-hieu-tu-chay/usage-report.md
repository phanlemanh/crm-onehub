### S4 round 1 — wf_c5856eec-e06 (27 agent, 44,207 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 11,735 | 6 | 125,869 | 74 |
| review:measurement | claude-opus-5-5 | 14 | 10,586 | 28 | 969,297 | 225 |
| triage | claude-sonnet-5-5 | 2 | 5,669 | 4 | 40,488 | 40 |
| review:conventions | claude-opus-5-5 | 8 | 2,367 | 16 | 398,733 | 84 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,260 | 4 | 36,624 | 79 |
| review:bugs | claude-opus-5-5 | 15 | 1,838 | 30 | 871,789 | 189 |
| judge:E7b:operational-feasibility | claude-sonnet-5-5 | 4 | 1,634 | 8 | 116,410 | 28 |
| judge:E7b:spec-alignment | claude-sonnet-5-5 | 3 | 1,411 | 6 | 76,984 | 14 |
| judge:E7b:domain-correctness | claude-sonnet-5-5 | 3 | 1,397 | 6 | 73,542 | 14 |
| refute:tin-hieu-gom.yml | claude-sonnet-5-5 | 5 | 791 | 10 | 146,935 | 31 |
| machine:bun _acceptance/gom-tin-hieu-tu-chay/ran | claude-haiku-5-5 | 2 | 446 | 4 | 36,616 | 9 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 439 | 4 | 40,036 | 44 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 438 | 4 | 2,973 | 434 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 301 | 4 | 2,973 | 319 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 269 | 4 | 36,567 | 22 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 255 | 4 | 33,596 | 292 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 233 | 4 | 36,569 | 8 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 230 | 4 | 36,608 | 39 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 229 | 4 | 36,603 | 36 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 229 | 4 | 36,607 | 32 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 229 | 4 | 36,606 | 28 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 226 | 4 | 36,606 | 24 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 226 | 4 | 36,608 | 41 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 226 | 4 | 36,605 | 46 |
| machine:bun test scripts/tin-hieu/test/do-gom.te | claude-haiku-5-5 | 2 | 224 | 4 | 36,601 | 49 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 173 | 4 | 36,563 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 32,383 | 7 |


wall: 1337s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 439 | 40,036 | 44 | 14:27:22 | 14:28:06 |
| machine | 16 | 6,194 | 515,325 | 1176 | 14:27:22 | 14:46:58 |
| judge | 3 | 4,442 | 266,936 | 45 | 14:27:22 | 14:28:08 |
| review | 3 | 14,791 | 2,239,819 | 230 | 14:27:54 | 14:31:44 |
| triage | 1 | 5,669 | 40,488 | 40 | 14:47:00 | 14:47:40 |
| refute | 1 | 791 | 146,935 | 31 | 14:47:43 | 14:48:14 |
| capture | 1 | 146 | 32,383 | 7 | 14:48:16 | 14:48:23 |
| synthesize | 1 | 11,735 | 125,869 | 74 | 14:48:25 | 14:49:39 |

- **claude-sonnet-5-5**: 8 agent · 24 calls · out 23,222 · in 48 · cache_read 652,647 · cache_create 364,557
- **claude-opus-5-5**: 3 agent · 37 calls · out 14,791 · in 74 · cache_read 2,239,819 · cache_create 258,857
- **claude-haiku-5-5**: 16 agent · 32 calls · out 6,194 · in 64 · cache_read 515,325 · cache_create 622,561

### S4 round 2 — wf_11ad4d95-f75 (24 agent, 29,915 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 11,290 | 10 | 253,090 | 91 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,430 | 4 | 37,328 | 33 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,052 | 4 | 2,973 | 338 |
| judge:E7b:spec-alignment | claude-sonnet-5-5 | 4 | 1,839 | 8 | 117,906 | 26 |
| triage | claude-sonnet-5-5 | 2 | 1,718 | 4 | 36,342 | 19 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,665 | 4 | 2,973 | 429 |
| judge:E7b:domain-correctness | claude-sonnet-5-5 | 3 | 1,605 | 6 | 75,062 | 17 |
| judge:E7b:operational-feasibility | claude-sonnet-5-5 | 3 | 1,519 | 6 | 79,103 | 23 |
| review:measurement | claude-opus-5-5 | 4 | 1,318 | 8 | 153,077 | 47 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 437 | 4 | 37,367 | 26 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 358 | 4 | 39,687 | 38 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 299 | 4 | 34,357 | 268 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 279 | 4 | 37,385 | 73 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 229 | 4 | 37,368 | 31 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 227 | 4 | 37,364 | 30 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 226 | 4 | 37,367 | 25 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 225 | 4 | 37,369 | 36 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 219 | 4 | 37,324 | 9 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 204 | 4 | 37,366 | 38 |
| machine:bun test scripts/tin-hieu/test/gom-lich. | claude-haiku-5-5 | 2 | 204 | 4 | 37,369 | 35 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 185 | 4 | 37,330 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 154 | 4 | 33,144 | 5 |
| review:bugs | claude-opus-5-5 | 8 | 136 | 16 | 310,835 | 49 |
| review:conventions | claude-opus-5-5 | 5 | 97 | 10 | 165,778 | 33 |


wall: 1297s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 358 | 39,687 | 38 | 15:06:24 | 15:07:02 |
| machine | 14 | 9,881 | 451,240 | 1174 | 15:06:24 | 15:25:58 |
| judge | 3 | 4,963 | 272,071 | 29 | 15:06:24 | 15:06:53 |
| review | 3 | 1,551 | 629,690 | 59 | 15:06:43 | 15:07:43 |
| triage | 1 | 1,718 | 36,342 | 19 | 15:26:00 | 15:26:19 |
| capture | 1 | 154 | 33,144 | 5 | 15:26:21 | 15:26:27 |
| synthesize | 1 | 11,290 | 253,090 | 91 | 15:26:29 | 15:28:00 |

- **claude-sonnet-5-5**: 7 agent · 21 calls · out 18,483 · in 42 · cache_read 634,334 · cache_create 324,287
- **claude-haiku-5-5**: 14 agent · 28 calls · out 9,881 · in 56 · cache_read 451,240 · cache_create 566,916
- **claude-opus-5-5**: 3 agent · 17 calls · out 1,551 · in 34 · cache_read 629,690 · cache_create 154,347

