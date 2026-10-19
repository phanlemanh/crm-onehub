# Kế hoạch — tran-cho-app-rieng

| Task | Việc | Tệp | Phục vụ | Độc lập |
|---|---|---|---|---|
| T1 | Hằng `KHOI_DONG.baiHaiMay.tranMs` = 30 s, truyền làm trần của bài «chạy cạnh apps/agent» | `apps/agent-okr/test/support/khoi-dong.ts`, `apps/agent-okr/test/app-rieng.integration.spec.ts` | E1, E2, E3 | có |
| T2 | Thước bốn ô làm chậm health và thước phạm vi | `_acceptance/tran-cho-app-rieng/rang/cham-health.mjs` | E1, E2, E3 | không (sau T1) |

Đã làm ở S1/S3 (e863f0913, ecde9f093, 836ea67fd). Verify: `bun run test -- "bun _acceptance/tran-cho-app-rieng/rang/cham-health.mjs"` và `--pham-vi` đều DAT; phá-thử bỏ đối số trần → `SAI sua cham 6000 ms`.
