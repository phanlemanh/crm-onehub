---
schema_version: 2
feature_slug: bo-okr-mau
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 11bd93cf9f3488a2ed6df5c432a362feff41a428
human_signoff: Manh Phan 2026-09-28
---

# Evidence Report: bo-okr-mau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | ui-check | PASS |
| E15 | AC-14 | test | PASS |
| E16 | AC-15 | judgment | UNCERTAIN |
| E17 | AC-15 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-bo-okr-mau-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_to_chuc
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0cp7v59j_test

    __EXIT=0

- eval: E2
  run_id: minted-bo-okr-mau-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_toan_canh
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0c1rpoyd_test

    __EXIT=0

- eval: E3
  run_id: minted-bo-okr-mau-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_kieu_kr
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0cfag8vj_test

    __EXIT=0

- eval: E4
  run_id: minted-bo-okr-mau-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_sau_tuan
  verified_at: 2026-09-28T05:25:07Z
  output: |
    __EXIT=0

- eval: E5
  run_id: minted-bo-okr-mau-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_quy_3
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0d172akx_test

    __EXIT=0

- eval: E6
  run_id: minted-bo-okr-mau-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_moc
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0enxtwnb_test

    __EXIT=0

- eval: E7
  run_id: minted-bo-okr-mau-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_nap_lai
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0cq5znyr_test

    __EXIT=0

- eval: E8
  run_id: minted-bo-okr-mau-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_xoa
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0chguecr_test

    __EXIT=0

- eval: E9
  run_id: minted-bo-okr-mau-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_chan_production
  verified_at: 2026-09-28T05:25:07Z
  output: |
    Ran 7 tests across 1 file. [128.00ms]

    __EXIT=0

- eval: E10
  run_id: minted-bo-okr-mau-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_okr_that
  verified_at: 2026-09-28T05:25:07Z
  output: |
    __EXIT=0

- eval: E11
  run_id: minted-bo-okr-mau-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_bo_hong
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0pkogc45_test

    __EXIT=0

- eval: E12
  run_id: minted-bo-okr-mau-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_thu_tuc_that
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0r9kwyw3_test

    __EXIT=0

- eval: E13
  run_id: minted-bo-okr-mau-E13-r1
  exit_code: 0
  verifier: config:executors.test.bom_ca_gop_y
  verified_at: 2026-09-28T05:08:53Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval.

- eval: E14
  run_id: minted-bo-okr-mau-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_man
  verified_at: 2026-09-28T05:25:07Z
  screenshot: evidence/E14-step1-toan-canh.png
  observed: |
    Frame 1 (E14-toan-canh.png, .acceptance-runs/bo-okr-mau/evidence/E14-toan-canh.png, copied to _acceptance/bo-okr-mau/evidence/E14-step1-toan-canh.png): trang "Toàn cảnh OKR" của workspace "OneHub Center", bộ lọc kỳ "Quý 4 · mẫu", bảng "Theo đơn vị" liệt kê đúng 10 hàng phòng ban (thụt vào dưới 3 khối): Kinh doanh miền Bắc, Kinh doanh miền Nam, Chăm sóc đối tác, Marketing, Kho vận, Điều phối vận tải, Sản phẩm số, Tài chính, Nhân sự, Pháp chế — khớp chính xác tập 10 tên rút từ apps/api/scripts/okr-mau/cong-ty.json (phongBan[].ten). Khớp Expected bước 5.
    Frame 2 (E14-hop-tuan.png, .acceptance-runs/bo-okr-mau/evidence/E14-hop-tuan.png, copied to _acceptance/bo-okr-mau/evidence/E14-step2-hop-tuan.png): trang "OKR theo đơn vị" → phòng "Kinh doanh miền Bắc" (Phòng ban · Trưởng Nguyễn Thị Lan) → tab "Họp tuần" đang chọn, khối "Đáng bàn tuần này  1" hiện đúng 1 KR: "Số cuộc hẹn gặp đối tác mới đạt 60" (thuộc mục tiêu q4-kd-bac-1, kichBan "tut" trong cong-ty.json — đúng tập kịch bản tụt/bỏ), tiến độ 29%, nhãn "Tụt từ tự tin vừa xuống tự tin thấp". Khớp Expected bước 6.
    Cả hai frame khớp hoàn toàn Expected, không mâu thuẫn.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-bo-okr-mau-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_toan_canh
  verified_at: 2026-09-28T05:25:07Z
  output: |
    test-run: dropped crm_mukt0c1rpoyd_test

    __EXIT=0

- eval: E16
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  verified_at: 2026-09-28T05:25:07Z
  votes:
    - domain-correctness: FAIL — docs/setup.md's "Bộ OKR mẫu" section is strong on the operational checks: `--moc`/`--xoa`/`--tep` match `OKR_MAU.co` in cau-hinh.ts exactly, exit codes 2/3/4/5 match `OKR_MAU.ma` exactly with matching semantics, the phiên-đo reload instruction and the "bản xem trước dùng chung DB/api với production" rationale both match the design spec, and CONTEXT.md's "Bộ OKR mẫu" entry is consistent with docs/setup.md. But the same section uses the bare code "N1" ("Ca thật của N1 — OKR thật đã thay tên — đặt ở `apps/agent/evals/okr/ca-gop-y/that/`") with no CONTEXT.md dictionary entry and no plain-language gloss, which is exactly the "chữ tự đúc hay thuật ngữ chưa có mục từ điển" failure mode CONTEXT.md itself forbids ("Từ chưa có mục ở đó thì hoặc thêm mục trước, hoặc viết bằng chữ thường ai cũng hiểu").
    - operational-feasibility: PASS — docs/setup.md mục «Bộ OKR mẫu» tự đủ cho cả sáu việc hỏi: lệnh nạp/nạp lại, `--moc` ghim ngày, `--xoa` xoá, đăng nhập ba người mẫu bằng `dev:session`, chỗ đặt ca thật N1 (`apps/agent/evals/okr/ca-gop-y/that/`), và lý do bản xem trước không có bộ mẫu (dùng chung DB/API với production). Tên cờ (`--moc`, `--xoa`, `--tep`) và bốn mã thoát (2/3/4/5) trong docs khớp chính xác với `OKR_MAU.co` và `OKR_MAU.ma` ở `cau-hinh.ts`. Nạp vào phiên đo cũng có câu lệnh cụ thể (`bun run do:man --chay "bun run okr:mau && <lệnh đo>"`), khớp cơ chế `do:man --chay` đã tả trong cùng file. Không thấy từ ghép kỹ thuật tự đúc thiếu mục từ điển — «Bộ OKR mẫu» đã có mục ở CONTEXT.md khớp nội dung setup.md.
    - spec-alignment: UNCERTAIN — Phần cơ giới kiểm được trong phạm vi (cờ --moc/--xoa/--tep và mã thoát 2/3/4/5) khớp đúng giữa docs/setup.md và apps/api/scripts/okr-mau/{lenh,cau-hinh}.ts, và thuật ngữ "Bộ OKR mẫu" đã có mục từ điển ở CONTEXT.md khớp nội dung. Nhưng hai điểm không đủ căn cứ trong phạm vi input: (1) docs/setup.md nói mã thoát 2 nhận diện máy cục bộ qua "localhost, 127.0.0.1, ::1, hoặc ổ cắm unix", trong khi hằng số duy nhất thấy được (`OKR_MAU.mayCucBo` ở cau-hinh.ts) chỉ liệt "localhost", "127.0.0.1", "::1", "[::1]" — không có ổ cắm unix hay logic host/hostaddr, và file thật sự làm việc chặn (`chan.ts`) không nằm trong input nên không kiểm được; (2) các ví dụ đăng nhập làm người mẫu (nguyen-thi-lan, le-hai-dang, an-khanh-linh với vai và trạng thái cụ thể) không kiểm được vì `cong-ty.json` không nằm trong input, dù bản thiết kế có gợi ý phù hợp một phần (trưởng Pháp chế vai «chỉ OKR», chưa gửi tuần 6).
  rationale: Đề xuất tổng UNCERTAIN — hội đồng chia phiếu (1 FAIL, 1 PASS, 1 UNCERTAIN), không đồng thuận đủ để tự chốt; cần người xem tại Cổng 2.
  required_evidence:
    - Confirm CONTEXT.md (full file, already read in this eval) has no 'N1' entry anywhere — it does not — which is the concrete gap; adding an 'N1' entry to CONTEXT.md's dictionary, or rewriting the docs/setup.md line to spell out what N1 refers to in plain language instead of the bare code, would flip this to PASS.
    - apps/api/scripts/okr-mau/chan.ts (hàm kiemDuocNap) — để xác nhận logic có thật sự nhận diện «ổ cắm unix» và đọc tham số host/hostaddr trong chuỗi kết nối như docs/setup.md mô tả cho mã thoát 2, hay tài liệu nói rộng hơn code.
    - apps/api/scripts/okr-mau/cong-ty.json — để xác nhận ba email ví dụ trong docs/setup.md (nguyen-thi-lan@mau.onehub.test = trưởng KD miền Bắc, le-hai-dang@... = quản trị, an-khanh-linh@... = trưởng Pháp chế vai «chỉ OKR», chưa gửi Cập nhật tuần này) đúng là dữ liệu có trong bộ mẫu.
  human_override: Manh Phan 2026-09-28 — Đạt

- eval: E17
  run_id: minted-bo-okr-mau-E17-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_tai_lieu
  verified_at: 2026-09-28T05:25:07Z
  output: |
    Ran 2 tests across 1 file. [11.00ms]

    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-bo-okr-mau-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-28T05:25:07Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-okr-mau-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-28T05:25:07Z

- cmd: bun run lint:slop
  run_id: minted-bo-okr-mau-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-28T05:25:07Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-okr-mau-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-28T05:25:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 chưa chặn máy chủ ngoài trỏ qua tham số truy vấn host/hostaddr; E16 thiếu trường question theo khuôn bộ chấm — cả hai đã sửa (chan.ts thêm nhánh đọc tham số host/hostaddr; contract thêm question cho E16). Returned to implementation.
Round 2: Toàn bộ eval máy (E1–E12, E15, E17) và ui-check E14 PASS trên commit 0cc18664; E13 carry-forward từ round 1 (delta không chạm paths của eval). E16 (judgment) — hội đồng chia phiếu: domain-correctness FAIL (thiếu mục từ điển "N1" ở CONTEXT.md), operational-feasibility PASS, spec-alignment UNCERTAIN (thiếu chan.ts và cong-ty.json trong input để kiểm) — đề xuất tổng UNCERTAIN, chờ human_override ở Cổng 2. Verdict tổng: PENDING-JUDGMENT.

### Re-pin lần 1 — 2026-09-28, do gộp onehub (#184) sau chữ ký
run_id: repin-20260928T064127Z-26827
sha: 6f4df16c98497b4149bb0d84159da52316abd38b · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E14, E16 (E16 không khai paths)

### Re-pin lần 2 — 2026-10-04, do khai paths lô 2: chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T075112Z-36317
sha: 11bd93cf9f3488a2ed6df5c432a362feff41a428 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E14, E16 · diff chạm vật đo ngoài làn máy: E14, E16 — chưa chứng lại, đi vòng S4 delta
