---
schema_version: 2
feature_slug: don-ho-so-cu
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3abd816606ad3b0cced1b722628cd029a07ea7a8
human_signoff:
---

# Evidence Report: don-ho-so-cu

Vòng 2. Chín eval máy đều xanh (sáu eval chạy lại, ba eval mang từ vòng 1), bảy lệnh suite xanh. Phán quyết là REJECT vì bước phản biện còn năm phát hiện nằm trong hợp đồng (AC-3 và AC-9), xem `review-findings.md` mục «Trong hợp đồng».

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-don-ho-so-cu-E1-r1
  exit_code: 0
  verifier: config:executors.script.dhc_kiem_ke
  verified_at: 2026-10-21T23:53:49Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-don-ho-so-cu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_lo
  verified_at: 2026-10-22T00:36:21Z
  output: |
    KET LUAN: xanh

- eval: E3
  run_id: minted-don-ho-so-cu-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_doi_chieu
  verified_at: 2026-10-22T00:36:21Z
  output: |
    KET LUAN: xanh

- eval: E4
  run_id: minted-don-ho-so-cu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_so_xu_ly
  verified_at: 2026-10-22T00:36:21Z
  output: |
    KET LUAN: xanh

- eval: E5
  run_id: minted-don-ho-so-cu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_sua_thuoc
  verified_at: 2026-10-22T00:36:21Z
  output: |
    KET LUAN: xanh

- eval: E6
  run_id: minted-don-ho-so-cu-E6-r1
  exit_code: 0
  verifier: config:executors.script.dhc_cay_ho_so
  verified_at: 2026-10-21T23:53:49Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-don-ho-so-cu-E7-r1
  exit_code: 0
  verifier: config:executors.script.dhc_ca_goi_ten
  verified_at: 2026-10-21T23:53:49Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-don-ho-so-cu-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_lan_chu
  verified_at: 2026-10-22T00:36:21Z
  output: |
    KET LUAN: xanh

- eval: E9
  run_id: minted-don-ho-so-cu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_cong_gop
  verified_at: 2026-10-22T00:36:21Z
  output: |
    KET LUAN: xanh

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T00:36:21Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T00:36:21Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T00:36:21Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T00:36:21Z

- cmd: bunx turbo run lint --force
  run_id: minted-don-ho-so-cu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T00:36:21Z

- cmd: bun run lint:slop
  run_id: minted-don-ho-so-cu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T00:36:21Z

- cmd: bunx turbo run build --force
  run_id: minted-don-ho-so-cu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T00:36:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: sáu eval chạy lại ở vòng này đều có baseline n-a, danh sách lý do ở ngay dưới. Ba eval mang từ vòng 1 không có số đo baseline ở vòng này.

### Baseline khong do

- bun _acceptance/don-ho-so-cu/rang/kiem-lo.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/kiem-lo.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/doi-chieu.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/doi-chieu.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/so-xu-ly.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/so-xu-ly.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs --lan-chu: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/cong-gop.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/cong-gop.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2 và E9 đỏ ở lượt đầu (xem run-log vòng 1). Quay lại thi công, sửa ở commit 3abd81660 (tập ghim là tập đã chạy, so trọn khối AC, đối chiếu mọi dòng sổ, cổng gộp bỏ vi phạm của hồ sơ đang chấm).
Round 2: chín eval máy và bảy lệnh suite xanh (E1, E6, E7 mang từ vòng 1 vì delta không chạm paths của chúng). Phản biện còn năm phát hiện trong hợp đồng: bốn ở AC-9 và AC-3 về thước E9 và E3 đo thiếu quan hệ đã hứa. Quay lại thi công. Ghi chú: mốc verified_at của sáu eval và bảy suite vòng 2 là giờ soạn báo cáo (xấp xỉ), mốc chính xác nằm ở run-log.jsonl.
