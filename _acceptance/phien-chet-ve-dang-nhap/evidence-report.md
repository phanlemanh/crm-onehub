---
schema_version: 2
feature_slug: phien-chet-ve-dang-nhap
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6fc7350c37a1904329e60f5fb9beee60cf100236
human_signoff: Phan Le Manh 2026-09-28
---

# Evidence Report: phien-chet-ve-dang-nhap

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-phien-chet-ve-dang-nhap-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.pcd_proxy_het_phien
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && bun test ./test/onboarding-gate.spec.ts -t het-phien
    Ran 2 tests across 1 file. [42.00ms]

    __EXIT=0

- eval: E2
  run_id: minted-phien-chet-ve-dang-nhap-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.pcd_proxy_giu_mo
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && bun test ./test/onboarding-gate.spec.ts -t giu-mo
    Ran 1 test across 1 file. [40.00ms]

    __EXIT=0

- eval: E3
  run_id: minted-phien-chet-ve-dang-nhap-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.pcd_proxy_khong_dung
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && bun test ./test/onboarding-gate.spec.ts -t khong-dung
    Ran 1 test across 1 file. [49.00ms]

    __EXIT=0

- eval: E4
  run_id: minted-phien-chet-ve-dang-nhap-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.pcd_doc_401
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && bun test ./test/onboarding-gate.spec.ts -t doc-401
    Ran 1 test across 1 file. [45.00ms]

    __EXIT=0

- eval: E5
  run_id: minted-phien-chet-ve-dang-nhap-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.pcd_trang_goc_khong_phien
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/phien-chet-trang-goc.dom.tsx -t khong-phien

    __EXIT=0

- eval: E6
  run_id: minted-phien-chet-ve-dang-nhap-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.pcd_trang_goc_con_phien
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/phien-chet-trang-goc.dom.tsx -t con-phien
    Ran 1 test across 1 file. [377.00ms]

    __EXIT=0

- eval: E7
  run_id: minted-phien-chet-ve-dang-nhap-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.pcd_trang_goc_marketing
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/phien-chet-trang-goc.dom.tsx -t marketing-bat
    Ran 1 test across 1 file. [375.00ms]

    __EXIT=0

- eval: E8
  run_id: minted-phien-chet-ve-dang-nhap-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.pcd_het_quyen
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/phien-chet-het-quyen.dom.tsx
    Ran 1 test across 1 file. [536.00ms]

    __EXIT=0

- eval: E9
  run_id: minted-phien-chet-ve-dang-nhap-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pcd_do_man
  verified_at: 2026-09-28T02:16:52Z
  screenshot: evidence/pcd-trang-goc-1280.png
  observed: |
    7 frame đọc được bằng Read (ảnh thực, không đoán từ log):
    1) pcd-trang-goc-1280.png ("/"): màn đăng nhập OneHub Center dark theme — logo "OneHub" trái trên, tiêu đề "OneHub Center: đối tác, kế hoạch 30 ngày và OKR.", khối "LẦN ĐẦU VÀO?" 3 bước, cột phải "Đăng nhập vào OneHub Center" + nút "Tiếp tục với Google" + ô "Địa chỉ email"/"Mật khẩu" + nút xanh lá "Đăng nhập". KHÔNG thấy "The CRM built for Agents", KHÔNG logo Comp AI, KHÔNG nút "Star on GitHub". Khớp Expected.
    2) pcd-cong-1280.png ("/onehub-center/companies"): pixel-identical màn đăng nhập như (1). Khớp Expected (phiên thu hồi -> /sign-in).
    3) pcd-agents-1280.png ("/onehub-center/agents"): pixel-identical màn đăng nhập như (1). Khớp Expected.
    4) pcd-onboarding-1280.png ("/onboarding"): pixel-identical màn đăng nhập như (1). Khớp Expected.
    5) pcd-het-quyen-1280.png ("/het-quyen"): pixel-identical màn đăng nhập như (1). Khớp Expected.
    6) pcd-trang-goc-375.png ("/" ở 375x812): cùng màn đăng nhập OneHub Center, bố cục một cột cho màn hẹp, cùng logo/tiêu đề/nút Google/ô email+mật khẩu, không landing cũ. Khớp Expected.
    7) pcd-song-1280.png (phiên SỐNG mới tạo, "/"): màn trong workspace thực — header "OneHub Center", sidebar icon trái, nội dung "Chào bạn" / "Chốt được tháng này" / các thẻ KPI 0 US$ / "Thỏa thuận đang mở" / "Việc quá hạn" — RÕ RÀNG không phải màn đăng nhập, không chữ landing cũ. Khớp Expected (đối chứng đường: đường cuối khác /sign-in và không chữ landing).
    Cả 7 ảnh đối chiếu Expected đều đúng, không ảnh nào thiếu hay sai.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-phien-chet-ve-dang-nhap-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pcd_do_api
  verified_at: 2026-09-28T02:16:52Z
  output: |
    GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-ci-only-google-client-id} GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-ci-only-google-client-secret} bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/phien-chet-ve-dang-nhap/rang/do-man.mjs api"
    phien-do: xong — mã 0

    __EXIT=0

- eval: E11
  run_id: minted-phien-chet-ve-dang-nhap-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.pcd_cong_cu
  verified_at: 2026-09-28T02:16:52Z
  output: |
    cd apps/app && bun test ./test/onboarding-gate.spec.ts
    Ran 42 tests across 1 file. [50.00ms]

    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-phien-chet-ve-dang-nhap-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T02:16:52Z

- cmd: bunx turbo run lint --force
  run_id: minted-phien-chet-ve-dang-nhap-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T02:16:52Z

- cmd: bun run lint:slop
  run_id: minted-phien-chet-ve-dang-nhap-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T02:16:52Z

- cmd: bunx turbo run build --force
  run_id: minted-phien-chet-ve-dang-nhap-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T02:16:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

E11 (AC-10, `apps/app/test/onboarding-gate.spec.ts` trọn tệp) — pass trên cả HEAD lẫn baseline (baseline: green). Đây là lệnh hồi quy giữ nguyên toàn bộ test cũ của tệp cộng thêm các ca mới của vòng này (E1-E4), nên bản thân nó không phân biệt được feature — nó là regression-guard có chủ ý (đảm bảo không test cũ nào bị xoá/`.skip` khi thêm ca mới), không phải một phép đo cần viết lại.

## Variance

none — không có eval nào mang `runs > 1` trong vòng này; mọi eval là deterministic (`runs` vắng hoặc bằng 1).

## Iterations

Round 1: toàn bộ 11 eval (E1-E11) và 4 lệnh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) đều exit 0 ở lần chạy đầu tiên. Không có eval nào fail, không cần round 2.

### Re-pin lần 1 — 2026-09-28, do hoá cũ do gộp origin/onehub (#181, #182) trước khi mở PR
run_id: repin-20260928T024121Z-51987
sha: 4db09e53f1e24e02cc228305f7cc4d75345abe5a · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9

### Re-pin lần 2 — 2026-09-28, do hoá cũ do gộp origin/onehub (#185) trước khi merge PR #184
run_id: repin-20260928T042412Z-16246
sha: 6fc7350c37a1904329e60f5fb9beee60cf100236 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9
