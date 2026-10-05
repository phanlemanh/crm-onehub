---
schema_version: 2
feature_slug: tro-ly-doc-kho
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b97e26239fbf6678d39856a17aa09ebdb923ac63
human_signoff: Phan Le Manh 2026-10-02
---

# Evidence Report: tro-ly-doc-kho

Round 4. Mọi eval máy, eval ui-check và bốn lệnh suite đều xanh trên commit 7e6178de. Hai mục judgment (E15j, E16j) chờ người quyết ở Cổng 2, nên verdict là PENDING-JUDGMENT. Không có lệnh fail nào không gắn eval; không finder nào chết.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6d | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7d | AC-7 | test | PASS |
| E7u | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-15 | script | PASS |
| E15j | AC-15 | judgment | PENDING-JUDGMENT |
| E16j | AC-7 | judgment | PENDING-JUDGMENT |
| E17 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-doc-kho-E1-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tim
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Postgres kho riêng của lượt chạy đã được tạo và drop sau khi xong; mười truy vấn khớp tập slug của tool và của API.

- eval: E2
  run_id: minted-tro-ly-doc-kho-E2-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_doc
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Năm ô đọc trang qua đúng; kho riêng của lượt chạy đã drop.

- eval: E3
  run_id: muq4t29eshgy
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_kiem_trich
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Tầng một (ham thuần kiemTraLoi) và tầng hai (tool nop_tra_loi trên Postgres) đều qua; kho riêng đã drop.

- eval: E4
  run_id: minted-tro-ly-doc-kho-E4-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tu_choi
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Ran 3 tests across 1 file. Kho riêng của lượt chạy đã drop.

- eval: E5
  run_id: muq4t1ng4fbp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_qua_han
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Chạy với TZ Asia/Ho_Chi_Minh; đúng một dòng cảnh báo cho trang quá hạn 14/10.

- eval: E6
  run_id: minted-tro-ly-doc-kho-E6-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_xac_minh_api
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Ma trận 20 ô quyền cộng ca sức khoẻ đều qua; kho riêng đã drop.

- eval: E6d
  run_id: minted-tro-ly-doc-kho-E6d-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_xac_minh
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Ran 7 tests across 1 file.

- eval: E7
  run_id: minted-tro-ly-doc-kho-E7-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_hoi_api
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Năm ô của taiLieu.hoi và hoiKetQua đều qua; kho riêng đã drop.

- eval: E7d
  run_id: minted-tro-ly-doc-kho-E7d-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_hoi
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Ran 10 tests across 1 file.

- eval: E7u
  run_id: minted-tro-ly-doc-kho-E7u-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlk_man_hoi
  verified_at: 2026-10-01T17:38:20Z
  screenshot: evidence/E7u-step1.png
  observed: |
    Đã mở từng frame. Bước 1 (1440): tab Hỏi đang chọn, câu dẫn, ba chip gợi ý, ô nhập trống. Bước 2: câu trả lời hoa hồng tầng 2 kèm trích trang, Phiên bản 1, ngày duyệt 02/10/2026 và nút Báo sai. Bước 3: câu từ chối "Mình không đoán" kèm "Trang gần nhất". Bước 4: khung cam cảnh báo trang quá hạn xác minh nêu tên chủ trang. Bước 5 (390): câu trả lời xuống dòng gọn, không cuộn ngang, scrollWidth bằng innerWidth. Bước 6: nút đổi thành "Đã báo sai", mờ và vô hiệu.
  network_observed: n-a (driver)

- eval: E8
  run_id: minted-tro-ly-doc-kho-E8-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_zalo
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Chạy với TZ Asia/Ho_Chi_Minh; ba tin Zalo viết trước và hai ca đường biên đều qua; kho riêng đã drop.

- eval: E9
  run_id: minted-tro-ly-doc-kho-E9-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_nhat_ky
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Chín hàng nhật ký, bộ đếm cửa sổ và kiểm log đều qua; kho riêng đã drop.

- eval: E10
  run_id: minted-tro-ly-doc-kho-E10-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_chua_tra_loi
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Ma trận 5 người và các ca đánh dấu xử lý đều qua; kho riêng đã drop.

- eval: E10d
  run_id: minted-tro-ly-doc-kho-E10d-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_suc_khoe_hoi
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Ran 4 tests across 1 file.

- eval: E11
  run_id: minted-tro-ly-doc-kho-E11-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_bao_sai
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Bảy ô báo sai đều qua; kho riêng đã drop.

- eval: E12
  run_id: muq4th2lsil6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tlk_ranh_gioi
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Tập tool sống, ZDR hai lần, không lộ nội dung trang và quét khuôn di động đều qua; kho riêng đã drop.

- eval: E13
  run_id: muq4thbch9jz
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_loi
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Chạy với TZ Asia/Ho_Chi_Minh; sáu ca lỗi và nhịp quá hạn đều qua; kho riêng đã drop.

- eval: E14
  run_id: minted-tro-ly-doc-kho-E14-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tran
  verified_at: 2026-10-01T17:38:20Z
  output: |
    Chạy với TZ Asia/Ho_Chi_Minh; sáu ô trần ngày và tháng đều qua; kho riêng đã drop.

- eval: E15
  run_id: minted-tro-ly-doc-kho-E15-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tlk_cham_bo_do
  verified_at: 2026-10-01T17:38:20Z
  output: |
    phien-do: xong. Cả hai lượt chấm (kho và Zalo) đạt ngưỡng, ghi vào evidence/cham-bo-do.md.

- eval: E17
  run_id: muq4tnhsboyz
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlk_san_thiet_ke
  verified_at: 2026-10-01T17:38:20Z
  output: |
    design-gate static qua mọi tệp tsx của tab Hỏi, màn đọc và Sức khoẻ; cổng mồ côi của ai-elements xanh; kho riêng đã drop.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-doc-kho-SUITE-bun_run_test-r4
  exit_code: 0
  verified_at: 2026-10-01T17:38:20Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-doc-kho-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-01T17:38:20Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-doc-kho-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-01T17:38:20Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-doc-kho-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-01T17:38:20Z

### Judgment

Đề xuất của hội đồng, không phải quyết định. Hai mục dưới đây chờ người ở Cổng 2; `human_override` để trống.

- eval: E15j
  judged_by: judge panel (3 lens, fresh context) — đề xuất PASS
  verdict: PASS
  rationale: Trong cham-bo-do.md, các câu có trang ở cả hai lượt đều có đoạn trích khớp ý, sáu câu không có trang bị từ chối ở cả hai lượt, và lượt Zalo chuyển đủ 30 câu quy định, giữ lại 10 câu không phải quy định. Chưa thấy kiểu nhầm lặp lại; hai dòng lỗi ở c32 và c38 là lỗi trả lời, không phải nhầm hướng chuyển.
  votes:
    - domain-correctness: PASS — c01-c20 và c27-c30 lượt một đều có trích khớp ý; ngưỡng 20 triệu ở c11, ngoại lệ nghỉ việc ở c13 và hai trang ở c16-c20 không bị khẳng định vượt trang. Sáu câu c21-c26 bị từ chối đúng ở cả hai lượt. Lượt Zalo: 30 câu quy định đều chuyển, 10 câu không phải quy định (kể cả câu có tên khách c36, c37) đều không chuyển. Chỉ c17 trên Zalo thiếu ngày đối soát nhưng không khẳng định điều trang không nói.
    - operational-feasibility: PASS — mọi câu trả lời nhóm có trang nằm trong trích dẫn ghi kèm; sáu câu không có trang bị từ chối ở cả hai lượt; 0 trên 10 câu không phải quy định bị chuyển nhầm và 0 câu quy định bị giữ lại. Khuyết điểm nhỏ: Zalo c17 bỏ phần ngày, c32 và c38 trả lỗi.
    - spec-alignment: PASS — các câu nhóm kho (kể cả c27 không dấu) đều có trích và nội dung khớp trích (ngưỡng 20 triệu, 500.000 đồng, 10 triệu, ngoại lệ nghỉ việc, hai trang c16-c20). Sáu câu không có trang bị từ chối ở cả hai lượt; lượt Zalo 30 câu quy định đều chuyển và 10 câu còn lại đều không chuyển, không có kiểu nhầm lặp lại.
  human_override: đạt — Phan Le Manh 2026-10-02

- eval: E16j
  judged_by: judge panel (3 lens, fresh context) — đề xuất PASS
  verdict: PASS
  rationale: Ở 390 và 1440 câu trả lời có trích hiện rõ tên trang, Phiên bản 1 và ngày duyệt 02/10/2026; ca quá hạn có khung cam nêu ngày hạn và tên chủ trang. Nhãn khớp từ điển CONTEXT.md; không chữ đè nhau và không cuộn ngang ở 390.
  votes:
    - domain-correctness: PASS — tên trang, Phiên bản 1 và ngày duyệt hiện rõ ở cả hai khổ; ca quá hạn nêu ngày hạn và tên chủ trang Lê Thu Trang. Nhãn khớp CONTEXT.md; tlk-hoi-cuon-390.txt ghi scrollWidth 390 bằng innerWidth 390 cho cả năm trạng thái, không phần tử nào tràn mép.
    - operational-feasibility: PASS — mỗi câu trả lời ghi "Trợ lý AI · theo bản đang dùng", tên trang, Phiên bản N, ngày duyệt và đoạn trích nguyên văn; ca quá hạn nêu tên chủ trang. Chip và tab xuống dòng vừa khổ. Chỗ nhỏ: ở trạng thái trả lời thường màn không hiện ngày xác minh đến (chỉ hiện khi quá hạn), và fixture ghi duyệt 02/10 nhưng quá hạn từ 01/10.
    - spec-alignment: PASS — câu trả lời có trích hiện đủ tên trang, Phiên bản 1 và ngày duyệt dưới nhãn "Trợ lý AI · theo bản đang dùng"; ca quá hạn ghi rõ hạn và "hỏi chủ trang Lê Thu Trang trước khi làm theo". Nhãn khớp CONTEXT.md; ảnh 390 không có chữ chồng nhau.
  human_override: Đạt — Phan Le Manh 2026-10-02

## Known limits

## Ngoài hợp đồng

## Analyst

E12 — lệnh `bun run test -- "cd apps/agent && bun test test/tro-ly-kho-ranh-gioi.spec.ts test/khuon-di-dong.spec.ts"` xanh trên cả HEAD lẫn baseline (không phân biệt). Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: xem run-log.jsonl và commit s4-r1; vòng đầu chưa đạt.
Round 2: xem run-log.jsonl và commit s4-r2; vẫn còn eval chưa xanh, trả về thực thi.
Round 3: REJECT, chạm trần 3 round (commit be805aef, e6eb9f7a).
Round 4: toàn bộ eval máy, ui-check và bốn lệnh suite xanh trên commit 7e6178de; E15j và E16j chờ người ở Cổng 2 nên verdict là PENDING-JUDGMENT.

### Re-pin lần 1 — 2026-10-02, do hoa cu sau khi gop onehub (#230); bo cham E15 ghi ra .acceptance-runs
run_id: repin-20261002T000703Z-46501
sha: cf7483a9aa8edf819b0f402386627a6213869019 · suites: 4 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E7u, E15j (E15j không khai paths), E16j (E16j không khai paths)

### Re-pin lần 2 — 2026-10-04, do hoá cũ sau khi gộp onehub #247 vào PR #231, đổi tên migration, vá ba xung đột ngầm
run_id: repin-20261004T060523Z-75459
sha: 80fea3400e5c375fb68ed9df1c79280ca748b079 · suites: 7 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E7u, E15j (E15j không khai paths), E16j (E16j không khai paths) · diff chạm vật đo ngoài làn máy: E7u — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 3 — 2026-10-05, do l4b tro-ly-kho-dung-phien (#257) đổi tệp kiểm tro-ly-kho-loi và vật tro_ly_kho; ghim lại ở onehub
run_id: repin-20261005T012126Z-14209
sha: 7c82865c7637a68e1d61a8959b0545ff64f796d8 · suites: 7 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E7u, E15j (E15j không khai paths), E16j (E16j không khai paths) · diff chạm vật đo ngoài làn máy: E7u — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 4 — 2026-10-05, do gộp onehub f2fad732 (#274, #269, #275)
run_id: repin-20261005T101547Z-69359
sha: b97e26239fbf6678d39856a17aa09ebdb923ac63 · suites: 7 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E7u, E15j (E15j không khai paths), E16j (E16j không khai paths)
