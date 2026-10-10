---
schema_version: 2
feature_slug: trang-lo-trinh-trong-crm
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e73f513d229d43aebb89cc2e68390b3ccde91047
human_signoff:
---

# Evidence Report: trang-lo-trinh-trong-crm

Round 1. Mọi eval máy đều xanh; còn đúng một mục chờ người quyết ở Cổng 2: E14 (câu chữ trên màn có sạch chữ nội bộ không), cả ba judge đề xuất FAIL.

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
| E14 | AC-14 | judgment | UNCERTAIN |
| E15 | AC-13 | script | PASS |
| E16 | AC-1 | script | PASS |
| E17 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-lo-trinh-trong-crm-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_hien
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 3 tests across 1 file. [932.00ms]
    __EXIT=0

- eval: E2
  run_id: minted-trang-lo-trinh-trong-crm-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_vong_doi
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 1 test across 1 file. [851.00ms]
    __EXIT=0

- eval: E3
  run_id: minted-trang-lo-trinh-trong-crm-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_loc
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 2 tests across 1 file. [1247.00ms]
    __EXIT=0

- eval: E4
  run_id: minted-trang-lo-trinh-trong-crm-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_ngay
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 4 tests across 1 file. [1006.00ms]
    __EXIT=0

- eval: E5
  run_id: minted-trang-lo-trinh-trong-crm-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_cach_xem
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 2 tests across 1 file. [955.00ms]
    __EXIT=0

- eval: E6
  run_id: minted-trang-lo-trinh-trong-crm-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_ho_so
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 1 test across 1 file. [1.69s]
    __EXIT=0

- eval: E7
  run_id: minted-trang-lo-trinh-trong-crm-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_da_bac
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 2 tests across 1 file. [711.00ms]
    __EXIT=0

- eval: E8
  run_id: minted-trang-lo-trinh-trong-crm-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_khoan_dung
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 1 test across 1 file. [812.00ms]
    __EXIT=0

- eval: E9
  run_id: minted-trang-lo-trinh-trong-crm-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ltc_ban_chep
  verified_at: 2026-10-10T05:38:22Z
  output: |
    DUNG trang khong doc ho so hay tep ke hoach (20 tep)
    __EXIT=0

- eval: E10
  run_id: minted-trang-lo-trinh-trong-crm-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_vai
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 3 tests across 3 files. [55.00ms]
    __EXIT=0

- eval: E11
  run_id: minted-trang-lo-trinh-trong-crm-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ltc_ban_dung
  verified_at: 2026-10-10T05:38:22Z
  output: |
    DUNG ban sao chi gom tep cua ban dung doc ra khoi du lieu
    __EXIT=0

- eval: E12
  run_id: minted-trang-lo-trinh-trong-crm-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltc_chi_doc
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 1 test across 1 file. [978.00ms]
    __EXIT=0

- eval: E13
  run_id: minted-trang-lo-trinh-trong-crm-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltc_do_man
  verified_at: 2026-10-10T05:38:22Z
  screenshot: evidence/rail-1280.png
  observed: |
    rail-1280.png: trang Lo trinh (tieu de "Lộ trình", mo ta "Trang chi de xem") dang mo, thanh dieu huong ben trai co icon thu tu 4 duoc tô sang; khung bi mo/toi do chuyen trang, bang chu doc mo. Khop Expected o muc URL /lo-trinh (assertion DOM), nhan chu khong nhin ro.
    bang-1280.png: bang 25+ viec ro net, cot Viec/Lo trinh/Trang thai/Moc, thanh cong cu mot hang: o tim, chip Chua xong 31/Da giao 82/Xep lai sau 3/Tat ca 116, chuyen kieu xem Bang|Bang cot|Moc, Loc, Sap xep, Cot (4), Da bac; khong tran ngang (1280).
    thanh-cong-cu-deals-1280.png: trang Thoa thuan, thanh cong cu mot hang: o tim, o chon "Tat ca", Bang|Bang cot, Loc, Sap xep, Cot (7), Da luu tru — cung thu tu tim > trang thai > cach xem > loc > nut nhu Lo trinh.
    bang-cot-1280.png: 4 cot Chua bat dau 29 / Dang lam 2 / Da giao 82 / Khac 3 voi the viec; chon "Bang cot" sang, khong tran ngang.
    moc-1280.png: dong thoi gian 3 moc (14 thg 10, 4 thg 11, 14 thg 12 2026) voi viec ben duoi + "Chua hen moc 28"; chon "Moc" sang, khong tran ngang.
    bang-375.png: khung dien thoai; thanh cong cu gom o tim + mot nut "Loc" (khong co chip the vong doi), bang chi con cot Viec va Moc, trang thai nam trong o Viec duoi tieu de; cot Moc bi cat ben phai (cuon trong the), trang khong tran.
    ho-so-375.png: ngan ho so mo ra phu len bang (tieu de viec, Trang thai, Moc, Lo trinh, Nhom, "Can xong truoc", "Viec dang cho viec nay"), mep phai dang truot vao; ngan hien.
    bang-cot-375.png: chon "Bang cot" qua o chon, cac cot vuot ngang trong khung the, noi dung hien, trang khong tran.
    moc-375.png: chon "Moc" qua o chon, dong thoi gian doc, noi dung hien day du, khong tran ngang.
    Tat ca khop Expected; khong khung nao mau thuan.
  network_observed: n-a (driver)
  output: |
    DUNG moc-375: scrollWidth 375
    Frame da luu: rail-1280.png, bang-1280.png, thanh-cong-cu-deals-1280.png, bang-cot-1280.png, moc-1280.png, bang-375.png, ho-so-375.png, bang-cot-375.png, moc-375.png.
    Luu y: khong co tep thanh-cong-cu-1280.png dung ten, chi co thanh-cong-cu-deals-1280.png (trang /deals); thanh cong cu cua Lo trinh nhin thay trong bang-1280.png.
    Ghi chu mat thuong: rail-1280.png la khung bi mo/lam toi (dang chuyen trang) nen khong doc duoc nhan muc thanh dieu huong bang mat; muc "Lo trinh" chi duoc xac nhan bang assertion DOM. ho-so-375.png chup luc ngan dang truot vao nhung ngan hien va scrollWidth 375. bang-375.png: cot Moc bi cat o mep phai (cuon ngang ben trong the), trang khong cuon ngang.

- eval: E15
  run_id: design-gate-6c45ea8183, design-gate-a9c4408acb
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ltc_thiet_ke
  verified_at: 2026-10-10T05:38:22Z
  output: |
    design-gate --mode static chay tung tep .tsx duoi apps/app/components/lo-trinh va trang: khong P0.
    __EXIT=0

- eval: E16
  run_id: minted-trang-lo-trinh-trong-crm-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ltc_mau
  verified_at: 2026-10-10T05:38:22Z
  output: |
    DUNG tệp mẫu khớp bộ vẽ scripts/product-map.mjs
    __EXIT=0

- eval: E17
  run_id: minted-trang-lo-trinh-trong-crm-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ltc_loi
  verified_at: 2026-10-10T05:38:22Z
  output: |
    Ran 137 tests across 1 file. [979.00ms]
    __EXIT=0

### Judgment

- eval: E14
  judged_by: hội đồng ba judge (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: UNCERTAIN
  rationale: Ba ý (a) trang cho biết gì, (b) chỉ đọc và đổi kế hoạch ở đâu, (c) báo ai khi không có dữ liệu đều có câu tương ứng. Nhưng câu hoSo.theoLoi trong nhánh vi vẫn dùng chữ nội bộ «hồ sơ làm việc», và câu trong.chuaCoKhoiMoTa dùng «xuất» và «cập nhật công cụ» mà không bảo báo ai. Đề xuất của hội đồng là FAIL ở cả ba lens; người quyết ở Cổng 2.
  required_evidence:
    - Sửa hoSo.theoLoi trong nhánh vi của apps/app/lib/messages/lo-trinh.ts bằng chữ thường (ví dụ «Trạng thái này lấy từ ghi chú trong kế hoạch, chưa có ai xác nhận việc đã làm»), không còn chữ «hồ sơ». Mở lại tệp thì nhánh vi không còn «hồ sơ» ngoài chỗ chỉ ngăn xem chi tiết một việc.
    - Sửa trong.chuaCoKhoiMoTa cùng tệp: bỏ «xuất» và «cập nhật công cụ», kèm lời «Hãy báo đội sản phẩm» như các khung lỗi khác. Chạy grep tìm hồ sơ, khối, khuôn, kit, hàng trong chuỗi vi thì chỉ còn ở tên khoá.
    - Hoặc, nếu chủ kho chốt «hồ sơ làm việc» là chữ thường mà trưởng phòng hiểu được: một dòng xác nhận ở CONTEXT.md hoặc ở docs/superpowers/specs/2026-10-09-trang-lo-trinh-trong-crm-design.md.
  human_override:  # chi nguoi ghi

### Hội đồng E14 (đề xuất: FAIL, chờ người quyết)

- domain-correctness: FAIL — Ba ý (a), (b), (c) đều rõ, nhưng nhánh vi vẫn lộ chữ nội bộ ở hoSo.theoLoi: «Trạng thái này lấy từ ghi chú của kế hoạch, chưa có hồ sơ làm việc xác nhận.» Chữ «hồ sơ» nằm trong danh sách cấm của câu hỏi và trưởng phòng không biết «hồ sơ làm việc» là gì. Câu trong.chuaCoKhoiMoTa («Lộ trình chưa được xuất cho trang này») mang chữ kỹ thuật «xuất», nhưng judge không coi riêng câu này là vi phạm.
- operational-feasibility: FAIL — Mô tả trang trả lời được (a) và (b), hầu hết khung lỗi dặn «Hãy báo đội sản phẩm». Nhưng hoSo.theoLoi có chữ nội bộ «hồ sơ làm việc», và «Lộ trình chưa được xuất cho trang này. Đội sản phẩm sẽ bật khi cập nhật công cụ.» dùng chữ kỹ thuật «xuất» mà không bảo người đọc báo ai.
- spec-alignment: FAIL — Phần (a), (b), (c) đạt; các khung trống và khung lỗi đều bảo báo đội sản phẩm. Nhưng hoSo.theoLoi vẫn dùng «hồ sơ làm việc», và chuaCoKhoiMoTa nghiêng về chữ công cụ («được xuất», «cập nhật công cụ»).

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-10T05:38:22Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-10T05:38:22Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-10T05:38:22Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-10T05:38:22Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-10T05:38:22Z

- cmd: bun run lint:slop
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-10T05:38:22Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-lo-trinh-trong-crm-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-10T05:38:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh; E14 (judgment) chờ người quyết vì cả ba judge đề xuất FAIL ở chữ nội bộ «hồ sơ làm việc» và câu «chưa được xuất» trong apps/app/lib/messages/lo-trinh.ts. Chuyển Cổng 2.
