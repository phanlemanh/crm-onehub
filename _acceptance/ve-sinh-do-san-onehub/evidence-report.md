---
schema_version: 2
feature_slug: ve-sinh-do-san-onehub
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e6faa870aa9b645af43f7885ce5ff796ad6296f1
human_signoff: manh 2026-10-17 — ký Cổng Bằng chứng trên S4 vòng 2 PASS (20/20 eval, 7/7 suite); Ngoài-1, 4 chấp nhận không sửa; Ngoài-5, 11, 15 mở hợp đồng mới; 12 mục còn lại ghi Known limits; cắt/hoãn đồng ý cắt; Treo phê hết
---

# Evidence Report: ve-sinh-do-san-onehub

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-6 | script | PASS |
| E10 | AC-6 | script | PASS |
| E11 | AC-7 | script | PASS |
| E12 | AC-7 | script | PASS |
| E13 | AC-7 | script | PASS |
| E14 | AC-8 | script | PASS |
| E15 | AC-9 | script | PASS |
| E16 | AC-9 | script | PASS |
| E17 | AC-10 | script | PASS |
| E18 | AC-11 | script | PASS |
| E19 | AC-12 | script | PASS |
| E20 | AC-12 | test | PASS |

Vòng 2: năm eval chạy lại (E1, E2, E7, E18, E19), mười lăm eval mang từ vòng 1 vì delta không chạm paths của chúng. Không có lệnh hỏng nào, không có lệnh hỏng nào không gắn eval.

## Evidence

- eval: E1
  run_id: minted-ve-sinh-do-san-onehub-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_hydrat_record
  verified_at: 2026-10-17T08:10:50Z
  output: |
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-ve-sinh-do-san-onehub-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_chieu_do_hydrat
  verified_at: 2026-10-17T08:10:50Z
  output: |
    CHIEU DO DAT: 18 loi hydrat tren ban sao khong nap san; o tai hien: D3,D4

- eval: E3
  run_id: minted-ve-sinh-do-san-onehub-E3-r1
  exit_code: 0
  verifier: config:executors.test.vs_nap_san_dom
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-ve-sinh-do-san-onehub-E4-r1
  exit_code: 0
  verifier: config:executors.script.vs_chieu_do_nap_san
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-ve-sinh-do-san-onehub-E5-r1
  exit_code: 0
  verifier: config:executors.test.vs_403_dom
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-ve-sinh-do-san-onehub-E6-r1
  exit_code: 0
  verifier: config:executors.script.vs_chieu_do_403
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-ve-sinh-do-san-onehub-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_hydrat_record
  verified_at: 2026-10-17T08:10:50Z
  output: |
    phien-do: xong — mã 0

- eval: E8
  run_id: minted-ve-sinh-do-san-onehub-E8-r1
  exit_code: 0
  verifier: config:executors.script.cai_dat_moi_chuoi
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-ve-sinh-do-san-onehub-E9-r1
  exit_code: 0
  verifier: config:executors.script.ktcd_khong_hoi_quy
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-ve-sinh-do-san-onehub-E10-r1
  exit_code: 0
  verifier: config:executors.script.vs_chieu_do_moi_chuoi
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-ve-sinh-do-san-onehub-E11-r1
  exit_code: 0
  verifier: config:executors.script.osa_soi_ma
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-ve-sinh-do-san-onehub-E12-r1
  exit_code: 0
  verifier: config:executors.script.osa_san_thiet_ke
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-ve-sinh-do-san-onehub-E13-r1
  exit_code: 0
  verifier: config:executors.script.osa_ktcd_khong_trinh_duyet
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-ve-sinh-do-san-onehub-E14-r1
  exit_code: 0
  verifier: config:executors.script.sk_luat
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-ve-sinh-do-san-onehub-E15-r1
  exit_code: 0
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E16
  run_id: minted-ve-sinh-do-san-onehub-E16-r1
  exit_code: 0
  verifier: config:executors.script.dok_man_chrome
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E17
  run_id: minted-ve-sinh-do-san-onehub-E17-r1
  exit_code: 0
  verifier: config:executors.script.vs_khong_noi
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E18
  run_id: minted-ve-sinh-do-san-onehub-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_ghim_xanh
  verified_at: 2026-10-17T08:10:50Z
  output: |
    ghim-xanh: 7 ho so xanh, pre-merge sach (okr-soat-anh-luot-3, toan-canh-okr, soan-okr-trong-khung, khung-trang-cai-dat, man-cai-dat-noi-tieng-viet, dat-okr-trong-crm, muc-tieu-va-kr)

- eval: E19
  run_id: minted-ve-sinh-do-san-onehub-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_hydrat_record
  verified_at: 2026-10-17T08:10:50Z
  output: |
    phien-do: xong — mã 0

- eval: E20
  run_id: minted-ve-sinh-do-san-onehub-E20-r1
  exit_code: 0
  verifier: config:executors.test.vs_nap_san_dom
  verified_at: 2026-10-17T07:37:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-17T08:10:50Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-17T08:10:50Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-17T08:10:50Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-17T08:10:50Z

- cmd: bunx turbo run lint --force
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-17T08:10:50Z

- cmd: bun run lint:slop
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-17T08:10:50Z

- cmd: bunx turbo run build --force
  run_id: minted-ve-sinh-do-san-onehub-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-17T08:10:50Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet). Cac eval khong do duoc baseline duoc liet ke ngay duoi day, khong phai ket qua cua code cu.

Baseline khong do:
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/ve-sinh-do-san-onehub/rang/hydrat-record.mjs": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu
- node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --tu-thu-cay && node _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs --ca hydrat: bo qua baseline: tep _acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs --tu-thu && node _acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs: bo qua baseline: tep _acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E18 failed — thước ghim-xanh sai pathspec và cách đọc mã thoát mong đợi; hydrat-record đếm dữ liệu thật dưới ngăn chưa đúng. Returned to implementation.
Round 2: cả hai thước đã sửa; năm eval chạy lại (E1, E2, E7, E18, E19) đều đạt, mười lăm eval còn lại mang từ round 1 vì delta không chạm paths của chúng. Verdict PASS.

### Re-pin lần 1 — 2026-10-17, do ghim lại sau gộp onehub 9dfdf0628 và sau làn ghim bảy hồ sơ repin-20261017T113609Z-76485
run_id: repin-20261017T122810Z-56563
sha: ce20af45ea95cfff1742a902c9462fff6bdd27b6 · suites: 7 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-17, do ghim lại sau gỡ chú thích c88b1658e và sau làn bảy hồ sơ repin-20261017T134627Z-69983
run_id: repin-20261017T145006Z-66110
sha: e6faa870aa9b645af43f7885ce5ff796ad6296f1 · suites: 7 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
