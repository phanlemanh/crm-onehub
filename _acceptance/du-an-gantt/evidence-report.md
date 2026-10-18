---
schema_version: 2
feature_slug: du-an-gantt
verdict: BLOCKED
failed_evals: []
reason: 'ui-check:E13 không đo được. Lệnh tien-de.mjs không hoàn tất: phiên đo dựng xong (kho crm_cool_elbakyan_61bdff_do, app localhost:4582, api localhost:4626) nhưng man.mjs dòng 122 gọi viec.create bị API trả 400 "duAnId: Invalid input: expected string, received null". Rào chắn nằm ở dữ liệu dựng của rang/man.mjs (gửi duAnId null mà schema yêu cầu chuỗi), không phải ở giao diện. Chưa vẽ trang nào, chưa lưu ảnh dg-*.png nào.'
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ad235d5bf90ca41eafea4c2caeb7bd58a934b96e
human_signoff:
---

# Evidence Report: du-an-gantt

Vòng 1. Verdict BLOCKED: mọi eval máy khác đều xanh, riêng E13 (ui-check) không đo được vì lỗi dữ liệu dựng của man.mjs. Cách gỡ là sửa dữ liệu dựng rồi chạy lại E13, không phải sửa giao diện.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | ui-check | BLOCKED |
| E13b | AC-13 | script | PASS |
| E14 | AC-14 | judgment | PASS (đề xuất của hội đồng, chờ người) |
| E15 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-du-an-gantt-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_tao
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6wp8v0m5g_test

- eval: E1b
  run_id: minted-du-an-gantt-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_ds
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 5 tests across 1 file. [1086.00ms]

- eval: E2
  run_id: minted-du-an-gantt-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_gom
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6wphccwys_test

- eval: E2b
  run_id: minted-du-an-gantt-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_khung
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 2 tests across 1 file. [936.00ms]

- eval: E3
  run_id: minted-du-an-gantt-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_bat_dau
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6wolziiv7_test

- eval: E3b
  run_id: minted-du-an-gantt-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_ngay
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 1 test across 1 file. [1309.00ms]

- eval: E4
  run_id: minted-du-an-gantt-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_gantt_ui
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 1 test across 1 file. [828.00ms]

- eval: E4b
  run_id: minted-du-an-gantt-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_gantt
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 3 tests across 1 file. [1164.00ms]

- eval: E5
  run_id: minted-du-an-gantt-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_keo_thanh
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6wpihaocz_test

- eval: E5b
  run_id: minted-du-an-gantt-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_keo
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 3 tests across 1 file. [1392.00ms]

- eval: E6
  run_id: minted-du-an-gantt-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_phu_thuoc
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6woiztf46_test

- eval: E6b
  run_id: minted-du-an-gantt-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_phai_cho
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 2 tests across 1 file. [1235.00ms]

- eval: E7
  run_id: minted-du-an-gantt-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_ngay_lam
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 8 tests across 2 files. [11.00ms]

- eval: E7b
  run_id: minted-du-an-gantt-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_tu_doi
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6wpjmed1z_test

- eval: E8
  run_id: minted-du-an-gantt-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_moc
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6wvpz8qg6_test

- eval: E9
  run_id: minted-du-an-gantt-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_lich
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6wws0i08q_test

- eval: E9b
  run_id: minted-du-an-gantt-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_lich
  verified_at: 2026-10-18T02:11:47Z
  output: |
    Ran 3 tests across 1 file. [552.00ms]

- eval: E10
  run_id: minted-du-an-gantt-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_quyen
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6wwa5bia4_test

- eval: E11
  run_id: minted-du-an-gantt-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_vong_doi
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6ww3lsuyd_test

- eval: E11b
  run_id: minted-du-an-gantt-E11b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_dong
  verified_at: 2026-10-18T02:11:47Z
  output: |
    (lệnh không in dòng tóm tắt; kết thúc thành công)

- eval: E12
  run_id: mvd6www919cg
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_thuoc
  verified_at: 2026-10-18T02:11:47Z
  output: |
    test-run: dropped crm_mvd6www919cg_test

- eval: E13
  run_id: minted-du-an-gantt-E13-r1
  cannot_run: true
  baseline: n-a
  verifier: config:executors.script.dg_man
  verified_at: 2026-10-18T02:11:47Z
  observed: |
    Không có khung nào để đối chiếu với expected: thư mục evidence không có ảnh dg-cua-toi-1280, dg-pham-vi-1280, dg-ds-1280, dg-gantt-1280, dg-gantt-moc-tre-1280, dg-gantt-da-doi-1280, dg-khung-viec-1280, dg-hoi-dong-1280, dg-lich-lam-viec-1280, dg-gantt-375 hay dg-ds-375.
  network_observed: n-a (driver)
  output: |
    Lệnh: BANG_CHUNG=_acceptance/du-an-gantt/evidence bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/du-an-gantt/rang/man.mjs" (cd vào cây với || exit 97).
    Phiên đo dựng xong: kho crm_cool_elbakyan_61bdff_do, app localhost:4582, api localhost:4626.
    Dòng cuối: "KHONG DO DUOC: Error: viec.create tra 400: ... duAnId: Invalid input: expected string, received null" tại man-lib.mjs:215 (lam), gọi từ man.mjs:122; sau đó "phien-do: xong".
    Không có dòng "du-an-gantt man: dat". Phiên đo dọn contextDevApiKey và ảnh đại diện bình thường.
    Assertion cần đạt: lệnh thoát thành công kèm "du-an-gantt man: dat" — KHÔNG đạt (không đo được, mã thoát có trong run-log).
    Không dùng browser tool nên không đọc network; server do phiên đo tự dựng và tự dọn.
    Log đầy đủ: /private/tmp/claude-503/-Users-manhphan-dev-crm-onehub--claude-worktrees-cool-elbakyan-61bdff/475dba83-314e-44c8-b1f7-70a66e22d37f/scratchpad/e13.log

- eval: E13b
  run_id: minted-du-an-gantt-E13b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dg_san_thiet_ke
  verified_at: 2026-10-18T02:11:47Z
  output: |
    dg san: 11 tep, 0 vi pham P0

- eval: E15
  run_id: minted-du-an-gantt-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dg_dot_bien
  verified_at: 2026-10-18T02:11:47Z
  output: |
    dot-bien: 21/21 dot bien chet

### Judgment

- eval: E14
  judged_by: hội đồng judge-subagent (fresh context), đề xuất PASS
  verdict: PASS
  rationale: Ba thấu kính cùng đề xuất PASS (bên dưới). Hợp đồng là T3 nên người phải tự chốt, máy chưa chốt thay.
  human_override:  # chi nguoi ghi

Phiếu của hội đồng cho E14 (lời lẽ nguyên văn, không rút gọn):

- domain-correctness: PASS — CONTEXT.md có đủ các mục «Dự án» (dòng 229), «Phạm vi (màn Việc)», «Việc của tôi» (dòng 197), «Mốc (dự án)», «Phụ thuộc (việc)» và «Lịch làm việc», và nội dung khớp từng ý của câu hỏi. docs/api.md mục «Việc › Dự án» (dòng 618-655) nêu duAn.list, duAn.lich, duAn.moc.*, duAn.phuThuoc.*, viec.doiLich, viec.doiDuAn, luật dời khi chồng, nguồn vết `gantt` và `tu-doi`, và lichLamViec.*. Tôi không thấy điều nào bị thiếu.
- operational-feasibility: PASS — CONTEXT.md (dòng 192-198, 229-263) có đủ các mục «Việc của tôi», «Dự án», «Mốc (dự án)», «Phụ thuộc (việc)» và «Lịch làm việc», nội dung khớp từng ý của câu hỏi. docs/api.md (dòng 613-655) có phần «Dự án» nêu đủ duAn.list, duAn.lich, duAn.moc.*, duAn.phuThuoc.*, viec.doiLich, viec.doiDuAn, luật dời khi chồng, nguồn vết gantt và tu-doi, và router lichLamViec.
- spec-alignment: PASS — CONTEXT.md có đủ các mục «Dự án», «Việc của tôi», «Phạm vi», «Mốc (dự án)», «Phụ thuộc (việc)» và «Lịch làm việc» (dòng 192–263), nội dung khớp từng ý trong câu hỏi. Mục «Dự án» trong docs/api.md (dòng 618–655) nêu đủ duAn.list/lich, duAn.moc.*, duAn.phuThuoc.*, viec.doiLich, viec.doiDuAn, luật dời khi chồng, nguồn vết gantt và tu-doi (dòng 613–615) và lichLamViec.*.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-18T02:11:47Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-18T02:11:47Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-18T02:11:47Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-18T02:11:47Z

- cmd: bunx turbo run lint --force
  run_id: minted-du-an-gantt-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-18T02:11:47Z

- cmd: bun run lint:slop
  run_id: minted-du-an-gantt-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-18T02:11:47Z

- cmd: bunx turbo run build --force
  run_id: minted-du-an-gantt-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-18T02:11:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an.spec.ts -t dg-tao": bo qua baseline: tep apps/api/test/du-an.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/du-an.dom.tsx -t dg-man-ds: bo qua baseline: tep apps/app/test/du-an.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an.spec.ts -t dg-gom": bo qua baseline: tep apps/api/test/du-an.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-viec-lich.dom.tsx -t dg-man-khung && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-bang.dom.tsx -t dg-man-dong-phu: bo qua baseline: tep apps/app/test/khung-viec-lich.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an-lich.spec.ts -t dg-bat-dau": bo qua baseline: tep apps/api/test/du-an-lich.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && for tz in Asia/Ho_Chi_Minh UTC; do TZ=$tz bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-viec-lich.dom.tsx -t dg-man-ngay || exit 1; done: bo qua baseline: tep apps/app/test/khung-viec-lich.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup-dom.ts ./test/gantt-du-an.dom.tsx -t gantt-du-an: bo qua baseline: tep packages/ui/test/gantt-du-an.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/du-an-gantt.dom.tsx -t dg-man-gantt: bo qua baseline: tep apps/app/test/du-an-gantt.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an-lich.spec.ts -t dg-keo-thanh": bo qua baseline: tep apps/api/test/du-an-lich.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/du-an-gantt.dom.tsx -t dg-man-keo: bo qua baseline: tep apps/app/test/du-an-gantt.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an-lich.spec.ts -t dg-phu-thuoc": bo qua baseline: tep apps/api/test/du-an-lich.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-viec-lich.dom.tsx -t dg-man-phai-cho: bo qua baseline: tep apps/app/test/khung-viec-lich.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd packages/db && TZ=Asia/Ho_Chi_Minh bun test test/lich-lam-viec.spec.ts test/lich-viec.spec.ts: bo qua baseline: tep packages/db/test/lich-lam-viec.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an-lich.spec.ts -t dg-tu-doi": bo qua baseline: tep apps/api/test/du-an-lich.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an.spec.ts -t dg-moc": bo qua baseline: tep apps/api/test/du-an.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/lich-lam-viec.spec.ts": bo qua baseline: tep apps/api/test/lich-lam-viec.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lich-lam-viec.dom.tsx: bo qua baseline: tep apps/app/test/lich-lam-viec.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an-quyen.spec.ts": bo qua baseline: tep apps/api/test/du-an-quyen.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/du-an.spec.ts -t dg-vong-doi": bo qua baseline: tep apps/api/test/du-an.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/du-an.dom.tsx -t dg-man-dong: bo qua baseline: tep apps/app/test/du-an.dom.tsx co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/du-an-do-nguong.spec.ts": bo qua baseline: tep apps/api/test/du-an-do-nguong.spec.ts co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/du-an-gantt/rang/san-thiet-ke.mjs: bo qua baseline: tep _acceptance/du-an-gantt/rang/san-thiet-ke.mjs co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/du-an-gantt/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/du-an-gantt/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base baf78ee3aae40c288f6772d8b7223ebec633e808 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E13 không đo được — man.mjs dòng 122 gửi duAnId null cho viec.create nên API từ chối 400, phiên đo thoát trước khi vẽ trang nào; các eval máy còn lại và bảy lệnh suite đều xanh. Verdict BLOCKED, cần sửa dữ liệu dựng của rang/man.mjs rồi chạy lại E13.
