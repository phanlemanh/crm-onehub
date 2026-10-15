---
schema_version: 2
feature_slug: so-do-quanh-muc-tieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5c835bf364f7b9796aa880e8293579371712740c
human_signoff:
---

# Evidence Report: so-do-quanh-muc-tieu

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
| E10 | AC-10 | test | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | ui-check | PASS |
| E14 | AC-13 | script | PASS |
| E15 | AC-1 | script | PASS |

không chạy theo hồ sơ: E13

## Evidence

- eval: E1
  run_id: minted-so-do-quanh-muc-tieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_len
  verified_at: 2026-10-15T12:47:05Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-so-do-quanh-muc-tieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_xuong
  verified_at: 2026-10-15T12:47:05Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-so-do-quanh-muc-tieu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_quyen
  verified_at: 2026-10-15T12:47:05Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-so-do-quanh-muc-tieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_loi_vao
  verified_at: 2026-10-15T12:47:05Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-so-do-quanh-muc-tieu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_so_do
  verified_at: 2026-10-15T13:24:46Z
  output: |
    Ran 2 tests across 1 file. [1.59s]

- eval: E6
  run_id: minted-so-do-quanh-muc-tieu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_ro_chuot
  verified_at: 2026-10-15T13:24:46Z
  output: |
    Ran 1 test across 1 file. [805.00ms]

- eval: E7
  run_id: minted-so-do-quanh-muc-tieu-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_bam
  verified_at: 2026-10-15T13:24:46Z
  output: |
    Ran 1 test across 1 file. [793.00ms]

- eval: E8
  run_id: minted-so-do-quanh-muc-tieu-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_hep
  verified_at: 2026-10-15T13:24:46Z
  output: |
    Ran 1 test across 1 file. [893.00ms]

- eval: E9
  run_id: minted-so-do-quanh-muc-tieu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_trang_thai
  verified_at: 2026-10-15T13:24:46Z
  output: |
    Ran 1 test across 1 file. [1177.00ms]

- eval: E10
  run_id: minted-so-do-quanh-muc-tieu-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_chu
  verified_at: 2026-10-15T13:24:46Z
  output: |
    Ran 158 tests across 1 file. [814.00ms]

- eval: E11
  run_id: design-gate-13f47a5df1, design-gate-9dbb609522
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh5_san_thiet_ke
  verified_at: 2026-10-15T13:24:46Z
  note: gioi han da khai trong evals.yaml — bo do static cua kit tra KHONG-DO-DUOC cho tep .tsx, nen ma 0 o day khong phai dat ve mat nhin-thay; nhan "khong doc duoc o day"; ve nhin-thay do E12 (ui-check tren man that) ganh.
  output: |
    }

- eval: E12
  run_id: phien-do crm_so_do_quanh_muc_tieu_do (app :4242, api :4193), mot-luot.sh + rang/man.mjs, 15/10 20:2x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh5_man
  verified_at: 2026-10-15T13:24:46Z
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1 (ngan-so-do-1440.png, 1440x1000, giao dien toi): trang «So do quanh muc tieu», dong «Dang xem quanh: So do · A1 gop muc tieu khoi A», hop tom tat «Gop len cong ty qua KR «Doanh thu hop dong moi dat 48 ty dong» cua muc tieu «Tro thanh doi tac logistics duoc chon dau tien o hai mien»» (dung tap {n1-k1}). Khung ve co 4 the noi bang duong: the tren «So do · A gop KR doanh thu nam», the tam A1 (vien xanh, 50%), hai KR duoi «A1 ... KR 2» (100%) va «KR 1» (0%). Cac the ngoai tam cua duong len cong ty (n1-k1, n1) nam ngoai mep tren khung. Khong hien ngan chi tiet (anh chup sau khi bam nut).
    E12-step2 (gop-hai-cho-1440.png): trang cua «So do · A3 gop ca khoi A lan cong ty». Hop tom tat co HAI dong: «Gop thang vao muc tieu cong ty «Tro thanh doi tac...»» va «Gop len cong ty qua KR «Doanh thu hop dong moi dat 48 ty dong» cua muc tieu «...»» — thay dung hai cho gop. Khung ve: the tam A3 (100%), the «A gop KR doanh thu nam» phia tren, KR 1 phia duoi; hai duong len hoi tu o tam (mot qua the A, mot di thang tu tren khung). Muc tieu cong ty n1 nam ngoai mep tren khung nen chi duoc xac nhan dung mot the bang DOM (DUNG hai-cho 1440: 1 the).
    E12-step3 (ro-chuot-1440.png): cung bo cuc nhu step1, ro chuot len «A1 ... KR 1»: the «A1 ... KR 2» bi lam mo ro ret (chu va thanh tien do nhat), duong den KR 2 nhat; duong den KR 1 va the KR 1 van ro — khop «co the mo» (DOM: 1 the opacity 0.35, truoc 0).
    E12-step4 (danh-sach-390.png, 390x844): khong co khung ve; hien danh sach doc. Hop tom tat «Gop len cong ty qua KR «Doanh thu hop dong moi dat 48 ty dong»...». Muc «Gop vao» co 3 the: «Cong ty» · «Tro thanh doi tac logistics...» (OneHub, 66%), «Cong ty» · «Doanh thu hop dong moi dat 48 ty dong» (49%) — the KR cong ty mang nhan «Cong ty» thay bang mat — va «So do · A gop KR doanh thu nam» (100%); phia duoi bat dau muc «Muc tieu nay» voi the tam vien xanh. Khong cuon ngang thay trong anh; doi chung do (chen khoi rong thi bao tran) DUNG.
    Doi chieu Expected: exit 0; 4 anh o dung thu muc evidence/; moi kiem in DUNG; console khong loi (0 o ca hai kho) — khop.
  network_observed: n-a (driver)
  output: |
    KET LUAN: 12 DUNG, 0 SAI — ma thoat 0
    Frame da luu (4 anh goc + ban sao E12-step1..4): evidence/ngan-so-do-1440.png = E12-step1.png; gop-hai-cho-1440.png = E12-step2.png; ro-chuot-1440.png = E12-step3.png; danh-sach-390.png = E12-step4.png; kem E12-network.txt. Capture bang chinh driver puppeteer-core cua rang/man.mjs (ui:capture khong can dung them).
    Gioi han ghi nhan (khong lam do): (1) anh 1 chup trang so do SAU khi bam nut, khong co khung hinh ngan chi tiet dang mo; viec bam nut that duoc chung minh bang assertion URL. (2) o 1440 the KR cong ty n1-k1 va the muc tieu n1 nam ngoai mep tren khung ve o zoom 100%, nen nhan «Cong ty» va tinh «dung mot the» o 1440 chi duoc chung minh bang DOM, khong thay bang mat trong anh 1440; nhan Cong ty thay bang mat o anh 390. Khong co dieu nao mau thuan Expected.

- eval: E14
  run_id: minted-so-do-quanh-muc-tieu-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh5_ranh_gioi
  verified_at: 2026-10-15T13:24:46Z
  output: |
    DUNG ranh gioi

- eval: E15
  run_id: minted-so-do-quanh-muc-tieu-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh5_dot_bien
  verified_at: 2026-10-15T13:24:46Z
  output: |
    dot-bien: 8/8 vet bi bat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T13:24:46Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-15T13:24:46Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T13:24:46Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T13:24:46Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-15T13:24:46Z

- cmd: bun run lint:slop
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T13:24:46Z

- cmd: bunx turbo run build --force
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-15T13:24:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — khong co eval khong-phan-biet nao duoc liet ke; moi block eval ghi baseline n-a vi round nay khong do lai.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: ba lenh suite (api, app + ui, lint:slop) do va ho so con cac finding; tong ket REJECT, tra ve implementation.
Round 2: moi eval round nay va ca 7 lenh suite xanh; E1–E4 mang sang tu round 1 (delta khong cham paths cua eval); E13 khong chay theo ho so.
