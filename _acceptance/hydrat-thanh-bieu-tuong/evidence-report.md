---
schema_version: 2
feature_slug: hydrat-thanh-bieu-tuong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1d78d07234dad3e651bc6133c38ccef85d8f7e3c
human_signoff: Phan Le Manh 2026-09-29
---

# Evidence Report: hydrat-thanh-bieu-tuong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6u | AC-6 | ui-check | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hydrat-thanh-bieu-tuong-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.htbt_e1
  verified_at: 2026-09-29T00:01:23Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-bieu-tuong-hydrat.dom.tsx -t 'e0|e1 '
    Ran 3 tests across 1 file. [2.23s]

- eval: E2
  run_id: minted-hydrat-thanh-bieu-tuong-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.htbt_e2
  verified_at: 2026-09-29T00:01:23Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-bieu-tuong-hydrat.dom.tsx -t 'e0|e2 '
    Ran 3 tests across 1 file. [2.03s]

- eval: E3
  run_id: minted-hydrat-thanh-bieu-tuong-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.htbt_e3
  verified_at: 2026-09-29T00:01:23Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-bieu-tuong-hydrat.dom.tsx -t 'e0|e3 '
    Ran 3 tests across 1 file. [1.57s]

- eval: E4
  run_id: minted-hydrat-thanh-bieu-tuong-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.htbt_e4
  verified_at: 2026-09-29T00:01:23Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-bieu-tuong-hydrat.dom.tsx -t 'e0|e4 '
    Ran 3 tests across 1 file. [2.01s]

- eval: E5
  run_id: minted-hydrat-thanh-bieu-tuong-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.htbt_e5
  verified_at: 2026-09-29T00:01:23Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-bieu-tuong-hydrat.dom.tsx -t 'e0|e5 '
    Ran 3 tests across 1 file. [1.96s]

- eval: E6u
  run_id: minted-hydrat-thanh-bieu-tuong-E6u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htbt_man_thanh
  verified_at: 2026-09-29T00:01:23Z
  screenshot: evidence/E6u-step1.png
  observed: |
    E6u-step1.png (vai quanTri, /okr, 1440): cot doc toi mau voi 10 bieu tuong xep doc, bieu tuong thu 8 co nen sang (muc dang chon), cuoi cot la avatar chu N; khong bieu tuong nao mo di (disabled), khong ban/skeleton. E6u-step2.png (vai chiOkr, /okr, 1440): cung dang thanh nhung chi 4 bieu tuong, bieu tuong thu 2 co nen sang, avatar N o duoi, khong bieu tuong mo, khong ban. Khop Expected: admin 10 bieu tuong, okr 4 bieu tuong rut gon so voi admin. E6u-network.txt la log day du cua lenh, khong phai dump network trinh duyet.
  network_observed: n-a (driver)
  output: |
    Frames da luu: evidence/E6u-step1.png (quanTri), evidence/E6u-step2.png (chiOkr), evidence/E6u-network.txt (log lenh).
    Driver la script puppeteer (man-thanh.mjs), khong doc duoc network trinh duyet.

- eval: E7
  run_id: minted-hydrat-thanh-bieu-tuong-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-29T00:01:23Z
  output: |
    bunx turbo run check-types --force
    Time:    19.032s

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-hydrat-thanh-bieu-tuong-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-29T00:01:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-hydrat-thanh-bieu-tuong-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-29T00:01:23Z

- cmd: bun run lint:slop
  run_id: minted-hydrat-thanh-bieu-tuong-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-29T00:01:23Z

- cmd: bunx turbo run build --force
  run_id: minted-hydrat-thanh-bieu-tuong-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-29T00:01:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

E7 (bunx turbo run check-types --force): xanh ca tren baseline lan HEAD, la regression-guard co chu y (chi tiet: chieu do cua E7 la ban sao layout.tsx bo prop workspace, khong chay tren baseline cua vong). E1-E5 deu red tren baseline (co phan biet). E6u khong chay duoc tren baseline (n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đạt (E1–E5, E6u, E7) và bốn lệnh suite xanh; verdict PASS, chưa có vòng quay lại.
