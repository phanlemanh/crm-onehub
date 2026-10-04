---
schema_version: 2
feature_slug: man-okr-truoc-r1
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 51ff47fd18dc27873b9410c872ad191dec0c35af
human_signoff:
---

# Evidence Report: man-okr-truoc-r1

Round 2. Mười một eval máy và ui-check đạt, bảy lệnh suite xanh. Còn một mục judgment (E11) chờ người quyết ở Cổng 2, nên verdict là PENDING-JUDGMENT.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5u | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-5 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8u | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-man-okr-truoc-r1-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1c_hoi_y_dom
  verified_at: 2026-10-04T09:01:56Z
  runs: 1
  output: |
    Ran 2 tests across 1 file. [1001.00ms]

- eval: E2
  run_id: minted-man-okr-truoc-r1-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1c_man
  verified_at: 2026-10-04T09:01:56Z
  screenshot: evidence/E2-step1.png
  observed: |
    Hỏi ý 1440 gọn: 4 ý đầy đủ trong khung đầu, thanh «Còn 4 điều trước khi công bố» ở đáy thấp, chỉ đè lên ý thứ 5, không đè 4 ý nằm trọn. Bấm «Xem danh sách» thì thanh mở ra, nút đổi thành «Ẩn danh sách», 4 dòng thiếu hiện đủ.
    Ở 390 thanh cao khoảng 66px, che một phần ý thứ hai, không tràn ngang; khi mở có dòng «Cuộn danh sách để xem phần còn lại». Khớp Expected.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-man-okr-truoc-r1-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1c_cap_nhat_dom
  verified_at: 2026-10-04T09:01:56Z
  runs: 1
  output: |
    Ran 12 tests across 1 file. [1182.00ms]

- eval: E4
  run_id: minted-man-okr-truoc-r1-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1c_cap_nhat_dom
  verified_at: 2026-10-04T09:01:56Z
  runs: 1
  output: |
    Ran 12 tests across 1 file. [1182.00ms]

- eval: E5u
  run_id: minted-man-okr-truoc-r1-E5u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1c_man
  verified_at: 2026-10-04T09:01:56Z
  screenshot: evidence/E5u-step1.png
  observed: |
    Cập nhật tuần 1440 trạng thái xong: banner «Bạn đã gửi cập nhật tuần này», hai KR «Hợp đồng bán lẻ chốt được đạt 6 tỷ đồng» (2,9 tỷ đồng) và «Ký 15 hợp đồng bán lẻ mới» (12,1 hợp đồng) cùng «Tự tin cao», nút «Sửa cập nhật». Ảnh 390 sau khi sửa: KR đầu «Tự tin thấp», KR hai «Tự tin cao», không tràn ngang.
    Trạng thái một phần: dòng «Đã gửi 1/2 KR tuần này», KR đầu có chip «Đã gửi tuần này», KR hai chưa gửi; ở 390 xếp dọc, không tràn ngang. Khớp Expected.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-man-okr-truoc-r1-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cnt_gui_lo
  verified_at: 2026-10-04T09:01:56Z
  runs: 1
  output: |
    test-run: dropped crm_mutle8lcvrxq_test

- eval: E6b
  run_id: minted-man-okr-truoc-r1-E6b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cnt_gui_lo
  verified_at: 2026-10-04T09:01:56Z
  runs: 1
  output: |
    test-run: dropped crm_mutle8lcvrxq_test

- eval: E7
  run_id: minted-man-okr-truoc-r1-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1c_toan_canh_dom
  verified_at: 2026-10-04T09:01:56Z
  runs: 1
  output: |
    Ran 1 test across 1 file. [656.00ms]

- eval: E8u
  run_id: minted-man-okr-truoc-r1-E8u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1c_man
  verified_at: 2026-10-04T09:01:56Z
  screenshot: evidence/E8u-step1.png
  observed: |
    Toàn cảnh 1440: thẻ «Đơn vị đã công bố OKR» ghi 12/13 kèm dòng «Khối Hỗ trợ chưa có mục tiêu riêng»; bảng «Theo đơn vị» có dòng mô tả bộ phận in đậm cộng mục tiêu riêng, hàng «Khối Hỗ trợ» in đậm, tiến độ 56%, cột Mục tiêu là 6.
    Ở 390 bốn thẻ xếp 2x2, dòng phụ của thẻ 12/13 xuống dòng trong thẻ, bảng chỉ còn cột Đơn vị và Tiến độ, không tràn ngang. Khớp Expected.
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-man-okr-truoc-r1-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1c_chu
  verified_at: 2026-10-04T09:01:56Z
  runs: 1
  output: |
    Ran 128 tests across 1 file. [957.00ms]

- eval: E10
  run_id: design-gate-8eae653c8e,design-gate-86f5cdbc58,design-gate-618f30ce34
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1c_san_thiet_ke
  verified_at: 2026-10-04T09:01:56Z
  runs: 1
  output: |
    design-gate --mode static trên ba tệp: khoi-ket-luan.tsx, cap-nhat-tuan.tsx, toan-canh.tsx; không có P0.

- eval: E11
  judged_by: judge-subagent (fresh context), ba góc nhìn
  verdict: UNCERTAIN
  rationale: |
    Panel đề xuất UNCERTAIN, cả ba góc nhìn cùng bỏ phiếu như vậy.
    - domain-correctness: UNCERTAIN — Phần cập nhật tuần đạt: ảnh «xong» ghi "Bạn đã gửi cập nhật tuần này", giờ gửi 04/10 16:01, có nút «Sửa cập nhật»; ảnh «một phần» ghi "Đã gửi 1/2 KR tuần này" kèm chip trên KR đã gửi. Toàn cảnh 1440 đạt (thẻ 12/13 có dòng giải thích dưới «Theo đơn vị», chữ khớp CONTEXT.md). Chưa đủ căn cứ PASS vì thanh «Còn 4 điều trước khi công bố» đè lên ý thứ 5 (1440) và ý thứ 2 (390) mà chưa có ảnh cuối trang; ảnh Toàn cảnh 390 không thấy dòng giải thích và hàng Khối Hỗ trợ; ảnh «một phần» 390 cắt mất KR chưa gửi.
    - operational-feasibility: UNCERTAIN — Cập nhật tuần đạt rõ, Toàn cảnh đạt ở 1440. Hỏi ý chưa kết luận được: ảnh chỉ theo từng khung nhìn, không có ảnh cuối trang; thanh đè lên ý thứ 5 ở 1440 và ý thứ 2 ở 390; khi mở, thanh che tên chủ đề cuối ở 1440 và chiếm khoảng một phần tư màn 390 với danh sách bên trong bị cắt.
    - spec-alignment: UNCERTAIN — Phần lớn đạt (đủ 5 ý, không dấu ba chấm, 390 xuống dòng; banner, nút sửa, nhãn «Đã gửi tuần này»; từ vựng bộ phận, phòng ban, đơn vị). Còn ba chỗ ảnh tĩnh không đủ: (a) thanh đè ý ở gọn 1440 và 390, danh sách trong thanh bị cắt ở mở 390, tên chủ đề «Cho tài xế đối tác thuê chỗ nghỉ ngay tại kho,» bị cắt ở mở 1440; (b) KR «Hợp đồng bán lẻ chốt được đạt 6 tỷ đồng» hiện «Tự tin cao» ở xong-1440 nhưng «Tự tin thấp» ở xong-390 và «Tuần này: thấp» ở một-phần-1440; (c) ở 390 Toàn cảnh không có dòng chú thích và cột Mục tiêu/Số KR.
  required_evidence:
    - Ảnh Hỏi ý ở 390 và 1440, cuộn tới cuối danh sách «Ý chưa gom» với thanh ở trạng thái gọn, thấy ý cuối nằm trọn phía trên thanh «Còn 4 điều trước khi công bố». Chụp lại bằng cùng bàn đo r1c, tên r1c-hoi-y-gon-cuoi-390.png và r1c-hoi-y-gon-cuoi-1440.png, kèm số đo khoảng đệm đáy bằng JS (scrollHeight trừ chiều cao thanh so với bottom của ý cuối).
    - Ảnh Hỏi ý ở trạng thái mở thanh (1440 và 390, cuộn cuối trang, tên r1c-hoi-y-cuoi-trang-mo-390.png) cho thấy tên chủ đề «Cho tài xế đối tác thuê chỗ nghỉ ngay tại kho…» hiện trọn hoặc có dấu ba chấm và tooltip, không bị panel cắt cụt không báo.
    - Ảnh Toàn cảnh ở 390 cuộn tới hàng «Khối Hỗ trợ» của bảng «Theo đơn vị», kèm dòng giải thích «Bộ phận in đậm cộng mục tiêu riêng...» nếu ở khổ này còn hiện, cùng các cột Mục tiêu / Số KR, để thấy thẻ 12/13 không nói ngược hàng đó. Tên r1c-toan-canh-khoi-ho-tro-390.png.
    - Ảnh «Cập nhật tuần» trạng thái gửi một phần ở 390 cuộn tới KR thứ hai («Ký 15 hợp đồng bán lẻ mới»), thấy KR này chưa có chip «Đã gửi tuần này» khác KR thứ nhất. Tên r1c-cap-nhat-mot-phan-kr2-390.png.
    - Lời giải thích vì sao ảnh «xong» 390 ghi KR1 "Tự tin thấp" còn ảnh «xong» 1440 ghi "Tự tin cao": hai ảnh cùng hay khác dữ liệu mẫu, hoặc nhật ký chụp/seed xác nhận cùng bộ dữ liệu, hoặc ảnh chụp lại cùng trạng thái ở cả hai khổ. Ghi chú đặt trong evidence-report.md của man-okr-truoc-r1.
    - Nguyên văn câu AC-11 / clause (1) trong _acceptance/man-okr-truoc-r1/contract.md: câu hỏi đưa vào bị lỗi chữ, chưa rõ tiêu chí là «không phải cuộn», «không phải mở» hay «không phải bấm», nên chưa phân biệt được thanh đè lên ý khi cuộn giữa trang là chấp nhận được hay là lỗi.
  human_override:        # human fills "<name> <date>" + optional note to resolve

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-man-okr-truoc-r1-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-04T09:01:56Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-man-okr-truoc-r1-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-04T09:01:56Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-man-okr-truoc-r1-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-04T09:01:56Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-man-okr-truoc-r1-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-04T09:01:56Z

- cmd: bunx turbo run lint --force
  run_id: minted-man-okr-truoc-r1-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-04T09:01:56Z

- cmd: bun run lint:slop
  run_id: minted-man-okr-truoc-r1-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-04T09:01:56Z

- cmd: bunx turbo run build --force
  run_id: minted-man-okr-truoc-r1-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-04T09:01:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; nên viết lại để khẳng định hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- E1 (cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-hoi-y.dom.tsx -t 'thanh công bố')
- E3, E4 (cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-cap-nhat-tuan.dom.tsx)
- E6, E6b (cmd: bun run test -- "cd apps/api && bun test test/okr-cap-nhat.spec.ts -t gui-lo")
- E9 (cmd: cd apps/app && bun test test/messages-guard.spec.ts)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lệnh suite lint:slop đỏ (6 lỗi anti-slop) và 5 phát hiện đo nằm trong hợp đồng; 11 eval máy và ui-check đạt, E11 UNCERTAIN. Trả về cho cài đặt.
Round 2: lint:slop sạch, 11 eval máy và ui-check đạt, bảy lệnh suite xanh; E11 vẫn UNCERTAIN (ba góc nhìn), chờ người quyết ở Cổng 2. Verdict PENDING-JUDGMENT.
