---
schema_version: 2
feature_slug: do-man-tren-kho-rieng
verdict: REJECT
failed_evals: [E5]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a729e22e445e2aff5f26b81a7c950acfe395e4fe
human_signoff:
---

# Evidence Report: do-man-tren-kho-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | FAIL |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | script | PASS |
| E13 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: muhjcfw9g9l6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_ten_kho
  verified_at: 2026-09-25T22:29:56Z
  output: |
    186 expect() calls
    Ran 4 tests across 1 file. [45.00ms]
    test-run: dropped crm_muhjcfw9g9l6_test

- eval: E2
  run_id: muhjcf1lzs7p
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_tao
  verified_at: 2026-09-25T22:29:56Z
  output: |
    8 expect() calls
    Ran 1 test across 1 file. [22.31s]
    test-run: dropped crm_muhjcf1lzs7p_test

- eval: E3
  run_id: minted-do-man-tren-kho-rieng-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_kho_mau
  verified_at: 2026-09-25T22:29:56Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [41.23s]
    test-run: dropped crm_muhjceo0ksdp_test

- eval: E4
  run_id: muhjcf2fm4t6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_xoa
  verified_at: 2026-09-25T22:29:56Z
  output: |
    7 expect() calls
    Ran 2 tests across 1 file. [22.76s]
    test-run: dropped crm_muhjcf2fm4t6_test

- eval: E5
  run_id: muhjcgilnbc2
  exit_code: 1
  baseline: red
  verifier: config:executors.test.dmk_quet_mo_coi
  verified_at: 2026-09-25T22:29:56Z
  output: |
    (fail) quet-mo-coi > drops only marked databases untouched for longer than maxAgeMs [5001.86ms]
      ^ this test timed out after 5000ms.

    0 pass
    8 filtered out
    1 fail
    5 expect() calls
    Ran 1 test across 1 file. [7.05s]
    test-run: dropped crm_muhjcgilnbc2_test
    error: script "test" exited with code 1

- eval: E6
  run_id: minted-do-man-tren-kho-rieng-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_dau_cuoi
  verified_at: 2026-09-25T22:29:56Z
  output: |
    DUNG dau-cuoi: khong con tien trinh may chu nao cua phien
    DUNG dau van tay kho chung khong doi
    phien dau-cuoi: 14 DUNG, 0 SAI

- eval: E7
  run_id: minted-do-man-tren-kho-rieng-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_don_khi_do
  verified_at: 2026-09-25T22:29:56Z
  output: |
    DUNG ca 4: kho do khong con sau phien
    DUNG ca 4: khong con tien trinh may chu nao cua phien
    phien don-khi-do: 19 DUNG, 0 SAI

- eval: E8
  run_id: minted-do-man-tren-kho-rieng-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_xep_hang
  verified_at: 2026-09-25T22:29:56Z
  output: |
    DUNG may chu cua A con song suot luc C dung va chay
    DUNG A, B, C thoat 0
    phien xep-hang: 7 DUNG, 0 SAI

- eval: E9
  run_id: minted-do-man-tren-kho-rieng-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_tien_de
  verified_at: 2026-09-25T22:29:56Z
  output: |
    DUNG ca c: kho mau khong duoc coi la kho dung-mot-lan
    DUNG ca c: dau van tay kho mau khong doi
    phien tien-de: 12 DUNG, 0 SAI

- eval: E10
  run_id: minted-do-man-tren-kho-rieng-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_kho_chung_khong_doi
  verified_at: 2026-09-25T22:29:56Z
  output: |
    DUNG [kho chung gia] dau van tay kho chung doi
    kho crm that khong co chu ky la, bo ca (ii)
    kho-chung-khong-doi: 2 DUNG, 0 SAI

- eval: E11
  run_id: minted-do-man-tren-kho-rieng-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_khong_noi_thuoc
  verified_at: 2026-09-25T22:29:56Z
  output: |
    DUNG khong tep nao cua ho so khac hay canh-cay.mjs bi cham (31 tep doi)
    DUNG config.yaml chi them dong, khong sua hay xoa executor co san
    khong-noi-thuoc: sach

- eval: E12
  run_id: minted-do-man-tren-kho-rieng-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_tai_lieu
  verified_at: 2026-09-25T22:29:56Z
  output: |
    DUNG CLAUDE.md muc Cach chung minh thieu: -
    DUNG .env.example co dong ghi PHIEN_DO
    tai-lieu: du

- eval: E13
  run_id: minted-do-man-tren-kho-rieng-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_truoc_gop_toan_kho
  verified_at: 2026-09-25T22:29:56Z
  output: |
    DUNG doi chung: dong vi pham cua chinh ho so nay duoc bo
    DUNG pre-merge toan kho: 0 vi pham cua ho so khac
    truoc-gop: XANH (lenh pre-merge tra 1; vi pham cua chinh ho so nay da bo qua)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muhjcdlxicuq
  exit_code: 0
  verified_at: 2026-09-25T22:29:56Z

- cmd: bunx turbo run lint --force
  run_id: minted-do-man-tren-kho-rieng-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-25T22:29:56Z

- cmd: bun run lint:slop
  run_id: minted-do-man-tren-kho-rieng-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-25T22:29:56Z

- cmd: bunx turbo run build --force
  run_id: minted-do-man-tren-kho-rieng-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-25T22:29:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nhiều lượt (runs > 1) trong vòng này.

## Iterations

Round 1: E5, E13 thất bại — E5 (quét mồ côi, dmk_quet_mo_coi) đỏ khi chạy `bun run test -- "cd packages/db && bun test test/measure-database.spec.ts -t quet-mo-coi"` (thoát 1); E13 (trước-gộp toàn kho, dmk_truoc_gop_toan_kho) đỏ khi chạy `node _acceptance/do-man-tren-kho-rieng/rang/truoc-gop.mjs` (thoát 1). Trả lại để triển khai.
Round 2: E5 thất bại lại — ca "quet-mo-coi" (dmk_quet_mo_coi) đỏ khi chạy `bun run test -- "cd packages/db && bun test test/measure-database.spec.ts -t quet-mo-coi"`, timeout sau 5000ms ("this test timed out after 5000ms"), thoát 1; E13 (trước-gộp toàn kho) đã qua ở vòng này. Trả lại để triển khai.