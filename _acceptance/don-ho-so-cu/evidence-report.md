---
schema_version: 2
feature_slug: don-ho-so-cu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a2ee2fb6ba336afa9a28b3139da5b68fe7fd423e
human_signoff: Manh Phan 2026-10-22 — ký Cổng 2 trên S4 lượt 3 (9/9 eval máy PASS, 0 phát hiện trong hợp đồng). Ngoài-1 tới Ngoài-11 và Ngoài-13 tới Ngoài-17 ghi Known limits; Ngoài-12 chấp nhận, không sửa; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: don-ho-so-cu

Vòng 3. Chín eval máy chạy lại trọn vẹn và đều xanh, bảy lệnh suite xanh. Phản biện không còn phát hiện nào nằm trong hợp đồng; chín phát hiện nằm ngoài hợp đồng được ghi ở `review-findings.md` để người quyết ở Cổng Bằng chứng.

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
  run_id: minted-don-ho-so-cu-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_kiem_ke
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

- eval: E2
  run_id: minted-don-ho-so-cu-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_lo
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

- eval: E3
  run_id: minted-don-ho-so-cu-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_doi_chieu
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

- eval: E4
  run_id: minted-don-ho-so-cu-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_so_xu_ly
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

- eval: E5
  run_id: minted-don-ho-so-cu-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_sua_thuoc
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

- eval: E6
  run_id: minted-don-ho-so-cu-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_cay_ho_so
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

- eval: E7
  run_id: minted-don-ho-so-cu-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_ca_goi_ten
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

- eval: E8
  run_id: minted-don-ho-so-cu-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_lan_chu
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

- eval: E9
  run_id: minted-don-ho-so-cu-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_cong_gop
  verified_at: 2026-10-22T03:06:30Z
  output: |
    KET LUAN: xanh

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-22T03:06:30Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-22T03:06:30Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-22T03:06:30Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-22T03:06:30Z

- cmd: bunx turbo run lint --force
  run_id: minted-don-ho-so-cu-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-22T03:06:30Z

- cmd: bun run lint:slop
  run_id: minted-don-ho-so-cu-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-22T03:06:30Z

- cmd: bunx turbo run build --force
  run_id: minted-don-ho-so-cu-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-22T03:06:30Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: cả chín eval máy của vòng này đều có baseline n-a (không đo được), lý do từng lệnh ở ngay dưới. Không có mục đánh giá cần người chốt vì không có hội đồng chấm nào được đề xuất cho vòng này.

### Baseline khong do

- bun _acceptance/don-ho-so-cu/rang/kiem-ke.mjs --tu-kiem: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/kiem-ke.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/kiem-lo.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/kiem-lo.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/doi-chieu.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/doi-chieu.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/so-xu-ly.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/so-xu-ly.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/cay-ho-so.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/cay-ho-so.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/ca-goi-ten.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/ca-goi-ten.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs --lan-chu: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/cong-gop.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/cong-gop.mjs co o cay dang kiem nhung chua co o merge-base 21fe020ebe66327aa4760e744abbd5928079a909 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2 và E9 đỏ ở lượt đầu (xem run-log vòng 1). Quay lại thi công, sửa ở commit 3abd81660 (tập ghim là tập đã chạy, so trọn khối AC, đối chiếu mọi dòng sổ, cổng gộp bỏ vi phạm của hồ sơ đang chấm).
Round 2: chín eval máy và bảy lệnh suite xanh (E1, E6, E7 mang từ vòng 1 vì delta không chạm paths của chúng). Phản biện còn năm phát hiện trong hợp đồng về thước E9 và E3. Quay lại thi công.
Round 3: cả chín eval máy chạy lại trọn vẹn và bảy lệnh suite đều xanh trên commit a2ee2fb6b; phản biện không còn phát hiện trong hợp đồng, chín phát hiện ngoài hợp đồng chuyển sang người quyết. Ghi chú: mốc verified_at của vòng 3 là giờ soạn báo cáo (xấp xỉ), mốc chính xác nằm ở run-log.jsonl.
