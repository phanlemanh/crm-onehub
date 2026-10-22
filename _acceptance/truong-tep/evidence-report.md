---
schema_version: 2
feature_slug: truong-tep
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bdafae523cc0d91443537c3d8b8148b5e40b169c
human_signoff:
---

# Evidence Report: truong-tep

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | script | PASS |
| E10 | AC-10 | ui-check | PASS |

Vòng 2 (cây bdafae523): cả 16 eval đạt. Báo cáo vẫn là REJECT vì một lệnh suite không gắn eval nào bị hỏng: `bunx turbo run lint --force` có mã thoát khác 0, tác vụ hỏng là `@crm/ui#lint` ("Some errors were emitted while running checks"; 7 trên 11 tác vụ thành công). Vòng 1 cùng lệnh này đạt, và commit bdafae523 (sửa vòng 1) có chạm `packages/ui/src/components/nguon-keo-tha.tsx` cùng `packages/ui/test/nguon-keo-tha.dom.tsx`; phần đuôi kết quả chỉ nêu tên tác vụ hỏng, không nêu tệp hay luật lint nào, nên nguyên nhân cụ thể cần đọc trực tiếp từ `bun run lint` trong `packages/ui`. `failed_evals` để trống vì không eval nào hỏng.

## Evidence

- eval: E1
  run_id: minted-truong-tep-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tao_truong
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g2bugvgt_test

- eval: E1b
  run_id: minted-truong-tep-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_cai_dat
  verified_at: 2026-10-22T05:21:34Z
  output: |
    Ran 1 test across 1 file. [708.00ms]

- eval: E2
  run_id: minted-truong-tep-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tai_len
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g27nynqu_test

- eval: E2b
  run_id: minted-truong-tep-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_blob_that
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g225qfhc_test

- eval: E3
  run_id: minted-truong-tep-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tu_choi
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g2m16n1m_test

- eval: E4
  run_id: minted-truong-tep-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_quyen
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g3jrjacy_test

- eval: E4b
  run_id: minted-truong-tep-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_o_tep
  verified_at: 2026-10-22T05:21:34Z
  output: |
    Ran 2 tests across 1 file. [1010.00ms]

- eval: E5
  run_id: minted-truong-tep-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_loc
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g1wc97u8_test

- eval: E5b
  run_id: minted-truong-tep-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_man_loc
  verified_at: 2026-10-22T05:21:34Z
  output: |
    Ran 1 test across 1 file. [1252.00ms]

- eval: E6
  run_id: minted-truong-tep-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_xoa
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g21isyje_test

- eval: E7
  run_id: minted-truong-tep-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_vong_doi
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g36zo3i0_test

- eval: E8
  run_id: minted-truong-tep-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_khoa
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g2eurduh_test

- eval: E8b
  run_id: minted-truong-tep-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_kho_tai_lieu
  verified_at: 2026-10-22T05:21:34Z
  output: |
    ttp kho tai lieu: dat

- eval: E9
  run_id: minted-truong-tep-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_ghi_chu
  verified_at: 2026-10-22T05:21:34Z
  output: |
    test-run: dropped crm_mvj3g3f1cke2_test

- eval: E9b
  run_id: minted-truong-tep-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttp_quet
  verified_at: 2026-10-22T05:21:34Z
  output: |
    ttp quet: dat

- eval: E10
  run_id: minted-truong-tep-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttp_man
  verified_at: 2026-10-22T05:21:34Z
  screenshot: evidence/E10-step1.png
  observed: |
    step1 ttp-rong-1280: phiếu 'Thoả thuận T1 ttp', mục CHI TIẾT có hàng 'Hợp đồng' = 'Chưa có tệp.' và vùng nét đứt 'Kéo tệp vào đây' + nút 'Chọn tệp' (PDF, DOCX, PNG, JPG · tối đa 20 MB · 10 tệp). Đúng Expected. step2 ttp-dang-tai-1280: dòng 1 'Phụ lục 01.pdf' 24KB · 22 thg 10, 2026 · bởi manh.phan có Mở/Xoá; dòng 2 tên dài 'Hợp đồng hợp tác An Phú — bản ký chính thức có phụ lục giá năm 2026.pdf' với 'Đang tải lên…' và icon xoay; tên dài cắt, không đè nút. Đúng. step3 ttp-co-tep-1280: hai dòng tệp đầy đủ tên, 24KB, ngày, người tải manh.phan, nút Mở và Xoá; tên dài nằm trọn một dòng không đè nút. Đúng. step4 ttp-loi-tep-375: khung 375, dòng PDF 'Hợp đồng hợp tác An P…' (cắt một dòng) và 'Biên bản bàn giao.pdf' đã tải xong có Mở/Xoá xuống hàng thứ hai; dòng 'Bảng giá.xlsx' báo 'Tệp này không phải PDF, DOCX hay ảnh PNG, JPG.' có nút Bỏ. Không cuộn ngang. Đúng. step5 ttp-hoi-xoa-1280: hộp thoại 'Xoá tệp «Biên bản bàn giao.pdf»?' 'Tệp mất hẳn, không hoàn tác được.' với Huỷ và Xoá tệp (đỏ), nêu đúng tên tệp. Đúng. step6 ttp-khong-mo-375: phiên nhân viên, các dòng tệp chỉ còn nút 'Mở' (mờ/khoá, không có Xoá) và dòng 'Chỉ quản trị mở được tệp.' dưới danh sách. Đúng. step7 ttp-tat-1280: tên hai tệp vẫn hiện; nút 'Mở' xám khoá, vùng tải 'Chọn tệp'/'Kéo tệp vào đây' xám khoá, dòng 'Kho tệp chưa bật trên máy chủ nên chưa tải tệp lên được.' Đúng. step8 ttp-loc-1280: danh sách Thoả thuận có cột 'Hợp đồng'; menu Lọc › Hợp đồng (1) hiện 'Bỏ chọn', 'Có tệp 1', 'Chưa có tệp 2' (tích); bảng chỉ còn T3 và T2, '1–2 trong số 2'; T3 cột Hợp đồng '—'. Đúng (số tệp của T1 không thấy trong ảnh vì T1 đã bị lọc ra, được script kiểm bằng DOM).
  network_observed: n-a (driver)
  output: |
    Lệnh: tien-de.mjs --chay "bun _acceptance/truong-tep/rang/do-man.mjs"; dòng cuối 'ttp man: dat' và 'phien-do: xong — mã 0' (phiên đo riêng, kho crm_stoic_hellman_2eb156_do, app :4218, api :4129, kho Blob giả).
    Các khẳng định của script đều qua: db.fieldFile có 2 hàng; 375 không cuộn ngang; cột Hợp đồng T1 '2 tệp', T2 và T3 '—'; menu lọc Có tệp 1 / Chưa có tệp 2; URL mang field:<khoá>=none; bảng chỉ còn T2 T3; mở tệp ra tab ttpgia.private.blob.vercel-storage.com có chữ ký (quản trị); API khởi lại không có TEP_BAN_GHI_BLOB_TOKEN thì vùng tải và Mở khoá; lưu trữ T1 ở chế độ chỉ đọc.
    Tám khung ttp-*.png mới (12:22) trong _acceptance/truong-tep/evidence/, chép sang E10-step1..8.png theo thứ tự rộng, đang-tải, có-tệp, lỗi-tệp-375, hỏi-xoá, không-mở-375, tắt, lọc; các khung E10-step cũ của vòng 1 đã bị ghi đè. Chạy UI qua script, không dùng bun run ui:capture. Driver không có log mạng nên không ghi E10-network.txt.
    Lưu ý nhỏ, không làm hỏng: ở khung ttp-loc-1280 menu lọc che cột Hợp đồng nên '2 tệp' của T1 không nhìn thấy trong ảnh; ở 375 cột nhãn 'Hợp đồng' chiếm bên trái nên danh sách tệp hẹp (~200px) và dòng meta xuống 2 dòng.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T05:21:34Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T05:21:34Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T05:21:34Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T05:21:34Z

- cmd: bunx turbo run lint --force
  run_id: minted-truong-tep-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 1
  verified_at: 2026-10-22T05:21:34Z

- cmd: bun run lint:slop
  run_id: minted-truong-tep-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T05:21:34Z

- cmd: bunx turbo run build --force
  run_id: minted-truong-tep-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T05:21:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round 1 — baseline không đo lại round này.

Non-discriminating (xanh ở cả HEAD lẫn baseline): none.

Baseline khong do:
- Cả 16 eval feature mang baseline n-a. Round 1 đã bỏ qua baseline vì các tệp bài kiểm (apps/api/test/truong-tep.spec.ts, apps/app/test/truong-tep.dom.tsx, packages/db/test/blob-tep-truong.spec.ts, các rang trong _acceptance/truong-tep/rang) có ở cây đang kiểm nhưng chưa có ở merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval mới, chạy trên code cũ không phân biệt gì. Round 2 không đo lại vì evals.yaml không đổi từ lần baseline cuối.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval ngẫu nhiên)

## Iterations

Round 1: E10 failed — tên tệp dài ở 375 xuống nhiều dòng thay vì cắt một dòng vì ItemTitle (packages/ui/src/components/item.tsx) có «line-clamp-1» cùng «flex», display:flex đè lên line-clamp; dòng meta cũng xuống hai dòng và cột giá trị hẹp (khoảng 205px). Returned to implementation.
Round 2: 16 eval đạt kể cả E10 (tên dài cắt một dòng ở 375 sau commit bdafae523); REJECT vì lệnh suite `bunx turbo run lint --force` hỏng ở `@crm/ui#lint`, không gắn eval nào. Returned to implementation.

