---
schema_version: 2
feature_slug: do-quyen-luot-bang-hanh-vi
verdict: REJECT
failed_evals: ["E2","E5","E8"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dce5d955cbd5e086ee6fac0c9443be53b43f80dc
human_signoff:
---

# Evidence Report: do-quyen-luot-bang-hanh-vi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | script | FAIL |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | FAIL |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | judgment | PASS |
| E8 | AC-7 | script | FAIL |
| E9 | AC-8 | script | PASS |
| E10 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-do-quyen-luot-bang-hanh-vi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dq_cong_quyen
  verified_at: 2026-09-10T09:00:00Z
  output: |
    0 fail
    33 expect() calls
    Ran 10 tests across 1 file. [106.00ms]

- eval: E2
  run_id: minted-do-quyen-luot-bang-hanh-vi-E2-r1
  exit_code: 2
  baseline: red
  verifier: config:executors.script.dq_cong_quyen_do
  verified_at: 2026-09-10T09:00:00Z
  output: |
    can --vecto <ten> — co: mo-cong, ternary-xuong-dong

- eval: E3
  run_id: minted-do-quyen-luot-bang-hanh-vi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dq_khong_cam_tin_nhan
  verified_at: 2026-09-10T09:00:00Z
  output: |
    khong-cam-tin-nhan: 122 tep, 1 cho goi builderSessionAttributes — sach

- eval: E4
  run_id: minted-do-quyen-luot-bang-hanh-vi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dq_nguon_ghi
  verified_at: 2026-09-10T09:00:00Z
  output: |
      apps/api/src/conversations/conversations.service.ts:424 — apps/api/src/conversations/conversations.service.ts :: createBuilder :: khai
      apps/api/src/conversations/conversations.service.ts:478 — apps/api/src/conversations/conversations.service.ts :: submitBuilder :: khai
      apps/api/src/conversations/conversations.service.ts:585 — apps/api/src/conversations/conversations.service.ts :: answerBuilderQuestion :: suy

- eval: E5
  run_id: minted-do-quyen-luot-bang-hanh-vi-E5-r1
  exit_code: 2
  baseline: red
  verifier: config:executors.script.dq_mang_theo_do
  verified_at: 2026-09-10T09:00:00Z
  output: |
    can --vecto <ten> — co: mang-theo-luon-mo

- eval: E6
  run_id: minted-do-quyen-luot-bang-hanh-vi-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dq_bo_do_grep
  verified_at: 2026-09-10T09:00:00Z
  output: |
    bo-do-grep: khoi describe("suy-dien") con 2 bai, khong bo do theo dong nao — sach

- eval: E7
  criterion: AC-6
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  votes:
    - domain-correctness: PASS — Đối chiếu với 3 file code trong phạm vi: conversations.service.ts cho thấy createBuilder/submitBuilder dùng thẳng input.commandType từ client, không đối chứng gì (khớp ý 1); answerBuilderQuestion tính commandType bằng commandTypeFromAuthorization(conversation.pendingInputRequest) — suy từ câu hỏi treo đã lưu trên hàng, không lấy từ input client (khớp ý 2); custom-agent-dispatch.ts đọc thẳng row.commandType (từ submission đã lưu) vào session attributes mà không tính lại, rồi authorization.ts (builderTurnApproval) chỉ đọc attribute đó để chấm allow/deny (khớp ý 3, "đọc giá trị của hàng rồi chấm công"). Đoạn văn trong docs/agent.md diễn giải cả ba ý này bằng câu văn có lý do ("API does not corroborate it... There is nothing server-side to corroborate it against", "The agent re-derives nothing: it reads the value on the submission row and the approval policy grades it"), đọc được mà không cần mở code.
    - operational-feasibility: PASS — Mục "Team-agent builder and runner" có đoạn "Where a turn's authority comes from" nói rõ cả ba điều: (1) commandType của create/submit là "a claim the browser makes, and the API does not corroborate it" — khớp với conversations.service.ts nơi createBuilder/submitBuilder gán thẳng input.commandType (client) vào hàng mà không có bước đối chứng; (2) luợt trả lời "inherits the authority of the turn that asked, derived by commandTypeFromAuthorization inside answerBuilderQuestion and never taken from the client" — khớp với answerBuilderQuestion gọi commandTypeFromAuthorization(conversation.pendingInputRequest); (3) "The agent re-derives nothing: it reads the value on the submission row and the approval policy grades it" — khớp với custom-agent-dispatch.ts (builderSessionAuthFromRow đọc row.commandType vào attributes) và authorization.ts (builderTurnApproval gọi builderTurnAuthorized(ctx) chấm dựa trên session auth, không tính lại). Cả ba đều diễn giải bằng văn xuôi có chủ đích (câu mở đầu chính là câu hỏi "quyền đến từ đâu"), không bắt người đọc phải mở mã mới nắm được luồng quyền.
    - spec-alignment: PASS — Đoạn "Where a turn's authority comes from" trong docs/agent.md nói đủ cả ba: (1) "`commandType` on a create or a submit is a claim the browser makes, and the API does not corroborate it" — đúng loại khai của client, không đối chứng, khớp với input.commandType được ghi thẳng vào bản ghi ở createBuilder/submitBuilder trong conversations.service.ts; (2) "an answer to a pending question inherits the authority of the turn that asked, derived by `commandTypeFromAuthorization` inside `answerBuilderQuestion` and never taken from the client" — khớp đúng dòng code `commandType: commandTypeFromAuthorization(conversation.pendingInputRequest)` lấy từ câu hỏi đang treo đã lưu, không lấy từ input của lượt trả lời; (3) "The agent re-derives nothing: it reads the value on the submission row and the `approval` policy grades it" — khớp với `builderSessionAuthFromRow` đọc `row.commandType` rồi `authorization.ts` gọi `builderTurnAuthorized(ctx)` để quyết định approve/deny. Cả ba đều diễn đạt bằng câu văn hiểu được (client claim / carry / đọc rồi chấm), không bắt người đọc phải tự suy ra cơ chế từ mã.
  human_override:

- eval: E8
  run_id: minted-do-quyen-luot-bang-hanh-vi-E8-r1
  exit_code: 2
  baseline: red
  verifier: config:executors.script.dq_khai_sinh
  verified_at: 2026-09-10T09:00:00Z
  output: |
    E2 · mo-cong (chieu do): ma 1, mong doi 1
    E2 · ternary-xuong-dong (chieu do): ma 1, mong doi 1
    E3 · cay-lai-tham-so (chieu do): ma 2, mong doi 2
    E3 · cho-goi-tinh-toan (chieu do): ma 2, mong doi 2
    E4 · ghim-cung (chieu do): ma 2, mong doi 2
    E4 · bien-trung-gian (chieu do): ma 2, mong doi 2
    E4 · quan-he-long (chieu do): ma 2, mong doi 2
    E4 · duoi-select (doi chung duong): ma 0, mong doi 0
    E5 · mang-theo-luon-mo (chieu do): ma 1, mong doi 1
    ban khai sinh khong chay dung nhu khai
      E2 · mo-cong: thieu thong diep ghim "cong dong khi hang khai CHAT"

- eval: E9
  run_id: minted-do-quyen-luot-bang-hanh-vi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dq_vet_ho_so_cu
  verified_at: 2026-09-10T09:00:00Z
  output: |
    vung DUOC DONG:
      _acceptance/quyen-luot-mang-theo/contract.md :: ## Notes
    vet-ho-so-cu: hai vung khong de nhau — sach

- eval: E10
  run_id: minted-do-quyen-luot-bang-hanh-vi-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dq_ho_so_cu_con_chay
  verified_at: 2026-09-10T09:00:00Z
  output: |
     3 expect() calls
    Ran 2 tests across 1 file. [60.00ms]
    bon lenh may cua ho so cu deu thoat 0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mtupgm96kuwp
  exit_code: 0
  verified_at: 2026-09-10T09:00:00Z

- cmd: bunx turbo run check-types --force
  run_id: minted-do-quyen-luot-bang-hanh-vi-SUITE-bunx_turbo_run_check_types_force-r1
  exit_code: 0
  verified_at: 2026-09-10T09:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-do-quyen-luot-bang-hanh-vi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-10T09:00:00Z

- cmd: bun run lint:slop
  run_id: minted-do-quyen-luot-bang-hanh-vi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-10T09:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-do-quyen-luot-bang-hanh-vi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-10T09:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

E1 — pass trên CẢ HEAD lẫn baseline diffBase (`cd apps/agent && bun test test/quyen-luot.spec.ts`, AC-1): harness chứng minh nhưng chưa phân biệt được tính năng khỏi code cũ. Nên viết lại để assert đúng hành vi mới của AC-1 (chiều dương), hoặc xác nhận rõ đây là regression-guard có chủ ý và ghi chú lại lý do.

## Variance

none — không có eval nào mang field `runs` > 1 trong vòng này (không có eval ngẫu nhiên).

## Iterations

Round 1: E2, E5, E8 fail — `cong-quyen-do.mjs` và `mang-theo-do.mjs` được `_acceptance/config.yaml` gọi trần, không kèm `--vecto`, nên cả hai luôn thoát mã 2 với thông điệp "can --vecto <ten>" thay vì đo được vectơ nào; E8 (`khai-sinh.mjs`) chạy lại từng dòng khai trong `khai-sinh.json` trên bản sao và phát hiện vectơ "mo-cong" của E2 không in đúng thông điệp ghim đã khai ("cong dong khi hang khai CHAT"). Trả về implementation.