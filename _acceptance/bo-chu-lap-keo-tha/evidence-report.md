---
schema_version: 2
feature_slug: bo-chu-lap-keo-tha
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a831f519f7ab792b1411655cbc78cbcf0ed20097
human_signoff: Phan Le Manh 2026-09-28
---

# Evidence Report: bo-chu-lap-keo-tha

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5a | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E5c | AC-5 | script | PASS |
| E6u | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-bo-chu-lap-keo-tha-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bclkt_chu_vi
  verified_at: 2026-09-28T12:59:45Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/keo-tha-khong-lap-chu.dom.tsx -t chu-vi
    Ran 1 test across 1 file. [638.00ms]

- eval: E2
  run_id: minted-bo-chu-lap-keo-tha-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bclkt_chu_en
  verified_at: 2026-09-28T12:59:45Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/keo-tha-khong-lap-chu.dom.tsx -t chu-en
    (pass, 1 test across 1 file)

- eval: E3
  run_id: minted-bo-chu-lap-keo-tha-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bclkt_khong_lap
  verified_at: 2026-09-28T12:59:45Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/keo-tha-khong-lap-chu.dom.tsx -t khong-lap
    Ran 3 tests across 1 file. [623.00ms]

- eval: E4
  run_id: minted-bo-chu-lap-keo-tha-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.bclkt_guard
  verified_at: 2026-09-28T12:59:45Z
  output: |
    cd apps/app && bun test test/messages-guard.spec.ts
    Ran 110 tests across 1 file. [673.00ms]

- eval: E5a
  run_id: minted-bo-chu-lap-keo-tha-E5a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.bclkt_thuoc_da_ky
  verified_at: 2026-09-28T12:59:45Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/nguon-keo-tha.dom.tsx && bun test --preload ./test/setup-dom.ts ./test/nguon-canh-nhau.dom.tsx && cd ../../apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/nguon-keo-tha-chu.dom.tsx && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-nguon.dom.tsx
    Ran 10 tests across 1 file. [1277.00ms]

- eval: E5b
  run_id: minted-bo-chu-lap-keo-tha-E5b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bclkt_khong_cham_thuoc
  verified_at: 2026-09-28T12:59:45Z
  output: |
    node _acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs
    khong cham thuoc da ky: 13 tep doi, 0 tep bi cam

- eval: E5c
  run_id: minted-bo-chu-lap-keo-tha-E5c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.msd_man_tai_nguon
  verified_at: 2026-09-28T12:59:45Z
  output: |
    bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs"
    (pass — buoc 1/2/3 deu 'dat')

- eval: E6u
  run_id: bclkt-e6u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bclkt_man_chu
  verified_at: 2026-09-28T12:59:45Z
  screenshot: evidence/E6u-step1.png
  observed: |
    bclkt-tai-1440.png (1440 width, dark theme "Tải nguồn lên" dialog): trong khung nét đứt của vùng kéo-thả, nút outline "+ Chọn tệp" nằm bên trái, ngay sau nó (cùng hàng) là cột chữ hai dòng "Kéo tệp vào đây" (dòng đậm) và "Word (.docx) hoặc PDF, tới 20 MB" (dòng phụ, xám). Không có chữ "hoặc chọn tệp" ở đâu trong khung — khớp đúng bộ ['Chọn tệp','Kéo tệp vào đây','Word (.docx) hoặc PDF, tới 20 MB'] mà man-chu.mjs so khớp. Dialog nằm gọn giữa màn, không tràn. bclkt-tai-390.png (390 width): cùng bố cục, dialog thu hẹp theo cột dọc full-width của viewport 390px, nút "Chọn tệp" + cột chữ "Kéo tệp vào đây" / "Word (.docx) hoặc PDF, tới 20 MB" vẫn hiện đúng, không thấy dấu hiệu tràn ngang (không có thanh cuộn ngang, nội dung dialog không vượt mép phải ảnh chụp).
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-bo-chu-lap-keo-tha-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T12:59:45Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-chu-lap-keo-tha-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T12:59:45Z

- cmd: bun run lint:slop
  run_id: minted-bo-chu-lap-keo-tha-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T12:59:45Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-chu-lap-keo-tha-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T12:59:45Z

## Known limits

## Ngoài hợp đồng

## Analyst

E4, E5a, E5c

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả tám eval (E1-E6u) và bốn lệnh suite (bun run test, turbo lint, lint:slop, turbo build) xanh ngay từ vòng đầu; không có vòng sửa nào.

### Re-pin lần 1 — 2026-09-28, do gộp onehub sau #197 làm hai hồ sơ hoá cũ
run_id: repin-20260928T150205Z-95412
sha: d396c87d065ff5bb77bb79882c1bb576b46bc30a · suites: 4 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E6u · AC không có chốt máy: AC-6

### Re-pin lần 2 — 2026-09-28, do gộp onehub sau #198 làm hai hồ sơ hoá cũ
run_id: repin-20260928T153556Z-55843
sha: a831f519f7ab792b1411655cbc78cbcf0ed20097 · suites: 4 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E6u · AC không có chốt máy: AC-6
