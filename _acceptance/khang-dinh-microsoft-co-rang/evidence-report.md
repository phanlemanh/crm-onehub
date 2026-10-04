---
schema_version: 2
feature_slug: khang-dinh-microsoft-co-rang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ef22d521135d81f1598ec28123f76aa07c60be54
human_signoff: Manh Phan 2026-09-01
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
`run-log.jsonl`, inside `_acceptance/`. The harness left no fixture file and no
mutant file behind after the graded runs.

Two commands each back two evals. `rang_microsoft_duong` ran once and backs E1
and E3. `rang_microsoft_do` ran once and backs E4 and E9. Each pair reads a
different fact from the one run.

## Evidence

- eval: E1
  run_id: khang-dinh-microsoft-co-rang-E1-1788229485
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_duong
  verified_at: 2026-09-01T02:24:45Z
  output: |
    5 pass
    0 fail
    rang-microsoft duong: khoa Microsoft dat tu shell van bi lam rong, may chu bao khong co, bai kiem xanh

- eval: E2
  run_id: khang-dinh-microsoft-co-rang-E2-1788229484
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_hinh_thuc
  verified_at: 2026-09-01T02:24:45Z
  output: |
    rang-microsoft hinh-thuc: ky vong la hang so, khong doc moi truong

- eval: E3
  run_id: khang-dinh-microsoft-co-rang-E3-1788229485
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_duong
  verified_at: 2026-09-01T02:24:45Z
  output: |
    5 pass
    0 fail
    rang-microsoft duong: khoa Microsoft dat tu shell van bi lam rong, may chu bao khong co, bai kiem xanh

- eval: E4
  run_id: khang-dinh-microsoft-co-rang-E4-1788229485
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_do
  verified_at: 2026-09-01T02:24:46Z
  output: |
    4 pass
    1 fail
    rang-microsoft do: dot bien toi thieu tu chinh bo nap truoc lam DUNG MOT bai do, va do la bai dang nhap

- eval: E5
  run_id: khang-dinh-microsoft-co-rang-E5-1788229499
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_suite_sach
  verified_at: 2026-09-01T02:25:01Z
  output: |
    381 pass
    0 fail
    934 expect() calls
    Ran 381 tests across 35 files.
    rang-suite sach: 381 pass, 0 fail

- eval: E6
  run_id: khang-dinh-microsoft-co-rang-E6-1788229501
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-01T02:25:02Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total

- eval: E7
  run_id: khang-dinh-microsoft-co-rang-E7-1788229502
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-01T02:25:08Z
  output: |
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total

- eval: E8
  run_id: khang-dinh-microsoft-co-rang-E8-1788229486
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_nguon_env
  verified_at: 2026-09-01T02:24:47Z
  output: |
    -- chieu duong: bo nap truoc THAT, .env goc CO khai hai khoa
    5 pass
    0 fail
    -- chieu do: cung fixture, nhung bo nap truoc quay ve cach XOA
    4 pass
    1 fail
    rang-microsoft nguon-env: qua BO NAP THAT — dat rong song qua .env goc, cach xoa thi do dung bai dang nhap
    (no hand-written mechanism remains in this leg; both directions run the real
    preload and the real sign-in spec against a real root fixture file)

- eval: E9
  run_id: khang-dinh-microsoft-co-rang-E9-1788229485
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_microsoft_do
  verified_at: 2026-09-01T02:24:46Z
  output: |
    rang-microsoft do: dot bien toi thieu tu chinh bo nap truoc lam DUNG MOT bai do, va do la bai dang nhap
    (the harness derives the mutant from apps/api/test/setup.ts, counts the diff,
    and stops unless exactly two lines differ)

## Known limits

1. The clobber guard misses a symlink whose target does not exist. The harness
   tests `[ -e "$ENVLOCAL" ]`, which is false for a dangling symlink. The verifier
   reproduced the consequence in an isolated directory: the write follows the
   link and creates the target file. Cleanup then removes the link and leaves the
   written target. The stated property is that the harness can never overwrite the
   owner's file. That property has this one exception.
   Fix: test `[ -e "$ENVLOCAL" ] || [ -L "$ENVLOCAL" ]`.
2. A hard kill leaves the fixture file in the repository root. The verifier tested
   this on the real harness: it polled for the file, sent SIGKILL to the process
   group, and the file remained with the fixture content. An exit trap does not
   run on SIGKILL. The harness sweeps stray mutant files before it starts. It has
   no equivalent sweep for its own fixture file.
   Measured blast radius: the test legs are not affected, because the blank
   sentinel holds against a declaring file — the positive leg stayed green with a
   stale fixture in place, and the `nguon-env` leg refused to start, which is the
   safe direction. A process with no preload does read the stale values: the
   verifier measured `isMicrosoftConfigured()` reading configured. So a leftover
   misconfigures the developer's own application until they notice it. The file is
   ignored by git, so `git status` does not show it and the gate's staleness check
   cannot see it.
   Fix: sweep the fixture file at start when its content matches the fixture
   exactly, the same way mutant files are swept.
3. The mutant sweep is not scoped to the running process. The verifier placed a
   decoy mutant file and ran an unrelated channel; the decoy was deleted. Two
   graded runs in parallel therefore delete each other's mutant.
   Fix: scope the sweep by age, or run the legs strictly in sequence.
4. Two commands each back two evals — `rang_microsoft_duong` for E1 and E3,
   `rang_microsoft_do` for E4 and E9. Each pair reads a different fact from one
   run, so the coupling is defensible. A re-run per criterion would be stronger.
5. No baseline ran in any round. Every eval carries `baseline: n-a`. No eval is
   confirmed discriminating by measurement against the pre-feature tree.
6. Design objection, recorded for the human even though the evidence is green: the
   `nguon-env` leg writes a real file into the real repository root during a graded
   run. The verifier judges the write defensible, because no weaker fixture reaches
   the real loader — `loadRootEnv()` resolves its root from the working directory
   and reads only `.env` and `.env.local` there, so a synthetic fixture cannot
   exercise the real preload. The write buys the measurement that round 2 could not
   make. Two cleaner designs exist. A throwaway git worktree moves the write out of
   the working tree, at the cost of installing dependencies there. An explicit root
   override in the loader removes the write entirely, at the cost of widening
   product code to serve a harness. The verifier does not block on this. The human
   should decide whether a graded measure may write into the tree it grades.

## Ngoài hợp đồng

1. `loadRootEnv()` in `packages/env/src/index.ts` fills every key whose value is
   `undefined`. Any other preload in the repository that deletes a variable meets
   the same hole. The contract puts a repository-wide sweep out of scope.
2. The `apps/agent` suite stays outside this round, as the contract states.

## Analyst

Baseline did not run, so no eval is confirmed non-discriminating by measurement.
Four evals are discriminating by construction. E4 and E9 run the sign-in spec with
a derived preload and require exactly one red case. E8 runs the real preload twice
against the same root fixture — once as shipped, once mutated back to the old
mechanism — and requires green then exactly one red. E1 and E8 together cover both
sources named in AC-1: the shell and the root file. E5, E6 and E7 are regression
guards and are expected to stay green regardless of this change.

The round-2 objection to E8 is closed. E8 no longer assigns the sentinel itself and
no longer carries its own copy of the auth reader. Both directions now run
`apps/api/test/setup.ts` and `apps/api/test/auth.e2e.spec.ts` unmodified except for
the one-line mutation under test. A revert of the preload to the old mechanism now
turns E8 red, which was the exact property the round-2 version lacked.

## Variance

none — every eval is deterministic and ran once per round.

## Iterations

Round 1: every eval green at commit 3023055, but the verifier found a hole the
evals did not cover — the preload deleted the two keys, and `loadRootEnv()` refills
any key that is `undefined`, so a root file declaring the keys undid the delete.
AC-1 as written was a false promise. Round 2: the preload assigns an empty string,
AC-1 is rewritten as an outcome claim naming both sources, AC-7 and the E8 and E9
legs are added, every eval green at commit bcb7bb8 — but E8 measured a replica of
the mechanism rather than the real preload, so the verifier closed that link by
hand. Round 3: the E8 leg runs the real preload and the real spec against a real
root fixture in both directions, every eval green at commit 73c2b31, and the
verifier tested the three safety properties of the new leg and reports three
defects in them under Known limits.

### Re-pin lần 1 — 2026-09-06, do PR #6 sửa một dòng `rang-*.sh` của hồ sơ này (ưu tiên TEST_DATABASE_URL từ môi trường)
run_id: repin-lane-6-20260906T084038Z
sha: 6f581bbf35c8a205959db40a00093d24fedb4ea3 · suites: 4 lệnh exit 0

Làn máy chạy trên cây #6 đã gộp `onehub`, bằng bộ chạy mới một-lượt-một-DB. Lượt đầu bị bác vì
turbo phát lại log từ đệm (9/9 task kiểm cache hit); sửa `turbo.json` cho task `test` không đệm,
chạy lại: 9/9 task kiểm chạy thật, 1330 bài, 0 trượt. Chữ ký người không đụng.

### Re-pin lần 2 — 07/09, do vòng sửa `thuoc-cache-het-doi-tuong` chạm hai file cấu hình turbo

run_id: repin-20260907T005455Z-44758
sha: f8aa7f4a9e1ec9ce1be8585683103adf1a901431 · suites: 4 lệnh exit 0

### Re-pin lần 3 — 2026-09-16, do Chiến dịch ghim lại theo mốc kit 2.14.0 — sáu hồ sơ làn xanh; năm hồ sơ còn lại đỏ vì nguyên nhân thật, đi lượt riêng
run_id: repin-20260916T014000Z-73664
sha: 96ec6d9b0447bb8e3eafaf36c84dc9902372ebef · suites: 4 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng

### Re-pin lần 4 — 2026-09-17, do chiến dịch ghim lại kit 2.14.0 (PR #47): làn eval thật trên cây đã chuyển đường ghi tạo phẩm; đo bằng phanlemanh@gmail.com
run_id: repin-20260917T051527Z-61120
sha: ed70d70dd0ec9ee7412b45e63c90c925500d50c6 · suites: 4 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng

### Re-pin lần 5 — 2026-10-04, do khai paths lô 1 (kit 2.21.0): chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T020617Z-28918
sha: bc36c2d575122deb12067a7da028614abef51f82 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng

### Re-pin lần 6 — 2026-10-04, do gộp onehub (#240) sau khi khai paths lô 1
run_id: repin-20261004T024314Z-40086
sha: ef22d521135d81f1598ec28123f76aa07c60be54 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng
