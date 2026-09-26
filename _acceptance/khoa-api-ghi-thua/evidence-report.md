---
schema_version: 2
feature_slug: khoa-api-ghi-thua
verdict: BLOCKED
failed_evals: []
reason: E5 (AC-5, "tu-choi-van-giu") không chạy được — lệnh `bun run test -- "cd apps/api && bun test test/khoa-api-ghi-thua.spec.ts -t tu-choi-van-giu"` không cho kết quả vì agent chấm bị skip/chết giữa chừng. Không có run_id, không có exit_code, không được tính là pass hay fail. Khắc phục là chạy lại đúng lệnh này (agent mới hoặc timeout dài hơn), không phải sửa code.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 82ea58c6bbcc02bb4d5e5ef8f23db79d5d662066
human_signoff:
---

# Evidence Report: khoa-api-ghi-thua

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | BLOCKED — không có kết quả (agent chết giữa chừng) |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS (carried_from_round: 1) |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | judgment | PASS (đề xuất — chờ human_override, hợp đồng T3 chạm packages/auth) |
| E14 | AC-10 | judgment | PASS (đề xuất — chờ human_override, hợp đồng T3 chạm packages/auth) |

## Evidence

- eval: E1
  cmd: bun run test -- "cd apps/api && bun test test/khoa-api-ghi-thua.spec.ts -t khong-ghi-trong-nguong"
  run_id: muhq22ybprcb
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kagt_khong_ghi_trong_nguong
  verified_at: 2026-09-26T01:24:49Z
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [1.75s]
    test-run: dropped crm_muhq22ybprcb_test

- eval: E2
  cmd: bun run test -- "cd apps/api && bun test test/khoa-api-ghi-thua.spec.ts -t bien-nguong"
  run_id: muhq22f4nm8r
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kagt_bien_nguong
  verified_at: 2026-09-26T01:24:49Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [2.05s]
    test-run: dropped crm_muhq22f4nm8r_test

- eval: E3
  cmd: bun run test -- "cd packages/auth && bun test test/khoa-api-ghi-thua.spec.ts -t hai-chieu-thu-vien"
  run_id: muhq238uvnpx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kagt_hai_chieu_thu_vien
  verified_at: 2026-09-26T01:24:49Z
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [118.00ms]
    test-run: dropped crm_muhq238uvnpx_test

- eval: E4
  cmd: bun run test -- "cd packages/auth && bun test test/khoa-api-ghi-thua.spec.ts -t rate-limit-bat-van-dem"
  run_id: muhq2302k75u
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kagt_rate_limit_bat
  verified_at: 2026-09-26T01:24:49Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [121.00ms]
    test-run: dropped crm_muhq2302k75u_test

- eval: E5
  cmd: bun run test -- "cd apps/api && bun test test/khoa-api-ghi-thua.spec.ts -t tu-choi-van-giu"
  status: BLOCKED — không có kết quả
  verifier: config:executors.test.kagt_tu_choi_van_giu
  note: agent chấm bị skip/chết giữa chừng khi chạy lệnh này ở round 2; không có run_id, không có exit_code; không được tính là pass. Cần chạy lại lệnh với agent mới/timeout dài hơn trước khi đóng vòng này.

- eval: E6
  cmd: bun run test -- "cd packages/auth && bun test test/khoa-api-ghi-thua.spec.ts -t chong-troi-ban-va"
  run_id: muhq231cr4is
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kagt_chong_troi
  verified_at: 2026-09-26T01:24:49Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [109.00ms]
    test-run: dropped crm_muhq231cr4is_test

- eval: E7
  run_id: minted-khoa-api-ghi-thua-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kagt_tai_lieu
  verified_at: 2026-09-26T01:07:13Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta round 2 không chạm paths của eval này (docs/api.md không đổi).

- eval: E8
  cmd: bun run test
  run_id: minted-khoa-api-ghi-thua-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-26T01:24:49Z
  output: |
      Time:    1m27.659s

    test-run: dropped crm_muhps95saist_test

- eval: E9
  cmd: bunx turbo run check-types --force
  run_id: minted-khoa-api-ghi-thua-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-26T01:24:49Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    7.853s

- eval: E10
  cmd: bunx turbo run lint --force
  run_id: minted-khoa-api-ghi-thua-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-26T01:24:49Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    632ms

- eval: E11
  cmd: bun run lint:slop
  run_id: minted-khoa-api-ghi-thua-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-26T01:24:49Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 704ms on 1486 files with 9 rules using 14 threads.

- eval: E12
  cmd: bunx turbo run build --force
  run_id: minted-khoa-api-ghi-thua-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-26T01:24:49Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    10.072s

- eval: E13
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  human_override:  # chi nguoi ghi
  rationale: Cả ba lens đồng thuận PASS. Bản vá chỉ đổi đúng hai nhánh "skip" của evaluateRateLimit (qua stampLastRequest) và một điều kiện chặn sớm return row trong claimUsageInDatabase ngay trước lệnh update updatedAt cuối cùng, cả hai chỉ có hiệu lực khi opts.lastRequestUpdateIntervalMs !== undefined; không dòng nào chạm consumeRemaining hay nhánh rate-limit bật, không thêm chú thích nào trong diff; ngưỡng lastRequestIntervalMs (=MINUTE_MS, as const) nằm đúng trong packages/auth/src/api-keys.ts.
  votes:
    - domain-correctness: PASS — Bản vá (@better-auth%2Fapi-key@1.6.25.patch) chỉ sửa đúng hai nhánh "skip" của evaluateRateLimit (rateLimit.enabled===false và apiKey.rateLimitEnabled===false) qua hàm mới stampLastRequest, và thêm một điều kiện chặn sớm return row trong claimUsageInDatabase ngay trước lệnh update updatedAt cuối cùng — cả hai đều chỉ có hiệu lực khi opts.lastRequestUpdateIntervalMs !== undefined (điều kiện chặn còn thêm storage==="database" cho nhánh claimUsageInDatabase, giữ nguyên đường secondary-storage). Không có dòng nào chạm consumeRemaining, không đổi nhánh rate-limit bật (rateLimitTimeWindow/rateLimitMax, start/reset/increment/deny), và không thêm chú thích nào trong toàn bộ diff (kể cả trường kiểu mới lastRequestUpdateIntervalMs trong .d.mts không kèm JSDoc). Ngưỡng lastRequestIntervalMs (=MINUTE_MS, as const) nằm đúng trong API_KEY_USAGE ở packages/auth/src/api-keys.ts và được truyền vào plugin qua auth.ts.
    - operational-feasibility: PASS — Đọc trực tiếp diff trong patch: chỉ hai nhánh `skip` của `evaluateRateLimit` (rate-limit tắt toàn cục và tắt riêng khoá) được đổi thành gọi `stampLastRequest`, hàm này trả `now` nguyên gốc khi thiếu `lastRequestUpdateIntervalMs` hoặc `lastRequest` null; nhánh `skip` thứ ba (thiếu cấu hình time-window/max) và các nhánh đếm bật (`start/reset/increment/deny`, `consumeRateLimit`, `consumeRemaining`) không nằm trong hunk nào. `claimUsageInDatabase` chỉ thêm một `return row` sớm khi vừa có tuỳ chọn vừa `storage === "database"`, giữ nguyên đường secondary-storage (return sớm không chạm nhánh khác). Không có dòng comment nào được thêm (các khối `/**...*/` đã có sẵn là context, không phải `+`). Hằng số `lastRequestUpdateIntervalMs`/`API_KEY_USAGE.lastRequestIntervalMs` đúng là định nghĩa ở `packages/auth/src/api-keys.ts` và được truyền vào `apiKey()` ở `auth.ts`.
    - spec-alignment: PASS — Bản vá @better-auth%2Fapi-key@1.6.25.patch chỉ đổi đúng hai nhánh "skip" của evaluateRateLimit (rate-limit tắt toàn cục và tắt riêng khoá, cả hai đổi lastRequest: now → stampLastRequest(...)) và thêm một dòng return sớm trong claimUsageInDatabase để bỏ update({updatedAt}) cuối — cả hai thay đổi đều được gác bởi opts.lastRequestUpdateIntervalMs !== void 0 (và điều kiện storage === "database" cho nhánh thứ hai); không dòng nào trong nhánh rate-limit bật (start/reset/increment/deny), không dòng nào gọi consumeRemaining, và điều kiện storage === "database" giữ nguyên đường secondary-storage; không có bất kỳ chú thích (comment) nào được thêm trong diff. Ngưỡng (lastRequestIntervalMs = MINUTE_MS = 60_000, as const) nằm đúng trong packages/auth/src/api-keys.ts (module hằng số, cùng API_KEY_HEADER/API_KEY_PREFIX/API_KEY_EXPIRATION), và auth.ts chỉ import hằng đó để truyền vào plugin apiKey(...).

- eval: E14
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  human_override:  # chi nguoi ghi
  rationale: Cả ba lens đồng thuận PASS. Mục "API keys run on a patched library" trong docs/api.md trả lời rõ cả hai câu bắt buộc — điều kiện gỡ bản vá khi better-auth#10921 được vá ở thượng nguồn, và chỉ dẫn làm lại patch khi nâng @better-auth/api-key.
  votes:
    - domain-correctness: PASS — Mục "API keys run on a patched library" trong docs/api.md trả lời rõ cả hai câu: gỡ bản vá "khi better-auth#10921 [...] fixed upstream" kèm ba việc cụ thể (upgrade, xoá patchedDependencies + file patch, xoá option ở auth.ts); và khi nâng @better-auth/api-key thì "redoing the patch" theo đúng ba bước (bun patch @better-auth/api-key@<new>, reapply ba chỗ sửa trong dist/index.mjs + option type, rồi bun patch --commit).
    - operational-feasibility: PASS — Mục "API keys run on a patched library" (docs/api.md dòng 126-149) trả lời rõ cả hai câu: (1) gỡ bản vá khi better-auth#10921 được vá ở thượng nguồn bằng một bản phát hành ngừng ghi mỗi lần xác minh khi rate limit tắt — khi đó bỏ patchedDependencies, xoá file patch, xoá option khỏi auth.ts; (2) khi nâng @better-auth/api-key phải làm lại patch — chạy bun patch @better-auth/api-key@<new>, áp lại ba chỗ sửa trong dist/index.mjs và kiểu của option, rồi bun patch --commit, có test khoa-api-ghi-thua.spec.ts báo khi version và patch lệch nhau.
    - spec-alignment: PASS — Mục "API keys run on a patched library" (docs/api.md dòng 126-148) trả lời rõ cả hai câu: gỡ bản vá "khi better-auth#10921 fixed upstream with a release that stops writing on every verification while rate limiting is off" (dòng 143-146), và khi nâng cấp thì "Upgrading @better-auth/api-key means redoing the patch" — chạy `bun patch @better-auth/api-key@<new>`, reapply ba chỗ sửa trong `dist/index.mjs` và kiểu option, rồi `bun patch --commit` (dòng 138-142).

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

E8, E9, E10, E11 xanh trên cả HEAD lẫn baseline (diffBase) — các lệnh này không phân biệt được feature này với code cũ ở phạm vi round hiện tại, vì baseline không được đo lại (evals.yaml không đổi từ lần baseline cuối, round 1). Đây là các bộ kiểm/hồi quy toàn repo (test suite tổng, check-types, lint, lint:slop) nên hợp lý là regression-guard có chủ ý chứ không phải dấu hiệu thiếu eval riêng cho feature — E1-E4, E6 mới là các eval phân biệt trực tiếp hành vi khoa-api-ghi-thua và đều baseline: n-a (chưa đo lại baseline ở round này, không phải "green").

## Variance

none — every multi-run eval is uniform (không có eval nào khai `runs > 1` ở round này).

## Iterations

Round 1: PENDING-JUDGMENT — 1 finding trong hợp đồng (patch chạm nhầm đường secondary-storage / thiếu kiểm quan hệ bun.lock). Đã sửa ở commit 82ea58c6 ("fix: khoa-api-ghi-thua không chạm secondary-storage; kiểm bun.lock theo quan hệ").
Round 2 (báo cáo này): E1-E4, E6, E8-E12 pass trên commit 82ea58c6bbcc02bb4d5e5ef8f23db79d5d662066; E7 carry-forward từ round 1 (docs/api.md không đổi); E13, E14 judgment đề xuất PASS (chờ human_override, hợp đồng T3 chạm packages/auth). E5 (tu-choi-van-giu) không có kết quả — agent chấm bị skip/chết giữa chừng → verdict BLOCKED, cần chạy lại đúng lệnh của E5 trước khi có thể lên PASS hay REJECT.
