---
schema_version: 2
feature_slug: bo-okr-mau
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d1de00b61066162d0ce27a179a7c1f429aadf4c4
human_signoff:
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
  run_id: minted-bo-okr-mau-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_to_chuc
  verified_at: 2026-09-28T05:08:53Z
  output: |
    test-run: dropped crm_muksfxwye93b_test

    __EXIT=0

- eval: E2
  run_id: minted-bo-okr-mau-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_toan_canh
  verified_at: 2026-09-28T05:08:53Z
  output: |
    test-run: dropped crm_muksfvi6q859_test

    __EXIT=0

- eval: E3
  run_id: minted-bo-okr-mau-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_kieu_kr
  verified_at: 2026-09-28T05:08:53Z
  output: |
    test-run: dropped crm_muksfxgaqfdy_test

    __EXIT=0

- eval: E4
  run_id: minted-bo-okr-mau-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_sau_tuan
  verified_at: 2026-09-28T05:08:53Z
  output: |
    test-run: dropped crm_muksfyyqftg4_test

    __EXIT=0

- eval: E5
  run_id: minted-bo-okr-mau-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_quy_3
  verified_at: 2026-09-28T05:08:53Z
  output: |
    __EXIT=0

- eval: E6
  run_id: minted-bo-okr-mau-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_moc
  verified_at: 2026-09-28T05:08:53Z
  output: |
    test-run: dropped crm_muksfwce09gc_test

    __EXIT=0

- eval: E7
  run_id: minted-bo-okr-mau-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_nap_lai
  verified_at: 2026-09-28T05:08:53Z
  output: |
    test-run: dropped crm_muksfvwza5ba_test

    __EXIT=0

- eval: E8
  run_id: minted-bo-okr-mau-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_xoa
  verified_at: 2026-09-28T05:08:53Z
  output: |
    __EXIT=0

- eval: E9
  run_id: minted-bo-okr-mau-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_chan_production
  verified_at: 2026-09-28T05:08:53Z
  output: |
    Ran 5 tests across 1 file. [123.00ms]

    __EXIT=0

- eval: E10
  run_id: minted-bo-okr-mau-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_okr_that
  verified_at: 2026-09-28T05:08:53Z
  output: |
    __EXIT=0

- eval: E11
  run_id: minted-bo-okr-mau-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_bo_hong
  verified_at: 2026-09-28T05:08:53Z
  output: |
    test-run: dropped crm_muksg9cjfqag_test

    __EXIT=0

- eval: E12
  run_id: minted-bo-okr-mau-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_thu_tuc_that
  verified_at: 2026-09-28T05:08:53Z
  output: |
    __EXIT=0

- eval: E13
  run_id: minted-bo-okr-mau-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_ca_gop_y
  verified_at: 2026-09-28T05:08:53Z
  output: |
    Ran 4 tests across 1 file. [48.00ms]

    __EXIT=0

- eval: E14
  run_id: minted-bo-okr-mau-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_man
  verified_at: 2026-09-28T05:08:53Z
  screenshot: .acceptance-runs/bo-okr-mau/evidence/E14-toan-canh.png
  observed: |
    E14-toan-canh.png (đọc trực tiếp, 1440px): màn "Toàn cảnh OKR", kỳ "Quý 4 · mẫu",
    bảng "Theo đơn vị" liệt kê đủ 10 dòng phòng ban thụt vào dưới 3 khối: Kinh doanh
    miền Bắc, Kinh doanh miền Nam, Chăm sóc đối tác, Marketing (Khối Kinh doanh); Kho
    vận, Điều phối vận tải, Sản phẩm số (Khối Vận hành); Tài chính, Nhân sự, Pháp chế
    (Khối Hỗ trợ) — khớp 100% với 10 tên trong bo.phongBan của cong-ty.json (đối chiếu
    tay bằng node), không thiếu không thừa. E14-hop-tuan.png: màn "OKR theo đơn vị" >
    tab "Họp tuần" của "Kinh doanh miền Bắc" (Trưởng Nguyễn Thị Lan), khối "Đáng bàn
    tuần này" hiện đúng 1 dòng KR "Số cuộc hẹn gặp đối tác mới đạt 60" gắn nhãn "Tụt
    từ tự tin vừa xuống tự tin thấp" — khớp KR q4-kd-bac-1-k2 (kịch bản tut) trong
    cong-ty.json, KR duy nhất kịch bản tut/bo của phòng này. Cả hai ảnh vừa được script
    tự sinh lại lúc 12:11 (mtime mới), không phải ảnh cũ để lại từ trước.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-bo-okr-mau-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_toan_canh
  verified_at: 2026-09-28T05:08:53Z
  output: |
    test-run: dropped crm_muksfvi6q859_test

    __EXIT=0

- eval: E16
  judged_by: judge-panel (domain-correctness, operational-feasibility, spec-alignment — fresh context)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — docs/setup.md và CONTEXT.md trả lời đủ phần quy trình (nạp máy dev, nạp qua `do:man --chay`, `--moc`, `--xoa`, ba lệnh `dev:session`, chỗ đặt ca thật ở `apps/agent/evals/okr/ca-gop-y/that/`, lý do preview không có bộ mẫu); nhưng `okr-mau.ts` được cấp chỉ là điểm vào 12 dòng gọi `kiemDuocNap` rồi dynamic-import `./okr-mau/lenh`. Cả `okr-mau/lenh.ts` (nơi parse `--moc/--xoa/--tep`) lẫn `okr-mau/cau-hinh.ts` (nơi định trị số `OKR_MAU.ma.*`) không nằm trong Input, nên không đủ căn cứ xác nhận tên cờ và mã thoát tài liệu nêu khớp đúng với mã.
    - operational-feasibility: UNCERTAIN — Các thao tác vận hành (nạp máy dev, nạp phiên đo, ghim ngày, xoá, đăng nhập người mẫu, chỗ đặt ca thật N1, lý do preview không có bộ mẫu) đều tự đủ trong docs/setup.md và khớp CONTEXT.md; nhưng file duy nhất trong phạm vi (okr-mau.ts) chỉ xác nhận mã thoát 2 (qua `OKR_MAU.ma.chan`) — các cờ `--moc/--xoa/--tep` và mã thoát 3/4/5 nằm trong `okr-mau/lenh.ts` và `okr-mau/cau-hinh.ts`, không có trong Input nên chỉ so được với bản thiết kế, không phải với mã đã chạy.
    - spec-alignment: UNCERTAIN — Bảy phần tự-phục-vụ mà AC-15 hỏi đều có mặt nguyên văn trong docs/setup.md, không thấy thuật ngữ tự đúc hay thiếu mục CONTEXT.md; nhưng phần "khớp tên cờ và mã thoát của okr-mau.ts" không đối chiếu được vì okr-mau.ts chỉ lộ mã thoát của bước chặn (mã 2) rồi import động `./okr-mau/lenh` — nơi thật sự parse cờ và phát mã thoát 3/4/5 — không nằm trong Input của E16.
  rationale: Ba lăng kính đều UNCERTAIN vì cùng một khoảng trống bằng chứng — phạm vi Input của E16 chỉ có okr-mau.ts (điểm vào 12 dòng) và hai tài liệu, thiếu okr-mau/lenh.ts (nơi parse --moc/--xoa/--tep) và okr-mau/cau-hinh.ts (nơi định trị số OKR_MAU.ma.*), nên không đối chiếu được tên cờ và mã thoát tài liệu nêu với mã lệnh thật.
  required_evidence:
    - Nội dung apps/api/scripts/okr-mau/lenh.ts (hàm parse tham số dòng lệnh) — đối chiếu tên cờ --moc/--xoa/--tep và mã thoát 3/4/5 cho từng ca lỗi mô tả trong docs/setup.md
    - Nội dung apps/api/scripts/okr-mau/cau-hinh.ts (đối tượng OKR_MAU.ma) — đối chiếu giá trị số mã thoát 2/3/4/5 với docs/setup.md
  human_override:  # chi nguoi ghi

- eval: E17
  run_id: minted-bo-okr-mau-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.bom_tai_lieu
  verified_at: 2026-09-28T05:08:53Z
  output: |
    Ran 2 tests across 1 file. [14.00ms]

    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-bo-okr-mau-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T05:08:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-okr-mau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T05:08:53Z

- cmd: bun run lint:slop
  run_id: minted-bo-okr-mau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T05:08:53Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-okr-mau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T05:08:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt).

## Variance

none — every multi-run eval is uniform.

## Iterations
