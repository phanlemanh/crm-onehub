---
schema_version: 2
feature_slug: tiep-thi-tuyen-doi-tac
verdict: PENDING-JUDGMENT
failed_evals: []
reason: |
  Vòng 3 chạy làm HAI LƯỢT TÁCH RỜI, theo đường (a) người chọn sau khi hai vòng
  trước cùng hỏng vì làn bộ kiểm và làn lái trình duyệt giẫm lên nhau.
  Lượt máy (17 phép đo + 4 bộ kiểm, có dựng lại cơ sở dữ liệu thử và sinh lại bộ
  khách): PENDING-JUDGMENT — 0 phép đo trượt, 0 lệnh trượt, 0 chân bị chặn.
  Lượt lái (7 phép đo trình duyệt, KHÔNG chạy bộ kiểm nào): PASS — 0 trượt, 0 chặn.
  Phán quyết hợp nhất là PENDING-JUDGMENT vì phép phán xét E19 trả UNCERTAIN:
  hội đồng ba mắt không thống nhất được câu «sàn chặn bot ở mức làm hỏng nhịp
  hàng tháng không». Đó là câu người quyết ở Cổng Bằng chứng.
verified_by: fresh-context verification subagents (hai lượt)
enforcement_mode: strict
bypass_used: false
verified_commit: 3856984
human_signoff:
---

# Evidence Report: tiep-thi-tuyen-doi-tac — vòng 3

Vòng này chạy hai lượt tách rời. Lý do và quyết định ghi ở
`decisions.jsonl` (`d-20260905T040000Z-tach-lan`).

| Lượt | Phép đo | Bộ kiểm | Phán quyết |
|---|---|---|---|
| Máy | 17 (E1–E5, E7, E8, E10, E11, E13, E14, E16–E19, E22, E24, E25) | 4 | PENDING-JUDGMENT |
| Lái trình duyệt | 7 (E6, E9, E12, E15, E20, E21, E23) | 0 | PASS |

Không phép đo nào trượt ở cả hai lượt. Không chân nào bị chặn.
Phán xét E19 trả UNCERTAIN — việc của người ở Cổng Bằng chứng.

## Lượt máy


# Evidence Report: tiep-thi-tuyen-doi-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-14 | judgment | UNCERTAIN |
| E22 | AC-13 | script | PASS |
| E24 | AC-16 | test | PASS |
| E25 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tiep-thi-tuyen-doi-tac-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E2
  run_id: minted-tiep-thi-tuyen-doi-tac-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E3
  run_id: minted-tiep-thi-tuyen-doi-tac-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E4
  run_id: minted-tiep-thi-tuyen-doi-tac-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E5
  run_id: minted-tiep-thi-tuyen-doi-tac-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E7
  run_id: minted-tiep-thi-tuyen-doi-tac-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E8
  run_id: minted-tiep-thi-tuyen-doi-tac-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E10
  run_id: minted-tiep-thi-tuyen-doi-tac-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E11
  run_id: minted-tiep-thi-tuyen-doi-tac-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E13
  run_id: minted-tiep-thi-tuyen-doi-tac-E13-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E14
  run_id: minted-tiep-thi-tuyen-doi-tac-E14-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E16
  run_id: minted-tiep-thi-tuyen-doi-tac-E16-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [543.00ms]

- eval: E17
  run_id: minted-tiep-thi-tuyen-doi-tac-E17-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tt_crawl_test
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
    Ran 20 tests in 0.049s

    OK

- eval: E18
  run_id: minted-tiep-thi-tuyen-doi-tac-E18-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tt_crawl_live
  verified_at: 2026-09-05T06:15:29+07:00
  output: |
    2026-09-05 06:15:29,112 INFO lượt chạy: {'gieo': 50, 'lay_duoc': 48, 'bi_chan': 2, 'lan_thu': 68, 'lan_thu_hong': 7, 'lan_thu_so_do': 13, 'lan_thu_danh_ba': 5, 'lan_thu_ho_so': 50, 'lan_thu_lo_so': 0, 'co_so_dien_thoai': 48, 'tong_bang_tin_moi': 48, 'tong_khac_tin_moi': 0, 'tin_dang': {'min': 37, 'q1': 43, 'trung_vi': 60, 'q3': 80, 'max': 436}, 'tin_moi_30_ngay': {'min': 37, 'q1': 43, 'trung_vi': 60, 'q3': 80, 'max': 436}}
    2026-09-05 06:15:29,112 WARNING 48/48 hồ sơ có tổng tin bằng tin mới 30 ngày — sàn chỉ công bố một con số
    2026-09-05 06:15:29,114 INFO đã ghi ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json (48 mục)

- eval: E19
  criterion: AC-14
  executor: judgment
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: UNCERTAIN
  votes:
  - domain-correctness: PASS — Log và batch trả lời đủ ba câu bằng số cụ thể: (1) chặn thấp — 1/50 bị chặn (2%), 49/50 lấy được (98%), tổng lượt thử đếm đủ (68 = 13 sơ đồ + 5 danh bạ + 50 hồ sơ) — không cho thấy chặn ở mức hại thuê hàng tháng; (2) tứ phân vị {min 37, q1 43, trung_vi 61, q3 84, max 436} cho thấy ngưỡng 20 không phân biệt được gì trên mẫu thật (0/49 hồ sơ rơi tier "thấp"), nên 60/20/1 chưa hợp lý toàn thang dù mốc 60 chia gần giữa (26 cao/23 vừa); (3) 49/49 hồ sơ (100%) có số điện thoại không rỗng, đủ mở chiến dịch gọi điện. Cả ba đều là câu trả lời cụ thể đủ cho quyết định mở chiến dịch đầu, đúng yêu cầu AC-14.
  - operational-feasibility: UNCERTAIN — (1) Không — tổng lần thử đếm đủ (13 sơ đồ + 5 danh bạ + 50 hồ sơ + 0 lộ số = 68 = lan_thu, khớp); lay_duoc/gieo = 49/50 (98%), bi_chan = 1/50 (2%), lan_thu_hong = 6/68 (8,8%) — mức chặn này không cho thấy sàn chặn bot đủ mạnh để làm hỏng thuê hàng tháng. (2) Không đủ căn cứ — tứ phân vị tin đăng (min 37, q1 43, trung vị 61, q3 84) chỉ kiểm được vạch 60 (gần trung vị, hợp lý), còn vạch 20 và 1 không có hồ sơ nào gần đó vì sàn thấp nhất quan sát được (37) đã cao hơn cả vạch "vừa" — hai ngưỡng dưới chưa được dữ liệu này chứng minh hợp lý. (3) Có — 49/49 hồ sơ (100%) có số điện thoại, đủ để mở chiến dịch gọi điện đầu tiên. Vì câu (2) không có bằng chứng để phán, tổng thể UNCERTAIN.
    required_evidence:
    - Chạy lại bộ cào thật trên seed mở rộng ngoài cụm Quận 12/Gò Vấp/Tân Bình, ưu tiên gồm chuyên trang có dưới 40 tin đăng, và ghi tứ phân vị mới vào live-run.log — nếu xuất hiện hồ sơ có tin đăng gần hoặc dưới 20, mới đủ dữ liệu kiểm ngưỡng "vừa" (20) và "thấp" (1) của bảng 60/20/1.
  - spec-alignment: UNCERTAIN — (1) Chặn bot: KHÔNG cho thấy mức làm hỏng — lấy được 49/50 (98%), bị chặn 1/50 (2%) — nhưng nhật ký không tách được 6 "lan_thu_hong" là loại lỗi gì (chặn, timeout, hay lỗi bóc tách như dòng "isCompany: không bóc được" xuất hiện ở cả hai lượt) và không xác nhận được liệu con số này có trùng hay tách khỏi "bi_chan=1", nên không chắc mọi lần thử đã được gộp đúng. (2) Tứ phân vị (min=37, q1=43, trung vị=61, q3=84, max=436) chỉ chạm được biên ngưỡng "cao" (60, khớp ranh giới tier trong live-batch.json) — cả 49 hồ sơ đều ≥37 nên hai ngưỡng dưới (20 và 1) chưa được dữ liệu này kiểm; mẫu cũng có vẻ sắp giảm dần theo tổng tin (436→37) chứ không ngẫu nhiên, nên không đủ căn cứ kết luận 60/20/1 hợp lý. (3) Số điện thoại: CÓ, đủ — 49/49 (100%) hồ sơ lấy được có số điện thoại, thừa để mở chiến dịch gọi điện.
    required_evidence:
    - Dòng log mức chi tiết hơn (hoặc mã bộ đếm trong tools/listing-crawl/) phân loại rõ nguyên nhân của từng lần trong 6 lan_thu_hong, và xác nhận bi_chan=1 có phải do sàn chặn (403/429/CAPTCHA) khác với lỗi bóc tách dữ liệu ở live-run.log dòng 2 và dòng 7 ("bỏ qua ... isCompany: không bóc được") — nếu tách rõ và bi_chan thật sự chỉ đếm chặn-bot (không lẫn lỗi parse), câu (1) đổi sang PASS rõ ràng.
    - Một lượt cào 50 hồ sơ khác không sắp theo listingsTotal giảm dần, hoặc mở rộng gieo tới khi có hồ sơ dưới 20 tin đăng, ghi vào evidence/*.json và *.log mới — để tứ phân vị thật sự chạm được ngưỡng 20 và 1; nếu min mẫu mới xuống dưới 20 và phân bố quanh 20/1 hợp lý theo tier hiện có, câu (2) đổi sang PASS.
  human_override:

- eval: E22
  run_id: minted-tiep-thi-tuyen-doi-tac-E22-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tt_crawl_to_ingest
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [272.00ms]

- eval: E24
  run_id: minted-tiep-thi-tuyen-doi-tac-E24-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1273.00ms]

- eval: E25
  run_id: minted-tiep-thi-tuyen-doi-tac-E25-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T06:20:00+07:00
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [543.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run db:test && bun run test
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bun_run_db_test_bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-05T06:20:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bunx_turbo_run_check_types_force-r3
  exit_code: 0
  verified_at: 2026-09-05T06:20:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-05T06:20:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-05T06:20:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

E16, E25 — green trên cả HEAD lẫn baseline (cmd: cd apps/app && bun test test/messages-guard.spec.ts test/campaign-states.spec.ts). Đây là bài khẳng định quan hệ trạng thái–câu chữ trên UI đã có từ trước (m.loading.list / m.empty.list / m.empty.noViews), đóng vai guard hồi quy có chủ ý cho AC-12, không phải hành vi mới do round này thêm vào — giữ nguyên, không cần viết lại.

## Variance

none — không có eval nào mang field runs > 1 trong round này (mọi eval deterministic, runs=1).

## Iterations

Round 1: E15, E20 BLOCKED — bộ ráng UI (chiến-dịch.mjs chữ/thiết-kế) không dựng được, exit không trả về (cannot_run). Trả về triển khai.
Round 2: E15, E20 đã chạy được và PASS; nhưng E21 (AC-15, bề rộng 1024/768px) FAIL — RẢNG CỤT: không suy được slug từ http://localhost:3000/ (trả 200 mà không có header Location), phiên hỏng hoặc kho chưa có nơi làm việc. Verdict REJECT — trả về triển khai.
Round 3: Bộ đo round này không còn nhắc bảy eval UI-check/script gắn ảnh chụp của round 2 (E6, E9, E12, E15, E20, E21, E23) — không có dữ liệu đo cho chúng ở round này. 17 eval máy còn lại trong hợp đồng hiện hành (E1-E5, E7, E8, E10, E11, E13, E14, E16, E17, E18, E22, E24, E25) đều PASS trên HEAD; E19 (judgment, AC-14) vẫn PENDING vì hội đồng chia phiếu — domain-correctness PASS, operational-feasibility và spec-alignment UNCERTAIN — trên câu ngưỡng sản lượng 20/1 chưa có hồ sơ thật nào kiểm chứng được (mẫu live thấp nhất quan sát là 37 tin đăng). Verdict PENDING-JUDGMENT — chờ người quyết ở Cổng 2.

---

## Lượt lái trình duyệt


# Evidence Report: tiep-thi-tuyen-doi-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | ui-check | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | ui-check | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-12 | script | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-14 | judgment | UNCERTAIN |
| E20 | AC-15 | script | PASS |
| E21 | AC-15 | script | PASS |
| E22 | AC-13 | script | PASS |
| E23 | AC-16 | ui-check | PASS |
| E24 | AC-16 | test | PASS |
| E25 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tiep-thi-tuyen-doi-tac-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E2
  run_id: minted-tiep-thi-tuyen-doi-tac-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E3
  run_id: minted-tiep-thi-tuyen-doi-tac-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E4
  run_id: minted-tiep-thi-tuyen-doi-tac-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E5
  run_id: minted-tiep-thi-tuyen-doi-tac-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E6
  run_id: e6v1788564734
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T06:40:00+07:00
  screenshot: _acceptance/tiep-thi-tuyen-doi-tac/evidence/E6-goc-nhin.png
  observed: |
    Frame 1 (E6-goc-nhin.png, đọc bằng Read - ảnh): màn "Cá nhân" (danh sách cá nhân), ô tìm kiếm = "Range6v1788564734" (lọc theo run nonce), bảng hiện 4 dòng (Trâm/Diệp/Bảo/Quỳnh Range...), tất cả 4 dòng có cột "Sản lượng" = "Cao", chân trang ghi "... trong số 4". Khớp Expected (lọc màn Cá nhân theo Sản lượng=Cao, tập kết quả = 4).
    Frame 2 (E6-tao.png, đọc bằng Read - ảnh): hộp "Chiến dịch mới" đang mở, ô "Tên" = "Chiến dịch e6v1788564734", ô "Phân khúc" đang chọn = "Sản lượng cao e6v1788564734  4 cá nhân" (dropdown hiện rõ số 4 cạnh tên góc nhìn), ghi chú dưới ô "Chỉ hiện góc nhìn cá nhân đang dùng chung" xác nhận đây là góc nhìn đã lưu dùng chung từ bước trước. Khớp Expected (tạo chiến dịch từ đúng góc nhìn đã lưu, phân khúc hiện 4 cá nhân).
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-tiep-thi-tuyen-doi-tac-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E8
  run_id: minted-tiep-thi-tuyen-doi-tac-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E9
  run_id: e9verify38957
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T06:40:00+07:00
  screenshot: _acceptance/tiep-thi-tuyen-doi-tac/evidence/E9-dong-thoi-gian.png
  observed: |
    3 frame đọc bằng Read, tất cả khớp đúng 1 lượt của RUN_ID=e9verify38957:
    - E9-bat-dau.png: trang "Chiến dịch e9verify38957", "Đang chạy", "Bắt đầu lúc 6:34 5 thg 9, 2026", Thành viên=4, Đã gọi=0 (đúng TRƯỚC khi bấm kết quả).
    - E9-ghi.png: cùng trang, dòng "Trâm Range9verify38957" đã có thẻ "Trả lời" dưới cột Gần nhất, Đã gọi=1, Tỷ lệ trả lời=100% (đúng SAU khi bấm kết quả 'Trả lời').
    - E9-dong-thoi-gian.png: hồ sơ cá nhân "Trâm Range9verify38957" SAU KHI TẢI LẠI trang (URL ?record=contact:...&tab=activity, sheet mở lại từ đầu), tab Hoạt động hiện ĐÚNG 1 mục "HÔM NAY: Trả lời · Chiến dịch e9verify38957 — manh.phan · 6:34". Tiêu đề chứa cả nhãn kết quả 'Trả lời' (outcome.answered) VÀ tên chiến dịch (nonce) của đúng lượt này.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-tiep-thi-tuyen-doi-tac-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E11
  run_id: minted-tiep-thi-tuyen-doi-tac-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E12
  run_id: n/a
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T06:40:00+07:00
  screenshot: /Users/manhphan/dev/crm-onehub/_acceptance/tiep-thi-tuyen-doi-tac/evidence/E12-so-do.png
  observed: |
    Frame E12-so-do.png (1440x1000, đọc bằng Read): trang "Chiến dịch ttmtnl81oh" (Sản lượng cao ttmtnl81oh · Bắt đầu lúc 6:31 5 thg 9, 2026), badge "Đang chạy". Khối "Chiến dịch này": Thành viên=4, Đã gọi=2, Tỷ lệ trả lời=100% (Trả lời 2), Tỷ lệ hẹn gặp=50% (Hẹn gặp 1). Ngay dưới là khối "Mọi chiến dịch khác": Thành viên="—", Đã gọi=42, Tỷ lệ trả lời=100% (Trả lời 42), Tỷ lệ hẹn gặp=48% (Hẹn gặp 20) — hai khối xếp cạnh/dưới nhau rõ ràng, đúng "hàng đối chứng hiện cạnh hàng chiến dịch". Bảng thành viên bên dưới liệt kê 4 người (Trâm, Diệp, Báo, Quỳnh RangttmtnI81oh) với cột Gần nhất: Diệp="Hẹn gặp", Trâm="Không nghe", hai người còn lại "—" (chưa ghi) — khớp "3 lượt ghi trên 2 cá nhân" (tổng 3 lượt, 2 cá nhân đối trùng). Không thấy dấu hiệu mâu thuẫn với Expected. Góc trái dưới có widget "1 Issue" của dev tool, không liên quan nội dung nghiệp vụ.
  network_observed: n-a (driver)

- eval: E13
  run_id: minted-tiep-thi-tuyen-doi-tac-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E14
  run_id: minted-tiep-thi-tuyen-doi-tac-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E15
  run_id: minted-tiep-thi-tuyen-doi-tac-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_chu
  verified_at: 2026-09-05T06:40:00+07:00
  output: |
       [en] là câu của máy chủ: ĐÚNG — khớp nguyên văn, trừ khỏi phép so hai thứ tiếng
       KHÔNG phải chiều đo — hợp đồng khai câu này vẫn tiếng Anh; chặn ghi lại chữ thay vì trừ lặng. Trừ 1 chuỗi.
       đã ghi _acceptance/tiep-thi-tuyen-doi-tac/evidence/E15-chu-may-chu.txt

- eval: E16
  run_id: minted-tiep-thi-tuyen-doi-tac-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [712.00ms]

- eval: E17
  run_id: minted-tiep-thi-tuyen-doi-tac-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_test
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
    Ran 20 tests in 0.070s

    OK

- eval: E18
  run_id: minted-tiep-thi-tuyen-doi-tac-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_live
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
    2026-09-05 00:57:00,209 WARNING 49/49 hồ sơ có tổng tin bằng tin mới 30 ngày — sàn chỉ công bố một con số
    2026-09-05 00:57:00,211 INFO đã ghi ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json (49 mục)

- eval: E19
  criterion: AC-14
  executor: judgment
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  votes:
  - domain-correctness: PASS — (1) Có — bị chặn thấp: bi_chan=1/50 gieo (2%), lan_thu_hong=6/68 lần thử (~8.8%); tổng lần thử đếm đủ vì 13 (sitemap) + 5 (danh bạ) + 50 (hồ sơ) = 68 = lan_thu, không sót tầng nào. (2) Không rõ ràng hợp lý — trung vị tin đăng = 61, sát ngay ngưỡng "Cao" = 60, tức khoảng phân nửa mẫu 49 hồ sơ đã rơi vào "Cao" (không chọn lọc); ngưỡng 20 và 1 hoàn toàn chưa được mẫu kiểm chứng vì giá trị nhỏ nhất trong mẫu là 37 (> 20) — đúng như hợp đồng đã tự khai "chưa có phân phối" và cần owner duyệt lại. (3) Có, đủ — 49/49 hồ sơ lấy được đều có trường số điện thoại (100%, co_so_dien_thoai=49=lay_duoc), thừa cho một chiến dịch gọi điện đầu tiên. Số liệu trong log và json khớp nhau, tứ phân vị tính đúng (kiểm tay: q1=43, trung vị=61, q3=84 khớp dữ liệu thô), và AC-14 là loại "judgment" — việc in ra các số này để người ký Cổng Phạm vi tự quyết ngưỡng là đúng vai trò của nó, không phải lỗi.
  - operational-feasibility: PASS — (1) Không — 49/50 gieo lấy được (98%), chỉ 1 bị chặn (2%), quá thấp để cho thấy sàn chặn bot ở mức làm hỏng chi phí thuê hàng tháng; tổng kết đếm đủ mọi lần thử: 13(sơ đồ)+5(danh bạ)+50(hồ sơ)+0(lộ số)=68=lan_thu, và 49(lay_duoc)+1(bi_chan)=50=gieo, cả hai chiều đều khớp. (2) Trung vị tin đăng (61) nằm sát ngay ngưỡng «cao»=60 nên khoảng một nửa mẫu rơi vào tier cao — đáng ngờ về độ chọn lọc — nhưng hợp đồng đã tự khai ngưỡng 60/20/1 "chưa có phân phối" và mức sản lượng thật xếp theo tổng tin đang đăng (không phải tin mới 30 ngày, vì sàn chỉ công bố một con số cho cả hai trường); AC-14 chỉ đòi in tứ phân vị để owner tự chỉnh trước chiến dịch đầu, và bằng chứng đã làm đúng việc đó (49/49 hồ sơ có min=37, q1=43, median=61, q3=84, max=436, đủ cho owner thấy ngưỡng cần xét lại). (3) Có — 49/49 hồ sơ lấy được có số điện thoại (100%), thừa đủ để mở một chiến dịch gọi điện.
  - spec-alignment: UNCERTAIN — (1) Có — 49/50 lấy được (98%), 1/50 bị chặn (2%); tổng lần thử ghi 68 khớp đúng tổng ba loại trang (so_do 13 + danh_ba 5 + ho_so 50 = 68), tổng kết đếm đủ và không cho thấy sàn chặn bot ở mức làm hỏng thuê hàng tháng. (2) Không đủ căn cứ — ngưỡng "60" nằm sát ngay trung vị mẫu (trung_vi=61), khiến 26/49 hồ sơ (53%) rơi vào mức Cao, quá rộng cho mức cao nhất; mẫu có min=37 nên ngưỡng "20" và "1" hoàn toàn không có dữ liệu nào trong lô này để kiểm — hợp đồng cũng tự khai ngưỡng "chưa có phân phối" và để owner chỉnh, nên phần này cần người quyết chứ log không đủ chứng minh hợp lý hay không. (3) Có về số lượng — log ghi co_so_dien_thoai=49/49 lay_duoc (100%), nhưng live-batch.json không mang giá trị số thật để đối chiếu: cả 49 mục đều là cùng một chuỗi che "09xxxxxxxx", nên tỷ lệ 100% chỉ xác nhận trường có giá trị, không xác nhận đó là số thật/khác nhau đủ gọi được.
    required_evidence:
    - Danh sách 49 số điện thoại thật (chưa che) hoặc một bản ghi kiểm định dạng số (ví dụ script kiểm regex số di động VN) từ pipeline cào, để xác nhận co_so_dien_thoai=49 là 49 số thật khác nhau chứ không phải placeholder — nếu thấy số thật hợp lệ, câu 3 đổi từ 'không kiểm chứng được' sang 'có'.
    - Một lượt cào hoặc mẫu bổ sung có tin_dang trải xuống dưới 37 (chạm vùng 20 và dưới 20) để tứ phân vị thật sự phủ được ngưỡng 20/1 — hiện min=37 nên hai ngưỡng đó không có điểm dữ liệu nào để đánh giá hợp lý hay không.
    - Ghi chú quyết định của owner (trong opportunity.md hoặc decisions.jsonl) đối chiếu tứ phân vị (min 37, q1 43, trung_vi 61, q3 84) với ngưỡng 60/20/1 và xác nhận có giữ 60 hay chỉnh lại — vì 53% mẫu rơi vào Cao là dấu hiệu ngưỡng có thể quá thấp mà hợp đồng đã lường trước phải có người chỉnh.
  human_override:

- eval: E20
  run_id: minted-tiep-thi-tuyen-doi-tac-E20-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_thiet_ke
  verified_at: 2026-09-05T06:40:00+07:00
  output: |
    E20 THIET KE _acceptance/tiep-thi-tuyen-doi-tac/evidence/E20-danh-sach.html verdict=PASS
    E20 THIET KE _acceptance/tiep-thi-tuyen-doi-tac/evidence/E20-chien-dich.html verdict=PASS

- eval: E21
  run_id: minted-tiep-thi-tuyen-doi-tac-E21-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_be_rong
  verified_at: 2026-09-05T06:40:00+07:00
  output: |
    Gần nhất               o=   46.92px chu=   50.19px  cắt + ba chấm + trợ năng
    Ghi kết quả            o=  271.52px chu=   63.41px  đủ
    E21 BE RONG 1024px=không cột nào bị cắt · 768px=mọi chỗ cắt có ba chấm và chữ đầy đủ

- eval: E22
  run_id: minted-tiep-thi-tuyen-doi-tac-E22-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_to_ingest
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [257.00ms]

- eval: E23
  run_id: e23v2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_trang_thai
  verified_at: 2026-09-05T06:40:00+07:00
  screenshot: /Users/manhphan/dev/crm-onehub/_acceptance/tiep-thi-tuyen-doi-tac/evidence/E23-nhap.png
  observed: |
    E23-nhap.png: campaign "Chiến dịch trạng thái e23v2" ở trạng thái Nháp, header có nút "Bắt đầu", bảng 4 dòng thành viên không có nút kết quả nào trên dòng nào (0 nút/dòng) — khớp nhap=0nut. E23-ket-thuc-bam.png: ngay sau khi bấm Kết thúc (trước khi tải lại) — huy hiệu đã đổi "Đã kết thúc", dòng phụ đề đã có "Bắt đầu lúc 6:30 5 thg 9, 2026 · Kết thúc lúc 6:30 5 thg 9, 2026", bảng vẫn 4 dòng không nút kết quả (frame trung gian, không phải điểm kiểm cuối). E23-ket-thuc.png (SAU KHI TẢI LẠI trang, đây là frame đối chiếu Expected): huy hiệu "Đã kết thúc" ở góc trên phải, KHÔNG còn nút "Bắt đầu" nào ở khu vực actions (chỉ còn text huy hiệu) — khớp batdau=an; bảng 4 dòng không có nút kết quả nào — khớp ketthuc=0nut; dòng phụ đề vẫn giữ mốc "Bắt đầu lúc ... · Kết thúc lúc ...". Không có frame riêng cho trạng thái "chạy" (script không chụp bước đó) nhưng dòng log in ra chay=5nut đến từ page.evaluate ngay sau khi bấm Bắt đầu, trước khi bấm Kết thúc.
  network_observed: n-a (driver)

- eval: E24
  run_id: minted-tiep-thi-tuyen-doi-tac-E24-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E25
  run_id: minted-tiep-thi-tuyen-doi-tac-E25-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [712.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run db:test && bun run test
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bun_run_db_test_bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bunx_turbo_run_check_types_force-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này.

none — round này không đo lại baseline (P2, evals.yaml không đổi từ lần baseline cuối); danh sách eval không-phân-biệt giữ nguyên rỗng theo dữ liệu round trước, không có phép đo mới nào để xếp vào đây.

## Variance

none — không có eval nào mang field runs > 1 trong round này (mọi eval deterministic, runs=1).

## Iterations

Round 1: E15, E20 BLOCKED — bộ rang UI (chien-dich.mjs chu / thiet-ke) không dựng được, exit không trả về (cannot_run). Trả về triển khai.
Round 2: E15, E20 đã chạy được và PASS; nhưng E21 (AC-15, bề rộng 1024/768px) FAIL — RANG CỤN: không suy được slug từ http://localhost:3000/ (trả 200 mà không có header Location), phiên hỏng hoặc kho chưa có nơi làm việc. Verdict REJECT — trả về triển khai.
Round 3: Tách lượt máy và lượt lái trình duyệt (quyết định d-20260905T040000Z-tach-lan) — lượt máy chạy trước (sinh lại bộ khách, dựng lại cơ sở dữ liệu thử), lượt lái trình duyệt chạy sau khi cây đã tĩnh. E21 (bề rộng 1024/768px) nay PASS: ở 1024px không cột nào bị cắt, ở 768px mọi chỗ cắt có ba chấm và chữ đầy đủ. E6, E9, E12, E15, E20, E23 chạy lại trên cùng lượt và giữ PASS. failed_evals rỗng.