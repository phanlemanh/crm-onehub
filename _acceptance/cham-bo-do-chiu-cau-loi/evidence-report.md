---
schema_version: 2
feature_slug: cham-bo-do-chiu-cau-loi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ee9ec13940940eb01b3d419bf02a2f2dcd7b19c9
human_signoff:
---

# Evidence Report: cham-bo-do-chiu-cau-loi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E7j | AC-7 | judgment | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cham-bo-do-chiu-cau-loi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cbd_tran_loi
  verified_at: 2026-10-30T04:16:48Z
  output: |
    bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t tran-loi
    Ran 5 tests across 1 file. [116.00ms]

- eval: E2
  run_id: minted-cham-bo-do-chiu-cau-loi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cbd_tran_loi
  verified_at: 2026-10-30T04:16:48Z
  output: |
    bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t tran-loi
    Ran 5 tests across 1 file. [116.00ms]

- eval: E3
  run_id: minted-cham-bo-do-chiu-cau-loi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cbd_tran_loi
  verified_at: 2026-10-30T04:16:48Z
  output: |
    bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t tran-loi
    Ran 5 tests across 1 file. [116.00ms]

- eval: E4
  run_id: minted-cham-bo-do-chiu-cau-loi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_vung_xam
  verified_at: 2026-10-30T04:16:48Z
  output: |
    bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t vung-xam
    Ran 9 tests across 1 file. [135.00ms]

- eval: E5
  run_id: minted-cham-bo-do-chiu-cau-loi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cbd_du_ma
  verified_at: 2026-10-30T04:16:48Z
  output: |
    bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t du-ma
    Ran 2 tests across 1 file. [112.00ms]

- eval: E6
  run_id: minted-cham-bo-do-chiu-cau-loi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cbd_cham_lai_mau
  verified_at: 2026-10-30T04:16:48Z
  output: |
    bun _acceptance/cham-bo-do-chiu-cau-loi/rang/cham-lai-mau.mjs
    trung-ma ma 2 dat — trung ma 1:c01

- eval: E7
  run_id: minted-cham-bo-do-chiu-cau-loi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cbd_f12_xanh
  verified_at: 2026-10-30T04:16:48Z
  output: |
    bun _acceptance/cham-bo-do-chiu-cau-loi/rang/f12-xanh.mjs
    ma tran: 21/21 giu ma nen

- eval: E7j
  judged_by: judge panel (fresh context, 3 lens: domain-correctness, operational-feasibility, spec-alignment) — đề xuất PASS
  verdict: PASS
  rationale: cham-lai.mjs đo cả hai phía của lời mới, một câu loi dưới trần (không phải mã 2, in dòng câu lỗi kèm id) và vượt trần (mã 2, đúng dòng vượt trần). AC-1, AC-6, AC-7, AC-12 và expected của E1, E6, E7, E13 đều chỉ nói vượt trần là mã 2. Sổ có dòng fix d-20261030T040813Z-31 mang decided_by Phan Le Manh nêu lý do đổi.
  votes:
    - domain-correctness: PASS — AC-1 nêu đủ trần (5% số câu của lượt, làm tròn xuống, tối thiểu 1); dưới trần chấm trên các câu còn lại và in dòng «cau loi model: n/…», vượt trần thì mã 2 «KHONG DO DUOC: n cau loi vuot tran t». cham-lai.mjs dựng đủ ba ca (dưới trần, tran+1 câu LOI, vùng xám); cặp đột biến e phá điều kiện vượt trần và ghim «hoi lai khi luot 1 loi vuot tran», phía dưới trần được cặp h và E6 phủ. Sổ có dòng d-31 (type fix, decided_by Phan Le Manh), chủ kho chốt «a, 5%».
    - operational-feasibility: PASS — cham-lai.mjs đo cả hai phía của lời mới; cặp e phá `loi.length > tran` và cặp h phá việc dán nhãn LOI (ghim «cham-bo-do khong dung ham nhan»). Một điểm không kiểm được từ danh sách đầu vào là phép round-trip đòi đúng 5 dòng tổng khi mã khác 2, chỉ đúng nếu cham-bo-do.ts luôn in dòng «cau loi model» kể cả khi n bằng 0; hợp đồng và E13 ngầm nói là có nên không hạ điểm.
    - spec-alignment: PASS — một câu LOI dưới trần không thoát mã 2 và dòng «cau loi model: 1/…» chứa id câu đó; vượt trần thoát mã 2 với «KHONG DO DUOC: n cau loi vuot tran t». AC-1, AC-6, AC-7, AC-12 và expected của E1, E6, E7, E13 không còn câu nào coi một câu loi bất kể trần là mã 2. Sổ dòng d-20261030T040813Z-31 (type fix) có decided_by «Phan Le Manh» và trường why nêu lý do.
  human_override:  # chi nguoi ghi

- eval: E8
  run_id: minted-cham-bo-do-chiu-cau-loi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cbd_dot_bien
  verified_at: 2026-10-30T04:16:48Z
  output: |
    bun _acceptance/cham-bo-do-chiu-cau-loi/rang/dot-bien.mjs
    t6 hoi-lai (cap e F12) xanh=0 do=1 ghim=ok

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-cham-bo-do-chiu-cau-loi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-30T04:16:48Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-cham-bo-do-chiu-cau-loi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-30T04:16:48Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-cham-bo-do-chiu-cau-loi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-30T04:16:48Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-cham-bo-do-chiu-cau-loi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-30T04:16:48Z

- cmd: bunx turbo run lint --force
  run_id: minted-cham-bo-do-chiu-cau-loi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-30T04:16:48Z

- cmd: bun run lint:slop
  run_id: minted-cham-bo-do-chiu-cau-loi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-30T04:16:48Z

- cmd: bunx turbo run build --force
  run_id: minted-cham-bo-do-chiu-cau-loi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-30T04:16:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Danh sách eval không-phân-biệt (xanh cả ở HEAD lẫn baseline) KHÔNG đo được ở round này vì baseline bị chặn hạ tầng; mọi field baseline của eval máy là n-a.

### Baseline khong do

- bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t tran-loi: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t vung-xam: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts -t du-ma: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/cham-bo-do-chiu-cau-loi/rang/cham-lai-mau.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/cham-bo-do-chiu-cau-loi/rang/f12-xanh.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/cham-bo-do-chiu-cau-loi/rang/dot-bien.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không có phương sai)

## Iterations

Round 1: tất cả eval máy đạt (E1-E8), E7j đề xuất đạt; không eval nào đỏ, chưa cần quay lại implementation.

### Re-pin lần 1 — 2026-10-30, do gộp onehub 59697fa4e (#589) sau F34
run_id: repin-20261030T060554Z-13119
sha: ee9ec13940940eb01b3d419bf02a2f2dcd7b19c9 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E7j (E7j không khai paths) · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
