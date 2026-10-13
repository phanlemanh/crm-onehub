---
schema_version: 2
feature_slug: chep-viec-can-lam-cu
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b6d4c661fcfca3b4ec1e5fbd7e1bfecf58976437
human_signoff:
---

# Evidence Report: chep-viec-can-lam-cu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | ui-check | PASS |
| E12 | AC-12 | judgment | PASS |
| E13 | AC-1 | script | PASS |
| E14 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: mv6xi5g1hk9b
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_chep
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi5g1hk9b_test

- eval: E2
  run_id: mv6xi6su87xo
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_chep_lai
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi6su87xo_test

- eval: E3
  run_id: mv6xi6x7l7gy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_nguoi_tao
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi6x7l7gy_test

- eval: E4
  run_id: mv6xi63313hu
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_dao
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi63313hu_test

- eval: E5
  run_id: minted-chep-viec-can-lam-cu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_dong_thoi_gian
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi5o48yd1_test

- eval: E5b
  run_id: minted-chep-viec-can-lam-cu-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_man_dong_thoi_gian
  verified_at: 2026-10-13T16:59:03Z
  output: |
    Ran 3 tests across 1 file. [878.00ms]

- eval: E6
  run_id: minted-chep-viec-can-lam-cu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_api
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi5zcc8gh_test

- eval: E7
  run_id: mv6xi66j9154
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_tac_nhan
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi66j9154_test

- eval: E8
  run_id: mv6xi678gq4k
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_ma_lech
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi678gq4k_test

- eval: E9
  run_id: minted-chep-viec-can-lam-cu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_hien
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi6ojvj6d_test

- eval: E9b
  run_id: mv6xi6bydhra
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_nhac
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi6bydhra_test

- eval: E10
  run_id: mv6xi63yj2nu
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_lenh
  verified_at: 2026-10-13T16:59:03Z
  output: |
    test-run: dropped crm_mv6xi63yj2nu_test

- eval: E11
  run_id: minted-chep-viec-can-lam-cu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvc_man
  verified_at: 2026-10-13T16:59:03Z
  screenshot: evidence/E11-step1.png
  observed: |
    Frame 1280 (cvc-thoa-thuan-1280.png, copy E11-step1.png): bảng Thoả thuận phía sau, khung bên phải mở "Thoả thuận An Phát k6xiydg" ở thẻ Hoạt động. Các thẻ là Tổng quan, Cá nhân, Hoạt động, Kara; trong thẻ Hoạt động không có chữ «Sắp tới» hay «Đã xong». Dưới ô soạn có chip lọc Tất cả, Ghi chú, Email, Cuộc họp. Khối «Việc» ở đầu thẻ có một dòng "Gửi hồ sơ năng lực k6xiydg", "Chưa làm", hạn "11 thg 10, 2026", "Tôi" (việc cũ quá hạn đã chép). Không thấy checkbox nào trong dòng thời gian; phần còn lại là trạng thái rỗng "Chưa có gì xả...". Khớp Expected. Frame 375 (cvc-thoa-thuan-375.png, copy E11-step2.png): khung thoả thuận dạng sheet toàn chiều ngang, thẻ Hoạt động, khối «Việc» có số đếm 1 và cùng dòng "Gửi hồ sơ năng lực k6xiydg", "Chưa làm", "11 thg 10, 2026", "Tôi". Không có chữ «Sắp tới» hay «Đã xong», không có checkbox, không thấy cuộn ngang. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Chiều đo (--chieu-do) không chạy vì không thuộc steps.
    Mạng: driver là script tien-de/man.mjs, không có công cụ đọc network nên không có E11-network.txt, ghi n-a (driver).
    capture.ui trong config.yaml là "bun run ui:capture", nhưng ảnh do chính rang man.mjs chụp theo steps.

- eval: E12
  judged_by: judge panel (3 lens, fresh context) — đề xuất PASS
  verdict: PASS
  rationale: Ba lens đều bỏ phiếu PASS, không có ý kiến trái. Panel là đề xuất; người quyết ở Cổng 2 (human_override để trống).
  votes:
    - domain-correctness: PASS — Bốn tài liệu nêu đủ sáu điều. (1) CONTEXT.md dòng 167-169 và docs/api.md dòng 549-555 nói việc cũ đã chép thành Việc, bản gốc còn để đảo, việc chưa chép chỉ đọc. (2) docs/production.md dòng 276-301 có đếm, chạy thử, chạy thật, đếm lại, cờ ALLOW_REMOTE_DB, `--nguoi` là email quản trị, và `--dao` kèm `--ca-ban-da-doi` cho bản đã đổi. (3) Dòng 294-295 có vế một (số bản chép sau bằng số việc cũ trước) và vế hai (`--tu`, `taskTaoSau` bằng 0). (4) docs/api.md dòng 549-551 nói `activities.create` trả 400 với TASK, còn `activities.complete` và `activities.myTasks` đã bỏ. (5) docs/agent.md dòng 77-81 và 1085-1091 nói việc giao cho người khởi chạy và người cầm trịch. (6) docs/production.md dòng 282 và 298-300 nói thứ tự lên và thứ tự lùi, kèm lý do. Các từ như «người cầm trịch» và «Tác nhân» đã có trong CONTEXT.md, nên không thấy từ ghép tự đúc.
    - operational-feasibility: PASS — Bốn tài liệu đủ sáu điều. (1) CONTEXT.md dòng 167-169 và docs/api.md dòng 549-555 nói việc cũ đã chép thành Việc, bản gốc còn để đảo, việc chưa chép chỉ đọc. (2) và (3) docs/production.md dòng 276-301 có đủ đếm, chạy thử, chạy thật, đếm lại, cờ ALLOW_REMOTE_DB, `--nguoi <email quản trị>`, hai vế ngưỡng với `--tu`, và đảo kể cả `--ca-ban-da-doi`. (4) api.md dòng 549-551. (5) docs/agent.md dòng 77-81 và 1085-1091. (6) production.md dòng 282-285 (thứ tự lên) và 298-301 (đảo trước khi lùi mã, nêu lý do hiện hai lần và giao trùng). Chỗ yếu nhỏ: «người chạy phải là quản trị» chỉ được nói qua tham số `--nguoi`, không thành một câu riêng. Các cụm như «bản chép» và «mã môi giới lệch» là chữ thường, không phải thuật ngữ tự đúc.
    - spec-alignment: PASS — Bốn tài liệu nói đủ sáu điều. CONTEXT.md mục «Việc» và docs/api.md mục «Việc» (dòng 549-558) nói về việc đã chép, bản gốc để đảo, việc chưa chép chỉ đọc, và `activities.create` trả 400 với TASK còn `complete` và `myTasks` đã bỏ. docs/production.md mục «Chép việc cần làm cũ» có đủ: đếm, chạy thử, chạy thật, đếm lại, `ALLOW_REMOTE_DB`, email quản trị, hai vế ngưỡng (`--tu`, `taskTaoSau` bằng 0), `--dao` kèm `--ca-ban-da-doi`, thứ tự lên và «chạy `--dao` TRƯỚC» khi lùi mã. docs/agent.md (dòng 77-81 và 1085-1091) nói Tác nhân giao Việc cho người khởi chạy và việc mã môi giới lệch giao cho người cầm trịch. Các từ dùng như «vết» và «bản chép» đã có sẵn trong CONTEXT.md hoặc là tiếng Việt thường, không thấy từ ghép tự đúc.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

- eval: E13
  run_id: minted-chep-viec-can-lam-cu-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvc_dot_bien
  verified_at: 2026-10-13T16:59:03Z
  output: |
    dot-bien: 11/11 cap dat

- eval: E14
  run_id: minted-chep-viec-can-lam-cu-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvc_quet_task
  verified_at: 2026-10-13T16:59:03Z
  output: |
    quet-task: 15 tep · doc 7 · khai 6 · so-quyen 7 · nhan 4

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T16:59:03Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T16:59:03Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T16:59:03Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T16:59:03Z

- cmd: bunx turbo run lint --force
  run_id: minted-chep-viec-can-lam-cu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T16:59:03Z

- cmd: bun run lint:slop
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T16:59:03Z

- cmd: bunx turbo run build --force
  run_id: minted-chep-viec-can-lam-cu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T16:59:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều đỏ trên baseline (có phân biệt): không eval nào xanh trên cả HEAD lẫn baseline. Mọi eval feature mang baseline n-a, lý do ở mục dưới.

Baseline khong do
- bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts -t cvc-chep-du": bo qua baseline: tep packages/db/test/viec-chep.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts -t cvc-chep-lai": bo qua baseline: tep packages/db/test/viec-chep.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts -t cvc-nguoi-tao": bo qua baseline: tep packages/db/test/viec-chep.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts -t cvc-dao": bo qua baseline: tep packages/db/test/viec-chep.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/viec-can-lam-cu.spec.ts -t cvc-dong-thoi-gian": bo qua baseline: tep apps/api/test/viec-can-lam-cu.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/dong-thoi-gian-viec-cu.dom.tsx: bo qua baseline: tep apps/app/test/dong-thoi-gian-viec-cu.dom.tsx co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-can-lam-cu.spec.ts -t cvc-api": bo qua baseline: tep apps/api/test/viec-can-lam-cu.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/tac-nhan-giao-viec.integration.spec.ts -t cvc-tac-nhan": bo qua baseline: tep apps/agent/test/tac-nhan-giao-viec.integration.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/ma-lech-viec.integration.spec.ts": bo qua baseline: tep apps/agent/test/ma-lech-viec.integration.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-can-lam-cu.spec.ts -t cvc-hien": bo qua baseline: tep apps/api/test/viec-can-lam-cu.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tac-nhan-giao-viec.integration.spec.ts -t cvc-nhac": bo qua baseline: tep apps/agent/test/tac-nhan-giao-viec.integration.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-chep-lenh.spec.ts": bo qua baseline: tep packages/db/test/viec-chep-lenh.spec.ts co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chep-viec-can-lam-cu/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/chep-viec-can-lam-cu/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs: bo qua baseline: tep _acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh, E12 (judgment) còn chờ người ký override ở Cổng 2 nên verdict là PENDING-JUDGMENT.
