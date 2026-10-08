---
schema_version: 2
feature_slug: logo-onehub
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: beac40ab8472f735a5e7ecc79a03ae01ea1d37cf
human_signoff: Phan Le Manh 2026-09-25
---

# Evidence Report: logo-onehub

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
| E15 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-logo-onehub-E1-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T11:41:23Z
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [137.00ms]

- eval: E2
  run_id: minted-logo-onehub-E2-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T11:41:23Z
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [137.00ms]

- eval: E4
  run_id: minted-logo-onehub-E4-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_khop_goc
  verified_at: 2026-09-25T11:41:23Z
  output: |
     4 pass
     0 fail
    Ran 4 tests across 1 file. [137.00ms]

- eval: E3
  run_id: minted-logo-onehub-E3-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T11:41:23Z
  output: |
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [452.00ms]

- eval: E5
  run_id: minted-logo-onehub-E5-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_thanh_phan
  verified_at: 2026-09-25T11:41:23Z
  output: |
     0 fail
     8 expect() calls
    Ran 7 tests across 1 file. [452.00ms]

- eval: E6
  run_id: minted-logo-onehub-E6-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T11:41:23Z
  output: |
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [222.00ms]

- eval: E7
  run_id: minted-logo-onehub-E7-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T11:41:23Z
  output: |
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [222.00ms]

- eval: E8
  run_id: minted-logo-onehub-E8-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T11:41:23Z
  output: |
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [222.00ms]

- eval: E9
  run_id: minted-logo-onehub-E9-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lgo_bo_icon
  verified_at: 2026-09-25T11:41:23Z
  output: |
     0 fail
     3 expect() calls
    Ran 11 tests across 1 file. [222.00ms]

- eval: E10
  run_id: minted-logo-onehub-E10-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lgo_ranh_gioi
  verified_at: 2026-09-25T11:41:23Z
  output: |
    DUNG vung cam nguyen ven: packages/db/src/favicon.ts
    DUNG --primary: --primary: #006b4f;
    KET LUAN: 14 DUNG, 0 SAI — ma thoat 0

- eval: E11
  run_id: minted-logo-onehub-E11-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T11:41:23Z
  screenshot: _acceptance/logo-onehub/evidence/E11-dang-nhap-1440.png
  observed: |
    Đã mở và xem trực tiếp cả 6 frame PNG bằng Read (không suy từ trí nhớ lệnh):
    - E11-dang-nhap-1440.png (2880x1800): góc trên-trái nền tối có mark lục giác/hoa sáu cánh màu xanh dương gradient + chữ "OneHub" cạnh nó; đầu form đăng nhập bên phải cũng có cùng mark + chữ "OneHub" đọc rõ trên nền tối. Không thấy mark cũ của Comp (ba vạch chéo). Không logo nào bị cắt/tràn.
    - E11-dang-nhap-390.png (780x1800, không phiên): đầu form có mark xanh + chữ "OneHub" đọc rõ trên nền tối, không cắt/tràn, không mark Comp cũ.
    - E11-thanh-tren-sang.png (giao diện sáng): thanh trên cùng góc trái có mark OneHub xanh dương cạnh chữ "CRM", không mark Comp cũ.
    - E11-thanh-tren-toi.png (giao diện tối): tương tự, mark OneHub xanh dương rõ trên nền tối.
    - E11-agent-sang.png: tab Agent (trong [role="dialog"], khung "Ask about this company") hiện ô vuông mark OneHub xanh dương ở giữa, không có khối nền/ô tô quanh logo, không cắt.
    - E11-agent-toi.png: tương tự ở giao diện tối, mark OneHub hiện rõ, không nền phụ quanh logo, không cắt.
    Tất cả 6 frame khớp Expected: mark lục giác xanh xuất hiện đúng bốn chỗ (góc-trái/đầu form đăng nhập, thanh trên, ô vuông tab Agent), chữ OneHub đọc được ở 1440 và 390, không còn mark ba vạch chéo của Comp, không logo nào bị cắt hay tràn.
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver dùng ở đây là Bash chạy mot-luot.sh (nội bộ dùng puppeteer-core độc lập), không phải browser tool có đường đọc network trong phiên verifier này (không dùng mcp__Claude_Browser/claude-in-chrome để lái) → networkObserved = "n-a (driver)". Không dump evidence/E11-network.txt vì không có kênh đọc network trong phiên này cho driver này; giá trị n-a không làm eval fail theo luật đã khai.
    Không có lệnh nào bị công cụ giết hay cắt output; không cần BLOCKED.

- eval: E12
  run_id: minted-logo-onehub-E12-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types
  verified_at: 2026-09-25T11:41:23Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    11 cached, 13 total
      Time:    2.949s

- eval: E13
  run_id: minted-logo-onehub-E13-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T11:41:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E15
  run_id: minted-logo-onehub-E15-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lgo_chup
  verified_at: 2026-09-25T11:41:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E14
  run_id: minted-logo-onehub-E14-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lgo_o_agent
  verified_at: 2026-09-25T11:41:23Z
  output: |
    DUNG AgentAvatar: MessageAvatar vuong
    DUNG AgentAvatar: logo la con dau tien cua MessageAvatar
    KET LUAN: 5 DUNG, 0 SAI — ma thoat 0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-logo-onehub-SUITE-bun_run_test-r5
  exit_code: 0
  verified_at: 2026-09-25T11:41:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-09-25T11:41:23Z

- cmd: bun run lint:slop
  run_id: minted-logo-onehub-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-09-25T11:41:23Z

- cmd: bunx turbo run build --force
  run_id: minted-logo-onehub-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-09-25T11:41:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (bun run check-types) — xanh trên cả HEAD lẫn baseline diffBase, nên không phân biệt tính năng; đây là regression-guard có chủ ý cho phần khớp kiểu của Logo/agent-scope-badges (ComponentType<SVGProps>), không phải bằng chứng riêng cho hành vi mới của round này.

## Variance

none — không có eval nào khai `runs` > 1; mọi eval là deterministic (runs=1) và không dao động qua các lần chạy được ghi nhận.

## Iterations

Round 4: REJECT — E9 đỏ giả vì làn chụp song song ghi đè dấu vết git status; sửa phép đo E9 sang so sánh sha256 nội dung bảy tệp icon đích thay vì git status.
Round 5: chủ kho ký cho phép chạy tiếp trên hợp đồng đã ở trạng thái implemented; toàn bộ eval máy, lệnh suite hồi quy và ui-check đều PASS, không phát sinh REJECT mới.

### Re-pin lần 1 — 2026-09-25, do hoá cũ do gộp onehub 739c8701 (#139, #140) để giải xung đột PR #141
run_id: repin-20260925T140435Z-71954
sha: 77c4aea3309e79b3228469cd79e8029037755757 · suites: 4 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E11 · diff chạm vật đo ngoài làn máy: E11 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10

### Re-pin lần 2 — 2026-10-08, do gộp onehub sau chữ ký Cổng 2 của khung-ban-ghi-kara; eval của the-gop-y-okr, logo-onehub, nen-kara bị thay hay sửa ở vòng này
run_id: repin-20261008T004656Z-80562
sha: beac40ab8472f735a5e7ecc79a03ae01ea1d37cf · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E13, E14 · thay bởi hồ sơ đã ký: E13→khung-ban-ghi-kara#AC-1, E14→khung-ban-ghi-kara#AC-1 · ngoài làn máy: E11 · diff chạm vật đo ngoài làn máy: E11 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
