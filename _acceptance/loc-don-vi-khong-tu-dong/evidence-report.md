---
schema_version: 2
feature_slug: loc-don-vi-khong-tu-dong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cbdb55b7814e84568ea676a063f14af66064c884
human_signoff:
---

# Evidence Report: loc-don-vi-khong-tu-dong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E6m | AC-6 | script | PASS |
| E6s | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-1, AC-2, AC-3 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-loc-don-vi-khong-tu-dong-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T13:04:35Z
  output: |
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-loc-don-vi-khong-tu-dong-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T13:04:35Z
  output: |
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-loc-don-vi-khong-tu-dong-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T13:04:35Z
  output: |
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-loc-don-vi-khong-tu-dong-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T13:04:35Z
  output: |
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-loc-don-vi-khong-tu-dong-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T13:04:35Z
  output: |
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-loc-don-vi-khong-tu-dong-E6-r1
  exit_code: 0
  verifier: config:executors.test.ldv_giu
  verified_at: 2026-10-21T12:34:07Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6m
  run_id: minted-loc-don-vi-khong-tu-dong-E6m-r1
  exit_code: 0
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-21T12:34:07Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6s
  run_id: minted-loc-don-vi-khong-tu-dong-E6s-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T13:04:35Z
  output: |
    phien-do: xong — mã 0

- eval: E7
  run_id: minted-loc-don-vi-khong-tu-dong-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldv_bang
  verified_at: 2026-10-21T13:04:35Z
  output: |
    Ran 3 tests across 1 file. [687.00ms]

- eval: E8
  run_id: minted-loc-don-vi-khong-tu-dong-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T13:04:35Z
  screenshot: evidence/E8-step2.png
  observed: |
    E8-cho-1440.png (read): Muc tieu page, Phap che unit. Toolbar row (Tat ca 3, Can ban 0, Chua gop vao dau 1, Loc (1), Sap xep, Cot (4)) is bright. Loc menu is open with the Loai submenu showing Bo chon, Cam ket . 2 (checked), Tham vong . 1, Hoc tap . 0. Table below is visibly dimmed (text luminance max 142) and still shows the old 3 rows (Hop dong mua Tet..., Kinh doanh tu tra loi..., Xu ly dut diem...), counter "Tat ca 3" = stale data while waiting. Matches Expected (menu and submenu open on dimmed table, toolbar not dimmed).
    E8-xong-1440.png (read): same Loc menu and Loai submenu still open with Cam ket . 2 checked. Table now bright (luminance 237) with the new filtered 2 rows (Hop dong mua Tet..., Xu ly dut diem...), "Tat ca 2", 2 muc tieu . 3 KR; header shows Hoi Kara and the "Them muc tieu" button. Toolbar unchanged and bright. Matches Expected (same menu on a clear table, new rows).
    E8-cho-390.png (read): 390 wide mobile layout. The Loc panel (collapsible, chevron open) is open with the list Nguoi phu trach / Loai / Trang thai / Muc tu tin / Gop y cua Kara and the Loai submenu (Bo chon, Cam ket . 2 checked, Tham vong . 1, Hoc tap . 0). Chips Tat ca 3 / Can ban 0 / Chua gop vao dau 1 and the Loc button are bright; the rows underneath (Cam ket, Da cong bo, Tinh tu 2 KR 75%, Kinh doanh tu tra loi...) are dimmed (luminance 142). Matches Expected (Loc frame open on dimmed table, toolbar not dimmed).
    All three frames conform to Expected; no contradictions.
  network_observed: n-a (driver)
  output: |
    - Pixel check (independent, PIL): 1440 wait frame, table text max luminance 142 vs 237 in done frame (table dimmed while waiting, clear after); toolbar region 237 in both (not dimmed). 390 wait frame: table text max 142 (dimmed), Loc frame/menu/chips 237 (not dimmed).
    Frames saved (evidence/): E8-cho-1440.png, E8-xong-1440.png, E8-cho-390.png (script output), plus slideshow copies E8-step2.png (=cho-1440), E8-step3.png (=xong-1440), E8-step4.png (=cho-390); E8-run.log (full run log), E8-network.txt (n-a). Step 1 has no screenshot.
    Network: driver is man-loc.mjs via tien-de.mjs, no browser-tool network/console reader -> n-a (driver). Note: in the 1440 wait frame the page-header actions (Them muc tieu button) show as a skeleton, they return in the done frame; this is outside the toolbar and not part of the Expected.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-21T13:04:35Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-21T13:04:35Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-21T13:04:35Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-21T13:04:35Z

- cmd: bunx turbo run lint --force
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-21T13:04:35Z

- cmd: bun run lint:slop
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-21T13:04:35Z

- cmd: bunx turbo run build --force
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-21T13:04:35Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-tai-lai.dom.tsx -t ldv-bang: bo qua baseline: tep packages/ui/test/data-table-tai-lai.dom.tsx co o cay dang kiem nhung chua co o merge-base 1f6757ba03dd84779cf51d2755161b1e25fd4768 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — thước AC-2, AC-3, AC-4, AC-7 thiếu đối chứng dương (mẫu không thấy phần tử vẫn tính là đạt). Returned to implementation; thước và hồ sơ eval sửa ở f33105acb.
Round 2: PASS — E1-E5, E6s, E7, E8 chạy lại trên thước đã sửa; E6, E6m mang sang từ round 1 vì delta không chạm paths của chúng.

