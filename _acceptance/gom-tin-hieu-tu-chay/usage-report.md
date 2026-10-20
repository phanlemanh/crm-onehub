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

