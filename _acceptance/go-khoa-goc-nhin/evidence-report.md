---
schema_version: 2
feature_slug: go-khoa-goc-nhin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6d01a2b462872b15d5ae560439fe5a54b2fcf64b
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
  run_id: mtpnuwup3fp3
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:20:46Z
  output: |
    test-run: crm_mtpnuwup3fp3_test is this run's database (TEST_RUN_ID=mtpnuwup3fp3)
    bun test v1.3.12 (700fc117)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [955.00ms]
    test-run: dropped crm_mtpnuwup3fp3_test

- eval: E2
  run_id: mtpnuwup3fp3
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:20:46Z
  output: |
    test-run: crm_mtpnuwup3fp3_test is this run's database (TEST_RUN_ID=mtpnuwup3fp3)
    bun test v1.3.12 (700fc117)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [955.00ms]
    test-run: dropped crm_mtpnuwup3fp3_test

- eval: E3
  run_id: mtpnuwup3fp3
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:20:46Z
  output: |
    test-run: crm_mtpnuwup3fp3_test is this run's database (TEST_RUN_ID=mtpnuwup3fp3)
    bun test v1.3.12 (700fc117)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [955.00ms]
    test-run: dropped crm_mtpnuwup3fp3_test

- eval: E4
  run_id: mtpnuwup3fp3
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:20:46Z
  output: |
    test-run: crm_mtpnuwup3fp3_test is this run's database (TEST_RUN_ID=mtpnuwup3fp3)
    bun test v1.3.12 (700fc117)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [955.00ms]
    test-run: dropped crm_mtpnuwup3fp3_test

- eval: E5
  run_id: mtpnuwup3fp3
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:20:46Z
  output: |
    test-run: crm_mtpnuwup3fp3_test is this run's database (TEST_RUN_ID=mtpnuwup3fp3)
    bun test v1.3.12 (700fc117)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [955.00ms]
    test-run: dropped crm_mtpnuwup3fp3_test

- eval: E6
  run_id: mtpnuwup3fp3
  exit_code: 0
  verifier: config:executors.test.go_khoa_api
  verified_at: 2026-09-06T10:20:46Z
  output: |
    test-run: crm_mtpnuwup3fp3_test is this run's database (TEST_RUN_ID=mtpnuwup3fp3)
    bun test v1.3.12 (700fc117)
     23 pass
     0 fail
     74 expect() calls
    Ran 23 tests across 2 files. [955.00ms]
    test-run: dropped crm_mtpnuwup3fp3_test

- eval: E7
  run_id: mtpnvhcr8qai
  exit_code: 0
  verifier: config:executors.test.go_khoa_app
  verified_at: 2026-09-06T10:20:58Z
  output: |
    test-run: crm_mtpnvhcr8qai_test is this run's database (TEST_RUN_ID=mtpnvhcr8qai)
    bun test v1.3.12 (700fc117)
     38 pass
     0 fail
     234 expect() calls
    Ran 38 tests across 2 files. [337.00ms]
    test-run: dropped crm_mtpnvhcr8qai_test

### Bài chứng cho từng eval

Một lệnh API chạy một lượt cho E1..E6. Lượt đó chạy 23 bài, không bài nào đỏ:
11 bài của `apps/api/test/saved-views-in-use.spec.ts` và 12 bài của
`apps/api/test/campaigns.spec.ts`. Mỗi eval đối chiếu với nhóm bài của riêng nó:

- E1 — `AC-1 · góc nhìn đang dùng mang tên chiến dịch` (2 bài, dòng 124 và 133).
  Bài đầu khẳng định danh sách góc nhìn nói chiến dịch nào đang dùng nó; bài sau
  khẳng định hai chiến dịch cùng dùng một góc nhìn thì kể cả hai.
- E2 — `AC-2 · góc nhìn rảnh thì danh sách rỗng` (2 bài, dòng 148 và 155). Khẳng
  định `usedBy` rỗng khi chưa ai dùng, và rỗng khi chiến dịch dùng góc nhìn khác.
- E3 — `AC-3 · từ chối xoá nêu đúng lối thoát` (2 bài, dòng 165 và 177). Bài đầu
  khẳng định chiến dịch ĐÃ KẾT THÚC vẫn chặn xoá và câu từ chối nêu tên nó; bài
  sau khẳng định câu từ chối KHÔNG bảo người dùng đi kết thúc chiến dịch.
- E4 — `AC-4 · trỏ sang góc nhìn khác` (2 bài, dòng 191 và 222). Bài đầu khẳng
  định phân khúc đổi và thành viên tính lại theo bộ lọc mới; bài sau khẳng định
  góc nhìn cũ thành rảnh và góc nhìn mới thành đang dùng.
- E5 — `AC-5 · trỏ đi rồi thì xoá được` (1 bài, dòng 236). Khẳng định ngõ cụt đã
  mở: xoá được góc nhìn cũ sau khi trỏ chiến dịch đi.
- E6 — `AC-6 · trỏ sang chỗ không hợp lệ thì từ chối` (2 bài, dòng 248 và 260).
  Góc nhìn của thực thể khác cá nhân bị từ chối; mã góc nhìn không tồn tại bị từ
  chối. Mỗi bài khẳng định phân khúc giữ nguyên.
- E7 — lệnh app chạy riêng, 38 bài, không bài nào đỏ:
  `apps/app/test/saved-views-in-use.spec.ts` (8 bài) khẳng định `viewRemoval`
  trả `removable` khi `usedBy` rỗng và `in-use` kèm đủ tên chiến dịch khi không
  rỗng; khẳng định câu tiếng Việt `views.inUse` mang tên chiến dịch, mang dấu
  tiếng Việt, và khác câu tiếng Anh; khẳng định trong `saved-views-menu.tsx` nút
  xoá nằm trong nhánh `removal.kind === "removable"` còn câu đang-dùng nằm ở
  nhánh kia. `apps/app/test/messages-guard.spec.ts` là chặn dấu tiếng Việt của
  kho chuỗi.

### Đọc mã menu để kiểm lời khai của AC-7 (đây là điểm đổi của vòng 2)

Vòng 2 chạy vì `apps/app/components/data-table/saved-views-menu.tsx` đổi cấu
trúc ở commit `5bb506c`: tên góc nhìn giữ chỗ, lý do đang-dùng xuống dòng dưới.
Đọc nhánh đang-dùng ở HEAD (dòng 216-227), chép nguyên văn:

```tsx
	return (
		<DropdownMenuItem
			className="min-w-0 flex-col items-start gap-0.5"
			onSelect={onApply}
		>
			<span className="w-full truncate">{view.name}</span>
			<span className="w-full truncate text-muted-foreground text-xs">
				{m.views.inUse(removal.usedBy.join(", "))}
			</span>
		</DropdownMenuItem>
	);
```

Ba điều AC-7 đòi đều có mặt trong đúng khối này:

1. **Tên góc nhìn hiện** — `{view.name}` dựng ở dòng đầu của mục. Đây đúng là
   thứ vòng 2 sửa: trước đó tên bị câu đang-dùng thay chỗ.
2. **Dòng lý do tiếng Việt nêu tên chiến dịch** — `m.views.inUse(...)` dựng ở
   dòng thứ hai, nhận `removal.usedBy.join(", ")`. Bản tiếng Việt ở
   `apps/app/lib/messages/crm.ts:587` là `Đang là phân khúc của ${names}`.
3. **Không có nút xoá** — khối này chỉ có một `DropdownMenuItem` mang
   `onSelect={onApply}`. Không có `onSelect={onDelete}`, không có `Close`, không
   có `m.views.remove`. Cả ba thứ đó chỉ nằm ở nhánh `removable` phía trên
   (dòng 200-215).

### Đọc mã máy chủ để kiểm lời khai (ngoài mã thoát)

- `apps/api/src/saved-views/saved-views.service.ts:107` — câu từ chối ở HEAD,
  chép nguyên văn:
  `This view is the segment of ${used.join(", ")}. Point those campaigns at another view first; the view stays as long as one of them uses it.`
  Câu này không có chữ `Finish`, và lối thoát nó nêu là lối có thật.
- `apps/api/src/saved-views/saved-views.service.ts:44` — danh sách góc nhìn hỏi
  `campaigns.usedByViews(...)` rồi gắn `usedBy` vào từng hàng (dòng 142, 152).
- `apps/api/src/campaigns/campaigns.service.ts:341` — `repoint` tồn tại và ghi
  nhật ký `Campaign segment repointed` (dòng 368). Nhật ký của lượt chạy có ba
  dòng `Campaign segment repointed`, khớp với các bài E4 và E5.

### Cơ sở dữ liệu của lượt chạy

Bộ chạy `bun run test` đúc một cơ sở dữ liệu riêng cho mỗi lượt rồi xoá ở cuối.
Cả hai lượt của vòng 2 đều báo đúc và báo xoá:

- Lệnh API: đúc `crm_mtpnuwup3fp3_test`, báo `dropped crm_mtpnuwup3fp3_test`.
- Lệnh app: đúc `crm_mtpnvhcr8qai_test`, báo `dropped crm_mtpnvhcr8qai_test`.

## Known limits

## Ngoài hợp đồng

## Analyst

Vòng này không chạy đối chứng baseline trên cây diffBase, nên các khối eval
không mang trường `baseline` và không đo được eval nào xanh-cả-hai. Đọc mã bài
thay cho phép đo đó: mỗi bài của E1..E6 khẳng định trực tiếp thứ bản sửa mới
thêm — trường `usedBy` trong danh sách góc nhìn, chữ trong câu từ chối, và thủ
tục `repoint` — nên không bài nào chạy được trên cây trước bản sửa. Bài của E7
đọc thẳng mã nguồn menu, nên nó gắn với cấu trúc menu ở HEAD.

## Variance

none — không eval nào khai `runs` > 1.

## Iterations

Round 1 (commit 65f5e32): bảy eval xanh — không quay lại bước dựng. Bằng chứng
sau đó cũ đi vì mã menu đổi ở commit 5bb506c.
Round 2 (commit 5bb506c): chạy lại đúng hai lệnh đó ở HEAD mới; bảy eval xanh.
Đọc lại mã menu xác nhận nhánh đang-dùng dựng cả tên góc nhìn lẫn dòng lý do
tiếng Việt, và không dựng nút xoá.

### Re-pin lần 1 — 2026-09-12, do ghim lại sau khi gộp onehub 193 commit — .githooks + workflow acceptance đổi sau verify; engine kit 2.11.0
run_id: repin-20260912T031450Z-30729
sha: cfc9e4a17fb05f456291afb5e0d73f50479669ff · suites: 4 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-10-06, do paths thư mục trần thành thư-mục/** trước khi bật hoá cũ theo paths
run_id: repin-20261006T035956Z-62627
sha: 6d01a2b462872b15d5ae560439fe5a54b2fcf64b · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng
