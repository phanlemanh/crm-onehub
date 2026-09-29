---
schema_version: 2
feature_slug: gioi-han-duyet-cay-okr
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 86bbd37b347cfdf8953886f91e4f6476368a7698
human_signoff:
---

# Evidence Report: gioi-han-duyet-cay-okr

Round 1. Verdict REJECT vì một lệnh suite không gắn eval nào (`bun run test`) đã đỏ, dù 24 eval máy đều xanh. Xem mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-11 | script | PASS |
| E15 | AC-12 | ui-check | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-12 | test | PASS |
| E18 | AC-13 | ui-check | PASS |
| E19 | AC-13 | script | PASS |
| E20 | AC-14 | test | PASS |
| E21 | AC-14 | script | PASS |
| E22 | AC-14 | script | PASS |
| E23 | AC-15 | script | PASS |
| E24 | AC-15 | script | PASS |
| E25 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-gioi-han-duyet-cay-okr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_hien_thi_ghi
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky1ujb8gy_test
    __EXIT=0

- eval: E2
  run_id: minted-gioi-han-duyet-cay-okr-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_hien_thi_ma_tran
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky1hn42t2_test
    __EXIT=0

- eval: E3
  run_id: minted-gioi-han-duyet-cay-okr-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_hien_thi_bon_duong
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky1tdvn5v_test
    __EXIT=0

- eval: E4
  run_id: minted-gioi-han-duyet-cay-okr-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_hien_thi_so_gop
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky2tfyg5v_test
    __EXIT=0

- eval: E5
  run_id: minted-gioi-han-duyet-cay-okr-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_hien_thi_ghi_ke
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky2imn9vv_test
    __EXIT=0

- eval: E6
  run_id: minted-gioi-han-duyet-cay-okr-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_hien_thi_nhac
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky23xhkw7_test
    __EXIT=0

- eval: E7
  run_id: minted-gioi-han-duyet-cay-okr-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_duyet_cong_bo
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky301f1xn_test
    __EXIT=0

- eval: E8
  run_id: minted-gioi-han-duyet-cay-okr-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_duyet_vong
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky1vhfiyw_test
    __EXIT=0

- eval: E9
  run_id: minted-gioi-han-duyet-cay-okr-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_duyet_nguoi
  verified_at: 2026-09-29T11:14:43Z
  output: |
    __EXIT=0

- eval: E10
  run_id: minted-gioi-han-duyet-cay-okr-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_duyet_nhac
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumky1rxqboe_test
    __EXIT=0

- eval: E11
  run_id: minted-gioi-han-duyet-cay-okr-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_luu_tru_chan
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumkymdpj0co_test
    __EXIT=0

- eval: E12
  run_id: minted-gioi-han-duyet-cay-okr-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_chuyen_don_vi
  verified_at: 2026-09-29T11:14:43Z
  output: |
    Ran 3 tests across 1 file. [1.86s]
    test-run: dropped crm_mumkynb0t7mp_test
    __EXIT=0

- eval: E13
  run_id: minted-gioi-han-duyet-cay-okr-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_mo_coi
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumkymtah0sv_test
    __EXIT=0

- eval: E14
  run_id: minted-gioi-han-duyet-cay-okr-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghd_mo_coi_sql
  verified_at: 2026-09-29T11:14:43Z
  output: |
    __EXIT=0

- eval: E15
  run_id: minted-gioi-han-duyet-cay-okr-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T11:14:43Z
  screenshot: evidence/E15-step3-gioi-han.png   # first frame; còn E15-step4-con-can-chinh, step5-cho-duyet, step6-nguoi-duyet, step7-bi-tra-lai, step8-khong-thay, step8b-theo-don-vi, step9-trang-thai-loi, step9-cho-duyet-390, step9-nguoi-duyet-390
  observed: |
    Đã mở từng frame bằng Read. Mục tiêu G nháp có nhãn «Giới hạn» (ổ khoá), hộp «Mức hiển thị» hiện dòng đỏ «Mục tiêu còn 1 căn chỉnh…» và nút Lưu mờ; sau gửi duyệt đầu khung là «Chờ duyệt» + «Rút lại», không còn «Gửi duyệt» hay «Thêm KR».
    Người duyệt thấy «Duyệt và công bố» và «Trả lại…»; sau trả lại người gửi thấy dải cam kèm lý do và «Gửi duyệt» quay lại; người ngoài chỉ thấy «Không tìm thấy mục tiêu này», «OKR theo đơn vị» không có dòng G, trạng thái lỗi có «Thử lại»; ở 390 px hai dải chờ duyệt nằm gọn, không tràn ngang.
  network_observed: unscoped-partial

- eval: E16
  run_id: minted-gioi-han-duyet-cay-okr-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T11:14:43Z
  output: |
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0
    __EXIT=0

- eval: E17
  run_id: minted-gioi-han-duyet-cay-okr-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_khung_dom
  verified_at: 2026-09-29T11:14:43Z
  output: |
    __EXIT=0

- eval: E18
  run_id: E18
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T11:14:43Z
  screenshot: evidence/E18-step1.png   # first frame; còn E18-step2, step3, step4, step5a-rong, step5b, step6a-chuyen-390, step6b-mo-coi-390
  observed: |
    Đã mở từng frame bằng Read. Trang «Chương trình OKR» có công tắc «Công bố cần duyệt» bật và toast lưu; thành viên thường thấy dòng «Chỉ quản trị đổi được cấu hình chương trình.» với ô nhập và nút Lưu mờ.
    Hộp «Lưu trữ» báo phòng ban còn 4 mục tiêu ở kỳ đang mở và khoá nút Lưu trữ; chuyển OKR có toast «Đã chuyển 3 mục tiêu» kèm cảnh báo vượt trần; khối «OKR mồ côi» rỗng rồi liệt một mục «Người phụ trách KR đã rời» có nút «Mở mục tiêu»; hai khung 390 px không tràn ngang.
  network_observed: n-a (driver)

- eval: E19
  run_id: minted-gioi-han-duyet-cay-okr-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T11:14:43Z
  output: |
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0
    __EXIT=0

- eval: E20
  run_id: minted-gioi-han-duyet-cay-okr-E20-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ghd_bo_mau
  verified_at: 2026-09-29T11:14:43Z
  output: |
    test-run: dropped crm_mumkyo535xgr_test
    __EXIT=0

- eval: E21
  run_id: minted-gioi-han-duyet-cay-okr-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghd_ty_le
  verified_at: 2026-09-29T11:14:43Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E22
  run_id: minted-gioi-han-duyet-cay-okr-E22-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghd_migration_chi_them
  verified_at: 2026-09-29T11:14:43Z
  output: |
    goc so sanh: origin/onehub (2e328047) · migration moi: 20261008010000_okr_hien_thi_duyet · so cau lenh: 8 · khoa ngoai viet truoc khop: 3/3
    __EXIT=0

- eval: E23
  run_id: minted-gioi-han-duyet-cay-okr-E23-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghd_soi_xem
  verified_at: 2026-09-29T11:14:43Z
  output: |
    XANH
    __EXIT=0

- eval: E24
  run_id: minted-gioi-han-duyet-cay-okr-E24-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghd_san_thiet_ke
  verified_at: 2026-09-29T11:14:43Z
  output: |
    vi pham: 0
    __EXIT=0

- eval: E25
  judged_by: judge panel (fresh context, ba góc nhìn)
  verdict: UNCERTAIN
  rationale: Cả ba góc nhìn cùng chưa xác định được. `evidence/diff-luot.txt` chỉ có `--stat` và danh sách tệp, không có nội dung dòng mã, nên các vế cốt lõi (to-chuc không nhập từ okr, dải chờ duyệt và nhãn Giới hạn không lộ tên mục tiêu, bốn mục CONTEXT.md có đủ nghĩa/Avoid/Vì sao, docs/api.md nói đủ luật) chỉ dựa vào lời tự khai của mô tả PR và spec. Danh sách tệp khớp cấu trúc đã nêu (okr-hien-thi ở validation và db, okr-duyet, okr-don-vi, CONTEXT.md thêm 46 dòng, docs/api.md thêm 121 dòng, không có thay đổi ở packages/ui, migration chỉ thêm OkrNguoiXem).
  votes:
    - domain-correctness: UNCERTAIN — danh sách tệp khớp lời khai nhưng không có nội dung diff để đối chiếu các điểm cốt lõi.
    - operational-feasibility: UNCERTAIN — mô tả PR và design-pass là lời tự khai; design-pass còn 3 mục chờ Cổng Phạm vi quyết (hộp thoại toàn màn ở 390, cỡ chữ Item trong Dialog, CardDescription ẩn dưới sm).
    - spec-alignment: UNCERTAIN — spec, contract và mô tả PR nhất quán về kiến trúc; nhưng mô tả PR tự khai cây tổ chức để người không xem được đoán ra đơn vị có mục tiêu giới hạn, và hộp thoại chưa toàn màn như spec mục 4 đòi.
  required_evidence:
    - Diff của CONTEXT.md (`git diff origin/onehub...HEAD -- CONTEXT.md`, hoặc `git show 86bbd37b:CONTEXT.md`) cho thấy bốn mục Mức hiển thị, Chờ duyệt / Người duyệt, Chuyển OKR, OKR mồ côi, mỗi mục có đủ nghĩa, Avoid và Vì sao.
    - Diff của docs/api.md và docs/agent.md (`git diff origin/onehub...HEAD -- docs/api.md docs/agent.md`) cho thấy mục OKR và mục cây tổ chức nêu luật xem một hàm, người duyệt suy lúc đọc, chặn lưu trữ và xoá hẳn đơn vị còn OKR, okr.chuyenDonVi, okr.moCoi.
    - Nội dung tại 86bbd37b của apps/api/src/to-chuc/to-chuc.service.ts và packages/db/src/okr-don-vi.ts; lệnh `git grep -n "from ['\"].*okr" apps/api/src/to-chuc` không có kết quả và to-chuc gọi demOkrCuaDonVi / demOkrTheoDonVi.
    - Đầu ra của `node _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem`, liệt kê mọi truy vấn okrObjective đi qua dieuKienXemMucTieu hay nằm trong danh sách miễn có lý do.
    - Nội dung tại HEAD của apps/app/components/crm/record-sheet/objective-duyet.tsx, objective-hien-thi.tsx, objective-sheet.tsx (kèm ảnh evidence/design-pass/ST-khung-khong-thay--desktop-1440.png) cho thấy dải chờ duyệt và nhãn Giới hạn không đưa tên mục tiêu cho người không xem được và chỉ dùng thành phần packages/ui; `git grep -n "<table\|divide-y\|size-2 rounded-full" -- apps/app/components/okr apps/app/components/crm/record-sheet` không có dấu hiệu vẽ tay.
    - Nội dung tại HEAD của packages/db/src/okr-duyet.ts, okr-nhac.ts, okr-hien-thi.ts, apps/api/src/okr/okr-access.service.ts, apps/api/src/okr/hien-thi.ts và apps/agent/agent/lib/tin-nhac.ts cho thấy nguoiDuyetMucTieu là hàm duy nhất suy người duyệt, nguCanhXemOkr / xemDuocMucTieu / dieuKienXemMucTieu được API, nhắc buổi sáng và tác tử gọi chung, không có bản luật thứ hai.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

Lệnh fail không gắn eval: `bun run test` thoát mã 1 (khối bên dưới). Đuôi đầu ra: 496 ca trong 54 tệp của app, 495 qua và 1 hỏng, ca hỏng là «khoa chet > moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI»; turbo báo 10 tác vụ thành công trên 11, tác vụ hỏng là app#test.

- cmd: bun run test
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bun_run_test-r1
  exit_code: 1
  verified_at: 2026-09-29T11:14:43Z

- cmd: bunx turbo run lint --force
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-29T11:14:43Z

- cmd: bun run lint:slop
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-29T11:14:43Z

- cmd: bunx turbo run build --force
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-29T11:14:43Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 24 eval máy xanh, E25 (judgment) còn UNCERTAIN chờ người; nhưng `bun run test` (lệnh suite không gắn eval) hỏng ở app#test, ca «khoa chet > moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI». Returned to implementation. Ghi chú: hai thước màn (E15, E18) tự chép ảnh đè lên evidence/man/*.png của hồ sơ nên git status hiện các tệp đó ở trạng thái đã sửa; đây là hành vi của thước, không phải sửa mã. Thời điểm verified_at là lúc soạn báo cáo, chưa có run-log để lấy mốc từng lần chạy.
