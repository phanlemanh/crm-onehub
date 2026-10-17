---
schema_version: 2
feature_slug: tra-cuu-thuong-hieu-viet-nam
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b23b82b213795b4ba7f5da2fcbf518848b35c476
human_signoff: Manh Phan 2026-10-17
---

# Evidence Report: tra-cuu-thuong-hieu-viet-nam

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-4 | test | PASS |
| E2 | AC-3 | test | PASS |
| E3 | AC-1 | test | PASS |
| E4 | AC-1 | test | PASS |
| E5 | AC-2 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-1 | judgment | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-7 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_danh_sach
  verified_at: 2026-10-16T14:28:56Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: mvb1gdhyi51x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_api
  verified_at: 2026-10-16T08:25:52Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-17T03:36:45Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx
    Ran 11 tests across 1 file. [2.63s]

- eval: E4
  run_id: mvbuhzmuvt4w
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_api
  verified_at: 2026-10-17T03:36:45Z
  output: |
    bun run test -- "cd apps/api && bun test test/ten-mien-nen-tang.spec.ts"
    test-run: dropped crm_mvbuhzmuvt4w_test

- eval: E5
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-17T03:36:45Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx
    Ran 11 tests across 1 file. [2.63s]

- eval: E6
  run_id: mvbuhzivlql1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-17T03:36:45Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts"
    test-run: dropped crm_mvbuhzivlql1_test

- eval: E7
  run_id: mvbuhzivlql1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-17T03:36:45Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts"
    test-run: dropped crm_mvbuhzivlql1_test

- eval: E8
  run_id: mvbuhzivlql1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-17T03:36:45Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts"
    test-run: dropped crm_mvbuhzivlql1_test

- eval: E9
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-16T14:28:56Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10
  run_id: E10-tthv-mot-luot-2026-10-16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tthv_chup
  verified_at: 2026-10-16T14:28:56Z
  carried_from_round: 2
  screenshot: evidence/E10-quoc-gia-vi-1440.png
  observed: |
    Đã mở từng ảnh vừa lưu.

    E10-quoc-gia-vi-1440: ngăn công ty «Titan chụp E10» mở bên phải, giao diện tiếng Việt. Dòng phụ ở đầu ngăn ghi «e10-tthv.vn · Menlo Park, CA, Hoa Kỳ». Mục Chi tiết có hàng «Quốc gia» = «Hoa Kỳ». Không tràn ngang. Góc dưới trái có huy hiệu «1 Issue» đỏ của Next dev overlay, chỉ có ở khung này. Nó không mâu thuẫn Expected nhưng đáng ghi nhận.

    E10-quoc-gia-vi-390: ngăn dạng drawer đáy. Dòng phụ «e10-tthv.vn · Menlo Park, CA, Hoa Kỳ» xuống hai dòng. Hàng «Quốc gia» = «Hoa Kỳ». Không có thanh cuộn ngang.

    E10-quoc-gia-en-1440: giao diện tiếng Anh. Dòng phụ «Menlo Park, CA, United States». Hàng «Country» = «United States». Không tràn.

    E10-quoc-gia-en-390: dòng phụ «Menlo Park, CA, United States» xuống hai dòng. Hàng «Country» = «United States». Không tràn.

    E10-loi-nen-tang-1440: sheet «Công ty mới». Ô Tên miền chứa «https://www.facebook.com/titanmiennam», viền đỏ. Ngay dưới ô có dòng lỗi đỏ «Đây là trang Facebook, không phải trang web của công ty. Để trống nếu công ty chưa có trang web riêng.» Dưới dòng lỗi là gợi ý xám nói cả đường dẫn cũng được và nêu ngoại lệ «Trang Facebook, Zalo hay LinkedIn không dùng được ở đây». Gợi ý này không mâu thuẫn câu lỗi. Không tràn ngang. Avatar nổi che một phần nút «Thêm công ty» ở góc dưới phải. Đây là lớp phủ của bàn đo, không phải lỗi bố cục của sheet.

    E10-loi-nen-tang-390: cùng nội dung, sheet chiếm gần hết chiều rộng. Dòng lỗi Facebook đỏ ngay dưới ô Tên miền, ngắt dòng gọn, không tràn. Nút «Thêm công ty» hiện đầy đủ ở đáy.

    Đối chiếu Expected: (1) vi hiện «Hoa Kỳ» ở dòng phụ và ô Quốc gia, en hiện «United States», ở cả 1440 và 390; (2) sheet có dòng lỗi gọi tên Facebook ngay dưới ô Tên miền ở cả 1440 và 390; không tràn ngang ở khung nào. Tất cả khớp.
  network_observed: n-a (driver)
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Đề xuất của hội đồng là PASS, cả ba lens cùng PASS. Chữ người dùng thấy gọi tên nền tảng, nói đó không phải trang web của công ty, rồi chỉ hai lối bằng chữ thường (dán trang web riêng, hoặc để trống nếu chưa có); gợi ý ô nêu ngoại lệ nên không mâu thuẫn câu báo. Người quyết ở Cổng 2.
  panel:
    - domain-correctness: PASS — Hàm `nenTang(ten)` ở cả bản vi và en gọi tên nền tảng, nói đó không phải trang web của công ty, rồi chỉ hai lối bằng chữ thường: dán trang web riêng của công ty, hoặc để trống nếu chưa có. Gợi ý `domainHint` vẫn nói «dán cả đường dẫn cũng được» nhưng liền sau đó nêu ngoại lệ: trang Facebook, Zalo hay LinkedIn không dùng được. Ở `company-sheet.tsx`, nhánh `onSave` của ô Tên miền gọi `companyMessages(locale).nenTang(nenTang.ten)` qua `toast.error`, không tự viết câu khác.
    - operational-feasibility: PASS — Trong `companies.ts`, hàm `nenTang(ten)` ở cả en và vi gọi tên nền tảng và nói đó không phải trang web riêng của công ty. Câu đó bảo cả hai lối bằng chữ thường, không thuật ngữ: dán trang web riêng của công ty, hoặc để trống nếu chưa có. `create.domainHint` (en và vi) có nói thêm rằng trang Facebook, Zalo, LinkedIn không dùng được ở đây, nên không bỏ sót ngoại lệ. Ở `company-sheet.tsx`, nhánh `onSave` của ô Tên miền gọi `companyMessages(locale).nenTang(nenTang.ten)` qua toast lỗi, không tự viết câu khác.
    - spec-alignment: PASS — Hàm `nenTang(ten)` ở cả bản vi và en gọi tên nền tảng, nói đó không phải trang web của công ty, rồi bảo rõ hai lối bằng chữ thường: dán trang web riêng của công ty, hoặc để trống nếu chưa có. Gợi ý `domainHint` ở cả hai bản vẫn có câu ngoại lệ về trang Facebook, Zalo, LinkedIn ngay sau câu «dán cả đường dẫn cũng được». Trong `company-sheet.tsx`, nhánh `onSave` của ô Tên miền gọi `companyMessages(locale).nenTang(nenTang.ten)` qua `toast.error` và không tự viết câu khác.
  human_override:  # chi nguoi ghi

- eval: E12
  run_id: mvbuhzivlql1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-17T03:36:45Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts"
    test-run: dropped crm_mvbuhzivlql1_test

- eval: E13
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Đề xuất của hội đồng là PASS, cả ba lens cùng PASS. Chuỗi description của công cụ nói đúng luật hiện tại (điền ô trống, thay ô máy điền lần trước mà chưa ai đổi, không ghi đè ô người đã gõ hay đã sửa) và không còn câu nào nói chỉ điền ô trống. Người quyết ở Cổng 2.
  panel:
    - domain-correctness: PASS — Chuỗi description nói đúng luật: điền ô trống, khi tra lại thì thay ô lần trước máy điền mà người chưa sửa, xoá phần địa chỉ mới không còn báo, và «Never overwrites a field a person typed or edited». Không còn câu nào nói công cụ chỉ điền ô trống. Tham số `companyId` không có mô tả. Tham số `fresh` chỉ nói về bộ đệm của nhà cung cấp, không nói gì sai về luật ghi đè. Câu `note` «Everything it returned was already on the record» cũng khớp, vì chỉ hiện khi không điền và không xoá gì.
    - operational-feasibility: PASS — Chuỗi description nói đúng luật hiện tại: điền ô trống, khi tra lại thì thay các ô lần trước đã điền mà chưa ai đổi, xoá phần địa chỉ mà kết quả mới không còn báo, và không bao giờ ghi đè ô người đã gõ hay đã sửa. Hai mô tả tham số, `companyId` (không có mô tả) và `fresh` (chỉ nói về bộ nhớ đệm), không có câu nào bảo công cụ chỉ điền ô trống.
    - spec-alignment: PASS — Chuỗi description nói đủ ba vế của luật: điền ô trống, khi tra lại thì thay ô lần tra trước đã điền mà chưa ai đổi, và không bao giờ ghi đè ô người đã gõ hay đã sửa. Mô tả tham số `fresh` chỉ nói về bộ đệm 90 ngày của nhà cung cấp, `companyId` không có mô tả, và không câu nào còn nói công cụ chỉ điền ô trống. Phần "clears address parts" là thêm vào, khớp với trường `cleared` trong mã và không mâu thuẫn với luật.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-17T03:36:45Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-17T03:36:45Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-17T03:36:45Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-17T03:36:45Z

- cmd: bunx turbo run lint --force
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-17T03:36:45Z

- cmd: bun run lint:slop
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-17T03:36:45Z

- cmd: bunx turbo run build --force
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-17T03:36:45Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)

Baseline khong do:

- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx: BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)
- bun run test -- "cd apps/api && bun test test/ten-mien-nen-tang.spec.ts": BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)
- bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts": BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)

Eval khong-phan-biet: khong co eval nao duoc liet ke, nhung baseline khong do duoc o round nay nen danh sach nay KHONG chung minh duoc eval nao co phan biet.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, deterministic)

## Iterations

Round 1: moi eval xanh; mot muc trong hop dong (AC-4, ma tran ten mien con moi phu 4 tren 14 nen tang) can va. Returned to implementation (commit 04244033a).
Round 2: E1, E5, E9, E10 chay lai tren cay 151afe63a; E2, E3, E4, E6, E7, E8 carry-forward tu round 1 (delta khong cham paths cua eval). Tat ca PASS.
Round 3: them E12 (AC-10) va E13 (AC-7); E3, E4, E5, E6, E7, E8, E12 chay lai tren cay def2833bb, E11 va E13 do hoi dong cham lai; E1, E2, E9, E10 carry-forward (delta khong cham paths cua eval). Tat ca PASS.

### Re-pin lần 1 — 2026-10-17, do gộp onehub b23b82b21 sau chữ ký (PR #462 xung đột)
run_id: repin-20261017T065612Z-82444
sha: b23b82b213795b4ba7f5da2fcbf518848b35c476 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E10, E11 (E11 không khai paths), E13 (E13 không khai paths) · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
