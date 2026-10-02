### S4 round 1 — wf_5d5d550f-04c (32 agent, 56,979 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 11,103 | 6 | 304,208 | 92 |
| ui:E13 | claude-sonnet-5-5 | 17 | 6,397 | 34 | 2,455,524 | 197 |
| triage | claude-sonnet-5-5 | 2 | 5,157 | 4 | 119,355 | 42 |
| ui:E16 | claude-sonnet-5-5 | 9 | 2,930 | 18 | 1,096,247 | 117 |
| review:bugs | claude-opus-5-5 | 23 | 2,822 | 46 | 3,896,961 | 228 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,774 | 18 | 117,520 | 45 |
| ui:E1 | claude-sonnet-5-5 | 10 | 2,488 | 20 | 1,191,870 | 117 |
| baseline:diffBase | claude-sonnet-5-5 | 9 | 2,221 | 18 | 1,040,639 | 67 |
| ui:E5 | claude-sonnet-5-5 | 7 | 2,022 | 14 | 801,000 | 100 |
| review:measurement | claude-opus-5-5 | 19 | 1,892 | 38 | 3,307,344 | 201 |
| judge:E15:domain-correctness | claude-sonnet-5-5 | 3 | 1,624 | 6 | 250,032 | 16 |
| machine:node _acceptance/muc-tieu-va-kr/rang/ho- | claude-haiku-4-5-20251001 | 20 | 1,577 | 162 | 1,710,912 | 2058 |
| review:conventions | claude-opus-5-5 | 16 | 1,534 | 32 | 2,400,710 | 130 |
| judge:E15:operational-feasibility | claude-sonnet-5-5 | 3 | 1,402 | 6 | 284,718 | 14 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,327 | 18 | 0 | 501 |
| refute:bang-kr.tsx | claude-sonnet-5-5 | 10 | 1,048 | 20 | 1,228,198 | 45 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 954 | 18 | 117,520 | 22 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 812 | 18 | 117,583 | 22 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 797 | 18 | 117,583 | 20 |
| judge:E15:spec-alignment | claude-sonnet-5-5 | 3 | 671 | 6 | 284,714 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 662 | 18 | 117,584 | 19 |
| machine:for t in "packages/ui/src/components/sim | claude-haiku-4-5-20251001 | 2 | 658 | 18 | 117,743 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 610 | 18 | 117,581 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 534 | 18 | 117,582 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 513 | 18 | 117,584 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 486 | 18 | 117,582 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 425 | 18 | 117,584 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 392 | 18 | 117,583 | 18 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 349 | 18 | 117,580 | 18 |
| machine:node _acceptance/muc-tieu-va-kr/rang/kho | claude-haiku-4-5-20251001 | 2 | 343 | 18 | 117,548 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 307 | 18 | 117,518 | 15 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 113,486 | 6 |


wall: 2273s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,221 | 1,040,639 | 67 | 00:48:46 | 00:49:53 |
| machine | 17 | 13,520 | 3,474,587 | 2079 | 00:48:46 | 01:23:25 |
| ui | 4 | 13,837 | 5,544,641 | 199 | 00:49:07 | 00:52:26 |
| judge | 3 | 3,697 | 819,464 | 19 | 00:49:09 | 00:49:28 |
| review | 3 | 6,248 | 9,605,015 | 230 | 00:49:25 | 00:53:15 |
| triage | 1 | 5,157 | 119,355 | 42 | 01:23:27 | 01:24:09 |
| refute | 1 | 1,048 | 1,228,198 | 45 | 01:24:11 | 01:24:57 |
| capture | 1 | 148 | 113,486 | 6 | 01:24:59 | 01:25:05 |
| synthesize | 1 | 11,103 | 304,208 | 92 | 01:25:08 | 01:26:40 |

- **claude-sonnet-5-5**: 12 agent · 78 calls · out 37,211 · in 156 · cache_read 9,169,991 · cache_create 1,574,479
- **claude-opus-5-5**: 3 agent · 58 calls · out 6,248 · in 116 · cache_read 9,605,015 · cache_create 568,845
- **claude-haiku-4-5-20251001**: 17 agent · 52 calls · out 13,520 · in 450 · cache_read 3,474,587 · cache_create 1,576,928

### S4 round 2 — wf_a4579581-4cd (33 agent, 59,339 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 13,378 | 4 | 148,128 | 86 |
| ui:E16 | claude-sonnet-5-5 | 9 | 4,598 | 18 | 1,110,931 | 122 |
| triage | claude-sonnet-5-5 | 2 | 4,576 | 4 | 120,211 | 36 |
| review:measurement | claude-opus-5-5 | 18 | 4,246 | 36 | 3,284,735 | 206 |
| ui:E13 | claude-sonnet-5-5 | 7 | 4,045 | 14 | 828,261 | 138 |
| machine:node _acceptance/muc-tieu-va-kr/rang/ho- | claude-haiku-4-5-20251001 | 61 | 2,977 | 490 | 5,598,010 | 11277 |
| ui:E1 | claude-sonnet-5-5 | 8 | 2,591 | 16 | 928,762 | 141 |
| baseline:diffBase | claude-sonnet-5-5 | 8 | 2,378 | 16 | 896,769 | 58 |
| judge:E15:operational-feasibility | claude-sonnet-5-5 | 2 | 2,299 | 4 | 149,701 | 19 |
| review:conventions | claude-opus-5-5 | 21 | 1,967 | 42 | 3,414,889 | 185 |
| review:bugs | claude-opus-5-5 | 31 | 1,963 | 62 | 6,108,269 | 311 |
| judge:E15:spec-alignment | claude-sonnet-5-5 | 2 | 1,746 | 4 | 149,699 | 22 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 1,520 | 42 | 216,209 | 1051 |
| judge:E15:domain-correctness | claude-sonnet-5-5 | 2 | 1,455 | 4 | 115,002 | 20 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,006 | 18 | 117,900 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 905 | 18 | 118,165 | 22 |
| machine:for t in "packages/ui/src/components/sim | claude-haiku-4-5-20251001 | 2 | 797 | 18 | 118,326 | 19 |
| refute:ho-so-cham.mjs | claude-sonnet-5-5 | 5 | 724 | 10 | 576,605 | 20 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 722 | 18 | 118,167 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 611 | 18 | 118,167 | 19 |
| machine:node _acceptance/muc-tieu-va-kr/rang/kho | claude-haiku-4-5-20251001 | 2 | 573 | 18 | 118,131 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 526 | 18 | 118,164 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 525 | 18 | 118,167 | 20 |
| refute:bang-kr.tsx | claude-sonnet-5-5 | 4 | 518 | 8 | 365,380 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 508 | 18 | 118,166 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 464 | 18 | 118,166 | 15 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 437 | 18 | 118,163 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 389 | 18 | 118,166 | 16 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 375 | 18 | 117,898 | 12 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 269 | 18 | 117,900 | 29 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 114,177 | 6 |
| ui:E5 | claude-sonnet-5-5 | 8 | 100 | 16 | 916,090 | 106 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 118,165 | 16 |


wall: 11461s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,378 | 896,769 | 58 | 08:13:10 | 08:14:08 |
| machine | 17 | 12,607 | 7,586,030 | 11298 | 08:13:10 | 11:21:29 |
| ui | 4 | 11,334 | 3,784,044 | 141 | 08:13:33 | 08:15:53 |
| judge | 3 | 5,500 | 414,402 | 25 | 08:13:34 | 08:13:59 |
| review | 3 | 8,176 | 12,807,893 | 313 | 08:13:51 | 08:19:04 |
| triage | 1 | 4,576 | 120,211 | 36 | 11:21:33 | 11:22:09 |
| refute | 2 | 1,242 | 941,985 | 23 | 11:22:12 | 11:22:34 |
| capture | 1 | 148 | 114,177 | 6 | 11:22:36 | 11:22:43 |
| synthesize | 1 | 13,378 | 148,128 | 86 | 11:22:45 | 11:24:11 |

- **claude-sonnet-5-5**: 13 agent · 61 calls · out 38,556 · in 122 · cache_read 6,419,716 · cache_create 1,736,067
- **claude-opus-5-5**: 3 agent · 70 calls · out 8,176 · in 140 · cache_read 12,807,893 · cache_create 638,542
- **claude-haiku-4-5-20251001**: 17 agent · 96 calls · out 12,607 · in 802 · cache_read 7,586,030 · cache_create 3,320,388

### S4 round 3 — wf_54d5c6c2-606 (32 agent, 62,618 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 13,736 | 8 | 468,230 | 106 |
| review:measurement | claude-opus-5-5 | 21 | 6,904 | 42 | 4,110,009 | 264 |
| ui:E13 | claude-sonnet-5-5 | 8 | 4,055 | 16 | 957,115 | 191 |
| ui:E16 | claude-sonnet-5-5 | 11 | 3,824 | 22 | 1,394,437 | 191 |
| triage | claude-sonnet-5-5 | 2 | 3,711 | 4 | 118,652 | 30 |
| baseline:diffBase | claude-sonnet-5-5 | 10 | 3,310 | 20 | 1,159,939 | 131 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,867 | 18 | 118,014 | 39 |
| judge:E15:spec-alignment | claude-sonnet-5-5 | 2 | 2,571 | 4 | 149,862 | 21 |
| judge:E15:domain-correctness | claude-sonnet-5-5 | 2 | 2,464 | 4 | 115,165 | 49 |
| judge:E15:operational-feasibility | claude-sonnet-5-5 | 2 | 2,386 | 4 | 149,864 | 59 |
| ui:E1 | claude-sonnet-5-5 | 8 | 2,369 | 16 | 930,953 | 179 |
| ui:E5 | claude-sonnet-5-5 | 8 | 1,756 | 16 | 975,695 | 175 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 3 | 1,394 | 28 | 215,054 | 24 |
| review:conventions | claude-opus-5-5 | 22 | 1,149 | 44 | 3,553,204 | 172 |
| machine:node _acceptance/muc-tieu-va-kr/rang/ho- | claude-haiku-4-5-20251001 | 17 | 1,005 | 138 | 1,277,570 | 2444 |
| machine:for t in "packages/ui/src/components/sim | claude-haiku-4-5-20251001 | 2 | 933 | 18 | 118,237 | 81 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 869 | 18 | 118,078 | 21 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 765 | 18 | 118,076 | 16 |
| refute:khong-ve-tay.mjs | claude-sonnet-5-5 | 4 | 739 | 8 | 386,643 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 704 | 18 | 118,078 | 20 |
| machine:node _acceptance/muc-tieu-va-kr/rang/kho | claude-haiku-4-5-20251001 | 2 | 702 | 18 | 118,042 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 684 | 18 | 118,078 | 17 |
| review:bugs | claude-opus-5-5 | 30 | 667 | 60 | 5,279,936 | 237 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 659 | 18 | 118,076 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 420 | 18 | 118,077 | 14 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 390 | 18 | 118,074 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 372 | 18 | 118,075 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 365 | 18 | 118,077 | 17 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 348 | 18 | 0 | 548 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 343 | 18 | 118,012 | 11 |
| capture:provenance | claude-sonnet-5-5 | 2 | 153 | 4 | 114,066 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 118,077 | 20 |


wall: 2640s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,310 | 1,159,939 | 131 | 11:31:27 | 11:33:38 |
| machine | 17 | 12,824 | 3,145,695 | 2463 | 11:31:27 | 12:12:31 |
| ui | 4 | 12,004 | 4,258,200 | 193 | 11:31:49 | 11:35:02 |
| judge | 3 | 7,421 | 414,891 | 61 | 11:31:51 | 11:32:52 |
| review | 3 | 8,720 | 12,943,149 | 267 | 11:32:52 | 11:37:18 |
| triage | 1 | 3,711 | 118,652 | 30 | 12:12:36 | 12:13:05 |
| refute | 1 | 739 | 386,643 | 17 | 12:13:10 | 12:13:27 |
| capture | 1 | 153 | 114,066 | 7 | 12:13:31 | 12:13:38 |
| synthesize | 1 | 13,736 | 468,230 | 106 | 12:13:41 | 12:15:27 |

- **claude-sonnet-5-5**: 12 agent · 63 calls · out 41,074 · in 126 · cache_read 6,920,621 · cache_create 1,603,105
- **claude-opus-5-5**: 3 agent · 73 calls · out 8,720 · in 146 · cache_read 12,943,149 · cache_create 604,676
- **claude-haiku-4-5-20251001**: 17 agent · 50 calls · out 12,824 · in 436 · cache_read 3,145,695 · cache_create 1,667,575

### S4 round 5 (AC-11 hẹp) — wf_49fef62b-03e (31 agent, 55,694 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 10,970 | 6 | 301,578 | 81 |
| review:measurement | claude-opus-5-5 | 21 | 7,190 | 42 | 3,874,853 | 255 |
| judge:E15:domain-correctness | claude-sonnet-5-5 | 2 | 3,823 | 4 | 115,418 | 32 |
| triage | claude-sonnet-5-5 | 2 | 3,752 | 4 | 119,361 | 30 |
| ui:E13 | claude-sonnet-5-5 | 8 | 2,897 | 16 | 986,667 | 104 |
| baseline:diffBase | claude-sonnet-5-5 | 7 | 2,520 | 14 | 763,411 | 54 |
| ui:E5 | claude-sonnet-5-5 | 7 | 2,472 | 14 | 811,687 | 99 |
| judge:E15:operational-feasibility | claude-sonnet-5-5 | 2 | 2,427 | 4 | 150,117 | 19 |
| ui:E1 | claude-sonnet-5-5 | 8 | 2,225 | 16 | 933,866 | 105 |
| judge:E15:spec-alignment | claude-sonnet-5-5 | 2 | 2,178 | 4 | 150,115 | 18 |
| ui:E16 | claude-sonnet-5-5 | 9 | 1,854 | 18 | 1,108,117 | 111 |
| review:bugs | claude-opus-5-5 | 31 | 1,682 | 62 | 5,753,046 | 254 |
| machine:bun run test | claude-haiku-4-5-20251001 | 7 | 1,427 | 58 | 384,843 | 1005 |
| review:conventions | claude-opus-5-5 | 24 | 1,372 | 48 | 3,786,956 | 188 |
| machine:node _acceptance/muc-tieu-va-kr/rang/ho- | claude-haiku-4-5-20251001 | 15 | 1,277 | 122 | 1,047,907 | 2871 |
| machine:for t in "packages/ui/src/components/sim | claude-haiku-4-5-20251001 | 2 | 994 | 18 | 118,442 | 22 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 702 | 18 | 118,281 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 676 | 18 | 118,280 | 19 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 598 | 18 | 118,219 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 594 | 18 | 118,283 | 17 |
| machine:node _acceptance/muc-tieu-va-kr/rang/kho | claude-haiku-4-5-20251001 | 2 | 515 | 18 | 118,247 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 510 | 18 | 118,283 | 17 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 492 | 18 | 118,219 | 36 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-4-5-20251001 | 2 | 489 | 18 | 118,279 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 450 | 18 | 118,282 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 435 | 18 | 118,281 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 406 | 18 | 118,217 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 317 | 18 | 118,282 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 297 | 18 | 118,282 | 17 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 114,319 | 6 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 118,283 | 21 |


wall: 3016s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,520 | 763,411 | 54 | 22:21:55 | 22:22:49 |
| machine | 17 | 10,182 | 3,206,910 | 2893 | 22:21:55 | 23:10:08 |
| ui | 4 | 9,448 | 3,840,337 | 113 | 22:22:18 | 22:24:10 |
| judge | 3 | 8,428 | 415,650 | 32 | 22:22:18 | 22:22:50 |
| review | 3 | 10,244 | 13,414,855 | 258 | 22:22:38 | 22:26:56 |
| triage | 1 | 3,752 | 119,361 | 30 | 23:10:11 | 23:10:40 |
| capture | 1 | 150 | 114,319 | 6 | 23:10:42 | 23:10:48 |
| synthesize | 1 | 10,970 | 301,578 | 81 | 23:10:50 | 23:12:11 |

- **claude-sonnet-5-5**: 11 agent · 52 calls · out 35,268 · in 104 · cache_read 5,554,656 · cache_create 1,458,164
- **claude-opus-5-5**: 3 agent · 76 calls · out 10,244 · in 152 · cache_read 13,414,855 · cache_create 605,572
- **claude-haiku-4-5-20251001**: 17 agent · 52 calls · out 10,182 · in 450 · cache_read 3,206,910 · cache_create 1,857,570

