---
schema_version: 2
feature_slug: danh-sach-keo-chung
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0579fd87835e43dc5bfc5d5848f81e72cfe9cc07
human_signoff:
---

# Evidence Report: danh-sach-keo-chung

Round 1. Cả 13 eval máy đều đạt, nhưng vòng bị REJECT vì review tìm thấy một lỗi mức high nằm trong hợp đồng (AC-7: hoàn tác lưu trữ giai đoạn chỉ dùng được một lần). Chi tiết ở review-findings.md, mục «Trong hợp đồng».

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | ui-check | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-danh-sach-keo-chung-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dsk_dang_luu
  verified_at: 2026-10-08T05:37:26Z
  output: |
    Ran 2 tests across 1 file. [1030.00ms]

- eval: E2
  run_id: minted-danh-sach-keo-chung-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dsk_loi
  verified_at: 2026-10-08T05:37:26Z
  output: |
    Ran 2 tests across 1 file. [1449.00ms]

- eval: E3
  run_id: minted-danh-sach-keo-chung-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dsk_hoan_tac
  verified_at: 2026-10-08T05:37:26Z
  output: |
    Ran 3 tests across 1 file. [1354.00ms]

- eval: E4
  run_id: minted-danh-sach-keo-chung-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dsk_do_man
  verified_at: 2026-10-08T05:37:26Z
  screenshot: evidence/sap-giai-doan-1440.png
  observed: |
    Frame 1, sap-giai-doan-1440.png: the "Giai đoạn thoả thuận" settings page at 1440 px. The "Đang mở" group lists Qualified to buy, Demo booked, Decision maker in, Contract sent, so the second stage is now first. Each row has a drag handle and a hint line "Kéo để sắp thứ tự, hoặc dùng phím Space rồi mũi tên lên xuống". At the bottom-left a toast reads "Đã lưu thứ tự mới" with a "Hoàn tác" button. This matches Expected.

    Frame 2, hoan-tac-giai-doan-1440.png: the same page, same order, Qualified to buy first. The toast now reads "Đã trả thứ tự cũ" and no "Hoàn tác" button is shown. The drag handles still look normal and the rows are not greyed out. This matches the AC-3 undo toast and the log's "same order after undo and reload".

    Frame 3, sap-to-chuc-1440.png: the "Tổ chức" page. The "Bộ phận · 2" list shows "Đo E3 ... bộ phận 1" above "bộ phận 0", each with a drag handle, plus the keyboard hint line. A toast reads "Đã lưu thứ tự mới" with a "Hoàn tác" button, so Tổ chức now has Hoàn tác (the red-direction case). This matches Expected.

    Frame 4, hoan-tac-to-chuc-1440.png: the "Tổ chức" page with the same order, bộ phận 1 above bộ phận 0. The toast reads "Đã trả thứ tự cũ". This matches the log, where the order after Hoàn tác and reload is "bộ phận 1 | bộ phận 0" (the state before this drag).

    No frame contradicts Expected.
  network_observed: n-a (driver)

- eval: E5
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dsk_luu_loi
  verified_at: 2026-10-08T05:37:26Z
  output: |
    Ran 7 tests across 2 files. [2.39s]

- eval: E6
  run_id: minted-danh-sach-keo-chung-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dsk_mot_thanh_phan
  verified_at: 2026-10-08T05:37:26Z
  output: |
    rang/mot-thanh-phan.mjs --tu-thu roi chay that: thoat sach

- eval: E7
  run_id: minted-danh-sach-keo-chung-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dsk_gd_luu_tru_ngay
  verified_at: 2026-10-08T05:37:26Z
  output: |
    Ran 5 tests across 1 file. [1.99s]

- eval: E8
  run_id: minted-danh-sach-keo-chung-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dsk_gd_luu_tru_chuyen
  verified_at: 2026-10-08T05:37:26Z
  output: |
    Ran 1 test across 1 file. [1446.00ms]

- eval: E9
  run_id: minted-danh-sach-keo-chung-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dsk_gd_da_luu_tru
  verified_at: 2026-10-08T05:37:26Z
  output: |
    Ran 4 tests across 1 file. [1399.00ms]

- eval: E10
  run_id: minted-danh-sach-keo-chung-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dsk_api_khoi_phuc
  verified_at: 2026-10-08T05:37:26Z
  output: |
    giai-doan.spec.ts (khoi-phuc) va giai-doan-quyen.spec.ts chay qua bun run test, thoat sach

- eval: E11
  run_id: minted-danh-sach-keo-chung-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dsk_do_man
  verified_at: 2026-10-08T05:37:26Z
  screenshot: evidence/E11-step1.png
  observed: |
    Da mo bang Read ca 3 anh.
    1) luu-tru-khoi-phuc-1440.png (1440, giao dien toi, trang Giai doan thoa thuan): the "Dang mo" co 5 hang: Qualified to buy, Demo booked, Decision maker in, Contract sent, "Đo E3 muz3w3vx khôi phục" (0 thoa thuan) — hang cuoi the la giai doan vua khoi phuc, khop Expected. Duoi goc trai co hai toast chong: "Đã lưu trữ «Đo E3 ... khôi phục»" co nut "Hoàn tác" va "Đã khôi phục «Đo E3 muz3w3vx khôi phục»". Khong co hop thoai hoi nao tren man. Muc gap "Đã lưu trữ (n)" nam duoi vung nhin cua anh nen khong thay trong khung; viec no xuat hien/mo duoc do bang DOM (waitForSelector archived-list, nut Khoi phuc bam duoc, hang hien lai).
    2) hoan-tac-luu-tru-1440.png: the "Dang mo" hien Qualified to buy, Demo booked, Decision maker in, Contract sent, "Đo E3 muz3w3vx khôi phục" (hang con lai tu kich ban truoc); hang giai doan "hoàn tác" CHUA hien trong khung nay, o day cuoi man hinh co dong toast "Đã khôi phục ..." dang truot vao, mo nhat. Day la khung chuyen tiep chup truoc khi tai lai; khong mau thuan Expected (Expected chi doi thu tu sau tai lai), nhung anh khong tu no chung minh thu tu; bang chung la dong log DOM sau tai lai (truoc = sau, giai doan o vi tri 2). Dang ghi nhan: toast "Đã khôi phục" xuat hien truoc khi hang hien lai tren the (tre chop nhoang).
    3) da-luu-tru-375.png (375x812): the Chot duoc, Khong thanh day du, khong tran ngang; muc gap "Đã lưu trữ (1)" mo ra, dong "E3 muz3w3vx 375 / ... mo" va nut "Khôi phục" nam trong khung (bi bieu tuong tron nổi goc phai duoi che mot phan o anh, nhung so do left 272 / right 346 <= 375 va khong tran ngang). Khop Expected ve hop muc gap va nut trong 375; nut "Khôi phục" thay gan tron trong anh (phan cuoi bi widget nổi che).
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-danh-sach-keo-chung-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dsk_hoi_quy
  verified_at: 2026-10-08T05:37:26Z
  output: |
    Ran 43 tests across 4 files. [7.28s]

- eval: E13
  run_id: minted-danh-sach-keo-chung-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dsk_san_thiet_ke
  verified_at: 2026-10-08T05:37:26Z
  output: |
    KET LUAN: khong P0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T05:37:26Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T05:37:26Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T05:37:26Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T05:37:26Z

- cmd: bunx turbo run lint --force
  run_id: minted-danh-sach-keo-chung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T05:37:26Z

- cmd: bun run lint:slop
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T05:37:26Z

- cmd: bunx turbo run build --force
  run_id: minted-danh-sach-keo-chung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T05:37:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (cmd: git diff --quiet $(git merge-base HEAD origin/onehub) trên bốn tệp kiểm app rồi chạy bốn tệp đó): green trên cả HEAD lẫn baseline. Đây là regression-guard có chủ ý theo AC-12 (bốn tệp kiểm cũ không được đổi kỳ vọng và phải vẫn xanh), không chứng minh hành vi mới.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval máy nào đỏ; REJECT vì review có 1 phát hiện mức high trong hợp đồng (AC-7): nút «Hoàn tác» của toast lưu trữ giai đoạn chỉ dùng được một lần (cờ daHoanTac không bao giờ được thả), nên lưu trữ lại cùng giai đoạn rồi Hoàn tác không làm gì, và lần Hoàn tác lỗi không thử lại được. Thêm 6 phát hiện thước đo mức medium/low trong hợp đồng (E5, E7, E9, E10). Returned to implementation. Ghi chú: E5 không có run_id từ verifier, map ghi chuỗi rỗng.
