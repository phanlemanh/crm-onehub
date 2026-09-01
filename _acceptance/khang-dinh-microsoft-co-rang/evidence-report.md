---
schema_version: 2
feature_slug: khang-dinh-microsoft-co-rang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3023055f8883be0710cc4b27f4497e91b07e4f18
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

Tree state: clean at the pinned commit. The only file outside version control is
this round's `run-log.jsonl`, inside `_acceptance/`.

One run backs two evals. E1 and E3 bind to the same resolved command
(`executors.script.rang_microsoft_duong`). The command ran once. E1 rests on the
harness line that declares both Microsoft keys from outside the process and on
the `0 fail` summary line. E3 rests on the `5 pass` and `0 fail` summary lines.
Both run ids point at that single run.

## Evidence

- eval: E1
  run_id: khang-dinh-microsoft-co-rang-E1-1788228575
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_duong
  verified_at: 2026-09-01T02:09:36Z
  output: |
    5 pass
    0 fail
    rang-microsoft duong: khong khai khoa Microsoft thi may chu bao khong co, bai kiem xanh
    (the harness runs `env -i` and then declares MICROSOFT_CLIENT_ID and
    MICROSOFT_CLIENT_SECRET from outside; the preload strips both)

- eval: E2
  run_id: khang-dinh-microsoft-co-rang-E2-1788228568
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_hinh_thuc
  verified_at: 2026-09-01T02:09:28Z
  output: |
    rang-microsoft hinh-thuc: ky vong la hang so, khong doc moi truong
    (zero `process.env` reads in apps/api/test/auth.e2e.spec.ts;
    the literal `microsoft: false` is present)

- eval: E3
  run_id: khang-dinh-microsoft-co-rang-E3-1788228575
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_duong
  verified_at: 2026-09-01T02:09:36Z
  output: |
    5 pass
    0 fail
    rang-microsoft duong: khong khai khoa Microsoft thi may chu bao khong co, bai kiem xanh

- eval: E4
  run_id: khang-dinh-microsoft-co-rang-E4-1788228584
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_do
  verified_at: 2026-09-01T02:09:45Z
  output: |
    4 pass
    1 fail
    rang-microsoft do: khai khoa Microsoft thi DUNG MOT bai do, va do la bai dang nhap
    (the script asserts the red count is exactly one and names the sign-in case)

- eval: E5
  run_id: khang-dinh-microsoft-co-rang-E5-1788228623
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_suite_sach
  verified_at: 2026-09-01T02:10:25Z
  output: |
    381 pass
    0 fail
    934 expect() calls
    Ran 381 tests across 35 files.
    rang-suite sach: 381 pass, 0 fail

- eval: E6
  run_id: khang-dinh-microsoft-co-rang-E6-1788228632
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-01T02:10:33Z
  output: |
    Checked 228 files in 153ms. No fixes applied.
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total

- eval: E7
  run_id: khang-dinh-microsoft-co-rang-E7-1788228640
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-01T02:10:47Z
  output: |
    api:check-types: cache bypass, force executing
    api:check-types: $ tsc --noEmit
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total

## Known limits

1. The preload strips the two Microsoft keys from the process environment only.
   It does not stop the root `.env` from putting them back. `apps/api/test/setup.ts`
   deletes both keys. Later `packages/auth/src/env.ts` imports `@crm/env/load`,
   which calls `loadRootEnv()`. That function writes any key whose value is
   undefined. A deleted key is undefined. A direct probe confirms the sequence:
   after the delete the key reads absent, and after `loadRootEnv()` it reads the
   `.env` value. Today both lines are commented out in the root `.env`, so the
   green holds. A developer who uncomments them, or who adds them to `.env.local`,
   turns the sign-in case red. AC-1 says the keys must go "whether or not the
   machine declares them". That holds for shell declarations. It does not hold for
   `.env` file declarations.
2. The red channel uses `preload-mutant.ts`, which is not a minimal mutation of
   `apps/api/test/setup.ts`. It drops the two `clear()` calls, and it also drops
   the `afterAll` database disconnect. The second difference leaks a database
   connection. It does not change the red count, and the script pins the red count
   at one and names the sign-in case, so the conclusion holds.
3. No eval observes the environment directly. Nothing prints the value of
   MICROSOFT_CLIENT_ID after the preload runs. AC-1 is measured through a
   downstream assertion. E1 green plus E4 red together make the inference sound,
   but a single eval that reads the variable after the preload would measure AC-1
   on its own.
4. No baseline ran this round. Every eval carries `baseline: n-a`.

## Ngoài hợp đồng

1. `packages/env/src/index.ts` merges `.env` and `.env.local` and fills every
   undefined key. Any future test preload that deletes a variable meets the same
   hole as limit 1. The contract scopes this round to one assertion in one file,
   so no wider sweep ran.
2. The `apps/agent` suite stays outside this round, as the contract states.

## Analyst

Baseline did not run this round, so no eval is confirmed non-discriminating by
measurement. E4 is discriminating by construction: it runs the same test file
with one changed preload and requires the sign-in case to turn red. E1 and E4
form a two-point measurement of one mapping. E5, E6 and E7 are regression guards
and are expected to stay green regardless of this change.

## Variance

none — every eval is deterministic and ran once.

## Iterations

Round 1: every eval green. No return to implementation.
