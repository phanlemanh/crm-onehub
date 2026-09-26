---
schema_version: 2
feature_slug: quen-mat-khau
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f435c4e456a189b811023fd9c3efda93f007f9eb
human_signoff:
---

# Evidence Report: quen-mat-khau

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
| E17 | AC-12 | test | PASS |
| E18 | AC-12 | ui-check | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-13 | judgment | PASS — chờ human_override (T3) |
| E21 | AC-1 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: muhn0jnblrlx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_co_tat_api
  verified_at: 2026-09-26T00:13:52Z
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [976.00ms]
    test-run: dropped crm_muhn0jnblrlx_test

- eval: E2
  run_id: minted-quen-mat-khau-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_co_tat_man
  verified_at: 2026-09-26T00:13:52Z
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [434.00ms]

- eval: E3
  run_id: muhn0jsg1k0u
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_co_bat_api
  verified_at: 2026-09-26T00:13:52Z
  output: |
     4 expect() calls
    Ran 5 tests across 1 file. [631.00ms]
    test-run: dropped crm_muhn0jsg1k0u_test

- eval: E4
  run_id: minted-quen-mat-khau-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.qmk_duong_an_danh
  verified_at: 2026-09-26T00:13:52Z
  output: |
     0 fail
     14 expect() calls
    Ran 6 tests across 1 file. [6.00ms]

- eval: E5
  run_id: minted-quen-mat-khau-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_lien_ket_man
  verified_at: 2026-09-26T00:13:52Z
  output: |
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [711.00ms]

- eval: E6
  run_id: minted-quen-mat-khau-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_cau_hinh_nua
  verified_at: 2026-09-26T00:13:52Z
  output: |
     0 fail
     10 expect() calls
    Ran 4 tests across 1 file. [112.00ms]

- eval: E7
  run_id: muhn0jzmdeo2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_cung_cau_tra_loi
  verified_at: 2026-09-26T00:13:52Z
  output: |
     8 expect() calls
    Ran 3 tests across 1 file. [386.00ms]
    test-run: dropped crm_muhn0jzmdeo2_test

- eval: E8
  run_id: muhn0jjk49ej
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_khong_cho_thu
  verified_at: 2026-09-26T00:13:52Z
  output: |
     4 expect() calls
    Ran 2 tests across 1 file. [3.49s]
    test-run: dropped crm_muhn0jjk49ej_test

- eval: E9
  run_id: muhn0k5tept4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_thu_dung_nguoi
  verified_at: 2026-09-26T00:13:52Z
  output: |
     11 expect() calls
    Ran 3 tests across 1 file. [368.00ms]
    test-run: dropped crm_muhn0k5tept4_test

- eval: E10
  run_id: muhn0k2udbv0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_mot_lan
  verified_at: 2026-09-26T00:13:52Z
  output: |
     6 expect() calls
    Ran 3 tests across 1 file. [2.08s]
    test-run: dropped crm_muhn0k2udbv0_test

- eval: E11
  run_id: muhn0tjzw3nh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_het_han
  verified_at: 2026-09-26T00:13:52Z
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [362.00ms]
    test-run: dropped crm_muhn0tjzw3nh_test

- eval: E12
  run_id: muhn0trqcyaj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_qua_luot
  verified_at: 2026-09-26T00:13:52Z
  output: |
     3 expect() calls
    Ran 3 tests across 1 file. [389.00ms]
    test-run: dropped crm_muhn0trqcyaj_test

- eval: E13
  run_id: minted-quen-mat-khau-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_form_trang_thai
  verified_at: 2026-09-26T00:13:52Z
  output: |
     0 fail
     13 expect() calls
    Ran 6 tests across 1 file. [428.00ms]

- eval: E14
  run_id: muhn0uttmat5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_bao_da_doi
  verified_at: 2026-09-26T00:13:52Z
  output: |
     8 expect() calls
    Ran 4 tests across 1 file. [3.73s]
    test-run: dropped crm_muhn0uttmat5_test

- eval: E15
  run_id: muhn0xr7e0hb
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_thu_hong
  verified_at: 2026-09-26T00:13:52Z
  output: |
     7 expect() calls
    Ran 3 tests across 1 file. [279.00ms]
    test-run: dropped crm_muhn0xr7e0hb_test

- eval: E16
  run_id: minted-quen-mat-khau-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_goi_nen
  verified_at: 2026-09-26T00:13:52Z
  output: |
     0 fail
     5 expect() calls
    Ran 3 tests across 1 file. [17.00ms]

- eval: E17
  run_id: minted-quen-mat-khau-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_form_trang_thai
  verified_at: 2026-09-26T00:13:52Z
  output: |
     0 fail
     13 expect() calls
    Ran 6 tests across 1 file. [428.00ms]

- eval: E18
  run_id: minted-quen-mat-khau-E18-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_chup
  verified_at: 2026-09-26T00:13:52Z
  screenshot: _acceptance/quen-mat-khau/evidence/E18-dang-nhap-1440.png
  observed: |
    Đã mở từng file frame vừa lưu bằng Read (ảnh, đọc trực tiếp) và đối chiếu Expected:
    1) E18-dang-nhap-1440.png — /sign-in ở 1440: có đúng 1 liên kết "Quên mật khẩu?" nằm ngay dưới ô "Mật khẩu", trên nút "Đăng nhập". Không tràn ngang. Khớp Expected.
    2) E18-dang-nhap-390.png — /sign-in ở 390: cùng bố cục, liên kết "Quên mật khẩu?" vẫn ở đúng vị trí, không tràn ngang (không có scrollbar ngang, nội dung gọn trong viewport). Khớp Expected.
    3) E18-quen-trong-1440.png — bấm liên kết dẫn tới /quen-mat-khau, không bị đẩy về /sign-in; form một ô email + một nút "Gửi liên kết" nằm trong AuthShell (cùng khung tối, logo OneHub, panel bên phải) giống /đặt-mật-khẩu. Có nút "Quay lại đăng nhập". Khớp Expected.
    4) E18-quen-trong-390.png — cùng nội dung ở 390, không tràn ngang. Khớp Expected.
    5) E18-da-gui-1440.png — sau khi gửi form, hiện đúng màn "Kiểm tra hộp thư" với số phút thật ("còn hạn 60 phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên."). Khớp Expected.
    6) E18-loi-1440.png — khi chặn mạng (abort request tới request-password-reset), hiện Alert lỗi "Chưa gửi được liên kết. Kiểm tra kết nối rồi bấm gửi lại." và ô email vẫn còn giá trị đã nhập (chup-loi-…@example.test). Khớp Expected.
    7) E18-qua-luot-1440.png — lần gửi thứ tư tới máy chủ thật (sau khi đã xoá bộ đếm rate-limit trước lượt), hiện đúng chuỗi quá lượt "Bạn đã xin quá nhiều lần. Chờ 1 phút rồi thử lại." (từ messages/auth.ts) và KHÔNG hiện "Kiểm tra hộp thư". Ô email vẫn còn giá trị (chup-luot-cuoi-…@example.test). Khớp Expected.
    Không có mâu thuẫn nào giữa nội dung frame và Expected → không có assertion nào FAIL.
  network_observed: n-a (driver)

- eval: E19
  run_id: design-gate-78697a6cce
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qmk_san_thiet_ke
  verified_at: 2026-09-26T00:13:52Z
  output: |
      "hits": [],
      "findings": []
    }

- eval: E20
  judged_by: judge panel (fresh context) — 3 lens, đề xuất PASS; T3 nên MỌI judgment item đều cần human_override dù panel đề xuất gì
  verdict: PASS
  rationale: |
    Panel 3 lens (domain-correctness, operational-feasibility, spec-alignment) đều đề xuất PASS cho AC-13 (chất lượng câu chữ ở các trạng thái màn "quên mật khẩu" và hai lá thư). Xem từng phiếu bên dưới.
  votes:
    - domain-correctness: PASS — Ở mọi trong 5 trạng thái của trang xin liên kết và ở liên kết màn đăng nhập, câu chữ đều nói rõ việc tiếp theo (gõ email rồi bấm gửi; chờ khi đang gửi; "Kiểm tra hộp thư" khi đã gửi; kiểm tra mạng rồi gửi lại khi lỗi; chờ N phút rồi thử lại khi quá lượt) — hai câu lỗi mạng và quá lượt khác nhau rõ, mỗi câu có hành động cụ thể riêng. Câu "đã gửi" dùng thể điều kiện ("Nếu địa chỉ này vào được CRM, liên kết đang trên đường tới") nên KHÔNG ngầm xác nhận địa chỉ vừa gõ có tài khoản — đúng chuẩn chống dò tài khoản qua giao diện web; hai lá thư (chỉ gửi khi tài khoản có thật, theo guiThuXinDatLai) nói "tài khoản này" hợp lý vì việc nhận được thư đã tự xác nhận, và mỗi thư có hành động khác nhau đúng mức độ nghiêm trọng (bỏ qua thư vs báo quản trị viên ngay). Không thấy từ kỹ thuật tự đúc ghép nào bị CONTEXT.md cấm trong toàn bộ chuỗi đã đọc.
    - operational-feasibility: PASS — Ở mỗi màn (trống → "Nhập địa chỉ email... Gửi liên kết"; đang gửi → "Đang gửi…"; đã gửi → "Kiểm tra hộp thư"; lỗi → "Chưa gửi được liên kết. Kiểm tra kết nối rồi bấm gửi lại."; quá lượt → "Bạn đã xin quá nhiều lần. Chờ N phút rồi thử lại.") câu chữ đều tự nói được bước kế tiếp mà không cần ai giải thích thêm, và câu quá-lượt khác hẳn câu lỗi mạng nên không lẫn hai tình huống. Màn "đã gửi" cố ý dùng điều kiện "Nếu địa chỉ này vào được CRM, liên kết đang trên đường tới" — không câu nào (kể cả hai lá thư trong thu-mat-khau.ts) khẳng định địa chỉ vừa gõ có tài khoản, đúng thiết kế chống dò tài khoản. Không thấy từ ghép kỹ thuật tự đúc nào bị CONTEXT.md cấm; các chữ dùng ("liên kết", "mật khẩu", "địa chỉ email") đều là từ thường, không phải thuật ngữ sản phẩm bị khoá nghĩa khác trong từ điển.
    - spec-alignment: PASS — Cả ba màn đều nói rõ việc kế tiếp: màn xin liên kết có mô tả trạng thái trống nói "nhập email rồi hệ thống gửi liên kết", đang gửi có "Đang gửi…", đã gửi có tiêu đề "Kiểm tra hộp thư" + mô tả, lỗi có "Kiểm tra kết nối rồi bấm gửi lại" (chỉ rõ cách thử lại), quá lượt có "Chờ N phút rồi thử lại" — khác hẳn câu lỗi (một cái hướng dẫn kiểm mạng, một cái hướng dẫn chờ thời gian). Câu ở trạng thái "đã gửi" dùng thể điều kiện "Nếu địa chỉ này vào được CRM, liên kết đang trên đường tới" nên KHÔNG ngầm xác nhận địa chỉ có tài khoản — đúng kỹ thuật chống dò tài khoản. Hai lá thư (xin đặt lại, báo đã đổi) đều có hành động kế tiếp rõ ràng (mở liên kết / báo quản trị nếu không phải mình). Không thấy từ ghép kỹ thuật tự đúc nào trái luật nhân của CONTEXT.md trong ba tệp được cấp phạm vi.
  human_override:        # T3: bắt buộc người tự kiểm trước khi nâng PASS, dù panel đề xuất PASS cho cả 3 lens

- eval: E21
  run_id: minted-quen-mat-khau-E21-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_chup_tat
  verified_at: 2026-09-26T00:13:52Z
  screenshot: _acceptance/quen-mat-khau/evidence/E21-dang-nhap-tat-1440.png
  observed: |
    Đã Read trực tiếp file _acceptance/quen-mat-khau/evidence/E21-dang-nhap-tat-1440.png (ảnh PNG 2880x1800, hiển thị 2000x1250): trang /sign-in nền tối, logo OneHub, tiêu đề "Mừng bạn quay lại", ô "Địa chỉ email", ô "Mật khẩu", nút "Đăng nhập" màu xanh lá — KHÔNG có bất kỳ liên kết/chữ "quên mật khẩu" hay link nào dưới ô mật khẩu hoặc nút đăng nhập. Khớp đúng Expected: ở /sign-in số phần tử a[href="/quen-mat-khau"] = 0 khi api tắt hai biến RESEND_API_KEY/MAIL_FROM.
    Dòng script (không có ảnh riêng nhưng có assertion máy-kiểm-được trong outputTail): mở thẳng /quen-mat-khau thì URL cuối là /sign-in — kiểm bằng duongCuoi(p2) === DUONG_VAO trong chup.mjs, và dòng "DUNG cau hinh thu tat: mo thang /quen-mat-khau thi ve /sign-in" xác nhận khớp Expected (redirect về /sign-in).
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muhn0jja2ibx
  exit_code: 0
  verified_at: 2026-09-26T00:13:52Z
  output: |
      Time:    1m42.26s

    test-run: dropped crm_muhn0jja2ibx_test

- cmd: bunx turbo run lint --force
  run_id: minted-quen-mat-khau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-26T00:13:52Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    429ms

- cmd: bun run lint:slop
  run_id: minted-quen-mat-khau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-26T00:13:52Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 731ms on 1488 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-quen-mat-khau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-26T00:13:52Z
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    10.238s

## Known limits

## Ngoài hợp đồng

## Analyst

E4 — pass trên cả HEAD lẫn baseline (`cd apps/app && bun test ./test/proxy-an-danh.spec.ts`; ma trận đường ẩn danh cố định `["/dat-mat-khau", "/proto", "/quen-mat-khau", "/t"]` không phụ thuộc code mới của quen-mat-khau) — cần xem lại: viết lại để assert riêng phần hành vi mới do tính năng này thêm vào (đường `/quen-mat-khau` trong danh sách ẩn danh), hoặc xác nhận đây là regression-guard có chủ ý và giữ nguyên.

## Variance

none — every multi-run eval is uniform (không eval nào khai `runs` > 1 trong vòng này).

## Iterations

Round 1: toàn bộ 20 eval máy/ui-check (E1–E19, E21) đều PASS, không có sai lệch giữa các lần chạy; bốn lệnh suite hồi quy (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) cũng xanh. E20 (judgment, AC-13, T3) được panel 3-lens đề xuất PASS nhưng luật T3 đòi mọi judgment item phải có `human_override` bất kể phiếu của panel — verdict tổng round này giữ PENDING-JUDGMENT, chờ người ký ở Cổng Bằng chứng.