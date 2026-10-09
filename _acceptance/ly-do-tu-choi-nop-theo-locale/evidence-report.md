---
schema_version: 2
feature_slug: ly-do-tu-choi-nop-theo-locale
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8b0a29c546c692bee717c28d6b26568214635d0b
human_signoff: Phan Le Manh 2026-10-09
---

# Evidence Report: ly-do-tu-choi-nop-theo-locale

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.k2c_vi
  verified_at: 2026-10-09T07:50:34Z
  output: |
    Ran 1 test across 1 file. [1391.00ms]

- eval: E2
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.k2c_en
  verified_at: 2026-10-09T07:50:34Z
  output: |
    Ran 1 test across 1 file. [1.65s]

- eval: E3
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.k2c_ngoai
  verified_at: 2026-10-09T07:50:34Z
  output: |
    Ran 7 tests across 1 file. [1.66s]

- eval: E4
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2c_mot_nguon
  verified_at: 2026-10-09T07:50:34Z
  output: |
    KET LUAN: 0 SAI

- eval: E5
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2c_gia_tri
  verified_at: 2026-10-09T07:50:34Z
  output: |
    KET LUAN: 0 SAI

- eval: E6
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.k2c_ban_do
  verified_at: 2026-10-09T07:50:34Z
  output: |
    Ran 134 tests across 1 file. [1043.00ms]

- eval: E7
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2c_dot_bien
  verified_at: 2026-10-09T07:50:34Z
  output: |
    dot-bien: 5/5 vet bi bat, tep tra lai nguyen

- eval: E8
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2c_ranh_gioi
  verified_at: 2026-10-09T07:50:34Z
  output: |
    ranh-gioi: 49 tep, 0 ngoai (neo nhanh-mo)

- eval: E9
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2c_man
  verified_at: 2026-10-09T07:50:34Z
  screenshot: evidence/E9-tu-choi-vi-390.png
  observed: |
    Đã mở từng ảnh trong sáu khung bằng Read. vi-390: dòng hệ thống giữa hai lượt chat đọc "Kara nộp bản nháp chưa được — chu kỳ đã rời pha «Lập kế hoạch»" đúng một lần, không lộ mã máy; tab "Bản nháp (8)", sau tải lại vẫn cùng dòng, tab "Bản nháp (7)". vi-1440 và bản tải lại: giao diện tiếng Việt (Soạn OKR), cùng câu từ chối nguyên văn; bảng nháp 8 dòng có dòng gạch "Giữ chân đối tác lớn" kèm nhãn "vừa sửa", sau tải lại còn 7 dòng.
    en-1440: giao diện tiếng Anh (Draft OKRs, Only pending), dòng "Kara could not submit the draft — the cycle has left Planning" đúng một lần, không có mã máy, ô soạn có viền nhấn; en-1440 tải lại: cùng dòng nguyên văn, bảng nháp 7 dòng, ô soạn không còn viền nhấn nên hai khung en là hai trạng thái khác nhau. Khớp Expected, không mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    Sáu ảnh trong evidence/: vi-390, vi-1440, en-1440 và bản tải lại của từng khổ; mỗi lượt in "dat".
    Chiều đỏ (--kiem-do-do) bắt được lỗi lộ mã máy ở lượt vi-1440, tệp hoi-thoai-soan.tsx trả lại nguyên, sha256 trước và sau giống nhau, git status không có thay đổi trong apps/.
    Driver là puppeteer trong man.mjs nên không đọc được network; ghi chú ở evidence/E9-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-09T07:50:34Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: ""
  exit_code: 0
  verified_at: 2026-10-09T07:50:34Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-09T07:50:34Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-09T07:50:34Z

- cmd: bunx turbo run lint --force
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-09T07:50:34Z

- cmd: bun run lint:slop
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-09T07:50:34Z

- cmd: bunx turbo run build --force
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-09T07:50:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi).

none — khong co eval khong-phan-biet nao duoc liet ke.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E9 deu dat nhung review co muc trong hop dong (E3 thieu ca goc so sanh, E9 anh en-1440 truoc tai lai trung anh sau tai lai). Returned to implementation.
Round 2: E1-E9 deu dat, bay lenh suite hoi quy xanh; E3 mo rong len 7 ca, E9 en-1440 hai khung la hai trang thai khac nhau. Chuyen sang Cong Bang chung.
