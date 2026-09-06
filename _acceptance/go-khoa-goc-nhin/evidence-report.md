---
schema_version: 2
feature_slug: go-khoa-goc-nhin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 65f5e32c8da18ae2b420eee294a8277a9d9ec83f
human_signoff:
---

# Evidence Report: go-khoa-goc-nhin

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: mtpnjbjzeb9h
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:12:08Z
  output: |
    test-run: crm_mtpnjbjzeb9h_test is this run's database (TEST_RUN_ID=mtpnjbjzeb9h)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [824.00ms]
    test-run: dropped crm_mtpnjbjzeb9h_test

- eval: E2
  run_id: mtpnjbjzeb9h
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:12:08Z
  output: |
    test-run: crm_mtpnjbjzeb9h_test is this run's database (TEST_RUN_ID=mtpnjbjzeb9h)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [824.00ms]
    test-run: dropped crm_mtpnjbjzeb9h_test

- eval: E3
  run_id: mtpnjbjzeb9h
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:12:08Z
  output: |
    test-run: crm_mtpnjbjzeb9h_test is this run's database (TEST_RUN_ID=mtpnjbjzeb9h)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [824.00ms]
    test-run: dropped crm_mtpnjbjzeb9h_test

- eval: E4
  run_id: mtpnjbjzeb9h
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:12:08Z
  output: |
    test-run: crm_mtpnjbjzeb9h_test is this run's database (TEST_RUN_ID=mtpnjbjzeb9h)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [824.00ms]
    test-run: dropped crm_mtpnjbjzeb9h_test

- eval: E5
  run_id: mtpnjbjzeb9h
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:12:08Z
  output: |
    test-run: crm_mtpnjbjzeb9h_test is this run's database (TEST_RUN_ID=mtpnjbjzeb9h)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [824.00ms]
    test-run: dropped crm_mtpnjbjzeb9h_test

- eval: E6
  run_id: mtpnjbjzeb9h
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:12:08Z
  output: |
    test-run: crm_mtpnjbjzeb9h_test is this run's database (TEST_RUN_ID=mtpnjbjzeb9h)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [824.00ms]
    test-run: dropped crm_mtpnjbjzeb9h_test

- eval: E7
  run_id: mtpnkeks8lem
  exit_code: 0
  verifier: config:executors.test.go_khoa_app
  verified_at: 2026-09-06T10:12:21Z
  output: |
    test-run: crm_mtpnkeks8lem_test is this run's database (TEST_RUN_ID=mtpnkeks8lem)
    bun test v1.3.12 (700fc117)
     38 pass
     0 fail
     234 expect() calls
    Ran 38 tests across 2 files. [330.00ms]
    test-run: dropped crm_mtpnkeks8lem_test

### Bài chứng cho từng eval

Một lệnh API chạy một lượt cho E1..E6 (23 bài, không bài nào đỏ). Mỗi eval đối
chiếu với bài của riêng nó trong `apps/api/test/saved-views-in-use.spec.ts`:

- E1 — `AC-1 · góc nhìn đang dùng mang tên chiến dịch` (2 bài). Bài đầu khẳng
  định `usedBy` của góc nhìn bằng đúng tên chiến dịch; bài sau khẳng định hai
  chiến dịch thì kể cả hai theo thứ tự tên.
- E2 — `AC-2 · góc nhìn rảnh thì danh sách rỗng` (2 bài). Khẳng định `usedBy`
  bằng mảng rỗng khi chưa ai dùng, và khi chiến dịch dùng góc nhìn khác.
- E3 — `AC-3 · từ chối xoá nêu đúng lối thoát` (2 bài). Chiến dịch được `start`
  rồi `finish` trước khi gọi xoá; bài đầu khẳng định câu từ chối chứa tên chiến
  dịch và chứa `Point those campaigns at another view`; bài sau khẳng định câu
  đó KHÔNG chứa `Finish` và không chứa `finish`.
- E4 — `AC-4 · trỏ sang góc nhìn khác` (2 bài). Bài đầu đo danh sách thành viên
  trước và sau `repoint`: trước là một liên hệ, sau là hai — thành viên tính
  lại theo bộ lọc mới; và `savedViewId` cùng `segmentName` đổi sang góc nhìn
  mới. Bài sau khẳng định góc nhìn cũ thành rảnh, góc nhìn mới thành đang dùng.
- E5 — `AC-5 · trỏ đi rồi thì xoá được` (1 bài). Sau `repoint`, `delete` trả về
  mã góc nhìn cũ và `savedView.count` cho góc nhìn đó bằng không.
- E6 — `AC-6 · trỏ sang chỗ không hợp lệ thì từ chối` (2 bài). Góc nhìn thực
  thể `DEAL` bị từ chối với `must be a contact view`; mã không tồn tại bị từ
  chối với `No saved view with id`. Mỗi bài đọc lại chiến dịch và khẳng định
  `savedViewId` vẫn là góc nhìn cũ.
- E7 — lệnh app chạy riêng (38 bài, không bài nào đỏ):
  `apps/app/test/saved-views-in-use.spec.ts` (8 bài) khẳng định `viewRemoval`
  trả `removable` khi `usedBy` rỗng và `in-use` kèm đủ tên chiến dịch khi không
  rỗng; khẳng định câu tiếng Việt `views.inUse` mang tên chiến dịch, mang dấu
  tiếng Việt, và khác câu tiếng Anh; khẳng định trong
  `saved-views-menu.tsx` nút xoá nằm trong nhánh `removal.kind === "removable"`
  còn câu đang-dùng nằm ở nhánh kia. `apps/app/test/messages-guard.spec.ts`
  (30 bài) là chặn dấu tiếng Việt của kho chuỗi.

### Đọc mã để kiểm lời khai (ngoài mã thoát)

- `apps/api/src/saved-views/saved-views.service.ts:106-108` — câu từ chối hiện
  tại, chép nguyên văn:
  `This view is the segment of ${used.join(", ")}. Point those campaigns at another view first; the view stays as long as one of them uses it.`
  Câu này không có chữ `Finish`, và lối thoát nó nêu (trỏ chiến dịch sang góc
  nhìn khác) là lối có thật.
- `apps/api/src/campaigns/campaigns.service.ts:341-372` — `repoint` tồn tại.
  Nó đọc góc nhìn đích trước khi ghi: không tìm thấy thì ném
  `NotFoundException`, thực thể khác `CONTACT` thì ném `BadRequestException`.
  Cả hai nhánh ném trước `campaign.update`, nên phân khúc cũ giữ nguyên.
- `apps/app/components/data-table/saved-views-menu.tsx:199-216` — menu gọi
  `viewRemoval(view)` rồi chỉ dựng mục xoá ở nhánh `removable`; nhánh kia dựng
  `m.views.inUse(...)`.
- `apps/app/lib/messages/crm.ts:587` — bản tiếng Việt:
  `Đang là phân khúc của ${names}`.

### Cơ sở dữ liệu của lượt chạy

Bộ chạy `bun run test` đúc một cơ sở dữ liệu riêng cho mỗi lượt rồi xoá ở cuối:

- Lệnh API: đúc `crm_mtpnjbjzeb9h_test`, báo `dropped crm_mtpnjbjzeb9h_test`.
- Lệnh app: đúc `crm_mtpnkeks8lem_test`, báo `dropped crm_mtpnkeks8lem_test`.

## Known limits

## Ngoài hợp đồng

## Analyst

Vòng này không chạy đối chứng baseline trên cây diffBase, nên các khối eval
không mang trường `baseline` và không đo được eval nào xanh-cả-hai. Đọc mã bài
thay cho phép đo đó: mỗi bài của E1..E6 khẳng định trực tiếp thứ bản sửa mới
thêm — trường `usedBy` trong danh sách góc nhìn, chữ trong câu từ chối, và thủ
tục `repoint` — nên không bài nào chạy được trên cây trước bản sửa.

## Variance

none — không eval nào khai `runs` > 1.

## Iterations

Round 1: bảy eval xanh ngay vòng đầu — không quay lại bước dựng.
