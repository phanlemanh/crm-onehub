---
schema_version: 2
feature_slug: sua-test-do-thu-tu-nap
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 83d0b59ea5b6ad820045a3e834b3d587746a815f
human_signoff:
---

# Evidence Report: sua-test-do-thu-tu-nap

The working tree is DIRTY at verify time. The change is not committed. Every
verifier ran on the uncommitted tree, not on commit 83d0b59. The five modified
or new paths are `_acceptance/README.md`, `_acceptance/config.yaml`,
`apps/api/test/auth.e2e.spec.ts`, `apps/api/test/setup.ts`,
`packages/db/scripts/test-db.ts`, plus the untracked
`_acceptance/sua-test-do-thu-tu-nap/` and `scripts/resolve-plugin.mjs`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | judgment | PASS |

## Evidence

- eval: E1
  run_id: sua-test-do-thu-tu-nap-E1-1788218512
  exit_code: 0
  verifier: config:executors.script.rang_suite_sach
  verified_at: 2026-08-31T23:21:52Z
  output: |
     381 pass
     0 fail
     934 expect() calls
    Ran 381 tests across 35 files. [2.89s]
    rang-suite sach: 381 pass, 0 fail

- eval: E2
  run_id: sua-test-do-thu-tu-nap-E2-1788218524
  exit_code: 0
  verifier: config:executors.script.rang_suite_thu_tu
  verified_at: 2026-08-31T23:22:04Z
  output: |
    -- chieu duong: co preload
     16 pass
     0 fail
    -- chieu do: bo preload di
     15 pass
     1 fail
    rang-suite thu-tu: hai chieu dung, bo preload thi 1 ca do

- eval: E3
  run_id: sua-test-do-thu-tu-nap-E3-1788218545
  exit_code: 0
  verifier: config:executors.script.db_test
  verified_at: 2026-08-31T23:22:25Z
  output: |
    @crm/db db:test:   crm_test already exists
    @crm/db db:test: Prisma schema loaded from prisma/schema.prisma.
    @crm/db db:test: Datasource "db": PostgreSQL database "crm_test", schema "public" at "localhost:5432"
    @crm/db db:test: 56 migrations found in prisma/migrations
    @crm/db db:test: No pending migrations to apply.
    @crm/db db:test: Exited with code 0
    (grep for "Neither TEST_DATABASE_URL nor DATABASE_URL is set" returns 0 matches)

- eval: E4
  run_id: sua-test-do-thu-tu-nap-E4-1788218576
  exit_code: 0
  verifier: config:executors.test.api_khong_cache
  verified_at: 2026-08-31T23:22:56Z
  output: |
    app:test:  169 pass
    app:test:  0 fail
    app:test: Ran 169 tests across 17 files. [270.00ms]
     Tasks:    10 successful, 10 total
    Cached:    0 cached, 10 total
      Time:    18.299s

- eval: E5
  run_id: sua-test-do-thu-tu-nap-E5-1788218588
  exit_code: 0
  verifier: config:executors.script.rang_config_doi
  verified_at: 2026-08-31T23:23:08Z
  output: |
    -- chieu duong: config that
    executors sach: khong duong dan tuyet doi, khong so hieu phien ban
    -- chieu do: fixture co duong dan ghi cung
    duong dan ghi cung trong executors: 1
    rang-config doi: hai chieu dung

- eval: E6
  run_id: sua-test-do-thu-tu-nap-E6-1788218595
  exit_code: 0
  verifier: config:executors.script.resolve_plugin
  verified_at: 2026-08-31T23:23:15Z
  output: |
    /Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.5.0
    (verifier check: the path is a real directory and carries scripts/product-map.mjs)

- eval: E7
  run_id: sua-test-do-thu-tu-nap-E7-1788218602
  exit_code: 0
  verifier: config:executors.script.rang_config_o_cam
  verified_at: 2026-08-31T23:23:22Z
  output: |
    -- chieu duong: config that
    ba o cam deu doc ra ten skill
    -- chieu do: fixture bo mot o cam
    o cam trong: feature_loop.ui_standards_skill
    rang-config o-cam: hai chieu dung

- eval: E8
  run_id: sua-test-do-thu-tu-nap-E8-1788218616
  exit_code: 0
  verifier: config:executors.script.rang_t1_chan
  verified_at: 2026-08-31T23:23:36Z
  output: |
        apps/api/src/rang-t1-escape-88330.ts
    ran t1-escape
    pre-merge-check: rules ran=4 declared-off=0 expected=4
    pre-merge-check: 1 violation(s) — merge blocked
    (harness asserts the gate returned non-zero AND printed "VIOLATION [PR]")

- eval: E9
  run_id: sua-test-do-thu-tu-nap-E9-1788218623
  exit_code: 0
  verifier: config:executors.script.rang_t1_im
  verified_at: 2026-08-31T23:23:43Z
  output: |
    ran gap-probe
    ran t1-escape
    pre-merge-check: rules ran=4 declared-off=0 expected=4
    pre-merge-check: clean
    rang-t1-escape im: cong im dung, exit 0

- eval: E10
  run_id: sua-test-do-thu-tu-nap-E10-1788218634
  exit_code: 0
  verifier: config:executors.script.lint
  verified_at: 2026-08-31T23:23:54Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    9 cached, 9 total
      Time:    24ms >>> FULL TURBO

- eval: E11
  run_id: sua-test-do-thu-tu-nap-E11-1788218652
  exit_code: 0
  verifier: config:executors.script.check_types
  verified_at: 2026-08-31T23:24:12Z
  output: |
    app:check-types: $ tsc --noEmit
    api:check-types: $ tsc --noEmit
     Tasks:    13 successful, 13 total
    Cached:    13 cached, 13 total
      Time:    26ms >>> FULL TURBO

- eval: E12
  judged_by: judge-subagent (fresh context, blind — contract + the two named files only)
  verdict: PASS
  rationale: The assertion in apps/api/test/auth.e2e.spec.ts is still a strict toEqual on the whole response object with google:true as a hard literal, with no skip, try/catch, toMatchObject or conditional guard around the Google field. The fake credentials moved to apps/api/test/setup.ts are set unconditionally through the fallback helper, so the endpoint must genuinely report Google as configured or the test fails. The fix changed WHEN the variables are set, not how strongly the test asserts.

## Known limits

- The verified tree is uncommitted. `verified_commit` pins 83d0b59, but the code
  under test is the dirty working tree on top of it. Staleness against that SHA
  is therefore not checkable. Commit the change and re-run to make the pin real.
- No diffBase baseline run this round. Discrimination rests on the in-harness
  negative controls (E2, E5, E7, E8, E9), not on an A/B against the old tree.
- E10 and E11 were served entirely from the turbo cache (`FULL TURBO`). The cache
  key hashes the current file contents, so the result is valid, but no compiler
  or linter process ran during this verify.

## Ngoài hợp đồng

- `apps/api/test/auth.e2e.spec.ts` computes its own expectation for the
  `microsoft` field from the same environment variables the endpoint reads. That
  assertion cannot fail. It is pre-existing and outside this diff, but it is the
  exact weak-assertion shape AC-11 asks about for `google`.

## Analyst

Baseline (diffBase) runs were not executed this round, so no eval can be
declared green-on-both from measurement. Five evals carry their own negative
control inside the harness and are self-discriminating: E2 removes the preload
and requires the pair to go red, E5 injects a hard-coded path fixture and
requires detection, E7 removes a socket and requires detection, E8 requires the
gate to block, E9 requires the gate to stay silent. E1, E3, E4, E6, E10 and E11
are plain green-path checks and prove the harness plus the fix together.

## Variance

none — no eval declares runs > 1.

## Iterations

Round 1: every machine eval green on first run. The judgment item returned PASS.
No return to implementation.
