---
schema_version: 2
feature_slug: okr-to-chuc-va
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: eabda4540b513e081c1796dccfaaeac9255a9fd2
human_signoff:
---

# Evidence Report: okr-to-chuc-va

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | ui-check | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-8 | ui-check | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-9 | ui-check | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-11 | test | PASS |
| E17 | AC-8 | script | PASS |
| E18 | AC-1 | ui-check | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-12 | ui-check | PASS |
| E21 | AC-13 | test | PASS |
| E22 | AC-14 | test | PASS |
| E23 | AC-14 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-okr-to-chuc-va-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_thu_gon
  verified_at: 2026-10-04T21:01:16Z
  output: |
    Ran 1 test across 1 file. [1199.00ms]

- eval: E2
  run_id: minted-okr-to-chuc-va-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_so_kr_dom
  verified_at: 2026-10-04T21:01:16Z
  output: |
    Ran 1 test across 1 file. [1001.00ms]

- eval: E3
  run_id: r1d-man-okr-e3-20261004
  exit_code: 0
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T14:10:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-okr-to-chuc-va-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_mau_vet
  verified_at: 2026-10-04T21:01:16Z
  output: |
    okr-to-chuc-va-mau.spec.ts chay qua bun run test (CSDL rieng), xong, CSDL rieng da drop.

- eval: E5
  run_id: minted-okr-to-chuc-va-E5-r1
  exit_code: 0
  verifier: config:executors.test.r1d_ly_do_api
  verified_at: 2026-10-04T14:10:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-okr-to-chuc-va-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_ly_do_dom
  verified_at: 2026-10-04T21:01:16Z
  output: |
    Ran 1 test across 1 file. [1.56s]

- eval: E7
  run_id: minted-okr-to-chuc-va-E7-r1
  exit_code: 0
  verifier: config:executors.test.r1d_khoi_phuc
  verified_at: 2026-10-04T14:10:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-okr-to-chuc-va-E8-r1
  exit_code: 0
  verifier: config:executors.test.r1d_trung_ten
  verified_at: 2026-10-04T14:10:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-okr-to-chuc-va-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_quyen_tao
  verified_at: 2026-10-04T21:01:16Z
  output: |
    okr-to-chuc-va-quyen.spec.ts chay qua bun run test (CSDL rieng), xong khong bai do; cung lan chay phu E21 va E22.

- eval: E10
  run_id: minted-okr-to-chuc-va-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_nut_them
  verified_at: 2026-10-04T21:01:16Z
  output: |
    Ran 2 tests across 1 file. [1452.00ms]

- eval: E11
  run_id: phien-do okr-to-chuc-va (kho crm_okr_to_chuc_va_do, app :4857, api :4457)
  exit_code: 0
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T21:01:16Z
  baseline: n-a
  screenshot: evidence/E11-them-muc-tieu.png
  observed: |
    Khung 1440x1000, giao dien sang: record sheet cua muc tieu vua tao, tieu de "Mục tiêu lẻ R1d muubghdp", dong phu "Kinh doanh miền Bắc · Năm kế · mẫu", nhan Cam ket va Nhap, tien do 0%, bang KR rong kem nut "Thêm KR".
    Goc duoi trai co toast xanh "Đã tạo mục tiêu"; danh sach phia sau bi lop phu che nen khong thay hang, nhung dong in cua script xac nhan hien=1 luu=1 api=1. Khong mau thuan voi Expected.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-okr-to-chuc-va-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_neo_kara
  verified_at: 2026-10-04T21:01:16Z
  output: |
    Ran 2 tests across 1 file. [1301.00ms]

- eval: E13
  run_id: e13-okr-to-chuc-va-20261005
  exit_code: 0
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T21:01:16Z
  baseline: n-a
  screenshot: evidence/E13-kara-chuot.png
  observed: |
    Khung 390x844, muc tieu da cuon xuong: thanh tab KR 3 / Can chinh 1 / Vet / Trao doi 1 / Dien bien o khoang y=205, vung Kara ("Kara · 3 gop y cho", "Vi sao?") bat dau khoang y=230, sat dinh vung cuon, ke do la cac the goi y va bang KR.
    Khung E13-kara-enter.png cung bo cuc, chi khac vien focus xanh quanh khung do phim Enter. Khop Expected: dinh vung Kara trong tam nhin va scrollTop lon hon 0.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-okr-to-chuc-va-E14-r1
  exit_code: 0
  verifier: config:executors.test.ccq_cong_nghien_cuu
  verified_at: 2026-10-04T14:10:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-okr-to-chuc-va-E15-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.suite_app_ui
  verified_at: 2026-10-04T21:01:16Z
  output: |
    bun run test --filter=app --filter=@crm/ui xong, CSDL rieng da drop.

- eval: E16
  run_id: minted-okr-to-chuc-va-E16-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.suite_api
  verified_at: 2026-10-04T21:01:16Z
  output: |
    bun run test --filter=api xong, CSDL rieng da drop.

- eval: E17
  run_id: design-gate-batch
  exit_code: 0
  baseline: green
  verifier: config:executors.script.r1d_san_thiet_ke
  verified_at: 2026-10-04T21:01:16Z
  output: |
    design-gate --mode static chay het lo 9 tep giao dien, khong tep nao bi chan.

- eval: E18
  run_id: phien-do crm_okr_to_chuc_va_do, app :4365, api :4277, mot-luot.sh log /tmp/r1a-E18.log
  exit_code: 0
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T21:01:16Z
  baseline: n-a
  screenshot: evidence/E18-thu-gon-loc.png
  observed: |
    Khung 1440x1000, sang: trang "OKR theo don vi", phong ban Kinh doanh mien Bac, bo loc nguoi phu trach da bo. Muc tieu A "Giu da tang truong ban le mien Bac" o trang thai thu gon (chevron huong phai), khong hien hang KR nao; muc tieu B cung thu gon.
    Khung E18-thu-gon-doi-don-vi.png: sau khi doi sang phong ban khac roi chon lai, A van thu gon, B dang mo hien KR1. Khop Expected: A thu gon sau khi bi khuat roi hien lai.
  network_observed: n-a (driver)

- eval: E19
  run_id: minted-okr-to-chuc-va-E19-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_khoi_phuc_dom
  verified_at: 2026-10-04T21:01:16Z
  output: |
    okr-to-chuc-va.dom.tsx -t khoi-phuc-toast chay xong, khong bai do.

- eval: E20
  run_id: e20-20261004-r1a
  exit_code: 0
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T14:10:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E21
  run_id: minted-okr-to-chuc-va-E21-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_quyen_tao
  verified_at: 2026-10-04T21:01:16Z
  output: |
    okr-to-chuc-va-quyen.spec.ts chay qua bun run test, cung lan chay voi E9 va E22.

- eval: E22
  run_id: minted-okr-to-chuc-va-E22-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_quyen_tao
  verified_at: 2026-10-04T21:01:16Z
  output: |
    okr-to-chuc-va-quyen.spec.ts chay qua bun run test, cung lan chay voi E9 va E21.

- eval: E23
  run_id: minted-okr-to-chuc-va-E23-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_kr_quan_tri
  verified_at: 2026-10-04T21:01:16Z
  output: |
    Ran 1 test across 1 file. [1391.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-okr-to-chuc-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-04T21:01:16Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-okr-to-chuc-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-04T21:01:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-okr-to-chuc-va-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-04T21:01:16Z

- cmd: bun run lint:slop
  run_id: minted-okr-to-chuc-va-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-04T21:01:16Z

- cmd: bunx turbo run build --force
  run_id: minted-okr-to-chuc-va-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-04T21:01:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval khong phan biet (xanh tren ca HEAD lan baseline, chung minh harness chu khong phai feature; can viet lai de assert hanh vi moi, hoac xac nhan la regression-guard co chu y):

- E15 — bo kiem app + packages/ui (regression-guard co chu y, cung lenh voi suite_keys)
- E16 — bo kiem api (regression-guard co chu y, cung lenh voi suite_keys)
- E17 — design-gate static tren cac tep giao dien vong nay cham (chieu do la cua chinh design-gate)

## Variance

none — moi eval chay mot lan, khong co eval ngau nhien.

## Iterations

Round 1: 25 eval xanh nhung review ra loi ngoai hop dong (them KR tren muc tieu da bo, taoTuMau cua quan tri, khoa cot hop KR cua quan tri). Hop dong mo rong them AC-13, AC-14 va cac eval E21, E22, E23.
Round 2: chay lai cac eval cham paths da doi (E1, E2, E4, E6, E9, E10, E11, E12, E13, E15, E16, E17, E18, E19, E21, E22, E23) va bo suite; E3, E5, E7, E8, E14, E20 carry-forward tu round 1. Tat ca xanh, verdict PASS.