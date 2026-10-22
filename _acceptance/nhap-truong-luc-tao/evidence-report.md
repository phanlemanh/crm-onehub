---
schema_version: 2
feature_slug: nhap-truong-luc-tao
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fd27b797a95dc5f0eb5c8012cedf151dcd0145ae
human_signoff:
---

# Evidence Report: nhap-truong-luc-tao

Round 1. Mọi lệnh của eval thoát sạch, nhưng verdict tổng là REJECT vì năm phát hiện trong hợp đồng (chi tiết ở review-findings.md) cho thấy thước đo của AC-1, AC-3 và AC-9 chưa chứng được lời hứa. Không eval nào đỏ nên failed_evals rỗng.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-nhap-truong-luc-tao-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_bo_truong
  verified_at: 2026-10-22T02:06:33Z
  output: |
    Ran 1 test across 1 file. [1.79s]
    __EXIT=0

- eval: E1b
  run_id: minted-nhap-truong-luc-tao-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_chua_tai
  verified_at: 2026-10-22T02:06:33Z
  output: |
    Ran 1 test across 1 file. [1.51s]
    __EXIT=0

- eval: E1c
  run_id: minted-nhap-truong-luc-tao-E1c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ntl_giu_luat_cu
  verified_at: 2026-10-22T02:06:33Z
  output: |
    Ran 7 tests across 1 file. [864.00ms]
    __EXIT=0

- eval: E2
  run_id: minted-nhap-truong-luc-tao-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntl_quet
  verified_at: 2026-10-22T02:06:33Z
  output: |
    ntl quet: dat
    __EXIT=0

- eval: E3
  run_id: minted-nhap-truong-luc-tao-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_gui_gia_tri
  verified_at: 2026-10-22T02:06:33Z
  output: |
    Ran 1 test across 1 file. [1.92s]
    __EXIT=0

- eval: E3b
  run_id: minted-nhap-truong-luc-tao-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_tao_co_truong
  verified_at: 2026-10-22T02:06:33Z
  output: |
    test-run: dropped crm_mviwhkux3n3m_test
    __EXIT=0

- eval: E4
  run_id: minted-nhap-truong-luc-tao-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_bat_buoc
  verified_at: 2026-10-22T02:06:33Z
  output: |
    Ran 1 test across 1 file. [1298.00ms]
    __EXIT=0

- eval: E4b
  run_id: minted-nhap-truong-luc-tao-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_bat_buoc
  verified_at: 2026-10-22T02:06:33Z
  output: |
    test-run: dropped crm_mviwhl97irze_test
    __EXIT=0

- eval: E5
  run_id: minted-nhap-truong-luc-tao-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_loi_may_chu
  verified_at: 2026-10-22T02:06:33Z
  output: |
    Ran 1 test across 1 file. [1.62s]
    __EXIT=0

- eval: E5b
  run_id: minted-nhap-truong-luc-tao-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_tu_choi
  verified_at: 2026-10-22T02:06:33Z
  output: |
    test-run: dropped crm_mviwhm7jc21b_test
    __EXIT=0

- eval: E6
  run_id: minted-nhap-truong-luc-tao-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_them_nhanh
  verified_at: 2026-10-22T02:06:33Z
  output: |
    Ran 1 test across 1 file. [1.74s]
    __EXIT=0

- eval: E7
  run_id: minted-nhap-truong-luc-tao-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_kara_dien
  verified_at: 2026-10-22T02:06:33Z
  output: |
    test-run: dropped crm_mviwhks0ehoq_test
    __EXIT=0

- eval: E8
  run_id: minted-nhap-truong-luc-tao-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_ban_ghi_cu
  verified_at: 2026-10-22T02:06:33Z
  output: |
    test-run: dropped crm_mviwhm8xaiiv_test
    __EXIT=0

- eval: E8b
  run_id: minted-nhap-truong-luc-tao-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_ban_ghi_cu
  verified_at: 2026-10-22T02:06:33Z
  output: |
    Ran 1 test across 1 file. [1297.00ms]
    __EXIT=0

- eval: E9
  run_id: minted-nhap-truong-luc-tao-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntl_man
  verified_at: 2026-10-22T02:06:33Z
  screenshot: evidence/ntl-tao-thoa-thuan-moi-1280.png
  observed: |
    Da mo tung 20 frame bang Read.
    - tao-thoa-thuan-moi-1280: sheet 'Thoả thuận mới' mot cot; nhan tren o, o cung cao (~32px) cung co chu: Tên, Giá trị, Tiền tệ, Ngày chốt, Công ty, Giai đoạn, Phụ trách, roi 'Chữ ntl' (o tu tao) cung cot, cung nhan tren o, khong tieu de/duong ke tach. Cac truong tu tao con lai nam duoi nếp gap sheet cuon, khong thay trong anh. -thieu-1280: loi do 'Tên không được để trống.' ngay duoi o Tên; 'Chữ ntl' bi cat o mep duoi.
    - tao-thoa-thuan-moi/thieu-375: mot cot day chieu rong, khong cuon ngang, 'Chữ ntl' o mep duoi bi cat; loi 'Tên không được để trống.' sat duoi o Tên.
    - tao-cong-ty-moi/thieu-1280 va 375: mot cot, o chuan deu nhau (Tên, Tên miền, Website, Điện thoại, Email, Thành phố, Quốc gia, Phụ trách); KHONG co truong tu tao nao trong khung chup (nam duoi nếp gap); loi 'Tên không được để trống.' duoi Tên.
    - tao-ca-nhan-moi/thieu-1280 va 375: mot cot (Tên, Họ, Chức danh, Email, Điện thoại, LinkedIn, X, GitHub, Công ty), khong thay truong tu tao; loi duoi Tên dung cho; o 1280 co huy hieu do Next.js '1 Issue' goc trai duoi.
    - them-ca-nhan-moi-1280: hai cot; o tu tao 'Chữ ntl', 'Ngày ntl', 'Người ntl', 'Liên kết ntl', 'Số ntl', 'Bắt buộc ntl' xep xen trong cung luoi hai cot voi o chuan (Tên, Họ, Chức danh, Email, Điện thoại, LinkedIn, X, GitHub, Phụ trách), cung nhan tren o, cung cao, cung co chu, khong tieu de/phan cach/nhan phu. -thieu-1280: loi 'Tên không được để trống.' duoi Tên; o 'Bắt buộc ntl' vien do nhung cau loi duoi no nam duoi nếp gap.
    - them-thoa-thuan-moi-1280: hai cot; chuan (Tên, Giá trị, Tiền tệ, Ngày chốt, Phụ trách) va tu tao (Chữ ntl, Ngày ntl, Người ntl, Liên kết ntl, Số ntl, Bắt buộc ntl) cung luoi, dong deu; Ngày chốt va Ngày ntl cung kieu DatePicker 'Chọn ngày'. -thieu-1280: 'Tên không được để trống.' duoi Tên va 'Bắt buộc ntl không được để trống.' ngay duoi o Bắt buộc ntl (khoang cach nho), khop Expected.
    - them-ca-nhan va them-thoa-thuan -375: sheet day, mot cot day chieu rong, khong cuon ngang; khung chup chi toi Điện thoại/Phụ trách (truong tu tao nam duoi), loi duoi Tên ngay sat.
    Doi chieu Expected: khong frame nao mau thuan Expected; noi thay duoc (tat ca khung them-* 1280, cac o chuan) deu khop; phan khong thay (tu tao trong khung tao-* va 375) chi duoc dam bao bang do DOM 36/36 DUNG.
  network_observed: n-a (driver)
  output: |
    LUU Y 2 (bang chung thi giac yeu): anh chi chup viewport; ben trong sheet cuon nen nhieu truong tu tao nam duoi nếp gap. Chi 4/20 anh (them-ca-nhan va them-thoa-thuan, 1280) thay du cac truong tu tao. Cac anh tao-* (1280) khong thay cau loi duoi o 'Bắt buộc ntl' (chi thay loi duoi 'Tên'); tat ca 10 anh 375 chua tu tao nao trong khung chup. Phan nay chi duoc xac nhan bang DO DOM (36 DUNG), khong bang mat.
    LUU Y 3: anh tao-ca-nhan-moi/thieu-1280 co huy hieu Next.js dev '1 Issue' (do) o goc trai duoi; driver puppeteer khong thu console/network nen khong ro nguyen nhan. Khong co read_network_requests nen khong ghi E9-network.txt.
    Khong sua code.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T02:06:33Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T02:06:33Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T02:06:33Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T02:06:33Z

- cmd: bunx turbo run lint --force
  run_id: minted-nhap-truong-luc-tao-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T02:06:33Z

- cmd: bun run lint:slop
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T02:06:33Z

- cmd: bunx turbo run build --force
  run_id: minted-nhap-truong-luc-tao-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T02:06:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval xanh trên cả HEAD lẫn baseline (không phân biệt, chứng harness hơn là tính năng):

- E1c: ba tệp có sẵn trên onehub (tra-cuu-thuong-hieu-viet-nam, dien-thoai-ca-nhan, deals-giai-doan-hydrat) chạy xanh cả hai phía. Đây là bài giữ luật cũ có chủ ý (regression-guard theo đúng lời của eval), không phải bài chứng hành vi mới.

Baseline khong do:

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/nhap-truong-luc-tao.dom.tsx -t ntl-bo-truong: bo qua baseline: tep apps/app/test/nhap-truong-luc-tao.dom.tsx co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/nhap-truong-luc-tao.dom.tsx -t ntl-chua-tai: bo qua baseline: tep apps/app/test/nhap-truong-luc-tao.dom.tsx co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/nhap-truong-luc-tao/rang/quet.mjs: bo qua baseline: tep _acceptance/nhap-truong-luc-tao/rang/quet.mjs co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/nhap-truong-luc-tao.dom.tsx -t ntl-gui-gia-tri: bo qua baseline: tep apps/app/test/nhap-truong-luc-tao.dom.tsx co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/nhap-truong-luc-tao.spec.ts -t ntl-api-tao-co-truong": bo qua baseline: tep apps/api/test/nhap-truong-luc-tao.spec.ts co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/nhap-truong-luc-tao.dom.tsx -t ntl-bat-buoc: bo qua baseline: tep apps/app/test/nhap-truong-luc-tao.dom.tsx co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/nhap-truong-luc-tao.spec.ts -t ntl-api-bat-buoc": bo qua baseline: tep apps/api/test/nhap-truong-luc-tao.spec.ts co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/nhap-truong-luc-tao.dom.tsx -t ntl-loi-may-chu: bo qua baseline: tep apps/app/test/nhap-truong-luc-tao.dom.tsx co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/nhap-truong-luc-tao.spec.ts -t ntl-api-tu-choi": bo qua baseline: tep apps/api/test/nhap-truong-luc-tao.spec.ts co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/nhap-truong-luc-tao.dom.tsx -t ntl-them-nhanh: bo qua baseline: tep apps/app/test/nhap-truong-luc-tao.dom.tsx co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/nhap-truong-luc-tao.spec.ts -t ntl-api-kara-dien": bo qua baseline: tep apps/api/test/nhap-truong-luc-tao.spec.ts co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/nhap-truong-luc-tao.spec.ts -t ntl-api-ban-ghi-cu": bo qua baseline: tep apps/api/test/nhap-truong-luc-tao.spec.ts co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/nhap-truong-luc-tao.dom.tsx -t ntl-ban-ghi-cu: bo qua baseline: tep apps/app/test/nhap-truong-luc-tao.dom.tsx co o cay dang kiem nhung chua co o merge-base 95a71d21985c61c9254db01bdeb445985b07518b — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ; verdict REJECT vì năm phát hiện trong hợp đồng (E9 phép đo cùng cột lưới, E3 thước phiếu mù, E3 dò mảnh chuỗi, E3 fixture Ngày sai khuôn, E1 dấu bắt buộc không có mốc dương) cho thấy thước đo chưa chứng được AC-9, AC-3, AC-1. Returned to implementation.
