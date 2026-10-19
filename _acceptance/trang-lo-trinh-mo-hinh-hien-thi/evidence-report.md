---
schema_version: 2
feature_slug: trang-lo-trinh-mo-hinh-hien-thi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e96ab66de1b77433d00fcbaac73eb7648e902c79
human_signoff: Manh Phan 2026-10-19
---

# Evidence Report: trang-lo-trinh-mo-hinh-hien-thi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_viec_moc
  verified_at: 2026-10-19T15:15:32Z
  output: |
    Ran 1 test across 1 file. [1102.00ms]

- eval: E2
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_moc_hien
  verified_at: 2026-10-19T14:06:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_chua_hen
  verified_at: 2026-10-19T14:06:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_ten
  verified_at: 2026-10-19T14:06:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_doi_chieu
  verified_at: 2026-10-19T14:06:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltmh_khoi_cu
  verified_at: 2026-10-19T15:15:32Z
  output: |
    Ran 2 tests across 1 file. [1234.00ms]

- eval: E7
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltmh_do_man
  verified_at: 2026-10-19T14:06:39Z
  carried_from_round: 1
  screenshot: evidence/E7-step1.png
  observed: |
    Da mo bang Read ca 8 anh (anh toan trang 12000px cao hien thi rat nho nen cat vung dau/cuoi bang PIL de doc chu; da xem day du cac vung: 1280-vi-toi dau + cuoi, 1280-en-sang dau, 375-vi-sang dau + cuoi, 375-en-toi dau; 4 anh con lai kiem o dang toan trang va khop ket qua do). Thay: trang Lo trinh o kieu xem Moc, loc Tat ca 194, dong thoi gian doc voi tung moc: ngay ben trai, ten moc, ten lo trinh (Kho tai lieu / OKR) ngay duoi, ROI MOI toi dong so rieng duoi ten lo trinh ("da giao du 1 viec", "da giao du 8 viec", "con 6/6 viec" o nen toi vi; "All 1 delivered", "All 8 delivered" o ban en), roi moi toi danh sach ten viec day du (co dong rot hai dong, khong bi cat ba cham), moi viec co chip trang thai (Da giao / Chua bat dau / Khac; Shipped o ban en).
    Moc giao du ("da giao du N viec") va moc con viec ("con 6/6 viec", kem dong 'Du kien xong 30 thg 10, 2026' + ghi chu uoc tinh) deu co mat. Nen toi (1280-vi-toi): chu sang tren nen den, dong so doc ro, khong chu nao chong len nhau; o 375 chu xuong dong gon, chip trang thai nam sat phai trong khung, khong tran ngang. Nhom chua hen moc o cuoi trang mo ra liet ten viec day du (hang tram dong, nhieu viec dai xuong hai dong, khong cat), chan trang "194 viec · 145/194 da giao trong pham vi loc" khop tong 194. Khong thay chong chu, khong thay tran ngang o 375. Noi dung khop Expected; khong mau thuan voi ket luan 8 DUNG / 0 SAI.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-19T15:15:32Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-19T15:15:32Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-19T15:15:32Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-19T15:15:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-19T15:15:32Z

- cmd: bun run lint:slop
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-19T15:15:32Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-lo-trinh-mo-hinh-hien-thi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-19T15:15:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: round nay khong do lai (evals.yaml khong doi tu lan baseline cuoi, round 1); field baseline cua moi eval ghi n-a.

Eval khong-phan-biet: none. Lenh suite xanh-ca-hai-phia la regression-guard binh thuong, khong liet ke.

## Judge panels

Khong co judgment item nao trong hop dong nay — khong co panel nao duoc cham, khong co human_override can dien.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lenh suite app/@crm/ui va build do (khong gan eval nao) — tra ve implementation; ghim nhan dong so moc, sua kieu bai kiem ban chup (a99a281d1), duong nen xanh tren ban sach (e96ab66de).
Round 2: E1 va E6 chay lai, E2-E5 va E7 carry-forward tu round 1; bay lenh suite xanh tren verified_commit e96ab66de1b77433d00fcbaac73eb7648e902c79.
