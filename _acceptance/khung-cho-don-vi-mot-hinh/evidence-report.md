---
schema_version: 2
feature_slug: khung-cho-don-vi-mot-hinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d403a78797777bac13fd466678416f4d576179bb
human_signoff: Phan Le Manh 2026-10-21 — ký lại Cổng Bằng chứng trên vòng chấm 4 (delta sau chữ ký, PASS, 9/9 eval, 7/7 suite; khung khớp hàng công cụ sau thanh bên khu theo V2-16 a; rang nhận /okr/bo-okr theo V2-15 i). Ngoài-1, 2, 6–9, 12–15 ghi Known limits; Ngoài-3, 4, 11 mở hợp đồng mới; Ngoài-5, 10 chấp nhận, không sửa; đồng ý cắt; Treo phê hết.
---

# Evidence Report: khung-cho-don-vi-mot-hinh

Round 4. Nội dung thay toàn bộ round cũ; lịch sử các round nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-1, AC-4 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-cho-don-vi-mot-hinh-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-21T04:47:21Z
  output: |
    cmd: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    (một lượt đo chung cho E1, E2, E3, E4)
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-khung-cho-don-vi-mot-hinh-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-21T04:47:21Z
  output: |
    cmd: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    (cùng lượt đo với E1)
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-khung-cho-don-vi-mot-hinh-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-21T04:47:21Z
  output: |
    cmd: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    (cùng lượt đo với E1)
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-khung-cho-don-vi-mot-hinh-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-21T04:47:21Z
  output: |
    cmd: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    (cùng lượt đo với E1)
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-khung-cho-don-vi-mot-hinh-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcd_cau_truc
  verified_at: 2026-10-21T04:47:21Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-cho-don-vi.dom.tsx -t kcd-cau-truc
    Ran 3 tests across 1 file. [1144.00ms]

- eval: E6
  run_id: minted-khung-cho-don-vi-mot-hinh-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_xuong
  verified_at: 2026-10-21T04:47:21Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx
    Ran 24 tests across 1 file. [768.00ms]

- eval: E7
  run_id: minted-khung-cho-don-vi-mot-hinh-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_trang_khac
  verified_at: 2026-10-21T04:47:21Z
  output: |
    cmd: node _acceptance/khung-cho-don-vi-mot-hinh/rang/trang-khac.mjs
    AC-6: 9 trang dung bang · bang-hai-dong o [slug]/okr/theo-don-vi

- eval: E8
  run_id: minted-khung-cho-don-vi-mot-hinh-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcd_a11y
  verified_at: 2026-10-21T04:47:21Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-cho-don-vi.dom.tsx -t kcd-a11y
    Ran 4 tests across 1 file. [875.00ms]

- eval: E9
  run_id: minted-khung-cho-don-vi-mot-hinh-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-21T04:47:21Z
  screenshot: evidence/E9-khung-1440.png
  observed: |
    E9-khung-1440.png: khung chua co du lieu — tieu de "Mục tiêu" va mo ta that, nut Kara that, ben tren la hang cong cu gom 2 vach (o chon don vi, nhom Danh sach/So do/Hop tuan) + vach lon ben phai, hang vach nho (Loc/Sap xep/Cot) duoi; hop bang co dau bang (vach cao ~44) va 5 dong hai tang (vach dai + 2 chip tren, vach ngan ben duoi; ben phai 3 vach tien do/tinh trang/phu trach). E9-bang-1440.png: cung khổ, bang that o cung vi tri: o chon "Pháp chế" + Danh sách/Sơ đồ góp vào/Họp tuần + chip Tất cả/Cần bàn/Chưa góp vào đâu ben phai, hang Lọc/Sắp xếp/Cột (4) duoi, dau bang "Mục tiêu · Tiến độ · Tình trạng · Phụ trách" cung y (~237-281) va 3 dong muc tieu hai tang cung cot; hop bang bat dau cung y=237 nhu khung, dong dau y~281-345 trung voi dong khung dau. Khung 5 dong (khung co dinh), bang that 3 dong — dung hinh dang, khong lech. E9-khung-390.png: khung o 390 — thanh tren, vach ô chon ky, hang tab Của tôi/Bộ OKR/..., tieu de + mo ta that, Kara that, vach nut, 3 vach cong cu (rong, ngan, rong), hop bang voi dau bang va cac dong nhieu tang (vach tieu de, 2 chip, vach phu, vach nhan + thanh tien do). Khong vach nao vuot mep phai (moi vach nam trong le 16px). E9-bang-390.png: bang that cung khổ: o chon "Pháp chế", o chon nho (chi chevron, o ben canh), nut Lọc, hop bang voi dau "Mục tiêu" va cac dong hai tang (tieu de, chip Cam kết/Đã công bố, "2 KR · góp vào 1 chỗ · An Khánh Linh", nhan "Tính từ 2 KR" + thanh tien do + trang thai). Chieu cao dong va vi tri dau bang khop khung (dau bang lech 0); khong tran ngang. Khac biet nho: vach o chon thu hai o khung (~128 px) rong hon o that (~42 px) — chi khac chieu ngang, khong anh huong chieu cao/vi tri, script do lech 0. E9-doi-don-1440.png: o chon don vi that "Kinh doanh miền Bắc" va nhóm Danh sách/Sơ đồ góp vào/Họp tuần hien that (khong phai vach) tren hang cong cu, ben phai van la vach (chip + Loc/Sap xep/Cot), than bang la khung 5 dong dang cho tai; tieu de, mo ta, Kara that giu nguyen. Doi chieu Expected: dat — khung co hang cong cu, dau bang, dong hai tang dung cho cua bang; 390 khong tran ngang; anh doi don vi co o chon don vi that tren khung.
  network_observed: n-a (driver)
  output: |
    - Chu ky khung = chu ky bang: 1440 cong cu 64 · dau bang 77/44 · 5 dong 65; 390 cong cu 100 · dau bang 113/44 · 5 dong 149 (khung va bang cung so).
    - Cung luot: AC-2 1440/390 "khong co pha khung" (hop le theo expected E2), AC-3 1440 va 390: o chon that co · nhan bam co · mo danh sach co · dinh o chon lech 0. KET LUAN: dat.
    Frame da luu (ghi lai luc 11:48-11:49 hom nay): evidence/E9-khung-1440.png (1440x900), E9-bang-1440.png (1440x900), E9-khung-390.png (390x844), E9-bang-390.png (390x844), E9-doi-don-1440.png (1440x900). Script tu luu anh vao evidence/ (hồ sơ chua signed-off), khong dung ui:capture. Network: driver la script do rieng, khong co duong doc network cua tool -> n-a (driver); khong ghi E9-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-21T04:47:21Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-10-21T04:47:21Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-21T04:47:21Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-21T04:47:21Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-21T04:47:21Z

- cmd: bun run lint:slop
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-21T04:47:21Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-21T04:47:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E6 — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx`

Lệnh suite xanh trên cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: tất cả chín eval và bảy lệnh suite đạt trên cây e6692ecc23cbecae6db7bf61c320d53378833de1. Các round trước: xem lịch sử trong run-log.jsonl và các bản report cũ.

### Re-pin lần 1 — 2026-10-24, do VK3 trang-bo-okr sửa thước và vật — ghim lại sau chữ ký, ba thước theo «duyệt cả ba» (9b246f0a5)
run_id: repin-20261024T133834Z-50324
sha: 9b246f0a57bae04226f308c1d481f95b31a15217 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E9 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-1, AC-4 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-25, do hoá cũ do so-do-toan-vung (VK6) sau gộp onehub 49843223e — thước sửa tại chỗ theo V3-25 A, V3-27 B, V3-33, V3-38, V3-39 A, C1 lối b; AC-10 chứng ở bước ghim lại
run_id: repin-20261025T052030Z-41118
sha: d403a78797777bac13fd466678416f4d576179bb · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E9 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-1, AC-4 · chập chờn (đỏ lần đầu, đạt khi chạy lại): trang-bo-okr E2 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
