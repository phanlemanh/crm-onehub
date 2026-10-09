### ban-gieo-gop-y-sau-nop S4 r1 — wf_82affefd-552 (21 agent, 70,893 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 16 | 15,960 | 32 | 1,884,983 | 184 |
| review:conventions | claude-opus-5-5 | 18 | 12,961 | 36 | 2,095,230 | 157 |
| review:measurement | claude-opus-5-5 | 12 | 12,153 | 24 | 1,324,678 | 135 |
| synthesize:report | claude-sonnet-5-5 | 3 | 5,281 | 6 | 214,545 | 40 |
| baseline:diffBase | claude-sonnet-5-5 | 10 | 4,394 | 20 | 684,165 | 9252 |
| refute:gieo-thu.mjs | claude-sonnet-5-5 | 5 | 3,491 | 10 | 437,431 | 36 |
| triage | claude-sonnet-5-5 | 2 | 2,646 | 4 | 92,539 | 23 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,839 | 4 | 123,906 | 211 |
| refute:ba-ban-do.mjs | claude-sonnet-5-5 | 4 | 1,822 | 8 | 280,416 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,533 | 4 | 123,906 | 9 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-5-5 | 2 | 1,202 | 4 | 70,020 | 325 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,189 | 4 | 123,904 | 41 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 910 | 4 | 124,036 | 241 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 856 | 4 | 70,020 | 315 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 841 | 4 | 70,020 | 319 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 830 | 4 | 123,961 | 66 |
| machine:node _acceptance/ban-gieo-gop-y-sau-nop/ | claude-haiku-5-5 | 2 | 829 | 4 | 123,948 | 7 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 736 | 4 | 123,931 | 227 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 561 | 4 | 123,900 | 7 |
| machine:bun _acceptance/ban-gieo-gop-y-sau-nop/r | claude-haiku-5-5 | 2 | 536 | 4 | 123,950 | 5 |
| capture:provenance | claude-sonnet-5-5 | 2 | 323 | 4 | 88,160 | 7 |


wall: 9299s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,394 | 684,165 | 9252 | 19:19:01 | 21:53:13 |
| machine | 12 | 11,862 | 1,325,502 | 803 | 19:19:01 | 19:32:24 |
| review | 3 | 41,074 | 5,304,891 | 185 | 19:19:01 | 19:22:06 |
| triage | 1 | 2,646 | 92,539 | 23 | 19:32:25 | 19:32:48 |
| refute | 2 | 5,313 | 717,847 | 39 | 19:32:48 | 19:33:26 |
| capture | 1 | 323 | 88,160 | 7 | 21:53:13 | 21:53:21 |
| synthesize | 1 | 5,281 | 214,545 | 40 | 21:53:21 | 21:54:00 |

- **claude-opus-5-5**: 3 agent · 46 calls · out 41,074 · in 92 · cache_read 5,304,891 · cache_create 339,936
- **claude-sonnet-5-5**: 6 agent · 26 calls · out 17,957 · in 52 · cache_read 1,797,256 · cache_create 785,779
- **claude-haiku-5-5**: 12 agent · 24 calls · out 11,862 · in 48 · cache_read 1,325,502 · cache_create 878,038

