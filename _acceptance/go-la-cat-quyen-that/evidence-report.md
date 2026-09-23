---
schema_version: 2
feature_slug: go-la-cat-quyen-that
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e653dc6136f6b5ea6cb122309acb2da1cb80b7a2
human_signoff:
---

# Evidence Report: go-la-cat-quyen-that

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
| E10 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: mue5y3ks3vxe
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_ma_tran_dang_nhap_lai
  verified_at: 2026-09-23T00:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [1.97s]
    test-run: dropped crm_mue5y3ks3vxe_test

- eval: E2
  run_id: minted-go-la-cat-quyen-that-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_ngoai_le_dung_tap_khai
  verified_at: 2026-09-23T00:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [1195.00ms]
    test-run: dropped crm_mue5yhjml4th_test

- eval: E3
  run_id: mue5y4r99cj1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_doi_chung_thanh_vien
  verified_at: 2026-09-23T00:00:00Z
  output: |
    7 expect() calls
    Ran 1 test across 1 file. [2.71s]
    test-run: dropped crm_mue5y4r99cj1_test

- eval: E4
  run_id: minted-go-la-cat-quyen-that-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_tab_dang_mo
  verified_at: 2026-09-23T00:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [1.70s]
    test-run: dropped crm_mue5y4o37ppe_test

- eval: E5
  run_id: mue5y4jzi9c8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_khoa_con_bat
  verified_at: 2026-09-23T00:00:00Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [3.41s]
    test-run: dropped crm_mue5y4jzi9c8_test

- eval: E6
  run_id: mue5y682a6be
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_go_tat_khoa
  verified_at: 2026-09-23T00:00:00Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [855.00ms]
    test-run: dropped crm_mue5y682a6be_test

- eval: E7
  run_id: mue5y4xd5vv7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_khoa_moi
  verified_at: 2026-09-23T00:00:00Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [1142.00ms]
    test-run: dropped crm_mue5y4xd5vv7_test

- eval: E8
  run_id: minted-go-la-cat-quyen-that-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_eve_cau_noi
  verified_at: 2026-09-23T00:00:00Z
  output: |
    3 expect() calls
    Ran 2 tests across 1 file. [288.00ms]
    test-run: dropped crm_mue5y5fhqpgf_test

- eval: E9
  run_id: mue5y5anmlcl
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_cho_phep_lai
  verified_at: 2026-09-23T00:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [907.00ms]
    test-run: dropped crm_mue5y5anmlcl_test

- eval: E10
  run_id: mue5y4mt15qq
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_proxy_het_quyen
  verified_at: 2026-09-23T00:00:00Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [1314.00ms]
    test-run: dropped crm_mue5y4mt15qq_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mue5y4n8aam9
  exit_code: 0
  verified_at: 2026-09-23T00:00:00Z
  output: |
      Time:    48.957s
    test-run: dropped crm_mue5y4n8aam9_test

- cmd: bunx turbo run lint --force
  run_id: minted-go-la-cat-quyen-that-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-23T00:00:00Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    397ms

- cmd: bun run lint:slop
  run_id: minted-go-la-cat-quyen-that-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-23T00:00:00Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 590ms on 1216 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-go-la-cat-quyen-that-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-23T00:00:00Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    11.599s

## Known limits

## Ngoài hợp đồng

## Analyst

none — every feature eval is red on baseline (discriminates)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E10 và bốn lệnh suite (test/lint/lint:slop/build) đều exit 0, không eval máy nào đỏ. REJECT đến từ scope-triage: một finding "Trong hợp đồng" bậc high ánh xạ vào AC-5 — laNgoaiLeRest trong test/go-la-cat-quyen.spec.ts chỉ so phần đường của ngoại lệ REST, không so phương thức, nên PATCH /rest/workspace (workspace.update) lặng lẽ dùng chung đường /rest/workspace với GET /rest/workspace (workspace.get) và bị coi là ngoại lệ — E5 báo xanh nhưng chưa thật sự đo đường ghi này có bị 403 hay không. Trả về S3 để vá phép so ngoại lệ theo cặp (phương thức, đường) rồi chạy lại vòng verify.