---
schema_version: 2
feature_slug: cron-theo-ban-khai
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-eval verify, run_id minted at execution
enforcement_mode: strict
bypass_used: false
verified_commit: 3d5b732459d262b0afe7c01c5ba2d92c2e508849
run_id: s4r1-20260907T084712Z-30364
human_signoff: Manh Phan 2026-09-07
---

# Evidence Report: cron-theo-ban-khai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E8 | AC-8 | script | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: s4r1-20260907T084712Z-30364-E1
  exit_code: 0
  verifier: config:executors.script.cr_dung_ban_khai
  verified_at: 2026-09-07T08:47:19.940Z
  output: |
      the 'lanh': doc /Users/manhphan/dev/crm/.vercel/output/config.json · khai 5 · ra 5
      the 'them': doc /Users/manhphan/dev/crm/.vercel/output/config.json · khai 6 · ra 6
      the 'go': doc /Users/manhphan/dev/crm/.vercel/output/config.json · khai 4 · ra 4
    XANH: config.json theo dung ban khai o ca ba the — lanh 5 · them 6 · go 4

- eval: E2
  run_id: s4r1-20260907T084712Z-30364-E2
  exit_code: 0
  verifier: config:executors.script.cr_khong_ghim_cung
  verified_at: 2026-09-07T08:47:12.766Z
  output: |
    soi /Users/manhphan/dev/crm/apps/api/scripts/build-func.mjs
    object literal mang ca hai khoa path+schedule: 0
    XANH: khong cron nao ghim cung, va script co doc vercel.json.

- eval: E3
  run_id: s4r1-20260907T084712Z-30364-E3
  exit_code: 0
  verifier: config:executors.script.cr_vang_khai_thi_dung
  verified_at: 2026-09-07T08:51:52.006Z
  output: |
      1 doi chung duong: ma 0 · config co (5 dong) · doc /Users/manhphan/dev/crm/.vercel/output/config.json
      2 vang han file: ma 1 · config khong co · doc /Users/manhphan/dev/crm/.vercel/output/config.json
      3 khong co khoa crons: ma 1 · config khong co · doc /Users/manhphan/dev/crm/.vercel/output/config.json
      4 mang crons RONG: ma 1 · config khong co · doc /Users/manhphan/dev/crm/.vercel/output/config.json
    XANH: ca ba hinh dang hong deu lam luot dung DUNG lai va neu ten file; doi chung duong ma 0 voi du 5 dong.

- eval: E4
  run_id: s4r1-20260907T084712Z-30364-E4
  exit_code: 0
  verifier: config:executors.script.cr_duong_co_that
  verified_at: 2026-09-07T08:47:12.885Z
  output: |
      /internal/listings/ingest
      /internal/sync/google
      /internal/sync/mailboxes
      /internal/sync/rates
      /internal/telemetry/rollup
      /internal/tracking/retention
    path trong ban khai: 5 · thieu route: 0
    XANH: ca 5 path cua ban khai deu tro toi mot route co that, va bo quet bat duoc ca bi danh /internal/sync/google.

- eval: E5
  run_id: s4r1-20260907T084712Z-30364-E5
  exit_code: 0
  verifier: config:executors.script.cr_khong_con_bi_danh
  verified_at: 2026-09-07T08:47:15.844Z
  output: |
    /internal/sync/google: googleViaGet, googleViaPost -> goi { run }
    /internal/sync/mailboxes:      mailboxesViaGet, mailboxesViaPost -> goi { run }
    cron duoc dang ky: 5 · ban khai: 5
    XANH: bi danh khong con duoc dang ky, /internal/sync/mailboxes co mat dung nhip, va hai duong uy cho CUNG mot cho.

- eval: E6
  run_id: s4r1-20260907T084712Z-30364-E6
  exit_code: 0
  verifier: config:executors.script.cr_phan_con_lai_khong_doi
  verified_at: 2026-09-07T08:51:54.746Z
  output: |
    cron cu: 1 · cron moi: 5
    khoa ngoai crons: version, routes
    ham dung ra: 17529670 byte
    XANH: chi khoi crons khac; version va routes trung tung ky tu, va ham dung ra van co.

- eval: E8
  run_id: s4r1-20260907T084712Z-30364-E8b
  exit_code: 0
  verifier: config:executors.script.cr_ban_trien_khai_that
  verified_at: 2026-09-07T08:51:35.580Z
  output: |
    sha dang xet: 3d5b7324 · ban trien khai READY khop sha: 1
    nen tang dang ky: 5 · ban khai: 5
      */5 * * * *  /internal/sync/mailboxes
      0 6 * * *  /internal/sync/rates
      0 7 * * *  /internal/telemetry/rollup
      0 4 * * *  /internal/tracking/retention
      0 5 * * *  /internal/archive/prune
    XANH: ban trien khai that cua crm-onehub-api dang ky dung 5 viec, tung cap path va nhip khop ban khai.

- eval: E7
  run_id: s4r1-20260907T084712Z-30364-E7
  exit_code: 0
  verifier: config:executors.script.cr_nam_lenh_chung
  verified_at: 2026-09-07T08:52:37.810Z
  output: |
    test: ma 0
    check-types: ma 0
    lint: ma 0
    lint:slop: ma 0
    build: ma 0
    apps/app canh bao lint: 3 · ghim: 3
    XANH: ca nam lenh chung ma 0, canh bao lint dung ghim.

## Lệnh chứng — năm lệnh

| Lệnh | run_id | exit |
|---|---|---|
| `test` | s4r1-20260907T084712Z-30364-suite-test | 0 |
| `check-types` | s4r1-20260907T084712Z-30364-suite-check-types | 0 |
| `lint` | s4r1-20260907T084712Z-30364-suite-lint | 0 |
| `lint-slop` | s4r1-20260907T084712Z-30364-suite-lint-slop | 0 |
| `build` | s4r1-20260907T084712Z-30364-suite-build | 0 |
