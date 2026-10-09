---
schema_version: 2
feature_slug: kara-gop-y-luot-2
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0a8bb9cdb4f1be1961579eaee1ebf6cdf4610848
human_signoff: Phan Le Manh 2026-10-09
---

# Evidence Report: kara-gop-y-luot-2

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
| E10b | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | script | PASS |
| E15 | AC-15 | script | PASS |
| E15b | AC-15 | script | PASS |
| E15c | AC-15 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-kara-gop-y-luot-2-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_khung
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 3 tests across 1 file. [2.08s]

- eval: E2
  run_id: minted-kara-gop-y-luot-2-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_tai_loi
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 2 tests across 1 file. [1.97s]

- eval: E3
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_nho_loi
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 1 test across 1 file. [2.05s]

- eval: E4
  run_id: minted-kara-gop-y-luot-2-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_qua_han
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 2 tests across 1 file. [2.33s]

- eval: E5
  run_id: minted-kara-gop-y-luot-2-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_tat
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 2 tests across 1 file. [2.63s]

- eval: E6
  run_id: minted-kara-gop-y-luot-2-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_loi_dong
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 1 test across 1 file. [3.83s]

- eval: E7
  run_id: minted-kara-gop-y-luot-2-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_can_chinh
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 2 tests across 1 file. [2.22s]

- eval: E8
  run_id: minted-kara-gop-y-luot-2-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_hai_hoan
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 1 test across 1 file. [1.94s]

- eval: E9
  run_id: minted-kara-gop-y-luot-2-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_chip
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 1 test across 1 file. [5.15s]

- eval: E10
  run_id: minted-kara-gop-y-luot-2-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_nhieu_kr
  verified_at: 2026-10-09T12:27:10Z
  output: |
    test-run: dropped crm_mv0xxpenusf1_test

- eval: E10b
  run_id: minted-kara-gop-y-luot-2-E10b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_nhieu_kr_ui
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 1 test across 1 file. [1116.00ms]

- eval: E11
  run_id: minted-kara-gop-y-luot-2-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_so_nhieu
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 3 tests across 1 file. [5.00ms]

- eval: E12
  run_id: minted-kara-gop-y-luot-2-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_cau_dan
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 1 test across 1 file. [1365.00ms]

- eval: E13
  run_id: minted-kara-gop-y-luot-2-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k3_neo_kr
  verified_at: 2026-10-09T12:27:10Z
  output: |
    Ran 3 tests across 1 file. [1.61s]

- eval: E14
  run_id: minted-kara-gop-y-luot-2-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k3_ngay_gio
  verified_at: 2026-10-09T12:27:10Z
  output: |
    ngay-gio: man dung 14/14 o khop mau

- eval: E15
  run_id: minted-kara-gop-y-luot-2-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k3_dot_bien
  verified_at: 2026-10-09T12:27:10Z
  output: |
    dot-bien: 8/8 vet bi bat, tep tra lai nguyen

- eval: E15b
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k3_ranh_gioi
  verified_at: 2026-10-09T12:27:10Z
  output: |
    ranh-gioi: 54 tep, 0 ngoai (neo nhanh-mo)

- eval: E15c
  run_id: minted-kara-gop-y-luot-2-E15c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k3_man
  verified_at: 2026-10-09T12:27:10Z
  screenshot: evidence/co-khung-1440.png
  observed: |
    Da mo 20 anh (10 trang thai x 2 kho 1440 va 390). Frame co-khung 1440: khung Muc tieu 'Giu da tang truong ban le mien Bac' o ben phai, vung Kara '4 gop y cho' cung khung voi 'VI SAO LUC NAY', co 1 bieu tuong tia sang, de xuat Them KR doi trong, Can chinh, Doi ten KR1 kem Bo qua. Cac frame dang-doc, qua-han, tai-loi, nho-loi, het-luot hien dung cau san pham co nut Thu lai (rieng het-luot nut Nho Kara xam kem cau noi mo lai luc 00:00, khong Thu lai), loi-dong khong ma tho, can-chinh-hoan co dong 'Hoan tac', neo-kr lam noi gop y cua KR3; khong frame nao mau thuan voi expected.
  network_observed: n-a (driver)
  output: |
    Assertion lan 2 deu DUNG: co-khung, neo-kr, loi-dong, can-chinh, tai-loi, hai-kr, dang-doc, qua-han, nho-loi, het-luot; moi trang thai x 2 kho (1440, 390) console khong loi ngoai yeu cau bi chan (0).
    20 frame da luu trong evidence/, driver puppeteer nen khong co read_network_requests.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kara-gop-y-luot-2-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T12:27:10Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kara-gop-y-luot-2-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T12:27:10Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kara-gop-y-luot-2-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T12:27:10Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kara-gop-y-luot-2-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T12:27:10Z

- cmd: bunx turbo run lint --force
  run_id: minted-kara-gop-y-luot-2-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T12:27:10Z

- cmd: bun run lint:slop
  run_id: minted-kara-gop-y-luot-2-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T12:27:10Z

- cmd: bunx turbo run build --force
  run_id: minted-kara-gop-y-luot-2-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T12:27:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval xanh, khong eval nao fail, khong judgment item cho nguoi. Verdict PASS.

### Re-pin lần 1 — 2026-10-09, do gộp onehub a9e8bc75 (#339) sau chữ ký Cổng 2; mở đường PR
run_id: repin-20261009T143021Z-87860
sha: 9f706b3a79fc2fb8f5bbb7ebdf2d9d7a8a52bc5a · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E15c · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-09, do gộp onehub 2d7c4898 (#340) cho PR #342
run_id: repin-20261009T153307Z-26171
sha: 4881672fbfdf00e7a9d70d88e15671a664ce5d25 · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E15c · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-09, do gộp onehub 5a36e199 (#341) qua pr342-cap-nhat cho PR #342
run_id: repin-20261009T160126Z-21534
sha: 0a8bb9cdb4f1be1961579eaee1ebf6cdf4610848 · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E15c · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
