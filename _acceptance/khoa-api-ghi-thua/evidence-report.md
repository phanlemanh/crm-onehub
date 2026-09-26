---
schema_version: 2
feature_slug: khoa-api-ghi-thua
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 28f8e12b3fefc8ffcfbfc338acc48477982d39e8
human_signoff:
---

# Evidence Report: khoa-api-ghi-thua

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | judgment | PASS |
| E14 | AC-10 | judgment | PASS |
| E15 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-khoa-api-ghi-thua-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_khong_ghi_trong_nguong
  verified_at: 2026-09-26T02:45:02Z
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [1336.00ms]
    test-run: dropped crm_muhsyimum216_test

- eval: E2
  run_id: minted-khoa-api-ghi-thua-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_bien_nguong
  verified_at: 2026-09-26T02:45:02Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [779.00ms]
    test-run: dropped crm_muhsywd5f7iw_test

- eval: E3
  run_id: muhq238uvnpx
  exit_code: 0
  verifier: config:executors.test.kagt_hai_chieu_thu_vien
  verified_at: 2026-09-26T01:24:49Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: muhq2302k75u
  exit_code: 0
  verifier: config:executors.test.kagt_rate_limit_bat
  verified_at: 2026-09-26T01:24:49Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-khoa-api-ghi-thua-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_tu_choi_van_giu
  verified_at: 2026-09-26T02:45:02Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [1303.00ms]
    test-run: dropped crm_muhsyiral5d8_test

- eval: E6
  run_id: muhq231cr4is
  exit_code: 0
  verifier: config:executors.test.kagt_chong_troi
  verified_at: 2026-09-26T01:24:49Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-khoa-api-ghi-thua-E7-r1
  exit_code: 0
  verifier: config:executors.script.kagt_tai_lieu
  verified_at: 2026-09-26T01:07:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-khoa-api-ghi-thua-E8-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-26T02:45:02Z
  output: |
      Time:    1m32.753s

    test-run: dropped crm_muhsyizh6nyy_test

- eval: E9
  run_id: minted-khoa-api-ghi-thua-E9-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-26T02:45:02Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    8.91s

- eval: E10
  run_id: minted-khoa-api-ghi-thua-E10-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-26T02:45:02Z
  output: |
      Time:    428ms

    EXIT=0

- eval: E11
  run_id: minted-khoa-api-ghi-thua-E11-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-26T02:45:02Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 867ms on 1486 files with 9 rules using 14 threads.

- eval: E12
  run_id: minted-khoa-api-ghi-thua-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-26T02:45:02Z
  output: |
      Time:    11.525s

    EXIT_CODE=0

- eval: E13
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: |
    - domain-correctness: PASS — Patch diff xác nhận đúng hai việc: hai nhánh `skip` của `evaluateRateLimit` đổi `lastRequest: now` thành `lastRequest: stampLastRequest(lastRequest, now, opts)` (bỏ ghi khi còn trong ngưỡng); `claimUsageInDatabase` thêm đúng một dòng early-return sau `consumeRemaining`/`consumeRateLimit`, chỉ khi `opts.storage === "database"`. Không dòng comment nào được thêm. `stampLastRequest` áp cả lên đường secondary-storage như design doc nói, và `packages/auth/src/auth.ts` xác nhận kho không đặt `secondaryStorage`. Ngưỡng nằm ở `packages/auth/src/api-keys.ts`.
    - operational-feasibility: PASS — Đối chiếu trực tiếp bản vá với mọi mệnh đề AC-9: chỉ hai trong ba nhánh skip bị đổi, nhánh rate-limit thật sự bật không bị chạm; `consumeRateLimit`/`consumeRemaining` không xuất hiện trong diff; không thêm chú thích. Ngưỡng `API_KEY_USAGE.lastRequestIntervalMs` truyền đúng qua `lastRequestUpdateIntervalMs` trong `auth.ts`.
    - spec-alignment: PASS — Bản vá chỉ sửa đúng hai chỗ khi có `lastRequestUpdateIntervalMs`, không đụng nhánh rate-limit bật hay logic increment/deny/reset, không thêm chú thích. Design doc và AC-9 đều nói tuỳ chọn cũng áp lên nhánh secondaryStorage nhưng kho không cấu hình nó, và AC-11 giữ lời hứa đó. Cấu hình `auth.ts` khớp mô tả AC-9 (rateLimit.enabled=false + lastRequestUpdateIntervalMs).
  human_override:        # T3 (packages/auth bị chạm) — mọi judgment item chờ human_override dù panel đã PASS

- eval: E14
  judged_by: judge panel (carried từ round 2 — inputs không đổi, hash khớp)
  verdict: PASS
  rationale: |
    panel giữ nguyên từ round 2 — inputs không đổi (hash khớp), không chấm lại; rationale xem round đó (mục Iterations, Round 2).
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override:        # T3 — mọi judgment item chờ human_override dù panel đã PASS

- eval: E15
  run_id: muhsyj4tivfe
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_khong_secondary_storage
  verified_at: 2026-09-26T02:45:02Z
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [907.00ms]
    test-run: dropped crm_muhsyj4tivfe_test

## Known limits

## Ngoài hợp đồng

## Analyst

E8, E9, E10, E11 — xanh trên cả HEAD lẫn diffBase (`baseline: green`). Đây là các cổng chất lượng toàn kho (bun run test, check-types, lint, lint:slop) chạy trên cả cây cũ lẫn cây mới nên không phân biệt được feature này — chúng là regression-guard có chủ ý (bảo vệ không hồi quy trên toàn kho), không phải eval đo hành vi mới của khoa-api-ghi-thua. Xác nhận giữ nguyên như cổng hồi quy, không cần viết lại.

## Variance

none — không eval nào trong feature này khai `runs` > 1 (mọi eval đều deterministic, runs=1).

## Iterations

Round 1: E7 (tài liệu docs/api.md) xanh, khoá làm nền tham chiếu — carried sang các round sau.
Round 2: BLOCKED — E5 (tu-choi-van-giu) không có kết quả trả về (agent bị skip/chết giữa chừng, round-tally 10/11); E13/E14 panel PASS nhưng chờ human_override (T3).
Round 3: Toàn bộ 15 eval xanh, gồm E5 chạy lại thành công và E15 mới cho AC-11 (guard khong-secondary-storage); verdict vẫn PENDING-JUDGMENT vì E13/E14 là judgment item trên nhánh T3 (packages/auth bị chạm) — chờ human_override ở Gate 2 trước khi nâng lên PASS.
