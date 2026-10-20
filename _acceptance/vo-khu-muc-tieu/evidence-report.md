---
schema_version: 2
feature_slug: vo-khu-muc-tieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 93605e36362be62a520343cb5a1a1de8b14eca7c
human_signoff:
---

# Evidence Report: vo-khu-muc-tieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-3 | script | PASS |
| E13 | AC-2 | script | PASS |
| E14 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-vo-khu-muc-tieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vkm_thanh_ben
  verified_at: 2026-10-20T01:14:53Z
  output: |
    Ran 3 tests across 1 file. [1440.00ms]

- eval: E2
  run_id: minted-vo-khu-muc-tieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vkm_chu_ky
  verified_at: 2026-10-20T01:14:53Z
  output: |
    Ran 3 tests across 1 file. [1422.00ms]

- eval: E3
  run_id: minted-vo-khu-muc-tieu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vkm_mot_lop
  verified_at: 2026-10-20T01:14:53Z
  output: |
    Ran 1 test across 1 file. [1355.00ms]

- eval: E4
  run_id: minted-vo-khu-muc-tieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vkm_man
  verified_at: 2026-10-20T01:14:53Z
  output: |
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-vo-khu-muc-tieu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vkm_chuyen_huong
  verified_at: 2026-10-20T01:14:53Z
  output: |
    Ran 4 tests across 1 file. [25.00ms]

- eval: E6
  run_id: minted-vo-khu-muc-tieu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vkm_man
  verified_at: 2026-10-20T01:14:53Z
  output: |
    phien-do: xong — mã 0

- eval: E7
  run_id: minted-vo-khu-muc-tieu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vkm_quet
  verified_at: 2026-10-20T01:14:53Z
  output: |
    DUNG AC-7: 730 tep, 0 chuoi duong cu

- eval: E8
  run_id: minted-vo-khu-muc-tieu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vkm_don_vi_dan
  verified_at: 2026-10-20T01:14:53Z
  output: |
    Ran 3 tests across 1 file. [972.00ms]

- eval: E9
  run_id: minted-vo-khu-muc-tieu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vkm_man
  verified_at: 2026-10-20T01:14:53Z
  screenshot: evidence/cua-toi-1280.png
  observed: |
    cua-toi-1280.png: thanh bên trái rộng, đầu thanh là ô chu kỳ «Quý 4 · mẫu»; bên dưới mục «Của tôi» (đang mở, tô nền), nhóm «OKR» (Bộ OKR, Lấy ý kiến kèm số 3), nhóm «BÁO CÁO» (Sức khoẻ, Sơ đồ); chân thanh có «Chương trình OKR». Nội dung: tiêu đề Mục tiêu, trạng thái rỗng «Bạn chưa phụ trách mục tiêu hay KR nào». Khớp Expected (ba nhóm Của tôi / OKR / Báo cáo, mục đang mở tô nền).
    bo-okr-1280.png: cùng thanh bên, «Bộ OKR» đang tô nền. Trang chỉ có MỘT hàng chuyển kiểu xem: ô chọn đơn vị «Kinh doanh miền Bắc» + nút Danh sách / Sơ đồ góp vào / Họp tuần (cùng hàng với chip lọc Tất cả 2 / Cần bàn 2 / Chưa góp vào đâu 0); không có hàng thẻ «Của tôi · Theo đơn vị». Bảng 2 mục tiêu. Khớp.
    suc-khoe-1280.png: cùng thanh bên, «Sức khoẻ» đang tô nền, ô chu kỳ ở đầu; nội dung StatGroup 4 ô (47%, 12/13, 43/49, 8) và bảng «Theo đơn vị». Không hàng thẻ cũ. Khớp.
    cua-toi-375.png: không có thanh dọc; ngay dưới đầu trang là ô chu kỳ «Quý 4 · mẫu» rồi một hàng mục nằm ngang (Của tôi tô nền, Bộ OKR, Lấy ý kiến 3, Sức khoẻ, Sơ đồ — mục cuối cuộn ngang trong hàng, không có nhãn nhóm). Nội dung bên dưới xuống dòng gọn, không bị cắt ngang. Khớp.
    bo-okr-375.png: cùng ô chu kỳ + hàng ngang với «Bộ OKR» tô nền; nội dung: ô chọn đơn vị, ô chọn kiểu xem «Danh sách» (một lớp chọn), Lọc, thẻ mục tiêu xếp dọc; không cắt ngang, không cuộn ngang trang (nút nổi góc dưới chỉ che chữ chân trang, là lớp phủ của app). Khớp.
    suc-khoe-375.png: cùng ô chu kỳ + hàng ngang với «Sức khoẻ» tô nền; StatGroup xếp 2x2, tiêu đề «Theo đơn vị» có ô chọn «Bảng»; bảng cắt theo cột trong khung bảng của nó (thành phần bảng tự cuộn), trang không tràn ngang (map in tran ngang 0). Khớp.
    Cả sáu ảnh khớp Expected; map in đủ ba dòng «DUNG AC-9 <màn> 375: aside ẩn, hàng ngang 5 mục, 0 nhãn nhóm, tràn ngang 0».
  network_observed: n-a (driver)
  output: |
    DUNG AC-3 bo-okr 1280: 1 lop (nut); DUNG AC-3 bo-okr 375: 1 lop (chon)
    Sáu ảnh sinh mới trong _acceptance/vo-khu-muc-tieu/evidence/: cua-toi-1280.png, bo-okr-1280.png, suc-khoe-1280.png, cua-toi-375.png, bo-okr-375.png, suc-khoe-375.png (bản sao E9-<tên>.png cùng thư mục).

- eval: E10
  run_id: minted-vo-khu-muc-tieu-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vkm_man
  verified_at: 2026-10-20T01:14:53Z
  output: |
    phien-do: xong — mã 0

- eval: E11
  run_id: minted-vo-khu-muc-tieu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vkm_loi_vao_cu
  verified_at: 2026-10-20T01:14:53Z
  output: |
    Ran 5 tests across 2 files. [36.00ms]

- eval: E12
  run_id: minted-vo-khu-muc-tieu-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vkm_man
  verified_at: 2026-10-20T01:14:53Z
  output: |
    phien-do: xong — mã 0

- eval: E13
  run_id: minted-vo-khu-muc-tieu-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vkm_man
  verified_at: 2026-10-20T01:14:53Z
  output: |
    phien-do: xong — mã 0

- eval: E14
  run_id: minted-vo-khu-muc-tieu-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vkm_man
  verified_at: 2026-10-20T01:14:53Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-vo-khu-muc-tieu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-20T01:14:53Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-vo-khu-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-20T01:14:53Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-vo-khu-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-20T01:14:53Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-vo-khu-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-20T01:14:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-vo-khu-muc-tieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-20T01:14:53Z

- cmd: bun run lint:slop
  run_id: minted-vo-khu-muc-tieu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-20T01:14:53Z

- cmd: bunx turbo run build --force
  run_id: minted-vo-khu-muc-tieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-20T01:14:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi, nen moi eval may ghi baseline n-a o round nay.

Eval khong-phan-biet (xanh tren ca HEAD lan baseline):
- E11 — tệp kiểm cũ chạy xanh sau khi đổi chuỗi đường cũ sang đường mới; đây là regression-guard có chủ ý cho lối vào sẵn có (AC-10), không phải bằng chứng cho hành vi mới.

Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả 14 eval qua và bảy lệnh suite xanh; không có eval nào phải trả lại cho khâu cài đặt.
