---
schema_version: 2
feature_slug: logo-onehub
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8aa296c7026ea33a778796170a34953c1c40e723
human_signoff: 
---

# Evidence Report: logo-onehub

Round 2: khoảng hở đo lường AC-9/E10 phát hiện ở round 1 (script chỉ khai một file làm vùng cấm thay vì cả thư mục `apps/app/app/(landing)/`) đã được vá; review round này không tìm thấy finding trong-hợp-đồng nào sống sót. Một finding ngoài-hợp-đồng mới (rename blind-spot trong `ranh-gioi.mjs`) và bốn finding ngoài-hợp-đồng cũ từ round 1 được chuyển nguyên vào `review-findings.md` cho người quyết ở Cổng Bằng chứng.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-logo-onehub-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test test/logo-khop-goc.spec.ts
     4 pass
     0 fail
    Ran 4 tests across 1 file. [80.00ms]

- eval: E2
  run_id: minted-logo-onehub-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test test/logo-khop-goc.spec.ts
     4 pass
     0 fail
    Ran 4 tests across 1 file. [80.00ms]

- eval: E4
  run_id: minted-logo-onehub-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test test/logo-khop-goc.spec.ts
     4 pass
     0 fail
    Ran 4 tests across 1 file. [80.00ms]

- eval: E3
  run_id: minted-logo-onehub-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/logo.dom.tsx
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [533.00ms]

- eval: E5
  run_id: minted-logo-onehub-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/logo.dom.tsx
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [533.00ms]

- eval: E6
  run_id: minted-logo-onehub-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test test/logo-icons.spec.ts
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [386.00ms]

- eval: E7
  run_id: minted-logo-onehub-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test test/logo-icons.spec.ts
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [386.00ms]

- eval: E8
  run_id: minted-logo-onehub-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test test/logo-icons.spec.ts
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [386.00ms]

- eval: E9
  run_id: minted-logo-onehub-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T09:23:19Z
  output: |
    cd packages/ui && bun test test/logo-icons.spec.ts
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [386.00ms]

- eval: E10
  run_id: minted-logo-onehub-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lgo_ranh_gioi
  verified_at: 2026-09-25T09:23:19Z
  output: |
    node _acceptance/logo-onehub/rang/ranh-gioi.mjs
    DUNG vung cam nguyen ven: packages/db/src/favicon.ts
    DUNG --primary: --primary: #006b4f;
    KET LUAN: 15 DUNG, 0 SAI — ma thoat 0

- eval: E12
  run_id: minted-logo-onehub-E12-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types
  verified_at: 2026-09-25T09:23:19Z
  output: |
    bun run check-types
     Tasks:    13 successful, 13 total
    Cached:    13 cached, 13 total
      Time:    32ms >>> FULL TURBO

- eval: E11
  run_id: minted-logo-onehub-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T09:23:19Z
  screenshot: _acceptance/logo-onehub/evidence/E11-dang-nhap-1440.png
  observed: |
    6 frame doc bang Read, doi chieu Expected:
    1) E11-dang-nhap-1440.png (trang /sign-in, 1440px): mark sau-luc-giac dai xanh + chu "OneHub" o goc tren-trai VA o dau form dang nhap ben phai (2 cho, dung >=2). Chu "OneHub" doc ro tren nen toi ca hai vi tri. Khong thay hinh ba vach cheo don sac (mark Comp cu). Khong tran/cat.
    2) E11-dang-nhap-390.png (trang /sign-in, 390px): chi con 1 logo o dau form (dung — o mobile khong co logo goc tren-trai), chu "OneHub" doc ro tren nen toi. Khong mark Comp cu, khong tran.
    3) E11-thanh-tren-sang.png (thanh tren /crm, giao dien sang): mark sau-luc-giac xanh + chu OneHub o goc tren-trai thanh dieu huong, nen trang. Dung 1 logo, khong mark Comp.
    4) E11-thanh-tren-toi.png (cung trang, giao dien toi): cung mark xanh ro tren nen den, dung nhu ban sang.
    5) E11-agent-sang.png (tab Agent, dialog "Ask about this company", nen sang): o vuong placeholder giua man hien mark sau-luc-giac xanh tren nen den nho (icon), ro net, khong phai icon/mark cu.
    6) E11-agent-toi.png (cung tab Agent, giao dien toi): o vuong placeholder hien mark xanh tren nen trang nho (dao mau theo theme), van la logo OneHub, khong phai mark cu.
    Ca 6 anh deu la trang dich dung (URL/tab dung yeu cau), khong logo nao bi cat/tran, khong con dau vet mark Comp ba-vach-cheo o bat ky anh nao.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-logo-onehub-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-25T09:23:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-25T09:23:19Z

- cmd: bun run lint:slop
  run_id: minted-logo-onehub-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-25T09:23:19Z

- cmd: bunx turbo run build --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-25T09:23:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (AC-3, `bun run check-types`) — xanh trên cả HEAD và baseline diff, không phân biệt tính năng: check-types vốn đã đi qua tạm cho `Logo`/`agent-scope-badges` từ trước, thay đổi lần này không làm nó đỏ trên code cũ. Giữ nguyên như một hồi quy có chủ ý (kiểu vẫn khớp `ComponentType<SVGProps>`), không phải bằng chứng riêng cho AC-3 của tính năng này.

## Variance

none — không có eval nào chạy nhiều lần (mọi eval đều runs=1, không có pass_rate)

## Iterations

Round 1: 12/12 eval + 4 lệnh suite đều thoát mã 0 (không eval nào đỏ), nhưng review phát hiện một khoảng hở đo lường có ánh xạ AC (E10/AC-9: `ranh-gioi.mjs` chỉ khai một file làm vùng cấm thay vì cả thư mục `apps/app/app/(landing)/`) — verdict tổng REJECT dù không có `failed_evals`. Quay lại triển khai: mở rộng `VUNG_CAM` trong `_acceptance/logo-onehub/rang/ranh-gioi.mjs` để phủ đúng thư mục AC-9 đã hứa, rồi verify lại.
Round 2: 12/12 eval + 4 lệnh suite đều thoát mã 0; `VUNG_CAM` đã mở rộng phủ đúng thư mục `apps/app/app/(landing)/` nên finding trong-hợp-đồng của round 1 không tái diễn — review round này không còn finding trong-hợp-đồng nào. Verdict tổng PASS; một finding ngoài-hợp-đồng mới (rename blind-spot trong `ranh-gioi.mjs`, xem `review-findings.md`) cùng bốn finding ngoài-hợp-đồng cũ từ round 1 chuyển sang Cổng Bằng chứng cho người quyết.
