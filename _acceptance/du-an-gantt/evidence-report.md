---
schema_version: 2
feature_slug: du-an-gantt
verdict: REJECT
failed_evals: [E13]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: edad49a0d4f7638db47c1e159c15d1b0cfad9dde
human_signoff:
---

# Evidence Report: du-an-gantt

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | ui-check | FAIL |
| E13b | AC-13 | script | PASS |
| E14 | AC-14 | judgment | PASS (đề xuất của hội đồng, chờ human_override) |
| E15 | AC-10 | script | PASS |

Lệnh fail không gắn eval: ui-check:E13 (gắn với E13, thoát khác 0). Không có lệnh fail nào khác.

## Evidence

- eval: E1
  run_id: minted-du-an-gantt-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_tao
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd831ucycqm_test

- eval: E1b
  run_id: minted-du-an-gantt-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_ds
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 5 tests across 1 file. [1226.00ms]

- eval: E2
  run_id: minted-du-an-gantt-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_gom
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd833de6oyt_test

- eval: E2b
  run_id: minted-du-an-gantt-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_khung
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 2 tests across 1 file. [973.00ms]

- eval: E3
  run_id: minted-du-an-gantt-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_bat_dau
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd8331epet0_test

- eval: E3b
  run_id: minted-du-an-gantt-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_ngay
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 1 test across 1 file. [1402.00ms]

- eval: E4
  run_id: minted-du-an-gantt-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_gantt_ui
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 1 test across 1 file. [913.00ms]

- eval: E4b
  run_id: minted-du-an-gantt-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_gantt
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 3 tests across 1 file. [877.00ms]

- eval: E5
  run_id: minted-du-an-gantt-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_keo_thanh
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd8332ieoes_test

- eval: E5b
  run_id: minted-du-an-gantt-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_keo
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 3 tests across 1 file. [1.58s]

- eval: E6
  run_id: minted-du-an-gantt-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_phu_thuoc
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd833fn8110_test

- eval: E6b
  run_id: minted-du-an-gantt-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_phai_cho
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 2 tests across 1 file. [1387.00ms]

- eval: E7
  run_id: minted-du-an-gantt-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_ngay_lam
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 8 tests across 2 files. [23.00ms]

- eval: E7b
  run_id: minted-du-an-gantt-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_tu_doi
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd833eegcfx_test

- eval: E8
  run_id: minted-du-an-gantt-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_moc
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd833im0jd0_test

- eval: E9
  run_id: minted-du-an-gantt-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_lich
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd83935j2ha_test

- eval: E9b
  run_id: minted-du-an-gantt-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_lich
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 3 tests across 1 file. [494.00ms]

- eval: E10
  run_id: minted-du-an-gantt-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_quyen
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd839fz2fni_test

- eval: E11
  run_id: minted-du-an-gantt-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_vong_doi
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd839escv7l_test

- eval: E11b
  run_id: minted-du-an-gantt-E11b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_man_dong
  verified_at: 2026-10-18T02:44:44Z
  output: |
    Ran 4 tests across 1 file. [1476.00ms]

- eval: E12
  run_id: mvd83abncc15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dg_thuoc
  verified_at: 2026-10-18T02:44:44Z
  output: |
    test-run: dropped crm_mvd83abncc15_test

- eval: E13
  run_id: minted-du-an-gantt-E13-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.dg_man
  verified_at: 2026-10-18T02:44:44Z
  screenshot: evidence/E13-step1.png
  observed: |
    Đã mở 11 ảnh (E13-step1..11). Hình ảnh khớp Expected: phạm vi «Của tôi» có dòng phụ «Dự án: …», ô Phạm vi đủ mục, bảng dự án có «x/y việc xong», khoảng ngày, mốc kế, người tạo và dòng «Đã đóng (1)»; Gantt có hàng Mốc hình thoi, cây thụt, mũi tên, cột T7/CN tô nền, nhóm «Chưa có lịch (1)» với «Đặt ngày»; mốc «Ký kết» trễ màu đỏ; sau dời lịch thanh việc sau dịch phải và có toast «Đã dời 2 việc»; khung việc, hộp hỏi đóng dự án, trang Lịch làm việc và hai ảnh 375 (Gantt cuộn ngang trong khung, danh sách dạng thẻ) đều đúng.
    Nguyên nhân REJECT không nằm ở ảnh: răng man.mjs báo 8 dòng lỗi console của app (Route "/[slug]/viec" gặp dữ liệu URL khi prerender/điều hướng) ở /viec?phamVi=tat-ca-du-an và /viec?phamVi=<id dự án>; dòng cuối của phiên đo là «du-an-gantt man: hong 1». Chi tiết ở evidence/E13-network.txt.
  network_observed: app-fail

- eval: E13b
  run_id: minted-du-an-gantt-E13b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dg_san_thiet_ke
  verified_at: 2026-10-18T02:44:44Z
  output: |
    dg san: 11 tep, 0 vi pham P0

- eval: E15
  run_id: minted-du-an-gantt-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dg_dot_bien
  verified_at: 2026-10-18T02:44:44Z
  output: |
    dot-bien: 21/21 dot bien chet

### Judgment

- eval: E14
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Hội đồng ba góc nhìn cùng đề xuất PASS, chờ người chốt (T3 đòi human_override trên mọi mục judgment).
  panel:
    - domain-correctness: PASS — CONTEXT.md có đủ mục «Dự án», «Việc của tôi», «Phạm vi», «Mốc (dự án)», «Phụ thuộc (việc)» và «Lịch làm việc» với các luật đã nêu. docs/api.md mục «Việc» có phần «Dự án» (dòng 618–655) nêu đủ duAn.list/lich, duAn.moc.*/phuThuoc.*, viec.doiLich/doiDuAn, luật dời khi chồng, nguồn vết gantt và tu-doi, và router lichLamViec.
    - operational-feasibility: PASS — CONTEXT.md có đủ các mục «Dự án», «Việc của tôi», «Phạm vi (màn Việc)», «Mốc (dự án)», «Phụ thuộc (việc)» và «Lịch làm việc», nội dung khớp từng ý trong câu hỏi. docs/api.md có mục con «Dự án» ngay dưới «Việc» (dòng 618–655), nêu đủ các thủ tục, luật dời khi chồng, nguồn vết gantt và tu-doi, và router lichLamViec. Tên duAn.moc.* và duAn.phuThuoc.* được ghi rõ là bí danh của các thủ tục phẳng duAn.mocTao… và duAn.phuThuocTao…
    - spec-alignment: PASS — Cả ba phần của câu hỏi đều có trong hai tệp. CONTEXT.md có mục «Dự án» và «Việc của tôi» (dòng 192–198, 229–239), «Mốc (dự án)» (247–249), «Phụ thuộc (việc)» (253–257) và «Lịch làm việc» (261–263), mỗi mục đủ các ý yêu cầu. docs/api.md có phần «### Dự án» (dòng 618–655), liệt kê duAn.list, duAn.lich, duAn.moc.*, duAn.phuThuoc.*, viec.doiLich, viec.doiDuAn, luật dời khi chồng, nguồn gantt và tu-doi (dòng 613–615), cùng router lichLamViec.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-18T02:44:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-18T02:44:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-18T02:44:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-du-an-gantt-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-18T02:44:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-du-an-gantt-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-18T02:44:44Z

- cmd: bun run lint:slop
  run_id: minted-du-an-gantt-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-18T02:44:44Z

- cmd: bunx turbo run build --force
  run_id: minted-du-an-gantt-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-18T02:44:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round 1 — baseline không đo lại round này (evals.yaml không đổi từ lần đo baseline cuối, round 1). Trường baseline của từng eval ghi n-a.

Eval không phân biệt (xanh trên cả HEAD lẫn baseline): không có.

E13 trượt ở đâu: mọi khung hình khớp Expected, và các phép tự đo của răng (mốc trễ, tự dời, 375 không cuộn ngang) đều báo đạt. Chỉ phép đếm lỗi console của app trả 8 lỗi, nên ui-check kết luận hỏng. Đây là lỗi thật phía app (trang /viec), không phải lỗi của harness.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E13 không đo được — man.mjs dòng 122 gửi duAnId null cho viec.create nên API từ chối 400, phiên đo thoát trước khi vẽ trang nào; các eval máy còn lại và bảy lệnh suite đều xanh. Verdict BLOCKED, cần sửa dữ liệu dựng của rang/man.mjs rồi chạy lại E13.
Round 2: E13 trượt — đã sửa man.mjs, 11 khung hình được lưu và khớp Expected, nhưng trang /viec (phạm vi tất cả dự án và phạm vi một dự án) in 8 lỗi console «Route "/[slug]/viec": Next.js encountered URL data during prerendering or a navigation». Hai mươi bốn eval còn lại và bảy lệnh suite xanh. Returned to implementation.
