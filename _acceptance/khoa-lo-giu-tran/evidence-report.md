---
schema_version: 2
feature_slug: khoa-lo-giu-tran
verdict: REJECT
failed_evals: [E6]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 977df083bd2d6aefc91cf6fc2a20a4abf140ef95
human_signoff:
---

# Evidence Report: khoa-lo-giu-tran

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | FAIL |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-10 | judgment | PASS (đề xuất panel, chờ human_override) |

## Evidence

- eval: E1
  run_id: minted-khoa-lo-giu-tran-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_tran_retire
  verified_at: 2026-09-06T08:00:00Z
  output: |
    rang tran-retire: retireExhausted(2) trả đúng 2, còn 1 hàng mở

- eval: E2
  run_id: minted-khoa-lo-giu-tran-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_tran_claim
  verified_at: 2026-09-06T08:02:00Z
  output: |
    rang tran-claim: claimDue(2) trả đúng 2, còn 1 hàng chưa thuê
    EXIT_CODE=0

- eval: E3
  run_id: minted-khoa-lo-giu-tran-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_can
  verified_at: 2026-09-06T08:04:00Z
  output: |
    rang can: probe khuôn FROM trả đủ 3 hàng dù LIMIT 2, thống kê không trôi

- eval: E4
  run_id: minted-khoa-lo-giu-tran-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_chieu_do
  verified_at: 2026-09-06T08:06:00Z
  output: |
    rang chieu-do: bản trước sửa đỏ đúng hai bài trần với 'Expected length: 2 / Received length: 3', hai bài bites xanh, cây làm việc nguyên

- eval: E5
  run_id: minted-khoa-lo-giu-tran-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_giai_thich
  verified_at: 2026-09-06T08:08:00Z
  output: |
    rang giai-thich: LockRows loops=1 với CTE Scan ở bản sửa, loops=3 ở bản trước sửa

- eval: E6
  run_id: minted-khoa-lo-giu-tran-E6-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.khoa_lo_dong_thoi
  verified_at: 2026-09-06T08:10:00Z
  output: |
    rang dong-thoi: 8 lượt song parallel, bản sửa 16/16 id khác nhau, bản bỏ khoá chỉ 2/16

- eval: E7
  run_id: minted-khoa-lo-giu-tran-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_toan_tep
  verified_at: 2026-09-06T08:12:00Z
  output: |
    rang toan-tep: 19 pass 0 fail, spec-diff.patch khớp diff sống

- eval: E8
  run_id: minted-khoa-lo-giu-tran-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-06T08:14:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    10 cached, 11 total
      Time:    4.1s

- eval: E9
  run_id: minted-khoa-lo-giu-tran-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-06T08:16:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    4.911s

- eval: E10
  run_id: minted-khoa-lo-giu-tran-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-06T08:18:00Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    211ms

- eval: E11
  run_id: minted-khoa-lo-giu-tran-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-06T08:20:00Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 340ms on 813 files with 9 rules using 18 threads.

- eval: E12
  run_id: minted-khoa-lo-giu-tran-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_tai_lieu
  verified_at: 2026-09-06T08:22:00Z
  output: |
      chiều đỏ ghim: RANG DO: đoạn luật thiếu retireExhausted
      chiều đỏ ghim: RANG DO: đoạn ngay sau luật neo không phải luật CTE (thiếu MATERIALIZED)
    rang tai-lieu: đoạn ngay sau 'claimDue sorts what it claims' nêu claimDue, retireExhausted, MATERIALIZED; bốn bản sao hỏng đỏ đúng thông điệp

- eval: E13
  judged_by: judge panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  votes:
    - domain-correctness: PASS — tasks.ts sửa bằng `WITH due/exhausted AS MATERIALIZED (...)` — đúng cam kết có tài liệu của Postgres (CTE dùng một lần sẽ bị planner inline trừ khi ép MATERIALIZED), không phải suy đoán từ hành vi planner; design doc còn phân biệt rõ với `ARRAY(...)` InitPlan bị coi là "chi tiết thực thi" nên không dùng. khoa-lo-giu-tran.rang.ts đo đúng cơ chế: bắt nguyên câu SQL từ sự kiện query Prisma rồi `EXPLAIN (ANALYZE)` để đọc số `loops` của node `LockRows` và có `CTE Scan` hay không (loops=1 bản sửa, loops=3 bản trước sửa) — không đo qua tỉ lệ pass/fail gián tiếp. spec-diff.patch cho thấy thay đổi trong tasks.integration.spec.ts là THUẦN THÊM MỚI (một describe block mới ở cuối tệp), không dòng nào trong khối test cũ (claimDue/retireExhausted/completeTask/scheduleTask) bị sửa hay nới lỏng.
    - operational-feasibility: PASS — tasks.ts dùng `WITH due AS MATERIALIZED (...)` / `WITH exhausted AS MATERIALIZED (...)` cho cả claimDue và retireExhausted — đây là cam kết có tài liệu của Postgres (CTE MATERIALIZED luôn được tính đúng một lần trước khi phần còn lại của truy vấn chạy), không phải suy đoán từ hành vi planner quan sát được. Tệp rang đo đúng cơ chế: bắt sống câu SQL thật từ sự kiện query của Prisma (không chép tay) rồi chạy EXPLAIN ANALYZE, assert `loops=1` + có `CTE Scan` cho bản sửa và `loops=3` cho bản trước sửa lấy từ git sha 746d3ef8 — đúng thứ contract AC-3/AC-5 gọi là "số lượt LockRows", cùng bài concurrent đếm id trùng khi bỏ `FOR UPDATE SKIP LOCKED`. Bốn bài "planner re-runs it per row" trong tasks.integration.spec.ts đo số hàng dưới bộ dựng tự canh thống kê (`reltuples` ném lỗi ghim nếu trôi) — đúng khuôn "đo dưới thống kê thù địch" mà chính contract liệt là đo cơ chế chứ không phải triệu chứng đơn thuần. spec-diff.patch cho thấy thay đổi tệp kiểm là THUẦN THÊM (toàn dòng `+` sau dòng 239, không dòng nào trong các bài kiểm cũ bị sửa hay xoá) — không bài kiểm cũ nào bị nới để xanh.
    - spec-alignment: PASS — tasks.ts dùng `WITH ... AS MATERIALIZED` cho cả claimDue và retireExhausted — đây là từ khoá tài liệu hoá của Postgres buộc CTE tính một lần, không phải may rủi bộ lập kế hoạch, và rang.ts đo trực tiếp cơ chế đó bằng EXPLAIN thật (LockRows loops=1 + CTE Scan ở bản sửa, loops=3 ở bản trước sửa, bắt từ sự kiện query Prisma chứ không chép tay). Bộ bốn bài "planner re-runs it per row" trong tasks.integration.spec.ts đo số hàng dưới thống kê thù địch được dựng tất định (ANALYZE giữa các lần chèn, tự kiểm `pg_class.reltuples` ném lỗi ghim nếu trôi) — đúng loại phép đo mà hợp đồng định nghĩa là "cơ chế" chứ không phải "triệu chứng". spec-diff.patch chỉ toàn dòng thêm (không có dòng xoá/sửa) trên các bài kiểm cũ, nên không bài nào bị nới lỏng để xanh.
  human_override:

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

- E8 (`bun run db:test && bun run test`)
- E9 (`bunx turbo run check-types --force`)
- E10 (`bunx turbo run lint --force`)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: baseline A/B đo cho evals.yaml hiện tại (chi tiết kết quả round 1 không nằm trong input truyền cho round này).
Round 2: E6 (dong-thoi) FAIL, exit 1 trên lệnh `rang.sh --chan dong-thoi` — verdict REJECT, quay lại implementation.
