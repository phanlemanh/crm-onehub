### S4 round 1 — wf_7b136d07-725 (31 agent, 115,942 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 35 | 19,742 | 70 | 6,021,848 | 275 |
| review:bugs | claude-opus-5-5 | 19 | 15,492 | 38 | 3,280,607 | 191 |
| review:measurement | claude-opus-5-5 | 9 | 14,836 | 18 | 1,351,801 | 159 |
| synthesize:report | claude-sonnet-5-5 | 3 | 10,071 | 6 | 302,022 | 63 |
| ui:E11 | claude-sonnet-5-5 | 14 | 8,468 | 28 | 1,813,713 | 180 |
| baseline:diffBase | claude-sonnet-5-5 | 6 | 4,778 | 12 | 635,564 | 40 |
| triage | claude-sonnet-5-5 | 2 | 4,191 | 4 | 123,083 | 31 |
| judge:E12:operational-feasibility | claude-sonnet-5-5 | 2 | 3,543 | 4 | 152,894 | 27 |
| judge:E12:spec-alignment | claude-sonnet-5-5 | 2 | 3,235 | 4 | 152,892 | 25 |
| judge:E12:domain-correctness | claude-sonnet-5-5 | 3 | 2,940 | 6 | 248,644 | 24 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 3 | 2,369 | 28 | 219,052 | 26 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,234 | 18 | 121,229 | 46 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,151 | 18 | 121,250 | 206 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,992 | 18 | 121,244 | 71 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,925 | 18 | 91,937 | 215 |
| machine:{ find packages/ui/src/components/kara - | claude-haiku-4-5-20251001 | 3 | 1,921 | 28 | 219,012 | 22 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,898 | 18 | 121,276 | 73 |
| machine:node _acceptance/bo-xuong-kara/rang/ai-e | claude-haiku-4-5-20251001 | 2 | 1,766 | 18 | 121,009 | 35 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 1,685 | 18 | 121,041 | 20 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 1,219 | 18 | 121,058 | 18 |
| machine:node _acceptance/bo-xuong-kara/rang/ranh | claude-haiku-4-5-20251001 | 2 | 1,147 | 18 | 121,010 | 20 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 1,089 | 18 | 121,043 | 15 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 1,089 | 18 | 121,042 | 15 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 1,069 | 18 | 121,041 | 15 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 1,002 | 18 | 121,041 | 13 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 998 | 18 | 121,041 | 15 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 904 | 18 | 121,041 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 675 | 18 | 121,227 | 11 |
| machine:node _acceptance/bo-xuong-kara/rang/tai- | claude-haiku-4-5-20251001 | 2 | 643 | 18 | 121,008 | 15 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 501 | 18 | 121,042 | 15 |
| capture:provenance | claude-sonnet-5-5 | 2 | 369 | 4 | 116,990 | 6 |


wall: 749s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,778 | 635,564 | 40 | 14:43:12 | 14:43:52 |
| machine | 20 | 28,277 | 2,588,644 | 648 | 14:43:12 | 14:54:00 |
| ui | 1 | 8,468 | 1,813,713 | 180 | 14:43:28 | 14:46:28 |
| judge | 3 | 9,718 | 554,430 | 28 | 14:43:28 | 14:43:57 |
| review | 3 | 50,070 | 10,654,256 | 275 | 14:43:32 | 14:48:07 |
| triage | 1 | 4,191 | 123,083 | 31 | 14:54:00 | 14:54:31 |
| capture | 1 | 369 | 116,990 | 6 | 14:54:32 | 14:54:37 |
| synthesize | 1 | 10,071 | 302,022 | 63 | 14:54:37 | 14:55:40 |

- **claude-opus-5-5**: 3 agent · 63 calls · out 50,070 · in 126 · cache_read 10,654,256 · cache_create 544,982
- **claude-sonnet-5-5**: 8 agent · 34 calls · out 37,595 · in 68 · cache_read 3,545,802 · cache_create 1,062,270
- **claude-haiku-4-5-20251001**: 20 agent · 42 calls · out 28,277 · in 380 · cache_read 2,588,644 · cache_create 1,403,416

### S4 round 2 — wf_8d338547-27e (17 agent, 53,237 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 12,301 | 10 | 631,297 | 80 |
| ui:E11 | claude-sonnet-5-5 | 7 | 5,758 | 14 | 794,677 | 142 |
| review:bugs | claude-opus-5-5 | 10 | 4,616 | 20 | 1,255,408 | 65 |
| review:measurement | claude-opus-5-5 | 10 | 4,498 | 20 | 1,275,014 | 63 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,489 | 18 | 121,135 | 50 |
| judge:E12:domain-correctness | claude-sonnet-5-5 | 2 | 3,284 | 4 | 117,909 | 27 |
| judge:E12:operational-feasibility | claude-sonnet-5-5 | 2 | 3,199 | 4 | 152,862 | 25 |
| judge:E12:spec-alignment | claude-sonnet-5-5 | 3 | 2,973 | 6 | 283,531 | 24 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 2,576 | 18 | 121,135 | 27 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,297 | 18 | 121,156 | 200 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,951 | 18 | 121,150 | 193 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,703 | 18 | 120,955 | 193 |
| review:conventions | claude-opus-5-5 | 4 | 1,378 | 8 | 382,526 | 20 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,297 | 18 | 121,182 | 64 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 938 | 18 | 121,133 | 14 |
| machine:{ find packages/ui/src/components/kara - | claude-haiku-4-5-20251001 | 2 | 625 | 18 | 121,085 | 18 |
| capture:provenance | claude-sonnet-5-5 | 2 | 354 | 4 | 116,882 | 6 |


wall: 827s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 8 | 14,876 | 968,931 | 741 | 14:58:32 | 15:10:53 |
| ui | 1 | 5,758 | 794,677 | 142 | 14:58:32 | 15:00:53 |
| judge | 3 | 9,456 | 554,302 | 27 | 14:58:32 | 14:58:59 |
| review | 3 | 10,492 | 2,912,948 | 66 | 14:58:32 | 14:59:38 |
| capture | 1 | 354 | 116,882 | 6 | 15:10:53 | 15:10:59 |
| synthesize | 1 | 12,301 | 631,297 | 80 | 15:10:59 | 15:12:19 |

- **claude-sonnet-5-5**: 6 agent · 21 calls · out 27,869 · in 42 · cache_read 2,097,158 · cache_create 794,958
- **claude-opus-5-5**: 3 agent · 24 calls · out 10,492 · in 48 · cache_read 2,912,948 · cache_create 361,322
- **claude-haiku-4-5-20251001**: 8 agent · 16 calls · out 14,876 · in 144 · cache_read 968,931 · cache_create 555,051

