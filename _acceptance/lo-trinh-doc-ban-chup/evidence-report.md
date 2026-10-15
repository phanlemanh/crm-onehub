---
schema_version: 2
feature_slug: lo-trinh-doc-ban-chup
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 371202702e407c61ab8c72419d921f152b7f61e9
human_signoff:
---

# Evidence Report: lo-trinh-doc-ban-chup

Cả 18 eval của hợp đồng đều chạy xanh. Verdict là REJECT vì một lệnh suite hồi quy không gắn eval nào bị đỏ: `bun run test -- --filter=app --filter=@crm/ui` (chi tiết ở mục Analyst).

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
  run_id: minted-lo-trinh-doc-ban-chup-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_day
  verified_at: 2026-10-15T03:13:37Z
  output: |
    test-run: dropped crm_mv8zwo0qzuue_test

- eval: E2
  run_id: minted-lo-trinh-doc-ban-chup-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_lenh
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 20 tests across 2 files. [107.00ms]

- eval: E3
  run_id: minted-lo-trinh-doc-ban-chup-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldbc_do_man
  verified_at: 2026-10-15T03:13:37Z
  screenshot: evidence/E3-step1.png
  observed: |
    ban-dung-1280-vi: trang Lộ trình, dòng «Cập nhật lúc 10:46 15/10/2026 (bản dựng)», bảng 36 việc chưa xong, hàng đầu DA2b, không có chuỗi LT1C-DAU. ban-dung-1280-en: «Updated 10/15/2026, 10:46 (build)», tiêu đề Roadmap, bảng cùng dữ liệu, không có chuỗi đánh dấu. ban-dung-375-vi: «Cập nhật lúc 10:46 15/10/2026 (bản dựng)», bố cục điện thoại, hàng DA2b/DA3/DA4, không có chuỗi đánh dấu, không cuộn ngang. ban-dung-375-en: «Updated 10/14/2026, 23:46 (build)», không đánh dấu, không cuộn ngang. ban-chup-1280-vi: «Cập nhật lúc 23:45 14/10/2026» (không có chữ bản dựng), mọi hàng thấy được (DA2b, DA3, DA4, C, NM2, NM3, K2f, E4b...) kết thúc bằng «LT1C-DAU-mv8zwzyx». ban-chup-1280-en: «Updated 10/15/2026, 10:45» không có «(build)», hàng mang chuỗi LT1C-DAU-mv8zwzyx. ban-chup-375-vi: «Cập nhật lúc 10:45 15/10/2026», hàng DA2b/DA3/DA4 có LT1C-DAU-mv8zwzyx, vừa khung 375, không cuộn ngang. ban-chup-375-en: «Updated 10/15/2026, 10:45», cùng chuỗi đánh dấu trong câu giao, không cuộn ngang. vai-member-1280: avatar «NĐ» (người xem khác), «Cập nhật lúc 10:45 15/10/2026» không «bản dựng», bảng vẫn hiện đủ hàng có chuỗi LT1C-DAU-mv8zwzyx; khối số liệu chủ kho không thấy trong ảnh, DOM xác nhận chủ true/thành viên false. Tất cả khớp Expected.
  network_observed: n-a (driver)

- eval: E3b
  run_id: minted-lo-trinh-doc-ban-chup-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldbc_do_man
  verified_at: 2026-10-15T03:13:37Z
  screenshot: evidence/E3b-step1.png
  observed: |
    Da mo tung anh bang Read.
    step1 ban-dung-1280-vi: tieu de Lo trinh, dong "Cap nhat luc 10:46 15/10/2026 (ban dung)" ngay duoi mo ta, tren thanh tim kiem; khong tran, bang 1280 khong cuon ngang; khong co chuoi danh dau LT1C.
    step2 ban-dung-1280-en: "Updated 10/15/2026, 10:46 (build)", giao dien tieng Anh (Roadmap), nhan "(build)" dung ngon ngu; khong co chuoi danh dau.
    step3 ban-dung-375-vi: "Cap nhat luc 10:46 15/10/2026 (ban dung)" hien o dau vung noi dung, nam gon trong 1 dong, khong tran/cuon ngang; mo ta xuong dong.
    step4 ban-dung-375-en: "Updated 10/14/2026, 23:46 (build)" — gio lui 11 tieng so voi HCM = New_York, nhan (build) tieng Anh, khong cuon ngang.
    step5 ban-chup-1280-vi: "Cap nhat luc 23:46 14/10/2026" (khong chu ban dung), hang bang mang chuoi LT1C-DAU-mv8zyxcs; gio New_York khac gio HCM (10:46 15/10) cua cac o khac.
    step6 ban-chup-1280-en: "Updated 10/15/2026, 10:46" khong chu (build), chuoi danh dau co mat.
    step7 ban-chup-375-vi: "Cap nhat luc 10:46 15/10/2026" mot dong, khong tran, khong cuon ngang, chuoi danh dau trong hang.
    step8 ban-chup-375-en: "Updated 10/15/2026, 10:46" mot dong, khong tran/cuon ngang, chuoi danh dau co mat.
    Tat ca 8 o khop Expected: dong gio lay nhin thay duoc o dau vung noi dung, gio theo mui gio trinh duyet cua o (2 o NY lech 11 gio so voi 6 o HCM), nhan ban dung chi o cac o ban-dung va dung ngon ngu, 375 khong cuon ngang. translate="no" do script xac nhan (true) o moi o.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-lo-trinh-doc-ban-chup-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_khoa
  verified_at: 2026-10-15T03:13:37Z
  output: |
    test-run: dropped crm_mv8zwnftxe0i_test

- eval: E5
  run_id: minted-lo-trinh-doc-ban-chup-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldbc_khoa_ui
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 10 tests across 1 file. [2.01s]

- eval: E6
  run_id: minted-lo-trinh-doc-ban-chup-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_hong
  verified_at: 2026-10-15T03:13:37Z
  output: |
    test-run: dropped crm_mv8zwn7z4wvx_test

- eval: E7
  run_id: minted-lo-trinh-doc-ban-chup-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_lenh
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 20 tests across 2 files. [107.00ms]

- eval: E8
  run_id: minted-lo-trinh-doc-ban-chup-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_thu_tu
  verified_at: 2026-10-15T03:13:37Z
  output: |
    test-run: dropped crm_mv8zwnilndha_test

- eval: E9
  run_id: minted-lo-trinh-doc-ban-chup-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_doc
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 6 tests across 1 file. [39.00ms]

- eval: E10
  run_id: minted-lo-trinh-doc-ban-chup-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_lenh
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 20 tests across 2 files. [107.00ms]

- eval: E11
  run_id: minted-lo-trinh-doc-ban-chup-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_chon
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 4 tests across 1 file. [25.00ms]

- eval: E12
  run_id: minted-lo-trinh-doc-ban-chup-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_dong
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 6 tests across 1 file. [363.00ms]

- eval: E13
  run_id: minted-lo-trinh-doc-ban-chup-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ldbc_thiet_ke
  verified_at: 2026-10-15T03:13:37Z
  output: |
    design-gate static: không P0 ở các tệp đã duyệt

- eval: E14
  run_id: minted-lo-trinh-doc-ban-chup-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_day
  verified_at: 2026-10-15T03:13:37Z
  output: |
    test-run: dropped crm_mv8zwo0qzuue_test

- eval: E15
  run_id: minted-lo-trinh-doc-ban-chup-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_vai
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 11 tests across 1 file. [38.00ms]

- eval: E16
  run_id: minted-lo-trinh-doc-ban-chup-E16-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gth_vai
  verified_at: 2026-10-15T03:13:37Z
  output: |
    test-run: dropped crm_mv8zwtuqv6ed_test

- eval: E17
  run_id: minted-lo-trinh-doc-ban-chup-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldbc_lenh
  verified_at: 2026-10-15T03:13:37Z
  output: |
    Ran 20 tests across 2 files. [107.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T03:13:37Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-15T03:13:37Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T03:13:37Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T03:13:37Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T03:13:37Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-15T03:13:37Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-doc-ban-chup-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T03:13:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

Lệnh suite đỏ không gắn eval nào (nguyên nhân của verdict REJECT): `bun run test -- --filter=app --filter=@crm/ui`. Gói app đỏ ở `test/lo-trinh-ban-chup.dom.tsx`, ca đầu của nhóm dong-gio («tien trinh chay o mui gio khac Viet Nam»): ca này khẳng định múi giờ của tiến trình là America/New_York nhưng nhận Asia/Saigon, vì lệnh suite không đặt biến TZ. Năm ca còn lại của nhóm dong-gio xanh. E12 xanh chỉ khi chạy riêng với tiền tố TZ=America/New_York; trong suite thật tệp này không được cấp múi giờ đó nên cả bộ test app đỏ. Hồ sơ này chưa có eval nào khai lỗi đó, nên failed_evals để trống; cần sửa cách cấp múi giờ cho tệp test trong đường chạy suite, rồi chạy lại.

Eval không-phân-biệt (xanh cả trên code cũ lẫn code mới, chứng minh harness chứ không chứng minh feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý): E13, E16.

Baseline khong do:
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

Round 1: không eval nào đỏ; lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ vì ca đầu nhóm dong-gio của `test/lo-trinh-ban-chup.dom.tsx` đòi múi giờ America/New_York mà suite không cấp (nhận Asia/Saigon). Returned to implementation.
