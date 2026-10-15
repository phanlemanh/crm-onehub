---
schema_version: 2
feature_slug: loc-va-kieu-xem-chung
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: abc8902c5569f7df37f1e007ef82d4150104e431
human_signoff:
---

# Evidence Report: loc-va-kieu-xem-chung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E7m | AC-7 | script | PASS |
| E7j | AC-7 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-loc-va-kieu-xem-chung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lkx_dem
  verified_at: 2026-10-15T05:08:44Z
  output: |
    Ran 6 tests across 1 file. [744.00ms]

- eval: E2
  run_id: minted-loc-va-kieu-xem-chung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lkx_quet
  verified_at: 2026-10-15T05:08:44Z
  output: |
    Ran 3 tests across 1 file. [263.00ms]

- eval: E3
  run_id: minted-loc-va-kieu-xem-chung-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lkx_trang_thai
  verified_at: 2026-10-15T05:08:44Z
  output: |
    Ran 3 tests across 1 file. [1183.00ms]

- eval: E4
  run_id: minted-loc-va-kieu-xem-chung-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lkx_kieu_xem
  verified_at: 2026-10-15T05:08:44Z
  output: |
    Ran 3 tests across 1 file. [1178.00ms]

- eval: E5
  run_id: minted-loc-va-kieu-xem-chung-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lkx_tai_lieu
  verified_at: 2026-10-15T05:08:44Z
  output: |
    Ran 6 tests across 1 file. [1443.00ms]

- eval: E6
  run_id: minted-loc-va-kieu-xem-chung-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lkx_duong_dan
  verified_at: 2026-10-15T05:08:44Z
  output: |
    Ran 4 tests across 1 file. [1.65s]

- eval: E7m
  run_id: minted-loc-va-kieu-xem-chung-E7m-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lkx_man_do
  verified_at: 2026-10-15T05:08:44Z
  output: |
    phien-do: xong — mã 0

- eval: E7
  run_id: minted-loc-va-kieu-xem-chung-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lkx_man
  verified_at: 2026-10-15T05:08:44Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/blissful-jepsen-65fb89/.acceptance-runs/loc-va-kieu-xem-chung/evidence/lkx-thoa-thuan-360.png
  observed: |
    Đã mở từng ảnh bằng Read, đủ 6 ảnh (Thoả thuận, Onboarding, Tài liệu, mỗi màn ở 360 và 1280). Chip lọc cùng dạng viền ở cả ba màn, số đếm là chữ phụ xám không mờ nhoè (Thoả thuận: Tất cả 30, Đang mở 19, Đã chốt 11; Tài liệu: Tất cả 3, Quy định 1, Chính sách 1, Quy trình 1, Biểu mẫu 0, Chiến lược 0).
    Ở 1280, Thoả thuận và Onboarding có nhóm nút kiểu xem «Bảng / Bảng cột» cùng hàng với chip; ở 360 nhóm nút thành ô chọn «Bảng»; Tài liệu không có ViewSwitch, hàng chip ở 360 cuộn ngang bên trong, bảng Thoả thuận cuộn ngang bên trong, không phần tử nào tràn mép.
    Ảnh Onboarding chỉ chụp kiểu Bảng, chip «Đã đóng» đếm 0 vì tiền đề không gieo kế hoạch đã đóng; Expected không đòi số đếm lớn hơn 0.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T05:08:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-15T05:08:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T05:08:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T05:08:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T05:08:44Z

- cmd: bun run lint:slop
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-15T05:08:44Z

- cmd: bunx turbo run build --force
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T05:08:44Z

### Judgment

- eval: E7j
  judged_by: judge panel de xuat (fresh context): domain-correctness, operational-feasibility, spec-alignment
  verdict: UNCERTAIN
  rationale: Sáu ảnh đạt ý (1), (2) và phần lớn ý (3), (4) của AC-7. Ba judge đều không chốt được vì ảnh Onboarding chỉ ở kiểu Bảng (không thấy «Chia cột theo»), và vài chỉ số (avatar ở 360, vùng cuộn của chip Tài liệu, độ mờ số đếm) không đọc được từ ảnh tĩnh.
  votes:
    - domain-correctness: UNCERTAIN — Chip ba màn cùng viền, cùng cỡ chữ, số đếm xám dễ đọc, không mờ nhoè. Kiểu xem là nhóm nút ở 1280 và ô chọn «Bảng ˅» ở 360 cho Thoả thuận và Onboarding. Số đếm khớp tổng (19+11=30; 1+1+1+0+0=3). Nhưng hàng ST-onboarding-loc ghi cả «Chia cột theo» của ViewSwitch, mà cả hai ảnh Onboarding chỉ chụp kiểu Bảng nên không thấy điều khiển đó.
    - operational-feasibility: UNCERTAIN — Ý (1), (2), (3) đều đạt trên sáu ảnh; ở 360 chỉ có bảng DataTable và hàng chip Tài liệu bị cắt mép, đúng hai vùng đã khai. Ý (4) chưa đủ căn cứ vì ảnh Onboarding ở kiểu Bảng không có «Chia cột theo»; spec nói điều khiển đó chỉ có ở bảng cột, nên không thể coi là lỗi hay là đủ.
    - spec-alignment: UNCERTAIN — Ý (1), (2), (4) khớp ảnh. Ý (3) chưa chắc: ở 360 avatar «LL» ở góc phải thanh đầu trang trông sát hoặc chạm mép màn trong cả ba ảnh; ảnh tĩnh không phân biệt hàng chip Tài liệu bị cắt «Quy trìn» là vùng cuộn hay cắt thật; độ mờ số đếm không đọc được bằng mắt.
  required_evidence:
    - Ảnh Onboarding ở kiểu «Bảng cột» ở 1280 (cần thấy «Chia cột theo» dạng nhóm nút) và ở 360 (cần thấy dạng ô chọn, không phải ba hàng chip), lấy từ bàn đo màn, đặt cạnh lkx-onboarding-1280.png và lkx-onboarding-360.png trong _acceptance/loc-va-kieu-xem-chung/evidence/, mở bằng đường dẫn có cachXem=cot.
    - Hoặc một dòng trong design doc (mục 3 hoặc 4) xác nhận «Chia cột theo» không thuộc ST-onboarding-loc ở kiểu xem Bảng, chỉ hiện ở Bảng cột.
    - Ảnh 360 cắt sát góc phải thanh đầu trang của lkx-thoa-thuan-360.png, lkx-onboarding-360.png, lkx-tai-lieu-360.png (hoặc getBoundingClientRect().right của nút avatar «LL» so với 360 từ `bun run do:man`); nếu right lớn hơn 360 thì ý (3) bị đỏ.
    - Phép đo ở 360 cho hàng chip Tài liệu › Trang: computed overflow-x là auto hoặc scroll và scrollWidth lớn hơn clientWidth, kèm document.documentElement.scrollWidth không quá 360 cho cả ba màn (từ `bun run do:man`).
    - Phép đo getComputedStyle của span [data-slot="toggle-group-item-count"] trên chip của ba màn ở 1280: color là màu muted-foreground và opacity = 1 (từ `bun run do:man`, cùng lượt với ba ảnh).
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

none (không eval nào xanh trên cả HEAD lẫn baseline: toàn bộ baseline n-a vì eval mới hoặc hạ tầng, xem mục dưới; lệnh suite xanh hai phía là regression-guard bình thường, không liệt kê).

### Baseline khong do

- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx: bo qua baseline: tep packages/ui/test/loc-va-kieu-xem.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/loc-va-kieu-xem.spec.ts: bo qua baseline: tep apps/app/test/loc-va-kieu-xem.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx -t trang-thai: bo qua baseline: tep apps/app/test/loc-va-kieu-xem.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx -t kieu-xem: bo qua baseline: tep apps/app/test/loc-va-kieu-xem.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx -t tai-lieu: bo qua baseline: tep apps/app/test/loc-va-kieu-xem.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx -t duong-dan: bo qua baseline: tep apps/app/test/loc-va-kieu-xem.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/loc-va-kieu-xem-chung/rang/chup-loc.mjs --chi-do": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval máy nào đỏ (E1 đến E7m đều đạt, lệnh suite xanh). Verdict REJECT vì một phát hiện mức cao trong hợp đồng ở AC-1 (xem review-findings.md) và E7j còn UNCERTAIN chờ người. Trả về triển khai.
