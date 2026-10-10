---
schema_version: 2
feature_slug: trang-lo-trinh-trong-crm
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8d5180fd33f865497e17577051056dccf52d1a09
human_signoff: Manh Phan 2026-10-10
---

# Evidence Report: trang-lo-trinh-trong-crm

Vòng 3. Cả 17 eval gắn tiêu chí đều đạt và cả bảy lệnh suite (hồi quy) đều xanh, gồm cả lệnh `bun run test -- --filter=api` đã đỏ ở vòng 2. Không có finding trong hợp đồng.

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
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | ui-check | PASS |
| E14 | AC-14 | judgment | PASS |
| E15 | AC-13 | script | PASS |
| E16 | AC-1 | script | PASS |
| E17 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-lo-trinh-trong-crm-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_hien
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 4 tests across 1 file. [1496.00ms]

- eval: E2
  run_id: minted-trang-lo-trinh-trong-crm-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_vong_doi
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 1 test across 1 file. [898.00ms]

- eval: E3
  run_id: minted-trang-lo-trinh-trong-crm-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_loc
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 2 tests across 1 file. [1.85s]

- eval: E4
  run_id: minted-trang-lo-trinh-trong-crm-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_ngay
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 6 tests across 1 file. [1.79s]

- eval: E5
  run_id: minted-trang-lo-trinh-trong-crm-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_cach_xem
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 2 tests across 1 file. [841.00ms]

- eval: E6
  run_id: minted-trang-lo-trinh-trong-crm-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_ho_so
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 1 test across 1 file. [2.09s]

- eval: E7
  run_id: minted-trang-lo-trinh-trong-crm-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_da_bac
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 2 tests across 1 file. [982.00ms]

- eval: E8
  run_id: minted-trang-lo-trinh-trong-crm-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_khoan_dung
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 1 test across 1 file. [1182.00ms]

- eval: E9
  run_id: minted-trang-lo-trinh-trong-crm-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_ban_chep
  verified_at: 2026-10-10T06:40:54Z
  output: |
    DUNG trang khong doc ho so hay tep ke hoach (20 tep)

- eval: E10
  run_id: minted-trang-lo-trinh-trong-crm-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_vai
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 3 tests across 3 files. [93.00ms]

- eval: E11
  run_id: minted-trang-lo-trinh-trong-crm-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_ban_dung
  verified_at: 2026-10-10T06:40:54Z
  output: |
    DUNG ban sao chi gom tep cua ban dung doc ra khoi du lieu

- eval: E12
  run_id: minted-trang-lo-trinh-trong-crm-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_chi_doc
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 1 test across 1 file. [834.00ms]

- eval: E13
  run_id: minted-trang-lo-trinh-trong-crm-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_do_man
  verified_at: 2026-10-10T06:40:54Z
  screenshot: evidence/E13-step1.png
  observed: |
    rail-1280: Lộ trình page title with description, left icon rail with second icon highlighted; page blurred with "Rendering..." badge (mid-transition), toolbar and table rows faintly visible; consistent with URL /lo-trinh. thanh-cong-cu-deals-1280: Thoả thuận page, toolbar: search, "Tất cả" select, Bảng / Bảng cột, Lọc, Sắp xếp, Cột (7), Đã lưu trữ on one row. bang-1280: Lộ trình table, toolbar on one row (search, chips Chưa xong 31/Đã giao 82/Xếp lại sau 3/Tất cả 116, Bảng/Bảng cột/Mốc, Lọc, Sắp xếp, Cột (4), Đã bác), columns Việc/Lộ trình/Trạng thái/Mốc, many rows, no horizontal overflow; same control order as deals. bang-cot-1280: four kanban columns Chưa bắt đầu 29, Đang làm 2, Đã giao 82, Khác 3 with cards, view toggle with Bảng cột active. moc-1280: timeline with three mốc (14 thg 10 2026 Chạy thật, 4 thg 11 Sửa một đợt, 14 thg 12 Hạn cứng lượt 7), "Chưa hẹn mốc 28", footer "31 việc · 82/116 đã giao". bang-375: mobile, title, search, "Lọc" dropdown only (no lifecycle buttons), table with only Việc and Mốc columns, status dot under each title; Mốc column partly clipped in table container. ho-so-375: dimmed page with record sheet open (title Mọi phòng ban tự nạp..., Trạng thái, Mốc, Lộ trình, Nhóm, Cần xong trước, Việc đang chờ việc này), sheet right edge clipped (animation). bang-cot-375: Trạng thái/Nhóm/Lộ trình toggle, "Bảng cột" select, kanban columns Chưa bắt đầu 29 and Đang là... scrolling inside container, page not overflowing. moc-375: status chips, "Mốc" select, timeline entries with titles and item cards fully readable within 375 width. All frames match Expected; no contradictions.
  network_observed: n-a (driver)
  output: |
    Chín khung của lượt chạy mới được chép vào evidence/ thành E13-step1 đến E13-step9 (1 rail-1280, 2 thanh-cong-cu-deals-1280, 3 bang-1280, 4 bang-cot-1280, 5 moc-1280, 6 bang-375, 7 ho-so-375, 8 bang-cot-375, 9 moc-375). Khung thanh-cong-cu-1280 của Lộ trình không lưu riêng; bang-1280 cho thấy thanh công cụ đó, còn thanh công cụ Thoả thuận nằm ở step2.
    Ghi chú nhìn (không phải lỗi khẳng định): rail-1280 chụp giữa lúc chuyển trang; ho-so-375 chụp khi ngăn đang trượt vào nên mép phải bị cắt; bang-375 cột Mốc bị cắt một phần trong khung cuộn của bảng, còn scrollWidth của trang là 375.
    Trình điều khiển là puppeteer, không đọc được mạng nên không có E13-network.txt.

- eval: E14
  judged_by: judge panel (3 judge, fresh context)
  verdict: PASS
  rationale: Panel giữ nguyên từ vòng 2 — đầu vào không đổi, không chấm lại; lý do xem ở vòng 2. Đây là đề xuất của panel, người quyết ở Cổng 2.
  panel:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override:  # chi nguoi ghi

- eval: E15
  run_id: design-gate-993d036a9d,design-gate-f4c315b313
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_thiet_ke
  verified_at: 2026-10-10T06:40:54Z
  output: |
    design-gate --mode static chay cho tung tep .tsx duoi components/lo-trinh va trang; vong lap ket thuc sach, khong tep nao bi chan.

- eval: E16
  run_id: minted-trang-lo-trinh-trong-crm-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_mau
  verified_at: 2026-10-10T06:40:54Z
  output: |
    DUNG tệp mẫu khớp bộ vẽ scripts/product-map.mjs

- eval: E17
  run_id: minted-trang-lo-trinh-trong-crm-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_loi
  verified_at: 2026-10-10T06:40:54Z
  output: |
    Ran 137 tests across 1 file. [768.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-10T06:40:54Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-10T06:40:54Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-10T06:40:54Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-10T06:40:54Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-10T06:40:54Z

- cmd: bun run lint:slop
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-10T06:40:54Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-10T06:40:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

none — khong eval nao duoc ghi nhan la khong-phan-biet.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong co eval ngau nhien)

## Iterations

Round 1: 16/17 eval máy đạt, E14 chờ phán đoán, hai finding trong hợp đồng (AC-4: ngày mốc không đọc được). Đã sửa ở hai commit edb31f1ab và 119c04140, trả về thi công.
Round 2: cả 17 eval gắn tiêu chí đều đạt; lệnh suite api thất bại với 11 bài chạm trần 5000ms trong 1672 bài, không gắn eval nào. Hai finding mới trong hợp đồng (AC-5, mốc đã qua lệch khi ngày lẫn lộn). Kết luận REJECT.
Round 3: cả 17 eval gắn tiêu chí đều đạt, cả bảy lệnh suite xanh (lệnh api đạt lại), không có finding trong hợp đồng. Sửa ở commit 5e4ec4896 (một hàm so mốc cho đường mốc và danh sách). Kết luận PASS.

### Re-pin lần 1 — 2026-10-10, do ghim lại sau gộp onehub bb1421c3f (#357) trước khi gộp #329
run_id: repin-20261010T080151Z-38375
sha: 44e89ae6e8cb83603da35fb091fca46e9659f96e · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E13, E14 (E14 không khai paths) · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-10, do ghim lại sau gộp onehub 402536f56 (#359) trước khi gộp #329
run_id: repin-20261010T082225Z-72446
sha: 8d5180fd33f865497e17577051056dccf52d1a09 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E13, E14 (E14 không khai paths) · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
