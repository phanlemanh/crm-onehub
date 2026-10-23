---
schema_version: 2
feature_slug: cai-dat-chung-chi-quan-tri
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6fdc7ed4587ef09283181bd35699a668ab3faa27
human_signoff: Phan Le Manh 2026-09-25
---

# Evidence Report: cai-dat-chung-chi-quan-tri

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
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cai-dat-chung-chi-quan-tri-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_ham_quyen
  verified_at: 2026-09-25T04:43:27Z
  output: |
     0 fail
     6 expect() calls
    Ran 6 tests across 1 file. [169.00ms]

- eval: E2
  run_id: mugh7elc45di
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_member_bi_chan
  verified_at: 2026-09-25T04:43:27Z
  output: |
    Ran 1 test across 1 file. [896.00ms]
    test-run: dropped crm_mugh7elc45di_test
    EXIT_CODE=0

- eval: E3
  run_id: minted-cai-dat-chung-chi-quan-tri-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_quan_tri_lam_duoc
  verified_at: 2026-09-25T04:43:27Z
  output: |
    Ran 1 test across 1 file. [855.00ms]
    test-run: dropped crm_mugh7iu3xyz8_test

- eval: E4
  run_id: minted-cai-dat-chung-chi-quan-tri-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_member_doc_duoc
  verified_at: 2026-09-25T04:43:27Z
  output: |
    test-run: dropped crm_mugh726q545w_test

    Test ccq-member-doc-duoc PASSED

- eval: E5
  run_id: mugh72r9l2wd
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_co_quyen
  verified_at: 2026-09-25T04:43:27Z
  output: |
     19 expect() calls
    Ran 1 test across 1 file. [1016.00ms]
    test-run: dropped crm_mugh72r9l2wd_test

- eval: E6
  run_id: minted-cai-dat-chung-chi-quan-tri-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_cong_nghien_cuu
  verified_at: 2026-09-25T04:43:27Z
  output: |
     0 fail
     7 expect() calls
    Ran 7 tests across 1 file. [39.00ms]

- eval: E7
  run_id: minted-cai-dat-chung-chi-quan-tri-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_man_khoa
  verified_at: 2026-09-25T04:43:27Z
  output: |
     0 fail
     43 expect() calls
    Ran 7 tests across 1 file. [582.00ms]

- eval: E8
  run_id: minted-cai-dat-chung-chi-quan-tri-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_cong_hoi_quy
  verified_at: 2026-09-25T04:43:27Z
  output: |
    DUNG khoi cu 30, con nguyen 30
    KET LUAN: 31 DUNG, 0 SAI — ma thoat 0

- eval: E9
  run_id: minted-cai-dat-chung-chi-quan-tri-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_chup_hai_vai
  verified_at: 2026-09-25T04:43:27Z
  screenshot: _acceptance/cai-dat-chung-chi-quan-tri/evidence/E9-quan-tri-1440.png
  observed: |
    Mở trực tiếp 4 file PNG vừa lưu bằng Read và so từng ảnh với Expected:
    - E9-quan-tri-1440.png (admin, 1440px): 3 card "Nghiên cứu công ty" (Khoá API Context), "Bản ghi đã xoá", "Tác nhân nghiên cứu" — KHÔNG có dòng "Chỉ chủ sở hữu hoặc quản trị mới đổi được…" dưới control nào; input "Dọn hẳn bản ghi đã xoá sau" hiện "180" (không trống); không tràn ngang (viewport 1440 vừa đủ).
    - E9-quan-tri-768.png (admin, 768px): giống hệt về nội dung — không có dòng lý do ở 3 card, ô số ngày hiện "180", toàn bộ nội dung nằm gọn trong 768px, không có thanh cuộn ngang hay phần tử bị cắt.
    - E9-thanh-vien-1440.png (member, 1440px): cả 3 card đều có thêm dòng lý do — "Chỉ chủ sở hữu hoặc quản trị mới đổi được khoá." (card Khoá API Context/Nghiên cứu công ty), "Chỉ chủ sở hữu hoặc quản trị mới đổi được hạn dọn." (card Bản ghi đã xoá), "Chỉ chủ sở hữu hoặc quản trị mới đổi được model." (card Tác nhân nghiên cứu); ô số ngày vẫn hiện "180"; không tràn ngang.
    - E9-thanh-vien-768.png (member, 768px): cùng 3 dòng lý do xuất hiện ở cả 3 card, số ngày hiện "180", toàn bộ layout gọn trong 768px, không phần tử nào tràn mép phải.
    Cả 4 ảnh đều tồn tại và khớp Expected: bản thành viên có dòng lý do ở cả ba card + control khoá, bản quản trị không có dòng lý do + control sáng, ô số ngày luôn có giá trị, khổ 768 không tràn ngang.
  network_observed: n-a (driver)

- eval: E10
  run_id: mugh72j5fv1f
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ccq_cong_that
  verified_at: 2026-09-25T04:43:27Z
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [1043.00ms]
    test-run: dropped crm_mugh72j5fv1f_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mugh70zikp7u
  exit_code: 0
  verified_at: 2026-09-25T04:43:27Z

- cmd: bunx turbo run lint --force
  run_id: minted-cai-dat-chung-chi-quan-tri-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-25T04:43:27Z

- cmd: bun run lint:slop
  run_id: minted-cai-dat-chung-chi-quan-tri-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-25T04:43:27Z

- cmd: bunx turbo run build --force
  run_id: minted-cai-dat-chung-chi-quan-tri-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-25T04:43:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay

none — every feature eval is red on baseline (discriminates)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: SUITE bun_run_test thất bại và E9 ui-check không đo được (hết giờ chờ hydrate) — REJECT, quay lại triển khai.
Round 2: Toàn bộ eval đạt — PASS, nhưng nhánh sau đó gộp thêm onehub (#136) nên cây đã trôi khỏi bản đã ký, cần verify lại.
Round 3: BLOCKED — E9 không được đo vì phiên verify trước nhận nhầm một nhiệm vụ khác (yêu cầu gộp PR ngoài phạm vi) và đã đúng đắn từ chối thay vì tự đo bừa; chạy lại vòng mới ở round 4.

### Re-pin lần 1 — 2026-10-23, do F28 ho-so-do-kiem-cheo: sua thuoc ho so da ky kiem cheo goi ten (Cong Pham vi 23/10)
run_id: repin-20261023T105529Z-32502
sha: 6fdc7ed4587ef09283181bd35699a668ab3faa27 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E9 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
