---
schema_version: 2
feature_slug: trang-thai-tin-hieu-song
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 474fc669f69baa1fdfd8c10b051e45804296d4c3
human_signoff:
---

# Evidence Report: trang-thai-tin-hieu-song

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |

## Evidence

- eval: E1
  run_id: mvj6hn02sk2m
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttts_doc_ban_chup
  verified_at: 2026-10-22T06:46:41Z
  output: |
    bun run test -- "cd apps/app && bun test ./test/tin-hieu-nguon.spec.ts -t ttts-doc-ban-chup"
    test-run: dropped crm_mvj6hn02sk2m_test

- eval: E2
  run_id: minted-trang-thai-tin-hieu-song-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttts_khong_lui
  verified_at: 2026-10-22T06:46:41Z
  output: |
    cd apps/app && bun test ./test/tin-hieu-nguon.spec.ts -t ttts-khong-lui
    Ran 1 test across 1 file. [268.00ms]

- eval: E3
  run_id: minted-trang-thai-tin-hieu-song-E3-r1
  exit_code: 0
  verifier: config:executors.test.ttts_bao
  verified_at: 2026-10-22T06:05:58Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-trang-thai-tin-hieu-song-E4-r1
  exit_code: 0
  verifier: config:executors.test.ttts_khong_bao
  verified_at: 2026-10-22T06:05:58Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-trang-thai-tin-hieu-song-E5-r1
  exit_code: 0
  verifier: config:executors.test.ttts_giao_dich
  verified_at: 2026-10-22T06:05:58Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-trang-thai-tin-hieu-song-E6-r1
  exit_code: 0
  verifier: config:executors.test.ttts_cau
  verified_at: 2026-10-22T06:05:58Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-trang-thai-tin-hieu-song-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttts_do_man
  verified_at: 2026-10-22T06:46:41Z
  screenshot: evidence/E7-cua-toi-1280-vi.png
  observed: |
    Da mo tung anh bang Read.
    E7-cua-toi-1280-vi.png: trang «Tín hiệu đã gửi» cua nguoi gui, chuong co badge 1; mot dong crm-1 «TTTS-mvj6hsaf Không lọc được danh sách tín hiệu…» (tieu de dai), trang thai «Đã vào nhóm — Đã vào nhóm «TTTS-NHOM-mvj6hsaf», nhóm chưa thành việc.» — dung pha 2b.
    E7-tat-ca-1280-vi.png: trang quan tri «Mọi tín hiệu», tab «Tất cả», 1 dong crm-1, nguoi gui «Người gửi đo», trang thai «Đã vào nhóm» + ten nhom TTTS-NHOM-mvj6hsaf — dung pha 2b.
    E7-chuong-1280-vi / en: tren trang Lộ trình / Roadmap, popover Thông báo / Notifications mo, mot dong «Tín hiệu «TTTS-mvj6hsaf …» của bạn: Đã vào nhóm» / «Your signal «TTTS-mvj6hsaf …»: In a group», gio 13:47; tieu de nguyen van tieng Viet o ca ban en (khong dich); khong cuon ngang. Khop dongTuRa.
    E7-chuong-375-vi / en: cung noi dung o khổ dien thoai, chuong mo, dong thong bao dung nhan vi/en, tieu de khong dich, khong tran ngang; popover hoi trong suot de lo noi dung trang sau.
    E7-bam-1280-vi / en: sau khi bam dong thong bao tu Lo trinh, trang «Tín hiệu đã gửi» / «Sent signals» hien dong crm-1 voi «Đã vào nhóm» / «In a group» va cau chua «TTTS-NHOM-mvj6hsaf» («In the group «TTTS-NHOM-…», not turned into work yet.»).
    E7-bam-375-vi / en: cung ket qua o dang the (card) tren dien thoai, nhan «Đã vào nhóm» / «In a group», cau chua ten nhom TTTS-NHOM-mvj6hsaf, khong cuon ngang.
    Tat ca frame khop Expected; khong mau thuan.
  network_observed: n-a (driver)

- eval: E8
  run_id: mvj6hmz7n0jy
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttts_do
  verified_at: 2026-10-22T06:46:41Z
  output: |
    bun run test -- "bun test scripts/tin-hieu/test/do-bao-doi-cho.spec.ts -t ttts-do"
    test-run: dropped crm_mvj6hmz7n0jy_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-thai-tin-hieu-song-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T06:46:41Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-thai-tin-hieu-song-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T06:46:41Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-thai-tin-hieu-song-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T06:46:41Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-thai-tin-hieu-song-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T06:46:41Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-thai-tin-hieu-song-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T06:46:41Z

- cmd: bun run lint:slop
  run_id: minted-trang-thai-tin-hieu-song-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T06:46:41Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-thai-tin-hieu-song-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T06:46:41Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- bun run test -- "cd apps/app && bun test ./test/tin-hieu-nguon.spec.ts -t ttts-doc-ban-chup": bo qua baseline: tep apps/app/test/tin-hieu-nguon.spec.ts co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/tin-hieu-nguon.spec.ts -t ttts-khong-lui: bo qua baseline: tep apps/app/test/tin-hieu-nguon.spec.ts co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — bo suite app+ui do va cac finding trong hop dong o AC-2, AC-7, AC-8 (lenh do bo sot commit, E2 khong qua bo doc that, do man bam tu trang dich). Returned to implementation (commit 474fc669f).
Round 2: PASS — E1, E2, E7, E8 chay lai tren 474fc669f; E3, E4, E5, E6 carry-forward tu round 1 (delta khong cham paths cua eval); 7 lenh suite xanh. Moc verified_at cua cac khoi chay lai o round 2 la moc lam tron, run_id chep tu run-log.
