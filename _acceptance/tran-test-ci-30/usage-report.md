### S4 round 1 — wf_011cc433-1a8 (20 agent, 33,891 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 7,212 | 10 | 211,166 | 61 |
| review:measurement | claude-opus-5-5 | 6 | 4,088 | 12 | 215,564 | 78 |
| triage | claude-sonnet-5-5 | 2 | 2,808 | 4 | 31,579 | 25 |
| review:bugs | claude-opus-5-5 | 22 | 2,224 | 44 | 1,367,812 | 315 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,088 | 4 | 30,843 | 74 |
| review:conventions | claude-opus-5-5 | 13 | 1,983 | 26 | 776,437 | 96 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,917 | 4 | 30,804 | 128 |
| judge:E4:operational-feasibility | claude-sonnet-5-5 | 2 | 1,880 | 4 | 31,144 | 19 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,828 | 4 | 30,813 | 316 |
| judge:E4:spec-alignment | claude-sonnet-5-5 | 2 | 1,705 | 4 | 31,142 | 21 |
| judge:E4:domain-correctness | claude-sonnet-5-5 | 2 | 1,669 | 4 | 27,676 | 20 |
| machine:bun _acceptance/tran-test-ci-30/rang/kie | claude-haiku-5-5 | 2 | 1,498 | 4 | 30,822 | 10 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 771 | 4 | 30,786 | 25 |
| machine:bun _acceptance/tran-test-ci-30/rang/kie | claude-haiku-5-5 | 2 | 768 | 4 | 30,822 | 8 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 583 | 4 | 30,788 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 257 | 4 | 0 | 371 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 228 | 4 | 30,945 | 27 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 219 | 4 | 30,782 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 26,607 | 18 |
| machine:bun _acceptance/tran-test-ci-30/rang/kie | claude-haiku-5-5 | 2 | 14 | 4 | 30,823 | 9 |


wall: 1054s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 228 | 30,945 | 27 | 13:18:23 | 13:18:50 |
| machine | 10 | 9,943 | 277,283 | 944 | 13:18:23 | 13:34:07 |
| judge | 3 | 5,254 | 89,962 | 26 | 13:18:23 | 13:18:49 |
| review | 3 | 8,295 | 2,359,813 | 316 | 13:18:23 | 13:23:39 |
| triage | 1 | 2,808 | 31,579 | 25 | 13:34:09 | 13:34:34 |
| capture | 1 | 151 | 26,607 | 18 | 13:34:36 | 13:34:54 |
| synthesize | 1 | 7,212 | 211,166 | 61 | 13:34:56 | 13:35:57 |

- **claude-sonnet-5-5**: 7 agent · 17 calls · out 15,653 · in 34 · cache_read 390,259 · cache_create 273,938
- **claude-opus-5-5**: 3 agent · 41 calls · out 8,295 · in 82 · cache_read 2,359,813 · cache_create 223,871
- **claude-haiku-5-5**: 10 agent · 20 calls · out 9,943 · in 40 · cache_read 277,283 · cache_create 333,379

### S4 round 2 — wf_e6daf629-501 (16 agent, 27,727 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 7,301 | 4 | 43,313 | 50 |
| triage | claude-sonnet-5-5 | 2 | 3,269 | 4 | 31,586 | 25 |
| review:measurement | claude-opus-5-5 | 14 | 2,966 | 28 | 659,403 | 124 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,046 | 4 | 30,835 | 85 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,978 | 4 | 2,973 | 511 |
| judge:E4:operational-feasibility | claude-sonnet-5-5 | 2 | 1,800 | 4 | 31,155 | 18 |
| judge:E4:domain-correctness | claude-sonnet-5-5 | 2 | 1,751 | 4 | 31,153 | 15 |
| judge:E4:spec-alignment | claude-sonnet-5-5 | 2 | 1,602 | 4 | 31,153 | 19 |
| review:conventions | claude-opus-5-5 | 18 | 1,290 | 36 | 983,129 | 122 |
| review:bugs | claude-opus-5-5 | 14 | 1,285 | 28 | 702,710 | 106 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 768 | 4 | 30,778 | 25 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 572 | 4 | 5,946 | 424 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 434 | 4 | 30,780 | 8 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 304 | 4 | 2,973 | 316 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 30,774 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 26,599 | 14 |


wall: 1485s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 7 | 6,315 | 135,059 | 1390 | 13:40:00 | 14:03:10 |
| judge | 3 | 5,153 | 93,461 | 22 | 13:40:00 | 13:40:21 |
| review | 3 | 5,541 | 2,345,242 | 125 | 13:40:00 | 13:42:05 |
| triage | 1 | 3,269 | 31,586 | 25 | 14:03:12 | 14:03:37 |
| capture | 1 | 148 | 26,599 | 14 | 14:03:39 | 14:03:53 |
| synthesize | 1 | 7,301 | 43,313 | 50 | 14:03:55 | 14:04:45 |

- **claude-sonnet-5-5**: 6 agent · 12 calls · out 15,871 · in 24 · cache_read 194,959 · cache_create 226,082
- **claude-opus-5-5**: 3 agent · 46 calls · out 5,541 · in 92 · cache_read 2,345,242 · cache_create 214,701
- **claude-haiku-5-5**: 7 agent · 14 calls · out 6,315 · in 28 · cache_read 135,059 · cache_create 293,849

### S4 round 3 — wf_c707d00e-558 (19 agent, 27,514 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 6,614 | 10 | 193,356 | 49 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,879 | 4 | 31,057 | 34 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,984 | 4 | 31,084 | 300 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,906 | 4 | 31,114 | 72 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,555 | 4 | 2,973 | 460 |
| review:bugs | claude-opus-5-5 | 29 | 1,490 | 58 | 2,179,066 | 188 |
| judge:E4:operational-feasibility | claude-sonnet-5-5 | 2 | 1,426 | 4 | 31,427 | 13 |
| judge:E4:domain-correctness | claude-sonnet-5-5 | 2 | 1,384 | 4 | 27,959 | 16 |
| judge:E4:spec-alignment | claude-sonnet-5-5 | 2 | 1,382 | 4 | 31,425 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,354 | 4 | 31,059 | 10 |
| triage | claude-sonnet-5-5 | 2 | 1,120 | 4 | 29,916 | 10 |
| review:measurement | claude-opus-5-5 | 8 | 972 | 16 | 338,548 | 66 |
| machine:bun _acceptance/tran-test-ci-30/rang/kie | claude-haiku-5-5 | 2 | 945 | 4 | 31,094 | 9 |
| machine:bun _acceptance/tran-test-ci-30/rang/kie | claude-haiku-5-5 | 2 | 517 | 4 | 31,093 | 7 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 257 | 4 | 0 | 324 |
| review:conventions | claude-opus-5-5 | 13 | 221 | 26 | 622,796 | 88 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 189 | 4 | 30,668 | 20 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 169 | 4 | 31,053 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 26,878 | 7 |


wall: 1292s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 189 | 30,668 | 20 | 17:38:27 | 17:38:47 |
| machine | 9 | 12,566 | 220,527 | 1220 | 17:38:27 | 17:58:47 |
| judge | 3 | 4,192 | 90,811 | 21 | 17:38:27 | 17:38:48 |
| review | 3 | 2,683 | 3,140,410 | 189 | 17:38:27 | 17:41:36 |
| triage | 1 | 1,120 | 29,916 | 10 | 17:58:49 | 17:58:59 |
| capture | 1 | 150 | 26,878 | 7 | 17:59:01 | 17:59:08 |
| synthesize | 1 | 6,614 | 193,356 | 49 | 17:59:10 | 17:59:59 |

- **claude-sonnet-5-5**: 7 agent · 17 calls · out 12,265 · in 34 · cache_read 371,629 · cache_create 267,672
- **claude-haiku-5-5**: 9 agent · 18 calls · out 12,566 · in 36 · cache_read 220,527 · cache_create 334,941
- **claude-opus-5-5**: 3 agent · 50 calls · out 2,683 · in 100 · cache_read 3,140,410 · cache_create 233,873

