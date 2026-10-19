---
schema_version: 2
feature_slug: sua-sau-chay-that
verdict: REJECT
failed_evals: ["E9","E13"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 593ecaca453c8d89a56627bdda0ec7d932ce3f3f
human_signoff:
---

# Evidence Report: sua-sau-chay-that

Round 4, chạy lại sau khi gộp onehub (d479d1c6b) vào nhánh. Hai eval đỏ: E9 và E13. Một lệnh suite đỏ không gắn eval nào: `bun run test -- --filter=app --filter=@crm/ui`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS (carried từ round 1) |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS (carried từ round 1) |
| E5 | AC-5 | test | PASS (carried từ round 1) |
| E6 | AC-6 | test | PASS (carried từ round 1) |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS (carried từ round 1) |
| E9 | AC-9 | test | FAIL |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS (carried từ round 1) |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | script | FAIL |
| E14 | AC-2 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-sau-chay-that-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_nguon
  verified_at: 2026-10-19T10:58:59Z
  output: |
    test-run: dropped crm_mvf56dwkorf9_test

- eval: E1b
  run_id: minted-sua-sau-chay-that-E1b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_nop_luu_tru
  verified_at: 2026-10-19T10:58:59Z
  output: |
    test-run: dropped crm_mvf56e2w9mkh_test

- eval: E2
  run_id: minted-sua-sau-chay-that-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_doc_cho
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-sua-sau-chay-that-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_doc_cho
  verified_at: 2026-10-19T10:58:59Z
  output: |
    Ran 6 tests across 1 file. [514.00ms]

- eval: E4
  run_id: minted-sua-sau-chay-that-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_quay_lai
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-sua-sau-chay-that-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_muc_luc
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-sua-sau-chay-that-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_lien_ket
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-sua-sau-chay-that-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_chon_loi
  verified_at: 2026-10-19T10:58:59Z
  output: |
    Ran 5 tests across 1 file. [940.00ms]

- eval: E8
  run_id: minted-sua-sau-chay-that-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_tim_nhanh
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-sua-sau-chay-that-E9-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.test.ssct_hoi_en
  verified_at: 2026-10-19T10:58:59Z
  output: |
    bun test v1.3.12 (700fc117)

    test/ssct-hoi-en.dom.tsx:
    165 | 		expect([
    166 | 			m.tuChoi,
    167 | 			m.loi["loi-model"],
    168 | 			m.loi["qua-han"],
    169 | 			m.loi["het-tran"],
    170 | 		]).toEqual([
               ^
    error: expect(received).toEqual(expected)

    @@ -4,3 +4,3 @@
       "Chưa trả lời được lúc này.",
    -   "Kara tạm dừng vì hết hạn mức tháng.",
    +   "Trợ lý AI tạm dừng vì hết hạn mức tháng.",
     ]

    - Expected  - 1
    + Received  + 1

    at <anonymous> (apps/app/test/ssct-hoi-en.dom.tsx:170:6)
    (fail) ssct-hoi-en > ssct-hoi-en: bản vi trùng từng chữ câu cũ [0.62ms]

     8 pass
     1 fail
     14 expect() calls
    Ran 9 tests across 1 file. [803.00ms]

- eval: E9b
  run_id: minted-sua-sau-chay-that-E9b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_hoi_ma
  verified_at: 2026-10-19T10:58:59Z
  output: |
    test-run: dropped crm_mvf56e3mq2pj_test

- eval: E10
  run_id: minted-sua-sau-chay-that-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_bang_doi_cot
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-sua-sau-chay-that-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_duyet_may_cu
  verified_at: 2026-10-19T10:58:59Z
  output: |
    Ran 2 tests across 1 file. [687.00ms]

- eval: E12
  run_id: minted-sua-sau-chay-that-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_loai_tep
  verified_at: 2026-10-19T10:58:59Z
  output: |
    Ran 4 tests across 1 file. [756.00ms]

- eval: E13
  run_id: minted-sua-sau-chay-that-E13-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.ssct_so_bo_mau
  verified_at: 2026-10-19T10:58:59Z
  output: |
    tep tro ly doi sau lan do: apps/agent/agent/channels/crm.ts
    tep tro ly doi sau lan do: apps/agent/agent/hooks/lien-ket-hoi.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/brand-mapping.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/brand.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/builder-input.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/context-config.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/context-dev.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/ma-lech.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/model.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/nhac-ke-hoach.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/okr/chon-mo-hinh.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/okr/config.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/okr/mo-hinh-thu.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/okr/mo-hinh.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/okr/nop-de-xuat.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/run-runtime.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/tai-lieu-config.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/tai-lieu-hoi-phien.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/tai-lieu-lien-ket.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/tai-lieu-phien.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/thong-bao-doi-chieu.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/thong-bao-don.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/thong-bao-ghi.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/thong-bao-tac-nhan.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/tin-nhac.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/tra-loi-nhac.ts
    tep tro ly doi sau lan do: apps/agent/agent/lib/zalo-hoi.ts
    tep tro ly doi sau lan do: apps/agent/agent/schedules/dispatch.ts
    tep tro ly doi sau lan do: apps/agent/agent/subagents/agent_runner/instructions.md
    tep tro ly doi sau lan do: apps/agent/agent/subagents/agent_runner/tools/create_crm_activity.ts
    tep tro ly doi sau lan do: apps/agent/agent/subagents/tro_ly_kho/instructions.ts
    tep tro ly doi sau lan do: apps/agent/agent/subagents/tro_ly_okr/agent.ts
    tep tro ly doi sau lan do: apps/agent/agent/subagents/tro_ly_okr/instructions.md
    tep tro ly doi sau lan do: apps/agent/agent/tools/enrich_company.ts
    chieu do mot cau dat thanh sai: dat (ma 1, mong 1; ghim m01)
    chieu do mot cau thanh loi model, trong tran: dat (ma 0, mong 0; ghim m01)
    chieu do ba cau dat thanh loi model, qua tran: dat (ma 1, mong 1; ghim m01, m02, m03)
    chieu do luot hai mot cau dat thanh khong chuyen: dat (ma 1, mong 1; ghim m01)
    chieu do luot hai mot cau thanh loi model, qua tran: dat (ma 1, mong 1; ghim m01)
    chieu do mot byte tep tro ly doi: dat (ma 1, mong 1; ghim apps/agent/agent/subagents/tro_ly_kho/agent.ts)

- eval: E14
  run_id: e14-ssct-20261019
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_man
  verified_at: 2026-10-19T10:58:59Z
  screenshot: evidence/E14-step1.png
  observed: |
    Đã mở từng khung bằng Read (lượt chạy có KHO_TAI_LIEU_BLOB_TOKEN giả).
    Step1 (E14-step1.png, 1440): màn đọc trang «Quy định hoa hồng đối tác». Hàng nút có huy hiệu «Có 1 bản chờ duyệt», huy hiệu riêng «Có đề xuất lưu trữ chờ duyệt», nút «Sửa trang», «Lịch sử», «Đặt hạn xác minh» và nút «Xem bản chờ duyệt». Khớp Expected: số bản chờ là 1, đề xuất lưu trữ không bị đếm vào. Harness xác nhận href nút trỏ tới /tai-lieu/de-xuat/<id đề xuất sửa nội dung>.
    Step2 (E14-step2.png): trang «Chính sách lương thưởng». Mục lục «Trên trang này» có đúng hai mục «Lương & thưởng» và «A < B»; thân bài có hai tiêu đề h2 cùng tên. Khớp Expected. Harness bấm «A < B» rồi kiểm hash trỏ đúng id tiêu đề «A < B».
    Step3 (E14-step3.png): màn duyệt đề xuất của «Bảng hoa hồng theo tầng». Hiện hai bảng riêng. Bảng trên (2 cột Tầng, Tỉ lệ) gạch đỏ toàn bộ, bảng dưới (3 cột Tầng, Tỉ lệ, Hạn) tô xanh toàn bộ; có nút «Duyệt» và «Trả lại». Khớp Expected.
    Step4 (E14-step4.png): màn «Sửa trang», hộp liên kết mở với «http://a.vn», viền đỏ, dòng đỏ «Chỉ nhận liên kết https». Nội dung ô soạn không có liên kết mới. Khớp Expected.
    Step5 (E14-step5.png): hộp «Tải nguồn lên», vùng thả viền đỏ, dòng đỏ «Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB.». Khớp Expected (nêu cả Word và PDF).
    Ghi chú: khung step5 của lượt chạy lệnh nguyên bản (không token, tệp ktl-loi-buoc-5.png) cho thấy trang Tài liệu có dòng «Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình» và nút «Tải nguồn lên» bị khoá.
  network_observed: n-a (driver)
  output: |
    Network: E14-network.txt ghi "n-a (driver)". Driver là puppeteer của rang, không có read_network_requests hay read_console_messages.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-19T10:58:59Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 1
  verified_at: 2026-10-19T10:58:59Z
  output: |
    app:test: 1 tests failed:
    app:test: (fail) kmt-luat > kho chu: moi gia tri vi va en goi AI dung mot ten [7.17ms]
    app:test:  896 pass
    app:test:  1 fail
    app:test: Ran 897 tests across 90 files. [7.85s]
    Failed:    app#test

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-19T10:58:59Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-19T10:58:59Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-19T10:58:59Z

- cmd: bun run lint:slop
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-19T10:58:59Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-19T10:58:59Z

Lệnh đỏ không gắn eval: `bun run test -- --filter=app --filter=@crm/ui`. Một ca đỏ duy nhất là `kmt-luat > kho chu: moi gia tri vi va en goi AI dung mot ten` (luật «AI một tên» của onehub); 896 ca còn lại xanh. Chi tiết ở `review-findings.md`.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1). Baseline khong do: mọi eval ghi `baseline: n-a`.

Eval không-phân-biệt (xanh ở cả HEAD lẫn baseline): không có.

Nguyên nhân hai eval đỏ, theo đúng đầu ra đã lưu:
- E9: bài `ssct-hoi-en` đòi bản tiếng Việt của câu «het-tran» trong messages trùng từng chữ với câu cũ của `cauLoiHoi`. Nguồn đã đổi sang «Kara tạm dừng vì hết hạn mức tháng.» (sau gộp onehub), còn messages vẫn giữ «Trợ lý AI tạm dừng vì hết hạn mức tháng.». Tám ca còn lại của bài xanh.
- E13: `so-bo-mau.ts` liệt kê 33 tệp trợ lý đã đổi sau lần đo (băm mã trợ lý không còn khớp băm ghi trong evidence). Sáu chiều đỏ của chính nó đều đạt. Cần đo lại bộ mẫu bằng `do-bo-mau.ts --do` trên HEAD rồi chạy lại E13.

Về E14: lệnh `ssct_man` trong `_acceptance/config.yaml` thiếu khoá `KHO_TAI_LIEU_BLOB_TOKEN` giả. Chạy nguyên văn thì bước 5 đỏ như lượt 1. Kết quả xanh của E14 chỉ đúng khi có khoá giả. Nên sửa config và ghi điều kiện này vào steps của E14 (việc của người viết eval).

Không có mục judgment nào ở round này (không eval nào thuộc executor judgment, không có panel).

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, không eval nào có runs lớn hơn 1).

## Iterations

Round 1: S4 round 1 xanh; một mục trong hợp đồng về thước E13 (chỉ chặn lùi và đếm lỗi model ở lượt 1, chiều đỏ chỉ đột biến lượt 1). Đã sửa ở 166840e3c: bộ so E13 chặn cả hai lượt của bộ câu mẫu.
Round 2: không eval nào đỏ (E13 và E14 chạy lại xanh, E1 đến E12 mang từ round 1) nhưng lệnh suite `bun run test -- --filter=api` đỏ ở một bài (`l3-canh`), không gắn eval nào. Verdict REJECT, trả về triển khai để điều tra bài đó (nguyên nhân chưa rõ).
Round 3: chạy lại ở 3678528430a6f7672a9a0e1e1f69e3530842ff97 (commit 367852843 ghi ca api chập chờn ngoài nhánh). E13 và E14 xanh, E1 đến E12 mang từ round 1, cả bảy lệnh suite xanh gồm cả `bun run test -- --filter=api`. Nguyên nhân chỗ đỏ ở round 2: chưa rõ, không có dòng lỗi nguyên văn đã lưu. Verdict PASS.
Round 4: chạy lại ở 593ecaca453c8d89a56627bdda0ec7d932ce3f3f sau khi gộp onehub (d479d1c6b). E9 đỏ (câu «het-tran» bản tiếng Việt lệch nguồn sau khi onehub đổi tên thành Kara), E13 đỏ (33 tệp trợ lý đổi sau lần đo), và lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở ca `kmt-luat` (luật «AI một tên»). E2, E4, E5, E6, E8, E10 mang từ round 1. Verdict REJECT, trả về triển khai.
