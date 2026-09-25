---
schema_version: 2
feature_slug: logo-onehub
verdict: REJECT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 806ef47b5df0bd0fd0b19d4d3305c717d1f0a25c
human_signoff: 
---

# Evidence Report: logo-onehub

⚠ REJECT dù mọi lệnh máy đều thoát mã 0: review phát hiện một mục **trong hợp đồng** — script của E10/AC-9 (`_acceptance/logo-onehub/rang/ranh-gioi.mjs`) chỉ khai một file (`apps/app/app/(landing)/page.tsx`) làm vùng cấm thay vì cả thư mục `apps/app/app/(landing)/` như văn bản AC-9 hứa, nên một đổi trái phép trong thư mục đó (ví dụ `sign-in/page.tsx`) sẽ không bị bắt dù script vẫn báo "DUNG" và thoát mã 0. Đây là khoảng hở đo lường thật, có ánh xạ AC, nên vòng này REJECT — không phải vì một lệnh nào thất bại (`failed_evals` rỗng theo đúng nghĩa: không có exit code khác 0). Chi tiết đầy đủ ở `review-findings.md`, mục "## Trong hợp đồng".

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
| E10 | AC-9 | script | PASS (lệnh thoát 0 — xem finding trong-hợp-đồng ở review-findings.md, khoảng hở đo lường vẫn khiến vòng REJECT) |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-logo-onehub-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test test/logo-khop-goc.spec.ts
     4 pass
     0 fail
    Ran 4 tests across 1 file. [83.00ms]

- eval: E2
  run_id: minted-logo-onehub-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test test/logo-khop-goc.spec.ts
     4 pass
     0 fail
    Ran 4 tests across 1 file. [83.00ms]

- eval: E4
  run_id: minted-logo-onehub-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test test/logo-khop-goc.spec.ts
     4 pass
     0 fail
    Ran 4 tests across 1 file. [83.00ms]

- eval: E3
  run_id: minted-logo-onehub-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/logo.dom.tsx
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [691.00ms]

- eval: E5
  run_id: minted-logo-onehub-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/logo.dom.tsx
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [691.00ms]

- eval: E6
  run_id: minted-logo-onehub-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test test/logo-icons.spec.ts
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [444.00ms]

- eval: E7
  run_id: minted-logo-onehub-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test test/logo-icons.spec.ts
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [444.00ms]

- eval: E8
  run_id: minted-logo-onehub-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test test/logo-icons.spec.ts
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [444.00ms]

- eval: E9
  run_id: minted-logo-onehub-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T09:09:07Z
  output: |
    cd packages/ui && bun test test/logo-icons.spec.ts
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [444.00ms]

- eval: E10
  run_id: minted-logo-onehub-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lgo_ranh_gioi
  verified_at: 2026-09-25T09:09:07Z
  output: |
    node _acceptance/logo-onehub/rang/ranh-gioi.mjs
    DUNG vung cam nguyen ven: packages/db/src/favicon.ts
    DUNG --primary: --primary: #006b4f;
    KET LUAN: 15 DUNG, 0 SAI — ma thoat 0

- eval: E12
  run_id: minted-logo-onehub-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types
  verified_at: 2026-09-25T09:09:07Z
  output: |
    bun run check-types
     Tasks:    13 successful, 13 total
    Cached:    11 cached, 13 total
      Time:    3.324s

- eval: E11
  run_id: minted-logo-onehub-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T09:09:07Z
  screenshot: _acceptance/logo-onehub/evidence/E11-dang-nhap-1440.png
  observed: |
    Đọc trực tiếp cả 6 file PNG vừa lưu bằng Read, đối chiếu Expected:
    - E11-dang-nhap-1440.png: nền tối, mark lục giác xanh (chim/hoa 6 cánh) + chữ "OneHub" đọc được rõ ở góc trên-trái VÀ lặp lại ở đầu form đăng nhập bên phải (2 logo, đúng >=2). Không còn mark Comp (3 vạch chéo đơn sắc) ở đâu cả.
    - E11-dang-nhap-390.png: nền tối, một logo OneHub (mark + chữ) ở đầu form, đọc được, không bị cắt/tràn ngang.
    - E11-thanh-tren-sang.png: nền sáng, mark OneHub xanh dương ở góc trái thanh trên cùng cạnh chữ "CRM".
    - E11-thanh-tren-toi.png: nền tối, cùng vị trí, cùng mark OneHub xanh dương, đổi giao diện qua localStorage theme thành công.
    - E11-agent-sang.png: trong [role="dialog"] của tab "Tác nhân" (Agent), ô vuông "Ask about this company" mang đúng mark hoa 6 cánh xanh dương (nền đen), không phải icon cũ.
    - E11-agent-toi.png: cùng ô vuông logo trong dialog ở giao diện tối, nền ô đổi màu theo theme nhưng mark vẫn là OneHub.
    Không frame nào mâu thuẫn Expected; không thấy mark Comp cũ ở bất kỳ ảnh nào; không logo nào bị cắt/tràn.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-logo-onehub-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-25T09:09:07Z

- cmd: bunx turbo run lint --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-25T09:09:07Z

- cmd: bun run lint:slop
  run_id: minted-logo-onehub-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-25T09:09:07Z

- cmd: bunx turbo run build --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-25T09:09:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (AC-3, `bun run check-types`) — xanh trên cả HEAD và baseline diff, không phân biệt tính năng: check-types vốn đã đi qua tạm cho `Logo`/`agent-scope-badges` từ trước, thay đổi lần này không làm nó đỏ trên code cũ. Giữ nguyên như một hồi quy có chủ ý (kiểu vẫn khớp `ComponentType<SVGProps>`), không phải bằng chứng cho AC-3 riêng tính năng này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 12/12 eval + 4 lệnh suite đều thoát mã 0 (không eval nào đỏ), nhưng review phát hiện một khoảng hở đo lường có ánh xạ AC (E10/AC-9: `ranh-gioi.mjs` chỉ khai một file làm vùng cấm thay vì cả thư mục `apps/app/app/(landing)/`) — verdict tổng REJECT dù không có `failed_evals`. Quay lại triển khai: mở rộng `VUNG_CAM` trong `_acceptance/logo-onehub/rang/ranh-gioi.mjs` để phủ đúng thư mục AC-9 đã hứa, rồi verify lại.
