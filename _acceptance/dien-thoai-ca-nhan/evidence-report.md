---
schema_version: 2
feature_slug: dien-thoai-ca-nhan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 28b7f9d3d670a5f7a768b5fb52acc0302734b132
human_signoff:
---

# Evidence Report: dien-thoai-ca-nhan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-1 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | script | PASS |
| E16 | AC-2 | ui-check | PASS |
| E17 | AC-9 | ui-check | PASS |
| E18 | AC-10 | ui-check | PASS |
| E19 | AC-4 | ui-check | PASS |
| E20 | AC-8 | ui-check | PASS |
| E21 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-dien-thoai-ca-nhan-E1-r2
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T01:58:25Z
  baseline: n-a
  screenshot: evidence/them-tab-1440.png
  observed: |
    them-tab-1440.png (da mo bang Read): sheet cong ty Monzo, tab "Ca nhan" dang chon; form them mo, thu tu o tren xuong/trai sang phai: Ten (da go "DT mv0bhgmv Lan 1440"), Ho, Dien thoai (da go "0911 157 956", con tro nhap), Email, Chuc danh (placeholder "Truong phong Kinh doanh"); nut Huy va "Them ca nhan" (xanh); duoi form la bang 3 ca nhan cu. Khop Expected (thu tu Ten, Ho, Dien thoai, Email, Chuc danh). them-tab-375.png (da mo bang Read): kho 375, luoi mot cot, thu tu doc xuong Ten ("DT mv0bhgmv Lan 375"), Ho, Dien thoai ("0921 160 429", nam trong khung, co vien focus), Email, Chuc danh; o Dien thoai hien day du trong khung. Khop Expected. (Hai anh E1-step1/2.png trong thu muc la cu tu 08:41, khong phai lan chay nay, khong dung.)
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-dien-thoai-ca-nhan-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_api_tao
  verified_at: 2026-10-09T01:58:25Z
  output: |
    test-run: dropped crm_mv0bh01zjcyd_test

- eval: E2b
  run_id: minted-dien-thoai-ca-nhan-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_api_tao
  verified_at: 2026-10-09T01:58:25Z
  output: |
    test-run: dropped crm_mv0bh01zjcyd_test

- eval: E3
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_man_form
  verified_at: 2026-10-09T01:58:25Z
  output: |
    Ran 4 tests across 1 file. [1265.00ms]

- eval: E4
  run_id: minted-dien-thoai-ca-nhan-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_doc_so
  verified_at: 2026-10-09T01:58:25Z
  output: |
    Ran 28 tests across 1 file. [11.00ms]

- eval: E5
  run_id: minted-dien-thoai-ca-nhan-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_man_so_sai
  verified_at: 2026-10-09T01:58:25Z
  output: |
    Ran 6 tests across 1 file. [1.50s]

- eval: E6
  run_id: minted-dien-thoai-ca-nhan-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_api_so_sai
  verified_at: 2026-10-09T01:58:25Z
  output: |
    test-run: dropped crm_mv0bgzes7kuc_test

- eval: E7
  run_id: minted-dien-thoai-ca-nhan-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_api_tao
  verified_at: 2026-10-09T01:58:25Z
  output: |
    test-run: dropped crm_mv0bh01zjcyd_test

- eval: E8
  run_id: minted-dien-thoai-ca-nhan-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_api_trung
  verified_at: 2026-10-09T01:58:25Z
  output: |
    test-run: dropped crm_mv0bh0jculx6_test

- eval: E9
  run_id: minted-dien-thoai-ca-nhan-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_api_trung
  verified_at: 2026-10-09T01:58:25Z
  output: |
    test-run: dropped crm_mv0bh0jculx6_test

- eval: E10
  run_id: minted-dien-thoai-ca-nhan-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_man_bang
  verified_at: 2026-10-09T01:58:25Z
  output: |
    Ran 1 test across 1 file. [747.00ms]

- eval: E11
  run_id: mv0bh0zvbxvx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_api_tim
  verified_at: 2026-10-09T01:58:25Z
  output: |
    test-run: dropped crm_mv0bh0zvbxvx_test

- eval: E12
  run_id: mv0bh0zvbxvx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_api_tim
  verified_at: 2026-10-09T01:58:25Z
  output: |
    test-run: dropped crm_mv0bh0zvbxvx_test

- eval: E13
  run_id: minted-dien-thoai-ca-nhan-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_kara_tim
  verified_at: 2026-10-09T01:58:25Z
  output: |
    tim-theo-so.integration.spec.ts chay xong, khong co dong that bai

- eval: E14
  run_id: minted-dien-thoai-ca-nhan-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_man_moi_gioi
  verified_at: 2026-10-09T01:58:25Z
  output: |
    Ran 5 tests across 1 file. [1.64s]

- eval: E15
  run_id: design-gate-7e478ebd9d, design-gate-a08a440833
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dt_san_thiet_ke
  verified_at: 2026-10-09T01:58:25Z
  output: |
    design-gate.mjs --mode static chay cho nam tep, khong P0

- eval: E16
  run_id: minted-dien-thoai-ca-nhan-E16-r2
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T01:58:25Z
  baseline: n-a
  screenshot: evidence/E16-step1.png
  observed: |
    Frame E16-step1.png (bản sao của evidence/tao-sheet-1440.png, 1440px; E16-step2.png là cùng ảnh): sheet trượt bên phải, tiêu đề «Cá nhân mới». Thứ tự nhãn từ trên xuống: Tên, Họ, Điện thoại, Email, Chức danh, Công ty, Phụ trách. Ô Tên có chữ «DT mv0bjcig Ban». Ô Điện thoại đang có con trỏ và chứa «+84 28 3812 3456». Có nút Huỷ và nút xanh «Thêm cá…», chữ bị bong bóng dev che một phần. Khớp Expected: thứ tự Tên, Họ, Điện thoại, Email, ô Điện thoại có mặt, và số +84 28 3812 3456 đã gõ. Kết quả lưu vào CSDL chỉ thấy ở dòng log của lệnh đo, không thấy trong ảnh.
  network_observed: n-a (driver)

- eval: E17
  run_id: minted-dien-thoai-ca-nhan-E17-r2
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T01:58:25Z
  baseline: n-a
  screenshot: evidence/E17-step1.png
  observed: |
    Da Read evidence/tim-bang-1440.png (E17-step1/step2 la ban sao giong het). Khung 1440 theme toi, trang "Ca nhan" ("Moi ca nhan trong mang luoi."). O tim dang focus chua dung chuoi "0911215810" (khong bi noi voi truy van truoc nhu round 1). Bang chi con DUNG MOT hang: "DT mv0bip8e Lan ...", dien thoai "0911 215 810", cong ty Monzo, phu trach Marcus. Chan trang ghi "1-1 trong so 1" (khong con "1-25 trong so 55" cua round 1). Doi chieu Expected: go so dang 0... -> con dong cua nguoi them o them-tab-1440 (phone +84911215810, cung la so dien thoai nguoi them). Dong script xac nhan truy van "+84 911 215 810" cung ra 1 dong. Khop Expected.
  network_observed: n-a (driver)

- eval: E18
  run_id: minted-dien-thoai-ca-nhan-E18-r2
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T01:58:25Z
  baseline: n-a
  screenshot: evidence/E18-step1.png
  observed: |
    Đã mở bằng Read cmdk-1440.png, E18-step1.png và E18-step2.png (cả ba cùng nội dung, 18581 byte, lưu lúc 09:00 sau lần chạy này). Ảnh 1440x900, nền tối. Hộp ⌘K nằm giữa màn hình, ô tìm có chữ "0911 185 678", chưa có thông báo lỗi hay trạng thái không có kết quả. Số này là số riêng của lượt, mà dòng bang-1440 của cùng lượt ghi là số của người vừa thêm. Dưới ô tìm có một nhóm "Cá nhân" với đúng một mục: avatar "D1", tên "DT mv0bi133 Lan 1440", dòng phụ "Monzo" (tên công ty). Tên này trùng với người ở dòng bang-1440 của cùng lượt đo. Khớp Expected: mục Cá nhân có người vừa thêm và dòng phụ là tên công ty. Biến thể đối chứng (bản sao search.service bỏ nhánh số) không chạy theo prompt này.
  network_observed: n-a (driver)

- eval: E19
  run_id: minted-dien-thoai-ca-nhan-E19-r2
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T01:58:25Z
  baseline: n-a
  screenshot: evidence/E19-step1.png
  observed: |
    Opened evidence/so-sai-375.png (also saved as E19-step1.png and E19-step2.png, same bytes, written 09:09 by my run). A 375px-wide frame (dark theme) shows the Monzo company sheet with the «Cá nhân 5» tab selected. The add-person form is below it. The «Điện thoại» label and its input are red-bordered and contain "abc" with the caret visible, so focus is on that input. Directly under the input is red text «Số điện thoại chưa đúng — ví dụ 0901 234 567». Underneath are the Email and Chức danh fields and the Huỷ and «Thêm cá nhân» buttons. This matches Expected: the error string is red, directly under the phone field, in a 375 frame, and focus is on the phone input.
  network_observed: n-a (driver)

- eval: E20
  run_id: minted-dien-thoai-ca-nhan-E20-r2
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T01:58:25Z
  baseline: n-a
  screenshot: evidence/E20-step1.png
  observed: |
    Mo bang-1440.png, copy thanh E20-step1.png va E20-step2.png (cung noi dung, 1440x900, giao dien toi, trang «Ca nhan»). Tieu de cot theo thu tu: Ten, Dien thoai, Chuc danh, Email, Cong ty, Phu trach, Hoat dong gan nhat, nen cot «Dien thoai» nam ngay sau «Ten» dung Expected. Hang thu ba, nguoi them o them-tab («DT mv0btmif Lan ...», cong ty Monzo), hien «0911 725 001», dung dinh dang nhom 4-3-3. Hai hang gan nhau hien «028 3812 3456» (tao-sheet) va «0921 726 999» (them-tab-375). Cac so thang hang cot trai, cung do rong chu so, nen cot so thang hang. Hang ngoai cho hien so quoc te «+14155557053», «+14155555636» va dau «—» khi trong. Anh khong kiem duoc tabular-nums bang mat, nen doc ma nguon: apps/app/components/crm/so-dien-thoai.tsx dong 17 va 27 co class tabular-nums. Expected viet «0901 234 567» nhung E1 khai so rieng cua luot, nen so cua luot nay la «0911 725 001»; dinh dang giong, khong coi la mau thuan.
  network_observed: n-a (driver)

- eval: E21
  run_id: minted-dien-thoai-ca-nhan-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dt_man_trung
  verified_at: 2026-10-09T01:58:25Z
  output: |
    Ran 2 tests across 1 file. [918.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-09T01:58:25Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-09T01:58:25Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-09T01:58:25Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-09T01:58:25Z

- cmd: bunx turbo run lint --force
  run_id: minted-dien-thoai-ca-nhan-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-09T01:58:25Z

- cmd: bun run lint:slop
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-09T01:58:25Z

- cmd: bunx turbo run build --force
  run_id: minted-dien-thoai-ca-nhan-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-09T01:58:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung block eval ghi n-a.

Eval khong-phan-biet (pass tren ca HEAD lan baseline round 1, chung minh harness chu khong phai feature):
- E15 (AC-13, design-gate static cho nam tep): xanh ca hai phia. Day la cong thiet ke tinh, la regression-guard co chu y; neu muon chung minh no phan biet thi viet lai de assert hanh vi moi hoac giu nguyen nhu guard.

Lenh suite xanh-ca-hai-phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform (moi eval chay 1 lan, khong eval nao co phuong sai).

## Iterations

Round 1: E17 failed (tim-bang-1440 bao DUNG nhung khung hinh cho thay bang chua loc: choDong thoa man ngay vi dong cua nguoi do da nam san tren trang chua loc, va goTim noi truy van thay vi thay the). E10 BLOCKED (cap nhay doi quanh bo loc -t trong lenh pinned bi zsh doc sai nen khong chay duoc ngan-chi-tiet). Lenh suite app/ui co 4 test do ngoai eval (kho chuoi cua vong ③a, contacts va record-sheet). Returned to implementation.
Round 2: 22 eval (E1-E21 va E2b) xanh, bay lenh suite xanh; E17 do lai sau khi sua goTim/choLocXong, anh cho thay mot hang duy nhat; E10 chay duoc ca hai lenh -t. Khong eval nao that bai. Verdict PASS.
