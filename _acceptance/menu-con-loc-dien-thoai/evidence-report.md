---
schema_version: 2
feature_slug: menu-con-loc-dien-thoai
verdict: REJECT
failed_evals: [E2]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6bf2b8c33eb8c4394c9a9244a00a27ffe1b82bfd
human_signoff:
---

# Evidence Report: menu-con-loc-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | FAIL |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-menu-con-loc-dien-thoai-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mcl_do_man
  verified_at: 2026-10-08T02:19:39Z
  screenshot: evidence/E1-step1.png
  observed: |
    375 wide, Thoả thuận page: the Giai doan submenu opens on the right and ends at about x=367, fully inside the screen, listing Demo booked 5 through Unqualified 4; after the tap the "Loc (1)" badge shows and the list holds 5 deals, all Demo booked (stage=DEMO_BOOKED).
    Ca nhan page at 375: the Cong ty submenu and its search box (value "xa") sit inside the screen (right about 367), with only "Khong cong ty nao khop." below; 1440 shows the Giai doan submenu to the left of its parent with 0px difference from the layer-off position; 768 bulk menu submenu (Ada Okafor, Marcus Lindqvist, Priya Raman) lies inside [0,768]. All five frames agree with the DUNG lines.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-menu-con-loc-dien-thoai-E2-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.mcl_do_man
  verified_at: 2026-10-08T02:19:39Z
  screenshot: evidence/E2-step2.png
  observed: |
    Frame E2-step2.png (cong-ty-375.png, 375x812, dark theme, trang "Cá nhân"). Thấy rõ: ô tìm trong menu con "Công ty", nằm trọn trong màn (mép phải sát ~367), chứa chữ "xa" với icon kính lúp; menu cha có các hàng Phụ trách, Công ty (đang chọn), Chức danh, Hoạt động.
    NHƯNG vùng danh sách trong menu con chỉ hiện trạng thái rỗng "Không công ty nào khớp." — không có mục công ty nào hiển thị trong menu con (bộ lọc "xa" loại hết). Các tên công ty Mercury/Pennylane/Ramp/Cal.com/Monzo chỉ là cột bảng nền của trang, không phải mục của menu con. Vế "ít nhất một mục công ty thấy rõ trong màn" của Expected không thoả.
  network_observed: n-a (driver)
  output: |
    Lệnh chạy mã thoát 0 với "KET LUAN 6 DUNG, 0 SAI": hộp 159..367 và ô tìm 183..367 đều trong [7, 368], value ô tìm là "xa", con trỏ touch.
    Phần ảnh của Expected mâu thuẫn: ảnh chỉ có "Không công ty nào khớp." (gõ "xa" lọc hết), nên eval bị chấm không đạt dù lệnh thoát 0. Lệnh ui-check:E2 là lệnh không đạt duy nhất của vòng này và nó gắn với E2.

- eval: E3
  run_id: minted-menu-con-loc-dien-thoai-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mcl_do_man
  verified_at: 2026-10-08T02:19:39Z
  screenshot: evidence/doi-chung-1440.png
  observed: |
    1440x900, dark theme, Thoả thuận table: the «Lọc» menu is open with Phụ trách, Giai đoạn (highlighted), Hạn chốt; the Giai đoạn submenu opens to the LEFT of the parent, right edge about x=1073 where the parent starts, left edge near x=865, so they sit side by side and do not overlap.
    Seven stages are listed (Demo booked 5 through Unqualified 4); the submenu is fully inside the viewport, matching Expected.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-menu-con-loc-dien-thoai-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mcl_do_man
  verified_at: 2026-10-08T02:19:39Z
  screenshot: evidence/E4-step1.png
  observed: |
    Frame hang-loat-768.png (copied to E4-step1.png and E4-step2.png): 768 px wide, "Da chon 1 dong" (Wise — expansion ticked), the "Hanh dong" menu is open with Giao nguoi phu trach, Doi giai doan and Luu tru.
    The Giao nguoi phu trach submenu opens to the left of the parent with Ada Okafor, Marcus Lindqvist and Priya Raman, about x 351..460 inside 768: not clipped, not overlapping the parent, no horizontal overflow. Matches Expected.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-menu-con-loc-dien-thoai-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mcl_lop
  verified_at: 2026-10-08T02:19:39Z
  output: |
    menu-con-dich-vao.dom.tsx, describe "lop-dich": 1 run, 1 pass, no variance.

- eval: E6
  run_id: ""
  exit_code: 0
  baseline: green
  verifier: config:executors.test.mcl_hoi_quy
  verified_at: 2026-10-08T02:19:39Z
  output: |
    Five test files unchanged against the merge-base; apps/app bang-crm-loc-ro.dom.tsx ran 9 tests across 1 file, all passed.

- eval: E7
  run_id: minted-menu-con-loc-dien-thoai-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mcl_san_thiet_ke
  verified_at: 2026-10-08T02:19:39Z
  output: |
    design-gate.mjs --mode static on dropdown-menu.tsx: no P0.
    khong-cham-noi-goi.mjs: KET LUAN 1 DUNG, 0 SAI.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T02:19:39Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T02:19:39Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T02:19:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T02:19:39Z

- cmd: bunx turbo run lint --force
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T02:19:39Z

- cmd: bun run lint:slop
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T02:19:39Z

- cmd: bunx turbo run build --force
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T02:19:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên nhánh lẫn baseline): E6. Nó là bộ hồi quy cho năm tệp kiểm cũ và pass trên cả code trước tính năng, nên chỉ chứng minh harness, không chứng minh phần sửa. Cần xác nhận đây là regression-guard có chủ ý (đúng với ý của AC-6) hoặc viết lại để assert hành vi mới.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2 failed — the 375px screenshot of the Cong ty submenu shows only the empty state "Không công ty nào khớp." because the search text "xa" matches no sample company, so the "at least one company item visible" half of Expected is not met even though the coordinates are inside [7, 368]. Returned to implementation.
