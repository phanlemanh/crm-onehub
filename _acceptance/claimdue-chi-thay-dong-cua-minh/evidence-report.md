---
schema_version: 2
feature_slug: claimdue-chi-thay-dong-cua-minh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bc36c2d575122deb12067a7da028614abef51f82
human_signoff: Manh Phan 2026-09-24
---

# Evidence Report: claimdue-chi-thay-dong-cua-minh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-7 | script | PASS |
| E12 | AC-8 | judgment | PASS |
| E13 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: mueve232si8k
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cdt_hang_xom_lanh
  verified_at: 2026-09-24T01:45:30Z
  output: |
    TEST_RUN_ID=mueve232si8k runs against crm_mueve232si8k_test
    tests=20 failures=0 skipped=0
    hang-xom-dong=20 chay=20
    hang-xom lanh: 20/20 bai xanh
    hang-xom lanh: 0 dong la bi dung
    test-run: dropped crm_mueve232si8k_test
    (file khai 20 bai it( — khop tests=20)

- eval: E2
  run_id: mueve232si8k
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cdt_hang_xom_lanh
  verified_at: 2026-09-24T01:45:30Z
  output: |
    tests=20 failures=0 skipped=0
    hang-xom-dong=20 chay=20
    hang-xom lanh: 20/20 bai xanh
    hang-xom lanh: 0 dong la bi dung
    (khong co dong HANG-XOM-BI-DUNG hay HANG-XOM-MAT nao; cung lenh voi E1)

- eval: E3
  run_id: muevel5qg1yq
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cdt_hang_xom_pha
  verified_at: 2026-09-24T01:45:55Z
  output: |
    tests=20 failures=12 skipped=0   (ban sao pha, do la dung chieu)
    ban dot bien do o ca ba ten CI: claims due work and leases it; does not hand the same row to two dispatchers; leaves work that is not due yet (cung 9 bai khac cua claimDue/retireExhausted)
    HANG-XOM-BI-DUNG claimDue > claims due work and leases it (10 dong)
    HANG-XOM-BI-DUNG claimDue > does not hand the same row to two dispatchers (6 dong)
    HANG-XOM-BI-DUNG claimDue > leaves work that is not due yet (10 dong)
    HANG-XOM-BI-DUNG completeTask > retires a row once, and reports who it was about (10 dong)
    hang-xom pha: do

- eval: E4
  run_id: muevez2tguih
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cdt_chung_luot_lanh
  verified_at: 2026-09-24T01:46:13Z
  output: |
    luot 1..5 x (dau, giua, cuoi): moi luot "truoc tasks: 22 dong la den han chua thue" (15/15 lan, k=22)
    moi luot co thu tu: file tasks tests=20 failures=0 skipped=0
    luot chung mot tien trinh: tasks: tests=20 failures=0 skipped=0; ca lo: tests=139 failures=0 skipped=0
    chin file kia (bao, khong cham): tat ca failures=0
    chung-luot lanh: 16/16 luot xanh
    test-run: dropped crm_muevez2tguih_test

- eval: E5
  run_id: muevgk88vf11
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cdt_chung_luot_pha
  verified_at: 2026-09-24T01:47:27Z
  output: |
    luot 1 dau:   truoc tasks: 22 dong la den han chua thue; ban sao tests=20 failures=3
    luot 1 giua:  truoc tasks: 22 dong la den han chua thue; ban sao tests=20 failures=3
    luot 1 cuoi:  truoc tasks: 22 dong la den han chua thue; ban sao tests=20 failures=3
    o ca ba thu tu, ban sao pha do dung ba bai CI: claims due work and leases it; does not hand the same row to two dispatchers; leaves work that is not due yet
    chung-luot pha: do 3/3 thu tu
    test-run: dropped crm_muevgk88vf11_test

- eval: E6
  run_id: muevgyla3fu3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cdt_nhanh_except_co_nguoi_giu
  verified_at: 2026-09-24T01:47:46Z
  output: |
    that tasks.integration: tests=20 failures=0 skipped=0
    that lanes.integration: tests=7 failures=0 skipped=0
    dot-bien tasks.integration: tests=20 failures=1 skipped=0
    ban dot bien do o bai 'claimDue > leaves a visible kind to the visible lane'
    dot-bien lanes.integration: tests=7 failures=0 skipped=0
    nhanh except co nguoi giu: ma that xanh, dot bien do o 'claimDue > leaves a visible kind to the visible lane'

- eval: E7
  run_id: claimdue-chi-thay-dong-cua-minh-E7-r2-1790214480
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-24T01:47:53Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    6.431s

- eval: E8
  run_id: muevhe0hx6t0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-24T01:48:06Z
  output: |
    agent:test  494 pass, 0 fail
    api:test    594 pass, 0 fail
    app:test    moi tep 0 fail
     Tasks:    11 successful, 11 total
    test-run: dropped crm_muevhe0hx6t0_test

- eval: E9
  run_id: claimdue-chi-thay-dong-cua-minh-E9-r2-1790214557
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-24T01:49:16Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    368ms

- eval: E10
  run_id: claimdue-chi-thay-dong-cua-minh-E10-r2-1790214562
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-24T01:49:22Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 619ms on 1235 files with 9 rules using 14 threads.

- eval: E11
  run_id: claimdue-chi-thay-dong-cua-minh-E11-r2-1790214578
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-24T01:49:28Z
  output: |
    app:build: cache bypass, force executing 8439f8a4a2d9873f
    app:build: $ next build
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    9.716s

- eval: E12
  judged_by: judge panel (fresh context, 3 lens: spec-alignment, domain-correctness, operational-feasibility)
  verdict: PASS
  rationale: Ba giám khảo cùng PASS trên 8ae4b9ba — mỗi bài trong ba khối đã đổi lọc vẫn có khẳng định sẽ đỏ khi hành vi tên bài hứa bị phá (đếm chính xác, toEqual trên dòng của bài, lease và trần attempts đo trên dòng của bài); bài 'leaves a visible kind to the visible lane' bắt được nhánh except bỏ lọc nhờ dòng brand hoà ưu tiên tối đa và đến hạn sớm hơn, và không dòng lạ nào từ mã sản phẩm (ưu tiên cao nhất 950) chen được. Lưu ý có từ trước, không do đổi lọc: bài hai-người-điều-phối phụ thuộc thời điểm; retireExhausted quét cả bảng với giới hạn 100 (Ngoài phạm vi đã khai). Giám khảo spec-alignment và domain-correctness tự đọc git diff của file test ngoài bộ input được giao — chấm không hoàn toàn mù.
  human_override:

- eval: E13
  run_id: muevetcefihk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cdt_hang_xom_pha_don_bang
  verified_at: 2026-09-24T01:46:05Z
  output: |
    tests=20 failures=0 skipped=0   (ban sao don bang van xanh — chinh vi the bo do phai bat)
    hang-xom-dong=20 chay=20
    HANG-XOM-MAT o ca 14 bai cua ba khoi claimDue / retireExhausted / completeTask (25 dong moi bai)
    HANG-XOM-MAT claimDue > claims due work and leases it (25 dong)
    HANG-XOM-MAT completeTask > retires a row once, and reports who it was about (25 dong)
    hang-xom pha-don-bang: do
    test-run: dropped crm_muevetcefihk_test

## Known limits

## Ngoài hợp đồng

- Danh sách chín file ghi AgentTask trong `rang/chung-luot.sh` là danh sách viết tay, không suy từ lớp; thêm một file mới ghi việc nghiên cứu thì phép đo cùng lượt không tự thấy nó. Đề xuất: ghi Known limits.

## Analyst

n-a — vòng này không chạy baseline trên diffBase; mọi eval máy ghi `baseline: n-a`. Chiều phân biệt của các phép đo tính năng được chứng bằng bản sao phá ngay trong cùng vòng (E3, E5, E6, E13 đều đỏ đúng chỗ); E7–E11 là bộ lệnh chứng chung, giữ vai hồi quy.

## Variance

n-a — không eval nào chạy nhiều lần (runs > 1).

## Iterations

Round 1 (vô hiệu): workflow S4 trả PASS nhưng bốn agent chấm đã sửa `tasks.integration.spec.ts` và một agent commit 53a4adf3 (xoá dòng gieo của thước cùng lượt); đã revert ở 764b2b8d, kết quả vòng 1 không dùng. Giữa hai vòng: thêm đối chứng dương cho bốn bài chỉ khẳng định rỗng (0babbdde, 8ae4b9ba) theo finding AC-8 của review và hội đồng E12. Round 2: chấm độc lập tuần tự, 12/12 eval máy (E1–E11, E13) đạt `expected` trên 8ae4b9ba, cây không đổi trong lúc chấm; E12 hội đồng ba giám khảo PASS (vòng hội đồng trước đó trên 0babbdde: 1 UNCERTAIN + 2 PASS cùng chỉ hai bài retireExhausted chỉ khẳng định rỗng — đã sửa ở 8ae4b9ba rồi chấm lại).

### Re-pin lần 1 — 2026-09-24, do gop onehub 679b5164 truoc khi mo PR
run_id: repin-20260924T035025Z-53186
sha: 5fd9c0c8fbd6e02841b6290087ed919367624a23 · suites: 4 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-10-04, do khai paths lô 1 (kit 2.21.0): chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T020617Z-28918
sha: bc36c2d575122deb12067a7da028614abef51f82 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-8
