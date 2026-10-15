---
schema_version: 2
feature_slug: so-do-can-chinh-don-vi
verdict: REJECT
failed_evals: [E14, E12]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bd32cb3c85bcf0f6aa808ee523f25b1de71be474
human_signoff:
---

# Evidence Report: so-do-can-chinh-don-vi

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
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | ui-check | FAIL |
| E14 | AC-14 | script | FAIL |
| E15 | AC-2 | script | PASS |
| E16 | AC-15 | script | PASS |
| E17 | AC-7 | test | PASS |

không chạy theo hồ sơ: E13

## Evidence

- eval: E1
  run_id: minted-so-do-can-chinh-don-vi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_du_lieu
  verified_at: 2026-10-15T04:58:21Z
  output: |
    test-run: dropped crm_mv92jl85hi6d_test

- eval: E2
  run_id: minted-so-do-can-chinh-don-vi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_chu_y
  verified_at: 2026-10-15T04:58:21Z
  output: |
    test-run: dropped crm_mv92jlyvomx2_test

- eval: E3
  run_id: minted-so-do-can-chinh-don-vi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_quyen
  verified_at: 2026-10-15T04:58:21Z
  output: |
    test-run: dropped crm_mv92jlsidge5_test

- eval: E4
  run_id: minted-so-do-can-chinh-don-vi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_cach_xem
  verified_at: 2026-10-15T04:58:21Z
  output: |
    Ran 1 test across 1 file. [1452.00ms]

- eval: E5
  run_id: minted-so-do-can-chinh-don-vi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_the
  verified_at: 2026-10-15T04:58:21Z
  output: |
    Ran 1 test across 1 file. [714.00ms]

- eval: E6
  run_id: minted-so-do-can-chinh-don-vi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_loc
  verified_at: 2026-10-15T04:58:21Z
  output: |
    Ran 1 test across 1 file. [1135.00ms]

- eval: E7
  run_id: minted-so-do-can-chinh-don-vi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_mo_the
  verified_at: 2026-10-15T04:58:21Z
  output: |
    Ran 1 test across 1 file. [1160.00ms]

- eval: E8
  run_id: minted-so-do-can-chinh-don-vi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_thu_gon
  verified_at: 2026-10-15T04:58:21Z
  output: |
    Ran 1 test across 1 file. [494.00ms]

- eval: E9
  run_id: minted-so-do-can-chinh-don-vi-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_hep
  verified_at: 2026-10-15T04:58:21Z
  output: |
    Ran 1 test across 1 file. [745.00ms]

- eval: E10
  run_id: minted-so-do-can-chinh-don-vi-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_trang_thai
  verified_at: 2026-10-15T04:58:21Z
  output: |
    Ran 1 test across 1 file. [1345.00ms]

- eval: E11
  run_id: minted-so-do-can-chinh-don-vi-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_chu
  verified_at: 2026-10-15T04:58:21Z
  output: |
    Ran 152 tests across 1 file. [1342.00ms]

- eval: E12
  run_id: minted-so-do-can-chinh-don-vi-E12-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.dh4_man
  verified_at: 2026-10-15T04:58:21Z
  screenshot: evidence/so-do-1440.png
  observed: |
    so-do-1440.png: trang Toàn cảnh OKR tối màu, tab Sơ đồ đang chọn, chip "Mọi đơn vị 23" đang sáng, chú giải nét liền/nét đứt/Chưa nối lên. Khung vẽ có cây thẻ: OneHub ở gốc, hàng dưới Khối Kinh doanh, Khối Vận hành, Khối Hỗ trợ, Sơ đồ·Khối A, Sơ đồ·Khối B, Sơ đồ·X; hàng thấp hơn Sơ đồ·B3, Sơ đồ·B2, Sơ đồ·B1. Có đường liền (nhánh ngang từ gốc xuống) và đường đứt (cong sang B1). Thẻ Sơ đồ·Khối B và Sơ đồ·B2 mang dòng chữ "Chưa nối lên" và không có đường nào chạm đỉnh thẻ — khớp mong đợi về mặt hình ảnh, nhưng phép đếm dây bằng selector của script ra 0 nên kiểm đối chứng SAI.
    chu-y-1440.png: chip "Cần chú ý 6" sáng (hiện 6), các thẻ khác mờ; còn rõ nét Khối Hỗ trợ, Sơ đồ·Khối A, Pháp chế, Sơ đồ·A1... đúng tập cần chú ý, có đường liền/đứt mới.
    the-mo-1440.png: thẻ "Sơ đồ·A3" (Đỗ Minh Khoa) mở rộng viền xanh, tiêu đề "Sơ đồ · A3 góp cả khối A lần công ty", hai mục góp hiện câu lý do đã gieo kèm nhãn Có số liệu / Đặt cược.
    danh-sach-390.png: viewport 390 hẹp, hiện danh sách thẻ xếp dọc (OneHub, Khối Kinh doanh thụt lề), không có khung vẽ sơ đồ, không thấy cuộn ngang, ô chọn "Sơ đồ" dạng dropdown. Không thấy lỗi hiển thị trong 4 ảnh.
  network_observed: n-a (driver)
  output: |
    Script tự dựng phiên đo riêng (app :4421, api :4608), nạp okr:mau + ca-so-do (11 mục tiêu, 7 phòng ban), tự dọn. Kết luận của script: 16 DUNG, 1 SAI.
    SAI so-do 1440: đối chứng đường — khung vẽ có 0 dây (selector [data-testid^="rf__edge-"] đếm được 0 dù ảnh vẽ rõ nhiều đường)
    Hai kiểm "0 đường kết thúc ở thẻ chưa nối" dùng cùng selector đang đếm ra 0, nên hai kiểm DUNG đó hiện chưa có sức chứng minh (assertion rỗng).
    Đủ 4 ảnh trong evidence/: so-do-1440.png, chu-y-1440.png, the-mo-1440.png, danh-sach-390.png; log: E12-output.txt.
    Expected đòi mỗi kiểm in DUNG nhưng có 1 SAI nên eval FAIL. Cần sửa selector đếm đường (hoặc đo trên SVG thật) trong rang/man.mjs.

- eval: E14
  run_id: minted-so-do-can-chinh-don-vi-E14-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.dh4_giu_ho_so
  verified_at: 2026-10-15T04:58:21Z
  output: |
    DUNG va-tro-ly-okr-sau-thu/E7
    da chay 92/92 lenh khac nhau
    eval da ky do: bo-xuong-kara#E10 (ma 1, ky 0)
    eval da ky do: gioi-han-tep-dom#E4 (ma 1, ky 0)
    eval da ky do: khoa-api-ghi-thua#E8 (ma 1, ky 0)
    eval da ky do: nen-chat-ai-elements#E14 (ma 1, ky 0)
    eval da ky do: moi-bai-kiem-dom-deu-chay#E2 (ma 1, ky 0)
    eval da ky do: moi-bai-kiem-dom-deu-chay#E3 (ma 1, ky 0)
    eval da ky do: moi-bai-kiem-dom-deu-chay#E4 (ma 1, ky 0)
    eval da ky do: moi-bai-kiem-dom-deu-chay#E7 (ma 1, ky 0)
    eval da ky do: toan-canh-okr#E26 (ma 1, ky 0)

- eval: E15
  run_id: minted-so-do-can-chinh-don-vi-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh4_dot_bien
  verified_at: 2026-10-15T04:58:21Z
  output: |
    dot-bien: 7/7 vet bi bat

- eval: E16
  run_id: minted-so-do-can-chinh-don-vi-E16-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh4_ranh_gioi
  verified_at: 2026-10-15T04:58:21Z
  output: |
    DUNG ranh gioi

- eval: E17
  run_id: minted-so-do-can-chinh-don-vi-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_ly_do
  verified_at: 2026-10-15T04:58:21Z
  output: |
    test-run: dropped crm_mv92js2782ig_test

### Lệnh suite (hồi quy)

Lệnh fail không gắn eval: `bun run test -- --filter=api` (3 bài đỏ: sang-kien-an "thu tuc okr vai chi OKR voi toi duoc"; hien-thi-an "THU_TU_DOC_OKR khop dung tap thu tuc doc"; hien-thi-an "ba duong x ba nguoi") và `bun run test -- --filter=app --filter=@crm/ui` (1 bài đỏ ở @crm/ui: "AC-5 — chấm bản vẽ, không chấm mã > mọi component đọc bảng dịch đều có mặt trong danh sách ca"). Hai lệnh còn lại gắn eval cùng bị đỏ là `bun _acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs` (E14) và `ui-check:E12` (E12), đã ghi ở khối eval trên.

- cmd: bun run test -- --filter=api
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-15T04:58:21Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-15T04:58:21Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T04:58:21Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T04:58:21Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T04:58:21Z

- cmd: bun run lint:slop
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-15T04:58:21Z

- cmd: bunx turbo run build --force
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T04:58:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh ở cả hai phía. Baseline không đo được cho mọi eval feature (field baseline đều là n-a, lý do ở mục dưới), nên chưa có eval nào được xác nhận đỏ trên code cũ.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts -t dh4-du-lieu": bo qua baseline: tep apps/api/test/okr-so-do-don-vi.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts -t dh4-chu-y": bo qua baseline: tep apps/api/test/okr-so-do-don-vi.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts -t dh4-quyen": bo qua baseline: tep apps/api/test/okr-so-do-don-vi.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-cach-xem: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-the: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-loc: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-mo-the: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-thu-gon: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-hep: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-trang-thai: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-chu && bun test ./test/messages-guard.spec.ts: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs: bo qua baseline: tep _acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/so-do-can-chinh-don-vi/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/so-do-can-chinh-don-vi/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs: bo qua baseline: tep _acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts -t dh4-ly-do": bo qua baseline: tep apps/api/test/okr-so-do-don-vi.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E14, E12 failed — E14: chạy lại 9 eval của các hồ sơ đã ký (bo-xuong-kara, gioi-han-tep-dom, khoa-api-ghi-thua, nen-chat-ai-elements, moi-bai-kiem-dom-deu-chay x4, toan-canh-okr) trả mã khác kỳ vọng; E12: kiểm đối chứng đường SAI vì selector rf__edge-* đếm 0 dây; thêm 3 bài đỏ ở suite api và 1 bài đỏ ở suite @crm/ui. Returned to implementation.
