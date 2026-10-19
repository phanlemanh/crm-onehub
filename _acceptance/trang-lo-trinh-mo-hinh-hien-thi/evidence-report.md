---
schema_version: 2
feature_slug: trang-lo-trinh-mo-hinh-hien-thi
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6b908808932a7695e07fdd34f97e7f241d0b6d85
human_signoff:
---

# Evidence Report: trang-lo-trinh-mo-hinh-hien-thi

Verdict REJECT dù bảy eval của tính năng đều xanh: hai lệnh suite hồi quy không gắn eval nào (`bun run test -- --filter=app --filter=@crm/ui` và `bunx turbo run build --force`) đỏ. Build đỏ ở lỗi kiểu (type check) ngay trong tệp bài kiểm của tính năng này, `apps/app/test/lo-trinh-mo-hinh.spec.ts` dòng 191 và 194. Chi tiết ở mục «Lệnh suite (hồi quy)».

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_viec_moc
  verified_at: 2026-10-19T14:06:39Z
  output: |
    Ran 1 test across 1 file. [1081.00ms]

- eval: E2
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_moc_hien
  verified_at: 2026-10-19T14:06:39Z
  output: |
    Ran 2 tests across 1 file. [1203.00ms]

- eval: E3
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_chua_hen
  verified_at: 2026-10-19T14:06:39Z
  output: |
    Ran 1 test across 1 file. [1490.00ms]

- eval: E4
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_ten
  verified_at: 2026-10-19T14:06:39Z
  output: |
    Ran 1 test across 1 file. [1072.00ms]

- eval: E5
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_doi_chieu
  verified_at: 2026-10-19T14:06:39Z
  output: |
    Ran 2 tests across 1 file. [1.69s]

- eval: E6
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_khoi_cu
  verified_at: 2026-10-19T14:06:39Z
  output: |
    Ran 2 tests across 1 file. [1.52s]

- eval: E7
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltmh_do_man
  verified_at: 2026-10-19T14:06:39Z
  screenshot: evidence/E7-step1.png
  observed: |
    Da mo bang Read ca 8 anh (anh toan trang 12000px cao hien thi rat nho nen cat vung dau/cuoi bang PIL de doc chu; da xem day du cac vung: 1280-vi-toi dau + cuoi, 1280-en-sang dau, 375-vi-sang dau + cuoi, 375-en-toi dau; 4 anh con lai kiem o dang toan trang va khop ket qua do). Thay: trang Lo trinh o kieu xem Moc, loc Tat ca 194, dong thoi gian doc voi tung moc: ngay ben trai, ten moc, ten lo trinh (Kho tai lieu / OKR) ngay duoi, ROI MOI toi dong so rieng duoi ten lo trinh ("da giao du 1 viec", "da giao du 8 viec", "con 6/6 viec" o nen toi vi; "All 1 delivered", "All 8 delivered" o ban en), roi moi toi danh sach ten viec day du (co dong rot hai dong, khong bi cat ba cham), moi viec co chip trang thai (Da giao / Chua bat dau / Khac; Shipped o ban en).
    Moc giao du ("da giao du N viec") va moc con viec ("con 6/6 viec", kem dong 'Du kien xong 30 thg 10, 2026' + ghi chu uoc tinh) deu co mat. Nen toi (1280-vi-toi): chu sang tren nen den, dong so doc ro, khong chu nao chong len nhau; o 375 chu xuong dong gon, chip trang thai nam sat phai trong khung, khong tran ngang. Nhom chua hen moc o cuoi trang mo ra liet ten viec day du (hang tram dong, nhieu viec dai xuong hai dong, khong cat), chan trang "194 viec · 145/194 da giao trong pham vi loc" khop tong 194. Khong thay chong chu, khong thay tran ngang o 375. Noi dung khop Expected; khong mau thuan voi ket luan 8 DUNG / 0 SAI.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

Hai lệnh dưới đây không gắn eval nào và đỏ; đó là lý do verdict là REJECT trong khi `failed_evals` rỗng.

- cmd: bun run test -- --filter=api
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-19T14:06:39Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-19T14:06:39Z
  output: |
    Ran 906 tests across 91 files: 905 pass, 1 fail.
    (fail) kho chuoi cua vong ③a > moi ham ghep bien co khang dinh, va so ham bang so khang dinh [1.40ms]
    Failed: app#test. Nguyên nhân chưa quy được về tính năng này hay về cây nền.

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-19T14:06:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-19T14:06:39Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-19T14:06:39Z

- cmd: bun run lint:slop
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-19T14:06:39Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 1
  verified_at: 2026-10-19T14:06:39Z
  output: |
    app:build: Compiled successfully in 14.7s, then Running TypeScript failed.
    app:build: test/lo-trinh-mo-hinh.spec.ts(191,5): error TS2769: No overload matches this call.
    app:build: Argument of type '(string | null | undefined)[]' is not assignable to parameter of type '(string | null)[]'.
    app:build: test/lo-trinh-mo-hinh.spec.ts(194,5): error TS2769: No overload matches this call.
    app:build: Argument of type '(number | boolean | string[] | null | undefined)[][]' is not assignable to parameter of type '(number | boolean | string[] | null)[][]'.
    app:build: Failed to type check.
    Tasks: 4 successful, 5 total. Failed: app#build

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào của tính năng xanh trên cả HEAD lẫn baseline; cả bảy eval đều là eval mới, baseline không đo được nên mọi trường baseline là n-a (xem bên dưới).

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-mo-hinh.spec.ts -t ltmh-viec-moc && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-mo-hinh.dom.tsx -t ltmh-viec-moc: bo qua baseline: tep apps/app/test/lo-trinh-mo-hinh.spec.ts co o cay dang kiem nhung chua co o merge-base 926dfc6076b6f47022a36f2a81c15d01ae4ae130 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-mo-hinh.dom.tsx -t ltmh-moc-hien: bo qua baseline: tep apps/app/test/lo-trinh-mo-hinh.dom.tsx co o cay dang kiem nhung chua co o merge-base 926dfc6076b6f47022a36f2a81c15d01ae4ae130 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-mo-hinh.dom.tsx -t ltmh-chua-hen: bo qua baseline: tep apps/app/test/lo-trinh-mo-hinh.dom.tsx co o cay dang kiem nhung chua co o merge-base 926dfc6076b6f47022a36f2a81c15d01ae4ae130 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-mo-hinh.dom.tsx -t ltmh-ten: bo qua baseline: tep apps/app/test/lo-trinh-mo-hinh.dom.tsx co o cay dang kiem nhung chua co o merge-base 926dfc6076b6f47022a36f2a81c15d01ae4ae130 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-mo-hinh.dom.tsx -t ltmh-doi-chieu: bo qua baseline: tep apps/app/test/lo-trinh-mo-hinh.dom.tsx co o cay dang kiem nhung chua co o merge-base 926dfc6076b6f47022a36f2a81c15d01ae4ae130 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-mo-hinh.spec.ts -t ltmh-khoi-cu && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-mo-hinh.dom.tsx -t ltmh-khoi-cu: bo qua baseline: tep apps/app/test/lo-trinh-mo-hinh.spec.ts co o cay dang kiem nhung chua co o merge-base 926dfc6076b6f47022a36f2a81c15d01ae4ae130 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval ngẫu nhiên)

## Iterations

Round 1: bảy eval E1-E7 xanh; hai lệnh suite không gắn eval đỏ — `bun run test -- --filter=app --filter=@crm/ui` (một ca «kho chuoi cua vong ③a» đỏ, chưa quy nguyên nhân) và `bunx turbo run build --force` (lỗi kiểu TS2769 ở `apps/app/test/lo-trinh-mo-hinh.spec.ts` dòng 191 và 194, mảng có thể chứa `undefined` truyền vào `toEqual` kiểu hẹp). Returned to implementation.
