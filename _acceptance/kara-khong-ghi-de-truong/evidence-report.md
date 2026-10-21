---
schema_version: 2
feature_slug: kara-khong-ghi-de-truong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 984a708206c5292932c6ca9f18e2d732b186043b
human_signoff: manh 2026-10-20 — ký Cổng Bằng chứng trên S4 vòng 2 PASS (9/9 eval, 7/7 suite); Ngoài-1 ghi Known limits; đồng ý phạm vi đã cắt
---

# Evidence Report: kara-khong-ghi-de-truong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8b | AC-8 | test | PASS |
| E8 | AC-8 | judgment | PASS |

## Evidence

- eval: E1
  run_id: mvgwa7lqsf0z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_co_nguoi_dat
  verified_at: 2026-10-20T16:25:02Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: mvgwa6qjs6t2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_co_nguoi_xoa
  verified_at: 2026-10-20T16:25:02Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: mvgwa7l6ybt7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_co_nguoi_thay
  verified_at: 2026-10-20T16:25:02Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: mvgwa7w0ikll
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_nen
  verified_at: 2026-10-20T16:25:02Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-kara-khong-ghi-de-truong-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_o_trong
  verified_at: 2026-10-20T16:25:02Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: mvgwa6wx885t
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_dong_thoi
  verified_at: 2026-10-20T16:25:02Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: mvgwa6v3nbmk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_chi_tay
  verified_at: 2026-10-20T16:25:02Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: mvgwa78v74gc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_mo_ta
  verified_at: 2026-10-20T16:25:02Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment

- eval: E8
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba judge cùng cho PASS. Cả bốn điều kiện (1)–(4) có trong set_field_value.ts, fields.ts và docs/agent.md; execute truyền unattended từ isAutomated(ctx.session) chứ không lấy từ đầu vào của model; không có lời mời đặt replace true vô điều kiện.
  panel: đề xuất PASS (domain-correctness, operational-feasibility, spec-alignment)
  votes:
    - domain-correctness: PASS — Cả bốn điều kiện (1)–(4) có trong ba tệp. Description nói ô đã có giá trị thì không ghi và phiên nền không bao giờ thay; mô tả replace nói chỉ đặt true khi người bán hàng đã bảo trong cuộc hội thoại này; execute truyền unattended từ isAutomated(ctx.session); docs/agent.md có mục «Custom field values are never overwritten» nêu đủ ba luật. Lý do từ chối ở fields.ts gắn điều kiện người đã bảo thay, và lý do từ chối của phiên nền không nhắc replace.
    - operational-feasibility: PASS — Description của set_field_value.ts nói rõ ô đã có giá trị thì không ghi; mô tả replace ghi chỉ đặt khi người bán hàng đã bảo và không bao giờ đặt theo phát hiện của Kara; unattended lấy từ isAutomated(ctx.session); docs/agent.md nêu đủ ba luật; hai câu từ chối của writeField đều an toàn (phiên nền bảo để nguyên, phiên có người chỉ mời gọi lại với replace true sau điều kiện người đã bảo).
    - spec-alignment: PASS — Mô tả công cụ nói ô đã có giá trị thì không ghi; khoá replace mô tả điều kiện người đã bảo trong cuộc hội thoại; unattended truyền vào writeField và đầu vào của model không có trường này; docs/agent.md có mục «Custom field values are never overwritten»; câu từ chối cho phiên nền bảo để nguyên, câu cho phiên có người không mời gọi lại vô điều kiện.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-20T16:53:39Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-20T16:53:39Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-20T16:53:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-20T16:53:39Z

- cmd: bunx turbo run lint --force
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-20T16:53:39Z

- cmd: bun run lint:slop
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-20T16:53:39Z

- cmd: bunx turbo run build --force
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-20T16:53:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 1), nen moi block eval ghi baseline n-a. Lenh suite xanh ca hai phia la regression-guard binh thuong, khong liet ke.

Eval khong-phan-biet: none

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: bài OKR bập bênh làm một lệnh suite đỏ dù 9/9 eval đạt. Quay lại chạy lại.
Round 2: mọi lệnh suite xanh; tám eval máy carry-forward từ round 1 (delta không chạm paths của eval); E8 do panel chấm PASS.


### Re-pin lần 1 — 2026-10-21, do hoá cũ do gộp onehub 898503a8b
run_id: repin-20261021T044755Z-59279
sha: 984a708206c5292932c6ca9f18e2d732b186043b · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E8 (E8 không khai paths) · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
