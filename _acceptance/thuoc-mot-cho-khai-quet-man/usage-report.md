### S4 round 1 — wf_cafcd2cb-de9 (20 agent, 17,050 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 3,227 | 8 | 330,983 | 42 |
| review:measurement | claude-opus-5-5 | 4 | 2,650 | 8 | 348,264 | 95 |
| review:conventions | claude-opus-5-5 | 9 | 1,949 | 18 | 904,096 | 102 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,851 | 4 | 124,898 | 72 |
| triage | claude-sonnet-5-5 | 2 | 1,474 | 4 | 91,769 | 15 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,173 | 4 | 124,744 | 24 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 864 | 8 | 286,319 | 24 |
| review:bugs | claude-opus-5-5 | 8 | 842 | 16 | 824,170 | 108 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 762 | 4 | 124,746 | 8 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 437 | 4 | 124,859 | 234 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 291 | 4 | 124,868 | 232 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 229 | 4 | 124,843 | 205 |
| machine:bun _acceptance/thuoc-mot-cho-khai-quet- | claude-haiku-5-5 | 2 | 201 | 4 | 124,789 | 8 |
| machine:bun _acceptance/thuoc-mot-cho-khai-quet- | claude-haiku-5-5 | 2 | 199 | 4 | 124,789 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 189 | 4 | 124,740 | 7 |
| machine:bun _acceptance/thuoc-mot-cho-khai-quet- | claude-haiku-5-5 | 2 | 183 | 4 | 124,789 | 7 |
| machine:bun _acceptance/thuoc-mot-cho-khai-quet- | claude-haiku-5-5 | 2 | 178 | 4 | 124,790 | 8 |
| machine:bun _acceptance/thuoc-mot-cho-khai-quet- | claude-haiku-5-5 | 2 | 178 | 4 | 124,791 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 89,006 | 10 |
| machine:bun _acceptance/thuoc-mot-cho-khai-quet- | claude-haiku-5-5 | 2 | 27 | 4 | 124,787 | 8 |


wall: 867s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 864 | 286,319 | 24 | 01:36:16 | 01:36:41 |
| machine | 13 | 5,898 | 1,622,433 | 794 | 01:36:16 | 01:49:31 |
| review | 3 | 5,441 | 2,076,530 | 109 | 01:36:16 | 01:38:05 |
| triage | 1 | 1,474 | 91,769 | 15 | 01:49:33 | 01:49:48 |
| capture | 1 | 146 | 89,006 | 10 | 01:49:50 | 01:50:00 |
| synthesize | 1 | 3,227 | 330,983 | 42 | 01:50:02 | 01:50:44 |

- **claude-sonnet-5-5**: 4 agent · 12 calls · out 5,711 · in 24 · cache_read 798,077 · cache_create 411,817
- **claude-opus-5-5**: 3 agent · 21 calls · out 5,441 · in 42 · cache_read 2,076,530 · cache_create 307,620
- **claude-haiku-5-5**: 13 agent · 26 calls · out 5,898 · in 52 · cache_read 1,622,433 · cache_create 798,763

