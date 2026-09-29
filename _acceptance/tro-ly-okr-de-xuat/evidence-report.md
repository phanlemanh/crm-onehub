---
schema_version: 2
feature_slug: tro-ly-okr-de-xuat
verdict: REJECT
failed_evals: [E24]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 94a597e067a0c0235f3d7e9f27c38e0bc85a2293
human_signoff:
---

# Evidence Report: tro-ly-okr-de-xuat

Round 3. Bảng dưới thay toàn bộ nội dung round cũ; lịch sử round nằm ở mục Iterations. Bảy eval chạy lại ở round này (E6, E7, E8, E17, E22, E24, E26); hai mươi eval mang sang từ round trước vì delta không chạm paths của chúng; E25 và E28 là judgment chờ người.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | ui-check | PASS |
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
| E22 | AC-14 | script | PASS |
| E23 | AC-14 | test | PASS |
| E24 | AC-14 | script | FAIL |
| E25 | AC-14 | judgment | PENDING (panel đề xuất FAIL, chờ chủ kho) |
| E26 | AC-4 | test | PASS |
| E27 | AC-15 | script | PASS |
| E28 | AC-15 | judgment | UNCERTAIN |
| E29 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-okr-de-xuat-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_quyen_nut
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-tro-ly-okr-de-xuat-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_man_nut
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-tro-ly-okr-de-xuat-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_man_trang_thai
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: E4-2026-09-29T07:01+07-run2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdx_man_that
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval (frame goc xem round 2 trong Iterations)

- eval: E5
  run_id: minted-tro-ly-okr-de-xuat-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_dung_lai_tran
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-tro-ly-okr-de-xuat-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_bo_kiem
  verified_at: 2026-09-29T00:33:44Z
  output: |
    cd packages/validation && bun test test/okr-kiem-de-xuat.spec.ts
    bài chạy xong, mã thoát 0

- eval: E7
  run_id: minted-tro-ly-okr-de-xuat-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_nop_ghi
  verified_at: 2026-09-29T00:33:44Z
  output: |
    bun test test/tro-ly-okr-nop.integration.spec.ts -t nop-ghi
    test-run: dropped crm_muly1inmwki5_test

- eval: E8
  run_id: minted-tro-ly-okr-de-xuat-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_khong_moi_lai
  verified_at: 2026-09-29T00:33:44Z
  output: |
    bun test test/tro-ly-okr-nop.integration.spec.ts -t khong-moi-lai
    test-run: dropped crm_muly1gfskwwe_test

- eval: E9
  run_id: minted-tro-ly-okr-de-xuat-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_quyet
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-tro-ly-okr-de-xuat-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_man_vet
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-tro-ly-okr-de-xuat-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_tach_tx
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-tro-ly-okr-de-xuat-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_xu_huong
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-tro-ly-okr-de-xuat-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_xu_huong_api
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-tro-ly-okr-de-xuat-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_nac
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-tro-ly-okr-de-xuat-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_nac_luu
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E16
  run_id: minted-tro-ly-okr-de-xuat-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_man_cai_dat
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E17
  run_id: minted-tro-ly-okr-de-xuat-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_che_do_an
  verified_at: 2026-09-29T00:33:44Z
  output: |
    bun test test/tro-ly-okr-che-do-an.spec.ts
    test-run: dropped crm_muly1gul18mz_test

- eval: E18
  run_id: minted-tro-ly-okr-de-xuat-E18-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_giu_viec
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E19
  run_id: minted-tro-ly-okr-de-xuat-E19-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_kiem_khoa
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E20
  run_id: minted-tro-ly-okr-de-xuat-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_so_do
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E21
  run_id: minted-tro-ly-okr-de-xuat-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_man_so_do
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E22
  run_id: minted-tro-ly-okr-de-xuat-E22-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdx_eval_gop_y
  verified_at: 2026-09-29T00:33:44Z
  output: |
    bun _acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs
    ma: 30/30 · judge: 0.85 (20 cap, nguong 0.7)

- eval: E23
  run_id: minted-tro-ly-okr-de-xuat-E23-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_judge_zdr
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E24
  run_id: minted-tro-ly-okr-de-xuat-E24-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tdx_do_tre
  verified_at: 2026-09-29T00:33:44Z
  output: |
    bun _acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs --lan 20
    do-tre.sql okr.thang=2026-09: nac bat, 20 luot do, p50 11323 ms, p90 22456 ms; nac an, 0 luot
    20 so (ms): 10395, 14944, 8601, 22005, 12356, 6834, 12510, 5393, 6604, 9898, 23095, 7419, 9249, 5640, 16905, 29098, 19956, 12250, 22385, 6678
    p50 11323 ms (nguong 8000) · p90 22456 ms (nguong 15000) · 0 luot hong tinh 30000
    SAI do-tre.sql p50 11323 > 8000
    SAI do-tre.sql p90 22456 > 15000
    KHONG DAT
    phien-do: xong

- eval: E26
  run_id: minted-tro-ly-okr-de-xuat-E26-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_duong_do
  verified_at: 2026-09-29T00:33:44Z
  output: |
    bun test test/tro-ly-okr-duong-do.integration.spec.ts
    test-run: dropped crm_muly1h78tzr8_test

- eval: E27
  run_id: minted-tro-ly-okr-de-xuat-E27-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdx_tai_lieu
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E29
  run_id: design-gate-03e847672e
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdx_san_thiet_ke
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-29T00:33:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-29T00:33:44Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-29T00:33:44Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-29T00:33:44Z

### Judgment (đề xuất của hội đồng, chờ người chốt)

Hội đồng chỉ đề xuất; người chốt ở Cổng Bằng chứng qua human_override. Không eval judgment nào dưới đây đã có người xác nhận.

- eval: E25
  judged_by: judge panel (fresh context, ba lăng kính)
  panel_proposal: FAIL
  votes:
    - domain-correctness: FAIL — điểm judge trung bình bộ Viết lại 0,57 (4/7 cặp Đạt), dưới ngưỡng 0,7; cột chấm của chủ kho trống nên chưa tính được tỷ lệ khớp; file chỉ có 7 cặp thay vì 20. Judge có vẻ chấm rộng: ba cặp bịa ý, bỏ «MRR» hoặc bỏ con số 8% vẫn được 1,00, nên khớp 85% khó đạt.
    - operational-feasibility: FAIL — tệp hiệu chỉnh chỉ có 7 trên 20 cặp cần chấm (tệp ghi «thiếu 13 cặp»), cột chủ kho trống hết; điểm 0,57 dưới ngưỡng 0,7; chủ kho chưa có đủ 20 cặp để chấm.
    - spec-alignment: FAIL — 7 cặp có điểm 1, 0, 1, 1, 0, 0, 1 nên trung bình khoảng 0,57; cột chủ kho trống nên không tính được tỷ lệ khớp; chỉ 7 trên 20 cặp cần đọc.
  rationale: |
    Lưu ý người chốt: các con số của hội đồng (7 cặp, 0,57) khớp một bản cũ của evidence/hieu-chinh-judge.md. Bản hiện có trên đĩa ghi 20 cặp viết lại, điểm judge trung bình 0.85 (cùng số với dòng đầu ra E22 round này), nhưng cột «Chủ kho (Đạt/Không đạt)» vẫn trống ở cả 20 hàng. Vế «khớp ≥ 85%» của E25 vì vậy vẫn chưa tính được cho tới khi chủ kho điền. Nên xem vế điểm 0,7 là đã đạt trên bản mới và vế khớp là chưa có dữ liệu, thay vì tin số 0,57.
  required_evidence:
    - Chủ kho điền «Đạt»/«Không đạt» vào cột cuối cho đủ 20 cặp trong _acceptance/tro-ly-okr-de-xuat/evidence/hieu-chinh-judge.md, để tính tỷ lệ khớp với cột Judge (Judge Đạt khi điểm bằng 1) và kiểm tra ≥ 85%.
    - Xác nhận bản hieu-chinh-judge.md sinh bởi lần chạy E22 của round này (điểm trung bình 0.85, 20 cặp) là bản hội đồng được chấm lại; nếu hội đồng chấm trên bản cũ 7 cặp thì chấm lại trên bản mới.
  human_override:  # chi nguoi ghi

- eval: E28
  judged_by: judge panel (fresh context, ba lăng kính)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — CONTEXT.md nói rõ người dùng không thấy gì, tiền thật tính vào trần tháng, chỉ quản trị đọc; con số 9 USD chỉ có ở docs/api.md. Luật kho phần lớn đạt theo luat-kho.md nhưng còn ba điểm chưa kết luận: một câu trong api.md nghe như đề xuất ẩn quyết được, tên hằng viSao khai ở hai tệp cấu hình, bảy literal số còn ghi «đọc tay».
    - operational-feasibility: UNCERTAIN — phần tài liệu đạt; luat-kho.md (do script của người code sinh) còn 13 literal số «đọc tay» chưa kết luận, viSao khai hai nơi, và API ghi thẳng OkrDeXuat (tro-ly.service.ts:504) trong khi câu hỏi mô tả API chỉ ghi AgentTask và ghi OKR qua OkrService; thiết kế §4 cho phép trong giao dịch nhận nhưng luat-kho không nêu là ngoại lệ.
    - spec-alignment: UNCERTAIN — mục «Chế độ ẩn» trong CONTEXT.md, docs/api.md, docs/agent.md đạt; luat-kho.md cho 0 chú thích, 0 lời gọi model trong API, 6 className chỉ đổi hình dạng. Hằng tinh chỉnh: 11 hằng đặt tên tại tệp và 2 số rời ở okr-kiem-de-xuat.ts:95 và :101 chỉ ghi «đọc tay» không kết luận; viSao khai hai nơi. Không đọc diff nên không kiểm được các mục còn lại.
  rationale: |
    Cả ba lăng kính cùng UNCERTAIN, không có ý kiến trái chiều. Điểm chung: tài liệu đạt, luật kho thiếu kết luận cho các hằng «đọc tay», tên viSao ở hai nơi, và ranh giới ghi OkrDeXuat của API.
  required_evidence:
    - Sửa hoặc giải thích câu trong docs/api.md, đoạn «Chế độ ẩn kích từ chính lần lưu» («quyết một đề xuất đến từ chế độ ẩn để lại đúng hình dạng vết đó», docs/api.md dòng 794-796), hoặc đoạn mã và bài kiểm troLyQuyet cho thấy dòng ẩn bị từ chối vì nấc không phải bat.
    - Phán quyết cho viSao (500) khai ở packages/db/src/okr-tro-ly-danh-muc.ts (chu.viSao) và apps/api/src/okr/okr-config.ts (ten.viSao): một nguồn duy nhất, hoặc lý do ghi rõ vì sao tách. Lệnh gợi ý dò lịch sử: git log -S'viSao' trên hai tệp đó.
    - Bảng phân loại tay các literal số còn ghi «đọc tay» ở mục 3 của luat-kho.md (tro-ly-so-do.ts:31/35/232, okr-xu-huong.ts:28/32, cot-gop-y.tsx:66, the-gop-y-so-do.tsx:63, okr-kiem-de-xuat.ts:58/95/101), mỗi dòng ghi là hằng đơn vị hoặc định dạng hợp lệ, hay tham số tinh chỉnh phải vào TRO_LY_OKR_TRAN.
    - Một câu kết luận có căn cứ về tro-ly.service.ts:504 ghi bảng OkrDeXuat (đó là ngoại lệ thiết kế §4 cho phép hay vi phạm luật API chỉ ghi AgentTask và ghi OKR qua OkrService), kèm việc mở rộng mục 6 của luat-kho.md sang packages/db/src/okr-de-xuat.ts, okr-tro-ly.ts, okr-xu-huong.ts (hienLuc, xepLuotAnSauKhiLuu).
    - Kiểm chéo bằng một lệnh grep độc lập với luat-kho.mjs trên git diff -U0 7db7cea33309 HEAD -- apps packages tìm dòng thêm chứa // hoặc /*, để mục 1 không phụ thuộc vào script tự chấm.
    - Ghi rõ rằng API chạy lại kiemDongDeXuat khi đọc troLyDanhSach không vi phạm luật «trí khôn ở apps/agent» (kiemDongDeXuat là hàm thuần trong packages/validation; chốt mã noi-ve-nguoi không tính là identity matching).
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Không có eval không-phân-biệt được liệt kê: danh sách rỗng. Mọi block eval ghi baseline n-a vì round này không đo lại. Bốn lệnh suite là regression-guard bình thường, không liệt kê.

Round này còn một điểm cần người biết: lệnh do-tre.mjs không gắn eval nào ngoài E24 (mỗi lệnh fail đều đã gắn eval, không có lệnh fail mồ côi).

## Variance

none — mọi eval round này chạy một lần, không có eval nào có pass_rate lẫn lộn.

## Iterations

Round 1: E1, E2, E9, E10, E11, E18, E19 được chạy lần đầu và giữ kết quả xanh đến round này (carry-forward); chi tiết các lỗi round 1 xem run-log.jsonl và review-findings của round đó. Trả về triển khai.
Round 2: REJECT — chỉ ca đối chứng E22 (commit 6837bb90: E4 xanh, E28 đề xuất PASS lúc đó). Trả về triển khai (commit 46310617 giữ con số người viết; commit 59d56495 sửa ca đối chứng E22).
Round 3: REJECT — E24 đo độ trễ 20 lượt troLyDeXuat thật: p50 11323 ms so với ngưỡng 8000 ms và p90 22456 ms so với ngưỡng 15000 ms, 0 lượt hỏng. E22 xanh (30/30 mã, judge 0.85 trên 20 cặp). E25 chờ chủ kho chấm 20 cặp; E28 chờ người quyết ba điểm luật kho. Đây là round thứ ba: theo template, leo thang lên người dùng.
