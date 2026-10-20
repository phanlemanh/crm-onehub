---
schema_version: 2
feature_slug: lo-trinh-nhieu-san-pham
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 15a39fce6f0f61055880300ab57eeafb8a412b25
human_signoff:
---

# Evidence Report: lo-trinh-nhieu-san-pham

Round 2 (chạy lại trên commit 15a39fce6). Mười tám eval đều xanh, cả ba eval trước đây mang từ round 1 (E6, E7, E18) nay đã chạy lại. Verdict tổng là REJECT vì một lệnh suite không gắn eval còn đỏ: `bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation`. Chi tiết ở mục «Lệnh fail không gắn eval». Ba lệnh test suite khác (api · app và @crm/ui · agent, @crm/auth và @crm/db) cùng lint, lint:slop và build đều xanh.

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
| E17 | AC-9 | script | PASS |
| E18 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: mvfz56at7z2s
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_lay_dau
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz56at7z2s_test

- eval: E2
  run_id: minted-lo-trinh-nhieu-san-pham-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_doc_du
  verified_at: 2026-10-20T00:57:49Z
  output: |
    Ran 2 tests across 1 file. [802.00ms]

- eval: E3
  run_id: mvfz56q36nos
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_nhip
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz56q36nos_test

- eval: E4
  run_id: mvfz57bnxfxv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_hong
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz57bnxfxv_test

- eval: E5
  run_id: minted-lo-trinh-nhieu-san-pham-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_cau_trang_thai
  verified_at: 2026-10-20T00:57:49Z
  output: |
    Ran 3 tests across 2 files. [1.85s]

- eval: E6
  run_id: minted-lo-trinh-nhieu-san-pham-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_quyen_may_chu
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz581ycmgw_test

- eval: E7
  run_id: minted-lo-trinh-nhieu-san-pham-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_quyen_trang
  verified_at: 2026-10-20T00:57:49Z
  output: |
    Ran 3 tests across 1 file. [855.00ms]

- eval: E8
  run_id: minted-lo-trinh-nhieu-san-pham-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_danh_ba_may_chu
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz57o8frtb_test

- eval: E9
  run_id: minted-lo-trinh-nhieu-san-pham-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_danh_ba_trang
  verified_at: 2026-10-20T00:57:49Z
  output: |
    Ran 4 tests across 1 file. [762.00ms]

- eval: E10
  run_id: minted-lo-trinh-nhieu-san-pham-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_vong_doi_may_chu
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz58kjtelm_test

- eval: E11
  run_id: minted-lo-trinh-nhieu-san-pham-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_vong_doi_trang
  verified_at: 2026-10-20T00:57:49Z
  output: |
    Ran 2 tests across 1 file. [1032.00ms]

- eval: E12
  run_id: mvfz5dsemzma
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_khuon
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz5dsemzma_test

- eval: E13
  run_id: minted-lo-trinh-nhieu-san-pham-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_do_man
  verified_at: 2026-10-20T00:57:49Z
  screenshot: evidence/E13-step1.png
  observed: |
    Đã mở bằng Read 8 trong 16 ảnh gốc (lo-trinh 375 vi-sang, 375 vi-toi, 375 en-toi, 1280 vi-sang, 1280 en-toi; cai-dat 375 vi-toi, 375 en-sang, 1280 en-toi); các ảnh còn lại cùng bố cục và cùng được script kiểm (44 dòng ĐÚNG). Lộ trình 375 sáng/tối: tiêu đề «Lộ trình»/«Roadmap», bộ chọn «Kit nghiệm thu» nằm riêng một hàng BÊN DƯỚI mô tả, không đè lên tiêu đề; dòng «Lấy từ phanlemanh/acceptance-gate-kit · main lúc 07:58...» hiện rõ; chip trạng thái «Đã giao» đọc rõ trên nền tối, có chữ kèm chấm xanh. Lộ trình 1280: bộ chọn ở góc phải ngang hàng tiêu đề, dòng nguồn chứa kho và nhánh main.
    Cài đặt › Sản phẩm: 3 hàng (CRM «khai trong mã»; «Kit nghiệm thu» có chữ «Đã lấy»/«Fetched» kèm chấm xanh; «Kho hỏng» có chữ «Không thấy tệp lộ trình ở nhánh này»/«No roadmap file on this branch» kèm chấm đỏ); chữ trạng thái đọc được ở nền tối, không chỉ chấm màu. Không thấy cuộn ngang ở 375. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Các dòng ĐÚNG: AC-1 cai-dat (kit «Đã lấy», có giờ lấy), AC-1 lo-trinh (1/1 trên màn), AC-1 ho-so (ngăn hồ sơ mở); ô 1280-vi-sáng có liên kết tìm PR (repo:phanlemanh/...); cả 8 ô (375/1280 x vi/en x sáng/tối) đủ 5 dòng: URL mang tham số sản phẩm và giữ sau tải lại, dòng nguồn chứa kho phanlemanh/acceptance-gate-kit và nhánh main; thành viên không được cấp: ô chọn false, tên sản phẩm false; tên sản phẩm không dịch true, mốc thiếu translate=no 0/10; 2 hàng có chữ trạng thái, rỗng 0, hàng hỏng nói «Không thấy tệp lộ trình ở nhánh này»; không cuộn ngang ở lộ trình và cài đặt. Cả 40 dòng của 8 ô đều ĐÚNG.
    Lưu ý nhỏ: Expected viết tắt «?san-pham=kit»; bản thật dùng tham số ?sanPham=kit-nghiem-thu (tên hiển thị «Kit nghiệm thu»), script khẳng định theo hợp đồng thật.
    16 khung đã lưu: evidence/E13-step1.png tới E13-step16.png, kèm E13-network.txt (driver puppeteer không đọc được network).

- eval: E14
  run_id: minted-lo-trinh-nhieu-san-pham-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_do_man
  verified_at: 2026-10-20T00:57:49Z
  screenshot: evidence/E14-step1.png
  observed: |
    E14-step1.png (Cài đặt › Sản phẩm, 1280 vi sáng): 3 hàng. CRM «khai trong mã»; «Kit nghiệm thu» phanlemanh/acceptance-gate-kit · main · LO-TRINH.html · «lấy lúc 07:59 20/10/2026 · khuôn bản 2» kèm chấm xanh và chữ «Đã lấy»; «Kho hỏng» chấm đỏ kèm «Không thấy tệp lộ trình ở nhánh này». Khớp Expected (kit ở trạng thái đã lấy kèm giờ).
    E14-step2.png (Lộ trình, chọn «Kit nghiệm thu», 1280 vi sáng): tiêu đề Lộ trình, bộ chọn «Kit nghiệm thu», dòng «Lấy từ phanlemanh/acceptance-gate-kit · main lúc 07:59 20/10/2026», ô tìm, chip Chưa xong 2 / Đã giao 54 / Xếp lại sau 0 / Tất cả 56 (khớp tien_do của fixture: 56 tổng, 54 đã giao, 2 chưa bắt đầu), chế độ Mốc đang chọn, các mốc «Phát hành 2.26.0» (3 việc) và «Phát hành 2.27.0» (15 việc) với thẻ việc có nhãn «Đã giao». Đủ nội dung, bố cục giống trang CRM, không ở trạng thái trống.
    E14-step3.png (ngăn hồ sơ mở từ việc N1, 1280): tiêu đề «Kho khai một tệp kế hoạch, thẻ mở phiên chỉ ra việc kế và việc trễ», các ô Trạng thái Đã giao / Mốc / Lộ trình «Lộ trình kit nghiệm thu — ...» / Nhóm nền, tab Tổng quan + Số liệu, tóm tắt hồ sơ đầy đủ. Ngăn mở có tiêu đề, khớp Expected.
  network_observed: n-a (driver)
  output: |
    Đối chiếu fixture (đọc ngoài script bằng docDuLieu): 1 lộ trình, tien_do tổng 56 / đã giao 54 / đang làm 0 / chưa bắt đầu 2, 12 mốc, 56 hàng, khớp chip trên màn (2/54/0/56).
    Khoảng cách với Expected cần ghi nhận: bộ chọn [data-lo-trinh-muc] không tồn tại trong mã app (chỉ xuất hiện trong evals.yaml và s4-args.json), và do-man.mjs không so trực tiếp số [data-lo-trinh-muc] hay tien_do của lộ trình đầu; nó so tập tệp lộ trình trên màn (1/1) với fixture. Người chạy bù bằng cách so số chip tiến độ trên ảnh với tien_do của fixture. Không sửa mã.
    Khung đã lưu: evidence/E14-step1.png, E14-step2.png, E14-step3.png; E14-network.txt (driver puppeteer không đọc được network).

- eval: E15
  run_id: minted-lo-trinh-nhieu-san-pham-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_thiet_ke
  verified_at: 2026-10-20T00:57:49Z
  output: |
    design-gate --mode static chạy qua vòng lặp mọi tệp tsx của trang Lộ trình và Cài đặt › Sản phẩm, không tệp nào dừng vòng lặp (đuôi đầu ra chỉ còn dấu đóng khối của design-gate).

- eval: E16
  run_id: mvfz5dt09x9w
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_khoa
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz5dt09x9w_test

- eval: E17
  run_id: minted-lo-trinh-nhieu-san-pham-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_khoa_quet
  verified_at: 2026-10-20T00:57:49Z
  output: |
    KET LUAN: DUNG

- eval: E18
  run_id: mvfz5f7c0qed
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_do
  verified_at: 2026-10-20T00:57:49Z
  output: |
    test-run: dropped crm_mvfz5f7c0qed_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-20T00:57:49Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-20T00:57:49Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-20T00:57:49Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 1
  verified_at: 2026-10-20T00:57:49Z
  output: |
    @crm/validation:test: 1 tests failed:
    @crm/validation:test: (fail) tai-lieu-diff > tran-duoi-khoi: dao-thu-tu [113400.97ms]
    @crm/validation:test:   ^ this test timed out after 5000ms.
    @crm/validation:test:  603 pass
    @crm/validation:test:  1 fail
    @crm/validation:test: Ran 604 tests across 54 files. [121.73s]
    Tasks: 3 successful, 6 total; Failed: @crm/validation#test

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-20T00:57:49Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-20T00:57:49Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-20T00:57:49Z

### Lệnh fail không gắn eval

Một lệnh, không gắn eval nào: `bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation`. Gói `@crm/validation` có 603 ca qua, 1 ca đỏ: `tai-lieu-diff > tran-duoi-khoi: dao-thu-tu`, hết trần 5 giây của `bun test` sau 113 giây. Ba gói còn lại của lệnh (`agent-okr`, `@crm/telemetry` và các gói khác trong lọc) không báo ca đỏ; lệnh dừng ở gói đỏ này.

Điều đã biết: tên ca là bài về diff tài liệu, không nhắc tới lộ trình sản phẩm; thời gian 113 giây so với trần 5 giây cho thấy ca chạy trong lúc máy bị tải nặng hoặc bị treo, chưa phải bằng chứng mã sai. Điều chưa biết: nguyên nhân thật (tải máy hay lỗi mã), vì vòng này chưa chạy lại riêng gói `@crm/validation` để so. Máy không phán lệnh này vô hại; chạy lại riêng lệnh này (không song song với việc nặng khác) rồi đọc đuôi đầu ra trước khi chẩn đoán.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: `evals.yaml` không đổi từ lần đo baseline cuối (round 1, cùng hash của bộ eval), nên cả 18 eval mang `baseline: n-a` và chỉ có kết quả của round 1 để tham chiếu.

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline): không có eval nào được liệt kê (danh sách carried từ round 1 là rỗng). Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — mọi eval chạy một lần (runs: 1), không có pass_rate hỗn hợp và không có eval nào chập chờn trong vòng này. Riêng ca `tai-lieu-diff > tran-duoi-khoi: dao-thu-tu` của lệnh suite `@crm/validation` hết trần 5 giây ở lượt này; đó là ca của suite, không gắn eval, và đã ghi ở mục «Lệnh fail không gắn eval».

## Iterations

Round 1: 18 eval xanh, 4 lệnh suite đỏ (api, app và @crm/ui, agent và auth và db, agent-okr và các gói còn lại). Returned to implementation (commit «vá suite»).
Round 2 (lượt trước, commit 156858cff): 18 eval xanh, ba trong bốn lệnh suite đã xanh, còn app và @crm/ui đỏ ở `khung-trang-cai-dat-thanh-ben.dom.tsx` (2 ca). Returned to implementation.
Round 2 (lượt chạy lại này, commit 15a39fce6, đã gộp onehub): 18 eval xanh, ba lệnh suite test trước đó đỏ nay xanh gồm app và @crm/ui, còn gói `@crm/validation` của lệnh agent-okr hết trần 5 giây ở một ca không liên quan lộ trình sản phẩm. REJECT. Hai finding trong hợp đồng (AC-1, AC-5) và danh sách ngoài hợp đồng nằm ở review-findings.md. Mốc verified_at trong báo cáo này là mốc đóng round, suy từ giờ của mã lượt chạy cuối (mvfzrf48dyuv) và giờ chụp khung E13, E14, không phải giờ riêng từng eval.
