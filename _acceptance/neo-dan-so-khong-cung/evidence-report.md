---
schema_version: 2
feature_slug: neo-dan-so-khong-cung
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f3a129185da6c0deaccd5d72043a7b9d813118a5
human_signoff: Phan Le Manh 2026-09-24
---

# Evidence Report: neo-dan-so-khong-cung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-neo-dan-so-khong-cung-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_them_tep
  verified_at: 2026-09-24T01:43:49Z
  output: |
    DUNG sua — them-tep: thoat 0, so tep 478 -> 479
    DUNG goc — them-tep: DO: neo file ghim 478 nhung do duoc 479
    DO-NEO KET LUAN: 2 DUNG, 0 SAI — ma thoat 0

- eval: E2
  run_id: minted-neo-dan-so-khong-cung-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_them_mac_dinh
  verified_at: 2026-09-24T01:43:49Z
  output: |
    DUNG doi-chung — them-mac-dinh: ban sua xanh tren ban sao nguyen ven
    DUNG sua — them-mac-dinh: DO: neo mac_dinh ghim 93 nhung do duoc 94
    DO-NEO KET LUAN: 2 DUNG, 0 SAI — ma thoat 0

- eval: E3
  run_id: minted-neo-dan-so-khong-cung-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_bo_sot
  verified_at: 2026-09-24T01:43:49Z
  output: |
    DUNG sua — bo-sot: BO-SOT: 8 tep git theo doi ma bo duyet khong thay: packages/ui/src/lib/dither.ts, packages/ui/src/lib/eve-to-ai-sdk.ts, packages/ui/src/lib/format.ts, packages/
    DUNG goc — bo-sot: DO: neo file (chi bat vi so tep giam)
    DO-NEO KET LUAN: 3 DUNG, 0 SAI — ma thoat 0

- eval: E4
  run_id: minted-neo-dan-so-khong-cung-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_chua_theo_doi
  verified_at: 2026-09-24T01:43:49Z
  output: |
    DUNG sua — chua-theo-doi: thoat 0, bo duyet thay 478 -> 479
    DUNG goc — chua-theo-doi: DO: neo file
    DO-NEO KET LUAN: 2 DUNG, 0 SAI — ma thoat 0

- eval: E5
  run_id: minted-neo-dan-so-khong-cung-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_khong_do_duoc
  verified_at: 2026-09-24T01:43:49Z
  output: |
    DUNG sua — khong-do-duoc (b) goc rong: KHONG DO DUOC: tap nguon rong
    DUNG doi-chung — khong-do-duoc: ban sao nguyen ven co git thi thoat 0
    DO-NEO KET LUAN: 5 DUNG, 0 SAI — ma thoat 0

- eval: E6
  run_id: minted-neo-dan-so-khong-cung-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_cay_that
  verified_at: 2026-09-24T01:43:49Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E7
  run_id: minted-neo-dan-so-khong-cung-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_pham_vi
  verified_at: 2026-09-24T01:43:49Z
  output: |
    DUNG doi-chung — pham-vi: goi ten packages/ui/src/components/button.tsx
    DUNG sua — pham-vi: 16 tep doi tu e22d8288, 0 ngoai _acceptance va T1
    DO-NEO KET LUAN: 2 DUNG, 0 SAI — ma thoat 0

- eval: E8
  run_id: minted-neo-dan-so-khong-cung-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_ho_so_goc
  verified_at: 2026-09-24T01:43:49Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E9
  run_id: minted-neo-dan-so-khong-cung-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_cay_lech
  verified_at: 2026-09-24T01:43:49Z
  output: |
    DUNG sua — cay-lech: them-tep, bo-sot, chua-theo-doi thoat 0 tren cay HEAD + 1 tep
    DUNG sua-v1 — cay-lech: bo do vong 1 thoat 2 TIEN DE: ban goc do san
    DO-NEO KET LUAN: 2 DUNG, 0 SAI — ma thoat 0

- eval: E10
  run_id: minted-neo-dan-so-khong-cung-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ndk_xoa_chua_commit
  verified_at: 2026-09-24T01:43:49Z
  output: |
    DUNG sua — doi-ten-chua-commit: thoat 0, khong BO-SOT
    DUNG sua-v1 — doi-ten-chua-commit: BO-SOT: 1 tep git theo doi ma bo duyet khong thay: apps/app/lib/do-neo-them.ts
    DO-NEO KET LUAN: 4 DUNG, 0 SAI — ma thoat 0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-neo-dan-so-khong-cung-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-24T01:43:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-neo-dan-so-khong-cung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-24T01:43:49Z

- cmd: bun run lint:slop
  run_id: minted-neo-dan-so-khong-cung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-24T01:43:49Z

- cmd: bunx turbo run build --force
  run_id: minted-neo-dan-so-khong-cung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-24T01:43:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 8 eval (E1-E8) và 4 lệnh suite hồi quy PASS ngay từ lần đo đầu tiên; Gate 2 quyết nâng phạm vi (Ngoài-1, Ngoài-2, Ngoài-4, Ngoài-5, Ngoài-6) thêm AC-9, AC-10 vào hợp đồng, giữ Ngoài-3 làm known-limits trong ## Notes — trả lại để sửa bản gốc dựng cố định từ git archive e22d8288 và docGit bỏ tệp đã xoá khỏi đĩa.
Round 2: đủ 10 eval (E1-E10, thêm E9 cây-lệch và E10 xoá/đổi-tên-chưa-commit) và 4 lệnh suite hồi quy PASS — không có eval nào phải quay lại implementation.

### Re-pin lần 1 — 2026-09-24, do go neo cung dan-so (neo-dan-so-khong-cung) va gop onehub 2e...; ghim lai o dau nhanh
run_id: repin-20260924T020954Z-69115
sha: e482d8d3ee21642b475427ea4984cd02a1c37c59 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-09-24, do gop onehub 35796299 (#106) truoc khi merge #107
run_id: repin-20260924T031944Z-19904
sha: bb2a22fbce6f69655e42f173fc8031f0bee76cf0 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 3 — 2026-11-01, do F38 lối a: sửa thước 4 hồ sơ + gộp #603/#610/#609 chạm vùng canh
run_id: repin-20261031T235939Z-42423
sha: f3a129185da6c0deaccd5d72043a7b9d813118a5 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
