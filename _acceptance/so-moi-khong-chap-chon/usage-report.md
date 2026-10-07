### S4 round 1 — wf_f71df275-f60 (23 agent, 60,000 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 17 | 13,226 | 34 | 2,014,443 | 185 |
| review:conventions | claude-opus-5-5 | 11 | 5,564 | 22 | 1,179,071 | 87 |
| synthesize:report | claude-sonnet-5-5 | 3 | 5,282 | 6 | 225,480 | 39 |
| judge:E4:domain-correctness | claude-sonnet-5-5 | 2 | 4,772 | 4 | 95,204 | 41 |
| review:measurement | claude-opus-5-5 | 3 | 4,652 | 6 | 240,234 | 57 |
| judge:E4:operational-feasibility | claude-sonnet-5-5 | 2 | 3,777 | 4 | 130,062 | 35 |
| baseline:diffBase | claude-sonnet-5-5 | 7 | 3,295 | 14 | 617,461 | 56 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,980 | 18 | 99,193 | 258 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,931 | 18 | 99,187 | 216 |
| machine:bun _acceptance/so-moi-khong-chap-chon/r | claude-haiku-4-5-20251001 | 2 | 1,556 | 18 | 99,205 | 23 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,401 | 18 | 99,172 | 19 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 2 | 1,368 | 18 | 99,206 | 17 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,278 | 18 | 99,219 | 66 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 2 | 1,209 | 18 | 99,207 | 22 |
| triage | claude-sonnet-5-5 | 2 | 1,199 | 4 | 96,405 | 12 |
| machine:bun _acceptance/so-moi-khong-chap-chon/r | claude-haiku-4-5-20251001 | 2 | 1,187 | 18 | 99,207 | 20 |
| judge:E4:spec-alignment | claude-sonnet-5-5 | 3 | 1,176 | 6 | 268,386 | 37 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,066 | 18 | 70,217 | 203 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 994 | 18 | 99,172 | 29 |
| machine:bun _acceptance/nop-ban-nhap-chon-theo-k | claude-haiku-4-5-20251001 | 2 | 954 | 18 | 99,209 | 20 |
| machine:bun run test -- "cd apps/agent-okr && CR | claude-haiku-4-5-20251001 | 2 | 907 | 18 | 99,217 | 17 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 869 | 18 | 99,170 | 14 |
| capture:provenance | claude-sonnet-5-5 | 2 | 357 | 4 | 94,018 | 8 |


wall: 865s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,295 | 617,461 | 56 | 13:39:24 | 13:40:20 |
| machine | 13 | 16,700 | 1,260,581 | 806 | 13:39:24 | 13:52:51 |
| judge | 3 | 9,725 | 493,652 | 41 | 13:39:24 | 13:40:06 |
| review | 3 | 23,442 | 3,433,748 | 203 | 13:39:24 | 13:42:47 |
| triage | 1 | 1,199 | 96,405 | 12 | 13:52:51 | 13:53:03 |
| capture | 1 | 357 | 94,018 | 8 | 13:53:03 | 13:53:11 |
| synthesize | 1 | 5,282 | 225,480 | 39 | 13:53:11 | 13:53:49 |

- **claude-opus-5-5**: 3 agent · 31 calls · out 23,442 · in 62 · cache_read 3,433,748 · cache_create 317,677
- **claude-sonnet-5-5**: 7 agent · 21 calls · out 19,858 · in 42 · cache_read 1,527,016 · cache_create 780,952
- **claude-haiku-4-5-20251001**: 13 agent · 26 calls · out 16,700 · in 234 · cache_read 1,260,581 · cache_create 633,035

