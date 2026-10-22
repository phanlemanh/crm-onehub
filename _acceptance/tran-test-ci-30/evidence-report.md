---
schema_version: 2
feature_slug: tran-test-ci-30
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5ddcee19441f70595f5d28d5bcd73bfccc829d21
human_signoff:
---

# Evidence Report: tran-test-ci-30

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E4 | AC-4 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-tran-test-ci-30-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc30_mot_khoa
  verified_at: 2026-10-22T17:38:23Z
  output: |
    KET mot-khoa: dat, moi ca do bi bat

- eval: E2
  run_id: minted-tran-test-ci-30-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc30_e3_cu
  verified_at: 2026-10-22T17:38:23Z
  output: |
    KET e3-cu: dat, moi ca do bi bat

### Phán xét (judgment)

Panel đề xuất cho E4 là PASS. Ba góc nhìn đều đạt, không có phiếu bất đồng. Ô `human_override` để trống cho người quyết ở Cổng 2.

- eval: E4
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  votes:
    - domain-correctness: PASS — Hạt giống nêu điều kiện mở lại là trung vị các lượt xanh của `test (api)` lớn hơn 22 phút. Nó cũng nêu lý do chưa tách: mỗi ô mới tốn khoảng 3 phút cài đặt cho mọi lượt chạy. Bảng của design doc có các nhóm rời nhau (xanh, bị huỷ ở trần, đỏ, huỷ vì lượt mới đè lên) và cả ba hàng test cộng đúng 40: api 33+2+2+3, app-ui 37+0+0+3, con-lai 40+0+0+0. Số liệu hai tệp khớp nhau: 33 xanh, trung vị 17,0, chậm nhất 19,8, 16 lượt từ 17 phút, 2 lượt bị huỷ ở trần 20 phút, app-ui 37 xanh với trung vị 18,4. Design doc dẫn đúng đường dẫn hạt giống. Số 6 lượt của M5 chỉ là số cũ, hạt giống đã ghi là thay bằng số đo lại, nên không trái nhau.
    - operational-feasibility: PASS — Cả ba vế đều đạt và hai tệp không trái nhau. (1) Hạt giống ghi «Mở lại khi: trung vị … `test (api)` lớn hơn 22 phút» và lý do chưa tách là khoảng 3 phút cài đặt cho mọi lượt chạy. (2) Bảng 40 lượt ở design doc có các nhóm rời nhau và mỗi hàng cộng đủ 40: api 33+2+2+3, app-ui 37+0+0+3, con-lai 40. Hàng `check` cộng 27 và 13 lượt nhảy qua vì PR nháp, cũng là 40. (3) Các số trong hạt giống khớp bảng: 33 xanh, trung vị 17,0′, chậm nhất 19,8′, 16 lượt từ 17′, 2 lượt huỷ ở trần, app-ui 37 xanh trung vị 18,4′, cùng khoảng 21/10 11:15 đến 22/10 12:05. Số thô của M5 được cả hai tệp gọi là số thô.
    - spec-alignment: PASS — Hạt giống nêu điều kiện mở lại «trung vị các lượt xanh của test (api) > 22 phút». Nó cũng nêu lý do chưa tách: mỗi ô mới tốn khoảng 3 phút cài đặt cho mọi lượt chạy. Bảng trong design doc có các nhóm rời nhau: xanh, huỷ ở trần, đỏ, huỷ vì lượt mới đè. Cộng ra api 33+2+2+3=40, app-ui 37+0+0+3=40, con-lai 40+0+0+0=40. Số liệu hai tệp khớp nhau (api 33 xanh, trung vị 17,0′, chậm nhất 19,8′, 16 lượt từ 17′, 2 lượt huỷ ở trần; app-ui 37 xanh, trung vị 18,4′; 3 phút cài đặt; tối đa 10 phút thêm cho lượt treo). Số thô của M5 trong design doc được ghi rõ là số lúc giao việc, và hạt giống nói nó đã được thay bằng số đo lại, nên không mâu thuẫn.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-22T17:38:23Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-22T17:38:23Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-22T17:38:23Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-22T17:38:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-tran-test-ci-30-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-22T17:38:23Z

- cmd: bun run lint:slop
  run_id: minted-tran-test-ci-30-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-22T17:38:23Z

- cmd: bunx turbo run build --force
  run_id: minted-tran-test-ci-30-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-22T17:38:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

### Baseline khong do

- bun _acceptance/tran-test-ci-30/rang/kiem.mjs mot-khoa: bo qua baseline: tep _acceptance/tran-test-ci-30/rang/kiem.mjs co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tran-test-ci-30/rang/kiem.mjs e3-cu: bo qua baseline: tep _acceptance/tran-test-ci-30/rang/kiem.mjs co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: suite app-ui đỏ, gói bằng chứng S4 lượt 1 bị REJECT. Trả về triển khai.
Round 2: suite app-ui chập chờn khi chạy song song, gói bằng chứng S4 lượt 2 bị REJECT. Trả về triển khai.
Round 3: E1, E2 và toàn bộ lệnh suite đạt; panel E4 đề xuất PASS. Verdict PASS.

