---
schema_version: 2
feature_slug: sua-test-do-thu-tu-nap
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b9333341e5bf7f706276f2b2e6a02f472052a49c
human_signoff: Manh Phan 2026-09-01
---

# Evidence Report: sua-test-do-thu-tu-nap

Round 3 of a maximum of 3. The working tree is CLEAN at verify time.
`git status --porcelain` returned no lines. Every verifier ran on commit
`b9333341e5bf7f706276f2b2e6a02f472052a49c`.

**Read this before signing: AC-4 and AC-9 were amended AFTER round 2 turned them
red.** The two reds were resolved by changing the criteria, not by changing the
product. The contract records both amendments in its Notes section. My judgment
of that scoping is in `## Analyst`. Nothing in `apps/`, `packages/` or `scripts/`
changed between round 2 and round 3 — the amendment is confined to
`_acceptance/`.

| Eval | Criterion | Executor | R1 | R2 | R3 |
|---|---|---|---|---|---|
| E1 | AC-1 | script | PASS | PASS | PASS |
| E2 | AC-2 | script | PASS | PASS | PASS |
| E3 | AC-3 | script | PASS | PASS | PASS |
| E4 | AC-4 (amended) | test | PASS | red | PASS |
| E5 | AC-5 | script | PASS | PASS | PASS |
| E6 | AC-6 | script | PASS | PASS | PASS |
| E7 | AC-7 | script | PASS | PASS | PASS |
| E8 | AC-8 | script | PASS | PASS | PASS |
| E9 | AC-9 (amended) | script | PASS | red | PASS |
| E10 | AC-10 | script | PASS (cached) | PASS | PASS |
| E11 | AC-10 | script | PASS (cached) | PASS | PASS |
| E12 | AC-11 | judgment | PASS | carried | carried |

## Evidence

- eval: E1
  run_id: sua-test-do-thu-tu-nap-E1-1788220272
  exit_code: 0
  verifier: config:executors.script.rang_suite_sach
  verified_at: 2026-08-31T23:51:12Z
  output: |
     381 pass
     0 fail
     934 expect() calls
    Ran 381 tests across 35 files. [2.80s]
    rang-suite sach: 381 pass, 0 fail

- eval: E2
  run_id: sua-test-do-thu-tu-nap-E2-1788220280
  exit_code: 0
  verifier: config:executors.script.rang_suite_thu_tu
  verified_at: 2026-08-31T23:51:20Z
  output: |
    -- chieu duong: co preload
     16 pass
     0 fail
    -- chieu do: bo preload di
     15 pass
     1 fail
    rang-suite thu-tu: hai chieu dung, bo preload thi 1 ca do

- eval: E3
  run_id: sua-test-do-thu-tu-nap-E3-1788220288
  exit_code: 0
  verifier: config:executors.script.db_test
  verified_at: 2026-08-31T23:51:28Z
  output: |
    @crm/db db:test: 56 migrations found in prisma/migrations
    @crm/db db:test: No pending migrations to apply.
    @crm/db db:test: Exited with code 0
    (grep for "Neither TEST_DATABASE_URL nor DATABASE_URL is set" returns 0 matches)

- eval: E4
  run_id: sua-test-do-thu-tu-nap-E4-1788220313
  exit_code: 0
  verifier: config:executors.test.api_khong_cache_tru_agent
  verified_at: 2026-08-31T23:51:53Z
  output: |
    @crm/env:test: cache bypass, force executing fa9657ff9495c8ef
    @crm/db:test: cache bypass, force executing 5f2b3c527ce08782
    @crm/auth:test: cache bypass, force executing 9633303d75a9c574
    api:test: cache bypass, force executing b963ac8a075eda68
    app:test: cache bypass, force executing 5a24fefe386d6171
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
  scope_note: |
    Round 2 ran 10 tasks. Round 3 runs 9. The --filter=!agent flag removed
    exactly one task, agent#test. The seven test packages that ran are
    @crm/env, @crm/db, @crm/telemetry, @crm/validation, @crm/auth, api, app.
    The cache was genuinely defeated on every one.

- eval: E5
  run_id: sua-test-do-thu-tu-nap-E5-1788220322
  exit_code: 0
  verifier: config:executors.script.rang_config_doi
  verified_at: 2026-08-31T23:52:02Z
  output: |
    -- chieu duong: config that
    executors sach: khong duong dan tuyet doi, khong so hieu phien ban
    -- chieu do: fixture co duong dan ghi cung
    duong dan ghi cung trong executors: 1
    rang-config doi: hai chieu dung

- eval: E6
  run_id: sua-test-do-thu-tu-nap-E6-1788220329
  exit_code: 0
  verifier: config:executors.script.resolve_plugin
  verified_at: 2026-08-31T23:52:09Z
  output: |
    /Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.5.0
    (verifier check: the path is a real directory and carries scripts/product-map.mjs)

- eval: E7
  run_id: sua-test-do-thu-tu-nap-E7-1788220336
  exit_code: 0
  verifier: config:executors.script.rang_config_o_cam
  verified_at: 2026-08-31T23:52:16Z
  output: |
    -- chieu duong: config that
    ba o cam deu doc ra ten skill
    -- chieu do: fixture bo mot o cam
    o cam trong: feature_loop.ui_standards_skill
    rang-config o-cam: hai chieu dung

- eval: E8
  run_id: sua-test-do-thu-tu-nap-E8-1788220343
  exit_code: 0
  verifier: config:executors.script.rang_t1_chan
  verified_at: 2026-08-31T23:52:23Z
  output: |
        apps/api/src/rang-t1-escape-97022.ts
    ran t1-escape
    pre-merge-check: rules ran=4 declared-off=0 expected=4
    pre-merge-check: 2 violation(s) — merge blocked
    rang-t1-escape chan: cong chan dung

- eval: E9
  run_id: sua-test-do-thu-tu-nap-E9-1788220350
  exit_code: 0
  verifier: config:executors.script.rang_t1_im
  verified_at: 2026-08-31T23:52:30Z
  output: |
    ran gap-probe
    ran t1-escape
    pre-merge-check: rules ran=4 declared-off=0 expected=4
    pre-merge-check: 1 violation(s) — merge blocked
    rang-t1-escape im: luat t1-escape chay va im lang dung
  scope_note: |
    The harness prints the whole-process return code in its own success line and
    marks it outside AC-9's scope. The gate as a whole still blocks this
    repository. That is a different rule and it is carried under Known limits,
    not hidden.

- cmd: mutation test — run the E9 T1-only scenario with --no-t1-escape and check whether the harness assertions fire
  run_id: sua-test-do-thu-tu-nap-SUITE-ac9-mutation-1788220391
  exit_code: 0
  verified_at: 2026-08-31T23:53:11Z
  purpose: prove the AMENDED AC-9 can still fail, rather than trusting the wording
  output: |
    CONTROL: rule enabled  -> ledger line "ran t1-escape"; both assertions satisfied
    MUTANT:  rule disabled -> ledger line "declared-off t1-escape"
             -> assertion 1 fires: the harness prints RANG CUN and returns non-zero
  reading: |
    Turning the t1-escape rule off makes E9 go red. The amended criterion has
    teeth. Without the "ran t1-escape" clause, the silence clause alone would be
    satisfied by a rule that never ran.

- eval: E10
  run_id: sua-test-do-thu-tu-nap-E10-1788220643
  exit_code: 0
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-08-31T23:57:23Z
  cache_note: |
    The turbo cache is defeated deliberately. Round 1 served this task entirely
    from the cache, so no linter ran. The forced command is now a named config
    key, so a reader reproduces it by resolving the key rather than by copying a
    raw command out of this report. The unforced key executors.script.lint still
    exists for the cached path.
  output: |
    @crm/ui:lint: cache bypass, force executing 95c4877f418722ca
    api:lint: cache bypass, force executing 57f53401491cbdf7
    app:lint: cache bypass, force executing c79f9bb82e2076f3
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total

- eval: E11
  run_id: sua-test-do-thu-tu-nap-E11-1788220657
  exit_code: 0
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-08-31T23:57:37Z
  cache_note: |
    The turbo cache is defeated deliberately, so tsc actually executes. The
    forced command is now a named config key. The unforced key
    executors.script.check_types still exists for the cached path.
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
    Not re-run. Checked, not assumed. sha256 of the clean worktree copies at
    b933334 still equals the round-1 values: setup.ts d5f5141cdf840fcb…,
    auth.e2e.spec.ts 952b3249f0759e56… The 8ec3013..b933334 diff touches no file
    outside _acceptance/, and the 83d0b59..b933334 diff for the two judged files
    is still the same 16-line move.
  rationale: The assertion in apps/api/test/auth.e2e.spec.ts is still a strict toEqual on the whole response object with google:true as a hard literal, with no skip, try/catch, toMatchObject or conditional guard around the Google field. The fake credentials moved to apps/api/test/setup.ts are set unconditionally through the fallback helper, so the endpoint must genuinely report Google as configured or the test fails. The fix changed WHEN the variables are set, not how strongly the test asserts.

## Known limits

- AC-4 and AC-9 were amended after round 2 turned them red. The reds were
  resolved by rewording the criteria, not by changing any product code. My
  assessment of that scoping is under `## Analyst`. A Gate-2 reviewer must weigh
  it directly rather than reading the green table alone.
- The `apps/agent` package is now outside E4. The change edits
  `packages/db/scripts/test-db.ts`, which sets up the test database that the
  agent integration tests consume. No eval now covers that consumer. The
  exclusion is defensible but it is not free.
- `apps/agent` `retireExhausted` returned 3 rows for a limit of 2 under
  full-suite load in round 2. It is unfixed and now fully outside the suite.
- No diffBase baseline in any round. Discrimination rests on the in-harness
  negative controls plus this round's AC-9 mutation test, not on an A/B against
  the pre-feature tree.
- `pre-merge-check` still blocks merge on this repository. The record carries
  `status=implemented` with an empty `approved_by`, and this Known limits
  section is not empty, so the per-slug rule holds the gate until a human signs
  at Gate 2. The amended E9 no longer notices this; that is why it is here.

## Ngoài hợp đồng

- `apps/api/test/auth.e2e.spec.ts` computes its own expectation for the
  `microsoft` field from the same environment variables the endpoint reads. That
  assertion cannot fail. It is pre-existing and outside this diff, but it is the
  exact weak-assertion shape AC-11 asks about for `google`.
- `apps/agent/test/tasks.integration.spec.ts:193` asserts `retireExhausted(2)`
  returns at most 2 rows. It returned 3 under full-suite load and never under
  isolation. That points at a real limit or locking defect in `retireExhausted`,
  not only at a noisy test. It is outside this contract.

## Analyst

**Are the two amendments honest scoping or a weakening? My verdict: both are
honest, and AC-9 came out stronger than the clause it replaced.**

AC-4. The test that decides this is whether the new boundary predates the red.
It does. The contract's Out-of-scope section already excluded the flaky
`apps/agent` test in round 1, before E4 ever failed, citing issue
trycompai/crm#195. Old AC-4 contradicted that section by demanding every task
green. The amendment removes the contradiction rather than inventing an escape.
AC-4 keeps teeth: nine tasks, zero cached, all must pass, and it can fail. The
real cost is the coverage gap recorded under Known limits, not dishonesty.

AC-9. The dropped clause was "the process exits 0". That clause never measured
the t1-escape rule — round 2 proved it was satisfied or broken by an unrelated
per-slug rule, so it was noise, not signal. The added clause is "the rule ran".
That is an anti-vacuity guard, and it is the difference between a criterion and
a criterion with no teeth: without it, "no VIOLATION [PR] line" is satisfied by
a rule that never executed. I did not take this on the wording. I mutation-tested
it: with `--no-t1-escape` the ledger reads `declared-off` and the eval goes red.

E8 and E9 together now form a proper discrimination table — non-T1 diff with the
rule on gives a violation, T1-only diff with the rule on gives silence, T1-only
diff with the rule off gives a red eval. That is a stronger instrument than
round 2's, which could not tell those cases apart from an unrelated rule firing.

Non-discriminating evals: no diffBase baseline ran, so none is declared
green-on-both by measurement. Six evals carry their own negative control and are
self-discriminating: E2, E5, E7, E8, E9, and this round's AC-9 mutation. E1, E3,
E4, E6, E10 and E11 are plain green-path checks.

## Variance

none — no eval declares runs > 1. E4 varied in round 2 and was flaky; the
package that caused it is excluded from E4 as of this round, so the eval is
deterministic now over a smaller scope. The underlying flakiness is unfixed and
is carried under Known limits.

## Iterations

Round 1: every machine eval green on an uncommitted tree. E12 PASS. The report
had a dirty-tree caveat, no real pin, and lint plus check-types served from the
turbo cache.
Round 2: committed at 8ec3013, tree clean, pin real. Lint and check-types re-run
cache-defeated and genuinely executed. The VIOLATION [PR] line captured verbatim.
E4 red on the flaky agent test; E9 red because an unrelated gate rule fired on
this record's own unsigned state. Verdict REJECT.
Round 3: committed at b933334. AC-4 amended to exclude the agent package by
name; AC-9 amended to name the t1-escape rule and to require that the rule ran.
No product code changed. All eleven machine evals green, E12 carried on
byte-identical inputs. The amended AC-9 mutation-tested and confirmed able to
fail. Verdict PASS, subject to the Known limits above.
Round 3, provenance repair: the write-time hook BLOCKED the Gate-2 signature.
L2 SUBSTANCE rejected the E10 and E11 verifier fields, because round 2 had put
the raw forced command there instead of a config key or a script path. The
defect was provenance, not dishonesty — the deviation was disclosed in both
blocks — but it left two verifiers a reader could not reproduce from the record.
The two forced commands became named config keys, and E10 and E11 were re-run
under those keys. Both stayed green with the cache defeated. No other eval was
re-run, no verdict changed, and the bypass was not used.
