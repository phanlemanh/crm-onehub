---
schema_version: 2
feature_slug: logo-onehub
verdict: REJECT
failed_evals: [E6, E7, E8, E9]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ba2acd7f46683c6ba088a02881fe77b6311bcbe1
human_signoff:
---

# Evidence Report: logo-onehub

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | FAIL |
| E7 | AC-6 | test | FAIL |
| E8 | AC-7 | test | FAIL |
| E9 | AC-8 | test | FAIL |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-3 | script | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-11 | script | PASS |
| E15 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-logo-onehub-E1-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T10:29:57Z
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [187.00ms]

- eval: E2
  run_id: minted-logo-onehub-E2-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T10:29:57Z
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [187.00ms]

- eval: E3
  run_id: minted-logo-onehub-E3-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T10:29:57Z
  output: |
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [623.00ms]

- eval: E4
  run_id: minted-logo-onehub-E4-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T10:29:57Z
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [187.00ms]

- eval: E5
  run_id: minted-logo-onehub-E5-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T10:29:57Z
  output: |
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [623.00ms]

- eval: E6
  run_id: minted-logo-onehub-E6-r4
  exit_code: 1
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T10:29:57Z
  output: |
    error: git status cua kho doi sau luot xuat ngoai
          at dat (packages/ui/test/logo-raster.ts:36:27)
          at <anonymous> (packages/ui/test/logo-icons.spec.ts:226:4)
    (fail) xuat-ngoai > xuat-ngoai: ba anh dung co vao thu muc ngoai kho, kho khong doi [170.66ms]

     10 pass
     1 fail
     3 expect() calls
    Ran 11 tests across 1 file. [417.00ms]

- eval: E7
  run_id: minted-logo-onehub-E7-r4
  exit_code: 1
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T10:29:57Z
  output: |
    error: git status cua kho doi sau luot xuat ngoai
          at dat (packages/ui/test/logo-raster.ts:36:27)
          at <anonymous> (packages/ui/test/logo-icons.spec.ts:226:4)
    (fail) xuat-ngoai > xuat-ngoai: ba anh dung co vao thu muc ngoai kho, kho khong doi [170.66ms]

     10 pass
     1 fail
     3 expect() calls
    Ran 11 tests across 1 file. [417.00ms]

- eval: E8
  run_id: minted-logo-onehub-E8-r4
  exit_code: 1
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T10:29:57Z
  output: |
    error: git status cua kho doi sau luot xuat ngoai
          at dat (packages/ui/test/logo-raster.ts:36:27)
          at <anonymous> (packages/ui/test/logo-icons.spec.ts:226:4)
    (fail) xuat-ngoai > xuat-ngoai: ba anh dung co vao thu muc ngoai kho, kho khong doi [170.66ms]

     10 pass
     1 fail
     3 expect() calls
    Ran 11 tests across 1 file. [417.00ms]

- eval: E9
  run_id: minted-logo-onehub-E9-r4
  exit_code: 1
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T10:29:57Z
  output: |
    error: git status cua kho doi sau luot xuat ngoai
          at dat (packages/ui/test/logo-raster.ts:36:27)
          at <anonymous> (packages/ui/test/logo-icons.spec.ts:226:4)
    (fail) xuat-ngoai > xuat-ngoai: ba anh dung co vao thu muc ngoai kho, kho khong doi [170.66ms]

     10 pass
     1 fail
     3 expect() calls
    Ran 11 tests across 1 file. [417.00ms]

- eval: E10
  run_id: minted-logo-onehub-E10-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lgo_ranh_gioi
  verified_at: 2026-09-25T10:29:57Z
  output: |
    DUNG vung cam nguyen ven: packages/db/src/favicon.ts
    DUNG --primary: --primary: #006b4f;
    KET LUAN: 14 DUNG, 0 SAI — ma thoat 0

- eval: E11
  run_id: minted-logo-onehub-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T10:29:57Z
  screenshot: _acceptance/logo-onehub/evidence/E11-dang-nhap-1440.png
  observed: |
    Đã mở và đọc bằng mắt cả 6 frame E11 vừa lưu, đối chiếu Expected:
    - E11-dang-nhap-1440.png (1440, không phiên): mark lục giác xanh dương ở góc trên-trái (cạnh "OneHub") và lặp lại ở đầu form đăng nhập bên phải ("OneHub" + "Mừng bạn quay lại"); chữ "OneHub" đọc rõ trên nền tối; không thấy mark ba-vạch-chéo cũ của Comp; không logo nào bị cắt/tràn.
    - E11-dang-nhap-390.png (390, không phiên): cùng mark lục giác xanh dương ở đầu form đăng nhập, chữ "OneHub" đọc rõ trên nền tối ở khổ hẹp; không mark cũ; không cắt/tràn.
    - E11-thanh-tren-sang.png: mark lục giác xanh dương ở góc trên-trái thanh trên (cạnh chữ "CRM"), giao diện sáng; không mark cũ.
    - E11-thanh-tren-toi.png: cùng vị trí, giao diện tối, mark vẫn rõ hai tông xanh dương; không mark cũ.
    - E11-agent-sang.png: trong hộp thoại (role=dialog) tab "Tác nhân", ô vuông giữa màn hiển thị mark lục giác xanh dương lớn phía trên dòng "Ask about this company", giao diện sáng; không mark cũ; logo không bị che bởi lớp phủ nào.
    - E11-agent-toi.png: cùng vị trí và kích thước mark, giao diện tối; không mark cũ.
    Tất cả khớp Expected: không còn dấu vết mark Comp cũ, chữ OneHub đọc được ở cả 1440 và 390, không logo nào bị cắt/tràn.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-logo-onehub-E12-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types
  verified_at: 2026-09-25T10:29:57Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    13 cached, 13 total
      Time:    60ms >>> FULL TURBO

- eval: E13
  run_id: minted-logo-onehub-E13-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T10:29:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E14
  run_id: minted-logo-onehub-E14-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lgo_o_agent
  verified_at: 2026-09-25T10:29:57Z
  output: |
    DUNG AgentAvatar: MessageAvatar vuong
    DUNG AgentAvatar: logo la con dau tien cua MessageAvatar
    KET LUAN: 5 DUNG, 0 SAI — ma thoat 0

- eval: E15
  run_id: minted-logo-onehub-E15-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T10:29:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-logo-onehub-SUITE-bun_run_test-r4
  exit_code: 0
  verified_at: 2026-09-25T10:29:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-25T10:29:57Z

- cmd: bun run lint:slop
  run_id: minted-logo-onehub-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-25T10:29:57Z

- cmd: bunx turbo run build --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-25T10:29:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (`bun run check-types`) — pass trên cả HEAD lẫn baseline diffBase; xác nhận wiring kiểu dữ liệu cho props Logo mới (ComponentType<SVGProps>) không đổi, không phải bằng chứng phân biệt tính năng. Cân nhắc viết lại để assert hành vi mới của Logo, hoặc xác nhận đây là regression-guard có chủ ý và giữ nguyên.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 3: BLOCKED tại lint (agent chết giữa vòng) — mọi eval khác đã xanh trước khi bị chặn; thẻ Cổng Bằng chứng khoá vì cạnh gãy (AC-11, ảnh đại diện trợ lý chưa vuông).
Round 4: E6, E7, E8, E9 fail trên `cd packages/ui && bun test test/logo-icons.spec.ts` (exit 1) — ca `xuat-ngoai` báo "git status cua kho doi sau luot xuat ngoai" tại `logo-raster.ts:36:27`/`logo-icons.spec.ts:226:4`; các eval còn lại (E1–E5, E10–E15) xanh, cả bốn lệnh suite hồi quy và `check-types` cũng xanh. Verdict: REJECT.
