---
schema_version: 2
feature_slug: kho-nguon-khong-ket
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d382739508bfad5a082f1de511782b618fc63fc
human_signoff: Phan Le Manh 2026-10-04 — ký Cổng 2 trên verdict PASS 8/8 eval máy (S4 round 1, wf_10611c45-af9). Ngoài-1, Ngoài-2, Ngoài-4 ghi Known limits; Ngoài-3 chấp nhận, không sửa; đồng ý phần cắt/hoãn; phê cả bốn quyết định Treo-1…Treo-4.
---

# Evidence Report: kho-nguon-khong-ket

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7u | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-kho-nguon-khong-ket-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4a_bat_loi
  verified_at: 2026-10-04T12:31:40Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tai-lieu-soan.integration.spec.ts -t kn-bat-loi"
    test-run: dropped crm_mutswbn7un8t_test
    __EXIT=0

- eval: E2
  run_id: minted-kho-nguon-khong-ket-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4a_mo_coi
  verified_at: 2026-10-04T12:31:40Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tai-lieu-nguon-mo-coi.integration.spec.ts"
    test-run: dropped crm_mutswd9icv4t_test
    __EXIT=0

- eval: E3
  run_id: minted-kho-nguon-khong-ket-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4a_soan_lai
  verified_at: 2026-10-04T12:31:40Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tai-lieu-nguon-mo-coi.integration.spec.ts -t kn-soan-lai && cd ../api && bun test test/tai-lieu-nguon.spec.ts -t kn-soan-lai"
    test-run: dropped crm_mutswdp5luj3_test
    __EXIT=0

- eval: E4
  run_id: minted-kho-nguon-khong-ket-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4a_loi_tim
  verified_at: 2026-10-04T12:31:40Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/trinh-soan-lien-ket.dom.tsx -t kn-loi-tim
    Ran 1 test across 1 file. [1.97s]
    __EXIT=0

- eval: E5
  run_id: minted-kho-nguon-khong-ket-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.l4a_chu
  verified_at: 2026-10-04T12:31:40Z
  output: |
    cmd: cd apps/app && bun test test/messages-guard.spec.ts test/tai-lieu-chu-lien-ket.spec.ts
    Ran 129 tests across 2 files. [843.00ms]
    __EXIT=0

- eval: E6
  run_id: minted-kho-nguon-khong-ket-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4a_tien_to
  verified_at: 2026-10-04T12:31:40Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-soan.dom.tsx -t kn-tien-to
    Ran 1 test across 1 file. [704.00ms]
    __EXIT=0

- eval: E7u
  run_id: minted-kho-nguon-khong-ket-E7u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l4a_man_lien_ket_loi
  verified_at: 2026-10-04T12:31:40Z
  screenshot: evidence/E7u-step1.png
  observed: |
    Da mo bang Read tung frame. E7u-step1.png (1440): man 'Trang moi', popover chen lien ket mo duoi nut tai lieu tren thanh cong cu, o tim chua 'zzkhongco', than popover hien dung 'Khong co trang nao khop.' (co dau) — khop expected buoc 1. E7u-step2.png (1440): o tim 'quy dinh', popover hien 'Chua tim duoc trang — thu go lai.' va KHONG co 'Khong co trang nao khop.' — khop buoc 2. E7u-step3.png (390, mobile): cung cau 'Chua tim duoc trang — thu go lai.' trong popover vua khung, popover nam gon trong chieu ngang man hinh, trang khong co thanh cuon ngang thay duoc — khop buoc 3 (va script bao khong tran). E7u-step4.png (1440): o tim 'quy dinh phep', danh sach hien mot dong 'Quy dinh nghi phep ktswkxf' (ten trang da gieo kem hau to ma luot), khong con cau loi — khop buoc 4. Khong frame nao mau thuan Expected.
  network_observed: n-a (driver)
  output: |
    Chieu do (--chieu-do, anh that khong bi ghi de): buoc 2 khong thay cau loi, man-lien-ket-loi bao hong, dung nhu expected.
    Frame da luu: _acceptance/kho-nguon-khong-ket/evidence/E7u-step1.png (rong-1440), E7u-step2.png (loi-1440), E7u-step3.png (loi-390), E7u-step4.png (hoi-phuc-1440).
    Network: driver la puppeteer script, khong doc duoc network trong phien nay.

- eval: E8
  run_id: mutswayqo8mp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.l4a_dem_ket
  verified_at: 2026-10-04T12:31:40Z
  output: |
    cmd: bun run test -- "bun test _acceptance/kho-nguon-khong-ket/rang/dem-ket.spec.ts"
    test-run: dropped crm_mutswayqo8mp_test
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kho-nguon-khong-ket-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-04T12:31:40Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kho-nguon-khong-ket-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-04T12:31:40Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kho-nguon-khong-ket-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-04T12:31:40Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kho-nguon-khong-ket-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T12:31:40Z

- cmd: bunx turbo run lint --force
  run_id: minted-kho-nguon-khong-ket-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T12:31:40Z

- cmd: bun run lint:slop
  run_id: minted-kho-nguon-khong-ket-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T12:31:40Z

- cmd: bunx turbo run build --force
  run_id: ""
  exit_code: 0
  verified_at: 2026-10-04T12:31:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

E5 (cd apps/app && bun test test/messages-guard.spec.ts test/tai-lieu-chu-lien-ket.spec.ts): baseline green — passes on both the branch and the diffBase tree, so it does not discriminate the feature by itself. Rewrite it to assert the new behaviour (the loiTim key in the vi and en groups) or confirm it is an intended regression guard.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all 8 evals pass (E1-E6, E7u, E8), all 7 suite commands pass; no failed evals.

### Re-pin lần 1 — 2026-10-04, do onehub dời (#252–#254) sau verify; ghim lại ở đỉnh trước merge
run_id: repin-20261004T152839Z-87008
sha: b119f4913fb20c3fd6d59a95f5f5fbbd1b75b764 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E7u · AC không có chốt máy: AC-7

### Re-pin lần 2 — 2026-10-13, do K6a trước gộp: gộp onehub 60fc1b02d, răng dem-ket nhận chữ mồ côi mới, sửa YAML E6 bo-ca-mau-quy-4
run_id: repin-20261013T233009Z-75646
sha: 13204dd159930a2913e1a176dba82bf70efa3ad3 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E7u · diff chạm vật đo ngoài làn máy: E7u — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-7 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-14, do gộp onehub c4c8ab0ab (#391 l3b) trước khi gộp #389; tai-lieu-lich-su.ts gọi Kara
run_id: repin-20261014T051016Z-89088
sha: 0d382739508bfad5a082f1de511782b618fc63fc · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E7u · diff chạm vật đo ngoài làn máy: E7u — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-7 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
