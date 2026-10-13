### S4 round 1 — wf_709704f5-e09 (24 agent, 79,149 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 12,419 | 6 | 129,436 | 73 |
| review:measurement | claude-opus-5-5 | 12 | 10,543 | 24 | 794,486 | 129 |
| review:bugs | claude-opus-5-5 | 19 | 9,720 | 38 | 1,363,664 | 134 |
| review:conventions | claude-opus-5-5 | 18 | 8,688 | 36 | 1,129,763 | 122 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 5,902 | 4 | 43,612 | 36 |
| ui:E11 | claude-sonnet-5-5 | 8 | 4,292 | 16 | 751,874 | 57 |
| triage | claude-sonnet-5-5 | 2 | 3,999 | 4 | 41,945 | 31 |
| ui:E10 | claude-sonnet-5-5 | 7 | 3,601 | 14 | 615,110 | 80 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,332 | 4 | 40,834 | 13 |
| refute:man.mjs | claude-sonnet-5-5 | 7 | 2,290 | 14 | 285,688 | 31 |
| refute:man.mjs | claude-sonnet-5-5 | 5 | 2,079 | 10 | 175,044 | 24 |
| machine:cd apps/app && TBD_MUI_GIO=tien TZ=Pacif | claude-haiku-5-5 | 2 | 1,541 | 4 | 40,913 | 13 |
| machine:cd apps/app && TBD_MUI_GIO=lui TZ=Americ | claude-haiku-5-5 | 2 | 1,418 | 4 | 40,910 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,235 | 4 | 40,850 | 277 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,192 | 4 | 40,889 | 71 |
| machine:bun _acceptance/them-buoc-bao-dung/rang/ | claude-haiku-5-5 | 2 | 1,156 | 4 | 41,101 | 20 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,041 | 4 | 40,859 | 243 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,036 | 4 | 40,846 | 15 |
| machine:bun run test -- "cd apps/api && TBD_KHU_ | claude-haiku-5-5 | 2 | 948 | 4 | 40,956 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 943 | 4 | 40,904 | 11 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 857 | 4 | 40,832 | 25 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 766 | 4 | 40,828 | 12 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 657 | 4 | 40,814 | 268 |
| capture:provenance | claude-sonnet-5-5 | 2 | 494 | 4 | 36,755 | 8 |


wall: 1056s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,902 | 43,612 | 36 | 01:51:40 | 01:52:16 |
| machine | 13 | 15,122 | 531,536 | 909 | 01:51:40 | 02:06:49 |
| ui | 2 | 7,893 | 1,366,984 | 81 | 01:51:40 | 01:53:00 |
| review | 3 | 28,951 | 3,287,913 | 142 | 01:51:40 | 01:54:02 |
| triage | 1 | 3,999 | 41,945 | 31 | 02:06:49 | 02:07:20 |
| refute | 2 | 4,369 | 460,732 | 33 | 02:07:20 | 02:07:53 |
| capture | 1 | 494 | 36,755 | 8 | 02:07:53 | 02:08:02 |
| synthesize | 1 | 12,419 | 129,436 | 73 | 02:08:02 | 02:09:15 |

- **claude-sonnet-5-5**: 8 agent · 36 calls · out 35,076 · in 72 · cache_read 2,079,464 · cache_create 508,458
- **claude-opus-5-5**: 3 agent · 49 calls · out 28,951 · in 98 · cache_read 3,287,913 · cache_create 276,186
- **claude-haiku-5-5**: 13 agent · 26 calls · out 15,122 · in 52 · cache_read 531,536 · cache_create 539,296

### S4 round 2 — wf_00b9c2b3-79a (17 agent, 51,134 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 8,296 | 8 | 204,433 | 56 |
| review:bugs | claude-opus-5-5 | 17 | 8,101 | 34 | 900,840 | 108 |
| review:measurement | claude-opus-5-5 | 12 | 7,555 | 24 | 753,484 | 96 |
| ui:E10 | claude-sonnet-5-5 | 5 | 4,128 | 10 | 401,914 | 55 |
| ui:E11 | claude-sonnet-5-5 | 7 | 3,819 | 14 | 647,988 | 75 |
| refute:man.mjs | claude-sonnet-5-5 | 7 | 3,319 | 14 | 291,969 | 40 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 3,073 | 4 | 41,435 | 23 |
| refute:man.mjs | claude-sonnet-5-5 | 5 | 3,024 | 10 | 187,858 | 35 |
| review:conventions | claude-opus-5-5 | 11 | 2,659 | 22 | 508,991 | 50 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,129 | 4 | 41,490 | 73 |
| triage | claude-sonnet-5-5 | 2 | 1,129 | 4 | 40,738 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,039 | 4 | 41,451 | 276 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 982 | 4 | 37,972 | 266 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 882 | 4 | 41,460 | 240 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 849 | 4 | 41,433 | 24 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 738 | 4 | 41,429 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 412 | 4 | 37,356 | 8 |


wall: 1030s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 7 | 8,692 | 286,670 | 915 | 02:12:15 | 02:27:30 |
| ui | 2 | 7,947 | 1,049,902 | 78 | 02:12:15 | 02:13:33 |
| review | 3 | 18,315 | 2,163,315 | 109 | 02:12:15 | 02:14:05 |
| triage | 1 | 1,129 | 40,738 | 11 | 02:27:30 | 02:27:41 |
| refute | 2 | 6,343 | 479,827 | 40 | 02:27:41 | 02:28:21 |
| capture | 1 | 412 | 37,356 | 8 | 02:28:21 | 02:28:29 |
| synthesize | 1 | 8,296 | 204,433 | 56 | 02:28:29 | 02:29:26 |

- **claude-sonnet-5-5**: 7 agent · 32 calls · out 24,127 · in 64 · cache_read 1,812,256 · cache_create 475,631
- **claude-opus-5-5**: 3 agent · 40 calls · out 18,315 · in 80 · cache_read 2,163,315 · cache_create 210,962
- **claude-haiku-5-5**: 7 agent · 14 calls · out 8,692 · in 28 · cache_read 286,670 · cache_create 297,685

### S4 round 3 — wf_a27388d2-b0a (15 agent, 48,226 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 8,222 | 8 | 203,525 | 54 |
| review:bugs | claude-opus-5-5 | 20 | 8,014 | 40 | 1,160,336 | 112 |
| review:measurement | claude-opus-5-5 | 17 | 7,498 | 34 | 914,979 | 104 |
| ui:E10 | claude-sonnet-5-5 | 7 | 4,390 | 14 | 616,826 | 61 |
| review:conventions | claude-opus-5-5 | 9 | 4,377 | 18 | 389,798 | 58 |
| ui:E11 | claude-sonnet-5-5 | 6 | 3,601 | 12 | 544,756 | 76 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,985 | 4 | 41,515 | 73 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,940 | 4 | 41,460 | 18 |
| triage | claude-sonnet-5-5 | 2 | 1,353 | 4 | 40,513 | 13 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,084 | 4 | 40,866 | 238 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 979 | 4 | 41,476 | 246 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 858 | 4 | 41,458 | 24 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 855 | 4 | 41,485 | 239 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 654 | 4 | 41,454 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 416 | 4 | 37,381 | 8 |


wall: 924s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 7 | 10,355 | 289,714 | 849 | 02:31:31 | 02:45:40 |
| ui | 2 | 7,991 | 1,161,582 | 79 | 02:31:31 | 02:32:50 |
| review | 3 | 19,889 | 2,465,113 | 113 | 02:31:31 | 02:33:24 |
| triage | 1 | 1,353 | 40,513 | 13 | 02:45:40 | 02:45:53 |
| capture | 1 | 416 | 37,381 | 8 | 02:45:53 | 02:46:01 |
| synthesize | 1 | 8,222 | 203,525 | 54 | 02:46:01 | 02:46:55 |

- **claude-sonnet-5-5**: 5 agent · 21 calls · out 17,982 · in 42 · cache_read 1,443,001 · cache_create 358,122
- **claude-opus-5-5**: 3 agent · 46 calls · out 19,889 · in 92 · cache_read 2,465,113 · cache_create 203,012
- **claude-haiku-5-5**: 7 agent · 14 calls · out 10,355 · in 28 · cache_read 289,714 · cache_create 295,033

### S4 round 4 (delta sau #386) — wf_b8bac3e9-4ab (21 agent, 56,036 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 8,890 | 12 | 324,233 | 58 |
| review:bugs | claude-opus-5-5 | 18 | 8,467 | 36 | 1,346,684 | 122 |
| review:conventions | claude-opus-5-5 | 15 | 6,266 | 30 | 996,394 | 92 |
| review:measurement | claude-opus-5-5 | 14 | 5,425 | 28 | 1,044,961 | 83 |
| machine:bun _acceptance/them-buoc-bao-dung/rang/ | claude-haiku-5-5 | 2 | 4,525 | 4 | 41,094 | 46 |
| ui:E11 | claude-sonnet-5-5 | 8 | 4,395 | 16 | 759,617 | 85 |
| ui:E10 | claude-sonnet-5-5 | 7 | 3,503 | 14 | 615,651 | 69 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,246 | 4 | 41,209 | 12 |
| machine:cd apps/app && TBD_MUI_GIO=tien TZ=Pacif | claude-haiku-5-5 | 2 | 1,721 | 4 | 40,906 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,202 | 4 | 41,225 | 262 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,174 | 4 | 41,264 | 69 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,045 | 4 | 40,897 | 9 |
| machine:cd apps/app && TBD_MUI_GIO=lui TZ=Americ | claude-haiku-5-5 | 2 | 1,023 | 4 | 40,903 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,021 | 4 | 41,207 | 32 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 992 | 4 | 37,938 | 244 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 896 | 4 | 41,234 | 234 |
| machine:bun run test -- "cd apps/api && TBD_KHU_ | claude-haiku-5-5 | 2 | 893 | 4 | 40,949 | 11 |
| triage | claude-sonnet-5-5 | 2 | 763 | 4 | 39,295 | 10 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 673 | 4 | 41,203 | 7 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 500 | 4 | 40,839 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 416 | 4 | 37,130 | 9 |


wall: 936s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 13 | 17,911 | 530,868 | 859 | 09:21:43 | 09:36:03 |
| ui | 2 | 7,898 | 1,375,268 | 87 | 09:21:43 | 09:23:10 |
| review | 3 | 20,158 | 3,388,039 | 123 | 09:21:43 | 09:23:47 |
| triage | 1 | 763 | 39,295 | 10 | 09:36:03 | 09:36:13 |
| capture | 1 | 416 | 37,130 | 9 | 09:36:13 | 09:36:21 |
| synthesize | 1 | 8,890 | 324,233 | 58 | 09:36:21 | 09:37:20 |

- **claude-sonnet-5-5**: 5 agent · 25 calls · out 17,967 · in 50 · cache_read 1,775,926 · cache_create 351,673
- **claude-opus-5-5**: 3 agent · 47 calls · out 20,158 · in 94 · cache_read 3,388,039 · cache_create 289,593
- **claude-haiku-5-5**: 13 agent · 26 calls · out 17,911 · in 52 · cache_read 530,868 · cache_create 541,625

