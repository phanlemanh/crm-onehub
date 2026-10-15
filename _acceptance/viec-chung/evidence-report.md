---
schema_version: 2
feature_slug: viec-chung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c47118823bf5ccd96e39634b0e603b449147bb96
human_signoff: Mạnh 2026-10-13 — ký Cổng 2 trên S4 lượt 2 (23/23 eval máy PASS, 4 mang từ lượt 1; E15 Đạt). Ngoài-3, 4, 5, 7, 11, 14 ghi Known limits; 13 mục còn lại chấp nhận, không sửa (11 mục lượt 1 đã sửa); đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: viec-chung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E16 | AC-3 | script | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS (carry-forward round 1) |
| E11b | AC-11 | test | PASS (carry-forward round 1) |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | ui-check | PASS |
| E13b | AC-13 | script | PASS |
| E14 | AC-14 | test | PASS (carry-forward round 1) |
| E14b | AC-14 | test | PASS (carry-forward round 1) |
| E15 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-viec-chung-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_tao
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa0alzwxl_test

- eval: E1b
  run_id: minted-viec-chung-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_man_o_soan
  verified_at: 2026-10-13T06:11:37Z
  output: |
    Ran 9 tests across 1 file. [1466.00ms]

- eval: E2
  run_id: minted-viec-chung-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_gan
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa0l6maqb_test

- eval: E3
  run_id: minted-viec-chung-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_trang_thai
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa0hjdk8h_test

- eval: E16
  run_id: minted-viec-chung-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vc_dot_bien
  verified_at: 2026-10-13T06:11:37Z
  output: |
    dot-bien: 14/14 cap dat

- eval: E4
  run_id: minted-viec-chung-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_sua
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa0dombsc_test

- eval: E4b
  run_id: minted-viec-chung-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_man_khung
  verified_at: 2026-10-13T06:11:37Z
  output: |
    Ran 15 tests across 1 file. [1.97s]

- eval: E5
  run_id: minted-viec-chung-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_vai_okr
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa0m23d9r_test

- eval: E6
  run_id: minted-viec-chung-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_xem
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa0eahtq9_test

- eval: E7
  run_id: minted-viec-chung-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_cua_toi
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa0xcjlis_test

- eval: E7b
  run_id: minted-viec-chung-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_man_cua_toi
  verified_at: 2026-10-13T06:11:37Z
  output: |
    Ran 6 tests across 1 file. [1052.00ms]

- eval: E7c
  run_id: minted-viec-chung-E7c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_man_trang_thai
  verified_at: 2026-10-13T06:11:37Z
  output: |
    Ran 4 tests across 1 file. [912.00ms]

- eval: E8
  run_id: mv6aa03zz49x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_nhac_vai_okr
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa03zz49x_test

- eval: E9
  run_id: minted-viec-chung-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_nhac
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa0f46m2v_test

- eval: E10
  run_id: mv6aa18ul04g
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_xong_n
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa18ul04g_test

- eval: E12
  run_id: minted-viec-chung-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_vong_doi
  verified_at: 2026-10-13T06:11:37Z
  output: |
    test-run: dropped crm_mv6aa7atcnel_test

- eval: E13b
  run_id: minted-viec-chung-E13b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vc_san_thiet_ke
  verified_at: 2026-10-13T06:11:37Z
  output: |
    vc san: 13 tep, 0 vi pham

- eval: E13
  run_id: minted-viec-chung-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vc_man
  verified_at: 2026-10-13T06:11:37Z
  screenshot: evidence/E13-step1.png
  observed: |
    Frame 1 (vc-viec-cua-toi-1280.png): trang "Việc của tôi" ở 1280. Ba chip có số: "Giao cho tôi 2", "Tôi giao 0", "Đang theo dõi 0". Bảng có hai dòng. "Gửi bảng phí k6aaaqn" hạn 11 thg 10, 2026 có chấm đỏ (tone error, quá hạn). "Gọi xác nhận k6aaaqn" hạn 13 thg 10, 2026 (hôm nay), không đỏ. Khớp Expected bước 1.
    Frame 2 (vc-khung-viec-1280.png): khung việc mở bên phải, tiêu đề "Gửi bảng phí k6aaaqn", thẻ "Lịch sử" đang chọn. Có dòng "Phạm Thu Hà chuyển sang «Đang làm»" và dòng "Lê Quang Vinh tạo việc". Hàng nút đã đổi sang "Gửi đánh giá / Xong / Theo dõi", vốn là bộ nút của trạng thái Đang làm. Khớp Expected bước 2.
    Frame 3 (vc-o-soan-1280.png): khung thoả thuận "Thoả thuận An Phát k6aaaqn", thẻ Hoạt động, ô soạn chọn tab "Việc". Ô tiêu đề đã điền "Gửi hồ sơ cho k6aaaqn", Người thực hiện là "Lê Quang Vinh". Khối "Việc" ở đầu thẻ đang có 2 mục, chưa có mục mới.
    Frame 3b (vc-o-soan-da-giao-1280.png): sau khi bấm "Giao việc", ô soạn đặt lại ("Cần làm gì?", "Tôi"). Khối "Việc" đếm 3 và có thêm thẻ "Gửi hồ sơ cho k6aaaqn", Chưa làm, Không hạn, Lê Quang Vinh. Khớp Expected bước 3. Việc "Gửi bảng phí" ở đây hiện "Đang làm", nhất quán với bước 2.
    Frame 4 (vc-viec-cua-toi-375.png): màn 375, không có thanh cuộn ngang. Danh sách là các thẻ bo viền xếp dọc (Item). Thẻ 1 "Gửi bảng phí k6aaaqn", Đang làm, chấm đỏ, 11 thg 10, 2026. Thẻ 2 "Gọi xác nhận k6aaaqn", Chưa làm, 13 thg 10, 2026. Chip "Giao cho tôi 2 / Tôi giao 1 / Đang theo dõi 0". "Tôi giao 1" nhất quán với việc vừa giao ở bước 3. Khớp Expected bước 4. Điều kiện scrollWidth <= clientWidth do harness kiểm, nhãn "buoc 4: dat" xác nhận.
    Không frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)

### Eval mang từ round 1 (carry-forward)

- eval: E11
  run_id: minted-viec-chung-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_chuyen
  verified_at: 2026-10-13T05:23:02Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11b
  run_id: minted-viec-chung-E11b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_man_chuyen
  verified_at: 2026-10-13T05:23:02Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: mv68klkzlovc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_thuoc
  verified_at: 2026-10-13T05:23:02Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14b
  run_id: mv68kllnzz01
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vc_gieo
  verified_at: 2026-10-13T05:23:02Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-viec-chung-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-13T06:11:37Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-viec-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-13T06:11:37Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-viec-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-13T06:11:37Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-viec-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-13T06:11:37Z

- cmd: bunx turbo run lint --force
  run_id: minted-viec-chung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-13T06:11:37Z

- cmd: bun run lint:slop
  run_id: minted-viec-chung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-13T06:11:37Z

- cmd: bunx turbo run build --force
  run_id: minted-viec-chung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-13T06:11:37Z

### Judgment

- eval: E15
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Hai lens đạt, lens spec-alignment chưa quyết được. Sáu điều đầu có đủ trong CONTEXT.md, docs/api.md, docs/agent.md. Điều cuối («không tự đúc từ ghép tiếng Việt») mơ hồ: docs/api.md dùng «Đồ thị trạng thái», «Cột đo», «hàng gắn», docs/agent.md dùng «bộ gom», và CONTEXT.md không có mục cho các từ này; chúng có thể chỉ là lời chú cho tên trong mã, hợp đồng không phân xử.
  required_evidence:
    - Mục AC-15 trong contract.md hoặc quyết định trong sổ quyết định, nêu rõ «từ ghép tiếng Việt cho thuật ngữ kỹ thuật» có gồm lời chú cho tên định danh trong mã (DO_THI, roiChuaLamLuc, bảng hàng gắn) hay không. Nếu có gồm thì các từ «Đồ thị trạng thái», «Cột đo», «hàng gắn», «bộ gom» (docs/api.md dòng 506, 527, 535; docs/agent.md dòng 376) phải có mục trong CONTEXT.md hoặc phải đổi sang tên thật (tên mã, hoặc «bảng trạng thái»), thì verdict mới thành PASS.
    - Nếu hợp đồng nói lời chú cho tên trong mã được miễn, thì chỉ cần dòng xác nhận đó trong contract.md, và verdict đổi thành PASS.
  human_override: Mạnh 2026-10-13 — Đạt

#### Judge panel đề xuất cho E15 (đề xuất của máy, người quyết ở Cổng 2)

Đề xuất tổng: PASS. Một lens chưa quyết nên human_override để trống.

- domain-correctness: PASS — Ba tệp nói đủ sáu điều. CONTEXT.md dòng 160-168 nêu năm trạng thái, người giao, một người thực hiện, người theo dõi và việc gắn nhiều bản ghi vẫn là một việc, và mục «Việc» không còn dòng «nghĩa chốt tại Cổng Phạm vi» (chỉ mục «Dự án» còn). Bảng DO_THI ở docs/api.md và CONTEXT.md nói người theo dõi, thành viên khác, quản trị không đổi trạng thái. Việc gắn đối tác thì ai đọc được dữ liệu đối tác đều thấy, việc không gắn gì chỉ người trong cuộc thấy, vai «chỉ OKR» chưa dùng Việc. docs/agent.md nêu `viec-qua-han`, `viec-sap-han`, `viec-cho-danh-gia` và «xong n» qua `doiTrangThai`. «Chuyển việc 30 ngày» đã đổi theo để chuyển cả việc đang mở. docs/api.md mục «Vòng đời» nói xoá chỉ khi chưa có lịch sử, Xong hay Huỷ mở lại được, xoá vĩnh viễn bản ghi gắn chỉ gỡ liên kết. Không thấy từ ghép tiếng Việt mới đặt cho thuật ngữ kỹ thuật.
- operational-feasibility: PASS — Sáu điều đều có trong ba tệp. CONTEXT.md dòng 160-204 nói rõ nghĩa của Việc, năm trạng thái, người giao, một người thực hiện, người theo dõi, gắn nhiều bản ghi mà vẫn là một việc, và mục Việc không còn dòng «nghĩa chốt tại Cổng Phạm vi». docs/api.md dòng 492-541 có phạm vi thấy việc, đồ thị trạng thái, vai «chỉ OKR» bị chặn, chuyển việc và ba câu vòng đời. docs/agent.md dòng 379-400 nêu ba loại việc vào tin nhắc sáng và «xong n». Không thấy từ ghép tiếng Việt tự đúc nào.
- spec-alignment: UNCERTAIN — Sáu điều đầu có đủ trong ba tệp. Điều kiện cuối («không tự đúc từ ghép tiếng Việt») mơ hồ: docs/api.md dùng «Đồ thị trạng thái» (dòng 506), «Cột đo» (527), «hàng gắn» (535), docs/agent.md dùng «bộ gom» (dòng 376), CONTEXT.md không có mục cho các từ này. Chúng có thể chỉ là lời chú cho tên trong mã (`DO_THI`, `roiChuaLamLuc`) chứ không phải từ mới đúc; máy không có hợp đồng để phân xử hai cách đọc.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline): none. Mọi eval ở round này ghi baseline là n-a (không đo lại, evals.yaml không đổi từ lần baseline cuối ở round 1). Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — mọi eval chạy một lần (deterministic), không eval nào có pass_rate pha trộn.

## Iterations

Round 1: toàn bộ eval máy xanh; E15 còn UNCERTAIN chờ người, verdict PENDING-JUDGMENT.
Round 2: lượt sửa sau S4 lượt 1. E1-E10, E12, E13, E13b, E16 chạy lại và xanh cùng bảy lệnh suite; E11, E11b, E14, E14b mang từ round 1 vì delta không chạm paths của chúng. E15 vẫn chờ người (lens spec-alignment chưa quyết về từ ghép trong lời chú). Mốc giờ verified_at của round 2 ghi tròn theo ngày chạy 2026-10-13; giờ chính xác nằm ở run-log.jsonl.

### Re-pin lần 1 — 2026-10-15, do #418 gộp onehub fbc6c9375; sửa chỗ cấy đột biến (a) của viec-chung
run_id: repin-20261015T130914Z-83813
sha: effdc8c5ccef6244c2c7b694b31e69ff1c0cb62c · suites: 7 lệnh exit 0 · evals: 21/21 eval máy đạt kỳ vọng · ngoài làn máy: E13, E15 (E15 không khai paths) · diff chạm vật đo ngoài làn máy: E13 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-15, do #418 gộp onehub 8f819cf6a (#421, #409, #423)
run_id: repin-20261015T145641Z-84074
sha: c47118823bf5ccd96e39634b0e603b449147bb96 · suites: 7 lệnh exit 0 · evals: 21/21 eval máy đạt kỳ vọng · ngoài làn máy: E13, E15 (E15 không khai paths) · AC không có chốt máy: AC-15 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
