---
schema_version: 2
feature_slug: test-api-khong-de-viec-vo-chu
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cc2c13b1c828b562847578b89f34986708af652e
human_signoff: 
---

# Evidence Report: test-api-khong-de-viec-vo-chu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: muf1mthhxvdf
  exit_code: 0
  verifier: config:executors.script.vvc_dieu_phoi_don_sach
  verified_at: 2026-09-24T04:39:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval.

- eval: E2
  run_id: muf1mt1qg55f
  exit_code: 0
  verifier: config:executors.test.vvc_ung_dung_da_dong
  verified_at: 2026-09-24T04:39:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval.

- eval: E3
  run_id: muf1msx72jg1
  exit_code: 0
  verifier: config:executors.test.vvc_van_quet_that
  verified_at: 2026-09-24T04:39:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval.

- eval: E4
  run_id: muf1mstwm83e
  exit_code: 0
  verifier: config:executors.script.vvc_go_la_khong_quet
  verified_at: 2026-09-24T04:39:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval.

- eval: E5
  run_id: muf2511jedth
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vvc_ca_goi_api
  verified_at: 2026-09-24T05:01:15Z
  output: |
    agentTask moi trang thai: []
    goi api sach: agentTask chua xong=0 (cua lien he le=0) lien he=0 cong ty=0; lien he le cmuf251v60000gtcfbxl5zfos con nguyen
    test-run: dropped crm_muf2511jedth_test

- eval: E6
  run_id: minted-test-api-khong-de-viec-vo-chu-E6-r1
  exit_code: 0
  verifier: config:executors.script.vvc_go_la_chi_them_dong
  verified_at: 2026-09-24T04:39:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muf253dxghxq
  exit_code: 0
  verified_at: 2026-09-24T05:01:15Z

- cmd: bunx turbo run lint --force
  run_id: minted-test-api-khong-de-viec-vo-chu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-24T05:01:15Z

- cmd: bun run lint:slop
  run_id: minted-test-api-khong-de-viec-vo-chu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-24T05:01:15Z

- cmd: bunx turbo run build --force
  run_id: minted-test-api-khong-de-viec-vo-chu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-24T05:01:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — khong co eval runs>1 trong vong nay.

## Iterations

Round 1: E1–E6 và bộ suite (test, lint, lint:slop, build) đều xanh ở lần chạy đầu; xem run-log round 1 (sha 06672e78).
Round 2: delta chạm paths của E5 (gọi gói api) — chạy lại E5 và bộ suite hồi quy (test, lint, lint:slop, build); tất cả xanh. E1–E4 và E6 carry-forward vì delta không chạm paths của chúng.

### Re-pin lần 1 — 2026-09-24, do hoa cu do gop onehub 41e04c72
run_id: repin-20260924T051137Z-62143
sha: 82fde06b0b1d4dba28c763a69516913c1dc88411 · suites: 4 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-09-24, do thuoc «vong nay» neo cap sha cua merge (merge-base(M^1,M^2)..M^2) thay merge-base dong; env GOOGLE_CLIENT_* nhu CI
run_id: repin-20260924T155831Z-87643
sha: f7a31a583af36e847d87df37ffd44f12b1d45a85 · suites: 4 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng

### Re-pin lần 3 — 2026-09-24, do ghim lai tren cay hop nhat sau khi gop onehub 973f1b01 (#125)
run_id: repin-20260924T160407Z-81970
sha: 787d66525c93e022bee430e6450c361c2fbd5a49 · suites: 4 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng

### Re-pin lần 4 — 2026-09-25, do mot-duong-ghi-phong-ban: bài kiểm chuyển sang org.*, đường ghi phòng ban cũ gỡ
run_id: repin-20260925T025226Z-13987
sha: dd85e27b0cd98a954011374c51e2679021a3c880 · suites: 4 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng

### Re-pin lần 5 — 2026-09-25, do mot-duong-ghi-phong-ban: ghim lại sau gộp onehub a8572437 (#129) và thêm ba thủ tục org.*Department
run_id: repin-20260925T032447Z-74232
sha: dfc8ff345842e738f421c08891eb1754198d9064 · suites: 4 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng

### Re-pin lần 6 — 2026-09-25, do gộp onehub 5d9e8b9c (#135 Zalo) vào nhánh — mã Zalo không chạm phòng ban
run_id: repin-20260925T042418Z-71551
sha: fd4ed7c19a1d747430525b716a645d0a4fd7f732 · suites: 4 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng

### Re-pin lần 7 — 2026-11-01, do sua-viec-may-sot-test-api: sáu chỗ dọn của bộ test api
run_id: repin-20261101T093514Z-26659
sha: cc2c13b1c828b562847578b89f34986708af652e · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
