---
schema_version: 2
feature_slug: cua-vao-dang-nhap
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 77ca8466b8f4c1811411348d879271b9936b155c
human_signoff: Phan Le Manh 2026-09-26
---

# Evidence Report: cua-vao-dang-nhap

Round 3 (lượt đo lại sau khi E16 từng bị skip/chết giữa chừng ở lượt trước): toàn bộ 21 eval (E1–E21) đạt trên máy đo/ui-check, bao gồm E16 (script `soi-ma.mjs`, AC-14) nay chạy trọn — 19 DUNG, 0 SAI, mã thoát 0 — và E14 (ui-check, AC-11) với đủ 8/8 ảnh khớp Expected ở cả 4 khổ x 2 theme. Cả 4 lệnh suite hồi quy (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) đều thoát mã 0. Eval E18 (judgment, AC-15) — hội đồng 3 lens (domain-correctness, operational-feasibility, spec-alignment) đề xuất PASS cả ba, không lens nào UNCERTAIN, khác round 2 khi spec-alignment còn treo. Verdict tổng round này là PASS.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-12 | script | PASS |
| E14 | AC-11 | ui-check | PASS |
| E15 | AC-12 | test | PASS |
| E16 | AC-14 | script | PASS |
| E17 | AC-14 | script | PASS |
| E18 | AC-15 | judgment | PASS |
| E19 | AC-7 | script | PASS |
| E20 | AC-13 | script | PASS |
| E21 | AC-14 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cua-vao-dang-nhap-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_chi_sign_in
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    5 expect() calls
    Ran 5 tests across 1 file. [890.00ms]

- eval: E2
  run_id: minted-cua-vao-dang-nhap-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_shell_khong_khoi
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    22 expect() calls
    Ran 7 tests across 1 file. [391.00ms]

- eval: E3
  run_id: minted-cua-vao-dang-nhap-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_ba_buoc_google
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    6 expect() calls
    Ran 2 tests across 1 file. [1091.00ms]

- eval: E4
  run_id: minted-cua-vao-dang-nhap-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_ma_tran_cua
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    3 expect() calls
    Ran 7 tests across 1 file. [1274.00ms]

- eval: E5
  run_id: minted-cua-vao-dang-nhap-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cvdn_ma_loi_that
  verified_at: 2026-09-26T07:16:47Z
  output: |
    DUNG sso-co-mien: This_CRM_is_private._Sign_in_with_your_@onemount.com_account. -> chua-cho-phep
    DUNG sso-khong-mien: This_CRM_is_private._That_address_is_not_on_the_allow-list. -> chua-cho-phep
    KET LUAN 9 DUNG, 0 SAI — ma thoat 0

- eval: E6
  run_id: minted-cua-vao-dang-nhap-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    45 expect() calls
    Ran 15 tests across 1 file. [1143.00ms]

- eval: E7
  run_id: minted-cua-vao-dang-nhap-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    45 expect() calls
    Ran 15 tests across 1 file. [1143.00ms]

- eval: E8
  run_id: minted-cua-vao-dang-nhap-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    45 expect() calls
    Ran 15 tests across 1 file. [1143.00ms]

- eval: E9
  run_id: minted-cua-vao-dang-nhap-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    45 expect() calls
    Ran 15 tests across 1 file. [1143.00ms]

- eval: E10
  run_id: minted-cua-vao-dang-nhap-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_chu
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    522 expect() calls
    Ran 95 tests across 1 file. [570.00ms]

- eval: E11
  run_id: crm_xenodochial_gould_763cda_do
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T07:16:47Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0
  network_observed: n-a (driver)

- eval: E12
  run_id: crm_xenodochial_gould_763cda_do
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T07:16:47Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0
  network_observed: n-a (driver)

- eval: E13
  run_id: crm_xenodochial_gould_763cda_do
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T07:16:47Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-cua-vao-dang-nhap-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T07:16:47Z
  screenshot: _acceptance/cua-vao-dang-nhap/evidence/cvdn-320-light.png
  observed: |
    Mo tung frame bang Read va doi chieu Expected: (1) cvdn-320-light.png va cvdn-320-dark.png: mot cot dung — logo OneHub, tieu de "Đăng nhập vào CRM", nut "Tiếp tục với Google", chu "hoặc", o "Địa chỉ email", o "Mật khẩu", nut "Đăng nhập", roi moi toi khoi "Lần đầu vào?" voi 3 buoc danh so 1/2/3; khong dau hieu tran ngang (anh dung khop 320px). Light: nen trang/xam nhat, chu toi; dark: nen den, chu sang, ca hai doc ro. (2) cvdn-768-light.png/dark.png: cung mot cot dung nhu 320 nhung rong hon, thu tu cac khoi giu nguyen, khong tran ngang. (3) cvdn-1024-light.png/dark.png: hai cot — cot trai nen xam phang (khong thay van nhieu hay gradient toi) co logo, khoi "Lần đầu vào?" 3 buoc, va dong "CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR." o duoi; cot phai la khung dang nhap day du (logo, tieu de, nut Google, hoac, 2 o nhap, nut Đăng nhập). Light nen trang/xam + chu toi; dark nen den + chu trang, deu doc duoc. (4) cvdn-1440-light.png/dark.png: bo cuc giong 1024 nhung rong hon, cung dung cau truc hai cot, nhan chu ro net, mau sac dung nhu mo ta. Tat ca 8 anh bat buoc theo Expected deu co mat va dung dinh dang; khong anh nao thieu hay sai bo cuc/mau.

    Ket luan chung: moi assertion PASS, khong dong SAI, 8/8 anh dung Expected, exit code cua lenh do la 0.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-cua-vao-dang-nhap-E15-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_quen_mat_khau
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [1172.00ms]

- eval: E16
  run_id: minted-cua-vao-dang-nhap-E16-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cvdn_soi_ma
  verified_at: 2026-09-26T07:16:47Z
  output: |
    DUNG (b) apps/app/components/cua-vao/o-loi-dang-nhap.tsx dung Alert tu @crm/ui/components/alert
    DUNG (d) diff khong cham landing, proxy.ts, packages/auth
    KET LUAN 19 DUNG, 0 SAI — ma thoat 0

- eval: E17
  run_id: design-gate-a810260368
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cvdn_san_thiet_ke
  verified_at: 2026-09-26T07:16:47Z
  output: |
    "blocking": [],
    "findings": []

- eval: E18
  judged_by: judge panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  votes:
    - domain-correctness: PASS — Chữ trong cuaVaoMessages (cua-vao.ts) và các khoá liên quan của auth.ts (signIn, quenMatKhau, datMatKhau) đọc như tiếng Việt tự nhiên, chuyên nghiệp, đúng phong cách ngắn-theo-ngữ-cảnh của CONTEXT.md (vd. "Nhờ quản trị viên cho phép địa chỉ email bạn sẽ dùng", "Liên kết dùng một lần, hết hạn sau {phut} phút"); rà theo từng mục _Avoid_ của CONTEXT.md (công ty/công ty khách, cá nhân môi giới, agent/bot/trợ lý, workspace…) thì không câu nào trong các khoá này rơi đúng nghĩa bị cấm — "quản trị viên" ở đây chỉ người có vai quản trị thật, khác với mục _Avoid_ "quản trị" chỉ áp cho danh xưng Trưởng đơn vị. Câu duy nhất đưa dữ liệu người thật (địa chỉ email) là "địa chỉ email" thay cho "email công ty" đã duyệt ở Q1, và decisions.jsonl có đủ dòng trả lời của chủ kho: d-20260925T152541Z-3 nêu vấn đề chờ phê (serves AC-15), d-20260925T202141Z-6 ghi nhận chủ kho duyệt Cổng Phạm vi chấp nhận đúng cách viết "địa chỉ email" thay "email công ty", và d-20260926T071630Z-16 khoá lại Cổng Phạm vi (seal gate 1) sau khi mở rộng E21 — tức câu chữ này đã có quyết định của chủ kho, không còn treo.
    - operational-feasibility: PASS — Đọc toàn bộ cuaVaoMessages (cua-vao.ts) và các khoá đăng nhập/quên-mật-khẩu/đặt-mật-khẩu của auth.ts: câu chữ tiếng Việt tự nhiên, đúng giọng nghiệp vụ (vd. "Liên kết dùng được một lần và còn hạn ${phut} phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên."), không thấy từ nào trùng đúng nghĩa với mục _Avoid_ nào trong CONTEXT.md (không có "công ty môi giới", "khách hàng", "liên hệ/contact", "trợ lý", "onboarding" hiển thị, v.v.). Câu dùng "địa chỉ email" (thay "email công ty") xuất hiện xuyên suốt hai tệp, và quyết định d-20260925T202141Z-6 trong decisions.jsonl ghi rõ "Chủ kho duyệt Cổng Phạm vi không sửa, nhận năm khuyến nghị đã trình: ... viết «địa chỉ email» thay «email công ty»", được khoá lại bằng dòng seal gate 1 ngay sau đó (d-...-7) — tức đã có dòng trả lời của chủ kho cho đúng cách gọi liên quan đến địa chỉ người thật.
    - spec-alignment: PASS — cuaVaoMessages (lanDau, buoc, loi) và các khoá auth.ts rõ ràng thuộc vòng này (signIn, quenMatKhau, datMatKhau, shell, docTitle) đọc như tiếng Việt tự nhiên của người làm nghề, không dùng từ nào trùng đúng nghĩa mục _Avoid_ của CONTEXT.md ("quản trị viên" ở đây là vai admin thật, khác nghĩa mục Trưởng đơn vị nơi "quản trị" bị tránh). Câu đưa người thật — "địa chỉ email" thay "email công ty" — đã có dòng chủ kho phê tại decisions.jsonl (d-20260925T152541Z-3 đề xuất tạm, d-20260925T202141Z-6 chủ kho duyệt giữ nguyên "địa chỉ email", niêm tại seal Gate 1 -7 và -16). Các khối onboarding/grantAccess/research trong auth.ts (ví dụ "tác nhân biết bạn bán gì") không nằm trong AC nào ở decisions.jsonl của vòng cua-vao-dang-nhap nên hợp lý coi là ngoài phạm vi "khoá đổi" của vòng này.
  rationale: Cả 3/3 lens của hội đồng round này chấm PASS trên toàn bộ chữ mới/đổi của cuaVaoMessages và các khoá đăng nhập/quên-mật-khẩu/đặt-mật-khẩu của auth.ts, không lens nào UNCERTAIN. Câu duy nhất đưa dữ liệu người thật ("địa chỉ email" thay "email công ty") đã có dòng quyết định của chủ kho trong decisions.jsonl (d-20260925T152541Z-3, d-20260925T202141Z-6, seal d-...-7, tái khoá d-20260926T071630Z-16 sau khi mở rộng E21).
  required_evidence:
    - (hội đồng không nêu bằng-chứng-thiếu — cả 3 lens đều PASS, không còn required_evidence treo)

- eval: E19
  run_id: crm_xenodochial_gould_763cda_do
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T07:16:47Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0
  network_observed: n-a (driver)

- eval: E20
  run_id: minted-cua-vao-dang-nhap-E20-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cvdn_thuoc_da_ky
  verified_at: 2026-09-26T07:16:47Z
  output: |
    DUNG vao-bang-email-va-mat-khau/E17: base 0 -> head 0
    DUNG vao-bang-email-va-mat-khau/E15: base 0 -> head 0
    KET LUAN 13 DUNG, 0 SAI — ma thoat 0

- eval: E21
  run_id: minted-cua-vao-dang-nhap-E21-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_step_list_tinh
  verified_at: 2026-09-26T07:16:47Z
  output: |
    0 fail
    11 expect() calls
    Ran 5 tests across 1 file. [409.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-cua-vao-dang-nhap-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-26T07:16:47Z
  output: |
    Time:    2m39.026s

    test-run: dropped crm_mui28kb0or17_test

- cmd: bunx turbo run lint --force
  run_id: minted-cua-vao-dang-nhap-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-26T07:16:47Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    497ms

- cmd: bun run lint:slop
  run_id: minted-cua-vao-dang-nhap-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-26T07:16:47Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 874ms on 1575 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-cua-vao-dang-nhap-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-26T07:16:47Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    11.691s

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 6 phát hiện thước trong hợp đồng bị REJECT (bàn đo Tab không đi hết khối, E19 dùng câu hook giả thay câu thật, thuoc-da-ky xanh rỗng — t3/t5/t7/t10) — đã sửa ở commit 6212fc09 (bàn đo Tab đi hết khối, E19 dùng câu hook thật, thuoc-da-ky không xanh rỗng) và commit 096affd3 (test đăng nhập đo quan hệ và đầu ra thật). Trả lại implementation.
Round 2: toàn bộ 20 eval (E1–E20) đạt trên máy đo — E18 (judgment) có 1/3 lens UNCERTAIN chờ human_override, không tự nâng verdict. Verdict tổng vẫn REJECT vì lệnh suite `bunx turbo run lint --force` (app#lint, 2 lỗi biome a11y — noNoninteractiveTabindex và noAutofocus — mới xuất hiện trong apps/app/test/cua-vao-sign-in.dom.tsx) thất bại; lệnh này không gắn AC nào nên không vào failed_evals, nhưng CLAUDE.md liệt `bun run lint` là 1 trong 5 lệnh chứng minh bắt buộc của kho.
Round 3: sau ký lại Gate 1 (mở rộng E21), toàn bộ 21 eval (E1–E21) đạt trên máy đo/ui-check — gồm cả E16 (agent đo ở lượt đầu của round này bị skip/chết giữa chừng, đã chạy lại thành công: 19 DUNG, 0 SAI, mã thoát 0) và E14 ui-check (8/8 ảnh khớp Expected ở cả 4 khổ x 2 theme). Cả 4 lệnh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) đều xanh — lỗi biome a11y của round 2 đã hết. E18 (judgment) hội đồng 3/3 lens đề xuất PASS, không lens nào UNCERTAIN (khác round 2, khi 1/3 lens UNCERTAIN). Verdict tổng round này là PASS.

### Re-pin lần 1 — 2026-10-05, do R1f cua-vao-va sửa thước soi-ma (danh sách đóng băng) và khong-shader (bỏ qua lưới chấm có tên)
run_id: repin-20261005T002015Z-46150
sha: bc521b55cef53c92861f49648c8d9ff4625c5448 · suites: 7 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E14, E18 · diff chạm vật đo ngoài làn máy: E14, E18 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15

### Re-pin lần 2 — 2026-10-05, do gộp onehub e9f8ed2f (#260, #262) trước khi merge #261
run_id: repin-20261005T043446Z-73088
sha: 77ca8466b8f4c1811411348d879271b9936b155c · suites: 7 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E14, E18 · AC không có chốt máy: AC-15
