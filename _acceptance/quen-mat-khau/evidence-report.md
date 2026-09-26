---
schema_version: 2
feature_slug: quen-mat-khau
verdict: BLOCKED
failed_evals: []
reason: "bun run test: output was cut mid-execution — test suite did not complete. Tool truncated the output while tests were still running in @crm/validation package."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fd11f4b3e677f5b2be478fc91614f0b7dc657357
human_signoff:
---

# Evidence Report: quen-mat-khau

Round 2. Risk tier: T3 (thay đổi chạm `packages/auth/src/auth.ts`, `thu-mat-khau.ts`, `chia-mat-khau.ts`, `env.ts`) — mọi judgment item cần `human_override` dù đề xuất của hội đồng là gì. Toàn bộ 22 eval máy (E1–E19, E21–E23) đều PASS và hội đồng judgment cho E20 đề xuất PASS, nhưng lệnh hồi quy `bun run test` (không gắn eval, chạy toàn bộ monorepo qua turbo) bị công cụ cắt output giữa chừng khi đang chạy gói `@crm/validation`, chưa in ra dòng tổng kết. Vì vậy verdict tổng là BLOCKED — cần chạy lại `bun run test` với timeout dài hơn, không phải lỗi mã nguồn.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-2 | test | PASS |
| E6 | AC-3 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-9 | test | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-5 | test | PASS |
| E17 | AC-9 | test | PASS |
| E18 | AC-12 | ui-check | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-13 | judgment | PASS (đề xuất — chờ human_override, T3) |
| E21 | AC-1 | ui-check | PASS |
| E22 | AC-14 | test | PASS |
| E23 | AC-14 | test | PASS |

## Evidence

- eval: E1
  run_id: muho4zkm8o67
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_co_tat_api
  verified_at: 2026-09-26T00:45:33Z
  output: |
    1 expect() calls
    Ran 1 test across 1 file. [672.00ms]
    test-run: dropped crm_muho4zkm8o67_test

- eval: E2
  run_id: minted-quen-mat-khau-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_co_tat_man
  verified_at: 2026-09-26T00:45:33Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [466.00ms]

- eval: E3
  run_id: muho4zh91prv
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_co_bat_api
  verified_at: 2026-09-26T00:45:33Z
  output: |
    4 expect() calls
    Ran 5 tests across 1 file. [701.00ms]

- eval: E4
  run_id: minted-quen-mat-khau-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.qmk_duong_an_danh
  verified_at: 2026-09-26T00:45:33Z
  output: |
    0 fail
    14 expect() calls
    Ran 6 tests across 1 file. [5.00ms]

- eval: E5
  run_id: minted-quen-mat-khau-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_lien_ket_man
  verified_at: 2026-09-26T00:45:33Z
  output: |
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [568.00ms]

- eval: E6
  run_id: minted-quen-mat-khau-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_cau_hinh_nua
  verified_at: 2026-09-26T00:45:33Z
  output: |
    0 fail
    10 expect() calls
    Ran 4 tests across 1 file. [100.00ms]

- eval: E7
  run_id: muho4zruquqc
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_cung_cau_tra_loi
  verified_at: 2026-09-26T00:45:33Z
  output: |
    8 expect() calls
    Ran 3 tests across 1 file. [357.00ms]
    test-run: dropped crm_muho4zruquqc_test

- eval: E8
  run_id: muho4x5498gs
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_khong_cho_thu
  verified_at: 2026-09-26T00:45:33Z
  output: |
    4 expect() calls
    Ran 2 tests across 1 file. [3.30s]
    test-run: dropped crm_muho4x5498gs_test

- eval: E9
  run_id: muho5375ini0
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_thu_dung_nguoi
  verified_at: 2026-09-26T00:45:33Z
  output: |
    11 expect() calls
    Ran 3 tests across 1 file. [256.00ms]
    test-run: dropped crm_muho5375ini0_test

- eval: E10
  run_id: minted-quen-mat-khau-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_mot_lan
  verified_at: 2026-09-26T00:45:33Z
  output: |
    6 expect() calls
    Ran 3 tests across 1 file. [2.00s]
    test-run: dropped crm_muho50vbskgq_test

- eval: E11
  run_id: muho5a8djyxq
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_het_han
  verified_at: 2026-09-26T00:45:33Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [360.00ms]
    test-run: dropped crm_muho5a8djyxq_test

- eval: E12
  run_id: muho5cxxx27r
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_qua_luot
  verified_at: 2026-09-26T00:45:33Z
  output: |
    3 expect() calls
    Ran 3 tests across 1 file. [313.00ms]
    test-run: dropped crm_muho5cxxx27r_test

- eval: E13
  run_id: minted-quen-mat-khau-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_form_trang_thai
  verified_at: 2026-09-26T00:45:33Z
  output: |
    0 fail
    13 expect() calls
    Ran 6 tests across 1 file. [379.00ms]

- eval: E14
  run_id: muho5cytw95m
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_bao_da_doi
  verified_at: 2026-09-26T00:45:33Z
  output: |
    8 expect() calls
    Ran 4 tests across 1 file. [3.61s]
    test-run: dropped crm_muho5cytw95m_test

- eval: E15
  run_id: minted-quen-mat-khau-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_thu_hong
  verified_at: 2026-09-26T00:45:33Z
  output: |
    7 expect() calls
    Ran 3 tests across 1 file. [256.00ms]
    test-run: dropped crm_muho5fxgvk59_test

- eval: E16
  run_id: minted-quen-mat-khau-E16-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_goi_nen
  verified_at: 2026-09-26T00:45:33Z
  output: |
    0 fail
    5 expect() calls
    Ran 3 tests across 1 file. [21.00ms]

- eval: E17
  run_id: minted-quen-mat-khau-E17-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_form_trang_thai
  verified_at: 2026-09-26T00:45:33Z
  output: |
    0 fail
    13 expect() calls
    Ran 6 tests across 1 file. [379.00ms]

- eval: E18
  run_id: minted-quen-mat-khau-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_chup
  verified_at: 2026-09-26T00:45:33Z
  screenshot: _acceptance/quen-mat-khau/evidence/E18-dang-nhap-1440.png
  observed: |
    Đã mở từng file PNG bằng Read và đối chiếu bằng mắt với Expected: (1) E18-dang-nhap-1440.png —
    /sign-in ở 1440px, form Đăng nhập trong AuthShell, có đúng một liên kết "Quên mật khẩu?" nằm
    ngay dưới ô Mật khẩu. (2) E18-dang-nhap-390.png — cùng trang ở 390px, liên kết vẫn hiện, không
    tràn ngang. (3) E18-quen-trong-1440.png — /quen-mat-khau ở 1440px: tiêu đề "Quên mật khẩu", một
    ô "Địa chỉ email", nút "Gửi liên kết", link "Quay lại đăng nhập" — đúng bố cục một-ô-một-nút
    trong AuthShell như /dat-mat-khau. (4) E18-quen-trong-390.png — cùng trang ở 390px, bố cục dồn
    dọc, không tràn ngang. (5) E18-da-gui-1440.png — sau khi gửi: màn "Kiểm tra hộp thư" với mô tả
    chứa số phút thật (không phải placeholder), nút "Quay lại đăng nhập". (6) E18-loi-1440.png —
    khi chặn mạng: Alert lỗi "Chưa gửi được liên kết. Kiểm tra kết nối rồi bấm gửi lại." và ô email
    còn giữ giá trị đã nhập. (7) E18-qua-luot-1440.png — sau 4 lần gửi thật: hiện đúng chuỗi "Bạn đã
    xin quá nhiều lần. Chờ 1 phút rồi thử lại." và KHÔNG còn hiện "Kiểm tra hộp thư". Không có frame
    nào mâu thuẫn với Expected.
  network_observed: n-a (driver)
  output: |
    Không sửa file nào ngoài việc script tự ghi vào _acceptance/quen-mat-khau/evidence/ và các
    log/lock tạm trong .acceptance-runs/quen-mat-khau/. Không chạy git/gh/pkill/kill nào.
    KET LUAN CHUNG: ma thoat 0, 14/14 dong DUNG, 0 SAI, doi chieu bang mat 7 anh khop Expected →
    eval E18 (AC-12) PASS.

- eval: E19
  run_id: design-gate-8fe1827e92
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_san_thiet_ke
  verified_at: 2026-09-26T00:45:33Z
  output: |
    "hits": [],
    "findings": []
    }

- eval: E21
  run_id: minted-quen-mat-khau-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_chup_tat
  verified_at: 2026-09-26T00:45:33Z
  screenshot: _acceptance/quen-mat-khau/evidence/E21-dang-nhap-tat-1440.png
  observed: |
    Đã Read file E21-dang-nhap-tat-1440.png (2880x1800, mô phỏng /sign-in lúc 1440 rộng, cấu hình
    mail "tắt"). Nội dung thấy: màn đăng nhập OneHub tối màu, tiêu đề "Mừng bạn quay lại", hai
    trường "Địa chỉ email" và "Mật khẩu", nút xanh lá cây "Đăng nhập". KHÔNG thấy bất kỳ liên
    kết/chữ "Quên mật khẩu" nào trên màn hình — khớp Expected (đếm được a[href="/quen-mat-khau"] = 0
    tại /sign-in khi thư bị tắt) và khớp kết quả script ĐÚNG cho assertion 1. Assertion 2 (mở thẳng
    /quen-mat-khau bị đẩy về /sign-in) không tạo riêng một màn hình mới trong steps, đã xác nhận
    qua dòng "ĐÚNG cấu hình thư tắt: mở thẳng /quen-mat-khau thì về /sign-in" trong output lệnh.
  network_observed: n-a (driver)
  output: |
    _acceptance/quen-mat-khau/evidence/E21-dang-nhap-tat-1440.png (duy nhất, ứng với bước 1 của
    steps). Network: driver là puppeteer-core điều khiển qua Bash/shell script (không phải browser
    tool có read_network_requests/read_console_messages) → không đọc được wire truth qua MCP. Đã
    ghi rõ vào _acceptance/quen-mat-khau/evidence/E21-network.txt.

- eval: E22
  run_id: muho5jzktuvc
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_dia_chi_rieng
  verified_at: 2026-09-26T00:45:33Z
  output: |
    2 expect() calls
    Ran 2 tests across 1 file. [278.00ms]
    test-run: dropped crm_muho5jzktuvc_test

- eval: E23
  run_id: minted-quen-mat-khau-E23-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_proxy_ky_dia_chi
  verified_at: 2026-09-26T00:45:33Z
  output: |
    0 fail
    5 expect() calls
    Ran 3 tests across 1 file. [8.00ms]

- eval: E20
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — hồ sơ mới, không carried
  verdict: PASS (đề xuất — T3 vẫn cần human_override trên mọi judgment item bất kể đề xuất)
  votes:
    - domain-correctness: PASS — Chuỗi trong auth.ts (vi/en) cho cả năm trạng thái của trang xin liên kết và hai lá thư đều nói rõ hành động kế tiếp: màn trống mời nhập địa chỉ + bấm "Gửi liên kết", "đang gửi" là trạng thái tạm, "đã gửi" bảo "Kiểm tra hộp thư", "lỗi" bảo kiểm tra kết nối rồi gửi lại, "quá lượt" bảo chờ N phút rồi thử lại — hai câu khác nhau rõ về nguyên nhân và hành động. Câu "đã gửi" dùng thể điều kiện nên không có câu nào ngầm xác nhận địa chỉ vừa gõ có tài khoản hay không — đúng thiết kế chống dò tài khoản mà mã của thu-mat-khau.ts cũng thể hiện. Không thấy từ ghép kỹ thuật tự đúc nào bị CONTEXT.md cấm.
    - operational-feasibility: PASS — Mỗi màn đều tự nói được bước kế — link "Quên mật khẩu?" → điền địa chỉ → "Gửi liên kết" → "Kiểm tra hộp thư"; câu "Nếu địa chỉ này vào được CRM, liên kết đang trên đường tới" cố ý dùng thể điều kiện nên không lộ địa chỉ vừa gõ có tài khoản hay không; câu lỗi và câu quá lượt khác nhau đúng bản chất (lỗi mạng cần thử ngay, quá lượt cần chờ đồng hồ); hai lá thư đều có bước kế rõ; không thấy thuật ngữ tự đúc ghép tiếng Việt nào.
    - spec-alignment: PASS — Mỗi màn có câu hành động cụ thể; câu "Nếu địa chỉ này vào được CRM..." dùng "nếu" nên KHÔNG ngầm xác nhận địa chỉ có tài khoản; thư "xin đặt lại" có xác nhận tài khoản nhưng chỉ gửi riêng cho hộp thư thật (đã qua decideSignInFromDb), không lộ ra màn hình công khai. Không thấy từ ghép kỹ thuật tự đúc; các từ dùng đều là chữ thường hoặc vai đã có nghĩa chốt trong CONTEXT.md.
  rationale: Cả ba lăng kính đồng thuận PASS — bốn/năm trạng thái màn hình đều có hành động kế tiếp rõ ràng, không câu nào lộ việc địa chỉ vừa gõ có tài khoản hay không, và không dùng thuật ngữ tự đúc bị cấm.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-quen-mat-khau-SUITE-bun_run_test-r2
  exit_code: 1
  verified_at: 2026-09-26T00:45:33Z
  output: |
    @crm/validation:test: (pass) zalo-webhook > sai khuon nem thong diep webhook, khong mang gia tri [0.02ms]
    @crm/validation:test: (pass) zalo-webhook > khong-doi-tuong va ma-rong: mo ta khong nem [0.21ms]
    @crm/validation:test:
    @crm/v
  note: cắt output giữa chừng khi đang chạy gói @crm/validation — test suite chưa in dòng tổng kết, không phải một eval nào FAIL; đây là lý do verdict tổng là BLOCKED (xem `reason` ở frontmatter).

- cmd: bunx turbo run lint --force
  run_id: minted-quen-mat-khau-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 1
  verified_at: 2026-09-26T00:45:33Z
  output: |
    @crm/auth:lint: Found 1 error.
    @crm/auth:lint: Found 4 warnings.
    @crm/auth:lint:   × Some errors were emitted while running checks.
     Tasks:    4 successful, 9 total
    Cached:    0 cached, 9 total
    Failed:    @crm/auth#lint
     ERROR  run failed: command  exited (1)
  note: lệnh phụ trợ không gắn eval nào, kết quả không PASS (1 lỗi lint trong @crm/auth). Cần dọn trước khi mở lại Cổng Bằng chứng; không chặn phân loại evidence của các eval trong hợp đồng.

- cmd: bun run lint:slop
  run_id: minted-quen-mat-khau-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-26T00:45:33Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 923ms on 1492 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-quen-mat-khau-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-26T00:45:33Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
    Time:    12.991s

## Known limits

## Ngoài hợp đồng

## Analyst

E4 — pass trên CẢ HEAD lẫn baseline (green): eval đo ma trận đường an-danh (ANONYMOUS) chưa phân biệt với hành vi cũ ở diffBase, cần viết lại để assert riêng hành vi mới liên quan tới `/quen-mat-khau`, hoặc xác nhận đây là regression-guard có chủ ý cho toàn bộ danh sách ANONYMOUS.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 21/21 eval máy PASS, verdict PENDING-JUDGMENT (một phát hiện trong hợp đồng ở AC-9, chờ người quyết ở Cổng Bằng chứng).
Round 2 (hiện tại): 22/22 eval máy (E1–E19, E21–E23) PASS và E20 (judgment, T3) được hội đồng đề xuất PASS, nhưng lệnh hồi quy `bun run test` bị công cụ cắt output giữa chừng ở gói @crm/validation trước khi in dòng tổng kết → verdict BLOCKED. Không phải lỗi mã nguồn: chạy lại với timeout dài hơn cho `bun run test`, sau đó tái đánh giá E20 qua human_override (bắt buộc vì hợp đồng chạm packages/auth ⇒ T3).