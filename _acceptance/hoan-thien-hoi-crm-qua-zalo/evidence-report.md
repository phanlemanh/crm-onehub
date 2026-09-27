---
schema_version: 2
feature_slug: hoan-thien-hoi-crm-qua-zalo
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7e3bbd2e1fb95ecfc9e2208b49faf4a497b3e50f
human_signoff:
---

# Evidence Report: hoan-thien-hoi-crm-qua-zalo

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: muj21rilk1fp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hth_chan_ghi
  verified_at: 2026-09-27T00:02:32Z
  output: |
    84 expect() calls
    Ran 3 tests across 1 file. [462.00ms]
    test-run: dropped crm_muj21rilk1fp_test

- eval: E2
  run_id: muj21s7q8h81
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hth_ghi_that
  verified_at: 2026-09-27T00:02:32Z
  output: |
    7 expect() calls
    Ran 1 test across 1 file. [408.00ms]
    test-run: dropped crm_muj21s7q8h81_test

- eval: E3
  run_id: muj21rprkkmp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hth_web_fetch
  verified_at: 2026-09-27T00:02:32Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [466.00ms]
    test-run: dropped crm_muj21rprkkmp_test

- eval: E4
  run_id: muj21r5rehxz
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_chi_doc
  verified_at: 2026-09-27T00:02:32Z
  output: |
    78 expect() calls
    Ran 6 tests across 1 file. [380.00ms]
    test-run: dropped crm_muj21r5rehxz_test

- eval: E5
  run_id: muj21r8tddy1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hth_khong_chu
  verified_at: 2026-09-27T00:02:32Z
  output: |
    28 expect() calls
    Ran 4 tests across 1 file. [451.00ms]
    test-run: dropped crm_muj21r8tddy1_test

- eval: E6
  run_id: muj21r7vtnmi
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hth_so_tien
  verified_at: 2026-09-27T00:02:32Z
  output: |
    202 expect() calls
    Ran 24 tests across 1 file. [9.00ms]
    test-run: dropped crm_muj21r7vtnmi_test

- eval: E7
  run_id: muj21rnjmps8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_nguong
  verified_at: 2026-09-27T00:02:32Z
  output: |
    10 expect() calls
    Ran 1 test across 1 file. [1323.00ms]
    test-run: dropped crm_muj21rnjmps8_test

- eval: E8
  run_id: muj21r332qd8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hth_thuoc_am
  verified_at: 2026-09-27T00:02:32Z
  output: |
    Ran 7 tests across 1 file. [795.00ms]
    test-run: dropped crm_muj21r332qd8_test

- eval: E9
  run_id: muj21r0uegsc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hth_token
  verified_at: 2026-09-27T00:02:32Z
  output: |
    68 expect() calls
    Ran 7 tests across 1 file. [3.54s]
    test-run: dropped crm_muj21r0uegsc_test

- eval: E10
  run_id: muj21qpzos7e
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_luat_cu
  verified_at: 2026-09-27T00:02:32Z
  output: |
    9 expect() calls
    Ran 1 test across 1 file. [553.00ms]
    test-run: dropped crm_muj21qpzos7e_test

- eval: E11
  run_id: muj2220hj1zp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_tu_choi_vai
  verified_at: 2026-09-27T00:02:32Z
  output: |
    19 expect() calls
    Ran 4 tests across 1 file. [376.00ms]
    test-run: dropped crm_muj2220hj1zp_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-hoan-thien-hoi-crm-qua-zalo-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-27T00:02:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-hoan-thien-hoi-crm-qua-zalo-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-27T00:02:32Z

- cmd: bun run lint:slop
  run_id: minted-hoan-thien-hoi-crm-qua-zalo-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-27T00:02:32Z

- cmd: bunx turbo run build --force
  run_id: minted-hoan-thien-hoi-crm-qua-zalo-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-27T00:02:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt).

## Variance

none — không có eval stochastic (runs > 1) trong round này; mọi eval đều deterministic (runs=1) và đồng nhất giữa các block.

## Iterations

Round 1: 11/11 eval xanh, 4/4 suite xanh nhưng review tìm 2 finding trong hợp đồng (AC-2, AC-9) — REJECT, quay lại implementation để vá.
Round 2: full run — 11/11 eval xanh, 4/4 suite xanh (test/lint/lint:slop/build); review lại AC-9 tìm thêm 3 finding trong hợp đồng còn tồn (ctx-nguồn chưa rào, số assert chưa phủ hết điểm phát sự kiện, tiền tố `zalo:` dựng tay trong helper test) — mức low/medium, không chặn AC; verdict PASS.
Round 3: full run — 11/11 eval xanh, 4/4 suite xanh (test/lint/lint:slop/build); đã vá 3 finding AC-9 tồn từ round 2 theo hướng chủ kho chọn (a) — ghi Known limits ở contract.md — và sửa ngay việc che số điện thoại quốc tế nhóm bằng dấu chấm, thêm ma trận eval E6 cho ca đó; review vòng này lại phát hiện 1 finding mới trong hợp đồng mức high (AC-6: lookbehind mới của SO_TIEN che nhầm/để lộ số tiền khi đứng ngay sau một dãy số khác trong câu, ví dụ `(1) ` hay `Năm 2004 `) — REJECT, quay lại implementation để vá.
