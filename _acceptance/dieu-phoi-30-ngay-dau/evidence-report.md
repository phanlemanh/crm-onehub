---
schema_version: 2
feature_slug: dieu-phoi-30-ngay-dau
verdict: BLOCKED
failed_evals: []
reason: ui-check E11 khong the chay - cong 3300 va 3301 cua cay dang xet dang bi mot worktree khac (busy-chatterjee-fc04e2) chiem dung; day la chan moi truong ha tang, khong phai loi san pham. Xem chi tiet trong khoi Evidence cua E11.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 38cea6a67353c7ac56e92491aa1ea85304a34493
human_signoff:
---

# Evidence Report: dieu-phoi-30-ngay-dau

Ghi chú: E11 (ui-check, AC-11) không chạy được vì xung đột cổng với một worktree khác — xem `reason` ở frontmatter và khối Evidence của E11 dưới đây. Mười bốn eval máy còn lại (E1–E10, E12–E15) và bốn lệnh suite hồi quy đều PASS.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | ui-check | BLOCKED |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: mu9rl2h0ucr6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_chep_khong_tham_chieu
  verified_at: 2026-09-20T02:30:00Z
  output: |
     6 expect() calls
    Ran 2 tests across 1 file. [197.00ms]
    test-run: dropped crm_mu9rl2h0ucr6_test

- eval: E2
  run_id: mu9rl2ga8oya
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_buoc_chua_giao_van_co_bo_phan
  verified_at: 2026-09-20T02:30:00Z
  output: |
    Ran 1 test across 1 file. [153.00ms]
    test-run: dropped crm_mu9rl2ga8oya_test

- eval: E3
  run_id: mu9rl3bei4rc
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_danh_muc_loc_va_ngay_im
  verified_at: 2026-09-20T02:30:00Z
  output: |
     7 expect() calls
    Ran 1 test across 1 file. [273.00ms]
    test-run: dropped crm_mu9rl3bei4rc_test

- eval: E4
  run_id: mu9rl35tav9g
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_bac_la_moc_ngay
  verified_at: 2026-09-20T02:30:00Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [128.00ms]
    test-run: dropped crm_mu9rl35tav9g_test

- eval: E5
  run_id: mu9rl3jskimh
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_lo_sai_tu_choi_tron
  verified_at: 2026-09-20T02:30:00Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [268.00ms]
    test-run: dropped crm_mu9rl3jskimh_test

- eval: E6
  run_id: mu9rl2lvsksb
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_khong_khop_viet_agenttask
  verified_at: 2026-09-20T02:30:00Z
  output: |
    Ran 1 test across 1 file. [212.00ms]
    test-run: dropped crm_mu9rl2lvsksb_test

- eval: E7
  run_id: mu9rl2vryvlm
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_thieu_khoa_tra_503
  verified_at: 2026-09-20T02:30:00Z
  output: |
     3 expect() calls
    Ran 2 tests across 1 file. [191.00ms]
    test-run: dropped crm_mu9rl2vryvlm_test

- eval: E8
  run_id: mu9rl392wqpw
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_doi_ten_bo_phan_khong_mat
  verified_at: 2026-09-20T02:30:00Z
  output: |
     8 expect() calls
    Ran 2 tests across 1 file. [156.00ms]
    test-run: dropped crm_mu9rl392wqpw_test

- eval: E9
  run_id: mu9rl2v207bv
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_trang_thai_chua_co_khuon
  verified_at: 2026-09-20T02:30:00Z
  output: |
     8 expect() calls
    Ran 2 tests across 1 file. [162.00ms]
    test-run: dropped crm_mu9rl2v207bv_test

- eval: E10
  run_id: minted-dieu-phoi-30-ngay-dau-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp30_hang_so_o_config
  verified_at: 2026-09-20T02:30:00Z
  output: |
    hang-so-o-config: sach — 7 tep quet, 0 ghim ngoai cau hinh, cau hinh co nguoi dung

- eval: E11
  run_id: minted-dieu-phoi-30-ngay-dau-E11-r1
  cannot_run: true
  exit_code: 2
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-20T02:30:00Z
  network_observed: n-a (driver)
  reason: |
    Cong 3300 va 3301 (dung theo launch.json api-cay-nay/app-cay-nay, ma eval E11 bat
    buoc) da bi mot tien trinh KHAC chiem: lsof -p xac nhan cwd cua tien trinh dang
    lang nghe la .../worktrees/busy-chatterjee-fc04e2/apps/app (pid 95303) va
    .../apps/api (pid 94900) — mot worktree KHAC, khong phai cay dang xet
    /Users/manh-macmini/dev/crm (nhanh feat/dieu-phoi-30-ngay-dau). Buoc 3 (CHAN
    CAY) da chay dung nhu steps yeu cau va tra chinh xac ket qua "khac-cay" cung
    exit code hai. Theo luat, khong duoc tat server minh khong tu khoi dong, va
    khong the "xu ly" cong bi chiem boi cay khac de dung dung cong cua cay dang
    xet — nen khong the tiep tuc buoc 4-8 (gieo du lieu, tao phien, mo man, chup
    anh) ma khong do sai cay hoac giet nham tien trinh cua phien khac. Day la chan
    moi truong/ha tang, khong phai loi san pham duoc cham.
  output: |
    Cay dang xet: /Users/manh-macmini/dev/crm, nhanh feat/dieu-phoi-30-ngay-dau.
    Assertion 2: lsof -i :3300 va :3301 cho thay ca hai cong DA CO server dang
    lang nghe (khong start moi, khong tat server co san).
    Assertion 3 (CHAN CAY, canh-cay.mjs): ket="khac-cay". Noi dung in ra: "may
    chu o http://127.0.0.1:3300 khong phuc vu cay dang xet ... may chu dang doc
    mot cay khac."
    Assertion 3b: lsof -p 95303 -> cwd .../worktrees/busy-chatterjee-fc04e2/apps/app;
    lsof -p 94900 -> cwd .../worktrees/busy-chatterjee-fc04e2/apps/api; curl
    http://127.0.0.1:3301/health -> 200 {"status":"ok","database":"up"} nhung la
    server cua cay worktree khac.
    Dung lai tai buoc CHAN CAY: khong gieo du lieu, khong tao phien, khong mo man,
    khong chup evidence/E11-danh-muc.png hay E11-danh-muc-768.png. Khong tat bat
    ky server nao.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu9rl1aj0gf3
  exit_code: 0
  verified_at: 2026-09-20T02:30:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-20T02:30:00Z

- cmd: bun run lint:slop
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-20T02:30:00Z

- cmd: bunx turbo run build --force
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-20T02:30:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet).

## Variance

none — every multi-run eval is uniform.

## Iterations

Round 1: 14/15 eval máy (E1–E10, E12–E15) và bốn lệnh suite hồi quy (bun run test, turbo lint, lint:slop, turbo build) đều PASS trên HEAD 38cea6a6. E11 (ui-check, AC-11) không chạy được: cổng 3300/3301 của cây đang xét bị một worktree khác (busy-chatterjee-fc04e2) chiếm dụng — chặn môi trường/hạ tầng, không phải lỗi sản phẩm. Báo cáo dừng ở BLOCKED, chưa thể kết luận AC-11.
