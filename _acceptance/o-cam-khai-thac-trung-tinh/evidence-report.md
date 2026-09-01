---
schema_version: 2
feature_slug: o-cam-khai-thac-trung-tinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: eef6b4a7cb790dcbda85c84e6bdb0e761fcf0f5c
human_signoff:
---

# Evidence Report: o-cam-khai-thac-trung-tinh

Working tree at verify time: clean. `git status --porcelain` printed nothing.

Every command below was resolved from `_acceptance/config.yaml` through the
kit's own reader, `resolveConfigKey` in `lib/evidence-core.cjs`. No command was
retyped by hand.

E2, E3, E4 and E5 bind to the SAME command, `executors.script.rang_config_o_cam`.
That command ran ONCE. The four evals grade three different lines of that one
run's output. This report does not claim four independent runs.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | judgment | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: o-cam-khai-thac-trung-tinh-E1-1788224640
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_khai_thac
  verified_at: 2026-09-01T01:04:00Z
  output: |
    -- chieu duong: config that phai doc ra RONG
    o cam khai thac dang trong, dung nhu kit mac dinh
    -- chieu do: fixture CO khai thi phai doc ra duoc
    rang-config khai-thac: hai chieu dung

- eval: E2
  run_id: o-cam-khai-thac-trung-tinh-E2-1788224700
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_o_cam
  verified_at: 2026-09-01T01:05:00Z
  output: |
    -- chieu duong: config that
    hai o cam thiet ke deu doc ra ten skill
  # Line graded for E2: "hai o cam thiet ke deu doc ra ten skill" under the
  # positive leg. Both design sockets read back a skill name.

- eval: E3
  run_id: o-cam-khai-thac-trung-tinh-E3-1788224700
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_o_cam
  verified_at: 2026-09-01T01:05:00Z
  output: |
    rang-config o-cam: ba chieu dung
  # Line graded for E3: the closing summary of the same run. The harness now
  # asks for two design sockets only. It clears the real config.

- eval: E4
  run_id: o-cam-khai-thac-trung-tinh-E4-1788224700
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_o_cam
  verified_at: 2026-09-01T01:05:00Z
  output: |
    -- chieu do: fixture bo mot o cam thiet ke
    o cam thiet ke trong: feature_loop.ui_standards_skill
  # Line graded for E4: the red leg. The harness strips ui_standards_skill from
  # a copy of the config, catches the gap, and names the missing socket.

- eval: E5
  run_id: o-cam-khai-thac-trung-tinh-E5-1788224700
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_o_cam
  verified_at: 2026-09-01T01:05:00Z
  output: |
    -- chieu trung tinh: fixture CO khai o cam khai thac
    hai o cam thiet ke deu doc ra ten skill
  # Line graded for E5: the neutral leg. A fixture that DOES declare
  # discovery.brainstorm_skill stays green. Declaring it is not a defect.

- eval: E6
  run_id: o-cam-khai-thac-trung-tinh-E6-1788224720
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.start_scan
  verified_at: 2026-09-01T01:05:20Z
  output: |
    bo quet sach: config doc duoc, khong ho so hong, ban do khop, o cam khai thac trong
    -- chieu do: ban do lech thi phep do phai do
    rang-quet: hai chieu dung

- eval: E8
  run_id: o-cam-khai-thac-trung-tinh-E8-1788224820
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-01T01:07:00Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
    Time:    200ms

- eval: E9
  run_id: o-cam-khai-thac-trung-tinh-E9-1788224860
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-01T01:07:40Z
  output: |
    api:check-types: cache bypass, force executing 2135256e13140ac5
    api:check-types: $ tsc --noEmit
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
    Time:    5.648s

- eval: E7
  judged_by: judge-subagent (fresh context, blind — contract plus the referenced old contract only)
  verdict: PASS
  rationale: The Notes block of the signed record states AC-7 is superseded and names the replacement slug o-cam-khai-thac-trung-tinh, which is what AC-7 asks for. It also gives the reason inline — the kit rule makes the empty discovery socket legal — and records that the signed evidence stays valid at commit b933334, so a reader of the old record needs no hunting. The signed AC-7 text itself is unchanged.

## Known limits

- One command backs four criteria. E2, E3, E4 and E5 all resolve to
  `executors.script.rang_config_o_cam`. That is thin. Four criteria sharing one
  binary signal means one broken leg reddens all four, and no eval isolates a
  single leg. The legs are distinguishable only by reading the output lines,
  which is what this report does by hand.
- The red leg removes one design socket, not both. The harness strips
  `feature_loop.ui_standards_skill` only. A config that lost `design_pass.ds_skill`
  instead is never exercised.
- The judge did not read the kit text. It judged the supersession line against
  the two contracts alone. The verify context read
  `commands/start.md` lines 100-125 separately and confirms the claim.
- No baseline (diffBase) run was performed. Every eval carries `baseline: n-a`.
  Whether these evals discriminate the change from the prior tree is unmeasured.
- The supersession line in the signed record carries no date. A later round that
  revisits the same rule leaves two supersession claims with no order between them.

## Ngoài hợp đồng

- The lint task reports 5 warnings across `api` and `app` (unused import in
  `tracking.contracts`, a barrel file in `postcss.config.mjs`). The tasks
  succeed. The contract asks only that lint is green, so these are outside it.
- Two commits from the other session carry a `Co-Authored-By` trailer, which the
  repo rules forbid. The contract puts rewriting them out of scope. They remain.

## Analyst

Non-discriminating evals: unknown — no baseline tree was run this round, so no eval can be called green-on-both or red-on-baseline.

## Variance

none — every eval is deterministic and ran once.

## Iterations

Round 1: all nine evals cleared. No return to implementation.
