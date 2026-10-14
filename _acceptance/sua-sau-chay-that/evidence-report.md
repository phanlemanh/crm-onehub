---
schema_version: 2
feature_slug: sua-sau-chay-that
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8e72fbedc5144e2e84ee325dd5f569867b795915
human_signoff:
---

# Evidence Report: sua-sau-chay-that

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |
| E14 | AC-2 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-sau-chay-that-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_nguon
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/ssct-nguon.spec.ts -t ssct-nguon"
    test-run: dropped crm_mv7u77sp2kvk_test

- eval: E1b
  run_id: mv7u77p5y6e0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_nop_luu_tru
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/ssct-nop-luu-tru.spec.ts"
    test-run: dropped crm_mv7u77p5y6e0_test

- eval: E2
  run_id: minted-sua-sau-chay-that-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_doc_cho
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-doc-cho.dom.tsx
    Ran 6 tests across 1 file. [1023.00ms]

- eval: E3
  run_id: minted-sua-sau-chay-that-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_doc_cho
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-doc-cho.dom.tsx
    Ran 6 tests across 1 file. [1023.00ms]

- eval: E4
  run_id: minted-sua-sau-chay-that-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_quay_lai
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/ssct-quay-lai.spec.ts -t ssct-quay-lai"
    test-run: dropped crm_mv7u75xfmbkh_test

- eval: E5
  run_id: minted-sua-sau-chay-that-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_muc_luc
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/ssct-muc-luc.dom.tsx
    Ran 4 tests across 1 file. [841.00ms]

- eval: E6
  run_id: minted-sua-sau-chay-that-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_lien_ket
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/ssct-lien-ket.dom.tsx
    Ran 5 tests across 1 file. [1312.00ms]

- eval: E7
  run_id: minted-sua-sau-chay-that-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_chon_loi
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-chon-loi.dom.tsx
    Ran 5 tests across 1 file. [973.00ms]

- eval: E8
  run_id: minted-sua-sau-chay-that-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_tim_nhanh
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-tim-nhanh-loi.dom.tsx
    Ran 2 tests across 1 file. [930.00ms]

- eval: E9
  run_id: minted-sua-sau-chay-that-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_hoi_en
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-hoi-en.dom.tsx
    Ran 9 tests across 1 file. [1092.00ms]

- eval: E9b
  run_id: minted-sua-sau-chay-that-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_hoi_ma
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/ssct-hoi-ma.spec.ts -t ssct-hoi-ma"
    test-run: dropped crm_mv7u77uu6l84_test

- eval: E10
  run_id: minted-sua-sau-chay-that-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_bang_doi_cot
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/ssct-bang-doi-cot.dom.tsx
    Ran 4 tests across 1 file. [437.00ms]

- eval: E11
  run_id: minted-sua-sau-chay-that-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_duyet_may_cu
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-duyet-may-cu.dom.tsx
    Ran 2 tests across 1 file. [679.00ms]

- eval: E12
  run_id: minted-sua-sau-chay-that-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_loai_tep
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-loai-tep.dom.tsx
    Ran 4 tests across 1 file. [863.00ms]

- eval: E13
  run_id: minted-sua-sau-chay-that-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_so_bo_mau
  verified_at: 2026-10-14T08:16:51Z
  output: |
    cmd: bun _acceptance/sua-sau-chay-that/rang/so-bo-mau.ts
    chieu do mot byte tep tro ly doi: dat (ghim apps/agent/agent/subagents/tro_ly_kho/agent.ts)

- eval: E14
  run_id: minted-sua-sau-chay-that-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_man
  verified_at: 2026-10-14T08:16:51Z
  screenshot: evidence/E14-step1.png
  observed: |
    Đã mở cả năm khung 1440x900. Bước 1 (trang «Quy định hoa hồng đối tác»): hai huy hiệu «Có đề xuất lưu trữ chờ duyệt» và «Có 1 bản chờ duyệt», nút «Xem bản chờ duyệt» cạnh «Đặt hạn xác minh». Bước 2: mục lục bên phải đúng «Lương & thưởng» và «A < B», hai tiêu đề trong nội dung khớp, ký tự & và < không bị thoát sai.
    Bước 3: hai bảng riêng, bảng trên hai cột (Tầng, Tỉ lệ) gạch ngang là bản cũ, bảng dưới ba cột (Tầng, Tỉ lệ, Hạn) gạch chân xanh là bản mới, kèm Duyệt và Trả lại. Bước 4: ô liên kết «http://a.vn» viền đỏ với dòng «Chỉ nhận liên kết https». Bước 5: vùng thả viền đứt đỏ với dòng «Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB.», nút Tải lên bị mờ. Cả năm khung khớp expected, không khung nào mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    cmd: ui-check:E14 (chạy nguyên văn dòng lệnh đã khai, kèm mot-luot.sh)
    Năm khung lưu ở evidence/E14-step1.png đến E14-step5.png; mạng thô ở evidence/E14-network.txt.
    Chiều đỏ --chieu-do trên bản sao bộ lọc loại ghim đúng «bước 1: đếm bản chờ sai»; phép đo ghim đúng.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-14T08:16:51Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-14T08:16:51Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-14T08:16:51Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-14T08:16:51Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-14T08:16:51Z

- cmd: bun run lint:slop
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-14T08:16:51Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-14T08:16:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không có eval nào xanh ở cả hai phía (baseline của mọi eval feature là n-a, lý do ở mục dưới); lệnh suite xanh-cả-hai-phía là regression-guard bình thường, không liệt kê.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/ssct-nguon.spec.ts -t ssct-nguon": bo qua baseline: tep apps/api/test/ssct-nguon.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/ssct-nop-luu-tru.spec.ts": bo qua baseline: tep apps/agent/test/ssct-nop-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-doc-cho.dom.tsx: bo qua baseline: tep apps/app/test/ssct-doc-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/ssct-quay-lai.spec.ts -t ssct-quay-lai": bo qua baseline: tep apps/api/test/ssct-quay-lai.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/ssct-muc-luc.dom.tsx: bo qua baseline: tep packages/ui/test/ssct-muc-luc.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/ssct-lien-ket.dom.tsx: bo qua baseline: tep packages/ui/test/ssct-lien-ket.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-chon-loi.dom.tsx: bo qua baseline: tep apps/app/test/ssct-chon-loi.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-tim-nhanh-loi.dom.tsx: bo qua baseline: tep apps/app/test/ssct-tim-nhanh-loi.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-hoi-en.dom.tsx: bo qua baseline: tep apps/app/test/ssct-hoi-en.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/ssct-hoi-ma.spec.ts -t ssct-hoi-ma": bo qua baseline: tep apps/api/test/ssct-hoi-ma.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/ssct-bang-doi-cot.dom.tsx: bo qua baseline: tep packages/ui/test/ssct-bang-doi-cot.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-duyet-may-cu.dom.tsx: bo qua baseline: tep apps/app/test/ssct-duyet-may-cu.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ssct-loai-tep.dom.tsx: bo qua baseline: tep apps/app/test/ssct-loai-tep.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-sau-chay-that/rang/so-bo-mau.ts: bo qua baseline: tep _acceptance/sua-sau-chay-that/rang/so-bo-mau.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval nào có phương sai).

## Iterations

Round 1: tất cả 16 eval và 7 lệnh suite đạt; không có eval nào trượt, không trả lại vòng cài đặt.
