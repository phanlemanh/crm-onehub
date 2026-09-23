---
schema_version: 2
feature_slug: kiem-auth-khong-phu-thuoc-thu-tu
verdict: REJECT
failed_evals: [E11]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8c4107b24b1eb7f971c1fc1716cef373275c7084
human_signoff:
---

# Evidence Report: kiem-auth-khong-phu-thuoc-thu-tu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | script | PASS |
| E11 | AC-8 | script | FAIL |
| E12 | AC-7 | judgment | PASS (đề xuất, chờ human_override — T3) |

## Evidence

- eval: E1
  run_id: mudpi4wf49g7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kat_cap
  verified_at: 2026-09-23T06:00:00Z
  output: |
    kat cap: 8/8 o dung — ban sua xanh ca bon cap, ban goc do ca bon cap
    test-run: dropped crm_mudpi4wf49g7_test

- eval: E2
  run_id: mudpi5v5a5fx
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kat_tra_env
  verified_at: 2026-09-23T06:00:00Z
  output: |
    sua tu-choi-khong-de-lai-hang.integration.spec.ts: giu
    kat tra-env: ban goc ro dung 4 tep, ban sua ro 0 tep, toan goi ENV-GIU example.com
    test-run: dropped crm_mudpi5v5a5fx_test

- eval: E3
  run_id: mudpi58ymxow
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kat_seed
  verified_at: 2026-09-23T06:00:00Z
  output: |
    seed 3: ban sua 2 xanh/0 do/0 bo · ban goc 2 do
    kat seed: seed 1, 3 — ban sua xanh hai ca, ban goc do hai ca
    test-run: dropped crm_mudpi58ymxow_test

- eval: E4
  run_id: mudpi4mvecwl
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kat_tu_nhien
  verified_at: 2026-09-23T06:00:00Z
  output: |
    ca moi: test/hd-cua-google.spec.ts::::hd cua google theo danh sach "onemount.com,partner.com"
    kat tu-nhien: bun test thoat 0, 0 do, khong mat ca nao cua ban goc, tong ca khop ban goc + ca moi, khong them ca bo qua
    test-run: dropped crm_mudpi4mvecwl_test

- eval: E5
  run_id: minted-kiem-auth-khong-phu-thuoc-thu-tu-E5-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-23T06:00:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    8.697s

- eval: E6
  run_id: minted-kiem-auth-khong-phu-thuoc-thu-tu-E6-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-23T06:00:00Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    425ms

- eval: E7
  run_id: minted-kiem-auth-khong-phu-thuoc-thu-tu-E7-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-23T06:00:00Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 772ms on 1177 files with 9 rules using 14 threads.

- eval: E8
  run_id: mudpi6d0cgfn
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api_khong_cache_tru_agent
  verified_at: 2026-09-23T06:00:00Z
  output: |
    Cached:    0 cached, 10 total
      Time:    41.062s
    test-run: dropped crm_mudpi6d0cgfn_test

- eval: E9
  run_id: minted-kiem-auth-khong-phu-thuoc-thu-tu-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-23T06:00:00Z
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    12.104s

- eval: E10
  run_id: minted-kiem-auth-khong-phu-thuoc-thu-tu-E10-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kat_pham_vi
  verified_at: 2026-09-23T06:00:00Z
  output: |
    thu-tu-tep --chan pham-vi · goc b812b65a
    diff b812b65a..HEAD: 27 tep, ngoai packages/auth/test va T1: 0
    kat pham-vi: mau goi ten dung auth.ts, diff that khong lot tep san pham

- eval: E11
  run_id: mudpi4snqloc
  exit_code: 1
  baseline: red
  verifier: config:executors.script.kat_hd_noi
  verified_at: 2026-09-23T06:00:00Z
  output: |
    doi chung ban sao khong dot bien: xanh — ban sao nap auth, ca hd-cua-google va ca hd lech deu xanh
    M2 bo hd: bi bat — (fail) hd cua google theo danh sach "onemount.com" · (fail) cua-google-con-song > cua google tu choi token co hd lech voi hd da khoa, du nguoi trong danh sach
    RANG CUN: M1 hd ngoai danh sach — ban sao khong nap duoc auth, do vi loi nap chu khong vi dot bien
    test-run: dropped crm_mudpi4snqloc_test
    error: script "test" exited with code 1

- eval: E12
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS (đề xuất máy — T3, human_override bắt buộc trước khi tính chung)
  rationale: Cả ba lens đồng ý ca "cua-google-con-song" chỉ dùng fallback hd = auth.options...hd ở nhánh dương (đăng nhập thành công, không đo hd), còn ca từ chối hd lệch tự đặt hd sai và lấy hd đúng độc lập qua googleHostedDomain() nên không phải hằng đúng; hd-cua-google.spec.ts (AC-8) đo riêng và độc lập chỗ nối hd của auth.ts, bù đúng khoảng trống mà AC-7 nêu ra.
  votes:
    - domain-correctness: PASS — Trong "cua-google-con-song", ca chap nhan dung fallback hd = auth.options...hd chi cho tinh huong khong lien quan hd (dang nhap thanh cong voi nguoi trong danh sach), con ca tu choi dung gia tri hd doc lap qua googleHostedDomain() ("lech-" khac han) va co dong expect rieng khoa auth.options.hd == mienTheoDanhSach truoc khi dung no — neu lech thi test da do o do, khong am tham qua. Contract tu ghi nhan dung diem yeu nay (Notes: "AC-8 them sau phan bien... token gia theo cau hinh auth nen hai ca cua-google-con-song thoi tinh co bat mot auth.ts khoa sai hd") va bu lai bang hd-cua-google.spec.ts, tep nay doc lap nap auth.ts trong tien trinh moi va so hd sinh ra voi ba truong hop cua googleHostedDomain() (mot mien, mien+dia chi, hai mien) — dung diem noi ma AC-7 hoi toi. Vay hai ca van do dung dieu chung hua, va ve phan bu AC-8 co do noi hd cua auth.ts.
    - operational-feasibility: PASS — Trong `idTokenGia`, fallback `nguoi.hd ?? auth.options.socialProviders?.google?.hd` chỉ được dùng ở các ca không truyền `hd` tường minh (ca đăng nhập thành công đơn thuần), nơi mục tiêu là tạo một token hợp lệ chứ không phải đo khớp `hd` — dùng giá trị cấu hình ở đó là hợp lý, không phải "hàng đúng" giả. Ca `cua google tu choi token co hd lech` (dòng 646-678) không dùng fallback đó: nó tự truyền `hd: lech-${mienTheoDanhSach}` cho token sai và `hd: mienTheoDanhSach` (lấy từ `googleHostedDomain()` gọi độc lập) cho token đúng, nên vẫn đo đúng lời hứa — người trong danh sách vào được, cửa Google từ chối token lệch — và dòng `expect(auth.options...hd).toBe(mienTheoDanhSach)` không phải hằng đúng vì sẽ đỏ nếu wiring hd của `auth.ts` sai hoặc env trôi. Về phần bù, `hd-cua-google.spec.ts` đo đúng chỗ nối `hd` trong `auth.ts` bằng cách nạp lại module trong tiến trình con với nhiều `ALLOWED_SIGN_IN` và so khớp bảng kỳ vọng, nên khoảng trống AC-8 nêu đã được lấp.
    - spec-alignment: PASS — Trong chia-mat-khau.integration.spec.ts, ca "dang nhap that bang google" (nguoi trong danh sach) khong truyen nguoi.hd nen token muon hd tu auth.options — nhung do khong phai dieu ca nay do (no do quyen vao cua nguoi trong danh sach, khong do hd), con ca "cua google tu choi token co hd lech" van tu dat hd sai ("lech-...") va hd dung tu googleHostedDomain() doc lap voi auth.options o ca hai nhanh, nen van do dung viec Google tu choi token khong khop. Bo sung hd-cua-google.spec.ts (AC-8) do rieng va doc lap moi lien ket auth.ts↔danh sach cho phep (bang gia tri ky vong theo tung to hop mien), dung dung vai tro bu ma ghi chu hop dong da dat ra cho khoang trong nay — nen phep so hd chua bien thanh hang dung vo nghia.
  human_override:

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mudpjt365y0f
  exit_code: 0
  verified_at: 2026-09-23T06:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

Không phân biệt features vs baseline (pass ở cả hai phía, không đổi hành vi so với b812b65a):

E5, E6, E7, E8

## Variance

none — every multi-run eval is uniform

## Iterations

Round 2: PENDING-JUDGMENT — 11/11 eval máy pass, chờ quyết judgment E12; sổ quyết định lập trước round 3.
Round 3: E5 (bunx turbo run check-types --force) — agent bị skip/chết, không có kết quả → BLOCKED; E1-E4, E6-E11, lệnh suite bun run test đều pass; E12 đề xuất PASS chờ human_override (T3).
Round 4: E11 (AC-8, kat hd-noi) fail — đột biến M2 "bỏ hd" bị bắt đúng lý do (ca "hd cua google theo danh sach \"onemount.com\"" và ca "cua-google-con-song > tu choi token co hd lech" đỏ đúng vì mất hd), nhưng đột biến M1 "hd ngoài danh sách" báo RĂNG CỤT — bản sao không nạp được auth.ts (lỗi nạp module), không phải vì đột biến — nên kat hd-noi thoát mã 1 → REJECT, quay lại implementation ở packages/auth/test cho ca đột biến M1.
