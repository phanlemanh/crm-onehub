---
schema_version: 2
feature_slug: duong-ly-do-muc-tieu
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 36a86648c73d23ea91e9454cd624ea4f1b844a8c
human_signoff:
---

# Evidence Report: duong-ly-do-muc-tieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-10 | script | PASS |

Mọi lệnh eval và lệnh suite đều chạy xong, không eval nào đỏ. Verdict tổng là REJECT vì vòng triage có hai finding mức cao trong hợp đồng (AC-9), cùng gốc ở phép đo «không tràn ngang» của `rang/man.mjs` dòng 136. Chi tiết ở `review-findings.md`, mục «Trong hợp đồng».

## Evidence

- eval: E1
  run_id: minted-duong-ly-do-muc-tieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l2_co_so_lieu
  verified_at: 2026-10-13T04:08:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-co-so-lieu
    Ran 1 test across 1 file. [1370.00ms]
    __EXIT=0

- eval: E2
  run_id: minted-duong-ly-do-muc-tieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l2_ba_muc
  verified_at: 2026-10-13T04:08:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-ba-muc
    Ran 2 tests across 1 file. [1.50s]
    __EXIT=0

- eval: E3
  run_id: minted-duong-ly-do-muc-tieu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l2_vang
  verified_at: 2026-10-13T04:08:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-vang
    Ran 1 test across 1 file. [1.51s]
    __EXIT=0

- eval: E4
  run_id: minted-duong-ly-do-muc-tieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l2_len_muc_tieu
  verified_at: 2026-10-13T04:08:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-len-muc-tieu
    Ran 1 test across 1 file. [1338.00ms]
    __EXIT=0

- eval: E5
  run_id: minted-duong-ly-do-muc-tieu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l2_dau_kara
  verified_at: 2026-10-13T04:08:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-dau-kara
    Ran 1 test across 1 file. [1327.00ms]
    __EXIT=0

- eval: E6
  run_id: minted-duong-ly-do-muc-tieu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l2_chu
  verified_at: 2026-10-13T04:08:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-chu && bun test ./test/messages-guard.spec.ts
    Ran 137 tests across 1 file. [1150.00ms]
    __EXIT=0

- eval: E7
  run_id: minted-duong-ly-do-muc-tieu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l2_giu_ho_so
  verified_at: 2026-10-13T04:08:16Z
  output: |
    bun _acceptance/duong-ly-do-muc-tieu/rang/giu-ho-so.mjs
    __EXIT=0

- eval: E8
  run_id: minted-duong-ly-do-muc-tieu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l2_bo_mau
  verified_at: 2026-10-13T04:08:16Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-ly-do.spec.ts -t ly-do-mau"
    test-run: dropped crm_mv65vc8g9sgp_test
    __EXIT=0

- eval: E9
  run_id: minted-duong-ly-do-muc-tieu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l2_man_doc_lai
  verified_at: 2026-10-13T04:08:16Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-ly-do.spec.ts -t man-doc-lai"
    test-run: dropped crm_mv65vd5k67iw_test
    __EXIT=0

- eval: E10
  run_id: duong-ly-do-muc-tieu/E10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l2_man
  verified_at: 2026-10-13T04:08:16Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở từng ảnh bằng Read. Step1 (co-so-lieu 390): sheet mobile, mục 'ĐƯỜNG LÝ DO' có tiêu đề 'Trở thành đối tác logistics…', dòng 'OneHub · qua KR «Doanh thu hợp đồng mới đạt 48 tỷ đồng»', câu lý do dài xuống nhiều dòng không cắt, dấu 'AI đổi theo Kara', dòng 'Căn cứ: Doanh thu bán lẻ miền Bắc quý 3 đạt 6,1 tỷ…', nhãn 'Có số liệu' chấm xanh; không tràn ngang. Step2 (dat-cuoc 390): có câu lý do 'Thêm đối tác bán lẻ mới mở đường…', không dòng căn cứ, không dấu Kara, nhãn 'Đặt cược'. Step3 (chua-co-ly-do 390): chỉ tiêu đề + 'OneHub', nhãn 'Chưa có lý do' chấm cam, không câu/căn cứ. Step4/5/6 (1440): cùng nội dung tương ứng ('Có số liệu' có căn cứ + dấu Kara; 'Đặt cược' có câu không căn cứ; 'Chưa có lý do' không câu không căn cứ), câu lý do trọn vẹn một-hai dòng, bảng KR không tràn. Khớp Expected. Lưu ý nhỏ: ở khổ 390 phần trên ảnh là nền đen trống, sheet hiển thị ở nửa dưới và đầu sheet cuộn lên (khối Góp vào vẫn nằm trong khung ảnh), không ảnh hưởng assertion.
  network_observed: n-a (driver)
  output: |
    Ảnh đã lưu (bản gốc của script + bản đánh số): evidence/co-so-lieu-390.png (E10-step1), dat-cuoc-390.png (step2), chua-co-ly-do-390.png (step3), co-so-lieu-1440.png (step4), dat-cuoc-1440.png (step5), chua-co-ly-do-1440.png (step6), thư mục _acceptance/duong-ly-do-muc-tieu/evidence/.
    Network: driver là script bun (không có read_network_requests); console lỗi do script đếm = 0 mỗi ca; ghi chú ở E10-network.txt.
    Cảnh cây: log không in dòng riêng 'canh-cay' nhưng phiên đo chạy trên cổng riêng của cây (4133/4376), không phải 3000/3001.

- eval: E11
  run_id: minted-duong-ly-do-muc-tieu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l2_dot_bien
  verified_at: 2026-10-13T04:08:16Z
  output: |
    bun _acceptance/duong-ly-do-muc-tieu/rang/dot-bien.mjs
    dot-bien: 7/7 vet bi bat, tep tra lai nguyen
    __EXIT=0

- eval: E12
  run_id: minted-duong-ly-do-muc-tieu-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l2_ranh_gioi
  verified_at: 2026-10-13T04:08:16Z
  output: |
    node _acceptance/duong-ly-do-muc-tieu/rang/ranh-gioi.mjs
    ranh gioi dat
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-duong-ly-do-muc-tieu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T04:08:16Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-duong-ly-do-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T04:08:16Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-duong-ly-do-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T04:08:16Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-duong-ly-do-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T04:08:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-duong-ly-do-muc-tieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T04:08:16Z

- cmd: bun run lint:slop
  run_id: minted-duong-ly-do-muc-tieu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T04:08:16Z

- cmd: bunx turbo run build --force
  run_id: minted-duong-ly-do-muc-tieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T04:08:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-co-so-lieu: bo qua baseline: tep apps/app/test/duong-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-ba-muc: bo qua baseline: tep apps/app/test/duong-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-vang: bo qua baseline: tep apps/app/test/duong-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-len-muc-tieu: bo qua baseline: tep apps/app/test/duong-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-dau-kara: bo qua baseline: tep apps/app/test/duong-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx -t l2-chu && bun test ./test/messages-guard.spec.ts: bo qua baseline: tep apps/app/test/duong-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/duong-ly-do-muc-tieu/rang/giu-ho-so.mjs: bo qua baseline: tep _acceptance/duong-ly-do-muc-tieu/rang/giu-ho-so.mjs co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-mau-ly-do.spec.ts -t ly-do-mau": bo qua baseline: tep apps/api/test/okr-mau-ly-do.spec.ts co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-mau-ly-do.spec.ts -t man-doc-lai": bo qua baseline: tep apps/api/test/okr-mau-ly-do.spec.ts co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/duong-ly-do-muc-tieu/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/duong-ly-do-muc-tieu/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/duong-ly-do-muc-tieu/rang/ranh-gioi.mjs: bo qua baseline: tep _acceptance/duong-ly-do-muc-tieu/rang/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ, nhưng hai finding mức cao trong hợp đồng (AC-9) cho thấy phép đo «không tràn ngang» của E10 đo một phần tử không có hộp bố cục nên không thể đỏ (`_acceptance/duong-ly-do-muc-tieu/rang/man.mjs` dòng 136). Trả về triển khai: chọn vùng cuộn thật và thêm bước kiểm phần tử đo có chiều rộng khác không.
