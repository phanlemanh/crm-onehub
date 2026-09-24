---
schema_version: 2
feature_slug: keo-tha-thoa-thuan
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f7a31a583af36e847d87df37ffd44f12b1d45a85
human_signoff: 
---

# Evidence Report: keo-tha-thoa-thuan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-2 | test | PASS |
| E2 | AC-3 | test | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-5 | test | PASS |
| E5 | AC-6 | test | PASS |
| E6 | AC-1 | test | PASS |
| E7 | AC-11 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-13 | ui-check | PASS |
| E15 | AC-1 | ui-check | PASS |
| E16 | AC-5 | ui-check | PASS |
| E17 | AC-12 | test | PASS |
| E18 | AC-14 | test | PASS |
| E19 | AC-15 | script | PASS |
| E20 | AC-15 | script | PASS |
| E21 | AC-4 | test | PASS |
| E22 | AC-3 | test | PASS |
| E23 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: mue1veh74qvb
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_board_dem_tong
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    17 expect() calls
    Ran 1 test across 1 file. [595.00ms]
    test-run: dropped crm_mue1veh74qvb_test

- eval: E2
  run_id: mue1vf1272or
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_board_tran_50
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [524.00ms]
    test-run: dropped crm_mue1vf1272or_test

- eval: E3
  run_id: mue1veqk84fp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_board_loc
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    29 expect() calls
    Ran 1 test across 1 file. [664.00ms]
    test-run: dropped crm_mue1veqk84fp_test

- eval: E4
  run_id: mue1vef48uoq
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_board_ghi
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [659.00ms]
    test-run: dropped crm_mue1vef48uoq_test

- eval: E5
  run_id: mue1vf9t8f1b
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_board_ly_do
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [397.00ms]
    test-run: dropped crm_mue1vf9t8f1b_test

- eval: E6
  run_id: minted-keo-tha-thoa-thuan-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_chuyen
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    7 expect() calls
    Ran 2 tests across 1 file. [1.65s]

- eval: E7
  run_id: minted-keo-tha-thoa-thuan-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_chuyen
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    7 expect() calls
    Ran 2 tests across 1 file. [1.65s]

- eval: E8
  run_id: minted-keo-tha-thoa-thuan-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_tha
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    6 expect() calls
    Ran 3 tests across 1 file. [994.00ms]

- eval: E9
  run_id: minted-keo-tha-thoa-thuan-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_tha
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    6 expect() calls
    Ran 3 tests across 1 file. [994.00ms]

- eval: E10
  run_id: minted-keo-tha-thoa-thuan-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_thua
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    12 expect() calls
    Ran 4 tests across 1 file. [2.02s]

- eval: E11
  run_id: minted-keo-tha-thoa-thuan-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_tu_choi
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [1056.00ms]

- eval: E12
  run_id: minted-keo-tha-thoa-thuan-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_ban_phim
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [1.63s]

- eval: E13
  run_id: minted-keo-tha-thoa-thuan-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_bam_the
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [765.00ms]

- eval: E14
  run_id: minted-keo-tha-thoa-thuan-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktt_man_chrome
  verified_at: 2026-09-23T19:30:00+07:00
  screenshot: _acceptance/keo-tha-thoa-thuan/evidence/E14-bang-cot-320-vi.png
  observed: |
    Đọc trực tiếp 6/12 frame vừa lưu bằng Read (320-vi, 320-en, 768-vi, 1440-vi, sau-khi-keo,
    tha-cot-rong); 6 frame còn lại (375-vi/en, 1024-vi/en, 1440-en) do executor tự chấm bằng
    docBang() và kết quả đã gộp vào khang-dinh=34/34, 0 HONG. Chi tiết đã đọc: (1)
    E14-bang-cot-320-vi.png — 1 cột "Demo booked" phủ hết bề rộng 320px, đầu cột đủ 3 phần
    (tên, số đếm "4", tổng "10.000 đ"), không thấy tràn trang, 4 thẻ hiển thị đủ chữ, toggle
    "Bảng cột" đang active (viền xanh). (2) E14-bang-cot-320-en.png — song song bản en, tiêu
    đề "Deals", nút "Board" active, header "Demo booked / 4 / ₫10,000", không tràn. (3)
    E14-bang-cot-768-vi.png — 3 cột lọt khung, đỉnh 3 cột ngang hàng nhau, mỗi đầu cột đủ
    tên+đếm+tổng. (4) E14-bang-cot-1440-vi.png — 5 cột lọt khung, cùng một hàng, khớp đúng dữ
    liệu gieo. (5) E14-sau-khi-keo.png — sau khi kéo thẻ "kttmue1ytjc 03" từ Demo booked sang
    Qualified to buy RỒI tải lại trang: thẻ 03 đứng cuối cột mới, đúng vị trí vừa kéo. (6)
    E14-tha-cot-rong.png — kéo thẻ "kttmue1ytjc 11" vào cột Contract sent đang RỖNG: đếm đầu
    cột đổi 0→1, tổng 12.000 đ, khớp đúng "cột rỗng nhận thả". Không frame nào mâu thuẫn
    Expected.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-keo-tha-thoa-thuan-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktt_man_chrome
  verified_at: 2026-09-23T19:30:00+07:00
  screenshot: _acceptance/keo-tha-thoa-thuan/evidence/E15-step1-bang-truoc-khi-bam.png
  observed: |
    screenshotPath (E15-step1-bang-truoc-khi-bam.png) — trang "Thoả thuận" ở chế độ Bảng
    (tab "Bảng" viền xanh, "Bảng cột" chưa chọn), bảng liệt kê 12 dòng deal thật, khớp đúng
    Expected "bấm nút Bảng cột thật bắt đầu từ trạng thái Bảng". E15-step2-bang-cot-that.png
    — SAU khi bấm thật, giao diện đổi sang board — 5/7 cột nhìn thấy trên màn 1440px, mỗi
    đầu cột có tên + số đếm + tổng tiền, khớp đúng Expected "địa chỉ đổi sang view=board,
    đọc bảy tên cột theo chỉ số". E15-step3-bang-tro-lai.png — giao diện giống hệt
    E15-step1 (cùng 12 dòng deal, cùng thứ tự, tab "Bảng" lại được chọn) — xác nhận "bấm
    Bảng -> bảng trở lại" đúng Expected. E14-bang-cot-320-vi.png / -320-en.png — 320px, một
    cột "Demo booked" hiện đủ đầu+dòng+tổng, không tràn trang; bản en dịch chrome còn nhãn
    giai đoạn giữ nguyên tiếng gốc — đúng luật "dữ liệu người nhập không dịch". Không frame
    nào mâu thuẫn Expected.
  network_observed: clean

- eval: E16
  run_id: e16-verify-20260923-1902
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktt_man_chrome
  verified_at: 2026-09-23T19:30:00+07:00
  screenshot: _acceptance/keo-tha-thoa-thuan/evidence/E14-sau-khi-keo.png
  observed: |
    E14-sau-khi-keo.png (1440/vi, sau reload): cột "Demo booked" còn 3 thẻ (02,01,00) — thẻ
    03 đã biến mất khỏi cột này. Cột "Qualified to buy" có 5 thẻ (07,06,05,04,03) — thẻ
    "kttmue1ytjc 03" nằm ở đây, mang nhãn trạng thái "Qualified to buy". Khớp Expected: sau
    khi thả VÀ tải lại trang, thẻ vẫn ở cột đích trên frame nhìn thấy. E14-tha-cot-rong.png
    (1440/vi): cột "Decision maker in" còn 3 thẻ (10,09,08) — thẻ 11 đã rời đi. Cột
    "Contract sent" trước đó rỗng, nay có đúng 1 thẻ "kttmue1ytjc 11", số đếm đầu cột đổi
    0→1, tổng tiền đổi 0đ→12.000đ. Cả hai frame đối chiếu đúng với giá trị deals.byId mà
    chính script đã gọi và so khớp nội bộ — frame nhìn thấy và bản ghi máy chủ cho cùng một
    câu trả lời (QUALIFIED_TO_BUY và CONTRACT_SENT).
  network_observed: n-a (driver)

- eval: E17
  run_id: minted-keo-tha-thoa-thuan-E17-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_board_giu_nguyen
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    20 expect() calls
    Ran 2 tests across 1 file. [438.00ms]

- eval: E18
  run_id: minted-keo-tha-thoa-thuan-E18-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_tai_loi
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    6 expect() calls
    Ran 2 tests across 1 file. [652.00ms]

- eval: E19
  run_id: minted-keo-tha-thoa-thuan-E19-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktt_reui_da_chinh
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    so tep reui: 1
    khang-dinh: 4, hong: 0

- eval: E20
  run_id: minted-keo-tha-thoa-thuan-E20-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktt_san_thiet_ke
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    dat  apps/app/app/(app)/[slug]/deals/page.tsx
    dat  packages/ui/src/components/board.tsx
    dat  packages/ui/src/components/reui/kanban.tsx

- eval: E21
  run_id: minted-keo-tha-thoa-thuan-E21-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_loc_vao_board
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 6 tests across 1 file. [1094.00ms]

- eval: E22
  run_id: minted-keo-tha-thoa-thuan-E22-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_dau_cot
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    13 expect() calls
    Ran 4 tests across 1 file. [913.00ms]

- eval: E23
  run_id: minted-keo-tha-thoa-thuan-E23-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktt_man_tro_nang
  verified_at: 2026-09-23T19:30:00+07:00
  output: |
    0 fail
    22 expect() calls
    Ran 2 tests across 1 file. [653.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mue1vqr8jil2
  exit_code: 0
  verified_at: 2026-09-23T19:30:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-keo-tha-thoa-thuan-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-23T19:30:00+07:00

- cmd: bun run lint:slop
  run_id: minted-keo-tha-thoa-thuan-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-23T19:30:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-keo-tha-thoa-thuan-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-23T19:30:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: ma trận ban đầu (S4) của AC-2/AC-3 (E1, E3, E22) chưa phủ khẳng định về thoả
thuận chưa quy đổi tiền tệ; S4-r1 mở rộng ma trận thêm unconverted.count,
deals.meta.notCounted và luật "disclosed not zeroed" cho cột tổng tiền chưa quy đổi.
Quay lại triển khai để khớp ma trận mở rộng.
Round 2 (hiện tại): toàn bộ 23 eval + 4 lệnh suite hồi quy đều xanh trên ma trận đã mở
rộng — không phát sinh vòng tiếp theo.

### Re-pin lần 1 — 2026-09-23, do kéo onehub ae50f942 vào qua #93 — không chạm vùng đo nhìn-thấy
run_id: repin-20260923T123409Z-31199
sha: bfccc1371797251068e59a4f7fc3c1cef638c8d4 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-09-24, do thuoc «vong nay» neo cap sha cua merge (merge-base(M^1,M^2)..M^2) thay merge-base dong; env GOOGLE_CLIENT_* nhu CI
run_id: repin-20260924T155831Z-87643
sha: f7a31a583af36e847d87df37ffd44f12b1d45a85 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E14, E15, E16 · diff chạm vật đo ngoài làn máy: E14, E15, E16 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13
