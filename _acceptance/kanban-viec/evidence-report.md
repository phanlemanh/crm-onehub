---
schema_version: 2
feature_slug: kanban-viec
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a8e56a4af4bea67cd6a4c5a25427004f26a5c410
human_signoff:
---

# Evidence Report: kanban-viec

Vòng 2. Mọi lệnh eval và lệnh suite đều xanh, nhưng phản biện context sạch xác nhận hai chỗ yếu của phép đo thuộc AC-4 (chi tiết ở `review-findings.md`, mục «Trong hợp đồng»), nên kết luận chung là REJECT và trả về khâu làm.

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
| E12 | AC-12 | judgment | PASS |
| E15 | AC-3 | script | PASS |

## Evidence

### Eval chạy lại ở vòng 2

- eval: E1
  run_id: minted-kanban-viec-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_bang
  verified_at: 2026-10-13T17:44:24Z
  output: |
    test-run: dropped crm_mv6z15tw90rd_test

- eval: E1b
  run_id: minted-kanban-viec-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_bang
  verified_at: 2026-10-13T17:44:24Z
  output: |
    Ran 4 tests across 1 file. [942.00ms]

- eval: E4
  run_id: minted-kanban-viec-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_board
  verified_at: 2026-10-13T17:44:24Z
  output: |
    Ran 7 tests across 1 file. [595.00ms]

- eval: E4b
  run_id: minted-kanban-viec-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_keo
  verified_at: 2026-10-13T17:44:24Z
  output: |
    Ran 3 tests across 1 file. [1181.00ms]

- eval: E6b
  run_id: minted-kanban-viec-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_tra_ve
  verified_at: 2026-10-13T17:44:24Z
  output: |
    Ran 3 tests across 1 file. [1173.00ms]

### Eval mang từ vòng 1 (carry-forward)

- eval: E2
  run_id: minted-kanban-viec-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_keo
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-kanban-viec-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_ma_tran
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-kanban-viec-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_thu_tu
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-kanban-viec-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_tranh_chap
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-kanban-viec-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_con
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-kanban-viec-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_con
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-kanban-viec-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_con_quyen
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-kanban-viec-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_dong_cha
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-kanban-viec-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_hoi_cha
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-kanban-viec-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_thuoc
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-kanban-viec-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kv_man
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval (khung của lượt gốc, cùng run_id)
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
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-kanban-viec-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kv_dot_bien
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment

Panel đề xuất: PASS. Ba góc chấm, mỗi phiếu nêu đủ bên dưới. `human_override` để trống cho người quyết ở Cổng 2.

- eval: E12
  judged_by: judge-subagent (fresh context), panel ba góc: domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: CONTEXT.md mục «Việc con» (dòng 173-181) nói đủ bốn điều: một tầng, mang bản ghi gắn của cha lúc tạo, người giao và người thực hiện của cha thành người theo dõi, đóng hay huỷ cha không tự đóng con. Mục «Việc của tôi» có câu về kiểu xem Bảng bốn cột. docs/api.md mục «Việc» nêu viec.bang, viec.keo, viec.taoCon, thứ tự trong cột riêng từng người và không ghi vết, cùng hai nguồn bang-keo và bang-menu.
  votes:
    - domain-correctness: PASS — CONTEXT.md mục «Việc con» (dòng 173-181) nói đủ bốn điều: một tầng, mang bản ghi gắn của cha lúc tạo, người giao và người thực hiện của cha thành người theo dõi, đóng hay huỷ cha không tự đóng con. Mục «Việc của tôi» (dòng 183-188) có câu về kiểu xem Bảng bốn cột. Mục «Việc» của docs/api.md (dòng 499, 547-557) nêu viec.bang, viec.keo, viec.taoCon, thứ tự trong cột riêng từng người và không ghi vết, cùng hai nguồn bang-keo và bang-menu.
    - operational-feasibility: PASS — CONTEXT.md mục «Việc con» (dòng 173-178) nêu đủ bốn điều: một tầng, mang gắn của cha lúc tạo, người giao và người thực hiện của cha thành người theo dõi, đóng hay huỷ cha không tự đóng con. Mục «Việc của tôi» (dòng 185-188) có câu về kiểu xem Bảng bốn cột. docs/api.md mục «Việc» (dòng 499, đoạn 547-557) nêu viec.bang, viec.keo, viec.taoCon, thứ tự riêng từng người không ghi vết, và hai nguồn bang-keo và bang-menu.
    - spec-alignment: PASS — CONTEXT.md mục «Việc con» (dòng 173-178) nói đủ bốn điều: một tầng, mang bản ghi gắn của cha lúc tạo, người giao và người thực hiện của cha thành người theo dõi, đóng hay huỷ cha không tự đóng con. Mục «Việc của tôi» (dòng 183-188) có câu về kiểu xem Bảng bốn cột Chưa làm · Đang làm · Chờ đánh giá · Xong. docs/api.md (dòng 547-557) nêu viec.bang, viec.keo, viec.taoCon, thứ tự trong cột là riêng từng người và sắp thứ tự không ghi vết, cùng hai nguồn bang-keo và bang-menu.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-13T17:44:24Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-13T17:44:24Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-13T17:44:24Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-13T17:44:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-kanban-viec-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-13T17:44:24Z

- cmd: bun run lint:slop
  run_id: minted-kanban-viec-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-13T17:44:24Z

- cmd: bunx turbo run build --force
  run_id: minted-kanban-viec-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-13T17:44:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — baseline không đo ở vòng này nên không có eval nào được xếp là không-phân-biệt; lệnh suite xanh cả hai phía là regression-guard bình thường.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: bằng chứng S4 vòng 1 bị REJECT vì bốn chỗ yếu của phép đo DOM (mười chín eval và bảy suite xanh); đã sửa ở commit e979f5449 (thước kéo thả đi qua đường thả thật của Board, ca rỗng đòi đủ bốn cột, dòng Xong cũ so con số và đích tới, nhóm theo dõi chứng có thẻ). Returned to implementation.
Round 2: E1, E1b, E4, E4b, E6b chạy lại, các eval còn lại mang từ vòng 1; tất cả xanh, nhưng phản biện xác nhận hai chỗ yếu thuộc AC-4: lần thả trong board.dom.tsx và viec-bang.dom.tsx là KanbanMoveEvent tự ráp, không đi qua dnd-kit nên vế kéo bằng phím chưa được chứng. Returned to implementation. Ghi chú: giờ chạy chính xác của vòng 2 nằm ở trường ts trong run-log.jsonl; verified_at của vòng 2 ở trên chỉ chính xác đến ngày.
