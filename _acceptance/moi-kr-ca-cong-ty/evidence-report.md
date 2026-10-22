---
schema_version: 2
feature_slug: moi-kr-ca-cong-ty
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 617cb770cd144e9874bf005579f62f9f7a24f5cb
human_signoff:
---

# Evidence Report: moi-kr-ca-cong-ty

Vòng 2. Cả 12 eval của hợp đồng đều xanh, nhưng một lệnh suite không gắn eval nào là `bun run lint:slop` đỏ (một lỗi anti-slop trong tệp bài kiểm của chính tính năng). Vì vậy kết luận là REJECT dù `failed_evals` rỗng: không eval nào đỏ, lệnh đỏ nằm ở mục «Lệnh suite (hồi quy)» bên dưới.

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
  run_id: minted-moi-kr-ca-cong-ty-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_o_truot
  verified_at: 2026-10-22T03:53:18Z
  output: |
    Ran 1 test across 1 file. [1261.00ms]

- eval: E2
  run_id: minted-moi-kr-ca-cong-ty-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:53:18Z
  output: |
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-moi-kr-ca-cong-ty-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_nguon
  verified_at: 2026-10-22T03:53:18Z
  output: |
    test-run: dropped crm_mvj0amzayv7h_test

- eval: E4
  run_id: minted-moi-kr-ca-cong-ty-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_quyen
  verified_at: 2026-10-22T03:53:18Z
  output: |
    test-run: dropped crm_mvj0ako8sl2b_test

- eval: E5
  run_id: minted-moi-kr-ca-cong-ty-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_tinh_trang
  verified_at: 2026-10-22T03:53:18Z
  output: |
    test-run: dropped crm_mvj0ami5p3e2_test

- eval: E6
  run_id: minted-moi-kr-ca-cong-ty-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_don_vi
  verified_at: 2026-10-22T03:53:18Z
  output: |
    test-run: dropped crm_mvj0alnvdk1g_test

- eval: E7
  run_id: minted-moi-kr-ca-cong-ty-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_nguoi
  verified_at: 2026-10-22T03:53:18Z
  output: |
    test-run: dropped crm_mvj0amcaeb9s_test

- eval: E8
  run_id: minted-moi-kr-ca-cong-ty-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_duong_dan
  verified_at: 2026-10-22T03:53:18Z
  output: |
    Ran 1 test across 1 file. [1.56s]

- eval: E9
  run_id: minted-moi-kr-ca-cong-ty-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_ngan
  verified_at: 2026-10-22T03:53:18Z
  output: |
    Ran 1 test across 1 file. [1.52s]

- eval: E10
  run_id: minted-moi-kr-ca-cong-ty-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_trang
  verified_at: 2026-10-22T03:53:18Z
  output: |
    Ran 2 tests across 1 file. [1.94s]

- eval: E11
  run_id: minted-moi-kr-ca-cong-ty-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:53:18Z
  screenshot: evidence/suc-khoe-1280.png
  observed: |
    suc-khoe-1280.png: trang Mục tiêu (Quý 4 mẫu), hàng ô số đầu trang có 5 ô: Tiến độ trung bình 45%, Đơn vị đã công bố 12/13, KR đã cập nhật tuần 43/50, KR tự tin thấp 7, ô cuối "KR trượt" số 3 với chữ phụ "Bấm để xem danh sách" — nằm trong hàng ô số, khớp Expected; con trỏ/hover không thấy được trong ảnh tĩnh nhưng chữ gợi ý cho thấy bấm được. Dưới là bảng "Theo đơn vị". moi-kr-1280.png: tiêu đề "Mọi KR", một câu mô tả, hàng chip lọc tình trạng với "Trượt 3" đang chọn (viền xanh), bảng cột KR · Đơn vị · Phụ trách · Tiến độ · Tình trạng, 3 dòng, cột Tình trạng là chấm đỏ kèm chữ "Trượt", "Tổng số KR: 3". suc-khoe-375.png: ô "KR trượt 3 — Bấm để xem danh sách" nằm trong lưới ô số, không tràn ngang thấy được. moi-kr-375.png (đã mở lại bằng Read): tiêu đề + mô tả, chip "Trượt 3" chọn, nút Lọc, bảng chỉ còn cột KR · Đơn vị · Tình trạng (Phụ trách và Tiến độ ẩn), chấm đỏ kèm chữ "Trượt" còn, không tràn ngang trang (hàng chip tự cuộn ngang trong khung). Tất cả khớp Expected; không mâu thuẫn.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-moi-kr-ca-cong-ty-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:53:18Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

Lệnh đỏ không gắn eval nào: `bun run lint:slop`. Một lỗi anti-slop(no-unknown-parameters) ở `apps/app/test/moi-kr-ca-cong-ty.dom.tsx:495`, tham số `nut: unknown` của hàm `timTieuDe`. Tệp này do chính tính năng thêm vào; sửa bằng cách khai kiểu hẹp cho `nut` (hoặc phân tích ở biên) rồi chạy lại.

- cmd: bun run test -- --filter=api
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T03:53:18Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T03:53:18Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T03:53:18Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T03:53:18Z

- cmd: bunx turbo run lint --force
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T03:53:18Z

- cmd: bun run lint:slop
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_lint_slop-r2
  exit_code: 1
  verified_at: 2026-10-22T03:53:18Z

- cmd: bunx turbo run build --force
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T03:53:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Chú thích cho dòng trên: chỉ E2 và E12 đo được baseline và cả hai đều red (có phân biệt). Các eval còn lại có baseline n-a, lý do ở mục «Baseline khong do» ngay dưới; chúng không phải eval xanh-cả-hai-phía.

Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t mkc-o-truot: bo qua baseline: tep apps/app/test/moi-kr-ca-cong-ty.dom.tsx co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-nguon": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-quyen": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-loc-tinh-trang": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-loc-don-vi": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts -t mkc-loc-nguoi": bo qua baseline: tep apps/api/test/okr-moi-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t mkc-duong-dan: bo qua baseline: tep apps/app/test/moi-kr-ca-cong-ty.dom.tsx co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t mkc-ngan: bo qua baseline: tep apps/app/test/moi-kr-ca-cong-ty.dom.tsx co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t mkc-trang: bo qua baseline: tep apps/app/test/moi-kr-ca-cong-ty.dom.tsx co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- ui-check:E11: baseline n-a, máy không kèm lý do (ui-check chụp màn, không có lệnh chạy lại trên code cũ)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: S4 vòng 1 REJECT — thước AC-1, AC-2, AC-7, AC-9 thiếu đối chứng dương (theo commit 617cb770c). Returned to implementation; thước được sửa.
Round 2: E1 đến E12 đều xanh, không eval nào đỏ, `failed_evals` rỗng. Lệnh suite `bun run lint:slop` đỏ vì tham số `nut: unknown` ở `apps/app/test/moi-kr-ca-cong-ty.dom.tsx:495` (không gắn eval). Returned to implementation.

