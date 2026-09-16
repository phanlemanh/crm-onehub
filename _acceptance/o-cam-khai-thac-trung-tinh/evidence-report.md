---
schema_version: 2
feature_slug: o-cam-khai-thac-trung-tinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 96ec6d9b0447bb8e3eafaf36c84dc9902372ebef
human_signoff: Manh Phan 2026-09-01
---

# Evidence Report: o-cam-khai-thac-trung-tinh

Round 2. Verified at commit `f4b2ea9d72b5f03de89ab1009b40a3f86c374e59`, confirmed
by `git rev-parse HEAD` in this context. Working tree clean: `git status --porcelain`
printed nothing.

Every command below was resolved fresh from `_acceptance/config.yaml` through the
kit's own reader, `resolveConfigKey` in `lib/evidence-core.cjs`. The eval keys
changed this round and the new keys resolve.

E2 and E3 share one command, `executors.script.rang_config_o_cam_duong`. It ran
ONCE and backs both. E4 and E5 now have their own commands and their own exit
codes. This report does not claim two independent runs for E2 and E3.

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
  run_id: o-cam-khai-thac-trung-tinh-E1-1788225050
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_khai_thac
  verified_at: 2026-09-01T01:10:50Z
  output: |
    -- chieu duong: config that phai doc ra RONG
    o cam khai thac dang trong, dung nhu kit mac dinh
    -- chieu do: fixture CO khai thi phai doc ra duoc
    rang-config khai-thac: hai chieu dung

- eval: E2
  run_id: o-cam-khai-thac-trung-tinh-E2-1788225060
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_o_cam_duong
  verified_at: 2026-09-01T01:11:00Z
  output: |
    -- chieu duong: config that
    hai o cam thiet ke deu doc ra ten skill
    rang-config o-cam-duong: chieu duong dung
  # Line graded for E2: "hai o cam thiet ke deu doc ra ten skill". Both design
  # sockets read back a skill name through the kit reader.

- eval: E3
  run_id: o-cam-khai-thac-trung-tinh-E3-1788225060
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_o_cam_duong
  verified_at: 2026-09-01T01:11:00Z
  output: |
    rang-config o-cam-duong: chieu duong dung
  # Line graded for E3: the closing summary of the same run. The positive leg
  # clears the real config and no longer asks for a discovery socket.

- eval: E4
  run_id: o-cam-khai-thac-trung-tinh-E4-1788225070
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_o_cam_do
  verified_at: 2026-09-01T01:11:10Z
  output: |
    -- chieu do: fixture bo ui_standards_skill
    o cam thiet ke trong: feature_loop.ui_standards_skill
    -- chieu do: fixture bo ds_skill
    o cam thiet ke trong: design_pass.ds_skill
    rang-config o-cam-do: ca hai o cam thiet ke deu co rang
  # Two fixtures now, one per design socket, each named correctly in the output.

- eval: E5
  run_id: o-cam-khai-thac-trung-tinh-E5-1788225080
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_config_o_cam_trung_tinh
  verified_at: 2026-09-01T01:11:20Z
  output: |
    -- chieu trung tinh: fixture CO khai o cam khai thac
    hai o cam thiet ke deu doc ra ten skill
    rang-config o-cam-trung-tinh: khai o cam khai thac khong phai loi
  # A fixture that DOES declare discovery.brainstorm_skill stays green.
  # Declaring the discovery socket is not a defect.

- eval: E6
  run_id: o-cam-khai-thac-trung-tinh-E6-1788225090
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.start_scan
  verified_at: 2026-09-01T01:11:30Z
  output: |
    bo quet sach: config doc duoc, khong ho so hong, ban do khop, o cam khai thac trong
    -- chieu do: ban do lech thi phep do phai do
    rang-quet: hai chieu dung

- eval: E8
  run_id: o-cam-khai-thac-trung-tinh-E8-1788225150
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-01T01:12:30Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
    Time:    272ms

- eval: E9
  run_id: o-cam-khai-thac-trung-tinh-E9-1788225200
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-01T01:13:20Z
  output: |
    api:check-types: cache bypass, force executing 2135256e13140ac5
    api:check-types: $ tsc --noEmit
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
    Time:    5.455s

- eval: E7
  judged_by: judge-subagent (fresh context, blind — the two contract files only)
  verdict: PASS
  rationale: Both judged files changed between round 1 and round 2, so the judge was re-run rather than carried forward. The Notes block of the signed record now reads "AC-7 đã bị thay thế 2026-09-01 — xem hồ sơ o-cam-khai-thac-trung-tinh", giving the date, the replacement slug, and the reason inline — the kit rule that leaves the discovery socket legally empty. The signed AC-7 text itself is unchanged and the record stays signed-off.

## Known limits

- The self-count guard in the red leg was probed, not assumed. Replicating its
  arithmetic against the real config shows the anchored pattern drops one socket
  line for each key, while the old unanchored pattern drops two socket lines for
  `ds_skill`. The guard therefore fires on exactly the substring collision it was
  added for. It discriminates. It is not decoration.
- E2 and E3 still share one command and one exit code. Round 2 reduced the
  four-criteria-on-one-signal problem to two, it did not remove it. AC-2 and AC-3
  assert nearly the same thing, so the cost is small, but the finding is not
  fully closed.
- No baseline (diffBase) run was performed in either round. Every eval carries
  `baseline: n-a`. Whether these evals discriminate this change from the prior
  tree stays unmeasured.
- The composite key `executors.script.rang_config_o_cam` still exists in
  `_acceptance/config.yaml` and still chains all three legs, but no eval binds it
  this round. Its chaining path is unexercised by the gate.
- The supersession block in the signed record names the tooth as
  `rang-config.sh --chan o-cam`. After this round that is the composite alias,
  not the leg that grades AC-4. The reference still resolves and still runs.

## Ngoài hợp đồng

- The claim that the round-1 red leg "went red for the wrong reason" does not
  hold. The round-1 harness at commit `eef6b4a` used `grep -v "ui_standards_skill"`,
  and the probe shows that pattern drops one socket line, not two. The substring
  collision bites `ds_skill` only. It was a defect in the round-2 extension,
  caught before it shipped, never a latent defect in the round-1 measure. The
  round-2 fix is still correct; only the story about round 1 is wrong.
- The lint task reports 5 warnings across `api` and `app` (an unused import in
  `tracking.contracts`, a barrel file in `postcss.config.mjs`). The tasks
  succeed. The contract asks only that lint is green.
- Two commits from the other session carry a `Co-Authored-By` trailer, which the
  repo rules forbid. The contract puts rewriting them out of scope.

## Analyst

Non-discriminating evals: unknown — no baseline tree was run in either round, so no eval can be called green-on-both or red-on-baseline.

## Variance

none — every eval is deterministic and ran once per round.

## Iterations

Round 1 (commit eef6b4a): all nine evals cleared. The verifier raised two weaknesses in the measure itself — four criteria bound to one exit code, and a red leg that stripped only one design socket.
Round 2 (commit f4b2ea9): both weaknesses addressed before any red. Three separate legs replace the single socket command, and the red leg strips each design socket in turn with a self-count guard. All nine evals cleared again. The judge was re-run because both judged files changed.

### Re-pin lần 1 — 07/09, do vòng sửa `thuoc-cache-het-doi-tuong` chạm hai file cấu hình turbo

run_id: repin-20260907T005455Z-44758
sha: f8aa7f4a9e1ec9ce1be8585683103adf1a901431 · suites: 4 lệnh exit 0

### Re-pin lần 2 — 2026-09-16, do Chiến dịch ghim lại theo mốc kit 2.14.0 — sáu hồ sơ làn xanh; năm hồ sơ còn lại đỏ vì nguyên nhân thật, đi lượt riêng
run_id: repin-20260916T014000Z-73664
sha: 96ec6d9b0447bb8e3eafaf36c84dc9902372ebef · suites: 4 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng
