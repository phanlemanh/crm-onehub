---
schema_version: 2
feature_slug: lam-moi-chuyen-viec-qua-loi-chung
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 297534c01dc1122cfc1a32a18f940c87907e179c
human_signoff: Phan Le Manh 2026-09-26
---

# Evidence Report: lam-moi-chuyen-viec-qua-loi-chung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-lam-moi-chuyen-viec-qua-loi-chung-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lmcv_ba_khoa
  verified_at: 2026-09-25T16:35:58Z
  output: |
     0 fail
     11 expect() calls
    Ran 1 test across 1 file. [631.00ms]

- eval: E2
  run_id: minted-lam-moi-chuyen-viec-qua-loi-chung-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lmcv_dong_sau_lam_moi
  verified_at: 2026-09-25T16:35:58Z
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [855.00ms]

- eval: E3
  run_id: minted-lam-moi-chuyen-viec-qua-loi-chung-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lmcv_loi_khong_lam_moi
  verified_at: 2026-09-25T16:35:58Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [630.00ms]
    EXIT 0

- eval: E4
  run_id: minted-lam-moi-chuyen-viec-qua-loi-chung-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lmcv_soi_ma
  verified_at: 2026-09-25T16:35:58Z
  output: |
    DUNG cache.ts: doi tuong useCrmCache co muc workTransferred
    DUNG cache.ts: muc workTransferred goi run([trpc.onboarding.manDanhMuc.queryKey(), trpc.onboarding.bangCot.queryKey(), trpc.onboarding.transferPreview.queryKey()], [])
    6 DUNG, 0 SAI — ma thoat 0

- eval: E5
  run_id: minted-lam-moi-chuyen-viec-qua-loi-chung-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lmcv_khong_hoi_quy
  verified_at: 2026-09-25T16:35:58Z
  output: |
    khong lenh nao do them so voi b7951341 — 21 lenh do san o ca hai cay

    [exited with code 0]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muh6nxky5od4
  exit_code: 0
  verified_at: 2026-09-25T16:35:58Z

- cmd: bunx turbo run lint --force
  run_id: minted-lam-moi-chuyen-viec-qua-loi-chung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-25T16:35:58Z

- cmd: bun run lint:slop
  run_id: minted-lam-moi-chuyen-viec-qua-loi-chung-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-25T16:35:58Z

- cmd: bunx turbo run build --force
  run_id: minted-lam-moi-chuyen-viec-qua-loi-chung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-25T16:35:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5 tất cả xanh ngay lần verify đầu — không lỗi nào, không quay lại implementation.

### Re-pin lần 1 — 2026-10-15, do neo-thuoc-het-han: E5 dùng bộ đọc evals của kit và neo cặp gộp PR #145, bộ ghi invalidateQueries đủ (Ngoài-3)
run_id: repin-20261015T061648Z-91798
sha: 297534c01dc1122cfc1a32a18f940c87907e179c · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
