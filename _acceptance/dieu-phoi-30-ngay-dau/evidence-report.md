---
schema_version: 2
feature_slug: dieu-phoi-30-ngay-dau
verdict: BLOCKED
failed_evals: ["E11"]
reason: |
  E6 (AC-6, dp30_khong_khop_viet_agenttask) cannotRun — lenh `bun run test -- "cd apps/api && bun test test/dieu-phoi-diem-nhan.spec.ts -t khong-khop-agenttask"` da chay nhung agent bi skip/chet giua chung, khong tra ve ket qua nao; khong duoc tinh la pass. Round nay dung o day thay vi tiep tuc, vi mot eval khong co ket qua thi khong the ky PASS/REJECT cho no.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 508ed3f7b1828d5eec841dd7b8e370eea4f3fe12
human_signoff:
---

# Evidence Report: dieu-phoi-30-ngay-dau (round 1)

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | cannot-run (agent bi skip/chet — xem `reason`) |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | ui-check | FAIL |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: muatda7rwtsq
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_chep_khong_tham_chieu
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    6 expect() calls
    Ran 2 tests across 1 file. [171.00ms]
    test-run: dropped crm_muatda7rwtsq_test

- eval: E2
  run_id: minted-dieu-phoi-30-ngay-dau-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_buoc_chua_giao_van_co_bo_phan
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    Verdict: BLOCKED — E11 (ui-check, AC-11) khong chay duoc do Next.js 16 khoa mot-tien-trinh; E15 (test) agent skip. 13/15 eval PASS. Caxnh gay: Next.js 16 khoa. Commit 508ed3f7 ghi run-log.jsonl + evidence-report.md cap nhat verdict BLOCKED + verified_commit 027d1e13.

- eval: E3
  run_id: muatdsqc1sry
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_danh_muc_loc_va_ngay_im
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    1 pass, 15 filtered out, 0 fail, 7 expect() calls
    Ran 1 test across 1 file. [185.00ms]
    test-run: dropped crm_muatdsqc1sry_test

- eval: E4
  run_id: muatd7tiyptx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_bac_la_moc_ngay
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [155.00ms]
    test-run: dropped crm_muatd7tiyptx_test

- eval: E5
  run_id: minted-dieu-phoi-30-ngay-dau-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_lo_sai_tu_choi_tron
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [272.00ms]
    test-run: dropped crm_muate7s393nd_test

- eval: E7
  run_id: muatdcsrrdbk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_thieu_khoa_tra_503
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    3 expect() calls
    Ran 2 tests across 1 file. [276.00ms]
    test-run: dropped crm_muatdcsrrdbk_test

- eval: E8
  run_id: muatd6yppj48
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_doi_ten_bo_phan_khong_mat
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    8 expect() calls
    Ran 2 tests across 1 file. [214.00ms]
    test-run: dropped crm_muatd6yppj48_test

- eval: E9
  run_id: muatd6idmj7z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_trang_thai_chua_co_khuon
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    8 expect() calls
    Ran 2 tests across 1 file. [202.00ms]
    test-run: dropped crm_muatd6idmj7z_test

- eval: E10
  run_id: minted-dieu-phoi-30-ngay-dau-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dp30_hang_so_o_config
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    hang-so-o-config: sach — 7 tep quet, 0 ghim ngoai cau hinh, cau hinh co nguoi dung

- eval: E11
  run_id: minted-dieu-phoi-30-ngay-dau-E11-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-21T09:00:00+07:00
  screenshot: evidence/E11-danh-muc.png
  observed: |
    E11-danh-muc.png (1440x900, read directly): table shows header row "Partner | Stuck on | Silent | Steps | Day | Department" and exactly one data row: Partner="Cong ty E11 Kiem Chung", Stuck on="Xac nhan hop dong va gui bo tai lieu khoi don…" (ends in a visible "…" ellipsis — the seeded step label "Xac nhan hop dong va gui bo tai lieu khoi dong cho doi tac moi" is cut off, losing the back half of the sentence), Silent="—", Steps="0/1", Day="20/30", Department=badge "Phong Van Hanh va Cham Soc Khach Hang Doanh Nghiep" (renders in full at this width). E11-danh-muc-768.png (768x1024, read directly): same single row, "Stuck on" now reads "Xac nhan hop dong va gui b…" (even more of the label is hidden), and the Department badge is cut off mid-word as "Phong Van Hanh va Cham Soc" with no ellipsis, its remaining text ("Khach Hang Doanh Nghiep") invisible past the table's right edge — confirmed via JS as real overflow (table-container scrollWidth=830 vs clientWidth=662 at 768px viewport).
  network_observed: unscoped-partial
  verdict_detail: |
    exit khac 0 — hai vi pham co anh + do luong may-kiem-duoc: (a) cot "Stuck on" cat chu bang dau "…" ca hai kho anh (vi pham "khong dau ba cham"); (b) o kho 768 bang co tran ngang that su (scrollWidth 830 > clientWidth 662), cot Department bi day ra ngoai khung khong dau hieu. Loi san pham that trong danh-muc-table.tsx, khop voi "Known limits" da khai san trong contract.md rang AC-11 chua duoc chan may nao — lan nay nguoi (dong vai verifier) da chan va bat duoc hai loi.
    Moi truong: cong 3300/3301 dung chung server co san cho dung cay nay (xac nhan qua lsof -p, cwd khop .../zen-brattain-ac74d0). Gieo du lieu qua chinh API 3301 (dev:session ada@trycomp.ai), khong dung ket noi DB rieng. Gioi han da phat hien: khong co mutation nao trong onboarding.router.ts cho phep dat/ghi de updatedAt cua mot OnboardingStep qua API dang chay, nen cot "Silent" hien "—" thay vi mot so ngay > 0 — gioi han o be mat API, khop "Known limits" da khai san (E11 khong co phep do may nao thuc su doc anh, chi duoc bao dam bang mat nguoi).
  files_luu: evidence/E11-danh-muc.png, evidence/E11-danh-muc-768.png, evidence/E11-network.txt (file moi, chua git add/commit)

- eval: E12
  run_id: minted-dieu-phoi-30-ngay-dau-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_xoa_co_xac_nhan
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    0 fail
    9 expect() calls
    Ran 4 tests across 1 file. [660.00ms]

- eval: E13
  run_id: muatdk6mqvdp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_dong_ke_hoach_con_buoc_do
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [186.00ms]
    test-run: dropped crm_muatdk6mqvdp_test

- eval: E14
  run_id: muatdmz0lpiu
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_ke_hoach_co_nguoi_cam_trich
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    1 pass
    15 filtered out
    0 fail
    4 expect() calls
    Ran 1 test across 1 file. [169.00ms]
    test-run: dropped crm_muatdmz0lpiu_test

- eval: E15
  run_id: minted-dieu-phoi-30-ngay-dau-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dp30_bo_loc_nam_trong_duong_dan
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
    bun test v1.4.2 (744846f84)
    5 pass
    5 filtered out
    0 fail
    10 expect() calls
    Ran 5 tests across 1 file. [10.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-21T09:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-21T09:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-21T09:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-21T09:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — round nay khong do baseline, khong co eval nao duoc lay lam vi du non-discriminating.

## Variance

none — khong eval nao co runs > 1 round nay.

## Iterations

Round trước (commit 508ed3f7): verdict BLOCKED — E11 (ui-check, AC-11) không chạy được do Next.js 16 khoá một-tiến-trình; E15 (test) agent skip. 13/15 eval PASS.
Round 1 (round này): bàn đo Next.js 16 dựng lại theo công thức (db:test → db:seed → dev:session → seed lần hai → khoá → preview_start cặp *-cay-nay) nên E11 chạy được lần này nhưng FAIL thật — cột "Stuck on" cắt chữ bằng dấu "…" ở cả hai khổ ảnh, và khổ 768 tràn ngang thật (scrollWidth 830 > clientWidth 662). Song song, E6 (agent-trigger khong-khop-agenttask) cannotRun — agent bị skip/chết giữa chừng, không trả kết quả. Verdict: BLOCKED (E6 không chạy được nên không thể tính là pass hay fail; E11 riêng nó đã FAIL thật và được liệt vào failed_evals). Dừng ở đây theo đúng luật: không vá kit, không chờ kit 2.18.0, ghi sổ quyết định và báo một dòng cho chủ kho.
