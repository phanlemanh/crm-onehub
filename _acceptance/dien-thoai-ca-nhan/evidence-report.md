---
schema_version: 2
feature_slug: dien-thoai-ca-nhan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 974cb5c9d124edfd9075889ea3578be545d8cf79
human_signoff: Phan Le Manh 2026-10-09
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
  run_id: minted-dien-thoai-ca-nhan-E1-r3
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T04:15:19Z
  baseline: n-a
  screenshot: evidence/them-tab-1440.png
  observed: |
    Da mo bang Read hai anh moi (mtime 11:16-11:17, tu lan chay nay). them-tab-1440.png: sheet cong ty Monzo, tab "Ca nhan 3" dang chon, form them ca nhan hien thu tu Ten, Ho (cot phai), Dien thoai, Email (cot phai), Chuc danh. Ten = «DT mv0gdijk Lan 1440», o Dien thoai dang focus chua «0919 376 243», nut «Them ca nhan» mau xanh ben duoi; danh sach 3 ca nhan cu (Vera Gupta, Farah Oyelaran, Dana Petrov) o duoi. Khop Expected (thu tu o va o Dien thoai co mat).
    them-tab-375.png: kho 375, drawer Monzo, tab "Ca nhan 4" (them 1 nguoi tu o 1440), luoi mot cot theo thu tu Ten («DT mv0gdijk Lan 375»), Ho, Dien thoai («0929 461 007», trong khung, co con tro), Email, Chuc danh (bi nut tron goc duoi che mot phan nhan, khong anh huong o Dien thoai). Khop Expected.
    Luu y nho: chuoi Ten thuc te la «DT <ma luot> Lan <kho>» chu khong dung nguyen van «Lan DT <ma luot>» nhu van ban Expected; dong DUNG cua do-man van doc CSDL khop ten do, nen khong coi la SAI.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-dien-thoai-ca-nhan-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_api_tao
  verified_at: 2026-10-09T04:15:19Z
  output: |
    describe "tao-chuan-hoa" chay tren CSDL thu rieng cua luot
    test-run: dropped crm_mv0gcy70cr9u_test

- eval: E2b
  run_id: minted-dien-thoai-ca-nhan-E2b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_api_tao
  verified_at: 2026-10-09T04:15:19Z
  output: |
    cung lenh voi E2 (dedupe); dong 2 cua "tao-chuan-hoa"
    test-run: dropped crm_mv0gcy70cr9u_test

- eval: E3
  run_id: minted-dien-thoai-ca-nhan-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_man_form
  verified_at: 2026-10-09T04:15:19Z
  output: |
    Ran 4 tests across 1 file. [1449.00ms]

- eval: E4
  run_id: minted-dien-thoai-ca-nhan-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_doc_so
  verified_at: 2026-10-09T04:15:19Z
  output: |
    Ran 32 tests across 1 file. [7.00ms]

- eval: E5
  run_id: minted-dien-thoai-ca-nhan-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_man_so_sai
  verified_at: 2026-10-09T04:15:19Z
  output: |
    Ran 6 tests across 1 file. [1488.00ms]

- eval: E6
  run_id: minted-dien-thoai-ca-nhan-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_api_so_sai
  verified_at: 2026-10-09T04:15:19Z
  output: |
    test-run: dropped crm_mv0gczom5amm_test

- eval: E7
  run_id: minted-dien-thoai-ca-nhan-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_api_tao
  verified_at: 2026-10-09T04:15:19Z
  output: |
    cung lenh voi E2 (dedupe); dong 4 cua "tao-chuan-hoa" (khong phone, phone null)
    test-run: dropped crm_mv0gcy70cr9u_test

- eval: E8
  run_id: minted-dien-thoai-ca-nhan-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_api_trung
  verified_at: 2026-10-09T04:15:19Z
  output: |
    describe "trung-tao"
    test-run: dropped crm_mv0gcywujp5j_test

- eval: E9
  run_id: minted-dien-thoai-ca-nhan-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_api_trung
  verified_at: 2026-10-09T04:15:19Z
  output: |
    cung lenh voi E8 (dedupe); describe "trung-sua"
    test-run: dropped crm_mv0gcywujp5j_test

- eval: E10
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_man_bang
  verified_at: 2026-10-09T04:15:19Z
  output: |
    hai lenh bun test noi bang && (cot-bang, roi ngan-chi-tiet), ca hai ket thuc thanh cong

- eval: E11
  run_id: minted-dien-thoai-ca-nhan-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_api_tim
  verified_at: 2026-10-09T04:15:19Z
  output: |
    describe "tim-bang"
    test-run: dropped crm_mv0gcyddvsed_test

- eval: E12
  run_id: minted-dien-thoai-ca-nhan-E12-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_api_tim
  verified_at: 2026-10-09T04:15:19Z
  output: |
    cung lenh voi E11 (dedupe); describe "tim-cmdk"
    test-run: dropped crm_mv0gcyddvsed_test

- eval: E13
  run_id: mv0gcxu2l64y
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_kara_tim
  verified_at: 2026-10-09T04:15:19Z
  output: |
    test-run: dropped crm_mv0gcxu2l64y_test

- eval: E14
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_man_moi_gioi
  verified_at: 2026-10-09T04:15:19Z
  output: |
    Ran 5 tests across 1 file. [1331.00ms]

- eval: E15
  run_id: design-gate-91b55c7e49, design-gate-c7196074b1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.dt_san_thiet_ke
  verified_at: 2026-10-09T04:15:19Z
  output: |
    design-gate --mode static chay lan luot cho nam tep, vong lap ket thuc thanh cong, khong P0

- eval: E16
  run_id: minted-dien-thoai-ca-nhan-E16-r3
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T04:15:19Z
  baseline: n-a
  screenshot: evidence/E16-step1.png
  observed: |
    Đã mở bằng Read ảnh tao-sheet-1440.png vừa được lần đo mới sinh. E16-step1.png và E16-step2.png là hai bản sao của ảnh này. Ảnh 1440px nền tối, có sheet trượt bên phải với tiêu đề «Cá nhân mới». Nhãn từ trên xuống là Tên, Họ, Điện thoại, Email, Chức danh, Công ty, Phụ trách. Ô Tên có chữ «DT mv0gie9f Ban». Ô Điện thoại đang focus (viền xanh, có con trỏ) và chứa «+84 28 3812 3456». Có nút Huỷ và nút xanh «Thêm cá…» bị bong bóng dev che một phần. Thứ tự nhãn Tên, Họ, Điện thoại, Email khớp Expected, ô Điện thoại có mặt và số đã gõ đúng. Ảnh không cho thấy kết quả lưu CSDL. Kết quả đó nằm ở dòng log của lệnh đo: phone=+842838123456, source=MANUAL.
  network_observed: n-a (driver)

- eval: E17
  run_id: minted-dien-thoai-ca-nhan-E17-r3
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T04:15:19Z
  baseline: n-a
  screenshot: evidence/E17-step1.png
  observed: |
    Mo bang Read evidence/tim-bang-1440.png (E17-step1.png va E17-step2.png la ban sao giong het, copy sau khi chay). Khung 1440x900 theme toi, trang "Ca nhan" ("Moi ca nhan trong mang luoi."). O tim dang chua dung chuoi "0919730918" (dang so noi dia, khong con noi tiep voi truy van "+84 919 730 918" truoc do). Bang chi con DUNG MOT hang: "DT mv0gl7sc Lan ...", dien thoai "0919 730 918", cong ty Monzo, phu trach Marcus. Chan trang ghi "1-1 trong so 1" (khong phai trang 25 dong chua loc). Doi chieu Expected: bang chi con dong cua nguoi them o them-tab-1440 (CSDL phone +84919730918, cung la so cua nguoi them o them-tab-1440 trong cung lan do). Khop Expected. Dong script: truoc khi tim 25 dong (>1); moi dang so mot lan tai trang moi, moi lan chi con 1 dong.
  network_observed: n-a (driver)

- eval: E18
  run_id: minted-dien-thoai-ca-nhan-E18-r3
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T04:15:19Z
  baseline: n-a
  screenshot: evidence/E18-step1.png
  observed: |
    Da mo bang Read cmdk-1440.png (E18-step1.png va E18-step2.png la ban sao byte-giong, 18796 byte, luu 11:19 sau lan chay moi nay; do-man.mjs chi ghi cmdk-1440.png nen toi sao ra hai ten E18-step). Anh 1440x900, nen toi. Hop ⌘K o giua man hinh, o tim co chu "0919 508 262" (con tro nhap), khong co thong bao loi hay "khong co ket qua". Duoi o tim co mot nhom "Ca nhan" voi dung mot muc: avatar "D1", ten "DT mv0gg69d Lan 1440", dong phu "Monzo" (ten cong ty). Ten nay trung voi nguoi o dong bang-1440 cung luot ("DT mv0gg69d Lan 1440", «0919 508 262», them o them-tab-1440). Khop Expected: muc Ca nhan co nguoi them o them-tab-1440 va dong phu la ten cong ty. Khong mau thuan (Expected viet 0901 234 567 nhung do man dung so rieng cua luot, cung dinh dang 4-3-3).
  network_observed: n-a (driver)

- eval: E19
  run_id: mot-luot dt_do_man (E19 / AC-4)
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T04:15:19Z
  baseline: n-a
  screenshot: evidence/E19-step1.png
  observed: |
    Frame doc truc tiep: evidence/so-sai-375.png, copy thanh E19-step1.png va E19-step2.png (cung 40772 byte). Khung 375px, giao dien toi, so cong ty Monzo voi tab «Ca nhan 5» dang chon. Form them ca nhan nam duoi. Nhan «Dien thoai» va o nhap co vien do, trong o la «abc» va con tro nhap nhay, nen focus dang o o Dien thoai. Ngay duoi o la chu do «So dien thoai chua dung — vi du 0901 234 567». Phia duoi la Email, Chuc danh, nut Huy va «Them ca nhan». Khop Expected: cau loi do nam ngay duoi o Dien thoai trong khung 375, focus o o Dien thoai.
  network_observed: n-a (driver)

- eval: E20
  run_id: minted-dien-thoai-ca-nhan-E20-r3
  exit_code: 0
  verifier: config:executors.script.dt_do_man
  verified_at: 2026-10-09T04:15:19Z
  baseline: n-a
  screenshot: evidence/E20-step1.png
  observed: |
    Da Read evidence/bang-1440.png (E20-step1/step2.png la ban sao giong het, 123791 byte, chup 11:23 trong lan chay nay). Khung 1440x900, giao dien toi, trang «Cá nhân» («Mọi cá nhân trong mạng lưới.»), nut «Cá nhân mới», thanh Lọc/Sắp xếp/Cột (7)/Bảng xem/Lưu trữ. Header cot theo thu tu: Tên, Điện thoại, Chức danh, Email, Công ty, Phụ trách, Hoạt động gần nhất, tuc cot «Điện thoại» ngay sau «Tên». Ba hang dau: «DT mv0gmg5f Ban» 028 3812 3456; «DT mv0gmg5f La...» (avatar D3) 0929 805 310, Monzo; «DT mv0gmg5f La...» (avatar D1) 0919 796 223, Monzo, day la nguoi them o them-tab-1440. So dinh dang nhom 4-3-3, thang hang cot trai, cung do rong chu so; hang ngoai cho hien so quoc te +14155557053, +14155555636 va dau «—» khi trong. Chan trang «1–25 trong số 55». Khop Expected (so cua luot nay la 0919 796 223 thay vi 0901 234 567 vi so rieng cua luot; cung dinh dang).
  network_observed: n-a (driver)

- eval: E21
  run_id: minted-dien-thoai-ca-nhan-E21-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dt_man_trung
  verified_at: 2026-10-09T04:15:19Z
  output: |
    Ran 2 tests across 1 file. [797.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-09T04:15:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-09T04:15:19Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-09T04:15:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-09T04:15:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-dien-thoai-ca-nhan-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-09T04:15:19Z

- cmd: bun run lint:slop
  run_id: minted-dien-thoai-ca-nhan-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-09T04:15:19Z

- cmd: bunx turbo run build --force
  run_id: minted-dien-thoai-ca-nhan-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-09T04:15:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval khong-phan-biet (pass tren ca HEAD lan baseline, chung minh harness chu khong phai feature):
- E15 (AC-13, design-gate static cho nam tep): xanh ca hai phia. Day la cong thiet ke tinh, la regression-guard co chu y; neu muon chung minh no phan biet thi viet lai de assert hanh vi moi hoac giu nguyen nhu guard.

Lenh suite xanh-ca-hai-phia la regression-guard binh thuong, khong liet ke. Cac eval ui-check ghi baseline n-a (khong chay duoc tren code cu).

## Variance

none — every multi-run eval is uniform (moi eval chay 1 lan, khong eval nao co phuong sai).

## Iterations

Round 1: E17 failed (tim-bang-1440 bao DUNG nhung khung hinh cho thay bang chua loc: choDong thoa man ngay vi dong cua nguoi do da nam san tren trang chua loc, va goTim noi truy van thay vi thay the). E10 BLOCKED (cap nhay doi quanh bo loc -t trong lenh pinned bi zsh doc sai nen khong chay duoc ngan-chi-tiet). Returned to implementation.
Round 2: 22 eval (E1-E21 va E2b) xanh, bay lenh suite xanh; E17 do lai sau khi sua goTim/choLocXong, anh cho thay mot hang duy nhat; E10 chay duoc ca hai lenh -t. Khong eval nao that bai. Verdict PASS.
Round 3: sau khi doi luat doc so (so 0 trung ke sau +84, phan quoc noi khong bat dau bang 0) o commit da321bf5a, chay lai du 22 eval va bay lenh suite tren verified_commit moi: tat ca xanh, khong eval nao that bai. Verdict PASS.
