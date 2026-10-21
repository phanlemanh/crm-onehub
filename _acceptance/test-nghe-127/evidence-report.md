---
schema_version: 2
feature_slug: test-nghe-127
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 58e20ce7e2f7cf29543183e61de07e035c63ce7b
human_signoff:
---

# Evidence Report: test-nghe-127

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-test-nghe-127-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.t127_quet
  verified_at: 2026-10-21T23:29:38Z
  output: |
    quet cay: 1123 tep, Bun.serve 17, dung app api 49, tu thu 5 ca, vi pham {"bunServe":0,"dangLa":0,"listen":0,"taoApp":0,"localhost":0}

- eval: E1b
  run_id: minted-test-nghe-127-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.t127_quet_goc
  verified_at: 2026-10-21T23:29:38Z
  output: |
    localhost: scripts/tin-hieu/test/nguong-song-khop.test.ts:75

- eval: E2
  run_id: minted-test-nghe-127-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.t127_quet
  verified_at: 2026-10-21T23:29:38Z
  output: |
    quet cay: 1123 tep, Bun.serve 17, dung app api 49, tu thu 5 ca, vi pham {"bunServe":0,"dangLa":0,"listen":0,"taoApp":0,"localhost":0}

- eval: E3
  run_id: minted-test-nghe-127-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.t127_co_che
  verified_at: 2026-10-21T23:29:38Z
  output: |
    doi-chung-127-cong-0: 200 ok

- eval: E4
  run_id: minted-test-nghe-127-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.t127_khang_dinh
  verified_at: 2026-10-21T23:29:38Z
  output: |
    khang dinh: nhanh c9e4ce605780...HEAD · 53 tep test doi · 75 khuc · tu thu 5 ca

- eval: E4b
  run_id: minted-test-nghe-127-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.t127_scripts
  verified_at: 2026-10-21T23:29:38Z
  output: |
    Ran 110 tests across 8 files. [181.80s]

- eval: E5
  judged_by: judge panel (3 lenses, fresh context)
  verdict: PASS
  rationale: Panel đề xuất PASS. Mục «A test's own server listens on 127.0.0.1» trong docs/setup.md (dòng 508-526) nêu cả hai vế, cách nghe 127.0.0.1 cho Bun.serve, Nest và supertest, cùng lý do Colima (limactl giữ một cổng ở 127.0.0.1 trong dải cổng tạm).
  panel:
    - domain-correctness: PASS — Mục có đủ hai vế. Vế một: `Bun.serve({ port: 0, hostname: "127.0.0.1" })`, `app.listen(0, "127.0.0.1")` của Nest, và supertest. Vế hai: `limactl` của Colima giữ một cổng ở 127.0.0.1 trong dải cổng tạm; máy chủ nghe mọi địa chỉ vẫn được cấp đúng cổng đó; request tới 127.0.0.1 rơi vào `limactl` và Bun báo `Malformed_HTTP_Response`. Đoạn viết bằng tiếng Anh, có tiêu đề `###`, cùng giọng với các mục lân cận.
    - operational-feasibility: PASS — Mục nêu cả hai vế. Vế một: Bun.serve với hostname 127.0.0.1, app.listen(0, "127.0.0.1") của Nest, supertest, và test gọi 127.0.0.1 chứ không gọi localhost. Vế hai: limactl của Colima giữ một cổng ở 127.0.0.1 trong dải cổng tạm, máy chủ nghe mọi địa chỉ vẫn được cấp đúng cổng đó, và request tới 127.0.0.1:<port> nhận Malformed_HTTP_Response. Viết cùng giọng và định dạng với các mục ### khác của tệp.
    - spec-alignment: PASS — Mục nêu cả ba loại máy chủ phải nghe 127.0.0.1: `Bun.serve({ port: 0, hostname: "127.0.0.1" })`, `app.listen(0, "127.0.0.1")` của Nest, và app trao cho supertest. Đoạn «The reason is Colima» giải thích đúng nghĩa: `limactl` giữ một cổng ở 127.0.0.1 trong dải cổng tạm, máy chủ nghe mọi địa chỉ vẫn được cấp đúng cổng đó, và request tới 127.0.0.1 rơi vào `limactl` rồi Bun báo `Malformed_HTTP_Response`. Cùng giọng với các mục khác của tệp: tiêu đề `###`, văn xuôi tiếng Anh, in đậm ở chỗ cần nhấn, có ví dụ cụ thể.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-test-nghe-127-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:38Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-test-nghe-127-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:38Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-test-nghe-127-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:38Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-test-nghe-127-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:38Z

- cmd: bunx turbo run lint --force
  run_id: minted-test-nghe-127-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:38Z

- cmd: bun run lint:slop
  run_id: minted-test-nghe-127-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:38Z

- cmd: bunx turbo run build --force
  run_id: minted-test-nghe-127-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:38Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- node _acceptance/test-nghe-127/rang/quet.mjs: bo qua baseline: tep _acceptance/test-nghe-127/rang/quet.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/test-nghe-127/rang/quet.mjs --ref 33ddf1b0294399ddf581318b71bb9b7e48f4de84 --mong-do: bo qua baseline: tep _acceptance/test-nghe-127/rang/quet.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/test-nghe-127/rang/co-che.ts: bo qua baseline: tep _acceptance/test-nghe-127/rang/co-che.ts co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/test-nghe-127/rang/khong-doi-khang-dinh.mjs: bo qua baseline: tep _acceptance/test-nghe-127/rang/khong-doi-khang-dinh.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test scripts/ban-chup-lo-trinh/test: baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval may (E1, E1b, E2, E3, E4, E4b) va bay lenh suite deu xanh; panel E5 de xuat PASS, human_override de trong cho Cong 2. Khong eval nao fail.
