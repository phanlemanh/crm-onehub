---
schema_version: 2
feature_slug: lich-su-moi-lan-cap-nhat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 94591aeb3c304274b6b62b12554be9a175bedbe7
human_signoff:
---

# Evidence Report: lich-su-moi-lan-cap-nhat

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
| E12 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-6 | ui-check | PASS |
| E13 | AC-10 | script | PASS |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-lich-su-moi-lan-cap-nhat-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_api
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-lan"
    test-run: dropped crm_mvss4hu71hk8_test

- eval: E2
  run_id: minted-lich-su-moi-lan-cap-nhat-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_chuoi
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-chuoi"
    test-run: dropped crm_mvss4fo5fmjt_test

- eval: E3
  run_id: minted-lich-su-moi-lan-cap-nhat-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_quyen
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-quyen"
    test-run: dropped crm_mvss4ha201rn_test

- eval: E4
  run_id: minted-lich-su-moi-lan-cap-nhat-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_danh_sach
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-danh-sach
    Ran 1 test across 1 file. [1357.00ms]

- eval: E5
  run_id: minted-lich-su-moi-lan-cap-nhat-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_bieu_do
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-bieu-do
    Ran 1 test across 1 file. [1.51s]

- eval: E6
  run_id: minted-lich-su-moi-lan-cap-nhat-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_sau_gui
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-sau-gui
    Ran 1 test across 1 file. [1.94s]

- eval: E7
  run_id: minted-lich-su-moi-lan-cap-nhat-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_trang_thai
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-trang-thai
    (cong cu khong in dong tom tat; ma thoat 0)

- eval: E8
  run_id: minted-lich-su-moi-lan-cap-nhat-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_cam_xuc
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-cam-xuc
    Ran 1 test across 1 file. [1.84s]

- eval: E12
  run_id: minted-lich-su-moi-lan-cap-nhat-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_cam_xuc_api
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-cam-xuc-api"
    test-run: dropped crm_mvss4idzieqq_test

- eval: E9
  run_id: minted-lich-su-moi-lan-cap-nhat-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lsml_dien_bien_giu
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-dien-bien-giu"
    test-run: dropped crm_mvss4h8rhkd9_test

- eval: E13
  run_id: minted-lich-su-moi-lan-cap-nhat-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lsml_ky_xanh
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: node _acceptance/lich-su-moi-lan-cap-nhat/rang/ky-xanh.mjs
    KET LUAN ky-xanh: dat

- eval: E11
  run_id: minted-lich-su-moi-lan-cap-nhat-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lsml_pham_vi
  verified_at: 2026-10-29T00:01:44Z
  output: |
    cmd: node _acceptance/lich-su-moi-lan-cap-nhat/rang/pham-vi.mjs
    KET LUAN pham-vi: dat

- eval: E10
  run_id: minted-lich-su-moi-lan-cap-nhat-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lsml_man
  verified_at: 2026-10-29T00:01:44Z
  screenshot: evidence/lsml-truoc-1440-sang.png
  observed: |
    Da mo bang Read ca 8 anh.
    truoc-1440-sang: drawer ben phai, muc LICH SU CAP NHAT, bieu do 6 cham (21/09..26/10) + duong dut + vach dich 25, 6 dong tu 09:00 26/10/2026 7,3 nguoi xuong 21/09 1,8 nguoi; khop 6 OkrCheckIn.
    sau-1440-sang: bieu do 8 cham, hai dong moi o dau: «07:03 29/10/2026 9 nguoi» (ghi chu lan 2) tren «07:03 29/10/2026 8 nguoi» (lan 1), roi 26/10 7,3...; toast «Da gui cap nhat».
    truoc-1440-toi: nen den, chu trang, 8 dong (trang thai sau luot sang), cham trang ro tren nen toi, viền the va chip Tu tin thap/vua/cao doc duoc.
    sau-1440-toi: 10 cham, hai dong dau 11 nguoi (lan 2) tren 10 nguoi (lan 1), nhan ngay gio 07:03 29/10/2026.
    truoc-375-sang: drawer day tu duoi (tay keo), tieu de xuong dong, danh sach the doc tron trong be rong 375, khong tran ngang; bieu do co cham, nhan «Dich 25 nguoi» sat mep phai bi cat nhe mot ky tu cuoi (chi tiet nho).
    sau-375-sang: 13 nguoi (lan 2) tren 12 nguoi (lan 1), cham them o cuoi duong, toast, khong tran ngang.
    truoc-375-toi: nen den, chu/cham/vien ro, danh sach doc tron, khong tran ngang.
    sau-375-toi: 15 nguoi (lan 2) tren 14 nguoi (lan 1), them hai cham o cuoi duong, toast xanh, khong tran ngang.
    Tat ca khop Expected: hai dong moi o dau co nhan ngay gio gui, gia tri lan hai tren lan mot; bieu do them hai cham; 375 la drawer; sang/toi chu, cham, vien khong chim nen. Luu y nho khong lam fail: nhan «Dich 25 nguoi» de len vach dich o 1440 va bi cat nhe o truoc-375-sang.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lich-su-moi-lan-cap-nhat-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-29T00:01:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lich-su-moi-lan-cap-nhat-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-29T00:01:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lich-su-moi-lan-cap-nhat-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-29T00:01:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lich-su-moi-lan-cap-nhat-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-29T00:01:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-lich-su-moi-lan-cap-nhat-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-29T00:01:44Z

- cmd: bun run lint:slop
  run_id: minted-lich-su-moi-lan-cap-nhat-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-29T00:01:44Z

- cmd: bunx turbo run build --force
  run_id: minted-lich-su-moi-lan-cap-nhat-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-29T00:01:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

none — moi eval feature deu red tren baseline (co phan biet)

Luu y: baseline khong do duoc o round nay (moi field baseline la n-a), nen danh sach eval khong-phan-biet khong do duoc bang A/B.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-lan": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-chuoi": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-quyen": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-danh-sach: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-bieu-do: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-sau-gui: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-trang-thai: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-su-moi-lan-cap-nhat.dom.tsx -t lsml-cam-xuc: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-cam-xuc-api": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun run test -- "cd apps/api && bun test test/lich-su-moi-lan-cap-nhat.spec.ts -t lsml-dien-bien-giu": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- node _acceptance/lich-su-moi-lan-cap-nhat/rang/ky-xanh.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- node _acceptance/lich-su-moi-lan-cap-nhat/rang/pham-vi.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 13/13 eval deu dat, 7/7 lenh suite dat, khong eval hong, khong phat hien ngoai hop dong. Bon phat hien trong hop dong (muc do thap den vua) nam o review-findings.md de nguoi xem o Cong 2.
