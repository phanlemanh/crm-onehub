### S4 round 1 — wf_eab3e140-efa (26 agent, 92,139 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 19 | 16,012 | 38 | 1,485,981 | 191 |
| review:measurement | claude-opus-5-5 | 12 | 12,427 | 24 | 899,490 | 138 |
| synthesize:report | claude-sonnet-5-5 | 3 | 9,645 | 6 | 123,961 | 60 |
| judge:E9j:operational-feasibility | claude-sonnet-5-5 | 3 | 7,827 | 8 | 99,570 | 56 |
| judge:E9j:domain-correctness | claude-sonnet-5-5 | 3 | 7,432 | 6 | 96,204 | 61 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 6,959 | 4 | 44,461 | 38 |
| judge:E9j:spec-alignment | claude-sonnet-5-5 | 2 | 6,354 | 4 | 41,785 | 46 |
| review:conventions | claude-opus-5-5 | 7 | 5,703 | 14 | 349,371 | 65 |
| triage | claude-sonnet-5-5 | 2 | 3,258 | 4 | 41,370 | 26 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,142 | 4 | 40,772 | 11 |
| machine:bun _acceptance/bo-cau-hoi-mau/rang/do-b | claude-haiku-5-5 | 2 | 2,001 | 4 | 40,811 | 12 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,634 | 4 | 37,903 | 269 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,121 | 4 | 40,788 | 281 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,022 | 4 | 40,827 | 72 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 950 | 4 | 40,797 | 235 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 864 | 4 | 40,770 | 70 |
| machine:bun test ./_acceptance/bo-cau-hoi-mau/ra | claude-haiku-5-5 | 2 | 836 | 4 | 40,821 | 8 |
| machine:bun test ./_acceptance/bo-cau-hoi-mau/ra | claude-haiku-5-5 | 2 | 820 | 4 | 40,822 | 7 |
| machine:bun _acceptance/bo-cau-hoi-mau/rang/kiem | claude-haiku-5-5 | 2 | 802 | 4 | 40,810 | 6 |
| machine:bun test ./_acceptance/bo-cau-hoi-mau/ra | claude-haiku-5-5 | 2 | 788 | 4 | 40,821 | 7 |
| machine:bun test ./_acceptance/bo-cau-hoi-mau/ra | claude-haiku-5-5 | 2 | 719 | 4 | 40,819 | 7 |
| machine:bun test ./_acceptance/bo-cau-hoi-mau/ra | claude-haiku-5-5 | 2 | 622 | 4 | 40,822 | 6 |
| machine:bun test ./_acceptance/bo-cau-hoi-mau/ra | claude-haiku-5-5 | 2 | 617 | 4 | 40,824 | 8 |
| machine:bun test ./_acceptance/bo-cau-hoi-mau/ra | claude-haiku-5-5 | 2 | 588 | 4 | 40,823 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 500 | 4 | 40,766 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 496 | 4 | 36,692 | 9 |


wall: 1040s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 6,959 | 44,461 | 38 | 06:47:06 | 06:47:45 |
| machine | 16 | 16,026 | 649,996 | 945 | 06:47:06 | 07:02:51 |
| judge | 3 | 21,613 | 237,559 | 63 | 06:47:06 | 06:48:10 |
| review | 3 | 34,142 | 2,734,842 | 192 | 06:47:14 | 06:50:27 |
| triage | 1 | 3,258 | 41,370 | 26 | 07:02:51 | 07:03:17 |
| capture | 1 | 496 | 36,692 | 9 | 07:03:17 | 07:03:26 |
| synthesize | 1 | 9,645 | 123,961 | 60 | 07:03:26 | 07:04:26 |

- **claude-opus-5-5**: 3 agent · 38 calls · out 34,142 · in 76 · cache_read 2,734,842 · cache_create 278,943
- **claude-sonnet-5-5**: 7 agent · 17 calls · out 41,971 · in 36 · cache_read 484,043 · cache_create 397,036
- **claude-haiku-5-5**: 16 agent · 32 calls · out 16,026 · in 64 · cache_read 649,996 · cache_create 655,199

