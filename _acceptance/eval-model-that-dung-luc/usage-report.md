### S4 round 1 — wf_fd74782f-872 (30 agent, 38,545 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 8,321 | 6 | 251,928 | 73 |
| triage | claude-sonnet-5-5 | 2 | 7,110 | 4 | 104,412 | 55 |
| review:conventions | claude-opus-5-5 | 10 | 4,927 | 20 | 1,190,332 | 146 |
| review:bugs | claude-opus-5-5 | 23 | 2,924 | 46 | 3,561,975 | 318 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,808 | 4 | 131,239 | 254 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,599 | 4 | 96,204 | 292 |
| baseline:diffBase | claude-sonnet-5-5 | 8 | 1,386 | 16 | 734,633 | 79 |
| refute:cham-bo-do.ts | claude-sonnet-5-5 | 5 | 1,143 | 10 | 415,881 | 35 |
| refute:cham-bo-do.ts | claude-sonnet-5-5 | 8 | 1,127 | 16 | 758,162 | 43 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,114 | 4 | 131,214 | 10 |
| refute:cham-bo-do.ts | claude-sonnet-5-5 | 8 | 969 | 16 | 781,510 | 59 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 614 | 4 | 131,257 | 11 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 608 | 4 | 131,248 | 23 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 591 | 4 | 131,245 | 8 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 466 | 4 | 131,245 | 12 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 457 | 4 | 131,255 | 10 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 413 | 4 | 131,230 | 250 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 355 | 4 | 131,258 | 8 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 299 | 4 | 131,269 | 70 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 272 | 4 | 131,212 | 39 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 263 | 4 | 131,259 | 17 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 253 | 4 | 131,246 | 6 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 226 | 4 | 131,258 | 7 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 225 | 4 | 131,257 | 8 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 204 | 4 | 131,245 | 13 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 201 | 4 | 131,254 | 8 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 200 | 4 | 131,254 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 192 | 4 | 131,208 | 7 |
| capture:provenance | claude-sonnet-5-5 | 3 | 168 | 6 | 195,934 | 13 |
| review:measurement | claude-opus-5-5 | 11 | 110 | 22 | 1,468,308 | 237 |


wall: 1147s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,386 | 734,633 | 79 | 08:15:34 | 08:16:52 |
| machine | 20 | 10,360 | 2,589,857 | 935 | 08:15:34 | 08:31:09 |
| review | 3 | 7,961 | 6,220,615 | 323 | 08:15:46 | 08:21:09 |
| triage | 1 | 7,110 | 104,412 | 55 | 08:31:11 | 08:32:06 |
| refute | 3 | 3,239 | 1,955,553 | 62 | 08:32:08 | 08:33:11 |
| capture | 1 | 168 | 195,934 | 13 | 08:33:13 | 08:33:25 |
| synthesize | 1 | 8,321 | 251,928 | 73 | 08:33:27 | 08:34:40 |

- **claude-sonnet-5-5**: 7 agent · 37 calls · out 20,224 · in 74 · cache_read 3,242,460 · cache_create 729,666
- **claude-opus-5-5**: 3 agent · 44 calls · out 7,961 · in 88 · cache_read 6,220,615 · cache_create 459,475
- **claude-haiku-5-5**: 20 agent · 40 calls · out 10,360 · in 80 · cache_read 2,589,857 · cache_create 1,372,529


### S4 round 2 — wf_705e8d91-140 (28 agent, 36,258 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 10,004 | 10 | 528,093 | 84 |
| triage | claude-sonnet-5-5 | 2 | 4,697 | 4 | 102,292 | 41 |
| review:measurement | claude-opus-5-5 | 16 | 3,174 | 32 | 2,558,704 | 251 |
| review:conventions | claude-opus-5-5 | 11 | 2,706 | 22 | 1,373,499 | 140 |
| review:bugs | claude-opus-5-5 | 29 | 2,300 | 58 | 5,097,634 | 402 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,840 | 4 | 131,308 | 74 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,816 | 4 | 131,278 | 245 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,511 | 4 | 131,269 | 266 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 1,321 | 4 | 70,020 | 352 |
| refute:quyet-do.spec.ts | claude-sonnet-5-5 | 6 | 1,012 | 12 | 526,400 | 41 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 920 | 4 | 131,253 | 9 |
| refute:quyet-do.spec.ts | claude-sonnet-5-5 | 6 | 798 | 12 | 514,900 | 32 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 645 | 4 | 131,251 | 50 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 453 | 4 | 131,284 | 12 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 295 | 4 | 96,243 | 287 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 267 | 4 | 131,298 | 16 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 253 | 4 | 131,285 | 6 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 228 | 4 | 131,287 | 18 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 226 | 4 | 131,294 | 10 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 225 | 4 | 131,297 | 10 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 225 | 4 | 131,296 | 8 |
| machine:bun _acceptance/eval-model-that-dung-luc | claude-haiku-5-5 | 2 | 205 | 4 | 131,284 | 8 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 201 | 4 | 131,293 | 9 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 200 | 4 | 131,296 | 9 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 200 | 4 | 131,297 | 10 |
| capture:provenance | claude-sonnet-5-5 | 3 | 186 | 6 | 196,030 | 15 |
| machine:bun test _acceptance/tro-ly-doc-kho/rang | claude-haiku-5-5 | 2 | 182 | 4 | 131,293 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 168 | 4 | 131,247 | 7 |


wall: 1142s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 20 | 11,381 | 2,529,373 | 952 | 09:04:11 | 09:20:02 |
| review | 3 | 8,180 | 9,029,837 | 406 | 09:04:24 | 09:11:10 |
| triage | 1 | 4,697 | 102,292 | 41 | 09:20:05 | 09:20:45 |
| refute | 2 | 1,810 | 1,041,300 | 41 | 09:20:48 | 09:21:29 |
| capture | 1 | 186 | 196,030 | 15 | 09:21:31 | 09:21:47 |
| synthesize | 1 | 10,004 | 528,093 | 84 | 09:21:49 | 09:23:13 |

- **claude-sonnet-5-5**: 5 agent · 22 calls · out 16,697 · in 44 · cache_read 1,867,715 · cache_create 575,476
- **claude-opus-5-5**: 3 agent · 56 calls · out 8,180 · in 112 · cache_read 9,029,837 · cache_create 497,199
- **claude-haiku-5-5**: 20 agent · 40 calls · out 11,381 · in 80 · cache_read 2,529,373 · cache_create 1,433,302

