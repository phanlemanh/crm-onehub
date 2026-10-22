---
schema_version: 2
feature_slug: moi-kr-ca-cong-ty
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4a8a233b18b7f001374a02a338c45176c44f6781
human_signoff:
---

# Evidence Report: moi-kr-ca-cong-ty

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-moi-kr-ca-cong-ty-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_o_truot
  verified_at: 2026-10-22T03:21:02Z
  output: |
    Ran 1 test across 1 file. [1310.00ms]

- eval: E2
  run_id: minted-moi-kr-ca-cong-ty-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:21:02Z
  output: |
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-moi-kr-ca-cong-ty-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_nguon
  verified_at: 2026-10-22T03:21:02Z
  output: |
    test-run: dropped crm_mviz52swmu3q_test

- eval: E4
  run_id: minted-moi-kr-ca-cong-ty-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_quyen
  verified_at: 2026-10-22T03:21:02Z
  output: |
    test-run: dropped crm_mviz509zo4c4_test

- eval: E5
  run_id: minted-moi-kr-ca-cong-ty-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_tinh_trang
  verified_at: 2026-10-22T03:21:02Z
  output: |
    test-run: dropped crm_mviz52tslbmm_test

- eval: E6
  run_id: minted-moi-kr-ca-cong-ty-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_don_vi
  verified_at: 2026-10-22T03:21:02Z
  output: |
    test-run: dropped crm_mviz52zayeww_test

- eval: E7
  run_id: minted-moi-kr-ca-cong-ty-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_nguoi
  verified_at: 2026-10-22T03:21:02Z
  output: |
    test-run: dropped crm_mviz52hyc1tj_test

- eval: E8
  run_id: minted-moi-kr-ca-cong-ty-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_duong_dan
  verified_at: 2026-10-22T03:21:02Z
  output: |
    Ran 1 test across 1 file. [1.71s]

- eval: E9
  run_id: minted-moi-kr-ca-cong-ty-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_ngan
  verified_at: 2026-10-22T03:21:02Z
  output: |
    Ran 1 test across 1 file. [1360.00ms]

- eval: E10
  run_id: minted-moi-kr-ca-cong-ty-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_trang
  verified_at: 2026-10-22T03:21:02Z
  output: |
    Ran 2 tests across 1 file. [1179.00ms]

- eval: E11
  run_id: minted-moi-kr-ca-cong-ty-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:21:02Z
  screenshot: evidence/suc-khoe-1280.png
  observed: |
    Đã mở cả bốn khung bằng Read. suc-khoe-1280: hàng ô số đầu trang Mục tiêu có năm ô, ô cuối «KR trượt 3» kèm dòng phụ «Bấm để xem danh sách»; con trỏ và viền hover không thấy được trên ảnh tĩnh. moi-kr-1280: có tiêu đề «Mọi KR», một câu mô tả, chip «Trượt 3» đang chọn, bảng KR · Đơn vị · Phụ trách · Tiến độ · Tình trạng, ba dòng đều «Trượt» với chấm đỏ kèm chữ, «Tổng số KR: 3».
    suc-khoe-375: ô số xếp lưới hai cột, ô «KR trượt 3 / Bấm để xem danh sách» thấy rõ, không tràn ngang. moi-kr-375: chip «Trượt 3» đang chọn, bảng chỉ còn cột KR · Đơn vị · Tình trạng (ẩn Phụ trách và Tiến độ), chấm đỏ kèm chữ «Trượt» còn ở cả ba dòng, bảng không tràn ngang (chỉ hàng chip lọc cuộn ngang nội bộ, cột Đơn vị cắt chữ).
  network_observed: n-a (driver)
  frames: evidence/suc-khoe-1280.png, evidence/moi-kr-1280.png, evidence/suc-khoe-375.png, evidence/moi-kr-375.png

- eval: E12
  run_id: minted-moi-kr-ca-cong-ty-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:21:02Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T03:21:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T03:21:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T03:21:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T03:21:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T03:21:02Z

- cmd: bun run lint:slop
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T03:21:02Z

- cmd: bunx turbo run build --force
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T03:21:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt). Lưu ý: các eval có baseline n-a (E1, E3 đến E10, E11) không đo được trên mã cũ, lý do nằm ngay dưới nên chúng không được tính là đã phân biệt.

Baseline không đo:

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t mkc-o-truot: bo qua baseline: tep apps/app/test/moi-kr-ca-cong-ty.dom.tsx co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-nguon": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-quyen": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-loc-tinh-trang": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-loc-don-vi": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-loc-nguoi": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t mkc-duong-dan: bo qua baseline: tep apps/app/test/moi-kr-ca-cong-ty.dom.tsx co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t mkc-ngan: bo qua baseline: tep apps/app/test/moi-kr-ca-cong-ty.dom.tsx co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t mkc-trang: bo qua baseline: tep apps/app/test/moi-kr-ca-cong-ty.dom.tsx co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, xác định).

## Iterations

Round 1: cả mười hai eval máy và bảy lệnh suite chạy xanh, không eval nào đỏ. Verdict REJECT vì bốn phát hiện trong hợp đồng cho thấy bài kiểm không chứng minh lời hứa của AC: AC-9 (E10 không đo tiêu đề PageShellTitle ở năm trạng thái, chiều đỏ đã khai không bắn được), AC-2 (E3 phần đối chứng bỏ im KR công bố muộn), AC-7 (E8 thiếu bước đổi chu kỳ), AC-1 (E2 đọc lại con số total do API trả thay vì đếm dòng bảng). Trả về cho bước cài đặt để siết bài kiểm.

