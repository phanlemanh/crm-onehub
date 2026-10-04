---
schema_version: 2
feature_slug: ngay-gieo-theo-gio-vn
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f1dc3a0b31cebbabb5759766220011401697308a
human_signoff: Phan Le Manh 2026-09-23
---

# Evidence Report: ngay-gieo-theo-gio-vn

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-6 | script | PASS |
| E10 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ngay-gieo-theo-gio-vn-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ngv_khung_dem
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    Ran 2 tests across 1 file. [357.00ms]
    test-run: dropped crm_mudc5jd33gij_test

- eval: E2
  run_id: minted-ngay-gieo-theo-gio-vn-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ngv_khung_ngay
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    20 expect() calls
    Ran 2 tests across 1 file. [358.00ms]
    test-run: dropped crm_mudc5jbvo3fw_test

- eval: E3
  run_id: minted-ngay-gieo-theo-gio-vn-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ngv_ngay_gieo
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    2 expect() calls
    Ran 2 tests across 1 file. [276.00ms]
    test-run: dropped crm_mudc5iokkmlo_test

- eval: E4
  run_id: minted-ngay-gieo-theo-gio-vn-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ngv_dot_bien_utc
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    ban pha UTC · ngay-gieo-theo-vn: khung-dem: do voi «khung-dem: ngayCach(-1, 0, 3, 4) theo ngay lich VN»
    ban pha UTC · ngay-gieo-theo-vn: khung-ngay: xanh (dung ky vong)
    dot-bien-utc: XANH — vat lanh xanh ca bon ca; tra ngayCach ve ngay UTC thi khung-dem do dung thong diep, khung-ngay van xanh

- eval: E5
  run_id: mudc5jjvlw6c
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ngv_ca_tep
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    102 expect() calls
    Ran 14 tests across 1 file. [722.00ms]
    test-run: dropped crm_mudc5jjvlw6c_test

- eval: E6
  run_id: minted-ngay-gieo-theo-gio-vn-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    Cached:    2 cached, 11 total
      Time:    35.303s
    test-run: dropped crm_mudc5heu8izs_test

- eval: E7
  run_id: minted-ngay-gieo-theo-gio-vn-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    Tasks:    13 successful, 13 total
    Cached:    13 cached, 13 total
      Time:    26ms >>> FULL TURBO

- eval: E8
  run_id: minted-ngay-gieo-theo-gio-vn-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    296ms

- eval: E9
  run_id: minted-ngay-gieo-theo-gio-vn-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    Found 0 warnings and 0 errors.
    Finished in 559ms on 1173 files with 9 rules using 14 threads.

- eval: E10
  run_id: minted-ngay-gieo-theo-gio-vn-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-23T07:05:00+07:00
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    10.178s

## Known limits

## Ngoài hợp đồng

## Analyst

E5, E6, E7, E8, E9 — xanh trên CẢ HEAD lẫn baseline diffBase (607fe361), nên không tự phân biệt được hành vi mới của feature này; đây là các lệnh chứng/hồi quy của kho, không phải răng đo trực tiếp cách tính giờ VN:

- `bun run test -- "cd apps/api && bun test test/moi-phia-ke-hoach.spec.ts"` (E5) — chạy cả tệp, đã xanh sẵn trên baseline ngoài khung giờ đỏ; giá trị phân biệt nằm ở E1 (đúng khung đêm, baseline đỏ), không ở E5.
- `bun run test` (E6) — hồi quy toàn kho, xanh trên cả hai phía vì chỉ một ca trong toàn bộ suite từng đỏ theo khung giờ.
- `bun run check-types` (E7) — không đọc `ngayCach`, xanh trên cả hai phía theo thiết kế.
- `bunx turbo run lint --force` (E8) — không đọc `ngayCach`, xanh trên cả hai phía theo thiết kế.
- `bun run lint:slop` (E9) — không đọc `ngayCach`, xanh trên cả hai phía theo thiết kế.

Đây là các regression-guard có chủ ý (AC-6 đòi năm lệnh chứng thoát 0), không cần viết lại để phân biệt — răng phân biệt thật của vòng này là E1/E2/E3 (baseline đỏ) và E4 (đột biến UTC).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E10 đều xanh ngay ở lần chấm đầu tiên; không có eval nào đỏ, không cần quay lại implementation. Một phát hiện ngoài hợp đồng được ghi lại (mô tả sai "round-trip qua writer" trong evals.yaml — xem review-findings.md).

### Re-pin lần 1 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T053254Z-97828
sha: 3f3c60fe85ce0734a0f149a37c6c24dd52b98a74 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T102557Z-19741
sha: c0d7bd90bfedb66192708fd6a8e15fb7f08c5700 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 3 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T122715Z-87704
sha: f1dc3a0b31cebbabb5759766220011401697308a · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng
