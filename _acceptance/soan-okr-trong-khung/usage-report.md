### S4 round 1 — wf_c354b53a-0fe (40 agent, 88,066 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 15,292 | 6 | 265,441 | 107 |
| triage | claude-sonnet-5-5 | 2 | 8,701 | 4 | 97,371 | 69 |
| review:measurement | claude-opus-5-5 | 35 | 5,777 | 70 | 6,612,304 | 336 |
| judge:E12:domain-correctness | claude-sonnet-5-5 | 2 | 5,246 | 4 | 89,769 | 44 |
| judge:E12:spec-alignment | claude-sonnet-5-5 | 2 | 4,139 | 4 | 124,689 | 38 |
| judge:E12:operational-feasibility | claude-sonnet-5-5 | 2 | 3,904 | 4 | 124,691 | 32 |
| ui:E11 | claude-sonnet-5-5 | 17 | 3,846 | 34 | 1,841,378 | 374 |
| ui:E2b | claude-sonnet-5-5 | 17 | 3,640 | 34 | 1,746,434 | 633 |
| ui:E4 | claude-sonnet-5-5 | 12 | 3,480 | 24 | 1,172,761 | 961 |
| ui:E3 | claude-sonnet-5-5 | 10 | 3,242 | 20 | 941,021 | 770 |
| ui:E8 | claude-sonnet-5-5 | 7 | 2,742 | 14 | 579,829 | 470 |
| ui:E7b | claude-sonnet-5-5 | 7 | 2,503 | 14 | 581,148 | 776 |
| ui:E6 | claude-sonnet-5-5 | 7 | 2,490 | 14 | 573,066 | 853 |
| ui:E1b | claude-sonnet-5-5 | 9 | 2,222 | 18 | 777,992 | 926 |
| review:conventions | claude-opus-5-5 | 25 | 2,058 | 50 | 3,705,789 | 205 |
| ui:E14 | claude-sonnet-5-5 | 9 | 1,787 | 18 | 798,569 | 817 |
| review:bugs | claude-opus-5-5 | 36 | 1,785 | 72 | 5,952,490 | 342 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,739 | 4 | 35,010 | 348 |
| refute:man-dua-vao.mjs | claude-sonnet-5-5 | 6 | 1,543 | 12 | 538,051 | 39 |
| baseline:diffBase | claude-sonnet-5-5 | 8 | 1,486 | 16 | 726,643 | 57 |
| refute:luat.mjs | claude-sonnet-5-5 | 3 | 1,219 | 6 | 221,490 | 21 |
| machine:{ find "apps/app/app/(app)/[slug]/okr/so | claude-haiku-5-5 | 2 | 1,172 | 4 | 124,563 | 18 |
| refute:soan-okr-trong-khung.dom.tsx | claude-sonnet-5-5 | 4 | 1,089 | 8 | 329,822 | 28 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,011 | 4 | 124,302 | 10 |
| refute:soan-okr-trong-khung.dom.tsx | claude-sonnet-5-5 | 3 | 777 | 6 | 226,160 | 17 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 777 | 4 | 124,300 | 29 |
| refute:luat.mjs | claude-sonnet-5-5 | 4 | 766 | 8 | 282,926 | 24 |
| refute:soan-okr-trong-khung.dom.tsx | claude-sonnet-5-5 | 4 | 639 | 8 | 314,358 | 22 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 502 | 4 | 124,389 | 14 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 415 | 4 | 124,415 | 279 |
| machine:bun _acceptance/soan-okr-trong-khung/ran | claude-haiku-5-5 | 2 | 376 | 4 | 124,333 | 50 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 302 | 4 | 124,454 | 73 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 268 | 4 | 124,424 | 255 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 201 | 4 | 124,389 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 200 | 4 | 124,388 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 199 | 4 | 124,389 | 14 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 188 | 4 | 124,296 | 8 |
| machine:bun _acceptance/soan-okr-trong-khung/ran | claude-haiku-5-5 | 2 | 169 | 4 | 124,331 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 88,555 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 26 | 4 | 124,389 | 13 |


wall: 1256s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,486 | 726,643 | 57 | 12:56:43 | 12:57:39 |
| machine | 15 | 7,545 | 1,776,372 | 1017 | 12:56:43 | 13:13:40 |
| ui | 9 | 25,952 | 9,012,198 | 978 | 12:56:43 | 13:13:01 |
| judge | 3 | 13,289 | 339,149 | 77 | 12:57:37 | 12:58:54 |
| review | 3 | 9,620 | 16,270,583 | 543 | 12:58:24 | 13:07:27 |
| triage | 1 | 8,701 | 97,371 | 69 | 13:13:42 | 13:14:51 |
| refute | 6 | 6,033 | 1,912,807 | 42 | 13:14:53 | 13:15:36 |
| capture | 1 | 148 | 88,555 | 11 | 13:15:38 | 13:15:49 |
| synthesize | 1 | 15,292 | 265,441 | 107 | 13:15:51 | 13:17:38 |

- **claude-sonnet-5-5**: 22 agent · 140 calls · out 70,901 · in 280 · cache_read 12,442,164 · cache_create 2,515,109
- **claude-opus-5-5**: 3 agent · 96 calls · out 9,620 · in 192 · cache_read 16,270,583 · cache_create 574,407
- **claude-haiku-5-5**: 15 agent · 30 calls · out 7,545 · in 60 · cache_read 1,776,372 · cache_create 1,003,973

### S4 round 2 — wf_483933ab-61c (33 agent, 75,603 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 14,366 | 8 | 396,068 | 118 |
| judge:E12:domain-correctness | claude-sonnet-5-5 | 3 | 5,828 | 6 | 202,952 | 49 |
| ui:E11 | claude-sonnet-5-5 | 19 | 3,937 | 38 | 2,054,012 | 425 |
| judge:E12:spec-alignment | claude-sonnet-5-5 | 2 | 3,769 | 4 | 124,689 | 32 |
| judge:E12:operational-feasibility | claude-sonnet-5-5 | 2 | 3,716 | 4 | 124,691 | 35 |
| ui:E4 | claude-sonnet-5-5 | 8 | 3,712 | 16 | 789,372 | 495 |
| ui:E8 | claude-sonnet-5-5 | 9 | 3,613 | 18 | 708,053 | 1025 |
| ui:E3 | claude-sonnet-5-5 | 10 | 3,484 | 20 | 977,910 | 842 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,197 | 4 | 124,300 | 35 |
| triage | claude-sonnet-5-5 | 2 | 2,798 | 4 | 92,874 | 30 |
| ui:E7b | claude-sonnet-5-5 | 10 | 2,591 | 20 | 908,518 | 680 |
| ui:E6 | claude-sonnet-5-5 | 8 | 2,389 | 16 | 780,447 | 309 |
| ui:E2b | claude-sonnet-5-5 | 10 | 2,356 | 20 | 921,482 | 942 |
| review:conventions | claude-opus-5-5 | 9 | 2,290 | 18 | 965,777 | 87 |
| review:measurement | claude-opus-5-5 | 13 | 2,137 | 26 | 1,619,941 | 126 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,059 | 4 | 124,454 | 77 |
| ui:E14 | claude-sonnet-5-5 | 9 | 1,692 | 18 | 805,780 | 714 |
| review:bugs | claude-opus-5-5 | 21 | 1,666 | 42 | 2,993,743 | 179 |
| ui:E1b | claude-sonnet-5-5 | 10 | 1,609 | 20 | 878,426 | 660 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,587 | 4 | 124,424 | 286 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,581 | 4 | 124,415 | 293 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 1,255 | 8 | 286,806 | 31 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,036 | 4 | 124,302 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 617 | 4 | 0 | 365 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 486 | 4 | 124,389 | 13 |
| machine:bun _acceptance/soan-okr-trong-khung/ran | claude-haiku-5-5 | 2 | 376 | 4 | 124,333 | 49 |
| machine:bun _acceptance/soan-okr-trong-khung/ran | claude-haiku-5-5 | 2 | 322 | 4 | 124,331 | 11 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 124,296 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 201 | 4 | 124,389 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 201 | 4 | 124,388 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 199 | 4 | 124,389 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 177 | 4 | 124,389 | 12 |
| capture:provenance | claude-sonnet-5-5 | 2 | 143 | 4 | 88,555 | 14 |


wall: 1262s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,255 | 286,806 | 32 | 13:23:52 | 13:24:24 |
| machine | 14 | 12,252 | 1,616,799 | 1092 | 13:23:52 | 13:42:04 |
| ui | 9 | 25,383 | 8,824,000 | 1042 | 13:23:52 | 13:41:14 |
| judge | 3 | 13,313 | 452,332 | 83 | 13:24:26 | 13:25:49 |
| review | 3 | 6,093 | 5,579,461 | 215 | 13:25:25 | 13:29:00 |
| triage | 1 | 2,798 | 92,874 | 30 | 13:42:07 | 13:42:38 |
| capture | 1 | 143 | 88,555 | 14 | 13:42:40 | 13:42:54 |
| synthesize | 1 | 14,366 | 396,068 | 118 | 13:42:56 | 13:44:54 |

- **claude-sonnet-5-5**: 16 agent · 112 calls · out 57,258 · in 224 · cache_read 10,140,635 · cache_create 2,040,489
- **claude-haiku-5-5**: 14 agent · 28 calls · out 12,252 · in 56 · cache_read 1,616,799 · cache_create 978,621
- **claude-opus-5-5**: 3 agent · 43 calls · out 6,093 · in 86 · cache_read 5,579,461 · cache_create 395,689

### S4 round 2 (chấm lại trên cây mới) — wf_20c831f9-ce5 (32 agent, 65,212 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 14,026 | 12 | 692,687 | 128 |
| ui:E11 | claude-sonnet-5-5 | 89 | 4,499 | 178 | 12,083,057 | 381 |
| judge:E12:spec-alignment | claude-sonnet-5-5 | 2 | 4,070 | 4 | 125,124 | 40 |
| ui:E3 | claude-sonnet-5-5 | 9 | 3,675 | 18 | 797,480 | 747 |
| judge:E12:domain-correctness | claude-sonnet-5-5 | 2 | 3,581 | 4 | 90,204 | 30 |
| ui:E8 | claude-sonnet-5-5 | 8 | 3,570 | 16 | 760,236 | 480 |
| judge:E12:operational-feasibility | claude-sonnet-5-5 | 2 | 3,438 | 4 | 125,126 | 34 |
| review:bugs | claude-opus-5-5 | 13 | 3,416 | 26 | 1,604,467 | 104 |
| ui:E14 | claude-sonnet-5-5 | 10 | 3,168 | 20 | 936,531 | 930 |
| ui:E4 | claude-sonnet-5-5 | 9 | 2,689 | 18 | 789,570 | 733 |
| triage | claude-sonnet-5-5 | 2 | 2,484 | 4 | 92,196 | 24 |
| ui:E6 | claude-sonnet-5-5 | 11 | 2,411 | 22 | 1,047,302 | 844 |
| ui:E1b | claude-sonnet-5-5 | 7 | 2,374 | 14 | 572,690 | 599 |
| ui:E7b | claude-sonnet-5-5 | 10 | 2,323 | 20 | 899,220 | 951 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,069 | 4 | 124,622 | 77 |
| review:conventions | claude-opus-5-5 | 8 | 1,215 | 16 | 769,460 | 50 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 922 | 4 | 124,470 | 12 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 775 | 4 | 124,583 | 273 |
| machine:{ find "apps/app/app/(app)/[slug]/okr/so | claude-haiku-5-5 | 2 | 631 | 4 | 124,998 | 15 |
| review:measurement | claude-opus-5-5 | 4 | 520 | 8 | 352,380 | 24 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 509 | 4 | 124,824 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 436 | 4 | 124,824 | 15 |
| machine:bun _acceptance/soan-okr-trong-khung/ran | claude-haiku-5-5 | 2 | 376 | 4 | 124,768 | 47 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 300 | 4 | 124,823 | 14 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 290 | 4 | 124,468 | 27 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 290 | 4 | 124,592 | 268 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 251 | 4 | 35,010 | 322 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 200 | 4 | 124,824 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 199 | 4 | 124,824 | 15 |
| machine:bun _acceptance/soan-okr-trong-khung/ran | claude-haiku-5-5 | 2 | 191 | 4 | 124,766 | 11 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 168 | 4 | 124,464 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 88,723 | 11 |


wall: 1173s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 15 | 7,607 | 1,780,860 | 1003 | 13:50:02 | 14:06:44 |
| ui | 8 | 24,709 | 17,886,086 | 967 | 13:50:02 | 14:06:09 |
| judge | 3 | 11,089 | 340,454 | 71 | 13:50:21 | 13:51:32 |
| review | 3 | 5,151 | 2,726,307 | 111 | 13:50:53 | 13:52:44 |
| triage | 1 | 2,484 | 92,196 | 24 | 14:06:47 | 14:07:11 |
| capture | 1 | 146 | 88,723 | 11 | 14:07:13 | 14:07:24 |
| synthesize | 1 | 14,026 | 692,687 | 128 | 14:07:27 | 14:09:35 |

- **claude-sonnet-5-5**: 14 agent · 169 calls · out 52,454 · in 338 · cache_read 19,100,146 · cache_create 1,896,514
- **claude-opus-5-5**: 3 agent · 25 calls · out 5,151 · in 50 · cache_read 2,726,307 · cache_create 317,608
- **claude-haiku-5-5**: 15 agent · 30 calls · out 7,607 · in 60 · cache_read 1,780,860 · cache_create 1,009,549

