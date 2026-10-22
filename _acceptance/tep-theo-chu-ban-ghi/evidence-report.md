---
schema_version: 2
feature_slug: tep-theo-chu-ban-ghi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 87439b570e2071dcbddb728d50d2cedbe6eebb2f
human_signoff: manh 2026-10-23 — ký Cổng Bằng chứng trên vòng chấm 2 (9/9 eval máy đạt, gồm E5b thêm sau lưới trước gộp; vòng 1 REJECT vì năm lỗ đo, đã sửa) và lượt ghim lại sau gộp onehub ee42c149e. Ngoài-1, 2, 3, 4, 7, 8 ghi Known limits; Ngoài-5 chấp nhận không sửa; Ngoài-6 mở hợp đồng mới; đồng ý phần cắt; phê hết các dòng treo.
---

# Evidence Report: tep-theo-chu-ban-ghi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-tep-theo-chu-ban-ghi-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_luat
  verified_at: 2026-10-22T16:41:44Z
  output: |
    bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-luat"
    test-run: dropped crm_mvjrqoy127r5_test

- eval: E1b
  run_id: mvjrqpjocavh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_ham
  verified_at: 2026-10-22T16:41:44Z
  output: |
    bun run test -- "cd packages/auth && bun test test/quyen-tep.spec.ts -t tcb-ham"
    test-run: dropped crm_mvjrqpjocavh_test

- eval: E2
  run_id: minted-tep-theo-chu-ban-ghi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_doi_chu
  verified_at: 2026-10-22T16:41:44Z
  output: |
    bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-doi-chu"
    test-run: dropped crm_mvjrqozh6tux_test

- eval: E3
  run_id: minted-tep-theo-chu-ban-ghi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_pham_vi
  verified_at: 2026-10-22T16:41:44Z
  output: |
    bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-pham-vi"
    test-run: dropped crm_mvjrqpm71cqx_test

- eval: E4
  run_id: minted-tep-theo-chu-ban-ghi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_xoa
  verified_at: 2026-10-22T16:41:44Z
  output: |
    bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-xoa"
    test-run: dropped crm_mvjrqo8edgxy_test

- eval: E5
  run_id: minted-tep-theo-chu-ban-ghi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_o_tep
  verified_at: 2026-10-22T16:41:44Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tep-theo-chu.dom.tsx -t tcb-o-tep
    Ran 3 tests across 1 file. [1373.00ms]

- eval: E6
  run_id: minted-tep-theo-chu-ban-ghi-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_vet
  verified_at: 2026-10-22T16:41:44Z
  output: |
    bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-vet"
    test-run: dropped crm_mvjrqp0768gu_test

- eval: E7
  run_id: minted-tep-theo-chu-ban-ghi-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcb_man
  verified_at: 2026-10-22T16:41:44Z
  screenshot: evidence/tcb-phu-trach-1280.png
  observed: |
    1) tcb-phu-trach-1280: phiếu 'Thoả thuận T1 tcb', Phụ trách Ngô Thị Lan (A); trường 'Hợp đồng' có hai PDF (Phụ lục 01.pdf, Hợp đồng chính.pdf), mỗi dòng có 'Mở' và 'Xoá' bật, không có dòng lý do nào bên dưới danh sách. Khớp Expected.
    2) tcb-khong-phu-trach-375: phiên B ở 375, cùng phiếu, hai nút 'Mở' dưới từng tệp, dòng 'Chỉ Ngô Thị Lan và quản trị mở được tệp.' nằm ngay dưới danh sách tệp, chữ phụ nhỏ, xuống dòng gọn, không đè nút; không thấy cuộn ngang; không có nút Xoá. Khớp Expected (trạng thái khoá và scrollWidth do rang kiểm DOM).
    3) tcb-doi-chu-1280: phiên Q, ô 'Phụ trách' đang mở InlineSelectField với 'Trần Văn Minh' (B), header cũng 'Trần Văn Minh'; rang xác nhận db.deal.ownerId = id B. Khớp.
    4) tcb-mat-quyen-1280: phiên A, phiếu Phụ trách đã là Trần Văn Minh (B), toast đỏ 'Bạn không còn phụ trách bản ghi này nên không mở được tệp.'; 'Mở' chuyển mờ/khoá, 'Xoá' biến mất, dòng 'Chỉ Trần Văn Minh và quản trị mở được tệp.' ngay dưới danh sách. Khớp.
    5) tcb-nguoi-moi-1280: phiên B tải lại, Phụ trách Trần Văn Minh, hai dòng 'Mở' và 'Xoá' bật, không dòng lý do; rang xác nhận mở ra tab mới. Khớp.
    6) tcb-ca-nhan-1280: phiếu Cá nhân 'Hà tcb' do Ngô Thị Lan phụ trách, một PDF 'Hồ sơ cá nhân.pdf', 'Mở' mờ, dòng 'Chỉ Ngô Thị Lan và quản trị mở được tệp.' ngay dưới danh sách; rang xác nhận A mở được ở tab mới. Khớp.
    7) tcb-chua-phu-trach-375: công ty 'Công ty Bình Minh tcb', Phụ trách '—', PDF 'Hợp đồng Bình Minh.pdf', 'Mở' khoá, dòng 'Bản ghi chưa có người phụ trách nên chỉ quản trị mở được tệp.' xuống hai dòng gọn dưới danh sách, không đè nút. Khớp.
    Đối chứng bằng mắt: dòng lý do nằm sát dưới danh sách tệp, cỡ chữ phụ như mô tả ô; tên người phụ trách bọc translate="no". Không có mâu thuẫn với Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T16:41:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T16:41:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T16:41:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T16:41:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T16:41:44Z

- cmd: bun run lint:slop
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T16:41:44Z

- cmd: bunx turbo run build --force
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T16:41:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Mọi eval ghi baseline: n-a vì evals.yaml không đổi từ lần đo baseline cuối (round 1).

Không có eval nào liệt kê là không-phân-biệt. Các lệnh suite xanh ở cả hai phía là lưới hồi quy thông thường, không liệt kê.

## Variance

none — mọi eval chạy một lần, xác định, không có eval nhiều lượt nào lệch.

## Iterations

Round 1: không eval máy nào đỏ (failed_evals rỗng). Kết luận REJECT do workflow tính từ năm finding trong hợp đồng chưa xử lý: E3 (đếm tệp list/board chỉ kiểm chuỗi có mặt), E5 (tên người phụ trách truyền thẳng vào ô; ca mất quyền đếm lời gọi trên bản giả của cache), E6 (quét laPhuTrach bằng regex; bộ dò lộ URL không có đối chứng dương). Returned to implementation.
Round 2: tám eval và bảy lệnh suite đều xanh trên commit 9dbd0eb5b46bfed9c7f795ea427588fa763dc284 (sau S4 vòng 1: đếm số tệp thật, ngữ cảnh ô Tệp qua một hàm, cache thật, quét log có đối chứng). Không còn finding trong hợp đồng; chi tiết ngoài hợp đồng ở review-findings.md.


### Re-pin lần 1 — 2026-10-22, do gộp onehub ee42c149e và thêm E5b cho AC-5
run_id: repin-20261022T172926Z-14754
sha: 87439b570e2071dcbddb728d50d2cedbe6eebb2f · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E7 · AC không có chốt máy: AC-7 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
