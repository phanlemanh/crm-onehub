---
schema_version: 2
feature_slug: cua-vao-dang-nhap
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d1c095cfd8eea3ae74f60509bca1cf364a0884d1
human_signoff: 
---

# Evidence Report: cua-vao-dang-nhap

Lệnh suite `bunx turbo run lint --force` thất bại (exit 1, `app#lint` qua biome) và không gắn với eval AC nào trong hợp đồng — đây là lý do duy nhất verdict tổng của round 2 là REJECT, dù toàn bộ 20 eval E1–E20 (17 eval máy + E14 ui-check + E18 judgment) đều đạt ở lượt đo này. Xem khối SUITE bên dưới cho chi tiết lệnh hỏng; nguyên nhân gốc (hai vi phạm biome a11y trong fixture test mới thêm ở vòng này) được ghi ở review-findings.md, mục "Ngoài hợp đồng" (finding t1), vì không AC nào trong hợp đồng đòi `bun run lint` phải sạch.

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
| E18 | AC-15 | judgment | UNCERTAIN |
| E19 | AC-7 | script | PASS |
| E20 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cua-vao-dang-nhap-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_chi_sign_in
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    5 expect() calls
    Ran 5 tests across 1 file. [583.00ms]

- eval: E2
  run_id: minted-cua-vao-dang-nhap-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_shell_khong_khoi
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    22 expect() calls
    Ran 7 tests across 1 file. [358.00ms]

- eval: E3
  run_id: minted-cua-vao-dang-nhap-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_ba_buoc_google
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    6 expect() calls
    Ran 2 tests across 1 file. [688.00ms]

- eval: E4
  run_id: minted-cua-vao-dang-nhap-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_ma_tran_cua
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    3 expect() calls
    Ran 7 tests across 1 file. [703.00ms]

- eval: E5
  run_id: minted-cua-vao-dang-nhap-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_ma_loi_that
  verified_at: 2026-09-26T05:51:48Z
  output: |
    DUNG sso-co-mien: This_CRM_is_private._Sign_in_with_your_@onemount.com_account. -> chua-cho-phep
    DUNG sso-khong-mien: This_CRM_is_private._That_address_is_not_on_the_allow-list. -> chua-cho-phep
    KET LUAN 9 DUNG, 0 SAI — ma thoat 0

- eval: E6
  run_id: minted-cua-vao-dang-nhap-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    45 expect() calls
    Ran 15 tests across 1 file. [739.00ms]

- eval: E7
  run_id: minted-cua-vao-dang-nhap-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    45 expect() calls
    Ran 15 tests across 1 file. [739.00ms]

- eval: E8
  run_id: minted-cua-vao-dang-nhap-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    45 expect() calls
    Ran 15 tests across 1 file. [739.00ms]

- eval: E9
  run_id: minted-cua-vao-dang-nhap-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_o_loi
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    45 expect() calls
    Ran 15 tests across 1 file. [739.00ms]

- eval: E10
  run_id: minted-cua-vao-dang-nhap-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_chu
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    498 expect() calls
    Ran 95 tests across 1 file. [587.00ms]

- eval: E11
  run_id: minted-cua-vao-dang-nhap-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:51:48Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E12
  run_id: minted-cua-vao-dang-nhap-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:51:48Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E13
  run_id: minted-cua-vao-dang-nhap-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:51:48Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E14
  run_id: phien-do crm_xenodochial_gould_763cda_do app:4872 api:4772
  exit_code: 0
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:51:48Z
  screenshot: _acceptance/cua-vao-dang-nhap/evidence/cvdn-320-light.png
  observed: |
    cvdn-320-light.png: 1 cot, tren xuong: logo OneHub -> "Đăng nhập vào CRM" -> phu de -> nut "Tiếp tục với Google" -> "hoặc" -> o "Địa chỉ email" -> o "Mật khẩu" -> nut xanh la "Đăng nhập" -> avatar "N" + avatar workspace -> roi moi toi khoi xam "Lần đầu vào?" voi 3 buoc danh so 1/2/3 va dong "CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR." o duoi cung. Nen trang, chu den/xam toi — doc ro. Khong thay tran ngang.

    cvdn-320-dark.png: bo cuc y het ban light, doi mau: nen den tuyet doi, chu trang/xam sang, o nhap vien xam toi, nut Google nen toi vien xam — doc ro.

    cvdn-768-light.png: van 1 cot nhu 320 nhung rong hon va can giua trong khung 768px, thu tu cac khoi giu nguyen dung yeu cau, khong tran ngang, nen trang chu toi.

    cvdn-768-dark.png: giong 768-light ve bo cuc, nen den chu sang, doc ro.

    cvdn-1024-light.png: 2 cot ro rang. Cot trai: nen xam phang dong nhat (khong thay van nhieu/gradient), logo OneHub o tren, roi khoi trang "Lần đầu vào?" voi 3 buoc, duoi cung la dong "CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR." nhung 2 ky tu dau "CR" bi mot huy hieu tron den "N" de len (con doc duoc tu "M của OneHub" tro di). Cot phai: nen trang, khung dang nhap day du (logo, tieu de, Google, hoac, 2 o nhap, nut Đăng nhập). Ranh gioi 2 cot ro, khong tran ngang.

    cvdn-1024-dark.png: bo cuc giong 1024-light, nen cot trai xam toi dong nhat (khong noise), cot phai nen den; cung bi huy hieu "N" de len dau dong "CRM của OneHub" y het ban light. Chu sang, doc duoc phan con lai.

    cvdn-1440-light.png: 2 cot, cot trai rong hon (canh trai) nen xam phang, day du logo + 3 buoc "Lần đầu vào?" + dong "CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR." hien thi TRON VEN (khong bi huy hieu N de len o do rong nay). Cot phai nen trang la khung dang nhap day du. Khong tran ngang.

    cvdn-1440-dark.png: giong 1440-light ve bo cuc, nen den/xam toi + chu sang, dong "CRM của OneHub" hien du, doc ro ca hai cot.

    Tat ca 8/8 anh bat buoc dung mo ta Expected ve so cot, thu tu khoi, mau nen/chu theo theme, va khong tran ngang; sai lech duy nhat la huy hieu dev-mode "N" de len 2 ky tu dau dong CRM o rieng 1024 (ca light/dark), duoc danh gia la nhieu cua Next.js dev-server chu khong phai loi component duoc do.

    CHU Y phat hien khi doi chieu bang mat (khong co trong 45 dong DUNG cua script vi script khong kiem overlap voi dev-badge): o ca 1024-light va 1024-dark, huy hieu tron "N" (Next.js dev indicator, goc duoi-trai, mac dinh khi chay `next dev`, KHONG xuat hien o production build va KHONG thuoc bat ky file nao trong paths cua eval nay) de len chu dau dong "CRM cua OneHub: ...", lam doc thanh "M cua OneHub: doi tac, ke hoach 30 ngay va OKR." — da zoom 3x xac nhan bang PIL crop. O 320/768/1440 huy hieu nay khong de len chu nao. Day la nhieu cua moi truong dev-tooling, khong phai loi cua auth-shell.tsx/cua-vao/**, va khong bi cam trong Expected — nen KHONG tinh la dong SAI cho AC-11. Tat ca 8 anh bat buoc deu co mat -> dieu kien "Thieu anh nao -> khong dat" khong vi pham.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-cua-vao-dang-nhap-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvdn_quen_mat_khau
  verified_at: 2026-09-26T05:51:48Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [670.00ms]

- eval: E16
  run_id: minted-cua-vao-dang-nhap-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_soi_ma
  verified_at: 2026-09-26T05:51:48Z
  output: |
    DUNG (b) apps/app/components/cua-vao/o-loi-dang-nhap.tsx dung Alert tu @crm/ui/components/alert
    DUNG (d) diff khong cham landing, proxy.ts, packages/auth
    KET LUAN 19 DUNG, 0 SAI — ma thoat 0

- eval: E17
  run_id: design-gate-fe6c2a09d4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_san_thiet_ke
  verified_at: 2026-09-26T05:51:48Z
  output: |
    "hits": [],
    "findings": []

- eval: E18
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — đề xuất PASS
  verdict: UNCERTAIN
  votes:
    - domain-correctness: PASS — Trong phạm vi trang đăng nhập, câu chữ đọc tự nhiên như tiếng Việt của người làm nghề, không thấy từ nào trùng đúng nghĩa mục _Avoid của CONTEXT.md; câu "địa chỉ email" thay "email công ty" đã có dòng trả lời chủ kho (d-20260925T152541Z-3 và d-20260925T202141Z-6).
    - operational-feasibility: PASS — cuaVaoMessages và các khoá signIn/quenMatKhau/datMatKhau của auth.ts đọc đúng giọng sản phẩm, không trùng mục _Avoid_ nào; thay đổi "địa chỉ email" đã được chủ kho chốt trong decisions.jsonl.
    - spec-alignment: UNCERTAIN — chữ nghĩa cuaVaoMessages đạt, nhưng không có căn cứ (BLIND, không có diff) để biết hai khoá onboarding.moTa/research.description (dùng chữ "tác nhân") có nằm trong phạm vi sửa của chính tính năng này hay là chữ có sẵn từ trước — nếu thuộc phạm vi sửa thì phạm đúng ranh giới "Tác nhân" vs "Trợ lý AI" mà CONTEXT.md cố ý phân biệt.
  rationale: Hai trong ba lens chấm PASS trên toàn bộ chữ mới/đổi của cuaVaoMessages và các khoá đăng nhập của auth.ts, viện dẫn quyết định đã chốt của chủ kho cho cụm "địa chỉ email". Lens thứ ba (spec-alignment) không có bằng chứng diff để loại trừ khả năng hai khoá onboarding.moTa/research.description nằm trong phạm vi sửa của vòng này và phạm đúng ranh giới "Tác nhân"/"Trợ lý AI" của CONTEXT.md.
  required_evidence:
    - Xác nhận phạm vi diff: chạy git diff (hoặc git log -p) trên nhánh của tính năng cua-vao-dang-nhap giới hạn ở apps/app/lib/messages/auth.ts — nếu hai khoá onboarding.moTa và research.description (bản vi, dùng chữ "tác nhân") nằm trong các dòng đã sửa bởi tính năng này thì đây là phạm nghĩa đã chốt ở CONTEXT.md — verdict khi đó đổi thành FAIL.
    - Nếu git diff cho thấy hai khoá đó KHÔNG đổi trong tính năng này (chữ có từ trước, không thuộc phạm vi AC-15) thì không còn phát hiện Avoid-list nào trong cuaVaoMessages hay các khoá auth.ts thực sự đổi — verdict khi đó đổi thành PASS.
  human_override:  # chi nguoi ghi

- eval: E19
  run_id: minted-cua-vao-dang-nhap-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_do_cua_vao
  verified_at: 2026-09-26T05:51:48Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E20
  run_id: minted-cua-vao-dang-nhap-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvdn_thuoc_da_ky
  verified_at: 2026-09-26T05:51:48Z
  output: |
    DUNG vao-bang-email-va-mat-khau/E17: base 0 -> head 0
    DUNG vao-bang-email-va-mat-khau/E15: base 0 -> head 0
    KET LUAN 13 DUNG, 0 SAI — ma thoat 0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muhz74gop5dl
  exit_code: 0
  verified_at: 2026-09-26T05:51:48Z

- cmd: bunx turbo run lint --force
  run_id: minted-cua-vao-dang-nhap-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 1
  verified_at: 2026-09-26T05:51:48Z
  output: |
    app#lint:  ERROR  command (/Users/manh-macmini/dev/crm/.claude/worktrees/xenodochial-gould-763cda/apps/app) /opt/homebrew/bin/bun run lint exited (1)
     Tasks:    8 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    438ms
    Failed:    app#lint
     ERROR  run failed: command  exited (1)

- cmd: bun run lint:slop
  run_id: minted-cua-vao-dang-nhap-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-26T05:51:48Z

- cmd: bunx turbo run build --force
  run_id: minted-cua-vao-dang-nhap-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-26T05:51:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (moi eval o round 2 mang baseline: n-a). Khong co danh sach eval khong-phan-biet moi tinh duoc trong round nay; xem hồ sơ round 1 nếu cần đối chiếu baseline gốc.

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) ở round này; không có mixed pass_rate.

## Iterations

Round 1: 6 phát hiện thước trong hợp đồng bị REJECT (bàn đo Tab không đi hết khối, E19 dùng câu hook giả thay câu thật, thuoc-da-ky xanh rỗng — t3/t5/t7/t10) — đã sửa ở commit 6212fc09 (bàn đo Tab đi hết khối, E19 dùng câu hook thật, thuoc-da-ky không xanh rỗng) và commit 096affd3 (test đăng nhập đo quan hệ và đầu ra thật). Trả lại implementation.
Round 2: toàn bộ 20 eval (E1–E20) đạt trên máy đo — E18 (judgment) có 1/3 lens UNCERTAIN chờ human_override, không tự nâng verdict. Verdict tổng vẫn REJECT vì lệnh suite `bunx turbo run lint --force` (app#lint, 2 lỗi biome a11y — noNoninteractiveTabindex và noAutofocus — mới xuất hiện trong apps/app/test/cua-vao-sign-in.dom.tsx) thất bại; lệnh này không gắn AC nào nên không vào failed_evals, nhưng CLAUDE.md liệt `bun run lint` là 1 trong 5 lệnh chứng minh bắt buộc của kho.
