---
schema_version: 2
feature_slug: trang-ve-gop-va-dau-cay
verdict: REJECT
failed_evals: [E2, E6, E13]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: edebaa6fca47609653c4b5421e564e18eeff701e
human_signoff:
---

# Evidence Report: trang-ve-gop-va-dau-cay

Vòng 1. Ba eval đỏ (E2, E6, E13); mười eval máy còn lại xanh. Có thêm một lệnh suite đỏ không gắn eval (xem mục «Lệnh suite (hồi quy)»). Hội đồng đề xuất PASS cho E14, chưa có chữ người.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | FAIL |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-4 | script | FAIL |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | script | PASS |
| E13 | AC-10 | test | FAIL |
| E14 | AC-10 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-ve-gop-va-dau-cay-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvg_khai
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Ran 3 tests across 1 file. [46.30s]
    Ba ca «khai» xanh.

- eval: E2
  run_id: minted-trang-ve-gop-va-dau-cay-E2-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tvg_ca_that
  verified_at: 2026-10-23T13:02:39Z
  output: |
    dat doi-chung
    dat co-hook
    dat tat-hook
    DO don-dep: danh sach worktree khac truoc
    Ba lần gộp đều đạt, nhưng bước dọn worktree tạm báo danh sách worktree khác trước khi chạy; kịch bản thoát mã 1 nên eval đỏ.

- eval: E3
  run_id: minted-trang-ve-gop-va-dau-cay-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvg_gop
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Ran 6 tests across 1 file. [6.97s]

- eval: E4
  run_id: minted-trang-ve-gop-va-dau-cay-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvg_gop
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Ran 6 tests across 1 file. [6.97s]
    Cùng lệnh với E3.

- eval: E5
  run_id: minted-trang-ve-gop-va-dau-cay-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvg_khong_doi
  verified_at: 2026-10-23T13:02:39Z
  output: |
    dat khong-doi

- eval: E6
  run_id: minted-trang-ve-gop-va-dau-cay-E6-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tvg_ca_that
  verified_at: 2026-10-23T13:02:39Z
  output: |
    dat doi-chung
    dat co-hook
    dat tat-hook
    DO don-dep: danh sach worktree khac truoc
    Cùng lệnh với E2. Dòng «dat tat-hook» (phần AC-4) đã in, nhưng kịch bản thoát mã 1 ở bước dọn nên eval đỏ.

- eval: E7
  run_id: minted-trang-ve-gop-va-dau-cay-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvg_an_toan
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Ran 8 tests across 1 file. [13.22s]

- eval: E8
  run_id: minted-trang-ve-gop-va-dau-cay-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvg_cay_ma
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Ran 9 tests across 1 file. [2.75s]

- eval: E9
  run_id: minted-trang-ve-gop-va-dau-cay-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvg_dau_hook
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Ran 9 tests across 1 file. [21.16s]

- eval: E10
  run_id: minted-trang-ve-gop-va-dau-cay-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvg_so_chay
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Ran 7 tests across 1 file. [10.88s]

- eval: E11
  run_id: minted-trang-ve-gop-va-dau-cay-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvg_ci
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Ran 6 tests across 1 file. [11.22s]

- eval: E12
  run_id: minted-trang-ve-gop-va-dau-cay-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvg_doi_chieu
  verified_at: 2026-10-23T13:02:39Z
  output: |
    dat doi-chieu: 11/11

- eval: E13
  run_id: minted-trang-ve-gop-va-dau-cay-E13-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.test.tvg_nhu_cu
  verified_at: 2026-10-23T13:02:39Z
  output: |
    Lệnh đầu (nhu-cu, verify-da-chung): 9 pass, 0 fail, Ran 9 tests across 1 file. [8.99s]
    Lệnh nối tiếp (pre-push-t1, t1-ma-doc, push-ghim-lai-t1): 133 pass, 1 fail, Ran 134 tests across 3 files. [35.44s]
    test/t1-ma-doc.spec.ts: (fail) quet-that > quet-that cay that khong thieu khai, khong mien thua, khong glob chet
    expect(kq.baoCao).toEqual([]) nhận về:
      "thieu-khai .github/workflows/ci.yml ← packages/ui/test/pre-push-da-chung.spec.ts"
      "thieu-khai PRODUCT-MAP.md ← packages/ui/test/trang-ve-gop.spec.ts"

- eval: E14
  judged_by: judge panel (fresh context) — ba lens: domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Đề xuất của hội đồng, chưa có chữ người. Cả ba lens cùng thấy bốn ý trong `vi_sao` và `note` của `.githooks/da-chung.json` (cùng cây mã; ba nguồn đã xanh; không dấu thì chạy như cũ; hai tệp hook và gate-shape không đổi) khớp mục «E» của design doc. Một nhận xét chung: câu «hook chạy đủ năm bước» khi không có dấu nói gọn, nhưng liền sau đó đã ghi bộ phân loại in như trước nên không sai nghĩa.
  votes:
    - domain-correctness: PASS — Cả bốn ý đều có trong `vi_sao` và `note` của `.githooks/da-chung.json`, và đối chiếu với mục «E» của design doc thì không câu nào nói sai. (1) Cùng cây mã: mọi tệp khác nhau là T1 thường, `.github/` tính vào cây mã, diff quá `tep_diff` thì coi là khác cây. (2) Ba nguồn, mỗi nguồn chỉ chứng tập bước của nó: dấu hook (cả năm bước có thể có, nhưng chỉ khi vân tay môi trường khớp và chưa quá hạn, bước nào do nguồn khác chứng thì không vào dấu), sổ chạy (theo lệnh, `test` phải phủ đủ gói), CI (theo job, ô bị bỏ qua không phải xanh). (3) Không có dấu thì chạy như cũ, xoá tệp thì không nguồn nào được đọc. (4) `.githooks/pre-push` và `gate-shape.json` không đổi. Một chỗ nói gọn: «hook chạy đủ năm bước» khi không có dấu bỏ qua việc đường T1 vẫn có thể bỏ bước, nhưng ngay câu đó đã ghi bộ phân loại in đúng như trước nên không sai nghĩa.
    - operational-feasibility: PASS — Cả bốn ý đều có trong `vi_sao` và các khoá của `.githooks/da-chung.json`, và không câu nào nói sai so với design doc mục E. Cây mã và ngưỡng `tep_diff` 300 khớp phần «Dấu cây». Ba nguồn khớp phần «Nguồn của đã xanh»: dấu hook có vân tay môi trường và hạn 14 ngày, sổ chạy `test` chỉ khi phủ đủ gói, CI theo job và ô bị bỏ qua không xanh. Câu «chạy đủ năm bước» khi không có dấu hơi gọn, vì đường T1 cũ vẫn có thể bỏ bước. Nhưng nó đứng liền sau «bộ phân loại in đúng như trước», nên không trái với «chạy như cũ» của design doc.
    - spec-alignment: PASS — Cả bốn ý đều có trong `vi_sao` và khớp design doc mục E. (1) Cây mã chỉ khác nhau ở tệp T1 thường: khớp `t1_skip_globs`, không khớp `t1_ma_doc`, theo `tachT1`. Tệp dưới `.github/` luôn thuộc cây mã, và diff quá `tep_diff` (300) tệp thì coi là khác cây. (2) Ba nguồn đều đúng. Dấu hook mang đúng các bước đã chạy, cần vân tay môi trường khớp, hạn 14 ngày, và không tự gia hạn. Sổ chạy tính theo `lenh`, và `test` chỉ được chứng khi phủ đủ gói. CI tính theo `ci`, ô bị bỏ qua không phải xanh. (3) Không có dấu thì chạy như cũ, xoá tệp thì không nguồn nào được đọc. Câu «hook chạy đủ năm bước» hơi gọn so với design vì đường T1 vẫn có thể bỏ bước, nhưng ngay trước đó câu đã nói bộ phân loại in như trước, nên không sai. (4) `.githooks/pre-push` và `gate-shape.json` không đổi, khớp mục «Hook dùng dấu thế nào».
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

Lệnh đỏ không gắn eval nào: `bun run test -- --filter=app --filter=@crm/ui` (khối đầu tiên bên dưới). Chỉ một ca đỏ, cùng ca với E13: quet-that của `t1-ma-doc.spec.ts` báo `.github/workflows/ci.yml` và `PRODUCT-MAP.md` thiếu khai. Hai lệnh có eval gắn kèm (`node _acceptance/trang-ve-gop-va-dau-cay/rang/ca-550.mjs` cho E2/E6 và lệnh nối của E13) cũng đỏ, đã ghi ở khối eval tương ứng.

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-ve-gop-va-dau-cay-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-23T13:02:39Z
  output: |
    @crm/ui:test: 1 tests failed:
    @crm/ui:test: (fail) quet-that > quet-that cay that khong thieu khai, khong mien thua, khong glob chet [840.72ms]
    @crm/ui:test:  388 pass
    @crm/ui:test:  1 fail
    @crm/ui:test: Ran 389 tests across 21 files. [150.91s]
    Failed:    @crm/ui#test

- cmd: bun run test -- --filter=api
  run_id: minted-trang-ve-gop-va-dau-cay-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-23T13:02:39Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-ve-gop-va-dau-cay-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-23T13:02:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-ve-gop-va-dau-cay-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-23T13:02:39Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-ve-gop-va-dau-cay-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-23T13:02:39Z

- cmd: bun run lint:slop
  run_id: minted-trang-ve-gop-va-dau-cay-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-23T13:02:39Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-ve-gop-va-dau-cay-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-23T13:02:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh ở cả hai phía. Mười ba eval máy đều có baseline n-a (eval mới, không đo được trên diffBase), nên chưa có bằng chứng phân biệt từ A/B; xem «Baseline khong do» bên dưới.

Baseline khong do
- cd packages/ui && bun test --timeout 300000 ./test/trang-ve-gop.spec.ts -t khai: bo qua baseline: tep packages/ui/test/trang-ve-gop.spec.ts co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/trang-ve-gop-va-dau-cay/rang/ca-550.mjs: bo qua baseline: tep _acceptance/trang-ve-gop-va-dau-cay/rang/ca-550.mjs co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 300000 ./test/trang-ve-gop.spec.ts -t 'gop-tu-dong|gop-xung-dot': bo qua baseline: tep packages/ui/test/trang-ve-gop.spec.ts co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/trang-ve-gop-va-dau-cay/rang/khong-doi.mjs: bo qua baseline: tep _acceptance/trang-ve-gop-va-dau-cay/rang/khong-doi.mjs co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 300000 ./test/trang-ve-gop.spec.ts -t an-toan: bo qua baseline: tep packages/ui/test/trang-ve-gop.spec.ts co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-da-chung.spec.ts -t cay-ma: bo qua baseline: tep packages/ui/test/pre-push-da-chung.spec.ts co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-da-chung.spec.ts -t dau-hook: bo qua baseline: tep packages/ui/test/pre-push-da-chung.spec.ts co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-da-chung.spec.ts -t so-chay: bo qua baseline: tep packages/ui/test/pre-push-da-chung.spec.ts co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-da-chung.spec.ts -t nguon-ci: bo qua baseline: tep packages/ui/test/pre-push-da-chung.spec.ts co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/trang-ve-gop-va-dau-cay/rang/doi-chieu.mjs: bo qua baseline: tep _acceptance/trang-ve-gop-va-dau-cay/rang/doi-chieu.mjs co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-da-chung.spec.ts -t 'nhu-cu|verify-da-chung' && bun test --timeout 120000 ./test/pre-push-t1.spec.ts ./test/t1-ma-doc.spec.ts ./test/push-ghim-lai-t1.spec.ts: bo qua baseline: tep packages/ui/test/pre-push-da-chung.spec.ts co o cay dang kiem nhung chua co o merge-base 787a8369e1cd8bb0c7d53398d84dab08ee6ad102 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lần và xác định; không eval nào có pass_rate lẫn lộn.

## Iterations

Round 1: E2, E6, E13 failed — E2 và E6 (cùng một kịch bản `ca-550.mjs`): ba lần gộp in «dat doi-chung», «dat co-hook», «dat tat-hook» nhưng bước dọn worktree tạm báo danh sách worktree khác trước, kịch bản thoát mã 1. E13: bài quét cây thật của `t1-ma-doc.spec.ts` báo hai tệp thiếu khai (`.github/workflows/ci.yml` do `pre-push-da-chung.spec.ts`, `PRODUCT-MAP.md` do `trang-ve-gop.spec.ts`); cùng ca này làm đỏ lệnh suite `bun run test -- --filter=app --filter=@crm/ui`. Returned to implementation.
