---
schema_version: 2
feature_slug: so-moi-khong-chap-chon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 40eef7f68ba199fc1a466c4c7b70c99873e72de5
human_signoff: Phan Le Manh 2026-10-07
---

# Evidence Report: so-moi-khong-chap-chon

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2 | test | PASS |
| E2 | AC-2, AC-3 | script | PASS |
| E3 | AC-3, AC-4 | script | PASS |
| E4 | AC-2, AC-5 | judgment | PASS |
| E5 | AC-6 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-so-moi-khong-chap-chon-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nbn_ca_tep
  verified_at: 2026-10-07T13:38:53Z
  output: |
    test-run: dropped crm_muy5mdxs8xc7_test

- eval: E2
  run_id: minted-so-moi-khong-chap-chon-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.smk_va_cham_xanh
  verified_at: 2026-10-07T13:38:53Z
  output: |
    agent: /Users/manh-macmini/dev/crm/.claude/worktrees/quirky-lalande-20ab9d/apps/agent-okr/agent
    RANG-VA-CHAM 37,41,100,2031; spec moi xanh tren fixture va cham

- eval: E3
  run_id: minted-so-moi-khong-chap-chon-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.smk_va_cham_do
  verified_at: 2026-10-07T13:38:53Z
  output: |
    so-moi đọc mọi chữ gói: do dung

- eval: E4
  judged_by: judge panel (3 lens, fresh context)
  verdict: PASS
  rationale: Ba lens cùng xác nhận bốn bài giữ nguyên mọi khẳng định và phép so so với bản ghim; số thử chọn từ gói của đúng cuộc nộp vào qua soVangKhoiGoi, không còn số cứng đứng làm số vắng.
  votes:
    - domain-correctness: PASS — bốn bài giữ nguyên khẳng định (k13 bị loại so-moi với soDong 5; m3 bị loại trước khi gõ và được nhận sau khi gõ; đúng một dòng k3 với viPham số mới, soDong 3); không đổi sang phép yếu hơn, không thêm skip/retry/timeout. Số thử chọn bằng soVangKhoiGoi theo cuộc đúng. Lưu ý của judge: không đọc được goi-soan nên chưa kiểm kiểu soTrongGoi.
    - operational-feasibility: PASS — mọi toBe/toEqual giữ nguyên, SO_NGUOI_GO đã xoá, các hằng 100/37/41/2031 chỉ còn là số gợi ý trong GOI_Y. Lưu ý của judge: giả định soTrongGoi là Set<string>; AC-3 và AC-4 kiểm điều này bằng cách chạy.
    - spec-alignment: PASS — diff với bản ghim chỉ thêm import goiSoan/goiKiemTu, hàm soVangKhoiGoi và thay các chỗ dùng số vắng; bài 1 và 2 dùng canh.cuocSoanId, bài 3 và 4 dùng cuoc.id mới.
  human_override:  # chi nguoi ghi

- eval: E5
  run_id: minted-so-moi-khong-chap-chon-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nbn_dao_thu_tu_xanh
  verified_at: 2026-10-07T13:38:53Z
  output: |
    dich: 3 dong da xep lai thu tu vat ly; bo chon moi: 2 pass, 0 fail

- eval: E6
  run_id: minted-so-moi-khong-chap-chon-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nbn_dao_thu_tu_do
  verified_at: 2026-10-07T13:38:53Z
  output: |
    dich: 3 dong da xep lai thu tu vat ly; bo chon cu do dung chu ky: dich("m3:cc") doc dong can chinh cu: Received co "id-la"

- eval: E7
  run_id: minted-so-moi-khong-chap-chon-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nbn_quet_mau
  verified_at: 2026-10-07T13:38:53Z
  output: |
    cay that khop tung cho voi danh sach da ra

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-so-moi-khong-chap-chon-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-07T13:38:53Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-moi-khong-chap-chon-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-07T13:38:53Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-moi-khong-chap-chon-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-07T13:38:53Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-moi-khong-chap-chon-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-07T13:38:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-moi-khong-chap-chon-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-07T13:38:53Z

- cmd: bun run lint:slop
  run_id: minted-so-moi-khong-chap-chon-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-07T13:38:53Z

- cmd: bunx turbo run build --force
  run_id: minted-so-moi-khong-chap-chon-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-07T13:38:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval xanh trên cả HEAD lẫn baseline (không phân biệt được — chứng minh harness, không chứng minh tính năng; đây là regression-guard có chủ ý hoặc cần viết lại để assert hành vi mới):

- E1 (AC-1, AC-2): ca tệp nop-ban-nhap.integration.spec.ts xanh cả hai phía; chiều đỏ của cùng lệnh này là E3.
- E5 (AC-6): rang đảo thứ tự của hồ sơ nop-ban-nhap-chon-theo-khoa, chiều xanh, xanh cả hai phía.
- E6 (AC-6): cùng rang, chiều đỏ, baseline green.
- E7 (AC-6): quét mẫu danh sách chỗ đọc, baseline green.

Các eval của tính năng phân biệt được (baseline red): E2, E3.

## Variance

none — mọi eval chạy một lượt, xác định, không có phương sai.

## Iterations

Round 1: mọi eval và lệnh suite xanh, E4 do hội đồng chấm PASS. Verdict PASS.

