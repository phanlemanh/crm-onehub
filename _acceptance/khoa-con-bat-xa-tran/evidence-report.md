---
schema_version: 2
feature_slug: khoa-con-bat-xa-tran
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b9acad6b77fde52541221e857cd2eb01d839e45f
human_signoff: Phan Le Manh 2026-09-26
---

# Evidence Report: khoa-con-bat-xa-tran

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: muhmp8vj11wo
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcb_thoi_gian
  verified_at: 2026-09-26T00:05:18Z
  output: |
    OK 10 seed doi mot khac nhau
    do-thoi-gian: 10/10 luot dat
    test-run: dropped crm_muhmp8vj11wo_test

- eval: E2
  run_id: minted-khoa-con-bat-xa-tran-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcb_lech_hang
  verified_at: 2026-09-26T00:05:18Z
  output: |
    OK dot bien lo-dao-thu-tu: ma 1, dong loi "error: ma tran tRPC song song lech danh sach thu tuc"
    lech-hang: 11/11 khang dinh dat
    test-run: dropped crm_muhmp9vdfh04_test

- eval: E3
  run_id: muhmp8wflf4m
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcb_con_thanh_vien
  verified_at: 2026-09-26T00:05:18Z
  output: |
    OK tu kiem bo khop: "ma tran tRPC song song lech danh sach thu tuc" co trong khung ma nguon cua con-thanh-vien nhung khong phai dong loi
    con-thanh-vien: 3/3 khang dinh dat
    test-run: dropped crm_muhmp8wflf4m_test

- eval: E4
  run_id: minted-khoa-con-bat-xa-tran-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcb_khong_noi_tran
  verified_at: 2026-09-26T00:05:18Z
  output: |
    OK tu kiem workflow nhieu dong: bat ".github/workflows/ci.yml co --timeout"
    OK tu kiem preload: bat "apps/api/test/setup.ts goi setDefaultTimeout"
    khong-noi-tran: 28 dat, 0 hong, tu kiem 5/5

- eval: E5
  run_id: muhmp8zb5f13
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcb_tuan_tu
  verified_at: 2026-09-26T00:05:18Z
  output: |
    OK tu kiem doi-chung-thanh-vien: bat "doi-chung-thanh-vien goi ma tran song song"
    tuan-tu: 7 dat, 0 hong, tu kiem 1/1
    test-run: dropped crm_muhmp8zb5f13_test

- eval: E6
  run_id: muhmp8wflf4m
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcb_con_thanh_vien
  verified_at: 2026-09-26T00:05:18Z
  output: |
    OK tu kiem bo khop: "ma tran tRPC song song lech danh sach thu tuc" co trong khung ma nguon cua con-thanh-vien nhung khong phai dong loi
    con-thanh-vien: 3/3 khang dinh dat
    test-run: dropped crm_muhmp8wflf4m_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muhmp7v8sv5t
  exit_code: 0
  verified_at: 2026-09-26T00:05:18Z

- cmd: bunx turbo run lint --force
  run_id: minted-khoa-con-bat-xa-tran-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-26T00:05:18Z

- cmd: bun run lint:slop
  run_id: minted-khoa-con-bat-xa-tran-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-26T00:05:18Z

- cmd: bunx turbo run build --force
  run_id: minted-khoa-con-bat-xa-tran-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-26T00:05:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào mang field runs > 1 trong round này; toàn bộ E1–E6 và bốn lệnh suite đều deterministic (runs=1, không có pass_rate lẫn lộn).

## Iterations

Round 1: E1–E5 và bốn lệnh suite hồi quy pass ngay từ lượt đầu, nhưng chủ kho trả lại ở Cổng Bằng chứng — năm phát hiện trong hợp đồng (AC-5 so hai hằng viết tay thay vì đo cỡ pool thật, AC-4 soát trần bỏ sót khối `run: |` nhiều dòng, AC-2 chỉ đo 3/8 ô của lớp đã hứa) cộng hai phát hiện ngoài hợp đồng nâng phạm vi sửa ngay. Quay lại S4.
Round 2: AC-5 đổi sang đo cỡ pool pg thật lúc chạy (32 truy vấn đồng thời, đếm pid khác nhau) thay vì so hằng; AC-2 đủ 8 ô đột biến và khớp đúng dòng lỗi `error: ...` thay vì `includes()`; AC-4 quét mọi dòng workflow (kể cả khối `run: |` nhiều dòng) và thêm tệp preload; thêm AC-6 tự kiểm chiều dương cho bẫy khớp nhầm. E1–E6 và bốn lệnh suite đều pass.

### Re-pin lần 1 — 2026-09-26, do ghim lại ở tip sau gộp onehub 287a5103 (#144, #147)
run_id: repin-20260926T002508Z-67428
sha: 3ee9b663fadb357e8a199c9ee1b3f313ec9292cb · suites: 4 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-10-14, do F24 ba-ho-so-do-san: sửa thước chết và răng đỏ sẵn (phạm vi A, làn C 12 hồ sơ)
run_id: repin-20261014T001054Z-11514
sha: aeacc862fc3a28e5391c27772a4ad96e16ae3317 · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-15, do ghim ở đỉnh sau gộp onehub 3818ad4ec, ngay trước gộp #406 (làn X lần 2, 11 hồ sơ)
run_id: repin-20261014T231434Z-99400
sha: b9acad6b77fde52541221e857cd2eb01d839e45f · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · chập chờn (đỏ lần đầu, đạt khi chạy lại): lenh-dung-do-khong-ai-thay E8 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
