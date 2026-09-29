---
schema_version: 2
feature_slug: tro-ly-okr-de-xuat
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 99410da841a67a435e5299ccb043baf207af1ff4
human_signoff:
---

# Evidence Report: tro-ly-okr-de-xuat

Round 4. Bảng dưới thay toàn bộ nội dung round cũ; lịch sử round nằm ở mục Iterations. Chín eval chạy lại ở round này (E6, E7, E8, E17, E22, E23, E24, E26, E27); mười tám eval mang sang từ round trước vì delta không chạm paths của chúng; E25 và E28 là judgment chờ người chốt. Bốn lệnh suite hồi quy chạy lại và xanh.

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
| E24 | AC-14 | script | PASS (giới hạn đã khai không còn) |
| E25 | AC-14 | judgment | UNCERTAIN |
| E26 | AC-4 | test | PASS |
| E27 | AC-15 | script | PASS |
| E28 | AC-15 | judgment | chờ người chốt (hội đồng đề xuất FAIL) |
| E29 | AC-2 | script | PASS |

## Evidence

### Eval chạy lại ở round 4

- eval: E6
  run_id: minted-tro-ly-okr-de-xuat-E6-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_bo_kiem
  verified_at: 2026-09-29T02:37:00Z
  output: |
    Ran 16 tests across 1 file. [72.00ms]

- eval: E7
  run_id: minted-tro-ly-okr-de-xuat-E7-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_nop_ghi
  verified_at: 2026-09-29T02:37:00Z
  output: |
    test-run: dropped crm_mum1fuodg6cl_test

- eval: E8
  run_id: minted-tro-ly-okr-de-xuat-E8-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_khong_moi_lai
  verified_at: 2026-09-29T02:37:00Z
  output: |
    (đuôi kết quả chỉ có dòng kết thúc của lệnh; lệnh thoát sạch)

- eval: E17
  run_id: minted-tro-ly-okr-de-xuat-E17-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_che_do_an
  verified_at: 2026-09-29T02:37:00Z
  output: |
    test-run: dropped crm_mum1fumrmlhk_test

- eval: E22
  run_id: minted-tro-ly-okr-de-xuat-E22-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdx_eval_gop_y
  verified_at: 2026-09-29T02:37:00Z
  output: |
    ma: 30/30 · judge: 0.90 (20 cap, nguong 0.7)

- eval: E23
  run_id: minted-tro-ly-okr-de-xuat-E23-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_judge_zdr
  verified_at: 2026-09-29T02:37:00Z
  output: |
    Ran 2 tests across 1 file. [207.00ms]

- eval: E24
  run_id: minted-tro-ly-okr-de-xuat-E24-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.tdx_do_tre
  verified_at: 2026-09-29T02:37:00Z
  output: |
    phien-do: xong — mã 0
  ghi_chu: evals.yaml khai giới hạn thoát mã 1 (độ trễ vượt ngưỡng); lần chạy này thoát 0, tức lọt ngưỡng p50 và p90, nên giới hạn đã khai không còn. Không khớp với mã đã khai, xem mục Known limits.

- eval: E26
  run_id: mum1fvmlp980
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdx_duong_do
  verified_at: 2026-09-29T02:37:00Z
  output: |
    test-run: dropped crm_mum1fvmlp980_test

- eval: E27
  run_id: minted-tro-ly-okr-de-xuat-E27-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdx_tai_lieu
  verified_at: 2026-09-29T02:37:00Z
  output: |
    tai-lieu: CONTEXT.md, docs/api.md (7 thu tuc), docs/agent.md deu du.

### Eval mang sang từ round trước

- eval: E1
  run_id: minted-tro-ly-okr-de-xuat-E1-r1
  exit_code: 0
  verifier: config:executors.test.tdx_quyen_nut
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-tro-ly-okr-de-xuat-E2-r1
  exit_code: 0
  verifier: config:executors.test.tdx_man_nut
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-tro-ly-okr-de-xuat-E3-r2
  exit_code: 0
  verifier: config:executors.test.tdx_man_trang_thai
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: E4-2026-09-29T07:01+07-run2
  exit_code: 0
  verifier: config:executors.script.tdx_man_that
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval; khung ảnh gốc xem round 2 trong Iterations

- eval: E5
  run_id: minted-tro-ly-okr-de-xuat-E5-r2
  exit_code: 0
  verifier: config:executors.test.tdx_dung_lai_tran
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-tro-ly-okr-de-xuat-E9-r1
  exit_code: 0
  verifier: config:executors.test.tdx_quyet
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-tro-ly-okr-de-xuat-E10-r1
  exit_code: 0
  verifier: config:executors.test.tdx_man_vet
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-tro-ly-okr-de-xuat-E11-r1
  exit_code: 0
  verifier: config:executors.test.tdx_tach_tx
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-tro-ly-okr-de-xuat-E12-r2
  exit_code: 0
  verifier: config:executors.test.tdx_xu_huong
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-tro-ly-okr-de-xuat-E13-r2
  exit_code: 0
  verifier: config:executors.test.tdx_xu_huong_api
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-tro-ly-okr-de-xuat-E14-r2
  exit_code: 0
  verifier: config:executors.test.tdx_nac
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-tro-ly-okr-de-xuat-E15-r2
  exit_code: 0
  verifier: config:executors.test.tdx_nac_luu
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E16
  run_id: minted-tro-ly-okr-de-xuat-E16-r2
  exit_code: 0
  verifier: config:executors.test.tdx_man_cai_dat
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E18
  run_id: minted-tro-ly-okr-de-xuat-E18-r1
  exit_code: 0
  verifier: config:executors.test.tdx_giu_viec
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E19
  run_id: minted-tro-ly-okr-de-xuat-E19-r1
  exit_code: 0
  verifier: config:executors.test.tdx_kiem_khoa
  verified_at: 2026-09-28T22:13:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E20
  run_id: minted-tro-ly-okr-de-xuat-E20-r2
  exit_code: 0
  verifier: config:executors.test.tdx_so_do
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E21
  run_id: minted-tro-ly-okr-de-xuat-E21-r2
  exit_code: 0
  verifier: config:executors.test.tdx_man_so_do
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E29
  run_id: design-gate-03e847672e
  exit_code: 0
  verifier: config:executors.script.tdx_san_thiet_ke
  verified_at: 2026-09-28T23:54:18Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

### Judgment (đề xuất hội đồng, người chốt ở Cổng 2)

- eval: E25
  judged_by: hội đồng ba lens (fresh context), đề xuất UNCERTAIN
  verdict: UNCERTAIN
  rationale: Cột «Chủ kho (Đạt/Không đạt)» của hieu-chinh-judge.md trống ở cả 20 cặp, nên không tính được tỷ lệ khớp với judge (điều kiện thứ nhất, ngưỡng 85%). Điều kiện thứ hai đã thoả theo hội đồng: 17 trên 20 cặp judge chấm 1.00, trung bình 0,85, cao hơn ngưỡng 0,7 (tiêu đề tệp hiện ghi 0.90 sau lần sinh lại lúc 02:21 UTC; E22 in judge 0.90 trên 20 cặp). Tiêu đề ghi 22 ca bộ Viết lại nhưng bảng chỉ có 20 cặp, cần giải thích.
  votes:
    - domain-correctness: UNCERTAIN — cột chủ kho trống ở cả 20 cặp nên không tính được tỷ lệ khớp; điểm judge đạt ngưỡng; header ghi 22 ca, bảng chỉ có 20 cặp.
    - operational-feasibility: UNCERTAIN — cột chủ kho trống ở cả 20 hàng nên không kiểm được ngưỡng 85%; điểm judge trung bình 0,85 đạt ngưỡng 0,7; header ghi 22 ca nhưng chỉ có 20 hàng.
    - spec-alignment: UNCERTAIN — điểm judge đạt (17/20 bằng 1,00), nhưng không có chấm của chủ kho thì không kết luận được PASS hay FAIL; header nói 22 ca, bảng 20 hàng.
  required_evidence:
    - Bản hieu-chinh-judge.md tại /Users/manh-macmini/dev/crm/_acceptance/tro-ly-okr-de-xuat/evidence/hieu-chinh-judge.md với cột «Chủ kho» điền «Đạt» hoặc «Không đạt» cho đủ 20 cặp, do chủ kho chấm theo ba ý «nói kết quả, không nói việc làm», «giữ ý người viết», «đúng ngôn ngữ chiếm đa số». Có cột đó thì tính được số cặp khớp trên 20 và so với ngưỡng 85% (cần khớp ít nhất 17 cặp), verdict chuyển sang PASS hoặc FAIL.
    - Lời giải thích trong cùng tệp hoặc dòng tiêu đề vì sao ghi 22 ca bộ Viết lại mà bảng chỉ liệt kê 20 cặp. Có lời giải thích thì mẫu số của tỷ lệ khớp và của điểm judge trung bình mới xác định được (chạy lại bun _acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs và đối chiếu danh sách ca).
  human_override:

- eval: E28
  judged_by: hội đồng ba lens (fresh context), đề xuất FAIL với một phiếu UNCERTAIN
  verdict: chờ người chốt (hội đồng đề xuất FAIL)
  rationale: Phần tài liệu đạt ở cả ba lens: mục «Chế độ ẩn» của CONTEXT.md nói bằng chữ thường rằng người dùng không thấy gì, tiền thật tính vào trần tháng, chỉ quản trị đọc kết quả; docs/api.md nêu trần 9 USD và chỉ troLyAn, troLySoDo cho quản trị; docs/agent.md có mục chỗ rẽ 9b. Phần luật kho không đạt: luat-kho.md mục 3 tự ghi biểu thức ngày 24 * 60 * MINUTE_MS khai hai chỗ (apps/api/src/okr/tro-ly-so-do.ts:31 và packages/db/src/okr-xu-huong.ts:28), luật không viết hai lần một đơn vị của AGENTS.md chưa đạt và còn để chủ kho quyết. Bằng chứng luật kho neo ở HEAD 91eba547, không phủ hai commit sau (1e8077e8, 99410da8).
  votes:
    - domain-correctness: FAIL — tài liệu đạt, nhưng luat-kho.md mục 3 tự nhận cặp NGAY_MS trùng ở tro-ly-so-do.ts:31 và okr-xu-huong.ts:28, nghĩa là luật «không viết hai lần một đơn vị» chưa đạt và chưa sửa.
    - operational-feasibility: UNCERTAIN — tài liệu đạt; luat-kho.md sinh ở HEAD 91eba547 trong khi HEAD hiện tại là 99410da8 (hai commit fix chưa được quét), và hằng đơn vị ngày khai hai chỗ chưa sửa.
    - spec-alignment: FAIL — ba tài liệu nói đủ điều người ngoài cần hiểu (chế độ ẩn không hiện gì, tiền thật tính vào trần 9 USD, chỉ quản trị đọc), nhưng luat-kho.md mục 3 tự ghi cặp trùng thật và nói chưa sửa trong vòng này; bằng chứng luật kho còn neo ở HEAD 91eba547.
  required_evidence:
    - Một commit xuất một hằng DAY_MS cạnh MINUTE_MS trong packages/db/src/okr-tro-ly-danh-muc.ts, để apps/api/src/okr/tro-ly-so-do.ts và packages/db/src/okr-xu-huong.ts cùng nhập nó (xem bằng git diff giữa merge-base và HEAD trên ba tệp đó; grep -rnE '24 \* 60' apps/api/src/okr packages/db/src ra 0 dòng ngoài tệp cấu hình).
    - _acceptance/tro-ly-okr-de-xuat/evidence/luat-kho.md sinh lại bằng node _acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs ở HEAD hiện tại (99410da8, sau hai commit sửa tên Mục tiêu): mục 3 không còn cặp «TRÙNG» nào, mục 1 chú thích bằng 0 dòng, và dòng «So HEAD» khớp git rev-parse HEAD.
    - Hoặc một dòng quyết định của chủ kho trong _acceptance/tro-ly-okr-de-xuat/contract.md mục Notes (hay trong luat-kho.md) nêu tên cặp NGAY_MS trùng và trùng viSao là ngoại lệ chấp nhận được, kèm lý do miễn luật đơn vị chỉ một nguồn.
  human_override:

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bun_run_test-r4
  exit_code: 0
  verified_at: 2026-09-29T02:37:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-29T02:37:00Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-29T02:37:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-okr-de-xuat-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-29T02:37:00Z

## Known limits

- E24 (AC-14): gioi han da khai khong con — evals.yaml khai ma 1, lan chay nay tra 0. Go loi khai o vong sau.

## Ngoài hợp đồng

## Analyst

E24 (bun _acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs --lan 20) xanh trên cả HEAD lẫn baseline: không phân biệt được tính năng với code cũ, nên nó chứng minh bộ đo chứ không chứng minh tính năng. Cần viết lại để assert hành vi mới hoặc xác nhận đây là regression-guard có chủ ý (đường 1 của chủ kho đã chuyển ngưỡng độ trễ thành điều kiện bật đo lại ở Cổng Giá trị).

## Variance

none — mọi eval chạy một lần và tất định; không eval nào có kết quả lẫn lộn.

## Iterations

Round 1: E1, E2, E9, E10, E11, E18, E19 được chạy lần đầu và giữ kết quả xanh đến round này (carry-forward); chi tiết các lỗi round 1 xem run-log.jsonl và review-findings của round đó. Trả về triển khai.
Round 2: REJECT — chỉ ca đối chứng E22 (commit 6837bb90: E4 xanh, E28 đề xuất PASS lúc đó). Trả về triển khai (commit 46310617 giữ con số người viết; commit 59d56495 sửa ca đối chứng E22).
Round 3: REJECT — E24 đo độ trễ 20 lượt troLyDeXuat thật: p50 11323 ms so với ngưỡng 8000 ms và p90 22456 ms so với ngưỡng 15000 ms, 0 lượt hỏng. E22 xanh (30/30 mã, judge 0.85 trên 20 cặp). E25 chờ chủ kho chấm 20 cặp; E28 chờ người quyết ba điểm luật kho. Chủ kho chọn đường 1 cho E24 (d-…-29): ghi thành giới hạn đã khai, ngưỡng chuyển thành điều kiện bật đo lại ở Cổng Giá trị.
Round 4: PENDING-JUDGMENT — HEAD 99410da8 (sau hai commit sửa tên Mục tiêu và ba ý chấm judge). Chín eval chạy lại đều xanh: E22 30/30 mã, judge 0.90 trên 20 cặp; E24 thoát 0, giới hạn đã khai không còn; bốn lệnh suite hồi quy xanh. Còn chờ người: E25 (cột chủ kho trống ở 20 cặp) và E28 (hội đồng đề xuất FAIL vì hằng đơn vị ngày khai hai chỗ và luat-kho.md neo ở HEAD cũ). Một phát hiện trong hợp đồng (AC-14) về kiemCa của eval-gop-y.mjs cần người xem ở Cổng 2.
