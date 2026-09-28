---
schema_version: 2
feature_slug: man-chu-theo-khoa-kho-nguon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5053e991b79b441e0247fd416ee9d786451e41ef
human_signoff:
---

# Evidence Report: man-chu-theo-khoa-kho-nguon

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-man-chu-theo-khoa-kho-nguon-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bclkt_man_chu
  verified_at: 2026-09-28T15:26:11Z
  screenshot: evidence/E1-step1.png
  observed: |
    Frame E1-step1.png (1440, đọc bằng Read): hộp thoại "Tải nguồn lên" đang mở, mô tả "Máy soạn đọc tệp và soạn một bản đề xuất cho một trang...". Vùng kéo-thả hiện đúng nút "+ Chọn tệp", chữ "Kéo tệp vào đây" và phụ đề "Word (.docx) hoặc PDF, tới 20 MB" — đúng 3 dòng chữ vùng kéo-thả script kỳ vọng (CHU_VUNG). Không thấy dấu hiệu tràn ngang ở bề rộng 1440. Khớp Expected.
    Frame E1-step2.png (390, đọc bằng Read): cùng hộp thoại "Tải nguồn lên" nhưng đã xếp lại vừa khung hẹp — vùng kéo-thả vẫn hiện "+ Chọn tệp" / "Kéo tệp vào đây" / "Word (.docx) hoặc PDF, tới 20 MB", các trường bên dưới (Tên trang, Loại trang, Đơn vị, Chủ trang, nút Tải lên/Huỷ) xếp dọc, không phần tử nào vượt mép phải khung 390px, không thấy thanh cuộn ngang. Khớp Expected và khớp báo cáo máy (script tự đo scrollWidth qua d.cuonNgang() và không đẩy lỗi "390 cuon ngang").
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-man-chu-theo-khoa-kho-nguon-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mctkkn_khoa_rong
  verified_at: 2026-09-28T15:26:11Z
  output: |
    khoa rong: dung ghim — ma 2, goi ten KHO_TAI_LIEU_BLOB_TOKEN

    __EXIT=0

- eval: E3
  run_id: minted-man-chu-theo-khoa-kho-nguon-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mctkkn_chieu_do
  verified_at: 2026-09-28T15:26:11Z
  output: |
    chieu do can khoa: 2/2

    __EXIT=0

- eval: E4
  run_id: minted-man-chu-theo-khoa-kho-nguon-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mctkkn_ten_khoa
  verified_at: 2026-09-28T15:26:11Z
  output: |
    ten khoa KHO_TAI_LIEU_BLOB_TOKEN: 4/4 o dat

    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-man-chu-theo-khoa-kho-nguon-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T15:26:11Z

- cmd: bunx turbo run lint --force
  run_id: minted-man-chu-theo-khoa-kho-nguon-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T15:26:11Z

- cmd: bun run lint:slop
  run_id: minted-man-chu-theo-khoa-kho-nguon-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T15:26:11Z

- cmd: bunx turbo run build --force
  run_id: minted-man-chu-theo-khoa-kho-nguon-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T15:26:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4 đều PASS ngay lần chạy đầu; bốn lệnh suite (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) đều xanh. Không cần vòng lặp thêm.
