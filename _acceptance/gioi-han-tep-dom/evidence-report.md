---
schema_version: 2
feature_slug: gioi-han-tep-dom
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: eb4f693b8c3679cc7986007e9dcd07bb4d242cf1
human_signoff: 
---

# Evidence Report: gioi-han-tep-dom

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: gioi-han-tep-dom-e1-r1-1790779704
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtd_qua_gio
  verified_at: 2026-09-30T14:48:24Z
  output: |
    bun test v1.3.10 (30e609e0)
     2 pass
     2 filtered out
     0 fail
     9 expect() calls
    Ran 2 tests across 1 file. [1.64s]

- eval: E2
  run_id: gioi-han-tep-dom-e2-r1-1790779725
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtd_thoi_luong
  verified_at: 2026-09-30T14:48:45Z
  output: |
    bun test v1.3.10 (30e609e0)
     1 pass
     3 filtered out
     0 fail
     8 expect() calls
    Ran 1 test across 1 file. [400.00ms]

- eval: E3
  run_id: gioi-han-tep-dom-e3-r1-1790779725
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtd_do
  verified_at: 2026-09-30T14:48:45Z
  output: |
    bun test v1.3.10 (30e609e0)
     1 pass
     3 filtered out
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [98.00ms]

- eval: E4
  run_id: gioi-han-tep-dom-e4-r1-1790779863
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtd_bo_that
  verified_at: 2026-09-30T14:51:03Z
  output: |
    E4 apps/app: 82 tệp, đạt
    E4 packages/ui: 32 tệp, đạt
    E4 đạt
    packages/ui: chay-dom: 32 tệp xanh sau 23.8 s (giới hạn mỗi tệp 60.0 s)
    packages/ui: chay-dom: chậm nhất — test/giu-thay-doi.dom.tsx 6.1 s · test/ong-dung-doc.dom.tsx 1.1 s · test/trinh-soan-dan.dom.tsx 1.0 s · test/trinh-soan-lien-ket.dom.tsx 0.9 s · test/tree-nav.dom.tsx 0.9 s
    apps/app: chay-dom: 82 tệp xanh sau 98.7 s (giới hạn mỗi tệp 60.0 s)
    apps/app: chay-dom: chậm nhất — test/the-gop-y-okr.dom.tsx 9.5 s · test/khung-tao-okr.dom.tsx 5.5 s · test/tro-ly-okr-gop-y.dom.tsx 4.7 s · test/sua-luu-tru.dom.tsx 3.7 s · test/okr-hoi-y.dom.tsx 3.4 s

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: gioi-han-tep-dom-suite-bun-run-test-r1-1790780316
  exit_code: 0
  verified_at: 2026-09-30T14:58:36Z

- cmd: bunx turbo run lint --force
  run_id: gioi-han-tep-dom-suite-bunx-turbo-run-lint-force-r1-1790780331
  exit_code: 0
  verified_at: 2026-09-30T14:58:51Z

- cmd: bun run lint:slop
  run_id: gioi-han-tep-dom-suite-bun-run-lint-slop-r1-1790780344
  exit_code: 0
  verified_at: 2026-09-30T14:59:04Z

- cmd: bunx turbo run build --force
  run_id: gioi-han-tep-dom-suite-bunx-turbo-run-build-force-r1-1790780392
  exit_code: 0
  verified_at: 2026-09-30T14:59:52Z

## Known limits

## Ngoài hợp đồng

- `packages/ui/test/chay-tung-tep-dom.ts:49-54` (thấp) — khi một tệp quá giờ, trình chạy chỉ giết đúng tiến trình `bun test` của tệp đó, không giết cả nhóm tiến trình của nó. Nếu một tệp DOM tự sinh tiến trình con, tiến trình con đó sống tiếp và vẫn giữ đầu ra của job, nên CI có thể vẫn đứng dù trình chạy đã báo tên tệp và thoát. Ca treo của AC-1 là treo ngay trong tiến trình `bun test`, nên hợp đồng vẫn đúng; bộ DOM hiện không có tệp nào sinh tiến trình con.
- `packages/ui/test/chay-tung-tep-dom.ts:61` (thấp) — một tệp chết vì tín hiệu khác quá giờ (sập, bị hệ điều hành giết vì hết bộ nhớ) được báo là «đỏ (mã 1)», mất tên tín hiệu, nên người đọc log không phân biệt được test sai với tiến trình sập. Hành vi có từ trước vòng này.
- `packages/ui/test/chay-tung-tep-dom.spec.ts:89,101` (thấp) — nếu không sinh được tiến trình `bun -e`, `pid` rơi về 0 và đồng hồ riêng của bộ đo gửi SIGKILL tới nhóm tiến trình của chính lượt test (có thể kéo theo cả `bun run test`), còn phép kiểm «nhóm còn sống» luôn trả đúng. Chỉ nằm trong bộ đo, chỉ xảy ra khi không chạy được `bun`.

## Analyst

none identified — baseline không chạy ở lượt này (n-a): người chấm không được checkout cây diffBase. Tại 9ee65d12 cả ba tệp đo (`chay-tung-tep-dom.spec.ts`, `chay-dom-config.ts`, `rang/bo-that.mjs`) chưa tồn tại, nên bốn lệnh eval không thể xanh trên cây cũ; phân biệt thật của E1–E4 do các lượt đột biến ở S3 chứng, không do lượt này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E4 và bốn lệnh suite (test, lint, lint:slop, build) đều xanh ngay vòng đầu; review chỉ đọc không có phát hiện trong hợp đồng, ba phát hiện thấp ngoài hợp đồng ghi ở mục trên.
