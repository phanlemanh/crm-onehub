---
schema_version: 2
feature_slug: trang-lo-trinh-trong-crm
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 119c04140208421b1ba69646110fcd8d62c68509
human_signoff:
---

# Evidence Report: trang-lo-trinh-trong-crm

Vòng 2. Mọi eval gắn tiêu chí đều đạt, nhưng lệnh suite `bun run test -- --filter=api` thất bại và không gắn eval nào (11 bài chạm trần 5000ms, 1658 bài đạt, 3 bỏ qua). Vì vậy kết luận chung là REJECT với `failed_evals` để trống. Chi tiết ở khối lệnh suite bên dưới.

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
  run_id: minted-trang-lo-trinh-trong-crm-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_hien
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 4 tests across 1 file. [1031.00ms]

- eval: E2
  run_id: minted-trang-lo-trinh-trong-crm-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_vong_doi
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 1 test across 1 file. [659.00ms]

- eval: E3
  run_id: minted-trang-lo-trinh-trong-crm-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_loc
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 2 tests across 1 file. [1250.00ms]

- eval: E4
  run_id: minted-trang-lo-trinh-trong-crm-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_ngay
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 5 tests across 1 file. [1035.00ms]

- eval: E5
  run_id: minted-trang-lo-trinh-trong-crm-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_cach_xem
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 2 tests across 1 file. [665.00ms]

- eval: E6
  run_id: minted-trang-lo-trinh-trong-crm-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_ho_so
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 1 test across 1 file. [1.70s]

- eval: E7
  run_id: minted-trang-lo-trinh-trong-crm-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_da_bac
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 2 tests across 1 file. [726.00ms]

- eval: E8
  run_id: minted-trang-lo-trinh-trong-crm-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_khoan_dung
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 1 test across 1 file. [793.00ms]

- eval: E9
  run_id: minted-trang-lo-trinh-trong-crm-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_ban_chep
  verified_at: 2026-10-10T05:59:44Z
  output: |
    DUNG trang khong doc ho so hay tep ke hoach (20 tep)

- eval: E10
  run_id: minted-trang-lo-trinh-trong-crm-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_vai
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 3 tests across 3 files. [53.00ms]

- eval: E11
  run_id: minted-trang-lo-trinh-trong-crm-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_ban_dung
  verified_at: 2026-10-10T05:59:44Z
  output: |
    DUNG ban sao chi gom tep cua ban dung doc ra khoi du lieu

- eval: E12
  run_id: minted-trang-lo-trinh-trong-crm-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltc_chi_doc
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 1 test across 1 file. [856.00ms]

- eval: E13
  run_id: minted-trang-lo-trinh-trong-crm-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_do_man
  verified_at: 2026-10-10T05:59:44Z
  screenshot: evidence/E13-step1.png
  observed: |
    Da Read tung frame. rail-1280 (E13-step1): trang Lo trinh dung tieu de "Lộ trình" voi mo ta, thanh ben co muc Lo trinh dang sang (icon bien chi duong), nhung anh bi lam mo nhoe toan bo noi dung va co nhan "Rendering..." goc trai duoi — nhieu kha nang chup luc Next dev dang chuyen trang; URL da xac nhan /onehub-center/lo-trinh bang assertion, khong ve /ngoai-pham-vi. thanh-cong-cu-deals-1280 (step2): trang Thoả thuận voi thanh cong cu o mot hang: o tim, chon trang thai (Tat ca), Bang/Bang cot, Loc, Sap xep, Cot (7), Da luu tru; thu tu khop thanh cong cu Lo trinh (tim, trang-thai, cach-xem, loc, nut) theo assertion. bang-1280 (step3): bang Lo trinh nhieu hang Viec (co ma), cot Lo trinh/Trang thai/Moc, chip Chua xong 31/Da giao 82/Xep lai sau 3/Tat ca 116, nut Bang dang chon, Loc/Sap xep/Cot (4)/Da bac; khong tran ngang. bang-cot-1280 (step4): Bang cot dang chon, 4 cot Chua bat dau 29 / Dang lam 2 / Da giao 82 / Khac 3 voi the viec, toggle Trang thai/Nhom/Lo trinh; khong tran ngang. moc-1280 (step5): cach xem Moc dang chon, 3 moc co ngay (14 thg 10 2026 Chay that; 4 thg 11 Sua mot dot; 14 thg 12 Han cung: luot 7 len production) kem viec, "Chua hen moc 28" va dong tong ket "31 viec · 82/116 da giao". ho-so-375 (step6): 375 rong, ngan ho so hien (tieu de viec, Trang thai/Moc/Lo trinh/Nhom, "Can xong truoc", "Viec dang cho viec nay"); ngan va noi dung bi cat o mep phai va nen phia sau mo mot phan — giong chup giua luc ngan dang truot vao; scrollWidth trang van 375 theo assertion. bang-375 (step7): chi con nut "Loc" (khong co the vong doi), tim viec, bang hai cot Viec + Moc, trang thai nam trong o Viec duoi dong ma (cham + "Chua bat dau"), cot Moc bi cat nhe o mep phai do bang tu cuon ngang trong khung (trang khong tran). bang-cot-375 (step8): thanh Trang thai/Nhom/Lo trinh, o chon Bang cot, Loc, Da bac, cac cot Kanban cuon ngang trong khung; noi dung hien, trang khong tran. moc-375 (step9): chip Chua xong 31 ..., o chon Moc, dong thoi gian doc voi 3 moc va the viec day du; khong tran. Khong co mau thuan voi Expected: moi o co DUNG va anh; hai diem luu y chi la thoi diem chup (rail-1280 dang chuyen trang, ho-so-375 giua luc ngan truot).
  network_observed: n-a (driver)
  output: |
    DUNG bang-cot-375: scrollWidth 375
    DUNG moc-375: scrollWidth 375
    Frame da luu o evidence/ (E13-step1 den E13-step9)

- eval: E14
  judged_by: judge panel (3 judge, fresh context)
  verdict: PASS
  rationale: Ba judge cùng đạt. Phần chữ tiếng Việt của tệp lõi nêu đủ ba ý (trang cho biết việc đội sản phẩm làm, đang ở đâu, hẹn mốc nào; trang chỉ để xem, muốn đổi thì báo đội sản phẩm; mọi khung trống và khung lỗi kết bằng «Hãy báo đội sản phẩm») và không câu hiển thị nào mang tên tệp, tên lệnh hay chữ nội bộ. Đây là đề xuất của panel, người quyết ở Cổng 2.
  panel:
    - domain-correctness: PASS — Không có chữ nội bộ nào trong giá trị hiển thị; hai câu «Bản CRM đang chạy không mang theo lộ trình» và «Dữ liệu lộ trình mới hơn trang này; phần trang hiểu được vẫn đúng» hơi gần chữ kỹ thuật nhưng người không dùng git vẫn đọc được, chưa đến mức vi phạm.
    - operational-feasibility: PASS — Cả ba ý (a)(b)(c) đều có câu tương ứng; các chữ kit, khối, khuôn, hàng, hồ sơ chỉ nằm ở tên khoá mã, người xem không đọc.
    - spec-alignment: PASS — Khớp mục «Mục đích» và «Màn» của tệp thiết kế; mọi khung trống và lỗi đều kết bằng «Hãy báo đội sản phẩm».
  human_override:  # chi nguoi ghi

- eval: E15
  run_id: design-gate-869a74899d, design-gate-d5466ed0b8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_thiet_ke
  verified_at: 2026-10-10T05:59:44Z
  output: |
    design-gate --mode static chay cho tung tep .tsx duoi components/lo-trinh va trang; vong lap ket thuc sach, khong tep nao bi chan.

- eval: E16
  run_id: minted-trang-lo-trinh-trong-crm-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_mau
  verified_at: 2026-10-10T05:59:44Z
  output: |
    DUNG tệp mẫu khớp bộ vẽ scripts/product-map.mjs

- eval: E17
  run_id: minted-trang-lo-trinh-trong-crm-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_loi
  verified_at: 2026-10-10T05:59:44Z
  output: |
    Ran 137 tests across 1 file. [783.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_api-r2
  exit_code: 1
  verified_at: 2026-10-10T05:59:44Z
  output: |
    1658 pass, 3 skip, 11 fail. Ran 1672 tests across 183 files [230.46s]
    11 bài chạm trần 5000ms: api-bo-phan, api-chan-luu-tru, api-khuon (3 bài), api-xoa-vinh-vien, api-quyen, api-dong-mo, api-bac, api-ngay, api-trung-pheu.
    Lệnh này không gắn eval nào nên không nằm trong failed_evals.

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-10T05:59:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-10T05:59:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-10T05:59:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-10T05:59:44Z

- cmd: bun run lint:slop
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-10T05:59:44Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-10T05:59:44Z

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
