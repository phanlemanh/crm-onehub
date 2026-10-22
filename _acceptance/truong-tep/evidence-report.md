---
schema_version: 2
feature_slug: truong-tep
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a31dd592b66086559e1ccac7a363b99493e79b4e
human_signoff: manh 2026-10-22 — ký lần ba Cổng 2 trên ghim lại repin-20261022T090048Z-29284 (verified_commit 331df95a2 sau gộp onehub eaa31c55d, 7 suite và 15/15 eval máy xanh; E10 giữ từ S4 vòng 3 wf_406402c0-67c, chạy tay lại trên 331df95a2 ra «ttp man: dat»). Diff từ chữ ký lần hai là mã DA16 gộp vào cộng ba chỗ nối form tạo với trường Tệp. Ngoài-1, 8, 9, 12, 13, 14, 16, 18, 20 ghi Known limits; Ngoài-3, 10, 11 mở hợp đồng mới; Ngoài-2, 4, 5, 6, 7, 15, 17, 19 chấp nhận, không sửa; t9 giữ cách hiểu «byte thắng tên»; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
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

Vòng 3 (cây d6269cc25): cả 16 eval đạt và cả 7 lệnh suite hồi quy đạt, kể cả `bunx turbo run lint --force` đã hỏng ở vòng 2. Không có eval ngẫu nhiên, không có mục chờ người chấm.

## Evidence

- eval: E1
  run_id: minted-truong-tep-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tao_truong
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bn4ocbve_test

- eval: E1b
  run_id: minted-truong-tep-E1b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_cai_dat
  verified_at: 2026-10-22T05:46:10Z
  output: |
    Ran 1 test across 1 file. [1158.00ms]

- eval: E2
  run_id: minted-truong-tep-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tai_len
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bmp9jgfo_test

- eval: E2b
  run_id: minted-truong-tep-E2b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_blob_that
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bn3l30kc_test

- eval: E3
  run_id: minted-truong-tep-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_tu_choi
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bnd0axge_test

- eval: E4
  run_id: minted-truong-tep-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_quyen
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bmwb64y9_test

- eval: E4b
  run_id: minted-truong-tep-E4b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_o_tep
  verified_at: 2026-10-22T05:46:10Z
  output: |
    Ran 2 tests across 1 file. [1154.00ms]

- eval: E5
  run_id: minted-truong-tep-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_loc
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bnbh8bn0_test

- eval: E5b
  run_id: minted-truong-tep-E5b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_man_loc
  verified_at: 2026-10-22T05:46:10Z
  output: |
    Ran 1 test across 1 file. [1268.00ms]

- eval: E6
  run_id: minted-truong-tep-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_xoa
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bmvrexfq_test

- eval: E7
  run_id: minted-truong-tep-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_vong_doi
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bng6680e_test

- eval: E8
  run_id: minted-truong-tep-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_khoa
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bnttabiv_test

- eval: E8b
  run_id: minted-truong-tep-E8b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_kho_tai_lieu
  verified_at: 2026-10-22T05:46:10Z
  output: |
    ttp kho tai lieu: dat

- eval: E9
  run_id: minted-truong-tep-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttp_ghi_chu
  verified_at: 2026-10-22T05:46:10Z
  output: |
    test-run: dropped crm_mvj4bnpba00e_test

- eval: E9b
  run_id: minted-truong-tep-E9b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttp_quet
  verified_at: 2026-10-22T05:46:10Z
  output: |
    ttp quet: dat

- eval: E10
  run_id: minted-truong-tep-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttp_man
  verified_at: 2026-10-22T05:46:10Z
  screenshot: evidence/E10-step1.png
  observed: |
    Frame 1 (ttp-rong-1280): phieu 'Thoa thuan T1 ttp', muc CHI TIET co o «Hợp đồng» voi «Chưa có tệp.» va vung net dut «Kéo tệp vào đây» + nut «Chọn tệp», phu «PDF, DOCX, PNG, JPG · tối đa 20 MB · 10 tệp». Khop Expected 0.
    Frame 2 (ttp-dang-tai-1280): dong 1 «Hợp đồng hợp tác An Phú — bản ký chính thức có phụ lục giá năm 2026.pdf» 24KB · 22 thg 10, 2026 · bởi manh.phan co Mở/Xoá; dong 2 «Phụ lục 01.pdf» ghi «Đang tải lên…» kem spinner. Ten dai nam tren mot dong, khong de nut. Khop Expected 1.
    Frame 3 (ttp-co-tep-1280): hai dong tep day du ten, cỡ 24KB, ngay 22 thg 10, 2026, «bởi manh.phan», nut «Mở» va «Xoá» moi dong. Khop Expected 2.
    Frame 4 (ttp-loi-tep-375): man 375, cuon trong sheet; hien «Phụ lục 01.pdf» va «Biên bản bàn giao.pdf» da tai xong (Mở/Xoá), «Bảng giá.xlsx» bao loi «Tệp này không phải PDF, DOCX hay ảnh PNG, JPG.» kem nut «Bỏ». Dong tep xuong gon: ten, dong meta tu xuong dong, roi hang nut; khong cuon ngang (do-man.mjs kiem scrollWidth). Khop Expected 3.
    Frame 5 (ttp-hoi-xoa-1280): hop thoai «Xoá tệp «Biên bản bàn giao.pdf»?» / «Tệp mất hẳn, không hoàn tác.» voi nut «Huỷ» (focus) va «Xoá tệp» do — neu dung ten tep. Khop Expected 4 (huy/xoa thuc do script kiem).
    Frame 6 (ttp-khong-mo-375): phien nhan vien o 375: hai dong tep, ten dai cat '...' mot dong khong de nut, chi co «Mở» (khong co Xoá), dong «Chỉ quản trị mở được tệp.» ben duoi, vung tai ben duoi. Khop Expected 5 (quan tri bam Mở ra tab URL may chu gia: log xac nhan).
    Frame 7 (ttp-tat-1280): ten hai tep van hien; «Mở» va «Chọn tệp» bi lam mo/khoa; dong «Kho tệp chưa bật trên máy chủ nên chưa tải tệp lên được.» doc duoc. Khop Expected 6.
    Frame 8 (ttp-loc-1280): danh sach Thoả thuận, cot «Hợp đồng» (T3, T2 deu «—»), menu Lọc › «Hợp đồng (1)» co «Có tệp 1» va «Chưa có tệp 2» (da tick), bang chi con T3 va T2, tong «1–2 trong số 2»; chua thay dong T1 (da loc), «n tệp» cua T1 do script kiem. Khop Expected 7.
    Doi chung bang mat: ten tep dai cat mot dong khong de nut (frame 2,3,6); dong 375 gon; ten tep nguoi dat khong bi dich do trinh duyet trong anh; ly do khoa doc duoc (frame 6,7). Khong mau thuan Expected.
  network_observed: n-a (driver)
  output: |
    Network: tien-de.mjs/do-man.mjs khong xuat network log, khong co browser tool doc network; E10-network.txt ghi 'n-a (driver)'.
    Gioi han ghi nhan: anh ttp-loc chi hien T2, T3 sau loc nen khong thay chu 'n tep' cua T1 trong anh; dieu nay do-man.mjs kiem bang DOM. Trang thai khoa cua 'Mo' o anh 375 cua nhan vien chi thay qua dong ly do, khong phan biet duoc bang mau pixel. Phien do tu dung va tu don (khong server nao con chay do toi start).

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-22T05:46:10Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-22T05:46:10Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-22T05:46:10Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-truong-tep-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-22T05:46:10Z

- cmd: bunx turbo run lint --force
  run_id: minted-truong-tep-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-22T05:46:10Z

- cmd: bun run lint:slop
  run_id: minted-truong-tep-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-22T05:46:10Z

- cmd: bunx turbo run build --force
  run_id: minted-truong-tep-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-22T05:46:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round 1 — baseline không đo lại round này.

Non-discriminating (xanh ở cả HEAD lẫn baseline): none.

Baseline khong do:
- Cả 16 eval feature mang baseline n-a. Round 1 đã bỏ qua baseline vì các tệp bài kiểm (apps/api/test/truong-tep.spec.ts, apps/app/test/truong-tep.dom.tsx, packages/db/test/blob-tep-truong.spec.ts, các rang trong _acceptance/truong-tep/rang) có ở cây đang kiểm nhưng chưa có ở merge-base — eval mới, chạy trên code cũ không phân biệt gì. Round 3 không đo lại vì evals.yaml không đổi từ lần baseline cuối.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval ngẫu nhiên)

## Iterations

Round 1: E10 failed — tên tệp dài ở 375 xuống nhiều dòng thay vì cắt một dòng vì ItemTitle (packages/ui/src/components/item.tsx) có «line-clamp-1» cùng «flex», display:flex đè lên line-clamp; dòng meta cũng xuống hai dòng và cột giá trị hẹp (khoảng 205px). Returned to implementation.
Round 2: 16 eval đạt kể cả E10 (tên dài cắt một dòng ở 375 sau commit bdafae523); REJECT vì lệnh suite `bunx turbo run lint --force` hỏng ở `@crm/ui#lint`, không gắn eval nào. Returned to implementation.
Round 3: 16 eval đạt và cả 7 lệnh suite đạt trên cây d6269cc25 (sau commit định dạng bài nguon-keo-tha theo biome); lệnh lint đã xanh. Verdict PASS.


### Re-pin lần 1 — 2026-10-22, do chu ky Cong 2 dung truoc commit sua don du lieu trong test (F-128)
run_id: repin-20261022T081919Z-20140
sha: 1b2696ef57712e9f25704b066787a4a68bb1a324 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E10 · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-22, do gop onehub eaa31c55d (DA16 form tao) sau chu ky
run_id: repin-20261022T090048Z-29284
sha: 331df95a2df726b09a2c1ff3821a2c16e971f6a3 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E10 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-22, do gop onehub 05e3f7743 (#541) cung ban sua CI
run_id: repin-20261022T111247Z-76139
sha: a31dd592b66086559e1ccac7a363b99493e79b4e · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E10 · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
