---
schema_version: 2
feature_slug: okr-mau-xoa-cau-hinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 374fd55e030c089eeaf9bc743e2bd37b9678d840
human_signoff: Mạnh 2026-10-11
---

# Evidence Report: okr-mau-xoa-cau-hinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | judgment | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-okr-mau-xoa-cau-hinh-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omx_xoa
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-okr-mau-xoa-cau-hinh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omc_gat
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-okr-mau-xoa-cau-hinh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omc_lui
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-okr-mau-xoa-cau-hinh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omc_gat
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-okr-mau-xoa-cau-hinh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omc_mo_coi
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-okr-mau-xoa-cau-hinh-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omc_nap_lai
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-okr-mau-xoa-cau-hinh-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omc_dang_giu
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Mục «Bộ OKR mẫu» của docs/setup.md nói đủ ba ý (phiên bản cấu hình do người mẫu tạo bị gỡ kể cả bản sót; phiên bản khác ở lại và chỉ mất mã đơn vị mẫu; cấu hình đang dùng lùi về bản trước phiên mẫu hoặc về mặc định), không còn câu cũ «vẫn còn sau --xoa», không thấy chữ tự đúc.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  panel đề xuất: PASS (ba judge, bỏ phiếu đồng thuận; human_override để trống cho người quyết ở Cổng 2)
  panel_votes:
    - domain-correctness: PASS — Mục «Bộ OKR mẫu» của docs/setup.md nói rõ cả ba điều. (1) `--xoa` và nạp lại xoá phiên bản `okrProgramConfig` do người mẫu tạo, tìm theo người mẫu đang có hoặc mã bắt đầu `mau-okr-`, nên bản sót từ lần xoá trước cũng bị gỡ và được đếm. (2) Các phiên bản khác ở lại và chỉ mất mã đơn vị mẫu trong danh sách đơn vị được bật AI. (3) Cấu hình đang dùng lùi về bản cuối trước phiên mẫu, hoặc về mặc định nếu chưa có bản nào. Mục không còn câu «vẫn còn sau --xoa»: grep «vẫn còn» trong setup.md không ra gì. Các từ như «phiên bản», «cuộc soạn», «chương trình OKR», «đơn vị», «bộ OKR mẫu» đều có hoặc khớp CONTEXT.md; phần còn lại là chữ thường, không thấy từ ghép tự đúc.
    - operational-feasibility: PASS — Mục «Bộ OKR mẫu» của docs/setup.md nói đủ ba điều. (1) Phiên bản cấu hình do người mẫu tạo đi theo `--xoa` và nạp lại, kể cả bản sót, vì lệnh tìm theo người mẫu đang có hoặc mã người bắt đầu `mau-okr-`. (2) Các phiên bản khác ở lại và chỉ mất mã bộ phận hay phòng ban mẫu. (3) Cấu hình đang dùng lùi về bản cuối trước phiên mẫu, hoặc về mặc định. Câu «vẫn còn sau --xoa» không còn: grep "vẫn còn" ra rỗng. «Phiên bản», «cấu hình», «đơn vị» và «cuộc soạn» đều có trong CONTEXT.md. «Người mẫu» không có mục riêng ở đó, nhưng là cách gọi sẵn của mục (thư đuôi `@mau.onehub.test`), là chữ thường ai cũng hiểu chứ không phải từ ghép đúc cho thuật ngữ kỹ thuật.
    - spec-alignment: PASS — Đoạn «Phiên bản cấu hình chương trình OKR» trong mục «Bộ OKR mẫu» (docs/setup.md dòng 61-69) nói đủ ba điều. Một: `--xoa` và nạp lại gỡ phiên bản do người mẫu tạo, tìm theo người mẫu đang có hoặc mã bắt đầu `mau-okr-`, nên bản sót từ lần xoá trước cũng bị gỡ và được đếm. Hai: các phiên bản khác ở lại, chỉ mất mã bộ phận hay phòng ban mẫu. Ba: cấu hình lùi về bản cuối trước phiên mẫu hoặc về mặc định. Tìm trong docs/setup.md không thấy câu «vẫn còn sau --xoa». Các thuật ngữ trong đoạn (Chương trình OKR, phiên bản, đơn vị, bộ OKR mẫu) đều có trong CONTEXT.md. «Người mẫu» và «mã đơn vị mẫu» không có mục riêng ở đó, nhưng chúng là chữ thường, cùng nghĩa mục đã dùng, và mục tự định nghĩa người mẫu ở dòng 82, nên không phải từ ghép tự đúc cho thuật ngữ kỹ thuật.
  human_override:  # chi nguoi ghi

- eval: E9
  run_id: minted-okr-mau-xoa-cau-hinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.omc_dot_bien
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-okr-mau-xoa-cau-hinh-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.omx_dot_bien
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-okr-mau-xoa-cau-hinh-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omc_tron
  verified_at: 2026-10-10T23:26:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-okr-mau-xoa-cau-hinh-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-10T23:55:00Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-okr-mau-xoa-cau-hinh-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-10T23:55:00Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-okr-mau-xoa-cau-hinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-10T23:55:00Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-okr-mau-xoa-cau-hinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-10T23:55:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-okr-mau-xoa-cau-hinh-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-10T23:55:00Z

- cmd: bun run lint:slop
  run_id: minted-okr-mau-xoa-cau-hinh-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-10T23:55:00Z

- cmd: bunx turbo run build --force
  run_id: minted-okr-mau-xoa-cau-hinh-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-10T23:55:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E1 — cmd: bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-xoa"
- E10 — cmd: bun _acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh; một ghi chú docs/setup.md về `--xoa` cần sửa theo finding t1 (AC-8), đã sửa ở commit 374fd55e0.
Round 2: chạy lại bảy lệnh suite trên commit 374fd55e030c089eeaf9bc743e2bd37b9678d840, đều xanh; E8 được chấm lại bởi ba judge, đều PASS; các eval còn lại carry-forward từ round 1 vì delta không chạm paths của chúng.
