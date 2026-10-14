---
schema_version: 2
feature_slug: hoan-tac-loat-dung-id
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3a168035d7165917e1bd71697c65cf6f5abe1866
human_signoff: Phan Le Manh 2026-10-10 — ký Cổng Bằng chứng trên vòng chấm 2 (9/9 eval đạt, 7/7 lệnh suite xanh, 0 phát hiện trong hợp đồng; vòng 1 REJECT chỉ vì bom giờ H5 ở suite agent). Bảy mục ngoài hợp đồng Ngoài-1 đến Ngoài-7 ghi Known limits (luật 53). Phạm vi cắt/hoãn đồng ý như đã khai; các quyết định ghi sau Cổng Phạm vi (Treo-1 đến Treo-6) được phê toàn bộ.
---

# Evidence Report: hoan-tac-loat-dung-id

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | ui-check | PASS |
| E9 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-hoan-tac-loat-dung-id-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htl_may_chu_luu_tru
  verified_at: 2026-10-10T04:27:47Z
  output: |
    lệnh: bun run test -- "cd apps/api && bun test test/hoan-tac-loat-dung-id.spec.ts -t htl-luu-tru"
    test-run: dropped crm_mv1w8n2u05zz_test

- eval: E2
  run_id: minted-hoan-tac-loat-dung-id-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htl_may_chu_hoan_tac
  verified_at: 2026-10-10T04:27:47Z
  output: |
    lệnh: bun run test -- "cd apps/api && bun test test/hoan-tac-loat-dung-id.spec.ts -t htl-hoan-tac"
    test-run: dropped crm_mv1w8nqr6zew_test

- eval: E3
  run_id: minted-hoan-tac-loat-dung-id-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htl_hoan_tac_dung_id
  verified_at: 2026-10-10T04:27:47Z
  output: |
    lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/hoan-tac-loat-dung-id.dom.tsx -t htl-hoan-tac-dung-id
    Ran 1 test across 1 file. [1032.00ms]

- eval: E4
  run_id: minted-hoan-tac-loat-dung-id-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htl_hoan_tac_thieu
  verified_at: 2026-10-10T04:27:47Z
  output: |
    lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/hoan-tac-loat-dung-id.dom.tsx -t htl-hoan-tac-thieu
    Ran 1 test across 1 file. [1.78s]

- eval: E5
  run_id: minted-hoan-tac-loat-dung-id-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htl_luu_tru_bo_qua
  verified_at: 2026-10-10T04:27:47Z
  output: |
    lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/hoan-tac-loat-dung-id.dom.tsx -t htl-luu-tru-bo-qua
    Ran 1 test across 1 file. [1.87s]

- eval: E6
  run_id: minted-hoan-tac-loat-dung-id-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htl_en
  verified_at: 2026-10-10T04:27:47Z
  output: |
    lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/hoan-tac-loat-dung-id.dom.tsx -t htl-en
    Ran 1 test across 1 file. [1309.00ms]

- eval: E7
  run_id: minted-hoan-tac-loat-dung-id-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htl_cap_chu
  verified_at: 2026-10-10T04:27:47Z
  output: |
    lệnh: cd apps/app && bun test test/messages-guard.spec.ts
    Ran 134 tests across 1 file. [1456.00ms]

- eval: E9
  run_id: minted-hoan-tac-loat-dung-id-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_hoan_tac_loat
  verified_at: 2026-10-10T04:27:47Z
  output: |
    lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-hoan-tac-loat
    Ran 1 test across 1 file. [1.89s]

- eval: E8
  run_id: minted-hoan-tac-loat-dung-id-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htl_man
  verified_at: 2026-10-10T04:27:47Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png (1440x900, dark theme, route Cá nhân with the search box filled "k1w8vz0"): the table is empty, showing "Không có kết quả nào khớp bộ lọc". The bottom-left toast reads "Đã lưu trữ 2 cá nhân. 1 bản bị bỏ qua — đã lưu trữ từ trước hoặc không còn." with a "Hoàn tác" button inside the viewport. No raw English ("No ", "with id") appears. This matches Expected: 2 archived, 1 skipped, 0 rows with the code. E8-step2.png (same page, after clicking Hoàn tác): the toast reads "Đã khôi phục 2 cá nhân." and the table has exactly 2 rows, "Bình Hoàn tác đún…" and "An Hoàn tác đúng …". The third copy (Châu, archived by someone else) is absent. This matches Expected: exactly 2 rows come back and the other person's copy stays hidden. The db checks (archivedAt null for the two restored copies, the old date still on the third) were asserted by man.mjs, which passed.
  network_observed: n-a (driver)
  output: |
    lệnh: ui-check:E8 (tien-de.mjs --chay của eval)
    Frames: E8-step1.png, E8-step2.png, htl-luu-tru-bo-qua-1440.png, htl-hoan-tac-1440.png.
    CHIEU DO (--chieu-do) không chạy vì các bước không đòi.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hoan-tac-loat-dung-id-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-10T04:27:47Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hoan-tac-loat-dung-id-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-10T04:27:47Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hoan-tac-loat-dung-id-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-10T04:27:47Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hoan-tac-loat-dung-id-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-10T04:27:47Z

- cmd: bunx turbo run lint --force
  run_id: minted-hoan-tac-loat-dung-id-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-10T04:27:47Z

- cmd: bun run lint:slop
  run_id: minted-hoan-tac-loat-dung-id-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-10T04:27:47Z

- cmd: bunx turbo run build --force
  run_id: minted-hoan-tac-loat-dung-id-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-10T04:27:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Không có eval nào được liệt kê là không-phân-biệt. Mọi eval của round này ghi baseline là n-a vì baseline không đo lại; lệnh suite xanh cả hai phía là regression-guard bình thường.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không có phương sai).

## Iterations

Round 1: lịch sử round 1 nằm ở run-log.jsonl của hồ sơ, không nhắc lại ở đây.
Round 2: cả 9 eval (E1-E9) và 7 lệnh suite đều xanh; verdict PASS.

### Re-pin lần 1 — 2026-10-14, do gộp onehub sau chữ ký V2f
run_id: repin-20261014T041924Z-68871
sha: 3a168035d7165917e1bd71697c65cf6f5abe1866 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E8 · diff chạm vật đo ngoài làn máy: E8 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-6 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
