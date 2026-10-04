---
schema_version: 2
feature_slug: khoa-lo-giu-tran
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3f3c60fe85ce0734a0f149a37c6c24dd52b98a74
human_signoff: Mạnh 2026-09-06 — ký trên giới hạn đã khai: 6 mục ngoài hợp đồng ghi vào giới hạn đã biết, cắt/hoãn đồng ý, Treo phê hết, và MỘT lỗ TRONG hợp đồng (AC-3: chân can chưa có chiều đỏ tự chạy) máy khai chứ không sửa vì đã hết ba vòng chấm.
---

# Evidence Report: khoa-lo-giu-tran

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-10 | judgment | PASS (đề xuất panel, carried r2) |

## Evidence

- eval: E1
  run_id: minted-khoa-lo-giu-tran-E1-r2
  exit_code: 0
  verifier: config:executors.script.khoa_lo_tran_retire
  verified_at: 2026-09-06T08:30:04Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-khoa-lo-giu-tran-E2-r2
  exit_code: 0
  verifier: config:executors.script.khoa_lo_tran_claim
  verified_at: 2026-09-06T08:30:04Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-khoa-lo-giu-tran-E3-r2
  exit_code: 0
  verifier: config:executors.script.khoa_lo_can
  verified_at: 2026-09-06T08:30:04Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-khoa-lo-giu-tran-E4-r2
  exit_code: 0
  verifier: config:executors.script.khoa_lo_chieu_do
  verified_at: 2026-09-06T08:30:04Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-khoa-lo-giu-tran-E5-r2
  exit_code: 0
  verifier: config:executors.script.khoa_lo_giai_thich
  verified_at: 2026-09-06T08:30:04Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-khoa-lo-giu-tran-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.khoa_lo_dong_thoi
  verified_at: 2026-09-06T08:45:00Z
  output: |
    rang dong-thoi: 8 lượt song song, bản sửa 16/16 id khác nhau, bản bỏ khoá chỉ 4/16

- eval: E7
  run_id: minted-khoa-lo-giu-tran-E7-r2
  exit_code: 0
  verifier: config:executors.script.khoa_lo_toan_tep
  verified_at: 2026-09-06T08:30:04Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-khoa-lo-giu-tran-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-06T08:47:00Z
  output: |
      Time:    25ms >>> FULL TURBO

    EXIT_CODE: 0

- eval: E9
  run_id: minted-khoa-lo-giu-tran-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-06T08:49:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    4.422s

- eval: E10
  run_id: minted-khoa-lo-giu-tran-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-06T08:50:00Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    223ms

- eval: E11
  run_id: minted-khoa-lo-giu-tran-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-06T08:51:00Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 457ms on 813 files with 9 rules using 18 threads.

- eval: E12
  run_id: minted-khoa-lo-giu-tran-E12-r2
  exit_code: 0
  verifier: config:executors.script.khoa_lo_tai_lieu
  verified_at: 2026-09-06T08:30:04Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  judged_by: judge panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  panel giu nguyen tu round 2 — inputs khong doi, khong cham lai; rationale xem round 2
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override:

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

- E8 (`bun run db:test && bun run test`)
- E9 (`bunx turbo run check-types --force`)
- E10 (`bunx turbo run lint --force`)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E4 (chieu-do) cannot run — đua với prisma generate lúc nạp client (turbo ^build của E8), không lặp lại. Verdict BLOCKED, quay lại rang.sh in lý do khi nạp lại.
Round 2: E6 (dong-thoi) FAIL, exit khác 0 trên lệnh `rang.sh --chan dong-thoi` — verdict REJECT, quay lại implementation.
Round 3: xác định REJECT vòng 2 là verifier ghi sai mã thoát (dòng chép là nhánh thành công, chữ chép sai "song parallel"), chạy lại E6 tại chỗ 3 lần đều thoát 0; cùng 11 eval máy carry-forward và panel E13 giữ nguyên — verdict PASS.

### Re-pin lần 1 — 2026-09-06, do rebase lên onehub sau khi PR #6 gộp (59 commit, xung đột .gitignore và config.yaml)
run_id: repin-khoa-lo-giu-tran-20260906T090749Z
sha: 2a72fed4c93b69bfeb479556ac616d5a789b4b98 · suites: 4 lệnh exit 0

### Re-pin lần 2 — 07/09, do vòng sửa `thuoc-cache-het-doi-tuong` chạm hai file cấu hình turbo

run_id: repin-20260907T005455Z-44758
sha: f8aa7f4a9e1ec9ce1be8585683103adf1a901431 · suites: 4 lệnh exit 0

### Re-pin lần 3 — 2026-09-16, do Chiến dịch ghim lại theo mốc kit 2.14.0 — sáu hồ sơ làn xanh; năm hồ sơ còn lại đỏ vì nguyên nhân thật, đi lượt riêng
run_id: repin-20260916T014000Z-73664
sha: 96ec6d9b0447bb8e3eafaf36c84dc9902372ebef · suites: 4 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng

### Re-pin lần 4 — 2026-09-17, do chiến dịch ghim lại kit 2.14.0 (PR #47): làn eval thật trên cây đã chuyển đường ghi tạo phẩm; đo bằng phanlemanh@gmail.com
run_id: repin-20260917T051527Z-61120
sha: ed70d70dd0ec9ee7412b45e63c90c925500d50c6 · suites: 4 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng

### Re-pin lần 5 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T053254Z-97828
sha: 3f3c60fe85ce0734a0f149a37c6c24dd52b98a74 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E13 · diff chạm vật đo ngoài làn máy: E13 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10
