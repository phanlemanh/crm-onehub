---
schema_version: 2
feature_slug: loc-moi-truong
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 33367a6dae405ef8000967d4f3a1ed9ec780d87a
human_signoff:
---

# Evidence Report: loc-moi-truong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | script | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-loc-moi-truong-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_chu
  verified_at: 2026-10-21T18:47:37Z
  output: |
    test-run: dropped crm_mvigtagjvb2p_test
    __EXIT=0

- eval: E2
  run_id: minted-loc-moi-truong-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_so
  verified_at: 2026-10-21T18:47:37Z
  output: |
    test-run: dropped crm_mvigtaa7iz8r_test
    __EXIT=0

- eval: E3
  run_id: minted-loc-moi-truong-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_ngay_tich
  verified_at: 2026-10-21T18:47:37Z
  output: |
    test-run: dropped crm_mvigtc03xo2c_test
    __EXIT=0

- eval: E4
  run_id: minted-loc-moi-truong-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_trong
  verified_at: 2026-10-21T18:47:37Z
  output: |
    test-run: dropped crm_mvigt9i3desn_test
    __EXIT=0

- eval: E5
  run_id: minted-loc-moi-truong-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_cty_lh_bang
  verified_at: 2026-10-21T18:47:37Z
  output: |
    test-run: dropped crm_mvigta72ffsq_test
    __EXIT=0

- eval: E5b
  run_id: minted-loc-moi-truong-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_toc_do
  verified_at: 2026-10-21T18:47:37Z
  output: |
    test-run: dropped crm_mvigtaz6kovl_test
    __EXIT=0

- eval: E6
  run_id: mvigtalx32ci
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_khoa_chet
  verified_at: 2026-10-21T18:47:37Z
  output: |
    test-run: dropped crm_mvigtalx32ci_test
    __EXIT=0

- eval: E6b
  run_id: minted-loc-moi-truong-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmt_quet
  verified_at: 2026-10-21T18:47:37Z
  output: |
    lmt quet: dat 4 tep
    __EXIT=0

- eval: E6c
  run_id: minted-loc-moi-truong-E6c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_cai_dat
  verified_at: 2026-10-21T18:47:37Z
  output: |
    Ran 1 test across 1 file. [1460.00ms]
    __EXIT=0

- eval: E7
  run_id: minted-loc-moi-truong-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_da_luu
  verified_at: 2026-10-21T18:47:37Z
  output: |
    test-run: dropped crm_mvigt9mjwx14_test
    __EXIT=0

- eval: E8
  run_id: minted-loc-moi-truong-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_duong_dan
  verified_at: 2026-10-21T18:47:37Z
  output: |
    Ran 1 test across 1 file. [1370.00ms]
    __EXIT=0

- eval: E9
  run_id: minted-loc-moi-truong-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_luu_thoa_thuan
  verified_at: 2026-10-21T18:47:37Z
  output: |
    Ran 1 test across 1 file. [1401.00ms]
    __EXIT=0

- eval: E10
  run_id: minted-loc-moi-truong-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmt_man
  verified_at: 2026-10-21T18:47:37Z
  screenshot: evidence/E10-step1.png
  observed: |
    Da mo ca 6 anh. (1) lmt-menu-chu-1280: trang Thoa thuan o 1280, dark; o tim 'lmtman', menu Loc mo, menu con truong 'Ghi chu lmt' co o 'Chua...' va lua chon 'Trong' so dem 2; bang 6 hang lmtman; khop Expected (url/3 hang xac nhan boi log). (2) lmt-menu-khoang-1280: menu con truong 'So can lmt' co hai o, o dau chua '1.234,5', o hai placeholder 'Den', cac muc 'Bo chon' va 'Trong 1'; nut Loc (1); bang con 4 hang; khop (url gte:1234.5 qua log). (3) lmt-so-sai-1280: o dau chua 'abc' vien do, ngay duoi la chu do 'O nay nhan so, vi du 1.234,5'; bang van 4 hang (khong doi) - khop. (4) lmt-menu-moc-375: man 375 (khong cuon ngang theo log), menu con truong 'Ngay ky lmt' co 5 muc: Da qua 4, Trong thang nay 3, Thang sau 0, Muon hon 1, Trong 1 - du nam muc co so dem; menu con O tich Co/Khong khong nam trong anh nay, chi xac nhan qua log ('o tich Co', 'o tich Khong'). (5) lmt-dang-bat-1280: nut 'Loc (4)', bang chi con 2 hang khop (so can 2.400 va 1.500, ngay ky 19 thg 10, Da ky Co, ghi chu 'hop dong...'); chan bang ghi '2 thoa thuan' - khop. (6) lmt-luu-375: o 375, nut 'Loc (4)', chan ghi '2 thoa thuan', bang con 2 hang lmtman Chi va lmtman An sau khi ap bo loc da luu - khop. Doi chung mat: o nhap trong menu khong bi cat chu, nhan truong o 375 khong vo dong xau, chu nguoi go (lmtman, abc) khong bi dich. Khong mau thuan voi Expected.
  network_observed: n-a (driver)
  output: |
    Lenh: tien-de.mjs --chay do-man.mjs tu goc kho, thoat ma 0 (__EXIT=0), dong cuoi 'lmt man: dat'. Phien do tu dung kho crm_dreamy_gauss_653377_do, app :4378, api :4641, da don khi xong. Log: 'KET LUAN AC-10: 18 DUNG, 0 SAI'.
    Frame da luu: E10-step1.png .. E10-step6.png trong _acceptance/loc-moi-truong/evidence/ (cung E10-run.txt, E10-network.txt).
    Luu y nho: nhan 'Tu'/'Den' la aria-label theo code rang, khong doc truc tiep tu anh; anh luu-375 chup sau khi ap 'Lmt thu' nen ten khong thay trong menu, xac nhan gian tiep qua assertion url ap lai.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-loc-moi-truong-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T18:47:37Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-loc-moi-truong-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T18:47:37Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-loc-moi-truong-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T18:47:37Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-loc-moi-truong-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T18:47:37Z

- cmd: bunx turbo run lint --force
  run_id: minted-loc-moi-truong-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T18:47:37Z

- cmd: bun run lint:slop
  run_id: minted-loc-moi-truong-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T18:47:37Z

- cmd: bunx turbo run build --force
  run_id: minted-loc-moi-truong-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T18:47:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval feature nào được đo xanh trên cả baseline lẫn nhánh (không có eval không-phân-biệt); mọi eval feature đều là eval mới nên baseline không đo được, xem mục dưới.

Baseline khong do
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-chu": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-so": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/loc-moi-truong.spec.ts -t lmt-api-ngay-tich": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-trong": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-cty-lh-bang": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && LMT_TOC_DO=1 bun test --timeout 600000 test/loc-moi-truong-toc-do.spec.ts -t lmt-toc-do": bo qua baseline: tep apps/api/test/loc-moi-truong-toc-do.spec.ts co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-khoa-chet": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/loc-moi-truong/rang/quet-bang-loc.mjs: bo qua baseline: tep _acceptance/loc-moi-truong/rang/quet-bang-loc.mjs co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-moi-truong.dom.tsx -t lmt-cai-dat: bo qua baseline: tep apps/app/test/loc-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-da-luu": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-moi-truong.dom.tsx -t lmt-duong-dan: bo qua baseline: tep apps/app/test/loc-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-moi-truong.dom.tsx -t lmt-luu-thoa-thuan: bo qua baseline: tep apps/app/test/loc-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base 8909851d39de726bd03f88a483cb59b429955294 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, không có phương sai)

## Iterations

Round 1: không eval máy nào đỏ (13 eval và 7 lệnh suite đều xanh); verdict REJECT vì bước duyệt phát hiện 7 mục TRONG hợp đồng chưa được xử lý (AC-3 mốc «Đã qua» tính cả hôm nay; AC-6 bài khoá-chết và máy quét không phân biệt được; AC-8 bước kiểm ở biên máy chủ và vòng lưu không chứng được; AC-9 vế (e) chỉ soi chữ trong mã; AC-10 bước «đang bật bốn bộ lọc» chỉ một bộ lọc phân biệt được). Chi tiết ở review-findings.md. Returned to implementation.
