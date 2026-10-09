### S4 round 1 — wf_70b2215c-ff1 (21 agent, 55,915 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 9 | 10,634 | 18 | 920,706 | 127 |
| review:measurement | claude-opus-5-5 | 7 | 9,385 | 14 | 679,331 | 136 |
| synthesize:report | claude-sonnet-5-5 | 4 | 5,822 | 8 | 320,387 | 45 |
| review:conventions | claude-opus-5-5 | 6 | 5,495 | 12 | 541,515 | 64 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,977 | 4 | 121,559 | 35 |
| refute:evidence-report.md | claude-sonnet-5-5 | 6 | 2,779 | 12 | 464,586 | 35 |
| triage | claude-sonnet-5-5 | 2 | 2,412 | 4 | 89,382 | 22 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,335 | 4 | 121,616 | 66 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,001 | 4 | 121,561 | 11 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 1,895 | 8 | 275,428 | 27 |
| machine:bun _acceptance/ngoai-le-telemetry-giai- | claude-haiku-5-5 | 2 | 1,428 | 4 | 121,612 | 15 |
| machine:bun _acceptance/ngoai-le-telemetry-giai- | claude-haiku-5-5 | 2 | 1,258 | 4 | 121,612 | 17 |
| machine:bun _acceptance/ngoai-le-telemetry-giai- | claude-haiku-5-5 | 2 | 996 | 4 | 121,613 | 8 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 989 | 4 | 121,577 | 227 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 788 | 4 | 86,551 | 212 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 756 | 4 | 121,586 | 242 |
| machine:bun _acceptance/ngoai-le-telemetry-giai- | claude-haiku-5-5 | 2 | 728 | 4 | 121,612 | 20 |
| machine:bun _acceptance/ngoai-le-telemetry-giai- | claude-haiku-5-5 | 2 | 713 | 4 | 121,611 | 6 |
| machine:bun _acceptance/ngoai-le-telemetry-giai- | claude-haiku-5-5 | 2 | 626 | 4 | 121,606 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 537 | 4 | 121,555 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 361 | 4 | 85,814 | 9 |


wall: 912s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,895 | 275,428 | 27 | 07:11:56 | 07:12:23 |
| machine | 13 | 17,132 | 1,545,671 | 800 | 07:11:56 | 07:25:16 |
| review | 3 | 25,514 | 2,141,552 | 138 | 07:11:56 | 07:14:14 |
| triage | 1 | 2,412 | 89,382 | 22 | 07:25:17 | 07:25:38 |
| refute | 1 | 2,779 | 464,586 | 35 | 07:25:38 | 07:26:14 |
| capture | 1 | 361 | 85,814 | 9 | 07:26:14 | 07:26:23 |
| synthesize | 1 | 5,822 | 320,387 | 45 | 07:26:23 | 07:27:08 |

- **claude-opus-5-5**: 3 agent · 22 calls · out 25,514 · in 44 · cache_read 2,141,552 · cache_create 296,222
- **claude-sonnet-5-5**: 5 agent · 18 calls · out 13,269 · in 36 · cache_read 1,235,597 · cache_create 493,533
- **claude-haiku-5-5**: 13 agent · 26 calls · out 17,132 · in 52 · cache_read 1,545,671 · cache_create 781,865

