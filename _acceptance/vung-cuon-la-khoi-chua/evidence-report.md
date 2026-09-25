---
schema_version: 2
feature_slug: vung-cuon-la-khoi-chua
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7dc95c91f1cda9b80e518a5f3b04f15019554701
human_signoff:
---

# Evidence Report: vung-cuon-la-khoi-chua

> REJECT — tất cả 8 eval (E1–E8) gắn AC đều PASS, nhưng lệnh suite `bun run test` thoát mã 1 (không gắn eval nào). Đây là một trong năm lệnh chứng minh bắt buộc của CLAUDE.md (`bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`) nên riêng nó chặn verdict tổng, dù không eval nào rớt. Xem khối `bun run test` dưới `### Lệnh suite (hồi quy)`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-vung-cuon-la-khoi-chua-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:22:59Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E2
  run_id: minted-vung-cuon-la-khoi-chua-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:22:59Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E3
  run_id: minted-vung-cuon-la-khoi-chua-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:22:59Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E4
  run_id: minted-vung-cuon-la-khoi-chua-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:22:59Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E5
  run_id: minted-vung-cuon-la-khoi-chua-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:22:59Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E6
  run_id: minted-vung-cuon-la-khoi-chua-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:22:59Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E7
  run_id: minted-vung-cuon-la-khoi-chua-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:22:59Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E8
  run_id: minted-vung-cuon-la-khoi-chua-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:22:59Z
  screenshot: _acceptance/vung-cuon-la-khoi-chua/evidence/truong-1440-cuoi.png
  observed: |
    6/6 ảnh đối chiếu đúng Expected: (1) truong-1440-cuoi.png — đầu trang ở mép trên, thanh bên nguyên, hàng cuối bảng trường + nút "Trương mới" trong vùng nội dung. (2) truong-1440-doi-chung.png — đầu trang đã trôi khỏi mép trên (chỉ còn thấy mục "KET NOI VA DU LIEU" của sidebar ở đỉnh ảnh), nút settings đứng yên ở góc do main ép position static. (3) truong-768-cuoi.png — đầu trang nguyên mép trên, sidebar nguyên, hàng cuối hiện đủ. (4) truong-768-doi-chung.png — đầu trang trôi mất, đỉnh ảnh chỉ còn câu mô tả bị cắt. (5) truong-375-cuoi.png — đầu trang + thanh tab ngang (biến thể mobile) ở mép trên, cuộn tới cuối. (6) truong-375-doi-chung.png — đầu trang trôi hết, đỉnh ảnh chỉ còn chữ "TRUONG TU TAO" bị cắt. Không có mâu thuẫn nào với Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bun_run_test-r1
  exit_code: 1
  verified_at: 2026-09-25T15:22:59Z
  output: |
    @crm/validation:test: (pass) okr-tinh-trang > bay ca: chua ky vong, cam ket ba muc, tham vong hai muc [0.06ms]
    @crm/validation:test:
    @crm/validation:test: test/zalo-webhook.spec.ts:
    @crm/validation:test: (pass) zalo-webhook > hai khuon cho cung ket qua [0.64ms]
    @crm/validation:test: (pass) zalo-webhook > khoa-thua: message co khoa la van doc [0.02ms]
    @crm/validation:test: (pass) zalo-webhook > lai: khuon that hop le thang khi co ca result [0.01ms]
    @crm/validation:test: (pass) zalo-webhook > sai khuon nem thong diep webhook, khong mang gia tri [0.17ms]
    @crm/validation:test: (pass) zalo-webhook > khong-doi-tuong va ma-rong: mo ta khong nem [0
    [Output truncated by tool] — output tail dừng ở các ca pass, nguyên nhân exit_code 1 nằm ngoài đoạn được giữ lại; cần chạy nguyên văn lại lệnh này để thấy tên ca đỏ trước khi trả về S3.

- cmd: bunx turbo run lint --force
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-25T15:22:59Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
    Time:    467ms

- cmd: bun run lint:slop
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-25T15:22:59Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 755ms on 1474 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-25T15:22:59Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
    Time:    12.045s

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E8 đều PASS (baseline: E1–E7 đỏ, E8 n-a, có phân biệt) — nhưng `bun run test` thoát mã 1, không gắn eval nào, chặn verdict tổng thành REJECT. Trả về S3 để tìm và sửa ca test đỏ (output tail bị cắt trước dòng tổng kết), rồi chạy lại nguyên văn cả 5 lệnh chứng minh trước khi verify lại.
