---
schema_version: 2
feature_slug: gon-dau-trang-lay-y-kien
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 410db96a0478c1304db77b6df9fceff5e847568a
human_signoff:
---

# Evidence Report: gon-dau-trang-lay-y-kien

Vòng 1. Toàn bộ chín eval của hợp đồng (E1..E9) đạt; verdict REJECT vì một lệnh suite hồi quy không gắn eval nào, `bun run lint:slop`, đỏ với hai lỗi anti-slop (chi tiết ở mục Iterations).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-gon-dau-trang-lay-y-kien-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdl_man
  verified_at: 2026-10-21T04:22:25Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs"
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-gon-dau-trang-lay-y-kien-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdl_man
  verified_at: 2026-10-21T04:22:25Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs"
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-gon-dau-trang-lay-y-kien-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdl_man
  verified_at: 2026-10-21T04:22:25Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs"
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-gon-dau-trang-lay-y-kien-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdl_gui_sai
  verified_at: 2026-10-21T04:22:25Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/gon-dau-trang-lay-y-kien.dom.tsx -t gdl-gui-sai
    Ran 3 tests across 1 file. [758.00ms]

- eval: E4b
  run_id: minted-gon-dau-trang-lay-y-kien-E4b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdl_man
  verified_at: 2026-10-21T04:22:25Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs"
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-gon-dau-trang-lay-y-kien-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdl_man
  verified_at: 2026-10-21T04:22:25Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs"
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-gon-dau-trang-lay-y-kien-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdl_man
  verified_at: 2026-10-21T04:22:25Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs"
    phien-do: xong — mã 0

- eval: E7
  run_id: s4-r1-e7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdl_man
  verified_at: 2026-10-21T04:22:25Z
  screenshot: evidence/E7-step1.png
  observed: |
    Bốn khung (390 sáng, 390 tối, cuộn sáng, cuộn tối): hàng «còn góp được 3 ý · Gửi» bám đáy màn, nền đặc cùng màu nền trang (sáng 250, tối đen) khác thẻ phía trên, có viền trên rõ; không có chữ của ô nhập lọt qua hàng.
    Nút «Gửi» xanh thương hiệu #006B4F, chữ trắng, nằm trọn bên phải (x 317-355, y 753-782 ở khung chưa cuộn), không bị cắt ở cả sáng và tối, cả khi chưa cuộn lẫn đã cuộn. Khớp expected.
  network_observed: n-a (driver)
  output: |
    KET LUAN gdl: 16 DUNG, 0 SAI
    phien-do: xong — mã 0
    Khung đã lưu: E7-step1.png (gdl-390-sang), E7-step2.png (gdl-390-toi), E7-step3.png (gdl-390-cuon-sang), E7-step4.png (gdl-390-cuon-toi)

- eval: E8
  run_id: minted-gon-dau-trang-lay-y-kien-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-10-21T04:22:25Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dot-hoi-y-tuong-okr/rang/man-hoi-y.mjs"
    phien-do: xong — mã 0

- eval: E9
  run_id: minted-gon-dau-trang-lay-y-kien-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdl_khong_doi_hinh
  verified_at: 2026-10-21T04:22:25Z
  output: |
    bun _acceptance/gon-dau-trang-lay-y-kien/rang/khong-doi-hinh.mjs
    KET LUAN khong-doi-hinh: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-gon-dau-trang-lay-y-kien-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T04:22:25Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-gon-dau-trang-lay-y-kien-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T04:22:25Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-gon-dau-trang-lay-y-kien-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T04:22:25Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-gon-dau-trang-lay-y-kien-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T04:22:25Z

- cmd: bunx turbo run lint --force
  run_id: minted-gon-dau-trang-lay-y-kien-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T04:22:25Z

- cmd: bun run lint:slop
  run_id: minted-gon-dau-trang-lay-y-kien-SUITE-bun_run_lint_slop-r1
  exit_code: 1
  verified_at: 2026-10-21T04:22:25Z

- cmd: bunx turbo run build --force
  run_id: minted-gon-dau-trang-lay-y-kien-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T04:22:25Z

Lệnh suite đỏ không gắn eval nào: `bun run lint:slop`, hai lỗi anti-slop, hết ba mươi tám lệnh khác trong suite xanh. Hai lỗi nguyên văn từ đầu ra: `anti-slop(no-object-parameters): Parameter chon accepts the broad object type` tại apps/app/test/gon-dau-trang-lay-y-kien.dom.tsx:33:30, và `anti-slop(no-runtime-typeof)` tại _acceptance/gon-dau-trang-lay-y-kien/rang/khong-doi-hinh.mjs:57:8.

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline không đo:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/gon-dau-trang-lay-y-kien.dom.tsx -t gdl-gui-sai: bo qua baseline: tep apps/app/test/gon-dau-trang-lay-y-kien.dom.tsx co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/gon-dau-trang-lay-y-kien/rang/khong-doi-hinh.mjs: bo qua baseline: tep _acceptance/gon-dau-trang-lay-y-kien/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi

E7 (ui-check) cũng mang baseline n-a: ảnh chụp không có lượt chạy trên cây cũ.

## Variance

none — mọi eval nhiều lượt đều đồng nhất (mọi eval chạy một lượt, xác định)

## Iterations

Round 1: chín eval của hợp đồng đạt cả; lệnh suite `bun run lint:slop` đỏ với hai lỗi anti-slop không gắn eval (no-object-parameters ở apps/app/test/gon-dau-trang-lay-y-kien.dom.tsx:33, no-runtime-typeof ở _acceptance/gon-dau-trang-lay-y-kien/rang/khong-doi-hinh.mjs:57). Trả về triển khai để sửa hai lỗi lint.
