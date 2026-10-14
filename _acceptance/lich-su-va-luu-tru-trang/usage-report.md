### S4 r1 lich-su-va-luu-tru-trang — wf_bc7eeb80-c15 (34 agent, 141,646 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 20,535 | 6 | 153,922 | 124 |
| review:measurement | claude-opus-5-5 | 33 | 20,452 | 66 | 3,417,927 | 272 |
| review:bugs | claude-opus-5-5 | 24 | 15,142 | 48 | 2,170,143 | 196 |
| review:conventions | claude-opus-5-5 | 23 | 12,138 | 46 | 2,239,963 | 176 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 9,535 | 4 | 47,032 | 51 |
| judge:E13j:domain-correctness | claude-sonnet-5-5 | 4 | 7,398 | 8 | 166,943 | 60 |
| judge:E13j:spec-alignment | claude-sonnet-5-5 | 7 | 6,706 | 14 | 400,228 | 52 |
| ui:E12 | claude-sonnet-5-5 | 8 | 6,249 | 16 | 789,011 | 197 |
| ui:E10 | claude-sonnet-5-5 | 13 | 6,178 | 26 | 1,355,637 | 161 |
| ui:E11 | claude-sonnet-5-5 | 10 | 5,691 | 20 | 1,023,443 | 262 |
| judge:E13j:operational-feasibility | claude-sonnet-5-5 | 4 | 5,649 | 8 | 194,902 | 48 |
| triage | claude-sonnet-5-5 | 2 | 4,257 | 4 | 44,156 | 31 |
| ui:E8u | claude-sonnet-5-5 | 8 | 3,603 | 16 | 736,584 | 70 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,164 | 4 | 41,642 | 11 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,430 | 4 | 41,076 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,127 | 4 | 41,078 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,005 | 4 | 41,080 | 11 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 945 | 4 | 41,697 | 73 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 893 | 4 | 41,072 | 15 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 892 | 4 | 41,658 | 286 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 859 | 4 | 41,071 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 852 | 4 | 41,073 | 14 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 837 | 4 | 41,667 | 238 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 786 | 4 | 41,083 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 760 | 4 | 41,080 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 715 | 4 | 41,074 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 711 | 4 | 41,076 | 15 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 705 | 4 | 41,640 | 66 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 672 | 4 | 41,636 | 7 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 638 | 4 | 41,082 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 627 | 4 | 2,869 | 315 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 618 | 4 | 41,085 | 7 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 554 | 4 | 41,073 | 26 |
| capture:provenance | claude-sonnet-5-5 | 2 | 323 | 4 | 37,562 | 7 |


wall: 1158s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 9,535 | 47,032 | 51 | 14:27:08 | 14:28:00 |
| machine | 20 | 17,790 | 786,812 | 996 | 14:27:08 | 14:43:44 |
| ui | 4 | 21,721 | 3,904,675 | 265 | 14:27:24 | 14:31:49 |
| judge | 3 | 19,753 | 762,073 | 60 | 14:27:26 | 14:28:26 |
| review | 3 | 47,732 | 7,828,033 | 275 | 14:27:32 | 14:32:07 |
| triage | 1 | 4,257 | 44,156 | 31 | 14:43:44 | 14:44:15 |
| capture | 1 | 323 | 37,562 | 7 | 14:44:15 | 14:44:22 |
| synthesize | 1 | 20,535 | 153,922 | 124 | 14:44:22 | 14:46:26 |

- **claude-sonnet-5-5**: 11 agent · 63 calls · out 76,124 · in 126 · cache_read 4,949,420 · cache_create 873,004
- **claude-opus-5-5**: 3 agent · 80 calls · out 47,732 · in 160 · cache_read 7,828,033 · cache_create 419,593
- **claude-haiku-5-5**: 20 agent · 40 calls · out 17,790 · in 80 · cache_read 786,812 · cache_create 889,768

