---
schema_version: 2
feature_slug: thuoc-khong-tu-het-han
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c6d1eb41b0539bffdcef59e9d240a19798b67bd8
human_signoff:
---

# Evidence Report: thuoc-khong-tu-het-han

Vòng 3: bốn eval máy và bảy lệnh suite đều xanh, nhưng phần review có hai finding TRONG hợp đồng mức high, cùng chạm AC-1, nên verdict tổng là REJECT. Chi tiết ở review-findings.md.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3, AC-6 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-thuoc-khong-tu-het-han-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_paths_chet
  verified_at: 2026-10-10T03:48:19Z
  output: |
    paths-chet: XANH — 0 eval co glob chet trong 10 eval trong pham vi

- eval: E2
  run_id: minted-thuoc-khong-tu-het-han-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_chi_paths
  verified_at: 2026-10-10T03:48:19Z
  output: |
    chi-paths: XANH — chi paths doi, dung 10 eval trong pham vi, dung nhu danh sach ghi

- eval: E3
  run_id: minted-thuoc-khong-tu-het-han-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_e7
  verified_at: 2026-10-10T03:48:19Z
  output: |
    hai-thuoc: XANH

- eval: E5
  run_id: minted-thuoc-khong-tu-het-han-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_kiem_ke
  verified_at: 2026-10-10T03:48:19Z
  output: |
    kiem-ke: XANH

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-10T03:48:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-10T03:48:19Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-10T03:48:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-10T03:48:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-10T03:48:19Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-10T03:48:19Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-10T03:48:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E5 va bay lenh suite deu xanh tren cay 4f8033154895582c30ce1265461190eff2f90ff8; khong eval nao fail. Review con bon muc nhe/trung trong hop dong, khong muc nao chan hop dong.
Round 2: E1-E5 va bay lenh suite deu xanh tren cay 0c2fbef3ae14586d75ad44e193cecfea12a309b4; khong eval nao fail, khong muc trong hop dong con lai.
Round 3: sau Loi 1 (E10 chuyen sang F24, con E1, E2, E3, E5) tren cay c6d1eb41b0539bffdcef59e9d240a19798b67bd8, bon eval va bay lenh suite deu xanh; khong eval nao fail. Verdict REJECT vi review nhan hai finding trong hop dong muc high chung AC-1: paths-chet.mjs chi quet eval script/test khong not-run nen bo sot glob chet o eval ui-check/judgment (dien-thoai-ca-nhan va the-gop-y-okr van tat bo loc hoa cu), trong khi E1 in 0 glob chet. Tra ve trien khai: dung lai bo doc paths cua lib/evidence-core.cjs (evalPathsOf + phanLoaiMucPaths hoac staleByPaths) tren moi eval, dung lai danh-sach.json.
