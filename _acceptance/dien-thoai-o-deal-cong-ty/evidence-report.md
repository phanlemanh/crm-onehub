---
schema_version: 2
feature_slug: dien-thoai-o-deal-cong-ty
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ed4d8ce2f7267b2820bf7a4c76407b32076fa24f
human_signoff: Phan Le Manh 2026-10-10
---

# Evidence Report: dien-thoai-o-deal-cong-ty

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: mv20iny6x101
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt2_api
  verified_at: 2026-10-10T06:27:32Z
  output: |
    dien-thoai-o-deal-cong-ty.spec.ts, describe "deal-co-so": ma tran 3 dong (byId P, byId Q, contactOptions R) dung.
    test-run: dropped crm_mv20iny6x101_test

- eval: E2
  run_id: mv20iny6x101
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt2_api
  verified_at: 2026-10-10T06:27:32Z
  output: |
    Cung lenh voi E1, describe "cong-ty-co-so": companyDetailOutput parse, contacts P co so, Q khong so.
    test-run: dropped crm_mv20iny6x101_test

- eval: E3
  run_id: minted-dien-thoai-o-deal-cong-ty-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dt2_do_man
  verified_at: 2026-10-10T06:27:32Z
  screenshot: evidence/deal-bang-1440.png
  observed: |
    deal-bang-1440.png (da mo bang Read): deal sheet "DT2 mv20jaxg Deal", tab Ca nhan 2; tieu de cot bang nguoi theo thu tu Ten, Dien thoai, Vai tro, Chuc danh, Email. Dong P hien "0903 695 591" (in tho, dang 0xxx xxx xxx), dong Q o Dien thoai la "—". Khop Expected.
    deal-bang-375.png (da mo bang Read): kho 375, bottom sheet, cung thu tu cot; so P "0903 695 591" hien du tren mot dong, khong bi cat; o Q "—". Ten nguoi va cot Vai tro/Chuc danh bi cat gon, tieu de Chuc danh/Email hoi sat nhau o 375 (nhan xet tham my, ngoai Expected cua E3). Lenh do in scrollWidth 129 = clientWidth 129, cao 16 = mot dong, rect chu trong o = true.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-dien-thoai-o-deal-cong-ty-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dt2_do_man
  verified_at: 2026-10-10T06:27:32Z
  screenshot: evidence/E4-step1.png
  observed: |
    cong-ty-bang-1440.png (E4-step1.png la ban sao, da mo bang Read): sheet "DT2 mv20jtm8 Co", tab Cá nhân 3. Tieu de cot: Tên, Điện thoại, Chức danh, Email, Phụ trách — cot Điện thoại ngay sau Tên.
    Dong P: «0903 719 802» (dang 0xxx xxx xxx), Trưởng phòng; dong Q: Điện thoại «—», Kế toán; dong R: «0913 719 808». Cot Chức danh, Email, Phụ trách con day du. Khop Expected.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-dien-thoai-o-deal-cong-ty-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt2_chon
  verified_at: 2026-10-10T06:27:32Z
  output: |
    dien-thoai-o-deal-cong-ty.dom.tsx, describe "chon-nguoi": ba lua chon A, B, C hien ten · chuc danh · so, bo ve trong.
    Ran 1 test across 1 file. [1086.00ms]

- eval: E5b
  run_id: minted-dien-thoai-o-deal-cong-ty-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dt2_do_man
  verified_at: 2026-10-10T06:27:32Z
  screenshot: evidence/E5b-step1.png
  observed: |
    E5b-step1.png (ban sao chon-nguoi-1440.png, da mo bang Read): ngan thoa thuan "DT2 mv20kv2t Deal" o 1440, theme toi, the Cá nhân 2; o chon "Chọn một người" mo xuong lua chon "DT2 mv20kv2t R · 0913 768 375" (so dang 0xxx xxx xxx canh ten). Bang ben duoi co cot Tên, Điện thoại, Vai trò, Chức danh, Email (P 0903 768 366, Q —) va lien ket «+ Thêm cá nhân». Khop Expected.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-dien-thoai-o-deal-cong-ty-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dt2_do_man
  verified_at: 2026-10-10T06:27:32Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (deal-bang-en-1440, da mo bang Read): ngan thoa thuan "DT2 mv20kcii Deal" tieng Anh (Overview/Contacts 2/Activity/Kara, nut "Add contact"); tieu de cot Name, Phone, Role, Title, Email. DP «0903 744 293», DQ o Phone la «—». Cot sau Name la Phone.
    E6-step2.png (cong-ty-bang-en-1440): ngan cong ty "DT2 mv20kcii Co" tab Contacts 3, tieng Anh; tieu de cot Name, Phone, Title, Email, Owner. DP «0903 744 293», DQ «—», DR «0913 744 301»; khong con tieu de tieng Viet «Điện thoại». Khop Expected.
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-dien-thoai-o-deal-cong-ty-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dt2_san_thiet_ke
  verified_at: 2026-10-10T06:27:32Z
  output: |
    design-gate.mjs --mode static cho deal-sheet.tsx, company-sheet.tsx, quick-add.tsx: khong P0.
    dung-so-chung: DUNG — hai bang dung thanh phan hien so chung

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dien-thoai-o-deal-cong-ty-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-10T06:27:32Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dien-thoai-o-deal-cong-ty-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-10T06:27:32Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dien-thoai-o-deal-cong-ty-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-10T06:27:32Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dien-thoai-o-deal-cong-ty-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-10T06:27:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-dien-thoai-o-deal-cong-ty-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-10T06:27:32Z

- cmd: bun run lint:slop
  run_id: minted-dien-thoai-o-deal-cong-ty-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-10T06:27:32Z

- cmd: bunx turbo run build --force
  run_id: minted-dien-thoai-o-deal-cong-ty-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-10T06:27:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5, E5b, E6, E7 deu dat tren cay ed4d8ce2f7267b2820bf7a4c76407b32076fa24f; bay lenh suite xanh; khong eval nao chay nhieu lan, khong co eval can nguoi chot.
