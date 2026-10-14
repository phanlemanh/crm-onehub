---
schema_version: 2
feature_slug: kanban-viec
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c2fd454bd341049a7b949ed31ef862d74a3aabaf
human_signoff: manh 2026-10-14
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

Vòng 3 chạy lại bảy eval E1, E1b, E4, E4b, E6b, E7b, E9b (khối bên dưới mang run_id hậu tố r3). Mười một eval còn lại giữ nguyên từ vòng 1 vì delta không chạm paths của chúng; mỗi khối đó có dòng carried_from_round.

## Evidence

- eval: E1
  run_id: minted-kanban-viec-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_bang
  verified_at: 2026-10-13T18:09:07Z
  output: |
    test-run: dropped crm_mv6zx0y9s5b0_test

- eval: E1b
  run_id: minted-kanban-viec-E1b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_bang
  verified_at: 2026-10-13T18:09:07Z
  output: |
    Ran 4 tests across 1 file. [1048.00ms]

- eval: E2
  run_id: minted-kanban-viec-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_keo
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-kanban-viec-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_ma_tran
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-kanban-viec-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_board
  verified_at: 2026-10-13T18:09:07Z
  output: |
    Ran 9 tests across 1 file. [1229.00ms]

- eval: E4b
  run_id: minted-kanban-viec-E4b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_keo
  verified_at: 2026-10-13T18:09:07Z
  output: |
    Ran 3 tests across 1 file. [1.63s]

- eval: E5
  run_id: minted-kanban-viec-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_thu_tu
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-kanban-viec-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_tranh_chap
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-kanban-viec-E6b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_tra_ve
  verified_at: 2026-10-13T18:09:07Z
  output: |
    Ran 3 tests across 1 file. [1468.00ms]

- eval: E7
  run_id: minted-kanban-viec-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_con
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-kanban-viec-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_con
  verified_at: 2026-10-13T18:09:07Z
  output: |
    Ran 3 tests across 1 file. [1479.00ms]

- eval: E8
  run_id: minted-kanban-viec-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_con_quyen
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-kanban-viec-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_dong_cha
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-kanban-viec-E9b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_man_hoi_cha
  verified_at: 2026-10-13T18:09:07Z
  output: |
    Ran 2 tests across 1 file. [2.24s]

- eval: E10
  run_id: minted-kanban-viec-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kv_thuoc
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-kanban-viec-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kv_man
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval (khung của lượt gốc, ảnh còn trên đĩa)
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
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-kanban-viec-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kv_dot_bien
  verified_at: 2026-10-13T17:12:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-13T18:09:07Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-13T18:09:07Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-13T18:09:07Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kanban-viec-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-13T18:09:07Z

- cmd: bunx turbo run lint --force
  run_id: minted-kanban-viec-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-13T18:09:07Z

- cmd: bun run lint:slop
  run_id: minted-kanban-viec-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-13T18:09:07Z

- cmd: bunx turbo run build --force
  run_id: minted-kanban-viec-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-13T18:09:07Z

### Phán đoán (judgment)

- eval: E12
  judged_by: hội đồng ba lăng kính (fresh context), panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round 2
  verdict: PASS
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  rationale: đề xuất PASS của hội đồng, mang từ round 2; chỉ là ý kiến tư vấn, người chốt ở Cổng 2.
  human_override: Đạt — manh 2026-10-14

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Mọi field baseline ở trên ghi n-a vì round này không đo lại (evals.yaml không đổi từ lần baseline cuối, round 1). Không có eval nào được liệt kê là không-phân-biệt; các lệnh suite xanh cả hai phía là regression-guard bình thường.

## Variance

none — mọi eval chạy một lần, kết quả đồng nhất.

## Iterations

Round 1: trả về sửa — thước kéo thả đi qua đường thả thật của Board; ca rỗng đòi đủ bốn cột; dòng Xong cũ so con số và đích tới (commit e979f5449).
Round 2: bị REJECT vì lần thả trong thước DOM tự ráp sự kiện; sửa bằng cách cho thước đi qua kéo phím thật của dnd-kit (commit b225c47ce).
Round 3: chạy lại E1, E1b, E4, E4b, E6b, E7b, E9b cùng bảy lệnh suite, tất cả xanh; mười một eval còn lại carry từ round 1; E12 giữ panel round 2. Verdict PENDING-JUDGMENT vì E12 chờ người chốt. Lưu ý: verified_at của khối r3 ghi theo ngày chạy (2026-10-14), máy không cấp dấu giờ.

### Re-pin lần 1 — 2026-10-14, do gộp onehub c4c8ab0ab (l3b #391), dời mốc migration, đổi tên khung xương bản mẫu theo luật NM1
run_id: repin-20261014T044129Z-34587
sha: c2fd454bd341049a7b949ed31ef862d74a3aabaf · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E11, E12 (E12 không khai paths) · AC không có chốt máy: AC-12 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
