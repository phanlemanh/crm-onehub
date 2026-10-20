---
schema_version: 2
feature_slug: lo-trinh-nhieu-san-pham
verdict: REJECT
failed_evals: [E17]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 483716c3f760c64eb76a9d589bb46583c8185762
human_signoff:
---

# Evidence Report: lo-trinh-nhieu-san-pham

Round 3 (chạy trên commit 483716c3f, đã gộp onehub). Mười bảy trên mười tám eval xanh: mười bốn eval chạy lại, ba eval (E5, E13, E15) mang từ round 2 vì delta không chạm paths của chúng. Verdict tổng là REJECT vì E17 đỏ: kịch bản quét khoá báo `turbo.json` nhắc tên khoá riêng ngoài `apps/agent` và `.env.example`. Cả bảy lệnh suite (bốn lệnh test, lint, lint:slop, build) đều xanh, kể cả lệnh agent-okr đã đỏ ở round 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-7 | test | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-1 | ui-check | PASS |
| E15 | AC-8 | script | PASS |
| E16 | AC-9 | test | PASS |
| E17 | AC-9 | script | FAIL |
| E18 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: mvg0tts9glh8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_lay_dau
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0tts9glh8_test

- eval: E2
  run_id: minted-lo-trinh-nhieu-san-pham-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_doc_du
  verified_at: 2026-10-20T01:44:54Z
  output: |
    Ran 2 tests across 1 file. [1083.00ms]

- eval: E3
  run_id: mvg0ttv1o5jp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_nhip
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0ttv1o5jp_test

- eval: E4
  run_id: mvg0tv4z8ren
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_hong
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0tv4z8ren_test

- eval: E5
  run_id: minted-lo-trinh-nhieu-san-pham-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_cau_trang_thai
  verified_at: 2026-10-20T00:57:49Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-lo-trinh-nhieu-san-pham-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_quyen_may_chu
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0tujvuyt1_test

- eval: E7
  run_id: minted-lo-trinh-nhieu-san-pham-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_quyen_trang
  verified_at: 2026-10-20T01:44:54Z
  output: |
    Ran 3 tests across 1 file. [1082.00ms]

- eval: E8
  run_id: minted-lo-trinh-nhieu-san-pham-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_danh_ba_may_chu
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0tvtlqkph_test

- eval: E9
  run_id: minted-lo-trinh-nhieu-san-pham-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_danh_ba_trang
  verified_at: 2026-10-20T01:44:54Z
  output: |
    Ran 4 tests across 1 file. [1489.00ms]

- eval: E10
  run_id: minted-lo-trinh-nhieu-san-pham-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_vong_doi_may_chu
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0tu4ilnoh_test

- eval: E11
  run_id: minted-lo-trinh-nhieu-san-pham-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_vong_doi_trang
  verified_at: 2026-10-20T01:44:54Z
  output: |
    Ran 2 tests across 1 file. [1010.00ms]

- eval: E12
  run_id: minted-lo-trinh-nhieu-san-pham-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_khuon
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0tw4iiwfl_test

- eval: E13
  run_id: minted-lo-trinh-nhieu-san-pham-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_do_man
  verified_at: 2026-10-20T00:57:49Z
  carried_from_round: 2
  screenshot: evidence/E13-step1.png
  observed: |
    Đã mở bằng Read 8 trong 16 ảnh gốc (lo-trinh 375 vi-sang, 375 vi-toi, 375 en-toi, 1280 vi-sang, 1280 en-toi; cai-dat 375 vi-toi, 375 en-sang, 1280 en-toi); các ảnh còn lại cùng bố cục và cùng được script kiểm (44 dòng ĐÚNG). Lộ trình 375 sáng/tối: tiêu đề «Lộ trình»/«Roadmap», bộ chọn «Kit nghiệm thu» nằm riêng một hàng BÊN DƯỚI mô tả, không đè lên tiêu đề; dòng «Lấy từ phanlemanh/acceptance-gate-kit · main lúc 07:58...» hiện rõ; chip trạng thái «Đã giao» đọc rõ trên nền tối, có chữ kèm chấm xanh. Lộ trình 1280: bộ chọn ở góc phải ngang hàng tiêu đề, dòng nguồn chứa kho và nhánh main.
    Cài đặt › Sản phẩm: 3 hàng (CRM «khai trong mã»; «Kit nghiệm thu» có chữ «Đã lấy»/«Fetched» kèm chấm xanh; «Kho hỏng» có chữ «Không thấy tệp lộ trình ở nhánh này»/«No roadmap file on this branch» kèm chấm đỏ); chữ trạng thái đọc được ở nền tối, không chỉ chấm màu. Không thấy cuộn ngang ở 375. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-lo-trinh-nhieu-san-pham-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_do_man
  verified_at: 2026-10-20T01:44:54Z
  screenshot: evidence/E14-step1.png
  observed: |
    E14-step1.png (Lo trinh 1280 vi sang): tieu de "Lộ trình", bo chon san pham "Kit nghiệm thu" o goc phai, dong "Lấy từ phanlemanh/acceptance-gate-kit · main lúc 08:45 20/10/2026", chip "Chưa xong 2 / Đã giao 54 / Xếp lại sau 0 / Tất cả 56", che do Mốc; timeline day: moc "Phát hành 2.26.0" (3 viec Đã giao) va "Phát hành 2.27.0" (15 viec Đã giao) voi thanh trang thai xanh. Trang day du noi dung, giong bo cuc trang CRM, khong o trong.
    E14-step2.png (ngan ho so): ngan mo ben phai co tieu de "Kho khai một tệp kế hoạch, thẻ mở phiên chỉ ra việc kế và việc trễ", phu de "N1 · Lộ trình kit nghiệm thu — từ 2.24.0 · nen", trang thai Đã giao, cac muc Tóm tắt hồ sơ / Chi tiết / Việc đang chờ việc này co du lieu.
    E14-step3.png (Cai dat > San pham, 1280 vi sang): dong "Kit nghiệm thu" voi "phanlemanh/acceptance-gate-kit · main · LO-TRINH.html · lấy lúc 08:45 20/10/2026 · khuôn bản 2" va nhan trang thai xanh "Đã lấy"; dong "Kho hỏng" nhan do "Không thấy tệp lộ trình ở nhánh này"; CRM co nhan "khai trong mã". Tat ca khop Expected.
  network_observed: n-a (driver)
  output: |
    Kiem doc lap fixture apps/agent/test/mau/lo-trinh-kit.html (docDuLieu): 1 lo trinh, 56 viec, tien_do={tong:56,da_giao:54,dang_lam:0,chua_bat_dau:2}; man hien "Tất cả 56 / Đã giao 54 / Chưa xong 2" - khop.
    Luu y: do-man.mjs khong dung selector [data-lo-trinh-muc] (selector do khong ton tai trong apps/app); no kiem bang [data-viec-khoa] va so tep, khong so sanh tien_do truc tiep trong dong [AC-1] — toi da doi chieu tien_do/so viec tu fixture bang tay (khop) nhung day la khac biet nho giua chu Expected va thuoc do.
    Frames da luu: E14-step1.png (trang Lo trinh kit 1280 vi sang, copy tu lo-trinh-1280-vi-sang.png), E14-step2.png (ngan ho so, copy tu ac1-ho-so-1280-vi-sang.png), E14-step3.png (Cai dat > San pham, copy tu cai-dat-1280-vi-sang.png), duoi /Users/manhphan/dev/crm/.claude/worktrees/confident-poincare-6ad2cf/_acceptance/lo-trinh-nhieu-san-pham/evidence/. Network: E14-network.txt (n-a driver puppeteer).

- eval: E15
  run_id: minted-lo-trinh-nhieu-san-pham-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_thiet_ke
  verified_at: 2026-10-20T00:57:49Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E16
  run_id: mvg0u27yrgax
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_khoa
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0u27yrgax_test

- eval: E17
  run_id: minted-lo-trinh-nhieu-san-pham-E17-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.ltsp_khoa_quet
  verified_at: 2026-10-20T01:44:54Z
  output: |
    quet-khoa: 3423 tep da quet
    SAI 1 khoa rieng chi doc trong tac nhan — khoa rieng doc ngoai tac nhan: turbo.json
    DUNG 2 khong duong nao doc lo trinh bang khoa ca nhan
    KET LUAN: SAI

- eval: E18
  run_id: mvg0u3lruwiq
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_do
  verified_at: 2026-10-20T01:44:54Z
  output: |
    test-run: dropped crm_mvg0u3lruwiq_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-20T01:44:54Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-20T01:44:54Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-20T01:44:54Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-20T01:44:54Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-20T01:44:54Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-20T01:44:54Z
  output: |
    Finished in 2.2s on 3838 files with 11 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-20T01:44:54Z

### Lệnh fail không gắn eval

Không có. Lệnh duy nhất đỏ trong vòng này, `bun _acceptance/lo-trinh-nhieu-san-pham/rang/quet-khoa.mjs`, gắn với E17 và được ghi ở khối E17 phía trên. Điều đã biết: `turbo.json` (dòng khai `GITHUB_APP_PRIVATE_KEY` trong danh sách biến môi trường của turbo, thêm ở commit c2952fc7c để turbo truyền biến GitHub) bị điều 1 của quét khoá xếp là nơi nhắc khoá riêng ngoài tác nhân; điều 2 (không đường nào đọc lộ trình bằng khoá cá nhân) đúng. Điều chưa biết: nên nới quét để cho phép `turbo.json` hay khai biến theo cách khác; đó là quyết định của người sửa, máy chỉ báo eval đỏ.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: `evals.yaml` không đổi từ lần đo baseline cuối (round 1), nên cả 18 eval mang `baseline: n-a`.

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline): không có eval nào được liệt kê. Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — mọi eval chạy một lần (runs: 1), không có pass_rate hỗn hợp và không có eval nào chập chờn trong vòng này.

## Iterations

Round 1: 18 eval xanh, 4 lệnh suite đỏ (api, app và @crm/ui, agent và auth và db, agent-okr và các gói còn lại). Returned to implementation (commit «vá suite»).
Round 2: 18 eval xanh, ba lệnh suite test đã xanh, còn gói `@crm/validation` của lệnh agent-okr hết trần 5 giây ở một ca không liên quan lộ trình sản phẩm. REJECT, hai finding trong hợp đồng (AC-1, AC-5). Returned to implementation (commit c2952fc7c khai biến GitHub cho turbo và chặn lượt lấy cũ ghi đè nguồn mới).
Round 3 (commit 483716c3f, đã gộp onehub): 17 eval xanh, E17 đỏ vì `turbo.json` nhắc tên khoá riêng ngoài tác nhân (hệ quả của việc khai biến GitHub cho turbo ở round 2); cả bảy lệnh suite xanh. REJECT. E5, E13, E15 mang từ round 2. Mốc verified_at của eval chạy lại suy từ giờ trong mã lượt chạy (mvg0tts9glh8 tới mvg0u3lruwiq) và giờ chụp khung E14; mốc của lệnh suite suy từ giờ trong mã lượt chạy của từng lệnh, lệnh không mang mã (lint, lint:slop, build) lấy mốc của lệnh liền trước.
