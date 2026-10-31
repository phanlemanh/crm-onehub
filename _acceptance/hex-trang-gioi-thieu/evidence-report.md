---
schema_version: 2
feature_slug: hex-trang-gioi-thieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9bf587f480a236df2f01bb8b825e42d575ca6dc1
human_signoff:
---

# Evidence Report: hex-trang-gioi-thieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-hex-trang-gioi-thieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htg_hex
  verified_at: 2026-10-31T12:23:47Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-hex-trang-gioi-thieu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:44:14Z
  output: |
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-hex-trang-gioi-thieu-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:44:14Z
  output: |
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-hex-trang-gioi-thieu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:44:14Z
  output: |
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-hex-trang-gioi-thieu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:44:14Z
  output: |
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-hex-trang-gioi-thieu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htg_man
  verified_at: 2026-10-31T12:44:14Z
  screenshot: evidence/sau-1280.png
  observed: |
    Da mo bang Read 4 anh. sau-1280.png va truoc-1280.png (1280x4127) cung bo cuc: hero toi, mockup Comp AI, Built with, o lenh agent, luoi "What it actually does", Fork it, footer. Khac biet nhin thay duoc o sau: nhan nho (SUGGESTED, PROJECT, BUILT WITH) sang hon, lenh "/Create agent" xanh sang hon (truoc xanh tham), dau/cham va vien xam nhat hon chut; khong thay thay doi nao khac. sau-375.png va truoc-375.png (375x5116) cung bo cuc mot cot; khac biet chi o "/Create agent" xanh sang hon va nhan nho sang hon, khong gi khac. Mau cam cua sao khong nhin ro o do phan giai hien thi, nhung so sanh diem anh bao 0 diem khac ngoai 11 cho.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-31T12:44:14Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-31T12:44:14Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-31T12:44:14Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-31T12:44:14Z

- cmd: bunx turbo run lint --force
  run_id: minted-hex-trang-gioi-thieu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-31T12:44:14Z

- cmd: bun run lint:slop
  run_id: minted-hex-trang-gioi-thieu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-31T12:44:14Z

- cmd: bunx turbo run build --force
  run_id: minted-hex-trang-gioi-thieu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-31T12:44:14Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Khong co eval khong-phan-biet duoc liet ke.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2, E3, E4, E5 khong do duoc (thuoc man bao loi) va suite app/ui do — quay lai implementation.
Round 2: moi eval va moi lenh suite xanh; E1 carry-forward tu round 1.

## Số đo cho kit (luật 36 của đợt ban-do-khuon-3010)

- Số tệp đi theo khuôn: 7 (6 tệp landing dùng token ngữ nghĩa có sẵn, `globals.css` khai token cho `.dark`).
- Số lần răng bắt: 2 — thước hex bắt 11 chỗ trên cây gốc; thước màn bắt trang hỏng ở nền sáng (5 253 088 điểm khác ở 1280).
- Số lệch lọt: 0 — so ảnh trước/sau ngoài 16 hộp của 11 chỗ ra 0 điểm khác ở cả hai khổ.
- PR gộp: chưa gộp (chờ F37, luật 38).
