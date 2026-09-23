### S4 round 1 — wf_dee46a14-acb (15 agent, 84,501 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 18,923 | 4 | 102,350 | 196 |
| review:measurement | claude-opus-5-5 | 8 | 12,987 | 16 | 768,514 | 139 |
| review:bugs | claude-opus-5-5 | 15 | 12,559 | 30 | 1,667,917 | 160 |
| ui:E9 | claude-sonnet-5 | 23 | 11,198 | 46 | 2,261,321 | 215 |
| triage | claude-sonnet-5 | 2 | 7,940 | 4 | 89,946 | 102 |
| baseline:diffBase | claude-sonnet-5 | 15 | 7,340 | 30 | 1,353,892 | 141 |
| review:conventions | claude-opus-5-5 | 7 | 4,929 | 14 | 582,393 | 58 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,757 | 34 | 183,038 | 69 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,574 | 18 | 86,222 | 69 |
| machine:for t in "packages/ui/src/components/dat | claude-haiku-4-5-20251001 | 2 | 1,250 | 18 | 86,267 | 18 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,037 | 18 | 86,228 | 37 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 916 | 18 | 86,183 | 26 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 718 | 18 | 86,161 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 714 | 18 | 86,163 | 13 |
| capture:provenance | claude-sonnet-5 | 2 | 659 | 4 | 85,086 | 17 |


wall: 536s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 7,340 | 1,353,892 | 141 | 00:07:15 | 00:09:36 |
| machine | 7 | 7,966 | 700,262 | 129 | 00:07:15 | 00:09:24 |
| ui | 1 | 11,198 | 2,261,321 | 215 | 00:07:15 | 00:10:51 |
| review | 3 | 30,475 | 3,018,824 | 162 | 00:07:15 | 00:09:58 |
| triage | 1 | 7,940 | 89,946 | 102 | 00:10:52 | 00:12:34 |
| capture | 1 | 659 | 85,086 | 17 | 00:12:36 | 00:12:54 |
| synthesize | 1 | 18,923 | 102,350 | 196 | 00:12:56 | 00:16:12 |

- **claude-sonnet-5**: 5 agent · 44 calls · out 46,060 · in 88 · cache_read 3,892,595 · cache_create 495,426
- **claude-opus-5-5**: 3 agent · 30 calls · out 30,475 · in 60 · cache_read 3,018,824 · cache_create 311,043
- **claude-haiku-4-5-20251001**: 7 agent · 16 calls · out 7,966 · in 142 · cache_read 700,262 · cache_create 278,451


### S4 round 2 — wf_a1b16e6d-102 (15 agent, 97,324 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 18,509 | 4 | 104,765 | 193 |
| review:measurement | claude-opus-5-5 | 7 | 17,179 | 14 | 683,286 | 175 |
| review:bugs | claude-opus-5-5 | 14 | 16,466 | 28 | 1,616,714 | 188 |
| review:conventions | claude-opus-5-5 | 16 | 10,829 | 32 | 1,675,820 | 133 |
| triage | claude-sonnet-5 | 2 | 9,852 | 4 | 91,850 | 116 |
| baseline:diffBase | claude-sonnet-5 | 13 | 8,585 | 26 | 1,140,269 | 147 |
| ui:E9 | claude-sonnet-5 | 11 | 7,905 | 22 | 967,838 | 156 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,420 | 34 | 183,482 | 72 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,268 | 18 | 86,258 | 72 |
| machine:for t in "packages/ui/src/components/dat | claude-haiku-4-5-20251001 | 2 | 1,111 | 18 | 86,303 | 16 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 972 | 18 | 86,730 | 30 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 904 | 18 | 86,728 | 15 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 845 | 18 | 86,264 | 42 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 799 | 18 | 86,576 | 14 |
| capture:provenance | claude-sonnet-5 | 2 | 680 | 4 | 85,752 | 18 |


wall: 524s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 8,585 | 1,140,269 | 147 | 02:25:13 | 02:27:40 |
| machine | 7 | 7,319 | 702,341 | 137 | 02:25:13 | 02:27:31 |
| ui | 1 | 7,905 | 967,838 | 156 | 02:25:13 | 02:27:49 |
| review | 3 | 44,474 | 3,975,820 | 190 | 02:25:13 | 02:28:23 |
| triage | 1 | 9,852 | 91,850 | 116 | 02:28:25 | 02:30:22 |
| capture | 1 | 680 | 85,752 | 18 | 02:30:24 | 02:30:43 |
| synthesize | 1 | 18,509 | 104,765 | 193 | 02:30:45 | 02:33:58 |

- **claude-sonnet-5**: 5 agent · 30 calls · out 45,531 · in 60 · cache_read 2,390,474 · cache_create 534,404
- **claude-opus-5-5**: 3 agent · 37 calls · out 44,474 · in 74 · cache_read 3,975,820 · cache_create 342,563
- **claude-haiku-4-5-20251001**: 7 agent · 16 calls · out 7,319 · in 142 · cache_read 702,341 · cache_create 281,119

