---
schema_version: 2
feature_slug: kanban-viec
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 12dfb4bb7d4290809be540f2f8e0bf1da4696a35
human_signoff:
---

# Evidence Report: kanban-viec

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | ui-check | PASS |
| E11b | AC-11 | script | PASS |
| E12 | AC-12 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |
| E15 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-kanban-viec-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_bang
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9as07gsc_test

- eval: E1b
  run_id: minted-kanban-viec-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_bang
  verified_at: 2026-10-13T17:12:46Z
  output: |
    Ran 4 tests across 1 file. [1182.00ms]

- eval: E2
  run_id: minted-kanban-viec-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_keo
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9abbr2ie_test

- eval: E3
  run_id: minted-kanban-viec-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_ma_tran
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9bnsmjzh_test

- eval: E4
  run_id: minted-kanban-viec-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_board
  verified_at: 2026-10-13T17:12:46Z
  output: |
    Ran 6 tests across 1 file. [896.00ms]

- eval: E4b
  run_id: minted-kanban-viec-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_keo
  verified_at: 2026-10-13T17:12:46Z
  output: |
    Ran 3 tests across 1 file. [1396.00ms]

- eval: E5
  run_id: minted-kanban-viec-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_thu_tu
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9e11nq71_test

- eval: E6
  run_id: minted-kanban-viec-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_tranh_chap
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9asmg4u2_test

- eval: E6b
  run_id: minted-kanban-viec-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_tra_ve
  verified_at: 2026-10-13T17:12:46Z
  output: |
    Ran 3 tests across 1 file. [1.52s]

- eval: E7
  run_id: minted-kanban-viec-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_con
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9atpp6e5_test

- eval: E7b
  run_id: minted-kanban-viec-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_con
  verified_at: 2026-10-13T17:12:46Z
  output: |
    Ran 3 tests across 1 file. [1.89s]

- eval: E8
  run_id: minted-kanban-viec-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_con_quyen
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9bk8qf71_test

- eval: E9
  run_id: minted-kanban-viec-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_dong_cha
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9b2emfxr_test

- eval: E9b
  run_id: minted-kanban-viec-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_hoi_cha
  verified_at: 2026-10-13T17:12:46Z
  output: |
    Ran 2 tests across 1 file. [2.00s]

- eval: E10
  run_id: minted-kanban-viec-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_thuoc
  verified_at: 2026-10-13T17:12:46Z
  output: |
    test-run: dropped crm_mv6y9g07s4gd_test

- eval: E11
  run_id: minted-kanban-viec-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kv_man
  verified_at: 2026-10-13T17:12:46Z
  screenshot: evidence/kv-bang-1280.png
  observed: |
    kv-bang-1280.png: tiêu đề "Việc của tôi", thẻ "Giao cho tôi 6", nút Danh sách/Bảng (Bảng đang chọn). Bốn cột có số đếm: Chưa làm 4, Đang làm 1, Chờ đánh giá 1, Đã xong 1 (nhãn cột 4 là "Đã xong", Expected viết "Xong"). Thẻ cha "Triển khai đại lý An Phát" có nhãn "1/2 việc con xong". Thẻ con "Đặt lịch đào tạo môi giới" có dòng "Thuộc: Triển khai đại lý An Phát". Mỗi thẻ có nút "Chuyển sang…". Thẻ "Chờ đánh giá" có nút mờ kèm dòng "Chỉ người giao xử lý việc đang chờ đánh giá." Ảnh bị cắt ở đáy, thấy lấp ló dòng gập bên dưới bảng; chữ "Đã huỷ (1)" xác nhận bằng grep trong kv-bang-1280.html.
    kv-menu-1280.png: menu mở trên thẻ "Gửi bảng phí mới cho anh Tuấn", tiêu đề "Chuyển «Gửi bảng phí mới cho anh Tuấn k6y9xuh» sang", chỉ ba đích: Bắt đầu, Gửi đánh giá, Xong. Không có Huỷ hay Chưa làm, tức chỉ các đích được phép.
    kv-hoi-dong-cha-1280.png: hộp thoại "Việc cha còn việc con chưa xong" với nội dung "Việc này còn 1 việc con chưa xong. Vẫn đánh dấu xong?" và hai nút "Thôi", "Vẫn đánh dấu xong". Nêu đúng số việc con chưa xong.
    kv-bang-375.png: ở 375 có ô chọn kiểu xem "Bảng" kèm mũi tên xổ. Bảng nằm trong khung riêng, cột "Chưa làm" hiện đủ, cột "Đang là…" bị cắt bên phải nên cuộn ngang trong khung. Trang không cuộn ngang, man.mjs đo scrollWidth ≤ 375 không báo lỗi. Thẻ "Đặt lịch đào tạo môi giới" có dòng "Thuộc: Triển khai đại lý An Phát".
    kv-khung-cha-1280.png: khung chi tiết bên phải "Triển khai đại lý An Phát k6y9xuh", mục "Việc con (1/2)" có nút "Thêm việc con". Liệt kê hai việc con: Ký phụ lục hoa hồng (Đã xong) và Đặt lịch đào tạo môi giới (Chưa làm).
    kv-khung-con-1280.png: khung chi tiết của việc con "Đặt lịch đào tạo môi giới", có dòng "Thuộc việc: Triển khai đại lý An Phát k6y9xuh" ở dạng liên kết xanh. Không có mục "Việc con" và không có nút "Thêm việc con".
    Tất cả khớp Expected.
  network_observed: n-a (driver)

- eval: E11b
  run_id: minted-kanban-viec-E11b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kv_san_thiet_ke
  verified_at: 2026-10-13T17:12:46Z
  output: |
    kv san: 13 tep, 0 vi pham

- eval: E12
  judged_by: hội đồng đề xuất ba góc nhìn (fresh context): domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS (đề xuất, chờ người chốt)
  rationale: CONTEXT.md mục «Việc con» (dòng 173-178) nói đủ bốn điều: một tầng, mang bản ghi gắn của cha lúc tạo, người giao và người thực hiện của cha thành người theo dõi, đóng hay huỷ cha không tự đóng con. Mục «Việc của tôi» (dòng 183-188) có câu về kiểu xem Bảng bốn cột. docs/api.md mục «Việc» (dòng 547-557) nêu viec.bang, viec.keo, viec.taoCon, thứ tự cột là của riêng từng người, sắp thứ tự không ghi vết, và hai nguồn bang-keo, bang-menu.
  votes:
    - domain-correctness: PASS — đọc các dòng 173-178 và 183-188 của CONTEXT.md cùng dòng 547-557 của docs/api.md, đủ ba ý; chưa đọc tiêu đề mục chứa chúng nhưng chúng nằm ngay trước mục «The organization tree» nên thuộc mục Việc.
    - operational-feasibility: PASS — cả ba điều đều có trong hai tệp: bốn điều của «Việc con», câu kiểu xem Bảng bốn cột ở «Việc của tôi» (dòng 185-188), và viec.bang, viec.keo, viec.taoCon cùng hai nguồn bang-keo, bang-menu ở docs/api.md.
    - spec-alignment: PASS — (1) CONTEXT.md dòng 173-178 nói đủ bốn điều của «Việc con»; (2) dòng 183-188 có câu về kiểu xem Bảng bốn cột Chưa làm · Đang làm · Chờ đánh giá · Xong; (3) docs/api.md dòng 547-557 nêu viec.bang, viec.keo, viec.taoCon, thứ tự riêng từng người «sắp thứ tự không ghi vết», hai nguồn bang-keo và bang-menu.
  human_override:  # chi nguoi ghi

- eval: E15
  run_id: minted-kanban-viec-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kv_dot_bien
  verified_at: 2026-10-13T17:12:46Z
  output: |
    dot-bien: 13/13 cap dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T17:12:46Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T17:12:46Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T17:12:46Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T17:12:46Z

- cmd: bunx turbo run lint --force
  run_id: minted-kanban-viec-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T17:12:46Z

- cmd: bun run lint:slop
  run_id: minted-kanban-viec-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T17:12:46Z

- cmd: bunx turbo run build --force
  run_id: minted-kanban-viec-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T17:12:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào green-on-both: baseline không đo được cho mọi eval mới (xem «Baseline khong do» dưới đây), nên chưa có eval nào được xác nhận red trên code cũ.

Baseline khong do:

- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-bang.spec.ts -t kv-bang": bo qua baseline: tep apps/api/test/viec-bang.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-bang.dom.tsx -t kv-man-bang: bo qua baseline: tep apps/app/test/viec-bang.dom.tsx co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-bang.spec.ts -t kv-keo": bo qua baseline: tep apps/api/test/viec-bang.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-bang.spec.ts -t kv-ma-tran": bo qua baseline: tep apps/api/test/viec-bang.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/board.dom.tsx -t 'board-can-drop|board-reorder|board-cu': bo qua baseline: tep packages/ui/test/board.dom.tsx co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-bang.dom.tsx -t kv-man-keo: bo qua baseline: tep apps/app/test/viec-bang.dom.tsx co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-thu-tu.spec.ts" && bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-bang.spec.ts -t kv-thu-tu": bo qua baseline: tep packages/db/test/viec-thu-tu.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-bang.spec.ts -t kv-tranh-chap": bo qua baseline: tep apps/api/test/viec-bang.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-bang.dom.tsx -t kv-man-tra-ve: bo qua baseline: tep apps/app/test/viec-bang.dom.tsx co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-con.spec.ts -t kv-con-tao": bo qua baseline: tep apps/api/test/viec-con.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-con.dom.tsx -t kv-man-con: bo qua baseline: tep apps/app/test/viec-con.dom.tsx co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-con.spec.ts -t kv-con-quyen": bo qua baseline: tep apps/api/test/viec-con.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-con.spec.ts -t kv-dong-cha": bo qua baseline: tep apps/api/test/viec-con.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-con.dom.tsx -t kv-man-hoi-cha: bo qua baseline: tep apps/app/test/viec-con.dom.tsx co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/viec-bang-do-nguong.spec.ts": bo qua baseline: tep apps/api/test/viec-bang-do-nguong.spec.ts co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kanban-viec/rang/san-thiet-ke.mjs: bo qua baseline: tep _acceptance/kanban-viec/rang/san-thiet-ke.mjs co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kanban-viec/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/kanban-viec/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base b1b083823d2825c62a7fa79656ba9f06da0cfaf5 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đều xanh nhưng bốn finding trong hợp đồng (E4b/E4 chưa thật sự thả thẻ vào cột cấm, E1b rỗng và dòng Xong cũ kiểm lỏng, nhóm theo dõi kiểm âm có thể xanh giả) làm verdict là REJECT; chi tiết ở review-findings.md. Returned to implementation.
