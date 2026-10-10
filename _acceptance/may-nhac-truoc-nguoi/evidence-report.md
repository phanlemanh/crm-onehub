---
schema_version: 2
feature_slug: may-nhac-truoc-nguoi
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b3945503b3e68a2b34b7b99e17a39b90142fc9dd
human_signoff: Phan Le Manh 2026-09-22
---

# Evidence Report: may-nhac-truoc-nguoi

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
| E9 | AC-9 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | ui-check | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: muco1v4r0hqw
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_dung_nguoi
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     6 expect() calls
    Ran 6 tests across 1 file. [340.00ms]
    test-run: dropped crm_muco1v4r0hqw_test

- eval: E2
  run_id: minted-may-nhac-truoc-nguoi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_bien_nguong
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     13 expect() calls
    Ran 6 tests across 1 file. [318.00ms]
    test-run: dropped crm_muco1vqfd28u_test

- eval: E3
  run_id: muco1ul656tu
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_nua_dem
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    Ran 2 tests across 1 file. [319.00ms]
    test-run: dropped crm_muco1ul656tu_test

- eval: E4
  run_id: muco1v9k404k
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_quet_mot_lan
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     6 expect() calls
    Ran 2 tests across 1 file. [531.00ms]
    test-run: dropped crm_muco1v9k404k_test

- eval: E5
  run_id: muco1uovlf8z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_gui_slack
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
       7 expect() calls
      Ran 7 tests across 1 file. [713.00ms]
      test-run: dropped crm_muco1uovlf8z_test

- eval: E6
  run_id: muco1w39t1fs
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_khong_kenh
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     4 expect() calls
    Ran 4 tests across 1 file. [411.00ms]
    test-run: dropped crm_muco1w39t1fs_test

- eval: E7
  run_id: muco1vb3llgk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_theo_doi
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     5 expect() calls
    Ran 2 tests across 1 file. [539.00ms]
    test-run: dropped crm_muco1vb3llgk_test

- eval: E8
  run_id: muco1ujx1fkx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_tong_quan
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     3 expect() calls
    Ran 3 tests across 1 file. [405.00ms]
    test-run: dropped crm_muco1ujx1fkx_test

- eval: E9
  run_id: minted-may-nhac-truoc-nguoi-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_the_tasks
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     6 expect() calls
    Ran 6 tests across 1 file. [592.00ms]

- eval: E10
  run_id: muco1xa22nqv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_payload
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     3 expect() calls
    Ran 2 tests across 1 file. [304.00ms]
    test-run: dropped crm_muco1xa22nqv_test

- eval: E11
  run_id: minted-may-nhac-truoc-nguoi-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_nut_theo_doi
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 4 tests across 1 file. [684.00ms]

- eval: E12
  run_id: muco28gaa1wa
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_duong_do
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     3 expect() calls
    Ran 3 tests across 1 file. [396.00ms]
    test-run: dropped crm_muco28gaa1wa_test

- eval: E13
  run_id: minted-may-nhac-truoc-nguoi-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T09:00:00+07:00
  screenshot: evidence/E13-tong-quan-1440.png
  observed: |
    E13-tong-quan-1440.png (1440x1450): the tasks card ("Overdue tasks") shows two "Quiet plan · <company>" rows, due-column carries a red square indicator + "quiet 8 days", same row/column shape as the overdue step row "E13 Buoc qua han cua toi" (also red square + date) — same red tone confirmed side by side. A "Day checkpoint · <company>" row shows "1/3 steps done" / "day 14/30" with a neutral (non-red) indicator, as intended for milestone (not quiet). No horizontal cut visible.
    E13-theo-doi-1440.png (1440x1000): plan sheet "Viet Phat Group" header shows "Watching · 1" button immediately left of the "..." menu button and the close (X) button, top-right of the header row. No horizontal cut.
    E13-tong-quan-375.png (375x2250, width matches viewport exactly): same two "Quiet plan" rows and one "Day checkpoint" row visible, company names ellipsis-truncated ("E13 Cong Ty Cam Tri…", "E13 Cong Ty Ca…") — genuine CSS truncation, not raw edge clipping; page content stays within the 375px frame throughout, no horizontal scrollbar/cut.
    E13-theo-doi-375.png (375x1400, width matches viewport exactly): sheet header collapses the follow button to an eye icon + "1" (matches the documented design decision for <sm breakpoints), sitting next to the "..." menu and close button, fully inside the 375px frame — no horizontal cut.
  network_observed: n-a (driver)

- eval: E14
  run_id: design-gate-6691dd6cd6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_san_thiet_ke
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
      "hits": [],
      "findings": []
    }

- eval: E15
  run_id: muco1v0j39oi
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_payload_theo_doi
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [339.00ms]
    test-run: dropped crm_muco1v0j39oi_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muco1tspseu4
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-may-nhac-truoc-nguoi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-may-nhac-truoc-nguoi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-may-nhac-truoc-nguoi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Không có eval non-discriminating (danh sách rỗng, kế thừa nguyên trạng từ round 1; baseline không đo lại ở round này nên không có phép so sánh mới).

## Variance

none — không có eval nào mang field runs > 1 ở round này; không eval nào variance hay flaky.

## Iterations

Round 1: PASS — hợp đồng verified, evidence xanh sạch (S4 vòng 1).
Round 2: Cổng Bằng chứng trả lại đầu vòng 2 — E5 (so tập daGui với dòng thật) và E12 (đánh dấu xong bằng setStepDone thật) sửa lại để đo đúng hành vi thật thay vì giả lập; toàn bộ eval xanh trở lại, suite/lint/build xanh, verdict PASS.

### Re-pin lần 1 — 2026-09-22, do gộp onehub (#80) và sửa bản giả E27 trước PR lượt 3
run_id: repin-20260922T132144Z-13202
sha: a22b9eb1cfcb3dfdd762dac4cb2d2d0e3a86b471 · suites: 4 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E13

### Re-pin lần 2 — 2026-10-10, do E6 dieu-phoi-va them quaHan vao du lieu gia cua ba bai DOM (P3-81) va gop onehub
run_id: repin-20261010T083254Z-33269
sha: 34ffea77b4165083c59a91377f8600f5bfbd6356 · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E13 · diff chạm vật đo ngoài làn máy: E13 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-10, do gop onehub 23f52546 cho PR 360 (E6 dieu-phoi-va)
run_id: repin-20261010T130910Z-37166
sha: 708249126b044a702ebb1d9ee2ded8001780da9f · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E13 · diff chạm vật đo ngoài làn máy: E13 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 4 — 2026-10-10, do gop onehub d5078b8e (K3c cham okr-gop-y.ts) cho PR 360
run_id: repin-20261010T134228Z-56891
sha: 6a097f48c6375365e03375be816aca43768c769c · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 5 — 2026-10-10, do gop onehub 5042d0ce (LT1b cham detail-sheet.tsx) cho PR 360
run_id: repin-20261010T140306Z-53419
sha: b3945503b3e68a2b34b7b99e17a39b90142fc9dd · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
