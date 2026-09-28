---
schema_version: 2
feature_slug: tro-ly-okr-de-xuat
verdict: REJECT
failed_evals: ["E22","E4"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 046d2ac2114550d1bd5786e07d9a1812586e7aac
human_signoff:
---

# Evidence Report: tro-ly-okr-de-xuat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | ui-check | FAIL |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-8 | test | PASS |
| E13 | AC-8 | test | PASS |
| E14 | AC-9 | test | PASS |
| E15 | AC-9 | test | PASS |
| E16 | AC-9 | test | PASS |
| E17 | AC-10 | test | PASS |
| E18 | AC-11 | test | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-13 | test | PASS |
| E21 | AC-13 | test | PASS |
| E22 | AC-14 | script | FAIL |
| E23 | AC-14 | test | PASS |
| E24 | AC-14 | script | PASS |
| E25 | AC-14 | judgment | UNCERTAIN |
| E26 | AC-4 | test | PASS |
| E27 | AC-15 | script | PASS |
| E28 | AC-15 | judgment | UNCERTAIN |
| E29 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-okr-de-xuat-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_quyen_nut
  verified_at: 2026-09-28T22:13:48Z
  output: |
    test-run: dropped crm_mult2d72lhjt_test

- eval: E2
  run_id: minted-tro-ly-okr-de-xuat-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_man_nut
  verified_at: 2026-09-28T22:13:48Z
  output: |
    bài DOM nút «Nhờ Trợ lý OKR góp ý» chạy xong, không lỗi

- eval: E3
  run_id: minted-tro-ly-okr-de-xuat-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_man_trang_thai
  verified_at: 2026-09-28T22:13:48Z
  output: |
    Ran 29 tests across 1 file. [3.92s]

- eval: E4
  run_id: minted-tro-ly-okr-de-xuat-E4-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.tdx_man_that
  verified_at: 2026-09-28T22:13:48Z
  screenshot: evidence/E4-step1.png
  observed: |
    Đã mở từng ảnh trong 8 ảnh đã lưu (E4-step1 đến E4-step8): trang Cài đặt Chương trình OKR với khối «Trợ lý OKR» (công tắc bật, dòng «Chưa sẵn sàng — Đang kiểm tra…»), hộp Sửa mục tiêu có nút «Nhờ Trợ lý OKR góp ý» (mờ đi kèm «Lưu thay đổi trước khi nhờ góp ý» khi tên đã sửa), hộp Sửa KR có dòng xu hướng «+0,47/tuần, cuối kỳ ước khoảng 6,61». Không thấy tràn ngang ở 1440 và 390.
    Không có ảnh cho các bước sau (dang-soan, co-dong, sua-dong, da-quyet, Hoàn tác, Vết, sodo-co-so, sodo-ngan): script dừng ở bước góp ý. 8 khung khớp Expected nhưng phần lõi (góp ý, Nhận, Hoàn tác, Vết, sổ đồ ẩn) chưa chạy.
  network_observed: n-a (driver)
  output: |
    Lệnh tien-de.mjs --chay man-gop-y.mjs chạy hai lượt, cả hai kết thúc mã 2 (không đo được).
    Lượt 1: tác tử thoát sớm vì một tiến trình eve eval của phiên khác đang giữ cổng dev server; chờ nó xong rồi chạy lại.
    Lượt 2: cảnh cây qua, phiên đo riêng dựng được, bộ mẫu nạp 37 mục tiêu và 81 KR; 23 bước DUNG, 0 SAI.
    Bước góp ý dừng: okr.createKr trả 404 «No procedure found on path okr.createKr». Script gọi okr.createKr ở man-gop-y.mjs:488, router chỉ có createKeyResult (apps/api/src/okr/okr.router.ts:483). Lỗi nằm ở script eval, không phải môi trường.
    Bước 5–10 chưa chạy tới; chiều đỏ «nhan khong doi gi» chưa chạm. Frames: evidence/E4-step1.png … E4-step8.png; log lượt 2: evidence/E4-run.log.

- eval: E5
  run_id: minted-tro-ly-okr-de-xuat-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_dung_lai_tran
  verified_at: 2026-09-28T22:13:48Z
  output: |
    bài API dùng lại · trần ngày · trần tháng chạy xong, không lỗi

- eval: E6
  run_id: minted-tro-ly-okr-de-xuat-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_bo_kiem
  verified_at: 2026-09-28T22:13:48Z
  output: |
    Ran 11 tests across 1 file. [41.00ms]

- eval: E7
  run_id: minted-tro-ly-okr-de-xuat-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_nop_ghi
  verified_at: 2026-09-28T22:13:48Z
  output: |
    test-run: dropped crm_mult2bf9i02d_test

- eval: E8
  run_id: minted-tro-ly-okr-de-xuat-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_khong_moi_lai
  verified_at: 2026-09-28T22:13:48Z
  output: |
    bài không-mời-lại chạy xong, không lỗi

- eval: E9
  run_id: minted-tro-ly-okr-de-xuat-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_quyet
  verified_at: 2026-09-28T22:13:48Z
  output: |
    test-run: dropped crm_mult2atoe3ll_test

- eval: E10
  run_id: minted-tro-ly-okr-de-xuat-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_man_vet
  verified_at: 2026-09-28T22:13:48Z
  output: |
    Ran 6 tests across 1 file. [594.00ms]

- eval: E11
  run_id: minted-tro-ly-okr-de-xuat-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tdx_tach_tx
  verified_at: 2026-09-28T22:13:48Z
  output: |
    test-run: dropped crm_mult2f7fpben_test

- eval: E12
  run_id: minted-tro-ly-okr-de-xuat-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_xu_huong
  verified_at: 2026-09-28T22:13:48Z
  output: |
    Ran 21 tests across 1 file. [8.00ms]

- eval: E13
  run_id: minted-tro-ly-okr-de-xuat-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_xu_huong_api
  verified_at: 2026-09-28T22:13:48Z
  output: |
    test-run: dropped crm_mult2n0l11z5_test

- eval: E14
  run_id: minted-tro-ly-okr-de-xuat-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_nac
  verified_at: 2026-09-28T22:13:48Z
  output: |
    Ran 5 tests across 1 file. [24.00ms]

- eval: E15
  run_id: minted-tro-ly-okr-de-xuat-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_nac_luu
  verified_at: 2026-09-28T22:13:48Z
  output: |
    test-run: dropped crm_mult2plrnjhp_test

- eval: E16
  run_id: minted-tro-ly-okr-de-xuat-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_man_cai_dat
  verified_at: 2026-09-28T22:13:48Z
  output: |
    Ran 8 tests across 1 file. [1328.00ms]

- eval: E17
  run_id: minted-tro-ly-okr-de-xuat-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_che_do_an
  verified_at: 2026-09-28T22:13:48Z
  output: |
    test-run: dropped crm_mult2s9inrrs_test

- eval: E18
  run_id: minted-tro-ly-okr-de-xuat-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_giu_viec
  verified_at: 2026-09-28T22:13:48Z
  output: |
    2 expect() calls
    Ran 2 tests across 1 file. [522.00ms]
    test-run: dropped crm_mult2xdq3l9d_test

- eval: E19
  run_id: minted-tro-ly-okr-de-xuat-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_kiem_khoa
  verified_at: 2026-09-28T22:13:48Z
  output: |
    bài kiểm khoá hết hạn chạy xong, không lỗi

- eval: E20
  run_id: minted-tro-ly-okr-de-xuat-E20-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_so_do
  verified_at: 2026-09-28T22:13:48Z
  output: |
    bài sổ đồ API so từng số với các câu SQL rang/ chạy xong, không lỗi

- eval: E21
  run_id: minted-tro-ly-okr-de-xuat-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_man_so_do
  verified_at: 2026-09-28T22:13:48Z
  output: |
    Ran 8 tests across 1 file. [794.00ms]

- eval: E22
  run_id: minted-tro-ly-okr-de-xuat-E22-r1
  exit_code: 3
  baseline: red
  verifier: config:executors.script.tdx_eval_gop_y
  verified_at: 2026-09-28T22:13:48Z
  output: |
    kho tdx-e22 · okr:mau --moc 2026-09-29: 40 nguoi mau, 10 phong ban, 37 muc tieu
    so-moi-lot: 0 dong
    SAI gy-02: van de kr-la-viec: khong dong nao dung truong hay dung maVanDe (tương tự gy-03, gy-08, gy-14, gy-15)
    SAI gy-23, gy-24, gy-26, gy-27, gy-28, gy-30: ng tu-cam (có dòng chứa từ cấm)
    DOI CHUNG doi-chung-goi-50-cuoc: khong loi nao
    chi: 0.438988 USD / tran 2 USD
    hieu chinh: 4 cap → _acceptance/tro-ly-okr-de-xuat/evidence/hieu-chinh-judge.md
    ma: 19/30 · judge: 0.00 (4 cap, nguong 0.7)
    ca doi chung khong bat duoc

- eval: E23
  run_id: minted-tro-ly-okr-de-xuat-E23-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_judge_zdr
  verified_at: 2026-09-28T22:13:48Z
  output: |
    Ran 2 tests across 1 file. [147.00ms]

- eval: E24
  run_id: minted-tro-ly-okr-de-xuat-E24-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdx_do_tre
  verified_at: 2026-09-28T22:13:48Z
  output: |
    phien-do: xong

- eval: E26
  run_id: mult3791wrwp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_duong_do
  verified_at: 2026-09-28T22:13:48Z
  output: |
    test-run: dropped crm_mult3791wrwp_test

- eval: E27
  run_id: minted-tro-ly-okr-de-xuat-E27-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdx_tai_lieu
  verified_at: 2026-09-28T22:13:48Z
  output: |
    tai-lieu: CONTEXT.md, docs/api.md (7 thu tuc), docs/agent.md deu du.

- eval: E29
  run_id: design-gate-89880f7588
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdx_san_thiet_ke
  verified_at: 2026-09-28T22:13:48Z
  output: |
    design-gate.mjs --mode static chạy lần lượt trên sáu tệp màn (cot-gop-y, hop-thoai-muc-tieu, hop-thoai-kr, the-tro-ly-okr, the-gop-y-so-do, suggestion), không tệp nào dừng vòng lặp

### Judgment

- eval: E25
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — đề xuất
  proposal: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Tệp Input duy nhất được phép (_acceptance/tro-ly-okr-de-xuat/evidence/hieu-chinh-judge.md) không tồn tại lúc chấm, nên không có 20 cặp, không có chấm của chủ kho và không có điểm judge để tính tỷ lệ khớp ≥85% hay điểm bộ Viết lại ≥0,7. Không đủ căn cứ để PASS hay FAIL.
    - operational-feasibility: UNCERTAIN — Cùng lý do: thiếu tệp hiệu chỉnh nên không tính được tỷ lệ khớp ≥85% và điểm ≥0,7; luật cấm tìm tệp khác để tự cứu.
    - spec-alignment: UNCERTAIN — Cùng lý do: không có 20 cặp, không có chấm Đạt/Không đạt của chủ kho, không có điểm judge.
  rationale: Ba lăng kính cùng thấy tệp hiệu chỉnh chưa có chấm của người. Ghi chú của máy: lệnh E22 sau đó có ghi tệp hieu-chinh-judge.md với 4 cặp (chưa đủ 20 cặp, chưa có chấm của chủ kho).
  required_evidence:
    - Tệp /Users/manh-macmini/dev/crm/_acceptance/tro-ly-okr-de-xuat/evidence/hieu-chinh-judge.md chứa 20 cặp (Mục tiêu hay KR gốc → dòng Trợ lý OKR đề xuất) do E22 in ra, kèm cột chấm Đạt/Không đạt của chủ kho theo ba ý (nói kết quả không nói việc làm; giữ ý người viết; đúng ngôn ngữ chiếm đa số) và cột điểm judge từng cặp; tạo bằng lệnh của E22 rồi chủ kho điền chấm.
    - Trong cùng tệp: dòng tổng kết tỷ lệ khớp chủ kho–judge (cần ≥ 17/20 = 85%) và điểm bộ Viết lại (cần ≥ 0,7), tính lại được từ 20 hàng.
  human_override:  # chi nguoi ghi

- eval: E28
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — đề xuất
  proposal: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Nửa tài liệu đạt: CONTEXT.md «Chế độ ẩn» nói rõ người dùng không thấy gì, tiền thật tính vào trần tháng, chỉ quản trị đọc; docs/api.md (dòng 777-798) nêu 9 USD mặc định, troLyAn và troLySoDo chỉ quản trị; docs/agent.md liệt kê tệp của hãng bị chạm. Nửa còn lại (diff giữ luật kho: không chú thích trong mã, hằng ở một tệp cấu hình mỗi khu, parse ở biên trong packages/validation, trí khôn ở apps/agent, packages/ui không bị đè class) không có căn cứ trong năm tệp được phép đọc.
    - operational-feasibility: UNCERTAIN — Phần tài liệu đạt; danh sách Input không có diff nên chỉ có thiết kế và bảng tệp là ý định chứ không phải bằng chứng. CONTEXT.md không nhắc số 9 USD, api.md và agent.md dày tên hàm nên người không đọc mã chỉ hiểu trọn ý qua CONTEXT.md.
    - spec-alignment: UNCERTAIN — Phần đọc tài liệu đạt; không kiểm được nửa sau (không chú thích trong mã, hằng tinh chỉnh ở một tệp cấu hình mỗi khu, parse ở biên, thành phần mới không đè class) vì không có diff.
  rationale: Ba lăng kính cùng đạt phần tài liệu và cùng thiếu bằng chứng về luật kho vì không có diff trong danh sách Input.
  required_evidence:
    - Đầu ra rỗng của quét chú thích thêm vào mã trong diff của lượt so với merge-base (lọc dòng thêm mới chứa // hoặc /* trong apps và packages, bỏ tệp sinh và *.md), hoặc bun run lint:slop trên đúng diff; đưa cho judge làm Input.
    - Diff apps/api/src/okr/tro-ly.service.ts và apps/api/src/agent/agent-trigger.service.ts cho thấy API chỉ ghi AgentTask, đọc sổ và ghi OKR qua OkrService, không có lời gọi model, vendor client hay chấm điểm trong Nest.
    - Nội dung TRO_LY_OKR_TRAN (packages/db/src/okr-tro-ly-danh-muc.ts) cùng kết quả grep hằng số thuật (nhịp 30 phút, 40 lượt ẩn, 20 lượt/ngày, 30 giây) không thấy nằm rải ngoài tệp cấu hình đó.
    - Diff packages/validation/src/okr-kiem-de-xuat.ts và các chỗ đọc cột Json của OkrDeXuat cho thấy parse bằng Zod ở biên, không có Record<string, unknown> hay ép kiểu unknown ở tệp tiêu thụ.
    - Diff apps/app (the-tro-ly-okr.tsx, the-gop-y-so-do.tsx, cột góp ý) cho thấy không có className đổi màu, góc, khoảng cách trên component @crm/ui, và không có table hay ul divide-y vẽ tay.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T22:13:48Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T22:13:48Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T22:13:48Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T22:13:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

E11 (bun run test -- "cd apps/api && bun test test/okr*.spec.ts test/tro-ly-okr-hoan-tac.spec.ts") xanh trên cả nhánh lẫn baseline diffBase (baseline: green): nó chứng minh các bài OKR sẵn có không bị hồi quy, chưa chứng minh ca mới. Cần viết lại để assert riêng ca Hoàn tác trong 7 ngày và ca ngày thứ 8, hoặc xác nhận đây là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E22, E4 failed. E22 (rang/eval-gop-y.mjs, lệnh thoát mã 3): 19/30 ca đạt, còn ca sai ở các van de kr-la-viec, thieu-doi-trong, muc-tieu-la-so và các ca tu-cam; judge 0.00 trên 4 cặp (ngưỡng 0,7); ca đối chứng «gọi 50 cuộc» không bắt được; chi 0,44 USD trên trần 2 USD. E4 (ui-check, lệnh thoát mã 2): script man-gop-y.mjs gọi okr.createKr ở dòng 488 trong khi router chỉ có createKeyResult, nên 8 khung đầu khớp nhưng bước góp ý, Nhận, Hoàn tác, Vết và sổ đồ ẩn chưa chạy. Cả hai lệnh fail đều gắn eval. Returned to implementation.
