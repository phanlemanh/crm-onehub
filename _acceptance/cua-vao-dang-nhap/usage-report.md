### S4 round 1 — wf_b0096633-552 (34 agent, 252,237 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 29,629 | 4 | 115,869 | 311 |
| review:measurement | claude-opus-5-5 | 21 | 23,233 | 42 | 3,019,067 | 274 |
| triage | claude-sonnet-5 | 2 | 20,290 | 4 | 96,317 | 227 |
| baseline:diffBase | claude-sonnet-5 | 27 | 19,527 | 54 | 2,888,613 | 311 |
| judge:E18:spec-alignment | claude-sonnet-5 | 2 | 15,191 | 4 | 126,544 | 168 |
| refute:do-cua-vao.mjs | claude-sonnet-5 | 22 | 15,136 | 44 | 2,612,259 | 243 |
| ui:E14 | claude-sonnet-5 | 29 | 13,735 | 58 | 3,402,969 | 291 |
| judge:E18:domain-correctness | claude-sonnet-5 | 3 | 13,348 | 6 | 217,307 | 153 |
| refute:cua-vao-sign-in.dom.tsx | claude-sonnet-5 | 16 | 13,210 | 32 | 1,673,469 | 201 |
| refute:cua-vao-sign-in.dom.tsx | claude-sonnet-5 | 12 | 12,520 | 24 | 1,342,751 | 173 |
| review:conventions | claude-opus-5-5 | 20 | 11,639 | 40 | 2,278,990 | 154 |
| judge:E18:operational-feasibility | claude-sonnet-5 | 2 | 10,424 | 4 | 126,546 | 113 |
| review:bugs | claude-opus-5-5 | 15 | 9,874 | 30 | 1,687,721 | 128 |
| refute:do-cua-vao.mjs | claude-sonnet-5 | 13 | 7,372 | 26 | 1,293,782 | 130 |
| refute:cua-vao-sign-in.dom.tsx | claude-sonnet-5 | 14 | 6,234 | 28 | 1,357,059 | 107 |
| refute:thuoc-da-ky.mjs | claude-sonnet-5 | 6 | 5,913 | 12 | 495,008 | 93 |
| refute:soi-ma.mjs | claude-sonnet-5 | 4 | 5,434 | 8 | 326,265 | 70 |
| machine:bun _acceptance/cua-vao-dang-nhap/rang/m | claude-haiku-4-5-20251001 | 2 | 1,884 | 18 | 89,838 | 24 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 1,857 | 42 | 273,886 | 202 |
| machine:for t in apps/app/components/auth-shell. | claude-haiku-4-5-20251001 | 2 | 1,760 | 18 | 89,899 | 22 |
| machine:bun _acceptance/cua-vao-dang-nhap/rang/s | claude-haiku-4-5-20251001 | 2 | 1,602 | 18 | 89,836 | 21 |
| machine:GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-ci- | claude-haiku-4-5-20251001 | 2 | 1,447 | 18 | 89,940 | 44 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,150 | 18 | 89,871 | 18 |
| machine:bun _acceptance/cua-vao-dang-nhap/rang/t | claude-haiku-4-5-20251001 | 2 | 1,073 | 18 | 89,839 | 112 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,004 | 18 | 90,061 | 31 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,000 | 18 | 89,891 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 998 | 18 | 89,868 | 16 |
| capture:provenance | claude-sonnet-5 | 2 | 971 | 4 | 89,976 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 962 | 18 | 89,870 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 915 | 18 | 89,871 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 823 | 18 | 89,864 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 800 | 18 | 90,061 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 660 | 18 | 90,059 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 622 | 18 | 89,860 | 16 |


wall: 1119s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 19,527 | 2,888,613 | 311 | 05:27:46 | 05:32:56 |
| machine | 16 | 18,557 | 1,622,514 | 265 | 05:27:46 | 05:32:11 |
| ui | 1 | 13,735 | 3,402,969 | 291 | 05:28:05 | 05:32:55 |
| judge | 3 | 38,963 | 470,397 | 170 | 05:28:05 | 05:30:55 |
| review | 3 | 44,746 | 6,985,778 | 280 | 05:28:07 | 05:32:46 |
| triage | 1 | 20,290 | 96,317 | 227 | 05:32:57 | 05:36:43 |
| refute | 7 | 65,819 | 9,100,593 | 245 | 05:36:46 | 05:40:51 |
| capture | 1 | 971 | 89,976 | 19 | 05:40:53 | 05:41:12 |
| synthesize | 1 | 29,629 | 115,869 | 311 | 05:41:14 | 05:46:25 |

- **claude-sonnet-5**: 15 agent · 156 calls · out 188,934 · in 312 · cache_read 16,164,734 · cache_create 1,545,808
- **claude-opus-5-5**: 3 agent · 56 calls · out 44,746 · in 112 · cache_read 6,985,778 · cache_create 403,503
- **claude-haiku-4-5-20251001**: 16 agent · 35 calls · out 18,557 · in 312 · cache_read 1,622,514 · cache_create 697,131

### S4 round 2 — wf_4536475f-6e3 (26 agent, 155,326 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| judge:E18:spec-alignment | claude-sonnet-5 | 11 | 25,635 | 22 | 1,138,218 | 309 |
| synthesize:report | claude-sonnet-5 | 2 | 22,933 | 4 | 115,913 | 247 |
| ui:E14 | claude-sonnet-5 | 20 | 17,565 | 40 | 2,326,247 | 323 |
| review:measurement | claude-opus-5-5 | 14 | 17,470 | 28 | 1,738,508 | 203 |
| judge:E18:operational-feasibility | claude-sonnet-5 | 2 | 16,769 | 4 | 126,897 | 188 |
| review:bugs | claude-opus-5-5 | 18 | 13,462 | 36 | 2,088,101 | 172 |
| judge:E18:domain-correctness | claude-sonnet-5 | 2 | 11,808 | 4 | 90,760 | 129 |
| triage | claude-sonnet-5 | 2 | 7,379 | 4 | 94,409 | 102 |
| review:conventions | claude-opus-5-5 | 11 | 4,144 | 22 | 1,032,934 | 64 |
| machine:bun _acceptance/cua-vao-dang-nhap/rang/s | claude-haiku-4-5-20251001 | 2 | 1,887 | 18 | 90,121 | 24 |
| machine:GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-ci- | claude-haiku-4-5-20251001 | 2 | 1,785 | 18 | 90,225 | 47 |
| machine:bun run test | claude-haiku-4-5-20251001 | 6 | 1,485 | 50 | 340,860 | 372 |
| machine:for t in apps/app/components/auth-shell. | claude-haiku-4-5-20251001 | 2 | 1,425 | 18 | 90,184 | 20 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,210 | 18 | 90,091 | 18 |
| machine:bun _acceptance/cua-vao-dang-nhap/rang/m | claude-haiku-4-5-20251001 | 2 | 1,197 | 18 | 90,123 | 21 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,112 | 18 | 90,176 | 17 |
| machine:bun _acceptance/cua-vao-dang-nhap/rang/t | claude-haiku-4-5-20251001 | 2 | 1,088 | 18 | 90,124 | 128 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,066 | 18 | 90,153 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,018 | 18 | 90,156 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 970 | 18 | 90,155 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 841 | 18 | 90,149 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 761 | 18 | 90,145 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 751 | 18 | 90,091 | 24 |
| capture:provenance | claude-sonnet-5 | 2 | 653 | 4 | 89,996 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 616 | 18 | 90,089 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 296 | 18 | 90,156 | 15 |


wall: 798s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 16 | 17,508 | 1,692,998 | 431 | 05:52:07 | 05:59:18 |
| ui | 1 | 17,565 | 2,326,247 | 323 | 05:52:24 | 05:57:47 |
| judge | 3 | 54,212 | 1,355,875 | 312 | 05:52:25 | 05:57:37 |
| review | 3 | 35,076 | 4,859,543 | 207 | 05:52:27 | 05:55:53 |
| triage | 1 | 7,379 | 94,409 | 102 | 05:59:19 | 06:01:02 |
| capture | 1 | 653 | 89,996 | 14 | 06:01:03 | 06:01:17 |
| synthesize | 1 | 22,933 | 115,913 | 247 | 06:01:18 | 06:05:25 |

- **claude-sonnet-5**: 7 agent · 41 calls · out 102,742 · in 82 · cache_read 3,982,440 · cache_create 790,109
- **claude-opus-5-5**: 3 agent · 43 calls · out 35,076 · in 86 · cache_read 4,859,543 · cache_create 353,934
- **claude-haiku-4-5-20251001**: 16 agent · 36 calls · out 17,508 · in 320 · cache_read 1,692,998 · cache_create 694,363

