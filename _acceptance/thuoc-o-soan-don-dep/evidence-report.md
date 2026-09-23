---
schema_version: 2
feature_slug: thuoc-o-soan-don-dep
verdict: REJECT
failed_evals: [E1, E4, E9]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d65e4a160d9886fb8fedf1c05648d9d8e00c871e
human_signoff:
---

# Evidence Report: thuoc-o-soan-don-dep

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | FAIL |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | FAIL |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-thuoc-o-soan-don-dep-E1-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tosd_khac_cay
  verified_at: 2026-09-23T00:00:00Z
  cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs --ca khac-cay"
  output: |
    DUNG sua — khac-cay: thoat 2, 0 vat sot
    DUNG goc — khac-cay: sot dau moc
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E2
  run_id: minted-thuoc-o-soan-don-dep-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tosd_giua_chung
  verified_at: 2026-09-23T00:00:00Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E3
  run_id: minted-thuoc-o-soan-don-dep-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tosd_tin_hieu
  verified_at: 2026-09-23T00:00:00Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E4
  run_id: minted-thuoc-o-soan-don-dep-E4-r1
  exit_code: 2
  baseline: red
  verifier: config:executors.script.tosd_thieu_nguoi
  verified_at: 2026-09-23T00:00:00Z
  cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs --ca thieu-nguoi"
  output: |
    DUNG sua — thieu-nguoi: thoat 2, 0 vat sot
    DUNG goc — thieu-nguoi: khong chan
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E5
  run_id: minted-thuoc-o-soan-don-dep-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tosd_token
  verified_at: 2026-09-23T00:00:00Z
  output: |
    DUNG sua — token: dat
    DUNG goc — token: builder viet tay

- eval: E6
  run_id: minted-thuoc-o-soan-don-dep-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tosd_mau
  verified_at: 2026-09-23T00:00:00Z
  output: |
    DUNG sua — mau: dat
    DUNG goc — mau: khai hai lan

- eval: E7
  run_id: bholcal70 (retry run; first attempt b08uhbu6p flaked on E1)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tosd_that
  verified_at: 2026-09-23T00:00:00Z
  screenshot: _acceptance/thuoc-o-soan-don-dep/evidence/E1-man-dau-1440.png
  observed: |
    Đọc trực tiếp evidence/that.json (lượt chạy cuối) và toàn bộ 11 ảnh trong _acceptance/thuoc-o-soan-don-dep/evidence/:
    E1-con-tro.json: cả 4 tổ hợp (man-dau/trong-hoi-thoai x 1440/375) đều lechConTro<=1px (đa số 0), chuGoiYHien=true, lechChuGoiY<=1px, namTron=true — khớp Expected #1.
    E1-man-dau-1440.png, E1-man-dau-375.png, E1-trong-hoi-thoai-1440.png, E1-trong-hoi-thoai-375.png: cả 4 ảnh có mặt, ô soạn có viền xanh (đã bấm/focus), chữ gợi ý "Hỏi về CRM của bạn..." hiện đúng vị trí trong ô; ảnh trong-hoi-thoai hiển thị đúng thẻ lỗi "Đã dừng câu trả lời... Mã lỗi: TOOL_EXECUTION_FAILED" phía trên, ô soạn focus phía dưới.
    E2-go-chu.json: chuGoiYHien=false, noiDung="a", conTroTrai=493.109 <= phaiChuA=493.125+1 — con trỏ đứng ngay sau chữ "a". E2-go-chu.png: nội dung ô là "a", không còn chữ gợi ý — khớp Expected #2.
    E8-khuon.txt: 1440 scrollWidth=1440=clientWidth; 375 scrollWidth=375=clientWidth — không tràn ngang, khớp Expected #4.
    E8-o-trong-1440.png / -375.png: dò pixel bằng PIL xác nhận có cột đỏ thuần rgb(255,0,0) ngay tại x=487 (1440) và x=32 (375), sát mép trái chữ gợi ý (chênh 1px) — vạch đỏ con trỏ đứng trước chữ đầu của chữ gợi ý, khớp Expected #1/E8.
    E8-da-go-1440.png / -375.png: nội dung "a", không còn chữ gợi ý — khớp Expected #2/E8.
    E8-the-loi-1440.png / -375.png: dòng "Mã lỗi: TOOL_EXECUTION_FAILED" hiện dưới câu lỗi, không có nút "Thử lại" (đúng vì hội thoại gieo không có tin nhắn) — khớp Expected #3.
    Thư mục _acceptance/o-soan-va-ly-do-loi/evidence (hồ sơ cũ): liệt kê tệp/kích thước/mốc giờ giống hệt trước và sau khi chạy (mốc giờ 15:25, không đổi) — độc lập xác nhận bamTruoc=bamSau trong that.json.
  network_observed: n-a (driver)

- eval: E8
  run_id: minted-thuoc-o-soan-don-dep-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tosd_pham_vi
  verified_at: 2026-09-23T00:00:00Z
  output: |
    DUNG doi-chung — pham-vi: goi ten apps/agent/agent/lib/custom-agent-dispatch.ts
    DUNG sua — pham-vi: 13 tep doi tu 7cf69d6a, 0 ngoai _acceptance va T1

- eval: E9
  run_id: minted-thuoc-o-soan-don-dep-E9-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tosd_steps_cu
  verified_at: 2026-09-23T00:00:00Z
  cmd: bun _acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs --ca steps-cu
  output: |
    DUNG doi-chung — steps-cu: mau dung khong bi goi ten
    DUNG doi-chung — steps-cu: mau bot che do chup bi goi ten
    DUNG doi-chung — steps-cu: mau them --bo-qua bi goi ten
    DUNG sua — steps-cu: chi ba dong Chay doi, dung tien to NGUOI

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-thuoc-o-soan-don-dep-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-23T00:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-o-soan-don-dep-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-23T00:00:00Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-o-soan-don-dep-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-23T00:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-o-soan-don-dep-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-23T00:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào khai runs > 1 trong vòng này (không có phương sai để đo).

## Iterations

Round 1: E1, E4, E9 thất bại — E1 (khac-cay) thoát mã 1 và E9 (steps-cu) thoát mã 1 dù outputTail cho thấy các dòng "DUNG" ở từng chiều kiểm tra được cấp trong đoạn log rút gọn (nguyên nhân đúng nằm ngoài phần outputTail được cung cấp cho vòng này); E4 (thieu-nguoi) thoát mã 2. Trả về triển khai để xem lại ba ca này trong _acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs trước vòng đo kế tiếp.
