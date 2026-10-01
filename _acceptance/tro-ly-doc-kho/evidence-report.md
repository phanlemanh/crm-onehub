---
schema_version: 2
feature_slug: tro-ly-doc-kho
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7026d3591be9fe9f7011219de8ee4656e5e5f5ea
human_signoff:
---

# Evidence Report: tro-ly-doc-kho

Round 1. Không eval máy nào đỏ; verdict REJECT do workflow tính sẵn. Các phát hiện trong hợp đồng (trong đó có hai mục mức high về phép đo, t8 và t9) nằm ở review-findings.md, mục "Trong hợp đồng".

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
| E15j | AC-15 | judgment | PASS (đề xuất của panel, chờ người) |
| E16j | AC-7 | judgment | UNCERTAIN |
| E17 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-doc-kho-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tim
  verified_at: 2026-10-01T06:09:19Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-tim-doc.spec.ts -t tlk-tim && cd ../api && bun test test/tai-lieu-tim.spec.ts"
    test-run: dropped crm_mup4xg5c8q8t_test

- eval: E2
  run_id: minted-tro-ly-doc-kho-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_doc
  verified_at: 2026-10-01T06:09:19Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-tim-doc.spec.ts -t tlk-doc"
    test-run: dropped crm_mup4xgt3tgxp_test

- eval: E3
  run_id: mup4xgn1f30j
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_kiem_trich
  verified_at: 2026-10-01T06:09:19Z
  output: |
    cmd: packages/validation tai-lieu-hoi.spec.ts rồi apps/agent tro-ly-kho-nop.spec.ts -t tlk-kiem
    test-run: dropped crm_mup4xgn1f30j_test

- eval: E4
  run_id: minted-tro-ly-doc-kho-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tu_choi
  verified_at: 2026-10-01T06:09:19Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/tro-ly-kho-nop.spec.ts -t tlk-tu-choi"
    test-run: dropped crm_mup4xfsw5rfm_test

- eval: E5
  run_id: mup4xfdjngvt
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_qua_han
  verified_at: 2026-10-01T06:09:19Z
  output: |
    cmd: TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-kho-nop.spec.ts -t tlk-qua-han
    test-run: dropped crm_mup4xfdjngvt_test

- eval: E6
  run_id: minted-tro-ly-doc-kho-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_xac_minh_api
  verified_at: 2026-10-01T06:09:19Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-xac-minh.spec.ts"
    test-run: dropped crm_mup4xeuy2xza_test

- eval: E6d
  run_id: minted-tro-ly-doc-kho-E6d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_xac_minh
  verified_at: 2026-10-01T06:09:19Z
  output: |
    Ran 5 tests across 1 file. [3.84s]

- eval: E7
  run_id: minted-tro-ly-doc-kho-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_hoi_api
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4xfek2y8i_test

- eval: E7d
  run_id: minted-tro-ly-doc-kho-E7d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_hoi
  verified_at: 2026-10-01T06:09:19Z
  output: |
    Ran 10 tests across 1 file. [5.99s]

- eval: E7u
  run_id: minted-tro-ly-doc-kho-E7u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlk_man_hoi
  verified_at: 2026-10-01T06:09:19Z
  screenshot: evidence/E7u-step1.png
  observed: |
    Đã mở cả 6 frame (E7u-step1 đến step6). Step1 1440: tab "Hỏi" đang chọn, câu mở đầu, ba nút gợi ý, ô nhập, chưa có hội thoại. Step2: câu trả lời hoa hồng tầng 2 kèm tên trang, "Phiên bản 1", "duyệt 01/10/2026", đoạn trích nghiêng, nút "Báo sai". Step3: từ chối "Mình không đoán" kèm "Trang gần nhất". Step4: Alert viền cam "quá hạn xác minh từ 30/09/2026; hỏi chủ trang Lê Thu Trang". Step5 390: bố cục di động gọn, không tràn ngang. Step6: nút thành "Đã báo sai" mờ. Khớp expected.
  network_observed: n-a (driver)
  output: |
    Lần 2: 6/6 bước đạt; man-hoi đạt; phiên đo xong.
    Chiều đỏ: man-hoi.mjs --chieu-do trên bản sao ẩn tab Hỏi báo "buoc 1: khong thay tab Hỏi", đúng kỳ vọng.
    Frame lưu: evidence/E7u-step1.png đến evidence/E7u-step6.png; ghi chú mạng: evidence/E7u-network.txt (driver puppeteer không đọc được network).

- eval: E8
  run_id: mup4xfnfks63
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_zalo
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4xfnfks63_test

- eval: E9
  run_id: minted-tro-ly-doc-kho-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_nhat_ky
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4xtbkulbw_test

- eval: E10
  run_id: minted-tro-ly-doc-kho-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_chua_tra_loi
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4xv42t4qu_test

- eval: E10d
  run_id: minted-tro-ly-doc-kho-E10d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_suc_khoe_hoi
  verified_at: 2026-10-01T06:09:19Z
  output: |
    Ran 4 tests across 1 file. [2.56s]

- eval: E11
  run_id: minted-tro-ly-doc-kho-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_bao_sai
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4xxg3sv00_test

- eval: E12
  run_id: minted-tro-ly-doc-kho-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tlk_ranh_gioi
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4xybn5qit_test

- eval: E13
  run_id: minted-tro-ly-doc-kho-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_loi
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4xxtu8pex_test

- eval: E14
  run_id: minted-tro-ly-doc-kho-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tran
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4xzj7did3_test

- eval: E15
  run_id: minted-tro-ly-doc-kho-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tlk_cham_bo_do
  verified_at: 2026-10-01T06:09:19Z
  output: |
    phien-do: xong

- eval: E17
  run_id: minted-tro-ly-doc-kho-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tlk_san_thiet_ke
  verified_at: 2026-10-01T06:09:19Z
  output: |
    test-run: dropped crm_mup4yahtrq1x_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-doc-kho-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-10-01T06:09:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-doc-kho-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-01T06:09:19Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-doc-kho-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-01T06:09:19Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-doc-kho-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-01T06:09:19Z

### Judgment (panel đề xuất, chờ người quyết ở Cổng 2; hợp đồng T3 nên mọi mục judgment đều cần human_override)

- eval: E15j
  judged_by: judge panel (fresh context): domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: |
    - domain-correctness: PASS — Trong cham-bo-do.md, các câu nhóm khó c11 đến c20 đều có trích nguyên văn đỡ đúng điều khẳng định (ví dụ c11 "dưới 20 triệu không phát sinh hoa hồng" cho 15 triệu; c16, c19, c20 mỗi vế đều có trích riêng); 6 câu không-có c21 đến c26 đều từ chối với câu trả lời rỗng. Lượt Zalo chỉ nhầm một dòng (c38, câu OKR, nhãn "chuyen", khớp 10.0% = 1/10); các câu không dấu c27 đến c30 đều chuyển đúng, các câu có tên khách (c31, c36, c37) đều không chuyển. Giới hạn: chỉ đối chiếu với các trích trong tệp này, không có nội dung trang gốc.
    - operational-feasibility: PASS — Lượt một, 24 câu có trang đều kèm trích dẫn nguyên văn khớp khẳng định; 6 câu không-có đều bị từ chối. Lượt Zalo, 30 câu quy định đều "chuyen", chỉ c38 chuyển nhầm, khớp 10%. Một ca lẻ chưa đủ để nói có kiểu nhầm lặp lại.
    - spec-alignment: PASS — 24 câu trả lời lượt một chỉ khẳng định điều nằm trong trích đi kèm; 6 câu không-có đều bị từ chối. Lượt Zalo: 30 câu quy định đều chuyển, câu có tên khách (c36, c37) đều không chuyển; một lần nhầm (c38, đúng 1/10 = ngưỡng) nên chưa thấy kiểu nhầm lặp lại theo cùng loại câu.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

- eval: E16j
  judged_by: judge panel (fresh context): domain-correctness, operational-feasibility, spec-alignment
  verdict: UNCERTAIN
  rationale: |
    - domain-correctness: UNCERTAIN — Ở 1440 các ảnh đọc rõ và không chồng chữ (trả lời có tên trang, "Phiên bản 1", "duyệt 01/10/2026", đoạn trích; quá hạn có dải cảnh báo kèm tên chủ trang; từ chối nói "Mình không đoán" và nêu trang gần nhất). Nhưng chỉ có một ảnh ở 390 (trạng thái trả lời), chưa đủ căn cứ cho trống, từ chối, quá hạn (dải cảnh báo dài nhất) và báo sai ở khổ hẹp, cũng chưa có số đo cuộn ngang. Chữ "trợ lý AI" không hiện trên màn nào và "bản đang dùng" chỉ có trong dòng phụ, nên chưa rõ nhãn có theo từ điển hay không.
    - operational-feasibility: UNCERTAIN — Ở 1440 bốn trạng thái đọc được rõ, dùng đúng "chủ trang" và "quá hạn xác minh" của CONTEXT.md, không chữ đè nhau. Câu hỏi đòi cả 390 và 1440 mà ở 390 chỉ có ảnh trạng thái trả lời; ảnh tĩnh cũng không chứng minh được không cuộn ngang. Không nhãn nào nói "trợ lý AI" hay "bản đang dùng", nên chưa chắc người đọc hiểu phiên bản đó là bản đang dùng.
    - spec-alignment: UNCERTAIN — Ở 1440 nhãn khớp từ điển và đọc được; hộp quá hạn nói rõ lúc nào nên hỏi chủ trang. Ở 390 chỉ có ảnh trả lời có trích, đúng một trong năm trạng thái. Ba trạng thái còn lại (trống, từ chối, báo sai), nhất là hộp quá hạn dài một dòng, không có ảnh 390, nên chưa đủ căn cứ cho phần "khổ 390 và 1440, không cuộn ngang, không chồng chữ".
  required_evidence:
    - Ảnh tab Hỏi ở 390px cho trạng thái quá hạn xác minh (tlk-hoi-qua-han-390.png), cùng bộ chụp, lưu ở _acceptance/tro-ly-doc-kho/evidence/: cho thấy dải cảnh báo xuống dòng, không đè lên câu trả lời hay cắt chữ.
    - Ảnh 390px cho trạng thái trống (tlk-hoi-trong-390.png), từ chối (tlk-hoi-tu-choi-390.png) và báo sai (tlk-bao-sai-390.png): cho thấy ba nút gợi ý, dòng "Trang gần nhất" và "Đã báo sai" không chồng chữ.
    - Số đo document.documentElement.scrollWidth không vượt innerWidth (390) trên tab Hỏi ở cả năm trạng thái, ghi ra tệp .txt cạnh ảnh, vì ảnh tĩnh không chứng minh được không cuộn ngang.
    - Xác nhận của người ký tại Cổng Bằng chứng rằng tab Hỏi không cần hiện chữ "trợ lý AI" / "bản đang dùng" trên màn trống và màn trả lời (CONTEXT.md mục Trợ lý AI nói luôn viết đủ trợ lý AI), hoặc ảnh sau khi thêm chữ đó.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (lệnh bun run test -- "cd apps/agent && bun test test/tro-ly-kho-ranh-gioi.spec.ts test/khuon-di-dong.spec.ts") xanh trên cả HEAD lẫn baseline: không phân biệt được feature với code cũ. Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý. Các eval feature còn lại đều red trên baseline (có phân biệt).

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, tất định).

## Iterations

Round 1: không eval máy nào đỏ, failed_evals rỗng; verdict REJECT do workflow tính sẵn, chi tiết các phát hiện trong hợp đồng ở review-findings.md. E16j còn UNCERTAIN và E15j chờ human_override (hợp đồng T3). Chưa chuyển sang vòng sau.
