---
schema_version: 2
feature_slug: lo-trinh-doc-ban-chup
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 88a0c87ca8089c1e5744ed2eb396031067fba5b4
human_signoff:
---

# Evidence Report: lo-trinh-doc-ban-chup

Vòng 2. Cả 18 eval của hợp đồng chạy xanh, nhưng lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ và không gắn eval nào, nên verdict là REJECT với `failed_evals` rỗng (xem mục Analyst).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-1 | ui-check | PASS |
| E3b | AC-7 | ui-check | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-2 | test | PASS |
| E6 | AC-3 | test | PASS |
| E7 | AC-3 | test | PASS |
| E8 | AC-4 | test | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-5 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-7 | test | PASS |
| E13 | AC-7 | script | PASS |
| E14 | AC-7 | test | PASS |
| E15 | AC-8 | test | PASS |
| E16 | AC-2 | test | PASS |
| E17 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-lo-trinh-doc-ban-chup-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_day
  verified_at: 2026-10-15T04:09:22Z
  output: |
    test-run: dropped crm_mv91ks7nan8f_test

- eval: E2
  run_id: minted-lo-trinh-doc-ban-chup-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_lenh
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 22 tests across 2 files. [190.00ms]

- eval: E3
  run_id: minted-lo-trinh-doc-ban-chup-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldbc_do_man
  verified_at: 2026-10-15T04:09:22Z
  screenshot: evidence/E3-step1.png
  observed: |
    Da mo bang Read 9 anh (cac anh con lai trong tap tuong ung 1:1 cung tep). ban-dung-1280-vi: trang Lo trinh tieng Viet, dong «Cap nhat luc 11:33 15/10/2026 (ban dung)» o dau vung noi dung, bang co cac hang DA2b, DA3, DA4... mo ta goc, KHONG co chuoi LT1C-DAU, khong cuon ngang. ban-dung-1280-en: «Roadmap», «Updated 10/15/2026, 11:33 (build)», bang khong co chuoi danh dau. ban-dung-375-vi: «Cap nhat luc 11:33 15/10/2026 (ban dung)», danh sach dang the, khong tran ngang, khong chuoi danh dau. ban-dung-375-en: «Updated 10/15/2026, 00:32 (build)» (mui New_York, lech 11 gio so voi o VN, dung ky vong), nhan (build) dung ngon ngu en. ban-chup-1280-vi: «Cap nhat luc 00:32 15/10/2026» KHONG co chu ban dung, moi hang bang (DA2b, DA3, DA4, C, NM2...) mang them dong «LT1C-DAU-mv91l6n1». ban-chup-1280-en: «Updated 10/15/2026, 11:32», khong co (build), hang mang LT1C-DAU-mv91l6n1. ban-chup-375-vi: «Cap nhat luc 11:32 15/10/2026», khong co chu ban dung, cac the mang LT1C-DAU-mv91l6n1, khong tran ngang. ban-chup-375-en: «Updated 10/15/2026, 11:32», the mang LT1C-DAU-mv91l6n1, bo cuc 375 gon, dong gio xuong dong khong tran. vai-member-1280: bang van hien day du, hang mang LT1C-DAU-mv91l6n1, dong «Cap nhat luc 11:32 15/10/2026», khong thay khoi so lieu chu kho trong khung nhin. Moi anh khop Expected; khong co mau thuan.
  network_observed: n-a (driver)

- eval: E3b
  run_id: minted-lo-trinh-doc-ban-chup-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldbc_do_man
  verified_at: 2026-10-15T04:09:22Z
  screenshot: evidence/E3b-step1.png
  observed: |
    Da mo tung anh 8 o bang Read. (1) ban-dung-1280-vi: trang Lo trinh dark, dong ngay duoi cau mo ta, o dau vung noi dung: «Cap nhat luc 11:33 15/10/2026 (ban dung)», nhan «(ban dung)» tieng Viet, khong chuoi danh dau LT1C-DAU, bang khong tran. (2) ban-dung-1280-en: tieu de Roadmap, «Updated 10/15/2026, 11:33 (build)», nhan «(build)» dung ngon ngu en, nhan nam trong dong gio. (3) ban-dung-375-vi: «Cap nhat luc 11:33 15/10/2026 (ban dung)» nam tren mot dong vua khung 375, khong tran, khong cuon ngang nhin thay. (4) ban-dung-375-en (New_York): «Updated 10/15/2026, 00:33 (build)», gio lech dung theo mui New_York (khac 11:33 cua cac o HCM), nhan (build) dung, vua man 375. (5) ban-chup-1280-vi (New_York): «Cap nhat luc 00:33 15/10/2026» khong co chu ban dung; hang bang mang chuoi LT1C-DAU-mv91n5x9 o moi dong. (6) ban-chup-1280-en: «Updated 10/15/2026, 11:33» khong co (build), hang bang co chuoi danh dau. (7) ban-chup-375-vi: «Cap nhat luc 11:33 15/10/2026» khong nhan ban dung, the danh sach co chuoi danh dau, khong tran ngang. (8) ban-chup-375-en: «Updated 10/15/2026, 11:33» khong nhan ban dung, chuoi danh dau co trong moi muc. Tat ca khop Expected: dong gio lay thay duoc o dau vung noi dung, gio dung theo mui cua o (New_York lech dung o 2 o), nhan ban dung chi o 4 o ban-dung va dung ngon ngu vi/en, o 375 xuong dong khong tran.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-lo-trinh-doc-ban-chup-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_khoa
  verified_at: 2026-10-15T04:09:22Z
  output: |
    test-run: dropped crm_mv91ktgzevce_test

- eval: E5
  run_id: minted-lo-trinh-doc-ban-chup-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldbc_khoa_ui
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 10 tests across 1 file. [1.99s]

- eval: E6
  run_id: minted-lo-trinh-doc-ban-chup-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_hong
  verified_at: 2026-10-15T04:09:22Z
  output: |
    test-run: dropped crm_mv91kt8i4xt5_test

- eval: E7
  run_id: minted-lo-trinh-doc-ban-chup-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_lenh
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 22 tests across 2 files. [190.00ms]

- eval: E8
  run_id: minted-lo-trinh-doc-ban-chup-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_thu_tu
  verified_at: 2026-10-15T04:09:22Z
  output: |
    test-run: dropped crm_mv91ktbn4fxp_test

- eval: E9
  run_id: minted-lo-trinh-doc-ban-chup-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_doc
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 7 tests across 1 file. [36.00ms]

- eval: E10
  run_id: minted-lo-trinh-doc-ban-chup-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_lenh
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 22 tests across 2 files. [190.00ms]

- eval: E11
  run_id: minted-lo-trinh-doc-ban-chup-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_chon
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 5 tests across 1 file. [27.00ms]

- eval: E12
  run_id: minted-lo-trinh-doc-ban-chup-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_dong
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 6 tests across 1 file. [346.00ms]

- eval: E13
  run_id: design-gate-ebf1de8e23, design-gate-a42802ab47
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ldbc_thiet_ke
  verified_at: 2026-10-15T04:09:22Z
  output: |
    }

- eval: E14
  run_id: minted-lo-trinh-doc-ban-chup-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_day
  verified_at: 2026-10-15T04:09:22Z
  output: |
    test-run: dropped crm_mv91ks7nan8f_test

- eval: E15
  run_id: minted-lo-trinh-doc-ban-chup-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_vai
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 11 tests across 1 file. [37.00ms]

- eval: E16
  run_id: minted-lo-trinh-doc-ban-chup-E16-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gth_vai
  verified_at: 2026-10-15T04:09:22Z
  output: |
    test-run: dropped crm_mv91kz7pz40f_test

- eval: E17
  run_id: minted-lo-trinh-doc-ban-chup-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_lenh
  verified_at: 2026-10-15T04:09:22Z
  output: |
    Ran 22 tests across 2 files. [190.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T04:09:22Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 1
  verified_at: 2026-10-15T04:09:22Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T04:09:22Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T04:09:22Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-15T04:09:22Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T04:09:22Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-15T04:09:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

Lệnh suite đỏ không gắn eval nào: `bun run test -- --filter=app --filter=@crm/ui`. Lượt này dừng ở tệp `apps/app/test/ngan-ho-so-vai.dom.tsx` (3 ca qua, 1 ca đỏ: ca «chieu do: ban sao trang truyen khoi nguyen kem vai, ban sao bo buoc loc» báo «khong thay cho goi choVaiXem(await docDauVao(), vai) trong page.tsx»). Lệnh này nằm trong bộ lệnh suite của hợp đồng và cũng là bước của hook pre-push, nên nó chặn verdict dù `failed_evals` rỗng. Không eval nào của hợp đồng đỏ.

Eval không phân biệt (xanh trên cả nhánh lẫn diffBase; chứng minh harness, không chứng minh tính năng): E13, E16. Hai eval này là regression-guard; cần người xác nhận chủ ý giữ, hoặc viết lại để khẳng định hành vi mới.

Không có eval judgment trong hợp đồng này, nên không có hội đồng chấm và không có mục chờ `human_override`.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/ban-chup-lo-trinh.spec.ts -t ldbc-day": bo qua baseline: tep apps/api/test/ban-chup-lo-trinh.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/ban-chup-lo-trinh/test: bo qua baseline: tep scripts/ban-chup-lo-trinh/test co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/ban-chup-lo-trinh.spec.ts -t ldbc-khoa": bo qua baseline: tep apps/api/test/ban-chup-lo-trinh.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/ban-chup-lo-trinh.spec.ts -t ldbc-hong": bo qua baseline: tep apps/api/test/ban-chup-lo-trinh.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/ban-chup-lo-trinh.spec.ts -t ldbc-thu-tu": bo qua baseline: tep apps/api/test/ban-chup-lo-trinh.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/lo-trinh-ban-chup.spec.ts -t doc: bo qua baseline: tep apps/app/test/lo-trinh-ban-chup.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/lo-trinh-ban-chup.spec.ts -t chon-nguon: bo qua baseline: tep apps/app/test/lo-trinh-ban-chup.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=America/New_York bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-ban-chup.dom.tsx -t dong-gio: bo qua baseline: tep apps/app/test/lo-trinh-ban-chup.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/lo-trinh-ban-chup.spec.ts -t vai: bo qua baseline: tep apps/app/test/lo-trinh-ban-chup.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — suite app đỏ vì múi giờ của test, sáu phép đo chỉ kiểm chuỗi hoặc tự so với chính nó. Returned to implementation (commit 88a0c87ca: đo quan hệ thay chuỗi, đối chứng dương, múi giờ test tự đặt).
Round 2: cả 18 eval xanh, nhưng suite app còn đỏ ở ngan-ho-so-vai.dom.tsx, tệp mà vòng 1 chưa bao giờ chạy tới vì dừng sớm ở tệp đỏ đứng trước. Returned to implementation.
