### S4 round 1 — wf_b4473126-bd7 (24 agent, 83,105 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 17 | 15,036 | 34 | 2,079,090 | 183 |
| review:measurement | claude-opus-5-5 | 7 | 9,875 | 14 | 731,185 | 107 |
| synthesize:report | claude-sonnet-5-5 | 4 | 8,943 | 8 | 359,367 | 62 |
| review:conventions | claude-opus-5-5 | 10 | 6,147 | 20 | 1,035,252 | 76 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 6 | 5,853 | 50 | 412,194 | 75 |
| baseline:diffBase | claude-sonnet-5-5 | 7 | 4,002 | 14 | 619,588 | 66 |
| ui:E1 | claude-sonnet-5-5 | 6 | 3,809 | 12 | 520,182 | 84 |
| ui:E4 | claude-sonnet-5-5 | 8 | 3,674 | 16 | 747,978 | 123 |
| ui:E2 | claude-sonnet-5-5 | 6 | 3,649 | 12 | 538,812 | 101 |
| ui:E3 | claude-sonnet-5-5 | 5 | 2,681 | 10 | 410,682 | 50 |
| triage | claude-sonnet-5-5 | 2 | 2,349 | 4 | 98,270 | 20 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,121 | 18 | 99,122 | 85 |
| machine:git diff --quiet $(git merge-base HEAD o | claude-haiku-4-5-20251001 | 2 | 2,107 | 18 | 99,270 | 30 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,035 | 18 | 99,096 | 256 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,013 | 18 | 99,060 | 322 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,832 | 18 | 99,090 | 249 |
| machine:node ${CLAUDE_PLUGIN_ROOT:-$(node script | claude-haiku-4-5-20251001 | 2 | 1,417 | 18 | 99,162 | 16 |
| refute:khong-cham-noi-goi.mjs | claude-sonnet-5-5 | 2 | 1,014 | 4 | 128,977 | 12 |
| refute:khong-cham-noi-goi.mjs | claude-sonnet-5-5 | 3 | 1,006 | 6 | 230,851 | 15 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 949 | 18 | 99,097 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 802 | 18 | 99,073 | 13 |
| refute:khong-cham-noi-goi.mjs | claude-sonnet-5-5 | 2 | 650 | 4 | 94,236 | 11 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 636 | 18 | 99,075 | 34 |
| capture:provenance | claude-sonnet-5-5 | 2 | 505 | 4 | 93,912 | 9 |


wall: 1143s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,002 | 619,588 | 66 | 02:19:52 | 02:20:58 |
| machine | 10 | 19,765 | 1,304,239 | 1035 | 02:19:52 | 02:37:07 |
| ui | 4 | 13,813 | 2,217,654 | 128 | 02:19:52 | 02:21:59 |
| review | 3 | 31,058 | 3,845,527 | 184 | 02:19:52 | 02:22:56 |
| triage | 1 | 2,349 | 98,270 | 20 | 02:37:07 | 02:37:26 |
| refute | 3 | 2,670 | 454,064 | 17 | 02:37:26 | 02:37:44 |
| capture | 1 | 505 | 93,912 | 9 | 02:37:44 | 02:37:53 |
| synthesize | 1 | 8,943 | 359,367 | 62 | 02:37:53 | 02:38:55 |

- **claude-opus-5-5**: 3 agent · 34 calls · out 31,058 · in 68 · cache_read 3,845,527 · cache_create 332,297
- **claude-sonnet-5-5**: 11 agent · 47 calls · out 32,282 · in 94 · cache_read 3,842,855 · cache_create 1,125,854
- **claude-haiku-4-5-20251001**: 10 agent · 24 calls · out 19,765 · in 212 · cache_read 1,304,239 · cache_create 487,151

### S4 round 2 — wf_2c8027d8-280 (21 agent, 79,699 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 7 | 10,410 | 14 | 772,640 | 113 |
| synthesize:report | claude-sonnet-5-5 | 3 | 10,293 | 6 | 241,090 | 66 |
| review:bugs | claude-opus-5-5 | 15 | 9,228 | 30 | 1,809,561 | 118 |
| review:conventions | claude-opus-5-5 | 11 | 8,748 | 22 | 1,187,485 | 108 |
| baseline:diffBase | claude-sonnet-5-5 | 10 | 6,174 | 20 | 849,974 | 1155 |
| ui:E1 | claude-sonnet-5-5 | 7 | 3,911 | 14 | 631,238 | 60 |
| triage | claude-sonnet-5-5 | 2 | 3,656 | 4 | 100,579 | 44 |
| ui:E2 | claude-sonnet-5-5 | 6 | 3,476 | 12 | 568,895 | 95 |
| ui:E4 | claude-sonnet-5-5 | 6 | 3,432 | 12 | 564,272 | 82 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,422 | 18 | 99,418 | 51 |
| ui:E3 | claude-sonnet-5-5 | 5 | 2,824 | 10 | 448,152 | 112 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 6 | 2,253 | 50 | 416,645 | 144 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,171 | 18 | 99,067 | 304 |
| machine:git diff --quiet $(git merge-base HEAD o | claude-haiku-4-5-20251001 | 2 | 2,153 | 18 | 99,277 | 32 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,642 | 18 | 99,439 | 261 |
| machine:node ${CLAUDE_PLUGIN_ROOT:-$(node script | claude-haiku-4-5-20251001 | 2 | 1,399 | 18 | 99,169 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,356 | 18 | 99,418 | 18 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,294 | 18 | 99,433 | 237 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 827 | 18 | 99,104 | 12 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 619 | 18 | 99,416 | 11 |
| capture:provenance | claude-sonnet-5-5 | 2 | 411 | 4 | 94,344 | 18 |


wall: 1239s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 6,174 | 849,974 | 1155 | 02:41:36 | 03:00:52 |
| machine | 10 | 17,136 | 1,310,386 | 1025 | 02:41:36 | 02:58:41 |
| ui | 4 | 13,643 | 2,212,557 | 114 | 02:41:36 | 02:43:31 |
| review | 3 | 28,386 | 3,769,686 | 120 | 02:41:36 | 02:43:36 |
| triage | 1 | 3,656 | 100,579 | 44 | 02:58:41 | 02:59:25 |
| capture | 1 | 411 | 94,344 | 18 | 03:00:52 | 03:01:10 |
| synthesize | 1 | 10,293 | 241,090 | 66 | 03:01:10 | 03:02:16 |

- **claude-opus-5-5**: 3 agent · 33 calls · out 28,386 · in 66 · cache_read 3,769,686 · cache_create 350,533
- **claude-sonnet-5-5**: 8 agent · 41 calls · out 34,177 · in 82 · cache_read 3,498,544 · cache_create 910,664
- **claude-haiku-4-5-20251001**: 10 agent · 24 calls · out 17,136 · in 212 · cache_read 1,310,386 · cache_create 483,035

