---
schema_version: 2
feature_slug: truong-tep
verdict: REJECT
failed_evals: ["E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ffe4477cdb91d0ca6e59d94acc941c4dbc98b686
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
| E10 | AC-10 | ui-check | REJECT |

Lệnh không gắn vào một eval riêng nhưng thất bại: `ui-check:E10` (thuộc E10). Script đo màn chạy trọn và các khẳng định DOM của nó đều qua, nhưng đối chiếu bằng mắt trên khung ảnh trái với phần «Đối chứng bằng mắt» của eval nên E10 bị chấm hỏng.

## Evidence

- eval: E1
  run_id: minted-truong-tep-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tao_truong
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e3icm4nb_test

- eval: E1b
  run_id: minted-truong-tep-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_cai_dat
  verified_at: 2026-10-22T04:22:31Z
  output: |
    Ran 1 test across 1 file. [786.00ms]

- eval: E2
  run_id: minted-truong-tep-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tai_len
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e33op7dr_test

- eval: E2b
  run_id: minted-truong-tep-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_blob_that
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e1gazvgg_test

- eval: E3
  run_id: minted-truong-tep-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tu_choi
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e2sdwh5r_test

- eval: E4
  run_id: minted-truong-tep-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_quyen
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e3gmkv7w_test

- eval: E4b
  run_id: minted-truong-tep-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_o_tep
  verified_at: 2026-10-22T04:22:31Z
  output: |
    Ran 2 tests across 1 file. [1023.00ms]

- eval: E5
  run_id: minted-truong-tep-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_loc
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e3em4mkl_test

- eval: E5b
  run_id: minted-truong-tep-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_man_loc
  verified_at: 2026-10-22T04:22:31Z
  output: |
    Ran 1 test across 1 file. [910.00ms]

- eval: E6
  run_id: minted-truong-tep-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_xoa
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e1v4r1zx_test

- eval: E7
  run_id: minted-truong-tep-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_vong_doi
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e2ogle5n_test

- eval: E8
  run_id: minted-truong-tep-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_khoa
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e3hefmab_test

- eval: E8b
  run_id: minted-truong-tep-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_kho_tai_lieu
  verified_at: 2026-10-22T04:22:31Z
  output: |
    ttp kho tai lieu: dat

- eval: E9
  run_id: minted-truong-tep-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_ghi_chu
  verified_at: 2026-10-22T04:22:31Z
  output: |
    test-run: dropped crm_mvj2e5341z0y_test

- eval: E9b
  run_id: minted-truong-tep-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttp_quet
  verified_at: 2026-10-22T04:22:31Z
  output: |
    ttp quet: dat

- eval: E10
  run_id: minted-truong-tep-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.ttp_man
  verified_at: 2026-10-22T04:22:31Z
  screenshot: evidence/E10-step1.png
  observed: |
    1 ttp-rong-1280: phiếu Thoả thuận T1 ttp, mục CHI TIẾT có «Hợp đồng» với «Chưa có tệp.» và vùng nét đứt «Chọn tệp / Kéo tệp vào đây / PDF, DOCX, PNG, JPG · tối đa 20 MB · 10 tệp». Khớp. 2 ttp-dang-tai-1280: dòng 1 «Hợp đồng hợp tác An Phú — bản ký chính thức có phụ lục giá năm 2026.pdf» 24KB·22 thg 10, 2026·bởi manh.phan có Mở/Xoá (tên dài vừa một dòng, không đè nút); dòng 2 «Phụ lục 01.pdf» «Đang tải lên…» với vòng quay. Khớp. 3 ttp-co-tep-1280: hai dòng tệp đủ tên, cỡ, ngày, người tải, Mở, Xoá. Khớp. 4 ttp-loi-tep-375: «Phụ lục 01.pdf», «Biên bản bàn giao.pdf» (xong, Mở/Xoá ở hàng riêng) và «Bảng giá.xlsx — Tệp này không phải PDF, DOCX hay ảnh PNG, JPG.» nút Bỏ; không cuộn ngang. Khớp, nhưng cột giá trị hẹp (~205px), meta xuống 2 dòng. 5 ttp-hoi-xoa-1280: hộp «Xoá tệp «Biên bản bàn giao.pdf»?» «Tệp mất hẳn, không hoàn tác được.» nút Huỷ / Xoá tệp; nền sau hộp đen hoàn toàn. Khớp. 6 ttp-khong-mo-375 (nhân viên): mỗi dòng chỉ có «Mở», không có Xoá, dòng «Chỉ quản trị mở được tệp.» đọc được; NHƯNG tên dài «…thức có phụ lục giá năm 2026.pdf» xuống nhiều dòng thay vì cắt một dòng (lệch đối chứng bằng mắt). 7 ttp-tat-1280: hai tên tệp còn hiện, «Mở» mờ khoá, vùng «Chọn tệp/Kéo tệp vào đây» mờ khoá, dòng «Kho tệp chưa bật trên máy chủ nên chưa tải tệp lên được.»; Xoá vẫn bật cho quản trị. Khớp. 8 ttp-loc-1280: danh sách Thoả thuận lọc «ttp», menu Lọc › «Hợp đồng (1)» có «Bỏ chọn», «Có tệp 1», «Chưa có tệp 2 ✓»; bảng chỉ còn Thoả thuận T3 và T2, cột «Hợp đồng» hiện «—». Khớp.
  network_observed: n-a (driver)
  output: |
    Script đo màn chạy trọn (tien-de.mjs rồi do-man.mjs): dòng cuối «ttp man: dat» và «phien-do: xong — mã 0». Các khẳng định DOM của script đều qua: có tệp hàng 2; 375 không cuộn ngang; hỏi xoá nêu tên; huỷ không xoá; xoá thật bớt một tệp; nhân viên «Mở» khoá kèm «Chỉ quản trị mở được tệp.»; quản trị «Mở» ra tab tới ttpgia.private.blob.vercel-storage.com có chữ ký; API không có TEP_BAN_GHI_BLOB_TOKEN thì vùng tải và «Mở» khoá kèm lý do; cột T1 «2 tệp», T2 và T3 «—»; menu lọc «Có tệp 1» / «Chưa có tệp 2»; URL mang field:<khoá>=none; bảng còn T2 T3; lưu trữ T1 ở chế độ chỉ đọc. Phiên đo tự dọn, không còn máy chủ nghe trên 4225/4606.
    Tám khung đã mở bằng Read, lưu ttp-*.png và chép sang E10-step1..8.png (1 rong-1280, 2 dang-tai-1280, 3 co-tep-1280, 4 loi-tep-375, 5 hoi-xoa-1280, 6 khong-mo-375, 7 tat-1280, 8 loc-1280).
    Đối chiếu bằng mắt, mục «tên tệp dài cắt một dòng không đè nút» TRÁI hợp đồng ở khung 6 (E10-step6, 375): tên «Hợp đồng hợp tác An Phú — bản ký chính thức có phụ lục giá năm 2026.pdf» xuống từ ba dòng thay vì cắt một dòng. ItemTitle trong packages/ui/src/components/item.tsx mang «line-clamp-1 … flex»; display:flex đè -webkit-box của line-clamp nên cắt dòng không có hiệu lực. Ở 1280 tên vừa một dòng nên không chứng được việc cắt. Ở 375 dòng meta cũng xuống hai dòng, cột giá trị chỉ khoảng 205px (cột nhãn khoảng 141px), dòng tệp chưa «gọn». Không đè nút. Vì vậy E10 bị chấm hỏng dù script thoát 0.
    Mạng: driver là script, không có bộ đọc mạng của trình duyệt, nên không ghi E10-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T04:22:31Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T04:22:31Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T04:22:31Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T04:22:31Z

- cmd: bunx turbo run lint --force
  run_id: minted-truong-tep-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T04:22:31Z

- cmd: bun run lint:slop
  run_id: minted-truong-tep-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T04:22:31Z

- cmd: bunx turbo run build --force
  run_id: minted-truong-tep-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T04:22:31Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh ở cả hai phía; nhưng baseline của mọi eval feature là n-a (eval mới, không có ở merge-base) nên chưa chứng được chiều đỏ trên code cũ.

Baseline khong do:
- bun run test -- "cd apps/api && bun test test/truong-tep.spec.ts -t ttp-tao-truong": bo qua baseline: tep apps/api/test/truong-tep.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-tep.dom.tsx -t ttp-cai-dat: bo qua baseline: tep apps/app/test/truong-tep.dom.tsx co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-tep.spec.ts -t ttp-tai-len": bo qua baseline: tep apps/api/test/truong-tep.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TTB_BLOB_THAT=1 bun test --timeout 120000 test/truong-tep-blob-that.spec.ts -t ttp-blob-that": bo qua baseline: tep apps/api/test/truong-tep-blob-that.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-tep.spec.ts -t ttp-tu-choi": bo qua baseline: tep apps/api/test/truong-tep.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-tep.spec.ts -t ttp-quyen": bo qua baseline: tep apps/api/test/truong-tep.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-tep.dom.tsx -t ttp-o-tep: bo qua baseline: tep apps/app/test/truong-tep.dom.tsx co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-tep.spec.ts -t ttp-loc": bo qua baseline: tep apps/api/test/truong-tep.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-tep.dom.tsx -t ttp-man-loc: bo qua baseline: tep apps/app/test/truong-tep.dom.tsx co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-tep.spec.ts -t ttp-xoa": bo qua baseline: tep apps/api/test/truong-tep.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-tep.spec.ts -t ttp-vong-doi": bo qua baseline: tep apps/api/test/truong-tep.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/blob-tep-truong.spec.ts -t ttp-khoa && cd ../../apps/api && bun test test/truong-tep.spec.ts -t ttp-tat": bo qua baseline: tep packages/db/test/blob-tep-truong.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/blob-nguon.spec.ts && cd ../../apps/api && bun test test/tai-lieu-nguon.spec.ts test/tai-lieu-nguon-tat.spec.ts test/phieu-nguon.spec.ts" && bun _acceptance/truong-tep/rang/bai-cu-nguyen.mjs: bo qua baseline: tep _acceptance/truong-tep/rang/bai-cu-nguyen.mjs co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-tep.spec.ts -t ttp-ghi-chu && cd ../agent && CRM_TELEMETRY_DISABLED=1 bun test test/truong-tep.integration.spec.ts -t ttp-kara": bo qua baseline: tep apps/api/test/truong-tep.spec.ts co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/truong-tep/rang/quet-kieu.mjs: bo qua baseline: tep _acceptance/truong-tep/rang/quet-kieu.mjs co o cay dang kiem nhung chua co o merge-base e7a8c030710899f97a6be0a3f68719b39c08ed95 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval ngẫu nhiên)

## Iterations

Round 1: E10 failed — tên tệp dài ở 375 xuống nhiều dòng thay vì cắt một dòng vì ItemTitle (packages/ui/src/components/item.tsx) có «line-clamp-1» cùng «flex», display:flex đè lên line-clamp; dòng meta cũng xuống hai dòng và cột giá trị hẹp (khoảng 205px). Returned to implementation.

