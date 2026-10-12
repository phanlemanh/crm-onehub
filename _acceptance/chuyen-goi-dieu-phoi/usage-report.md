### S4 round 1 — wf_7d253870-f12 (28 agent, 248,259 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 75 | 52,075 | 150 | 15,672,902 | 661 |
| review:measurement | claude-opus-5-5 | 40 | 39,178 | 80 | 7,146,870 | 471 |
| refute:goi-vang.mjs | claude-sonnet-5-5 | 17 | 25,331 | 34 | 2,207,251 | 248 |
| review:conventions | claude-opus-5-5 | 30 | 20,654 | 60 | 4,552,031 | 254 |
| triage | claude-sonnet-5-5 | 2 | 17,147 | 4 | 98,630 | 125 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 17 | 16,021 | 34 | 1,753,709 | 970 |
| refute:khong-do-them.mjs | claude-sonnet-5-5 | 14 | 14,678 | 28 | 1,549,640 | 145 |
| synthesize:report | claude-sonnet-5-5 | 4 | 13,720 | 8 | 371,814 | 93 |
| refute:thay-boi.mjs | claude-sonnet-5-5 | 15 | 9,259 | 30 | 1,653,441 | 110 |
| refute:hook.mjs | claude-sonnet-5-5 | 5 | 6,406 | 10 | 439,256 | 58 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 3,620 | 4 | 127,078 | 74 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,776 | 4 | 127,023 | 14 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 2,722 | 4 | 127,063 | 18 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,695 | 4 | 127,048 | 230 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,656 | 4 | 127,039 | 254 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 2,644 | 8 | 295,130 | 28 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 2,476 | 4 | 127,066 | 34 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 2,048 | 4 | 127,063 | 12 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,848 | 4 | 127,063 | 16 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,608 | 4 | 127,063 | 13 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,569 | 4 | 127,060 | 12 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,541 | 4 | 127,060 | 11 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,463 | 4 | 127,063 | 74 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,127 | 4 | 127,065 | 33 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 828 | 4 | 92,013 | 212 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 788 | 4 | 127,021 | 21 |
| capture:provenance | claude-sonnet-5-5 | 2 | 695 | 4 | 90,806 | 18 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 686 | 4 | 127,017 | 8 |


wall: 2269s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,644 | 295,130 | 28 | 05:45:23 | 05:45:52 |
| machine | 17 | 46,472 | 3,751,514 | 1782 | 05:45:23 | 06:15:06 |
| review | 3 | 111,907 | 27,371,803 | 673 | 05:45:23 | 05:56:37 |
| triage | 1 | 17,147 | 98,630 | 125 | 06:15:06 | 06:17:11 |
| refute | 4 | 55,674 | 5,849,588 | 251 | 06:17:11 | 06:21:22 |
| capture | 1 | 695 | 90,806 | 18 | 06:21:22 | 06:21:39 |
| synthesize | 1 | 13,720 | 371,814 | 93 | 06:21:39 | 06:23:12 |

- **claude-opus-5-5**: 3 agent · 145 calls · out 111,907 · in 290 · cache_read 27,371,803 · cache_create 657,395
- **claude-sonnet-5-5**: 8 agent · 63 calls · out 89,880 · in 126 · cache_read 6,705,968 · cache_create 882,525
- **claude-haiku-5-5**: 17 agent · 49 calls · out 46,472 · in 98 · cache_read 3,751,514 · cache_create 1,146,099

### S4 round 2 — wf_0254c092-706 (24 agent, 160,710 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 36 | 35,978 | 72 | 5,398,485 | 443 |
| review:bugs | claude-opus-5-5 | 16 | 33,780 | 32 | 2,192,124 | 390 |
| review:measurement | claude-opus-5-5 | 15 | 23,148 | 30 | 1,898,471 | 249 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 19 | 15,938 | 38 | 1,957,640 | 1142 |
| triage | claude-sonnet-5-5 | 2 | 11,314 | 4 | 97,482 | 83 |
| synthesize:report | claude-sonnet-5-5 | 4 | 10,617 | 8 | 377,370 | 71 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 4,919 | 4 | 127,019 | 21 |
| baseline:diffBase | claude-sonnet-5-5 | 5 | 4,183 | 10 | 401,489 | 42 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 3,117 | 4 | 127,074 | 72 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,883 | 4 | 127,059 | 12 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,847 | 4 | 127,056 | 11 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,643 | 4 | 127,062 | 33 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,604 | 4 | 127,059 | 45 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,463 | 4 | 127,059 | 15 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,376 | 4 | 127,035 | 249 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,371 | 4 | 127,061 | 34 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,289 | 4 | 127,056 | 10 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 1,088 | 4 | 127,059 | 10 |
| machine:bun _acceptance/chuyen-goi-dieu-phoi/ran | claude-haiku-5-5 | 2 | 948 | 4 | 127,059 | 71 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 909 | 4 | 127,044 | 230 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 879 | 4 | 127,017 | 22 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 682 | 4 | 127,013 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 505 | 4 | 90,802 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 229 | 4 | 92,009 | 208 |


wall: 2115s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,183 | 401,489 | 42 | 06:29:52 | 06:30:34 |
| machine | 17 | 41,185 | 3,955,381 | 1951 | 06:29:52 | 07:02:23 |
| review | 3 | 92,906 | 9,489,080 | 443 | 06:29:52 | 06:37:15 |
| triage | 1 | 11,314 | 97,482 | 83 | 07:02:23 | 07:03:46 |
| capture | 1 | 505 | 90,802 | 10 | 07:03:46 | 07:03:56 |
| synthesize | 1 | 10,617 | 377,370 | 71 | 07:03:56 | 07:05:08 |

- **claude-opus-5-5**: 3 agent · 67 calls · out 92,906 · in 134 · cache_read 9,489,080 · cache_create 473,789
- **claude-haiku-5-5**: 17 agent · 51 calls · out 41,185 · in 102 · cache_read 3,955,381 · cache_create 1,144,383
- **claude-sonnet-5-5**: 4 agent · 13 calls · out 26,619 · in 26 · cache_read 967,143 · cache_create 454,362

