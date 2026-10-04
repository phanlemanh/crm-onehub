---
schema_version: 2
feature_slug: kho-tai-lieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b0e84291d6a770394f91f9c24730616f21273654
human_signoff: Mạnh 2026-09-28
---

# Evidence Report: kho-tai-lieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E2b | AC-2 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8b | AC-8 | test | PASS |
| E11 | AC-11 | test | PASS |
| E13 | AC-13 | test | PASS |
| E15 | AC-15 | test | PASS |
| E16 | AC-9 | test | PASS |
| E12 | AC-12 | ui-check | PASS |
| E13b | AC-13 | ui-check | PASS |
| E14 | AC-14 | ui-check | PASS |
| E14j | AC-14 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-kho-tai-lieu-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktl_migration_chi_them
  verified_at: 2026-09-27T15:26:04Z
  output: |
    merge-base: f51b5ba1d515
    migration moi: 20260930010000_kho_tai_lieu · so cau lenh: 32

- eval: E1b
  run_id: minted-kho-tai-lieu-E1b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktl_migration_tren_ban_sao
  verified_at: 2026-09-27T15:26:04Z
  output: |
    anh chup sau: user=2 organization=1 member=2 company=3 department=2
    extension: pg_trgm, unaccent · unaccent: Quy dinh
    khang-dinh=8/8

- eval: E2
  run_id: mujz1bo701y8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_tao_trang
  verified_at: 2026-09-27T15:26:04Z
  output: |
     31 expect() calls
    Ran 4 tests across 1 file. [1128.00ms]
    test-run: dropped crm_mujz1bo701y8_test

- eval: E3
  run_id: mujz1auxtniv
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_khong_ro
  verified_at: 2026-09-27T15:26:04Z
  output: |
     72 expect() calls
    Ran 3 tests across 1 file. [2.07s]
    test-run: dropped crm_mujz1auxtniv_test

- eval: E4
  run_id: mujz1c31zz8u
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_duyet
  verified_at: 2026-09-27T15:26:04Z
  output: |
    24 expect() calls
    Ran 2 tests across 1 file. [1093.00ms]
    test-run: dropped crm_mujz1c31zz8u_test

- eval: E5
  run_id: mujz1arl123r
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ktl_quyen_duyet
  verified_at: 2026-09-27T15:26:04Z
  output: |
     297 expect() calls
    Ran 14 tests across 2 files. [9.19s]
    test-run: dropped crm_mujz1arl123r_test

- eval: E5b
  run_id: minted-kho-tai-lieu-E5b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_man_duyet_quyen
  verified_at: 2026-09-27T15:26:04Z
  output: |
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [441.00ms]

- eval: E6
  run_id: minted-kho-tai-lieu-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_so_va_dat
  verified_at: 2026-09-27T15:26:04Z
  output: |
     45 expect() calls
    Ran 4 tests across 1 file. [998.00ms]
    test-run: dropped crm_mujz1dkp18kj_test

- eval: E6b
  run_id: minted-kho-tai-lieu-E6b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_man_de_xuat_cu
  verified_at: 2026-09-27T15:26:04Z
  output: |
     0 fail
     5 expect() calls
    Ran 2 tests across 1 file. [492.00ms]

- eval: E7
  run_id: minted-kho-tai-lieu-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_tra_lai
  verified_at: 2026-09-27T15:26:04Z
  output: |
     19 expect() calls
    Ran 1 test across 1 file. [1075.00ms]
    test-run: dropped crm_mujz1bgyhque_test

- eval: E8
  run_id: mujz1c695e3t
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_sua_trang
  verified_at: 2026-09-27T15:26:04Z
  output: |
     26 expect() calls
    Ran 2 tests across 1 file. [1066.00ms]
    test-run: dropped crm_mujz1c695e3t_test

- eval: E9
  run_id: minted-kho-tai-lieu-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_trinh_soan_nut
  verified_at: 2026-09-27T15:26:04Z
  output: |
     0 fail
     51 expect() calls
    Ran 25 tests across 1 file. [890.00ms]

- eval: E9b
  run_id: minted-kho-tai-lieu-E9b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_soan_giu_thay_doi
  verified_at: 2026-09-27T15:26:04Z
  output: |
    0 fail
    29 expect() calls
    Ran 10 tests across 1 file. [1094.00ms]

- eval: E10
  run_id: minted-kho-tai-lieu-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_khu_hoi
  verified_at: 2026-09-27T15:26:04Z
  output: |
     0 fail
     30 expect() calls
    Ran 17 tests across 1 file. [817.00ms]

- eval: E10b
  run_id: minted-kho-tai-lieu-E10b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_de_xuat_trung
  verified_at: 2026-09-27T15:26:04Z
  output: |
     9 expect() calls
    Ran 1 test across 1 file. [840.00ms]
    test-run: dropped crm_mujz1zq92zm2_test

- eval: E10c
  run_id: mujz1l81xl5s
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_bat_dong_qua_may_chu
  verified_at: 2026-09-27T15:26:04Z
  output: |
     17 expect() calls
    Ran 1 test across 1 file. [839.00ms]
    test-run: dropped crm_mujz1l81xl5s_test

- eval: E10d
  run_id: minted-kho-tai-lieu-E10d-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_man_sua_chua_doi
  verified_at: 2026-09-27T15:26:04Z
  output: |
     0 fail
     13 expect() calls
    Ran 3 tests across 1 file. [575.00ms]

- eval: E2b
  run_id: minted-kho-tai-lieu-E2b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_man_tao_loi
  verified_at: 2026-09-27T15:26:04Z
  output: |
     0 fail
     9 expect() calls
    Ran 3 tests across 1 file. [590.00ms]

- eval: E7b
  run_id: minted-kho-tai-lieu-E7b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_man_tra_lai
  verified_at: 2026-09-27T15:26:04Z
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [387.00ms]

- eval: E8b
  run_id: mujz1pgru6ll
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_man_sua_va_nhan
  verified_at: 2026-09-27T15:26:04Z
  output: |
    test-run: dropped crm_mujz1pgru6ll_test

    Summary: 1 pass, 0 fail, 16 expect() calls

- eval: E11
  run_id: minted-kho-tai-lieu-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_dan_tu_word
  verified_at: 2026-09-27T15:26:04Z
  output: |
     0 fail
     12 expect() calls
    Ran 12 tests across 1 file. [763.00ms]

- eval: E13
  run_id: mujz1sr39wpc
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_diff
  verified_at: 2026-09-27T15:26:04Z
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [791.00ms]
    test-run: dropped crm_mujz1sr39wpc_test

- eval: E15
  run_id: mujz1wo7ifxq
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktl_lien_ket_tim
  verified_at: 2026-09-27T15:26:04Z
  output: |
     21 expect() calls
    Ran 1 test across 1 file. [919.00ms]
    test-run: dropped crm_mujz1wo7ifxq_test

- eval: E16
  run_id: design-gate-0076fb79ae
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ktl_san_thiet_ke
  verified_at: 2026-09-27T15:26:04Z
  output: |
      "hits": [],
      "findings": []
    }

- eval: E12
  run_id: minted-kho-tai-lieu-E12-r3
  exit_code: 0
  verifier: config:executors.script.ktl_bo_go_viet
  verified_at: 2026-09-27T15:26:04Z
  screenshot: /Users/manhphan/dev/crm-onehub/.claude/worktrees/kho-tai-lieu/evidence/E12-step1.png
  observed: |
    evidence/E12-step1.png: màn /tai-lieu/moi, trường "Tên trang" = "Quy định về hoa hồng đối tác 4urr" (tên + hậu tố ngẫu nhiên), ô soạn (viền xanh, đang focus) hiển thị đúng một dòng "Quy định về hoa hồng đối tác" — đủ dấu, đúng NFC, không lặp/mất chữ, khớp chuỗi mong đợi DONG_1.
    evidence/E12-step2.png: cùng màn, ô soạn giờ có 3 khối: dòng 1 "Quy định về hoa hồng đối tác", dòng 2 "Nguyên tắc hài hoà" (chữ "hoà" đúng — ca khó composition 'hoa'->'hoà' rồi Enter ngay giữa lúc đang gõ, không cắt/lặp), và danh sách gạch đầu dòng 2 mục "mục một"/"mục hai" đúng thứ tự. Khớp hoàn toàn Expected, không thấy ký tự rác hay dấu hỏng.
  network_observed: n-a (driver)

- eval: E13b
  run_id: minted-kho-tai-lieu-E13b-r3
  exit_code: 0
  verifier: config:executors.script.ktl_man_duyet
  verified_at: 2026-09-27T15:26:04Z
  screenshot: /Users/manhphan/dev/crm-onehub/.claude/worktrees/kho-tai-lieu/.acceptance-runs/kho-tai-lieu/evidence/ktl-duyet-1440.png
  observed: |
    ktl-duyet-1440.png (1440px, màn Chờ duyệt -> đề xuất): thấy rõ "48" gạch ngang màu đỏ (del) và "24" nền xanh + gạch chân (ins) trong dòng "Đối tác gửi bảng kê trong 48 24 giờ sau khi chốt kỳ." Câu về tài chính bị gạch ngang toàn bộ (del - câu bỏ); câu mới về Phòng Đối tác được nền xanh toàn bộ (ins - câu thêm). Nút "Duyệt"/"Trả lại" hiện diện, header đúng "Bản đề xuất · Phạm Thu Hà · 27/09/2026" và khung "48 giờ → 24 giờ". Khớp Expected bước 1.
    ktl-duyet-390.png (390px, cùng màn): nội dung xếp lại theo chiều dọc, không cuộn ngang, không tràn — khớp Expected bước 2.
    ktl-doc-sau-duyet.png (màn đọc sau khi bấm Duyệt): tiêu đề phụ "Phiên bản 2 · duyệt 27/09/2026" đúng định dạng và đúng ngày hệ thống; nội dung đã chốt "24 giờ", câu mới còn lại, câu cũ đã mất; nút "Sửa trang" và sidebar "Chủ trang: Lê Văn An" xuất hiện — khớp Expected bước 3. Không mâu thuẫn nào giữa frame và Expected.
  network_observed: n-a (driver)

- eval: E14
  run_id: e14-kjz5kq8 (chinh) + e14-kjz6xzr (chieu-do)
  exit_code: 0
  verifier: config:executors.script.ktl_man_danh_sach
  verified_at: 2026-09-27T15:26:04Z
  screenshot: /Users/manhphan/dev/crm-onehub/.claude/worktrees/kho-tai-lieu/.acceptance-runs/kho-tai-lieu/evidence/ktl-kho-rong.png
  observed: |
    ktl-kho-rong.png: màn /tai-lieu rỗng đúng mẫu, chữ "Chưa có trang nào" và nút xanh "Viết trang đầu tiên" hiện rõ — khớp Expected bước 1.
    ktl-danh-sach-1440.png: bảng 5 trang, tab "Trang"/"Chờ duyệt" với badge số 2 cạnh "Chờ duyệt", hàng nhóm theo DEM_LOAI, 2 hàng có thẻ "Có bản chờ duyệt" đúng người đang xem — khớp Expected bước 2.
    ktl-danh-sach-390.png: cùng danh sách ở 390px, xếp dạng thẻ dọc, không tràn/cuộn ngang, tab Chờ duyệt vẫn báo 2 — khớp Expected bước 3.
    ktl-doc-390.png: màn đọc trang ở 390, dòng "Quy định · Phiên bản 1 · duyệt 27/09/2026", nội dung Markdown hiện đủ, không tràn ngang — khớp Expected bước 3.
    ktl-doc-1440.png: màn đọc ở 1440 có cột "Trên trang này" (mục lục) và khối "Chủ trang: Trần Thị Mai", dòng tiêu đề đúng — khớp đủ 4 assertion bước 4.
  network_observed: n-a (driver)

- eval: E14j
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: |
    Panel đề xuất PASS trên toàn bộ ảnh của E13b/E14: nhãn thuần Việt không thuật ngữ kỹ thuật (markdown/diff/hash không xuất hiện ở đâu), danh sách gắn nhãn "Có bản chờ duyệt" và tab "Chờ duyệt" phân biệt trang đang dùng với trang chờ, nút "+ Trang mới"/"Viết trang đầu tiên" rõ ràng để viết trang mới, và màn duyệt hiện đúng kiểu Track Changes (chữ thêm nền/gạch chân xanh, chữ bỏ gạch ngang đỏ) kèm nút "Duyệt"/"Trả lại". Bố cục 390 giữ đủ các nhãn và diff một cột, không tràn.
    - domain-correctness: PASS — nhãn "Có bản chờ duyệt" và tab "Chờ duyệt" phân biệt trang đang dùng/chờ; nút viết/duyệt rõ; màn duyệt đọc như Track Changes chứ không như màn lập trình viên; bản 390 giữ đủ thông tin không tràn/mất nhãn.
    - operational-feasibility: PASS — tín hiệu tự nhiên không thuật ngữ kỹ thuật, tab "Chờ duyệt (2)" và nút "+ Trang mới" nổi bật, màn duyệt ở cả 1440 và 390 hiện đúng kiểu Track Changes với nút Duyệt/Trả lại rõ ràng, bố cục 390 đọc được không tràn.
    - spec-alignment: PASS — bảy ảnh cho đủ chuỗi tự nhiên bằng nhãn thuần Việt, danh sách/tab phân biệt trạng thái, nút Trang mới rõ, màn duyệt đúng kiểu Track Changes kèm dải "Con số và ngày bị đổi" và hai nút Duyệt/Trả lại; bố cục 390 giữ đủ yếu tố này.
  human_override: Đạt — Mạnh 2026-09-28

## Known limits

## Ngoài hợp đồng

## Analyst

- E5 (`bun run test -- "cd apps/api && bun test test/tai-lieu-quyen.spec.ts test/vai-chi-okr.spec.ts"`) — pass trên cả HEAD và baseline (green): không phân biệt, cần xem lại có phải regression-guard chủ ý hay cần viết lại để assert hành vi mới.
- E16 (design-gate static scan trên các tệp UI/component mới) — pass trên cả HEAD và baseline (green): không phân biệt, cần xem lại có phải regression-guard chủ ý hay cần viết lại để assert hành vi mới.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E13b (bảng trong màn duyệt) sai và hai lệnh suite (`bun run lint:slop`, `bunx turbo run build --force`) đỏ — REJECT, quay lại implementation.
Round 2: sửa bảng trong màn duyệt, thêm đối chứng dương cho ca đổi-số-cột, ghim đúng ô; E14j bổ sung ảnh ktl-duyet-390. Vẫn PENDING-JUDGMENT vì T3 chờ human_override cho E14j.
Round 3: toàn bộ eval máy PASS (E5, E16 không phân biệt với baseline, xem Analyst); judge panel đề xuất PASS cho E14j — verdict tổng vẫn PENDING-JUDGMENT vì T3 bắt buộc human_override trên MỌI mục judgment, bất kể phiếu của judge.

### Re-pin lần 1 — 2026-09-27, do gộp onehub (55 commit) trước khi mở PR
run_id: repin-20260927T214203Z-71497
sha: cea37af8b3b2e75f555c7322086cc57cb67571b2 · suites: 4 lệnh exit 0 · evals: 24/24 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13b, E14, E14j (E14j không khai paths) · AC không có chốt máy: AC-12, AC-14

### Re-pin lần 2 — 2026-09-27, do gộp onehub #178 #179, dời migration sang 20261001010000, trần diff-trang-dai 6 giây trên CI
run_id: repin-20260927T230826Z-11703
sha: 455047df0485976db93f549ae9c3b810f38b5314 · suites: 4 lệnh exit 0 · evals: 24/24 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13b, E14, E14j (E14j không khai paths) · AC không có chốt máy: AC-12, AC-14

### Re-pin lần 3 — 2026-10-04, do sửa thước theo diff sau gộp và khai paths (lô a)
run_id: repin-20261004T095914Z-97808
sha: b0e84291d6a770394f91f9c24730616f21273654 · suites: 7 lệnh exit 0 · evals: 24/24 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13b, E14, E14j · diff chạm vật đo ngoài làn máy: E12, E13b, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-12, AC-14
