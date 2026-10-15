---
schema_version: 2
feature_slug: khung-soan-chan-lien-ket
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 89f715335fd04ef92bb1aae25eb153fba5246fcf
human_signoff:
---

# Evidence Report: khung-soan-chan-lien-ket

Round 2. Chín eval của hợp đồng đều đạt; verdict tổng là REJECT vì một lệnh suite không gắn eval nào (`bunx turbo run lint --force`) thoát khác 0 — chi tiết ở «Lệnh suite (hồi quy)» và section Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-1 | script | PASS |
| E9 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-soan-chan-lien-ket-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_soan
  verified_at: 2026-10-15T15:11:08Z
  output: |
    Ran 3 tests across 1 file. [2.62s]

- eval: E2
  run_id: minted-khung-soan-chan-lien-ket-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_go_do
  verified_at: 2026-10-15T15:11:08Z
  output: |
    Ran 5 tests across 1 file. [2.26s]

- eval: E3
  run_id: minted-khung-soan-chan-lien-ket-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_roi
  verified_at: 2026-10-15T15:11:08Z
  output: |
    Ran 6 tests across 1 file. [1100.00ms]

- eval: E4
  run_id: minted-khung-soan-chan-lien-ket-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_khong_do
  verified_at: 2026-10-15T15:11:08Z
  output: |
    Ran 3 tests across 1 file. [767.00ms]

- eval: E5
  run_id: minted-khung-soan-chan-lien-ket-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_khong_chan
  verified_at: 2026-10-15T15:11:08Z
  output: |
    Ran 10 tests across 1 file. [1343.00ms]

- eval: E6
  run_id: minted-khung-soan-chan-lien-ket-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcl_hoi_quy
  verified_at: 2026-10-15T15:11:08Z
  output: |
    Ran 12 tests across 1 file. [1166.00ms]

- eval: E7
  run_id: E7-kcl-man-20261015-2233
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcl_man
  verified_at: 2026-10-15T15:11:08Z
  screenshot: evidence/E7-step1.png
  observed: |
    Đã mở bằng Read cả 4 ảnh. (1) kcl-dang-soan-1280: lớp phủ xám đồng nhất, hộp trắng bo góc giữa màn «Kara đang soạn. Đóng khung?», mô tả đọc trọn 2 dòng, hai nút «Ở lại» (outline) và «Đóng» (đỏ) đủ, không tràn; góc dưới trái có badge dev «2 Issues» của Next (hydration sẵn có). (2) kcl-go-do-1280: hộp «Bỏ những gì vừa nhập?» với «Tiếp tục sửa» và «Bỏ», đọc trọn. (3) kcl-dang-soan-375: hộp rộng gần hết bề ngang (lề ~16px), chữ đọc trọn, hai nút xếp dọc «Đóng» trên «Ở lại» dưới, không tràn ngang. (4) kcl-go-do-375: «Bỏ» trên, «Tiếp tục sửa» dưới, không tràn. Khớp Expected: hộp hiện giữa màn, chữ đọc trọn, hai nút đủ, không tràn ở 375. Hạn chế: lớp phủ che kín nên không thấy khung phía sau trong ảnh; nhật ký khai khung:true và hộp:'' sau dòng, nhất quán với lớp phủ che khung.
  network_observed: n-a (driver)
  output: |
    Frame đã lưu (ảnh chụp bởi man.mjs, sao sang E7-stepN): E7-step1.png = kcl-dang-soan-1280.png; E7-step2.png = kcl-go-do-1280.png; E7-step3.png = kcl-dang-soan-375.png; E7-step4.png = kcl-go-do-375.png (cùng thư mục evidence/). Ảnh bước (c) không có vì man.mjs không chụp.
    Lưu ý: man.mjs tự ghi đè kcl-dang-soan-1280.png và kcl-go-do-375.png (tệp đã theo dõi); không sửa tay, không chạy lệnh git ghi.

- eval: E8
  run_id: minted-khung-soan-chan-lien-ket-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcl_dot_bien
  verified_at: 2026-10-15T15:11:08Z
  output: |
    kcl dot-bien: 5/5 cắn

- eval: E9
  run_id: minted-khung-soan-chan-lien-ket-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcl_man_luot
  verified_at: 2026-10-15T15:11:08Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T15:11:08Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-15T15:11:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T15:11:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T15:11:08Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 1
  verified_at: 2026-10-15T15:11:08Z
  output: |
    @crm/ui:lint: test/giu-thay-doi-lien-ket.dom.tsx format
    @crm/ui:lint:   × Formatter would have printed the following content:
    @crm/ui:lint:     390     │ - → → );→ → await·act(async·()·=>·{
    @crm/ui:lint:         390 │ + → → );
    @crm/ui:lint:         391 │ + → → await·act(async·()·=>·{
    @crm/ui:lint: error: script "lint" exited with code 1
    Tasks:    7 successful, 11 total
    Failed:    @crm/ui#lint

- cmd: bun run lint:slop
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T15:11:08Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-15T15:11:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Ghi chú trung thực: hai eval có baseline đo được (E6, E9) đều red trên code cũ. Các eval còn lại không đo baseline (xem dưới).

Baseline khong do
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx -t kcl-soan: bo qua baseline: tep apps/app/test/khung-soan-chan-lien-ket.dom.tsx co o cay dang kiem nhung chua co o merge-base 8f819cf6a44c194bad2962a4aa904c75b8e1767a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx -t kcl-go-do: bo qua baseline: tep apps/app/test/khung-soan-chan-lien-ket.dom.tsx co o cay dang kiem nhung chua co o merge-base 8f819cf6a44c194bad2962a4aa904c75b8e1767a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx -t kcl-roi && cd ../.. && cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/giu-thay-doi-lien-ket.dom.tsx -t '^kcl-hop ': bo qua baseline: tep apps/app/test/khung-soan-chan-lien-ket.dom.tsx co o cay dang kiem nhung chua co o merge-base 8f819cf6a44c194bad2962a4aa904c75b8e1767a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx -t kcl-khong-do && cd ../.. && cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/giu-thay-doi-lien-ket.dom.tsx -t kcl-hop-sach: bo qua baseline: tep apps/app/test/khung-soan-chan-lien-ket.dom.tsx co o cay dang kiem nhung chua co o merge-base 8f819cf6a44c194bad2962a4aa904c75b8e1767a — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/giu-thay-doi-lien-ket.dom.tsx -t kcl-khong-chan: bo qua baseline: tep packages/ui/test/giu-thay-doi-lien-ket.dom.tsx co o cay dang kiem nhung chua co o merge-base 8f819cf6a44c194bad2962a4aa904c75b8e1767a — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-soan-chan-lien-ket/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/khung-soan-chan-lien-ket/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 8f819cf6a44c194bad2962a4aa904c75b8e1767a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, xác định)

## Iterations

Round 1: E7 đỏ ở vòng đầu (REJECT); trả về cho bước cài đặt.
Round 2: chín eval E1–E9 đạt, nhưng lệnh suite `bunx turbo run lint --force` đỏ ở `@crm/ui#lint`: dòng log «Formatter would have printed the following content» cho `test/giu-thay-doi-lien-ket.dom.tsx` (quanh dòng 390, `);` và `await act(async () => {` đang nằm chung một dòng), kèm dòng «Failed:    @crm/ui#lint». Đầu ra lint bị cắt đuôi nên chỉ thấy các chẩn đoán này; nguyên nhân đỏ là lỗi định dạng của tệp kiểm. Trả về cho bước cài đặt để chạy lại formatter. Verdict REJECT.
