---
schema_version: 2
feature_slug: giai-doan-thoa-thuan
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 99ab35a30335c5f765410f94905e06d237d72c74
human_signoff: Phan Le Manh 2026-09-29
---

# Evidence Report: giai-doan-thoa-thuan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | ui-check | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-14 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-giai-doan-thoa-thuan-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdtt_migration
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun _acceptance/giai-doan-thoa-thuan/rang/migration-du-lieu.mjs
    khang-dinh=53/53

- eval: E2
  run_id: minted-giai-doan-thoa-thuan-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_tao
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan.spec.ts -t tao
    test-run: dropped crm_mum22rjmbbtu_test

- eval: E3
  run_id: minted-giai-doan-thoa-thuan-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_man_menu
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test giai-doan-menu.dom.tsx
    Ran 3 tests across 1 file. [680.00ms]

- eval: E4
  run_id: minted-giai-doan-thoa-thuan-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_doi_ten
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan.spec.ts -t doi-ten
    test-run: dropped crm_mum22sdh70ia_test

- eval: E5
  run_id: minted-giai-doan-thoa-thuan-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_sap_xep
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan.spec.ts -t sap-xep
    test-run: dropped crm_mum22rsq0yyh_test

- eval: E6
  run_id: minted-giai-doan-thoa-thuan-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_xoa_trong
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan.spec.ts -t xoa-trong
    (chay xong, khong co dong loi)

- eval: E7
  run_id: minted-giai-doan-thoa-thuan-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_xoa_chuyen
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan.spec.ts -t xoa-chuyen
    (chay xong, khong co dong loi)

- eval: E8
  run_id: minted-giai-doan-thoa-thuan-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_bat_bien
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan.spec.ts -t bat-bien
    test-run: dropped crm_mum22sm3n80o_test

- eval: E9
  run_id: minted-giai-doan-thoa-thuan-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gdtt_quyen
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan-quyen.spec.ts test/vai-chi-okr.spec.ts
    test-run: dropped crm_mum22td6n2vr_test

- eval: E10
  run_id: minted-giai-doan-thoa-thuan-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_man_quyen
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test giai-doan-cai-dat.dom.tsx -t khong-quyen
    Ran 2 tests across 1 file. [644.00ms]

- eval: E11
  run_id: minted-giai-doan-thoa-thuan-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_theo_loai
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan.spec.ts -t theo-loai
    test-run: dropped crm_mum232q0ur8q_test

- eval: E12
  run_id: mum234cub52v
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_tong_quan
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan-bao-cao.spec.ts -t tong-quan
    test-run: dropped crm_mum234cub52v_test

- eval: E13
  run_id: minted-giai-doan-thoa-thuan-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_okr_telemetry
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan-bao-cao.spec.ts -t okr-telemetry
    test-run: dropped crm_mum234srxa6x_test

- eval: E14
  run_id: mum236oo51fo
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_agent
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test test/giai-doan-agent.integration.spec.ts
    test-run: dropped crm_mum236oo51fo_test

- eval: E15
  run_id: minted-giai-doan-thoa-thuan-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdtt_man_chrome
  verified_at: 2026-09-29T02:26:09Z
  screenshot: evidence/E15-cai-dat-320-vi.png
  observed: |
    E15-cai-dat-320-vi.png: man hinh 320px tieng Viet, tieu de "Giai doan thoa thuan"; ba the theo thu tu Dang mo (Demo booked, Qualified to buy, Decision maker in, Contract sent, "Tam gdttmum242p1" 3 thoa thuan), Chot duoc (Closed won), Khong thanh (Closed lost, Unqualified...); moi the co nut "Them giai doan"; noi dung main nam gon trong 320px, khong tran ngang; header co huy hieu "Dang tra cuu 4" va thanh tab cuon (loi header san co da khai). E15-cai-dat-1440-en.png: 1440px tieng Anh, "Deal stages" voi Open / Closed won / Closed lost dung thu tu, nut "Add stage", sidebar Settings tieng Anh, dem "5 deals/8 deals/3 deals" — dung ngon ngu, khong tran. E15-them-thay-o-bang-cot.png: /deals?view=board 1440/vi, bang cot co cac cot Demo booked, Qualified to buy, Decision maker in, Contract sent, "Tam gdttmum242p1" (3 the thoa thuan seed); cot giai doan moi nam ngoai vien phai khung 900px nen khong thay trong anh, nhung khang dinh DOM data-board-column=<id giai doan moi> pass. E15-xoa-chuyen.png: sau "Chuyen va xoa", hop thoai da dong, toast "Da xoa giai doan." o goc duoi; the Dang mo con Demo booked (nay 8 thoa thuan = 5+3 duoc chuyen sang), Qualified to buy, Decision maker in, Contract sent, "Moi gdttmum242p1" 0 thoa thuan; giai doan "Tam" da bien mat. Tat ca khop Expected, khong mau thuan.
  network_observed: n-a (driver)
  output: |
    Lenh: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/giai-doan-thoa-thuan/rang/man-giai-doan.mjs" (chay lai tuoi ngay 2026-09-29 09:27). tien-de dung phien do rieng crm_giai_doan_thoa_thuan_do, app :4194, api :4344 (khong dung 3000/3001); canh cay dung-cay; dev:session dang nhap. Ket qua rang: "o=10/10 khang-dinh=35/35", phien-do "xong".
    Gioi han da khai: do tran trong vung main, khong do document; header chung tran o 320/vi khi co huy hieu "Dang tra cuu N" (loi san co ngoai pham vi). Ca loi tai do bang E16, khong do bang Chrome.
    Frame luu: evidence/E15-cai-dat-{320,375,768,1024,1440}-{vi,en}.png (10 anh), E15-them-thay-o-bang-cot.png, E15-xoa-chuyen.png. Da Read truc tiep 4 frame dai dien (320-vi, 1440-en, them-thay-o-bang-cot, xoa-chuyen); 8 frame kich thuoc con lai duoc kiem bang khang dinh may cua rang, khong Read tung anh.
    Network: driver la kich ban puppeteer, khong doc duoc network/console cua browser tool nen n-a (driver); khong ghi E15-network.txt.

- eval: E16
  run_id: minted-giai-doan-thoa-thuan-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_man_trang_thai
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test giai-doan-cai-dat.dom.tsx -t trang-thai
    Ran 7 tests across 1 file. [817.00ms]

- eval: E17
  run_id: minted-giai-doan-thoa-thuan-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdtt_khong_re_theo_ten
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun _acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs
    so tep da quet: 998

- eval: E18
  run_id: minted-giai-doan-thoa-thuan-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gdtt_san_thiet_ke
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun _acceptance/giai-doan-thoa-thuan/rang/san-thiet-ke.mjs
    dat  apps/app/components/crm/timeline/timeline-entry.tsx

- eval: E19
  run_id: minted-giai-doan-thoa-thuan-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gdtt_man_timeline
  verified_at: 2026-09-29T02:26:09Z
  output: |
    bun test giai-doan-timeline.dom.tsx
    Ran 2 tests across 1 file. [503.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-giai-doan-thoa-thuan-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-29T02:26:09Z

- cmd: bunx turbo run lint --force
  run_id: minted-giai-doan-thoa-thuan-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-29T02:26:09Z

- cmd: bun run lint:slop
  run_id: minted-giai-doan-thoa-thuan-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-29T02:26:09Z

- cmd: bunx turbo run build --force
  run_id: minted-giai-doan-thoa-thuan-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-29T02:26:09Z

## Known limits

## Ngoài hợp đồng

## Analyst

E9 (bun run test -- "cd apps/api && bun test test/giai-doan-quyen.spec.ts test/vai-chi-okr.spec.ts") xanh ca tren code moi lan baseline: khong phan biet. Day la regression-guard co chu y cho quyen ghi/doc cua giaiDoan.* (them mutation moi ma khong vao ma tran thi do) va vai-chi-okr.spec.ts; xac nhan giu lai lam guard, khong can viet lai. Cac eval feature khac deu red tren baseline (co phan biet).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all 19 evals passed, khong eval nao hong; 4 lenh suite xanh; khong judgment item; khong eval nao co phuong sai. Verdict PASS.

### Re-pin lần 1 — 2026-09-29, do gộp onehub (#203, #205) trước khi merge PR #206
run_id: repin-20260929T064017Z-47497
sha: 6e56b3c148d998bc06e93f626c106514267e994b · suites: 4 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · diff chạm vật đo ngoài làn máy: E15 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 2 — 2026-10-08, do gộp onehub c803963e (#304); giai-doan-thoa-thuan/E15 thay bởi danh-sach-keo-chung#AC-8; thước E1 neo theo migration
run_id: repin-20261008T080729Z-36869
sha: 7035c37dbc3fe3b0d43c10e600287a6ea8c6aa39 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · diff chạm vật đo ngoài làn máy: E15 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-08, do gộp onehub 591bc8fb (#312 K2, #314 K6b)
run_id: repin-20261008T103205Z-75569
sha: 8c62e048e6bd7e2971c583ce581ab5edc55238a5 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · diff chạm vật đo ngoài làn máy: E15 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 4 — 2026-10-09, do E1b: thước khong-re-theo-ten quét telemetry; E18 neo cặp sha gộp #206 (GDTT_MOC/GDTT_DINH)
run_id: repin-20261009T070020Z-72555
sha: 769f41d3840ed696607f6280bdd2116952b2711f · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · diff chạm vật đo ngoài làn máy: E15 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 5 — 2026-10-09, do E1b S4-r1: lệnh E18 mang mốc #206 trong config, ghim bằng lệnh trần
run_id: repin-20261009T072809Z-59479
sha: 95620666600b2cdfa259545532152515e13e06e5 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 6 — 2026-10-09, do gộp onehub 660f3e43 (#333 chạm components/crm) và 59d20767 trước PR E1b
run_id: repin-20261009T092332Z-44948
sha: 9c16c3a10d6f2bed26b9131f57cdfa986bc5b7c1 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · diff chạm vật đo ngoài làn máy: E15 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 7 — 2026-10-09, do gộp onehub 8439acad (#335) vào PR #336
run_id: repin-20261009T104155Z-29587
sha: 164969166c5f8dbb9212027b9def68b68821c3da · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 8 — 2026-10-09, do gộp onehub 291e0a88 (#337) vào PR #336
run_id: repin-20261009T111905Z-19985
sha: eeeed4a128b93638f9897ac1b9165aff5d5045a1 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · diff chạm vật đo ngoài làn máy: E15 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 9 — 2026-10-09, do thuoc-khong-tu-het-han sửa paths; hồ sơ hoá cũ do onehub đổi vật
run_id: repin-20261009T224054Z-34604
sha: 99ab35a30335c5f765410f94905e06d237d72c74 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E15 · diff chạm vật đo ngoài làn máy: E15 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
