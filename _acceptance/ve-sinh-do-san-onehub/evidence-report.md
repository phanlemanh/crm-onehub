---
schema_version: 2
feature_slug: ve-sinh-do-san-onehub
verdict: REJECT
failed_evals: [E18]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bc357d3fb795429fe605e4f34beb76386e503488
human_signoff:
---

# Evidence Report: ve-sinh-do-san-onehub

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-6 | script | PASS |
| E10 | AC-6 | script | PASS |
| E11 | AC-7 | script | PASS |
| E12 | AC-7 | script | PASS |
| E13 | AC-7 | script | PASS |
| E14 | AC-8 | script | PASS |
| E15 | AC-9 | script | PASS |
| E16 | AC-9 | script | PASS |
| E17 | AC-10 | script | PASS |
| E18 | AC-11 | script | FAIL |
| E19 | AC-12 | script | PASS |
| E20 | AC-12 | test | PASS |

Một eval hỏng: E18 (AC-11). Mười chín eval còn lại đạt. Lệnh hỏng duy nhất là lệnh của E18; không có lệnh hỏng nào không gắn eval.

## Evidence

- eval: E1
  run_id: minted-ve-sinh-do-san-onehub-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_hydrat_record
  verified_at: 2026-10-17T07:37:37Z
  output: |
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-ve-sinh-do-san-onehub-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_chieu_do_hydrat
  verified_at: 2026-10-17T07:37:37Z
  output: |
    CHIEU DO DAT: 20 loi hydrat tren ban sao khong nap san; o tai hien: D3,D4

- eval: E3
  run_id: minted-ve-sinh-do-san-onehub-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vs_nap_san_dom
  verified_at: 2026-10-17T07:37:37Z
  output: |
    Ran 6 tests across 1 file. [710.00ms]

- eval: E4
  run_id: minted-ve-sinh-do-san-onehub-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_chieu_do_nap_san
  verified_at: 2026-10-17T07:37:37Z
  output: |
    CHIEU DO DAT: nap-san

- eval: E5
  run_id: minted-ve-sinh-do-san-onehub-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vs_403_dom
  verified_at: 2026-10-17T07:37:37Z
  output: |
    Ran 2 tests across 1 file. [1492.00ms]

- eval: E6
  run_id: minted-ve-sinh-do-san-onehub-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_chieu_do_403
  verified_at: 2026-10-17T07:37:37Z
  output: |
    CHIEU DO DAT: 403

- eval: E7
  run_id: minted-ve-sinh-do-san-onehub-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_hydrat_record
  verified_at: 2026-10-17T07:37:37Z
  output: |
    phien-do: xong — mã 0

- eval: E8
  run_id: minted-ve-sinh-do-san-onehub-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cai_dat_moi_chuoi
  verified_at: 2026-10-17T07:37:37Z
  output: |
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E9
  run_id: minted-ve-sinh-do-san-onehub-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_khong_hoi_quy
  verified_at: 2026-10-17T07:37:37Z
  output: |
    khong-hoi-quy: 155/155 khang dinh dat · 23 tep bai · 176 lenh

- eval: E10
  run_id: minted-ve-sinh-do-san-onehub-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_chieu_do_moi_chuoi
  verified_at: 2026-10-17T07:37:37Z
  output: |
    CHIEU DO DAT: e16-cu

- eval: E11
  run_id: minted-ve-sinh-do-san-onehub-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.osa_soi_ma
  verified_at: 2026-10-17T07:37:37Z
  output: |
    KET LUAN 19 DUNG, 0 SAI — ma thoat 0

- eval: E12
  run_id: minted-ve-sinh-do-san-onehub-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.osa_san_thiet_ke
  verified_at: 2026-10-17T07:37:37Z
  output: |
    KET LUAN 9 DUNG, 0 SAI — ma thoat 0

- eval: E13
  run_id: minted-ve-sinh-do-san-onehub-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.osa_ktcd_khong_trinh_duyet
  verified_at: 2026-10-17T07:37:37Z
  output: |
    Ran 6 tests across 1 file. [642.00ms]

- eval: E14
  run_id: minted-ve-sinh-do-san-onehub-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.sk_luat
  verified_at: 2026-10-17T07:37:37Z
  output: |
    ranh gioi: dat

- eval: E15
  run_id: minted-ve-sinh-do-san-onehub-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-10-17T07:37:37Z
  output: |
    phien-do: xong — mã 0

- eval: E16
  run_id: minted-ve-sinh-do-san-onehub-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dok_man_chrome
  verified_at: 2026-10-17T07:37:37Z
  output: |
    phien-do: xong — mã 0

- eval: E17
  run_id: minted-ve-sinh-do-san-onehub-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_khong_noi
  verified_at: 2026-10-17T07:37:37Z
  output: |
    khong-noi: 57 hunk co khai (moc 21b709411)

- eval: E18
  run_id: minted-ve-sinh-do-san-onehub-E18-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vs_ghim_xanh
  verified_at: 2026-10-17T07:37:37Z
  output: |
    OK tu kiem ghim
    HONG GHIM okr-soat-anh-luot-3: cay ngoai _acceptance o 38ba7b5e8 khac dinh nhanh
    HONG GHIM toan-canh-okr: cay ngoai _acceptance o 38ba7b5e8 khac dinh nhanh
    HONG GHIM soan-okr-trong-khung: cay ngoai _acceptance o 38ba7b5e8 khac dinh nhanh
    HONG GHIM khung-trang-cai-dat: cay ngoai _acceptance o 38ba7b5e8 khac dinh nhanh
    HONG GHIM man-cai-dat-noi-tieng-viet: eval do E5=2
    HONG GHIM dat-okr-trong-crm: cay ngoai _acceptance o 38ba7b5e8 khac dinh nhanh
    HONG GHIM muc-tieu-va-kr: cay ngoai _acceptance o 38ba7b5e8 khac dinh nhanh

- eval: E19
  run_id: minted-ve-sinh-do-san-onehub-E19-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_hydrat_record
  verified_at: 2026-10-17T07:37:37Z
  output: |
    phien-do: xong — mã 0

- eval: E20
  run_id: minted-ve-sinh-do-san-onehub-E20-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vs_nap_san_dom
  verified_at: 2026-10-17T07:37:37Z
  output: |
    Ran 6 tests across 1 file. [710.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-17T07:37:37Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-17T07:37:37Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-17T07:37:37Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-17T07:37:37Z

- cmd: bunx turbo run lint --force
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-17T07:37:37Z

- cmd: bun run lint:slop
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-17T07:37:37Z

- cmd: bunx turbo run build --force
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-17T07:37:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Không eval nào xanh ở cả hai phía. Các eval có baseline red (E8, E11, E12, E13, E14, E15, E16) phân biệt được code cũ và mới; các eval còn lại có baseline n-a, lý do ở mục dưới.

### Baseline khong do

- Hai lệnh bị dừng vì vượt trần 180 giây mỗi lệnh (đã dừng cả cây tiến trình): đây là BLOCKED hạ tầng của làn baseline, không phải kết quả của code cũ.
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/ve-sinh-do-san-onehub/rang/hydrat-record.mjs": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu
- node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --tu-thu-cay && node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --ca hydrat: bo qua baseline: tep _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-nap-san.dom.tsx: bo qua baseline: tep apps/app/test/ngan-ban-ghi-nap-san.dom.tsx co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --tu-thu-cay && node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --ca nap-san: bo qua baseline: tep _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/soan-okr-nguoi-xem-khong-mo.dom.tsx: bo qua baseline: tep apps/app/test/soan-okr-nguoi-xem-khong-mo.dom.tsx co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --tu-thu-cay && node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --ca 403: bo qua baseline: tep _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-trang-cai-dat/rang/khong-hoi-quy.mjs: baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu
- node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --tu-thu-cay && node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --ca moi-chuoi-khai --ca moi-chuoi-that --ca e16-thieu --ca e16-cu: bo qua baseline: tep _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ve-sinh-do-san-onehub/rang/khong-noi.mjs --tu-thu && node _acceptance/ve-sinh-do-san-onehub/rang/khong-noi.mjs: bo qua baseline: tep _acceptance/ve-sinh-do-san-onehub/rang/khong-noi.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs --tu-thu && node _acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs: bo qua baseline: tep _acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E18 failed — răng ghim-xanh báo sáu trên bảy hồ sơ ghim có cây ngoài _acceptance ở 38ba7b5e8 khác đỉnh nhánh, và hồ sơ man-cai-dat-noi-tieng-viet có eval E5 đỏ trong dòng repin cuối. Hai mươi eval còn lại và bảy lệnh suite đạt. Returned to implementation.
