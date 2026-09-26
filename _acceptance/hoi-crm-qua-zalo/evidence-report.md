---
schema_version: 2
feature_slug: hoi-crm-qua-zalo
verdict: BLOCKED
failed_evals: []
reason: "bun run lint:slop — agent bị skip/chết giữa chừng, không có kết quả nào (không phải pass, không phải fail), không được tính là pass; cần chạy lại lệnh này với timeout dài hơn trước khi vòng này có thể lên PASS."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8e1aa411b2080cd1ab28ee8bb4a6e8d1b839da5a
human_signoff:
---

# Evidence Report: hoi-crm-qua-zalo

> BLOCKED — `bun run lint:slop` không hoàn tất ở vòng 1 (agent bị skip/chết, không có kết quả). Toàn bộ 18 eval (E1–E15, gồm E3b/E4b/E8b) và 3/4 lệnh suite bắt buộc (`bun run test`, `bunx turbo run lint --force`, `bunx turbo run build --force`) đều xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E12j | AC-12 | judgment | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-15 | script | PASS |

## Evidence

- eval: E1
  run_id: muicj47788h8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_duong_chinh
  verified_at: 2026-09-26T12:07:18Z
  output: |
     20 expect() calls
    Ran 2 tests across 1 file. [3.66s]
    test-run: dropped crm_muicj47788h8_test

- eval: E2
  run_id: muicj5lf1x7f
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_cung_phien
  verified_at: 2026-09-26T12:07:18Z
  output: |
     24 expect() calls
    Ran 4 tests across 2 files. [645.00ms]
    test-run: dropped crm_muicj5lf1x7f_test

- eval: E3
  run_id: muicj4emeac7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_tu_choi_vai
  verified_at: 2026-09-26T12:07:18Z
  output: |
     14 expect() calls
    Ran 4 tests across 1 file. [593.00ms]
    test-run: dropped crm_muicj4emeac7_test

- eval: E3b
  run_id: muicj3h93un3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_kenh_chi_okr
  verified_at: 2026-09-26T12:07:18Z
  output: |
     3 expect() calls
    Ran 3 tests across 1 file. [302.00ms]
    test-run: dropped crm_muicj3h93un3_test

- eval: E4
  run_id: minted-hoi-crm-qua-zalo-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_luat_cu
  verified_at: 2026-09-26T12:07:18Z
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [548.00ms]
    test-run: dropped crm_muicj5z1jbhc_test

- eval: E4b
  run_id: muicj4drw75t
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_spec_da_ky
  verified_at: 2026-09-26T12:07:18Z
  output: |
    513 expect() calls
    Ran 81 tests across 4 files. [5.92s]
    test-run: dropped crm_muicj4drw75t_test

- eval: E5
  run_id: muicj49u19rn
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_tran
  verified_at: 2026-09-26T12:07:18Z
  output: |
     60 expect() calls
    Ran 5 tests across 1 file. [1186.00ms]
    test-run: dropped crm_muicj49u19rn_test

- eval: E6
  run_id: muicj5mlubew
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_dang_ban
  verified_at: 2026-09-26T12:07:18Z
  output: |
     46 expect() calls
    Ran 6 tests across 1 file. [1112.00ms]
    test-run: dropped crm_muicj5mlubew_test

- eval: E7
  run_id: muicj5w3l7g9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_chi_doc
  verified_at: 2026-09-26T12:07:18Z
  output: |
    73 expect() calls
    Ran 5 tests across 1 file. [504.00ms]
    test-run: dropped crm_muicj5w3l7g9_test

- eval: E8
  run_id: muicj5cqk1r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_loc
  verified_at: 2026-09-26T12:07:18Z
  output: |
     174 expect() calls
    Ran 36 tests across 1 file. [8.00ms]
    test-run: dropped crm_muicj5cqk1r5_test

- eval: E8b
  run_id: muicjig0of0r
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_loc_kenh
  verified_at: 2026-09-26T12:07:18Z
  output: |
     7 expect() calls
    Ran 2 tests across 1 file. [415.00ms]
    test-run: dropped crm_muicjig0of0r_test

- eval: E9
  run_id: muicjk4epvs1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_cai_lenh
  verified_at: 2026-09-26T12:07:18Z
  output: |
     10 expect() calls
    Ran 1 test across 1 file. [429.00ms]
    test-run: dropped crm_muicjk4epvs1_test

- eval: E10
  run_id: muicjjauxsq6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_loi
  verified_at: 2026-09-26T12:07:18Z
  output: |
     18 expect() calls
    Ran 2 tests across 1 file. [525.00ms]
    test-run: dropped crm_muicjjauxsq6_test

- eval: E11
  run_id: muicjjc1cqpy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_khong_log
  verified_at: 2026-09-26T12:07:18Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [471.00ms]
    test-run: dropped crm_muicjjc1cqpy_test

- eval: E12
  run_id: muicjk3qw62b
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_chi_dan
  verified_at: 2026-09-26T12:07:18Z
  output: |
     65 expect() calls
    Ran 3 tests across 1 file. [360.00ms]
    test-run: dropped crm_muicjk3qw62b_test

- eval: E12j
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  votes:
    - domain-correctness: PASS — Tám câu mới trong ZALO.loi (hoiKhongQuyen, hetTranPhut, hetTranNgay, hetTranThang, dangTraLoi, tacTuLoi, daMoi, canHoiLai) đều là tiếng Việt tự nhiên, không câu nào dùng «trợ lý», «thông báo» hay «tác nhân» (grep xác nhận không khớp) — đúng từ điển CONTEXT.md (mục Bot Zalo, Trợ lý AI, Nhắc buổi sáng). Chỉ dẫn phiên Zalo (`zalo-chi-dan.ts`) viết bằng tiếng Anh nhưng đó là quy ước nhất quán của mọi chỉ dẫn hệ thống gửi cho model trong `instructions/task.ts` (builder, team-agent, research đều tiếng Anh) — không phải văn bản hiển thị cho người dùng, nên không tính vào phép thử «đọc tự nhiên với người Việt» của tám câu trả lời. Chỉ dẫn nêu đủ ba thứ cấm của ranh giới A: (1) không nêu số điện thoại/email của cá nhân đối tác, (2) không trích nguyên văn thư/lịch — chỉ tóm tắt, (3) không nêu giá trị AppSetting (keys, tokens, secrets, settings).
    - operational-feasibility: PASS — Chỉ dẫn `lib/zalo-chi-dan.ts` nêu đủ ba thứ cấm của ranh giới A ("Never include a partner person's phone number ... or email address", "Never quote an email or calendar entry verbatim", "Never state any value stored in AppSetting"). Cả tám câu mới trong `zalo-config.ts` (`hoiKhongQuyen`, `hetTranPhut`, `hetTranNgay`, `hetTranThang`, `dangTraLoi`, `tacTuLoi`, `daMoi`, `canHoiLai`) đọc tự nhiên bằng tiếng Việt thường ngày, tự xưng "tôi" chứ không "trợ lý", và không câu nào dùng chữ «thông báo», khớp đúng chỗ tránh của CONTEXT.md (mục **Bot Zalo**, **Nhắc buổi sáng**). Chỉ dẫn tự nó viết bằng tiếng Anh (bản chất là system prompt cho LLM, không phải nhãn hiển thị) — AC-12 chỉ đòi nó "nêu" đủ nội dung, không đòi bản thân nó phải là tiếng Việt tự nhiên, nên điểm này không nằm trong phạm vi tiêu chí hợp đồng.
    - spec-alignment: PASS — Chỉ dẫn `zalo-chi-dan.ts` nêu đủ ba thứ cấm ranh giới A (SĐT/email cá nhân đối tác, không trích nguyên văn thư/lịch, không nêu giá trị AppSetting) đúng dòng 7. Tám câu mới trong `ZALO.loi` (hoiKhongQuyen, hetTranPhut, hetTranNgay, hetTranThang, dangTraLoi, tacTuLoi, daMoi, canHoiLai) đều là câu tiếng Việt một dòng, dưới `ZALO.tranKyTu`, không câu nào tự xưng bot là «trợ lý» và không câu nào dùng chữ «thông báo», đúng hai điểm từ điển CONTEXT.md mà câu hỏi nêu tên.
  rationale: Ba lens đều đồng thuận PASS trên cùng bằng chứng — chỉ dẫn phiên Zalo nêu đủ ba cấm của ranh giới A, và tám câu ZALO.loi mới đọc tự nhiên bằng tiếng Việt, đúng từ điển CONTEXT.md, không câu nào dùng «trợ lý»/«thông báo».

- eval: E13
  run_id: muicjkhi9rgc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_nguong
  verified_at: 2026-09-26T12:07:18Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [1139.00ms]
    test-run: dropped crm_muicjkhi9rgc_test

- eval: E14
  run_id: muicjkjer8bu
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_telemetry
  verified_at: 2026-09-26T12:07:18Z
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [509.00ms]
    test-run: dropped crm_muicjkjer8bu_test

- eval: E15
  run_id: minted-hoi-crm-qua-zalo-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hcz_tai_lieu
  verified_at: 2026-09-26T12:07:18Z
  output: |
    ok: lo-trinh muc 7 dong 4
    ok: telemetry.md zalo_questions
    ok: merge-base khong co

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-hoi-crm-qua-zalo-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-26T12:07:18Z

- cmd: bunx turbo run lint --force
  run_id: minted-hoi-crm-qua-zalo-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-26T12:07:18Z

- cmd: bunx turbo run build --force
  run_id: minted-hoi-crm-qua-zalo-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-26T12:07:18Z

Lệnh suite bắt buộc thứ tư của kho, `bun run lint:slop`, không có khối bằng chứng ở trên: agent chạy lệnh này bị skip/chết giữa chừng ở vòng 1, không trả về kết quả nào (không phải pass, không phải fail, không có run_id để đối chiếu run-log). Đây là nguyên nhân duy nhất khiến verdict của vòng này là BLOCKED — xem `reason` ở frontmatter.

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — mọi eval chạy runs=1, không có eval ngẫu nhiên hay dao động (pass_rate) nào cần người quyết ở Gate 2.

## Iterations

Round 1: 18/18 eval (E1–E15, gồm E3b/E4b/E8b) đều PASS và 3/4 lệnh suite bắt buộc (`bun run test`, `bunx turbo run lint --force`, `bunx turbo run build --force`) xanh; lệnh suite thứ tư `bun run lint:slop` bị agent bỏ/chết giữa chừng, không có kết quả — verdict BLOCKED, cần chạy lại đúng lệnh đó với timeout dài hơn trước khi vòng này có thể lên PASS hay PENDING-JUDGMENT.
