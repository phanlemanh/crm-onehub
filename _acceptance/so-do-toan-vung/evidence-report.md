---
schema_version: 2
feature_slug: so-do-toan-vung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d403a78797777bac13fd466678416f4d576179bb
human_signoff: Phan Le Manh 2026-10-22
---

# Evidence Report: so-do-toan-vung

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

không chạy theo hồ sơ: E11

## Evidence

- eval: E1
  run_id: minted-so-do-toan-vung-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_khung
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Ran 1 test across 1 file. [1.79s]

- eval: E2
  run_id: minted-so-do-toan-vung-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_toan_man
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Ran 2 tests across 1 file. [5.00ms]

- eval: E3
  run_id: minted-so-do-toan-vung-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_hai_kieu
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Ran 1 test across 1 file. [2.05s]

- eval: E4
  run_id: minted-so-do-toan-vung-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_loi_vao
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Ran 2 tests across 1 file. [1.86s]

- eval: E5
  run_id: minted-so-do-toan-vung-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_duong_cu
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Ran 3 tests across 1 file. [524.00ms]

- eval: E6
  run_id: minted-so-do-toan-vung-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_bo_cay
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Hai lệnh nối bằng && đều xanh; đuôi đầu ra của lượt chạy không có dòng tóm tắt số bài.

- eval: E7
  run_id: minted-so-do-toan-vung-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_hep
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Ran 1 test across 1 file. [1491.00ms]

- eval: E8
  run_id: minted-so-do-toan-vung-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_trang_thai
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Ran 1 test across 1 file. [1.79s]

- eval: E9
  run_id: minted-so-do-toan-vung-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_chu
  verified_at: 2026-10-22T11:20:48Z
  output: |
    Ran 173 tests across 1 file. [1441.00ms]

- eval: E10
  run_id: s4-r4-e10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk6_man
  verified_at: 2026-10-22T11:20:48Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/dazzling-bohr-10e829/.acceptance-runs/so-do-toan-vung/evidence/E10-step1.png
  observed: |
    thuong-1440.png (E10-step1): man toi 1440x1000, vo khu co thanh ben trai (Quy 4 · mau, Cua toi, OKR, Bao cao: Suc khoe/Moi KR/So do dang chon), dau trang breadcrumb 'Bao cao > So do gop vao', ToggleGroup 'Moi don vi 23'/'Can chu y 5' va nut 'Toan man hinh'. Khung ve [data-flow-map] lap day vung noi dung tu ngay duoi dau trang toi sat day man hinh (day ~976/1000), co cay don vi (OneHub Center -> Khoi Kinh doanh/Van hanh/Ho tro/So do - Khoi A.../B1,B2,B3), dieu khien zoom 49% o day, khong thanh cuon trang. Khop Expected.
    toan-man-1440.png (E10-step2): thanh ben khu vang, nut doi thanh 'Thoat toan man hinh', khung ve rong ra tron vung ben trai (tu x~80 den ~1416), cay don vi giu nguyen va dich sang trai; khop Expected.
    sau-esc-1440.png (E10-step3): thanh ben tro lai day du sau Esc, nut 'Toan man hinh' co vien focus xanh, khung ve nhu thuong; khop.
    quanh-1440.png (E10-step4): trang /okr/so-do/muc-tieu/mau-okr-mt-sd-a-1, breadcrumb 'Bao cao > So do > So do · A1 gop muc tieu khoi A', 'Dang xem quanh: ...', dong 'Gop len cong ty qua KR «Doanh thu hop dong moi dat 48 ty dong» cua muc tieu «Tro thanh doi tac logistics...»', the tam (vien xanh) 'A1 gop muc tieu khoi A' 50%, the KR1 0% / KR2 100% ben duoi, the 'A gop KR doanh thu nam' phia tren; khop dong gop len cong ty = KR n1-k1.
    hep-ca-cong-ty-390.png (E10-step5): 390x844, khong khung ve, khong nut toan man; la danh sach the don vi (So do · B1, B2, B3, X) dang cuon toi cuoi, khong cuon ngang, thanh tab Bo OKR/Lay y kien/Suc khoe/Moi KR/So do hien. Khop.
    hep-quanh-390.png (E10-step6): 390x844, danh sach doc nhom 'Muc tieu nay', 'KR cua no' (KR1 0%, KR2 100%), phan dau co dong 'Gop len cong ty qua KR...', 'Ve so do ca cong ty' o dau; khong khung ve, khong cuon ngang. Khop. Moi frame phu hop Expected.
  network_observed: n-a (driver)
  output: |
    - DUNG 1440 console khong loi (0); DUNG du 6 anh (6)
    Doi chung do (ban sao PageShell mac dinh, khung 600px, <a> thuong) khong nam trong lenh khai nen khong chay o day; chi chay nguyen lenh khai.
    Anh goc do lenh tu ghi (.acceptance-runs/so-do-toan-vung/man/): thuong-1440, toan-man-1440, sau-esc-1440, quanh-1440, hep-ca-cong-ty-390, hep-quanh-390 (.png). Ban sao danh so luu o .acceptance-runs/so-do-toan-vung/evidence/E10-step1..6.png (step1 thuong-1440, step2 toan-man-1440, step3 sau-esc-1440, step4 quanh-1440, step5 hep-ca-cong-ty-390, step6 hep-quanh-390). LUU Y: rao cam tao tep trong kho nen khong ghi vao _acceptance/so-do-toan-vung/evidence/; dung .acceptance-runs/ thay the. Network: driver puppeteer khong co duong doc network; chi co dem loi console (0). Ghi chu quan sat: o quanh-1440 the tren cung (the gop vao cong ty) bi cat o mep tren khung ve, khong thuoc assertion nao.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-22T11:20:48Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-10-22T11:20:48Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-22T11:20:48Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-22T11:20:48Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-do-toan-vung-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-22T11:20:48Z

- cmd: bun run lint:slop
  run_id: minted-so-do-toan-vung-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-22T11:20:48Z

- cmd: bunx turbo run build --force
  run_id: minted-so-do-toan-vung-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-22T11:20:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-khung: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-toan-man && bun test ./test/okr-toan-man-hinh.spec.ts: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-hai-kieu: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-loi-vao.dom.tsx -t vk6-loi-vao: bo qua baseline: tep apps/app/test/okr-so-do-loi-vao.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/so-do-toan-vung-duong-cu.spec.ts -t vk6-duong-cu: bo qua baseline: tep apps/app/test/so-do-toan-vung-duong-cu.spec.ts co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-bo-cay && bun test ./test/so-do-toan-vung-duong-cu.spec.ts -t vk6-bo-cay: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-hep: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-trang-thai: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-chu && bun test ./test/messages-guard.spec.ts: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lich su chi tiet nam o ban round truoc, khong chep lai o day (nhat ky ghi E11 do ngay vong nay).
Round 2: E1–E10 xanh, 7 lenh suite xanh; E11 BLOCKED vi giu-ho-so.mjs vuot thoi luong khai (long_running) va chua tra dong ma thoat. Cach go: chay lai E11 voi tool timeout dai hon, khong can sua code.
Round 3: E1–E10 xanh; 6 trong 7 lenh suite xanh, `bunx turbo run lint --force` do (khong gan eval); E11 BLOCKED lan nua vi lenh bi SIGTERM sau 201 phut, nguon chua ro. Can nguoi quyet cach chay lai E11 va xem nhat ky lint day du.
Round 4: E1–E10 xanh (E10 co 6 anh, 0 loi console); ca 7 lenh suite xanh, gom lint va build; E11 khong chay theo ho so. Verdict PASS.

### Re-pin lần 1 — 2026-10-23, do hoá cũ do so-do-toan-vung (VK6) — thước sửa tại chỗ theo V3-25 A, V3-27 B, V3-30; AC-10 chứng ở bước ghim lại
run_id: repin-20261023T053547Z-88592
sha: 61a3518c3b50b551c3eb7be75d9e72af7bd1b95f · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E11 · ngoài làn máy: E10 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-25, do hoá cũ do so-do-toan-vung (VK6) sau gộp onehub 49843223e — thước sửa tại chỗ theo V3-25 A, V3-27 B, V3-33, V3-38, V3-39 A, C1 lối b; AC-10 chứng ở bước ghim lại
run_id: repin-20261025T052030Z-41118
sha: d403a78797777bac13fd466678416f4d576179bb · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E11 · ngoài làn máy: E10 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10 · chập chờn (đỏ lần đầu, đạt khi chạy lại): trang-bo-okr E2 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
