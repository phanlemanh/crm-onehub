---
schema_version: 2
feature_slug: hd-theo-danh-sach
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: sequential per-eval verify, run_id minted at execution
enforcement_mode: strict
bypass_used: false
verified_commit: ec21c3bd557378cf105ccd3cc3e5d03ee4338278
run_id: s4r1-20260907T020741Z
human_signoff:
---

# Evidence Report: hd-theo-danh-sach

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E8 | AC-8 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: r-20260907T020741Z-11325
  exit_code: 0
  verifier: config:executors.test.hd_bang_ba_dong
  verified_at: 2026-09-07T02:07:41Z
  output: |
    bun test v1.3.10 (30e609e0)
     7 pass
     0 fail
     16 expect() calls
    Ran 7 tests across 1 file. [14.00ms]

- eval: E2
  run_id: r-20260907T020741Z-32460
  exit_code: 0
  verifier: config:executors.script.hd_ham_thuan
  verified_at: 2026-09-07T02:07:41Z
  output: |
    nhap tu ./workspace: googleHostedDomain · hasSignInAllowList · isWorkspaceEmail · primaryWorkspaceDomain
      packages/auth/src/auth.ts:50  hostedDomain -> googleHostedDomain()  goi ham thuan
    XANH: quyet dinh hd nam trong mot ham thuan nhap tu ./workspace, auth.ts chi goi.

- eval: E3
  run_id: r-20260907T020741Z-28241
  exit_code: 0
  verifier: config:executors.script.hd_cua_phan_quyen_nguyen_ven
  verified_at: 2026-09-07T02:07:41Z
  output: |
    (1) diff voi sha ghim 5ac85ef9: 0 dong
    (2) bo test chay that: 8 ca xanh · 0 ca do
    (3) doi chung hanh vi: 10 ca cua bo test cu chay lai
    XANH: apps/api/test/workspace.spec.ts khong doi mot ky tu so voi sha ghim, 8 ca cua no van xanh, va 10 ca hanh vi chay lai cho ket qua y het.

- eval: E4
  run_id: r-20260907T020741Z-22046
  exit_code: 0
  verifier: config:executors.test.hd_cau_tu_choi
  verified_at: 2026-09-07T02:07:41Z
  output: |
    bun test v1.3.10 (30e609e0)
     3 pass
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [175.00ms]

- eval: E5
  run_id: r-20260907T020741Z-20826
  exit_code: 0
  verifier: config:executors.test.hd_cau_hinh_onehub
  verified_at: 2026-09-07T02:07:41Z
  output: |
    bun test v1.3.10 (30e609e0)
     1 pass
     6 filtered out
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [11.00ms]

- eval: E8
  run_id: r-20260907T020741Z-4556
  exit_code: 0
  verifier: config:executors.test.hd_khong_de_lai_hang
  verified_at: 2026-09-07T02:07:41Z
  output: |
    bun test v1.3.10 (30e609e0)
     2 pass
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [228.00ms]

- eval: E6
  run_id: r-20260907T020741Z-23958
  exit_code: 0
  verifier: config:executors.script.hd_mot_bo_thuoc
  verified_at: 2026-09-07T02:07:41Z
  output: |
    chan cua lat: 3 · chan doi chieu: 87 · dau van 12 dong: 10666
    XANH: khong cua so 12 dong nao cua lat nay trung dau van voi mot chan da co.

- eval: E7
  exit_code:
  verifier: judgment
  verified_at:
  output: |
    Muc phan xet — may KHONG cham. Nguoi doc cau tu choi ma mot dia chi ngoai
    domain nhan sau khi da chon tai khoan Google, roi quyet cai gia ay co dang
    de mo duong cho mot dia chi ngoai domain khong.
    Cau do la: "That address is not on the allow-list." khi danh sach khong co
    domain nao; "Sign in with your @onemount.com account." khi danh sach co
    domain — ke ca danh sach tron, do primaryWorkspaceDomain() van tra domain.
    Voi cau hinh onehub da chon (onemount.com + phanlemanh@gmail.com), mot nguoi
    la se nhan cau NEU DOMAIN, khong phai cau allow-list.
