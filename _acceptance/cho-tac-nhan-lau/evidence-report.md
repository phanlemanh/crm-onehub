---
schema_version: 2
feature_slug: cho-tac-nhan-lau
verdict: REJECT
failed_evals: ["E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c7c3de766cf37442c175be5cfaac65963376d0f0
human_signoff:
---

# Evidence Report: cho-tac-nhan-lau

Round 1. Kết quả REJECT: E9 (thước màn) đỏ vì thiếu khung chứng minh vế (1) của Expected. Thêm một lệnh suite (`bun run test -- --filter=app --filter=@crm/ui`) đỏ ở 3 bài kiểm không gắn eval nào, xem mục «Lệnh suite (hồi quy)».

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
| E9 | AC-9 | ui-check | FAIL |
| E10 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cho-tac-nhan-lau-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_the_dung
  verified_at: 2026-10-16T08:16:21Z
  output: |
    Ran 6 tests across 1 file. [1.70s]

- eval: E2
  run_id: minted-cho-tac-nhan-lau-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_the_dung
  verified_at: 2026-10-16T08:16:21Z
  output: |
    Ran 6 tests across 1 file. [1.70s]

- eval: E3
  run_id: minted-cho-tac-nhan-lau-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_the_dung
  verified_at: 2026-10-16T08:16:21Z
  output: |
    Ran 6 tests across 1 file. [1.70s]

- eval: E8
  run_id: minted-cho-tac-nhan-lau-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_the_dung
  verified_at: 2026-10-16T08:16:21Z
  output: |
    Ran 6 tests across 1 file. [1.70s]

- eval: E4
  run_id: mvap1wcfuo6u
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_bao_khi_xong
  verified_at: 2026-10-16T08:16:21Z
  output: |
    test-run: dropped crm_mvap1wcfuo6u_test

- eval: E7
  run_id: mvap1wcfuo6u
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_bao_khi_xong
  verified_at: 2026-10-16T08:16:21Z
  output: |
    test-run: dropped crm_mvap1wcfuo6u_test

- eval: E5
  run_id: minted-cho-tac-nhan-lau-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_dong_chuong
  verified_at: 2026-10-16T08:16:21Z
  output: |
    Ran 2 tests across 1 file. [1.69s]

- eval: E6
  run_id: minted-cho-tac-nhan-lau-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_doc_khi_mo
  verified_at: 2026-10-16T08:16:21Z
  output: |
    test-run: dropped crm_mvap1vngsida_test

- eval: E10
  run_id: minted-cho-tac-nhan-lau-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctnl_san_thiet_ke
  verified_at: 2026-10-16T08:16:21Z
  output: |
    san-thiet-ke: 3/3 tep dat

- eval: E9
  run_id: minted-cho-tac-nhan-lau-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.ctnl_do_man
  verified_at: 2026-10-16T08:16:21Z
  screenshot: evidence/the-1280.png
  observed: |
    Đã mở từng ảnh của lượt chạy này. the-1280.png: màn chờ 1280 đã dựng, thẻ "Đang dựng tác nhân" có "Đã 4:14" và "1 trên 4", bốn bước, dòng "Đã quá 3 phút. Kara vẫn đang dựng.", lời hứa "Bạn có thể rời trang. Kara sẽ báo trong hộp thông báo khi xong." và nút Dừng. Không tràn ngang, không chữ máy. the-375.png: cùng thẻ ở 375, "Đã 4:17", cũng có dòng quá ngưỡng và lời hứa xuống hai dòng, không tràn. Cả hai ảnh thẻ đều ở trạng thái TRÊN ngưỡng. Không có ảnh nào của thẻ dưới ngưỡng 200 giây, nên vế (1) "dưới ngưỡng không có dòng quá ngưỡng" không có khung nào chứng minh (thư mục design-pass chỉ là bản mẫu thiết kế cũ, không phải ảnh của lượt chạy này).
    chuong-1280.png: chuông badge 1, popover "Thông báo" có dòng "Kara đã dựng xong «Đo màn: tóm tắt deal mỗi sáng» — mở để duyệt" lúc 15:16, tên tác nhân rõ, dòng chưa đọc có chấm xanh. chuong-375.png: popover tương tự ở 375, câu thông báo là một khối, không vỡ cột, không tràn.
    mo-tu-chuong-1280.png: sau khi bấm dòng rồi mở lại /chat, chuông không còn số (1 -> 0), dòng "Đo màn: đã xong" trong thanh bên chuyển sang kiểu đã đọc. Khung này là trang /chat mới, không hiển thị cuộc trò chuyện đang mở (việc mở cuộc trò chuyện chỉ được kiểm bằng URL và docLuc trong script, không thấy trên ảnh). Không thấy chuỗi khoá messages thô ở ảnh nào.
  network_observed: n-a (driver)
  output: |
    Lệnh chạy nguyên văn: BANG_CHUNG=_acceptance/cho-tac-nhan-lau/evidence NGUOI=ada@trycomp.ai bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/cho-tac-nhan-lau/rang/do-man.mjs" (khai ctnl_do_man trong config.yaml). Script tự báo thoát mã 0, log ở .acceptance-runs/neo-thuoc-het-han/log-e9.log.
    Dòng KẾT LUẬN của script: "5 DUNG, 0 SAI". Các ô: the-1280 (Đã 4:14, dòng quá ngưỡng), the-375 (Đã 4:17), chuong-1280 (dòng tác nhân "Kara đã dựng xong «Đo màn: tóm tắt deal mỗi sáng» — mở để duyệt", số chưa đọc 1), mo-tu-chuong-1280 (docLuc có, số chưa đọc 1 -> 0), chuong-375.
    Khung đã lưu: _acceptance/cho-tac-nhan-lau/evidence/the-1280.png, the-375.png, chuong-1280.png, mo-tu-chuong-1280.png, chuong-375.png.
    Đối chiếu Expected: (2) đạt; (3) đạt; (4) số chuông giảm đạt, cuộc trò chuyện mở được kiểm bằng URL/docLuc nhưng ảnh cuối không hiện cuộc trò chuyện; không tràn ngang, không chữ máy: đạt.
    (1) KHÔNG đạt về chứng cứ: ma trận của script (MA_TRAN) chỉ có thẻ trên ngưỡng (kiemThe đòi phút >= ngưỡng + 50 giây và dòng lauHon phải có), không có ca thẻ dưới ngưỡng ở 375 hay 1280, nên điều khẳng định "thẻ dưới ngưỡng có thời gian và lời hứa, không có dòng quá ngưỡng" chưa được đo trên màn thật. AC-9 nêu rõ "dưới ngưỡng, trên ngưỡng".
    Vì Expected còn một vế không có khung chứng minh, eval đặt mã thoát 1 dù script tự báo mã 0. Cần thêm ca dưới ngưỡng (khoảng dưới 200 giây) vào rang/do-man.mjs rồi chạy lại.
    Driver là script puppeteer, không đọc được network nên network_observed là n-a (driver).

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T08:16:21Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-16T08:16:21Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T08:16:21Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T08:16:21Z

- cmd: bunx turbo run lint --force
  run_id: minted-cho-tac-nhan-lau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T08:16:21Z

- cmd: bun run lint:slop
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T08:16:21Z

- cmd: bunx turbo run build --force
  run_id: minted-cho-tac-nhan-lau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T08:16:21Z

Lệnh fail không gắn eval nào:

- `bun run test -- --filter=app --filter=@crm/ui`: đỏ ở gói app, 860 pass, 3 fail, 863 bài kiểm trong 87 tệp. Ba bài đỏ theo log: `kmt-luat > kho chu: moi gia tri vi va en goi AI dung mot ten`, `kho chuoi cua vong ③a > moi ham ghep bien co khang dinh, va so ham bang so khang dinh`, `khoa chet > moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI`. Nguyên nhân: chưa rõ. Phần log còn lại của lượt này không chứa dòng lỗi chi tiết của ba bài, nên không quy cho vòng này hay cho nợ cũ; cần chạy riêng ba bài để lấy dòng lỗi nguyên văn. Bài `thong-bao-cau.spec.ts` của vòng này (24 loại) xanh trong cùng lượt.
- `ui-check:E9`: chính là E9 ở trên.

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cho-tac-nhan-lau.dom.tsx: bo qua baseline: tep apps/app/test/cho-tac-nhan-lau.dom.tsx co o cay dang kiem nhung chua co o merge-base f1bf84a29095462335d2540fa72227d81915beb2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 TZ=Asia/Ho_Chi_Minh bun test test/cho-tac-nhan-lau.integration.spec.ts": bo qua baseline: tep apps/agent/test/cho-tac-nhan-lau.integration.spec.ts co o cay dang kiem nhung chua co o merge-base f1bf84a29095462335d2540fa72227d81915beb2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cho-tac-nhan-lau-chuong.dom.tsx: bo qua baseline: tep apps/app/test/cho-tac-nhan-lau-chuong.dom.tsx co o cay dang kiem nhung chua co o merge-base f1bf84a29095462335d2540fa72227d81915beb2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/cho-tac-nhan-lau.spec.ts": bo qua baseline: tep apps/api/test/cho-tac-nhan-lau.spec.ts co o cay dang kiem nhung chua co o merge-base f1bf84a29095462335d2540fa72227d81915beb2 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/cho-tac-nhan-lau/rang/san-thiet-ke.mjs: bo qua baseline: tep _acceptance/cho-tac-nhan-lau/rang/san-thiet-ke.mjs co o cay dang kiem nhung chua co o merge-base f1bf84a29095462335d2540fa72227d81915beb2 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 failed — thước màn chỉ có ca thẻ trên ngưỡng, không có khung thẻ dưới ngưỡng nên vế (1) của Expected không được chứng minh. Thêm lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở ba bài không gắn eval (nguyên nhân chưa rõ). Returned to implementation.
