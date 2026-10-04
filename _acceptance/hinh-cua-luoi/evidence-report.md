---
schema_version: 2
feature_slug: hinh-cua-luoi
verdict: PASS
failed_evals: []
reason:
verified_by: same-context implementation run
enforcement_mode: strict
bypass_used: false
verified_commit: 3f3c60fe85ce0734a0f149a37c6c24dd52b98a74
human_signoff: Manh Phan 2026-09-01
---

# Evidence Report: hinh-cua-luoi

Verified on the tree of commit `2ac1ab0`, which carries this round's change,
rebased onto `ccd9ce6`. Every eval below ran against that tree after it was
committed, so the evidence pins the code it certifies. The tree was clean before
every attack below and clean after each one.

**The rebase is itself evidence.** `ccd9ce6` brought four source files this round
never saw. The gate's own report went from `752 files` to `756 files` with no edit
to `gate-shape.json`. The bar rose by itself, which is the property the round was
built for.

The first pass of this report pinned `verified_commit` to the PARENT commit — the
tree the change was written against, not the tree the change produces.
`scripts/pre-merge-check.sh` caught it and blocked the merge with `evidence is
stale — code changed after verify`. It was right. The evals were re-run against
the real tree rather than the pin being edited to match, and re-run again after
the rebase moved that tree.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-1 | script | PASS |

## What changed

The gate no longer only runs checks. It publishes what it covered, and it
compares that to a declaration before it lets the push through.

- `.githooks/gate-shape.json` is the declaration. It names four checkers and,
  per checker, the packages **exempt** from it, each with a written reason. It
  names no package that is covered. The covered set is derived at run time.
- `scripts/verify-gate-shape.mjs` builds the expected set from the tree — every
  directory under `apps/` and `packages/` holding a `package.json`, minus the
  exemptions — and compares it to the ledger the build tool wrote.
- `.githooks/pre-push` sets `TURBO_RUN_SUMMARY=true`, tees each task's output,
  and runs the verifier last. The push fails when the shapes differ.
- `package.json` runs the slop linter as `oxlint --format=default`, so it reports
  the file and rule count it read. The bare `oxlint` printed nothing on success,
  so that checker published no coverage at all.

The ledger is the build tool's own run summary. It records every `package#task`
it executed, its cache status and its exit code. It is what the tool **did**, not
what the gate announced. An echoed line cannot produce a ledger row.

## Evidence

- eval: E1
  run_id: hinh-cua-luoi-E1-1788256160
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hinh_hinh
  verified_at: 2026-09-01T09:49:20Z
  output: |
    pre-push: gate matches its shape across 10 packages
      exempt: @crm/typescript-config from 'check-types' — Ships tsconfig JSON only.
      check-types: 9/9 packages ran fresh
      lint: 9/9 packages ran fresh
      exempt: @crm/ui from 'test' — No test script today. This is a known gap.
      test: 8/8 packages ran fresh
      lint:slop: 756 files, 9 rules
    rang-hinh hinh: luoi tu doi chieu voi ban khai, phu het 10 goi, khong goi nao doc dem

- eval: E2
  run_id: hinh-cua-luoi-E2-1788256197
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hinh_tan_cong
  verified_at: 2026-09-01T09:49:57Z
  output: |
    don 'rut tac vu test khoi vong lap' -> luoi do, ma thoat 1
      - checker 'test' left no run summary, so nothing proves it ran at all
    don 'bo qua lint:slop trong than vong lap' -> luoi do, ma thoat 1
      - checker 'lint:slop' reported no coverage line, so nothing proves it read this tree
    don 'thu hep kich ban test bang --filter' -> luoi do, ma thoat 1
      - 'test' never reached @crm/auth — the gate covered 1 of the 8 packages that need it
      - 'test' never reached @crm/db — the gate covered 1 of the 8 packages that need it
    don 'hook chua duoc cai' -> chan noi-day do
      KHONG NOI DAY: git se goi '<tmp>/chua-cai/.git/hooks/pre-push', ma tep do khong ton tai.
        Moi lan day deu xanh voi khong gi duoc chay. Chay 'bun install' de dat core.hooksPath.
    rang-hinh tan-cong: bon don cua bo hoi quy deu lam do MOT phep doi chieu duy nhat

- eval: E3
  run_id: hinh-cua-luoi-E3-1788256271
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hinh_bo_sot
  verified_at: 2026-09-01T09:51:11Z
  output: |
    goi bo kich ban 'test' -> luoi do, ma thoat 1
      - packages/env declares no 'test' script and no exemption — add the script,
        or add @crm/env to exempt in gate-shape.json with a reason
    them goi khong co kich ban nao -> luoi do, ma thoat 1
      - packages/rang-goi-moi declares no 'check-types' script and no exemption
      - packages/rang-goi-moi declares no 'lint' script and no exemption
      - packages/rang-goi-moi declares no 'test' script and no exemption
    them mot GOC lam viec moi -> luoi do, ma thoat 1
      - rang-goc-moi/rang-goi-la declares no 'check-types' script and no exemption
    rang-hinh bo-sot: ban khai chi ke ngoai le, nen bot viec kiem, them goi khong
    kiem gi, hay them ca mot goc moi — deu la cho lech

- eval: E4
  run_id: hinh-cua-luoi-E4-1788256271
  exit_code: 0
  baseline: green
  verifier: config:executors.script.rang_hinh_noi_day
  verified_at: 2026-09-01T09:51:11Z
  output: |
    noi day dung: git goi '<tmp>/da-cai/.githooks/pre-push', trung nguyen byte voi luoi cua cay
    rang-hinh noi-day: cong thuc 'git config core.hooksPath .githooks' lam git goi dung luoi cua cay

- eval: E5
  run_id: hinh-cua-luoi-E5-1788256271
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hinh_noi_day_am
  verified_at: 2026-09-01T09:51:11Z
  output: |
    KHONG NOI DAY: git se goi '<tmp>/chua-cai/.git/hooks/pre-push', ma tep do khong ton tai.
      Moi lan day deu xanh voi khong gi duoc chay. Chay 'bun install' de dat core.hooksPath.
    rang-hinh noi-day-am: kho chua cai lam chan noi-day do va goi ten tep hook trong

- eval: E6
  run_id: hinh-cua-luoi-E6-1788256271
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hinh_noi_day_lech
  verified_at: 2026-09-01T09:51:11Z
  output: |
    LUOI LECH: git se goi '<tmp>/khac/pre-push',
      nhung luoi cua cay nay la '<tmp>/lech/.githooks/pre-push'. Hai tep khac nhau.
      Luoi ban dang sua KHONG phai luoi se chay.
    rang-hinh noi-day-lech: luoi dang sua khac luoi se chay thi chan noi-day do

- eval: E7
  run_id: hinh-cua-luoi-E7-1788256160
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_hinh_hinh
  verified_at: 2026-09-01T09:49:20Z
  output: |
      lint:slop: 756 files, 9 rules

- eval: E8
  run_id: hinh-cua-luoi-E8-1788256296
  exit_code: 0
  baseline: green
  verifier: config:executors.script.rang_hook_ep_chay
  verified_at: 2026-09-01T09:51:36Z
  output: |
      Cached:    0 cached, 13 total
      Cached:    0 cached, 9 total
      Cached:    0 cached, 10 total
    rang-hook ep-chay: du 4 tac vu duoc goi, 3 tac vu qua bo dung deu 0 doc tu dem

## Analyst

**The old frame is blind to attack 3, and the new one is not. Both measured on
this tree, minutes apart.** The pre-feature hook and the pre-feature
`package.json` were restored, the root `test` script was narrowed to
`turbo run test --concurrency=1 --filter=@crm/env`, and the signed leg
`rang-hook.sh --chan ep-chay` was run:

```
The signed leg finishes green:
  Cached:    0 cached, 13 total
  Cached:    0 cached, 9 total
  Cached:    0 cached, 1 total
rang-hook ep-chay: du 4 tac vu duoc goi, 3 tac vu qua bo dung deu 0 doc tu dem
```

`0 cached, 1 total` — seven packages had left the gate and the leg called it
green. The same attack on the new frame:

```
E1 stops the round, non-zero:
  - 'test' never reached @crm/auth — the gate covered 1 of the 8 packages that need it
  - 'test' never reached @crm/db — the gate covered 1 of the 8 packages that need it
  - 'test' never reached @crm/telemetry — the gate covered 1 of the 8 packages that need it
```

**E1 discriminates.** Run against the pre-feature hook from `14c1b13`, the gate
finishes green in 18 seconds and E1 stops with
`RANG CUN: luoi khong bao no da doi chieu voi 10 goi cua cay nay`. The old gate
does the work and says nothing about how much of it there was.

**Three of the four regression attacks are caught by ONE comparison, with no leg
written for any of them.** So is a fifth attack nobody had a leg for: a package
that quietly drops its `test` script. So is a sixth: a new package that declares
no checks at all. So is a seventh: an entire new workspace root, under a
directory the declaration never mentions. Each fails with a message naming the package and the two ways
to fix it. That is the property the round was for — the check is not a list of
attacks, so an attack does not have to be foreseen.

The fourth attack cannot be caught from inside a running gate. A gate that is
running is, by that fact, wired in. `noi-day` therefore checks it from outside,
on a repository built the way `bun install` builds one.

## Known limits

1. **The shape check does not run on a push that has already failed.** It runs
   last. A push that fails type checking never reaches it, so a commit that both
   breaks a test and hollows the gate reports only the broken test. The next
   green push reports the hollowing. No push gets through unchecked.
2. **Widening `ignorePatterns` in `.oxlintrc.json` lowers the bar and the
   reference together.** The reference measure is oxlint's own file count on this
   tree, so a config that excludes a directory excludes it from both sides. The
   contract puts that outside this round. A tracked config file is a visible
   diff; a narrowed script inside a `package.json` line was not.
3. **The checker list is the only hand-kept list left.** Adding a fifth task to
   the gate needs one line in `gate-shape.json`, and until it is there the gate
   refuses the push with `the gate ran 'turbo run X', which gate-shape.json does
   not declare`. Everything else is derived: a new package raises the bar by
   itself, and so does a whole new workspace root, because the declared roots are
   a floor and every `workspaces` glob in the root manifest is added to them.
   E3 proves the new-root case on a root the declaration never names.
4. **An exemption is a decision, and nothing forces it to be revisited.**
   `@crm/ui` is exempt from `test` with the reason "No test script today. This is
   a known gap, not a decision." Nothing expires that line. What the round buys
   is that the gap is now written down in one file instead of being invisible.
   A stale exemption for a package that no longer exists IS caught.
5. **The gate's output is now streamed, not drawn.** Tee-ing each task to a log
   makes the build tool's terminal UI fall back to plain lines. The gate reads
   differently than it did.
6. `bash` replaces `sh` in the hook shebang, because `pipefail` is needed to keep
   a task's failure from being masked by `tee`. Every acceptance harness in this
   repo already requires bash.

## Ngoài hợp đồng

1. **On this worktree, the gate that git would run is the main checkout's, not
   this branch's.** `core.hooksPath` holds the absolute path
   `/Users/manhphan/dev/crm/.githooks`, so a push from here runs the OLD gate.
   `cmp` reports the two files differ. This is what AC-6 describes, measured on
   the real tree rather than a fixture. It resolves when the branch merges.
2. **`agent#test` is not a flake. It fails once the test database holds rows from
   an aborted earlier run, and it then fails every time.** It failed on
   `retireExhausted > retires no more rows than the limit allows`
   (`apps/agent/test/tasks.integration.spec.ts:193`), with
   `retireExhausted(2)` returning 3 rows. The test claims every due row, not only
   the three it queued, so rows left behind by a suite that was cut short push it
   over its own limit. `bun run db:test` clears it and the gate goes green again;
   two consecutive red runs became green immediately after. The gate runs the
   suite without that reset, so a developer whose previous push was interrupted
   sees a red test that has nothing to do with their change. Not touched by this
   round, and recorded here because the earlier note calling it a rare flake is
   wrong about the cause.
3. The worktree had no `node_modules` and no `.env`. `bun install` was run and
   `.env` was symlinked to the main checkout's. Both are gitignored and neither
   is a repository change.
4. `--no-verify` and `CRM_SKIP_HOOKS` remain the documented ways past the gate.
   Both are intended, and `CRM_SKIP_HOOKS` still says out loud that nothing ran.
5. `CONTRIBUTING.md` gained a paragraph on the shape declaration, and one stale
   sentence was corrected: it still said turbo caching makes a repeat push nearly
   free, which stopped being true when the previous round forced every task.
6. The leg `rang-hook.sh --chan ep-chay` of the signed round is now redundant.
   It is not wrong, so the contract leaves it in place. It is kept as E8 to prove
   the frame change did not break the signed round.

## Variance

E1 ran green seven times across the session. It reported 9/9, 9/9, 8/8 every
time. Its file count moved once, from 752 to 756, when the rebase brought four
new source files in — the one number that is supposed to move. It ran red twice
on purpose, once against the pre-feature hook and once under the `--filter`
attack. `agent#test`
flaked once in eight full gate runs, as recorded above. Every other eval is
deterministic and ran at least twice.

## Iterations

One round. The four regression attacks were replayed against the built frame
rather than reasoned about, and the fifth and sixth attacks were found by asking
what else the derived expectation could not see; both are now legs.

### Re-pin lần 1 — 07/09, do vòng sửa `thuoc-cache-het-doi-tuong` chạm hai file cấu hình turbo

run_id: repin-20260907T005455Z-44758
sha: f8aa7f4a9e1ec9ce1be8585683103adf1a901431 · suites: 4 lệnh exit 0

### Re-pin lần 2 — 2026-09-09, do ba hồ sơ neo vào hình dạng cổng, vá xong mỏ neo và bộ đọc
run_id: repin-20260909T003118Z-32102
sha: 580ef79ac789b0966befa17df3a2642f6f980db5 · suites: 5 lệnh exit 0 · evals: 8 eval máy exit 0

### Re-pin lần 3 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T053254Z-97828
sha: 3f3c60fe85ce0734a0f149a37c6c24dd52b98a74 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng
