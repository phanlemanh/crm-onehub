---
schema_version: 2
feature_slug: khoa-api-ghi-thua
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bc36c2d575122deb12067a7da028614abef51f82
human_signoff: Phan Le Manh 2026-09-26 — ký Cổng 2 trên verdict PASS sau bốn vòng chấm (vòng 4 vượt trần theo quyết định chủ kho), với năm giới hạn đã khai ở Known limits của contract, trong đó có lỗ AC-11 đo hằng khai báo chứ không đo cấu hình plugin đã dựng. Ký trên hiểu biết rằng thẻ Cổng Phạm vi lần ký lại gần nhất đã trình sai nhóm AC-11 và nội dung AC-11 được xác nhận lại ở cổng này.
---

# Evidence Report: khoa-api-ghi-thua

Ghi chú tier: khoa-api-ghi-thua chạm `packages/auth` (api-keys.ts, auth.ts) → risk tier **T3**. Theo luật T3, MỌI judgment item (E13, E14) cần `human_override` cá nhân trước khi verdict tổng được nâng lên PASS, bất kể panel đã đề xuất PASS cho cả hai — đây là lý do verdict tổng round 4 là PENDING-JUDGMENT dù không một eval máy nào fail và không judgment nào ở trạng thái UNCERTAIN.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS (carried r2) |
| E4 | AC-4 | test | PASS (carried r2) |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS (carried r2) |
| E7 | AC-7 | script | PASS (carried r1) |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | judgment | PASS (đề xuất panel — chờ human_override, T3) |
| E14 | AC-10 | judgment | PASS (carried r2 — chờ human_override, T3) |
| E15 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: muhtxaglxm57
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_khong_ghi_trong_nguong
  verified_at: 2026-09-26T03:27:12Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [987.00ms]
    test-run: dropped crm_muhtxaglxm57_test

- eval: E2
  run_id: muhtwv9gnb3x
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_bien_nguong
  verified_at: 2026-09-26T03:27:12Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [1024.00ms]
    test-run: dropped crm_muhtwv9gnb3x_test

- eval: E3
  run_id: muhq238uvnpx
  exit_code: 0
  verifier: config:executors.test.kagt_hai_chieu_thu_vien
  verified_at: 2026-09-26T01:24:49Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: muhq2302k75u
  exit_code: 0
  verifier: config:executors.test.kagt_rate_limit_bat
  verified_at: 2026-09-26T01:24:49Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-khoa-api-ghi-thua-E5-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_tu_choi_van_giu
  verified_at: 2026-09-26T03:27:12Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [1256.00ms]
    test-run: dropped crm_muhtwuzbd1he_test

- eval: E6
  run_id: muhq231cr4is
  exit_code: 0
  verifier: config:executors.test.kagt_chong_troi
  verified_at: 2026-09-26T01:24:49Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-khoa-api-ghi-thua-E7-r1
  exit_code: 0
  verifier: config:executors.script.kagt_tai_lieu
  verified_at: 2026-09-26T01:07:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-khoa-api-ghi-thua-E8-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-26T03:27:12Z
  output: |
    Time:    1m28.419s

    test-run: dropped crm_muhtwutkixhl_test

- eval: E9
  run_id: minted-khoa-api-ghi-thua-E9-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-26T03:27:12Z
  output: |
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
    Time:    8.722s

- eval: E10
  run_id: minted-khoa-api-ghi-thua-E10-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-26T03:27:12Z
  output: |
    Checked 543 files in 271ms. No fixes applied.
    Found 3 warnings.

- eval: E11
  run_id: minted-khoa-api-ghi-thua-E11-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-26T03:27:12Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 696ms on 1486 files with 9 rules using 14 threads.

- eval: E12
  run_id: minted-khoa-api-ghi-thua-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-26T03:27:12Z
  output: |
    app:build:  Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
    Time:    11.017s

- eval: E13
  criterion: AC-9
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  human_override: Đạt — Phan Le Manh 2026-09-26
  votes:
    - domain-correctness: PASS — Bản vá (`@better-auth%2Fapi-key@1.6.25.patch`) chỉ có đúng hai thay đổi hành vi, cả hai đều qua hàm `stampLastRequest` mới được gọi khi và chỉ khi `opts.lastRequestUpdateIntervalMs !== void 0`: (1) hai nhánh `skip` của `evaluateRateLimit` (rate-limit tắt toàn cục, và tắt riêng khoá) đổi `lastRequest: now` thành `lastRequest: stampLastRequest(...)`; (2) `claimUsageInDatabase` thêm một `return row` sớm khi có tuỳ chọn và `opts.storage === "database"`, đúng trước lệnh `adapter.update` đóng dấu `updatedAt` — khớp mô tả trong design doc. Diff không chạm `consumeRateLimit`'s counting logic (start/reset/increment/deny) hay `consumeRemaining`, và không có dòng chú thích nào được thêm. `stampLastRequest` không phân biệt kiểu lưu trữ nên áp cả lên đường secondary-storage — đúng như design doc và AC-9 đã nêu rõ kho không cấu hình `secondaryStorage`. Ngưỡng `API_KEY_USAGE.lastRequestIntervalMs = MINUTE_MS` nằm đúng ở `packages/auth/src/api-keys.ts`, được `auth.ts` truyền vào qua `lastRequestUpdateIntervalMs: API_KEY_USAGE.lastRequestIntervalMs`. Ba nguồn (patch, api-keys.ts, design doc) nhất quán với đúng những gì AC-9 phát biểu.
    - operational-feasibility: PASS — Patch diff modifies exactly two skip branches in evaluateRateLimit via a new stampLastRequest helper that returns the original `now` when the option is absent or lastRequest is null (no behavior change without the option), and adds one guard `if (opts.lastRequestUpdateIntervalMs !== void 0 && opts.storage === "database") return row;` in claimUsageInDatabase that skips only the final updatedAt-stamping update when both the option is set and storage is "database". No hunk touches the rate-limit-enabled counting path or consumeRemaining, and no comments are added to the new code. The design doc explicitly states the evaluateRateLimit change also applies on the secondary-storage path since the function is storage-agnostic, and contract AC-9 restates this verbatim. The threshold constant lives in packages/auth/src/api-keys.ts and auth.ts's API_KEY_PLUGIN_OPTIONS (no storage/customStorage set) passes it through as lastRequestUpdateIntervalMs. All parts of the question are corroborated by the four listed input files.
    - spec-alignment: PASS — Bản vá (dist/index.mjs) chỉ đổi đúng hai việc, cả hai đều được rào bởi sự có mặt của lastRequestUpdateIntervalMs: (1) hai nhánh "skip" đầu của evaluateRateLimit đổi lastRequest:now thành lastRequest:stampLastRequest(...), hàm này trả null (không ghi) khi lastRequest khác null và còn mới hơn ngưỡng, ngược lại trả now như gốc; nhánh skip thứ ba (rateLimitTimeWindow===null) không bị đụng. (2) claimUsageInDatabase thêm đúng một dòng early-return trước lệnh update cuối stamping updatedAt, không đổi consumeRateLimit hay consumeRemaining, không thêm chú thích nào. Design doc và contract AC-9 cùng mục Never đều nói rõ đường secondary-storage bị chạm nhưng kho không cấu hình secondaryStorage, và AC-11 giữ điều kiện đó bằng máy. Ngưỡng nằm đúng ở packages/auth/src/api-keys.ts, được auth.ts truyền vào apiKey({ lastRequestUpdateIntervalMs: ... }).

- eval: E14
  criterion: AC-10
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  carried_from_round: 2
  note: panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round đó
  human_override: Đạt — Phan Le Manh 2026-09-26
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)

- eval: E15
  run_id: muhtwvj9i0gy
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kagt_khong_secondary_storage
  verified_at: 2026-09-26T03:27:12Z
  output: |
    Ran 1 test across 1 file. [939.00ms]
    test-run: dropped crm_muhtwvj9i0gy_test

## Known limits

## Ngoài hợp đồng

## Analyst

E8, E9, E10, E11 — xanh trên cả HEAD lẫn baseline diffBase (suite hồi quy toàn kho: `bun run test`, `turbo check-types`, `turbo lint`, `lint:slop`). Đây là các cổng regression-guard có chủ ý cho AC-8 (đảm bảo phần còn lại của kho không bị phá vỡ), không phải bằng chứng phân biệt riêng cho tính năng khoa-api-ghi-thua — giữ nguyên vai trò regression-guard, không cần viết lại. E12 (`turbo build`) chạy baseline: n-a nên không nằm trong nhóm không-phân-biệt này.

## Variance

none — mọi eval đều deterministic (runs=1), không có pass_rate lệch, không có test flaky quan sát được trong round này.

## Iterations

Round 1: E7 (AC-7, tài liệu docs/api.md) được xác minh; hợp đồng lúc đó chưa có AC-11.
Round 2: E3, E4, E6 (AC-3/4/6 — hai chiều thư viện, rate-limit bật, chống trôi bản vá) được xác minh xanh; AC-11 được thêm vào hợp đồng ngay sau đó (8552b4e6, 33c8f044) để chặn đường secondary-storage.
Round 3: E15 (AC-11) đỏ — ca kiểm đọc nhầm công tắc cấu hình plugin khoá API (không phải công tắc mà auth.ts thật sự dùng); verdict PENDING-JUDGMENT, trần 3 round. Sửa ở 2a645ab8 (AC-11 kiểm đúng tuỳ chọn plugin), Cổng Phạm vi ký lại ở 33c8f044, hợp đồng đưa về `implemented` ở b2a0368d để mở round 4 — round 4 (báo cáo này) E15 đã xanh trở lại.

### Re-pin lần 1 — 2026-09-26, do gộp onehub 46d7d3d7 (#150, #151) sau chữ ký
run_id: repin-20260926T040506Z-89937
sha: e2a83d0c535a5430e7408a0bc277842fc1c591b7 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E13 (E13 không khai paths), E14 (E14 không khai paths) · AC không có chốt máy: AC-9, AC-10

### Re-pin lần 2 — 2026-10-04, do khai paths lô 1 (kit 2.21.0): chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T020617Z-28918
sha: bc36c2d575122deb12067a7da028614abef51f82 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E13, E14 · diff chạm vật đo ngoài làn máy: E13, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9, AC-10
