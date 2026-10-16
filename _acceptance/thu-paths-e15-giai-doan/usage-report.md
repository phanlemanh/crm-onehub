### S4 round 1 — wf_80cf0927-a11 (27 agent, 104,350 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 26 | 18,019 | 52 | 2,232,948 | 255 |
| review:measurement | claude-opus-5-5 | 14 | 15,291 | 28 | 1,035,438 | 187 |
| review:bugs | claude-opus-5-5 | 19 | 15,039 | 38 | 1,411,991 | 194 |
| synthesize:report | claude-sonnet-5-5 | 3 | 12,499 | 6 | 135,137 | 75 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 15 | 6,107 | 30 | 643,720 | 1837 |
| refute:them-paths.mjs | claude-sonnet-5-5 | 5 | 4,559 | 10 | 184,400 | 52 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 8 | 4,358 | 16 | 279,652 | 1077 |
| triage | claude-sonnet-5-5 | 2 | 4,276 | 4 | 46,276 | 38 |
| refute:evals.yaml | claude-sonnet-5-5 | 6 | 2,542 | 12 | 238,951 | 29 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,224 | 4 | 42,665 | 270 |
| refute:pmc-truoc-sau.mjs | claude-sonnet-5-5 | 3 | 1,906 | 6 | 90,988 | 20 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,796 | 4 | 42,640 | 11 |
| refute:pmc-truoc-sau.mjs | claude-sonnet-5-5 | 4 | 1,731 | 8 | 139,122 | 21 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,731 | 4 | 42,728 | 12 |
| refute:evals.yaml | claude-sonnet-5-5 | 5 | 1,730 | 10 | 186,912 | 28 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,460 | 4 | 42,771 | 11 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,135 | 4 | 42,695 | 77 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,122 | 4 | 42,727 | 9 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 1,023 | 4 | 42,760 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,009 | 4 | 42,638 | 42 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 926 | 4 | 42,722 | 10 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 882 | 4 | 5,738 | 355 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 798 | 4 | 39,783 | 292 |
| machine:node _acceptance/thu-paths-e15-giai-doan | claude-haiku-5-5 | 2 | 747 | 4 | 42,771 | 21 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 547 | 4 | 42,634 | 8 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 485 | 4 | 46,315 | 44 |
| capture:provenance | claude-sonnet-5-5 | 2 | 408 | 4 | 38,560 | 9 |


wall: 2015s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 485 | 46,315 | 44 | 09:53:09 | 09:53:53 |
| machine | 15 | 25,865 | 1,438,644 | 1839 | 09:53:09 | 10:23:48 |
| review | 3 | 48,349 | 4,680,377 | 255 | 09:53:09 | 09:57:24 |
| triage | 1 | 4,276 | 46,276 | 38 | 10:23:48 | 10:24:26 |
| refute | 5 | 12,468 | 840,373 | 54 | 10:24:26 | 10:25:19 |
| capture | 1 | 408 | 38,560 | 9 | 10:25:19 | 10:25:29 |
| synthesize | 1 | 12,499 | 135,137 | 76 | 10:25:29 | 10:26:44 |

- **claude-opus-5-5**: 3 agent · 59 calls · out 48,349 · in 118 · cache_read 4,680,377 · cache_create 331,509
- **claude-sonnet-5-5**: 9 agent · 32 calls · out 30,136 · in 64 · cache_read 1,106,661 · cache_create 483,444
- **claude-haiku-5-5**: 15 agent · 49 calls · out 25,865 · in 98 · cache_read 1,438,644 · cache_create 761,942

