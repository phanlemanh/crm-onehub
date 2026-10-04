---
schema_version: 2
feature_slug: thanh-vien-vao-dung
verdict: BLOCKED
failed_evals: [E20]
reason: E18 (design-gate --mode static trên 3 tệp của trang Thanh vien) không có kết quả — agent chạy eval bị skip/chết, không được tính là pass. Round này còn một eval đỏ: E20 (thước bang-thanh-vien-giu-hang thoát 1, một dòng SAI ở 375x812).
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 62f28f2452bf98b53688aec7aa5d8154d466390d
human_signoff:
---

# Evidence Report: thanh-vien-vao-dung

Round 2. Không có eval judgment nên không có panel chấm. Không có lệnh fail nào ngoài lệnh của E20 (đã gắn eval).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-8 | test | PASS |
| E13 | AC-9 | test | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-11 | script | PASS |
| E17 | AC-12 | ui-check | PASS |
| E18 | AC-12 | script | BLOCKED |
| E19 | AC-13 | script | PASS |
| E20 | AC-13 | script | FAIL |
| E21 | AC-13 | test | PASS |
| E22 | AC-14 | script | PASS |
| E23 | AC-14 | test | PASS |
| E24 | AC-9 | test | PASS |
| E25 | AC-1 | test | PASS |
| E26 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-thanh-vien-vao-dung-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test test/thanh-vien-vao-dung.spec.ts -t ten-mien: xanh
    test-run: dropped crm_mutpblk3oo95_test

- eval: E2
  run_id: minted-thanh-vien-vao-dung-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test test/thanh-vien-vao-dung.spec.ts -t ten-mien: xanh
    test-run: dropped crm_mutpblk3oo95_test

- eval: E3
  run_id: minted-thanh-vien-vao-dung-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test test/thanh-vien-vao-dung.spec.ts -t ten-mien: xanh
    test-run: dropped crm_mutpblk3oo95_test

- eval: E4
  run_id: minted-thanh-vien-vao-dung-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx: xanh

- eval: E5
  run_id: minted-thanh-vien-vao-dung-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test test/thanh-vien-vao-dung.spec.ts -t ten-mien: xanh
    test-run: dropped crm_mutpblk3oo95_test

- eval: E6
  run_id: minted-thanh-vien-vao-dung-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx: xanh

- eval: E7
  run_id: minted-thanh-vien-vao-dung-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test test/thanh-vien-vao-dung.spec.ts -t ten-mien: xanh
    test-run: dropped crm_mutpblk3oo95_test

- eval: E8
  run_id: minted-thanh-vien-vao-dung-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx: xanh

- eval: E9
  run_id: minted-thanh-vien-vao-dung-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_cho_phep_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    Ran 5 tests across 1 file. [1019.00ms]
    test-run: dropped crm_mutpbqxue8px_test

- eval: E10
  run_id: minted-thanh-vien-vao-dung-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx: xanh

- eval: E11
  run_id: minted-thanh-vien-vao-dung-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_cho_phep_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    Ran 5 tests across 1 file. [1019.00ms]
    test-run: dropped crm_mutpbqxue8px_test

- eval: E12
  run_id: minted-thanh-vien-vao-dung-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_cho_phep_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    Ran 5 tests across 1 file. [1019.00ms]
    test-run: dropped crm_mutpbqxue8px_test

- eval: E13
  run_id: minted-thanh-vien-vao-dung-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx: xanh

- eval: E14
  run_id: minted-thanh-vien-vao-dung-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_dung_lai_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test test/thanh-vien-vao-dung.spec.ts -t dung-lai: xanh

- eval: E15
  run_id: mutpbgs3jth2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_soi_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test test/soi-thanh-vien.spec.ts: xanh
    test-run: dropped crm_mutpbgs3jth2_test

- eval: E16
  run_id: minted-thanh-vien-vao-dung-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1b_soi_vat
  verified_at: 2026-10-04T10:51:44Z
  output: |
    KET LUAN: 7 DUNG, 0 SAI

- eval: E17
  run_id: minted-thanh-vien-vao-dung-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1b_do_man
  verified_at: 2026-10-04T10:51:44Z
  screenshot: evidence/E17-step1.png
  observed: |
    Đã mở bằng Read cả 6 ảnh chụp lúc 17:52-17:53. (1) the-quan-tri-1440: thẻ cuối trang Thành viên «Tên miền nội bộ» có mô tả, ô «Tên miền» xếp dọc giá trị «onehub.center, onehub.vn», «Lưu» ở góc phải tiêu đề thẻ, toast «Đã lưu tên miền nội bộ». (2) the-quan-tri-375: cùng thẻ ở 375 px, không tràn ngang (dòng hướng dẫn dưới bị nút dev Next che một phần, overlay dev chứ không phải lỗi trang). (3) the-loi-1440: ô viền đỏ chứa «onehub.center, gmail.com», dòng lỗi đỏ «gmail.com is a public mail domain, not one of ours. Remove it and save again.» nằm ngay dưới ô, «Lưu» sáng. (4) the-thanh-vien-1440: ô khoá, «Lưu» khoá, dòng lý do «Chỉ chủ sở hữu hoặc quản trị đổi được tên miền nội bộ.». (5) the-thanh-vien-375: ô khoá, «Lưu» khoá, dòng lý do đọc được, không tràn ngang. (6) hop-da-la-thanh-vien-1440: hộp «Cho phép một địa chỉ» còn mở với MARCUS@TRYCOMP.AI, thông điệp đỏ «That person is already a member. Change their role in the members table.» dưới ô, nút «Thôi»/«Cho phép». Tất cả khớp Expected, không mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    DUNG 1440: luu -> DB staffEmailDomains = onehub.center,onehub.vn
    DUNG 1440: o hien onehub.center, onehub.vn
    DUNG 1440: «Lưu» tat lai (true)
    DUNG 375 quan tri: tran ngang 0px (document va main)
    DUNG 375 thanh vien: tran ngang 0px (document va main)
    DUNG 1440: hop giu mo (true)
    DUNG don: cot staffEmailDomains tra ve null (truoc null)
    KET LUAN: 17 DUNG, 0 SAI — ma thoat 0

- eval: E18
  status: BLOCKED
  verifier: config:executors.script.r1b_san_thiet_ke
  verified_at: 2026-10-04T10:51:44Z
  output: |
    design-gate --mode static trên 3 tệp (page.tsx, cho-phep-dia-chi.tsx, ten-mien-noi-bo.tsx): agent bị skip/chết — không có kết quả, không được tính là pass.

- eval: E19
  run_id: minted-thanh-vien-vao-dung-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvhk_do_khoi
  verified_at: 2026-10-04T10:51:44Z
  output: |
    phien-do: xong — mã 0

- eval: E20
  run_id: minted-thanh-vien-vao-dung-E20-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tvhk_ttv_do_bang
  verified_at: 2026-10-04T10:51:44Z
  output: |
    DUNG 375x812: bang cao 216px, 0 hang bi cat, tran trong 0px
    SAI 375x812: con lan cuon trang 600px va toi duoc loi moi cuoi (false)
    DUNG 375x812: chi mot vung cuon — tai lieu tran doc 0px
    DUNG 1440: bang Khoa API van lap day khung trang (lech day 0px)
    KET LUAN: 29 DUNG, 1 SAI — ma thoat 1
    phien-do: xong — mã 1

- eval: E21
  run_id: minted-thanh-vien-vao-dung-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_khong_hoi_quy_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    domain-nha-tach.spec.ts, workspace-thanh-vien.spec.ts, go-thanh-vien.spec.ts: 0 fail

- eval: E22
  run_id: minted-thanh-vien-vao-dung-E22-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1b_tu_dien
  verified_at: 2026-10-04T10:51:44Z
  output: |
    KET LUAN: 9 DUNG, 0 SAI

- eval: E23
  run_id: minted-thanh-vien-vao-dung-E23-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_messages_guard
  verified_at: 2026-10-04T10:51:44Z
  output: |
    Ran 128 tests across 1 file. [878.00ms]

- eval: E24
  run_id: minted-thanh-vien-vao-dung-E24-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_cho_phep_api
  verified_at: 2026-10-04T10:51:44Z
  output: |
    Ran 5 tests across 1 file. [1019.00ms]
    test-run: dropped crm_mutpbqxue8px_test

- eval: E25
  run_id: minted-thanh-vien-vao-dung-E25-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx: xanh

- eval: E26
  run_id: minted-thanh-vien-vao-dung-E26-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T10:51:44Z
  output: |
    bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx: xanh

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-04T10:51:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-04T10:51:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-04T10:51:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-04T10:51:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-thanh-vien-vao-dung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-04T10:51:44Z

- cmd: bun run lint:slop
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-04T10:51:44Z

- cmd: bunx turbo run build --force
  run_id: minted-thanh-vien-vao-dung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-04T10:51:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi).

Eval khong-phan-biet (pass tren ca HEAD lan baseline — chung minh harness chu khong phai feature; viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y): E19, E20, E21, E23. Cac lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong co eval ngau nhien).

## Iterations

Round 1: REJECT — lenh suite `bun run test -- --filter=api` do (vai-chi-okr.spec chua khai workspace.setStaffDomains). Returned to implementation.
Round 2: BLOCKED — E18 khong co ket qua (agent bi skip/chet); E20 do: thuoc bang-thanh-vien-giu-hang bao mot dong SAI o 375x812 ("con lan cuon trang ... va toi duoc loi moi cuoi" la false). Lenh suite round nay xanh het.
