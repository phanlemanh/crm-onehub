---
schema_version: 2
feature_slug: do-man-tren-kho-rieng
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2e59a21d8996f72601fe460923dfa827e19f2a61
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
| E14 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: muhq6k9br59o
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_ten_kho
  verified_at: 2026-09-26T01:42:42Z
  output: |
    254 expect() calls
    Ran 4 tests across 1 file. [41.00ms]
    test-run: dropped crm_muhq6k9br59o_test

- eval: E2
  run_id: muhq6j9s5sal
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_tao
  verified_at: 2026-09-26T01:42:42Z
  output: |
    8 expect() calls
    Ran 1 test across 1 file. [24.42s]
    test-run: dropped crm_muhq6j9s5sal_test

- eval: E3
  run_id: muhq6k2pu4rb
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_kho_mau
  verified_at: 2026-09-26T01:42:42Z
  output: |
    7 expect() calls
    Ran 2 tests across 1 file. [37.07s]
    test-run: dropped crm_muhq6k2pu4rb_test

- eval: E4
  run_id: muhq6kjaqk87
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_xoa
  verified_at: 2026-09-26T01:42:42Z
  output: |
    7 expect() calls
    Ran 2 tests across 1 file. [21.84s]
    test-run: dropped crm_muhq6kjaqk87_test

- eval: E5
  run_id: muhq6kbqkbdu
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dmk_quet_mo_coi
  verified_at: 2026-09-26T01:42:42Z
  output: |
    10 expect() calls
    Ran 1 test across 1 file. [7.00s]
    test-run: dropped crm_muhq6kbqkbdu_test

- eval: E6
  run_id: minted-do-man-tren-kho-rieng-E6-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_dau_cuoi
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG dau-cuoi: khong con tien trinh may chu nao cua phien
    DUNG dau van tay kho chung khong doi
    phien dau-cuoi: 17 DUNG, 0 SAI

- eval: E7
  run_id: minted-do-man-tren-kho-rieng-E7-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_don_khi_do
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG ca 4: kho do khong con sau phien
    DUNG ca 4: khong con tien trinh may chu nao cua phien
    phien don-khi-do: 32 DUNG, 0 SAI

- eval: E8
  run_id: minted-do-man-tren-kho-rieng-E8-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_xep_hang
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG may chu cua A con song suot luc C dung va chay
    DUNG A, B, C thoat 0
    phien xep-hang: 7 DUNG, 0 SAI

- eval: E9
  run_id: minted-do-man-tren-kho-rieng-E9-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_tien_de
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG ca c: kho mau khong duoc coi la kho dung-mot-lan
    DUNG ca c: dau van tay kho mau khong doi
    phien tien-de: 12 DUNG, 0 SAI

- eval: E10
  run_id: minted-do-man-tren-kho-rieng-E10-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_kho_chung_khong_doi
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG [kho chung gia] dau van tay kho chung doi
    kho crm that khong co chu ky la, bo ca (ii)
    kho-chung-khong-doi: 2 DUNG, 0 SAI

- eval: E11
  run_id: minted-do-man-tren-kho-rieng-E11-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_khong_noi_thuoc
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG khong tep nao cua ho so khac hay canh-cay.mjs bi cham (35 tep doi)
    DUNG config.yaml chi them dong, khong sua hay xoa executor co san
    khong-noi-thuoc: sach

- eval: E12
  run_id: minted-do-man-tren-kho-rieng-E12-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_tai_lieu
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG CLAUDE.md muc Cach chung minh thieu: -
    DUNG .env.example khoi PHIEN_DO thieu: -
    tai-lieu: XANH

- eval: E13
  run_id: minted-do-man-tren-kho-rieng-E13-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_truoc_gop_toan_kho
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG doi chung: dong vi pham cua chinh ho so nay duoc bo
    DUNG pre-merge toan kho: 0 vi pham cua ho so khac
    truoc-gop: XANH (lenh pre-merge tra 1; vi pham cua chinh ho so nay da bo qua)

- eval: E14
  run_id: minted-do-man-tren-kho-rieng-E14-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dmk_khong_dung_kho_khac
  verified_at: 2026-09-26T01:42:42Z
  output: |
    DUNG bo kiem xoa mat kho mau cua cay khac
    DUNG doi chung: luot quet voi dong ho tuong lai xoa duoc dung hai kho nay (vat do de ton thuong that)
    khong-dung-kho-khac: 4 DUNG, 0 SAI

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muhq6hro424l
  exit_code: 0
  verified_at: 2026-09-26T01:42:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-do-man-tren-kho-rieng-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-26T01:42:42Z

- cmd: bun run lint:slop
  run_id: minted-do-man-tren-kho-rieng-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-26T01:42:42Z

- cmd: bunx turbo run build --force
  run_id: minted-do-man-tren-kho-rieng-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-26T01:42:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: đặt tên kho đo theo slug thô, không khử ký tự đặc biệt hay chống trùng — nhiều slug khác nhau (a-b/a.b/A_B/a--b) đều ra cùng crm_a_b_do, và x-mau trùng kho mẫu của x. Trở lại implementation.
Round 2: sourceFingerprint tiêm chuỗi viết tay (`${fingerprint}x`) thay vì đo qua hàm tạo dấu thật, nên không phát hiện được khi seed.ts đổi. Trở lại implementation.
Round 3: PASS 13/13 eval, 4/4 suite ở 804a717c; hồ sơ verified — nhưng Gate 2 phát hiện Ngoài-6 (lượt quét mồ côi chạm cả kho của cây khác). Thêm AC-14/E14, sửa lượt quét chỉ chạm kho của chính lượt, đưa vào round 4.
