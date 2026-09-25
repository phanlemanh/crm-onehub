---
schema_version: 2
feature_slug: logo-onehub
verdict: BLOCKED
failed_evals: []
reason: "bunx turbo run lint --force — agent chấm bị skip/chết giữa chừng ở round 3, không có kết quả nên KHÔNG được tính là pass. Mọi eval E1–E14 và các lệnh suite khác (bun run test, bun run lint:slop, bunx turbo run build --force) đều đã PASS trước khi tới lệnh này; chỉ riêng lệnh này không có run_id/log nào được ghi."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fa802328c677fc30318f269aa7dc49ef7b4816aa
human_signoff:
---

# Evidence Report: logo-onehub

⚠ Round 3 — verdict BLOCKED: lệnh `bunx turbo run lint --force` không hoàn tất (agent chấm bị skip/chết), nên vòng này KHÔNG đủ điều kiện lên PASS dù mọi eval và mọi lệnh suite khác đều xanh. Xem `reason` ở frontmatter và mục Iterations.

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
| E13 | AC-11 | script | PASS |
| E14 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-logo-onehub-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test test/logo-khop-goc.spec.ts
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [143.00ms]

- eval: E2
  run_id: minted-logo-onehub-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test test/logo-khop-goc.spec.ts
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [143.00ms]

- eval: E4
  run_id: minted-logo-onehub-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test test/logo-khop-goc.spec.ts
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [143.00ms]

- eval: E3
  run_id: minted-logo-onehub-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/logo.dom.tsx
  output: |
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [595.00ms]

- eval: E5
  run_id: minted-logo-onehub-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/logo.dom.tsx
  output: |
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [595.00ms]

- eval: E6
  run_id: minted-logo-onehub-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test test/logo-icons.spec.ts
  output: |
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [327.00ms]

- eval: E7
  run_id: minted-logo-onehub-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test test/logo-icons.spec.ts
  output: |
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [327.00ms]

- eval: E8
  run_id: minted-logo-onehub-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test test/logo-icons.spec.ts
  output: |
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [327.00ms]

- eval: E9
  run_id: minted-logo-onehub-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T10:04:47Z
  cmd: cd packages/ui && bun test test/logo-icons.spec.ts
  output: |
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [327.00ms]

- eval: E10
  run_id: minted-logo-onehub-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lgo_ranh_gioi
  verified_at: 2026-09-25T10:04:47Z
  cmd: node _acceptance/logo-onehub/rang/ranh-gioi.mjs
  output: |
    DUNG vung cam nguyen ven: packages/db/src/favicon.ts
    DUNG --primary: --primary: #006b4f;
    KET LUAN: 14 DUNG, 0 SAI — ma thoat 0

- eval: E12
  run_id: minted-logo-onehub-E12-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types
  verified_at: 2026-09-25T10:04:47Z
  cmd: bun run check-types
  output: |
     Tasks:    13 successful, 13 total
    Cached:    13 cached, 13 total
      Time:    35ms >>> FULL TURBO

- eval: E13
  run_id: minted-logo-onehub-E13-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T10:04:47Z
  cmd: APP_URL=http://localhost:3300 API_URL=http://localhost:3301 NGUOI=ada@trycomp.ai bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/logo-onehub/rang/chup.mjs"
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E14
  run_id: minted-logo-onehub-E14-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lgo_o_agent
  verified_at: 2026-09-25T10:04:47Z
  cmd: node _acceptance/logo-onehub/rang/o-agent.mjs
  output: |
    DUNG AgentAvatar: khong o bg-foreground quanh logo
    DUNG AgentAvatar: logo la con dau tien cua MessageAvatar
    KET LUAN: 4 DUNG, 0 SAI — ma thoat 0

- eval: E11
  run_id: minted-logo-onehub-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T10:04:47Z
  screenshot: _acceptance/logo-onehub/evidence/E11-dang-nhap-1440.png
  observed: |
    Đã đọc trực tiếp cả 6 file ảnh evidence bằng Read tool và đối chiếu bằng mắt với Expected:
    - E11-dang-nhap-1440.png: mark lục giác (hexagon hoa) xanh dương thấy ở góc trên-trái (đen) VÀ ở đầu form đăng nhập bên phải (nền tối) — 2 lockup "OneHub" đọc rõ chữ trên nền tối, không cắt/tràn, không còn mark ba-vạch-chéo cũ của Comp.
    - E11-dang-nhap-390.png: 1 lockup "OneHub" ở đầu form, chữ đọc rõ trên nền đen, không cắt/tràn.
    - E11-thanh-tren-sang.png: mark hexagon xanh ở góc trái thanh trên cùng (nền sáng), rõ ràng, không tràn.
    - E11-thanh-tren-toi.png: mark hexagon xanh ở góc trái thanh trên cùng (nền tối), rõ ràng, không tràn.
    - E11-agent-sang.png: mark hexagon xanh nằm giữa ô vuông "Ask about this company" trong [role=dialog] tab Tác nhân/Agent (nền sáng) — không có ô nền đen quanh logo, đúng phương án B đã fix ở commit 4ea8dbdf.
    - E11-agent-toi.png: cùng vị trí, nền tối, mark hexagon xanh rõ, không có ô nền đen quanh logo.
    Không frame nào mâu thuẫn Expected. Không thấy dấu hiệu logo Comp cũ (ba vạch chéo đơn sắc) ở bất kỳ đâu.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-logo-onehub-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-25T10:04:47Z

- cmd: bun run lint:slop
  run_id: minted-logo-onehub-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-25T10:04:47Z

- cmd: bunx turbo run build --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-25T10:04:47Z

- cmd: bunx turbo run lint --force
  Lệnh này KHÔNG có khối bằng chứng: agent chấm bị skip/chết trước khi lệnh chạy xong, không có run_id nào được ghi trong run-log.jsonl cho lệnh này. Đây là lý do toàn bộ round mang verdict BLOCKED (xem `reason` ở frontmatter).

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (bun run check-types) — baseline: green, nghĩa là lệnh này xanh trên CẢ HEAD lẫn diffBase, không phân biệt được feature. Đây là quy luật kiểu dữ liệu sẵn có cho các nơi gọi Logo (ComponentType<SVGProps>) chứ không phải hành vi mới của logo-onehub — nên coi là regression-guard có chủ ý cho tầng kiểu dữ liệu, hoặc viết lại một ca riêng khẳng định rõ props mới của Logo nếu muốn eval này tự phân biệt.

## Variance

none — every multi-run eval is uniform (không eval nào khai `runs` > 1 ở round này).

## Iterations

Round 3 (lần trước): BLOCKED — bước E11 chạy thẳng `chup.mjs`, bỏ qua bước ghi nguyên văn lệnh `lgo_chup` theo cấu hình; đã sửa ở commit fa802328.
Round 3 (lần này): BLOCKED — lệnh suite `bunx turbo run lint --force` không có kết quả vì agent chấm bị skip/chết; toàn bộ E1–E14 cùng ba lệnh suite còn lại (test, lint:slop, build) đều đã PASS, không quay lại implementation, chỉ cần chạy lại đúng lệnh này.