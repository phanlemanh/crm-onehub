---
schema_version: 2
feature_slug: va-gantt-lich-bay-ngay
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f88e754c2ceb18ae8f82fb09760f7d1792ad49f8
human_signoff:
---

# Evidence Report: va-gantt-lich-bay-ngay

Round 1. Mọi eval máy đều xanh. Hợp đồng là T3 nên mục E9 (judgment) chờ người ở Cổng 2: máy chỉ đề xuất, chưa có human_override.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-7 | test | PASS |
| E7 | AC-1 | script | PASS |
| E8 | AC-8 | ui-check | PASS |
| E8b | AC-4 | ui-check | PASS |
| E9 | AC-9 | judgment | PENDING-JUDGMENT |

## Evidence

- eval: E1
  run_id: minted-va-gantt-lich-bay-ngay-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vg_lich_api
  verified_at: 2026-10-19T22:46:29Z
  output: |
    test-run: dropped crm_mvfujvlgngpw_test
    __EXIT=0

- eval: E2
  run_id: mvfujvr3oqsy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vg_lich_db
  verified_at: 2026-10-19T22:46:29Z
  output: |
    test-run: dropped crm_mvfujvr3oqsy_test
    __EXIT=0

- eval: E2b
  run_id: minted-va-gantt-lich-bay-ngay-E2b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dg_lich
  verified_at: 2026-10-19T22:46:29Z
  output: |
    test-run: dropped crm_mvfujvoqjuhd_test
    __EXIT=0

- eval: E3
  run_id: minted-va-gantt-lich-bay-ngay-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vg_lich_api
  verified_at: 2026-10-19T22:46:29Z
  output: |
    test-run: dropped crm_mvfujvlgngpw_test
    __EXIT=0

- eval: E3b
  run_id: minted-va-gantt-lich-bay-ngay-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vg_gantt_ui
  verified_at: 2026-10-19T22:46:29Z
  output: |
    Ran 1 test across 1 file. [781.00ms]
    __EXIT=0

- eval: E4
  run_id: minted-va-gantt-lich-bay-ngay-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vg_lich_api
  verified_at: 2026-10-19T22:46:29Z
  output: |
    test-run: dropped crm_mvfujvlgngpw_test
    __EXIT=0

- eval: E5
  run_id: minted-va-gantt-lich-bay-ngay-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vg_tran_viec
  verified_at: 2026-10-19T22:46:29Z
  output: |
    test-run: dropped crm_mvfujvo3mz31_test
    __EXIT=0

- eval: E6
  run_id: minted-va-gantt-lich-bay-ngay-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vg_tran_viec
  verified_at: 2026-10-19T22:46:29Z
  output: |
    test-run: dropped crm_mvfujvo3mz31_test
    __EXIT=0

- eval: E6b
  run_id: minted-va-gantt-lich-bay-ngay-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vg_tran_viec
  verified_at: 2026-10-19T22:46:29Z
  output: |
    test-run: dropped crm_mvfujvo3mz31_test
    __EXIT=0

- eval: E7
  run_id: minted-va-gantt-lich-bay-ngay-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vg_dot_bien
  verified_at: 2026-10-19T22:46:29Z
  output: |
    vg dot bien: 7/7 dot bien chet
    __EXIT=0

- eval: E8
  run_id: minted-va-gantt-lich-bay-ngay-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vg_man
  verified_at: 2026-10-19T22:46:29Z
  screenshot: evidence/E8-step1.png
  observed: |
    1) vg-lich-t7cn-1280.png: man «Lich lam viec» (Cai dat), the «Ngay nghi trong tuan» co bay nut Thu 2, 3, 4, 5, 6, Thu 7, Chu nhat; dung hai nut Thu 7 va Chu nhat co vien xanh (trang thai chon), 5 nut kia vien xam. Khop Expected. Phan Ngay le trong («Chua co ngay le»).
    2) vg-gantt-t7cn-1280.png: Gantt du an «Mo kho Binh Duong kfujxpf», 2 viec 22/10-27/10; cac cot Thu 7 17, CN 18, Thu 7 24, CN 25, Thu 7 31 to nen soc cheo mo, cac cot ngay thuong khong to; thanh viec Dung ke kho (22-27/10) va Nhap hang dot dau (23-26/10) vat qua cot 24 va 25 da to. Khop Expected (cot 24/10, 25/10 to nen).
    3) vg-lich-rong-1280.png: sau khi bo Thu 7 va Chu nhat va tai lai, bay nut deu vien xam, khong nut nao duoc chon. Khop Expected.
    4) vg-gantt-rong-1280.png: cung du an, Gantt khong to nen cot nao (Thu 7 24, CN 25, Thu 7 31 deu nen thuong); chi con cot hom nay xanh nhat va duong do. Khop Expected.
    5) vg-lich-rong-375.png: kho 375, man Lich lam viec bo cuc doc, the ngay nghi co Thu 2 den Thu 7 (cat dan), khong nut nao duoc chon; khong thay tran ngang cua trang (man.mjs scrollWidth <= 375). Khop Expected (luu y nut bi cat ben trong the).
    6) vg-gantt-rong-375.png: kho 375, trang Viec voi Gantt, thanh viec va cot Thu 6 23, Thu 7 24, CN 25 khong to nen; bo cuc vua khung, khong tran ngang trang. Khop Expected.
    Ghi chu nhe, khong lam fail Expected: o 375 hang bay nut thu trong the «Ngay nghi trong tuan» bi cat o 'Thu 7' (cuon ngang ben trong the, Chu nhat khong thay), nhung trang khong cuon ngang theo phep do scrollWidth.
  network_observed: n-a (driver)
  output: |
    Frame da luu (goc + ban sao E8-stepN): vg-lich-t7cn-1280.png = E8-step1.png; vg-gantt-t7cn-1280.png = E8-step2.png; vg-lich-rong-1280.png = E8-step3.png; vg-gantt-rong-1280.png = E8-step4.png; vg-lich-rong-375.png = E8-step5.png; vg-gantt-rong-375.png = E8-step6.png (trong _acceptance/va-gantt-lich-bay-ngay/evidence/).
    Con co vg-hoan-tac-ve-rong-1280.png, vg-hoan-tac-ve-co-nghi-1280.png (buoc 4, khong thuoc Expected).
    Network: driver la script man.mjs (khong co tool doc network) nen n-a (driver); khong ghi E8-network.txt.

- eval: E8b
  run_id: minted-va-gantt-lich-bay-ngay-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vg_man
  verified_at: 2026-10-19T22:46:29Z
  screenshot: evidence/E8b-step1.png
  observed: |
    vg-hoan-tac-ve-rong-1280.png (da mo bang Read): trang Cai dat > Lich lam viec, dark theme, muc 'Ngay nghi trong tuan' co bay nut Thu 2, Thu 3, Thu 4, Thu 5, Thu 6, Thu 7, Chu nhat deu o trang thai khong chon (vien xam, khong vien xanh); 'Ngay le' hien 'Chua co ngay le'. Khop Expected (0 o chon).
    vg-hoan-tac-ve-co-nghi-1280.png (da mo bang Read): cung man hinh, dung mot nut 'Chu nhat' co vien xanh la (trang thai chon), Thu 2 den Thu 7 khong chon. Khop Expected (dung mot o data-thu 7 chon). Khop voi HTML da assert.
  network_observed: n-a (driver)
  output: |
    Frame da luu (capture trong man.mjs, 1280): vg-hoan-tac-ve-rong-1280.png (= E8b-step1.png), vg-hoan-tac-ve-co-nghi-1280.png (= E8b-step2.png), kem .html cung ten, trong _acceptance/va-gantt-lich-bay-ngay/evidence/.
    Network: driver la script Playwright cua man.mjs, khong co read_network_requests; E8b-network.txt ghi chu 'n-a (driver)'.
    Dev server do phien do tu dung va tu don (khong server nao con chay do toi start).

- eval: E9
  judged_by: judge panel ba lens (fresh context), đề xuất của máy
  verdict: PASS
  rationale: Đề xuất PASS của máy, chưa phải kết luận. Hợp đồng là T3 nên mọi mục judgment đều chờ người xác nhận trực tiếp ở Cổng 2.
  panel: domain-correctness, operational-feasibility, spec-alignment
  votes:
    - domain-correctness: PASS — docs/api.md mục «Lịch làm việc» (dòng 665-669) nêu đủ: lịch chưa đặt nghỉ Thứ Bảy, Chủ nhật; bỏ chọn hết thì bật `khongNghiTuan`, không nghỉ ngày nào, ở mọi đường đọc. Mục này không còn câu nào nói ngayNghiTuan rỗng nghĩa là mặc định. Mục «Trần 300 việc» (dòng 661-664) nói trần chỉ chặn việc thêm vào dự án (`viec.create` có `duAnId`, `viec.taoCon`, `viec.doiDuAn` chuyển vào), còn mốc, phụ thuộc và đổi ngày dùng `docDuAnMo` và chỉ bị chặn khi dự án đã đóng. CONTEXT.md dòng 266 ghi «Quản trị bỏ chọn hết thì không nghỉ ngày nào trong tuần».
    - operational-feasibility: PASS — docs/api.md (dòng 665-669) nêu lịch chưa đặt nghỉ Thứ Bảy, Chủ nhật; `datNgayNghiTuan([])` bật `khongNghiTuan` là không nghỉ ngày nào; mục này không có câu nào nói ngayNghiTuan rỗng nghĩa là mặc định (grep không thấy). Mục «Vòng đời» và «Trần 300 việc» (dòng 657-664) nói trần chỉ chặn thêm việc (create có duAnId, taoCon, doiDuAn), còn mốc, phụ thuộc, đổi ngày dùng `docDuAnMo` và chỉ chặn khi dự án đã đóng. CONTEXT.md dòng 266 ghi «Quản trị bỏ chọn hết thì không nghỉ ngày nào trong tuần (hàng DA12)».
    - spec-alignment: PASS — Cả ba điều đều có. docs/api.md dòng 665-669 nói lịch chưa đặt nghỉ Thứ Bảy, Chủ nhật; `datNgayNghiTuan([])` bật `khongNghiTuan` nên không nghỉ ngày nào; không còn câu nào nói ngayNghiTuan rỗng nghĩa là mặc định (grep "ngayNghiTuan" chỉ ra dòng 667). Dòng 661-664 nói trần 300 chỉ chặn tạo, việc con và chuyển vào, còn mốc, phụ thuộc và đổi ngày chỉ bị chặn khi dự án đã đóng (kèm dòng 657-658 về dự án đã đóng). CONTEXT.md dòng 266 nói quản trị bỏ chọn hết thì không nghỉ ngày nào trong tuần.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-va-gantt-lich-bay-ngay-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-19T22:46:29Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-va-gantt-lich-bay-ngay-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-19T22:46:29Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-va-gantt-lich-bay-ngay-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-19T22:46:29Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-va-gantt-lich-bay-ngay-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-19T22:46:29Z

- cmd: bunx turbo run lint --force
  run_id: minted-va-gantt-lich-bay-ngay-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-19T22:46:29Z

- cmd: bun run lint:slop
  run_id: minted-va-gantt-lich-bay-ngay-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-19T22:46:29Z

- cmd: bunx turbo run build --force
  run_id: minted-va-gantt-lich-bay-ngay-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-19T22:46:29Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào pass trên cả baseline lẫn HEAD. E2b red trên baseline (có phân biệt); các eval còn lại không đo được baseline (xem dưới).

Baseline khong do
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/lich-bay-ngay.spec.ts": bo qua baseline: tep apps/api/test/lich-bay-ngay.spec.ts co o cay dang kiem nhung chua co o merge-base 17c3a1fb8ea24f7e02600567f84949dc5e729517 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && TZ=Asia/Ho_Chi_Minh bun test test/lich-bay-ngay.spec.ts": bo qua baseline: tep packages/db/test/lich-bay-ngay.spec.ts co o cay dang kiem nhung chua co o merge-base 17c3a1fb8ea24f7e02600567f84949dc5e729517 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup-dom.ts ./test/gantt-bay-ngay.dom.tsx: bo qua baseline: tep packages/ui/test/gantt-bay-ngay.dom.tsx co o cay dang kiem nhung chua co o merge-base 17c3a1fb8ea24f7e02600567f84949dc5e729517 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test --timeout 120000 test/du-an-tran-viec.spec.ts": bo qua baseline: tep apps/api/test/du-an-tran-viec.spec.ts co o cay dang kiem nhung chua co o merge-base 17c3a1fb8ea24f7e02600567f84949dc5e729517 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-gantt-lich-bay-ngay/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/va-gantt-lich-bay-ngay/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 17c3a1fb8ea24f7e02600567f84949dc5e729517 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, deterministic)

## Iterations

Round 1: mọi eval máy xanh; E9 (judgment, T3) chờ người xác nhận ở Cổng 2. Chưa có vòng nào bị trả về.

### Re-pin lần 1 — 2026-10-20, do gộp onehub a0b110b06 (VS8, VK4, l7) sau S4 vòng 1
run_id: repin-20261020T014231Z-56910
sha: f88e754c2ceb18ae8f82fb09760f7d1792ad49f8 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E8, E8b, E9 (E9 không khai paths) · AC không có chốt máy: AC-8, AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
