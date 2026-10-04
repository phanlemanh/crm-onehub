---
schema_version: 2
feature_slug: hd-theo-danh-sach
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-eval verify, run_id minted at execution
enforcement_mode: strict
bypass_used: false
verified_commit: 0d03129ecfa5bdbcff83dee9706a511e342f399c
run_id: s4r2-20260907T021447Z-5948
human_signoff: Manh Phan 2026-09-07
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
| E7 | AC-7 | judgment | PASS |

## Evidence

- eval: E1
  run_id: s4r2-20260907T021447Z-5948-E1
  exit_code: 0
  verifier: config:executors.test.hd_bang_ba_dong
  verified_at: 2026-09-07T02:14:47.608Z
  output: |
    bun test v1.3.10 (30e609e0)
     7 pass
     0 fail
     16 expect() calls
    Ran 7 tests across 1 file. [13.00ms]

- eval: E2
  run_id: s4r2-20260907T021447Z-5948-E2
  exit_code: 0
  verifier: config:executors.script.hd_ham_thuan
  verified_at: 2026-09-07T02:14:47.726Z
  output: |
    nhap tu ./workspace: googleHostedDomain · hasSignInAllowList · isWorkspaceEmail · primaryWorkspaceDomain
      packages/auth/src/auth.ts:50  hostedDomain -> googleHostedDomain()  goi ham thuan
    XANH: quyet dinh hd nam trong mot ham thuan nhap tu ./workspace, auth.ts chi goi.

- eval: E3
  run_id: s4r2-20260907T021447Z-5948-E3
  exit_code: 0
  verifier: config:executors.script.hd_cua_phan_quyen_nguyen_ven
  verified_at: 2026-09-07T02:14:47.822Z
  output: |
    (1) diff voi sha ghim 5ac85ef9: 0 dong
    (2) bo test chay that: 8 ca xanh · 0 ca do
    (3) doi chung hanh vi: 10 ca cua bo test cu chay lai
    XANH: apps/api/test/workspace.spec.ts khong doi mot ky tu so voi sha ghim, 8 ca cua no van xanh, va 10 ca hanh vi chay lai cho ket qua y het.

- eval: E4
  run_id: s4r2-20260907T021447Z-5948-E4
  exit_code: 0
  verifier: config:executors.test.hd_cau_tu_choi
  verified_at: 2026-09-07T02:14:48.021Z
  output: |
    bun test v1.3.10 (30e609e0)
     3 pass
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [173.00ms]

- eval: E5
  run_id: s4r2-20260907T021447Z-5948-E5
  exit_code: 0
  verifier: config:executors.test.hd_cau_hinh_onehub
  verified_at: 2026-09-07T02:14:48.055Z
  output: |
    bun test v1.3.10 (30e609e0)
     1 pass
     6 filtered out
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [10.00ms]

- eval: E8
  run_id: s4r2-20260907T021447Z-5948-E8
  exit_code: 0
  verifier: config:executors.test.hd_khong_de_lai_hang
  verified_at: 2026-09-07T02:14:48.304Z
  output: |
    bun test v1.3.10 (30e609e0)
     2 pass
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [221.00ms]

- eval: E6
  run_id: s4r2-20260907T021447Z-5948-E6
  exit_code: 0
  verifier: config:executors.script.hd_mot_bo_thuoc
  verified_at: 2026-09-07T02:14:48.390Z
  output: |
    chan cua lat: 3 · chan doi chieu: 87 · dau van 12 dong: 10666
    XANH: khong cua so 12 dong nao cua lat nay trung dau van voi mot chan da co.

- eval: E7
  judged_by: nguoi — chu kho, Cong 2
  verdict: PASS
  verified_at: 2026-09-07
  human_override: Đạt — Manh Phan 2026-09-07
  rationale: |
    Cau tu choi ma mot dia chi ngoai domain nhan sau khi da chon tai khoan Google:
    voi cau hinh onehub (onemount.com + phanlemanh@gmail.com) la "Sign in with your
    @onemount.com account.", vi primaryWorkspaceDomain() van tra domain ke ca khi
    danh sach tron. Chu kho dong y mo tai khoan phanlemanh@gmail.com va nhan cai gia
    ay: nguoi ngoai bi tu choi SAU khi da chon tai khoan, thay vi khong thay nut.
    May KHONG cham muc nay.

## Lệnh chứng

| Lệnh | run_id | exit |
|---|---|---|
| `test` | s4r2-20260907T021447Z-5948-suite-test | 0 |
| `check-types` | s4r2-20260907T021447Z-5948-suite-check-types | 0 |
| `lint` | s4r2-20260907T021447Z-5948-suite-lint | 0 |
| `lint-slop` | s4r2-20260907T021447Z-5948-suite-lint-slop | 0 |

### Re-pin lần 1 — 2026-10-04, do khai paths lô 2: chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T075112Z-36317
sha: 11bd93cf9f3488a2ed6df5c432a362feff41a428 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E7 · diff chạm vật đo ngoài làn máy: E7 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-7

### Re-pin lần 2 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T141023Z-83923
sha: 4893629a5ff0068f0b3a0fc09523a037c7c953b7 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E7 · AC không có chốt máy: AC-7

### Re-pin lần 3 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T161003Z-91842
sha: 0d03129ecfa5bdbcff83dee9706a511e342f399c · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E7 · AC không có chốt máy: AC-7
