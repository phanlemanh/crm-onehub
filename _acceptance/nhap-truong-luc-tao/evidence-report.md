---
schema_version: 2
feature_slug: nhap-truong-luc-tao
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d6a656e631559d6666e093f6adf48fffc83b65c
human_signoff: manh 2026-10-22 — ký Cổng Bằng chứng trên vòng chấm 2 (0 eval trượt, 7/7 suite); Ngoài-1,2,4,5,6,8 ghi Known limits, Ngoài-3,7 chấp nhận không sửa; đồng ý cắt; phê hết Treo
---

# Evidence Report: nhap-truong-luc-tao

Vòng 2. Nội dung thay toàn bộ vòng cũ; lịch sử các vòng nằm ở mục Iterations. E1c và E2 là carry-forward từ vòng 1 (delta không chạm paths của hai eval này).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-nhap-truong-luc-tao-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_bo_truong
  verified_at: 2026-10-22T02:35:31Z
  output: |
    Ran 1 test across 1 file. [1.61s]

- eval: E1b
  run_id: minted-nhap-truong-luc-tao-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_chua_tai
  verified_at: 2026-10-22T02:35:31Z
  output: |
    Ran 1 test across 1 file. [1356.00ms]

- eval: E1c
  run_id: minted-nhap-truong-luc-tao-E1c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_giu_luat_cu
  verified_at: 2026-10-22T02:06:33Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-nhap-truong-luc-tao-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntl_quet
  verified_at: 2026-10-22T02:06:33Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-nhap-truong-luc-tao-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_gui_gia_tri
  verified_at: 2026-10-22T02:35:31Z
  output: |
    Ran 1 test across 1 file. [1.90s]

- eval: E3b
  run_id: minted-nhap-truong-luc-tao-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_tao_co_truong
  verified_at: 2026-10-22T02:35:31Z
  output: |
    test-run: dropped crm_mvixinu27xok_test

- eval: E4
  run_id: minted-nhap-truong-luc-tao-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_bat_buoc
  verified_at: 2026-10-22T02:35:31Z
  output: |
    Ran 1 test across 1 file. [1261.00ms]

- eval: E4b
  run_id: minted-nhap-truong-luc-tao-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_bat_buoc
  verified_at: 2026-10-22T02:35:31Z
  output: |
    test-run: dropped crm_mvixio3k2626_test

- eval: E5
  run_id: minted-nhap-truong-luc-tao-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_loi_may_chu
  verified_at: 2026-10-22T02:35:31Z
  output: |
    Ran 1 test across 1 file. [1472.00ms]

- eval: E5b
  run_id: minted-nhap-truong-luc-tao-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_tu_choi
  verified_at: 2026-10-22T02:35:31Z
  output: |
    test-run: dropped crm_mvixioyy7ax5_test

- eval: E6
  run_id: minted-nhap-truong-luc-tao-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_them_nhanh
  verified_at: 2026-10-22T02:35:31Z
  output: |
    Ran 1 test across 1 file. [1496.00ms]

- eval: E7
  run_id: minted-nhap-truong-luc-tao-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_kara_dien
  verified_at: 2026-10-22T02:35:31Z
  output: |
    test-run: dropped crm_mvixiodlzfwc_test

- eval: E8
  run_id: minted-nhap-truong-luc-tao-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_api_ban_ghi_cu
  verified_at: 2026-10-22T02:35:31Z
  output: |
    test-run: dropped crm_mvixioropi0h_test

- eval: E8b
  run_id: minted-nhap-truong-luc-tao-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ntl_ban_ghi_cu
  verified_at: 2026-10-22T02:35:31Z
  output: |
    Ran 1 test across 1 file. [1263.00ms]

- eval: E9
  run_id: minted-nhap-truong-luc-tao-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntl_man
  verified_at: 2026-10-22T02:35:31Z
  screenshot: evidence/ntl-tao-thoa-thuan-moi-1280.png
  observed: |
    tao-thoa-thuan-moi-1280: sheet một cột; Tên, Giá trị, Tiền tệ, Ngày chốt, Công ty, Giai đoạn, Phụ trách rồi Chữ ntl (trường tự tạo) cùng nhãn trên ô, cùng chiều cao và cỡ chữ, không tiêu đề nhóm hay đường phân cách; các trường tự tạo còn lại nằm dưới mép cuộn.
    tao-thoa-thuan-thieu-1280: Tên đỏ, câu 'Tên không được để trống.' ngay dưới ô, bố cục giữ nguyên.
    -375 (moi và thieu): một cột đầy chiều rộng, không cuộn ngang, nút Thêm/Huỷ xếp dọc, câu lỗi ngay dưới ô Tên.
    tao-cong-ty và tao-ca-nhan (moi/thieu, 1280 và 375): một cột đồng nhất (Tên, Tên miền, Website, Điện thoại... / Tên, Họ, Chức danh, Email, ... GitHub); câu lỗi 'Tên không được để trống.' ngay dưới ô Tên; trường tự tạo không hiện trong khung vì nằm dưới mép cuộn (không mâu thuẫn Expected, nhưng không kiểm được bằng mắt).
    them-ca-nhan-moi-1280: lưới hai cột, ô tự tạo Chữ ntl, Ngày ntl, Người ntl, Liên kết ntl, Số ntl, Bắt buộc ntl xếp liền sau Phụ trách, cùng cột (mép trái 431 và 853) và cùng nhãn trên ô, cùng chiều cao, cùng cỡ chữ với ô chuẩn; không tiêu đề, không phân cách.
    them-ca-nhan-thieu-1280: Tên đỏ kèm câu lỗi ngay dưới; ô 'Bắt buộc ntl' viền đỏ, nhưng câu lỗi của nó nằm dưới mép khung nên không thấy trong ảnh.
    them-thoa-thuan-moi-1280: cùng lưới hai cột, sáu ô tự tạo lẫn ô chuẩn, đồng nhất.
    them-thoa-thuan-thieu-1280: Tên và Bắt buộc ntl đều đỏ, câu 'Bắt buộc ntl không được để trống.' ngay dưới ô (khoảng 8px), thấy rõ.
    them-*-375: một cột đầy chiều rộng, không cuộn ngang, nhãn trên ô đồng nhất; chỉ thấy các ô đầu form, trường tự tạo nằm dưới khung; câu lỗi 'Tên không được để trống.' ngay dưới ô Tên ở các ảnh thieu.
    Không có khung nào mâu thuẫn Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T02:35:31Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T02:35:31Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T02:35:31Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T02:35:31Z

- cmd: bunx turbo run lint --force
  run_id: minted-nhap-truong-luc-tao-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T02:35:31Z

- cmd: bun run lint:slop
  run_id: minted-nhap-truong-luc-tao-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T02:35:31Z

- cmd: bunx turbo run build --force
  run_id: minted-nhap-truong-luc-tao-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T02:35:31Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: moi eval o vong nay ghi baseline n-a, vi evals.yaml khong doi tu lan do baseline cuoi (round 1) nen vong nay khong do lai.

Eval xanh ca hai phia (khong phan biet), da biet va co chu y:
- E1c: lenh chay nguyen ba tep co san tren onehub (tra-cuu-thuong-hieu-viet-nam, dien-thoai-ca-nhan, deals-giai-doan-hydrat). Day la regression-guard co chu y, giu luat cu cua Tao cong ty, Tao ca nhan, Tao thoa thuan; khong phai bai do hanh vi moi. Carry-forward tu round 1.

Lenh suite xanh ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong co phuong sai)

## Iterations

Round 1: cac thuoc trong hop dong bi bac (năm thước trong hợp đồng, xem sổ S4-r1 và commit bằng chứng vòng 1). Returned to implementation; S4-r1 siết năm thước.
Round 2: tat ca eval PASS; E1c va E2 carry-forward tu round 1 vi delta khong cham paths cua hai eval nay. Moc verified_at cua vong 2 lay theo thoi diem commit da ghim (verified_commit); gio that cua tung lan chay nam trong run-log.jsonl.
