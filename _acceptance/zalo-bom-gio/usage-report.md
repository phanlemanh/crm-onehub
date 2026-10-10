### S4 round 1 — wf_4ba72ee6-651 (22 agent, 28,947 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 6,713 | 8 | 331,288 | 49 |
| triage | claude-sonnet-5-5 | 2 | 3,128 | 4 | 94,771 | 25 |
| review:conventions | claude-opus-5-5 | 15 | 2,391 | 30 | 1,546,883 | 130 |
| review:measurement | claude-opus-5-5 | 8 | 1,890 | 16 | 767,621 | 130 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,840 | 4 | 125,097 | 72 |
| review:bugs | claude-opus-5-5 | 13 | 1,417 | 26 | 1,394,898 | 131 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,260 | 4 | 125,040 | 39 |
| machine:bun run test -- "bash _acceptance/zalo-b | claude-haiku-5-5 | 2 | 1,185 | 4 | 125,077 | 16 |
| refute:config.yaml | claude-sonnet-5-5 | 4 | 986 | 8 | 322,221 | 25 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 985 | 4 | 125,042 | 10 |
| baseline:diffBase | claude-sonnet-5-5 | 16 | 965 | 32 | 1,537,484 | 89 |
| refute:config.yaml | claude-sonnet-5-5 | 4 | 937 | 8 | 329,281 | 24 |
| refute:hai-moc.sh | claude-sonnet-5-5 | 4 | 914 | 8 | 322,473 | 25 |
| refute:evals.yaml | claude-sonnet-5-5 | 4 | 903 | 8 | 283,743 | 20 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 871 | 4 | 125,078 | 13 |
| refute:evals.yaml | claude-sonnet-5-5 | 3 | 863 | 6 | 220,797 | 15 |
| machine:git diff --name-only 91fe8d69f HEAD \| gr | claude-haiku-5-5 | 2 | 447 | 4 | 125,183 | 8 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 419 | 4 | 125,058 | 240 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 265 | 4 | 125,067 | 231 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 254 | 4 | 125,042 | 207 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 168 | 4 | 125,036 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 89,118 | 7 |


wall: 935s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 965 | 1,537,484 | 89 | 02:32:06 | 02:33:36 |
| machine | 10 | 7,694 | 1,250,720 | 818 | 02:32:06 | 02:45:45 |
| review | 3 | 5,698 | 3,709,402 | 133 | 02:32:06 | 02:34:19 |
| triage | 1 | 3,128 | 94,771 | 25 | 02:45:47 | 02:46:11 |
| refute | 5 | 4,603 | 1,478,515 | 28 | 02:46:13 | 02:46:41 |
| capture | 1 | 146 | 89,118 | 7 | 02:46:43 | 02:46:50 |
| synthesize | 1 | 6,713 | 331,288 | 49 | 02:46:53 | 02:47:41 |

- **claude-sonnet-5-5**: 9 agent · 43 calls · out 15,555 · in 86 · cache_read 3,531,176 · cache_create 788,098
- **claude-opus-5-5**: 3 agent · 36 calls · out 5,698 · in 72 · cache_read 3,709,402 · cache_create 314,634
- **claude-haiku-5-5**: 10 agent · 20 calls · out 7,694 · in 40 · cache_read 1,250,720 · cache_create 618,591

