### S4 round 1 — wf_aad96ce7-059 (20 agent, 112,648 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E8 | claude-sonnet-5 | 39 | 22,258 | 78 | 5,033,217 | 358 |
| synthesize:report | claude-sonnet-5 | 2 | 18,770 | 4 | 102,838 | 177 |
| ui:E1 | claude-sonnet-5 | 40 | 16,217 | 80 | 4,750,837 | 503 |
| ui:E2 | claude-sonnet-5 | 26 | 14,257 | 52 | 3,024,467 | 254 |
| triage | claude-sonnet-5 | 4 | 10,197 | 8 | 300,980 | 118 |
| baseline:diffBase | claude-sonnet-5 | 18 | 8,881 | 36 | 1,654,318 | 140 |
| review:conventions | claude-opus-5 | 8 | 5,122 | 16 | 708,439 | 63 |
| review:measurement | claude-opus-5 | 7 | 4,485 | 14 | 631,691 | 55 |
| review:bugs | claude-opus-5 | 7 | 2,410 | 14 | 612,309 | 34 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 1,663 | 26 | 119,828 | 61 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 1,063 | 18 | 84,841 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,059 | 18 | 84,788 | 16 |
| capture:provenance | claude-sonnet-5 | 2 | 893 | 4 | 83,741 | 15 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 874 | 18 | 84,844 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 863 | 18 | 84,856 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 829 | 18 | 84,825 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 778 | 18 | 84,786 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 747 | 18 | 84,788 | 23 |
| machine:cd apps/app && bun test test/agent-trans | claude-haiku-4-5-20251001 | 2 | 721 | 18 | 84,808 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 561 | 18 | 84,859 | 15 |


wall: 817s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 8,881 | 1,654,318 | 140 | 16:00:32 | 16:02:51 |
| machine | 10 | 9,158 | 883,223 | 116 | 16:00:32 | 16:02:28 |
| ui | 3 | 52,732 | 12,808,521 | 503 | 16:00:32 | 16:08:55 |
| review | 3 | 12,017 | 1,952,439 | 72 | 16:00:32 | 16:01:43 |
| triage | 1 | 10,197 | 300,980 | 118 | 16:08:56 | 16:10:54 |
| capture | 1 | 893 | 83,741 | 15 | 16:10:56 | 16:11:11 |
| synthesize | 1 | 18,770 | 102,838 | 177 | 16:11:12 | 16:14:09 |

- **claude-sonnet-5**: 7 agent · 131 calls · out 91,473 · in 262 · cache_read 14,950,398 · cache_create 838,000
- **claude-opus-5**: 3 agent · 22 calls · out 12,017 · in 44 · cache_read 1,952,439 · cache_create 272,932
- **claude-haiku-4-5-20251001**: 10 agent · 21 calls · out 9,158 · in 188 · cache_read 883,223 · cache_create 397,025

### S4 round 2 — wf_6b57d06e-88b (21 agent, 135,374 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E8 | claude-sonnet-5 | 71 | 40,405 | 142 | 10,527,011 | 927 |
| synthesize:report | claude-sonnet-5 | 6 | 25,295 | 12 | 598,454 | 238 |
| ui:E1 | claude-sonnet-5 | 45 | 21,463 | 90 | 6,140,615 | 575 |
| refute:o-soan.mjs | claude-sonnet-5 | 19 | 7,489 | 38 | 1,754,269 | 120 |
| ui:E2 | claude-sonnet-5 | 13 | 7,056 | 26 | 1,348,926 | 124 |
| refute:o-soan.mjs | claude-sonnet-5 | 17 | 6,306 | 34 | 1,587,517 | 98 |
| triage | claude-sonnet-5 | 2 | 5,140 | 4 | 86,633 | 60 |
| review:conventions | claude-opus-5 | 10 | 4,940 | 20 | 877,547 | 70 |
| review:bugs | claude-opus-5 | 11 | 4,633 | 22 | 1,005,464 | 66 |
| review:measurement | claude-opus-5 | 4 | 2,042 | 8 | 310,269 | 27 |
| capture:provenance | claude-sonnet-5 | 2 | 1,350 | 4 | 83,741 | 18 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 1,069 | 18 | 84,844 | 17 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 1,068 | 34 | 182,677 | 56 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 984 | 18 | 84,856 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 976 | 18 | 84,825 | 16 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-4-5-20251001 | 2 | 971 | 18 | 84,841 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 929 | 18 | 84,859 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 920 | 18 | 84,788 | 16 |
| machine:cd apps/app && bun test test/agent-trans | claude-haiku-4-5-20251001 | 2 | 864 | 18 | 84,808 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 798 | 18 | 84,786 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 676 | 18 | 84,788 | 20 |


wall: 1372s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 10 | 9,255 | 946,072 | 109 | 16:18:49 | 16:20:38 |
| ui | 3 | 68,924 | 18,016,552 | 929 | 16:18:49 | 16:34:18 |
| review | 3 | 11,615 | 2,193,280 | 70 | 16:18:49 | 16:19:58 |
| triage | 1 | 5,140 | 86,633 | 60 | 16:34:20 | 16:35:20 |
| refute | 2 | 13,795 | 3,341,786 | 120 | 16:35:21 | 16:37:21 |
| capture | 1 | 1,350 | 83,741 | 18 | 16:37:22 | 16:37:40 |
| synthesize | 1 | 25,295 | 598,454 | 238 | 16:37:43 | 16:41:40 |

- **claude-sonnet-5**: 8 agent · 175 calls · out 114,504 · in 350 · cache_read 22,127,166 · cache_create 968,518
- **claude-opus-5**: 3 agent · 25 calls · out 11,615 · in 50 · cache_read 2,193,280 · cache_create 243,160
- **claude-haiku-4-5-20251001**: 10 agent · 22 calls · out 9,255 · in 196 · cache_read 946,072 · cache_create 396,547

### S4 round 3 — wf_757964c3-27d (20 agent, 107,945 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 40 | 27,578 | 80 | 5,288,744 | 421 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 15,426 | 4 | 99,493 | 142 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 26 | 14,755 | 52 | 3,324,836 | 368 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 33 | 13,880 | 66 | 4,145,835 | 240 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 20 | 11,410 | 40 | 1,943,252 | 171 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 8 | 6,793 | 16 | 739,978 | 84 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 8 | 4,224 | 16 | 688,097 | 56 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 4 | 2,246 | 8 | 276,858 | 28 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 1,900 | 4 | 87,216 | 26 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,373 | 18 | 58,712 | 48 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,070 | 18 | 86,542 | 17 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 874 | 18 | 86,560 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 870 | 18 | 86,545 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 866 | 18 | 86,489 | 25 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 847 | 18 | 86,526 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 822 | 18 | 86,557 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 808 | 18 | 86,487 | 14 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 768 | 4 | 85,434 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 751 | 18 | 86,509 | 12 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 684 | 18 | 86,489 | 11 |


wall: 605s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 20 | 107,945 | 17,517,159 | 605 | 23:30:45 | 23:40:50 |

- **claude-sonnet-5**: 7 agent · 125 calls · out 85,717 · in 250 · cache_read 14,974,810 · cache_create 843,398
- **claude-opus-5-5**: 3 agent · 20 calls · out 13,263 · in 40 · cache_read 1,704,933 · cache_create 264,576
- **claude-haiku-4-5-20251001**: 10 agent · 20 calls · out 8,965 · in 180 · cache_read 837,416 · cache_create 401,421

### S4 round 4 — wf_dee90e32-42f (18 agent, 97,886 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 60 | 26,513 | 120 | 8,454,956 | 504 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 53 | 24,437 | 106 | 7,270,503 | 640 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 4 | 16,451 | 8 | 328,522 | 162 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 20 | 11,598 | 40 | 2,506,600 | 196 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 14 | 4,526 | 28 | 1,524,480 | 72 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 6 | 2,706 | 12 | 511,836 | 37 |
| [Workflow harness — user request] The harness re | claude-opus-5-5 | 7 | 2,507 | 14 | 583,838 | 37 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 4 | 1,461 | 34 | 186,063 | 69 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 1,021 | 18 | 86,703 | 30 |
| [Workflow harness — user request] The harness re | claude-sonnet-5 | 2 | 1,004 | 4 | 85,670 | 16 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 995 | 18 | 86,771 | 16 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 884 | 18 | 86,756 | 15 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 871 | 18 | 86,774 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 843 | 18 | 86,740 | 15 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 668 | 18 | 86,701 | 13 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 532 | 18 | 86,703 | 14 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 442 | 18 | 86,759 | 17 |
| [Workflow harness — user request] The harness re | claude-haiku-4-5-20251001 | 2 | 427 | 18 | 86,723 | 14 |


wall: 820s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| [Workflow harness — user request] The harness re | 18 | 97,886 | 22,233,098 | 820 | 07:45:54 | 07:59:34 |

- **claude-sonnet-5**: 5 agent · 139 calls · out 80,003 · in 278 · cache_read 18,646,251 · cache_create 685,095
- **claude-opus-5-5**: 3 agent · 27 calls · out 9,739 · in 54 · cache_read 2,620,154 · cache_create 278,717
- **claude-haiku-4-5-20251001**: 10 agent · 22 calls · out 8,144 · in 196 · cache_read 966,693 · cache_create 402,029

