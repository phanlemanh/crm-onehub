---
schema_version: 2
feature_slug: lo-trinh-nhieu-san-pham
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 156858cffd18dc0d3ab84b86bd789638cbbb48d4
human_signoff:
---

# Evidence Report: lo-trinh-nhieu-san-pham

Round 2. Mười tám eval đều xanh (ba eval E6, E7, E18 mang từ round 1 vì delta không chạm paths của chúng). Verdict tổng là REJECT vì một lệnh suite không gắn eval còn đỏ: `bun run test -- --filter=app --filter=@crm/ui`. Chi tiết ở mục «Lệnh fail không gắn eval».

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-7 | test | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-1 | ui-check | PASS |
| E15 | AC-8 | script | PASS |
| E16 | AC-9 | test | PASS |
| E17 | AC-9 | script | PASS |
| E18 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: mvfx5no86bkp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_lay_dau
  verified_at: 2026-10-20T00:02:10Z
  output: |
    test-run: dropped crm_mvfx5no86bkp_test

- eval: E2
  run_id: minted-lo-trinh-nhieu-san-pham-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_doc_du
  verified_at: 2026-10-20T00:02:10Z
  output: |
    Ran 2 tests across 1 file. [897.00ms]

- eval: E3
  run_id: mvfx5md56qc9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_nhip
  verified_at: 2026-10-20T00:02:10Z
  output: |
    test-run: dropped crm_mvfx5md56qc9_test

- eval: E4
  run_id: mvfx5mmi64cs
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_hong
  verified_at: 2026-10-20T00:02:10Z
  output: |
    test-run: dropped crm_mvfx5mmi64cs_test

- eval: E5
  run_id: minted-lo-trinh-nhieu-san-pham-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_cau_trang_thai
  verified_at: 2026-10-20T00:02:10Z
  output: |
    Ran 3 tests across 2 files. [2.26s]

- eval: E6
  run_id: minted-lo-trinh-nhieu-san-pham-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_quyen_may_chu
  verified_at: 2026-10-19T23:38:55Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-lo-trinh-nhieu-san-pham-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_quyen_trang
  verified_at: 2026-10-19T23:38:55Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-lo-trinh-nhieu-san-pham-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_danh_ba_may_chu
  verified_at: 2026-10-20T00:02:10Z
  output: |
    test-run: dropped crm_mvfx5ny9gf2d_test

- eval: E9
  run_id: minted-lo-trinh-nhieu-san-pham-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_danh_ba_trang
  verified_at: 2026-10-20T00:02:10Z
  output: |
    Ran 4 tests across 1 file. [892.00ms]

- eval: E10
  run_id: minted-lo-trinh-nhieu-san-pham-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_vong_doi_may_chu
  verified_at: 2026-10-20T00:02:10Z
  output: |
    test-run: dropped crm_mvfx5nfq0d3e_test

- eval: E11
  run_id: minted-lo-trinh-nhieu-san-pham-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_vong_doi_trang
  verified_at: 2026-10-20T00:02:10Z
  output: |
    Ran 2 tests across 1 file. [809.00ms]

- eval: E12
  run_id: mvfx5nthxfv5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_khuon
  verified_at: 2026-10-20T00:02:10Z
  output: |
    test-run: dropped crm_mvfx5nthxfv5_test

- eval: E13
  run_id: minted-lo-trinh-nhieu-san-pham-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_do_man
  verified_at: 2026-10-20T00:02:10Z
  screenshot: evidence/E13-step1.png
  observed: |
    Da Read ca 16 frame. 375 (step1-8): bo chon "Kit nghiem thu" nam DUOI dong mo ta, tren dong "Lay tu phanlemanh/acceptance-gate-kit · main luc 07:02 20/10/2026" - khong de len tieu de "Lo trinh"/"Roadmap", khong chong lan; timeline tai 56 viec, noi dung "Kit nghiem thu" xuat hien o bo chon va moc. Cai dat > San pham (375): 3 hang CRM (khai trong ma), Kit nghiem thu (cham xanh + chu "Da lay"/"Fetched"), Kho hong (cham do + chu "Khong thay tep lo trinh o nhanh nay"/"No roadmap file on this branch"); khong tran ngang, thanh tab cuon ngang binh thuong. Nen toi (step3,4,7,8): chu trang thai con doc ro tren nen den, chu xam sang, cham xanh/do ro; bo chon khong de tieu de. 1280 (step9-16): bo chon o goc phai tieu de, dong nguon "Lay tu .../acceptance-gate-kit · main luc 07:02 20/10/2026" (en: "Fetched from ... main at 10/20/2026, 07:02"), cac moc 2.26.0/2.27.0 voi chip Da giao/Shipped; Cai dat San pham: 3 hang, trang thai co chu (Da lay/Fetched, Khong thay tep.../No roadmap file...) kem cham mau, dong Kit nghiem thu ghi "lay luc 07:02 20/10/2026 · khuon ban 2". Ca sang/toi, vi/en giong nhau ve cau truc, khong co loi hien thi. Khop Expected.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-lo-trinh-nhieu-san-pham-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_do_man
  verified_at: 2026-10-20T00:02:10Z
  screenshot: evidence/E14-step1.png
  observed: |
    E14-step1.png (Lo trinh, kit, 1280 vi sang): tieu de "Lộ trình", bo chon goc phai "Kit nghiệm thu"; dong nguon "Lấy từ phanlemanh/acceptance-gate-kit · main lúc 07:04 20/10/2026"; chip "Chưa xong 2 · Đã giao 54 · Xếp lại sau 0 · Tất cả 56"; che do Mốc dang chon, cac moc "Phát hành 2.26.0..." va "Phát hành 2.27.0..." co dong "Lộ trình kit nghiệm thu — từ 2.24.0", "đã giao đủ 3 việc / 15 việc", cac thanh viec voi nhan "Đã giao" xanh. Trang day du noi dung, bo cuc giong trang CRM (cung thanh tim kiem, chip, nut Bảng/Bảng cột/Mốc, Lọc, Đã bác), khong o trong. E14-step2.png (ngan ho so cua mot viec): ngan mo ben phai voi tieu de "Kho khai một tệp kế hoạch, thẻ mở phiên chỉ ra việc kế và việc trễ", dong phu "N1 · Lộ trình kit nghiệm thu — từ 2.24.0 · nen", cac o Trạng thái Đã giao / Mốc / Lộ trình / Nhóm, tab Tổng quan - Số liệu, muc "Tóm tắt hồ sơ" co nhieu truong (Đã giao gì, Vì sao làm, Kết quả đo, Ai quyết) va "Việc đang chờ việc này". E14-step3.png (Cai dat > San pham): hang "Kit nghiệm thu" phanlemanh/acceptance-gate-kit · main · LO-TRINH.html · lấy lúc 07:04 20/10/2026 · khuôn bản 2 voi chip xanh "Đã lấy" (co chu); hang "Kho hỏng" chip do "Không thấy tệp lộ trình ở nhánh này"; hang CRM "khai trong mã". Tat ca khop Expected: Cai dat hien kit da lay kem gio, trang Lo trinh kit co noi dung day du giong CRM, ngan ho so mo co tieu de.
  network_observed: n-a (driver)

- eval: E15
  run_id: design-gate-116aa206f5, design-gate-d0270ddd0f
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_thiet_ke
  verified_at: 2026-10-20T00:02:10Z
  output: |
    design-gate --mode static chay tren tung tep tsx cua trang Lo trinh va Cai dat › San pham, khong tep nao bi chan.

- eval: E16
  run_id: mvfx5v31jqga
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_khoa
  verified_at: 2026-10-20T00:02:10Z
  output: |
    test-run: dropped crm_mvfx5v31jqga_test

- eval: E17
  run_id: minted-lo-trinh-nhieu-san-pham-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_khoa_quet
  verified_at: 2026-10-20T00:02:10Z
  output: |
    KET LUAN: DUNG

- eval: E18
  run_id: mvfwcn8zc6h4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_do
  verified_at: 2026-10-19T23:38:55Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-20T00:02:10Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 1
  verified_at: 2026-10-20T00:02:10Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-20T00:02:10Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-20T00:02:10Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-20T00:02:10Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-20T00:02:10Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-20T00:02:10Z

### Lệnh fail không gắn eval

Một lệnh: `bun run test -- --filter=app --filter=@crm/ui` (khối suite ở trên, không eval nào khai). Gói `app#test` đỏ ở tệp `apps/app/test/khung-trang-cai-dat-thanh-ben.dom.tsx`: 4 ca qua, 2 ca đỏ. Ca thấy được trong log là «thanh-ben: hang ngang kho hep co du muc theo thu tu nhom» (dòng 186): danh sách mục thanh bên Cài đặt nhận thêm mục «Sản phẩm» (sau «Theo dõi & phân tích», trước «SSO») mà bài kiểm chưa kỳ vọng. Mục Sản phẩm là hệ quả của tính năng này (AC-5, điều 4 của E9), nên bài kiểm cũ cần cập nhật theo thứ tự nhóm mới. Ba nhóm suite còn lại của gói test, lint, lint:slop và build đều xanh.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Eval xanh ca hai phia: none (không eval nào được liệt kê là không phân biệt). Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — không eval nào chạy nhiều lần (runs bằng 1 ở mọi eval, mọi eval deterministic).

## Iterations

Round 1: 18 eval xanh, 4 lệnh suite đỏ (api, app và @crm/ui, agent và auth và db, agent-okr và các gói còn lại). Returned to implementation (commit «vá suite»).
Round 2: 18 eval xanh (E6, E7, E18 carry-forward từ round 1; verified_at của các eval round 2 là mốc đóng round, suy từ giờ chụp khung E13 và E14). Ba trong bốn lệnh suite đỏ đã xanh; còn `--filter=app --filter=@crm/ui` đỏ ở `khung-trang-cai-dat-thanh-ben.dom.tsx` (2 ca). Returned to implementation.
