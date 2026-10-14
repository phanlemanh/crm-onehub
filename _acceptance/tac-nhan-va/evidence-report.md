---
schema_version: 2
feature_slug: tac-nhan-va
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a2306db41c39bc0740ffef15db0bf21dde921b58
human_signoff:
---

# Evidence Report: tac-nhan-va

Vòng 2. Mười eval của hợp đồng (E1 đến E10) đều chạy xong và đạt. Báo cáo bị REJECT vì một lệnh suite không gắn eval nào (`bunx turbo run lint --force`, gói `agent#lint`) thoát khác 0; xem mục «Lệnh suite (hồi quy)». `failed_evals` để trống vì lệnh đó không thuộc eval nào.

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
  run_id: minted-tac-nhan-va-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_chu_dom
  verified_at: 2026-10-14T06:26:59Z
  output: |
    Ran 7 tests across 1 file. [971.00ms]

- eval: E2
  run_id: minted-tac-nhan-va-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_chu_dom
  verified_at: 2026-10-14T06:26:59Z
  output: |
    Ran 7 tests across 1 file. [971.00ms]

- eval: E3
  run_id: minted-tac-nhan-va-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_chu_dom
  verified_at: 2026-10-14T06:26:59Z
  output: |
    Ran 7 tests across 1 file. [971.00ms]

- eval: E4
  run_id: E4-tac-nhan-va-2026-10-14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tnv_man
  verified_at: 2026-10-14T06:26:59Z
  screenshot: evidence/E4-step1.png
  observed: |
    step1 ds-tac-nhan-375: "Tác nhân của đội" heading. One card "Tác nhân đo E5 mv7q9vwvl" with green Đang bật status, summary text and "1 lượt chạy". No horizontal scroll and nothing clipped.
    step2 man-tac-nhan-375: agent screen. Title, buttons (Lượt chạy 1, Mở trong hội thoại, Chạy ngay, Tạm dừng). The "Nó thấy được gì" section shows the record chip for the 60-character company name, truncated with an ellipsis and a × button, fully inside the card (right edge 359 = container 359). The "Thêm một loại bản ghi" button sits below the chip. Nothing overflows.
    step3 ngan-luot-chay-375: "Lịch sử" drawer (about 281px wide) with tabs Lượt chạy 1 / Hoạt động 5. Run #001 shows red "Hỏng" and the reason "Dịch vụ bên ngoài từ chối việc này…" wrapped inside the card, with a Chạy lại button. No table in the drawer, so no horizontal overflow. The drawer's own table (56rem) is not exercised, see note 2.
    step4 hoi-thoai-ket-qua-375: conversation with the step label "Xem lại các thoả thuận". Five cards (Attio, Retool, Stripe, Ramp, Mercury, each "— Comp AI"). Each card shows name, company, stage (Contract sent, Qualified to buy, Decision maker in…) and an amount: 65.137,61 €, 116.438,36 CA$, 76.000 US$, 52.000 US$, 105.479,45 CA$. Footer "5 thoả thuận · Còn kết quả nữa". All five are within the viewport, no overflow.
    step5 ds-tac-nhan-1440: sidebar plus the list, with the agent as a single row (Đang bật, 1 lượt chạy). No overflow.
    step6 man-tac-nhan-1440: agent screen with the chip on one line (right edge 734, container 1416), toggle, and the instructions.md / manifest.json / README.md code panel. No overflow.
    step7 ngan-luot-chay-1440: drawer spanning x=544–1440, Run #001 Hỏng as a single row with the reason, "0 việc ra ngoài" and Chạy lại. No overflow.
    step8 hoi-thoai-ket-qua-1440: the 5-deal table with Thoả thuận / Công ty / Giai đoạn / Giá trị / Phụ trách columns (last column cut off by the table's own scroll), footer "5 thoả thuận". Matches Expected; nothing contradicts it.
  network_observed: n-a (driver)

- eval: E5
  run_id: mv7q9ghoyxoj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_cau_hoi
  verified_at: 2026-10-14T06:26:59Z
  output: |
    test-run: dropped crm_mv7q9ghoyxoj_test

- eval: E6
  run_id: mv7q9ghoyxoj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_cau_hoi
  verified_at: 2026-10-14T06:26:59Z
  output: |
    test-run: dropped crm_mv7q9ghoyxoj_test

- eval: E7
  run_id: mv7q9ghoyxoj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_cau_hoi
  verified_at: 2026-10-14T06:26:59Z
  output: |
    test-run: dropped crm_mv7q9ghoyxoj_test

- eval: E8
  run_id: minted-tac-nhan-va-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_loi_dom
  verified_at: 2026-10-14T06:26:59Z
  output: |
    Ran 3 tests across 1 file. [889.00ms]

- eval: E9
  run_id: minted-tac-nhan-va-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tnv_khu_hoi
  verified_at: 2026-10-14T06:26:59Z
  output: |
    (eval):kill:1: kill 39327 failed: no such process

- eval: E10
  run_id: minted-tac-nhan-va-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tnv_hoi_quy
  verified_at: 2026-10-14T06:26:59Z
  output: |
    (tệp nhật ký không có dòng nào ngoài mã thoát)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tac-nhan-va-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-14T06:26:59Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tac-nhan-va-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T06:26:59Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tac-nhan-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T06:26:59Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tac-nhan-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T06:26:59Z

- cmd: bunx turbo run lint --force
  run_id: minted-tac-nhan-va-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 1
  verified_at: 2026-10-14T06:26:59Z

- cmd: bun run lint:slop
  run_id: minted-tac-nhan-va-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T06:26:59Z

- cmd: bunx turbo run build --force
  run_id: minted-tac-nhan-va-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T06:26:59Z

Lệnh suite hỏng, không gắn eval nào: `bunx turbo run lint --force`. Turbo báo 8 trên 11 tác vụ thành công, tác vụ hỏng là `agent#lint` (`bun run lint` trong `apps/agent`). Dòng nguyên văn ở đuôi log: `error: script "lint" exited with code 1` và `Failed:    agent#lint`. Phần đuôi cho thấy bước `check` của linter in một diff định dạng của một tệp JSON (các dòng `-` là thụt bằng dấu cách, các dòng `+` là thụt bằng tab; có các khoá `callId`, `cau-hoi-hoi-thu-1`, `requestId`). Tên tệp bị cắt khỏi phần đuôi nên tệp cụ thể là chưa rõ; cần đọc log đầy đủ của `agent#lint`.

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt). Lưu ý: không eval nào được đo baseline vòng này (cả mười eval đều ghi baseline là n-a, xem mục dưới), nên chưa có eval nào được chứng minh red bằng phép đo.

Không có eval judgment, nên không có hội đồng chấm và không có mục chờ người chốt.

Hai lỗi trong hợp đồng do bước đọc phép đo tìm ra (AC-9 ở E9, AC-4 ở E4) nằm ở `review-findings.md`; chúng là nhận xét về độ mạnh của phép đo, không làm đổi kết quả máy của eval.

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tac-nhan-va.dom.tsx -t "chu-tac-nhan|chu-luot|chu-thoa-thuan": bo qua baseline: tep apps/app/test/tac-nhan-va.dom.tsx co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- mkdir -p .acceptance-runs/tac-nhan-va && TNV_HAI_LUOT_RA=$PWD/.acceptance-runs/tac-nhan-va/hai-luot-hoi.json bun apps/agent/test/eve-tran/chay.ts hai-luot-hoi && TNV_HAI_LUOT_RA=$PWD/.acceptance-runs/tac-nhan-va/hai-luot-hoi.json bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tac-nhan-va.integration.spec.ts -t cau-hoi": bo qua baseline: tep apps/agent/test/tac-nhan-va.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tac-nhan-va.dom.tsx -t gui-hong: bo qua baseline: tep apps/app/test/tac-nhan-va.dom.tsx co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- mkdir -p .acceptance-runs/tac-nhan-va && TNV_HAI_LUOT_RA=$PWD/.acceptance-runs/tac-nhan-va/hai-luot-hoi.json bun apps/agent/test/eve-tran/chay.ts hai-luot-hoi && bash -c ''export TNV_LUONG_DIR="$PWD/.acceptance-runs/tac-nhan-va/luong"; mkdir -p "$TNV_LUONG_DIR"; TAC_TU_GIA_PORT=3594 bun _acceptance/tac-nhan-va/rang/tac-tu-gia.ts & g=$!; AGENT_URL=http://127.0.0.1:3594 AGENT_BRIDGE_SECRET=bi-mat-do-tnv bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/tac-nhan-va/rang/khu-hoi.mjs"; m=$?; kill $g; exit $m'': bo qua baseline: tep _acceptance/tac-nhan-va/rang/tac-tu-gia.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs --tu-thu && bun _acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs --moc 966eeb78e && bun run test -- "cd apps/agent && bun test test/cau-hoi-het-han-muc.integration.spec.ts test/builder-runtime.integration.spec.ts test/stale-tasks.integration.spec.ts" && bun apps/agent/test/eve-tran/chay.ts chay-tiep chan-khuon && cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/agent-builder.spec.ts ./test/agent-results.spec.ts ./test/agent-transcript.spec.ts ./test/het-han-muc.dom.tsx && cd ../.. && bun run check-types: bo qua baseline: tep _acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT ở cây 30a53b3d4 — hai lệnh suite (`--filter=app --filter=@crm/ui` và `--filter=agent --filter=@crm/auth --filter=@crm/db`) thoát khác 0, kèm các phát hiện đo mức high ở E2 (ô lọc `<select>` cấp chữ) và E4 (số tiền đo bằng «có một chữ số», bỏ giai đoạn). Trả về cho bước làm.
Round 2: cây a2306db41 — mười eval đều đạt, sáu trên bảy lệnh suite đạt; `bunx turbo run lint --force` hỏng ở `agent#lint` (lỗi định dạng ở bước `check`, tệp cụ thể chưa rõ). Trả về cho bước làm.
