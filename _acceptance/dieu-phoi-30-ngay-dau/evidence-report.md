---
schema_version: 2
feature_slug: dieu-phoi-30-ngay-dau
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 25e86932760a6e3268b25adab683834e550268a0
human_signoff: 
---

# Evidence Report: dieu-phoi-30-ngay-dau

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
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | ui-check | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: muav112ia7r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_chep_khong_tham_chieu
  verified_at: 2026-09-21T10:00:00Z
  output: |
     6 expect() calls
    Ran 2 tests across 1 file. [169.00ms]
    test-run: dropped crm_muav112ia7r1_test

- eval: E2
  run_id: muav119m9e4z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_buoc_chua_giao_van_co_bo_phan
  verified_at: 2026-09-21T10:00:00Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [172.00ms]
    test-run: dropped crm_muav119m9e4z_test

- eval: E3
  run_id: muav115n95y8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_danh_muc_loc_va_ngay_im
  verified_at: 2026-09-21T10:00:00Z
  output: |
     7 expect() calls
    Ran 1 test across 1 file. [203.00ms]
    test-run: dropped crm_muav115n95y8_test

- eval: E4
  run_id: muav1230x9yq
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_bac_la_moc_ngay
  verified_at: 2026-09-21T10:00:00Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [129.00ms]
    test-run: dropped crm_muav1230x9yq_test

- eval: E5
  run_id: muav10nb8gjo
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_lo_sai_tu_choi_tron
  verified_at: 2026-09-21T10:00:00Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [210.00ms]
    test-run: dropped crm_muav10nb8gjo_test

- eval: E6
  run_id: muav122e8f3j
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_khong_khop_viet_agenttask
  verified_at: 2026-09-21T10:00:00Z
  output: |
     20 expect() calls

    All tests for "khong-khop-agenttask" passed successfully.

- eval: E7
  run_id: minted-dieu-phoi-30-ngay-dau-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_thieu_khoa_tra_503
  verified_at: 2026-09-21T10:00:00Z
  output: |
     3 expect() calls
    Ran 2 tests across 1 file. [195.00ms]
    test-run: dropped crm_muav10cza47m_test

- eval: E8
  run_id: muav12dnckv4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_doi_ten_bo_phan_khong_mat
  verified_at: 2026-09-21T10:00:00Z
  output: |
     8 expect() calls
    Ran 2 tests across 1 file. [162.00ms]
    test-run: dropped crm_muav12dnckv4_test

- eval: E9
  run_id: muav1175m2b9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_trang_thai_chua_co_khuon
  verified_at: 2026-09-21T10:00:00Z
  output: |
     8 expect() calls
    Ran 2 tests across 1 file. [187.00ms]
    test-run: dropped crm_muav1175m2b9_test

- eval: E10
  run_id: minted-dieu-phoi-30-ngay-dau-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dp30_hang_so_o_config
  verified_at: 2026-09-21T10:00:00Z
  output: |
    hang-so-o-config: sach — 7 tep quet, 0 ghim ngoai cau hinh, cau hinh co nguoi dung

- eval: E11
  run_id: verifier-E11-danh-muc-recheck-2026-09-21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-21T10:00:00Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/zen-brattain-ac74d0/_acceptance/dieu-phoi-30-ngay-dau/evidence/E11-danh-muc.png
  observed: |
    evidence/E11-danh-muc.png (1440x900, read directly via the Read tool as an image): table header "Partner | Stuck on | Silent | Steps | Day | Department". Two data rows. Row 1 (freshly seeded this round): Partner "Cong Ty TNHH Giai Phap Cong Nghe Va Dich Vu Khach Hang Lien Minh Phuong Nam E11R2", Stuck on "Xac nhan hop dong va gui bo tai lieu khoi dong cho doi tac moi" wrapped onto two lines in full, no ellipsis, Silent "—", Steps "0/1", Day "25/30", Department "Phong Van Hanh va Cham Soc Khach Hang Doanh Nghiep" wrapped in full. Row 2 (pre-existing plan, same template): Partner "Cong ty E11 Kiem Chung", same Stuck-on/Department text wrapped in full, Day "20/30". No column is truncated, no "…" anywhere on the page (confirmed programmatically: document.body.innerText contains neither "…" nor "..."). evidence/E11-danh-muc-768.png (768x1024, read directly): same two rows, table fits inside the 768px frame with margin on both sides — no column pushed past the right edge. Department text now wraps to three lines but is fully visible, not cut off mid-word and no ellipsis. Confirmed programmatically in the live browser tab at 768x1024: document.body.scrollWidth (768) === document.documentElement.scrollWidth (768) === window.innerWidth (768) → no horizontal overflow, contradicting the prior round's failing measurement (scrollWidth 830 vs clientWidth 662). This matches Expected 1-3 exactly: seeded row present, stuck-tier/day text readable with no truncation/ellipsis, and no horizontal overflow at 768. Fix commit c2211d93 (whitespace-normal break-words instead of truncate, badge dropped for a wrapped span) verified to resolve both defects that were the previous round's failure.
  network_observed: clean
  output: |
    Network truth: read_network_requests + read_console_messages dumped raw to evidence/E11-network.txt. No requests to the API origin (127.0.0.1:3301) appear client-side (danh-muc data is fetched server-side/SSR, confirmed working via the API read-back). All ~494 app-origin (127.0.0.1:3300) requests eventually resolved 200; a repeating transient 403-then-200 pattern on identical /_next/static/chunks/*.js (Turbopack dev chunk-map race under repeated same-tab reloads) is documented in evidence/E11-network.txt and classified as static build-artifact noise, not a data-path failure.
    Known limitation carried from contract.md (pre-existing, not introduced this round): the API has no mutation to backdate an OnboardingStep's updatedAt directly, so "Silent" renders "—" rather than a positive day count — already accepted and does not affect the three Expected checks this eval measures.
    E11 PASS this round — the two defects from the prior failing round (ellipsis-truncated "Stuck on", horizontal overflow at 768) are both resolved by commit c2211d93.

- eval: E12
  run_id: minted-dieu-phoi-30-ngay-dau-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_xoa_co_xac_nhan
  verified_at: 2026-09-21T10:00:00Z
  output: |
     0 fail
     9 expect() calls
    Ran 4 tests across 1 file. [390.00ms]

- eval: E13
  run_id: muav1ebeuser
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_dong_ke_hoach_con_buoc_do
  verified_at: 2026-09-21T10:00:00Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [169.00ms]
    test-run: dropped crm_muav1ebeuser_test

- eval: E14
  run_id: muav1e3csjqc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_ke_hoach_co_nguoi_cam_trich
  verified_at: 2026-09-21T10:00:00Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [163.00ms]
    test-run: dropped crm_muav1e3csjqc_test

- eval: E15
  run_id: minted-dieu-phoi-30-ngay-dau-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_bo_loc_nam_trong_duong_dan
  verified_at: 2026-09-21T10:00:00Z
  output: |
     0 fail
     10 expect() calls
    Ran 5 tests across 1 file. [7.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-21T10:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-21T10:00:00Z

- cmd: bun run lint:slop
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-21T10:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-21T10:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — round nay khong do lai baseline (P2, evals.yaml khong doi tu lan baseline cuoi), nen khong co du lieu de xac dinh eval non-discriminating.

## Variance

none — khong eval nao trong round nay co runs > 1 (khong eval nao ngau nhien/di qua ctx.providers.invoke).

## Iterations

Round 1: luot D (chore 7e9decfc) dung o BLOCKED vi E6 va E11 chua dat. Fix c2211d93 (danh-muc: whitespace-normal/break-words thay truncate, bo badge cho span xuong dong) giai quyet E11 (chu doc duoc het, khong con tran ngang o 768px); rerun toan bo 15 eval + 4 lenh suite (test/lint/lint:slop/build) tren commit 25e86932 -> tat ca dat, chot PASS.
