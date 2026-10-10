---
schema_version: 2
feature_slug: thuoc-khong-tu-het-han
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e8ee6e2bee80182d3cf50c35c9b7744873c6ed41
human_signoff:
---

# Evidence Report: thuoc-khong-tu-het-han

Vòng 4: bốn eval máy (E1, E2, E3, E5) và bảy lệnh suite đều xanh trên cây e8ee6e2bee80182d3cf50c35c9b7744873c6ed41; không eval nào fail, không có mục judgment. Review không còn finding trong hợp đồng; sáu finding ngoài hợp đồng chờ người quyết ở Cổng Bằng chứng (xem review-findings.md).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3, AC-6 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-thuoc-khong-tu-het-han-E1-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_paths_chet
  verified_at: 2026-10-10T05:36:03Z
  output: |
    paths-chet: XANH — luoi bat bo loc o ca 3 ho so trong pham vi

- eval: E2
  run_id: minted-thuoc-khong-tu-het-han-E2-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_chi_paths
  verified_at: 2026-10-10T05:36:03Z
  output: |
    chi-paths: XANH — chi paths doi, dung 3 eval trong pham vi, dung nhu danh sach ghi

- eval: E3
  run_id: minted-thuoc-khong-tu-het-han-E3-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_e7
  verified_at: 2026-10-10T05:36:03Z
  output: |
    hai-thuoc: XANH

- eval: E5
  run_id: minted-thuoc-khong-tu-het-han-E5-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_kiem_ke
  verified_at: 2026-10-10T05:36:03Z
  output: |
    kiem-ke: XANH

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-10T05:36:03Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-10-10T05:36:03Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-10T05:36:03Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-10T05:36:03Z

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-10T05:36:03Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-10T05:36:03Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-10T05:36:03Z

## Known limits

## Ngoài hợp đồng

Có sáu finding ngoài hợp đồng, trong đó ba lỗi nằm ở tệp không bộ đo nào phủ, đang chờ người quyết ở Cổng Bằng chứng; xem review-findings.md, mục «Ngoài hợp đồng — người quyết ở Gate 2».

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt). Bảy lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — mọi eval đều chạy một lần và đều xanh; không eval nào có pass_rate lẫn.

## Judgment

none — hồ sơ này không có eval judgment, nên không có hội đồng chấm và không có mục chờ human_override.

## Iterations

Round 1: E1-E5 va bay lenh suite deu xanh tren cay 4f8033154895582c30ce1265461190eff2f90ff8; khong eval nao fail. Review con bon muc nhe/trung trong hop dong, khong muc nao chan hop dong.
Round 2: E1-E5 va bay lenh suite deu xanh tren cay 0c2fbef3ae14586d75ad44e193cecfea12a309b4; khong eval nao fail, khong muc trong hop dong con lai.
Round 3: sau Loi 1 (E10 chuyen sang F24, con E1, E2, E3, E5) tren cay c6d1eb41b0539bffdcef59e9d240a19798b67bd8, bon eval va bay lenh suite deu xanh; verdict REJECT vi review nhan hai finding trong hop dong muc high chung AC-1: paths-chet.mjs chi quet eval script/test khong not-run nen bo sot glob chet o eval ui-check/judgment (dien-thoai-ca-nhan va the-gop-y-okr van tat bo loc hoa cu). Tra ve trien khai.
Round 4: sau khi go dien-thoai-ca-nhan va the-gop-y-okr khoi pham vi (Loi B, hai ho so sang F24) tren cay e8ee6e2bee80182d3cf50c35c9b7744873c6ed41, E1, E2, E3, E5 va bay lenh suite deu xanh; khong eval nao fail, khong finding trong hop dong. Sau finding ngoai hop dong cho nguoi quyet o Cong Bang chung.
