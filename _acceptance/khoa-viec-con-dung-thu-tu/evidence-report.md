---
schema_version: 2
feature_slug: khoa-viec-con-dung-thu-tu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 37d1295c857c6331694ce4a30dc98703d0cedba0
human_signoff:
---

# Evidence Report: khoa-viec-con-dung-thu-tu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4a | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E4c | AC-4 | test | PASS |
| E5 | AC-5 | judgment | PASS |
| E6 | AC-1 | script | PASS |
| E6b | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khoa-viec-con-dung-thu-tu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vck_doi_thu
  verified_at: 2026-10-21T07:23:06Z
  output: |
    test-run: dropped crm_mvhse3pzoeex_test
    __EXIT=0

- eval: E2
  run_id: minted-khoa-viec-con-dung-thu-tu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vck_dong
  verified_at: 2026-10-21T07:23:06Z
  output: |
    test-run: dropped crm_mvhse46sxhad_test
    __EXIT=0

- eval: E3
  run_id: minted-khoa-viec-con-dung-thu-tu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vck_chuyen_cha
  verified_at: 2026-10-21T07:23:06Z
  output: |
    test-run: dropped crm_mvhse3ir501v_test
    __EXIT=0

- eval: E3b
  run_id: minted-khoa-viec-con-dung-thu-tu-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vck_chuyen_cha
  verified_at: 2026-10-21T07:23:06Z
  output: |
    test-run: dropped crm_mvhse3ir501v_test
    __EXIT=0

- eval: E4a
  run_id: minted-khoa-viec-con-dung-thu-tu-E4a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kv_con
  verified_at: 2026-10-21T07:23:06Z
  output: |
    test-run: dropped crm_mvhse4bxqns5_test
    __EXIT=0

- eval: E4b
  run_id: minted-khoa-viec-con-dung-thu-tu-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kv_con_quyen
  verified_at: 2026-10-21T07:23:06Z
  output: |
    test-run: dropped crm_mvhse3v9h0hv_test
    __EXIT=0

- eval: E4c
  run_id: minted-khoa-viec-con-dung-thu-tu-E4c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.vg_tran_viec
  verified_at: 2026-10-21T07:23:06Z
  output: |
    test-run: dropped crm_mvhse3yvaw58_test
    __EXIT=0

- eval: E6
  run_id: minted-khoa-viec-con-dung-thu-tu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vck_dot_bien
  verified_at: 2026-10-21T07:23:06Z
  output: |
    vck dot bien: 2/2 dot bien chet
    __EXIT=0

- eval: E6b
  run_id: minted-khoa-viec-con-dung-thu-tu-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vck_dot_bien
  verified_at: 2026-10-21T07:23:06Z
  output: |
    vck dot bien: 2/2 dot bien chet
    __EXIT=0

### Judgment

- eval: E5
  judged_by: judge-subagent (fresh context), 3 judges
  verdict: PASS
  panel: de xuat 3 judge (domain-correctness, operational-feasibility, spec-alignment), tat ca doc muc «Thứ tự khoá» trong «Dự án» cua docs/api.md (dong 665-671)
  votes:
    - domain-correctness: PASS — Mục «Thứ tự khoá» (docs/api.md dòng 665-671) có đủ ba vế. Vế 1: khoaMot và khoaDuAn khoá hàng duAn rồi mọi việc theo id, còn viec.taoCon khoá duAn rồi mới khoá việc cha. Vế 2: LoiChaDoiDuAn dừng lượt đó, viec.taoCon chạy lại trong giao dịch mới tối đa DU_AN.thuLaiViecCon lượt, hết lượt thì trả 400 «Việc cha vừa đổi dự án. Hãy thử lại.». Vế 3: câu cuối nói các đường ghi việc lẻ khác (docViecGhi) «chưa được rà thứ tự khoá», và tệp không có chỗ nào tuyên mọi đường ghi đã đúng thứ tự. Tên hàm và router (viec.taoCon, viec.doiDuAn, duAn) khớp với phần còn lại của mục Dự án.
    - operational-feasibility: PASS — Mục «Thứ tự khoá» trong «Dự án» của docs/api.md (dòng 665-671) nói đủ ba vế. Vế 1: khoaMot, khoaDuAn và viec.taoCon đều khoá hàng duAn trước khi khoá việc. Vế 2: viec.taoCon dừng bằng LoiChaDoiDuAn, chạy lại trong giao dịch mới tối đa DU_AN.thuLaiViecCon lượt, hết lượt thì trả 400 «Việc cha vừa đổi dự án. Hãy thử lại.». Vế 3: các đường ghi việc lẻ khác (docViecGhi) được ghi rõ là chưa rà thứ tự khoá, và tệp không tuyên rằng mọi đường ghi đều đã đúng thứ tự. Tên hàm và router khớp phần còn lại của mục.
    - spec-alignment: PASS — Mục «Thứ tự khoá» trong «Dự án» của docs/api.md (dòng 665-671) nói đủ cả ba vế. Vế 1: các đường ghi qua `khoaMot` và `khoaDuAn` khoá hàng `duAn` rồi mọi việc, còn `viec.taoCon` khoá `duAn` trước việc cha. Vế 2: `viec.taoCon` dừng bằng `LoiChaDoiDuAn`, chạy lại trong giao dịch mới tối đa `DU_AN.thuLaiViecCon` lượt, hết lượt thì trả 400 «Việc cha vừa đổi dự án. Hãy thử lại.». Vế 3: tệp ghi thẳng rằng các đường ghi việc lẻ khác (`docViecGhi`) chưa được rà thứ tự khoá, và không có câu nào tuyên mọi đường đã đúng thứ tự. Tên hàm và router (`viec.taoCon`, `khoaMot`, `khoaDuAn`, `viec.doiDuAn`) khớp với phần còn lại của mục.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khoa-viec-con-dung-thu-tu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T07:23:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khoa-viec-con-dung-thu-tu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T07:23:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khoa-viec-con-dung-thu-tu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T07:23:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khoa-viec-con-dung-thu-tu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T07:23:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-khoa-viec-con-dung-thu-tu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T07:23:06Z

- cmd: bun run lint:slop
  run_id: minted-khoa-viec-con-dung-thu-tu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T07:23:06Z

- cmd: bunx turbo run build --force
  run_id: minted-khoa-viec-con-dung-thu-tu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T07:23:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline): E4a, E4b, E4c. Ba eval này là regression-guard có chủ ý: chúng chạy nguyên văn các bài đã ký (viec-con.spec.ts kv-con-tao, kv-con-quyen và du-an-tran-viec.spec.ts) để chứng minh hành vi cũ của việc con (kế thừa, một tầng, quyền, trần 300 việc, dự án đã đóng) không đổi sau khi đảo thứ tự khoá. Chúng chứng minh không hồi quy, không chứng minh tính năng mới; phần phân biệt của tính năng nằm ở E1, E2, E3, E3b và hai đột biến E6, E6b.

Baseline khong do:
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test --timeout 120000 test/viec-con-khoa.spec.ts -t vck-doi-thu": bo qua baseline: tep apps/api/test/viec-con-khoa.spec.ts co o cay dang kiem nhung chua co o merge-base 112bf6d46a21012dd3fe52462b08afed7fb7554d — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test --timeout 120000 test/viec-con-khoa.spec.ts -t vck-dong": bo qua baseline: tep apps/api/test/viec-con-khoa.spec.ts co o cay dang kiem nhung chua co o merge-base 112bf6d46a21012dd3fe52462b08afed7fb7554d — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test --timeout 120000 test/viec-con-khoa.spec.ts -t vck-chuyen-cha": bo qua baseline: tep apps/api/test/viec-con-khoa.spec.ts co o cay dang kiem nhung chua co o merge-base 112bf6d46a21012dd3fe52462b08afed7fb7554d — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khoa-viec-con-dung-thu-tu/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/khoa-viec-con-dung-thu-tu/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 112bf6d46a21012dd3fe52462b08afed7fb7554d — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lượt đều đồng đều (không eval nào chạy nhiều hơn một lượt).

## Iterations

Round 1: mọi eval đạt (E1, E2, E3, E3b, E4a, E4b, E4c, E5, E6, E6b), hai đột biến thứ tự khoá đều bị bắt; không vòng trả về.
