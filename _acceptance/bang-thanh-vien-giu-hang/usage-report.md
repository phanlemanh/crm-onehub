### S4 round 1 — wf_41ff8955-17b (14 agent, 84,249 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 24,831 | 4 | 101,503 | 282 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 16 | 11,055 | 32 | 1,702,757 | 229 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 21 | 10,131 | 42 | 2,389,471 | 266 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 11 | 8,926 | 22 | 1,122,247 | 166 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 9 | 7,741 | 18 | 972,923 | 131 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 11 | 5,396 | 22 | 1,146,438 | 97 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 7 | 4,933 | 14 | 684,826 | 97 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 2,743 | 4 | 92,338 | 41 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 2,726 | 4 | 89,830 | 42 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,482 | 18 | 89,742 | 35 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,373 | 18 | 89,667 | 19 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 4 | 1,117 | 34 | 205,050 | 118 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 931 | 18 | 89,667 | 29 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 864 | 18 | 89,665 | 15 |


wall: 805s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 14 | 84,249 | 8,866,124 | 805 | 09:22:13 | 09:35:38 |

- **claude-sonnet-5**: 6 agent · 54 calls · out 60,412 · in 108 · cache_read 5,498,146 · cache_create 703,054
- **claude-opus-5-5**: 3 agent · 27 calls · out 18,070 · in 54 · cache_read 2,804,187 · cache_create 340,495
- **claude-haiku-4-5-20251001**: 5 agent · 12 calls · out 5,767 · in 106 · cache_read 563,791 · cache_create 251,075

### S4 round 2 — wf_5dd2b579-0f0 (13 agent, 69,452 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 16,335 | 4 | 102,142 | 176 |
| review:measurement | claude-opus-5-5 | 11 | 13,546 | 22 | 1,177,601 | 159 |
| ui:E8 | claude-sonnet-5 | 19 | 11,541 | 38 | 2,201,275 | 276 |
| baseline:diffBase | claude-sonnet-5 | 13 | 5,736 | 26 | 1,200,020 | 154 |
| review:conventions | claude-opus-5-5 | 10 | 5,641 | 20 | 962,489 | 77 |
| review:bugs | claude-opus-5-5 | 6 | 5,457 | 12 | 557,194 | 65 |
| triage | claude-sonnet-5 | 2 | 4,767 | 4 | 92,038 | 68 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 1,449 | 42 | 265,316 | 121 |
| machine:APP_URL=${APP_URL:-http://localhost:3500 | claude-haiku-4-5-20251001 | 2 | 1,349 | 18 | 89,062 | 30 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 998 | 18 | 89,094 | 29 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 923 | 18 | 89,094 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 869 | 18 | 89,092 | 16 |
| capture:provenance | claude-sonnet-5 | 2 | 841 | 4 | 89,181 | 25 |


wall: 553s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,736 | 1,200,020 | 154 | 09:38:41 | 09:41:15 |
| machine | 5 | 5,588 | 621,658 | 192 | 09:38:41 | 09:41:53 |
| ui | 1 | 11,541 | 2,201,275 | 276 | 09:38:41 | 09:43:17 |
| review | 3 | 24,644 | 2,697,284 | 161 | 09:38:41 | 09:41:22 |
| triage | 1 | 4,767 | 92,038 | 68 | 09:43:20 | 09:44:28 |
| capture | 1 | 841 | 89,181 | 25 | 09:44:30 | 09:44:55 |
| synthesize | 1 | 16,335 | 102,142 | 176 | 09:44:58 | 09:47:54 |

- **claude-sonnet-5**: 5 agent · 38 calls · out 39,220 · in 76 · cache_read 3,684,656 · cache_create 584,140
- **claude-opus-5-5**: 3 agent · 27 calls · out 24,644 · in 54 · cache_read 2,697,284 · cache_create 317,363
- **claude-haiku-4-5-20251001**: 5 agent · 13 calls · out 5,588 · in 114 · cache_read 621,658 · cache_create 242,548

