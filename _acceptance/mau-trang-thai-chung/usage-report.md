### S4 round 1 (BLOCKED hạ tầng) — wf_ea1f778c-d37 (20 agent, 75,697 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 39 | 19,100 | 78 | 3,419,900 | 294 |
| review:measurement | claude-opus-5-5 | 15 | 12,893 | 30 | 833,476 | 168 |
| review:conventions | claude-opus-5-5 | 20 | 10,865 | 40 | 1,231,423 | 157 |
| synthesize:report | claude-sonnet-5-5 | 2 | 7,455 | 4 | 55,157 | 48 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 5,132 | 4 | 43,872 | 30 |
| triage | claude-sonnet-5-5 | 2 | 3,845 | 4 | 43,350 | 30 |
| ui:E6 | claude-sonnet-5-5 | 6 | 2,787 | 12 | 512,228 | 31 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 2,173 | 4 | 42,378 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,045 | 4 | 42,300 | 12 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,181 | 4 | 42,355 | 75 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,094 | 4 | 2,869 | 330 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 990 | 4 | 42,325 | 254 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 889 | 4 | 42,298 | 34 |
| machine:cd packages/ui && bun test ./test/status | claude-haiku-5-5 | 2 | 836 | 4 | 42,319 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 801 | 4 | 39,431 | 297 |
| machine:cd packages/ui && bun test ./test/mau-tr | claude-haiku-5-5 | 2 | 790 | 4 | 42,333 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 780 | 4 | 42,388 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 711 | 4 | 42,360 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 687 | 4 | 38,223 | 10 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 643 | 4 | 42,294 | 8 |


wall: 1099s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,132 | 43,872 | 30 | 23:03:30 | 23:04:00 |
| machine | 12 | 12,933 | 465,650 | 1011 | 23:03:30 | 23:20:20 |
| ui | 1 | 2,787 | 512,228 | 31 | 23:03:30 | 23:04:01 |
| review | 3 | 42,858 | 5,484,799 | 295 | 23:03:30 | 23:08:25 |
| triage | 1 | 3,845 | 43,350 | 31 | 23:20:20 | 23:20:51 |
| capture | 1 | 687 | 38,223 | 10 | 23:20:51 | 23:21:01 |
| synthesize | 1 | 7,455 | 55,157 | 48 | 23:21:01 | 23:21:48 |

- **claude-opus-5-5**: 3 agent · 74 calls · out 42,858 · in 148 · cache_read 5,484,799 · cache_create 295,055
- **claude-sonnet-5-5**: 5 agent · 14 calls · out 19,906 · in 28 · cache_read 692,830 · cache_create 317,583
- **claude-haiku-5-5**: 12 agent · 24 calls · out 12,933 · in 48 · cache_read 465,650 · cache_create 543,910

### S4 round 1 (chạy lại) — wf_12c09bd8-fc7 (23 agent, 79,684 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 23 | 16,370 | 46 | 1,927,930 | 240 |
| review:measurement | claude-opus-5-5 | 11 | 11,193 | 22 | 629,145 | 146 |
| synthesize:report | claude-sonnet-5-5 | 3 | 8,998 | 6 | 118,677 | 57 |
| review:conventions | claude-opus-5-5 | 11 | 8,019 | 22 | 672,995 | 108 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 4,747 | 4 | 43,872 | 213 |
| triage | claude-sonnet-5-5 | 2 | 4,554 | 4 | 43,927 | 38 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 4,088 | 4 | 42,298 | 40 |
| ui:E6 | claude-sonnet-5-5 | 8 | 3,836 | 16 | 729,446 | 107 |
| refute:quet-mau-trang-thai.ts | claude-sonnet-5-5 | 5 | 2,679 | 10 | 183,355 | 34 |
| refute:quet-mau-trang-thai.ts | claude-sonnet-5-5 | 6 | 2,338 | 12 | 228,490 | 30 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 2,121 | 4 | 42,378 | 268 |
| refute:mau-trang-thai-anh-xa.spec.ts | claude-sonnet-5-5 | 4 | 1,830 | 8 | 130,154 | 20 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,049 | 4 | 42,325 | 251 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,047 | 4 | 2,869 | 320 |
| machine:cd packages/ui && bun test ./test/mau-tr | claude-haiku-5-5 | 2 | 933 | 4 | 42,333 | 9 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 828 | 4 | 42,355 | 71 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 824 | 4 | 42,360 | 9 |
| machine:cd packages/ui && bun test ./test/status | claude-haiku-5-5 | 2 | 818 | 4 | 42,319 | 9 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 778 | 4 | 42,300 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 748 | 4 | 42,294 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 722 | 4 | 42,300 | 288 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 663 | 4 | 42,388 | 12 |
| capture:provenance | claude-sonnet-5-5 | 2 | 501 | 4 | 38,223 | 11 |


wall: 1127s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,747 | 43,872 | 213 | 23:23:31 | 23:27:04 |
| machine | 12 | 14,619 | 468,519 | 986 | 23:23:31 | 23:39:57 |
| ui | 1 | 3,836 | 729,446 | 107 | 23:23:31 | 23:25:18 |
| review | 3 | 35,582 | 3,230,070 | 242 | 23:23:31 | 23:27:33 |
| triage | 1 | 4,554 | 43,927 | 38 | 23:39:57 | 23:40:35 |
| refute | 3 | 6,847 | 541,999 | 36 | 23:40:35 | 23:41:11 |
| capture | 1 | 501 | 38,223 | 11 | 23:41:11 | 23:41:22 |
| synthesize | 1 | 8,998 | 118,677 | 57 | 23:41:22 | 23:42:18 |

- **claude-opus-5-5**: 3 agent · 45 calls · out 35,582 · in 90 · cache_read 3,230,070 · cache_create 278,232
- **claude-sonnet-5-5**: 8 agent · 32 calls · out 29,483 · in 64 · cache_read 1,516,144 · cache_create 466,142
- **claude-haiku-5-5**: 12 agent · 24 calls · out 14,619 · in 48 · cache_read 468,519 · cache_create 541,793

