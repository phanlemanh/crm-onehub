---
schema_version: 2
feature_slug: sua-test-do-thu-tu-nap
verdict: REJECT
failed_evals: [E4, E9]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8ec30130fa3edd3bf0663f067235d09accec94df
human_signoff:
---

# Evidence Report: sua-test-do-thu-tu-nap

Round 2. The working tree is CLEAN at verify time. `git status --porcelain`
returned no lines. Every verifier ran on commit
`8ec30130fa3edd3bf0663f067235d09accec94df`, so the pin is real this round.

Two evals are red. E4 is red from an intermittent `apps/agent` test. E9 is red
from a gate rule that fires on this acceptance record itself. Neither red comes
from the code the contract describes. Details are under each block.

| Eval | Criterion | Executor | Round 1 | Round 2 |
|---|---|---|---|---|
| E1 | AC-1 | script | PASS | PASS |
| E2 | AC-2 | script | PASS | PASS |
| E3 | AC-3 | script | PASS | PASS |
| E4 | AC-4 | test | PASS | FAIL |
| E5 | AC-5 | script | PASS | PASS |
| E6 | AC-6 | script | PASS | PASS |
| E7 | AC-7 | script | PASS | PASS |
| E8 | AC-8 | script | PASS | PASS |
| E9 | AC-9 | script | PASS | FAIL |
| E10 | AC-10 | script | PASS (cached) | PASS (executed) |
| E11 | AC-10 | script | PASS (cached) | PASS (executed) |
| E12 | AC-11 | judgment | PASS | PASS (carried, inputs unchanged) |

## Evidence

- eval: E1
  run_id: sua-test-do-thu-tu-nap-E1-1788218927
  exit_code: 0
  verifier: config:executors.script.rang_suite_sach
  verified_at: 2026-08-31T23:28:47Z
  output: |
     381 pass
     0 fail
     934 expect() calls
    Ran 381 tests across 35 files. [2.76s]
    rang-suite sach: 381 pass, 0 fail

- eval: E2
  run_id: sua-test-do-thu-tu-nap-E2-1788218936
  exit_code: 0
  verifier: config:executors.script.rang_suite_thu_tu
  verified_at: 2026-08-31T23:28:56Z
  output: |
    -- chieu duong: co preload
     16 pass
     0 fail
    -- chieu do: bo preload di
     15 pass
     1 fail
    rang-suite thu-tu: hai chieu dung, bo preload thi 1 ca do

- eval: E3
  run_id: sua-test-do-thu-tu-nap-E3-1788218942
  exit_code: 0
  verifier: config:executors.script.db_test
  verified_at: 2026-08-31T23:29:02Z
  output: |
    @crm/db db:test: Prisma schema loaded from prisma/schema.prisma.
    @crm/db db:test: Datasource "db": PostgreSQL database "crm_test", schema "public" at "localhost:5432"
    @crm/db db:test: 56 migrations found in prisma/migrations
    @crm/db db:test: No pending migrations to apply.
    @crm/db db:test: Exited with code 0
    (grep for "Neither TEST_DATABASE_URL nor DATABASE_URL is set" returns 0 matches)

- eval: E4
  run_id: sua-test-do-thu-tu-nap-E4-1788218985
  exit_code: 1
  verifier: config:executors.test.api_khong_cache
  verified_at: 2026-08-31T23:29:45Z
  output: |
    agent:test: Ran 367 tests across 34 files. [1450.00ms]
    agent:test: error: script "test" exited with code 1
    agent#test:  ERROR  command (/Users/manhphan/dev/crm/apps/agent) bun run test exited (1)
     Tasks:    8 successful, 10 total
    Cached:    0 cached, 10 total
    Failed:    agent#test
  failing_test: |
    test/tasks.integration.spec.ts:193
    (fail) retireExhausted > retires no more rows than the limit allows
    expect(received).toBeLessThanOrEqual(expected)
      Expected: <= 2
      Received: 3
  note: |
    The cache was genuinely defeated (0 cached, 10 total). The failure is
    intermittent and order-dependent. See ## Variance for the measured rate.
    This is the flaky apps/agent test the contract lists under Out of scope
    (issue trycompai/crm#195). AC-4 as written still demands every task green,
    so the eval is recorded red. It was NOT re-run to green in its own place.

- eval: E5
  run_id: sua-test-do-thu-tu-nap-E5-1788219051
  exit_code: 0
  verifier: config:executors.script.rang_config_doi
  verified_at: 2026-08-31T23:30:51Z
  output: |
    -- chieu duong: config that
    executors sach: khong duong dan tuyet doi, khong so hieu phien ban
    -- chieu do: fixture co duong dan ghi cung
    duong dan ghi cung trong executors: 1
    rang-config doi: hai chieu dung

- eval: E6
  run_id: sua-test-do-thu-tu-nap-E6-1788219057
  exit_code: 0
  verifier: config:executors.script.resolve_plugin
  verified_at: 2026-08-31T23:30:57Z
  output: |
    /Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.5.0
    (verifier check: the path is a real directory and carries scripts/product-map.mjs)

- eval: E7
  run_id: sua-test-do-thu-tu-nap-E7-1788219064
  exit_code: 0
  verifier: config:executors.script.rang_config_o_cam
  verified_at: 2026-08-31T23:31:04Z
  output: |
    -- chieu duong: config that
    ba o cam deu doc ra ten skill
    -- chieu do: fixture bo mot o cam
    o cam trong: feature_loop.ui_standards_skill
    rang-config o-cam: hai chieu dung

- eval: E8
  run_id: sua-test-do-thu-tu-nap-E8-1788219070
  exit_code: 0
  verifier: config:executors.script.rang_t1_chan
  verified_at: 2026-08-31T23:31:10Z
  output: |
        apps/api/src/rang-t1-escape-91427.ts
    ran t1-escape
    pre-merge-check: rules ran=4 declared-off=0 expected=4
    pre-merge-check: 2 violation(s) — merge blocked
    rang-t1-escape chan: cong chan dung

- cmd: reproduce the rang-t1-escape --chan chan scenario and capture the full pre-merge-check.sh output
  run_id: sua-test-do-thu-tu-nap-SUITE-violation-capture-1788219098
  exit_code: 0
  verified_at: 2026-08-31T23:31:38Z
  purpose: closes round-1 finding 5 — the harness prints only tail -4, so the VIOLATION line was never in the excerpt
  output: |
    VIOLATION [PR]: non-T1 files changed (outside t1_skip_globs) but the PR
    carries NO _acceptance/<slug>/ artifacts — declare T1 honestly
    (t1_skip_globs) or run the gate. Changed:
        apps/api/src/rang-t1-escape-capture.ts

- eval: E9
  run_id: sua-test-do-thu-tu-nap-E9-1788219098
  exit_code: 1
  verifier: config:executors.script.rang_t1_im
  verified_at: 2026-08-31T23:31:38Z
  output: |
    ran gap-probe
    ran t1-escape
    pre-merge-check: rules ran=4 declared-off=0 expected=4
    pre-merge-check: 1 violation(s) — merge blocked
    RANG CUN: diff chi cham file T1 ma cong van chan

- cmd: reproduce the rang-t1-escape --chan im scenario and capture the full pre-merge-check.sh output
  run_id: sua-test-do-thu-tu-nap-SUITE-t1-im-capture-1788219130
  exit_code: 0
  verified_at: 2026-08-31T23:32:10Z
  purpose: establish WHY E9 is red
  output: |
    VIOLATION [sua-test-do-thu-tu-nap]: status=implemented but approved_by is
    empty — làn V đòi xanh-sạch hoặc chữ ký (mục «Known limits» có nội dung).
    ran per-slug
    NOTE: cửa veto đang mở — 1 hồ sơ máy đã đi trước mà owner chưa veto
    ran veto-trace
    ran gap-probe
    ran t1-escape
    pre-merge-check: 1 violation(s) — merge blocked
    (count of "VIOLATION [PR]" lines in this output: 0)
  reading: |
    The t1-escape rule itself behaved correctly: zero VIOLATION [PR] lines for a
    T1-only diff. The non-zero return comes from a DIFFERENT rule, per-slug,
    which fires because the round-1 evidence report is now committed with
    status=implemented, an empty approved_by, and a non-empty Known limits
    section. AC-9 has two clauses. The "no VIOLATION [PR]" clause holds. The
    "exit 0" clause does not. The eval is recorded red on the written wording.

- eval: E10
  run_id: sua-test-do-thu-tu-nap-E10-1788219139
  exit_code: 0
  verifier: bunx turbo run lint --force
  verified_at: 2026-08-31T23:32:19Z
  deviation: |
    The config command is "bun run lint". Round 1 served it entirely from the
    turbo cache, so no linter ran. Round 2 used --force to defeat the cache, as
    the coordinator directed. Same task graph, cache bypassed.
  output: |
    @crm/ui:lint: cache bypass, force executing 95c4877f418722ca
    @crm/db:lint: cache bypass, force executing 7c704cda36c6de35
    api:lint: cache bypass, force executing 57f53401491cbdf7
    app:lint: cache bypass, force executing c79f9bb82e2076f3
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total

- eval: E11
  run_id: sua-test-do-thu-tu-nap-E11-1788219156
  exit_code: 0
  verifier: bunx turbo run check-types --force
  verified_at: 2026-08-31T23:32:36Z
  deviation: |
    The config command is "bun run check-types". Round 2 used --force so tsc
    actually executed.
  output: |
    @crm/auth:check-types: cache bypass, force executing 7eedaaed5b8382a3
    app:check-types: cache bypass, force executing 505c7e6b895c7232
    api:check-types: cache bypass, force executing 2135256e13140ac5
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total

- eval: E12
  judged_by: judge-subagent (fresh context, blind — contract + the two named files only)
  verdict: PASS
  judged_in_round: 1
  inputs_unchanged: |
    Not re-run. The two judged files are byte-identical to what the round-1
    judge read. sha256 of the clean worktree copies equals sha256 of the blobs
    at 8ec3013: setup.ts d5f5141cdf840fcb…, auth.e2e.spec.ts 952b3249f0759e56…
    The 83d0b59..8ec3013 diff for those two files is the same 16-line move,
    16 deletions and 16 insertions, no other edit.
  rationale: The assertion in apps/api/test/auth.e2e.spec.ts is still a strict toEqual on the whole response object with google:true as a hard literal, with no skip, try/catch, toMatchObject or conditional guard around the Google field. The fake credentials moved to apps/api/test/setup.ts are set unconditionally through the fallback helper, so the endpoint must genuinely report Google as configured or the test fails. The fix changed WHEN the variables are set, not how strongly the test asserts.

## Known limits

- E4 is red on an intermittent test the contract puts out of scope. The eval as
  written cannot distinguish "the fix broke a task" from "an unrelated task
  flaked". A human decides whether to quarantine the agent test, or to narrow
  AC-4 to the tasks this change touches.
- E9 is red for a self-referential reason. The acceptance record's own unsigned
  state trips the per-slug rule, so the T1 silence eval can never be green while
  this record is open. Signing at Gate 2, or emptying Known limits, clears it.
- No diffBase baseline run this round. Discrimination still rests on the
  in-harness negative controls (E2, E5, E7, E8, E9), not on an A/B against the
  pre-feature tree. This limit carries over from round 1.
- The report and run-log are themselves gate files under `_acceptance/`, so
  writing them re-dirties the tree after the pin. `pre-merge-check` excludes
  that directory from its staleness rule, so the pin stays valid for code.

## Ngoài hợp đồng

- `apps/api/test/auth.e2e.spec.ts` computes its own expectation for the
  `microsoft` field from the same environment variables the endpoint reads. That
  assertion cannot fail. It is pre-existing and outside this diff, but it is the
  exact weak-assertion shape AC-11 asks about for `google`.
- `apps/agent/test/tasks.integration.spec.ts:193` asserts `retireExhausted(2)`
  returns at most 2 rows. It returned 3 under full-suite load and never under
  isolation. That points at a real limit or locking defect in `retireExhausted`,
  not only at a noisy test. It is outside this contract.
- `pre-merge-check` currently blocks merge on this repository. The committed
  round-1 evidence report has `status=implemented` with an empty `approved_by`,
  so the per-slug rule holds the gate until a human signs.

## Analyst

No diffBase baseline ran, so no eval is declared green-on-both from measurement.
Five evals carry their own negative control and are self-discriminating: E2
removes the preload and requires the pair to go red, E5 injects a hard-coded
path fixture and requires detection, E7 removes a socket and requires detection,
E8 requires the gate to block, E9 requires the gate to stay silent. E1, E3, E4,
E6, E10 and E11 are plain green-path checks.

Round 2 shows E9 is coupled to state the contract did not anticipate. The eval
reads the whole gate exit code, but AC-9 only cares about the t1-escape rule.
Any unrelated rule turns this eval red. That is a contract wording defect, not a
product defect.

## Variance

E4 is declared deterministic (no `runs` field) and it varied across re-runs. It
is flaky. Measured this round:

- E4 at eval level: 1 red, then 1 green on a transparent re-run
  (`sua-test-do-thu-tu-nap-E4-rerun-1788219175`). The re-run does NOT replace the
  recorded red.
- `apps/agent` full suite alone: 1 red (inside the first E4), then 3 green.
- `apps/agent/test/tasks.integration.spec.ts` alone: 3 green, 0 red.

Root cause: the failure appears only when the whole agent suite runs together,
never in isolation. That points at shared test-database state or a concurrency
race across spec files, not at a defect in the change under test.

## Iterations

Round 1: every machine eval green on the uncommitted tree. E12 PASS. Report
written with a dirty-tree caveat, no real pin, and lint/check-types served from
the turbo cache.
Round 2: change committed at 8ec3013, tree clean, pin real. E10 and E11 re-run
with the cache defeated and genuinely executed — round-1 finding 3 closed. The
VIOLATION [PR] line captured verbatim — round-1 finding 5 closed. E4 and E9 came
back red for the two reasons above. Verdict REJECT. Neither red is in the code
the contract describes, so the next step is a human decision on the two evals,
not a code fix.
