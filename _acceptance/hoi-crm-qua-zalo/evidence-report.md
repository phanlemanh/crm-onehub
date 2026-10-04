---
schema_version: 2
feature_slug: hoi-crm-qua-zalo
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4893629a5ff0068f0b3a0fc09523a037c7c953b7
human_signoff: Phan Le Manh 2026-09-26
---

# Evidence Report: hoi-crm-qua-zalo

> PENDING-JUDGMENT — vòng 2. Toàn bộ 18 eval máy (E1–E15, gồm E3b/E4b/E8b) đều PASS, và cả 4 lệnh suite bắt buộc của kho (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) đều xanh — lệnh `bun run lint:slop` từng làm vòng 1 BLOCKED (agent chết giữa chừng) nay chạy xong sạch (0 warnings, 0 errors, 1594 tệp). Hợp đồng này hạng **T3**, nên mục phán đoán E12j bắt buộc `human_override` trực tiếp của người trước khi lên PASS, bất kể verdict của panel — đó là lý do duy nhất giữ vòng này ở PENDING-JUDGMENT.

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
  run_id: muidg0noogif
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_duong_chinh
  verified_at: 2026-09-26T12:32:44Z
  output: |
     23 expect() calls
    Ran 3 tests across 1 file. [3.62s]
    test-run: dropped crm_muidg0noogif_test

- eval: E2
  run_id: muidg6biru5k
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_cung_phien
  verified_at: 2026-09-26T12:32:44Z
  output: |
     24 expect() calls
    Ran 4 tests across 2 files. [433.00ms]
    test-run: dropped crm_muidg6biru5k_test

- eval: E3
  run_id: muidg1x1oirb
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_tu_choi_vai
  verified_at: 2026-09-26T12:32:44Z
  output: |
     14 expect() calls
    Ran 4 tests across 1 file. [407.00ms]
    test-run: dropped crm_muidg1x1oirb_test

- eval: E3b
  run_id: muidg1a354ws
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_kenh_chi_okr
  verified_at: 2026-09-26T12:32:44Z
  output: |
     3 expect() calls
    Ran 3 tests across 1 file. [175.00ms]
    test-run: dropped crm_muidg1a354ws_test

- eval: E4
  run_id: muidg3wa8wk3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_luat_cu
  verified_at: 2026-09-26T12:32:44Z
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [394.00ms]
    test-run: dropped crm_muidg3wa8wk3_test

- eval: E4b
  run_id: muidg2ym97jy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_spec_da_ky
  verified_at: 2026-09-26T12:32:44Z
  output: |
     513 expect() calls
    Ran 81 tests across 4 files. [5.12s]
    test-run: dropped crm_muidg2ym97jy_test

- eval: E5
  run_id: muidg03svhj2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_tran
  verified_at: 2026-09-26T12:32:44Z
  output: |
     60 expect() calls
    Ran 5 tests across 1 file. [644.00ms]
    test-run: dropped crm_muidg03svhj2_test

- eval: E6
  run_id: muidg3ohfhdn
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_dang_ban
  verified_at: 2026-09-26T12:32:44Z
  output: |
     46 expect() calls
    Ran 6 tests across 1 file. [640.00ms]
    test-run: dropped crm_muidg3ohfhdn_test

- eval: E7
  run_id: muidg2ohxvbp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_chi_doc
  verified_at: 2026-09-26T12:32:44Z
  output: |
    73 expect() calls
    Ran 5 tests across 1 file. [339.00ms]
    test-run: dropped crm_muidg2ohxvbp_test

- eval: E8
  run_id: muidg2x00ki5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_loc
  verified_at: 2026-09-26T12:32:44Z
  output: |
     174 expect() calls
    Ran 36 tests across 1 file. [10.00ms]
    test-run: dropped crm_muidg2x00ki5_test

- eval: E8b
  run_id: muidg1idif1t
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_loc_kenh
  verified_at: 2026-09-26T12:32:44Z
  output: |
     7 expect() calls
    Ran 2 tests across 1 file. [446.00ms]
    test-run: dropped crm_muidg1idif1t_test

- eval: E9
  run_id: muidgcv3eah3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_cai_lenh
  verified_at: 2026-09-26T12:32:44Z
  output: |
     10 expect() calls
    Ran 1 test across 1 file. [340.00ms]
    test-run: dropped crm_muidgcv3eah3_test

- eval: E10
  run_id: minted-hoi-crm-qua-zalo-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_loi
  verified_at: 2026-09-26T12:32:44Z
  output: |
     18 expect() calls
    Ran 2 tests across 1 file. [420.00ms]
    test-run: dropped crm_muidggbhx9w2_test

- eval: E11
  run_id: muidgf2s1zl9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_khong_log
  verified_at: 2026-09-26T12:32:44Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [370.00ms]
    test-run: dropped crm_muidgf2s1zl9_test

- eval: E12
  run_id: muidgfdehmvv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_chi_dan
  verified_at: 2026-09-26T12:32:44Z
  output: |
     65 expect() calls
    Ran 3 tests across 1 file. [349.00ms]
    test-run: dropped crm_muidgfdehmvv_test

- eval: E12j
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  votes:
    - domain-correctness: PASS — Cả tám câu mới trong ZALO.loi (hoiKhongQuyen, hetTranPhut, hetTranNgay, hetTranThang, dangTraLoi, tacTuLoi, daMoi, canHoiLai) đọc tự nhiên bằng tiếng Việt, không câu nào tự xưng bot là «trợ lý» hay dùng chữ «thông báo» (khớp CONTEXT.md — bot chỉ xưng «tôi», và Nhắc buổi sáng/Trợ lý AI đã tránh hai từ này). zalo-chi-dan.ts nêu đủ ba thứ cấm của ranh giới A: cấm số điện thoại/email cá nhân đối tác, cấm trích nguyên văn thư/lịch (chỉ được tóm tắt), và cấm nêu bất kỳ giá trị AppSetting nào (khoá, token, cài đặt).
    - operational-feasibility: PASS — Tám câu mới trong ZALO.loi (hoiKhongQuyen, hetTranPhut, hetTranNgay, hetTranThang, dangTraLoi, tacTuLoi, daMoi, canHoiLai) đều là câu tiếng Việt tự nhiên, không câu nào tự xưng «trợ lý» hay dùng chữ «thông báo», khớp mục Bot Zalo/Trợ lý AI của CONTEXT.md (avoid: tác nhân, trợ lý; avoid: thông báo). Chỉ dẫn phiên Zalo (zalo-chi-dan.ts) nêu đủ ba thứ cấm của ranh giới A: cấm số điện thoại/email cá nhân đối tác, cấm trích nguyên văn thư/lịch, và cấm nêu giá trị AppSetting.</rationale>
    - spec-alignment: PASS — Cả tám câu trong ZALO.loi (hoiKhongQuyen, hetTranPhut, hetTranNgay, hetTranThang, dangTraLoi, tacTuLoi, daMoi, canHoiLai) đọc được là câu tiếng Việt tự nhiên, không câu nào tự xưng «trợ lý» hay dùng chữ «thông báo» — đúng hai điều từ điển CONTEXT.md nêu rõ (mục Bot Zalo/Trợ lý AI tránh lẫn "trợ lý", mục Nhắc buổi sáng tránh "thông báo"); chữ «cuộc trò chuyện» ở daMoi không phạm mục Hội thoại của CONTEXT.md vì mục đó chỉ khoá cho màn hội thoại dựng tác nhân, còn đây là chữ thường ai cũng hiểu cho một khái niệm chưa có mục — đúng luật "chưa có mục thì viết chữ thường ai cũng hiểu". Chỉ dẫn CHI_DAN_ZALO nêu đủ ba thứ cấm của ranh giới A (cấm số điện thoại/email cá nhân đối tác, cấm trích nguyên văn thư/lịch, cấm lộ giá trị AppSetting).
  rationale: Ba lens đều đồng thuận PASS trên cùng bằng chứng — chỉ dẫn phiên Zalo nêu đủ ba cấm của ranh giới A, và tám câu ZALO.loi mới đọc tự nhiên bằng tiếng Việt, đúng từ điển CONTEXT.md, không câu nào dùng «trợ lý»/«thông báo».
  human_override: Phan Le Manh 2026-09-26 — Đạt

- eval: E13
  run_id: muidggsql540
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_nguong
  verified_at: 2026-09-26T12:32:44Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [600.00ms]
    test-run: dropped crm_muidggsql540_test

- eval: E14
  run_id: muidgfpkz2lh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hcz_telemetry
  verified_at: 2026-09-26T12:32:44Z
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [318.00ms]
    test-run: dropped crm_muidgfpkz2lh_test

- eval: E15
  run_id: minted-hoi-crm-qua-zalo-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hcz_tai_lieu
  verified_at: 2026-09-26T12:32:44Z
  output: |
    ok: lo-trinh muc 7 dong 4
    ok: telemetry.md zalo_questions
    ok: merge-base khong co

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-hoi-crm-qua-zalo-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-26T12:32:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-hoi-crm-qua-zalo-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-26T12:32:44Z

- cmd: bun run lint:slop
  run_id: minted-hoi-crm-qua-zalo-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-26T12:32:44Z

- cmd: bunx turbo run build --force
  run_id: minted-hoi-crm-qua-zalo-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-26T12:32:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — mọi eval feature đều đỏ trên baseline ở round 1 (round này không đo lại)

## Variance

none — mọi eval chạy runs=1, không có eval ngẫu nhiên hay dao động (pass_rate) nào cần người quyết ở Gate 2.

## Iterations

Round 1: 18/18 eval (E1–E15, gồm E3b/E4b/E8b) đều PASS và 3/4 lệnh suite bắt buộc (`bun run test`, `bunx turbo run lint --force`, `bunx turbo run build --force`) xanh; lệnh suite thứ tư `bun run lint:slop` bị agent bỏ/chết giữa chừng, không có kết quả — verdict BLOCKED, cần chạy lại đúng lệnh đó với timeout dài hơn trước khi vòng này có thể lên PASS hay PENDING-JUDGMENT.
Round 2: 18/18 eval (E1–E15, gồm E3b/E4b/E8b) đều PASS và cả 4/4 lệnh suite bắt buộc (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) xanh — lệnh `lint:slop` từng BLOCKED ở vòng 1 nay chạy xong sạch. Verdict PENDING-JUDGMENT: hạng T3 của hợp đồng bắt buộc `human_override` trực tiếp của người trên mục phán đoán E12j trước khi lên PASS, dù panel ba lens (domain-correctness, operational-feasibility, spec-alignment) đều đồng thuận PASS.

### Re-pin lần 1 — 2026-09-26, do sau ký Cổng 2 hoi-crm-qua-zalo: gộp onehub 40d423bb; lính canh SESSION_PURPOSES 3→4
run_id: repin-20260926T132219Z-98927
sha: e5e7a723d991539cca951cb97b980b2836f44cf3 · suites: 4 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12j (E12j không khai paths)

### Re-pin lần 2 — 2026-09-27, do vòng hoan-thien-hoi-crm-qua-zalo sửa test và thước của hồ sơ
run_id: repin-20260927T005646Z-59185
sha: 4c2fea427e70e05e52c9bd769b0b8e56b16d7716 · suites: 4 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12j (E12j không khai paths)

### Re-pin lần 3 — 2026-09-27, do gộp onehub f2acca7f (#161, #162, #163)
run_id: repin-20260927T012809Z-43984
sha: bbf1b9586ccd5aedd6683419f70c38a3c57db290 · suites: 4 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12j (E12j không khai paths)

### Re-pin lần 4 — 2026-10-04, do khai paths lô 2: chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T075112Z-36317
sha: 11bd93cf9f3488a2ed6df5c432a362feff41a428 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12j · diff chạm vật đo ngoài làn máy: E12j — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 5 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T141023Z-83923
sha: 4893629a5ff0068f0b3a0fc09523a037c7c953b7 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12j · diff chạm vật đo ngoài làn máy: E12j — chưa chứng lại, đi vòng S4 delta
