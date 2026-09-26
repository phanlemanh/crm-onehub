---
schema_version: 2
feature_slug: cua-vao-dang-nhap
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 05aa9d5bbc45bff102a1ac6b589029e8984702d2
human_signoff: 
---

# Evidence Report: cua-vao-dang-nhap

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

## Evidence

- eval: E1
  run_id: minted-cua-vao-dang-nhap-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_chi_sign_in
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    5 expect() calls
    Ran 5 tests across 1 file. [666.00ms]

- eval: E2
  run_id: minted-cua-vao-dang-nhap-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_shell_khong_khoi
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    22 expect() calls
    Ran 7 tests across 1 file. [323.00ms]

- eval: E3
  run_id: minted-cua-vao-dang-nhap-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_ba_buoc_google
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    9 expect() calls
    Ran 2 tests across 1 file. [656.00ms]

- eval: E4
  run_id: minted-cua-vao-dang-nhap-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_ma_tran_cua
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    3 expect() calls
    Ran 7 tests across 1 file. [662.00ms]

- eval: E5
  run_id: minted-cua-vao-dang-nhap-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cvdn_ma_loi_that
  verified_at: 2026-09-26T05:27:16Z
  output: |
    DUNG sso-co-mien: This_CRM_is_private._Sign_in_with_your_@onemount.com_account. -> chua-cho-phep
    DUNG sso-khong-mien: This_CRM_is_private._That_address_is_not_on_the_allow-list. -> chua-cho-phep
    KET LUAN 9 DUNG, 0 SAI — ma thoat 0

- eval: E6
  run_id: minted-cua-vao-dang-nhap-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    41 expect() calls
    Ran 13 tests across 1 file. [818.00ms]

- eval: E7
  run_id: minted-cua-vao-dang-nhap-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    41 expect() calls
    Ran 13 tests across 1 file. [818.00ms]

- eval: E8
  run_id: minted-cua-vao-dang-nhap-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    41 expect() calls
    Ran 13 tests across 1 file. [818.00ms]

- eval: E9
  run_id: minted-cua-vao-dang-nhap-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    41 expect() calls
    Ran 13 tests across 1 file. [818.00ms]

- eval: E10
  run_id: minted-cua-vao-dang-nhap-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_chu
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    498 expect() calls
    Ran 95 tests across 1 file. [728.00ms]

- eval: E11
  run_id: minted-cua-vao-dang-nhap-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:27:16Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E12
  run_id: minted-cua-vao-dang-nhap-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:27:16Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E13
  run_id: minted-cua-vao-dang-nhap-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:27:16Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E14
  run_id: crm_xenodochial_gould_763cda_do (phien-do dynamic session, app :4283 / api :4683)
  exit_code: 0
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:27:16Z
  screenshot: _acceptance/cua-vao-dang-nhap/evidence/cvdn-320-light.png
  observed: |
    Đã mở cả 8 file bằng Read (không suy từ log): cvdn-320-light.png và cvdn-320-dark.png — một cột: logo OneHub, tiêu đề "Đăng nhập vào CRM", mô tả, nút "Tiếp tục với Google", "hoặc", ô "Địa chỉ email", ô "Mật khẩu", nút "Đăng nhập" xanh lá, rồi mới tới khối "Lần đầu vào?" ba bước đánh số 1/2/3; không tràn ngang (ảnh đúng khổ 320). cvdn-768-light.png/dark.png — cùng thứ tự một cột, khổ 768, không tràn ngang. cvdn-1024-light.png/dark.png — hai cột: trái là nền xám phẳng (không vân nhiễu, không gradient đen — sáng #f0f0f0 phẳng, tối #1a1a1a phẳng khác hẳn nền đen thật) chứa logo, khối "Lần đầu vào?" ba bước, và dòng "CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR." (dòng này ở bản 1024 bị icon avatar tròn góc dưới trái che khuất chữ "CR" đầu dòng — chi tiết ngoài Expected, không phải điều kiện đạt/rớt của E14); phải là khung đăng nhập trắng/tối với đầy đủ form. cvdn-1440-light.png/dark.png — bố cục hai cột giống 1024 nhưng dòng "CRM của OneHub: …" hiển thị đầy đủ không bị che. Light: nền trắng/xám nhạt, chữ tối, đọc được. Dark: nền đen/xám đậm, chữ sáng, đọc được. Tất cả khớp Expected; không thiếu ảnh nào.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-cua-vao-dang-nhap-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cvdn_quen_mat_khau
  verified_at: 2026-09-26T05:27:16Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [745.00ms]

- eval: E16
  run_id: minted-cua-vao-dang-nhap-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cvdn_soi_ma
  verified_at: 2026-09-26T05:27:16Z
  output: |
    DUNG (b) apps/app/components/cua-vao/o-loi-dang-nhap.tsx dung Alert tu @crm/ui/components/alert
    DUNG (d) diff khong cham landing, proxy.ts, packages/auth
    KET LUAN 19 DUNG, 0 SAI — ma thoat 0

- eval: E17
  run_id: design-gate-bda95d92b2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cvdn_san_thiet_ke
  verified_at: 2026-09-26T05:27:16Z
  output: |
    "hits": [],
    "findings": []
    }

- eval: E18
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  votes:
    - domain-correctness: PASS — Toàn bộ cuaVaoMessages (cua-vao.ts) và các khoá liên quan tới cửa đăng nhập trong auth.ts (docTitle.signIn/quenMatKhau, signIn.*, quenMatKhau.*, datMatKhau.*) đọc như tiếng Việt tự nhiên, mạch lạc, không có câu dịch cứng hay sai ngữ pháp. Rà từng thuật ngữ dùng ("quản trị viên", "liên kết", "đăng nhập", "địa chỉ email"...) đối chiếu bảng _Avoid_ của CONTEXT.md: không từ nào trúng đúng nghĩa bị cấm — "liên kết" ở đây nghĩa là URL (không phải "liên kết tài khoản" của mục Nối Zalo), "quản trị viên" chỉ đúng vai quản trị workspace (không phải nghĩa cấm ở mục Trưởng đơn vị). Câu đưa dữ liệu người thật (địa chỉ email) dùng cụm "địa chỉ email" — đúng quyết định d-20260925T152541Z-3 đã đề xuất tạm dùng, và đã được chủ kho duyệt "không sửa" tại Cổng Phạm vi (decision d-20260925T202141Z-6, seal d-7) trong decisions.jsonl.
    - operational-feasibility: PASS — Toàn bộ chữ tiếng Việt trong cuaVaoMessages và các khoá auth.ts liên quan tới luồng đăng nhập/quên-đặt mật khẩu (signIn, quenMatKhau, datMatKhau) đọc tự nhiên, đúng văn phong sản phẩm, nhất quán với phần còn lại của file — không câu nào dùng từ khớp với bất kỳ mục _Avoid_ nào liệt kê trong CONTEXT.md. Câu chạm tới người thật qua địa chỉ email đã bỏ hẳn "email công ty", chỉ còn "địa chỉ email"; quyết định đổi chữ này (decisions.jsonl mục d-20260925T152541Z-3) đã có dòng trả lời tường minh của chủ kho tại mục d-20260925T202141Z-6 ("Chủ kho duyệt Cổng Phạm vi... viết «địa chỉ email» thay «email công ty»") và được khoá bằng seal gate 1 ở mục kế tiếp.
    - spec-alignment: PASS — Trong phạm vi trang đăng nhập (cuaVaoMessages toàn bộ, và các khoá auth.ts tương ứng: shell, docTitle.signIn/quenMatKhau, signIn.*, quenMatKhau.*, datMatKhau.*), chữ tiếng Việt đọc tự nhiên, đúng giọng người làm nghề, không thấy từ nào trùng nghĩa với mục _Avoid_ nào trong CONTEXT.md (ví dụ "quản trị viên" dùng đúng vai quản trị workspace theo mục Trưởng đơn vị, "được phép vào/chưa được cho phép vào" đúng mục Được phép vào, không có "lời mời", "liên hệ", "khách hàng"...). Câu duy nhất phơi ra danh tính thật là cụm "địa chỉ email" (thay cho "email công ty"), và quyết định này đã có dòng trả lời của chủ kho trong decisions.jsonl: d-20260925T152541Z-3 nêu vấn đề (serves AC-15) và d-20260925T202141Z-6/-7 ghi chủ kho duyệt Cổng Phạm vi giữ nguyên cách viết "địa chỉ email" đó, khớp với chữ hiện có trong cả hai file.
  human_override:        # T3 — mọi judgment item bắt buộc human_override dù panel đồng thuận PASS; chủ kho điền "<tên> <ngày>" tại Cổng Bằng chứng

- eval: E19
  run_id: minted-cua-vao-dang-nhap-E19-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:27:16Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E20
  run_id: minted-cua-vao-dang-nhap-E20-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cvdn_thuoc_da_ky
  verified_at: 2026-09-26T05:27:16Z
  output: |
    DUNG vao-bang-email-va-mat-khau/E17: base 0 -> head 0
    DUNG vao-bang-email-va-mat-khau/E15: base 0 -> head 0
    KET LUAN 13 DUNG, 0 SAI — ma thoat 0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muhy7s6vqyqv
  exit_code: 0
  verified_at: 2026-09-26T05:27:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-cua-vao-dang-nhap-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-26T05:27:16Z

- cmd: bun run lint:slop
  run_id: minted-cua-vao-dang-nhap-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-26T05:27:16Z

- cmd: bunx turbo run build --force
  run_id: minted-cua-vao-dang-nhap-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-26T05:27:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào khai runs > 1 trong vòng này (mọi eval đều deterministic, pass_rate không áp dụng).

## Iterations

Round 1: cả 20 eval máy đều PASS (exit 0, không hồi quy nào so với merge-base qua thuoc-da-ky) và panel judgment E18 đồng thuận 3/3 PASS, nhưng review-findings vòng này rơi ra 2/11 lỗi ngoài-hợp-đồng nằm ở file không bộ đo nào của hợp đồng phủ tới (packages/ui/src/components/step-list.tsx, apps/app/test/cua-vao-ham.spec.ts) — verdict tổng REJECT, dừng ở đây chờ người quyết mở rộng hợp đồng hay rút phạm vi trước khi cho qua Cổng Bằng chứng.