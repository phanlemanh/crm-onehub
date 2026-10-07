---
schema_version: 2
feature_slug: okr-cua-toi-tach-theo-doi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: edc9b1253b4409cdb487d53c1b50e7d5cff36c62
human_signoff: Phan Le Manh 2026-10-07
---

# Evidence Report: okr-cua-toi-tach-theo-doi

Round 2. Bảng và khối bằng chứng thay trọn round cũ. Tám eval (E1, E7, E8, E9, E10, E11, E13, E14) mang từ round 1 vì delta không chạm paths của chúng; bảy eval chạy lại ở round này (E2, E3, E4, E5, E6, E12, E15).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-9 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-5 | ui-check | PASS |
| E12 | AC-9 | ui-check | PASS |
| E13 | AC-6 | ui-check | PASS |
| E14 | AC-5 | script | PASS |
| E15 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-okr-cua-toi-tach-theo-doi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_chia
  verified_at: 2026-10-07T10:53:25Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-okr-cua-toi-tach-theo-doi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_mine
  verified_at: 2026-10-07T11:19:01Z
  runs: 1
  output: |
    bun test okr-cua-toi-theo-doi.spec.ts -t mine-vai: 1 lan chay, 1 dat
    test-run: dropped crm_muy0m4m9ji1j_test
    __EXIT=0

- eval: E3
  run_id: minted-okr-cua-toi-tach-theo-doi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_trung_vai
  verified_at: 2026-10-07T11:19:01Z
  runs: 1
  output: |
    bun test okr-cua-toi-theo-doi.spec.ts -t trung-vai: 1 lan chay, 1 dat
    test-run: dropped crm_muy0m4nbsox3_test
    __EXIT=0

- eval: E4
  run_id: minted-okr-cua-toi-tach-theo-doi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_da_bo
  verified_at: 2026-10-07T11:19:01Z
  runs: 1
  output: |
    bun test okr-cua-toi-theo-doi.spec.ts -t da-bo: 1 lan chay, 1 dat
    test-run: dropped crm_muy0m4vvwkoi_test
    __EXIT=0

- eval: E5
  run_id: minted-okr-cua-toi-tach-theo-doi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_hien_thi
  verified_at: 2026-10-07T11:19:01Z
  runs: 1
  output: |
    bun test okr-cua-toi-theo-doi.spec.ts -t hien-thi: 1 lan chay, 1 dat
    test-run: dropped crm_muy0m56xlj68_test
    __EXIT=0

- eval: E6
  run_id: minted-okr-cua-toi-tach-theo-doi-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_bo_theo_doi
  verified_at: 2026-10-07T11:19:01Z
  runs: 1
  output: |
    bun test okr-cua-toi-theo-doi.spec.ts -t bo-theo-doi: 1 lan chay, 1 dat
    __EXIT=0

- eval: E7
  run_id: minted-okr-cua-toi-tach-theo-doi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_dom
  verified_at: 2026-10-07T10:53:25Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-okr-cua-toi-tach-theo-doi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_dom
  verified_at: 2026-10-07T10:53:25Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-okr-cua-toi-tach-theo-doi-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_dom
  verified_at: 2026-10-07T10:53:25Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-okr-cua-toi-tach-theo-doi-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctt_dom
  verified_at: 2026-10-07T10:53:25Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-okr-cua-toi-tach-theo-doi-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_man
  verified_at: 2026-10-07T10:53:25Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: E12-20261007-1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_man
  verified_at: 2026-10-07T11:19:01Z
  screenshot: evidence/E12-step1.png
  observed: |
    Frame E12-step1.png (1440, tieng Viet, nguoi U) sau khi tat theo doi M5 va dong khung bang Escape. Bang chinh co M1 «Tang khach quay lai» (kem KR1 «Cua toi») va M3 «Mo kenh doi tac moi». Nhom «Dang theo doi (1)» dang mo, chi con M7 «Chuan hoa bao gia»; M5 «Rut ngan thoi gian chot» khong con tren man. Nut nhom «Da bo (1)» dong, nam duoi nhom theo doi. Khop Expected: M5 roi man, nhom «Dang theo doi (1)».
  network_observed: n-a (driver)
  output: |
    man-theo-doi.mjs chay qua tien-de.mjs (phien do rieng kho crm_okr_cua_toi_tach_theo_doi_do, app 4787, api 4169, tu don khi xong)
    buoc 1..6 deu «dat»; man-theo-doi: dat; phien-do: xong — mã 0
    buoc 3: M5 roi man sau khi tat, dau window.__cttDau con nguyen (khong tai lai trang), nut nhom «Đang theo dõi (1)»
    buoc 4: theo doi lai M5 → nhom «Đang theo dõi (2)» co M5

- eval: E13
  run_id: minted-okr-cua-toi-tach-theo-doi-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_man
  verified_at: 2026-10-07T10:53:25Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: design-gate-7e479c8939
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_san_thiet_ke
  verified_at: 2026-10-07T10:53:25Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-okr-cua-toi-tach-theo-doi-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_dot_bien
  verified_at: 2026-10-07T11:19:01Z
  runs: 1
  output: |
    node _acceptance/okr-cua-toi-tach-theo-doi/rang/dot-bien.mjs: 1 lan chay, 1 dat
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-07T11:19:01Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-07T11:19:01Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-07T11:19:01Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-07T11:19:01Z

- cmd: bunx turbo run lint --force
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-07T11:19:01Z

- cmd: bun run lint:slop
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-07T11:19:01Z

- cmd: bunx turbo run build --force
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-07T11:19:01Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Khong co eval khong-phan-biet. Cac lenh suite xanh o ca hai phia la regression-guard binh thuong.

## Variance

none — khong eval nao chay nhieu lan; moi eval deterministic va deu thong nhat.

## Iterations

Round 1: lenh suite bun run test --filter=api do, cong them mot phat hien muc trung binh (E2/E3/E4 chi kiem id co mat thay vi so ca tap id va «dung mot lan»). Tra ve implementation; commit 0715bbd2b so tron tap id va cho test so-gop doc ca dangTheoDoi.
Round 2: PASS — E2, E3, E4, E5, E6, E12, E15 va bay lenh suite chay lai tren cay edc9b1253b44 deu xanh; E1, E7, E8, E9, E10, E11, E13, E14 mang tu round 1 (frame goc cua E11 va E13 xem evidence round 1). Khong co muc judgment, khong co panel judge.
