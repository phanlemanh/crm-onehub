### S4 round 1 — wf_2a7ddb7c-a9d (24 agent, 138,004 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| baseline:diffBase | claude-sonnet-5 | 43 | 26,633 | 86 | 4,707,809 | 416 |
| synthesize:report | claude-sonnet-5 | 2 | 22,855 | 4 | 101,263 | 209 |
| ui:E9 | claude-sonnet-5 | 40 | 20,383 | 80 | 4,795,280 | 346 |
| triage | claude-sonnet-5 | 2 | 10,937 | 4 | 120,613 | 115 |
| review:measurement | claude-opus-5-5 | 14 | 10,506 | 28 | 1,476,148 | 141 |
| review:bugs | claude-opus-5-5 | 17 | 8,062 | 34 | 1,771,625 | 120 |
| triage | claude-sonnet-5 | 2 | 6,695 | 4 | 88,045 | 76 |
| review:conventions | claude-opus-5-5 | 11 | 6,166 | 22 | 1,045,027 | 83 |
| refute:config.yaml | claude-sonnet-5 | 7 | 4,892 | 14 | 566,032 | 64 |
| refute:cai-dat-chung-khoa.dom.tsx | claude-sonnet-5 | 8 | 4,740 | 16 | 729,972 | 59 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 5 | 1,958 | 42 | 273,219 | 34 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 4 | 1,598 | 34 | 209,507 | 27 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 5 | 1,486 | 42 | 291,573 | 33 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 4 | 1,426 | 34 | 207,452 | 25 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 4 | 1,383 | 34 | 208,478 | 31 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,237 | 18 | 57,136 | 79 |
| capture:provenance | claude-sonnet-5 | 3 | 1,091 | 6 | 172,360 | 18 |
| machine:cd apps/app && bun test test/onboarding- | claude-haiku-4-5-20251001 | 2 | 1,067 | 18 | 82,130 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,029 | 18 | 82,120 | 16 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 858 | 18 | 82,054 | 28 |
| machine:cd packages/auth && bun test test/quyen- | claude-haiku-4-5-20251001 | 2 | 808 | 18 | 82,072 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 758 | 18 | 82,052 | 13 |
| machine:cd apps/app && bun test test/onboarding- | claude-haiku-4-5-20251001 | 2 | 733 | 18 | 82,084 | 12 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 703 | 18 | 82,054 | 13 |


wall: 835s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 26,633 | 4,707,809 | 416 | 02:12:34 | 02:19:31 |
| machine | 13 | 15,044 | 1,821,931 | 137 | 02:12:34 | 02:14:51 |
| ui | 1 | 20,383 | 4,795,280 | 346 | 02:12:34 | 02:18:21 |
| review | 3 | 24,734 | 4,292,800 | 145 | 02:12:49 | 02:15:14 |
| triage | 2 | 17,632 | 208,658 | 192 | 02:18:22 | 02:21:34 |
| refute | 2 | 9,632 | 1,296,004 | 64 | 02:21:35 | 02:22:40 |
| capture | 1 | 1,091 | 172,360 | 18 | 02:22:41 | 02:22:59 |
| synthesize | 1 | 22,855 | 101,263 | 209 | 02:23:00 | 02:26:29 |

- **claude-sonnet-5**: 8 agent · 107 calls · out 98,226 · in 214 · cache_read 11,281,374 · cache_create 817,822
- **claude-opus-5-5**: 3 agent · 42 calls · out 24,734 · in 84 · cache_read 4,292,800 · cache_create 318,182
- **claude-haiku-4-5-20251001**: 13 agent · 38 calls · out 15,044 · in 330 · cache_read 1,821,931 · cache_create 548,478

### S4 round 2 — wf_6eeb4e28-0ee (21 agent, 91,135 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 5 | 18,570 | 10 | 473,216 | 174 |
| baseline:diffBase | claude-sonnet-5 | 32 | 15,179 | 64 | 3,252,689 | 249 |
| review:bugs | claude-opus-5-5 | 18 | 11,258 | 36 | 1,938,964 | 165 |
| review:measurement | claude-opus-5-5 | 9 | 9,958 | 18 | 879,110 | 132 |
| ui:E9 | claude-sonnet-5 | 21 | 8,923 | 42 | 2,198,215 | 157 |
| review:conventions | claude-opus-5-5 | 8 | 6,378 | 16 | 690,786 | 77 |
| triage | claude-sonnet-5 | 2 | 5,593 | 4 | 88,343 | 59 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 6 | 1,769 | 50 | 335,589 | 38 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 5 | 1,556 | 42 | 273,586 | 34 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,453 | 34 | 182,547 | 90 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 4 | 1,313 | 34 | 207,776 | 25 |
| machine:cd apps/app && bun test test/onboarding- | claude-haiku-4-5-20251001 | 2 | 1,288 | 18 | 82,136 | 19 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 4 | 987 | 34 | 207,788 | 24 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 954 | 18 | 82,208 | 15 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 951 | 18 | 82,235 | 25 |
| machine:cd apps/app && bun test test/onboarding- | claude-haiku-4-5-20251001 | 2 | 921 | 18 | 82,108 | 15 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-4-5-20251001 | 3 | 860 | 26 | 144,623 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 855 | 18 | 82,206 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 833 | 18 | 82,144 | 14 |
| machine:cd packages/auth && bun test test/quyen- | claude-haiku-4-5-20251001 | 2 | 781 | 18 | 82,096 | 13 |
| capture:provenance | claude-sonnet-5 | 2 | 755 | 4 | 83,345 | 13 |


wall: 439s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 15,179 | 3,252,689 | 249 | 02:34:00 | 02:38:09 |
| machine | 13 | 14,521 | 1,927,042 | 149 | 02:34:00 | 02:36:29 |
| ui | 1 | 8,923 | 2,198,215 | 157 | 02:34:00 | 02:36:37 |
| review | 3 | 27,594 | 3,508,860 | 166 | 02:34:15 | 02:37:02 |
| triage | 1 | 5,593 | 88,343 | 59 | 02:37:03 | 02:38:02 |
| capture | 1 | 755 | 83,345 | 13 | 02:38:10 | 02:38:23 |
| synthesize | 1 | 18,570 | 473,216 | 174 | 02:38:25 | 02:41:19 |

- **claude-sonnet-5**: 5 agent · 62 calls · out 49,020 · in 124 · cache_read 6,095,808 · cache_create 592,503
- **claude-opus-5-5**: 3 agent · 35 calls · out 27,594 · in 70 · cache_read 3,508,860 · cache_create 300,038
- **claude-haiku-4-5-20251001**: 13 agent · 40 calls · out 14,521 · in 346 · cache_read 1,927,042 · cache_create 532,214

