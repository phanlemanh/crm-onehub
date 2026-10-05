---
schema_version: 2
feature_slug: tiep-thi-tuyen-doi-tac
verdict: PASS
failed_evals: []
reason: |
  Vòng 4 — chấm lại vì bản sửa `go-khoa-goc-nhin` chạm mã mà hồ sơ này phủ
  (chiến dịch, góc nhìn đã lưu, hai kho chuỗi, và trang chi tiết chiến dịch nay
  có ô đổi phân khúc). Mốc ghim cũ `d8240a5` lệch cây, nên bằng chứng phải chạy lại.

  Chạy làm HAI LƯỢT TÁCH RỜI, theo đường (a) người chọn từ vòng 3.
  Lượt máy: 4 bộ kiểm + 16 phép đo, tất cả exit 0.
  Lượt lái trình duyệt: 7 phép đo, tất cả exit 0.

  HAI PHÉP ĐO MANG SANG, không chạy lại: E18 (lượt cào THẬT lên nhatot) và E19
  (mục phán xét đọc đúng đầu ra của E18). Căn cứ đo được, phiên chấm tự kiểm:
  `git diff d8240a5 HEAD -- tools/listing-crawl` trả về RỖNG — không tệp nào của
  bộ cào nằm trong diff, nên không gì trong bản sửa đổi được kết quả của chúng.
  Không cào lại 50 hồ sơ người thật chỉ vì mã giao diện đổi. Dòng phán xét của
  người ở E19 giữ NGUYÊN VĂN từ vòng 3.

  Phán quyết PASS chứ không phải PENDING-JUDGMENT: hồ sơ hạng T3 đòi mọi mục
  phán xét có chữ người, và E19 đã có — nó được mang sang cùng chữ ký đó, không
  bị chấm lại.
verified_by: fresh-context verification subagents (hai làn)
enforcement_mode: strict
bypass_used: false
verified_commit: df01345e0af096a5310ed5f99d5a3b580ae3d234
human_signoff: Mạnh 2026-09-06 — ký lại trên bằng chứng vòng 4 sau khi bản sửa `go-khoa-goc-nhin` làm mốc cũ lệch cây. Mười mục ngoài hợp đồng ghi vào giới hạn đã biết; phạm vi đã cắt giữ nguyên; phê toàn bộ quyết định ghi sau Cổng 1. Chấm E19 và các định đoạt ngày 05/09 giữ nguyên hiệu lực, không làm lại.
---

# Evidence Report: tiep-thi-tuyen-doi-tac — vòng 4

| Lượt | Phép đo | Bộ kiểm | Phán quyết |
|---|---|---|---|
| Máy | 16 chạy + 2 mang sang | 4 | PASS |
| Lái trình duyệt | 7 | 0 | PASS |

Cả hai lượt chạy ở `7a1e18d`. Bốn lệnh chứng minh của kho đều xanh:
`bun run test` · `check-types --force` · `lint --force` · `lint:slop`.
Bộ kiểm nay chạy trên cơ sở dữ liệu riêng của từng lượt (`crm_<id>_test`), nên
hai làn không còn giẫm lên nhau như ba vòng trước.

**Chữ ký người ở vòng 3 KHÔNG tự chuyển sang vòng này.** Người ký đọc phần delta
rồi ký lại; các định đoạt ngoài hợp đồng và chấm E19 của ngày 05/09 vẫn còn
nguyên trong sổ quyết định, không phải làm lại.

## Lượt máy


# Evidence Report: tiep-thi-tuyen-doi-tac — vòng 4, làn máy

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
| E18 | AC-14 | script | PASS (mang sang vòng 3) |
| E19 | AC-14 | judgment | UNCERTAIN → Đạt (người) — mang sang vòng 3 |
| E22 | AC-13 | script | PASS |
| E24 | AC-16 | test | PASS |
| E25 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-1 · chín trường mang đúng giá trị của mục — ma trận toàn phần",
    "AC-1 · ba trường chọn mang đúng nhãn của mục",
    "AC-1 · nhãn tuỳ chọn lệch thì tiếp nhận ném lỗi gọi tên trường và nhãn"
    (apps/api/test/listing-ingest.integration.spec.ts)
     27 pass
     0 fail
     122 expect() calls
    Ran 27 tests across 5 files. [973.00ms]
    test-run: dropped crm_mtponxgxq185_test

- eval: E2
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-2 · gửi lại cùng lô thì cập nhật, không tạo trùng",
    "AC-2 · lô vắng số điện thoại thì giữ số cũ, lô có số thì đè"
     27 pass
     0 fail
     122 expect() calls
    Ran 27 tests across 5 files. [973.00ms]

- eval: E3
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: bốn bài AC-3 — 403 khoá sai · 503 khoá chưa cấu hình ·
    400 gọi tên mục và trường sai · đối chứng dương khoá đúng.
    Nhật ký cổng in đúng câu 503 đã hứa:
    [ListingsController] { message: 'LISTING_INGEST_SECRET is not set — refusing the batch.' }
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E4
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-4 · không xếp việc nghiên cứu cho người đến từ sàn"
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E5
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-5 · chín trường tồn tại với khoá cố định và tác nhân không
    điền được" (listing-ingest.integration.spec.ts), "dựng đủ chín trường, tác
    nhân không điền được" và "gọi lần hai không tạo thêm định nghĩa nào"
    (listing-fields.spec.ts). Khẳng định showOnFilter thu về đúng ba khoá:
    ["chung_chi", "hinh_thai", "san_luong"].
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E7
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-6 · thành viên bằng đúng kết quả bộ lọc của góc nhìn",
    "AC-6 · số cá nhân của góc nhìn bằng đúng số kết quả bộ lọc",
    "AC-6 · mỗi góc nhìn đếm bằng một câu count, không quét bảng"
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E8
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-7 · vòng đời ba trạng thái, đã kết thúc không bắt đầu lại".
    Nhật ký in đủ ba mốc: Campaign created → Campaign started → Campaign finished.
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E10
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-8 · một cú ghi tạo đúng một lượt gọi và đúng một hoạt động Gọi",
    "AC-8 · lượt gọi hỏng thì hoạt động cũng không ở lại — đây là chân thật của
    tính nguyên tử", "AC-8 · cá nhân không có thật thì lệnh ghi THỨ NHẤT đứt vì
    khoá ngoại — bài này KHÔNG đo tính nguyên tử". Chân sau ghim đúng ràng buộc
    đã hứa: Foreign key constraint violated on the constraint:
    `activity_contactId_fkey` [activity.create]
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E11
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-9 · nháp và đã kết thúc từ chối ghi, không để lại vết"
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E13
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-10 · số đo đếm cá nhân riêng biệt, đối chứng không tính chính
    nó" (called=2, answered=2, meetings=1, answerRate=1; đối chứng called=1,
    answered=0) và "AC-10 · chưa có chiến dịch khác thì đối chứng là null,
    không phải tỷ số 1".
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E14
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-11 · góc nhìn đang có chiến dịch thì không xoá được, thông
    điệp nêu tên" (campaigns.spec.ts) và tầng dưới "từ chối xoá góc nhìn đang
    có chiến dịch dùng, gỡ chiến dịch ra thì xoá được" (campaign-schema.spec.ts).
    Tầng dưới ghim đúng ràng buộc đã hứa: Foreign key constraint violated on the
    constraint: `campaign_savedViewId_fkey` [savedView.delete]
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E16
  run_id: minted-tiep-thi-tuyen-doi-tac-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-06T10:45:36Z
  output: |
    bun test v1.3.12 (700fc117)
     33 pass
     0 fail
     230 expect() calls
    Ran 33 tests across 2 files. [331.00ms]

- eval: E17
  run_id: minted-tiep-thi-tuyen-doi-tac-E17-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_test
  verified_at: 2026-09-06T10:45:36Z
  output: |
    test_the_mat_so_tin_thi_bao_loi_goi_ten_truong ... ok
    test_moi_mau_ra_dung_gia_tri_da_biet ... ok
    test_nhatot_chi_cong_bo_mot_con_so_cho_ca_hai_truong ... ok
    test_ban_commit_khop_ban_sinh_lai_tu_nguon ... ok
    test_bac_dung_tai_nguong ... ok
    test_sat_duoi_nguong_khong_len_bac ... ok
    ----------------------------------------------------------------------
    Ran 28 tests in 0.054s

    OK

- eval: E18
  carried: round-3
  run_id: minted-tiep-thi-tuyen-doi-tac-E18-r3
  status: not-run
  not_run_note: khai không-chạy từ 04/10 theo dòng sổ d-20261004T123430Z-65 (chủ kho duyệt gói B); lúc ký lượt cào thật vòng 3 (05/09) thoát mã không
  baseline: red
  verifier: config:executors.script.tt_crawl_live
  verified_at: 2026-09-05T04:10:00Z
  carry_justification: |
    `git diff d8240a5f90b1a9790f404f4bf62ab90c45af94a1 HEAD -- tools/listing-crawl`
    trả về RỖNG — 0 tệp đổi (đã tự chạy và kiểm chứng ở vòng 4). E18 là lượt
    cào thật trên tools/listing-crawl; không gì trong diff chạm được kết quả
    của nó. Không cào lại, không dựng bằng chứng mới.
  output: |
    2026-09-05 08:21:34,926 WARNING 49/49 hồ sơ có tổng tin bằng tin mới 30 ngày — sàn chỉ công bố một con số
    2026-09-05 08:21:34,929 INFO đã ghi 1 lô ra đĩa trước khi gửi (49 mục): ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json
    2026-09-05 08:21:34,931 INFO chạy khô: 1 lô nằm trên đĩa, không gửi lô nào

- eval: E19
  carried: round-3
  judged_by: panel — domain-correctness, operational-feasibility, spec-alignment (fresh context)
  verdict: UNCERTAIN
  carry_justification: |
    E19 chỉ đọc đầu ra của E18 (live-batch.json, live-run.log). Diff
    `d8240a5..HEAD -- tools/listing-crawl` rỗng, nên đầu vào của phép phán xét
    không đổi. KHÔNG chấm lại ở vòng 4; giữ nguyên phán quyết và dòng người ký
    của vòng 3.
  rationale: Panel 2/3 lens UNCERTAIN, đề xuất chung UNCERTAIN — hai ngưỡng phân loại sản lượng "Trung"=20 và "Thấp"=1 chưa chạm dữ liệu thật (sàn mẫu min=37), và 49/49 số điện thoại trong live-batch.json đều cùng một giá trị placeholder "09xxxxxxxx" nên chưa xác nhận là số thật. spec-alignment cho PASS vì đọc đúng nghĩa hẹp của AC-14 (bốn số liệu có được ghi lại, không chặn bot phá chi phí) nhưng không bác bỏ hai khoảng trống trên.
  human_override: Đạt — Mạnh, 2026-09-05. AC-14 hứa GHI LẠI đủ bốn số liệu để người quyết có mở chiến dịch đầu hay không, và bốn số liệu đó đều có. Sàn không chặn tới mức làm hỏng nhịp hàng tháng: 49/50 hồ sơ lấy được, chỉ 1 trong 5 lượt có cảnh báo chặn bot thật. Nghi ngờ «49 số điện thoại giống hệt nhau nên chưa rõ là số thật» đã được bác bằng phép đo, đúng thứ required_evidence đòi: chuỗi giống nhau là do bước che danh tính thay MỌI số bằng một hằng (`redact.py`, `PHONE_STAND_IN`); bản trước khi che ở commit 982d771 có 49 mục với 49 số KHÁC NHAU, không mục nào bị che. Nghi ngờ còn lại người ký nhận nguyên: hai ngưỡng «Vừa»=20 và «Thấp»=1 chưa hồ sơ thật nào chạm tới (mẫu thấp nhất 37 tin) — đó là việc chỉnh tham số mà hợp đồng đã khai là của người trước chiến dịch đầu, không phải phép đo trượt.

- eval: E22
  run_id: mtpoq40d6a53
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_to_ingest
  verified_at: 2026-09-06T10:45:36Z
  output: |
    2026-09-06 17:44:42,378 INFO đã ghi 1 lô ra đĩa trước khi gửi (2 mục): ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/fixture-batch.json
    2026-09-06 17:44:42,378 INFO chạy khô: 1 lô nằm trên đĩa, không gửi lô nào
    [ListingIngestService] { message: 'Listing batch ingested', source: 'nhatot', items: 2, created: 2, updated: 0 }
     1 pass
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [281.00ms]
    test-run: dropped crm_mtpoq40d6a53_test

- eval: E24
  run_id: mtponxgxq185
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-06T10:45:36Z
  output: |
    Bài chạy: "AC-16 · kết thúc ghi mốc, và sau đó bắt đầu bị từ chối"
     27 pass
     0 fail
    Ran 27 tests across 5 files. [973.00ms]

- eval: E25
  run_id: minted-tiep-thi-tuyen-doi-tac-E25-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-06T10:45:36Z
  output: |
    (pass) trạng thái hai màn chiến dịch > không có dòng nào thì là rỗng, có dòng thì là danh sách
    (pass) trạng thái hai màn chiến dịch > chưa có góc nhìn cá nhân dùng chung thì hộp tạo nói thẳng
    (pass) trạng thái hai màn chiến dịch > E25 · ba trạng thái đơn vị nối đúng câu chữ màn hiện ra
     33 pass
     0 fail
    Ran 33 tests across 2 files. [331.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mtpomtp4l6xu
  exit_code: 0
  verified_at: 2026-09-06T10:45:36Z
  note: |
    Bộ chạy đúc mã lượt riêng, tự dựng và tự bỏ cơ sở dữ liệu của lượt.
    Dòng đầu: "test-run: crm_mtpomtp4l6xu_test is this run's database
    (TEST_RUN_ID=mtpomtp4l6xu)". Dòng cuối: "test-run: dropped
    crm_mtpomtp4l6xu_test" — có báo bỏ.
  output: |
     224 pass
     0 fail
     689 expect() calls
    Ran 224 tests across 22 files. [542.00ms]
    Tasks:    11 successful, 11 total
    test-run: dropped crm_mtpomtp4l6xu_test

- cmd: bunx turbo run check-types --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-check-types-r4
  exit_code: 0
  verified_at: 2026-09-06T10:45:36Z
  output: |
    api:check-types: cache bypass, force executing 2acc4746b62dbc5e
    api:check-types: $ tsc --noEmit
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total

- cmd: bunx turbo run lint --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-lint-r4
  exit_code: 0
  verified_at: 2026-09-06T10:45:36Z
  output: |
    app:lint: Checked 296 files in 105ms. No fixes applied.
    app:lint: Found 3 warnings.
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total

- cmd: bun run lint:slop
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-lint-slop-r4
  exit_code: 0
  verified_at: 2026-09-06T10:45:36Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 335ms on 850 files with 9 rules using 18 threads.

## Known limits

## Ngoài hợp đồng

Hai chỗ HỤT PHÉP ĐO tìm thấy khi đối chiếu từng dòng `expected` của evals.yaml
với các bài kiểm thật sự chạy. Cả hai CÓ TỪ TRƯỚC vòng 4 — bản sửa của vòng
này không chạm ba tệp kiểm liên quan (`git diff --stat d8240a5..HEAD` không
liệt kê `campaigns.spec.ts`, `listing-ingest.integration.spec.ts`,
`listing-fields.spec.ts`) — nên chúng KHÔNG phải hồi quy của vòng 4. Chúng
ghi ra đây để người ký Cổng 2 thấy, không phải để bắt phép đo trượt.

1. E13 khai ba bài, kho chỉ có hai. Bài «không chia cho 0» (chiến dịch chưa có
   lượt gọi nào → tỷ lệ = null) KHÔNG tồn tại. `answerRate` chỉ bị khẳng định
   đúng MỘT lần trong toàn bộ `apps/api/test/campaigns.spec.ts`, ở dòng
   `expect(stats.answerRate).toBe(1)`. Vế «chưa gọi ai thì tỷ lệ hiện —» của
   AC-10 do đó chưa có chân ở tầng máy chủ.
2. E5 khai bài «lọc được» — `contacts.list` với `fields {san_luong: [id option
   Cao]}` trả đúng tập. Bài đó KHÔNG tồn tại. Kho chỉ khẳng định
   `showOnFilter === true` cho ba khoá, tức là khai báo cờ, không phải chứng
   minh bộ lọc chạy ra đúng tập.

## Analyst

Làn này KHÔNG chạy đường nền A/B (không nằm trong việc được giao), nên mọi
phép đo máy ghi `baseline: n-a` — chưa chạy, không phải chạy mà không phân
biệt được. Đừng đọc `n-a` thành «không phân biệt được».

Ghi nhận mang sang từ vòng 3, chưa đo lại ở vòng 4: E16 và E25 (lệnh
`cd apps/app && bun test test/messages-guard.spec.ts test/campaign-states.spec.ts`)
từng xanh trên cả nhánh lẫn đường nền — người ký vòng 3 đã kết luận đó là
regression-guard có chủ ý, không cần viết lại.

## Variance

none — không eval nào trong làn này có `runs` > 1, không có phương sai để người quyết.

## Iterations

Round 4 (làn máy): 16 phép đo máy chạy lại ở HEAD `7a1e18d` sau bản sửa chạm
`apps/api/src/campaigns/*`, `apps/api/src/saved-views/*`, hai màn chiến dịch,
`apps/app/components/data-table/*` và hai kho chuỗi. Tất cả xanh; 4 lệnh suite
xanh. E18 và E19 mang sang vòng 3 vì diff không chạm `tools/listing-crawl`.
PASS.


---

## Lượt lái trình duyệt


# Evidence Report (browser lane): tiep-thi-tuyen-doi-tac — round 4

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E6 | AC-6 | ui-check | PASS |
| E9 | AC-8 | ui-check | PASS |
| E12 | AC-10 | ui-check | PASS |
| E15 | AC-12 | script | PASS |
| E20 | AC-15 | script | PASS |
| E21 | AC-15 | script | PASS |
| E23 | AC-16 | ui-check | PASS |

## Evidence

- eval: E6
  run_id: minted-tiep-thi-tuyen-doi-tac-E6-r4
  exit_code: 0
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-06T10:51:56Z
  screenshot: evidence/E6-goc-nhin.png
  output: |
    E6 THANH VIEN KHOP n=4
    luong: xong — goc nhin "Sản lượng cao ttmtpoyt08", chien dich "Chiến dịch ttmtpoyt08",
    4 thanh vien, 3 luot goi tren 2 ca nhan.
  observed: |
    E6-goc-nhin.png shows the Cá nhân screen filtered to the run nonce with exactly
    four rows, every row Sản lượng = Cao (Gò Vấp 4, Bình Thạnh 9, Quận 2 17, Quận 7 24)
    and the footer counting 4. E6-tao.png shows the Chiến dịch mới sheet with Phân khúc
    set to "Sản lượng cao ttmtpoyt08 · 4 cá nhân", matching the printed n=4.
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-tiep-thi-tuyen-doi-tac-E9-r4
  exit_code: 0
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-06T10:51:56Z
  screenshot: evidence/E9-bat-dau.png
  output: |
    E9 CALL n0=0 n1=1 nonce=Chiến dịch ttmtpoyt08
  observed: |
    E9-bat-dau.png shows the campaign header after Bắt đầu: title, badge "Đang chạy",
    the new segment dropdown "Sản lượng cao ttmtpoyt08", and the Kết thúc button, with
    Đã gọi 0 and both rates "—". E9-ghi.png shows the first row's Gần nhất turning into
    the chip "Trả lời" and Đã gọi 1. E9-dong-thoi-gian.png shows the contact sheet's
    Hoạt động tab with a single call entry "Trả lời · Chiến dịch ttmtpoyt08 — manh.phan
    · 17:51", i.e. the activity carries this run's campaign name after the reload.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-tiep-thi-tuyen-doi-tac-E12-r4
  exit_code: 0
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-06T10:51:56Z
  screenshot: evidence/E12-so-do.png
  output: |
    E12 SO DO da_goi=2 tra_loi=2 hen=1 toan_tap_da_goi=3
  observed: |
    E12-so-do.png shows two stacked bands: "Chiến dịch này" with Thành viên 4, Đã gọi 2,
    Tỷ lệ trả lời 100% (Trả lời 2), Tỷ lệ hẹn gặp 50% (Hẹn gặp 1); and "Mọi chiến dịch
    khác" with Đã gọi 3, 67%, 33%. Three outcomes on two people still read Đã gọi 2, so
    the distinct-contact count is visible on screen, and the control band sits beside the
    campaign band as the criterion promises.
  network_observed: n-a (driver)

- eval: E15
  run_id: ttmtpozhlf
  exit_code: 0
  verifier: config:executors.script.tt_ui_chu
  verified_at: 2026-09-06T10:53:11Z
  screenshot: evidence/E15-ST-chien-dich-dang-chay.png
  output: |
    E15 CHU 12ma=khai truoc 9ma=dung tren trinh duyet 3ma=do o muc don vi — E25
    trung=0 translate_no=du cau_may_chu=ghi lai o E15-chu-may-chu.txt
    -- chuoi nhin thay: vi=77 en=77 (565/585 lan)
    -- CON LAI: giong het o ca hai thu tieng, khong phai du lieu (0)
    -- DU LIEU SAN KHONG DUOC DANH DAU translate="no" (0)
  observed: |
    All nine browser frames are Vietnamese end to end: Nháp / Đang chạy / Đã kết thúc
    badges, "Chưa gọi ai nên chưa có tỷ lệ.", "Chưa có số", "Không ai khớp bộ lọc của
    góc nhìn này" with a "Mở góc nhìn" button, and "Đang tạo…" / "Đang ghi…" on the busy
    controls. E15-ST-ghi-ket-qua-loi.png shows the declared limit exactly as the contract
    words it: a Vietnamese toast title "Chưa ghi được kết quả. Dòng giữ nguyên." above
    the verbatim English server sentence, which E15-chu-may-chu.txt records in full.
  network_observed: n-a (driver)

- eval: E20
  run_id: minted-tiep-thi-tuyen-doi-tac-E20-r4
  exit_code: 0
  verifier: config:executors.script.tt_ui_thiet_ke
  verified_at: 2026-09-06T10:53:39Z
  output: |
    E20 THIET KE _acceptance/tiep-thi-tuyen-doi-tac/evidence/E20-danh-sach.html verdict=PASS
    E20 THIET KE _acceptance/tiep-thi-tuyen-doi-tac/evidence/E20-chien-dich.html verdict=PASS
  observed: |
    This eval saves rendered HTML, not PNG frames. I read both dumps: E20-chien-dich.html
    carries the changed header in text order — title, "Đang chạy", the segment picker
    (one role="combobox", aria-haspopup present), then "Kết thúc" — plus the seven member
    columns and 18 translate="no" nodes on listing data. The same screen's rendered look
    is covered visually by this round's E15 and E23 frames.

- eval: E21
  run_id: minted-tiep-thi-tuyen-doi-tac-E21-r4
  exit_code: 0
  verifier: config:executors.script.tt_ui_be_rong
  verified_at: 2026-09-06T10:53:31Z
  screenshot: evidence/E21-1024.png
  output: |
    -- 1024px  Tên / Số điện thoại / Sản lượng / Tin mới / Địa bàn / Gần nhất / Ghi kết quả — all "du"
    -- 768px   Số điện thoại, Sản lượng, Gần nhất — "cat + ba cham + tro nang"
    E21 BE RONG 1024px=khong cot nao bi cat · 768px=moi cho cat co ba cham va chu day du
  observed: |
    E21-1024.png shows the whole member table with all seven headers legible and no
    ellipsis, and the header row (title, Đang chạy, segment dropdown, Kết thúc) fitting on
    one line. E21-768.png shows the same page at 768px: the title wraps to two lines and
    the badge + dropdown + Kết thúc still sit on one row without overlap or horizontal
    overflow, but the member table is below the fold in that frame, so the 768px ellipsis
    claim rests on the harness's DOM measurement rather than on anything visible here.
  network_observed: n-a (driver)

- eval: E23
  run_id: minted-tiep-thi-tuyen-doi-tac-E23-r4
  exit_code: 0
  verifier: config:executors.script.tt_ui_trang_thai
  verified_at: 2026-09-06T10:53:22Z
  screenshot: evidence/E23-nhap.png
  output: |
    E23 TRANG THAI nhap=0nut chay=5nut ketthuc=0nut batdau=an
  observed: |
    E23-nhap.png shows the draft campaign: badge "Nháp", segment dropdown, "Bắt đầu"
    button, and a six-column member table with no Ghi kết quả column at all.
    E23-ket-thuc.png, taken after the reload, shows "Đã kết thúc" with both stamps in the
    subtitle ("Bắt đầu lúc 17:53 … · Kết thúc lúc 17:53 …"), the segment dropdown still
    present, no Bắt đầu button and no outcome buttons — the header keeps only the picker.
  network_observed: n-a (driver)

## Known limits

## Ngoài hợp đồng

## Analyst

Browser lane only. The five harness commands each exited 0 on the first attempt; none
was tool-killed and none hit its preflight refusal path.

## Iterations

Round 4: browser lane re-run after the follow-up UI fix (campaign header segment picker,
saved-views reason line). All seven browser evals pass on the re-run.

### Re-pin lần 1 — 2026-09-07, do kéo 131 commit của sáu vòng Việt hoá về nhánh
run_id: repin-sau-131-20260907T010430Z
sha: c7b02d56dbebbcf040d5578ccee8f3f195f95565 · suites: 4 lệnh exit 0

Nhánh nền nhận sáu vòng Việt hoá và vài bản vá lệnh chứng. 79 tệp mã đổi, nhưng
**không tệp nào** nằm trong vùng hồ sơ này phủ — đo từng đường: `apps/api/src/campaigns`
0, `apps/api/src/listings` 0, `apps/api/src/saved-views` 0, `packages/validation/src/listing-ingest.ts`
0, `tools/listing-crawl` 0, giao diện chiến dịch 0, `apps/app/components/data-table` 0,
kho chuỗi chiến dịch 0, và `packages/db/prisma` 0. Vì thế đây là ghim lại chứ không
phải chấm lại. Làn máy chạy trọn tại cây mới: 1401 bài kiểm, 0 trượt, 9/9 chân kiểm
chạy thật không hit đệm, cộng 28 bài của bộ cào. Chữ ký người không bị đụng.

### Re-pin lần 2 — 2026-09-07, do vòng sửa cấu hình đệm của bộ kiểm
run_id: repin-cache-config-20260907T020636Z
sha: 24c6d58660898fe9b74743243e7568feabd61ed9 · suites: 4 lệnh exit 0

Nhánh nhận vòng «thước cache hết đối tượng»: `packages/db/turbo.json` sửa và
`packages/ui/turbo.json` xoá hẳn. Hai tệp đó chỉnh chính cách đệm bộ kiểm nên
đáng chạy lại, dù không tệp nào của vòng này đổi — đo từng đường vùng hồ sơ phủ
đều 0. Làn máy tại cây mới: 1401 bài kiểm, 0 trượt, và **9/9 chân kiểm chạy
thật dù lệnh không kèm `--force`** — tức đổi cấu hình đệm không làm log bị phát
lại. `@crm/ui:test` vẫn chạy đủ 92 bài dù tệp cấu hình riêng của gói đã bị xoá.
Cộng 28 bài của bộ cào. Chữ ký người không bị đụng.

### Re-pin lần 3 — 2026-09-07, do kéo về bản có tài liệu triển khai Vercel
run_id: repin-len-vercel-20260907T110027Z
sha: f8f72ab99b4efebb09cfcf9374d612337a24879d · suites: 4 lệnh exit 0

Nhánh nhận thêm 34 commit, trong đó có tài liệu ba dự án Vercel và bảng nợ của
cổng. 14 tệp mã đổi, **0 tệp** thuộc vùng hồ sơ này phủ — đo lại tám đường có tên
trong hợp đồng, tất cả đều 0. Làn máy tại cây mới: 1413 bài kiểm, 0 trượt, 9/9
chân kiểm chạy thật không hit đệm, cộng 28 bài của bộ cào. Chữ ký người không bị
đụng.

Đây là lượt ghim lại thứ năm của hồ sơ này, và là lượt thứ tư không có tệp nào
thuộc vùng nó phủ. Chi phí đó đã ghi thành số ở chip `cong-chan-theo-ho-so-khong-theo-diff`
của kho kit.

### Re-pin lần 4 — 2026-09-17, do chiến dịch ghim lại kit 2.14.0 (PR #47): làn eval thật trên cây đã chuyển đường ghi tạo phẩm; đo bằng phanlemanh@gmail.com
run_id: repin-20260917T051527Z-61120
sha: ed70d70dd0ec9ee7412b45e63c90c925500d50c6 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng

### Re-pin lần 5 — 2026-10-05, do sửa thước đỏ lô 2-4 (g2)
run_id: repin-20261005T050537Z-69105
sha: df01345e0af096a5310ed5f99d5a3b580ae3d234 · suites: 7 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E18 · ngoài làn máy: E6, E9, E12, E19, E23 · diff chạm vật đo ngoài làn máy: E6, E9, E12, E23 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-14
