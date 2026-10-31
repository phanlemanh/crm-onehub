---
schema_version: 2
feature_slug: hex-trang-gioi-thieu
verdict: REJECT
failed_evals: ["E2","E3","E4","E5"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bdeba959ea2ee660c0cbd9e6c7667697f19b3fce
human_signoff:
---

# Evidence Report: hex-trang-gioi-thieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | FAIL |
| E3 | AC-3 | script | FAIL |
| E4 | AC-4 | script | FAIL |
| E5 | AC-5 | script | FAIL |
| E6 | AC-6 | ui-check | PASS |

Vòng 1: E2, E3, E4, E5 chạy chung một lệnh (`man.mjs` qua `tien-de.mjs`). Lệnh kết thúc mã 2 vì thiếu mặt nạ của E6 (xem Iterations). Mọi dòng đo của E2 đến E5 in ra DUNG, nhưng máy tính theo mã thoát của lệnh nên bốn eval này đỏ.

## Evidence

- eval: E1
  run_id: minted-hex-trang-gioi-thieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htg_hex
  verified_at: 2026-10-31T12:23:47Z
  output: |
    HEX 0 CHO (22 tep)

- eval: E2
  run_id: minted-hex-trang-gioi-thieu-E2-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:23:47Z
  output: |
    E2 DUNG 1 nhan BUILT WITH (color = var(--muted-foreground))
    E2 DUNG 2 nhan SUGGESTED (color = var(--muted-foreground))
    E2 DUNG 3 nen o hoi (background-color = var(--muted))
    E2 DUNG 4 chu goi y trong o hoi (color = var(--muted-foreground))
    E2 DUNG 5 nhan mono WHY (color = var(--muted-foreground))
    E2 DUNG 6 cham viec chua toi (background-color = var(--border))
    E2 DUNG 7 han viec (color = var(--muted-foreground))
    E2 DUNG 8 vong nen cua vong quay (stroke = var(--border))
    E2 DUNG 9 ngoi sao GitHub (color = var(--warning))
    E2 DUNG 10 vien khung soan (border-top-color = var(--border))
    E2 DUNG 11 lenh /Create agent (color = var(--code-string))
    KHONG DO DUOC: thieu mat na .acceptance-runs/hex-trang-gioi-thieu/anh/truoc-mat-1280.json (chup bang HTG_TRUOC=1)

- eval: E3
  run_id: minted-hex-trang-gioi-thieu-E3-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:23:47Z
  output: |
    E3 DUNG nhan BUILT WITH 8.13:1
    E3 DUNG nhan SUGGESTED 7.66:1
    E3 DUNG chu goi y trong o hoi 6.74:1
    E3 DUNG nhan mono WHY 7.66:1
    E3 DUNG han viec 7.66:1
    E3 DUNG lenh /Create agent 7.48:1
    KHONG DO DUOC: thieu mat na truoc-mat-1280.json (chup bang HTG_TRUOC=1)

- eval: E4
  run_id: minted-hex-trang-gioi-thieu-E4-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:23:47Z
  output: |
    E4 DUNG nen-sang=nen-toi 1280: 0 diem khac
    KHONG DO DUOC: thieu mat na truoc-mat-1280.json (chup bang HTG_TRUOC=1)
    Khong co dong nao cho kho 375 trong phan duoi cua lenh.

- eval: E5
  run_id: minted-hex-trang-gioi-thieu-E5-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:23:47Z
  output: |
    E5 DUNG "What do they sell?" rgba(161,161,161,1.000)(muted) -> "What do they do?" rgba(237,237,237,1.000)(foreground)
    KHONG DO DUOC: thieu mat na truoc-mat-1280.json (chup bang HTG_TRUOC=1)

- eval: E6
  run_id: minted-hex-trang-gioi-thieu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:23:47Z
  screenshot: evidence/sau-1280.png
  observed: |
    sau-1280.png (1280x4127) và truoc-1280.png: cung bo cuc, nen toi, hero "The CRM built for Agents", khung Comp AI, muc "What it actually does", footer, giong het nhau bang mat. Khac biet nho o o soan: lenh "/Create agent" o anh sau xanh sang ro hon, nhan nho (vd Suggested actions, SUGGESTED) sang hon chut. sau-375.png (375x5116) va truoc-375.png: giong het nhau, chi "/Create agent" xanh sang hon o anh sau. Khop Expected: chi cac cho doi mau, khong gi khac. Chua phan biet rieng sao cam bang mat o do phan giai hien thi, nhung script so tung diem bao 0 diem khac ngoai mat na.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-31T12:23:47Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-31T12:23:47Z
  output: |
    @crm/ui:test: error: không thấy --diff-them trong :root
    @crm/ui:test:       at giaTri (packages/ui/test/diff-trang.dom.tsx:204:65)
    @crm/ui:test: (fail) token --diff-them, --diff-bo > diff-them ở :root đạt 3:1 với nền trang và nền thẻ
    @crm/ui:test: error: không thấy --diff-bo trong :root
    @crm/ui:test: (fail) token --diff-them, --diff-bo > diff-bo ở :root đạt 3:1 với nền trang và nền thẻ
    @crm/ui:test:  15 pass
    @crm/ui:test:  2 fail
    @crm/ui:test: chay-dom: test/diff-trang.dom.tsx đỏ (mã 1) sau 0.5 s
    Failed:    @crm/ui#test

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-31T12:23:47Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-31T12:23:47Z

- cmd: bunx turbo run lint --force
  run_id: minted-hex-trang-gioi-thieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-31T12:23:47Z

- cmd: bun run lint:slop
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-31T12:23:47Z

- cmd: bunx turbo run build --force
  run_id: minted-hex-trang-gioi-thieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-31T12:23:47Z

### Lệnh fail không gắn eval

- Lệnh `bun run test -- --filter=app --filter=@crm/ui` thoát mã 1. Hai ca của `packages/ui/test/diff-trang.dom.tsx` đỏ với dòng nguyên văn «error: không thấy --diff-them trong :root» và «error: không thấy --diff-bo trong :root». Nguyên nhân gốc: chưa rõ. Bài kiểm đọc khối `:root` của CSS, và commit bdeba959e đã đổi khối đầu của `packages/ui/src/styles/globals.css` thành `:root,` kèm `.dark {`; đây là giả thuyết, chưa kiểm.
- Lệnh `tien-de.mjs --chay "bun _acceptance/hex-trang-gioi-thieu/rang/man.mjs"` thoát mã 2 (đã nêu ở E2 đến E5).

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do
- bun _acceptance/hex-trang-gioi-thieu/rang/hex.mjs: bo qua baseline: tep _acceptance/hex-trang-gioi-thieu/rang/hex.mjs co o cay dang kiem nhung chua co o merge-base 6ca59691a2f81a1c0adf3b1e9c19a4bc1876525a — eval moi, chay tren code cu khong phan biet gi
- IS_MARKETING=true EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hex-trang-gioi-thieu/rang/man.mjs": bo qua baseline: tep _acceptance/hex-trang-gioi-thieu/rang/man.mjs co o cay dang kiem nhung chua co o merge-base 6ca59691a2f81a1c0adf3b1e9c19a4bc1876525a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2, E3, E4, E5 đỏ vì `man.mjs` thoát mã 2 với «KHONG DO DUOC: thieu mat na .../anh/truoc-mat-1280.json (chup bang HTG_TRUOC=1)». Mọi dòng đo E2 đến E5 in DUNG, nhưng E4 chỉ in khổ 1280, chưa có dòng khổ 375, và bước so ảnh trước/sau dừng vì thiếu mặt nạ. Thêm bộ test `diff-trang.dom.tsx` đỏ trên `@crm/ui`. Trả về triển khai.
