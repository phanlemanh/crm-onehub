---
schema_version: 2
feature_slug: loi-moi-da-huy-van-cho-vao
verdict: REJECT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ffe50cd6ed620ee4b6f34c91d95820f4050ebc0a
human_signoff: 
---

# Evidence Report: loi-moi-da-huy-van-cho-vao

Verdict REJECT: mười eval máy (E1–E10) và bốn lệnh suite đều thoát mã 0 tại `verified_commit` ở trên, nhưng review đối kháng vòng này (xem `review-findings.md`, mục "Trong hợp đồng") xác nhận ba eval trong hợp đồng — E7/AC-6, E3/AC-3, E9/AC-1 — đo chỉ dẫn hoặc fixture viết tay thay vì đầu ra thật, nên không thực sự phủ ba tiêu chí đó dù mã thoát bằng 0. Round này không đạt bằng chứng đầy đủ.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-3 | test | PASS |
| E9 | AC-1 | test | PASS |
| E10 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: mu6ayxksodyy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_huy_qua_goi
  verified_at: 2026-09-18T02:00:00Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [51.00ms]
    test-run: dropped crm_mu6ayxksodyy_test

- eval: E2
  run_id: mu6ayzp4e8ph
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_tu_choi_loi_moi
  verified_at: 2026-09-18T02:00:00Z
  output: |
    1 expect() calls
    Ran 1 test across 1 file. [40.00ms]
    test-run: dropped crm_mu6ayzp4e8ph_test

- eval: E3
  run_id: mu6az07ydoek
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_gia_tri_la
  verified_at: 2026-09-18T02:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [38.00ms]
    test-run: dropped crm_mu6az07ydoek_test

- eval: E4
  run_id: mu6ayzyqswp4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_du_lieu_cu
  verified_at: 2026-09-18T02:00:00Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [42.00ms]
    test-run: dropped crm_mu6ayzyqswp4_test

- eval: E5
  run_id: minted-loi-moi-da-huy-van-cho-vao-E5-r3
  exit_code: 0
  verifier: config:executors.script.lm_tu_vung_goi
  verified_at: 2026-09-18T01:26:16Z
  carried_from_round: 3
  note: carry-forward tu round 3 — delta khong cham paths cua eval nay.

- eval: E6
  run_id: mu6ayz56yfzv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_ranh_gioi_doc
  verified_at: 2026-09-18T02:00:00Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [40.00ms]
    test-run: dropped crm_mu6ayz56yfzv_test

- eval: E7
  run_id: mu6ayy0i8y2y
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_trang_thai_that
  verified_at: 2026-09-18T02:00:00Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [194.00ms]
    test-run: dropped crm_mu6ayy0i8y2y_test

- eval: E8
  run_id: mu6ayyhki7nf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_ma_tran_trang_thai
  verified_at: 2026-09-18T02:00:00Z
  output: |
    8 expect() calls
    Ran 1 test across 1 file. [42.00ms]
    test-run: dropped crm_mu6ayyhki7nf_test

- eval: E9
  run_id: minted-loi-moi-da-huy-van-cho-vao-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_khong_sinh_thanh_vien
  verified_at: 2026-09-18T02:00:00Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [213.00ms]
    test-run: dropped crm_mu6ayyr7vf6v_test

- eval: E10
  run_id: mu6ayy3b7723
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lm_hang_co_ten
  verified_at: 2026-09-18T02:00:00Z
  output: |
    9 expect() calls
    Ran 1 test across 1 file. [43.00ms]
    test-run: dropped crm_mu6ayy3b7723_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu6ayyijfptx
  exit_code: 0
  verified_at: 2026-09-18T02:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-18T02:00:00Z

- cmd: bun run lint:slop
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-18T02:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-18T02:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này (P2, evals.yaml không đổi từ lần baseline cuối). Danh sách eval không-phân-biệt round này: rỗng — mọi eval mang `baseline: n-a` vì không đo lại, không phải vì green-on-both.

## Variance

none — không có eval nào mang `runs > 1` trong vòng này; mọi eval là deterministic (runs: 1) và đều 1/1.

## Iterations

Round 1-2: sửa các lỗ đo bị Gate 1 nêu (d-20260917T235049Z-5: dời từ vựng trạng thái sang packages/validation/src/invitation-status.ts; d-20260918T002935Z-6: đổi E8 sang đo decideSignIn, đổi E5 sang rút tập bằng nạp module thay vì regex trên văn bản nguồn) rồi nâng phạm vi theo d-20260918T012525Z-7 (thêm AC-7/E10, đổi năm chỗ ghi trạng thái huỷ từ chỉ số mảng sang hằng có tên) — ký ở commit 8c425a10.
Round 3: vá Ngoài-8 (thêm logger.warn khi phân tích trạng thái lỗi ở toAllowance, theo d-20260918T014850Z-9) tại commit f74eb7e0; E5 carried-forward không đo lại (paths không đổi), run_id/verified_at giữ nguyên từ round 3 (2026-09-18T01:26:16Z).
Round 4 (vòng này): 10 eval + 4 lệnh suite đều exit 0 tại verified_commit ffe50cd6ed620ee4b6f34c91d95820f4050ebc0a, nhưng review đối kháng (t10/t11/t13 trong review-findings.md) xác nhận ba eval trong hợp đồng (E7/AC-6, E3/AC-3, E9/AC-1) đo chỉ dẫn/fixture thay vì đầu ra thật — không giết được đột biến ở nơi AC hứa; verdict REJECT phản ánh khoảng hở đo lường đó, không phải một exit code đỏ.
