---
schema_version: 2
feature_slug: nen-kara
verdict: REJECT
failed_evals: [E8]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d56f3bec890e90dbb5101fa3ad95aefc264198ae
human_signoff:
---

# Evidence Report: nen-kara

Round 2. Kết luận REJECT vì một eval máy đỏ: E8 (lệnh gồm hai nửa, nửa thứ hai không chạy được). Mười ba eval còn lại xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-7 | test | FAIL |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-12 | judgment | PASS |
| E14 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nen-kara-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_inline
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Ran 1 test across 1 file. [647.00ms]

- eval: E2
  run_id: minted-nen-kara-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_hai_do_day
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Ran 1 test across 1 file. [844.00ms]

- eval: E3
  run_id: minted-nen-kara-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nk_man_cu
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Ran 17 tests across 2 files. [11.57s]

- eval: E4
  run_id: minted-nen-kara-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_bien_nhan
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Ran 1 test across 1 file. [911.00ms]

- eval: E5
  run_id: minted-nen-kara-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_dau
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Ran 1 test across 1 file. [487.00ms]

- eval: E6
  run_id: minted-nen-kara-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_vi_sao
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Ran 2 tests across 1 file. [793.00ms]

- eval: E7
  run_id: minted-nen-kara-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_phan_hoi
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Ran 1 test across 1 file. [839.00ms]

- eval: E8
  run_id: minted-nen-kara-E8-r2
  exit_code: 1
  baseline: red
  verifier: config:executors.test.nk_tom_tat
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Nửa đầu (nen-kara-man-cu.dom.tsx -t tom-tat): 2 pass, 2 filtered out, 0 fail, 5 expect() calls.
    Nửa sau (tro-ly-okr-tom-tat.dom.tsx): bun báo "preload not found" với đường dẫn ../../packages/ui/test/tro-ly-okr-tom-tat.dom.tsx, lệnh dừng ở đây.
    Tệp apps/app/test/tro-ly-okr-tom-tat.dom.tsx có thật trong kho. Chạy lại riêng nửa sau, chỉ đọc, ngoài lượt đo: 24 pass, 0 fail, 75 expect() calls.
    Kết quả tính cho eval vẫn là đỏ theo mã thoát của lần chạy máy; người quyết xem lệnh có phải trục trặc khi gọi bun không.

- eval: E9
  run_id: minted-nen-kara-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_hai_tieng
  verified_at: 2026-10-02T18:06:53Z
  output: |
    Ran 5 tests across 1 file. [13.00ms]

- eval: E10
  run_id: minted-nen-kara-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nk_man_proto
  verified_at: 2026-10-02T18:06:53Z
  screenshot: evidence/E10-ST-nenkara-nhan-1440-light.png
  observed: |
    Đã mở 8 frame bằng Read, mọi frame khớp expected: ở 1440 và 390, đề xuất inline nằm liền dưới dòng KR, không viền, câu cũ gạch, câu mới tô nền nhạt, một nút chính màu xanh.
    Thẻ card ở cột phải có viền, biên nhận "Đã đổi tên theo Kara · Hoàn tác" thu lại tại chỗ; nút "Hữu ích" và "Không hữu ích" hiện đúng; không frame nào tràn ngang.
  network_observed: n-a (driver)
  output: |
    rang/man-proto.mjs đo 32 ô (8 trạng thái, 2 khổ, 2 nền), 0 ô sai.
    Chiều đỏ --kiem-do-do vien in "inline co vien" và dừng không thành công, đúng kỳ vọng.
    Chiều đỏ --kiem-do-do hop-con in "inline co hop con" (20 dòng, "DO: 20 dong sai") và dừng không thành công, đúng kỳ vọng.
    32 ảnh E10-*.png do chính man-proto.mjs chụp bằng puppeteer; không có E10-network.txt vì driver không đọc được network.

- eval: E11
  run_id: minted-nen-kara-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nk_mo_coi
  verified_at: 2026-10-02T18:06:53Z
  output: |
    RĂNG TÊN GỌI XANH

- eval: E12
  run_id: minted-nen-kara-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nk_tai_lieu
  verified_at: 2026-10-02T18:06:53Z
  output: |
    XANH

- eval: E13
  judged_by: judge panel (3 lens, fresh context)
  verdict: PASS
  proposal: PASS
  rationale: Cả ba lens cùng chấm đạt trên ảnh E10 và luật docs/ai-ux.md; đây là đề xuất của hội đồng, người quyết ở Gate 2.
  votes:
    - domain-correctness: PASS — (1) Ở 1440 và 390, đề xuất inline không viền, nằm ngay dưới dòng KR "Gọi điện cho đối tác mới mỗi tuần", thụt lề cùng cột chữ KR, hiện ra như dòng con của bảng (khớp mục 5). Card nằm trong cột riêng và biên nhận "Đã đổi tên theo Kara · Hoàn tác" thu lại tại chỗ, đúng mục 5 và 6. (2) Mỗi đề xuất chỉ có một nút tô xanh gọi đúng hậu quả ("Đổi tên KR", "Thêm KR đối trọng"), "Sửa" viền, "Bỏ qua" là chữ. (3) Ở 390, câu mới "Đối tác mới hẹn gặp được sau cuộc gọi đầu tiên" bẻ hai dòng liền mạch, chữ cũ gạch một dòng, lý do hai dòng, ba nút nằm chung một hàng.
    - operational-feasibility: PASS — (1) Đề xuất inline (1440 và 390) không viền, nằm ngay dưới dòng KR "Gọi điện cho đối tác mới mỗi tuần" bên trong cùng khung bảng, là một dòng con với diff gạch cũ/tô mới, đúng mục 5 của ai-ux.md. (2) Mỗi đề xuất có đúng một nút tô màu ("Đổi tên KR", "Thêm KR đối trọng"), "Sửa" viền, "Bỏ qua" chữ; dòng biên nhận chỉ có "Hoàn tác" dạng chữ, đúng mục 6. (3) Ở 390 câu mới "Đối tác mới hẹn gặp được sau cuộc gọi đầu tiên" chỉ xuống dòng một lần nhưng vẫn nằm trong một khối nền chèn liền mạch, lý do và hàng nút cũng không bị bẻ vụn.
    - spec-alignment: PASS — (1) Ở cả 1440 và 390, đề xuất inline không viền, nằm ngay dưới dòng KR "Gọi điện cho đối tác mới mỗi tuần" trong cùng khung bảng, và chữ gạch ở thân trùng đúng chữ của dòng đó, nên đọc như dòng con của nó chứ không phải hộp riêng (đúng mục 5). (2) Mỗi đề xuất có một nút tô xanh ("Đổi tên KR" ở inline, "Thêm KR đối trọng" ở card), "Sửa" viền và "Bỏ qua" chỉ là chữ; dòng biên nhận "Đã đổi tên theo Kara · Hoàn tác" thu gọn tại chỗ và "Hoàn tác" là chữ, đúng mục 6. (3) Ở 390, câu mới và dòng lý do chỉ xuống dòng ở ranh giới từ, thành hai đoạn đọc liền mạch, nút vẫn nằm trên một hàng.
  human_override:  # chi nguoi ghi

- eval: E14
  run_id: minted-nen-kara-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nk_san_thiet_ke
  verified_at: 2026-10-02T18:06:53Z
  output: |
    design-gate.mjs --mode static chạy lần lượt trên sáu tệp màn của lượt và mọi .tsx dưới proto/_modules/nen-kara, không tệp nào bị chặn.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-nen-kara-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-02T18:06:53Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-nen-kara-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-02T18:06:53Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-nen-kara-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-02T18:06:53Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-nen-kara-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-02T18:06:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-nen-kara-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-02T18:06:53Z

- cmd: bun run lint:slop
  run_id: minted-nen-kara-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-02T18:06:53Z

- cmd: bunx turbo run build --force
  run_id: minted-nen-kara-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-02T18:06:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

Hai eval xanh cả trên bản trước lượt lẫn bản hiện tại (baseline green), nên chúng chứng minh bộ đo chứ không chứng minh tính năng mới. Cả hai là hàng rào hồi quy có chủ ý:

- E3 (AC-3): hai màn cũ vẫn ra bản card như trước. Lưu ý finding t6 ở review-findings.md: đối chứng dương trên merge-base mà expected hứa chưa chạy được vì bản trước lượt không có thuộc tính data-density.
- E11 (AC-10): hai thước mồ côi và tên gọi sẵn có, xanh cả hai phía.

Lệnh fail không gắn eval: không có. Lệnh duy nhất đỏ là lệnh của E8.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT, E10 đỏ ở chiều đỏ của script đo (đã vá ở commit 475d8177), kèm các finding trong sổ quyết định S4-r1.
Round 2: E8 đỏ, lệnh gồm hai nửa; nửa đầu xanh (2 pass), nửa sau không chạy vì bun báo không tìm thấy preload với đường dẫn ../../packages/ui/test/tro-ly-okr-tom-tat.dom.tsx. Chạy lại riêng nửa sau ngoài lượt đo thấy 24 pass, nên nghi lỗi khi gọi bun hoặc lệnh trong config chứ chưa chắc lỗi mã tính năng. Quay lại bước thực thi để người quyết xem lại lệnh nk_tom_tat.
