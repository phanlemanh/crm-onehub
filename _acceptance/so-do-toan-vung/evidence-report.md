---
schema_version: 2
feature_slug: so-do-toan-vung
verdict: BLOCKED
failed_evals: []
reason: "E11 (bun _acceptance/so-do-toan-vung/rang/giu-ho-so.mjs) vuot thoi luong khai (long_running): lenh cho tra __QUA_HAN, chua co dong __EXIT= nen khong co ma thoat de doc. Cach go: chay lai lenh nay voi Bash timeout dai hon (xem tool-kill-rule.md), khong phai sua code."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 016c181998ea3a0c7fc84aeee8d7196a0c698897
human_signoff:
---

# Evidence Report: so-do-toan-vung

Round 2. Mười eval máy (E1–E10) cho kết quả xanh; E11 bị chặn vì lệnh vượt thời lượng khai và chưa trả dòng mã thoát. Verdict tổng là BLOCKED, không phải lỗi mã.

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
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-10 | script | BLOCKED |

## Evidence

- eval: E1
  run_id: minted-so-do-toan-vung-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_khung
  verified_at: 2026-10-21T22:50:53Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-khung
    Ran 1 test across 1 file. [2.27s]

- eval: E2
  run_id: minted-so-do-toan-vung-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_toan_man
  verified_at: 2026-10-21T22:50:53Z
  output: |
    cd apps/app && ... okr-so-do-toan-vung.dom.tsx -t vk6-toan-man && bun test ./test/okr-toan-man-hinh.spec.ts
    Ran 2 tests across 1 file. [13.00ms]

- eval: E3
  run_id: minted-so-do-toan-vung-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_hai_kieu
  verified_at: 2026-10-21T22:50:53Z
  output: |
    cd apps/app && ... okr-so-do-toan-vung.dom.tsx -t vk6-hai-kieu
    Ran 3 tests across 1 file. [2.69s]

- eval: E4
  run_id: minted-so-do-toan-vung-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_loi_vao
  verified_at: 2026-10-21T22:50:53Z
  output: |
    cd apps/app && ... okr-so-do-loi-vao.dom.tsx -t vk6-loi-vao
    Ran 2 tests across 1 file. [2.43s]

- eval: E5
  run_id: minted-so-do-toan-vung-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_duong_cu
  verified_at: 2026-10-21T22:50:53Z
  output: |
    cd apps/app && bun test ./test/so-do-toan-vung-duong-cu.spec.ts -t vk6-duong-cu
    Ran 3 tests across 1 file. [554.00ms]

- eval: E6
  run_id: minted-so-do-toan-vung-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_bo_cay
  verified_at: 2026-10-21T22:50:53Z
  output: |
    okr-so-do-toan-vung.dom.tsx -t vk6-bo-cay && so-do-toan-vung-duong-cu.spec.ts -t vk6-bo-cay
    (lenh thoat bang ma 0; khong co dong tom tat "Ran N tests" trong phan duoi dau ra)

- eval: E7
  run_id: minted-so-do-toan-vung-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_hep
  verified_at: 2026-10-21T22:50:53Z
  output: |
    cd apps/app && ... okr-so-do-toan-vung.dom.tsx -t vk6-hep
    Ran 1 test across 1 file. [2.27s]

- eval: E8
  run_id: minted-so-do-toan-vung-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_trang_thai
  verified_at: 2026-10-21T22:50:53Z
  output: |
    cd apps/app && ... okr-so-do-toan-vung.dom.tsx -t vk6-trang-thai
    Ran 1 test across 1 file. [2.84s]

- eval: E9
  run_id: minted-so-do-toan-vung-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_chu
  verified_at: 2026-10-21T22:50:53Z
  output: |
    okr-so-do-toan-vung.dom.tsx -t vk6-chu && bun test ./test/messages-guard.spec.ts
    Ran 170 tests across 1 file. [1.62s]

- eval: E10
  run_id: minted-so-do-toan-vung-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk6_man
  verified_at: 2026-10-21T22:50:53Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/dazzling-bohr-10e829/.acceptance-runs/so-do-toan-vung/man/thuong-1440.png
  observed: |
    Đã mở từng ảnh bằng Read. thuong-1440: thanh bên khu rộng khoảng 224px (Sơ đồ đang chọn), dải công cụ Báo cáo › Sơ đồ góp vào cùng chip lọc và nút «Toàn màn hình»; khung vẽ phủ gần hết vùng nội dung, không thanh cuộn trang, cây công ty zoom 49% có chú giải nét liền/nét đứt.
    toan-man-1440: thanh bên vắng, khung vẽ rộng khoảng 1336px, nút thành «Thoát toàn màn hình»; sau-esc-1440: thanh bên và nút «Toàn màn hình» trở lại. quanh-1440: breadcrumb Báo cáo › Sơ đồ › tên tâm, liên kết «Về sơ đồ cả công ty», dòng «Đang xem quanh», dòng góp lên công ty qua một KR, thẻ tâm viền xanh 50%, hai KR con và một thẻ cha (thẻ trên cùng bị cắt nhẹ ở mép trên khung ở zoom 100%).
    hep-ca-cong-ty-390: thanh tab ngang, danh sách thẻ đơn vị dọc, không khung vẽ, không nút toàn màn hình, không cuộn ngang; hep-quanh-390: dạng danh sách có hộp «Góp lên công ty…», nhóm «Mục tiêu này» và «KR của nó», không khung vẽ, không cuộn ngang. Cả sáu ảnh khớp expected.
  network_observed: n-a (driver)
  output: |
    Sáu ảnh do chính lệnh eval ghi tại .acceptance-runs/so-do-toan-vung/man/: thuong-1440.png, toan-man-1440.png, sau-esc-1440.png, quanh-1440.png, hep-ca-cong-ty-390.png, hep-quanh-390.png.
    Theo rào của lượt chấm, ảnh không được chép sang _acceptance/so-do-toan-vung/evidence/. Driver là puppeteer trong tiến trình con nên không có E10-network.txt; console không lỗi theo chính script.

- eval: E11
  run_id: minted-so-do-toan-vung-E11-r2
  exit_code: không có (BLOCKED: lệnh vượt thời lượng khai, chưa có dòng mã thoát)
  baseline: n-a
  verifier: config:executors.script.vk6_giu_ho_so
  verified_at: 2026-10-21T22:50:53Z
  output: |
    DO: chan cua ho so DA KY van khong chay duoc:
      _acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs
    config.yaml tai sha ghim parse duoc bang YAML: KHONG
    __QUA_HAN (cho tra, khong co dong ma thoat; tien trinh con bi tool cat)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-21T22:50:53Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-21T22:50:53Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-21T22:50:53Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-21T22:50:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-do-toan-vung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-21T22:50:53Z

- cmd: bun run lint:slop
  run_id: minted-so-do-toan-vung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-21T22:50:53Z

- cmd: bunx turbo run build --force
  run_id: minted-so-do-toan-vung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-21T22:50:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1). Moi block eval ghi baseline: n-a. Lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

Eval khong-phan-biet: none

Judge panels: khong co eval judgment nao trong hop dong nay, nen khong co panel va khong co muc cho human_override.

## Variance

none — moi eval chay mot lan, deterministic, khong co pass_rate hon hop.

## Iterations

Round 1: lich su chi tiet nam o ban round truoc, khong chep lai o day.
Round 2: E1–E10 xanh, 7 lenh suite xanh; E11 BLOCKED vi giu-ho-so.mjs vuot thoi luong khai (long_running) va chua tra dong ma thoat. Cach go: chay lai E11 voi tool timeout dai hon, khong can sua code.
