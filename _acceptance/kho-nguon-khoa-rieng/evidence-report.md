---
schema_version: 2
feature_slug: kho-nguon-khoa-rieng
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 01325d56ff8e204761826f372684ae4815a96a1b
human_signoff:
---

# Evidence Report: kho-nguon-khoa-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: mul9kbtrpcm0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.knr_hai_bien
  verified_at: 2026-09-28T12:28:19Z
  output: |
    test-run: dropped crm_mul9kbtrpcm0_test

    __EXIT=0

- eval: E2
  run_id: minted-kho-nguon-khoa-rieng-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.knr_token_gui_di
  verified_at: 2026-09-28T12:28:19Z
  output: |
    test-run: dropped crm_mul9k9wovkqz_test

    __EXIT=0

- eval: E3
  run_id: minted-kho-nguon-khoa-rieng-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.knr_chi_khoa_logo
  verified_at: 2026-09-28T12:28:19Z
  output: |
    test-run: dropped crm_mul9kazee00o_test

    __EXIT=0

- eval: E4
  run_id: minted-kho-nguon-khoa-rieng-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.knr_nang_luc
  verified_at: 2026-09-28T12:28:19Z
  output: |
    test-run: dropped crm_mul9kar633v5_test

    __EXIT=0

- eval: E5
  run_id: minted-kho-nguon-khoa-rieng-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.knr_bien_cac_nha
  verified_at: 2026-09-28T12:28:19Z
  output: |
    KHO_TAI_LIEU_BLOB_TOKEN: co o docs/api.md muc nguon

    __EXIT=0

- eval: E6
  run_id: minted-kho-nguon-khoa-rieng-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_blob_that
  verified_at: 2026-09-28T12:28:19Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E7
  run_id: minted-kho-nguon-khoa-rieng-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_tai_nguon
  verified_at: 2026-09-28T12:28:19Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-kho-nguon-khoa-rieng-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T12:28:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-kho-nguon-khoa-rieng-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T12:28:19Z

- cmd: bun run lint:slop
  run_id: minted-kho-nguon-khoa-rieng-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T12:28:19Z

- cmd: bunx turbo run build --force
  run_id: minted-kho-nguon-khoa-rieng-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T12:28:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E7 (test/script) và bốn lệnh suite (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) đều pass trên lần chạy đầu tiên tại verified_commit 01325d56ff8e204761826f372684ae4815a96a1b — không có vòng sửa nào.
