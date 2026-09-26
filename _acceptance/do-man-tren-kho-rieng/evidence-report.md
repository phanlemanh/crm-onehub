---
schema_version: 2
feature_slug: do-man-tren-kho-rieng
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 804a717cf986abaca28ceb798782a9e775eea4c4
human_signoff:
---

# Evidence Report: do-man-tren-kho-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
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
  run_id: muhp23lkazkn
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_ten_kho
  verified_at: 2026-09-26T01:09:42Z
  output: |
     254 expect() calls
    Ran 4 tests across 1 file. [36.00ms]
    test-run: dropped crm_muhp23lkazkn_test

- eval: E2
  run_id: muhp265wxai2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_tao
  verified_at: 2026-09-26T01:09:42Z
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [21.70s]
    test-run: dropped crm_muhp265wxai2_test

- eval: E3
  run_id: minted-do-man-tren-kho-rieng-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_kho_mau
  verified_at: 2026-09-26T01:09:42Z
  output: |
     7 expect() calls
    Ran 2 tests across 1 file. [39.05s]
    test-run: dropped crm_muhp24k40xeb_test

- eval: E4
  run_id: muhp24qodgbd
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_xoa
  verified_at: 2026-09-26T01:09:42Z
  output: |
     7 expect() calls
    Ran 2 tests across 1 file. [23.34s]
    test-run: dropped crm_muhp24qodgbd_test

- eval: E5
  run_id: muhp23qvrpns
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_quet_mo_coi
  verified_at: 2026-09-26T01:09:42Z
  output: |
     10 expect() calls
    Ran 1 test across 1 file. [8.04s]
    test-run: dropped crm_muhp23qvrpns_test

- eval: E6
  run_id: minted-do-man-tren-kho-rieng-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_dau_cuoi
  verified_at: 2026-09-26T01:09:42Z
  output: |
      DUNG dau van tay kho chung khong doi
    phien dau-cuoi: 17 DUNG, 0 SAI

- eval: E7
  run_id: minted-do-man-tren-kho-rieng-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_don_khi_do
  verified_at: 2026-09-26T01:09:42Z
  output: |
      DUNG ca 4: kho do khong con sau phien
      DUNG ca 4: khong con tien trinh may chu nao cua phien
    phien don-khi-do: 32 DUNG, 0 SAI

- eval: E8
  run_id: minted-do-man-tren-kho-rieng-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_xep_hang
  verified_at: 2026-09-26T01:09:42Z
  output: |
      DUNG may chu cua A con song suot luc C dung va chay
      DUNG A, B, C thoat 0
    phien xep-hang: 7 DUNG, 0 SAI

- eval: E9
  run_id: minted-do-man-tren-kho-rieng-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_tien_de
  verified_at: 2026-09-26T01:09:42Z
  output: |
      DUNG ca c: kho mau khong duoc coi la kho dung-mot-lan
      DUNG ca c: dau van tay kho mau khong doi
    phien tien-de: 12 DUNG, 0 SAI

- eval: E10
  run_id: minted-do-man-tren-kho-rieng-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_kho_chung_khong_doi
  verified_at: 2026-09-26T01:09:42Z
  output: |
      DUNG [kho chung gia] dau van tay kho chung doi
      kho crm that khong co chu ky la, bo ca (ii)
    kho-chung-khong-doi: 2 DUNG, 0 SAI

- eval: E11
  run_id: minted-do-man-tren-kho-rieng-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_khong_noi_thuoc
  verified_at: 2026-09-26T01:09:42Z
  output: |
      DUNG khong tep nao cua ho so khac hay canh-cay.mjs bi cham (31 tep doi)
      DUNG config.yaml chi them dong, khong sua hay xoa executor co san
    khong-noi-thuoc: sach

- eval: E12
  run_id: minted-do-man-tren-kho-rieng-E12-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_tai_lieu
  verified_at: 2026-09-26T01:09:42Z
  output: |
      DUNG CLAUDE.md muc Cach chung minh thieu: -
      DUNG .env.example khoi PHIEN_DO thieu: -
    tai-lieu: XANH

- eval: E13
  run_id: minted-do-man-tren-kho-rieng-E13-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_truoc_gop_toan_kho
  verified_at: 2026-09-26T01:09:42Z
  output: |
      DUNG doi chung: dong vi pham cua chinh ho so nay duoc bo
      DUNG pre-merge toan kho: 0 vi pham cua ho so khac
    truoc-gop: XANH (lenh pre-merge tra 1; vi pham cua chinh ho so nay da bo qua)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-do-man-tren-kho-rieng-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-26T01:09:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-do-man-tren-kho-rieng-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-26T01:09:42Z

- cmd: bun run lint:slop
  run_id: minted-do-man-tren-kho-rieng-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-26T01:09:42Z

- cmd: bunx turbo run build --force
  run_id: minted-do-man-tren-kho-rieng-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-26T01:09:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nhiều lượt (runs > 1) trong vòng này.

## Iterations

Round 1: E5, E13 thất bại — E5 (quét mồ côi, dmk_quet_mo_coi) đỏ khi chạy `bun run test -- "cd packages/db && bun test test/measure-database.spec.ts -t quet-mo-coi"` (thoát 1); E13 (trước-gộp toàn kho, dmk_truoc_gop_toan_kho) đỏ khi chạy `node _acceptance/do-man-tren-kho-rieng/rang/truoc-gop.mjs` (thoát 1). Trả lại để triển khai.
Round 2: E5 thất bại lại — ca "quet-mo-coi" (dmk_quet_mo_coi) đỏ khi chạy `bun run test -- "cd packages/db && bun test test/measure-database.spec.ts -t quet-mo-coi"`, timeout sau 5000ms ("this test timed out after 5000ms"), thoát 1; E13 (trước-gộp toàn kho) đã qua ở vòng này. Trả lại để triển khai.
Round 3: tất cả 13 eval (E1–E13) và bốn lệnh suite hồi quy (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) đều PASS/thoát 0, gồm cả E5 (quét mồ côi, nay đo 8.04s dưới trần riêng của ca) và E13 (trước-gộp toàn kho). Verdict PASS.