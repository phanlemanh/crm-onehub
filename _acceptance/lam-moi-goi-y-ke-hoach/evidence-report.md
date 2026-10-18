---
schema_version: 2
feature_slug: lam-moi-goi-y-ke-hoach
verdict: REJECT
failed_evals: [E6]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9858a5d701c844590562de84ad21b718b08bba0a
human_signoff:
---

# Evidence Report: lam-moi-goi-y-ke-hoach

Round 2. Nội dung thay trọn round cũ; lịch sử round ở mục Iterations. Lệnh hỏng không gắn eval: không có. Lệnh `ui-check:E6` hỏng và gắn đúng eval E6.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | ui-check | FAIL |
| E7 | AC-7 | script | PASS |
| E8 | AC-1 | test | PASS |
| E9 | AC-3 | test | PASS |
| E10 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-lam-moi-goi-y-ke-hoach-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_stepper
  verified_at: 2026-10-18T14:10:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-stepper
    Ran 1 test across 1 file. [1102.00ms]

- eval: E2
  run_id: minted-lam-moi-goi-y-ke-hoach-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_menu
  verified_at: 2026-10-18T14:10:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-menu
    Ran 1 test across 1 file. [1346.00ms]

- eval: E3
  run_id: minted-lam-moi-goi-y-ke-hoach-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_roi
  verified_at: 2026-10-18T14:10:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-roi
    Ran 2 tests across 1 file. [1308.00ms]

- eval: E4
  run_id: minted-lam-moi-goi-y-ke-hoach-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_cache
  verified_at: 2026-10-18T14:10:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-cache
    Ran 2 tests across 1 file. [1080.00ms]

- eval: E5
  run_id: minted-lam-moi-goi-y-ke-hoach-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_dot_bien
  verified_at: 2026-10-18T14:10:51Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/dot-bien.mjs
    dot-bien: 5/5 cap dat

- eval: E6
  run_id: minted-lam-moi-goi-y-ke-hoach-E6-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.lmgy_man
  verified_at: 2026-10-18T14:10:51Z
  screenshot: evidence/E6-sau-thang-1280.png
  observed: |
    Frame evidence/E6-sau-thang-1280.png (bản của lần 2 trên đĩa): sheet deal "Hợp đồng làm mới thật kdwnek2" có thẻ "Deal đã thắng — mở kế hoạch 30 ngày cho Công ty Làm Mới Gợi Ý thật kdwnek2?" với nút "Mở kế hoạch" và "Bỏ qua" ở đầu sheet, toast "Đã đổi giai đoạn"; nhưng sheet bắt đầu ở x khoảng 745 và bị cắt ở mép phải, thanh GIAI ĐOẠN chỉ thấy tới "Decision maker in", không thấy cột thắng. Dòng bảng phía sau đã là "Closed won".
    Frame evidence/E6-sau-roi-thang-1280.png: không có thẻ, thanh giai đoạn sáng cột đầu "Demo booked", dòng bảng phía sau là "Demo booked"; sheet vẫn lệch phải như frame trước. Thẻ hiện và mất đúng chiều (172 ms và 115 ms), nhưng sheet không đứng yên: ở lần 2 tay cầm sheet không còn gắn trong document sau khi rời cột thắng (sheet bị dựng lại), trái với «không tải lại, sheet không dựng lại».
  network_observed: n-a (driver)
  output: |
    Lệnh chạy nguyên văn từ gốc kho (config executors.script.lmgy_man) 2 lần, phiên đo kho crm_da3c_lam_moi_goi_y_do, app cổng 4130, api cổng 4136, tự dọn khi xong.
    Lần 1 (thoát 0): tự thử chiều đỏ báo KHONG DAT đúng hướng; hiện sau thắng DAT 160 ms; sheet không dựng lại sau thắng DAT; ẩn sau rời thắng DAT 112 ms; sheet không dựng lại sau rời thắng DAT.
    Lần 2 (cùng lệnh, cùng cây, thoát khác 0): tự thử đúng hướng; hiện sau thắng DAT 172 ms; sheet không dựng lại sau thắng DAT; ẩn sau rời thắng DAT 115 ms; "E6 sheet khong dung lai: KHONG DAT — sau roi thang" (tay cầm sheet không còn isConnected); "buoc 1: an=true sheet=false"; "lam-moi-goi-y-ke-hoach man: hong 1".
    Kết luận: eval không ổn định, assertion «sheet không dựng lại» đo được 1 trên 2 lần; theo luật thoát 0 chỉ khi mọi assertion đạt nên E6 hỏng. Ảnh trên đĩa là bản của lần 2; ảnh lần 1 sao lưu ở /private/tmp/claude-503/e6run1/.

- eval: E7
  run_id: minted-lam-moi-goi-y-ke-hoach-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_hoi_quy
  verified_at: 2026-10-18T14:10:51Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --tu-thu && node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --moc "$(git merge-base HEAD origin/onehub)" && bun run check-types
    (không có dòng cuối riêng; chuỗi lệnh kết thúc bình thường)

- eval: E8
  run_id: minted-lam-moi-goi-y-ke-hoach-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gymk_sinh
  verified_at: 2026-10-18T14:10:51Z
  output: |
    bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-sinh"
    test-run: dropped crm_mvdwls82damy_test

- eval: E9
  run_id: minted-lam-moi-goi-y-ke-hoach-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gymk_xu_ly
  verified_at: 2026-10-18T14:10:51Z
  output: |
    bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-xu-ly"
    test-run: dropped crm_mvdwlt3vcikl_test

- eval: E10
  run_id: minted-lam-moi-goi-y-ke-hoach-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_duong
  verified_at: 2026-10-18T14:10:51Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs --tu-thu && node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs
    duong-doi-giai-doan: da kiem 4/4 noi, 0 loi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-18T14:10:51Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-18T14:10:51Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-18T14:10:51Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-18T14:10:51Z

- cmd: bunx turbo run lint --force
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-18T14:10:51Z

- cmd: bun run lint:slop
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-18T14:10:51Z

- cmd: bunx turbo run build --force
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-18T14:10:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả nhánh lẫn baseline, chứng minh harness chứ không phải feature):
- E8: chạy lại nguyên trạng bài kiểm đã ký E1 của goi-y-mo-ke-hoach (-t gy-sinh); xanh trên cả code cũ là chủ ý, đây là tiền đề máy chủ của AC-1 và là regression-guard có chủ ý.
- E9: chạy lại nguyên trạng bài kiểm đã ký E3 của goi-y-mo-ke-hoach (-t gy-xu-ly); cùng lý do, là tiền đề máy chủ của AC-3 và regression-guard có chủ ý.

Baseline khong do:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-stepper: bo qua baseline: tep apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 4f22bad4357f49b53ec24ea16c2c0a188d8a6154 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-menu: bo qua baseline: tep apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 4f22bad4357f49b53ec24ea16c2c0a188d8a6154 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-roi: bo qua baseline: tep apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 4f22bad4357f49b53ec24ea16c2c0a188d8a6154 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-cache: bo qua baseline: tep apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 4f22bad4357f49b53ec24ea16c2c0a188d8a6154 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/lam-moi-goi-y-ke-hoach/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/lam-moi-goi-y-ke-hoach/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 4f22bad4357f49b53ec24ea16c2c0a188d8a6154 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --tu-thu && node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --moc "$(git merge-base HEAD origin/onehub)" && bun run check-types: bo qua baseline: tep _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs co o cay dang kiem nhung chua co o merge-base 4f22bad4357f49b53ec24ea16c2c0a188d8a6154 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs --tu-thu && node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs: bo qua baseline: tep _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs co o cay dang kiem nhung chua co o merge-base 4f22bad4357f49b53ec24ea16c2c0a188d8a6154 — eval moi, chay tren code cu khong phan biet gi

Không có mục chấm theo phán đoán (judgment) trong hợp đồng này; không có panel nào để ghi.

## Variance

- E6: flaky — cùng lệnh, cùng cây, hai lần liên tiếp cho hai kết quả khác nhau (lần 1 đạt mọi assertion, lần 2 hỏng ở «sheet không dựng lại sau rời thắng»). Máy ghi runs 1 nên không có pass_rate; mức đo thực tế là 1 trên 2 lần chạy tay. Cần tìm nguyên nhân gốc: sheet bị dựng lại khi rời cột thắng, hay thước đo bắt sheet đang đóng.

## Iterations

Round 1: cả 10 eval đạt ở cef0d8c28f21ba18ea1d2a56ea080297921826ad; review lượt 1 phát hiện thứ tự settle record chưa được đo, nên bổ sung ca thứ hai của E4 và cặp đột biến (e) của E5. Quay lại triển khai.
Round 2: E6 hỏng — thước màn không ổn định, assertion «sheet không dựng lại» đạt ở lần 1 và hỏng ở lần 2 (tay cầm sheet không còn gắn sau khi rời cột thắng); frame còn thấy sheet lệch phải và bị cắt. Chín eval còn lại và bảy lệnh suite đạt. Quay lại triển khai.
