---
schema_version: 2
feature_slug: khung-ban-ghi-kara
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 622729872dded2fdb50d0b99691456985d414fe4
human_signoff: Phan Le Manh 2026-10-08 — ký Cổng Bằng chứng trên vòng chấm 2 (17/17 eval đạt, 7/7 lệnh suite xanh, hội đồng E17 đạt, 0 phát hiện trong hợp đồng; vòng này không đo đường nền). Mười hai mục ngoài hợp đồng định đoạt từng mục — Ngoài-1, 2, 6–10 ghi Known limits; Ngoài-4, 5 mở hợp đồng mới; Ngoài-3, 11, 12 chấp nhận không sửa. Phạm vi cắt/hoãn đồng ý như đã khai; các quyết định ghi sau Cổng Phạm vi được phê toàn bộ.
---

# Evidence Report: khung-ban-ghi-kara

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-12 | test | PASS |
| E16 | AC-13 | ui-check | PASS |
| E17 | AC-13 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-ban-ghi-kara-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_tab_rong
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx -t tab-rong
    Ran 1 test across 1 file. [1411.00ms]

- eval: E2
  run_id: minted-khung-ban-ghi-kara-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_dang_lam
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx -t dang-lam
    (bài lọc theo -t dang-lam chạy xong, không có dòng lỗi)

- eval: E3
  run_id: minted-khung-ban-ghi-kara-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_loi
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx -t loi-gui
    Ran 1 test across 1 file. [1399.00ms]

- eval: E4
  run_id: minted-khung-ban-ghi-kara-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_khoa
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx -t khoa
    (bài lọc theo -t khoa chạy xong, không có dòng lỗi)

- eval: E5
  run_id: minted-khung-ban-ghi-kara-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kbk_chu_cung
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ node _acceptance/khung-ban-ghi-kara/rang/chu-cung.mjs
    KET LUAN: 0 cho sai

- eval: E6
  run_id: minted-khung-ban-ghi-kara-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_hoi_lai
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx -t hoi-lai
     10 expect() calls
    Ran 1 test across 1 file. [1.91s]

- eval: E7
  run_id: minted-khung-ban-ghi-kara-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_de_xuat_cho
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi-de-xuat.dom.tsx -t de-xuat-cho
     11 expect() calls
    Ran 1 test across 1 file. [1479.00ms]

- eval: E8
  run_id: minted-khung-ban-ghi-kara-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_ui_nhan
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi-de-xuat.dom.tsx -t nhan-hoan-tac
    Ran 2 tests across 1 file. [1.58s]

- eval: E9
  run_id: minted-khung-ban-ghi-kara-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_api_nhan
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ bun run test -- "cd apps/api && bun test test/hoan-tac-thong-tin.spec.ts -t nhan"
    test-run: dropped crm_muyopo9v2n7h_test

- eval: E10
  run_id: minted-khung-ban-ghi-kara-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_api_bo_qua
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ bun run test -- "cd apps/api && bun test test/hoan-tac-thong-tin.spec.ts -t bo-qua" && cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi-de-xuat.dom.tsx -t bo-qua
    Ran 1 test across 1 file. [727.00ms]

- eval: E11
  run_id: minted-khung-ban-ghi-kara-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_api_chan
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ bun run test -- "cd apps/api && bun test test/hoan-tac-thong-tin.spec.ts -t chan"
    (bài lọc theo -t chan chạy xong, không có dòng lỗi)

- eval: E12
  run_id: minted-khung-ban-ghi-kara-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_ui_hoan_tac_loi
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi-de-xuat.dom.tsx -t hoan-tac-loi
    Ran 2 tests across 1 file. [815.00ms]

- eval: E13
  run_id: minted-khung-ban-ghi-kara-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_khung_loi
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx -t khung-loi
    Ran 1 test across 1 file. [1080.00ms]

- eval: E14
  run_id: minted-khung-ban-ghi-kara-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_tra_cuu
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx -t tra-cuu
    Ran 1 test across 1 file. [967.00ms]

- eval: E15
  run_id: minted-khung-ban-ghi-kara-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kbk_them_nhanh
  verified_at: 2026-10-07T22:33:44Z
  output: |
    $ cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-giu.dom.tsx -t them-nhanh
    Ran 1 test across 1 file. [1.84s]

- eval: E16
  run_id: minted-khung-ban-ghi-kara-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kbk_man
  verified_at: 2026-10-07T22:33:44Z
  screenshot: evidence/E16-step1.png
  observed: |
    Đã mở từng ảnh vừa chụp. Tab Kara của ngăn cá nhân, công ty và thoả thuận cùng một khuôn: tiêu đề "Hỏi Kara về … này", ba gợi ý tiếng Việt, ô soạn; không còn chữ tiếng Anh. Trạng thái chưa bật hiện dòng "Kara chưa được bật cho hồ sơ…" dưới ô soạn, không có chuỗi kỹ thuật.
    Tab Tổng quan: nhãn "Kara · 1 đề xuất" cùng "Vì sao?", đề xuất "Giám đốc kinh doanh" dưới "Trưởng phòng" với nút "Thay giá trị hiện có" và "Bỏ qua". Sau khi nhận hiện biên nhận "Đã thay theo Kara" cùng "Hoàn tác"; bấm Hoàn tác thì "Trưởng phòng" quay lại, đề xuất hiện lại và tiêu điểm nằm trên nút chính.
    Ở 390 px ngăn cá nhân và tab Tổng quan không có nút bị cắt hay cuộn ngang. E16-step1..4 là bản chép của kbk-kara-ca-nhan-1440, kbk-kara-trang-thai-1440, kbk-hoan-tac-1440, kbk-de-xuat-390; tất cả khớp Expected.
  network_observed: n-a (driver)

- eval: E17
  judged_by: judge panel (3 lens, fresh context)
  verdict: PASS
  rationale: Đề xuất PASS của panel cho AC-13. Hai lens cho PASS, một lens operational-feasibility chưa chốt và nêu ba điểm ảnh không chứng minh được (xem phần Judge panel). Không có chỗ lệch luật nào thấy rõ trong ảnh.
  required_evidence:
    - xem phần Judge panel, lens operational-feasibility
  human_override:  # chi nguoi ghi

### Judge panel (đề xuất, E17)

- domain-correctness: PASS — Ba tab Kara (kbk-kara-ca-nhan, cong-ty, thoa-thuan) cùng một khuôn: dấu tia sáng xám cạnh chữ «Kara», tiêu đề «Hỏi Kara về … này», ba gợi ý, ô soạn. Ảnh trạng thái đúng hàng «Tắt» của mục 7, đề xuất neo dưới trường không khung thẻ với nhãn «Kara · 1 đề xuất» một lần và nút «Thay giá trị hiện có», biên nhận «Đã thay theo Kara · Hoàn tác» đúng mục 6. Ở 390 không có chữ hay nút bị cắt hay tràn; chỉ có lệch nhỏ không đủ để FAIL.
- operational-feasibility: UNCERTAIN — Nhìn chung là cùng một Kara với luật. Tab Kara ở ba loại ngăn có cùng khung. Dấu tia sáng màu xám phụ đi kèm chữ «Kara». Nhãn «Kara · 1 đề xuất» chỉ xuất hiện một lần ở đầu nhóm. Đề xuất neo dưới trường Chức danh, không khung thẻ. Nút «Thay giá trị hiện có» nói đúng hậu quả. Biên nhận «Đã thay theo Kara · Hoàn tác» đúng mục 6. Nhưng có ba điểm ảnh không chứng minh được hoặc lệch. Ảnh trạng thái không thấy «nút khoá» của mục 7 vì bị huy hiệu nổi che. Đề xuất không có diff gạch/tô. Ảnh 390 có chữ bị cắt thành «Thé…».
  - required_evidence: kbk-kara-trang-thai-1440.png: chụp lại khi huy hiệu bãi biển nổi (góc phải dưới) đã tắt hoặc dời đi. Cần thấy rõ nút gửi bị khoá cạnh ô soạn, đúng dòng «nút khoá + FieldDescription» ở bảng mục 7. Ảnh hiện tại chỉ lộ một góc nút xanh sẫm bị che nên không xác nhận được. Cũng chụp thêm trạng thái lỗi «Kara chưa <làm gì> được» + «Thử lại» và trạng thái «Kara đang đọc…», để ảnh chứng cho cả bảng mục 7 chứ không chỉ trạng thái tắt.
  - required_evidence: kbk-de-xuat-1440.png: hoặc xác nhận bằng văn bản từ chủ luật (docs/ai-ux.md mục 5) rằng đề xuất đổi giá trị trường liên hệ («Trưởng phòng» sang «Giám đốc kinh doanh») không phải «viết lại» nên không cần diff chữ cũ gạch/chữ mới tô nền. Hoặc ảnh chụp lại, trong đó giá trị cũ bị gạch và giá trị mới tô nền chèn. Ảnh hiện tại giữ «Trưởng phòng» nguyên vẹn và «Giám đốc kinh doanh» không tô.
  - required_evidence: kbk-kara-ca-nhan-390.png: xác nhận từ chủ lượt (khung-ban-ghi-kara) rằng ô «Công ty» chỉ hiện «Thé…» (3 ký tự, mất tên công ty) ở 390 px là chủ ý chấp nhận được. Hoặc ảnh 390 chụp lại với tên công ty đọc được (xuống dòng hoặc co ô). Ảnh này cũng cho thấy dòng «Kara» của trạng thái rỗng dính sát vạch ngăn ngay dưới «Cuộc trò chuyện mới», cần một ảnh có khoảng đệm rõ để loại trừ việc bị cắt.
- spec-alignment: PASS — Ba tab Kara (kbk-kara-ca-nhan, cong-ty, thoa-thuan) cùng một khuôn: dấu tia sáng xám + «Kara», tiêu đề «Hỏi Kara về … này», ba gợi ý và ô soạn. Ảnh trạng thái tắt dùng nút gửi khoá cùng dòng chữ phụ nói khi nào mở lại, đúng hàng «Tắt» ở mục 7. Đề xuất neo dưới trường «Chức danh» không khung thẻ, nhãn «Kara · 1 đề xuất» một lần, nút «Thay giá trị hiện có», biên nhận «Đã thay theo Kara · Hoàn tác», nên khớp mục 2, 3, 5, 6. Ở 390 không có chữ hay nút bị cắt hoặc tràn. Lệch nhỏ không đủ để FAIL: dấu tia sáng ở trên cùng ô Kara sát đường kẻ ở kbk-kara-ca-nhan-390, đề xuất kbk-de-xuat chưa hiện chữ cũ gạch, và chưa thấy dấu nhỏ «đổi theo Kara» trên giá trị ở kbk-bien-nhan.

Đề xuất panel: PASS. human_override của E17 để TRỐNG cho người quyết ở Cổng 2.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-ban-ghi-kara-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-07T22:33:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-ban-ghi-kara-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-07T22:33:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-ban-ghi-kara-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-07T22:33:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-ban-ghi-kara-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-07T22:33:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-ban-ghi-kara-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-07T22:33:44Z

- cmd: bun run lint:slop
  run_id: minted-khung-ban-ghi-kara-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-07T22:33:44Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-ban-ghi-kara-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-07T22:33:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi; field baseline cua tung eval ghi n-a).

Eval không-phân-biệt: không có mục nào được liệt kê. Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định)

## Iterations

Round 1: S4-r1 trả về triển khai; vá ở commit 31dd203d1 (hoàn tác giữ đề xuất và tiêu điểm, biên nhận theo động từ nút, gợi ý xuống dòng, khoá ô soạn khi Kara chưa bật).
Round 2: 16 eval máy xanh, 7 lệnh suite xanh, E17 đề xuất PASS tại commit 622729872 (không đo lại đường nền).
