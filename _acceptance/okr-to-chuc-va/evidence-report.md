---
schema_version: 2
feature_slug: okr-to-chuc-va
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 682caadd3bca35184e4296cec89d6a504521a264
human_signoff:
---

# Evidence Report: okr-to-chuc-va

Round 1. Mọi eval máy và ui-check đều đạt; không có mục judgment, không có eval ngẫu nhiên.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | ui-check | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-8 | ui-check | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-9 | ui-check | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-11 | test | PASS |
| E17 | AC-8 | script | PASS |
| E18 | AC-1 | ui-check | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-12 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-okr-to-chuc-va-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_thu_gon
  verified_at: 2026-10-04T14:10:00Z
  output: |
    okr-to-chuc-va.dom.tsx -t thu-gon: bài kiểm thu gọn mục tiêu (hai cách khuất) đạt, lệnh kết thúc với mã 0.

- eval: E2
  run_id: minted-okr-to-chuc-va-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_so_kr_dom
  verified_at: 2026-10-04T14:10:00Z
  output: |
    Ran 1 test across 1 file. [1359.00ms]
    Bài kiểm nút số của KR ở hai khổ đạt.

- eval: E3
  run_id: r1d-man-okr-e3-20261004
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T14:10:00Z
  screenshot: evidence/E3-so-kr-390.png
  observed: |
    Khổ 390: khung số của KR mở dạng bottom-sheet, tiêu đề «Hợp đồng bán lẻ chốt được đặt 6 tỷ đồng», khối «Chỉ số CRM» ghi đã chụp 2,9 thoả thuận ngày 28 thg 9, 2026, có «Lịch sử theo ngày». Khổ 1440: panel bên phải «Số của KR» đã mở đúng KR nhưng nội dung còn là skeleton tải; ảnh 1440 chỉ chứng minh khung mở, không chứng minh nội dung.
  network_observed: n-a (driver)
  output: |
    Kiểm khẳng định: nút số hiện và mở được ở cả hai khổ (390 và 1440); số ô đo là 2.

- eval: E4
  run_id: minted-okr-to-chuc-va-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_mau_vet
  verified_at: 2026-10-04T14:10:00Z
  output: |
    apps/api/test/okr-to-chuc-va-mau.spec.ts đạt: mỗi KR từ mẫu có dòng vết tao-kr khớp KR tạo tay, lời nhắc đúng người.

- eval: E5
  run_id: minted-okr-to-chuc-va-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_ly_do_api
  verified_at: 2026-10-04T14:10:00Z
  output: |
    okr-to-chuc-va-to-chuc.spec.ts -t ly-do đạt: ba lý do chặn lưu trữ parse đúng schema đầu ra.
    test-run: dropped crm_mutwpguni6ps_test

- eval: E6
  run_id: minted-okr-to-chuc-va-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_ly_do_dom
  verified_at: 2026-10-04T14:10:00Z
  output: |
    okr-to-chuc-va.dom.tsx -t ly-do-luu-tru đạt: sáu ô (hai ngôn ngữ nhân ba lý do) khớp hàm messages.

- eval: E7
  run_id: minted-okr-to-chuc-va-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_khoi_phuc
  verified_at: 2026-10-04T14:10:00Z
  output: |
    Ran 1 test across 1 file. [1072.00ms]
    test-run: dropped crm_mutwpjelfp77_test

- eval: E8
  run_id: minted-okr-to-chuc-va-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_trung_ten
  verified_at: 2026-10-04T14:10:00Z
  output: |
    28 expect() calls
    Ran 1 test across 1 file. [2.33s]
    test-run: dropped crm_mutwpge2h66y_test

- eval: E9
  run_id: minted-okr-to-chuc-va-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_quyen_tao
  verified_at: 2026-10-04T14:10:00Z
  output: |
    apps/api/test/okr-to-chuc-va-quyen.spec.ts đạt: quản trị tạo được ở cả ba cấp, thành viên bị từ chối, luật sửa không mở.

- eval: E10
  run_id: minted-okr-to-chuc-va-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_nut_them
  verified_at: 2026-10-04T14:10:00Z
  output: |
    9 expect() calls
    Ran 2 tests across 1 file. [1.86s]

- eval: E11
  run_id: E11-okr-to-chuc-va-20261004
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T14:10:00Z
  screenshot: evidence/E11-them-muc-tieu.png
  observed: |
    Khung chi tiết bên phải của mục tiêu vừa tạo, tiêu đề «Mục tiêu lẻ R1d» kèm hậu tố do script sinh, dòng phụ «Kinh doanh miền Bắc · Năm kế · mẫu», nhãn «Cam kết» và «Nháp», trạng thái chưa có KR cùng nút «Thêm KR». Góc dưới trái có toast xanh «Đã tạo mục tiêu». Khớp kỳ vọng: quản trị tạo được mục tiêu lẻ ở phòng ban mẫu.
  network_observed: n-a (driver)
  output: |
    Khẳng định: nút thêm hiện, lưu thành công, API trả mục tiêu cùng tên.

- eval: E12
  run_id: minted-okr-to-chuc-va-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_neo_kara
  verified_at: 2026-10-04T14:10:00Z
  output: |
    Ran 2 tests across 1 file. [1.87s]
    Bài kiểm neo Kara ở hai khổ và ca hook khổ màn đạt.

- eval: E13
  run_id: phien-do crm_okr_to_chuc_va_do (app :4375, api :4106)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T14:10:00Z
  screenshot: evidence/E13-kara-chuot.png
  observed: |
    Khổ 390, bấm chuột: khung Mục tiêu đã cuộn xuống, hàng vùng Kara «Kara · 3 góp ý chờ / Vì sao?» nằm sát đỉnh vùng cuộn ngay dưới dải tab, thấy từ hai góp ý Kara đang mở. Ảnh bấm Enter giống hệt, chỉ khác viền focus. Vùng Kara nằm trong tầm nhìn, không bị cuộn lệch xuống đáy; khớp kỳ vọng.
  network_observed: n-a (driver)
  output: |
    kara ok chuot tren=17
    kara ok enter tren=17
    so o: 2

- eval: E14
  run_id: minted-okr-to-chuc-va-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ccq_cong_nghien_cuu
  verified_at: 2026-10-04T14:10:00Z
  output: |
    Ran 7 tests across 1 file. [65.00ms]

- eval: E15
  run_id: minted-okr-to-chuc-va-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.suite_app_ui
  verified_at: 2026-10-04T14:10:00Z
  output: |
    bun run test -- --filter=app --filter=@crm/ui hoàn tất, không có ca đỏ.
    test-run: dropped crm_mutwpz3y7qv6_test

- eval: E16
  run_id: minted-okr-to-chuc-va-E16-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.suite_api
  verified_at: 2026-10-04T14:10:00Z
  output: |
    bun run test -- --filter=api hoàn tất, không có ca đỏ.
    test-run: dropped crm_mutx21zo38p7_test

- eval: E17
  run_id: minted-okr-to-chuc-va-E17-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.r1d_san_thiet_ke
  verified_at: 2026-10-04T14:10:00Z
  output: |
    design-gate --mode static chạy trên chín tệp giao diện vòng này chạm; không tệp nào có P0.

- eval: E18
  run_id: phien-do crm_okr_to_chuc_va_do (lệnh cấu hình r1d_man_okr, chạy nguyên văn, EXIT=0)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T14:10:00Z
  screenshot: evidence/E18-step1.png
  observed: |
    E18-step1 (1440, sáng, Kinh doanh miền Bắc): cả hai mục tiêu «Giữ đà tăng trưởng bán lẻ miền Bắc» (A) và «Mở rộng tệp đối tác bán lẻ miền Bắc» (B) đều thu gọn, chevron hướng phải; A vẫn thu gọn sau khi lọc bỏ rồi quay lại. E18-step2: sau khi đổi đơn vị rồi chọn lại, A vẫn thu gọn còn B mở, đúng vì người đo chỉ thu mục tiêu ở đơn vị kia. Khớp kỳ vọng.
  network_observed: n-a (driver)
  output: |
    thu-gon ok loc A=false
    thu-gon ok doi-don-vi A=false
    so o: 2

- eval: E19
  run_id: minted-okr-to-chuc-va-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1d_khoi_phuc_dom
  verified_at: 2026-10-04T14:10:00Z
  output: |
    okr-to-chuc-va.dom.tsx -t khoi-phuc-toast đạt: toast lỗi theo đúng ngôn ngữ cho cả hai lý do chặn.

- eval: E20
  run_id: e20-20261004-r1a
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1d_man_okr
  verified_at: 2026-10-04T14:10:00Z
  screenshot: evidence/E20-khoi-phuc-chan-en.png
  observed: |
    Settings > Organization bằng tiếng Anh: cây tổ chức có ba bộ phận, mục «Archived (3)» liệt kê bộ phận «Khối R1d đo» kèm nút Restore, phòng ban «Kho lạnh Bình Dương» và phòng ban đo P; P vẫn nằm trong Archived sau khi tải lại. Toast sonner tiếng Anh nằm sát mép dưới, bị cắt một phần; đầy đủ chữ toast do script khẳng định chứ không đọc từ ảnh.
  network_observed: n-a (driver)
  output: |
    khoi-phuc ok toast=en ten=1 con-luu-tru=1

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-okr-to-chuc-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-04T14:10:00Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-okr-to-chuc-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T14:10:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-okr-to-chuc-va-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T14:10:00Z

- cmd: bun run lint:slop
  run_id: minted-okr-to-chuc-va-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T14:10:00Z

- cmd: bunx turbo run build --force
  run_id: minted-okr-to-chuc-va-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-04T14:10:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

Bốn eval xanh trên cả nhánh lẫn baseline diffBase, nên chúng chứng minh bộ đo chứ không chứng minh tính năng mới; đây là các chốt hồi quy có chủ ý, không cần viết lại:

- E14 (apps/app onboarding-gate -t ccq-cong-nghien-cuu): bài kiểm có từ trước, vòng này chỉ giữ cho khỏi lùi.
- E15 (bộ kiểm app và @crm/ui): hồi quy toàn gói.
- E16 (bộ kiểm api): hồi quy toàn gói.
- E17 (design-gate tĩnh trên các tệp giao diện chạm): chốt sàn thiết kế, chiều đỏ là của chính design-gate.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả hai mươi eval và năm lệnh suite đạt; không có eval nào hỏng.
