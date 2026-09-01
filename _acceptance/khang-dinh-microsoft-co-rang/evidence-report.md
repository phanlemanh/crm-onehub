---
schema_version: 2
feature_slug: khang-dinh-microsoft-co-rang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bcb7bb81103af72b083312101a1594dfe0156bc6
human_signoff:
---

# Evidence Report: khang-dinh-microsoft-co-rang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-1 | script | PASS |
| E9 | AC-7 | script | PASS |

Tree state: clean at the pinned commit. The only file outside version control is
this round's `run-log.jsonl`, inside `_acceptance/`.

Two commands each back two evals. `rang_microsoft_duong` ran once and backs E1
and E3. `rang_microsoft_do` ran once and backs E4 and E9. Each pair reads a
different fact from the one run. E1 reads the summary line under keys declared in
the shell. E3 reads the pass count. E9 reads the line-count guard on the derived
mutant. E4 reads the red count and the name of the red case.

## Evidence

- eval: E1
  run_id: khang-dinh-microsoft-co-rang-E1-1788229123
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_duong
  verified_at: 2026-09-01T02:18:44Z
  output: |
    5 pass
    0 fail
    rang-microsoft duong: khoa Microsoft dat tu shell van bi lam rong, may chu bao khong co, bai kiem xanh
    (the harness runs `env -i`, then declares both keys in the shell; the real
    preload blanks them and the auth config reads not-configured)

- eval: E2
  run_id: khang-dinh-microsoft-co-rang-E2-1788229123
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_hinh_thuc
  verified_at: 2026-09-01T02:18:43Z
  output: |
    rang-microsoft hinh-thuc: ky vong la hang so, khong doc moi truong
    (zero `process.env` reads in apps/api/test/auth.e2e.spec.ts;
    the literal `microsoft: false` is present)

- eval: E3
  run_id: khang-dinh-microsoft-co-rang-E3-1788229123
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_duong
  verified_at: 2026-09-01T02:18:44Z
  output: |
    5 pass
    0 fail
    rang-microsoft duong: khoa Microsoft dat tu shell van bi lam rong, may chu bao khong co, bai kiem xanh

- eval: E4
  run_id: khang-dinh-microsoft-co-rang-E4-1788229124
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_do
  verified_at: 2026-09-01T02:18:45Z
  output: |
    4 pass
    1 fail
    rang-microsoft do: dot bien toi thieu tu chinh bo nap truoc lam DUNG MOT bai do, va do la bai dang nhap
    (the script pins the red count at one and greps the name of the red case)

- eval: E5
  run_id: khang-dinh-microsoft-co-rang-E5-1788229139
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_suite_sach
  verified_at: 2026-09-01T02:19:02Z
  output: |
    381 pass
    0 fail
    934 expect() calls
    Ran 381 tests across 35 files.
    rang-suite sach: 381 pass, 0 fail

- eval: E6
  run_id: khang-dinh-microsoft-co-rang-E6-1788229142
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-01T02:19:03Z
  output: |
    api:lint: Found 4 warnings.
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total

- eval: E7
  run_id: khang-dinh-microsoft-co-rang-E7-1788229143
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-01T02:19:09Z
  output: |
    api:check-types: $ tsc --noEmit
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total

- eval: E8
  run_id: khang-dinh-microsoft-co-rang-E8-1788229125
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_nguon_env
  verified_at: 2026-09-01T02:18:45Z
  output: |
    sentinel|""|undefined
    xoa|"tu-file-env"
    rang-microsoft nguon-env: dat rong song qua bo nap, cach xoa thi bi .env goc dien lai
    (leg one: the blank sentinel survives the real loadRootEnv and reads as absent.
    leg two: the delete approach is refilled from the fixture .env — the leg
    therefore measures a difference, not a constant)

- eval: E9
  run_id: khang-dinh-microsoft-co-rang-E9-1788229124
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_do
  verified_at: 2026-09-01T02:18:45Z
  output: |
    rang-microsoft do: dot bien toi thieu tu chinh bo nap truoc lam DUNG MOT bai do, va do la bai dang nhap
    (the harness derives the mutant from apps/api/test/setup.ts by substitution,
    counts the diff, and stops unless exactly two lines differ)

## Known limits

1. E8 does not execute the real preload. It imports the real `loadRootEnv` from
   `packages/env/src/index.ts`, but it writes the blank sentinel by hand and it
   carries its own copy of `optional()` rather than importing the auth module. So
   E8 proves the mechanism in principle. It does not bind that mechanism to
   `apps/api/test/setup.ts`. A preload that reverted to `delete` would leave E8
   green. E1 covers the missing link for the shell source, through the real
   preload and the real auth module. No eval covers it for the `.env` source.
   The verifier closed that gap by hand this round: a throwaway workspace whose
   `.env` declares both keys, the real preload, and the real
   `isMicrosoftConfigured()`. With the blank sentinel the assertion reads
   not-configured. With a delete-based copy of the same preload the assertion
   reads configured. The gap is in the eval set, not in the product.
2. Two commands each back two evals — `rang_microsoft_duong` for E1 and E3,
   `rang_microsoft_do` for E4 and E9. Each pair reads a different fact from one
   run, so the coupling is defensible, but a re-run for a second criterion would
   be stronger.
3. No baseline ran in either round. Every eval carries `baseline: n-a`.
4. The red leg writes its derived mutant into `apps/api/test/` and removes it in
   an exit trap. A hard kill leaves the file in the source tree. The name does not
   match the test-discovery pattern, so a stray file does not join a suite run.

## Ngoài hợp đồng

1. `loadRootEnv()` in `packages/env/src/index.ts` fills every key whose value is
   `undefined`. Any other preload in the repository that deletes a variable meets
   the same hole. The contract scopes this round to one assertion in one file, so
   no repository-wide sweep ran.
2. The `apps/agent` suite stays outside this round, as the contract states.

## Analyst

Baseline did not run, so no eval is confirmed non-discriminating by measurement.
Three evals are discriminating by construction. E4 and E9 run the same test file
with one derived preload and require the sign-in case to turn red. E8 runs both
mechanisms against the same fixture `.env` and requires them to differ. E1 and E4
together form a two-point measurement of one mapping. E5, E6 and E7 are
regression guards and are expected to stay green regardless of this change.

The AC-1 rewrite was examined for criterion-fitting, because a criterion rewritten
after a finding is the shape that hides it. It is not fitted. The old text
promised a mechanism — the variables leave the environment — that is now false by
design, since the variables stay and hold an empty string. The new text promises
an outcome, and it names the `.env` source that the old text never covered, so the
Given is broader. The pre-fix code fails the new criterion: with `delete`, a root
`.env` that declares the keys makes the auth config read configured. A criterion
that the old code fails is a real criterion.

## Variance

none — every eval is deterministic and ran once per round.

## Iterations

Round 1: every eval green at commit 3023055. The verifier reported a hole the
evals did not cover: the preload deleted the two keys, and `loadRootEnv()` refills
any key that is `undefined`, so a root `.env` declaring the keys undid the delete.
AC-1 as written was a false promise. Round 2: the preload assigns an empty string,
AC-1 is rewritten as an outcome claim naming both sources, AC-7 and the E8 and E9
legs are added, and every eval is green at commit bcb7bb8.
