---
schema_version: 2
feature_slug: tro-ly-kho-dung-phien
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0390964ebc963e448e49cdb08ab9855cd87644f0
human_signoff:
---

# Evidence Report: tro-ly-kho-dung-phien

Verdict REJECT. Bảy eval E1 đến E7 đều xanh, nhưng lệnh suite `bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db` đỏ và không gắn eval nào (chi tiết ở mục "Lệnh suite (hồi quy)"). Ngoài ra review có một finding trong hợp đồng, AC-3, mức high (xem `review-findings.md`).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-kho-dung-phien-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4b_gui
  verified_at: 2026-10-04T16:34:26Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-gui"
    test-run: dropped crm_muu1k5hfwwnf_test

- eval: E2
  run_id: muu1k8gseh36
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4b_loi_dan
  verified_at: 2026-10-04T16:34:26Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-loi-dan"
    test-run: dropped crm_muu1k8gseh36_test

- eval: E3
  run_id: minted-tro-ly-kho-dung-phien-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4b_zdr
  verified_at: 2026-10-04T16:34:26Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-zdr"
    test-run: dropped crm_muu1k7bsim3t_test

- eval: E4
  run_id: minted-tro-ly-kho-dung-phien-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4b_cam_goi
  verified_at: 2026-10-04T16:34:26Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-cam-goi"
    (không có dòng kết quả nào ngoài mã thoát của lệnh)

- eval: E5
  run_id: minted-tro-ly-kho-dung-phien-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4b_tu_choi
  verified_at: 2026-10-04T16:34:26Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-tu-choi"
    test-run: dropped crm_muu1k80tn3my_test

- eval: E6
  run_id: muu1k764nanw
  exit_code: 0
  baseline: green
  verifier: config:executors.test.l4b_hoi_cu
  verified_at: 2026-10-04T16:34:26Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-nop.spec.ts && TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-kho-zalo.integration.spec.ts"
    test-run: dropped crm_muu1k764nanw_test

- eval: E7
  run_id: minted-tro-ly-kho-dung-phien-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4b_dem
  verified_at: 2026-10-04T16:34:26Z
  output: |
    cmd: bun run test -- "bun test _acceptance/tro-ly-kho-dung-phien/rang/dem-sai-phien.spec.ts"
    test-run: dropped crm_muu1k8ziabf4_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-04T16:34:26Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-04T16:34:26Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 1
  verified_at: 2026-10-04T16:34:26Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T16:34:26Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T16:34:26Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T16:34:26Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-04T16:34:26Z

Lệnh suite đỏ không gắn eval nào: `bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db` (mã thoát 1). Gói agent chạy 1035 ca trong 112 tệp: 1034 qua, 1 ca đỏ, đó là `okr-chuyen-tiep > nhánh okr trả câu cố định, không gọi phần mở đầu nghiên cứu; nghiên cứu vẫn gọi`. Các tác vụ còn lại của lệnh này xanh (3 trên 4 tác vụ thành công). Máy không gán ca đỏ này cho eval nào, nên `failed_evals` để rỗng. Người cần xác định ca này đỏ do thay đổi của tính năng hay đỏ sẵn trên nhánh nền trước khi quyết.

## Known limits

## Ngoài hợp đồng

## Analyst

E6 (cmd: `bun run test -- "cd apps/agent && bun test test/tro-ly-kho-nop.spec.ts && TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-kho-zalo.integration.spec.ts"`): baseline green. Eval xanh cả trên HEAD lần trên diffBase, nên nó chứng minh bộ kiểm cũ vẫn chạy chứ không chứng minh tính năng mới. Đây là regression-guard có chủ ý của AC-6 (hỏi kho cũ và Zalo không hỏng), nên không cần viết lại; ghi ra để người đọc không nhầm E6 là bằng chứng cho hành vi mới.

## Variance

none — mọi eval nhiều lần chạy đều đồng đều (cả bảy eval chạy 1 lần, không có eval ngẫu nhiên)

## Iterations

Round 1: E1 đến E7 xanh, nhưng lệnh suite gói agent đỏ 1 ca (okr-chuyen-tiep) và review có 1 finding trong hợp đồng AC-3 mức high (model ZDR của phiên gốc kho bị eve bỏ khi trả từ session.started). Trả về implementation.
