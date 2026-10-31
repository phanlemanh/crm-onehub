---
schema_version: 2
feature_slug: rang-hang-cong-cu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bf04d0ae37b68fff0cc26de4aeb0d75efc015632
human_signoff:
---

# Evidence Report: rang-hang-cong-cu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-7 | test | PASS |

## Evidence

- eval: E9
  run_id: minted-rang-hang-cong-cu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.suite_app_ui
  verified_at: 2026-10-31T14:42:02Z
  output: |
    bun run test -- --filter=app --filter=@crm/ui hoàn tất, thoát sạch.
    Đầu ra có dòng "hcc: <n> tep · <m> dau hieu da khai" khớp số tệp E1 in.

- eval: E1
  run_id: minted-rang-hang-cong-cu-E1-r1
  exit_code: 0
  verifier: config:executors.test.hcc_quet
  verified_at: 2026-10-31T14:12:53Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-rang-hang-cong-cu-E2-r1
  exit_code: 0
  verifier: config:executors.test.hcc_quet
  verified_at: 2026-10-31T14:12:53Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-rang-hang-cong-cu-E3-r1
  exit_code: 0
  verifier: config:executors.test.hcc_quet
  verified_at: 2026-10-31T14:12:53Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-rang-hang-cong-cu-E4-r1
  exit_code: 0
  verifier: config:executors.test.hcc_quet
  verified_at: 2026-10-31T14:12:53Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-rang-hang-cong-cu-E5-r1
  exit_code: 0
  verifier: config:executors.test.hcc_quet
  verified_at: 2026-10-31T14:12:53Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-rang-hang-cong-cu-E6-r1
  exit_code: 0
  verifier: config:executors.test.hcc_quet
  verified_at: 2026-10-31T14:12:53Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-rang-hang-cong-cu-E7-r1
  exit_code: 0
  verifier: config:executors.test.hcc_quet
  verified_at: 2026-10-31T14:12:53Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-rang-hang-cong-cu-E8-r1
  exit_code: 0
  verifier: config:executors.test.hcc_quet
  verified_at: 2026-10-31T14:12:53Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-rang-hang-cong-cu-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-31T14:42:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-rang-hang-cong-cu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-31T14:42:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-rang-hang-cong-cu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-31T14:42:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-rang-hang-cong-cu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-31T14:42:02Z

- cmd: bun run lint:slop
  run_id: minted-rang-hang-cong-cu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-31T14:42:02Z

- cmd: bunx turbo run build --force
  run_id: minted-rang-hang-cong-cu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-31T14:42:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- bun run test -- --filter=app --filter=@crm/ui: baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt S4 1 bị REJECT do suite agent chập chờn ngoài vật (không phải lỗi của tính năng). Returned to implementation.
Round 2: E9 chạy lại và xanh; E1–E8 carry-forward từ round 1 (delta không chạm paths của eval); sáu lệnh suite xanh. Verdict PASS.

## Số đo cho kit (luật 36 của đợt ban-do-khuon-3010)

- Số tệp đi theo khuôn: 534 tệp giao diện được soát, chỉ 10 tệp mang dấu hiệu (đã khai trong bảng).
- Số lần răng bắt: 7 lệch thật (lọc tình trạng KR, phạm vi Tổng quan ×2, thẻ dòng thời gian, Lộ trình ×2, Họp tuần, nhóm Đã bỏ, dự án Đã đóng — 9 chỗ ở 7 tệp), khai vào bảng loại `no` kèm đích sửa.
- Số lệch lọt: 0 đã biết; điểm mù có tên ở Hỏi-2 (chip ở tệp này, tệp khác đặt vào thẻ) và Hỏi-3 (nhóm gập chứa danh sách).
- PR gộp: chưa (PR nháp).

### Re-pin lần 1 — 2026-10-31, do gộp onehub 202f791a7 (#603 landing, #610 bom giờ) làm bằng chứng cũ
run_id: repin-20261031T233523Z-44019
sha: bf04d0ae37b68fff0cc26de4aeb0d75efc015632 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
