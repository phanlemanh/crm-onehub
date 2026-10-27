### S4 round 1 — wf_5ffdc486-fd8 (23 agent, 60,119 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 8,567 | 4 | 41,553 | 54 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 7,688 | 4 | 35,840 | 47 |
| review:bugs | claude-opus-5-5 | 9 | 6,027 | 18 | 356,803 | 69 |
| review:measurement | claude-opus-5-5 | 8 | 5,073 | 16 | 327,513 | 60 |
| review:conventions | claude-opus-5-5 | 8 | 3,960 | 16 | 352,638 | 52 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,499 | 4 | 31,073 | 103 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,487 | 4 | 3,034 | 340 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,349 | 4 | 27,984 | 307 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,045 | 4 | 31,018 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 2,040 | 4 | 3,034 | 555 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-5-5 | 2 | 1,884 | 4 | 31,098 | 16 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,733 | 4 | 31,016 | 40 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,732 | 4 | 31,119 | 15 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,697 | 4 | 31,120 | 15 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,632 | 4 | 31,119 | 15 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,626 | 4 | 31,121 | 14 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,572 | 4 | 31,121 | 14 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,251 | 4 | 31,119 | 13 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,165 | 4 | 31,119 | 13 |
| triage | claude-sonnet-5-5 | 2 | 1,143 | 4 | 29,961 | 17 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,036 | 4 | 31,122 | 13 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 592 | 4 | 31,012 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 321 | 4 | 26,771 | 9 |


wall: 1462s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 7,688 | 35,840 | 47 | 01:52:25 | 01:53:11 |
| machine | 16 | 27,340 | 438,229 | 1376 | 01:52:25 | 02:15:21 |
| review | 3 | 15,060 | 1,036,954 | 85 | 01:52:25 | 01:53:50 |
| triage | 1 | 1,143 | 29,961 | 17 | 02:15:23 | 02:15:39 |
| capture | 1 | 321 | 26,771 | 9 | 02:15:41 | 02:15:50 |
| synthesize | 1 | 8,567 | 41,553 | 54 | 02:15:52 | 02:16:46 |

- **claude-sonnet-5-5**: 4 agent · 8 calls · out 17,719 · in 16 · cache_read 134,125 · cache_create 164,884
- **claude-opus-5-5**: 3 agent · 25 calls · out 15,060 · in 50 · cache_read 1,036,954 · cache_create 184,118
- **claude-haiku-5-5**: 16 agent · 32 calls · out 27,340 · in 64 · cache_read 438,229 · cache_create 523,047

