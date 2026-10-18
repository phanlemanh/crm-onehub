---
schema_version: 2
feature_slug: du-an-gantt
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1c357d7bf6c01265c7f25cad1751640984792e94
human_signoff: manh 2026-10-18
---

# Evidence Report: du-an-gantt

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | ui-check | PASS |
| E13b | AC-13 | script | PASS |
| E14 | AC-14 | judgment | PASS (de xuat cua hoi dong, cho human_override) |
| E15 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-du-an-gantt-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_tao
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92htczyf3_test

- eval: E1b
  run_id: minted-du-an-gantt-E1b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_ds
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 5 tests across 1 file. [1224.00ms]

- eval: E2
  run_id: minted-du-an-gantt-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_gom
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92i9bd8au_test

- eval: E2b
  run_id: minted-du-an-gantt-E2b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_khung
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 2 tests across 1 file. [1013.00ms]

- eval: E3
  run_id: minted-du-an-gantt-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_bat_dau
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92gorb0r4_test

- eval: E3b
  run_id: minted-du-an-gantt-E3b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_ngay
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 1 test across 1 file. [1402.00ms]

- eval: E4
  run_id: minted-du-an-gantt-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_gantt_ui
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 1 test across 1 file. [808.00ms]

- eval: E4b
  run_id: minted-du-an-gantt-E4b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_gantt
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 3 tests across 1 file. [1268.00ms]

- eval: E5
  run_id: minted-du-an-gantt-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_keo_thanh
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92ga0q5g1_test

- eval: E5b
  run_id: minted-du-an-gantt-E5b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_keo
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 3 tests across 1 file. [1.56s]

- eval: E6
  run_id: minted-du-an-gantt-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_phu_thuoc
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92hyz8p6h_test

- eval: E6b
  run_id: minted-du-an-gantt-E6b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_phai_cho
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 2 tests across 1 file. [981.00ms]

- eval: E7
  run_id: minted-du-an-gantt-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_ngay_lam
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 8 tests across 2 files. [21.00ms]

- eval: E7b
  run_id: minted-du-an-gantt-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_tu_doi
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92igtdxw8_test

- eval: E8
  run_id: minted-du-an-gantt-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_moc
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92i1anuky_test

- eval: E9
  run_id: minted-du-an-gantt-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_lich
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92nlcu0va_test

- eval: E9b
  run_id: minted-du-an-gantt-E9b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_lich
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 3 tests across 1 file. [566.00ms]

- eval: E10
  run_id: minted-du-an-gantt-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_quyen
  verified_at: 2026-10-18T03:12:19Z
  output: |
    lenh thoat sach, khong co dong tom tat them

- eval: E11
  run_id: minted-du-an-gantt-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_vong_doi
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92ogb8ztd_test

- eval: E11b
  run_id: minted-du-an-gantt-E11b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_dong
  verified_at: 2026-10-18T03:12:19Z
  output: |
    Ran 4 tests across 1 file. [1388.00ms]

- eval: E12
  run_id: minted-du-an-gantt-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_thuoc
  verified_at: 2026-10-18T03:12:19Z
  output: |
    test-run: dropped crm_mvd92pc5luw2_test

- eval: E13
  run_id: minted-du-an-gantt-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dg_man
  verified_at: 2026-10-18T03:12:19Z
  screenshot: evidence/E13-step1.png
  observed: |
    step1 dg-cua-toi-1280: trang Viec, o 'Pham vi: Cua toi' (nhu DA1), chip Giao cho toi 7 / Toi giao 0 / Dang theo doi 0; bang 7 viec, cac viec thuoc du an co dong phu 'Du an: Trien khai Ngan hang An Phat/Bac A kd92uip' (dung ST-viec-cua-toi-du-an), 'Goi lai anh Tuan' khong co dong phu. step2 dg-pham-vi-1280: menu Pham vi mo: Cua toi, Tat ca du an, nhom 'Du an dang mo' (2 du an), 'Da dong (1)' co mui ten, 'Tao du an...' (dung ST-pham-vi-mo). step3 dg-ds-1280: pham vi 'Tat ca du an', bang cot Du an/Tien do/Khoang ngay/Moc ke/Nguoi tao: '0/1 viec xong 26/10-30/10 — Pham Thu Ha', '0/5 viec xong 26/10-04/11 Go-live 06/11'; dong gap 'Da dong (1)' (dung ST-du-an-ds-co).
    step4 dg-gantt-1280: hang Moc co hinh thoi Go-live, cay viec co con thut (Ra dieu khoan duoi Ky hop dong), thanh mau theo trang thai (Dang lam xanh, con lai xam), 3 mui ten noi dung cap, cot Thu 7/CN/ngay 2/11 to nen soc, nhom 'Chua co lich (1)' co nut 'Dat ngay' (dung ST-gantt-co-lich/chua-lich); vach hom nay khong nam trong khung nhin (chi co trong DOM). step5 dg-gantt-moc-tre-1280: them moc 'Ky ket' hinh thoi do + 'Moc ke: Ky ket 29/10' cham do (dung ST-gantt-moc-tre). step6 dg-gantt-da-doi-1280: sau doiLich thanh Ky hop dong / Chuan bi / Dao tao o vi tri moi, ngay du an doi 26/10-06/11, toast 'Da doi 2 viec' (dung ST-gantt-da-doi).
    step7 dg-khung-viec-1280: khung viec 'Chuan bi du lieu khach hang' co o Bat dau (3 thg 11), Han (4 thg 11), Du an (Trien khai Ngan hang An Phat), muc 'PHAI CHO (1)' voi Ky hop dong + o them viec phai cho (dung ST-khung-viec-lich). step8 dg-hoi-dong-1280: hop thoai 'Du an con 5 viec chua xong. Van dong?' nut Thoi / Van dong (dung ST-du-an-hoi-dong). step9 dg-lich-lam-viec-1280: trang Lich lam viec co the 'Ngay nghi trong tuan' (Thu 2..CN, Thu 7 va CN duoc chon) va the 'Ngay le' (Nghi bu kd92uip 2 thg 11 2026) (dung ST-lich-lam-viec). step10 dg-gantt-375: khung 375, o chon kieu xem 'So do Gantt' dang dropdown, Gantt nam trong khung va bi cat ngang (cuon ngang trong khung), trang khong co thanh cuon ngang (man.mjs do scrollWidth <= 375 dat). step11 dg-ds-375: o chon kieu xem 'Danh sach', du an hien thanh the (card) co '0/5 viec xong · 26/10 – 06/11 · Ky ket 29/10 · tre', dong gap 'Da dong (1)' (dung ST-gantt-dien-thoai).
  network_observed: n-a (driver)
  output: |
    Assertion DOM tu dg-gantt-1280.html: [data-gantt-dependency]=3 (>=2), [data-off-day]=26 (>0), data-gantt-moc='Go-live', data-today co trong DOM (cot header 'Thu 7 17' va dai bg-primary/5 tai 14.29% be rong cua vung cuon, nam ngoai khung nhin vi du an bat dau 26/10).
    Frame da luu: E13-step1=dg-cua-toi-1280, step2=dg-pham-vi-1280, step3=dg-ds-1280, step4=dg-gantt-1280, step5=dg-gantt-moc-tre-1280, step6=dg-gantt-da-doi-1280, step7=dg-khung-viec-1280, step8=dg-hoi-dong-1280, step9=dg-lich-lam-viec-1280, step10=dg-gantt-375, step11=dg-ds-375 (kem .html cho 1280/375). Tep E13-network.txt da ghi lai; lan nay khong co duong doc network, driver la script.
    LUU Y: 'vach hom nay' khong thay ro trong frame dg-gantt-1280 (cua so Gantt mo o tuan 26/10, hom nay 17-18/10 nam ngoai khung nhin); chi xac nhan qua DOM. Khong coi la mau thuan Expected.

- eval: E13b
  run_id: minted-du-an-gantt-E13b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dg_san_thiet_ke
  verified_at: 2026-10-18T03:12:19Z
  output: |
    dg san: 11 tep, 0 vi pham P0

- eval: E14
  judged_by: hoi dong ba lens (de xuat), panel giu nguyen tu round 2 — inputs khong doi, khong cham lai; rationale xem round do
  verdict: PASS (de xuat, round 2 mang sang)
  rationale: panel giu nguyen tu round 2, rationale xem round do. Hop dong T3, moi judgment item can human_override truc tiep.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override: Đạt — manh 2026-10-18

- eval: E15
  run_id: minted-du-an-gantt-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dg_dot_bien
  verified_at: 2026-10-18T03:12:19Z
  output: |
    dot-bien: 21/21 dot bien chet

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-18T03:12:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-18T03:12:19Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-18T03:12:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-18T03:12:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-du-an-gantt-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-18T03:12:19Z

- cmd: bun run lint:slop
  run_id: minted-du-an-gantt-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-18T03:12:19Z

- cmd: bunx turbo run build --force
  run_id: minted-du-an-gantt-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-18T03:12:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval khong phan biet (xanh ca tren HEAD lan baseline): khong co.

## Variance

none — moi eval chay mot lan, deterministic, khong co eval nao mang phuong sai.

## Iterations

Round 1: chay may dau tien tren sha ad235d5bf, ghi trong run-log (hau to r1). Baseline do o round nay.
Round 2: REJECT — E13 chua dat, co 3 finding trong hop dong va 18 finding ngoai hop dong. Tra ve phan trien khai (commit 91bc21d52 va 1c357d7bf).
Round 3: moi eval may deu dat, bay lenh suite deu dat; verdict PENDING-JUDGMENT vi hop dong T3 can human_override truc tiep tren E14 (hoi dong de xuat PASS, panel mang sang tu round 2).
