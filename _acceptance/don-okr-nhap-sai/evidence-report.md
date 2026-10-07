---
schema_version: 2
feature_slug: don-okr-nhap-sai
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3b54471fb833191830d6e4f4b1150911eaaa8263
human_signoff:
---

# Evidence Report: don-okr-nhap-sai

Round 1. REJECT vì hai lệnh suite hồi quy không gắn eval nào chạy đỏ (xem mục Lệnh suite và Iterations). Không eval nào của tính năng đỏ.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E19 | AC-2 | test | PASS |
| E20 | AC-8 | script | PASS |
| E21 | AC-9 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-11 | ui-check | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-14 | script | PASS |
| E17 | AC-15 | script | PASS |
| E18 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-don-okr-nhap-sai-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_xoa_sach
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgoze85a84_test

- eval: E2
  run_id: minted-don-okr-nhap-sai-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_tu_choi
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgox1ffc3r_test

- eval: E19
  run_id: minted-don-okr-nhap-sai-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_dong_thoi
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgozxvxu6s_test

- eval: E20
  run_id: minted-don-okr-nhap-sai-E20-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dos_man
  verified_at: 2026-10-07T02:01:02Z
  output: |
    phien-do: xong — mã 0

- eval: E21
  run_id: minted-don-okr-nhap-sai-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dos_man
  verified_at: 2026-10-07T02:01:02Z
  output: |
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-don-okr-nhap-sai-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_quan_he
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgoy0uh6xb_test

- eval: E4
  run_id: minted-don-okr-nhap-sai-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_mot_nguon
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgoxyg53x9_test

- eval: E5
  run_id: minted-don-okr-nhap-sai-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_quyen_pha
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgoxju86x8_test

- eval: E6
  run_id: minted-don-okr-nhap-sai-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_dung_lai
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgoys2wwwh_test

- eval: E7
  run_id: minted-don-okr-nhap-sai-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_danh_sach
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgp0o8m0cd_test

- eval: E8
  run_id: minted-don-okr-nhap-sai-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_dom_don_vi
  verified_at: 2026-10-07T02:01:02Z
  output: |
    Ran 6 tests across 1 file. [2.33s]

- eval: E9
  run_id: minted-don-okr-nhap-sai-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_dom_cua_toi
  verified_at: 2026-10-07T02:01:02Z
  output: |
    Ran 3 tests across 1 file. [1262.00ms]

- eval: E10
  run_id: minted-don-okr-nhap-sai-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_dom_nhin
  verified_at: 2026-10-07T02:01:02Z
  output: |
    (lệnh chạy xong, không có dòng tóm tắt riêng)

- eval: E11
  run_id: minted-don-okr-nhap-sai-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_dom_ngan
  verified_at: 2026-10-07T02:01:02Z
  output: |
    Ran 9 tests across 1 file. [1.69s]

- eval: E12
  run_id: E12-2026-10-07-0902
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dos_man
  verified_at: 2026-10-07T02:01:02Z
  screenshot: evidence/E12-danh-sach.png
  observed: |
    Đã Read đủ mười khung: danh sách «OKR theo đơn vị» có hai thẻ đang dùng (M1 nhãn Nháp, M2 Đã công bố) và dòng gập «Đã bỏ (2)» đóng; mở ra thì M3, M4 mang nhãn «Đã bỏ», ghi «Không tính tiến độ», không thanh tiến độ. Menu nháp sạch có «Xoá mục tiêu», không «Bỏ mục tiêu»; hộp hỏi xoá có tên và «1 KR»; sau xoá ngăn đóng, M1 mất, toast «Đã xoá mục tiêu», dòng gập còn «Đã bỏ (2)»; ngăn mục tiêu đã bỏ có nút «Dùng lại» và menu chỉ có «Xoá mục tiêu».
    Sau dùng lại M3 về Nháp, dòng gập còn «Đã bỏ (1)»; khung này chụp sau khi tải lại trang nên không chứa toast, chữ toast chỉ được khẳng định qua DOM lúc bấm. Hai khung 390 không có chữ bị cắt, nhưng dòng gập nằm dưới nếp gập nên không thấy trong ảnh; chống tràn ngang chứng minh bằng DOM. «Của tôi» hiện trạng thái rỗng và dòng gập «Đã bỏ (1)» đóng.
  network_observed: n-a (driver)

- eval: E13
  run_id: minted-don-okr-nhap-sai-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dos_man
  verified_at: 2026-10-07T02:01:02Z
  output: |
    phien-do: xong — mã 0

- eval: E14
  run_id: minted-don-okr-nhap-sai-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_purge
  verified_at: 2026-10-07T02:01:02Z
  output: |
    test-run: dropped crm_muxgpj788tk9_test

- eval: E15
  run_id: minted-don-okr-nhap-sai-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dos_luu_tru_ngay
  verified_at: 2026-10-07T02:01:02Z
  output: |
    (lệnh chạy xong, không có dòng tóm tắt riêng)

- eval: E16
  run_id: minted-don-okr-nhap-sai-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dos_soi_chu
  verified_at: 2026-10-07T02:01:02Z
  output: |
    KET LUAN: xanh

- eval: E17
  run_id: minted-don-okr-nhap-sai-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dos_san_thiet_ke
  verified_at: 2026-10-07T02:01:02Z
  output: |
    KET LUAN: xanh

- eval: E18
  judged_by: judge-subagent (fresh context), ba góc nhìn
  verdict: UNCERTAIN
  rationale: Cả ba góc nhìn đều thấy bốn trong năm vế đạt (một nguồn lichSuMucTieu, đầu vào parse bằng idInput, nhãn Badge khác nhau, chữ và hai toast khớp design doc). Vế «dòng gập dựng bằng Collapsible» không được kiểm chứng vì nhom-da-bo.tsx nằm ngoài danh sách đầu vào của eval.
  panel_de_xuat: |
    - domain-correctness: UNCERTAIN — Phần lớn đạt: lichSuMucTieu là nguồn duy nhất cho cả xoaMucTieu lẫn quyen.xoa, màn chỉ đọc mt.quyen.xoa; đầu vào parse bằng idInput và dungLaiOutput; chữ trong okr.ts và hai toast khớp design doc, nhánh theo canGuiDuyet. Nhưng «dòng gập dùng Collapsible» không kiểm chứng được vì theo-don-vi.tsx và cua-toi.tsx chỉ import NhomDaBo mà nhom-da-bo.tsx nằm ngoài đầu vào; judge cũng ghi ảnh E12-cua-toi.png không có trên đĩa lúc chấm.
    - operational-feasibility: UNCERTAIN — Bốn trong năm ý đã thấy trong các tệp liệt kê (lichSuMucTieu một định nghĩa; idInput ở biên router; ConfirmDialog, Badge, StatusIndicator với «Đã bỏ» là ghost còn «Nháp» là outline; chữ okr.ts và hai toast khớp). Ý thứ năm, Collapsible cho dòng gập, chưa chứng minh vì không tệp đầu vào nào dùng nó; judge ghi E12-sau-dung-lai.png và E12-cua-toi.png không có trên đĩa lúc chấm, và có mở nhom-da-bo.tsx nhưng không dùng làm căn cứ.
    - spec-alignment: UNCERTAIN — Bốn trong năm vế đạt (một nguồn duy nhất, idInput ở biên, chữ khớp design doc, Badge ghost khác outline). Vế còn lại chưa chứng minh được vì dòng gập nằm ở NhomDaBo (nhom-da-bo.tsx, ngoài đầu vào); E12-cua-toi.png không có trên đĩa lúc chấm; số n của «Đã bỏ (n)» chỉ thấy đúng ở ảnh «Theo đơn vị» (2 rồi 1), chưa thấy ở mã.
  required_evidence:
    - Nội dung `apps/app/app/(app)/[slug]/okr/nhom-da-bo.tsx`, cho thấy dòng gập «Đã bỏ (n)» dựng bằng Collapsible, CollapsibleTrigger, CollapsibleContent từ `@crm/ui/components/collapsible` (thêm tệp này vào Input của E18 thì phán quyết đổi được). Ghi chú của bước tổng hợp: tệp có trên đĩa và import đủ ba thành phần đó, dòng `<Collapsible data-nhom-da-bo>`.
    - Ảnh `_acceptance/don-okr-nhap-sai/evidence/E12-cua-toi.png` (màn «Của tôi», dòng gập «Đã bỏ (n)» đóng). Ghi chú của bước tổng hợp: lúc soạn báo cáo cả mười ảnh E12 đều có trên đĩa, gồm E12-cua-toi.png và E12-sau-dung-lai.png.
    - Ảnh `_acceptance/don-okr-nhap-sai/evidence/E12-sau-dung-lai.png` có toast «Mục tiêu đã về Nháp…». Ghi chú của bước tổng hợp: ảnh có trên đĩa nhưng chụp sau khi tải lại trang nên không chứa toast; toast chỉ được khẳng định qua DOM.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-don-okr-nhap-sai-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-07T02:01:02Z
  output: |
    1583 pass, 3 skip, 2 fail, 1588 tests across 171 files.
    Hai ca đỏ: «dem-chip > Mục tiêu đã bỏ đếm 0» và «danh-sach > danh-sach: bo phan gom phong ban con, loc o may chu, dem mat loc tru mat cua chinh no».
    Lệnh không gắn eval nào của tính năng.

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-don-okr-nhap-sai-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-07T02:01:02Z
  output: |
    701 pass, 1 fail, 702 tests across 67 files.
    Một ca đỏ: «kho chuoi cua vong ③a > moi ham ghep bien co khang dinh, va so ham bang so khang dinh».
    Lệnh không gắn eval nào của tính năng.

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-don-okr-nhap-sai-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-07T02:01:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-don-okr-nhap-sai-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-07T02:01:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-don-okr-nhap-sai-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-07T02:01:02Z

- cmd: bun run lint:slop
  run_id: minted-don-okr-nhap-sai-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-07T02:01:02Z

- cmd: bunx turbo run build --force
  run_id: minted-don-okr-nhap-sai-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-07T02:01:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ; hai lệnh suite hồi quy không gắn eval chạy đỏ (api: 2 ca, app: 1 ca, tên ở mục Lệnh suite). E18 còn UNCERTAIN chờ người. Trả về triển khai.
