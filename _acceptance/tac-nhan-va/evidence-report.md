---
schema_version: 2
feature_slug: tac-nhan-va
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 30a53b3d459dee9b0ea9b7460d6853c753afed61
human_signoff:
---

# Evidence Report: tac-nhan-va

Vòng 1. Cả mười eval của hợp đồng đạt, nhưng hai lệnh suite hồi quy không gắn eval nào (`--filter=app --filter=@crm/ui` và `--filter=agent --filter=@crm/auth --filter=@crm/db`) thoát khác 0, nên kết luận chung là REJECT. `failed_evals` để trống vì không eval nào hỏng; hai lệnh suite hỏng được ghi ở mục «Lệnh suite (hồi quy)» bên dưới.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tac-nhan-va-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_chu_dom
  verified_at: 2026-10-14T05:18:36Z
  output: |
    Ran 7 tests across 1 file. [1385.00ms]

- eval: E2
  run_id: minted-tac-nhan-va-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_chu_dom
  verified_at: 2026-10-14T05:18:36Z
  output: |
    Ran 7 tests across 1 file. [1385.00ms]
    (cùng một lượt chạy với E1 và E3, lọc -t chu-tac-nhan|chu-luot|chu-thoa-thuan)

- eval: E3
  run_id: minted-tac-nhan-va-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_chu_dom
  verified_at: 2026-10-14T05:18:36Z
  output: |
    Ran 7 tests across 1 file. [1385.00ms]
    (cùng một lượt chạy với E1 và E2)

- eval: E4
  run_id: minted-tac-nhan-va-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tnv_man
  verified_at: 2026-10-14T05:18:36Z
  screenshot: evidence/E4-step1.png
  observed: |
    E4-step1 (ds-tac-nhan-375): tieu de 'Tác nhân của đội' + mo ta; mot the tac nhan 'Tác nhân đo E5 mv7nuonx', 'Đang bật', '1 lượt chạy'; nam tron trong 375, khong cuon ngang. E4-step2 (man-tac-nhan-375): hang nut (Lượt chạy 1, Mở trong hội thoại, Chạy ngay, Tạm dừng); chip ban ghi 'Công ty đo E5 có tên rất dài…' cat bang dau ba cham, nut x van thay, mep phai chip = vung chua (359), khong tran.
    E4-step3 (ngan-luot-chay-375): ngan 'Lịch sử' phu day khung 375, tab 'Lượt chạy 1 / Hoạt động 5', the 'Lượt #001 Hỏng' voi ly do tieng Viet 'Dịch vụ bên ngoài từ chối việc này. Thường chạy lại là được.', nut 'Chạy lại', khong cuon ngang (khong co bang thoa thuan trong ngan). E4-step4 (hoi-thoai-ket-qua-375): nhan buoc 'Xem lại các thoả thuận', 5 muc the Attio, Retool, Stripe, Ramp, Mercury — moi muc co ten '… — Comp AI', cong ty, giai doan (Contract sent / Qualified to buy / Decision maker in) va so tien (65.137,61 €, 116.438,36 CA$, 76.000 US$, 52.000 US$, 105.479,45 CA$), chan '5 thoả thuận · Còn kết quả nữa'; khong cuon ngang.
    E4-step5..8 (1440): danh sach mot dong tac nhan vua khung; man tac nhan day du, chip tren mot dong (mep 734 < 1416); ngan 'Lịch sử' tu x=544 den 1440, the 'Lượt #001 Hỏng' + ly do + 'Chạy lại' tren mot hang; hoi thoai co bang thoa thuan 5 hang (cot 'Phụ t…' bi cat trong vung cuon cua bang), khong tran trang. Ngoai le da ghi: ngan luot chay trong phien do hien luot Hong (khong chua bang thoa thuan) va chieu do tren cay truoc vong khong kiem o lan nay.
  network_observed: n-a (driver)
  output: |
    KET LUAN: 8 DUNG, 0 SAI.
    Frame luu: E4-step1..8.png = ds-tac-nhan-375, man-tac-nhan-375, ngan-luot-chay-375, hoi-thoai-ket-qua-375, ds-tac-nhan-1440, man-tac-nhan-1440, ngan-luot-chay-1440, hoi-thoai-ket-qua-1440.
    Server do phien do tu dung va tu don; khong con tien trinh o cong 3593/4439/4708.
    Luu y: chay tren cay hien tai nen khong kiem chieu do 'khong dat' cua cay truoc vong; script khong do rieng giai doan bang code (chi ten, cong ty, co chu so); 1440 cot 'Phu trach' bi cat trong vung cuon rieng cua bang, khong gay tran trang.

- eval: E5
  run_id: mv7nubdqwrph
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_cau_hoi
  verified_at: 2026-10-14T05:18:36Z
  output: |
    test-run: dropped crm_mv7nubdqwrph_test
    (cùng một lượt chạy với E6 và E7)

- eval: E6
  run_id: mv7nubdqwrph
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_cau_hoi
  verified_at: 2026-10-14T05:18:36Z
  output: |
    test-run: dropped crm_mv7nubdqwrph_test
    (cùng một lượt chạy với E5 và E7)

- eval: E7
  run_id: mv7nubdqwrph
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_cau_hoi
  verified_at: 2026-10-14T05:18:36Z
  output: |
    test-run: dropped crm_mv7nubdqwrph_test
    (cùng một lượt chạy với E5 và E6)

- eval: E8
  run_id: minted-tac-nhan-va-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_loi_dom
  verified_at: 2026-10-14T05:18:36Z
  output: |
    Ran 2 tests across 1 file. [767.00ms]

- eval: E9
  run_id: minted-tac-nhan-va-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tnv_khu_hoi
  verified_at: 2026-10-14T05:18:36Z
  output: |
    (eval):kill:1: kill 27607 failed: no such process
    (tác tử giả đã tự thoát trước lệnh kill cuối; không ảnh hưởng kết quả)

- eval: E10
  run_id: minted-tac-nhan-va-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_hoi_quy
  verified_at: 2026-10-14T05:18:36Z
  output: |
    Chuỗi lệnh khong-xoa-expect (--tu-thu, --moc 966eeb78e), các spec agent, hai ca eve-tran, các spec app và check-types chạy hết, thoát 0.

### Lệnh suite (hồi quy)

Năm lệnh xanh. Hai lệnh đỏ, không gắn eval nào:

- `bun run test -- --filter=app --filter=@crm/ui`: app#test báo 796 pass, 1 fail trên 797 test (77 tệp); dòng tên test hỏng không nằm trong đuôi log đã chụp, nguyên nhân chưa rõ.
- `bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db`: agent#test báo 1232 pass, 1 skip, 1 fail, 1 error trên 1234 test (129 tệp); dòng lỗi nguyên văn không nằm trong đuôi log đã chụp, nguyên nhân chưa rõ từ log suite. Finding ngoài hợp đồng về `apps/agent/test/tac-nhan-va.integration.spec.ts` ném lỗi lúc nạp khi thiếu `TNV_HAI_LUOT_RA` (đã kiểm tay ra «0 pass 1 fail 1 error») khớp con số này, xem review-findings.md.

- cmd: bun run test -- --filter=api
  run_id: minted-tac-nhan-va-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-14T05:18:36Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tac-nhan-va-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-14T05:18:36Z
  output: |
    app:test:  796 pass
    app:test:  1 fail
    app:test: Ran 797 tests across 77 files. [7.02s]
    Failed:    app#test

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tac-nhan-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 1
  verified_at: 2026-10-14T05:18:36Z
  output: |
    agent:test:  1232 pass
    agent:test: 1 skip
    agent:test: 1 fail
    agent:test: 1 error
    agent:test: Ran 1234 tests across 129 files. [112.88s]
    Failed:    agent#test

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tac-nhan-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-14T05:18:36Z

- cmd: bunx turbo run lint --force
  run_id: minted-tac-nhan-va-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-14T05:18:36Z

- cmd: bun run lint:slop
  run_id: minted-tac-nhan-va-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-14T05:18:36Z

- cmd: bunx turbo run build --force
  run_id: minted-tac-nhan-va-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-14T05:18:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào được đo xanh ở cả hai phía: baseline của cả mười eval đều là n-a (eval mới, tệp của chúng chưa có ở merge-base), nên chưa có eval nào được xác nhận là phân biệt được qua A/B.

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tac-nhan-va.dom.tsx -t "chu-tac-nhan|chu-luot|chu-thoa-thuan": bo qua baseline: tep apps/app/test/tac-nhan-va.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- mkdir -p .acceptance-runs/tac-nhan-va && TNV_HAI_LUOT_RA=$PWD/.acceptance-runs/tac-nhan-va/hai-luot-hoi.json bun apps/agent/test/eve-tran/chay.ts hai-luot-hoi && TNV_HAI_LUOT_RA=$PWD/.acceptance-runs/tac-nhan-va/hai-luot-hoi.json bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tac-nhan-va.integration.spec.ts -t cau-hoi": bo qua baseline: tep apps/agent/test/tac-nhan-va.integration.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tac-nhan-va.dom.tsx -t gui-hong: bo qua baseline: tep apps/app/test/tac-nhan-va.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- mkdir -p .acceptance-runs/tac-nhan-va && TNV_HAI_LUOT_RA=$PWD/.acceptance-runs/tac-nhan-va/hai-luot-hoi.json bun apps/agent/test/eve-tran/chay.ts hai-luot-hoi && bash -c ''export TNV_LUONG_DIR="$PWD/.acceptance-runs/tac-nhan-va/luong"; mkdir -p "$TNV_LUONG_DIR"; TAC_TU_GIA_PORT=3594 bun _acceptance/tac-nhan-va/rang/tac-tu-gia.ts & g=$!; AGENT_URL=http://127.0.0.1:3594 AGENT_BRIDGE_SECRET=bi-mat-do-tnv bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/tac-nhan-va/rang/khu-hoi.mjs"; m=$?; kill $g; exit $m'': bo qua baseline: tep _acceptance/tac-nhan-va/rang/tac-tu-gia.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs --tu-thu && bun _acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs --moc 966eeb78e && bun run test -- "cd apps/agent && bun test test/cau-hoi-het-han-muc.integration.spec.ts test/builder-runtime.integration.spec.ts test/stale-tasks.integration.spec.ts" && bun apps/agent/test/eve-tran/chay.ts chay-tiep chan-khuon && cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/agent-builder.spec.ts ./test/agent-results.spec.ts ./test/agent-transcript.spec.ts ./test/het-han-muc.dom.tsx && cd ../.. && bun run check-types: bo qua baseline: tep _acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: các eval E1–E10 đều đạt; hai lệnh suite hồi quy không gắn eval (app + @crm/ui, và agent + @crm/auth + @crm/db) đỏ, mỗi lệnh một test hỏng, nguyên nhân chưa rõ từ log suite. Trả về cho phần dựng.
