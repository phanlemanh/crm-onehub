---
schema_version: 2
feature_slug: tro-ly-okr-nen
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 23e8194e99010919a0935845970c792ce74d89c7
human_signoff:
---

# Evidence Report: tro-ly-okr-nen

Round 1. Mọi eval đã gắn AC đều xanh, nhưng lệnh suite `bun run test` (không gắn eval nào) đỏ — verdict tổng là REJECT theo đúng quy tắc "REJECT khi có lệnh của vòng đỏ", không phải một eval cụ thể thất bại.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | script | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-10 | ui-check | PASS |
| E16 | AC-10 | script | PASS |
| E17 | AC-11 | script | PASS |
| E18 | AC-11 | test | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-13 | test | PASS |
| E21 | AC-14 | test | PASS |
| E22 | AC-14 | script | PASS |
| E23 | AC-15 | script | PASS |
| E24 | AC-15 | judgment | UNCERTAIN |
| E25 | AC-1 | script | PASS |
| E26 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-okr-nen-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_ma_tran_viec
  verified_at: 2026-09-27T10:51:07Z
  output: |
    0 fail
    7 expect() calls
    Ran 4 tests across 1 file. [18.00ms]

- eval: E2
  run_id: mujpdp5izzlj
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_so_moi_phien
  verified_at: 2026-09-27T10:51:07Z
  output: |
    39 expect() calls
    Ran 12 tests across 1 file. [333.00ms]
    test-run: dropped crm_mujpdp5izzlj_test

- eval: E3
  run_id: mujpdm88tc05
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_doi_soat
  verified_at: 2026-09-27T10:51:07Z
  output: |
    28 expect() calls
    Ran 8 tests across 1 file. [431.00ms]
    test-run: dropped crm_mujpdm88tc05_test

- eval: E4
  run_id: minted-tro-ly-okr-nen-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_doi_soat_that
  verified_at: 2026-09-27T10:51:07Z
  output: |
    {"khung":{"tu":"2026-09-27T09:44:22.906Z","den":"2026-09-27T09:44:46.188Z"},"soLuotSinh":10,"soBuocSo":10,"soSoUsd":0.03075,"soGatewayUsd":0.0310496,"lechPhanTram":1,"phienCon":{"soUsd":0.006978,"gatewayUsd":0.007278000000000001},"nhaCungCapGoc":["alibaba"],"nhaCungCapCon":["vertex"],"baoCaoTheoGio":[]}
    so 0.030750 · gateway 0.031050 · lech 1.0% · 10 luot sinh, 10 buoc trong so
    chieu do: bo dong phien con khoi so thi lech 23.4%

- eval: E5
  run_id: minted-tro-ly-okr-nen-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_tran_khong
  verified_at: 2026-09-27T10:51:07Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [433.00ms]
    test-run: dropped crm_mujpdnc27d73_test

- eval: E6
  run_id: minted-tro-ly-okr-nen-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_dong_viec
  verified_at: 2026-09-27T10:51:07Z
  output: |
    9 expect() calls
    Ran 2 tests across 1 file. [478.00ms]
    test-run: dropped crm_mujpdqsmytay_test

- eval: E7
  run_id: minted-tro-ly-okr-nen-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_uy_quyen
  verified_at: 2026-09-27T10:51:07Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [72.00ms]

- eval: E8
  run_id: minted-tro-ly-okr-nen-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_hook_chan_that
  verified_at: 2026-09-27T10:51:07Z
  output: |
    okr: dem 0, turn.failed · research: dem 1 · hook mot minh (khong ban thay): dem 1

- eval: E9
  run_id: wrun_01M3H84CSQW1RBG52YBX2JBZ6Z,wrun_01M3H8518KNGA08KPNHVPRSQ7M,wrun_01M3H85QXHEY82MK50JVFBNB92
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_dau_cuoi
  verified_at: 2026-09-27T10:51:07Z
  output: |
    Lan 2: da-nop (0.014195 USD)
    Lan 3: da-nop (0.007518 USD)
    pass 3/3

- eval: E10
  run_id: mujpdy9x7xkn
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_chuyen_tiep
  verified_at: 2026-09-27T10:51:07Z
  output: |
    13 expect() calls
    Ran 4 tests across 1 file. [382.00ms]
    test-run: dropped crm_mujpdy9x7xkn_test

- eval: E11
  run_id: minted-tro-ly-okr-nen-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_cach_ly_tinh
  verified_at: 2026-09-27T10:51:07Z
  output: |
    0 fail
    16 expect() calls
    Ran 6 tests across 1 file. [114.00ms]

- eval: E12
  run_id: minted-tro-ly-okr-nen-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_tran_loi_goi
  verified_at: 2026-09-27T10:51:07Z
  output: |
    da boc: 1996 token ra (tran 2000), zdr true, nha cung cap vertex

- eval: E13
  run_id: minted-tro-ly-okr-nen-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_chi_tieu_api
  verified_at: 2026-09-27T10:51:07Z
  output: |
    29 expect() calls
    Ran 5 tests across 1 file. [1162.00ms]
    test-run: dropped crm_mujpegn9u1wy_test

- eval: E14
  run_id: minted-tro-ly-okr-nen-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_man_cai_dat
  verified_at: 2026-09-27T10:51:07Z
  output: |
    0 fail
    27 expect() calls
    Ran 10 tests across 1 file. [1246.00ms]

- eval: E15
  run_id: minted-tro-ly-okr-nen-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tln_man_that
  verified_at: 2026-09-27T10:51:07Z
  screenshot: _acceptance/tro-ly-okr-nen/evidence/E15-step3.png
  observed: |
    Đã mở từng file .png bằng Read và đối chiếu với Expected:

    - E15-step3.png (bước-quản-trị, quản trị, 1440/vi): thấy đúng 2 thẻ như đề bài
      — "Trợ lý OKR" với dòng "Đang tắt" (chấm xám) và toggle tắt; bên dưới là
      "Sổ chi phí AI — tháng này" với bảng 5 dòng việc (Nghiên cứu danh bạ 1,23
      US$; Trợ lý AI 0,45 US$; Hỏi CRM qua Zalo 0,31 US$; Tác nhân 0,27 US$; Trợ
      lý OKR 0,50 US$) + dòng Tổng 2,76 US$ + thanh trần "0,50 US$ / 9 US$ (6%)".
      Khớp đúng Expected bước 3.

    - E15-step4.png (bước-đã-lưu, ngay sau khi bấm Lưu): toggle đã bật (xanh),
      phạm vi hiện "Toàn công ty", ô Trần tháng hiện "7,5"; thẻ đang ở trạng thái
      chuyển tiếp "Chưa sẵn sàng — Đang kiểm tra..." (đang revalidate ngay sau
      lưu, không phải lỗi) — script đã xác nhận riêng bằng text "đã lưu" xuất
      hiện trước đó và bảng đọc lại okr.program (version 0->1, aiOn true, phạm
      vi toàn-công-ty, trần 7.5) nên đúng với Expected "đọc lại okr.program trả
      phiên bản mới", dù khung hình chụp ngay lúc thẻ đang tải lại.

    - E15-step5.png (bước-80, sau khi gieo 85% trần): thanh Trợ lý OKR hiện
      "6,38 US$ / 7,50 US$ (85%)" với dòng cảnh báo màu cam "Đã dùng 80% trần"
      ngay dưới thanh — đúng chữ "80%" và mức cảnh báo như Expected bước 5. Dòng
      Tổng cũng cập nhật theo (8,64 US$).

    - E15-step6-390-vi.png (390/vi): toàn bộ thẻ Cấu hình, Trợ lý OKR, Sổ chi
      phí AI xếp dọc, không thấy thanh cuộn ngang nào, chữ không bị tràn ra
      ngoài khung 390px — khớp scrollWidth<=innerWidth mà script đo được (0px).
      (1440/en cũng cho kết quả 0px, không cần zoom riêng vì không có dấu hiệu
      tràn.)

    - E15-step7.png (bước-thành-viên, thành viên thường marcus@trycomp.ai): trang
      chỉ còn "Chu kỳ" và "Cấu hình" (đang skeleton xám, chưa tải xong) cùng dòng
      "Chỉ quản trị đổi được cấu hình chương trình." — HOÀN TOÀN không có thẻ
      "Trợ lý OKR" hay "Sổ chi phí AI" nào trên màn — đúng Expected bước 7 (0
      phần tử [data-the='tro-ly-okr']/[data-the='so-chi-phi']).

    Không frame nào mâu thuẫn Expected; tất cả 16 assertion của script đều ĐÚNG.
  network_observed: clean

- eval: E16
  run_id: design-gate-514f5f0ce4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_san_thiet_ke
  verified_at: 2026-09-27T10:51:07Z
  output: |
    "hits": [],
    "findings": []

- eval: E17
  run_id: minted-tro-ly-okr-nen-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_migration_chi_them
  verified_at: 2026-09-27T10:51:07Z
  output: |
    migration chi them: 1 thu muc, 17 lenh, 6 bang, 7 cot

- eval: E18
  run_id: mujpehiagyqy
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_mac_dinh
  verified_at: 2026-09-27T10:51:07Z
  output: |
    17 expect() calls
    Ran 8 tests across 1 file. [24.00ms]
    test-run: dropped crm_mujpehiagyqy_test

- eval: E19
  run_id: mujpes15t6jb
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_san_sang
  verified_at: 2026-09-27T10:51:07Z
  output: |
    13 expect() calls
    Ran 6 tests across 1 file. [396.00ms]
    test-run: dropped crm_mujpes15t6jb_test

- eval: E20
  run_id: mujpeol6oe30
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_bao_tran
  verified_at: 2026-09-27T10:51:07Z
  output: |
    13 expect() calls
    Ran 4 tests across 1 file. [505.00ms]
    test-run: dropped crm_mujpeol6oe30_test

- eval: E21
  run_id: minted-tro-ly-okr-nen-E21-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tln_tien_do_api
  verified_at: 2026-09-27T10:51:07Z
  output: |
    526 expect() calls
    Ran 32 tests across 2 files. [4.21s]
    test-run: dropped crm_mujperyf9j8s_test

- eval: E22
  run_id: minted-tro-ly-okr-nen-E22-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_tien_do_doi
  verified_at: 2026-09-27T10:51:07Z
  output: |
    tien-do da doi: 3 ham giu nguyen than, 1948 tep khong nhap duong cu

- eval: E23
  run_id: minted-tro-ly-okr-nen-E23-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_tu_dien_luat
  verified_at: 2026-09-27T10:51:07Z
  output: |
    tu dien, luat du lieu va cho re khop

- eval: E24
  judged_by: judge panel (3 lens, fresh context)
  proposal: UNCERTAIN
  rationale: Cả ba lens đều thấy CONTEXT.md và data-boundaries.md đủ căn cứ cho phần từ điển/ZDR của AC-15, nhưng không lens nào được cấp docs/agent.md (câu luật dữ liệu OKR + mục "chỗ rẽ"), docs/api.md §OKR, hay diff/mã nguồn thật của lượt trong danh sách Input — nên phần còn lại của AC-15 (khớp câu giữa hai tài liệu, giữ luật kho trong diff) không có căn cứ để chấm. Panel không "carried" và không "ungrounded" — đây là ba phiếu UNCERTAIN thật với lý do thiếu input, không phải panel bỏ trống.
  votes:
    - domain-correctness: UNCERTAIN — CONTEXT.md's bốn mục (Trợ lý OKR, Đề xuất, Tóm tắt tuần, Sổ chi phí AI) và data-boundaries.md tự chúng nói rõ ba điều: Trợ lý OKR "Chạy riêng khỏi trợ lý AI... không tự ghi vào OKR — mọi thay đổi là người bấm nhận", và data-boundaries.md có đúng câu "nội dung OKR chỉ gửi đi khi có ZDR, kể cả eval". Nhưng câu hỏi và chính AC-15 còn đòi đọc docs/agent.md (câu luật dữ liệu OKR + mục chỗ rẽ) và docs/api.md §OKR, hai file này không có trong danh sách Input được phép của tôi, nên phần đó của AC-15 không có căn cứ để chấm. Vế thứ hai của câu hỏi hỏi thẳng về "diff của lượt" (trí khôn ở apps/agent, Zod ở packages/validation, không chú thích, hằng tinh chỉnh một tệp) nhưng judge này bị chặn đọc diff/mã nguồn theo đúng giao thức BLIND, nên hoàn toàn không có bằng chứng để phán vế đó.
      required_evidence:
        - Nội dung file docs/agent.md (câu luật dữ liệu OKR khớp câu data-boundaries.md, và mục "chỗ rẽ" liệt kê các tệp của hãng lượt này chạm) — thêm vào danh sách Input được phép của eval này; nếu có đủ hai phần đó, phần docs/agent.md của AC-15 đổi sang đạt.
        - Nội dung file docs/api.md §OKR (câu "đề xuất, tóm tắt nằm ngoài luật vết") — cũng bị AC-15 đòi nhưng không có trong Input; thiếu file này thì không chấm được toàn bộ AC-15.
        - Diff hoặc các file nguồn thật của lượt — ít nhất packages/validation/src/{ai-chi-phi.ts,okr-tro-ly.ts,okr-chuong-trinh.ts} và apps/agent/agent/subagents/tro_ly_okr/** — để xác nhận khuôn parse Zod nằm ở packages/validation và trí khôn chỉ nằm ở apps/agent (API chỉ ghi AgentTask/đọc sổ) như thiết kế mô tả, vì judge bị chặn đọc diff nên không có bằng chứng nào cho vế này của câu hỏi.
        - Một lệnh grep trên diff thật của lượt (vd. `git diff onehub...HEAD -- apps/agent packages/validation apps/api apps/app | grep -nE '^\+.*(//|/\*)'`) để xác nhận luật "không chú thích trong mã" — không có diff nào trong Input nên không kiểm được.
    - operational-feasibility: UNCERTAIN — CONTEXT.md (mục «Trợ lý OKR», «Đề xuất») và data-boundaries.md (rule 5) đủ căn cứ cho phần «người không đọc mã hiểu đúng khác biệt Trợ lý OKR / trợ lý AI, ZDR, không tự ghi» — nhưng câu hỏi còn đòi đọc "câu luật dữ liệu OKR trong docs/agent.md", và đó không nằm trong danh sách Input được cấp cho eval này. Phần thứ hai của câu hỏi (diff có giữ luật kho: trí khôn ở apps/agent, khuôn Zod ở packages/validation, không chú thích, hằng tinh chỉnh một tệp cấu hình) hoàn toàn không thể chấm vì persona này BLIND với diff và không có file mã nào trong Input. Danh sách Input không đủ căn cứ cho toàn bộ câu hỏi AC-15 — đây là lý do trả UNCERTAIN, không phải lý do đi tìm thêm file.
      required_evidence:
        - Nội dung docs/agent.md (mục luật dữ liệu OKR có câu «nhà cung cấp model là bên nhận; nội dung OKR chỉ gửi đi khi có ZDR, kể cả eval», và mục «chỗ rẽ» liệt kê tệp của hãng) — không có trong danh sách Input bốn file của eval này, cần được đưa vào input để đối chiếu với câu tương ứng trong data-boundaries.md
        - Nội dung docs/api.md §OKR (câu «đề xuất và tóm tắt nằm ngoài luật vết») — cũng không có trong Input, cần để xác nhận vế đó của AC-15
        - Diff thật của lượt (hoặc tối thiểu: diff các tệp packages/validation/src/*, apps/api/src/okr/**, apps/agent/agent/subagents/tro_ly_okr/**) — cần để chấm vế «trí khôn ở apps/agent, không ở API», «khuôn parse Zod ở biên», «không chú thích trong mã», «hằng tinh chỉnh một tệp cấu hình mỗi khu»; persona này bị cấm đọc diff nên không thể tự kết luận, phải có agent khác (hoặc nới phạm vi input) chấm riêng vế này
    - spec-alignment: UNCERTAIN — Bốn mục từ điển (Trợ lý OKR, Đề xuất, Tóm tắt tuần, Sổ chi phí AI) có trong CONTEXT.md và diễn đạt rõ ràng cho người không đọc mã (khác trợ lý AI, ZDR kể cả eval, máy không tự ghi vào OKR); skills/data-boundaries.md cũng có đúng câu ZDR. Nhưng câu hỏi phán xét (và cả AC-15) còn đòi kiểm docs/agent.md (câu luật dữ liệu trùng khớp + mục "chỗ rẽ" liệt kê tệp hãng đã chạm) và kiểm diff/mã thật (Zod ở biên trong packages/validation, không chú thích, trí khôn ở apps/agent) — hai tệp/loại bằng chứng này không nằm trong danh sách Input được cấp cho eval này, nên không có căn cứ để phán phần đó.
      required_evidence:
        - Nội dung docs/agent.md sau lượt: đọc trực tiếp file docs/agent.md để xác nhận có câu luật dữ liệu OKR trùng với câu ở apps/agent/agent/skills/data-boundaries.md ("nhà cung cấp model là bên nhận; nội dung OKR chỉ gửi đi khi có ZDR, kể cả eval") và có mục "chỗ rẽ" liệt kê đúng các tệp của hãng lượt này chạm (đối chiếu mục 10 của design.md).
        - Nội dung các tệp mã liên quan (packages/validation/src/okr-tro-ly.ts, packages/validation/src/ai-chi-phi.ts, packages/db/src/okr-tro-ly.ts, và các tệp apps/agent ở K8-K11 thiết kế §4.2): đọc trực tiếp để kiểm khuôn parse bằng Zod ở biên, không có chú thích trong mã, và trí khôn nằm ở apps/agent (API chỉ ghi AgentTask/đọc sổ) — không có sẵn cho judge độc lập này.
  human_override:  # chi nguoi ghi

- eval: E25
  run_id: minted-tro-ly-okr-nen-E25-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tln_so_phien_con_that
  verified_at: 2026-09-27T10:51:07Z
  output: |
    phien con khong ghi so: con_khong_so (doi chung, dung ky vong)
    {"phienGoc":"wrun_01M3H864H8E3VSMH4KSKP438BD","soDong":6,"theoPhien":[{"ten":"goc","dong":["crm.nghien-cuu","crm.nghien-cuu","crm.nghien-cuu"],"phienCha":null},{"ten":"con_tro_ly","dong":["okr.de-xuat"],"phienCha":"wrun_01M3H864H8E3VSMH4KSKP438BD"},{"ten":"con_runner","dong":["crm.tac-nhan"],"phienCha":"wrun_01M3H864H8E3VSMH4KSKP438BD"},{"ten":"con_builder","dong":["crm.dung-tac-nhan"],"phienCha":"wrun_01M3H864H8E3VSMH4KSKP438BD"},{"ten":"con_khong_so","dong":[],"phienCha":null}],"soBuocGhiLai":7}

- eval: E26
  run_id: mujpfg3ufeiz
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tln_duong_do
  verified_at: 2026-09-27T10:51:07Z
  output: |
    8 expect() calls
    Ran 3 tests across 1 file. [392.00ms]
    test-run: dropped crm_mujpfg3ufeiz_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-okr-nen-SUITE-bun_run_test-r1
  exit_code: 1
  verified_at: 2026-09-27T10:51:07Z
  reason: |
    Test suite failed: api package test timed out. The test "doi-chung-thanh-vien: thanh vien khong bao gio nhan thong diep tu cach" in apps/api/test/go-la-cat-quyen.spec.ts exceeded 5000ms timeout while running permission checks across 50 tRPC procedures with parallelism level 8.
  output: |
    api:test:  841 pass
    api:test:  1 skip
    api:test:  1 fail
    api:test:  1 error
    api:test:  5346 expect() calls
    api:test: Ran 843 tests across 92 files. [43.29s]
    api:test: error: script "test" exited with code 1
    agent:test: cache bypass, force executing 37084b7628b6c062
     Tasks:    8 successful, 10 total
    Failed:    api#test
    error: script "test" exited with code 1

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-okr-nen-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-27T10:51:07Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    492ms

- cmd: bun run lint:slop
  run_id: minted-tro-ly-okr-nen-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-27T10:51:07Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 853ms on 1792 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-okr-nen-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-27T10:51:07Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    10.738s

## Known limits

## Ngoài hợp đồng

## Analyst

E21 (`cd apps/api && bun test test/okr.spec.ts test/okr-toan-canh-thuan.spec.ts`) xanh trên cả HEAD lẫn diffBase (baseline: green) — bài kiểm OKR sẵn có của hãng, không phải bài mới của lượt này; nó không phân biệt được feature vì nó vốn không được viết để phân biệt (AC-14 chỉ đòi chạy nguyên các bài này không sửa kỳ vọng + thêm một ca so alignmentTargets). Không cần viết lại: đây là regression-guard có chủ ý, không phải lỗ hổng đo.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả 25 eval đã gắn AC (E1-E23, E25, E26) đều PASS và E24 (judgment) UNCERTAIN đúng như panel đề xuất; nhưng lệnh suite `bun run test` (không gắn eval) đỏ — `apps/api/test/go-la-cat-quyen.spec.ts` vượt timeout 5000ms khi 50 kiểm quyền tRPC chạy song song mức độ 8 (843 tests: 841 pass, 1 skip, 1 fail, 1 error). Verdict tổng REJECT, quay lại implementation để xử lý ca đỏ của `go-la-cat-quyen.spec.ts` (nghi flaky do tải song song, xem `bo-test-day-du-chap-chon-khi-tai.md`) trước khi chấm lại vòng kế.