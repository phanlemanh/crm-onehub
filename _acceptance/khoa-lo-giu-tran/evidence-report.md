---
schema_version: 2
feature_slug: khoa-lo-giu-tran
verdict: BLOCKED
failed_evals: ["E11"]
reason: "bash _acceptance/khoa-lo-giu-tran/rang.sh --chan chieu-do — Module resolution failed: Cannot find module './internal/class' in Prisma client. Expected 2 pass / 2 fail, but got 0 pass / 1 fail."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b425b048ec216752f38f8c7109889ce661028d06
human_signoff:
---

# Evidence Report: khoa-lo-giu-tran

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | BLOCKED |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | FAIL |
| E12 | AC-9 | script | PASS |
| E13 | AC-10 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-khoa-lo-giu-tran-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_tran_retire
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
    rang tran-retire: retireExhausted(2) trả đúng 2, còn 1 hàng mở

- eval: E2
  run_id: minted-khoa-lo-giu-tran-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_tran_claim
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
    rang tran-claim: claimDue(2) trả đúng 2, còn 1 hàng chưa thuê

- eval: E3
  run_id: minted-khoa-lo-giu-tran-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_can
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
    rang can: probe khuôn FROM trả đủ 3 hàng dù LIMIT 2, thống kê không trôi
    EXIT_CODE: 0

- eval: E4
  run_id: minted-khoa-lo-giu-tran-E4-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.khoa_lo_chieu_do
  verified_at: 2026-09-06T08:42:00+07:00
  reason: "Module resolution failed: Cannot find module './internal/class' in Prisma client. Expected 2 pass / 2 fail, but got 0 pass / 1 fail."
  output: |
    RANG DO: mong 2 pass / 2 fail, nhận 0 pass / 1 fail
    error: Cannot find module './internal/class' from '/Users/manhphan/dev/crm-onehub/.claude/worktrees/compassionate-bouman-5898d4/packages/db/src/generated/prisma/client.ts'

- eval: E5
  run_id: minted-khoa-lo-giu-tran-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_giai_thich
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
    rang giai-thich: LockRows loops=1 với CTE Scan ở bản sửa, loops=3 ở bản trước sửa

- eval: E6
  run_id: minted-khoa-lo-giu-tran-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_dong_thoi
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
    rang dong-thoi: 8 lượt song song, bản sửa 16/16 id khác nhau, bản bỏ khoá chỉ 4/16

- eval: E7
  run_id: minted-khoa-lo-giu-tran-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_toan_tep
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
    rang toan-tep: 19 pass 0 fail, spec-diff.patch khớp diff sống

- eval: E8
  run_id: minted-khoa-lo-giu-tran-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
     Tasks:    11 successful, 11 total
    Cached:    10 cached, 11 total
      Time:    2.461s

- eval: E9
  run_id: minted-khoa-lo-giu-tran-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    4.675s

- eval: E10
  run_id: minted-khoa-lo-giu-tran-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    216ms

- eval: E11
  run_id: minted-khoa-lo-giu-tran-E11-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
    x anti-slop(no-runtime-typeof): A runtime `typeof` check only narrows an unparsed representation; it does not establish the expected contract. Parse the value into a strongly typed domain type at the earliest possible point, as close as possible to the I/O boundary where the data originated.
        ,-[apps/agent/rang/khoa-lo-giu-tran.rang.ts:93:3]
     92 |     return params.map((value) =>
     93 |         typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)
        :         ^^^^^^^^^^^^
     94 |             ? new Date(value)
     `----

    Found 0 warnings and 1 error.
    Finished in 368ms on 813 files with 9 rules using 18 threads.
    error: script "lint:slop" exited with code 1

- eval: E12
  run_id: minted-khoa-lo-giu-tran-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_tai_lieu
  verified_at: 2026-09-06T08:42:00+07:00
  output: |
    rang tai-lieu: luật nêu claimDue, retireExhausted, MATERIALIZED ngay sau 'claimDue sorts what it claims'; bản sao thiếu MATERIALIZED thì đỏ
    EXIT_CODE=0

- eval: E13
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Code (tasks.ts) khớp thiết kế: cả hai hàm dùng WITH … AS MATERIALIZED, và khoa-lo-giu-tran.rang.ts đo đúng cơ chế (LockRows loops=1 vs loops=3 qua EXPLAIN, cộng CTE Scan), không chỉ triệu chứng; spec-diff.patch cho thấy khối test mới là thuần bổ sung, không bài cũ nào bị nới lỏng. Nhưng chính design-doc tự nêu một dữ kiện chưa giải thích: đột biến đổi `AS MATERIALIZED` thành `AS NOT MATERIALIZED` KHÔNG lật kết quả (vẫn 4/4 pass) — nếu bỏ đúng từ khoá được cho là "cam kết có tài liệu" mà hành vi không đổi, thì bằng chứng hiện có không phân biệt được giữa "MATERIALIZED là cơ chế thật" và "một yếu tố khác (cấu trúc CTE + FOR UPDATE) mới là cái chặn, còn NOT MATERIALIZED bị Postgres âm thầm bỏ qua vì lý do khác" — tài liệu không dẫn nguồn Postgres nào giải quyết mâu thuẫn này.
    - operational-feasibility: PASS — tasks.ts dùng `WITH … AS MATERIALIZED` — đây là cam kết có tài liệu của Postgres (CTE có MATERIALIZED luôn được tính đúng một lần, khác InitPlan `ARRAY(…)` chỉ là chi tiết thực thi), không phải suy đoán theo hành vi planner. Tệp rang đo đúng cơ chế: `lockRowsLoops` bắt nguyên văn SQL từ sự kiện query của Prisma rồi chạy `EXPLAIN ANALYZE` để đọc số `loops` của nút `LockRows` và sự có mặt của `CTE Scan` (loops=1+CTE Scan ở bản sửa, loops=3 ở bản trước sửa) — đây là chỉ dấu cơ chế lập kế hoạch thật, không phải chỉ đếm hàng kết quả; các bài "fixture bites"/"planner re-runs" trong `tasks.integration.spec.ts` bổ sung bằng bộ dựng thống kê thù địch tự canh (`reltuples` ném lỗi ghim nếu trôi) nên không đo triệu chứng suông. `spec-diff.patch` chỉ có dòng `+` (một `describe` mới được thêm vào cuối tệp), không có dòng `-` nào chạm 241 dòng bài kiểm cũ, nên không bài kiểm cũ nào bị nới lỏng.
    - spec-alignment: PASS — tasks.ts dùng `WITH … AS MATERIALIZED` — cam kết ép Postgres tính CTE đúng một lần, đúng như design doc nêu (ARRAY/InitPlan bị loại vì chỉ là chi tiết thực thi, không phải cam kết tài liệu). Bốn bài "planner re-runs it per row" đo triệu chứng (số hàng) trên bộ dựng thù địch tự canh bằng `reltuples`, nhưng đó là phép đo hồi quy rẻ, được đặt tên đúng bản chất; phép đo cơ chế thật (LockRows loops=1 vs 3, CTE Scan qua EXPLAIN ANALYZE bắt từ sự kiện query Prisma) nằm riêng ở khoa-lo-giu-tran.rang.ts theo đúng AC-5, không lẫn với bài triệu chứng. spec-diff.patch cho thấy thay đổi trong tasks.integration.spec.ts chỉ là thêm mới (một describe block ở cuối file), không sửa dòng nào của 19 bài kiểm cũ — không bài nào bị nới lỏng.
  rationale: Panel đề xuất PASS nhưng lens domain-correctness giữ UNCERTAIN vì đột biến MATERIALIZED → NOT MATERIALIZED không lật được kết quả 4/4, nên bằng chứng hiện có không phân biệt được cam kết MATERIALIZED với một cơ chế khác (CTE + FOR UPDATE) là cái thật sự chặn planner.
  required_evidence:
    - EXPLAIN (ANALYZE, COSTS OFF) của đúng câu UPDATE khi CTE đổi thành `AS NOT MATERIALIZED`, chạy trên bộ dựng thống kê cũ giống lockRowsLoops() trong khoa-lo-giu-tran.rang.ts — nếu plan vẫn hiện CTE Scan/LockRows loops=1 (Postgres tự ép materialize bất kể hint vì CTE có FOR UPDATE), điều đó xác nhận cam kết tài liệu; nếu loops=3 mà bài kiểm 4/4 vẫn xanh, đó là bằng chứng bài kiểm không nhạy với đúng triệu chứng cần bắt.
    - Trích dẫn nguyên văn từ tài liệu Postgres chính thức (phiên bản đang dùng trong CI, mục WITH Queries / CTE materialization) nêu rõ một CTE chứa FOR UPDATE/SKIP LOCKED không thể bị inline bất kể từ khoá MATERIALIZED/NOT MATERIALIZED — nếu không có câu tài liệu này, khẳng định 'cam kết có tài liệu' trong contract và design-doc chưa có nguồn xác nhận trực tiếp cho đúng tình huống FOR UPDATE.
  human_override:

## Known limits

## Ngoài hợp đồng

## Analyst

E8, E9, E10 (bun run db:test && bun run test; bunx turbo run check-types --force; bunx turbo run lint --force) xanh trên cả HEAD và diffBase — đây là các suite kiểm hồi quy toàn kho, không riêng cho tính năng này, nên coi là regression-guard bình thường (chúng đúng như thiết kế: xác nhận sửa khoá-lô không làm hỏng phần còn lại), không phải dấu hiệu eval thiếu độ nhạy.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E4 blocked (Prisma client module resolution: không tìm thấy './internal/class' khi nạp bản tasks.ts trước sửa để dựng chiều đối chứng), E11 failed (lint:slop anti-slop/no-runtime-typeof tại apps/agent/rang/khoa-lo-giu-tran.rang.ts:93). Trả về implementation.
