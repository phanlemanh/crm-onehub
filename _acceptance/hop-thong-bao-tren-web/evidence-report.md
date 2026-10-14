---
schema_version: 2
feature_slug: hop-thong-bao-tren-web
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b3a49cfd970f61d055c67aea5ef74c5ce31f1c54
human_signoff:
---

# Evidence Report: hop-thong-bao-tren-web

Lệnh suite không gắn eval nào bị đỏ: `bun run test -- --filter=api` (mã thoát khác 0). Không eval nào của hợp đồng đỏ; verdict REJECT do lệnh suite này. Một bài kiểm hết thời gian sau 60000ms: `vai-chi-okr > duong-ngoai-router`. Toàn gói api: 1806 qua, 5 bỏ qua, 1 đỏ. Chi tiết ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | judgment | PASS |
| E14 | AC-4 | ui-check | PASS |
| E15 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: mv7qovoeuqrw
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_ghi
  verified_at: 2026-10-14T06:38:52Z
  output: |
    test-run: dropped crm_mv7qovoeuqrw_test

- eval: E2
  run_id: mv7qowl0lyg8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_gop
  verified_at: 2026-10-14T06:38:52Z
  output: |
    test-run: dropped crm_mv7qowl0lyg8_test

- eval: E3
  run_id: minted-hop-thong-bao-tren-web-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_kenh
  verified_at: 2026-10-14T06:38:52Z
  output: |
    test-run: dropped crm_mv7qoxjcmiyt_test

- eval: E4
  run_id: minted-hop-thong-bao-tren-web-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_chuong
  verified_at: 2026-10-14T06:38:52Z
  output: |
    Ran 19 tests across 1 file. [2.61s]

- eval: E5
  run_id: minted-hop-thong-bao-tren-web-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_chuong
  verified_at: 2026-10-14T06:38:52Z
  output: |
    Ran 19 tests across 1 file. [2.61s]

- eval: E6
  run_id: minted-hop-thong-bao-tren-web-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_api
  verified_at: 2026-10-14T06:38:52Z
  output: |
    test-run: dropped crm_mv7qowv8gx7g_test

- eval: E6b
  run_id: minted-hop-thong-bao-tren-web-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_chuong
  verified_at: 2026-10-14T06:38:52Z
  output: |
    Ran 19 tests across 1 file. [2.61s]

- eval: E7
  run_id: minted-hop-thong-bao-tren-web-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_api
  verified_at: 2026-10-14T06:38:52Z
  output: |
    test-run: dropped crm_mv7qowv8gx7g_test

- eval: E7b
  run_id: minted-hop-thong-bao-tren-web-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_chuong
  verified_at: 2026-10-14T06:38:52Z
  output: |
    Ran 19 tests across 1 file. [2.61s]

- eval: E8
  run_id: minted-hop-thong-bao-tren-web-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_trang
  verified_at: 2026-10-14T06:38:52Z
  output: |
    Ran 6 tests across 1 file. [1442.00ms]

- eval: E9
  run_id: minted-hop-thong-bao-tren-web-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_api
  verified_at: 2026-10-14T06:38:52Z
  output: |
    test-run: dropped crm_mv7qowv8gx7g_test

- eval: E10
  run_id: mv7qoxw6ipgz
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_duong
  verified_at: 2026-10-14T06:38:52Z
  output: |
    Ran 1 test across 1 file. [35.00ms]

- eval: E10b
  run_id: minted-hop-thong-bao-tren-web-E10b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_mat_dich
  verified_at: 2026-10-14T06:38:52Z
  output: |
    (đuôi đầu ra trống; ba lệnh bun test nối bằng && đều qua)

- eval: E11
  run_id: mv7qox8h92ek
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_don
  verified_at: 2026-10-14T06:38:52Z
  output: |
    test-run: dropped crm_mv7qox8h92ek_test

- eval: E12
  run_id: mv7qouxz3m9t
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_doi_chieu
  verified_at: 2026-10-14T06:38:52Z
  output: |
    test-run: dropped crm_mv7qouxz3m9t_test

- eval: E13
  judged_by: judge panel (3 góc nhìn, fresh context): domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Cả ba góc nhìn đều thấy CONTEXT.md có mục «Thông báo» riêng, khớp tệp thiết kế; mục «Nhắc buổi sáng» không còn câu cũ nói ngược; hai mục tách rõ nhắc qua Zalo hoặc Slack với thông báo trong chuông.
  votes:
    - domain-correctness: PASS — (a) mục «Thông báo» nói thông báo là một dòng CRM ghi cho một người, nằm ở chuông và trang Thông báo, có trạng thái đã đọc; mỗi mục nhắc thành một thông báo cho mọi người kể cả người chưa nối Zalo hay Slack. (b) tìm "bảng thông báo" và "không có bảng" trong CONTEXT.md không ra dòng nào; mục Nhắc buổi sáng chỉ sang chuông. (c) nhắc là một tin gom gửi qua kênh ngoài CRM, thông báo là từng mục lưu trong CRM.
    - operational-feasibility: PASS — mục riêng «Thông báo» khớp một câu và mục L1–L2 của tệp thiết kế; mục Nhắc buổi sáng không còn câu «kho không có bảng thông báo»; dòng «Vì sao» dẫn sang chuông và Zalo/Slack nên người dùng phòng ban phân biệt được.
    - spec-alignment: PASS — mục «Thông báo» (dòng 310-317) và «Nhắc buổi sáng» (dòng 300-308) khớp «Một câu», L1, L3 của tệp thiết kế; không còn câu ngược; hai mục tách rõ tin riêng qua Zalo hoặc Slack với dòng trong chuông.
  human_override:  # chi nguoi ghi

- eval: E14
  run_id: minted-hop-thong-bao-tren-web-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htb_do_man
  verified_at: 2026-10-14T06:38:52Z
  screenshot: evidence/E14-step1.png
  observed: |
    chuong-tong-quan-1280: man Chao ban 1280px, o dau trang co chuong voi so "2" canh nut Dang tra cuu / Gui tin hieu; bang "Viec qua han - 2 viec" liet ke hai viec Do man (gui bao gia Hoa Phat, chot lich ky Vinamilk) khop so 2.
    chuong-okr-1280: man "OKR cua toi" (trang thai rong, quan tri chua mo chu ky), chuong van hien o dau trang voi so "2".
    chuong-viec-1280: man "Viec cua toi", tab "Giao cho toi 2", bang hai viec Do man qua han, chuong hien so "2".
    mo-1280: o bat ra "Thong bao" duoi chuong, nut "Danh dau tat ca da doc", nhom "Hom nay", hai dong "Viec «Do man: gui bao gia Hoa Phat» da qua han 2 ngay" va "Viec «Do man: chot lich ky Vinamilk» da qua han 3 ngay", moi dong co gio 13:39, cuoi o co "Xem tat ca"; o nam tron trong khung nhin.
    bam-1280: sau khi bam dong Viec, ngan ben phai mo "Do man: gui bao gia Hoa Phat" (Viec rieng, nguoi giao Ada Okafor), chuong o dau trang da nhin thay (so giam theo assertion 2->1; script xac nhan record=viec:<id da gieo>).
    doc-het-1280: chuong o dau trang khong con so sau khi danh dau tat ca da doc va tai lai; danh sach Viec cua toi van 2 dong.
    chuong-375: khung 375x812, o bat ra "Thong bao" voi nhom "Hom nay" va hai dong viec, nam tron tu mep trai den ~360px, khong tran ngang, khong thanh cuon ngang.
    trang-375: /thong-bao o 375px, hai chip "Tat ca" / "Chua doc" voi "Chua doc" dang chon, hien trang thai rong "Ban da doc het" (dung vi da doc het truoc do), khong cuon ngang.
    trang-1280: /thong-bao 1280px, tieu de Thong bao, chip Tat ca dang chon, nhom "Hom nay" voi hai dong viec qua han va gio 13:39. Tat ca khop Expected; khong co anh nao mau thuan.
  network_observed: n-a (driver)

- eval: E15
  run_id: design-gate-6f686b415c, design-gate-3692c341b4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htb_thiet_ke
  verified_at: 2026-10-14T06:38:52Z
  output: |
    (đuôi đầu ra chỉ còn dấu đóng khối JSON; kết quả lấy từ mã thoát 0 của cả vòng lặp design-gate tĩnh trên từng tệp)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-14T06:38:52Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-14T06:38:52Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-14T06:38:52Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-14T06:38:52Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-thong-bao-tren-web-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-14T06:38:52Z

- cmd: bun run lint:slop
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-14T06:38:52Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-thong-bao-tren-web-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-14T06:38:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả hai phía (HEAD và baseline). Lưu ý: baseline của mọi eval feature là n-a, nên chưa có bằng chứng «red trên baseline»; lý do ở mục dưới.

Baseline không đo

- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-ghi": bo qua baseline: tep apps/agent/test/thong-bao-ghi.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-gop": bo qua baseline: tep apps/agent/test/thong-bao-ghi.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-kenh && TZ=Asia/Ho_Chi_Minh bun test test/nhac-qua-zalo.integration.spec.ts test/nhac-viec.integration.spec.ts": bo qua baseline: tep apps/agent/test/thong-bao-ghi.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/thong-bao.dom.tsx -t chuong: bo qua baseline: tep apps/app/test/thong-bao.dom.tsx co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao.spec.ts test/vai-chi-okr.spec.ts": bo qua baseline: tep apps/api/test/thong-bao.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/thong-bao.dom.tsx -t trang: bo qua baseline: tep apps/app/test/thong-bao.dom.tsx co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-duong.spec.ts" && cd apps/app && bun test ./test/thong-bao-cau.spec.ts: bo qua baseline: tep apps/agent/test/thong-bao-duong.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/thong-bao-mat-dich.dom.tsx && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-loi-ban-ghi-dung-ly-do.dom.tsx -t 'klg-khong-con|klg-khong-quyen' && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-gioi-han-duyet.dom.tsx -t khong-thay: bo qua baseline: tep apps/app/test/thong-bao-mat-dich.dom.tsx co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-don": bo qua baseline: tep apps/agent/test/thong-bao-ghi.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-doi-chieu.integration.spec.ts": bo qua baseline: tep apps/agent/test/thong-bao-doi-chieu.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- for f in apps/app/components/thong-bao/*.tsx "apps/app/app/(app)/[slug]/thong-bao/page.tsx"; do node ${CLAUDE_PLUGIN_ROOT:-$(node scripts/resolve-plugin.mjs --plugin acceptance-gate --require scripts/design-gate.mjs --require scripts/design-scan.js)}/scripts/design-gate.mjs --target "$f" --mode static || exit 1; done: bo qua baseline: tep apps/app/app/(app)/[slug]/thong-bao/page.tsx co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào của hợp đồng đỏ (failed_evals rỗng). Lệnh suite `bun run test -- --filter=api` đỏ và không gắn eval: 1806 bài qua, 5 bỏ qua, 1 đỏ — `vai-chi-okr > duong-ngoai-router` hết thời gian sau 60000ms. Cùng tệp `test/vai-chi-okr.spec.ts` đã qua khi chạy riêng trong lệnh của E6, E7, E9; chưa kết luận được là lỗi mã hay chập chờn do tải, cần chạy lại lượt mới. review-findings.md còn hai mục trong hợp đồng (AC-12, AC-2). Returned to implementation.
