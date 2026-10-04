---
schema_version: 2
feature_slug: luoi-day-do-that
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3f3c60fe85ce0734a0f149a37c6c24dd52b98a74
human_signoff: Manh Phan 2026-09-01
---

# Evidence Report: luoi-day-do-that

Verified at `59b6515`. `git status --porcelain` reports one untracked path,
`_acceptance/luoi-day-do-that/run-log.jsonl`, which this round appends. The tree
was clean before the harness attacks below and clean after each one.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: luoi-day-do-that-E1-1788234129
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hook_ep_chay
  verified_at: 2026-09-01T03:42:09Z
  output: |
      Cached:    0 cached, 13 total
      Cached:    0 cached, 9 total
      Cached:    0 cached, 10 total
    rang-hook ep-chay: du 4 tac vu duoc goi, 3 tac vu qua bo dung deu 0 doc tu dem

- eval: E2
  run_id: luoi-day-do-that-E2-1788234136
  exit_code: 0
  baseline: green
  verifier: config:executors.script.rang_hook_con_rang
  verified_at: 2026-09-01T03:42:16Z
  output: |
    rang-hook con-rang: mot bai kiem that do thi luoi day chan va goi dung ten
    tac vu, ma thoat khac 0

- eval: E3
  run_id: luoi-day-do-that-E3-1788234152
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hook_loi_thoat
  verified_at: 2026-09-01T03:42:32Z
  output: |
    rang-hook loi-thoat: CRM_SKIP_HOOKS ra ngay, khong chay tac vu nao, 0 giay

- eval: E4
  run_id: luoi-day-do-that-E4-1788234152
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hook_tro_dung
  verified_at: 2026-09-01T03:42:32Z
  output: |
    rang-hook tro-dung: ho so da ky tro toi chan 'o-cam-duong', va chan do chay that

- eval: E5
  run_id: luoi-day-do-that-E5-1788234152
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-01T03:42:32Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    213ms

- eval: E6
  run_id: luoi-day-do-that-E6-1788234158
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-01T03:42:38Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    5.645s

- eval: E7
  run_id: luoi-day-do-that-E7-1788234152
  exit_code: 0
  baseline: green
  verifier: config:executors.script.rang_hook_canary_slop
  verified_at: 2026-09-01T03:42:32Z
  output: |
    rang-hook canary-slop: tac vu soi-ma-thua DOC that cay hien tai va chan dung
    luot day nay

## Known limits

1. **The gate can still look green while checks do not run, and the route is the
   task graph.** Every leg measures the NUMBER of build summaries and the cached
   count inside them. No leg measures how much each summary covers. Verifier attack
   on this tree: change the root `test` script to
   `turbo run test --concurrency=1 --filter=@crm/env`, so nine of the ten test
   packages leave the gate. E1 stays green and prints `Cached: 0 cached, 1 total`.
   E2 stays green, because its plant lives in the one package still in scope. E7
   stays green, because the slop linter is untouched. Nine packages go unchecked and
   the whole record reports green. The same shape covers a package that quietly
   loses its `test`, `lint`, or `check-types` script.
   The fix is one line: assert the totals, not only the count of summaries.
2. **Nothing proves the gate is wired in.** The record proves the gate works when
   it is invoked. `core.hooksPath` is what invokes it, and it is set by the
   `prepare` script, so a clone where install has not run, a developer who points
   `core.hooksPath` elsewhere, or a client that ignores it, pushes green with
   nothing run at all. No eval and no criterion mentions `core.hooksPath`.
3. The canary leg is order-dependent. It names the slop task only because the two
   tasks ahead of it pass first. If a plant ever broke type checking, the leg would
   stop for a different reason. It says so in its own message, so this is a
   readability limit, not a false green.
4. E7 is green on the pre-feature tree. It does not discriminate this feature; it
   discriminates the round-2 attack, which is what it was built for. Verified by
   running it against the hook from `f4b2ea9`.
5. The usage line at the top of the harness still lists four legs and omits
   `canary-slop`. A wrong argument prints an incomplete menu.

## Ngoài hợp đồng

1. The gate exits early when nothing arrives on stdin, because `deleting_only`
   keeps its initial value. A real push always supplies refs. No criterion covers it.
2. `--no-verify` remains the documented way past the gate, and the gate advertises
   it. That is intended.
3. Two commits carrying a co-author trailer remain. The contract puts them outside
   this round.

## Analyst

Round-2 attack replayed verbatim on this tree. The loop line stayed byte-identical
and the body became `[ "$task" = "lint:slop" ] || bun run "$task" || fail "$task"`.
E1 stayed green exactly as before, and E7 stopped the round with
`RANG CUN: cai mot vi pham soi-ma-thua ma luoi van cho di`. The hole is closed by
effect, not by announcement.

Residue attack replayed against both sweepers. A plant left in
`packages/env/test` and one left in `packages/env/src`, simulating two hard-killed
runs, are both swept on the next harness start, by content and at any age, and E1
then passes on the cleaned tree. The residue window that used to last an hour is
gone. What remains is that the sweep runs only when the harness runs: between a
hard kill and the next harness start, a real push still stops.

E1, E3 and E4 discriminate. Probes on this tree: the hook with the force variable
removed runs green twice, and the second run reports `13 cached, 13 total`,
`9 cached, 9 total`, `10 cached, 10 total` and `FULL TURBO` in about 24ms; the
pre-feature hook from `f4b2ea9` makes E3 stop, because the escape was silent there;
`git show f4b2ea9` shows the signed record named the composite alias E4 rejects.

E2, E5, E6 and E7 are green on the pre-feature tree. E5 and E6 never read the hook.
E2 and E7 guard behaviour that predates this round; both still earn their place,
because E2 is the only eval proving a real failure propagates out of the build tool
and E7 is the only eval proving the fourth task reads the current tree.

## Variance

none — every eval is deterministic and ran once.

## Iterations

Round 1: all seven machine evals green at `59b6515`. Every round-2 finding is
closed and was re-attacked here rather than read. Two coverage gaps survive, both
listed under Known limits, neither of them a failing eval.

### Re-pin lần 1 — 07/09, do vòng sửa `thuoc-cache-het-doi-tuong` chạm hai file cấu hình turbo

run_id: repin-20260907T005455Z-44758
sha: f8aa7f4a9e1ec9ce1be8585683103adf1a901431 · suites: 4 lệnh exit 0

### Re-pin lần 2 — 2026-09-09, do ba hồ sơ neo vào hình dạng cổng, vá xong mỏ neo và bộ đọc
run_id: repin-20260909T003118Z-32102
sha: 580ef79ac789b0966befa17df3a2642f6f980db5 · suites: 5 lệnh exit 0 · evals: 7 eval máy exit 0

### Re-pin lần 3 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T053254Z-97828
sha: 3f3c60fe85ce0734a0f149a37c6c24dd52b98a74 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng
