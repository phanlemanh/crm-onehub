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

