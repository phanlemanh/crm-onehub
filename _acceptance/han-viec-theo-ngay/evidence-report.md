---
schema_version: 2
feature_slug: han-viec-theo-ngay
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 34ffea77b4165083c59a91377f8600f5bfbd6356
human_signoff: Phan Le Manh 2026-09-22
---

# Evidence Report: han-viec-theo-ngay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: mucreru7i1iy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hv_qua_han_ngay
  verified_at: 2026-09-22T14:32:00+07:00
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [359.00ms]
    test-run: dropped crm_mucreru7i1iy_test

- eval: E2
  run_id: mucrer5rx0rc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hv_bien_nua_dem
  verified_at: 2026-09-22T14:32:00+07:00
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [325.00ms]
    test-run: dropped crm_mucrer5rx0rc_test

- eval: E3
  run_id: mucreqohkm6a
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hv_ca_doi
  verified_at: 2026-09-22T14:32:00+07:00
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [351.00ms]
    test-run: dropped crm_mucreqohkm6a_test

- eval: E4
  run_id: mucrerfrb3n2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hv_viec_cua_toi
  verified_at: 2026-09-22T14:32:00+07:00
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [355.00ms]
    test-run: dropped crm_mucrerfrb3n2_test

- eval: E5
  run_id: mucrernmsmkj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hv_buoc_cua_toi
  verified_at: 2026-09-22T14:32:00+07:00
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [324.00ms]
    test-run: dropped crm_mucrernmsmkj_test

- eval: E6
  run_id: minted-han-viec-theo-ngay-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hv_dong_thoi_gian
  verified_at: 2026-09-22T14:32:00+07:00
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [399.00ms]

- eval: E7
  run_id: minted-han-viec-theo-ngay-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hv_the_ca_doi
  verified_at: 2026-09-22T14:32:00+07:00
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [431.00ms]

- eval: E8
  run_id: mucresozpbe2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hv_payload
  verified_at: 2026-09-22T14:32:00+07:00
  output: |
    Ran 1 test across 1 file. [288.00ms]
    test-run: dropped crm_mucresozpbe2_test

- eval: E9
  run_id: minted-han-viec-theo-ngay-E9-r1
  exit_code: 0
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T14:32:00+07:00
  screenshot: _acceptance/han-viec-theo-ngay/evidence/E9-ca-doi-1440.png
  observed: |
    E9-ca-doi-1440.png (read via Read tool, full image): "Overdue tasks" ("Việc quá hạn") card visible with 2 rows on top: (1) "E9 — theo dõi hợp đồng quá hạn (người 1)" / secondary line "manh.phan · Attio" / "Jan 1"; (2) "E9 — theo dõi hợp đồng quá hạn (người 2)" / secondary line "Nguyễn Thị Bích Ngọc Kim Ngân Bảo Trâm · Cal.com" / "Jan 2" — creator name fully spelled out, not truncated. Below, in the unrelated "Recent activity" table, "E9 — việc hạn hôm nay" appears (Company "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ", Who "manh.phan", "5m ago") — it is NOT a row in the Overdue-tasks card, only in the separate activity feed.

    E9-ca-doi-375.png (read via Read tool + a sips crop zoomed on the two E9 rows): same "Overdue tasks" card, narrow layout. Row 1 subject truncated with "…" (task subject line only) but secondary line "manh.phan · Attio" shows in full. Row 2 subject also truncated, secondary line shows "Nguyễn Thị Bích Ngọc Kim Ngân Bảo Trâm ·" — the full 38-character creator name renders with no ellipsis/clipping (only the trailing "Cal.com" wraps out of the fixed-height row, which is not part of AC-8's claim). "E9 — việc hạn hôm nay" again only appears in "Recent activity" below, absent from the Overdue-tasks card.

    E9-khuon.txt (read via Read tool): records scrollWidth=1440/clientWidth=1440 at the 1440 breakpoint and scrollWidth=375/clientWidth=375 at 375 — scrollWidth <= clientWidth holds at both (no horizontal overflow).

    All three Expected lines are visible on the saved frames, not inferred: (1) creator name on the secondary line for every overdue task, long name fully shown at 375 — CONFIRMED; (2) today-due task absent from the Overdue-tasks card — CONFIRMED; (3) E9-khuon.txt scrollWidth<=clientWidth both widths — CONFIRMED.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mucreqnvf2vb
  exit_code: 0
  verified_at: 2026-09-22T14:32:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-han-viec-theo-ngay-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-22T14:32:00+07:00

- cmd: bun run lint:slop
  run_id: minted-han-viec-theo-ngay-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-22T14:32:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-han-viec-theo-ngay-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-22T14:32:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E9 pass (9/9, exit 0 tất cả); bốn lệnh suite (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) đều xanh. Không có eval nào đỏ, không cần lặp lại.

### Re-pin lần 1 — 2026-10-10, do E6 dieu-phoi-va them quaHan vao du lieu gia cua ba bai DOM (P3-81) va gop onehub
run_id: repin-20261010T083254Z-33269
sha: 34ffea77b4165083c59a91377f8600f5bfbd6356 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E9 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-8 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
