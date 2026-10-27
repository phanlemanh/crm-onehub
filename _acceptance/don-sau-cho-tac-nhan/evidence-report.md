---
schema_version: 2
feature_slug: don-sau-cho-tac-nhan
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e7f054530a483ec700b838a521f708e939c578c7
human_signoff:
---

# Evidence Report: don-sau-cho-tac-nhan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-don-sau-cho-tac-nhan-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsctn_noi_song
  verified_at: 2026-10-27T08:29:39Z
  output: |
    cd apps/app && bun test ./test/the-dang-dung-noi-song.spec.ts
    Ran 11 tests across 1 file. [267.00ms]

- eval: E2
  run_id: minted-don-sau-cho-tac-nhan-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsctn_the_ui
  verified_at: 2026-10-27T08:29:39Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/the-dang-dung.dom.tsx
    Ran 1 test across 1 file. [553.00ms]

- eval: E3
  run_id: minted-don-sau-cho-tac-nhan-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsctn_noi_dung
  verified_at: 2026-10-27T08:29:39Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/the-dang-dung.dom.tsx
    Ran 6 tests across 1 file. [372.00ms]

- eval: E4
  run_id: minted-don-sau-cho-tac-nhan-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsctn_k7_nguyen
  verified_at: 2026-10-27T08:29:39Z
  output: |
    git diff trên apps/app/test/cho-tac-nhan-lau.dom.tsx so với merge-base origin/onehub: không đổi
    Ran 6 tests across 1 file. [4.46s]

- eval: E5
  run_id: minted-don-sau-cho-tac-nhan-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dsctn_do_man
  verified_at: 2026-10-27T08:29:39Z
  screenshot: evidence/E5-step1.png
  observed: |
    E5-step1 (tren nguong, 1280): the "Đang dựng tác nhân" co dong ho "Đã 4:27" va "1 trên 4" o hang tieu de; bon buoc theo thu tu Phạm vi (Xong, dau tich) · Chỉ dẫn (Đang làm, dong dang chon) · 3 Bản khai (Đang xếp) · 4 Soát lại (Đang xếp); dong "Đã quá 3 phút. Kara vẫn đang dựng." ben trong the duoi bon buoc; duoi the co cau roi trang "Bạn có thể rời trang. Kara sẽ báo trong hộp thông báo khi xong." va nut "Dừng". Khong chu chong, khong cat chu.
    E5-step2 (tren nguong, 375): cung noi dung: "Đã 4:30", "1 trên 4", bon buoc dung thu tu, dong "Đã quá 3 phút. Kara vẫn đang dựng.", cau roi trang xuong 2 dong canh nut "Dừng". Khong tran ngang (trang vua khung 375), khong cat chu.
    E5-step3 (duoi nguong, 1280): "Đã 0:06", "1 trên 4", bon buoc, KHONG co dong "Đã quá 3 phút"; cau roi trang va nut "Dừng" co mat.
    E5-step4 (duoi nguong, 375): "Đã 0:06", "1 trên 4", bon buoc, khong co dong qua nguong, cau roi trang 2 dong + nut "Dừng"; khong tran ngang.
    Doi chieu truoc/sau (anh K7): moi chu va thu tu trung nhau o ca 4 cap; vi tri tuong doi trong the (tieu de-> the -> vach -> nut) gan nhu giong het (the cao 217px co dong qua nguong, 193px khong, o 1280; vach ngan cach cach duoi the 13px o ca hai ban); khong thay khac ve chu hay thu tu. Khac biet nhin thay chi la ngoai the: thanh ben Hoi thoai rong 224px thay vi 213px, danh sach hoi thoai/thanh nhom doi theo lan chay — khong thuoc the "Đang dựng tác nhân", nam ngoai pham vi E5. Khong thay khoang dong ho-tien do gan hon / cau roi trang cach nut xa hon ro ret so voi anh truoc; Expected chi cho phep (khong bat buoc) khoang o dau va chan the khac, nen khong mau thuan.
  network_observed: n-a (driver)
  output: |
    Assertion doc anh (Read): 4/4 anh dung Expected; doi chieu cap truoc/sau (anh K7 _acceptance/cho-tac-nhan-lau/evidence/{tren,duoi}-nguong-{1280,375}.png) cung kho va trang thai: PASS.
    Frame da luu: evidence/E5-step1.png (tren-nguong-1280), E5-step2.png (tren-nguong-375), E5-step3.png (duoi-nguong-1280), E5-step4.png (duoi-nguong-375). Goc: .acceptance-runs/don-sau-cho-tac-nhan/evidence/.
    Capture bang bai do-man.mjs cua lenh duoc giao (puppeteer, phien do rieng kho crm_youthful_dirac_f5249a_do, app :4817, api :4787, tu don khi xong).

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-don-sau-cho-tac-nhan-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-27T08:29:39Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-don-sau-cho-tac-nhan-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-27T08:29:39Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-don-sau-cho-tac-nhan-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-27T08:29:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-don-sau-cho-tac-nhan-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-27T08:29:39Z

- cmd: bunx turbo run lint --force
  run_id: minted-don-sau-cho-tac-nhan-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-27T08:29:39Z

- cmd: bun run lint:slop
  run_id: minted-don-sau-cho-tac-nhan-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-27T08:29:39Z

- cmd: bunx turbo run build --force
  run_id: minted-don-sau-cho-tac-nhan-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-27T08:29:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline khong do:
- cd apps/app && bun test ./test/the-dang-dung-noi-song.spec.ts: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/the-dang-dung.dom.tsx: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/the-dang-dung.dom.tsx: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- git diff --exit-code "$(git merge-base HEAD origin/onehub)" -- apps/app/test/cho-tac-nhan-lau.dom.tsx && cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cho-tac-nhan-lau.dom.tsx: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt: không đo được ở round này (baseline BLOCKED hạ tầng, mọi eval baseline n-a); không có căn cứ để kết luận eval nào xanh trên cả hai phía.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, deterministic).

## Iterations

Round 1: E1, E2, E3, E4, E5 đều xanh, không eval nào hỏng. Baseline không đo được (BLOCKED hạ tầng).
