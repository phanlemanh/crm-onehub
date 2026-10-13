---
schema_version: 2
feature_slug: them-buoc-bao-dung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b8a6d65a46a90fca5ef1b61b0dda731eebae2b98
human_signoff:
---

# Evidence Report: them-buoc-bao-dung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-3 | ui-check | PASS |
| E11 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-them-buoc-bao-dung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_phong_ban
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh: bun run test -- "cd apps/api && bun test test/them-buoc-bao-dung.spec.ts"
    test-run: dropped crm_mv60zecsbvt8_test

- eval: E2
  run_id: minted-them-buoc-bao-dung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_phong_ban
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh: bun run test -- "cd apps/api && bun test test/them-buoc-bao-dung.spec.ts"
    test-run: dropped crm_mv60zecsbvt8_test

- eval: E3
  run_id: minted-them-buoc-bao-dung-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t phong-ban-loi
    Ran 12 tests across 1 file. [1.75s]

- eval: E4
  run_id: minted-them-buoc-bao-dung-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t phong-ban-loi
    Ran 12 tests across 1 file. [1.75s]

- eval: E5
  run_id: minted-them-buoc-bao-dung-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t phong-ban-loi
    Ran 12 tests across 1 file. [1.75s]

- eval: E6
  run_id: minted-them-buoc-bao-dung-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_qua_han_lui
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh: cd apps/app && TBD_MUI_GIO=lui TZ=America/Los_Angeles bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t qua-han-lui
    Ran 4 tests across 1 file. [1247.00ms]

- eval: E7
  run_id: minted-them-buoc-bao-dung-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_qua_han_tien
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh: cd apps/app && TBD_MUI_GIO=tien TZ=Pacific/Kiritimati bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t qua-han-tien
    Ran 4 tests across 1 file. [939.00ms]

- eval: E8
  run_id: minted-them-buoc-bao-dung-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_hoi_quy
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh ghép: khong-xoa-expect.mjs --tu-thu, khong-xoa-expect.mjs --moc 3a2783409, dieu-phoi-va.spec.ts (api), năm tệp DOM (TZ=Asia/Ho_Chi_Minh), bun run check-types
    cả chuỗi lệnh kết thúc với mã 0; không có dòng cuối đáng kể

- eval: E9
  run_id: mv60zc5o3esr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_khu_hoi
  verified_at: 2026-10-13T01:50:58Z
  output: |
    lệnh: hai lượt TBD_KHU_HOI=1 (TZ=America/Los_Angeles rồi TZ=Pacific/Kiritimati) -t qua-han-khu-hoi
    test-run: dropped crm_mv60zc5o3esr_test

- eval: E10
  run_id: minted-them-buoc-bao-dung-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_man
  verified_at: 2026-10-13T01:50:58Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở và đọc cả 6 ảnh.
    1) E10-step1 (loi-phong-ban-1440): ngăn bản ghi «Đo E6b … 0», tab Bước, trạng thái rỗng «Kế hoạch chưa có bước nào». Có khung lỗi «Không tải được danh sách phòng ban» / «Kiểm tra kết nối rồi thử lại.» kèm nút «Thử lại», nằm gọn trong khung nhìn 1440x900; không có ô chọn «Phòng ban»; không có cuộn ngang. Khớp Expected.
    2) E10-step2 (khac-loi-phong-ban-1440): kế hoạch «Đo E6b … 1», có 1 bước «Bước có sẵn» và nút «Thêm bước»; bên dưới khung lỗi «Không tải được danh sách phòng ban» + nút «Thử lại» nhìn thấy trong khung nhìn; không cuộn ngang. Khớp.
    3) E10-step3 (thu-lai-xong-1440): sau thử lại khung lỗi biến mất, ô chọn «Phòng ban» hiện, menu mở liệt kê «Phòng ban đo A» và «Phòng ban đo B». Khớp.
    4) E10-step4 (loi-phong-ban-390): khổ 390, ngăn dạng bottom-sheet, khung lỗi và nút «Thử lại» trọn trong khung nhìn, không cắt ngang, không cuộn ngang; ô nhập «Việc cần làm» bên dưới. Khớp.
    5) E10-step5 (khac-loi-phong-ban-390): kế hoạch có bước, khung lỗi «Không tải được danh sách phòng ban» + «Thử lại» nhìn thấy trong khung nhìn 390. Khớp. (Nút nổi N/avatar của dev đè nhẹ góc dưới nhưng không che nút thử lại.)
    6) E10-step6 (thu-lai-xong-390): khung lỗi biến mất, ô chọn «Phòng ban» hiện với menu hai phòng ban. Khớp.
    Không có frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)
  output: |
    Ảnh gốc của rang (6): evidence/them-buoc-loi-phong-ban-{1440,390}.png, them-buoc-khac-loi-phong-ban-{1440,390}.png, them-buoc-thu-lai-xong-{1440,390}.png.
    Ảnh đã lưu theo tên yêu cầu (bản sao): E10-step1.png = loi-phong-ban-1440, E10-step2.png = khac-loi-phong-ban-1440, E10-step3.png = thu-lai-xong-1440, E10-step4.png = loi-phong-ban-390, E10-step5.png = khac-loi-phong-ban-390, E10-step6.png = thu-lai-xong-390.
    Driver puppeteer trong man.mjs, không đọc được network (E10-network.txt chỉ ghi chú).

- eval: E11
  run_id: minted-them-buoc-bao-dung-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_man
  verified_at: 2026-10-13T01:50:58Z
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png (1440): màn Tổng quan, thẻ «Việc quá hạn» ghi "5 việc quá hạn", 5 dòng: Book the technical deep dive (13 ngày trước), Send SOC 2 report (4 ngày trước), Chase procurement (2 ngày trước), Việc đo E6b mv60zjvp (2 ngày trước), Bước đo ngày VN mv60zjvp (Đo E6b mv60zjvp 4 · Kế hoạch 30 ngày). Dòng bước mang dấu chấm đỏ (error) và ngày "12 thg 10, 20…". Hạn bước là 2026-10-11T18:00Z, tức 12/10 theo giờ VN, hôm qua so với hôm nay VN 13/10. Dòng đó vẫn quá hạn dù trình duyệt đặt Pacific/Pago_Pago (ngày địa phương lùi, 11/10). Không có dòng «và N việc quá hạn nữa» dưới 5 dòng. Khớp AC-6 (lùi). Lỗi hiển thị nhỏ: cột «Quá hạn» bị cắt ở mép phải thẻ ("13 ngày trướ", "12 thg 10, 20"), chữ không tràn ra ngoài thẻ.
    E11-step2.png (390): cùng 5 dòng Việc quá hạn, dòng «Bước đo ngày VN mv60zjvp» có chấm đỏ và "12 thg 10, 20…" bị cắt ở mép phải. Không có dòng «và N việc quá hạn nữa». Không tràn ngang trang. Khớp AC-6 (lùi).
    Đối chiếu Expected: hai ảnh, in múi giờ Pacific/Pago_Pago và dòng "dat", dấu quá hạn của dòng bước khớp ngày VN, dòng «nữa» vắng đúng như AC-6. Mọi assertion đạt.
  network_observed: n-a (driver)
  output: |
    - E11-step2.png (= qua-han-con-sot-390.png)
    - Ảnh khác của lượt đo: them-buoc-loi-phong-ban-{1440,390}.png, them-buoc-thu-lai-xong-{1440,390}.png, them-buoc-khac-loi-phong-ban-{1440,390}.png
    Network: driver là script đo của kho, không có công cụ đọc network, nên không có E11-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T01:50:58Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T01:50:58Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T01:50:58Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T01:50:58Z

- cmd: bunx turbo run lint --force
  run_id: minted-them-buoc-bao-dung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T01:50:58Z

- cmd: bun run lint:slop
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T01:50:58Z

- cmd: bunx turbo run build --force
  run_id: minted-them-buoc-bao-dung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T01:50:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval feature nào xanh ở cả hai phía; baseline của mọi eval feature là n-a nên chưa chứng minh được tính phân biệt trên code cũ (lý do ở mục dưới).

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/them-buoc-bao-dung.spec.ts": bo qua baseline: tep apps/api/test/them-buoc-bao-dung.spec.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t phong-ban-loi: bo qua baseline: tep apps/app/test/them-buoc-bao-dung.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TBD_MUI_GIO=lui TZ=America/Los_Angeles bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t qua-han-lui: bo qua baseline: tep apps/app/test/them-buoc-bao-dung.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TBD_MUI_GIO=tien TZ=Pacific/Kiritimati bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t qua-han-tien: bo qua baseline: tep apps/app/test/them-buoc-bao-dung.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/them-buoc-bao-dung/rang/khong-xoa-expect.mjs --tu-thu && bun _acceptance/them-buoc-bao-dung/rang/khong-xoa-expect.mjs --moc 3a2783409 && bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts" && cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dieu-phoi-va.dom.tsx ./test/han-viec.dom.tsx ./test/moi-phia-ke-hoach.dom.tsx ./test/may-nhac.dom.tsx ./test/ke-hoach-sheet.dom.tsx && cd ../.. && bun run check-types: bo qua baseline: tep _acceptance/them-buoc-bao-dung/rang/khong-xoa-expect.mjs co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TBD_KHU_HOI=1 TZ=America/Los_Angeles bun test test/them-buoc-bao-dung.spec.ts -t qua-han-khu-hoi && TBD_KHU_HOI=1 TZ=Pacific/Kiritimati bun test test/them-buoc-bao-dung.spec.ts -t qua-han-khu-hoi": bo qua baseline: tep apps/api/test/them-buoc-bao-dung.spec.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định, không có phương sai).

## Iterations

Round 1: cả 11 eval đạt (E1–E11); các lệnh suite đều xanh; không có mục cần người chốt thủ công. Hai phát hiện trong hợp đồng về E11 (man.mjs không kiểm data-con-sot) ghi ở review-findings.md.
