---
schema_version: 2
feature_slug: tro-ly-doc-kho
verdict: BLOCKED
failed_evals: ["E15","E7u"]
reason: "Hai lenh khong co ket qua vi agent bi skip/chet: (1) tro-ly-kho-loi.spec.ts (eval E13, chay trong bun run test voi TZ=Asia/Ho_Chi_Minh) va (2) bun run lint:slop (lenh suite). Khong duoc tinh la pass; can chay lai. Dong thoi E15 va E7u that bai that."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 260b562b5e01e3a4d41a58df8f4ed5a6b157fee7
human_signoff:
---

# Evidence Report: tro-ly-doc-kho

Round 2. Verdict BLOCKED: hai lenh khong ra ket qua (agent bi skip/chet) va hai eval that bai that (E15, E7u). Khong lenh nao trong so nay duoc tinh la pass.

Lenh bi chan, khong co ket qua:
- `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-kho-loi.spec.ts"` (eval E13): agent bi skip/chet, khong co ket qua.
- `bun run lint:slop` (lenh suite, khong gan eval): agent bi skip/chet, khong co ket qua.

Lenh that bai khong gan rieng eval nao ngoai eval cua no: `bun _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts` (E15) va `ui-check:E7u` (E7u); ca hai da co khoi evidence rieng ben duoi.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6d | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7d | AC-7 | test | PASS |
| E7u | AC-7 | ui-check | FAIL |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | BLOCKED |
| E14 | AC-14 | test | PASS |
| E15 | AC-15 | script | FAIL |
| E15j | AC-15 | judgment | PASS (de xuat, cho nguoi chot) |
| E16j | AC-7 | judgment | UNCERTAIN |
| E17 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-doc-kho-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tim
  verified_at: 2026-10-01T06:45:58Z
  output: |
    bun run test: tlk-tim (agent) + tai-lieu-tim.spec.ts (api) xanh

- eval: E2
  run_id: minted-tro-ly-doc-kho-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_doc
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup67v8xmui8_test

- eval: E3
  run_id: minted-tro-ly-doc-kho-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_kiem_trich
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup67v91cn76_test

- eval: E4
  run_id: minted-tro-ly-doc-kho-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tu_choi
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup67uji9j2m_test

- eval: E5
  run_id: minted-tro-ly-doc-kho-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_qua_han
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup67vce5fgs_test

- eval: E6
  run_id: minted-tro-ly-doc-kho-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_xac_minh_api
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup67v66txfs_test

- eval: E6d
  run_id: minted-tro-ly-doc-kho-E6d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_xac_minh
  verified_at: 2026-10-01T06:45:58Z
  output: |
    Ran 5 tests across 1 file. [3.69s]

- eval: E7
  run_id: minted-tro-ly-doc-kho-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_hoi_api
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup67v9o4fd6_test

- eval: E7d
  run_id: minted-tro-ly-doc-kho-E7d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_hoi
  verified_at: 2026-10-01T06:45:58Z
  output: |
    Ran 10 tests across 1 file. [6.36s]

- eval: E7u
  run_id: E7u-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tlk_man_hoi
  verified_at: 2026-10-01T06:45:58Z
  screenshot: evidence/E7u-step1.png
  observed: |
    Da mo ca 6 frame E7u-step1..6 (1440, tru step5 la 390). Step1 trang thai trong tab Hoi, step2 tra loi kem trich dan va nut Bao sai, step3 tu choi "Chua co trang da duyet nao tra loi cau nay", step4 canh bao qua han, step6 "Da bao sai" da vo hieu: khop expected.
    Step5 (390) MAU THUAN expected: chi hien trang thai trong (cau mo dau, chip goi y bi cat "Xin nghi phe...", o nhap trong), KHONG co bong bong cau hoi hay cau tra loi cua buoc 2 du script bao "buoc 5: dat". Chay lan hai ra y het, khong ngau nhien.
  network_observed: n-a (driver)
  output: |
    Chay mot-luot.sh voi man-hoi.mjs hai lan, ca hai xanh; in "buoc 1..6: dat", "man-hoi: dat". Chieu do --chieu-do bat dung (khong thay tab Hoi). tlk-hoi-cuon-390.txt: 5 anh deu scrollWidth bang innerWidth (390), khong cuon ngang trang.
    That bai nam o assertion theo frame: buoc 5 chi khai d.dat(5, tran.length===0), tuc chi kiem khong cuon ngang, nen script bao dat du frame khong hien cau tra loi. Gia thuyet (chua xac minh): o 390 hoi thoai bi remount/reload giua luc DOM bao TRA_LOI va luc chup.
    Luu y: _acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md dang o trang thai modified trong git, khong do eval nay sua tay.

- eval: E8
  run_id: minted-tro-ly-doc-kho-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_zalo
  verified_at: 2026-10-01T06:45:58Z
  output: |
    Ran 3 tests across 1 file. [742.00ms]
    test-run: dropped crm_mup67u3ucsis_test

- eval: E9
  run_id: minted-tro-ly-doc-kho-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_nhat_ky
  verified_at: 2026-10-01T06:45:58Z
  output: |
    bun run test: tlk-nhat-ky xanh

- eval: E10
  run_id: minted-tro-ly-doc-kho-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_chua_tra_loi
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup689jsm14m_test

- eval: E10d
  run_id: minted-tro-ly-doc-kho-E10d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_suc_khoe_hoi
  verified_at: 2026-10-01T06:45:58Z
  output: |
    Ran 4 tests across 1 file. [2.65s]

- eval: E11
  run_id: minted-tro-ly-doc-kho-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_bao_sai
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup688mf5f4i_test

- eval: E12
  run_id: minted-tro-ly-doc-kho-E12-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tlk_ranh_gioi
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup689p91gx9_test

- eval: E14
  run_id: minted-tro-ly-doc-kho-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tran
  verified_at: 2026-10-01T06:45:58Z
  output: |
    test-run: dropped crm_mup68ajkozh6_test

- eval: E15
  run_id: minted-tro-ly-doc-kho-E15-r2
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tlk_cham_bo_do
  verified_at: 2026-10-01T06:45:58Z
  output: |
    c31 khong-chuyen ... c32 chuyen ... c38 chuyen ... c40 khong-chuyen (cau khong phai quy dinh, luot Zalo)
    dung trang: 100.0% (nguong >= 80.0%) dat
    tu choi dung: 100.0% (nguong >= 80.0%) dat
    Zalo chuyen cau quy dinh: 100.0% (nguong >= 90.0%) dat
    Zalo chuyen nham cau khong phai quy dinh: 20.0% (nguong <= 10.0%) KHONG DAT
    tra loi co trich khong qua kiem (dem lai): 0 dat
    demHoiKho cua cua so chay: traLoi 24, tuChoi 6, loi 0, tiLe 80.0%
    ghi _acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md

- eval: E17
  run_id: minted-tro-ly-doc-kho-E17-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tlk_san_thiet_ke
  verified_at: 2026-10-01T06:45:58Z
  output: |
    design-gate static + ban-kinh-man qua moi tep tsx cua tai-lieu; cong mo-coi ai-elements xanh
    test-run: dropped crm_mup68gsk1iuc_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-doc-kho-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-10-01T06:45:58Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-doc-kho-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-01T06:45:58Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-doc-kho-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-01T06:45:58Z

### Judgment (de xuat panel, nguoi chot o Cong 2)

Chu y: so Zalo cua E15j trong rationale cua panel (1/10 nham) lech voi thuoc may o E15 (20.0%, tuc hai trong muoi cau khong phai quy dinh bi chuyen; bang luot hai cho thay ca c32 va c38 la "chuyen"). Nguoi chot nen doi chieu cham-bo-do.md truoc khi chap nhan de xuat PASS cua E15j.

Panel E15j (de xuat PASS):
- domain-correctness: PASS — Cau kho (c11-c20) va cau khong dau (c27-c30) deu khop tung chu voi doan trich di kem; sau cau phai tu choi (c21-c26) deu TU_CHOI khong-co-trang. Luot Zalo: cau quy dinh deu duoc chuyen. Luu y: bang luot hai chi cho nhan chuyen/khong-chuyen, khong co noi dung tra loi.
- operational-feasibility: PASS — 10 cau kho tra loi kem trich nguyen van; 6 cau phai tu choi deu TU_CHOI. Luot Zalo 30/30 cau quy dinh chuyen; cau co ten khach (c31, c36, c37) deu khong chuyen.
- spec-alignment: PASS — 24 cau co trang deu co cau trich khop; 6 cau khong-co deu TU_CHOI; 30 cau quy dinh deu chuyen ke ca khong dau. Panel ghi nhan mot dong chuyen nham (c38).

- eval: E15j
  judged_by: judge panel (3 lens, fresh context) — de xuat
  verdict: PASS
  rationale: Ca ba lens de xuat PASS dua tren cham-bo-do.md; tuy nhiem so lieu Zalo cua panel (mot cau nham) khong khop voi thuoc may (20.0%, hai cau), nguoi chot can doi chieu.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

Panel E16j (de xuat UNCERTAIN):
- domain-correctness: UNCERTAIN — Nhan o 1440 va 390 (qua-han, bao-sai) khop tu dien CONTEXT.md, khong chu de nhau. Nhung tlk-hoi-tra-loi-390.png thuc ra la trang thai trong, nen trang thai "tra loi co trich" o 390 khong co anh dung; hang goi y bi cat o mep phai va tlk-hoi-cuon-390.txt chi do cap trang.
- operational-feasibility: UNCERTAIN — Nguoi doc hieu duoc trang, phien ban, ngay duyet va canh bao qua han o 1440 va cac anh 390 qua-han, bao-sai. Nhung anh tra-loi 390 la trang thai trong, va hang chip goi y bi cat o 390; phep do chi do cuon ngang cap trang.
- spec-alignment: FAIL — O 390 hang chip goi y tran ngang: chip thu hai bi cat giua chu ("Xin nghi phe...") va chip thu ba khong thay; vi pham tieu chi khong cuon ngang du la vung cuon hay bi cat. Ngoai ra anh tra-loi 390 thuc ra la trang thai trong.

- eval: E16j
  judged_by: judge panel (3 lens, fresh context) — de xuat
  verdict: UNCERTAIN
  rationale: Hai lens UNCERTAIN va mot lens FAIL deu chi ve cung mot cho: anh tlk-hoi-tra-loi-390.png khong phai trang thai co cau tra loi, va hang chip goi y o 390 bi cat. Khop voi E7u buoc 5 cua chinh vong nay (frame chi hien trang thai trong).
  required_evidence:
    - Anh tlk-hoi-tra-loi-390.png chup lai dung trang thai co cau tra loi kem trich dan (ten trang, Phien ban, ngay duyet) o khong rong 390, bang cach chay lai thuoc man Hoi; anh hien co giong het tlk-hoi-trong-390.png.
    - So do scrollWidth va clientWidth cua chinh hang chip goi y (kem overflow-x) o khong rong 390 trong tlk-hoi-cuon-390.txt; hien file chi do document.scrollWidth. Neu hang xuong dong hoac khong cuon ngang thi dat, neu cuon ngang thi khong dat.
    - Anh tlk-hoi-qua-han-390.png hoac so do bounding box cho thay o soan va nut gui khong bi huy hieu noi o goc phai duoi che mat.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

Eval khong-phan-biet (pass tren ca HEAD lan baseline): E12 (lenh `bun run test -- "cd apps/agent && bun test test/tro-ly-kho-ranh-gioi.spec.ts test/khuon-di-dong.spec.ts"`). Can viet lai de assert hanh vi moi, hoac xac nhan day la regression-guard co chu y. Cac eval feature con lai deu red tren baseline (co phan biet).

## Variance

none — moi eval nhieu lan chay deu dong nhat (khong eval nao co runs lon hon 1 voi pass_rate lan lon).

## Iterations

Round 1: REJECT — xem run-log.jsonl (24 eval, 2 judgment item cho nguoi chot); tra ve implementation, sua o d9959e31 va 260b562b.
Round 2: E15 va E7u that bai that (E15: ty le Zalo chuyen nham cau khong phai quy dinh vuot nguong; E7u: anh buoc 5 o 390 khong hien cau tra loi); them hai lenh (E13 tro-ly-kho-loi.spec.ts va lint:slop) bi skip/chet nen khong co ket qua; verdict BLOCKED. Chua can chay lai toan bo, nhung phai chay lai hai lenh bi chan truoc khi quyet.
