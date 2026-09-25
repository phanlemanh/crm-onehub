---
schema_version: 2
feature_slug: vung-cuon-la-khoi-chua
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d91b70b5d3ef94d8d51e67642d164f6fac8253aa
human_signoff: Phan Le Manh 2026-09-26
---

# Evidence Report: vung-cuon-la-khoi-chua (round 3)

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-vung-cuon-la-khoi-chua-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T16:01:03Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E2
  run_id: minted-vung-cuon-la-khoi-chua-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T16:01:03Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E3
  run_id: minted-vung-cuon-la-khoi-chua-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T16:01:03Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E4
  run_id: minted-vung-cuon-la-khoi-chua-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T16:01:03Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E5
  run_id: minted-vung-cuon-la-khoi-chua-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T16:01:03Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E6
  run_id: minted-vung-cuon-la-khoi-chua-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T16:01:03Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E7
  run_id: minted-vung-cuon-la-khoi-chua-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T16:01:03Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E8
  run_id: minted-vung-cuon-la-khoi-chua-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T16:01:03Z
  screenshot: _acceptance/vung-cuon-la-khoi-chua/evidence/truong-1440-cuoi.png
  observed: |
    Evidence: đã liệt kê đúng 6 file trong _acceptance/vung-cuon-la-khoi-chua/evidence/:
    truong-1440-cuoi.png, truong-1440-doi-chung.png, truong-768-cuoi.png,
    truong-768-doi-chung.png, truong-375-cuoi.png, truong-375-doi-chung.png —
    không thiếu, không dư. Đã mở cả 6 file bằng Read và đối chiếu từng ảnh với
    Expected:

    1) truong-1440-cuoi.png: đầu trang khung ứng dụng (logo "CRM" bát giác +
    badge "Đang tra cứu 216" + avatar tròn) nằm sát mép trên (y=0). Thanh bên
    trái nguyên vẹn, hiện đủ các nhóm (KHÔNG GIAN LÀM VIỆC, CON NGƯỜI, KẾT NỐI
    VÀ DỮ LIỆU, BẢO MẬT) với mục "Trường" đang chọn. Vùng nội dung cuộn tới
    cuối: hiện tiêu đề "Trường", tabs Công ty/Cá nhân/Thoả thuận, bảng trường
    tự tạo với hàng cuối "BDR owner" và nút "+ Trường mới" nằm trong khung
    nhìn. Khớp Expected cho -cuoi.

    2) truong-1440-doi-chung.png: đỉnh ảnh là mép trên của vùng nội dung đã bị
    cắt — dòng chữ trên cùng là "Trưởng chuẩn" (một mục giữa bảng), không còn
    thấy đầu trang CRM/avatar hay phần đầu thanh bên (KHÔNG GIAN LÀM VIỆC,
    Chung, Tiến tệ...) — chỉ thấy nhóm "KẾT NỐI VÀ DỮ LIỆU" trở xuống. Nghĩa là
    đầu trang khung ứng dụng đã trượt lên khỏi mép trên khi ép main là
    position static. Khớp Expected cho -doi-chung.

    3) truong-768-cuoi.png: đầu trang (logo CRM + badge + avatar) vẫn nằm sát
    mép trên, thanh bên 768 vẫn nguyên chỗ hiện đủ các nhóm từ trên xuống
    dưới. Vùng nội dung cuộn tới hàng cuối bảng trường ("BDR owner", nút "+
    Trường mới"). Khớp Expected cho -cuoi.

    4) truong-768-doi-chung.png: đỉnh ảnh bị cắt, dòng trên cùng là phần cuối
    dòng mô tả "...ty, cá nhân và thoả thuận ghi những gì." — không còn đầu
    trang CRM/avatar, thanh bên chỉ còn thấy từ nhóm "KẾT NỐI VÀ DỮ LIỆU" trở
    xuống (phần trên KHÔNG GIAN LÀM VIỆC/CON NGƯỜI đã trượt khỏi khung nhìn).
    Khớp Expected cho -doi-chung (đầu trang trượt lên một phần).

    5) truong-375-cuoi.png: đầu trang mobile (icon hamburger, logo CRM, badge
    "Đang tra cứu 216", avatar) nằm sát mép trên, bên dưới là thanh tab ngang
    (Chung, Tiến tệ, Trường, Thành viên, Tổ chức...). Vùng nội dung cuộn tới
    cuối bảng, hiện "+ Trường mới" và còn khoảng trống bên dưới bao gồm vùng
    dây nút. Khớp Expected cho -cuoi.

    6) truong-375-doi-chung.png: đỉnh ảnh là giữa bảng trường (hàng "Account
    type" đã bị cắt mất tiêu đề "TRƯỜNG TỰ TẠO" phía trên), không còn đầu
    trang/hamburger/tab bar ở mép trên. Ảnh cuộn xuống tới cuối cùng hiện "+
    Trường mới" và khoảng trống lớn phía dưới. Khớp Expected cho -doi-chung.

    Cả 6 frame đều KHÔNG mâu thuẫn Expected — tất cả khớp đúng mô tả.

    Network truth: driver là Bash + script Playwright nội bộ của do-khung.mjs
    (không phải browser tool của phiên này), nên phiên này không có đường đọc
    network/console của trang được capture -> không thể dump
    evidence/E8-network.txt qua đường đọc network. Ghi "n-a (driver)".
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-25T16:01:03Z

- cmd: bunx turbo run lint --force
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-25T16:01:03Z

- cmd: bun run lint:slop
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-25T16:01:03Z

- cmd: bunx turbo run build --force
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-25T16:01:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — every feature eval is red on baseline (discriminates); carried from round 1, không có eval nào được đo lại baseline ở round này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: SUITE `bun run test` REJECT (thất bại) — bản gốc ghim của PageShell mang `relative`, main không còn là khối chứa. Returned to implementation.
Round 2: E8 (ui-check) REJECT (thất bại) — bàn đo lấy mẫu ảnh đối chứng đúng lúc trang đang chuyển hướng, ảnh không phản ánh trạng thái ổn định của trang. Returned to implementation.
Round 3: E1–E8 và toàn bộ suite (test/lint/lint:slop/build) đều pass. PASS.

### Re-pin lần 1 — 2026-09-25, do gộp onehub #145 sau chữ ký; bản gốc ghim của PageShell đổi ở vung-cuon-la-khoi-chua
run_id: repin-20260925T212443Z-96898
sha: 944bd5dd993d38c3acc27f87820b5fe3e9351cb7 · suites: 4 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E8 · AC không có chốt máy: AC-8

### Re-pin lần 2 — 2026-09-25, do gộp onehub #146 (thanh bên Cài đặt, packages/ui) khi tới lượt merge
run_id: repin-20260925T222401Z-96602
sha: d91b70b5d3ef94d8d51e67642d164f6fac8253aa · suites: 4 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E8 · AC không có chốt máy: AC-8
