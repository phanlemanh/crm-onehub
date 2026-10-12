### S4 round 1 — wf_c2b00020-990 (26 agent, 81,243 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 10 | 18,948 | 20 | 1,326,178 | 262 |
| review:bugs | claude-opus-5-5 | 13 | 10,425 | 26 | 1,465,642 | 128 |
| review:conventions | claude-opus-5-5 | 16 | 10,365 | 32 | 1,895,440 | 138 |
| synthesize:report | claude-sonnet-5-5 | 3 | 8,087 | 6 | 246,413 | 53 |
| triage | claude-sonnet-5-5 | 2 | 5,657 | 4 | 96,742 | 43 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,761 | 4 | 126,052 | 69 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,619 | 4 | 90,987 | 217 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 2,401 | 8 | 291,065 | 29 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,119 | 4 | 125,997 | 11 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 2,069 | 4 | 126,037 | 12 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 2,012 | 4 | 126,038 | 229 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,425 | 4 | 126,056 | 56 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,292 | 4 | 126,034 | 8 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,282 | 4 | 126,037 | 18 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,264 | 4 | 126,037 | 18 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,177 | 4 | 126,038 | 40 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 970 | 4 | 126,013 | 244 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 963 | 4 | 126,037 | 8 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 951 | 4 | 126,039 | 8 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 921 | 4 | 126,037 | 6 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 768 | 4 | 126,036 | 7 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 740 | 4 | 126,022 | 231 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 716 | 4 | 125,995 | 22 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 572 | 4 | 125,991 | 7 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 377 | 4 | 126,036 | 18 |
| capture:provenance | claude-sonnet-5-5 | 2 | 362 | 4 | 89,779 | 8 |


wall: 905s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,401 | 291,065 | 29 | 04:57:27 | 04:57:56 |
| machine | 19 | 24,998 | 2,359,519 | 801 | 04:57:27 | 05:10:48 |
| review | 3 | 39,738 | 4,687,260 | 265 | 04:57:36 | 05:02:02 |
| triage | 1 | 5,657 | 96,742 | 43 | 05:10:48 | 05:11:31 |
| capture | 1 | 362 | 89,779 | 8 | 05:11:31 | 05:11:39 |
| synthesize | 1 | 8,087 | 246,413 | 53 | 05:11:39 | 05:12:32 |

- **claude-opus-5-5**: 3 agent · 39 calls · out 39,738 · in 78 · cache_read 4,687,260 · cache_create 395,311
- **claude-sonnet-5-5**: 4 agent · 11 calls · out 16,507 · in 22 · cache_read 723,999 · cache_create 435,935
- **claude-haiku-5-5**: 19 agent · 38 calls · out 24,998 · in 76 · cache_read 2,359,519 · cache_create 1,226,082

### S4 round 2 — wf_04270baa-f23 (25 agent, 91,349 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 29 | 19,433 | 58 | 4,045,333 | 250 |
| review:measurement | claude-opus-5-5 | 13 | 17,880 | 26 | 1,757,844 | 199 |
| review:conventions | claude-opus-5-5 | 19 | 12,796 | 38 | 2,274,761 | 158 |
| synthesize:report | claude-sonnet-5-5 | 6 | 11,387 | 12 | 659,785 | 83 |
| triage | claude-sonnet-5-5 | 2 | 4,867 | 4 | 95,892 | 38 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 2,646 | 4 | 90,976 | 218 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 2,130 | 4 | 126,045 | 46 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,918 | 4 | 125,986 | 10 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,746 | 4 | 126,027 | 235 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,743 | 4 | 126,002 | 251 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,566 | 4 | 126,026 | 17 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,482 | 4 | 126,023 | 9 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,133 | 4 | 126,025 | 23 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,129 | 4 | 126,026 | 8 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,124 | 4 | 126,026 | 10 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,031 | 4 | 126,026 | 16 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,019 | 4 | 126,028 | 7 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 960 | 4 | 126,027 | 39 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 947 | 4 | 126,041 | 64 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 946 | 4 | 126,026 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 863 | 4 | 125,984 | 22 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 841 | 4 | 126,011 | 233 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 759 | 4 | 126,025 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 669 | 4 | 125,980 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 334 | 4 | 89,768 | 7 |


wall: 933s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 19 | 24,652 | 2,359,310 | 805 | 05:17:26 | 05:30:50 |
| review | 3 | 50,109 | 8,077,938 | 251 | 05:17:35 | 05:21:45 |
| triage | 1 | 4,867 | 95,892 | 38 | 05:30:51 | 05:31:29 |
| capture | 1 | 334 | 89,768 | 7 | 05:31:29 | 05:31:36 |
| synthesize | 1 | 11,387 | 659,785 | 83 | 05:31:36 | 05:32:59 |

- **claude-opus-5-5**: 3 agent · 61 calls · out 50,109 · in 122 · cache_read 8,077,938 · cache_create 438,207
- **claude-sonnet-5-5**: 3 agent · 10 calls · out 16,588 · in 20 · cache_read 845,445 · cache_create 344,750
- **claude-haiku-5-5**: 19 agent · 38 calls · out 24,652 · in 76 · cache_read 2,359,310 · cache_create 1,226,422

### S4 round 3 — wf_c9f0a576-3df (25 agent, 37,947 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 5,581 | 8 | 366,393 | 40 |
| review:bugs | claude-opus-5-5 | 12 | 4,534 | 24 | 1,218,854 | 67 |
| review:conventions | claude-opus-5-5 | 9 | 4,023 | 18 | 808,737 | 54 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,356 | 4 | 126,011 | 12 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,621 | 4 | 126,051 | 9 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,584 | 4 | 126,052 | 154 |
| review:measurement | claude-opus-5-5 | 5 | 1,543 | 10 | 427,502 | 24 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,365 | 4 | 126,048 | 8 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,351 | 4 | 126,070 | 58 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,294 | 4 | 126,051 | 14 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,206 | 4 | 126,051 | 10 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 1,131 | 4 | 126,051 | 16 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,110 | 4 | 126,027 | 250 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 960 | 4 | 126,053 | 8 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 949 | 4 | 126,052 | 38 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 927 | 4 | 126,066 | 64 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 891 | 4 | 91,001 | 207 |
| triage | claude-sonnet-5-5 | 2 | 875 | 4 | 91,924 | 11 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 854 | 4 | 126,036 | 238 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 805 | 4 | 126,051 | 8 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 773 | 4 | 126,050 | 8 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 686 | 4 | 126,009 | 22 |
| machine:bun _acceptance/giam-phut-ci-nhap-t1/ran | claude-haiku-5-5 | 2 | 643 | 4 | 126,050 | 22 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 512 | 4 | 126,005 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 373 | 4 | 89,793 | 8 |


wall: 1012s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 19 | 21,018 | 2,359,785 | 953 | 05:38:43 | 05:54:36 |
| review | 3 | 10,100 | 2,455,093 | 68 | 05:38:52 | 05:40:00 |
| triage | 1 | 875 | 91,924 | 11 | 05:54:36 | 05:54:47 |
| capture | 1 | 373 | 89,793 | 8 | 05:54:47 | 05:54:55 |
| synthesize | 1 | 5,581 | 366,393 | 40 | 05:54:55 | 05:55:35 |

- **claude-sonnet-5-5**: 3 agent · 8 calls · out 6,829 · in 16 · cache_read 548,110 · cache_create 330,806
- **claude-opus-5-5**: 3 agent · 26 calls · out 10,100 · in 52 · cache_read 2,455,093 · cache_create 268,838
- **claude-haiku-5-5**: 19 agent · 38 calls · out 21,018 · in 76 · cache_read 2,359,785 · cache_create 1,226,145

