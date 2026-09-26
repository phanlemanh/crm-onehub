---
schema_version: 2
feature_slug: khoa-api-ghi-thua
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4c243fac01bac6b029570e197ce5831b2b4e4a64
human_signoff:
---

# Evidence Report: khoa-api-ghi-thua

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | judgment | UNCERTAIN |
| E14 | AC-10 | judgment | PASS |

## Evidence

- eval: E1
  run_id: muhoxqehpmt5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_khong_ghi_trong_nguong
  verified_at: 2026-09-26T01:07:13Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [745.00ms]
    test-run: dropped crm_muhoxqehpmt5_test

- eval: E2
  run_id: minted-khoa-api-ghi-thua-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_bien_nguong
  verified_at: 2026-09-26T01:07:13Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [1481.00ms]
    test-run: dropped crm_muhox2zsjk46_test

- eval: E3
  run_id: muhox3fo7ee8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_hai_chieu_thu_vien
  verified_at: 2026-09-26T01:07:13Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [241.00ms]
    test-run: dropped crm_muhox3fo7ee8_test

- eval: E4
  run_id: muhox4a84y84
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_rate_limit_bat
  verified_at: 2026-09-26T01:07:13Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [124.00ms]
    test-run: dropped crm_muhox4a84y84_test

- eval: E5
  run_id: muhox54m1jyl
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_tu_choi_van_giu
  verified_at: 2026-09-26T01:07:13Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [896.00ms]
    test-run: dropped crm_muhox54m1jyl_test

- eval: E6
  run_id: muhox4bs0qn2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_chong_troi
  verified_at: 2026-09-26T01:07:13Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [110.00ms]
    test-run: dropped crm_muhox4bs0qn2_test

- eval: E7
  run_id: minted-khoa-api-ghi-thua-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kagt_tai_lieu
  verified_at: 2026-09-26T01:07:13Z
  output: |
    tai-lieu: muc «API keys run on a patched library» co du bon chuoi

- eval: E8
  run_id: muhox1xcqnl4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-26T01:07:13Z
  output: |
    Time:    1m30.908s
    test-run: dropped crm_muhox1xcqnl4_test

- eval: E9
  run_id: minted-khoa-api-ghi-thua-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-26T01:07:13Z
  output: |
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
    Time:    8.738s

- eval: E10
  run_id: minted-khoa-api-ghi-thua-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-26T01:07:13Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
    Time:    478ms

- eval: E11
  run_id: minted-khoa-api-ghi-thua-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-26T01:07:13Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 798ms on 1486 files with 9 rules using 14 threads.

- eval: E12
  run_id: minted-khoa-api-ghi-thua-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-26T01:07:13Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
    Time:    16.968s

- eval: E13
  criterion: AC-9
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: FAIL
  votes:
    - domain-correctness: FAIL — Nhánh mới trong claimUsageInDatabase (chỉ khi có lastRequestUpdateIntervalMs) chứa `if (opts.storage === "secondary-storage" && opts.fallbackToDatabase) await setApiKey(ctx, row, opts);` — tức có chạm và đổi hành vi đường secondary-storage (dùng row thay vì finalRow, gọi sớm hơn), trái với đúng câu khẳng định "không chạm ... secondary-storage" trong cả câu hỏi lẫn design doc. Các phần còn lại của câu hỏi (hai nhánh skip của evaluateRateLimit, không đổi cách đếm rate-limit bật, không thêm chú thích, ngưỡng nằm ở packages/auth/src/api-keys.ts) đều khớp thực tế.
    - operational-feasibility: FAIL — Đúng là hai nhánh skip của evaluateRateLimit và lần ghi updatedAt cuối của claimUsageInDatabase đều được rào bằng lastRequestUpdateIntervalMs, không đổi cách đếm nhánh rate-limit bật, không chạm consumeRemaining, không thêm chú thích, và ngưỡng nằm đúng ở packages/auth/src/api-keys.ts (API_KEY_USAGE.lastRequestIntervalMs). Nhưng câu hỏi còn khẳng định bản vá "không chạm... secondary-storage" — sai: trong claimUsageInDatabase, nhánh mới thêm hẳn một lệnh gọi có điều kiện trên chính storage kiểu secondary-storage.
    - spec-alignment: PASS — Patch changes exactly the two evaluateRateLimit skip branches (via a new stampLastRequest helper gated on lastRequestUpdateIntervalMs) and the final updatedAt stamp in claimUsageInDatabase (gated on an explicit lastRequestUpdateIntervalMs check); the third skip branch, the counting branches, and consumeRemaining are untouched, the secondary-storage sync is preserved unchanged, and no comment lines are added anywhere in the diff. The threshold constant (API_KEY_USAGE.lastRequestIntervalMs, derived from MINUTE_MS, as const) lives in packages/auth/src/api-keys.ts as claimed.
  verdict: UNCERTAIN
  rationale: Hội đồng chia phiếu 2/3 (domain-correctness, operational-feasibility) so với 1/3 (spec-alignment) về việc bản vá có chạm nhánh secondary-storage của claimUsageInDatabase hay không, trái với câu khẳng định "không chạm ... secondary-storage" trong câu hỏi và trong design doc. Mọi phần khác của câu hỏi (hai nhánh skip của evaluateRateLimit, không đổi cách đếm rate-limit bật, không thêm chú thích, ngưỡng ở packages/auth/src/api-keys.ts) được cả ba lens xác nhận khớp thực tế — bất đồng chỉ nằm ở vế secondary-storage.
  required_evidence:
    - patches/@better-auth%2Fapi-key@1.6.25.patch dòng 38-39: đoạn code mới `if (opts.lastRequestUpdateIntervalMs !== void 0) { if (opts.storage === "secondary-storage" && opts.fallbackToDatabase) await setApiKey(ctx, row, opts); return row; }` trong claimUsageInDatabase — chứng minh patch có chạm nhánh secondary-storage
    - docs/superpowers/specs/2026-09-26-khoa-api-ghi-thua-design.md mục Thiết kế, câu "không chạm ... đường secondary-storage" — đối chiếu với đoạn patch trên để thấy mâu thuẫn
    - patches/@better-auth%2Fapi-key@1.6.25.patch, hunk "@@ -1721,6 +1726,10 @@ async function claimUsageInDatabase" — dòng thêm điều kiện trực tiếp trên nhánh secondary-storage, đối chiếu docs/superpowers/specs/2026-09-26-khoa-api-ghi-thua-design.md dòng 49
  human_override:  # chi nguoi ghi

- eval: E14
  criterion: AC-10
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  votes:
    - domain-correctness: PASS — Mục "API keys run on a patched library" (docs/api.md dòng 126-148) trả lời rõ cả hai câu: gỡ bản vá "khi better-auth#10921 được sửa ở thượng nguồn... upgrade, bỏ patchedDependencies và file patch, bỏ option khỏi auth.ts" (dòng 143-146), và khi nâng cấp thư viện thì "redoing the patch... chạy bun patch @better-auth/api-key@<new>, áp lại ba chỗ sửa trong dist/index.mjs và kiểu của option, rồi bun patch --commit" (dòng 138-142).
    - operational-feasibility: PASS — Mục "API keys run on a patched library" (docs/api.md dòng 126-148) trả lời rõ cả hai: câu (1) ở dòng 143 "Remove the patch when better-auth#10921 is fixed upstream with a release that stops writing on every verification while rate limiting is off: upgrade, drop the patchedDependencies entry and the patch file, and drop the option from auth.ts" — nêu đúng điều kiện gỡ và gắn với better-auth#10921; câu (2) ở dòng 138-142 "Upgrading @better-auth/api-key means redoing the patch... Run bun patch @better-auth/api-key@<new>, reapply the three edits in dist/index.mjs and the option type, then bun patch --commit" — nêu đúng việc phải làm khi nâng cấp thư viện.
    - spec-alignment: PASS — Mục "API keys run on a patched library" (docs/api.md dòng 126-148) trả lời rõ cả hai câu: (1) gỡ bản vá khi better-auth#10921 được vá ngược dòng bằng một bản phát hành ngừng ghi mỗi lần xác thực trong khi tắt rate limit — khi đó nâng cấp, bỏ mục patchedDependencies, xoá file patch, bỏ option khỏi auth.ts; (2) khi nâng @better-auth/api-key phải làm lại patch — chạy bun patch @better-auth/api-key@<new>, áp lại ba chỗ sửa trong dist/index.mjs và kiểu của option, rồi bun patch --commit, với phép thử khoa-api-ghi-thua.spec.ts báo lệch phiên bản.
  verdict: PASS
  rationale: Cả ba lens đồng thuận PASS — mục "API keys run on a patched library" ở docs/api.md dòng 126-148 trả lời được cả hai câu hỏi của AC-10 (điều kiện gỡ bản vá gắn với better-auth#10921, và việc phải làm lại patch khi nâng @better-auth/api-key). Không có bất đồng, nhưng human_override vẫn để trống cho người xác nhận ở Cổng 2 trước khi tính vào verdict PASS chung.
  required_evidence:
    - docs/api.md dòng 126-148, mục "API keys run on a patched library" — đối chiếu hai câu hỏi của AC-10 với nội dung mục này
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

E8, E9, E10, E11 — các cổng hồi quy toàn kho (`bun run test`, `bunx turbo run check-types --force`, `bunx turbo run lint --force`, `bun run lint:slop`) đều xanh trên cả nhánh này lẫn baseline trước feature (diffBase): đây là cổng bảo vệ hồi quy chủ ý (regression-guard) chứng minh harness chạy được, không phải phép đo phân biệt riêng cho khoa-api-ghi-thua — giữ nguyên như hiện tại, không cần viết lại. (E12 build không tính vào đây vì baseline của nó là n-a, không phải green.)

## Variance

none — không có eval nào có runs > 1 trong vòng này; mọi eval xác định đều 0/N hoặc N/N (ở đây toàn bộ N/N, không có eval nào flaky).

## Iterations

Round 1: E1–E12 (test/script) đều PASS, bao gồm bốn cổng hồi quy AC-8 (test, check-types, lint, lint:slop, build); E13 (AC-9) hội đồng chia phiếu 2 FAIL / 1 PASS quanh việc bản vá có chạm nhánh secondary-storage của claimUsageInDatabase hay không — chờ người quyết ở Cổng 2; E14 (AC-10) hội đồng đồng thuận PASS, human_override vẫn để trống chờ xác nhận. Chưa quay lại implementation.