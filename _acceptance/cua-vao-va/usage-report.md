### S4 round 1 — wf_6f9a4891-a2e (31 agent, 116,974 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 20 | 19,403 | 40 | 3,229,275 | 231 |
| review:conventions | claude-opus-5-5 | 32 | 18,051 | 64 | 5,403,498 | 252 |
| review:bugs | claude-opus-5-5 | 34 | 12,168 | 68 | 5,342,307 | 191 |
| baseline:diffBase | claude-sonnet-5-5 | 18 | 11,241 | 36 | 2,325,702 | 179 |
| synthesize:report | claude-sonnet-5-5 | 2 | 10,769 | 4 | 143,095 | 67 |
| triage | claude-sonnet-5-5 | 2 | 4,579 | 4 | 124,135 | 35 |
| ui:E10 | claude-sonnet-5-5 | 8 | 4,202 | 16 | 962,473 | 74 |
| ui:E7 | claude-sonnet-5-5 | 7 | 2,988 | 14 | 787,494 | 71 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,441 | 18 | 122,226 | 30 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,213 | 18 | 122,225 | 30 |
| machine:for t in "apps/app/app/(app)/[slug]/erro | claude-haiku-4-5-20251001 | 2 | 2,212 | 18 | 122,397 | 25 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,164 | 18 | 93,142 | 224 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,905 | 18 | 122,588 | 201 |
| refute:cua-vao-va.spec.ts | claude-sonnet-5-5 | 6 | 1,851 | 12 | 651,341 | 25 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,742 | 18 | 122,582 | 192 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,637 | 18 | 122,567 | 40 |
| machine:bun _acceptance/cua-vao-va/rang/soi-ma-n | claude-haiku-4-5-20251001 | 2 | 1,563 | 18 | 122,222 | 27 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,470 | 18 | 122,567 | 19 |
| machine:bun _acceptance/cua-vao-va/rang/thuoc-cu | claude-haiku-4-5-20251001 | 2 | 1,453 | 18 | 122,222 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,364 | 18 | 122,254 | 18 |
| machine:RESEND_API_KEY=re_test_gia MAIL_FROM="CR | claude-haiku-4-5-20251001 | 2 | 1,353 | 18 | 122,316 | 41 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,248 | 18 | 122,614 | 64 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,187 | 18 | 122,565 | 16 |
| machine:bun _acceptance/cua-vao-va/rang/noi-goi- | claude-haiku-4-5-20251001 | 2 | 1,182 | 18 | 122,227 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,170 | 18 | 122,225 | 22 |
| machine:cd apps/app && bun test ./test/onboardin | claude-haiku-4-5-20251001 | 2 | 1,159 | 18 | 122,216 | 15 |
| machine:cd apps/app && bun test ./test/sign-out. | claude-haiku-4-5-20251001 | 2 | 1,043 | 18 | 122,209 | 13 |
| triage | claude-sonnet-5-5 | 2 | 994 | 4 | 155,686 | 10 |
| machine:cd apps/app && bun test test/messages-gu | claude-haiku-4-5-20251001 | 2 | 966 | 18 | 122,208 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 859 | 18 | 122,250 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 397 | 4 | 118,497 | 6 |


wall: 899s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 11,241 | 2,325,702 | 179 | 22:56:20 | 22:59:19 |
| machine | 20 | 30,331 | 2,417,822 | 755 | 22:56:20 | 23:08:55 |
| ui | 2 | 7,190 | 1,749,967 | 77 | 22:56:37 | 22:57:53 |
| review | 3 | 49,622 | 13,975,080 | 252 | 22:56:43 | 23:00:55 |
| triage | 2 | 5,573 | 279,821 | 46 | 23:08:55 | 23:09:41 |
| refute | 1 | 1,851 | 651,341 | 25 | 23:09:41 | 23:10:06 |
| capture | 1 | 397 | 118,497 | 6 | 23:10:06 | 23:10:12 |
| synthesize | 1 | 10,769 | 143,095 | 67 | 23:10:12 | 23:11:19 |

- **claude-opus-5-5**: 3 agent · 86 calls · out 49,622 · in 172 · cache_read 13,975,080 · cache_create 526,356
- **claude-sonnet-5-5**: 8 agent · 47 calls · out 37,021 · in 94 · cache_read 5,268,423 · cache_create 1,043,456
- **claude-haiku-4-5-20251001**: 20 agent · 40 calls · out 30,331 · in 360 · cache_read 2,417,822 · cache_create 1,438,812

### S4 round 2 — wf_921ca4e4-a34 (29 agent, 88,719 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 18 | 14,234 | 36 | 2,790,669 | 167 |
| synthesize:report | claude-sonnet-5-5 | 3 | 11,519 | 6 | 289,585 | 76 |
| baseline:diffBase | claude-sonnet-5-5 | 12 | 8,337 | 24 | 1,461,186 | 158 |
| review:bugs | claude-opus-5-5 | 18 | 8,041 | 36 | 2,530,529 | 109 |
| review:conventions | claude-opus-5-5 | 12 | 5,117 | 24 | 1,545,021 | 70 |
| ui:E10 | claude-sonnet-5-5 | 9 | 4,137 | 18 | 1,107,400 | 119 |
| ui:E7 | claude-sonnet-5-5 | 7 | 3,404 | 14 | 778,661 | 79 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,749 | 18 | 93,158 | 228 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,714 | 18 | 122,345 | 83 |
| machine:RESEND_API_KEY=re_test_gia MAIL_FROM="CR | claude-haiku-4-5-20251001 | 2 | 2,290 | 18 | 122,332 | 45 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,105 | 18 | 122,319 | 205 |
| machine:bun _acceptance/cua-vao-va/rang/soi-ma-n | claude-haiku-4-5-20251001 | 2 | 2,104 | 18 | 122,238 | 34 |
| machine:for t in "apps/app/app/(app)/[slug]/erro | claude-haiku-4-5-20251001 | 2 | 1,956 | 18 | 122,413 | 20 |
| machine:bun _acceptance/cua-vao-va/rang/thuoc-cu | claude-haiku-4-5-20251001 | 2 | 1,950 | 18 | 122,238 | 149 |
| triage | claude-sonnet-5-5 | 2 | 1,909 | 4 | 120,833 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,851 | 18 | 122,242 | 29 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,398 | 18 | 122,298 | 18 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,367 | 18 | 122,313 | 184 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,346 | 18 | 122,241 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 3 | 1,295 | 28 | 221,568 | 25 |
| machine:cd apps/app && bun test ./test/onboardin | claude-haiku-4-5-20251001 | 2 | 1,198 | 18 | 122,232 | 17 |
| machine:bun _acceptance/cua-vao-va/rang/noi-goi- | claude-haiku-4-5-20251001 | 2 | 1,170 | 18 | 122,243 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,112 | 18 | 122,270 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,092 | 18 | 122,296 | 15 |
| machine:cd apps/app && bun test test/messages-gu | claude-haiku-4-5-20251001 | 2 | 1,090 | 18 | 122,224 | 16 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,061 | 18 | 122,298 | 29 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 897 | 18 | 122,266 | 14 |
| machine:cd apps/app && bun test ./test/sign-out. | claude-haiku-4-5-20251001 | 2 | 872 | 18 | 122,225 | 15 |
| capture:provenance | claude-sonnet-5-5 | 2 | 404 | 4 | 118,163 | 8 |


wall: 871s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 8,337 | 1,461,186 | 158 | 23:53:59 | 23:56:37 |
| machine | 20 | 31,617 | 2,515,759 | 763 | 23:53:59 | 00:06:42 |
| ui | 2 | 7,541 | 1,886,061 | 122 | 23:54:17 | 23:56:19 |
| review | 3 | 27,392 | 6,866,219 | 173 | 23:54:24 | 23:57:17 |
| triage | 1 | 1,909 | 120,833 | 23 | 00:06:42 | 00:07:05 |
| capture | 1 | 404 | 118,163 | 8 | 00:07:05 | 00:07:13 |
| synthesize | 1 | 11,519 | 289,585 | 76 | 00:07:13 | 00:08:30 |

- **claude-opus-5-5**: 3 agent · 48 calls · out 27,392 · in 96 · cache_read 6,866,219 · cache_create 431,626
- **claude-sonnet-5-5**: 6 agent · 35 calls · out 29,710 · in 70 · cache_read 3,875,828 · cache_create 806,719
- **claude-haiku-4-5-20251001**: 20 agent · 41 calls · out 31,617 · in 370 · cache_read 2,515,759 · cache_create 1,432,045

