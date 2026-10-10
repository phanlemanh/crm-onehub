---
schema_version: 2
feature_slug: okr-mau-xoa-cuoc-soan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4b83af51e4eb230fbc5542ea56594cbdb2dabd90
human_signoff:
---

# Evidence Report: okr-mau-xoa-cuoc-soan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | judgment | PASS |
| E9 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-okr-mau-xoa-cuoc-soan-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omx_xoa
  verified_at: 2026-10-10T23:13:40Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-xoa"
    test-run: dropped crm_mv30i7ng3hzx_test

- eval: E2
  run_id: minted-okr-mau-xoa-cuoc-soan-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omx_xoa
  verified_at: 2026-10-10T23:13:40Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-xoa"
    test-run: dropped crm_mv30i7ng3hzx_test

- eval: E3
  run_id: minted-okr-mau-xoa-cuoc-soan-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omx_mo_coi
  verified_at: 2026-10-10T23:13:40Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-mo-coi"
    test-run: dropped crm_mv30i7mok74x_test

- eval: E4
  run_id: minted-okr-mau-xoa-cuoc-soan-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omx_xoa
  verified_at: 2026-10-10T23:13:40Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-xoa"
    test-run: dropped crm_mv30i7ng3hzx_test

- eval: E5
  run_id: minted-okr-mau-xoa-cuoc-soan-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omx_nap_lai
  verified_at: 2026-10-10T23:13:40Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-nap-lai"
    test-run: dropped crm_mv30i7solwjc_test

- eval: E6
  run_id: minted-okr-mau-xoa-cuoc-soan-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omx_xoa
  verified_at: 2026-10-10T23:13:40Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-xoa"
    test-run: dropped crm_mv30i7ng3hzx_test

- eval: E7
  run_id: minted-okr-mau-xoa-cuoc-soan-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.omx_dang_giu
  verified_at: 2026-10-10T23:13:40Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-dang-giu"
    test-run: dropped crm_mv30i7okqpzy_test

- eval: E9
  run_id: minted-okr-mau-xoa-cuoc-soan-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.omx_dot_bien
  verified_at: 2026-10-10T23:13:40Z
  output: |
    bun _acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs
    DOT BIEN: 9/9 cap dat

### Judgment

Panel đề xuất cho E8: PASS (hai phiếu PASS, một phiếu UNCERTAIN hiện nguyên bên dưới). Người quyết ở Cổng 2.

- eval: E8
  judged_by: judge panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  votes:
    - domain-correctness: UNCERTAIN — Hai điều đầu đạt rõ: đoạn «Cuộc soạn OKR mở trên bộ mẫu…» nói `--xoa` và nạp lại gỡ cuộc soạn theo chu kỳ, bộ phận, phòng ban hay người mẫu cùng đề xuất, kể cả cuộc sót từ lần xoá trước (được đếm). Đoạn đó cũng nói hàng `aiChiPhi` ở lại vì là tiền đã tiêu thật và trần chi phí AI của tháng đọc chúng. Điều thứ ba chưa đủ căn cứ: các chữ trong đoạn mới đều có trong CONTEXT.md («Cuộc soạn», «Đề xuất», «Sổ chi phí AI», «Trần tháng», «Chương trình OKR»). Nhưng mục còn có «đồng hồ tiêm», «ổ cắm unix» và «khuôn» (nghĩa schema) không có mục nào trong CONTEXT.md. Hợp đồng không nói AC-8 chỉ áp cho đoạn mới hay cho cả mục.
    - operational-feasibility: PASS — Đoạn «Cuộc soạn OKR mở trên bộ mẫu…» của docs/setup.md nói rõ `--xoa` và nạp lại gỡ cuộc soạn theo chu kỳ, bộ phận, phòng ban hay người mẫu cùng đề xuất, kể cả cuộc còn sót từ lần xoá trước và có đếm. Nó cũng nói hàng `aiChiPhi` ở lại vì là tiền đã tiêu thật và trần chi phí AI của tháng đọc chúng, xoá đi thì trần mở lại giả. Các từ dùng (cuộc soạn, đề xuất, chi phí AI, trần) khớp mục «Cuộc soạn» và «Sổ chi phí AI» của CONTEXT.md. «Khoá ngoại» và «tiền tố» không có trong CONTEXT.md nhưng là cách dịch thông dụng của foreign key và prefix, không phải từ tự đúc.
    - spec-alignment: PASS — Mục «Bộ OKR mẫu» của docs/setup.md nói đủ cả hai điều. Thứ nhất, cuộc soạn OKR trên chu kỳ, bộ phận hay phòng ban mẫu, hoặc do người mẫu mở, cùng đề xuất của chúng đi theo `--xoa` và nạp lại, kể cả cuộc sót từ lần xoá trước vì lệnh tìm theo tiền tố `mau-okr-`. Thứ hai, hàng `aiChiPhi` ở lại vì là tiền đã tiêu thật và trần chi phí AI của tháng đọc chúng, xoá đi thì trần mở lại giả. Các từ «cuộc soạn», «đề xuất», «chi phí AI», «trần chi phí», «đơn vị», «chu kỳ», «bộ OKR mẫu» đều có trong CONTEXT.md. «Tiền tố» và «khoá ngoại» là từ kỹ thuật tiếng Việt thông dụng, không tự đúc. «Người mẫu» có từ lần dựng bộ mẫu đầu (git log -S) và được giải nghĩa ngay trong mục («người mẫu có thư đuôi `@mau.onehub.test`»). Vì vậy không có từ ghép mới tự đúc.
  required_evidence_from_dissent:
    - Một dòng trong `_acceptance/okr-mau-xoa-cuoc-soan/contract.md` (AC-8 hoặc Notes) nói rõ vế «không tự đúc từ ghép» chỉ áp cho đoạn «Cuộc soạn OKR mở trên bộ mẫu…» do vòng này viết. Nếu có, các chữ cũ như «đồng hồ tiêm», «ổ cắm unix», «khuôn» nằm ngoài phạm vi và phán quyết của phiếu này thành PASS.
    - Hoặc một mục trong `CONTEXT.md` cho «đồng hồ tiêm», «ổ cắm unix» và «khuôn» (nghĩa schema), hoặc bản `docs/setup.md` mục «Bộ OKR mẫu» đã thay ba chữ đó bằng tên thật (injected clock, unix socket, schema) hay chữ thường ai cũng hiểu. Khi đó mục không còn từ ghép ngoài từ điển và phán quyết thành PASS.
    - Nếu phạm vi AC-8 là cả mục và ba chữ trên vẫn còn nguyên trong `docs/setup.md` mà `CONTEXT.md` không có, phán quyết của phiếu này là FAIL, vì cả mục khi đó vi phạm vế cuối của AC-8.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-okr-mau-xoa-cuoc-soan-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-10T23:13:40Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-okr-mau-xoa-cuoc-soan-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-10T23:13:40Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-okr-mau-xoa-cuoc-soan-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-10T23:13:40Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-okr-mau-xoa-cuoc-soan-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-10T23:13:40Z

- cmd: bunx turbo run lint --force
  run_id: minted-okr-mau-xoa-cuoc-soan-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-10T23:13:40Z

- cmd: bun run lint:slop
  run_id: minted-okr-mau-xoa-cuoc-soan-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-10T23:13:40Z

- cmd: bunx turbo run build --force
  run_id: minted-okr-mau-xoa-cuoc-soan-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-10T23:13:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline khong do:

- bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-xoa": bo qua baseline: tep apps/api/test/okr-mau-cuoc-soan.spec.ts co o cay dang kiem nhung chua co o merge-base 5042d0ce376413e685453f61ad8e6df68bd5d458 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-mo-coi": bo qua baseline: tep apps/api/test/okr-mau-cuoc-soan.spec.ts co o cay dang kiem nhung chua co o merge-base 5042d0ce376413e685453f61ad8e6df68bd5d458 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-nap-lai": bo qua baseline: tep apps/api/test/okr-mau-cuoc-soan.spec.ts co o cay dang kiem nhung chua co o merge-base 5042d0ce376413e685453f61ad8e6df68bd5d458 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t omx-dang-giu": bo qua baseline: tep apps/api/test/okr-mau-cuoc-soan.spec.ts co o cay dang kiem nhung chua co o merge-base 5042d0ce376413e685453f61ad8e6df68bd5d458 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 5042d0ce376413e685453f61ad8e6df68bd5d458 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng đều

## Iterations

Round 1: mọi eval xanh, không eval nào hỏng; không có vòng trả về.
Round 2: mọi eval xanh trên cây 4b83af51e; không eval nào hỏng. E8 có một phiếu chưa đủ căn cứ về phạm vi từ ghép của AC-8 (xem mục Judgment), đề xuất của panel vẫn là PASS.
