---
schema_version: 2
feature_slug: so-do-quanh-muc-tieu
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b0c56f47a72eba40a97ee8764e5307bd52db0602
human_signoff: manh 2026-10-15
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
| E16 | AC-3 | script | PASS |

không chạy theo hồ sơ: E13

## Evidence

- eval: E1
  run_id: minted-so-do-quanh-muc-tieu-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_len
  verified_at: 2026-10-15T13:45:11Z
  output: |
    test-run: dropped crm_mv9lcu9icu4k_test

- eval: E2
  run_id: minted-so-do-quanh-muc-tieu-E2-r1
  exit_code: 0
  verifier: config:executors.test.dh5_xuong
  verified_at: 2026-10-15T12:47:05Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 1 — khong chay lai; ket qua nam o round goc)

- eval: E3
  run_id: minted-so-do-quanh-muc-tieu-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh5_quyen
  verified_at: 2026-10-15T13:45:11Z
  output: |
    test-run: dropped crm_mv9lctum9myd_test

- eval: E4
  run_id: minted-so-do-quanh-muc-tieu-E4-r1
  exit_code: 0
  verifier: config:executors.test.dh5_loi_vao
  verified_at: 2026-10-15T12:47:05Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 1 — khong chay lai; ket qua nam o round goc)

- eval: E5
  run_id: minted-so-do-quanh-muc-tieu-E5-r2
  exit_code: 0
  verifier: config:executors.test.dh5_so_do
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)

- eval: E6
  run_id: minted-so-do-quanh-muc-tieu-E6-r2
  exit_code: 0
  verifier: config:executors.test.dh5_ro_chuot
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)

- eval: E7
  run_id: minted-so-do-quanh-muc-tieu-E7-r2
  exit_code: 0
  verifier: config:executors.test.dh5_bam
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)

- eval: E8
  run_id: minted-so-do-quanh-muc-tieu-E8-r2
  exit_code: 0
  verifier: config:executors.test.dh5_hep
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)

- eval: E9
  run_id: minted-so-do-quanh-muc-tieu-E9-r2
  exit_code: 0
  verifier: config:executors.test.dh5_trang_thai
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)

- eval: E10
  run_id: minted-so-do-quanh-muc-tieu-E10-r2
  exit_code: 0
  verifier: config:executors.test.dh5_chu
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)

- eval: E11
  run_id: design-gate-13f47a5df1, design-gate-9dbb609522
  exit_code: 0
  verifier: config:executors.script.dh5_san_thiet_ke
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)
    Gioi han da khai: bo do static cua kit tra KHONG-DO-DUOC cho tep .tsx; ma 0 o day khong phai dat; nhan: khong doc duoc o day. Ve nhin-thay cua san thiet ke do E12 ganh.

- eval: E12
  run_id: phien-do crm_so_do_quanh_muc_tieu_do (app :4242, api :4193), mot-luot.sh + rang/man.mjs, 15/10 20:2x
  exit_code: 0
  verifier: config:executors.script.dh5_man
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1 (ngan-so-do-1440.png, 1440x1000, giao dien toi): trang «So do quanh muc tieu», dong «Dang xem quanh: So do · A1 gop muc tieu khoi A», hop tom tat «Gop len cong ty qua KR «Doanh thu hop dong moi dat 48 ty dong» cua muc tieu «Tro thanh doi tac logistics duoc chon dau tien o hai mien»» (dung tap {n1-k1}). Khung ve co 4 the noi bang duong: the tren «So do · A gop KR doanh thu nam», the tam A1 (vien xanh, 50%), hai KR duoi «A1 ... KR 2» (100%) va «KR 1» (0%). Cac the ngoai tam cua duong len cong ty (n1-k1, n1) nam ngoai mep tren khung. Khong hien ngan chi tiet (anh chup sau khi bam nut).
    E12-step2 (gop-hai-cho-1440.png): trang cua «So do · A3 gop ca khoi A lan cong ty». Hop tom tat co HAI dong: «Gop thang vao muc tieu cong ty «Tro thanh doi tac...»» va «Gop len cong ty qua KR «Doanh thu hop dong moi dat 48 ty dong» cua muc tieu «...»» — thay dung hai cho gop. Khung ve: the tam A3 (100%), the «A gop KR doanh thu nam» phia tren, KR 1 phia duoi; hai duong len hoi tu o tam (mot qua the A, mot di thang tu tren khung). Muc tieu cong ty n1 nam ngoai mep tren khung nen chi duoc xac nhan dung mot the bang DOM (DUNG hai-cho 1440: 1 the).
    E12-step3 (ro-chuot-1440.png): cung bo cuc nhu step1, ro chuot len «A1 ... KR 1»: the «A1 ... KR 2» bi lam mo ro ret (chu va thanh tien do nhat), duong den KR 2 nhat; duong den KR 1 va the KR 1 van ro — khop «co the mo» (DOM: 1 the opacity 0.35, truoc 0).
    E12-step4 (danh-sach-390.png, 390x844): khong co khung ve; hien danh sach doc. Hop tom tat «Gop len cong ty qua KR «Doanh thu hop dong moi dat 48 ty dong»...». Muc «Gop vao» co 3 the: «Cong ty» · «Tro thanh doi tac logistics...» (OneHub, 66%), «Cong ty» · «Doanh thu hop dong moi dat 48 ty dong» (49%) — the KR cong ty mang nhan «Cong ty» thay bang mat — va «So do · A gop KR doanh thu nam» (100%); phia duoi bat dau muc «Muc tieu nay» voi the tam vien xanh. Khong cuon ngang thay trong anh; doi chung do (chen khoi rong thi bao tran) DUNG.
    Doi chieu Expected: exit 0; 4 anh o dung thu muc evidence/; moi kiem in DUNG; console khong loi (0 o ca hai kho) — khop.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-so-do-quanh-muc-tieu-E14-r2
  exit_code: 0
  verifier: config:executors.script.dh5_ranh_gioi
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)

- eval: E15
  run_id: minted-so-do-quanh-muc-tieu-E15-r2
  exit_code: 0
  verifier: config:executors.script.dh5_dot_bien
  verified_at: 2026-10-15T13:24:46Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    (carry-forward tu round 2 — khong chay lai; ket qua nam o round goc)

- eval: E16
  run_id: minted-so-do-quanh-muc-tieu-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh5_soi_xem
  verified_at: 2026-10-15T13:45:11Z
  output: |
    DUNG quanhMucTieu doc okrObjective qua dieu kien xem

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-15T13:45:11Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-15T13:45:11Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-15T13:45:11Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-15T13:45:11Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-15T13:45:11Z

- cmd: bun run lint:slop
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-15T13:45:11Z

- cmd: bunx turbo run build --force
  run_id: minted-so-do-quanh-muc-tieu-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-15T13:45:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — khong eval nao xanh-ca-hai-phia; ba eval moi (E1, E3, E16) khong co baseline do duoc, xem muc duoi.

Baseline khong do

- bun run test -- "cd apps/api && bun test test/okr-quanh-muc-tieu.spec.ts -t dh5-len": bo qua baseline: tep apps/api/test/okr-quanh-muc-tieu.spec.ts co o cay dang kiem nhung chua co o merge-base 62f1db904f06ae653944f0af72a0a3e2ea3b1315 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-quanh-muc-tieu.spec.ts -t dh5-quyen": bo qua baseline: tep apps/api/test/okr-quanh-muc-tieu.spec.ts co o cay dang kiem nhung chua co o merge-base 62f1db904f06ae653944f0af72a0a3e2ea3b1315 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/so-do-quanh-muc-tieu/rang/soi-xem.mjs: bo qua baseline: tep _acceptance/so-do-quanh-muc-tieu/rang/soi-xem.mjs co o cay dang kiem nhung chua co o merge-base 62f1db904f06ae653944f0af72a0a3e2ea3b1315 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, deterministic)

## Iterations

Round 1: ba lenh suite (api, app, lint:slop) do theo run-log; E2 va E4 la khung cua round nay. Returned to implementation.
Round 2: bay lenh suite xanh; E5-E12, E14, E15 la khung cua round nay (E11 mang gioi han da khai KHONG-DO-DUOC cho .tsx, ve nhin-thay do E12 ganh).
Round 3: E1, E3, E16 chay lai (E16 la rang soi-xem moi); bay lenh suite chay lai va xanh; cac eval con lai carry-forward vi delta khong cham paths. Ghi chu: verified_at cua muc round 3 la ngay chay (15/10), gio khong do duoc vi run-log round 3 chua duoc append luc soan report.

### Re-pin lần 1 — 2026-10-16, do hoá cũ do gộp onehub f1bf84a29 (có DH4 #429, #427): okr.router.ts, messages-guard.spec.ts
run_id: repin-20261016T083454Z-78445
sha: 4e87e5a8b846ea8b90ccb76d51974e13cd4ac58a · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E13 · ngoài làn máy: E12 · AC không có chốt máy: AC-11, AC-12 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-16, do lan-dem-16-10: gộp onehub ngày 16/10 (#434…#453)
run_id: repin-20261016T233032Z-31285
sha: 735c996977a6fa3e0aad9753f5b27adaea04267c · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E13 · ngoài làn máy: E12 · AC không có chốt máy: AC-11, AC-12 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-17, do vật đổi: the-quanh.tsx thêm variant neutral (toan-canh-okr#E7); gộp onehub 981ac1460
run_id: repin-20261017T010211Z-42953
sha: b0c56f47a72eba40a97ee8764e5307bd52db0602 · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E13 · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-11, AC-12 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
