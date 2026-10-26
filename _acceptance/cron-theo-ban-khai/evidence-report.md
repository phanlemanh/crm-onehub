---
schema_version: 2
feature_slug: cron-theo-ban-khai
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-eval verify, run_id minted at execution
enforcement_mode: strict
bypass_used: false
verified_commit: 396409faaf30dc62041ef1806d28d312e1925223
run_id: s4r2-20260907T091421Z-14559
human_signoff: Manh Phan 2026-09-07
---

# Evidence Report: cron-theo-ban-khai

Vòng 2 — chạy lại TRỌN bộ tám phép đo sau khi hợp nhất `onehub`. Không mang sang
phép đo nào: cây đã đổi ngoài `_acceptance/`, nên mọi thứ đo lại từ đầu.

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
  run_id: s4r2-20260907T091421Z-14559-E1
  exit_code: 0
  verifier: config:executors.script.cr_dung_ban_khai
  verified_at: 2026-09-07T09:14:29.476Z
  output: |
      the 'lanh': doc /Users/manhphan/dev/crm/.vercel/output/config.json · khai 5 · ra 5
      the 'them': doc /Users/manhphan/dev/crm/.vercel/output/config.json · khai 6 · ra 6
      the 'go': doc /Users/manhphan/dev/crm/.vercel/output/config.json · khai 4 · ra 4
    XANH: config.json theo dung ban khai o ca ba the — lanh 5 · them 6 · go 4

- eval: E2
  run_id: s4r2-20260907T091421Z-14559-E2
  exit_code: 0
  verifier: config:executors.script.cr_khong_ghim_cung
  verified_at: 2026-09-07T09:14:22.367Z
  output: |
    soi /Users/manhphan/dev/crm/apps/api/scripts/build-func.mjs
    object literal mang ca hai khoa path+schedule: 0
    XANH: khong cron nao ghim cung, va script co doc vercel.json.

- eval: E3
  run_id: s4r2-20260907T091421Z-14559-E3
  exit_code: 0
  verifier: config:executors.script.cr_vang_khai_thi_dung
  verified_at: 2026-09-07T09:14:35.097Z
  output: |
      1 doi chung duong: ma 0 · config co (5 dong) · doc /Users/manhphan/dev/crm/.vercel/output/config.json
      2 vang han file: ma 1 · config khong co · doc /Users/manhphan/dev/crm/.vercel/output/config.json
      3 khong co khoa crons: ma 1 · config khong co · doc /Users/manhphan/dev/crm/.vercel/output/config.json
      4 mang crons RONG: ma 1 · config khong co · doc /Users/manhphan/dev/crm/.vercel/output/config.json
    XANH: ca ba hinh dang hong deu lam luot dung DUNG lai va neu ten file; doi chung duong ma 0 voi du 5 dong.

- eval: E4
  run_id: s4r2-20260907T091421Z-14559-E4
  exit_code: 0
  verifier: config:executors.script.cr_duong_co_that
  verified_at: 2026-09-07T09:14:22.496Z
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
  run_id: s4r2-20260907T091421Z-14559-E5
  exit_code: 0
  verifier: config:executors.script.cr_khong_con_bi_danh
  verified_at: 2026-09-07T09:14:24.919Z
  output: |
    /internal/sync/google: googleViaGet, googleViaPost -> goi { run }
    /internal/sync/mailboxes:      mailboxesViaGet, mailboxesViaPost -> goi { run }
    cron duoc dang ky: 5 · ban khai: 5
    XANH: bi danh khong con duoc dang ky, /internal/sync/mailboxes co mat dung nhip, va hai duong uy cho CUNG mot cho.

- eval: E6
  run_id: s4r2-20260907T091421Z-14559-E6
  exit_code: 0
  verifier: config:executors.script.cr_phan_con_lai_khong_doi
  verified_at: 2026-09-07T09:14:37.929Z
  output: |
    cron cu: 1 · cron moi: 5
    khoa ngoai crons: version, routes
    ham dung ra: 17529670 byte
    XANH: chi khoi crons khac; version va routes trung tung ky tu, va ham dung ra van co.

- eval: E8
  run_id: s4r2-20260907T091421Z-14559-E8
  exit_code: 0
  verifier: config:executors.script.cr_ban_trien_khai_that
  verified_at: 2026-09-07T09:14:22.247Z
  output: |
    sha dang xet: d1169481 · ban trien khai READY khop sha: 2
    nen tang dang ky: 5 · ban khai: 5
      */5 * * * *  /internal/sync/mailboxes
      0 6 * * *  /internal/sync/rates
      0 7 * * *  /internal/telemetry/rollup
      0 4 * * *  /internal/tracking/retention
      0 5 * * *  /internal/archive/prune
    XANH: ban trien khai that cua crm-onehub-api dang ky dung 5 viec, tung cap path va nhip khop ban khai.

- eval: E7
  run_id: s4r2-20260907T091421Z-14559-E7
  exit_code: 0
  verifier: config:executors.script.cr_nam_lenh_chung
  verified_at: 2026-09-07T09:15:31.271Z
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
| `test` | s4r2-20260907T091421Z-14559-suite-test | 0 |
| `check-types` | s4r2-20260907T091421Z-14559-suite-check-types | 0 |
| `lint` | s4r2-20260907T091421Z-14559-suite-lint | 0 |
| `lint-slop` | s4r2-20260907T091421Z-14559-suite-lint-slop | 0 |
| `build` | s4r2-20260907T091421Z-14559-suite-build | 0 |

### Re-pin lần 1 — 2026-10-23, do F28 ho-so-do-kiem-cheo: sua thuoc ho so da ky kiem cheo goi ten (Cong Pham vi 23/10)
run_id: repin-20261023T123327Z-52490
sha: 8a8825cf5414ca488f01eaca85209dfc394168c0 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-24, do hoá cũ do gộp origin/onehub a971d21be vào nhánh F28 (lượt 3, từng hồ sơ)
run_id: repin-20261024T182422Z-97721
sha: e0389b2a953d782c9f58f04cc8c119e7a47f1d88 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-26, do hoá cũ do gộp origin/onehub 485bdc710 vào nhánh F28
run_id: repin-20261026T040558Z-88000
sha: 938c2f430a111234071aac844de83b7c917b4843 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · chập chờn (đỏ lần đầu, đạt khi chạy lại): suite 1/7 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 4 — 2026-10-26, do hoá cũ do gộp origin/onehub 1478ac08a và sửa răng toan-canh-okr theo trang-bo-okr
run_id: repin-20261026T080827Z-59889
sha: 396409faaf30dc62041ef1806d28d312e1925223 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
